var rt_tip_word = "give tip"; // "tip" "tippr"
var rt_log = "Reddit Tip Extension by /u/mooncryption: ";
var rt_truelink = true;
var rt_ran_already = false;

function rtError(message) {
    console.log("[REDDIT TIP EXTENSION] Error: ", message);
    alert(`Reddit Tip Extension had an error: \n\n ${message}`);
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
  
      for (var i=0; i<arr.length; i++) {
        // separate the keys and the values
        var a = arr[i].split('=');
  
        // in case params look like: list[]=thing1&list[]=thing2
        var paramNum = undefined;
        var paramName = a[0].replace(/\[\d*\]/, function(v) {
          paramNum = v.slice(1,-1);
          return '';
        });
  
        // set parameter value (use 'true' if empty)
        var paramValue = typeof(a[1])==='undefined' ? true : a[1];
  
        // (optional) keep case consistent
        paramName = paramName.toLowerCase();
        paramValue = paramValue.toLowerCase();
  
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
    var p = getURLParams(window.location.href);
    if (!(p.rtip && p.rtip == true && p.rcomment == false)) {
        return 0;
    }
    var c = `${p.ramount} ${p.runit} u/tippr`;

}

function launchTip(amount, unit = "bch", postLink, postAuthor = "", isComment = false) {
    document.getElementById("rt-modal").style.display = "none";
    for (j = 0; j < document.getElementsByClassName("rt-modal-class").length; ++j) {
        document.getElementsByClassName("rt-modal-class")[j].style.display = "none";
    }

    console.log(rtLog("launchTip"), amount, unit, postLink, postAuthor, isComment)
    if (!isComment) {
        window.location.href = `${postLink}?${encodeURIComponent(`rtip=true&ramount=${amount}&runit=${unit}&rauthor=${postAuthor}&rcomment=${isComment}`)}`;
        return 0;
    }
    for (i = 0; i < document.getElementsByClassName("bylink").length; ++i) {
        if (!(document.getElementsByClassName("bylink")[i].getAttribute("data-href-url") && document.getElementsByClassName("bylink")[i].getAttribute("data-href-url") == postLink)) {
            continue;
        }
        
    }
}

function redditTipCore() {
    var buttonsList = $("ul.flat-list.buttons");
    if (buttonsList.length < 1) {
        window.setTimeout(rActivate, 200);
    }
    console.log(rt_log + "activating...");


    var modal = document.createElement("div");
    modal.classList = ["rt-modal-class"];
    modal.id = "rt-modal";
    modal.innerHTML = '<div class="rt-modal-content"><div class="rt-modal-header"><span class="rt-modal-close">&times;</span><h1>Give a Tip!</h1></div><div class="rt-modal-body"></div><hr/><div class="rt-modal-footer"><em>Made with love by <a href="https://reddit.com/u/mooncryption">/u/mooncryption</a> &middot; <a href="https://github.com/mooncryption/reddit-tip-extension">Github Repository</a> &middot; <a href="https://reddit.com/u/tippr">Powered by /u/tippr</a></em></div></div>';
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
    rt_modal_main.innerHTML='<input type="number" step="0.01" value="0.0001" id="rte-amount" name="rte-amount"/> <select name="rte-unit" id="rte-unit"><option value="bch">BCH&nbsp;&nbsp;</option><option value="usd">USD&nbsp;&nbsp;</option><option value="bits">bits&nbsp;&nbsp;</option></select><br/><br/>';
    var rt_btn = document.createElement("span");
    rt_btn.innerHTML = '<button class="rte-btn" id="rte-btn">Send Tip!</button><br/><br/>';
    rt_modal_main.appendChild(rt_btn);
    modal.getElementsByClassName("rt-modal-body")[0].appendChild(rt_modal_main);
    rt_btn.children[0].onclick = function () {
        if (modal.getAttribute("rt-post-link") != "" && modal.getAttribute("rt-post-author") != "") {
            launchTip(
                document.getElementById("rte-amount").value,
                document.getElementById("rte-unit").value,
                modal.getAttribute("rt-post-link"),
                modal.getAttribute("rt-post-author"),
                (modal.getAttribute("rt-is-comment") == "true")
            )
        } else {
            rtError("We couldn't trace the post link or author.");
            console.log(modal.getAttribute("rt-post-link"), modal.getAttributeNode("rt-post-author"))
        }
    }
    
    var rt_modal_notes = document.createElement("div"); 
    rt_modal_notes.innerHTML='<hr/><h3 class="rt-notes-header">Notes</h3>  <ul class="rt-bulletlist"><li>You\'ll need to have a deposit of BCH before you can tip. See <a href="https://www.reddit.com/r/tippr/wiki/reddit-usage">here</a> for how to do this.</li><li>Don\'t know what Bitcoin Cash (BCH) is? Ask about it <a href="https://reddit.com/r/btc">here.</a></ul> ';
    modal.getElementsByClassName("rt-modal-body")[0].appendChild(rt_modal_notes);

    if (window.location.href.indexOf("/comments/") <= -1) {
        rt_truelink = false;
    }
    // console.log(modal.children, modal.children[0].getElementsByClassName("rt-main"));
    $("body")[0].appendChild(modal);
    console.log(rt_log + "attaching...")

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
        }
    }
    for (i = 0; i < buttonsList.length; i++) {
        if (!buttonsList[i]) { continue; }
        var rt = document.createElement("li");
        rt.classList = ["tip-button", "login-required"];
        rt.innerHTML = `<a href="javascript:void(0)" class="tipbtn access-required" data-event-action="tip">${rt_tip_word}</a>`;
        rt.setAttribute("data-author",buttonsList[i].parentElement.getElementsByClassName("author")[0].innerHTML);
        isComment = false;
        plink = "";
        if (buttonsList[i].parentElement.getElementsByClassName("title")[0]) {
            rt.setAttribute("data-isComment", "false")
            plink = buttonsList[i].parentElement.getElementsByClassName("title")[0].getAttribute("data-href-url") ||  buttonsList[i].parentElement.getElementsByClassName("title")[0].children[0].getAttribute("data-href-url");
            isComment = false;
        } else {
            rt.setAttribute("data-isComment", "true")
            plink = buttonsList[i].getElementsByClassName("bylink")[0].getAttribute("data-href-url");
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
        window.setTimeout(rActivate, 200);
    } else {
        if ($("body").length > 0) {
            if (!rt_ran_already || force) {
                checkForTips();
                redditTipCore();
                $(window).bind('hashchange', function () {checkForTips(); rActivate(true);});
            }
        } else {
            window.setTimeout(rActivate, 200);
        }
    }
}

console.log(rt_log + "waiting for full page load...");
rActivate(false);