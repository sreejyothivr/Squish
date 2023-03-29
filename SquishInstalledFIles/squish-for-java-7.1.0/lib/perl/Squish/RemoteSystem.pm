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

package Squish::RemoteSystem;

use strict;
use utf8;
use warnings;
use Carp;

sub new {
    my ($class, $host, $port) = @_;

    if ( ( $host ) and ( not $port ) ) {
        $port = 4322
    }
    
    if ( ( not $host ) and ( $port ) ) { # This can not happen?
        croak "Host not specified";
    }

    my $connection_handle = -1;
    if ($host and $port) {
        $connection_handle = ::_squish_connect_to_remote_system( $host, $port + 0 );
    } else {
        $connection_handle = ::_squish_connect_to_remote_system();
    }

    my $self = bless {
        host => $host,
        port => $port,
        connection_handle => $connection_handle,
    }, $class;

    return $self;
}

sub close {
    my ($self) = @_;
    if ($self->{connection_handle} >= 0) {
        dispatch_remote_call( \&::_squish_close_remote_system_connection, $self->{connection_handle} );
        $self->{connection_handle} = -1;
    }
}

sub DESTROY {
    my ($self) = @_;
    $self->close();
}

sub flatten {
   map { ref $_ eq 'ARRAY' ? flatten(@{$_}) :
         ref $_ eq 'SCALAR' ? flatten(${$_}) : $_
   } @_;
}

sub execute {
    my ($self, $cmd, $cwd, $env, $options) = @_;
    if (not $cmd) {
        croak "Command not specified";
    }

    if (not $cwd) {
        $cwd = "";
    }

    if (not $env) {
        $env = {};
    }

    if (not $options) {
        $options = {};
    }

    @$cmd = map {$_ . ""} flatten($cmd);

    $cwd = $cwd . "";

    $env->{$_} = $env->{$_} . "" for keys %$env;

    my $result = ::_squish_remote_execute_command($self->{connection_handle}, $cmd, $cwd, $env, $options);

    if (($result->{"errornr"} + 0) > 0) {
        croak $result->{"errorstr"};
    }

    return ($result->{"exitcode"}, $result->{"stdout"}, $result->{"stderr"})
}

sub dispatch_remote_call
{
    my $callable = shift @_;

    my @res;
    eval {
        @res = $callable->(@_);
    } or do {
        my $e = $@;
        if ( $e ) {
            die "Remote system call failed: " . $e;
        }
    };
    return @res;
}

sub getEnvironmentVariable
{
    my ( $self, $varname ) = @_;
    my @res = dispatch_remote_call( \&::_squish_remote_get_environment_variable,  $self->{connection_handle}, $varname );
    return $res[0];
}

sub getOSName
{
    my ( $self ) = @_;
    my @res = dispatch_remote_call( \&::_squish_remote_get_os_name,  $self->{connection_handle}, );
    return $res[0];
}

sub listFiles
{
    my ( $self, $path ) = @_;
    return dispatch_remote_call( \&::_squish_remote_get_directory_content,  $self->{connection_handle}, $path );
}

sub stat
{
    my ( $self, $path, $propertyname ) = @_;
    my @res = dispatch_remote_call( \&::_squish_remote_get_path_property,  $self->{connection_handle}, $path, $propertyname );
    return $res[0];
}

sub exists
{
    my ( $self, $path ) = @_;
    my @res = dispatch_remote_call( \&::_squish_remote_path_exists,  $self->{connection_handle}, $path );
    return $res[0];
}

sub deleteFile
{
    my ( $self, $path ) = @_;
    my @res = dispatch_remote_call( \&::_squish_remote_delete_file,  $self->{connection_handle}, $path );
    return $res[0];
}

sub deleteDirectory
{
    my ( $self, $path, $recursive ) = @_;
    $recursive = defined( $recursive )? $recursive : 0;
    my @res = dispatch_remote_call( \&::_squish_remote_delete_path,  $self->{connection_handle}, $path, $recursive );
    return $res[0];
}

sub createDirectory
{
    my ( $self, $path ) = @_;
    my @res = dispatch_remote_call( \&::_squish_remote_create_path,  $self->{connection_handle}, $path, 0 );
    return $res[0];
}
    
sub createPath
{
    my ( $self, $path ) = @_;
    my @res = dispatch_remote_call( \&::_squish_remote_create_path,  $self->{connection_handle}, $path, 1 );
    return $res[0];
}
        
sub rename
{
    my ( $self, $oldpath, $newpath ) = @_;
    my @res = dispatch_remote_call( \&::_squish_remote_rename_path,  $self->{connection_handle}, $oldpath, $newpath );
    return $res[0];
}
        
sub createTextFile
{
    my ( $self, $path, $content, $encoding ) = @_;
    $encoding = defined( $encoding )? $encoding : "UTF-8";
    my @res = dispatch_remote_call( \&::_squish_remote_create_file,  $self->{connection_handle}, $path, $content, $encoding );
    return $res[0];
}
        
sub upload
{
    my ( $self, $localpath, $remotepath ) = @_;
    my @res = dispatch_remote_call( \&::_squish_remote_upload_file,  $self->{connection_handle}, $localpath, $remotepath  );
    return $res[0];
}
        
sub download
{
    my ( $self, $remotepath, $localpath ) = @_;
    my @res = dispatch_remote_call( \&::_squish_remote_download_file,  $self->{connection_handle}, $remotepath, $localpath );
    return $res[0];
}
        
sub copy
{
    my ( $self, $sourcepath, $destpath ) = @_;
    my @res = dispatch_remote_call( \&::_squish_remote_copy_path,  $self->{connection_handle}, $sourcepath, $destpath );
    return $res[0];
}

1;
