YUI.add('view-nav-test', function (Y) {

var Assert = Y.Assert,
    suite;

suite = new Y.Test.Suite('View.Nav');

suite.add(new Y.Test.Case({
    name: 'Lifecycle',

    'destructor should free references to allow garbage collection': function () {
        var nav = new Y.Rednose.View.Nav();

        nav.title = 'Title';
        nav.buttons = {};

        nav.destroy();

        Assert.isNull(nav.title);
        Assert.isNull(nav.buttons);
        Assert.isNull(nav._footer);
        Assert.isNull(nav._buttonMap);
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-view-nav', 'test']
});
