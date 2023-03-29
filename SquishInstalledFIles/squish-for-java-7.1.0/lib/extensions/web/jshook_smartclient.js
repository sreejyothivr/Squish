// This extension handles the SmartClient JS toolkit
// note that this toolkit is also used internally for the SmartGWT extension for the GWT toolkit
// and hence SmartGWT is also covered by this extension file

// Need to set a variable on window, since accessing isc on some pages causes JS exception, for example
// google.com's service login

/* global
isc
Squish
*/

window.__squish__smartclientFound = false;
window.__squish__isSmartclientFound = function()
{
    if (window.__squish__smartclientFound) {
        return true;
    }

    try {
        if( isc ) {
            window.__squish__smartclientFound = true;
            overrideItemLocator();
        }
    } catch (__e) {
        // Ignore
    }
    return window.__squish__smartclientFound;
}

function overrideItemLocator()
{
if (isc && isc.DynamicForm ) {
    // The following override is based on the original code in AutoTest.js in the smartclient
    // library. Needed to customize when the value property is added since the framework does
    // not escape its locator strings and hence the locator is useless with items that allow
    // user input if the value is part of the locator.
    // TODO: Check this usage with Harri regarding license, smartclient is available as LGPL
    /*
     * Isomorphic SmartClient
     * Version SC_SNAPSHOT-2011-01-06 (2011-01-06)
     * Copyright(c) 1998 and beyond Isomorphic Software, Inc. All rights reserved.
     * "SmartClient" is a trademark of Isomorphic Software, Inc.
     *
     * licensing@smartclient.com
     *
     * http://smartclient.com/license
     */

    isc.DynamicForm.addProperties({
        getItemLocator : function (item) {

            // containerItems contain sub items, which point back up to them via the
            // parentItem attribute
            // If we hit a sub-item of a container item, call getItemLocator on that so
            // the item is located within the containerItem's items array
            // This method is copied from DF to containerItems below
            // the check for item.parentItem != this is required - if this is running
            // on a container item and we contain an item in our items array we need to
            // allow standard identifier construction to continue or we'd have an infinite loop
            if (item.parentItem && (item.parentItem != this)) {
                return this.getItemLocator(item.parentItem) + "/" +
                            item.parentItem.getItemLocator(item);
            }

            var itemIdentifiers = {};

            if (item.name != null) itemIdentifiers.name = item.name;

            // Title - default strategy if no name
            var title = item.getTitle();
            if (title != null) itemIdentifiers.title = title;

            // Value - useful for things like header items where value is pretty much
            // a valid identifier
            var value = item.getValue();
            // Only use value if we do not have an editable item, like textarea, combobox, textfield
            // since the AutoTest framework does not escape the characters used in their locators.
            if( !( smartclientExtension._iscIsA( 'TextItem', item ) || smartclientExtension._iscIsA( 'TextAreaItem', item ) || smartclientExtension._iscIsA( 'ComboBoxItem', item ) ||
                    smartclientExtension._iscIsA( 'RichTextItem', item ) || smartclientExtension._iscIsA( 'PasswordItem', item ) || smartclientExtension._iscIsA( 'FileItem', item ) ||
                    smartclientExtension._iscIsA( 'MultiFileItem', item ) || smartclientExtension._iscIsA( 'ComboBoxItem', item ) || smartclientExtension._iscIsA( 'SelectItem', item ) ) ||
                    smartclientExtension._iscIsA( 'CheckboxItem', item ) || smartclientExtension._iscIsA( 'RadioItem', item ) || smartclientExtension._iscIsA( 'RadioGroupItem', item ) ) {
                if (value != null) itemIdentifiers.value = value;
            }

            // Index - cruder identifier
            // Do not use index on combobox or select-item since that means our name changes
            // and hence the selectOption and successive verifications use different names.
            if( !( smartclientExtension._iscIsA( 'ComboBoxItem', item ) || smartclientExtension._iscIsA( 'SelectItem', item ) ) ) {
                itemIdentifiers.index = this.getItems().indexOf(item);
            }

            // ClassName: Not used by default
            itemIdentifiers.Class = item.getClassName();

            var IDString = isc.AutoTest.createLocatorFallbackPath("item", itemIdentifiers);
            return IDString;
        }
    });
}

}

// Extension object for the item-access of ListGrid objects
var squishsclistgridExtension = new Object;

// Customized clickItem for boolean types since those sometimes only react to clicks inside
// the checkbox
squishsclistgridExtension.supportsClickItem = function() {
    return true;
}

squishsclistgridExtension._findIMGChild = function( elem ) {
    if( elem ) {
        if( elem.tagName == 'IMG' ) {
            return elem;
        }
        var child = elem.firstChild;
        while( child ) {
            var found = squishsclistgridExtension._findIMGChild( child );
            if( found ) {
                return found;
            }
            child = child.nextSibling;
        }
    }
    return undefined;
}

squishsclistgridExtension.clickItem = function( itemelem, ctrl, shift, alt, x, y, button  ) {
    // This function is customized since in some cases clicking an item element
    // is not sufficient to trigger the visual changes related to it. In
    // particular a clickItem going into a boolean field needs to happen on the
    // IMG element (coordinate-wise at least, the GridRenderer does not care
    // about the source element much), otherwise the ListGrid does not consider the
    // checkbox to be hit since we click into the upper-left area of the item instead of
    // the middle where the checkbox is.
    // TODO: If this logic turns out to be a bottle-neck one could consider finding all
    // IMG elements under itemelem and check whether they match the checked/unchecked item url
    // that ListGrid uses. That would avoid going through the list of all records.
    if( smartclientExtension.isSmartClientLoaded() ) {
        var itemobj = smartclientExtension._getISCObject( itemelem );
        if( itemobj && ( itemobj instanceof smartclientExtension.ListGridItemISCObjectDummy ) ) {
            // Only check fields that are of type boolean, for all others a simple click suffices
            var fields = itemobj.view.getFields();
            var rowCount = itemobj.view.getTotalRows();
            var gridbody = itemobj.view.body;
            for( var i = 0; i < fields.length; i++ ) {
                var field = fields[i];
                if( field.type == "boolean" ) {
                    // Now check all rows for this field
                    for( var j = 0; j < rowCount; j++ ) {
                        if( gridbody.getTableElement( j, field.masterIndex ) == itemelem ) {
                            // Found the matching item, now find the img element for this item
                            // Find first IMG child, thats where we need to click on
                            var child = squishsclistgridExtension._findIMGChild( itemelem );
                            if( child ) {
                                // IMG of a matching bool-item found, click the IMG element
                                Squish.mouseClick( child, ctrl, alt, shift, x, y, button );
                                return;
                            }
                        }
                    }
                }
            }
        }
    }
    // Fallback if the above did not succeed
    Squish.mouseClick( itemelem, ctrl, alt, shift, x, y, button );
}

squishsclistgridExtension.supportsDoubleClickItem = function() {
    // Need to customize double-clicks due to a bug in Smartclient library. The
    // custom double-click detection in SmartClient breaks with Firefox and
    // "native-event" timestamps since those are in microseconds. The SC
    // library however expects milliseconds and its double-click-timeout is set
    // in milliseconds. The difference of two click-events dispatched by Squish
    // is a few milliseconds, but due to seeing microsecond values the SC
    // library thinks its a few thousand milliseconds. Which is of course
    // larger than its usual double-click-timeout.  The events produced by
    // Firefox from native events have no time difference if they are to be
    // considered a double-click, so it seems firefox itself also has its own
    // double-click detection and injects the events with corresponding
    // timestamps
    // Selenium has the same problem apparently, does not seem like SC provides a solution so far:
    // http://forums.smartclient.com/showthread.php?t=12440&highlight=double+click
    return true;
}

squishsclistgridExtension.doubleClickItem = function( itemelem, ctrl, shift, alt, x, y ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var grid = smartclientExtension._getListGridObject( itemelem );
        if( smartclientExtension._iscIsA( 'ListGrid', grid ) && smartclientExtension._iscIsA( 'GridRenderer', grid.body ) ) {
            var info = smartclientExtension._visitListGridItems( grid,
                                function( grid, rowNum, record, field ) {
                                    var body = grid.body;
                                    var item = body.getTableElement( rowNum, field.masterIndex );
                                    if( item == itemelem ) {
                                        return {'col':field.masterIndex, 'record':record, 'row': rowNum};
                                    }
                                    return undefined;
                                }
                        );
            if( info ) {
                var row = info["row"];
                var col = info["col"];
                // Logic partially taken from GridRenderer.js/doubleClick function
                if( grid.body.cellIsEnabled(row, col) ) {
                    // don't let SC think its a synthesized event
                    if( grid.body.cellDoubleClick ) {
                        grid.body.cellDoubleClick( info["record"], row, col );
                        return;
                    } else if( grid.body.rowDoubleClick ) {
                        grid.body.rowDoubleClick( info["record"], info["row"], info["col"], false );
                        return;
                    }
                    // Fallback to normal click, this probably won't work in
                    // Firefox due to the SC bug mentioned in
                    // supportsDoubleClick but its the most meaningful fallback
                    // we can do
                }
            }
        }
    }
    // Make sure we always at least try to click.
    Squish.doubleClick( itemelem, ctrl, shift, alt, x, y );
}

squishsclistgridExtension.findItemByRowAndColumn = function( htmltree, row, col ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var grid = smartclientExtension._getListGridObject( htmltree );
        if( grid && smartclientExtension._iscIsA( 'ListGrid', grid ) ) {
            return grid.body.getTableElement( row, col );
        }
    }
    return undefined;
}

squishsclistgridExtension.findItem = function( htmltree, itemtext ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var item = smartclientExtension._visitListGridItems( smartclientExtension._getListGridObject( htmltree ),
                function( grid, rowNum, record, field ) {
                    // Clean the value since thats what happens during recording.
                    if( Squish.cleanString( smartclientExtension._getListGridCellValue( record, field, grid ) ) == itemtext ) {
                        // Fetch the table element based on the row number and the masterIndex of the field
                        // even though not really documented the masterIndex seems to be the column number of
                        // the field in the table
                        var body = grid.body;
                        var item = body.getTableElement(rowNum, field.masterIndex);
                        return item;
                    }
                    return undefined;
                }
        );
        return item;
    }
    return undefined;
}

squishsclistgridExtension.itemText = function( itemelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var grid = smartclientExtension._getListGridObject( itemelem );
        var itemText = smartclientExtension._visitListGridItems( grid,
                    function( grid, rowNum, record, field ) {
                        var body = grid.body;
                        var item = body.getTableElement( rowNum, field.masterIndex );
                        if( item == itemelem ) {
                            // Clean the string since thats whats used for the recording and what findItem
                            // expects
                            return Squish.cleanString( smartclientExtension._getListGridCellValue( record, field, grid ) );
                        }
                        return undefined;
                    }
            );
        return itemText;
    }
    return undefined;
}

squishsclistgridExtension.setItemSelected = function( itemelem, selected ) {
    var gridobj = smartclientExtension._getListGridObject( itemelem );
    if( gridobj.body.canSelectCells ) {
        // TODO: Implement this, but there's no example of smartclient grids with cell-selection
    } else {
        var record = smartclientExtension._visitListGridItems( gridobj, function( grid, rowNum, record, field ) {
            if( grid.body.getTableElement( rowNum, field.masterIndex ) == itemelem ) {
                return record;
            }
            return undefined;
        });
        if( record ) {
            gridobj.selection.setSelected( record, selected );
        }
    }
}

squishsclistgridExtension.parentItem = function( /*itemelem*/ ) {
    // Grids do not support nesting
    return undefined;
}

squishsclistgridExtension.nextSibling = function( itemelem, colNum ) {
    var gridobj = smartclientExtension._getListGridObject( itemelem );
    var info = smartclientExtension._visitListGridItems( gridobj, function( grid, rowNum, record, field ) {
        if( grid.body.getTableElement( rowNum, field.masterIndex ) == itemelem ) {
            return { "rowNum":rowNum, "field":field.masterIndex };
        }
        return undefined;
    });
    if( info ) {
        if( !colNum || colNum < 0 ) {
            colNum = info["field"];
        }
        try {
            var obj = gridobj.body.getTableElement( info["rowNum"] + 1, colNum );
            return obj;
        } catch( _e ) {
            // No such element, fallthrough
        }
    }
    return undefined;
}

squishsclistgridExtension.isItemSelected = function( itemelem ) {
    var gridobj = smartclientExtension._getListGridObject( itemelem );
    var selection = gridobj.getSelection();
    if( selection && gridobj.body.canSelectCells ) {
        // Selection of cells possible, need to check the column too.
        var selectedcells = selection.getSelectedCells();
        for( var i = 0; i < selectedcells.length; i++ ) {
            var selectedcell = selectedcells[i];
            var tableelem = gridobj.body.getTableElement( selectedcell[0], selectedcell[1] );
            if( tableelem == itemelem ) {
                return true;
            }
        }
    } else if( selection ) {
        // Find the record belonging to the item element
        var record = smartclientExtension._visitListGridItems( gridobj, function( grid, rowNum, record, field ) {
            if( grid.body.getTableElement( rowNum, field.masterIndex ) == itemelem ) {
                return record;
            }
            return undefined;
        });
        if( record ) {
            // Users can only select whole rows, so checking the record for being selected is enough
            return gridobj.body.isSelected( record ) || gridobj.body.isPartiallySelected( record );
        }
    }
    return undefined;
}

squishsclistgridExtension.columnCaption = function( viewelem, colNum ) {
    var gridobj = smartclientExtension._getListGridObject( viewelem );
    var fields = gridobj.getFields();
    for( var i = 0; i < fields.length; i++ ) {
        if( fields[i].masterIndex == colNum ) {
            return fields[i].title;
        }
    }
    return "";
}

squishsclistgridExtension.numColumns = function( viewelem ) {
    var gridobj = smartclientExtension._getListGridObject( viewelem );
    return gridobj.getFields().length;
}

squishsclistgridExtension.numRows = function( viewelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var gridobj = smartclientExtension._getListGridObject( viewelem );
        // Only handle viewelem if it is the grid itself in this extension
        if( gridobj && smartclientExtension._iscIsA( 'ListGrid', gridobj ) && viewelem == smartclientExtension._getHandleForISCObject( gridobj ) ) {
            return gridobj.getTotalRows();
        }
    }
    return -1;
}

squishsclistgridExtension.itemView = function( itemelem ) {
    return smartclientExtension._getListGridObject( itemelem ).getHandle();
}
squishsclistgridExtension.itemHandle = function( /*itemelem*/ ) {
    return undefined;
}

squishsclistgridExtension.isItemOpen = function( itemelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var grid = smartclientExtension._getListGridObject( itemelem );
        // This only works for listgrid's since the expansion there is different from an open tree item
        if( smartclientExtension._iscIsA( 'ListGrid', grid ) && !smartclientExtension._iscIsA( 'TreeGrid', grid ) ) {
            var record = smartclientExtension._findListGridRecord( grid, itemelem );
            if( record ) {
                return record.expanded;
            }
        }
    }
    return false;
}

squishsclistgridExtension.childItem = function( viewelem, colNum ) {
    // No support for nested items
    if( smartclientExtension.getType( viewelem ) != smartclientExtension.ListGrid ) {
        return undefined;
    }
    var gridobj = smartclientExtension._getListGridObject( viewelem );
    if( !colNum || colNum < 0 ) {
        colNum = 0;
    }
    try {
        return gridobj.body.getTableElement( 0, colNum );
    } catch( _e ) {
        // No such item
    }
    return undefined;
}

squishsclistgridExtension.itemColumn = function( itemelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var grid = smartclientExtension._getListGridObject( itemelem );
        if( smartclientExtension._iscIsA( 'ListGrid', grid ) ) {
            var columinfo = smartclientExtension._visitListGridItems( grid, function( grid, rownum, record, field ) {
                if( grid.body.getTableElement( rownum, field.masterIndex ) == itemelem ) {
                    return {'colum':field.masterIndex};
                }
                return undefined;
            });
            if( columinfo ) {
                return columinfo['colum'];
            }
        }
    }
    return -1;
}

squishsclistgridExtension.itemRow = function( itemelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var grid = smartclientExtension._getListGridObject( itemelem );
        if( smartclientExtension._iscIsA( 'ListGrid', grid ) ) {
            var rowinfo = smartclientExtension._visitListGridItems( grid, function( grid, rownum, record, field ) {
                if( grid.body.getTableElement( rownum, field.masterIndex ) == itemelem ) {
                    return {'row':rownum};
                }
                return undefined;
            });
            if( rowinfo ) {
                return rowinfo['row'];
            }
        }
    }
    return -1;
}

// Extension for TreeGrid objects, based off of the listgrid support as much as possible
var squishsctreegridExtension = new Object;

