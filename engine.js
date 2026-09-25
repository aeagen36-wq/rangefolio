/* Rangefolio engine — the book, scoring, sessions, stages, guns, goals and
   the coach, all local. No server: everything lives in this browser's
   storage (IndexedDB via a tiny wrapper, with a JSON export/import for
   backup). The page talks to it through the same request shapes the
   original server used, so the UI didn't have to change much.

   Scoring references (see docs/SCORING.md for rule numbers and sources):
   - Drills: pass = clean & ≤ par; IDPA-style time-plus (+1 C, +3 D, +5 miss);
     USPSA-style hit factor (A5 C3 D1 M-10 minor) as a comparison number.
   - Stages: USPSA Comstock per target (best N hits, misses per required
     hit, no-shoot/procedural -10, procedurals capped, net ≥ 0, HF = net/time)
     or time-plus (USPSA Multigun 9.3 default; UML and TX3G schedules).
*/
(() => {
"use strict";

// ---------------------------------------------------------------- storage
const DB_NAME = "rangefolio", STORE = "book", KEY = "book", PHOTOS = "photos";
const SCHEMA = 2;   // bump with a migration below when the book's shape changes
let memBook = null;
function idb() {
  return new Promise((ok, no) => {
    if (!window.indexedDB) return ok(null);
    const r = indexedDB.open(DB_NAME, 2);
    r.onupgradeneeded = () => { const db = r.result; if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE); if (!db.objectStoreNames.contains(PHOTOS)) db.createObjectStore(PHOTOS); };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ok(null);
  });
}
// Photos live in their own store, keyed by run id, so the book itself
// (and its JSON backup) stays small. A run keeps `photo: true` as a flag.
async function photoPut(id, dataUrl) { try { const db = await idb(); if (!db) return false; await new Promise(ok => { const t = db.transaction(PHOTOS, "readwrite").objectStore(PHOTOS).put(dataUrl, id); t.onsuccess = ok; t.onerror = ok; }); return true; } catch { return false; } }
async function photoGet(id) { try { const db = await idb(); if (!db) return null; return await new Promise(ok => { const t = db.transaction(PHOTOS).objectStore(PHOTOS).get(id); t.onsuccess = () => ok(t.result || null); t.onerror = () => ok(null); }); } catch { return null; } }
async function photoDel(id) { try { const db = await idb(); if (!db) return; await new Promise(ok => { const t = db.transaction(PHOTOS, "readwrite").objectStore(PHOTOS).delete(id); t.onsuccess = ok; t.onerror = ok; }); } catch {} }
async function photoCount() { try { const db = await idb(); if (!db) return 0; return await new Promise(ok => { const t = db.transaction(PHOTOS).objectStore(PHOTOS).count(); t.onsuccess = () => ok(t.result || 0); t.onerror = () => ok(0); }); } catch { return 0; } }

// ---------------------------------------------------------------- migrations
// Each step takes the book from schema n to n+1. Never delete a field a
// user typed; add, rename, or default. `schema` is written on every save.
const MIGRATIONS = {
  1: d => {   // -> 2: profiles, classes, events, meta
    for (const s of Object.values(d.shooters || {})) s.profile ||= {};
    d.classes ||= []; d.events ||= []; d.meta ||= {};
    d.runs.forEach(r => { if (r.placement && !r.placement.target) r.placement.target = "uspsa"; });
  },
};
function migrate(d) {
  let v = +d.schema || 1, changed = false;
  while (v < SCHEMA) { if (MIGRATIONS[v]) MIGRATIONS[v](d); v++; changed = true; }
  if (d.schema !== SCHEMA) { d.schema = SCHEMA; changed = true; }
  return changed;
}
function defaults(d) {
  d = d || {};
  d.runs ||= []; d.shooters ||= {}; d.programs ||= []; d.stages ||= []; d.guns ||= [];
  d.custom_drills ||= []; d.classes ||= []; d.events ||= []; d.meta ||= {};
  return d;
}
async function loadBook() {
  if (memBook) return memBook;
  let d = null;
  try {
    const db = await idb();
    if (db) d = await new Promise(ok => { const t = db.transaction(STORE).objectStore(STORE).get(KEY); t.onsuccess = () => ok(t.result || null); t.onerror = () => ok(null); });
  } catch {}
  if (!d) { try { d = JSON.parse(localStorage.getItem("rangefolio.book") || "null"); } catch {} }
  d = defaults(d);
  const was = d.schema || (d.runs.length || Object.keys(d.shooters).length ? 1 : SCHEMA);
  d.schema = was;
  memBook = d;
  if (migrate(d)) await saveBook(d);
  return d;
}
async function saveBook(d) {
  memBook = d;
  try { localStorage.setItem("rangefolio.book", JSON.stringify(d)); } catch {}
  try {
    const db = await idb();
    if (db) await new Promise(ok => { const t = db.transaction(STORE, "readwrite").objectStore(STORE).put(d, KEY); t.onsuccess = ok; t.onerror = ok; });
  } catch {}
}
const uid = n => Array.from(crypto.getRandomValues(new Uint8Array(n))).map(b => (b % 16).toString(16)).join("");
const nowIso = () => { const d = new Date(); const p = x => String(x).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
const today = () => nowIso().slice(0, 10);
const r2 = x => Math.round(x * 100) / 100;

// ---------------------------------------------------------------- data
let D = null;   // drills.json
let L = null;   // loads.json
async function data() {
  if (!D) D = await fetch("data/drills.json").then(r => r.json());
  if (!L) L = await fetch("data/loads.json").then(r => r.json());
  return D;
}
function drillsAll(book) {
  return D.drills.concat(book.custom_drills || []);
}
function byKey(book, key) {
  const d = drillsAll(book).find(x => x.key === key);
  if (d) return d;
  if (String(key).startsWith("stage:")) { const st = stageById(book, String(key).slice(6)); return st ? stageAsDrill(st) : null; }
  return null;
}
function findDrill(book, said) {
  const raw = String(said || "").trim();
  if (raw.startsWith("stage:")) return byKey(book, raw);
  const t = raw.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
  if (!t) return null;
  const all = drillsAll(book);
  const names = d => [d.name, d.key.replace(/-/g, " "), ...(d.also || [])].map(x => String(x).toLowerCase().replace(/[-_]/g, " "));
  let hit = all.find(d => names(d).includes(t));
  if (hit) return hit;
  const more = all.filter(d => names(d).some(n => t.includes(n))).sort((a, b) => Math.max(...names(b).map(n => n.length)) - Math.max(...names(a).map(n => n.length)));
  if (more.length) return more[0];
  const less = all.filter(d => names(d).some(n => n.includes(t)));
  if (less.length === 1) return less[0];
  if (less.length > 1) return { ambiguous: less.map(d => d.name) };
  return null;
}

// ---------------------------------------------------------------- stages
function stageAsDrill(st) {
  const guns = [], pos = st.positions || [];
  let rounds = 0;
  pos.forEach(p => { const g = p.gun || "pistol"; if (!guns.includes(g)) guns.push(g); (p.targets || []).forEach(t => { rounds += (+t.n || 0) * (+t.rounds || 0); }); });
  const how = pos.map((p, i) => `P${i + 1}${p.label ? " " + p.label : ""}: ` + (p.targets || []).map(t => `${t.n}x${t.kind || "paper"} @${t.dist || "?"}yd x${t.rounds}`).join(", ")
    + (st.format === "3gun" ? ` · ${p.gun}` : "") + (p.reload ? " · reload" : "") + (p.move ? ` · move ${p.move}yd` : "")).join("; ");
  return { key: "stage:" + st.id, name: st.name || "Stage", weapon: guns.length === 1 ? guns[0] : "both", guns, rounds, par: 0, dist: null,
    section: "Stages", targets: stageTargets(st), reload: pos.some(p => p.reload), dry: false, also: [], head: 0,
    source: (st.format || "uspsa").toUpperCase(), how, stage: true, format: st.format || "uspsa", rules: st.rules, skills: [], why: "" };
}
function stageTargets(st) {
  const out = [];
  (st.positions || []).forEach((p, pi) => (p.targets || []).forEach(g => { for (let k = 0; k < (+g.n || 1); k++) {
    const kind = g.kind || "paper", paper = kind === "paper";
    out.push({ i: out.length + 1, pos: pi + 1, kind, paper, req: paper ? (+g.rounds || 2) : 1, dist: g.dist, gun: p.gun || "pistol" });
  } }));
  return out;
}
function allStages(book) { return D.default_stages.concat(book.stages || []); }
function stageById(book, id) { return allStages(book).find(s => s.id === id) || null; }
function stageAmmo(st) { const o = {}; (st.positions || []).forEach(p => { const g = p.gun || "pistol"; o[g] = (o[g] || 0) + (p.targets || []).reduce((n, t) => n + (+t.n || 0) * (+t.rounds || 0), 0); }); return o; }
function stagesOut(book) { return allStages(book).map(st => { const ammo = stageAmmo(st); return { ...st, ammo, rounds: Object.values(ammo).reduce((a, b) => a + b, 0), drill: stageAsDrill(st) }; }); }
function scoreStage(st, targets, secs, power, noshoot, procedural) {
  const defs = stageTargets(st), fmt = st.format || "uspsa";
  const rules = D.time_plus_rules[st.rules || "mg"] || D.time_plus_rules.mg;
  const [pc, pd] = String(power).toLowerCase() === "major" ? [4, 2] : [3, 1];
  let points = 0, misses = 0, ftn = 0, fte = 0, tmiss = 0, tp = 0;
  const per = [], agg = { a: 0, c: 0, d: 0, miss: 0 };
  defs.forEach((td, i) => {
    const t = targets[i] || {}; const engaged = t.engaged !== false;
    const row = { i: td.i, kind: td.kind, req: td.req };
    if (td.paper) {
      const a = Math.max(0, +t.a || 0), c = Math.max(0, +t.c || 0), d = Math.max(0, +t.d || 0);
      let take = td.req; const sa = Math.min(a, take); take -= sa; const sc = Math.min(c, take); take -= sc; const sd = Math.min(d, take); take -= sd;
      const m = take;
      Object.assign(row, { a: sa, c: sc, d: sd, miss: m, extra: a + c + d - (sa + sc + sd), engaged });
      points += 5 * sa + pc * sc + pd * sd; misses += m; agg.a += sa; agg.c += sc; agg.d += sd; agg.miss += m;
      if (fmt === "3gun") {
        const hits = a + c + d, neutral = a >= 1 || hits >= 2;
        if (!engaged && hits === 0) { fte++; tp += rules.fte + rules.paper_miss; row.pen = "FTE"; }
        else if (hits === 0) { tmiss++; tp += rules.paper_miss; row.pen = "miss"; }
        else if (!neutral) { ftn++; tp += rules.ftn; row.pen = "FTN"; }
      } else if (!engaged && a + c + d === 0) fte++;
    } else {
      const down = !!t.down;
      Object.assign(row, { down, miss: down ? 0 : 1, engaged });
      if (down) { points += 5; agg.a++; }
      else {
        misses++; agg.miss++;
        if (fmt === "3gun") {
          const far = (td.dist || 0) >= rules.far_yd; const pen = far ? rules.steel_miss_far : rules.steel_miss;
          if (!engaged) { fte++; tp += rules.fte; row.pen = "FTE"; } else { tmiss++; row.pen = "miss"; }
          tp += pen;
        } else if (!engaged) fte++;
      }
    }
    per.push(row);
  });
  let ns = Math.max(0, +noshoot || 0); if (rules.ns_cap && fmt === "3gun") ns = Math.min(ns, rules.ns_cap * 4);
  const proc = Math.max(0, +procedural || 0);
  const maxHits = defs.reduce((n, t) => n + t.req, 0), possible = 5 * maxHits;
  const out = { format: fmt, power: String(power).toLowerCase(), possible, targets: per, misses: fmt === "3gun" ? tmiss : misses, point_misses: misses,
    ftn, fte, noshoot: ns, procedural: proc, hits: agg, rules: fmt === "3gun" ? rules.name : "USPSA Comstock", per_target: true };
  if (fmt === "3gun") {
    tp += rules.noshoot * ns + rules.procedural * proc;
    out.points = points; out.penalty_secs = r2(tp); out.time_plus = secs ? r2(secs + tp) : null; out.hit_factor = null;
  } else {
    const procEff = Math.min(proc + fte, maxHits), penPts = 10 * (misses + ns + procEff), net = Math.max(0, points - penPts);
    out.points = net; out.raw_points = points; out.penalty_points = penPts; out.hit_factor = secs ? Math.round(net / secs * 10000) / 10000 : null; out.time_plus = null;
  }
  out.pct = possible ? Math.round(1000 * Math.max(out.points, 0) / possible) / 10 : null;
  return out;
}

// ---------------------------------------------------------------- scoring a run
function normHits(h) {
  const out = {};
  for (const [k, v] of Object.entries(h || {})) { const n = parseInt(v); if (!(n > 0)) continue; const z = D.zones[String(k).trim().toLowerCase()] || String(k).trim().toLowerCase(); out[z] = (out[z] || 0) + n; }
  return out;
}
function headCount(h) { let n = 0, seen = false; for (const [k, v] of Object.entries(h || {})) if (D.head_words.includes(String(k).toLowerCase())) { seen = true; n += Math.max(0, parseInt(v) || 0); } return seen ? n : null; }
function parFor(book, who, d) { const p = ((book.shooters[who] || {}).par || {})[d.key]; return p != null ? +p : d.par; }
function goalFor(book, who, key) { return ((book.shooters[who] || {}).goals || {})[key] || null; }
// Where the rounds went, if the target pane or a photo was used. Normalised
// to the target's viewBox (0..1), in shot order, with the point of aim.
function normPlacement(p) {
  if (!p || !Array.isArray(p.shots)) return null;
  const clamp = v => Math.min(1, Math.max(0, +v || 0));
  const shots = p.shots.slice(0, 60).map(s => { const o = { x: Math.round(clamp(s.x) * 1000) / 1000, y: Math.round(clamp(s.y) * 1000) / 1000, z: String(s.z || "miss") }; if (s.head) o.head = true; if (s.dbl) o.dbl = true; return o; });
  if (!shots.length) return null;
  const t = String(p.target || "uspsa").slice(0, 12);
  const poa = p.poa && isFinite(+p.poa.x) ? { x: Math.round(clamp(p.poa.x) * 1000) / 1000, y: Math.round(clamp(p.poa.y) * 1000) / 1000 } : (window.RF_TARGETS ? window.RF_TARGETS.defaultPoa(t) : { x: .5, y: .45 });
  return { target: t, poa, shots, source: p.source === "photo" ? "photo" : "tap" };
}
function buildRow(book, who, d, secsIn, hitsIn, note, gun, load, headHits, shots, dry, penalties, targets, placement) {
  let spokenHead = headCount(hitsIn); if (headHits != null && headHits !== "") spokenHead = parseInt(headHits);
  let hits = normHits(hitsIn), fired = Object.values(hits).reduce((a, b) => a + b, 0);
  let shotsL = (shots || []).map(Number).filter(x => isFinite(x) && x > 0).slice(0, 60).map(r2);
  let seconds = secsIn;
  if (shotsL.length && (seconds == null || seconds === "")) seconds = shotsL[shotsL.length - 1];
  const splits = shotsL.slice(1).map((b, i) => r2(b - shotsL[i]));
  let secs = seconds == null || seconds === "" || !isFinite(+seconds) ? null : r2(+seconds);
  const needHead = +d.head || 0; let short = 0;
  if (needHead && spokenHead != null) short = Math.max(0, needHead - spokenHead);
  let scored = { ...hits };
  if (short) { let left = short; for (const z of ["a", "c", "d"]) { if (left <= 0) break; const take = Math.min(left, scored[z] || 0); if (take) { scored[z] -= take; left -= take; } } scored.miss = (scored.miss || 0) + short; for (const k of Object.keys(scored)) if (!(scored[k] > 0)) delete scored[k]; }
  let missesAll = scored.miss || 0;
  dry = !!dry || (fired === 0 && !!d.dry);
  let clean = (missesAll === 0 && fired > 0) || dry;
  const par = parFor(book, who, d);
  let made = !!(clean && secs != null && par > 0 && secs <= par);
  let tpPen = 0, pts = 0;
  for (const [z, n] of Object.entries(scored)) { tpPen += (D.time_plus[z] ?? 5) * n; pts += (D.points[z] ?? -10) * n; }
  let timePlus = secs ? r2(secs + tpPen) : null, hitFactor = secs ? Math.round(Math.max(pts, 0) / secs * 1000) / 1000 : null, points = pts;
  if (dry) { timePlus = secs; hitFactor = null; points = 0; }
  const g = goalFor(book, who, d.key); let goalMet = null;
  if (g && secs != null && !dry) { const allA = fired > 0 && (scored.a || 0) === fired; goalMet = !!((g.all_a !== false ? allA : clean) && secs <= +g.secs); }
  let pen = null;
  if (d.stage && targets) {
    const st = stageById(book, d.key.slice(6));
    const sc = scoreStage(st, targets, secs, (penalties || {}).power || "minor", (penalties || {}).noshoot, (penalties || {}).procedural);
    hits = {}; for (const [k, v] of Object.entries(sc.hits)) if (v) hits[k] = v;
    if (sc.format === "3gun") { delete hits.miss; if (sc.misses) hits.miss = sc.misses; }
    scored = { ...hits }; fired = Object.values(hits).reduce((a, b) => a + b, 0); missesAll = sc.misses;
    clean = missesAll === 0 && !sc.noshoot && !sc.procedural && !sc.ftn && !sc.fte;
    points = sc.points; hitFactor = sc.hit_factor; timePlus = sc.time_plus;
    pen = sc;
  } else if (d.stage) {
    pen = { noshoot: Math.max(0, +(penalties || {}).noshoot || 0), procedural: Math.max(0, +(penalties || {}).procedural || 0), power: String((penalties || {}).power || "minor").toLowerCase() };
    const [pc, pd] = pen.power === "major" ? [4, 2] : [3, 1];
    points = 5 * (scored.a || 0) + pc * (scored.c || 0) + pd * (scored.d || 0) - 10 * (scored.miss || 0) - 10 * pen.noshoot - 10 * pen.procedural;
    pen.possible = 5 * (d.rounds || 0); pen.pct = pen.possible ? Math.round(1000 * Math.max(points, 0) / pen.possible) / 10 : null;
    pen.rules = d.format === "3gun" ? "time-plus (totals)" : "USPSA Comstock (totals)";
    clean = missesAll === 0 && !pen.noshoot && !pen.procedural && fired > 0;
    if (secs) { hitFactor = Math.round(Math.max(points, 0) / secs * 1000) / 1000; timePlus = r2(secs + 5 * ((scored.miss || 0) + pen.noshoot + pen.procedural)); } else { hitFactor = null; timePlus = null; }
  }
  const row = { id: uid(10), who, drill: d.key, name: d.name, at: nowIso(), secs, hits, scored, fired, misses: missesAll, head_short: short,
    head_hits: spokenHead, shots: shotsL, splits, par, clean, made, dry, stage: pen, goal: g ? +g.secs : null, goal_all_a: g ? g.all_a !== false : null, goal_met: goalMet,
    time_plus: timePlus, hit_factor: hitFactor, points, gun: String(gun || "").slice(0, 40), load: String(load || "").slice(0, 40), note: String(note || "").slice(0, 300) };
  const pl = normPlacement(placement); if (pl && !dry) row.placement = pl;
  return row;
}
function sayRun(row, d, best, priorCount) {
  const counted = Object.entries(row.hits).filter(([z]) => z !== "miss").map(([z, n]) => `${n} ${z}`).join(", ");
  const bits = [`${d.name} - ${row.dry ? "dry" : counted || "no hits recorded"}`];
  if (row.fired && row.fired !== d.rounds && !d.stage) bits.push(`(that's ${row.fired} of ${d.rounds})`);
  if (row.head_short) bits.push(`${row.head_short} head shot${row.head_short > 1 ? "s" : ""} called and not on the head - that counts as ${row.head_short === 1 ? "a miss" : "misses"} here`);
  else if (row.misses) bits.push(`${row.misses} off target`);
  if (row.secs == null) { bits.push("no time given"); return bits.join(". ") + "."; }
  const par = +row.par;
  if (par <= 0) {
    const st = row.stage || {}, pens = [];
    if (st.ftn) pens.push(`${st.ftn} not neutralized`); if (st.fte) pens.push(`${st.fte} not engaged`);
    if (row.misses) pens.push(`${row.misses} miss${row.misses !== 1 ? "es" : ""}`); if (st.noshoot) pens.push(`${st.noshoot} no-shoot${st.noshoot !== 1 ? "s" : ""}`); if (st.procedural) pens.push(`${st.procedural} procedural${st.procedural !== 1 ? "s" : ""}`);
    let line = `${row.secs.toFixed(2)}, ${row.points || 0} of ${st.possible ?? "?"} points`;
    if (d.format === "3gun" && row.time_plus != null) line += `, time-plus ${row.time_plus.toFixed(2)}` + (st.penalty_secs ? ` (+${st.penalty_secs.toFixed(0)} s)` : "");
    else if (row.hit_factor != null) line += `, hit factor ${row.hit_factor.toFixed(2)}`;
    if (pens.length) line += " (" + pens.join(", ") + ")";
    bits.push(line);
    if (best != null && row.clean && row.secs < best) bits.push("fastest clean run of it yet"); else if (!priorCount) bits.push("first one on the book");
    return bits.join(". ") + ".";
  }
  const yours = Math.abs(par - d.par) >= 0.005, whose = yours ? "your par" : "par", delta = row.secs - par;
  if (row.made) bits.push(`${row.secs.toFixed(2)} - made ${whose} by ${Math.abs(delta).toFixed(2)}`);
  else if (row.clean) bits.push(`${row.secs.toFixed(2)} - ${whose} is ${par.toFixed(2)}, so ${delta >= 0 ? "+" : ""}${delta.toFixed(2)}`);
  else bits.push(`${row.secs.toFixed(2)}, but not clean - that's not a pass`);
  if (row.goal) {
    if (row.goal_met) bits.push(`goal ${row.goal.toFixed(2)} - met`);
    else { const why = []; const gap = row.secs - row.goal; if (gap > 0) why.push(`${gap.toFixed(2)} slow`);
      if (row.goal_all_a && row.fired && (row.scored.a || 0) !== row.fired) why.push(`${row.fired - (row.scored.a || 0)} not in the A`);
      bits.push(`goal ${row.goal.toFixed(2)} - ` + (why.join(", ") || "not this one")); }
  }
  if (row.time_plus != null && Math.abs(row.time_plus - row.secs) >= 0.01) bits.push(`time-plus ${row.time_plus.toFixed(2)}`);
  const sp = row.splits || [];
  if (sp.length) { const first = row.shots.length ? `first shot ${row.shots[0].toFixed(2)}, ` : ""; bits.push(sp.length === 1 ? `${first}split ${sp[0].toFixed(2)}` : `${first}splits ${Math.min(...sp).toFixed(2)} to ${Math.max(...sp).toFixed(2)}, average ${(sp.reduce((a, b) => a + b, 0) / sp.length).toFixed(2)}`); }
  if (best != null && row.clean) bits.push(row.secs < best ? `best clean run yet, old one was ${best.toFixed(2)}` : `your best clean is ${best.toFixed(2)}`);
  else if (!priorCount) bits.push("first one on the book");
  return bits.join(". ") + ".";
}
async function logRun(b) {
  const book = await loadBook();
  const who = String(b.who || "me").trim().toLowerCase() || "me";
  const d = findDrill(book, b.drill);
  if (d && d.ambiguous) return { ok: false, said: "Which one - " + d.ambiguous.join(", ") + "?", error: "ambiguous" };
  if (!d) return { ok: false, said: `I don't know a drill called '${b.drill}'.`, error: "unknown" };
  const row = buildRow(book, who, d, b.seconds, b.hits, b.note, b.gun, b.load, b.head_hits, b.shots, b.dry, b.penalties, b.targets, b.placement);
  const prior = book.runs.filter(r => r.who === who && r.drill === d.key && r.secs != null && r.clean);
  const best = prior.length ? Math.min(...prior.map(r => r.secs)) : null;
  if (b.photo && typeof b.photo === "string" && b.photo.startsWith("data:image/")) { if (await photoPut(row.id, b.photo)) row.photo = true; }
  book.runs.unshift(row); book.runs = book.runs.slice(0, 4000);
  book.shooters[who] ||= { first_seen: row.at, profile: {} };
  await saveBook(book);
  return { ok: true, said: sayRun(row, d, best, prior.length), run: row };
}
async function editRun(b) {
  const book = await loadBook();
  const i = book.runs.findIndex(r => r.id === b.id);
  if (i < 0) return { ok: false, said: "I can't find that run." };
  const r = book.runs[i];
  if (b.delete) { book.runs.splice(i, 1); await saveBook(book); if (r.photo) photoDel(r.id); return { ok: true, said: `Took ${r.name} (${r.secs ?? "no time"}) off the book.` }; }
  const d = byKey(book, r.drill); if (!d) return { ok: false, said: "That drill isn't on the list any more." };
  const hits = "hits" in b ? b.hits : r.hits, shots = "shots" in b ? b.shots : r.shots;
  let secs = "seconds" in b ? b.seconds : r.secs; if (shots && shots.length && "shots" in b && !("seconds" in b)) secs = null;
  // Editing the counts by hand invalidates the tap-by-tap placement unless the edit came with new placement.
  const keepPlacement = "placement" in b ? b.placement : (("hits" in b && JSON.stringify(normHits(b.hits)) !== JSON.stringify(normHits(r.hits))) ? null : r.placement);
  const row = buildRow(book, r.who, d, secs, hits, "note" in b ? b.note : r.note, r.gun, r.load, "head_hits" in b ? b.head_hits : r.head_hits, shots,
    "dry" in b ? b.dry : r.dry, "penalties" in b ? b.penalties : r.stage, "targets" in b ? b.targets : ((r.stage || {}).per_target ? r.stage.targets : null), keepPlacement);
  row.id = r.id; row.at = r.at; row.edited = nowIso(); if (r.photo) row.photo = true;
  if (b.drop_photo && r.photo) { delete row.photo; photoDel(r.id); }
  book.runs[i] = row; await saveBook(book);
  return { ok: true, said: "Updated.", run: row };
}

// ---------------------------------------------------------------- placement
// Group maths on the stored taps. Everything is in inches from the point of
// aim (x right, y up). The "read" is the classic diagnostic chart, keyed to
// handedness and phrased as "consistent with" - a place to start, not a
// verdict. n counts shots on the card (misses off the card carry no position).
const DIAG = {
  center: "Group is centred on the point of aim. The fundamentals are holding - the work now is speed.",
  low_left: "consistent with jerking the trigger or anticipating recoil: the whole hand tightens as the shot breaks.",
  low: "consistent with anticipating recoil - pushing down into the shot, or breaking the wrist.",
  left: "consistent with too much trigger finger, or squeezing with the fingers instead of pressing straight back.",
  right: "consistent with too little trigger finger (pushing the trigger sideways) or thumb pressure on the frame.",
  high: "consistent with heeling - pushing with the heel of the hand as the shot breaks - or lifting the head to watch the hit.",
  low_right: "consistent with tightening the fingers of the strong hand as the shot breaks.",
  high_left: "consistent with anticipating recoil and pushing with the support hand.",
  high_right: "consistent with heeling and thumb pressure together.",
  v_string: "Vertical stringing: consistent with grip pressure or breathing changing shot to shot; on fast strings, recoil control.",
  h_string: "Horizontal stringing: consistent with trigger-finger pressure varying shot to shot, or eye dominance pulling the sights.",
};
function placementStats(runs, target, dist, hand) {
  const T = window.RF_TARGETS; if (!T) return null;
  const pts = []; let n_runs = 0, first = [];
  for (const r of runs) {
    const p = r.placement; if (!p || !p.shots || !p.shots.length) continue;
    if (target && p.target !== target) continue;
    n_runs++;
    p.shots.forEach((s, i) => { if (s.z === "miss") return; const q = T.toInches(p.target, s.x, s.y, p.poa); pts.push(q); if (i === 0) first.push(q); });
  }
  if (pts.length < 3) return { n: pts.length, n_runs, enough: false };
  const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
  const mx = mean(pts.map(p => p.x)), my = mean(pts.map(p => p.y));
  const sd = (xs, m) => Math.sqrt(mean(xs.map(v => (v - m) * (v - m))));
  const sdx = sd(pts.map(p => p.x), mx), sdy = sd(pts.map(p => p.y), my);
  const radius = mean(pts.map(p => Math.hypot(p.x - mx, p.y - my)));
  let spread = 0; for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) spread = Math.max(spread, Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y));
  const yd = dist || 7, tol = Math.max(1, 0.25 * yd);            // how far off centre matters, scaled with distance
  const hx = hand === "left" ? -mx : mx;                          // mirror for a left-hander so the chart reads the same
  const off = Math.hypot(mx, my);
  let dir = "center";
  if (off >= tol) {
    const L = hx < -tol * 0.6, R = hx > tol * 0.6, D = my < -tol * 0.6, U = my > tol * 0.6;
    dir = D && L ? "low_left" : D && R ? "low_right" : U && L ? "high_left" : U && R ? "high_right" : D ? "low" : U ? "high" : L ? "left" : "right";
  }
  const reads = [];
  if (dir === "center") reads.push(DIAG.center);
  else reads.push(`Group centre is ${Math.abs(mx).toFixed(1)}" ${mx < 0 ? "left" : "right"}, ${Math.abs(my).toFixed(1)}" ${my < 0 ? "low" : "high"} of the point of aim - ${DIAG[dir]}`);
  if (sdy > 1.6 * sdx && sdy > tol * 0.8) reads.push(DIAG.v_string);
  else if (sdx > 1.6 * sdy && sdx > tol * 0.8) reads.push(DIAG.h_string);
  let firstRead = null;
  if (first.length >= 3 && pts.length >= 8) {
    const fx = mean(first.map(p => p.x)), fy = mean(first.map(p => p.y)), d1 = Math.hypot(fx - mx, fy - my);
    if (d1 >= tol) firstRead = `First shot of each string lands ${d1.toFixed(1)}" from the rest of the group (${Math.abs(fy - my).toFixed(1)}" ${fy < my ? "lower" : "higher"}) - that's the draw or the presentation, not the trigger.`;
  }
  const solid = pts.length >= 15;
  return { n: pts.length, n_runs, enough: true, solid, mx: r2(mx), my: r2(my), sdx: r2(sdx), sdy: r2(sdy), radius: r2(radius), spread: r2(spread), dir, tol: r2(tol), hand: hand || "right",
    reads, first: firstRead, pts: pts.slice(0, 120).map(p => ({ x: r2(p.x), y: r2(p.y) })), target: target || (runs.find(r => r.placement) || { placement: {} }).placement.target };
}

