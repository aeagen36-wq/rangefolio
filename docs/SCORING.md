# Competition Scoring Rules — Research Notes

Compiled 2026-09-24 from primary sources only (official rulebooks, PractiScore documentation, and published match-director rules). Every bullet carries a Source line; rule numbers are given where the source shows them. Quotations are verbatim from the source as retrieved. Where sources disagree, or a fact could not be verified from a primary source, this is stated explicitly.

Rulebook editions used:

| Body | Edition used | Notes |
|---|---|---|
| USPSA Handgun | USPSA Competition Rules, online edition identifier `USPSA2026-09`, effective 2026-09-01 (rules.uspsa.org). The downloadable PDF at uspsa.org is titled "March 2026"; the online changelog is labelled "2026-03, approved by Board of Directors 1/26/2026". | The online site is USPSA's canonical rules host; the 2026-09 identifier appears to be a re-issue of the March 2026 text. Treat the online text as current. |
| USPSA Multigun | USPSA Rifle, Shotgun & Multigun Rules, online identifier `Multigun2026-09`, effective 2026-09-01. PDF titled "March 2026". | Same site. |
| IDPA | IDPA Rulebook "Ver. 2026.2 Adopted 10/26/96, amended 1/10/26" (idpa.com). | Companion "2026 Match Administration Rules" and "2026 Equipment Appendices" PDFs also exist. |
| UML | United Multi-Gun League Rules, Version 2.3 (Google Doc published by UML). | Undated in the extracted text. |
| 3-Gun Nation | **No live primary source.** See Section 2.4. | 3gunnation.com now serves unrelated (gambling) content; historical 3GN rule PDFs are hosted only on third-party club sites and could not be fetched. |
| IPSC | IPSC Handgun Competition Rules, January 2024 edition PDF. | PDF text extraction was unreliable in this session; only facts that could be cross-checked are used. |

---

## 1. USPSA Handgun (Comstock / hit-factor scoring)

### 1.1 Targets and scoring zones

- USPSA approves two cardboard target families: the USPSA target and the IPSC ("metric"/"classic") target. Both are scored A / C / D. The B zone no longer exists as a distinct score: "the B zone on all USPSA targets is now scored as a C hit"; "B zoned targets are on an indefinite phase out per BOD directive in 2018", and "B-zoned cardboard targets may still be used as official targets but must be scored using the A-C-D scoring listed above."
  Source: https://rules.uspsa.org/uspsa/appendix/B1 (Appendix B1)
- Points per zone (Appendix B1 table):

  | Zone | Major PF | Minor PF |
  |---|---|---|
  | A | 5 | 5 |
  | C | 4 | 3 |
  | D | 2 | 1 |

  Source: https://rules.uspsa.org/uspsa/appendix/B1 (Appendix B1)
- Rule 9.4.1: "Scoring hits on authorized targets will be scored in accordance with the values assigned such targets."
  Source: https://rules.uspsa.org/uspsa/section/9.4
- Rule 5.6 delegates: Minor/Major point values are "illustrated in Appendix B"; power-factor floors are "stipulated in Appendix D"; chronograph procedure is "stipulated in Appendix C2".
  Source: https://rules.uspsa.org/uspsa/section/5.6
- Partial targets / hard cover: for a USPSA target to be legal, "At least 25% of the lower A-zone, or the entire upper A-zone, must remain visible around hard cover"; for half-size targets "At least 50% of the lower A-zone must remain visible around hard cover or overlapping no-shoots."
  Source: https://rules.uspsa.org/uspsa/appendix/B1

### 1.2 Power factor

- Formula (Appendix C2): "Power Factor = bullet weight (grains) x average velocity (feet per second) / 1000".
  Source: https://rules.uspsa.org/uspsa/appendix/C2
- Rounding (Appendix C2): "The final result will ignore all decimal places (e.g. for USPSA purposes, a result of 124.9999 is not 125)." I.e., truncate, never round up.
  Source: https://rules.uspsa.org/uspsa/appendix/C2
- Procedure (Appendix C2): eight rounds are collected; "One bullet is weighed to determine the actual bullet weight"; three rounds are fired initially; if the declared PF is not met, "another round will be fired over the chronograph and the scores recalculated using the bullet weight and the average top three highest velocities of the number of shots fired. This will continue until either the competitor meets the minimum power factor or until all 6 rounds have been fired." "Digits displayed on the official match bullet scales and chronograph will be used at face value."
  Source: https://rules.uspsa.org/uspsa/appendix/C2
- Consequence of failing: below the Major floor, "the competitor's entire match scores will be recalculated as Minor, if achieved"; below Minor, the competitor may continue "but not for score or match recognition."
  Source: https://rules.uspsa.org/uspsa/appendix/C2
- Floors by division (Appendix D1–D9):

  | Division | Minor floor | Major floor |
  |---|---|---|
  | Open (D1) | 125 | 165 |
  | Limited (D2) | 125 | 165 |
  | Limited-10 (D3) | not fetched (see note) | not fetched |
  | Production (D4) | 125 | Not Applicable |
  | Single Stack (D5) | not fetched | not fetched |
  | Revolver (D6) | 125 | 165 |
  | Carry Optics (D7) | 125 | Not Applicable |
  | Pistol Caliber Carbine (D8) | 125 | N/A |
  | Limited Optics (D9) | 125 | Not Applicable |

  Sources: https://rules.uspsa.org/uspsa/appendix/D1 , https://rules.uspsa.org/uspsa/appendix/D2 , https://rules.uspsa.org/uspsa/appendix/D4 , https://rules.uspsa.org/uspsa/appendix/D6 , https://rules.uspsa.org/uspsa/appendix/D7 , https://rules.uspsa.org/uspsa/appendix/D8 , https://rules.uspsa.org/uspsa/appendix/D9 . D3 and D5 were not fetched in this session; verify before hard-coding.
- Disagreement note (IPSC vs USPSA): IPSC uses different Major floors from USPSA in several divisions. The IPSC 2024 PDF extraction in this session returned contradictory numbers (170 in one pass, 165 in another) and is not relied on here. If IPSC support is needed, read Appendix D of the IPSC Handgun rules directly: https://www.ipsc.org/wp-content/uploads/2023/12/IPSC-Handgun-Competition-Rules-Jan-2024-Edition-Final-27-Dec-2023.pdf

