YUI.add('panel-test', function (Y) {

var Assert = Y.Assert,
    suite;

// -- Suite --------------------------------------------------------------------
suite = new Y.Test.Suite('Panel');

// -- Lifecycle ----------------------------------------------------------------
suite.add(new Y.Test.Case({
    name: 'Lifecycle',

    tearDown: function () {
        this.panel && this.panel.destroy();
        delete this.panel;
        Y.one('#test').empty();
    },

    'Y.Rednose.Panel() should create a new panel': function () {
        this.panel = new Y.Rednose.Panel();
        this.panel.render();

        Assert.isInstanceOf(Y.Rednose.Panel, this.panel, 'Not an instance of a `Y.Rednose.Pabel`.');
        Assert.isTrue(Y.one('body').contains(this.panel.get('boundingBox')), 'Panel was not rendered into the DOM.');
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-panel', 'test']
});
