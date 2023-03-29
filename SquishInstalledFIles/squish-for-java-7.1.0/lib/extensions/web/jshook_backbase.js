/**********************************************************************
** Copyright (C) 2005 - 2021 froglogic GmbH.
** Copyright (C) 2022 The Qt Company Ltd.
** All rights reserved.
**********************************************************************/

/* exported
__squish__backbase__getSelectedComboBoxIndex
__squish__backbase__getSpinnerValue
__squish__backbase__lv__caption
__squish__backbase__lv__clickItem
__squish__backbase__lv__isSelected
__squish__backbase__lv__itemText
__squish__backbase__lv__numRows
__squish__backbase__selectComboBoxValue
__squish__backbase__setSpinnerValue
*/
/* global
Squish
__squish__listContains
__squish__getElementByClassName
__squish__uniquifyName
__squish__nameHelper
__squish__getElementsByClassName
__squish__propsToNameStr
__squish__clean
__squish__nameOf
__squish__click
*/

var __squish__backbase__className = 0;
var __squish__backbase__nameOfFn = 1;
var __squish__backbase__internalName = 2;
var __squish__backbase__descriptors = [];

function __squish__backbase__selectSelectBoxValue(b, v)
{
    if (!b || !b.oPulldown)
	return;
    __squish__click(b);
    var options = __squish__getElementsByClassName( b.oPulldown, 'b-option', 'DIV' );
    if (options.length == 0)
	options = __squish__getElementsByClassName( b.oPulldown, 'b-option', 'TR' );
    if (options.length == 0)
	options = __squish__getElementsByClassName( b.oPulldown, 'b-option', 'TD' );
    for ( var idx = 0; idx < options.length; idx++ ) {
        var opt = options[idx];
        if ( opt.innerText == v ) {
	    setTimeout(function(){
		__squish__click(opt);
	    }, 100);
	    break;
        }
    }
}

function __squish__backbase__selectSelectBoxIndex(b, v)
{
    if (!b || !b.oPulldown)
	return;
    __squish__click(b);
    var options = __squish__getElementsByClassName( b.oPulldown, 'b-option', 'DIV' );
    if (options.length == 0)
	options = __squish__getElementsByClassName( b.oPulldown, 'b-option', 'TR' );
    if (options.length == 0)
	options = __squish__getElementsByClassName( b.oPulldown, 'b-option', 'TD' );
    var i = 0;
    for ( var idx = 0; idx < options.length; idx++ ) {
        var opt = options[idx];
        if ( i == v ) {
	    setTimeout(function(){
		__squish__click(opt);
	    }, 100);
	    break;
        }
	++i;
    }
}

function __squish__backbase__selectComboBoxValue(b, v)
{
    if ( !b || !b.aIndexElms ) {
	__squish__backbase__selectSelectBoxValue(b, v);
        return;
    }

    for ( var idx = 0; idx < b.aIndexElms.length; idx++ ) {
        if ( b.aIndexElms[idx].innerText == v ) {
            __squish__backbase__selectComboBoxIndex( b, idx );
            break;
        }
    }
}

function __squish__backbase__selectComboBoxIndex(b, i)
{
    if ( !b || !b.aIndexElms || !b.aIndexElms.length ||
         i < 0 || i >= b.aIndexElms.length ) {
	__squish__backbase__selectSelectBoxIndex(b, i);
        return;
    }


    var comboButton = __squish__getElementByClassName( b,
                                                       'b-combobox-button',
                                                       'DIV' );
    if (!comboButton)
        return;
    comboButton.onclick();

    var comboOptions = __squish__getElementsByClassName( window.__squish__ctxwin.document,
                                                         'b-combo-option',
                                                         'TR' );
    if (!comboOptions || comboOptions.lenght == 0)
	comboOptions = __squish__getElementsByClassName( window.__squish__ctxwin.document,
                                                         'b-option', 'DIV' );
    var v = b.aIndexElms[i].innerText;
    for ( var idx = 0; idx < comboOptions.length; idx++ ) {
        var opt = comboOptions[idx];
        if ( opt.innerText == v ) {
	    setTimeout(function(){
		__squish__click(opt);
	    }, 100);
            break;
        }
    }
    comboButton.onclick();
}

function __squish__backbase__getSelectedComboBoxIndex(b)
{
    var v = __squish__backbase__getSelectedComboBoxValue(b);
    for ( var idx = 0; idx < b.aIndexElms.length; idx++ ) {
        if ( b.aIndexElms[idx].innerText == v )
            return idx;
    }
    return undefined;
}

