set -euo pipefail
SRC="$HOME/projects/breakglass"
DST="/mnt/tb01/breakglass"
python3 "$SRC/tools/build-search.py"
rsync -a --delete \
  --exclude '.git/' \
  --exclude 'tools/' \
  --exclude 'docs/' \
  --exclude 'media' \
  --exclude '.DS_Store' \
  --exclude '._*' \
  "$SRC/" "$DST/"
sudo restorecon -Rv "$DST" | tail -1
echo "Deployed to $DST ($(find "$DST" -type f | wc -l) files)"
