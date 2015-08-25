(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['unique-number'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('unique-number'));
    } else {
        // Browser globals (root is window)
        root.CoinsLogonWidget = root.CoinsLogonWidget || {};
        root.CoinsLogonWidget.utils = factory(root.UniqueNumber);
    }
}(this, function (UniqueNumber) {
    'use strict';

    var uniqueNumber = new UniqueNumber();

    /**
     * Add event listener that fires once.
     * @{@link  https://github.com/insin/event-listener}
     */
    function once(target, eventType, callback) {
        function listener() {
            callback.apply(null, arguments);
            target.removeEventListener(eventType, listener, false);
        }

        target.addEventListener(eventType, listener, false);
    }

    function removeElement(element) {
        if (element) {
            while (element.lastChild) {
                element.removeChild(element.lastChild);
            }
        }

        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    function uniqueId(string) {
        if (typeof string !== 'string') {
            string = '';
        }
        return string + uniqueNumber.generate();
    }

    return {
        once: once,
        removeElement: removeElement,
        uniqueId: uniqueId,
    };
}));