// ---------------------------------------------------------------- goals + coach
function suggestGoal(book, who, d, runs) {
  let pro = D.pro[d.key]; const par = parFor(book, who, d);
  const clean = (runs || []).filter(r => r.clean && r.secs).map(r => r.secs); const best = clean.length ? Math.min(...clean) : null;
  if (pro == null) pro = r2(par * 0.7);
  let secs;
  if (best == null) secs = Math.min(par, r2(pro * 1.25)); else if (best <= pro * 1.05) secs = r2(pro * 0.95); else secs = r2(Math.max(pro, best * 0.9));
  return { secs, all_a: true, pro, par, best };
}
function analyse(book, who, d, runs) {
  const WINDOW = 12, rs = runs.filter(r => !r.dry).slice(0, WINDOW);
  if (!rs.length) return { focus: "new", why: "only dry reps so far", plan: "Shoot it live and come back.", a_pct: null, miss_pct: null, best: null, last3: [], goal: suggestGoal(book, who, d, []), n: 0, window: WINDOW, trend: null, skills: d.skills || [], drill_why: d.why || "" };
  const fired = rs.reduce((n, r) => n + (r.fired || 0), 0) || 1;
  const a = rs.reduce((n, r) => n + ((r.scored || r.hits || {}).a || 0), 0), miss = rs.reduce((n, r) => n + (r.misses || 0), 0);
  const a_pct = Math.round(100 * a / fired), miss_pct = Math.round(100 * miss / fired);
  const clean = rs.filter(r => r.clean && r.secs).map(r => r.secs), best = clean.length ? Math.min(...clean) : null;
  const goal = goalFor(book, who, d.key) || suggestGoal(book, who, d, rs), gsecs = +goal.secs;
  let trend = null;
  if (rs.length >= 6) {
    const k = Math.max(2, Math.floor(rs.length / 3)), nw = rs.slice(0, k), old = rs.slice(-k);
    const avg = xs => xs.length ? xs.reduce((x, y) => x + y, 0) / xs.length : null;
    const tn = avg(nw.filter(r => r.secs).map(r => r.secs)), to = avg(old.filter(r => r.secs).map(r => r.secs));
    const an = avg(nw.map(r => ((r.scored || r.hits || {}).a || 0) / (r.fired || 1))), ao = avg(old.map(r => ((r.scored || r.hits || {}).a || 0) / (r.fired || 1)));
    const dt = tn && to ? (tn - to) / to : 0, da = an != null && ao != null ? an - ao : 0;
    if (dt < -0.05 && da >= -0.05) trend = ["up", `faster by ${Math.abs(dt * 100).toFixed(0)}% without losing hits`];
    else if (da > 0.08 && dt <= 0.05) trend = ["up", `A's up ${(da * 100).toFixed(0)} points at the same pace`];
    else if (dt > 0.05 && da < 0.05) trend = ["down", `slower by ${(dt * 100).toFixed(0)}% lately`];
    else if (da < -0.08) trend = ["down", `A's down ${Math.abs(da * 100).toFixed(0)} points - pushing too hard`];
    else trend = ["flat", "holding steady"];
  }
  const accBad = a_pct < 80 || miss_pct > 8 || best == null, slow = best != null && best > gsecs * 1.05;
  let focus, why;
  if (accBad && slow) { focus = "both"; why = best ? `${a_pct}% A's and best clean ${best.toFixed(2)} vs goal ${gsecs.toFixed(2)}` : `${a_pct}% A's, no clean run yet`; }
  else if (accBad) { focus = "accuracy"; why = `${a_pct}% in the A` + (miss_pct ? `, ${miss_pct}% off target` : ""); }
  else if (slow) { focus = "speed"; why = `hits are there (${a_pct}% A) - best clean ${best.toFixed(2)}, goal ${gsecs.toFixed(2)}`; }
  else { focus = "hold"; why = `${a_pct}% A's at ${best.toFixed(2)} - goal met`; }
  const nm = k => (byKey(book, k) || {}).name;
  const plan = {
    accuracy: `Slow down until it's all A's - shoot it at about ${((best || gsecs) * 1.25).toFixed(1)}s and get three clean runs in a row before you chase time. Add: ` + D.focus.accuracy.slice(0, 2).map(nm).filter(Boolean).join(", ") + ".",
    speed: `Accuracy is earned - now push. Run it at ${gsecs.toFixed(2)} and accept a C; then bring the C's back to A's at that speed. Add: ` + D.focus.speed.filter(k => k !== d.key).slice(0, 2).map(nm).filter(Boolean).join(", ") + ".",
    both: "Split it: one block slow and clean, one block at goal pace and count the hits. Don't mix them in a string. Add: " + D.focus.both.filter(k => k !== d.key).slice(0, 2).map(nm).filter(Boolean).join(", ") + ".",
    hold: `Keep it warm once a session and raise the goal to ${(gsecs * 0.93).toFixed(2)}.`,
  }[focus];
  const hand = ((book.shooters[who] || {}).profile || {}).hand || "right";
  const placement = placementStats(rs, null, d.dist, hand);
  return { focus, why, a_pct, miss_pct, best, last3: rs.slice(0, 3).map(r => r.secs).filter(Boolean), goal, plan, n: rs.length, window: WINDOW, trend, skills: d.skills || [], drill_why: d.why || "", placement: placement && placement.enough ? placement : null };
}
// The whole pistol book at once: the same read over every pistol drill's
// last runs, so a shooter with a few taps on each still gets a picture.
function placementOverall(book, who) {
  const hand = ((book.shooters[who] || {}).profile || {}).hand || "right";
  const runs = book.runs.filter(r => r.who === who && r.placement && !r.dry).slice(0, 60);
  const byT = {}; runs.forEach(r => (byT[r.placement.target] ||= []).push(r));
  const out = [];
  for (const [t, rs] of Object.entries(byT)) {
    const dists = rs.map(r => (byKey(book, r.drill) || {}).dist).filter(Boolean);
    const dist = dists.length ? dists.reduce((a, b) => a + b, 0) / dists.length : 7;
    const s = placementStats(rs, t, dist, hand); if (s && s.enough) out.push(s);
  }
  return out.sort((a, b) => b.n - a.n);
}
async function coach(who) {
  const book = await loadBook(); who = String(who || "me").toLowerCase();
  const runs = book.runs.filter(r => r.who === who && !String(r.drill).startsWith("stage:"));
  const seen = {}; runs.forEach(r => (seen[r.drill] ||= []).push(r));
  const rows = [];
  for (const d of drillsAll(book)) { const rs = seen[d.key]; if (!rs) continue; const a = analyse(book, who, d, rs); a.key = d.key; a.name = d.name; a.par = parFor(book, who, d); a.goal_set = !!goalFor(book, who, d.key); a.goal_hits = rs.slice(0, 12).filter(r => r.goal_met).length; rows.push(a); }
  const order = { both: 0, accuracy: 1, speed: 2, hold: 3 }; rows.sort((x, y) => (order[x.focus] ?? 9) - (order[y.focus] ?? 9) || (y.n || 0) - (x.n || 0));
  const need = { accuracy: 0, speed: 0 }; rows.forEach(a => { if (a.focus === "accuracy" || a.focus === "both") need.accuracy++; if (a.focus === "speed" || a.focus === "both") need.speed++; });
  const lean = need.accuracy > need.speed ? "accuracy" : need.speed > need.accuracy ? "speed" : rows.length ? "both" : "new";
  const shot = new Set(Object.keys(seen));
  const suggest = {}; for (const [k, v] of Object.entries(D.focus)) suggest[k] = v.filter(x => !shot.has(x)).map(x => (byKey(book, x) || {}).name).filter(Boolean).slice(0, 3);
  const td = today(), todays = runs.filter(r => r.at.startsWith(td));
  const pl = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const head = `${pl(runs.length, "run")} across ${shot.size} of ${drillsAll(book).length} drills` + (todays.length ? ` · today ${pl(todays.length, "run")}, ${pl(todays.filter(r => r.made).length, "pass").replace("passs", "passes")}` : "") + ".";
  const verdict = { accuracy: "Overall: accuracy first. You're fast enough on most of these - the hits aren't holding.", speed: "Overall: you're accurate. The work now is speed - accept a few C's while you push.",
    both: "Overall: mixed - split sessions into a slow-clean block and a fast block.", new: "Nothing on the book yet. Shoot a Bill Drill and a draw and come back." }[lean];
  return { head, lean, verdict, drills: rows, suggest, never: drillsAll(book).filter(d => !shot.has(d.key)).map(d => d.name).slice(0, 8), matches: coachMatches(book, who),
    placement: placementOverall(book, who), profile: (book.shooters[who] || {}).profile || {} };
}
function coachMatches(book, who) {
  const runs = book.runs.filter(r => r.who === who && String(r.drill).startsWith("stage:") && r.secs);
  const by = {}; runs.forEach(r => (by[r.drill] ||= []).push(r));
  const out = [];
  for (const [key, all] of Object.entries(by)) {
    const d = byKey(book, key); if (!d) continue; const rs = all.slice(0, 12), fmt = d.format || "uspsa";
    const pct = rs.map(r => (r.stage || {}).pct).filter(x => x != null), hf = rs.map(r => r.hit_factor).filter(Boolean), tp = rs.map(r => r.time_plus).filter(Boolean);
    const pens = rs.reduce((n, r) => n + ((r.stage || {}).noshoot || 0) + ((r.stage || {}).procedural || 0) + ((r.stage || {}).ftn || 0) + ((r.stage || {}).fte || 0), 0);
    const miss = rs.reduce((n, r) => n + (r.misses || 0), 0), avg_pct = pct.length ? Math.round(pct.reduce((a, b) => a + b, 0) / pct.length) : null;
    const best = fmt !== "3gun" ? (hf.length ? Math.max(...hf) : null) : (tp.length ? Math.min(...tp) : null);
    let focus, why;
    if (avg_pct != null && avg_pct < 85) { focus = "accuracy"; why = `keeping ${avg_pct}% of the points - the hits are what's costing you`; }
    else if (miss + pens > rs.length) { focus = "accuracy"; why = `${miss} misses and ${pens} penalties over ${rs.length} runs`; }
    else { focus = "speed"; why = `${avg_pct}% of the points and clean - the stage is a movement and transitions problem now`; }
    const plan = focus === "accuracy" ? "Shoot it at 80% pace until a run comes back with every target neutralized and no penalties, then add speed one position at a time."
      : "Walk the stage twice with a plan for every position and where the reload goes; run it for time and compare the splits between positions, not the shots.";
    out.push({ key, name: d.name, format: fmt, n: rs.length, avg_pct, best, best_label: fmt !== "3gun" ? "best HF" : "best time-plus", last: fmt !== "3gun" ? rs[0].hit_factor : rs[0].time_plus, misses: miss, penalties: pens, focus, why, plan });
  }
  return out.sort((a, b) => b.n - a.n);
}

