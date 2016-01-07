var test = require('tape');
var CoinsLogonWidget = require('../scripts/coins-logon-widget.js');
var cookies = require('js-cookie');
var html = require('html!./index.html');
var jQuery = require('jquery');
var messages = require('../scripts/lib/messages.js');
var Promise = this.Promise = require('bluebird'); // phantomJS polyfill. seriously. :-|
var testUtils = require('./test-utils');

/**
 * Bind polyfill for PhantomJS.
 * {@link https://github.com/Raynos/function-bind}
 */
if (!('bind' in Function)) {
    Function.prototype.bind = require('function-bind');
}

jQuery(window.document.body).append(html);

test('constructor, basic', function(t) {
    var el = document.getElementById('regular_form');
    var myWidget = testUtils.widgetFactory({
        el: el,
    });

    t.ok(myWidget, 'constructor returns a widget');
    t.equal(myWidget.element, el, 'constructor sets el');
    t.ok(jQuery('#regular_form.coins-logon-widget:visible').length, 'form visible on DOM');

    testUtils.teardownWidget(myWidget);

    t.end();
});

test('constructor, hiddenLabels', function(t) {
    var el = document.getElementById('hidden_labels_form');
    var myWidget = testUtils.widgetFactory({
        el: el,
        hiddenLabels: true,
    });

    t.equal(
        2,
        jQuery('#hidden_labels_form .coins-logon-widget-label').length,
        'hidden label DOMs nodes present for both un and pw inputs'
    );

    testUtils.teardownWidget(myWidget);

    // visuallyhidden class doesn't actually hide elements, so omit doing
    // vis test.  x-browser :visible JQ query selector seems to have varying
    // results in diff browsers
    t.end();
});

// Test for a bug where the widget's username and password fields flip order
// every other time the widget is displayed. The test's structure mimics COINS's
// `clientAuthTimer` module, where the bug occurs.
test('field order', function(t) {
    var $target = jQuery('#field_order_form');
    var tempId = 'field_order_form_temp';
    var myModule = {
        showWidget: function() {
            $target.append('<div id="' + tempId + '"></div>');
            myModule.logonWidget = testUtils.widgetFactory({
                el: document.getElementById(tempId),
            });
            myModule.logonWidget.removeAllListeners();
            $target.fadeIn();
        },

        removeWidget: function() {
            var $temp = jQuery('#' + tempId);
            $temp.fadeOut(function() {
                $temp.remove();
            });

            myModule.logonWidget.destroy();
            myModule.logonWidget = null;
        },
    };

    function getFirstInputName() {
        return jQuery('#' + tempId + ' input').eq(0).attr('name');
    }

    myModule.showWidget();
    t.equal(getFirstInputName(), 'username', 'Username input is first');

    myModule.removeWidget();
    myModule.showWidget();
    t.equal(getFirstInputName(), 'username', 'User input is still first');

    testUtils.teardownWidget(myModule.logonWidget);

    t.end();
});

test('api activity', {timeout: 2000}, function(t) {
    t.plan(1);
    var el = document.getElementById('api_call_form');
    var myWidget = testUtils.widgetFactory({
        el: el,
        baseUrl: 'http://localhost:12354',
        authCookieName: 'CAS_Auth_User', // @TODO, test when i figure out how to set x-domain cookies
    });
    var wigetData = {
        widget: myWidget,
        username: 'someun',
        password: 'somepassword',
    };

    testUtils.setWidgetFields(wigetData);

    myWidget.login(wigetData)
        .then(function() {
            t.ok(
                jQuery('#api_call_form button').eq(0).text(),
                'Log Out',
                'login cycle successful'
            );
        }, t.end)
        .then(function() {
            testUtils.teardownWidget(myWidget);
            t.end();
        });
});

test('initial logged in state', function(t) {
    t.plan(2);

    var authCookieName = 'test_auth_cookie';
    var username = 'test_user_name';
    var myWidget;

    // Fake an initial 'authorized' state by setting the appropriate cookie and
    // stored credentials
    // TODO: Figure out how to mock/spy on the 'auth' module
    cookies.set(authCookieName, 'test_auth_value');
    localStorage.COINS_AUTH_CREDENTIALS = JSON.stringify({
        id: 'sampleAuthId',
        key: 'sampleAuthKey',
        username: username,
    });

    myWidget = testUtils.widgetFactory({
        authCookieName: authCookieName,
        baseUrl: 'http://localhost:12354',
        checkAuth: true,
    });

    // Hijack widget internals to ensure checks fire at the appropriate time
    // TODO: Figure out better way to do this, maybe spies
    var originalUpdate = myWidget.update;
    myWidget.update = function(newState) {
        originalUpdate.call(myWidget, newState);
        t.ok(
            jQuery(myWidget.element).text().indexOf(username) > 0,
            'UI shows username'
        );
        myWidget.update = originalUpdate;
        testUtils.teardownWidget(myWidget);
        t.end();
    };

    myWidget.once('login:success', function(response) {
        t.equal(response.username, username, 'retrieves username');
    });
});

