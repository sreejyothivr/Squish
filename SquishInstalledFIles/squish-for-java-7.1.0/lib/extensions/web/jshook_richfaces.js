/**********************************************************************
** Copyright (C) 2005 - 2021 froglogic GmbH.
** Copyright (C) 2022 The Qt Company Ltd.
** All rights reserved.
**********************************************************************/

/* global
__squish__selectSingleOption__hooks
__squish__typeOf
Squish
*/

var richFacesExtension = new Object;

richFacesExtension.isRichFacesCombo = function ( o )
{
    return ( o.firstChild && o.firstChild.className && o.firstChild.className.indexOf( "rich-combobox" ) != -1 && o.firstChild.id && o.firstChild.id.indexOf( "combobox" ) != -1 );
}

richFacesExtension.typeOf = function ( o )
{
    if( o.className && o.className.indexOf( 'rich-combobox-item') != -1 ) {
        return 'richfaces_combobox_item';
    } else if ( richFacesExtension.isRichFacesCombo( o ) ) {
        return "select-one";
    }
    return undefined;
}

richFacesExtension.selectSingleOption = function( element, text )
{
    if( richFacesExtension.isRichFacesCombo(element) ) {
        // Needed as just executing the events on the span that we get here doesn't trigger updating 
        // the input fields with the values

        var inputs = element.getElementsByTagName('INPUT');
        var fieldinp = undefined;
        var valueinp = undefined;
        for( var i = 0; i < inputs.length; i++ ) {
            var inp = inputs[i];
            if( inp && inp.id && inp.id.indexOf('comboboxField') != -1 ) {
                fieldinp = inp;
            } else if( inp && inp.id && inp.id.indexOf('comboboxValue') != -1 ) {
                valueinp = inp;
            }
        }
        /*var itemobj = undefined;
        var listdiv = element.ownerDocument.getElementById( element.id + "list" );
        var spans = listdiv.getElementsByTagName("SPAN");
        for( var i = 0; i < spans.length; i++ ) {
            if( spans[i].innerText = text ) {
                itemobj = spans[i];
                break;
            }
        }*/
        if( fieldinp && valueinp /*&& itemobj*/ ) {
            fieldinp.prevValue = fieldinp.value;
            fieldinp.value = text;
            valueinp.value = text;
            //__squish__click( itemobj, 0, 0, 0, 5, 5, 1 );
            return true;
        }
    }
}

richFacesExtension.eventType = function( o, e )
{
    if( e.type == 'mousedown' && richFacesExtension.isRichFacesCombo( o ) ) {
        return "change"
    }
    return undefined;
}

richFacesExtension.eventToStr = function( t, o, e )
{
    if( t == "select-one" && e.type == "mousedown" && richFacesExtension.isRichFacesCombo( o ) ) {
        var id = o.id;
        var listdiv = o.ownerDocument.getElementById( id + "list" );
        var spans = listdiv.getElementsByTagName("SPAN");
        for( var i = 0; i < spans.length; i++ ) {
            if( spans[i].className && spans[i].className.indexOf("rich-combobox-item-selected") != -1 ) {
                return "&value="+escape( spans[i].innerText );
            }
        }
    }
    return undefined;
}

richFacesExtension.eventObject = function( o )
{
    if( __squish__typeOf( o ) == "richfaces_combobox_item" ) {
        var comboid = o.parentNode.id;
        comboid = comboid.substring(0,comboid.indexOf('list'));
        var combodiv = o.ownerDocument.getElementById(comboid);
        return combodiv;
    }
    return undefined;
}

if (Squish.toolkitExtensions["richfaces"].enabled) {
    Squish.addTypeOfHook( richFacesExtension.typeOf );
    Squish.addEventObjectHook( richFacesExtension.eventObject );
    // For now its ok to use eventObject for the picking-object too.
    Squish.addPickableObjectHook( richFacesExtension.eventObject );
    Squish.addEventToStringHook( richFacesExtension.eventToStr );
    Squish.addEventTypeHook( richFacesExtension.eventType );
    __squish__selectSingleOption__hooks.push( richFacesExtension.selectSingleOption );
}
