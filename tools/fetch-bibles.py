#!/usr/bin/env python3
import argparse
import glob
import io
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.request
import zipfile

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_DIR = os.path.join(REPO_ROOT, "tools", "cache")
OUT_DIR = os.path.join(REPO_ROOT, "assets", "bible")

SOURCE_URLS = [
    "https://ebible.org/Scriptures/eng-web_vpl.zip",
    "https://ebible.org/Scriptures/eng-web_usfm.zip",
]
CACHE_PATH = os.path.join(CACHE_DIR, "eng-web_vpl.zip")

BOOKS = [
    ("GEN", "Genesis"), ("EXO", "Exodus"), ("LEV", "Leviticus"), ("NUM", "Numbers"),
    ("DEU", "Deuteronomy"), ("JOS", "Joshua"), ("JDG", "Judges"), ("RUT", "Ruth"),
    ("1SA", "1 Samuel"), ("2SA", "2 Samuel"), ("1KI", "1 Kings"), ("2KI", "2 Kings"),
    ("1CH", "1 Chronicles"), ("2CH", "2 Chronicles"), ("EZR", "Ezra"), ("NEH", "Nehemiah"),
    ("EST", "Esther"), ("JOB", "Job"), ("PSA", "Psalms"), ("PRO", "Proverbs"),
    ("ECC", "Ecclesiastes"), ("SNG", "Song of Solomon"), ("ISA", "Isaiah"),
    ("JER", "Jeremiah"), ("LAM", "Lamentations"), ("EZK", "Ezekiel"), ("DAN", "Daniel"),
    ("HOS", "Hosea"), ("JOL", "Joel"), ("AMO", "Amos"), ("OBA", "Obadiah"),
    ("JON", "Jonah"), ("MIC", "Micah"), ("NAM", "Nahum"), ("HAB", "Habakkuk"),
    ("ZEP", "Zephaniah"), ("HAG", "Haggai"), ("ZEC", "Zechariah"), ("MAL", "Malachi"),
    ("MAT", "Matthew"), ("MRK", "Mark"), ("LUK", "Luke"), ("JHN", "John"), ("ACT", "Acts"),
    ("ROM", "Romans"), ("1CO", "1 Corinthians"), ("2CO", "2 Corinthians"),
    ("GAL", "Galatians"), ("EPH", "Ephesians"), ("PHP", "Philippians"),
    ("COL", "Colossians"), ("1TH", "1 Thessalonians"), ("2TH", "2 Thessalonians"),
    ("1TI", "1 Timothy"), ("2TI", "2 Timothy"), ("TIT", "Titus"), ("PHM", "Philemon"),
    ("HEB", "Hebrews"), ("JAS", "James"), ("1PE", "1 Peter"), ("2PE", "2 Peter"),
    ("1JN", "1 John"), ("2JN", "2 John"), ("3JN", "3 John"), ("JUD", "Jude"),
    ("REV", "Revelation"),
]
BOOK_NAMES = dict(BOOKS)

SOURCE_ALIASES = {
    "SOL": "SNG",
    "EZE": "EZK",
    "JOE": "JOL",
    "NAH": "NAM",
    "MAR": "MRK",
    "JOH": "JHN",
    "PHI": "PHP",
    "JAM": "JAS",
    "1JO": "1JN",
    "2JO": "2JN",
    "3JO": "3JN",
}

GROUPS = [
    ("ot-1", "Genesis – Deuteronomy", ["GEN", "EXO", "LEV", "NUM", "DEU"]),
    ("ot-2", "Joshua – Esther", ["JOS", "JDG", "RUT", "1SA", "2SA", "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST"]),
    ("ot-3", "Job – Song of Solomon", ["JOB", "PSA", "PRO", "ECC", "SNG"]),
    ("ot-4", "Isaiah – Malachi", ["ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO", "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL"]),
    ("nt-1", "Matthew – Acts", ["MAT", "MRK", "LUK", "JHN", "ACT"]),
    ("nt-2", "Romans – Philemon", ["ROM", "1CO", "2CO", "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM"]),
    ("nt-3", "Hebrews – Revelation", ["HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV"]),
]

