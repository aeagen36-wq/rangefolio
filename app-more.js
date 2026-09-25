/* Rangefolio - the second half of the UI.
   Settings (profile, coach mode, build, roadmap, data), the coming-soon
   cards, the camera / photo scorer, coach mode (roster, classes, templates)
   and events. Talks to the page through window.RF (set at the end of the
   main script in index.html) and to the data layer through the same
   /api/range paths everything else uses. */
(() => {
"use strict";
const { $, toast, openSheet, post, esc, cap } = window.RF;
const T = window.RF_TARGETS;
const BUILD = window.RF_BUILD || { n: 0, date: "" };
const CONFIG = window.RF_CONFIG || {};
let ROADMAP = null, CLASSES_DOC = null;
async function roadmap() { if (!ROADMAP) { try { ROADMAP = await fetch("data/roadmap.json").then(r => r.json()); } catch { ROADMAP = { features: [] }; } } return ROADMAP; }
async function classesDoc() { if (!CLASSES_DOC) { try { CLASSES_DOC = await fetch("data/classes.json").then(r => r.json()); } catch { CLASSES_DOC = { templates: [], coming_later: [] }; } } return CLASSES_DOC; }
const st = () => RF.state();
const lget = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch { return d; } };
const lset = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

// ---------------------------------------------------------------- build + update notice
(function buildNotice() {
  const prev = lget("range.build", null);
  lset("range.build", String(BUILD.n));
  if (prev != null && +prev !== BUILD.n) {
    setTimeout(() => toast(`Updated to build ${BUILD.n}`), 900);
    post("/api/range/meta", { build: BUILD.n });
  } else if (prev == null) post("/api/range/meta", { build: BUILD.n });
})();

// ---------------------------------------------------------------- coming soon
// One card for everything that needs a server. The tap is counted so the
// roadmap can be ordered by what people actually reach for.
async function soon(key) {
  const R = await roadmap();
  const f = (R.features || []).find(x => x.key === key) || { title: "Coming soon", blurb: "This one needs accounts and a server behind the app. It's on the list.", needs: "backend" };
  post("/api/range/meta", { soon: key });
  const el = document.createElement("div"); el.className = "soon";
  const needs = { backend: "needs the server", accounts: "needs accounts", model: "needs the vision model", native: "needs the App Store / Play Store build" }[f.needs] || f.needs;
  el.innerHTML = `<div class="box" role="dialog"><div class="tag">Coming soon</div><h3>${esc(f.title)}</h3><p>${esc(f.blurb)}</p><div class="needs">${esc(needs)}</div><button type="button" class="ok">Got it</button></div>`;
  el.addEventListener("click", e => { if (e.target === el || e.target.closest(".ok")) el.remove(); });
  document.body.appendChild(el);
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-soon]"); if (!b) return;
  e.preventDefault(); e.stopPropagation(); soon(b.dataset.soon);
}, true);

