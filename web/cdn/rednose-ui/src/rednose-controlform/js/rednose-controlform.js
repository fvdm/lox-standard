/*jshint boss:true, expr:true, onevar:false */

var ControlForm;

ControlForm = Y.Base.create('controlForm', Y.Base, [ Y.Rednose.WidgetFactory ], {

    viewTemplate:
        '<div class="formContainer">' +
        '   <div class="formContainer_left">&nbsp;</div>' +
        '   <div class="formContainer_right">&nbsp;</div>' +
        '   <div class="formContainer_proxy">' +
        '   </div>' +
        '</div>',


    initializer: function() {
        this.on('contextMenu:editLabel', this._editLabel);
        this.on('contextMenu:deleteForm', this.deleteForm);
        this.on('contextMenu:deleteFieldGroup', this._deleteFieldGroup);
        this.on('contextMenu:editFieldGroup', this._editFieldGroup);

        // Wizard step change triggered, show and hide the proper forms
        this.after('stepChange', this._stepChange);
    },

    render: function() {
        var container  = this.get('srcNode'),
            formsModel = this.get('formsModel'),
            self       = this;

        container.setHTML(this.viewTemplate);
        container.one('.formContainer').removeClass('formContainer').addClass(this.get('className'));
        container.one('.formContainer_left').removeClass('formContainer_left').addClass(this.get('className') + '_left');
        container.one('.formContainer_right').removeClass('formContainer_right').addClass(this.get('className') + '_right');

        formsModel.sort();
        formsModel.each(function(formItem) {
            self._renderForm(formItem);
        });

        this.set('step', 0);
        this.fire('rendered');
    },

    _renderForm: function(formItem) {
        var self = this;
        var container = this.get('srcNode').one('div');
        var fieldGroupOrder = formItem.get('fieldGroupOrder');
        var form = formItem.get('controlForm');
        var fieldGroups = form.get('fieldGroups');

        var formElement = Y.Node.create('<fieldset>');
        var legend = Y.Node.create('<legend>');

        legend.set('innerHTML', form.get('caption'));

        if (this.get('editMode')) {
            formElement.addClass('editMode');

            legend.plug(Y.Rednose.ContextMenu, {
                content: [
                    { title: 'Rename', id: 'editLabel' },
                    { title: '-' },
                    { title: 'Remove', id: 'deleteForm' }
                ],
                bubbleTarget: self
            });
        }

        formElement.append(legend);
        formElement.set('name', formItem.get('id'));
        formElement.setAttribute('data-step', formItem.get('step'));

        Y.Array.each(fieldGroupOrder, function(groupId) {
            Y.Array.each(fieldGroups, function(group) {
                if (groupId === group.get('id')) {
                    self._addFieldGroup(formElement, group);
                }
            });
        });

        var directionClassName = this.get('className') + '_' + formItem.get('direction');

        container.one('.' + directionClassName).append(formElement);
    },

    _addFieldGroup: function(formElement, fieldGroup) {
        var self = this;
        var list = Y.Node.create('<ul />');
        var fieldGroupItems;

        fieldGroupItems = fieldGroup.get('fieldGroupItems');

        if (this.get('editMode')) {
            var fieldGroupDD = new Y.DD.Drag({
                node: list,
                group: ['fieldGroup']
            }).plug(Y.Plugin.DDConstrained, {
                constrain2node: formElement
            }).plug(Y.Plugin.DDProxy, {
                moveOnEnd: false
            });

            fieldGroupDD.on('drag:start', function(e) {
                e.target.get('dragNode').setHTML('');
            });
            fieldGroupDD.on('drag:drag', function(e) {
                self._reOrderFieldGroupDD(e, formElement, list);
            });
            fieldGroupDD.on('drag:end', function() {
                self._reOrderFieldGroup(formElement);
            });
        }

        list.set('id', fieldGroup.get('id'));
        list.setAttribute('name', fieldGroup.name);
        list.on(['mouseover', 'mouseout'], function() {
            list.toggleClass('fieldGroupHighlight');
        });

        Y.Array.each(fieldGroupItems, function(control) {
            var label = Y.Node.create('<label>');
            var controlContainer = Y.Node.create('<li>');
            var draft = self.get('draft');

            // Filter out fields that have a 'is_text_value' and 'is_header' property.
            if ((!control.get('rules').is_text_value) && (!control.get('rules').is_header)) {
                controlElement = self._createWidget(control.get('rules'));
                controlElement.data = control;

                label.set('innerHTML', control.get('field').name);

                if (draft !== null) {
                    var content = draft.getValue(control.get('field').id);

                    controlElement.set('value', content);
                }

                controlContainer.append(label);
                controlContainer.append(controlElement);
                controlContainer.setData('model', control);
                controlContainer.on('click', function() {
                    self.fire('controlSelected', { 'controlContainer': controlContainer });
                });

                list.append(controlContainer);
            }
        });

        if (this.get('editMode')) {
            list.plug(Y.Rednose.ContextMenu, {
                content: [
                    { title: 'Edit', id: 'editFieldGroup' },
                    { title: '-' },
                    { title: 'Remove', id: 'deleteFieldGroup' }
                ],
                bubbleTarget: self
            });
        }

        formElement.append(list);
    },

    _reOrderFieldGroupDD: function(e, formElement, sender) {
        var y = e.currentTarget.mouseXY[1];
        var hit = false;

        // If your mousecursor hovers over a fieldGroup (ol element) while dragging, prepend
        // the dragNode before that element.
        formElement.all('ul').each(function(group) {
            if (sender.get('id') !== group.get('id')) { // Is this myself?
                var groupTop = group.getY();
                var groupBottom = (groupTop + parseInt(group.getComputedStyle('height'), 10));

                if (y > groupTop && y < groupBottom) {
                    sender.insertBefore(sender, group);

                    hit = true;
                }
            }
        });

        // If you are dragging at the bottom of the form, append the dragNode to the bottom.
        if (hit === false && y > (formElement.getY() + parseInt(formElement.getComputedStyle('height'), 10))) {
            formElement.append(sender);
        }
    },

    _reOrderFieldGroup: function(formElement) {
        var formsModel = this.get('formsModel');
        var formId = formElement.get('name');
        var fieldGroupOrder = [];

        formElement.all('ul').each(function() {
            fieldGroupOrder.push(this.get('id'));
        });

        formsModel.updateProperty(formId, 'fieldGroupOrder', fieldGroupOrder);
    },

    updateControl: function(control) {
        var formsModel = this.get('formsModel'),
            fieldGroup = formsModel.getFieldGroup(control.get('fieldGroup'));

        if (fieldGroup.fieldGroupItems) {
            for (var item in fieldGroup.fieldGroupItems) {
                if (fieldGroup.fieldGroupItems[item].id === control.id) {
                    fieldGroup.fieldGroupItems[item].set('rules', control.rules);
                }
            }
        }
    },

    _addFieldGroupToModel: function(formId, fieldGroup) {
        var formsModel = this.get('formsModel');

        formsModel.each(function(formItem) {
            if (formItem.get('id') === formId) {
                var fieldGroups = formItem.get('controlForm').get('fieldGroups');

                fieldGroups.push(fieldGroup);
            }
        });
    },

    _stepChange: function() {
        var self = this;
        var container = this.get('srcNode');

        container.all('*[data-step]').each(function(formElement) {
            var formStep = formElement.getAttribute('data-step');

            if (parseInt(formStep, 10) !== parseInt(self.get('step'), 10)) {
                formElement.hide();
            } else {
                formElement.show();
            }
        });
    },

    ddOver: function(e, referenceForm) {
        var formNode = Y.one('#' + referenceForm.get('id'));

        if (e.type === 'drop:over') {
            if (formNode.hasClass('ddOver') === false) {
                formNode.addClass('ddOver');
            }
        } else {
            formNode.removeClass('ddOver');
        }
    },

    ddDrop: function(e, referenceForm) {
        var self = this;
        var drag = Y.DD.DDM.activeDrag;
        var formNode = Y.one('#' + referenceForm.get('id'));

        if (!Y.TB.FieldGroup) {
            if (console.exception) {
                console.exception('Dependancy error Y.TB.Field not found');
            }
        }

        if (Y.instanceOf(drag.get('data'), Y.TB.FieldGroup)) {
            fieldGroup = drag.get('data');

            self._addFieldGroup(formNode, fieldGroup.getAttrs(), true);
            self._addFieldGroupToModel(formNode.get('name'), fieldGroup);
            self._reOrderFieldGroup(formNode);
        } else {
            if (console.exception) {
                console.exception('DD Error: Expected a Y.TB.FieldGroup');
            }
        }

        formNode.removeClass('ddOver');
    },

    toJSON: function() {
        var formsModel = this.get('formsModel');

        return Y.JSON.stringify(formsModel);
    },

    addForm: function(title) {
        var formsModel = this.get('formsModel');

        formsModel.addForm(title);

        this.render();
    },

    deleteForm: function(e) {
        var self = this;
        var formsModel = this.get('formsModel');
        var formId = e.node.get('parentNode').get('name');

        Y.Rednose.Dialog.confirm(
            'Delete', 'Delete the form "' + e.node.get('innerHTML') + '" and all its fieldgroups?',
            function() {
                formsModel.deleteForm(formId);
                self.render();
            }
        );
    },

    _editFieldGroup: function(e) {
        var fg = this.get('formsModel').getFieldGroup(e.node.get('id'));

        this.fire('editFieldGroup', { 'fieldGroup': fg });
    },

    _deleteFieldGroup: function(e) {
        var self = this;
        var formsModel = this.get('formsModel');
        var formElement = e.node.get('parentNode');
        var formId = formElement.get('name');

        Y.Rednose.Dialog.confirm(
            'Delete', 'Delete the fieldgroup "' + e.node.getAttribute('name') + '"',
            function() {
                formsModel.deleteFieldGroup(formId, e.node.get('id'));

                e.node.remove();
                self._reOrderFieldGroup(formElement);
            }
        );
    },

    _editLabel: function(e) {
        var self = this;
        var dialog = new Y.Rednose.Dialog();
        var legend = e.node;
        var formId = legend.get('parentNode').get('name');

        dialog.prompt(
            'Form title',
            'Value',
            legend.get('text'),
            function(node) {
                var value = '';

                self.get('formsModel').each(function(formItem) {
                    if (formItem.get('id') === formId) {
                        var form = formItem.get('controlForm');

                        value = node.one('input').get('value');

                        if (value !== '') {
                            form.set('caption', value);
                            legend.set('text', form.get('caption'));
                        }
                    }
                });

                if (value !== '') {
                    return true;
                } else {
                    dialog.set('error', { path: 'input', message: ''});
                }
            }
        );
    },


    // TODO: Implement setter for control elements instead of using a node selector ;P
    getFieldContent: function() {
        var buffer = [];
        var listCollection = this.get('srcNode').all('ul');

        listCollection.each(function(list) {
            list.all('li').each(function(control) {
                var fieldContent = new Y.ControlForm.FieldContent({
                    field: control.getData().field,
                    content: control.one('input, textarea, select').get('value')
                });

                buffer.push(fieldContent);
            });
        });

        return buffer;
    },

    setFieldContent: function(fieldContents) {
        var liCollection = this.get('srcNode').all('li');

        for (var i in fieldContents) {
            liCollection.each(function(li) {
                if (li.getData().field.id === fieldContents[i].get('field').id) {
                    li.one('input, textarea, select').set(
                        'value',
                        fieldContents[i].get('content')
                    );
                }
            });
        }
    }

}, {
    ATTRS: {
        srcNode: { value: null },
        step: { value: -1 },
        formsModel: { value: null },
        className: { value: 'formContainer' },
        editMode: { value: false },
        draft: { value: null }
    }
});

Y.namespace('Rednose').ControlForm = ControlForm;
