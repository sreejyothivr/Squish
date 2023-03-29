/**********************************************************************
** Copyright (C) 2005 - 2021 froglogic GmbH.
** Copyright (C) 2022 The Qt Company Ltd.
** All rights reserved.
**********************************************************************/

/* exported
__squish__kiwi__activateItem
__squish__kiwi__choice__selectedOption
__squish__kiwi__choice__setSelectedOption
__squish__kiwi__choice__setSelectedValue
__squish__kiwi__find__first__column__in__row
__squish__kiwi__matrix_numColumns
__squish__kiwi__matrix_numRows
__squish__kiwi__matrixtable_caption
__squish__kiwi__matrixtable_numColumns
__squish__kiwi__matrixtable_numRows
__squish__kiwi__table__findRow
__squish__kiwi__table__isCellSelected
__squish__kiwi__table__isRowSelected
__squish__kiwi__table_caption
__squish__kiwi__table_grpcaption
__squish__kiwi__table_grpcaptionofcol
__squish__kiwi__table_numColumns
__squish__kiwi__table_numGroups
__squish__kiwi__table_numRows
__squish__kiwi__tree__find__item
__squish__kiwi__tree__is__open
__squish__kiwi__tree__is__selected
__squish__kiwi__treetable__absoluteRowByCount
__squish__kiwi__treetable__find__clickableelement
__squish__kiwi__treetable_caption
*/

/* global
__squish__clean
__squish__getElementsByClassName
__squish__listContains
__squish__sendXMLHttpRequest
__squish__typeOf
Squish
xpathDomEval
*/

var __squish__choice_value = undefined;
var __squish__menu_value = undefined;
var __squish__clicked_comboBox = undefined;

function __squish__getElementsByTagName(obj, tagName)
{
    if( window.__squish__ie ) {
        return xpathDomEval( ".//"+tagName.toUpperCase(), obj).nodeSetValue();
    }
    return obj.getElementsByTagName( tagName );
}

function __squish__kiwi__findComboBox(o)
{
    var combo;
    var e = o;
    o = o.parentNode;
    var spans = __squish__getElementsByTagName( o.ownerDocument, 'SPAN' );
    for (var i = 0; i < spans.length; i++ ) {
        var s = spans[i];
        if (s.id && s.id.indexOf('GFchoice') != -1) {
            var rows = __squish__getElementsByTagName( s, 'DIV' );
            for (var r = 0; r < rows.length; r++) {
                if (rows[r].innerHTML == e.innerHTML) {
                    var n = s.id;
                    n = n.substr(0, n.lastIndexOf('***'));
                    combo = o.ownerDocument.getElementById(n);
                    break;
                }
            }
        }
    }
    return combo;
}

function __squish__kiwi__eventObject(o)
{
    __squish__choice_value = undefined;

    /* If this is a click onto a combo box, remember it. That way we can record
     * a selectOption() on it lateron if we notice a click on a combo box item
     * in the popup menu (see further below). __squish__kiwi__findComboBox()
     * doesn't work in all cases, sometimes it's apparently not possible to
     * deduce the combo box object from the item in the popup menu.
     */
    if (o && o.className) {
        if (o.className == 'comboBoxEditor' ||
            o.className == 'comboBoxEditorFocused' ||
            o.className == 'comboBoxButton' ||
            o.className == 'comboBoxButtonmouseOver' ) {
            if (o.parentNode && o.parentNode.tagName == 'SPAN' && o.parentNode.className && o.parentNode.className == 'comboBox') {
                if (o.parentNode.parentNode && o.parentNode.parentNode.tagName == 'SPAN') {
                    __squish__clicked_comboBox = o.parentNode.parentNode;
                }
            }
        }
    }

    if (o && o.className && o.className == 'comboBoxPopupMenuItemSelected') {
        __squish__choice_value = o.innerText;
        if ( __squish__clicked_comboBox ) {
            o = __squish__clicked_comboBox;
        } else {
            o = __squish__kiwi__findComboBox(o);
        }
        if (o) return o;
    }

    if (o && o.tagName == 'DIV' && o.className == 'workspace_worksheetBar_worksheetGroupOver') {
        o.id = o.innerText;
        return o;
    }
    return undefined;
}

