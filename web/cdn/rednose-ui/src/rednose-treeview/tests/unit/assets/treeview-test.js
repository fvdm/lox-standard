YUI.add('treeview-test', function (Y) {

var Assert = Y.Assert,
    suite;

suite = new Y.Test.Suite('Treeview');

suite.add(new Y.Test.Case({
    name: 'Lifecycle',

    setUp: function () {
        Y.one('#container').append('<div id="treeview"></div>');
    },

    'constructor should work without a treemodel': function () {
        var treeView = new Y.Rednose.TreeView();

        Assert.isInstanceOf(Y.Rednose.TreeView, treeView);

        treeView.destroy();
    },

    'destructor should remove the container from the DOM': function () {
        var treeView = new Y.Rednose.TreeView({
            container: Y.one('#treeview')
        });

        treeView.render();
        treeView.destroy();

        Assert.isUndefined(treeView.get('#treeview'));
    },

    'destructor should free references to allow garbage collection': function () {
        var treeView = new Y.Rednose.TreeView();

        treeView.destroy();

        Assert.isNull(treeView._stateMap);
    }
}));

suite.add(new Y.Test.Case({
    name: 'Basic',

    setUp: function () {
        Y.one('#container').append('<div id="treeview"></div>');

        var FIXTURES = {
            label   : "Home",
            data    : new Y.Model(),
            children: [
                {
                    label   : "Folder 1",
                    data    : new Y.Model(),
                    children: [
                        {
                            label   : "Subfolder 1",
                            data    : new Y.Model()
                        },
                        {
                            label   : "Subfolder 2",
                            data    : new Y.Model()
                        }
                    ]
                },
                {
                    label   : "Folder 2",
                    data    : new Y.Model()
                },
                {
                    label   : "Folder 3",
                    data    : new Y.Model()
                },
                {
                    label   : "Folder 4",
                    data    : new Y.Model()
                }
            ]
        };

        this.model = new Y.Rednose.ModelTree({
            items: FIXTURES
        });
    },

    tearDown: function () {
        this.model = null;

        Y.one('#treeview').remove(true);
    },

    'nodes can be opened silently before the treeview is rendered': function () {
        var treeView = new Y.Rednose.TreeView({
            container: Y.one('#treeview'),
            model: this.model
        });

        var node = treeView.rootNode.children[0];
        node.open({ silent: true });

        treeView.render();

        Assert.isNotNull(treeView.getHTMLNode(node.children[0]));
    },

    'nodes can be opened non-silently before the treeview is rendered': function () {
        var treeView = new Y.Rednose.TreeView({
            container: Y.one('#treeview'),
            model: this.model
        });

        var node = treeView.rootNode.children[0];
        node.open();

        treeView.render();

        Assert.isNotNull(treeView.getHTMLNode(node.children[0]));
    },

    'render should render the TreeView into the DOM': function () {
        var treeView = new Y.Rednose.TreeView({
            container: Y.one('#treeview')
        });

        treeView.render();

        Assert.isTrue(Y.one('#treeview').hasClass('yui3-treeview'));

        treeView.destroy();
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-treeview', 'test', 'node-event-simulate']
});
