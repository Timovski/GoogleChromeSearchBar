var searchText;
var timeoutHandle;

var searchElement = document.getElementById("search");
var currentElement = document.getElementById("current");
var totalElement = document.getElementById("total");

var resetTimeoutAndSearch = function (milliseconds) {
    window.clearTimeout(timeoutHandle);
    timeoutHandle = window.setTimeout(function () {
        port.postMessage({ name: "search", value: searchText });
    }, milliseconds);
};

chrome.tabs.executeScript({
    code: "window.getSelection().toString();"
}, function (selection) {
    searchText = selection[0].trim();

    searchElement.value = searchText;
    searchElement.select();

    if (searchText) {
        resetTimeoutAndSearch(1);
    }
});

document.getElementById("next").addEventListener("click", function () {
    port.postMessage({ name: "next" });
});

document.getElementById("previous").addEventListener("click", function () {
    port.postMessage({ name: "previous" });
});

document.getElementById("close").addEventListener("click", function () {
    window.close();
});

// var background = chrome.extension.getBackgroundPage();
// background.console.log('');
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    port = chrome.tabs.connect(tabs[0].id, { name: "popupConnection" });
    port.postMessage({ name: "initialize" });
    port.onMessage.addListener(function (message) {
        if (message.name === "afterSearch") {
            totalElement.innerHTML = message.value.total;
            currentElement.innerHTML = message.value.focusIndex + 1;
        }
        else if (message.name === "afterFocus") {
            currentElement.innerHTML = message.value + 1;
        }
    });
});