// ---------------------------------------------------------------- sessions, shooters, guns, goals
function programAmmo(book, items) {
  const out = { pistol: 0, rifle: 0, shotgun: 0 };
  for (const it of items || []) {
    const d = byKey(book, it.drill); if (!d) continue; const reps = Math.max(1, +it.reps || 1); if (it.dry) continue;
    if (d.stage) { for (const [g, n] of Object.entries(stageAmmo(stageById(book, d.key.slice(6)) || {}))) out[g] = (out[g] || 0) + n * reps; continue; }
    if (d.weapon === "pistol") out.pistol += d.rounds * reps; else if (d.weapon === "rifle") out.rifle += d.rounds * reps; else if (d.weapon === "shotgun") out.shotgun += d.rounds * reps;
    else { const [rf, pi] = D.both_split[d.key] || [Math.floor(d.rounds / 2), d.rounds - Math.floor(d.rounds / 2)]; out.rifle += rf * reps; out.pistol += pi * reps; }
  }
  out.total = Object.values(out).reduce((a, b) => a + b, 0); return out;
}
function programsOut(book) { return (book.programs || []).map(p => ({ ...p, ammo: programAmmo(book, p.items), runs: (p.items || []).reduce((n, it) => n + Math.max(1, +it.reps || 1), 0), drills: (p.items || []).map(it => ({ ...it, name: (byKey(book, it.drill) || {}).name || it.drill })) })); }

