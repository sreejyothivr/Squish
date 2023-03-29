# -*- coding: utf-8 -*-
#
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

module Squish
    class ToplevelWindow
        def self.byName(objectName, timeout = nil)
            if timeout.nil?
                return ToplevelWindow.new(waitForObjectExists(objectName))
            end
            return ToplevelWindow.new(waitForObjectExists(objectName, timeout))
        end

        def self.byObject(object)
            return ToplevelWindow.new(object)
        end

        def self.focused()
            return ToplevelWindow.new(_squish_window_focused())
        end

        def initialize(window)
            # TODO: verify window is an actual toplevel window
            @window = window
        end

        def geometry
            _squish_window_geometry_get(@window)
        end

        def nativeObject
            @window
        end

        def close
            _squish_window_close(@window)
        end

        def maximize
            _squish_window_maximize(@window)
        end

        def minimize
            _squish_window_minimize(@window)
        end

        def moveTo(x, y)
            _squish_window_moveto(@window, x, y)
        end

        def resizeTo(w, h)
            _squish_window_resizeto(@window, w, h)
        end

        def restore
            _squish_window_restore(@window)
        end

        def setFocus
            _squish_window_focus_set(@window)
        end

        def setForeground
            _squish_window_foreground_set(@window)
        end

        def setFullscreen
            _squish_window_fullscreen_set(@window)
        end

        def ==(other)
            if other.respond_to?(:nativeObject)
                self.nativeObject == other.nativeObject
            end
        end
    end
end
