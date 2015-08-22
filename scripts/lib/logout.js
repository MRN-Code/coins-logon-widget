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
        root.CoinsLogonWidget.Logout = factory(root.ObjectAssign.assign);
    }
}(this, function (assign) {

    'use strict';

    function Logout(options) {
        this.options = assign({}, Status.DEFAULTS, options);
        this.element = this._getElements();
    }

    Logout.prototype._getElements = function() {
        var button = document.createElement('button');
        var status = document.createElement('p');
        var wrapper = document.createElement('div');

        button.className = this.options.classNames.button;
        status.className = this.options.classNames.status;
        wrapper.className = this.options.classNames.form;

        button.textContent = this.options.buttonText;
        status.textContent = this.options.statusText;

        wrapper.appendChild(status);
        wrapper.appendChild(status);

        return wrapper;
    };

    Logout.DEFAULTS = {
        buttonText: 'Log Out',
        classNames: {
            button: 'coins-logon-widget-button coins-logon-widget-button-secondary',
            status: 'coins-logon-widget-status',
            wrapper: '',
        },
        statusText: 'Logged In!',
    };

    return Logout;
}));
