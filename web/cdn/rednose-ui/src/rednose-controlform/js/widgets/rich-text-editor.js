/*jshint boss:true, expr:true, onevar:false */

var RichTextEditor;

RichTextEditor = Y.Base.create('richTextEditor', Y.Widget, [], {

    render: function() {
        var inputProperties = this.get('properties').input_properties,
            lang            = 'en_US',
            toolbar         = [];

        if (inputProperties) {
            if (inputProperties.styles === 'true') {
                toolbar.push({
                    "name": "styles",
                    "items": ["Font","FontSize"]
                });
            }

            if (inputProperties.editing === 'true') {
                toolbar.push({
                    "name": "editing",                    "items": ["Find", "Replace", "-", "SelectAll"]
                });
            }

            if (inputProperties.clipboard === 'true') {
                toolbar.push({
                    "name": "clipboard",
                    "items": ["Cut", "Copy", "Paste", "PasteText"
                    ]
                });
            }

            if (inputProperties.undoredo === 'true') {
                // Note: The key `clipboard` is used twice, to divide them into separate blocks.
                toolbar.push({
                    "name": "clipboard",
                    "items": ["Undo", "Redo"]
                });
            }

            if (inputProperties.basicstyles === 'true') {
                toolbar.push({
                    "name": "basicstyles",
                    "items": ["Bold", "Italic", "Underline", "-", "RemoveFormat"]
                });
            }

            if (inputProperties.paragraph === 'true') {
                toolbar.push({
                    "name": "paragraph",
                    "items": ["NumberedList", "BulletedList", "-", "Outdent", "Indent"]
                });
            }

            if (inputProperties.insert === 'true') {
                toolbar.push({
                    "name": "links",
                    "items": ["Link", "Unlink"]
                });
            }

            if (inputProperties.tools === 'true') {
                toolbar.push({
                    "name": "tools",
                    "items": ["Maximize"]
                });
            }
        }

        var config = {
            toolbar                  : toolbar,
            removePlugins            : 'elementspath',
            resize_enabled           : false,
            disableNativeSpellChecker: false,
            scayt_sLang              : lang,
            language                 : lang,
            height                   : '100'
        };

        if (this.get('replace')) {
            CKEDITOR.replace(this.get('srcNode').getDOMNode(), config);
        } else {
            CKEDITOR.appendTo(this.get('srcNode').getDOMNode(), config);
        }

        return this;
    },

    destructor: function() {
        CKEDITOR.instances[this.get('srcNode').get('id')].destroy();
    }
}, {
    ATTRS: {
        properties: { value: {} },
        replace:    { value: false }
    }
});

Y.namespace('Rednose').ControlFormRichTextEditor = RichTextEditor;
