const developerMode = true;
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

var webstoreUrl = "";

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var response = false;
        console.log("[EXT.JS] got request: ", request.action, " (full req): ", request, " (sender): ", sender, " (sendResponse): ", sendResponse);
        switch (request.action) {
            case "/r/bitcoincash":
            case "r/bitcoincash":
                chrome.tabs.create({url: "https://reddit.com/r/bitcoincash/"});
                response = {status: 1, log: "Opened r/bitcoincash"};
                break;
            case "/r/btc":
            case "r/btc":
                chrome.tabs.create({url: "https://reddit.com/r/btc/"});
                response = {status: 1, log: "Opened r/btc"};
                break;
            case "store":
            case "webstore":
                var storeLink = "";
                if (webstoreUrl) storeLink = webstoreUrl;
                else storeLink = `https://chrome.google.com/extensions/detail/${chrome.runtime.id}?hl=en`;

                response = {status: 1, id: chrome.runtime.id, webstore: storeLink, log: "Opened webstore link"};
                chrome.tabs.create({url: storeLink, active: true});
                break;
            case "settings":
            case "options":
                chrome.runtime.openOptionsPage();
                response = {status: 1, log: "Opened settings"};
                break;
            default:
                console.log("[EXT.JS] Unknown request", request);
                response = {status: -1, log: "Unknown request (request.action)"};
        }
        
        if (response) sendResponse(response);
    }
);

chrome.browserAction.onClicked.addListener(function(tab) {
    console.log("[EXT.JS] toolbar button clicked");
    if (settings.browserActionLink == "#settings") {
        chrome.runtime.openOptionsPage();
        return 0;
    }
    chrome.tabs.create({
        url: (settings.browserActionLink || "https://reddit.com/r/btc/"),
        active: true
    }, function(tab) {

    });
});

chrome.runtime.onInstalled.addListener(function (object) {
    console.log("[EXT.JS] extension just installed");
    if (developerMode) {
        return 0;
    }
    chrome.tabs.create({url: "https://mooncryption.github.io/reddit-tip-extension/#installation?oninstall=true"}, function (tab) {

    });
});

chrome.storage.onChanged.addListener(function (changes, areaName){
    console.log("[EXT.JS] settings changed");
    chrome.storage.sync.get(settings, function(items) {
        settings = items;
    });
});

setInterval(function() {
    chrome.storage.sync.get(settings, function(items) {
        settings = items;
    });
}, (15 /* minutes */) * 60000);