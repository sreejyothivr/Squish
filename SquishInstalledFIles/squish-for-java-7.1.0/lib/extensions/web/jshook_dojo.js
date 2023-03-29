/**********************************************************************
** Copyright (C) 2005 - 2021 froglogic GmbH.
** Copyright (C) 2022 The Qt Company Ltd.
** All rights reserved.
**********************************************************************/

/* exported
__squish__dojo__findSplitPaneItem
__squish__dojo__findTreeItem
*/
/* global
__squish__clean
__squish__getElementByClassName
__squish__listContains
__squish__nameOf
__squish__propsToNameStr
__squish__uniquifyName
dijit
Squish
*/

// Generic functions for Dojo Extension
var dojoExtension = new Object();

dojoExtension.isEnabled = function() {
    try {
        if( dijit ) {
            return true;
        }
    } catch (e) {
        // Ignore
    }
    return false;
}

// Support for button
var dojobuttonExtension = new Object();

// click
dojobuttonExtension.click = function( obj, ctrlKey, altKey, shiftKey, x, y, button ) {
    // click-handler is registered on the dijitButtonNode element, which is the first child
    Squish.mouseClick( obj.firstChild, ctrlKey, altKey, shiftKey, x, y, button );
}

// value
dojobuttonExtension.setValue = function( obj, val ) {
    if( obj.getAttribute("widgetid") ) {
        dijit.byId(obj.getAttribute("widgetid")).value = val;
    }
}
dojobuttonExtension.getValue = function( obj ) {
    if( obj.getAttribute("widgetid") ) {
        return dijit.byId(obj.getAttribute("widgetid")).value;
    }
    return undefined;
}

//tooltip (aka title)
dojobuttonExtension.setTooltip = function( obj, val ) {
    if( obj.getAttribute("widgetid") ) {
        dijit.byId(obj.getAttribute("widgetid")).title = val;
    }
}
dojobuttonExtension.getTooltip = function( obj ) {
    if( obj.getAttribute("widgetid") ) {
        return dijit.byId(obj.getAttribute("widgetid")).title;
    }
    return undefined;
}

// Show text? (aka label)
dojobuttonExtension.setTextShown = function( obj, val ) {
    if( obj.getAttribute("widgetid") ) {
        dijit.byId(obj.getAttribute("widgetid")).showLabel = val;
    }
}
dojobuttonExtension.isTextShown = function( obj ) {
    if( obj.getAttribute("widgetid") ) {
        return dijit.byId(obj.getAttribute("widgetid")).showLabel;
    }
    return undefined;
}

// text (aka label)
dojobuttonExtension.setText = function( obj, val ) {
    if( obj.getAttribute("widgetid") ) {
        dijit.byId(obj.getAttribute("widgetid")).label = val;
    }
}
dojobuttonExtension.getText = function( obj ) {
    if( obj.getAttribute("widgetid") ) {
        return dijit.byId(obj.getAttribute("widgetid")).label;
    }
    return undefined;
}

// Disabled
dojobuttonExtension.setDisabled = function( obj, val ) {
    if( obj.getAttribute("widgetid") ) {
        dijit.byId(obj.getAttribute("widgetid")).disabled = val;
    }
}
dojobuttonExtension.isDisabled = function( obj ) {
    if( obj.getAttribute("widgetid") ) {
        return dijit.byId(obj.getAttribute("widgetid")).disabled;
    }
    return undefined;
}

// Visible
dojobuttonExtension.isVisible = function( obj ) {
    return Squish.isElementVisible( obj );
}

function __squish__dojo__nameOfTreeNode(o)
{
    var t = o;
    var tree = undefined;
    while (t) {
	if (Squish.hasClassName(t, 'TreeContainer'))
	    tree = t;
	t = t.parentNode;
    }
    t = tree;
    var tid = '';
    if (t) tid = __squish__nameOf(t); 

    var oo = __squish__getElementByClassName(o, 'TreeLabel', 'SPAN');
    if (oo)
        o = oo;

    return {"object": tid, "itemText": o.innerText };
}

function __squish__dojo__nameOfTree(o)
{
    return '{' + __squish__propsToNameStr(o, ["tagName", "id"]) + 'className=\'TreeContainer\'}';
}

function __squish__dojo__nameOfSplitPaneItem(o)
{
    var t = o;
    while (t && (!t.className || !__squish__listContains(t.className, 'dojoSplitPane')))
	t = t.parentNode;
    var tid = '';
    if (t) tid = __squish__nameOf(t); 

    return {"object": tid, "itemText": o.innerText };
}

function __squish__dojo__nameOfSplitPane(o)
{
    return '{' + __squish__propsToNameStr(o, ["tagName", "id"]) + 'className=\'dojoSplitPane\'}';
}

function __squish__dojo__findTreeItem(tree, n)
{
    var node = tree.firstChild;
    
    while (node) {
	if (node.firstChild) {
	    var n2 = __squish__dojo__findTreeItem(node, n);
	    if (n2)
		return n2;
	}
	if (node.className && 
	    __squish__listContains(node.className, 'TreeLabel') &&
	    __squish__clean(node.innerText) == n)
	    return node;
	node = node.nextSibling;
    }

    return undefined;
}

