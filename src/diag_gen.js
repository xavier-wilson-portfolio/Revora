/* ============ Catalogue diagrams: one per CMSNL parts-list page ============
   CMS_DATA (injected by the build from data/cms/*.json) holds every row of every page.
   Pages that already have a hand-drawn diagram keep it; every other page gets a generated
   exploded diagram: one drawn item per catalogue ref, shaped from the catalogue name, laid out
   in catalogue order (or at the positions in CMS_POS once a page is matched to its CMSNL picture),
   with ref callouts and amber arrows showing which way each part goes on. */
const CMS_SITE = "https://www.cmsnl.com/suzuki-gs750-1977-b-usa-e03_model34273/partslist/";
const CMS_HAND = { BLCK0030: "DG-CH-01", BLCK0028: "DG-BR-01", BLCK0034: "DG-CH-02", BLCK0004: "DG-EN-01", BLCK0016: "DG-EN-02", BLCK0009: "DG-EN-03", BLCK0005: "DG-FU-01", BLCK0077: "DG-EL-01" };
/* Positions read off the CMSNL pictures, page by page. box = the drawing's area in the screenshot it was read from;
   at = where each ref's part sits in that screenshot: [x, y] or [x, y, width] for big parts drawn to size.
   Parts are then nudged apart just enough that nothing touches. */
const CMS_POS = {
  BLCK0018: { box: [516, 200, 1051, 615], at: {
    "1": [740, 410, 230], "2": [912, 302], "3": [928, 340], "4": [893, 296], "5": [852, 258], "6": [862, 322], "7": [815, 545, 230], "8": [705, 566], "9": [870, 505], "10": [905, 500],
    "11": [724, 600], "12": [952, 497], "13": [952, 516], "14": [772, 252], "15": [772, 270], "16": [948, 452], "17": [932, 433], "18": [685, 262], "19": [596, 378], "20": [920, 362],
    "21": [990, 325], "22": [978, 258], "23": [955, 292], "24": [995, 218], "25": [600, 447], "26": [548, 487], "27": [572, 467], "28": [529, 501], "29": [540, 456], "30": [521, 472] } },
};
/* Assembled view for generated diagrams: every part slides in along its arrow until it seats against the main part. */
function cmsAssemble(parts, main) {
  const C = [main.e[0] + main.w / 2, main.e[1]];
  main.a = main.e.slice(); main.ca = [0, -main.h / 2 - 26];
  const rs = [];
  parts.forEach(p => {
    if (p === main) return;
    const P = [p.e[0] + p.w / 2, p.e[1]]; let ux = C[0] - P[0], uy = C[1] - P[1]; const L = Math.hypot(ux, uy) || 1; ux /= L; uy /= L;
    const tm = Math.min(Math.abs(ux) > 1e-3 ? (main.w / 2) / Math.abs(ux) : 1e9, Math.abs(uy) > 1e-3 ? (main.h / 2) / Math.abs(uy) : 1e9);
    const tp = Math.min(Math.abs(ux) > 1e-3 ? (p.w / 2) / Math.abs(ux) : 1e9, Math.abs(uy) > 1e-3 ? (p.h / 2) / Math.abs(uy) : 1e9);
    // seat point on the main part's edge, then keep a little of the original spread so neighbours stay in order
    const big = p.w * p.h > main.w * main.h * .25, d = tm + tp * (big ? .85 : .4), ex = C[0] - ux * d, ey = C[1] - uy * d;
    rs.push({ p, ux, uy, cx: ex + (P[0] - ex) * .18, cy: ey + (P[1] - ey) * .18, tp });
  });
  // spread parts that land on the same spot along the main part's edge
  for (let it = 0; it < 160; it++) { let mv = false;
    for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) { const a = rs[i], b = rs[j], ox = (a.p.w + b.p.w) / 2 - Math.abs(a.cx - b.cx) - 2, oy = (a.p.h + b.p.h) / 2 - Math.abs(a.cy - b.cy) - 2;
      if (ox <= 0 || oy <= 0) continue; mv = true; const tx = -a.uy, ty = a.ux, s = ((a.cx - b.cx) * tx + (a.cy - b.cy) * ty) >= 0 ? 1 : -1, k = Math.min(ox, oy) / 2;
      a.cx += tx * s * k; a.cy += ty * s * k; b.cx -= tx * s * k; b.cy -= ty * s * k; }
    if (!mv) break; }
  rs.forEach(r => { r.p.a = [r.cx - r.p.w / 2, r.cy]; r.p.ca = [-r.ux * (r.tp + 30), -r.uy * (r.tp + 30)]; });
}
/* Place parts at the picture positions, then push overlapping parts apart (bigger parts move less). */
function cmsPlace(items, P) {
  const [x0, y0, x1] = P.box, k = 1100 / (x1 - x0), M = 16;
  const rs = items.map(it => { const a = P.at[it.ref]; if (!a) return null; const sc = a[2] ? (a[2] * k) / it.w : 1; it.sc = sc; return { it, cx: 50 + (a[0] - x0) * k, cy: 70 + (a[1] - y0) * k, w: it.w * sc, h: it.h * sc }; });
  const placed = rs.filter(Boolean);
  for (let iter = 0; iter < 400; iter++) {
    let moved = false;
    for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) {
      const a = placed[i], b = placed[j], ox = (a.w + b.w) / 2 + M - Math.abs(a.cx - b.cx), oy = (a.h + b.h) / 2 + M - Math.abs(a.cy - b.cy);
      if (ox <= 0 || oy <= 0) continue; moved = true;
      const wa = a.w * a.h, wb = b.w * b.h, fa = wb / (wa + wb), fb = wa / (wa + wb);
      if (ox < oy) { const s = (a.cx < b.cx ? -1 : 1) * ox; a.cx += s * fa; b.cx -= s * fb; } else { const s = (a.cy < b.cy ? -1 : 1) * oy; a.cy += s * fa; b.cy -= s * fb; }
    }
    if (!moved) break;
  }
  const minX = Math.min(...placed.map(r => r.cx - r.w / 2)), minY = Math.min(...placed.map(r => r.cy - r.h / 2));
  const dx = 50 - minX, dy = 70 - minY, pos = {}; let maxX = 0, maxY = 0;
  placed.forEach(r => { r.cx += dx; r.cy += dy; pos[r.it.k] = [r.cx - r.w / 2, r.cy]; maxX = Math.max(maxX, r.cx + r.w / 2); maxY = Math.max(maxY, r.cy + r.h / 2); });
  // anything without a picture position goes in a row underneath
  let x = 50, y = maxY + 80, rowH = 0;
  rs.forEach((r, i) => { if (r) return; const it = items[i]; it.sc = 1; if (x + it.w > 1150) { x = 50; y += rowH + 60; rowH = 0; } pos[it.k] = [x, y + it.h / 2]; x += it.w + 40; rowH = Math.max(rowH, it.h); maxY = Math.max(maxY, y + it.h); });
  return { pos, W: Math.max(1200, maxX + 60), H: maxY + 100 };
}
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