test('horizontal form', function(t) {
    var myWidget = testUtils.widgetFactory({
        horizontal: true,
    });
    var $form = jQuery(myWidget.element).find('form');

    t.ok(
        $form.attr('class').indexOf('horizontal') !== -1,
        'has horizontal class'
    );

    testUtils.teardownWidget(myWidget);

    t.end();
});

test('default messages', function(t) {
    var EVENTS = CoinsLogonWidget.EVENTS;
    var myWidget = testUtils.widgetFactory();
    var offset = '2 days';
    var tomorrow = new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString();

    myWidget.emit(EVENTS.LOGIN_ACCOUNT_EXPIRED);
    t.equal(
        testUtils.getNotification(myWidget).text(),
        messages.accountExpired,
        'Shows account expired message'
    );

    myWidget.emit(EVENTS.LOGIN_ACCOUNT_WILL_EXPIRE, {
        user: {
            acctExpDate: tomorrow,
        },
    });
    t.equal(
        testUtils.getNotification(myWidget).text(),
        messages.accountWillExpire(offset),
        'Shows account will expire message'
    );

    myWidget.emit(EVENTS.LOGIN_PASSWORD_EXPIRED);
    t.equal(
        testUtils.getNotification(myWidget).text(),
        messages.passwordExpired,
        'Shows password expired message'
    );

    myWidget.emit(EVENTS.LOGIN_PASSWORD_WILL_EXPIRE, {
        user: {
            passwordExpDate: tomorrow,
        },
    });
    t.equal(
        testUtils.getNotification(myWidget).text(),
        messages.passwordWillExpire(offset),
        'Shows password will expire message'
    );

    testUtils.teardownWidget(myWidget);
    t.end();
});

test('custom messages', function(t) {
    var EVENTS = CoinsLogonWidget.EVENTS;
    var customMessages = {
        accountExpired: Math.random().toString(),
        accountWillExpire: function(offset) {
            return [
                '<p>Your account will expire in ' + offset + '.',
                '<a href="#">Reset it!</a></p>',
            ].join(' ');
        },

        passwordExpired: Math.random().toString(),
        passwordWillExpire: function(offset) {
            return '<p><span>Your</span> password <b>is</b> <em>gross</em></p>';
        },

    };
    var myWidget = testUtils.widgetFactory({
        messages: customMessages,
    });
    var offset = '2 days';
    var tomorrow = new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString();

    myWidget.emit(EVENTS.LOGIN_ACCOUNT_EXPIRED);
    t.equal(
        testUtils.getNotification(myWidget).html(),
        customMessages.accountExpired,
        'Shows account expired message'
    );

    myWidget.emit(EVENTS.LOGIN_ACCOUNT_WILL_EXPIRE, {
        user: {
            acctExpDate: tomorrow,
        },
    });
    t.equal(
        testUtils.getNotification(myWidget).html(),
        customMessages.accountWillExpire(offset),
        'Shows account will expire message'
    );

    myWidget.emit(EVENTS.LOGIN_PASSWORD_EXPIRED);
    t.equal(
        testUtils.getNotification(myWidget).html(),
        customMessages.passwordExpired,
        'Shows password expired message'
    );

    myWidget.emit(EVENTS.LOGIN_PASSWORD_WILL_EXPIRE, {
        user: {
            passwordExpDate: tomorrow,
        },
    });
    t.equal(
        testUtils.getNotification(myWidget).html(),
        customMessages.passwordWillExpire(offset),
        'Shows password will expire message'
    );

    testUtils.teardownWidget(myWidget);
    t.end();
});

test('redirect property/button', function(t) {
    var redirectUrl = 'http://localhost:1337';
    var myWidget = testUtils.widgetFactory({
        redirectUrl: redirectUrl,
    });
    var $widget = jQuery(myWidget.element);

    myWidget.update({ isLoggedIn: true });
    t.ok(
        $widget.find('a.coins-logon-widget-button').length,
        'Has redirect link'
    );
    t.equal(
        $widget.find('a.coins-logon-widget-button').attr('href'),
        redirectUrl,
        'Redirect URL added to link'
    );

    testUtils.teardownWidget(myWidget);
    t.end();
});

/**
 * Ensure that the username and password fields' values are persisted when the
 * widget re-renders its `form` component.
 */
test('inputs maintain value', function(t) {
    var username = 'Test Mc\'Testem';
    var password = 'most_secret_password';
    var myWidget = testUtils.widgetFactory();
    var $widget = jQuery(myWidget.element);

    testUtils.setWidgetFields({
        password: password,
        username: username,
        widget: myWidget,
    });

    myWidget.emit(CoinsLogonWidget.EVENTS.LOGIN_ERROR, 'Invalid credentials');

    t.equal(
        $widget.find('input[name=username]').val(),
        username,
        'Username input value maintained'
    );
    t.equal(
        $widget.find('input[name=password]').val(),
        password,
        'Password input value maintained'
    );

    t.end();
});

