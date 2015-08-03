/* jshint esnext:true */
import EventEmitter from 'wolfy87-eventemitter';
import {
    formFactory,
    formMessageFactory,
    formIconFactory
} from './form-factories';
import { assign, forEach } from 'lodash';

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

        this.createElements().setupEvents();
    }
    createElements() {
        let form;

        // Make sure there's no children
        this.element.innerHTML = '';

        this.element.className = this.options.classNames.root;

        form = formFactory({
            action: '/',
            buttonText: 'Log In',
            classNames: this.options.classNames,
            formGroups: this.options.formGroups,
            method: 'get',
        });

        this.element.appendChild(form);

        return this;
    }
    setupEvents() {
        let form = this.element.getElementsByTagName('form')[0];
        let inputs = this.element.getElementsByTagName('input');

        form.addEventListener('submit', event => {
            event.preventDefault();
            this.onSubmit(event);
        }, false);
        'blur focus keydown keypress keyup'.split(' ').forEach(eventType => {
            forEach(inputs, input => {
                input.addEventListener(eventType, event => {
                    this.emit(eventType, event);
                }, false);
            });
        });

        return this;
    }
    onError(error) {
        this.emit('error', error);
        console.warn(error);
    }
    onSubmit(event) {
        this.emit('submit', event);
        const inputs = this.element.getElementsByTagName('input');
        let errors;
        const classNames = this.options.classNames;

        forEach(inputs, input => {
            const formGroup = input.parentNode;

            //TODO: Make this validation pluggable
            if (!input.value) {
                errors = true;
                formGroup.classList.add(classNames.error);
                formGroup.appendChild(formIconFactory({ classNames }));
                formGroup.appendChild(
                    formMessageFactory({
                        classNames,
                        message: this.options.messages.error
                    })
                );

                this.on('focus', event => {
                    let formGroup = event.target.parentNode;
                    let elementsToRemove = formGroup.querySelectorAll(
                        `.${classNames.icon}, .${classNames.message}`
                    );

                    formGroup.classList.remove(classNames.error);
                    forEach(elementsToRemove, element => {
                        element.parentNode.removeChild(element);
                    });

                    // Remove listener if the target is the error'd input
                    if (event.target === input) {
                        return true;
                    }
                });
            } else {
                formGroup.classList.add(classNames.success);
            }
        });

        if (!errors) {
            this.emit('submitted');
            this.makeRequest();
        } else {
            this.emit('validationError', {});
        }

        if (!errors) {
            this.makeRequest();
        }
    }
    makeRequest() {

    }
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

export default CoinsLogonWidget;
