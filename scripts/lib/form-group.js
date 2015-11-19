'use strict';
var assign = require('es6-object-assign').assign;
var utils = require('./utils');

'use strict';

function FormGroup(options) {
    options = options || {};

    this.options = assign({}, FormGroup.DEFAULTS, options);
    this.element = this._getElements();
    this._setState();
}

FormGroup.prototype._getElements = function() {
    var classNames = this.options.classNames;
    var div = document.createElement('div');
    var id = utils.uniqueId('coins-logon-widget-');
    var input = document.createElement('input');
    var label = document.createElement('label');

    div.className = classNames.formGroup;
    label.className = classNames.label;
    label.setAttribute('for', id);
    label.textContent = this.options.labelText;
    input.className = classNames.input;
    input.id = id;
    input.name = this.options.inputName;
    input.type = this.options.type;

    if (this.options.hiddenLabel) {
        label.classList.add(classNames.hidden);
        input.placeholder = this.options.placeholder || this.options.labelText;
    } else {
        if (this.options.placeholder) {
            input.placeholder = this.options.placeholder;
        }
        if (this.options.required) {
            input.setAttribute('aria-required', true);
        }
    }

    div.appendChild(label);
    div.appendChild(input);

    return div;
};

FormGroup.prototype._setState = function(state) {
    if (typeof this._state === 'undefined') {
        this._state = {};
    }

    var self = this;
    var element = this.element;
    var classNames = this.options.classNames;
    var inputElement = element.querySelector('.' + classNames.input);
    var iconElement = element.querySelector('.' + classNames.icon);
    var messageElement = element.querySelector('.' + classNames.message);

    assign(this._state, state);

    if (this._state.message || this._state.error || this._state.success) {
        // Add an icon if it doesn't exist
        if (!iconElement) {
            iconElement = document.createElement('span');
            iconElement.className = this.options.classNames.icon;
            iconElement.setAttribute('aria-hidden', true);
            element.appendChild(iconElement);
        }
        // Add a message if needed, otherwise remove
        if (!messageElement && this._state.message) {
            messageElement = document.createElement('span');
            messageElement.className = this.options.classNames.message;
            element.appendChild(messageElement);
        } else if (!this._state.message) {
            messageElement.parentNode.removeChild(messageElement);
        }
        if (messageElement && this._state.message) {
            messageElement.textContent = this._state.message;
        }

        // Handle state cases
        if (this._state.error) {
            element.classList.remove(classNames.success);
            element.classList.add(classNames.error);
        } else if (this._state.success) {
            element.classList.remove(classNames.error);
            element.classList.add(classNames.success);
        }

        utils.once(inputElement, 'keydown', function() {
            self._setState({
                error: null,
                message: null,
                success: null
            });
        });
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
};

//TODO: Remove potential `input` listeners
FormGroup.prototype.destroy = function() {
    utils.removeElement(this.element);

    delete this._state;
    delete this.options;
};

FormGroup.prototype.getName = function() {
    return this.options.inputName;
};

FormGroup.prototype.getValue = function() {
    return this.element.querySelector('input').value;
};

FormGroup.prototype.validate = function() {
    var value = this.getValue();
    var validator = this.options.validate;
    var isValid;

    if (this.options.required && validator instanceof Function) {
        isValid = validator(value);

        if (isValid !== true) {
            this._setState({
                error: true,
                message: isValid
            });
            return false;
        }
    }

    return true;
};

FormGroup.DEFAULTS = {
    classNames: {
        error: 'coins-logon-widget-form-group-error',
        formGroup: 'coins-logon-widget-form-group',
        hidden: 'coins-logon-widget-visuallyhidden',
        icon: 'coins-logon-widget-icon',
        input: 'coins-logon-widget-input',
        label: 'coins-logon-widget-label',
        message: 'coins-logon-widget-input-message',
        success: 'coins-logon-widget-form-group-success'
    },
    hiddenLabel: false,
    inputName: 'name',
    labelText: 'Name:',
    placeholder: '',
    required: true,
    type: 'text',
    validate: function(value) {
        if (value.trim() === '') {
            return 'Field empty!';
        }

        return true;
    }
};

module.exports = FormGroup;