squishsctreegridExtension.findItem = squishsclistgridExtension.findItem;
squishsctreegridExtension.itemText = squishsclistgridExtension.itemText;
squishsctreegridExtension.setItemSelected = squishsclistgridExtension.setItemSelected;
squishsctreegridExtension.isItemSelected = squishsclistgridExtension.isItemSelected;
squishsctreegridExtension.columnCaption = squishsclistgridExtension.columnCaption;
squishsctreegridExtension.numColumns = squishsclistgridExtension.numColumns;
squishsctreegridExtension.itemView = squishsclistgridExtension.itemView;
squishsctreegridExtension.supportsDoubleClickItem = squishsclistgridExtension.supportsDoubleClickItem;
squishsctreegridExtension.doubleClickItem = squishsclistgridExtension.doubleClickItem;
squishsctreegridExtension.findItemByRowAndColumn = function( parentObj, row, col ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var grid = smartclientExtension._getListGridObject( parentObj );
        if( smartclientExtension._iscIsA( 'TreeGrid', grid ) ) {
            var childs = undefined;
            if( parentObj == smartclientExtension._getHandleForISCObject( grid ) ) {
                // Special case, since there's no real parent-record that is findable with the
                // visit-function. Hence hardcode accessing the root
                childs = grid.data.getChildren( grid.data.getRoot() );
            } else {
                var parentrecordinfo = smartclientExtension._visitListGridItems( grid,
                        function( grid, rowNum, record, field ) {
                            if( grid.body.getTableElement( rowNum, field.masterIndex ) == parentObj ) {
                                return {'record':record, 'field': field, 'globalRow': rowNum };
                            }
                            return undefined;
                        });
                if( parentrecordinfo && grid.data.isFolder(parentrecordinfo['record']) ) {
                    childs = grid.data.getChildren( parentrecordinfo['record'] );
                }
            }
            if( childs ) {
                // getRecordIndex gives us the listgrid-global-row-number for the record that is
                // retrieved from the childlist
                return grid.body.getTableElement( grid.getRecordIndex( childs.get( row ) ), col );
            }
        }
    }
    return undefined;
}
squishsctreegridExtension.itemRow = function( itemElem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var grid = smartclientExtension._getListGridObject( itemElem );
        if( smartclientExtension._iscIsA( 'TreeGrid', grid ) ) {
            var record = smartclientExtension._findListGridRecord( grid, itemElem );
            if( record ) {
                // findChildNum should return the number of the child record given its name and parent
                return grid.data.findChildNum( grid.data.getParent( record ), grid.data.getName( record ) );
            }
        }
    }
    return -1;
}
squishsctreegridExtension.itemColumn = function( itemElem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var grid = smartclientExtension._getListGridObject( itemElem );
        if( smartclientExtension._iscIsA( 'TreeGrid', grid ) ) {
            var fieldNum = smartclientExtension._visitListGridItems( grid,
                    function( grid, rowNum, record, field ) {
                        if( grid.body.getTableElement( rowNum, field.masterIndex ) == itemElem ) {
                            return {'fieldNum':field.masterIndex};
                        }
                        return undefined;
                    });
            if( fieldNum ) {
                return fieldNum['fieldNum'];
            }
        }
    }
    return -1;
}
squishsctreegridExtension.numRows = function( itemViewOrParentItem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var grid = smartclientExtension._getListGridObject( itemViewOrParentItem );
        if( smartclientExtension._iscIsA( 'TreeGrid', grid ) ) {
            if( itemViewOrParentItem == smartclientExtension._getHandleForISCObject( grid ) ) {
                // Checking number of rows for itemview itself, need to use the hidden-root
                return grid.data.getChildren( grid.data.getRoot() ).getLength();
            } else {
                // got a parent item, so find its record
                var recordinfo = smartclientExtension._visitListGridItems( grid,
                        function( grid, rowNum, record, field ) {
                            if( grid.body.getTableElement( rowNum, field.masterIndex ) == itemViewOrParentItem ) {
                                return { 'record':record,'globalRow':rowNum,'field':field }
                            }
                            return undefined;
                        });
                if( recordinfo ) {
                    // And calculate the number of children if the column is the tree-column
                    if( recordinfo['field'].masterIndex == grid.getTreeFieldNum() ) {
                        return grid.data.getChildren(recordinfo['record']).getLength();
                    } else {
                        // For all items that are in a column other than the expandable one, return 0
                        return 0;
                    }
                }
            }
        }
    }
    return -1;
}
squishsctreegridExtension.parentItem = function( itemelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var grid = smartclientExtension._getListGridObject( itemelem );
        if( smartclientExtension._iscIsA( 'TreeGrid', grid ) ) {
            var record = smartclientExtension._visitListGridItems( grid,
                            function( grid, rowNum, record, field ) {
                                var body = grid.body;
                                var item = body.getTableElement( rowNum, field.masterIndex );
                                if( item == itemelem ) {
                                    return record;
                                }
                                return undefined;
                            }
                    );
            if( record ) {
                var parentRec = grid.data.getParent( record );
                // handle the case of the root-node being the parent, in that case we do not
                // want to return something.
                if( parentRec != grid.data.getRoot() ) {
                    return grid.body.getTableElement( grid.getRecordIndex( parentRec ), grid.getTreeFieldNum() );
                }
            }
        }
    }

    return undefined;
}
squishsctreegridExtension._isOpenImg = function( elem, url ) {
    if( elem && elem.tagName == 'IMG' && elem.src == url ) {
        // Found the open icon, return it as element
        return true;
    }
    if ( elem && elem.tagName == 'SPAN' && elem.getAttribute("style").indexOf(url) != -1 ) {
        return true;
    }

    return false;
}
squishsctreegridExtension.itemHandle = function( itemelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var grid = smartclientExtension._getListGridObject( itemelem );
        if( smartclientExtension._iscIsA( 'TreeGrid', grid ) ) {
            var info = smartclientExtension._visitListGridItems( grid,
                                function( grid, rowNum, record, field ) {
                                    var body = grid.body;
                                    var item = body.getTableElement( rowNum, field.masterIndex );
                                    if( item == itemelem ) {
                                        return {'row':rowNum, 'col':field.masterIndex, 'record':record};
                                    }
                                    return undefined;
                                }
                        );
            if( grid.data.isFolder( info['record'] ) ) {
                // TODO: What if showOpener == false in the tree, does such a tree allow open/close at all?
                var childs = itemelem.getElementsByTagName("TD");
                var iconurl = grid.getImgURL( grid.getOpenIcon( info['record'] ) );
                for( var i = 0; i < childs.length; i++ ) {
                    // Use the first child of the TD, this will either give us
                    // a NOBR element, or a text node or the IMG element - or
                    // undefined if there's no child. The isOpenImg check works
                    // on the IMG element only.
                    if( childs[i].childNodes.length > 0 ) {
                        var child = childs[i].childNodes[0];
                        if( child && child.tagName == 'NOBR' ) {
                            // IE and Safari/Webkit get a <nobr> and inside that are the icons
                            var subchild = child.firstChild;
                            while( subchild ) {
                                if( squishsctreegridExtension._isOpenImg( subchild, iconurl ) ) {
                                    return subchild;
                                }
                                subchild = subchild.nextSibling;
                            }
                        } else if( child && squishsctreegridExtension._isOpenImg( child, iconurl ) ) {
                            return child;
                        }
                    }
                }
            }
        }
    }
    return undefined;
}
squishsctreegridExtension.isItemOpen = function( itemelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var grid = smartclientExtension._getListGridObject( itemelem );
        if( smartclientExtension._iscIsA( 'TreeGrid', grid ) ) {
            var record = smartclientExtension._findListGridRecord( grid, itemelem );
            if( record ) {
                return grid.data.isOpen( record );
            }
        }
    }
    return false;
}

squishsctreegridExtension.setItemOpen = function( itemelem, open ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var grid = smartclientExtension._getListGridObject( itemelem );
        if( smartclientExtension._iscIsA( 'TreeGrid', grid ) ) {
            var record = smartclientExtension._visitListGridItems( grid,
                                function( grid, rowNum, record, field ) {
                                    var body = grid.body;
                                    var item = body.getTableElement( rowNum, field.masterIndex );
                                    if( item == itemelem ) {
                                        return record;
                                    }
                                    return undefined;
                                }
                        );
            if( record && grid.data.isOpen( record ) != open ) {
                grid.toggleFolder( record );
            }
        }
    }
}

// Need to implement this separately since the listgrid-extension will also find subchilds as
// next sibling due to operating on the grid-rows which always include all visible items
squishsctreegridExtension.nextSibling = function( itemelem, colNum ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        if( !colNum || colNum < 0 ) {
            colNum = 0;
        }

        var grid = smartclientExtension._getListGridObject( itemelem );
        if( smartclientExtension._iscIsA( 'TreeGrid', grid ) ) {
            var recordinfo = smartclientExtension._visitListGridItems( grid,
                    function( grid, rowNum, record, field ) {
                        if( grid.body.getTableElement( rowNum, field.masterIndex ) == itemelem ) {
                            return {'record':record, 'field':field, 'globalRow':rowNum};
                        }
                        return undefined;
                    });
            if( recordinfo ) {
                // Calculate the next record based on the parent of the current record
                var parentRecord = grid.data.getParent( recordinfo['record'] );
                var childNum = grid.data.findChildNum( parentRecord, grid.data.getName( recordinfo['record'] ) );
                // Take care of the fact of not finding the number, should not happen though
                if( childNum >= 0 ) {
                    var children = grid.data.getChildren( parentRecord );
                    // Make sure that we're not trying to get past the list of children records
                    if( childNum < children.getLength() - 1 ) {
                        var nextRecord = children.get(childNum+1);
                        return grid.body.getTableElement( grid.getRecordIndex( nextRecord ), colNum );
                    }
                }
            }
        }
    }
    return undefined;
}
squishsctreegridExtension.childItem = function( viewelem, colNum ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        if( !colNum || colNum < 0 ) {
            colNum = 0;
        }
        var grid = smartclientExtension._getListGridObject( viewelem );
        if( smartclientExtension._iscIsA( 'TreeGrid', grid ) ) {
            if( viewelem == smartclientExtension._getHandleForISCObject( grid ) ) {
                // Fetch top-level element, similar to listgrid-implementation
                // but that one checks the smartclientExtension.getType so
                // cannot be called directly
                try {
                    return grid.body.getTableElement( 0, colNum );
                } catch( _e ) {
                    // No such item
                }
            } else {
                var recordinfo = smartclientExtension._visitListGridItems( grid,
                                function( grid, rowNum, record, field ) {
                                    var body = grid.body;
                                    var item = body.getTableElement( rowNum, field.masterIndex );
                                    if( item == viewelem ) {
                                        // Need the field to determine whether children should be shown
                                        // at all.
                                        return {'record':record, 'field':field};
                                    }
                                    return undefined;
                                }
                        );
                // Only supply children for the element if its the cell where
                // the tree-handle is shown. All other columns for the same
                // record should not return children
                if( recordinfo && recordinfo['field'].masterIndex == grid.getTreeFieldNum() ) {
                    var childs = grid.data.getChildren( recordinfo['record'] );
                    if( childs.length > 0 ) {
                        var rowNum = grid.getRecordIndex( childs[0] );
                        try {
                            return grid.body.getTableElement( rowNum, colNum );
                        } catch( e ) {
                            // Fallthrough, no such element
                        }
                    }
                }
            }
        }
    }
    return undefined;
}
squishsctreegridExtension.supportsClickItem = function() {
    // Allows to customize click behaviour for tree items, necessary since otherwise
    // the click always ends up on the tree handle and not on the item if the item is
    // in the treefield-column
    return true;
}

squishsctreegridExtension.clickItem = function( itemelem, ctrl, shift, alt, x, y, button ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var grid = smartclientExtension._getListGridObject( itemelem );
        if( smartclientExtension._iscIsA( 'TreeGrid', grid ) ) {
            var info = smartclientExtension._visitListGridItems( grid,
                                function( grid, rowNum, record, field ) {
                                    var body = grid.body;
                                    var item = body.getTableElement( rowNum, field.masterIndex );
                                    if( item == itemelem ) {
                                        return {'col':field.masterIndex, 'record':record};
                                    }
                                    return undefined;
                                }
                        );
            // Check if we're trying to click onto an item in the treefield-column
            if( info && grid.getTreeFieldNum() == info['col'] ) {
                // Tree column, so adjust the element to click on, find the open-image
                // element and take the next sibling of its parent TD element. Thats
                // the element containing the items text so should be good to click on.
                // Relies on internal structuring of SmartGWT, can break in future versions
                // but the API does not provide a way of getting at the right element.
                var tdchilds = itemelem.getElementsByTagName( "TD" );
                var iconurl = grid.getImgURL( grid.getOpenIcon( info['record'] ) );
                for( var i = 0; i < tdchilds.length; i++ ) {
                    var td = tdchilds[i];
                    var imgchilds = td.getElementsByTagName( "IMG" );
                    var foundelement = false;
                    for( var j = 0; j < imgchilds.length; j++ ) {
                        if( squishsctreegridExtension._isOpenImg( imgchilds[j], iconurl ) ) {
                            itemelem = td.nextSibling;
                            foundelement = true;
                            break;
                        }
                    }
                    if( foundelement ) {
                        break;
                    }
                }
            }
        }
    }
    // Make sure we always at least try to click.
    Squish.mouseClick( itemelem, ctrl, shift, alt, x, y, button );
}

squishsctreegridExtension.checkTreeItem = function( gridelem, itemText ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var grid = smartclientExtension._getListGridObject( gridelem );
        if( smartclientExtension._iscIsA( 'TreeGrid', grid ) ) {
            var info = smartclientExtension._visitListGridItems( smartclientExtension._getListGridObject( gridelem ),
                    function( grid, rowNum, record, field ) {
                        // Clean the value since thats what happens during recording.
                        if( Squish.cleanString( smartclientExtension._getListGridCellValue( record, field, grid ) ) == itemText ) {
                            return {'record':record, 'field':field,'row':rowNum};
                        }
                        return undefined;
                    }
            );
            if( info && grid.body.canSelectRecord( info['record'] ) ) {
                var record = info['record'];
                if( grid.selection.isSelected( record ) || grid.selection.isPartiallySelected( record ) ) {
                    grid.deselectRecord( record );
                } else {
                    grid.selectRecord( record );
                }
            }
        }
    }
}

// Extension object for the access to SmartClient ComboBoxes
var squishsccomboboxExtension = new Object;
squishsccomboboxExtension.getSelectedOption = function( comboboxelem ) {
    var combobox = smartclientExtension._getComboBoxObject( comboboxelem );
    if( combobox ) {
        return combobox.getValue();
    }
    return undefined;
}


squishsccomboboxExtension.getLabel = function( comboboxelem ) {
    var combobox = smartclientExtension._getComboBoxObject( comboboxelem );
    if( combobox ) {
        return combobox.getTitle();
    }
    return undefined;
}

squishsccomboboxExtension.setSelectedOption = function( comboboxelem, optionstr ) {
    var combobox = smartclientExtension._getComboBoxObject( comboboxelem );
    if( smartclientExtension.getType( comboboxelem ) == smartclientExtension.ComboBoxItem && combobox ) {
        smartclientExtension._setValueForFormItem( combobox, optionstr );
    } else {
        throw "Cannot find combobox object for element";
    }
}

squishsccomboboxExtension.hasOption = function( comboboxelem, optionstr ) {
    var combobox = smartclientExtension._getComboBoxObject( comboboxelem );
    if( combobox ) {
        // For datasource-bound selectitemes we cannot easily determine whether the given
        // string is in the list of records since the API for that is inherently asynchronous,
        // and finding a suitable record may take considerable time (which can cause the JS-timeout
        // to hit). So we do not check for existence of the options in such a case and simply let the
        // selectOption fail silently a following verification should notice the problem anyway.
        if( combobox.getOptionDataSource() != null ) {
            return true;
        }
        if( combobox.pickList == null || combobox.pickList.destroyed ) combobox.makePickList( false );
        // This is a PickListMenu object, subclassing ListGrid
        var pickList = combobox.pickList;
        var valueField = combobox.getValueFieldName();
        var rowCount = pickList.getTotalRows();
        for( var i = 0; i < rowCount; i++ ) {
            var record = pickList.getRecord( i, 0 );
            if( record && record[valueField] == optionstr ) {
                return true;
            }
        }
    }
    return undefined;
}

// Extension object for the access to SmartClient SelectItem
var squishscselectitemExtension = new Object;
squishscselectitemExtension.getSelectedOptions = function( selectitemelem ) {
    var selectitem = smartclientExtension._getSelectItemObject( selectitemelem );
    if( selectitem ) {
        return selectitem.getValue();
    }
    return undefined;
}

squishscselectitemExtension.getLabel = function( selectitemelem ) {
    var selectitem = smartclientExtension._getSelectItemObject( selectitemelem );
    if( selectitem ) {
        return selectitem.getTitle();
    }
    return undefined;
}

