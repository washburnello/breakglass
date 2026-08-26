#!/bin/bash
# BreakGlass packager: builds the Pocket and Fat kits into dist/.
#
# Pocket kit:  the whole distributable site (no maintainer docs, no private
#              library) — small, zip-and-share, includes START-SERVER.
# Fat kit:     pocket + public media packs. NEVER contains media/roms
#              (private), media/zims (symlinks into vault), or build-time
#              sources; those stay on the owner's hardware.
set -euo pipefail

SRC="/mnt/tb01/breakglass"
DIST="$HOME/projects/breakglass/dist"
STAMP="$(date +%Y%m%d)"

EXCLUDE_COMMON=(
  --exclude '/vault/' --exclude '/var/' --exclude '/dist/'
  --exclude '/assets/roms-manifest.js' --exclude '/assets/zims-manifest.js'
  --exclude '.DS_Store' --exclude '._*' --exclude '/.directory'
)

rm -rf "$DIST"
mkdir -p "$DIST/pocket" "$DIST/fat"

echo "== staging pocket kit =="
rsync -a \
  "${EXCLUDE_COMMON[@]}" \
  --exclude '/media/' \
  --exclude '/plan.md' --exclude '/field-guide.md' \
  "$SRC/" "$DIST/pocket/"

echo "== staging fat kit =="
rsync -a \
  "${EXCLUDE_COMMON[@]}" \
  --exclude '/media/roms/' \
  --exclude '/media/zims/' \
  --exclude '/media/packs/' \
  --exclude '/plan.md' --exclude '/field-guide.md' \
  "$SRC/" "$DIST/fat/"

for kind in pocket fat; do
  echo "== zipping $kind =="
  (cd "$DIST/$kind" && zip -qr "$DIST/breakglass-$kind-$STAMP.zip" .)
  rm -rf "$DIST/$kind"
done

echo
echo "== results =="
ls -lh "$DIST/"*.zip | awk '{print $5, $9}'
echo
unzip -l "$DIST/breakglass-pocket-$STAMP.zip" | tail -1
unzip -l "$DIST/breakglass-fat-$STAMP.zip" | tail -1
