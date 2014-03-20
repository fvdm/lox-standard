YUI.add('model-undo-test', function (Y) {

var Assert = Y.Assert,
    suite;

suite = new Y.Test.Suite('Model.Undo');

suite.add(new Y.Test.Case({
    name: 'Lifecycle',

    'destructor should free references to allow garbage collection': function () {
        var undo = new Y.Rednose.Model.Undo();

        undo.addAction('Test action');

        undo.destroy();

        Assert.isNull(undo._revisions);
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-model-undo', 'test']
});
