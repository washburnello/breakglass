from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

BASE_URL = "https://www.gutenberg.org/cache/epub/{gid}/pg{gid}.txt"
USER_AGENT = "BreakGlass-book-builder/1.0 (offline survival library; public domain sources)"
START_MARKER = "*** START OF THE PROJECT GUTENBERG EBOOK"
END_MARKER = "*** END OF THE PROJECT GUTENBERG EBOOK"
MAX_TOTAL_BYTES = 10 * 1024 * 1024
STRAY_CLOSE_TAG = re.compile(r"^</[a-zA-Z][a-zA-Z0-9]*>\s*$")

BOOKS: list[dict[str, object]] = [
    {
        "slug": "aesops-fables",
        "title": "Aesop's Fables",
        "author": "Aesop",
        "gutenbergId": 21,
        "expectTitle": ["fables"],
    },
    {
        "slug": "boy-scouts-handbook",
        "title": "Boy Scouts Handbook",
        "author": "Boy Scouts of America",
        "gutenbergId": 29558,
        "expectTitle": ["boy scouts handbook"],
    },
    {
        "slug": "call-of-the-wild",
        "title": "Call of the Wild",
        "author": "Jack London",
        "gutenbergId": 215,
        "expectTitle": ["call of the wild"],
    },
    {
        "slug": "culpepers-complete-herbal",
        "title": "Culpeper's Complete Herbal",
        "author": "Nicholas Culpeper",
        "gutenbergId": 49513,
        "expectTitle": ["complete herbal"],
    },
    {
        "slug": "meditations",
        "title": "Meditations",
        "author": "Marcus Aurelius",
        "gutenbergId": 2680,
        "expectTitle": ["meditations"],
    },
    {
        "slug": "art-of-war",
        "title": "The Art of War",
        "author": "Sun Tzu",
        "gutenbergId": 132,
        "expectTitle": ["art of war"],
    },
    {
        "slug": "woodcraft-and-camping",
        "title": "Woodcraft and Camping",
        "author": "George W. Sears",
        "gutenbergId": 34607,
        "expectTitle": ["woodcraft and camping"],
    },
]


def cache_path(cache_dir: Path, gid: int) -> Path:
    return cache_dir / f"pg{gid}.txt"


