var oldSearchText;
var timeoutHandle;
var timeouRunning;

var searchElement = document.getElementById("search");
var currentElement = document.getElementById("current");
var totalElement = document.getElementById("total");
var previousElement = document.getElementById("previous");
var nextElement = document.getElementById("next");
var closeElement = document.getElementById("close");

var resetTimeoutAndSearch = function (milliseconds) {
    timeouRunning = true;
    window.clearTimeout(timeoutHandle);
    timeoutHandle = window.setTimeout(function () {
        port.postMessage({ name: "search", value: oldSearchText });
        timeouRunning = false;
    }, milliseconds);
};

searchElement.onkeyup = function (event) {
    if (event.keyCode === 13) {
        if (event.shiftKey) {
            port.postMessage({ name: "previous" });
        }
        else {
            port.postMessage({ name: "next" });
        }
    }
    else if (oldSearchText === searchElement.value) {
        return;
    }
    else {
        if (oldSearchText && !timeouRunning) {
            port.postMessage({ name: "reset" });
        }

        oldSearchText = searchElement.value;
        resetTimeoutAndSearch(500);
    }
};

previousElement.onclick = function () {
    port.postMessage({ name: "previous" });
};
previousElement.onmouseover = function () {
    if (totalElement.innerHTML > 0) {
        previousElement.src = "Images/previous_hover.png";
    }
};
previousElement.onmouseout = function () {
    if (totalElement.innerHTML > 0) {
        previousElement.src = "Images/previous.png";
    }
};

nextElement.onclick = function () {
    port.postMessage({ name: "next" });
};
nextElement.onmouseover = function () {
    if (totalElement.innerHTML > 0) {
        nextElement.src = "Images/next_hover.png";
    }
};
nextElement.onmouseout = function () {
    if (totalElement.innerHTML > 0) {
        nextElement.src = "Images/next.png";
    }
};

closeElement.onclick = function () {
    window.close();
};
closeElement.onmouseover = function () {
    closeElement.src = "Images/close_hover.png";
};
closeElement.onmouseout = function () {
    closeElement.src = "Images/close.png";
};

// var background = chrome.extension.getBackgroundPage();
// background.console.log('');
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    port = chrome.tabs.connect(tabs[0].id, { name: "popupConnection" });
    port.postMessage({ name: "init" });
    port.onMessage.addListener(function (message) {
        if (message.name === "updateSearchText") {
            oldSearchText = message.value;
            searchElement.value = message.value;
            searchElement.select();
        }
        else if (message.name === "updateCounters") {
            totalElement.innerHTML = message.value.total;
            currentElement.innerHTML = message.value.focusIndex;

            if (message.value.total > 0) {
                previousElement.src = "Images/previous.png";
                nextElement.src = "Images/next.png";
            } else {
                previousElement.src = "Images/previous_disabled.png";
                nextElement.src = "Images/next_disabled.png";
            }
        }
        else if (message.name === "updateCurrent") {
            currentElement.innerHTML = message.value;
        }
    });
});