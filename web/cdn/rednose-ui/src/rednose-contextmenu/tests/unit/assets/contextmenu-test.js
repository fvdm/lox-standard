YUI.add('contextmenu-test', function (Y) {

var Assert = Y.Assert,
    suite;

suite = new Y.Test.Suite('ContextMenu');

suite.add(new Y.Test.Case({
    name: 'Lifecycle',

    setUp: function () {
        Y.one('#container').append(Y.Node.create('<button id="button">Test</button>'));
    },

    tearDown: function () {
        Y.one('#button').remove();
    },

    '`plug()` should bind the menu': function () {
        var button = Y.one('#button');

        button.plug(Y.Rednose.ContextMenu, {
            content: [
              { title: 'test', id: 'test' },
            ],

            data   : {}
        });

        Assert.isInstanceOf(Y.Rednose.ContextMenu, button.hasPlugin('contextMenu'));

        button.unplug('contextMenu');
    },

    '`unplug()` should purge the menu': function () {
        var button = Y.one('#button');

        button.plug(Y.Rednose.ContextMenu, {
            content: [
              { title: 'test', id: 'test' },
            ],

            data   : {}
        });

        button.unplug('contextMenu');

        Assert.isUndefined(button.hasPlugin('contextMenu'));
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-contextmenu', 'test', 'node-event-simulate']
});
