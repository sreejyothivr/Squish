/* global
Squish
*/

var gwtExtension = new Object;

gwtExtension.Tree = 0;
gwtExtension.TreeItem = 1;
gwtExtension.TreeItemHandle = 2;

gwtExtension.nameOfTreeItem = function (obj)
{
    var tree = obj;
    while (tree && (!Squish.hasClassName(tree, 'gwt-Tree')))
	tree = tree.parentNode;
    var treeName = Squish.nameOf(tree); 

    var item = obj;

    return {"object": treeName, "itemText": item.innerText};
}

gwtExtension.nameOfTree = function (obj)
{
    return '{' + Squish.propertiesToName(obj, ["tagName", "id", "name"]) + "className='gwt-Tree'}";
}

gwtExtension.getType = function (obj)
{
    if (Squish.hasClassName(obj, 'gwt-TreeItem'))
	return gwtExtension.TreeItem;
    else if (obj.tagName == 'IMG' && (obj.src.indexOf('tree_open') != -1 || 
				      obj.src.indexOf('tree_closed') != -1) && 
	     Squish.hasClassName(gwttreeExtension.itemOfHandle(obj), 'gwt-TreeItem'))
	return gwtExtension.TreeItemHandle;
    else if (Squish.hasClassName(obj, 'gwt-Tree'))
	return gwtExtension.Tree;

    return undefined;
}

gwtExtension.nameOf = function (obj)
{
    switch (gwtExtension.getType(obj)) {
    case gwtExtension.TreeItem:
    return escape(gwtExtension.nameOfTreeItem(obj)["object"]);
    case gwtExtension.TreeItemHandle:
    return escape(gwtExtension.nameOfTreeItem(gwttreeExtension.itemOfHandle(obj))["object"]);
    case gwtExtension.Tree:
	return Squish.uniquifyName(gwtExtension.nameOfTree(obj), obj);
    }
	
    return undefined;
}

gwtExtension.typeOf = function (obj)
{
    switch (gwtExtension.getType(obj)) {
    case gwtExtension.TreeItem:
	return 'custom_item_gwttree';
    case gwtExtension.TreeItemHandle:
	return 'custom_itemhandle_gwttree';
    case gwtExtension.Tree:
	return 'custom_itemview_gwttree';
    }

    return undefined;
}

gwtExtension.eventObject = function (obj)
{
    if (!obj)
        return undefined;

    switch (gwtExtension.getType(obj)) {
    case gwtExtension.TreeItem: // fallthrough
    case gwtExtension.TreeItemHandle:
	return obj;
    }

    return undefined;
}

gwtExtension.itemTextForEventObject = function( eventObject )
{
    switch (gwtExtension.getType(eventObject)) {
        case gwtExtension.TreeItem:
            return gwtExtension.nameOfTreeItem(eventObject)["itemText"];
        case gwtExtension.TreeItemHandle:
            return gwtExtension.nameOfTreeItem(gwttreeExtension.itemOfHandle(eventObject))["itemText"];
    }

    return undefined;
}

if (Squish.toolkitExtensions["GWT"].enabled) {
    Squish.addNameOfHook(gwtExtension.nameOf);
    Squish.addTypeOfHook(gwtExtension.typeOf);
    Squish.addEventObjectHook(gwtExtension.eventObject);
    // For now its ok to use eventObject for the picking-object too.
    Squish.addPickableObjectHook(gwtExtension.eventObject);
    Squish.addItemTextForEventObjectHook(gwtExtension.itemTextForEventObject);
}


var gwttreeExtension = new Object;

gwttreeExtension.isItemSelected = function (i)
{
    return Squish.hasClassName(i, "gwt-TreeItem-selected");
}

gwttreeExtension.isItemOpen = function (i)
{
    try {
        var obj = i;
        // GWT 2.3.0 does not set an image file anymore for tree-handles
        // but instead uses base64 encoded strings for the binary data of the
        // image. So instead we try to find the container-div that has all childs
        // and check whether that one is visible or not.
        while (obj && obj.tagName != 'TABLE') {
            obj = obj.parentNode;
        }
        if (!obj || !obj.nextSibling) {
            return undefined;
        }
        obj = obj.nextSibling;
        return Squish.isElementVisible(obj);
    }
    catch (_e) {
        return false;
    }
}

gwttreeExtension.setItemSelected = function (i, selected)
{
    if (gwttreeExtension.isItemSelected(i) != selected)
	Squish.mouseClick(i);
}

gwttreeExtension.setItemOpen = function (i, open)
{
    if (gwttreeExtension.isItemOpen(i) == open) return;
	Squish.mouseClick(gwttreeExtension.itemHandle(i));
}

gwttreeExtension.findItem = function (tree, name)
{
    var node = tree.firstChild;
    
    while (node) {
	if (node.firstChild) {
	    var n2 = gwttreeExtension.findItem(node, name);
	    if (n2) {
		return n2;
	    }
	}
	if (node.className && 
	    Squish.hasClassName(node, 'gwt-TreeItem') &&
	    Squish.cleanString(node.innerText) == name) {
	    return node;
	}
	node = node.nextSibling;
    }

    return undefined;
}

gwttreeExtension.itemHandle = function (node)
{
    return node.parentNode.previousSibling.firstChild;
}

gwttreeExtension.itemOfHandle = function (node)
{
    return node.parentNode.nextSibling.firstChild;
}

gwttreeExtension._findFirstTreeItem = function(baseNode)
{
    var obj = Squish.getElementByClassName(baseNode, 'gwt-TreeItem', 'SPAN');
    // Newer GWT versions (at least since 2.3) use a DIV instead of a SPAN
    if( !obj ) {
        obj = Squish.getElementByClassName(baseNode, 'gwt-TreeItem', 'DIV');
    }
    return obj;
}

gwttreeExtension.childItem = function (parent)
{
    if (Squish.hasClassName(parent, "gwt-Tree")) {
        return gwttreeExtension._findFirstTreeItem(parent);
    } else {
	while (parent && parent.tagName != 'TABLE')
	    parent = parent.parentNode;
	if (!parent || !parent.nextSibling)
	    return undefined;
	parent = parent.nextSibling;
        return gwttreeExtension._findFirstTreeItem(parent);
    }
}

gwttreeExtension.nextSibling = function (node)
{
    // Make sure to go one up at first since newer versions of GWT
    // use DIV for items, which means we do not go up at all since the
    // first node passed in already is a DIV
    node = node.parentNode;
    while (node && node.tagName != 'DIV')
	    node = node.parentNode;
    if (!node || !node.nextSibling)
        return undefined;
    node = node.nextSibling;
    return gwttreeExtension._findFirstTreeItem(node);
}

gwttreeExtension.parentItem = function (node)
{
    // Make sure to go one up at first since newer versions of GWT
    // use DIV for items, which means we do not go up at all since the
    // first node passed in already is a DIV
    node = node.parentNode;
    while (node && node.tagName != 'DIV')
	node = node.parentNode;
    if (!node || !node.parentNode || !node.parentNode.previousSibling)
	return undefined;
    node = node.parentNode.previousSibling;
    return gwttreeExtension._findFirstTreeItem(node);
}

gwttreeExtension.itemView = function (node)
{
    var t = node;
    while (t && (!Squish.hasClassName(t, 'gwt-Tree')))
	t = t.parentNode;
    return t;
}