// ---------------------------------------------------------------- the API shim
// Same paths and shapes the page already speaks, answered locally.
async function api(path, body) {
  await data(); const book = await loadBook();
  const u = new URL(path, location.origin), q = u.searchParams, p = u.pathname.replace(/^\/api\/range/, "") || "/";
  const who = String(q.get("who") || (body && body.who) || "me").toLowerCase();
  if (p === "/" || p === "") {
    return { who, shooters: Object.keys(book.shooters), drills: drillsAll(book), holds: D.holds, loads: L.calibres, programs: programsOut(book), stages: stagesOut(book),
      guns: book.guns, goals: (book.shooters[who] || {}).goals || {}, warmups: D.warmups, runs: book.runs.filter(r => r.who === who).slice(0, 200),
      profile: (book.shooters[who] || {}).profile || {}, profiles: Object.fromEntries(Object.entries(book.shooters).map(([k, v]) => [k, v.profile || {}])),
      classes: classesOut(book), events: eventsOut(book), meta: book.meta || {}, schema: book.schema };
  }
  // ---- profile: who this shooter is, for the coaching maths and the roster
  if (p === "/profile") {
    const b = body || {}; const sh = book.shooters[who] ||= { first_seen: nowIso(), profile: {} }; sh.profile ||= {};
    const pr = b.profile || {};
    const pick = (k, allowed, max) => { if (!(k in pr)) return; let v = pr[k]; if (allowed) v = allowed.includes(String(v)) ? String(v) : ""; else v = String(v || "").slice(0, max || 60); if (v) sh.profile[k] = v; else delete sh.profile[k]; };
    pick("name"); pick("hand", ["right", "left"]); pick("eye", ["right", "left", "cross"]); pick("discipline", ["uspsa", "3gun", "idpa", "defensive", "precision", "hunting", "new"]);
    pick("level", ["new", "intermediate", "advanced", "competitor"]); pick("email", null, 80); pick("note", null, 200); pick("role", ["shooter", "coach"]);
    sh.profile.updated = nowIso(); await saveBook(book);
    return { ok: true, said: "Profile saved.", profile: sh.profile };
  }
  // ---- classes: what a coach builds for a course. Local only until accounts.
  if (p === "/class/templates") return { ok: true, templates: await classTemplates() };
  if (p === "/class") {
    const b = body || {};
    if (b.delete) { book.classes = book.classes.filter(x => x.id !== b.id); await saveBook(book); return { ok: true, classes: classesOut(book) }; }
    if (b.from_template) {
      const tpl = (await classTemplates()).find(t => t.key === b.from_template); if (!tpl) return { ok: false, said: "No such template." };
      // the class-specific drills it refers to come along, once, into the coach's own drill list
      const need = new Set(); (tpl.modules || []).forEach(m => (m.items || []).forEach(it => need.add(it.drill)));
      for (const dr of CD || []) if (need.has(dr.key) && !drillsAll(book).some(x => x.key === dr.key)) book.custom_drills.push({ ...dr, section: dr.section || "Class drills", mine: true, also: dr.also || [] });
      const cls = { id: uid(8), name: tpl.name, discipline: tpl.discipline, level: tpl.level, about: tpl.about, hours: tpl.hours, rounds_note: tpl.rounds_note,
        prereq: tpl.prereq || "", gear: tpl.gear || "", modules: JSON.parse(JSON.stringify(tpl.modules || [])), template: tpl.key, made: nowIso() };
      book.classes.unshift(cls); await saveBook(book);
      return { ok: true, said: `${cls.name} is yours to edit.`, cls, classes: classesOut(book) };
    }
    const name = String(b.name || "").trim().slice(0, 80); if (!name) return { ok: false, said: "A class needs a name." };
    const modules = (b.modules || []).slice(0, 40).map(m => ({ title: String(m.title || "").slice(0, 80), about: String(m.about || "").slice(0, 1200), minutes: Math.max(0, Math.min(600, parseInt(m.minutes) || 0)),
      live: m.live !== false, items: (m.items || []).slice(0, 40).map(it => ({ drill: String(it.drill || ""), reps: Math.max(1, Math.min(50, +it.reps || 1)), dry: !!it.dry, note: String(it.note || "").slice(0, 200) })).filter(it => byKey(book, it.drill)),
      notes: String(m.notes || "").slice(0, 1200) }));
    const row = { name, discipline: String(b.discipline || "").slice(0, 20), level: String(b.level || "").slice(0, 20), about: String(b.about || "").slice(0, 1200), hours: +b.hours || 0,
      prereq: String(b.prereq || "").slice(0, 300), gear: String(b.gear || "").slice(0, 600), modules, updated: nowIso() };
    let ex = book.classes.find(x => x.id === b.id);
    if (ex) Object.assign(ex, row); else { ex = { ...row, id: uid(8), made: nowIso() }; book.classes.unshift(ex); book.classes = book.classes.slice(0, 60); }
    await saveBook(book); return { ok: true, said: `Saved ${name}.`, cls: ex, classes: classesOut(book) };
  }
  // ---- events: a match or a class day - stages grouped, with a date and a place
  if (p === "/event") {
    const b = body || {};
    if (b.delete) { book.events = book.events.filter(x => x.id !== b.id); await saveBook(book); return { ok: true, events: eventsOut(book) }; }
    const name = String(b.name || "").trim().slice(0, 80); if (!name) return { ok: false, said: "An event needs a name." };
    const row = { name, date: String(b.date || "").slice(0, 10), where: String(b.where || "").slice(0, 80), format: /3.?gun/i.test(String(b.format || "")) ? "3gun" : /class|course/i.test(String(b.format || "")) ? "class" : "uspsa",
      stages: (b.stages || []).map(String).filter(id => stageById(book, id)).slice(0, 40), notes: String(b.notes || "").slice(0, 1200), updated: nowIso() };
    let ex = book.events.find(x => x.id === b.id);
    if (ex) Object.assign(ex, row); else { ex = { ...row, id: uid(8), made: nowIso() }; book.events.unshift(ex); book.events = book.events.slice(0, 60); }
    await saveBook(book); return { ok: true, said: `Saved ${name}.`, event: ex, events: eventsOut(book) };
  }
  // ---- photos, kept outside the book
  if (p === "/photo") { const id = q.get("id") || (body || {}).id; const dataUrl = await photoGet(id); return { ok: !!dataUrl, photo: dataUrl }; }
  if (p === "/photos/count") return { ok: true, count: await photoCount() };
  // ---- meta: tester signals (which coming-soon cards get tapped) and the build stamp
  if (p === "/meta") {
    const b = body || {}; book.meta ||= {};
    if (b.soon) { book.meta.soon ||= {}; book.meta.soon[String(b.soon).slice(0, 40)] = (book.meta.soon[String(b.soon).slice(0, 40)] || 0) + 1; }
    if (b.build) book.meta.build = +b.build;
    if (b.set && typeof b.set === "object") for (const [k, v] of Object.entries(b.set)) book.meta[String(k).slice(0, 40)] = v;
    await saveBook(book); return { ok: true, meta: book.meta };
  }
  if (p === "/run") return logRun(body || {});
  if (p === "/run/edit") return editRun(body || {});
  if (p === "/shooter") { const name = String((body || {}).name || "").trim().toLowerCase(); if (!name) return { ok: false, said: "Who?" }; book.shooters[name] ||= { first_seen: nowIso() }; await saveBook(book); return { ok: true, said: `${name[0].toUpperCase() + name.slice(1)} is on the book.` }; }
  if (p === "/warmup") return D.warmups[q.get("which") || "dry"];
  if (p === "/work") return { text: "", coach: await coach(who) };
  if (p === "/goal") {
    const d = findDrill(book, (body || {}).drill); if (!d || d.ambiguous) return { ok: false, said: "Which drill?" };
    const sh = book.shooters[who] ||= {}; sh.goals ||= {};
    if ((body || {}).clear) { delete sh.goals[d.key]; await saveBook(book); return { ok: true, said: `Goal cleared on ${d.name}.` }; }
    const secs = +(body || {}).seconds; if (!(secs > 0)) return { ok: false, said: "What time?" };
    sh.goals[d.key] = { secs: r2(secs), all_a: (body || {}).all_a !== false, set: today() }; await saveBook(book);
    return { ok: true, said: `${d.name}: goal is ${secs.toFixed(2)}${sh.goals[d.key].all_a ? " with every round in the A" : " clean"}.` };
  }
  if (p === "/program") {
    if ((body || {}).delete) { book.programs = book.programs.filter(x => x.id !== body.id); await saveBook(book); return { ok: true, programs: programsOut(book) }; }
    const name = String((body || {}).name || "").trim().slice(0, 60); if (!name) return { ok: false, said: "A session needs a name." };
    const items = []; for (const it of (body || {}).items || []) { const d = findDrill(book, it.drill || ""); if (!d || d.ambiguous) continue; const row = { drill: d.key, reps: Math.max(1, Math.min(50, +it.reps || 1)) }; if (it.dry) row.dry = true; items.push(row); }
    if (!items.length) return { ok: false, said: "Nothing I recognised in that list." };
    let pr = book.programs.find(x => x.id === (body || {}).id);
    if (pr) { Object.assign(pr, { name, items, updated: nowIso() }); } else { pr = { id: uid(8), name, items, made: nowIso() }; book.programs.unshift(pr); book.programs = book.programs.slice(0, 60); }
    await saveBook(book); const a = programAmmo(book, items);
    return { ok: true, said: `Saved ${name}: ${a.pistol} pistol, ${a.rifle} rifle.`, program: pr, programs: programsOut(book) };
  }
  if (p === "/stage") {
    if ((body || {}).delete) { book.stages = book.stages.filter(x => x.id !== body.id); await saveBook(book); return { ok: true, stages: stagesOut(book) }; }
    const st = body || {}; const name = String(st.name || "").trim().slice(0, 60); if (!name) return { ok: false, said: "A stage needs a name." };
    const fmt = /3.?gun|three gun/i.test(String(st.format || "")) ? "3gun" : "uspsa";
    const positions = (st.positions || []).map(pos => ({ label: String(pos.label || "").slice(0, 40), gun: ["pistol", "rifle", "shotgun"].includes(String(pos.gun || "").toLowerCase()) ? String(pos.gun).toLowerCase() : "pistol",
      move: isFinite(+pos.move) ? +pos.move : 0, reload: !!pos.reload, note: String(pos.note || "").slice(0, 120),
      targets: (pos.targets || []).map(t => ({ n: Math.max(1, Math.min(50, parseInt(t.n) || 1)), rounds: Math.max(1, Math.min(20, parseInt(t.rounds) || 1)), kind: ["paper", "steel", "popper", "plate", "clay", "slug"].includes(String(t.kind || "").toLowerCase()) ? String(t.kind).toLowerCase() : "paper", dist: t.dist === "" || t.dist == null || !isFinite(+t.dist) ? null : +t.dist })) })).filter(p => p.targets.length);
    if (!positions.length) return { ok: false, said: "A stage needs at least one position." };
    const rules = D.time_plus_rules[st.rules] ? st.rules : "mg";
    let ex = st.id && !String(st.id).startsWith("demo-") ? book.stages.find(x => x.id === st.id) : null;
    if (ex) Object.assign(ex, { name, format: fmt, positions, rules, updated: nowIso() }); else { ex = { id: uid(8), name, format: fmt, positions, rules, made: nowIso() }; book.stages.unshift(ex); book.stages = book.stages.slice(0, 80); }
    await saveBook(book); const a = stageAmmo(ex);
    return { ok: true, said: `Saved ${name}: ` + Object.entries(a).map(([g, n]) => `${n} ${g}`).join(", ") + ".", stage: ex, stages: stagesOut(book) };
  }
  if (p === "/gun") {
    if ((body || {}).delete) { book.guns = book.guns.filter(x => x.id !== body.id); await saveBook(book); return { ok: true, guns: book.guns }; }
    const g = body || {}; const name = String(g.name || "").trim().slice(0, 40); if (!name) return { ok: false, said: "A gun needs a name." };
    const num = k => (g[k] === "" || g[k] == null || !isFinite(+g[k])) ? null : +g[k];
    const row = { name, calibre: String(g.calibre || "").slice(0, 20), barrel: num("barrel"), suppressor: String(g.suppressor || "").slice(0, 40), suppressor_len: num("suppressor_len"), twist: num("twist"),
      twist_dir: String(g.twist_dir || "").toLowerCase().startsWith("l") ? "left" : "right", sight_height: num("sight_height"), zero: num("zero"), zero_temp: num("zero_temp"), zero_alt: num("zero_alt"),
      load: String(g.load || "").slice(0, 30), mv: {}, note: String(g.note || "").slice(0, 200) };
    for (const [k, v] of Object.entries(g.mv || {})) if (isFinite(+v)) row.mv[String(k).slice(0, 30)] = +v;
    let ex = book.guns.find(x => x.id === g.id);
    if (ex) Object.assign(ex, row); else { ex = { ...row, id: uid(8) }; book.guns.unshift(ex); book.guns = book.guns.slice(0, 30); }
    await saveBook(book); return { ok: true, said: `Saved ${name}.`, gun: ex, guns: book.guns };
  }
  if (p === "/drill") {   // custom drills: create / edit / delete
    const b = body || {};
    if (b.delete) { book.custom_drills = (book.custom_drills || []).filter(x => x.key !== b.key); await saveBook(book); return { ok: true, drills: drillsAll(book) }; }
    const name = String(b.name || "").trim().slice(0, 60); if (!name) return { ok: false, said: "A drill needs a name." };
    const key = b.key && String(b.key).startsWith("my-") ? b.key : "my-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) + "-" + uid(3);
    const d = { key, name, weapon: ["pistol", "rifle", "shotgun", "both"].includes(b.weapon) ? b.weapon : "pistol", rounds: Math.max(1, Math.min(60, parseInt(b.rounds) || 1)), par: Math.max(0, +b.par || 0),
      dist: b.dist === "" || b.dist == null ? null : +b.dist, section: "Mine", targets: Math.max(1, parseInt(b.targets) || 1), reload: !!b.reload, dry: !!b.dry, also: [], head: Math.max(0, parseInt(b.head) || 0),
      source: "mine", how: String(b.how || "").slice(0, 400), skills: String(b.skills || "").split(",").map(s => s.trim()).filter(Boolean).slice(0, 8), why: String(b.why || "").slice(0, 200), mine: true };
    const ex = (book.custom_drills || []).find(x => x.key === key); if (ex) Object.assign(ex, d); else book.custom_drills.push(d);
    await saveBook(book); return { ok: true, said: `Saved ${name}.`, drill: d, drills: drillsAll(book) };
  }
  if (p === "/export") return { ok: true, book: { ...book, exported: nowIso(), build: window.RF_BUILD ? window.RF_BUILD.n : null } };
  if (p === "/import") {
    const inc = (body || {}).book; if (!inc || !Array.isArray(inc.runs)) return { ok: false, said: "That isn't a Rangefolio backup." };
    const merged = defaults({ ...book, ...inc }); merged.schema = inc.schema || 1; migrate(merged);
    await saveBook(merged); return { ok: true, said: `Imported ${inc.runs.length} runs.` };
  }
  return { ok: false, error: "no such path " + p };
}

