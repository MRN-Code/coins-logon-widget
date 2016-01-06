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
