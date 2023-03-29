/**********************************************************************
** Copyright (C) 2005 - 2021 froglogic GmbH.
** Copyright (C) 2022 The Qt Company Ltd.
** All rights reserved.
**********************************************************************/

/* exported
__squish__gwc__ffb__clickItem
__squish__gwc__tbl__clickItem
*/
/* global
__squish__clean
__squish__click
__squish__getElementByClassName
__squish__listContains
__squish__nameOf
__squish__propsToNameStr
__squish__uniquifyName
Squish
*/

function __squish__gwc__nameOfFormFieldBox(o)
{
    var s = '{' + __squish__propsToNameStr(o, ["tagName", "id", "name"]);
    s += "className='gFormFieldBox'}";
    return s;
}

function __squish__gwc__nameOfComboItem(o)
{
    var t = o;
    while (t && (!t.className || !__squish__listContains(t.className, 'gFormFieldBox')))
	t = t.parentNode;
    var tid = '';
    if (t) tid = __squish__nameOf(t);

    return {"object": tid, "itemText": o.innerText};
}

function __squish__gwc__nameOfTable(o)
{
    var s = '{' + __squish__propsToNameStr(o, ["tagName", "id", "name"]);
    s += "className='gTable'}";
    return s;
}

function __squish__gwc__textOfTableItem(o)
{
    var inputs = o.getElementsByTagName('INPUT');
    var s = '';
    for (var i = 0; i < inputs.length; ++i) {
	if (!inputs[i].value)
	    continue;
	if (s.length > 0)
	    s += ',';
	s += __squish__clean(inputs[i].value);
    }
    return s;
}

function __squish__gwc__nameOfTableItem(o)
{
    var t = o;
    while (t && (!t.className || !__squish__listContains(t.className, 'gTable')))
	t = t.parentNode;
    var tid = '';
    if (t) tid = __squish__nameOf(t);

    return {"object": tid, "itemText": __squish__gwc__textOfTableItem(o)};
}

function __squish__gwc__ffb__clickItem(o, itm)
{
    var cb = __squish__getElementByClassName(o, 'comboboxButton', 'SPAN');
    __squish__click(cb);
    var l = o.getElementsByTagName('DIV');
    for (var i = 0; i < l.length; i++ ) {
	var c = l[i];
	if (__squish__clean(c.innerText) == itm) {
	    __squish__click(c);
	}
    }
}

function __squish__gwc__tbl__clickItem(o, itm)
{
    var l = o.getElementsByTagName('TR');
    for (var i = 0; i < l.length; ++i) {
	var c = l[i];
	if (__squish__gwc__textOfTableItem(c) == itm) {
	    __squish__click(c);
	}
    }
}

function __squish__gwc__nameOf(o/*, noUnify*/)
{
    if (o.tagName == 'SPAN' && o.className &&
	__squish__listContains(o.className, 'gFormFieldBox'))
	return __squish__uniquifyName(__squish__gwc__nameOfFormFieldBox(o), o);
    else if (o.tagName == 'DIV' && o.parentNode && o.parentNode.className &&
	     __squish__listContains(o.parentNode.className, 'comboboxList'))
    return escape(__squish__gwc__nameOfComboItem(o)["object"]);
    else if (o.tagName == 'TABLE' && o.className &&
	__squish__listContains(o.className, 'gTable'))
	return __squish__uniquifyName(__squish__gwc__nameOfTable(o), o);
    else if (o.tagName == 'TR' && o.parentNode && o.parentNode.parentNode &&
	o.parentNode.parentNode.className &&
	__squish__listContains(o.parentNode.parentNode.className, 'gTable'))
    return escape(__squish__gwc__nameOfTableItem(o)["object"]);
    return undefined;
}

function __squish__gwc__eventObject(o/*, noUnify*/)
{
    if (o && o.tagName == 'DIV' && o.parentNode && o.parentNode.className &&
	__squish__listContains(o.parentNode.className, 'comboboxList'))
	return o;
    else if (o && o.tagName == 'INPUT' && o.className &&
	     __squish__listContains(o.className, 'gEdit') &&
	     o.parentNode && o.parentNode.parentNode && o.parentNode.parentNode.parentNode &&
	     o.parentNode.parentNode.parentNode.parentNode &&
	     o.parentNode.parentNode.parentNode.parentNode.className &&
	     __squish__listContains(o.parentNode.parentNode.parentNode.parentNode.className, 'gTable'))
	return o.parentNode.parentNode;
    return undefined;
}

function __squish__gwc__typeOf(o)
{
    if (o.tagName == 'DIV' && o.parentNode && o.parentNode.className &&
	     __squish__listContains(o.parentNode.className, 'comboboxList'))
	return 'gwc_comboitem';
    else if (o.tagName == 'SPAN' && o.className &&
	     __squish__listContains(o.className, 'gFormFieldBox'))
	return 'gwc_formfieldbox';
    if (o.tagName == 'TR' && o.parentNode && o.parentNode.parentNode &&
	o.parentNode.parentNode.className &&
	__squish__listContains(o.parentNode.parentNode.className, 'gTable'))
	return 'gwc_tableitem';
    else if (o.tagName == 'TABLE' && o.className &&
	     __squish__listContains(o.className, 'gTable'))
	return 'gwc_table';
    return undefined;
}

function __squish__gwc__eventToStr(t, o, e)
{
    if (e.type == 'mousedown' ) {
	if ( t == 'gwc_formfieldbox' ||
             t == 'gwc_comboitem' ||
             t == 'gwc_tableitem' ) {
	    return '&clickHandler';
        }
    }
    return undefined;
}

function __squish__gwc__itemTextForEventObject( eventObject )
{
    if (eventObject.tagName == 'DIV' && eventObject.parentNode && eventObject.parentNode.className &&
         __squish__listContains(eventObject.parentNode.className, 'comboboxList'))
    return __squish__gwc__nameOfComboItem(eventObject)["itemText"];
    else if (eventObject.tagName == 'TR' && eventObject.parentNode && eventObject.parentNode.parentNode &&
             eventObject.parentNode.parentNode.className &&
            __squish__listContains(eventObject.parentNode.parentNode.className, 'gTable'))
    return __squish__gwc__nameOfTableItem(eventObject)["itemText"];
    return undefined;
}

if (Squish.toolkitExtensions["GWC"].enabled) {
    Squish.addNameOfHook(__squish__gwc__nameOf);
    Squish.addEventObjectHook(__squish__gwc__eventObject);
    Squish.addTypeOfHook(__squish__gwc__typeOf);
    Squish.addEventToStringHook(__squish__gwc__eventToStr);
    Squish.addItemTextForEventObjectHook(__squish__gwc__itemTextForEventObject);

    // Currently seems to be ok, can pick elements in a combobox
    // and seems to only go up for edit-fields in table cells but only to
    // the cell itself.
    Squish.addPickableObjectHook(__squish__gwc__eventObject);
}
