/* ============ 3D parts model: kick starter, GS750B 1977 (CMSNL BLCK0044) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: the engine frame of the transmission model (CMS-BLCK0074): +X toward the right (clutch) side, +Y up, +Z forward.
   The countershaft is on Y = 0, Z = 0 and the drive shaft on Y = -30, Z = -56. The kick shaft runs along X, behind the drive
   shaft, at Y = -10, Z = -122 (about 69 mm from the drive shaft). Its drive gear (21 teeth here) is drawn meshing with the
   40-tooth 1st driven gear of BLCK0074 (X 12 to 24, same module). That gear is free on the drive shaft and always meshes with the
   1st drive gear on the countershaft, so kicking turns the countershaft and, through the engaged clutch, the crank. That is the
   most likely layout given that no kick idler gear appears on either page; it is not confirmed for the 1977 GS750.
   Layout along the shaft, inside to outside: left bushing (17 mm) in the left case, drive gear held by lock washer and circlip,
   ratchet on helical splines, ratchet spring and washer, right bushing (20 mm) in the right case wall, spring guide and return
   spring, oil seal 20 x 27 x 5 (in the clutch cover, not drawn), kick lever clamped on the splined end.
   Sizes from the catalogue: oil seal 20 x 27 x 5; bushing bores 17 and 20 and circlip 22 read from the Suzuki part numbers.
   Geometry: APPROXIMATE. Everything else is typical proportion for a 1970s Suzuki four, not measured.
   Every part's geometry is laid out in world coordinates, so every A is [0, 0, 0] and E is the exploded offset. */
