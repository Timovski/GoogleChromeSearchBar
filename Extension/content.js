var total;
var focusIndex;
var styleElement;

chrome.runtime.onConnect.addListener(function (port) {
    if (port.name !== "popupConnection") {
        return;
    }

    port.onDisconnect.addListener(function () {
        reset();
    });

    port.onMessage.addListener(function (message) {
        if (message.name === "initialize") {
            initialize();
        }
        else if (message.name === "search") {
            var originalInput = message.value;
            var lowerCaseInput = originalInput.toLowerCase();

            var escapedInput = originalInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            var regExpInput = new RegExp(escapedInput, 'gi');

            total = 0;
            focusIndex = 0;
            search(lowerCaseInput, regExpInput);
            port.postMessage({ name: "afterSearch", value: { total: total, focusIndex: focusIndex } });
        }
        else if (message.name === "next") {
            setFocus(++focusIndex, true);
            port.postMessage({ name: "afterFocus", value: focusIndex });
        }
        else if (message.name === "previous") {
            setFocus(--focusIndex, false);
            port.postMessage({ name: "afterFocus", value: focusIndex });
        }
    });
});

var setFocus = function (index, forward) {
    if (forward) {
        if (index >= total) {
            index = 0;
            focusIndex = 0;
        }
    }
    else {
        if (index < 0) {
            index = total - 1;
            focusIndex = total - 1;
        }
    }

    var focusedElements = document.getElementsByClassName("gcsbe-decorated-focused");
    for (let i = 0; i < focusedElements.length; i++) {
        focusedElements[i].className = "gcsbe-decorated-inner";
    }

    var element = document.getElementById("gcsbe-" + index);
    if (!element.parentElement.offsetWidth && !element.parentElement.offsetHeight) {
        if (forward) {
            setFocus(++focusIndex, true);
        } else {
            setFocus(--focusIndex, false);
        }
    }
    else {
        element.className = "gcsbe-decorated-focused";
        element.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
    }
};

var reset = function () {
    styleElement.parentNode.removeChild(styleElement);

    var elements = document.getElementsByClassName("gcsbe-decorated-outer");
    while (elements.length) {
        var element = elements[0];
        var textNode = document.createTextNode(element.textContent);
        element.parentElement.replaceChild(textNode, element);
    }
};

var search = function (lowerCaseInput, regExpInput) {
    var decorate = function (element) {
        for (var i = 0; i < element.childNodes.length; i++) {
            var childNode = element.childNodes[i];
            if (childNode.nodeType === Node.TEXT_NODE) {
                if (childNode.nodeValue.toLowerCase().indexOf(lowerCaseInput) !== -1) {
                    var span = document.createElement("span");
                    span.className = "gcsbe-decorated-outer";
                    span.innerHTML = childNode.nodeValue.replace(regExpInput, '<span id="gcsbe-' + total + '" class="gcsbe-decorated-inner">$&</span>');
                    childNode.parentNode.replaceChild(span, childNode);
                    total++;
                }

                continue;
            }

            decorate(childNode);
        }
    };

    console.time('decorate');

    decorate(document.body);

    console.timeEnd('decorate');

    setFocus(0, true);

    console.log(total);
};

var initialize = function () {
    styleElement = document.createElement('style');
    var sheet = document.head.appendChild(styleElement).sheet;
    sheet.insertRule('.gcsbe-decorated-inner { background-color: yellow !important; }', 0);
    sheet.insertRule('.gcsbe-decorated-focused { background-color: #ff9632 !important; }', 1);
};