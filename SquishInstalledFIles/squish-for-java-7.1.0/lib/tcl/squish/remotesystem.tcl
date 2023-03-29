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

package provide squish::remotesystem 6.1.0

namespace eval ::Squish {
    namespace export RemoteSystem
    variable objectId 0
}

proc ::Squish::RemoteSystem {cmd args} {
    switch -- $cmd {
        new {
            set host -1
            set port -1

            if { [llength $args] == 2 } {
                foreach {host port} $args break
            } elseif { [llength $args] == 1 } {
                foreach {host} $args break
            }

            #connect
            if { $host == -1 && $port != -1 } {
                return -code error "Host not specified $host:$port"
            }
            if { $host != -1 && $port == -1 } {
                set port 4322
            }
            if { $host == -1 || $port == -1 } {
                if {[catch {set temp_handle [_squish_connect_to_remote_system]} errmsg]} {
                    return -code error "Connection not established: $errmsg"
                }
            } else {
                if {[catch {set temp_handle [_squish_connect_to_remote_system $host $port]} errmsg]} {
                    return -code error "Connection not established: $errmsg"
                }
            }

            if { $temp_handle == -1 } {
                return -code error "Connection not established."
            } else {

                #create procedure
                set objectName "remote_system_api_object_[incr ::Squish::objectId]"

                set objectConnectionHandle ::Squish::${objectName}_connection_handle
                variable $objectConnectionHandle $temp_handle

                proc $objectName {cmd args} "
                    switch \$cmd {
                        close {
                            if { \$$objectConnectionHandle >= 0 } {
                                if \[ catch { set res \[_squish_close_remote_system_connection \$$objectConnectionHandle\]} errmsg\] {
                                    return -code error \$errmsg
                                } else {
                                    set $objectConnectionHandle -1
                                }
                            }
                        }
                        execute {
                            # That's missing compared to tcl exec() function.
                            # The Tcl parser for the args is not reproduced.
                            # The behavior to return only the last stderr line is not reproduced.
                            # The behavior to treat stderr output as error is not reproduced.
                            # https://www.tcl.tk/man/tcl8.5/tutorial/Tcl36.html
                            # https://www.tcl.tk/man/tcl8.5/tutorial/Tcl26.html
                            # Internal errors don't throw a exception

                            set cwd \"\"
                            set env {}
                            set options {}

                            if { \[llength \$args\] > 3} {
                                foreach {execCmd cwd env options} \$args break
                            } elseif { \[llength \$args\] > 2 } {
                                foreach {execCmd cwd env} \$args break
                            } elseif { \[llength \$args\] > 1 } {
                                foreach {execCmd cwd} \$args break
                            } else {
                                foreach {execCmd} \$args break
                            }

                            if \[catch {set res \[_squish_remote_execute_command \$$objectConnectionHandle \$execCmd \$cwd \$env \$options\]} errmsg\] {
                                return -code error \"Command not executed: \$errmsg\"
                            } else {
                                # Tcl handles non 0 exit codes as error
                                if {\[dict get \$res \"exitcode\"\] ne \"\"} { # nothing to check for
                                    if {\[dict get \$res \"exitcode\"\] ne \"0\"} {
                                        return -code error -errorinfo \[dict get \$res \"stderr\"\] -errorcode \[dict get \$res \"exitcode\"\] \[dict get \$res \"stdout\"\]
                                    }
                                }
                                # internal errors throw exception
                                if {\[dict get \$res \"errornr\"\] ne \"0\"} {
                                    return -code error -errorcode \[dict get \$res \"errornr\"\] \[dict get \$res \"errorstr\"\]
                                }

                                dict unset res \"errornr\"
                                dict unset res \"errorstr\"

                                return \[list \[dict get \$res \"exitcode\"\] \[dict get \$res \"stdout\"\] \[dict get \$res \"stderr\"\]\]
                            }
                        }
                        getEnvironmentVariable {
                            foreach {varname} \$args break
                            return \[_squish_remote_get_environment_variable \$$objectConnectionHandle \$varname \]
                        }
                        getOSName {
                            foreach {varname} \$args break
                            return \[_squish_remote_get_os_name \$$objectConnectionHandle \]
                        }
                        listFiles {
                            foreach {path} \$args break
                            return \[_squish_remote_get_directory_content \$$objectConnectionHandle \$path \]
                        }
                        stat {
                            foreach {path propertyname} \$args break
                            return \[_squish_remote_get_path_property \$$objectConnectionHandle \$path \$propertyname \]
                        }
                        exists {
                            foreach {path} \$args break
                            return \[_squish_remote_path_exists \$$objectConnectionHandle \$path \]
                        }
                        deleteFile {
                            foreach {path} \$args break
                            return \[_squish_remote_delete_file \$$objectConnectionHandle \$path \]
                        }
                        deleteDirectory {
                            set recursive false

                            if { \[llength \$args\] > 1} {
                                foreach {path recursive} \$args break
                            } else {
                                foreach {path} \$args break
                            }

                            return \[_squish_remote_delete_path \$$objectConnectionHandle \$path \$recursive \]
                        }
                        createDirectory {
                            foreach {path} \$args break
                            return \[_squish_remote_create_path \$$objectConnectionHandle \$path false \]
                        }
                        createPath {
                            foreach {path} \$args break
                            return \[_squish_remote_create_path \$$objectConnectionHandle \$path true \]
                        }
                        rename {
                            foreach {oldpath newpath} \$args break
                            return \[_squish_remote_rename_path \$$objectConnectionHandle \$oldpath \$newpath \]
                        }
                        createTextFile {
                            set encoding \"UTF-8\"

                            if { \[llength \$args\] > 2} {
                                foreach {path content encoding} \$args break
                            } else {
                                foreach {path content} \$args break
                            }

                            foreach {path content} \$args break
                            return \[_squish_remote_create_file \$$objectConnectionHandle \$path \$content \$encoding \]
                        }
                        upload {
                            foreach {sourcepath destpath} \$args break
                            return \[_squish_remote_upload_file \$$objectConnectionHandle \$sourcepath \$destpath \]
                        }
                        download {
                            foreach {sourcepath destpath} \$args break
                            return \[_squish_remote_download_file \$$objectConnectionHandle \$sourcepath \$destpath \]
                        }
                        copy {
                            foreach {sourcepath destpath} \$args break
                            return \[_squish_remote_copy_path \$$objectConnectionHandle \$sourcepath \$destpath \]
                        }

                        default {
                            error \"unknown field '\$cmd'\"
                        }
                    }
                "
                return "::Squish::$objectName"
            }
            default {
                error "unknown field '$cmd'"
            }
        }
    }
}