MANIFEST_PREFIX = "window.BG_BIBLE_MANIFEST="
GROUP_PREFIX = "window.BG_BIBLE_GROUPS=window.BG_BIBLE_GROUPS||{};"

VPL_LINE = re.compile(r"^([0-9A-Z]{3}) (\d+):(\d+) ?(.*)$")
USFM_ID_BLOCK = re.compile(r"\\id ([0-9A-Z]{3})(.*?)(?=\\id |\Z)", re.S)
USFM_TOKEN = re.compile(r"\\c (?P<c>\d+)|\\v (?P<v>\d+)")
USFM_MARK = re.compile(r"\\[a-zA-Z0-9]+\*?")


def die(msg):
    print(f"fetch-bibles: error: {msg}", file=sys.stderr)
    sys.exit(1)


def fetch_raw(force):
    if os.path.exists(CACHE_PATH) and not force:
        with open(CACHE_PATH, "rb") as f:
            data = f.read()
        print(f"cache hit: {CACHE_PATH} ({len(data)} bytes)")
        return data
    os.makedirs(CACHE_DIR, exist_ok=True)
    last_err = None
    for url in SOURCE_URLS:
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "breakglass-build/1.0 (+https://breakglass.w4sh.net)"},
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = resp.read()
            with open(CACHE_PATH, "wb") as f:
                f.write(data)
            print(f"downloaded: {url} -> {CACHE_PATH} ({len(data)} bytes)")
            return data
        except Exception as exc:
            last_err = exc
            print(f"fetch-bibles: warning: {url} failed: {exc}", file=sys.stderr)
    die(f"all source downloads failed: {last_err}")


def extract_entries(data):
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as zf:
            names = zf.namelist()
    except zipfile.BadZipFile:
        return [("raw-vpl", data.decode("utf-8"))]
    vpl = [n for n in names if n.lower().endswith("_vpl.txt")]
    if vpl:
        with zipfile.ZipFile(io.BytesIO(data)) as zf:
            return [(vpl[0], zf.read(vpl[0]).decode("utf-8"))]
    usfm = [n for n in names if n.lower().endswith(".usfm")]
    if usfm:
        with zipfile.ZipFile(io.BytesIO(data)) as zf:
            return [(n, zf.read(n).decode("utf-8")) for n in usfm]
    die("archive contains neither a *_vpl.txt nor *.usfm payload")


def parse_vpl(name, text):
    verses = {}
    skipped = set()
    prev_key = None
    for lineno, line in enumerate(text.splitlines(), 1):
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        m = VPL_LINE.match(stripped)
        if m:
            raw_code, chap, ver, txt = m.groups()
            bid = SOURCE_ALIASES.get(raw_code, raw_code)
            if bid not in BOOK_NAMES:
                skipped.add(raw_code)
                prev_key = None
                continue
            prev_key = (bid, int(chap), int(ver))
            verses[prev_key] = " ".join(txt.split())
        elif prev_key:
            verses[prev_key] = " ".join((verses[prev_key] + " " + stripped).split())
        else:
            die(f"{name}:{lineno}: unparseable line: {stripped[:80]!r}")
    if skipped:
        print(f"ignored non-canonical book codes: {', '.join(sorted(skipped))}")
    return verses


def parse_usfm(name, text):
    verses = {}
    for block in USFM_ID_BLOCK.finditer(text):
        bid = SOURCE_ALIASES.get(block.group(1), block.group(1))
        if bid not in BOOK_NAMES:
            continue
        body = block.group(2)
        chap = None
        matches = list(USFM_TOKEN.finditer(body))
        for i, m in enumerate(matches):
            if m.group("c") is not None:
                chap = int(m.group("c"))
                continue
            start = m.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(body)
            seg = USFM_MARK.sub(" ", body[start:end])
            if chap is None:
                die(f"{name}: verse before any \\c marker in {bid}")
            verses[(bid, chap, int(m.group("v")))] = " ".join(seg.split())
    return verses


def parse_all(entries):
    verses = {}
    fmt = None
    for name, text in entries:
        if name == "raw-vpl" or "_vpl.txt" in name.lower():
            fmt = "vpl"
            verses.update(parse_vpl(name, text))
        else:
            fmt = "usfm"
            verses.update(parse_usfm(name, text))
    if not verses:
        die("no verses parsed from source archive")
    print(f"parsed {len(verses)} verse records ({fmt} format)")
    return verses


