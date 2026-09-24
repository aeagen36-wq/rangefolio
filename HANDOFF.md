# Rangefolio — handoff

Rangefolio is the range-day app, lifted out of a personal assistant project
and made to stand alone. This folder is a complete, installable PWA with no
server, no account and no AI. Everything runs in the browser and is stored
on the device. This document is what a fresh team needs: what's here, how
it's built, and — the point — every hole that has to be filled to make it a
product.

## What's in the folder

| File | What it is |
|---|---|
| `index.html` | The whole UI. One file: CSS, markup, JS. Six tabs — Log, Book, Coach, Session, Comp, Ballistics. |
| `engine.js` | The data layer and all scoring. Answers the same `/api/range/...` request shapes the UI already spoke, from IndexedDB (localStorage fallback). |
| `data/drills.json` | 42 built-in drills (name, weapon, rounds, par, distance, procedure, what it trains), 3 warm-up sessions, 2 built-in stages, expert benchmark times, drill groupings by skill, time-plus rule schedules, zone maps. |
| `data/loads.json` | 29 calibres, 134 factory loads with maker MV/BC and a source string each. |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA install and offline shell. |
| `docs/BALLISTICS-DATA.md` | The physics the solver implements, its validation against maker tables, and the source of every load number. Read before touching the solver. |
| `docs/SCORING.md` | USPSA / USPSA Multigun / UML / outlaw / IDPA scoring rules with rule numbers, and what an app must capture. The stage scorer is built from this. |
| `docs/DRILLS.md` | Origin, procedure and published expert tiers for the drills, how coaches diagnose accuracy vs speed, GM benchmarks. The Coach's goal suggestions come from this. |

## How it works, in one paragraph

The page never changed its API. Every `fetch("/api/range...")` is intercepted
at the top of the script and routed to `RangefolioEngine.api(path, body)`,
which returns the same JSON the old server did. So the UI and the engine are
loosely coupled and the engine can later be moved behind a real API without
rewriting the page. The one network call left is the weather strip on the
Ballistics tab (Open-Meteo, keyless, direct from the browser). The service
worker caches the shell so the app opens with no signal.

## What it does today

- **Log** a run: pick a drill, enter hits by counters or by tapping a drawn
  USPSA-metric target, or mark it dry; time as a total or shot-by-shot
  (cumulative or splits); hold LOG IT. Round counts are capped to the drill.
- **Score** every run three ways — pass (clean and inside par), IDPA-style
  time-plus, USPSA-style hit factor — plus goal met/missed when a goal is set.
  Called head shots that don't arrive score as misses.
- **Book**: every run, tap to edit hits, shot slots, note, or delete. CSV
  export, JSON backup and restore.
- **Coach**: per drill over the last 12 live runs — A%, misses, best clean,
  trend (newest third vs oldest third), accuracy/speed/both/hold verdict, a
  plan, a suggested goal built from published expert times, what the drill
  trains, drills to add for accuracy / speed / both. Stages get their own
  section (points kept, HF or time-plus, misses, penalties).
- **Session**: named lists of drills with reps, ammo count by gun, three
  built-in warm-ups; start one and the Log page walks it.
- **Comp**: stage builder (positions → targets × kind × distance × rounds,
  reload, movement, gun for 3-gun). Two built-ins. Stages are logged **per
  target** and scored by the rulebook: USPSA Comstock (best-N hits, misses per
  required hit, no-shoot/procedural −10, procedurals capped, net ≥ 0, hit
  factor) or time-plus (USPSA Multigun 9.3 default; UML and Texas 3-Gun
  schedules selectable). Failure to engage is a per-target flag.
