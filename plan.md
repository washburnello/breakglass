# BreakGlass — Master Plan

**Repo:** https://github.com/washburnello/breakglass (private, currently empty)
**Live URL:** https://breakglass.w4sh.net
**Status:** Planning complete. Implementation not started.

---

## Mission

A self-contained offline survival-knowledge website. Double-clickable from any OS
with zero installation, zip-and-shareable to USB, and served live on the web.
Knowledge that survives losing everything else.

## The two use cases

1. **Portable:** copy folder to a USB drive → any computer → double-click
   `index.html` → browse everything. No install, no runtime, no internet.
2. **Hosted:** copy the same folder to any static web server (or run the bundled
   micro-server) → access over the network with expanded capabilities.

These do not conflict: **HTTP mode is a strict superset of `file://` mode.**
Every feature either works everywhere or degrades to a labeled badge — never a
broken button. Mode is detected at runtime via `location.protocol`.

---

## Canonical landing page — 19 tiles, 5 groups

| Group | Tiles |
|---|---|
| **SURVIVAL** (5) | Emergency Hub · Medical & Health · How-To & Skills · Food & Water · Comms & Radio |
| **KNOWLEDGE** (6) | Offline Wiki · Book Library · Faith & Bible · Education (Schoolhouse) · Ask-the-Kit · ID Browser |
| **REBUILD** (3) | Town Builder · Maps & Navigation · Pets & Animals |
| **TOOLS** (4) | Quick Reference · Pocket Apps · Calculators · Kit Admin |
| **MORALE** (1) | Arcade |

Plus: global search bar in header, media-pack status line, phase selector.
`EMERGENCY.html` duplicates the Emergency Hub at site root (zero navigation to
reach life-safety info).

---

## Architecture

```
breakglass/
├── index.html              # tile landing page (entry point)
├── EMERGENCY.html          # emergency hub mirror
├── styleguide.html         # living design-system reference (ships in-kit)
├── assets/                 # css/js framework — ZERO external CDNs, ever
│   ├── theme.css           # tokens + components
│   ├── shell.js            # nav, mode/phase detection, media probe
│   └── vendor/             # Font Awesome webfonts, Inter, kiwix-js, Leaflet…
├── search.html  a-z.html
├── emergency/ medical/ howto/ food/ pets/ comms/ maps/ wiki/ books/
├── faith/ education/ town/ ask/ id/ reference/ apps/ calc/ arcade/ admin/
├── media/                  # GITIGNORED companion folder (images/diagrams/roms/zims…)
│   └── MANIFEST.md         # expected files + fetch instructions
├── server/                 # bundled micro-server binaries + START-SERVER wrappers
├── tools/                  # fetchers, index builders, pack scripts (NOT distributed)
├── docs/                   # maintainer deep-dives (NOT distributed)
├── plan.md  field-guide.md  LICENSES.md  README.md
```

### file:// compatibility rules (non-negotiable)

- No `fetch()`/XHR against local files — all local data ships as `<script src>` JS
  (search shards, Bible texts, book passages, GeoJSON).
- Images/media use `onerror` placeholders when `media/` is absent.
- Apps persist via localStorage autosave PLUS explicit save/load-to-file buttons
  (localStorage is best-effort across browsers; files are source of truth).
- WASM (emulator cores, libzim search) arrives base64-in-script where needed;
  otherwise gated behind server mode with honest badges.

### Capability matrix

| Capability | file:// | http(s):// |
|---|---|---|
| All reading content, search, Bible, books, cards, calculators, apps | ✅ | ✅ |
| NES · GB/GBC · PICO-8/Picotron HTML exports | ✅ | ✅ |
| SNES/GBA (WASM cores need fetch) | ❌ badge | ✅ |
| Full-size ZIM libraries (Wikipedia maxi etc.) | guide-page → Kiwix reader app | ✅ kiwix-serve |
| Embedded wiki reader (kiwix-js, drag-and-drop ZIM) | ✅ | ✅ |
| Full-corpus Ask-the-Kit retrieval | pocket-tier corpus | ✅ complete |

---

## Design system v1 — “Warm & Welcoming”

