#!/usr/bin/env python3
"""Fetch one freely-licensed photo per ID Browser entry from Wikimedia Commons.

Build-time only tool (the site itself stays fully offline). Downloads the
original JPEG when it is <=1 MB and licensed Public Domain / CC0 / CC-BY /
CC BY-SA (NC and ND are rejected outright), saves it to
/mnt/tb01/breakglass/media/id/<id>.jpg via the repo's media/ symlink, and
records a license ledger at tools/cache/id-images.json.

Usage:
    python3 tools/fetch-id-images.py            # fetch missing images
    python3 tools/fetch-id-images.py --force    # refetch everything
    python3 tools/fetch-id-images.py --only copperhead
"""
from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DATA_JS = REPO / "assets" / "id-data.js"
MEDIA_DIR = REPO / "media" / "id"  # repo media/ symlinks to /mnt/tb01/breakglass/media
LEDGER = REPO / "tools" / "cache" / "id-images.json"
USER_AGENT = "BreakGlass-kit-builder/1.0 (contact: owner)"
API = "https://commons.wikimedia.org/w/api.php"
MAX_BYTES = 1_000_000  # prefer originals up to 1 MB
MIN_WIDTH = 400        # reject thumbnails-of-thumbnails
THUMB_WIDTH = 1280     # sanctioned Commons thumbnail fallback when originals are rate-limited
PAUSE_SECONDS = 3.5    # politeness pacing between requests
READ_DEADLINE_SECONDS = 120  # hard cap per response body (defeats trickle hangs)

# Curated search terms per dataset id (scientific names hit Commons best;
# generic hazards need concept queries). First list wins if it yields a match.
QUERIES: dict[str, list[str]] = {
    "bark-scorpion": ["Centruroides sculpturatus", "bark scorpion Arizona"],
    "black-widow": ["Latrodectus hesperus female", "black widow spider Latrodectus"],
    "blue-green-algae": ["cyanobacteria bloom lake", "blue-green algae bloom water"],
    "brown-recluse": ["Loxosceles reclusa", "brown recluse spider"],
    "castor-bean": ["Ricinus communis fruits", "castor bean plant seeds"],
    "cattail": ["Typha latifolia seed head", "cattail Typha"],
    "chigger": ["Trombicula autumnalis", "harvest mite chigger"],
    "contaminated-floodwater": ["flooded street sewage", "flood water road debris"],
    "copperhead": ["Agkistrodon contortrix", "copperhead snake"],
    "coral-snake": ["Micrurus fulvius", "eastern coral snake"],
    "cottonmouth": ["Agkistrodon piscivorus", "water moccasin snake"],
    "dandelion": ["Taraxacum officinale flower", "dandelion flower"],
    "deadly-nightshade": ["Atropa belladonna berries", "belladonna plant"],
    "death-camas": ["Toxicoscordion venenosum", "Zigadenus venenosus flowers"],
    "death-cap": ["Amanita phalloides", "death cap mushroom"],
    "deer-tick": ["Ixodes scapularis", "blacklegged tick Ixodes"],
    "destroying-angel": ["Amanita virosa", "destroying angel mushroom Amanita bisporigera"],
    "downed-power-line": ["downed power line storm", "fallen electric wire pole"],
    "false-morel": ["Gyromitra esculenta", "false morel mushroom"],
    "fire-ant": ["Solenopsis invicta", "red imported fire ant"],
    "fly-agaric": ["Amanita muscaria", "fly agaric mushroom"],
    "foxglove": ["Digitalis purpurea", "foxglove flowers"],
    "giant-hogweed": ["Heracleum mantegazzianum", "giant hogweed inflorescence"],
    "honeybee": ["Apis mellifera worker", "western honey bee macro"],
    "jackolantern": ["Omphalotus illudens", "Omphalotus olearius cluster"],
    "jimson-weed": ["Datura stramonium flower", "jimson weed Datura"],
    "mosquito": ["Aedes aegypti", "Culex mosquito"],
    "oleander": ["Nerium oleander flowers", "oleander pink blossom"],
    "poison-hemlock": ["Conium maculatum", "poison hemlock stem flowers"],
    "poison-ivy": ["Toxicodendron radicans leaves", "poison ivy leaflets"],
    "poison-oak": ["Toxicodendron diversilobum", "poison oak leaves"],
    "poison-sumac": ["Toxicodendron vernix", "poison sumac berries"],
    "pokeweed": ["Phytolacca americana berries", "pokeweed ripe fruit"],
    "rattlesnakes": ["Crotalus atrox", "western diamondback rattlesnake Crotalus"],
    "rodent-droppings": ["Peromyscus maniculatus", "deer mouse"],
    "skunks-raccoons": ["Mephitis mephitis", "striped skunk Procyon lotor raccoon"],
    "stinging-nettle": ["Urtica dioica leaves", "stinging nettle plant"],
    "wasps-hornets": ["Vespula germanica wasp", "yellowjacket wasp paper wasp Polistes"],
    "water-hemlock": ["Cicuta virosa", "Cicuta maculata water hemlock"],
    "white-snakeroot": ["Ageratina altissima", "Eupatorium rugosum white snakeroot flowers"],
    "wild-onion-garlic": ["Allium vineale", "Allium ursinum wild garlic leaves"],
}


