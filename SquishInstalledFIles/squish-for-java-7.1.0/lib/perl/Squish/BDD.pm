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

package Squish::BDD;

use strict;
use utf8;
use warnings;

use Carp;
use Exporter qw(import);

use constant {
    ABORT_SCENARIO => '__SquishAbortScenario',
    STEP_ANY => -1,
    # Keep in sync with Squish::Gherkin::StepType values
    STEP_GIVEN => 0,
    STEP_WHEN => 1,
    STEP_THEN => 2,
};

# re::is_regexp for Perl < 5.9.5
BEGIN {
    if (!defined(&re::is_regexp)) {
        package re;
        my $re_class = ref qr//;
        *is_regexp = sub($) {
            local *__ANON__ = 'is_regexp';
            return UNIVERSAL::isa($_[0], $re_class);
        };
    }
}

our @EXPORT = qw(
    setupHooks
    collectStepDefinitions
    Step Given Then When
    OnFeatureStart OnFeatureEnd
    OnScenarioStart OnScenarioEnd
    OnStepStart OnStepEnd
    ABORT_SCENARIO
    );

my @step_registry;

our @__squish_hooks_before_feature;
our @__squish_hooks_after_feature;
our @__squish_hooks_before_scenario;
our @__squish_hooks_after_scenario;
our @__squish_hooks_before_step;
our @__squish_hooks_after_step;
our $__squish_context_user_data = '';

sub __squish_find_step_locations {
    my ($step_type, $step_text) = @_;

    my @matched_steps;

    # Fetch array of step entries that match the text
    foreach my $bucket_ref (@step_registry) {
        foreach my $step_ref (values(%$bucket_ref)) {
            my $t = $step_ref->{type};
            next if $t != $step_type and $t != STEP_ANY;

            if ($step_text =~ $step_ref->{regexp}) {
                push(@matched_steps, $step_ref->{location});
            }
        }
    }

    return @matched_steps;
}

sub __squish_get_step_patterns {
    my ($step_type) = @_;

    my @step_patterns;

    # Fetch array of all known step patterns
    foreach my $bucket_ref (@step_registry) {
        foreach my $step_ref (values(%$bucket_ref)) {
            my $t = $step_ref->{type};
            next if $t != $step_type and $t != STEP_ANY;

            my $pattern = $step_ref->{pattern};
            unless (re::is_regexp $pattern) {
                push(@step_patterns, $pattern);
            }
        }
    }

    return @step_patterns;
}

sub __squish_step_with_pattern_already_in_list {
    my $pattern = shift();
    my @matches = shift();
    foreach my $step (@matches) {
        my $current_pattern = $step->{pattern};
        if ($current_pattern && $current_pattern eq $pattern) {
            return 1;
        }
    }
    return 0;
}

sub __squish_execute_step {
    my $step_type = shift();
    my $step_text = shift();
    my @multi_text = @{shift()};
    my @table = @{shift()};

    my @matches;
    foreach my $bucket_ref (@step_registry) {
        foreach my $step_ref (values(%$bucket_ref)) {
            my $t = $step_ref->{type};
            next if $t != $step_type and $t != STEP_ANY;

            if ($step_text =~ $step_ref->{regexp}) {
                if (!__squish_step_with_pattern_already_in_list($step_ref->{pattern}, @matches)) {
                    push(@matches, $step_ref)
                }
            }
        }
    }

    my $num_matches = @matches;
    if ($num_matches == 0) {
        return 1;
    }
    if ($num_matches > 1) {
        if ($num_matches > 99) {
            return 200;
        } else {
            return 200 + $num_matches;
        }
    }

    my $step_ref = $matches[0];
    my @step_args = $step_text =~ $step_ref->{regexp};
    # Remove dummy (?) entry from args if regexp matched but nothing
    # was captured.
    if (!defined($1)) {
        shift(@step_args);
    }

    my %context = (
        'multiLineText' => \@multi_text,
        'table' => \@table,
        'userData' => $__squish_context_user_data
    );
    unshift(@step_args, \%context);

    my $step_result = $step_ref->{func}->(@step_args);

    $__squish_context_user_data = $context{userData};

    return ($step_result eq ABORT_SCENARIO)
    ? 2
    : 0;
}