function __squish__kiwi__findMenu(o)
{
    if (!o || !o.ownerDocument) return false;
    var divs = __squish__getElementsByTagName(o.ownerDocument, 'DIV');
    for (var i = 0; i < divs.length; i++ ) {
        var d = divs[i];
        if (!d.className || ( d.className != 'more_menu' && d.className != 'moremenu' && d.id.toLowerCase() != 'moremenu' && d.id.toLowerCase() != 'contextmenu' ) ) continue;
        var items = __squish__kiwi__menuItems(d);
        var oid = o.id;
        var needle = new String('QAmoreMenu_');
        if (oid && oid.indexOf(needle) != -1) {
            var moremenu_p1 = oid.indexOf(needle);
            var moremenu_p2 = oid.lastIndexOf('_more_textCell');
            oid = oid.substring( moremenu_p1 + needle.length, moremenu_p2 );
        }
        needle = 'QApopupMenu_';
        if (oid && oid.indexOf(needle) != -1) {
            var popupmenu_p1 = oid.indexOf(needle);
            var popupmenu_p2 = oid.lastIndexOf('_menuItemText');
            oid = oid.substring( popupmenu_p1 + needle.length, popupmenu_p2 );
        } 
        for (var j = 0; j < items.length; j++ ) {
            if (items[j].buttonId == oid || items[j].worksheetId == oid) {
                __squish__menu_value = { "object": window.__squish__clean( d.id ),
                                         "text": __squish__kiwi__menuItemText(items[j])['innerText'] };
                return true;
            }
        }
    }
    return false;
}

function __squish__kiwi__typeOf(o)
{
    if (o.tagName == 'DIV' && ( o.className == 'more_menu' || o.className == 'moremenu' || (o.parentNode && o.parentNode.parentNode && o.parentNode.parentNode.id == 'moreMenu') || o.id == 'moreMenu' || o.id == 'contextMenu') ) {
        return 'kiwi_more_menu';
    }
    if (o.tagName == 'TR' && (o['isMenuItem'] || o.className.toLowerCase().indexOf('menuitem') != -1) ) {
        return 'kiwi_more_menu_item';
    }
    if (o.tagName == 'LI' && o['isMenuItem'] ) {
        return 'kiwi_more_menu_item';
    }
    if (o.tagName == 'TD' && (o.className.indexOf('gridNodeImg') != -1 && o.className.indexOf('gridNodeImgLE') == -1 )) {
        return 'kiwi_treenode_handle';
    }
    if (o.tagName == 'TD' && o.className == 'treeNodeHandle') {
        return 'kiwi_treenode_handle';
    }
    if (o.tagName == 'SPAN' && o.parentNode && 
        o.parentNode.className == 'gridNodeLabel') {
        return 'kiwi_treenode_label';
    }
    if (o.tagName == 'SPAN' && o.parentNode && 
        o.parentNode.className == 'treeNodeLabel') {
        return 'kiwi_treenode_label';
    }
    if (o.tagName == 'SPAN' && o.className == 'treeObject') {
        return 'kiwi_tree';
    }
    if (o.tagName == 'DIV' && (o.className == 'controlTree' || o.className == 'heldTree') ) {
        return 'kiwi_tree';
    }
    if (o.tagName == 'TD' && o.className == 'treeTableCell' ) {
        return 'kiwi_treetable_item';
    }
    if (o.tagName == 'DIV' && o.className == 'treeTableCellText') {
        return 'kiwi_treetable_item';
    }
    if (o.tagName == 'TD' && o.i != undefined) {
        var tds = __squish__getElementsByTagName(o, "TD");
        for( var i = 0; i < tds.length; i++ )
        {
            if( tds[i].className == 'gridNode' ) {
                return 'kiwi_treetable_item';
            }
        }
    }
    if ((o.tagName == 'SPAN' && o.className == 'tableColumnHeaderLink') || (o.tagName == 'A' && o.className.indexOf('gridColumnHeaderLink') != -1) ) {
        return 'kiwi_table_header';
    }
    if (o.tagName == 'SPAN' && o.className == 'treeTableColumnHeaderLink') {
        return 'kiwi_treetable_header';
    }
    if (o.tagName == 'SPAN' && o.className == 'tableObject') {
        return 'kiwi_table';
    }
    if (o.tagName == 'DIV' && (o.className == 'controlTable' || o.className == 'heldTable')) {
        return 'kiwi_table';
    }
    if (o.tagName == 'SPAN' && o.className == 'treeTableObject') {
        return 'kiwi_treetable';
    }
    if (o.tagName == 'DIV' && (o.className == 'controlTreeTable' || o.className == 'heldTreeTable')) {
        return 'kiwi_treetable';
    }
    if (o.id == 'helpList_Content') {
        return 'kiwi_table';
    }
    if (o.tagName == 'SPAN' && o.className == 'ToolBarControl') {
        return 'button';
    }
    if (o.tagName == 'SPAN' && o.firstChild && o.firstChild.tagName == 'SPAN' && o.firstChild.className && o.firstChild.className == 'comboBox') {
        return 'kiwi_choice';
    }
    if (o.tagName == 'DIV' && o.id && o.id.indexOf('GFchoice') != -1 && o.className && (o.className.indexOf('comboBox') != -1 || o.className.indexOf('controlD') != -1)) {
        return "kiwi_choice";
    }
    
    if (o.tagName == 'SPAN' && o.id && o.id.indexOf && o.id.indexOf("GFchoice") != -1 ) {
        var subelem = o.ownerDocument.getElementById(o.id + "_comboBox");
        if( subelem && subelem.tagName == 'SPAN' ) {
            return "kiwi_choice";
        }
    }
    
    if (__squish__choice_value || o && o.id && o.id.indexOf && o.id.indexOf('Fchoice') != -1 && o.id.indexOf('_comboBox') != -1) return 'kiwi_choice';
    
    if (o.tagName == 'SPAN' && o.className && o.className == 'cellComboBox') return 'kiwi_choice';
    
    __squish__menu_value = undefined; 
    if (window.__squish__recording && __squish__kiwi__findMenu(o))
        return 'kiwi_more_menu';	
	if ((o.tagName == 'SPAN' || o.tagName == 'DIV') && o.className && o.className == 'matrix matrixBehavior') {
	    return 'kiwi_matrixtable';
	}
	if (o.tagName == 'TD' && o.className && o.className == 'matrixCell') {
	    return 'kiwi_matrix';
	}
	if (o.tagName == 'TD' && o.firstChild && o.firstChild.className && o.firstChild.className.indexOf('matrixSubCell') != -1 ) {
	    return 'kiwi_matrixcell';
	}
    if (o.tagName == 'TD' && ( o.className == 'tableCell' 
                               || ( o.className !=  undefined && o.className.indexOf( 'tcell' ) == 0 ) 
                               || ( o.className !=  undefined && o.className.indexOf( 'gridCell' ) == 0 )
                               || ( o.i != undefined && o.className != 'matrixCell' && o.className != 'treeTableCell' ) ) ) {
        return 'kiwi_table_item';
    }
    return undefined;
}

