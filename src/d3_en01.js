/* ============ 3D parts model: camshafts and valves, GS750B 1977 (CMSNL BLCK0004) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: +X along the camshaft axis (rider's left to right is not implied; cylinders 1..4 at X = -117, -47, 47, 117,
   cam chain and sprockets in the middle at X ~ 0), +Y up the cylinder axis, +Z forward (exhaust side). Y = 0 is the
   combustion-chamber roof where the valve faces sit. Intake valves lean back (-Z), exhaust valves lean forward (+Z).
   Each valve stack is built along its own valve axis u: s = 0 at the valve face, s grows toward the cam.
   Identity and numbering: CMSNL camshaft-valve page (refs 1-19).
   Geometry: APPROXIMATE. Bore spacing, valve angle, valve/tappet/spring sizes and cam lobe shape are typical for a
   1970s 750cc DOHC two-valve engine, not factory measurements. Two figures come from the catalogue itself: the stem oil
   seal size (7 x 14.4 x 9, so a 7 mm valve stem) and the shim thickness range 2.15-3.10 mm (read from the size suffix on
   the replacement numbers for refs 15-17). Check every dimension against the factory service manual. */
(() => {
  const CYL = [-117, -47, 47, 117];                 // cylinder centre lines along the cam (approximate)
  const ANG = 30, sn = Math.sin(ANG * Math.PI / 180), cs = Math.cos(ANG * Math.PI / 180);
  const SIDE = {                                     // u = valve axis (unit, YZ plane); P0z = valve face centre
    in: { u: [0, cs, -sn], rot: -ANG, z0: -17 },
    ex: { u: [0, cs, sn], rot: ANG, z0: 17 },
  };
  const S_CAM = 121, R_BASE = 15, LIFT = 8.5;         // cam centre along the valve axis, base circle, lobe lift
  const r3 = v => v.map(x => +x.toFixed(3));
  const at = (side, s) => r3([0, SIDE[side].u[1] * s, SIDE[side].z0 + SIDE[side].u[2] * s]);
  const ex = (side, s, off) => at(side, s + off);
  // one item per cylinder, tilted onto that side's valve axis
  const row = (side, item) => ({ type: "group", items: CYL.map(x => ({ type: "group", items: [item], rot: [SIDE[side].rot, 0, 0], at: [x, 0, 0] })) });
  const lathe = pts => ({ type: "lathe", pts });

  // cam lobe outline in the plane across the cam, nose turned by phi (deg) from the "away from tappet" direction
  const lobe = (side, phi, x) => {
    const u = SIDE[side].u, a0 = Math.atan2(u[2], u[1]) + phi * Math.PI / 180, pts = [];
    for (let t = 0; t < 360; t += 4) {
      const d = Math.min(t, 360 - t), r = R_BASE + (d < 70 ? LIFT * Math.pow(Math.cos(d / 70 * Math.PI / 2), 2) : 0), a = a0 + t * Math.PI / 180;
      const y = r * Math.cos(a), z = r * Math.sin(a); pts.push([+(-z).toFixed(3), +y.toFixed(3)]);
    }
    return { type: "extrude", pts, depth: 13, bevel: .5, rot: [0, 90, 0], at: [x - 6.5, 0, 0] };
  };
  const cam = (side, phases) => ({ type: "group", items: [
    { type: "cyl", r: 10, h: 300, axis: "x", at: [-150, 0, 0] },                                   // shaft core
    ...[-145, -82, -20, 20, 82, 145].map(x => ({ type: "cyl", r: 12.5, h: 14, axis: "x", at: [x - 7, 0, 0] })), // journals
    { type: "cyl", r: 31, h: 5, axis: "x", at: [-6, 0, 0] },                                      // sprocket flange
    { type: "cyl", r: 14, h: 6, axis: "x", at: [-152, 0, 0], mat: "dark" },                        // end boss
    ...CYL.map((x, i) => lobe(side, phases[i], x)),
  ] });
  const sprocket = { type: "gear", r: 41, teeth: 32, h: 6, bore: 25, toothH: 4, holes: [[0, 27.5, 3.2], [0, -27.5, 3.2], [30, 0, 5], [-30, 0, 5]], rot: [0, 0, -90], at: [-1, 0, 0] };
  const bolts = { type: "group", items: [27.5, -27.5].map(z => ({ type: "group", items: [
    lathe([[0, -11], [3, -11], [3, 0], [0, 0]]),
    { type: "hex", af: 10, h: 4, y: 0 },
    lathe([[0, 0], [6.8, 0], [6.8, .6], [0, .6]]),
  ], rot: [0, 0, -90], at: [5, 0, z] })) };      // head on the sprocket face (x = 5), shank 11 long through sprocket and flange

  const valve = R => lathe([[0, 0], [R, 0], [R, 1.2], [R - 2.5, 3.5], [8, 9], [5, 14], [3.5, 24], [3.5, 96], [3, 96.8], [3, 98.6], [3.5, 99.4], [3.5, 101.6], [3.1, 102], [0, 102]]);
  const springs = { type: "group", items: [
    { type: "spring", R: 13, wire: 3.4, h: 36, turns: 5.5 },
    { type: "spring", R: 9, wire: 2.4, h: 35, turns: 7 },
  ] };
  const seat = { type: "ring", ro: 15.5, ri: 7.6, h: 1 };
  const seal = lathe([[3.4, 0], [7.2, 0], [7.2, 9], [5, 9], [3.2, 7.5], [3.6, 5], [3.4, 3]]);
  const retainer = lathe([[4.6, 0], [7.6, 0], [7.6, 2], [11, 2], [11, 3], [15, 3], [15, 5.5], [6.2, 5.5]]);
  const tappet = lathe([[15.2, 0], [16.5, 0], [16.5, 25], [12.7, 25], [12.7, 23.5], [0, 23.5], [0, 22], [15.2, 22]]);
  const shim = lathe([[0, 0], [12.5, 0], [12.5, 2.5], [0, 2.5]]);

  // explode offsets along each valve axis (mm), bottom to top: seat, seal, springs, retainer, tappet, shim, cam
  const OFF = { valve: -165, seat: 40, seal: 70, springs: 100, retainer: 130, tappet: 165, shim: 190, cam: 240 };
  const neg = v => v.map(x => -x);
  const P = [];
  const stack = (side, nm) => {
    const u = SIDE[side].u, s = side;
    P.push(
      { id: `seat_${s}`, ref: "12", name: `Valve spring seats (${nm})`, mat: "steel", small: true, stage: 1, count: 4, A: at(s, 50), E: ex(s, 50, OFF.seat), dir: neg(u), geom: row(s, seat) },
      { id: `seal_${s}`, ref: "14", name: `Valve stem oil seals (${nm})`, mat: "rubber", small: true, stage: 2, count: 4, A: at(s, 52), E: ex(s, 52, OFF.seal), dir: neg(u), geom: row(s, seal) },
      { id: `springs_${s}`, ref: "10", name: `Valve spring sets, inner and outer (${nm})`, mat: "spring", parent: `seat_${s}`, stage: 4, count: 4, A: at(s, 51), E: ex(s, 51, OFF.springs), dir: neg(u), geom: row(s, springs) },
      { id: `ret_${s}`, ref: "11", name: `Valve spring retainers (${nm})`, mat: "steel", parent: `valve_${s}`, stage: 5, count: 4, A: at(s, 84), E: ex(s, 84, OFF.retainer), dir: neg(u), geom: row(s, retainer) },
      { id: `tappet_${s}`, ref: "7", name: `Tappets (${nm})`, mat: "steel", stage: 6, count: 4, A: at(s, 80), E: ex(s, 80, OFF.tappet), dir: neg(u), geom: row(s, tappet) },
      { id: `shim_${s}`, ref: "13, 15, 16, 17", name: `Tappet shims (${nm}), one per tappet; thickness 2.15-3.10 mm chosen to set the clearance`, mat: "steel", small: true, parent: `tappet_${s}`, stage: 7, count: 4, A: at(s, 103.5), E: ex(s, 103.5, OFF.shim), dir: neg(u), geom: row(s, shim) },
    );
  };
  P.push(
    { id: "valve_in", ref: "8", name: "Intake valves", mat: "steel", stage: 3, count: 4, A: at("in", 0), E: ex("in", 0, OFF.valve), dir: SIDE.in.u, geom: row("in", valve(17)) },
    { id: "valve_ex", ref: "9", name: "Exhaust valves", mat: "steel", stage: 3, count: 4, A: at("ex", 0), E: ex("ex", 0, OFF.valve), dir: SIDE.ex.u, geom: row("ex", valve(14.5)) },
  );
  stack("in", "intake"); stack("ex", "exhaust");
  // lobes drawn at assorted angles that keep the base circle on every shim (not the real timing phase)
  const camIn = at("in", S_CAM), camEx = at("ex", S_CAM), camInE = ex("in", S_CAM, OFF.cam), camExE = ex("ex", S_CAM, OFF.cam);
  const shift = (v, dx) => [v[0] + dx, v[1], v[2]];
  P.push(
    { id: "cam_in", ref: "1", name: "Camshaft, intake", mat: "steel", stage: 8, A: camIn, E: camInE, dir: [0, -1, 0], geom: cam("in", [-70, 20, -25, 65]) },
    { id: "cam_ex", ref: "4", name: "Camshaft, exhaust", mat: "steel", stage: 8, A: camEx, E: camExE, dir: [0, -1, 0], geom: cam("ex", [60, -30, 25, -65]) },
    { id: "spr_in", ref: "2", name: "Sprocket, intake camshaft", mat: "steel", parent: "cam_in", stage: 9, A: camIn, E: shift(camInE, 190), dir: [-1, 0, 0], geom: sprocket },
    { id: "bolt_in", ref: "3", name: "Bolts 6x11 (intake sprocket)", mat: "zinc", small: true, parent: "spr_in", stage: 9, count: 2, A: camIn, E: shift(camInE, 222), dir: [-1, 0, 0], geom: bolts },
    { id: "spr_ex", ref: "5", name: "Sprocket, exhaust camshaft", mat: "steel", parent: "cam_ex", stage: 9, A: camEx, E: shift(camExE, 190), dir: [-1, 0, 0], geom: sprocket },
    { id: "bolt_ex", ref: "6", name: "Bolts 6x11 (exhaust sprocket)", mat: "zinc", small: true, parent: "spr_ex", stage: 9, count: 2, A: camEx, E: shift(camExE, 222), dir: [-1, 0, 0], geom: bolts },
  );

  D3_MODELS["DG-EN-01"] = {
    id: "DG-EN-01", title: "Camshafts and valves", units: "mm", page: "BLCK0004",
    accuracy: "Approximate geometry. Part identity, numbering and fitting order come from the CMSNL camshaft-valve page. Cylinder spacing, valve angle and the sizes of the valves, springs, tappets and cams are typical for an engine of this type, not measured from a GS750. The stem seal size (7 x 14.4 x 9) and the shim range (2.15 to 3.10 mm) come from the catalogue. Use the factory service manual for every dimension.",
    view: { dir: [.8, .62, 1.5], up: [0, 1, 0] },
    spin4: true, fullscreen: true, tilt3: true, partsCheck: true, // up/down arrows for top and bottom views; ⚙ parts check (have / missing / notes) // four quarter-turn views with arrows either side, and a full-screen button
    notModelled: "Refs 15, 16 and 17 are the same shim in different thicknesses (2.15 to 3.10 mm in 0.05 mm steps); only one sits on each tappet, so they share the shim part with ref 13. Ref 18 (tappet shim set) and ref 19 (its case) are a workshop kit for clearance adjustment, not parts of the engine, so they aren't drawn. The valve cotters, valve guides, cam caps and the cylinder head are on other pages, so they aren't drawn either. The cam lobes are shown at angles that keep every valve shut, not at the real timing.",
    stages: [
      { t: "Spring seats", d: "Drop a spring seat over each valve guide, four on the intake side at the back and four on the exhaust side at the front." },
      { t: "Stem oil seals", d: "Push a new stem oil seal onto the top of each valve guide until it sits square." },
      { t: "Valves", d: "Oil each stem and feed the valves up through the guides from the combustion chamber. Intake valves are the larger ones at the back. Keep used valves in the guides they came from." },
      { t: "Valve springs", d: "Stand the inner and outer spring of each set on its seat. Which end goes down: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Retainers", d: "Compress each spring set with a valve spring compressor, fit the retainer and the two cotters, then release slowly and check the cotters are seated." },
      { t: "Tappets", d: "Oil the tappets and slide them into their bores over the springs. Used tappets go back in their own bores." },
      { t: "Shims", d: "Fit a shim in the recess on top of each tappet. Shim thickness is chosen from the measured clearance; method and spec: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Camshafts", d: "With the engine set to the timing position in the manual, lay the intake cam in at the back and the exhaust cam at the front, then fit the cam caps. Cap bolt order and torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Sprockets", d: "Slide each sprocket along the cam onto its centre flange, with the cam chain on, and line up the timing marks. Fit the two bolts per sprocket; thread locker and torque: VERIFY IN FACTORY SERVICE MANUAL." },
    ],
    parts: P,
  };
})();
