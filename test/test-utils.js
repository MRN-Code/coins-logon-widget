'use strict';

var assign = require('lodash/object/assign');
var CoinsLogonWidget = require('../scripts/coins-logon-widget');
var cookies = require('js-cookie');
var jQuery = require('jquery');
var uniqueId = require('lodash/utility/uniqueId');

var defaults = {
    authCookieName: 'coins-cookie-nom-noms',
    baseUrl: 'coins-api-root',
};

function widgetFactory(options) {
    if (typeof options === 'undefined') {
        options = {};
    }

    if (!('el' in options) || !options.el) {
        options.el = document.createElement('div');
        options.el.id = uniqueId();
        jQuery('body').append(options.el);
    }

    return new CoinsLogonWidget(assign({}, defaults, options));
}

function teardownWidget(widget) {
    if (!(widget instanceof CoinsLogonWidget)) {
        throw new ReferenceError('Expected instance of CoinsLogonWidget');
    }

    // Remove cookie
    cookies.remove(widget._options.authCookieName);

    // Clear stored authentication
    // TODO: Export auth key in 'auth' module
    localStorage.removeItem('AUTH_CREDENTIALS_KEY');

    widget.destroy();
}

function setWidgetFields(opts) {
    var $widget = jQuery(opts.widget.element);

    $widget.find('input[name=username]').val(opts.username);
    $widget.find('input[name=password]').val(opts.password);
}

module.exports = {
    setWidgetFields: setWidgetFields,
    teardownWidget: teardownWidget,
    widgetFactory: widgetFactory,
};
