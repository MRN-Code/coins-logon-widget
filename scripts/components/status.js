'use strict';

var VNode = require('virtual-dom').VNode;
var VText = require('virtual-dom').VText;

/**
 * Status.
 *
 * @param {object} props
 * @param {string} [props.username]
 * @returns {VNode}
 */
function status(props) {
    var className = 'coins-logon-widget-status';
    var username = props.username;
    var children = !!username ?
        [
            new VText('Logged in as '),
            new VNode('strong', undefined, [new VText(username)]),
            new VText('.'),
        ] :
        [new VText('Logged in.')];

    return new VNode('p', { className: className }, children);
}

module.exports = status;
