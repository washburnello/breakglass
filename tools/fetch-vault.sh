#!/bin/bash
# BreakGlass vault fetcher: downloads the ZIM packs listed in
# assets/zims-manifest.js from download.kiwix.org, resumable (curl -C -)
# with retry, and verifies each against its .sha256 sidecar.
#
# Usage:
#   tools/fetch-vault.sh                 # base vault (WikiMed, iFixit EN, Wikipedia maxi)
#   tools/fetch-vault.sh --langs es,fr   # + extra iFixit languages (see --list-langs)
#   BREAKGLASS_VAULT=/mnt/bg/vault tools/fetch-vault.sh
#
# Tested 2026-09-15: base vault 130 GB verified OK.
set -u
V="${BREAKGLASS_VAULT:-$HOME/Work/breakglass-vault}"
mkdir -p "$V"

BASE_WIKI="wikipedia_en_medicine_maxi_2026-04.zim 6f67340a7cd7665bb57c27d2bbff97e26f2037477c9ea597345a118286820331"
BASE_IFIXIT="ifixit_en_all_2025-12.zim 9bb5f3408707fd0300c6ef47a425c3217187f144cd9154a928183816aa72eead"
BASE_MAXI="wikipedia_en_all_maxi_2026-02.zim" # verified against sidecar (124 GB)

# Known-good iFixit language packs (2026-09-15). Kiwix does NOT publish
# Hindi, Arabic, Bengali, Indonesian or Urdu iFixit packs; zh is 2024-06
# (newest available).
declare -A LANGS=(
  [es]=ifixit_es_all_2026-03.zim [fr]=ifixit_fr_all_2026-03.zim
  [pt]=ifixit_pt_all_2026-03.zim [ru]=ifixit_ru_all_2026-03.zim
  [zh]=ifixit_zh_all_2024-06.zim [ja]=ifixit_ja_all_2026-02.zim
  [de]=ifixit_de_all_2026-03.zim [it]=ifixit_it_all_2026-03.zim
  [ko]=ifixit_ko_all_2025-12.zim [nl]=ifixit_nl_all_2025-12.zim
  [tr]=ifixit_tr_all_2025-06.zim
)

fetch_hashed() { # subdir file expected-sha256
  local sub="$1" file="$2" expect="$3"
  echo "== $file =="
  curl -m 30 -sL -o "$V/$file.sha256" "https://lb.download.kiwix.org/zim/$sub/$file.sha256" || true
  curl -L -C - --retry 20 --retry-delay 10 --retry-all-errors \
    --speed-limit 1000 --speed-time 60 -o "$V/$file" \
    "https://download.kiwix.org/zim/$sub/$file"
  echo "$expect  $file" | (cd "$V" && sha256sum -c -)
}

fetch_sidecar() { # subdir file (verifies against published sidecar)
  local sub="$1" file="$2"
  echo "== $file =="
  curl -m 30 -sL -o "$V/$file.sha256" "https://lb.download.kiwix.org/zim/$sub/$file.sha256" || true
  curl -L -C - --retry 20 --retry-delay 10 --retry-all-errors \
    --speed-limit 1000 --speed-time 60 -o "$V/$file" \
    "https://download.kiwix.org/zim/$sub/$file"
  (cd "$V" && sha256sum -c "$file.sha256")
}

if [ "${1:-}" = "--list-langs" ]; then
  for k in "${!LANGS[@]}"; do echo "$k -> ${LANGS[$k]}"; done | sort
  exit 0
fi

EXTRA=""
if [ "${1:-}" = "--langs" ]; then EXTRA="${2:-}"; fi

# Base vault first: medical, then repair, then the 124 GB maxi last.
# shellcheck disable=SC2086
fetch_hashed wikipedia $BASE_WIKI
# shellcheck disable=SC2086
fetch_hashed ifixit $BASE_IFIXIT
fetch_sidecar wikipedia "$BASE_MAXI"

if [ -n "$EXTRA" ]; then
  IFS=',' read -ra WANT <<< "$EXTRA"
  for code in "${WANT[@]}"; do
    file="${LANGS[$code]:-}"
    [ -n "$file" ] || { echo "unknown language code: $code (see --list-langs)"; exit 1; }
    fetch_sidecar ifixit "$file"
  done
fi
echo VAULT-DONE
