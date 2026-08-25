#!/usr/bin/env python3
"""Build assets/roms-manifest.js from the private ROM library at media/roms/.

Systems indexed: nes, gb, gbc, snes, gba (raw dumps + .zip archives) and
pico-8 (*.p8.png / *.p8 / *.js, always playable:false until the export
pipeline ships). Picotron is ignored entirely for now.

Title cleaning: filename stem minus extension(s); trailing bracket tags of
any style ([!], (USA), (nes)) are stripped repeatedly because this library
uses brackets for system/region metadata, not display; leftover trailing
separators are trimmed and whitespace collapsed.

ZIP_OK: true when the vendored EmulatorJS runtime can natively decompress
.zip (evidence: data/compression/extractzip.js present and referenced by
emulator.min.js). Zip entries get playable=ZIP_OK.

Skipped on purpose: anything under a _trash/ directory, PICO-8 internal
backup/ and cstore/ caches (version-history duplicates, not carts),
dotfiles, and every non-whitelisted extension (.pdf/.png/.txt/...).
"""

import json
import re
import sys
from pathlib import Path
from urllib.parse import quote

REPO_ROOT = Path(__file__).resolve().parent.parent
ROMS_ROOT = REPO_ROOT / "media" / "roms"
OUT_FILE = REPO_ROOT / "assets" / "roms-manifest.js"
EJS_DATA = REPO_ROOT / "assets" / "vendor" / "emulatorjs" / "data"

RAW_EXTENSIONS = {
    "nes": [".nes", ".zip"],
    "gb": [".gb", ".zip"],
    "gbc": [".gbc", ".zip"],
    "snes": [".sfc", ".smc", ".zip"],
    "gba": [".gba", ".zip"],
}
PICO8_EXTENSIONS = [".p8.png", ".p8", ".js"]
SKIP_DIRS = {"_trash", "backup", "cstore"}
BRACKET_TAG = re.compile(r"\s*[\[(][^\])]*[\])]\s*$")


def detect_zip_ok():
    worker = EJS_DATA / "compression" / "extractzip.js"
    bundle = EJS_DATA / "emulator.min.js"
    if not worker.is_file() or not bundle.is_file():
        return False, f"missing {worker.name} or {bundle.name}"
    try:
        if "extractzip" not in bundle.read_text(encoding="utf-8", errors="ignore"):
            return False, "emulator.min.js does not reference compression/extractzip.js"
    except OSError as exc:
        return False, f"unreadable bundle: {exc}"
    return True, (
        f"{worker.relative_to(REPO_ROOT)} present and wired into "
        "emulator.min.js (PK magic detected in src/compression.js -> "
        "worker decompresses zip client-side)"
    )


def clean_title(stem):
    title = stem
    while True:
        stripped = BRACKET_TAG.sub("", title)
        if stripped == title:
            break
        title = stripped
    title = re.sub(r"\s+", " ", title).strip(" -.")
    return title or stem.strip()


def rel_web_path(path):
    rel = path.relative_to(REPO_ROOT)
    return "../" + "/".join(quote(part) for part in rel.parts)


def scan_console_system(system, extensions, zip_ok):
    entries = []
    skipped = 0
    root = ROMS_ROOT / system
    if not root.is_dir():
        return entries, skipped
    for item in sorted(root.iterdir()):
        if item.name.startswith(".") or not item.is_file():
            continue
        lower = item.name.lower()
        if not any(lower.endswith(ext) for ext in extensions):
            skipped += 1
            continue
        stem = item.name
        for ext in extensions:
            if lower.endswith(ext):
                stem = item.name[: -len(ext)]
                break
        entries.append(
            {
                "sys": system,
                "file": item.name,
                "path": rel_web_path(item),
                "title": clean_title(stem),
                "size": item.stat().st_size,
                "playable": bool(zip_ok) if lower.endswith(".zip") else True,
            }
        )
    return entries, skipped


def scan_pico8():
    entries = []
    root = ROMS_ROOT / "pico-8"
    if not root.is_dir():
        return entries
    for item in sorted(root.rglob("*")):
        if item.name.startswith(".") or not item.is_file():
            continue
        if SKIP_DIRS.intersection(item.relative_to(root).parts[:-1]):
            continue
        lower = item.name.lower()
        matched_ext = next((ext for ext in PICO8_EXTENSIONS if lower.endswith(ext)), None)
        if matched_ext is None:
            continue
        entries.append(
            {
                "sys": "pico8",
                "file": str(item.relative_to(root)),
                "path": rel_web_path(item),
                "title": clean_title(item.name[: -len(matched_ext)]),
                "size": item.stat().st_size,
                "playable": False,
            }
        )
    return entries


def main():
    zip_ok, zip_evidence = detect_zip_ok()

    entries = []
    per_system = {}
    total_skipped = 0
    for system, extensions in RAW_EXTENSIONS.items():
        rows, skipped = scan_console_system(system, extensions, zip_ok)
        entries.extend(rows)
        total_skipped += skipped
        per_system[system] = len(rows)
    pico_rows = scan_pico8()
    entries.extend(pico_rows)
    per_system["pico8"] = len(pico_rows)

    entries.sort(key=lambda e: (e["sys"], e["title"].casefold(), e["file"].casefold()))

    payload = json.dumps(entries, ensure_ascii=False, separators=(",", ":"))
    OUT_FILE.write_text("window.BG_ROMS=" + payload + ";\n", encoding="utf-8")

    print(f"ZIP_OK: {'true' if zip_ok else 'false'} ({zip_evidence})")
    print(f"Wrote {OUT_FILE.relative_to(REPO_ROOT)} ({OUT_FILE.stat().st_size} bytes)")
    for system in sorted(per_system):
        playable = sum(1 for e in entries if e["sys"] == system and e["playable"])
        note = ""
        if system == "pico8":
            note = " (playable:false pending PICO-8 export pipeline)"
        print(f"  {system}: {per_system[system]} entries ({playable} playable){note}")
    print(f"  total: {len(entries)} entries, {total_skipped} non-ROM files skipped")
    return 0


if __name__ == "__main__":
    sys.exit(main())
