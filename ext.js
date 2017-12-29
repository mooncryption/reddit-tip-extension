chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action == "options")
        chrome.runtime.openOptionsPage();
    }
);

chrome.browserAction.onClicked.addListener(function(tab) {
    console.log("opening...");
    chrome.tabs.create({
        url: "https://reddit.com/r/btc/",
        active: true
    }, function(tab) {

    });
});