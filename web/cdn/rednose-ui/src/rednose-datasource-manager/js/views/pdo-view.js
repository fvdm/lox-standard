/*jshint boss:true, expr:true, onevar:false */

var PdoSource  = Y.Rednose.DataSource.PdoSource,
    Micro      = Y.Template.Micro;

var PdoGenericPageView = Y.Base.create('pdoGenericPageView', Y.View, [], {
    template: Micro.compile(
        '<form class="form-horizontal">'+
            '<fieldset>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="dsn">DSN</label>' +
                    '<div class="controls">' +
                        '<input class="input-block-level" id="dsn" type="text" value="<%= data.dsn %>"/>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="username">Username</label>' +
                    '<div class="controls">' +
                        '<input class="input-block-level" id="username" type="text" value="<%= data.username %>"/>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="password">Password</label>' +
                    '<div class="controls">' +
                        '<input class="input-block-level" id="password" type="password" value="<%= data.password %>"/>' +
                    '</div>' +
                '</div>' +
            '</fieldset>' +
        '</form>'
    ),

    events: {
        'form': {
            change: '_handleFormChange'
        }
    },

    render: function () {
        var container = this.get('container'),
            template  = this.template,
            model     = this.get('model');

        container.setHTML(template(model.getAttrs()));

        return this;
    },

    _handleFormChange: function (e) {
        var node  = e.target,
            id    = node.get('type') === 'radio' ? node.get('name') : node.get('id');
            value = node.get('type') === 'checkbox' ? node.get('checked') : node.get('value');

        this.get('model').set(id, value);
    }
}, {
    ATTRS: {
        model: { value: new PdoSource() }
    }
});

var PdoSource = Y.Rednose.DataSource.PdoSource,
    Micro     = Y.Template.Micro;

var PdoSourcePageView = Y.Base.create('pdoSourcePageView', Y.View, [], {
    OPTION_TEMPLATE: Micro.compile('<option id="<%= data.id %>"<% if (data.selected) {%> selected<% }%>><%= data.value %></option>'),

    template: Micro.compile(
        '<form class="form-horizontal">' +
            '<fieldset>' +
                '<div class="control-group">' +
                    '<label class="control-label radio inline">' +
                        '<input type="radio" name="source" value="table" data-radio-group="source"<% if (data.source == "table") { %> checked<% } %>/> Table' +
                    '</label>' +
                    '<div class="controls">' +
                        '<select class="input-block-level" id="table" data-radio="source"<% if (data.source != "table") { %> disabled<% } %>></select>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label radio inline">' +
                        '<input type="radio" name="source" value="query" data-radio-group="source"<% if (data.source == "query") { %> checked<% } %>/> Query' +
                    '</label>' +
                        '<div class="controls">' +
                            '<textarea rows="3" spellcheck="false" class="input-block-level" id="query" data-radio="source"<% if (data.source != "query") { %> disabled<% } %>><%= data.query %></textarea >' +
                        '</div>' +
                '</div>' +
            '</fieldset>' +
        '</form>'
    ),

    events: {
        'form': {
            change: '_handleFormChange'
        },

        '[data-radio-group]': { change: '_handleRadio' }
    },

    render: function () {
        var container = this.get('container'),
            template  = this.template,
            model     = this.get('model');

        container.setHTML(template(model.getAttrs()));

        this._refreshTables();

        return this;
    },

    disableNode: function (node, disabled) {
        if (disabled) {
            node.setAttribute('disabled');

            return;
        }

        node.hasAttribute('disabled') && node.removeAttribute('disabled');
    },

    updateSelectNode: function (node, data) {
        var self  = this,
            model = this.get('model');

        node.empty();

        Y.Array.each(data, function (value) {
            node.append(self.OPTION_TEMPLATE({
                id      : value,
                value   : value,
                selected: model.get('table') === value
            }));
        });
    },

    _refreshTables: function () {
        var self      = this,
            tableNode = this.get('container').one('#table');

        Y.io(Routing.generate('rednose_dataprovider_operations_list_tables'), {
            method: 'POST',
            data  : 'dsn=mysql:host=localhost;dbname=libbit_flowgen&username=root&password=root',
            on    : {
                success : function (tx, r) {
                    self.updateSelectNode(tableNode, Y.JSON.parse(r.responseText));
                }
            }
        });
    },

    _handleRadio: function (e) {
        var self      = this,
            value     = e.target.get('value'),
            container = this.get('container');

         // Get all radio buttons, and sync their relative input.
         container.all('[data-radio-group]').each(function (radio) {
             var matchingInput = radio.ancestor('div').one('[data-radio]'),
                 disable       = matchingInput.get('id') !== value;

             self.disableNode(matchingInput, disable);

             !disable && matchingInput.focus();
         });
    },

    _handleFormChange: function (e) {
        var node  = e.target,
            id    = node.get('type') === 'radio' ? node.get('name') : node.get('id');
            value = node.get('type') === 'checkbox' ? node.get('checked') : node.get('value');

        this.get('model').set(id, value);
    }
}, {
    ATTRS: {
        model: { value: new PdoSource() }
    }
});
