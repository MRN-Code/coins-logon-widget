/* global uniqueId */

class FormGroup {
    constructor(options) {
        this.options = assign({}, FormGroup.DEFAULTS, options);
        this.element = this._getFormElements();
        this.setState();
    }
    _getFormElements() {
        const classNames = this.options.classNames;
        const div = document.createElement('div');
        const id = uniqueId('coins-logon-widget-');
        const input = document.createElement('input');
        const label = document.createElement('label');

        div.className = classNames.formGroup;
        label.className = classNames.label;
        label.setAttribute('for', id);
        label.textContent = this.options.labelText;
        input.className = classNames.input;
        input.id = id;
        input.name = this.options.inputName;
        if (this.options.placeholder) {
            input.placeholder = this.options.placeholder;
        }
        if (this.options.required) {
            input.setAttribute('aria-required', true);
        }
        input.type = this.options.type;

        div.appendChild(label);
        div.appendChild(input);

        return div;
    }
    _getMessageElement(message) {
        const span = document.createElement('span');

        span.className = this.options.classNames.message;
        span.textContent = message;

        return span;
    }
    _getIconElement() {
        const span = document.createElement('span');

        span.className = this.options.classNames.icon;
        span.setAttribute('aria-hidden', true);

        return span;
    }
    setState(state = '', message = '') {
        const element = this.element;
        const classNames = this.options.classNames;
        const iconElement = element.querySelector(classNames.icon);
        const messageElement = element.querySelector(classNames.message);

        this.state = state;

        if (state) {
            // Add an icon if it doesn't exist
            if (!iconElement) {
                element.querySelector('input').after(this._getIconElement());
            }
            // Add a message if needed, otherwise remove
            if (!messageElement && message) {
                element.appendChild(this._getMessageElement(message));
            } else if (messageElement && message) {
                messageElement.textContent = message;
            } else {
                messageElement.parentNode.removeChild(messageElement);
            }

            // Handle state cases
            if (state === 'error') {
                element.classList.remove(classNames.success);
                element.classList.add(classNames.error);
            } else if (state === 'success') {
                element.classList.remove(classNames.error);
                element.classList.add(classNames.success);
            }
        } else {
            if (iconElement) {
                iconElement.parentNode.removeChild(iconElement);
            }
            if (messageElement) {
                messageElement.parentNode.removeChild(messageElement);
            }
            element.classList.remove(classNames.error);
            element.classList.remove(classNames.success);
        }
    }
    clearState() {
        this.setState();
    }
    getName() {
        return this.options.inputName;
    }
    getState() {
        return this.state;
    }
    getValue() {
        return this.element.querySelector('input').value;
    }
}

FormGroup.DEFAULTS = {
    classNames: {
        error: 'coins-logon-widget-form-group-error',
        formGroup: 'coins-logon-widget-form-group',
        icon: 'coins-logon-widget-icon',
        input: 'coins-logon-widget-input',
        label: 'coins-logon-widget-label',
        message: 'coins-logon-widget-input-message',
        success: 'coins-logon-widget-form-group-success'
    },
    inputName: 'name',
    labelText: 'Name:',
    placeholder: 'Ex: Pat Smith',
    required: true,
    type: 'text',
    validate: function() {
        const value = this.getValue();

        if (value.trim === '') {
            this.setState('error', 'Field empty!');
            return false;
        }

        return true;
    }
};
