/* ============ 3D parts model: transmission, GS750B 1977 (CMSNL BLCK0074) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: the engine frame used by the crankshaft and cam chain models (DG-EN-02, CMS-BLCK0003): +X toward the right
   (clutch) side, +Y up, +Z forward. Both gearbox shafts run along X. The countershaft (Suzuki's name for the input shaft that
   carries the clutch) is on the line Y = 0, Z = 0 of this model; the drive shaft (output, sprocket on the left end) sits
   30 mm lower and 56 mm further back, so the shaft centres are about 63.5 mm apart. The crankshaft lies ahead of both (not drawn);
   the offset to it is not modelled. X = 0 is roughly the engine centreline. The clutch (DG-EN-03) would sit on the right end of
   the countershaft with its Y = 0 at about X = 62 here (its spacer sits against the inner race of bearing 9).
   Gear layout (both shafts, left to right): 2nd, 4th, 3rd, 5th, 1st. Countershaft: 1st drive is part of the shaft, 2nd drive is
   splined and fixed, 3rd drive is the sliding gear between 4th and 5th drive, which spin free. Drive shaft: 2nd, 3rd and 1st
   driven spin free; 4th driven slides to lock 2nd, 5th driven slides to lock 1st or 3rd. That is the usual Suzuki 5-speed
   layout with three shift forks; the exact order on a 1977 GS750 is not confirmed here.
   Tooth counts: 3rd pair 21/29 from the catalogue (refs 4 and 20). The other pairs (1st 16/40, 2nd 18/32, 4th 24/27,
   5th 26/25) were picked to give ratios close to the commonly quoted GS750 ratios (2.500, 1.777, 1.380, 1.125, 0.961);
   check them against the factory service manual. Bearings 25 x 62 x 17 and 20 x 47 x 14, oil seal 32 x 62 x 7,
   spacer 25 x 32 x 18.6, O-ring ID 24.5 and the 15-tooth sprocket are from the catalogue descriptions. Chain size 530
   (15.875 mm pitch) is typical for the GS750 but not stated on this page.
   Geometry: APPROXIMATE. Gear widths, shaft steps, dog shapes, washer and circlip positions are typical proportions, not measured.
   Every part's geometry is laid out in world coordinates, so every A is [0, 0, 0] and E is the exploded offset. */
