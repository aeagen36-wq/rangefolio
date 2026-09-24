# Rangefolio — Ballistics data and findings

This file is the reference behind the Ballistics tab: what the solver computes and why, what was checked against published tables, and where every load number in `data/loads.json` came from. Three parts, each with its sources inline:

1. **Physics and constants** — the accepted formulas the solver implements (atmosphere, density, drag, spin drift, Coriolis, incline, powder temperature, barrel length, suppressors, transonic, weather data caveats).
2. **Validation findings** — the solver against maker trajectory tables, and the corrections made to a hand-written hold card.
3. **Load catalogue sources** — every load in `data/loads.json` with its maker URL and caveats.

How the app uses this: the solver in `index.html` (`solve()`) is a point-mass integrator on the G1/G7 drag tables with the constant, density, spin-drift, Coriolis and incline treatments described in Part 1. Loads are read from `data/loads.json`. Anything not verified here is labelled as an estimate in the UI.

---

# Part 1 — Physics and constants


Compiled 2026-09-24. Scope: the accepted formulas, constants and magnitudes a
point-mass (3-DOF) solver needs, each with at least two independent sources and a
note on how the solver should apply it.

Source policy: Applied Ballistics / Litz, JBM Ballistics, Hornady 4DOF papers,
Sierra / Berger technical pages, NOAA / NWS / FAA / ICAO / NIST / US Standard
Atmosphere, McCoy "Modern Exterior Ballistics" (textbook), Hodgdon manufacturer data,
and controlled cut-down barrel studies (Rifleshooter.com, Ballistics By The Inch)
labelled empirical. No forums or opinion blogs. Where a page could not be fetched in
this session it is marked "[not re-verified this session]".

Units convention below: ft, ft/s, lb, in, grains (gr), degrees F / Rankine unless
stated; SI given where the source is SI.

---

## 1. Standard atmosphere behind G1/G7 ballistic coefficients; how the Cd tables are defined

### 1.1 The two reference atmospheres

| Quantity | Army Standard Metro (ASM) | ICAO / ISA (US Std Atmosphere 1976 sea level) |
|---|---|---|
| Temperature | 59 F (15 C, 518.67 R, 288.15 K) | 59 F (15 C, 518.67 R, 288.15 K) |
| Pressure | 750 mm Hg = 29.5275 in Hg = 1000.0 hPa | 760 mm Hg = 29.9213 in Hg = 1013.25 hPa |
| Relative humidity | 78 % | 0 % (dry air) |
| Air density | 0.0751265 lb/ft3 = 1.2034 kg/m3 | 0.0764742 lb/ft3 = 1.2250 kg/m3 |
| Speed of sound | 1120.27 ft/s (humid air) | 1116.45 ft/s = 340.294 m/s |
| Density ratio ICAO/ASM | 1.0179 | — |

Conversion between BC standards (same bullet, same drag table):

    BC_ICAO = 1.018 x BC_ASM        (equivalently BC_ASM = 0.982 x BC_ICAO)

Who publishes on which standard (per Applied Ballistics' app guide): Sierra, Hornady,
Barnes (and historically Winchester) publish ASM-referenced BCs; Berger, Nosler,
Lapua and all Litz-measured BCs / custom drag curves are ICAO-referenced. Solvers that
"are designed around one of these two standards" without converting carry "about a
3 % error off the top" (Applied Ballistics, Ballistic Calibration).

### 1.2 What G1 and G7 are

A "G" drag function is the measured Cd-vs-Mach curve of a specific standard
projectile of BC = 1.0 (1 lb, 1 inch diameter, i.e. sectional density 1 lb/in2 and
form factor 1). G1 is the old Ingalls/Krupp flat-base, 2-caliber ogive projectile;
G7 is a 10-caliber tangent-ogive, 7.5 deg boat-tail, long-range rifle shape. JBM:
"the value of the G7 drag function is typically half that of the G1 drag function",
so G7 BCs are numerically about half of G1 BCs for the same bullet, and "G7 is a
better fit for boattail bullets".

Real bullet: Cd_bullet(M) = i x Cd_G(M), BC = SD / i = (weight_lb / d_in^2) / i,
where i is the form factor relative to the chosen standard.

### 1.3 Where authoritative Cd tables come from

- Ballistics Research Laboratory (BRL, Aberdeen) tables, as published in McCoy,
  *Modern Exterior Ballistics*, for G1, G2, G5, G6, G7, G8, GI, GL, RA4. JBM
  redistributes these as two-column text files (col 1 = Mach, col 2 = Cd):
  https://jbmballistics.com/downloads.html (McCoy drag functions section; G1, G5,
  G6, GL also available as the older Winchester-Western 1965 tabulations).
- Hornady 4DOF and Applied Ballistics Custom Drag Models (CDM) are per-bullet
  Doppler-radar Cd(M) curves that replace the G-standard + BC scaling entirely.

Point-mass application: store the G1 and G7 Mach/Cd tables from the JBM/McCoy files,
interpolate Cd at the instantaneous Mach number, and use the bullet's BC as the scale
factor (Section 3). Store the BC's reference standard (ICAO or ASM) with every bullet
record and use the matching reference density rho_std in the drag equation, or
convert ASM BCs by x1.018 and always use ICAO density. Never mix.

Sources:
- https://jbmballistics.com/ballistics/topics/dragfunctions.shtml
- https://jbmballistics.com/downloads.html
- https://www.dexadine.com/bexhelp/bexhelp140.htm (ASM 29.5275 in Hg, 0.0751265 lb/ft3, x1.018 factor)
- https://riflebarrels.com/ballistic-effects-of-altitude-temperature-and-humidity/ (ASM 29.53 in Hg / 59 F / 78 %; ICAO 29.92 in Hg / 59 F / 0 %)
- https://appliedballisticsllc.com/wp-content/uploads/2021/06/Ballistic-Calibration.pdf (ASM vs ICAO, ~3 % error)
- https://appliedballisticsllc.com/wp-content/uploads/2019/11/ABMobileUserGuide.pdf (which makers use which standard)
- https://appliedballisticsllc.com/wp-content/uploads/2019/11/ABDOC130_CDM.pdf (BC as a scale factor on a standard curve; rho_std = 0.002377 slug/ft3)
- McCoy, R. L., *Modern Exterior Ballistics*, 2nd ed., Schiffer, Ch. 8 (point-mass trajectory; standard atmospheres; ICAO sea-level density 0.0764742 lb/ft3; ASM 0.0751265 lb/ft3) [textbook, no URL]
- ICAO Doc 7488, *Manual of the ICAO Standard Atmosphere*; US Standard Atmosphere 1976: https://ntrs.nasa.gov/citations/19770009539

---

## 2. Air density from T, P, RH; pressure altitude and density altitude

### 2.1 Vapour pressure and virtual temperature (NWS El Paso formulas)

    e_s(T)  = 6.11 x 10^( 7.5 T_C / (237.3 + T_C) )        [hPa, T_C in deg C]  (saturation)
    e       = RH x e_s(T)                                    [hPa]   (or use dew point Td in place of T for e directly)
    T_v     = T_K / ( 1 - 0.379 x e / P_sta )                [K; P_sta = station pressure, hPa]
              (0.379 = 1 - 0.622, the water/dry-air molar-mass ratio)
    rho     = P_sta / (R_d x T_v)                            [kg/m3, P_sta in Pa, R_d = 287.05 J/(kg K)]

Imperial equivalent used by ballistics programs:

    rho / rho_std = (P_sta / P_std) x (T_std_R / T_R) x ( 1 - 0.378 e / P_sta )
    with T_R = T_F + 459.67, T_std_R = 518.67, and P_std, rho_std from the BC's
    reference atmosphere (Section 1).

### 2.2 Pressure altitude (NWS / ISA)

    h_p [ft] = 145366.45 x ( 1 - (P_sta_hPa / 1013.25)^0.190284 )
    FAA rule of thumb: h_p = field elevation + (29.92 - altimeter setting in Hg) x 1000

Inverse (ISA pressure at geometric altitude h, ft, troposphere):

    P = 1013.25 x (1 - 6.87535e-6 x h)^5.2559   [hPa]

### 2.3 Density altitude

    NWS exact:  DA [ft] = 145366 x [ 1 - ( 17.326 x P_inHg / T_v_R )^0.235 ]
                (P in inches Hg, T_v in Rankine = T_v_K x 1.8)
    FAA rule of thumb:  DA = h_p + 120 x (OAT_C - ISA_temp_C),  ISA_temp_C = 15 - 1.98 x h_p/1000

ISA constants: T0 = 288.15 K, P0 = 101325 Pa, rho0 = 1.2250 kg/m3, lapse 6.5 K/km
(1.98 C / 1000 ft), g0 = 9.80665 m/s2.

### 2.4 Magnitude of the humidity effect

Humid air is *less* dense than dry air at the same T and P. From the 0.378 e/P term:

| Air temp | e_s (hPa) | Density reduction at 100 % RH vs 0 % |
|---|---|---|
| 59 F / 15 C | 17.1 | 0.64 % |
| 77 F / 25 C | 31.7 | 1.2 % |
| 95 F / 35 C | 56.2 | 2.1 % |

Lilja (quoting Sierra/Davis): "at most about one percent" and "can be ignored" for
practical purposes; Applied Ballistics: humidity "is not a highly important variable,
if unknown enter 50 %". A 1 % density change is a ~1 % change in drag, i.e. a few
inches of drop at 1000 yd. Include it (it is free), but never let a missing RH block
a solution; default 50 %.

Point-mass application: compute rho once per shot from station pressure, temperature
and RH via 2.1 (do not use density altitude as the primary path; DA discards the
temperature needed for the speed of sound). If the only pressure available is a
sea-level/altimeter value, convert to station pressure with the altitude (see
Section 12). Optionally decrement rho along the trajectory with altitude gained for
steep shots (Hornady 4DOF does; negligible for flat fire).

Sources:
- https://www.weather.gov/media/epz/wxcalc/virtualTemperature.pdf
- https://www.weather.gov/media/epz/wxcalc/densityAltitude.pdf
- https://www.weather.gov/media/epz/wxcalc/pressureAltitude.pdf
- https://www.weather.gov/media/epz/wxcalc/altimeterSetting.pdf
- https://www.faasafety.gov/files/events/NM/NM07/2023/NM07120280/FAA-P-8740-02-DensityAltitude.pdf (FAA P-8740-2: standard 59 F / 29.92 in Hg; DA = PA corrected for non-standard temperature)
- https://www.faa.gov/sites/faa.gov/files/pilots/pilot_handbook.pdf (Pilot's Handbook of Aeronautical Knowledge, Ch. 4/11, pressure and density altitude)
- https://riflebarrels.com/ballistic-effects-of-altitude-temperature-and-humidity/ (humidity <= ~1 %)
- https://appliedballisticsllc.com/wp-content/uploads/2019/11/ABMobileUserGuide.pdf (humidity guidance)
- US Standard Atmosphere 1976: https://ntrs.nasa.gov/citations/19770009539

---

## 3. Drag deceleration in a point-mass model; the BC constant; speed of sound

### 3.1 Derivation

