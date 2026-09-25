/* Rangefolio target registry.

   One definition per target type: its size in inches, a viewBox, the SVG
   zones (every tappable shape carries data-z = a | c | d | miss, and
   data-head="1" on the head), and where the default point of aim sits.
   The Log page's target pane, the camera overlay and the photo scorer all
   draw from here, so a tap on any of them yields the same {zone, x, y}.

   Coordinates stored on a run are normalised to the viewBox (0..1 in x and
   y), so they survive a redraw at any size and can be turned back into
   inches with inW / inH. Zones map onto A / C / D / miss - the app's one
   scoring vocabulary - whatever the target prints on itself:
     IDPA  -0 → A, -1 → C, -3 → D
     B-8   X/10/9 → A, 8/7 → C, anything else on the card → D
*/
(() => {
"use strict";

const T = {};

// USPSA / IPSC metric silhouette. 18 in wide; the drawing is 27.6 in tall.
T.uspsa = { key: "uspsa", name: "USPSA metric", short: "USPSA", vb: [300, 460], inW: 18, inH: 27.6, poa: [150, 209], head: true,
  zones: "A · C · D, head A/C",
  svg: () => `
    <rect data-z="miss" x="0" y="0" width="300" height="460" rx="14" fill="#B58F63"/>
    <rect x="0" y="0" width="300" height="460" rx="14" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="2"/>
    <text class="lab card" x="18" y="446">MISS · TAP OFF THE TARGET</text>
    <path data-z="d" fill="#8E3B31" stroke="#1E1414" stroke-width="2" d="M113 74 H187 V98 H216 L246 122 V300 L232 434 H68 L54 300 V122 L84 98 H113 Z"/>
    <path data-z="c" fill="#3E4358" stroke="#1E1414" stroke-width="1.5" stroke-dasharray="4 3" d="M113 74 H187 V112 H208 L226 140 V318 L212 370 H88 L74 318 V140 L92 112 H113 Z"/>
    <rect data-z="a" x="120" y="150" width="60" height="118" rx="5" fill="#4E7A34" stroke="#1E1414" stroke-width="1.5" stroke-dasharray="4 3"/>
    <rect data-z="c" data-head="1" x="113" y="14" width="74" height="62" rx="4" fill="#3E4358" stroke="#1E1414" stroke-width="2"/>
    <rect data-z="a" data-head="1" x="128" y="24" width="44" height="26" rx="3" fill="#4E7A34" stroke="#1E1414" stroke-width="1.2" stroke-dasharray="3 2"/>
    <text class="lab" x="146" y="42">A</text><text class="lab" x="146" y="215">A</text>
    <text class="lab" x="98" y="215">C</text><text class="lab" x="194" y="215">C</text>
    <text class="lab" x="60" y="215">D</text><text class="lab" x="232" y="215">D</text>`,
  outline: () => `
    <path d="M113 74 H187 V98 H216 L246 122 V300 L232 434 H68 L54 300 V122 L84 98 H113 Z"/>
    <path d="M113 74 H187 V112 H208 L226 140 V318 L212 370 H88 L74 318 V140 L92 112 H113 Z"/>
    <rect x="120" y="150" width="60" height="118" rx="5"/>
    <rect x="113" y="14" width="74" height="62" rx="4"/><rect x="128" y="24" width="44" height="26" rx="3"/>` };

// IDPA silhouette. 18 in wide, 30 in tall; -0 is an 8 in circle in the
// chest and a 4 in circle in the head, -1 the inner silhouette, -3 the rest.
T.idpa = { key: "idpa", name: "IDPA", short: "IDPA", vb: [300, 500], inW: 18, inH: 30, poa: [150, 250], head: true,
  zones: "-0 → A · -1 → C · -3 → D",
  svg: () => `
    <rect data-z="miss" x="0" y="0" width="300" height="500" rx="14" fill="#B58F63"/>
    <rect x="0" y="0" width="300" height="500" rx="14" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="2"/>
    <text class="lab card" x="18" y="486">MISS · TAP OFF THE TARGET</text>
    <path data-z="d" fill="#8E3B31" stroke="#1E1414" stroke-width="2" d="M150 14 C190 14 210 40 210 80 L210 120 L260 150 L260 470 L40 470 L40 150 L90 120 L90 80 C90 40 110 14 150 14 Z"/>
    <path data-z="c" fill="#3E4358" stroke="#1E1414" stroke-width="1.5" stroke-dasharray="4 3" d="M150 30 C180 30 195 52 195 85 L195 132 L232 156 L232 440 L68 440 L68 156 L105 132 L105 85 C105 52 120 30 150 30 Z"/>
    <circle data-z="a" cx="150" cy="250" r="67" fill="#4E7A34" stroke="#1E1414" stroke-width="1.5" stroke-dasharray="4 3"/>
    <circle data-z="a" data-head="1" cx="150" cy="78" r="33" fill="#4E7A34" stroke="#1E1414" stroke-width="1.5" stroke-dasharray="4 3"/>
    <text class="lab" x="140" y="256">-0</text><text class="lab" x="140" y="84">-0</text>
    <text class="lab" x="140" y="400">-1</text><text class="lab" x="46" y="300">-3</text><text class="lab" x="236" y="300">-3</text>`,
  outline: () => `
    <path d="M150 14 C190 14 210 40 210 80 L210 120 L260 150 L260 470 L40 470 L40 150 L90 120 L90 80 C90 40 110 14 150 14 Z"/>
    <path d="M150 30 C180 30 195 52 195 85 L195 132 L232 156 L232 440 L68 440 L68 156 L105 132 L105 85 C105 52 120 30 150 30 Z"/>
    <circle cx="150" cy="250" r="67"/><circle cx="150" cy="78" r="33"/>` };

// B-8 repair centre, 10.5 in square. Rings from the NRA spec (diameters,
// inches): X 1.695, 10 3.36, 9 5.54, 8 8.00, 7 11.0 (clipped by the card).
T.b8 = (() => {
  const k = 300 / 10.5, c = 150;
  const r = d => (d / 2 * k).toFixed(1);
  return { key: "b8", name: "B-8 bullseye", short: "B-8", vb: [300, 300], inW: 10.5, inH: 10.5, poa: [150, 150], head: false,
    zones: "X/10/9 → A · 8/7 → C · rest → D",
    svg: () => `
      <rect data-z="miss" x="0" y="0" width="300" height="300" rx="10" fill="#E9E4D8"/>
      <rect x="0" y="0" width="300" height="300" rx="10" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="2"/>
      <text class="lab card" x="14" y="290">MISS · TAP OFF THE CARD</text>
      <circle data-z="d" cx="${c}" cy="${c}" r="${r(11)}" fill="#D9D2C2" stroke="#8A8272" stroke-width="1"/>
      <circle data-z="c" cx="${c}" cy="${c}" r="${r(8)}" fill="#CFC7B4" stroke="#8A8272" stroke-width="1"/>
      <circle data-z="a" cx="${c}" cy="${c}" r="${r(5.54)}" fill="#1E1E1E" stroke="#000" stroke-width="1"/>
      <circle cx="${c}" cy="${c}" r="${r(3.36)}" fill="none" stroke="#777" stroke-width="1" pointer-events="none"/>
      <circle cx="${c}" cy="${c}" r="${r(1.695)}" fill="none" stroke="#999" stroke-width="1" pointer-events="none"/>
      <text class="lab" x="${c - 6}" y="${c - r(4.4)}" style="font-size:12px">9</text>
      <text class="lab" x="${c - 6}" y="${c - r(6.8)}" style="font-size:12px;fill:#5A5347;stroke:none">8</text>
      <text class="lab" x="${c - 6}" y="${c - r(9.6)}" style="font-size:12px;fill:#5A5347;stroke:none">7</text>`,
    outline: () => `<circle cx="${c}" cy="${c}" r="${r(8)}"/><circle cx="${c}" cy="${c}" r="${r(5.54)}"/><circle cx="${c}" cy="${c}" r="${r(3.36)}"/><rect x="2" y="2" width="296" height="296" rx="10"/>` };
})();

// An 8 in steel plate (or a paper plate). Hit or miss.
T.plate = { key: "plate", name: "8-inch plate", short: "Plate", vb: [300, 300], inW: 10, inH: 10, poa: [150, 150], head: false,
  zones: "on the plate → A · off → miss",
  svg: () => `
    <rect data-z="miss" x="0" y="0" width="300" height="300" rx="10" fill="#7B8594" fill-opacity=".35"/>
    <text class="lab card" x="14" y="290">MISS · TAP OFF THE PLATE</text>
    <circle data-z="a" cx="150" cy="150" r="120" fill="#C9CDD3" stroke="#3A3F47" stroke-width="3"/>
    <circle cx="150" cy="150" r="6" fill="none" stroke="#3A3F47" stroke-width="1.5" pointer-events="none"/>`,
  outline: () => `<circle cx="150" cy="150" r="120"/>` };

const ORDER = ["uspsa", "idpa", "b8", "plate"];

function get(k) { return T[k] || T.uspsa; }
// The full tappable SVG for a target, with a holes layer and a point-of-aim marker layer on top.
function svgMarkup(k) {
  const t = get(k);
  return `<svg viewBox="0 0 ${t.vb[0]} ${t.vb[1]}" role="img" data-target="${t.key}">${t.svg()}<g class="holes"></g><g class="poaMark"></g></svg>`;
}
// Just the outline, for the camera overlay: white strokes, no fill.
function overlayMarkup(k) {
  const t = get(k);
  return `<svg viewBox="0 0 ${t.vb[0]} ${t.vb[1]}" data-target="${t.key}" preserveAspectRatio="xMidYMid meet"><g fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.5" stroke-dasharray="6 4">${t.outline()}<rect x="1" y="1" width="${t.vb[0] - 2}" height="${t.vb[1] - 2}" rx="12" stroke-dasharray="none" stroke="rgba(232,163,61,.9)" stroke-width="3"/></g></svg>`;
}
// viewBox units -> inches from the point of aim (x right, y UP, like a group plot).
function toInches(k, nx, ny, poa) {
  const t = get(k), p = poa || { x: t.poa[0] / t.vb[0], y: t.poa[1] / t.vb[1] };
  return { x: (nx - p.x) * t.inW, y: -(ny - p.y) * t.inH };
}
function defaultPoa(k) { const t = get(k); return { x: t.poa[0] / t.vb[0], y: t.poa[1] / t.vb[1] }; }

window.RF_TARGETS = { get, list: () => ORDER.map(k => T[k]), svgMarkup, overlayMarkup, toInches, defaultPoa, ORDER };
})();
