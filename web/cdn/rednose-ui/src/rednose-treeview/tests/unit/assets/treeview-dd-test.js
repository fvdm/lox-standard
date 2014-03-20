YUI.add('treeview-dd-test', function (Y) {

var Assert = Y.Assert,
    suite;

suite = new Y.Test.Suite('Treeview.DD');

suite.add(new Y.Test.Case({
    name: 'Lifecycle',

    'destructor should free references to allow garbage collection': function () {
        var treeView = new Y.Rednose.TreeView();

        treeView.destroy();

        Assert.isNull(treeView._ddMap);
        Assert.isNull(treeView._callbacks);
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-dd', 'test', 'node-event-simulate']
});