// ---------------------------------------------------------------- settings
const HANDS = [["right", "Right-handed"], ["left", "Left-handed"]], EYES = [["right", "Right eye"], ["left", "Left eye"], ["cross", "Cross-dominant"]];
const DISC = [["defensive", "Defensive / carry"], ["uspsa", "USPSA"], ["3gun", "3-Gun"], ["idpa", "IDPA"], ["precision", "Precision rifle"], ["hunting", "Hunting"], ["new", "New to it"]];
const LEVELS = [["new", "New"], ["intermediate", "Intermediate"], ["advanced", "Advanced"], ["competitor", "Competitor"]];
const chips = (id, opts, cur) => { const set = new Set(String(cur || "").split(",").map(x => x.trim())); return `<div class="chips" id="${id}">${opts.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${set.has(v)}">${l}</button>`).join("")}</div>`; };
const chipVal = id => (($(id) || { querySelector: () => null }).querySelector('[aria-pressed="true"]') || {}).dataset?.v || "";
const chipVals = id => [...($(id) || { querySelectorAll: () => [] }).querySelectorAll('[aria-pressed="true"]')].map(b => b.dataset.v);
// single choice by default; multi = true lets several stay lit
function chipWire(id, multi) { const el = $(id); if (!el) return; el.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; const on = b.getAttribute("aria-pressed") === "true"; if (!multi) [...el.children].forEach(x => x.setAttribute("aria-pressed", false)); b.setAttribute("aria-pressed", !on); }); }
const coachOn = () => lget("range.coach", "0") === "1";

async function openSettings() {
  const { who, DATA } = st(); const pr = DATA.profile || {};
  const photos = await fetch("/api/range/photos/count").then(r => r.json()).catch(() => ({ count: 0 }));
  openSheet(`<div class="ed">
    <div class="setH">Profile · ${esc(who === "me" ? "me" : cap(who))}</div>
    <div><label>Name (shown to a coach)</label><input id="pf_name" value="${esc(pr.name || "")}" placeholder="${who === "me" ? "your name" : cap(who)}"></div>
    <div><label>Handedness · sets which way the group read goes</label>${chips("pf_hand", HANDS, pr.hand || "")}</div>
    <div><label>Dominant eye</label>${chips("pf_eye", EYES, pr.eye || "")}</div>
    <div><label>What you shoot · pick all that apply</label>${chips("pf_disc", DISC, pr.discipline || "")}</div>
    <div><label>Where you are</label>${chips("pf_level", LEVELS, pr.level || "")}</div>
    <div class="row"><button type="button" class="save" id="pf_save">Save profile</button></div>

    <div class="setH">Coach mode</div>
    <button type="button" class="setRow" id="set_coach" aria-pressed="${coachOn()}"><span><b>I'm an instructor</b><small>Adds the Coach tab: roster, class builder, templates. Publishing to students comes with accounts.</small></span><span class="sw"></span></button>

    <div class="setH">Data</div>
    <button type="button" class="setRow" id="set_backup"><b>Backup the book</b><small>Downloads a JSON file. Restore it on any phone.</small></button>
    <label class="setRow" style="cursor:pointer"><b>Restore a backup</b><small>Pick a rangefolio-backup file.</small><input id="set_restore" type="file" accept="application/json" style="display:none"></label>
    <button type="button" class="setRow" id="set_send"${CONFIG.collect_url ? "" : ` data-soon="sync"`}><b>Send my data to Drew</b><small>Runs, taps and profile - never photos or video. You see the list before it goes.</small></button>
    <div class="build" style="padding:4px 6px">${photos.count || 0} target photo${photos.count === 1 ? "" : "s"} on this phone</div>

    <div class="setH">About</div>
    <button type="button" class="setRow" id="set_roadmap"><b>Roadmap</b><small>What's coming, and what each greyed button will do.</small></button>
    <div class="build" style="padding:6px">Rangefolio · build ${BUILD.n}${BUILD.date ? " · " + esc(BUILD.date) : ""} · test</div>
    ${BUILD.show_changes ? `<div id="set_changes" class="build" style="padding:0 6px"></div>` : ""}
  </div>`);
  ["pf_hand", "pf_eye", "pf_level"].forEach(id => chipWire(id)); chipWire("pf_disc", true);
  $("pf_save").addEventListener("click", async () => {
    const r = await post("/api/range/profile", { who, profile: { name: $("pf_name").value.trim(), hand: chipVal("pf_hand"), eye: chipVal("pf_eye"), discipline: chipVals("pf_disc"), level: chipVal("pf_level"), role: coachOn() ? "coach" : "shooter" } });
    if (!r || !r.ok) return toast("didn't save");
    document.querySelector(".sheet")?.remove(); toast("profile saved"); await RF.load(); RF.loadWork();
  });
  $("set_coach").addEventListener("click", () => { const on = !coachOn(); lset("range.coach", on ? "1" : "0"); $("set_coach").setAttribute("aria-pressed", on); RF.setCoachMode(on); toast(on ? "Coach tab is on" : "Coach tab is off"); });
  $("set_backup").addEventListener("click", () => $("backupBtn").click());
  $("set_restore").addEventListener("change", e => { const f = e.target.files[0]; if (!f) return; const dt = new DataTransfer(); dt.items.add(f); $("restoreIn").files = dt.files; $("restoreIn").dispatchEvent(new Event("change")); document.querySelector(".sheet")?.remove(); });
  if (CONFIG.collect_url) $("set_send").addEventListener("click", sendData);
  $("set_roadmap").addEventListener("click", openRoadmap);
  if ($("set_changes")) fetch("data/builds.json").then(r => r.json()).then(j => { const b = (j.builds || []).find(x => x.n === BUILD.n); if (b) $("set_changes").innerHTML = `<div style="margin-top:6px;font-weight:500;line-height:1.5">${b.changes.map(c => "· " + esc(c)).join("<br>")}</div>`; }).catch(() => {});
}
$("settingsBtn").addEventListener("click", openSettings);

async function openRoadmap() {
  const R = await roadmap(), C = await classesDoc();
  openSheet(`<div class="ed"><div><b style="font-size:17px">Roadmap</b><div class="hint" style="margin:4px 0 0">Everything below shows in the app as a greyed button. Tap one and it tells you what it will do; that tap gets counted, which is how we order this list.</div></div>
    <div class="rm-list">${(R.features || []).map(f => `<div class="cd open"><div class="hd"><b>${esc(f.title)}</b><span class="fo new">${esc(f.needs)}</span></div><div class="why">${esc(f.blurb)}</div></div>`).join("")}</div>
    <div class="setH">Classes to add later</div><div class="hint" style="margin:0 4px">${(C.coming_later || []).map(esc).join(" · ")}</div></div>`);
}

// Send the book to the collector, with the list of what's in it shown first.
async function sendData() {
  const r = await post("/api/range/export", {}); if (!r || !r.book) return toast("nothing to send");
  const b = r.book, runs = b.runs.length, taps = b.runs.filter(x => x.placement).length, shooters = Object.keys(b.shooters).length;
  openSheet(`<div class="ed"><div><b style="font-size:17px">Send my data to Drew</b></div>
    <div class="hint" style="margin:0 4px">What goes: <b>${runs} runs</b>, ${taps} with target taps · ${shooters} shooter profile${shooters === 1 ? "" : "s"} · ${b.programs.length} sessions · ${b.stages.length} stages · ${(b.classes || []).length} classes · your guns and goals · which coming-soon buttons you tapped. <br><br>What does not go: photos, anything you didn't put in this app. It's used to build the coaching and AI features and nothing else. Tap again any time you want to send an update.</div>
    <div class="row"><button type="button" class="save" id="sd_go">Send it</button></div></div>`);
  $("sd_go").addEventListener("click", async () => {
    $("sd_go").disabled = true;
    try {
      const res = await fetch(CONFIG.collect_url, { method: "POST", headers: { "Content-Type": "application/json", "x-rf-key": CONFIG.collect_key || "" }, body: JSON.stringify({ build: BUILD.n, sent: new Date().toISOString(), invite: lget("range.invite", ""), book: b }) });
      if (!res.ok) throw new Error(res.status);
      document.querySelector(".sheet")?.remove(); toast("sent - thank you"); post("/api/range/meta", { set: { last_sent: new Date().toISOString() } });
    } catch { toast("couldn't send - try again with signal"); $("sd_go").disabled = false; }
  });
}

// ---------------------------------------------------------------- camera / photo scorer
// Line the real target up inside the outline, snap, tap the holes. A model
// (window.RangefolioScorer) can propose the holes first; until one exists the
// list starts empty. Result: {target, holes:[{x,y,z,head,dbl}], photo}.
window.RangefolioScorer = window.RangefolioScorer || { available: false, name: "none", async score() { return { holes: [] }; } };
function zoneAt(svg, vx, vy) {
  const pt = svg.createSVGPoint(); pt.x = vx; pt.y = vy;
  const els = [...svg.querySelectorAll("[data-z]")].reverse();
  for (const el of els) { try { if (el.isPointInFill && el.isPointInFill(pt)) return { z: el.dataset.z, head: !!el.dataset.head }; } catch {} }
  return { z: "miss", head: false };
}
RF.openCamera = function (opts, cb) {
  let target = opts.target || "uspsa", stream = null, photo = null, holes = [], lvlOK = false, pressT = null;
  const cap = opts.cap || Infinity;
  const el = document.createElement("div"); el.className = "cam";
  el.innerHTML = `
    <div class="topbar"><div class="tchips" id="cam_chips"></div><div class="lvl" id="cam_lvl">level —</div></div>
    <div class="view" id="cam_view">
      <video id="cam_v" playsinline autoplay muted></video>
      <div class="ov live" id="cam_ov"></div>
      <div class="tallyLine" id="cam_tally"></div>
      <div class="hint2" id="cam_hint">Fill the outline with the target. Square to it, phone upright.</div>
    </div>
    <div class="bar" id="cam_bar"></div>
    <input type="file" id="cam_file" accept="image/*" capture="environment">`;
  document.body.appendChild(el);
  const V = $("cam_v"), OV = $("cam_ov"), BAR = $("cam_bar");
  const drawChips = () => { $("cam_chips").innerHTML = T.list().map(t => `<button type="button" data-t="${t.key}" aria-pressed="${t.key === target}">${esc(t.short)}</button>`).join(""); };
  const liveBar = () => { BAR.innerHTML = `<button type="button" class="ghost" id="cam_x">Cancel</button><button type="button" class="ghost" id="cam_pick">Photos</button><button type="button" class="snap" id="cam_snap">SNAP</button>`;
    $("cam_x").addEventListener("click", close); $("cam_pick").addEventListener("click", () => $("cam_file").click()); $("cam_snap").addEventListener("click", snap); };
  const scoreBar = () => { BAR.innerHTML = `<button type="button" class="ghost" id="cam_re">Retake</button><button type="button" class="ghost" id="cam_undo">Undo</button><button type="button" class="snap" id="cam_use">USE THESE HITS</button>`;
    $("cam_re").addEventListener("click", startLive); $("cam_undo").addEventListener("click", () => { holes.pop(); drawHoles(); }); $("cam_use").addEventListener("click", use); };
  const setOverlay = live => { OV.className = "ov " + (live ? "live" : "score"); OV.innerHTML = live ? T.overlayMarkup(target) : T.svgMarkup(target); };
  drawChips(); setOverlay(true); liveBar();
  $("cam_chips").addEventListener("click", e => { const b = e.target.closest("button[data-t]"); if (!b) return; target = b.dataset.t; holes = []; drawChips(); setOverlay(!photo); drawHoles(); });
  // level: roll from the phone's orientation; green inside 3 degrees
  const onOri = ev => { if (typeof ev.gamma !== "number") return; const roll = Math.round(ev.gamma), pitch = Math.round(ev.beta || 0); lvlOK = Math.abs(roll) <= 3; $("cam_lvl").textContent = `roll ${roll > 0 ? "+" : ""}${roll}° · tilt ${pitch}°`; $("cam_lvl").className = "lvl" + (lvlOK ? " ok" : ""); };
  const startOri = async () => { try { if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") { const ok = await DeviceOrientationEvent.requestPermission(); if (ok !== "granted") return; } window.addEventListener("deviceorientation", onOri, true); } catch {} };
  async function startLive() {
    photo = null; holes = []; el.querySelector("img.shot")?.remove(); V.hidden = false; setOverlay(true); liveBar(); $("cam_tally").textContent = ""; $("cam_hint").textContent = "Fill the outline with the target. Square to it, phone upright.";
    if (stream) return;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1440 } }, audio: false });
      V.srcObject = stream; await V.play().catch(() => {});
    } catch { $("cam_hint").textContent = "No camera here - tap Photos to take one with the camera app instead."; V.hidden = true; }
  }
  function stopLive() { if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; V.srcObject = null; } }
  async function snap() {
    if (!stream || !V.videoWidth) return $("cam_file").click();
    const c = document.createElement("canvas"), max = 1280, k = Math.min(1, max / Math.max(V.videoWidth, V.videoHeight));
    c.width = Math.round(V.videoWidth * k); c.height = Math.round(V.videoHeight * k);
    c.getContext("2d").drawImage(V, 0, 0, c.width, c.height);
    gotPhoto(c.toDataURL("image/jpeg", 0.8));
  }
  $("cam_file").addEventListener("change", async e => {
    const f = e.target.files[0]; if (!f) return;
    const url = URL.createObjectURL(f); const img = new Image(); img.onload = () => {
      const c = document.createElement("canvas"), max = 1280, k = Math.min(1, max / Math.max(img.width, img.height));
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); gotPhoto(c.toDataURL("image/jpeg", 0.8)); };
    img.src = url; e.target.value = "";
  });
  async function gotPhoto(dataUrl) {
    photo = dataUrl; stopLive(); V.hidden = true;
    const img = document.createElement("img"); img.className = "shot"; img.src = dataUrl; $("cam_view").insertBefore(img, OV);
    setOverlay(false); scoreBar(); holes = [];
    $("cam_hint").textContent = "Tap each hole. Tap a hole again to remove it; hold one for a double (two rounds, one hole).";
    const S = window.RangefolioScorer;
    if (S && S.available) {
      $("cam_hint").textContent = `${S.name} is finding the holes…`;
      try { const r = await S.score(dataUrl, target); const svg = OV.querySelector("svg"), t = T.get(target);
        (r.holes || []).forEach(h => { if (holes.length >= cap) return; const vx = h.x * t.vb[0], vy = h.y * t.vb[1]; const z = h.z ? { z: h.z, head: !!h.head } : zoneAt(svg, vx, vy); holes.push({ x: h.x, y: h.y, z: z.z, head: z.head, conf: h.conf }); });
        $("cam_hint").textContent = `${holes.length} proposed - fix anything wrong, then use them.`; } catch { $("cam_hint").textContent = "Couldn't run the scorer - tap the holes."; }
    }
    drawHoles();
  }
  function drawHoles() {
    const svg = OV.querySelector("svg"); if (!svg) return; const t = T.get(target), g = svg.querySelector(".holes"); if (!g) return;
    g.innerHTML = holes.map(h => `<circle class="hole${h.dbl ? " dbl" : ""}" cx="${(h.x * t.vb[0]).toFixed(1)}" cy="${(h.y * t.vb[1]).toFixed(1)}" r="${h.dbl ? 9 : 7}"/>`).join("");
    const n = { a: 0, c: 0, d: 0, miss: 0 }; holes.forEach(h => n[h.z]++);
    $("cam_tally").textContent = holes.length ? `${n.a} A · ${n.c} C · ${n.d} D · ${n.miss} miss  (${holes.length}${isFinite(cap) ? " of " + cap : ""})` : "";
  }
  OV.addEventListener("pointerdown", e => {
    if (!photo) return; const svg = OV.querySelector("svg"); if (!svg) return;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const t = T.get(target), nx = p.x / t.vb[0], ny = p.y / t.vb[1];
    const near = holes.findIndex(h => Math.hypot((h.x - nx) * t.vb[0], (h.y - ny) * t.vb[1]) < 14);
    clearTimeout(pressT);
    if (near >= 0) {
      // hold = double; a quick tap = remove
      let fired = false;
      pressT = setTimeout(() => { fired = true; const h = holes[near]; if (!h.dbl && holes.length < cap) { holes.splice(near + 1, 0, { ...h, dbl: true }); h.dbl = true; if (navigator.vibrate) navigator.vibrate(25); drawHoles(); } }, 500);
      const up = () => { clearTimeout(pressT); OV.removeEventListener("pointerup", up); OV.removeEventListener("pointercancel", up); if (!fired) { const h = holes[near]; if (h.dbl) { holes.splice(near, 1); const j = holes.findIndex(x => x.x === h.x && x.y === h.y); if (j >= 0) holes[j].dbl = false; } else holes.splice(near, 1); drawHoles(); } };
      OV.addEventListener("pointerup", up); OV.addEventListener("pointercancel", up);
      return;
    }
    if (holes.length >= cap) { toast(`that's all ${cap} rounds`); return; }
    const z = zoneAt(svg, p.x, p.y);
    holes.push({ x: Math.min(1, Math.max(0, nx)), y: Math.min(1, Math.max(0, ny)), z: z.z, head: z.head });
    if (navigator.vibrate) navigator.vibrate(12);
    drawHoles();
  });
  function use() { if (!holes.length) return toast("tap the holes first"); const out = { target, holes: holes.map(h => ({ ...h })), photo }; close(); cb(out); }
  function close() { stopLive(); window.removeEventListener("deviceorientation", onOri, true); el.remove(); }
  startOri(); startLive();
};

