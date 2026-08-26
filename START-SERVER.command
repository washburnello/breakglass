#!/bin/sh
cd "$(dirname "$0")"
exec server/START-SERVER.sh "$@"
