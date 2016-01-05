'use strict';

function assertElement(element) {
    if (!element) {
        throw new TypeError('Element required');
    } else if (!(element instanceof Node)) {
        // Make sure `element` is an actual node
        // http://stackoverflow.com/a/384380
        throw new TypeError('Expected element to be a DOM node');
    }

    return element;
}

function assertString(str, prop) {
    if (!str || typeof str !== 'string') {
        throw new TypeError([
            'expected string',
            prop ? ' (' + prop + ')' : '',
            ', received: ',
            str.toString()
        ].join(''));
    }

    return str;
}

/**
 * Call or return a maybe callable argument.
 *
 * @param  {mixed} maybeCallable A callable or other primitive that should
 *                               either be called with arguments or simply
 *                               returned.
 * @param  {array} args          Arguments to pass to `maybeCallable` if
 *                               it is callable.
 * @return {mixed}               Result of `maybeCallable` if it was
 *                               callable, otherwise just the value itself.
 */
function callOrReturn(maybeCallable, args) {
    if (maybeCallable instanceof Function) {
        return maybeCallable.apply(null, args);
    }

    return maybeCallable;
}

/**
 * Format day string.
 *
 * @param  {number} day
 * @return {string}
 */
function formatDay(day) {
    if (day < 1) {
        return 'less than 1 day';
    } else {
        return '' + Math.ceil(day) + ' days';
    }
}

module.exports = {
    assertElement: assertElement,
    assertString: assertString,
    callOrReturn: callOrReturn,
    formatDay: formatDay,
};