// ---------------------------------------------------------------- classes + events helpers
let CT = null, CD = null;
async function classTemplates() {
  if (!CT) { try { const j = await fetch("data/classes.json").then(r => r.json()); CT = j.templates || []; CD = j.drills || []; } catch { CT = []; CD = []; } }
  return CT;
}
function classAmmo(book, cls) {
  const out = { pistol: 0, rifle: 0, shotgun: 0 };
  for (const m of cls.modules || []) { const a = programAmmo(book, m.items); out.pistol += a.pistol || 0; out.rifle += a.rifle || 0; out.shotgun += a.shotgun || 0; }
  out.total = out.pistol + out.rifle + out.shotgun; return out;
}
function classesOut(book) {
  return (book.classes || []).map(c => ({ ...c, ammo: classAmmo(book, c), minutes: (c.modules || []).reduce((n, m) => n + (+m.minutes || 0), 0),
    modules: (c.modules || []).map(m => ({ ...m, ammo: programAmmo(book, m.items), drills: (m.items || []).map(it => ({ ...it, name: (byKey(book, it.drill) || {}).name || it.drill })) })) }));
}
function eventsOut(book) {
  return (book.events || []).map(e => { const sts = (e.stages || []).map(id => stageById(book, id)).filter(Boolean).map(st => ({ ...st, ammo: stageAmmo(st) }));
    const ammo = {}; sts.forEach(st => { for (const [g, n] of Object.entries(st.ammo)) ammo[g] = (ammo[g] || 0) + n; });
    return { ...e, stage_list: sts, ammo, rounds: Object.values(ammo).reduce((a, b) => a + b, 0) }; });
}