### 1.3 What counts as a hit; line hits

- Rule 9.5.2: "If the bullet diameter of a hit on a scoring target touches the scoring line between two scoring areas, or the line between the non-scoring border and a scoring area, or if it crosses multiple scoring areas, it will be scored the higher value."
  Source: https://rules.uspsa.org/uspsa/section/9.5
- Rule 9.5.2.1: 9.5.2 "is clarified to apply only to the visible portions of targets. It specifically does not apply to any area of any target which is in direct contact with and overlapped by the scoring area of another target (scoring and/or no-shoots) or by hard cover."
  Source: https://rules.uspsa.org/uspsa/section/9.5
- Rule 9.5.3: "If a bullet diameter touches the scoring area of both a scoring target and a no-shoot, it will earn the score and incur the penalty."
  Source: https://rules.uspsa.org/uspsa/section/9.5
- Rule 9.5.4: "Radial tears will not count for score or penalty."
  Source: https://rules.uspsa.org/uspsa/section/9.5
- Rule 9.5.5: enlarged holes larger than bullet diameter do not count "unless there is visible evidence within the remnants of the hole (e.g. a grease mark or a 'crown' etc.)".
  Source: https://rules.uspsa.org/uspsa/section/9.5
- Rule 9.5.8: hits from shots fired through the rear of a target do not count; Rule 9.5.9: hits "must completely pass through the target to be considered a valid hit".
  Source: https://rules.uspsa.org/uspsa/section/9.5
- Rule 9.1.5 (impenetrable): "Scoring areas are impenetrable" — a bullet that fully passes through one scoring target onto another does not count on the second target; 9.1.6: unless declared soft cover, all props/walls/barriers are impenetrable hard cover; 9.1.7: target sticks and barrier supports are neither hard nor soft cover and shots through them count.
  Source: https://rules.uspsa.org/uspsa/section/9.1

### 1.4 How many hits are scored; extra hits and make-up shots

- Rule 9.5.1: "scoring cardboard targets must be shot with a minimum of one round each, with the best two hits to score. Scoring metal targets must be shot with a minimum of one round each and must fall to score." The stage briefing may stipulate a different number of hits (9.2.2: "stipulated number of hits per target to count for score").
  Source: https://rules.uspsa.org/uspsa/section/9.5 ; https://rules.uspsa.org/uspsa/section/9.2
- Comstock (9.2.2): "Unlimited time stops on the last shot, unlimited number of shots to be fired, stipulated number of hits per target to count for score." Therefore in Comstock, make-up shots are allowed without penalty; only the best N hits per target are scored and additional hits are simply unscored.
  Source: https://rules.uspsa.org/uspsa/section/9.2
- Virginia Count (9.2.3): "Unlimited time stops on the last shot, limited number of shots to be fired, stipulated number of hits per target to count for score." Fixed Time (9.2.4): "Limited time, limited number of shots to be fired, stipulated number of hits per target to count for score." In these two, extra shots and extra hits are penalised (see 1.6).
  Source: https://rules.uspsa.org/uspsa/section/9.2
- Rule 9.2.3.2 / 9.2.4.2: Virginia Count and Fixed Time "must use cardboard targets exclusively" and only for Standard Exercises, Classifiers, Speed Shoots, Medium or Short Courses.
  Source: https://rules.uspsa.org/uspsa/section/9.2

### 1.5 Misses, no-shoots, failure to engage

- Rule 9.4.4 (miss): "Each miss will be penalized twice the value of the maximum scoring hit available on that target, except in the case of Fixed Time or disappearing targets." With a 5-point maximum, a miss is -10. A "miss" is each required hit that is not present (a target requiring two hits with one D hit has one miss). The per-required-hit interpretation follows from 9.5.1 ("best two hits to score") combined with 9.4.4 ("each miss").
  Source: https://rules.uspsa.org/uspsa/section/9.4 ; https://rules.uspsa.org/uspsa/section/9.5
- Rule 9.4.2 (cardboard no-shoot): "Each hit visible on the scoring area of a cardboard no-shoot will be penalized the equivalent of twice the point value of a maximum scoring hit." (-10 per hit.)
  Source: https://rules.uspsa.org/uspsa/section/9.4
- Rule 9.4.3 (metal no-shoot): "Each full or partial diameter hit visible on the frontal surface of a metal no-shoot will be penalized the equivalent of twice the point value of a maximum scoring hit." A metal no-shoot that fails to fall still incurs the penalty and "Failure to fall is not grounds for a reshoot" (4.3.1.x).
  Source: https://rules.uspsa.org/uspsa/section/9.4 ; https://rules.uspsa.org/uspsa/section/4.3
- Maximum no-shoot penalties per target: the current USPSA text imposes no per-no-shoot cap in 9.4.2/9.4.3 as retrieved; every visible hit is penalised. (Contrast Texas 3-Gun, Section 2.5, which caps at 2 hits per no-shoot.) Rule 10.2.3 caps only *procedural* penalties: "Multiple penalties must not exceed the maximum number of scoring hits that can be attained by the competitor."
  Source: https://rules.uspsa.org/uspsa/section/9.4 ; https://rules.uspsa.org/uspsa/section/10.2
- Failure to shoot at / engage — Rule 9.5.7: "A competitor who fails to shoot at the face of each scoring target in a course of fire with at least one round will incur one procedural penalty per target for failure to shoot at the target, as well as appropriate penalties for misses." Rule 10.2.7 restates it: "one procedural penalty per target, plus applicable misses." So an un-engaged 2-hit paper target costs -10 (procedural) + 2 × -10 (misses) = -30.
  Source: https://rules.uspsa.org/uspsa/section/9.5 ; https://rules.uspsa.org/uspsa/section/10.2
- Disappearing targets — Rule 9.9.2: activated targets that do not remain legally visible "are considered disappearing targets and will not incur failure to shoot at or miss penalties, unless they are not activated." Rule 9.9.1: activated targets that present a legal portion of the A-zone at rest "will always incur failure to shoot at and miss penalties" (except Fixed Time). Rule 9.9.3: appearing targets must be activated "before or with the last shot fired" or penalties apply.
  Source: https://rules.uspsa.org/uspsa/section/9.9
- Fixed Time — Rule 9.2.4.4: "Fixed Time courses of fire do not incur failure to shoot at or miss penalties."
  Source: https://rules.uspsa.org/uspsa/section/9.2

