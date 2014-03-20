YUI.add('rednose-treeview-templates', function (Y, NAME) {

/*jshint expr:true, maxlen:200, onevar:false */

var Micro = Y.Template.Micro;

// Overrides `gallery-sm-treeview-templates`
Y.namespace('TreeView').Templates = {
    children: Micro.compile(
        '<ul class="<%= data.classNames.children %>" ' +

            '<% if (data.node.isRoot()) { %>' +
                'role="tree" tabindex="0"' +
            '<% } else { %>' +
                'role="group"' +
            '<% } %>' +

        '></ul>'
    ),

    node: Micro.compile(
        '<li id="<%= data.node.id %>" class="<%= data.nodeClassNames.join(" ") %>" title="<%= data.node.label %>" role="treeitem" aria-labelled-by="<%= data.node.id %>-label">' +
            '<div class="<%= data.classNames.row %>" data-node-id="<%= data.node.id %>" data-rednose-type="<%= data.node.data.name %>" data-rednose-id="<%= data.node.data.get(\'id\')%>">' +
                '<span class="<%= data.classNames.indicator %>"><s></s></span>' +
                '<span class="<%= data.treeview.icon(data.node) %>"></span>' +
                '<span id="<%= data.node.id %>-label" class="<%= data.classNames.label %>"><%= data.node.label %></span>' +
            '</div>' +
        '</li>'
    )
};


}, '1.1.0-DEV', {"requires": ["template-micro"]});
