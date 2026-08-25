# Vendored: kiwix-js

- **Version:** 4.4.0 (stable release tag `4.4.0`, published 2026-08-22)
- **Release URL:** https://github.com/kiwix/kiwix-js/releases/tag/4.4.0
- **Source archive:** https://api.github.com/repos/kiwix/kiwix-js/zipball/4.4.0
  (downloaded to `tools/cache/kiwix-js/kiwix-js-4.4.0.zip`; tools/cache is not distributed)
- **License:** GPL-3.0-or-later. Verbatim license text ships in this directory as
  `LICENSE-GPLv3.txt`. Recorded in the project licensing register (LICENSES.md:
  "kiwix-js (GPL-3.0)").

## Exact license statement captured from the vendored sources

Every vendored `.js` file carries this header (example from
`www/js/lib/zimArchiveLoader.js`):

```
Copyright 2015-2024 Mossroy and contributors
Licence GPL v3:

This file is part of Kiwix.

Kiwix is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public Licence as published by
the Free Software Foundation, either version 3 of the Licence, or
(at your option) any later version.

Kiwix is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public Licence for more details.

You should have received a copy of the GNU General Public Licence
along with Kiwix (file LICENSE-GPLv3.txt).  If not, see <http://www.gnu.org/licenses/>
```

The full GNU General Public License v3 text is reproduced verbatim in
`LICENSE-GPLv3.txt` in this directory. Because kiwix-js is GPL-3.0 and BreakGlass
redistributes unmodified copies of these files alongside its own code, the
combined work is effectively GPL-3.0 for the parts that link against this
runtime; the wiki reader page that drives it is part of that combined work.
This is documented here rather than silently mixed.

## What was vendored (and why)

Only the engine layer of kiwix-js is vendored — not its application UI
(`app.js`, `init.js`, Bootstrap CSS, i18n resources, library UI). The BreakGlass
wiki page (`wiki/index.html`) contains its own vanilla-JS driver that imports
the ES modules below and implements article rendering, search UI and mode
selection itself, following the patterns used by kiwix-js's own app layer.

```
assets/vendor/kiwix-js/
├── VENDOR-NOTES.md          this file
├── LICENSE-GPLv3.txt        verbatim GPLv3 text (35,147 bytes)
├── service-worker.js        ServiceWorker entry point, v4.4.0 (37,496 B)
├── replayWorker.js          wabac-style replay worker imported by the SW at
│                            startup; REQUIRED for zimit-type archives such as
│                            iFixit in server mode (2,525,095 B)
└── www/js/lib/
    ├── zimArchive.js        archive model + title/full-text search (34,512 B)
    ├── zimArchiveLoader.js  loadArchiveFromFiles entry point (3,572 B)
    ├── zimDirEntry.js       directory entries (3,365 B)
    ├── zimfile.js           ZIM format reader (23,792 B)
    ├── util.js              helpers incl. readFileSlice (15,240 B)
    ├── utf8.js              UTF-8 decoding (3,195 B)
    ├── translateUI.js       i18n stubs used by error paths (3,879 B)
    ├── settingsStore.js     storage abstraction (14,677 B)
    ├── uiUtil.js            transitive dependency only (89,635 B)
    ├── filecache.js         chunk cache over range reads (7,486 B)
    ├── xzdec_wrapper.js     XZ decompressor selector (7,059 B)
    ├── xzdec-wasm.wasm      XZ WASM binary (14,745 B)
    ├── xzdec-wasm.js        XZ WASM loader (4,800 B)
    ├── xzdec-asm.js         XZ asm.js fallback, used on file:// where fetch()
    │                        of .wasm is blocked by browsers (41,480 B)
    ├── zstddec_wrapper.js   ZSTD decompressor selector (13,805 B)
    ├── zstddec-wasm.wasm    ZSTD WASM binary (46,776 B)
    ├── zstddec-wasm.js      ZSTD WASM loader (6,709 B)
    ├── zstddec-asm.js       ZSTD asm.js fallback (117,469 B)
    ├── libzim-wasm.js       libzim full-text-search Web Worker (136,633 B)
    └── libzim-wasm.wasm     libzim search WASM binary (2,184,660 B)
```

