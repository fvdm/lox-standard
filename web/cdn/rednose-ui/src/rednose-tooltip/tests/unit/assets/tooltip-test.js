YUI.add('tooltip-test', function (Y) {

var Assert = Y.Assert,
    suite;

suite = new Y.Test.Suite('Tooltip');

suite.add(new Y.Test.Case({
    name: 'Basic',

    setUp: function () {
        Y.one('#container').append(Y.Node.create('<button id="button" rel="tooltip">Test</button>'));
    },

    tearDown: function () {
    },

    'Z-index should be corrected': function () {
        var button = Y.one('#button');

        var tooltipManager = new Y.Rednose.Tooltip({ selector : '*[rel=tooltip]' });

        Assert.areEqual('1070', Y.one('.yui3-bootstraptooltip').getStyle('zIndex'));

        tooltipManager.destroy();
        button.remove();
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-tooltip', 'test', 'node-event-simulate']
});