function __squish__kiwi__treeName(o)
{
    while (o && (!o.tagName || !o.className || ( o.className != 'treeNode' && o.className != 'gridNode' ) ) ) o = o.parentNode;
    if (!o) return 'unknown';

    var n = o.id;
    n = n.substr(0, n.indexOf('_'));
    return n;
}

function __squish__kiwi__tableName(o)
{
    while (o && o.className != 'tableObject' && o.className != 'controlTable' && o.className != 'heldTable' && o.id != 'helpList_Content' && o.className != 'treeTableObject' && o.className != 'heldTreeTable' && o.className != 'controlTreeTable') o = o.parentNode; 
    if (!o) return 'unknown';
    return o.id;
}

function __squish__kiwi__eventToStr(t, o, e)
{
    var str = "&value=";
    if (t == 'kiwi_choice') str += window.__squish__clean(__squish__choice_value);
    else if (e.type == 'click' && t == 'DIV' && o.className == 'workspace_worksheetBar_worksheetGroupOver') str = '&clickHandler';
    else str = undefined;
    return str;
}

function __squish__kiwi__tree__isNodeSelected(tree, nodeId)
{
    var selection = tree.ownerDocument.getElementById(tree.id + '***selection');	
    var selectedNodeList = selection.childNodes;
    for (var i = 0; i < selectedNodeList.length; i++ ) {
        if (selectedNodeList[i].nodeId == nodeId) return true;
    }
    return false;
}

// Tries to find a parent element of the given type which can be used as
// table/treetable/matrixtable reference for the selected-queries
function __squish__kiwi__find__table__reference( cell, tabletype )
{
    var __squish__find_cell_node = cell
    while( __squish__find_cell_node ) {
        if( __squish__typeOf( __squish__find_cell_node ) == tabletype ) {
            return __squish__find_cell_node;
        }
        __squish__find_cell_node = __squish__find_cell_node.parentNode;
    }
    return null;
}

function __squish__kiwi__table__isCellSelected(table, cell, tabletype)
{
    if( !table )
    {
        table = __squish__kiwi__find__table__reference(cell, tabletype);
    }
    var selection = table.ownerDocument.getElementById(table.id + '***selection');	
    var selectedCellList = selection.childNodes;
    for (var i = 0; i < selectedCellList.length; i++ ) {
        if (selectedCellList[i].rowIndex == cell.i && 
            (!selectedCellList[i].columnIndex || selectedCellList[i].columnIndex == cell.j) )
            return true;
    }
    return false;
}