squishscselectitemExtension.setSelectedOptions = function( selectitemelem, optionstr ) {
    var selectitem = smartclientExtension._getSelectItemObject( selectitemelem );
    if( smartclientExtension.getType( selectitemelem ) == smartclientExtension.SelectItem && selectitem ) {
        // SmartGWT accepts an array as value for a multi-select field
        if( selectitem.multiple ) {
            var options = Squish.splitMultiOptionString( optionstr );
            smartclientExtension._setValueForFormItem( selectitem, options );
        } else {
            smartclientExtension._setValueForFormItem( selectitem, optionstr );
        }
    } else {
        throw "Cannot find selectitem object for element";
    }
}

squishscselectitemExtension.hasOptions = function( selectitemelem, optionstr ) {
    var selectitem = smartclientExtension._getSelectItemObject( selectitemelem );
    if( selectitem ) {
        // For datasource-bound selectitemes we cannot easily determine whether the given
        // string is in the list of records since the API for that is inherently asynchronous,
        // and finding a suitable record may take considerable time (which can cause the JS-timeout
        // to hit). So we do not check for existence of the options in such a case and simply let the
        // selectOption fail silently a following verification should notice the problem anyway.
        if( selectitem.getOptionDataSource() != null ) {
            return true;
        }
        var options = Squish.splitMultiOptionString( optionstr );
        // Need to check the available list of options differently for native select items
        // that one has no picklist but we can use the internally used native select input field
        if( smartclientExtension._iscIsA( 'NativeSelectItem', selectitem ) ) {
            var optionelem = selectitem.getDataElement();
            for( var i = 0; i < optionelem.options.length; i++ ) {
                for( var j = 0; j < options.length; j++ ) {
                    if( optionelem.options[i].text == options[j] ) {
                        options.splice(j, 1);
                    }
                }
            }
        } else {
            if( selectitem.pickList == null || selectitem.pickList.destroyed ) {
                selectitem.makePickList( false );
            }
            // This is a PickListMenu object, subclassing ListGrid
            var pickList = selectitem.pickList;
            var valueField = selectitem.getValueFieldName();
            var rowCount = pickList.getTotalRows();
            for( i = 0; i < rowCount; i++ ) {
                var record = pickList.getRecord( i, 0 );
                if( record ) {
                    for( j = 0; j < options.length; j++ ) {
                        if( record[valueField] == options[j] ) {
                            // remove found one from text-array
                            options.splice(j, 1);
                        }
                    }
                }
            }
        }
        return options.length == 0;
    }
    return undefined;
}

// Support for the text input field.
var squishsctextitemExtension = new Object();
squishsctextitemExtension.setFocus = function( obj ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem ) {
        if( smartclientExtension._iscIsA( 'TextItem', formitem ) || smartclientExtension._iscIsA( 'TextAreaItem', formitem ) ) {
            formitem.focusInItem();
        }
    }
}

squishsctextitemExtension.isFileUploadField = function( obj ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem ) {
        if( smartclientExtension._iscIsA( 'UploadItem', formitem ) ) {
            return true;
        }
    }
    return false;
}

squishsctextitemExtension.getHasFocus = function( formitemelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var formitem = smartclientExtension._getISCObject( formitemelem );
        if( formitem ) {
            if( smartclientExtension._iscIsA( 'TextItem', formitem ) || smartclientExtension._iscIsA( 'TextAreaItem', formitem ) ) {
                // The extra getFocusItem check is necessary since hasFocus seems to be not always properly
                // updated (even using nativeClick into a different field)
                return formitem.hasFocus && ( !formitem.form || formitem.form.getFocusItem() == formitem );
            }
        }
    }
    return undefined;
}
squishsctextitemExtension.isDisabled = function( formitemelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var formitem = smartclientExtension._getISCObject( formitemelem );
        if( formitem ) {
            if( smartclientExtension._iscIsA( 'TextItem', formitem ) || smartclientExtension._iscIsA( 'TextAreaItem', formitem ) ) {
                return formitem.isDisabled();
            }
        }
    }
    return undefined;
}
squishsctextitemExtension.getLabel = function( formitemelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var formitem = smartclientExtension._getISCObject( formitemelem );
        if( formitem ) {
            if( smartclientExtension._iscIsA( 'TextItem', formitem ) || smartclientExtension._iscIsA( 'TextAreaItem', formitem ) ) {
                return formitem.getTitle();
            }
        }
    }
    return undefined;
}
squishsctextitemExtension.setDisabled = function( formitemelem, disable ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var formitem = smartclientExtension._getISCObject( formitemelem );
        if( formitem !== undefined ) {
            if( smartclientExtension._iscIsA( 'TextItem', formitem ) || smartclientExtension._iscIsA( 'TextAreaItem', formitem ) ) {
                formitem.setDisabled( disable );
            }
        }
    }
}

squishsctextitemExtension.getValue = function( obj ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem ) {
        if( smartclientExtension._iscIsA( 'TextItem', formitem ) || smartclientExtension._iscIsA( 'TextAreaItem', formitem ) ) {
            return formitem.getEnteredValue();
        }
    }
    return undefined;
}

squishsctextitemExtension.setValue = function( obj, newval ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem ) {
        if( smartclientExtension._iscIsA( 'TextItem', formitem ) || smartclientExtension._iscIsA( 'TextAreaItem', formitem ) ) {
            smartclientExtension._setValueForFormItem( formitem, newval );
        }
    }
}

// Support for the checkbox buttons
var squishsccheckboxExtension = new Object();
squishsccheckboxExtension.isChecked = function( obj ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem && smartclientExtension._iscIsA( 'CheckboxItem', formitem ) ) {
        return formitem.getValue();
    }
}
squishsccheckboxExtension.setChecked = function( obj, check ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem && smartclientExtension._iscIsA( 'CheckboxItem', formitem ) ) {
        // Only do something if the values are different.
        if( check != formitem.getValue() ) {
            // setValue+updateValue does not seem to update the image used by SmartGWT, so the item
            // still looks like its checked but the value does change. So lets do a normal click instead
            Squish.mouseClick( formitem.getFocusElement(), false, false, false, 5, 5, 1 );
        }
    }
}
squishsccheckboxExtension.click = function( obj, ctrl, alt, shift, x, y, button ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem && smartclientExtension._iscIsA( 'CheckboxItem', formitem ) ) {
        // mouseClick is just fine to use here since SmartGWT does not use a native checkbox for rendering
        // and hence calling clickButton is not necessary - unlike for radio buttons
        Squish.mouseClick( formitem.getFocusElement(), ctrl, alt, shift, x, y, button );
    }
}
squishsccheckboxExtension.getText = function( obj ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem && smartclientExtension._iscIsA( 'CheckboxItem', formitem ) ) {
        return formitem.getTitle();
    }
}
squishsccheckboxExtension.isDisabled = function( obj ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem && smartclientExtension._iscIsA( 'CheckboxItem', formitem ) ) {
        return formitem.isDisabled();
    }
}
squishsccheckboxExtension.isVisible = function( obj ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem && smartclientExtension._iscIsA( 'CheckboxItem', formitem ) ) {
        return formitem.isVisible();
    }
}

// Support for the radio buttons
var squishscradioitemExtension = new Object();
squishscradioitemExtension.isSelected = function( obj ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem && smartclientExtension._iscIsA( 'RadioItem', formitem ) ) {
        var dataElem = formitem.getDataElement();
        return dataElem.checked;
    }
}
squishscradioitemExtension.setSelected = function( obj, check ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem && smartclientExtension._iscIsA( 'RadioItem', formitem ) ) {
        // Only do something if the values are different.
        if( check != formitem.checked ) {
            // setValue+updateValue does not seem to update the image used by SmartGWT, so the item
            // still looks like its selected but the value does change. So lets do a normal click instead
            Squish.clickButton( formitem.getFocusElement() );
        }
    }
}
squishscradioitemExtension.click = function( obj/*, ctrl, alt, shift, x, y, button*/ ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem && smartclientExtension._iscIsA( 'RadioItem', formitem ) ) {
        // Need to use clickButton since mouseClick does not trigger on radiobuttons
        Squish.clickButton( formitem.getFocusElement() );
    }
}
squishscradioitemExtension.getText = function( obj ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem && smartclientExtension._iscIsA( 'RadioItem', formitem ) ) {
        return formitem.getTitle();
    }
}
squishscradioitemExtension.isDisabled = function( obj ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem && smartclientExtension._iscIsA( 'RadioItem', formitem ) ) {
        return formitem.isDisabled();
    }
}
squishscradioitemExtension.isVisible = function( obj ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem && smartclientExtension._iscIsA( 'RadioItem', formitem ) ) {
        return formitem.isVisible();
    }
}

// Support for TabWidget
var squishsctabwidgetExtension = new Object;
squishsctabwidgetExtension.clickTab = function( obj, tabTitle ) {
    var tabobj = squishsctabwidgetExtension.findTab( obj, tabTitle );
    Squish.mouseClick( tabobj, false, false, false, 10, 5, 1 );
}
squishsctabwidgetExtension.getCurrentTab = function( obj ) {
    var iscobj = smartclientExtension._getISCObject( obj );
    if( iscobj ) {
        return smartclientExtension._getHandleForISCObject( iscobj.getTab(iscobj.getSelectedTabNumber()) );
    }
    return undefined;
}
squishsctabwidgetExtension.findTab = function( obj, title ) {
    var iscobj = smartclientExtension._getISCObject( obj );
    if( iscobj ) {
        for( var i = 0; i < iscobj.tabs.length; i++ ) {
            if( iscobj.tabs[i]['title'] == title ) {
                return smartclientExtension._getHandleForISCObject( iscobj.getTab( i ) );
            }
        }
    }
    return undefined;
}
var squishsctabExtension = new Object;
squishsctabExtension.setTitle = function( obj, title ) {
    smartclientExtension._getISCObject( obj ).setTitle(title);
}
squishsctabExtension.setEnabled = function( obj, enable ) {
    smartclientExtension._getISCObject( obj ).setDisabled(!enable);
}
squishsctabExtension.isEnabled = function( obj ) {
    return !smartclientExtension._getISCObject( obj ).isDisabled();
}
// Internal function using an iscobj so we can share it with the nameOf function
squishsctabExtension._getTitle = function( iscobj ) {
    return iscobj.getTitle();
}
squishsctabExtension.getTitle = function( obj ) {
    return squishsctabExtension._getTitle( smartclientExtension._getISCObject( obj ) );
}
// Fetch the icon url
squishsctabExtension.getIcon = function( obj ) {
    return smartclientExtension._getISCObject( obj ).icon;
}
squishsctabExtension.setIcon = function( obj, iconurl ) {
    return smartclientExtension._getISCObject( obj ).setIcon( iconurl );
}
// Internal function using an iscobj so we can share it with the nameOf function
squishsctabExtension._getTabWidget = function( iscobj ) {
    return iscobj.parentElement.parentElement;
}
squishsctabExtension.getTabWidget = function( obj ) {
    return smartclientExtension._getHandleForISCObject( squishsctabExtension._getTabWidget( smartclientExtension._getISCObject( obj ) ) );
}

var squishsccolorfieldExtension = new Object();
squishsccolorfieldExtension.isEnabled = function( obj ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem && smartclientExtension._iscIsA( 'ColorItem', formitem ) ) {
        return !formitem.isDisabled();
    }
    return undefined;
}
squishsccolorfieldExtension.getFieldName = function( obj ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem && smartclientExtension._iscIsA( 'ColorItem', formitem ) ) {
        return formitem.getTitle();
    }
    return undefined;
}
squishsccolorfieldExtension.getRgbColor = function( obj ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem && smartclientExtension._iscIsA( 'ColorItem', formitem ) ) {
        return formitem.getEnteredValue();
    }
    return undefined;
}
squishsccolorfieldExtension.setEnabled = function( obj, enable ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem && smartclientExtension._iscIsA( 'ColorItem', formitem ) ) {
        return formitem.setEnabled( enable );
    }
}
squishsccolorfieldExtension.setRgbColor = function( obj, rgbcolor ) {
    var formitem = smartclientExtension._getISCObject( obj );
    if( formitem && smartclientExtension._iscIsA( 'ColorItem', formitem ) ) {
        smartclientExtension._setValueForFormItem( formitem, rgbcolor );
    }
}

var squishscsectionheaderExtension = new Object();
// Customize the click behaviour since we need to call SC API for the click to work correctly
squishscsectionheaderExtension.click = function( obj, ctrl, shift, alt, x, y, button ) {
    try{
    var iscobj = smartclientExtension._getISCObject( obj );
    if( iscobj && smartclientExtension._isSectionHeaderObject( iscobj ) ) {
        // Make sure to click on the background button's handle since thats where the
        // event listener sits on
        Squish.mouseClick( iscobj.background.getHandle(), ctrl, shift, alt, x, y, button );
    }
    } catch (e) {
        // Ignore
    }
}
squishscsectionheaderExtension.isEnabled = function( obj ) {
    var iscobj = smartclientExtension._getISCObject( obj );
    if( iscobj && smartclientExtension._isSectionHeaderObject( iscobj ) ) {
        return !iscobj.isDisabled();
    }
    return undefined;
}
squishscsectionheaderExtension.isExpanded = function( obj ) {
    var iscobj = smartclientExtension._getISCObject( obj );
    if( iscobj && smartclientExtension._isSectionHeaderObject( iscobj ) ) {
        return iscobj.getSectionStack().sectionIsExpanded( iscobj );
    }
    return undefined;
}
squishscsectionheaderExtension.getTitle = function( obj ) {
    var iscobj = smartclientExtension._getISCObject( obj );
    if( iscobj && smartclientExtension._isSectionHeaderObject( iscobj ) ) {
        return iscobj.title;
    }
    return undefined;
}
squishscsectionheaderExtension.setEnabled = function( obj, enable ) {
    var iscobj = smartclientExtension._getISCObject( obj );
    if( iscobj && smartclientExtension._isSectionHeaderObject( iscobj ) ) {
        iscobj.setDisabled(!enable);
    }
}
squishscsectionheaderExtension.setExpanded = function( obj, expand ) {
    var iscobj = smartclientExtension._getISCObject( obj );
    if( iscobj && smartclientExtension._isSectionHeaderObject( iscobj ) ) {
        var stack = iscobj.getSectionStack();
        // Need to go through the sectionHeaderClick function here since
        // setExpanded on the sectionheader does not seem to show/hide the content
        // control
        if( stack.sectionIsExpanded( iscobj ) != expand ) {
            stack.sectionHeaderClick( iscobj );
        }
    }
}
squishscsectionheaderExtension.setTitle = function( obj, title ) {
    var iscobj = smartclientExtension._getISCObject( obj );
    if( iscobj && smartclientExtension._isSectionHeaderObject( iscobj ) ) {
        iscobj.setTitle(title);
    }
}

var squishscprogressbarExtension = new Object;
squishscprogressbarExtension.setValue = function( htmlelem, newvalue ) {
    if( newvalue < 0 || newvalue > 100 ) {
        return;
    }
    if( smartclientExtension.isSmartClientLoaded() ) {
        var bar = smartclientExtension._getISCObject( htmlelem );
        if( bar && smartclientExtension._iscIsA( 'Progressbar', bar ) ) {
            return bar.setPercentDone( newvalue );
        }
    }
}
squishscprogressbarExtension.getMaximum = function( htmlelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var bar = smartclientExtension._getISCObject( htmlelem );
        if( bar && smartclientExtension._iscIsA( 'Progressbar', bar ) ) {
            // Progressbar always has a maximum value of 100
            return 100;
        }
    }
    return -1;
}
squishscprogressbarExtension.getMinimum = function( htmlelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var bar = smartclientExtension._getISCObject( htmlelem );
        if( bar && smartclientExtension._iscIsA( 'Progressbar', bar ) ) {
            // Progressbar always has a minimum value of 0
            return 0;
        }
    }
    return -1;
}
squishscprogressbarExtension.getValue = function( htmlelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var bar = smartclientExtension._getISCObject( htmlelem );
            if( bar && smartclientExtension._iscIsA( 'Progressbar', bar ) ) {
            return bar.percentDone;
        }
    }
    return -1;
}

