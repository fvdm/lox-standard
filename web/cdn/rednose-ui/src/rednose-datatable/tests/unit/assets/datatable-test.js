YUI.add('datatable-test', function (Y) {

var Assert = Y.Assert,
    suite;

suite = new Y.Test.Suite('DataTable');

suite.add(new Y.Test.Case({
    name: 'CSS',

    'Table nodes should have Bootstrap CSS applied': function () {
        var table = new Y.Rednose.DataTable();

        table.render();

        Assert.isTrue(Y.one('.yui3-datatable table').hasClass('table'));

        table.destroy();
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-datatable', 'test', 'node-event-simulate']
});