function __squish__backbase__getSelectedComboBoxValue(b)
{
    var inputElem = __squish__getElementByClassName( b,
                                                     'b-combobox-input',
                                                     'INPUT' );
    if ( !inputElem )
	inputElem = __squish__getElementByClassName( b,
                                                     'b-select-text',
                                                     'TD' );
    if ( !inputElem )
        return undefined;
    return inputElem.value;
}

function __squish__backbase__inputElementOfSpinner(o)
{
    var c = o.firstChild;
    while ( c && c.tagName && c.tagName != 'INPUT' )
        c = c.nextSibling;
    return c;
}

function __squish__backbase__setSpinnerValue(o, v)
{
    var inputElem = __squish__backbase__inputElementOfSpinner(o);
    if ( inputElem ) {
        inputElem.value = v;
        inputElem.onchange();
    }
}

function __squish__backbase__getSpinnerValue(o)
{
    var inputElem = __squish__backbase__inputElementOfSpinner(o);
    if ( inputElem )
        return inputElem.value;
    return undefined;
}

function __squish__backbase__nameOfButton(o, cn)
{
    var n = '{' + __squish__propsToNameStr(o, ["tagName", "id", "name", "b:tooltiptext", "simplifiedInnerText"]);
    return n + ' className=\'' + cn + '\'}';
}

function __squish__backbase__nameOfComboBox(o/*, cn*/)
{
    var n = '{' + __squish__propsToNameStr(o, ["tagName", "id", "name"]);
    var bName = o.getAttribute("b:name");
    if (!bName)
	bName = o["b:name"];
    if (bName && bName != '') n += __squish__nameHelper(o, "b:name");
    if (__squish__listContains(o.className, 'b-select'))
	return n + " className='b-select'}";
    return n + " className='b-combobox'}";
}

function __squish__backbase__nameOfSpinnerButton(o, cn)
{
    var n = '{' + __squish__propsToNameStr(o, ["tagName", "id", "name"]);
    while (o &&
           o.className && !__squish__listContains(o.className, 'b-spinner'))
        o = o.parentNode;

    if (o) {
        var spinnerProps = ["id", "name", "b:start", "b:end", "b:step", "b:loop"];
        for ( var idx = 0; idx < spinnerProps.length; idx++ ) {
            var p = spinnerProps[idx];
            n += __squish__nameHelper(o, p, "spinner_" + p);
        }
    }

    return n + " className='" + cn + "'}";
}

function __squish__backbase__nameOfSpinner(o, cn)
{
    return '{' + __squish__propsToNameStr(o, ["tagName", "id", "name"]) + " className='" + cn + "'}";
}

function __squish__backbase__nameOfCard(o, cn)
{
    return '{' + __squish__propsToNameStr(o, ["tagName", "id", "name", "b:title"]) + " className='" + cn + "'}";
}

function __squish__backbase__lv__getItem(lv, itm)
{
    var cells = lv.getElementsByTagName('TD');
    for (var i = 0; i < cells.length; i++) {
	var c = cells[i];
	if (__squish__clean(c.innerText) == itm) {
	    return c;
	}
    }
    cells = __squish__getElementsByClassName(lv, 'b-listview-th', 'TH');
    for (i = 0; i < cells.length; i++) {
	c = cells[i];
	if (__squish__clean(c.innerText) == itm) {
	    return c;
	}
    }
    return undefined;
}

function __squish__backbase__lv__clickItem(lv, itm)
{
    var c = __squish__backbase__lv__getItem(lv, itm);
    if (c) {
	if (c.tagName == 'TD')
	    c = c.parentNode;
	Squish.mouseClick(c);
    }
}

function __squish__backbase__lv__isSelected(lv, itm)
{
    var c = __squish__backbase__lv__getItem(lv, itm);
    return (c && c.parentNode && c.parentNode.className &&
	    __squish__listContains(c.parentNode.className, 'b-listview-tr-sel'));
}

function __squish__backbase__lv__numRows(lv)
{
    var rows  = __squish__getElementsByClassName(lv, 'b-listview-tr', 'TR');
    return rows.length;
}

function __squish__backbase__lv__numColumns(lv)
{
    var cols  = __squish__getElementsByClassName(lv, 'b-listview-th', 'TH');
    return cols.length;
}

