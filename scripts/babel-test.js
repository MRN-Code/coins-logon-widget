(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'eventemitter',
            'lodash/object/assign',
            'lodash/collection/forEach',
            './lib/auth',
            './lib/form',
            './lib/form-group'
        ], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(
            require('wolfy87-eventemitter'),
            require('lodash/object/assign'),
            require('lodash/collection/forEach'),
            require('./lib/auth'),
            require('./lib/form'),
            require('./lib/form-group')
        );
    } else {
        // Browser globals (root is window)
        root.CoinsLogonWidget = factory(
            EventEmitter,
            _.assign,
            _.forEach,
            CoinsLogonWidget.Auth,
            CoinsLogonWidget.Form,
            CoinsLogonWidget.FormGroup
        );
    }
}(this, function (EventEmitter, assign, forEach, Auth, Form, FormGroup) {
    class CoinsLogonWidget extends EventEmitter() {

    }

    return CoinsLogonWidget;
}));