// Menu support
var squishscmenuExtension = new Object;
// Menu API
squishscmenuExtension._getMenuItemCount = function( iscmenu ) {
    if( smartclientExtension._iscIsA( 'MenuBar', iscmenu ) ) {
        return iscmenu.getButtons().length;
    } else if( smartclientExtension._iscIsA( 'Menu', iscmenu ) ) {
        return iscmenu.getTotalRows();
    }
    return 0;
}
squishscmenuExtension.getMenuItemCount = function( elem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var menu = smartclientExtension._getISCObject( elem );
        if( menu ) {
            return squishscmenuExtension._getMenuItemCount( menu );
        }
    }
    return 0;
}
squishscmenuExtension._getMenuItemObjectAt = function( iscmenu, idx ) {
    if( smartclientExtension._iscIsA( 'MenuBar', iscmenu ) ) {
        return iscmenu.getButton( idx );
    } else if( smartclientExtension._iscIsA( 'Menu', iscmenu ) ) {
        return iscmenu.getItem( idx );
    }
    return undefined;
}
squishscmenuExtension._getMenuItemElementAt = function( iscmenu, idx ) {
    if( smartclientExtension._iscIsA( 'MenuBar', iscmenu ) ) {
        return smartclientExtension._getHandleForISCObject( iscmenu.getButton( idx ) );
    } else if( smartclientExtension._iscIsA( 'Menu', iscmenu ) ) {
        return iscmenu.body.getTableElement( idx );
    }
    return undefined;
}
squishscmenuExtension.getMenuItemAt = function( elem, idx ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var menu = smartclientExtension._getISCObject( elem );
        if( menu ) {
            return squishscmenuExtension._getMenuItemElementAt( menu, idx );
        }
    }
    return undefined;
}
squishscmenuExtension.findMenuItemByText = function( elem, text ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var menu = smartclientExtension._getISCObject( elem );
        if( smartclientExtension._iscIsA( 'MenuBar', menu ) || smartclientExtension._iscIsA( 'Menu', menu ) ) {
            for( var i = 0; i < squishscmenuExtension._getMenuItemCount( menu ); i++ ) {
                var menuitem = squishscmenuExtension._getMenuItemObjectAt( menu, i );
                if( menuitem && Squish.cleanString( squishscmenuExtension._getMenuItemText( menu, menuitem ) ) == text ) {
                    return squishscmenuExtension._getMenuItemElementAt( menu, i );
                }
            }
        }
    }
    return undefined;
}
squishscmenuExtension.findMenuItemByIconUrl = function( elem, icon ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var menu = smartclientExtension._getISCObject( elem );
        if( smartclientExtension._iscIsA( 'MenuBar', menu ) || smartclientExtension._iscIsA( 'Menu', menu ) ) {
            for( var i = 0; i < squishscmenuExtension._getMenuItemCount( menu ); i++ ) {
                var menuitem = squishscmenuExtension._getMenuItemObjectAt( menu, i );
                if( menuitem && squishscmenuExtension._getMenuItemIconUrl( menu, menuitem ) == icon ) {
                    return squishscmenuExtension._getMenuItemElementAt( menu, i );
                }
            }
        }
    }
    return undefined;
}
// MenuItem API
squishscmenuExtension.getParentMenu = function( elem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var menuiteminfo = squishscmenuExtension._findMenuAndItemObjects( elem );
        if( menuiteminfo ) {
            return smartclientExtension._getHandleForISCObject( menuiteminfo['menu'] );
        }
    }
    return undefined;
}

squishscmenuExtension._findMenuItemIndexForElement = function( menu, elem ) {
    var itemcount = squishscmenuExtension._getMenuItemCount( menu );
    for( var i = 0; i < itemcount; i++ ) {
        // Check for elem to be the menu item or a child of it. This is useful since mouseClick
        // events usually occur on one of the actual td-cells.
        if( smartclientExtension._isChildOf( elem, squishscmenuExtension._getMenuItemElementAt( menu, i ) ) ) {
            return {'index':i };
        }
    }
    return undefined;
}

squishscmenuExtension.getSubMenu = function( elem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var menuiteminfo = squishscmenuExtension._findMenuAndItemObjects( elem );
        if( menuiteminfo ) {
            var menu = menuiteminfo['menu'];
            var menuitem = menuiteminfo['menuitem'];
            if( smartclientExtension._iscIsA( 'MenuBar', menu ) ) {
                // menuitem is a barbutton, for that getISCObject works
                if( smartclientExtension._iscIsA( 'MenuBarButton', menuitem ) ) {
                    // MenuBarButtons differ from MenuButton in that there can be only 1 active menu in the menubar
                    // and their menu-property is never set. So go through the menubar and check the activeMenu to
                    // see whether its corresponding to the current button
                    var menuNum = menu.getButtonNumber( menuitem );
                    if( menu.activeMenu != null && menuNum != null && menu.activeMenu == menuNum ) {
                        return smartclientExtension._getHandleForISCObject( menu.menus[menu.activeMenu] );
                    }
                }
            } else if( smartclientExtension._iscIsA( 'Menu', menu ) ) {
                return smartclientExtension._getHandleForISCObject( menu.getSubmenu( menuitem ) );
            }
        }
    }
    return undefined;
}
squishscmenuExtension._getMenuItemText = function( menuobj, menuitemobj ) {
    if( smartclientExtension._iscIsA( 'MenuBarButton', menuitemobj ) ) {
        return menuitemobj.getTitle();
    } else if( smartclientExtension._iscIsA( 'Menu', menuobj ) && menuitemobj ) {
        return menuobj.getItemTitle( menuitemobj );
    }
    return undefined;
}
squishscmenuExtension._findMenuAndItemObjectsForISCObject = function( iscobj ) {
    var menuitem = undefined;
    var menu = undefined;
    if( smartclientExtension._iscIsA( 'MenuBarButton', iscobj ) ) {
        menu = iscobj.parentElement;
        menuitem = iscobj;
    } else if( iscobj instanceof smartclientExtension.MenuItemISCObjectDummy && smartclientExtension._iscIsA( 'Menu', iscobj.view ) ) {
        menu = iscobj.view;
        menuitem = squishscmenuExtension._findMenuItemIndexForElement( menu, smartclientExtension._getHandleForISCObject( iscobj ) );
        // Function returns the index of the item, so get the actual item out
        if( menuitem ) {
            menuitem = menu.getItem( menuitem['index'] );
        }
    }
    if( menu && menuitem ) {
        return {'menu':menu, 'menuitem':menuitem };
    }
    return undefined;
}
squishscmenuExtension._findMenuAndItemObjects = function( elem ) {
    var iscobj = smartclientExtension._getISCObject( elem );
    return squishscmenuExtension._findMenuAndItemObjectsForISCObject( iscobj );
}

squishscmenuExtension.getMenuItemText = function( elem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var info = squishscmenuExtension._findMenuAndItemObjects( elem );
        if( info ) {
            return squishscmenuExtension._getMenuItemText( info['menu'], info['menuitem'] );
        }
    }
    return undefined;
}
squishscmenuExtension._getMenuItemIconUrl = function( menuobj, menuitemobj ) {
    if( smartclientExtension._iscIsA( 'MenuBarButton', menuitemobj ) ) {
        return menuitemobj.icon;
    } else if( smartclientExtension._iscIsA( 'Menu', menuobj ) && menuitemobj ) {
        if( menuobj.itemIsEnabled( menuitemobj ) || !menuitemobj.disabledIcon ) {
            return menuitemobj.icon;
        } else {
            return menuitemobj.disabledIcon;
        }
    }
    return undefined;
}
squishscmenuExtension.getMenuItemIconUrl = function( elem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var info = squishscmenuExtension._findMenuAndItemObjects( elem );
        if( info ) {
            return squishscmenuExtension._getMenuItemIconUrl( info['menu'], info['menuitem'] );
        }
    }
    return undefined;
}
squishscmenuExtension.isMenuItemEnabled = function( elem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var info = squishscmenuExtension._findMenuAndItemObjects( elem );
        if( info ) {
            var menu = info['menu'];
            var menuitem = info['menuitem'];
            if( smartclientExtension._iscIsA( 'MenuBar', menu ) ) {
                return !menuitem.isDisabled();
            } else if( smartclientExtension._iscIsA( 'Menu', menu ) ) {
                return menu.itemIsEnabled( menuitem );
            }
        }
    }
    return undefined;
}
squishscmenuExtension.isMenuItemSeparator = function( elem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var info = squishscmenuExtension._findMenuAndItemObjects( elem );
        if( info ) {
            var menu = info['menu'];
            var menuitem = info['menuitem'];
            if( smartclientExtension._iscIsA( 'MenuBar', menu ) ) {
                return false;
            } else if( smartclientExtension._iscIsA( 'Menu', menu ) ) {
                return menuitem.isSeparator;
            }
        }
    }
    return undefined;
}
squishscmenuExtension.isMenuItemChecked = function( elem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var info = squishscmenuExtension._findMenuAndItemObjects( elem );
        if( info ) {
            var menu = info['menu'];
            var menuitem = info['menuitem'];
            if( smartclientExtension._iscIsA( 'MenuBar', menu ) ) {
                return false;
            } else if( smartclientExtension._iscIsA( 'Menu', menu ) ) {
                return menuitem.checked;
            }
        }
    }
    return undefined;
}
squishscmenuExtension.setMenuItemText = function( elem, text ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var info = squishscmenuExtension._findMenuAndItemObjects( elem );
        if( info ) {
            var menu = info['menu'];
            var menuitem = info['menuitem'];
            if( smartclientExtension._iscIsA( 'MenuBar', menu ) ) {
                menuitem.setTitle( text );
            } else if( smartclientExtension._iscIsA( 'Menu', menu ) ) {
                menu.setItemTitle( menuitem, text );
            }
        }
    }
}
squishscmenuExtension.setMenuItemIconUrl = function( elem, iconurl ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var info = squishscmenuExtension._findMenuAndItemObjects( elem );
        if( info ) {
            var menu = info['menu'];
            var menuitem = info['menuitem'];
            if( smartclientExtension._iscIsA( 'MenuBar', menu ) ) {
                menuitem.setIcon( iconurl );
            } else if( smartclientExtension._iscIsA( 'Menu', menu ) ) {
                menu.setItemIcon( menuitem, iconurl );
            }
        }
    }
}
squishscmenuExtension.setMenuItemChecked = function( elem, check ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var info = squishscmenuExtension._findMenuAndItemObjects( elem );
        if( info ) {
            var menu = info['menu'];
            var menuitem = info['menuitem'];
            if( smartclientExtension._iscIsA( 'MenuBar', menu ) ) {
                // Nothing to do, checkable items are not supported in a menubar
            } else if( smartclientExtension._iscIsA( 'Menu', menu ) ) {
                menu.setItemChecked( menuitem, check );
            }
        }
    }
}
squishscmenuExtension.setMenuItemEnabled = function( elem, enable ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var info = squishscmenuExtension._findMenuAndItemObjects( elem );
        if( info ) {
            var menu = info['menu'];
            var menuitem = info['menuitem'];
            if( smartclientExtension._iscIsA( 'MenuBar', menu ) ) {
                menuitem.setDisabled( !enable );
            } else if( smartclientExtension._iscIsA( 'Menu', menu ) ) {
                menu.setItemEnabled( menuitem, enable );
            }
        }
    }
}
squishscmenuExtension.setMenuItemSeparator = function( elem, isSep ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var info = squishscmenuExtension._findMenuAndItemObjects( elem );
        if( info ) {
            var menu = info['menu'];
            var menuitem = info['menuitem'];
            if( smartclientExtension._iscIsA( 'MenuBar', menu ) ) {
                // Nothing to do, separators are not supported in a menubar
            } else if( smartclientExtension._iscIsA( 'Menu', menu ) ) {
                if( menuitem.isSeparator != isSep ) {
                    menuitem.isSeparator = isSep;
                    menu.markForRedraw( "isSeparator" );
                }
            }
        }
    }
}

// MenuButton support
var squishscmenubuttonExtension = new Object;

squishscmenubuttonExtension.click = function( elem/*, ctrl, shift, alt, x, y, button*/ ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        Squish.clickButton( elem );
    }
}
squishscmenubuttonExtension.getText = function( elem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var btn = smartclientExtension._getISCObject( elem );
        if( smartclientExtension._isStandaloneMenuButton( btn ) ) {
            return btn.getTitle();
        }
    }
    return undefined;
}
squishscmenubuttonExtension.isDisabled = function( elem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var btn = smartclientExtension._getISCObject( elem );
        if( smartclientExtension._isStandaloneMenuButton( btn ) ) {
            return btn.isDisabled();
        }
    }
    return undefined;
}
squishscmenubuttonExtension.getMenu = function( elem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var btn = smartclientExtension._getISCObject( elem );
        if( smartclientExtension._isStandaloneMenuButton( btn ) ) {
            return smartclientExtension._getHandleForISCObject( btn.menu );
        }
    }
    return undefined;
}
squishscmenubuttonExtension.setText = function( elem, text ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var btn = smartclientExtension._getISCObject( elem );
        if( smartclientExtension._isStandaloneMenuButton( btn ) ) {
            return btn.setTitle( text );
        }
    }
}
squishscmenubuttonExtension.setDisabled = function( elem, disable ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var btn = smartclientExtension._getISCObject( elem );
        if( smartclientExtension._isStandaloneMenuButton( btn ) ) {
            return btn.setDisabled( disable );
        }
    }
}
squishscmenubuttonExtension.isVisible = function( elem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var btn = smartclientExtension._getISCObject( elem );
        if( smartclientExtension._isStandaloneMenuButton( btn ) ) {
            return btn.isVisible();
        }
    }
}

// Support for the DateChooser Widget
var squishscdatechooserExtension = new Object

squishscdatechooserExtension.setDate = function( elem, date ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var datechooser = smartclientExtension._getISCObject( elem );
        if( smartclientExtension._iscIsA( 'DateChooser', datechooser ) ) {
            // JS Date objects start the months with 0, so need to substract 1
            // since our API starts months with 1.
            datechooser.dateClick( date.getFullYear(), date.getMonth(), date.getDate() );
        }
    }
}

squishscdatechooserExtension.getDate = function( elem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var datechooser = smartclientExtension._getISCObject( elem );
        if( smartclientExtension._iscIsA( 'DateChooser', datechooser ) ) {
            return datechooser.getData();
        }
    }
    return undefined;
}

var squishsccalendarExtension = new Object();
squishsccalendarExtension.numColumns = squishsclistgridExtension.numColumns;
squishsccalendarExtension.numRows = squishsclistgridExtension.numRows;
squishsccalendarExtension.columnCaption = squishsclistgridExtension.columnCaption;
squishsccalendarExtension.childItem = squishsclistgridExtension.childItem;
squishsccalendarExtension.findItem = squishsclistgridExtension.findItem;
squishsccalendarExtension.findItemByRowAndColumn = squishsclistgridExtension.findItemByRowAndColumn;
squishsccalendarExtension.getVisibleEventCount = function( calelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var calendar = smartclientExtension._getISCObject( calelem );
        // Calendar is a ListGrid, not the whole calendar-widget (which includes tabs, forward/backward buttons
        // etc.). The eventWindows are in the list of children of the grid's body.
        var arr = calendar.body.children;
        var cnt = 0;
        for( var i = 0; i < arr.length; i++ ) {
            if( smartclientExtension._iscIsA( 'EventWindow', arr[i] ) ) {
                cnt++;
            }
        }
        return cnt;
    }
    return undefined;
}
squishsccalendarExtension.getVisibleEventAt = function( calelem, num ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var calendar = smartclientExtension._getISCObject( calelem );
        // Calendar is a ListGrid, not the whole calendar-widget (which includes tabs, forward/backward buttons
        // etc.). The eventWindows are in the list of children of the grid's body.
        var arr = calendar.body.children;
        var cnt = 0;
        for( var i = 0; i < arr.length; i++ ) {
            if( smartclientExtension._iscIsA( 'EventWindow', arr[i] ) ) {
                if( cnt == num ) {
                    return smartclientExtension._getHandleForISCObject( arr[i] );
                } else {
                    cnt++;
                }
            }
        }
    }
    return undefined;
}
squishsccalendarExtension.getDate = function( calelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var calview = smartclientExtension._getISCObject( calelem );
        var calendar = calview.creator;
        if( calendar ) {
            return calendar.chosenDate;
        }
    }
    return undefined;
}
squishsccalendarExtension.setDate = function( calelem, newdate ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var calview = smartclientExtension._getISCObject( calelem );
        var calendar = calview.creator;
        if( calendar ) {
            calendar.setChosenDate( newdate );
        }
    }
}

squishsccalendarExtension.getTitle = function( calevelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var evwindow = smartclientExtension._getISCObject( calevelem );
        return evwindow.event[evwindow.calendar.nameField];
    }
    return undefined;
}
squishsccalendarExtension.getDescription = function( calevelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var evwindow = smartclientExtension._getISCObject( calevelem );
        if( evwindow.calendar.getDescriptionText ) {
            return evwindow.calendar.getDescriptionText( evwindow.event );
        } else {
            return evwindow.event[ evwindow.calendar.descriptionField ];
        }
    }
    return undefined;
}
squishsccalendarExtension.getStartDateTime = function( calevelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var evwindow = smartclientExtension._getISCObject( calevelem );
        var date = evwindow.event[evwindow.calendar.startDateField];
        return date;
    }
    return undefined;
}
squishsccalendarExtension.getEndDateTime = function( calevelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var evwindow = smartclientExtension._getISCObject( calevelem );
        var date = evwindow.event[evwindow.calendar.endDateField];
        return date;
    }
    return undefined;
}

