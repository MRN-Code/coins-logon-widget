'use strict';

var auth = require('./lib/auth');
var createElement = require('virtual-dom/create-element');
var diff = require('virtual-dom/diff');
var EventEmitter = require('wolfy87-eventemitter');
var form = require('./components/form');
var merge = require('lodash/object/merge');
var messages = require('./lib/messages');
var patch = require('virtual-dom/patch');
var uniqueId = require('lodash/utility/uniqueId');
var utils = require('./lib/utils');

/**
 * Coins logon widget.
 * @class
 * @extends EventEmitter
 *
 * @param {object} options
 * @param {string} options.authCookieName
 * @param {string} options.baseUrl
 * @param {Node} options.el DOM node to append logon widget
 * @param {object} [options.messages] Override default messages by passing a
 * hash corresponding to account and password events. See {@link lib/messages}
 * for specifics.
 * @param {boolean} [options.redirect=false]
 * @param {string} [options.redirectUrl]
 * @param {boolean} [options.checkAuth=false]
 * @param {boolean} [options.horizontal=false] Whether to display the form
 * horizontally, with inputs displayed left-to-right
 */
function CoinsLogonWidget(options) {
    EventEmitter.call(this, options);

    var EVENTS = CoinsLogonWidget.EVENTS;
    var self = this;

    var authCookieName = utils.assertString(
        options.authCookieName,
        'authCookieName'
    );
    var baseUrl = utils.assertString(options.baseUrl, 'baseUrl');

    this.element = utils.assertElement(options.el);
    this._options = {
        authCookieName: authCookieName,
        baseUrl: baseUrl,
    };

    this._options.messages = options.messages ?
        merge({}, messages, options.messages) :
        messages;

    this._options.checkAuth = typeof options.checkAuth === 'boolean' ?
        options.checkAuth :
        false;
    this._options.redirect = typeof options.redirect === 'boolean' ?
        options.redirect :
        false;
    this._options.redirectUrl = typeof options.redirectUrl === 'string' ?
        options.redirectUrl :
        undefined;

    // Set initial state
    this._state = {
        horizontal: !!options.horizontal,
        isLoggedIn: false,
        onSubmit: this.login.bind(this),
        passwordProps: {
            id: uniqueId('coins-logon-widget-'),
            name: 'password',
            type: 'password',
        },
        redirectUrl: this._options.redirectUrl,
        usernameProps: {
            id: uniqueId('coins-logon-widget-'),
            name: 'username',
        },
    };

    // Configure auth
    auth.setOptions({
        authCookieName: authCookieName,
        baseUrl: baseUrl,
    });

    // Wire up events
    this.on(EVENTS.LOGIN, this.login);
    this.on(EVENTS.LOGIN_ERROR, this.onError);
    this.on(EVENTS.LOGIN_ACCOUNT_EXPIRED, this.onAccountExpired);
    this.on(EVENTS.LOGIN_ACCOUNT_WILL_EXPIRE, this.onAccountWillExpire);
    this.on(EVENTS.LOGIN_PASSWORD_EXPIRED, this.onPasswordExpired);
    this.on(EVENTS.LOGIN_PASSWORD_WILL_EXPIRE, this.onPasswordWillExpire);
    this.on(EVENTS.LOGIN_SUCCESS, this.onLogin);
    this.on(EVENTS.LOGOUT, this.logout);
    this.on(EVENTS.LOGOUT_ERROR, this.onError);
    this.on(EVENTS.LOGOUT_SUCCESS, this.onLogout);

    this.init();

    // Perform an auth check if the option is set
    if (this._options.checkAuth) {
        auth.isLoggedIn().then(function(isLoggedIn) {
            if (isLoggedIn) {
                self.emit(EVENTS.LOGIN_SUCCESS, {
                    username: auth.getUsername(),
                });
            }
        });
    }
}

/**
 * Inherit from `EventEmitter`:
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain#Example}
 */
CoinsLogonWidget.prototype = Object.create(EventEmitter.prototype);
CoinsLogonWidget.prototype.constructor = CoinsLogonWidget;

/* ==========================================================================
   Actions
   ========================================================================== */

CoinsLogonWidget.prototype.destroy = function() {
    this.update(null);

    this.removeAllListeners();

    delete this._options;
    delete this._rootNode;
    delete this._state;
    delete this._tree;
    delete this.element;
};

CoinsLogonWidget.prototype.init = function() {
    this._tree = form(this._state);
    this._rootNode = createElement(this._tree);
    this.element.className = this.element.className + ' coins-logon-widget';
    this.element.appendChild(this._rootNode);
};

