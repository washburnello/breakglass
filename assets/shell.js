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
        el.textContent = "Media pack: not found (optional content unavailable)";
      });
    };
    img.src = "media/probe.png";
  }

  function applyPhase(id) {
    var valid = PHASES.some(function (p) { return p.id === id; });
    if (!valid) id = "everyday";
    document.body.setAttribute("data-phase", id);
    store("bg.phase", id);
    document.querySelectorAll(".phase-select").forEach(function (sel) {
      sel.value = id;
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

    applyPhase(store("bg.phase") || "everyday");
    buildPhaseSelects();
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