squishsccalendarExtension.setTitle = function( calevelem, title ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var evwindow = smartclientExtension._getISCObject( calevelem );
        var cal = evwindow.calendar;
        var evt = evwindow.event;
        // The [] for the otherProps leaves the property list alone
        cal.updateEvent(evt, evt[cal.startDateField],
                             evt[cal.endDateField],
                             title,
                             evt[cal.descriptionField],
                             [], true);
    }
}

squishsccalendarExtension.setStartDateTime = function( calevelem, startdate ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var evwindow = smartclientExtension._getISCObject( calevelem );
        var cal = evwindow.calendar;
        var evt = evwindow.event;
        // The [] for the otherProps leaves the property list alone
        cal.updateEvent(evt, startdate,
                             evt[cal.endDateField],
                             evt[cal.nameField],
                             evt[cal.descriptionField],
                             [], true);
    }
}
squishsccalendarExtension.setEndDateTime = function( calevelem, enddate ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var evwindow = smartclientExtension._getISCObject( calevelem );
        var cal = evwindow.calendar;
        var evt = evwindow.event;
        // The [] for the otherProps leaves the property list alone
        cal.updateEvent(evt, evt[cal.startDateField],
                             enddate,
                             evt[cal.nameField],
                             evt[cal.descriptionField],
                             [], true);
    }
}
squishsccalendarExtension.setDescription = function( calevelem, description ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var evwindow = smartclientExtension._getISCObject( calevelem );
        var cal = evwindow.calendar;
        var evt = evwindow.event;
        // The [] for the otherProps leaves the property list alone
        cal.updateEvent(evt, evt[cal.startDateField],
                             evt[cal.endDateField],
                             evt[cal.nameField],
                             description,
                             [], true);
    }
}

var squishscbuttonExtension = new Object();
squishscbuttonExtension.getText = function( btnelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var btn = smartclientExtension._getISCObject( btnelem );
        if( btn !== undefined ) {
            // Need to use getTitle() here since in some cases the function is overriden
            // to provide special behaviour (OK button in messageboxes).
            return btn.getTitle();
        }
    }
}
squishscbuttonExtension.setText = function( btnelem, txt ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var btn = smartclientExtension._getISCObject( btnelem );
        if( btn !== undefined ) {
            btn.setTitle( txt );
        }
    }
}
squishscbuttonExtension.isVisible = function( btnelem ) {
    return Squish.isElementVisible( btnelem );
}
squishscbuttonExtension.setDisabled = function( btnelem, disable ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var btn = smartclientExtension._getISCObject( btnelem );
        if( btn !== undefined ) {
            btn.setDisabled( disable );
        }
    }
}
squishscbuttonExtension.isDisabled = function( btnelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var btn = smartclientExtension._getISCObject( btnelem );
        if( btn !== undefined ) {
            return btn.isDisabled();
        }
    }
}
squishscbuttonExtension.click = function( btnelem/*, ctrlPressed, shiftPressed, altPressed, x, y, button*/ ) {
    Squish.clickButton( btnelem );
}

var smartclientExtension = new Object;

smartclientExtension.Widget = 0;
smartclientExtension.FormItem = 1;
smartclientExtension.ListGrid = 2;
smartclientExtension.ListGridItem = 3;
smartclientExtension.ComboBoxItem = 4;
smartclientExtension.SelectItem = 5;
smartclientExtension.RadioItem = 6;
smartclientExtension.TabWidget = 7;
smartclientExtension.Tab = 8;
smartclientExtension.ColorField = 9;
smartclientExtension.SectionHeader = 10;
smartclientExtension.TreeGrid = 11;
smartclientExtension.TreeGridItem = 12;
smartclientExtension.TreeGridHandle = 13;
smartclientExtension.ProgressBar = 14;
smartclientExtension.Menu = 15;
smartclientExtension.MenuItem = 16;
smartclientExtension.MenuButton = 17;
smartclientExtension.DateChooser = 18;
smartclientExtension.TreeGridCheckbox = 19;
smartclientExtension.Calendar = 20;
smartclientExtension.CalendarItem = 21;
smartclientExtension.CalendarEvent = 22;
smartclientExtension.Button = 23;

smartclientExtension._iscIsA = function( className, iscobj ) {
    if( smartclientExtension.isSmartClientLoaded ) {
        if( Object.prototype.hasOwnProperty.call( isc.isA, className ) ) {
            return isc.isA[className]( iscobj );
        }
    }
    return false;
}

smartclientExtension._findListGridRecord = function( grid, itemelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        if( smartclientExtension._iscIsA( 'ListGrid', grid ) ) {
            var record = smartclientExtension._visitListGridItems( grid,
                                function( grid, rowNum, record, field ) {
                                    var body = grid.body;
                                    var item = body.getTableElement( rowNum, field.masterIndex );
                                    if( item == itemelem ) {
                                        return record;
                                    }
                                    return undefined;
                                }
                        );
            return record;
        }
    }
    return undefined;
}

smartclientExtension._isChildOf = function ( potentialChild, parentObj ) {
    while( potentialChild && potentialChild != parentObj ) {
        potentialChild = potentialChild.parentNode;
    }
    return (potentialChild == parentObj);
}

smartclientExtension._setValueForFormItem = function( iscformitem, newValue ) {
    // For combobox and select box its apparently better to use pickValue to properly
    // simulate the picking of a value from the picklist. Otherwise not all possible
    // handlers are triggered. Found this in a customer app where a "Select All" entry
    // in a SelectItem did not trigger selecting all entries in the corresponding listview
    if( ( smartclientExtension._iscIsA( 'ComboBoxItem', iscformitem ) || smartclientExtension._iscIsA( 'SelectItem', iscformitem ) ) ) {
        if( smartclientExtension._iscIsA( 'NativeSelectItem', iscformitem ) ) {
            var displayValues = [];
            for( var i = 0; i < newValue.length; ++i ) {
                displayValues[i] = iscformitem.mapValueToDisplay( newValue[i] );
            }
            iscformitem.setElementValue( displayValues, newValue );
            iscformitem.updateValue();
        } else {
            iscformitem.pickValue( newValue );
        }
    } else {
        // setElementValue updates only the data element (if applicable) or text field
        iscformitem.setElementValue( newValue );
        // updateValue makes sure to store the value and trigger change handlers if the value changed
        iscformitem.updateValue();
    }
}

smartclientExtension.ListGridItemISCObjectDummy = function( itemelem, view ) {
    this.itemelem = itemelem;
    this.getHandle = function() {
        return itemelem;
    };
    this.view = view;
}
// Special variant of the above for MenuItems
// This bit of duplication makes the code in getType a bit more straight-forward
// and the _getISCObject code needed a separate menuitem check anyway
smartclientExtension.MenuItemISCObjectDummy = function( itemelem, view ) {
    this.itemelem = itemelem;
    this.getHandle = function() {
        return itemelem;
    };
    this.view = view;
}

smartclientExtension._isListGridCell = function( potCell, gridbody ) {
    // Try to determine whether potCell is potentially a cell in a listgrid This
    // uses a bit of heuristics based on the HTML DOM tree so its faster than
    // actually checking all the items in a potentially big grid. Based on
    // looking at the rendered HTML tree in different browsers for different
    // types of Grids.  Goes up from the given element until it finds the next
    // TD and then from that searches the next TABLE that has listTable (or
    // menuTable to support menus properly until dedicated menu-support has
    // been added) set. It stops immediately when it matches the given gridbody
    // or when it encounters an eventproxy object. The latter is done to have a
    // quick-exit in case of seeing nested forms/grids inside a grid.
    while( potCell && potCell != gridbody && potCell.getAttribute("eventproxy") == null && potCell.tagName != 'TD' ) {
        potCell = potCell.parentNode;
    }
    if( potCell && potCell != gridbody && potCell.getAttribute("eventproxy") == null && potCell.tagName == 'TD' ) {
        // Ok try to find the next TABLE element and see whether its a listTable, which is used inside ListGrid
        // renderings for the actual item-table. If thats found we assume potCell is indeed a cell item
        var tr = potCell.parentNode;
        if( !tr ) {
            // No table row, so its not a cell item
            return false;
        }
        var tbody = tr.parentNode;
        if( !tbody ) {
            // no parent to the TD, so not a cell item
            return false;
        }
        var table = tbody;
        // Handle tables which have a TBODY
        if( tbody.tagName == 'TBODY' ) {
            table = tbody.parentNode;
        }
        if( table && table.tagName == 'TABLE' ) {
            // Check whether this is a list-table, if it is we likely found a table-cell-item
            // menuTable is only checked to make it possible to automate menus without needing
            // dedicated menu-support. With this change a menu is recognized as itemview and items
            // in it can be found properly.
            // className==treeCell is a special case for tree's, in particular checkable ones since
            // there's an intermediate table between the body and the individual item content
            return table.className.indexOf( 'treeCell' ) != -1 || table.className.indexOf( 'treeTallCell' ) != -1 ||
                table.className.indexOf( 'listTable' ) != -1 || table.className.indexOf( 'menuTable' ) != -1;
        }
    }
    return false;
}

smartclientExtension._getISCObject = function( o ) {
    if ( !o ) {
        return undefined;
    }
    var combobox = undefined;
    var selectitem = undefined;
    var itemhandle = undefined;
    if( smartclientExtension.isSmartClientLoaded() ) {
        var iscobj = isc.AutoTest.locateCanvasFromDOMElement(o);
        if( iscobj ) {
            if( smartclientExtension._iscIsA( 'DynamicForm', iscobj ) ) {
                // If the canvas is a dynamic-form we may actually have a formitem in o
                // so check for that case by trying to get a formitem object for the locator
                var formitem = isc.AutoTest.getLocatorFormItem(isc.AutoTest.getLocator(o));
                if( formitem ) {
                    if( iscobj.grid ) {
                        // Special case for form-items used as editor inside a list-grid item
                        // for some of these cases we don't want to record on the form-item, but
                        // rather the listgrid item. The currently known case where this is
                        // necessary are checkbox-items in a ListGrid
                        if( smartclientExtension._iscIsA( 'CheckboxItem', formitem ) &&
                                formitem.rowNum !== undefined && formitem.rowNum !== null &&
                                formitem.colNum !== undefined && formitem.colNum !== null ) {
                            var itemHandle = iscobj.grid.body.getTableElement( formitem.rowNum, formitem.colNum );
                            if( itemHandle ) {
                                // Ok, itemHandle should now be the ListGrid's HTML element for the whole item
                                // return the corresponding isc object for that
                                return smartclientExtension._getISCObject( itemHandle );
                            }
                        }
                    }
                    combobox = smartclientExtension._getComboBoxObject( o );
                    if( combobox ) {
                        return combobox;
                    }
                    selectitem = smartclientExtension._getSelectItemObject( o );
                    if( selectitem ) {
                        return selectitem;
                    }
                    if( smartclientExtension._iscIsA( 'RadioGroupItem', formitem ) ) {
                        // the getLocatorFormItem API returns us the complete group, so now need to check
                        // whether the object is actuall a child of any of the actual radio items
                        var items = formitem.getItems();
                        for( var i = 0; i < items.length; i++ ) {
                            itemhandle = smartclientExtension._getHandleForISCObject( items[i] );
                            var b = smartclientExtension._isChildOf( o, itemhandle );
                            if( b ) {
                                return items[i];
                            }
                        }
                    }
                    return formitem;
                }
            } else {
                // Check for a ListGrid object
                var wantedObject = smartclientExtension._getListGridObject( o );
                // ComboBoxItem uses a listgrid internally, so if we find that the listgrid belongs to a
                // combobox, return the combobox type here
                combobox = smartclientExtension._getComboBoxObject( o );
                if( combobox ) {
                    return combobox;
                }
                selectitem = smartclientExtension._getSelectItemObject( o );
                if( selectitem ) {
                    return selectitem;
                }
                if( smartclientExtension._iscIsA( 'Menu', wantedObject ) ) {
                    // Verify whether the given object matches an element in the menu, we don't care about
                    // the index, only that one is found.
                    var iteminfo = squishscmenuExtension._findMenuItemIndexForElement( wantedObject, o );
                    if( iteminfo ) {
                        // Make sure that eventObject for any child of a menu item-handle is the menu item handle
                        // this ensures that all other code can rely on the <TR> for a menu item being passed
                        // as html element (i.e. event-hooks)
                        itemhandle = wantedObject.body.getTableElement( iteminfo['index'] );
                        return new smartclientExtension.MenuItemISCObjectDummy( itemhandle, wantedObject );
                    }
                }
                if( smartclientExtension._iscIsA( 'ListGrid', wantedObject ) ) {
                    var currentObj = o;
                    var bodyelement = wantedObject.body.getHandle();
                    // Check whether the given html object is potentially a cell item from a listgrid
                    // Since the visit-function is rather expensive in the case of not matching against
                    // an item, it needs to be avoided if possible. The isListGridCell function does a
                    // quick check based on the DOM-Tree and className/structure information gathered
                    // from the rendered tree in different browsers to decide whether the given element
                    // is likely a ListGrid item or not.
                    if( smartclientExtension._isListGridCell( currentObj, bodyelement ) ) {
                        // Need to walk up the tree so that elements inside the item are not causing the
                        // recognition to think its the grid itself that should be identified
                        while( currentObj && currentObj != bodyelement ) {
                            // Check to see if the actual object is a cell of the grid, this is not very efficient
                            // but the API does not allow a better way, the only alternative would be to see if we can
                            // get at the className used for the cell...  Or generate a locator and try to extract row/col
                            // and then compare the element
                            var item = smartclientExtension._visitListGridItems( wantedObject,
                                    function( grid, rowNum, record, field ) {
                                        var body = grid.body;
                                        var item = body.getTableElement( rowNum, field.masterIndex );
                                        if( item == currentObj ) {
                                            return item;
                                        }
                                        return undefined;
                                    }
                            );
                            if( item ) {
                                //item dummy " + item );
                                // This is different from the other returns since items do not have an isc-object
                                // so instead we return a 'dummy' object here.
                                return new smartclientExtension.ListGridItemISCObjectDummy( item, wantedObject );
                            }
                            currentObj = currentObj.parentNode;
                        }
                    }
                    return wantedObject;
                }
                // Return the section header when clicking on the contained button which is its 'background'.
                // This is necessary since for the user the section header == background button and otherwise
                // the section header itself is not pickable. Also make sure to not recognize other controls
                // in the header as the header itself
                if( iscobj.parentElement && smartclientExtension._isSectionHeaderObject( iscobj.parentElement )
                        && iscobj.parentElement.background == iscobj ) {
                    return iscobj.parentElement;
                }
                // For Event-Window we'd like to identify both body and header as event-window,
                // but not the button in the header
                // This is useful because clicks on the header or the body (except for the button)
                // trigger a dialog showing the event info and allowing to edit it.
                if( smartclientExtension._iscIsA( 'EventWindow', iscobj.parentElement ) ) {
                    return iscobj.parentElement;
                }
                // This is not very nice and relies on internal knowledge about the layout of the EventWindow,
                // but unfortunately there's no way to better determine whether the label is the header of an
                // EventWindow.
                if( smartclientExtension._iscIsA( 'Label', iscobj ) &&
                        iscobj.parentElement && iscobj.parentElement.parentElement &&
                        iscobj.parentElement.parentElement.parentElement &&
                        smartclientExtension._iscIsA( 'EventWindow', iscobj.parentElement.parentElement.parentElement ) ) {
                    return iscobj.parentElement.parentElement.parentElement;
                }
            }
            if ( smartclientExtension._iscIsA( 'Canvas', iscobj ) && smartclientExtension._getHandleForISCObject( iscobj ) !== o ) {
                return undefined;
            }
            return iscobj;
        }
    }
    return undefined;
}

smartclientExtension._getHandleForISCObject = function( iscobj ) {
    if( !iscobj ) {
        return undefined;
    }

    // For combobox and selectitem we need some special handling since the outer element
    // is not always suitable and neither is the handle. This can potentially break script
    // execution if the page changes to include hints or removes them, but I don't see a
    // better option since the elements themselves do not provide any good identification
    // mechanism.
    if( smartclientExtension._iscIsA( 'ComboBoxItem', iscobj ) || smartclientExtension._iscIsA( 'SelectItem', iscobj ) ) {
        if( iscobj.hint ) {
            // When the hint is present we can safely use the outer element that generates a suitable name
            return iscobj.getOuterElement();
        } else {
            // When no hint is present we need to use the handle since the outerelement will be some control-table
            // for which the generated name will not give us a suitable element again during object lookup
            // This mostly affects combo-like multi-selects as far as I can see.
            return iscobj.getHandle();
        }
    } else {
        return iscobj.getHandle();
    }
}

smartclientExtension._isSectionHeaderObject = function( iscobj ) {
    return smartclientExtension._iscIsA( 'SectionHeader', iscobj ) || smartclientExtension._iscIsA( 'ImgSectionHeader', iscobj );
}

