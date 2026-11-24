(function () {
  "use strict";
  const { LEX, FORMS, SENT, LESSONS, STORIES, PLACEMENT, STAGES, UNITS, PLANNED_STORIES } = window.CONTENT;
  const ART = window.ART;
  const app = document.getElementById("app");
  const overlay = document.getElementById("overlay");

  /* ================= utils ================= */
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = n => String(n).padStart(2, "0");
  const dayKey = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const today = () => dayKey(new Date());
  const addDays = n => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return dayKey(d); };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const withTimeout = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r("__timeout"), ms))]);
  const LADDER = [1, 3, 7, 14, 30, 60];
  const NAMES = { ana: "Ana", paul: "Paul", weber: "Frau Weber", clerk: "Clerk", nar: "" };
  const VOICE_OF = { ana: "f", weber: "w", paul: "m", clerk: "m", nar: "m" };
  const GN = { m: "masculine", f: "feminine", n: "neuter", pl: "plural" };
  const CASES = { nom: "nominative", akk: "accusative", dat: "dative", gen: "genitive" };
  const CASE_HINT = { nom: "the subject: who or what does something", akk: "the direct object: who or what receives the action", dat: "used after in, aus, mit, von and similar words", gen: "possession" };
  const SYM = { m: "■", f: "●", n: "▲", pl: "◆" };
  const ART_G = { der: "m", die: "f", das: "n" };
  const POS_NAME = { verb: "verb", expr: "expression", pron: "pronoun", adv: "adverb", adj: "adjective", prep: "preposition", conj: "connector", qword: "question word", name: "name", title: "title", noun: "noun", art: "article" };

  const ic = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const I = {
    speaker: ic('<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/>'),
    tr: ic('<path d="M3 5h10M8 3v2M5 5c1 4 4 7 7 8M11 5c-1 4-4 7-7 8"/><path d="M13 21l4-9 4 9M14.5 18h5"/>'),
    close: ic('<path d="M6 6l12 12M18 6L6 18"/>'),
    gear: ic('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'),
    today: ic('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>'),
    path: ic('<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h8"/>'),
    story: ic('<path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>'),
    review: ic('<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/>'),
    words: ic('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>'),
    progress: ic('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    test: ic('<path d="M9 3h6l1 3H8z"/><rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 12l2 2 4-4"/>'),
    flag: ic('<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'),
    arrow: ic('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    lock: ic('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    play: ic('<path d="M7 5l12 7-12 7z"/>'),
    steps: ic('<path d="M3 20h5v-5h5v-5h5V5h3"/>'),
    pause: ic('<path d="M8 5v14M16 5v14"/>')
  };
  const sized = (svgStr, px, extra) => svgStr.replace("<svg", `<svg width="${px}" height="${px}" ${extra || ""}`);

  /* ================= parser (word-lens data contract) ================= */
  const ART_CODE = /^([di])\.(m|f|n|pl)\.(nom|akk|dat|gen)$/;
  const TOKEN_RE = /\[([^\]|]+)\|([^\]]+)\]|\{([^}]+)\}|([A-Za-zÀ-ÖØ-öø-ÿ]+)|(\s+)|([^\sA-Za-zÀ-ÖØ-öø-ÿ[{]+)/g;
  function lookupForm(w) { return FORMS[w] || FORMS[w[0].toLowerCase() + w.slice(1)] || FORMS[w.toLowerCase()] || null; }
  function parse(markup) {
    const toks = []; let m; TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(markup))) {
      if (m[1]) toks.push({ k: "w", t: m[1], lex: m[2], feat: "" });
      else if (m[3]) {
        const p = m[3].split("|"), t = p[0], code = p[1] && p[1].match(ART_CODE);
        if (code) toks.push({ k: "w", t, lex: code[1] === "d" ? "der_art" : "ein_art", g: code[2], c: code[3], feat: (code[1] === "d" ? "definite article (the)" : "indefinite article (a/an)") + " · " + GN[code[2]] + " · " + CASES[code[3]] });
        else { const f = lookupForm(t); toks.push({ k: "w", t, lex: p[1] || (f && f[0]), feat: p[2] != null ? p[2] : (f && f[0] === p[1] ? f[1] : "") }); }
      } else if (m[4]) { const f = lookupForm(m[4]); toks.push({ k: "w", t: m[4], lex: f ? f[0] : null, feat: f ? f[1] : "" }); }
      else if (m[5]) toks.push({ k: "s", t: m[5] });
      else toks.push({ k: "p", t: m[6] });
    }
    return toks;
  }
  const plain = markup => parse(markup).map(t => t.t).join("").replace(/\s+/g, " ").trim();
  const LEXIDX = {};
  for (const [sid, s] of Object.entries(SENT)) for (const t of parse(s.de)) if (t.lex) (LEXIDX[t.lex] = LEXIDX[t.lex] || []).push(sid);
  // the form as said on its own (must match the audio generator)
  function surfaceForm(t, lex) {
    const L = LEX[lex];
    const keep = L && (L.pos === "noun" || L.pos === "name" || L.pos === "title" || lex === "sie_formal" || lex === "entschuldigung" || (L.pos === "expr" && /^[A-ZÄÖÜ]/.test(L.de) && t.includes(" ")));
    return keep ? t : t.charAt(0).toLowerCase() + t.slice(1);
  }
  const headword = L => L.pos === "noun" ? `${L.art} ${L.de}` : L.de;

  function renderDE(markup, sid, opts) {
    opts = opts || {};
    return parse(markup).map(t => {
      if (t.k !== "w") return esc(t.t);
      const g = t.g ? " g-" + t.g : "";
      if (opts.plain || !t.lex) return `<span class="${g.trim()}">${esc(t.t)}</span>`;
      return `<span class="w${g}" tabindex="0" role="button" data-lex="${esc(t.lex)}" data-feat="${esc(t.feat)}" data-g="${esc(t.g || "")}" data-c="${esc(t.c || "")}" data-sid="${esc(sid || "")}">${esc(t.t)}</span>`;
    }).join("");
  }
  function artBadge(art, g) { g = g || ART_G[art]; return `<span class="artb g-${g}" title="${GN[g]}"><span class="sym" aria-hidden="true">${SYM[g]}</span>${esc(art)}</span>`; }
  function lexLabel(id) { const L = LEX[id]; return L.pos === "noun" ? `${artBadge(L.art)} ${esc(L.de)}` : esc(L.de); }

  /* ================= audio: recorded clips first, device voice as fallback ================= */
  const Voice = {
    man: {}, el: null, tts: null, token: 0, voices: [], done: null, raf: 0,
    async init() {
      if ("speechSynthesis" in window) {
        const load = () => { this.voices = speechSynthesis.getVoices().filter(v => /^de([-_]|$)/i.test(v.lang)); };
        load(); try { speechSynthesis.addEventListener("voiceschanged", load); } catch (e) { /* old browser */ }
      }
      try { const r = await fetch("audio.json"); if (r.ok) this.man = await r.json(); } catch (e) { this.man = {}; }
    },
    clipFor(text, sp) {
      const t = text.replace(/\s+/g, " ").trim(), v = VOICE_OF[sp] || "m";
      for (const k of [v, "m", "f", "w"]) if (this.man[k + "|" + t]) return { key: k + "|" + t, file: this.man[k + "|" + t] };
      return null;
    },
    rate(o) {
      const base = Number(state.data && state.data.settings.speed) || 1;
      if (o.slow) return 0.72; if (o.fast) return Math.min(1.5, base * 1.15); return base;
    },
    stop() {
      this.token++;
      cancelAnimationFrame(this.raf);
      if (this.el) { try { this.el.pause(); } catch (e) { /* ignore */ } }
      if ("speechSynthesis" in window) try { speechSynthesis.cancel(); } catch (e) { /* ignore */ }
      if (this.tts && this.tts.active && this.tts.active()) this.tts.stop().catch(() => {});
      if (this.done) { const d = this.done; this.done = null; d(); }
      document.querySelectorAll(".w.on").forEach(e => e.classList.remove("on"));
      document.querySelectorAll(".line.playing").forEach(e => e.classList.remove("playing"));
    },
    say(markup, o) {
      o = o || {};
      const text = plain(markup).replace(/_{2,}/g, " … ");
      const engine = state.data ? state.data.settings.engine : "recorded";
      if (engine === "claude" && this.tts) {
        const voice = { ana: "airy", paul: "rounded", weber: "glassy", clerk: "rounded" }[o.sp] || "buttery";
        return this.tts.speak(text, { language: "de", rate: this.rate(o), voice }).catch(e => { if (e && e.code === "not_granted") toast("Claude voice is turned off for this page. Choose another voice in Settings."); });
      }
      const clip = engine !== "device" ? this.clipFor(text, o.sp) : null;
      State.lastAudio = clip ? clip.file : "device: " + text;
      if (clip) return this.playClip(clip.file, markup, o);
      return this.device(text, o);
    },
    playClip(file, markup, o) {
      if (!this.el) { this.el = new Audio(); this.el.preload = "auto"; }
      const el = this.el, words = o.el ? [...o.el.querySelectorAll(".w")] : [];
      const weights = []; let total = 0;
      for (const t of parse(markup)) if (t.k === "w" && t.lex) { weights.push([total, total + t.t.length + 1]); total += t.t.length + 1; }
      return new Promise(resolve => {
        const my = this.token;
        const finish = () => { cancelAnimationFrame(this.raf); words.forEach(w => w.classList.remove("on")); if (this.done === finish) this.done = null; el.onended = el.onerror = null; resolve(); };
        this.done = finish;
        el.onended = finish;
        el.onerror = finish;
        el.src = "a/" + file;
        try { el.preservesPitch = true; } catch (e) { /* ignore */ }
        el.playbackRate = this.rate(o); el.defaultPlaybackRate = el.playbackRate;
        const tick = () => {
          if (my !== this.token) return;
          if (words.length && el.duration) {
            const f = (el.currentTime - 0.17) / Math.max(0.2, el.duration - 0.4), pos = f * total;
            const idx = f < 0 || f > 1 ? -1 : weights.findIndex(([a, b]) => pos >= a && pos < b);
            words.forEach((w, i) => w.classList.toggle("on", i === idx));
          }
          this.raf = requestAnimationFrame(tick);
        };
        const p = el.play();
        if (p && p.catch) p.catch(() => finish());
        this.raf = requestAnimationFrame(tick);
      });
    },
    device(text, o) {
      if (!("speechSynthesis" in window) || !this.voices.length) { noVoiceToast(); return Promise.resolve(); }
      return new Promise(resolve => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "de-DE"; u.voice = this.voices.find(v => /de-DE/i.test(v.lang)) || this.voices[0]; u.rate = this.rate(o) * 0.92;
        const finish = () => { if (this.done === finish) this.done = null; resolve(); };
        this.done = finish; u.onend = finish; u.onerror = finish;
        try { speechSynthesis.speak(u); } catch (e) { finish(); }
      });
    },
    async seq(items) {
      this.stop();
      const my = ++this.token;
      for (const it of items) {
        if (my !== this.token) return;
        if (it.line) it.line.classList.add("playing");
        await this.say(it.markup, it);
        if (it.line) it.line.classList.remove("playing");
        if (my !== this.token) return;
        await new Promise(r => setTimeout(r, 220));
      }
    }
  };
  let noVoiceShown = false;
  function noVoiceToast() { if (noVoiceShown) return; noVoiceShown = true; toast("No audio for this text on this device."); }
  function sayOne(markup, sp, el, extra) { Voice.seq([Object.assign({ markup, sp, el }, extra || {})]); }
  function sayLines(container) {
    Voice.seq([...container.querySelectorAll(".line[data-line]")].map(line => {
      const s = SENT[line.dataset.line];
      return { markup: s.de, sp: s.sp, line, el: line.querySelector(".de"), fast: line.dataset.fast === "1", slow: line.dataset.slow === "1" };
    }));
  }

  /* ================= storage (db capability, local fallback) ================= */
  const PROFILE_IDS = ["p1", "p2"];
  const DEFAULT_NAMES = { p1: "Eu", p2: "Esposa" };
  const COLORS = { p1: "#1F5F8B", p2: "#A8436F" };
  function freshProfile(id) {
    return {
      v: 2, id, name: DEFAULT_NAMES[id], updated: 0,
      settings: { gloss: "both", speed: "1", goal: 40, engine: "recorded", symbols: false },
      lessons: {}, stories: {}, cards: {}, daily: {}, art: { m: [0, 0], f: [0, 0], n: [0, 0], pl: [0, 0] },
      lookups: {}, saved: [], placement: null, plDraft: null, reports: [], log: [], penal: {}
    };
  }
  function normalize(id, d) {
    const base = freshProfile(id);
    if (!d || typeof d !== "object") return base;
    const out = Object.assign(base, JSON.parse(JSON.stringify(d)));
    out.settings = Object.assign(freshProfile(id).settings, out.settings || {});
    if (out.settings.speed === "normal") out.settings.speed = "1";
    if (out.settings.speed === "slow") out.settings.speed = "0.75";
    if (!d.v || d.v < 2) out.settings.engine = "recorded";
    out.art = Object.assign(freshProfile(id).art, out.art || {});
    out.v = 2;
    return out;
  }
  const Store = {
    db: null, mode: "local", busy: false, again: false, timer: null, status: "", inited: false,
    async init() {
      if (this.inited) return; this.inited = true;
      try {
        if (window.claude && typeof window.claude.use === "function") {
          const r = await withTimeout(window.claude.use("db"), 10000);
          this.db = r && r !== "__timeout" ? r : null;
          const t = await withTimeout(window.claude.use("tts"), 6000);
          Voice.tts = t && t !== "__timeout" ? t : null;
        }
      } catch (e) { this.db = null; }
      this.mode = this.db ? "cloud" : "local";
    },
    readLocal(id) { try { const s = localStorage.getItem("dss-" + id); return s ? JSON.parse(s) : null; } catch (e) { return null; } },
    writeLocal(id, d) { try { localStorage.setItem("dss-" + id, JSON.stringify(d)); } catch (e) { /* storage blocked */ } },
    async load(id) {
      const local = this.readLocal(id);
      let cloud = null;
      if (this.db) {
        try {
          const snap = await withTimeout(this.db.doc("profiles/" + id).get(), 10000);
          if (snap === "__timeout") this.status = "Cloud not reachable. Saving on this device.";
          else if (snap && snap.exists) cloud = snap.data();
        } catch (e) { this.status = "Cloud not reachable. Saving on this device."; }
      }
      const pick = (cloud && local) ? ((local.updated || 0) > (cloud.updated || 0) ? local : cloud) : (cloud || local);
      return normalize(id, pick);
    },
    save() {
      if (!state.data) return;
      state.data.updated = Date.now();
      this.writeLocal(state.pid, state.data);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.flush(), 1500);
    },
    async flush() {
      if (!this.db || !state.data) return;
      if (this.busy) { this.again = true; return; }
      this.busy = true;
      try {
        if (state.data.log.length > 400) state.data.log = state.data.log.slice(-400);
        await this.db.doc("profiles/" + state.pid).set(JSON.parse(JSON.stringify(state.data)));
        this.status = "";
      } catch (e) {
        this.status = e && e.code === "invalid_argument" ? "Cloud save not allowed for this viewer. Saving on this device." : "Cloud save failed. Saved on this device; will retry.";
      }
      this.busy = false;
      if (this.again) { this.again = false; this.flush(); }
      document.querySelectorAll(".sync").forEach(el => { el.textContent = syncText(); });
    }
  };
  function syncText() { return Store.status || (Store.mode === "cloud" ? "Saved to the cloud · works on any device" : "Saved on this device"); }

  /* ================= state ================= */
  const state = { pid: null, data: null, view: "picker", profiles: {}, loading: true, filter: "all", stage: "A1.1", unit: null };
  const State = { lastAudio: "" };
  const P = { cur: null };

  function dayRec(k) { const d = state.data.daily; k = k || today(); return d[k] = d[k] || { ms: 0, nw: 0, rv: 0, ok: 0, bad: 0 }; }
  let lastAct = 0;
  function activity() {
    if (!state.data || state.view === "picker") return;
    const now = Date.now();
    if (lastAct && now - lastAct < 90000) { dayRec().ms += now - lastAct; Store.save(); }
    lastAct = now;
  }
  function log(id, ok, help, ms) { state.data.log.push([Date.now(), id, ok ? 1 : 0, help ? 1 : 0, ms || 0]); }
  function glossOf(L) { const g = state.data ? state.data.settings.gloss : "both"; return g === "en" ? [["EN", L.en]] : g === "pt" ? [["PT", L.pt]] : [["EN", L.en], ["PT", L.pt]]; }
  function glossLine(L) { return glossOf(L).map(x => x[1]).join(" · "); }
  function trOf(s) { const g = state.data ? state.data.settings.gloss : "both"; return (g === "pt" ? [s.pt] : g === "en" ? [s.en] : [s.en, s.pt]).map(t => `<div class="tr">${esc(t)}</div>`).join(""); }
  function dueCount() { const t = today(); return Object.values(state.data.cards).filter(c => c.d <= t).length; }
  function introducedLex() { const seen = new Set(); for (const k of Object.keys(state.data.cards)) seen.add(k.split("|")[0]); return [...seen].filter(l => LEX[l]); }
  function strength(lex) { const cs = Object.entries(state.data.cards).filter(([k]) => k.startsWith(lex + "|")).map(([, c]) => c.s); return cs.length ? Math.round(cs.reduce((a, b) => a + b, 0) / cs.length) : 0; }
  function studiedOn(k) { const r = state.data.daily[k]; return !!(r && r.ms >= 60000); }
  function streak() { let n = 0; const d = new Date(); if (!studiedOn(dayKey(d))) d.setDate(d.getDate() - 1); while (studiedOn(dayKey(d))) { n++; d.setDate(d.getDate() - 1); } return n; }
  function skillsFor(lex) { const L = LEX[lex]; if (L.pos === "noun") return L.img ? ["mean", "art", "aud"] : ["mean", "art"]; if (L.pos === "name") return ["mean"]; return ["mean", "aud"]; }
  function addCards(lexes, seed) {
    let n = 0;
    for (const lex of lexes) for (const sk of skillsFor(lex)) {
      const id = lex + "|" + sk;
      if (!state.data.cards[id]) { state.data.cards[id] = seed ? { s: 1, d: addDays(3), r: 0, l: 0, seed: 1 } : { s: 0, d: addDays(1), r: 0, l: 0 }; n++; }
    }
    return n;
  }
  function grade(id, ok, help) {
    const c = state.data.cards[id]; if (!c) return;
    c.r++;
    if (ok && !help) { c.s = Math.min(c.s + 1, LADDER.length - 1); c.d = addDays(LADDER[c.s]); }
    else if (ok) c.d = addDays(LADDER[c.s]);
    else { c.s = Math.max(0, c.s - 2); c.l++; c.d = addDays(1); }
    delete c.seed;
  }
  function artStat(g, ok) { const a = state.data.art[g]; if (a) a[ok ? 0 : 1]++; }
  function lessonDone(id) { return !!(state.data.lessons[id] || {}).done; }
  function nextLesson() { return LESSONS.find(l => !lessonDone(l.id)); }
  function storyOpen(st) { return lessonDone(st.unlockAfter); }
  function unitLessons(u) { return LESSONS.filter(l => l.unit === u); }
  function unitPct(u) {
    const lex = [...new Set(unitLessons(u).flatMap(l => l.newLex))]; if (!lex.length) return 0;
    return Math.round(100 * lex.reduce((a, l) => a + (state.data.cards[l + "|mean"] ? Math.min(strength(l), 3) / 3 : 0), 0) / lex.length);
  }

  /* ================= toast ================= */
  let toastT = null;
  function toast(msg) {
    let el = document.querySelector(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 3600);
  }

  /* ================= word lens ================= */
  let lensCtx = null;
  function openLens(ctx) {
    lensCtx = Object.assign({ ex: 0 }, ctx);
    const L = LEX[ctx.lex];
    if (state.data && L && ctx.fromContent) {
      state.data.lookups[ctx.lex] = (state.data.lookups[ctx.lex] || 0) + 1;
      if (P.cur && P.cur.q && !P.cur.answered) P.cur.help = true;
      const pk = today() + ":" + ctx.lex;
      if (!state.data.penal[pk] && !(P.cur && P.cur.kind === "lesson")) {
        for (const [k, c] of Object.entries(state.data.cards)) if (k.startsWith(ctx.lex + "|") && c.s >= 1) { c.s -= 1; c.d = addDays(1); }
        const t0 = today(), pen = {}; for (const k of Object.keys(state.data.penal)) if (k.startsWith(t0)) pen[k] = 1;
        pen[pk] = 1; state.data.penal = pen;
      }
      Store.save();
    }
    renderLens();
    if (L) sayOne(ctx.surface && ctx.fromContent && L.pos !== "art" ? surfaceForm(ctx.surface, ctx.lex) : L.pos === "art" ? ctx.surface.toLowerCase() : headword(L), "nar");
  }
  function examplesFor(ctx) {
    const list = (LEXIDX[ctx.lex] || []).filter(s => s !== ctx.sid), seen = new Set(), out = [];
    for (const s of list) { const p = plain(SENT[s].de); if (!seen.has(p)) { seen.add(p); out.push(s); } }
    return out.sort((a, b) => plain(SENT[a].de).length - plain(SENT[b].de).length);
  }
  const hearBtn = (text, label) => `<button class="hear" data-act="hear" data-t="${esc(text)}"><span class="ic">${I.speaker}</span><span lang="de">${label || esc(text)}</span></button>`;
  function renderLens() {
    const ctx = lensCtx, L = LEX[ctx.lex];
    if (!L) { overlay.innerHTML = sheet(`<div class="lemma">${esc(ctx.surface || "?")}</div><p>Not in the dictionary yet.</p>`); return; }
    const surf = ctx.surface ? (L.pos === "art" ? ctx.surface.toLowerCase() : surfaceForm(ctx.surface, ctx.lex)) : "";
    let head;
    if (L.pos === "noun") head = `<div class="lemma" lang="de">${artBadge(L.art)} ${esc(L.de)}</div><div class="muted">noun · ${GN[ART_G[L.art]]}</div>`;
    else if (L.pos === "art") head = `<div class="lemma" lang="de">${ctx.g ? `<span class="g-${ctx.g}">${esc(surf)}</span>` : esc(surf)}</div><div class="muted">article · ${esc(L.de)}</div>`;
    else head = `<div class="lemma" lang="de">${esc(L.de)}</div><div class="muted">${esc(POS_NAME[L.pos] || "")}</div>`;
    // hear: the exact form from the sentence, then the dictionary form(s)
    const hears = [];
    if (L.pos === "art") hears.push(hearBtn(surf));
    else {
      if (surf && surf.toLowerCase() !== headword(L).toLowerCase() && surf.toLowerCase() !== L.de.toLowerCase()) hears.push(hearBtn(surf, `${esc(surf)} <span class="muted tiny">as in the sentence</span>`));
      hears.push(hearBtn(headword(L), L.pos === "noun" ? `${artBadge(L.art)} ${esc(L.de)}` : ""));
      if (L.pos === "noun") hears.push(hearBtn("die " + L.pl, `${artBadge("die", "pl")} ${esc(L.pl)} <span class="muted tiny">plural</span>`));
    }
    let info = `<div class="row">${hears.join("")}</div>`;
    if (ctx.feat) info += `<div class="feat"><span><b>${ctx.sid || ctx.inline ? "In this sentence" : "Form"}:</b> ${esc(ctx.surface)} = ${esc(ctx.feat)}</span>${ctx.c ? `<span class="muted small">${esc(CASES[ctx.c])}: ${esc(CASE_HINT[ctx.c])}</span>` : ""}</div>`;
    info += `<div class="gloss">${glossOf(L).map(([k, v]) => `<div><span>${k}</span><span>${esc(v)}</span></div>`).join("")}</div>`;
    if (L.conj) info += `<div class="small"><b>Present tense:</b> <span lang="de">${esc(L.conj)}</span></div>`;
    if (L.note) info += `<div class="small muted">${esc(L.note)}</div>`;
    const exs = examplesFor(ctx);
    let exHtml = "";
    if (exs.length) {
      const sid = exs[ctx.ex % exs.length], s = SENT[sid];
      exHtml = `<div class="example"><div class="spread"><span class="eyebrow">Another example</span>${exs.length > 1 ? `<button class="linkbtn" data-act="lens-next">Next example</button>` : ""}</div>
        <div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div class="de" style="flex:1" id="lensEx" lang="de">${renderDE(s.de, sid)}</div><button class="iconbtn sm" data-act="lens-say-ex" data-sid="${sid}" aria-label="Play example">${I.speaker}</button></div>
        <details><summary class="small muted">Translation</summary>${trOf(s)}</details></div>`;
    }
    const saved = state.data && state.data.saved.includes(ctx.lex);
    const sentTr = ctx.sid && SENT[ctx.sid] ? `<details><summary class="small muted">Translate the whole sentence</summary>${trOf(SENT[ctx.sid])}</details>` : "";
    overlay.innerHTML = sheet(`<div class="spread" style="align-items:flex-start;flex-wrap:nowrap"><div class="stack-s">${head}</div><button class="iconbtn" data-act="lens-close" aria-label="Close">${I.close}</button></div>
      ${info}${exHtml}${sentTr}
      <div class="row"><button class="btn ghost" data-act="lens-save">${saved ? "Saved ✓" : "Save to My words"}</button><button class="linkbtn" data-act="report">Report a problem</button></div>`);
  }
  function sheet(inner) { return `<div class="sheet-back" data-act="lens-close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="in"><span class="grip"></span>${inner}</div></div>`; }
  function closeSheet() { overlay.innerHTML = ""; lensCtx = null; }

  /* ================= report a problem (context attached) ================= */
  function reportContext() {
    const c = P.cur, ctx = { view: state.view, audio: State.lastAudio, speed: state.data.settings.speed };
    if (c && c.kind === "lesson") Object.assign(ctx, { lesson: c.L.id, step: c.i + 1 });
    if (c && c.kind === "story") Object.assign(ctx, { story: c.story.id, phase: c.phase, question: c.qi + 1 });
    if (c && c.kind === "review") Object.assign(ctx, { card: c.queue[c.i] });
    if (c && c.kind === "placement" && c.items) Object.assign(ctx, { placement: (c.items[c.i] || {}).id });
    if (lensCtx) Object.assign(ctx, { word: lensCtx.lex, sentence: lensCtx.sid || "" });
    return ctx;
  }
  function openReport() {
    const ctx = reportContext();
    overlay.innerHTML = sheet(`<div class="spread"><h2>Report a problem</h2><button class="iconbtn" data-act="lens-close" aria-label="Close">${I.close}</button></div>
      <p class="muted small">Wrong translation, audio cut off, a mistake in the German? Describe it in a few words. The screen and audio details are attached.</p>
      <label class="field" for="rp">What is wrong?<textarea id="rp" class="plain" placeholder="e.g. the audio cuts the first word"></textarea></label>
      <div class="feat tiny">${Object.entries(ctx).filter(([, v]) => v !== "" && v != null).map(([k, v]) => `<span><b>${esc(k)}:</b> ${esc(v)}</span>`).join("")}</div>
      <button class="btn accent" data-act="report-save">Save report</button>`);
    overlay.dataset.ctx = JSON.stringify(ctx);
    setTimeout(() => { const t = document.getElementById("rp"); if (t) t.focus(); }, 30);
  }

  /* ================= shell ================= */
  function avatar(id, name) { return `<span class="avatar" style="background:${COLORS[id]}">${esc((name || "?").trim().charAt(0).toUpperCase())}</span>`; }
  const brand = `<span class="brand"><span class="mark">${I.steps}</span><span>Schritt für Schritt<small>Deutsch · A1 → A2</small></span></span>`;
  const NAV = [["today", "Today", I.today], ["path", "Learning path", I.path], ["stories", "Stories", I.story], ["words", "My words", I.words]];
  const NAV2 = [["review", "Review", I.review], ["placement-view", "Placement test", I.test], ["progress", "Progress", I.progress]];
  const TABS = [["today", "Today", I.today], ["path", "Path", I.path], ["review", "Review", I.review], ["words", "Words", I.words], ["progress", "Progress", I.progress]];
  function navActive(v) { return v === "unit" ? "path" : v; }
  function shell(inner) {
    const due = dueCount(), act = navActive(state.view);
    const navBtn = ([v, label, icon]) => `<button data-act="go" data-v="${v}" ${act === v ? 'aria-current="page"' : ""}>${icon}<span>${label}</span>${v === "review" && due ? `<span class="badge" style="margin-left:auto">${due}</span>` : ""}</button>`;
    return `<div class="shell">
      <aside class="side" aria-label="Sidebar">${brand}
        <nav aria-label="Main"><div class="group">Learn</div>${NAV.map(navBtn).join("")}<div class="group">Practice</div>${NAV2.map(navBtn).join("")}</nav>
        <div class="foot"><nav>${navBtn(["settings", "Settings", I.gear])}</nav>
          <button class="who-chip" data-act="switch" aria-label="Switch profile" style="display:inline-flex">${avatar(state.pid, state.data.name)}<span style="text-align:left">${esc(state.data.name)}<br><span class="tiny muted" style="font-weight:400">Switch profile</span></span></button></div>
      </aside>
      <div style="min-width:0"><div class="page">
        <div class="topbar">${brand}<span></span><div class="row" style="flex-wrap:nowrap"><button class="who-chip" data-act="switch" aria-label="Switch profile">${avatar(state.pid, state.data.name)}${esc(state.data.name)}</button>
          <button class="iconbtn" data-act="go" data-v="settings" aria-label="Settings">${I.gear}</button></div></div>
        ${inner}
      </div></div>
      <nav class="tabs" aria-label="Main"><div class="in">${TABS.map(([v, label, icon]) => `<button data-act="go" data-v="${v}" ${act === v ? 'aria-current="page"' : ""}>${icon}<span>${label}${v === "review" && due ? ` <span class="badge">${due}</span>` : ""}</span></button>`).join("")}</div></nav>
    </div>`;
  }
  function render() {
    Voice.stop();
    document.body.classList.toggle("symbols", !!(state.data && state.data.settings.symbols));
    const v = state.view;
    if (v === "picker") return renderPicker();
    if (v === "player") return renderPlayer();
    const fn = { today: viewToday, path: viewPath, unit: viewUnit, stories: viewStories, review: viewReview, words: viewWords, progress: viewProgress, settings: viewSettings, "placement-view": viewPlacementHome }[v];
    app.innerHTML = shell(fn());
    window.scrollTo(0, 0);
  }

  /* ================= picker ================= */
  function timeKind() { const h = new Date().getHours(); return h < 11 ? "morning" : h < 17 ? "day" : h < 22 ? "evening" : "night"; }
  function greeting() { return { morning: "Guten Morgen", day: "Guten Tag", evening: "Guten Abend", night: "Guten Abend" }[timeKind()]; }
  function renderPicker() {
    const cards = PROFILE_IDS.map(id => {
      const p = state.profiles[id], name = p ? p.name : DEFAULT_NAMES[id];
      const words = p ? new Set(Object.keys(p.cards).map(k => k.split("|")[0])).size : 0;
      return `<button class="pcard" data-act="pick" data-id="${id}">${avatar(id, name)}<span><span class="nm">${esc(name)}</span>
        <span class="muted small">${state.loading && !p ? "Loading…" : words ? `${words} words, ${Object.keys(p.lessons).length} lessons` : "Not started yet"}</span></span>${sized(I.arrow, 22)}</button>`;
    }).join("");
    app.innerHTML = `<div class="picker"><div class="street" aria-hidden="true">${ART.street(timeKind())}${brand}</div>
      <div class="in"><div class="ask"><div class="stack-s"><h1 lang="de">Wer lernt heute?</h1><p class="muted">Who's studying today? Tap your name. No password needed.</p></div>
      <div class="profiles">${cards}</div></div><p class="sync">${state.loading ? "Connecting…" : esc(syncText())}</p></div></div>`;
  }
  async function pickProfile(id) {
    state.pid = id;
    state.data = state.profiles[id] || await Store.load(id);
    state.profiles[id] = state.data;
    state.view = "today"; lastAct = Date.now();
    render();
  }

  /* ================= today ================= */
  function ring(frac, onDark) {
    const r = 21, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, frac));
    return `<svg class="ring" viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="${r}" fill="none" stroke="${onDark ? "rgba(255,255,255,.22)" : "var(--card-2)"}" stroke-width="7"/>
      ${f > 0 ? `<circle cx="27" cy="27" r="${r}" fill="none" stroke="${f >= 1 ? "var(--ok)" : "var(--signal)"}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(c * f).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 27 27)"/>` : ""}</svg>`;
  }
  function weekBars() {
    const d = new Date(), dow = (d.getDay() + 6) % 7, monday = new Date(d); monday.setDate(d.getDate() - dow);
    return `<div class="week" aria-label="This week">${["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((n, i) => { const x = new Date(monday); x.setDate(monday.getDate() + i); const k = dayKey(x), m = Math.round(((state.data.daily[k] || {}).ms || 0) / 60000); return `<span lang="de" title="${m} min">${n}<i class="${studiedOn(k) ? "on" : ""} ${i === dow ? "today" : ""}"></i></span>`; }).join("")}</div>`;
  }
  function unitDone(u) { const ls = unitLessons(u); return ls.length > 0 && ls.every(l => lessonDone(l.id)); }
  function curUnit() { const nl = nextLesson(); return nl ? nl.unit : "U03"; }
  function nextCard(g, gl, label, title, meta, actions) {
    return `<div class="next"><span class="gleis">${esc(g)}<small>${gl}</small></span><div class="stack-s"><span class="eyebrow">${esc(label)}</span><h2 lang="de">${esc(title)}</h2><span class="muted small">${esc(meta)}</span></div><div class="act">${actions}</div></div>`;
  }
  function heroHTML() {
    const d = state.data, min = Math.round(dayRec().ms / 60000), goal = d.settings.goal, nl = nextLesson();
    let next;
    if (d.plDraft && !d.placement) next = nextCard("?", "test", "Placement test paused", "Weitermachen", `${d.plDraft.answers.length} answers saved. Continue where you stopped.`, `<button class="btn accent" data-act="pl-resume">Resume the test</button>`);
    else if (!d.placement) next = nextCard("?", "test", "Start here", "Wo fange ich an?", "A short test shows where you should begin. It takes 5 to 10 minutes.", `<button class="btn accent" data-act="placement">Take the placement test</button><button class="linkbtn" data-act="skip-placement">Skip and start with unit 1</button>`);
    else if (nl) { const ls = unitLessons(nl.unit); next = nextCard(nl.unit.slice(1), "unit", `Next lesson in ${UNITS[nl.unit].title}`, nl.title, `${nl.sub}. Lesson ${ls.indexOf(nl) + 1} of ${ls.length}, about 3 minutes.`, `<button class="btn accent" data-act="lesson" data-id="${nl.id}">Start the lesson ${I.arrow}</button>`); }
    else next = nextCard("✓", "done", "Units 1 and 2 complete", "Sehr gut!", "New units are being written. Keep your words fresh with a review.", `<button class="btn accent" data-act="review">Start a review</button>`);
    return `<section class="hero"><div class="bg" aria-hidden="true">${ART.street(timeKind())}</div>
      <div class="goal" aria-label="${min} of ${goal} minutes today">${ring(min / goal, true)}<div><b>${min}<span style="font-size:1rem;opacity:.75"> / ${goal}</span></b><span>minutes today</span></div></div>
      <div class="in"><span class="when">${esc(new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }))}</span><h1 lang="de">${greeting()}, ${esc(d.name)}!</h1>${next}</div></section>`;
  }
  function linieHTML() {
    const cur = curUnit(), sg = STAGES.find(s => s.units.includes(cur)) || STAGES[0], done = sg.units.filter(unitDone).length;
    return `<section class="linie" aria-label="Your line"><div class="head"><h3>${esc(sg.title.split("· ")[1] || sg.title)}</h3><span class="linebadge"><i>${sg.id}</i><span class="small" style="color:var(--night-muted)">${done} of ${sg.units.length} stations</span></span></div>
      <div class="track"><ol>${sg.units.map(u => {
        const ready = unitLessons(u).length > 0, cls = unitDone(u) ? "done" : u === cur ? "cur" : "";
        const inner = `<span class="dotx"></span><b>${u.slice(1)}</b><span>${esc(UNITS[u].title)}</span>`;
        return `<li class="${cls} ${ready ? "ready" : ""}">${u === cur ? `<span class="tramtag">You</span>` : ""}${ready ? `<button data-act="unit" data-u="${u}" aria-label="Unit ${u.slice(1)}">${inner}</button>` : inner}</li>`;
      }).join("")}</ol></div></section>`;
  }
  function unitCards(units) {
    return `<div class="units">${units.map(u => {
      const ls = unitLessons(u), done = ls.filter(l => lessonDone(l.id)).length, U = UNITS[u];
      return `<button class="ucard" data-act="unit" data-u="${u}"><div class="cover" aria-hidden="true">${ART[U.cover]()}<span class="num">${u.slice(1)}</span></div><div class="body"><h3>${esc(U.title)}</h3>
        <span class="muted small">${esc(U.sub)}</span><div class="bar-s" aria-label="${done} of ${ls.length} lessons"><i style="width:${Math.round(100 * done / ls.length)}%"></i></div><span class="tiny muted">${done} of ${ls.length} lessons done</span></div></button>`;
    }).join("")}</div>`;
  }
  function storyCard(st) {
    const open = storyOpen(st), done = (state.data.stories[st.id] || {}).done;
    return `<button class="story-tile" data-act="story" data-id="${st.id}" ${open ? "" : "disabled"}>
      <div class="cover" aria-hidden="true">${ART.knock()}</div><div class="body"><span class="eyebrow">Story for unit ${st.unit.slice(1)}</span><h2 lang="de">${esc(st.title)}</h2>
      <span class="muted">${esc(st.sub)}. Listen first, then read with the text.</span><span class="chip" style="justify-self:start">${done ? "Read ✓" : open ? "Ready to read" : "Opens after lesson 4"}</span></div></button>`;
  }
  function viewToday() {
    const d = state.data, due = dueCount(), nCards = Object.keys(d.cards).length;
    const main = `<div class="stack" style="gap:26px">${linieHTML()}
      <div class="spread"><h2>Your units</h2><button class="linkbtn" data-act="go" data-v="path">See the whole line</button></div>${unitCards(["U01", "U02"])}
      <div class="spread"><h2>Story</h2><button class="linkbtn" data-act="go" data-v="stories">All stories</button></div>${storyCard(STORIES[0])}</div>`;
    const side = `<aside class="panel" aria-label="Today">
      <header class="pagehead"><h3>This week</h3><span class="muted small">${streak()} day${streak() === 1 ? "" : "s"} in a row. A green bar means at least one minute studied.</span></header>
      <div class="sec">${weekBars()}</div>
      <button class="listrow" data-act="review" ${nCards ? "" : "disabled"}><span class="ico">${I.review}</span><span><b>Spaced review</b><br><span class="small muted">${due ? `${due} cards due today` : nCards ? "Nothing due, practise anyway" : "Finish a lesson first"}</span></span>${due ? `<span class="badge">${due}</span>` : "<span></span>"}</button>
      <button class="listrow" data-act="go" data-v="words"><span class="ico">${I.words}</span><span><b>My words</b><br><span class="small muted">${introducedLex().length} words, ${d.saved.length} saved</span></span><span></span></button>
      <button class="listrow" data-act="go" data-v="placement-view"><span class="ico">${I.test}</span><span><b>Placement test</b><br><span class="small muted">${d.placement ? `Your start: unit ${d.placement.start.slice(1)}` : d.plDraft ? "Paused, resume any time" : "Not taken yet"}</span></span><span></span></button>
      <button class="listrow" data-act="go" data-v="progress"><span class="ico">${I.progress}</span><span><b>Progress</b><br><span class="small muted">${Math.round(Object.values(d.daily).reduce((a, r) => a + (r.ms || 0), 0) / 60000)} minutes so far</span></span><span></span></button>
      <div class="sec"><p class="sync">${esc(syncText())}</p></div></aside>`;
    return `${heroHTML()}<div class="dash">${main}${side}</div>`;
  }

  /* ================= path, unit, stories ================= */
  function viewPath() {
    const sg = STAGES.find(s => s.id === state.stage) || STAGES[0], start = state.data.placement ? state.data.placement.start : "U01", cur = curUnit();
    return `<header class="pagehead"><h1>Your line from A1 to A2</h1><p class="muted">33 stations in 4 stages, each one a real situation. Units 1 and 2 are open; the next ones are being built.</p></header>
      <div class="stage-tabs" role="group" aria-label="Stage">${STAGES.map(s => `<button data-act="stage" data-s="${s.id}" aria-pressed="${s.id === sg.id}">${s.id} ${esc(s.title.split("· ")[1] || "")}</button>`).join("")}</div>
      <div class="map">${sg.units.map(u => {
        const ls = unitLessons(u), U = UNITS[u], ready = ls.length > 0, done = ls.filter(l => lessonDone(l.id)).length;
        const cls = unitDone(u) ? "done" : u === cur ? "cur" : ready ? "" : "locked";
        const flags = `${u === start ? `<span class="startflag">Your start</span>` : ""}${u === cur ? `<span class="chip">You are here</span>` : ""}${!ready ? `<span class="chip">Coming soon</span>` : ""}`;
        const open = ready ? `<button class="open" data-act="unit" data-u="${u}"><div class="cover" aria-hidden="true">${ART[U.cover]()}</div><div class="body2"><span class="muted">${esc(U.sub)}</span>
          <div class="bar-s"><i style="width:${Math.round(100 * done / ls.length)}%"></i></div><span class="tiny muted">${done} of ${ls.length} lessons done, ${unitPct(u)}% of the words solid</span></div></button>` : "";
        return `<div class="stop ${cls}"><span class="pin">${u.slice(1)}</span><div class="body"><div class="title"><h3>${esc(U.title)}</h3>${flags}</div>${open}</div></div>`;
      }).join("")}</div>`;
  }
  function viewUnit() {
    const u = state.unit, U = UNITS[u], ls = unitLessons(u), sts = STORIES.filter(s => s.unit === u);
    return `<div><button class="linkbtn" data-act="go" data-v="path">Back to the line</button></div>
      <section class="uhero"><div class="cover" aria-hidden="true">${ART[U.cover]()}</div><div class="body"><span class="linebadge"><i>${u.slice(1)}</i><span class="small" style="color:var(--night-muted)">Stage A1.1</span></span><h1>${esc(U.title)}</h1><p class="muted">${esc(U.sub)}</p>
        <div class="bar-s"><i style="width:${unitPct(u)}%"></i></div><span class="tiny muted">${unitPct(u)}% of the words solid (reviewed three times without a mistake)</span>
        <div>${(() => { const nl = ls.find(l => !lessonDone(l.id)); return nl ? `<button class="btn accent" data-act="lesson" data-id="${nl.id}">Continue with ${esc(nl.title)}</button>` : `<button class="btn accent" data-act="review">Review these words</button>`; })()}</div></div></section>
      <div class="grid2"><div class="card"><h3>Micro-lessons</h3><div>${ls.map((l, i) => {
          const r = state.data.lessons[l.id];
          return `<button class="lrow" data-act="lesson" data-id="${l.id}"><span class="dot ${r && r.done ? "done" : ""}">${r && r.done ? "✓" : i + 1}</span><span><b lang="de">${esc(l.title)}</b><br><span class="small muted">${esc(l.sub)}</span></span><span class="small muted">${r && r.done ? Math.round(r.score * 100) + "%" : "3 min"}</span></button>`;
        }).join("")}
        ${sts.map(s => `<button class="lrow" data-act="story" data-id="${s.id}" ${storyOpen(s) ? "" : "disabled"}><span class="dot ${(state.data.stories[s.id] || {}).done ? "done" : ""}">${sized(I.story, 16)}</span><span><b lang="de">${esc(s.title)}</b><br><span class="small muted">Story. ${storyOpen(s) ? esc(s.sub) : "Opens after lesson 4"}</span></span><span></span></button>`).join("")}</div></div>
      <div class="card"><h3>After this unit you can</h3>${(U.can || []).map(c => `<div class="row" style="flex-wrap:nowrap;align-items:flex-start"><span class="g-n" aria-hidden="true">✓</span><span>${esc(c)}</span></div>`).join("")}</div></div>`;
  }
  function viewStories() {
    return `<header class="pagehead"><h1>Stories</h1><p class="muted">Listen first, then read. Every word can be tapped. Each story only uses words from its unit and the ones before.</p></header>
      ${STORIES.map(storyCard).join("")}
      <div class="panel"><header><h3>Coming next</h3></header>${PLANNED_STORIES.map(s => `<div class="listrow"><span class="ico">${I.lock}</span><span><b lang="de">${esc(s.title)}</b><br><span class="small muted">${s.level}, unit ${s.unit.slice(1)}: ${esc(UNITS[s.unit].title)}</span></span><span class="chip">Soon</span></div>`).join("")}</div>`;
  }

  /* ================= player frame ================= */
  function speedCtl() { const s = state.data.settings.speed; return `<div class="speed" role="group" aria-label="Audio speed">${["0.75", "1", "1.25"].map(v => `<button data-act="speed" data-v="${v}" aria-pressed="${s === v}">${v}×</button>`).join("")}</div>`; }
  function playerFrame(title, body, foot, prog) {
    const segs = prog ? `<div class="segs">${Array.from({ length: prog[1] }, (_, i) => `<i class="${i < prog[0] ? "on" : i === prog[0] ? "cur" : ""}"></i>`).join("")}</div>` : "";
    return `<div class="player"><div class="pbar"><div class="in"><button class="iconbtn" data-act="quit" aria-label="Close">${I.close}</button>
      <div style="min-width:0"><div class="ttl">${title}</div>${segs}</div><div class="row" style="flex-wrap:nowrap">${speedCtl()}<button class="iconbtn sm" data-act="report" aria-label="Report a problem" title="Report a problem">${I.flag}</button></div></div></div>
      <div class="pbody">${body}</div><div class="pfoot"><div class="in">${foot}</div></div></div>`;
  }
  function renderPlayer() {
    const c = P.cur; if (!c) { state.view = "today"; return render(); }
    ({ lesson: renderLessonStep, story: renderStory, review: renderReview, placement: renderPlacement })[c.kind]();
  }
  function lineHTML(sid, o) {
    o = o || {}; const s = SENT[sid], nar = s.sp === "nar", me = s.sp === "ana";
    return `<div class="line ${nar ? "nar" : me ? "me" : ""}" data-line="${sid}" ${o.fast ? 'data-fast="1"' : ""} ${o.slow ? 'data-slow="1"' : ""}>${nar ? "" : `<span class="face" title="${esc(NAMES[s.sp])}">${ART.face(s.sp)}</span>`}
      <div class="bubble">${nar ? "" : `<div class="who">${esc(NAMES[s.sp])}</div>`}<div class="de" lang="de">${renderDE(s.de, sid)}</div><div class="trs" hidden>${trOf(s)}</div>
      <div class="tools"><button class="iconbtn sm" data-act="say-line" aria-label="Play sentence">${I.speaker}</button><button class="iconbtn sm" data-act="tr" aria-label="Show translation">${I.tr}</button></div></div></div>`;
  }
  function linesCard(ids, o) {
    return `<div class="stack" style="gap:16px"><div class="talk" id="lines">${ids.map(id => lineHTML(id, o)).join("")}</div><div class="row"><button class="btn ghost" data-act="play-all">${I.play} Play all</button><span class="muted small">Tap any word to see what it means.</span></div></div>`;
  }

  /* ================= lessons ================= */
  function startLesson(id) {
    const L = LESSONS.find(l => l.id === id);
    P.cur = { kind: "lesson", L, steps: L.steps, i: 0, ok: 0, total: 0, answered: false, help: false };
    state.view = "player"; render();
  }
  function lessonTitle(L) { return `<span class="muted">Unit ${L.unit.slice(1)} ·</span> <span lang="de">${esc(L.title)}</span>`; }
  function renderLessonStep() {
    const c = P.cur, st = c.steps[c.i];
    c.q = st.t === "q"; c.answered = false; c.help = false; c.qStart = Date.now();
    let body;
    if (st.t === "intro") {
      const L = LEX[st.lex];
      body = `<div class="two"><div class="left scene">${ART[L.img]()}</div><div class="stack" style="gap:16px">
        <span class="eyebrow">New word</span>
        <div class="row" style="flex-wrap:nowrap;align-items:center;gap:14px"><div class="plate"><div class="inner" lang="de"><span class="w1">${artBadge(L.art)}</span><span class="w1">${esc(L.de)}</span></div></div><button class="iconbtn" data-act="hear" data-t="${esc(headword(L))}" aria-label="Play word">${I.speaker}</button></div>
        <div class="row"><span class="muted small">Plural</span>${hearBtn("die " + L.pl, `${artBadge("die", "pl")} ${esc(L.pl)}`)}</div>
        <div><button class="linkbtn" data-act="reveal">Show meaning</button><div class="gloss" hidden>${glossOf(L).map(([k, v]) => `<div><span>${k}</span><span>${esc(v)}</span></div>`).join("")}</div></div>
        ${linesCard(st.s)}</div></div>`;
    } else if (st.t === "scene") {
      body = `<div class="two"><div class="left scene">${ART[st.art]()}</div><div class="stack">${st.fast ? `<span class="eyebrow">Real speed · listen first</span>` : st.slow ? `<span class="eyebrow">Now slowly</span>` : `<span class="eyebrow">Listen and follow</span>`}${linesCard(st.lines, { fast: st.fast, slow: st.slow })}</div></div>`;
    } else if (st.t === "note") {
      const g = state.data.settings.gloss;
      body = `<div style="max-width:760px" class="stack"><span class="eyebrow">Short grammar note · optional</span><div class="note">${g !== "pt" ? `<p>${esc(st.en)}</p>` : ""}${g !== "en" ? `<p class="muted" lang="pt">${esc(st.pt)}</p>` : ""}</div></div>`;
    } else body = questionHTML(st);
    const foot = `<div id="fb"></div><button class="btn block accent" data-act="next" ${c.q ? "disabled" : ""}>${c.i === c.steps.length - 1 ? "Finish" : "Continue"}</button>`;
    app.innerHTML = playerFrame(lessonTitle(c.L), body, foot, [c.i, c.steps.length]);
    window.scrollTo(0, 0);
    if (st.t === "intro") {
      const L = LEX[st.lex];
      Voice.seq([{ markup: headword(L), sp: "nar" }].concat(st.s.map(sid => ({ markup: SENT[sid].de, sp: SENT[sid].sp, line: document.querySelector(`[data-line="${sid}"]`), el: document.querySelector(`[data-line="${sid}"] .de`) }))));
    } else if (st.t === "scene") sayLines(document.getElementById("lines"));
    else if (c.q) autoplayQuestion(st);
  }

  /* ================= questions (lesson + story) ================= */
  function promptHTML(p) {
    if (SENT[p]) return `<div class="card" style="padding:12px 16px">${lineHTML(p)}</div>`;
    return `<div class="de" lang="de" style="font-size:1.7rem;font-weight:600">${renderDE(p, null)}</div>`;
  }
  function qWrap(left, right) { return left ? `<div class="two"><div class="left">${left}</div><div class="stack">${right}</div></div>` : `<div class="stack" style="max-width:760px;width:100%">${right}</div>`; }
  function questionHTML(st) {
    const art = st.art ? `<div class="scene">${ART[st.art]()}</div>` : "";
    if (st.type === "pick_art") return qWrap("", `<span class="eyebrow">Listen and choose the picture</span><div><button class="btn ghost" data-act="q-replay">${I.speaker} Listen again</button></div>
        <div class="imgopts">${st.opts.map((a, i) => `<button class="imgopt" data-act="ans" data-i="${i}" aria-label="Option ${i + 1}">${ART[a]()}</button>`).join("")}</div>`);
    if (st.type === "choose") return qWrap(art, `<span class="eyebrow">${st.gap ? "Fill the gap" : "Choose the answer"}</span>${promptHTML(st.prompt)}
        <div class="opts">${st.opts.map((o, i) => `<button class="opt" data-act="ans" data-i="${i}"><span class="de" lang="de">${renderDE(o, null, { plain: true })}</span></button>`).join("")}</div>`);
    if (st.type === "listen_choose") return qWrap("", `<span class="eyebrow">Listen. Which sentence did you hear?</span><div><button class="btn ghost" data-act="q-replay">${I.speaker} Listen again</button></div>
        <div class="opts">${st.opts.map((o, i) => `<button class="opt" data-act="ans" data-i="${i}"><span class="de" lang="de">${renderDE(o, null, { plain: true })}</span></button>`).join("")}</div>`);
    if (st.type === "article") { const L = LEX[st.lex]; return qWrap(L.img ? `<div class="scene">${ART[L.img]()}</div>` : "", `<span class="eyebrow">der, die or das?</span><div class="bigword" lang="de"><span class="muted">___</span><span>${esc(L.de)}</span></div>
        <div class="artopts">${["der", "die", "das"].map(a => `<button class="opt" data-act="ans" data-a="${a}">${artBadge(a)}</button>`).join("")}</div>`); }
    if (st.type === "order") {
      const words = plain(SENT[st.sid].de).replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean);
      P.cur.order = { words, picked: [], pool: shuffle(words.map((w, i) => ({ w, i }))) };
      if (P.cur.order.pool.map(x => x.w).join(" ") === words.join(" ") && words.length > 1) P.cur.order.pool.reverse();
      return qWrap("", `<span class="eyebrow">Put the words in order</span>${trOf(SENT[st.sid])}<div class="order-line" id="oline" aria-label="Your sentence"></div><div class="order-pool" id="opool"></div><div><button class="btn ghost" data-act="order-check" id="ocheck" disabled>Check</button></div>`);
    }
    if (st.type === "tf") return qWrap(art, `<span class="eyebrow" lang="de">Richtig oder falsch?</span>${promptHTML(st.prompt)}<div class="artopts" style="grid-template-columns:1fr 1fr">
        <button class="opt" data-act="ans" data-tf="1" lang="de">richtig</button><button class="opt" data-act="ans" data-tf="0" lang="de">falsch</button></div>`);
    if (st.type === "sequence") {
      P.cur.order = { seq: true, words: st.items, picked: [], pool: shuffle(st.items.map((w, i) => ({ w, i }))) };
      return qWrap("", `<span class="eyebrow">What happened first? Tap the sentences in order.</span><div class="order-line" id="oline" style="flex-direction:column"></div><div class="order-pool" id="opool" style="flex-direction:column"></div><div><button class="btn ghost" data-act="order-check" id="ocheck" disabled>Check</button></div>`);
    }
    return "";
  }
  function autoplayQuestion(st) {
    if (st.type === "pick_art" || st.type === "listen_choose") replayQ(st);
    else if ((st.type === "choose" || st.type === "tf") && SENT[st.prompt]) sayOne(SENT[st.prompt].de, SENT[st.prompt].sp, document.querySelector(".line .de"));
    if (st.type === "order" || st.type === "sequence") drawOrder();
  }
  function replayQ(st) { const a = SENT[st.audio] ? SENT[st.audio] : { de: st.audio, sp: "nar" }; sayOne(a.de, a.sp); }
  function drawOrder() {
    const o = P.cur.order, line = document.getElementById("oline"), pool = document.getElementById("opool");
    const lbl = x => o.seq ? `<span class="de" lang="de" style="font-size:1rem">${renderDE(SENT[x.w].de, null, { plain: true })}</span>` : esc(x.w);
    line.innerHTML = o.picked.map((x, k) => `<button class="tok" data-act="order-un" data-k="${k}">${lbl(x)}</button>`).join("");
    pool.innerHTML = o.pool.map((x, k) => `<button class="tok" data-act="order-pick" data-k="${k}">${lbl(x)}</button>`).join("");
    document.getElementById("ocheck").disabled = o.pool.length > 0 || P.cur.answered;
  }
  function currentQ() { const c = P.cur; return c.kind === "story" ? c.qs[c.qi] : c.steps[c.i]; }
  function feedback(ok, help, corrMarkup, info) {
    document.getElementById("fb").innerHTML = `<div class="feedback ${ok ? "ok" : "bad"}" role="status"><span lang="de">${ok ? (help ? "Richtig! (with help)" : "Richtig!") : "Nicht ganz."}</span>
      ${corrMarkup ? `<span class="de" lang="de">${renderDE(corrMarkup, null, { plain: true })}</span>` : ""}${info ? `<span class="small" style="color:var(--ink);font-weight:400">${esc(info)}</span>` : ""}</div>`;
    const nb = document.querySelector('[data-act="next"],[data-act="story-next"],[data-act="review-next"]'); if (nb) { nb.disabled = false; nb.focus({ preventScroll: true }); }
  }
  function answer(ok, info) {
    const c = P.cur, st = currentQ();
    if (c.answered) return;
    c.answered = true; c.total++; if (ok) c.ok++;
    const rec = dayRec(); ok ? rec.ok++ : rec.bad++;
    log((c.kind === "story" ? c.story.id + ":q" + c.qi : c.L.id + ":" + c.i), ok, c.help, Date.now() - c.qStart);
    if (st.type === "article") artStat(ART_G[LEX[st.lex].art], ok);
    let corr = "", audio = null;
    if (st.type === "choose" || st.type === "listen_choose") { corr = st.gap ? st.prompt.replace("___", st.opts[st.a]) : st.opts[st.a]; audio = corr; }
    else if (st.type === "pick_art") { audio = SENT[st.audio] ? SENT[st.audio].de : st.audio; corr = audio; }
    else if (st.type === "article") { const L = LEX[st.lex]; corr = `{${L.art}|d.${ART_G[L.art]}.nom} ${L.de}`; audio = headword(L); }
    else if (st.type === "order") { corr = SENT[st.sid].de; audio = corr; }
    feedback(ok, c.help, st.type === "tf" || st.type === "sequence" ? "" : corr, info);
    if (audio) sayOne(audio, "nar");
    Store.save();
  }
  function onAnswerClick(el) {
    const c = P.cur; if (!c || c.answered) return;
    if (c.kind === "review") return reviewAnswer(el);
    if (c.kind === "placement") return placementAnswer(el);
    const st = currentQ();
    if (st.type === "article") {
      const art = LEX[st.lex].art, ok = el.dataset.a === art;
      document.querySelectorAll(".artopts .opt").forEach(b => { if (b.dataset.a === art) b.classList.add("right"); else if (b === el) b.classList.add("wrong"); b.disabled = true; });
      return answer(ok, ok ? "" : `${LEX[st.lex].de} is a ${art} word (${GN[ART_G[art]]}).`);
    }
    if (st.type === "tf") {
      const ok = (el.dataset.tf === "1") === st.a;
      document.querySelectorAll('[data-act="ans"]').forEach(b => { if ((b.dataset.tf === "1") === st.a) b.classList.add("right"); else if (b === el) b.classList.add("wrong"); b.disabled = true; });
      return answer(ok);
    }
    const i = +el.dataset.i, ok = i === st.a, cls = st.type === "pick_art" ? ".imgopt" : ".opt";
    document.querySelectorAll(cls).forEach(b => { if (+b.dataset.i === st.a) b.classList.add("right"); else if (b === el) b.classList.add("wrong"); b.disabled = true; });
    answer(ok);
  }
  function orderCheck() {
    const c = P.cur, o = c.order;
    if (c.kind === "placement") return placementOrderCheck();
    const st = currentQ(), got = o.picked.map(x => x.w);
    const ok = o.seq ? got.every((w, k) => w === o.words[k]) : got.join(" ").toLowerCase() === o.words.join(" ").toLowerCase() || (st.alt || []).some(a => a.toLowerCase() === got.join(" ").toLowerCase());
    document.querySelectorAll("#oline .tok, #opool .tok").forEach(b => { b.disabled = true; });
    document.getElementById("ocheck").disabled = true;
    answer(ok, o.seq && !ok ? "Order: " + o.words.map(s => plain(SENT[s].de)).join(" → ") : "");
  }
  function nextStep() { const c = P.cur; if (c.i < c.steps.length - 1) { c.i++; renderLessonStep(); } else finishLesson(); }
  function finishLesson() {
    const c = P.cur, d = state.data, score = c.total ? c.ok / c.total : 1, prev = d.lessons[c.L.id];
    const n = addCards(c.L.newLex, false);
    d.lessons[c.L.id] = { done: true, score: prev ? Math.max(prev.score, score) : score, at: Date.now() };
    dayRec().nw += n; Store.save();
    const nl = nextLesson(), st = STORIES.find(s => s.unlockAfter === c.L.id);
    const body = `<div class="stack" style="max-width:760px;width:100%;gap:18px"><span class="eyebrow">Lesson complete</span><h1 lang="de">${score >= .8 ? "Sehr gut!" : score >= .5 ? "Gut gemacht!" : "Weiter so!"}</h1>
      <div class="stats"><div class="stat"><b>${c.ok}/${c.total}</b><span class="small muted">right</span></div><div class="stat"><b>${c.L.newLex.length}</b><span class="small muted">new words</span></div><div class="stat"><b>${n}</b><span class="small muted">review cards</span></div></div>
      <div class="card"><span class="eyebrow">Your new words · first review tomorrow</span><div>${c.L.newLex.map(l => `<div class="wordrow"><button class="iconbtn sm" data-act="hear" data-t="${esc(headword(LEX[l]))}" aria-label="Play">${I.speaker}</button><span class="de" lang="de">${lexLabel(l)}</span><span class="muted small">${esc(glossLine(LEX[l]))}</span></div>`).join("")}</div></div>
      ${st ? `<div class="card"><span class="eyebrow">Unlocked</span><h2 lang="de">${esc(st.title)}</h2><p class="muted">A short story with the words from Unit 1.</p><div><button class="btn ghost" data-act="story" data-id="${st.id}">Read the story</button></div></div>` : ""}</div>`;
    const foot = nl ? `<button class="btn ghost" data-act="home">Back to Today</button><button class="btn accent" data-act="lesson" data-id="${nl.id}">Next: ${esc(nl.title)} ${I.arrow}</button>` : `<span></span><button class="btn accent" data-act="home">Back to Today</button>`;
    const title = lessonTitle(c.L);
    P.cur = null;
    app.innerHTML = playerFrame(title, body, foot, null);
  }

  /* ================= story ================= */
  function startStory(id) { const s = STORIES.find(x => x.id === id); P.cur = { kind: "story", story: s, phase: "listen", qs: s.questions, qi: 0, ok: 0, total: 0, answered: false }; state.view = "player"; render(); }
  function storyTitle(s) { return `<span class="muted">Story ·</span> <span lang="de">${esc(s.title)}</span>`; }
  function renderStory() {
    const c = P.cur, s = c.story;
    if (c.phase === "q") return renderStoryQ();
    if (c.phase === "done") return renderStoryDone();
    const hidden = c.phase === "listen";
    const panels = s.panels.map((p, k) => `<div class="two"><div class="left scene">${ART[p.art]()}</div><div class="talk lines-group ${hidden ? "blur" : ""}" data-panel="${k}">${p.s.map(id => lineHTML(id)).join("")}</div></div>`).join("");
    const body = `<header class="pagehead"><span class="eyebrow">Story · ${esc(s.level)} · Unit ${s.unit.slice(1)}</span><h1 lang="de">${esc(s.title)}</h1>
      <p class="muted">${hidden ? "Step 1 of 3: listen and follow the pictures. The text is hidden." : "Step 2 of 3: read along. Tap any word you don't know."}</p></header>${panels}`;
    const foot = hidden ? `<button class="btn ghost" data-act="story-play">${I.play} Listen to the story</button><button class="btn accent" data-act="story-read">Show the text</button>`
      : `<button class="btn ghost" data-act="story-play">${I.play} Listen again</button><button class="btn accent" data-act="story-q">Questions ${I.arrow}</button>`;
    app.innerHTML = playerFrame(storyTitle(s), body, foot, [hidden ? 0 : 1, 3]);
  }
  function playStory() {
    const hidden = P.cur.phase === "listen";
    Voice.seq([...document.querySelectorAll(".lines-group .line[data-line]")].map(line => { const s = SENT[line.dataset.line]; return { markup: s.de, sp: s.sp, line: hidden ? null : line, el: hidden ? null : line.querySelector(".de") }; }));
  }
  function renderStoryQ() {
    const c = P.cur, st = c.qs[c.qi];
    c.q = true; c.answered = false; c.help = false; c.qStart = Date.now();
    const body = `<span class="eyebrow">Question ${c.qi + 1} of ${c.qs.length}</span>` + questionHTML(st);
    app.innerHTML = playerFrame(storyTitle(c.story), body, `<div id="fb"></div><button class="btn block accent" data-act="story-next" disabled>${c.qi === c.qs.length - 1 ? "Finish" : "Continue"}</button>`, [2, 3]);
    autoplayQuestion(st);
  }
  function renderStoryDone() {
    const c = P.cur, d = state.data, score = c.total ? c.ok / c.total : 1;
    d.stories[c.story.id] = { done: true, score, at: Date.now() }; Store.save();
    const body = `<div class="stack" style="max-width:760px;width:100%"><span class="eyebrow">Story finished</span><h1 lang="de">Toll!</h1><p class="muted">${c.ok} of ${c.total} answers right. Words you tapped come back sooner in your reviews.</p></div>`;
    const title = storyTitle(c.story);
    P.cur = null;
    app.innerHTML = playerFrame(title, body, `<span></span><button class="btn accent" data-act="home">Back to Today</button>`, null);
  }

  /* ================= review ================= */
  function forecastChart(vals) {
    const max = Math.max(1, ...vals), W = 320, H = 110, bw = 30, gap = (W - 7 * bw) / 6;
    const days = vals.map((_, n) => { const d = new Date(); d.setDate(d.getDate() + n); return n === 0 ? "Today" : d.toLocaleDateString("en-GB", { weekday: "short" }); });
    return `<div class="chart"><svg viewBox="0 0 ${W} ${H + 24}" role="img" aria-label="Cards due per day for the next 7 days"><line x1="0" x2="${W}" y1="${H}" y2="${H}" stroke="var(--line)"/>
      ${vals.map((v, i) => { const h = v ? Math.max(4, (v / max) * (H - 18)) : 0, x = i * (bw + gap); return `<g><title>${days[i]}: ${v} cards</title><rect x="${x - gap / 2}" y="0" width="${bw + gap}" height="${H}" fill="transparent"/>${h ? `<path d="M${x} ${H} V${H - h + 4} q0 -4 4 -4 H${x + bw - 4} q4 0 4 4 V${H} Z" fill="var(--accent)"/>` : ""}
        <text x="${x + bw / 2}" y="${H - h - 5}" text-anchor="middle" font-size="11" fill="var(--ink)" font-weight="700">${v || ""}</text><text x="${x + bw / 2}" y="${H + 16}" text-anchor="middle" font-size="10.5" fill="var(--muted)">${days[i]}</text></g>`; }).join("")}</svg></div>`;
  }
  function viewReview() {
    const d = state.data, due = dueCount(), total = Object.keys(d.cards).length;
    const forecast = [0, 1, 2, 3, 4, 5, 6].map(n => { const k = addDays(n); return Object.values(d.cards).filter(c => (n === 0 ? c.d <= k : c.d === k)).length; });
    return `<header class="pagehead"><h1>${due ? `${due} cards due today` : "All caught up"}</h1><p class="muted" style="max-width:68ch">Each word comes back just before you'd forget it: after 1, 3, 7, 14, 30 and 60 days. It is practised as meaning, article and listening. Answers given after tapping a word count as “with help”.</p></header>
      <div class="row"><button class="btn accent" data-act="review" ${total ? "" : "disabled"}>${due ? "Start review" : "Practise anyway"} ${I.arrow}</button></div>
      ${total ? `<div class="card" style="max-width:640px"><span class="eyebrow">Next 7 days</span>${forecastChart(forecast)}</div>` : `<p class="muted">No cards yet. Finish a lesson first.</p>`}`;
  }
  function startReview() {
    const d = state.data, t = today();
    let ids = Object.entries(d.cards).filter(([, c]) => c.d <= t).sort((a, b) => a[1].d < b[1].d ? -1 : 1).map(([k]) => k), practice = false;
    if (!ids.length) { ids = shuffle(Object.keys(d.cards)).slice(0, 12); practice = true; }
    P.cur = { kind: "review", queue: interleave(ids.slice(0, 25)), i: 0, ok: 0, total: 0, practice, requeued: {}, answered: false };
    state.view = "player"; render();
  }
  function interleave(ids) { const out = [], rest = shuffle(ids); while (rest.length) { const k = rest.findIndex(id => !out.length || id.split("|")[0] !== out[out.length - 1].split("|")[0]); out.push(rest.splice(k < 0 ? 0 : k, 1)[0]); } return out; }
  function pool(pred) { return introducedLex().filter(l => pred(LEX[l])); }
  function makeEx(id) {
    const [lex, sk] = id.split("|"), L = LEX[lex], ex = { id, lex, sk };
    if (sk === "art") { ex.type = "article"; return ex; }
    if (sk === "mean") {
      const dis = [...new Set(shuffle(pool(x => x.pos === L.pos && x !== L)).concat(shuffle(Object.keys(LEX).filter(k => k !== lex && LEX[k].pos === L.pos))))].filter(k => LEX[k].en !== L.en).slice(0, 3);
      ex.type = "mean"; ex.opts = shuffle([lex].concat(dis)); return ex;
    }
    if (L.pos === "noun" && L.img) {
      const dis = shuffle([...new Set(pool(x => x.pos === "noun" && !!x.img && x !== L).concat(Object.keys(LEX).filter(k => LEX[k].pos === "noun" && LEX[k].img && k !== lex)))]).filter(k => LEX[k].img !== L.img).slice(0, 3);
      ex.type = "aud_img"; ex.opts = shuffle([lex].concat(dis)); return ex;
    }
    const dis = [...new Set(shuffle(pool(x => x !== L && x.pos !== "name")).concat(shuffle(Object.keys(LEX).filter(k => k !== lex && ["expr", "verb", "adv", "adj"].includes(LEX[k].pos)))))].slice(0, 3);
    ex.type = "aud_txt"; ex.opts = shuffle([lex].concat(dis)); return ex;
  }
  function renderReview() {
    const c = P.cur;
    if (c.i >= c.queue.length) return finishReview();
    const ex = c.ex = makeEx(c.queue[c.i]), L = LEX[ex.lex];
    c.q = true; c.answered = false; c.help = false; c.qStart = Date.now();
    const sayBtn = `<button class="iconbtn" data-act="hear" data-t="${esc(headword(L))}" aria-label="Play">${I.speaker}</button>`;
    let right;
    if (ex.type === "article") right = `<span class="eyebrow">der, die or das?</span><div class="bigword" lang="de"><span class="muted">___</span><span>${esc(L.de)}</span></div><div class="artopts">${["der", "die", "das"].map(a => `<button class="opt" data-act="ans" data-a="${a}">${artBadge(a)}</button>`).join("")}</div>`;
    else if (ex.type === "mean") right = `<span class="eyebrow">What does it mean?</span><div class="spread" style="flex-wrap:nowrap"><div class="bigword" lang="de">${lexLabel(ex.lex)}</div>${sayBtn}</div>
        <div class="opts">${ex.opts.map(k => `<button class="opt" data-act="ans" data-k="${k}">${glossOf(LEX[k]).map(([, v], j) => j ? `<span class="muted small"> · ${esc(v)}</span>` : esc(v)).join("")}</button>`).join("")}</div>`;
    else if (ex.type === "aud_img") right = `<span class="eyebrow">Listen and choose the picture</span><div>${sayBtn}</div><div class="imgopts">${ex.opts.map(k => `<button class="imgopt" data-act="ans" data-k="${k}" aria-label="picture">${ART[LEX[k].img]()}</button>`).join("")}</div>`;
    else right = `<span class="eyebrow">Listen. Which word did you hear?</span><div>${sayBtn}</div><div class="opts">${ex.opts.map(k => `<button class="opt" data-act="ans" data-k="${k}"><span class="de" lang="de">${lexLabel(k)}</span></button>`).join("")}</div>`;
    const left = ex.type === "article" && L.img ? `<div class="scene">${ART[L.img]()}</div>` : "";
    const body = `<span class="muted small">${c.practice ? "Practice · does not change your schedule" : "Review"} · ${c.i + 1} of ${c.queue.length}</span>` + qWrap(left, right);
    app.innerHTML = playerFrame(c.practice ? "Practice" : "Review", body, `<div id="fb"></div><button class="btn block accent" data-act="review-next" disabled>Continue</button>`, [Math.min(c.i, 24), Math.min(c.queue.length, 25)]);
    if (ex.type !== "article") sayOne(headword(L), "nar");
  }
  function reviewAnswer(el) {
    const c = P.cur, ex = c.ex, L = LEX[ex.lex];
    let ok;
    if (ex.type === "article") { ok = el.dataset.a === L.art; document.querySelectorAll(".artopts .opt").forEach(b => { if (b.dataset.a === L.art) b.classList.add("right"); else if (b === el) b.classList.add("wrong"); b.disabled = true; }); artStat(ART_G[L.art], ok); }
    else { ok = el.dataset.k === ex.lex; document.querySelectorAll('[data-act="ans"]').forEach(b => { if (b.dataset.k === ex.lex) b.classList.add("right"); else if (b === el) b.classList.add("wrong"); b.disabled = true; }); }
    c.answered = true; c.total++; if (ok) c.ok++;
    const rec = dayRec(); rec.rv++; ok ? rec.ok++ : rec.bad++;
    log(ex.id, ok, c.help, Date.now() - c.qStart);
    if (!c.practice) grade(ex.id, ok, c.help); else if (!ok && state.data.cards[ex.id]) state.data.cards[ex.id].d = addDays(1);
    if (!ok && !c.requeued[ex.id]) { c.requeued[ex.id] = 1; c.queue.push(ex.id); }
    feedback(ok, c.help, L.pos === "noun" ? `{${L.art}|d.${ART_G[L.art]}.nom} ${L.de}` : L.de, glossLine(L));
    sayOne(headword(L), "nar");
    Store.save();
  }
  function finishReview() {
    const c = P.cur, due = dueCount();
    const body = `<div class="stack" style="max-width:760px;width:100%"><span class="eyebrow">${c.practice ? "Practice" : "Review"} done</span><h1 lang="de">Fertig!</h1><p class="muted">${c.ok} of ${c.total} right.${due ? ` ${due} still due.` : " Nothing else is due today."}</p></div>`;
    P.cur = null;
    app.innerHTML = playerFrame("Review", body, `<span></span><button class="btn accent" data-act="home">Back to Today</button>`, null);
  }

  /* ================= placement ================= */
  const PL_GROUPS = [["Meaning & articles", ["meaning", "article"]], ["Grammar & word order", ["grammar", "order"]], ["Listening & reading", ["listening", "reading"]]];
  function viewPlacementHome() {
    const d = state.data, groups = PL_GROUPS.map(([n, sk]) => [n, PLACEMENT.filter(p => sk.includes(p.skill)).length]);
    return `<header class="pagehead"><span class="eyebrow">Placement test · A1 → A2</span><h1>Find your starting point</h1><p class="muted" style="max-width:68ch">Up to ${PLACEMENT.length} short questions in four levels. The test stops by itself when it gets too hard, so most people finish in 5 to 10 minutes.</p></header>
      <div class="sec">${groups.map(([n, k]) => `<div class="card"><span class="eyebrow">Up to ${k} questions</span><h3>${n}</h3></div>`).join("")}</div>
      <div class="card" style="max-width:760px"><p>Answer “I don't know” instead of guessing; it makes the result more accurate. You can pause and continue later. Word lookups are switched off during the test.</p>
      ${d.placement ? `<p class="muted small">Last result: start at unit ${d.placement.start.slice(1)} (${new Date(d.placement.at).toLocaleDateString("en-GB")}).</p>` : ""}
      <div class="row">${d.plDraft ? `<button class="btn accent" data-act="pl-resume">Resume (${d.plDraft.answers.length} answered) ${I.arrow}</button><button class="btn ghost" data-act="pl-begin">Start again</button>` : `<button class="btn accent" data-act="pl-begin">${d.placement ? "Take it again" : "Start the test"} ${I.arrow}</button>`}</div></div>`;
  }
  function bandItems(b) { return PLACEMENT.filter(x => x.band === b); }
  function startPlacement(resume) {
    const dr = resume && state.data.plDraft;
    P.cur = dr ? { kind: "placement", phase: "items", band: dr.band, items: dr.items.map(id => PLACEMENT.find(p => p.id === id)), i: dr.i, res: dr.res, answers: dr.answers, answered: false }
      : { kind: "placement", phase: "items", band: 1, items: shuffle(bandItems(1)), i: 0, res: {}, answers: [], answered: false };
    state.view = "player"; render();
  }
  function saveDraft() { const c = P.cur; state.data.plDraft = { band: c.band, items: c.items.map(x => x.id), i: c.answered ? c.i + 1 : c.i, res: c.res, answers: c.answers }; if (state.data.plDraft.i >= c.items.length) state.data.plDraft.i = c.items.length - 1; Store.save(); }
  function renderPlacement() {
    const c = P.cur;
    if (c.phase === "result") return renderPlacementResult();
    const it = c.items[c.i];
    c.q = true; c.answered = false; c.qStart = Date.now();
    const label = { meaning: "Meaning", article: "Article", grammar: "Grammar", listening: "Listening", reading: "Reading", order: "Word order" }[it.skill];
    const ask = { meaning: "Choose the meaning.", article: "der, die or das?", grammar: "Complete the sentence.", order: "Put the words in order." }[it.skill];
    let q = `<span class="eyebrow">Level ${c.band} of 4 · ${label}</span>${ask ? `<p class="muted">${ask}</p>` : ""}`;
    if (it.audio) q += `<div><button class="btn ghost" data-act="pl-audio">${I.speaker} Play audio</button></div>`;
    if (it.skill === "order") {
      c.order = { words: it.words, picked: [], pool: shuffle(it.words.map((w, i) => ({ w, i }))) };
      q += `<div class="order-line" id="oline"></div><div class="order-pool" id="opool"></div><div><button class="btn ghost" data-act="order-check" id="ocheck" disabled>Check</button></div>`;
    } else {
      const text = it.skill === "reading" || it.skill === "listening";
      q += `<div class="${text ? "" : "de"}" lang="${it.skill === "listening" ? "en" : "de"}" style="${text ? "" : "font-size:2rem;font-weight:600"};white-space:pre-line">${esc(it.stem)}</div>`;
      q += it.img ? `<div class="imgopts">${it.img.map((a, i) => `<button class="imgopt" data-act="ans" data-i="${i}" aria-label="${esc(a)}">${ART[a]()}</button>`).join("")}</div>`
        : `<div class="${it.skill === "article" ? "artopts" : "opts"}">${it.opts.map((o, i) => `<button class="opt" data-act="ans" data-i="${i}">${it.skill === "article" ? artBadge(o) : esc(o)}</button>`).join("")}</div>`;
    }
    q += `<div class="row"><button class="btn ghost" data-act="pl-idk">I don't know</button><button class="linkbtn" data-act="pl-pause">Pause & save</button></div>`;
    app.innerHTML = playerFrame(`Placement test <span class="muted">· question ${c.answers.length + 1}</span>`, `<div class="stack" style="max-width:760px;width:100%">${q}</div>`, `<span class="muted small">Your answers are saved as you go.</span><button class="btn accent" data-act="pl-next" disabled>Continue</button>`, [c.band - 1, 4]);
    if (it.skill === "order") drawOrder();
    if (it.audio) sayOne(it.audio, "nar");
  }
  function placementRecord(ok, idk) {
    const c = P.cur, it = c.items[c.i];
    c.answered = true;
    const r = c.res[c.band] = c.res[c.band] || { ok: 0, n: 0 }; r.n++; if (ok) r.ok++;
    c.answers.push([it.id, ok ? 1 : 0, idk ? 1 : 0]);
    document.querySelectorAll('[data-act="ans"],[data-act="pl-idk"],.tok,#ocheck').forEach(b => { b.disabled = true; });
    const nb = document.querySelector('[data-act="pl-next"]'); nb.disabled = false; nb.focus({ preventScroll: true });
    saveDraft();
  }
  function placementAnswer(el) { el.classList.add("picked"); placementRecord(+el.dataset.i === P.cur.items[P.cur.i].a, false); }
  function placementOrderCheck() { const it = P.cur.items[P.cur.i], got = P.cur.order.picked.map(x => x.w).join(" ").toLowerCase(); placementRecord(it.accept.some(a => a.toLowerCase() === got), false); }
  function placementNext() {
    const c = P.cur;
    if (c.i < c.items.length - 1) { c.i++; return renderPlacement(); }
    const r = c.res[c.band], acc = r && r.n ? r.ok / r.n : 0;
    if (acc >= 0.5 && c.band < 4) { c.band++; c.items = shuffle(bandItems(c.band)); c.i = 0; saveDraft(); return renderPlacement(); }
    c.phase = "result"; renderPlacement();
  }
  const START_BY_BAND = ["U01", "U03", "U10", "U19", "U27"];
  function renderPlacementResult() {
    const c = P.cur, d = state.data;
    let passed = 0;
    for (let b = 1; b <= 4; b++) { const r = c.res[b]; if (r && r.n && r.ok / r.n >= 0.7) passed = b; else break; }
    const start = START_BY_BAND[passed];
    d.placement = { at: Date.now(), bands: c.res, passed, start, answers: c.answers }; d.plDraft = null;
    const seeded = passed >= 1 ? addCards([...new Set(LESSONS.flatMap(l => l.newLex))], true) : 0;
    Store.save();
    const levelName = ["", "A1.1", "A1.2", "A2.1", "A2.2"][passed];
    const rows = [1, 2, 3, 4].map(b => { const r = c.res[b]; return `<div class="bar"><span>Level ${b}</span><span class="track"><i style="width:${r ? Math.round(100 * r.ok / r.n) : 0}%;background:var(--brand-soft)"></i></span><span class="small">${r ? `${r.ok} of ${r.n}` : "not reached"}</span></div>`; }).join("");
    const ready = LESSONS.some(l => l.unit === start);
    const body = `<div class="stack" style="max-width:760px;width:100%;gap:18px"><span class="eyebrow">Your result</span><h1>${passed ? `You know the basics of ${levelName}` : "Start from the beginning"}</h1>
      <div class="board" style="grid-template-columns:1fr"><div class="row" style="gap:14px"><span class="gleis">${start.slice(1)}</span><span class="label">Your starting point</span></div><span class="dest">${esc(UNITS[start].title)}</span></div>
      ${ready ? "" : `<p class="muted">That unit is still being written. For now, go through Units 1 and 2 quickly${seeded ? "; the words you probably know are already in your reviews and come back in 3 days as a check" : ""}.</p>`}
      <div class="card"><span class="eyebrow">Answers right per level</span><div class="bars">${rows}</div></div><p class="muted small">This is a starting point, not a certificate. You can take the test again any time.</p></div>`;
    P.cur = null;
    app.innerHTML = playerFrame("Placement test", body, `<span></span><button class="btn accent" data-act="home">Go to Today ${I.arrow}</button>`, null);
  }

  /* ================= words ================= */
  function viewWords() {
    const d = state.data, f = state.filter;
    let list = introducedLex();
    if (f === "saved") list = d.saved.filter(l => LEX[l]);
    else if (f === "looked") list = Object.keys(d.lookups).filter(l => LEX[l]).sort((a, b) => d.lookups[b] - d.lookups[a]);
    else if (f !== "all") list = list.filter(l => LEX[l].pos === "noun" && ART_G[LEX[l].art] === f);
    else list.sort((a, b) => LEX[a].de.localeCompare(LEX[b].de, "de"));
    const filters = [["all", "All"], ["m", "der"], ["f", "die"], ["n", "das"], ["saved", "Saved"], ["looked", "Looked up"]];
    return `<header class="pagehead"><span class="eyebrow">My words</span><h1>${introducedLex().length} words</h1><p class="muted">Tap the speaker to hear a word, or the word to see its forms and an example.</p></header>
      <div class="filters" role="group" aria-label="Filter">${filters.map(([k, l]) => `<button data-act="filter" data-f="${k}" aria-pressed="${f === k}">${l}</button>`).join("")}</div>
      <div class="card">${list.length ? list.map(l => { const s = strength(l); return `<div class="wordrow"><button class="iconbtn sm" data-act="hear" data-t="${esc(headword(LEX[l]))}" aria-label="Play">${I.speaker}</button>
        <button class="open" data-act="word" data-lex="${l}"><span class="de" lang="de">${lexLabel(l)}</span><br><span class="muted small">${esc(glossLine(LEX[l]))}${f === "looked" ? ` · looked up ${d.lookups[l]}×` : ""}</span></button>
        ${d.cards[l + "|mean"] ? `<span class="meter" aria-label="strength ${s} of 5">${[0, 1, 2, 3, 4, 5].map(k => `<i class="${k <= s ? "on" : ""}"></i>`).join("")}</span>` : "<span></span>"}</div>`; }).join("") : `<p class="muted">Nothing here yet.</p>`}</div>`;
  }

  /* ================= progress ================= */
  function viewProgress() {
    const d = state.data, goal = d.settings.goal;
    const days = []; for (let n = 13; n >= 0; n--) { const dt = new Date(); dt.setDate(dt.getDate() - n); days.push({ dt, min: Math.round(((d.daily[dayKey(dt)] || {}).ms || 0) / 60000) }); }
    const max = Math.max(goal, ...days.map(x => x.min)), W = 336, H = 130, bw = 16, gap = (W - 14 * bw) / 13, gy = H - (goal / max) * (H - 10);
    const chart = `<div class="chart"><svg viewBox="0 0 ${W} ${H + 26}" role="img" aria-label="Minutes studied per day, last 14 days"><line x1="0" x2="${W}" y1="${H}" y2="${H}" stroke="var(--line)"/>
      <line x1="0" x2="${W}" y1="${gy}" y2="${gy}" stroke="var(--muted)" stroke-dasharray="4 4"/><text x="${W}" y="${gy - 5}" text-anchor="end" font-size="10.5" fill="var(--muted)">goal ${goal} min</text>
      ${days.map((x, i) => { const h = x.min ? Math.max(4, (x.min / max) * (H - 10)) : 0, X = i * (bw + gap); return `<g><title>${x.dt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}: ${x.min} min</title><rect x="${X - gap / 2}" y="0" width="${bw + gap}" height="${H}" fill="transparent"/>
        ${h ? `<path d="M${X} ${H} V${H - h + 4} q0 -4 4 -4 H${X + bw - 4} q4 0 4 4 V${H} Z" fill="${x.min >= goal ? "var(--ok)" : "var(--accent)"}"/>` : ""}${i % 2 === 1 ? `<text x="${X + bw / 2}" y="${H + 16}" text-anchor="middle" font-size="10" fill="var(--muted)">${x.dt.getDate()}</text>` : ""}</g>`; }).join("")}</svg></div>`;
    const artRows = ["m", "f", "n", "pl"].map(g => { const [ok, bad] = d.art[g], n = ok + bad, p = n ? Math.round(100 * ok / n) : 0; return `<div class="bar"><span>${artBadge(g === "pl" ? "die" : { m: "der", f: "die", n: "das" }[g], g)}</span><span class="track"><i style="width:${p}%;background:var(--${g})"></i></span><span class="small">${n ? `${p}% · ${n}` : "–"}</span></div>`; }).join("");
    const st = [0, 0, 0]; Object.values(d.cards).forEach(c => { st[c.s <= 0 ? 0 : c.s <= 2 ? 1 : 2]++; });
    const looked = Object.entries(d.lookups).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const totalMin = Math.round(Object.values(d.daily).reduce((a, r) => a + (r.ms || 0), 0) / 60000);
    return `<header class="pagehead"><span class="eyebrow">Progress · ${esc(d.name)}</span><h1>${totalMin} minutes so far</h1><p class="muted">${streak()} days in a row · ${introducedLex().length} words · ${Object.keys(d.lessons).length} of ${LESSONS.length} lessons</p></header>
      <div class="grid2"><div class="card"><span class="eyebrow">Minutes per day · last 14 days</span>${chart}</div>
      <div class="card"><span class="eyebrow">Readiness by situation</span><div class="bars">${["U01", "U02"].map(u => `<div class="bar"><span>Unit ${u.slice(1)}</span><span class="track"><i style="width:${unitPct(u)}%;background:var(--ok)"></i></span><span class="small">${unitPct(u)}%</span></div>`).join("")}</div><p class="muted small">100% = every word of the unit reviewed three times without mistakes.</p></div>
      <div class="card"><span class="eyebrow">Articles · answers right by gender</span><div class="bars">${artRows}</div><p class="muted small">A low bar shows which gender to practise.</p></div>
      <div class="card"><span class="eyebrow">Review cards</span><div class="stats"><div class="stat"><b>${st[0]}</b><span class="small muted">new or shaky</span></div><div class="stat"><b>${st[1]}</b><span class="small muted">learning</span></div><div class="stat"><b>${st[2]}</b><span class="small muted">solid</span></div></div></div>
      <div class="card"><span class="eyebrow">Words you look up most</span>${looked.length ? looked.map(([l, n]) => `<div class="wordrow"><button class="iconbtn sm" data-act="hear" data-t="${esc(LEX[l] ? headword(LEX[l]) : l)}" aria-label="Play">${I.speaker}</button><button class="open" data-act="word" data-lex="${l}"><span class="de" lang="de">${LEX[l] ? lexLabel(l) : esc(l)}</span></button><span class="small muted">${n}×</span></div>`).join("") : `<p class="muted small">Tap words in lessons and stories; they show up here.</p>`}</div>
      <div class="card"><span class="eyebrow">Placement</span>${d.placement ? `<p>Start at unit <b>${d.placement.start.slice(1)}</b> · passed level ${d.placement.passed} of 4 · ${new Date(d.placement.at).toLocaleDateString("en-GB")}</p>` : `<p class="muted">Not taken yet.</p>`}<div><button class="btn ghost" data-act="go" data-v="placement-view">${d.placement ? "Take it again" : "Take the test"}</button></div></div></div>`;
  }

  /* ================= settings ================= */
  let confirmReset = false, confirmImport = false;
  function seg(name, val, opts) { return `<div class="seg" role="group">${opts.map(([v, l]) => `<button data-act="set" data-k="${name}" data-v="${v}" aria-pressed="${String(val) === String(v)}">${l}</button>`).join("")}</div>`; }
  function viewSettings() {
    const d = state.data, s = d.settings;
    const engines = [["recorded", "Recorded voices"], ["device", "Device voice"]].concat(Voice.tts ? [["claude", "Claude voice"]] : []);
    const reports = d.reports.slice().reverse();
    const reportText = reports.map((r, i) => `${i + 1}. ${r.text || "(no text)"} | ${Object.entries(r.ctx || {}).map(([k, v]) => k + ": " + v).join(" · ")} | ${new Date(r.at).toLocaleString("en-GB")}`).join("\n");
    return `<header class="pagehead"><span class="eyebrow">Settings</span><h1>${esc(d.name)}</h1></header>
      <div class="grid2">
      <div class="card"><h3>Name</h3><input id="nm" type="text" value="${esc(d.name)}" maxlength="24" aria-label="Name"><div><button class="btn ghost" data-act="rename">Save name</button></div></div>
      <div class="card"><h3>Translations</h3><p class="muted small">Help language for meanings and sentences.</p>${seg("gloss", s.gloss, [["both", "English + Português"], ["en", "English"], ["pt", "Português"]])}</div>
      <div class="card"><h3>Audio</h3><p class="muted small">Speed</p>${seg("speed", s.speed, [["0.75", "0.75×"], ["1", "1×"], ["1.25", "1.25×"]])}<p class="muted small">Voice</p>${seg("engine", s.engine, engines)}
        <p class="muted tiny">Recorded voices were generated in advance with two free German voices (Thorsten and Kerstin) and sound the same on every device.</p><div><button class="btn ghost" data-act="hear" data-t="Guten Tag, ich heiße Ana." data-sp="ana">${I.speaker} Test the voice</button></div></div>
      <div class="card"><h3>Daily goal</h3>${seg("goal", s.goal, [[10, "10"], [20, "20"], [30, "30"], [40, "40"], [60, "60 min"]])}</div>
      <div class="card"><h3>Article symbols</h3><p class="muted small">■ der · ● die · ▲ das · ◆ plural. Bigger symbols help if colours are hard to tell apart.</p>${seg("symbols", s.symbols, [[false, "Normal"], [true, "Bigger"]])}</div>
      <div class="card"><h3>Reported problems</h3><p class="muted small">${reports.length ? `${reports.length} report${reports.length === 1 ? "" : "s"}. Copy them and paste them into the chat with Claude to get them fixed.` : "Use the flag button in a lesson to report a wrong translation or bad audio."}</p>
        ${reports.length ? `<textarea id="rps" readonly aria-label="Reports">${esc(reportText)}</textarea><div class="row"><button class="btn ghost" data-act="copy" data-src="rps">Copy reports</button><button class="linkbtn" data-act="clear-reports">Clear</button></div>` : ""}</div>
      <div class="card"><h3>Backup</h3><p class="sync">${esc(syncText())}</p><p class="muted small">Copy this text and keep it safe. To restore, paste it below and tap Import twice.</p>
        <textarea id="bk" readonly aria-label="Backup">${esc(JSON.stringify(d))}</textarea><div class="row"><button class="btn ghost" data-act="copy" data-src="bk">Copy backup</button></div>
        <label class="field" for="imp">Import<textarea id="imp" placeholder="Paste a backup here"></textarea></label><div><button class="btn ghost" data-act="import">${confirmImport ? "Tap again to replace this profile" : "Import"}</button></div></div>
      <div class="card"><h3>Start over</h3><p class="muted small">Deletes this profile's progress. The other profile is not touched.</p><div><button class="btn ghost" data-act="reset" style="${confirmReset ? "border-color:var(--bad);color:var(--bad)" : ""}">${confirmReset ? "Tap again to delete progress" : "Reset progress"}</button></div></div>
      </div><div class="row"><button class="btn" data-act="switch">Switch profile</button></div>`;
  }

  /* ================= events ================= */
  const actions = {
    pick: el => pickProfile(el.dataset.id),
    switch: () => { clearTimeout(Store.timer); Store.flush(); state.view = "picker"; state.pid = null; state.data = null; refreshPicker(); },
    go: el => { confirmReset = confirmImport = false; state.view = el.dataset.v; render(); },
    home: () => { P.cur = null; state.view = "today"; render(); },
    quit: () => { if (P.cur && P.cur.kind === "placement" && P.cur.phase === "items") saveDraft(); P.cur = null; state.view = "today"; render(); },
    unit: el => { state.unit = el.dataset.u; state.view = "unit"; render(); },
    stage: el => { state.stage = el.dataset.s; render(); },
    lesson: el => startLesson(el.dataset.id),
    story: el => startStory(el.dataset.id),
    review: () => startReview(),
    placement: () => { state.view = "placement-view"; render(); },
    "skip-placement": () => { state.data.placement = { at: Date.now(), bands: {}, passed: 0, start: "U01", skipped: true, answers: [] }; Store.save(); render(); },
    next: () => { Voice.stop(); nextStep(); },
    reveal: el => { el.hidden = true; el.nextElementSibling.hidden = false; },
    hear: el => sayOne(el.dataset.t, el.dataset.sp || "nar"),
    "say-line": el => { const line = el.closest(".line"), s = SENT[line.dataset.line]; sayOne(s.de, s.sp, line.querySelector(".de"), { line, fast: line.dataset.fast === "1", slow: line.dataset.slow === "1" }); },
    "play-all": () => sayLines(document.getElementById("lines")),
    tr: el => { const t = el.closest(".line").querySelector(".trs"); t.hidden = !t.hidden; },
    speed: el => { state.data.settings.speed = el.dataset.v; Store.save(); document.querySelectorAll('[data-act="speed"]').forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === el.dataset.v))); if (Voice.el) Voice.el.playbackRate = Number(el.dataset.v); },
    ans: el => onAnswerClick(el),
    "q-replay": () => replayQ(currentQ()),
    "order-pick": el => { const o = P.cur.order; o.picked.push(o.pool.splice(+el.dataset.k, 1)[0]); drawOrder(); },
    "order-un": el => { if (P.cur.answered) return; const o = P.cur.order; o.pool.push(o.picked.splice(+el.dataset.k, 1)[0]); drawOrder(); },
    "order-check": () => orderCheck(),
    "story-play": () => playStory(),
    "story-read": () => { P.cur.phase = "read"; renderStory(); },
    "story-q": () => { Voice.stop(); P.cur.phase = "q"; P.cur.qi = 0; renderStory(); },
    "story-next": () => { Voice.stop(); const c = P.cur; if (c.qi < c.qs.length - 1) { c.qi++; renderStoryQ(); } else { c.phase = "done"; renderStory(); } },
    "review-next": () => { Voice.stop(); P.cur.i++; renderReview(); },
    "pl-begin": () => { state.data.plDraft = null; startPlacement(false); },
    "pl-resume": () => startPlacement(true),
    "pl-pause": () => { saveDraft(); P.cur = null; state.view = "today"; render(); toast("Test paused. Continue any time from Today."); },
    "pl-audio": () => sayOne(P.cur.items[P.cur.i].audio, "nar"),
    "pl-idk": () => placementRecord(false, true),
    "pl-next": () => { Voice.stop(); placementNext(); },
    "lens-close": () => { Voice.stop(); closeSheet(); },
    "lens-next": () => { lensCtx.ex++; renderLens(); },
    "lens-say-ex": el => { const s = SENT[el.dataset.sid]; sayOne(s.de, s.sp, document.getElementById("lensEx")); },
    "lens-save": () => { const d = state.data, l = lensCtx.lex, i = d.saved.indexOf(l); if (i >= 0) d.saved.splice(i, 1); else { d.saved.push(l); if (LEX[l] && LEX[l].pos !== "art" && !d.cards[l + "|mean"]) addCards([l], false); } Store.save(); renderLens(); },
    report: () => openReport(),
    "report-save": () => { const t = document.getElementById("rp").value.trim(); let ctx = {}; try { ctx = JSON.parse(overlay.dataset.ctx || "{}"); } catch (e) { /* ignore */ } state.data.reports.push({ at: Date.now(), text: t, ctx }); Store.save(); closeSheet(); toast("Thanks. The report is saved in Settings."); },
    "clear-reports": () => { state.data.reports = []; Store.save(); render(); },
    word: el => openLens({ lex: el.dataset.lex, surface: "", feat: "", sid: null }),
    filter: el => { state.filter = el.dataset.f; render(); },
    set: el => { const s = state.data.settings, k = el.dataset.k; let v = el.dataset.v; if (k === "goal") v = +v; if (k === "symbols") v = v === "true"; s[k] = v; Store.save(); render(); },
    rename: () => { const v = document.getElementById("nm").value.trim(); if (v) { state.data.name = v; Store.save(); render(); toast("Name saved."); } },
    copy: el => { const t = document.getElementById(el.dataset.src); navigator.clipboard.writeText(t.value).then(() => toast("Copied."), () => { t.select(); toast("Select all and copy."); }); },
    import: () => {
      const raw = document.getElementById("imp").value.trim();
      if (!raw) return toast("Paste a backup first.");
      let data; try { data = JSON.parse(raw); } catch (e) { return toast("That text is not a valid backup."); }
      if (!data || typeof data.cards !== "object") return toast("That text is not a valid backup.");
      if (!confirmImport) { confirmImport = true; render(); document.getElementById("imp").value = raw; return; }
      confirmImport = false; state.data = normalize(state.pid, Object.assign(data, { id: state.pid })); state.profiles[state.pid] = state.data; Store.save(); render(); toast("Backup imported.");
    },
    reset: () => {
      if (!confirmReset) { confirmReset = true; return render(); }
      confirmReset = false; const name = state.data.name; state.data = freshProfile(state.pid); state.data.name = name; state.profiles[state.pid] = state.data; Store.save(); render(); toast("Progress deleted.");
    }
  };
  document.addEventListener("click", e => {
    activity();
    const w = e.target.closest(".w");
    if (w && !e.target.closest('[data-act="ans"]')) {
      if (P.cur && P.cur.kind === "story" && P.cur.phase === "listen") return;
      openLens({ lex: w.dataset.lex, surface: w.textContent, feat: w.dataset.feat, g: w.dataset.g, c: w.dataset.c, sid: w.dataset.sid || null, inline: true, fromContent: true });
      return;
    }
    const a = e.target.closest("[data-act]");
    if (a && !a.disabled && actions[a.dataset.act]) actions[a.dataset.act](a);
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && overlay.innerHTML) { e.preventDefault(); Voice.stop(); closeSheet(); return; }
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("w")) { e.preventDefault(); e.target.click(); }
  });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") { lastAct = 0; Store.flush(); } });

  /* ================= boot ================= */
  async function refreshPicker() {
    state.loading = true;
    for (const id of PROFILE_IDS) { const l = Store.readLocal(id); if (l) state.profiles[id] = normalize(id, l); }
    renderPicker();
    await Store.init();
    for (const id of PROFILE_IDS) state.profiles[id] = await Store.load(id);
    state.loading = false;
    if (state.view === "picker") renderPicker();
  }
  Voice.init();
  window.__dss = { parse, plain, LEXIDX, state, Voice, surfaceForm };
  refreshPicker();
})();