- **Ballistics**: point-mass solver (G1/G7, humid-air density, incline,
  Miller/Litz spin drift, Coriolis, powder temp), gun profiles (barrel, can,
  twist, HoB, zero, zero-day conditions, chrono'd MVs per load), the load
  catalogue, a compass/elevation/weather strip that fills the fields, a
  "today vs zero day" correction box, and a per-distance hold readout.
- **Your own drills**: "+ New drill of your own" in the drill picker; long-press
  the drill name to edit one.
- Light/dark, safe-area aware, no double-tap zoom, fits a 393×852 phone without
  scrolling on the Log tab in total-time mode.

## The holes

Ordered roughly by how much they block a real product.

### 1. Platform and data

- **No accounts, no sync, no cloud.** Data lives in one browser. Clearing site
  data deletes the book. Backup is a manual JSON download. A product needs an
  account, a backend, and sync across devices. The engine's `api()` boundary is
  where that goes: keep the request shapes, swap the storage.
- **No sharing.** Drills, sessions and stages can't be sent to anyone. The
  coach → student loop (the distribution story) needs: share a drill/session/
  stage by link or code, a student's book visible to their coach, and an
  identity for both.
- **iOS install path is Safari "Add to Home Screen".** No App Store presence.
  Firearms apps face extra review friction on both stores — plan for it early.
- **Storage caps.** IndexedDB is fine for thousands of runs; photos/video (see
  below) will not fit. Any media needs the backend.
- **No migrations.** `engine.js` tolerates missing fields but there is no
  versioned schema. Add a `schema` field to the book and a migration step
  before the first public build.

### 2. Missing features (were in the assistant, or on the list)

- **Voice logging.** The original could take "bill drill, six alpha, two
  point nine" and read the shot times off the timer by voice. That was the
  assistant's speech pipeline. Rangefolio has none. Web Speech API is a weak
  substitute (no offline, poor with ear pro); a native app or a hosted
  speech service is the real answer.
- **Spoken results.** Same — the run summary text exists (`sayRun`), nothing
  reads it out. Text-to-speech via the browser is possible and cheap to add.
- **Shot timer link.** Nothing connects to a timer. AMG Lab Commander speaks
  Nordic UART over BLE (documented), Shooters Global publishes a BLE API.
  Web Bluetooth works on Android/Chrome, not on iOS Safari — so a native shell
  or Bluefy on iPhone. This is the single most-requested capability.
- **Spreadsheet export** is CSV only; the original produced an .xlsx with
  Runs / Standards / Holds sheets. Add a client-side xlsx writer or do it
  server-side.
- **Photo → stage** (photograph a stage brief or bay, get a stage), top-down
  stage sketch with a travel path, and **camera hit detection** (before/after
  photo of a target → holes → zones) are on the roadmap and need the backend
  plus a vision model. The stage data model is ready for them.
- **Drill sharing / coach authoring.** Custom drills exist locally; nothing to
  publish a set.
- **Trend charts.** Coach gives words and arrows; there are no graphs. A
  sparkline per drill (time and A% over the window) is the obvious add.
- **Multiple shooters share one device's book** ("+ someone" adds a name).
  With accounts, that becomes real profiles.

### 3. Scoring and data gaps (known, documented)

- USPSA stage points / match percentage (HF ÷ high HF × max points) need more
  than one competitor — there is no match mode, only stage runs.
- Virginia Count and Fixed Time are not implemented (Comstock only).
- IDPA is used as a *drill* time-plus convention; there is no IDPA stage
  scoring (−0/−1/−3 per target, PE/HNT/FP/FTDR).
- 3-Gun Nation has no retrievable current rulebook; presets are USPSA Multigun,
  UML and Texas 3-Gun. Clubs vary — the schedule is selectable per stage, and
  the rule table is in `docs/SCORING.md`.
- No trusted published pars exist for several rifle drills (first-shot at
  25/50/100, barricade, rifle-to-pistol); those pars are house numbers, and
  `docs/DRILLS.md` says which.
- Expert benchmark times (`pro` in `drills.json`) are from published
  sources where they exist and estimates where they don't; the doc marks each.
- 5.7×28 is absent from the catalogue because no maker publishes a BC.

### 4. Ballistics gaps

- No Doppler bullet library (Applied Ballistics / Hornady 4DOF have them);
  BCs are maker-published G1/G7. Expect a few percent past 600 yd.
- Aerodynamic jump is not modelled (rule of thumb is in the doc).
- Coriolis needs latitude and azimuth; the compass supplies azimuth on phones
  that have one and expose it to the browser (iOS asks permission; some
  Androids report nothing).
- Weather is the 10 m model wind at the nearest grid point, not the flag on
  the berm. The UI says so; a Kestrel/BLE weather meter link would be better.
- Suppressor is recorded, not modelled (correctly — POI shift is a zero
  problem).
- Spin drift needs bullet length; the catalogue carries approximate lengths
  for its loads, custom loads need one typed in.

### 5. UI / UX

- The Log tab with a stage loaded is long (one row per target); on 12-target
  stages it scrolls. Consider a compact per-target row or a two-column layout
  on wider phones.
- The description under the drill is open by default (asked for); it pushes
  LOG IT below the fold on long descriptions. Tap collapses it.
- Landscape and tablet layouts are functional, not designed. Desktop is a
  centred phone.
- No onboarding: first open shows an empty book and a Bill Drill. A
  three-screen intro (what a run is, hold to log, set a goal) would help.
- No haptics beyond `navigator.vibrate` (Android only).
- Accessibility: buttons are labelled, contrast is fine in both themes, but
  nothing has been tested with a screen reader.
- Copy still says "her" in one or two comments in the source; no user-facing
  text refers to the assistant.

### 6. Engineering

- `index.html` is ~2,000 lines in one file. Fine for a PWA, wrong for a team.
  Split into modules when there's more than one contributor.
- No tests. The engine's scoring was checked by hand against the rulebook
  and against the original Python implementation; write unit tests for
  `scoreStage`, `buildRow`, `analyse` first — they are pure functions.
- No build step, no bundler, no TypeScript. Deliberate for now.
- Service worker is cache-first with background refresh; bump `VERSION` in
  `sw.js` on every deploy or users keep the old shell.

## Decisions already made (don't relitigate without a reason)

- Zones are A / C / D / miss. No B, no separate head zone; a head hit is an A
  or a C like anywhere else, and a *called* head shot that lands on the body
  scores as a miss on the drill.
- Toggle, never swipe, next to anything you tap fast.
- Hold to log. A stray tap must not create a run.
- Round counts are capped on drills, not on stages (make-up shots are legal).
- Stages are scored per target, never from totals.
- Splits are entered as cumulative shot times or as gaps — the user picks —
  and stored as cumulative.
- The goal, when set, is the big number on the drill card; par sits under it.
- Dark is the default theme.
- Nothing in the app names a training company or a rulebook publisher in the
  UI; the docs cite them.

## Next three things I'd build

1. A backend with accounts and the same `api()` contract, so the book syncs
   and a coach can see a student's runs.
2. The AMG/SG timer link (BLE) in a native shell, so time and splits arrive
   without typing.
3. Drill/session/stage sharing by link.
