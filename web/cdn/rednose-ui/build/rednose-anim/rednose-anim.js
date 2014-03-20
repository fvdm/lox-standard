YUI.add('rednose-anim', function (Y, NAME) {

/**
Several animation class methods to be used throughout the rednose-ui framework.

@module rednose-anim
**/
var DURATION = 0.25;

/**
Several animation class methods to be used throughout the rednose-ui framework.

@class Anim
@namespace Rednose
@constructor
**/
function Anim() {
    Anim.superclass.constructor.apply(this);
}

// -- Static methods ------------------------------------------------------------

/**
Animates a slide-in of an collapsed element as a post process.

@method slideInY
@param {Node} node A node
@static
**/
Anim.slideInY = function (node) {
    // Animate the object to a height of 0.
    node.transition({
        duration: DURATION,
        easing: 'ease-in',
        height: '0px'
    }, function() {
        // Restore the 'display' style attribute and reset the height to 100%.
        node.setStyle('display', 'none');
        node.setStyle('height', '100%');
    });
};

/**
Animates a slide-out of an expanded element as a post process.

@method slideOutY
@param {Node} node A node
@static
**/
Anim.slideOutY = function (node) {
    // Make sure the chileElement is not hidden, otherwise height cannot be
    // calculated.
    node.setStyle('display', 'block');

    var height = node.getComputedStyle('height');

    node.setStyle('height', 0);

    node.transition({
        duration: DURATION,
        easing: 'ease-out',
        height: height
    }, function() {
        node.setStyle('height', null);
    });
};

/**
Clone the node, position it on top of the original for secondary animation.

@method fadeOut
@param {Node} node A node
@static
**/
Anim.fadeOut = function (node) {
    var n = node.cloneNode(true).set('id', null).setStyle('position', 'absolute'),
        anim;

    Y.one('body').appendChild(n);
    n.setXY(node.getXY());

    anim = new Y.Anim({
        node    : n,
        to      : { opacity: 0 },
        duration: DURATION,
        easing  : Y.Easing.easeOut
    });

    anim.on('end', function () {
        n.remove();
    });

    anim.run();
};

/**
Animate a slide in of a node.

@method slideIn
@param {Node} node A node
@static
**/
Anim.slideIn = function (node) {
    var width  = node.get('offsetWidth'),
        height = node.get('offsetHeight'),
        anim;

    node.setStyle('width', '0');
    node.setStyle('height', '0');

    anim = new Y.Anim({
        node    : node,
        duration: DURATION,
        easing  : Y.Easing.easeOut,
        to      : {
            width: width,
            height: height
        }
    });

    anim.run();
};

/**
Animate a node to a given width.

@method width
@param {Node} node A node
@param {Integer} width The target width
@static
**/
Anim.width = function (node, width) {
    var anim = new Y.Anim({
        node    : node,
        to      : { width: width },
        duration: DURATION,
        easing  : Y.Easing.easeOut
    });

    anim.run();
};

/**
Vortext effect, animate to a given location while reducing dimensions and opacity.

@method vortex
@param {Node} node A node
@param {Integer} x The target x coordinate
@param {Integer} y The target y coordinate
@static
**/
Anim.vortex = function (node, x, y) {
    var anim;

    anim = new Y.Anim({
        node: node,
        to: {
            height : 20,
            width  : 20,
            opacity: 0,
            top    : x,
            left   : y
        }, from: {
            width : node.get('offsetWidth'),
            height: node.get('offsetHeight')
        },
        duration: DURATION
    });

    anim.on('end', function () {
        node.remove();
    });

    anim.run();
};

/**
Squeeze the node and remove it.

@method squeeze
@param {Node} node A node
@static
**/
Anim.squeeze = function (node) {
    var anim;

    node.setStyle('opacity', 0);

    anim = new Y.Anim({
        node: node,
        to: {
            width: 0
        },
        duration: DURATION,
        easing: Y.Easing.easeOut
    });

    anim.on('end', function () {
        node.remove();
    });

    anim.run();
};

/**
Morphs between two nodes.

@method morph
@param {Node} node The old node
@param {Node} node The new node
@param {Function} animOut Animation to remove the old node
@param {Function} animIn Animation to reveal the new node
@static
**/
Anim.morph = function (oldNode, newNode, animOut, animIn) {
    animOut(oldNode);
    oldNode.set('innerHTML', newNode.get('outerHTML'));
    animIn(oldNode);
};

// -- Namespace ----------------------------------------------------------------
Y.namespace('Rednose').Anim = Anim;


}, '1.1.0-DEV', {"requires": ["anim"]});
