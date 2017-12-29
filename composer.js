console.log("RTE - composer running");

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
function c(data) {
    var to = "mooncryption";
    var subject = "Reddit Tip Extension - Feedback";
    var message = `\n\n\n-----\nUser Agent: ${navigator.userAgent}`;
    var send = false;
    switch (data.id) {
        case 'deposit':
            subject = "Deposit";
            to = "tippr";
            message = "deposit";
            send = true;
            break;
        case 'balance':
            subject = "Balance";
            to = "tippr";
            message = "balance";
            send = true;
            break;
        case 'withdraw':
            subject = "Withdrawal"
            to = "tippr";
            message = "withdraw <AMOUNT> <ADDRESS>";
            send = false;
        default:
        case 'feedback':
            console.log("feedback mode");
    }
    console.log("RCompose", to, message, subject, send);

    document.getElementsByName("to")[0].value = to;
    document.getElementsByName("subject")[0].value = subject;
    var x = $(".usertext-edit.md-container");
    for (i = 0; i < x.length; ++i) {
        x[i].getElementsByClassName("md")[0].children[0].value = message;
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
