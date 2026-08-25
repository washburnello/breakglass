# BreakGlass Field Guide — Project Constitution

**What this is:** the law of the project. Read before any work. If plan.md and
this document disagree with an idea, the idea needs to argue its case here
first. Companion docs: `plan.md` (roadmap & decisions), `docs/style-guide.md`
(design law, Phase 2), `LICENSES.md` (asset rights).

---

## What BreakGlass IS

An offline survival-knowledge website. Pure static files that work by
double-clicking `index.html` from a USB stick on any OS, expand gracefully when
served over HTTP, and live permanently at **https://breakglass.w4sh.net**
(nginx :8019 ← deploy tree `/mnt/tb01/breakglass` ← canonical repo
`~/projects/breakglass`).

## What BreakGlass IS NOT

- Not a web app. The core requires no server, no install, no runtime.
- Not a video library (portable kits are text+interactive; lecture videos live
  server-side in Kolibri only).
- Not a distributor of copyrighted material (no commercial ROMs, no All-Rights-
  Reserved curricula, no Survipedia content — inspiration only).
- Not political, not doom-marketing, not product reviews.

## Prime directives

1. **file:// first.** If a feature can’t degrade honestly without a server,
   it gets a badge, never a broken UI.
2. **Zero external requests, ever.** Fonts, icons, JS, data: all local.
3. **No `fetch()` against local files.** Local data ships as `<script src>`
   shards. WASM arrives base64-in-script or lives behind server mode.
4. **Files over storage.** Anything user-created (notes, student progress,
   settings) saves/loads as plain text files; localStorage is best-effort
   autosave only.
5. **Legally clean sourcing only.** Every asset’s license recorded in
   LICENSES.md before it ships. PD and permissive-CC preferred; attribution
   rendered on-page.
6. **Graceful degradation everywhere.** Missing `media/`, missing API key,
   missing server mode → dimmed badges and friendly empty states.
7. **Text-first.** Diagrams/images enhance; pages must stand alone without them.

## Architecture invariants

- Repo root IS the distributable site. Entry point: `index.html`.
- Styling consumes design tokens only — no hard-coded values.
- New components must land in `styleguide.html` before use in pages.
- Mode detection via `location.protocol`; phase via front-matter tags +
  JSON taxonomy (`Everyday / Survive / Stabilize / Rebuild / Thrive`).
- Search indexes are prebuilt lazy JS shards; A–Z index page is the no-JS
  fallback discovery path.
- `EMERGENCY.html` always mirrors the Emergency Hub at site root and force-pins
  Survive phase.

## Canonical tile map (19)

SURVIVAL: Emergency Hub · Medical & Health · How-To & Skills · Food & Water ·
Comms & Radio ‖ KNOWLEDGE: Offline Wiki · Book Library · Faith & Bible ·
Education (Schoolhouse) · Ask-the-Kit · ID Browser ‖ REBUILD: Town Builder ·
Maps & Navigation · Pets & Animals ‖ TOOLS: Quick Reference · Pocket Apps ·
Calculators · Kit Admin ‖ MORALE: Arcade

Changes to this map require editing this file first.

## Storage map

| Location | Holds |
|---|---|
| repo tree | committed static site + tools/docs (tools/docs not distributed) |
| `media/` (gitignored) | images, diagrams, ROMs, PICO/Picotron exports, ZIMs, map tiles — optional companion folder |
| `/mnt/sd256` | master vault: maxi Wikipedia, WikiHow, WikiMed, iFixit ZIMs (~175GB); master source for fat kits; read by kiwix-serve/Kolibri on cedar |
| cedar containers | kiwix-serve · kolibri (videos) · ai-proxy |

## Authoring conventions

- Voice: plain language, calm authority, zero hype.
- Every content page carries front-matter: phase tags, priority weight,
  source/license line.
- Severity callouts use the standard component set (danger/warning/caution/info).
- Print styles assumed used — survival pages get printed.
- Original curriculum content is authored standards-outward; never mirror
  third-party lesson sequences or text.

## Definition of done for any new section

1. Works on cold `file://` double-click AND served, both verified.
2. Tokens/components only; appears correctly in light+dark+print.
3. Indexed by global search; listed in A–Z; phase-tagged.
4. Media dependencies degrade cleanly without `media/`.
5. Licenses recorded; styleguide updated if new components were introduced.
6. No external requests introduced.

## Out of scope (do not drift)

Dynamic backends required for core use · videos in portable kits · telemetry/
analytics of any kind · accounts/auth on the public site · commercial
redistribution · content from NC/ND sources.

## Pointers

- Roadmap & decision log → `plan.md`
- Server operations → `~/projects/system-management/field-guide.md`
- Design law → `docs/style-guide.md`
- Rights → `LICENSES.md`