function __squish__backbase__lv__itemText(lv, r, c)
{
    var cols  = __squish__backbase__lv__numColumns(lv);
    var cells = lv.getElementsByTagName('TD');
    var cell = cells[cols * r + c];
    if (cell)
	return __squish__clean(cell.innerText);
    return '';
}

function __squish__backbase__lv__caption(lv, c)
{
    var cols  = __squish__getElementsByClassName(lv, 'b-listview-th', 'TH');
    var h = cols[c];
    if (h)
	return __squish__clean(h.innerText);
    return '';
}

function __squish__backbase__nameOfListViewItem(o)
{
    var t = o;
    while (t && (!t.className || !__squish__listContains(t.className, 'b-listview')))
	t = t.parentNode;
    var tid = '';
    if (t) tid = __squish__nameOf(t); 

    return {"object": tid, "itemText": o.innerText };
}

function __squish__backbase__nameOfListView(o)
{
    var head = __squish__backbase__headerOfListView(o);
    var s = '{' + __squish__propsToNameStr(o, ["tagName", "id"]);
    if (head && head != '')
	s += "header='" + head + "' ";
    s += "className='b-listview'}";
    return s;
}

function __squish__backbase__headerOfListView(o)
{
    var heads = o.getElementsByTagName('TH');
    var head = '';
    for (var i = 0; i < heads.length; i++) {
	var h = heads[i];
	h = __squish__clean(h.innerText);
	if (head != '' && head.charAt(head.length - 1) != ';' && h && h != '')
	    head += ';';
	if (h && h != '')
	    head += h;
    }
    return head;
}

function __squish__backbase__nameOf(o/*, noUnify*/)
{
    if ( o.className ) {
        for ( var idx = 0; idx < __squish__backbase__descriptors.length; idx++ ) {
            var d = __squish__backbase__descriptors[idx];
            if ( __squish__listContains( o.className, d[__squish__backbase__className] ) ) {
                var nameOfFn = d[__squish__backbase__nameOfFn];
                return escape(__squish__uniquifyName(nameOfFn(o, d[__squish__backbase__className]), o));
            }
        }
    }
    if (o.tagName == 'TD' && o.parentNode && o.parentNode.className &&
            __squish__listContains(o.parentNode.className, 'b-listview-tr') ||
            o.tagName == 'TH' && o.className &&
            __squish__listContains(o.className, 'b-listview-th'))
        return __squish__uniquifyName(__squish__backbase__nameOfListViewItem(o)["object"], o);
    else if (o.tagName == 'TABLE' && o.className && __squish__listContains(o.className, 'b-listview'))
        return  escape(__squish__uniquifyName(__squish__backbase__nameOfListView(o), o));
    return undefined;
}

function __squish__backbase__typeOf(o/*, noUnify*/)
{
    if (o.tagName == 'TD' && o.parentNode && o.parentNode.className &&
	     __squish__listContains(o.parentNode.className, 'b-listview-tr') ||
	     o.tagName == 'TH' && o.className &&
	     __squish__listContains(o.className, 'b-listview-th'))
	return 'bb_listview_item';
    else if (o.tagName == 'TABLE' &&
	     o.className && __squish__listContains(o.className, 'b-listview'))
	return 'bb_listview';
    else if (o.className) {
        for ( var idx = 0; idx < __squish__backbase__descriptors.length; idx++ ) {
            var d = __squish__backbase__descriptors[idx];
            if ( __squish__listContains( o.className,
                                         d[__squish__backbase__className] ) )
                return d[__squish__backbase__internalName];
        }
    }
    return undefined;
}

