var searchText;
var searchElement = document.getElementById("search");

chrome.tabs.executeScript({
    code: "window.getSelection().toString();"
}, function (selection) {
    searchText = selection[0];

    searchElement.value = searchText;
    searchElement.select();
});

searchElement.addEventListener("input", function () {
    searchText = searchElement.value;
    chrome.tabs.executeScript({
        code: "window.find('" + searchText + "', false, false, true);"
    });
});

document.getElementById("next").addEventListener("click", function () {
    chrome.tabs.executeScript({
        code: "window.find('" + searchText + "', false, false, true);"
    });
});

document.getElementById("previous").addEventListener("click", function () {
    chrome.tabs.executeScript({
        code: "window.find('" + searchText + "', false, true, true);"
    });
});

document.getElementById("close").addEventListener("click", function () {
    window.close();
});

chrome.tabs.executeScript({
    code: "var styleElement = document.createElement('style');" +
        "styleElement.id = 'google-chrome-search-bar-extension-style-element';" +
        "var sheet = document.head.appendChild(styleElement).sheet;" +
        "sheet.insertRule('::selection { background: #ff9632 !important; }', 0);"
});

// var background = chrome.extension.getBackgroundPage();
// background.console.log('');

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.runtime.sendMessage({ name: "activeTabId", value: tabs[0].id }, function () { });
});

// Method #1
// Notify background.js that the popup is opened and let it check when the popup is closed.
// chrome.runtime.sendMessage({ name: "popupOpened", value: true }, function () { });

// Method #2
// Open a port and add a listener in background.js to fire when the port is disconnected letting it know when the popup is closed.
var port = chrome.runtime.connect({
    name: "connection"
});