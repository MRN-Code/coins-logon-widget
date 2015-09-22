/*!
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
        var listeners = this.getListenersAsObject(evt);
        var listener;
        var i;
        var key;
        var response;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                i = listeners[key].length;

                while (i--) {
                    // If the listener returns true then it shall be removed from the event
                    // The function is executed either with a basic call or an apply if there is an args array
                    listener = listeners[key][i];

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
    if (typeof define === 'function' && define.amd) {
        define('wolfy87-eventemitter/EventEmitter',[],function () {
            return EventEmitter;
        });
    }
    else if (typeof module === 'object' && module.exports){
        module.exports = EventEmitter;
    }
    else {
        exports.EventEmitter = EventEmitter;
    }
}.call(this));

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define('es6-object-assign',[],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ObjectAssign = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Code refactored from Mozilla Developer Network:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 */



function assign(target, firstSource) {
  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert first argument to object');
  }

  var to = Object(target);
  for (var i = 1; i < arguments.length; i++) {
    var nextSource = arguments[i];
    if (nextSource === undefined || nextSource === null) {
      continue;
    }

    var keysArray = Object.keys(Object(nextSource));
    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
      var nextKey = keysArray[nextIndex];
      var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
      if (desc !== undefined && desc.enumerable) {
        to[nextKey] = nextSource[nextKey];
      }
    }
  }
  return to;
}

function polyfill() {
  if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: assign
    });
  }
}

module.exports = {
  assign: assign,
  polyfill: polyfill
};

},{}]},{},[1])(1)
});
/*
    HTTP Hawk Authentication Scheme
    Copyright (c) 2012-2014, Eran Hammer <eran@hammer.io>
    BSD Licensed
*/


// Declare namespace

var hawk = {
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

        var result = {
            field: '',
            artifacts: {}
        };

        // Validate inputs

        if (!uri || (typeof uri !== 'string' && typeof uri !== 'object') ||
            !method || typeof method !== 'string' ||
            !options || typeof options !== 'object') {

            result.err = 'Invalid argument type';
            return result;
        }

        // Application time

        var timestamp = options.timestamp || hawk.utils.now(options.localtimeOffsetMsec);

        // Validate credentials

        var credentials = options.credentials;
        if (!credentials ||
            !credentials.id ||
            !credentials.key ||
            !credentials.algorithm) {

            result.err = 'Invalid credentials object';
            return result;
        }

        if (hawk.crypto.algorithms.indexOf(credentials.algorithm) === -1) {
            result.err = 'Unknown algorithm';
            return result;
        }

        // Parse URI

        if (typeof uri === 'string') {
            uri = hawk.utils.parseUri(uri);
        }

        // Calculate signature

        var artifacts = {
            ts: timestamp,
            nonce: options.nonce || hawk.utils.randomString(6),
            method: method,
            resource: uri.relative,
            host: uri.hostname,
            port: uri.port,
            hash: options.hash,
            ext: options.ext,
            app: options.app,
            dlg: options.dlg
        };

        result.artifacts = artifacts;

        // Calculate payload hash

        if (!artifacts.hash &&
            (options.payload || options.payload === '')) {

            artifacts.hash = hawk.crypto.calculatePayloadHash(options.payload, credentials.algorithm, options.contentType);
        }

        var mac = hawk.crypto.calculateMac('header', credentials, artifacts);

        // Construct header

        var hasExt = artifacts.ext !== null && artifacts.ext !== undefined && artifacts.ext !== '';       // Other falsey values allowed
        var header = 'Hawk id="' + credentials.id +
                     '", ts="' + artifacts.ts +
                     '", nonce="' + artifacts.nonce +
                     (artifacts.hash ? '", hash="' + artifacts.hash : '') +
                     (hasExt ? '", ext="' + hawk.utils.escapeHeaderAttribute(artifacts.ext) : '') +
                     '", mac="' + mac + '"';

        if (artifacts.app) {
            header += ', app="' + artifacts.app +
                      (artifacts.dlg ? '", dlg="' + artifacts.dlg : '') + '"';
        }

        result.field = header;

        return result;
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

            return '';
        }

        options.ext = (options.ext === null || options.ext === undefined ? '' : options.ext);       // Zero is valid value

        // Application time

        var now = hawk.utils.now(options.localtimeOffsetMsec);

        // Validate credentials

        var credentials = options.credentials;
        if (!credentials ||
            !credentials.id ||
            !credentials.key ||
            !credentials.algorithm) {

            return '';
        }

        if (hawk.crypto.algorithms.indexOf(credentials.algorithm) === -1) {
            return '';
        }

        // Parse URI

        uri = hawk.utils.parseUri(uri);

        // Calculate signature

        var exp = now + options.ttlSec;
        var mac = hawk.crypto.calculateMac('bewit', credentials, {
            ts: exp,
            nonce: '',
            method: 'GET',
            resource: uri.relative,                            // Maintain trailing '?' and query params
            host: uri.hostname,
            port: uri.port,
            ext: options.ext
        });

        // Construct bewit: id\exp\mac\ext

        var bewit = credentials.id + '\\' + exp + '\\' + mac + '\\' + options.ext;
        return hawk.utils.base64urlEncode(bewit);
    },

    // Validate server response

    /*
        request:    object created via 'new XMLHttpRequest()' after response received
        artifacts:  object received from header().artifacts
        options: {
            payload:    optional payload received
            required:   specifies if a Server-Authorization header is required. Defaults to 'false'
        }
    */

    authenticate: function (request, credentials, artifacts, options) {

        options = options || {};

        var getHeader = function (name) {

            return request.getResponseHeader ? request.getResponseHeader(name) : request.getHeader(name);
        };

        var wwwAuthenticate = getHeader('www-authenticate');
        if (wwwAuthenticate) {

            // Parse HTTP WWW-Authenticate header

            var wwwAttributes = hawk.utils.parseAuthorizationHeader(wwwAuthenticate, ['ts', 'tsm', 'error']);
            if (!wwwAttributes) {
                return false;
            }

            if (wwwAttributes.ts) {
                var tsm = hawk.crypto.calculateTsMac(wwwAttributes.ts, credentials);
                if (tsm !== wwwAttributes.tsm) {
                    return false;
                }

                hawk.utils.setNtpOffset(wwwAttributes.ts - Math.floor((new Date()).getTime() / 1000));     // Keep offset at 1 second precision
            }
        }

        // Parse HTTP Server-Authorization header

        var serverAuthorization = getHeader('server-authorization');
        if (!serverAuthorization &&
            !options.required) {

            return true;
        }

        var attributes = hawk.utils.parseAuthorizationHeader(serverAuthorization, ['mac', 'ext', 'hash']);
        if (!attributes) {
            return false;
        }

        var modArtifacts = {
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

        var mac = hawk.crypto.calculateMac('response', credentials, modArtifacts);
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

        var calculatedHash = hawk.crypto.calculatePayloadHash(options.payload, credentials.algorithm, getHeader('content-type'));
        return (calculatedHash === attributes.hash);
    },

    message: function (host, port, message, options) {

        // Validate inputs

        if (!host || typeof host !== 'string' ||
            !port || typeof port !== 'number' ||
            message === null || message === undefined || typeof message !== 'string' ||
            !options || typeof options !== 'object') {

            return null;
        }

        // Application time

        var timestamp = options.timestamp || hawk.utils.now(options.localtimeOffsetMsec);

        // Validate credentials

        var credentials = options.credentials;
        if (!credentials ||
            !credentials.id ||
            !credentials.key ||
            !credentials.algorithm) {

            // Invalid credential object
            return null;
        }

        if (hawk.crypto.algorithms.indexOf(credentials.algorithm) === -1) {
            return null;
        }

        // Calculate signature

        var artifacts = {
            ts: timestamp,
            nonce: options.nonce || hawk.utils.randomString(6),
            host: host,
            port: port,
            hash: hawk.crypto.calculatePayloadHash(message, credentials.algorithm)
        };

        // Construct authorization

        var result = {
            id: credentials.id,
            ts: artifacts.ts,
            nonce: artifacts.nonce,
            hash: artifacts.hash,
            mac: hawk.crypto.calculateMac('message', credentials, artifacts)
        };

        return result;
    },

    authenticateTimestamp: function (message, credentials, updateClock) {           // updateClock defaults to true

        var tsm = hawk.crypto.calculateTsMac(message.ts, credentials);
        if (tsm !== message.tsm) {
            return false;
        }

        if (updateClock !== false) {
            hawk.utils.setNtpOffset(message.ts - Math.floor((new Date()).getTime() / 1000));    // Keep offset at 1 second precision
        }

        return true;
    }
};


