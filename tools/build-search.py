from __future__ import annotations

import argparse
import html
import json
import os
import re
import shutil
import sys
import unicodedata
from collections import Counter, defaultdict
from html.parser import HTMLParser
from pathlib import Path

STOPWORDS: frozenset[str] = frozenset(
    {
        "a", "an", "and", "the", "of", "to", "in", "is", "it", "on", "for",
        "with", "as", "at", "by", "from", "or", "this", "that", "these",
        "those", "be", "are", "was", "were", "will", "would", "can", "could",
        "should", "do", "does", "did", "not", "but", "if", "then", "than",
        "so", "such", "into", "about", "your", "you", "we", "our", "they",
        "their", "its", "has", "have", "had", "i",
    }
)

EXCLUDED_SEGMENTS: tuple[str, ...] = ("/tools/", "/docs/", "/assets/vendor/")
EXCLUDED_FILES: frozenset[str] = frozenset({"search.html", "a-z.html"})
NON_ALNUM: re.Pattern[str] = re.compile(r"[^a-z0-9]+")
TEXT_LIMIT: int = 1500

SHELL_HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>A\u2013Z Index \u2014 BreakGlass</title>
<script>(function(){try{var t=localStorage.getItem("bg.theme");if(!t){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();</script>
<link rel="stylesheet" href="assets/vendor/fontawesome/css/all.min.css">
<link rel="stylesheet" href="assets/theme.css">
<script src="assets/shell.js" defer></script>
</head>
<body>
<header class="topbar">
<a class="brand" href="index.html"><i class="fa-solid fa-box-open"></i> BREAKGLASS</a>
<form class="searchbar" action="search.html" role="search"><i class="fa-solid fa-magnifying-glass"></i><input type="search" name="q" placeholder="Search everything\u2026" aria-label="Search"></form>
<select class="phase-select" aria-label="Situation phase"></select>
<button class="btn btn-ghost" type="button" data-action="toggle-theme" aria-pressed="false" title="Toggle light/dark"><i class="fa-solid fa-circle-half-stroke"></i></button>
</header>
<main>
<h1>A\u2013Z Index</h1>
"""

SHELL_FOOT = """</main>
<footer class="status-line"><span data-media-state>Media pack: checking\u2026</span><span>BreakGlass \u00a9 <span data-year></span></span></footer>
</body>
</html>
"""


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title_parts: list[str] = []
        self.text_parts: list[str] = []
        self._skip_depth: int = 0
        self._in_title: bool = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in ("script", "style"):
            self._skip_depth += 1
        elif tag == "title":
            self._in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False
        elif tag in ("script", "style") and self._skip_depth:
            self._skip_depth -= 1

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title_parts.append(data)
        elif not self._skip_depth:
            self.text_parts.append(data)


def tokenize(text: str) -> list[str]:
    lowered = text.lower()
    decomposed = unicodedata.normalize("NFKD", lowered)
    stripped = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    spaced = NON_ALNUM.sub(" ", stripped)
    return [tok for tok in spaced.split() if len(tok) >= 2 and tok not in STOPWORDS]


def collapse(parts: list[str]) -> str:
    return " ".join(" ".join(parts).split())


def is_excluded(rel_posix: str) -> bool:
    if rel_posix in EXCLUDED_FILES:
        return True
    prefixed = "/" + rel_posix
    return any(seg in prefixed for seg in EXCLUDED_SEGMENTS)


def find_html(root: Path) -> list[Path]:
    found: list[Path] = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if not d.startswith("."))
        for name in sorted(filenames):
            if name.lower().endswith(".html"):
                found.append(Path(dirpath) / name)
    return sorted(found)


def fallback_title(rel: Path) -> str:
    if rel.name == "index.html" and rel.parent != Path("."):
        return rel.parent.name
    return rel.stem


def parse_page(path: Path, root: Path) -> dict[str, str]:
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8", errors="replace"))
    rel = path.relative_to(root)
    title = collapse(parser.title_parts) or fallback_title(rel)
    text = collapse(parser.text_parts)
    return {"t": title, "u": rel.as_posix(), "x": text[:TEXT_LIMIT]}


def collect_docs(root: Path) -> list[dict[str, str]]:
    docs: list[dict[str, str]] = []
    for path in find_html(root):
        rel_posix = path.relative_to(root).as_posix()
        if is_excluded(rel_posix):
            continue
        docs.append(parse_page(path, root))
    docs.sort(key=lambda d: d["u"])
    return docs


def build_index(docs: list[dict[str, str]]) -> dict[str, dict[str, list[list[object]]]]:
    buckets: dict[str, dict[str, list[list[object]]]] = defaultdict(dict)
    term_docs: dict[str, Counter[str]] = defaultdict(Counter)
    for i, doc in enumerate(docs, start=1):
        doc_id = f"d{i:02d}"
        counts: Counter[str] = Counter()
        counts.update(tokenize(doc["t"]))
        counts.update(tokenize(doc["t"]))
        counts.update(tokenize(doc["x"]))
        for term, freq in counts.items():
            term_docs[term][doc_id] += freq
    for term in sorted(term_docs):
        postings = [[doc_id, tf] for doc_id, tf in sorted(term_docs[term].items())]
        buckets[term[0]][term] = postings
    return dict(buckets)


def write_js(path: Path, prefix: str, payload: object) -> None:
    body = json.dumps(payload, separators=(",", ":"), ensure_ascii=True)
    path.write_text(prefix + body + ";\n", encoding="utf-8")


def write_search_assets(search_dir: Path, docs: list[dict[str, str]], buckets: dict[str, dict[str, list[list[object]]]]) -> int:
    docs_obj = {f"d{i:02d}": doc for i, doc in enumerate(docs, start=1)}
    write_js(search_dir / "docs.js", "window.BG_SEARCH_DOCS=", docs_obj)
    keys = sorted(buckets)
    write_js(search_dir / "manifest.js", "window.BG_SEARCH_KEYS=", keys)
    for key in keys:
        prefix = 'window.BG_SEARCH_BUCKETS=window.BG_SEARCH_BUCKETS||{};window.BG_SEARCH_BUCKETS["' + key + '"]='
        write_js(search_dir / f"bucket-{key}.js", prefix, buckets[key])
    return 2 + len(keys)


def letter_key(title: str) -> str:
    first = title[:1].lower()
    return first if "a" <= first <= "z" else "#"


def write_az_index(root: Path, docs: list[dict[str, str]]) -> None:
    groups: dict[str, list[dict[str, str]]] = defaultdict(list)
    for doc in docs:
        groups[letter_key(doc["t"])].append(doc)
    order = ["#"] + [chr(c) for c in range(ord("a"), ord("z") + 1)]
    lines: list[str] = [SHELL_HEAD]
    for key in order:
        members = sorted(groups.get(key, []), key=lambda d: (d["t"].lower(), d["u"]))
        if not members:
            continue
        lines.append(f"<section>\n<h2>{html.escape(key)}</h2>\n<ul>\n")
        for doc in members:
            lines.append(
                f'<li><a href="{html.escape(doc["u"], quote=True)}">{html.escape(doc["t"])}</a></li>\n'
            )
        lines.append("</ul>\n</section>\n")
    lines.append(SHELL_FOOT)
    (root / "a-z.html").write_text("".join(lines), encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", type=Path, default=Path(__file__).resolve().parent.parent)
    args = ap.parse_args(argv)
    root: Path = args.root.resolve()
    search_dir = root / "assets" / "search"
    if search_dir.exists():
        shutil.rmtree(search_dir)
    search_dir.mkdir(parents=True)

    docs = collect_docs(root)
    if not docs:
        print("error: zero HTML docs found under " + str(root), file=sys.stderr)
        return 1

    buckets = build_index(docs)
    file_count = write_search_assets(search_dir, docs, buckets)
    write_az_index(root, docs)

    total_bytes = sum(p.stat().st_size for p in sorted(search_dir.iterdir()))
    unique_terms = sum(len(b) for b in buckets.values())
    print(f"docs indexed: {len(docs)}")
    print(f"unique terms: {unique_terms}")
    print(f"shards: {len(buckets)} bucket files ({file_count} files total)")
    print(f"total bytes: {total_bytes}")
    print(f"a-z index: {str((root / 'a-z.html').relative_to(root))}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