### 1.6 Procedural penalties

- Value — Rule 10.1.2: penalties equal twice the maximum cardboard target hit value per Appendix B1; with a 5-point maximum, each procedural is minus 10 points.
  Source: https://rules.uspsa.org/uspsa/section/10.1
- Per occurrence vs per shot — Rule 10.2.1 (fault lines): "one procedural penalty per occurrence", but "if the competitor has gained a significant advantage on any target(s) while faulting, the competitor may instead be assessed one procedural penalty for each shot fired at the subject target(s)." Rule 10.2.1.2: a shooter completely outside after leaving a shooting area receives "one penalty for each shot fired until presence is re-established." Rule 10.2.2 (stage procedure): "one procedural penalty for each occurrence", or per shot if significant advantage gained.
  Source: https://rules.uspsa.org/uspsa/section/10.2
- Per-shot cases: Rule 10.2.4 (mandatory reload) — "one procedural penalty for each shot fired after the point where the reload was required"; Rule 10.2.8 (strong/weak hand only) — "one procedural penalty per shot".
  Source: https://rules.uspsa.org/uspsa/section/10.2
- Cap — Rule 10.2.3: "Multiple penalties must not exceed the maximum number of scoring hits that can be attained by the competitor."
  Source: https://rules.uspsa.org/uspsa/section/10.2
- Rule 10.1.4: "Procedural penalties cannot be nullified by further competitor action."
  Source: https://rules.uspsa.org/uspsa/section/10.1
- Virginia Count / Fixed Time extras — Rule 9.4.5.1: "Extra shots ... will each incur one procedural penalty." Rule 9.4.5.2: "Extra hits (i.e. hits on the scoring area of scoring cardboard targets in excess of the total number specified in the Written Stage Briefing), will each incur one procedural penalty." Rule 9.4.5.3: stacked shots "shall incur one procedural penalty for each saved transition."
  Source: https://rules.uspsa.org/uspsa/section/9.4
- Fixed Time overtime — Rule 9.4.6.2: shots more than 0.30 s over the set time "will be penalized the maximum possible scoring value."
  Source: https://rules.uspsa.org/uspsa/section/9.4
- Level I only — Rule 9.9.4: engaging an activated target before activation when prohibited by the WSB "will incur one procedural penalty per shot fired".
  Source: https://rules.uspsa.org/uspsa/section/9.9

### 1.7 Steel

- Rule 9.5.1: "Scoring metal targets must be shot with a minimum of one round each and must fall to score." Rule 4.3: "Scoring metal targets must be shot and fall or overturn to score." Point value is that assigned to the target (5 points in handgun; Multigun 9.2.5 allows enhanced values).
  Source: https://rules.uspsa.org/uspsa/section/9.5 ; https://rules.uspsa.org/uspsa/section/4.3
- Popper hit but standing: subject to calibration (Appendix C1); calibration requires "Visible evidence of a hit"; a plate that fails to fall when hit → "the Range Officer shall declare range equipment failure and order the competitor to reshoot", except "A plate that has been hit a second time and falls or overturns before a Range Officer can stop the competitor, will be scored as hit and there will be no reshoot issued." Metal plates are not subject to calibration.
  Source: https://rules.uspsa.org/uspsa/section/4.3
- A steel target not knocked down is a miss (-10) and, if never shot at, also a failure-to-shoot-at procedural (9.5.7).
  Source: https://rules.uspsa.org/uspsa/section/9.5

### 1.8 Hit factor, stage points, match percentage

- Rule 9.2.2.1: "A competitor's score is calculated by adding the highest value stipulated number of hits per target, minus penalties, divided by the total time (recorded to two decimal places) taken by the competitor to complete the course of fire, to arrive at a hit factor." The rule awards "the competitor with the highest hit factor the maximum points available for the course of fire, with all other competitors ranked relatively below the stage winner."
  Source: https://rules.uspsa.org/uspsa/section/9.2
- Formula in app terms: `HF = max(0, points − penalties) / time`. `stage_points = (HF / high_HF_in_division) × max_stage_points`, where `max_stage_points` = sum of maximum hit values on the stage (5 × required hits, incl. steel). The proportional formula is the universal implementation of "ranked relatively below" (e.g., PractiScore: "stage points for the best Hit Factor (points/time)"); the rule text itself states the principle, not the arithmetic. Fixed Time is not factored: Rule 9.2.4.1 — results "are not factored" and are ranked "by actual net points."
  Source: https://rules.uspsa.org/uspsa/section/9.2 ; https://community.practiscore.com/t/match-and-scoring-types-supported-in-the-practiscore-apps/1896
- Precision — Rule 9.2.5: stage results ranked "in descending order of individual stage points achieved, calculated to 4 decimal places." Rule 9.2.6: match results are "the combined total of individual stage points achieved, calculated to 4 decimal places." Match percentage = competitor total ÷ division winner total.
  Source: https://rules.uspsa.org/uspsa/section/9.2
- Floor — Rule 9.5.6: "The minimum score for a course of fire or string will be zero." (Applied to the points before dividing by time; HF cannot be negative.)
  Source: https://rules.uspsa.org/uspsa/section/9.5
- Time — Rule 9.10.1: "Only the timing device operated by a Range Officer must be used to record the official elapsed time"; Rule 9.10.3: a competitor who starts but does not fire/continue with no official time receives a DNF with zero time and zero score.
  Source: https://rules.uspsa.org/uspsa/section/9.10

### 1.9 Recent changes relevant to scoring (2026 changelog)

- 9.9.1 now references Appendix B1 for the legal A-zone definition instead of restating "25% of the lower A-zone"; 9.11.1 alternate-scoring-program approval moved to the "USPSA Director at Large"; 9.11.2 allows digital score records "if indicated on Form C"; App. C3 certified-ammo tolerance reduced to "more than 5 power factor points below" (from 10).
  Source: https://rules.uspsa.org/uspsa/changelog

---

## 2. Multigun / 3-Gun time-plus scoring

USPSA Multigun permits two scoring systems in the same rulebook: traditional hit factor (Multigun 9.2) and Time Plus (Multigun 9.3). Most outlaw and UML matches use time plus only.

### 2.1 USPSA Multigun — Time Plus (Multigun Chapter 9.3)