// CSV of the book, since a spreadsheet writer isn't in the browser.
async function csv(who) {
  const book = await loadBook(); await data();
  const rows = [["Date", "Shooter", "Drill", "Par", "Goal", "Time", "vs Par", "Time-plus", "Hit factor", "Points", "A", "C", "D", "Miss", "Head shots", "First shot", "Splits", "Clean", "Pass", "Goal met", "Dry", "Note"]];
  for (const r of [...book.runs].reverse()) { if (who && r.who !== who) continue; const h = r.hits || {};
    rows.push([r.at.replace("T", " "), r.who, r.name, r.par, r.goal ?? "", r.secs ?? "", r.secs != null && r.par > 0 ? r2(r.secs - r.par) : "", r.time_plus ?? "", r.hit_factor ?? "", r.points ?? "",
      h.a || 0, (h.c || 0) + (h.b || 0), h.d || 0, h.miss || 0, r.head_hits ?? "", (r.shots || [])[0] ?? "", (r.splits || []).map(x => x.toFixed(2)).join(" "), r.clean ? "yes" : "no", r.made ? "yes" : "no", r.goal_met == null ? "" : r.goal_met ? "yes" : "no", r.dry ? "yes" : "", r.note || ""]); }
  return rows.map(r => r.map(v => { v = String(v ?? ""); return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; }).join(",")).join("\n");
}

window.RangefolioEngine = { api, csv, loadBook, saveBook, data, placementStats, photoGet, SCHEMA };
})();
