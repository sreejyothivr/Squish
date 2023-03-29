#!/bin/sh

set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
NMS_HELPER_PATH="$DIR"

if [ -z "$1" ]; then
    echo "Usage: $0 <profile directory>"
    exit 1
else
    PROFILE_DIR="$1"
fi

echo "Using profile directory: $PROFILE_DIR"

HOSTS_DIR="$PROFILE_DIR/NativeMessagingHosts"
mkdir -p "$HOSTS_DIR"

NMS_HELPER_PATH="$(echo $NMS_HELPER_PATH | sed -e 's/\//\\\//g')"
sed -e "s/__NMS_HELPER_PATH__/$NMS_HELPER_PATH/" "$DIR/com.froglogic.nmshelper.chrome.json" > "$HOSTS_DIR/com.froglogic.nmshelper.chrome.json"
