/* ============ Catalogue diagrams: one per CMSNL parts-list page ============
   CMS_DATA (injected by the build from data/cms/*.json) holds every row of every page.
   Pages that already have a hand-drawn diagram keep it; every other page gets a generated
   exploded diagram: one drawn item per catalogue ref, shaped from the catalogue name, laid out
   in catalogue order (or at the positions in CMS_POS once a page is matched to its CMSNL picture),
   with ref callouts and amber arrows showing which way each part goes on. */
const CMS_SITE = "https://www.cmsnl.com/suzuki-gs750-1977-b-usa-e03_model34273/partslist/";
const CMS_HAND = { BLCK0030: "DG-CH-01", BLCK0028: "DG-BR-01", BLCK0034: "DG-CH-02", BLCK0004: "DG-EN-01", BLCK0016: "DG-EN-02", BLCK0009: "DG-EN-03", BLCK0005: "DG-FU-01", BLCK0077: "DG-EL-01" };
/* Positions matched to the CMSNL pictures: { BLCK0001: { "1": [x, y], ... } } in a 1200-wide sheet. Filled page by page. */
const CMS_POS = {};
const CMS_SYS = [
  ["Engine", /CAM |CAM-|CAM SHAFT|CHAIN CASE|CLUTCH|CRANC|CRANK|CYLINDER|OIL P|TRANSMISSION|GEAR SHIFT|KICK|STARTER CLUTCH|MUFFLER/],
  ["Fuel & air", /AIR CLEANER|CARBURETOR|FUEL/],
  ["Electrical", /BATTERY|CONTACT BREAKER|ELECTRICAL|GENERATOR|HEADLAMP|HANDLE SWITCH|COMBINATION LAMP|SPEEDOMETER|STARTING MOTOR|TURN SIGNAL|WIRING/],
  ["Brakes", /BRAKE HOSE|CARIPER|CALIPER|MASTER CYLINDER/],
  ["Chassis", /FRAME|FORK|WHEEL|SWINGING ARM|STEERING|STAND|FOOTREST|HANDLEBAR/],
  ["Body", /FENDER|SEAT|COVER/],
];
const cmsSystem = t => (CMS_SYS.find(([, re]) => re.test(t)) || ["Body"])[0];
const cmsTitle = t => t.replace(/\s*\(GS750[^)]*\)?\s*$/, "").replace(/FRANE/, "FRAME").replace(/CRANCASE/, "CRANKCASE").replace(/STEERING STEN/, "STEERING STEM").replace(/CARIPERS/, "CALIPERS")
  .toLowerCase().replace(/(^|[\s-])\w/g, m => m.toUpperCase()).replace(/\bRh\b/g, "Right").replace(/\bLh\b/g, "Left");
