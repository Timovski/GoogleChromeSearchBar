var openedInTabId = null;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.name === "activeTabId") {
        openedInTabId = message.value;
    }
    // Method #1
    // else if (message.name === "popupOpened") {
    //     var checkPopupStateInterval = setInterval(function () {
    //         var popupViews = chrome.extension.getViews({ type: "popup" });
    //         if (popupViews.length === 0) {
    //             clearInterval(checkPopupStateInterval);

    //             chrome.tabs.executeScript({
    //                 code: "var styleElement = document.getElementById('google-chrome-search-bar-extension-style-element');" +
    //                     "styleElement.parentNode.removeChild(styleElement);"
    //             });
    //         }
    //     }, 500);
    // }
});

// Method #2
chrome.runtime.onConnect.addListener(function (port) {
    port.onDisconnect.addListener(function (port) {
        chrome.tabs.executeScript(openedInTabId, {
            code: "var styleElement = document.getElementById('google-chrome-search-bar-extension-style-element');" +
                "styleElement.parentNode.removeChild(styleElement);"
        });
        
        chrome.tabs.sendMessage(openedInTabId, {
            name: "reset"
        });

        openedInTabId = null;
    });
});