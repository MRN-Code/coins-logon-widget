(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['es6-object-assign'], function(ObjectAssign) {
            return factory(ObjectAssign.assign);
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('es6-object-assign').assign);
    } else {
        // Browser globals (root is window)
        root.CoinsLogonWidget = root.CoinsLogonWidget || {};
        root.CoinsLogonWidget.Form = factory(root.ObjectAssign.assign);
    }
}(this, function (assign) {
    'use strict';

    function Form(options) {
        options = options || {};

        this.options = assign({}, Form.DEFAULTS, options);
        this.element = this._getFormElements();
    }

    Form.prototype._getFormElements = function() {
        var button = document.createElement('button');
        var classNames = this.options.classNames;
        var form = document.createElement('form');

        form.className = classNames.form;
        button.className = classNames.button + ' ' + classNames.buttonPrimary;
        //TODO: Don't hard code button's text
        button.textContent = 'Log In';
        button.type = 'submit';

        form.appendChild(button);

        return form;
    };

    Form.prototype._getNotificationElement = function() {
        var notification = document.createElement('div');

        notification.className = this.options.classNames.notification;
        notification.setAttribute('role', 'alert');

        return notification;
    };

    Form.prototype.setNotification = function(text, state) {
        //TODO: Can not set multiple notifications. Add this feature.
        this.clearNotification();

        if (!text) {
            return;
        }

        var notification = this._getNotificationElement();
        notification.textContent = text;

        if (state === 'error') {
            notification.classList.add(this.options.classNames.notificationError);
        } else if (state === 'success') {
            notification.classList.add(this.options.classNames.notificationSuccess);
        }

        this.element.insertBefore(notification, this.element.firstChild);
    };

    Form.prototype.clearNotification = function() {
        var notification = this.element.querySelector(
            '.' + this.options.classNames.notification
        );

        if (notification) {
            notification.parentNode.removeChild(notification);
        }
    };

    Form.DEFAULTS = {
        classNames: {
            button: 'coins-logon-widget-button',
            buttonPrimary: 'coins-logon-widget-button-primary',
            form: 'coins-logon-widget-form',
            notification: 'coins-logon-widget-notification',
            notificationError: 'coins-logon-widget-notification-error',
            notificationSuccess: 'coins-logon-widget-notification-success'
        }
    };

    return Form;
}));
