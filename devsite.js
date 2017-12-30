console.log("Reddit Tip Extension activated - devsite!");
const version = "0.0.1";

function devsite() {
    console.log("Checking version...", $("#latest-version")[0]);
    try {
        var latestVersion = $("#latest-version")[0].innerHTML;
        if (!latestVersion && $("#latest-version")[0]) {
            latestVersion = $("#latest-version")[0].getAttribute("data-latest-version");
        }
    } catch (er) {
        console.log("version error: ", er);
        setTimeout(go, 750);
    }
    if (!latestVersion) {
        setTimeout(go, 500);
        return 0;
    }
    if (version == latestVersion) {
        console.log("You're on the latest version for Reddit Tip Extension: ", version);
        $("#install-div")[0].innerHTML =
            `<img id="installed-img" src="http://www.emoji.co.uk/files/emoji-one/symbols-emoji-one/2118-white-heavy-check-mark.png" height="20" width="20"/> &nbsp; <b>Installed!</b> &nbsp; You're on the latest version.`;
    } else {
        console.log("The latest version for Reddit Tip Extension is: ", latestVersion, " but you're on version: ", version);
        $("#install-div")[0].innerHTML = 
            `<img id="outdated-img" src="https://www.gnapartners.com/wp-content/uploads/check-icon.png" width="20" height="20"/> &nbsp; <b>Installed!</b> &nbsp; You're <em>not</em> on the latest version though.`;
    }
}

function go() {
    if (window.jQuery) {
        if (window.location.href.indexOf("reddit-tip-extension") != -1) {
            devsite();
        }
    } else {
        setTimeout(go, 200);
    }
}

go();