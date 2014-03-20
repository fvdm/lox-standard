YUI.add('treeview-select-test', function (Y) {

var Assert = Y.Assert,
    suite;

suite = new Y.Test.Suite('Treeview.Selectable');

suite.add(new Y.Test.Case({
    name: 'Lifecycle',

    'destructor should free references to allow garbage collection': function () {
        var treeView = new Y.Rednose.TreeView();

        treeView.destroy();

        Assert.isNull(treeView._selectMap);
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-treeview-select', 'test', 'node-event-simulate']
});