Drag force F = 1/2 rho v^2 Cd S with S = pi d^2 / 4 (AB: q = 1/2 rho V^2,
S = pi (cal/24)^2 ft2, drag = q S Cd). Dividing by mass m and substituting
Cd = i Cd_G(M) and BC = m / (i d^2):

    a_drag = (pi / 8) x rho x Cd_G(M) x v^2 / BC        (consistent units)

With BC in lb/in2, v in ft/s, rho in lb/ft3 (mass density), a in ft/s2:

    a_drag [ft/s2] = k x (rho / rho_std) x Cd_G(M) x v^2 / BC
    k = (pi / 8) x rho_std / 144  [lb/ft3 -> lb/in2 conversion]

    ICAO reference (rho_std = 0.0764742 lb/ft3):  k = 2.0855e-4  (1/in ... i.e. ft/s2 per (ft/s)^2 per (lb/in2)^-1)
    ASM  reference (rho_std = 0.0751265 lb/ft3):  k = 2.0488e-4

Check: 2.0855e-4 / 2.0488e-4 = 1.0179 = the ICAO/ASM BC conversion factor. In SI,
with BC converted to kg/m2 (1 lb/in2 = 703.07 kg/m2): a = (pi/8) rho Cd v^2 / BC_SI.

Vector form for the integrator (v_rel = bullet velocity minus wind velocity):

    dV/dt = - k (rho/rho_std) Cd_G(M) |v_rel| v_rel / BC  +  g  +  (Coriolis, Section 5)
    M = |v_rel| / a_sound

Equivalent "retardation" form used by Siacci/JBM-style codes: a = (rho/rho_std) x
G(v)/BC, where G(v) = k Cd_G(M) v^2 is a pre-tabulated function of velocity at the
reference speed of sound; do not use that form if you vary the speed of sound with
temperature — use Cd(M) directly.

### 3.2 Speed of sound

    a = sqrt( gamma R T ) ,  gamma = 1.40, R = 287.05 J/(kg K)
    a [m/s]  = 20.047 x sqrt( T_K )
    a [ft/s] = 49.022 x sqrt( T_R ) ,  T_R = T_F + 459.67
    a(59 F) = 1116.45 ft/s = 340.294 m/s   (US Std Atm 1976 sea level)

Humidity raises a by < 0.4 % at 95 F/100 % RH; pressure has no first-order effect.
Mach 1.2 = 1340 ft/s at 59 F (the figure Litz quotes for the top of the transonic
band); at 0 F Mach 1.2 = 1264 ft/s, at 100 F 1392 ft/s — so temperature moves the
transonic warning range by ~50 yd either way.

Point-mass application: 4th-order Runge-Kutta (or at least RK2) on position and
velocity with dt ~ 0.5–1 ms, or a range-stepped integrator; recompute Mach and Cd
each step; use the reference density that matches the BC's standard.

Sources:
- https://appliedballisticsllc.com/wp-content/uploads/2019/11/ABDOC130_CDM.pdf (q, S, Cd definitions; rho_std 0.002377 slug/ft3)
- McCoy, *Modern Exterior Ballistics*, Ch. 2 (aerodynamic force), Ch. 5–8 (point-mass equations; BC definition BC = m/(i d^2)) [textbook]
- https://jbmballistics.com/ballistics/topics/bcs.shtml (BC as scale factor on a standard drag curve)
- https://jbmballistics.com/ballistics/calculators/help/traj_simp/traj_simp_exp.shtml (JBM uses ICAO standard atmosphere; outputs calculated speed of sound)
- US Standard Atmosphere 1976 (speed of sound 340.294 m/s, gamma 1.40): https://ntrs.nasa.gov/citations/19770009539
- https://www.dexadine.com/bexhelp/bexhelp140.htm (ASM density value used for k_ASM)

---

## 4. Spin drift: Miller stability and the Litz approximation

### 4.1 Miller gyroscopic stability factor (Miller, Precision Shooting, March 2005; corrections June 2009)

    SG = 30 m / ( t^2 d^3 l (1 + l^2) )  x  (V / 2800)^(1/3)  x  ( (T_F + 460) / (59 + 460) ) x ( 29.92 / P_inHg )

    m = bullet weight, grains
    d = bullet diameter, inches
    t = twist in calibers per turn = twist_inches / d
    l = bullet length in calibers = length_inches / d
    V = muzzle velocity, ft/s   (reference 2800 ft/s)
    T_F, P_inHg = air temperature (F) and station pressure (in Hg); reference 59 F, 29.92 in Hg (ICAO)

The last two factors are just (rho_std / rho): stability rises as air density falls.
Miller's rule is calibrated for conventional lead-core, jacketed boat-tail bullets;
Courtney & Miller give a plastic-tip correction (use the metal length l_m in the
(1 + l^2) term). Berger: not accurate for flat-base bullets. Guidance: SG >= 1.5 at
the muzzle for full BC; 1.0 is the theoretical minimum; Hornady uses 1.4 as its
lower limit. Berger: below SG 1.5 both the average BC and its consistency degrade.

### 4.2 Litz spin-drift approximation

    SD [inches] = 1.25 x (SG + 1.2) x t_flight^1.83     (t_flight in seconds; SG from 4.1 at the muzzle)

Direction: to the right for right-hand twist, left for left-hand twist ("bullets fired
from right twist barrels drift to the right, and vice versa by the same amount" —
Litz). It is a horizontal-plane effect only, independent of Earth rotation, larger in
denser air only through its effect on time of flight and SG.