def fetch_raw(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read().decode("utf-8")


def normalize(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n")


def load_text(cache_dir: Path, gid: int, polite: bool) -> str:
    path = cache_path(cache_dir, gid)
    if path.exists():
        return path.read_text(encoding="utf-8", newline="")
    time.sleep(1.0 if polite else 0.0)
    text = normalize(fetch_raw(BASE_URL.format(gid=gid)))
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(text)
    return text


def header_field(text: str, field: str) -> str:
    m = re.search(rf"^{field}:\s*(.+)$", text, re.MULTILINE)
    return m.group(1).strip() if m else ""


def extract_body(text: str) -> str:
    lines = text.split("\n")
    start = end = None
    for i, line in enumerate(lines):
        if start is None and line.startswith(START_MARKER):
            start = i
        elif line.startswith(END_MARKER):
            end = i
    if start is None or end is None or end <= start:
        raise ValueError("missing START/END markers")
    body = "\n".join(lines[start + 1 : end])
    body = body.lstrip("\r\n")
    while True:
        head_lines = body.split("\n", 1)
        if head_lines and STRAY_CLOSE_TAG.match(head_lines[0]):
            body = head_lines[1] if len(head_lines) > 1 else ""
            body = body.lstrip("\r\n")
        else:
            break
    return body.rstrip()


HEADING_LINE = re.compile(
    r"^(CHAPTER|BOOK|CANTO|PART|ACT|SCENE|STAVE|PROLOGUE|EPILOGUE|FABLE)\b", re.IGNORECASE
)


def paginate(body: str, target: int = 2800) -> str:
    if "\f" in body:
        return body
    pages: list[str] = []
    current: list[str] = []
    size = 0
    for para in re.split(r"\n{2,}", body):
        para = para.strip()
        if not para:
            continue
        heading = len(para) < 100 and bool(HEADING_LINE.match(para))
        if current and (heading or size + len(para) > target):
            pages.append("\n\n".join(current))
            current, size = [], 0
        current.append(para)
        size += len(para)
    if current:
        pages.append("\n\n".join(current))
    return "\f".join(pages)


def build_shard(book: dict[str, object], body: str) -> str:
    payload = json.dumps(
        {
            "title": book["title"],
            "author": book["author"],
            "gutenbergId": book["gutenbergId"],
            "body": body,
        },
        ensure_ascii=False,
        separators=(",", ":"),
    )
    return (
        'window.BG_BOOKS=window.BG_BOOKS||{};window.BG_BOOKS["'
        + str(book["slug"])
        + '"]='
        + payload
        + ";\n"
    )


def build_manifest(books: list[dict[str, object]]) -> str:
    entries = [
        {
            "slug": b["slug"],
            "title": b["title"],
            "author": b["author"],
            "gutenbergId": b["gutenbergId"],
            "file": str(b["slug"]) + ".js",
        }
        for b in sorted(books, key=lambda b: str(b["title"]).lower())
    ]
    return "window.BG_BOOKS_MANIFEST=" + json.dumps(
        entries, ensure_ascii=False, separators=(",", ":")
    ) + ";\n"


def check_shards(out_dir: Path, books: list[dict[str, object]]) -> int:
    ok = True
    for book in sorted(books, key=lambda b: str(b["title"]).lower()):
        slug = str(book["slug"])
        text = (out_dir / f"{slug}.js").read_text(encoding="utf-8")
        prefix = 'window.BG_BOOKS=window.BG_BOOKS||{};window.BG_BOOKS["' + slug + '"]='
        if not text.startswith(prefix) or not text.endswith(";\n"):
            print(f"CHECK FAIL {slug}: wrapper mismatch", file=sys.stderr)
            ok = False
            continue
        try:
            data = json.loads(text[len(prefix):-2])
        except json.JSONDecodeError as e:
            print(f"CHECK FAIL {slug}: {e}", file=sys.stderr)
            ok = False
            continue
        keys = ["title", "author", "gutenbergId", "body"]
        valid = list(data.keys()) == keys and data["gutenbergId"] == book["gutenbergId"]
        formfeeds = data["body"].count("\f")
        status = "ok" if valid else "BAD"
        print(f"check {slug}: {status} chars={len(data['body'])} ff={formfeeds}")
        if not valid:
            ok = False
    man = (out_dir / "manifest.js").read_text(encoding="utf-8")
    mprefix = "window.BG_BOOKS_MANIFEST="
    entries = json.loads(man[len(mprefix):-2])
    slugs = [e["slug"] for e in entries]
    expected = [str(b["slug"]) for b in sorted(books, key=lambda b: str(b["title"]).lower())]
    if slugs != expected or not man.endswith(";\n"):
        print(f"CHECK FAIL manifest: {slugs}", file=sys.stderr)
        ok = False
    else:
        print(f"check manifest: ok entries={len(entries)}")
    return 0 if ok else 1


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", type=Path, default=Path(__file__).resolve().parent.parent)
    ap.add_argument("--no-sleep", action="store_true")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args(argv)
    root: Path = args.root.resolve()
    out_dir = root / "assets" / "books"
    cache_dir = root / "tools" / "cache"

    if args.check:
        return check_shards(out_dir, BOOKS)

    cache_dir.mkdir(parents=True, exist_ok=True)
    out_dir.mkdir(parents=True, exist_ok=True)

    built: list[dict[str, object]] = []
    failures = 0
    total_bytes = 0
    no_ff: list[str] = []

    for book in BOOKS:
        slug = str(book["slug"])
        gid = int(book["gutenbergId"])
        try:
            text = load_text(cache_dir, gid, polite=not args.no_sleep)
        except Exception as e:
            print(f"FAIL {slug}: download error: {e}", file=sys.stderr)
            failures += 1
            continue
        title_line = header_field(text, "Title").lower()
        missing = [kw for kw in book["expectTitle"] if kw not in title_line]
        if missing:
            print(
                f"FAIL {slug}: pg{gid} title '{header_field(text, 'Title')}' "
                f"missing expected {'; '.join(missing)}",
                file=sys.stderr,
            )
            failures += 1
            continue
        try:
            body = paginate(extract_body(text))
        except ValueError as e:
            print(f"FAIL {slug}: {e}", file=sys.stderr)
            failures += 1
            continue
        low_head = body[:200].lower()
        if "project gutenberg" in low_head:
            print(f"FAIL {slug}: boilerplate leaked into body head", file=sys.stderr)
            failures += 1
            continue
        shard = build_shard(book, body)
        shard_path = out_dir / f"{slug}.js"
        shard_path.write_text(shard, encoding="utf-8")
        size = shard_path.stat().st_size
        total_bytes += size
        ff_count = body.count("\f")
        if ff_count == 0:
            no_ff.append(slug)
        built.append(book)
        print(
            f"built {slug}: chars={len(body)} shard={size}B gid={gid} ff={ff_count}"
        )

    if len(built) != len(BOOKS):
        print(f"error: {len(BOOKS) - len(built)} title(s) missing/unverified", file=sys.stderr)
        return 1

    manifest_path = out_dir / "manifest.js"
    manifest_path.write_text(build_manifest(built), encoding="utf-8")
    total_bytes += manifest_path.stat().st_size

    print(f"manifest: {manifest_path.relative_to(root)} ({manifest_path.stat().st_size}B)")
    print(f"books: {len(built)}")
    print(f"total bytes: {total_bytes}")
    if no_ff:
        print(f"no form-feed separators (short works): {', '.join(no_ff)}")
    if total_bytes > MAX_TOTAL_BYTES:
        print(f"error: total {total_bytes}B exceeds budget {MAX_TOTAL_BYTES}B", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
