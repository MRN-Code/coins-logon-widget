(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'es6-object-assign',
            './form-group',
            './utils'
        ], function(ObjectAssign, FormGroup, utils) {
            return factory(ObjectAssign.assign, FormGroup, utils);
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(
            require('es6-object-assign').assign,
            require('./form-group'),
            require('./utils')
        );
    } else {
        // Browser globals (root is window)
        root.CoinsLogonWidget = root.CoinsLogonWidget || {};
        root.CoinsLogonWidget.Form = factory(
            root.ObjectAssign.assign,
            root.CoinsLogonWidget.FormGroup,
            root.CoinsLogonWidget.utils
        );
    }
}(this, function (assign, FormGroup, utils) {
    'use strict';

    function Form(options) {
        options = options || {};

        this.options = assign({}, Form.DEFAULTS, options);
        // this.formGroups = this.options.formGroups.map(function(formGroupOptions) {
        //     return new FormGroup(formGroupOptions);
        // });
        this.element = this._getElements();
        this._setState(this.options.initialState);
    }

    Form.prototype._getElements = function() {
        var button = document.createElement('button');
        var form = document.createElement('form');

        console.log(this.options);

        form.className = this.options.classNames.form;

        if (this.options.horizontal) {
            form.classList.add(this.options.classNames.horizontal);
        }

        form.method = 'post';
        form.addEventListener(
            'submit',
            this._submitHandler.bind(this),
            false
        );

        button.className = this.options.classNames.button;
        button.type = 'submit';

        form.appendChild(button);

        return form;
    };

    Form.prototype._setState = function(state) {
        if (typeof this._state === 'undefined') {
            this._state = {};
        }

        var self = this;
        var button = this.element.querySelector('.' + this.options.classNames.button);
        var notification = this.element.querySelector('.' + this.options.classNames.notification);
        var status = this.element.querySelector('.' + this.options.classNames.status);
        var formGroups;

        assign(this._state, state);

        // Notification
        if (notification && !state.notification) {
            this.element.removeChild(notification);
        } else if (!notification && state.notification) {
            notification = document.createElement('div');
            notification.className = this.options.classNames.notification;
            notification.setAttribute('role', 'alert');
            this.element.insertBefore(notification, this.element.firstChild);
        }

        if (notification && state.notification) {
            notification.textContent = state.notification;

            notification.classList.remove(this.options.classNames.notificationError);
            notification.classList.remove(this.options.classNames.notificationSuccess);
            // TODO: Error and success are applied to the notification. This may not
            // make the most sense.
            if (state.error) {
                notification.classList.add(this.options.classNames.notificationError);
            } else if (state.success) {
                notification.classList.add(this.options.classNames.notificationSuccess);
            }
        }

        if (this._state.login) {
            // Add form groups
            if (!this.formGroups) {
                // TODO: This modifies the object. Make it more obvious
                this._setFormGroups();
                this.formGroups
                    .map(function(formGroup) {
                        return formGroup.element;
                    })
                    .reverse()
                    .forEach(function(formGroupElement){
                        self.element.insertBefore(
                            formGroupElement,
                            self.element.lastChild
                        );
                    });
            }
            if (status) {
                this.element.removeChild(status);
            }

            button.textContent = this.options.buttonLoginText;
            button.classList.remove(this.options.classNames.buttonSecondary);
            button.classList.add(this.options.classNames.buttonPrimary);
        } else {
            if (this.formGroups) {
                this._removeFormGroups();
            }

            // Status
            if (!status) {
                status = document.createElement('p');
                status.className = this.options.classNames.status;
                this.element.insertBefore(status, this.element.firstChild);
            }

            status.innerHTML = this._state.status || this.options.statusText;

            button.textContent = this.options.buttonLogoutText;
            button.classList.remove(this.options.classNames.buttonPrimary);
            button.classList.add(this.options.classNames.buttonSecondary);
        }
    };

    Form.prototype._submitHandler = function(event) {
        event.preventDefault();

        var login = this.options.login;
        var logout = this.options.logout;

        if (this._state.login && login instanceof Function) {
            login(event);
        } else if (logout instanceof Function) {
            logout(event);
        }
    };

    Form.prototype._setFormGroups = function() {
        this.formGroups = this.options.formGroups.map(function(options) {
            return new FormGroup(options);
        });
    };

    Form.prototype._removeFormGroups = function() {
        this.formGroups.forEach(function(formGroup) {
            formGroup.destroy();
        });

        delete this.formGroups;
    };

    Form.prototype.clearMessage = function() {
        this._setState({
            error: null,
            notification: null,
            success: null
        });
    };

    Form.prototype.destroy = function() {
        this.element.removeEventListener('submit', this._submitHandler, false);
        utils.removeElement(this.element);
        this._removeFormGroups();

        delete this.options;
    };

    Form.prototype.getFormData = function() {
        return this.formGroups.map(function(formGroup) {
            var data = {};
            data[formGroup.getName()] = formGroup.getValue();
            return data;
        });
    };

    Form.prototype.setErrorMessage = function(message) {
        this._setState({
            error: true,
            notification: message
        });
    };

    Form.prototype.setSuccessMessage = function(message) {
        this._setState({
            notification: message,
            success: true
        });
    };

    Form.prototype.setToLogin = function(message) {
        this._setState({
            login: true
        });
    };

    Form.prototype.setToLogout = function(statusText) {
        this._setState({
            login: false,
            status: statusText || null
        });
    };

    Form.prototype.validate = function() {
        var isValid;
        var validations;

        if (this.formGroups) {
            validations = this.formGroups.map(function(formGroup) {
                return formGroup.validate();
            });
            isValid = validations.every(function(validation) {
                return validation === true;
            });

            return isValid ? true : validations;
        }
    };

    Form.DEFAULTS = {
        buttonLoginText: 'Log In',
        buttonLogoutText: 'Log Out',
        classNames: {
            button: 'coins-logon-widget-button',
            buttonPrimary: 'coins-logon-widget-button-primary',
            buttonSecondary: 'coins-logon-widget-button-secondary',
            form: 'coins-logon-widget-form',
            horizontal: 'coins-logon-widget-form-horizontal',
            notification: 'coins-logon-widget-notification',
            notificationError: 'coins-logon-widget-notification-error',
            notificationSuccess: 'coins-logon-widget-notification-success',
            status: 'coins-logon-widget-status',
        },
        initialState: {
            error: null,
            login: true,
            notification: null,
            success: null,
        },
        statusText: 'Logged in'
    };

    return Form;
}));