// ---------------------------------------------------------------- coach mode
RF.renderCoach = async function () {
  const { DATA, who } = st(); const card = $("coachCard");
  if (!coachOn()) { card.innerHTML = `<div class="empty">Coach mode is off. Turn it on under Settings.</div>`; return; }
  const runsBy = {}; (DATA.runs || []).forEach(r => (runsBy[r.who] ||= []).push(r));
  const shooters = Array.from(new Set(["me", ...(DATA.shooters || [])]));
  const profiles = DATA.profiles || {};
  card.innerHTML = `
    <div class="exportRow"><h2 style="margin:0;font:700 15px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--dim)">Coach</h2><span style="display:flex;gap:6px"><button type="button" data-soon="roster">Link students</button></span></div>
    <div class="setH" style="margin-top:0">Roster · on this phone</div>
    <div class="roster">${shooters.map(n => { const rs = (DATA.runs || []).filter(r => r.who === n); const p = profiles[n] || {}; return `<div class="st"><div><b>${esc(p.name || (n === "me" ? "Me" : cap(n)))}</b><small>${rs.length} run${rs.length === 1 ? "" : "s"}${rs[0] ? " · last " + rs[0].at.slice(0, 10) : ""}${p.hand ? " · " + p.hand : ""}${p.level ? " · " + p.level : ""}</small></div><button type="button" class="mini" data-who="${esc(n)}" style="min-height:34px;padding:0 10px;border-radius:9px;border:1px solid var(--hair);color:var(--dim);font-weight:700">open book</button></div>`; }).join("")}
      <button type="button" class="add" id="co_addStudent" style="min-height:44px;border:1.5px dashed var(--hair);border-radius:12px;color:var(--dim);font-weight:700">+ student on this phone</button>
    </div>
    <div class="setH">Classes</div>
    <div class="addRow" style="display:flex;gap:6px;margin-bottom:8px"><button type="button" class="newPlan" id="co_newClass" style="margin:0;flex:1">+ New class</button><button type="button" class="newPlan" id="co_tpl" style="margin:0;flex:1">From a template</button></div>
    <div id="co_classes"></div>
    <p class="hint">A class is modules in order - what's taught, the drills with reps, the round count, your notes. <b>Start</b> walks the drills on the Log tab for the student in front of you. <b>Publish</b> sends it to students' phones once accounts exist. Events (a match day or a class day's stages) live on the Comp tab.</p>`;
  const list = $("co_classes");
  const C = DATA.classes || [];
  list.innerHTML = C.length ? C.map(c => `<div class="cls" data-id="${c.id}">
      <h3>${esc(c.name)}</h3>
      <div class="meta"><b>${esc(c.level || "")}</b> · ${esc(c.discipline || "")} · ${c.hours ? c.hours + " h · " : ""}${c.modules.length} modules · ${c.ammo.pistol ? c.ammo.pistol + " pistol " : ""}${c.ammo.rifle ? c.ammo.rifle + " rifle " : ""}${c.ammo.shotgun ? c.ammo.shotgun + " shotgun" : ""}</div>
      <div class="about">${esc(c.about || "")}</div>
      <div class="acts"><button type="button" class="go2" data-act="start">Start</button><button type="button" data-act="open">Open</button><button type="button" data-act="edit">Edit</button><button type="button" data-soon="publish_class">Publish</button><button type="button" data-act="del">Delete</button></div>
    </div>`).join("") : `<div class="empty">No classes yet. Start from a template - CCW, Basic / Intermediate / Advanced Pistol, Carbine, Defensive Shotgun, USPSA Classifier Day - and make it yours.</div>`;
  card.querySelector(".roster").addEventListener("click", e => { const b = e.target.closest("button[data-who]"); if (b) { document.querySelector(`#who [data-who="${b.dataset.who}"]`)?.click(); RF.goPage("book"); } });
  $("co_addStudent").addEventListener("click", async () => { const name = prompt("Student's name?"); if (!name || !name.trim()) return; const r = await post("/api/range/shooter", { name: name.trim() }); if (r && r.ok) { toast(r.said); await RF.load(); RF.renderCoach(); } });
  $("co_newClass").addEventListener("click", () => editClass(null));
  $("co_tpl").addEventListener("click", pickTemplate);
  list.addEventListener("click", async e => {
    const b = e.target.closest("button[data-act]"); if (!b) return;
    const c = C.find(x => x.id === b.closest(".cls").dataset.id); if (!c) return;
    if (b.dataset.act === "start") { const items = []; c.modules.forEach(m => (m.items || []).forEach(it => items.push({ drill: it.drill, reps: it.reps, dry: it.dry || undefined }))); if (!items.length) return toast("no drills in this class yet"); RF.progStart({ name: c.name, items }); }
    if (b.dataset.act === "open") openClass(c);
    if (b.dataset.act === "edit") editClass(c);
    if (b.dataset.act === "del") { if (!confirm(`Delete ${c.name}?`)) return; await post("/api/range/class", { id: c.id, delete: true }); await RF.load(); RF.renderCoach(); }
  });
};
function openClass(c) {
  openSheet(`<div class="ed"><div><b style="font-size:18px">${esc(c.name)}</b><div class="meta" style="font:700 12px var(--mono);color:var(--dim);margin-top:4px">${esc(c.level || "")} · ${esc(c.discipline || "")}${c.hours ? " · " + c.hours + " h" : ""} · ${c.minutes ? Math.round(c.minutes / 60 * 10) / 10 + " h of modules" : ""}</div></div>
    ${c.about ? `<div class="hint" style="margin:0 2px">${esc(c.about)}</div>` : ""}
    ${c.prereq ? `<div><label>Prerequisites</label><div class="hint" style="margin:0 2px">${esc(c.prereq)}</div></div>` : ""}
    ${c.gear ? `<div><label>Gear</label><div class="hint" style="margin:0 2px">${esc(c.gear)}</div></div>` : ""}
    ${c.rounds_note ? `<div><label>Ammunition</label><div class="hint" style="margin:0 2px">${esc(c.rounds_note)}</div></div>` : ""}
    <div><label>Modules</label>${c.modules.map((m, i) => `<div class="mod"><div class="mh"><b>${i + 1}. ${esc(m.title)}</b><small>${m.minutes ? m.minutes + " min" : ""}${m.live === false ? " · classroom" : ""}</small></div>
      ${m.about ? `<div class="ma">${esc(m.about)}</div>` : ""}
      ${(m.drills || []).length ? `<div class="mi">${m.drills.map(d => `${esc(d.name)}${d.reps > 1 ? " ×" + d.reps : ""}${d.dry ? " <small>DRY</small>" : ""}`).join(" · ")}<small> · ${m.ammo.pistol ? m.ammo.pistol + " pistol " : ""}${m.ammo.rifle ? m.ammo.rifle + " rifle " : ""}${m.ammo.shotgun ? m.ammo.shotgun + " shotgun" : ""}</small></div>` : ""}
      ${m.notes ? `<div class="mn">${esc(m.notes)}</div>` : ""}</div>`).join("")}</div>
    <div class="row soonRow"><button type="button" data-soon="publish_class">Publish to students</button><button type="button" data-soon="share_drill">Share as a code</button></div></div>`);
}
async function pickTemplate() {
  const D = await classesDoc();
  const s = document.createElement("div"); s.className = "sheet";
  s.innerHTML = `<div class="box"><div class="list">${(D.templates || []).map(t => `<button class="item" data-k="${t.key}"><span style="flex:1"><b>${esc(t.name)}</b><br><small>${esc(t.level)} · ${esc(t.discipline)} · ${t.hours} h · ${t.modules.length} modules</small></span></button>`).join("")}
    <div class="hint">Built from public course outlines; the legal content, handouts and your own words are yours to add. Nothing here is another provider's material.</div></div><button class="cancel" type="button">Cancel</button></div>`;
  s.addEventListener("click", async e => {
    if (e.target === s || e.target.closest(".cancel")) return s.remove();
    const it = e.target.closest(".item"); if (!it) return; s.remove();
    const r = await post("/api/range/class", { from_template: it.dataset.k });
    if (!r || !r.ok) return toast("couldn't load that template");
    toast(r.said); await RF.load(); RF.renderCoach();
  });
  document.body.appendChild(s);
}
function editClass(c) {
  const d = c ? JSON.parse(JSON.stringify(c)) : { name: "", discipline: "defensive", level: "new", hours: 4, about: "", prereq: "", gear: "", modules: [{ title: "Safety brief", minutes: 20, live: false, about: "", items: [], notes: "" }] };
  openSheet(`<div class="ed">
    <div><label>Class name</label><input id="c_name" value="${esc(d.name)}" placeholder="Saturday carry class"></div>
    <div><label>Discipline</label>${chips("c_disc", DISC, d.discipline)}</div>
    <div><label>Level</label>${chips("c_level", LEVELS, d.level)}</div>
    <div class="g2"><div><label>hours</label><input id="c_hours" inputmode="decimal" value="${d.hours || ""}"></div><div></div></div>
    <div><label>What it is</label><textarea id="c_about" placeholder="Who it's for and what they leave with.">${esc(d.about || "")}</textarea></div>
    <div><label>Prerequisites</label><input id="c_prereq" value="${esc(d.prereq || "")}" placeholder="None. Bring 150 rounds."></div>
    <div><label>Gear and range setup</label><input id="c_gear" value="${esc(d.gear || "")}" placeholder="Silhouettes, timer, dummy rounds"></div>
    <div><label>Modules</label><div id="c_mods"></div><button type="button" class="add" id="c_addMod" style="margin-top:6px;min-height:40px;width:100%">+ module</button></div>
    <div class="row">${c ? `<button type="button" class="del" id="c_del">Delete</button>` : ""}<button type="button" class="save" id="c_save">Save class</button></div>
  </div>`);
  chipWire("c_disc"); chipWire("c_level");
  const { DATA } = st();
  const nameOf = k => (RF.findDrill(k) || { name: k }).name;
  const draw = () => {
    $("c_mods").innerHTML = d.modules.map((m, i) => `<div class="mod" data-i="${i}">
      <div class="mh"><input data-k="title" value="${esc(m.title)}" placeholder="Module title" style="flex:1;min-height:40px;font-size:15px;font-weight:700;padding:0 10px;background:var(--sunk);border:1.5px solid var(--hair);border-radius:10px;color:var(--ink)"><button type="button" class="rm" data-act="rmmod" style="width:34px;min-height:34px;color:var(--faint);font-size:18px">×</button></div>
      <div class="pf" style="display:flex;gap:6px;align-items:center;margin-top:6px"><label style="margin:0;display:flex;align-items:center;gap:6px;text-transform:none;letter-spacing:0;font:600 12px var(--sans);color:var(--dim)"><input data-k="minutes" inputmode="numeric" value="${m.minutes || ""}" style="width:64px;min-height:36px;text-align:center;font-family:var(--mono);background:var(--sunk);border:1.5px solid var(--hair);border-radius:10px;color:var(--ink)"> min</label><button type="button" class="tgl" data-act="live" aria-pressed="${m.live !== false}">${m.live !== false ? "live fire" : "classroom"}</button></div>
      <textarea data-k="about" placeholder="What's taught in this block." style="margin-top:6px;min-height:60px">${esc(m.about || "")}</textarea>
      <div class="items" style="margin-top:6px">${(m.items || []).map((it, j) => `<div class="it" data-j="${j}"><div><b>${esc(nameOf(it.drill))}${it.dry ? `<span class="dry">DRY</span>` : ""}</b></div><span class="reps"><button type="button" data-act="rep" data-d="-1">−</button><span>${it.reps}</span><button type="button" data-act="rep" data-d="1">+</button></span><button type="button" class="rm" data-act="rmit">×</button></div>`).join("")}</div>
      <div class="addRow" style="display:flex;gap:6px;margin-top:6px"><button type="button" class="add" data-act="addDrill" style="flex:1;min-height:36px">+ drill</button><button type="button" class="add" data-act="addStage" style="flex:1;min-height:36px">+ stage</button></div>
      <textarea data-k="notes" placeholder="Instructor notes: coaching points, what to watch for." style="margin-top:6px;min-height:50px">${esc(m.notes || "")}</textarea>
    </div>`).join("");
  };
  const read = () => { document.querySelectorAll("#c_mods .mod").forEach(me => { const m = d.modules[+me.dataset.i]; me.querySelectorAll("[data-k]").forEach(el => { m[el.dataset.k] = el.dataset.k === "minutes" ? +el.value || 0 : el.value; }); }); };
  draw();
  $("c_mods").addEventListener("click", e => {
    const b = e.target.closest("button[data-act]"); if (!b) return; read();
    const me = b.closest(".mod"), m = d.modules[+me.dataset.i];
    if (b.dataset.act === "rmmod") { d.modules.splice(+me.dataset.i, 1); draw(); }
    else if (b.dataset.act === "live") { m.live = m.live === false; draw(); }
    else if (b.dataset.act === "rep") { const it = m.items[+b.closest(".it").dataset.j]; it.reps = Math.max(1, Math.min(50, it.reps + (+b.dataset.d))); draw(); }
    else if (b.dataset.act === "rmit") { m.items.splice(+b.closest(".it").dataset.j, 1); draw(); }
    else if (b.dataset.act === "addDrill") RF.pickDrill(dr => { m.items.push({ drill: dr.key, reps: 1, dry: !!dr.dry && dr.rounds <= 1 }); draw(); });
    else if (b.dataset.act === "addStage") { const S = DATA.stages || []; if (!S.length) return toast("no stages yet - build one on the Comp tab"); const s = document.createElement("div"); s.className = "sheet";
      s.innerHTML = `<div class="box"><div class="list">${S.map(x => `<button class="item" data-s="${x.id}"><b>${esc(x.name)}</b></button>`).join("")}</div><button class="cancel" type="button">Cancel</button></div>`;
      s.addEventListener("click", ev => { if (ev.target === s || ev.target.closest(".cancel")) return s.remove(); const it = ev.target.closest(".item"); if (!it) return; m.items.push({ drill: "stage:" + it.dataset.s, reps: 1 }); s.remove(); draw(); }); document.body.appendChild(s); }
  });
  $("c_addMod").addEventListener("click", () => { read(); d.modules.push({ title: "", minutes: 30, live: true, about: "", items: [], notes: "" }); draw(); });
  $("c_save").addEventListener("click", async () => {
    read(); d.name = $("c_name").value.trim(); d.discipline = chipVal("c_disc"); d.level = chipVal("c_level"); d.hours = +$("c_hours").value || 0; d.about = $("c_about").value.trim(); d.prereq = $("c_prereq").value.trim(); d.gear = $("c_gear").value.trim();
    if (!d.name) return toast("give it a name");
    const r = await post("/api/range/class", d); if (!r || !r.ok) return toast("didn't save — " + (r && r.said || ""));
    document.querySelector(".sheet")?.remove(); toast(r.said); await RF.load(); RF.renderCoach();
  });
  if ($("c_del")) $("c_del").addEventListener("click", async () => { if (!confirm(`Delete ${d.name}?`)) return; await post("/api/range/class", { id: d.id, delete: true }); document.querySelector(".sheet")?.remove(); await RF.load(); RF.renderCoach(); });
}

