/* jshint esnext:true, global EventEmitter,Form,FormGroup,assign,forEach,uniqueId */

class CoinsLogonWidget extends EventEmitter {
    constructor(element, options = {}) {
        super();

        if (!element) {
            throw new Error('Element required');
        } else if (!(element instanceof Node)) {
            // Make sure `element` is an actual node
            // http://stackoverflow.com/a/384380
            throw new Error('Expected element to be a DOM node');
        }

        this.element = element;
        this.options = assign({}, CoinsLogonWidget.DEFAULTS, options);

        this._setElements();
        this._setEvents();
    }
    _setElements() {
        const form = new Form();
        const formGroups = [{
            inputName: 'username',
            labelText: 'Username:'
        }, {
            inputName: 'password',
            labelText: 'Password:',
            type: 'password'
        }].map(options => new FormGroup(options));

        // Make sure there's no children
        this.element.innerHTML = '';


        this.element.appendChild(formElement);
    }
    _setEvents() {
        const form = this.element.querySelector('form');
        const inputs = this.element.querySelectorAll('input');

        form.addEventListener('submit', this.onSubmit, false);
        this.element.on('error', this.onError);

        'blur focus keydown keypress keyup'.split(' ').forEach(eventType => {
            forEach(inputs, input => {
                input.addEventListener(eventType, event => {
                    this.emit(eventType, event);
                }, false);
            });
        });
    }
    onError(error) {
        let message = error.message || error.toString();
        this.emit('error', error);
        //TODO: Change component's `setNotification` parameters to make more sense
        this.form.setNotification(message, true);
    }
    onSubmit(event) {
        event.preventDefault();

        this.emit('submit', event);

        let errors;

        this.formGroups.forEach(formGroup => {
            const isRequired = formGroup.options.required;
            const validate = formGroup.options.validate;
            let isValid;

            if (isRequired && validate instanceof Function) {
                isValid = validate();
            }

            if (!isValid) {
                errors = true;
            }
        });

        // if (!errors) {
        //     this.emit('submitted');
        //     this.makeRequest();
        // } else {
        //     this.emit('validationError', {});
        // }
    }
    // makeRequest() {
    //     const inputs = this.element.getElementsByTagName('input');
    //     const username = inputs[0].value;
    //     const password = inputs[1].value;
    //
    //     auth.login(username, password)
    //         .then(response => {
    //             console.log(response);
    //         })
    //         .catch(error => console.error(error));
    // }
}

CoinsLogonWidget.DEFAULTS = {
    classNames: {
        root: 'coins-logon-widget',
        form: 'coins-logon-widget-form',
        input: 'coins-logon-widget-input',
        label: 'coins-logon-widget-label',
        formGroup: 'coins-logon-widget-form-group',
        icon: 'coins-logon-widget-icon',
        message: 'coins-logon-widget-input-message',
        buttonGroup: 'coins-logon-widget-button-group',
        button: 'coins-logon-widget-button',
        buttonPrimary: 'coins-logon-widget-button-primary',
        buttonSecondary: 'coins-logon-widget-button-secondary',
        error: 'coins-logon-widget-form-group-error',
        success: 'coins-logon-widget-form-group-success'
    },
    formGroups: [{
        inputName: 'username',
        labelText: 'Username:',
        required: true
    }, {
        inputName: 'password',
        labelText: 'Password:',
        required: true,
        type: 'password'
    }],
    messages: {
        error: 'Field empty'
    }
};

// Get the entire form
function formFactory({
    action,
    buttonText,
    classNames,
    formGroups,
    method
}) {
    const form = document.createElement('form');
    const button = document.createElement('button');
    const formGroupsElements = formGroups
        .map(formGroup => {
            formGroup.id = uniqueId('coins-logon-widget-');
            formGroup.classNames = classNames;
            return formGroup;
        })
        .map(formGroupFactory);

    form.action = action;
    form.className = classNames.form;
    form.method = method;
    button.className = `${classNames.button} ${classNames.buttonPrimary}`;
    //TODO: Don't hard code button's text
    button.textContent = 'Log In';
    button.type = 'submit';

    formGroupsElements.forEach(formGroup => form.appendChild(formGroup));
    form.appendChild(button);

    return form;
}

// Get a single form group
function formGroupFactory({
    classNames,
    id,
    inputName,
    labelText,
    placeholder,
    required,
    type = 'text'
}) {
    const div = document.createElement('div');
    const label = document.createElement('label');
    const input = document.createElement('input');

    div.className = classNames.formGroup;
    label.className = classNames.label;
    label.setAttribute('for', id);
    label.textContent = labelText;
    input.className = classNames.input;
    input.id = id;
    input.name = inputName;
    if (placeholder) {
        input.placeholder = placeholder;
    }
    if (required) {
        input.setAttribute('aria-required', true);
    }
    input.type = type;

    div.appendChild(label);
    div.appendChild(input);

    return div;
}

function formMessageFactory({ classNames, message }) {
    const span = document.createElement('span');

    span.className = classNames.message;
    span.textContent = message;

    return span;
}

function formIconFactory({ classNames }) {
    const span = document.createElement('span');

    span.className = classNames.icon;
    span.setAttribute('aria-hidden', true);

    return span;
}
