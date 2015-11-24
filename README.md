# COINS Logon Widget

_Injectable utility to manage browser authorization with COINS._

## Use

```js
var widget = new CoinsLogonWidget({
    el: document.getElementById('logon-area'),
    baseUrl: 'http://localhost:9000/api/v1',
    authCookieName: 'COINS_Auth_User-production'
});
```

### Methods

You may call these methods on an instance of the widget:

#### Destroy

Destroy the widget’s elements and remove all event handlers.

```js
widget.destroy()
```

### Events

The widget extends [Olical’s EventEmitter](https://github.com/Olical/EventEmitter): all of [its methods](https://github.com/Olical/EventEmitter/blob/master/docs/api.md) are available on an instance of `CoinsLogonWidget`. The widget has a few custom events for which you can attach handlers:

#### Invalid

Fired when one or more of the widget’s form fields aren’t valid.

```js
widget.on('invalid', function(validations) {});
```

#### Login Init

Fired when the widget begins a login API call.

```js
widget.on('login:init', function() {});
```

#### Login Error

Fired when the widget receives an error from the login API call.

```js
widget.on('login:error', function(error) {});
```

#### Login Account Expired

Fired when the widget receives an “account expired” response from the login API call.

```js
widget.on('login:accountExpired', function(apiResponse) {});
```

#### Login Account Will Expire

Fired when the widget receives an “account will expire” response from the login API call.

```js
widget.on('login:accountWillExpire', function(apiResponse) {});
```

#### Login Password Expired

Fired when the widget receives a “password expired” response from the login API call.

```js
widget.on('login:passwordExpired', function(apiResponse) {});
```

#### Login Password Will Expire

Fired when the widget receives a “password will expire” response from the login API call.

```js
widget.on('login:passwordWillExpire', function(apiResponse) {});
```

#### Login Success

Fired when the widget receives a successful response from the login API call.

```js
widget.on('login:success', function(apiResponse) {});
```

#### Logout Init

Fired when the widget begins a logout API call.

```js
widget.on('logout:init', function() {});
```

#### Logout Error

Fired when the widget receives an error response from the logout API call.

```js
widget.on('logout:error', function(error) {});
```

#### Logout Success

Fired when the widget receives a successful response from the logout API call.

```js
widget.on( 'logout:success', function(apiResponse) {});
```

See _examples/index.html_ for more examples of widget use.

## Project Setup

1. Make sure you have [Node.js](https://nodejs.org/) or [io.js](https://iojs.org/en/index.html) installed on your machine.
2. Install [libsass](https://github.com/sass/libsass) (`brew install libsass` on a Mac with [Homebrew](http://brew.sh/)).
3. Make sure [Grunt.js](http://gruntjs.com/) is installed globally: `npm install -g grunt-cli`
3. Clone the repo: `git clone git@github.com:MRN-Code/coins-logon-widget.git`
4. Install the project’s dependencies with NPM:
    1. `cd` into the repo’s directory
    2. Run `npm install`

## Project Tasks

This project relies on Grunt to run tasks. (See its [getting started guide](http://gruntjs.com/getting-started) for basic info.) Currently, three tasks exist:

* **`grunt`:** Build the project’s _un-minified_ styles and scripts
* **`grunt build`:** Build the project’s _minified_ styles and scripts, suitable for production.
* **`grunt serve`:** Spin up a [connect](https://www.npmjs.com/package/connect) server and rebuild the styles and scripts when they change. Useful for development on the project.
* **`grunt test`:** Initializes a mock api server, and fires off in-browser testing in
multiple browsers in parallel.

## Changelog
- 2.0.0 single arg config, mandatory `baseUrl` and `authCookieName`
