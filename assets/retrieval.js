(function (global) {
  "use strict";

  var STOPWORDS = ["a","an","and","the","of","to","in","is","it","on","for","with","as","at","by","from","or","this","that","these","those","be","are","was","were","will","would","can","could","should","do","does","did","not","but","if","then","than","so","such","into","about","your","you","we","our","they","their","its","has","have","had","i"];

  function foldWord(w) {
    return w.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  }

  function normalizeQuery(s) {
    var folded = foldWord(String(s || "").toLowerCase());
    var parts = folded.split(/[^a-z0-9]+/);
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var w = parts[i];
      if (w.length < 2) continue;
      if (STOPWORDS.indexOf(w) !== -1) continue;
      out.push(w);
    }
    return out;
  }

  var pendingScripts = {};

  function loadScript(src) {
    if (pendingScripts[src]) return pendingScripts[src];
    pendingScripts[src] = new Promise(function (resolve) {
      var s = global.document.createElement("script");
      s.src = src;
      s.onload = function () { resolve(); };
      s.onerror = function () { resolve(); };
      global.document.head.appendChild(s);
    });
    return pendingScripts[src];
  }

  var baseCache = null;

  function baseUrl() {
    if (baseCache !== null) return baseCache;
    baseCache = "";
    var scripts = global.document && global.document.scripts ? global.document.scripts : [];
    for (var i = 0; i < scripts.length; i++) {
      var el = scripts[i];
      var src = String((el.getAttribute ? el.getAttribute("src") : el.src) || "");
      if (/retrieval\.js($|\?)/.test(src)) {
        baseCache = src.slice(0, src.lastIndexOf("retrieval.js"));
        break;
      }
    }
    return baseCache;
  }

  function docsUrl() { return baseUrl() + "search/docs.js"; }
  function manifestUrl() { return baseUrl() + "search/manifest.js"; }
  function bucketUrl(key) { return baseUrl() + "search/bucket-" + key + ".js"; }

  function titleTokens(t) {
    return foldWord(String(t || "").toLowerCase()).split(/[^a-z0-9]+/);
  }

  function scoreDocs(docs, buckets, terms) {
    var hits = {};
    var order = [];
    for (var i = 0; i < terms.length; i++) {
      var term = terms[i];
      var shard = buckets[String(term).charAt(0)];
      var postings = shard ? shard[term] : null;
      if (!postings) continue;
      for (var j = 0; j < postings.length; j++) {
        var id = postings[j][0];
        var tf = postings[j][1] || 1;
        if (!Object.prototype.hasOwnProperty.call(hits, id)) {
          hits[id] = { score: 0, terms: [] };
          order.push(id);
        }
        hits[id].score += tf;
        if (hits[id].terms.indexOf(term) === -1) hits[id].terms.push(term);
      }
    }
    var results = [];
    for (var k = 0; k < order.length; k++) {
      var id = order[k];
      var doc = docs[id];
      if (!doc) continue;
      var h = hits[id];
      var tt = null;
      var lead = false;
      for (var m = 0; m < h.terms.length; m++) {
        if (tt === null) tt = titleTokens(doc.t);
        if (tt.indexOf(h.terms[m]) !== -1) {
          h.score += 3;
          if (tt[0] === h.terms[m]) lead = true;
        }
      }
      results.push({ t: doc.t, u: doc.u, x: doc.x, score: h.score, lead: lead });
    }
    results.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      if (a.lead !== b.lead) return a.lead ? -1 : 1;
      return a.t < b.t ? -1 : a.t > b.t ? 1 : 0;
    });
    return results;
  }

  function ensureShards(terms) {
    var want = {};
    for (var i = 0; i < terms.length; i++) want[String(terms[i]).charAt(0)] = true;
    return loadScript(docsUrl()).then(function () {
      return loadScript(manifestUrl());
    }).then(function () {
      var keys = Array.isArray(global.BG_SEARCH_KEYS) ? global.BG_SEARCH_KEYS : [];
      var chain = Promise.resolve();
      for (var k = 0; k < keys.length; k++) {
        (function (key) {
          if (!want[key]) return;
          chain = chain.then(function () {
            return loadScript(bucketUrl(key));
          });
        })(keys[k]);
      }
      return chain;
    });
  }

  function search(query, n, cb) {
    var limit = typeof n === "number" && n > 0 ? Math.floor(n) : 5;
    var done = typeof cb === "function" ? cb : function () {};
    var terms = normalizeQuery(query);
    var p;
    if (!terms.length) {
      p = Promise.resolve([]);
    } else {
      p = ensureShards(terms).then(function () {
        var docs = global.BG_SEARCH_DOCS || {};
        var buckets = global.BG_SEARCH_BUCKETS || {};
        var ranked = scoreDocs(docs, buckets, terms).slice(0, limit);
        return ranked.map(function (r) { return { t: r.t, u: r.u, x: r.x }; });
      }).catch(function () {
        return [];
      });
    }
    return p.then(function (res) {
      done(res);
      return res;
    });
  }

  global.BGRetrieve = {
    search: search,
    normalizeQuery: normalizeQuery,
    _scoreDocs: scoreDocs
  };
})(typeof window !== "undefined" ? window : globalThis);
