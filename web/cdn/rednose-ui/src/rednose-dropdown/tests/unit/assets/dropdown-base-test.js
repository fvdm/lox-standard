YUI.add('dropdown-base-test', function (Y) {

var Assert = Y.Assert,
    suite;

suite = new Y.Test.Suite('Dropdown');

suite.add(new Y.Test.Case({
    name: 'Lifecycle',

    setUp: function () {
        Y.one('#container').append(Y.Node.create('<button id="button">Test</button>'));
    },

    tearDown: function () {
        Y.one('#button').remove();
    },

    '`plug()` should bind the dropdown': function () {
        var button = Y.one('#button');

        button.plug(Y.Rednose.Dropdown, {
            content: [
                { id: 'testItem1', title: 'Test Item 1' },
                { id: 'testItem2', title: 'Test Item 2' }
            ]
        });

        Assert.isInstanceOf(Y.Rednose.Dropdown, button.hasPlugin('dropdown'));
        Assert.isObject(Y.one('.dropdown-menu'));

        button.unplug('dropdown');
    },

    '`unplug()` should purge the dropdown': function () {
        var button = Y.one('#button');

        button.plug(Y.Rednose.Dropdown, {
            content: [
                { id: 'testItem1', title: 'Test Item 1' },
                { id: 'testItem2', title: 'Test Item 2' }
            ]
        });

        button.unplug('dropdown');

        Assert.isUndefined(button.hasPlugin('dropdown'));
        Assert.isNull(Y.one('.dropdown-menu'));
    }
}));

suite.add(new Y.Test.Case({
    name: 'Config',

    setUp: function () {
        Y.one('#container').append(Y.Node.create('<button id="button">Test</button>'));
    },

    tearDown: function () {
        Y.one('#button').remove();
    },

    '`dropup` set to `false` should render the menu downwards': function () {
        var button = Y.one('#button');

        button.plug(Y.Rednose.Dropdown, {
            dropup: false,
            content: [
                { id: 'testItem1', title: 'Test Item 1' },
                { id: 'testItem2', title: 'Test Item 2' }
            ]
        });

        Assert.isTrue(button.get('parentNode').hasClass('dropdown'));
        button.unplug('dropdown');
    },

    '`dropup` set to `true` should render the menu upwards': function () {
        var button = Y.one('#button');

        button.plug(Y.Rednose.Dropdown, {
            dropup: true,
            content: [
                { id: 'testItem1', title: 'Test Item 1' },
                { id: 'testItem2', title: 'Test Item 2' }
            ]
        });

        Assert.isTrue(button.get('parentNode').hasClass('dropup'));

        button.unplug('dropdown');
    }
}));

suite.add(new Y.Test.Case({
    name: 'Events',

    setUp: function () {
        Y.one('#container').append(Y.Node.create('<button id="button">Test</button>'));
    },

    tearDown: function () {
    },

    'Dropdown should be invisible when initialized': function () {
        var button = Y.one('#button');

        button.plug(Y.Rednose.Dropdown, {
            dropup: false,
            content: [
                { id: 'testItem1', title: 'Test Item 1' },
                { id: 'testItem2', title: 'Test Item 2' }
            ]
        });

        Assert.isFalse(button.get('parentNode').hasClass('open'));

        button.unplug('dropdown');
        button.remove();
    },

    'Dropdown should be visible when host is clicked': function () {
        var button = Y.one('#button');

        button.plug(Y.Rednose.Dropdown, {
            dropup: false,
            content: [
                { id: 'testItem1', title: 'Test Item 1' },
                { id: 'testItem2', title: 'Test Item 2' }
            ]
        });

        button.simulate('click');

        Assert.isTrue(button.get('parentNode').hasClass('open'));

        button.unplug('dropdown');
        button.remove();
    },

    'Dropdown should toggle when host is clicked multiple times': function () {
        var button = Y.one('#button');

        button.plug(Y.Rednose.Dropdown, {
            dropup: false,
            content: [
                { id: 'testItem1', title: 'Test Item 1' },
                { id: 'testItem2', title: 'Test Item 2' }
            ]
        });

        button.simulate('click');
        Assert.isTrue(button.get('parentNode').hasClass('open'));

        button.simulate('click');
        Assert.isFalse(button.get('parentNode').hasClass('open'));

        button.simulate('click');
        Assert.isTrue(button.get('parentNode').hasClass('open'));

        button.unplug('dropdown');
        button.remove();
    },

    'Dropdown should hide when clicked outside': function () {
        var button = Y.one('#button');

        button.plug(Y.Rednose.Dropdown, {
            dropup: false,
            content: [
                { id: 'testItem1', title: 'Test Item 1' },
                { id: 'testItem2', title: 'Test Item 2' }
            ]
        });

        button.simulate('click');
        Assert.isTrue(button.get('parentNode').hasClass('open'));

        Y.one('body').simulate('click');
        Assert.isFalse(button.get('parentNode').hasClass('open'));

        button.unplug('dropdown');
        button.remove();
    },

    'Dropdown should hide when an item is clicked': function () {
        var button = Y.one('#button');

        button.plug(Y.Rednose.Dropdown, {
            dropup: false,
            content: [
                { id: 'testItem1', title: 'Test Item 1' },
                { id: 'testItem2', title: 'Test Item 2' }
            ]
        });

        button.simulate('click');
        Assert.isTrue(button.get('parentNode').hasClass('open'));

        button.get('parentNode').one('a').simulate('click');
        Assert.isFalse(button.get('parentNode').hasClass('open'));

        button.unplug('dropdown');
        button.remove();
    }
}));

Y.Test.Runner.add(suite);

}, '@VERSION@', {
    requires: ['rednose-dropdown', 'test', 'node-event-simulate']
});
