(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("CoinsLogonWidget", [], factory);
	else if(typeof exports === 'object')
		exports["CoinsLogonWidget"] = factory();
	else
		root["CoinsLogonWidget"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var auth = __webpack_require__(1);
	var createElement = __webpack_require__(37);
	var diff = __webpack_require__(50);
	var EventEmitter = __webpack_require__(55);
	var form = __webpack_require__(56);
	var merge = __webpack_require__(2);
	var messages = __webpack_require__(79);
	var patch = __webpack_require__(59);
	var uniqueId = __webpack_require__(80);
	var utils = __webpack_require__(82);

	/**
	 * Coins logon widget.
	 * @class
	 * @extends EventEmitter
	 *
	 * @param {object} options
	 * @param {string} options.authCookieName
	 * @param {string} options.baseUrl
	 * @param {Node} options.el DOM node to append logon widget
	 * @param {object} [options.messages] Override default messages by passing a
	 * hash corresponding to account and password events. See {@link lib/messages}
	 * for specifics.
	 * @param {boolean} [options.redirect=false]
	 * @param {string} [options.redirectUrl]
	 * @param {boolean} [options.checkAuth=false]
	 * @param {boolean} [options.horizontal=false] Whether to display the form
	 * horizontally, with inputs displayed left-to-right
	 */
	function CoinsLogonWidget(options) {
	    EventEmitter.call(this, options);

	    var EVENTS = CoinsLogonWidget.EVENTS;
	    var self = this;

	    var authCookieName = utils.assertString(
	        options.authCookieName,
	        'authCookieName'
	    );
	    var baseUrl = utils.assertString(options.baseUrl, 'baseUrl');

	    this.element = utils.assertElement(options.el);
	    this._options = {
	        authCookieName: authCookieName,
	        baseUrl: baseUrl,
	    };

	    this._options.messages = options.messages ?
	        merge({}, messages, options.messages) :
	        messages;

	    this._options.checkAuth = typeof options.checkAuth === 'boolean' ?
	        options.checkAuth :
	        false;
	    this._options.redirect = typeof options.redirect === 'boolean' ?
	        options.redirect :
	        false;
	    this._options.redirectUrl = typeof options.redirectUrl === 'string' ?
	        options.redirectUrl :
	        undefined;

	    // Set initial state
	    this._state = {
	        horizontal: !!options.horizontal,
	        isLoggedIn: false,
	        onSubmit: this.login.bind(this),
	        passwordProps: {
	            id: uniqueId('coins-logon-widget-'),
	            name: 'password',
	            type: 'password',
	        },
	        redirectUrl: this._options.redirectUrl,
	        usernameProps: {
	            id: uniqueId('coins-logon-widget-'),
	            name: 'username',
	        },
	    };

	    // Configure auth
	    auth.setOptions({
	        authCookieName: authCookieName,
	        baseUrl: baseUrl,
	    });

	    // Wire up events
	    this.on(EVENTS.LOGIN, this.login);
	    this.on(EVENTS.LOGIN_ERROR, this.onError);
	    this.on(EVENTS.LOGIN_ACCOUNT_EXPIRED, this.onAccountExpired);
	    this.on(EVENTS.LOGIN_ACCOUNT_WILL_EXPIRE, this.onAccountWillExpire);
	    this.on(EVENTS.LOGIN_PASSWORD_EXPIRED, this.onPasswordExpired);
	    this.on(EVENTS.LOGIN_PASSWORD_WILL_EXPIRE, this.onPasswordWillExpire);
	    this.on(EVENTS.LOGIN_SUCCESS, this.onLogin);
	    this.on(EVENTS.LOGOUT, this.logout);
	    this.on(EVENTS.LOGOUT_ERROR, this.onError);
	    this.on(EVENTS.LOGOUT_SUCCESS, this.onLogout);

	    this.init();

	    // Perform an auth check if the option is set
	    if (this._options.checkAuth) {
	        auth.isLoggedIn().then(function(isLoggedIn) {
	            if (isLoggedIn) {
	                self.emit(EVENTS.LOGIN_SUCCESS, {
	                    username: auth.getUsername(),
	                });
	            }
	        });
	    }
	}

	/**
	 * Inherit from `EventEmitter`:
	 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain#Example}
	 */
	CoinsLogonWidget.prototype = Object.create(EventEmitter.prototype);
	CoinsLogonWidget.prototype.constructor = CoinsLogonWidget;

	/* ==========================================================================
	   Actions
	   ========================================================================== */

	CoinsLogonWidget.prototype.destroy = function() {
	    this.update(null);
	    this.removeAllListeners();
	};

	CoinsLogonWidget.prototype.getFormData = function() {
	    var password = this.element.querySelector('input[name=password]').value;
	    var username = this.element.querySelector('input[name=username]').value;

	    return {
	        password: password,
	        username: username,
	    };
	};

	CoinsLogonWidget.prototype.init = function() {
	    this._tree = form(this._state);
	    this._rootNode = createElement(this._tree);
	    this.element.className = this.element.className + ' coins-logon-widget';
	    this.element.appendChild(this._rootNode);
	};

	CoinsLogonWidget.prototype.login = function() {
	    var self = this;
	    var EVENTS = CoinsLogonWidget.EVENTS;
	    var formData = this.getFormData();
	    var password = formData.password;
	    var username = formData.username;
	    var state;

	    // Validate input (make sure it isn't empty)
	    if (!username || !password) {
	        state = {};

	        if (!username) {
	            state.usernameProps = {
	                errorMessage: 'Missing username!',
	                onKeyPress: this.onKeyPress.bind(this),
	            };
	            this.emit(EVENTS.INVALID, { field: 'username' });
	        }

	        if (!password) {
	            state.passwordProps = {
	                errorMessage: 'Missing password!',
	                onKeyPress: this.onKeyPress.bind(this),
	            };
	            this.emit(EVENTS.INVALID, { field: 'password' });
	        }

	        return this.update(state);
	    }

	    this.update({ isLoading: true });

	    return auth.login(username, password)
	        .then(function(response) {
	            /**
	             * Successful authentication also contains information regarding
	             * a user's account status. If the user's password or account is
	             * expired the widget needs to handle it here.
	             */
	            var accountExpiration = Date.parse(response.user.acctExpDate);
	            var DAY = CoinsLogonWidget.DAY;
	            var now = Date.now();
	            var passwordExpiration = Date.parse(response.user.passwordExpDate);

	            self.update({ isLoading: false });

	            if (accountExpiration - now < DAY * 10) {
	                self.emit(EVENTS.LOGIN_ACCOUNT_WILL_EXPIRE, response);
	            } else if (passwordExpiration - now < DAY * 10) {
	                self.emit(EVENTS.LOGIN_PASSWORD_WILL_EXPIRE, response);
	            } else {
	                self.emit(EVENTS.LOGIN_SUCCESS, response);
	            }

	            return response;
	        }, function(error) {

	            self.update({ isLoading: false });
	            if (error === 'Password expired') {
	                self.emit(EVENTS.LOGIN_PASSWORD_EXPIRED, error);
	            } else if (error === 'Account expired') {
	                self.emit(EVENTS.LOGIN_ACCOUNT_EXPIRED, error);
	            } else {
	                self.emit(EVENTS.LOGIN_ERROR, error);
	            }

	            return error;
	        });
	};

	CoinsLogonWidget.prototype.logout = function() {
	    var EVENTS = CoinsLogonWidget.EVENTS;
	    var self = this;

	    this.update({ isLoading: true });

	    return auth.logout()
	        .then(function(response) {
	            self.update({ isLoading: false });
	            self.emit(EVENTS.LOGOUT_SUCCESS, response);

	            return response;
	        }, function(error) {

	            self.update({ isLoading: false });
	            self.emit(EVENTS.LOGOUT_ERROR, error);

	            return error;
	        });
	};

	CoinsLogonWidget.prototype.update = function(newState) {
	    if (newState === this._state) {
	        return;
	    }

	    this._state = merge({}, this._state, newState);

	    // Persist fields' values if not logged in
	    if (!this._state.isLoggedIn) {
	        var formData = this.getFormData();
	        this._state.passwordProps.value = formData.password;
	        this._state.usernameProps.value = formData.username;
	    } else {
	        this._state.passwordProps.value = '';
	    }

	    var newTree = form(this._state);
	    var patches = diff(this._tree, newTree);

	    this._rootNode = patch(this._rootNode, patches);
	    this._tree = newTree;
	};

	/* ==========================================================================
	   Built-in event listeners
	   ========================================================================== */

	CoinsLogonWidget.prototype.onAccountExpired = function() {
	    var message = utils.callOrReturn(this._options.messages.accountExpired);
	    this.update({ errorMessage: message });
	};

	CoinsLogonWidget.prototype.onAccountWillExpire = function(response) {
	    var accountExpiration = Date.parse(response.user.acctExpDate);
	    var now = Date.now();
	    var message = utils.callOrReturn(
	        this._options.messages.accountWillExpire,
	        [utils.formatDay((accountExpiration - now) / CoinsLogonWidget.DAY)]
	    );

	    this.update({ errorMessage: message });
	};

	CoinsLogonWidget.prototype.onError = function(error) {
	    var message;

	    if (typeof error !== 'undefined') {
	        message = error.message || error.toString();
	    } else {
	        message = 'Unknown error!';
	    }

	    this.update({ errorMessage: message });
	    console.error(error);
	};

	CoinsLogonWidget.prototype.onKeyPress = function(event) {
	    var clearErrorProps = {
	        errorMessage: null,
	        onKeyPress: null,
	    };

	    if (event.target.name === 'username') {
	        this.update({ usernameProps: clearErrorProps });
	    }

	    if (event.target.name === 'password') {
	        this.update({ passwordProps: clearErrorProps });
	    }
	};

	CoinsLogonWidget.prototype.onLogin = function(response) {
	    // Redirect if the option is set and there's a URL
	    if (this._options.redirect && this._options.redirectUrl) {
	        window.location = this._options.redirectUrl;
	    } else {
	        this.update({
	            isLoggedIn: true,
	            username: response.username,
	        });
	    }
	};

	CoinsLogonWidget.prototype.onLogout = function() {
	    this.update({ isLoggedIn: false });
	};

	CoinsLogonWidget.prototype.onPasswordExpired = function() {
	    var message = utils.callOrReturn(this._options.messages.passwordExpired);
	    this.update({ errorMessage: message });
	};

	CoinsLogonWidget.prototype.onPasswordWillExpire = function(response) {
	    var passwordExpiration = Date.parse(response.user.passwordExpDate);
	    var now = Date.now();
	    var message = utils.callOrReturn(
	        this._options.messages.passwordWillExpire,
	        [utils.formatDay((passwordExpiration - now) / CoinsLogonWidget.DAY)]
	    );
	    this.update({ errorMessage: message });
	};

	/* ==========================================================================
	   Static properties
	   ========================================================================== */

	CoinsLogonWidget.DAY = 24 * 60 * 60 * 1000;

	CoinsLogonWidget.EVENTS = {
	    INVALID: 'invalid',
	    LOGIN: 'login:init',
	    LOGIN_ERROR: 'login:error',
	    LOGIN_ACCOUNT_EXPIRED: 'login:accountExpired',
	    LOGIN_ACCOUNT_WILL_EXPIRE: 'login:accountWillExpire',
	    LOGIN_PASSWORD_EXPIRED: 'login:passwordExpired',
	    LOGIN_PASSWORD_WILL_EXPIRE: 'login:passwordWillExpire',
	    LOGIN_SUCCESS: 'login:success',
	    LOGOUT: 'logout:init',
	    LOGOUT_ERROR: 'logout:error',
	    LOGOUT_SUCCESS: 'logout:success'
	};

	module.exports = CoinsLogonWidget;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var merge = __webpack_require__(2);
	var cookies = __webpack_require__(35);
	var hawk = __webpack_require__(36);

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
	    merge(options, newOptions);
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
	 * Get username.
	 *
	 * @return {string}
	 */
	function getUsername() {
	    var credentials = getAuthCredentials();

	    return ('username' in credentials ? credentials.username : '');
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
	    getUsername: getUsername,
	};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	var baseMerge = __webpack_require__(3),
	    createAssigner = __webpack_require__(30);

	/**
	 * Recursively merges own enumerable properties of the source object(s), that
	 * don't resolve to `undefined` into the destination object. Subsequent sources
	 * overwrite property assignments of previous sources. If `customizer` is
	 * provided it's invoked to produce the merged values of the destination and
	 * source properties. If `customizer` returns `undefined` merging is handled
	 * by the method instead. The `customizer` is bound to `thisArg` and invoked
	 * with five arguments: (objectValue, sourceValue, key, object, source).
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @param {Function} [customizer] The function to customize assigned values.
	 * @param {*} [thisArg] The `this` binding of `customizer`.
	 * @returns {Object} Returns `object`.
	 * @example
	 *
	 * var users = {
	 *   'data': [{ 'user': 'barney' }, { 'user': 'fred' }]
	 * };
	 *
	 * var ages = {
	 *   'data': [{ 'age': 36 }, { 'age': 40 }]
	 * };
	 *
	 * _.merge(users, ages);
	 * // => { 'data': [{ 'user': 'barney', 'age': 36 }, { 'user': 'fred', 'age': 40 }] }
	 *
	 * // using a customizer callback
	 * var object = {
	 *   'fruits': ['apple'],
	 *   'vegetables': ['beet']
	 * };
	 *
	 * var other = {
	 *   'fruits': ['banana'],
	 *   'vegetables': ['carrot']
	 * };
	 *
	 * _.merge(object, other, function(a, b) {
	 *   if (_.isArray(a)) {
	 *     return a.concat(b);
	 *   }
	 * });
	 * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }
	 */
	var merge = createAssigner(baseMerge);

	module.exports = merge;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayEach = __webpack_require__(4),
	    baseMergeDeep = __webpack_require__(5),
	    isArray = __webpack_require__(13),
	    isArrayLike = __webpack_require__(8),
	    isObject = __webpack_require__(17),
	    isObjectLike = __webpack_require__(12),
	    isTypedArray = __webpack_require__(25),
	    keys = __webpack_require__(28);

	/**
	 * The base implementation of `_.merge` without support for argument juggling,
	 * multiple sources, and `this` binding `customizer` functions.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {Function} [customizer] The function to customize merged values.
	 * @param {Array} [stackA=[]] Tracks traversed source objects.
	 * @param {Array} [stackB=[]] Associates values with source counterparts.
	 * @returns {Object} Returns `object`.
	 */
	function baseMerge(object, source, customizer, stackA, stackB) {
	  if (!isObject(object)) {
	    return object;
	  }
	  var isSrcArr = isArrayLike(source) && (isArray(source) || isTypedArray(source)),
	      props = isSrcArr ? undefined : keys(source);

	  arrayEach(props || source, function(srcValue, key) {
	    if (props) {
	      key = srcValue;
	      srcValue = source[key];
	    }
	    if (isObjectLike(srcValue)) {
	      stackA || (stackA = []);
	      stackB || (stackB = []);
	      baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);
	    }
	    else {
	      var value = object[key],
	          result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
	          isCommon = result === undefined;

	      if (isCommon) {
	        result = srcValue;
	      }
	      if ((result !== undefined || (isSrcArr && !(key in object))) &&
	          (isCommon || (result === result ? (result !== value) : (value === value)))) {
	        object[key] = result;
	      }
	    }
	  });
	  return object;
	}

	module.exports = baseMerge;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.forEach` for arrays without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns `array`.
	 */
	function arrayEach(array, iteratee) {
	  var index = -1,
	      length = array.length;

	  while (++index < length) {
	    if (iteratee(array[index], index, array) === false) {
	      break;
	    }
	  }
	  return array;
	}

	module.exports = arrayEach;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayCopy = __webpack_require__(6),
	    isArguments = __webpack_require__(7),
	    isArray = __webpack_require__(13),
	    isArrayLike = __webpack_require__(8),
	    isPlainObject = __webpack_require__(18),
	    isTypedArray = __webpack_require__(25),
	    toPlainObject = __webpack_require__(26);

	/**
	 * A specialized version of `baseMerge` for arrays and objects which performs
	 * deep merges and tracks traversed objects enabling objects with circular
	 * references to be merged.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {string} key The key of the value to merge.
	 * @param {Function} mergeFunc The function to merge values.
	 * @param {Function} [customizer] The function to customize merged values.
	 * @param {Array} [stackA=[]] Tracks traversed source objects.
	 * @param {Array} [stackB=[]] Associates values with source counterparts.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
	  var length = stackA.length,
	      srcValue = source[key];

	  while (length--) {
	    if (stackA[length] == srcValue) {
	      object[key] = stackB[length];
	      return;
	    }
	  }
	  var value = object[key],
	      result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
	      isCommon = result === undefined;

	  if (isCommon) {
	    result = srcValue;
	    if (isArrayLike(srcValue) && (isArray(srcValue) || isTypedArray(srcValue))) {
	      result = isArray(value)
	        ? value
	        : (isArrayLike(value) ? arrayCopy(value) : []);
	    }
	    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
	      result = isArguments(value)
	        ? toPlainObject(value)
	        : (isPlainObject(value) ? value : {});
	    }
	    else {
	      isCommon = false;
	    }
	  }
	  // Add the source value to the stack of traversed objects and associate
	  // it with its merged value.
	  stackA.push(srcValue);
	  stackB.push(result);

	  if (isCommon) {
	    // Recursively merge objects and arrays (susceptible to call stack limits).
	    object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);
	  } else if (result === result ? (result !== value) : (value === value)) {
	    object[key] = result;
	  }
	}

	module.exports = baseMergeDeep;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

	/**
	 * Copies the values of `source` to `array`.
	 *
	 * @private
	 * @param {Array} source The array to copy values from.
	 * @param {Array} [array=[]] The array to copy values to.
	 * @returns {Array} Returns `array`.
	 */
	function arrayCopy(source, array) {
	  var index = -1,
	      length = source.length;

	  array || (array = Array(length));
	  while (++index < length) {
	    array[index] = source[index];
	  }
	  return array;
	}

	module.exports = arrayCopy;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(8),
	    isObjectLike = __webpack_require__(12);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Native method references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

	/**
	 * Checks if `value` is classified as an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  return isObjectLike(value) && isArrayLike(value) &&
	    hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
	}

	module.exports = isArguments;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(9),
	    isLength = __webpack_require__(11);

	/**
	 * Checks if `value` is array-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 */
	function isArrayLike(value) {
	  return value != null && isLength(getLength(value));
	}

	module.exports = isArrayLike;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(10);

	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');

	module.exports = getLength;


/***/ }),
/* 10 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	module.exports = baseProperty;


/***/ }),
/* 11 */
/***/ (function(module, exports) {

	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	module.exports = isLength;


/***/ }),
/* 12 */
/***/ (function(module, exports) {

	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	module.exports = isObjectLike;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(14),
	    isLength = __webpack_require__(11),
	    isObjectLike = __webpack_require__(12);

	/** `Object#toString` result references. */
	var arrayTag = '[object Array]';

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeIsArray = getNative(Array, 'isArray');

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(function() { return arguments; }());
	 * // => false
	 */
	var isArray = nativeIsArray || function(value) {
	  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
	};

	module.exports = isArray;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	var isNative = __webpack_require__(15);

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object == null ? undefined : object[key];
	  return isNative(value) ? value : undefined;
	}

	module.exports = getNative;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(16),
	    isObjectLike = __webpack_require__(12);

	/** Used to detect host constructors (Safari > 5). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var fnToString = Function.prototype.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (value == null) {
	    return false;
	  }
	  if (isFunction(value)) {
	    return reIsNative.test(fnToString.call(value));
	  }
	  return isObjectLike(value) && reIsHostCtor.test(value);
	}

	module.exports = isNative;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(17);

	/** `Object#toString` result references. */
	var funcTag = '[object Function]';

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in older versions of Chrome and Safari which return 'function' for regexes
	  // and Safari 8 which returns 'object' for typed array constructors.
	  return isObject(value) && objToString.call(value) == funcTag;
	}

	module.exports = isFunction;


