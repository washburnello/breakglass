#!/bin/sh
# BreakGlass kit server launcher (Linux/macOS)
cd "$(dirname "$0")" || exit 1
if command -v python3 >/dev/null 2>&1; then
  exec python3 server/serve.py "$@"
fi
if command -v python >/dev/null 2>&1; then
  exec python server/serve.py "$@"
fi
echo "Python 3 is required to run the kit server."
echo "Install it (https://www.python.org) and run this again — or just double-click index.html,"
echo "which works fully except for emulator games and huge pack streaming."
read -r dummy
