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

package provide squish::screen 6.1.0

namespace eval ::Squish {
    namespace export Screen
}

proc ::Squish::Screen {cmd args} {
    switch -- $cmd {
        landscapeOrientation {
            return 1
        }
        portraitOrientation {
            return 2
        }
        reverseLandscapeOrientation {
            return 4
        }
        reversePortraitOrientation {
            return 8
        }
        count {
            return [invoke _squish_screen_count_get]
        }
        byIndex {
            foreach {index} $args break
            return [::Squish::Screen new $index]
        }
        new {
            foreach {index} $args break
            set objectName "screen_object_$index"
            proc $objectName {cmd args} "
                switch \$cmd {
                    index {
                        return $index
                    }
                    geometry {
                        return \[invoke _squish_screen_geometry_get $index\]
                    }
                    orientation {
                        if {\[llength \$args\] == 0} {
                            return \[invoke _squish_screen_orientation_get $index\]
                        } else {
                            foreach {value} \$args break
                            invoke _squish_screen_orientation_set $index \$value
                        }
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