Full spec lives in `docs/style-guide.md` (to be authored in Phase 2) and
demonstrated in `styleguide.html`.

- **Tokens only.** Every color/spacing/radius/shadow/duration is a CSS custom
  property. No hard-coded values anywhere.
- **Palettes:** warm paper neutrals + amber accent (light) / warm charcoal +
  brightened amber (dark). Designed together, WCAG AA in both.
  `[data-theme]` attribute; defaults to OS preference; toggle persisted.
- **Type:** Inter bundled (latin subsets 400/600/700, ~100KB, OFL) with system
  fallback stack. Modular scale ~1.25.
- **Icons:** Font Awesome Free, self-hosted webfont build (~350–450KB, cached;
  CDN would die offline). Icon-convention table in style guide.
- **Motion:** three duration tokens + two easings only. Tile hover lift,
  press-scale, fade-rise entrances, progress fills. Pure CSS. Fully disabled
  under `prefers-reduced-motion`.
- **Component library:** tiles/cards, buttons, inputs, tables, severity callouts
  (danger/warning/caution/info), checklists, quiz blocks, mastery-grid cells,
  badges (incl. “needs network mode”), breadcrumbs, topbar/nav, search box,
  modals, tabs, accordions, code blocks, print styles.
- **Hard rules:** site fully functional without JS · new components land in
  `styleguide.html` before page use · no external requests ever · per-page
  CSS/JS budgets · every content page ships print styles · voice = plain
  language, calm authority, zero hype.

---

## Phases system (situation modes)

Taxonomy in JSON (editable without code changes):

| Phase | Focus |
|---|---|
| **Everyday** *(default)* | balanced site, no urgency framing |
| **Survive** | water, first aid, shelter, immediate food, headcount |
| **Stabilize** | sanitation, comms, power, food storage, security |
| **Rebuild** | infrastructure, town systems, education restart |
| **Thrive** | farming, seasonal prep, community, morale |

Mechanics: every page’s front-matter carries phase tags + priority weights.
Header selector re-orders landing tiles, elevates tagged content, dims
(never hides) irrelevant sections, swaps a phase banner with objective
checklists, boosts phase-relevant search results. `EMERGENCY.html` force-pins
Survive regardless of stored phase. Ask-the-Kit receives current phase as
context. Phase-tagging conventions are part of the style guide authoring rules.

---

## Content sections & sources

Licensing registry maintained in `LICENSES.md`. Legally clean sources only;
copyrighted curricula (e.g. Easy Peasy — All Rights Reserved) are never
bundled. Survipedia is structural inspiration only (CC BY-NC-ND, no reuse).

- **Medical & Health:** authored austere-medicine pages · WikiMed ZIM · PD
  herbals (Culpeper, King’s Dispensatory, Mrs Grieve) · WHO/FEMA/CDC PD docs ·
  dosage-by-weight quick tables.
- **How-To & Skills:** FM 21-76 + Army FMs, FEMA/ready.gov (PD) + authored
  water/shelter/power/sanitation guides with diagrams in `media/`.
- **Food & Water:** preservation, growing, livestock, foraging (USDA PD +
  authored). Planting-zone charts.
- **Pets & Animals:** authored care/training guides + PD veterinary texts.
- **Town Builder:** fully original field guide — order of operations
  (water→food→winter), governance/laws, defense, relationships.
- **Faith & Bible:** multi-translation reader (parallel view, search, topical
  index). Launch set: KJV, ASV, WEB, YLT, Douay-Rheims (PD; eBible.org /
  OpenScriptures). Crossway ESV non-commercial license application submitted
  in parallel; ESV slots in when approved.
- **Book Library:** Project Gutenberg `.txt` — top classics + curated
  survival-relevant list; built-in text reader; passage retrieval (see
  Ask-the-Kit).
