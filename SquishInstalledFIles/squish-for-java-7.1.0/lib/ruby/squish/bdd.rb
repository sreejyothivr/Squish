# -*- coding: utf-8 -*-
#
# Copyright (C) 2014 - 2021 froglogic GmbH.
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
    module BDD
        class DuplicateStepError < KeyError
        end

        class MissingStepError < KeyError
        end

        class MultipleMatchesError < KeyError
        end

        @@__squish_context_userData = ""

        class StepContext
            attr_reader :multiLineText
            attr_reader :table
            attr_accessor :userData

            def initialize(*args)
                @multiLineText, @table, @userData = args
            end
        end

        class HookContext
            attr_reader :title
            attr_accessor :userData

            def initialize(*args)
                @title, @userData = args
            end
        end

        class StepHookContext
            attr_reader :text
            attr_accessor :userData

            def initialize(*args)
                @text, @userData = args
            end
        end

        class StepType
            ANY_STEP = -1
            GIVEN_STEP = 0
            WHEN_STEP = 1
            THEN_STEP = 2
        end

        @@__squish_step_functions = Array.new
        @@__squish_hooks_before_feature = Array.new
        @@__squish_hooks_after_feature = Array.new
        @@__squish_hooks_before_scenario = Array.new
        @@__squish_hooks_after_scenario = Array.new
        @@__squish_hooks_before_step = Array.new
        @@__squish_hooks_after_step = Array.new

        def __squish_find_step_locations(step_type, step_text)
            locations = []
            for bucket in @@__squish_step_functions
                for step in bucket.values
                    t = step['type']
                    next if t != step_type and t != StepType::ANY_STEP
                    locations.push(step['location']) if step['regexp'].match(step_text)
                end
            end
            return locations
        end

        def __squish_get_step_patterns(step_type)
            patterns = []
            for bucket in @@__squish_step_functions
                for step in bucket.values
                    t = step['type']
                    next if t != step_type and t != StepType::ANY_STEP
                    pat = step['pattern']
                    patterns.push(pat) if not pat.is_a? Regexp
                end
            end
            return patterns
        end

        def __squish_execute_step(step_type, step_text, multi_text = nil, table = nil)
            def step_with_pattern_already_in_list(pattern, matches)
                for _, _, _, p in matches
                    if p == pattern
                        return true
                    end
                end
                false
            end

            def find_step_functions(step_type, step_text)
                matches = []
                for bucket in @@__squish_step_functions
                    for step in bucket.values
                        t = step['type']
                        next if t != step_type and t != StepType::ANY_STEP
                        step['regexp'].match(step_text) do |m|
                          if !step_with_pattern_already_in_list(step['pattern'], matches)
                            matches.push([step['block'], m.captures, step['format'], step['pattern']])
                          end
                        end
                    end
                end
                matches
            end

            step_functions = find_step_functions(step_type, step_text)
            if step_functions.length == 0
                raise MissingStepError, "Missing step function '#{step_text}'"
            end
            if step_functions.length > 1
                raise MultipleMatchesError, "#{step_functions.length} steps match the step text"
            end
            f, extracted_args, format, _ = step_functions[0]

            if format
                extracted_args.each_with_index { |arg, i|
                    extracted_args[i] = arg.send(format[i])
                }
            end

            ctx = StepContext.new(multi_text, table, @@__squish_context_userData)
            extracted_args.unshift(ctx)
            result = f.call(*extracted_args)
            @@__squish_context_userData = ctx.userData
            return result
        end

        ABORT_SCENARIO = '__SquishAbortScenario'

        def setupHooks(*hookfiles)
            @@__squish_hooks_before_feature.clear()
            @@__squish_hooks_after_feature.clear()
            @@__squish_hooks_before_scenario.clear()
            @@__squish_hooks_after_scenario.clear()
            @@__squish_hooks_before_step.clear()
            @@__squish_hooks_after_step.clear()
            hookfiles.each do |hookfile|
                absolute_hookfile = File.absolute_path(hookfile)
                Kernel.load "#{absolute_hookfile}" if File.file?(absolute_hookfile)
            end
        end
        module_function :setupHooks

        def collectStepDefinitions(*stepdirs)
            @@__squish_step_functions.clear()
            stepdirs.each do |dir|
                @@__squish_step_functions.push(Hash.new)
                next if not File.directory?(dir)
                Dir.glob(File.join(File.absolute_path(dir), '**', '*.rb')).sort.each do |stepfile|
                    Kernel.load "#{stepfile}" if File.file?(stepfile)
                end
            end
        end
        module_function :collectStepDefinitions

        def register_step(step_type, pattern, &block)
            def get_step_location()
                if Kernel.respond_to? :caller_locations
                    bt = Kernel.caller_locations(3, 1)
                    return [bt.first.path, bt.first.lineno] if bt and bt.first
                else
                    bt = Kernel.caller()
                    if bt and bt.size > 2
                        # Parse "/path/to/file:42 in `some_function'"
                        m = /^(.+?):(\d+)(?::in `(.*)')?/.match(bt[2])
                        return [m[1], m[2].to_i] if m and m.length > 2
                    end
                end
                return ['', -1]
            end

            if not pattern
                raise ArgumentError, 'None or empty pattern', caller
            end

            bucket = @@__squish_step_functions.last
            bucketKey = [step_type, pattern]
            step = bucket.fetch(bucketKey, nil)
            if step
                loc = step['location'];
                raise DuplicateStepError, "Pattern #{pattern.inspect} duplicates previously registered pattern at #{loc[0]}:#{loc[1]}", caller
            end

            if pattern.is_a? Regexp
                regexp = pattern
                patternFormat = nil
            else
                regexpPattern = Regexp.escape(pattern)
                patternFormat = []
                # non-greedy match of \|x\|
                regexpPattern.gsub!(/\\\|(.+?)\\\|/) {
                    if ($1 == 'word')
                        patternFormat.push(:to_s)
                        '([[:word:]]+)'
                    elsif ($1 == 'integer')
                        patternFormat.push(:to_i)
                        '([-+]?\d+)'
                    elsif ($1 == 'any')
                        patternFormat.push(:to_s)
                        '(.+)'
                    else
                        raise ArgumentError, "Unknown placeholder |#{$1}|", caller
                    end
                }
                regexp = Regexp.compile("^#{regexpPattern}$")
            end

            bucket[bucketKey] = {
                'pattern' => pattern,
                'regexp' => regexp,
                'block' => block,
                'location' => get_step_location(),
                'format' => patternFormat,
                'type' => step_type,
            }
        end
        private :register_step

        def Step(pattern, &block)
            register_step(StepType::ANY_STEP, pattern, &block)
        end

        def Given(pattern, &block)
            register_step(StepType::GIVEN_STEP, pattern, &block)
        end

        def Then(pattern, &block)
            register_step(StepType::THEN_STEP, pattern, &block)
        end

        def When(pattern, &block)
            register_step(StepType::WHEN_STEP, pattern, &block)
        end

        def OnFeatureStart(&block)
            @@__squish_hooks_before_feature.push(block)
        end

        def OnFeatureEnd(&block)
            @@__squish_hooks_after_feature.push(block)
        end

        def OnScenarioStart(&block)
            @@__squish_hooks_before_scenario.push(block)
        end

        def OnScenarioEnd(&block)
            @@__squish_hooks_after_scenario.push(block)
        end

        def OnStepStart(&block)
            @@__squish_hooks_before_step.push(block)
        end

        def OnStepEnd(&block)
            @@__squish_hooks_after_step.push(block)
        end
    end
end
