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

package provide squish::toplevelwindow 6.1.0

namespace eval ::Squish {
    namespace export ToplevelWindow

    variable objectId 0
}

proc ::Squish::ToplevelWindow {cmd args} {
    switch -- $cmd {
        byName {
            foreach {objectName} $args break
            return [::Squish::ToplevelWindow new [waitForObjectExists $objectName]]
        }
        byObject {
            foreach {objectReference} $args break
            return [::Squish::ToplevelWindow new $objectReference]
        }
        focused {
            return [::Squish::ToplevelWindow new [invoke _squish_window_focused]]
        }
        new {
            foreach {window} $args break
            set objectName "toplevel_window_object_[incr ::Squish::objectId]"
            proc $objectName {cmd args} "
                switch \$cmd {
                    geometry {
                        return \[invoke _squish_window_geometry_get $window\]
                    }
                    nativeObject {
                        return $window
                    }
                    close {
                        invoke _squish_window_close $window
                    }
                    maximize {
                        invoke _squish_window_maximize $window
                    }
                    minimize {
                        invoke _squish_window_minimize $window
                    }
                    moveTo {
                        foreach {x y} \$args break
                        invoke _squish_window_moveto $window \$x \$y
                    }
                    resizeTo {
                        foreach {x y} \$args break
                        invoke _squish_window_resizeto $window \$x \$y
                    }
                    restore {
                        invoke _squish_window_restore $window
                    }
                    setFocus {
                        invoke _squish_window_focus_set $window
                    }
                    setForeground {
                        invoke _squish_window_foreground_set $window
                    }
                    setFullscreen {
                        invoke _squish_window_fullscreen_set $window
                    }
                    default {
                        error \"unknown field '\$cmd'\"
                    }
                }
            "
            return "::Squish::$objectName"
        }
        default {
            error "unknown field '$cmd'"
        }
    }
}