function __squish__kiwi__table__isRowSelected(table, row/*, tabletype*/)
{
    var selection = table.ownerDocument.getElementById(table.id + '***selection');	
    var selectedCellList = selection.childNodes;
    for (var i = 0; i < selectedCellList.length; i++ ) {
        if (selectedCellList[i].rowIndex == row || selectedCellList[i].nodeId == row)
            return true;
    }
    return false;
}
function __squish__kiwi__table__transpose(table) {
 
  var w = table.length ? table.length : 0;
  var h = table[0] instanceof Array ? table[0].length : 0;
  if(h === 0 || w === 0) { return []; }

  var i, j, t = [];
  for(i=0; i<h; i++) {
    t[i] = [];
    for(j=0; j<w; j++) {
       t[i][j] = table[j][i];
    }
  }
  return t;
}
function __squish__kiwi__table__getRows(table)
{
    var tds = __squish__getElementsByTagName( table, "TD" );
    var cols = new Array();
    var rowIndex = new Array();
    var row = 0;

    for (var n = 0; n < tds.length; n++ ) {
        var td = tds[n];
        var r = td.i;
        var c = td.j;
        var pattern = new RegExp(/^\d*$/);
        if (r != undefined && c != undefined && pattern.test(r) && pattern.test(c))
        {
            //var i = parseInt(r);
            var j = parseInt(c);
            if (!cols[j]) cols[j] = new Array();
            if (!rowIndex[j]) rowIndex[j] = 0;
            row = rowIndex[j];
            cols[j][row] = td;
            rowIndex[j] += 1;
        }
    }
    var cols2 = new Array();
    for (var i = 0; i < cols.length; i++) {
        if (cols[i]) cols2.push(cols[i]);
    }
    var rows = new Array();
    rows = __squish__kiwi__table__transpose(cols2);
    return rows;
}

function __squish__kiwi__table__findRow(table, rowText)
{
    var rows = __squish__kiwi__table__getRows(table);
    var text = rowText.split('|');
    for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var matched = true;
        var td;
        for (var c = 0; c < r.length; c++) {
            var col = r[c];
			if( col == undefined ) continue;
            td = col;
            if (!text[c] || text[c] == '*') continue;
            if (__squish__clean(col.innerText) != text[c]) { matched = false; break; }
        }
        if (matched) return td;
    }

    return undefined;
}
function __squish__kiwi__table_numRows(table)
{
    var rows = __squish__kiwi__table__getRows(table);
    return rows.length;
}
function __squish__kiwi__table_numColumns(table)
{
    var rows = __squish__kiwi__table__getRows(table);
    var count = 0;
    if (rows.length == 0) return count;
    for( var c = 0; c < rows[0].length; c++ ) {
        if( rows[0][c] == undefined ) continue;
        count++;
    }
    return count;
}

function __squish__kiwi__table_numGroups(table)
{
    var l = __squish__getElementsByClassName(table, 'tableColumnGroupHeaderContent', 'DIV' );
    if( !l || l.length == 0 ) {
        l = __squish__getElementsByClassName(table, 'gridColumnGroupHeaderContent', 'DIV' );
    }
    return l.length;
}


function __squish__kiwi__table_caption(table, column)
{
    var spans = __squish__getElementsByTagName(table, 'SPAN');
    var count = 0;
    for (var i = 0; i < spans.length; i++ ) {
        var span = spans[i];
        if (!span || !span.className || ( span.className != 'tableColumnHeaderLink' && span.className.indexOf('gridColumnHeaderLink') == -1 ) )
            continue;
        if (count == column)
            return __squish__clean(span.innerText);
        ++count;
    }
    spans = __squish__getElementsByTagName(table, 'A');
    count = 0;
    for (i = 0; i < spans.length; i++) {
        var anchor_span = spans[i];
        if (!anchor_span || !anchor_span.className || ( anchor_span.className != 'tableColumnHeaderLink' && anchor_span.className.indexOf('gridColumnHeaderLink') == -1 ) )
            continue;
        if (count == column)
            return __squish__clean(anchor_span.innerText);
        ++count;
    }
    return undefined;
}

function __squish__kiwi__table_grpcaption(table, column)
{
    var spans = __squish__getElementsByTagName(table, 'DIV');
    var count = 0;
    for (var i = 0; i < spans.length; i++) {
        var span = spans[i];
        if (!span || !span.className || ( span.className != 'tableColumnGroupHeaderContent' && span.className != 'gridColumnGroupHeaderContent' ) )
            continue;
        if (count == column)
            return __squish__clean(span.innerText);
        ++count;
    }
    return undefined;
}

