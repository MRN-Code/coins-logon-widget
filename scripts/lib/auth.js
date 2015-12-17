'use strict';
var assign = require('lodash/object/assign');
var cookies = require('js-cookie');
var hawk = require('hawk/lib/browser');

/** Authentication credentials key for localStorage. */
var AUTH_CREDENTIALS_KEY = 'COINS_AUTH_CREDENTIALS';

/** Local holder for options. */
var options = {
    authCookieName: '',
    baseUrl: '',
};

/**
 * Clear malformed cookies.
 *
 * This addresses a bug introduced in the logon widget where `Auth.logout()`
 * cleared the auth cookie's name and set its value to 'REMOVED'. This malformed
 * cookie caused the API server to error.
 *
 * @todo  Remove from widget code after release of v0.38.0 into production.
 */
if (document.cookie.split('; ').indexOf('REMOVED') !== -1) {
    document.cookie = '=REMOVED;path=/;domain=.mrn.org;' +
        'expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

/**
 * Get saved authentication credentials.
 *
 * @return {object}
 */
function getAuthCredentials() {
    return JSON.parse(localStorage.getItem(AUTH_CREDENTIALS_KEY));
}

/**
 * Set authentication credentials.
 *
 * @param  {object} credentials
 * @return {object}
 */
function setAuthCredentials(credentials) {
    localStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify(credentials));
    return getAuthCredentials();
}

/**
 * Get Hawk authentication credentials.
 *
 * @param  {string} url
 * @param  {string} method
 * @param  {object} credentials
 * @return {object}
 */
function getHawkHeaders(url, method, credentials) {
    var header = hawk.client.header(
        url,
        method,
        { credentials:  credentials }
    );

    return {
        Authorization: header.field,
    };
}

/**
 * Get a formatted API URL.
 *
 * @param  {string} endpoint
 * @return {string}
 */
function getApiUrl(endpoint) {
    var options = getOptions();
    return options.baseUrl + endpoint;
}

/**
 * Remove the authentication cookie
 *
 * @{@link  https://github.com/js-cookie/js-cookie}
 *
 * @return {undefined}
 */
function removeAuthCookie() {
    var authCookieName = getOptions().authCookieName;
    var hostPieces = location.hostname.split('.');
    var options = {
        path: '/'
    };

    if (hostPieces.length > 2) {
        options.domain = '.' + hostPieces.slice(-2).join('.');
    } else {
        options.domain = hostPieces.join('.');
    }

    if (options) {
        cookies.remove(authCookieName, options);

        /**
         * Try again, because sometimes the `options` are bad and don't result
         * in a reset cookie.
         *
         * @todo  Figure out how to use only one `cookies` call.
         */
        cookies.remove(authCookieName);
    } else {
        cookies.remove(authCookieName);
    }
}

/**
 * Get options.
 *
 * @return {object}
 */
function getOptions() {
    return options;
}

/**
 * Set options.
 *
 * @param  {object} newOptions
 * @return {object}
 */
function setOptions(newOptions) {
    assign(options, newOptions);
    return getOptions();
}

/**
 * Map API's successful response.
 *
 * @param  {object} response API response object
 * @return {object}
 */
function mapApiSuccess(response) {
    return response.data[0];
}

/**
 * Map API's error reponse.
 *
 * @param  {jqXHR}  error
 * @return {object}
 */
function mapApiError(error) {
    var statusText = error.statusText;
    var message;
    if (error.responseText) {
        message = (JSON.parse(error.responseText) || {});
        message = (message.error || {}).message || '';
    }

    return message || statusText || 'Unknown error';
}

/**
 * Log in.
 *
 * @param  {string}  username
 * @param  {string}  password
 * @return {Promise}
 */
function login(username, password) {
    var deferred = jQuery.Deferred();

    jQuery.ajax({
        data: {
            password: btoa(password),
            username: btoa(username),
        },
        dataType: 'json',
        type: 'POST',
        url: getApiUrl('/auth/keys'),
        xhrFields: {
            withCredentials: true
        },
    })
        .done(function(response) {
            var credentials = mapApiSuccess(response);
            setAuthCredentials(credentials);
            deferred.resolve(credentials);
        })
        .fail(function(error) {
            deferred.reject(mapApiError(error));
        });

    return deferred.promise();
}

/**
 * Log out.
 *
 * @param {function} cb Callback to fire once stored auth credentials have been
 *                      cleared. This is primarily for testing.
 * @return {Promise}
 */
function logout(cb) {
    var deferred = jQuery.Deferred();
    var credentials = getAuthCredentials();
    var method = 'DELETE';
    var url = getApiUrl('/auth/keys/' + credentials.id);

    jQuery.ajax({
        dataType: 'json',
        headers: getHawkHeaders(url, method, credentials),
        type: method,
        url: url,
        xhrFields: {
            withCredentials: true
        },
    })
        .done(function(response) {
            deferred.resolve(mapApiSuccess(response));
        })
        .fail(function(error) {
            deferred.reject(mapApiError(error));
        })
        .always(function() {
            removeAuthCookie();
            setAuthCredentials({
                date: Date.now(),
                status: 'logged out',
            });

            if (cb instanceof Function) {
                cb();
            }
        });

    return deferred.promise();
}

/**
 * Public API.
 */
module.exports = {
    getOptions: getOptions,
    setOptions: setOptions,
    login: login,
    logout: logout,
};