smartclientExtension._isStandaloneMenuButton = function( iscobj ) {
    return ( smartclientExtension._iscIsA( 'IMenuButton', iscobj ) || smartclientExtension._iscIsA( 'MenuButton', iscobj ) ) && !smartclientExtension._iscIsA( 'MenuBarButton', iscobj );
}

// Determines whether the given htmlelem is a grid-checkbox for the given gridobj and record
smartclientExtension._isTreeGridCheckboxObject = function( gridobj, record, htmlelem ) {
    var icons = undefined;
    if( gridobj.selectionAppearance == "checkbox" ) {
        // Logic taken from TreeGrid._getCheckboxIcon which we cannot call directly due to smartclients
        // name-mangling
        if (!gridobj.body.canSelectRecord(record)) {
            // record cannot be selected but we want the space allocated for the checkbox anyway.
            icons = ["[SKINIMG]/blank.gif"];
        } else {
            // Fetch all possible states since we need to compare against
            // them all as the internal state and html-content are not always
            // in sync
            icons = [];
            for( var i = 0; i < 2; i++ ) {
                for( var j = 0; j < 2; j++ ) {
                    var isPartSel = (i==0);
                    var isSel = (j==0);
                    icons[icons.length] = isPartSel ? (gridobj.checkboxFieldPartialImage || gridobj.booleanPartialImage)
                                        : isSel ? (gridobj.checkboxFieldTrueImage || gridobj.booleanTrueImage)
                                            : (gridobj.checkboxFieldFalseImage || gridobj.booleanFalseImage);
                }
            }
        }
    } else {
        icons = gridobj.getExtraIcon( record );
    }

    if( icons ) {
        // Need to test against all icons, since apparently the internal state
        // of the checkbox has already changed when this function is called,
        // but the HTML has not been redrawn.  So if the function is called as
        // part of a click-event, the htmlelem.src will point to unchecked
        // image, but the icon will be the checked one already. So simply test
        // all possible variations.
        for( i = 0; i < icons.length; i++ ) {
           if( htmlelem.src == gridobj.getImgURL( icons[i] ) ) {
               return true;
           }
        }
    }
    return false;
}
// Checks whether the given htmlelem is a checkbox for a treegrid item
smartclientExtension._isTreeGridCheckbox = function( htmlelem ) {
    if( htmlelem.tagName == 'IMG' ) {
        var gridobj = smartclientExtension._getListGridObject( htmlelem );
        if( gridobj && smartclientExtension._iscIsA( 'TreeGrid', gridobj ) ) {
            // Fetch the 'normal' item-object since we need to acquire the handle from it to find the
            // record
            var griditemobj = smartclientExtension._getISCObject( htmlelem );
            var record = smartclientExtension._findListGridRecord( gridobj, smartclientExtension._getHandleForISCObject( griditemobj ) );
            if( record ) {
                return smartclientExtension._isTreeGridCheckboxObject( gridobj, record, htmlelem );
            }
        }
    }
    return false;
}

smartclientExtension._getISCObjectAndSCType = function( htmlelem ) {
    var iscobj = smartclientExtension._getISCObject( htmlelem );
    var handle = smartclientExtension._getHandleForISCObject( iscobj );
    var sctype = undefined;
    if( iscobj && handle && handle == htmlelem ) {
        // Now need to determine the type
        if( iscobj instanceof smartclientExtension.ListGridItemISCObjectDummy ) {
            // Check for most-specialized type first
            if( smartclientExtension._iscIsA( 'TreeGrid', iscobj.view ) ) {
                sctype = smartclientExtension.TreeGridItem;
            } else if( smartclientExtension._iscIsA( 'DaySchedule', iscobj.view ) || smartclientExtension._iscIsA( 'MonthSchedule', iscobj.view ) || smartclientExtension._iscIsA( 'TimelineView', iscobj.view ) ) {
                sctype = smartclientExtension.CalendarItem;
            } else {
                sctype = smartclientExtension.ListGridItem;
            }
        } else if( iscobj instanceof smartclientExtension.MenuItemISCObjectDummy ) {
            sctype = smartclientExtension.MenuItem;
        } else if( smartclientExtension._iscIsA( 'ComboBoxItem', iscobj ) ) {
            sctype = smartclientExtension.ComboBoxItem;
        } else if( smartclientExtension._iscIsA( 'SelectItem', iscobj ) ) {
            sctype = smartclientExtension.SelectItem;
        } else if( smartclientExtension._iscIsA( 'ListGrid', iscobj ) && !smartclientExtension._iscIsA( 'TreeGrid', iscobj ) && !smartclientExtension._iscIsA( 'Menu', iscobj ) && !smartclientExtension._iscIsA( 'MenuBar', iscobj ) && !smartclientExtension._iscIsA( 'DaySchedule', iscobj ) && !smartclientExtension._iscIsA( 'MonthSchedule', iscobj ) && !smartclientExtension._iscIsA( 'TimelineView', iscobj ) ) {
            sctype = smartclientExtension.ListGrid;
        } else if( smartclientExtension._iscIsA( 'RadioItem', iscobj ) ) {
            sctype = smartclientExtension.RadioItem;
        } else if( smartclientExtension._iscIsA( 'FormItem', iscobj ) ) {
            sctype = smartclientExtension.FormItem;
        } else if( smartclientExtension._iscIsA( 'TabSet', iscobj ) ) {
            sctype = smartclientExtension.TabWidget;
        } else if( smartclientExtension._iscIsA( 'ImgTab', iscobj ) ) {
            sctype = smartclientExtension.Tab;
        } else if( smartclientExtension._iscIsA( 'ColorItem', iscobj ) ) {
            sctype = smartclientExtension.ColorField;
        } else if( smartclientExtension._isSectionHeaderObject( iscobj ) ) {
            sctype = smartclientExtension.SectionHeader;
        } else if( smartclientExtension._iscIsA( 'TreeGrid', iscobj ) ) {
            sctype = smartclientExtension.TreeGrid;
        } else if( smartclientExtension._iscIsA( 'Progressbar', iscobj ) ) {
            sctype = smartclientExtension.ProgressBar;
        } else if( smartclientExtension._iscIsA( 'Menu', iscobj ) || smartclientExtension._iscIsA( 'MenuBar', iscobj ) ) {
            sctype = smartclientExtension.Menu;
        } else if( smartclientExtension._iscIsA( 'MenuBarButton', iscobj ) ) {
            sctype = smartclientExtension.MenuItem;
        } else if( smartclientExtension._isStandaloneMenuButton( iscobj ) ) {
            sctype = smartclientExtension.MenuButton;
        } else if( smartclientExtension._iscIsA( 'DateChooser', iscobj ) ) {
            sctype = smartclientExtension.DateChooser;
        } else if( smartclientExtension._iscIsA( 'DaySchedule', iscobj ) || smartclientExtension._iscIsA( 'MonthSchedule', iscobj ) || smartclientExtension._iscIsA( 'TimelineView', iscobj ) ) {
            sctype = smartclientExtension.Calendar;
        } else if( smartclientExtension._iscIsA( 'EventWindow', iscobj ) ) {
            sctype = smartclientExtension.CalendarEvent;
        } else if ( smartclientExtension._isISCButton( iscobj ) ) {
            sctype = smartclientExtension.Button;
        } else {
            // Fallback, consider all iscobjects at least a widget
            sctype = smartclientExtension.Widget;
        }
    } else if( iscobj && handle && iscobj instanceof smartclientExtension.ListGridItemISCObjectDummy ) {
        // Special case of the TreeGrid's handle for an item since we'd otherwise recognize that one as
        // a normal item. To be able to properly identify it, the eventObject function makes sure to return
        // the original object for the click, so the item-handle won't match it. Handle that case here
        // specially
        var itemHandle = squishsctreegridExtension.itemHandle( handle );
        if( itemHandle && itemHandle == htmlelem ) {
            sctype = smartclientExtension.TreeGridHandle;
        } else if( smartclientExtension._isTreeGridCheckbox( htmlelem ) ) {
            sctype = smartclientExtension.TreeGridCheckbox;
        }
    }
    if( iscobj !== undefined && sctype !== undefined ) {
        return { 'iscobj':iscobj, 'sctype': sctype }
    }
    return undefined;
}

// Internal type-check function which can find out which type of smartclient object the
// given element belongs to. This only checks the type of the actual object, it does not
// try to find a isc-type from parent objects
smartclientExtension.getType = function( o ) {
    if ( !o ) {
        return undefined;
    }
    if( smartclientExtension.isSmartClientLoaded() ) {
        var iscobjAndType = smartclientExtension._getISCObjectAndSCType( o );
        if( iscobjAndType ) {
            return iscobjAndType['sctype'];
        }
    }
    return undefined;
}

smartclientExtension._visitListGridItems = function( grid, matchFunction ) {
    try {
        if( grid && matchFunction ) {
            var rowCount = grid.getTotalRows();
            var fields = grid.getFields();
            for( var rowNum = 0; rowNum < rowCount; rowNum++ ) {
                var record = grid.getCellRecord( rowNum, 0 );
                for( var fieldnum = 0; fieldnum < fields.length; fieldnum++ ) {
                    var field = fields[fieldnum];
                    var returnVal = matchFunction( grid, rowNum, record, field );
                    if( returnVal ) {
                        return returnVal;
                    }
                }
            }
        }
    } catch (_e) {
        // Ignore
    }
    return undefined;
}
smartclientExtension._getListGridObject = function( o ) {
    var wantedObject = isc.AutoTest.locateCanvasFromDOMElement( o );
    // Ignore the contents of a ListGrid except for the items themselves, so return the complete
    // grid instead of the viewport/body element
    if( smartclientExtension._iscIsA( 'GridBody', wantedObject ) && smartclientExtension._iscIsA( 'ListGrid', wantedObject.parentElement ) ) {
        return wantedObject.parentElement;
    } else if( smartclientExtension._iscIsA( 'ListGrid', wantedObject ) ) {
        return wantedObject;
    }
    return undefined;
}

smartclientExtension._getSelectItemObjectInternal = function( o ) {
    var formitem = isc.AutoTest.getLocatorFormItem(isc.AutoTest.getLocator(o));
    if( smartclientExtension._iscIsA( 'SelectItem', formitem ) ) {
        return formitem;
    }
    return undefined;
}

smartclientExtension._getSelectItemObject = function( o ) {
    var formitem = smartclientExtension._getSelectItemObjectInternal( o );
    if( formitem ) {
        return formitem;
    }
    // Handle the case of o being part of the list-grid thats used internally in a selectitem
    var wantedObject = smartclientExtension._getListGridObject( o );
    // Make sure we really have a ListGrid here, prevents endless recursion in case the above
    // call does something wrong.
    if( wantedObject && smartclientExtension._iscIsA( 'ListGrid', wantedObject ) && wantedObject.getHandle() ) {
        return smartclientExtension._getSelectItemObjectInternal( wantedObject.getHandle().parentNode );
    }
    return undefined;
}

smartclientExtension._getComboBoxObjectInternal = function( o ) {
    var formitem = isc.AutoTest.getLocatorFormItem(isc.AutoTest.getLocator(o));
    if( smartclientExtension._iscIsA( 'ComboBoxItem', formitem ) ) {
        return formitem;
    }
    return undefined;
}

smartclientExtension._getComboBoxObject = function( o ) {
    var formitem = smartclientExtension._getComboBoxObjectInternal(o);
    if( formitem ) {
        return formitem;
    }
    // Handle the case of o being part of the list-grid thats used internally in a combobox
    var wantedObject = smartclientExtension._getListGridObject( o );
    // Make sure we really have a ListGrid here, prevents endless recursion in case the above
    // call does something wrong.
    if( wantedObject && smartclientExtension._iscIsA( 'ListGrid', wantedObject ) && wantedObject.getHandle() ) {
        return smartclientExtension._getComboBoxObjectInternal( wantedObject.getHandle().parentNode );
    }
    return undefined;
}

// Generates the top-most useful element for a given smartclient object when generating event-info
// This is not used when navigating the spy tree.
smartclientExtension.eventObject = function( o ) {
    if( !smartclientExtension.isSmartClientLoaded() ) {
        return undefined;
    }
    // Make sure to also check parent objects here, since the actual click might be on some
    // child.
    var iscobj = smartclientExtension._getISCObject( o );
    if( iscobj ) {
        // Special case of the tree handle of TreeGrid, in that case we'd find the item, but
        // we want to return the actual <img> element so the typeOf check can generate the
        // special tree-handle type
        if( iscobj instanceof smartclientExtension.ListGridItemISCObjectDummy ) {
            var type = smartclientExtension.getType( o );
            if( type == smartclientExtension.TreeGridHandle ) {
                return o;
            } else if( type == smartclientExtension.TreeGridCheckbox ) {
                // Same thing for a checkbox in tree's, since here we need to identify the checkbox based on
                // the item in the first 'column'. using clickItem(row,col) is not useful since the checkbox
                // is no item itself
                return o;
            }
        }
        return smartclientExtension._getHandleForISCObject( iscobj );
    }
    return undefined;
}

smartclientExtension._isISCEventWindow = function( iscobj ) {
    // Calendar may be stripped from the SmartClient app
    if ( isc.isA && isc.isA.EventWindow ) {
        return smartclientExtension._iscIsA( 'EventWindow', iscobj );
    }
    return false
}

smartclientExtension._isISCButton = function( iscobj ) {
    return (iscobj.getClass() === isc.Button) || (iscobj.getClass() === isc.ImgButton) || (iscobj.getClass() === isc.IButton);
}

smartclientExtension._internalTypeOf = function( iscobjAndSCType ) {
    if( !iscobjAndSCType ) {
        return undefined;
    }
    switch( iscobjAndSCType['sctype'] ) {
        case smartclientExtension.Widget:
            // No type, so lets fallback to squish's default behaviour using the eventObject
            break;
        case smartclientExtension.Button:
            return "custom_button_squishscbutton";
        case smartclientExtension.ComboBoxItem:
            return "custom_combobox_squishsccombobox";
        case smartclientExtension.SelectItem:
            return "custom_selectlist_squishscselectitem";
        case smartclientExtension.FormItem:
            // Need to go through locator->formitem since isc.AutoTest has no suitable
            // function to get at the formitem like locateCanvasFromDOMElement
            var formitem = iscobjAndSCType['iscobj'];
            if( smartclientExtension._iscIsA( 'TextItem', formitem ) && !smartclientExtension._iscIsA( 'ColorItem', formitem ) ) {
                return "custom_text_squishsctextitem";
            } else if( smartclientExtension._iscIsA( 'TextAreaItem', formitem ) ) {
                return "custom_text_squishsctextitem";
            } else if( smartclientExtension._iscIsA( 'PasswordItem', formitem ) ) {
                return "custom_text_squishsctextitem";
            } else if( smartclientExtension._iscIsA( 'CheckboxItem', formitem ) ) {
                return "custom_checkbox_squishsccheckbox";
            } else if( smartclientExtension._iscIsA( 'ColorItem', formitem ) ) {
                return "colorfield_squishsccolorfield";
            }
            // No type, so lets fallback to squish's default behaviour using the eventObject
            break;
        case smartclientExtension.RadioItem:
            return "custom_radiobutton_squishscradioitem";
        case smartclientExtension.TreeGrid:
            return "custom_itemview_squishsctreegrid";
        case smartclientExtension.TreeGridHandle:
            return "custom_itemhandle_squishsctreegrid";
        case smartclientExtension.TreeGridItem:
        case smartclientExtension.TreeGridCheckbox:
            return "custom_item_squishsctreegrid";
        case smartclientExtension.ListGrid:
            return "custom_itemview_squishsclistgrid";
        case smartclientExtension.ListGridItem:
            return "custom_item_squishsclistgrid";
        case smartclientExtension.TabWidget:
            return "tabwidget_squishsctabwidget";
        case smartclientExtension.Tab:
            return "tabitem_squishsctab";
        case smartclientExtension.ColorField:
            return "colorfield_squishsccolorfield";
        case smartclientExtension.SectionHeader:
            return "expandablesectionheader_squishscsectionheader";
        case smartclientExtension.ProgressBar:
            return "progressbar_squishscprogressbar";
        case smartclientExtension.Menu:
            return "menu_squishscmenu";
        case smartclientExtension.MenuItem:
            return "menuitem_squishscmenu";
        case smartclientExtension.MenuButton:
            return "menubutton_squishscmenubutton";
        case smartclientExtension.DateChooser:
            return "datechooser_squishscdatechooser";
        case smartclientExtension.Calendar:
            return "calendarview_squishsccalendar";
        case smartclientExtension.CalendarItem:
            // Re-Use ListGrid Item API here since Calendar items (i.e. the timeslots) behave like listgrid items
            return "custom_item_squishsclistgrid";
        case smartclientExtension.CalendarEvent:
            return "calendarevent_squishsccalendar";
    }
    return undefined;
}