function __squish__backbase__eventObject(o/*, noUnify*/)
{
    if (!o)
        return undefined;

    if ( o.className && __squish__listContains(o.className, 'b-combo-option')) {
        // Unfortunately there does not seem to be a direct relation between
        // an option of a combo box, and the combo box itself. So search the
        // whole document for the combo box which currently has the focus.
        return __squish__getElementByClassName(window.__squish__ctxwin.document,
                'b-combobox-focus',
                'SPAN');
    }

    if ( o.className && __squish__listContains(o.className, 'b-option')) {
        // Unfortunately there does not seem to be a direct relation between
        // an option of a combo box, and the combo box itself. So search the
        // whole document for the combo box which currently has the focus.
	var p = o.parentNode;
	while (p && p.tagName != 'DIV')
	    p = p.parentNode;
	if (!p)
	    p = o.parentNode;
	var selects =__squish__getElementsByClassName(window.__squish__ctxwin.document,
						      'b-select', 'SPAN' );
	for (var s = 0; s < selects.length; s++) {
	    var sel = selects[s];
	    if (sel.oPulldown == p) {
		return sel;
	    }
	}
    }

    if ( o.tagName && o.tagName == 'INPUT' && o.type == 'text' ) {
        if ( o.parentNode &&
                o.parentNode.tagName && o.parentNode.tagName == 'SPAN' &&
                o.parentNode.className && __squish__listContains( o.parentNode.className, 'b-spinner' ) )
            return o.parentNode;
    }

    if (o.tagName == 'DIV') {
        var oo = o;
        o = o.parentNode;
        if (o.tagName == 'TD' && o.parentNode && o.parentNode.className &&
                __squish__listContains(o.parentNode.className, 'b-listview-tr') ||
                o.tagName == 'TH' && o.className &&
                __squish__listContains(o.className, 'b-listview-th'))
            return o;
        o = oo;
    }

    return undefined;
}

function __squish__backbase__matchObject(o, prop, value/*, name*/)
{
    if (prop == "header") {
	var bbh =__squish__backbase__headerOfListView(o);
	return Squish.matchProperty(value, bbh);
    }
    
    if (Squish.hasClassName(o, 'b-spinner-arrowup') ||
	Squish.hasClassName(o, 'b-spinner-arrowdown')) {
	var spinner = o;
	if (prop == "spinner_name")
	    return Squish.matchProperty(prop, spinner['name']);
	if (prop == "spinner_id")
	    return Squish.matchProperty(prop, spinner['id']);
	if (prop == "spinner_b:start")
	    return Squish.matchProperty(prop, spinner['b:start']);
	if (prop == "spinner_b:end")
	    return Squish.matchProperty(prop, spinner['b:end']);
	if (prop == "spinner_b:step")
	    return Squish.matchProperty(prop, spinner['b:step']);
	if (prop == "spinner_b:loop")
	    return Squish.matchProperty(prop, spinner['b:loop']);
    }

    return undefined;
}

function __squish__backbase__itemTextForEventObject( eventObject ) {
    if (eventObject.tagName == 'TD' && eventObject.parentNode && eventObject.parentNode.className &&
            __squish__listContains(eventObject.parentNode.className, 'b-listview-tr') ||
            eventObject.tagName == 'TH' && eventObject.className &&
            __squish__listContains(eventObject.className, 'b-listview-th')) {
        return __squish__backbase__nameOfListViewItem(eventObject)["itemText"];
    }
    return undefined;
}

if (Squish.toolkitExtensions["Backbase"].enabled) {
    Squish.addNameOfHook(__squish__backbase__nameOf);
    Squish.addTypeOfHook(__squish__backbase__typeOf);
    Squish.addEventObjectHook(__squish__backbase__eventObject);
    Squish.addMatchObjectHook(__squish__backbase__matchObject);
    Squish.addItemTextForEventObjectHook(__squish__backbase__itemTextForEventObject);
}



var backbaseExtension = new Object;
var backbasedatagridExtension = new Object;
var backbaselistgridExtension = new Object;
var backbasetreeExtension = new Object;

backbaseExtension.nameOfDataGridCell = function (o)
{
    var t = o;
    while (t && (!Squish.hasClassName(t, 'b-datagrid')))
	t = t.parentNode;
    var tid = '';
    if (t) tid = Squish.nameOf(t); 

    return {"object": tid, "itemText": o.innerText};
}

backbaseExtension.nameOfListGridCell = function (o)
{
    var t = o;
    while (t && (!Squish.hasClassName(t, 'b-listgrid')))
	t = t.parentNode;
    var tid = '';
    if (t) tid = Squish.nameOf(t); 

    return {"object": tid, "itemText": o.innerText};
}

backbaseExtension.nameOfTreeItem = function (o)
{
    var t = o;
    while (t && !Squish.hasClassName(t, 'b-tree-root') &&
	   !Squish.hasClassName(t, 'b-tree-root-multi'))
	t = t.parentNode;
    var tid = '';
    if (t) tid = Squish.nameOf(t); 

    return {"object": tid, "itemText": o.firstChild.innerText };
}