function __squish__kiwi__table_grpcaptionofcol(table, column)
{
    var spans = __squish__getElementsByTagName(table, 'TD');
    var count = 0;
    var span = null;
    for (var i = 0; i < spans.length; i++) {
        span = spans[i];
        if (!span || !span.className || ( !__squish__listContains(span.className, 'tableColumnHeader') && !__squish__listContains(span.className, 'gridColumnHeader') ) )
            continue;
        if (count == column)
	    break;
        ++count;
    }
    for (i = 0; i < spans.length; i++) {
        var div = spans[i];
        if (!div || !div.className || ( !__squish__listContains(div.className, 'tableColumnGroupHeader') && !__squish__listContains(div.className, 'gridColumnGroupHeader') ) )
            continue;
        if (div.name == span.group)
            return __squish__clean(div.innerText);
    }
    return undefined;
}

function __squish__kiwi__treetable__absoluteRowByCount( table, row )
{
    if( !table )
    {
        table = __squish__kiwi__find__table__reference(row, "kiwi_treetable");
    }

    var rows = __squish__kiwi__table__getRows( table );
    for( var i = 0; i < rows.length; i++ ) {
        var r = rows[i];
        for( var j = 0; j < r.length; j++ ) {
            var td = r[j];
            if( td.i == row.i && td.j == row.j && td.className == row.className ) {
                return i;
            }
        }
    }
    return -1;
}

function __squish__kiwi__treetable_caption(table, column)
{
    var divs = __squish__getElementsByTagName(table, 'DIV');
    var count = 0;
    for (var i = 0; i < divs.length; i++) {
        var div = divs[i];
        if (!div || !div.className || ( div.className != 'tableColumnHeaderContent' && div.className.indexOf('gridColumnHeaderContent') == -1 ) )
            continue;
        if (count == column)
            return __squish__clean(div.innerText);
        ++count;
    }
    return undefined;
}

function __squish__kiwi__menuItems(menu)
{
    var items = [];
    var trs = __squish__getElementsByTagName(menu, 'TR');
    if( trs.length != 0 ) {
        for( var i = 0; i < trs.length; i++ ) {
            if( trs[i]['isMenuItem'] || trs[i].className.toLowerCase().indexOf('menuitem') != -1 ) {
                items[items.length] = trs[i];
            }
        }
    } else {
        var lis = __squish__getElementsByTagName(menu, 'LI');
        for( i = 0; i < lis.length; i++ ) {
            if( lis[i]['isMenuItem'] ) {
                items[items.length] = lis[i];
            }
        }
    }
    return items;
}

function __squish__kiwi__activateItem(menu, itemText)
{
    var l = __squish__kiwi__menuItems(menu)
    for (var i = 0; i < l.length; i++) {
        if (__squish__kiwi__menuItemText(l[i])['innerText'] == itemText || (__squish__kiwi__menuItemText(l[i])['id'] && __squish__kiwi__menuItemText(l[i])['id'] == itemText)) {
            l[i].fireEvent('onmouseenter');
            l[i].fireEvent('onclick');
            menu.hide();
            return true;
        }
    }
    return false;
}

function __squish__kiwi__menuItemText(item)
{
    var oid_text = new Object;
    if( item.tagName == "TR" ) {
        var td = item.firstChild;
        
        while (td && td.firstChild && td.firstChild.className != 'moretextCell' && td.firstChild.className != 'menuItemText' && ( !td.firstChild.id || (td.firstChild.id.indexOf('more_textCell') == -1 && td.firstChild.id.indexOf('menuItemText') == -1) ) ) {
            td = td.nextSibling;
        }
        oid_text.id = td && td.firstChild ? td.firstChild.id : '';
        oid_text.innerText = td && td.firstChild ? td.firstChild.innerText : '';
    } else {
        oid_text.id = item && item.firstChild ? item.firstChild.id : '';
        oid_text.innerText = item && item.firstChild ? item.firstChild.innerText : '';
    }
    return oid_text;
}

function __squish__kiwi__matrixtable__getRows(table)
{
    var tds = __squish__getElementsByTagName(table, 'TD');
    var rows = [];
	for (var i = 0; i < tds.length; i++) {
        var td = tds[i];
        if (!td || td.className != 'matrixCell' ) continue;
        var r = td.i;
        var c = td.j;
        if (r == undefined) continue;
        if (!rows[r]) rows[r] = [];
        if (!c) {c = rows[r].length; td.j = c;}
        if (c == undefined) continue;
        rows[r][c] = td;
    }
        var rows2 = [];
	for (i = 0; i < rows.length; i++) {
	    if (rows[i]) rows2.push(rows[i]);
	}
	return rows2;
}

