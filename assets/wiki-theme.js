(function () {
  "use strict";

  var TOKEN_MAP = {
    "--bgw-bg": "--bg",
    "--bgw-surface": "--surface",
    "--bgw-surface-2": "--surface-2",
    "--bgw-text": "--text",
    "--bgw-muted": "--text-muted",
    "--bgw-border": "--border",
    "--bgw-accent": "--accent",
    "--bgw-link": "--info"
  };

  var SCALE_KEY = "bg.wiki.fontscale";
  var STYLE_ID = "bg-wiki-css";
  var FONT_BASE = null;

  function fontUrl(file) {
    if (!FONT_BASE) {
      try {
        var scripts = document.querySelectorAll("script[src]");
        for (var i = 0; i < scripts.length; i++) {
          var s = scripts[i].getAttribute("src") || "";
          if (/assets\/wiki-theme\.js/.test(s)) {
            FONT_BASE = new URL("vendor/inter/", new URL(s.replace(/assets\/wiki-theme\.js.*$/, "assets/"), location.href)).href;
          }
        }
      } catch (e) { FONT_BASE = ""; }
    }
    return FONT_BASE + file;
  }

  function collect() {
    var cs = getComputedStyle(document.documentElement);
    var out = {};
    Object.keys(TOKEN_MAP).forEach(function (slot) {
      out[slot] = cs.getPropertyValue(TOKEN_MAP[slot]).trim();
    });
    out["--bgw-heading"] = out["--bgw-text"];
    out["--bgw-scheme"] = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    out["--bgw-scale"] = String(currentScale());
    return out;
  }

  function currentScale() {
    var n = parseFloat(localStorage.getItem(SCALE_KEY));
    if (!isFinite(n)) n = 1;
    return Math.min(1.6, Math.max(0.8, Math.round(n * 10) / 10));
  }

  function setScale(n) {
    n = Math.min(1.6, Math.max(0.8, Math.round(n * 10) / 10));
    try { localStorage.setItem(SCALE_KEY, String(n)); } catch (e) {}
    return n;
  }

  function fontFaces() {
    var faces = [
      ["Inter", 400, "inter-latin-400-normal.woff2"],
      ["Inter", 600, "inter-latin-600-normal.woff2"],
      ["Inter", 700, "inter-latin-700-normal.woff2"]
    ];
    return faces.map(function (f) {
      return '@font-face{font-family:"' + f[0] + '";font-style:normal;font-weight:' + f[1] +
        ";font-display:swap;src:url(\"" + fontUrl(f[2]) + "\") format(\"woff2\");}";
    }).join("\n");
  }

  var SHEET = [
    'html.bg-wiki{background:var(--bgw-bg);color-scheme:var(--bgw-scheme)}',
    'html.bg-wiki body{background:var(--bgw-bg)!important;color:var(--bgw-text)!important;font-family:Inter,-apple-system,"Segoe UI",Roboto,sans-serif!important;font-size:calc(16px*var(--bgw-scale,1));line-height:1.65;margin:0 auto;max-width:46rem;padding:1.5rem 1rem 4rem}',
    'html.bg-wiki #content,html.bg-wiki .mw-body,html.bg-wiki .mw-parser-output{background:transparent;color:inherit;max-width:none;padding:0;border:none}',
    'html.bg-wiki h1,html.bg-wiki h2,html.bg-wiki h3,html.bg-wiki h4,html.bg-wiki h5{color:var(--bgw-heading)!important;line-height:1.25;font-family:inherit}',
    'html.bg-wiki h1{font-size:1.85em;border-bottom:1px solid var(--bgw-border);padding-bottom:.25em;margin:.2em 0 .5em}',
    'html.bg-wiki h2{font-size:1.45em;border-bottom:1px solid var(--bgw-border);padding-bottom:.2em;margin-top:1.6em}',
    'html.bg-wiki h3{font-size:1.2em;margin-top:1.3em}',
    'html.bg-wiki h4{font-size:1.05em;margin-top:1.2em}',
    'html.bg-wiki p{margin:.7em 0}',
    'html.bg-wiki a{color:var(--bgw-link)!important;text-decoration-color:color-mix(in srgb,var(--bgw-link),transparent 60%)}',
    'html.bg-wiki a:hover{color:var(--bgw-accent)!important}',
    'html.bg-wiki a.new{color:var(--bgw-muted)!important}',
    'html.bg-wiki img,html.bg-wiki video,html.bg-wiki svg,html.bg-wiki canvas{max-width:100%;height:auto}',
    'html.bg-wiki figure{margin:1em auto;max-width:100%}',
    'html.bg-wiki figcaption,html.bg-wiki .thumbcaption{color:var(--bgw-muted);font-size:.85em;line-height:1.5}',
    'html.bg-wiki .thumb,html.bg-wiki .thumbnail,html.bg-wiki .thumbinner{max-width:100%;background:transparent;border:none;margin-left:auto;margin-right:auto}',
    'html.bg-wiki table.wikitable{background:var(--bgw-surface);color:var(--bgw-text);border-collapse:collapse;margin:1em 0;font-size:.92em;display:block;overflow-x:auto;max-width:100%}',
    'html.bg-wiki table.wikitable th{background:var(--bgw-surface-2);border:1px solid var(--bgw-border);padding:.4em .6em;text-align:left}',
    'html.bg-wiki table.wikitable td{border:1px solid var(--bgw-border);padding:.35em .6em}',
    'html.bg-wiki table.infobox,html.bg-wiki table.vertical-navbox{float:none;margin:1em auto;background:var(--bgw-surface);border:1px solid var(--bgw-border);border-radius:8px;width:min(100%,22rem);font-size:.88em;border-spacing:0;overflow:hidden}',
    'html.bg-wiki table.infobox th,html.bg-wiki table.infobox caption{background:var(--bgw-surface-2);text-align:left;padding:.4em .6em}',
    'html.bg-wiki table.infobox td{padding:.3em .6em;border-top:1px solid var(--bgw-border)}',
    'html.bg-wiki code,html.bg-wiki pre,html.bg-wiki samp{background:var(--bgw-surface-2);color:var(--bgw-text);border-radius:6px;font-size:.9em}',
    'html.bg-wiki code{padding:.12em .35em}',
    'html.bg-wiki pre{padding:.8em 1em;overflow-x:auto;line-height:1.5}',
    'html.bg-wiki pre code{padding:0;background:transparent}',
    'html.bg-wiki blockquote{border-left:3px solid var(--bgw-accent);margin:1em 0;padding:.15em 1em;color:var(--bgw-muted)}',
    'html.bg-wiki hr{border:none;border-top:1px solid var(--bgw-border);margin:1.5em 0}',
    'html.bg-wiki fieldset,html.bg-wiki textarea,html.bg-wiki input,html.bg-wiki select{background:var(--bgw-surface);color:var(--bgw-text);border:1px solid var(--bgw-border)}',
    'html.bg-wiki .hatnote{color:var(--bgw-muted);font-style:italic;padding-left:1.5em}',
    'html.bg-wiki ol.references{font-size:.85em}',
    'html.bg-wiki sup.reference a{text-decoration:none}',
    'html.bg-wiki .navbox,html.bg-wiki .navbox-styles,html.bg-wiki .sistersitebox,html.bg-wiki .mbox-small,html.bg-wiki .metadata,html.bg-wiki .mw-editsection,html.bg-wiki #siteSub,html.bg-wiki .mw-jump-link{display:none!important}',
    'html.bg-wiki ::selection{background:var(--bgw-accent);color:var(--bgw-bg)}',
    'html.bg-wiki-zimit body{background:var(--bgw-bg)!important;color:var(--bgw-text)!important;color-scheme:var(--bgw-scheme)}',
    'html.bg-wiki-zimit{background:var(--bgw-bg);color-scheme:var(--bgw-scheme)}',
    '@media print{html.bg-wiki body{max-width:none;background:#fff!important;color:#000!important;padding:0;font-size:11pt}html.bg-wiki a{color:#000!important;text-decoration:none}html.bg-wiki table.infobox,html.bg-wiki table.wikitable{display:table;width:auto}html.bg-wiki .navbox,html.bg-wiki .metadata{display:none!important}}'
  ].join("\n");

  function ensureStyle(doc) {
    var styleEl = doc.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = doc.createElement("style");
      styleEl.id = STYLE_ID;
      styleEl.textContent = fontFaces() + "\n" + SHEET;
      var head = doc.head || doc.getElementsByTagName("head")[0];
      if (head) head.appendChild(styleEl);
      else doc.documentElement.appendChild(styleEl);
    }
    return styleEl;
  }

  function paintVars(doc, kind) {
    var root = doc.documentElement;
    root.classList.add(kind === "zimit" ? "bg-wiki-zimit" : "bg-wiki");
    var vars = collect();
    Object.keys(vars).forEach(function (k) {
      root.style.setProperty(k, vars[k]);
    });
  }

  function decorate(doc, kind) {
    if (!doc || !doc.documentElement) return;
    ensureStyle(doc);
    paintVars(doc, kind || "wiki");
  }

  function refresh(doc) {
    if (!doc || !doc.documentElement) return;
    paintVars(doc, doc.documentElement.classList.contains("bg-wiki-zimit") ? "zimit" : "wiki");
  }

  window.BGWikiTheme = {
    decorate: decorate,
    refresh: refresh,
    currentScale: currentScale,
    setScale: setScale,
    onParentThemeChange: function (cb) {
      var last = document.documentElement.getAttribute("data-theme");
      new MutationObserver(function () {
        var now = document.documentElement.getAttribute("data-theme");
        if (now !== last) {
          last = now;
          cb(now);
        }
      }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }
  };
})();
