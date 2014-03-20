YUI.add('rednose-formatter', function (Y, NAME) {

/**
Several formatter class methods to be used throughout the rednose-ui framework.

@module rednose-formatter
**/

/**
Several formatter class methods to be used throughout the rednose-ui framework.

@class Formatter
@namespace Rednose
@constructor
**/
function Formatter() {
    Formatter.superclass.constructor.apply(this);
}

// -- Static methods ------------------------------------------------------------

/**
Formats a size string from bytes.

@method size
@param {Mixed} size The size to format
@return {String} The formatted string
@static
**/
Formatter.size = function (size) {
    size = parseFloat(size);

    // Use 1000 instead of 1024 for calculating size.
    for (var i = 0; i < 4; i++) {
        if (size < 1000) {
            // Round up to 2 decimals.
            size = Math.round(size * 100) / 100;

            switch (i) {
                case 0:
                    size = size.toString() + ' bytes';
                    break;
                case 1:
                    size = size.toString() + ' KB';
                    break;
                case 2:
                    size = size.toString() + ' MB';
                    break;
                case 3:
                    size = size.toString() + ' GB';
                    break;
            }

            i = 4;
        } else {
            size = size / 1000;
        }
    }

    return size;
};

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').Formatter = Formatter;


}, '1.1.0-DEV');
