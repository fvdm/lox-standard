/*jshint boss:true, expr:true, onevar:false */

var XmlSource = Y.Rednose.DataSource.XmlSource;

var XMLPageView = Y.Base.create('xmlPageView', Y.View, [], {
    UPLOADER_TEMPLATE: '<button class="btn" type="button" title="Upload"><i class="icon-upload"></i></button>',

    UPLOADER_CONFIG: {
        width           : 40,
        height          : 30,
        uploadURL       : Routing.generate('rednose_framework_files_upload'),
        buttonClassNames: { disabled: 'disabled' }
    },

    template:
        '<form class="form-horizontal">'+
            '<fieldset>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="xsd">XML Schema</label>' +
                    '<div class="controls">' +
                        '<div class="input-append input-block-level">' +
                            '<input type="text" id="xsd" readonly>' +
                            '<div id="xsd-uploader" class="uploader-container"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="xslt">XSLT File</label>' +
                    '<div class="controls">' +
                        '<div class="input-append input-block-level">' +
                            '<input type="text" id="xslt" readonly>' +
                            '<div id="xsl-uploader" class="uploader-container"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="xml">XML Data</label>' +
                    '<div class="controls">' +
                        '<div class="input-append input-block-level">' +
                            '<input type="text" id="xml" readonly>' +
                            '<div id="xml-uploader" class="uploader-container"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                '<label class="control-label" for="root">Root Element</label>' +
                    '<div class="controls">' +
                        '<input class="input-block-level" id="root" type="text"/>' +
                    '</div>' +
                '</div>' +
            '</fieldset>' +
        '</form>',

    initializer: function () {
        Y.Uploader.SELECT_FILES_BUTTON = this.UPLOADER_TEMPLATE;
    },

    render: function () {
        var container = this.get('container'),
            template  = this.template;

        container.setHTML(template);

        this._bindUploader(new Y.Uploader(this.UPLOADER_CONFIG).render(container.one('#xsd-uploader')));
        this._bindUploader(new Y.Uploader(this.UPLOADER_CONFIG).render(container.one('#xsl-uploader')));
        this._bindUploader(new Y.Uploader(this.UPLOADER_CONFIG).render(container.one('#xml-uploader')));

        return this;
    },

    _bindUploader: function (uploader) {
        uploader.after('fileselect', this._afterFileSelect, this);
        uploader.on('uploadstart', this._onUploadStart, this);
        uploader.on('uploadcomplete', this._onUploadComplete, this);
        uploader.on('uploaderror', this._onUploadError, this);
        uploader.on('alluploadscomplete', this._onAllUploadsComplete, this);
    },

    _updateInputForUploader: function (uploader, name, uploadId) {
        var input = uploader.get('srcNode').ancestor('.controls').one('input');

        input.set('value', name);
        input.setAttribute('data-upload-id', uploadId);
    },

    _afterFileSelect: function (e) {
        var uploader = e.target,
            fileList = uploader.get('fileList');

        if (fileList.length > 0) {
            uploader.uploadAll();
        }
    },

    _onUploadStart: function (e) {
        var uploader = e.target;

        uploader.set('enabled', false);
    },

    _onUploadComplete: function (e) {
        var uploader = e.target,
            file     = e.file,
            uploadId = e.data;

        uploader.set('enabled', true);

        this._updateInputForUploader(uploader, file.get('name'), uploadId);
    },

    _onUploadError: function (e) {
        var uploader = e.target,
            code     = e.statusCode;
            text     = e.statusText;

        uploader.set('enabled', true);

        console.log(code);
        console.log(text);
    },

    _onAllUploadsComplete: function (e) {
        var uploader = e.target;

        uploader.set('enabled', true);
        uploader.set('fileList', []);
    }
}, {
    ATTRS: {
        model: { value: new XmlSource() }
    }
});
