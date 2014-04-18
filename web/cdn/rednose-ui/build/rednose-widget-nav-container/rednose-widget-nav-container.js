YUI.add('rednose-widget-nav-container', function (Y, NAME) {

/**
Basic navigation container, provides a widget with a body, header and a footer of
buttons.

@module rednose-widget-nav-container
**/
var NavContainer;

/**
Basic navigation container, provides a widget with a body, header and a footer of
buttons.

@class NavContainer
@namespace Rednose
@constructor
@extensionfor Widget
**/
NavContainer = Y.Base.create('nav', Y.Widget, [Y.WidgetStdMod, Y.WidgetButtons]);

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').NavContainer = NavContainer;


}, '1.4.0', {"requires": ["widget", "widget-buttons", "widget-stdmod"]});
