'use strict';

var VNode = require('virtual-dom').VNode;
var VText = require('virtual-dom').VText;

/**
 * Form group.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.name
 * @param {string} [props.errorMessage]
 * @param {string} [props.type=text]
 * @param {string} [props.value='']
 * @returns {VNode}
 */
function formGroup(props) {
    var errorMessage = props.errorMessage;
    var id = props.id;
    var name = props.name;
    var type = props.type || 'text';
    var value = typeof props.value !== 'undefined' ? props.value : '';

    var className = 'coins-logon-widget-form-group';
    var label = name.charAt(0).toUpperCase() + name.substr(1);
    var inputProperties = {
        className: 'coins-logon-widget-input',
        id: id,
        name: name,
        placeholder: label,
        type: type,
        value: value,
    };

    var children = [
        new VNode(
            'label',
            {
                className: 'coins-logon-widget-label coins-logon-widget-visuallyhidden',
                for: id,
            },
            [new VText(label)]
        ),
    ];

    if (errorMessage) {
        children.push(
            new VNode(
                'span',
                {
                    'aria-hidden': 'true',
                    className: 'coins-logon-widget-icon',
                }
            ),
            new VNode(
                'span',
                {
                    className: 'coins-logon-widget-input-message',
                },
                [new VText(errorMessage)]
            )
        );
        className += ' coins-logon-widget-form-group-error';
        inputProperties.onkeypress = function(event) {
            props.onKeyPress(event);
        };
    }

    children.splice(1, 0, new VNode('input', inputProperties));

    return new VNode('div', { className: className }, children);
}

module.exports = formGroup;
