(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(
            ['es6-object-assign', 'unique-number'],
            function(ObjectAssign, UniqueNumber) {
                return factory(ObjectAssign.assign, UniqueNumber);
            }
        );
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(
            require('es6-object-assign').assign,
            require('unique-number')
        );
    } else {
        // Browser globals (root is window)
        root.CoinsLogonWidget = root.CoinsLogonWidget || {};
        root.CoinsLogonWidget.FormGroup = factory(
            root.ObjectAssign.assign,
            root.UniqueNumber
        );
    }
}(this, function (assign, UniqueNumber) {
    var uniqueNumber = new UniqueNumber();

    function uniqueId(string) {
        if (typeof string !== 'string') {
            string = '';
        }
        return string + uniqueNumber.generate();
    }

    function FormGroup(options) {
        options = options || {};

        this.options = assign({}, FormGroup.DEFAULTS, options);
        this.element = this._getFormElements();
        this.setState();
    }

    FormGroup.prototype._getFormElements = function() {
        var classNames = this.options.classNames;
        var div = document.createElement('div');
        var id = uniqueId('coins-logon-widget-');
        var input = document.createElement('input');
        var label = document.createElement('label');

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
    };

    FormGroup.prototype._getMessageElement = function(message) {
        var span = document.createElement('span');

        span.className = this.options.classNames.message;
        span.textContent = message;

        return span;
    };

    FormGroup.prototype._getIconElement = function() {
        var span = document.createElement('span');

        span.className = this.options.classNames.icon;
        span.setAttribute('aria-hidden', true);

        return span;
    };

    FormGroup.prototype.setState = function(state, message) {
        var self = this;
        var element = this.element;
        var classNames = this.options.classNames;
        var inputElement = element.querySelector('.' + classNames.input);
        var iconElement = element.querySelector('.' + classNames.icon);
        var messageElement = element.querySelector('.' + classNames.message);

        this.state = state;

        if (state) {
            // Add an icon if it doesn't exist
            if (!iconElement) {
                element.appendChild(this._getIconElement());
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

            inputElement.addEventListener('keydown', function(event) {
                self.clearState();
                event.target.removeEventListener(event.type, arguments.callee);
            }, false);
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

    FormGroup.prototype.clearState = function() {
        this.setState();
    };

    FormGroup.prototype.getName = function() {
        return this.options.inputName;
    };

    FormGroup.prototype.getState = function() {
        return this.state;
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
                this.setState('error', isValid);
                return false;
            }
        }

        return true;
    };

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
        validate: function(value) {
            if (value.trim() === '') {
                return 'Field empty!';
            }

            return true;
        }
    };

    return FormGroup;
}));
