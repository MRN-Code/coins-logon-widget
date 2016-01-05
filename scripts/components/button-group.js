'use strict';

var VNode = require('virtual-dom').VNode;
var VText = require('virtual-dom').VText;

/**
 * Button.
 *
 * @param {object} props
 * @param {string} props.text
 * @param {function} [props.onClick]
 * @param {string} [props.style=primary]
 * @param {string} [props.type=button]
 * @returns {VNode}
 */
function button(props) {
    var className = 'coins-logon-widget-button';
    var onClick = props.onClick;
    var style = props.style || 'primary';
    var text = props.text;
    var type = props.type || 'button';

    className += ' coins-logon-widget-button-' + style;

    var properties = {
        className: className,
        type: type,
    };

    if (onClick) {
        properties.onclick = onClick;
    }

    return new VNode('button', properties, [new VText(text)]);
}

/**
 * Button group.
 *
 * @see button
 *
 * @{param} {...object} props Properties passed to `button`
 * @returns {VNode}
 */
function buttonGroup(props) {
    var children = arguments.length > 1 ?
        [].slice.call(arguments).map(button) :
        [button(props)];
    var className = 'coins-logon-widget-button-group';

    return new VNode('div', { className: className }, children);
}

module.exports = buttonGroup;
