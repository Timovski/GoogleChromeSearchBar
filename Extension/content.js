
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.name === "search") {
        var originalInput = message.value;
        var lowerCaseInput = originalInput.toLowerCase();

        var escapedInput = originalInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var regExpInput = new RegExp(escapedInput, 'gi');

        search(lowerCaseInput, regExpInput);
    }

    if (message.name === "reset") {
        reset();
    }
});

var reset = function () {
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
                    span.innerHTML = childNode.nodeValue.replace(regExpInput, '<span class="gcsbe-decorated-inner">$&</span>');
                    childNode.parentNode.replaceChild(span, childNode);
                }

                continue;
            }

            decorate(childNode);
        }
    };

    decorate(document.body);
};