sub setupHooks {
    @__squish_hooks_before_feature = ();
    @__squish_hooks_after_feature = ();
    @__squish_hooks_before_scenario = ();
    @__squish_hooks_after_scenario = ();
    @__squish_hooks_before_step = ();
    @__squish_hooks_after_step = ();

    for my $hookfile (@_) {
        next if ! -f $hookfile;
        my $absolute_hookfile = File::Spec->rel2abs($hookfile);
        unless (my $do_res = do $absolute_hookfile) {
            die "$@" if $@;
            die "Could not do $absolute_hookfile: $!" unless defined $do_res;
        }
    }

}

sub collectStepDefinitions {
    use Cwd 'abs_path';
    use File::Find 'find';

    @step_registry = ();

    for my $dir (@_) {
        push(@step_registry, {}); # add bucket
        next if ! -d $dir;
        my @files = ();
        find({
                wanted => sub {
                    return if ! -f;
                    return if ! /\.pl\z/;
                    push(@files, $File::Find::name);
                }
            }, abs_path($dir));
        # source files sorted by their full paths
        for my $file (sort(@files)) {
            unless (my $do_res = do $file) {
                die "$@" if $@;
                die "Could not do $file: $!" unless defined $do_res;
            }
        }
    }

}

sub register_step {
    my ($step_type, $pattern, $func) = @_;

    if (not defined $pattern or $pattern eq "") {
        croak "Undefined or empty regular expression";
    }

    my $bucket_ref = $step_registry[-1];
    my $bucket_key = "$step_type,$pattern";

    my $step_ref = $bucket_ref->{ $bucket_key };
    if (defined($step_ref)) {
        my @existing_loc = @{ $step_ref->{location} };
        croak("Pattern '".$pattern."' duplicates previously registered pattern at ".$existing_loc[0].":".$existing_loc[1]);
    }

    my $regexp;
    if (re::is_regexp $pattern) {
        $regexp = $pattern;
        unless (eval {qr/$regexp/}) {
            croak "Invalid regular expression";
        }
    } else {
        my $regexpPattern = '^'.quotemeta($pattern).'$';
        $regexpPattern =~ s/\\\|word\\\|/([[:word:]]+)/g;
        $regexpPattern =~ s/\\\|integer\\\|/([-+]?\\d+)/g;
        $regexpPattern =~ s/\\\|any\\\|/(.*)/g;
        # Reject any other |foo| placeholder
        if ($regexpPattern =~ qr/\\\|(.+?)\\\|/) {
            croak("Unknown placeholder |$1|");
        }
        $regexp = qr($regexpPattern);
    }

    # (package, filename, line, subroutine, hasargs, wantarray, evaltext, is_require, hints, bitmask, hinthash)
    my @step_caller = caller(1);
    # remove everything except (filename, line)
    my @step_location = splice(@step_caller, 1, -8);

    $bucket_ref->{ $bucket_key } = {
        pattern => $pattern,
        regexp => $regexp,
        func => $func,
        location => \@step_location,
        type => $step_type,
    }
}

sub Step {
    my ($pattern, $func) = @_;
    register_step(STEP_ANY, $pattern, $func);
}

sub Given {
    my ($pattern, $func) = @_;
    register_step(STEP_GIVEN, $pattern, $func);
}

sub Then {
    my ($pattern, $func) = @_;
    register_step(STEP_THEN, $pattern, $func);
}

sub When {
    my ($pattern, $func) = @_;
    register_step(STEP_WHEN, $pattern, $func);
}

sub OnFeatureStart {
    push(@__squish_hooks_before_feature, shift());
}

sub OnFeatureEnd {
    push(@__squish_hooks_after_feature, shift());
}

sub OnScenarioStart {
    push(@__squish_hooks_before_scenario, shift());
}

sub OnScenarioEnd {
    push(@__squish_hooks_after_scenario, shift());
}

sub OnStepStart {
    push(@__squish_hooks_before_step, shift());
}

sub OnStepEnd {
    push(@__squish_hooks_after_step, shift());
}

1;