- **Education (Schoolhouse):**
  - Thin-but-complete daily plans for all bands (K–2 / 3–5 / 6–8 / 9–12),
    deepened over time.
  - Clean-room ORIGINAL faith-integrated curriculum — authored standards-
    outward from public grade norms; never mirrors EP sequence/text.
  - Bundled OER: OpenStax (CC BY), Illustrative Mathematics (CC BY),
    Core Knowledge (CC BY-NC-SA), CK-12 (CC BY-NC-SA), PhET sims subset
    (CC BY), McGuffey Readers + Ray’s Arithmetic (PD).
  - Teacher guides: one-room-schoolhouse primer, adult literacy.
  - Progress tracker: student profiles as exportable JSON files (“local student
    file”), localStorage autosave, quizzes, Khan-style mastery grids.
  - Server mode adds Kolibri container: full accounts/coach dashboards/auto-
    grading/Khan videos (videos are SERVER-ONLY; portable kits stay text+
    interactive per constitution).
- **Arcade (C-lite):** EmulatorJS for NES/GB/GBC/SNES/GBA. Bundled featherweight
  static server per OS (`server/`, ~5–20MB, binds 127.0.0.1 read-only) +
  START-SERVER wrappers (.bat/.command/.sh) → SNES/GBA work offline via
  localhost. Cold double-click still gets NES/GB/GBC. PICO-8/Picotron: scrape
  BBS top-200 by popularity (rate-limited, personal use) → batch-export
  self-contained HTML via owned Lexaloffle licenses (headless `pico8 -export`;
  spike early). Homebrew/PD ROMs default; user ROMs privately into
  `media/roms/` (never distributed).
- **Offline Wiki — four layers:** (1) curated ~300–500 emergency-core articles
  pre-rendered natively; (2) embedded kiwix-js reader page — drag/pick `.zim`
  from `media/zims/`; Mediawiki content renders on file:// (Restricted mode);
  GPL-3.0 vendored; spike validates rendering/search/maxi-ZIM seeks, base64-
  embeds search WASM if needed; (3) Kiwix Reader apps documented (phones);
  (4) kiwix-serve on cedar for hosted deep-linking. Wiki page states honestly
  that ZIM contents are searched separately from global search.
- **Maps & Navigation — four tiers:** (1) Natural Earth vectors (PD) as
  GeoJSON-in-script, world/regional base (~50–200MB); (2) home-state raster
  tiles via Leaflet, local `{z}/{x}/{y}` PNGs, file://-native (~1–5GB, size
  configurable); (3) MapLibre + PMTiles vector + USGS topo quads — server-side
  from sd256 (20–60GB); (4) phones documented: OsmAnd / Organic Maps. Plus
  compass/celestial/knots content.
- **Emergency Hub:** ~20 life-safety glance-cards; interactive decision-tree
  triage (“someone is unconscious” → 3 questions → procedure); drill-runner
  mode for scenario playbooks (checkboxes + elapsed time); printable fill-in
  document vault (roster, medical sheet, shutoff locations, wallet cards).
- **Quick Reference:** purification ratios, medication dosages by weight,
  fuel mix ratios, seed spacing, FRS/GMRS channels, NOAA frequencies, unit
  conversions. Dense, print-optimized.
- **ID Browser:** photo-grid identification for plants/wildlife/hazards;
  filters by type/traits/season/region; pulls from `media/`; text-only
  descriptions as graceful fallback.
- **Pocket Apps:** notepad, paint, spreadsheet, todo, calendar — single-file
  HTML each; file save/load first-class.
- **Ask-the-Kit (LLM agent):** OpenAI-compatible endpoint configured on Admin
  page (`enabled/baseUrl/apiKey/model`, model dropdown via `/models`, Test
  button — UX cloned from fivey-tools `admin.js`/`ai.py`). Dual runtime:
  - *Hosted:* `ai-proxy` container on cedar (masked keys server-side, streaming
    SSE passthrough), nginx-mounted `/api/ai/`.
  - *Portable:* direct browser→endpoint fetches; key optionally remembered in
    localStorage with explicit warning; ideal target = town-hosted LLM box on
    LAN (e.g. `http://townbox:11434/v1`).
  - RAG: question → retrieval from our indexes → context-injected answer with
    citations deep-linking site pages. Corpus tiers: pocket = authored +
    curated wiki subset + Bible verses; fat kit adds Gutenberg passage-index
    shards (~300–500MB); hosted retrieves over everything server-side.
  - Optional feature: unconfigured state is friendly, never broken.

