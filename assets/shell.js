(function () {
  "use strict";

  var THEMES = ["light", "dark"];
  var PHASES = window.BG_PHASES || [
    { id: "everyday", label: "Everyday" },
    { id: "survive", label: "Survive" },
    { id: "stabilize", label: "Stabilize" },
    { id: "rebuild", label: "Rebuild" },
    { id: "thrive", label: "Thrive" }
  ];
  var TAXONOMY = window.BG_PHASE_TAXONOMY || null;
  var TILES = window.BG_PHASE_TILES || null;
  var PHASE_ICONS = {
    everyday: "fa-solid fa-house",
    survive: "fa-solid fa-truck-medical",
    stabilize: "fa-solid fa-tower-broadcast",
    rebuild: "fa-solid fa-city",
    thrive: "fa-solid fa-seedling"
  };
  var DIM_OPACITY = 0.45;
  var originalTiles = null;

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      if (val === null) localStorage.removeItem(key);
      else localStorage.setItem(key, val);
    } catch (e) { return null; }
    return null;
  }

  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    store("bg.theme", t);
    document.querySelectorAll("[data-action='toggle-theme']").forEach(function (el) {
      el.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
    });
  }

  function detectTheme() {
    var saved = store("bg.theme");
    if (saved && THEMES.indexOf(saved) !== -1) return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark" : "light";
  }

  function detectMode() {
    return location.protocol === "file:" ? "file" : "http";
  }

  function siteRoot() {
    var scripts = document.querySelectorAll("script[src]");
    for (var i = 0; i < scripts.length; i++) {
      var s = scripts[i].getAttribute("src") || "";
      if (/assets\/shell\.js/.test(s)) return s.replace(/assets\/shell\.js.*$/, "");
    }
    return "";
  }

  function probeMedia() {
    var img = new Image();
    img.onload = function () {
      document.body.classList.add("media-ok");
      document.body.classList.remove("media-missing");
      document.querySelectorAll("[data-media-state]").forEach(function (el) {
        el.textContent = "Media pack: detected";
      });
    };
    img.onerror = function () {
      document.body.classList.add("media-missing");
      document.body.classList.remove("media-ok");
      document.querySelectorAll("[data-media-state]").forEach(function (el) {
        el.textContent = "Media pack: not found";
      });
    };
    img.src = siteRoot() + "media/probe.png";
  }

  function forcedPhase() {
    if (!document.body || !document.body.hasAttribute("data-force-phase")) return null;
    var id = document.body.getAttribute("data-force-phase");
    return PHASES.some(function (p) { return p.id === id; }) ? id : "everyday";
  }

  function applyPhase(id) {
    var forced = forcedPhase();
    if (forced) {
      document.body.setAttribute("data-phase", forced);
      document.querySelectorAll(".phase-select").forEach(function (sel) {
        sel.value = forced;
        sel.hidden = true;
        sel.disabled = true;
      });
      refreshPhaseUi();
      return;
    }
    var valid = PHASES.some(function (p) { return p.id === id; });
    if (!valid) id = "everyday";
    document.body.setAttribute("data-phase", id);
    store("bg.phase", id);
    document.querySelectorAll(".phase-select").forEach(function (sel) {
      sel.value = id;
    });
    refreshPhaseUi();
  }

  function refreshPhaseUi() {
    renderPhaseBanner();
    applyTileWeights();
  }

  function renderPhaseBanner() {
    var mount = document.getElementById("phase-banner-mount");
    if (!mount || !TAXONOMY) return;
    mount.innerHTML = "";
    var id = document.body.getAttribute("data-phase");
    if (!id || id === "everyday" || !TAXONOMY[id]) return;
    var info = TAXONOMY[id];
    var banner = document.createElement("div");
    banner.className = "phase-banner";
    banner.style.flexWrap = "wrap";
    var icon = document.createElement("i");
    icon.className = PHASE_ICONS[id] || "fa-solid fa-circle-info";
    icon.setAttribute("aria-hidden", "true");
    var label = document.createElement("strong");
    label.textContent = info.label + " —";
    label.style.marginRight = "var(--space-1)";
    var text = document.createElement("span");
    text.textContent = info.banner;
    banner.appendChild(icon);
    banner.appendChild(label);
    banner.appendChild(text);
    if (info.checklist && info.checklist.length) {
      var list = document.createElement("ul");
      list.className = "checklist";
      list.style.display = "flex";
      list.style.flexWrap = "wrap";
      list.style.gap = "0 var(--space-4)";
      list.style.marginLeft = "auto";
      info.checklist.slice(0, 4).forEach(function (item) {
        var li = document.createElement("li");
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.gap = "var(--space-1)";
        li.style.borderTop = "none";
        li.style.fontWeight = "400";
        var tick = document.createElement("i");
        tick.className = "fa-solid fa-check";
        tick.setAttribute("aria-hidden", "true");
        li.appendChild(tick);
        li.appendChild(document.createTextNode(item));
        list.appendChild(li);
      });
      banner.appendChild(list);
    }
    mount.appendChild(banner);
  }

  function normPath(raw) {
    var segs = String(raw || "").split("#")[0].split("?")[0].split("/");
    var out = [];
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i];
      if (!s || s === "." || /\.[A-Za-z0-9]+$/.test(s)) continue;
      if (s === "..") { out.pop(); continue; }
      out.push(s);
    }
    return "/" + out.join("/");
  }

  function tileWeight(table, el) {
    var path = normPath(el.getAttribute("href"));
    var bestLen = 0;
    var weight = 5;
    for (var i = 0; i < table.length; i++) {
      var key = normPath(table[i][0]);
      var match = path === key || path.indexOf(key + "/") === 0;
      if (match && key.length >= bestLen) {
        bestLen = key.length;
        weight = table[i][1];
      }
    }
    return weight;
  }

  function captureTileOrder(grids) {
    if (originalTiles) return;
    originalTiles = [];
    grids.forEach(function (grid) {
      originalTiles.push({ grid: grid, tiles: Array.prototype.slice.call(grid.children) });
    });
  }

  function undim(section) {
    section.classList.remove("dim-group");
    section.style.opacity = "";
    section.style.transition = "";
  }

  function applyTileWeights() {
    var grids = document.querySelectorAll(".tile-grid");
    if (!grids.length) return;
    var phase = document.body.getAttribute("data-phase");
    var table = (TILES && TILES[phase]) || null;
    if (!table) {
      restoreTileOrder();
      return;
    }
    captureTileOrder(grids);
    grids.forEach(function (grid) {
      var weighted = Array.prototype.map.call(grid.querySelectorAll(".tile"), function (tile, idx) {
        return { tile: tile, weight: tileWeight(table, tile), idx: idx };
      });
      weighted.sort(function (a, b) {
        if (b.weight !== a.weight) return b.weight - a.weight;
        return a.idx - b.idx;
      });
      weighted.forEach(function (entry) { grid.appendChild(entry.tile); });
      var section = grid.closest("section") || grid;
      var allLow = weighted.length > 0 && weighted.every(function (entry) { return entry.weight < 4; });
      if (allLow) {
        section.classList.add("dim-group");
        section.style.opacity = String(DIM_OPACITY);
        section.style.transition = "opacity var(--dur-slow) var(--ease-out)";
      } else {
        undim(section);
      }
    });
  }

  function restoreTileOrder() {
    if (!originalTiles) return;
    originalTiles.forEach(function (rec) {
      rec.tiles.forEach(function (tile) { rec.grid.appendChild(tile); });
      undim(rec.grid.closest("section") || rec.grid);
    });
  }

  function buildPhaseSelects() {
    document.querySelectorAll(".phase-select").forEach(function (sel) {
      if (sel.options.length === 0) {
        PHASES.forEach(function (p) {
          var o = document.createElement("option");
          o.value = p.id;
          o.textContent = p.label;
          sel.appendChild(o);
        });
      }
      sel.addEventListener("change", function () { applyPhase(sel.value); });
    });
  }

  function init() {
    document.body.dataset.mode = detectMode();

    applyTheme(detectTheme());
    document.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-action='toggle-theme']");
      if (!btn) return;
      var cur = document.documentElement.getAttribute("data-theme");
      applyTheme(cur === "dark" ? "light" : "dark");
    });

    buildPhaseSelects();
    applyPhase(store("bg.phase") || "everyday");
    probeMedia();

    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });

    window.BG = {
      phases: PHASES,
      getPhase: function () { return document.body.getAttribute("data-phase"); },
      setPhase: applyPhase,
      getTheme: function () { return document.documentElement.getAttribute("data-theme"); },
      setTheme: applyTheme,
      mode: detectMode()
    };

    document.documentElement.classList.add("shell-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
