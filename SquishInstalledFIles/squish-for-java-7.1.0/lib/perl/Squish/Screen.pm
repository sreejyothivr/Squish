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

package Squish::Screen;

use strict;
use utf8;
use warnings;

use Carp;

use constant {
    LandscapeOrientation => 0x01,
    PortraitOrientation => 0x02,
    ReverseLandscapeOrientation => 0x04,,
    ReversePortraitOrientation => 0x08,
};

sub count {
    return ::_squish_screen_count_get();
}

sub byIndex {
    my ($class, $index) = @_;

    return $class->new($index);
}

sub new {
    my ($class, $index) = @_;

    # TODO: error handling, check for validity of $window
    if ($index < 0 or $index >= count()) {
        croak("Screen index $index out of range");
    }

    my $self = bless {
        index => $index,
    }, $class;

    return $self;
}

sub index {
    my ($self) = @_;

    return $self->{index};
}

sub geometry {
    my ($self) = @_;

    ::_squish_screen_geometry_get($self->{index});
}

sub orientation {
    my ($self, $orientation) = @_;

    if (@_ == 2) {
        ::_squish_screen_orientation_set($self->{index}, $orientation);
    }
    return ::_squish_screen_orientation_get($self->{index});
}

1;
