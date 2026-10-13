/* ============ 3D parts model: chain case and rear shock absorbers, GS750B 1977 (CMSNL BLCK0008) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame (same origin as the swing arm model d3_blck0057.js): origin on the swing arm pivot axis at the middle of the
   pivot tube, +X to the rider's LEFT (chain side), +Y up, +Z forward. The swing arm is drawn level, as in that model, so
   its shock studs sit at X = +-125..147, Y = 6, Z = -440 and the rear axle at Z = -520, Y = 0.
   Every part's geometry is laid out in world coordinates, so every A is [0, 0, 0] and E is the exploded offset.
   Shocks: lower eye on the swing arm stud, upper eye 330 mm higher on the frame stud, leaning forward 10 degrees.
   Upper mount stack, from the frame outward (CMSNL picture): two washers 13 (and washer 14 on the right side only),
   the shock eye, two washers 15, washer 16, cap nut 12. Left lower eye: washer 18 and bolt 17 (10 x 36) into the stud.
   Chain case: a channel (top plate plus outer skirt) over the top run of the chain, outboard of the left shock, rising
   toward the rear and curving down round the rear sprocket. Front mount: bolt 7, washer 8, spacer 10 in a rubber
   cushion 9 in the skirt. Rear mount: reinforcement plate 2 inside the skirt, bolt 5 with lock washer 6 and bolt 3 with
   washer 4 through the skirt into it. The frame studs, the swing arm tabs the case and plate bolt to, the chain and the
   sprockets are not on this page and aren't drawn.
   Real figures used: bolt 10 x 36, washers 12.5 x 24 x 3.2, 10.5 x 24 x 3.2 and 6.5 x 18 x 1, spacer 6.1 x 8 x 5.2,
   bolt 6 x 8 (all catalogue descriptions). Shock length, spring size, chain case shape and all positions are typical
   1970s 750 proportions, not measured from a GS750. */
