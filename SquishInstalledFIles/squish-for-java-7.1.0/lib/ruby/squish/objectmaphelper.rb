# encoding: UTF-8
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
require 'squish'

module Squish::ObjectMapHelper
    # Wildcard class
    # - pattern Wildcard pattern
    class Wildcard
        def initialize(pattern)
            @pattern = pattern
        end

        attr_reader :pattern
    end

    # Regular expression class
    # - pattern Regular expression pattern
    class RegularExpression
        def initialize(pattern)
            @pattern = pattern
        end

        attr_reader :pattern
    end
   
    # Returns a list of the existing symbolic names
    # - module_ A module to read the names from
    def self.symbolic_names(module_)
        if module_.const_defined?(:SymbolicNames)
            return module_::SymbolicNames
        else
            return module_.constants.select { |c| module_.const_get(c).is_a?(Hash) or module_.const_get(c).is_a?(String) }
        end
    end

    def self.entries(module_)
        result = {}
        self.symbolic_names(module_).each do |n|
            result[n] = module_.const_get(n)
        end
        return result
    end
end