function cmsModels(t) { const m = t.match(/\(([^)]*)\)?/); if (!m) return "All 1977 GS750"; const s = m[1].replace(/\.{2,}.*/, "").trim(); return s.replace(/\./g, ", "); }
const CMS_WORDS = { FR: "front", RR: "rear", LH: "left", RH: "right", ASSY: "assembly", COMP: "complete", CVR: "cover", SWGARM: "swing arm", WHL: "wheel", INR: "inner", OTR: "outer", CYL: "cylinder", MAG: "magneto", SW: "switch", BRKT: "bracket", "L.H": "left", "R.H": "right", HEAD: "head", NO: "no." };
function cmsName(desc) {
  let s = String(desc || "").replace(/\(NAS\)/g, "").replace(/\s+/g, " ").trim();
  if (!s || /NO PRODUCT DESCRIPTION/.test(s) || /^\d{5}-\d{5}/.test(s)) return "Part (no description in the catalogue)";
  const bits = s.split(",").map(b => b.trim()).filter(Boolean);
  // "SPACER,FR HUB BEARING" -> "Front hub bearing spacer"
  let name = bits.length > 1 ? bits.slice(1).join(" ") + " " + bits[0] : bits[0];
  name = name.split(" ").map(w => CMS_WORDS[w] || w.toLowerCase()).join(" ").replace(/(\d+)x(\d+)/gi, "$1 × $2");
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/* ---------- shape library (drafting style). Each returns { w, h, draw } in a box x 0..w, y -h/2..h/2 ---------- */
const sz = (desc, def) => { const m = String(desc).match(/(\d+(?:\.\d+)?)\s*X\s*(\d+(?:\.\d+)?)/i); return m ? [+m[1], +m[2]] : def; };
const outline = (d, fill = mat("steel"), sw = 1.1) => dPath(d, fill, sw);
const holes = (pts, r = 3) => pts.map(([x, y]) => dCircle(x, y, r, DSHEET, .8)).join("");
const SHAPES = {
  bolt(desc) { const [d, l] = sz(desc, [8, 25]); const dd = Math.max(6, d * 1.4), L = Math.min(110, Math.max(26, l * 1.6)), hw = dd * .9, hh = dd * 1.7;
    return { w: hw + L, h: hh, draw: () => hexH(hw, hh, "zinc") + dRect(hw, -dd / 2, L, dd, mat("zinc")) + threadH(hw + L * .35, L * .65, dd) }; },
  screw(desc) { const [d, l] = sz(desc, [5, 16]); const dd = Math.max(5, d * 1.3), L = Math.min(80, Math.max(18, l * 1.6));
    return { w: dd * 1.1 + L, h: dd * 2.2, draw: () => dPath(`M${dd * 1.1},${-dd * 1.1} Q0,${-dd * 1.1} 0,0 Q0,${dd * 1.1} ${dd * 1.1},${dd * 1.1} Z`, mat("zinc")) + dLine(dd * .25, -dd * .5, dd * .25, dd * .5, 1, DK.fine) + dRect(dd * 1.1, -dd / 2, L, dd, mat("zinc")) + threadH(dd * 1.1 + 2, L - 2, dd) }; },
  stud(desc) { const [d, l] = sz(desc, [8, 30]); const dd = Math.max(6, d * 1.3), L = Math.min(120, Math.max(30, l * 1.7));
    return { w: L, h: dd + 4, draw: () => dRect(0, -dd / 2, L, dd, mat("steel")) + threadH(0, L * .35, dd) + threadH(L * .6, L * .4, dd) }; },
  nut() { const r = 11, pts = Array.from({ length: 6 }, (_, i) => [r + r * Math.cos(Math.PI / 3 * i), r * Math.sin(Math.PI / 3 * i)]);
    return { w: r * 2, h: r * 2, draw: () => `<polygon points="${pts.map(p => p.map(v => v.toFixed(1)).join(",")).join(" ")}" fill="${mat("zinc")}" stroke="${DK.ink}" stroke-width="1.1"/>` + dCircle(r, 0, r * .48, DSHEET, .9) + `<circle cx="${r}" cy="0" r="${r * .62}" fill="none" stroke="${DK.fine}" stroke-width=".5" stroke-dasharray="2 1.5"/>` }; },
  washer(desc, lock) { const [a, b] = sz(desc, [8, 16]); const R = Math.min(30, Math.max(9, (b || 16) * .7)), r = Math.max(4, R * ((a || 8) / (b || 16)));
    return { w: R * 2, h: R * 2, draw: () => `<circle cx="${R}" cy="0" r="${R}" fill="${mat(lock ? "spring" : "zinc")}" stroke="${DK.ink}" stroke-width="1.1"/>` + dCircle(R, 0, r, DSHEET, .9) + (lock ? `<rect x="${R - 2}" y="${-R - 1}" width="4" height="${R - r + 2}" fill="${DSHEET}"/>` : "") }; },
  oring() { const R = 16; return { w: R * 2, h: R * 2, draw: () => `<circle cx="${R}" cy="0" r="${R - 2.5}" fill="none" stroke="${DK.ink}" stroke-width="6"/><circle cx="${R}" cy="0" r="${R - 2.5}" fill="none" stroke="${DMAT.rubber[0]}" stroke-width="3.6"/>` }; },
  gasketRing(desc) { const [a, b] = sz(desc, [10, 16]); const R = Math.min(26, Math.max(10, b * .9)), r = Math.max(4, R * a / b);
    return { w: R * 2, h: R * 2, draw: () => `<circle cx="${R}" cy="0" r="${R}" fill="${mat("brass")}" stroke="${DK.ink}" stroke-width="1"/>` + dCircle(R, 0, r, DSHEET, .9) }; },
  gasket() { const w = 130, h = 70; return { w, h, draw: () => `<path d="M14,${-h / 2} H${w - 14} Q${w},${-h / 2} ${w},${-h / 2 + 14} V${h / 2 - 14} Q${w},${h / 2} ${w - 14},${h / 2} H14 Q0,${h / 2} 0,${h / 2 - 14} V${-h / 2 + 14} Q0,${-h / 2} 14,${-h / 2} Z M20,${-h / 2 + 12} H${w - 20} V${h / 2 - 12} H20 Z" fill="${mat("brass")}" fill-rule="evenodd" stroke="${DK.ink}" stroke-width="1"/>` + holes([[7, -h / 2 + 7], [w - 7, -h / 2 + 7], [7, h / 2 - 7], [w - 7, h / 2 - 7], [w / 2, -h / 2 + 6], [w / 2, h / 2 - 6]], 2.2) }; },
  seal() { const R = 20; return { w: R * 2, h: R * 2, draw: () => `<circle cx="${R}" cy="0" r="${R}" fill="${mat("rubber")}" stroke="${DK.ink}" stroke-width="1.1"/><circle cx="${R}" cy="0" r="${R - 3}" fill="none" stroke="${DK.fine}" stroke-width=".8"/>` + dCircle(R, 0, R * .5, DSHEET, .9) + `<circle cx="${R}" cy="0" r="${R * .62}" fill="none" stroke="${DK.call}" stroke-width=".8" stroke-dasharray="1.5 1.5"/>` }; },
  bearing() { const R = 24; return { w: R * 2, h: R * 2, draw: () => `<circle cx="${R}" cy="0" r="${R}" fill="${mat("steel")}" stroke="${DK.ink}" stroke-width="1.1"/>` + dCircle(R, 0, R * .74, mat("dark"), .8) + Array.from({ length: 10 }, (_, i) => { const a = i / 10 * Math.PI * 2; return dCircle(R + Math.cos(a) * R * .74, Math.sin(a) * R * .74, R * .15, mat("chrome"), .7); }).join("") + dCircle(R, 0, R * .5, mat("steel"), .9) + dCircle(R, 0, R * .36, DSHEET, .9) }; },
  clip() { const R = 15; return { w: R * 2 + 4, h: R * 2 + 4, draw: () => `<path d="M${R + 2 + R * Math.cos(-1.2)},${R * Math.sin(-1.2)} A${R},${R} 0 1,0 ${R + 2 + R * Math.cos(-1.94)},${R * Math.sin(-1.94)}" fill="none" stroke="${DK.ink}" stroke-width="4.5" stroke-linecap="round"/><path d="M${R + 2 + R * Math.cos(-1.2)},${R * Math.sin(-1.2)} A${R},${R} 0 1,0 ${R + 2 + R * Math.cos(-1.94)},${R * Math.sin(-1.94)}" fill="none" stroke="${DMAT.spring[0]}" stroke-width="2.4" stroke-linecap="round"/>` }; },
  spring(desc) { const L = /VALVE|SMALL/.test(desc) ? 50 : 80; return { w: L, h: 26, draw: () => springH(L, 22, Math.round(L / 7), 2.4) }; },
  pin(desc) { const L = /COTTER/.test(desc) ? 34 : 40; return { w: L, h: 10, draw: () => /COTTER/.test(desc) ? dPath(`M6,-3 H${L} M6,3 H${L - 4}`, "none", 1.6) + `<circle cx="4" cy="0" r="4" fill="none" stroke="${DK.ink}" stroke-width="1.6"/>` : dRect(0, -4, L, 8, mat("steel"), 3) + dLine(L - 6, -4, L - 6, 4, .6) }; },
  sleeve(desc) { const [a, b] = sz(desc, [12, 20]); const L = Math.min(70, Math.max(16, (sz(desc, [0, 0, 0])[1] ? 24 : 26))), d = Math.min(46, Math.max(16, (b || 20) * 1.2));
    return { w: L, h: d, draw: () => dRect(0, -d / 2, L, d, mat("steel")) + dHidden(`M0,${-d * .28} H${L} M0,${d * .28} H${L}`) + dLine(2, -d / 2 + 3, L - 2, -d / 2 + 3, .5, "rgba(255,255,255,.25)") }; },
  cap() { return { w: 34, h: 30, draw: () => dPath("M4,-15 H30 Q34,-15 34,-11 V11 Q34,15 30,15 H4 Q0,15 0,11 V-11 Q0,-15 4,-15 Z", mat("black")) + dLine(10, -15, 10, 15, .6) + dLine(24, -15, 24, 15, .6) }; },
  plug() { return { w: 40, h: 22, draw: () => hexH(14, 22, "zinc") + dRect(14, -7, 26, 14, mat("zinc")) + threadH(16, 24, 14) }; },
  grommet() { const R = 15; return { w: R * 2, h: R * 2 + 8, draw: () => dRect(0, -R - 4, R * 2, 8, mat("rubber"), 3) + dRect(R * .35, -R + 4, R * 1.3, R * 1.6, mat("rubber"), 2) + dRect(0, R - 4, R * 2, 8, mat("rubber"), 3) + dHidden(`M${R},${-R - 4} V${R + 4}`) }; },
  cover(desc) { const big = /CRANKCASE|CASE,|HOUSING|PAN|TANK/.test(desc); const w = big ? 220 : 150, h = big ? 140 : 100;
    return { w, h, draw: () => outline(`M30,${-h / 2} H${w - 40} Q${w},${-h / 2} ${w},${-h / 2 + 34} V${h / 2 - 30} Q${w},${h / 2} ${w - 36},${h / 2} H34 Q0,${h / 2} 0,${h / 2 - 34} V${-h / 2 + 30} Q0,${-h / 2} 30,${-h / 2} Z`, mat("alu")) + outline(`M28,${-h / 2 + 18} H${w - 36} Q${w - 16},${-h / 2 + 18} ${w - 16},${-h / 2 + 40} V${h / 2 - 36} Q${w - 16},${h / 2 - 16} ${w - 38},${h / 2 - 16} H32 Q16,${h / 2 - 16} 16,${h / 2 - 34} V${-h / 2 + 36} Q16,${-h / 2 + 18} 28,${-h / 2 + 18} Z`, "none", .7) + holes([[12, -h / 2 + 22], [w - 14, -h / 2 + 26], [12, h / 2 - 22], [w - 14, h / 2 - 24], [w / 2, -h / 2 + 8], [w / 2, h / 2 - 8]], 3) }; },
  plate(desc) { const w = /BRACKET|STAY/.test(desc) ? 110 : 90, h = 54; return { w, h, draw: () => outline(`M0,${-h / 2 + 8} Q0,${-h / 2} 8,${-h / 2} H${w * .55} L${w},${-6} V${h / 2 - 8} Q${w},${h / 2} ${w - 8},${h / 2} H8 Q0,${h / 2} 0,${h / 2 - 8} Z`, mat("steel")) + holes([[14, -h / 2 + 12], [14, h / 2 - 12], [w - 14, h / 2 - 12]], 4) }; },
  gear(desc) { const R = /PRIMARY|DRIVEN|DRIVE GEAR|CLUTCH/.test(desc) ? 54 : /SPROCKET/.test(desc) ? 44 : 36, n = Math.round(R / 2.6);
    const pts = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rr = i % 2 ? R : R - 6; pts.push([R + Math.cos(a) * rr, Math.sin(a) * rr]); }
    return { w: R * 2, h: R * 2, draw: () => `<polygon points="${pts.map(p => p.map(v => v.toFixed(1)).join(",")).join(" ")}" fill="${mat("steel")}" stroke="${DK.ink}" stroke-width="1" stroke-linejoin="round"/>` + `<circle cx="${R}" cy="0" r="${R - 10}" fill="none" stroke="${DK.fine}" stroke-width=".7"/>` + dCircle(R, 0, R * .3, DSHEET, .9) }; },
  shaft(desc) { const L = /CAM|COUNTER|DRIVE|AXLE|SHAFT,GEAR|MAIN/.test(desc) ? 300 : 160, d = /AXLE/.test(desc) ? 18 : 22;
    return { w: L, h: d + 16, draw: () => tubeH(L, d, "steel") + (/CAM/.test(desc) ? [.18, .38, .62, .82].map(f => dPath(`M${L * f - 9},${-d / 2} Q${L * f},${-d / 2 - 14} ${L * f + 9},${-d / 2} Z`, mat("chrome"), .9)).join("") : [.3, .55].map(f => dRect(L * f, -d / 2 - 5, 16, d + 10, mat("steel"), 2, .9)).join("")) + axisLine(-8, L + 8) }; },
  hose(desc) { const L = /CABLE|WIRE|HARNESS|LEAD|CORD/.test(desc) ? 170 : 140, thick = /CABLE|WIRE|LEAD|CORD/.test(desc) ? 5 : 9;
    const path = `M6,10 C${L * .3},-34 ${L * .55},40 ${L - 6},-6`;
    return { w: L, h: 56, draw: () => `<path d="${path}" fill="none" stroke="${DK.ink}" stroke-width="${thick + 2.4}" stroke-linecap="round"/><path d="${path}" fill="none" stroke="${DMAT.rubber[0]}" stroke-width="${thick}" stroke-linecap="round"/>` + dRect(0, 4, 12, 12, mat("zinc"), 2) + dRect(L - 12, -12, 12, 12, mat("zinc"), 2) }; },
  harness() { return { w: 260, h: 110, draw: () => [[-14, "#6a8fa3"], [-5, "#a38f6a"], [4, "#7fa37a"], [13, "#a37a7a"]].map(([o, c]) => `<path d="M10,${o} C70,${o - 40} 130,${o + 40} 200,${o} L250,${o * 2.6}" fill="none" stroke="${c}" stroke-width="2.2"/>`).join("") + dRect(0, -20, 14, 40, mat("black"), 3) + dRect(246, -44, 12, 18, mat("black"), 2) + dRect(246, 24, 12, 18, mat("black"), 2) + dRect(120, -14, 18, 28, mat("rubber"), 3) }; },
  lamp(desc) { const R = /HEAD/.test(desc) ? 50 : 30; return { w: R * 2, h: R * 2, draw: () => `<circle cx="${R}" cy="0" r="${R}" fill="${mat("chrome")}" stroke="${DK.ink}" stroke-width="1.1"/>` + `<circle cx="${R}" cy="0" r="${R * .8}" fill="#2a3a42" stroke="${DK.fine}" stroke-width=".8"/>` + Array.from({ length: 5 }, (_, i) => dLine(R * .35, -R * .55 + i * R * .27, R * 1.65, -R * .55 + i * R * .27, .5, DK.fine)).join("") }; },
  lens(desc) { const w = 70, h = 46; return { w, h, draw: () => dRect(0, -h / 2, w, h, "#3b2c2a", 10) + Array.from({ length: 4 }, (_, i) => dLine(8 + i * 18, -h / 2 + 6, 8 + i * 18, h / 2 - 6, .5, "#8a6a60")).join("") }; },
  bulb() { return { w: 26, h: 40, draw: () => `<path d="M13,-20 C27,-20 27,2 19,8 V14 H7 V8 C-1,2 -1,-20 13,-20 Z" fill="#33434b" stroke="${DK.ink}" stroke-width="1"/>` + dRect(7, 14, 12, 6, mat("brass"), 1) + dPath("M9,-6 Q13,-12 17,-6", "none", .7) }; },
  unit(desc) { const w = /BATTERY/.test(desc) ? 120 : /REGULATOR|RECTIFIER|IGNITION|COIL/.test(desc) ? 90 : 64, h = /BATTERY/.test(desc) ? 80 : 50;
    return { w, h, draw: () => dRect(0, -h / 2, w, h, mat("black"), 5) + dRect(6, -h / 2 + 6, w - 12, h - 12, "none", 3, .6) + (/BATTERY/.test(desc) ? dRect(12, -h / 2 - 10, 14, 10, mat("zinc"), 1) + dRect(w - 26, -h / 2 - 10, 14, 10, mat("zinc"), 1) : [w * .3, w * .5, w * .7].map(x => dRect(x - 3, h / 2, 6, 10, mat("brass"), 1)).join("")) }; },
  switch(desc) { const w = 90, h = 56; return { w, h, draw: () => dPath(`M0,${-h / 2 + 10} Q0,${-h / 2} 12,${-h / 2} H${w - 12} Q${w},${-h / 2} ${w},${-h / 2 + 10} V${h / 2 - 6} H0 Z`, mat("black")) + dRect(16, -10, 18, 14, mat("dark"), 3) + dRect(48, -10, 26, 14, mat("dark"), 3) + dPath(`M${w / 2},${h / 2 - 6} C${w / 2},${h / 2 + 14} ${w / 2 + 30},${h / 2 + 6} ${w},${h / 2 + 18}`, "none", 2.2) }; },
  chain() { const n = 14; return { w: n * 12, h: 22, draw: () => Array.from({ length: n }, (_, i) => dRect(i * 12, -8, 16, 16, i % 2 ? mat("steel") : "none", 7, 1)).join("") + Array.from({ length: n + 1 }, (_, i) => dCircle(i * 12 + 4, 0, 2.6, mat("chrome"), .7)).join("") }; },
  lever(desc) { const L = /PEDAL/.test(desc) ? 140 : 120; return { w: L, h: 40, draw: () => dPath(`M0,-8 Q10,-14 20,-10 L${L - 6},${4} Q${L},8 ${L - 4},12 L18,10 Q4,10 0,4 Z`, mat("alu")) + dCircle(10, -1, 5, DSHEET, .8) }; },
  bar(desc) { const L = 240; return { w: L, h: 50, draw: () => `<path d="M6,20 L40,20 Q60,20 70,4 L90,-14 H150 L170,4 Q180,20 200,20 L234,20" fill="none" stroke="${DK.ink}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="M6,20 L40,20 Q60,20 70,4 L90,-14 H150 L170,4 Q180,20 200,20 L234,20" fill="none" stroke="${DMAT.chrome[0]}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>` }; },
  wheel(desc) { const R = /TIRE|TYRE/.test(desc) ? 90 : 80; return { w: R * 2, h: R * 2, draw: () => /TIRE|TYRE/.test(desc) ? `<circle cx="${R}" cy="0" r="${R}" fill="${mat("rubber")}" stroke="${DK.ink}" stroke-width="1.2"/>` + Array.from({ length: 36 }, (_, i) => { const a = i / 36 * Math.PI * 2; return dLine(R + Math.cos(a) * R * .86, Math.sin(a) * R * .86, R + Math.cos(a) * R * .98, Math.sin(a) * R * .98, 1.2, "#56646c"); }).join("") + dCircle(R, 0, R * .74, DSHEET, 1) : /TUBE|PROTECTOR|BAND/.test(desc) ? `<circle cx="${R}" cy="0" r="${R * .86}" fill="none" stroke="${DK.ink}" stroke-width="12"/><circle cx="${R}" cy="0" r="${R * .86}" fill="none" stroke="${DMAT.rubber[0]}" stroke-width="9"/>` : `<circle cx="${R}" cy="0" r="${R}" fill="none" stroke="${DK.ink}" stroke-width="8"/><circle cx="${R}" cy="0" r="${R}" fill="none" stroke="${DMAT.chrome[0]}" stroke-width="5.5"/>` + (/SPOKE/.test(desc) ? Array.from({ length: 18 }, (_, i) => { const a = i / 18 * Math.PI * 2; return dLine(R + Math.cos(a) * 14, Math.sin(a) * 14, R + Math.cos(a + .3) * (R - 4), Math.sin(a + .3) * (R - 4), .8, DK.fine); }).join("") : "") }; },
  disc() { const R = 60; return { w: R * 2, h: R * 2, draw: () => `<circle cx="${R}" cy="0" r="${R}" fill="${mat("steel")}" stroke="${DK.ink}" stroke-width="1.1"/>` + dCircle(R, 0, R * .55, mat("dark"), .9) + Array.from({ length: 6 }, (_, i) => { const a = i / 6 * Math.PI * 2; return dCircle(R + Math.cos(a) * R * .42, Math.sin(a) * R * .42, 3.4, DSHEET, .8); }).join("") + dCircle(R, 0, R * .22, DSHEET, .9) }; },
  tank() { const w = 280, h = 130; return { w, h, draw: () => outline(`M10,10 C10,-40 60,-62 140,-62 C220,-62 270,-40 270,0 C270,40 250,60 200,62 L60,62 C30,62 10,46 10,10 Z`, mat("paint")) + dRect(118, -66, 44, 10, mat("chrome"), 4) + dPath("M30,8 C90,-20 200,-20 250,8", "none", .8) }; },
  seat() { const w = 300, h = 90; return { w, h, draw: () => outline(`M0,20 C0,-10 30,-30 90,-30 L170,-36 C220,-40 280,-30 296,-6 C300,4 296,24 280,30 L20,40 C6,40 0,32 0,20 Z`, mat("black")) + dPath("M30,10 C100,-14 220,-18 280,-4", "none", .7) + dRect(10, 36, 270, 6, mat("dark"), 2, .8) }; },
  fender(desc) { const w = 240, h = 80; return { w, h, draw: () => outline(`M0,30 C40,-40 200,-40 240,30 L226,34 C190,-20 50,-20 14,34 Z`, mat("chrome")) + holes([[70, -10], [170, -10]], 3) }; },
  muffler() { const w = 320, h = 60; return { w, h, draw: () => outline(`M0,-8 H60 L90,-24 H290 Q320,-24 320,0 Q320,24 290,24 H90 L60,8 H0 Z`, mat("chrome")) + dLine(100, -18, 280, -18, .6, "rgba(255,255,255,.25)") }; },
  frame() { const w = 420, h = 230; return { w, h, draw: () => `<path d="M40,-80 L120,-100 L330,-70 L400,40 L300,100 M120,-100 L150,90 L300,100 L330,-70 M150,90 L40,-80 M40,-80 L30,-110 M300,100 L410,110" fill="none" stroke="${DK.ink}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/><path d="M40,-80 L120,-100 L330,-70 L400,40 L300,100 M120,-100 L150,90 L300,100 L330,-70 M150,90 L40,-80 M40,-80 L30,-110 M300,100 L410,110" fill="none" stroke="${DMAT.paint[0]}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>` }; },
  arm() { const w = 300, h = 80; return { w, h, draw: () => outline("M0,-14 Q0,-26 14,-26 H290 Q300,-26 300,-16 V16 Q300,26 290,26 H14 Q0,26 0,14 Z", mat("paint")) + dCircle(16, 0, 9, DSHEET, .9) + dCircle(284, 0, 7, DSHEET, .9) + dRect(70, -26, 150, 6, mat("dark"), 1, .6) }; },
  shock() { return { w: 220, h: 60, draw: () => dRect(0, -10, 24, 20, mat("chrome"), 10) + springH(120, 44, 9, 4, "spring", 40) + dRect(30, -8, 150, 16, mat("chrome"), 3) + dRect(180, -12, 40, 24, mat("chrome"), 10) }; },
  meter() { const R = 44; return { w: R * 2, h: R * 2, draw: () => `<circle cx="${R}" cy="0" r="${R}" fill="${mat("black")}" stroke="${DK.ink}" stroke-width="1.1"/>` + `<circle cx="${R}" cy="0" r="${R * .82}" fill="#1b252b" stroke="${DK.fine}" stroke-width=".8"/>` + Array.from({ length: 11 }, (_, i) => { const a = Math.PI * (.8 + i * .14); return dLine(R + Math.cos(a) * R * .7, Math.sin(a) * R * .7, R + Math.cos(a) * R * .8, Math.sin(a) * R * .8, 1, DK.ink); }).join("") + dLine(R, 0, R + R * .5, -R * .3, 1.6, DK.arrow) }; },
  valve() { return { w: 150, h: 40, draw: () => dPath("M0,-18 Q14,-18 24,-4 H150 V4 H24 Q14,18 0,18 Z", mat("steel")) + dRect(136, -6, 8, 12, "none", 1, .6) }; },
  piston() { return { w: 80, h: 80, draw: () => dRect(0, -40, 80, 80, mat("alu"), 8) + [-30, -22, -14].map(y => dLine(0, y, 80, y, 1, DK.ink)).join("") + dCircle(40, 8, 9, DSHEET, .9) }; },
  key() { return { w: 70, h: 30, draw: () => `<circle cx="14" cy="0" r="13" fill="${mat("zinc")}" stroke="${DK.ink}" stroke-width="1.1"/>` + dCircle(14, 0, 4, DSHEET, .8) + dPath("M27,-4 H70 V4 H60 V10 H54 V4 H27 Z", mat("zinc")) }; },
  emblem() { return { w: 110, h: 34, draw: () => dRect(0, -17, 110, 34, mat("chrome"), 6) + [0, 1, 2].map(i => dLine(14 + i * 30, -6, 34 + i * 30, 6, 2, DK.fine)).join("") }; },
  mirror() { return { w: 130, h: 80, draw: () => `<ellipse cx="40" cy="-14" rx="38" ry="24" fill="${mat("chrome")}" stroke="${DK.ink}" stroke-width="1.1"/>` + dPath("M70,0 L126,36", "none", 5) + dRect(118, 30, 12, 12, mat("zinc"), 2) }; },
  fuse() { return { w: 40, h: 16, draw: () => dRect(0, -6, 8, 12, mat("brass"), 1) + dRect(8, -5, 24, 10, "#2c3c44", 4) + dLine(10, 0, 30, 0, .8, DK.arrow) + dRect(32, -6, 8, 12, mat("brass"), 1) }; },
  filter() { return { w: 150, h: 90, draw: () => dRect(0, -45, 150, 90, mat("cast"), 10) + Array.from({ length: 12 }, (_, i) => dLine(12 + i * 11.5, -36, 12 + i * 11.5, 36, .8, DK.fine)).join("") }; },
  rod() { return { w: 70, h: 190, draw: () => dCircle(35, -70, 22, mat("steel"), 1.1) + dCircle(35, -70, 11, DSHEET, .9) + dPath("M24,-50 L28,40 H42 L46,-50 Z", mat("steel")) + dPath("M0,52 Q0,40 12,40 H58 Q70,40 70,52 V62 H0 Z", mat("steel")) + dPath("M0,68 H70 V76 Q70,90 56,90 H14 Q0,90 0,76 Z", mat("steel")) + dCircle(35, 65, 16, DSHEET, .9) }; },
  float() { return { w: 120, h: 46, draw: () => dRect(0, -18, 46, 36, mat("brass"), 14) + dRect(74, -18, 46, 36, mat("brass"), 14) + dRect(40, -6, 40, 12, mat("brass"), 2) + dRect(54, -16, 12, 14, mat("zinc"), 2) }; },
  pad() { return { w: 70, h: 40, draw: () => dPath("M0,-14 Q0,-20 6,-20 H64 Q70,-20 70,-14 V-6 H0 Z", mat("steel")) + dPath("M4,-6 H66 V14 Q66,20 60,20 H10 Q4,20 4,14 Z", "url(#h-friction)") + dCircle(12, -13, 3, DSHEET, .7) }; },
  ball() { return { w: 18, h: 18, draw: () => dCircle(9, 0, 8, mat("chrome"), 1) + dLine(5, -4, 8, -6, .8, "rgba(255,255,255,.4)") }; },
  generic(desc) { const w = 64, h = 44; return { w, h, draw: () => dRect(0, -h / 2, w, h, mat("steel"), 8) + dRect(8, -h / 2 + 8, w - 16, h - 16, "none", 4, .6) }; },
};
const SHAPE_RULES = [
  [/CRANKCASE SET|CRANKCASE,|CASE,CRANK/, "cover"], [/CYLINDER HEAD|HEAD,CYLINDER/, "cover"], [/FRAME COMP|FRAME,|^FRAME/, "frame"], [/SWINGING ARM|SWING ARM|ARM,REAR/, "arm"],
  [/TANK,FUEL|FUEL TANK|^TANK/, "tank"], [/SEAT/, "seat"], [/FENDER/, "fender"], [/MUFFLER|EXHAUST PIPE|PIPE,EXHAUST/, "muffler"], [/SHOCK ABSORBER|ABSORBER/, "shock"],
  [/HARNESS/, "harness"], [/HEADLAMP|HEAD LAMP|LAMP UNIT|LAMP ASSY|SEALED BEAM/, "lamp"], [/LENS/, "lens"], [/BULB/, "bulb"], [/FUSE/, "fuse"],
  [/SPEEDOMETER|TACHOMETER|METER/, "meter"], [/BATTERY|REGULATOR|RECTIFIER|COIL|CONDENSER|RELAY|HORN|FLASHER|STARTER MOTOR|MOTOR|UNIT|BOX/, "unit"],
  [/SWITCH/, "switch"], [/MIRROR/, "mirror"], [/KEY|LOCK/, "key"], [/EMBLEM|MARK|LABEL|DECAL|PLATE,NAME/, "emblem"],
  [/TIRE|TYRE|TUBE,INNER|PROTECTOR|RIM|SPOKE|WHEEL|HUB/, "wheel"], [/DISC,BRAKE|BRAKE DISC|^DISC/, "disc"],
  [/CHAIN/, "chain"], [/SPROCKET|GEAR|ROTOR|CLUTCH|DRIVEN|STARTER CLUTCH/, "gear"], [/CAMSHAFT|SHAFT|AXLE|SPINDLE/, "shaft"], [/PISTON(?! RING)|PISTON SET/, "piston"], [/^VALVE,/, "valve"],
  [/HANDLEBAR|HANDLE,|BAR,/, "bar"], [/LEVER|PEDAL|ARM,|KICK/, "lever"], [/CABLE|HOSE|PIPE|WIRE|LEAD|CORD|TUBE/, "hose"],
  [/ELEMENT|FILTER|CLEANER/, "filter"], [/COVER|CASE|CAP,CYL|HOUSING|PAN|GUARD|BODY/, "cover"], [/BRACKET|STAY|PLATE|HOLDER|BASE|SUPPORT|BRACE/, "plate"],
  [/OIL SEAL|SEAL,OIL|^SEAL|DUST SEAL/, "seal"], [/BEARING/, "bearing"], [/O RING|O-RING|ORING/, "oring"], [/GASKET.*\d+X|PACKING/, "gasketRing"], [/GASKET/, "gasket"],
  [/CIRCLIP|CLIP|C RING|SNAP RING|RING,STOP|STOPPER RING/, "clip"], [/SPRING/, "spring"], [/COTTER|PIN|KNOCK/, "pin"], [/STUD/, "stud"],
  [/LOCK WASHER|WASHER,LOCK|SPRING WASHER/, "lockwasher"], [/WASHER|SHIM/, "washer"], [/NUT/, "nut"], [/SCREW/, "screw"], [/BOLT/, "bolt"],
  [/SPACER|COLLAR|BUSH|SLEEVE|BUSHING|DAMPER/, "sleeve"], [/GROMMET|CUSHION|RUBBER|BOOT|MOUNT/, "grommet"], [/PLUG/, "plug"], [/CAP/, "cap"], [/RING/, "clip"],
];
/* Catalogue names are noun-first ("SEAT,VALVE SPRING" is a valve spring seat), so classify on the noun. */
const NOUN_RULES = [
  [/^(LOCK WASHER|WASHER,LOCK|SPRING WASHER)/, "lockwasher"], [/^(WASHER|SHIM)/, "washer"], [/^(BOLT,STUD|STUD)/, "stud"], [/^BOLT/, "bolt"], [/^SCREW/, "screw"], [/^NUT/, "nut"],
  [/^(O RING|O-RING|ORING)/, "oring"], [/^GASKET.*\d+(\.\d+)?X\d/, "gasketRing"], [/^(GASKET|DIAPHRAGM|PACKING)/, "gasket"], [/^(OIL SEAL|DUST SEAL|V SEAL|SEAL)/, "seal"], [/^BEARING/, "bearing"],
  [/^(CIRCLIP|CLIP|C RING|C-RING|E RING|RING,SNAP|SNAP RING|CLAMP|BAND)/, "clip"], [/^RING SET|^RING,PISTON/, "clip"], [/^SPRING/, "spring"], [/^(COTTER|PIN|JET|NEEDLE)/, "pin"],
  [/^(SPACER|COLLAR|BUSH|SLEEVE|GRIP)/, "sleeve"], [/^(CAP|KNOB|SOCKET|TAPPET|NIPPLE)/, "cap"], [/^PLUG/, "plug"], [/^(GROMMET|CUSHION|RUBBER|BOOT|MOUNT)/, "grommet"],
  [/^(PIPE,EXHAUST|MUFFLER|BODY,MUFFLER|CONNECTOR,MUFFLER)/, "muffler"], [/^(HOSE|PIPE|CABLE|WIRE|LEAD|CORD)/, "hose"], [/^TUBE,INNER|^TUBE ASSEMBLY,WHEEL/, "wheel"], [/^TUBE,FORK/, "shaft"],
  [/^HARNESS/, "harness"], [/^(HEADLAMP|LAMP)/, "lamp"], [/^LENS/, "lens"], [/^BULB/, "bulb"], [/^FUSE/, "fuse"], [/^(SWITCH)/, "switch"], [/^(SPEEDOMETER|TACHOMETER|METER)/, "meter"],
  [/^(BATTERY|REGULATOR|RECTIFIER|COIL|CONDENSER|RELAY|HORN|MOTOR|STARTER ASSY|GENERATOR|STATOR|BOX|UNIT|IGNITER|FLASHER|TERMINAL|CALIPER|CYLINDER ASSEMBLY,MASTER|BREAKER|GOVERNOR|PUMP)/, "unit"],
  [/^(TANK ASSEMBLY,FUEL|TANK,FUEL)/, "tank"], [/^SEAT ASSEMBLY|^SEAT,$|^SEAT$/, "seat"], [/^SEAT,VALVE/, "washer"], [/^(FENDER|BODY,REAR FENDER)/, "fender"], [/^FRAME/, "frame"],
  [/^(SWING ARM|SWINGING ARM)/, "arm"], [/^ABSORBER/, "shock"], [/^(LEVER|PEDAL|STARTER,KICK|ARM|FORK,GEAR|PAWL)/, "lever"], [/^(HANDLEBAR|BAR)/, "bar"], [/^MIRROR/, "mirror"],
  [/^(EMBLEM|LABEL|TAPE|MARK|DECAL)/, "emblem"], [/^(LOCK|KEY)/, "key"], [/^(TIRE|TYRE|RIM|SPOKE|WHEEL|CASTING WHEEL|HUB,FRONT|HUB,REAR|DRUM,FRONT|DRUM,REAR HUB|PROTECTOR,W|PROTECTOR,20|BALANCER)/, "wheel"],
  [/^DISC/, "disc"], [/^CONNECTING ROD/, "rod"], [/^FLOAT/, "float"], [/^PAD/, "pad"], [/^BALL/, "ball"], [/^(RACE|LACE)/, "bearing"], [/^(STRAINER|SEPARATOR|BREATHER)/, "filter"],
  [/^(STAND|LINK)/, "lever"], [/^(YOKE|HEAD,STEERING|POINT|CONTACT)/, "plate"], [/^STEM/, "shaft"], [/^DAMPER ASSEMBLY/, "shaft"], [/^(ROLLER|JOINT)/, "sleeve"], [/^(PIECE|BUTTON|BLEEDER|TANK ASSEMBLY,RESERVOIR)/, "cap"],
  [/^(BRUSH|COCK)/, "unit"], [/^REFLEX|^REFLECTOR/, "lens"], [/^RING/, "clip"], [/^CVR/, "seal"], [/^(PISTON|PISTON\/)/, "piston"], [/^VALVE/, "valve"], [/^CHAIN/, "chain"],
  [/^(GEAR|SPROCKET|ROTOR|IDLER|HUB,CLUTCH|PLATE,CLUTCH|CLUTCH SET|DRUM,REAR SPROCKET)/, "gear"], [/^(CAMSHAFT|CRANKSHAFT|SHAFT|AXLE|ROD|SPINDLE|CAM,)/, "shaft"],
  [/^(ELEMENT|FILTER|CLEANER)/, "filter"], [/^(CRANKCASE|COVER|CASE|HOUSING|PAN|GUARD|BODY|CYLINDER|HEAD ASSEMBLY,CYLINDER|PROTECTOR|RESERVOIR|CARBURETOR)/, "cover"],
  [/^(PLATE|BRACKET|HOLDER|STAY|BASE|SUPPORT|REINFORCEMENT|RETAINER|STOPPER|GUIDE|STRIKER|WEB|LIFTER|ADJUSTER|TENSIONER|EXTENSION|INDICATOR|CONNECTOR|SUPPORTER)/, "plate"],
];
function cmsShape(desc) {
  const d = String(desc || "").toUpperCase().replace(/\(NAS\)|\(MCA\)|\(ASB\)/g, "").trim();
  let k = (NOUN_RULES.find(([re]) => re.test(d)) || [])[1];
  if (!k) k = (SHAPE_RULES.find(([re]) => re.test(d)) || [0, "generic"])[1];
  if (k === "lockwasher") return SHAPES.washer(d, true);
  return (SHAPES[k] || SHAPES.generic)(d);
}

