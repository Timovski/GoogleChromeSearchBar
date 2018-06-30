var searchText;
var timeoutHandle;
var timeouRunning;
var searchedText;

var searchElement = document.getElementById("search");
var currentElement = document.getElementById("current");
var totalElement = document.getElementById("total");

var resetTimeoutAndSearch = function (milliseconds) {
    timeouRunning = true;
    window.clearTimeout(timeoutHandle);
    timeoutHandle = window.setTimeout(function () {
        searchedText = searchElement.value;
        if (searchedText) {
            port.postMessage({ name: "search", value: searchedText });
        } else {
            totalElement.innerHTML = currentElement.innerHTML = 0;
        }
        timeouRunning = false;
    }, milliseconds);
};

searchElement.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        if (event.shiftKey) {
            port.postMessage({ name: "previous" });
        }
        else {
            port.postMessage({ name: "next" });
        }
    }
    else if (searchedText === searchElement.value) {
        return;
    }
    else {
        if (!timeouRunning) {
            port.postMessage({ name: "reset" });
        }
        resetTimeoutAndSearch(500);
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
        if (message.name === "afterInitialize") {
            searchText = message.value.trim();

            if (searchText) {
                searchElement.value = searchText;
                searchElement.select();
                resetTimeoutAndSearch(1);
            } else {
                totalElement.innerHTML = currentElement.innerHTML = 0;
            }
        }
        else if (message.name === "afterSearch") {
            if (message.value.total) {
                totalElement.innerHTML = message.value.total;
                currentElement.innerHTML = message.value.focusIndex + 1;
            } else {
                totalElement.innerHTML = currentElement.innerHTML = 0;
            }
        }
        else if (message.name === "afterFocus") {
            currentElement.innerHTML = message.value + 1;
        }
    });
});