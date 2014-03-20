YUI.add('navbar-recent-test', function (Y) {

var Assert = Y.Assert,
    suite;

suite = new Y.Test.Suite('NavBar.Recent');

suite.add(new Y.Test.Case({
    name: 'Lifecycle',

    tearDown: function () {
        this.navbar && this.navbar.destroy();
        delete this.navbar;
    },

    '`plug()` should bind the recent plugin': function () {
        this.navbar = new Y.Rednose.Navbar({
            contentBox: Y.one('#test'),
            menu: [
                {
                    id: 'file',
                    title: 'File',
                    items: [
                        { id: 'new', title: 'New template' },
                        { title: '-' },
                        { id: 'open', title: 'Open' },
                        { id: 'open-recent', title: 'Open recent' }
                    ]
                }
           ]
        });

        this.navbar.render();
        this.navbar.plug(Y.Rednose.Navbar.Recent, { node: 'open-recent' });

        Assert.isInstanceOf(Y.Rednose.Navbar.Recent, this.navbar.hasPlugin('recent'));

        this.navbar.unplug('recent');
    },

    '`unplug()` should purge the recent plugin': function () {
        this.navbar = new Y.Rednose.Navbar({
            contentBox: Y.one('#test'),
            menu: [
                {
                    id: 'file',
                    title: 'File',
                    items: [
                        { id: 'new', title: 'New template' },
                        { title: '-' },
                        { id: 'open', title: 'Open' },
                        { id: 'open-recent', title: 'Open recent' }
                    ]
                }
           ]
        });

        this.navbar.render();
        this.navbar.plug(Y.Rednose.Navbar.Recent, { node: 'open-recent' });

        this.navbar.unplug('recent');

        Assert.isUndefined(this.navbar.hasPlugin('recent'));
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-navbar-recent', 'test', 'node-event-simulate']
});