def load_entries() -> list[dict]:
    raw = DATA_JS.read_text(encoding="utf-8")
    start = raw.index("[")
    end = raw.rindex("]") + 1
    return json.loads(raw[start:end])


class Client:
    """Tiny urllib wrapper enforcing UA + 1 req/sec pacing."""

    def __init__(self) -> None:
        self._last = 0.0

    def get(self, url: str, timeout: int = 45) -> bytes:
        delay = 20.0
        for attempt in range(4):
            wait = PAUSE_SECONDS - (time.monotonic() - self._last)
            if wait > 0:
                time.sleep(wait)
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            try:
                with urllib.request.urlopen(req, timeout=timeout) as resp:
                    chunks: list[bytes] = []
                    started = time.monotonic()
                    while True:
                        if time.monotonic() - started > READ_DEADLINE_SECONDS:
                            raise TimeoutError(f"read exceeded {READ_DEADLINE_SECONDS}s: {url}")
                        chunk = resp.read(65536)
                        if not chunk:
                            break
                        chunks.append(chunk)
                    data = b"".join(chunks)
            except urllib.error.HTTPError as exc:
                self._last = time.monotonic()
                if exc.code == 429 and attempt < 3:
                    print(f"    ! 429 rate-limited, backing off {delay:.0f}s", file=sys.stderr)
                    time.sleep(delay)
                    delay *= 2
                    continue
                raise
            except Exception:
                self._last = time.monotonic()
                raise
            self._last = time.monotonic()
            return data
        raise RuntimeError("rate-limit retries exhausted")

    def api(self, params: dict[str, str]) -> dict:
        params = dict(params, format="json")
        url = API + "?" + urllib.parse.urlencode(params)
        return json.loads(self.get(url).decode("utf-8"))


def strip_html(value: str) -> str:
    text = re.sub(r"<[^>]+>", "", value or "")
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def license_class(short_name: str) -> str | None:
    s = (short_name or "").strip().lower()
    if not s:
        return None
    compact = s.replace(" ", "")
    # hard-reject NC/ND variants anywhere in the string
    if re.search(r"\b(nc|nd)\b", s) or "-nc" in compact or "-nd" in compact:
        return None
    if (
        "public domain" in s
        or re.search(r"\bpd\b", s)
        or s.startswith("pd-")
        or s == "cc0"
        or "cc zero" in s
        or "copyrighted free use" in s
    ):
        return "Public domain"
    if s == "attribution":
        return "CC BY"
    m = re.match(r"^cc by(-sa)?(?:\s*[\d.+]+)?$", s)
    if m:
        return "CC BY-SA" if m.group(1) else "CC BY"
    return None


def candidates_for(client: Client, query: str) -> list[dict]:
    data = client.api({
        "action": "query",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": "6",
        "gsrlimit": "25",
        "prop": "imageinfo",
        "iiprop": "url|size|mime|extmetadata",
        "iiurlwidth": str(THUMB_WIDTH),
    })
    pages = (data.get("query") or {}).get("pages") or {}
    out: list[dict] = []
    for page in pages.values():
        infos = page.get("imageinfo") or []
        if not infos:
            continue
        info = infos[0]
        meta = info.get("extmetadata") or {}
        lic_raw = strip_html((meta.get("LicenseShortName") or {}).get("value", ""))
        lic = license_class(lic_raw)
        if lic is None:
            continue
        if info.get("mime") != "image/jpeg":
            continue
        width = info.get("width") or 0
        size = info.get("size") or 0
        if width < MIN_WIDTH or size <= 0:
            continue
        out.append({
            "title": page.get("title", ""),
            "url": info.get("url", ""),
            "thumb": info.get("thumburl", ""),
            "page": info.get("descriptionurl", ""),
            "license": lic,
            "license_raw": lic_raw,
            "author": strip_html((meta.get("Artist") or {}).get("value", ""))[:200],
            "width": width,
            "bytes": size,
            "small": bool(size and size <= MAX_BYTES),
        })
    # PD first, then small files, then bigger resolution among equals
    rank = {"Public domain": 0}
    out.sort(key=lambda c: (
        rank.get(c["license"], 1),
        0 if c["small"] else 1,
        -c["width"],
        c["bytes"],
    ))
    return out


def is_jpeg(data: bytes) -> bool:
    return len(data) > 3 and data[0] == 0xFF and data[1] == 0xD8 and data[2] == 0xFF


