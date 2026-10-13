/* ============ 3D parts model: starting motor (Mitsuba), GS750B 1977 (CMSNL BLCK0069) ============
   Mechanical data only (no rendering code). Units: millimetres.
   Local frame of the motor (it is a self-contained unit, not placed in the engine frame):
     X = armature axis, +X toward the drive end (front cover, splined shaft, O-ring 8 on the nose),
     origin on the axis at the middle of the yoke, +Y up (terminal stud on top, mounting foot underneath),
     +Z toward the viewer side (the foot pad sticks out this way).
   Every part's geometry is laid out in this frame, so every A is [0, 0, 0] and E is the exploded offset.
   Layout follows the CMSNL picture: covers and yoke on one line, the armature, brush holder, rear cover and through
   bolts on a second line below it, as the catalogue draws them.
   Geometry: APPROXIMATE. Sizes are typical for a small 1970s Mitsuba motorcycle starter (yoke about 64 mm across,
   80 mm long), not measured from a GS750. Only O-ring 8 has a size in the catalogue (2 mm section, 24.5 mm bore). */
const D3_BLCK0069 = (() => {
  const xl = (pts, mat) => ({ type: "lathe", pts, rot: [0, 0, -90], ...(mat ? { mat } : {}) });     // profile [[r, x]...] turned around X
  const xgear = (o, x0, mat) => ({ type: "gear", ...o, rot: [0, 0, -90], at: [x0, 0, 0], ...(mat ? { mat } : {}) });
  const yzPlate = (pts, holes, depth, x0, mat, bevel = .3) => ({ type: "extrude", pts, holes, depth, bevel, rot: [0, 90, 0], at: [x0, 0, 0], ...(mat ? { mat } : {}) });
  // in yzPlate outlines a point [u, v] lands at world (y = v, z = -u)
  const arc = (r0, r1, a0, a1, n = 16) => { const p = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; p.push([+(r1 * Math.cos(a)).toFixed(3), +(r1 * Math.sin(a)).toFixed(3)]); }
    for (let i = n; i >= 0; i--) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; p.push([+(r0 * Math.cos(a)).toFixed(3), +(r0 * Math.sin(a)).toFixed(3)]); } return p; };
  const circ = (r, n = 48) => Array.from({ length: n }, (_, i) => [+(r * Math.cos(i / n * 2 * Math.PI)).toFixed(3), +(r * Math.sin(i / n * 2 * Math.PI)).toFixed(3)]);

  // through bolts sit inside the yoke on one diagonal, the two field magnets on the other
  const BR = 26, BD = +(BR / Math.SQRT2).toFixed(2);
  const BOLTS = [[BD, -BD], [-BD, BD]];                      // [y, z]
  const boltUV = BOLTS.map(([y, z]) => [-z, y]);

  // ---- yoke (part of motor assembly 0): steel tube, two magnets inside, insulated terminal stud on top ----
  const yoke = { type: "group", items: [
    xl([[29, -40], [32, -40], [32, 40], [29, 40], [29, -40]]),
    yzPlate(arc(22, 28.8, 85, 185), [], 64, -32, "dark", 0),
    yzPlate(arc(22, 28.8, 265, 365), [], 64, -32, "dark", 0),
    { type: "cyl", r: 7, h: 5, at: [-30, 31, 0], mat: "black" },          // insulator boss
    { type: "cyl", r: 3, h: 16, at: [-30, 30, 0], mat: "brass" },          // terminal stud
    { type: "box", size: [7, 1.2, 4], r: .4, at: [8, 31.9, 0] },           // pressed marks seen on the picture
    { type: "box", size: [7, 1.2, 4], r: .4, at: [-8, 31.4, 7], rot: [-13, 0, 0] },
  ] };

  // ---- front (drive end) cover: bearing boss inside, pilot ring for the bolt threads, two mounting ears, nose with O-ring groove ----
  const semi = (cv, a0, a1) => Array.from({ length: 13 }, (_, i) => { const a = (a0 + (a1 - a0) * i / 12) * Math.PI / 180; return [+(8 * Math.cos(a)).toFixed(3), +(cv + 8 * Math.sin(a)).toFixed(3)]; });
  const earPts = [...semi(37, 0, 180), ...semi(-37, 180, 360)];          // stadium: two ears on the vertical line
  const frontCover = { type: "group", items: [
    xl([[5.2, 66], [5.2, 37.2], [9, 37.2], [9, 44], [24, 44], [24, 40], [29.2, 40], [29.2, 42], [33, 42], [33, 52], [31, 54], [13.6, 54], [13.6, 58], [12.3, 58], [12.3, 61], [13.6, 61], [13.6, 66], [5.2, 66]]),
    yzPlate(earPts, [[0, 37, 3.4], [0, -37, 3.4]], 6, 46),
  ] };
  // ribs on the inside face, between the boss and the pilot ring (seen in the picture)
  for (const a of [0, 60, 120, 180, 240, 300]) { const r = a * Math.PI / 180; frontCover.items.push({ type: "box", size: [3.5, 13, 2.4], r: .4, rot: [a, 0, 0], at: [42.3, +(16.5 * Math.cos(r)).toFixed(2), +(16.5 * Math.sin(r)).toFixed(2)] }); }

  // ---- rear (commutator end) cover: cup with a bush boss, flat seat for the bolt heads, foot underneath ----
  const footPts = [[-56, -14], [-42, -14], [-42, 26], [-49, 33], [-56, 26]];
  const rearCover = { type: "group", items: [
    xl([[0, -62], [14, -62], [14, -57], [31, -57], [33, -54], [33, -42], [29.2, -42], [29.2, -40], [28.5, -40], [28.5, -54], [9, -54], [9, -52], [5.2, -52], [5.2, -60], [0, -60]]),
    { type: "extrude", pts: footPts, holes: [[-49, 25, 3.3]], depth: 5, bevel: .5, rot: [90, 0, 0], at: [0, -31, 0] },
    { type: "box", size: [14, 5, 28], r: 1, at: [-49, -31.5, 0] },
    ...BOLTS.map(([y, z]) => ({ type: "cyl", r: 6, h: 1.2, axis: "x", at: [-57.8, y, z] })),   // spot faces for the bolt heads
  ] };

  // ---- armature: shaft with splined drive end, slotted core, windings, commutator ----
  const armature = { type: "group", items: [
    xl([[0, -59.5], [5, -59.5], [5, 66.5], [0, 66.5]]),
    xgear({ r: 6.2, teeth: 10, h: 13, toothH: 1.3 }, 66.5),
    xl([[0, 79.5], [5, 79.5], [4.2, 80.3], [0, 80.3]]),
    xgear({ r: 21, teeth: 14, h: 60, toothH: 4.5, bore: 4 }, -30, "dark"),
    xl([[6, -36], [17.5, -36], [18.5, -34], [18.5, -30], [6, -30]], "brass"),
    xl([[6, 30], [18.5, 30], [18.5, 32], [17.5, 33.6], [6, 33.6]], "brass"),
    xgear({ r: 11, teeth: 24, h: 10, toothH: .5, bore: 4 }, -48, "brass"),
    xl([[5, -49.5], [8.5, -49.5], [8.5, -48], [5, -48]], "black"),
    xl([[5, -38], [12.6, -38], [12.6, -36], [5, -36]], "brass"),
  ] };

  // ---- brush holder plate (ref 2) with two brush boxes on the vertical line ----
  const holder = { type: "group", items: [
    yzPlate([...circ(27.5, 48)], [[0, 0, 9.6], ...boltUV.map(([u, v]) => [u, v, 3])], 2, -54, "black"),
    ...[1, -1].flatMap(s => [
      { type: "box", size: [12, 9.4, 1], r: .2, at: [-46, s * 16, 4.4] },
      { type: "box", size: [12, 9.4, 1], r: .2, at: [-46, s * 16, -4.4] },
      { type: "box", size: [12, 1, 9.8], r: .2, at: [-46, s * 21.3, 0] },
      { type: "box", size: [4, 3, 3], r: .3, at: [-50, s * 23.5, 8] },  // pigtail terminal
    ]),
  ] };
  holder.items.slice(1).forEach(it => { it.mat = "brass"; });

  // ---- brushes (ref 3): carbon block with a braided pigtail back to the plate ----
  const brush = s => ({ type: "group", items: [
    { type: "box", size: [10, 8, 7.6], r: .6, at: [-46, s * 15, 0], mat: "dark" },
    { type: "tube", pts: [[-46, s * 19.2, 0], [-44, s * 22.5, 3], [-47, s * 24.5, 7], [-50, s * 23.5, 8]], r: .8, mat: "brass" },
  ] });

  // ---- shims (ref 4) on each end of the shaft ----
  const shims = (x0, n) => ({ type: "group", items: Array.from({ length: n }, (_, i) => ({ type: "ring", ro: 8.5, ri: 5.1, h: .7, rot: [0, 0, -90], at: [+(x0 + i * .8).toFixed(2), 0, 0] })) });

  // ---- fasteners and seals ----
  const throughBolt = { type: "group", items: [
    xl([[0, -61], [3.6, -61], [4.6, -60], [4.6, -57], [0, -57]]),
    xl([[0, -57], [2.5, -57], [2.5, 47], [2, 47.6], [0, 47.6]]),
    { type: "box", size: [.8, 6, 1], r: .2, at: [-61, 0, 0], mat: "black" },
  ] };
  const bolts5 = { type: "pair", at: BOLTS.map(([y, z]) => [0, y, z]), item: throughBolt };
  const oRing = (R, r, x) => ({ type: "torus", R, r, rot: [0, 0, 90], at: [x, 0, 0] });
  const screw7 = { type: "group", items: [
    { type: "lathe", pts: [[0, -12], [3, -12], [3, 0], [5, 0], [5, 5.5], [0, 5.5]] },
    { type: "socket", af: 5, y: 5.6 } ], at: [-49, -31, 25] };
  const lockWasher = { type: "ring", ro: 5.4, ri: 3.1, h: 1.6, split: true, at: [-30, 36, 0] };
  const nut9 = { type: "hex", af: 10, h: 5, y: 38.1, hole: 3, at: [-30, 0, 0] };

  const Z = [0, 0, 0], LO = -110;                          // second (lower) line in the exploded view
  const parts = [
    { id: "yoke", ref: "0", name: "Yoke with field magnets and terminal stud (part of motor assembly)", mat: "steel", stage: 0, A: Z, E: Z, dir: [1, 0, 0], shell: true, geom: yoke },
    { id: "brushU", ref: "3", name: "Brush, upper (brush set)", mat: "dark", parent: "holder", stage: 1, A: Z, E: [-230, LO + 34, 0], dir: [0, -1, 0], small: true, geom: brush(1) },
    { id: "brushL", ref: "3", name: "Brush, lower (brush set)", mat: "dark", parent: "holder", stage: 1, A: Z, E: [-230, LO - 34, 0], dir: [0, 1, 0], small: true, geom: brush(-1) },
    { id: "holder", ref: "2", name: "Brush holder plate", mat: "black", parent: "rcover", stage: 2, A: Z, E: [-230, LO, 0], dir: [-1, 0, 0], geom: holder },
    { id: "shimR", ref: "4", name: "Shims, commutator end (shim set)", mat: "steel", parent: "arm", stage: 3, A: Z, E: [-185, LO, 0], dir: [1, 0, 0], small: true, count: 3, geom: shims(-52, 3) },
    { id: "shimF", ref: "4", name: "Shims, drive end (shim set)", mat: "steel", parent: "arm", stage: 3, A: Z, E: [-95, LO, 0], dir: [-1, 0, 0], small: true, count: 4, geom: shims(34.2, 4) },
    { id: "arm", ref: "1", name: "Armature", mat: "steel", stage: 4, A: Z, E: [-150, LO, 0], dir: [1, 0, 0], geom: armature },
    { id: "oringR", ref: "6", name: "O-ring, rear cover to yoke", mat: "rubber", parent: "yoke", stage: 5, A: Z, E: [-35, 0, 0], dir: [1, 0, 0], small: true, geom: oRing(30.5, 1.2, -40.8) },
    { id: "rcover", ref: "0", name: "Rear end cover with mounting foot (part of motor assembly)", mat: "alu", stage: 5, A: Z, E: [-325, LO, 0], dir: [1, 0, 0], shell: true, geom: rearCover },
    { id: "oringF", ref: "6", name: "O-ring, front cover to yoke", mat: "rubber", parent: "yoke", stage: 6, A: Z, E: [35, 0, 0], dir: [-1, 0, 0], small: true, geom: oRing(30.5, 1.2, 40.8) },
    { id: "fcover", ref: "0", name: "Front end cover with mounting ears (part of motor assembly)", mat: "alu", stage: 6, A: Z, E: [90, 0, 0], dir: [-1, 0, 0], shell: true, geom: frontCover },
    { id: "bolts5", ref: "5", name: "Through bolts (starting motor housing)", mat: "zinc", stage: 7, A: Z, E: [-445, LO, 0], dir: [1, 0, 0], small: true, count: 2, geom: bolts5 },
    { id: "washer10", ref: "10", name: "Lock washer (terminal)", mat: "steel", parent: "yoke", stage: 8, A: Z, E: [0, 22, 0], dir: [0, -1, 0], small: true, geom: lockWasher },
    { id: "nut9", ref: "9", name: "Nut 6 mm (terminal)", mat: "zinc", parent: "yoke", stage: 8, A: Z, E: [0, 42, 0], dir: [0, -1, 0], small: true, geom: nut9 },
    { id: "oring8", ref: "8", name: "O-ring 2 x 24.5 (front cover nose)", mat: "rubber", parent: "fcover", stage: 9, A: Z, E: [150, 0, 0], dir: [-1, 0, 0], small: true, geom: oRing(13.25, 1, 59.5) },
    { id: "screw7", ref: "7", name: "Screw 6 mm (rear cover foot)", mat: "zinc", parent: "rcover", stage: 9, A: Z, E: [-325, -10, 0], dir: [0, -1, 0], small: true, geom: screw7 },
  ];

  return {
    id: "CMS-BLCK0069", title: "Starting motor (Mitsuba)", units: "mm", page: "BLCK0069",
    accuracy: "Approximate geometry. Part identity, numbering and the exploded layout follow the CMSNL picture for this page. Sizes are typical for a small Mitsuba motorcycle starter, not measured from a GS750; only O-ring 8 (2 x 24.5) has a size in the catalogue. Use the factory service manual for every dimension.",
    view: { dir: [-1, .8, 1], up: [0, 1, 0] },
    notModelled: "Ref 0 is the complete starting motor. The yoke and the two end covers are only sold as part of it, so they are drawn under ref 0. The small tabbed plate the picture shows next to the drive-end shims has no ref number and is not drawn. The shim set (ref 4) is split as the picture shows it: four shims at the drive end and three at the commutator end; the real number varies with armature end play. Brush springs and the lead from the terminal stud to the brush holder are not drawn.",
    stages: [
      { t: "Brushes into the holder", d: "Slide the two brushes into their boxes on the holder plate and fix the pigtails. Check brush length first: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Holder into the rear cover", d: "Set the brush holder plate into the rear cover so its bolt holes line up with the cover's." },
      { t: "Shims on the armature", d: "Put the shims back on both ends of the shaft in the same number they came off. End play: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Armature into the yoke", d: "Slide the armature into the yoke, splined end toward the front. The magnets will pull it to one side, so hold it straight." },
      { t: "Rear cover", d: "Fit a new O-ring at the back of the yoke. Hold the brushes back, ease the rear cover over the commutator and seat it on the yoke." },
      { t: "Front cover", d: "Fit a new O-ring at the front of the yoke and push the front cover on over the shaft, lining up the marks on cover and yoke." },
      { t: "Through bolts", d: "Run the two long bolts in from the rear cover and tighten them evenly. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Terminal", d: "Put the lock washer and the 6 mm nut on the terminal stud. The starter cable goes under the nut when the motor is on the bike." },
      { t: "Ready to fit", d: "Grease a new O-ring and roll it into the groove on the front cover nose. On the engine the foot of the rear cover takes the 6 mm screw." },
    ],
    parts,
  };
})();
D3_MODELS["CMS-BLCK0069"] = D3_BLCK0069;
