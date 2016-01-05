'use strict';

var buttonGroup = require('./button-group');
var formGroup = require('./form-group');
var indicator = require('./indicator');
var notification = require('./notification');
var status = require('./status');
var VNode = require('virtual-dom').VNode;

/**
 * Form.
 *
 * @param {object} props
 * @param {function} props.onSubmit
 * @param {string} [props.errorMessage]
 * @param {boolean} [props.horizontal=false]
 * @param {boolean} [props.isLoading=false]
 * @param {boolean} [props.isLoggedIn=false]
 * @param {function} [props.onRedirectClick] Click handler for the redirect button
 * @param {string} [props.passwordProps]
 * @param {string} [props.username]
 * @param {string} [props.usernameProps]
 * @returns {VNode}
 */
function form(props) {
    var errorMessage = props.errorMessage;
    var horizontal = !!props.horizontal;
    var inputs = props.inputs;
    var isLoading = typeof props.isLoading !== 'undefined' ?
        props.isLoading :
        false;
    var isLoggedIn = typeof props.isLoggedIn !== 'undefined' ?
        props.isLoggedIn :
        false;
    var onRedirectClick = props.onRedirectClick;
    var onSubmit = props.onSubmit;
    var passwordProps = props.passwordProps;
    var username = props.username;
    var usernameProps = props.usernameProps;

    var children = [];
    var className = 'coins-logon-widget-form';
    var passwordFormGroupProps;
    var usernameFormGroupProps;

    if (horizontal) {
        className += ' coins-logon-widget-form-horizontal';
    }

    if (isLoggedIn) {
        children.push(
            status({ username: username }),
            buttonGroup({
                style: 'secondary',
                text: 'Log Out',
                type: 'submit',
            }, {
                onClick: onRedirectClick,
                text: 'Go to COINS →',
            })
        );
    } else {
        if (errorMessage) {
            children.push(notification({ text: errorMessage }));
            className += ' coins-logon-widget-form-error';
        }

        children.push(
            formGroup(usernameProps),
            formGroup(passwordProps),
            buttonGroup({
                text: 'Log In',
                type: 'submit',
            })
        );
    }

    if (isLoading) {
        children.push(indicator());
        className += ' coins-logon-widget-form-loading';
    }

    return new VNode(
        'form',
        {
            className: className,
            onsubmit: function(event) {
                event.preventDefault();
                onSubmit(event);
            },

            method: 'post'
        },
        children
    );
}

module.exports = form;