function __squish__kiwi__matrix__getRows(table)
{
    var tds = __squish__getElementsByTagName(table, 'TD');
    var rows = [];
    for (var i = 0; i < tds.length; i++) {
        var td = tds[i];
        if (!td || ( td.className != '' && td.className != 'undefined' ) || ( td.firstChild.tagName != 'DIV' && !td.firstChild.className.startsWith('matrixSubCell') ) ) continue;
        var r = td.i;
        var c = td.j;
        if (r == undefined) continue;
        if (!rows[r]) rows[r] = [];
        if (!c) {c = rows[r].length; td.j = c;}
        if (c == undefined) continue;
        rows[r][c] = td;
    }
        var rows2 = [];
	for (i = 0; i < rows.length; i++) {
	    if (rows[i]) rows2.push(rows[i]);
	}
	return rows2;
}

function __squish__kiwi__matrix_numRows(table)
{
    var rows = __squish__kiwi__matrix__getRows(table);
    return rows.length;
}
function __squish__kiwi__matrix_numColumns(table)
{
    var rows = __squish__kiwi__matrix__getRows(table);
	var count = 0;
	for( var c = 0; c < rows[0].length; c++ ) {
	    if( rows[0][c] == undefined ) continue;
	    count++;
	}
    return count;
}

function __squish__kiwi__matrixtable_numRows(table)
{
    var rows = __squish__kiwi__matrixtable__getRows(table);
    return rows.length;
}
function __squish__kiwi__matrixtable_numColumns(table)
{
    var rows = __squish__kiwi__matrixtable__getRows(table);
	var count = 0;
	for( var c = 0; c < rows[0].length; c++ ) {
	    if( rows[0][c] == undefined ) continue;
	    count++;
	}
    return count;
}

function __squish__kiwi__matrixtable_caption(table, column, className)
{
    var spans = __squish__getElementsByTagName(table, 'DIV');
    var count = 0;
    for (var i = 0; i < spans.length; i++) {
        var span = spans[i];
        if (!span || !span.className || span.className != className)
            continue;
        if (count == column)
            return __squish__clean(span.innerText);
        ++count;
    }
    return undefined;
}

var __squish__kiwi__hookedFrames = [];
window.__squish__kiwi__queryPopupShown = false;
window.__squish__kiwi__messagePopupShown = false;
var __squish__kiwi__checkForNewPopupsTimer = null;

function __squish__kiwi__checkForNewPopups()
{
    for( var i = 0; i < __squish__kiwi__hookedFrames.length; i++ )
    {
        try {
            // Tries to find an element called "messageDiv" or "queryDiv"
            // (which is div) and checks its style property The style is "none"
            // for hidden dialogs and "inline" for non hidden ones according to
            // the karma sample application
            var w = __squish__kiwi__hookedFrames[i];
            if (!('__squish__kiwi__messagePopupShown_counter' in w)) w.__squish__kiwi__messagePopupShown_counter = new Number(0);
            if (!('__squish__kiwi__queryPopupShown_counter' in w)) w.__squish__kiwi__queryPopupShown_counter = new Number(0);
            if( w && w.document && w.document.body ) {
                // First try "messageDiv", if that fails try "queryDiv"
                // TODO: Instead of duplicating the code move this into a function
                var div = w.document.getElementById( "messageDiv" );
                if( div && div.style.display == 'inline' && !w.__squish__kiwi__messagePopupShown ) {
                    w.__squish__kiwi__messagePopupShown = true;
                    try {
                        __squish__sendXMLHttpRequest(w.document, 'eventHandler' + (new Date().getTime()) + '&name=KiwiPopupOpened', true);
                    } catch (e) {
                        // Ignore
                    }
                } else if(div && div.style.display == 'inline' && w.__squish__kiwi__messagePopupShown) {
                    // The popup is supposed to be handled within 10 seconds,
                    // so after 10 seconds, lets assume the first popup got
                    // closed and the next one is being opened already.
                    w.__squish__kiwi__messagePopupShown_counter += 1;
                    if (w.__squish__kiwi__messagePopupShown_counter > 100) {
                        w.__squish__kiwi__messagePopupShown = false;
                        w.__squish__kiwi__messagePopupShown_counter = 0;
                    }
                } else if( div && div.style.display == 'none' && w.__squish__kiwi__messagePopupShown ) {
                    w.__squish__kiwi__messagePopupShown = false;
                }
                div = w.document.getElementById( "queryDiv" );
                if( div && div.style.display == 'inline' && !w.__squish__kiwi__queryPopupShown ) {
                    w.__squish__kiwi__queryPopupShown = true;
                    try {
                        __squish__sendXMLHttpRequest(w.document, 'eventHandler' + (new Date().getTime()) + '&name=KiwiPopupOpened', true);
                    } catch (e) { 
                        // Ignore
                    }
                } else if(div && div.style.display == 'inline' && w.__squish__kiwi__queryPopupShown) {
                    w.__squish__kiwi__queryPopupShown_counter += 1;
                    if (w.__squish__kiwi__queryPopupShown_counter > 100) {
                        w.__squish__kiwi__queryPopupShown = false;
                        w.__squish__kiwi__queryPopupShown_counter = 0;
                    }
                } else if( div && div.style.display == 'none' && w.__squish__kiwi__queryPopupShown ) {
                    w.__squish__kiwi__queryPopupShown = false;
                }
            }
        } catch (_e) {
            // Ignore
        }
    }
}