function __squish__dojo__findSplitPaneItem(table, n)
{
    var nodes = table.getElementsByTagName('TR');

    var r = new RegExp( n );
    for (var i = 0; i < nodes.length; i++) {
	var node = nodes[i];
	if (r.test(__squish__clean(node.innerText)))
	    return node;
    }

    return undefined;
}

function __squish__dojo__isSplitPaneItem(o)
{
    return o.tagName == 'TR' && o.parentNode && o.parentNode.parentNode &&
	o.parentNode.parentNode.parentNode &&
	__squish__listContains(o.parentNode.parentNode.
			       parentNode.className, 'dojoSplitPane');
}

function __squish__dojo__nameOf(o/*, noUnify*/)
{
    if (o.className == 'TreeLabel')
    return escape(__squish__dojo__nameOfTreeNode(o.parentNode)["object"]);
    else if (o.tagName == 'DIV' && Squish.hasClassName(o, 'TreeExpand'))
    return escape(__squish__dojo__nameOfTreeNode(o.nextSibling)["object"]);
    else if (o.className && __squish__listContains(o.className, 'TreeContainer'))
	return __squish__uniquifyName(__squish__dojo__nameOfTree(o), o);
    else if (o.className && __squish__listContains(o.className, 'dojoSplitPane'))
	return __squish__uniquifyName(__squish__dojo__nameOfSplitPane(o), o);
    else if (__squish__dojo__isSplitPaneItem(o))
    return __squish__uniquifyName(__squish__dojo__nameOfSplitPaneItem(o)["object"], o);
    return undefined;
}

function __squish__dojo__typeOf(o/*, noUnify*/)
{
    if (o.className == 'TreeLabel')
	return 'dojo_treeNodeLabel';
    else if (o.tagName == 'DIV' && Squish.hasClassName(o, 'TreeExpand'))
	return 'dojo_treeNodeHandle';
    else if (o.className && __squish__listContains(o.className, 'TreeContainer'))
	return 'dojo_tree';
    else if (o.className && __squish__listContains(o.className, 'dojoSplitPane'))
	return 'dojo_splitpane';
    else if (__squish__dojo__isSplitPaneItem(o))
	return 'dojo_splitpaneItem';
    else if (Squish.hasClassName(o, "dijitButton") && dojoExtension.isEnabled() && !Squish.hasClassName(o, "dijitButtonNode") ) {
        return "custom_button_dojobutton";
    }
    return undefined;
}

function __squish__dojo__eventObject(o/*, noUnify*/)
{
    if (!o)
        return undefined;
    if (o.className && __squish__listContains(o.className, 'TreeLabel'))
        return o;
    else if (o.tagName == 'IMG' && 
            o.parentNode && o.parentNode.className && 
            __squish__listContains(o.parentNode.className, 'TreeLabel'))
        return o.parentNode;
    else if (o.tagName == 'DIV' &&  Squish.hasClassName('TreeExpand'))
        return o;
    else if( o.tagName == "SPAN" && ( Squish.hasClassName(o, "dijitButtonNode") || Squish.hasClassName(o, "dijitButtonText") || Squish.hasClassName(o, "dijitButtonContents") ) ) {
        var obj = o;
        while( obj && !Squish.hasClassName(obj, "dijitButton") ) {
            obj = obj.parentNode;
        }
        if( obj && Squish.hasClassName(obj, "dijitButton") ) {
            return obj;
        }
    }
    return undefined;
}

function __squish__dojo__itemTextForEventObject( eventObject )
{
    if (eventObject.className == 'TreeLabel')
    return __squish__dojo__nameOfTreeNode(eventObject.parentNode)["itemText"];
    else if (eventObject.tagName == 'DIV' && Squish.hasClassName(eventObject, 'TreeExpand'))
    return __squish__dojo__nameOfTreeNode(eventObject.nextSibling)["itemText"];
    else if (__squish__dojo__isSplitPaneItem(eventObject))
    return __squish__dojo__nameOfSplitPaneItem(eventObject)["itemText"]
    return undefined;
}

if (Squish.toolkitExtensions["Dojo"].enabled) {
    Squish.addNameOfHook(__squish__dojo__nameOf);
    Squish.addTypeOfHook(__squish__dojo__typeOf);
    Squish.addEventObjectHook(__squish__dojo__eventObject);
    Squish.addItemTextForEventObjectHook(__squish__dojo__itemTextForEventObject);

    Squish.registerWidget({Class: 'dojoButton', Event: 'mousedown'});
    Squish.registerWidget({Class: 'dojoButtonDepressed', Event: 'mousedown'});
    Squish.registerWidget({Class: 'dojoTab', Event: 'mousedown'});
    Squish.registerWidget({Class: 'dojoHtmlCheckbox', Event: 'mousedown'});

    //tradeking.com support for osd-keyboard
    Squish.registerWidget({Class: 'key', Event: 'click'});

    // At the moment its ok to use eventObject logic here
    // but need to keep an eye on additions to avoid making it
    // impossible to pick table cells or so
    Squish.addPickableObjectHook(__squish__dojo__eventObject);
}
