# Copyright (C) 2011 - 2021 froglogic GmbH.
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

proc loadSquishPackage {dir} {
    set libName "squishtclmod"

    # On Windows, the required libraries are in the bin/ directory of the
    # Squish package. On Unix, they are in lib/.
    #
    if {$::tcl_platform(platform) == "windows"} {
        # Temporarily switch into the directory of the shared library
        # to be loaded to make sure that Windows finds dependencies
        # (Windows only looks in the application directory, current
        # working dir, and system directories). See
        # http://msdn.microsoft.com/en-us/library/ms682586(VS.85).aspx
        # for details
        #
        set oldDir [pwd]
        cd $dir/../bin
        load [file join [pwd] $libName[info sharedlibextension]]
        cd $oldDir
    } else {
        load [file join $dir lib$libName[info sharedlibextension]]
    }

    squish::setSquishPrefix [file join $dir ..]
}

package ifneeded "Squishrunner" 1.0 [list loadSquishPackage $dir]