def assemble_books(verses):
    books = []
    for bid, name in BOOKS:
        keys = sorted(k for k in verses if k[0] == bid)
        if not keys:
            continue
        by_chapter = {}
        for b, c, v in keys:
            by_chapter.setdefault(c, []).append(v)
        chapters = []
        for c in sorted(by_chapter):
            nums = by_chapter[c]
            expected = list(range(1, len(nums) + 1))
            if nums != expected:
                bad = [n for n, e in zip(nums, expected) if n != e][:6]
                die(f"{bid} chapter {c}: non-contiguous verse numbering near {bad}")
            chapters.append([verses[(bid, c, n)] for n in nums])
        books.append({"id": bid, "name": name, "chapters": chapters})
    return books


def get_verse(books, bid, c, v):
    for b in books:
        if b["id"] == bid:
            if c > len(b["chapters"]):
                return ""
            chap = b["chapters"][c - 1]
            return chap[v - 1] if v <= len(chap) else ""
    return ""


def validate_canon(books):
    got = {b["id"] for b in books}
    want = set(BOOK_NAMES)
    missing = [b for b in BOOK_NAMES if b not in got]
    extra = sorted(got - want)
    if len(got) != 66 or missing or extra:
        die(
            f"canon incomplete: {len(got)}/66 books; "
            f"missing={missing[:10]} unexpected={extra[:10]}"
        )
    for b in books:
        if not b["chapters"] or any(not ch for ch in b["chapters"]):
            die(f"{b['id']}: empty chapter or book")
    if not get_verse(books, "GEN", 1, 1):
        die("canon check failed: Genesis 1:1 missing or empty")
    if not get_verse(books, "REV", 22, 21):
        die("canon check failed: Revelation 22:21 missing or empty")


def spot_checks(books):
    checks = [
        ("GEN 1", lambda: len(next(b for b in books if b["id"] == "GEN")["chapters"][0]), "==", 31),
        ("JHN 3", lambda: len(next(b for b in books if b["id"] == "JHN")["chapters"][2]), ">=", 30),
        ("REV 22", lambda: len(next(b for b in books if b["id"] == "REV")["chapters"][21]), "==", 21),
    ]
    ok = True
    for label, fn, op, want in checks:
        got_n = fn()
        good = got_n == want if op == "==" else got_n >= want
        print(f"spot-check {label}: {got_n} verses (expected {op} {want}): {'ok' if good else 'FAIL'}")
        ok = ok and good
    if not ok:
        die("verse-count spot checks failed")
    return ok


def js_dumps(obj):
    s = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    return s.replace("</", "<\\/").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def build_payloads(books):
    by_id = {b["id"]: b for b in books}
    manifest_groups = []
    group_files = {}
    for gid, label, ids in GROUPS:
        fname = f"web-{gid}.js"
        manifest_groups.append({
            "id": gid,
            "label": label,
            "file": fname,
            "books": [[i, BOOK_NAMES[i]] for i in ids],
        })
        payload = [
            {"id": i, "name": BOOK_NAMES[i], "chapters": by_id[i]["chapters"]}
            for i in ids
        ]
        group_files[fname] = (
            f'{GROUP_PREFIX}window.BG_BIBLE_GROUPS["{gid}"]={js_dumps(payload)};\n'
        )
    manifest = {
        "translations": [{
            "id": "web",
            "name": "World English Bible",
            "abbr": "WEB",
            "source": "eBible.org",
            "license": "Public domain",
            "groups": manifest_groups,
        }]
    }
    files = {"manifest.js": MANIFEST_PREFIX + js_dumps(manifest) + ";\n"}
    files.update(group_files)
    return files