/***/ }),
/* 17 */
/***/ (function(module, exports) {

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(1);
	 * // => false
	 */
	function isObject(value) {
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	module.exports = isObject;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	var baseForIn = __webpack_require__(19),
	    isArguments = __webpack_require__(7),
	    isObjectLike = __webpack_require__(12);

	/** `Object#toString` result references. */
	var objectTag = '[object Object]';

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;

	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * **Note:** This method assumes objects created by the `Object` constructor
	 * have no inherited enumerable properties.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject(value) {
	  var Ctor;

	  // Exit early for non `Object` objects.
	  if (!(isObjectLike(value) && objToString.call(value) == objectTag && !isArguments(value)) ||
	      (!hasOwnProperty.call(value, 'constructor') && (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
	    return false;
	  }
	  // IE < 9 iterates inherited properties before own properties. If the first
	  // iterated property is an object's own property then there are no inherited
	  // enumerable properties.
	  var result;
	  // In most environments an object's own properties are iterated before
	  // its inherited properties. If the last iterated property is an object's
	  // own property then there are no inherited enumerable properties.
	  baseForIn(value, function(subValue, key) {
	    result = key;
	  });
	  return result === undefined || hasOwnProperty.call(value, result);
	}

	module.exports = isPlainObject;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	var baseFor = __webpack_require__(20),
	    keysIn = __webpack_require__(23);

	/**
	 * The base implementation of `_.forIn` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForIn(object, iteratee) {
	  return baseFor(object, iteratee, keysIn);
	}

	module.exports = baseForIn;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	var createBaseFor = __webpack_require__(21);

	/**
	 * The base implementation of `baseForIn` and `baseForOwn` which iterates
	 * over `object` properties returned by `keysFunc` invoking `iteratee` for
	 * each property. Iteratee functions may exit iteration early by explicitly
	 * returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = createBaseFor();

	module.exports = baseFor;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	var toObject = __webpack_require__(22);

	/**
	 * Creates a base function for `_.forIn` or `_.forInRight`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var iterable = toObject(object),
	        props = keysFunc(object),
	        length = props.length,
	        index = fromRight ? length : -1;

	    while ((fromRight ? index-- : ++index < length)) {
	      var key = props[index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}

	module.exports = createBaseFor;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(17);

	/**
	 * Converts `value` to an object if it's not one.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {Object} Returns the object.
	 */
	function toObject(value) {
	  return isObject(value) ? value : Object(value);
	}

	module.exports = toObject;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(7),
	    isArray = __webpack_require__(13),
	    isIndex = __webpack_require__(24),
	    isLength = __webpack_require__(11),
	    isObject = __webpack_require__(17);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */
	function keysIn(object) {
	  if (object == null) {
	    return [];
	  }
	  if (!isObject(object)) {
	    object = Object(object);
	  }
	  var length = object.length;
	  length = (length && isLength(length) &&
	    (isArray(object) || isArguments(object)) && length) || 0;

	  var Ctor = object.constructor,
	      index = -1,
	      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
	      result = Array(length),
	      skipIndexes = length > 0;

	  while (++index < length) {
	    result[index] = (index + '');
	  }
	  for (var key in object) {
	    if (!(skipIndexes && isIndex(key, length)) &&
	        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = keysIn;


/***/ }),
/* 24 */
/***/ (function(module, exports) {

	/** Used to detect unsigned integer values. */
	var reIsUint = /^\d+$/;

	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return value > -1 && value % 1 == 0 && value < length;
	}

	module.exports = isIndex;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	var isLength = __webpack_require__(11),
	    isObjectLike = __webpack_require__(12);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag = '[object WeakMap]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dateTag] = typedArrayTags[errorTag] =
	typedArrayTags[funcTag] = typedArrayTags[mapTag] =
	typedArrayTags[numberTag] = typedArrayTags[objectTag] =
	typedArrayTags[regexpTag] = typedArrayTags[setTag] =
	typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	function isTypedArray(value) {
	  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
	}

	module.exports = isTypedArray;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	var baseCopy = __webpack_require__(27),
	    keysIn = __webpack_require__(23);

	/**
	 * Converts `value` to a plain object flattening inherited enumerable
	 * properties of `value` to own properties of the plain object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {Object} Returns the converted plain object.
	 * @example
	 *
	 * function Foo() {
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.assign({ 'a': 1 }, new Foo);
	 * // => { 'a': 1, 'b': 2 }
	 *
	 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
	 * // => { 'a': 1, 'b': 2, 'c': 3 }
	 */
	function toPlainObject(value) {
	  return baseCopy(value, keysIn(value));
	}

	module.exports = toPlainObject;


/***/ }),
/* 27 */
/***/ (function(module, exports) {

	/**
	 * Copies properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property names to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @returns {Object} Returns `object`.
	 */
	function baseCopy(source, props, object) {
	  object || (object = {});

	  var index = -1,
	      length = props.length;

	  while (++index < length) {
	    var key = props[index];
	    object[key] = source[key];
	  }
	  return object;
	}

	module.exports = baseCopy;


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(14),
	    isArrayLike = __webpack_require__(8),
	    isObject = __webpack_require__(17),
	    shimKeys = __webpack_require__(29);

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeKeys = getNative(Object, 'keys');

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	var keys = !nativeKeys ? shimKeys : function(object) {
	  var Ctor = object == null ? undefined : object.constructor;
	  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
	      (typeof object != 'function' && isArrayLike(object))) {
	    return shimKeys(object);
	  }
	  return isObject(object) ? nativeKeys(object) : [];
	};

	module.exports = keys;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(7),
	    isArray = __webpack_require__(13),
	    isIndex = __webpack_require__(24),
	    isLength = __webpack_require__(11),
	    keysIn = __webpack_require__(23);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * A fallback implementation of `Object.keys` which creates an array of the
	 * own enumerable property names of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function shimKeys(object) {
	  var props = keysIn(object),
	      propsLength = props.length,
	      length = propsLength && object.length;

	  var allowIndexes = !!length && isLength(length) &&
	    (isArray(object) || isArguments(object));

	  var index = -1,
	      result = [];

	  while (++index < propsLength) {
	    var key = props[index];
	    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = shimKeys;


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	var bindCallback = __webpack_require__(31),
	    isIterateeCall = __webpack_require__(33),
	    restParam = __webpack_require__(34);

	/**
	 * Creates a `_.assign`, `_.defaults`, or `_.merge` function.
	 *
	 * @private
	 * @param {Function} assigner The function to assign values.
	 * @returns {Function} Returns the new assigner function.
	 */
	function createAssigner(assigner) {
	  return restParam(function(object, sources) {
	    var index = -1,
	        length = object == null ? 0 : sources.length,
	        customizer = length > 2 ? sources[length - 2] : undefined,
	        guard = length > 2 ? sources[2] : undefined,
	        thisArg = length > 1 ? sources[length - 1] : undefined;

	    if (typeof customizer == 'function') {
	      customizer = bindCallback(customizer, thisArg, 5);
	      length -= 2;
	    } else {
	      customizer = typeof thisArg == 'function' ? thisArg : undefined;
	      length -= (customizer ? 1 : 0);
	    }
	    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
	      customizer = length < 3 ? undefined : customizer;
	      length = 1;
	    }
	    while (++index < length) {
	      var source = sources[index];
	      if (source) {
	        assigner(object, source, customizer);
	      }
	    }
	    return object;
	  });
	}

	module.exports = createAssigner;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(32);

	/**
	 * A specialized version of `baseCallback` which only supports `this` binding
	 * and specifying the number of arguments to provide to `func`.
	 *
	 * @private
	 * @param {Function} func The function to bind.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {number} [argCount] The number of arguments to provide to `func`.
	 * @returns {Function} Returns the callback.
	 */
	function bindCallback(func, thisArg, argCount) {
	  if (typeof func != 'function') {
	    return identity;
	  }
	  if (thisArg === undefined) {
	    return func;
	  }
	  switch (argCount) {
	    case 1: return function(value) {
	      return func.call(thisArg, value);
	    };
	    case 3: return function(value, index, collection) {
	      return func.call(thisArg, value, index, collection);
	    };
	    case 4: return function(accumulator, value, index, collection) {
	      return func.call(thisArg, accumulator, value, index, collection);
	    };
	    case 5: return function(value, other, key, object, source) {
	      return func.call(thisArg, value, other, key, object, source);
	    };
	  }
	  return function() {
	    return func.apply(thisArg, arguments);
	  };
	}

	module.exports = bindCallback;


/***/ }),
/* 32 */
/***/ (function(module, exports) {

	/**
	 * This method returns the first argument provided to it.
	 *
	 * @static
	 * @memberOf _
	 * @category Utility
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * _.identity(object) === object;
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = identity;


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(8),
	    isIndex = __webpack_require__(24),
	    isObject = __webpack_require__(17);

	/**
	 * Checks if the provided arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
	 */
	function isIterateeCall(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number'
	      ? (isArrayLike(object) && isIndex(index, object.length))
	      : (type == 'string' && index in object)) {
	    var other = object[index];
	    return value === value ? (value === other) : (other !== other);
	  }
	  return false;
	}

	module.exports = isIterateeCall;


/***/ }),
/* 34 */
/***/ (function(module, exports) {

	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * Creates a function that invokes `func` with the `this` binding of the
	 * created function and arguments from `start` and beyond provided as an array.
	 *
	 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/Web/JavaScript/Reference/Functions/rest_parameters).
	 *
	 * @static
	 * @memberOf _
	 * @category Function
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var say = _.restParam(function(what, names) {
	 *   return what + ' ' + _.initial(names).join(', ') +
	 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
	 * });
	 *
	 * say('hello', 'fred', 'barney', 'pebbles');
	 * // => 'hello fred, barney, & pebbles'
	 */
	function restParam(func, start) {
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        rest = Array(length);

	    while (++index < length) {
	      rest[index] = args[start + index];
	    }
	    switch (start) {
	      case 0: return func.call(this, rest);
	      case 1: return func.call(this, args[0], rest);
	      case 2: return func.call(this, args[0], args[1], rest);
	    }
	    var otherArgs = Array(start + 1);
	    index = -1;
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = rest;
	    return func.apply(this, otherArgs);
	  };
	}

	module.exports = restParam;


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * JavaScript Cookie v2.2.0
	 * https://github.com/js-cookie/js-cookie
	 *
	 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
	 * Released under the MIT license
	 */
	;(function (factory) {
		var registeredInModuleLoader = false;
		if (true) {
			!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
			registeredInModuleLoader = true;
		}
		if (true) {
			module.exports = factory();
			registeredInModuleLoader = true;
		}
		if (!registeredInModuleLoader) {
			var OldCookies = window.Cookies;
			var api = window.Cookies = factory();
			api.noConflict = function () {
				window.Cookies = OldCookies;
				return api;
			};
		}
	}(function () {
		function extend () {
			var i = 0;
			var result = {};
			for (; i < arguments.length; i++) {
				var attributes = arguments[ i ];
				for (var key in attributes) {
					result[key] = attributes[key];
				}
			}
			return result;
		}

		function init (converter) {
			function api (key, value, attributes) {
				var result;
				if (typeof document === 'undefined') {
					return;
				}

				// Write

				if (arguments.length > 1) {
					attributes = extend({
						path: '/'
					}, api.defaults, attributes);

					if (typeof attributes.expires === 'number') {
						var expires = new Date();
						expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
						attributes.expires = expires;
					}

					// We're using "expires" because "max-age" is not supported by IE
					attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

					try {
						result = JSON.stringify(value);
						if (/^[\{\[]/.test(result)) {
							value = result;
						}
					} catch (e) {}

					if (!converter.write) {
						value = encodeURIComponent(String(value))
							.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
					} else {
						value = converter.write(value, key);
					}

					key = encodeURIComponent(String(key));
					key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
					key = key.replace(/[\(\)]/g, escape);

					var stringifiedAttributes = '';

					for (var attributeName in attributes) {
						if (!attributes[attributeName]) {
							continue;
						}
						stringifiedAttributes += '; ' + attributeName;
						if (attributes[attributeName] === true) {
							continue;
						}
						stringifiedAttributes += '=' + attributes[attributeName];
					}
					return (document.cookie = key + '=' + value + stringifiedAttributes);
				}

				// Read

				if (!key) {
					result = {};
				}

				// To prevent the for loop in the first place assign an empty array
				// in case there are no cookies at all. Also prevents odd result when
				// calling "get()"
				var cookies = document.cookie ? document.cookie.split('; ') : [];
				var rdecode = /(%[0-9A-Z]{2})+/g;
				var i = 0;

				for (; i < cookies.length; i++) {
					var parts = cookies[i].split('=');
					var cookie = parts.slice(1).join('=');

					if (!this.json && cookie.charAt(0) === '"') {
						cookie = cookie.slice(1, -1);
					}

					try {
						var name = parts[0].replace(rdecode, decodeURIComponent);
						cookie = converter.read ?
							converter.read(cookie, name) : converter(cookie, name) ||
							cookie.replace(rdecode, decodeURIComponent);

						if (this.json) {
							try {
								cookie = JSON.parse(cookie);
							} catch (e) {}
						}

						if (key === name) {
							result = cookie;
							break;
						}

						if (!key) {
							result[name] = cookie;
						}
					} catch (e) {}
				}

				return result;
			}

			api.set = api;
			api.get = function (key) {
				return api.call(api, key);
			};
			api.getJSON = function () {
				return api.apply({
					json: true
				}, [].slice.call(arguments));
			};
			api.defaults = {};

			api.remove = function (key, attributes) {
				api(key, '', extend(attributes, {
					expires: -1
				}));
			};

			api.withConverter = init;

			return api;
		}

		return init(function () {});
	}));


/***/ }),
/* 36 */
/***/ (function(module, exports) {

	'use strict';

	/*
	    HTTP Hawk Authentication Scheme
	    Copyright (c) 2012-2017, Eran Hammer <eran@hammer.io>
	    BSD Licensed
	*/


	// Declare namespace

	const hawk = {
	    internals: {}
	};


	hawk.client = {

	    // Generate an Authorization header for a given request

	    /*
	        uri: 'http://example.com/resource?a=b' or object generated by hawk.utils.parseUri()
	        method: HTTP verb (e.g. 'GET', 'POST')
	        options: {

	            // Required

	            credentials: {
	                id: 'dh37fgj492je',
	                key: 'aoijedoaijsdlaksjdl',
	                algorithm: 'sha256'                                 // 'sha1', 'sha256'
	            },

	            // Optional

	            ext: 'application-specific',                        // Application specific data sent via the ext attribute
	            timestamp: Date.now() / 1000,                       // A pre-calculated timestamp in seconds
	            nonce: '2334f34f',                                  // A pre-generated nonce
	            localtimeOffsetMsec: 400,                           // Time offset to sync with server time (ignored if timestamp provided)
	            payload: '{"some":"payload"}',                      // UTF-8 encoded string for body hash generation (ignored if hash provided)
	            contentType: 'application/json',                    // Payload content-type (ignored if hash provided)
	            hash: 'U4MKKSmiVxk37JCCrAVIjV=',                    // Pre-calculated payload hash
	            app: '24s23423f34dx',                               // Oz application id
	            dlg: '234sz34tww3sd'                                // Oz delegated-by application id
	        }
	    */

	    header: function (uri, method, options) {

	        // Validate inputs

	        if (!uri || (typeof uri !== 'string' && typeof uri !== 'object') ||
	            !method || typeof method !== 'string' ||
	            !options || typeof options !== 'object') {

	            throw new Error('Invalid argument type');
	        }

	        // Application time

	        const timestamp = options.timestamp || hawk.utils.nowSec(options.localtimeOffsetMsec);

	        // Validate credentials

	        const credentials = options.credentials;
	        if (!credentials ||
	            !credentials.id ||
	            !credentials.key ||
	            !credentials.algorithm) {

	            throw new Error('Invalid credentials');
	        }

	        if (hawk.crypto.algorithms.indexOf(credentials.algorithm) === -1) {
	            throw new Error('Unknown algorithm');
	        }

	        // Parse URI

	        if (typeof uri === 'string') {
	            uri = hawk.utils.parseUri(uri);
	        }

	        // Calculate signature

	        const artifacts = {
	            ts: timestamp,
	            nonce: options.nonce || hawk.utils.randomString(6),
	            method,
	            resource: uri.resource,
	            host: uri.host,
	            port: uri.port,
	            hash: options.hash,
	            ext: options.ext,
	            app: options.app,
	            dlg: options.dlg
	        };

	        // Calculate payload hash

	        if (!artifacts.hash &&
	            (options.payload || options.payload === '')) {

	            artifacts.hash = hawk.crypto.calculatePayloadHash(options.payload, credentials.algorithm, options.contentType);
	        }

	        const mac = hawk.crypto.calculateMac('header', credentials, artifacts);

	        // Construct header

	        const hasExt = artifacts.ext !== null && artifacts.ext !== undefined && artifacts.ext !== '';       // Other falsey values allowed
	        let header = 'Hawk id="' + credentials.id +
	                     '", ts="' + artifacts.ts +
	                     '", nonce="' + artifacts.nonce +
	                     (artifacts.hash ? '", hash="' + artifacts.hash : '') +
	                     (hasExt ? '", ext="' + hawk.utils.escapeHeaderAttribute(artifacts.ext) : '') +
	                     '", mac="' + mac + '"';

	        if (artifacts.app) {
	            header += ', app="' + artifacts.app +
	                      (artifacts.dlg ? '", dlg="' + artifacts.dlg : '') + '"';
	        }

	        return { artifacts, header };
	    },

	    // Generate a bewit value for a given URI

	    /*
	        uri: 'http://example.com/resource?a=b'
	        options: {

	            // Required

	            credentials: {
	            id: 'dh37fgj492je',
	            key: 'aoijedoaijsdlaksjdl',
	            algorithm: 'sha256'                             // 'sha1', 'sha256'
	            },
	            ttlSec: 60 * 60,                                    // TTL in seconds

	            // Optional

	            ext: 'application-specific',                        // Application specific data sent via the ext attribute
	            localtimeOffsetMsec: 400                            // Time offset to sync with server time
	         };
	    */

	    bewit: function (uri, options) {

	        // Validate inputs

	        if (!uri ||
	            (typeof uri !== 'string') ||
	            !options ||
	            typeof options !== 'object' ||
	            !options.ttlSec) {

	            throw new Error('Invalid inputs');
	        }

	        const ext = (options.ext === null || options.ext === undefined ? '' : options.ext);       // Zero is valid value

	        // Application time

	        const now = hawk.utils.nowSec(options.localtimeOffsetMsec);

	        // Validate credentials

	        const credentials = options.credentials;
	        if (!credentials ||
	            !credentials.id ||
	            !credentials.key ||
	            !credentials.algorithm) {

	            throw new Error('Invalid credentials');
	        }

	        if (hawk.crypto.algorithms.indexOf(credentials.algorithm) === -1) {
	            throw new Error('Unknown algorithm');
	        }

	        // Parse URI

	        uri = hawk.utils.parseUri(uri);

	        // Calculate signature

	        const exp = now + options.ttlSec;
	        const mac = hawk.crypto.calculateMac('bewit', credentials, {
	            ts: exp,
	            nonce: '',
	            method: 'GET',
	            resource: uri.resource,                            // Maintain trailing '?' and query params
	            host: uri.host,
	            port: uri.port,
	            ext
	        });

	        // Construct bewit: id\exp\mac\ext

	        const bewit = credentials.id + '\\' + exp + '\\' + mac + '\\' + ext;
	        return hawk.utils.base64urlEncode(bewit);
	    },

	    // Validate server response

	    /*
	        request:    object created via 'new XMLHttpRequest()' after response received or fetch API 'Response'
	        artifacts:  object received from header().artifacts
	        options: {
	            payload:    optional payload received
	            required:   specifies if a Server-Authorization header is required. Defaults to 'false'
	        }
	    */

	    authenticate: function (request, credentials, artifacts, options) {

	        options = options || {};

	        const getHeader = function (name) {

	            // Fetch API or plain headers

	            if (request.headers) {
	                return (typeof request.headers.get === 'function' ? request.headers.get(name) : request.headers[name]);
	            }

	            // XMLHttpRequest

	            return (request.getResponseHeader ? request.getResponseHeader(name) : request.getHeader(name));
	        };

	        const wwwAuthenticate = getHeader('www-authenticate');
	        if (wwwAuthenticate) {

	            // Parse HTTP WWW-Authenticate header

	            const wwwAttributes = hawk.utils.parseAuthorizationHeader(wwwAuthenticate, ['ts', 'tsm', 'error']);
	            if (!wwwAttributes) {
	                return false;
	            }

	            if (wwwAttributes.ts) {
	                const tsm = hawk.crypto.calculateTsMac(wwwAttributes.ts, credentials);
	                if (tsm !== wwwAttributes.tsm) {
	                    return false;
	                }

	                hawk.utils.setNtpSecOffset(wwwAttributes.ts - Math.floor(Date.now() / 1000));      // Keep offset at 1 second precision
	            }
	        }

	        // Parse HTTP Server-Authorization header

	        const serverAuthorization = getHeader('server-authorization');
	        if (!serverAuthorization &&
	            !options.required) {

	            return true;
	        }

	        const attributes = hawk.utils.parseAuthorizationHeader(serverAuthorization, ['mac', 'ext', 'hash']);
	        if (!attributes) {
	            return false;
	        }

	        const modArtifacts = {
	            ts: artifacts.ts,
	            nonce: artifacts.nonce,
	            method: artifacts.method,
	            resource: artifacts.resource,
	            host: artifacts.host,
	            port: artifacts.port,
	            hash: attributes.hash,
	            ext: attributes.ext,
	            app: artifacts.app,
	            dlg: artifacts.dlg
	        };

	        const mac = hawk.crypto.calculateMac('response', credentials, modArtifacts);
	        if (mac !== attributes.mac) {
	            return false;
	        }

	        if (!options.payload &&
	            options.payload !== '') {

	            return true;
	        }

	        if (!attributes.hash) {
	            return false;
	        }

	        const calculatedHash = hawk.crypto.calculatePayloadHash(options.payload, credentials.algorithm, getHeader('content-type'));
	        return (calculatedHash === attributes.hash);
	    },

	    message: function (host, port, message, options) {

	        // Validate inputs

	        if (!host || typeof host !== 'string' ||
	            !port || typeof port !== 'number' ||
	            message === null || message === undefined || typeof message !== 'string' ||
	            !options || typeof options !== 'object') {

	            throw new Error('Invalid inputs');
	        }

	        // Application time

	        const timestamp = options.timestamp || hawk.utils.nowSec(options.localtimeOffsetMsec);

	        // Validate credentials

	        const credentials = options.credentials;
	        if (!credentials ||
	            !credentials.id ||
	            !credentials.key ||
	            !credentials.algorithm) {

	            throw new Error('Invalid credentials');
	        }

	        if (hawk.crypto.algorithms.indexOf(credentials.algorithm) === -1) {
	            throw new Error('Unknown algorithm');
	        }

	        // Calculate signature

	        const artifacts = {
	            ts: timestamp,
	            nonce: options.nonce || hawk.utils.randomString(6),
	            host,
	            port,
	            hash: hawk.crypto.calculatePayloadHash(message, credentials.algorithm)
	        };

	        // Construct authorization

	        const result = {
	            id: credentials.id,
	            ts: artifacts.ts,
	            nonce: artifacts.nonce,
	            hash: artifacts.hash,
	            mac: hawk.crypto.calculateMac('message', credentials, artifacts)
	        };

	        return result;
	    },

	    authenticateTimestamp: function (message, credentials, updateClock) {               // updateClock defaults to true

	        const tsm = hawk.crypto.calculateTsMac(message.ts, credentials);
	        if (tsm !== message.tsm) {
	            return false;
	        }

	        if (updateClock !== false) {
	            hawk.utils.setNtpSecOffset(message.ts - Math.floor(Date.now() / 1000));     // Keep offset at 1 second precision
	        }

	        return true;
	    }
	};


	hawk.crypto = {

	    headerVersion: '1',

	    algorithms: ['sha1', 'sha256'],

	    calculateMac: function (type, credentials, options) {

	        const normalized = hawk.crypto.generateNormalizedString(type, options);

	        const hmac = CryptoJS['Hmac' + credentials.algorithm.toUpperCase()](normalized, credentials.key);
	        return hmac.toString(CryptoJS.enc.Base64);
	    },

	    generateNormalizedString: function (type, options) {

	        let normalized = 'hawk.' + hawk.crypto.headerVersion + '.' + type + '\n' +
	                         options.ts + '\n' +
	                         options.nonce + '\n' +
	                         (options.method || '').toUpperCase() + '\n' +
	                         (options.resource || '') + '\n' +
	                         options.host.toLowerCase() + '\n' +
	                         options.port + '\n' +
	                         (options.hash || '') + '\n';

	        if (options.ext) {
	            normalized += options.ext.replace('\\', '\\\\').replace('\n', '\\n');
	        }

	        normalized += '\n';

	        if (options.app) {
	            normalized += options.app + '\n' +
	                          (options.dlg || '') + '\n';
	        }

	        return normalized;
	    },

	    calculatePayloadHash: function (payload, algorithm, contentType) {

	        const hash = CryptoJS.algo[algorithm.toUpperCase()].create();
	        hash.update('hawk.' + hawk.crypto.headerVersion + '.payload\n');
	        hash.update(hawk.utils.parseContentType(contentType) + '\n');
	        hash.update(payload);
	        hash.update('\n');
	        return hash.finalize().toString(CryptoJS.enc.Base64);
	    },

	    calculateTsMac: function (ts, credentials) {

	        const hash = CryptoJS['Hmac' + credentials.algorithm.toUpperCase()]('hawk.' + hawk.crypto.headerVersion + '.ts\n' + ts + '\n', credentials.key);
	        return hash.toString(CryptoJS.enc.Base64);
	    }
	};


	// localStorage compatible interface

	hawk.internals.LocalStorage = function () {

	    this._cache = {};
	    this.length = 0;

	    this.getItem = function (key) {

	        return this._cache.hasOwnProperty(key) ? String(this._cache[key]) : null;
	    };

	    this.setItem = function (key, value) {

	        this._cache[key] = String(value);
	        this.length = Object.keys(this._cache).length;
	    };

	    this.removeItem = function (key) {

	        delete this._cache[key];
	        this.length = Object.keys(this._cache).length;
	    };

	    this.clear = function () {

	        this._cache = {};
	        this.length = 0;
	    };

	    this.key = function (i) {

	        return Object.keys(this._cache)[i || 0];
	    };
	};


	hawk.utils = {

	    storage: new hawk.internals.LocalStorage(),

	    setStorage: function (storage) {

	        const ntpOffset = hawk.utils.storage.getItem('hawk_ntp_offset');
	        hawk.utils.storage = storage;
	        if (ntpOffset) {
	            hawk.utils.setNtpSecOffset(ntpOffset);
	        }
	    },

	    setNtpSecOffset: function (offset) {

	        try {
	            hawk.utils.storage.setItem('hawk_ntp_offset', offset);
	        }
	        catch (err) {
	            console.error('[hawk] could not write to storage.');
	            console.error(err);
	        }
	    },

	    getNtpSecOffset: function () {

	        const offset = hawk.utils.storage.getItem('hawk_ntp_offset');
	        if (!offset) {
	            return 0;
	        }

	        return parseInt(offset, 10);
	    },

	    now: function (localtimeOffsetMsec) {

	        return Date.now() + (localtimeOffsetMsec || 0) + (hawk.utils.getNtpSecOffset() * 1000);
	    },

	    nowSec: function (localtimeOffsetMsec) {

	        return Math.floor(hawk.utils.now(localtimeOffsetMsec) / 1000);
	    },

	    escapeHeaderAttribute: function (attribute) {

	        return attribute.replace(/\\/g, '\\\\').replace(/\"/g, '\\"');
	    },

	    parseContentType: function (header) {

	        if (!header) {
	            return '';
	        }

	        return header.split(';')[0].replace(/^\s+|\s+$/g, '').toLowerCase();
	    },

	    parseAuthorizationHeader: function (header, keys) {

	        if (!header) {
	            return null;
	        }

	        const headerParts = header.match(/^(\w+)(?:\s+(.*))?$/);       // Header: scheme[ something]
	        if (!headerParts) {
	            return null;
	        }

	        const scheme = headerParts[1];
	        if (scheme.toLowerCase() !== 'hawk') {
	            return null;
	        }

	        const attributesString = headerParts[2];
	        if (!attributesString) {
	            return null;
	        }

	        const attributes = {};
	        const verify = attributesString.replace(/(\w+)="([^"\\]*)"\s*(?:,\s*|$)/g, ($0, $1, $2) => {

	            // Check valid attribute names

	            if (keys.indexOf($1) === -1) {
	                return;
	            }

	            // Allowed attribute value characters: !#$%&'()*+,-./:;<=>?@[]^_`{|}~ and space, a-z, A-Z, 0-9

	            if ($2.match(/^[ \w\!#\$%&'\(\)\*\+,\-\.\/\:;<\=>\?@\[\]\^`\{\|\}~]+$/) === null) {
	                return;
	            }

	            // Check for duplicates

	            if (attributes.hasOwnProperty($1)) {
	                return;
	            }

	            attributes[$1] = $2;
	            return '';
	        });

	        if (verify !== '') {
	            return null;
	        }

	        return attributes;
	    },

	    randomString: function (size) {

	        const randomSource = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	        const len = randomSource.length;

	        const result = [];
	        for (let i = 0; i < size; ++i) {
	            result[i] = randomSource[Math.floor(Math.random() * len)];
	        }

	        return result.join('');
	    },

	    //          1                        2             3      4
	    uriRegex: /^([^:]+)\:\/\/(?:[^@/]*@)?([^\/:]+)(?:\:(\d+))?([^#]*)(?:#.*)?$/,       // scheme://credentials@host:port/resource#fragment
	    parseUri: function (input) {

	        const parts = input.match(hawk.utils.uriRegex);
	        if (!parts) {
	            return { host: '', port: '', resource: '' };
	        }

	        const scheme = parts[1].toLowerCase();
	        const uri = {
	            host: parts[2],
	            port: parts[3] || (scheme === 'http' ? '80' : (scheme === 'https' ? '443' : '')),
	            resource: parts[4]
	        };

	        return uri;
	    },

	    base64urlEncode: function (value) {

	        const wordArray = CryptoJS.enc.Utf8.parse(value);
	        const encoded = CryptoJS.enc.Base64.stringify(wordArray);
	        return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
	    }
	};


	// $lab:coverage:off$
	/* eslint-disable */

	// Based on: Crypto-JS v3.1.2
	// Copyright (c) 2009-2013, Jeff Mott. All rights reserved.
	// http://code.google.com/p/crypto-js/
	// http://code.google.com/p/crypto-js/wiki/License

	var CryptoJS = CryptoJS || function (h, r) { var k = {}, l = k.lib = {}, n = function () { }, f = l.Base = { extend: function (a) { n.prototype = this; var b = new n; a && b.mixIn(a); b.hasOwnProperty("init") || (b.init = function () { b.$super.init.apply(this, arguments) }); b.init.prototype = b; b.$super = this; return b }, create: function () { var a = this.extend(); a.init.apply(a, arguments); return a }, init: function () { }, mixIn: function (a) { for (let b in a) a.hasOwnProperty(b) && (this[b] = a[b]); a.hasOwnProperty("toString") && (this.toString = a.toString) }, clone: function () { return this.init.prototype.extend(this) } }, j = l.WordArray = f.extend({ init: function (a, b) { a = this.words = a || []; this.sigBytes = b != r ? b : 4 * a.length }, toString: function (a) { return (a || s).stringify(this) }, concat: function (a) { var b = this.words, d = a.words, c = this.sigBytes; a = a.sigBytes; this.clamp(); if (c % 4) for (let e = 0; e < a; e++) b[c + e >>> 2] |= (d[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 24 - 8 * ((c + e) % 4); else if (65535 < d.length) for (let e = 0; e < a; e += 4) b[c + e >>> 2] = d[e >>> 2]; else b.push.apply(b, d); this.sigBytes += a; return this }, clamp: function () { var a = this.words, b = this.sigBytes; a[b >>> 2] &= 4294967295 << 32 - 8 * (b % 4); a.length = h.ceil(b / 4) }, clone: function () { var a = f.clone.call(this); a.words = this.words.slice(0); return a }, random: function (a) { for (let b = [], d = 0; d < a; d += 4) b.push(4294967296 * h.random() | 0); return new j.init(b, a) } }), m = k.enc = {}, s = m.Hex = { stringify: function (a) { var b = a.words; a = a.sigBytes; for (var d = [], c = 0; c < a; c++) { var e = b[c >>> 2] >>> 24 - 8 * (c % 4) & 255; d.push((e >>> 4).toString(16)); d.push((e & 15).toString(16)) } return d.join("") }, parse: function (a) { for (var b = a.length, d = [], c = 0; c < b; c += 2) d[c >>> 3] |= parseInt(a.substr(c, 2), 16) << 24 - 4 * (c % 8); return new j.init(d, b / 2) } }, p = m.Latin1 = { stringify: function (a) { var b = a.words; a = a.sigBytes; for (var d = [], c = 0; c < a; c++) d.push(String.fromCharCode(b[c >>> 2] >>> 24 - 8 * (c % 4) & 255)); return d.join("") }, parse: function (a) { for (var b = a.length, d = [], c = 0; c < b; c++) d[c >>> 2] |= (a.charCodeAt(c) & 255) << 24 - 8 * (c % 4); return new j.init(d, b) } }, t = m.Utf8 = { stringify: function (a) { try { return decodeURIComponent(escape(p.stringify(a))) } catch (b) { throw Error("Malformed UTF-8 data"); } }, parse: function (a) { return p.parse(unescape(encodeURIComponent(a))) } }, q = l.BufferedBlockAlgorithm = f.extend({ reset: function () { this._data = new j.init; this._nDataBytes = 0 }, _append: function (a) { "string" == typeof a && (a = t.parse(a)); this._data.concat(a); this._nDataBytes += a.sigBytes }, _process: function (a) { var b = this._data, d = b.words, c = b.sigBytes, e = this.blockSize, f = c / (4 * e), f = a ? h.ceil(f) : h.max((f | 0) - this._minBufferSize, 0); a = f * e; c = h.min(4 * a, c); if (a) { for (var g = 0; g < a; g += e) this._doProcessBlock(d, g); g = d.splice(0, a); b.sigBytes -= c } return new j.init(g, c) }, clone: function () { var a = f.clone.call(this); a._data = this._data.clone(); return a }, _minBufferSize: 0 }); l.Hasher = q.extend({ cfg: f.extend(), init: function (a) { this.cfg = this.cfg.extend(a); this.reset() }, reset: function () { q.reset.call(this); this._doReset() }, update: function (a) { this._append(a); this._process(); return this }, finalize: function (a) { a && this._append(a); return this._doFinalize() }, blockSize: 16, _createHelper: function (a) { return function (b, d) { return (new a.init(d)).finalize(b) } }, _createHmacHelper: function (a) { return function (b, d) { return (new u.HMAC.init(a, d)).finalize(b) } } }); var u = k.algo = {}; return k }(Math);
	(() => { var k = CryptoJS, b = k.lib, m = b.WordArray, l = b.Hasher, d = [], b = k.algo.SHA1 = l.extend({ _doReset: function () { this._hash = new m.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520]) }, _doProcessBlock: function (n, p) { for (var a = this._hash.words, e = a[0], f = a[1], h = a[2], j = a[3], b = a[4], c = 0; 80 > c; c++) { if (16 > c) d[c] = n[p + c] | 0; else { var g = d[c - 3] ^ d[c - 8] ^ d[c - 14] ^ d[c - 16]; d[c] = g << 1 | g >>> 31 } g = (e << 5 | e >>> 27) + b + d[c]; g = 20 > c ? g + ((f & h | ~f & j) + 1518500249) : 40 > c ? g + ((f ^ h ^ j) + 1859775393) : 60 > c ? g + ((f & h | f & j | h & j) - 1894007588) : g + ((f ^ h ^ j) - 899497514); b = j; j = h; h = f << 30 | f >>> 2; f = e; e = g } a[0] = a[0] + e | 0; a[1] = a[1] + f | 0; a[2] = a[2] + h | 0; a[3] = a[3] + j | 0; a[4] = a[4] + b | 0 }, _doFinalize: function () { var b = this._data, d = b.words, a = 8 * this._nDataBytes, e = 8 * b.sigBytes; d[e >>> 5] |= 128 << 24 - e % 32; d[(e + 64 >>> 9 << 4) + 14] = Math.floor(a / 4294967296); d[(e + 64 >>> 9 << 4) + 15] = a; b.sigBytes = 4 * d.length; this._process(); return this._hash }, clone: function () { var b = l.clone.call(this); b._hash = this._hash.clone(); return b } }); k.SHA1 = l._createHelper(b); k.HmacSHA1 = l._createHmacHelper(b) })();
	(function (k) { for (var g = CryptoJS, h = g.lib, v = h.WordArray, j = h.Hasher, h = g.algo, s = [], t = [], u = function (q) { return 4294967296 * (q - (q | 0)) | 0 }, l = 2, b = 0; 64 > b;) { var d; a: { d = l; for (var w = k.sqrt(d), r = 2; r <= w; r++) if (!(d % r)) { d = !1; break a } d = !0 } d && (8 > b && (s[b] = u(k.pow(l, 0.5))), t[b] = u(k.pow(l, 1 / 3)), b++); l++ } var n = [], h = h.SHA256 = j.extend({ _doReset: function () { this._hash = new v.init(s.slice(0)) }, _doProcessBlock: function (q, h) { for (var a = this._hash.words, c = a[0], d = a[1], b = a[2], k = a[3], f = a[4], g = a[5], j = a[6], l = a[7], e = 0; 64 > e; e++) { if (16 > e) n[e] = q[h + e] | 0; else { var m = n[e - 15], p = n[e - 2]; n[e] = ((m << 25 | m >>> 7) ^ (m << 14 | m >>> 18) ^ m >>> 3) + n[e - 7] + ((p << 15 | p >>> 17) ^ (p << 13 | p >>> 19) ^ p >>> 10) + n[e - 16] } m = l + ((f << 26 | f >>> 6) ^ (f << 21 | f >>> 11) ^ (f << 7 | f >>> 25)) + (f & g ^ ~f & j) + t[e] + n[e]; p = ((c << 30 | c >>> 2) ^ (c << 19 | c >>> 13) ^ (c << 10 | c >>> 22)) + (c & d ^ c & b ^ d & b); l = j; j = g; g = f; f = k + m | 0; k = b; b = d; d = c; c = m + p | 0 } a[0] = a[0] + c | 0; a[1] = a[1] + d | 0; a[2] = a[2] + b | 0; a[3] = a[3] + k | 0; a[4] = a[4] + f | 0; a[5] = a[5] + g | 0; a[6] = a[6] + j | 0; a[7] = a[7] + l | 0 }, _doFinalize: function () { var d = this._data, b = d.words, a = 8 * this._nDataBytes, c = 8 * d.sigBytes; b[c >>> 5] |= 128 << 24 - c % 32; b[(c + 64 >>> 9 << 4) + 14] = k.floor(a / 4294967296); b[(c + 64 >>> 9 << 4) + 15] = a; d.sigBytes = 4 * b.length; this._process(); return this._hash }, clone: function () { var b = j.clone.call(this); b._hash = this._hash.clone(); return b } }); g.SHA256 = j._createHelper(h); g.HmacSHA256 = j._createHmacHelper(h) })(Math);
	(() => { var c = CryptoJS, k = c.enc.Utf8; c.algo.HMAC = c.lib.Base.extend({ init: function (a, b) { a = this._hasher = new a.init; "string" == typeof b && (b = k.parse(b)); var c = a.blockSize, e = 4 * c; b.sigBytes > e && (b = a.finalize(b)); b.clamp(); for (var f = this._oKey = b.clone(), g = this._iKey = b.clone(), h = f.words, j = g.words, d = 0; d < c; d++) h[d] ^= 1549556828, j[d] ^= 909522486; f.sigBytes = g.sigBytes = e; this.reset() }, reset: function () { var a = this._hasher; a.reset(); a.update(this._iKey) }, update: function (a) { this._hasher.update(a); return this }, finalize: function (a) { var b = this._hasher; a = b.finalize(a); b.reset(); return b.finalize(this._oKey.clone().concat(a)) } }) })();
	(() => { var h = CryptoJS, j = h.lib.WordArray; h.enc.Base64 = { stringify: function (b) { var e = b.words, f = b.sigBytes, c = this._map; b.clamp(); b = []; for (var a = 0; a < f; a += 3) for (var d = (e[a >>> 2] >>> 24 - 8 * (a % 4) & 255) << 16 | (e[a + 1 >>> 2] >>> 24 - 8 * ((a + 1) % 4) & 255) << 8 | e[a + 2 >>> 2] >>> 24 - 8 * ((a + 2) % 4) & 255, g = 0; 4 > g && a + 0.75 * g < f; g++) b.push(c.charAt(d >>> 6 * (3 - g) & 63)); if (e = c.charAt(64)) for (; b.length % 4;) b.push(e); return b.join("") }, parse: function (b) { var e = b.length, f = this._map, c = f.charAt(64); c && (c = b.indexOf(c), -1 != c && (e = c)); for (var c = [], a = 0, d = 0; d < e; d++) if (d % 4) { var g = f.indexOf(b.charAt(d - 1)) << 2 * (d % 4), h = f.indexOf(b.charAt(d)) >>> 6 - 2 * (d % 4); c[a >>> 2] |= (g | h) << 24 - 8 * (a % 4); a++ } return j.create(c, a) }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" } })();


	hawk.crypto.utils = CryptoJS;

	// Export if used as a module

	if (typeof module !== 'undefined' && module.exports) {
	    module.exports = hawk;
	}

	/* eslint-enable */
	// $lab:coverage:on$


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

	var createElement = __webpack_require__(38)

	module.exports = createElement


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

	var document = __webpack_require__(39)

	var applyProperties = __webpack_require__(41)

	var isVNode = __webpack_require__(44)
	var isVText = __webpack_require__(46)
	var isWidget = __webpack_require__(47)
	var handleThunk = __webpack_require__(48)

	module.exports = createElement

	function createElement(vnode, opts) {
	    var doc = opts ? opts.document || document : document
	    var warn = opts ? opts.warn : null

	    vnode = handleThunk(vnode).a

	    if (isWidget(vnode)) {
	        return vnode.init()
	    } else if (isVText(vnode)) {
	        return doc.createTextNode(vnode.text)
	    } else if (!isVNode(vnode)) {
	        if (warn) {
	            warn("Item is not a valid virtual dom node", vnode)
	        }
	        return null
	    }

	    var node = (vnode.namespace === null) ?
	        doc.createElement(vnode.tagName) :
	        doc.createElementNS(vnode.namespace, vnode.tagName)

	    var props = vnode.properties
	    applyProperties(node, props)

	    var children = vnode.children

	    for (var i = 0; i < children.length; i++) {
	        var childNode = createElement(children[i], opts)
	        if (childNode) {
	            node.appendChild(childNode)
	        }
	    }

	    return node
	}


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var topLevel = typeof global !== 'undefined' ? global :
	    typeof window !== 'undefined' ? window : {}
	var minDoc = __webpack_require__(40);

	var doccy;

	if (typeof document !== 'undefined') {
	    doccy = document;
	} else {
	    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

	    if (!doccy) {
	        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
	    }
	}

	module.exports = doccy;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 40 */
/***/ (function(module, exports) {

	/* (ignored) */

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(42)
	var isHook = __webpack_require__(43)

	module.exports = applyProperties

	function applyProperties(node, props, previous) {
	    for (var propName in props) {
	        var propValue = props[propName]

	        if (propValue === undefined) {
	            removeProperty(node, propName, propValue, previous);
	        } else if (isHook(propValue)) {
	            removeProperty(node, propName, propValue, previous)
	            if (propValue.hook) {
	                propValue.hook(node,
	                    propName,
	                    previous ? previous[propName] : undefined)
	            }
	        } else {
	            if (isObject(propValue)) {
	                patchObject(node, props, previous, propName, propValue);
	            } else {
	                node[propName] = propValue
	            }
	        }
	    }
	}

	function removeProperty(node, propName, propValue, previous) {
	    if (previous) {
	        var previousValue = previous[propName]

	        if (!isHook(previousValue)) {
	            if (propName === "attributes") {
	                for (var attrName in previousValue) {
	                    node.removeAttribute(attrName)
	                }
	            } else if (propName === "style") {
	                for (var i in previousValue) {
	                    node.style[i] = ""
	                }
	            } else if (typeof previousValue === "string") {
	                node[propName] = ""
	            } else {
	                node[propName] = null
	            }
	        } else if (previousValue.unhook) {
	            previousValue.unhook(node, propName, propValue)
	        }
	    }
	}

	function patchObject(node, props, previous, propName, propValue) {
	    var previousValue = previous ? previous[propName] : undefined

	    // Set attributes
	    if (propName === "attributes") {
	        for (var attrName in propValue) {
	            var attrValue = propValue[attrName]

	            if (attrValue === undefined) {
	                node.removeAttribute(attrName)
	            } else {
	                node.setAttribute(attrName, attrValue)
	            }
	        }

	        return
	    }

	    if(previousValue && isObject(previousValue) &&
	        getPrototype(previousValue) !== getPrototype(propValue)) {
	        node[propName] = propValue
	        return
	    }

	    if (!isObject(node[propName])) {
	        node[propName] = {}
	    }

	    var replacer = propName === "style" ? "" : undefined

	    for (var k in propValue) {
	        var value = propValue[k]
	        node[propName][k] = (value === undefined) ? replacer : value
	    }
	}

	function getPrototype(value) {
	    if (Object.getPrototypeOf) {
	        return Object.getPrototypeOf(value)
	    } else if (value.__proto__) {
	        return value.__proto__
	    } else if (value.constructor) {
	        return value.constructor.prototype
	    }
	}


/***/ }),
/* 42 */
/***/ (function(module, exports) {

	"use strict";

	module.exports = function isObject(x) {
		return typeof x === "object" && x !== null;
	};


/***/ }),
/* 43 */
/***/ (function(module, exports) {

	module.exports = isHook

	function isHook(hook) {
	    return hook &&
	      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
	       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
	}


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	var version = __webpack_require__(45)

	module.exports = isVirtualNode

	function isVirtualNode(x) {
	    return x && x.type === "VirtualNode" && x.version === version
	}


/***/ }),
/* 45 */
/***/ (function(module, exports) {

	module.exports = "2"


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

	var version = __webpack_require__(45)

	module.exports = isVirtualText

	function isVirtualText(x) {
	    return x && x.type === "VirtualText" && x.version === version
	}


/***/ }),
/* 47 */
/***/ (function(module, exports) {

	module.exports = isWidget

	function isWidget(w) {
	    return w && w.type === "Widget"
	}


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	var isVNode = __webpack_require__(44)
	var isVText = __webpack_require__(46)
	var isWidget = __webpack_require__(47)
	var isThunk = __webpack_require__(49)

	module.exports = handleThunk

	function handleThunk(a, b) {
	    var renderedA = a
	    var renderedB = b

	    if (isThunk(b)) {
	        renderedB = renderThunk(b, a)
	    }

	    if (isThunk(a)) {
	        renderedA = renderThunk(a, null)
	    }

	    return {
	        a: renderedA,
	        b: renderedB
	    }
	}

	function renderThunk(thunk, previous) {
	    var renderedThunk = thunk.vnode

	    if (!renderedThunk) {
	        renderedThunk = thunk.vnode = thunk.render(previous)
	    }

	    if (!(isVNode(renderedThunk) ||
	            isVText(renderedThunk) ||
	            isWidget(renderedThunk))) {
	        throw new Error("thunk did not return a valid node");
	    }

	    return renderedThunk
	}


/***/ }),
/* 49 */
/***/ (function(module, exports) {

	module.exports = isThunk

	function isThunk(t) {
	    return t && t.type === "Thunk"
	}


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

	var diff = __webpack_require__(51)

	module.exports = diff


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(52)

	var VPatch = __webpack_require__(53)
	var isVNode = __webpack_require__(44)
	var isVText = __webpack_require__(46)
	var isWidget = __webpack_require__(47)
	var isThunk = __webpack_require__(49)
	var handleThunk = __webpack_require__(48)

	var diffProps = __webpack_require__(54)

	module.exports = diff

	function diff(a, b) {
	    var patch = { a: a }
	    walk(a, b, patch, 0)
	    return patch
	}

	function walk(a, b, patch, index) {
	    if (a === b) {
	        return
	    }

	    var apply = patch[index]
	    var applyClear = false

	    if (isThunk(a) || isThunk(b)) {
	        thunks(a, b, patch, index)
	    } else if (b == null) {

	        // If a is a widget we will add a remove patch for it
	        // Otherwise any child widgets/hooks must be destroyed.
	        // This prevents adding two remove patches for a widget.
	        if (!isWidget(a)) {
	            clearState(a, patch, index)
	            apply = patch[index]
	        }

	        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
	    } else if (isVNode(b)) {
	        if (isVNode(a)) {
	            if (a.tagName === b.tagName &&
	                a.namespace === b.namespace &&
	                a.key === b.key) {
	                var propsPatch = diffProps(a.properties, b.properties)
	                if (propsPatch) {
	                    apply = appendPatch(apply,
	                        new VPatch(VPatch.PROPS, a, propsPatch))
	                }
	                apply = diffChildren(a, b, patch, apply, index)
	            } else {
	                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
	                applyClear = true
	            }
	        } else {
	            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
	            applyClear = true
	        }
	    } else if (isVText(b)) {
	        if (!isVText(a)) {
	            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
	            applyClear = true
	        } else if (a.text !== b.text) {
	            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
	        }
	    } else if (isWidget(b)) {
	        if (!isWidget(a)) {
	            applyClear = true
	        }

	        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))
	    }

	    if (apply) {
	        patch[index] = apply
	    }

	    if (applyClear) {
	        clearState(a, patch, index)
	    }
	}

	function diffChildren(a, b, patch, apply, index) {
	    var aChildren = a.children
	    var orderedSet = reorder(aChildren, b.children)
	    var bChildren = orderedSet.children

	    var aLen = aChildren.length
	    var bLen = bChildren.length
	    var len = aLen > bLen ? aLen : bLen

	    for (var i = 0; i < len; i++) {
	        var leftNode = aChildren[i]
	        var rightNode = bChildren[i]
	        index += 1

	        if (!leftNode) {
	            if (rightNode) {
	                // Excess nodes in b need to be added
	                apply = appendPatch(apply,
	                    new VPatch(VPatch.INSERT, null, rightNode))
	            }
	        } else {
	            walk(leftNode, rightNode, patch, index)
	        }

	        if (isVNode(leftNode) && leftNode.count) {
	            index += leftNode.count
	        }
	    }

	    if (orderedSet.moves) {
	        // Reorder nodes last
	        apply = appendPatch(apply, new VPatch(
	            VPatch.ORDER,
	            a,
	            orderedSet.moves
	        ))
	    }

	    return apply
	}

	function clearState(vNode, patch, index) {
	    // TODO: Make this a single walk, not two
	    unhook(vNode, patch, index)
	    destroyWidgets(vNode, patch, index)
	}

	// Patch records for all destroyed widgets must be added because we need
	// a DOM node reference for the destroy function
	function destroyWidgets(vNode, patch, index) {
	    if (isWidget(vNode)) {
	        if (typeof vNode.destroy === "function") {
	            patch[index] = appendPatch(
	                patch[index],
	                new VPatch(VPatch.REMOVE, vNode, null)
	            )
	        }
	    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
	        var children = vNode.children
	        var len = children.length
	        for (var i = 0; i < len; i++) {
	            var child = children[i]
	            index += 1

	            destroyWidgets(child, patch, index)

	            if (isVNode(child) && child.count) {
	                index += child.count
	            }
	        }
	    } else if (isThunk(vNode)) {
	        thunks(vNode, null, patch, index)
	    }
	}

	// Create a sub-patch for thunks
	function thunks(a, b, patch, index) {
	    var nodes = handleThunk(a, b)
	    var thunkPatch = diff(nodes.a, nodes.b)
	    if (hasPatches(thunkPatch)) {
	        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch)
	    }
	}

	function hasPatches(patch) {
	    for (var index in patch) {
	        if (index !== "a") {
	            return true
	        }
	    }

	    return false
	}

	// Execute hooks when two nodes are identical
	function unhook(vNode, patch, index) {
	    if (isVNode(vNode)) {
	        if (vNode.hooks) {
	            patch[index] = appendPatch(
	                patch[index],
	                new VPatch(
	                    VPatch.PROPS,
	                    vNode,
	                    undefinedKeys(vNode.hooks)
	                )
	            )
	        }

	        if (vNode.descendantHooks || vNode.hasThunks) {
	            var children = vNode.children
	            var len = children.length
	            for (var i = 0; i < len; i++) {
	                var child = children[i]
	                index += 1

	                unhook(child, patch, index)

	                if (isVNode(child) && child.count) {
	                    index += child.count
	                }
	            }
	        }
	    } else if (isThunk(vNode)) {
	        thunks(vNode, null, patch, index)
	    }
	}

	function undefinedKeys(obj) {
	    var result = {}

	    for (var key in obj) {
	        result[key] = undefined
	    }

	    return result
	}

	// List diff, naive left to right reordering
	function reorder(aChildren, bChildren) {
	    // O(M) time, O(M) memory
	    var bChildIndex = keyIndex(bChildren)
	    var bKeys = bChildIndex.keys
	    var bFree = bChildIndex.free

	    if (bFree.length === bChildren.length) {
	        return {
	            children: bChildren,
	            moves: null
	        }
	    }

	    // O(N) time, O(N) memory
	    var aChildIndex = keyIndex(aChildren)
	    var aKeys = aChildIndex.keys
	    var aFree = aChildIndex.free

	    if (aFree.length === aChildren.length) {
	        return {
	            children: bChildren,
	            moves: null
	        }
	    }

	    // O(MAX(N, M)) memory
	    var newChildren = []

	    var freeIndex = 0
	    var freeCount = bFree.length
	    var deletedItems = 0

	    // Iterate through a and match a node in b
	    // O(N) time,
	    for (var i = 0 ; i < aChildren.length; i++) {
	        var aItem = aChildren[i]
	        var itemIndex

	        if (aItem.key) {
	            if (bKeys.hasOwnProperty(aItem.key)) {
	                // Match up the old keys
	                itemIndex = bKeys[aItem.key]
	                newChildren.push(bChildren[itemIndex])

	            } else {
	                // Remove old keyed items
	                itemIndex = i - deletedItems++
	                newChildren.push(null)
	            }
	        } else {
	            // Match the item in a with the next free item in b
	            if (freeIndex < freeCount) {
	                itemIndex = bFree[freeIndex++]
	                newChildren.push(bChildren[itemIndex])
	            } else {
	                // There are no free items in b to match with
	                // the free items in a, so the extra free nodes
	                // are deleted.
	                itemIndex = i - deletedItems++
	                newChildren.push(null)
	            }
	        }
	    }

	    var lastFreeIndex = freeIndex >= bFree.length ?
	        bChildren.length :
	        bFree[freeIndex]

	    // Iterate through b and append any new keys
	    // O(M) time
	    for (var j = 0; j < bChildren.length; j++) {
	        var newItem = bChildren[j]

	        if (newItem.key) {
	            if (!aKeys.hasOwnProperty(newItem.key)) {
	                // Add any new keyed items
	                // We are adding new items to the end and then sorting them
	                // in place. In future we should insert new items in place.
	                newChildren.push(newItem)
	            }
	        } else if (j >= lastFreeIndex) {
	            // Add any leftover non-keyed items
	            newChildren.push(newItem)
	        }
	    }

	    var simulate = newChildren.slice()
	    var simulateIndex = 0
	    var removes = []
	    var inserts = []
	    var simulateItem

	    for (var k = 0; k < bChildren.length;) {
	        var wantedItem = bChildren[k]
	        simulateItem = simulate[simulateIndex]

	        // remove items
	        while (simulateItem === null && simulate.length) {
	            removes.push(remove(simulate, simulateIndex, null))
	            simulateItem = simulate[simulateIndex]
	        }

	        if (!simulateItem || simulateItem.key !== wantedItem.key) {
	            // if we need a key in this position...
	            if (wantedItem.key) {
	                if (simulateItem && simulateItem.key) {
	                    // if an insert doesn't put this key in place, it needs to move
	                    if (bKeys[simulateItem.key] !== k + 1) {
	                        removes.push(remove(simulate, simulateIndex, simulateItem.key))
	                        simulateItem = simulate[simulateIndex]
	                        // if the remove didn't put the wanted item in place, we need to insert it
	                        if (!simulateItem || simulateItem.key !== wantedItem.key) {
	                            inserts.push({key: wantedItem.key, to: k})
	                        }
	                        // items are matching, so skip ahead
	                        else {
	                            simulateIndex++
	                        }
	                    }
	                    else {
	                        inserts.push({key: wantedItem.key, to: k})
	                    }
	                }
	                else {
	                    inserts.push({key: wantedItem.key, to: k})
	                }
	                k++
	            }
	            // a key in simulate has no matching wanted key, remove it
	            else if (simulateItem && simulateItem.key) {
	                removes.push(remove(simulate, simulateIndex, simulateItem.key))
	            }
	        }
	        else {
	            simulateIndex++
	            k++
	        }
	    }

	    // remove all the remaining nodes from simulate
	    while(simulateIndex < simulate.length) {
	        simulateItem = simulate[simulateIndex]
	        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key))
	    }

	    // If the only moves we have are deletes then we can just
	    // let the delete patch remove these items.
	    if (removes.length === deletedItems && !inserts.length) {
	        return {
	            children: newChildren,
	            moves: null
	        }
	    }

	    return {
	        children: newChildren,
	        moves: {
	            removes: removes,
	            inserts: inserts
	        }
	    }
	}

	function remove(arr, index, key) {
	    arr.splice(index, 1)

	    return {
	        from: index,
	        key: key
	    }
	}

	function keyIndex(children) {
	    var keys = {}
	    var free = []
	    var length = children.length

	    for (var i = 0; i < length; i++) {
	        var child = children[i]

	        if (child.key) {
	            keys[child.key] = i
	        } else {
	            free.push(i)
	        }
	    }

	    return {
	        keys: keys,     // A hash of key name to index
	        free: free      // An array of unkeyed item indices
	    }
	}

	function appendPatch(apply, patch) {
	    if (apply) {
	        if (isArray(apply)) {
	            apply.push(patch)
	        } else {
	            apply = [apply, patch]
	        }

	        return apply
	    } else {
	        return patch
	    }
	}


/***/ }),
/* 52 */
/***/ (function(module, exports) {

	var nativeIsArray = Array.isArray
	var toString = Object.prototype.toString

	module.exports = nativeIsArray || isArray

	function isArray(obj) {
	    return toString.call(obj) === "[object Array]"
	}


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	var version = __webpack_require__(45)

	VirtualPatch.NONE = 0
	VirtualPatch.VTEXT = 1
	VirtualPatch.VNODE = 2
	VirtualPatch.WIDGET = 3
	VirtualPatch.PROPS = 4
	VirtualPatch.ORDER = 5
	VirtualPatch.INSERT = 6
	VirtualPatch.REMOVE = 7
	VirtualPatch.THUNK = 8

	module.exports = VirtualPatch

	function VirtualPatch(type, vNode, patch) {
	    this.type = Number(type)
	    this.vNode = vNode
	    this.patch = patch
	}

	VirtualPatch.prototype.version = version
	VirtualPatch.prototype.type = "VirtualPatch"


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(42)
	var isHook = __webpack_require__(43)

	module.exports = diffProps

	function diffProps(a, b) {
	    var diff

	    for (var aKey in a) {
	        if (!(aKey in b)) {
	            diff = diff || {}
	            diff[aKey] = undefined
	        }

	        var aValue = a[aKey]
	        var bValue = b[aKey]

	        if (aValue === bValue) {
	            continue
	        } else if (isObject(aValue) && isObject(bValue)) {
	            if (getPrototype(bValue) !== getPrototype(aValue)) {
	                diff = diff || {}
	                diff[aKey] = bValue
	            } else if (isHook(bValue)) {
	                 diff = diff || {}
	                 diff[aKey] = bValue
	            } else {
	                var objectDiff = diffProps(aValue, bValue)
	                if (objectDiff) {
	                    diff = diff || {}
	                    diff[aKey] = objectDiff
	                }
	            }
	        } else {
	            diff = diff || {}
	            diff[aKey] = bValue
	        }
	    }

	    for (var bKey in b) {
	        if (!(bKey in a)) {
	            diff = diff || {}
	            diff[bKey] = b[bKey]
	        }
	    }

	    return diff
	}

	function getPrototype(value) {
	  if (Object.getPrototypeOf) {
	    return Object.getPrototypeOf(value)
	  } else if (value.__proto__) {
	    return value.__proto__
	  } else if (value.constructor) {
	    return value.constructor.prototype
	  }
	}


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * EventEmitter v4.2.11 - git.io/ee
	 * Unlicense - http://unlicense.org/
	 * Oliver Caldwell - http://oli.me.uk/
	 * @preserve
	 */

	;(function () {
	    'use strict';

	    /**
	     * Class for managing events.
	     * Can be extended to provide event functionality in other classes.
	     *
	     * @class EventEmitter Manages event registering and emitting.
	     */
	    function EventEmitter() {}

	    // Shortcuts to improve speed and size
	    var proto = EventEmitter.prototype;
	    var exports = this;
	    var originalGlobalValue = exports.EventEmitter;

	    /**
	     * Finds the index of the listener for the event in its storage array.
	     *
	     * @param {Function[]} listeners Array of listeners to search through.
	     * @param {Function} listener Method to look for.
	     * @return {Number} Index of the specified listener, -1 if not found
	     * @api private
	     */
	    function indexOfListener(listeners, listener) {
	        var i = listeners.length;
	        while (i--) {
	            if (listeners[i].listener === listener) {
	                return i;
	            }
	        }

	        return -1;
	    }

	    /**
	     * Alias a method while keeping the context correct, to allow for overwriting of target method.
	     *
	     * @param {String} name The name of the target method.
	     * @return {Function} The aliased method
	     * @api private
	     */
	    function alias(name) {
	        return function aliasClosure() {
	            return this[name].apply(this, arguments);
	        };
	    }

	    /**
	     * Returns the listener array for the specified event.
	     * Will initialise the event object and listener arrays if required.
	     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
	     * Each property in the object response is an array of listener functions.
	     *
	     * @param {String|RegExp} evt Name of the event to return the listeners from.
	     * @return {Function[]|Object} All listener functions for the event.
	     */
	    proto.getListeners = function getListeners(evt) {
	        var events = this._getEvents();
	        var response;
	        var key;

	        // Return a concatenated array of all matching events if
	        // the selector is a regular expression.
	        if (evt instanceof RegExp) {
	            response = {};
	            for (key in events) {
	                if (events.hasOwnProperty(key) && evt.test(key)) {
	                    response[key] = events[key];
	                }
	            }
	        }
	        else {
	            response = events[evt] || (events[evt] = []);
	        }

	        return response;
	    };

	    /**
	     * Takes a list of listener objects and flattens it into a list of listener functions.
	     *
	     * @param {Object[]} listeners Raw listener objects.
	     * @return {Function[]} Just the listener functions.
	     */
	    proto.flattenListeners = function flattenListeners(listeners) {
	        var flatListeners = [];
	        var i;

	        for (i = 0; i < listeners.length; i += 1) {
	            flatListeners.push(listeners[i].listener);
	        }

	        return flatListeners;
	    };

	    /**
	     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
	     *
	     * @param {String|RegExp} evt Name of the event to return the listeners from.
	     * @return {Object} All listener functions for an event in an object.
	     */
	    proto.getListenersAsObject = function getListenersAsObject(evt) {
	        var listeners = this.getListeners(evt);
	        var response;

	        if (listeners instanceof Array) {
	            response = {};
	            response[evt] = listeners;
	        }

	        return response || listeners;
	    };

	    /**
	     * Adds a listener function to the specified event.
	     * The listener will not be added if it is a duplicate.
	     * If the listener returns true then it will be removed after it is called.
	     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to attach the listener to.
	     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.addListener = function addListener(evt, listener) {
	        var listeners = this.getListenersAsObject(evt);
	        var listenerIsWrapped = typeof listener === 'object';
	        var key;

	        for (key in listeners) {
	            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
	                listeners[key].push(listenerIsWrapped ? listener : {
	                    listener: listener,
	                    once: false
	                });
	            }
	        }

	        return this;
	    };

	    /**
	     * Alias of addListener
	     */
	    proto.on = alias('addListener');

	    /**
	     * Semi-alias of addListener. It will add a listener that will be
	     * automatically removed after its first execution.
	     *
	     * @param {String|RegExp} evt Name of the event to attach the listener to.
	     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.addOnceListener = function addOnceListener(evt, listener) {
	        return this.addListener(evt, {
	            listener: listener,
	            once: true
	        });
	    };

	    /**
	     * Alias of addOnceListener.
	     */
	    proto.once = alias('addOnceListener');

	    /**
	     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
	     * You need to tell it what event names should be matched by a regex.
	     *
	     * @param {String} evt Name of the event to create.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.defineEvent = function defineEvent(evt) {
	        this.getListeners(evt);
	        return this;
	    };

	    /**
	     * Uses defineEvent to define multiple events.
	     *
	     * @param {String[]} evts An array of event names to define.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.defineEvents = function defineEvents(evts) {
	        for (var i = 0; i < evts.length; i += 1) {
	            this.defineEvent(evts[i]);
	        }
	        return this;
	    };

	    /**
	     * Removes a listener function from the specified event.
	     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to remove the listener from.
	     * @param {Function} listener Method to remove from the event.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.removeListener = function removeListener(evt, listener) {
	        var listeners = this.getListenersAsObject(evt);
	        var index;
	        var key;

	        for (key in listeners) {
	            if (listeners.hasOwnProperty(key)) {
	                index = indexOfListener(listeners[key], listener);

	                if (index !== -1) {
	                    listeners[key].splice(index, 1);
	                }
	            }
	        }

	        return this;
	    };

	    /**
	     * Alias of removeListener
	     */
	    proto.off = alias('removeListener');

	    /**
	     * Adds listeners in bulk using the manipulateListeners method.
	     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
	     * You can also pass it a regular expression to add the array of listeners to all events that match it.
	     * Yeah, this function does quite a bit. That's probably a bad thing.
	     *
	     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
	     * @param {Function[]} [listeners] An optional array of listener functions to add.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.addListeners = function addListeners(evt, listeners) {
	        // Pass through to manipulateListeners
	        return this.manipulateListeners(false, evt, listeners);
	    };

	    /**
	     * Removes listeners in bulk using the manipulateListeners method.
	     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	     * You can also pass it an event name and an array of listeners to be removed.
	     * You can also pass it a regular expression to remove the listeners from all events that match it.
	     *
	     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
	     * @param {Function[]} [listeners] An optional array of listener functions to remove.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.removeListeners = function removeListeners(evt, listeners) {
	        // Pass through to manipulateListeners
	        return this.manipulateListeners(true, evt, listeners);
	    };

	    /**
	     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
	     * The first argument will determine if the listeners are removed (true) or added (false).
	     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	     * You can also pass it an event name and an array of listeners to be added/removed.
	     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
	     *
	     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
	     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
	     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
	        var i;
	        var value;
	        var single = remove ? this.removeListener : this.addListener;
	        var multiple = remove ? this.removeListeners : this.addListeners;

	        // If evt is an object then pass each of its properties to this method
	        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
	            for (i in evt) {
	                if (evt.hasOwnProperty(i) && (value = evt[i])) {
	                    // Pass the single listener straight through to the singular method
	                    if (typeof value === 'function') {
	                        single.call(this, i, value);
	                    }
	                    else {
	                        // Otherwise pass back to the multiple function
	                        multiple.call(this, i, value);
	                    }
	                }
	            }
	        }
	        else {
	            // So evt must be a string
	            // And listeners must be an array of listeners
	            // Loop over it and pass each one to the multiple method
	            i = listeners.length;
	            while (i--) {
	                single.call(this, evt, listeners[i]);
	            }
	        }

	        return this;
	    };

	    /**
	     * Removes all listeners from a specified event.
	     * If you do not specify an event then all listeners will be removed.
	     * That means every event will be emptied.
	     * You can also pass a regex to remove all events that match it.
	     *
	     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.removeEvent = function removeEvent(evt) {
	        var type = typeof evt;
	        var events = this._getEvents();
	        var key;

	        // Remove different things depending on the state of evt
	        if (type === 'string') {
	            // Remove all listeners for the specified event
	            delete events[evt];
	        }
	        else if (evt instanceof RegExp) {
	            // Remove all events matching the regex.
	            for (key in events) {
	                if (events.hasOwnProperty(key) && evt.test(key)) {
	                    delete events[key];
	                }
	            }
	        }
	        else {
	            // Remove all listeners in all events
	            delete this._events;
	        }

	        return this;
	    };

	    /**
	     * Alias of removeEvent.
	     *
	     * Added to mirror the node API.
	     */
	    proto.removeAllListeners = alias('removeEvent');

	    /**
	     * Emits an event of your choice.
	     * When emitted, every listener attached to that event will be executed.
	     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
	     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
	     * So they will not arrive within the array on the other side, they will be separate.
	     * You can also pass a regular expression to emit to all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	     * @param {Array} [args] Optional array of arguments to be passed to each listener.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.emitEvent = function emitEvent(evt, args) {
	        var listenersMap = this.getListenersAsObject(evt);
	        var listeners;
	        var listener;
	        var i;
	        var key;
	        var response;

	        for (key in listenersMap) {
	            if (listenersMap.hasOwnProperty(key)) {
	                listeners = listenersMap[key].slice(0);
	                i = listeners.length;

	                while (i--) {
	                    // If the listener returns true then it shall be removed from the event
	                    // The function is executed either with a basic call or an apply if there is an args array
	                    listener = listeners[i];

	                    if (listener.once === true) {
	                        this.removeListener(evt, listener.listener);
	                    }

	                    response = listener.listener.apply(this, args || []);

	                    if (response === this._getOnceReturnValue()) {
	                        this.removeListener(evt, listener.listener);
	                    }
	                }
	            }
	        }

	        return this;
	    };

	    /**
	     * Alias of emitEvent
	     */
	    proto.trigger = alias('emitEvent');

	    /**
	     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
	     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	     * @param {...*} Optional additional arguments to be passed to each listener.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.emit = function emit(evt) {
	        var args = Array.prototype.slice.call(arguments, 1);
	        return this.emitEvent(evt, args);
	    };

	    /**
	     * Sets the current value to check against when executing listeners. If a
	     * listeners return value matches the one set here then it will be removed
	     * after execution. This value defaults to true.
	     *
	     * @param {*} value The new value to check for when executing listeners.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.setOnceReturnValue = function setOnceReturnValue(value) {
	        this._onceReturnValue = value;
	        return this;
	    };

	    /**
	     * Fetches the current value to check against when executing listeners. If
	     * the listeners return value matches this one then it should be removed
	     * automatically. It will return true by default.
	     *
	     * @return {*|Boolean} The current value to check for or the default, true.
	     * @api private
	     */
	    proto._getOnceReturnValue = function _getOnceReturnValue() {
	        if (this.hasOwnProperty('_onceReturnValue')) {
	            return this._onceReturnValue;
	        }
	        else {
	            return true;
	        }
	    };

	    /**
	     * Fetches the events object and creates one if required.
	     *
	     * @return {Object} The events storage object.
	     * @api private
	     */
	    proto._getEvents = function _getEvents() {
	        return this._events || (this._events = {});
	    };

	    /**
	     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
	     *
	     * @return {Function} Non conflicting EventEmitter class.
	     */
	    EventEmitter.noConflict = function noConflict() {
	        exports.EventEmitter = originalGlobalValue;
	        return EventEmitter;
	    };

	    // Expose the class either via AMD, CommonJS or the global object
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	            return EventEmitter;
	        }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    }
	    else if (typeof module === 'object' && module.exports){
	        module.exports = EventEmitter;
	    }
	    else {
	        exports.EventEmitter = EventEmitter;
	    }
	}.call(this));


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var buttonGroup = __webpack_require__(57);
	var formGroup = __webpack_require__(75);
	var indicator = __webpack_require__(76);
	var notification = __webpack_require__(77);
	var status = __webpack_require__(78);
	var VNode = __webpack_require__(58).VNode;

	/**
	 * Form.
	 *
	 * @param {object} props
	 * @param {function} props.onSubmit
	 * @param {string} [props.errorMessage]
	 * @param {boolean} [props.horizontal=false]
	 * @param {boolean} [props.isLoading=false]
	 * @param {boolean} [props.isLoggedIn=false]
	 * @param {string} [props.redirectUrl] URL to redirect to when logged in
	 * @param {string} [props.passwordProps]
	 * @param {string} [props.username]
	 * @param {string} [props.usernameProps]
	 * @returns {VNode}
	 */
	function form(props) {
	    var errorMessage = props.errorMessage;
	    var horizontal = !!props.horizontal;
	    var inputs = props.inputs;
	    var isLoading = typeof props.isLoading !== 'undefined' ?
	        props.isLoading :
	        false;
	    var isLoggedIn = typeof props.isLoggedIn !== 'undefined' ?
	        props.isLoggedIn :
	        false;
	    var onSubmit = props.onSubmit;
	    var passwordProps = props.passwordProps;
	    var redirectUrl = props.redirectUrl;
	    var username = props.username;
	    var usernameProps = props.usernameProps;

	    var children = [];
	    var className = 'coins-logon-widget-form';
	    var buttonGroupProps;
	    var passwordFormGroupProps;
	    var usernameFormGroupProps;

	    if (horizontal) {
	        className += ' coins-logon-widget-form-horizontal';
	    }

	    if (isLoggedIn) {
	        buttonGroupProps = [{
	            style: 'secondary',
	            text: 'Log Out',
	            type: 'submit',
	        }];

	        if (redirectUrl) {
	            buttonGroupProps.push({
	                href: redirectUrl,
	                text: 'Go to COINS →',
	                type: 'link',
	            });
	        };

	        children.push(
	            status({ username: username }),
	            buttonGroup.apply(null, buttonGroupProps)
	        );
	    } else {
	        if (errorMessage) {
	            children.push(notification({ text: errorMessage }));
	            className += ' coins-logon-widget-form-error';
	        } else {
	            children.push(new VNode('div', { className: 'no-alert' }));
	        }

	        children.push(
	            formGroup(usernameProps),
	            formGroup(passwordProps),
	            buttonGroup({
	                text: 'Log In',
	                type: 'submit',
	            })
	        );
	    }

	    if (isLoading) {
	        children.push(indicator());
	        className += ' coins-logon-widget-form-loading';
	    }

	    return new VNode(
	        'form',
	        {
	            className: className,
	            onsubmit: function(event) {
	                event.preventDefault();
	                onSubmit(event);
	            },

	            method: 'post'
	        },
	        children
	    );
	}

	module.exports = form;


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var VNode = __webpack_require__(58).VNode;
	var VText = __webpack_require__(58).VText;

	/**
	 * Button.
	 * @private
	 *
	 * @param {object} props
	 * @param {string} props.text
	 * @param {string} [props.href]
	 * @param {function} [props.onClick]
	 * @param {string} [props.style=primary]
	 * @param {string} [props.type=button]
	 * @returns {VNode}
	 */
	function _button(props) {
	    var className = 'coins-logon-widget-button';
	    var href = props.href;
	    var onClick = props.onClick;
	    var style = props.style || 'primary';
	    var text = props.text;
	    var type = props.type || 'button';

	    className += ' coins-logon-widget-button-' + style;

	    var properties = {
	        className: className,
	    };
	    var tag;

	    if (type === 'link') {
	        tag = 'a';

	        if (href) {
	            properties.href = href;
	        }
	    } else {
	        tag = 'button';
	        properties.type = type;
	    }

	    if (onClick) {
	        properties.onclick = function(event) {
	            event.preventDefault();
	            onClick(event);
	        };
	    }

	    return new VNode(tag, properties, [new VText(text)]);
	}

	/**
	 * Button group.
	 *
	 * @see button
	 *
	 * @{param} {...object} props Properties passed to `button`
	 * @returns {VNode}
	 */
	function buttonGroup(props) {
	    var children = arguments.length > 1 ?
	        [].slice.call(arguments).map(_button) :
	        [_button(props)];
	    var className = 'coins-logon-widget-button-group';

	    return new VNode('div', { className: className }, children);
	}

	module.exports = buttonGroup;


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

	var diff = __webpack_require__(50)
	var patch = __webpack_require__(59)
	var h = __webpack_require__(64)
	var create = __webpack_require__(37)
	var VNode = __webpack_require__(66)
	var VText = __webpack_require__(67)

	module.exports = {
	    diff: diff,
	    patch: patch,
	    h: h,
	    create: create,
	    VNode: VNode,
	    VText: VText
	}


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

	var patch = __webpack_require__(60)

	module.exports = patch


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

	var document = __webpack_require__(39)
	var isArray = __webpack_require__(52)

	var render = __webpack_require__(38)
	var domIndex = __webpack_require__(61)
	var patchOp = __webpack_require__(62)
	module.exports = patch

	function patch(rootNode, patches, renderOptions) {
	    renderOptions = renderOptions || {}
	    renderOptions.patch = renderOptions.patch && renderOptions.patch !== patch
	        ? renderOptions.patch
	        : patchRecursive
	    renderOptions.render = renderOptions.render || render

	    return renderOptions.patch(rootNode, patches, renderOptions)
	}

	function patchRecursive(rootNode, patches, renderOptions) {
	    var indices = patchIndices(patches)

	    if (indices.length === 0) {
	        return rootNode
	    }

	    var index = domIndex(rootNode, patches.a, indices)
	    var ownerDocument = rootNode.ownerDocument

	    if (!renderOptions.document && ownerDocument !== document) {
	        renderOptions.document = ownerDocument
	    }

	    for (var i = 0; i < indices.length; i++) {
	        var nodeIndex = indices[i]
	        rootNode = applyPatch(rootNode,
	            index[nodeIndex],
	            patches[nodeIndex],
	            renderOptions)
	    }

	    return rootNode
	}

	function applyPatch(rootNode, domNode, patchList, renderOptions) {
	    if (!domNode) {
	        return rootNode
	    }

	    var newNode

	    if (isArray(patchList)) {
	        for (var i = 0; i < patchList.length; i++) {
	            newNode = patchOp(patchList[i], domNode, renderOptions)

	            if (domNode === rootNode) {
	                rootNode = newNode
	            }
	        }
	    } else {
	        newNode = patchOp(patchList, domNode, renderOptions)

	        if (domNode === rootNode) {
	            rootNode = newNode
	        }
	    }

	    return rootNode
	}

	function patchIndices(patches) {
	    var indices = []

	    for (var key in patches) {
	        if (key !== "a") {
	            indices.push(Number(key))
	        }
	    }

	    return indices
	}


/***/ }),
/* 61 */
/***/ (function(module, exports) {

	// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
	// We don't want to read all of the DOM nodes in the tree so we use
	// the in-order tree indexing to eliminate recursion down certain branches.
	// We only recurse into a DOM node if we know that it contains a child of
	// interest.

	var noChild = {}

	module.exports = domIndex

	function domIndex(rootNode, tree, indices, nodes) {
	    if (!indices || indices.length === 0) {
	        return {}
	    } else {
	        indices.sort(ascending)
	        return recurse(rootNode, tree, indices, nodes, 0)
	    }
	}

	function recurse(rootNode, tree, indices, nodes, rootIndex) {
	    nodes = nodes || {}


	    if (rootNode) {
	        if (indexInRange(indices, rootIndex, rootIndex)) {
	            nodes[rootIndex] = rootNode
	        }

	        var vChildren = tree.children

	        if (vChildren) {

	            var childNodes = rootNode.childNodes

	            for (var i = 0; i < tree.children.length; i++) {
	                rootIndex += 1

	                var vChild = vChildren[i] || noChild
	                var nextIndex = rootIndex + (vChild.count || 0)

	                // skip recursion down the tree if there are no nodes down here
	                if (indexInRange(indices, rootIndex, nextIndex)) {
	                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
	                }

	                rootIndex = nextIndex
	            }
	        }
	    }

	    return nodes
	}

	// Binary search for an index in the interval [left, right]
	function indexInRange(indices, left, right) {
	    if (indices.length === 0) {
	        return false
	    }

	    var minIndex = 0
	    var maxIndex = indices.length - 1
	    var currentIndex
	    var currentItem

	    while (minIndex <= maxIndex) {
	        currentIndex = ((maxIndex + minIndex) / 2) >> 0
	        currentItem = indices[currentIndex]

	        if (minIndex === maxIndex) {
	            return currentItem >= left && currentItem <= right
	        } else if (currentItem < left) {
	            minIndex = currentIndex + 1
	        } else  if (currentItem > right) {
	            maxIndex = currentIndex - 1
	        } else {
	            return true
	        }
	    }

	    return false;
	}

	function ascending(a, b) {
	    return a > b ? 1 : -1
	}


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

	var applyProperties = __webpack_require__(41)

	var isWidget = __webpack_require__(47)
	var VPatch = __webpack_require__(53)

	var updateWidget = __webpack_require__(63)

	module.exports = applyPatch

	function applyPatch(vpatch, domNode, renderOptions) {
	    var type = vpatch.type
	    var vNode = vpatch.vNode
	    var patch = vpatch.patch

	    switch (type) {
	        case VPatch.REMOVE:
	            return removeNode(domNode, vNode)
	        case VPatch.INSERT:
	            return insertNode(domNode, patch, renderOptions)
	        case VPatch.VTEXT:
	            return stringPatch(domNode, vNode, patch, renderOptions)
	        case VPatch.WIDGET:
	            return widgetPatch(domNode, vNode, patch, renderOptions)
	        case VPatch.VNODE:
	            return vNodePatch(domNode, vNode, patch, renderOptions)
	        case VPatch.ORDER:
	            reorderChildren(domNode, patch)
	            return domNode
	        case VPatch.PROPS:
	            applyProperties(domNode, patch, vNode.properties)
	            return domNode
	        case VPatch.THUNK:
	            return replaceRoot(domNode,
	                renderOptions.patch(domNode, patch, renderOptions))
	        default:
	            return domNode
	    }
	}

	function removeNode(domNode, vNode) {
	    var parentNode = domNode.parentNode

	    if (parentNode) {
	        parentNode.removeChild(domNode)
	    }

	    destroyWidget(domNode, vNode);

	    return null
	}

	function insertNode(parentNode, vNode, renderOptions) {
	    var newNode = renderOptions.render(vNode, renderOptions)

	    if (parentNode) {
	        parentNode.appendChild(newNode)
	    }

	    return parentNode
	}

	function stringPatch(domNode, leftVNode, vText, renderOptions) {
	    var newNode

	    if (domNode.nodeType === 3) {
	        domNode.replaceData(0, domNode.length, vText.text)
	        newNode = domNode
	    } else {
	        var parentNode = domNode.parentNode
	        newNode = renderOptions.render(vText, renderOptions)

	        if (parentNode && newNode !== domNode) {
	            parentNode.replaceChild(newNode, domNode)
	        }
	    }

	    return newNode
	}

	function widgetPatch(domNode, leftVNode, widget, renderOptions) {
	    var updating = updateWidget(leftVNode, widget)
	    var newNode

	    if (updating) {
	        newNode = widget.update(leftVNode, domNode) || domNode
	    } else {
	        newNode = renderOptions.render(widget, renderOptions)
	    }

	    var parentNode = domNode.parentNode

	    if (parentNode && newNode !== domNode) {
	        parentNode.replaceChild(newNode, domNode)
	    }

	    if (!updating) {
	        destroyWidget(domNode, leftVNode)
	    }

	    return newNode
	}

	function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
	    var parentNode = domNode.parentNode
	    var newNode = renderOptions.render(vNode, renderOptions)

	    if (parentNode && newNode !== domNode) {
	        parentNode.replaceChild(newNode, domNode)
	    }

	    return newNode
	}

	function destroyWidget(domNode, w) {
	    if (typeof w.destroy === "function" && isWidget(w)) {
	        w.destroy(domNode)
	    }
	}

	function reorderChildren(domNode, moves) {
	    var childNodes = domNode.childNodes
	    var keyMap = {}
	    var node
	    var remove
	    var insert

	    for (var i = 0; i < moves.removes.length; i++) {
	        remove = moves.removes[i]
	        node = childNodes[remove.from]
	        if (remove.key) {
	            keyMap[remove.key] = node
	        }
	        domNode.removeChild(node)
	    }

	    var length = childNodes.length
	    for (var j = 0; j < moves.inserts.length; j++) {
	        insert = moves.inserts[j]
	        node = keyMap[insert.key]
	        // this is the weirdest bug i've ever seen in webkit
	        domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
	    }
	}

	function replaceRoot(oldRoot, newRoot) {
	    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
	        oldRoot.parentNode.replaceChild(newRoot, oldRoot)
	    }

	    return newRoot;
	}


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

	var isWidget = __webpack_require__(47)

	module.exports = updateWidget

	function updateWidget(a, b) {
	    if (isWidget(a) && isWidget(b)) {
	        if ("name" in a && "name" in b) {
	            return a.id === b.id
	        } else {
	            return a.init === b.init
	        }
	    }

	    return false
	}


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

	var h = __webpack_require__(65)

	module.exports = h


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var isArray = __webpack_require__(52);

	var VNode = __webpack_require__(66);
	var VText = __webpack_require__(67);
	var isVNode = __webpack_require__(44);
	var isVText = __webpack_require__(46);
	var isWidget = __webpack_require__(47);
	var isHook = __webpack_require__(43);
	var isVThunk = __webpack_require__(49);

	var parseTag = __webpack_require__(68);
	var softSetHook = __webpack_require__(70);
	var evHook = __webpack_require__(71);

	module.exports = h;

	function h(tagName, properties, children) {
	    var childNodes = [];
	    var tag, props, key, namespace;

	    if (!children && isChildren(properties)) {
	        children = properties;
	        props = {};
	    }

	    props = props || properties || {};
	    tag = parseTag(tagName, props);

	    // support keys
	    if (props.hasOwnProperty('key')) {
	        key = props.key;
	        props.key = undefined;
	    }

	    // support namespace
	    if (props.hasOwnProperty('namespace')) {
	        namespace = props.namespace;
	        props.namespace = undefined;
	    }

	    // fix cursor bug
	    if (tag === 'INPUT' &&
	        !namespace &&
	        props.hasOwnProperty('value') &&
	        props.value !== undefined &&
	        !isHook(props.value)
	    ) {
	        props.value = softSetHook(props.value);
	    }

	    transformProperties(props);

	    if (children !== undefined && children !== null) {
	        addChild(children, childNodes, tag, props);
	    }


	    return new VNode(tag, props, childNodes, key, namespace);
	}

	function addChild(c, childNodes, tag, props) {
	    if (typeof c === 'string') {
	        childNodes.push(new VText(c));
	    } else if (typeof c === 'number') {
	        childNodes.push(new VText(String(c)));
	    } else if (isChild(c)) {
	        childNodes.push(c);
	    } else if (isArray(c)) {
	        for (var i = 0; i < c.length; i++) {
	            addChild(c[i], childNodes, tag, props);
	        }
	    } else if (c === null || c === undefined) {
	        return;
	    } else {
	        throw UnexpectedVirtualElement({
	            foreignObject: c,
	            parentVnode: {
	                tagName: tag,
	                properties: props
	            }
	        });
	    }
	}

	function transformProperties(props) {
	    for (var propName in props) {
	        if (props.hasOwnProperty(propName)) {
	            var value = props[propName];

	            if (isHook(value)) {
	                continue;
	            }

	            if (propName.substr(0, 3) === 'ev-') {
	                // add ev-foo support
	                props[propName] = evHook(value);
	            }
	        }
	    }
	}

	function isChild(x) {
	    return isVNode(x) || isVText(x) || isWidget(x) || isVThunk(x);
	}

	function isChildren(x) {
	    return typeof x === 'string' || isArray(x) || isChild(x);
	}

	function UnexpectedVirtualElement(data) {
	    var err = new Error();

	    err.type = 'virtual-hyperscript.unexpected.virtual-element';
	    err.message = 'Unexpected virtual child passed to h().\n' +
	        'Expected a VNode / Vthunk / VWidget / string but:\n' +
	        'got:\n' +
	        errorString(data.foreignObject) +
	        '.\n' +
	        'The parent vnode is:\n' +
	        errorString(data.parentVnode)
	        '\n' +
	        'Suggested fix: change your `h(..., [ ... ])` callsite.';
	    err.foreignObject = data.foreignObject;
	    err.parentVnode = data.parentVnode;

	    return err;
	}

	function errorString(obj) {
	    try {
	        return JSON.stringify(obj, null, '    ');
	    } catch (e) {
	        return String(obj);
	    }
	}


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

	var version = __webpack_require__(45)
	var isVNode = __webpack_require__(44)
	var isWidget = __webpack_require__(47)
	var isThunk = __webpack_require__(49)
	var isVHook = __webpack_require__(43)

	module.exports = VirtualNode

	var noProperties = {}
	var noChildren = []

	function VirtualNode(tagName, properties, children, key, namespace) {
	    this.tagName = tagName
	    this.properties = properties || noProperties
	    this.children = children || noChildren
	    this.key = key != null ? String(key) : undefined
	    this.namespace = (typeof namespace === "string") ? namespace : null

	    var count = (children && children.length) || 0
	    var descendants = 0
	    var hasWidgets = false
	    var hasThunks = false
	    var descendantHooks = false
	    var hooks

	    for (var propName in properties) {
	        if (properties.hasOwnProperty(propName)) {
	            var property = properties[propName]
	            if (isVHook(property) && property.unhook) {
	                if (!hooks) {
	                    hooks = {}
	                }

	                hooks[propName] = property
	            }
	        }
	    }

	    for (var i = 0; i < count; i++) {
	        var child = children[i]
	        if (isVNode(child)) {
	            descendants += child.count || 0

	            if (!hasWidgets && child.hasWidgets) {
	                hasWidgets = true
	            }

	            if (!hasThunks && child.hasThunks) {
	                hasThunks = true
	            }

	            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
	                descendantHooks = true
	            }
	        } else if (!hasWidgets && isWidget(child)) {
	            if (typeof child.destroy === "function") {
	                hasWidgets = true
	            }
	        } else if (!hasThunks && isThunk(child)) {
	            hasThunks = true;
	        }
	    }

	    this.count = count + descendants
	    this.hasWidgets = hasWidgets
	    this.hasThunks = hasThunks
	    this.hooks = hooks
	    this.descendantHooks = descendantHooks
	}

	VirtualNode.prototype.version = version
	VirtualNode.prototype.type = "VirtualNode"


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

	var version = __webpack_require__(45)

	module.exports = VirtualText

	function VirtualText(text) {
	    this.text = String(text)
	}

	VirtualText.prototype.version = version
	VirtualText.prototype.type = "VirtualText"


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var split = __webpack_require__(69);

	var classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
	var notClassId = /^\.|#/;

	module.exports = parseTag;

	function parseTag(tag, props) {
	    if (!tag) {
	        return 'DIV';
	    }

	    var noId = !(props.hasOwnProperty('id'));

	    var tagParts = split(tag, classIdSplit);
	    var tagName = null;

	    if (notClassId.test(tagParts[1])) {
	        tagName = 'DIV';
	    }

	    var classes, part, type, i;

	    for (i = 0; i < tagParts.length; i++) {
	        part = tagParts[i];

	        if (!part) {
	            continue;
	        }

	        type = part.charAt(0);

	        if (!tagName) {
	            tagName = part;
	        } else if (type === '.') {
	            classes = classes || [];
	            classes.push(part.substring(1, part.length));
	        } else if (type === '#' && noId) {
	            props.id = part.substring(1, part.length);
	        }
	    }

	    if (classes) {
	        if (props.className) {
	            classes.push(props.className);
	        }

	        props.className = classes.join(' ');
	    }

	    return props.namespace ? tagName : tagName.toUpperCase();
	}


/***/ }),
/* 69 */
/***/ (function(module, exports) {

	/*!
	 * Cross-Browser Split 1.1.1
	 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
	 * Available under the MIT License
	 * ECMAScript compliant, uniform cross-browser split method
	 */

	/**
	 * Splits a string into an array of strings using a regex or string separator. Matches of the
	 * separator are not included in the result array. However, if `separator` is a regex that contains
	 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
	 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
	 * cross-browser.
	 * @param {String} str String to split.
	 * @param {RegExp|String} separator Regex or string to use for separating the string.
	 * @param {Number} [limit] Maximum number of items to include in the result array.
	 * @returns {Array} Array of substrings.
	 * @example
	 *
	 * // Basic use
	 * split('a b c d', ' ');
	 * // -> ['a', 'b', 'c', 'd']
	 *
	 * // With limit
	 * split('a b c d', ' ', 2);
	 * // -> ['a', 'b']
	 *
	 * // Backreferences in result array
	 * split('..word1 word2..', /([a-z]+)(\d+)/i);
	 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
	 */
	module.exports = (function split(undef) {

	  var nativeSplit = String.prototype.split,
	    compliantExecNpcg = /()??/.exec("")[1] === undef,
	    // NPCG: nonparticipating capturing group
	    self;

	  self = function(str, separator, limit) {
	    // If `separator` is not a regex, use `nativeSplit`
	    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
	      return nativeSplit.call(str, separator, limit);
	    }
	    var output = [],
	      flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
	      (separator.sticky ? "y" : ""),
	      // Firefox 3+
	      lastLastIndex = 0,
	      // Make `global` and avoid `lastIndex` issues by working with a copy
	      separator = new RegExp(separator.source, flags + "g"),
	      separator2, match, lastIndex, lastLength;
	    str += ""; // Type-convert
	    if (!compliantExecNpcg) {
	      // Doesn't need flags gy, but they don't hurt
	      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
	    }
	    /* Values for `limit`, per the spec:
	     * If undefined: 4294967295 // Math.pow(2, 32) - 1
	     * If 0, Infinity, or NaN: 0
	     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
	     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
	     * If other: Type-convert, then use the above rules
	     */
	    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
	    limit >>> 0; // ToUint32(limit)
	    while (match = separator.exec(str)) {
	      // `separator.lastIndex` is not reliable cross-browser
	      lastIndex = match.index + match[0].length;
	      if (lastIndex > lastLastIndex) {
	        output.push(str.slice(lastLastIndex, match.index));
	        // Fix browsers whose `exec` methods don't consistently return `undefined` for
	        // nonparticipating capturing groups
	        if (!compliantExecNpcg && match.length > 1) {
	          match[0].replace(separator2, function() {
	            for (var i = 1; i < arguments.length - 2; i++) {
	              if (arguments[i] === undef) {
	                match[i] = undef;
	              }
	            }
	          });
	        }
	        if (match.length > 1 && match.index < str.length) {
	          Array.prototype.push.apply(output, match.slice(1));
	        }
	        lastLength = match[0].length;
	        lastLastIndex = lastIndex;
	        if (output.length >= limit) {
	          break;
	        }
	      }
	      if (separator.lastIndex === match.index) {
	        separator.lastIndex++; // Avoid an infinite loop
	      }
	    }
	    if (lastLastIndex === str.length) {
	      if (lastLength || !separator.test("")) {
	        output.push("");
	      }
	    } else {
	      output.push(str.slice(lastLastIndex));
	    }
	    return output.length > limit ? output.slice(0, limit) : output;
	  };

	  return self;
	})();


/***/ }),
/* 70 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = SoftSetHook;

	function SoftSetHook(value) {
	    if (!(this instanceof SoftSetHook)) {
	        return new SoftSetHook(value);
	    }

	    this.value = value;
	}

	SoftSetHook.prototype.hook = function (node, propertyName) {
	    if (node[propertyName] !== this.value) {
	        node[propertyName] = this.value;
	    }
	};


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var EvStore = __webpack_require__(72);

	module.exports = EvHook;

	function EvHook(value) {
	    if (!(this instanceof EvHook)) {
	        return new EvHook(value);
	    }

	    this.value = value;
	}

	EvHook.prototype.hook = function (node, propertyName) {
	    var es = EvStore(node);
	    var propName = propertyName.substr(3);

	    es[propName] = this.value;
	};

	EvHook.prototype.unhook = function(node, propertyName) {
	    var es = EvStore(node);
	    var propName = propertyName.substr(3);

	    es[propName] = undefined;
	};


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var OneVersionConstraint = __webpack_require__(73);

	var MY_VERSION = '7';
	OneVersionConstraint('ev-store', MY_VERSION);

	var hashKey = '__EV_STORE_KEY@' + MY_VERSION;

	module.exports = EvStore;

	function EvStore(elem) {
	    var hash = elem[hashKey];

	    if (!hash) {
	        hash = elem[hashKey] = {};
	    }

	    return hash;
	}


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var Individual = __webpack_require__(74);

	module.exports = OneVersion;

	function OneVersion(moduleName, version, defaultValue) {
	    var key = '__INDIVIDUAL_ONE_VERSION_' + moduleName;
	    var enforceKey = key + '_ENFORCE_SINGLETON';

	    var versionValue = Individual(enforceKey, version);

	    if (versionValue !== version) {
	        throw new Error('Can only have one copy of ' +
	            moduleName + '.\n' +
	            'You already have version ' + versionValue +
	            ' installed.\n' +
	            'This means you cannot install version ' + version);
	    }

	    return Individual(key, defaultValue);
	}


/***/ }),
/* 74 */
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	/*global window, global*/

	var root = typeof window !== 'undefined' ?
	    window : typeof global !== 'undefined' ?
	    global : {};

	module.exports = Individual;

	function Individual(key, value) {
	    if (key in root) {
	        return root[key];
	    }

	    root[key] = value;

	    return value;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var VNode = __webpack_require__(58).VNode;
	var VText = __webpack_require__(58).VText;

	/**
	 * Form group.
	 *
	 * @param {object} props
	 * @param {string} props.id
	 * @param {string} props.name
	 * @param {string} [props.errorMessage]
	 * @param {string} [props.type=text]
	 * @param {string} [props.value='']
	 * @returns {VNode}
	 */
	function formGroup(props) {
	    var errorMessage = props.errorMessage;
	    var id = props.id;
	    var name = props.name;
	    var type = props.type || 'text';
	    var value = typeof props.value !== 'undefined' ? props.value : '';

	    var className = 'coins-logon-widget-form-group';
	    var label = name.charAt(0).toUpperCase() + name.substr(1);
	    var inputProperties = {
	        className: 'coins-logon-widget-input',
	        id: id,
	        name: name,
	        placeholder: label,
	        type: type,
	        value: value,
	    };

	    var children = [
	        new VNode(
	            'label',
	            {
	                className: 'coins-logon-widget-label coins-logon-widget-visuallyhidden',
	                for: id,
	            },
	            [new VText(label)]
	        ),
	    ];

	    if (errorMessage) {
	        children.push(
	            new VNode(
	                'span',
	                {
	                    'aria-hidden': 'true',
	                    className: 'coins-logon-widget-icon',
	                }
	            ),
	            new VNode(
	                'span',
	                {
	                    className: 'coins-logon-widget-input-message',
	                },
	                [new VText(errorMessage)]
	            )
	        );
	        className += ' coins-logon-widget-form-group-error';
	        inputProperties.onkeypress = function(event) {
	            props.onKeyPress(event);
	        };
	    }

	    children.splice(1, 0, new VNode('input', inputProperties));

	    return new VNode('div', { className: className }, children);
	}

	module.exports = formGroup;


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var VNode = __webpack_require__(58).VNode;
	var VText = __webpack_require__(58).VText;

	/**
	 * Indicator.
	 *
	 * @returns {VNode}
	 */
	function indicator() {
	    var svgNamespace = 'http://www.w3.org/2000/svg';

	    return new VNode(
	        'div',
	        {
	            className: 'coins-logon-widget-indicator',
	        },
	        [
	            new VNode(
	                'svg',
	                undefined,
	                [
	                    new VNode(
	                        'title',
	                        undefined,
	                        [new VText('Loading…')],
	                        undefined,
	                        svgNamespace
	                    ),
	                    new VNode(
	                        'circle',
	                        {
	                            attributes: {
	                                cx: '20',
	                                cy: '20',
	                                fill: 'none',
	                                r: '8',
	                                'stroke-width': '2',
	                                'stroke-miterlimit': '4',
	                            },
	                        },
	                        undefined,
	                        undefined,
	                        svgNamespace
	                    ),
	                ],
	                undefined,
	                svgNamespace
	            )
	        ]
	    );
	}

	module.exports = indicator;


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var VNode = __webpack_require__(58).VNode;
	var VText = __webpack_require__(58).VText;

	/**
	 * Notification.
	 *
	 * @param {object} props
	 * @param {array|string} props.text An array of virtual-dom objects or plain
	 * text
	 * @returns {VNode}
	 */
	function notification(props) {
	    var properties = {
	        className: [
	            'coins-logon-widget-notification',
	            'coins-logon-widget-notification-error',
	        ].join(' '),
	    };
	    var text = props.text;
	    var children;

	    if (Array.isArray(text)) {
	        children = text;
	    } else if (typeof text === 'string') {
	        if (text.indexOf('<') !== -1 && text.indexOf('>') !== -1) {
	            properties.innerHTML = text;
	        } else {
	            children = [new VText(text)];
	        }
	    }

	    return new VNode('div', properties, children);
	}

	module.exports = notification;


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var VNode = __webpack_require__(58).VNode;
	var VText = __webpack_require__(58).VText;

	/**
	 * Status.
	 *
	 * @param {object} props
	 * @param {string} [props.username]
	 * @returns {VNode}
	 */
	function status(props) {
	    var className = 'coins-logon-widget-status';
	    var username = props.username;
	    var children = !!username ?
	        [
	            new VText('Logged in as '),
	            new VNode('strong', undefined, [new VText(username)]),
	            new VText('.'),
	        ] :
	        [new VText('Logged in.')];

	    return new VNode('p', { className: className }, children);
	}

	module.exports = status;


/***/ }),
/* 79 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = {
	    accountExpired: 'Your account has expired.',
	    accountWillExpire: function(offset) {
	        return 'Your account will expire in ' + offset + '.';
	    },

	    passwordExpired: 'Your password has expired.',
	    passwordWillExpire: function(offset) {
	        return 'Your password will expire in ' + offset + '.';
	    },

	};


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

	var baseToString = __webpack_require__(81);

	/** Used to generate unique IDs. */
	var idCounter = 0;

	/**
	 * Generates a unique ID. If `prefix` is provided the ID is appended to it.
	 *
	 * @static
	 * @memberOf _
	 * @category Utility
	 * @param {string} [prefix] The value to prefix the ID with.
	 * @returns {string} Returns the unique ID.
	 * @example
	 *
	 * _.uniqueId('contact_');
	 * // => 'contact_104'
	 *
	 * _.uniqueId();
	 * // => '105'
	 */
	function uniqueId(prefix) {
	  var id = ++idCounter;
	  return baseToString(prefix) + id;
	}

	module.exports = uniqueId;


