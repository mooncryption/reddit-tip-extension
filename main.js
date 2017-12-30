var version = "0.0.1beta1";
var rt_tip_word = "give tip"; // "tip" "tippr"
var rt_log = "Reddit Tip Extension by /u/mooncryption: ";
var rt_truelink = true;
var rt_ran_already = false;
var rt_autosend = true;
var tipInProgress = false;
var tipData = {};
var coreRuntime = 0; var checkRuntime = 0;
var rt_step = 0.01; var rt_amt = 0.0001; var rt_unit = "bch";

chrome.storage.sync.get({
    autotip: "true",
    word: "give tip",
    tipInProgress: false,
    tipData: {
        rtip: false,
    },
    defaultStep: 0.01,
    defaultAmt: 0.0001,
    defaultUnit: "bch"
}, function (items) {
    rt_autosend = (items.autotip == "true" || items.autotip == true);
    rt_tip_word = items.word;
    tipInProgress = items.tipInProgress;
    tipData = items.tipData;
    rt_step = items.defaultStep;
    rt_amt = items.defaultAmt;
    rt_unit = items.defaultUnit;
});

(function ($) {
    $.fn.goTo = function () {
        if ($(this) && $(this).offset() && $(this).offset.top) {
            $('html, body').animate({
                scrollTop: $(this).offset().top + 'px'
            }, 'fast');
        }
        return this; // for chaining...
    }
})(jQuery);

function rtError(message) {
    console.log("[REDDIT TIP EXTENSION] Error: ", message);
    alert(`Reddit Tip Extension had an error: \n\n ${message}`);
}

function morebutton(which) {
    chrome.storage.sync.set({
        rcompose: {
            go: true,
            id: which
        }
    }, function () {
        window.location.href = "https://www.reddit.com/message/compose/?rcompose=true";
        setTimeout(function () {
            window.location.replace("https://www.reddit.com/message/compose/?rcompose=true");
        }, 100);
    })
}

function rtLog(message) {
    return "[REDDIT TIP EXTENSION] Log: " + message;
}

function getURLParams(url) {

    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

    // we'll store the parameters here
    var obj = {};

    // if query string exists
    if (queryString) {

        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];

        // split our query string into its component parts
        var arr = queryString.split('&');

        for (var i = 0; i < arr.length; i++) {
            // separate the keys and the values
            var a = arr[i].split('=');

            // in case params look like: list[]=thing1&list[]=thing2
            var paramNum = undefined;
            var paramName = a[0].replace(/\[\d*\]/, function (v) {
                paramNum = v.slice(1, -1);
                return '';
            });

            // set parameter value (use 'true' if empty)
            var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

            // (optional) keep case consistent
            if (paramName.toLowerCase) paramName = paramName.toLowerCase();
            if (paramValue.toLowerCase) paramValue = paramValue.toLowerCase();

            // if parameter name already exists
            if (obj[paramName]) {
                // convert value to array (if still string)
                if (typeof obj[paramName] === 'string') {
                    obj[paramName] = [obj[paramName]];
                }
                // if no array index number specified...
                if (typeof paramNum === 'undefined') {
                    // put the value on the end of the array
                    obj[paramName].push(paramValue);
                }
                // if array index number specified...
                else {
                    // put the value at that index number
                    obj[paramName][paramNum] = paramValue;
                }
            }
            // if param name doesn't exist yet, set it
            else {
                if (paramValue == "true") {
                    obj[paramName] = true;
                } else if (paramValue == "false") {
                    obj[paramName] = false;
                } else if (parseFloat(paramValue) != NaN && parseFloat(paramValue) > 0) {
                    obj[paramName] = parseFloat(paramValue);
                } else {
                    obj[paramName] = paramValue;
                }
            }
        }
    }

    return obj;
}

