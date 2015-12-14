var test = require('tape');
var CoinsLogonWidget = require('../scripts/coins-logon-widget.js');
var html = require('html!./index.html');
var jQuery = require('jquery');
var Promise = this.Promise = require('bluebird'); // phantomJS polyfill. seriously. :-|
jQuery(window.document.body).append(html);

var server;

var setWidgetFields = function(opts) {
    var widget = opts.widget;
    widget.form.formGroups[0].element.children[1].value = opts.username;
    widget.form.formGroups[1].element.children[1].value = opts.password;
};

test('constructor, basic', function(t) {
    var el = document.getElementById('regular_form');
    var myWidget = new CoinsLogonWidget({
        el: el,
        baseUrl: 'coins-api-root',
        authCookieName: 'coins-cookie-nom-noms',
    });
    t.ok(myWidget, 'constructor returns a widget');
    t.equal(myWidget.element, el, 'constructor sets el');
    t.ok(jQuery('#regular_form.coins-logon-widget:visible').length, 'form visible on DOM');
    t.end();
});

test('constructor, hiddenLabels', function(t) {
    var el = document.getElementById('hidden_labels_form');
    var myWidget = new CoinsLogonWidget({
        el: el,
        baseUrl: 'coins-api-root',
        authCookieName: 'coins-cookie-nom-noms',
        hiddenLabels: true
    });
    t.equal(
        2,
        jQuery('#hidden_labels_form .coins-logon-widget-label').length,
        'hidden label DOMs nodes present for both un and pw inputs'
    );

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
            myModule.logonWidget = new CoinsLogonWidget({
                el: document.getElementById(tempId),
                baseUrl: 'coins-api-root',
                authCookieName: 'delicious-cookies',
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

    t.end();
});

test('api activity', {timeout: 2000}, function(t) {
    t.plan(1);
    var el = document.getElementById('api_call_form');
    var myWidget = new CoinsLogonWidget({
        el: el,
        baseUrl: 'http://localhost:12354',
        authCookieName: 'CAS_Auth_User', // @TODO, test when i figure out how to set x-domain cookies
    });
    var wigetData = {
        widget: myWidget,
        username: 'someun',
        password: 'somepassword',
    };
    setWidgetFields(wigetData);
    Promise.resolve(myWidget.login(wigetData))
    .then(function() {
        t.equal(jQuery('#api_call_form button').text(), 'Log Out', 'login cycle successful');
    })
    .catch(t.fail)
    .then(t.end);
});
