/* jshint esnext:true */
import { toByteArray as base64 } from 'base64-js';
import { api } from '../config';
import cookies from 'browser-cookies';
import fetch from 'whatwg-fetch';

const AUTH_STORAGE_KEY = 'coins-auth';
const AUTH_COOKIE_NAME = 'coins-auth';

/**
 * Cookie options.
 * @{@link  https://github.com/voltace/browser-cookies#options}
 * @type {Object}
 */
const cookieOptions = {
    expires: 30,
    domain: '',
    secure: true
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
    let url = `${api.protocol}://${api.host}` + api.port ? `:${api.port}` : '';
    return url + api.endpoint + forwardSlashIt(endpoint);
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
function setCredentials({ body = { username, password }, headers = {} } = {}) {
    if (username && password) {
        localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({ username, password })
        );
    }
    if (headers['My-Auth-Header']) {
        cookies.set(
            AUTH_COCKIES_NAME,
            headers['My-Auth-Header'],
            cookieOptions
        );
    }
}

/**
 * Clear saved credentials.
 */
function clearCredentials() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    cookies.erase(AUTH_COOKIES_NAME);
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

export function check(id) {
    return fetch(getApiUrl(`/cookies/${id}`))
        .then(checkStatus);
}

export function login(username, password) {
    return fetch(getApiUrl('/keys'), {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: base64(username),
            password: base64(password)
        })
    })
        .then(checkStatus)
        .then(setCredentials);
}

export function logout(id) {
    return fetch(getApiUrl(`/keys/${id}`), {
        method: 'delete'
    })
        .then(checkStatus)
        .then(clearCredentials);
}
