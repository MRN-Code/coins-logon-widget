(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'cookies-js/dist/cookies',
            'Ajax',
            'nodeapi/test/sdk/index'
        ], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(
            require('cookies-js'),
            require('@fdaciuk/ajax'),
            require('nodeapi/test/sdk')
        );
    } else {
        // Browser globals (root is window)
        root.CoinsLogonWidget = root.CoinsLogonWidget || {};
        root.CoinsLogonWidget.Auth = factory(
            root.cookies,
            root.Ajax,
            root.CoinsApiClient
        );
    }
}(this, function (cookies, Ajax, Client) {
    'use strict';

    var ajax =  new Ajax();

    // Set up client
    var client = Client({
        baseUrl: 'https://devcoin1.mrn.org:8443/api',
        formatResponseCallback: function(response) {
            return response;
        },
        requestFn: function(options) {
            var body = options.body || {};
            var headers = options.headers || {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                };
            var method = options.method || 'get';
            var url = options.uri || '';

            return new Promise(function(resolve, reject) {
                var args = [url];

                if (body) {
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
        }
    });

    return client.auth;
}));
