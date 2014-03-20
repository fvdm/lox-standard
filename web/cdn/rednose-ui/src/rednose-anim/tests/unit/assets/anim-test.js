YUI.add('anim-test', function (Y) {

var Assert = Y.Assert,
    suite;

// -- Suite --------------------------------------------------------------------
suite = new Y.Test.Suite('Anim');

// -- Lifecycle ----------------------------------------------------------------
suite.add(new Y.Test.Case({
    name: 'Lifecycle',

    setUp: function () {
        Y.one('body').append(Y.Node.create('<div id="anim"></div>'));
    },

    'Anim.vortex should remove the node from the DOM': function () {
        var node = Y.one('#anim');

        Y.Rednose.Anim.vortex(node, 0, 0);

        this.wait(function(){
            Assert.isNull(Y.one('#anim'));
        }, 500);
    },

    'Anim.squeeze should remove the node from the DOM': function () {
        var node = Y.one('#anim');

        Y.Rednose.Anim.squeeze(node);

        this.wait(function(){
            Assert.isNull(Y.one('#anim'));
        }, 500);
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-anim', 'test']
});