const D3_BLCK0044 = (() => {
  const r3 = v => +(+v).toFixed(3);
  const KS = { y: -10, z: -122 };
  // items are drawn along local +Y from y = 0; ax() turns local +Y into world +X and puts local y = 0 at world x0 on the kick shaft line
  const ax = (items, x0) => ({ type: "group", items, rot: [0, 0, -90], at: [r3(x0), KS.y, KS.z] });
  const RG = (ro, ri, h, o = {}) => ({ type: "lathe", pts: [[ri, 0], [ro, 0], [ro, h], [ri, h]], ...o });
  const ring = (n, R, y = 0, off = 0) => Array.from({ length: n }, (_, k) => { const a = (off + k * 360 / n) * Math.PI / 180; return [r3(Math.cos(a) * R), y, r3(Math.sin(a) * R), r3(-(off + k * 360 / n))]; });
  // local (in ax frame) point at angle a around the shaft: world Y = -cos a, world Z = -sin a. So "up" (+Y) is a = 180.
  const radial = (a, R, y) => { const t = a * Math.PI / 180; return [r3(Math.cos(t) * R), y, r3(Math.sin(t) * R)]; };

  // ---- shaft (ref 1): 17 mm left journal, 22 mm centre with helical splines, 20 mm right journal, splined lever end ----
  const shaft = ax([
    { type: "lathe", pts: [[0, 0], [7.5, 0], [8.5, 1], [8.5, 16.5], [11, 16.5], [11, 17], [10.4, 17], [10.4, 18.5], [11, 18.5], [11, 58], [10, 58], [10, 112], [9, 113], [9, 138], [8, 139], [0, 139]] },
    // helical splines for the ratchet (each spline a slightly twisted box)
    { type: "array", pos: ring(10, 11, 41.5), item: { type: "box", size: [1.2, 17, 2.6], r: .2, rot: [12, 0, 0], mat: "dark" } },
    // lever splines
    { type: "array", pos: ring(16, 9, 126), item: { type: "box", size: [1, 24, 1.8], r: .2, mat: "dark" } },
    // hole for the return spring's inner hook
    { type: "box", size: [1.5, 3.4, 3.4], r: .3, at: [9.4, 97, 0], mat: "black" },
  ], -8);

  // ---- drive gear (ref 9): 21 teeth, module and phase to mesh with the 40-tooth 1st driven gear of BLCK0074 ----
  const M = 2 * 63.5 / 56, NK = 21, RP = NK * M / 2;
  const PSI = r3(-79.6);                                           // tooth tip on the line toward the drive shaft
  const ratchetTeeth = (y, off) => ({ type: "array", pos: ring(6, 14, y, off), item: { type: "box", size: [5.5, 1.6, 4.5], r: .3, at: [0, .8, 0] } });
  const gear9 = ax([
    { type: "gear", r: r3(RP + .9 * M), toothH: r3(2.05 * M), teeth: NK, h: 10, bore: 11.1, rot: [0, PSI, 0] },
    RG(17, 11.1, 2, { at: [0, 10, 0] }),
    ratchetTeeth(12, 0),
  ], 12);

  // ---- ratchet (ref 4, "starter, kick"): rides the helical splines, teeth face the gear, lug on top runs on guide 7 ----
  const ratchet4 = ax([
    { type: "lathe", pts: [[11.1, 0], [17.5, 0], [17.5, 15], [15.5, 15], [15.5, 13], [11.1, 13]] },
    ratchetTeeth(-1.6, 30),
    { type: "box", size: [8, 10, 7], r: 1, at: [-20.5, 6, 0] },          // lug, pointing up
  ], 25.6);

  const spring5 = ax([{ type: "spring", R: 13.6, wire: 1.6, h: 9.6, turns: 4 }], 40.6);
  const washer6 = ax([RG(15, 10.1, 1.4)], 50.2);
  const lockW10 = ax([RG(15, 11.05, 1.4), { type: "array", pos: ring(6, 11.6, .7, 30), item: { type: "box", size: [1.2, 1.4, 2.6], r: .2 } }], 10.5);
  const clip11 = ax([{ type: "ring", ro: 13.6, ri: 10.5, h: 1.4, split: true }], 9.1);

  // bushings with a locating flange on the inner end; the pin sits in a hole in the flange and goes into the case
  const bush12 = ax([RG(11.6, 8.55, 12), RG(17.5, 8.55, 2.2, { at: [0, 12, 0] }), { type: "cyl", r: 2.6, h: .6, axis: "y", at: [...radial(180, 14.5, 13.7)], mat: "black" }], -5.6);
  const pin13 = ax([{ type: "lathe", pts: [[0, 0], [2.4, 0], [2.5, .4], [2.5, 9.6], [2.4, 10], [0, 10]], at: radial(180, 14.5, 0) }], -1.6);
  const bush14 = ax([RG(18, 10.05, 2.2), RG(13.2, 10.05, 15, { at: [0, 2.2, 0] }), { type: "cyl", r: 2.6, h: .6, axis: "y", at: [...radial(180, 15.5, -.1)], mat: "black" }], 51.6);
  const pin15 = ax([{ type: "lathe", pts: [[0, 0], [2.4, 0], [2.5, .4], [2.5, 9.6], [2.4, 10], [0, 10]], at: radial(180, 15.5, 0) }], 51.6);

  // spring guide (ref 2): sleeve inside the return spring, flange against the case, tab that the spring's outer leg sits behind
  const guide2 = ax([RG(12.6, 10.05, 22), RG(21, 10.05, 2.2), { type: "box", size: [6, 7, 5], r: .5, at: [...radial(180, 23, 3.5)] }], 69);
  // return spring (ref 3): torsion coil round the guide, inner hook into the shaft hole, outer leg up to the case peg
  const coil = { type: "spring", R: 16, wire: 2.4, h: 15, turns: 5.5 };
  const spring3 = { type: "group", items: [
    ax([{ ...coil, at: [0, 3.2, 0] }], 69),
    { type: "tube", r: 1.2, pts: [[87.3, KS.y - 16, KS.z], [87.6, KS.y - 13, KS.z - .5], [89.5, KS.y - 10.2, KS.z]] },  // inner hook, down into the shaft hole
    { type: "tube", r: 1.2, pts: [[72.4, KS.y + 16, KS.z], [72.4, KS.y + 26, KS.z - 2], [72.4, KS.y + 36, KS.z - 3]] }, // outer leg, up to the case
  ] };
  // oil seal (ref 16): 20 x 27 x 5, in the clutch cover
  const seal16 = ax([{ type: "lathe", pts: [[10.1, 0], [11.5, 0], [11.5, 1.2], [12.2, 1.2], [12.2, 0], [13.5, 0], [13.5, 5], [11.6, 5], [10, 3.6], [10, 2]] }], 98);

  // ---- kick lever (ref 17): clamp boss on the splines, arm back and up, folding pedal (drawn unfolded) ----
  const LX0 = 107, LW = 20, LANG = 28 * Math.PI / 180, LLEN = 150;
  const dY = Math.sin(LANG), dZ = -Math.cos(LANG);
  const PY = KS.y + LLEN * dY, PZ = KS.z + LLEN * dZ;
  const yz = (pts, w, x0, mat) => ({ type: "extrude", pts: pts.map(p => [r3(-p[1]), r3(p[0])]), depth: w, bevel: .8, rot: [0, 90, 0], at: [r3(x0), 0, 0], ...(mat ? { mat } : {}) });
  const nY = -dZ, nZ = dY;                                        // arm side normal
  const armPts = [
    [KS.y + 10 * nY, KS.z + 10 * nZ], [PY + 7 * nY, PZ + 7 * nZ], [PY - 7 * nY, PZ - 7 * nZ], [KS.y - 10 * nY, KS.z - 10 * nZ]];
  const lever17 = { type: "group", items: [
    ax([RG(17, 9.05, LW)], LX0),
    // clamp ears under the boss, with the slot between them
    { type: "box", size: [LW - 4, 13, 6], r: 1, at: [LX0 + LW / 2, KS.y - 20, KS.z + 4.5] },
    { type: "box", size: [LW - 4, 13, 6], r: 1, at: [LX0 + LW / 2, KS.y - 20, KS.z - 4.5] },
    yz(armPts, 10, LX0 + 6),
    // pedal knuckle and pivot pin at the end of the arm
    { type: "box", size: [16, 18, 18], r: 3, at: [LX0 + 16, r3(PY), r3(PZ)] },
    { type: "cyl", r: 3, h: 22, axis: "z", at: [LX0 + 16, r3(PY), r3(PZ - 11)], mat: "chrome" },
    // pedal arm, unfolded, sticking out to the right
    { type: "cyl", r: 6, h: 72, axis: "x", at: [LX0 + 22, r3(PY), r3(PZ)] },
  ] };
  // pedal rubber (ref 18)
  const rubPts = [[6.05, 0], [10, 0], [11, 2]]; for (let i = 0; i < 9; i++) rubPts.push([11, 4 + i * 5], [10, 5.5 + i * 5], [11, 7 + i * 5]);
  rubPts.push([11, 50], [10, 52], [0, 52], [0, 49], [6.05, 49]);
  const rubber18 = { type: "group", items: [{ type: "lathe", pts: rubPts }], rot: [0, 0, -90], at: [LX0 + 42, r3(PY), r3(PZ)] };
  // clamp bolt (ref 19): across the ears along Z, head on the back
  const bolt19 = { type: "group", items: [
    { type: "lathe", pts: [[0, 0], [3.9, 0], [3.9, 22], [3.4, 22.6], [0, 22.6]] },
    { type: "hex", af: 10, h: 5, y: -5 },
    { type: "lathe", pts: [[3.9, -.6], [7.5, -.6], [7.5, 0], [3.9, 0]] },
  ], rot: [90, 0, 0], at: [LX0 + LW / 2, KS.y - 22, KS.z - 11] };

  // ---- ratchet guide (ref 7) and screw (ref 8): plate screwed to the case above the ratchet; the lug rides onto it at rest ----
  const GY = KS.y + 25.6;
  const guide7 = { type: "group", items: [
    { type: "extrude", pts: [[0, 12], [0, -40], [16, -40], [16, 4], [12, 10], [6, 12]], holes: [[8, -30, 3.2]], depth: 2.5, bevel: .3, rot: [90, 0, 0], at: [27, GY + 2.5, KS.z] },
  ] };
  const screw8 = { type: "group", items: [
    { type: "lathe", pts: [[0, -14], [3, -14], [3, 0], [0, 0]] },
    { type: "lathe", pts: [[0, 0], [5.4, 0], [5.4, 2.4], [4, 3.8], [0, 3.8]] },
    { type: "box", size: [8.5, 1, 1.2], r: .2, at: [0, 3.7, 0], mat: "black" },
  ], at: [35, GY + 2.5, KS.z - 24] };

  // ================= parts =================
  const ext = {}, P = [];
  const add = (id, ref, name, mat, x0, x1, geom, o = {}) => { ext[id] = [x0, x1]; P.push({ id, ref, name, mat, A: [0, 0, 0], E: [0, 0, 0], geom, ...o }); };
  const L = [-1, 0, 0], R = [1, 0, 0];
  add("shaft", "1", "Kick starter shaft", "steel", -8, 131, shaft, { stage: 0, dir: L });
  add("gear9", "9", "Kick starter drive gear", "steel", 12, 25.6, gear9, { parent: "shaft", stage: 1, dir: R });
  add("lw10", "10", "Lock washer (drive gear)", "steel", 10.5, 11.9, lockW10, { parent: "shaft", stage: 1, dir: R, small: true });
  add("clip11", "11", "Circlip 22 mm (drive gear)", "spring", 9.1, 10.5, clip11, { parent: "shaft", stage: 1, dir: R, small: true });
  add("ratchet4", "4", "Kick starter ratchet", "steel", 24, 40.6, ratchet4, { parent: "shaft", stage: 2, dir: L });
  add("spring5", "5", "Ratchet spring", "spring", 40.6, 50.2, spring5, { parent: "shaft", stage: 2, dir: L });
  add("washer6", "6", "Washer (ratchet spring seat)", "steel", 50.2, 51.6, washer6, { parent: "shaft", stage: 2, dir: L, small: true });
  add("bush12", "12", "Bushing 17 mm (left, in the case)", "brass", -5.6, 8.6, bush12, { parent: "shaft", stage: 3, dir: R });
  add("pin13", "13", "Pin (left bushing)", "steel", -1.6, 8.4, pin13, { parent: "bush12", stage: 3, dir: R, small: true });
  add("bush14", "14", "Bushing 20 mm (right, in the case)", "brass", 51.6, 68.8, bush14, { parent: "shaft", stage: 3, dir: L });
  add("pin15", "15", "Pin (right bushing)", "steel", 51.6, 61.6, pin15, { parent: "bush14", stage: 3, dir: L, small: true });
  add("guide7", "7", "Ratchet guide (starting spring guide)", "steel", 27, 43, guide7, { stage: 4, dir: [0, -1, 0] });
  add("screw8", "8", "Screw (ratchet guide)", "zinc", 30, 40, screw8, { parent: "guide7", stage: 4, dir: [0, -1, 0], small: true });
  add("guide2", "2", "Kick shaft spring guide", "steel", 69, 91, guide2, { parent: "shaft", stage: 5, dir: L });
  add("spring3", "3", "Kick shaft return spring", "spring", 69, 91, spring3, { parent: "shaft", stage: 5, dir: L });
  add("seal16", "16", "Oil seal 20 x 27 x 5 (clutch cover)", "rubber", 98, 103, seal16, { stage: 6, dir: L, small: true });
  add("lever17", "17", "Kick starter lever", "chrome", LX0, LX0 + 94, lever17, { stage: 7, dir: L });
  add("rubber18", "18", "Kick pedal rubber", "rubber", LX0 + 42, LX0 + 94, rubber18, { parent: "lever17", stage: 7, dir: L });
  add("bolt19", "19", "Lever clamp bolt", "zinc", LX0 + 2, LX0 + 18, bolt19, { parent: "lever17", stage: 7, dir: [0, 0, 1], small: true });

  // ================= exploded layout: parts pulled off along the shaft axis, in fitting order, with a gap between each =================
  const byId = Object.fromEntries(P.map(p => [p.id, p]));
  const column = (ids, start, sgn, gap, dy = 0) => { let cur = start; ids.forEach(id => { const [x0, x1] = ext[id];
    const dx = sgn > 0 ? cur - x0 : cur - x1; cur = sgn > 0 ? x1 + dx + gap : x0 + dx - gap; byId[id].E = [r3(dx), dy, 0]; }); };
  column(["gear9", "lw10", "clip11", "bush12"], -8 - 16, -1, 14);
  column(["ratchet4", "spring5", "washer6", "bush14", "guide2"], 139 + 16, 1, 14);
  byId.spring3.E = [byId.guide2.E[0] + 36, 0, 0];
  column(["seal16", "lever17"], byId.spring3.E[0] + 91 + 16, 1, 18);
  byId.pin13.E = [byId.bush12.E[0] - 20, 0, 0];
  byId.pin15.E = [byId.bush14.E[0] + 22, 0, 0];
  byId.guide7.E = [0, 75, 0]; byId.screw8.E = [0, 115, 0];
  byId.rubber18.E = [byId.lever17.E[0] + 70, 0, 0];
  byId.bolt19.E = [byId.lever17.E[0], -45, -45];

  const stages = [
    { t: "Drive gear onto the shaft", d: "Slide the drive gear onto the shaft from the left (short) end, ratchet face toward the splines. Fit the lock washer and a new circlip in the groove beside it." },
    { t: "Ratchet, spring and washer", d: "From the right end, slide the ratchet onto the helical splines with its teeth facing the gear and its lug lined up with the punch mark on the shaft, then the spring and the washer. Mark alignment: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Bushings and pins", d: "Fit the 17 mm bushing on the left journal and the 20 mm bushing on the right, each with its pin in the flange so it can't turn in the case." },
    { t: "Shaft into the case and ratchet guide", d: "Lay the shaft assembly in the lower case half with the pins in their notches. Screw the ratchet guide to the case so the ratchet lug rests on it. Thread locker and torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Return spring", d: "After the case is closed, slide the spring guide on, hook the return spring's inner end into the hole in the shaft, then wind the outer leg round and hook it behind the case peg." },
    { t: "Oil seal", d: "Press a new 20 x 27 x 5 oil seal into the clutch cover, lip inward, and fit the cover over the shaft." },
    { t: "Kick lever", d: "Push the rubber onto the pedal. Fit the lever on the splines at the angle the factory gives and tighten the clamp bolt. Angle and torque: VERIFY IN FACTORY SERVICE MANUAL." },
  ];

  return {
    id: "CMS-BLCK0044", title: "Kick starter", units: "mm", page: "BLCK0044",
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL kick starter page; the 20 x 27 x 5 oil seal is from the catalogue, and the 17 and 20 mm bushings and 22 mm circlip are read from the Suzuki part numbers. Where the shaft sits behind the drive shaft, the 21-tooth drive gear meshing with the 1st driven gear, the order of parts along the shaft, and the shape of the ratchet, guide and lever are a best reading of the parts list, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [.8, .55, 1], up: [0, 1, 0] },
    notModelled: "Refs 2-1/2-2, 4-1/4-2 and 16-1/16-2 are earlier and later part numbers for the same piece, so one of each is drawn. Refs 13 and 15 share a part number; one pin is drawn for each bushing. The crankcase, the clutch cover the oil seal sits in, the case peg for the return spring and the 1st driven gear the drive gear meshes with (on the transmission page) are not drawn. Whether the drive gear meshes directly with the 1st driven gear on a 1977 GS750 is not confirmed.",
    stages, parts: P,
  };
})();
D3_MODELS["CMS-BLCK0044"] = D3_BLCK0044;