/* ---------- 3D-style part library: shaded drawings with real depth (light from the top left).
   Each returns { w, h, draw } in a box x 0..w, y -h/2..h/2. ---------- */
const sz = (desc, def) => { const m = String(desc).match(/(\d+(?:\.\d+)?)\s*X\s*(\d+(?:\.\d+)?)/i); return m ? [+m[1], +m[2]] : def; };
const E3 = .42;                                   // how flat a round face looks at this viewing angle
const R1 = v => (+v).toFixed(1);
const shadow3 = (cx, cy, rx, ry) => `<ellipse cx="${R1(cx)}" cy="${R1(cy)}" rx="${R1(rx)}" ry="${R1(ry)}" fill="rgba(25,30,35,.16)" filter="url(#f-shadow)"/>`;
const ol = (sw = 1) => `stroke="${DK.ink}" stroke-width="${sw}" stroke-linejoin="round"`;
/* horizontal cylinder: shaded body, rounded far end, visible near end face */
function cyl3(x, len, d, m = "steel", cap = true) {
  const r = d / 2, rx = Math.max(2, d * .2);
  return `<path d="M${R1(x + rx)},${R1(-r)} H${R1(x + len)} V${R1(r)} H${R1(x + rx)} A${R1(rx)},${R1(r)} 0 0,1 ${R1(x + rx)},${R1(-r)} Z" fill="url(#gH-${m})" ${ol()}/>`
    + (cap ? `<ellipse cx="${R1(x + len)}" cy="0" rx="${R1(rx)}" ry="${R1(r)}" fill="url(#gD-${m})" ${ol(.9)}/>` : "")
    + `<line x1="${R1(x + rx + 2)}" y1="${R1(-r * .45)}" x2="${R1(x + len - 2)}" y2="${R1(-r * .45)}" stroke="rgba(255,255,255,.85)" stroke-width="${R1(Math.max(.8, d * .07))}" stroke-linecap="round"/>`;
}
/* threads on a horizontal cylinder */
function thr3(x, len, d, pitch = 3) { let s = ""; for (let i = x + 2; i < x + len - 1; i += pitch) s += `<path d="M${R1(i)},${R1(-d / 2)} Q${R1(i + pitch * .5)},0 ${R1(i)},${R1(d / 2)}" fill="none" stroke="${DK.fine}" stroke-width=".55"/>`; return s; }
/* round part seen at an angle (washer, bearing, seal, disc...): top face, side band, optional hole */
function ring3(cx, R, r, t, m = "steel", top) {
  const ry = R * E3, iry = r * E3;
  const side = `<path d="M${R1(cx - R)},0 V${R1(t)} A${R1(R)},${R1(ry)} 0 0,0 ${R1(cx + R)},${R1(t)} V0 Z" fill="url(#gV-${m})" ${ol()}/>`;
  const face = `<ellipse cx="${R1(cx)}" cy="0" rx="${R1(R)}" ry="${R1(ry)}" fill="${top || `url(#gR-${m})`}" ${ol()}/>`;
  const hole = r > 0 ? `<ellipse cx="${R1(cx)}" cy="0" rx="${R1(r)}" ry="${R1(iry)}" fill="url(#gV-${m})" ${ol(.8)}/><path d="M${R1(cx - r)},0 A${R1(r)},${R1(iry)} 0 0,0 ${R1(cx + r)},0 V${R1(Math.min(t, iry * 1.6))} A${R1(r)},${R1(iry)} 0 0,1 ${R1(cx - r)},${R1(Math.min(t, iry * 1.6))} Z" fill="#fff" opacity=".0"/><ellipse cx="${R1(cx)}" cy="${R1(Math.min(t * .9, iry * .9))}" rx="${R1(r * .96)}" ry="${R1(iry * .92)}" fill="#fff" stroke="none"/>` : "";
  const glint = `<path d="M${R1(cx - R * .7)},${R1(-ry * .55)} A${R1(R * .8)},${R1(ry * .8)} 0 0,1 ${R1(cx + R * .1)},${R1(-ry * .85)}" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.4" stroke-linecap="round"/>`;
  return shadow3(cx, t + ry * .6, R * 1.05, ry * .7) + side + face + hole + glint;
}
/* extruded flat part: depth face first, then the top face */
function slab3(d, m = "alu", dx = 7, dy = 6) {
  return `<path d="${d}" transform="translate(${dx},${dy})" fill="${DMAT[m][2]}" ${ol()}/><path d="${d}" fill="url(#gD-${m})" ${ol()}/>`;
}
const hole3 = (x, y, r) => `<ellipse cx="${R1(x)}" cy="${R1(y)}" rx="${R1(r)}" ry="${R1(r * .8)}" fill="#5a6066" ${ol(.7)}/><ellipse cx="${R1(x + r * .25)}" cy="${R1(y + r * .2)}" rx="${R1(r * .75)}" ry="${R1(r * .6)}" fill="#fff"/>`;
/* hex head / nut seen from the side: three faces with different shading */
const hexSide3 = (x, w, h, m = "zinc") => `<rect x="${R1(x)}" y="${R1(-h / 2)}" width="${R1(w)}" height="${R1(h * .28)}" fill="${DMAT[m][0]}" ${ol(.9)}/><rect x="${R1(x)}" y="${R1(-h / 2 + h * .28)}" width="${R1(w)}" height="${R1(h * .44)}" fill="${DMAT[m][1]}" ${ol(.9)}/><rect x="${R1(x)}" y="${R1(h / 2 - h * .28)}" width="${R1(w)}" height="${R1(h * .28)}" fill="${DMAT[m][2]}" ${ol(.9)}/>`;
/* tube along a path: dark edge, body colour and a highlight */
const tube3 = (path, th, m = "rubber") => `<path d="${path}" fill="none" stroke="${DK.ink}" stroke-width="${th + 2.4}" stroke-linecap="round"/><path d="${path}" fill="none" stroke="${DMAT[m][1]}" stroke-width="${th}" stroke-linecap="round"/><path d="${path}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="${R1(th * .25)}" stroke-linecap="round" transform="translate(0,${R1(-th * .22)})"/>`;
const SHAPES = {
  bolt(desc) { const [dm, l] = sz(desc, [8, 25]); const dd = Math.max(6, dm * 1.4), L = Math.min(110, Math.max(26, l * 1.6)), hw = dd * .9, hh = dd * 1.8;
    return { w: hw + L, h: hh + 10, draw: () => shadow3((hw + L) / 2, hh / 2 + 3, (hw + L) / 2, 4) + cyl3(hw - 2, L + 2, dd, "zinc") + thr3(hw + L * .35, L * .65, dd) + hexSide3(0, hw, hh) }; },
  screw(desc) { const [dm, l] = sz(desc, [5, 16]); const dd = Math.max(5, dm * 1.3), L = Math.min(80, Math.max(18, l * 1.6)), hr = dd * 1.15;
    return { w: hr + L, h: hr * 2 + 8, draw: () => shadow3((hr + L) / 2, hr + 2, (hr + L) / 2, 3.5) + cyl3(hr - 2, L, dd, "zinc") + thr3(hr + 2, L - 4, dd) + `<path d="M${R1(hr)},${R1(-hr)} Q${R1(-hr * .2)},${R1(-hr)} ${R1(-hr * .2)},0 Q${R1(-hr * .2)},${R1(hr)} ${R1(hr)},${R1(hr)} Z" fill="url(#gR-zinc)" ${ol()}/>` + `<line x1="${R1(hr * .25)}" y1="${R1(-hr * .55)}" x2="${R1(hr * .25)}" y2="${R1(hr * .55)}" stroke="${DK.ink}" stroke-width="1.6"/>` }; },
  stud(desc) { const [dm, l] = sz(desc, [8, 30]); const dd = Math.max(6, dm * 1.3), L = Math.min(120, Math.max(30, l * 1.7));
    return { w: L + 4, h: dd + 10, draw: () => shadow3(L / 2, dd / 2 + 3, L / 2, 3) + cyl3(0, L, dd, "steel") + thr3(2, L * .35, dd) + thr3(L * .6, L * .38, dd) }; },
  nut() { const R = 12, t = 8; return { w: R * 2, h: R * 2 + t, draw: () => { const pts = a => Array.from({ length: 6 }, (_, i) => [R + R * Math.cos(Math.PI / 3 * i + Math.PI / 6), R * E3 * 1.6 * Math.sin(Math.PI / 3 * i + Math.PI / 6) + a]);
      const top = pts(-t / 2), bot = pts(t / 2), poly = (ps, f) => `<polygon points="${ps.map(q => q.map(R1).join(",")).join(" ")}" fill="${f}" ${ol(.9)}/>`;
      const sides = [0, 1, 2].map(i => poly([top[i], top[i + 1], bot[i + 1], bot[i]], DMAT.zinc[1 + (i === 1 ? 0 : 1)])).join("");
      return shadow3(R, t + 4, R, 4) + sides + poly(top, "url(#gR-zinc)") + `<ellipse cx="${R}" cy="${R1(-t / 2)}" rx="${R * .45}" ry="${R1(R * .45 * E3 * 1.6)}" fill="#fff" ${ol(.8)}/>`; } }; },
  washer(desc, lock) { const [a, b] = sz(desc, [8, 16]); const R = Math.min(30, Math.max(10, (b || 16) * .75)), r = Math.max(4, R * ((a || 8) / (b || 16)));
    return { w: R * 2, h: R * E3 * 2 + 10, draw: () => ring3(R, R, r, 3, lock ? "spring" : "zinc") + (lock ? `<rect x="${R1(R * 1.55)}" y="${R1(-4)}" width="5" height="10" fill="#fff"/>` : "") }; },
  oring() { const R = 17; return { w: R * 2, h: R * E3 * 2 + 10, draw: () => shadow3(R, 5, R, 5) + `<ellipse cx="${R}" cy="0" rx="${R - 2.5}" ry="${R1((R - 2.5) * E3)}" fill="none" stroke="${DK.ink}" stroke-width="6.4"/><ellipse cx="${R}" cy="0" rx="${R - 2.5}" ry="${R1((R - 2.5) * E3)}" fill="none" stroke="#3a3c3e" stroke-width="4"/><ellipse cx="${R}" cy="-1" rx="${R - 3.5}" ry="${R1((R - 3.5) * E3)}" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1"/>` }; },
  gasketRing(desc) { const [a, b] = sz(desc, [10, 16]); const R = Math.min(26, Math.max(10, b * .9)), r = Math.max(4, R * a / b);
    return { w: R * 2, h: R * E3 * 2 + 8, draw: () => ring3(R, R, r, 2, "brass") }; },
  gasket() { const w = 140, h = 80; const d = `M16,${-h / 2} H${w - 16} Q${w},${-h / 2} ${w},${-h / 2 + 16} V${h / 2 - 16} Q${w},${h / 2} ${w - 16},${h / 2} H16 Q0,${h / 2} 0,${h / 2 - 16} V${-h / 2 + 16} Q0,${-h / 2} 16,${-h / 2} Z M22,${-h / 2 + 13} H${w - 22} V${h / 2 - 13} H22 Z`;
    return { w: w + 4, h: h + 4, draw: () => `<path d="${d}" transform="translate(2,2)" fill="${DMAT.brass[2]}" fill-rule="evenodd"/><path d="${d}" fill="url(#gD-brass)" fill-rule="evenodd" ${ol(1)}/>` + [[8, -h / 2 + 8], [w - 8, -h / 2 + 8], [8, h / 2 - 8], [w - 8, h / 2 - 8], [w / 2, -h / 2 + 6], [w / 2, h / 2 - 6]].map(([x, y]) => hole3(x, y, 2.6)).join("") }; },
  seal() { const R = 21; return { w: R * 2, h: R * E3 * 2 + 14, draw: () => ring3(R, R, R * .55, 9, "rubber") + `<ellipse cx="${R}" cy="0" rx="${R1(R * .8)}" ry="${R1(R * .8 * E3)}" fill="none" stroke="#c9ced2" stroke-width="1.2"/>` }; },
  bearing() { const R = 25; return { w: R * 2, h: R * E3 * 2 + 16, draw: () => ring3(R, R, R * .5, 12, "steel") + `<ellipse cx="${R}" cy="0" rx="${R1(R * .76)}" ry="${R1(R * .76 * E3)}" fill="url(#gV-dark)" ${ol(.8)}/>` + Array.from({ length: 9 }, (_, i) => { const a = i / 9 * Math.PI * 2; return `<circle cx="${R1(R + Math.cos(a) * R * .76)}" cy="${R1(Math.sin(a) * R * .76 * E3)}" r="3.3" fill="url(#gR-chrome)" ${ol(.6)}/>`; }).join("") + `<ellipse cx="${R}" cy="0" rx="${R1(R * .55)}" ry="${R1(R * .55 * E3)}" fill="url(#gR-steel)" ${ol(.8)}/><ellipse cx="${R}" cy="0" rx="${R1(R * .4)}" ry="${R1(R * .4 * E3)}" fill="#fff" ${ol(.8)}/>` }; },
  clip() { const R = 16; return { w: R * 2 + 4, h: R * E3 * 2 + 12, draw: () => { const arc = `M${R1(R + 2 + R * Math.cos(-1.25))},${R1(R * E3 * Math.sin(-1.25))} A${R},${R1(R * E3)} 0 1,0 ${R1(R + 2 + R * Math.cos(-1.9))},${R1(R * E3 * Math.sin(-1.9))}`;
      return shadow3(R + 2, 5, R, 4) + `<path d="${arc}" fill="none" stroke="${DK.ink}" stroke-width="5.4" stroke-linecap="round"/><path d="${arc}" fill="none" stroke="${DMAT.spring[0]}" stroke-width="3.2" stroke-linecap="round"/>` + [-1.25, -1.9].map(t => `<circle cx="${R1(R + 2 + R * Math.cos(t))}" cy="${R1(R * E3 * Math.sin(t) - 3)}" r="2.6" fill="#fff" ${ol(.8)}/>`).join(""); } }; },
  spring(desc) { const L = /VALVE|SMALL|THROTTLE/.test(desc) ? 54 : 84, D = 24, n = Math.round(L / 7);
    return { w: L, h: D + 10, draw: () => { let back = "", front = ""; const p = L / n; for (let i = 0; i < n; i++) { const x0 = i * p; back += `<path d="M${R1(x0 + p * .5)},${-D / 2} Q${R1(x0 + p * .9)},0 ${R1(x0 + p)},${D / 2}" fill="none" stroke="#8c939a" stroke-width="2.2"/>`; front += `<path d="M${R1(x0)},${D / 2} Q${R1(x0 + p * .05)},0 ${R1(x0 + p * .5)},${-D / 2}" fill="none" stroke="${DK.ink}" stroke-width="4.2" stroke-linecap="round"/><path d="M${R1(x0)},${D / 2} Q${R1(x0 + p * .05)},0 ${R1(x0 + p * .5)},${-D / 2}" fill="none" stroke="${DMAT.spring[0]}" stroke-width="2.4" stroke-linecap="round"/>`; } return shadow3(L / 2, D / 2 + 4, L / 2, 4) + back + front; } }; },
  pin(desc) { const L = /COTTER/.test(desc) ? 36 : 42; return { w: L, h: 14, draw: () => /COTTER/.test(desc) ? tube3(`M8,-3 H${L}`, 2.4, "zinc") + tube3(`M8,3 H${L - 5}`, 2.4, "zinc") + `<ellipse cx="5" cy="0" rx="5" ry="4.5" fill="none" stroke="${DK.ink}" stroke-width="2.6"/>` : shadow3(L / 2, 6, L / 2, 2.5) + cyl3(0, L, 8, "steel") }; },
  sleeve(desc) { const [a, b] = sz(desc, [12, 20]); const d = Math.min(46, Math.max(16, (b || 20) * 1.2)), L = Math.min(70, Math.max(16, d * 1.1));
    return { w: L + d * .25, h: d + 10, draw: () => shadow3(L / 2, d / 2 + 4, L / 2, 4) + cyl3(0, L, d, "steel", false) + `<ellipse cx="${R1(L)}" cy="0" rx="${R1(d * .2)}" ry="${R1(d / 2)}" fill="url(#gD-steel)" ${ol(.9)}/><ellipse cx="${R1(L)}" cy="0" rx="${R1(d * .12)}" ry="${R1(d * .3)}" fill="#fff" ${ol(.7)}/>` }; },
  cap() { return { w: 38, h: 40, draw: () => shadow3(19, 16, 18, 4) + `<path d="M2,-6 V8 A17,7 0 0,0 36,8 V-6 Z" fill="url(#gV-black)" ${ol()}/><ellipse cx="19" cy="-6" rx="17" ry="7" fill="url(#gR-black)" ${ol()}/>` + [8, 14, 24, 30].map(x => `<line x1="${x}" y1="-1" x2="${x}" y2="12" stroke="#5c6166" stroke-width=".8"/>`).join("") }; },
  plug() { return { w: 54, h: 28, draw: () => shadow3(27, 12, 26, 3.5) + hexSide3(0, 16, 24) + cyl3(15, 30, 13, "zinc") + thr3(18, 26, 13) + `<rect x="44" y="-2" width="8" height="4" fill="url(#gH-steel)" ${ol(.6)}/>` }; },
  grommet() { const R = 16; return { w: R * 2, h: R * 2 + 4, draw: () => shadow3(R, R * .9, R, 4) + ring3(R, R, R * .45, 6, "rubber").replace(/<ellipse[^>]*filter[^>]*\/>/, "") + `<g transform="translate(0,${R1(-R * .7)})">${ring3(R, R * .78, R * .4, 6, "rubber").replace(/<ellipse[^>]*filter[^>]*\/>/, "")}</g>` }; },
  cover(desc) { const big = /CRANKCASE|CYLINDER|HEAD|PAN|TANK/.test(desc); const w = big ? 230 : 160, h = big ? 140 : 100;
    const d = `M34,${-h / 2} H${w - 44} Q${w},${-h / 2} ${w},${-h / 2 + 36} V${h / 2 - 32} Q${w},${h / 2} ${w - 38},${h / 2} H36 Q0,${h / 2} 0,${h / 2 - 36} V${-h / 2 + 32} Q0,${-h / 2} 34,${-h / 2} Z`;
    return { w: w + 12, h: h + 12, draw: () => shadow3(w / 2 + 6, h / 2 + 4, w / 2, 10) + slab3(d, big ? "cast" : "alu", 10, 8) + `<path d="M40,${-h / 2 + 18} H${w - 46} Q${w - 18},${-h / 2 + 18} ${w - 18},${-h / 2 + 42} V${h / 2 - 38} Q${w - 18},${h / 2 - 18} ${w - 44},${h / 2 - 18} H42 Q18,${h / 2 - 18} 18,${h / 2 - 40} V${-h / 2 + 40} Q18,${-h / 2 + 18} 40,${-h / 2 + 18} Z" fill="url(#gR-${big ? "cast" : "alu"})" stroke="${DK.fine}" stroke-width=".7"/>` + [[12, -h / 2 + 24], [w - 14, -h / 2 + 28], [12, h / 2 - 24], [w - 14, h / 2 - 26], [w / 2, -h / 2 + 9], [w / 2, h / 2 - 9]].map(([x, y]) => hole3(x, y, 3.4)).join("") }; },
  plate(desc) { const w = /BRACKET|STAY/.test(desc) ? 112 : 92, h = 56; const d = `M0,${-h / 2 + 9} Q0,${-h / 2} 9,${-h / 2} H${R1(w * .55)} L${w},-6 V${h / 2 - 9} Q${w},${h / 2} ${w - 9},${h / 2} H9 Q0,${h / 2} 0,${h / 2 - 9} Z`;
    return { w: w + 8, h: h + 8, draw: () => shadow3(w / 2 + 4, h / 2 + 2, w / 2, 6) + slab3(d, "steel", 5, 4) + [[14, -h / 2 + 13], [14, h / 2 - 13], [w - 14, h / 2 - 13]].map(([x, y]) => hole3(x, y, 4)).join("") }; },
  gear(desc) { const R = /PRIMARY|DRIVEN|DRIVE GEAR|CLUTCH|HUB/.test(desc) ? 54 : /SPROCKET/.test(desc) ? 44 : 36, n = Math.round(R / 2.6), t = 10;
    return { w: R * 2, h: R * E3 * 2 + t + 10, draw: () => { const pts = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rr = i % 2 ? R : R - 6; pts.push([R + Math.cos(a) * rr, Math.sin(a) * rr * E3]); }
      const P = (dy, f) => `<polygon points="${pts.map(([x, y]) => R1(x) + "," + R1(y + dy)).join(" ")}" fill="${f}" ${ol(.9)}/>`;
      return shadow3(R, t + R * E3 * .6, R, R * E3 * .7) + P(t, DMAT.steel[2]) + `<rect x="0" y="0" width="${R * 2}" height="${t}" fill="url(#gV-steel)" opacity=".0"/>` + P(0, "url(#gR-steel)") + `<ellipse cx="${R}" cy="0" rx="${R1(R - 12)}" ry="${R1((R - 12) * E3)}" fill="none" stroke="${DK.fine}" stroke-width=".8"/>` + `<ellipse cx="${R}" cy="0" rx="${R1(R * .3)}" ry="${R1(R * .3 * E3)}" fill="url(#gV-steel)" ${ol(.8)}/><ellipse cx="${R}" cy="${R1(R * .3 * E3 * .5)}" rx="${R1(R * .27)}" ry="${R1(R * .27 * E3)}" fill="#fff"/>`; } }; },
  shaft(desc) { const L = /CAM|COUNTER|DRIVE|AXLE|MAIN|CRANK|FORK|DAMPER/.test(desc) ? 300 : 170, d = /AXLE/.test(desc) ? 18 : /FORK|DAMPER/.test(desc) ? 30 : 22;
    return { w: L + 10, h: d + 24, draw: () => shadow3(L / 2, d / 2 + 8, L / 2, 5) + cyl3(0, L, d, /FORK/.test(desc) ? "chrome" : "steel") + (/CAM/.test(desc) ? [.18, .38, .62, .82].map(f => `<path d="M${R1(L * f - 10)},${-d / 2 + 1} Q${R1(L * f)},${-d / 2 - 16} ${R1(L * f + 10)},${-d / 2 + 1} V${d / 2 - 1} H${R1(L * f - 10)} Z" fill="url(#gH-chrome)" ${ol(.9)}/>`).join("") : /CRANK/.test(desc) ? [.25, .45, .65, .85].map(f => slab3(`M${R1(L * f - 10)},${-d * 1.3} H${R1(L * f + 10)} V${d * 1.3} H${R1(L * f - 10)} Z`, "steel", 4, 3)).join("") : [.3, .55].map(f => cyl3(L * f, 14, d + 10, "steel")).join("")) }; },
  hose(desc) { const cable = /CABLE|WIRE|LEAD|CORD/.test(desc), L = cable ? 180 : 150, th = cable ? 5 : 10;
    return { w: L, h: 60, draw: () => shadow3(L / 2, 26, L / 2, 5) + tube3(`M10,12 C${L * .3},-34 ${L * .58},40 ${L - 10},-8`, th, cable ? "black" : "rubber") + cyl3(0, 14, th + 6, "zinc") .replace(/<path/, `<path transform="translate(0,12)"`) + `<g transform="translate(${L - 16},-8)">${cyl3(0, 14, th + 6, "zinc")}</g>` }; },
  harness() { return { w: 270, h: 120, draw: () => shadow3(135, 40, 130, 8) + [[-14, "#5d7f93"], [-5, "#8f7a52"], [4, "#5f8a5a"], [13, "#8a5555"]].map(([o, c]) => `<path d="M14,${o} C74,${o - 40} 134,${o + 40} 204,${o} L254,${R1(o * 2.6)}" fill="none" stroke="#26292c" stroke-width="4.2" stroke-linecap="round"/><path d="M14,${o} C74,${o - 40} 134,${o + 40} 204,${o} L254,${R1(o * 2.6)}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`).join("") + slab3("M0,-22 H18 V22 H0 Z", "black", 4, 3) + slab3("M250,-48 H266 V-28 H250 Z", "black", 3, 2) + slab3("M250,26 H266 V46 H250 Z", "black", 3, 2) + cyl3(118, 22, 30, "rubber") }; },
  lamp(desc) { const R = /HEAD/.test(desc) ? 52 : 32; return { w: R * 2 + 16, h: R * 2 + 10, draw: () => shadow3(R + 8, R * .9, R, 8) + `<path d="M${R},${-R} A${R},${R} 0 0,0 ${R},${R} L${R + 16},${R * .92} A${R * .4},${R * .92} 0 0,0 ${R + 16},${-R * .92} Z" fill="url(#gH-chrome)" ${ol()}/>` + `<ellipse cx="${R + 16}" cy="0" rx="${R1(R * .4)}" ry="${R1(R * .92)}" fill="url(#gR-chrome)" ${ol()}/><ellipse cx="${R + 16}" cy="0" rx="${R1(R * .32)}" ry="${R1(R * .78)}" fill="#e9f1f5" stroke="${DK.fine}" stroke-width=".8"/>` + Array.from({ length: 4 }, (_, i) => `<line x1="${R1(R + 16 - R * .28)}" y1="${R1(-R * .5 + i * R * .33)}" x2="${R1(R + 16 + R * .28)}" y2="${R1(-R * .5 + i * R * .33)}" stroke="#b9c6cd" stroke-width=".7"/>`).join("") }; },
  lens() { const w = 74, h = 48; return { w: w + 8, h: h + 8, draw: () => shadow3(w / 2, h / 2 + 2, w / 2, 5) + slab3(`M10,${-h / 2} H${w - 10} Q${w},${-h / 2} ${w},${-h / 2 + 10} V${h / 2 - 10} Q${w},${h / 2} ${w - 10},${h / 2} H10 Q0,${h / 2} 0,${h / 2 - 10} V${-h / 2 + 10} Q0,${-h / 2} 10,${-h / 2} Z`, "paint", 5, 4).replace(/url\(#gD-paint\)/, "#c0453a").replace(DMAT.paint[2], "#7d2a24") + Array.from({ length: 4 }, (_, i) => `<line x1="${10 + i * 18}" y1="${-h / 2 + 6}" x2="${10 + i * 18}" y2="${h / 2 - 6}" stroke="rgba(255,255,255,.35)" stroke-width="1"/>`).join("") }; },
  bulb() { return { w: 28, h: 46, draw: () => shadow3(14, 22, 10, 3) + `<path d="M14,-21 C29,-21 29,2 21,8 V14 H7 V8 C-1,2 -1,-21 14,-21 Z" fill="rgba(235,242,246,.9)" ${ol()}/><path d="M9,-6 Q14,-13 19,-6" fill="none" stroke="#d0892e" stroke-width="1"/>` + cyl3(6, 2, 0, "brass").slice(0, 0) + `<rect x="7" y="14" width="14" height="8" fill="url(#gH-brass)" ${ol(.8)}/>` + `<path d="M8,-15 Q10,-19 15,-19" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>` }; },
  unit(desc) { const w = /BATTERY/.test(desc) ? 120 : /REGULATOR|RECTIFIER|IGNITION|COIL|MOTOR|GENERATOR|STATOR|CALIPER|PUMP/.test(desc) ? 96 : 66, h = /BATTERY/.test(desc) ? 80 : 52;
    return { w: w + 14, h: h + 14, draw: () => shadow3(w / 2 + 6, h / 2 + 6, w / 2, 7) + `<path d="M0,${-h / 2} L12,${-h / 2 - 10} H${w + 12} V${h / 2 - 10} L${w},${h / 2} Z" fill="${DMAT.black[0]}" ${ol()}/><rect x="0" y="${-h / 2}" width="${w}" height="${h}" rx="4" fill="url(#gD-black)" ${ol()}/>` + (/BATTERY/.test(desc) ? cyl3(14, 6, 12, "zinc").replace(/<path/, `<path transform="translate(0,${-h / 2 - 6})"`) + `<rect x="14" y="${-h / 2 - 12}" width="14" height="8" fill="url(#gH-zinc)" ${ol(.8)}/><rect x="${w - 30}" y="${-h / 2 - 12}" width="14" height="8" fill="url(#gH-zinc)" ${ol(.8)}/>` : [w * .3, w * .5, w * .7].map(x => `<rect x="${R1(x - 3)}" y="${h / 2}" width="6" height="11" fill="url(#gH-brass)" ${ol(.7)}/>`).join("")) + `<rect x="8" y="${-h / 2 + 7}" width="${w - 16}" height="${R1(h * .25)}" rx="2" fill="rgba(255,255,255,.12)"/>` }; },
  switch() { const w = 92, h = 58; return { w: w + 10, h: h + 30, draw: () => shadow3(w / 2, h / 2 + 4, w / 2, 6) + slab3(`M0,${-h / 2 + 12} Q0,${-h / 2} 12,${-h / 2} H${w - 12} Q${w},${-h / 2} ${w},${-h / 2 + 12} V${h / 2 - 6} H0 Z`, "black", 6, 5) + slab3("M16,-12 H36 V4 H16 Z", "dark", 2, 2) + slab3("M50,-12 H76 V4 H50 Z", "dark", 2, 2) + tube3(`M${w / 2},${h / 2} C${w / 2},${h / 2 + 16} ${w / 2 + 30},${h / 2 + 6} ${w + 6},${h / 2 + 20}`, 4, "black") }; },
  chain() { const n = 14; return { w: n * 12 + 6, h: 28, draw: () => shadow3(n * 6, 10, n * 6, 3) + Array.from({ length: n }, (_, i) => `<rect x="${i * 12}" y="-8" width="17" height="16" rx="7.5" fill="${i % 2 ? "url(#gH-steel)" : "url(#gH-dark)"}" ${ol(.9)}/>`).join("") + Array.from({ length: n + 1 }, (_, i) => `<circle cx="${i * 12 + 4}" cy="0" r="2.8" fill="url(#gR-chrome)" ${ol(.6)}/>`).join("") }; },
  lever(desc) { const L = /PEDAL|STAND/.test(desc) ? 150 : 124; const d = `M0,-9 Q10,-15 22,-11 L${L - 6},3 Q${L},7 ${L - 4},12 L18,11 Q4,11 0,4 Z`;
    return { w: L + 6, h: 46, draw: () => shadow3(L / 2, 14, L / 2, 5) + slab3(d, "alu", 3, 4) + hole3(10, -1, 5) }; },
  bar() { const d = "M6,20 L40,20 Q60,20 70,4 L90,-14 H150 L170,4 Q180,20 200,20 L234,20"; return { w: 240, h: 56, draw: () => shadow3(120, 26, 116, 5) + tube3(d, 12, "chrome") }; },
  wheel(desc) { const R = /TIRE|TYRE/.test(desc) ? 92 : 82, ry = R * .9;
    return { w: R * 2 + 12, h: ry * 2 + 10, draw: () => /TIRE|TYRE/.test(desc) ? shadow3(R + 6, ry * .95, R, 8) + `<ellipse cx="${R + 8}" cy="0" rx="${R}" ry="${ry}" fill="#1c1d1f"/><ellipse cx="${R}" cy="0" rx="${R}" ry="${ry}" fill="url(#gR-rubber)" ${ol(1.2)}/>` + Array.from({ length: 30 }, (_, i) => { const a = i / 30 * Math.PI * 2; return `<line x1="${R1(R + Math.cos(a) * R * .86)}" y1="${R1(Math.sin(a) * ry * .86)}" x2="${R1(R + Math.cos(a) * R * .98)}" y2="${R1(Math.sin(a) * ry * .98)}" stroke="#55595e" stroke-width="1.4"/>`; }).join("") + `<ellipse cx="${R}" cy="0" rx="${R1(R * .74)}" ry="${R1(ry * .74)}" fill="#fff" ${ol(1)}/>`
      : /TUBE|PROTECTOR|BAND/.test(desc) ? `<ellipse cx="${R}" cy="0" rx="${R1(R * .86)}" ry="${R1(ry * .86)}" fill="none" stroke="${DK.ink}" stroke-width="13"/><ellipse cx="${R}" cy="0" rx="${R1(R * .86)}" ry="${R1(ry * .86)}" fill="none" stroke="${/BAND|PROTECTOR/.test(desc) ? "#c7b98f" : "#3a3c3e"}" stroke-width="10"/>`
      : shadow3(R, ry * .95, R, 7) + `<ellipse cx="${R}" cy="0" rx="${R}" ry="${ry}" fill="none" stroke="${DK.ink}" stroke-width="9"/><ellipse cx="${R}" cy="0" rx="${R}" ry="${ry}" fill="none" stroke="${DMAT.chrome[1]}" stroke-width="6"/><ellipse cx="${R}" cy="-1" rx="${R - 1}" ry="${ry - 1}" fill="none" stroke="#fff" stroke-width="1.2"/>` + (/SPOKE|WHEEL|HUB|DRUM/.test(desc) ? Array.from({ length: 20 }, (_, i) => { const a = i / 20 * Math.PI * 2; return `<line x1="${R1(R + Math.cos(a) * 16)}" y1="${R1(Math.sin(a) * 16)}" x2="${R1(R + Math.cos(a + .3) * (R - 4))}" y2="${R1(Math.sin(a + .3) * (ry - 4))}" stroke="#7a8288" stroke-width=".9"/>`; }).join("") + ring3(R, 20, 8, 10, "alu").replace(/<ellipse[^>]*filter[^>]*\/>/, "") : "") }; },
  disc() { const R = 62; return { w: R * 2, h: R * E3 * 2 + 14, draw: () => ring3(R, R, R * .22, 5, "steel") + `<ellipse cx="${R}" cy="0" rx="${R1(R * .55)}" ry="${R1(R * .55 * E3)}" fill="url(#gR-dark)" ${ol(.8)}/>` + Array.from({ length: 6 }, (_, i) => { const a = i / 6 * Math.PI * 2; return hole3(R + Math.cos(a) * R * .42, Math.sin(a) * R * .42 * E3, 3.2); }).join("") + `<ellipse cx="${R}" cy="0" rx="${R1(R * .22)}" ry="${R1(R * .22 * E3)}" fill="#fff" ${ol(.8)}/>` + Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; return `<circle cx="${R1(R + Math.cos(a) * R * .8)}" cy="${R1(Math.sin(a) * R * .8 * E3)}" r="1.6" fill="#6a7178"/>`; }).join("") }; },
  tank() { const d = "M10,10 C10,-40 60,-62 140,-62 C220,-62 270,-40 270,0 C270,40 250,60 200,62 L60,62 C30,62 10,46 10,10 Z";
    return { w: 290, h: 140, draw: () => shadow3(140, 60, 130, 10) + `<path d="${d}" fill="url(#gR-paint)" ${ol(1.2)}/><path d="M40,-20 C90,-50 190,-50 240,-20" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="5" stroke-linecap="round"/><path d="M30,14 C90,-12 200,-12 250,14" fill="none" stroke="#c9a24c" stroke-width="3"/>` + ring3(140, 22, 0, 6, "chrome").replace(/<ellipse[^>]*filter[^>]*\/>/, "").replace(/<path/, `<path transform="translate(0,-60)"`).replace(/<ellipse cx="140" cy="0"/g, `<ellipse cx="140" cy="-60"`) }; },
  seat() { const d = "M0,20 C0,-10 30,-30 90,-30 L170,-36 C220,-40 280,-30 296,-6 C300,4 296,24 280,30 L20,40 C6,40 0,32 0,20 Z";
    return { w: 304, h: 96, draw: () => shadow3(150, 40, 145, 7) + `<path d="${d}" transform="translate(4,8)" fill="#1a1c1e"/><path d="${d}" fill="url(#gR-black)" ${ol(1.1)}/><path d="M30,8 C100,-16 220,-20 280,-6" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="6" stroke-linecap="round"/>` + [80, 140, 200].map(x => `<path d="M${x},-28 Q${x + 4},2 ${x},34" fill="none" stroke="#55595e" stroke-width=".8"/>`).join("") }; },
  fender() { const d = "M0,30 C40,-40 200,-40 240,30 L226,34 C190,-20 50,-20 14,34 Z"; return { w: 250, h: 84, draw: () => shadow3(120, 32, 115, 6) + slab3(d, "chrome", 4, 6) + `<path d="M24,22 C60,-24 180,-24 216,22" fill="none" stroke="#fff" stroke-width="2"/>` + [[70, -10], [170, -10]].map(([x, y]) => hole3(x, y, 3)).join("") }; },
  muffler() { return { w: 330, h: 66, draw: () => shadow3(165, 26, 160, 6) + cyl3(0, 70, 16, "chrome") + `<path d="M70,-8 L96,-24 H96 V24 L70,8 Z" fill="url(#gH-chrome)" ${ol()}/>` + cyl3(96, 214, 48, "chrome") }; },
  frame() { const p = "M40,-80 L120,-100 L330,-70 L400,40 L300,100 M120,-100 L150,90 L300,100 L330,-70 M150,90 L40,-80 M40,-80 L30,-110 M300,100 L410,110"; return { w: 420, h: 232, draw: () => shadow3(220, 110, 200, 10) + tube3(p, 9, "black") }; },
  arm() { const d = "M0,-14 Q0,-26 14,-26 H290 Q300,-26 300,-16 V16 Q300,26 290,26 H14 Q0,26 0,14 Z"; return { w: 312, h: 70, draw: () => shadow3(150, 30, 150, 6) + slab3(d, "black", 6, 6) + hole3(16, 0, 9) + hole3(284, 0, 7) }; },
  shock() { return { w: 224, h: 66, draw: () => shadow3(110, 28, 110, 6) + cyl3(30, 150, 18, "chrome") + SHAPES.spring("BIG").draw().replace(/<ellipse[^>]*filter[^>]*\/>/, "").replace(/M(\d)/g, "M$1") .replace(/<path d="M/g, `<path transform="translate(44,0) scale(1.45,1.7)" d="M`) + cyl3(0, 30, 24, "chrome") + cyl3(180, 40, 26, "chrome") }; },
  meter() { const R = 46; return { w: R * 2 + 14, h: R * 2 + 6, draw: () => shadow3(R + 6, R * .95, R, 6) + `<ellipse cx="${R + 10}" cy="0" rx="${R}" ry="${R}" fill="#1c1d1f"/><circle cx="${R}" cy="0" r="${R}" fill="url(#gR-chrome)" ${ol()}/><circle cx="${R}" cy="0" r="${R1(R * .84)}" fill="#202326" ${ol(.8)}/>` + Array.from({ length: 11 }, (_, i) => { const a = Math.PI * (.8 + i * .14); return `<line x1="${R1(R + Math.cos(a) * R * .66)}" y1="${R1(Math.sin(a) * R * .66)}" x2="${R1(R + Math.cos(a) * R * .78)}" y2="${R1(Math.sin(a) * R * .78)}" stroke="#e9eef1" stroke-width="1.2"/>`; }).join("") + `<line x1="${R}" y1="0" x2="${R1(R + R * .5)}" y2="${R1(-R * .3)}" stroke="#d0892e" stroke-width="1.8"/><path d="M${R - R * .6},${-R * .5} A${R * .8},${R * .8} 0 0,1 ${R + R * .3},${-R * .76}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="5"/>` }; },
  valve() { return { w: 156, h: 46, draw: () => shadow3(78, 18, 74, 4) + cyl3(22, 132, 8, "steel") + `<path d="M0,-19 Q14,-19 26,-4 V4 Q14,19 0,19 Z" fill="url(#gH-steel)" ${ol()}/><ellipse cx="0" cy="0" rx="5" ry="19" fill="url(#gD-steel)" ${ol(.9)}/>` }; },
  piston() { return { w: 92, h: 100, draw: () => shadow3(44, 44, 42, 6) + `<path d="M2,-28 V36 A42,14 0 0,0 86,36 V-28 Z" fill="url(#gH-alu)" ${ol()}/><ellipse cx="44" cy="-28" rx="42" ry="14" fill="url(#gR-alu)" ${ol()}/>` + [-16, -8, 0].map(y => `<path d="M2,${y} A42,14 0 0,0 86,${y}" fill="none" stroke="${DK.ink}" stroke-width="1.2"/>`).join("") + hole3(44, 18, 9) }; },
  key() { return { w: 76, h: 34, draw: () => shadow3(38, 12, 36, 3) + ring3(14, 14, 5, 4, "zinc").replace(/<ellipse[^>]*filter[^>]*\/>/, "") + slab3("M27,-4 H72 V4 H62 V10 H56 V4 H27 Z", "zinc", 2, 2) }; },
  emblem() { return { w: 116, h: 40, draw: () => shadow3(56, 14, 54, 4) + slab3("M6,-17 H104 Q110,-17 110,-11 V11 Q110,17 104,17 H6 Q0,17 0,11 V-11 Q0,-17 6,-17 Z", "chrome", 3, 3) + [0, 1, 2].map(i => `<line x1="${14 + i * 30}" y1="-6" x2="${34 + i * 30}" y2="6" stroke="#6a7178" stroke-width="2.4"/>`).join("") }; },
  mirror() { return { w: 136, h: 86, draw: () => shadow3(68, 34, 62, 5) + tube3("M70,0 L126,36", 5, "chrome") + `<ellipse cx="44" cy="-10" rx="40" ry="26" fill="#1c1d1f"/><ellipse cx="40" cy="-14" rx="38" ry="24" fill="url(#gR-chrome)" ${ol()}/><ellipse cx="40" cy="-14" rx="31" ry="18" fill="#dfe9ef" stroke="${DK.fine}" stroke-width=".7"/>` }; },
  fuse() { return { w: 44, h: 20, draw: () => shadow3(22, 8, 20, 2.5) + `<rect x="8" y="-5" width="26" height="10" rx="5" fill="rgba(225,235,240,.8)" ${ol(.8)}/><line x1="10" y1="0" x2="32" y2="0" stroke="#d0892e" stroke-width="1"/>` + cyl3(0, 8, 12, "brass") + cyl3(33, 8, 12, "brass") }; },
  filter() { return { w: 160, h: 100, draw: () => shadow3(78, 42, 76, 7) + `<path d="M0,-40 L12,-50 H160 V36 L148,46 Z" fill="${DMAT.cast[2]}" ${ol()}/><rect x="0" y="-40" width="148" height="86" rx="10" fill="url(#gD-cast)" ${ol()}/>` + Array.from({ length: 12 }, (_, i) => `<line x1="${14 + i * 11}" y1="-30" x2="${14 + i * 11}" y2="36" stroke="#8b8f93" stroke-width="1.6"/><line x1="${15.5 + i * 11}" y1="-30" x2="${15.5 + i * 11}" y2="36" stroke="#fff" stroke-width=".6"/>`).join("") }; },
  rod() { return { w: 76, h: 196, draw: () => shadow3(38, 92, 36, 5) + ring3(38, 22, 11, 8, "steel").replace(/<ellipse[^>]*filter[^>]*\/>/, "").replace(/<(path|ellipse) /g, `<$1 transform="translate(0,-70)" `) + slab3("M26,-52 L30,40 H46 L50,-52 Z", "steel", 3, 2) + slab3("M0,52 Q0,40 12,40 H64 Q76,40 76,52 V62 H0 Z", "steel", 3, 3) + slab3("M0,68 H76 V76 Q76,90 62,90 H14 Q0,90 0,76 Z", "steel", 3, 3) }; },
  float() { return { w: 126, h: 54, draw: () => shadow3(62, 22, 60, 5) + `<g transform="translate(0,0)">${cyl3(0, 46, 36, "brass")}</g><g transform="translate(76,0)">${cyl3(0, 46, 36, "brass")}</g>` + slab3("M44,-6 H80 V6 H44 Z", "brass", 2, 2) }; },
  pad() { return { w: 76, h: 46, draw: () => shadow3(38, 18, 36, 4) + slab3("M0,-14 Q0,-20 6,-20 H64 Q70,-20 70,-14 V-6 H0 Z", "steel", 3, 3) + `<path d="M4,-6 H66 V14 Q66,20 60,20 H10 Q4,20 4,14 Z" fill="url(#h-friction)" ${ol()}/>` + hole3(12, -13, 3) }; },
  ball() { return { w: 20, h: 22, draw: () => shadow3(10, 8, 8, 2) + `<circle cx="10" cy="0" r="9" fill="url(#gR-chrome)" ${ol(.9)}/>` }; },
  generic() { const w = 66, h = 46; return { w: w + 8, h: h + 8, draw: () => shadow3(w / 2, h / 2 + 2, w / 2, 5) + slab3(`M8,${-h / 2} H${w - 8} Q${w},${-h / 2} ${w},${-h / 2 + 8} V${h / 2 - 8} Q${w},${h / 2} ${w - 8},${h / 2} H8 Q0,${h / 2} 0,${h / 2 - 8} V${-h / 2 + 8} Q0,${-h / 2} 8,${-h / 2} Z`, "steel", 5, 4) }; },
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
  [/^(SPACER|COLLAR|BUSH|SLEEVE|GRIP|GUIDE,VALVE)/, "sleeve"], [/^(CAP|KNOB|SOCKET|TAPPET|NIPPLE)/, "cap"], [/^PLUG/, "plug"], [/^(GROMMET|CUSHION|RUBBER|BOOT|MOUNT)/, "grommet"],
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
    const lay = fixed ? cmsPlace(items, fixed) : cmsLayout(items); const H = Math.max(420, lay.H), W = lay.W || 1200;
    // the part everything else fits onto: a body part first, fasteners and gaskets never
    const RANK = [/^FRAME/, /^(CRANKCASE|HEAD ASSEMBLY,CYLINDER|CYLINDER$|CYLINDER,)/, /^(TANK ASSEMBLY,FUEL|SWING ARM|SEAT ASSEMBLY|FENDER)/, /^(HOUSING|CASE|BODY|COVER|PAN)/, /^(WHEEL|CASTING WHEEL|HUB|RIM|TIRE)/, /^(SHAFT|CAMSHAFT|CRANKSHAFT|AXLE|STEM)/, /^(CALIPER|CYLINDER ASSEMBLY|MOTOR|GENERATOR|SWITCH|LAMP|HEADLAMP|SPEEDOMETER|TACHOMETER|CARBURETOR|HANDLEBAR|BATTERY|HARNESS|PUMP)/, /^(GEAR|HUB|SPROCKET|ROTOR|DISC)/];
    const rankOf = it => { const d0 = String(it.rows[0][2]).toUpperCase(); const i = RANK.findIndex(re => re.test(d0)); return i < 0 ? 99 : i; };
    const main = items.slice().sort((a, b) => rankOf(a) - rankOf(b) || b.w * b.h * (b.sc || 1) ** 2 - a.w * a.h * (a.sc || 1) ** 2)[0];
    const parts = items.map(it => {
      const p0 = lay.pos[it.k], sc = it.sc || 1, w = it.w * sc, h = it.h * sc;
      const names = [...new Set(it.rows.map(r => r[2]))];
      return { k: it.k, ref: it.ref === "–" ? "" : it.ref, name: cmsName(names[0]), short: cmsName(names[0]), len: w, w, h, z: it === main ? 1 : 3, e: p0,
        anchor: [w / 2, 0], co: [0, -h / 2 - 26], toward: it === main ? null : main.k, draw: sc === 1 ? it.draw : () => `<g class="scaled" transform="scale(${sc.toFixed(3)})">${it.draw()}</g>`,
        note: it.rows.length > 1 ? `${it.rows.length} versions in the catalogue. Check the frame or engine number to pick the right one.` : "" };
    });
    cmsAssemble(parts, parts.find(q => q.k === main.k));
    DIAGRAMS.push({ id: "CMS-" + blk, blk, gen: true, fig, title, system: sys, models: cmsModels(pg.title), kinds: ["exploded", "assembled"], vb: [W, H],
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
