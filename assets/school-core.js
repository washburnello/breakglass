(function () {
  "use strict";

  var DB_KEY = "bg.school.db";
  var SESSION_KEY = "bg.school.session";
  var SETUP_LATER_KEY = "bg.school.setup-later";
  var SEEN_GRADES_KEY = "bg.school.seen-grades";
  var SAVE_DELAY = 350;
  var BANDS = ["k2", "35", "68", "912", "adult"];
  var BAND_LABELS = { k2: "K\u20132", "35": "3\u20135", "68": "6\u20138", "912": "9\u201312", adult: "Adult" };

  var db = null;
  var saveTimer = null;
  var storageBroken = false;

  function lsGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { storageBroken = true; return null; }
  }
  function lsSet(key, val) {
    try { window.localStorage.setItem(key, val); return true; } catch (e) { storageBroken = true; return false; }
  }
  function lsDel(key) {
    try { window.localStorage.removeItem(key); } catch (e) {}
  }
  function ssGet(key) {
    try { return window.sessionStorage.getItem(key); } catch (e) { return null; }
  }
  function ssSet(key, val) {
    try { window.sessionStorage.setItem(key, val); return true; } catch (e) { return false; }
  }
  function ssDel(key) {
    try { window.sessionStorage.removeItem(key); } catch (e) {}
  }

  function defaults() {
    return {
      app: "breakglass-school",
      version: 1,
      users: { admin: null, teachers: [] },
      students: [],
      settings: { hintsEnabled: true, adminGatePortable: true },
      progress: {},
      submissions: []
    };
  }

  function clone(o) {
    try { return JSON.parse(JSON.stringify(o)); } catch (e) { return o; }
  }

  function mergeDefaults(raw) {
    var d = defaults();
    if (!raw || typeof raw !== "object") return d;
    if (raw.users) {
      d.users.admin = raw.users.admin || null;
      d.users.teachers = Array.isArray(raw.users.teachers) ? raw.users.teachers : [];
    }
    d.students = Array.isArray(raw.students) ? raw.students : [];
    if (raw.settings && typeof raw.settings === "object") {
      for (var k in raw.settings) {
        if (Object.prototype.hasOwnProperty.call(raw.settings, k)) d.settings[k] = raw.settings[k];
      }
    }
    d.progress = (raw.progress && typeof raw.progress === "object") ? raw.progress : {};
    d.submissions = Array.isArray(raw.submissions) ? raw.submissions : [];
    return d;
  }

  function loadFromStorage() {
    var raw = lsGet(DB_KEY);
    if (!raw) return defaults();
    try {
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.app !== "breakglass-school") return defaults();
      return mergeDefaults(parsed);
    } catch (e) {
      return defaults();
    }
  }

  function flushNow() {
    if (!db) return false;
    return lsSet(DB_KEY, JSON.stringify(db));
  }

  function save() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      saveTimer = null;
      flushNow();
    }, SAVE_DELAY);
  }

  function utf8(str) {
    return unescape(encodeURIComponent(String(str)));
  }

  function rr(x, n) {
    return (x >>> n) | (x << (32 - n));
  }

  var SHA_K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function sha256Hex(message) {
    var msg = utf8(message);
    var len = msg.length;
    var words = [];
    var i;
    for (i = 0; i < len; i++) {
      words[i >> 2] = (words[i >> 2] || 0) | (msg.charCodeAt(i) << (24 - (i % 4) * 8));
    }
    words[len >> 2] = (words[len >> 2] || 0) | (0x80 << (24 - (len % 4) * 8));
    var totalWords = (((len + 9 + 63) >> 6) << 4);
    for (i = words.length; i < totalWords; i++) words[i] = 0;
    var bitLo = (len * 8) >>> 0;
    var bitHi = Math.floor((len * 8) / 4294967296);
    words[totalWords - 2] = bitHi | 0;
    words[totalWords - 1] = bitLo;

    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var w = new Array(64);

    for (var j = 0; j < totalWords; j += 16) {
      for (i = 0; i < 16; i++) w[i] = words[j + i] | 0;
      for (i = 16; i < 64; i++) {
        var s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        var s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (i = 0; i < 64; i++) {
        var S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + SHA_K[i] + w[i]) | 0;
        var S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + maj) | 0;
        h = g; g = f; f = e;
        e = (d + t1) | 0;
        d = c; c = b; b = a;
        a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    var out = "";
    for (i = 0; i < 8; i++) {
      out += ("00000000" + ((H[i] >>> 0).toString(16))).slice(-8);
    }
    return out;
  }

  function randomHex(bytes) {
    var buf;
    try {
      var arr = new Uint8Array(bytes);
      if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(arr);
        buf = arr;
      } else {
        buf = null;
      }
    } catch (e) { buf = null; }
    if (!buf) {
      buf = new Uint8Array(bytes);
      for (var i = 0; i < bytes; i++) buf[i] = Math.floor(Math.random() * 256) & 0xff;
    }
    var out = "";
    for (var k = 0; k < buf.length; k++) out += ("0" + buf[k].toString(16)).slice(-2);
    return out;
  }

  function bufferFromUtf8(str) {
    var bytes = utf8(str);
    var arr = new Uint8Array(bytes.length);
    for (var i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i) & 0xff;
    return arr.buffer;
  }

  function subtleDigest(text) {
    var subtle = null;
    try {
      if (window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === "function") {
        subtle = window.crypto.subtle;
      }
    } catch (e) { subtle = null; }
    if (!subtle) return null;
    try {
      var p = subtle.digest("SHA-256", bufferFromUtf8(text));
      return Promise.resolve(p).then(function (buf) {
        var arr = new Uint8Array(buf);
        var out = "";
        for (var i = 0; i < arr.length; i++) out += ("0" + arr[i].toString(16)).slice(-2);
        return out;
      }, function () {
        return sha256Hex(text);
      });
    } catch (e) {
      return null;
    }
  }

  function digestText(text) {
    var viaSubtle = subtleDigest(text);
    if (viaSubtle) return viaSubtle;
    return Promise.resolve(sha256Hex(text));
  }

  function hashPassword(pw) {
    var salt = randomHex(16);
    return digestText(salt + String(pw)).then(function (hash) {
      return { hash: hash, salt: salt };
    });
  }

  function verify(pw, rec) {
    if (!rec || !rec.hash || !rec.salt) return Promise.resolve(false);
    return digestText(rec.salt + String(pw)).then(function (hash) {
      return hash === rec.hash;
    });
  }

  function findStudent(id) {
    for (var i = 0; i < db.students.length; i++) {
      if (db.students[i].id === id) return db.students[i];
    }
    return null;
  }

  function findTeacher(id) {
    for (var i = 0; i < db.users.teachers.length; i++) {
      if (db.users.teachers[i].id === id) return db.users.teachers[i];
    }
    return null;
  }

  function nextId(list, prefix) {
    var max = 0;
    for (var i = 0; i < list.length; i++) {
      var m = /^([a-z]+)(\d+)$/i.exec(String(list[i].id || ""));
      if (m && m[1].toLowerCase() === prefix.toLowerCase()) {
        var n = parseInt(m[2], 10);
        if (n > max) max = n;
      }
    }
    return prefix + (max + 1);
  }

  function setSession(sess) {
    ssSet(SESSION_KEY, JSON.stringify(sess));
  }

  function getSession() {
    if (!db) return null;
    var raw = ssGet(SESSION_KEY);
    if (!raw) return null;
    var sess = null;
    try { sess = JSON.parse(raw); } catch (e) { return null; }
    if (!sess || typeof sess !== "object") return null;
    if (sess.role === "student") {
      return findStudent(sess.id) ? sess : null;
    }
    if (sess.role === "teacher") {
      return findTeacher(sess.id) ? sess : null;
    }
    if (sess.role === "admin") {
      return db.users.admin ? sess : null;
    }
    return null;
  }

  function loginStudent(id) {
    var st = findStudent(id);
    if (!st) return null;
    var sess = { role: "student", id: st.id, name: st.name };
    setSession(sess);
    return sess;
  }

  function loginTeacher(name, pw) {
    var target = null;
    for (var i = 0; i < db.users.teachers.length; i++) {
      if (db.users.teachers[i].name === name) { target = db.users.teachers[i]; break; }
    }
    if (!target) return Promise.reject(new Error("Wrong name or password."));
    return verify(pw, target).then(function (ok) {
      if (!ok) throw new Error("Wrong name or password.");
      var sess = { role: "teacher", id: target.id, name: target.name };
      setSession(sess);
      return sess;
    });
  }

  function loginAdmin(name, pw) {
    var admin = db.users.admin;
    if (!admin) return Promise.reject(new Error("No administrator exists yet."));
    if (String(admin.name) !== String(name)) {
      return Promise.reject(new Error("Wrong name or password."));
    }
    return verify(pw, admin).then(function (ok) {
      if (!ok) throw new Error("Wrong name or password.");
      var sess = { role: "admin", id: "admin", name: admin.name };
      setSession(sess);
      return sess;
    });
  }

  function logout() {
    ssDel(SESSION_KEY);
  }

  function addStudent(name, band, tone) {
    var clean = String(name || "").replace(/\s+/g, " ").trim().slice(0, 40);
    if (!clean) return null;
    var b = BANDS.indexOf(band) !== -1 ? band : "k2";
    var t = parseInt(tone, 10);
    if (!(t >= 0 && t <= 4)) t = 0;
    var id = nextId(db.students, "s");
    db.students.push({
      id: id,
      name: clean,
      band: b,
      tone: t,
      currentLesson: { id: null, step: 0 }
    });
    save();
    return id;
  }

  function removeStudent(id) {
    for (var i = 0; i < db.students.length; i++) {
      if (db.students[i].id === id) {
        db.students.splice(i, 1);
        if (db.progress[id]) delete db.progress[id];
        save();
        return true;
      }
    }
    return false;
  }

  function setBand(id, band) {
    var st = findStudent(id);
    if (!st || BANDS.indexOf(band) === -1) return false;
    st.band = band;
    save();
    return true;
  }

  function setTone(id, tone) {
    var st = findStudent(id);
    var t = parseInt(tone, 10);
    if (!st || !(t >= 0 && t <= 4)) return false;
    st.tone = t;
    save();
    return true;
  }

  function addTeacher(name, pw) {
    var clean = String(name || "").replace(/\s+/g, " ").trim().slice(0, 40);
    if (!clean) return Promise.reject(new Error("Name is required."));
    for (var i = 0; i < db.users.teachers.length; i++) {
      if (db.users.teachers[i].name === clean) {
        return Promise.reject(new Error("A teacher with that name already exists."));
      }
    }
    if (!pw || String(pw).length < 4) {
      return Promise.reject(new Error("Password needs at least 4 characters."));
    }
    return hashPassword(pw).then(function (rec) {
      var id = nextId(db.users.teachers, "t");
      db.users.teachers.push({ id: id, name: clean, hash: rec.hash, salt: rec.salt });
      save();
      return id;
    });
  }

  function removeTeacher(id) {
    for (var i = 0; i < db.users.teachers.length; i++) {
      if (db.users.teachers[i].id === id) {
        db.users.teachers.splice(i, 1);
        save();
        return true;
      }
    }
    return false;
  }

  function changeOwnPassword(role, id, oldPw, newPw) {
    var rec;
    if (role === "admin") {
      rec = db.users.admin;
    } else if (role === "teacher") {
      rec = findTeacher(id);
    }
    if (!rec) return Promise.reject(new Error("Account not found."));
    if (!newPw || String(newPw).length < 4) {
      return Promise.reject(new Error("New password needs at least 4 characters."));
    }
    return verify(oldPw, rec).then(function (ok) {
      if (!ok) throw new Error("Current password is wrong.");
      return hashPassword(newPw);
    }).then(function (r) {
      rec.hash = r.hash;
      rec.salt = r.salt;
      save();
      return true;
    });
  }

  function getSettings() {
    return clone(db.settings);
  }

  function setSetting(key, val) {
    if (typeof key !== "string" || !key) return false;
    db.settings[key] = val;
    save();
    return true;
  }

  function ensureProgressEntry(sid, lessonId) {
    if (!db.progress[sid] || typeof db.progress[sid] !== "object") db.progress[sid] = {};
    var entry = db.progress[sid][lessonId];
    if (!entry || typeof entry !== "object") {
      entry = { status: "in-progress", step: 0, firstTry: {}, testScore: null, hintsUsed: 0 };
      db.progress[sid][lessonId] = entry;
    }
    return entry;
  }

  function getProgress(sid) {
    var p = db.progress[sid];
    return p ? clone(p) : {};
  }

  function setPointer(sid, lessonId, step) {
    var st = findStudent(sid);
    if (!st || !lessonId) return false;
    var n = parseInt(step, 10);
    if (!(n >= 0)) n = 0;
    var entry = ensureProgressEntry(sid, lessonId);
    entry.status = "in-progress";
    entry.step = n;
    st.currentLesson = { id: lessonId, step: n };
    save();
    return true;
  }

  function recordAnswer(sid, lessonId, taskKey, result) {
    if (!findStudent(sid) || !lessonId || !taskKey) return false;
    var res = result || {};
    var entry = ensureProgressEntry(sid, lessonId);
    if (!Object.prototype.hasOwnProperty.call(entry.firstTry, taskKey)) {
      entry.firstTry[taskKey] = !!res.correct && !res.hintUsed;
    }
    if (res.hintUsed) entry.hintsUsed = (entry.hintsUsed || 0) + 1;
    save();
    return true;
  }

  function completeLesson(sid, lessonId, testScore) {
    if (!findStudent(sid) || !lessonId) return false;
    var entry = ensureProgressEntry(sid, lessonId);
    entry.status = "complete";
    entry.testScore = (typeof testScore === "number" && isFinite(testScore))
      ? Math.max(0, Math.min(100, Math.round(testScore)))
      : null;
    var st = findStudent(sid);
    if (st.currentLesson && st.currentLesson.id === lessonId) {
      st.currentLesson = { id: null, step: 0 };
    }
    save();
    return true;
  }

  function starsFor(testScore) {
    if (typeof testScore !== "number" || !isFinite(testScore)) return 1;
    if (testScore >= 90) return 4;
    if (testScore >= 75) return 3;
    if (testScore >= 50) return 2;
    return 1;
  }

  function addSubmission(sub) {
    var src = sub || {};
    var id = nextId(db.submissions.map(function (s) { return { id: s.sid }; }), "sub");
    var entry = {
      sid: id,
      studentId: String(src.studentId || ""),
      lessonId: String(src.lessonId || ""),
      taskId: String(src.taskId || ""),
      kind: (src.kind === "essay" || src.kind === "scratch" || src.kind === "input") ? src.kind : "input",
      text: String(src.text || "").slice(0, 20000),
      img: String(src.img || "").slice(0, 1500000),
      at: src.at || new Date().toISOString(),
      grade: null
    };
    db.submissions.push(entry);
    save();
    return id;
  }

  function listSubmissions(filter) {
    var f = filter || {};
    var out = [];
    for (var i = 0; i < db.submissions.length; i++) {
      var s = db.submissions[i];
      if (f.studentId && s.studentId !== f.studentId) continue;
      if (f.lessonId && s.lessonId !== f.lessonId) continue;
      if (typeof f.kind === "string" && s.kind !== f.kind) continue;
      if (typeof f.graded === "boolean" && (!!s.grade) !== f.graded) continue;
      out.push(clone(s));
    }
    out.sort(function (a, b) {
      return String(b.at).localeCompare(String(a.at));
    });
    return out;
  }

  function gradeSubmission(sid, score, feedback, by) {
    for (var i = 0; i < db.submissions.length; i++) {
      if (db.submissions[i].sid === sid) {
        var num = parseFloat(score);
        db.submissions[i].grade = {
          score: (isFinite(num) ? Math.max(0, Math.min(100, Math.round(num))) : 0),
          feedback: String(feedback || "").slice(0, 4000),
          by: String(by || "").slice(0, 40)
        };
        save();
        return true;
      }
    }
    return false;
  }

  function exportFile() {
    var payload = JSON.stringify(db, null, 2);
    try {
      var blob = new Blob([payload], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "breakglass-school.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      return true;
    } catch (e) {
      return false;
    }
  }

  function readFileText(file) {
    if (file && typeof file.text === "function") {
      return file.text().catch(function () { throw new Error("Could not read that file."); });
    }
    return new Promise(function (resolve, reject) {
      try {
        var fr = new FileReader();
        fr.onload = function () { resolve(String(fr.result)); };
        fr.onerror = function () { reject(new Error("Could not read that file.")); };
        fr.readAsText(file);
      } catch (e) {
        reject(e);
      }
    });
  }

  function importFile(file, cb) {
    readFileText(file).then(function (text) {
      var parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        throw new Error("That file is not valid JSON.");
      }
      if (!parsed || parsed.app !== "breakglass-school") {
        throw new Error("That is not a BreakGlass school file.");
      }
      db = mergeDefaults(parsed);
      flushNow();
      if (typeof cb === "function") cb(null, clone(db));
    }).catch(function (err) {
      if (typeof cb === "function") cb(err, null);
    });
  }

  function confettiBurst() {
    if (typeof document === "undefined" || !document.body || !document.createElement) return;
    var colors = ["#D97706", "#2F7D4F", "#2C6E9E", "#C77E00", "#B3402F"];
    try {
      var cs = window.getComputedStyle(document.documentElement);
      var picked = [
        cs.getPropertyValue("--accent"),
        cs.getPropertyValue("--ok"),
        cs.getPropertyValue("--info"),
        cs.getPropertyValue("--warn"),
        cs.getPropertyValue("--danger")
      ].map(function (c) { return String(c).trim(); }).filter(Boolean);
      if (picked.length === 5) colors = picked;
    } catch (e) {}
    var holder = document.createElement("div");
    holder.className = "confetti";
    for (var i = 0; i < 40; i++) {
      var piece = document.createElement("i");
      piece.style.left = (Math.random() * 100) + "%";
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (2.2 + Math.random() * 1.8) + "s";
      piece.style.animationDelay = (Math.random() * 0.4) + "s";
      holder.appendChild(piece);
    }
    document.body.appendChild(holder);
    setTimeout(function () {
      if (holder.parentNode) holder.parentNode.removeChild(holder);
    }, 5000);
  }

  function init(cb) {
    db = loadFromStorage();
    flushNow();
    try {
      if (typeof window.addEventListener === "function") {
        var flushOnExit = function () {
          if (saveTimer) {
            clearTimeout(saveTimer);
            saveTimer = null;
            flushNow();
          }
        };
        window.addEventListener("pagehide", flushOnExit);
        window.addEventListener("beforeunload", flushOnExit);
      }
    } catch (e) {}
    if (typeof cb === "function") {
      setTimeout(function () { cb(null, clone(db)); }, 0);
    }
  }

  window.BGSchool = {
    KEYS: {
      db: DB_KEY,
      session: SESSION_KEY,
      setupLater: SETUP_LATER_KEY,
      seenGrades: SEEN_GRADES_KEY
    },
    BANDS: BANDS.slice(),
    BAND_LABELS: clone(BAND_LABELS),
    init: init,
    load: function () { db = loadFromStorage(); return clone(db); },
    save: function () { return flushNow(); },
    data: function () { return db; },
    exportFile: exportFile,
    importFile: importFile,
    getSession: getSession,
    loginStudent: loginStudent,
    loginTeacher: loginTeacher,
    loginAdmin: loginAdmin,
    logout: logout,
    hashPassword: hashPassword,
    verify: verify,
    addStudent: addStudent,
    removeStudent: removeStudent,
    setBand: setBand,
    setTone: setTone,
    addTeacher: addTeacher,
    removeTeacher: removeTeacher,
    changeOwnPassword: changeOwnPassword,
    getSettings: getSettings,
    setSetting: setSetting,
    getProgress: getProgress,
    setPointer: setPointer,
    recordAnswer: recordAnswer,
    completeLesson: completeLesson,
    starsFor: starsFor,
    addSubmission: addSubmission,
    listSubmissions: listSubmissions,
    gradeSubmission: gradeSubmission,
    confettiBurst: confettiBurst
  };
})();