const D3_BLCK0008 = (() => {
  const r2 = v => Math.round(v * 100) / 100;
  const TILT = 10, LEN = 330;                                   // shock lean (top forward) and eye-to-eye length
  const LO = { x: 137, y: 6, z: -440 };                         // lower eye centre (left side; right is -x)
  const UP = { y: r2(LO.y + LEN * Math.cos(TILT * Math.PI / 180)), z: r2(LO.z + LEN * Math.sin(TILT * Math.PI / 180)) };
  const EYE_IN = 127, EYE_OUT = 147;                            // |x| of the eye faces

  // ring along X starting at |x| = x0 and running outward (o = 1) or inward (o = -1) on side s (1 left, -1 right)
  const wX = (s, x0, o, ro, ri, h, y, z, extra) => {
    const a = s * x0, b = s * (x0 + o * h);
    return { type: "ringX", ro, ri, h, at: [r2(Math.min(a, b)), y, z], ...(extra || {}) };
  };
  // anything built along +Y, turned to run along X from |x| = x0 in direction d (1 outward, -1 inward) on side s
  const onX = (s, x0, d, y, z, items) => ({ type: "group", rot: [0, 0, s * d > 0 ? -90 : 90], at: [s * x0, y, z], items });

  // ---- rear shock absorber, built along its own axis (local Y from lower eye centre to upper eye centre) ----
  const shock = s => ({ type: "group", rot: [TILT, 0, 0], at: [s * LO.x, LO.y, LO.z], items: [
    { type: "ringX", ro: 13, ri: 6.2, h: 20, at: [-10, 0, 0] },                                            // lower eye
    { type: "ringX", ro: 6.6, ri: 6.2, h: 20, at: [-10, 0, 0], mat: "rubber" },                            // eye bush
    { type: "lathe", pts: [[0, 9], [10, 9], [15, 16], [15, 30], [21, 34], [21, 196], [0, 196]], mat: "black" }, // damper body
    { type: "lathe", pts: [[21, 30], [30, 30], [32, 34], [32, 40], [21, 40]], mat: "chrome" },              // adjuster cam (spring seat)
    { type: "array", pos: [0, 72, 144, 216, 288].map(a => [r2(31 * Math.cos(a * Math.PI / 180)), 30, r2(31 * Math.sin(a * Math.PI / 180))]),
      item: { type: "box", size: [3, 6, 3], r: .5 }, mat: "chrome" },                                      // cam steps
    { type: "lathe", pts: [[0, 196], [7, 196], [7, 284], [0, 284]], mat: "chrome" },                       // piston rod
    { type: "spring", R: 26.5, wire: 7, h: 242, turns: 10.5, at: [0, 40, 0], mat: "chrome" },               // spring
    { type: "lathe", pts: [[7, 282], [32, 282], [32, 290], [14, 292], [12, 316], [0, 316], [0, 282]], mat: "chrome" }, // upper seat and stem
    { type: "lathe", pts: [[0, 300], [11, 300], [11, 318], [0, 318]], mat: "black" },
    { type: "ringX", ro: 13, ri: 6.2, h: 20, at: [-10, LEN, 0] },                                          // upper eye
    { type: "ringX", ro: 6.6, ri: 6.2, h: 20, at: [-10, LEN, 0], mat: "rubber" },
  ] });

  // ---- upper mounting hardware (per side) ----
  const w13 = s => ({ type: "group", items: s > 0
    ? [wX(s, EYE_IN, -1, 11, 6.2, 2, UP.y, UP.z), wX(s, EYE_IN - 2, -1, 11, 6.2, 2, UP.y, UP.z)]
    : [wX(s, EYE_IN - 3.2, -1, 11, 6.2, 2, UP.y, UP.z), wX(s, EYE_IN - 5.2, -1, 11, 6.2, 2, UP.y, UP.z)] });
  const w15 = s => ({ type: "group", items: [wX(s, EYE_OUT, 1, 10, 5.2, 1.6, UP.y, UP.z), wX(s, EYE_OUT + 1.6, 1, 10, 5.2, 1.6, UP.y, UP.z)] });
  const w16 = s => wX(s, EYE_OUT + 3.2, 1, 12, 5.25, 3.2, UP.y, UP.z);
  const NUT0 = EYE_OUT + 6.4;
  const capnut = s => onX(s, NUT0, 1, UP.y, UP.z, [
    { type: "hex", af: 14, h: 8, y: 0, hole: 5 },
    { type: "lathe", pts: [[0, 8], [6.6, 8], [6.6, 10], [5, 13.5], [2.5, 15], [0, 15.3]] } ]);

  // ---- 6 mm bolt with hex head: head outboard from |x| = x0 on the left side, shank going inboard ----
  const bolt6 = (x0, y, z, L, af = 10) => onX(1, x0, -1, y, z, [
    { type: "hex", af, h: 4, y: -4 },
    { type: "lathe", pts: [[0, -.3], [3, -.3], [3, L - .6], [2.5, L], [0, L]] } ]);

  // ---- chain case (left side). Side view points [z, y]; top line rises toward the rear and curves round the sprocket ----
  const CX0 = 171, CX1 = 199, SK = 3;                          // inner edge of the top plate, outer face of the skirt, skirt thickness
  const ZF = -80, ZR = -520, AX = { z: -520, y: 0 }, RT = 128;  // front end, start of the rear curve, sprocket centre, top radius
  const yTop = z => r2(75 + (ZF - z) * (RT - 75) / (ZF - ZR));
  const topLine = (dr, nArc = 14, phEnd = 58) => {             // points along the top, dr below the outer surface
    const out = [[ZF, yTop(ZF) - dr]];
    for (let k = 0; k <= nArc; k++) { const ph = phEnd * k / nArc * Math.PI / 180; out.push([r2(AX.z - (RT - dr) * Math.sin(ph)), r2(AX.y + (RT - dr) * Math.cos(ph))]); }
    return out;
  };
  // flat outline in the side view as [z, y], extruded across X from x0 by w
  const side = (pts, w, x0, holes, extra) => ({ type: "extrude", pts: pts.map(([z, y]) => [r2(-z), r2(y)]), holes: (holes || []).map(([z, y, r]) => [r2(-z), r2(y), r]),
    depth: w, bevel: .5, rot: [0, 90, 0], at: [x0, 0, 0], ...(extra || {}) });
  const plate = topLine(0), plateIn = topLine(2.5);
  const SKD = 40;                                               // skirt depth below the top
  const skirtLow = topLine(SKD);
  const FRONT = { z: -200 }, F_Y = r2(yTop(-200) - 26);         // front mount hole
  const R5 = { z: -470, y: 100 }, R3 = { z: -540, y: 106 };     // rear mount holes (bolt 5, bolt 3)
  const casePts = [...plate, ...skirtLow.slice().reverse()];
  const chainCase = { type: "group", items: [
    // top plate: thin strip along the top line, across the full width
    side([...plate, ...plateIn.slice().reverse()], CX1 - CX0, CX0),
    // outer skirt with the mounting holes and a lightening slot near the front
    side(casePts, SK, CX1 - SK, [[FRONT.z, F_Y, 8.2], [R5.z, R5.y, 3.3], [R3.z, R3.y, 3.3]]),
    // inner lip turned down along the inboard edge
    side([...plate, ...topLine(9).slice().reverse()], 2, CX0),
    // front end: closed nose with a raised oval boss
    side([[ZF + 6, yTop(ZF) - 1], [ZF, yTop(ZF)], [ZF, yTop(ZF) - SKD], [ZF + 6, yTop(ZF) - SKD]], CX1 - CX0, CX0),
    { type: "box", size: [2, 12, 30], r: 5, at: [CX1 + .6, yTop(-120) - 20, -120] },
  ] };

  // reinforcement plate inside the skirt, upper part along the case, leg down to the swing arm tab
  const brPts = [[-455, 98], [-458, 108], [-470, 112], [-545, 116], [-552, 110], [-550, 98], [-520, 90], [-500, 60], [-498, 26], [-488, 18], [-478, 26], [-480, 70], [-462, 88]];
  const bracket = side(brPts, 3, CX1 - SK - 3.2, [[R5.z, R5.y, 3.1], [R3.z, R3.y, 3.1], [-488, 30, 4.2]]);

  const ex = (dx, dy = 0, dz = 0) => [dx, dy, dz], Z = [0, 0, 0];
  const CASE_X = 120, CASE_Y = -235;                            // the chain case group is exploded out and down

  return {
    id: "CMS-BLCK0008", title: "Chain case and rear shock absorbers", units: "mm", page: "BLCK0008",
    accuracy: "Approximate geometry. Part identity, numbering, the washer stacks and the layout follow the CMSNL chain case and shock absorber page and its picture. The 10 x 36 bolt, the 12.5 x 24 x 3.2, 10.5 x 24 x 3.2 and 6.5 x 18 x 1 washers, the 6.1 x 8 x 5.2 spacer and the 6 x 8 bolt come from the catalogue descriptions. Shock length, spring size, chain case shape and where everything sits are typical 1970s 750 proportions placed on the same swing arm frame as the swing arm model, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [1.1, .7, 1.0], up: [0, 1, 0] },
    notModelled: "Every ref is drawn. Refs 11-1, 11-2 and 11-3 are different part numbers for the rear shock (model years and supersessions), so one pair of shocks is shown. The CMSNL picture shows washer 14 only on the right shock's upper mount and bolt 17 with washer 18 only on the left lower mount, so that is how they are drawn; check your bike. The catalogue calls ref 12 'nut, lower LH' but the picture puts a nut 12 on each upper mount, so the picture is followed. The frame studs, the swing arm and its shock studs, the tabs the chain case and its plate bolt to, the chain and the sprockets are on other pages and aren't drawn.",
    stages: [
      { t: "Inner washers on the upper studs", d: "Slide the two thin washers onto each upper shock stud on the frame. On the right side the thick washer goes on after them." },
      { t: "Shocks on", d: "Push each shock's top eye onto the frame stud and its bottom eye onto the swing arm stud. Both shocks should be on the same preload setting." },
      { t: "Upper washers and cap nuts", d: "Fit two washers and the thick washer on each upper stud, then the cap nut. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Left lower bolt", d: "Fit the lock washer and the 10 x 36 bolt into the left lower stud. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Reinforcement plate", d: "Offer the reinforcement plate up to its tab on the swing arm, behind where the chain case will sit." },
      { t: "Cushion and spacer", d: "Push the rubber cushion into the front hole in the chain case and the spacer into the cushion." },
      { t: "Chain case on", d: "Lower the chain case over the chain so it sits outside the reinforcement plate. Check it doesn't touch the chain or the left shock spring." },
      { t: "Chain case bolts", d: "Fit the front bolt with its washer through the spacer, then the two rear bolts with their washers into the plate. Don't overtighten the front one, the cushion has to stay soft." },
    ],
    parts: [
      // ---- right shock (rider's right, -X) ----
      { id: "w13R", ref: "13", name: "Washers, right upper mount (inner)", mat: "spring", small: true, stage: 1, A: Z, E: ex(-70), dir: [1, 0, 0], count: 2, geom: w13(-1) },
      { id: "w14R", ref: "14", name: "Washer 12.5 x 24 x 3.2, right upper mount (inner)", mat: "zinc", small: true, stage: 1, A: Z, E: ex(-100), dir: [1, 0, 0],
        geom: wX(-1, EYE_IN, -1, 12, 6.25, 3.2, UP.y, UP.z) },
      { id: "shockR", ref: "11", name: "Rear shock absorber (right)", mat: "black", stage: 2, A: Z, E: ex(-150), dir: [1, 0, 0], geom: shock(-1) },
      { id: "w15R", ref: "15", name: "Washers, right upper mount (outer)", mat: "zinc", small: true, parent: "shockR", stage: 3, A: Z, E: ex(-200), dir: [1, 0, 0], count: 2, geom: w15(-1) },
      { id: "w16R", ref: "16", name: "Washer 10.5 x 24 x 3.2, right upper mount", mat: "zinc", small: true, parent: "shockR", stage: 3, A: Z, E: ex(-218), dir: [1, 0, 0], geom: w16(-1) },
      { id: "nut12R", ref: "12", name: "Cap nut, right upper mount", mat: "chrome", small: true, parent: "shockR", stage: 3, A: Z, E: ex(-240), dir: [1, 0, 0], geom: capnut(-1) },
      // ---- left shock (rider's left, +X) ----
      { id: "w13L", ref: "13", name: "Washers, left upper mount (inner)", mat: "spring", small: true, stage: 1, A: Z, E: ex(70), dir: [-1, 0, 0], count: 2, geom: w13(1) },
      { id: "shockL", ref: "11", name: "Rear shock absorber (left)", mat: "black", stage: 2, A: Z, E: ex(150), dir: [-1, 0, 0], geom: shock(1) },
      { id: "w15L", ref: "15", name: "Washers, left upper mount (outer)", mat: "zinc", small: true, parent: "shockL", stage: 3, A: Z, E: ex(200), dir: [-1, 0, 0], count: 2, geom: w15(1) },
      { id: "w16L", ref: "16", name: "Washer 10.5 x 24 x 3.2, left upper mount", mat: "zinc", small: true, parent: "shockL", stage: 3, A: Z, E: ex(218), dir: [-1, 0, 0], geom: w16(1) },
      { id: "nut12L", ref: "12", name: "Cap nut, left upper mount", mat: "chrome", small: true, parent: "shockL", stage: 3, A: Z, E: ex(240), dir: [-1, 0, 0], geom: capnut(1) },
      { id: "w18", ref: "18", name: "Lock washer, left lower mount", mat: "spring", small: true, parent: "shockL", stage: 4, A: Z, E: ex(200), dir: [-1, 0, 0],
        geom: wX(1, EYE_OUT, 1, 9, 5.2, 2.5, LO.y, LO.z, { split: true }) },
      { id: "bolt17", ref: "17", name: "Bolt 10 x 36, left lower mount", mat: "zinc", small: true, parent: "shockL", stage: 4, A: Z, E: ex(262), dir: [-1, 0, 0],
        geom: onX(1, EYE_OUT + 2.5, -1, LO.y, LO.z, [
          { type: "hex", af: 14, h: 7, y: -7 },
          { type: "lathe", pts: [[0, -.3], [5, -.3], [5, 35.4], [4.3, 36], [0, 36]] } ]) },
      // ---- chain case (left side) ----
      { id: "plate2", ref: "2", name: "Reinforcement plate (chain case)", mat: "black", stage: 5, A: Z, E: ex(CASE_X - 30, CASE_Y), dir: [0, 1, 0], geom: bracket },
      { id: "case1", ref: "1", name: "Chain case", mat: "black", shell: true, stage: 7, A: Z, E: ex(CASE_X, CASE_Y), dir: [-1, 0, 0], geom: chainCase },
      { id: "cush9", ref: "9", name: "Cushion (chain case front mount)", mat: "rubber", small: true, parent: "case1", stage: 6, A: Z, E: ex(CASE_X + 40, CASE_Y), dir: [-1, 0, 0],
        geom: { type: "group", items: [
          { type: "ringX", ro: 8.2, ri: 4, h: 7, at: [CX1 - 5, F_Y, FRONT.z] },
          { type: "ringX", ro: 10.5, ri: 4, h: 1.6, at: [CX1, F_Y, FRONT.z] },
          { type: "ringX", ro: 10.5, ri: 4, h: 1.6, at: [CX1 - SK - 1.6, F_Y, FRONT.z] } ] } },
      { id: "spacer10", ref: "10", name: "Spacer 6.1 x 8 x 5.2 (in the cushion)", mat: "steel", small: true, parent: "cush9", stage: 6, A: Z, E: ex(CASE_X + 62, CASE_Y), dir: [-1, 0, 0],
        geom: { type: "ringX", ro: 4, ri: 3.05, h: 5.2, at: [CX1 - 3.6, F_Y, FRONT.z] } },
      { id: "w8", ref: "8", name: "Washer 6.5 x 18 x 1 (front mount)", mat: "zinc", small: true, parent: "case1", stage: 8, A: Z, E: ex(CASE_X + 80, CASE_Y), dir: [-1, 0, 0],
        geom: { type: "ringX", ro: 9, ri: 3.25, h: 1, at: [CX1 + 1.6, F_Y, FRONT.z] } },
      { id: "bolt7", ref: "7", name: "Bolt 6 x 10 (front mount)", mat: "zinc", small: true, parent: "case1", stage: 8, A: Z, E: ex(CASE_X + 105, CASE_Y), dir: [-1, 0, 0],
        geom: bolt6(CX1 + 2.6, F_Y, FRONT.z, 14) },
      { id: "lw6", ref: "6", name: "Lock washer (rear mount, lower)", mat: "spring", small: true, parent: "case1", stage: 8, A: Z, E: ex(CASE_X + 50, CASE_Y), dir: [-1, 0, 0],
        geom: { type: "ringX", ro: 5.5, ri: 3.1, h: 1.6, split: true, at: [CX1, R5.y, R5.z] } },
      { id: "bolt5", ref: "5", name: "Bolt 6 x 25 (rear mount, lower)", mat: "zinc", small: true, parent: "case1", stage: 8, A: Z, E: ex(CASE_X + 85, CASE_Y), dir: [-1, 0, 0],
        geom: bolt6(CX1 + 1.6, R5.y, R5.z, 25) },
      { id: "w4", ref: "4", name: "Washer (rear mount, upper)", mat: "zinc", small: true, parent: "case1", stage: 8, A: Z, E: ex(CASE_X + 50, CASE_Y), dir: [-1, 0, 0],
        geom: { type: "ringX", ro: 7, ri: 3.2, h: 1.2, at: [CX1, R3.y, R3.z] } },
      { id: "bolt3", ref: "3", name: "Bolt 6 x 8 (rear mount, upper)", mat: "zinc", small: true, parent: "case1", stage: 8, A: Z, E: ex(CASE_X + 85, CASE_Y), dir: [-1, 0, 0],
        geom: bolt6(CX1 + 1.2, R3.y, R3.z, 8) },
    ],
  };
})();
D3_MODELS["CMS-BLCK0008"] = D3_BLCK0008;
