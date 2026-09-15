#!/bin/bash
# BreakGlass vault monitor: watches a fetch-vault.sh run, sha256-verifies
# each ZIM as it lands, and (re)starts kiwix-serve with the full verified
# set. Machine-readable state goes to $VAULT/STATUS.
#
# Usage:
#   BREAKGLASS_VAULT=/mnt/bg/vault KIWIX_BIN=/usr/bin/kiwix-serve \
#     tools/monitor-vault.sh &
# State: $VAULT/STATUS, $VAULT/monitor.log
set -u
V="${BREAKGLASS_VAULT:-$HOME/Work/breakglass-vault}"
KIWIX="${KIWIX_BIN:-$V/bin/kiwix-serve}"
PORT="${KIWIX_PORT:-8080}"
LOG="$V/monitor.log"
STATUS="$V/STATUS"
SERVED_MARKER="$V/.served_set"

# Pinned hashes for the base vault (2026-09-15, verified). Anything else in
# ORDER is verified against its .sha256 sidecar.
declare -A EXPECT=(
  [wikipedia_en_medicine_maxi_2026-04.zim]=6f67340a7cd7665bb57c27d2bbff97e26f2037477c9ea597345a118286820331
  [ifixit_en_all_2025-12.zim]=9bb5f3408707fd0300c6ef47a425c3217187f144cd9154a928183816aa72eead
)
ORDER="wikipedia_en_medicine_maxi_2026-04.zim ifixit_en_all_2025-12.zim wikipedia_en_all_maxi_2026-02.zim ifixit_es_all_2026-03.zim ifixit_fr_all_2026-03.zim ifixit_pt_all_2026-03.zim ifixit_ru_all_2026-03.zim ifixit_zh_all_2024-06.zim ifixit_ja_all_2026-02.zim ifixit_de_all_2026-03.zim"

log() { echo "$(date '+%F %T') $*" >> "$LOG"; }

verified_set() {
  local out="" f
  for f in $ORDER; do
    [ -f "$V/$f" ] || continue
    if [ -n "${EXPECT[$f]:-}" ]; then
      echo "${EXPECT[$f]}  $f" | (cd "$V" && sha256sum -c --status -) 2>/dev/null && out="$out $f"
    else
      [ -f "$V/$f.sha256" ] && (cd "$V" && sha256sum -c --status "$f.sha256") 2>/dev/null && out="$out $f"
    fi
  done
  echo "$out" | xargs
}

restart_kiwix() {
  local files="$1" args=() f
  for f in $files; do args+=("$V/$f"); done
  pkill -f "kiwix-serve -p $PORT" 2>/dev/null
  sleep 2
  setsid nohup "$KIWIX" -p "$PORT" -i all "${args[@]}" > "$V/kiwix-$PORT.log" 2>&1 < /dev/null &
  disown
  sleep 3
  local code
  code=$(curl -m 10 -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT/" || echo 000)
  log "kiwix-serve restarted with [$files] -> :$PORT = $code"
  echo "$files" > "$SERVED_MARKER"
}

write_status() {
  {
    echo "updated=$(date -u '+%FT%TZ')"
    echo "verified=[$2]"
    echo "served=[$(cat "$SERVED_MARKER" 2>/dev/null || echo none)]"
    echo "kiwix=$PORT:$(curl -m 8 -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT/" || echo 000)"
    for f in $ORDER; do
      if [ -f "$V/$f" ]; then echo "size_$f=$(stat -c%s "$V/$f")"
      else echo "size_$f=0"; fi
    done
  } > "$STATUS"
}

log "monitor started (pid $$), vault=$V"
[ -f "$SERVED_MARKER" ] || echo "" > "$SERVED_MARKER"

while true; do
  now_verified="$(verified_set)"
  served="$(cat "$SERVED_MARKER" 2>/dev/null)"
  if [ "$now_verified" != "$served" ] && [ -n "$now_verified" ]; then
    log "new verified set: [$now_verified] (was [$served])"
    restart_kiwix "$now_verified"
  fi
  write_status "" "$now_verified"
  sleep 60
done