CoinsLogonWidget.prototype.login = function() {
    var self = this;
    var EVENTS = CoinsLogonWidget.EVENTS;
    var password = this.element.querySelector('input[name=password]').value;
    var username = this.element.querySelector('input[name=username]').value;
    var state;

    // Validate input (make sure it isn't empty)
    if (!username || !password) {
        state = {};

        if (!username) {
            state.usernameProps = {
                errorMessage: 'Missing username!',
                onKeyPress: this.onKeyPress.bind(this),
            };
            this.emit(EVENTS.INVALID, { field: 'username' });
        }

        if (!password) {
            state.passwordProps = {
                errorMessage: 'Missing password!',
                onKeyPress: this.onKeyPress.bind(this),
            };
            this.emit(EVENTS.INVALID, { field: 'password' });
        }

        return this.update(state);
    }

    this.update({ isLoading: true });

    return auth.login(username, password)
        .then(function(response) {
            /**
             * Successful authentication also contains information regarding
             * a user's account status. If the user's password or account is
             * expired the widget needs to handle it here.
             */
            var accountExpiration = Date.parse(response.user.acctExpDate);
            var DAY = CoinsLogonWidget.DAY;
            var now = Date.now();
            var passwordExpiration = Date.parse(response.user.passwordExpDate);

            self.update({ isLoading: false });

            if (accountExpiration - now < DAY * 10) {
                self.emit(EVENTS.LOGIN_ACCOUNT_WILL_EXPIRE, response);
            } else if (passwordExpiration - now < DAY * 10) {
                self.emit(EVENTS.LOGIN_PASSWORD_WILL_EXPIRE, response);
            } else {
                self.emit(EVENTS.LOGIN_SUCCESS, response);
            }

            return response;
        }, function(error) {

            self.update({ isLoading: false });
            if (error === 'Password expired') {
                self.emit(EVENTS.LOGIN_PASSWORD_EXPIRED, error);
            } else if (error === 'Account expired') {
                self.emit(EVENTS.LOGIN_ACCOUNT_EXPIRED, error);
            } else {
                self.emit(EVENTS.LOGIN_ERROR, error);
            }

            return error;
        });
};

CoinsLogonWidget.prototype.logout = function() {
    var EVENTS = CoinsLogonWidget.EVENTS;
    var self = this;

    this.update({ isLoading: true });

    return auth.logout()
        .then(function(response) {
            self.update({ isLoading: false });
            self.emit(EVENTS.LOGOUT_SUCCESS, response);

            return response;
        }, function(error) {

            self.update({ isLoading: false });
            self.emit(EVENTS.LOGOUT_ERROR, error);

            return error;
        });
};

CoinsLogonWidget.prototype.update = function(newState) {
    if (newState === this._state) {
        return;
    }

    this._state = merge({}, this._state, newState);

    var newTree = form(this._state);
    var patches = diff(this._tree, newTree);

    this._rootNode = patch(this._rootNode, patches);
    this._tree = newTree;
};

/* ==========================================================================
   Built-in event listeners
   ========================================================================== */

CoinsLogonWidget.prototype.onAccountExpired = function() {
    var message = utils.callOrReturn(this._options.messages.accountExpired);
    this.update({ errorMessage: message });
};

CoinsLogonWidget.prototype.onAccountWillExpire = function(response) {
    var accountExpiration = Date.parse(response.user.acctExpDate);
    var now = Date.now();
    var message = utils.callOrReturn(
        this._options.messages.accountWillExpire,
        [utils.formatDay((accountExpiration - now) / CoinsLogonWidget.DAY)]
    );

    this.update({ errorMessage: message });
};

CoinsLogonWidget.prototype.onError = function(error) {
    var message;

    if (typeof error !== 'undefined') {
        message = error.message || error.toString();
    } else {
        message = 'Unknown error!';
    }

    this.update({ errorMessage: message });
    console.error(error);
};

CoinsLogonWidget.prototype.onKeyPress = function(event) {
    var clearErrorProps = {
        errorMessage: null,
        onKeyPress: null,
    };

    if (event.target.name === 'username') {
        this.update({ usernameProps: clearErrorProps });
    }

    if (event.target.name === 'password') {
        this.update({ passwordProps: clearErrorProps });
    }
};

CoinsLogonWidget.prototype.onLogin = function(response) {
    // Redirect if the option is set and there's a URL
    if (this._options.redirect && this._options.redirectUrl) {
        window.location = this._options.redirectUrl;
    } else {
        this.update({
            isLoggedIn: true,
            username: response.username,
        });
    }
};

CoinsLogonWidget.prototype.onLogout = function() {
    this.update({ isLoggedIn: false });
};

CoinsLogonWidget.prototype.onPasswordExpired = function() {
    var message = utils.callOrReturn(this._options.messages.passwordExpired);
    this.update({ errorMessage: message });
};

CoinsLogonWidget.prototype.onPasswordWillExpire = function(response) {
    var passwordExpiration = Date.parse(response.user.passwordExpDate);
    var now = Date.now();
    var message = utils.callOrReturn(
        this._options.messages.passwordWillExpire,
        [utils.formatDay((passwordExpiration - now) / CoinsLogonWidget.DAY)]
    );
    this.update({ errorMessage: message });
};

/* ==========================================================================
   Static properties
   ========================================================================== */

CoinsLogonWidget.DAY = 24 * 60 * 60 * 1000;

CoinsLogonWidget.EVENTS = {
    INVALID: 'invalid',
    LOGIN: 'login:init',
    LOGIN_ERROR: 'login:error',
    LOGIN_ACCOUNT_EXPIRED: 'login:accountExpired',
    LOGIN_ACCOUNT_WILL_EXPIRE: 'login:accountWillExpire',
    LOGIN_PASSWORD_EXPIRED: 'login:passwordExpired',
    LOGIN_PASSWORD_WILL_EXPIRE: 'login:passwordWillExpire',
    LOGIN_SUCCESS: 'login:success',
    LOGOUT: 'logout:init',
    LOGOUT_ERROR: 'logout:error',
    LOGOUT_SUCCESS: 'logout:success'
};

module.exports = CoinsLogonWidget;
