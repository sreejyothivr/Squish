/**
 * Copyright (C) 2016 - 2021 froglogic GmbH.
 * Copyright (C) 2022 The Qt Company Ltd..
 * All rights reserved.
 *
 * This file is part of Squish.
 *
 * Licensees holding a valid Squish License Agreement may use this
 * file in accordance with the Squish License Agreement provided with
 * the Software.
 *
 * This file is provided AS IS with NO WARRANTY OF ANY KIND, INCLUDING THE
 * WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 *
 * See the LICENSE file in the toplevel directory of this package.
 *
 * Contact contact@froglogic.com if any conditions of this licensing are
 * not clear to you.
 **/

/**
 * @constructor
 * @param {String} pattern Wildcard pattern
 */
export function Wildcard(pattern) {
    if (pattern === undefined) {
        throw new TypeError("Pattern parameter missing");
    }
    if (! Object(pattern) instanceof String) {
        throw new TypeError("String object required");
    }
    this.wildcardPattern = pattern;
}

Wildcard.prototype.toString = function () {
    return this.wildcardPattern;
};

/**
 * @constructor
 * @param {String} pattern Regular expression pattern
 */
export function RegularExpression(pattern) {
    if (pattern === undefined) {
        throw new TypeError("Pattern parameter missing");
    }
    if (! Object(pattern) instanceof String) {
        throw new TypeError("String object required");
    }
    this.regexPattern = pattern;
}

RegularExpression.prototype.toString = function () {
    return this.regexPattern;
};

var Internal = {}

/**
 * Internal API
 */
export var Internal = {}

/**
 * @param {Object} Namespace object that holds symbolic names
 * @return {Map} A map of symbolic names to name objects / dictionaries
 */
Internal.entries = function(ns) {
    if (ns === undefined) {
        return undefined;
    }
    var resultList = {};
    for (var k in ns) {
        if ( Object.prototype.toString.call(ns[k]) === "[object String]" ||
             Object.prototype.toString.call(ns[k]) === "[object Object]" ) {
            resultList[k] = ns[k];
        }
    }
    return resultList;
}
