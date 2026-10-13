/* ============ 3D parts model: fuel tank, GS750B 1977 (CMSNL BLCK0037) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: same as the front fork leg model (DG-CH-01): +X = rider's LEFT, +Y up, +Z forward. Right-handed, no mirrorX.
   Bike centre line is X = 0. Tank long axis runs along Z, front of the tank at +Z.
   Identity and numbering: CMSNL page BLCK0037 and its picture. The layout (filler cap under a locking cover, the cover holder
   at the front, two rubber front mounts, a rubber pad under the tank and a bolted rear mount through rubbers) follows that picture.
   Geometry: APPROXIMATE. The shell is three overlapping turned bodies (two side lobes and a raised centre lobe) laid along Z, which
   gives a rounded teardrop tank with a shallow frame groove underneath. No size here is a factory measurement.
   The frame, its front mount pegs and its rear mount bracket are not on this page and are not drawn.
   The builder D3_TANK_BUILD is reused by the GS750C,EC page (d3_blck0038.js) and the GS750N,EN page (d3_blck0039.js), which use the
   same tank hardware with different ref numbers.
   Emblem lettering is built from raised strokes in the emblem's own XY plane (reading along +x, raised toward +z) and turned so it
   reads left to right from outside the bike on both sides. */
const D3_TANK_BUILD = cfg => {
  const R = cfg.refs, D2R = Math.PI / 180;
  const TLD = 9, TL = TLD * D2R, sT = Math.sin(TL), cT = Math.cos(TL); // the lobe axes rise 9 degrees toward the front
  const Y0 = 115, X0 = 40, LIFT = 8;                         // lobe axis height, side lobe offset, centre lobe lift
  // centre lobe (gives the ends and the top) and side lobes (give the width), radius along the axis [s, r]
  const PC = [[-272, 0], [-270, 26], [-262, 40], [-240, 48], [-180, 62], [-110, 82], [-30, 100], [40, 107], [100, 108], [150, 104], [185, 95],
    [210, 80], [226, 60], [236, 38], [240, 0]];
  const PS = [[-252, 0], [-245, 10], [-220, 22], [-180, 36], [-110, 62], [-30, 88], [40, 99], [100, 100], [150, 94], [185, 78], [205, 58],
    [216, 38], [222, 0]];
  const lerp = (P, s) => { if (s <= P[0][0]) return P[0][1]; for (let i = 1; i < P.length; i++) if (s <= P[i][0]) { const [a, ra] = P[i - 1], [b, rb] = P[i]; return ra + (rb - ra) * (s - a) / (b - a); } return 0; };
  const rS = s => lerp(PS, s), rCn = s => lerp(PC, s);
  const yc = s => Y0 + s * sT;
  // world point on a lobe: xl = lobe centre x, lift, s along the axis, r, th = angle in the cross-section (0 = +x side, 90 = top)
  const P = (xl, lift, s, r, th) => { const c = Math.cos(th * D2R), n = Math.sin(th * D2R); return [xl + r * c, yc(s) + lift + r * n * cT, s * cT - r * n * sT]; };
  const LOBES = [[X0, 0, rS], [-X0, 0, rS], [0, LIFT, rCn]];
  // lowest tank surface at lateral x, axis station s (union of lobes)
  const bottomY = (x, s) => Math.min(...LOBES.map(([xl, lift, rf]) => { const r = rf(s), d = Math.abs(x - xl); return d < r ? yc(s) + lift - Math.sqrt(r * r - d * d) * cT : 1e9; }));
  const topY = (x, s) => Math.max(...LOBES.map(([xl, lift, rf]) => { const r = rf(s), d = Math.abs(x - xl); return d < r ? yc(s) + lift + Math.sqrt(r * r - d * d) * cT : -1e9; }));
  // outer surface of the union along a ray in the cross-section at station s, from (0, 8) above the axis, angle th: [x, y, z]
  const ray = (s, th, o) => { const dx = Math.cos(th * D2R), dy = Math.sin(th * D2R); let best = 0;
    LOBES.forEach(([xl, lift, rf]) => { const r = rf(s); if (!r) return; const ox = -xl, oy = 8 - lift, b = ox * dx + oy * dy, c = ox * ox + oy * oy - r * r, D = b * b - c; if (D >= 0) best = Math.max(best, -b + Math.sqrt(D)); });
    const u = (best + (o || 0)) * dx, v = 8 + (best + (o || 0)) * dy; return [u, yc(s) + v * cT, s * cT - v * sT]; };
  const lobe = (prof, xl, lift) => ({ type: "lathe", pts: prof.map(([s, r]) => [r, s]), rot: [90 - TLD, 0, 0], at: [xl, Y0 + lift, 0] });
  const zOf = s => s * cT; // close enough for placing small parts along the top/bottom

  // ---------- lettering ----------
  const seg = (x1, y1, x2, y2, w, th, z0) => { const L = Math.hypot(x2 - x1, y2 - y1); return { type: "box", size: [L + w, w, th], r: Math.min(.4, w / 3),
    rot: [0, 0, Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI], at: [(x1 + x2) / 2, (y1 + y2) / 2, z0 + th / 2] }; };
  const GLYPH = { // strokes in a 12 x 18 box, origin bottom-left
    S: [[3, 18, 12, 18], [0, 15, 3, 18], [0, 15, 0, 11], [0, 11, 2, 9], [2, 9, 10, 9], [10, 9, 12, 7], [12, 7, 12, 3], [12, 3, 9, 0], [9, 0, 0, 0]],
    U: [[0, 18, 0, 3], [0, 3, 3, 0], [3, 0, 9, 0], [9, 0, 12, 3], [12, 3, 12, 18]],
    Z: [[0, 18, 12, 18], [12, 18, 0, 0], [0, 0, 12, 0]],
    K: [[0, 0, 0, 18], [0, 8, 12, 18], [4, 11, 12, 0]],
    I: [[6, 0, 6, 18]],
  };
  const word = (txt, k, w, th, z0, mat) => { const pitch = 16 * k, x0 = -(txt.length * pitch - 4 * k) / 2, y0 = -9 * k; const items = [];
    [...txt].forEach((ch, i) => GLYPH[ch].forEach(s => items.push(Object.assign(seg(x0 + i * pitch + s[0] * k, y0 + s[1] * k, x0 + i * pitch + s[2] * k, y0 + s[3] * k, w, th, z0), mat ? { mat } : {})))); return items; };
  const EW = 132, EH = 28, ET = 2.5; // emblem plate length, height, thickness
  const emblemGeom = { type: "group", items: [
    { type: "extrude", pts: [[-EW / 2 + 8, EH / 2], [-EW / 2, -EH / 2], [EW / 2 - 8, -EH / 2], [EW / 2, EH / 2]], depth: ET, bevel: .5 },
    ...word("SUZUKI", 1.25, 2.8, 1.2, ET + .4, "black") ] };

  // ---------- key stations ----------
  const sF = 100;                                              // filler neck station
  const FT = [0, topY(0, sF), zOf(sF) - rCn(sF) * sT];          // top of the tank at the filler (world)
  const yN = FT[1], zN = FT[2];
  // the cap cover profile (side view) follows the centre top line of the tank
  const T0 = z => { let best = null; for (let s = -280; s <= 250; s += 1) { const p = P(0, LIFT, s, rCn(s), 90); if (best === null || Math.abs(p[2] - z) < Math.abs(best[2] - z)) best = p; } return best[1]; };
  const Tside = (z, x) => { const s = z / cT; return topY(x, s); };
  const zR = -50, zF = 172, aw = 40;                           // cover rear and front ends, half length of the arch over the cap
  const CAPTOP = yN + 21, ARCH = yN + 24, LIDTOP = yN + 28;
  const lidTop = [[zR, T0(zR) + 6], [zR + 30, T0(zR + 30) + 12], [zN - 55, LIDTOP - 3], [zN - 30, LIDTOP], [zN + 30, LIDTOP], [zN + 52, LIDTOP - 2], [zF - 10, T0(zF - 10) + 18], [zF, T0(zF) + 10]];
  const lidBot = [];
  lidBot.push([zF, T0(zF) + 4]);
  for (let z = zF - 6; z > zN + aw; z -= 8) lidBot.push([z, T0(z) + 4]);
  lidBot.push([zN + aw, T0(zN + aw) + 4], [zN + aw, ARCH], [zN - aw, ARCH], [zN - aw, T0(zN - aw) + 1]);
  for (let z = zN - aw - 10; z > zR; z -= 10) lidBot.push([z, T0(z) + 1]);
  lidBot.push([zR, T0(zR) + 1]);
  const lidPts = [...lidTop, ...lidBot];
  const LW = 42; // cover half width
  const skirtBot = []; for (let z = zF; z >= zR; z -= 8) skirtBot.push([z, Tside(z, LW - 1.5) + 1]);
  const skirtPts = [...lidTop, ...(skirtBot[skirtBot.length - 1][0] > zR ? [...skirtBot, [zR, Tside(zR, LW - 1.5) + 1]] : skirtBot)];
  const lidAt = (zz, extra) => { // lid top height at z (interpolated) for parts sitting on the cover
    for (let i = 1; i < lidTop.length; i++) if (zz <= lidTop[i][0]) { const [a, ya] = lidTop[i - 1], [b, yb] = lidTop[i]; return ya + (yb - ya) * (zz - a) / (b - a) + (extra || 0); } return 0; };

  const zL = zF - 14;             // lock station on the cover front
  const zB = zR + 16;             // cover bolts station (rear end)
  const zH = 198;                 // cover holder station (front of the tank top)
  const yH = Tside(zH, 0);        // tank top at the holder
  const sFC = 165, zFC = zOf(sFC), yFC = bottomY(62, sFC) - 15;   // front mount bracket hole
  const sRR = -236, zRR = zOf(sRR), yRB = bottomY(0, sRR), yRR = yRB - 18; // rear mount tab hole
  const sPad = -140, zPad = zOf(sPad), yPad = bottomY(12, sPad);  // rubber pad under the tank

  // stripe loop on one side (s = +1 left, -1 right), drawn just proud of the side lobe
  const stripe = sd => { const pts = [], up = 40, lo = -36, sA = -222, sB = 196, o = 1.6;
    const at = (s, th) => { const p = ray(s, th, o); return [sd * p[0], p[1], p[2]]; };
    for (let s = sA; s <= sB; s += 14) pts.push(at(s, up));
    for (let th = up - 16; th > lo; th -= 16) pts.push(at(sB + 6, th));
    for (let s = sB; s >= sA; s -= 14) pts.push(at(s, lo));
    for (let th = lo + 16; th < up; th += 16) pts.push(at(sA - 6, th));
    pts.push(at(sA, up));
    return { type: "tube", r: 2.2, pts };
  };

  const bracketPlate = (sd) => ({ type: "extrude", pts: [[zFC - 14, bottomY(62, sFC) + 7], [zFC - 14, yFC - 4], [zFC - 8, yFC - 13], [zFC + 8, yFC - 13], [zFC + 14, yFC - 4], [zFC + 14, bottomY(62, sFC) + 7]],
    holes: [[zFC, yFC, 9]], depth: 2.5, bevel: .3, rot: [0, -90, 0], at: [sd * 62 + 1.25, 0, 0] });

  const tank = { id: "tank", ref: R.tank, name: "Fuel tank", mat: "dark", shell: true, stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, -1, 0],
    geom: { type: "group", items: [
      lobe(PS, X0, 0), lobe(PS, -X0, 0), lobe(PC, 0, LIFT),
      { type: "ring", ro: 34, ri: 26, h: 11, at: [0, yN - 7, zN], mat: "chrome" },            // filler neck
      { type: "cyl", r: 26, h: 1, at: [0, yN - 4, zN], mat: "black" },                         // opening
      { type: "box", size: [60, 3, 22], r: .8, rot: [-TLD, 0, 0], at: [0, Tside(zB, 30) + .5, zB], mat: "dark" },   // hinge base for the cover
      { type: "box", size: [2.5, 21, 24], r: .5, at: [-1.25, yH + 8, zH] },                     // welded tab for the cover holder
      bracketPlate(1), bracketPlate(-1),                                                        // front mount brackets
      { type: "extrude", pts: [[zRR - 13, yRB + 8], [zRR - 13, yRR - 6], [zRR - 6, yRR - 14], [zRR + 6, yRR - 14], [zRR + 13, yRR - 6], [zRR + 13, yRB + 8]],
        holes: [[zRR, yRR, 6.2]], depth: 2, bevel: .3, rot: [0, -90, 0], at: [1, 0, 0] },       // rear mount tab
      { type: "box", size: [30, 4, 44], r: 1, at: [32, bottomY(32, -70) + 1, zOf(-70)], mat: "steel" }, // fuel cock mounting plate
    ] } };

  const parts = [tank];
  const push = p => parts.push(p);
  // stripes and emblems, both sides
  [[1, "left"], [-1, "right"]].forEach(([sd, nm]) => {
    push({ id: "stripe" + nm, ref: R.tape, name: `Stripe tape (${nm} side)`, mat: "brass", parent: "tank", stage: 1, A: [0, 0, 0], E: [sd * 170, 0, 0], dir: [-sd, 0, 0], geom: stripe(sd) });
    const sE = 72, pE = ray(sE, 0, 1), xE = sd * pE[0], yE = pE[1], zE = pE[2];
    push({ id: "emb" + nm, ref: R.emblem, name: `Emblem (SUZUKI, ${nm} side)`, mat: "chrome", parent: "tank", stage: 2, A: [xE, yE, zE], E: [sd * 330, yE, zE], dir: [-sd, 0, 0],
      geom: Object.assign({}, emblemGeom, { rot: [0, sd * 90, 0] }) });
    const sx = { type: "screwX", head: 1.8, headR: 3, len: 6, r: 1.5 };
    push({ id: "escr" + nm, ref: R.escrew, name: `Screws (emblem, ${nm} side)`, mat: "chrome", small: true, parent: "emb" + nm, stage: 2, count: 2,
      A: [xE + sd * ET, yE, zE], E: [sd * 365, yE, zE], dir: [-sd, 0, 0],
      geom: { type: "pair", at: [[0, 0, -EW / 2 + 9], [0, 0, EW / 2 - 9]], item: Object.assign({}, sx, sd > 0 ? { rot: [0, 180, 0] } : {}) } });
  });
  // filler cap
  push({ id: "gask", ref: R.gasket, name: "Gasket (filler cap)", mat: "rubber", small: true, parent: "tank", stage: 3, A: [0, yN + 4, zN], E: [0, yN + 60, zN], dir: [0, -1, 0],
    geom: { type: "ring", ro: 33, ri: 25.6, h: 3 } });
  push({ id: "cap", ref: R.cap, name: "Fuel filler cap", mat: "chrome", parent: "tank", stage: 3, A: [0, yN + 7, zN], E: [0, yN + 100, zN], dir: [0, -1, 0],
    geom: { type: "group", items: [
      { type: "lathe", pts: [[0, -10], [25.4, -10], [25.4, 0], [0, 0]], mat: "steel" },          // threaded spigot into the neck
      { type: "gear", r: 33.5, teeth: 36, h: 11, toothH: 1.4 },                                 // knurled grip ring
      { type: "lathe", pts: [[0, 11], [30, 11], [27, 13.5], [0, 14]] } ] } });
  // cover holder at the front of the tank top (bolted to the welded tab), with the latch spring
  const hx = 0;
  const yTg = lidAt(zL) + .6 - 16, lipC = yTg - 1 - 1.25 - (yH + 8); // holder lip sits just under the lock tongue
  push({ id: "holder", ref: R.holder, name: "Holder (fuel cap cover, front)", mat: "steel", parent: "tank", stage: 4, A: [hx, yH + 8, zH], E: [hx + 200, yH + 8, zH], dir: [-1, 0, 0],
    geom: { type: "group", items: [
      { type: "box", size: [2.5, lipC + 11.25, 22], r: .5, at: [1.25, (lipC + 1.25 - 10) / 2, 0] },
      { type: "box", size: [26, 2.5, 26], r: .5, at: [-11, lipC, -12] } ] } });
  const hb = { type: "group", items: [{ type: "hex", af: 8, h: 3.5, rot: [0, 0, -90] }, { type: "cyl", r: 2.5, h: 12, axis: "x", rot: [0, 180, 0] }] };
  push({ id: "hw", ref: R.hw, name: "Washer (holder bolt)", mat: "zinc", small: true, parent: "holder", stage: 4, A: [2.5, yH + 8, zH], E: [235, yH + 8, zH], dir: [-1, 0, 0],
    geom: { type: "ringX", ro: 5.5, ri: 2.6, h: 1, rot: [0, 0, 0] } });
  push({ id: "hlw", ref: R.hlw, name: "Lock washer (holder bolt)", mat: "spring", small: true, parent: "holder", stage: 4, A: [3.5, yH + 8, zH], E: [255, yH + 8, zH], dir: [-1, 0, 0],
    geom: { type: "ringX", ro: 4.6, ri: 2.6, h: 1.3 } });
  push({ id: "hb", ref: R.hb, name: "Bolt (holder)", mat: "zinc", small: true, parent: "holder", stage: 4, A: [4.8, yH + 8, zH], E: [285, yH + 8, zH], dir: [-1, 0, 0], geom: hb });
  const yLip = yH + 8 + lipC + 1.25; // top of the holder lip
  push({ id: "spring", ref: R.spring, name: "Spring (cover latch)", mat: "spring", parent: "holder", stage: 4, A: [-16, yLip, zH - 12], E: [-16, yLip + 70, zH - 12], dir: [0, -1, 0],
    geom: { type: "spring", R: 4.2, wire: .9, h: 10, turns: 5 } });
  push({ id: "slw", ref: R.slw, name: "Lock washer (spring screw)", mat: "spring", small: true, parent: "holder", stage: 4, A: [-16, yLip + 10, zH - 12], E: [-16, yLip + 95, zH - 12], dir: [0, -1, 0],
    geom: { type: "ring", ro: 4.8, ri: 2.6, h: 1.3, split: true } });
  push({ id: "sscr", ref: R.sscrew, name: "Screw (spring)", mat: "zinc", small: true, parent: "holder", stage: 4, A: [-16, yLip + 11.3, zH - 12], E: [-16, yLip + 120, zH - 12], dir: [0, -1, 0],
    geom: { type: "lathe", pts: [[0, -16], [2.4, -16], [2.4, 0], [4.2, 0], [4.4, 1.5], [3.6, 3], [0, 3.2]] } });
  // cap cover with lock, cushion and hinge bolts
  push({ id: "cover", ref: R.cover, name: "Cover (fuel filler cap)", mat: "dark", shell: true, parent: "tank", stage: 5, A: [0, 0, 0], E: [0, 190, 0], dir: [0, -1, 0],
    geom: { type: "group", items: [
      { type: "extrude", pts: lidPts, depth: 2 * LW, bevel: 1, rot: [0, -90, 0], at: [LW, 0, 0] },
      { type: "extrude", pts: skirtPts, depth: 2.5, bevel: .4, rot: [0, -90, 0], at: [LW, 0, 0] },
      { type: "extrude", pts: skirtPts, depth: 2.5, bevel: .4, rot: [0, -90, 0], at: [-LW + 2.5, 0, 0] },
      { type: "cyl", r: 12, h: 1.2, at: [0, lidAt(zL) - .6, zL], mat: "chrome" } ] } });
  push({ id: "ccush", ref: R.ccush, name: "Cushion (under the cover front)", mat: "rubber", small: true, parent: "cover", stage: 5, A: [24, T0(zF - 6) + .2, zF - 6], E: [24, T0(zF - 6) + 160, zF + 40], dir: [0, -1, 0],
    geom: { type: "lathe", pts: [[0, 0], [5, 0], [5.2, 3], [4, 3.8], [0, 3.8]] } });
  push({ id: "lock", ref: R.lock, name: "Lock (fuel cap cover)", mat: "chrome", parent: "cover", stage: 5, A: [0, lidAt(zL) + .6, zL], E: [0, lidAt(zL) + 300, zL], dir: [0, -1, 0],
    geom: { type: "group", items: [
      { type: "lathe", pts: [[0, -22], [8, -22], [8, 0], [11, 0], [11.5, 2.5], [10, 4.5], [0, 4.5]] },
      { type: "box", size: [1.6, 1, 9], r: .2, at: [0, 4.6, 0], mat: "black" },
      { type: "box", size: [8, 2, 14], r: .4, at: [0, -16, 13], mat: "steel" } ] } });            // latch tongue, reaches forward under the holder lip
  const yBt = lidAt(zB);
  push({ id: "cw", ref: R.cw, name: "Washers (cover bolts)", mat: "zinc", small: true, parent: "cover", stage: 5, count: 2, A: [0, yBt, zB], E: [0, yBt + 260, zB], dir: [0, -1, 0],
    geom: { type: "pair", at: [[22, 0, 0], [-22, 0, 0]], item: { type: "ring", ro: 5.5, ri: 2.6, h: 1 } } });
  push({ id: "clw", ref: R.clw, name: "Lock washers (cover bolts)", mat: "spring", small: true, parent: "cover", stage: 5, count: 2, A: [0, yBt + 1, zB], E: [0, yBt + 280, zB], dir: [0, -1, 0],
    geom: { type: "pair", at: [[22, 0, 0], [-22, 0, 0]], item: { type: "ring", ro: 4.6, ri: 2.6, h: 1.3, split: true } } });
  push({ id: "cb", ref: R.cb, name: "Bolts (cover hinge)", mat: "zinc", small: true, parent: "cover", stage: 5, count: 2, A: [0, yBt + 2.3, zB], E: [0, yBt + 310, zB], dir: [0, -1, 0],
    geom: { type: "pair", at: [[22, 0, 0], [-22, 0, 0]], item: { type: "group", items: [{ type: "hex", af: 8, h: 3.5 }, { type: "cyl", r: 2.5, h: 12, rot: [180, 0, 0] }] } } });
  // front rubber mounts (pushed into the brackets; the frame pegs go through them) and the pad under the tank
  [[1, "left"], [-1, "right"]].forEach(([sd, nm]) => push({ id: "fc" + nm, ref: R.fcush, name: `Cushion (front mount, ${nm})`, mat: "rubber", parent: "tank", stage: 6,
    A: [sd * 62, yFC, zFC], E: [sd * 200, yFC, zFC], dir: [-sd, 0, 0],
    geom: { type: "lathe", pts: [[4.5, -8], [14, -8], [14.5, -2], [9, -1.4], [9, 1.4], [14.5, 2], [14, 8], [4.5, 8]], rot: [0, 0, -90] } }));
  push({ id: "pad", ref: R.pad, name: "Cushion (pad under the tank)", mat: "rubber", parent: "tank", stage: 6, A: [0, yPad, zPad], E: [0, yPad - 110, zPad], dir: [0, 1, 0],
    geom: { type: "box", size: [24, 12, 70], r: 2, at: [0, -6, 0] } });
  // rear mount: tab on the tank, rubbers each side, spacer through, washer and bolt from the right side
  const SP = cfg.spacerLen;
  const rr = (id, ref, name, mat, A, E, geom, extra) => push(Object.assign({ id, ref, name, mat, parent: "tank", stage: 7, A: [A, yRR, zRR], E: [E, yRR, zRR], dir: [1, 0, 0], geom }, extra || {}));
  rr("rc2", R.rc2, "Cushion (rear mount, left of the tab)", "rubber", 1, 170, { type: "lathe", pts: [[6.1, 0], [12, 0], [13, 1.5], [13, 6], [12, 7.5], [6.1, 7.5]], rot: [0, 0, -90] }, { dir: [-1, 0, 0] });
  rr("rc1", R.rc1, "Cushion (rear mount, right of the tab)", "rubber", -8.5, -170, { type: "lathe", pts: [[6.1, 0], [12, 0], [13, 1.5], [13, 6], [12, 7.5], [6.1, 7.5]], rot: [0, 0, -90] });
  rr("rsp", R.rsp, `Spacer (rear mount, ${SP} mm long)`, "steel", -8.5, -210, { type: "ringX", ro: 6, ri: 4.1, h: SP }, { small: true });
  rr("rw", R.rw, "Washer (rear mount, 8.5 x 29 x 1.6)", "zinc", -10.1, -240, { type: "ringX", ro: 14.5, ri: 4.25, h: 1.6 }, { small: true });
  rr("rb", R.rb, "Bolt (rear mount, 8 x 30)", "zinc", -10.1, -285, { type: "group", items: [{ type: "hex", af: 12, h: 5.5, y: -5.5, rot: [0, 0, -90] }, { type: "cyl", r: 4, h: 30, axis: "x" }] }, { small: true });

  return {
    id: cfg.id, title: cfg.title, units: "mm", page: cfg.page,
    accuracy: "Approximate geometry. The layout and which part fits where follow the CMSNL picture for this page; shapes and sizes are modelled to typical 1970s tank proportions, not measured from a GS750. The cover latch and hinge details are a best reading of the picture. Check every fit and size against the real tank and the factory service manual.",
    view: { dir: [1.1, .85, .7], up: [0, 1, 0] },
    notModelled: cfg.notModelled,
    stages: [
      { t: "Stripe tape", d: "Clean the paint and lay the stripe tape on both sides of the tank, working out any air bubbles." },
      { t: "Emblems", d: "Fit the SUZUKI emblem on each side with its two screws. Snug only, so the plate doesn't crack the paint." },
      { t: "Filler cap", d: "Fit a new gasket on the filler neck and screw the cap in by hand." },
      { t: "Cover holder", d: "Bolt the holder to the tab at the front of the tank with its washer and lock washer. Fit the latch spring under its screw and lock washer." },
      { t: "Cap cover", d: "Fit the lock into the cover and the cushion under its front edge. Bolt the cover's rear end to the hinge with the washers and lock washers, then check it latches on the holder." },
      { t: "Front mounts and pad", d: "Push the rubber cushions into the two front brackets and set the pad on the frame under the tank. Lower the tank so the frame pegs go into the cushions." },
      { t: "Rear mount", d: "Fit a rubber on each side of the rear tab with the spacer through them, then the washer and bolt into the frame bracket. Don't crush the rubbers. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    ],
    parts,
  };
};
const D3_BLCK0037 = D3_TANK_BUILD({
  id: "CMS-BLCK0037", page: "BLCK0037", title: "Fuel tank (GS750B)", spacerLen: 17,
  refs: { tank: "1", tape: "2", emblem: "5", escrew: "6", cap: "7", gasket: "8", lock: "9", cover: "10", cb: "11", clw: "12", cw: "13", ccush: "14", holder: "15",
    hb: "16", hlw: "17", hw: "18", spring: "19", sscrew: "20", slw: "21", fcush: "22", pad: "23", rc1: "24", rc2: "25", rw: "26", rsp: "27", rb: "28" },
  notModelled: "Ref 3 is the same tank in another colour and ref 4 is the stripe set for it, so only ref 1 and its stripes (ref 2) are drawn. The touch-up paint can in the picture has no row on this page. The filler neck, the front brackets, the rear tab, the cover hinge base and the fuel cock mounting plate are part of the tank. The frame pegs and rear frame bracket belong to the frame and aren't drawn.",
});
D3_MODELS["CMS-BLCK0037"] = D3_BLCK0037;
