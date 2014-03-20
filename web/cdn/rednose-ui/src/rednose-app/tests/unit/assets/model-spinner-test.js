YUI.add('model-spinner-test', function (Y) {

var Assert = Y.Assert,
    suite;

suite = new Y.Test.Suite('Model.Spinner');

suite.add(new Y.Test.Case({
    name: 'Basic',

    setUp: function () {
        var Model = Y.Base.create('model', Y.Model, [ Y.Rednose.Model.Spinner ], {
            sync: function (action, options, callback) {
                var data = {};

                Y.later(50, this, function () {
                    callback(null, data);
                });
            }
        });

        this.model = new Model();
    },

    tearDown: function () {
        this.model.destroy();

        this.model = null;
    },

    'Spinner should show when a model is destroyed': function () {
        this.model.destroy({ remove: true });

        Assert.isInstanceOf(Y.Node, Y.one('.rednose-spinner'));
    },

    'Spinner should hide after a model is destroyed': function () {
        this.model.destroy({ remove: true });

        this.wait(function(){
            Assert.isNull(Y.one('.rednose-spinner'));
        }, 100);
    },

    'Spinner should show when a model is saved': function () {
        this.model.save();

        Assert.isInstanceOf(Y.Node, Y.one('.rednose-spinner'));
    },

    'Spinner should hide after a model is saved': function () {
        this.model.save();

        this.wait(function(){
            Assert.isNull(Y.one('.rednose-spinner'));
        }, 100);
    },

    'Spinner should show when a model is loaded': function () {
        this.model.load();

        Assert.isInstanceOf(Y.Node, Y.one('.rednose-spinner'));
    },

    'Spinner should hide after a model is loaded': function () {
        this.model.load();

        this.wait(function(){
            Assert.isNull(Y.one('.rednose-spinner'));
        }, 100);
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-model-spinner', 'test']
});
