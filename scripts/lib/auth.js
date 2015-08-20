(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['cookies-js/dist/cookies', 'Ajax'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(
            require('cookies-js'),
            require('@fdaciuk/ajax')
        );
    } else {
        // Browser globals (root is window)
        root.CoinsLogonWidget = root.CoinsLogonWidget || {};
        root.CoinsLogonWidget.Auth = factory(root.cookies, root.Ajax);
    }
}(this, function (cookies, Ajax) {
    'use strict';

    /**
     * @todo  Move configuration, keys and cookie options out of module into a
     *        separate config file. Possibly inject configuration into `Auth`.
     */
    var config = {
        protocol: 'http',
        host: 'devcoin1.mrn.org',
        port: 3000,
        endpoint: '/auth'
    };

    var AUTH_STORAGE_KEY = 'coins-auth';
    var AUTH_COOKIE_KEY = 'CAS_Auth_User';

    var ajax =  new Ajax();

    var Auth = {
        check: function() {
            return ajax.get(
                getApiUrl('/cookies/' + cookies.get(AUTH_COOKIE_KEY))
            );
        },
        login: function(username, password) {
            return ajax.post(getApiUrl('/keys'), {
                username: btoa(username),
                password: btoa(password)
            });
        },
        logout: function() {
            return ajax.deletefetch(getApiUrl('/keys/' + id));
        }
    };

    /**
     * Add a forward slash to string.
     */
    function forwardSlashIt(string) {
        return string.charAt(0) !== '/' ? '/' + string : string;
    }

    /**
     * Get API URL.
     */
    function getApiUrl(endpoint) {
        var url = config.protocol + '://' + config.host;
        url += (config.port ? ':' + config.port : '');
        return url + config.endpoint + forwardSlashIt(endpoint);
    }

    /**
     * Get saved username and password.
     */
    function getCredentials() {
        return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    }

    /**
     * Set username and password.
     */
    function setCredentials(response) {
        var username = (response.body || {}).username || '';
        var password = (response.body || {}).password || '';

        if (username && password) {
            localStorage.setItem(
                AUTH_STORAGE_KEY,
                JSON.stringify({
                    username: username,
                    password: password
                })
            );
        }
    }

    /**
     * Clear saved credentials.
     */
    function clearCredentials() {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        cookies.expire(AUTH_COOKIE_KEY);
    }

    /**
     * Check HTTP status.
     * @{@link  https://github.com/github/fetch#handling-http-error-statuses}
     */
    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            var error = new Error(response.statusText);
            error.response = response;
            throw error;
        }
    }

    return Auth;
}));
