module.exports = (function() {
    if (!Function.prototype.bind) {
        Function.prototype.bind = require('function-bind');
    }
})();
