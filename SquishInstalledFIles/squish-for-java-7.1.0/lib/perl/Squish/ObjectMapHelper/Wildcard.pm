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

package Squish::ObjectMapHelper::Wildcard;
use strict;
use utf8;
use warnings;
use Carp;

sub new {
    my ($class, $wildcardPattern) = @_;
    my $self = bless {
        wildcardPattern => $wildcardPattern,
    }, $class;
}

1;

__END__

=head1 NAME

Squish::ObjectMapHelper::Wildcard - Wildcard support for object name property.

=head1 SYNOPSIS

    use Squish::ObjectMapHelper::ObjectName;
    use Squish::ObjectMapHelper::Wildcard;
    Squish::ObjectMapHelper::ObjectName->new({"text" => Squish::ObjectMapHelper::Wildcard->new("Apples * Oranges")})

=head1 ABSTRACT

This module implements wildcard matching for Squish.

=head1 DESCRIPTION

To find out how to use this module in detail, see L<Squish::ObjectMapHelper>.

=head1 SEE ALSO

L<Squish::ObjectMapHelper>

=over 4

=item C<new>

Returns a wildcard object that can be used with L<Squish::ObjectMapHelper::ObjectName>.

=back

=cut
