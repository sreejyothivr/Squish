#!/bin/sh

set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
NMS_HELPER_PATH="$DIR"

case "$(uname -s)" in
Darwin)
    HOSTS_DIR="$HOME/Library/Application Support/Mozilla/NativeMessagingHosts"
    ;;
*)
    HOSTS_DIR="$HOME/.mozilla/native-messaging-hosts"
    ;;
esac
echo "Installing the native messaging host in:"
echo "$HOSTS_DIR"
mkdir -p "$HOSTS_DIR"

NMS_HELPER_PATH="$(echo $NMS_HELPER_PATH | sed -e 's/\//\\\//g')"
sed -e "s/__NMS_HELPER_PATH__/$NMS_HELPER_PATH/" "$DIR/com.froglogic.nmshelper.firefox.json" > "$HOSTS_DIR/com.froglogic.nmshelper.firefox.json"
