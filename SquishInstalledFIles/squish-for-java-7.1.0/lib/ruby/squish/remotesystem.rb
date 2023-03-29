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
  RemoteSystemError = Class.new(StandardError)
  
  class RemoteSystem
    @connection_handle = -1
    def close()
        if (@connection_handle >= 0)
            begin
                Squish._squish_close_remote_system_connection( @connection_handle )
                @connection_handle = -1
            rescue Exception => e
                raise RemoteSystemError, e.to_s
            end
        end
    end

    def initialize(host = "", port = 0)
      @host = host 
      @port = port

      if (@host != "") && (@port == 0)
        @port = 4322
      end

      if (@host == "") && (@port != 0)
        raise ArgumentError, "Host not specified"
      end

      if (@host == "") || (@port == 0)
        @connection_handle = Squish._squish_connect_to_remote_system()
      else
        @connection_handle = Squish._squish_connect_to_remote_system(@host, @port.to_i)
      end
      ObjectSpace.define_finalizer( self, proc { self.close } )
    end

    def execute(cmd, cwd = "", env = {}, options = {})
      cmd = cmd.flatten

      cmd = cmd.each_with_index{|v,i| cmd[i] = v.to_s}

      cwd = cwd.to_s

      env.each{|k, v| env[k] = v.to_s}

      result = Squish._squish_remote_execute_command(@connection_handle, cmd, cwd, env, options)

      if (result["errornr"].to_i > 0)
        raise RuntimeError, result["errorstr"]
      end

      return [result["exitcode"], result["stdout"], result["stderr"]]
    end 
        
    def getEnvironmentVariable( varname )
      begin
        return Squish._squish_remote_get_environment_variable( @connection_handle, varname )
      rescue Exception => e
        raise RemoteSystemError, "Remote system call failed: " + e.to_s
      end
    end

    def getOSName()
      begin
        return Squish._squish_remote_get_os_name( @connection_handle )
      rescue Exception => e
        raise RemoteSystemError, "Remote system call failed: " + e.to_s
      end
    end
    
    def listFiles( path )
      begin
        return Squish._squish_remote_get_directory_content( @connection_handle, path )
      rescue Exception => e
        raise RemoteSystemError, "Remote system call failed: " + e.to_s
      end
    end
            
    def stat( path, propertyname )
      begin
        return Squish._squish_remote_get_path_property( @connection_handle, path, propertyname )
      rescue Exception => e
        raise RemoteSystemError, "Remote system call failed: " + e.to_s
      end
    end
        
    def exists( path )
      begin
        return Squish._squish_remote_path_exists( @connection_handle, path )
      rescue Exception => e
        raise RemoteSystemError, "Remote system call failed: " + e.to_s
      end
    end
        
    def deleteFile( path )
      begin
        return Squish._squish_remote_delete_file( @connection_handle, path )
      rescue Exception => e
        raise RemoteSystemError, "Remote system call failed: " + e.to_s
      end
    end

    def deleteDirectory( path, recursive=false )
      begin
        return Squish._squish_remote_delete_path( @connection_handle, path, recursive )
      rescue Exception => e
        raise RemoteSystemError, "Remote system call failed: " + e.to_s
      end
    end
    
    def createDirectory( path )
      begin
        return Squish._squish_remote_create_path( @connection_handle, path, false )
      rescue Exception => e
        raise RemoteSystemError, "Remote system call failed: " + e.to_s
      end
    end        

    def createPath( path )
      begin
        return Squish._squish_remote_create_path( @connection_handle, path, true )
      rescue Exception => e
        raise RemoteSystemError, "Remote system call failed: " + e.to_s
      end
    end
    
    def rename( oldpath, newpath )
      begin
        return Squish._squish_remote_rename_path( @connection_handle, oldpath, newpath )
      rescue Exception => e
        raise RemoteSystemError, "Remote system call failed: " + e.to_s
      end
    end
    
    def createTextFile( path, content, encoding="UTF-8" )
      begin
        return Squish._squish_remote_create_file( @connection_handle, path, content, encoding )
      rescue Exception => e
        raise RemoteSystemError, "Remote system call failed: " + e.to_s
      end
    end
    
    def upload( localpath, remotepath )
      begin
        return Squish._squish_remote_upload_file( @connection_handle, localpath, remotepath )
      rescue Exception => e
        raise RemoteSystemError, "Remote system call failed: " + e.to_s
      end
    end
    
    def download( remotepath, localpath )
      begin
        return Squish._squish_remote_download_file( @connection_handle, remotepath, localpath )
      rescue Exception => e
        raise RemoteSystemError, "Remote system call failed: " + e.to_s
      end
    end
     
    def copy( sourcepath, destpath )
      begin
        return Squish._squish_remote_copy_path( @connection_handle, sourcepath, destpath )
      rescue Exception => e
        raise RemoteSystemError, "Remote system call failed: " + e.to_s
      end
    end
  end
end

