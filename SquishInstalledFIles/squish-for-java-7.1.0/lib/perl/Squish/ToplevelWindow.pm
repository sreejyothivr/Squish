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

package Squish::ToplevelWindow;

use strict;
use utf8;
use warnings;

sub byName {
    my ($class, $objectName, $timeout) = @_;
    if (!$timeout) {
        return $class->new(::waitForObjectExists($objectName));
    }
    return $class->new(::waitForObjectExists($objectName, $timeout));
}

sub byObject {
    my ($class, $objectReference) = @_;
    return $class->new($objectReference);
}

sub focused {
    my ($class) = @_;
    return $class->new(::_squish_window_focused());
}

sub new {
    my ($class, $window) = @_;
    # TODO: error handling, check for validity of $window
    my $self = bless {
        window => $window,
    }, $class;
    return $self;
}

sub geometry {
    my ($self) = @_;
    return ::_squish_window_geometry_get($self->{window});
}

sub nativeObject {
    my ($self) = @_;
    return $self->{window};
}

sub close {
    my ($self) = @_;
    ::_squish_window_close($self->{window});
}

sub maximize {
    my ($self) = @_;
    ::_squish_window_maximize($self->{window});
}

sub minimize {
    my ($self) = @_;
    ::_squish_window_minimize($self->{window});
}

sub moveTo {
    my ($self, $x, $y) = @_;
    ::_squish_window_moveto($self->{window}, $x, $y);
}

sub resizeTo {
    my ($self, $w, $h) = @_;
    ::_squish_window_resizeto($self->{window}, $w, $h);
}

sub restore {
    my ($self) = @_;
    ::_squish_window_restore($self->{window});
}

sub setFocus {
    my ($self) = @_;
    ::_squish_window_focus_set($self->{window});
}

sub setForeground {
    my ($self) = @_;
    ::_squish_window_foreground_set($self->{window});
}

sub setFullscreen {
    my ($self) = @_;
    ::_squish_window_fullscreen_set($self->{window});
}

1;
