/* global assign */

class Form {
    constructor(options) {
        this.options = assign({}, Form.DEFAULTS, options);
        this.element = this._getFormElements();
    }
    _getFormElements() {
        const button = document.createElement('button');
        const classNames = this.options.classNames;
        const form = document.createElement('form');

        form.className = classNames.form;
        button.className = `${classNames.button} ${classNames.buttonPrimary}`;
        //TODO: Don't hard code button's text
        button.textContent = 'Log In';
        button.type = 'submit';

        form.appendChild(button);

        return form;
    }
    _getNotificationElement() {
        const notification = document.createElement('div');

        notification.className = this.options.classNames.notification;
        notification.setAttribute('role', 'alert');

        return notification;
    }
    setNotification(text = '', state = 'error') {
        //TODO: Can not set multiple notifications. Add this feature.
        this.clearNotification();

        if (!text) {
            return;
        }

        const notification = this._getNotificationElement();
        notification.textContent = text;

        if (state === 'error') {
            notification.classList.add(classNames.notificationError);
        } else if (state === 'success') {
            notification.classList.add(classNames.notificationSuccess);
        }

        //TODO: fix
        this.element.prepend(notification);
    }
    clearNotification() {
        const notification = this.element.querySelector(
            this.options.classNames.notification
        );

        if (notification) {
            notification.parentNode.removeChild(notification);
        }
    }
}
Form.DEFAULTS = {
    classNames: {
        button: '',
        buttonPrimary: '',
        form: '',
        notification: 'coins-logon-widget-notification',
        notificationError: 'coins-logon-widget-notification-error',
        notificationSuccess: 'coins-logon-widget-notification-success'
    }
};
