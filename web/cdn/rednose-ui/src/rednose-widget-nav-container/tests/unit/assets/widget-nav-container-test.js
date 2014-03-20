YUI.add('widget-nav-container-test', function (Y) {

var Assert = Y.Assert,
    suite;

// -- Suite --------------------------------------------------------------------
suite = new Y.Test.Suite('NavContainer');

// -- Lifecycle ----------------------------------------------------------------
suite.add(new Y.Test.Case({
    name: 'Lifecycle',

    tearDown: function () {
        this.navContainer && this.navContainer.destroy();
        delete this.navContainer;
        Y.one('#test').empty();
    },

    'Y.Rednose.NavContainer() should create a new navContainer widget': function () {
        this.navContainer = new Y.Rednose.NavContainer();
        this.navContainer.render('#test');

        Assert.isInstanceOf(Y.Rednose.NavContainer, this.navContainer, 'Not an instance of a `Y.Rednose.NavContainer`.');
        Assert.isTrue(Y.one('#test').contains(this.navContainer.get('boundingBox')), 'NavContainer was not rendered into "#test".');
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-widget-nav-container', 'test']
});
