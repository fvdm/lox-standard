YUI.add('navbar-base-test', function (Y) {

var Assert = Y.Assert,
    suite;

// -- Suite --------------------------------------------------------------------
suite = new Y.Test.Suite('Navbar');

// -- Lifecycle ----------------------------------------------------------------
suite.add(new Y.Test.Case({
    name: 'Lifecycle',

    tearDown: function () {
        this.navbar && this.navbar.destroy();
        delete this.navbar;
    },

    'Y.Rednose.Navbar() should create a new navbar widget': function () {
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

        Assert.isInstanceOf(Y.Rednose.Navbar, this.navbar, 'Not an instance of a `Y.Rednose.Navbar`.');
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-navbar', 'test']
});
