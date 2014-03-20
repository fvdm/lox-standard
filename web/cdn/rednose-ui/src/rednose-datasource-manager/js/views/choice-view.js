/*jshint boss:true, expr:true, onevar:false */

var DataSource = Y.Rednose.DataSource.DataSource,
    Micro      = Y.Template.Micro;

var ChoicePageView = Y.Base.create('choicePageView', Y.View, [], {
    template: Micro.compile(
        '<form class="form-horizontal">'+
            '<fieldset>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="identifier">Identifier</label>' +
                    '<div class="controls">' +
                        '<input class="input-block-level" id="identifier" type="text" value="<%= data.get("identifier") %>"<% if (!data.isNew()) {%> disabled<% } %>/>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="name">Name</label>' +
                    '<div class="controls">' +
                        '<input class="input-block-level" id="name" type="text" value="<%= data.get("name") %>"/>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label">Type</label>' +
                    '<div class="controls">' +
                        '<label class="radio">' +
                            '<input type="radio" name="type" value="pdo" <% if (data.get("type") == "pdo") { %>checked<% } %><% if (!data.isNew()) {%> disabled<% } %>/>' +
                            'Database' +
                        '</label>' +
                        '<label class="radio">' +
                            '<input type="radio" name="type" value="dataGen" <% if (data.get("type") == "dataGen") { %>checked<% } %><% if (!data.isNew()) {%> disabled<% } %>/>' +
                            'DataGen' +
                        '</label>' +
                        '<label class="radio">' +
                            '<input type="radio" name="type" value="xml" <% if (data.get("type") == "xml") { %>checked<% } %><% if (!data.isNew()) {%> disabled<% } %>/>' +
                            'XML Data' +
                        '</label>' +
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

        container.setHTML(template(model));

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
        model: { value: new DataSource() }
    }
});
