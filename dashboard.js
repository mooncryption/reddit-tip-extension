const version = chrome.runtime.getManifest().version;

var settings = {
    autotip: "true",
    word: "give tip",
    tipInProgress: false,
    tipData: {
        rtip: false,
    },
    defaultStep: 0.01,
    defaultAmt: 0.0001,
    defaultUnit: "bch",
    gilding: true,
    modal_i: 0,
    tipInProgress: false,
    tipData: {},
    rcompose: false,
    browserActionLink: "https://reddit.com/r/btc/",
    defaultWithdrawal: {
        address: "<ADDRESS>",
        amount: "<AMOUNT>",
    },
};
chrome.storage.sync.get(settings, function(items) {
    settings = items;
});

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

function go() {
    $("#classy-error")[0].style.display = "none";
    $(".pagename.selected")[0].innerHTML = `<a href="#">tip dashboard</a>`;
    var main = document.createElement("div"); 
    main.classList.add("r-dashboard");
    var header = document.createElement("div");
    header.classList.add("r-dashboard-header");
    header.innerHTML = `<br/><center><h1>Welcome to your <b>Tipping Dashboard</b></h1></center><hr>`;

    main.innerHTML = "";
    main.innerHTML += `<h3>Settings</h3><button id="settings-btn" class="r-btn-blue draw-border-blue">Go to your Settings</button><br/>`;
    main.innerHTML += `<h3>Tipping Balance</h3><button id="btn-deposit" class="btn-deposit r-btn-green draw-border-green">Make a Deposit</button> &nbsp; <button id="btn-balance" class="btn-balance r-btn-green draw-border-green">Check your Balance</button> &nbsp; <button id="btn-withdraw" class="btn-withdraw r-btn-green draw-border-green">Make a Withdrawal</button> &nbsp;`;
    main.innerHTML += `<h3>Feedback</h3> <button id="btn-feedback" class="btn-feedback r-btn-blue draw-border-blue">Submit your Feedback</button> &nbsp;&nbsp; <button id="btn-review" class="btn-review r-btn-blue draw-border-blue">Review Us!</button><br/>`;
 
    $("div.content")[0].appendChild(header);
    $("div.content")[0].appendChild(main);
    $("#settings-btn")[0].onclick = function() {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
            this.innerHTML = `<b>Settings</b>`;
        } else {
            chrome.runtime.sendMessage({ action: "options" }, function (response) {
            });
        }
    }
    $("#btn-deposit")[0].onclick = function() {
        morebutton("deposit");
    }
    $("#btn-balance")[0].onclick = function() {
        morebutton("balance");
    }
    $("#btn-withdraw")[0].onclick = function() {
        morebutton("withdraw");
    }
    $("#btn-feedback")[0].onclick = function() {
        morebutton("feedback");
    }
    $("#btn-review")[0].onclick = function() {
        if (chrome && chrome.runtime && chrome.runtime.id) {
            console.log("id:", chrome.runtime.id);
            var x = document.createElement("a");
            x.setAttribute("href",`https://chrome.google.com/extensions/detail/${chrome.runtime.id}/reviews?hl=en`);
            x.setAttribute("target", "_blank");
            $("body")[0].appendChild(x); x.click();
        } else {
            chrome.runtime.sendMessage({ action: "webstore" }, function (response) {
                if (response.status !== 1) {
                    console.log(response);
                    alert("Go to the Chrome Webstore and search up 'Reddit Tip Extension', then give us a review!");
                }
            });
        }
    }
}

function attempt() {
    if (window.jQuery) {
        go();
    } else {
        setTimeout(this, 20);
    }
}

document.getElementById("classy-error").style.display = "none";
attempt();