backbaseExtension.nameOfDataGrid = function (o)
{
    return '{' + Squish.propertiesToName(o, ["tagName", "id", "b:name"]) + "className='b-datagrid'}";
}

backbaseExtension.nameOfListGrid = function (o)
{
    return '{' + Squish.propertiesToName(o, ["tagName", "id", "b:name"]) + "className='b-listgrid'}";
}

backbaseExtension.nameOfTreeRootMulti = function (o)
{
    return '{' + Squish.propertiesToName(o, ["tagName", "id", "b:name"]) + "className='b-tree-root-multi'}";
}

backbaseExtension.nameOfTreeRoot = function (o)
{
    return '{' + Squish.propertiesToName(o, ["tagName", "id", "b:name"]) + "className='b-tree-root'}";
}

backbaseExtension.nameOf = function (o/*, noUnify*/)
{
    if (Squish.hasClassName(o, 'b-datagridcell'))
    return escape(backbaseExtension.nameOfDataGridCell(o)["object"]);
    else if (Squish.hasClassName(o, 'b-listgridcell'))
    return escape(backbaseExtension.nameOfListGridCell(o)["object"]);
    else if (Squish.hasClassName(o, 'b-datagridheadcell'))
    return escape(backbaseExtension.nameOfDataGridCell(o)["object"]);
    else if (Squish.hasClassName(o, 'b-listgridheadcell'))
    return escape(backbaseExtension.nameOfListGridCell(o)["object"]);
    else if (Squish.hasClassName(o, 'b-tree') || Squish.hasClassName(o, 'b-tree-leaf')  || Squish.hasClassName(o, 'b-tree-root-li'))
    return escape(backbaseExtension.nameOfTreeItem(o)["object"]);
    else if (Squish.hasClassName(o, 'b-datagrid'))
	return Squish.uniquifyName(backbaseExtension.nameOfDataGrid(o), o);
    else if (Squish.hasClassName(o, 'b-listgrid'))
	return Squish.uniquifyName(backbaseExtension.nameOfListGrid(o), o);
    else if (Squish.hasClassName(o, 'b-tree-root-multi'))
	return Squish.uniquifyName(backbaseExtension.nameOfTreeRootMulti(o), o);
    else if (Squish.hasClassName(o, 'b-tree-root'))
	return Squish.uniquifyName(backbaseExtension.nameOfTreeRoot(o), o);
    else if (Squish.hasClassName(o, 'b-tree-image-expand'))
    return escape(backbaseExtension.nameOfTreeItem(o.parentNode.parentNode.parentNode)["object"]);
    return undefined;
}

backbaseExtension.typeOf = function (o/*, noUnify*/)
{
    if (Squish.hasClassName(o, 'b-datagridcell'))
	return 'custom_item_backbasedatagrid';
    else if (Squish.hasClassName(o, 'b-listgridcell'))
	return 'custom_item_backbaselistgrid';
    else if (Squish.hasClassName(o, 'b-datagridheadcell'))
	return 'custom_item_backbasedataheadgrid';
    else if (Squish.hasClassName(o, 'b-listgridheadcell'))
	return 'custom_item_backbaselistheadgrid';
    else if (Squish.hasClassName(o, 'b-tree') || Squish.hasClassName(o, 'b-tree-leaf')  || Squish.hasClassName(o, 'b-tree-root-li'))
	return 'custom_item_backbasetree';
    else if (Squish.hasClassName(o, 'b-datagrid'))
	return 'custom_itemview_backbasedatagrid';
    else if (Squish.hasClassName(o, 'b-listgrid'))
	return 'custom_itemview_backbaselistgrid';
    else if (Squish.hasClassName(o, 'b-tree-root-multi'))
	return 'custom_itemview_backbasetree';
    else if (Squish.hasClassName(o, 'b-tree-root'))
	return 'custom_itemview_backbasetree';
    else if (Squish.hasClassName(o, 'b-tree-image-expand'))
	return 'custom_itemhandle_backbasetree';
    return undefined;
}

