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

package Squish::ObjectMapHelper::ObjectName;
use strict;
use utf8;
use warnings;
use Carp;
use Scalar::Util qw(reftype blessed looks_like_number);
use Exporter qw(import);
use Squish::ObjectMapHelper::Wildcard;
use Squish::ObjectMapHelper::RegularExpressionPattern;
our @ISA = qw(Exporter);
our @EXPORT = qw(regularExpression wildcard);

# returns array
sub symbolic_names {
    my ($pkg) = @_;

    # Ignore any symbols which are in scope of the object map due to importing
    # the ObjectName module
    my %blacklist = map { $_ => undef } @EXPORT;

    # Also ignore this; 'BEGIN' seems to be part of any symbol table, but we don't want that.
    $blacklist{BEGIN} = undef;

    return grep {not exists $blacklist{$_}} (keys %$pkg);
}

sub entries {
    my ($pkg) = @_;
    my $result = {};
    foreach my $sym (symbolic_names($pkg)) {
        $result->{$sym} = ${$pkg->{$sym}};
    }
    return $result;
}

sub wildcard {
    return Squish::ObjectMapHelper::Wildcard->new(shift);
}

sub regularExpression {
    return Squish::ObjectMapHelper::RegularExpressionPattern->new(shift);
}

1;


__END__

=head1 NAME

Squish::ObjectMapHelper::ObjectName - Script based object names for Squish.

=head1 SYNOPSIS

    use Squish::ObjectMapHelper::ObjectName;
    Squish::ObjectMapHelper::ObjectName->new({"type" => "MainWindow", "unnamed" => 1, "visible" => 1, "windowTitle" => "Item Views"});

=head1 ABSTRACT

This module implements script based object names for Squish.

=head1 DESCRIPTION

The ObjectName package provides a object which holds a multi property name.

=head1 SEE ALSO

L<Squish::ObjectMapHelper::Wildcard>
L<Squish::ObjectMapHelper::RegularExpressionPattern>

=head2 Methods

=over 4

=item C<new>

Returns a object name object that can be used with Squish API.

=back

=head2 Functions for Squish internal use

=over 4

=item C<variable_to_symbolic_name>

Generates a symbolic name for the given hash key.
For Squish internal use.

=back

=cut
