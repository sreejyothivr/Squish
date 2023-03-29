/* global
Squish
*/
var itmillExtension = new Object;
var itmilltreeExtension = new Object;

itmillExtension.nameOfTreeNode = function (o)
{
    var t = o;
    while (t && (!Squish.hasClassName(t, 'tree')))
	t = t.parentNode;
    var tid = '';
    if (t) tid = Squish.nameOf(t); 

    var oo = Squish.getElementByClassName(o, 'caption', 'SPAN');
    if (oo)
        o = oo;

    return {"object": tid, "itemText": o.innerText};
}

itmillExtension.nameOfTreeHandle = function (o)
{
    return itmillExtension.nameOfTreeNode(o.nextSibling);
}

itmillExtension.getPID = function(o)
{
    var cnt = 0;
    while (o && cnt < 5) {
	if (o && o.id && o.id.indexOf && o.id.indexOf('PID') == 0)
	    return o.id.substr(3);
	o = o.parentNode;
	cnt++;
    }
    return undefined;
}


itmillExtension.nameOfTree = function (o)
{
    var pid = itmillExtension.getPID(o);
    var n = '{';
    if (pid)
	n += "PID='" + pid + "' ";
    n += Squish.propertiesToName(o, ["tagName", "id"]) + "className='tree'}";
    return n;
}

itmillExtension.nameOf = function (o/*, noUnify*/)
{
    if (Squish.hasClassName(o, 'caption') && o.parentNode && o.parentNode.tagName == 'LI' &&
	Squish.hasClassName(o.parentNode, 'clickable'))
    return escape(itmillExtension.nameOfTreeNode(o.parentNode)["object"]);
    else if (Squish.hasClassName(o, 'collapse') || Squish.hasClassName(o, 'expand'))
    return escape(itmillExtension.nameOfTreeHandle(o)["object"]);
    else if (Squish.hasClassName(o, 'tree'))
	return Squish.uniquifyName(itmillExtension.nameOfTree(o), o);

    var pid = itmillExtension.getPID(o);
    if (pid) {
	var n = Squish.nameOf(o, true);
	n = unescape(n);
	if (n.charAt(0) == '{') {
	    n = n.substr(1);
	    var occ = n.indexOf("occurrence");
	    if (occ != -1)
		n = n.substr(0, occ);
	    var n2 = "{PID='" + pid + "' ";
	    if (o.className && o.className != '') {
		if (Squish.hasClassName(o, "clickable"))
		    n2 += "className='clickable' ";
		else if (Squish.hasClassName(o, "button"))
		    n2 += "className='button' ";
		else if (Squish.hasClassName(o, "day"))
		    n2 += "className='day' ";
		    
	    }
	    n = n2 + n;
	    if (occ != -1)
		n += "}";
	    
	    return Squish.unifyName(n);
	}
    }
    
    return undefined;
}

itmillExtension.matchObject = function(o, prop, value/*, name*/)
{
    if (prop == "PID") {
	var pid = itmillExtension.getPID(o);
	return pid == value.value;
    }

    return undefined;
}


itmillExtension.typeOf = function (o/*, noUnify*/)
{
    if (Squish.hasClassName(o, 'caption') && o.parentNode && o.parentNode.tagName == 'LI' &&
	Squish.hasClassName(o.parentNode, 'clickable'))
	return 'custom_item_itmilltree';
    else if (Squish.hasClassName(o, 'collapse') || Squish.hasClassName(o, 'expand'))
	return 'custom_itemhandle_itmilltree';
    else if (Squish.hasClassName(o, 'tree'))
	return 'custom_itemview_itmilltree';
    return undefined;
}

itmillExtension.eventObject = function (o/*, noUnify*/)
{
    if (!o)
        return undefined;

    if (Squish.hasClassName(o, 'caption') && o.parentNode && o.parentNode.tagName == 'LI' &&
	Squish.hasClassName(o.parentNode, 'clickable'))
	return o;
    else if (Squish.hasClassName(o, 'collapse') || Squish.hasClassName(o, 'expand'))
	return o;

    return undefined;
}