backbaseExtension.eventObject = function (o/*, noUnify*/)
{
    if (Squish.hasClassName(o, 'b-datagridcell-div'))
	return o.parentNode;
    else if (Squish.hasClassName(o, 'b-listgridcell-div'))
	return o.parentNode;
    else if (Squish.hasClassName(o, 'b-datagridheadcell-div'))
	return o.parentNode;
    else if (Squish.hasClassName(o, 'b-listgridheadcell-div'))
	return o.parentNode;
    else if (Squish.hasClassName(o, 'b-listgridheadcell-div2'))
	return o.parentNode.parentNode;
    else if (Squish.hasClassName(o, 'b-listgridheadcell'))
      return o;
    else if (Squish.hasClassName(o, 'b-tree-leaf-div') || Squish.hasClassName(o, 'b-tree-div'))
	return o.parentNode.parentNode;
    else if (Squish.hasClassName(o, 'b-tree-leaf-div-text') || Squish.hasClassName(o, 'b-tree-div-text'))
	return o.parentNode.parentNode.parentNode;
    else if (Squish.hasClassName(o, 'b-datagrid'))
	return o;
    else if (Squish.hasClassName(o, 'b-listgrid'))
	return o;
    else if (Squish.hasClassName(o, 'b-tree-root-multi'))
	return o;
    else if (Squish.hasClassName(o, 'b-tree-root'))
	return o;
    else if (Squish.hasClassName(o, 'b-tree-image-expand'))
	return o;
    else if (o.parentNode && Squish.hasClassName(o.parentNode, 'b-listgridcell-div'))
	return o.parentNode.parentNode;
    else if (o.parentNode && Squish.hasClassName(o.parentNode, 'b-datagridcell-div'))
	return o.parentNode.parentNode;

    return undefined;
}

backbaseExtension.clickHook = function (o)
{
    if (o.className) {
	var cn = o.className;
	if (__squish__listContains(cn, 'b-tree') ||
 	    __squish__listContains(cn, 'b-tree-leaf')) {
	    var c = Squish.getElementByClassName(o, 'b-tree-div', 'DIV');
	    if (!c) c = Squish.getElementByClassName(o, 'b-tree-leaf-div', 'DIV');
	    Squish.mouseClick(c);
	    return true;
	} 
	    
    }

    return undefined;
}

backbasedatagridExtension.isItemSelected = function (i)
{
    return Squish.hasClassName(i, 'b-datagridcell-sel');
}

backbasedatagridExtension.findItem = function (grid, n)
{
    var cells = Squish.getElementsByClassName(grid, 'b-datagridcell', 'TD');
    for (var i = 0; i < cells.length; i++) {
	var c = cells[i];
	if (Squish.cleanString(c.innerText) == n) {
	    return c;
	}
    }

    cells = Squish.getElementsByClassName(grid, 'b-datagridheadcell', 'TH');
    for (i = 0; i < cells.length; i++) {
	c = cells[i];
	if (Squish.cleanString(c.innerText) == n) {
	    return c;
	}
    }

    return undefined;
}

backbasedatagridExtension.childItem = function (parent, col)
{
    if (Squish.hasClassName(parent, "b-datagrid")) {
	var row = Squish.getElementByClassName(parent, 'b-datagrid-tr', 'TR');
	var cells = Squish.getElementsByClassName(row, 'b-datagridcell', 'TD');
	return cells[col];
    }

    return undefined;
}

backbasedatagridExtension.nextSibling = function (parent, col)
{
    while (parent && parent.tagName != 'TR')
	parent = parent.parentNode;
    if (!parent)
	return;
    parent = parent.nextSibling;
    while (parent && parent.tagName != 'TR')
	parent = parent.nextSibling;
    if (!parent)
	return;
    var cells = Squish.getElementsByClassName(parent, 'b-datagridcell', 'TD');
    return cells[col];
}

backbasedatagridExtension.itemView = function (node)
{
    var t = node;
    while (t && (!Squish.hasClassName(t, 'b-datagrid')))
	t = t.parentNode;
    return t;
}

backbasedatagridExtension.numColumns = function (grid)
{
    var cells = Squish.getElementsByClassName(grid, 'b-datagridheadcell', 'TH');
    return cells.length;
}

backbasedatagridExtension.columnCaption = function (grid, col)
{
    var cells = Squish.getElementsByClassName(grid, 'b-datagridheadcell', 'TH');
    return cells[col].innerText;
}




backbaselistgridExtension.isItemSelected = function (i)
{
    return Squish.hasClassName(i, 'b-listgridcell-sel');
}

