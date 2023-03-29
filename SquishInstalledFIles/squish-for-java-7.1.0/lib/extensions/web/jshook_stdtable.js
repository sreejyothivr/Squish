/**********************************************************************
 ** Copyright (C) 2005 - 2021 froglogic GmbH.
 ** Copyright (C) 2022 The Qt Company Ltd..
 ** All rights reserved.
 **********************************************************************/

/* global
__squish__styleInfo
Squish
*/

// This implements support for recognizing <table> elements as HTML_Table objects
// it supports both the old-style <table><tr><td> nesting as well as the newer <thead>/<tbody>
// childs for the table.
// The extension will not work with tables that contain non-TD/TR elements

// http://www.quirksmode.org/dom/w3c_html.html suggests there are possibly some easier ways to
// access bodies of a <table> element, but that only works for tbody-using tables and hence
// we'd have more logic to additionally handle the older types of tables.
// I case we do support modelling rows as distinct objects and allowing to retrieve their number
// the above url may be helpful in finding that number out without the necessity to count.

var __squish__standardtableExtension = {
    typeOf: function( htmlobj/*, noUnify*/ ) {
        if( htmlobj ) {
            if( htmlobj.tagName == 'TABLE' ) {
                return "htmltable___squish__standardtable";
            }
        }
        return undefined;
    },

    __getRowCells: function( trelem ) {
        var realcols = [];
        var cols = trelem.getElementsByTagName( "TD" );
        for( var i = 0; i < cols.length; ++i ) {
            // Only count direct children of the row, not any TD's from inner tables
            if( cols[i].parentNode == trelem ) {
                realcols.push( cols[i] );
            }
        }
        return realcols;
    },

    __getTableRows: function( htmlobj ) {
        var realrows = [];
        var trs = htmlobj.getElementsByTagName( "TR" );
        for( var i = 0; i < trs.length; ++i ) {
            // Only count table-rows that are not part of the header/footer area
            if( this.__belongsToTableBody( trs[i], htmlobj ) ) {
                realrows.push( trs[i] );
            }
        }
        return realrows;
    },

    __nodeText: function( elem ) {
        var txt = "";
        // This extracts text nodes from a DOM element and assembles a plain string from
        // them properly handling the case of embedded elements like <br /> or elements forming a block
        // <br /> is converted to single-linebreak, block-elements have their text content extracted
        // recursively and then a newline added before and after the content.
        // Whitespace around newlines is being removed from the result
        for( var i = 0; i < elem.childNodes.length; ++i ) {
            var node = elem.childNodes[i];
            var subtxt = ""
            if( node.nodeType == 1 ) {
                // Element nodes need special handling
                if( node.nodeName == 'BR' ) {
                    // BR should result in a newline
                    subtxt = '\n';
                } else {
                    var displayMode = (new __squish__styleInfo( node )).styleProperty("display");
                    if( displayMode == "none" ) {
                        // Ignore empty nodes
                        continue;
                    }
                    // For block-mode elements, add leading/trailing \n, list taken from W3C spec
                    // This does not handle run-in properly, since that would require looking at the next sibling and
                    // more importantly is implemented completely differently in different browsers. Hence run-in is
                    // always considered to be inline.
                    if( displayMode == "block" || displayMode == "inline-block" || displayMode.match( /^table/ ) || displayMode == 'list-item' ) {
                        subtxt += '\n';
                    }
                    subtxt += this.__nodeText( node );
                    if( displayMode == "block" || displayMode == "inline-block" || displayMode.match( /^table/ ) || displayMode == 'list-item' ) {
                        subtxt += '\n';
                    }
                }
            } else if( node.nodeType == 3 ) {
                // simplify any space characters inside a text node
                subtxt = node.nodeValue.replace( /[ \n\r\t\xa0]+/g, ' ' );
            } // Ignore all other node types
            txt += subtxt;
        }
        // Simplify all whitespace except newlines, then remove whitespace before and after newlines
        return txt.replace( /[ \r\t\xa0]+/g, ' ' ).replace( /[ ]+\n/g, '\n' ).replace( /\n[ ]+/g, '\n' );
    },

    cellText: function( cellElement ) {
        if( cellElement ) {
            // Remove leading/trailing whitespace from the text, having that is not very useful
            // nodeText generates the text content of the node in a way thats similar to what the user
            // sees rendered in the browser.
            return this.__nodeText( cellElement ).replace( /^[ ]+/g, '' ).replace( /[ ]+$/g, '');
        }
        return undefined;
    },

    cellAt: function( htmlobj, row, col ) {
        if( htmlobj ) {
            var rows = this.__getTableRows( htmlobj );
            if( rows.length > 0 && row >= 0 && row < rows.length ) {
                var cells = this.__getRowCells( rows[row] );
                if( cells.length > 0 && col >= 0 && col < cells.length ) {
                    return cells[col];
                }
            }
        }
        return undefined;
    },

    __belongsToTableBody: function( trelem, htmlobj ) {
        // Ensure the row is a content row for the given table, not part of the header or footer
        var tableParent = null;
        if( trelem.parentNode.tagName == 'TABLE' ) {
            tableParent = trelem.parentNode;
        } else if( trelem.parentNode.tagName == 'TBODY' ) {
            tableParent = trelem.parentNode.parentNode;
        }
        if ( tableParent && tableParent == htmlobj ) {
            // Ensure the row does not have any TH elements, which would indicate its a header-row
            // this is a bit cumbersome, since getElementsByTagName may return TH elements from
            // nested tables.
            var ths = trelem.getElementsByTagName( 'TH' );
            for( var i = 0; i < ths.length; ++i ) {
                if( ths[i].parentNode == trelem ) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    },

    cellTexts: function( htmlobj ) {
        if( htmlobj ) {
            // Contains a string value for all cells in the format:
            // <cellcontent>$<cellcontent>$|<cellcontent>$<cellcontent>$|
            // So cells are always ended with a $ and rows always end in a |
            // This is done instead of a simple join() since it avoids keeping an array around
            // and makes parsing the whole thing again in C++ a bit easier
            var result = "";
            var rows = this.__getTableRows( htmlobj );
            if( rows.length > 0 ) {
                for( var i = 0; i < rows.length; ++i ) {
                    var cols = this.__getRowCells( rows[i] );
                    for( var j = 0; j < cols.length; ++j ) {
                        var txt = this.cellText( cols[j] ).replace( /\\/g, '\\\\' ).replace( /\$/g, '\\$' ).replace( /\|/g, '\\|' );
                        result += txt+"$";
                    }
                    result += "|";
                }
            }
            return result;
        }
        return undefined;
    },

    rowCount: function( htmlobj ) {
        if( htmlobj ) {
            return this.__getTableRows( htmlobj ).length;
        }
        return -1;
    },

    columnCount: function( htmlobj ) {
        if( htmlobj ) {
            var trs = this.__getTableRows( htmlobj );
            if( trs.length > 0 ) {
                return this.__getRowCells( trs[0] ).length;
            }
        }
        return -1;
    }
};

Squish.addTypeOfHookWithPriority( __squish__standardtableExtension.typeOf, 10 );
