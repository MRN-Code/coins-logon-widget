var test = require('tape');
var CoinsLogonWidget = require('../scripts/coins-logon-widget.js');
var cookies = require('js-cookie');
var html = require('html!./index.html');
var jQuery = require('jquery');
var Promise = this.Promise = require('bluebird'); // phantomJS polyfill. seriously. :-|
var testUtils = require('./test-utils');

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
    Promise.resolve(myWidget.login(wigetData))
    .then(function() {
        t.equal(jQuery('#api_call_form button').text(), 'Log Out', 'login cycle successful');
    })
    .catch(t.fail)
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
        testUtils.teardownWidget(myWidget);
        t.end();
    };

    myWidget.once('login:success', function(response) {
        t.equal(response.username, username, 'retrieves username');
    });
});