function __squish__kiwi__hookInFrame( f )
{
    __squish__kiwi__hookedFrames.push( f );
    if( !__squish__kiwi__checkForNewPopupsTimer ) {
        __squish__kiwi__checkForNewPopupsTimer = setInterval(__squish__kiwi__checkForNewPopups, 500 );
    }
}

function __squish__kiwi__tree__find__item( tree, item )
{
    var __squish__node;
    var __squish__divs = __squish__getElementsByTagName(tree, 'DIV');
    var __squish__spans;
    
    for( var i = 0; i < __squish__divs.length; i++ ) {
        var __squish__div = __squish__divs[i];
        if( __squish__div.className && ( __squish__div.className == 'treeContent' || __squish__div.className == 'treeData' ) ) {
            __squish__spans = __squish__getElementsByTagName(__squish__div, 'SPAN');
            break;
        }        
    }
    
    for (var __squish__i = 0; __squish__i < __squish__spans.length; __squish__i++) {
        if (__squish__clean(__squish__spans[__squish__i].innerText) == __squish__clean(item )) {
            __squish__node = __squish__spans[__squish__i]; break;
       }
   }
   return __squish__node;
}

function __squish__kiwi__tree__is__selected( tree, node )
{
    var __squish__node = node.parentNode.parentNode;
    if (__squish__node) {
        return __squish__kiwi__tree__isNodeSelected( tree, __squish__node.nodeId);
    } else {
        return false;
    }
}

function __squish__kiwi__tree__is__open( node ) 
{
    var __squish__node = node.parentNode.parentNode.nextSibling;
    if (__squish__node) {
        return __squish__node.style.display == 'block';
    } else {
        return false;
    }
}

function __squish__kiwi__find__first__column__in__row( row, __squish__rows )
{
    for( var c = 0; c < __squish__rows[row].length; c++ ) {
		if( __squish__rows[row][c] != undefined ) {
            return __squish__rows[row][c];
        }
    }
    return undefined;
}

function __squish__kiwi__treetable__find__clickableelement( node )
{
    var tds = __squish__getElementsByTagName(node,  "TD" )
    for( var i = 0; i < tds.length; i++ ) {
        if( tds[i].className != undefined && tds[i].className.indexOf( 'gridCellText' ) == 0 ) {
            return tds[i].firstChild;
        }
    }
    return node;
}

function __squish__kiwi__choice__findEditor( combo )
{
    var __squish__cbbuttons = __squish__getElementsByTagName(combo, 'button');
    if( __squish__cbbuttons.length > 0 ) {
        return __squish__cbbuttons[0].previousSibling;
    } else {
        var __squish__spans = __squish__getElementsByTagName(combo, 'span');
        for( var i = 0; i < __squish__spans.length; i++ )
        {
            if( __squish__spans[i].id && __squish__spans[i].id == 'editor' ) {
                return __squish__spans[i];
            }
        }
    }
    return undefined;
}

