'use strict';
var assign = require('es6-object-assign').assign;
var hawk = require('hawk/lib/browser');


/** Authentication credentials key for localStorage. */
var AUTH_CREDENTIALS_KEY = 'COINS_AUTH_CREDENTIALS';

/** Local holder for options. */
var options = {
    baseUrl: ''
};

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
 * @return {undefined}
 */
function removeAuthCookie() {
    var cookieValue = 'REMOVED';
    var domain = '.mrn.org';
    var path = '/';
    var name = getOptions().authCookieName;
    document.cookie = [
        name,
        '=',
        cookieValue,
        '; Path=',
        path,
        '; Domain=',
        domain,
        ';'
    ].join('');
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
 * @return {Promise}
 */
function logout() {
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
            return setAuthCredentials({
                date: Date.now(),
                status: 'logged out',
            });
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
