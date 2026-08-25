# BreakGlass

BreakGlass is a self-contained offline survival-knowledge website: pure static files that work by double-clicking `index.html` on any OS with zero installation, zip-and-shareable onto a USB stick, and served live on the web at **https://breakglass.w4sh.net**. Knowledge that survives losing everything else.

## The two use cases

1. **Portable:** copy the folder to a USB drive, plug into any computer, double-click `index.html`, browse everything. No install, no runtime, no internet.
2. **Hosted:** copy the same folder to any static web server (or run the bundled micro-server in `server/`) and access it over the network with expanded capabilities.

These do not conflict — HTTP mode is a strict superset of `file://` mode. Every feature either works everywhere or degrades to a labeled badge, never a broken button.

## Repo layout

```
breakglass/
├── index.html              # tile landing page (entry point)
├── EMERGENCY.html          # emergency hub mirror at site root
├── START-HERE.html         # friend-facing welcome page for USB recipients
├── emergency/ medical/ howto/ food/ pets/ comms/ maps/
│   wiki/ books/ faith/ education/ town/ ask/ id/ reference/
│   apps/ calc/ arcade/ admin/   # one dir per content section
├── assets/                 # css/js framework — zero external CDNs, ever
├── media/                  # GITIGNORED companion folder (images, roms, zims…)
├── server/                 # bundled micro-server binaries + START-SERVER wrappers
├── tools/                  # maintainer-only: fetchers, index builders, pack scripts
├── docs/                   # maintainer-only deep-dives
└── plan.md  field-guide.md  LICENSES.md  README.md
```

## Development

The site is plain static files. Open `index.html` directly in a browser, or serve the repo root:

```sh
python3 -m http.server
```

Deployment target is `/mnt/tb01/breakglass` via `tools/deploy.sh` [coming soon], served by nginx on port 8019 behind cloudflared on the cedar host.

## Design law

Design tokens, components and hard rules live in `docs/style-guide.md` and are demonstrated in `styleguide.html`, once authored.

## Contributing

Read `field-guide.md` first — it is the project constitution, including the authoring rules every content page must follow.

## License

Every bundled asset's license is recorded in `LICENSES.md`.
