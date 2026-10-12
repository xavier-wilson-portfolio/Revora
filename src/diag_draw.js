/* ============ 2D technical illustration kit ============
   One drawing language for every diagram: graphite outlines, realistic material fills,
   section hatching, centre lines and numbered callouts. Everything returns SVG strings.
   Local drawing convention: axial parts start at x = 0 on the axis y = 0 and run to +x (or +y when vertical). */
/* Drafting-sheet theme: blueprint-style linework on a dark graphite sheet (not blueprint blue).
   Light outlines, quiet material tints, ice-blue callouts and amber assembly arrows. */
const DSHEET = "#161d22", DGRID = "#1e282e", DGRID2 = "#26333a";
const DK = { ink: "#d9e5eb", fine: "#9db2bc", center: "#6e8a96", hidden: "#7f97a2", call: "#8cc0de", arrow: "#e3a857" };
const DMAT = {
  chrome: ["#43535c", "#394851", "#2d3a42", "#3f4f58", "#33424a"], alu: ["#3f4a4c", "#364144", "#2c3638", "#3a4547", "#313c3e"],
  cast: ["#3b4446", "#333c3e", "#2a3234", "#373f42", "#2f383a"], steel: ["#3e4b53", "#35424a", "#2b363d", "#3a474f", "#303c43"],
  dark: ["#2f3940", "#283238", "#202930", "#2b353c", "#242e34"], black: ["#252d33", "#1f262b", "#191f24", "#222a2f", "#1c2328"],
  rubber: ["#232a2f", "#1d2328", "#171c20", "#20272b", "#1a2024"], brass: ["#57503a", "#4b4532", "#3e392a", "#524b37", "#46402f"],
  friction: ["#4d4237", "#433a30", "#383028", "#493f35", "#3e352d"], spring: ["#3a4850", "#323f46", "#29343b", "#36434b", "#2e3a41"],
  zinc: ["#47504d", "#3e4744", "#343c3a", "#434c49", "#394240"], paint: ["#2f4560", "#283b54", "#213247", "#2c415a", "#25384e"],
};
function dkDefs() {
  const g = (id, c, vert) => `<linearGradient id="${id}" x1="0" y1="0" x2="${vert ? 1 : 0}" y2="${vert ? 0 : 1}">${[0, .28, .55, .78, 1].map((o, i) => `<stop offset="${o}" stop-color="${c[i]}"/>`).join("")}</linearGradient>`;
  const hatch = (id, gap, col, w, ang = 45, bg = "none") => `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${ang})">${bg !== "none" ? `<rect width="${gap}" height="${gap}" fill="${bg}"/>` : ""}<line x1="0" y1="0" x2="0" y2="${gap}" stroke="${col}" stroke-width="${w}"/></pattern>`;
  const halo = (id, col) => `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="2.4" result="d"/><feFlood flood-color="${col}"/><feComposite in2="d" operator="in" result="h"/><feMerge><feMergeNode in="h"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  return `<defs>${Object.entries(DMAT).map(([k, c]) => g("gH-" + k, c, false) + g("gV-" + k, c, true)).join("")}
    ${hatch("h-steel", 5, "#7f97a2", .7, 45, "#25313a")}${hatch("h-alu", 7, "#71878f", .6, 45, "#26302f")}${hatch("h-cast", 7, "#71878f", .6, 45, "#262e30")}${hatch("h-brass", 5, "#a8925e", .6, 45, "#353022")}
    ${hatch("h-rubber", 3.5, "#56646c", 1, 45, "#1c2226")}${hatch("h-bronze", 5, "#a08562", .6, -45, "#332b22")}${hatch("h-friction", 4, "#9a8466", .9, 45, "#3a3128")}
    <pattern id="p-grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M20,0V100M40,0V100M60,0V100M80,0V100M0,20H100M0,40H100M0,60H100M0,80H100" stroke="${DGRID}" stroke-width=".6"/><path d="M0,0V100M0,0H100" stroke="${DGRID2}" stroke-width="1"/></pattern>
    ${halo("f-sel", "#2b6f9a")}${halo("f-hov", "#9dc8e2")}${halo("f-red", "#d9534f")}${halo("f-amber", "#d99b35")}${halo("f-green", "#398564")}${halo("f-gray", "#9aa5ab")}
    <marker id="m-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" fill="${DK.fine}"/></marker>
    <marker id="m-go" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0.5 L10,5 L0,9.5 L2.6,5 z" fill="${DK.arrow}"/></marker>
    <marker id="m-dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5"><circle cx="5" cy="5" r="3.2" fill="${DK.call}"/></marker></defs>`;
}
const _o = (w = 1.1) => `stroke="${DK.ink}" stroke-width="${w}" stroke-linejoin="round"`;
/* basic shapes */
const dRect = (x, y, w, h, fill, r = 0, sw = 1.1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${_o(sw)}/>`;
const dPath = (d, fill = "none", sw = 1.1) => `<path d="${d}" fill="${fill}" ${_o(sw)}/>`;
const dLine = (x1, y1, x2, y2, sw = .7, col = DK.fine) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${sw}"/>`;
const dCenterH = (y, x1, x2) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${DK.center}" stroke-width=".6" stroke-dasharray="14 3 2 3"/>`;
const dCenterV = (x, y1, y2) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${DK.center}" stroke-width=".6" stroke-dasharray="14 3 2 3"/>`;
const dHidden = (d) => `<path d="${d}" fill="none" stroke="${DK.hidden}" stroke-width=".7" stroke-dasharray="4 2.5"/>`;
const dCircle = (cx, cy, r, fill, sw = 1.1) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${_o(sw)}/>`;
const mat = (m, vert) => `url(#g${vert ? "V" : "H"}-${m})`;
/* axial parts (axis along +x, centred on y = 0) */
const tubeH = (len, d, m = "steel", x = 0) => dRect(x, -d / 2, len, d, mat(m)) + dLine(x + 2, -d / 2 + d * .22, x + len - 2, -d / 2 + d * .22, .5, "rgba(255,255,255,.75)");
const tubeV = (len, d, m = "steel", y = 0) => dRect(-d / 2, y, d, len, mat(m, true)) + dLine(-d / 2 + d * .22, y + 2, -d / 2 + d * .22, y + len - 2, .5, "rgba(255,255,255,.75)");
function threadH(x, len, d, pitch = 3) { let s = ""; for (let i = x + 2; i < x + len - 1; i += pitch) s += dLine(i, -d / 2, i + pitch * .55, d / 2, .45, DK.fine); return s; }
function threadV(y, len, d, pitch = 3) { let s = ""; for (let i = y + 2; i < y + len - 1; i += pitch) s += dLine(-d / 2, i, d / 2, i + pitch * .55, .45, DK.fine); return s; }
function springH(len, d, coils, wire = 3, m = "spring", x = 0) {
  const p = len / coils; let back = "", front = "";
  for (let i = 0; i < coils; i++) { const x0 = x + i * p; back += `<line x1="${x0 + p * .5}" y1="${-d / 2}" x2="${x0 + p}" y2="${d / 2}" stroke="#6f767c" stroke-width="${wire * .8}" stroke-linecap="round"/>`; front += `<line x1="${x0}" y1="${d / 2}" x2="${x0 + p * .5}" y2="${-d / 2}" stroke="${DK.ink}" stroke-width="${wire + 1.2}" stroke-linecap="round"/><line x1="${x0}" y1="${d / 2}" x2="${x0 + p * .5}" y2="${-d / 2}" stroke="${DMAT[m][1]}" stroke-width="${wire}" stroke-linecap="round"/>`; }
  return back + front + dRect(x - wire / 2, -d / 2, wire, d, mat(m)) + dRect(x + len - wire / 2, -d / 2, wire, d, mat(m));
}
function springV(len, d, coils, wire = 3, m = "spring") {
  const p = len / coils; let back = "", front = "";
  for (let i = 0; i < coils; i++) { const y0 = i * p; back += `<line x1="${-d / 2}" y1="${y0 + p * .5}" x2="${d / 2}" y2="${y0 + p}" stroke="#6f767c" stroke-width="${wire * .8}" stroke-linecap="round"/>`; front += `<line x1="${d / 2}" y1="${y0}" x2="${-d / 2}" y2="${y0 + p * .5}" stroke="${DK.ink}" stroke-width="${wire + 1.2}" stroke-linecap="round"/><line x1="${d / 2}" y1="${y0}" x2="${-d / 2}" y2="${y0 + p * .5}" stroke="${DMAT[m][1]}" stroke-width="${wire}" stroke-linecap="round"/>`; }
  return back + front;
}
const hexH = (w, h, m = "zinc", x = 0) => dRect(x, -h / 2, w, h, mat(m), 1.5) + dLine(x, -h / 6, x + w, -h / 6, .6) + dLine(x, h / 6, x + w, h / 6, .6);
const hexV = (w, h, m = "zinc", y = 0) => dRect(-w / 2, y, w, h, mat(m, true), 1.5) + dLine(-w / 6, y, -w / 6, y + h, .6) + dLine(w / 6, y, w / 6, y + h, .6);
const washerH = (t, d, m = "zinc", x = 0) => dRect(x, -d / 2, t, d, mat(m), .8);
const washerV = (t, d, m = "zinc", y = 0) => dRect(-d / 2, y, d, t, mat(m, true), .8);
const oringH = (t, d, x = 0) => dRect(x, -d / 2, t, d, mat("rubber"), t / 2);
const oringV = (t, d, y = 0) => dRect(-d / 2, y, d, t, mat("rubber", true), t / 2);
const boltH = (headW, headH, len, d, m = "zinc") => hexH(headW, headH, m) + dRect(headW, -d / 2, len, d, mat(m)) + threadH(headW + len * .35, len * .65, d);
const boltV = (headW, headH, len, d, m = "zinc") => hexV(headW, headH, m) + dRect(-d / 2, headH, d, len, mat(m, true)) + threadV(headH + len * .35, len * .65, d);
const allenBoltH = (headL, headD, len, d) => dRect(0, -headD / 2, headL, headD, mat("black"), 2) + dRect(headL * .25, -headD * .22, headL * .5, headD * .44, "#141516", 1, .6) + dRect(headL, -d / 2, len, d, mat("black")) + threadH(headL + len * .3, len * .7, d);
/* section (cut) shapes */
const secRect = (x, y, w, h, hatch = "h-steel", sw = 1.1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${hatch})" ${_o(sw)}/>`;
const secPath = (d, hatch = "h-steel", sw = 1.1) => `<path d="${d}" fill="url(#${hatch})" ${_o(sw)}/>`;
/* labels used inside drawings (dimension-style notes) */
const dNote = (x, y, txt, anchor = "start", size = 11) => `<text x="${x}" y="${y}" font-family="Inter,Arial,Helvetica,sans-serif" font-size="${size}" fill="${DK.ink}" text-anchor="${anchor}">${esc(String(txt))}</text>`;
const dArrow = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${DK.fine}" stroke-width=".8" marker-end="url(#m-arrow)"/>`;
const dDim = (x1, y, x2, label) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${DK.fine}" stroke-width=".7" marker-start="url(#m-arrow)" marker-end="url(#m-arrow)"/>${dNote((x1 + x2) / 2, y - 5, label, "middle", 10.5)}`;
