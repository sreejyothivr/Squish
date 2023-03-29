# Copyright (C) 2016 - 2021 froglogic GmbH.
# Copyright (C) 2022 The Qt Company Ltd.
# All rights reserved.
#
# This file is part of Squish.
#
# Licensees holding a valid Squish License Agreement may use this
# file in accordance with the Squish License Agreement provided with
# the Software.
#
# This file is provided AS IS with NO WARRANTY OF ANY KIND, INCLUDING THE
# WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
#
# See the LICENSE file in the toplevel directory of this package.
#
# Contact contact@froglogic.com if any conditions of this licensing are
# not clear to you.

package provide squish::objectmaphelper 6.4.0

namespace eval ::Squish {
    namespace export ObjectName
    variable objectId 0
}

namespace eval ::ObjectMapHelper {
    # @param ns Namespace to read the names from
    # @return A list of the existing symbolic names
    proc symbolic_names {ns} {
        namespace eval $ns {
            if {[info exists SymbolicNames]} {
                return $SymbolicNames
            }
        }

        set result {}
        foreach var [info vars ${ns}::*] {
            lappend result [string range $var [string length ${ns}::] end]
        }
        return $result
    }

    proc entries {ns} {
        set result {}
        foreach n [symbolic_names $ns] {
            dict append result $n [set ${ns}::$n]
        }
        return $result
    }

    # @symbol A symbolic name object
    # @return The text-based symbolic name for a symbolic name variable.
    proc variable_to_symbolic_name {symbol} {
        return ":\$names::$symbol"
    }
}

proc to_string {realName args} {
    if {[string is list $realName] && (([llength $realName] % 2) == 0) && [llength $realName] > 0} {
        set rn ""
        foreach {k v} $realName {
            set operator "="
            if {[string first "object_map_helper_object_" $v] >= 0} {
                if {[llength $args] == 1} {
                    set t [::ObjectMapHelper::variable_to_symbolic_name [dict get [lindex $args 0] $v]]
                    append rn "$k$operator'$t'"
                } else {
                    append rn $k$operator[$v toString] " "
                }
            } else {
                if {[llength $v] > 1} {
                    set cmd [lindex $v 0]
                    if {$cmd eq "-wildcard"} {
                        set operator "?="
                        set v [lindex $v 1]
                    } elseif {$cmd eq "-regularexpression"} {
                        set operator "~="
                        set v [lindex $v 1]
                    }
                }
                set v  [string map { "\\" "\\\\" } $v]
                set v  [string map { "'" "\\'" } $v]
                append rn $k$operator'$v' " "
            }
        }
        return "{[string trim $rn]}"
    } else {
        return $realName
    }
}

proc ::Squish::ObjectName {args} {
    if {[llength $args] == 0} {
        error {wrong # args: should be "ObjectName <name>"}
    } elseif {[llength $args] == 1} {
        set rn [lindex $args 0]
    } elseif {[llength $args] > 1} {
        set rn [dict create {*}$args]
    }
    set objectName "object_map_helper_object_[incr ::Squish::objectId]"
    set objectRealName ::Squish::${objectName}_realName
    variable $objectRealName $rn

    proc $objectName {args} "
        set cmd \"\"
        if {\[llength \$args\] > 0} {
            set cmd \[lindex \$args 0\]
        }
        switch \$cmd {
            realName {
                return \$$objectRealName\
            }
            toString {
                return \[to_string \$$objectRealName\]
            }
            default {
                return \[to_string \$$objectRealName\]
            }
        }
    "
    return "::Squish::$objectName"
}