// ---------------------------------------------------------------- events
RF.renderEvents = function () {
  const { DATA } = st(); const E = DATA.events || [], list = $("eventsList"); if (!list) return;
  list.innerHTML = E.length ? E.map(e => `<div class="plan" data-e="${e.id}">
      <h3>${esc(e.name)}<span class="fmt">${e.format === "3gun" ? "3-gun" : e.format === "class" ? "class" : "USPSA"}</span></h3>
      <div class="ammo">${e.date ? esc(e.date) + " · " : ""}${e.where ? esc(e.where) + " · " : ""}${e.stage_list.length} stage${e.stage_list.length === 1 ? "" : "s"} · ${Object.entries(e.ammo).map(([g, n]) => `<b>${n}</b> ${g}`).join(" · ") || "no rounds"}</div>
      <div class="dl">${e.stage_list.map((s, i) => `<b>${i + 1}</b> ${esc(s.name)}`).join(" · ")}${e.notes ? "<br>" + esc(e.notes) : ""}</div>
      <div class="acts"><button type="button" class="go2" data-act="start">Start</button><button type="button" data-act="edit">Edit</button><button type="button" data-soon="event_share">Share</button><button type="button" data-act="del">Delete</button></div>
    </div>`).join("") : `<div class="empty">No events yet. Build the stages first, then group them here as a match or a class day.</div>`;
};
$("eventsList").addEventListener("click", async e => {
  const b = e.target.closest("button[data-act]"); if (!b) return;
  const ev = (st().DATA.events || []).find(x => x.id === b.closest(".plan").dataset.e); if (!ev) return;
  if (b.dataset.act === "start") { if (!ev.stage_list.length) return toast("no stages on this event"); RF.progStart({ name: ev.name, items: ev.stage_list.map(s => ({ drill: "stage:" + s.id, reps: 1 })) }); }
  if (b.dataset.act === "edit") editEvent(ev);
  if (b.dataset.act === "del") { if (!confirm(`Delete ${ev.name}?`)) return; await post("/api/range/event", { id: ev.id, delete: true }); await RF.load(); RF.renderEvents(); }
});
$("newEvent").addEventListener("click", () => editEvent(null));
function editEvent(ev) {
  const { DATA } = st(); const S = DATA.stages || [];
  const d = ev ? { ...ev, stages: [...(ev.stages || [])] } : { name: "", date: new Date().toISOString().slice(0, 10), where: "", format: "uspsa", stages: [], notes: "" };
  openSheet(`<div class="ed">
    <div><label>Event name</label><input id="ev_name" value="${esc(d.name)}" placeholder="Club match, October"></div>
    <div class="g2"><div><label>date</label><input id="ev_date" type="date" value="${esc(d.date || "")}"></div><div><label>where</label><input id="ev_where" value="${esc(d.where || "")}" placeholder="Bay 3"></div></div>
    <div class="seg2" id="ev_fmt">${[["uspsa", "USPSA"], ["3gun", "3-GUN"], ["class", "CLASS DAY"]].map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${d.format === v}">${l}</button>`).join("")}</div>
    <div><label>Stages, in order · tap to add or remove</label><div class="items" id="ev_stages"></div></div>
    <div><label>Notes</label><textarea id="ev_notes" placeholder="Squad times, what to bring.">${esc(d.notes || "")}</textarea></div>
    <div class="row">${ev ? `<button type="button" class="del" id="ev_del">Delete</button>` : ""}<button type="button" class="save" id="ev_save">Save event</button></div>
  </div>`);
  const draw = () => { $("ev_stages").innerHTML = (S.length ? S.map(s => { const i = d.stages.indexOf(s.id); return `<button type="button" class="it" data-s="${s.id}" style="text-align:left;grid-template-columns:auto 1fr auto"><span style="font:700 14px var(--mono);color:${i >= 0 ? "var(--hot)" : "var(--faint)"};min-width:24px">${i >= 0 ? i + 1 : "·"}</span><b>${esc(s.name)}</b><small>${Object.entries(s.ammo).map(([g, n]) => n + " " + g).join(" · ")}</small></button>`; }).join("") : `<div class="empty">No stages built yet.</div>`); };
  draw();
  $("ev_stages").addEventListener("click", e => { const b = e.target.closest("[data-s]"); if (!b) return; const i = d.stages.indexOf(b.dataset.s); if (i >= 0) d.stages.splice(i, 1); else d.stages.push(b.dataset.s); draw(); });
  $("ev_fmt").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; d.format = b.dataset.v; [...$("ev_fmt").children].forEach(x => x.setAttribute("aria-pressed", x === b)); });
  $("ev_save").addEventListener("click", async () => {
    d.name = $("ev_name").value.trim(); d.date = $("ev_date").value; d.where = $("ev_where").value.trim(); d.notes = $("ev_notes").value.trim();
    if (!d.name) return toast("give it a name");
    const r = await post("/api/range/event", d); if (!r || !r.ok) return toast("didn't save — " + (r && r.said || ""));
    document.querySelector(".sheet")?.remove(); toast(r.said); await RF.load(); RF.renderEvents();
  });
  if ($("ev_del")) $("ev_del").addEventListener("click", async () => { if (!confirm(`Delete ${d.name}?`)) return; await post("/api/range/event", { id: d.id, delete: true }); document.querySelector(".sheet")?.remove(); await RF.load(); RF.renderEvents(); });
}

// ---------------------------------------------------------------- boot
RF.setCoachMode(coachOn());
})();