backbaselistgridExtension.findItem = function (grid, n)
{
    var cells = Squish.getElementsByClassName(grid, 'b-listgridcell', 'TD');
    for (var i = 0; i < cells.length; i++) {
	var c = cells[i];
	if (Squish.cleanString(c.innerText) == n) {
	    return c;
	}
    }

    cells = Squish.getElementsByClassName(grid, 'b-listgridheadcell', 'TH');
    for (i = 0; i < cells.length; i++) {
	c = cells[i];
	if (Squish.cleanString(c.innerText) == n) {
	    return c;
	}
    }

    return undefined;
}

backbaselistgridExtension.childItem = function (parent, col)
{
    if (Squish.hasClassName(parent, "b-listgrid")) {
	var cells = Squish.getElementsByClassName(parent, 'b-listgridcell', 'TD');
	return cells[col];
    }

    return undefined;
}

backbaselistgridExtension.nextSibling = function (parent, col)
{
    while (parent && parent.tagName != 'TR')
	parent = parent.parentNode;
    if (!parent)
	return;
    parent = parent.nextSibling;
    while (parent && parent.tagName != 'TR')
	parent = parent.nextSibling;
    if (!parent)
	return;
    var cells = Squish.getElementsByClassName(parent, 'b-listgridcell', 'TD');
    return cells[col];
}

backbaselistgridExtension.itemView = function (node)
{
    var t = node;
    while (t && (!Squish.hasClassName(t, 'b-listgrid')))
	t = t.parentNode;
    return t;
}

backbaselistgridExtension.numColumns = function (grid)
{
    var cells = Squish.getElementsByClassName(grid, 'b-listgridheadcell', 'TH');
    return cells.length;
}

backbaselistgridExtension.columnCaption = function (grid, col)
{
    var cells = Squish.getElementsByClassName(grid, 'b-listgridheadcell', 'TH');
    return cells[col].innerText;
}









backbasetreeExtension.findItem = function (tree, n)
{
    var items = Squish.getElementsByClassName(tree, 'b-tree', 'LI');
    for (var i = 0; i < items.length; i++) {
	var c = items[i];
	if (Squish.cleanString(c.firstChild.innerText) == n) {
	    return c;
	}
    }

    items = Squish.getElementsByClassName(tree, 'b-tree-leaf', 'LI');
    for (i = 0; i < items.length; i++) {
	c = items[i];
	if (Squish.cleanString(c.firstChild.innerText) == n) {
	    return c;
	}
    }

    return undefined;
}

backbasetreeExtension.itemHandle = function (node)
{
    return Squish.getElementByClassName(node, 'b-tree-image-expand', 'SPAN');
}

backbasetreeExtension.isItemSelected = function (i)
{
    return Squish.hasClassName(i.firstChild, "b-tree-sel");
}

backbasetreeExtension.isItemOpen = function (i)
{
    return Squish.hasClassName(i, "b-tree-open");
}

backbasetreeExtension.itemView = function (node)
{
    var t = node;
    while (t && !Squish.hasClassName(t, 'b-tree-root') &&
	   !Squish.hasClassName(t, 'b-tree-root-multi'))
	t = t.parentNode;
    return t;
}

backbasetreeExtension.childItem = function (parent)
{
    if (parent.tagName == 'UL') {
	return parent.getElementsByTagName('LI')[0];
    } else {
	var listparent = parent.getElementsByTagName('UL')[0];
	return listparent.getElementsByTagName('LI')[0];
    }
}

backbasetreeExtension.nextSibling = function (node)
{
    node = node.nextSibling;
    while (node && node.tagName != 'LI')
	node = node.nextSibling;
    return node;
}

backbasetreeExtension.parentItem = function (node)
{
    node = node.parentNode.parentNode;
    while (node && node.tagName != 'LI') {
	if (Squish.hasClassName(node, 'b-tree-root') ||
	    Squish.hasClassName(node, 'b-tree-root-multi'))
	    return undefined;
	node = node.parentNode;
    }

    if (!node)
	return undefined;
	
    return node;
}

backbasetreeExtension.itemText = function (node)
{
    return node.firstChild.innerText;
}

backbaseExtension.pickableObject = function (elem) {
    // TODO: Look at backbase examples for the various supported
    // objects and determine which parts of eventObject are really
    // useful for picking.
    // Support both eventObject hooks registered in this file
    var evObj = __squish__backbase__eventObject(elem);
    if( evObj ) {
        return evObj;
    }
    evObj = backbaseExtension.eventObject(elem);
    if( evObj ) {
        return evObj;
    }
    // Taken from jshook.js's __squish__eventObject to keep backwards compatibility
    /*while( o ) {
        // XXX Should be factored into jshook_backbase.js
        if (o.className && __squish__backbase__descriptors) {
            for (var idx = 0; idx < __squish__backbase__descriptors.length; idx++) {
                var d = __squish__backbase__descriptors[idx];
                if (typeof(d) == "function")
                    continue;
                if (__squish__listContains(o.className, d[__squish__backbase__className]))
                    return o;
            }
        }
        o = o.parentNode;
    }*/
    return undefined;
}

