/* ============ 3D parts model: starting motor (ND / Nippondenso), GS750B 1977 (CMSNL BLCK0070) ============
   Mechanical data only (no rendering code). Units: millimetres.
   Built from a copy of the Mitsuba model (d3_blck0069.js) and changed to the ND parts list and picture.
   Local frame of the motor (a self-contained unit, not placed in the engine frame):
     X = armature axis, +X toward the drive end (front cover with the bearing, oil seal and nose O-ring 15),
     origin on the axis at the middle of the yoke, +Y up (terminal stud on top, mounting foot under the rear cover),
     +Z toward the viewer side.
   Every part's geometry is laid out in this frame, so every A is [0, 0, 0] and E is the exploded offset.
   Layout follows the CMSNL picture: everything is pulled apart along the armature axis, rear cover with its bushing
   and shims at one end, front cover with bearing 9, oil seal 4 and O-ring 15 at the other, brushes and spring above,
   through bolts drawn below.
   Geometry: APPROXIMATE. Sizes are typical for a small 1970s motorcycle starter (yoke about 64 mm across, 80 mm long),
   not measured from a GS750. Only O-ring 15 has a size in the catalogue (2 mm section, 24.5 mm bore). */
const D3_BLCK0070 = (() => {
  const xl = (pts, mat) => ({ type: "lathe", pts, rot: [0, 0, -90], ...(mat ? { mat } : {}) });     // profile [[r, x]...] turned around X
  const xgear = (o, x0, mat) => ({ type: "gear", ...o, rot: [0, 0, -90], at: [x0, 0, 0], ...(mat ? { mat } : {}) });
  const yzPlate = (pts, holes, depth, x0, mat, bevel = .3) => ({ type: "extrude", pts, holes, depth, bevel, rot: [0, 90, 0], at: [x0, 0, 0], ...(mat ? { mat } : {}) });
  // in yzPlate outlines a point [u, v] lands at world (y = v, z = -u)
  const arc = (r0, r1, a0, a1, n = 16) => { const p = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; p.push([+(r1 * Math.cos(a)).toFixed(3), +(r1 * Math.sin(a)).toFixed(3)]); }
    for (let i = n; i >= 0; i--) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; p.push([+(r0 * Math.cos(a)).toFixed(3), +(r0 * Math.sin(a)).toFixed(3)]); } return p; };
  const circ = (r, n = 48) => Array.from({ length: n }, (_, i) => [+(r * Math.cos(i / n * 2 * Math.PI)).toFixed(3), +(r * Math.sin(i / n * 2 * Math.PI)).toFixed(3)]);
  // rounded square outline, half width h, corner radius c
  const rsq = (h, c) => { const p = []; [[1, 1, 0], [-1, 1, 90], [-1, -1, 180], [1, -1, 270]].forEach(([su, sv, a0]) => { for (let i = 0; i <= 6; i++) { const a = (a0 + i * 15) * Math.PI / 180; p.push([+(su * (h - c) + c * Math.cos(a)).toFixed(3), +(sv * (h - c) + c * Math.sin(a)).toFixed(3)]); } }); return p; };

  // through bolts sit inside the yoke on one diagonal, the two field magnets on the other
  const BR = 26, BD = +(BR / Math.SQRT2).toFixed(2);
  const BOLTS = [[BD, -BD], [-BD, BD]];                      // [y, z]
  const boltUV = BOLTS.map(([y, z]) => [-z, y]);

  // ---- yoke (part of motor assembly 0): steel tube, two magnets inside, insulated terminal stud on top near the rear ----
  const yoke = { type: "group", items: [
    xl([[29, -40], [32, -40], [32, 40], [29, 40], [29, -40]]),
    yzPlate(arc(22, 28.8, 85, 185), [], 64, -32, "dark", 0),
    yzPlate(arc(22, 28.8, 265, 365), [], 64, -32, "dark", 0),
    { type: "cyl", r: 7, h: 5, at: [-30, 31, 0], mat: "black" },          // insulator boss
    { type: "cyl", r: 3, h: 16, at: [-30, 30, 0], mat: "brass" },          // terminal stud
    { type: "cyl", r: 4.5, h: 1.2, axis: "z", at: [6, 0, 31.6], mat: "black" },   // stamped mark on the side, as in the picture
  ] };

  // ---- front (drive end) cover: square flange with two mounting holes, bearing and seal bores, nose with O-ring groove ----
  const frontCover = { type: "group", items: [
    xl([[6, 66], [6, 56], [12, 56], [12, 52], [13.5, 52], [13.5, 38], [28.8, 38], [28.8, 40], [33, 40], [33, 48], [17, 48], [17, 58],
        [13.6, 58], [13.6, 60], [12.3, 60], [12.3, 62], [13.6, 62], [13.6, 66], [6, 66]]),
    yzPlate(rsq(36, 12), [[29, -29, 3.4], [-29, 29, 3.4], ...boltUV.map(([u, v]) => [u, v, 2.4])], 6, 42),
  ] };

  // ---- rear (commutator end) cover: cup with the bushing boss, brush holder inside, foot underneath ----
  const footPts = [[-56, -14], [-42, -14], [-42, 26], [-49, 33], [-56, 26]];
  const rearCover = { type: "group", items: [
    xl([[0, -60], [11, -60], [11, -58], [31, -58], [33, -56], [33, -40.6], [28.5, -40.6], [28.5, -54], [11, -54], [11, -49.5], [8, -49.5], [8, -57], [0, -57]]),
    { type: "extrude", pts: footPts, holes: [[-49, 25, 3.3]], depth: 5, bevel: .5, rot: [90, 0, 0], at: [0, -31, 0] },
    { type: "box", size: [14, 5, 28], r: 1, at: [-49, -31.5, 0] },
    ...BOLTS.map(([y, z]) => ({ type: "cyl", r: 6, h: 1.2, axis: "x", at: [-58.6, y, z] })),   // spot faces for the bolt heads
    // brush holder plate on four posts, two brush boxes on the vertical line
    yzPlate(circ(27, 48), [[0, 0, 12.5], ...boltUV.map(([u, v]) => [u, v, 3.2])], 2, -50, "black"),
    ...[[0, 20], [0, -20], [20, 0], [-20, 0]].map(([y, z]) => ({ type: "cyl", r: 2, h: 4, axis: "x", at: [-52, y, z], mat: "black" })),
    ...[1, -1].flatMap(s => [
      { type: "box", size: [10, 13, 1], r: .2, at: [-43, s * 18, 4.4], mat: "brass" },
      { type: "box", size: [10, 13, 1], r: .2, at: [-43, s * 18, -4.4], mat: "brass" },
      { type: "box", size: [10, 1, 9.8], r: .2, at: [-43, s * 24.8, 0], mat: "brass" },
    ]),
  ] };

  // ---- armature: shaft with splined drive end, slotted core, windings, commutator ----
  const armature = { type: "group", items: [
    xl([[0, -56.5], [5, -56.5], [5, 66.5], [0, 66.5]]),
    xgear({ r: 6.2, teeth: 10, h: 13, toothH: 1.3 }, 66.5),
    xl([[0, 79.5], [5, 79.5], [4.2, 80.3], [0, 80.3]]),
    xgear({ r: 21, teeth: 14, h: 60, toothH: 4.5, bore: 4 }, -30, "dark"),
    xl([[6, -35], [17.5, -35], [18.5, -33], [18.5, -30], [6, -30]], "brass"),
    xl([[6, 30], [18.5, 30], [18.5, 32], [17.5, 33.6], [6, 33.6]], "brass"),
    xgear({ r: 11, teeth: 24, h: 10, toothH: .5, bore: 4 }, -47, "brass"),
    xl([[5, -37], [12.6, -37], [12.6, -35], [5, -35]], "brass"),
  ] };

  // ---- brushes (refs 10, 11) and spring (ref 12) ----
  const brush = s => ({ type: "group", items: [
    { type: "box", size: [8, 8, 7.4], r: .6, at: [-43, s * 15.6, 0], mat: "dark" },
    { type: "tube", pts: [[-43, s * 19.6, 2], [-45, s * 21, 6], [-48, s * 19, 7]], r: .7, mat: "brass" },
  ] });
  const spring = s => ({ type: "spring", R: 2.6, wire: .5, h: 4.4, turns: 4, rot: s > 0 ? [0, 0, 0] : [180, 0, 0], at: [-43, s * 19.7, 0] });

  // ---- shims, bushing, bearing, seal, fasteners ----
  const shim = x => ({ type: "ring", ro: 8.5, ri: 5.1, h: .6, rot: [0, 0, -90], at: [x, 0, 0] });
  const bearing = { type: "group", items: [
    xl([[11.2, 43.2], [13.4, 43.2], [13.4, 51.8], [11.2, 51.8]]),
    xl([[5.05, 43.2], [7.3, 43.2], [7.3, 51.8], [5.05, 51.8]]),
    xl([[7.3, 44], [11.2, 44], [11.2, 44.6], [7.3, 44.6]], "dark"),
    { type: "array", pos: Array.from({ length: 7 }, (_, k) => { const a = k / 7 * 2 * Math.PI; return [47.5, +(9.25 * Math.cos(a)).toFixed(3), +(9.25 * Math.sin(a)).toFixed(3)]; }), item: { type: "sphere", r: 2 } },
  ] };
  const seal = xl([[5.1, 52.1], [11.9, 52.1], [11.9, 55.9], [8, 55.9], [5.6, 54.5], [5.1, 53.5]]);
  const throughBolt = { type: "group", items: [
    { type: "hex", af: 8, h: 4, y: 0, rot: [0, 0, 90], at: [-60.7, 0, 0] },
    xl([[0, -60.7], [2.5, -60.7], [2.5, 47], [2, 47.6], [0, 47.6]]),
  ] };
  const bolts1 = { type: "pair", at: BOLTS.map(([y, z]) => [0, y, z]), item: throughBolt };
  const washers2 = { type: "pair", at: BOLTS.map(([y, z]) => [0, y, z]), item: { type: "ring", ro: 4.6, ri: 2.6, h: 1.5, split: true, rot: [0, 0, -90], at: [-60.7, 0, 0] } };
  const oRing = (R, r, x) => ({ type: "torus", R, r, rot: [0, 0, 90], at: [x, 0, 0] });
  const screw14 = { type: "group", items: [
    { type: "lathe", pts: [[0, -12], [3, -12], [3, 0], [6, 0], [6, 1], [0, 1]] },
    { type: "hex", af: 10, h: 4.5, y: 1 } ], at: [-49, -31, 25] };
  const lockWasher17 = { type: "ring", ro: 5.4, ri: 3.1, h: 1.6, split: true, at: [-30, 36, 0] };
  const nut16 = { type: "hex", af: 10, h: 5, y: 38.1, hole: 3, at: [-30, 0, 0] };

  const Z = [0, 0, 0], RC = -200, LO = -140;
  const parts = [
    { id: "yoke", ref: "0", name: "Yoke with field magnets and terminal stud (part of motor assembly)", mat: "steel", stage: 0, A: Z, E: Z, dir: [1, 0, 0], shell: true, geom: yoke },
    { id: "bush5", ref: "5", name: "Bushing, rear cover", mat: "brass", parent: "rcover", stage: 1, A: Z, E: [-150, 0, 0], dir: [-1, 0, 0], small: true,
      geom: xl([[5.05, -57], [8, -57], [8, -49.6], [5.05, -49.6]]) },
    { id: "brush10", ref: "10", name: "Brush (-), upper", mat: "dark", parent: "rcover", stage: 2, A: Z, E: [RC, 60, 0], dir: [0, -1, 0], small: true, geom: brush(1) },
    { id: "brush11", ref: "11", name: "Brush (-), lower", mat: "dark", parent: "rcover", stage: 2, A: Z, E: [RC, -55, 0], dir: [0, 1, 0], small: true, geom: brush(-1) },
    { id: "spring12U", ref: "12", name: "Brush spring, upper", mat: "spring", parent: "rcover", stage: 2, A: Z, E: [RC, 85, 0], dir: [0, -1, 0], small: true, geom: spring(1) },
    { id: "spring12L", ref: "12", name: "Brush spring, lower", mat: "spring", parent: "rcover", stage: 2, A: Z, E: [RC, -75, 0], dir: [0, 1, 0], small: true, geom: spring(-1) },
    { id: "shim8", ref: "8", name: "Shim (3), next to the bushing", mat: "steel", parent: "arm", stage: 3, A: Z, E: [-135, 0, 0], dir: [1, 0, 0], small: true, geom: shim(-49.4) },
    { id: "shim7", ref: "7", name: "Shim (2)", mat: "steel", parent: "arm", stage: 3, A: Z, E: [-125, 0, 0], dir: [1, 0, 0], small: true, geom: shim(-48.7) },
    { id: "shim6", ref: "6", name: "Shim (1), next to the commutator", mat: "steel", parent: "arm", stage: 3, A: Z, E: [-115, 0, 0], dir: [1, 0, 0], small: true, geom: shim(-48) },
    { id: "arm", ref: "3", name: "Armature", mat: "steel", stage: 4, A: Z, E: [150, 0, 0], dir: [-1, 0, 0], geom: armature },
    { id: "gasket13", ref: "13", name: "Gasket, rear cover to yoke", mat: "rubber", parent: "yoke", stage: 5, A: Z, E: [-90, 0, 0], dir: [1, 0, 0], small: true,
      geom: { type: "ring", ro: 32.6, ri: 28.8, h: .6, rot: [0, 0, -90], at: [-40.6, 0, 0] } },
    { id: "rcover", ref: "0", name: "Rear end cover with brush holder and foot (part of motor assembly)", mat: "alu", stage: 5, A: Z, E: [RC, 0, 0], dir: [1, 0, 0], shell: true, geom: rearCover },
    { id: "bear9", ref: "9", name: "Ball bearing, front cover", mat: "steel", parent: "fcover", stage: 6, A: Z, E: [200, 0, 0], dir: [1, 0, 0], geom: bearing },
    { id: "seal4", ref: "4", name: "Oil seal, front cover", mat: "rubber", parent: "fcover", stage: 6, A: Z, E: [215, 0, 0], dir: [1, 0, 0], small: true, geom: seal },
    { id: "fcover", ref: "0", name: "Front end cover with mounting flange (part of motor assembly)", mat: "alu", stage: 7, A: Z, E: [260, 0, 0], dir: [-1, 0, 0], shell: true, geom: frontCover },
    { id: "lw2", ref: "2", name: "Lock washers (through bolts)", mat: "spring", parent: "bolts1", stage: 8, A: Z, E: [-230, LO, 0], dir: [1, 0, 0], small: true, count: 2, geom: washers2 },
    { id: "bolts1", ref: "1", name: "Through bolts (starting motor housing)", mat: "zinc", stage: 8, A: Z, E: [RC, LO, 0], dir: [1, 0, 0], small: true, count: 2, geom: bolts1 },
    { id: "lw17", ref: "17", name: "Lock washer (terminal)", mat: "spring", parent: "yoke", stage: 9, A: Z, E: [0, 22, 0], dir: [0, -1, 0], small: true, geom: lockWasher17 },
    { id: "nut16", ref: "16", name: "Nut 6 mm (terminal)", mat: "zinc", parent: "yoke", stage: 9, A: Z, E: [0, 42, 0], dir: [0, -1, 0], small: true, geom: nut16 },
    { id: "oring15", ref: "15", name: "O-ring 2 x 24.5 (front cover nose)", mat: "rubber", parent: "fcover", stage: 10, A: Z, E: [300, 0, 0], dir: [-1, 0, 0], small: true, geom: oRing(13.25, 1, 61) },
    { id: "screw14", ref: "14", name: "Bolt 6 mm (rear cover foot)", mat: "zinc", parent: "rcover", stage: 10, A: Z, E: [RC, 100, 0], dir: [0, -1, 0], small: true, geom: screw14 },
  ];

  return {
    id: "CMS-BLCK0070", title: "Starting motor (ND)", units: "mm", page: "BLCK0070",
    accuracy: "Approximate geometry. Part identity, numbering and the exploded layout follow the CMSNL picture for this page. Sizes are typical for a small motorcycle starter, not measured from a GS750; only O-ring 15 (2 x 24.5) has a size in the catalogue. Use the factory service manual for every dimension.",
    view: { dir: [-1, .8, 1], up: [0, 1, 0] },
    notModelled: "Ref 0 is the complete starting motor. The yoke and the two end covers are only sold as part of it, so they are drawn under ref 0. Refs 10 and 11 carry the same part number (brush, negative) and are drawn as the upper and lower brush. The spring (ref 12) is drawn as one per brush; the real count is not given. The positive brush and lead from the terminal stud are not listed and not drawn. The picture shows one through bolt and one lock washer; two of each are drawn, as on the Mitsuba motor.",
    stages: [
      { t: "Bushing", d: "The bushing is pressed into the boss inside the rear cover. Check it for wear before you go further." },
      { t: "Brushes and springs", d: "Put the springs and the two brushes into the boxes on the rear cover's brush holder. Check brush length first: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Shims on the armature", d: "Slide the shims onto the commutator end of the shaft in the order they came off. End play: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Armature into the yoke", d: "Slide the armature into the yoke from the front, splined end out. The magnets pull it to one side, so hold it straight." },
      { t: "Rear cover", d: "Lay a new gasket on the back of the yoke. Hold the brushes back, ease the rear cover over the commutator and seat it." },
      { t: "Bearing and seal", d: "Press the bearing and then the oil seal into the front cover, seal lip facing in. Grease the seal lip." },
      { t: "Front cover", d: "Push the front cover on over the splined shaft and line up its marks with the yoke." },
      { t: "Through bolts", d: "Put a lock washer under each through bolt head, run them in from the rear cover and pull them up evenly. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Terminal", d: "Fit the lock washer and the 6 mm nut on the terminal stud. The starter cable goes under the nut on the bike." },
      { t: "Ready to fit", d: "Roll a new greased O-ring into the groove on the front cover nose. On the engine the rear cover foot takes the 6 mm bolt." },
    ],
    parts,
  };
})();
D3_MODELS["CMS-BLCK0070"] = D3_BLCK0070;
