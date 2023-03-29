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
    class Screen
        LandscapeOrientation = 0x01
        PortraitOrientation = 0x02
        ReverseLandscapeOrientation = 0x04
        ReversePortraitOrientation = 0x08

        def self.count()
            _squish_screen_count_get()
        end

        def self.byIndex(index)
            return Screen.new(index)
        end

        def initialize(index)
            raise IndexError, 'Screen index #{index} out of range' unless index >= 0 && index < _squish_screen_count_get()
            @index = index
        end

        attr_reader :index

        def geometry
            _squish_screen_geometry_get(@index)
        end

        def orientation
            _squish_screen_orientation_get(@index)
        end

        def orientation=(orientation)
            # TODO: Handle exceptions and rethrow
            _squish_screen_orientation_set(@index, orientation)
        end
    end
end
