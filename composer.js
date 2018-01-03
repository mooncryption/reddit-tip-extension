console.log("RTE - composer running");
var wAmount = "<AMOUNT>";
var wAddress = "<ADDRESS>";
const version = chrome.runtime.getManifest().version;

if (window.location.href.indexOf("rwaitalert") != -1) {
    console.log("wait alert");
    if (window.location.href.indexOf("rwaitalert=true") != -1) {
        alert("Wait here for a private message from /u/tippr in the next minute!\n\nWe'll reload the page periodically (every 15 sec) until it comes.");
        window.location.href = "https://www.reddit.com/message/inbox/?rwaitalert=false";
    } else {
        try {
            if ($(".live-timestamp")[0].innerHTML != "just now") {
                setTimeout(function () {
                    window.location.replace("https://www.reddit.com/message/inbox/?rwaitalert=false")
                }, 1000 * 10)
            }
        } catch (e) {

        }
    }
}

chrome.storage.sync.get({
    defaultWithdrawal: {
        address: "<ADDRESS>",
        amount: "<AMOUNT>",
    },
}, function(items) {
    wAmount = items.defaultWithdrawal.amount;
    wAddress = items.defaultWithdrawal.address
})

function c(data) {
    var to = "mooncryption";
    var subject = "Reddit Tip Extension - Feedback";
    var message = `\n\n-----\nBrowser I'm Using:\nOperating System I'm Using:\n\n-----\n~~~~(extension logs, don't remove):~~~~\nUser Agent: ${navigator.userAgent}\nBrowser Data: ${navigator.appName} -> ${navigator.appCodeName} -> ${navigator.appVersion}\nExtension Version: ${version}`;
    var messageSub = "";
    var send = false;
    var alertMessage = "";
    var sendText = "send";
    var formatSuggestion = "";
    switch (data.id) {
        case 'deposit':
            subject = "Deposit";
            to = "tippr";
            message = "deposit";
            messageSub = "(requesting deposit address...)";
            send = true;
            sendText = "Request Deposit Address";
            break;
        case 'balance':
            subject = "Balance";
            to = "tippr";
            message = "balance";
            messageSub = "(requesting your balance...)";
            sendText = "Request Tip Balance";
            send = true;
            break;
        case 'withdraw':
            subject = "Withdrawal"
            to = "tippr";
            message = `withdraw ${wAmount} ${wAddress}`;
            messageSub = "<b>Note:</b> Please ensure that the amount and address below are accurate, before clicking the bottom button.";
            sendText = "Confirm Withdrawal"
            send = false;
            formatSuggestion = "<br/><b>Format:</b> <code>withdraw [AMOUNT] [ADDRESS]</code>&nbsp;&nbsp;<br/><b>Note:</b> Make sure your address is accurate, and is a valid <em>Bitcoin Cash</em> address. Follow the format detailed above.&nbsp;&nbsp;";
            alertMessage = "We won't automatically send your withdrawal as these are irreversible.\n\nPlease make sure the amount and address in your withdrawal are 100% accurate. After that, you can press the button at the bottom of the page to send your withdrawal request.\n\n";
            break;
        default:
        case 'feedback':
            messageSub = "Please write a detailed explanation of your feedback (or the bug you found).";
            sendText = "Send Feedback";
            formatSuggestion = "<br/><b>Note:</b> Be as detailed as possible! Add your browser and operating system underneath the first set of dashes. &nbsp;&nbsp;";
            console.log("feedback mode");
    }
    // console.log("RCompose", to, message, subject, send);

    document.getElementsByName("to")[0].value = to;
    document.getElementsByName("subject")[0].value = subject;
    var x = $(".usertext-edit.md-container");
    for (i = 0; i < x.length; ++i) {
        x[i].getElementsByClassName("md")[0].children[0].value = message;
    }
    if (alertMessage != "") {
        window.alert(alertMessage);
    }
    var ms = document.createElement("span");
    ms.classList = "little gray roundfield-description message-sub";
    ms.innerHTML = messageSub;
    if (messageSub != "") {
        try {
            $(".spacer")[3].children[0].insertBefore(ms, $(".spacer")[3].children[0].getElementsByClassName("roundfield-content")[0]);
            if (formatSuggestion != "") {
                $(".spacer")[3].getElementsByClassName("bottom-area")[0].getElementsByClassName("reddiquette")[0].style.display = "none";
                $(".spacer")[3].getElementsByClassName("bottom-area")[0].getElementsByClassName("help-toggle")[0].style.display = "none";
                var fsElement = document.createElement("span");
                fsElement.innerHTML = formatSuggestion;
                $(".spacer")[3].getElementsByClassName("bottom-area")[0].insertBefore(fsElement, $(".spacer")[3].getElementsByClassName("bottom-area")[0].firstChild);
            }
        } catch (err) {}
    }
    if (sendText != "send") {
        try {
            $("#send")[0].innerHTML = sendText;
            $("#send")[0].classList.add("r-btn-blue");
            $("#send")[0].classList.add("draw-border-blue");
            $("#send")[0].onmouseover = function() {
                ms.classList.add("thicker-alert");
            }
            $("#send")[0].onmouseout = function() {
                ms.classList.remove("thicker-alert");
            }
        } catch (err) {}
    }
    if (send == true) {
        document.getElementsByName("send")[0].click();
        setTimeout(function () {
            window.location.replace("https://www.reddit.com/message/inbox/?rwaitalert=true");
            setTimeout(function () {
                window.location.replace("https://www.reddit.com/message/inbox/?rwaitalert=true");
            }, 500);
        }, 500);
    }
    chrome.storage.sync.set({
        rcompose: {
            go: true,
            id: "feedback"
        }
    })
}

if (window.location.href.indexOf("rcompose=true") != -1) {
    chrome.storage.sync.get({
        rcompose: {
            go: true,
            id: "feedback"
        }
    }, function (items) {
        c(items.rcompose);
    });
} 
