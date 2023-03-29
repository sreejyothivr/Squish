/**********************************************************************
 ** Copyright (C) 2016 - 2021 froglogic GmbH.
 ** Copyright (C) 2022 The Qt Company Ltd.
 ** All rights reserved.
 **********************************************************************/

/* exported
__squish__standardselectExtension
*/

/* global
__squish__sendChangeEvent
*/
var __squish__standardselectExtension = {
    __selectedOptionAttributes: function( selectelem, attributeGetter ) {
        var result = [];
        for( var i = 0; i < selectelem.options.length; ++i ) {
            if( selectelem.options[i].selected ) {
                result.push( attributeGetter( selectelem.options[i] ) );
            }
        }
        return result;
    },
    selectedValues: function( selectelem ) {
        return this.__selectedOptionAttributes( selectelem, this.optionValue );
    },
    selectedIndexes: function( selectelem ) {
        return this.__selectedOptionAttributes( selectelem, this.optionIndex );
    },
    selectedTexts: function( selectelem ) {
        return this.__selectedOptionAttributes( selectelem, this.optionText );
    },
    selectedLabels: function( selectelem ) {
        return this.__selectedOptionAttributes( selectelem, function( opt ) { return opt.label } );
    },
    optionIndex: function( option ) {
        return option.index;
    },
    optionValue: function( option ) {
        return option.value;
    },
    optionText: function( option ) {
        return option.text;
    },
    deselect: function( selectelem, optionAttributeGetter, values ) {
        var hasChanged = false;
        for( var i = 0; i < selectelem.options.length; ++i ) {
            var option = selectelem.options[i];
            for( var j = 0; j < values.length; ++j ) {
                if( values[j] == optionAttributeGetter( option ) ) {
                    option.selected = false;
                    hasChanged = true;
                    break;
                }
            }
        }
        if( hasChanged ) {
            __squish__sendChangeEvent( selectelem );
        }
    },
    hasItems: function( selectelem, values, valueFnName ) {
        try{
            var allFound = true;
            for( var j = 0; j < values.length; ++j ) {
                var itemFound = false;
                for( var i = 0; i < selectelem.options.length; i++ ) {
                    if( valueFnName( selectelem.options[i] ) == values[j] ) {
                        itemFound = true;
                        break;
                    }
                }
                if( !itemFound ) {
                    allFound = false;
                }
            }
            return allFound;
        }catch(e){
            return e.message;
        }
    }
}