---

## Infrastructure & deployment

- **nginx** vhost `breakglass.w4sh.net.conf`, port **8019** *(revised from 8017 —
  taken by an unregistered vhost; field-guide drift flagged)*, root = deploy tree;
  deny `/tools/ /docs/ /.git*`; SELinux: `semanage port -a -t http_port_t -p tcp 8019`
  + restorecon on served tree. Cloudflared hostname route → restart tunnel.
  **Deploy root:** `/mnt/tb01/breakglass` (per owner: run from tb01 so sd256 copy
  behavior can be tested); canonical git repo stays `~/projects/breakglass`.
- **sd256 vault** (dedicated 238GB exFAT drive): maxi English Wikipedia
  (~108GB) + WikiHow (~25–30GB) + WikiMed (~3GB) + iFixit (~10GB) + growth
  ≈ 175GB used / ~60GB free. Read by kiwix-serve + Kolibri containers; also
  the master source for cloning fat kits.
- **Containers on cedar:** `kiwix-serve`, `kolibri` (channels on sd256),
  `ai-proxy`.
- **lando_pageo resilience:** verify project vhosts bind all interfaces; add
  `/etc/hosts` overrides on cedar; add offline-links block (bare
  `http://192.168.87.247:<port>`) to landing page so WAN outage doesn’t kill
  internal navigation; check cert types.
- **Wrap-up registration:** system field-guide updates (projects list, tunnel
  table, nginx table, storage table incl. sd256), landing preview refresh via
  `update-previews.mjs --site breakglass`.

## Packaging

`tools/pack.sh` produces:
- **Pocket kit:** site minus tools/docs/git/media/zims/fat-index — small,
  universally shareable. Includes micro-server binaries.
- **Fat kit:** + `media/` (+ optional ZIM flavor selection + book passage-index
  shards). Master copies cloneable from sd256.
- Friend-facing `START-HERE.html` explains entry point and the one optional
  wrapper (START-SERVER) for SNES/GBA.

## Licensing register (maintain in LICENSES.md)

Font Awesome (icons CC BY 4.0 / code MIT / fonts OFL) · Inter (OFL) ·
kiwix-js (GPL-3.0) · OpenStreetMap (ODbL attribution) · Natural Earth (PD) ·
per-source content licenses · ESV (Crossway application pending) · Lexaloffle
cart exports (personal use) · EmulatorJS cores (GPL-2+) · about-page
attribution block.

---

## Roadmap

| # | Phase | Notes |
|---|---|---|
| 0 | Docs | this file + field-guide.md ✅ |
| 1 | Scaffold | git init, connect to GitHub repo, skeleton |
| 2 | Design system | tokens, themes, components, styleguide.html, landing shell |
| 3 | Search engine | shard builder + search.html + A-Z index |
| 4 | Deploy early | nginx/cloudflared/SELinux → live before heavy content |
| 5 | Content core | medical, howto, food, pets, town, faith+Bible, books |
| 6 | Apps suite | five single-file apps |
| 7 | Arcade | console emus + wrappers; PICO-8 export pipeline (spike first) |
| 8 | sd256 vault | ZIM downloads, kiwix-serve, embedded-reader spike |
| 9 | Schoolhouse | curriculum skeleton, tracker, Kolibri container |
| 10 | Ask-the-Kit + Phases | proxy service, chat UI, phase tagging sweep |
| 11 | Usability extras | Emergency Hub drills, Quick Ref, ID Browser, map tiers |
| 12 | Packaging | pack.sh, kits, START-HERE |
| 13 | Wrap-up | lando fix, field-guide updates, preview refresh, ESV follow-up |

Order is flexible except: design system before mass content; deploy before
deep content so the live URL shapes decisions.

## Housekeeping notes

- Stray git repo rooted at `~/projects/` will see this as an embedded repo —
  recommend removing it eventually (has real history; owner’s call; untouched).
- Lexaloffle scraping: rate-limited, modest volume, personal use.
- Both runtime modes tested for every feature (existing visual-regression
  habits cover this).
- System field-guide memory rules apply to any browser-heavy verification.
