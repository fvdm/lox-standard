YUI.add('rednose-datatable', function (Y, NAME) {

/*jshint boss:true, expr:true, onevar:false */

var DataTable,

	CSS_PREFIX_MODULE = 'rednose-datatable',

	CSS_BOOTSTRAP_TABLE           = 'table',
    CSS_BOOTSTRAP_TABLE_CONDENSED = 'table-condensed';

DataTable = Y.Base.create('dataTable', Y.DataTable.Base, [ Y.DataTable.Scrollable, Y.DataTable.Sortable, Y.DataTable.ColumnWidths ], {
	initializer: function () {
        var boundingBox = this.get('boundingBox'),
            condensed   = this.get('condensed');

        this.after('render', function() {
			boundingBox.one('table').addClass(CSS_BOOTSTRAP_TABLE);

            if (condensed === true) {
                boundingBox.one('table').addClass(CSS_BOOTSTRAP_TABLE_CONDENSED);
            }
        });
	}
}, {
    ATTRS: {
        condensed: {
            value: false
        }
    }
});

DataTable.CSS_PREFIX = CSS_PREFIX_MODULE;

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').DataTable = DataTable;


}, '1.4.0', {
    "requires": [
        "datatable-base",
        "datatable-scroll",
        "datatable-sort",
        "rednose-util"
    ],
    "supersedes": [
        "skin-sam-datatable-base"
    ],
    "skinnable": true
});
