# COINS Logon Widget

_Injectable utility to manage browser authorization with COINS._

## Use

```js
var widget = new CoinsLogonWidget(document.getElementById('logon-area'), {
    baseUrl: 'http://localhost:9000/api'
});

// events
widget.on('login:success', function() {});
widget.on('login:error', function() {});
widget.on('logout:success', function() {});
widget.on('logout:error', function() {});
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