hawk.crypto = {

    headerVersion: '1',

    algorithms: ['sha1', 'sha256'],

    calculateMac: function (type, credentials, options) {

        var normalized = hawk.crypto.generateNormalizedString(type, options);

        var hmac = CryptoJS['Hmac' + credentials.algorithm.toUpperCase()](normalized, credentials.key);
        return hmac.toString(CryptoJS.enc.Base64);
    },

    generateNormalizedString: function (type, options) {

        var normalized = 'hawk.' + hawk.crypto.headerVersion + '.' + type + '\n' +
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

        var hash = CryptoJS.algo[algorithm.toUpperCase()].create();
        hash.update('hawk.' + hawk.crypto.headerVersion + '.payload\n');
        hash.update(hawk.utils.parseContentType(contentType) + '\n');
        hash.update(payload);
        hash.update('\n');
        return hash.finalize().toString(CryptoJS.enc.Base64);
    },

    calculateTsMac: function (ts, credentials) {

        var hash = CryptoJS['Hmac' + credentials.algorithm.toUpperCase()]('hawk.' + hawk.crypto.headerVersion + '.ts\n' + ts + '\n', credentials.key);
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

        var ntpOffset = hawk.utils.storage.getItem('hawk_ntp_offset');
        hawk.utils.storage = storage;
        if (ntpOffset) {
            hawk.utils.setNtpOffset(ntpOffset);
        }
    },

    setNtpOffset: function (offset) {

        try {
            hawk.utils.storage.setItem('hawk_ntp_offset', offset);
        }
        catch (err) {
            console.error('[hawk] could not write to storage.');
            console.error(err);
        }
    },

    getNtpOffset: function () {

        var offset = hawk.utils.storage.getItem('hawk_ntp_offset');
        if (!offset) {
            return 0;
        }

        return parseInt(offset, 10);
    },

    now: function (localtimeOffsetMsec) {

        return Math.floor(((new Date()).getTime() + (localtimeOffsetMsec || 0)) / 1000) + hawk.utils.getNtpOffset();
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

        var headerParts = header.match(/^(\w+)(?:\s+(.*))?$/);       // Header: scheme[ something]
        if (!headerParts) {
            return null;
        }

        var scheme = headerParts[1];
        if (scheme.toLowerCase() !== 'hawk') {
            return null;
        }

        var attributesString = headerParts[2];
        if (!attributesString) {
            return null;
        }

        var attributes = {};
        var verify = attributesString.replace(/(\w+)="([^"\\]*)"\s*(?:,\s*|$)/g, function ($0, $1, $2) {

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

        var randomSource = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var len = randomSource.length;

        var result = [];
        for (var i = 0; i < size; ++i) {
            result[i] = randomSource[Math.floor(Math.random() * len)];
        }

        return result.join('');
    },

    parseUri: function (input) {

        // Based on: parseURI 1.2.2
        // http://blog.stevenlevithan.com/archives/parseuri
        // (c) Steven Levithan <stevenlevithan.com>
        // MIT License

        var keys = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'hostname', 'port', 'resource', 'relative', 'pathname', 'directory', 'file', 'query', 'fragment'];

        var uriRegex = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?(((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?)(?:#(.*))?)/;
        var uriByNumber = input.match(uriRegex);
        var uri = {};

        for (var i = 0, il = keys.length; i < il; ++i) {
            uri[keys[i]] = uriByNumber[i] || '';
        }

        if (uri.port === '') {
            uri.port = (uri.protocol.toLowerCase() === 'http' ? '80' : (uri.protocol.toLowerCase() === 'https' ? '443' : ''));
        }

        return uri;
    },

    base64urlEncode: function (value) {

        var wordArray = CryptoJS.enc.Utf8.parse(value);
        var encoded = CryptoJS.enc.Base64.stringify(wordArray);
        return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
    }
};


// $lab:coverage:off$
/* eslint-disable */

// Based on: Crypto-JS v3.1.2
// Copyright (c) 2009-2013, Jeff Mott. All rights reserved.
// http://code.google.com/p/crypto-js/
// http://code.google.com/p/crypto-js/wiki/License

var CryptoJS = CryptoJS || function (h, r) { var k = {}, l = k.lib = {}, n = function () { }, f = l.Base = { extend: function (a) { n.prototype = this; var b = new n; a && b.mixIn(a); b.hasOwnProperty("init") || (b.init = function () { b.$super.init.apply(this, arguments) }); b.init.prototype = b; b.$super = this; return b }, create: function () { var a = this.extend(); a.init.apply(a, arguments); return a }, init: function () { }, mixIn: function (a) { for (var b in a) a.hasOwnProperty(b) && (this[b] = a[b]); a.hasOwnProperty("toString") && (this.toString = a.toString) }, clone: function () { return this.init.prototype.extend(this) } }, j = l.WordArray = f.extend({ init: function (a, b) { a = this.words = a || []; this.sigBytes = b != r ? b : 4 * a.length }, toString: function (a) { return (a || s).stringify(this) }, concat: function (a) { var b = this.words, d = a.words, c = this.sigBytes; a = a.sigBytes; this.clamp(); if (c % 4) for (var e = 0; e < a; e++) b[c + e >>> 2] |= (d[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 24 - 8 * ((c + e) % 4); else if (65535 < d.length) for (e = 0; e < a; e += 4) b[c + e >>> 2] = d[e >>> 2]; else b.push.apply(b, d); this.sigBytes += a; return this }, clamp: function () { var a = this.words, b = this.sigBytes; a[b >>> 2] &= 4294967295 << 32 - 8 * (b % 4); a.length = h.ceil(b / 4) }, clone: function () { var a = f.clone.call(this); a.words = this.words.slice(0); return a }, random: function (a) { for (var b = [], d = 0; d < a; d += 4) b.push(4294967296 * h.random() | 0); return new j.init(b, a) } }), m = k.enc = {}, s = m.Hex = { stringify: function (a) { var b = a.words; a = a.sigBytes; for (var d = [], c = 0; c < a; c++) { var e = b[c >>> 2] >>> 24 - 8 * (c % 4) & 255; d.push((e >>> 4).toString(16)); d.push((e & 15).toString(16)) } return d.join("") }, parse: function (a) { for (var b = a.length, d = [], c = 0; c < b; c += 2) d[c >>> 3] |= parseInt(a.substr(c, 2), 16) << 24 - 4 * (c % 8); return new j.init(d, b / 2) } }, p = m.Latin1 = { stringify: function (a) { var b = a.words; a = a.sigBytes; for (var d = [], c = 0; c < a; c++) d.push(String.fromCharCode(b[c >>> 2] >>> 24 - 8 * (c % 4) & 255)); return d.join("") }, parse: function (a) { for (var b = a.length, d = [], c = 0; c < b; c++) d[c >>> 2] |= (a.charCodeAt(c) & 255) << 24 - 8 * (c % 4); return new j.init(d, b) } }, t = m.Utf8 = { stringify: function (a) { try { return decodeURIComponent(escape(p.stringify(a))) } catch (b) { throw Error("Malformed UTF-8 data"); } }, parse: function (a) { return p.parse(unescape(encodeURIComponent(a))) } }, q = l.BufferedBlockAlgorithm = f.extend({ reset: function () { this._data = new j.init; this._nDataBytes = 0 }, _append: function (a) { "string" == typeof a && (a = t.parse(a)); this._data.concat(a); this._nDataBytes += a.sigBytes }, _process: function (a) { var b = this._data, d = b.words, c = b.sigBytes, e = this.blockSize, f = c / (4 * e), f = a ? h.ceil(f) : h.max((f | 0) - this._minBufferSize, 0); a = f * e; c = h.min(4 * a, c); if (a) { for (var g = 0; g < a; g += e) this._doProcessBlock(d, g); g = d.splice(0, a); b.sigBytes -= c } return new j.init(g, c) }, clone: function () { var a = f.clone.call(this); a._data = this._data.clone(); return a }, _minBufferSize: 0 }); l.Hasher = q.extend({ cfg: f.extend(), init: function (a) { this.cfg = this.cfg.extend(a); this.reset() }, reset: function () { q.reset.call(this); this._doReset() }, update: function (a) { this._append(a); this._process(); return this }, finalize: function (a) { a && this._append(a); return this._doFinalize() }, blockSize: 16, _createHelper: function (a) { return function (b, d) { return (new a.init(d)).finalize(b) } }, _createHmacHelper: function (a) { return function (b, d) { return (new u.HMAC.init(a, d)).finalize(b) } } }); var u = k.algo = {}; return k }(Math);
(function () { var k = CryptoJS, b = k.lib, m = b.WordArray, l = b.Hasher, d = [], b = k.algo.SHA1 = l.extend({ _doReset: function () { this._hash = new m.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520]) }, _doProcessBlock: function (n, p) { for (var a = this._hash.words, e = a[0], f = a[1], h = a[2], j = a[3], b = a[4], c = 0; 80 > c; c++) { if (16 > c) d[c] = n[p + c] | 0; else { var g = d[c - 3] ^ d[c - 8] ^ d[c - 14] ^ d[c - 16]; d[c] = g << 1 | g >>> 31 } g = (e << 5 | e >>> 27) + b + d[c]; g = 20 > c ? g + ((f & h | ~f & j) + 1518500249) : 40 > c ? g + ((f ^ h ^ j) + 1859775393) : 60 > c ? g + ((f & h | f & j | h & j) - 1894007588) : g + ((f ^ h ^ j) - 899497514); b = j; j = h; h = f << 30 | f >>> 2; f = e; e = g } a[0] = a[0] + e | 0; a[1] = a[1] + f | 0; a[2] = a[2] + h | 0; a[3] = a[3] + j | 0; a[4] = a[4] + b | 0 }, _doFinalize: function () { var b = this._data, d = b.words, a = 8 * this._nDataBytes, e = 8 * b.sigBytes; d[e >>> 5] |= 128 << 24 - e % 32; d[(e + 64 >>> 9 << 4) + 14] = Math.floor(a / 4294967296); d[(e + 64 >>> 9 << 4) + 15] = a; b.sigBytes = 4 * d.length; this._process(); return this._hash }, clone: function () { var b = l.clone.call(this); b._hash = this._hash.clone(); return b } }); k.SHA1 = l._createHelper(b); k.HmacSHA1 = l._createHmacHelper(b) })();
(function (k) { for (var g = CryptoJS, h = g.lib, v = h.WordArray, j = h.Hasher, h = g.algo, s = [], t = [], u = function (q) { return 4294967296 * (q - (q | 0)) | 0 }, l = 2, b = 0; 64 > b;) { var d; a: { d = l; for (var w = k.sqrt(d), r = 2; r <= w; r++) if (!(d % r)) { d = !1; break a } d = !0 } d && (8 > b && (s[b] = u(k.pow(l, 0.5))), t[b] = u(k.pow(l, 1 / 3)), b++); l++ } var n = [], h = h.SHA256 = j.extend({ _doReset: function () { this._hash = new v.init(s.slice(0)) }, _doProcessBlock: function (q, h) { for (var a = this._hash.words, c = a[0], d = a[1], b = a[2], k = a[3], f = a[4], g = a[5], j = a[6], l = a[7], e = 0; 64 > e; e++) { if (16 > e) n[e] = q[h + e] | 0; else { var m = n[e - 15], p = n[e - 2]; n[e] = ((m << 25 | m >>> 7) ^ (m << 14 | m >>> 18) ^ m >>> 3) + n[e - 7] + ((p << 15 | p >>> 17) ^ (p << 13 | p >>> 19) ^ p >>> 10) + n[e - 16] } m = l + ((f << 26 | f >>> 6) ^ (f << 21 | f >>> 11) ^ (f << 7 | f >>> 25)) + (f & g ^ ~f & j) + t[e] + n[e]; p = ((c << 30 | c >>> 2) ^ (c << 19 | c >>> 13) ^ (c << 10 | c >>> 22)) + (c & d ^ c & b ^ d & b); l = j; j = g; g = f; f = k + m | 0; k = b; b = d; d = c; c = m + p | 0 } a[0] = a[0] + c | 0; a[1] = a[1] + d | 0; a[2] = a[2] + b | 0; a[3] = a[3] + k | 0; a[4] = a[4] + f | 0; a[5] = a[5] + g | 0; a[6] = a[6] + j | 0; a[7] = a[7] + l | 0 }, _doFinalize: function () { var d = this._data, b = d.words, a = 8 * this._nDataBytes, c = 8 * d.sigBytes; b[c >>> 5] |= 128 << 24 - c % 32; b[(c + 64 >>> 9 << 4) + 14] = k.floor(a / 4294967296); b[(c + 64 >>> 9 << 4) + 15] = a; d.sigBytes = 4 * b.length; this._process(); return this._hash }, clone: function () { var b = j.clone.call(this); b._hash = this._hash.clone(); return b } }); g.SHA256 = j._createHelper(h); g.HmacSHA256 = j._createHmacHelper(h) })(Math);
(function () { var c = CryptoJS, k = c.enc.Utf8; c.algo.HMAC = c.lib.Base.extend({ init: function (a, b) { a = this._hasher = new a.init; "string" == typeof b && (b = k.parse(b)); var c = a.blockSize, e = 4 * c; b.sigBytes > e && (b = a.finalize(b)); b.clamp(); for (var f = this._oKey = b.clone(), g = this._iKey = b.clone(), h = f.words, j = g.words, d = 0; d < c; d++) h[d] ^= 1549556828, j[d] ^= 909522486; f.sigBytes = g.sigBytes = e; this.reset() }, reset: function () { var a = this._hasher; a.reset(); a.update(this._iKey) }, update: function (a) { this._hasher.update(a); return this }, finalize: function (a) { var b = this._hasher; a = b.finalize(a); b.reset(); return b.finalize(this._oKey.clone().concat(a)) } }) })();
(function () { var h = CryptoJS, j = h.lib.WordArray; h.enc.Base64 = { stringify: function (b) { var e = b.words, f = b.sigBytes, c = this._map; b.clamp(); b = []; for (var a = 0; a < f; a += 3) for (var d = (e[a >>> 2] >>> 24 - 8 * (a % 4) & 255) << 16 | (e[a + 1 >>> 2] >>> 24 - 8 * ((a + 1) % 4) & 255) << 8 | e[a + 2 >>> 2] >>> 24 - 8 * ((a + 2) % 4) & 255, g = 0; 4 > g && a + 0.75 * g < f; g++) b.push(c.charAt(d >>> 6 * (3 - g) & 63)); if (e = c.charAt(64)) for (; b.length % 4;) b.push(e); return b.join("") }, parse: function (b) { var e = b.length, f = this._map, c = f.charAt(64); c && (c = b.indexOf(c), -1 != c && (e = c)); for (var c = [], a = 0, d = 0; d < e; d++) if (d % 4) { var g = f.indexOf(b.charAt(d - 1)) << 2 * (d % 4), h = f.indexOf(b.charAt(d)) >>> 6 - 2 * (d % 4); c[a >>> 2] |= (g | h) << 24 - 8 * (a % 4); a++ } return j.create(c, a) }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" } })();

hawk.crypto.internals = CryptoJS;


// Export if used as a module

if (typeof module !== 'undefined' && module.exports) {
    module.exports = hawk;
}

/* eslint-enable */
// $lab:coverage:on$
;

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('coins-logon-widget/scripts/lib/auth',['es6-object-assign', 'hawk'], function(ObjectAssign, hawk) {
            return factory(ObjectAssign.assign, hawk);
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(
            require('es6-object-assign').assign,
            require('hawk/lib/browser')
        );
    } else {
        // Browser globals (root is window)
        root.CoinsLogonWidget = root.CoinsLogonWidget || {};
        root.CoinsLogonWidget.Auth = factory(root.ObjectAssign.assign, hawk);
    }
}(this, function (assign) {
    'use strict';

    /** Authentication credentials key for localStorage. */
    var AUTH_CREDENTIALS_KEY = 'COINS_AUTH_CREDENTIALS';

    /** Default options. */
    var DEFAULTS = {
        baseUrl: 'https://localcoin.mrn.org:8443/api',
        version: '1.3.0',
    };

    /** Local holder for options. */
    var options = {};

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
     * @return {object}
     */
    function getHawkHeaders(url, method, credentials) {
        var header = hawk.client.header(
            url,
            method,
            { credentials:  getAuthCredentials() }
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
        return options.baseUrl + '/v' + options.version + endpoint;
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
        options = assign({}, DEFAULTS, options, newOptions);
        return getOptions();
    }

    /**
     * Map API's successful response.
     *
     * @param  {object} respones API response object
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
        return new Promise(function(resolve, reject) {
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
                    resolve(credentials);
                })
                .fail(function(error) {
                    reject(mapApiError(error));
                });
        });
    }

    /**
     * Log out.
     *
     * @return {Promise}
     */
    function logout() {
        return new Promise(function(resolve, reject) {
            var id = getAuthCredentials().id;
            var method = 'DELETE';
            var url = getApiUrl('/auth/keys/' + id);

            return jQuery.ajax({
                dataType: 'json',
                headers: getHawkHeaders(url, method),
                type: method,
                url: getApiUrl('/auth/keys/' + id),
                xhrFields: {
                    withCredentials: true
                },
            })
                .done(function(response) {
                    resolve(mapApiSuccess(response));
                })
                .fail(function(error) {
                    reject(mapApiError(error));
                })
                .always(function() {
                    return setAuthCredentials({
                        date: Date.now(),
                        status: 'logged out',
                    });
                });
        });
    }

    /**
     * Public API.
     */
    return {
        getOptions: getOptions,
        setOptions: setOptions,
        login: login,
        logout: logout,
    };
}));

(function()
{
	"use strict";
	
	
	
	function UniqueNumber(useDate)
	{
		// Support not using `new`
		if (this instanceof UniqueNumber === false)
		{
			return new UniqueNumber(useDate);
		}
		
		this.useDate = useDate===true;
		this.reset();
	}
	
	
	
	UniqueNumber.prototype.generate = function()
	{
		var current;
		
		if (this.useDate === false)
		{
			return this.previous++;
		}
		
		current = Date.now();
		
		// If created at same millisecond as previous
		if (current <= this.previous)
		{
			current = ++this.previous;
		}
		else
		{
			this.previous = current;
		}
		
		return current;
	};
	
	
	
	UniqueNumber.prototype.reset = function()
	{
		this.previous = 0;
	};
	
	
	
	if (typeof module==="object" && typeof module.exports==="object")
	{
		module.exports = UniqueNumber;
	}
	else if (typeof define==="function" && define.amd)
	{
		define("unique-number", [], function(){ return UniqueNumber });
	}
	else
	{
		window.UniqueNumber = UniqueNumber;
	}
})();

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('coins-logon-widget/scripts/lib/utils',['unique-number'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('unique-number'));
    } else {
        // Browser globals (root is window)
        root.CoinsLogonWidget = root.CoinsLogonWidget || {};
        root.CoinsLogonWidget.utils = factory(root.UniqueNumber);
    }
}(this, function (UniqueNumber) {
    'use strict';

    var uniqueNumber = new UniqueNumber();

    /**
     * Add event listener that fires once.
     * @{@link  https://github.com/insin/event-listener}
     */
    function once(target, eventType, callback) {
        function listener() {
            callback.apply(null, arguments);
            target.removeEventListener(eventType, listener, false);
        }

        target.addEventListener(eventType, listener, false);
    }

    function removeElement(element) {
        if (element) {
            while (element.lastChild) {
                element.removeChild(element.lastChild);
            }
        }

        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    function uniqueId(string) {
        if (typeof string !== 'string') {
            string = '';
        }
        return string + uniqueNumber.generate();
    }

    return {
        once: once,
        removeElement: removeElement,
        uniqueId: uniqueId,
    };
}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(
            'coins-logon-widget/scripts/lib/form-group',['es6-object-assign', './utils'],
            function(ObjectAssign, utils) {
                return factory(ObjectAssign.assign, utils);
            }
        );
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(
            require('es6-object-assign').assign,
            require('./utils')
        );
    } else {
        // Browser globals (root is window)
        root.CoinsLogonWidget = root.CoinsLogonWidget || {};
        root.CoinsLogonWidget.FormGroup = factory(
            root.ObjectAssign.assign,
            root.CoinsLogonWidget.utils
        );
    }
}(this, function (assign, utils) {
    'use strict';

    function FormGroup(options) {
        options = options || {};

        this.options = assign({}, FormGroup.DEFAULTS, options);
        this.element = this._getElements();
        this._setState();
    }

    FormGroup.prototype._getElements = function() {
        var classNames = this.options.classNames;
        var div = document.createElement('div');
        var id = utils.uniqueId('coins-logon-widget-');
        var input = document.createElement('input');
        var label = document.createElement('label');

        div.className = classNames.formGroup;
        label.className = classNames.label;
        label.setAttribute('for', id);
        label.textContent = this.options.labelText;
        input.className = classNames.input;
        input.id = id;
        input.name = this.options.inputName;
        input.type = this.options.type;

        if (this.options.hiddenLabel) {
            label.classList.add(classNames.hidden);
            input.placeholder = this.options.placeholder || this.options.labelText;
        } else {
            if (this.options.placeholder) {
                input.placeholder = this.options.placeholder;
            }
            if (this.options.required) {
                input.setAttribute('aria-required', true);
            }
        }

        div.appendChild(label);
        div.appendChild(input);

        return div;
    };

    FormGroup.prototype._setState = function(state) {
        if (typeof this._state === 'undefined') {
            this._state = {};
        }

        var self = this;
        var element = this.element;
        var classNames = this.options.classNames;
        var inputElement = element.querySelector('.' + classNames.input);
        var iconElement = element.querySelector('.' + classNames.icon);
        var messageElement = element.querySelector('.' + classNames.message);

        assign(this._state, state);

        if (this._state.message || this._state.error || this._state.success) {
            // Add an icon if it doesn't exist
            if (!iconElement) {
                iconElement = document.createElement('span');
                iconElement.className = this.options.classNames.icon;
                iconElement.setAttribute('aria-hidden', true);
                element.appendChild(iconElement);
            }
            // Add a message if needed, otherwise remove
            if (!messageElement && this._state.message) {
                messageElement = document.createElement('span');
                messageElement.className = this.options.classNames.message;
                element.appendChild(messageElement);
            } else if (!this._state.message) {
                messageElement.parentNode.removeChild(messageElement);
            }
            if (messageElement && this._state.message) {
                messageElement.textContent = this._state.message;
            }

            // Handle state cases
            if (this._state.error) {
                element.classList.remove(classNames.success);
                element.classList.add(classNames.error);
            } else if (this._state.success) {
                element.classList.remove(classNames.error);
                element.classList.add(classNames.success);
            }

            utils.once(inputElement, 'keydown', function() {
                self._setState({
                    error: null,
                    message: null,
                    success: null
                });
            });
        } else {
            if (iconElement) {
                iconElement.parentNode.removeChild(iconElement);
            }
            if (messageElement) {
                messageElement.parentNode.removeChild(messageElement);
            }
            element.classList.remove(classNames.error);
            element.classList.remove(classNames.success);
        }
    };

    //TODO: Remove potential `input` listeners
    FormGroup.prototype.destroy = function() {
        utils.removeElement(this.element);

        delete this._state;
        delete this.options;
    };

    FormGroup.prototype.getName = function() {
        return this.options.inputName;
    };

    FormGroup.prototype.getValue = function() {
        return this.element.querySelector('input').value;
    };

    FormGroup.prototype.validate = function() {
        var value = this.getValue();
        var validator = this.options.validate;
        var isValid;

        if (this.options.required && validator instanceof Function) {
            isValid = validator(value);

            if (isValid !== true) {
                this._setState({
                    error: true,
                    message: isValid
                });
                return false;
            }
        }

        return true;
    };

    FormGroup.DEFAULTS = {
        classNames: {
            error: 'coins-logon-widget-form-group-error',
            formGroup: 'coins-logon-widget-form-group',
            hidden: 'coins-logon-widget-visuallyhidden',
            icon: 'coins-logon-widget-icon',
            input: 'coins-logon-widget-input',
            label: 'coins-logon-widget-label',
            message: 'coins-logon-widget-input-message',
            success: 'coins-logon-widget-form-group-success'
        },
        hiddenLabel: false,
        inputName: 'name',
        labelText: 'Name:',
        placeholder: '',
        required: true,
        type: 'text',
        validate: function(value) {
            if (value.trim() === '') {
                return 'Field empty!';
            }

            return true;
        }
    };

    return FormGroup;
}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('coins-logon-widget/scripts/lib/form',[
            'es6-object-assign',
            './form-group',
            './utils'
        ], function(ObjectAssign, FormGroup, utils) {
            return factory(ObjectAssign.assign, FormGroup, utils);
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(
            require('es6-object-assign').assign,
            require('./form-group'),
            require('./utils')
        );
    } else {
        // Browser globals (root is window)
        root.CoinsLogonWidget = root.CoinsLogonWidget || {};
        root.CoinsLogonWidget.Form = factory(
            root.ObjectAssign.assign,
            root.CoinsLogonWidget.FormGroup,
            root.CoinsLogonWidget.utils
        );
    }
}(this, function (assign, FormGroup, utils) {
    'use strict';

    function Form(options) {
        options = options || {};

        this.options = assign({}, Form.DEFAULTS, options);
        // this.formGroups = this.options.formGroups.map(function(formGroupOptions) {
        //     return new FormGroup(formGroupOptions);
        // });
        this.element = this._getElements();
        this._setState(this.options.initialState);
    }

    Form.prototype._getElements = function() {
        var button = document.createElement('button');
        var form = document.createElement('form');

        form.className = this.options.classNames.form;

        if (this.options.horizontal) {
            form.classList.add(this.options.classNames.horizontal);
        }

        form.method = 'post';
        form.addEventListener(
            'submit',
            this._submitHandler.bind(this),
            false
        );

        //TODO: Make alignment passed through options
        button.className = this.options.classNames.button + ' ' + this.options.classNames.right;
        button.type = 'submit';

        form.appendChild(this._getIndicatorElements());
        form.appendChild(button);

        return form;
    };

    Form.prototype._getIndicatorElements = function() {
        var indicator = document.createElement('div');
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        var circleAttributes= {
            cx: 20,
            cy: 20,
            r: 8,
            fill: 'none',
            'stroke-width': 2,
            'stroke-miterlimit': 4
        };

        indicator.className = this.options.classNames.indicator;
        indicator.setAttribute('aria-hidden', true);

        title.textContent = 'Loading…';

        for (var prop in circleAttributes) {
            if (circleAttributes.hasOwnProperty(prop)) {
                circle.setAttribute(prop, circleAttributes[prop]);
            }
        }

        svg.appendChild(title);
        svg.appendChild(circle);
        indicator.appendChild(svg);

        return indicator;
    };

    Form.prototype._setState = function(state) {
        if (typeof this._state === 'undefined') {
            this._state = {};
        }

        var self = this;
        var button = this.element.querySelector('.' + this.options.classNames.button);
        var indicator = this.element.querySelector('.' + this.options.classNames.indicator);
        var notification = this.element.querySelector('.' + this.options.classNames.notification);
        var status = this.element.querySelector('.' + this.options.classNames.status);
        var formGroups;

        assign(this._state, state);

        // Notification
        if (notification && !state.notification) {
            utils.removeElement(notification);
        } else if (!notification && state.notification) {
            notification = document.createElement('div');
            notification.className = this.options.classNames.notification;
            notification.setAttribute('role', 'alert');
            this.element.insertBefore(notification, this.element.firstChild);
        }

        if (notification && state.notification) {
            if (state.notification instanceof Node) {
                notification.appendChild(state.notification);
            } else {
                notification.textContent = state.notification;
            }

            notification.classList.remove(this.options.classNames.notificationError);
            notification.classList.remove(this.options.classNames.notificationSuccess);
            // TODO: Error and success are applied to the notification. This may not
            // make the most sense.
            if (state.error) {
                notification.classList.add(this.options.classNames.notificationError);
            } else if (state.success) {
                notification.classList.add(this.options.classNames.notificationSuccess);
            }
        }

        // Indicator
        if (this._state.loading) {
            this.element.classList.add(this.options.classNames.loading);
            indicator.setAttribute('aria-hidden', false);
        } else {
            this.element.classList.remove(this.options.classNames.loading);
            indicator.setAttribute('aria-hidden', true);
        }

        if (this._state.login) {
            // Add form groups
            if (!this.formGroups) {
                // TODO: This modifies the object. Make it more obvious
                this._setFormGroups();
                this.formGroups
                    .map(function(formGroup) {
                        return formGroup.element;
                    })
                    .reverse()
                    .forEach(function(formGroupElement){
                        self.element.insertBefore(formGroupElement, indicator);
                    });
            }
            if (status) {
                this.element.removeChild(status);
            }

            button.textContent = this.options.buttonLoginText;
            button.classList.remove(this.options.classNames.buttonSecondary);
            button.classList.add(this.options.classNames.buttonPrimary);
        } else {
            if (this.formGroups) {
                this._removeFormGroups();
            }

            // Status
            if (!status) {
                status = document.createElement('p');
                status.className = this.options.classNames.status;
                this.element.insertBefore(status, this.element.firstChild);
            }

            status.innerHTML = this._state.status || this.options.statusText;

            button.textContent = this.options.buttonLogoutText;
            button.classList.remove(this.options.classNames.buttonPrimary);
            button.classList.add(this.options.classNames.buttonSecondary);
        }
    };

    Form.prototype._submitHandler = function(event) {
        event.preventDefault();

        var login = this.options.login;
        var logout = this.options.logout;

        if (this._state.login && login instanceof Function) {
            login(event);
        } else if (logout instanceof Function) {
            logout(event);
        }
    };

    Form.prototype._setFormGroups = function() {
        this.formGroups = this.options.formGroups.map(function(options) {
            return new FormGroup(options);
        });
    };

    Form.prototype._removeFormGroups = function() {
        this.formGroups.forEach(function(formGroup) {
            formGroup.destroy();
        });

        delete this.formGroups;
    };

    Form.prototype.clearMessage = function() {
        this._setState({
            error: null,
            notification: null,
            success: null
        });
    };

    Form.prototype.destroy = function() {
        this.element.removeEventListener('submit', this._submitHandler, false);
        utils.removeElement(this.element);
        this._removeFormGroups();

        delete this.options;
    };

    Form.prototype.getFormData = function() {
        return this.formGroups.reduce(function(data, formGroup) {
            var name = formGroup.getName();

            if (!(name in data)) {
                data[name] = formGroup.getValue();
            }

            return data;
        }, {});
    };

    Form.prototype.setErrorMessage = function(message) {
        this._setState({
            error: true,
            notification: message
        });
    };

    Form.prototype.setLoading = function() {
        this._setState({
            loading: true
        });
    };

    Form.prototype.clearLoading = function() {
        this._setState({
            loading: false
        });
    };

    Form.prototype.setSuccessMessage = function(message) {
        this._setState({
            notification: message,
            success: true
        });
    };

    Form.prototype.setToLogin = function(message) {
        this._setState({
            login: true
        });
    };

    Form.prototype.setToLogout = function(statusText) {
        this._setState({
            login: false,
            status: statusText || null
        });
    };

    Form.prototype.validate = function() {
        var isValid;
        var validations;

        if (this.formGroups) {
            validations = this.formGroups.map(function(formGroup) {
                return formGroup.validate();
            });
            isValid = validations.every(function(validation) {
                return validation === true;
            });

            return isValid ? true : validations;
        }
    };

    Form.DEFAULTS = {
        buttonLoginText: 'Log In',
        buttonLogoutText: 'Log Out',
        classNames: {
            button: 'coins-logon-widget-button',
            buttonPrimary: 'coins-logon-widget-button-primary',
            buttonSecondary: 'coins-logon-widget-button-secondary',
            form: 'coins-logon-widget-form',
            horizontal: 'coins-logon-widget-form-horizontal',
            indicator: 'coins-logon-widget-indicator',
            loading: 'coins-logon-widget-form-loading',
            notification: 'coins-logon-widget-notification',
            notificationError: 'coins-logon-widget-notification-error',
            notificationSuccess: 'coins-logon-widget-notification-success',
            right: 'coins-logon-widget-right',
            status: 'coins-logon-widget-status',
        },
        initialState: {
            error: null,
            login: true,
            notification: null,
            success: null,
        },
        statusText: 'Logged in'
    };

    return Form;
}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('coins-logon-widget/scripts/coins-logon-widget',[
            'wolfy87-eventemitter/EventEmitter',
            'es6-object-assign',
            './lib/auth',
            './lib/form',
            './lib/form-group'
        ], function(EventEmitter, ObjectAssign, Auth, Form, FormGroup) {
            return factory(
                EventEmitter,
                ObjectAssign.assign,
                Auth,
                Form,
                FormGroup
            );
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(
            require('wolfy87-eventemitter'),
            require('es6-object-assign').assign,
            require('./lib/auth'),
            require('./lib/form'),
            require('./lib/form-group')
        );
    } else {
        // Browser globals (root is window)
        root.CoinsLogonWidget = factory(
            root.EventEmitter,
            root.ObjectAssign.assign,
            root.CoinsLogonWidget.Auth,
            root.CoinsLogonWidget.Form,
            root.CoinsLogonWidget.FormGroup
        );
    }
}(this, function (
    EventEmitter,
    assign,
    Auth,
    Form,
    FormGroup
) {
    'use strict';

    var EVENTS = {
        INVALID: 'invalid',
        LOGIN: 'login:init',
        LOGIN_ERROR: 'login:error',
        LOGIN_SUCCESS: 'login:success',
        LOGOUT: 'logout:init',
        LOGOUT_ERROR: 'logout:error',
        LOGOUT_SUCCESS: 'logout:success'
    };

    function CoinsLogonWidget(element, options) {
        var authOptions = {};

        EventEmitter.call(this);

        this.options = assign({}, CoinsLogonWidget.DEFAULTS, options);

        /**
         * If the form has hidden labels or a horizontal layout apply the
         * `hiddenLabel` form group option. This persists the option down to the
         * `FormGroup` elements.
         *
         * @todo  Devise a better solution for passing down options
         */
        if (this.options.hiddenLabels || this.options.horizontal) {
            this.options.formGroups.forEach(function(formGroupOption) {
                formGroupOption.hiddenLabel = true;
            });
        }

        // Configure auth
        if (this.options.baseUrl) {
            authOptions.baseUrl = this.options.baseUrl;
        }
        if (this.options.version) {
            authOptions.version = this.options.version;
        }
        Auth.setOptions(authOptions);

        this.element = this._getElements(element);
        this._setState();
    }

    // Inherit from `EventEmitter`
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain#Example
    CoinsLogonWidget.prototype = Object.create(EventEmitter.prototype);
    CoinsLogonWidget.prototype.constructor = CoinsLogonWidget;

    CoinsLogonWidget.prototype._getElements = function(element) {
        if (!element) {
            throw new Error('Element required');
        } else if (!(element instanceof Node)) {
            // Make sure `element` is an actual node
            // http://stackoverflow.com/a/384380
            throw new Error('Expected element to be a DOM node');
        }

        var self = this;

        this.form = new Form({
            formGroups: this.options.formGroups.reverse(),
            horizontal: this.options.horizontal,
            login: function() {
                self.emit(EVENTS.LOGIN, self.form.getFormData());
            },
            logout: function() {
                self.emit(EVENTS.LOGOUT);
            }
        });

        element.innerHTML = '';
        element.className = this.options.classNames.root;
        element.appendChild(this.form.element);

        return element;
    };

    CoinsLogonWidget.prototype._setState = function() {
        this.on(EVENTS.LOGIN, this.login);
        this.on(EVENTS.LOGIN_ERROR, this.onError);
        this.on(EVENTS.LOGIN_SUCCESS, this.onLogin);
        this.on(EVENTS.LOGOUT, this.logout);
        this.on(EVENTS.LOGOUT_ERROR, this.onError);
        this.on(EVENTS.LOGOUT_SUCCESS, this.onLogout);
    };

    CoinsLogonWidget.prototype.login = function(formData) {
        var self = this;
        var validations = self.form.validate();

        if (validations !== true) {
            self.emit(EVENTS.INVALID, validations);
            return;
        } else {
            self.form.clearMessage();
        }

        this.form.setLoading();

        Auth.login(formData.username, formData.password)
            .then(function(response) {
                self.form.clearLoading();
                self.emit(EVENTS.LOGIN_SUCCESS, response);
            })
            .catch(function(error) {
                self.form.clearLoading();
                self.emit(EVENTS.LOGIN_ERROR, error);
            });
    };

    CoinsLogonWidget.prototype.logout = function() {
        var self = this;

        this.form.setLoading();

        Auth.logout()
            .then(function(response) {
                self.form.clearLoading();
                self.emit(EVENTS.LOGOUT_SUCCESS, response);
            })
            .catch(function(error) {
                self.form.clearLoading();
                self.emit(EVENTS.LOGOUT_ERROR, error);
            });
    };

    CoinsLogonWidget.prototype.onError = function(error) {
        var message;

        if (typeof error !== 'undefined') {
            message = error.message || error.toString();
        } else {
            message = 'Unknown error!';
        }

        this.form.setErrorMessage(message);
        console.error(error);
    };

    CoinsLogonWidget.prototype.onLogin = function(response) {
        var username = response.username;
        var statusText = username ?
            'Logged in as <strong>' + username + '</strong>.' :
            'Logged in.';

        this.form.setToLogout(statusText);
    };

    CoinsLogonWidget.prototype.onLogout = function(response) {
        this.form.setToLogin();
    };

    CoinsLogonWidget.prototype.onSubmit = function(event) {
        event.preventDefault();

        var errors;

        this.formGroups.forEach(function(formGroup) {
            var isValid = formGroup.validate();

            //TODO: emit validation error events
            if (!isValid) {
                errors = true;
            }
        });

        if (!errors) {
            this.emit('submitted', event);
            //TODO: Make authentication pluggable
            this.login();
        }
    };

    CoinsLogonWidget.DEFAULTS = {
        classNames: {
            root: 'coins-logon-widget'
        },
        formGroups: [{
            inputName: 'username',
            labelText: 'Username:',
            placeholder: ''
        }, {
            inputName: 'password',
            labelText: 'Password:',
            placeholder: '',
            type: 'password'
        }],
        hiddenLabels: false,
        horizontal: false
    };

    return CoinsLogonWidget;
}));