smartclientExtension.objectNameAndType = function( o ) {
    if( !o || !smartclientExtension.isSmartClientLoaded() ) {
        return undefined;
    }
    var iscobjAndSCType = smartclientExtension._getISCObjectAndSCType( o );

    if( iscobjAndSCType ) {
        return { 'name' : smartclientExtension._internalNameOf( iscobjAndSCType, o ),
                 'type' : smartclientExtension._internalTypeOf( iscobjAndSCType ) };
    }
    return undefined;
}

// object type hook to handle certain web-elements as opaque objects
// and generate form-types for some of the custom styled form items
// This should only generate type information if the object really is of the given
// type, not if it is some sub-object. Otherwise navigation in the spy will break
smartclientExtension.typeOf = function( o ) {
    if( !smartclientExtension.isSmartClientLoaded() ) {
        return undefined;
    }
    var iscobjAndSCType = smartclientExtension._getISCObjectAndSCType( o );
    if( iscobjAndSCType ) {
        return smartclientExtension._internalTypeOf( iscobjAndSCType );
    }
    return undefined;
}

smartclientExtension._getListGridCellValue = function( record, field, grid ) {
    var fieldName = field.name;
    if( field.getFieldTitle ) {
        // Some types of fields provide their own getFieldTitle function since
        // the field's name does not map into the records actuals properties
        // This happens for example for the checkbox-TreeGrid at
        // http://torzurwelt.froglogic.com/web-app-samples/smartgwt-2.4.0-showcase/#tree_checkbox
        fieldName = field.getFieldTitle(grid, field.masterIndex );
    }
    // This logic is copied from ListGrid.getRawValue and slightly adjusted since the grid.getSpeficiedField will
    // not work with the changed fieldName, but we do need to pass that adjusted fieldname to getRawCellValue to
    // get the correct result in cases like the checkbox-TreeGrid
    var recordIndex = grid.getRecordIndex(record);

    if (recordIndex < 0) {
        return record[fieldName];
    }

    if (record[field[grid.fieldIdProperty]]!= null) {
        return record[field[grid.fieldIdProperty]];
    }
    // Need to use the raw value here, otherwise we would get HTML code on some kind
    // of items (like the checkbox in some lists or images etc. for tree nodes)
    var rawValue = grid.getRawCellValue(record, recordIndex, field.masterIndex, false);
    if ( !rawValue && field.getCellValue ) {
        return field.getCellValue( grid, record, recordIndex );
    }
    return rawValue;
}

smartclientExtension.isSmartClientLoaded = function() {
    return (window.__squish__isSmartclientFound() && isc && isc.AutoTest);
}

// Checks whether the given field contains textual data or has some special type
// like boolean, checkbox field, expansion field etc.
smartclientExtension._isNonTextualField = function( gridobj, itemText, field ) {
    var isCalendarClickEmptyText = itemText == '' && ( smartclientExtension._iscIsA( 'DaySchedule', gridobj ) || smartclientExtension._iscIsA( 'MonthSchedule', gridobj ) || smartclientExtension._iscIsA( 'TimelineView', gridobj ) );
    // See ListGrid.js/ListGridFieldType
    // boolean fields are represented as checkbox, so need to do row/col there too
    // TODO: Test out other non-trivial types like date/time, image, icon, binary
    var isBool = field.type == "boolean";
    var isCheckbox = false;
    try{
        isCheckbox = gridobj.isCheckboxField( field );
    } catch (e) {
        // Ignore
    }
    // ListGrid can have expandable items, there's a special column with the
    // expansion handle, so lets make sure we're recording clickItem(row,col) for that.
    var isExpandCol = false;
    try{
        isExpandCol = gridobj.isExpansionField( field );
    } catch (e) {
        // Ignore
    }
    return ( isExpandCol ||
             isCheckbox ||
             isCalendarClickEmptyText ||
             isBool );
}

smartclientExtension._internalNameOf = function( iscobjAndSCType, htmlelem ) {
    if( !iscobjAndSCType ) {
        return undefined;
    }
    switch( iscobjAndSCType['sctype'] ) {
        case smartclientExtension.ListGrid:
            // falls through
        case smartclientExtension.TreeGrid:
            var wantedObject = iscobjAndSCType['iscobj'];
            return Squish.uniquifyName( smartclientExtension.nameOfWidget( wantedObject.getHandle() ), wantedObject.getHandle() );
        case smartclientExtension.TreeGridCheckbox:
            // Adjust 'o' to be the actual item now, so the name-generation works correctly
            htmlelem = smartclientExtension._getHandleForISCObject( iscobjAndSCType['iscobj'] );
            // deliberate fallthrough to re-use the item-logic.
        case smartclientExtension.ListGridItem:
            // falls through
        case smartclientExtension.CalendarItem:
            // falls through
        case smartclientExtension.TreeGridItem:
            var gridObject = iscobjAndSCType['iscobj'].view;
            return smartclientExtension.nameOf( gridObject.getHandle() );
        case smartclientExtension.TreeGridHandle:
            // Special case, we'll have to find the name of the item, which can
            // most easily be done by fetching the eventObject of the parent of
            // 'o' since that is the <img> element representing the item's tree handle
            return smartclientExtension.nameOf( smartclientExtension.eventObject( htmlelem.parentNode ) );
        case smartclientExtension.MenuItem:
            // Menu items are not well identifiable since we'd like to identify the whole row, but the
            // ISC framework only identifies the table cell or the body via the locator. Hence return
            // the name of the Menu itself. This mostly affects picking since generation of clickItem
            // is handled via an event-handler.
            // Cannot assume that the parentNode will lead us to the menu/menubar, this does not work in all browsers
            var menuiteminfo = squishscmenuExtension._findMenuAndItemObjectsForISCObject( iscobjAndSCType["iscobj"] );
            if( menuiteminfo ) {
                return smartclientExtension.nameOf( smartclientExtension._getHandleForISCObject( menuiteminfo["menu"] ) );
            }
            // falls through
        default:
            return Squish.uniquifyName( smartclientExtension.nameOfWidget( htmlelem ), htmlelem );
    }
}

// Provide names with the iscLocator for objects from smartclient lib
smartclientExtension.nameOf = function( o ) {
    if ( !o ) {
        return undefined;
    }

    if( !smartclientExtension.isSmartClientLoaded() ) {
        return undefined;
    }

    var iscobjAndSCType = smartclientExtension._getISCObjectAndSCType( o );
    if( iscobjAndSCType ) {
        return smartclientExtension._internalNameOf( iscobjAndSCType, o );
    }

    return undefined;
}

// Generate object names using the iscLocator special property
smartclientExtension.nameOfWidget = function( o ) {
    var n = '{';
    n += Squish.propertiesToName( o, [ 'tagName' ] );
    // Need to escape the || since thats used when picking items to separate the object name from the item text
    n += "iscLocator='"+isc.AutoTest.getLocator( o ).replace(/\|\|/g, "\\|\\|") + "'";
    n += '}';
    return n;
}

smartclientExtension._getISCObjectForIscLocatorValue = function( iscLocator ) {
    // Need to unescape the \|\| here again which is added in nameOfWidget
    var elem = isc.AutoTest.getElement( iscLocator );
    if( !elem ) {
        // Some isc-locator paths are not possible to find again via getElement, but getLocatorFormItem
        // can find the corresponding isc object again. This is specifically true for the locator for
        // the outer element of a comboboxitem
        return isc.AutoTest.getLocatorFormItem( iscLocator );
    } else {
        // Seems to be necessary in newer SmartGWT to properly identify the combobox, in newer versions the
        // getElement function has been fixed to return the input element for a combobox-locator and hence
        // the matching breaks since the generated name used the outer-element (the table).
        // By going through the isc-obj and our getHandle function again we make sure to do the same lookup
        // as is done during name-generation
        return smartclientExtension._getISCObject( elem );
    }
};

smartclientExtension.IscLocatorMatcher = function( propertyValue/*, objectNam*/ ) {
    var unescapedvalue = propertyValue.value.replace(/\\\|\\\|/g, "||");
    this.iscObject = smartclientExtension._getISCObjectForIscLocatorValue( unescapedvalue );
    this.element = this.iscObject ? smartclientExtension._getHandleForISCObject( this.iscObject )
                                  : null;
    this.objectName = name;
    this.matchObject = function( o ) {
        if ( !this.iscObject ) {
            Squish.addUnmatchedProperty( this.objectName, this.propertyValue );
        }
        var elem = this.element;
        if( smartclientExtension._iscIsA( 'RadioGroupItem', this.iscObject ) && unescapedvalue.indexOf( "RadioItem" ) != -1 ) {
            elem = undefined;
            // Need this to properly identify RadioItems inside a RadioGroupItem. In that case, we first get
            // to match the TD element for the RadioGroupItem and the above function getLocatorFormItem will
            // retrieve the RadioGroupItem object even if passed the locator for a RadioItem. Hence for the
            // case of the locator containing a RadioItem reference we need to find the actual item manually
            // by iterating all children. This is hopefully not too expensive as usually there are not many
            // items.
            var items = this.iscObject.getItems();
            for( var i = 0; i < items.length; i++ ) {
                if( items[i].getOuterElement() == o ) {
                    return true;
                }
            }
        }
        if ( elem && elem == o ) {
            return true;
        } else {
            Squish.addUnmatchedProperty( this.objectName, this.propertyValue );
        }
    };
}

// Hook for identifying objects using the iscLocator special property
smartclientExtension.matchObjectFactory = function( prop, value, name ) {
    if( smartclientExtension.isSmartClientLoaded() && prop == "iscLocator" ) {
        return new smartclientExtension.IscLocatorMatcher( value, name );
    }
    return undefined;
}


// Support recording of combobox-changes by hooking into event-type and event-to-string
// generation
smartclientExtension._isComboBoxChangeEvent = function( obj, ev ) {
    var combobox = smartclientExtension._getComboBoxObject( obj );
    // If this is a mousedown on the listgrid object belonging to a combox we want to
    // generate a change event
    if( smartclientExtension.getType( obj ) == smartclientExtension.ComboBoxItem
            // Have a combobox object
            && combobox && ev.type == "mousedown" ) {
        var pickList = combobox.pickList;
        // Picklist is shown
        if( pickList && !pickList.destroyed && pickList.isVisible() ) {
            return true;
        }
    }
    return false;
}
smartclientExtension.comboBoxEventTypeHook = function( obj, ev, objType ) {
    if( smartclientExtension.isSmartClientLoaded() && objType == "custom_combobox_squishsccombobox" ) {
        if( smartclientExtension._isComboBoxChangeEvent( obj, ev ) ) {
            return "change";
        }
    }
    return undefined;
}
smartclientExtension.comboBoxEventToStringHook = function( type, obj, ev ) {
    if( smartclientExtension.isSmartClientLoaded() && type == "custom_combobox_squishsccombobox") {
        var combobox = smartclientExtension._getComboBoxObject( obj );
        if( smartclientExtension._isComboBoxChangeEvent( obj, ev ) &&
                combobox && combobox.pickList && combobox.pickList.selection ) {
            // Use the pickList selection here since the combobox-selectedrecord is not
            // yet updated
            // TODO: Support for multi-select comboboxes
            var selRecord = combobox.pickList.selection.getSelectedRecord();
            var valueField = combobox.getValueFieldName();
            return "&value="+escape(selRecord[valueField]);
        }
    }
    return undefined;
}

// Support recording of selectitem-changes by hooking into event-type and event-to-string
// generation
smartclientExtension._isSelectItemChangeEvent = function( obj, ev ) {
    var selectitem = smartclientExtension._getSelectItemObject( obj );
    // If this is a mousedown on the listgrid object belonging to a combox we want to
    // generate a change event
    if( smartclientExtension.getType( obj ) == smartclientExtension.SelectItem
            // Have a selectitem object
            && selectitem && ev.type == "mousedown" ) {
        var pickList = selectitem.pickList;
        // Picklist is shown
        if( pickList && !pickList.destroyed && pickList.isVisible() ) {
            return true;
        }
    }
    return false;
}

// Special case of NativeSelectItem which is rendered using a native <input type='select'>
// and hence generates proper change-events. At the same time though the value-property does
// not seem to be updated
smartclientExtension._isNativeSelectItemChangeEvent = function( obj, ev ) {
    var selectitem = smartclientExtension._getSelectItemObject( obj );
    if( smartclientExtension.getType( obj ) == smartclientExtension.SelectItem
            // NativeSelectItem and change event
            && selectitem && smartclientExtension._iscIsA( 'NativeSelectItem', selectitem )
            && ev.type == "click" ) {
        return true;
    }
    return false;
}

smartclientExtension.selectItemEventTypeHook = function( obj, ev, objType ) {
    if( smartclientExtension.isSmartClientLoaded() && objType == "custom_selectlist_squishscselectitem" ) {
        if( smartclientExtension._isSelectItemChangeEvent( obj, ev ) || smartclientExtension._isNativeSelectItemChangeEvent( obj, ev ) ) {
            return "change";
        }
    }
    return undefined;
}

smartclientExtension.selectItemEventToStringHook = function( type, obj, ev ) {
    if( smartclientExtension.isSmartClientLoaded() && type == "custom_selectlist_squishscselectitem") {
        var selectitem = smartclientExtension._getSelectItemObject( obj );
        var options = [];
        // Depending on the type of SelectItem implementation need slightly different
        // code to get the text of the selected items
        if( smartclientExtension._isSelectItemChangeEvent( obj, ev ) &&
                selectitem && selectitem.pickList && selectitem.pickList.selection ) {
            var valueField = selectitem.getValueFieldName();
            var rowCount = selectitem.pickList.getTotalRows();
            var selectionProperty = selectitem.pickList.selection.selectionProperty;
            for( var i = 0; i < rowCount; ++i ) {
                var record = selectitem.pickList.getRecord( i, 0 );
                if( record[selectionProperty] === true ) {
                    options[options.length] = record[valueField];
                }
            }
        } else if( smartclientExtension._isNativeSelectItemChangeEvent( obj, ev ) &&
                selectitem ) {
            if( selectitem.multiple ) {
                // Need to access the options directly since we use a slightly different logic for
                // joining the elements, use the data-element since outerelement/handle may point to
                // to surrounding elements instead of the select object
                options = Squish.getSelectedOptionTexts(selectitem.getDataElement());
            } else {
                // Use getElementValue since the getValue field is not immediately updated when our handler is called
                options[0] = selectitem.getElementValue();
            }

        }
        if( options.length > 0 ) {
            if( selectitem.multiple ) {
                // For multi-select join the array according to our rules
                return "&value="+escape(Squish.createMultiOptionString(options));
            } else {
                // For a single-select one we can simply add the first element
                return "&value="+escape(options[0]);
            }
        }
    }
    return undefined;
}

smartclientExtension.textItemEventToStringHook = function( type, obj, ev ) {
    if( !smartclientExtension.isSmartClientLoaded() ) {
        return undefined;
    }
    if( ( ev.type == "keydown" || ev.type == "keyup" )
            && type == "custom_text_squishsctextitem"
            && smartclientExtension.getType( obj ) == smartclientExtension.FormItem ) {
        var formitem = smartclientExtension._getISCObject( obj );
        if( formitem ) {
            if( smartclientExtension._iscIsA( 'TextItem', formitem ) || smartclientExtension._iscIsA( 'TextAreaItem', formitem ) ) {
                return "&value="+escape(formitem.getEnteredValue());
            }
        }
    }
    return undefined;
}

smartclientExtension.clickTabEventToStringHook = function( type, obj, ev ) {
    if( ev.type == "mousedown" && type == "tabitem_squishsctab" &&
            smartclientExtension.getType( obj ) == smartclientExtension.Tab ) {

        return Squish.createClickTabInformation( squishsctabExtension.getTabWidget( obj ), squishsctabExtension.getTitle( obj ) );
    }
    return undefined;
}

// Checks whether the given iscobj is a ColorPicker or is part of a ColorPicker dialog
smartclientExtension._findColorPickerParent = function( iscobj ) {
    // For form items we want to start at the form-level since the item has no parentElement
    if( smartclientExtension._iscIsA( 'FormItem', iscobj ) ) {
        iscobj = iscobj.form;
    }
    while( iscobj && !smartclientExtension._iscIsA( 'ColorPicker', iscobj ) ) {
        iscobj = iscobj.parentElement;
    }
    if( iscobj && smartclientExtension._iscIsA( 'ColorPicker', iscobj ) ) {
        return iscobj;
    }
    return undefined;
}

// Determine safely if the given ColorPicker instance has a ColorItem associated to it.
smartclientExtension._hasAssociatedColorItem = function( colorpicker ) {
    var formitem = undefined;
    try {
        if( colorpicker.callingFormItem ) {
            formitem = colorpicker.callingFormItem;
        }
    }catch(e) {
        // Cannot access the property, so there's no formitem
        return false;
    }
    // Now lets double-check its a ColorItem
    return ( formitem && smartclientExtension._iscIsA( 'ColorItem', formitem ) );
}