function __squish__kiwi__choice__setSelected( combo, item, compareFunc )
{
    //The 'onfocusout' event is needed for cases where the combobox is embedded into a table
    //and it doesn't hurt standalone comboboxes according to the tests
    var __squish__cbinput = __squish__getElementsByTagName(combo, 'input')[0];
    var __squish__cbedit = __squish__kiwi__choice__findEditor( combo );
    var __squish__cbpopup = combo.ownerDocument.getElementById( combo.id + '***popupMenu');
    var __squish__cbpopup_display = combo.ownerDocument.getElementById('comboBoxPopupMenu');
    __squish__cbpopup_display.innerHTML = __squish__cbpopup.innerHTML;
    if (__squish__kiwi__typeOf(combo.parentNode) == 'kiwi_treetable_item' || __squish__kiwi__typeOf(combo.parentNode) == 'kiwi_table_item')
    {
        __squish__cbpopup_display.style.display = 'block';
        __squish__cbpopup_display.style.pixelWidth = 0;
        __squish__cbpopup_display.style.pixelHeight = 0;
    }
    var __squish__cbrows = __squish__getElementsByTagName(__squish__cbpopup_display, 'div');
    for (var i = 0; i < __squish__cbrows.length; i++) {
        if (compareFunc( __squish__cbrows[i], item ) ) {
            __squish__cbinput.value = __squish__cbrows[i].value;
            __squish__cbedit.innerHTML = __squish__cbrows[i].innerHTML;
            __squish__cbrows[i].className = 'comboBoxPopupMenuItemSelected';
            if (__squish__kiwi__typeOf(combo.parentNode) == 'kiwi_treetable_item' || __squish__kiwi__typeOf(combo.parentNode) == 'kiwi_table_item')
            {
                try {
                    var evt_keyDown = __squish__cbpopup.ownerDocument.createEventObject();
                    evt_keyDown.keyCode = 13;
                    __squish__cbedit.fireEvent('onkeydown',evt_keyDown);
                } catch (_e) {
                    // Ignore
                }
            }
            try {
                var evt_focustOut = __squish__cbpopup.ownerDocument.createEventObject();
                __squish__cbpopup.fireEvent('onfocusout',evt_focustOut);
            } catch (_e) {
                // Ignore
            }
            break;
        }
    }
}

function __squish__kiwi__choice__setSelectedOption( combo, text )
{
    __squish__kiwi__choice__setSelected( combo, text, 
            function( cbrow, item ) {
                return (__squish__clean(cbrow.innerText) == __squish__clean( item ) );
            }
    );
}

function __squish__kiwi__choice__setSelectedValue( combo, num )
{
    __squish__kiwi__choice__setSelected( combo, num, 
            function( cbrow, item ) {
                return (cbrow.value == item );
            }
    );
}

function __squish__kiwi__choice__selectedOption( combo )
{
     var __squish__cbedit = __squish__kiwi__choice__findEditor( combo );
     if( __squish__cbedit ) {
        return __squish__cbedit.innerText;
    }
    return '';
}

function __squish__kiwi__itemTextForEventObject( eventObject )
{
    var objType = __squish__kiwi__typeOf( eventObject );
    if (objType == 'kiwi_treenode_label') return eventObject.innerText;
    else if (objType == 'kiwi_more_menu') return __squish__menu_value["text"];
    else if (objType == 'kiwi_treenode_handle') return eventObject.nextSibling.innerText;
    else if (objType == 'kiwi_table_item') return eventObject.innerText;
    else if (objType == 'kiwi_treetable_item') return eventObject.innerText;
    else if (objType == 'kiwi_table_header') return eventObject.innerText;
    return undefined;
}

function __squish__kiwi__objectName( object )
{
    var objType = __squish__kiwi__typeOf( object );
    if (objType == 'kiwi_treenode_label') return __squish__kiwi__treeName(object);
    else if (objType == 'kiwi_more_menu') return __squish__menu_value["object"];
    else if (objType == 'kiwi_treenode_handle') return __squish__kiwi__treeName(object);
    else if (objType == 'kiwi_table_item') return __squish__kiwi__tableName(object);
    else if (objType == 'kiwi_treetable_item') return __squish__kiwi__tableName(object);
    else if (objType == 'kiwi_table_header') return __squish__kiwi__tableName(object);

    return undefined;
}

if (Squish.toolkitExtensions["Kiwi"].enabled) {
    Squish.addEventObjectHook(__squish__kiwi__eventObject);
    Squish.addTypeOfHook(__squish__kiwi__typeOf);
    Squish.addEventToStringHook(__squish__kiwi__eventToStr);
    Squish.addNameOfHook(__squish__kiwi__objectName);
    Squish.addItemTextForEventObjectHook(__squish__kiwi__itemTextForEventObject);
    window.__squish__hookInFrame__hooks.push(__squish__kiwi__hookInFrame);
    // The logic from eventObject in this extension is ok at the moment
    Squish.addPickableObjectHook(__squish__kiwi__eventObject);
}