itmilltreeExtension.isItemSelected = function (i)
{
    return Squish.hasClassName(i, "selected");
}

itmilltreeExtension.isItemOpen = function (i)
{
    return Squish.hasClassName(i.previousSibling, "collapse");
}

itmilltreeExtension.setItemSelected = function (i, selected)
{
    if (itmilltreeExtension.isItemSelected(i) != selected)
	Squish.mouseClick(i);
}

itmilltreeExtension.setItemOpen = function (i, open)
{
    if (itmilltreeExtension.isItemOpen(i) != open)
	Squish.mouseClick(itmilltreeExtension.itemHandle(i));
}

itmilltreeExtension.findItem = function (tree, n)
{
    var node = tree.firstChild;
    
    while (node) {
	if (node.firstChild) {
	    var n2 = itmilltreeExtension.findItem(node, n);
	    if (n2) {
		return n2;
	    }
	}
	if (node.className && 
	    Squish.hasClassName(node, 'caption') &&
	    Squish.cleanString(node.innerText) == n) {
	    return node;
	}
	node = node.nextSibling;
    }

    return undefined;
}

itmilltreeExtension.itemHandle = function (node)
{
    return node.previousSibling;
}

itmilltreeExtension.childItem = function (parent)
{
    if (Squish.hasClassName(parent, "tree")) {
	return Squish.getElementByClassName(parent, 'caption', 'SPAN');
    } else {
	parent = parent.parentNode;
	parent = parent.getElementsByTagName("LI")[0];
	if (!parent)
	    return undefined;
	return Squish.getElementByClassName(parent, 'caption', 'SPAN');
    }
}

itmilltreeExtension.nextSibling = function (node)
{
    while (node && node.tagName != 'LI') {
	if (Squish.hasClassName(node, 'tree'))
	    return undefined;
	node = node.parentNode;
    }
    return Squish.getElementByClassName(node.nextSibling, 'caption', 'SPAN');
}

itmilltreeExtension.parentItem = function (node)
{
    node = node.parentNode.parentNode;
    while (node && node.tagName != 'LI') {
	if (Squish.hasClassName(node, 'tree'))
	    return undefined;
	node = node.parentNode;
    }

    if (!node)
	return undefined;
	
    node = Squish.getElementByClassName(node, 'caption', 'SPAN');
    return node;
}

itmilltreeExtension.itemView = function (node)
{
    var t = node;
    while (t && (!Squish.hasClassName(t, 'tree')))
	t = t.parentNode;
    return t;
}

itmillExtension.itemTextForEventObject = function( eventObject ) {
    if (Squish.hasClassName(eventObject,  'caption') && eventObject.parentNode && eventObject.parentNode.tagName == 'LI' &&
    Squish.hasClassName(eventObject.parentNode, 'clickable'))
    return itmillExtension.nameOfTreeNode(eventObject.parentNode)["itemText"];
    else if (Squish.hasClassName(eventObject,  'collapse') || Squish.hasClassName(eventObject,  'expand'))
    return itmillExtension.nameOfTreeHandle(eventObject)["itemText"];
    return undefined;
}

if (Squish.toolkitExtensions["ITMILL"].enabled) {
    Squish.registerWidget({Class: 'button', Event: 'click'});
    Squish.registerWidget({Class: 'day', Event: 'click'});
    Squish.registerWidget({Class: 'clickable', Event: 'click'});
    Squish.addNameOfHook(itmillExtension.nameOf);
    Squish.addTypeOfHook(itmillExtension.typeOf);
    Squish.addEventObjectHook(itmillExtension.eventObject);
    Squish.addMatchObjectHook(itmillExtension.matchObject);
    // For now its ok to use eventObject for the picking-object too.
    Squish.addPickableObjectHook(itmillExtension.eventObject);
    Squish.addItemTextForEventObjectHook(itmillExtension.itemTextForEventObject);
}
