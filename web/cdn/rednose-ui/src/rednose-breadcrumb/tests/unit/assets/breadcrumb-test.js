/* jshint expr:true, onevar:false */

YUI.add('breadcrumb-test', function (Y) {

var Assert = Y.Assert,
    suite;

// -- Suite --------------------------------------------------------------------
suite = new Y.Test.Suite('Breadcrumb');

// -- Lifecycle ----------------------------------------------------------------
suite.add(new Y.Test.Case({
    name: 'Lifecycle',

    tearDown: function () {
        this.breadcrumb && this.breadcrumb.destroy();
        delete this.breadcrumb;
        Y.one('#test').empty();
    },

    'Y.Rednose.Breadcrumb() should create a new breadcrumb': function () {
        this.breadcrumb = new Y.Rednose.Breadcrumb();

        Assert.isInstanceOf(Y.Rednose.Breadcrumb, this.breadcrumb);
    },

    'Y.Rednose.Breadcrumb() should render the container in the DOM': function () {
        this.breadcrumb = new Y.Rednose.Breadcrumb({
            container: Y.one('#test')
        });
        this.breadcrumb.render();

        Assert.isTrue(Y.one('body').contains(this.breadcrumb.get('container')));
    },

    'render() should return the instance': function () {
        this.breadcrumb = new Y.Rednose.Breadcrumb();

        Assert.isInstanceOf(Y.Rednose.Breadcrumb, this.breadcrumb.render());
    },

    'destroy() should free references': function () {
        this.breadcrumb = new Y.Rednose.Breadcrumb();

        this.breadcrumb.destroy();

        Assert.isNull(this.breadcrumb._breadcrumbs);
    }
}));

suite.add(new Y.Test.Case({
    name: 'Basic',

    tearDown: function () {
        this.breadcrumb && this.breadcrumb.destroy();
        delete this.breadcrumb;
        Y.one('#test').empty();
    },

    'render() should render the `Home` token if no path is provided': function () {
        this.breadcrumb = new Y.Rednose.Breadcrumb({
            container: Y.one('#test')
        });

        this.breadcrumb.render();

        Assert.areEqual('Home', Y.one('.breadcrumb li span').get('innerHTML'));
    },

    'render() should set the `data` attribute': function () {
        this.breadcrumb = new Y.Rednose.Breadcrumb({
            container: Y.one('#test')
        });

        this.breadcrumb.render();

        Assert.areEqual('/Home', Y.one('.breadcrumb li').getAttribute('data-rednose-entry'));
    },

    'render() should render the path instantly when one is provided': function () {
        this.breadcrumb = new Y.Rednose.Breadcrumb({
            container: Y.one('#test'),
            path: '/Folder 1/Folder 2'
        });

        this.breadcrumb.render();

        Assert.areEqual('Home', Y.all('.breadcrumb li').item(0).one('a').get('innerHTML'));
        Assert.areEqual('Folder 1', Y.all('.breadcrumb li').item(1).one('a').get('innerHTML'));
        Assert.areEqual('Folder 2', Y.all('.breadcrumb li').item(2).one('span').get('innerHTML'));
    }
}));

suite.add(new Y.Test.Case({
    name: 'Events',

    tearDown: function () {
        this.breadcrumb && this.breadcrumb.destroy();
        delete this.breadcrumb;
        Y.one('#test').empty();
    },

    'setting the `path` attribute should re-render the breadcrumbs': function () {
        this.breadcrumb = new Y.Rednose.Breadcrumb({
            container: Y.one('#test')
        });
        this.breadcrumb.render();

        this.breadcrumb.set('path', '/Folder 1/Folder 2');

        Assert.areEqual('Home', Y.all('.breadcrumb li').item(0).one('a').get('innerHTML'));
        Assert.areEqual('Folder 1', Y.all('.breadcrumb li').item(1).one('a').get('innerHTML'));
        Assert.areEqual('Folder 2', Y.all('.breadcrumb li').item(2).one('span').get('innerHTML'));
    },

    'clicking a token should fire the `navigate` event': function () {
        this.breadcrumb = new Y.Rednose.Breadcrumb({
            container: Y.one('#test'),
            path: '/Folder 1/Folder 2'
        });
        this.breadcrumb.render();

        var folder1Node = Y.all('.breadcrumb li').item(1).one('a'),
            mock        = Y.Mock;

        Y.Mock.expect(mock, { method: 'callback', args: [] });

        this.breadcrumb.on('navigate', function () {
            mock.callback();
        });

        folder1Node.simulate('click');

        Y.Mock.verify(mock);
    },

    'clicking a token should provide the selected path': function () {
        this.breadcrumb = new Y.Rednose.Breadcrumb({
            container: Y.one('#test'),
            path: '/Folder 1/Folder 2'
        });
        this.breadcrumb.render();

        var folder1Node = Y.all('.breadcrumb li').item(1).one('a'),
            mock        = Y.Mock;

        Y.Mock.expect(mock, {
            method: 'callback',
            args: [ '/Folder 1' ]
        });

        this.breadcrumb.on('navigate', function (e) {
            mock.callback(e.data);
        });

        folder1Node.simulate('click');

        Y.Mock.verify(mock);
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-breadcrumb', 'test', 'node-event-simulate']
});
