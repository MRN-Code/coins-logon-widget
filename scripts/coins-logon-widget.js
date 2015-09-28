(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'wolfy87-eventemitter/EventEmitter',
            'es6-object-assign',
            './lib/auth',
            './lib/form',
            './lib/form-group',
            './lib/utils'
        ], function(EventEmitter, ObjectAssign, Auth, Form, FormGroup, utils) {
            return factory(
                EventEmitter,
                ObjectAssign.assign,
                Auth,
                Form,
                FormGroup,
                utils
            );
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(
            require('wolfy87-eventemitter'),
            require('es6-object-assign').assign,
            require('./lib/auth'),
            require('./lib/form'),
            require('./lib/form-group'),
            require('./lib/utils')
        );
    } else {
        // Browser globals (root is window)
        root.CoinsLogonWidget = factory(
            root.EventEmitter,
            root.ObjectAssign.assign,
            root.CoinsLogonWidget.Auth,
            root.CoinsLogonWidget.Form,
            root.CoinsLogonWidget.FormGroup,
            root.CoinsLogonWidget.utils
        );
    }
}(this, function (
    EventEmitter,
    assign,
    Auth,
    Form,
    FormGroup,
    utils
) {
    'use strict';

    var EVENTS = {
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

    var day = 24 * 60 * 60 * 1000;

    function CoinsLogonWidget(element, options) {
        EventEmitter.call(this);

        this.options = assign({}, CoinsLogonWidget.DEFAULTS, options);

        /**
         * If the form has hidden labels or a horizontal layout apply the
         * `hiddenLabel` form group option. This persists the option down to the
         * `FormGroup` elements.
         *
         * @todo  Devise a better solution for passing down options
         */
        if (this.options.hiddenLabels || this.options.horizontal) {
            this.options.formGroups.forEach(function(formGroupOption) {
                formGroupOption.hiddenLabel = true;
            });
        }

        // Configure auth
        if (this.options.baseUrl) {
            Auth.setOptions({
                baseUrl: this.options.baseUrl
            });
        }

        this.element = this._getElements(element);
        this._setState();
    }

    // Inherit from `EventEmitter`
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain#Example
    CoinsLogonWidget.prototype = Object.create(EventEmitter.prototype);
    CoinsLogonWidget.prototype.constructor = CoinsLogonWidget;

    CoinsLogonWidget.prototype._getElements = function(element) {
        if (!element) {
            throw new Error('Element required');
        } else if (!(element instanceof Node)) {
            // Make sure `element` is an actual node
            // http://stackoverflow.com/a/384380
            throw new Error('Expected element to be a DOM node');
        }

        var self = this;

        this.form = new Form({
            formGroups: this.options.formGroups,
            horizontal: this.options.horizontal,
            login: function() {
                self.emit(EVENTS.LOGIN, self.form.getFormData());
            },
            logout: function() {
                self.emit(EVENTS.LOGOUT);
            }
        });

        element.innerHTML = '';
        element.className = this.options.classNames.root;
        element.appendChild(this.form.element);

        return element;
    };

    CoinsLogonWidget.prototype._setState = function() {
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
    };

    CoinsLogonWidget.prototype.destroy = function() {
        this.form.destroy();
        delete this.form;
        this.removeAllListeners();
        delete this.options;
        delete this.element;
    };

    CoinsLogonWidget.prototype.login = function(formData) {
        var self = this;
        var validations = self.form.validate();

        if (validations !== true) {
            self.emit(EVENTS.INVALID, validations);
            return;
        } else {
            self.form.clearMessage();
        }

        this.form.setLoading();

        Auth.login(formData.username, formData.password)
            .done(function(response) {
                /**
                 * Successful authentication also contains information regarding
                 * a user's account status. If the user's password or account is
                 * expired the widget needs to handle it here.
                 */
                var accountExpiration = Date.parse(response.user.acctExpDate);
                var now = Date.now();
                var passwordExpiration = Date.parse(response.user.passwordExpDate);

                self.form.clearLoading();

                if (accountExpiration - now < day * 10) {
                    self.emit(EVENTS.LOGIN_ACCOUNT_WILL_EXPIRE, response);
                } else if (passwordExpiration - now < day * 10) {
                    self.emit(EVENTS.LOGIN_PASSWORD_WILL_EXPIRE, response);
                } else {
                    self.emit(EVENTS.LOGIN_SUCCESS, response);
                }
            })
            .fail(function(error) {
                self.form.clearLoading();
                if (error === 'Password expired') {
                    self.emit(EVENTS.LOGIN_PASSWORD_EXPIRED, error);
                } else if (error === 'Account expired') {
                    self.emit(EVENTS.LOGIN_ACCOUNT_EXPIRED, error);
                } else {
                    self.emit(EVENTS.LOGIN_ERROR, error);
                }
            });
    };

    CoinsLogonWidget.prototype.logout = function() {
        var self = this;

        this.form.setLoading();

        Auth.logout()
            .done(function(response) {
                self.form.clearLoading();
                self.emit(EVENTS.LOGOUT_SUCCESS, response);
            })
            .fail(function(error) {
                self.form.clearLoading();
                self.emit(EVENTS.LOGOUT_ERROR, error);
            });
    };

    CoinsLogonWidget.prototype.onAccountExpired = function(response) {
        var message = utils.callOrReturn(this.options.messages.accountExpired);
        this.form.setErrorMessage(message);
    };

    CoinsLogonWidget.prototype.onAccountWillExpire = function(response) {
        var accountExpiration = Date.parse(response.user.acctExpDate);
        var now = Date.now();
        var message = utils.callOrReturn(
            this.options.messages.accountWillExpire,
            [utils.formatDay((accountExpiration - now) / day)]
        );
        this.form.setErrorMessage(message);
    };

    CoinsLogonWidget.prototype.onPasswordExpired = function(response) {
        var message = utils.callOrReturn(this.options.messages.passwordExpired);
        this.form.setErrorMessage(message);
    };

    CoinsLogonWidget.prototype.onPasswordWillExpire = function(response) {
        var passwordExpiration = Date.parse(response.user.passwordExpDate);
        var now = Date.now();
        var message = utils.callOrReturn(
            this.options.messages.passwordWillExpire,
            [utils.formatDay((passwordExpiration - now) / day)]
        );
        this.form.setErrorMessage(message);
    };

    CoinsLogonWidget.prototype.onError = function(error) {
        var message;

        if (typeof error !== 'undefined') {
            message = error.message || error.toString();
        } else {
            message = 'Unknown error!';
        }

        this.form.setErrorMessage(message);
        console.error(error);
    };

    CoinsLogonWidget.prototype.onLogin = function(response) {
        var username = response.username;
        var statusText = username ?
            'Logged in as <strong>' + username + '</strong>.' :
            'Logged in.';

        this.form.setToLogout(statusText);
    };

    CoinsLogonWidget.prototype.onLogout = function(response) {
        this.form.setToLogin();
    };

    CoinsLogonWidget.prototype.onSubmit = function(event) {
        event.preventDefault();

        var errors;

        this.formGroups.forEach(function(formGroup) {
            var isValid = formGroup.validate();

            //TODO: emit validation error events
            if (!isValid) {
                errors = true;
            }
        });

        if (!errors) {
            this.emit('submitted', event);
            //TODO: Make authentication pluggable
            this.login();
        }
    };

    CoinsLogonWidget.DEFAULTS = {
        classNames: {
            root: 'coins-logon-widget'
        },
        formGroups: [{
            inputName: 'username',
            labelText: 'Username:',
            placeholder: ''
        }, {
            inputName: 'password',
            labelText: 'Password:',
            placeholder: '',
            type: 'password'
        }],
        hiddenLabels: false,
        horizontal: false,
        messages: {
            accountExpired: 'Your account has expired.',
            accountWillExpire: function(offset) {
                return 'Your account will expire in ' + offset + '.';
            },
            passwordExpired: 'Your password has expired.',
            passwordWillExpire: function(offset) {
                return 'Your password will expire in ' + offset + '.';
            }
        }
    };

    return CoinsLogonWidget;
}));
