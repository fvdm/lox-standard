/**
Notfier class, wraps around Pines Notify

@module rednose-notifier
**/

/**
Notifier class, wraps around Pines Notify

@class Notifier
@namespace Rednose
@static
**/
var N = Y.namespace('Rednose').Notifier || (Y.namespace('Rednose').Notifier = {});

$.pnotify.defaults.history = false;
$.pnotify.defaults.styling = 'bootstrap';

// -- Public Methods -----------------------------------------------------------

/**
Triggers a notification.

@method notify
@param {Object} notification Notify notification object.
@static
@public
**/
N.notify = function (notification) {
    $.pnotify(notification);
};