- Neutralization — Rule 9.3.1 / 9.3.1.1: "Unless otherwise stipulated in the written stage briefing, any cardboard target designated as a 'shoot' target must be neutralized by either one (1) 'A' hit - OR - two (2) hits anywhere inside the scoring perforations on the target (i.e. minimum 2 'D' hits) to avoid a penalty." Optional: "for shotgun one slug hit anywhere in the scoring area will neutralize a cardboard target."
  Source: https://rules.uspsa.org/multigun/section/9.3
- Penalty values (Multigun 9.3.2):

  | Rule | Situation | Penalty |
  |---|---|---|
  | 9.3.2.1 | "One C or D hit only = 5 second penalty (Failure to neutralize)" | +5 s |
  | 9.3.2.2 | "No hits on cardboard target but target was engaged = 10 second penalty per target" | +10 s |
  | 9.3.2.3 | "A miss on a frangible, knock down or self-indicating target that was engaged = 10 second penalty per target" | +10 s |
  | 9.3.2.4 | "A failure to engage any target adds a 5 second penalty to any miss penalties" (no additional procedural) | +5 s + miss |
  | 9.3.2.5 | "'No Shoot' targets that are hit will incur a 5 second penalty for each hit" | +5 s/hit |
  | 9.3.2.6 | "Procedural penalties...are 5 seconds added to the shooters time per procedural" | +5 s |
  | 9.3.2.7 | "A miss on an enhanced penalty targets can be increased to a 15 or a 20 second penalty" (long-range rifle, >100 yd) | +15/20 s |
  | 9.3.2.8 | "Failing to completely spin a spinner target one revolution is a 60 second penalty" | +60 s |

  Source: https://rules.uspsa.org/multigun/section/9.3
- Failure to engage vs 10.2.7: Multigun 10.2.7 says "one procedural penalty per target, plus the applicable number of misses"; under time plus a procedural is 5 s (9.3.2.6), so both readings yield +5 s + miss penalties. Multigun 10.2.13 gives an example of a "30 seconds in time plus scoring or 3 procedurals in traditional Comstock scoring" penalty (abandoning a loaded firearm with safety off), confirming the 1 procedural = 5 s equivalence... with 30 s = 3 × 10 points in hit factor terms.
  Source: https://rules.uspsa.org/multigun/section/10.2
- Max time — Rule 9.3.3: time limits apply on long-range rifle stages (minimum 180 s; default maximum 500 s); "When the shooter 'times out,' the stage is scored as shot including any misses and FTSA penalties. The max time is the time recorded."
  Source: https://rules.uspsa.org/multigun/section/9.3
- Flying clays — Rule 9.3.4: scored either as bonus targets (time deducted) or as regular targets with miss penalties. Static clays/frangibles — Rule 9.5.1: frangible targets "must break with a visible piece missing or separated" to score.
  Source: https://rules.uspsa.org/multigun/section/9.3 ; https://rules.uspsa.org/multigun/section/9.5
- Steel — Rule 9.5.1: metal targets "must fall (or otherwise react...to score)"; Rule 9.5.3: handgun poppers must fall; self-indicating targets must show the designed response; shotgun plates score if they fall from any strike on plate or base.
  Source: https://rules.uspsa.org/multigun/section/9.5
- Birdshot on paper — Rule 9.1.8: "Hits from birdshot or buckshot on a scoring or no shoot cardboard target will not count for score" unless the WSB authorises it. Slug holes obscured by wad damage → reshoot (9.5.2.7). Hits with the wrong firearm do not score (9.5.2.8).
  Source: https://rules.uspsa.org/multigun/section/9.1 ; https://rules.uspsa.org/multigun/section/9.5
- Line hits, radial tears, rear hits, pass-through: same wording as handgun (Multigun 9.5.2.1–9.5.2.6).
  Source: https://rules.uspsa.org/multigun/section/9.5
- Power factor — Rule 9.3.5: "Power Factors do not apply to Time Plus scoring and there is no minimum power factor."
  Source: https://rules.uspsa.org/multigun/section/9.3
- Stage points — Rule 9.3.6: "First Place (lowest time) for each stage, in each division, will receive the maximum stage points; Second Place and below will figure points on a percentage basis of the points from 1st Place on the stage." Maximum stage points may be 25, 50, 75, 100, 125 or 150 (default 100). 9.3.7–9.3.8: match = sum of stage points, highest wins. In app terms: `stage_points = (fastest_total_time / competitor_total_time) × max_points`.
  Source: https://rules.uspsa.org/multigun/section/9.3
- Procedural cap — Multigun 10.2.3: "Where multiple penalties are assessed in the above cases, they must not exceed the maximum number of scoring hits that can be attained by the competitor."
  Source: https://rules.uspsa.org/multigun/section/10.2

### 2.2 USPSA Multigun — hit-factor option (Multigun 9.2), for completeness

- 9.2.4.2–9.2.4.4: no-shoot and miss penalties are "twice the point value of a maximum scoring hit" (same as handgun); 9.2.4.5: spinner spun = 20 points, failing = 40-point penalty; 9.2.5: optional enhanced steel/frangible values by distance (e.g., rifle steel +10 points per 100 yd); 9.2.5.7: enhanced values "apply to steel or thrown/launched frangible targets only"; 9.2.5.8.2: procedural = twice max cardboard value (10 points); 9.2.6: minimum stage score zero; 9.2.7: power factor applies (Minor required, Major optional).
  Source: https://rules.uspsa.org/multigun/section/9.2

### 2.3 UML (United Multi-Gun League), Rules v2.3

- Time plus — Rule 8.2: "Each stage is time plus penalties. Maximum points are assigned based on the fastest time in each division rounded down to the nearest whole second." "The top time in each division would receive 100% of those points. The next competitor's time is divided in to determine their percentage of points." Example given: 59.9 s stage worth 59 points; 62.0 s scores (59.9 ÷ 62) × 59 = 57.0016. Rule 8.2.1: stage points may instead be fixed at 100 if announced before the match. Rule 8.3: match = cumulative stage points per division.
  Source: https://docs.google.com/document/d/1i7rn0rwTHmQM4jsJ9md0870yVp0Xqst96MFLLi1WdOk/mobilebasic
