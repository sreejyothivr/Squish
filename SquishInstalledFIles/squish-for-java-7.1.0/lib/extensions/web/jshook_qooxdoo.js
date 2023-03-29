/**********************************************************************
** Copyright (C) 2005 - 2021 froglogic GmbH.
** Copyright (C) 2022 The Qt Company Ltd.
** All rights reserved.
**********************************************************************/

/* global
__squish__fixName
__squish__propsToNameStr
__squish__qualifiedName
__squish__uniquifyName
Squish
*/

function __squish__qooxdoo__nameOf(o, noUnify)
{
    if (o.qx_Widget)
	return escape(__squish__uniquifyName(__squish__nameOfQooXDoo(o), o, noUnify));
    return undefined;
}

function __squish__qooxdoo__eventObject(o/*, noUnify*/)
{
    while (o) {
	if (o.qx_Widget &&
	    o.qx_Widget.classname != 'qx.ui.basic.Image' &&
	    o.qx_Widget.classname != 'qx.ui.basic.Label' ) {
	    return o;
	}
	o = o.parentNode;
    }
    return undefined;
}


function __squish__nameOfQooXDoo(o)
{
    var n = "{tagName='" + o.tagName + "' ";
    var gotname = false;
    var gotgoodname = false;
    if (o.name || o.id || o.title) {
	gotname = true;
	gotgoodname = true;
	n += __squish__propsToNameStr(o, ["id", "name", "title"]);
    }
    var qx = o.qx_Widget;
    if (qx.classname) {
	gotname = true;
	n += __squish__propsToNameStr(qx, ["classname"]);
    }
    if (qx.getLabel && qx.getLabel()) {
	gotname = true;
	gotgoodname = true;
	n += "label='" + qx.getLabel() + "' ";
    }
    if (qx.getCaption && qx.getCaption()) {
	gotname = true;
	gotgoodname = true;
	n += "caption='" + qx.getCaption() + "' ";
    }
    if (!gotgoodname && o.innerText) {
	gotname = true;
    n += __squish__propsToNameStr(o, ["simplifiedInnerText"]);
    }
    if (!gotname) {
	return __squish__qualifiedName(o);
    }
    
    return __squish__fixName(n) + '}';
}

function __squish__qooxdoo__typeOf(o/*, noUnify*/)
{
    if (o.qx_Widget)
	return "qx_widget_container";
    if (o.classname && o.classname.indexOf('qx') != -1)
	return "qx_widget";
    return undefined;
}

function __squish__qooxdoo__matchObject(o, prop, value/*, name*/)
{
    if (prop == "label" && o.qx_Widget)
	return Squish.matchProperty(value, Squish.cleanString(o.qx_Widget.getLabel()));
    else if (prop == "caption" && o.qx_Widget)
	return Squish.matchProperty(value, Squish.cleanString(o.qx_Widget.getCaption()));
    else if (prop == "classname" && o.qx_Widget)
	return Squish.matchProperty(value, Squish.cleanString(o.qx_Widget.classname));

    return undefined;
}

if (Squish.toolkitExtensions["qooxdoo"].enabled) {
    Squish.addNameOfHook(__squish__qooxdoo__nameOf);
    Squish.addEventObjectHook(__squish__qooxdoo__eventObject);
    Squish.addTypeOfHook(__squish__qooxdoo__typeOf);
    Squish.addMatchObjectHook(__squish__qooxdoo__matchObject);

    // Somewhat questionable, searches for the first qxWidget above the element in the
    // hierarchy that is not an image or label
    // But without an actual example its hard to decide whether this is ok or not.
    Squish.addPickableObjectHook(__squish__qooxdoo__eventObject);
}