Typical magnitudes at 1000 yd (computed with the two formulas above; consistent
with Litz's "typically 8–9 inches", "no more than 10 to 12 inches", and AB's "usually
less than 10 inches at 1000 yards"):

| Load | SG (Miller, std atm) | TOF to 1000 yd | Spin drift |
|---|---|---|---|
| .308 Win, 175 gr SMK, L 1.240 in, 1:11.25, 2600 fps | 1.90 | ~1.75 s | ~10.8 in (~1.0 MOA, 0.30 mil) |
| .308 Win, 175 gr SMK, 1:12, 2600 fps | 1.67 | ~1.75 s | ~10.0 in |
| 6.5 CM, 140 gr ELD-M, L 1.42 in, 1:8, 2700 fps | 1.53 | ~1.45 s | ~6.7 in (~0.64 MOA, 0.19 mil) |

Point-mass application: compute SG once at the muzzle (4.1, with actual T and P),
then add SD(t) from 4.2 as a post-processed lateral offset at each output range using
that range's time of flight. Requires twist and bullet length as inputs; if either is
missing, disable the term and say so (AB does exactly this). Do not attempt yaw-of-
repose integration in a 3-DOF solver.

Sources:
- Miller, D., "A New Rule for Estimating Rifling Twist", Precision Shooting, March 2005, pp. 43–48 (JBM bibliography copy: https://jbmballistics.com/ballistics/bibliography/articles/miller_stability_1.pdf — 404 at time of writing) and "How Good Are Simple Rules for Estimating Rifling Twist", Precision Shooting, June 2009.
- Courtney & Miller, "A Stability Formula for Plastic-Tipped Bullets", https://arxiv.org/pdf/1410.5340 (quotes the full Miller formula with velocity and T/P corrections)
- https://bergerbullets.com/twist-rate-calculator/ (Berger implements Miller; flat-base caveat)
- https://bergerbullets.com/nobsbc/how-stability-affects-bc-consistency/ (SG 1.5 threshold; BC and consistency loss below)
- Litz, B., *Applied Ballistics for Long Range Shooting*, 3rd ed., Ch. 10 "Gyroscopic (spin) drift" (SD = 1.25 (SG + 1.2) t^1.83) [book]
- https://appliedballisticsllc.com/wp-content/uploads/2021/06/Gyroscopic-Drift-and-Coriolis-Effect.pdf (direction; 8–9 in typical, <= 10–12 in at 1000 yd)
- https://appliedballisticsllc.com/wp-content/uploads/2019/11/ABMobileUserGuide.pdf (< 10 in at 1000 yd; needs twist + length; horizontal plane only)
- https://static.hornady.media/site/hornady/files/ballistic/hornady-4dof-technical-paper-v2.pdf (yaw-of-repose mechanism; SG 1.4 lower limit; SG grows downrange)
- https://www.sierrabullets.com/exterior-ballistics/4-0-six-degree-of-freedom-effects-on-bullet-flight/ (right for RH spin; observable beyond ~300 yd)

---

## 5. Coriolis (horizontal) and Eotvos (vertical) effects

### 5.1 Full point-mass acceleration (McCoy eq. 8.27; add to dV/dt in Section 3)

Axes: x downrange, y up, z to the right of the line of fire. L = latitude (+N, -S),
AZ = azimuth of fire measured clockwise from true north, Omega = 7.292115e-5 rad/s.

    a_x = 2 Omega ( -V_y cos L sin AZ - V_z sin L )
    a_y = 2 Omega (  V_x cos L sin AZ + V_z cos L cos AZ )
    a_z = 2 Omega (  V_x sin L - V_y cos L cos AZ )

### 5.2 Flat-fire closed forms (Litz / McCoy)

    Horizontal deflection:  Z_cor [ft] = Omega x X x t x sin L        (X = range, ft; t = time of flight, s)
        Positive = to the right in the northern hemisphere for ANY azimuth; to the left in the
        southern hemisphere. Zero at the equator, maximum at the poles. Independent of direction of fire.

    Vertical (Eotvos):      Y_cor / Y_drop = 2 Omega V cos L sin AZ / g    (V ~ average velocity; g = 32.174 ft/s2)
        Firing east (AZ = 90) hits HIGH, firing west (AZ = 270) hits LOW, north/south zero.
        Maximum at the equator, zero at the poles. Same sign in both hemispheres.

### 5.3 Typical magnitudes at 1000 yd, 45 deg latitude

    .308 175 gr, X = 3000 ft, t = 1.75 s:  Z = 7.292e-5 x 3000 x 1.75 x 0.707 = 0.27 ft = 3.2 in right (~0.3 MOA)
    Vertical, V = 2600 fps, firing due east: 2 x 7.292e-5 x 2600 x 0.707 / 32.174 = 0.83 % of drop ~ 3.3 in high
       (drop ~400 in); due west 3.3 in low.

Litz: "typical horizontal Coriolis drift ... near 45 degrees North Latitude is about
2.5–3.0 inches to the right at 1000 yards"; vertical "+2.5 to 3.0 inches (shooting
east), or -2.5 to 3.0 inches when shooting west". Lapua: combined effect "around
+/- 10 cm / 3.9 in at 1,000 m/yds". Hornady: "earth based effects can essentially be
ignored out to ranges of 1,000 yards" but are computed in 4DOF.

Point-mass application: either integrate 5.1 directly (cheapest and exact within the
model) or apply 5.2 as post-processed offsets. Require latitude (from phone GPS, sign
by hemisphere) and azimuth (compass) inputs; if azimuth is unknown, still apply the
horizontal term (it does not depend on AZ) and skip the vertical term. Show both
components separately in the output.

Sources:
- McCoy, *Modern Exterior Ballistics*, Ch. 8, eq. 8.27 and Sec. 8.10 "Coriolis effect" [textbook]
- Litz, *Applied Ballistics for Long Range Shooting*, 3rd ed., Ch. 11 "Coriolis effect" [book]
- https://appliedballisticsllc.com/wp-content/uploads/2021/06/Gyroscopic-Drift-and-Coriolis-Effect.pdf (sign conventions and 1000-yd magnitudes)
- https://appliedballisticsllc.com/wp-content/uploads/2019/11/ABMobileUserGuide.pdf (horizontal depends on latitude only; east high / west low)
- https://www.lapua.com/ballistics-app-tips-the-coriolis-effect/ (hemisphere/azimuth sign rules; ~10 cm at 1000 m)
- https://static.hornady.media/site/hornady/files/ballistic/hornady-4dof-technical-paper-v2.pdf (earth effects small to 1000 yd; requires latitude and azimuth)
- Omega = 7.292115e-5 rad/s: NIST/IERS numerical standards (IERS Conventions 2010, Table 1.1)

---

## 6. Inclined fire: correct treatment vs the rifleman's rule

### 6.1 Correct treatment (point-mass)

Integrate in an earth-fixed frame with gravity straight down; the line of sight is
tilted by theta (positive uphill). Equivalent LOS-aligned form: gravity component
along the LOS is g sin(theta) (decelerates the bullet uphill, accelerates it downhill)
and perpendicular to the LOS is g cos(theta). Drag acts along the velocity vector
regardless. Report bullet path as the perpendicular distance from the LOS at the
slant range. This is what JBM ("angle between the line of sight and level ground ...
positive when shooting uphill, negative downhill"), Hornady 4DOF and AB do.

### 6.2 Rifleman's rule (cosine of RANGE) and its error

    R_equiv = R_slant x cos(theta)      -> look up flat-ground hold at R_equiv

Exact only for a vacuum trajectory (derivable from Newtonian kinematics; in the exact
vacuum form the zero-range term is R_S cos^2 theta). With drag it underestimates the
required hold-over at long range and steep angles, because the bullet still flies the
full slant distance through the air and loses velocity accordingly.

Improved rule (Sierra / McDonald; also called the "improved rifleman's rule"):

    hold-over(R_slant, theta) ~ drop_flat(R_slant) x cos(theta)     (cosine applied to DROP at the slant range)

The improved rule is much closer to the point-mass result but still ignores the
g sin(theta) term and the density change with altitude gained; Hornady states that
cosine-type methods are "relatively accurate" only below about 10 deg and traditional
calculators below ~15 deg at moderate range.

Hornady 4DOF Table 9 (actual 4DOF drop vs cosine-corrected drop):
- 500 yd, 30 deg uphill: 4DOF -27.9 in vs cosine -39.8 in (error ~11.9 in)
- 1000 yd, 20 deg downhill: 4DOF -235.9 in vs cosine -271.3 in (error ~35.4 in)

Point-mass application: never implement the cosine-of-range rule as the solver. Take
the inclination angle (phone inclinometer), integrate with true gravity, output the
LOS-relative path at slant range. Note that uphill and downhill are not symmetric
(the g sin theta term changes sign), though the asymmetry is small for |theta| < 20 deg.

Sources:
- McCoy, *Modern Exterior Ballistics*, Ch. 6 "The effect of inclined fire" (rifleman's rule derivation and limits) [textbook]
- https://static.hornady.media/site/hornady/files/ballistic/hornady-4dof-technical-paper-v2.pdf (Table 9 numbers; 10–15 deg limits; gravity/velocity-vector alignment)
- https://jbmballistics.com/ballistics/calculators/help/traj_simp/traj_simp_exp.shtml (angle input definition)
- Sierra Bullets, Exterior Ballistics Sec. 3.3 "Effects of Shooting Uphill or Downhill" and "Inclined Fire" article (https://www.sierrabullets.com/exterior-ballistics/3-3-effects-of-shooting-uphill-or-downhill/ , https://www.sierrabullets.com/exterior-ballistics/inclined-fire/) [not re-verified this session — Sierra removed/moved these pages in 2025]
- https://en.wikipedia.org/wiki/Rifleman%27s_rule (vacuum derivation only; cites McDonald 2003) — background, not a primary source

---

## 7. Aerodynamic jump from crosswind

Mechanism: a crosswind at the muzzle tilts the relative wind; the gyroscopically
stabilized bullet's nose precesses into a small fixed vertical angle (up or down),
producing a vertical deflection that grows linearly with range like a sight-angle
error. Hornady: "a 10 mph wind will produce double the aerodynamic jump of a 5 mph
wind"; the effect "is a fixed angle that depends on the magnitude of the wind, the
twist of the barrel, and the inertial and aerodynamic characteristics".

Direction for right-hand twist: wind from the RIGHT (blowing right-to-left, 3 o'clock)
-> impact HIGH; wind from the LEFT (9 o'clock) -> impact LOW (Hornady Table 7: 90 deg
wind, nose up +0.0025 deg at 10 mph; 270 deg wind, nose down -0.0022 deg). Reverse
for left-hand twist.

Litz's rule of thumb (Applied Ballistics for Long Range Shooting, 3rd ed., Ch. 12):

    AJ [MOA per 1 mph of crosswind] ~ 0.01 x SG - 0.0024 x l + 0.032      (l = bullet length in calibers)

For typical long-range bullets (SG 1.5–2.0, l 4.5–5.5) this gives ~0.03–0.04 MOA per
mph, i.e. ~0.3–0.4 MOA (0.1 mil, 3–4 in at 1000 yd, ~0.3 in at 100 yd) for a 10 mph
full-value crosswind. Higher SG -> more jump; longer bullet -> less. [Formula quoted
from the book; the primary web copy (Litz's post) was not fetchable this session.]

Should a phone app include it? Yes, as an OPTIONAL toggle default OFF, for three reasons:
(1) it needs SG (twist + length) and a reliable crosswind at the muzzle; (2) the jump
present when the rifle was zeroed is already absorbed in the zero, so only the
*difference* between zero-day and shot-day crosswind matters; (3) magnitude is ~1/10 of
wind drift and comparable to shooter error. AB Mobile and Hornady 4DOF both compute it;
AB describes it as "the vertical component a crosswind can induce on the bullet as it
leaves the muzzle".

Point-mass application: AJ_angle = k_AJ x W_cross_mph (MOA), sign by twist and wind
side; add AJ_angle x range as a vertical offset. Use the muzzle-zone crosswind only,
not the downrange average.

Sources:
- Litz, *Applied Ballistics for Long Range Shooting*, 3rd ed., Ch. 12 "Aerodynamic jump" [book]
- https://static.hornady.media/site/hornady/files/ballistic/hornady-4dof-technical-paper-v2.pdf (mechanism, linearity, direction, Table 7)
- https://appliedballisticsllc.com/wp-content/uploads/2019/11/ABMobileUserGuide.pdf (AJ implemented as a vertical component of crosswind)
- https://www.sierrabullets.com/exterior-ballistics/4-0-six-degree-of-freedom-effects-on-bullet-flight/ (small vertical deflection accompanying crosswind deflection)
- McCoy, *Modern Exterior Ballistics*, Ch. 12 "Lateral throwoff and aerodynamic jump" [textbook]

---

## 8. Powder temperature sensitivity (muzzle velocity vs powder temperature)

Hodgdon's published Extreme-series test (0 F / 70 F / 125 F, 125 F span), converted
to fps per F over the full span:

| Cartridge / bullet | Powder | 0 F | 70 F | 125 F | Spread | fps per F |
|---|---|---|---|---|---|---|
| .308 Win 168 SMK | Varget (Extreme, extruded) | 2778 | 2771 | 2779 | 8 | 0.06 |
| .308 Win 168 SMK | Win 748 (ball / double-base) | 2655 | 2724 | 2769 | 114 | 0.91 |
| .308 Win 168 SMK | IMR 4064 (extruded) | 2651 | 2686 | 2697 | 46 | 0.37 |
| .308 Win 168 SMK | AA 2520 (ball) | 2781 | 2805 | 2844 | 63 | 0.50 |
| .30-06 165 gr | H4350 (Extreme) | 2884 | 2881 | 2880 | 4 | 0.03 |
| .30-06 165 gr | IMR 4350 | 2874 | 2908 | 2941 | 67 | 0.54 |
| .30-06 165 gr | Reloder 19 (double-base) | 2808 | 2820 | 2902 | 94 | 0.75 |
| .300 WM 180 gr | H4831SC (Extreme) | 2986 | 2985 | 2995 | 10 | 0.08 |
| .300 WM 180 gr | IMR 4831 | 2953 | 3012 | 3080 | 127 | 1.02 |
| .22-250 55 gr | H4895 (Extreme) | 3728 | 3742 | 3748 | 20 | 0.16 |
| .22-250 55 gr | IMR 4895 | 3625 | 3699 | 3791 | 166 | 1.33 |

Independent controlled test (6.5x47 Lapua, 140 gr, 25 F / 65 F / 140 F, 10-shot
strings, Precision Rifle Blog 2016 — empirical, secondary): H4350 0.22 fps/F,
Varget 0.40, IMR 4166 0.41, IMR 4451 0.59 — larger than Hodgdon's own figures but
same ranking. Litz rule of thumb (quoted in that test from the AB seminar): double-
base/ball powders ~1 fps/F; average single-base extruded 0.3–0.5 fps/F; best
temperature-stable extruded 0.1–0.2 fps/F.

Point-mass application: MV_shot = MV_ref + k_T x (T_powder - T_ref) with k_T in fps/F
per load (AB's input is exactly this: "MV Variation fps/F" plus "Powder Temperature"
of the reference MV). Defaults if unknown: 0.2 fps/F for Hodgdon Extreme / stable
extruded, 0.5 for other extruded, 1.0 for ball/double-base and most factory ammo.
Ammunition temperature, not air temperature, is the input; assume they are equal only
if the ammo has been out of the case > 30 min.

Sources:
- https://hodgdonpowderco.com/wp-content/uploads/2023/04/hodgdon-extreme-series-powders-test-results-for-temperature-sensitivity-1.pdf (manufacturer data, 2012)
- https://precisionrifleblog.com/2016/06/19/powder-temp-stability-hodgdon-extreme-vs-imr-enduron/ (independent controlled test; empirical, secondary; quotes Litz rule of thumb)
- https://appliedballisticsllc.com/wp-content/uploads/2019/11/ABMobileUserGuide.pdf (fps/F input model)

---

## 9. Barrel length vs muzzle velocity (empirical cut-down data)

All figures are EMPIRICAL, from one barrel cut in 1-inch steps with the same
ammunition lots; velocity/inch is not constant — it rises steeply as barrels get
short and flattens (or peaks) at long lengths. Use as ranges, not constants.

| Cartridge | Study | Range covered | fps per inch (avg) | Notes |
|---|---|---|---|---|
| .308 Win / 7.62x51 | Rifleshooter.com 2014 (Shilen match barrel, 5 shots/length, MagnetoSpeed) | 28 -> 16.5 in | 20.9 (Fed 168 GMM), 22.5 (Win 180), 22.8 (IMI 150), 24.6 (Win 147) | 168 GMM: 2706 @ 28 in -> 2466 @ 16.5 in |
| .308 Win short | Rifleshooter.com 2016 (16.5 -> 6 in) | 16.5 -> 6 in | rises to ~40–60 fps/in below 12 in | see source |
| 6.5 Creedmoor | Rifleshooter.com 2016 (Green Mountain 1:8, 5 shots/length) | 27 -> 16 in | 21.8 (Hornady 120 A-MAX), 14.4 (142 SMK/H4350, 27->16; 16.2 from the 24 in peak) | 120 A-MAX 2961 @ 27 -> 2728 @ 16; 142 SMK peaked at 24 in (2683) |
| 5.56 / .223 | Rifleshooter.com 2015 (26 -> 6 in, 4 loads, 5 shots/length) | 26 -> 16.5 in | ~24–27 | M193 ~3170 @ 26 -> ~2850 @ 16.5 -> ~2150 @ 6 in; loss/inch accelerates below ~14 in (~50–70 fps/in near 6–10 in) |
| .300 BLK supersonic | Lucky Gunner 2024/25 (three separate barrels 7.5 / 10.5 / 16.5 in, Garmin Xero, 5-shot avg; NOT a cut-down) | 7.5 -> 16.5 in | ~17.5 (238 fps / 9 in, 110–147 gr) | different barrels -> more scatter than a cut-down |
| .300 BLK subsonic | same | 7.5 -> 16.5 in | ~10 (Win 200 gr: 989 / 1048 / 1082 fps) | flat: powder is fully burnt by ~9 in; keep subs < ~1050 fps to stay subsonic in all temps |
| 9mm Luger | Ballistics By The Inch (single barrel cut 18 -> 2 in, 3 shots x 2 chronographs per length) [data page not fetchable this session; figures below are from the published BBTI charts and should be re-verified] | 18 -> 2 in | ~70–90 fps/in from 2 -> 4 in; ~30–50 fps/in 4 -> 6 in; ~10–20 fps/in 6 -> 10 in; ~0–10 fps/in 10 -> 16 in; flat or slightly negative 16 -> 18 in | typical 115 gr FMJ ~1000 fps @ 2 in, ~1150 @ 4 in, ~1250 @ 6 in, ~1350–1400 @ 16 in |
| 9mm (cross-check) | AmmoLand 2022 (Glock 43 3.39 in / 19 4.0 in / 34 5.3 in, Oehler 35P, 50 F) | 3.4 -> 5.3 in | ~5–10 % total across the span (~30–50 fps/in) | different pistols, not a cut-down |

Point-mass application: barrel-length scaling is only a fallback when the user has
no chronograph number. Implement MV_est = MV_published + k_L x (L_user - L_published)
with k_L from the table above (default 20 fps/in for .308/6.5 CM/5.56 above 16 in,
25–30 fps/in for 5.56 between 10 and 16 in, 15 fps/in for .300 BLK supersonic, 10
fps/in for subsonic, and a two-segment 9mm curve), then push the user hard to enter a
measured MV — a 25 fps MV error is ~0.1 mil at 1000 yd, larger than most of the
"secondary effects" in Sections 4–7.

Sources:
- https://rifleshooter.com/2014/12/308-winchester-7-62x51mm-nato-barrel-length-versus-velocity-28-to-16-5/
- https://rifleshooter.com/2016/02/308-winchester-7-62x51mm-nato-short-barrel-length-and-velocity-a-six-inch-308-bolt-gun/
- https://rifleshooter.com/2016/02/6-5-creedmoor-effect-of-barrel-length-on-velocity-cutting-up-a-creedmoor/
- https://rifleshooter.com/2015/12/223-remington-5-56mm-nato-barrel-length-and-velocity-26-inches-to-6-inches/
- https://rifleshooter.com/2015/11/223-remington5-56mm-nato-barrel-length-versus-velocity-short-barrels-6-to-14-inches/
- https://www.luckygunner.com/lounge/300-blackout-ballistics/ (retailer lab test; three barrels)
- http://www.ballisticsbytheinch.com/9luger.html (BBTI 9mm results; method per https://en.wikipedia.org/wiki/Ballistics_by_the_Inch) [not re-verified this session]
- https://www.ammoland.com/2022/12/9mm-velocity-testing/ (cross-check only)

---

## 10. Suppressor effect on velocity and point of impact

Velocity: controlled same-rifle/same-lot comparisons show no consistent, meaningful
change. Rifleshooter.com (2025; Ruger Precision Rifle 6.5 CM with Q suppressor, five
142 gr SMK loads; and a .22 WMR): 3 of 5 loads were slightly faster unsuppressed, 2 of
5 slightly faster suppressed; conclusion "suppressors have a negligible effect on
muzzle velocity". Any real effect is a small positive (a few fps to ~1 %) from
extended gas push in the blast chamber, typically inside shot-to-shot SD. Treat as
zero in the solver; let the user enter a suppressed MV if they chronographed one.

Point of impact: mounting a can changes barrel harmonics and adds mass at the muzzle,
producing a repeatable POI shift that is rifle-, can- and mount-specific, usually
fractions of an MOA to ~1–2 MOA, in any direction. This is a ZERO issue, not a
trajectory issue: the correct treatment is a separate zero/profile (or zero offset)
per suppressed/unsuppressed configuration, not a physics correction. AB and Hornady
handle it the same way (per-profile zero); neither models a suppressor term. [No
second controlled-measurement source with published numbers was found within the
trusted-source list; magnitude statement above is qualitative.]

Point-mass application: no velocity term; provide a "suppressor on/off" profile switch
that stores an independent zero offset (elevation + windage) and, optionally, an
independent measured MV.

Sources:
- https://rifleshooter.com/2025/01/how-do-rifle-suppressors-affect-muzzle-velocity/ (controlled, empirical)
- https://appliedballisticsllc.com/wp-content/uploads/2019/11/ABMobileUserGuide.pdf (per-profile zero/MV model; no suppressor term)

---

## 11. Transonic instability and where BC prediction degrades

- Onset: Mach ~1.2 (1340 ft/s at 59 F) down through Mach ~0.9. Litz: "the transonic
  zone begins around Mach 1.2, approximately 1340 fps"; AB CDM doc: "transonic range
  ... below Mach 1.2 ... the range that's most difficult to predict drop due to the
  mismatch in drag curves between the standard G1/G7 and the projectile's actual"
  drag. Sierra (G1-based): BCs become unreliable below ~1600 ft/s (Mach ~1.4) because
  the G1 curve no longer characterizes the bullet.
- Why: the centre of pressure moves forward and the overturning moment grows;
  dynamic stability (not SG) can fall, the bullet pitches/yaws, drag rises
  unpredictably and shot-to-shot drag "fans out" (Berger: consistent from the muzzle
  to ~Mach 1.3, then scatter). Long, high-BC bullets with steep boat-tails are worst;
  short bullets with shallow boat-tails track best; faster twist helps.
- Prediction quality: with a good G7 BC, drop error grows from a few inches at Mach
  1.2 to potentially feet by Mach 0.9; custom drag curves (AB CDM, Hornady 4DOF) are
  designed to fix this. AB recommends drag-scale-factor truing at Mach 1.2 and Mach 0.9.

How apps flag it: AB marks the range where V drops below 1340 ft/s and highlights the
subsonic (Mach 1.0) range cell in red; JBM prints the speed of sound and Mach in the
table; Hornady 4DOF flags transonic.

Point-mass application: compute Mach every step. Colour rows amber where M < 1.2 and
red where M < 1.0; print the first transonic range and first subsonic range as summary
fields; append a warning that predictions beyond the amber range should be trued
against observed impacts. Do not silently extrapolate G1 below Mach 1.2 without the
flag.

Sources:
- https://appliedballisticsllc.com/wp-content/uploads/2021/06/Transonic-Effects-on-Bullet-Stability-BC.pdf
- https://appliedballisticsllc.com/wp-content/uploads/2019/11/ABDOC130_CDM.pdf
- https://appliedballisticsllc.com/wp-content/uploads/2021/06/Ballistic-Calibration.pdf (true at Mach 1.2 and 0.9)
- https://bergerbullets.com/nobsbc/how-stability-affects-bc-consistency/ (drag scatter below ~Mach 1.3)
- https://www.sierrabullets.com/exterior-ballistics/2-4-lessons-learned-from-ballistic-coefficient-testing/ (G1 BC unreliable below ~1600 ft/s)
- https://appliedballisticsllc.com/wp-content/uploads/2019/11/ABMobileUserGuide.pdf (red cell at subsonic; ~1340 fps transonic)
- https://static.hornady.media/site/hornady/files/ballistic/hornady-4dof-technical-paper-v2.pdf (Cd(M) approach; SG and transonic drag)

---

## 12. Weather-data caveats: wind height and which pressure the solver needs

### 12.1 Wind

- Reported/forecast surface wind is measured or modelled at the WMO standard height
  of 10 m above open, level terrain (WMO Guide No. 8, Ch. 5). A rifle bullet flies
  ~1–3 m above the ground for most of a 1000 yd trajectory, inside the surface layer
  where friction slows the wind. Wind at ~2 m is typically 60–80 % of the 10 m value
  over open ground (log/power-law profile, u(z) = u_10 (z/10)^alpha, alpha ~ 0.14
  open terrain, larger over rough terrain); NDBC and NWS explicitly adjust winds
  between heights with boundary-layer methods.
- Forecast wind is a grid-cell average; the shooter's wind is a point sample that
  varies along the path. A downrange full-value 10 mph wind is ~2–3 mil of drift at
  1000 yd for a .308, i.e. the largest single uncertainty in the solution.

Point-mass application: prefer a handheld anemometer reading at the firing point
(Kestrel, phone-plug-in) over API wind; if API wind is used, label it "10 m wind" and
offer a terrain-based reduction (default 0.75x for open ground, 0.6x sheltered).
Always expose wind speed and direction as user-editable and support at least two wind
zones (near/far). Apply wind as v_rel = v_bullet - v_wind in the drag term (Section 3),
which automatically yields the correct crosswind drift and the small head/tail-wind
drop change.

### 12.2 Pressure

Three quantities are commonly reported (NWS Boulder definitions):
- Station pressure: "the pressure that is observed at a specific elevation and is
  the true barometric pressure of a location". THIS is what the solver needs, because
  air density (Section 2) depends on the actual pressure at the muzzle.
- Altimeter setting: station pressure reduced to sea level via the ISA temperature
  profile; "not the true barometric pressure at a station". Used in aviation and by
  most weather APIs / phone weather apps (typically as "pressure" or "barometric
  pressure").
- Mean sea level pressure (MSLP/SLP): station pressure reduced to sea level using the
  actual mean temperature; used on weather maps.

At 5000 ft, station pressure is ~24.9 in Hg while the altimeter setting reads ~29.9
in Hg — a 17 % density error if confused, i.e. tens of inches at 1000 yd. JBM and AB
both provide a "pressure is absolute/corrected" switch for this reason; AB calls
station pressure "the preferred method ... one less input and relies on only one
measurement instead of two".

Conversion when only altimeter setting A (in Hg) and elevation h (ft) are known:

    P_sta = A x (1 - 6.87535e-6 x h)^5.2559
    (inverse of the NWS altimeter-setting formula, which uses 1013.25 hPa, 288 K, 0.0065 K/m, exponent 0.190284)

Point-mass application: read the phone barometer if present (it reports absolute /
station pressure) and label the field "station pressure"; if pulling from a weather
API, treat the value as sea-level-corrected, require altitude (GPS), and convert with
the formula above. Never feed a sea-level pressure into the density equation.

Sources:
- https://www.weather.gov/bou/pressure_definitions (station / altimeter / MSLP definitions)
- https://www.weather.gov/media/epz/wxcalc/altimeterSetting.pdf (station -> altimeter setting formula and constants)
- https://www.weather.gov/media/epz/wxcalc/pressureAltitude.pdf
- https://appliedballisticsllc.com/wp-content/uploads/2019/11/ABMobileUserGuide.pdf (station vs corrected pressure; "Pressure is Absolute")
- https://jbmballistics.com/ballistics/calculators/help/traj_simp/traj_simp_exp.shtml ("Pressure is corrected" switch)
- WMO Guide to Instruments and Methods of Observation (WMO-No. 8), Vol. I Ch. 5 "Measurement of surface wind" (10 m standard exposure): https://wgms.ch/downloads/WMO_8_II-2023_en.pdf and https://www.weather.gov/media/epz/mesonet/CWOP-WMO8.pdf
- https://www.ndbc.noaa.gov/faq/measdes.shtml (winds adjusted to 10 m / 20 m reference heights; SLP reduction per NWS TPB 291)

---

## Consolidated source list

Applied Ballistics / Bryan Litz
- Gyroscopic (spin) Drift and Coriolis Effect — https://appliedballisticsllc.com/wp-content/uploads/2021/06/Gyroscopic-Drift-and-Coriolis-Effect.pdf
- Transonic Effects on Bullet Stability & BC — https://appliedballisticsllc.com/wp-content/uploads/2021/06/Transonic-Effects-on-Bullet-Stability-BC.pdf
- Aerodynamic Drag Modeling for Ballistics (CDM) — https://appliedballisticsllc.com/wp-content/uploads/2019/11/ABDOC130_CDM.pdf
- Ballistic Calibration — https://appliedballisticsllc.com/wp-content/uploads/2021/06/Ballistic-Calibration.pdf
- AB Mobile User Guide 2.2 — https://appliedballisticsllc.com/wp-content/uploads/2019/11/ABMobileUserGuide.pdf
- Litz, B., *Applied Ballistics for Long Range Shooting*, 3rd ed. (Applied Ballistics, 2015), Chs. 10–12 [book]

JBM Ballistics
- Drag functions — https://jbmballistics.com/ballistics/topics/dragfunctions.shtml
- Ballistic coefficients — https://jbmballistics.com/ballistics/topics/bcs.shtml
- Downloads (McCoy/BRL Cd-vs-Mach tables) — https://jbmballistics.com/downloads.html
- Trajectory calculator terms — https://jbmballistics.com/ballistics/calculators/help/traj_simp/traj_simp_exp.shtml
- Miller 2005 article (bibliography copy; 404 at time of writing) — https://jbmballistics.com/ballistics/bibliography/articles/miller_stability_1.pdf

Hornady
- 4DOF Technical Paper v2 — https://static.hornady.media/site/hornady/files/ballistic/hornady-4dof-technical-paper-v2.pdf
- 4DOF Ballistic Calculator Technical Document — https://static.hornady.media/presscenter/docs/1410992918-4-DOF----Ballistic-Calculator-Technical-Document.pdf

Sierra / Berger
- Sierra Exterior Ballistics 2.4 (BC testing lessons) — https://www.sierrabullets.com/exterior-ballistics/2-4-lessons-learned-from-ballistic-coefficient-testing/
- Sierra Exterior Ballistics 4.0 (6-DOF effects) — https://www.sierrabullets.com/exterior-ballistics/4-0-six-degree-of-freedom-effects-on-bullet-flight/
- Sierra 3.1 / 3.3 / Inclined Fire pages [not re-verified; removed 2025] — https://www.sierrabullets.com/exterior-ballistics/3-1-effects-of-altitude-and-atmospheric-conditions/ , https://www.sierrabullets.com/exterior-ballistics/3-3-effects-of-shooting-uphill-or-downhill/ , https://www.sierrabullets.com/exterior-ballistics/inclined-fire/
- Berger Twist Rate Stability Calculator — https://bergerbullets.com/twist-rate-calculator/
- Berger, How Stability Affects BC Consistency — https://bergerbullets.com/nobsbc/how-stability-affects-bc-consistency/

Atmosphere standards (NOAA / NWS / FAA / ICAO / NASA / NIST / WMO)
- NWS virtual temperature — https://www.weather.gov/media/epz/wxcalc/virtualTemperature.pdf
- NWS density altitude — https://www.weather.gov/media/epz/wxcalc/densityAltitude.pdf
- NWS pressure altitude — https://www.weather.gov/media/epz/wxcalc/pressureAltitude.pdf
- NWS altimeter setting — https://www.weather.gov/media/epz/wxcalc/altimeterSetting.pdf
- NWS pressure definitions — https://www.weather.gov/bou/pressure_definitions
- FAA P-8740-2 Density Altitude — https://www.faasafety.gov/files/events/NM/NM07/2023/NM07120280/FAA-P-8740-02-DensityAltitude.pdf
- FAA Pilot's Handbook of Aeronautical Knowledge — https://www.faa.gov/sites/faa.gov/files/pilots/pilot_handbook.pdf
- US Standard Atmosphere 1976 (NASA NTRS) — https://ntrs.nasa.gov/citations/19770009539
- ICAO Doc 7488, Manual of the ICAO Standard Atmosphere [document]
- IERS Conventions 2010 (Earth rotation rate 7.292115e-5 rad/s) [document]
- WMO-No. 8 Guide to Instruments and Methods of Observation — https://wgms.ch/downloads/WMO_8_II-2023_en.pdf ; NWS summary — https://www.weather.gov/media/epz/mesonet/CWOP-WMO8.pdf
- NDBC measurement descriptions — https://www.ndbc.noaa.gov/faq/measdes.shtml

Textbook / peer-reviewed
- McCoy, R. L., *Modern Exterior Ballistics: The Launch and Flight Dynamics of Symmetric Projectiles*, 2nd ed., Schiffer, 2012 — Chs. 2, 5–8, 12
- Miller, D., "A New Rule for Estimating Rifling Twist", Precision Shooting, March 2005; "How Good Are Simple Rules for Estimating Rifling Twist", Precision Shooting, June 2009
- Courtney, M. & Miller, D., "A Stability Formula for Plastic-Tipped Bullets" — https://arxiv.org/pdf/1410.5340

Manufacturer data
- Hodgdon Extreme powders temperature test — https://hodgdonpowderco.com/wp-content/uploads/2023/04/hodgdon-extreme-series-powders-test-results-for-temperature-sensitivity-1.pdf
- Lilja Precision Rifle Barrels (Sierra/Davis reference values) — https://riflebarrels.com/ballistic-effects-of-altitude-temperature-and-humidity/
- Ballistic Explorer help (ASM values, 1.018 factor) — https://www.dexadine.com/bexhelp/bexhelp140.htm
- Lapua Ballistics app tips (Coriolis) — https://www.lapua.com/ballistics-app-tips-the-coriolis-effect/

Controlled empirical barrel / suppressor / powder tests
- Rifleshooter.com .308 28->16.5 in — https://rifleshooter.com/2014/12/308-winchester-7-62x51mm-nato-barrel-length-versus-velocity-28-to-16-5/
- Rifleshooter.com .308 16.5->6 in — https://rifleshooter.com/2016/02/308-winchester-7-62x51mm-nato-short-barrel-length-and-velocity-a-six-inch-308-bolt-gun/
- Rifleshooter.com 6.5 CM 27->16 in — https://rifleshooter.com/2016/02/6-5-creedmoor-effect-of-barrel-length-on-velocity-cutting-up-a-creedmoor/
- Rifleshooter.com 5.56 26->6 in — https://rifleshooter.com/2015/12/223-remington-5-56mm-nato-barrel-length-and-velocity-26-inches-to-6-inches/
- Rifleshooter.com 5.56 6->14 in — https://rifleshooter.com/2015/11/223-remington5-56mm-nato-barrel-length-versus-velocity-short-barrels-6-to-14-inches/
- Rifleshooter.com suppressors and MV — https://rifleshooter.com/2025/01/how-do-rifle-suppressors-affect-muzzle-velocity/
- Ballistics By The Inch 9mm — http://www.ballisticsbytheinch.com/9luger.html [not re-verified this session]
- Lucky Gunner .300 BLK by barrel length (three barrels) — https://www.luckygunner.com/lounge/300-blackout-ballistics/
- Precision Rifle Blog powder temperature test (secondary, empirical) — https://precisionrifleblog.com/2016/06/19/powder-temp-stability-hodgdon-extreme-vs-imr-enduron/
- AmmoLand 9mm three-pistol test (cross-check only) — https://www.ammoland.com/2022/12/9mm-velocity-testing/


---

# Part 2 — Validation findings


What was checked: every load in the seed `LOADS` catalogue against the maker's published MV/BC, and the seed solver against published trajectory tables. Corrected catalogue is in `loads.json` next to this file, with a source on every line.

## The hold card is wrong at 100 yd — settled

The seed flagged the 300 BLK subsonic card (50-yd zero, 2.9" sight) as suspect: card says **-18.5" (180gr) / -22.5" (200 & 220gr)** at 100 yd; the solver said about -6".

The solver is right. Two independent maker tables agree with it:

- Hornady 190gr Sub-X, 1050 fps, 100-yd zero, 1.5" sight: **-33.4" at 200**. Seed solver: -33.5".
- Gorilla 220gr SMK, 1030 fps, 100-yd zero: **+3.5" at 50, -33.7" at 200**. Seed solver: +3.5 / -33.7.

Re-run with the card's 2.9" sight and 50-yd zero, using the published BCs:

| Load | 7 | 25 | 50 | 100 | 150 | 200 |
|---|---|---|---|---|---|---|
| 190gr 1050 fps | -2.0 | -0.4 | 0 | **-5.4** | -19.6 | -42.9 |
| 200gr 1060 fps | -2.0 | -0.4 | 0 | **-5.3** | -19.2 | -42.0 |
| 220gr 1030 fps | -2.0 | -0.4 | 0 | **-5.8** | -20.5 | -44.5 |

To get -18.5" at 100 with a 50-yd zero you'd need ~650 fps. Nothing subsonic out of a 13" barrel is that slow. One guess: **the card figures are centimetres** — -18.5 cm = -7.3", -22.5 cm = -8.9", which is what a 220gr at ~900-950 fps does. Either way, the app should ship -5.5" to -6" and let him overwrite it after he shoots 100.

The 7-yd and 25-yd card values (-2.5 / -1.0) are also a bit off; solver says -2.0 / -0.4. Inside group size, not worth arguing.

## 9mm card

- **7 yd "+0.5"** is impossible with a 1.75" dot and a 25-yd zero; the bullet is **-1.1"** there (still climbing to the line of sight). It never goes above the line of sight before 25.
- **50 yd "-2.5 / -2.0"**: solver says ~0" at 50 (second crossing). The -2.5 looks like a 75-yd number or a taller sight. Ship 0 at 50, -6" at 100.

## Solver validation

Point-mass solver from `range.html`, ported to Python untouched:

- Subsonic 300 BLK vs Hornady and Gorilla tables: within 0.1" to 200 yd.
- 6.5 CM 140 ELD-M (G7 .326) vs Hornady 200-yd-zero table: -8.1/-23.1/-46.1 vs published -7.8/-22.3/-44.4 at 300/400/500. ~4% more drop; Hornady's table is Doppler-derived (4DOF). Fine for a phone app.
- .308 168 SMK vs Federal: solver matches Federal's table to 0.4" **when run with G1 .462**, and shows ~11% more drop at 500 with G7 .224. Federal lists both BCs but their table is a flat G1. G7 .224 is closer to how a 168 SMK actually flies past 400. Keep G7 as the default for that load; expect Federal's printed table to look optimistic next to it.

One fix worth making in the port: Hornady's tables assume 78% humidity (ICAO); the solver uses dry-air density. Negligible (<1%) — note it, don't chase it.

## Catalogue corrections (seed → published)

Big ones:

| Load | Field | Seed | Published | Source |
|---|---|---|---|---|
| All 300 BLK subs | BC G1 | .25–.31 | **.437 (190 Sub-X) / .558 (S&B 200) / .608 (220 SMK) / .690 (208 ELD-M)** | Hornady LE, S&B, Gorilla/Sierra |
| 300 BLK 180gr sub | — | present | **no mainstream factory 180 exists — removed.** Replaced with Hornady 190 Sub-X and 208 ELD-M. | |
| 300 BLK 150 FMJ | BC | .330 | **.406** (Federal AE300BLK1); Rem UMC .390, Win 147gr .415 | federalpremium.com |
| 300 BLK 110 V-MAX | MV | 2300 | **2375** (16") | hornady.com |
| 9mm 115 AE9DP | BC | .145 | **.120** | Federal LE |
| 9mm 124 AE9AP | MV | 1100 | **1150** (4") | federalpremium.com |
| 9mm 124 +P | BC | .160 | **.150** (HST); Gold Dot is .134 at 1220 | Federal / Speer |
| 5.56 69 SMK GM223M | MV | 2800 | **2950** (24") | federalpremium.com |
| .308 150 Power-Shok | BC | .400 | **.313** | federalpremium.com |
| .308 175 SMK | BC G7 | .243 (Litz) | **.250** (Federal's own) | federalpremium.com |

Confirmed as-is (within 3%): 9mm 147; 300 BLK 125 HP; 5.56 55 M193, 62 M855 (MV), 77 SMK; .308 M80, 168 SMK, 178 ELD-X; all five 6.5 CM loads.

## Still unverified

- **M855 BC** — Federal's XM855 page 404s. Seed .304 kept. Federal rep has quoted .349; Federal's non-penetrator 62gr FMJ-BT is .307.
- **Federal XM193 / XM80C** — MV and BC are from retailer listings reproducing Federal's numbers, barrel length not stated.
- **Winchester USA line** — figures from the family listing page; per-product pages say "no ballistics data."
- **Sierra 125 SMK** banded BC — Sierra's site loads it by JS; Remington publishes .330 for their load of it.
- **Remington 220 subsonic** is a *different* 220gr bullet (flat-base OT) at **940 fps**, BC .680 — not the SMK. If someone shoots that, they need to change MV.

## For the app

- Ship `loads.json` as the catalogue. Keep `src` in the data so the "where's this number from?" question has an answer in-app.
- Every load shows a **"maker's barrel: 16 in — chrono yours"** hint. The 13"-vs-16" and 16"-vs-24" gaps matter more than any BC error above.
- The hold card entries (`card: true`) should be treated as *this user's overrides*, not truth. Seed with the solver's numbers and let him correct after a 100-yd confirmation.


---

# Part 3 — Load catalogue sources


Companion to `ballistics/loads.json`. Every load added on 24 Sep 2026 is listed with the page the numbers came from and any caveat. Rules followed: manufacturer product pages, manufacturer LE detail pages, or manufacturer catalogues/ballistics charts only. No retailer copies were needed for the new entries (the two pre-existing retailer-sourced 5.56/.308 entries are unchanged).

## Source families and their caveats

| Source | What it gives | Caveat |
|---|---|---|
| **Federal LE detail pages** `le.vistaoutdoor.com/ammunition/federal/handgun/details.aspx?id=N` | MV, BC, test barrel for handgun loads | BC is rounded to two decimals (0.10, 0.17, 0.19, 0.20) and the drag model is not named; handgun BCs are treated as G1. |
| **federalpremium.com product pages** (rifle, shotshell, rimfire) | MV, BC labelled "G1" (and G7 on Gold Medal) | Test barrel is not stated on rifle/shotshell/rimfire pages (24" is the SAAMI convention for centerfire rifle). Handgun pages give MV and barrel but no BC. |
| **Speer 2024 catalogue** `speer.com .../SP157_Speer2024_Catalog_WEB_SinglePg-compressed.pdf` p.9 handgun table | MV, BC, test barrel for Gold Dot loads | BC model not named (G1 assumed). The catalogue gives no BC for the 10mm 200gr load; its BC was taken from the same bullet's component page. |
| **CCI product pages** `cci-ammunition.com` | MV, BC | Test barrel not stated; BC model not named (G1 assumed). |
| **Hornady product pages** `hornady.com/ammunition/...` | MV and test barrel | BC is not rendered on the product page. |
| **Hornady 2022 ballistics chart** `static.hornady.media/presscenter/docs/1410998059-2022-Metric-Ballistics-Chart.pdf` | BC for every Hornady rifle load; MV in m/s | "B.C." column is not labelled G1/G7; it matches the G1 column of hornady.com/bc for ELD bullets, so it is treated as G1. Chart header: "All data from a 24" Bbl, unless otherwise noted." Chart has no handgun, 45-70 or shotgun rows. |
| **hornady.com/bc** | G1 and G7 at Mach 2.25 for ELD Match / ELD-X | Used as the primary (G7) figure for ELD loads, with G1 in `bc_g1`. |
| **Sellier & Bellot** `sellierbellot.us/products/.../detail/N/` | MV (m/s and fps), BC G1, test barrel | — |
| **Remington** `remington.com` product page | MV, BC | BC model not named; barrel not stated. |

## Loads

Format: key — load — MV / BC (model) — source — caveats.

### .22 LR (`22lr`)
- `22lr-40sv` — CCI Standard Velocity 40gr LRN #0035 — 1070 / .120 — https://www.cci-ammunition.com/rimfire/cci/standard-velocity/6-35.html — barrel not stated; BC model not named.
- `22lr-40gm` — Federal Gold Medal 40gr LRN 711B — 1080 / .138 — https://www.federalpremium.com/rimfire/gold-medal/gold-medal-rimfire/11-711B.html — barrel not stated.
- `22lr-40am` — Federal AutoMatch 40gr AM22 — 1200 / .138 — https://www.federalpremium.com/rimfire/champion/champion-training---rimfire/11-AM22.html — barrel not stated.
- `22lr-40mm` — CCI Mini-Mag 40gr CPRN #0030 — 1235 / .130 — https://www.cci-ammunition.com/rimfire/cci/target-mini-mag/6-30.html — barrel not stated.
- `22lr-36hp` — CCI Mini-Mag 36gr CPHP #0031 — 1260 / .125 — https://www.cci-ammunition.com/rimfire/cci/mini-mag/6-31.html — barrel not stated.
- `22lr-32st` — CCI Stinger 32gr #0050 — 1640 / .084 — https://www.cci-ammunition.com/rimfire/cci/stinger/6-50.html — barrel not stated.

### .380 ACP (`380`)
- `380-95` — Federal AE380AP 95gr FMJ — 980 / .10 — MV https://www.federalpremium.com/handgun/american-eagle/american-eagle-handgun/11-AE380AP.html (3.75"); BC https://le.vistaoutdoor.com/ammunition/federal/handgun/details.aspx?id=79 — BC rounded, model not named.
- `380-90hs` — Federal Hydra-Shok P380HS1G 90gr — 1000 / .10 — https://le.vistaoutdoor.com/ammunition/federal/handgun/details.aspx?id=558 (3.75") — BC rounded.
- `380-90gd` — Speer Gold Dot 23606GD 90gr — 1040 / .101 — MV https://www.speer.com/ammunition/gold-dot/gold-dot-handgun-personal-protection/19-23606GD.html; BC Speer 2024 catalogue p.9 (3.75").

### .38 Special (`38spl`)
- `38-130` — Federal AE38K 130gr FMJ — 890 / .17 — https://le.vistaoutdoor.com/ammunition/federal/handgun/details.aspx?id=81 (4").
- `38-158lrn` — Federal AE38B 158gr LRN — 770 / .20 — https://le.vistaoutdoor.com/ammunition/federal/handgun/details.aspx?id=80 (4").
- `38-129p` — Federal Hydra-Shok +P P38HS1G 129gr — 950 / .17 — https://le.vistaoutdoor.com/ammunition/federal/handgun/details.aspx?id=559 (4" vented).
- `38-158p` — Federal Classic 38G +P 158gr JHP — 900 / .20 — https://le.vistaoutdoor.com/ammunition/federal/handgun/details.aspx?id=544 (4" vented).
- `38-135p` — Speer Gold Dot Short Barrel +P 23921GD 135gr — 860 / .141 — Speer 2024 catalogue p.9 — **2" vented test barrel** (short-barrel load).

### .357 Magnum (`357`)
- `357-125gd` — Speer Gold Dot 23920GD 125gr — 1450 / .140 — MV https://www.speer.com/ammunition/gold-dot/gold-dot-handgun-personal-protection/19-23920GD.html (4" vented); BC Speer 2024 catalogue p.9.
- `357-158jsp` — Federal AE357A 158gr JSP — 1240 / .20 — https://le.vistaoutdoor.com/ammunition/federal/handgun/details.aspx?id=77 (4") — BC rounded.
- `357-158gd` — Speer Gold Dot 23960GD 158gr — 1235 / .164 — MV https://www.speer.com/ammunition/gold-dot/gold-dot-handgun-personal-protection/19-23960GD.html (4" vented); BC Speer 2024 catalogue p.9.
- Left out: Hornady 125gr FTX Critical Defense 90500 (1500 fps, 8" barrel) and 158gr XTP 90562 (1250 fps, 8") — no maker BC found for these bullets.

### .40 S&W (`40sw`)
- `40-165` — Federal AE40R3 165gr FMJ — 1130 / .15 — https://le.vistaoutdoor.com/ammunition/federal/handgun/details.aspx?id=86 (4").
- `40-180` — Federal AE40R1 180gr FMJ — 1000 / .17 — https://le.vistaoutdoor.com/ammunition/federal/handgun/details.aspx?id=84 (4").
- `40-165hst` — Federal HST P40HST3 165gr — 1130 / .15 — https://le.vistaoutdoor.com/ammunition/federal/handgun/details.aspx?id=568 (4").
- `40-180hst` — Federal HST P40HST1 180gr — 1010 / .17 — https://le.vistaoutdoor.com/ammunition/federal/handgun/details.aspx?id=566 (4").
- `40-180gd` — Speer Gold Dot 23974GD 180gr — 950 / .148 — Speer 2024 catalogue p.9 — **3.5" test barrel**.

### .45 ACP (`45acp`)
- `45-230` — Federal AE45A 230gr FMJ — 890 / .19 — https://le.vistaoutdoor.com/ammunition/federal/handgun/details.aspx?id=88 (5").
- `45-230hst` — Federal HST P45HST2 230gr — 890 / .19 — https://le.vistaoutdoor.com/ammunition/federal/handgun/details.aspx?id=574 (5").
- `45-230hstp` — Federal HST +P P45HST1 230gr — 950 / .19 — https://le.vistaoutdoor.com/ammunition/federal/handgun/details.aspx?id=573 (5").
- `45-185p` — Federal Hydra-Shok +P P45HS2G 185gr — 1130 / .15 — https://le.vistaoutdoor.com/ammunition/federal/handgun/details.aspx?id=572 (5").
- `45-230gd` — Speer Gold Dot 23966GD 230gr — 890 / .143 — Speer 2024 catalogue p.9 (5").

### 10mm Auto (`10mm`)
- `10mm-180` — Federal AE10A 180gr FMJ — 1030 / .17 — https://le.vistaoutdoor.com/ammunition/federal/handgun/details.aspx?id=67 (5") — mid-power load.
- `10mm-180sb` — Sellier & Bellot SB10A 180gr FMJ — 1165 / .191 G1 — https://www.sellierbellot.us/products/pistol-and-revolver-ammunition/pistol-and-revolver-cartridges/detail/485/ — **6" test barrel**.
- `10mm-200gd` — Speer Gold Dot 54000GD 200gr — 1100 / .151 — MV https://www.speer.com/ammunition/gold-dot/gold-dot-handgun-personal-protection/19-54000GD.html (5"); BC from the component bullet page https://www.speer.com/bullets/handgun-bullets/gold-dot-handgun-component-bullet/19-400200GDB.html (catalogue table gives no BC for this load).
- Left out: Federal HST P10HST1S (1130 fps, 5"), Federal Fusion F10FS1 (1200 fps, 6"), Hornady 180 XTP 9126 (1275 fps, 5") — no maker BC on the page.

### .223 Rem (`223`)
Kept separate from the existing `556` set because Federal publishes .223 (AE223) and 5.56 (AE193/XM193) as different products with different MVs.
- `223-55fmj` — Federal AE223 55gr FMJ-BT — 3240 / .269 G1 — https://www.federalpremium.com/rifle/american-eagle/american-eagle-rifle/11-AE223.html — barrel not stated.
- `223-55vmax` — Hornady 8327 55gr V-MAX — 3240 (24") / .255 — MV https://www.hornady.com/ammunition/rifle/223-rem-55-gr-v-max; BC Hornady 2022 chart.
- `223-62fmj` — Federal AE223N 62gr FMJ-BT — 3020 / .307 G1 — https://www.federalpremium.com/rifle/american-eagle/american-eagle-rifle/11-AE223N.html — barrel not stated.
- `223-62fus` — Federal Fusion F223FS1 62gr — 3000 / .310 G1 — https://www.federalpremium.com/rifle/fusion/11-F223FS1.html — barrel not stated.
- `223-75bthp` — Hornady 8026 75gr BTHP Match — 2790 (24") / .395 — MV https://www.hornady.com/ammunition/rifle/223-rem-75-gr-bthp-match; BC Hornady 2022 chart.
- `223-75tmj` — Federal AE223T75 75gr TMJ — 2775 / .400 G1 — https://www.federalpremium.com/rifle/american-eagle/american-eagle-rifle/11-AE223T75.html — barrel not stated.

### 7.62x39 (`762x39`)
- `762x39-123sst` — Hornady BLACK 80784 123gr SST — 2350 (20") / .260 — MV https://www.hornady.com/ammunition/rifle/7.62x39-123-gr-sst-black; BC Hornady 2022 chart (row notes 20" Bbl). Page velocity table (2350→2040 at 100 yd) is consistent with .260.
- `762x39-123hp` — Hornady American Gunner 80786 123gr HP Match — 2350 (20") / .272 — MV https://www.hornady.com/ammunition/rifle/7.62-x-39mm-123-gr-hp-match-american-gunner; BC Hornady 2022 chart.
- `762x39-123sp` — Federal Power-Shok 76239B 123gr JSP — 2350 / .274 G1 — https://www.federalpremium.com/rifle/power-shok/11-76239B.html — barrel not stated.
- `762x39-124fmj` — Federal AE A76239A 124gr FMJ — 2350 / .298 G1 — https://www.federalpremium.com/rifle/american-eagle/american-eagle-rifle/11-A76239A.html — barrel not stated.
- Left out: Hornady Frontier FR420 123gr FMJ (2340 fps, 24") — not in the Hornady chart, no BC.

### 6.5 Grendel (`65grendel`)
- `65g-120otm` — Federal AE65GDL1 120gr OTM — 2610 / .421 G1 — https://www.federalpremium.com/rifle/american-eagle/american-eagle-rifle/11-AE65GDL1.html — barrel not stated.
- `65g-120fus` — Federal Fusion MSR F65GDLMSR1 120gr — 2600 / .340 G1 — https://www.federalpremium.com/rifle/fusion/11-F65GDLMSR1.html — page states 24" test barrel.
- `65g-123sst` — Hornady Custom 8152 123gr SST — 2580 (24") / .506 — MV https://www.hornady.com/ammunition/rifle/6-5-grendel-123-gr-sst; BC Hornady 2022 chart (chart lists the SST and ELD Match rows with the same .506).
- `65g-123eldm` — Hornady BLACK 81528 123gr ELD Match — 2580 (24") / G7 .255, G1 .506 — MV https://www.hornady.com/ammunition/rifle/6.5-grendel-123-gr-eld-match-black; BC https://www.hornady.com/bc.

### 6mm ARC (`6arc`)
- `6arc-103eldx` — Hornady Precision Hunter 81602 — 2800 (24") / G7 .258, G1 .512 — MV https://www.hornady.com/ammunition/rifle/6mm-arc-103-gr-eld-x-precision-hunter; BC hornady.com/bc.
- `6arc-105bthp` — Hornady BLACK 81604 105gr BTHP — 2750 (24") / .530 — MV https://www.hornady.com/ammunition/rifle/6mm-arc-105-gr-bthp-hornady-black; BC Hornady 2022 chart.
- `6arc-108eldm` — Hornady Match 81608 108gr ELD Match — 2750 (24") / G7 .270, G1 .536 — MV https://www.hornady.com/ammunition/rifle/6mm-arc-108-gr-eld-match; BC hornady.com/bc.

### .224 Valkyrie (`224valk`)
- `224v-60vmax` — Hornady Varmint Express 81531 60gr V-MAX — 3300 / .265 — **both from the Hornady 2022 chart** (1006 m/s = 3300 fps; product page not fetched).
- `224v-75fmj` — Federal AE224VLK1 75gr FMJ — 3000 / .400 G1 — https://www.federalpremium.com/rifle/american-eagle/american-eagle-rifle/11-AE224VLK1.html — barrel not stated.
- `224v-75bthp` — Hornady BLACK 81532 75gr BTHP — 3000 (24") / .395 — MV https://www.hornady.com/ammunition/rifle/224-valkyrie-75-gr-bthp-wc-hornady-black; BC Hornady 2022 chart.
- `224v-88eldm` — Hornady 81534 88gr ELD Match — 2675 (24") / G7 .274, G1 .545 — MV https://www.hornady.com/ammunition/rifle/224-valkyrie-88-gr-eld-match; BC hornady.com/bc.
- `224v-90fus` — Federal Fusion MSR F224VLKMSR1 90gr — 2700 / .424 G1 — https://www.federalpremium.com/rifle/fusion-msr/11-F224VLKMSR1.html — barrel not stated.
- `224v-90smk` — Federal Gold Medal GM224VLK1 90gr SMK — 2700 / G7 .274, G1 .563 — https://www.federalpremium.com/rifle/gold-medal/gold-medal-sierra-matchking/11-GM224VLK1.html — barrel not stated.

### .243 Win (`243`)
- `243-87vmax` — Hornady Custom 80468 — 3240 (24") / .400 — https://www.hornady.com/ammunition/rifle/243-win-87-gr-v-max-custom; BC Hornady 2022 chart.
- `243-95sst` — Hornady Superformance 80463 — 3185 (24") / .355 — https://www.hornady.com/ammunition/rifle/243-win-95-gr-sst-superformance; BC Hornady 2022 chart.
- `243-95fus` — Federal Fusion F243FS1 — 2980 / .376 G1 — https://www.federalpremium.com/rifle/fusion/11-F243FS1.html — barrel not stated.
- `243-100il` — Hornady American Whitetail 8047 100gr InterLock BTSP — 2960 (24") / .405 — https://www.hornady.com/ammunition/rifle/243-win-100-gr-interlock-btsp-american-whitetail; BC Hornady 2022 chart.
- `243-100ps` — Federal Power-Shok 243B — 2960 / .355 G1 — https://www.federalpremium.com/rifle/power-shok/11-243B.html — barrel not stated.

### .270 Win (`270`)
- `270-130il` — Hornady American Whitetail 8053 — 3060 (24") / .462 — https://www.hornady.com/ammunition/rifle/270-win-130-gr-interlock-sp-american-whitetail; BC Hornady 2022 chart.
- `270-130ps` — Federal Power-Shok 270A — 3060 / .372 G1 — https://www.federalpremium.com/rifle/power-shok/power-shok-rifle/11-270A.html — barrel not stated.
- `270-130sst` — Hornady Superformance 80543 — 3200 (24") / .460 — https://www.hornady.com/ammunition/rifle/270-win-130-gr-sst-superformance; BC Hornady 2022 chart.
- `270-145eldx` — Hornady Precision Hunter 80536 — 2970 (24") / G7 .270, G1 .536 — https://www.hornady.com/ammunition/rifle/270-win-145-gr-eld-x-precision-hunter; BC hornady.com/bc.
- `270-150ps` — Federal Power-Shok 270B — 2830 / .261 G1 — https://www.federalpremium.com/rifle/power-shok/11-270B.html — barrel not stated.
- `270-150fus` — Federal Fusion F270FS2 — 2850 / .471 G1 — https://www.federalpremium.com/rifle/fusion/11-F270FS2.html — barrel not stated.

### 7mm-08 Rem (`7mm08`)
- `708-139il` — Hornady American Whitetail 8057 — 2840 (24") / .392 — https://www.hornady.com/ammunition/rifle/7mm-08-rem-139-gr-interlock-sp-american-whitetail; BC Hornady 2022 chart.
- `708-139sst` — Hornady Superformance 80573 — 2950 (24") / .486 — https://www.hornady.com/ammunition/rifle/7mm-08-rem-139-gr-sst-superformance; BC Hornady 2022 chart.
- `708-140fus` — Federal Fusion F708FS1 — 2850 / .390 G1 — https://www.federalpremium.com/rifle/fusion/11-F708FS1.html — barrel not stated.
- `708-150eldx` — Hornady Precision Hunter 85578 — 2770 (24") / G7 .289, G1 .574 — https://www.hornady.com/ammunition/rifle/7mm-08-rem-150-gr-eld-x-precision-hunter; BC hornady.com/bc.

### 7mm Rem Mag (`7rm`)
- `7rm-139sst` — Hornady Superformance 80593 — 3240 (24") / .486 — https://www.hornady.com/ammunition/rifle/7mm-rem-mag-139-gr-sst-superformance; BC Hornady 2022 chart.
- `7rm-154il` — Hornady American Whitetail 80590 — 3035 (24") / .433 — https://www.hornady.com/ammunition/rifle/7mm-rem-mag-154-gr-interlock-sp-american-whitetail; BC Hornady 2022 chart.
- `7rm-154sst` — Hornady Superformance 8061 — 3100 (24") / .525 — https://www.hornady.com/ammunition/rifle/7mm-rem-mag-154-gr-sst-superformance; BC Hornady 2022 chart.
- `7rm-162eldx` — Hornady Precision Hunter 80636 — 2975 (24") / G7 .318, G1 .631 — https://www.hornady.com/ammunition/rifle/7mm-rem-mag-162-gr-eld-x-precision-hunter; BC hornady.com/bc.
- `7rm-175fus` — Federal Fusion F7RFS2 — 2760 / .537 G1 — https://www.federalpremium.com/rifle/fusion/11-F7RFS2.html — barrel not stated.
- Left out: Federal Power-Shok 7RA 150gr (3110 fps) — page URL could not be fetched under the provenance rule.

### .30-30 Win (`3030`)
- `3030-140mf` — Hornady LEVERevolution 82731 140gr MonoFlex — 2465 (24") / .295 — https://www.hornady.com/ammunition/rifle/30-30-win-140-gr-monoflex-leverevolution; BC Hornady 2022 chart.
- `3030-150rn` — Hornady American Whitetail 80801 150gr RN — 2390 (24") / .186 — https://www.hornady.com/ammunition/rifle/30-30-win-150-gr-rn-interlock-american-whitetail; BC Hornady 2022 chart.
- `3030-150ps` — Federal Power-Shok 3030A — 2390 / .218 G1 — https://www.federalpremium.com/rifle/power-shok/11-3030A.html — barrel not stated.
- `3030-160ftx` — Hornady LEVERevolution 82730 160gr FTX — 2400 (24") / .330 — https://www.hornady.com/ammunition/rifle/30-30-win-160-gr-ftx-leverevolution; BC Hornady 2022 chart.
- `3030-170ps` — Federal Power-Shok 3030B — 2200 / .254 G1 — https://www.federalpremium.com/rifle/power-shok/11-3030B.html — barrel not stated.

### .30-06 (`3006`)
- `3006-150il` — Hornady American Whitetail 8108 — 2910 (24") / .338 — https://www.hornady.com/ammunition/rifle/30-06-springfield-150-gr-interlock-sp-american-whitetail; BC Hornady 2022 chart.
- `3006-165sst` — Hornady Superformance 81153 — 2960 (24") / .447 — https://www.hornady.com/ammunition/rifle/30-06-springfield-165-gr-sst-superformance; BC Hornady 2022 chart.
- `3006-168eldm` — Hornady Match 81171 168gr ELD Match — 2710 / G7 .263, G1 .523 — **MV converted from the Hornady 2022 chart (826 m/s; 24")**, product page not fetched; BC hornady.com/bc.
- `3006-178eldx` — Hornady Precision Hunter 81174 — 2750 (24") / G7 .278, G1 .552 — https://www.hornady.com/ammunition/rifle/30-06-springfield-178-gr-eld-x-precision-hunter; BC hornady.com/bc.
- `3006-180ps` — Federal Power-Shok 3006B — 2700 / .385 G1 — https://www.federalpremium.com/rifle/power-shok/11-3006B.html — barrel not stated.

### .300 Win Mag (`300wm`)
- `300wm-180il` — Hornady American Whitetail 82044 — 2960 (24") / .425 — https://www.hornady.com/ammunition/rifle/300-win-mag-180-gr-interlock-sp-american-whitetail; BC Hornady 2022 chart.
- `300wm-180ps` — Federal Power-Shok 300WBS — 2960 / .439 G1 — https://www.federalpremium.com/rifle/power-shok/11-300WBS.html — barrel not stated.
- `300wm-180sst` — Hornady Superformance 82193 — 3130 (24") / .480 — https://www.hornady.com/ammunition/rifle/300-win-mag-180-gr-sst-superformance; BC Hornady 2022 chart.
- `300wm-190smk` — Federal Gold Medal GM300WM 190gr SMK — 2900 / G7 .275, G1 .533 — https://www.federalpremium.com/rifle/gold-medal/gold-medal-sierra-matchking/11-GM300WM.html — barrel not stated.
- `300wm-200eldx` — Hornady Precision Hunter 82002 — 2860 (24") / G7 .301, G1 .597 — https://www.hornady.com/ammunition/rifle/300-win-mag-200-gr-eld-x-precision-hunter; BC hornady.com/bc.

### .300 PRC (`300prc`)
- `300prc-190cx` — Hornady Outfitter 82164 190gr CX — 3000 (24") / .575 — https://www.hornady.com/ammunition/rifle/300-prc-190-gr.-cx-outfitter; BC Hornady 2022 chart.
- `300prc-212eldx` — Hornady Precision Hunter 82166 — 2860 (24") / G7 .334, G1 .663 — https://www.hornady.com/ammunition/rifle/300-prc-212-gr-eld-x-precision-hunter; BC hornady.com/bc (1:10 twist value).
- `300prc-225eldm` — Hornady Match 82162 — 2810 (24") / G7 .391, G1 .777 — https://www.hornady.com/ammunition/rifle/300-prc-225-gr-eld-match; BC hornady.com/bc (1:10 twist value).

### .338 Lapua (`338lm`)
- `338lm-250bthp` — Hornady Match 8230 250gr BTHP — 2860 (24") / .670 — https://www.hornady.com/ammunition/rifle/338-lapua-250-gr-bthp-match; BC Hornady 2022 chart.
- `338lm-270eldx` — Hornady Precision Hunter 82313 — 2800 (24") / G7 .381, G1 .757 — https://www.hornady.com/ammunition/rifle/338-lapua-magnum-270-gr-eld-x-precision-hunter; BC hornady.com/bc.
- `338lm-285eldm` — Hornady Match 82300 — 2745 (24") / G7 .417, G1 .829 — https://www.hornady.com/ammunition/rifle/338-lapua-285-gr-eld-match; BC hornady.com/bc.
- `338lm-300smk` — Federal Gold Medal GM338LM2 300gr SMK — 2580 / G7 .387, G1 .768 — https://www.federalpremium.com/rifle/gold-medal/gold-medal-sierra-matchking/11-GM338LM2.html — barrel not stated.

### .350 Legend (`350legend`)
- `350-160fus` — Federal Fusion F350LFS1 — 2300 / .259 G1 — https://www.federalpremium.com/rifle/fusion/11-F350LFS1.html — barrel not stated.
- `350-165ftx` — Hornady American Whitetail 81197 165gr FTX — 2200 (24") / .250 — https://www.hornady.com/ammunition/rifle/350-legend-165-gr-ftx-tipped; BC Hornady 2022 chart.
- `350-170il` — Hornady American Whitetail 81196 170gr InterLock — 2200 (**20"**) / .215 — https://www.hornady.com/ammunition/rifle/350-legend-170-gr-interlock-american-whitetail; BC Hornady 2022 chart.
- `350-180ps` — Federal Power-Shok 350LA — 2100 / .245 G1 — https://www.federalpremium.com/rifle/power-shok/11-350LA.html — barrel not stated.
- `350-250subx` — Hornady Subsonic 81198 250gr Sub-X — 1050 (**16"**) / .265 — https://www.hornady.com/ammunition/rifle/350-legend-250-gr.-sub-x-subsonic; BC Hornady 2022 chart.
- Calibre `dia` is set to .357 (SAAMI nominal); Hornady loads .355 bullets.

### .45-70 Govt (`4570`)
- `4570-300ps` — Federal Power-Shok 4570AS — 1850 / .289 G1 — https://www.federalpremium.com/rifle/power-shok/11-4570AS.html — barrel not stated.
- `4570-300fus` — Federal Fusion F4570FS1 — 1850 / .290 G1 — https://www.federalpremium.com/rifle/fusion/11-F4570FS1.html — barrel not stated.
- `4570-300hd` — Federal HammerDown LG45701 — 1850 / .290 G1 — https://www.federalpremium.com/rifle/hammerdown/11-LG45701.html — barrel not stated.
- `4570-405cl` — Remington Core-Lokt 29473 405gr — 1330 / .281 — https://www.remington.com/rifle/core-lokt/29-29473.html — barrel not stated; BC model not named.
- Left out: Hornady LEVERevolution 325gr FTX 82747 (2000 fps, 24") and 250gr MonoFlex 82741 (2025 fps, 24") — the 2022 chart excerpt had no 45-70 rows and the bullet pages don't render BC.

### 12 ga slug (`12ga`)
- `12ga-1oz-foster` — Federal Power-Shok F127RS 1 oz rifled slug 2-3/4" — 1610 / .110 — https://www.federalpremium.com/products/shotshell/powershok/powershok-rifled-slug/f127-rs — barrel not stated.
- `12ga-1.25oz-foster` — Federal Power-Shok F131RS 1-1/4 oz 3" — 1600 / .108 — https://www.federalpremium.com/shotshell/power-shok-rifled-slug/11-F131+RS.html — barrel not stated.
- `12ga-1oz-sabot` — Federal Power-Shok F127SS2 1 oz sabot 2-3/4" — 1500 / .190 — https://www.federalpremium.com/shotshell/power-shok-sabot-slug/11-F127+SS2.html — barrel not stated.
- `12ga-300-sabot` — Federal Freight Train Copper P152FT 300gr 2-3/4" — 1900 / .187 — https://www.federalpremium.com/shotshell/freight-train-copper-sabot-slug/11-P152+FT.html; identical data on Trophy Copper P152TC https://www.federalpremium.com/shotshell/premium-slug-buckshot/vital-shok-trophy-copper-sabot-slug/11-P152+TC.html — barrel not stated.
- `12ga-300-sabot3` — Federal Trophy Copper P151TC 300gr 3" — 2000 / .187 — https://www.federalpremium.com/shotshell/premium-slug-buckshot/trophy-copper-sabot-slug/11-P151+TC.html — barrel not stated; page marked discontinued.
- Left out: Hornady SST/MonoFlex Superformance slug 86236 (1950 fps, 24"), American Whitetail 325gr 86271 (1825 fps) and 1 oz rifled slug 86234 (1600 fps) — no maker BC.

## Not sourced

- **5.7x28** — omitted entirely. MV and barrel are published (Federal AE5728A 1655 fps / 4.8"; Hornady 40gr V-MAX 90001 and FTX 90000 1810 fps / 4.8"; Speer Gold Dot 25728GD 1800 fps / 5"; FN SS197SR 1738 fps pistol), but no maker page or catalogue reachable gives a BC for any 5.7 load or for the 40gr V-MAX / Gold Dot bullets (the Speer 2024 catalogue lists the load without a BC; Hornady bullet pages don't render BC; hornady.com/bc only covers ELD/A-Tip). Add it once a maker BC turns up.

## Per-calibre assumptions (not maker data)

`sight_height`, `zero`, `max`, `step`, `fps_per_in` and `twist` are app defaults, not maker figures. `barrel` is the maker's stated test barrel where one is stated; where the maker does not state it (Federal rifle/shotshell/rimfire, CCI, Remington) the conventional 24" is entered and the `about` line says so.
