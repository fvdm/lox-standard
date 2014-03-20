YUI.add('app-base-test', function (Y) {

var Assert = Y.Assert,
    suite;

suite = new Y.Test.Suite('App');

suite.add(new Y.Test.Case({
    name: 'Basic',

    'showSpinner should render the spinner into the DOM': function () {
        Y.Rednose.App.showSpinner();

        Assert.isInstanceOf(Y.Node, Y.one('.rednose-spinner'));

        Y.Rednose.App.hideSpinner();
    },

    'hideSpinner should remove all active spinners on the page': function () {
        Y.Rednose.App.showSpinner();
        Y.Rednose.App.hideSpinner();

        Assert.isNull(Y.one('.rednose-spinner'));
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-app-base', 'test']
});
