/* ============ 2D technical illustration kit ============
   One drawing language for every diagram: graphite outlines, realistic material fills,
   section hatching, centre lines and numbered callouts. Everything returns SVG strings.
   Local drawing convention: axial parts start at x = 0 on the axis y = 0 and run to +x (or +y when vertical). */
/* Technical illustration on a white sheet: graphite outlines, realistic material shading, soft shadows. */
const DSHEET = "#ffffff";
const DK = { ink: "#26292c", fine: "#55595e", center: "#7a8792", hidden: "#8b949b", call: "#26292c", arrow: "#d0892e" };
const DMAT = {
  chrome: ["#f5f7f8", "#dfe4e7", "#a7b0b7", "#eef1f3", "#bcc4ca"], alu: ["#e3e2dc", "#cfcec7", "#b5b4ac", "#d8d7d0", "#c1c0b9"],
  cast: ["#d2d0c8", "#c2c0b8", "#a9a79f", "#c9c7bf", "#b6b4ac"], steel: ["#d6dade", "#bcc2c7", "#959ca3", "#c8cdd1", "#a8afb5"],
  dark: ["#7d848b", "#61686f", "#454b51", "#5b6269", "#4c5258"], black: ["#4a4d51", "#2e3134", "#1d1f22", "#2a2d30", "#232528"],
  rubber: ["#3a3c3e", "#2a2c2e", "#1c1d1f", "#262829", "#202123"], brass: ["#ecd39a", "#d5b26a", "#a98538", "#cfac62", "#b8933f"],
  friction: ["#8a7458", "#76624a", "#5c4b37", "#6f5c45", "#64523d"], spring: ["#80878e", "#5f666d", "#3e444a", "#596067", "#4a5056"],
  zinc: ["#e9e6d8", "#d4d0bd", "#aaa690", "#cfcbb6", "#bdb9a3"], paint: ["#5b6e8f", "#3e5274", "#273a58", "#3a4e70", "#2f4263"],
};
function dkDefs() {
  const g = (id, c, vert) => `<linearGradient id="${id}" x1="0" y1="0" x2="${vert ? 1 : 0}" y2="${vert ? 0 : 1}">${[0, .28, .55, .78, 1].map((o, i) => `<stop offset="${o}" stop-color="${c[i]}"/>`).join("")}</linearGradient>`;
  const hatch = (id, gap, col, w, ang = 45, bg = "none") => `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${ang})">${bg !== "none" ? `<rect width="${gap}" height="${gap}" fill="${bg}"/>` : ""}<line x1="0" y1="0" x2="0" y2="${gap}" stroke="${col}" stroke-width="${w}"/></pattern>`;
  const halo = (id, col) => `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="2.4" result="d"/><feFlood flood-color="${col}"/><feComposite in2="d" operator="in" result="h"/><feMerge><feMergeNode in="h"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  return `<defs>${Object.entries(DMAT).map(([k, c]) => g("gH-" + k, c, false) + g("gV-" + k, c, true)).join("")}
    ${hatch("h-steel", 5, "#4a4f55", .7, 45, "#e9ecee")}${hatch("h-alu", 7, "#7d7b74", .6, 45, "#eeede8")}${hatch("h-cast", 7, "#7d7b74", .6, 45, "#e7e5df")}${hatch("h-brass", 5, "#9a7a33", .6, 45, "#f3e6c6")}
    ${hatch("h-rubber", 3.5, "#1d1f21", 1, 45, "#53575b")}${hatch("h-bronze", 5, "#8a6a3a", .6, -45, "#efe2cc")}${hatch("h-friction", 4, "#5c4b37", .9, 45, "#b8a383")}
    ${Object.entries(DMAT).map(([k, c]) => `<radialGradient id="gR-${k}" cx=".36" cy=".32" r=".75"><stop offset="0" stop-color="${c[3]}"/><stop offset=".08" stop-color="${c[0]}"/><stop offset=".55" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></radialGradient><linearGradient id="gD-${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset=".5" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></linearGradient>`).join("")}
    <filter id="f-shadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
    ${halo("f-sel", "#2b6f9a")}${halo("f-hov", "#9dc8e2")}${halo("f-red", "#d9534f")}${halo("f-amber", "#d99b35")}${halo("f-green", "#398564")}${halo("f-gray", "#9aa5ab")}
    <marker id="m-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" fill="${DK.fine}"/></marker>
    <marker id="m-go" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0.5 L10,5 L0,9.5 L2.6,5 z" fill="${DK.arrow}"/></marker>
    <marker id="m-dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5"><circle cx="5" cy="5" r="3.2" fill="${DK.ink}"/></marker></defs>`;
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