- Neutralization by target type — Rule 8.8: UML Hex target: "One hit in the 'center' (6" hex)" or "Two hits anywhere inside the outer scoring border"; USPSA metric/mini: "One hit inside the A or B zones" or "Two hits anywhere inside the perforated scoring border"; IPSC classic: "One hit in the A zone" or two anywhere; 3GN square target: "One hit in the 'Center' (8" circle)" or "Two hits anywhere inside the 18"x18" non-scoring perforated border".
  Source: same URL
- Slugs — Rule 8.8.5: "Slugs are prohibited on paper unless otherwise stated in WSB. Match directors may allow either 1 slug anywhere or 1A/2 anywhere as with any other projectile."
  Source: same URL
- Two penalty schedules. Rule 8.15 "UML Traditional": penalty target +5 s per hit; FTN +5 s; any missed target under 100 yd (paper, steel, clay) +10 s; missed steel 100–300 yd +20 s; beyond 300 yd +30 s; failure to spin spinner +60 s. Rule 8.14 "EMG Low" (Expedition Multi-Gun): FTN +2 s; miss on paper / steel <45 yd / clay +4 s; penalty target +3 s per hit; missed steel 45–100 yd +10 s; 100–300 yd +20 s; >300 yd +30 s; spinner +30 s.
  Source: same URL
- Procedurals — Rule 9.1: +5 s (foot faults, failure to follow WSB, using abandonment containers for support, shooting clays with non-birdshot, minimum engagement: "Min target engagement per gun listed in WSB is 3 unless otherwise noted. 1 procedural issued per target less than 3 engaged."). Rule 9.2: +30 s (slug on KD steel under 45 yd, forbidden area, dropping unloaded pistol, unsafe/incorrect abandonment, staging prohibited equipment, unsportsmanlike conduct).
  Source: same URL
- Steel/clays — Rule 8.9: non-hinged knockdowns are down when "turned 45 degrees or more"; 8.10: long-range flashers "shall be struck with a bullet to score"; 8.11: static plates "struck with a bullet to score; individual stages may require multiple hits"; 8.8.3: missing scores "shall be reshot, or if not possible, scored as max time".
  Source: same URL

### 2.4 3-Gun Nation (3GN)

- No current primary source exists. The domain 3gunnation.com now serves unrelated gambling content (fetched 2026-09-24), the memberships.3gunnation.com host does not resolve, and the only 3GN rule PDFs findable (a "3-Gun Nation Regional Series Rules" revision dated 4-16-14 hosted on atlanta3gun.com) could not be retrieved. Do not cite 3GN penalty values without a retrievable document.
  Source (attempted): https://www.3gunnation.com/ufaqs/how-does-scoring-work/ ; http://atlanta3gun.com/wp-content/uploads/2013/10/3GN-Rule-Revision-4-16-14.pdf
- What survives of 3GN in live rulebooks: the "3GN square target" (18"×18" with 8" centre circle) is still defined as a legal target with its neutralization rule in UML 8.8 (one centre hit or two anywhere). PractiScore still ships a "3GN Multigun" template under its Time Plus match type.
  Source: https://docs.google.com/document/d/1i7rn0rwTHmQM4jsJ9md0870yVp0Xqst96MFLLi1WdOk/mobilebasic ; https://community.practiscore.com/t/match-and-scoring-types-supported-in-the-practiscore-apps/1896

### 2.5 Outlaw example: Texas 3-Gun Championship rules (updated 01/25/2023)

Included as a representative, published, major-match rule set; it illustrates where outlaw matches diverge from USPSA Multigun.

- Neutralization 6.1.1: "one (1) A-zone hit, one (1) B-zone hit or two (2) hits anywhere in the scoring area". 6.1.1.4: "Slug paper targets will require only 1 hit inside the scoring area". 6.1.1.5: Heavy Optics division "will require only 1 hit inside the scoring area to neutralize with rifle".
- FTN 6.1.2.1: "One (1) hit in the C-zone or D-zone only = 5 second penalty". Paper miss 6.1.2.2: "No hits on target, but target was engaged = 10 second penalty".
- Steel miss 6.1.5.1: ≤100 yd = 10 s; 6.1.5.2: ≥100 yd = 20 s. Static clay miss 6.1.8.1: 5 s; aerial clay miss 6.1.8.2: 2.5 s.
- Not engaged 6.1.9: <100 yd +5 s, ≥100 yd +10 s, each plus the miss penalty.
- No-shoot 6.1.10: "10 second penalty per hit, up to a maximum of 2 hits per no-shoot" (differs from USPSA Multigun's 5 s uncapped and UML's 5 s / 3 s).
- Procedural 6.1.11: 5 s; Prohibited action 6.1.12: 20 s.
- Stage points 6.2.2: "STAGE_POINTS = (FASTEST_TIME / PARTICIPANT_TIME ) x 100".
  Source: https://static1.squarespace.com/static/55a42906e4b0a6129224601d/t/641133747391f6738a2243be/1678848885531/TX3G+Rules.pdf

### 2.6 Cross-body comparison (time plus)

| Item | USPSA Multigun 9.3 | UML Traditional 8.15 | UML EMG Low 8.14 | TX3G 2023 |
|---|---|---|---|---|
| Neutralize paper | 1 A or 2 anywhere | 1 A(/B on USPSA target) or 2 anywhere; 1 centre or 2 anywhere on Hex/3GN | same | 1 A or 1 B or 2 anywhere |
| FTN (1 C/D only) | 5 s | 5 s | 2 s | 5 s |
| Paper miss (engaged) | 10 s | 10 s | 4 s | 10 s |
| Steel/clay miss | 10 s (15/20 enhanced >100 yd) | 10 s <100 yd; 20 s 100–300; 30 s >300 | 4 s <45 yd; 10 s 45–100; 20/30 s beyond | 10 s ≤100 yd; 20 s ≥100 yd; clay 5 s static / 2.5 s aerial |
| No-shoot | 5 s per hit | 5 s per hit | 3 s per hit | 10 s per hit, max 2 per no-shoot |
| Failure to engage | +5 s plus misses | procedural 5 s (min-engagement rule) plus misses | same | +5 s (<100 yd) / +10 s (≥100 yd) plus misses |
| Procedural | 5 s | 5 s (30 s for listed serious infractions) | 5 s | 5 s (20 s prohibited action) |
| Slug on paper | optional 1 slug neutralizes | prohibited unless WSB; MD may allow 1 slug or 1A/2 | same | 1 hit |
| Stage points | fastest/time × 25–150 (default 100) | fastest/time × floor(fastest) points, or fixed 100 | same | fastest/time × 100 |

Sources: as listed in 2.1, 2.3, 2.5.

---

## 3. IDPA scoring (Rulebook Ver. 2026.2, amended 1/10/26)

- Principle: "everything is based on time; the raw time it takes to shoot a stage and the accuracy of the hits on the targets, where inaccuracy adds time to the score."
  Source: https://www.idpa.com/wp-content/uploads/2026/01/2026-IDPA-Rulebook-2.pdf
- Unlimited scoring — Rule 4.1: "take the time it took to complete the strings of fire (raw time from the shot timer) and total up the points down from each target." Rule 4.1.2 (best hits): "If 3 hits are required on each target, then the best 3 hits will be scored if there are more than 3 hits on the target." Rule 4.1.3: "Each point down adds 1 second to the time for the stage."
  Source: same PDF
- Zone values — Rule 4.12.1.1: "Threat targets will be scored as marked, as -0, -1, -3, and a miss is -5." Therefore: -0 = 0 s, -1 = 1 s, -3 = 3 s, miss = 5 s per required hit not present.
  Source: same PDF
- Limited scoring — Rule 4.2: "Firing any extra shots in a string of fire will incur one Procedural Error penalty per string, and for each extra shot, one of the best scoring hits will be taped over." (Make-up shots are therefore legal only in Unlimited stages.)
  Source: same PDF
- Incomplete stage — Rule 4.3: "the score will be determined by writing down the time and scoring the stage as found by noting all points down (including misses), adding penalties." Match DNF — Rule 4.4: a shooter who chooses not to shoot a stage "will be given a DNF for that stage but may continue to shoot other stages for no total match score."
  Source: same PDF
- Scoring calls — Rule 4.5.1: "When a Safety Officer has a reasonable doubt on a scoring call (including penalties) the SO will award the better score to the shooter." 4.5.3: the grease ring "is used to determine the outside diameter of the hole for scoring." 4.5.4: "A radial tear must not be used to give a shooter a better score. If the actual area of the bullet hole does not reach the next better scoring ring, the shooter gets the lower score." 4.6.1: elongated holes exceeding two bullet diameters "do not count for score." 4.7.4: a full-diameter hole through simulated hard cover that continues into a target "will be considered to have missed the target."
  Source: same PDF
- Line hits: the 2026 text as extracted expresses the line rule through 4.5.1 (reasonable doubt → better score) and 4.5.3 (grease ring is the hole's outside diameter); no separate "touching the perforation" sentence was retrieved. Confirm against the PDF before encoding a specific line-hit rule.
  Source: same PDF
- Head/body — 4.10.1–4.10.3: head scoring applies "above the neckline", body "below the neckline"; a "Target" designation allows hits anywhere in the silhouette.
  Source: same PDF
- Non-threats — Rule 4.11.1/4.11.2: "A Hit on a Non-Threat (HNT) is defined as a hit in any scoring zone ... Each hit on a Non-Threat adds 5 seconds to the shooter's score." No per-target cap appears in the retrieved text.
  Source: same PDF
- Steel — Rule 4.12.2 (poppers): "scored as down zero (-0) if they fall. If the target is left standing it is scored as down five (-5)." Rule 4.12.3 (steel "legs" plates): same -0 / -5.
  Source: same PDF
- Procedural Error — Rule 5.1.1: "Procedural Errors add 3 seconds per infraction and are assessed when: A shooter fails to follow the shooting actions set forth in the written stage description." Rule 5.1.2: "A PE is assessed for each type of infraction. If the shooter commits more than one type of infraction ... a separate PE is assessed for each type of infraction." Cover PEs are capped at the number of positions of cover in the stage.
  Source: same PDF
- Flagrant Penalty — Rule 5.2: "adds ten (10) seconds" when an infraction yields more than a 3-second advantage. Failure To Do Right — Rule 5.3: "20 second Failure To Do Right penalty is assessed for gross unsportsmanlike conduct."
  Source: same PDF
- Failure to Neutralize: the 2026.2 rulebook contains no "Failure to Neutralize"/FTN rule (three targeted searches of the PDF found none). The 5-second FTN of earlier rulebooks should not be encoded for current IDPA. Disagreement note: third-party summaries and older club pages still list FTN = 5 s; the current primary source does not.
  Source: same PDF
- Note on old values: the Shoot'n Score It reference manual (2022) still describes IDPA "points down or PD (multiplied x 0.5)" — the pre-2017 half-second rule. Current IDPA is 1 s per point (4.1.3).
  Source: https://shootnscoreit.com/static/documents/SSI_Ref_Manual.88222a88ba2a.pdf

---

## 4. What this means for an app

### 4.1 Capture per target, not totals

- USPSA hit factor can be computed from stage totals (count of A/C/D/M/NS + procedurals + time), and that is how a paper score sheet works. But per-target capture is what makes the score *auditable* and what unlocks the rules that are inherently per-target: misses are "per required hit not present" on a specific target (9.4.4 + 9.5.1); failure-to-shoot-at is per target (9.5.7); no-shoot penalties attach to a specific no-shoot (9.4.2); disappearing targets waive miss/FTSA for that target only (9.9.2); different targets can require different hit counts (WSB-stipulated).
- Time plus makes per-target capture mandatory rather than optional: neutralization (USPSA MG 9.3.1, UML 8.8, TX3G 6.1.1) is evaluated per target from its hit *zones* ("one A or two anywhere"), so a stage total of "6 C hits" cannot be scored — three targets with 2 C each is neutralized, six targets with 1 C each is six FTNs.
- IDPA is per-target by construction: best-N hits per target (4.1.2), miss per missing required hit (4.12.1.1), HNT per non-threat hit (4.11.2).

### 4.2 Minimal data model

Stage definition (per stage):
- Scoring system: `USPSA_HF_COMSTOCK | USPSA_HF_VIRGINIA | USPSA_HF_FIXED_TIME | TIME_PLUS_{USPSA_MG|UML_TRAD|UML_EMG|TX3G|CUSTOM} | IDPA_UNLIMITED | IDPA_LIMITED`.
- For each scoring target: `kind` (paper USPSA / paper IPSC / paper UML-hex / paper 3GN / popper / plate / flasher / static clay / aerial clay / spinner), `required_hits` (default 2 for paper, 1 for steel), `disappearing: bool`, `distance_yd` (time plus tiers, MG enhanced values), `point_value` (5 default; MG enhanced steel), `slug_target: bool`, `hits_needed_to_neutralize` override (WSB).
- No-shoots: count, `kind` (paper/metal), and (TX3G) per-no-shoot cap.
- Strings: count; Fixed Time: time limit per string.
- Time plus: max/par time (MG 9.3.3, UML 8.8.3), max stage points (MG 9.3.6: 25–150), penalty schedule (body preset, editable).

Per run (competitor × stage):
- `time` (sum of strings, 2 decimals per 9.2.2.1), `power_factor: MINOR|MAJOR` (USPSA HF only; MG 9.3.5 none for time plus).
- Per paper target: counts of A, C, D (and NS hits if the no-shoot is attached to it), plus a derived or entered `miss` count = `required_hits − scored_hits`. Store B as C (App. B1). For IDPA store -0/-1/-3 counts.
- Per steel/clay: `down: bool` (or `hits` for multi-hit plates per UML 8.11).
- Penalties: procedural count with reason and `per_shot: bool` (10.2.1/10.2.2 significant-advantage cases), FTSA count (derivable from targets with zero hits but confirm — a target can be shot at and missed entirely, which is misses only, no FTSA), IDPA PE / FP / FTDR counts, DNF flag, overtime shots (Fixed Time).

### 4.3 Computation rules to encode

- USPSA HF: `points = Σ_targets Σ_best_N zone_value(PF) + 5 × steel_down`; `penalties = 10 × (misses + NS_hits + procedurals + FTSA)`; `net = max(0, points − penalties)` (9.5.6); `HF = net / time`; `stage_pts = HF / high_HF × max_pts` (9.2.2.1); 4-decimal ranking (9.2.5). Virginia/Fixed Time: add 10 per extra shot and per extra hit (9.4.5.1–2); Fixed Time: no misses/FTSA (9.2.4.4), rank by net points (9.2.4.1). Cap procedurals at the stage's max scoring hits (10.2.3).
- Time plus: `score = time + Σ penalties`; per paper target: `neutralized = (A ≥ 1) or (A+C+D ≥ 2)` (or body-specific), `FTN if hits == 1 and not neutralized`, `miss if hits == 0 and engaged`, `FTE if not engaged` (+ miss); `stage_pts = fastest / score × max_pts`.
- IDPA: `score = time + Σ points_down (1 s each; miss = 5) + 3×PE + 5×HNT + 10×FP + 20×FTDR`; Limited: +1 PE per string with extra shots and tape over best hits (4.2).

### 4.4 Ambiguities that remain

- USPSA edition label: rules.uspsa.org says `USPSA2026-09` / effective 2026-09-01; the changelog and PDF say March 2026 (approved 1/26/2026). No scoring-value differences were found between them, but the app should store the edition string it implements.
- USPSA stage-point arithmetic (HF ÷ high HF × max points) is stated as a principle in 9.2.2.1, not as a formula; the definition of "maximum points available" for a stage is not in the retrieved rule text. This is universally implemented as 5 × required hits (incl. steel) and matches PractiScore, but is not a quoted rule.
- USPSA Limited-10 (D3) and Single Stack (D5) PF floors were not fetched; verify (expected 125/165).
- No-shoot per-target caps: none in USPSA/USPSA MG/UML text retrieved; TX3G caps at 2. Make the cap a per-body setting.
- IDPA line-hit rule: only "reasonable doubt → better score" (4.5.1) and grease-ring diameter (4.5.3) were retrieved; confirm whether 2026.2 contains an explicit "touching the line scores the higher zone" sentence.
- IDPA FTN: absent in 2026.2 as retrieved; earlier editions had FTN = 5 s. Confirm and keep as a togglable legacy rule.
- "Engaged" (shot at) vs "not engaged" is an RO judgment that cannot be derived from holes; the app needs an explicit per-target "engaged" flag when hits == 0.
- Time plus "one A" for USPSA targets vs "A or B" in UML 8.8 vs "A-zone or B-zone" in TX3G 6.1.1 — the B zone still exists on some physical targets even though USPSA scores it as C; the neutralization rule must be tied to the target type and body, not only to the zone letter.
- 3GN: no retrievable current rulebook; do not label any preset "3GN" as authoritative.
- IPSC: zone points match USPSA App. B1 for the IPSC target, but IPSC Major floors and any other IPSC-specific differences were not reliably verified here.

---

## 5. Existing apps that score stages

### 5.1 PractiScore (Nifty Bytes / practiscore.com)

- Match types and stage scoring per official tutorial: USPSA — "Hit Factor" with "stage points for the best Hit Factor (points/time)", Comstock stages, A/C/D zones. IDPA — "Points Down | time | timeplus penalties and points down time penalties". "Time Plus | time | timeplus penalties" and "Time Plus (Points) | points | stage points for the best time plus penalties"; "USPSA MultiGun" is listed under Time Plus (Points) and "3GN Multigun" under Time Plus. Steel Challenge: "timeplus penalties (per string)".
  Source: https://community.practiscore.com/t/match-and-scoring-types-supported-in-the-practiscore-apps/1896
- Per-target capture (USPSA): the score-entry screen is per target — "for 2 Alpha on T1, just click the A cell twice"; a completely scored target's row turns green, over-scored rows turn red; steel defaults to down ("If one is left standing, just tap where it has '0' by the Miss"); procedurals are a counter box. The "Targets" field shows "Ready" when all targets are complete.
  Source: https://www.idpaitaly.com/docs/PractiScoreManual.pdf (PractiScore USPSA Scoring System User Guide, October 2011)
- Per-target editing in PractiScore 2: each target carries its own hit count; staff note that "a newly added target uses hits from the last target in the list" and long-press "+" "resets to zero".
  Source: https://community.practiscore.com/t/decreasing-number-of-hits-on-targets/20234
- Stage building: stages are defined from the briefing as number of paper targets, "hits per target"/"rounds per target", steel count, no-shoots, bonus targets (example WSB: "11 USPSA targets and 2 poppers. The best 2 hits per paper will score").
  Source: https://community.practiscore.com/t/building-stages/16951
- Documented gaps: the tutorial states that per-target hit *entry* for time-plus formats exists only in specific templates — "UPL has per-target hits entry (templates USSL-URL-TFS and USSL-UPL-TFS)" and "ICORE has per-target hits scoring except Action Steel" — implying generic Time Plus / 3GN / USPSA Multigun time-plus templates record penalty *counts* (misses, FTN, no-shoots, procedurals) per stage rather than per-target zones. A user request "PCSL using time plus (neutralizing) scoring" exists in the Ideas category (could not be fetched: robots.txt), consistent with neutralization-from-zones not being a built-in generic feature.
  Source: https://community.practiscore.com/t/match-and-scoring-types-supported-in-the-practiscore-apps/1896 ; https://community.practiscore.com/t/pcsl-using-time-plus-neutralizing-scoring/23489 (not retrievable)
- The IDPA "Points Down" template is described as available in the Android app and not on the website; scoring entry method for IDPA was not described in the retrieved thread.
  Source: https://community.practiscore.com/t/points-down-scoring/4335

### 5.2 Shoot'n Score It (SSI, shootnscoreit.com) — IPSC-oriented

- Stage definition by counts: "PAPER: Number of paper targets in stage. POPPER: Number of poppers in stage. PLATE: Number of plates in stage."; minimum rounds auto-calculated or set manually "if the stage requires to shoot target with more then two rounds or in multiple strings."
- IDPA entry is aggregate, not per target: "Allows for entering the; raw time (sum of strings if applicable) in seconds, no of points down or PD (multiplied x 0.5), procedural errors..." — note the outdated ×0.5 factor. Time-plus stages support "Target Not Hit (TNH), Target Not Neutralized (TNN), Target Not Engaged (TNE), Stage Not Fired (SNF)" as counts.
- The manual does not state explicitly whether IPSC hits are entered per target or as stage totals.
  Source: https://shootnscoreit.com/static/documents/SSI_Ref_Manual.88222a88ba2a.pdf (Reference Manual, 28 July 2022)

### 5.3 Others

- Numerous single-purpose calculators exist (hit-factor and power-factor calculators on vendor and hobby sites). None found publish a rules-referenced scoring specification or per-target data model, and they are not primary sources; they are excluded here.

---

## Sources

USPSA Handgun (online rules, edition USPSA2026-09):
- https://rules.uspsa.org/ (edition identifiers)
- https://rules.uspsa.org/uspsa (table of contents, effective date)
- https://rules.uspsa.org/uspsa/section/4.3 (metal targets)
- https://rules.uspsa.org/uspsa/section/5.6 (power factor references)
- https://rules.uspsa.org/uspsa/section/9.1 (general scoring regulations)
- https://rules.uspsa.org/uspsa/section/9.2 (scoring methods, hit factor)
- https://rules.uspsa.org/uspsa/section/9.4 (scoring and penalty values)
- https://rules.uspsa.org/uspsa/section/9.5 (scoring policy)
- https://rules.uspsa.org/uspsa/section/9.9 (activated targets)
- https://rules.uspsa.org/uspsa/section/9.10 (official time)
- https://rules.uspsa.org/uspsa/section/10.1 (procedural penalties, general)
- https://rules.uspsa.org/uspsa/section/10.2 (procedural penalties, specific)
- https://rules.uspsa.org/uspsa/appendix/B1 (cardboard targets, zone values)
- https://rules.uspsa.org/uspsa/appendix/C2 (chronograph / power factor)
- https://rules.uspsa.org/uspsa/appendix/D1 , /D2 , /D4 , /D6 , /D7 , /D8 , /D9 (division PF floors)
- https://rules.uspsa.org/uspsa/changelog (2026 changes)
- https://uspsa.org/documents/rules/current/USPSA-Competition-Rules.pdf (PDF, "March 2026"; not fetchable in this session)

USPSA Multigun (online rules, edition Multigun2026-09):
- https://rules.uspsa.org/multigun
- https://rules.uspsa.org/multigun/section/9.1
- https://rules.uspsa.org/multigun/section/9.2
- https://rules.uspsa.org/multigun/section/9.3
- https://rules.uspsa.org/multigun/section/9.5
- https://rules.uspsa.org/multigun/section/10.1
- https://rules.uspsa.org/multigun/section/10.2
- https://uspsa.org/documents/rules/current/USPSA-Rifle-Shotgun-Multigun-Rulebook.pdf (PDF, "March 2026"; not fetchable)

UML:
- https://docs.google.com/document/d/1i7rn0rwTHmQM4jsJ9md0870yVp0Xqst96MFLLi1WdOk/mobilebasic (UML Rules v2.3)

Outlaw / match-director rules:
- https://static1.squarespace.com/static/55a42906e4b0a6129224601d/t/641133747391f6738a2243be/1678848885531/TX3G+Rules.pdf (Texas 3 Gun Championship Official Rules, updated 01/25/2023)

3-Gun Nation (attempted, not retrievable):
- https://www.3gunnation.com/ufaqs/how-does-scoring-work/ (domain now serves unrelated content)
- http://atlanta3gun.com/wp-content/uploads/2013/10/3GN-Rule-Revision-4-16-14.pdf (fetch failed)

IDPA:
- https://www.idpa.com/idpa-match-rules/ (rules index)
- https://www.idpa.com/wp-content/uploads/2026/01/2026-IDPA-Rulebook-2.pdf (Rulebook Ver. 2026.2)

IPSC (extraction unreliable; used only for cross-reference):
- https://www.ipsc.org/wp-content/uploads/2023/12/IPSC-Handgun-Competition-Rules-Jan-2024-Edition-Final-27-Dec-2023.pdf

PractiScore:
- https://community.practiscore.com/t/match-and-scoring-types-supported-in-the-practiscore-apps/1896
- https://community.practiscore.com/t/building-stages/16951
- https://community.practiscore.com/t/decreasing-number-of-hits-on-targets/20234
- https://community.practiscore.com/t/points-down-scoring/4335
- https://community.practiscore.com/t/pcsl-using-time-plus-neutralizing-scoring/23489 (not retrievable)
- https://www.idpaitaly.com/docs/PractiScoreManual.pdf (PractiScore USPSA Scoring System User Guide, Oct 2011)

Shoot'n Score It:
- https://shootnscoreit.com/static/documents/SSI_Ref_Manual.88222a88ba2a.pdf