/***/ }),
/* 81 */
/***/ (function(module, exports) {

	/**
	 * Converts `value` to a string if it's not one. An empty string is returned
	 * for `null` or `undefined` values.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  return value == null ? '' : (value + '');
	}

	module.exports = baseToString;


/***/ }),
/* 82 */
/***/ (function(module, exports) {

	'use strict';

	function assertElement(element) {
	    if (!element) {
	        throw new TypeError('Element required');
	    } else if (!(element instanceof Node)) {
	        // Make sure `element` is an actual node
	        // http://stackoverflow.com/a/384380
	        throw new TypeError('Expected element to be a DOM node');
	    }

	    return element;
	}

	function assertString(str, prop) {
	    if (!str || typeof str !== 'string') {
	        throw new TypeError([
	            'expected string',
	            prop ? ' (' + prop + ')' : '',
	            ', received: ',
	            str.toString()
	        ].join(''));
	    }

	    return str;
	}

	/**
	 * Call or return a maybe callable argument.
	 *
	 * @param  {mixed} maybeCallable A callable or other primitive that should
	 *                               either be called with arguments or simply
	 *                               returned.
	 * @param  {array} args          Arguments to pass to `maybeCallable` if
	 *                               it is callable.
	 * @return {mixed}               Result of `maybeCallable` if it was
	 *                               callable, otherwise just the value itself.
	 */
	function callOrReturn(maybeCallable, args) {
	    if (maybeCallable instanceof Function) {
	        return maybeCallable.apply(null, args);
	    }

	    return maybeCallable;
	}

	/**
	 * Format day string.
	 *
	 * @param  {number} day
	 * @return {string}
	 */
	function formatDay(day) {
	    if (day < 1) {
	        return 'less than 1 day';
	    } else {
	        return '' + Math.ceil(day) + ' days';
	    }
	}

	module.exports = {
	    assertElement: assertElement,
	    assertString: assertString,
	    callOrReturn: callOrReturn,
	    formatDay: formatDay,
	};


/***/ })
/******/ ])
});
;