/* ---------- layout: catalogue order, flowing rows; big parts get their own row ---------- */
function cmsLayout(items, W = 1200) {
  const pad = 60, gx = 46, gy = 74; let x = pad, y = 70, rowH = 0; const pos = {};
  items.forEach(it => {
    const big = it.w > 360;
    if (x + it.w > W - pad || (big && x > pad)) { x = pad; y += rowH + gy; rowH = 0; }
    pos[it.k] = [x, y + it.h / 2]; x += it.w + gx; rowH = Math.max(rowH, it.h);
    if (big) { x = pad; y += rowH + gy; rowH = 0; }
  });
  return { pos, H: y + rowH + 90 };
}

/* ---------- build the diagrams ---------- */
(function cmsBuild() {
  if (typeof CMS_DATA === "undefined") return;
  const blks = Object.keys(CMS_DATA).sort();
  blks.forEach((blk, i) => {
    const pg = CMS_DATA[blk], title = cmsTitle(pg.title), sys = cmsSystem(pg.title), fig = "Fig. " + String(i + 1).padStart(2, "0");
    const handId = CMS_HAND[blk], hand = handId && DIAGRAMS.find(d => d.id === handId);
    if (hand) { Object.assign(hand, { blk, fig, models: cmsModels(pg.title), system: hand.system === "Carburetors" ? "Fuel & air" : hand.system }); return; }
    if (!pg.rows.length) return; // pages without a parts table only have a picture on CMSNL
    const groups = []; pg.rows.forEach(r => { const b = cmsBase(r[0]) || "–"; let g = groups.find(x => x.ref === b); if (!g) groups.push(g = { ref: b, rows: [] }); g.rows.push(r); });
    const items = groups.map(g => { const sh = cmsShape(g.rows[0][2]); return { k: "r" + g.ref.replace(/\W/g, "_"), ref: g.ref, rows: g.rows, ...sh }; });
    const fixed = CMS_POS[blk];
    const lay = cmsLayout(items); const H = Math.max(420, lay.H);
    const main = items.slice().sort((a, b) => b.w * b.h - a.w * a.h)[0];
    const parts = items.map(it => {
      const p0 = fixed && fixed[it.ref] ? [fixed[it.ref][0] - it.w / 2, fixed[it.ref][1]] : lay.pos[it.k];
      const names = [...new Set(it.rows.map(r => r[2]))];
      return { k: it.k, ref: it.ref === "–" ? "" : it.ref, name: cmsName(names[0]), short: cmsName(names[0]), len: it.w, w: it.w, h: it.h, z: it === main ? 1 : 3, e: p0,
        anchor: [it.w / 2, 0], co: [0, -it.h / 2 - 26], toward: it === main ? null : main.k, draw: it.draw,
        note: it.rows.length > 1 ? `${it.rows.length} versions in the catalogue. Check the frame or engine number to pick the right one.` : "" };
    });
    DIAGRAMS.push({ id: "CMS-" + blk, blk, gen: true, fig, title, system: sys, models: cmsModels(pg.title), kinds: ["exploded"], vb: [1200, H],
      assembly: `Every part on the CMSNL "${pg.title}" page, numbered with the catalogue's reference numbers.`,
      source: { label: `CMSNL GS750 1977 USA, ${pg.title}`, url: CMS_SITE + blk + ".html" }, compat: `Catalogue page for: ${cmsModels(pg.title)}. Check your frame and engine numbers.`,
      verify: "names", inv: [], tasks: [], tools: [], supplies: [],
      notes: fixed ? "Layout matched to the CMSNL picture. Shapes are drawn, not measured." : "Parts and numbers match the catalogue. Layout follows catalogue order and hasn't been matched to the CMSNL picture yet. Shapes are drawn, not measured.",
      layoutMatched: !!fixed, parts });
  });
  // catalogue data for generated pages (hand pages keep their verified CMS_PAGES rows)
  DIAGRAMS.forEach(d => {
    if (!d.gen) return; const pg = CMS_DATA[d.blk];
    d.cms = { blk: d.blk, title: pg.title, rows: pg.rows }; d.cmsDrawn = new Set(d.parts.map(p => p.ref));
    d.parts.forEach(p => { const cur = cmsCurrent(pg.rows, p.ref || "–"); if (cur) p.pn = [cur]; p.cat = [...new Set(pg.rows.filter(r => (cmsBase(r[0]) || "–") === (p.ref || "–")).map(r => r[2]))].join(" / "); });
  });
})();
/* Pages that only have a picture on CMSNL (no parts table) */
const CMS_PICTURE_ONLY = typeof CMS_DATA === "undefined" ? [] : Object.keys(CMS_DATA).filter(b => !CMS_DATA[b].rows.length && !CMS_HAND[b]).map(b => ({ blk: b, title: cmsTitle(CMS_DATA[b].title), models: cmsModels(CMS_DATA[b].title), url: CMS_SITE + b + ".html" }));
