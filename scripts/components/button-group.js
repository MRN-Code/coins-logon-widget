'use strict';

var VNode = require('virtual-dom').VNode;
var VText = require('virtual-dom').VText;

/**
 * Button.
 * @private
 *
 * @param {object} props
 * @param {string} props.text
 * @param {string} [props.href]
 * @param {function} [props.onClick]
 * @param {string} [props.style=primary]
 * @param {string} [props.type=button]
 * @returns {VNode}
 */
function _button(props) {
    var className = 'coins-logon-widget-button';
    var href = props.href;
    var onClick = props.onClick;
    var style = props.style || 'primary';
    var text = props.text;
    var type = props.type || 'button';

    className += ' coins-logon-widget-button-' + style;

    var properties = {
        className: className,
    };
    var tag;

    if (type === 'link') {
        tag = 'a';

        if (href) {
            properties.href = href;
        }
    } else {
        tag = 'button';
        properties.type = type;
    }

    if (onClick) {
        properties.onclick = function(event) {
            event.preventDefault();
            onClick(event);
        };
    }

    return new VNode(tag, properties, [new VText(text)]);
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
        [].slice.call(arguments).map(_button) :
        [_button(props)];
    var className = 'coins-logon-widget-button-group';

    return new VNode('div', { className: className }, children);
}

module.exports = buttonGroup;
