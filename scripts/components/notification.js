'use strict';

var VNode = require('virtual-dom').VNode;
var VText = require('virtual-dom').VText;

/**
 * Notification.
 *
 * @param {object} props
 * @param {array|string} props.text An array of virtual-dom objects or plain
 * text
 * @returns {VNode}
 */
function notification(props) {
    var properties = {
        className: [
            'coins-logon-widget-notification',
            'coins-logon-widget-notification-error',
        ].join(' '),
    };
    var text = props.text;
    var children;

    if (Array.isArray(text)) {
        children = text;
    } else if (typeof text === 'string') {
        if (text.indexOf('<') !== -1 && text.indexOf('>') !== -1) {
            properties.innerHTML = text;
        } else {
            children = [new VText(text)];
        }
    }

    return new VNode('div', properties, children);
}

module.exports = notification;