backbaseExtension.itemTextForEventObject = function( eventObject ) {
    if (Squish.hasClassName(eventObject, 'b-datagridcell'))
    return backbaseExtension.nameOfDataGridCell(eventObject)["itemText"];
    else if (Squish.hasClassName(eventObject, 'b-listgridcell'))
    return backbaseExtension.nameOfListGridCell(eventObject)["itemText"];
    else if (Squish.hasClassName(eventObject, 'b-datagridheadcell'))
    return backbaseExtension.nameOfDataGridCell(eventObject)["itemText"];
    else if (Squish.hasClassName(eventObject, 'b-listgridheadcell'))
    return backbaseExtension.nameOfListGridCell(eventObject)["itemText"];
    else if (Squish.hasClassName(eventObject, 'b-tree') || Squish.hasClassName(eventObject, 'b-tree-leaf')  || Squish.hasClassName(eventObject, 'b-tree-root-li'))
    return backbaseExtension.nameOfTreeItem(eventObject)["itemText"];
    else if (Squish.hasClassName(eventObject, 'b-tree-image-expand'))
    return backbaseExtension.nameOfTreeItem(eventObject.parentNode.parentNode.parentNode)["itemText"];
    return undefined;
}

if (Squish.toolkitExtensions["Backbase"].enabled) {
    Squish.addNameOfHook(backbaseExtension.nameOf);
    Squish.addTypeOfHook(backbaseExtension.typeOf);
    Squish.addEventObjectHook(backbaseExtension.eventObject);
    Squish.addClickHook(backbaseExtension.clickHook);
    Squish.addPickableObjectHook(backbaseExtension.eventObject);
    Squish.addItemTextForEventObjectHook(backbaseExtension.itemTextForEventObject);
    __squish__backbase__descriptors = [
        /* class name,          nameOf function,                    internal name,        click handler
                                                                                          tagname*/
        [ 'b-button',           __squish__backbase__nameOfButton,   'bb_button',          'SPAN' ],
        [ 'navItem',           __squish__backbase__nameOfButton,   'bb_button',          'DIV' ],
        [ 'topNav_button',           __squish__backbase__nameOfButton,   'bb_button',          'DIV' ],
        [ 'ci_menucell',        __squish__backbase__nameOfButton,   'bb_menucell',        'DIV' ],
        [ 'b-combobox',         __squish__backbase__nameOfComboBox, 'bb_combobox',        'SPAN' ],
        [ 'b-select',         __squish__backbase__nameOfComboBox, 'bb_combobox',        'SPAN' ],
        [ 'b-toolbaritem',      __squish__backbase__nameOfButton,   'bb_toolbaritem',     'TD' ],
        [ 'b-tabselector',      __squish__backbase__nameOfButton,   'bb_tabselector',     'TD' ],
        [ 'b-sidebarselector',  __squish__backbase__nameOfButton,   'bb_sidebarselector', 'TD' ],
        [ 'b-navpanelhead-des',  __squish__backbase__nameOfButton,   'bb_navpanelhead', 'TD' ],
        [ 'b-navpanelhead-sel',  __squish__backbase__nameOfButton,   'bb_navpanelhead', 'TD' ],
        [ 'b-navhead',  __squish__backbase__nameOfButton,   'bb_navhead', 'DIV' ],
        [ 'b-accordeonhead',  __squish__backbase__nameOfButton,   'bb_accordeon', 'DIV' ],
        [ 'b-spinner-arrowup', __squish__backbase__nameOfSpinnerButton,  'bb_spinnerupbutton', 'SPAN' ],
        [ 'b-spinner-arrowdown', __squish__backbase__nameOfSpinnerButton,  'bb_spinnerdownbutton', 'SPAN' ],
        [ 'b-spinner', __squish__backbase__nameOfSpinner,  'bb_spinner', '' ],
        [ 'b-card', __squish__backbase__nameOfCard,  'bb_card', 'DIV' ]
    ];

}
