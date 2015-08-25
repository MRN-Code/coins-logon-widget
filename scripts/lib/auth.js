(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'cookies-js/dist/cookies',
            'es6-object-assign',
            'Ajax',
            'nodeapi/test/sdk/index'
        ], function(cookies, ObjectAssign, Ajax, CoinsApiClient) {
            return factory(cookies, ObjectAssign.assign, Ajax, CoinsApiClient);
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(
            require('cookies-js'),
            require('es6-object-assign').assign,
            require('@fdaciuk/ajax'),
            require('nodeapi/test/sdk')
        );
    } else {
        // Browser globals (root is window)
        root.CoinsLogonWidget = root.CoinsLogonWidget || {};
        root.CoinsLogonWidget.Auth = factory(
            root.cookies,
            root.ObjectAssign.assign,
            root.Ajax,
            root.CoinsApiClient
        );
    }
}(this, function (cookies, assign, Ajax, Client) {
    'use strict';

    var ajax =  new Ajax();

    var DEFAULTS = {
        baseUrl: 'http://localhost:8443/api',
        formatResponseCallback: function(response) {
            return response;
        },
        requestFn: function(options) {
            var body = options.body || {};
            var method = options.method || 'get';
            var url = options.uri || '';

            return new Promise(function(resolve, reject) {
                var args = [url];

                if (body && Object.keys(body).length) {
                    args.push(body);
                }

                ajax[method.toLowerCase()].apply(null, args)
                    .done(function(res, xhr) {
                        resolve({
                            body: {
                                data: res.data
                            },
                            statusCode: xhr.status
                        });
                    })
                    .error(function(res) {
                        reject(res.error);
                    });
            });
        },
        version: '%NODEAPI_VERSION%'
    };

    return function(options) {
        if (typeof options === 'undefined') {
            options = {};
        }

        // Set up client
        var client = Client(assign({}, DEFAULTS, options));

        return client.auth;
    };
}));
