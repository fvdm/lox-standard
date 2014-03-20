/* jshint expr:true, onevar:false */

YUI.add('dialog-base-test', function (Y) {

var Assert = Y.Assert,
    suite;

suite = new Y.Test.Suite('Dialog');

suite.add(new Y.Test.Case({
    name: 'Lifecycle',

    '`destroy()` should destroy the view': function () {
        var dialog = new Y.Rednose.Dialog();

        dialog.alert({
            title: 'Test title',
            text: 'Test message body.'
        });

        Assert.isFalse(dialog.get('destroyed'));
        Assert.isObject(Y.one('.rednose-dialog'));

        dialog.destroy();

        Assert.isTrue(dialog.get('destroyed'));
        Assert.isNull(Y.one('.rednose-dialog'));
    },

    '`destroy()` shouldn\'t throw an error when called before the dialog is shown': function () {
        var dialog = new Y.Rednose.Dialog();

        Assert.isFalse(dialog.get('destroyed'));

        dialog.destroy();

        Assert.isTrue(dialog.get('destroyed'));
    }
}));

suite.add(new Y.Test.Case({
    name: 'Basic',

    '`confirm()` should render the confirmation dialog correctly': function () {
        var dialog = new Y.Rednose.Dialog();

        var title      = 'Test Title';
        var message    = 'Test message body.';
        var confirmVal = 'Confirm!';

        dialog.confirm({
            title: title,
            text: message,
            confirm: confirmVal
        });

        // Get the last child, the first could be the potential close icon.
        var titleNode   = Y.one('.rednose-dialog').one('.yui3-widget-hd').one('div').one('div:last-child');
        var messageNode = Y.one('.rednose-dialog').one('.yui3-widget-bd').one('p');
        var primaryNode = Y.one('.rednose-dialog').one('.yui3-widget-ft').one('.btn-primary');

        Assert.areEqual(titleNode.get('text'), title);
        Assert.areEqual(messageNode.get('text'), message);
        Assert.areEqual(primaryNode.get('text'), confirmVal);

        dialog.destroy();
    },

    '`alert()` should render the alert dialog correctly': function () {
        var dialog = new Y.Rednose.Dialog();

        var title      = 'Test Title';
        var message    = 'Test message body.';

        dialog.confirm({
            title: title,
            text: message
        });

        // Get the last child, the first could be the potential close icon.
        var titleNode   = Y.one('.rednose-dialog').one('.yui3-widget-hd').one('div').one('div:last-child');
        var messageNode = Y.one('.rednose-dialog').one('.yui3-widget-bd').one('p');

        Assert.areEqual(titleNode.get('text'), title);
        Assert.areEqual(messageNode.get('text'), message);

        dialog.destroy();
    }
}));

suite.add(new Y.Test.Case({
    name: 'Callbacks',

    '`confirm()` should close on cancel': function () {
        var dialog = new Y.Rednose.Dialog();

        var title   = 'Test Title';
        var message = 'Test message body.';

        dialog.confirm({
            title: title,
            text: message
        });

        Y.one('.yui3-widget-ft').one('.btn').simulate('click');

        Assert.isNull(Y.one('.rednose-dialog'));
    },

    '`confirm()` should execute confirm callback method': function () {
        var dialog = new Y.Rednose.Dialog(),
            mock   = Y.Mock;

        var title   = 'Test Title';
        var message = 'Test message body.';

        Y.Mock.expect(mock, { method: 'callback', args: [] });

        dialog.confirm({
            title: title,
            text : message
        }, mock.callback);

        Y.one('.yui3-widget-ft').one('.btn-primary').simulate('click');

        Y.Mock.verify(mock);
        Assert.isNull(Y.one('.rednose-dialog'));
    }
}));

suite.add(new Y.Test.Case({
    name: 'Element focus',

    'Default button should be focussed': function () {
        var dialog;

        dialog = Y.Rednose.Dialog.alert({
            title: 'Test Title',
            text : 'Test message body.'
        });

        Y.Assert.areSame(Y.one('.yui3-widget-ft').one('.btn').getDOMNode(), document.activeElement);
        dialog.destroy();

        dialog = Y.Rednose.Dialog.confirm({
            title: 'Test Title',
            text : 'Test message body.'
        });

        Y.Assert.areSame(Y.one('.yui3-widget-ft').one('.btn-primary').getDOMNode(), document.activeElement);
        dialog.destroy();
    }
}));

suite.add(new Y.Test.Case({
    name: 'Keyboard events',

    '`escape` key should close the dialog': function () {
        var dialog;

        dialog = Y.Rednose.Dialog.alert({
            title: 'Test Title',
            text: 'Test message body.'
        });

        Y.one('.yui3-panel-content').simulate('keydown', {keyCode: 27});
        Assert.isNull(Y.one('.rednose-dialog'));
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-dialog', 'test']
});
