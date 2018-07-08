var total;
var focusIndex;

chrome.runtime.onConnect.addListener(function (port) {
    if (port.name !== "popupConnection") {
        return;
    }

    port.onDisconnect.addListener(function () {
        reset();
    });

    port.onMessage.addListener(function (message) {
        if (message.name === "init") {
            var selection = window.getSelection().toString().trim();
            port.postMessage({ name: "updateSearchText", value: selection });
            search(selection);
            port.postMessage({ name: "updateCounters", value: { total: total, focusIndex: focusIndex } });
        }
        else if (message.name === "reset") {
            reset();
        }
        else if (message.name === "search") {
            search(message.value);
            port.postMessage({ name: "updateCounters", value: { total: total, focusIndex: focusIndex } });
        }
        else if (message.name === "next") {
            setFocus(true);
            port.postMessage({ name: "updateCurrent", value: focusIndex });
        }
        else if (message.name === "previous") {
            setFocus(false);
            port.postMessage({ name: "updateCurrent", value: focusIndex });
        }
    });
});

var setFocus = function (forward) {
    if (!total) {
        return;
    }

    if (forward) {
        focusIndex++;
        if (focusIndex > total) {
            focusIndex = 1;
        }
    }
    else {
        focusIndex--;
        if (focusIndex < 1) {
            focusIndex = total;
        }
    }

    var focusedElements = document.getElementsByClassName("gcsbe-decorated-focused");
    for (let i = 0; i < focusedElements.length; i++) {
        focusedElements[i].className = "gcsbe-decorated-inner";
    }

    var element = document.getElementById("gcsbe-" + focusIndex);
    if (!element) {
        return;
    }

    if (!element.parentElement.offsetWidth && !element.parentElement.offsetHeight) {
        if (forward) {
            setFocus(true);
        } else {
            setFocus(false);
        }
    }
    else {
        element.className = "gcsbe-decorated-focused";
        element.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
    }
};

var reset = function () {
    var elements = document.getElementsByClassName("gcsbe-decorated-outer");
    while (elements.length) {
        var element = elements[0];
        var textNode = document.createTextNode(element.textContent);
        element.parentElement.replaceChild(textNode, element);
    }
};

var search = function (searchText) {
    total = focusIndex = 0;

    if (!searchText) {
        return;
    }

    var lowerCaseText = searchText.toLowerCase();
    var escapedText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var regExp = new RegExp(escapedText, 'gi');

    var decorate = function (element) {
        for (var i = 0, len = element.childNodes.length; i < len; i++) {
            var childNode = element.childNodes[i];
            if (childNode.nodeType === Node.TEXT_NODE) {
                if (childNode.nodeValue.toLowerCase().indexOf(lowerCaseText) !== -1) {
                    total++;

                    var span = document.createElement("span");
                    span.className = "gcsbe-decorated-outer";
                    span.innerHTML = childNode.nodeValue.replace(regExp, '<span id="gcsbe-' + total + '" class="gcsbe-decorated-inner">$&</span>');
                    childNode.parentNode.replaceChild(span, childNode);
                }

                continue;
            }

            decorate(childNode);
        }
    };

    decorate(document.body);
    setFocus(true);
};