Total ≈ 5.6 MB including the generated bundle below. No single file exceeds
5 MB. The two largest files are `replayWorker.js` (≈ 2.53 MB) and
`libzim-wasm.wasm` (≈ 2.18 MB).

## Generated artifact: engine.bundle.js

`engine.bundle.js` (391,156 bytes) is a classic-script bundle of the 16 ES
modules above, generated at vendoring time so the reader works on `file://`
in Chromium (which blocks ES-module imports between `file:` origins for CORS
reasons, but loads classic scripts freely — same philosophy as the field
guide's "local data ships as `<script src>`" rule).

Generation: each module body is embedded verbatim (license headers intact)
inside a tiny AMD-style registry; `import X from './y.js'` lines become factory
parameters, the single trailing `export default` becomes `return`, and
`import.meta.url` inside the four emscripten loaders becomes a `__LIB_URL`
string pointing at this directory's `www/js/lib/`. No other transformation is
applied. SHA-256 of every source file embedded is recorded in
`tools/docs`-style provenance below:

```
util.js  sha256=2a9b8267247b52b23637eeea7199a73e815bbd319b3301beae3f7eb91a47af71
utf8.js  sha256=f5f55d776d530e79587f3ba2f59f42bd21e556ea910232926bcb854edbe02a2d
translateUI.js  sha256=3f8a72001d4dee4044278437d00c98efe04c38a16c8800446675ec15c97386ac
settingsStore.js  sha256=3015bd8f85aabe903e84a9c6a22a4660a0d4c7267e8826dad555443f5ee93512
uiUtil.js  sha256=73b48b49d3dd108e0a9d855ab7e27173be07e84a87638a18a286e246469bcefa
zimDirEntry.js  sha256=6a6af21345fdc7dac22c4645277515d525004ab4a79405d3013ecad480c76992
filecache.js  sha256=79439c069b502578faaa660d5cb64e9422e03232653189f72ebbe9cca87715f2
xzdec-asm.js  sha256=6b583a00cbb27209980b6000b3ea783a6563347e1122bcf191c46bf6e2968d39
xzdec-wasm.js  sha256=8974521253567407ed9ee188eab871a1b718ca8bad5b53c9e63ec14d6d880352
xzdec_wrapper.js  sha256=41bc5bd6fb1d493541bfcc96a3ec18bbe4e622f57c1c1407bcbbebfb63a0e6b4
zstddec-asm.js  sha256=caffb3a567a58db8fba4f594bb3c4e5b70b88afd7f9401f4748d6dcd241954df
zstddec-wasm.js  sha256=e04a77a63678a5dbb645da20a6fdd6f63ea94a2b1e7cdec8d11ce77583f20b59
zstddec_wrapper.js  sha256=a60778c0796f590eece95102fbc9cf100793af6e7faba1cc74d3387c278623cb
zimfile.js  sha256=3e602e758d96c4e3b0f16b0e2a6b4de4ae851bebd7527ec9f698fc78b75aef3a
zimArchive.js  sha256=ed13384944a3f598e68aec392b8114e1f119a6be38c00143c037542765c82736
zimArchiveLoader.js  sha256=1f16590f49a20643239fb516b3d944edbb387d5f6be245d9efb2057e036dbae1
```

(Exact strings also reproducible via `sha256sum www/js/lib/*.js`; the bundle
generator itself was ephemeral build tooling, not shipped.)

Not vendored (intentionally): `libzim-asm*.js` / `libzim-wasm.dev.*`
(debug/unminified variants, up to 29 MB each), `webpHeroBundle` (WebP polyfill
for legacy browsers; all modern kit targets decode WebP natively), `popovers`,
`kiwixLibrary`, `cache.js`, `abstractFilesystemAccess.js` (not in the import
graph of the minimal engine), and the whole application shell (`app.js`,
`init.js`, HTML/CSS/i18n/images).

## Runtime modes

**Server mode (http/https).** `wiki/index.html` registers
`assets/vendor/kiwix-js/service-worker.js`. The worker's default scope is the
vendored directory (`/assets/vendor/kiwix-js/`), which is exactly where article
URLs are routed: `<vendor-dir>/<zim-filename>/<namespace>/<path>`. The SW
intercepts those requests under its scope (no `Service-Worker-Allowed` header
needed) and asks the open page over a MessageChannel (`askForContent` /
`giveContent`) to read bytes out of the user-selected File handle. Full-fidelity
rendering, active content and zimit archives (iFixit, via ReplayWorker) work in
this mode. Full-text search runs in a dedicated Web Worker
(`js/lib/libzim-wasm.js` + `libzim-wasm.wasm`); the worker script resolves its
WASM relative to itself, so both files must stay side by side.

**Portable mode (file://).** Browsers block service-worker registration,
`fetch()` of local files and Worker creation from `file:` origins. The page
falls back automatically to restricted/content-injection rendering: articles are
read through the File handle's range-slicing API and injected into a same-origin
sandboxed iframe with URLs rewritten to blob: URLs fetched from inside the ZIM.
XZ/ZSTD decompression falls back from WASM to the bundled asm.js builds because
emscripten's `fetch()` of the `.wasm` binaries cannot run on `file:`. Full-text
search is NOT available in portable mode (the libzim worker cannot be created);
the page degrades honestly to title search with a dismissible notice.

## Range-slicing verification

Random access never loads the archive into memory: `ZIMFile._readSlice()` →
`FileCache.read()` → `util.readFileSlice(file, start, end)` → `Blob.slice()`
byte-range reads on the picked `File`, with decompressor streams consuming
fixed-size chunks (default 5 KB). Verified in `zimfile.js` lines 137–160 and
`util.readFileSlice`. This is what will allow the ~100 GB English Wikipedia
maxi ZIM to be read later without loading it into memory.

## Manual test plan (engineer)

Test machine needs the two staged ZIMs reachable at `/mnt/tb01/breakglass/media/zims/`
(symlinks into `../vault/`). No archive auto-opens by design; every flow starts
from a picker or drag-drop.

**A. Served mode (http), WikiMed**
1. Serve repo root: `python3 -m http.server 8908` → open `http://localhost:8908/wiki/index.html`.
2. Expect mode badge `Server mode · service worker`, kit list shows both packs.
3. DevTools console: no errors on load without an archive.
4. Click **Open WikiMed…**, choose `wikipedia_en_medicine_maxi_2026-04.zim` from
   `/mnt/tb01/breakglass/media/zims/`. Reader appears; Main Page = Open Textbook of Medicine.
5. Type `first aid` in the archive search box → live title results; press Enter →
   full-text results with snippets appear (badge shows `Full-text search ready`).
6. Click article links inside the page → navigation stays inside the ZIM;
   images/CSS load from the archive; Back returns through visited articles.
7. Network tab: confirm no request leaves localhost.

**B. Served mode, iFixit swap**
1. With WikiMed open, click **Open iFixit…** and pick `ifixit_en_all_2025-12.zim`.
2. Reader swaps to iFixit Main Page; search `repair`; open a guide; verify step
   images render (zimit-type archive exercises ReplayWorker).

**C. Portable mode (file:// double-click)**
1. Double-click `wiki/index.html` in a file manager (Chrome and Firefox).
2. Mode badge must read `Portable mode · file://` (warn styling); no broken UI.
3. Open WikiMed via drop zone. Articles render with images; internal links work.
4. Search: title matches appear while typing; pressing Enter shows the one-time
   dismissible notice that full-text needs server mode; after dismissal it stays hidden.
5. Console may show the expected WASM→asm.js fallback warning; nothing fatal.
6. Repeat A5–A6 expectations minus snippets.

**D. Failure paths**
1. Pick a non-ZIM file (e.g. a PDF renamed or any random file) → error card with retry.
2. Rename/remove `assets/zims-manifest.js` → generic "pick any ZIM" empty state.
3. Load page with `media/zims/` absent → page fine until a file is chosen.

## Local modifications

None. All vendored files are byte-identical to the release archive. Integration
glue lives entirely in `wiki/index.html` (a global `params` object the library
expects, a URL-rewriting wrapper around `window.Worker` so the document-relative
`new Worker('js/lib/libzim-*.js')` call resolves to the vendored path, and
hidden stub elements with IDs that `uiUtil.js` touches when imported outside
the kiwix-js app shell).