function checkForTips() {
    /*
    checkForTips()
    -------------
    Used to check for an incoming tip in the URL
    */
    if (checkRuntime >= 15) return 0;
    console.log("Checking for tip requests...")
    checkRuntime += 1;
    var p = tipData;
    chrome.storage.sync.get({
        tipData: {
            rtip: false,
        }
    }, function (items) {
        p = items.tipData;
    })
    if (!(p.rtip && p.rtip == true && p.rcomment == false && tipInProgress == true && getURLParams(decodeURIComponent(window.location.href)).rtip && getURLParams(decodeURIComponent(window.location.href)).rtip == true)) {
        console.log("No tip request", p, getURLParams(decodeURIComponent(window.location.href)))
        return 0;
    }
    var rafter = "";
    if (p.rmessage && p.rmessage !== "" && p.rmessage !== "none") {
        rafter = `\n\n${p.rmessage}`
    }
    var c = `${p.ramount} ${p.runit} u/tippr ${rafter}`;
    if (p.runit == "gild") {
        c = `u/tippr gild ${rafter}`;
    }
    console.log("Found Tip Request!", p, c);
    if ($(".usertext.cloneable").length) {
        $(".usertext.cloneable")[0].getElementsByClassName("md")[0].children[0].value = c;
        var attachId = `replybox-${Math.floor(Math.random() * 10000000)}`;
        $("#attachId").goTo();
        $(".usertext.cloneable")[0].getElementsByClassName("save")[0].innerHTML = "confirm your tip!";
        chrome.storage.sync.set({
            tipInProgress: false,
            tipData: {
                rtip: false,
            }
        }, function () { });
        if (rt_autosend) {
            setTimeout(function () { $(".usertext.cloneable")[0].getElementsByClassName("save")[0].click(); }, 50);
        }
        window.location.href = `#${$(".usertext.cloneable")[0].id}`;
    } else {
        setTimeout(this, 100);
    }
}

function launchTip(amount, unit = "bch", postLink, postAuthor = "", isComment = false, message = "") {
    document.getElementById("rt-modal").style.display = "none";
    for (j = 0; j < document.getElementsByClassName("rt-modal-class").length; ++j) {
        document.getElementsByClassName("rt-modal-class")[j].style.display = "none";
    }

    console.log(rtLog("launchTip"), amount, unit, postLink, postAuthor, isComment)
    if (!isComment) {
        chrome.storage.sync.set({
            tipInProgress: true,
            tipData: {
                rtip: true,
                ramount: amount,
                runit: unit,
                rauthor: postAuthor,
                rcomment: isComment,
                rmessage: message
            }
        }, function () {
            // Update status to let user know options were saved.
            window.location.href = `${postLink}?${encodeURIComponent(`rtip=true`)}`;
            setTimeout(location.reload, 100);
            setTimeout(function () { window.location.href = `${postLink}?${encodeURIComponent(`rtip=true`)}`; }, 101);
        });
        return 0;
    } else {
        try {
            chrome.storage.sync.set({
                tipInProgress: true,
                tipData: {
                    rtip: true,
                    ramount: amount || 0,
                    runit: unit || 'bch',
                    rauthor: postAuthor || '',
                    rcomment: isComment || true,
                    rmessage: message || ""
                }
            }, function () {
                // Update status to let user know options were saved.
                console.log("updated localStorage");
            });
        } catch (err) {
            console.log("chrome.storage.sync.set error", err);
        }
    }
    var rafter = "";
    if (message && message !== "" && message !== "none") {
        rafter = `\n\n${message}`
    }
    var c = `${amount} ${unit} u/tippr ${rafter}`;
    if (unit == "gild") {
        c = `u/tippr gild ${rafter}`;
    }
    console.log("comment", c);
    for (i = 0; i < document.getElementsByClassName("bylink").length; i += 0) {
        if (!(document.getElementsByClassName("bylink")[i].getAttribute("data-href-url") && document.getElementsByClassName("bylink")[i].getAttribute("data-href-url") == postLink)) {
            console.log("Tried i:", i);
            i++;
            continue;
        } else {
            console.log("Found i: ", i);
        }
        var bl = document.getElementsByClassName("bylink")[i];
        console.log("bl 1", i, bl, bl.parentElement, bl.parentElement.parentElement);
        xt =  bl.parentElement.parentElement.getElementsByClassName("reply-button")[0].children[0];

        bl.parentElement.parentElement.getElementsByClassName("reply-button")[0].children[0].click(); // CLICK REPLY BTN

        console.log("bl 2", i, document.getElementsByClassName("bylink")[i], document.getElementsByClassName("bylink")[i].parentElement, document.getElementsByClassName("bylink")[i].parentElement.parentElement);
        console.log("bl 3", i, bl, bl.parentElement, bl.parentElement.parentElement);
        console.log("i xt", i, xt);
        // throw "";
        // console.log("229:bylink", document.getElementsByClassName("bylink")[i].parentElement.parentElement.parentElement.parentElement.getElementsByClassName("md")[1].children[0]);
        var yt = false, tipReady = false;
        try {
            console.log("trying regular case with BL");
            bl.parentElement.parentElement.parentElement.parentElement.getElementsByClassName("md")[1].children[0].value = c;
            bl.parentElement.parentElement.parentElement.parentElement.getElementsByClassName("save")[0].innerHTML = "confirm your tip!";
            tipReady = true;
        } catch (e1) {
            console.log("e1", e1);
            try {
                console.log("trying second case with YT");
                yt = xt.parentElement.parentElement.parentElement.parentElement.querySelector(".usertext.cloneable")
                console.log("yt", yt);
                if (!yt) {
                    throw "YT Nonexistent";
                }
                yt.getElementsByClassName("md")[0].children[0].value = c;
                yt.getElementsByClassName("save")[0].innerHTML = "confirm your tip!";
                tipReady = true;
            } catch (e2) {
                console.log("e2", e2);
            }
        }
        console.log("after climax"); ++i;
        chrome.storage.sync.set({
            tipInProgress: false,
            tipData: {
                rtip: false
            }
        }, function () {
            // Update status to let user know options were saved.
            console.log("cleared local storage");
        });
        if (rt_autosend && tipReady) {
            if (yt !== false) {
                yt.getElementsByClassName("save")[0].click();
            } else {
                bl.parentElement.parentElement.parentElement.parentElement.getElementsByClassName("save")[0].click();
            }
        }
        return 0;

    }
}

