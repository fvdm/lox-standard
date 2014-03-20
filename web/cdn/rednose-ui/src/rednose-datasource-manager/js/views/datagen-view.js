/*jshint boss:true, expr:true, onevar:false */

var DatagenSource = Y.Rednose.DataSource.DatagenSource;

var DataGenGenericPageView = Y.Base.create('dataGenGenericPageView', Y.View, [], {
    template:
        '<form class="form-horizontal">'+
            '<fieldset>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="url">URL</label>' +
                    '<div class="controls">' +
                        '<input class="input-block-level" id="url" type="text"/>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="username">Username</label>' +
                    '<div class="controls">' +
                        '<input class="input-block-level" id="username" type="text"/>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="password">Password</label>' +
                    '<div class="controls">' +
                        '<input class="input-block-level" id="password" type="password"/>' +
                    '</div>' +
                '</div>' +
            '</fieldset>' +
        '</form>',

    render: function () {
        var container = this.get('container'),
            template  = this.template;

        container.setHTML(template);

        return this;
    }
}, {
    ATTRS: {
        model: { value: new DatagenSource() }
    }
});

var DatagenSource = Y.Rednose.DataSource.DatagenSource;

var DataGenSourcePageView = Y.Base.create('dataGenSourcePageView', Y.View, [], {
    OPTION_TEMPLATE: '<option id="{id}">{value}</option>',

    template:
        '<form class="form-horizontal">'+
            '<fieldset>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="section">Section</label>' +
                    '<div class="controls">' +
                        '<select class="input-block-level" id="section"></select>' +
                    '</div>' +
                '</div>' +
            '</fieldset>' +
        '</form>',

    render: function () {
        var container = this.get('container'),
            template  = this.template;

        container.setHTML(template);

        this._refreshSections();

        return this;
    },

    updateSelectNode: function (node, data) {
        var self = this;

        node.empty();

        Y.Array.each(data, function (value) {
            node.append(Y.Lang.sub(self.OPTION_TEMPLATE, {
                id   : value,
                value: value
            }));
        });
    },

    _refreshSections: function () {
        var self        = this,
            sectionNode = this.get('container').one('#section');

        Y.io(Routing.generate('rednose_dataprovider_operations_list_sections'), {
            method: 'POST',
            data  : 'url=http://datagen-standard.dev&username=admin&password=adminpasswd',
            on    : {
                success : function (tx, r) {
                    self.updateSelectNode(sectionNode, Y.JSON.parse(r.responseText));
                }
            }
        });
    }
}, {
    ATTRS: {
        model: { value: new DatagenSource() }
    }
});
