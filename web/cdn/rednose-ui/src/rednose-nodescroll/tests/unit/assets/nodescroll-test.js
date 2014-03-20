YUI.add('nodescroll-test', function (Y) {

var Assert = Y.Assert,
    suite;

// -- Suite --------------------------------------------------------------------
suite = new Y.Test.Suite('NodeScroll');

// -- Lifecycle ----------------------------------------------------------------
suite.add(new Y.Test.Case({
    name: 'Lifecycle',

    tearDown: function () {
        this.nodeScroll && this.nodeScroll.destroy();
        delete this.nodeScroll;
        Y.one('#test').empty();
    },

    'Y.Rednose.NodeScroll() should create a new nodeScroll instance': function () {
        this.nodeScroll = new Y.Rednose.NodeScroll({
            container: Y.one('#test')
        });

        Assert.isInstanceOf(Y.Rednose.NodeScroll, this.nodeScroll, 'Not an instance of a `Y.Rednose.NodeScroll`.');
    }
}));

// -- Basic --------------------------------------------------------------------
suite.add(new Y.Test.Case({
    name: 'Basic',

    'Y.Rednose.NodeScroll() should add the correct CSS class': function () {
        var container = Y.one('#test');
        var nodeScroll = new Y.Rednose.NodeScroll({
            container: container
        });

        Assert.isTrue(container.hasClass('rednose-scroll-view'));

        nodeScroll.destroy();
    },

    'Y.Rednose.NodeScroll() should remove the correct CSS class': function () {
        var container = Y.one('#test');
        var nodeScroll = new Y.Rednose.NodeScroll({
            container: container
        });

        nodeScroll.destroy();

        Assert.isFalse(container.hasClass('rednose-scroll-view'));
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-nodescroll', 'test']
});