def write_outputs(files):
    os.makedirs(OUT_DIR, exist_ok=True)
    expected = set(files)
    stale = [p for p in glob.glob(os.path.join(OUT_DIR, "web-*.js"))
             if os.path.basename(p) not in expected]
    for p in stale:
        os.remove(p)
        print(f"removed stale shard: {os.path.basename(p)}")
    written = {}
    for fname, content in files.items():
        path = os.path.join(OUT_DIR, fname)
        new_bytes = content.encode("utf-8")
        old_bytes = open(path, "rb").read() if os.path.exists(path) else None
        if old_bytes != new_bytes:
            tmp = path + ".tmp"
            with open(tmp, "wb") as f:
                f.write(new_bytes)
            os.replace(tmp, path)
        written[fname] = len(new_bytes)
    return written


def verify_written():
    man_path = os.path.join(OUT_DIR, "manifest.js")
    if not os.path.exists(man_path):
        die("verification failed: manifest.js missing")
    man_text = open(man_path, encoding="utf-8").read()
    if not man_text.startswith(MANIFEST_PREFIX) or not man_text.endswith(";\n"):
        die("verification failed: manifest.js wrapper mismatch")
    manifest = json.loads(man_text[len(MANIFEST_PREFIX):-2])
    trans = manifest["translations"]
    if len(trans) != 1 or trans[0]["id"] != "web":
        die("verification failed: unexpected manifest translations")
    declared = trans[0]["groups"]
    if [g["id"] for g in declared] != [g[0] for g in GROUPS]:
        die("verification failed: manifest group ids/order wrong")
    total_books = 0
    total_chapters = 0
    total_verses = 0
    for gspec, (_, _, ids) in zip(declared, GROUPS):
        path = os.path.join(OUT_DIR, gspec["file"])
        if not os.path.exists(path):
            die(f"verification failed: {gspec['file']} missing")
        text = open(path, encoding="utf-8").read()
        head = GROUP_PREFIX + f'window.BG_BIBLE_GROUPS["{gspec["id"]}"]='
        if not text.startswith(head) or not text.endswith(";\n"):
            die(f"verification failed: {gspec['file']} wrapper mismatch")
        payload = json.loads(text[len(head):-2])
        if [b["id"] for b in payload] != ids:
            die(f"verification failed: {gspec['file']} book order wrong")
        for b in payload:
            if b["name"] != BOOK_NAMES[b["id"]]:
                die(f"verification failed: {b['id']} name mismatch")
            if not b["chapters"]:
                die(f"verification failed: {b['id']} has no chapters")
            total_books += 1
            total_chapters += len(b["chapters"])
            total_verses += sum(len(c) for c in b["chapters"])
    if total_books != 66:
        die(f"verification failed: {total_books}/66 books in payloads")
    print(f"json round-trip ok: 66 books, {total_chapters} chapters, {total_verses} verses")
    return True


def node_check(files):
    if shutil.which("node") is None:
        print("node not available; skipping node --check (json round-trip already passed)")
        return True
    ok = True
    for fname in sorted(files):
        path = os.path.join(OUT_DIR, fname)
        res = subprocess.run(["node", "--check", path], capture_output=True, text=True)
        state = "ok" if res.returncode == 0 else "FAIL"
        print(f"node --check {fname}: {state}")
        if res.returncode != 0:
            ok = False
            print(res.stderr.strip(), file=sys.stderr)
    return ok


def main():
    ap = argparse.ArgumentParser(description="Fetch World English Bible and emit offline JS shards")
    ap.add_argument("--check", action="store_true", help="verify existing assets/bible outputs only")
    ap.add_argument("--refresh", action="store_true", help="force re-download even if cached")
    args = ap.parse_args()

    if args.check:
        verify_written()
        names = ["manifest.js"] + [f"web-{g[0]}.js" for g in GROUPS]
        node_check({n: b"" for n in names})
        return

    raw = fetch_raw(args.refresh)
    entries = extract_entries(raw)
    verses = parse_all(entries)
    books = assemble_books(verses)
    validate_canon(books)
    spot_checks(books)
    files = build_payloads(books)
    sizes = write_outputs(files)
    total = 0
    for fname in sorted(sizes):
        print(f"wrote assets/bible/{fname}: {sizes[fname]} bytes")
        total += sizes[fname]
    print(f"total assets/bible: {total} bytes ({total / 1024 / 1024:.2f} MiB)")
    if not verify_written():
        die("post-write verification failed")
    node_check(files)


if __name__ == "__main__":
    main()
