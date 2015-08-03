/* jshint esnext:true */
import { uniqueId } from 'lodash';
import CoinsLogonWidget from './CoinsLogonWidget';

// Get the entire form
export function formFactory({
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
export function formGroupFactory({
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

export function formMessageFactory({ classNames, message }) {
    const span = document.createElement('span');

    span.className = classNames.message;
    span.textContent = message;

    return span;
}

export function formIconFactory({ classNames }) {
    const span = document.createElement('span');

    span.className = classNames.icon;
    span.setAttribute('aria-hidden', true);

    return span;
}
