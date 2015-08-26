(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'es6-object-assign',
            'Ajax',
            'nodeapi/test/sdk/index'
        ], function(ObjectAssign, Ajax, CoinsApiClient) {
            return factory(
                ObjectAssign.assign,
                Ajax,
                CoinsApiClient,
                '%NODEAPI_BASEURL%',
                '%NODEAPI_VERSION%'
            );
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(
            require('es6-object-assign').assign,
            require('@fdaciuk/ajax'),
            require('nodeapi/test/sdk'),
            require('config').baseUrl,
            require('nodeapi/package.json').version
        );
    } else {
        // Browser globals (root is window)
        root.CoinsLogonWidget = root.CoinsLogonWidget || {};
        root.CoinsLogonWidget.Auth = factory(
            root.ObjectAssign.assign,
            root.Ajax,
            root.CoinsApiClient,
            '%NODEAPI_BASEURL%',
            '%NODEAPI_VERSION%'
        );
    }
}(this, function (assign, Ajax, Client, baseUrl, version) {
    'use strict';

    var ajax =  new Ajax();

    var DEFAULTS = {
        baseUrl: baseUrl,
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
        version: version
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