// Determine if the given iscobj relates to a color-button in the colorpicker when its in
// the 'simple' mode.
smartclientExtension._isSimpleColorPickButton = function( iscobj, colorpicker ) {
    // This uses internal knowledge about the JS class ColorPicker, the showOkButton is an easy-to-access
    // public member of the colorpicker object indicating whether the complex or simple mode is active
    if( !colorpicker.showOkButton ) {
        try {
            // Check some internal properties that are set on the individual color-buttons to make sure
            // iscobj is a color-button
            if( iscobj.picker && smartclientExtension._iscIsA( 'StatefulCanvas', iscobj ) &&
                    iscobj.baseStyle == colorpicker.colorButtonBaseStyle ) {
                return true;
            }
        }catch(e) {
            // Ignore, possibly no picker attribute or no baseStyle
        }
    }
    return false;
}

// Generate chooseColor events for interactions with a SmartClient ColorItem or ColorPicker
smartclientExtension.chooseColorEventTypeHook = function( obj, ev, objType ) {
    if( !smartclientExtension.isSmartClientLoaded() ) {
        return undefined;
    }
    var iscobj = undefined;
    // Check whether a keyup executed on a coloritem to see whether the color info is complete
    if( ev.type == 'keyup' && objType == "colorfield_squishsccolorfield" ) {
        iscobj = smartclientExtension._getISCObject( obj );
        // keyboard event on the color items text field, check if the value is a valid rgb value
        var val = iscobj.getEnteredValue();
        if( val.search( /^#[\dabcdef]{6}$/ ) != -1 ) {
            return "chooseColor"
        }
        // A keyup on a coloritem should not be recorded at all if the color is not complete
        return "ignoreEvent";
    }
    // Ok, no keyup on a coloritem, lets see whether its any other event on a coloritem
    iscobj = smartclientExtension._getISCObject( obj );
    if( iscobj ) {
        // This makes sure to ignore any other events on a color item, including focus, change etc.
        if( smartclientExtension._iscIsA( 'ColorItem', iscobj ) ) {
            return "ignoreEvent";
        }
        // no color item, so check whether the object is part of a color picker. If thats the
        // case check whether its the ok-button. Otherwise ignore it by using the incomplete-type.
        var colorpicker = smartclientExtension._findColorPickerParent( iscobj );
        if( colorpicker && smartclientExtension._hasAssociatedColorItem( colorpicker ) ) {
            if ( ev.type != "click" ) {
                return "ignoreEvent";
            }
            // Only do the chooseColor when clicking, not on mousedown so we avoid a duplicate
            if( smartclientExtension._isISCButton( iscobj ) && iscobj.getTitle() == "OK" ) {
                // Click on the ok-button, so need to send out a chooseColor event
                return "chooseColor";
            } else if( smartclientExtension._isSimpleColorPickButton( iscobj, colorpicker ) ) {
                // ColorPicker in simple-mode and a color was clicked, so generate a chooseColor event since the
                // clicking of the color-button will trigger the selection and close the dialog
                return "chooseColor";
            } else {
                // Click elsewhere in the colorpicker, ignore the event
                return "ignoreEvent";
            }
        }
    }
    return undefined;
}

// Generate additional information for chooseColor events
smartclientExtension.chooseColorEventToStringHook = function( objtype, obj, ev, evType ) {
    if( !smartclientExtension.isSmartClientLoaded() ) {
        return undefined;
    }

    if( evType == "chooseColor" ) {
        // Get the value and send that along
        var iscobj = smartclientExtension._getISCObject( obj );
        // iscobj should never be null since its been checked already in the evenTypeHook function
        // and only if its valid a chooseColor event type has been generated
        if( smartclientExtension._iscIsA( 'ColorItem', iscobj ) ) {
            return "&colorFieldValue="+escape( iscobj.getEnteredValue() );
        } else {
            var colorpicker = smartclientExtension._findColorPickerParent( iscobj );
            // No need to check whether there's a coloritem here since we already determined that
            // in the eventType hook.
            // Add the colorItem's object name so the C++ side can use that for the name in the chooseColor
            // function. Otherwise it would use the name of the ok-button which is not very useful
            var itemName = smartclientExtension.nameOf( smartclientExtension._getHandleForISCObject( colorpicker.callingFormItem ) );
            return "&colorFieldValue="+escape( colorpicker.getHtmlColor() ) + "&colorFieldName="+escape( itemName );
        }
    } else if( evType == "ignoreEvent" && smartclientExtension._getISCObject( obj ) ) {
        // No further data needed, C++ side will simply ignore this event, but need to make sure this
        // hook is considered to be handling the event if its an iscobj.
        return "";
    }
    return undefined;
}
smartclientExtension.listGridRowColEventToStringHook = function( type, obj, ev ) {
    if( smartclientExtension.isSmartClientLoaded() && ev.type == "mousedown" && type == "custom_item_squishsclistgrid" ) {
        var iscobjAndSCType = smartclientExtension._getISCObjectAndSCType( obj );
        if( ( iscobjAndSCType["sctype"] == smartclientExtension.ListGridItem ||
                  iscobjAndSCType["sctype"] == smartclientExtension.CalendarItem ) ) {
            var iscobj = iscobjAndSCType["iscobj"];
            var info = smartclientExtension._visitListGridItems( iscobj.view,
                    function( gridobj, rownum, record, field ) {
                        var itemelem = gridobj.body.getTableElement( rownum, field.masterIndex );
                        // If we found the right item and its a checkbox field or an expansion-handle
                        // then lets store row/col
                        var itemText = Squish.cleanString( smartclientExtension._getListGridCellValue( record, field, gridobj ) );
                        var isNonTextualField = smartclientExtension._isNonTextualField( gridobj, itemText, field );
                        if( itemelem == obj && isNonTextualField ) {
                            return {'row':rownum, 'col':field.masterIndex};
                        }
                        return undefined;
                    }
            );
            if( info ) {
                return "&itemRow="+info['row']+"&itemColumn="+info['col'];
            }
        }
    }
    return undefined;
}

smartclientExtension.menuItemEventToStringHook = function( type, obj, ev ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        if( ev.type == "mousedown" && type == "menuitem_squishscmenu" ) {
            var info = squishscmenuExtension._findMenuAndItemObjects( obj );
            if( info ) {
                return Squish.createClickItemInformationForMenuItem(
                        smartclientExtension._getHandleForISCObject( info['menu'] ),
                        squishscmenuExtension._getMenuItemText( info['menu'], info['menuitem'] ) );
            }
        }
    }
    return undefined;
}


smartclientExtension.chooseDateEventTypeHook = function( obj, ev, objType ) {
    function isDateChooserButtonTable( tbl, clickedElem, onClickHandler, menuMemberName ) {
        // Check if the handler matches
        if( clickedElem.onclick && clickedElem.onclick.indexOf(onClickHandler) != -1 ) {
            // extract the id to see if it references a datechooser
            var id = clickedElem.onclick;
            id = id.substring(0, id.indexOf("."+onClickHandler));
            // Use the id of the datechooser from the onclick handle to find it
            var datechooserelem = clickedElem.ownerDocument.getElementById(id);
            if( datechooserelem ) {
                var datechooserobj = smartclientExtension._getISCObject( datechooserelem );
                // double-check that the datechoosers year/month Menu matches the buttontable
                if( smartclientExtension._iscIsA( 'DateChooer', datechooserobj ) && datechooserobj[menuMemberName] == tbl ) {
                    return true;
                }
            }
        }
        return false;
    }
    function isDateChooserDayElement( elem ) {
        var basestyle = elem.getAttribute("basestyle");
        return basestyle && basestyle == "dateChooserWeekend" || basestyle == "dateChooserWeekday";
    }

    function isDateChooserTodayElement( elem ) {
        var basestyle = elem.getAttribute("basestyle");
        // Go up to the next onclick element since thats the button-object we want to check the style of
        while( elem && !elem.onclick ) {
            elem = elem.parentNode;
        }
        return basestyle && basestyle == "dateChooserBottomButton" &&
            // Make sure to convert the onclick function into a string for the check
            elem.onclick && (""+elem.onclick).indexOf('todayClick') != -1;
    }

    if( smartclientExtension.isSmartClientLoaded() ) {
        if( ev.type == 'mousedown' && objType == "datechooser_squishscdatechooser" ) {
            var elem = obj.ownerDocument.elementFromPoint( ev.clientX, ev.clientY );
            // Check whether a click on a week(end) day happened, which we want to record
            // or when Today button was clicked which should also be recorded.
            if( isDateChooserDayElement( elem ) || isDateChooserTodayElement( elem ) ) {
                return 'mousedown'
            }
            // All other mouseclicks on a datechooser should be ignored, so return ignoreEvent
            return "ignoreEvent";
        } else if( ev.type == 'mousedown' ) {
            var iscobj = smartclientExtension._getISCObject( obj );
            if( smartclientExtension._iscIsA( 'ButtonTable', iscobj ) ) {
                // A ButtonTable, lets see if the current button is connected to a dateChooser and the date
                // chooser has this button table as year or month menu
                elem = obj.ownerDocument.elementFromPoint( ev.clientX, ev.clientY );
                // Check if the buttonTable's element has a showMonth or showYear action
                // if so its probably for selection of a month or year for a datechooser
                if( isDateChooserButtonTable( iscobj, elem, "showMonth", "monthMenu" ) ||
                        isDateChooserButtonTable( iscobj, elem, "showYear", "yearMenu" ) ) {
                    return "ignoreEvent";
                }
            }
        }
    }
    return undefined;
}

smartclientExtension.chooseDateEventToStringHook = function( type, obj, ev ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        if( ev.type == "mousedown" && type == "datechooser_squishscdatechooser" ) {
            var datechooser = smartclientExtension._getISCObject( obj );
            if( smartclientExtension._iscIsA( 'DateChooser', datechooser ) ) {
                var elem = obj.ownerDocument.elementFromPoint( ev.clientX, ev.clientY );
                // Go up until there's an onclick item
                while( elem && !elem.onclick ) {
                    elem = elem.parentNode;
                }
                // Execute the change right now so we can get the updated date
                elem.onclick();
                return Squish.createChooseDateInformation( datechooser.getData() );
            }
        }
    }
    return undefined;
}

smartclientExtension.checkTreeItemEventToStringHook = function( type, obj, ev ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        if( ev.type == 'mousedown' && type == "custom_item_squishsctreegrid" ) {
            var grid = smartclientExtension._getListGridObject( obj );
            var itemobj = smartclientExtension._getISCObject( obj );
            var itemhandle = smartclientExtension._getHandleForISCObject( itemobj );
            var record = smartclientExtension._findListGridRecord( grid, itemhandle );
            if( smartclientExtension._isTreeGridCheckboxObject( grid, record, obj ) ) {
                // Ok, mousedown on checkbox, generate additional field so the c++ part
                // created a checkTreeItem() call.
                return "&checkTreeItem=true"
            }
        }
    }
    return undefined;
}

smartclientExtension.dateItemClickHook = function( htmlelem, ctrlPressed, shiftPressed, altPressed, x, y/*, button*/ ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        if( x > 0 && y > 0 ) {
            var iscobj = smartclientExtension._getISCObject( htmlelem );
            if( smartclientExtension._iscIsA( 'DateItem', iscobj ) && iscobj.showPickerIcon ) {
                var sz = iscobj.getVisibleWidth();
                sz -= iscobj.getPickerIconWidth();
                if( x >= sz ) {
                    // Ok, x falls into the picker icon width, lets shortcut the click and show the picker
                    iscobj.showPicker();
                    return true;
                }
            }
        }
    }
    return undefined;
}

smartclientExtension.pickableObject = function(elem) {
    var evObj = smartclientExtension.eventObject(elem);
    if( evObj ) {
        return evObj;
    }
    // Fallback taken from jshook.js/__squish__eventObject;
    /*while(o) {
        if (o && o.id && o.id.indexOf && o.id.indexOf('isc_') == 0) {
            break;
        }
        o = o.parentNode;
    }*/
    return undefined;
}

smartclientExtension.useIE8EventDispatchingHook = function( htmlelem ) {
    if( smartclientExtension.isSmartClientLoaded() ) {
        var iscobj = smartclientExtension._getISCObject( htmlelem );
        if( iscobj !== undefined && top.__squish__ie__version < 11) {
            return true;
        }
    }
    return false;
}

smartclientExtension.itemTextForEventObject = function( eventObject, objectType ) {
    if ( !eventObject ) {
        return undefined;
    }

    if( !smartclientExtension.isSmartClientLoaded() ) {
        return undefined;
    }

    if ( objectType != "custom_item_squishsclistgrid" &&
        objectType != "custom_item_squishsctreegrid" &&
        objectType != "custom_itemhandle_squishsctreegrid" ) {
        return undefined;
    }

    var iscobjAndSCType = smartclientExtension._getISCObjectAndSCType( eventObject );
    if( !iscobjAndSCType ) {
        return undefined;
    }
    switch( iscobjAndSCType['sctype'] ) {
        case smartclientExtension.ListGridItem:
        case smartclientExtension.CalendarItem:
        case smartclientExtension.TreeGridItem:
            var gridObject = iscobjAndSCType['iscobj'].view;
            var itemInfo = smartclientExtension._visitListGridItems( gridObject,
                    function( grid, rowNum, record, field ) {
                        var body = grid.body;
                        var item = body.getTableElement( rowNum, field.masterIndex );
                        if( item == eventObject ) {
                            var text = smartclientExtension._getListGridCellValue( record, field, grid );
                            var isNonTextualField = smartclientExtension._isNonTextualField( grid, text, field );
                            return { 'text':text, 'isNonTextualField':isNonTextualField }
                        }
                        return undefined;
                    }
            );
            // Only return a name if we were able to get a proper item text, otherwise let the normal squish code
            // handle this which will probably generate completely wrong clickItem code and hence users will notice
            if( itemInfo ) {
                if( !itemInfo['isNonTextualField'] ) {
                    return itemInfo['text'];
                }
            }
            break;
        case smartclientExtension.TreeGridHandle:
            // Special case, we'll have to find the name of the item, which can
            // most easily be done by fetching the eventObject of the parent of
            // 'o' since that is the <img> element representing the item's tree handle
            return smartclientExtension.itemTextForEventObject( smartclientExtension.eventObject( eventObject.parentNode ) );
    }
    return undefined;
}

if (Squish.toolkitExtensions["SmartClient"].enabled) {
    // General name/type identification
    Squish.addNameOfHook( smartclientExtension.nameOf );
    Squish.addTypeOfHook( smartclientExtension.typeOf );
    // Fast-Path for type and name generation during picking and event-recording
    Squish.addObjectNameAndTypeHook( smartclientExtension.objectNameAndType );
    Squish.addEventObjectHook( smartclientExtension.eventObject );
    Squish.addPropertyMatcherFactory( smartclientExtension.matchObjectFactory );
    // Support for ComboBoxItem class
    Squish.addEventToStringHook( smartclientExtension.comboBoxEventToStringHook );
    Squish.addEventTypeHook( smartclientExtension.comboBoxEventTypeHook );
    // Support for SelectItem class
    Squish.addEventToStringHook( smartclientExtension.selectItemEventToStringHook );
    Squish.addEventTypeHook( smartclientExtension.selectItemEventTypeHook );
    // Support for retrieving value of custom text-controls
    Squish.addEventToStringHook( smartclientExtension.textItemEventToStringHook );
    // Support recording of clickTab for Tab's in a TabSet
    Squish.addEventToStringHook( smartclientExtension.clickTabEventToStringHook );
    // Support for recording of chooseColor in coloritem/colorpicker
    Squish.addEventToStringHook( smartclientExtension.chooseColorEventToStringHook );
    Squish.addEventTypeHook( smartclientExtension.chooseColorEventTypeHook );
    // Support for recording of clickItem with row+column
    Squish.addEventToStringHook( smartclientExtension.listGridRowColEventToStringHook );
    // Support for recording of clickItem for Menu Items
    Squish.addEventToStringHook( smartclientExtension.menuItemEventToStringHook );
    // Support for recording of chooseDate for DateChooser
    Squish.addEventToStringHook( smartclientExtension.chooseDateEventToStringHook );
    Squish.addEventTypeHook( smartclientExtension.chooseDateEventTypeHook );
    // Support for recording on checkboxes in TreeGrid
    Squish.addEventToStringHook( smartclientExtension.checkTreeItemEventToStringHook );
    // Special support for clicks on the date-picker in a DateItem
    Squish.addClickHook( smartclientExtension.dateItemClickHook );
    // Picking needs eventObject and some custom logic from the generic eventObject
    // function
    Squish.addPickableObjectHook( smartclientExtension.pickableObject );

    Squish.addOverrideHookForUseIE8EventDispatching( smartclientExtension.useIE8EventDispatchingHook );
    Squish.addItemTextForEventObjectHook( smartclientExtension.itemTextForEventObject );
}
