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
 * Remove authentication.
 *
 * Clear the authentication cookie and credentials stored in localStorage. Acts
 * as an identity function for use with API calls.
 *
 * @{@link  https://github.com/js-cookie/js-cookie}
 *
 * @return {*} Same argument(s) passed in (identity)
 */
function removeAuth() {
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

    /** Clear auth cookie */
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

    /** Remove stored credentials */
    setAuthCredentials({
        date: Date.now(),
        status: 'logged out',
    });

    return [].slice.call(arguments);
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
 * @return {jQuery.Deferred} Filtered response of `jQuery.ajax` call.
 */
function logout() {
    var credentials = getAuthCredentials();
    var method = 'DELETE';
    var url = getApiUrl('/auth/keys/' + credentials.id);

    return jQuery.ajax({
        dataType: 'json',
        headers: getHawkHeaders(url, method, credentials),
        type: method,
        url: url,
        xhrFields: {
            withCredentials: true
        },
    })
        .then(mapApiSuccess, mapApiError)
        .then(removeAuth, removeAuth);
}

/**
 * Check if user is logged in.
 *
 * @return {jQuery.Deferred} Resolves with the value `true` if the user is
 *                           logged in, `false` if the user isn't logged in.
 *                           Rejects if the `jQuery.ajax` network call errors.
 */
function isLoggedIn() {
    var authCookie = cookies.get(getOptions().authCookieName);
    var credentials = getAuthCredentials();
    var method;
    var url;

    if (
        !authCookie ||
        !credentials ||
        (
            credentials instanceof Object &&
            (!('id' in credentials) || !('key' in credentials))
        )
    ) {
        return jQuery.Deferred().resolve(false);
    }

    method = 'GET';
    url = getApiUrl('/auth/cookies/' + authCookie);

    return jQuery.ajax({
        dataType: 'json',
        type: method,
        url: url,
        xhrFields: {
            withCredentials: true
        },
    })
        .then(function(response) {
            return ('error' in response && !response.error);
        }, function() {

            return false;
        });
}

/**
 * Public API.
 */
module.exports = {
    getOptions: getOptions,
    setOptions: setOptions,
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
};