function redditTipCore() {
    if (coreRuntime >= 15) return 0;
    var buttonsList = $("ul.flat-list.buttons");
    if (buttonsList.length < 1) {
        window.setTimeout(rActivate, 200);
    }
    console.log(rt_log + "activating...");
    coreRuntime += 1;


    var modal = document.createElement("div");
    modal.classList = ["rt-modal-class"];
    modal.id = "rt-modal";
    modal.innerHTML = '<div class="rt-modal-content"><div class="rt-modal-header"><span class="rt-modal-close">&times;</span><h1>Give a Tip!</h1></div><div class="rt-modal-body"></div><hr/><div class="rt-modal-footer"><em>Made with love by <a href="https://reddit.com/u/mooncryption">/u/mooncryption</a> &middot; <a href="https://mooncryption.github.io/reddit-tip-extension">Official Website (Docs)</a> &middot; <a href="https://www.reddit.com/r/tippr/wiki/index">Powered by /u/tippr</a></em></div></div>';
    var rt_modal_maintext = document.createElement("p");
    rt_modal_maintext.innerHTML = "Use the settings below to change the tip amount, then click the button to give your tip!<br/><br/>";
    modal.getElementsByClassName("rt-modal-body")[0].appendChild(rt_modal_maintext);
    modal.setAttribute("rt-post-link", "");
    modal.setAttribute("rt-post-author", "");
    modal.setAttribute("rt-is-comment", "false");
    modal.getElementsByClassName("rt-modal-close")[0].onclick = function () {
        modal.style.display = "none";
    }

    var rt_modal_main = document.createElement("div");
    rt_modal_main.innerHTML = `Amount (required):&nbsp; <input type="number" step="${rt_step}" value="${rt_amt}" id="rte-amount" class="rte-amount-class" name="rte-amount"/> <select name="rte-unit" class="rte-unit-class" id="rte-unit"><option value="bch">BCH&nbsp;&nbsp;</option><option value="usd">USD&nbsp;&nbsp;</option><option value="bits">bits&nbsp;&nbsp;</option></select>&nbsp;&nbsp;(<span class="rt-usdv" id="rt-usdv">bitcoin cash</span>)<br/><br/> Message (optional): <input type="text" value=" " id="rte-message" class="rte-message-class"/><br/><br/>`;
    var rt_btn = document.createElement("span");
    rt_btn.innerHTML = '<button class="rte-btn" id="rte-btn"><b>Send Tip!</b></button> &nbsp;&middot;&nbsp; <button class="rte-gild" id="rte-gild">Give gold!</button> <br/><br/>';
    rt_modal_main.appendChild(rt_btn);
    modal.getElementsByClassName("rt-modal-body")[0].appendChild(rt_modal_main);
    rt_btn.children[0].onclick = function () {
        console.log(this)
        if (modal.getAttribute("rt-post-link") != "" && modal.getAttribute("rt-post-author") != "") {
            launchTip(
                this.parentElement.parentElement.getElementsByClassName("rte-amount-class")[0].value,
                this.parentElement.parentElement.getElementsByClassName("rte-unit-class")[0].value,
                modal.getAttribute("rt-post-link"),
                modal.getAttribute("rt-post-author"),
                (modal.getAttribute("rt-is-comment") == "true"),
                this.parentElement.parentElement.getElementsByClassName("rte-message-class")[0].value || ""
            )
        } else {
            rtError("We couldn't trace the post link or author.");
            console.log(modal.getAttribute("rt-post-link"), modal.getAttributeNode("rt-post-author"))
        }
    }
    rt_btn.children[1].onclick = function() {
        var confirmation = window.confirm(`Giving Gold to (or "gilding") a post/comment gives the author one month of Reddit Gold. It costs $2.50 USD worth of Bitcoin Cash to gild. \n\n Press "OK" to accept the terms and gild this post with $2.50 USD of Bitcoin Cash. \n Press "CANCEL" to cancel the gilding.`);
        if (!confirmation) {
            return 0;
        }
        if (modal.getAttribute("rt-post-link") != "" && modal.getAttribute("rt-post-author") != "") {
            var msg = window.prompt(`If you want to (optionally) add a message with your gilding, type it below. \n\n Otherwise, just hit enter.`) || "";
            launchTip(
                2.50,
                "gild",
                modal.getAttribute("rt-post-link"),
                modal.getAttribute("rt-post-author"),
                (modal.getAttribute("rt-is-comment") == "true"),
                msg
            )
        } else {
            rtError("We couldn't trace the post link or author.");
            console.log(modal.getAttribute("rt-post-link"), modal.getAttributeNode("rt-post-author"))
        }
    }

    var rt_modal_more = document.createElement("div");
    rt_modal_more.innerHTML = `<hr/><h3 class="rt-notes-header">More</h3> <button id="btn-deposit" class="btn-deposit">Make a Deposit</button> &nbsp; <button id="btn-balance" class="btn-balance">Check your Balance</button> &nbsp; <button id="btn-withdraw" class="btn-withdraw">Make a Withdrawal</button> &nbsp; &middot; &nbsp; <button id="btn-report" class="btn-report">Report Bug</button> &nbsp; <button id="btn-options" class="btn-options"><b>Settings</b></button> <br/>`;
    modal.getElementsByClassName("rt-modal-body")[0].appendChild(rt_modal_more);

    var rt_modal_notes = document.createElement("div");
    var letUsKnow = "https://www.reddit.com/message/compose/?rcompose=true";
    rt_modal_notes.innerHTML = `<hr/><h3 class="rt-notes-header">Notes</h3>  <ul class="rt-bulletlist"><li>You\'ll need to have a deposit of BCH before you can tip. Click the button labeled "Deposit" above to do this.</li><li>Don\'t know what Bitcoin Cash (BCH) is? Ask about it <a href="https://reddit.com/r/btc">here.</a><li>Need help? Is there a bug? <b><a target="_blank" href="${letUsKnow}">Let Us Know</a></b></ul> `;
    modal.getElementsByClassName("rt-modal-body")[0].appendChild(rt_modal_notes);


    if (window.location.href.indexOf("/comments/") <= -1) {
        rt_truelink = false;
    }
    // console.log(modal.children, modal.children[0].getElementsByClassName("rt-main"));
    if ($("body") && $("body").length) {
        $("body")[0].appendChild(modal);
    } else {
        try {
            document.getElementsByTagName("body")[0].appendChild(modal);
        } catch (error) {
            //rtError(error);
        }
    }
    console.log(rt_log + "attaching...")


    for (i = 0; i < document.getElementsByClassName("rt-modal-class").length; ++i) {
        try {
            document.getElementsByClassName("rt-modal-class")[i].getElementsByClassName("btn-deposit")[0].onclick = function () {
                morebutton("deposit");
            }
            document.getElementsByClassName("rt-modal-class")[i].getElementsByClassName("rte-unit-class")[0].value = rt_unit;
            document.getElementsByClassName("rt-modal-class")[i].getElementsByClassName("btn-balance")[0].onclick = function () {
                morebutton("balance");
            }
            document.getElementsByClassName("rt-modal-class")[i].getElementsByClassName("btn-withdraw")[0].onclick = function () {
                morebutton("withdraw");
            }
            document.getElementsByClassName("rt-modal-class")[i].getElementsByClassName("btn-report")[0].onclick = function () {
                morebutton("feedback");
            }
            document.getElementsByClassName("rt-modal-class")[i].getElementsByClassName("btn-options")[0].onclick = function () {
                this.innerHTML =
                    `<img alt="..." src="https://mooncryption.github.io/reddit-tip-extension/marketing/loading.gif"/>`; 
                if (chrome.runtime.openOptionsPage) {
                    // New way to open options pages, if supported (Chrome 42+).
                    chrome.runtime.openOptionsPage();
                  } else {
                    // Reasonable fallback.
                    chrome.runtime.sendMessage({action: "options"}, function(response) {
                      });
                  }
            }
        } catch (err) {
            console.log("Caught error", err);
        }
        var savedPrice = 0.0;
        const fxn = function () {
            $.get("https://min-api.cryptocompare.com/data/price?fsym=BCH&tsyms=USD", function (data, status) {
                var price = 3000.0;
                if (status == 'success') {
                    price = data.USD;
                    savedPrice = data.USD;
                } else if (savedPrice != 0.0) {
                    price = savedPrice;
                } 
                var x = document.getElementsByClassName("rt-usdv");
                for (i = 0; i < x.length; ++i) {
                    var amt = (1.0 * x[i].parentElement.getElementsByClassName("rte-amount-class")[0].value) || 0;
                    var unit = x[i].parentElement.getElementsByClassName("rte-unit-class")[0].value || 'bitcoin cash';
                    var r = 0;
                    var rs = "tip";
                    if (unit == 'bch') {
                        r = (price * amt).toFixed(2);
                        rs = `&asymp;$${r}`;
                    } else if (unit == 'bits') {
                        r = (price * amt * 0.000001).toFixed(2);
                        rs = `&asymp;$${r}`;
                    } else if (unit == 'usd') {
                        r = (amt * (1.00 / price)).toFixed(8);
                        if (amt == 0 || amt < 0.00000001) r = 0;
                        rs = `&asymp;${r} bch`;
                    }
                    x[i].innerHTML = rs;
                }
            });
        }

        document.getElementsByClassName("rt-modal-class")[i].getElementsByClassName("rte-amount-class")[0].onkeydown = fxn;
        document.getElementsByClassName("rt-modal-class")[i].getElementsByClassName("rte-unit-class")[0].onchange = fxn;
        document.getElementsByClassName("rt-modal-class")[i].getElementsByClassName("rte-unit-class")[0].onclick = fxn;
        document.getElementsByClassName("rt-modal-class")[i].getElementsByClassName("rte-amount-class")[0].onclick = fxn;
        document.getElementsByClassName("rt-modal-class")[i].getElementsByClassName("rte-amount-class")[0].onfocus = fxn;

    }

    for (i = 0; i < document.getElementsByClassName("rt-modal-close").length; ++i) {
        var closer = document.getElementsByClassName("rt-modal-close")[i];
        closer.onclick = function () {
            document.getElementById("rt-modal").style.display = "none";
            for (j = 0; j < document.getElementsByClassName("rt-modal-class").length; ++j) {
                document.getElementsByClassName("rt-modal-class")[j].style.display = "none";
            }
            modal.setAttribute("rt-post-link", "");
            modal.setAttribute("rt-post-author", "");
            modal.setAttribute("rt-is-comment", "false");
        }
    }
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            modal.setAttribute("rt-post-link", "");
            modal.setAttribute("rt-post-author", "");
            modal.setAttribute("rt-is-comment", "false");
            try {
                x = $(".rt-modal-class");
                for (i = 0; i < x.length; ++i) {
                    x[i].style.display = "none";
                }
            } catch (e) {
                
            }
        }
        try {
            x = $(".rt-modal-class");
            for (i = 0; i < x.length; ++i) {
                if (event.target == x[i]) {
                    x[i].style.display = "none";
                }
            }
        } catch (e) {
            
        }
    }
    for (i = 0; i < buttonsList.length; i++) {
        if (!buttonsList[i]) { continue; }
        var rt = document.createElement("li");
        if (buttonsList[i].classList.contains("rte-activated")) {
            continue;
        }
        rt.classList = ["tip-button", "login-required", "rte-activated"];
        rt.innerHTML = `<a href="javascript:void(0)" class="tipbtn access-required" data-event-action="tip">${rt_tip_word}</a>`;
        buttonsList[i].classList.add("rte-activated");
        if (buttonsList[i].parentElement.getElementsByClassName("author")[0]) {
            rt.setAttribute("data-author", buttonsList[i].parentElement.getElementsByClassName("author")[0].innerHTML || "");
        } else {
            rt.setAttribute("data-author", "");
        }
        isComment = false;
        plink = "";
        if (buttonsList[i].parentElement.getElementsByClassName("title")[0]) {
            rt.setAttribute("data-isComment", "false")
            // plink = buttonsList[i].parentElement.getElementsByClassName("title")[0].getAttribute("data-href-url") ||  buttonsList[i].parentElement.getElementsByClassName("title")[0].children[0].getAttribute("data-href-url");
            plink = buttonsList[i].getElementsByClassName("first")[0].children[0].getAttribute("data-href-url");
            isComment = false;
        } else {
            rt.setAttribute("data-isComment", "true")
            if (buttonsList[i].getElementsByClassName("bylink")[0]) {
                plink = buttonsList[i].getElementsByClassName("bylink")[0].getAttribute("data-href-url");
            } else {

            }
            isComment = true;
        }
        rt.setAttribute("data-link", plink);
        rt.onclick = function () {
            var isComment = this.getAttribute("data-isComment");
            var postLink = this.getAttribute("data-link");
            var author = this.getAttribute("data-author");
            console.log("Setting post link to", postLink, " post author to", author, "is comment to", isComment, "for");
            modal.setAttribute("rt-post-link", `${postLink}`);
            modal.setAttribute("rt-post-author", `${author}`);
            modal.setAttribute("rt-is-comment", isComment);
            modal.style.display = "block";
        }
        buttonsList[i].appendChild(rt);
    }

    rt_ran_already = false;
}

function rActivate(force = false) {
    if (!window.jQuery) {
        console.log(rt_log + "waiting for full script load...")
        window.setTimeout(rActivate, 200);
    } else {
        if (document.readyState === "complete" || force) {
            console.log(rt_log + "beginning launch...")
            try {
                checkForTips();
                redditTipCore();
                $(window).bind('hashchange', function () { checkForTips(); rActivate(true); });
            } catch (err) {
                console.log(rt_log, " caught error: ", err);
                setTimeout(function () {
                    rActivate(true);
                }, 250);
            }
        } else {
            // console.log(rt_log + "waiting for full reddit load...")
            window.setTimeout(rActivate, 200);
        }
    }
}

console.log(rt_log + "waiting for full page load...");
rActivate(false);

setTimeout(function () {
    rActivate(true);
}, 1000);