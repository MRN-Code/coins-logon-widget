/* jshint esnext:true, global cookies */

/**
 * @todo  Move configuration, keys and cookie options out of module into a
 *        separate config file. Possibly inject configuration into `Auth`.
 */
const config = {
    protocol: 'http',
    host: 'localhost',
    port: 3000,
    endpoint: '/auth'
};

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

var Auth = {
    check: function(id) {
        return fetch(getApiUrl(`/cookies/${id}`))
            .then(checkStatus);
    },
    login: function(username, password) {
        return fetch(getApiUrl('/keys'), {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: btoa(username),
                password: btoa(password)
            })
        })
            .then(checkStatus)
            .then(setCredentials);
    },
    logout: function(id) {
        return fetch(getApiUrl(`/keys/${id}`), {
            method: 'delete'
        })
            .then(checkStatus)
            .then(clearCredentials);
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
    let url = `${config.protocol}://${config.host}`;
    url += (config.port ? `:${config.port}` : '');
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
