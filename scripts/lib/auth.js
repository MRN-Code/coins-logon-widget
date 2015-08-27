(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'es6-object-assign',
            'nodeapi/test/sdk/index'
        ], function(ObjectAssign, CoinsApiClient) {
            return factory(
                ObjectAssign.assign,
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
            require('nodeapi/test/sdk'),
            require('config').baseUrl,
            require('nodeapi/package.json').version
        );
    } else {
        // Browser globals (root is window)
        root.CoinsLogonWidget = root.CoinsLogonWidget || {};
        root.CoinsLogonWidget.Auth = factory(
            root.ObjectAssign.assign,
            root.CoinsApiClient,
            '%NODEAPI_BASEURL%',
            '%NODEAPI_VERSION%'
        );
    }
}(this, function (assign, Client, baseUrl, version) {
    'use strict';

    var DEFAULTS = {
        baseUrl: baseUrl,
        formatResponseCallback: function(response) {
            return response;
        },
        requestFn: function(options) {
            var body = options.body || {};
            var method = options.method || 'GET';
            var url = options.uri || '';

            return new Promise(function(resolve, reject) {
                var options = {
                    url: url,
                    type: method,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data, textStatus, jqXHR) {
                        resolve({
                            body: {
                                data: data.data
                            },
                            statusCode: jqXHR.status
                        });
                    },
                    error: function(jqXHR) {
                        var statusText = jqXHR.statusText;
                        var message= (JSON.parse(jqXHR.responseText) || {});
                        message = (message.error || {}).message || '';
                        reject(message || statusText);
                    }
                };

                if (body && Object.keys(body).length) {
                    options.data = body;
                }

                jQuery.ajax(options);
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