def fetch_entry(client: Client, entry_id: str, queries: list[str]) -> tuple[dict | None, bytes, str | None]:
    oversized_note = ""
    for query in queries:
        try:
            candidates = candidates_for(client, query)
        except Exception as exc:  # noqa: BLE001 - report and continue
            print(f"    ! search failed for {entry_id} ({query}): {exc}", file=sys.stderr)
            continue
        if not candidates:
            continue
        for cand in candidates:  # sorted: PD first, then small originals
            # thumbnails first: small, cached, and what Commons recommends when
            # original downloads are rate-limited; original as fallback
            urls = []
            if cand.get("thumb"):
                urls.append(cand["thumb"])
            urls.append(cand["url"])
            data = b""
            for url in urls:
                try:
                    blob = client.get(url)
                except Exception as exc:  # noqa: BLE001
                    print(f"    ! download failed {cand['title']}: {exc}", file=sys.stderr)
                    continue
                if not is_jpeg(blob):
                    print(f"    ! not a JPEG, skipping {cand['title']}", file=sys.stderr)
                    continue
                data = blob
                break
            if not data:
                continue
            if len(data) > MAX_BYTES:
                # note it but keep looking — another candidate may fit
                if not oversized_note:
                    oversized_note = (
                        f"SKIP-large ({len(data)} bytes, {cand['license']} — {cand['page']})"
                    )
                print(f"    ! oversize ({len(data)} bytes), trying next candidate", file=sys.stderr)
                continue
            record = {
                "id": entry_id,
                "source_url": cand["page"],
                "file": f"media/id/{entry_id}.jpg",
                "license": cand["license_raw"] or cand["license"],
                "author": cand["author"],
                "bytes": len(data),
            }
            return record, data, None
    return None, b"", oversized_note or "SKIP-no-free-image"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true", help="refetch even if file exists")
    parser.add_argument("--only", metavar="ID[,ID...]", help="limit to these dataset ids")
    args = parser.parse_args()

    entries = load_entries()
    ids = [(e["id"], e["name"]) for e in entries]
    if args.only:
        wanted = {x.strip() for x in args.only.split(",")}
        ids = [(i, n) for i, n in ids if i in wanted]
        missing = wanted - {i for i, _ in ids}
        if not ids or missing:
            print(f"id(s) not in dataset: {sorted(missing)}", file=sys.stderr)
            return 2

    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    LEDGER.parent.mkdir(parents=True, exist_ok=True)
    lock = LEDGER.parent / ".id-images.lock"
    try:
        fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        os.write(fd, str(os.getpid()).encode())
        os.close(fd)
    except FileExistsError:
        print(f"another instance holds {lock}; delete it if that instance is dead", file=sys.stderr)
        return 3

    previous: dict[str, dict] = {}
    if LEDGER.exists():
        old = json.loads(LEDGER.read_text(encoding="utf-8"))
        previous = {r["id"]: r for r in old.get("images", [])}

    exit_code = 0
    try:
        exit_code = run(args, ids, previous)
    finally:
        lock.unlink(missing_ok=True)
    return exit_code


def run(args: argparse.Namespace, ids: list[tuple[str, str]], previous: dict[str, dict]) -> int:
    client = Client()
    ledger: list[dict] = []
    skipped: list[dict] = []
    fetched = reused = 0

    for entry_id, name in ids:
        dest = MEDIA_DIR / f"{entry_id}.jpg"
        if dest.exists() and not args.force:
            rec = previous.get(entry_id)
            if rec:
                ledger.append(rec)
                print(f"  = {entry_id}: already present, kept")
            else:
                ledger.append({
                    "id": entry_id,
                    "source_url": "(pre-existing; rerun --force to refresh metadata)",
                    "file": f"media/id/{entry_id}.jpg",
                    "license": "unknown",
                    "author": "",
                    "bytes": dest.stat().st_size,
                })
                print(f"  = {entry_id}: already present (no prior ledger row)")
            reused += 1
            continue

        queries = QUERIES.get(entry_id) or [name]
        print(f"  -> {entry_id}: searching ({name})")
        record, data, reason = fetch_entry(client, entry_id, queries)
        if record is None:
            skipped.append({"id": entry_id, "reason": reason or ""})
            print(f"  x {entry_id}: {reason}")
            continue
        tmp = dest.with_suffix(".jpg.part")
        tmp.write_bytes(data)
        tmp.rename(dest)
        ledger.append(record)
        fetched += 1
        print(f"  + {entry_id}: saved {record['bytes']} bytes [{record['license']}]")

    payload = {"fetched": fetched, "images": ledger, "skipped": skipped}
    LEDGER.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    total_mb = sum(r["bytes"] for r in ledger) / 1_048_576
    print(f"\nledger: {LEDGER}")
    print(f"matched: {len(ledger)}/{len(ids)}  fetched-now: {fetched}  reused: {reused}")
    print(f"skipped: {[s['id'] for s in skipped]}")
    print(f"total: {total_mb:.2f} MB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