const D3_BLCK0074 = (() => {
  const r3 = v => +(+v).toFixed(3);
  const CS = { y: 0, z: 0 }, DS = { y: -30, z: -56 };
  const C = Math.hypot(DS.y - CS.y, DS.z - CS.z);
  const PHI = Math.atan2(DS.z - CS.z, DS.y - CS.y) * 180 / Math.PI;      // direction countershaft -> drive shaft in the YZ plane
  // items are drawn along local +Y from y = 0; ax() turns local +Y into world +X and puts local y = 0 at world x0 on the shaft line
  const ax = (items, x0, s) => ({ type: "group", items, rot: [0, 0, -90], at: [r3(x0), s.y, s.z] });
  const RG = (ro, ri, h, o = {}) => ({ type: "lathe", pts: [[ri, 0], [ro, 0], [ro, h], [ri, h]], ...o });
  const ring = (n, R, y = 0, off = 0) => Array.from({ length: n }, (_, k) => { const a = (off + k * 360 / n) * Math.PI / 180; return [r3(Math.cos(a) * R), y, r3(Math.sin(a) * R), r3(-(off + k * 360 / n))]; });
  const holesAt = (n, R, r, off = 45) => Array.from({ length: n }, (_, k) => { const a = (off + k * 360 / n) * Math.PI / 180; return [r3(Math.cos(a) * R), r3(Math.sin(a) * R), r]; });

  // ---- gear pairs: pitch radii from the shaft centre distance, module from the tooth sum ----
  const pair = (nc, nd) => { const m = 2 * C / (nc + nd); return { nc, nd, m, rc: C * nc / (nc + nd), rd: C * nd / (nc + nd) }; };
  const G1 = pair(16, 40), G2 = pair(18, 32), G3 = pair(21, 29), G4 = pair(24, 27), G5 = pair(26, 25);
  // phase the teeth so they interleave on the line between the shafts (tooth tip on the countershaft gear, gap on the drive shaft gear)
  const psiC = n => r3(PHI - 180 - 1.5 * 360 / (4 * n)), psiD = n => r3(PHI - 3.5 * 360 / (4 * n));
  const gearC = (P, h, bore, o = {}) => ({ type: "gear", r: r3(P.rc + .9 * P.m), toothH: r3(2.05 * P.m), teeth: P.nc, h, bore, rot: [0, psiC(P.nc), 0], ...o });
  const gearD = (P, h, bore, o = {}) => ({ type: "gear", r: r3(P.rd + .9 * P.m), toothH: r3(2.05 * P.m), teeth: P.nd, h, bore, rot: [0, psiD(P.nd), 0], ...o });
  const rootC = P => P.rc - 1.15 * P.m, rootD = P => P.rd - 1.15 * P.m;
  // sliding gear: two toothed rims with the shift fork groove between them, dogs on one or both faces
  const dogs = (R, y, h) => ({ type: "array", pos: ring(4, R, y), item: { type: "box", size: [5, h, 6.5], r: .5, at: [0, h / 2, 0] } });
  const slider = (gear, root, rd, bore, left, right) => ({ type: "group", items: [
    { ...gear, h: 6 }, { ...gear, h: 6, at: [0, 10, 0] },
    RG(r3(root - 3), bore, 16),
    ...(left ? [dogs(rd, -3.5, 3.5)] : []), ...(right ? [dogs(rd, 16, 3.5)] : []) ] });
  const free = (gear, holeR, boss) => ({ type: "group", items: [
    { ...gear, holes: holesAt(4, holeR, 3.6) },
    ...(boss ? [RG(boss.r, gear.bore, boss.h, { at: [0, boss.y, 0] })] : []) ] });
  // ball bearing: inner race, outer race, balls
  const brg = (ri, ro, w) => { const t = (ro - ri) * .26, pr = (ri + ro) / 2, br = (ro - ri) * .27, n = Math.floor(2 * Math.PI * pr / (2 * br + 2.4));
    return { type: "group", items: [
      { type: "lathe", pts: [[ri, 0], [r3(ri + t), 0], [r3(ri + t + .8), r3(w / 2)], [r3(ri + t), w], [ri, w]] },
      { type: "lathe", pts: [[r3(ro - t), 0], [ro, 0], [ro, w], [r3(ro - t), w], [r3(ro - t - .8), r3(w / 2)]] },
      { type: "array", pos: ring(n, r3(pr), r3(w / 2)), item: { type: "sphere", r: r3(br), mat: "chrome" } } ] }; };
  const snap = (R) => ({ type: "clip", R, r: .9, gap: .45 });                 // C-ring in the bearing outer race groove
  const circlip = { type: "ring", ro: 17.5, ri: 13.8, h: 1.5, split: true };  // shaft circlip
  const lockW = { type: "group", items: [RG(19, 14, 1.5), { type: "array", pos: ring(6, 14, .75, 30), item: { type: "box", size: [1.6, 1.5, 3], r: .2 } }] }; // splined lock washer

  // ================= countershaft (ref 1): hollow, 20 mm journal on the left, 28 mm splined gear section, 25 mm on the right =================
  const X_CS0 = -108, X_CS1 = 140;
  const csShaft = ax([
    { type: "lathe", pts: [[3.2, 0], [10, 0], [10, 18], [14, 18], [14, 120], [12.5, 132], [12.5, 236], [10.5, 236], [10.5, 248], [3.2, 248]] },
    gearC(G1, 12, 12, { at: [0, 120, 0] }),                                    // 1st drive gear, part of the shaft
    { type: "array", pos: ring(12, 12.5, 180), item: { type: "box", size: [1.2, 50, 2.4], r: .2, mat: "dark" } }, // clutch splines
  ], X_CS0, CS);

  // ================= drive shaft (ref 15): sprocket thread and splines on the left, 25 mm journal, 28 mm gear section, 20 mm journal on the right =================
  const X_DS0 = -165, X_DS1 = 42;
  const dsShaft = ax([
    { type: "lathe", pts: [[0, 0], [10, 0], [10, 18], [12, 18], [12, 38.4], [12.5, 38.4], [12.5, 74], [16.5, 74], [16.5, 75.5], [14, 75.5], [14, 189.5], [10, 189.5], [10, 207], [0, 207]] },
    { type: "array", pos: ring(12, 12, 28.2), item: { type: "box", size: [1.2, 20, 2.4], r: .2, mat: "dark" } }, // sprocket splines
  ], X_DS0, DS);

  // ================= parts =================
  const ext = {}, P = [];
  const add = (id, ref, name, mat, x0, x1, geom, o = {}) => { ext[id] = [x0, x1]; P.push({ id, ref, name, mat, A: [0, 0, 0], E: [0, 0, 0], geom, ...o }); };
  const L = [-1, 0, 0], R = [1, 0, 0];

  add("cs", "1", "Countershaft with 1st drive gear (16 teeth)", "steel", X_CS0, X_CS1, csShaft, { stage: 11, dir: [0, -1, 0] });
  add("ds", "15", "Drive shaft", "steel", X_DS0, X_DS1, dsShaft, { stage: 0, dir: L });

  // countershaft, left to right
  add("b13", "13", "Bearing 20 x 47 x 14 (countershaft, left)", "steel", -105, -91, ax([brg(10, 23.5, 14)], -105, CS), { parent: "cs", stage: 4, dir: R });
  add("c14", "14", "C-ring (left countershaft bearing)", "spring", -104.4, -102.6, ax([snap(24)], -103.5, CS), { parent: "b13", stage: 4, dir: R, small: true });
  add("c2", "3", "2nd drive gear (18 teeth, splined)", "steel", -90, -76, ax([gearC(G2, 14, 14)], -90, CS), { parent: "cs", stage: 3, dir: R });
  add("c4", "5", "4th drive gear (24 teeth, free)", "steel", -75, -52, ax([free(gearC(G4, 12, 14), 19, { r: 17, h: 11, y: -11 })], -64, CS), { parent: "cs", stage: 3, dir: R });
  add("lw7b", "7", "Lock washer (4th drive gear)", "steel", -51.5, -50, ax([lockW], -51.5, CS), { parent: "cs", stage: 3, dir: R, small: true });
  add("cl8b", "8", "Circlip (4th drive gear)", "spring", -50, -48.5, ax([circlip], -50, CS), { parent: "cs", stage: 3, dir: R, small: true });
  add("c3", "4", "3rd drive gear (21 teeth, sliding)", "steel", -43.5, -20.5, ax([slider(gearC(G3, 6, 14), rootC(G3), 19, 14, true, true)], -40, CS), { parent: "cs", stage: 2, dir: R });
  add("cl8a", "8", "Circlip (5th drive gear)", "spring", -15, -13.5, ax([circlip], -15, CS), { parent: "cs", stage: 1, dir: R, small: true });
  add("lw7a", "7", "Lock washer (5th drive gear)", "steel", -13.5, -12, ax([lockW], -13.5, CS), { parent: "cs", stage: 1, dir: R, small: true });
  add("c5", "6", "5th drive gear (26 teeth, free)", "steel", -12, 11.5, ax([free(gearC(G5, 12, 14), 19, { r: 17, h: 11.5, y: 12 })], -12, CS), { parent: "cs", stage: 1, dir: R });
  add("b9", "9", "Bearing 25 x 62 x 17 (countershaft, right)", "steel", 26, 43, ax([brg(12.5, 31, 17)], 26, CS), { parent: "cs", stage: 4, dir: L });
  add("c10", "10", "C-ring (right countershaft bearing)", "spring", 40.1, 41.9, ax([snap(31.6)], 41, CS), { parent: "b9", stage: 4, dir: L, small: true });

  // retainer plate over the right bearing, two screws into the case
  const plate = (w, l, hole, screwAt, depth) => ({ type: "extrude", depth, bevel: .5, rot: [-90, 0, 0],
    pts: (() => { const p = []; for (let i = 0; i < 4; i++) { const cx = (i === 0 || i === 3) ? w / 2 - 8 : -w / 2 + 8, cy = i < 2 ? l / 2 - 8 : -l / 2 + 8, a0 = i * 90;
      for (let k = 0; k <= 6; k++) { const a = (a0 + k * 15) * Math.PI / 180; p.push([r3(cx + 8 * Math.cos(a)), r3(cy + 8 * Math.sin(a))]); } } return p; })(),
    holes: [[0, 0, hole], [0, screwAt, 3.3], [0, -screwAt, 3.3]] });
  // screw: shank along local -Y (into the case) when sgn = 1, head on the outside
  const screw = (Lg, sgn) => ({ type: "group", items: [
    { type: "lathe", pts: sgn > 0 ? [[0, -Lg], [3, -Lg], [3, 0], [0, 0]] : [[0, 0], [3, 0], [3, Lg], [0, Lg]] },
    { type: "lathe", pts: sgn > 0 ? [[0, 0], [5.2, 0], [5.2, 2.6], [3.8, 4], [0, 4]] : [[0, -4], [3.8, -4], [5.2, -2.6], [5.2, 0], [0, 0]] },
    { type: "box", size: [8, 1, 1.2], r: .2, at: [0, sgn > 0 ? 3.9 : -3.9, 0], mat: "black" } ] });
  const SCR = 37;  // screw distance from the shaft axis
  add("r11", "11", "Countershaft bearing retainer", "zinc", 43, 46, ax([plate(56, 92, 24, SCR, 3)], 43, CS), { stage: 12, dir: L });
  add("s12", "12", "Screws (bearing retainer)", "zinc", 34, 50, ax([{ type: "pair", pos: [[0, 3, SCR], [0, 3, -SCR]], item: screw(12, 1) }], 43, CS), { parent: "r11", stage: 12, dir: L, small: true, count: 2 });

  // drive shaft, left to right (gears go on from the right end)
  add("b29", "29", "Bearing 25 x 62 x 17 (drive shaft, left)", "steel", -108, -91, ax([brg(12.5, 31, 17)], -108, DS), { parent: "ds", stage: 10, dir: R });
  add("c30", "30", "C-ring (left drive shaft bearing)", "spring", -106.9, -105.1, ax([snap(31.6)], -106, DS), { parent: "b29", stage: 10, dir: R, small: true });
  add("w24", "24", "Thrust washer (2nd driven gear)", "steel", -89.5, -88, ax([RG(20, 14.1, 1.5)], -89.5, DS), { parent: "ds", stage: 5, dir: L, small: true });
  add("o2", "17", "2nd driven gear (32 teeth, free)", "steel", -88, -76, ax([free(gearD(G2, 12, 14), 24)], -88, DS), { parent: "ds", stage: 5, dir: L });
  add("lw18a", "18", "Lock washer (2nd driven gear)", "steel", -75.5, -74, ax([lockW], -75.5, DS), { parent: "ds", stage: 5, dir: L, small: true });
  add("cl19a", "19", "Circlip (2nd driven gear)", "spring", -74, -72.5, ax([circlip], -74, DS), { parent: "ds", stage: 5, dir: L, small: true });
  add("o4", "25", "4th driven gear (27 teeth, sliding)", "steel", -69.5, -50, ax([slider(gearD(G4, 6, 14), rootD(G4), 24, 14, true, false)], -66, DS), { parent: "ds", stage: 6, dir: L });
  add("cl22a", "22", "Circlip (3rd driven gear, left)", "spring", -41, -39.5, ax([circlip], -41, DS), { parent: "ds", stage: 7, dir: L, small: true });
  add("lw21", "21", "Lock washer (3rd driven gear, left)", "steel", -39.5, -38, ax([lockW], -39.5, DS), { parent: "ds", stage: 7, dir: L, small: true });
  add("o3", "20", "3rd driven gear (29 teeth, free)", "steel", -38, -26, ax([free(gearD(G3, 12, 14), 24)], -38, DS), { parent: "ds", stage: 7, dir: L });
  add("lw23", "23", "Lock washer (3rd driven gear, right)", "steel", -25.9, -24.4, ax([lockW], -25.9, DS), { parent: "ds", stage: 7, dir: L, small: true });
  add("cl22b", "22", "Circlip (3rd driven gear, right)", "spring", -24.4, -22.9, ax([circlip], -24.4, DS), { parent: "ds", stage: 7, dir: L, small: true });
  add("o5", "26", "5th driven gear (25 teeth, sliding)", "steel", -17.5, 5.5, ax([slider(gearD(G5, 6, 14), rootD(G5), 21, 14, true, true)], -14, DS), { parent: "ds", stage: 8, dir: L });
  add("cl19b", "19", "Circlip (1st driven gear)", "spring", 8.9, 10.4, ax([circlip], 8.9, DS), { parent: "ds", stage: 9, dir: L, small: true });
  add("lw18b", "18", "Lock washer (1st driven gear)", "steel", 10.4, 11.9, ax([lockW], 10.4, DS), { parent: "ds", stage: 9, dir: L, small: true });
  add("o1", "16", "1st driven gear (40 teeth, free)", "steel", 12, 24, ax([free(gearD(G1, 12, 14), 24)], 12, DS), { parent: "ds", stage: 9, dir: L });
  add("b27", "27", "Bearing 20 x 47 x 14 (drive shaft, right)", "steel", 24.5, 38.5, ax([brg(10, 23.5, 14)], 24.5, DS), { parent: "ds", stage: 10, dir: L });
  add("c28", "28", "C-ring (right drive shaft bearing)", "spring", 36.1, 37.9, ax([snap(24)], 37, DS), { parent: "b27", stage: 10, dir: L, small: true });

  // left end of the drive shaft: oil seal, plate, spacer, sprocket
  add("seal31", "31", "Oil seal 32 x 62 x 7 (drive shaft)", "rubber", -117, -110, ax([{ type: "lathe", pts: [[16.2, 0], [17.5, 0], [17.5, 1.5], [26, 1.5], [26, 0], [31, 0], [31, 7], [18.5, 7], [16, 5.2], [16, 3]] }], -117, DS), { stage: 13, dir: R, small: true });
  add("c32", "32", "C-ring (oil seal)", "spring", -119.15, -117.35, ax([snap(31.4)], -118.25, DS), { stage: 13, dir: R, small: true });
  add("g34", "34", "Gasket (drive shaft plate)", "brass", -120.3, -119.5, ax([{ ...plate(64, 96, 17, 37, .8), bevel: 0 }], -120.3, DS), { stage: 13, dir: R, small: true });
  add("p33", "33", "Drive shaft plate (oil seal retainer)", "zinc", -123.3, -120.3, ax([plate(64, 96, 17, 37, 3)], -123.3, DS), { stage: 13, dir: R });
  add("s35", "35", "Screws (drive shaft plate)", "zinc", -127.3, -111.3, ax([{ type: "pair", pos: [[0, 0, 37], [0, 0, -37]], item: screw(12, -1) }], -123.3, DS), { parent: "p33", stage: 13, dir: R, small: true, count: 2 });
  add("or40", "40", "O-ring (inside the spacer)", "rubber", -109.95, -108.45, ax([{ type: "torus", R: 13.2, r: .75 }], -109.2, DS), { parent: "ds", stage: 14, dir: R, small: true });
  add("sp37", "37", "Spacer 25 x 32 x 18.6 (runs in the oil seal)", "steel", -126.6, -108, ax([{ type: "lathe", pts: [[12.6, 0], [15.4, 0], [16, .6], [16, 18.6], [14, 18.6], [14, 16.4], [12.6, 16.4]] }], -126.6, DS), { parent: "ds", stage: 14, dir: R });
  const SPR_P = 15.875, SPR_R = SPR_P / (2 * Math.sin(Math.PI / 15));       // 530 chain, 15 teeth
  const XS = -137;                                                          // sprocket tooth plane centre
  add("spr36", "36", "Engine sprocket (15 teeth)", "steel", -147, -126.6, ax([
    { type: "lathe", pts: [[12, 0], [21, 0], [22, 1], [22, 19.4], [21, 20.4], [12, 20.4]] },
    { type: "gear", r: r3(SPR_R + 4.5), toothH: r3(9.6), teeth: 15, h: 7.2, bore: 20, rot: [0, r3(-3.5 * 360 / 60), 0], at: [0, r3(XS - 3.6 + 147), 0] },
  ], -147, DS), { parent: "ds", stage: 14, dir: R });
  add("w39", "39", "Lock washer (sprocket nut)", "steel", -148.5, -147, ax([{ type: "group", items: [RG(18, 10.2, 1.5), { type: "box", size: [6, 1.5, 8], r: .3, at: [-20, .75, 0] }] }], -148.5, DS), { parent: "spr36", stage: 14, dir: R, small: true });
  add("n38", "38", "Nut (engine sprocket)", "zinc", -160.5, -148.5, ax([{ type: "hex", af: 30, h: 12, hole: 10 }], -160.5, DS), { parent: "spr36", stage: 14, dir: R, small: true });

  // drive chain (ref 41): the part that wraps the front sprocket and the first few links of each run toward the rear wheel
  const chainPts = []; const NRUN = 8;
  for (let k = NRUN; k >= 1; k--) chainPts.push([SPR_R, -k * SPR_P]);                 // top run, coming forward
  for (let a = 0; a <= 168.01; a += 24) chainPts.push([SPR_R * Math.cos(a * Math.PI / 180), SPR_R * Math.sin(a * Math.PI / 180)]);
  const last = chainPts[chainPts.length - 1], zb = last[1] - Math.sqrt(SPR_P * SPR_P - (SPR_R + last[0]) ** 2);
  for (let k = 0; k < NRUN; k++) chainPts.push([-SPR_R, zb - k * SPR_P]);              // bottom run, going back
  const PL = [];
  for (let a = -40; a <= 220; a += 20) PL.push([7 * Math.cos(a * Math.PI / 180), SPR_P / 2 + 7 * Math.sin(a * Math.PI / 180)]);
  PL.push([-5.2, 0]);
  for (let a = 140; a <= 400; a += 20) PL.push([7 * Math.cos(a * Math.PI / 180), -SPR_P / 2 + 7 * Math.sin(a * Math.PI / 180)]);
  PL.push([5.2, 0]);
  const cplate = x0 => ({ type: "extrude", pts: PL.map(p => p.map(r3)), depth: 1.6, bevel: 0, rot: [0, 90, 0], at: [x0, 0, 0] });
  const links = [];
  chainPts.forEach((p, k) => {
    links.push({ type: "group", items: [{ type: "cyl", r: 5.08, h: 7.9, axis: "x", at: [-3.95, 0, 0], mat: "dark" }, { type: "cyl", r: 2.6, h: 18.6, axis: "x", at: [-9.3, 0, 0] }], at: [XS, r3(DS.y + p[0]), r3(DS.z + p[1])] });
    if (k < chainPts.length - 1) { const q = chainPts[k + 1], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], a = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
      const xs = k % 2 ? [4, -5.6] : [5.8, -7.4];
      links.push({ type: "group", items: [cplate(xs[0]), cplate(xs[1])], rot: [r3(a), 0, 0], at: [XS, r3(DS.y + m[0]), r3(DS.z + m[1])] }); }
  });
  P.push({ id: "ch41", ref: "41", name: "Drive chain (section round the engine sprocket)", mat: "steel", parent: "spr36", stage: 15, dir: [0, 1, 0], A: [0, 0, 0], E: [0, -150, 0], geom: { type: "group", items: links } });

  // ================= exploded layout: parts pulled off along the shaft axes, in order, with a gap between each =================
  const byId = Object.fromEntries(P.map(p => [p.id, p]));
  const column = (ids, start, sgn, gap, dy = 0) => { let cur = start; ids.forEach(id => { const [x0, x1] = ext[id];
    const dx = sgn > 0 ? cur - x0 : cur - x1; cur = sgn > 0 ? x1 + dx + gap : x0 + dx - gap; byId[id].E = [r3(dx), dy, 0]; }); };
  const RAISE = 120;                                                         // the countershaft and its parts are lifted clear of the drive shaft
  byId.cs.E = [0, RAISE, 0];
  column(["c5", "lw7a", "cl8a", "c3", "cl8b", "lw7b", "c4", "c2", "b13", "c14"], X_CS0 - 14, -1, 14, RAISE);
  column(["b9", "c10", "r11", "s12"], X_CS1 + 14, 1, 16, RAISE);
  column(["w24", "o2", "lw18a", "cl19a", "o4", "cl22a", "lw21", "o3", "lw23", "cl22b", "o5", "cl19b", "lw18b", "o1", "b27", "c28"], X_DS1 + 14, 1, 14);
  column(["b29", "c30", "seal31", "c32", "g34", "p33", "s35", "or40", "sp37", "spr36", "w39", "n38"], X_DS0 - 14, -1, 14);

  const stages = [
    { t: "5th drive gear", d: "Slide the 5th drive gear onto the countershaft from the left end, boss first, up against the 1st drive gear. Fit the lock washer and a new circlip in the groove on its left." },
    { t: "3rd drive gear", d: "Slide on the 3rd drive gear (the sliding gear). Its dogs face the 5th and 4th gears and its fork groove takes one of the shift forks." },
    { t: "4th and 2nd drive gears", d: "Fit a new circlip and the lock washer for the 4th gear, then the 4th drive gear, boss to the left. Slide the 2nd drive gear onto the splines. Seat each circlip fully in its groove." },
    { t: "Countershaft bearings", d: "Fit the 20 x 47 bearing on the left journal and the 25 x 62 bearing on the right, each with its C-ring in the outer race groove." },
    { t: "2nd driven gear", d: "Working from the right end of the drive shaft, fit the thrust washer and the 2nd driven gear against the collar, then the lock washer and a new circlip." },
    { t: "4th driven gear", d: "Slide on the 4th driven gear with the dogs facing the 2nd driven gear." },
    { t: "3rd driven gear", d: "Fit a new circlip and lock washer, the 3rd driven gear, then the second lock washer and circlip." },
    { t: "5th driven gear", d: "Slide on the 5th driven gear. It has dogs on both faces, for the 3rd and the 1st driven gears." },
    { t: "1st driven gear", d: "Fit a new circlip and the lock washer, then the 1st driven gear. Oil every gear bore and spline as it goes on." },
    { t: "Drive shaft bearings", d: "Fit the 20 x 47 bearing on the right journal and the 25 x 62 bearing on the left, each with its C-ring. The C-rings locate the shafts in the case halves." },
    { t: "Countershaft into the case", d: "Lay the drive shaft in the case, then lower the countershaft in so each pair of gears meshes. Check that every gear spins or slides freely before closing the case. End play and backlash: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Countershaft bearing retainer", d: "Fit the retainer over the right countershaft bearing and fit its two screws. Thread locker and torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Oil seal and drive shaft plate", d: "Press a new oil seal into the left bore, lip inward, and fit its C-ring. Fit a new gasket, then the drive shaft plate and its two screws. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Engine sprocket", d: "Fit a new O-ring on the shaft and slide the spacer through the oil seal. Fit the sprocket, the lock washer and the nut, then bend the lock washer against a flat of the nut. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Drive chain", d: "Fit the chain over the sprocket and join it. Chain slack: VERIFY IN FACTORY SERVICE MANUAL." },
  ];

  return {
    id: "CMS-BLCK0074", title: "Transmission", units: "mm", page: "BLCK0074",
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL transmission page. Bearing, seal, spacer and O-ring sizes, the 3rd gear tooth counts (21/29) and the 15-tooth sprocket come from the catalogue descriptions. Other tooth counts were picked to match the commonly quoted GS750 ratios. Gear order on the shafts, gear widths, shaft steps and where each washer and circlip sits are a best guess at the usual Suzuki 5-speed layout, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [.6, .5, 1], up: [0, 1, 0] },
    notModelled: "Ref 2 is a second countershaft part number with no supersession link to ref 1; what sets it apart (likely a running change) isn't known, so one countershaft is drawn as ref 1. Ref 41 (41-1 and 41-2 are the same chain under two part numbers) is drawn only where it wraps the engine sprocket, with a few links of each run; the rest of the endless chain runs back to the rear sprocket. CMSNL gives no quantities, so the number of washers and circlips (two each of refs 7, 8, 18, 19 and 22 here) and where each sits are a best guess. The shift forks, shift drum, crankcase and clutch are on other pages and are not drawn.",
    stages, parts: P,
  };
})();
D3_MODELS["CMS-BLCK0074"] = D3_BLCK0074;
