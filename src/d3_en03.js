/* ============ 3D parts model: clutch, GS750B 1977 (CMSNL BLCK0009) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: +Y along the transmission input shaft axis (shaft axis at X = 0, Z = 0), pointing outward from the
   crankcase toward the clutch cover (right side of the engine). Y = 0 is the back face of the primary driven gear.
   Low Y = engine side, high Y = clutch cover side. Every part's final installing move is toward the engine (-Y).
   Identity and numbering: CMSNL clutch page (refs 1-20).
   Geometry: APPROXIMATE. Sizes taken from the catalogue: thrust washer 25 x 66 x 3.5 (ref 8), push piece thrust bearing
   15 x 28 x 2 (ref 16), oil pump drive gear bearing 36 x 40 x 10 (ref 20), oil pump drive gear 38 teeth (ref 18-2).
   Six spring bolts per GS750 owners' forum reports. Everything else (basket and plate diameters, plate counts 8 friction /
   7 steel, plate thickness, hub and pressure disc shape, spring size) is typical for a 1970s 750cc multi-plate wet
   clutch, not a factory measurement. Check every dimension and count against the factory service manual. */
(() => {
  const N_SPR = 6, R_SPR = 42;                 // spring towers: count and pitch radius
  const N_SLOT = 8;                             // basket slots / friction plate tabs
  const T_F = 2.9, T_S = 1.6, N_F = 8, N_S = 7; // friction / steel plate thickness and count (approximate)
  const Y_HUB = 38.5, Y_STACK = Y_HUB + 4;      // hub bottom (on washer 8), plate stack bottom (on hub flange)
  const Y_PD = +(Y_STACK + N_F * T_F + N_S * T_S).toFixed(2); // pressure disc rim bottom = stack top
  const Y_SPR = Y_PD + 8, H_SPR = 26;           // spring seat on the pressure disc web, installed spring height
  const Y_W14 = Y_SPR + H_SPR, Y_BOLT = Y_W14 + 1.6;
  const Y_TOWER = 100;                          // top of the hub spring towers (world)
  const r3 = v => +v.toFixed(3);
  const RG = (ro, ri, h, o = {}) => ({ type: "lathe", pts: [[ri, 0], [ro, 0], [ro, h], [ri, h]], ...o }); // plain ring as a lathe profile
  const ang = (k, n, off = 0) => (off + k * 360 / n);
  const ring = (n, R, off = 0, y = 0) => Array.from({ length: n }, (_, k) => { const a = ang(k, n, off) * Math.PI / 180; return [r3(Math.cos(a) * R), y, r3(Math.sin(a) * R), r3(-ang(k, n, off))]; });
  const arc = (r1, r2, a0, a1, n = 10) => { const p = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; p.push([r3(Math.cos(a) * r2), r3(Math.sin(a) * r2)]); }
    for (let i = n; i >= 0; i--) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; p.push([r3(Math.cos(a) * r1), r3(Math.sin(a) * r1)]); } return p; };
  const circ = (r, n = 64) => Array.from({ length: n }, (_, i) => [r3(Math.cos(i / n * Math.PI * 2) * r), r3(Math.sin(i / n * Math.PI * 2) * r)]);
  const holesAt = (n, R, r, off = 0) => Array.from({ length: n }, (_, k) => { const a = ang(k, n, off) * Math.PI / 180; return [r3(Math.cos(a) * R), r3(Math.sin(a) * R), r]; });

  // basket fingers: arc segments between the slots, rising from the basket floor
  const slotW = 14, slotDeg = slotW / 68 * 180 / Math.PI, fingDeg = 360 / N_SLOT - slotDeg;
  const fingers = { type: "group", items: Array.from({ length: N_SLOT }, (_, k) => ({ type: "extrude", depth: 58, bevel: 0,
    pts: arc(66, 70, 360 / N_SLOT * (k + .5) - fingDeg / 2, 360 / N_SLOT * (k + .5) + fingDeg / 2, 8), rot: [-90, 0, 0], at: [0, 22, 0] })) };

  // plate stack offsets (local, from the stack bottom): friction first and last, steel in between
  const fY = Array.from({ length: N_F }, (_, i) => r3(i * (T_F + T_S)));
  const sY = Array.from({ length: N_S }, (_, i) => r3(i * (T_F + T_S) + T_F));
  const friction = { type: "group", items: [
    RG(65, 57, T_F),
    { type: "array", pos: ring(N_SLOT, 67, 0, T_F / 2), item: { type: "box", size: [5, T_F, 12], r: .4 } } ] };
  const steel = { type: "group", items: [
    RG(63.5, 55.6, T_S),
    { type: "array", pos: ring(12, 54.7, 15, T_S / 2), item: { type: "box", size: [2, T_S, 8], r: .3 } } ] };

  const stages = [
    { t: "Oil pump drive gear", d: "With the spacer on the input shaft, slide the needle bearing onto it and fit the oil pump drive gear on the bearing, meshed with the oil pump driven gear." },
    { t: "Thrust washer, spacer and bearing", d: "Fit the thrust washer, then the primary driven spacer with its needle bearing. Oil the bearing first." },
    { t: "Basket", d: "Fit the primary driven gear assembly (basket) over the bearing. Mesh it with the primary drive gear and line up its pins with the holes in the oil pump drive gear." },
    { t: "Washer and sleeve hub", d: "Fit the 25 x 66 washer, then slide the sleeve hub onto the shaft splines." },
    { t: "Lock washer and nut", d: "Fit the lock washer and the hub nut. Hold the hub with a holder and tighten. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Plates", d: "Fit the plates alternately, friction plate first and last, tabs in the basket slots. Soak new friction plates in engine oil. Count and order: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Push piece", d: "Fit the thrust bearing and washer onto the push piece and slide it into the end of the input shaft against the push rod." },
    { t: "Pressure disc", d: "Fit the pressure disc over the spring towers so it sits on the top plate and the push piece washer." },
    { t: "Springs and bolts", d: "Fit the springs, washers and bolts. Tighten evenly in a cross pattern. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
  ];

  const D = [0, -1, 0];
  const parts = [
    // ---- behind the basket (engine side) ----
    { id: "pspacer", ref: "19", name: "Oil pump drive gear spacer", mat: "steel", small: true, stage: 0, A: [0, -15, 0], E: [0, -15, 0], dir: D,
      geom: RG(18, 12.6, 12) },
    { id: "pbrg", ref: "20", name: "Needle bearing (oil pump drive gear, 36 x 40 x 10)", mat: "steel", parent: "pspacer", stage: 1, A: [0, -14, 0], E: [0, 20, 0], dir: D,
      geom: { type: "group", items: [ RG(20, 18, 10), RG(19.4, 18.6, 10.4, { at: [0, -.2, 0], mat: "dark" }) ] } },
    { id: "pgear", ref: "18", name: "Oil pump drive gear (38 teeth)", mat: "steel", parent: "pbrg", stage: 1, A: [0, -14, 0], E: [0, 45, 0], dir: D,
      geom: { type: "gear", r: 38, teeth: 38, toothH: 3, h: 10, bore: 20, holes: holesAt(4, 31, 3.3, 45) } },
    { id: "tw", ref: "2", name: "Thrust washer", mat: "steel", small: true, parent: "pspacer", stage: 2, A: [0, -3, 0], E: [0, 75, 0], dir: D,
      geom: RG(19, 12.6, 2) },
    { id: "spacer", ref: "3", name: "Spacer (primary driven gear)", mat: "steel", parent: "tw", stage: 2, A: [0, -1, 0], E: [0, 95, 0], dir: D,
      geom: RG(16, 12.6, 36) },
    { id: "brg", ref: "4", name: "Needle bearing (basket)", mat: "steel", parent: "spacer", stage: 2, A: [0, 2, 0], E: [0, 150, 0], dir: D,
      geom: { type: "group", items: [ RG(19, 18.3, 30),
        { type: "array", pos: ring(20, 17.2, 0, 1), item: { type: "cyl", r: 1.1, h: 28, seg: 10, mat: "dark" } } ] } },
    // ---- basket ----
    { id: "basket", ref: "1", name: "Primary driven gear assembly (clutch basket)", mat: "dark", parent: "brg", stage: 3, A: [0, 0, 0], E: [0, 210, 0], dir: D, shell: true,
      geom: { type: "group", items: [
        { type: "gear", r: 82, teeth: 84, toothH: 3.6, h: 16, bore: 30, mat: "steel" },
        { type: "lathe", pts: [[19, 0], [30, 0], [30, 16], [70, 16], [70, 22], [26, 22], [26, 34.5], [19, 34.5]] },
        fingers,
        { type: "array", pos: ring(6, 56, 30, -2), item: { type: "cyl", r: 4, h: 2, seg: 16, mat: "steel" } },        // damper rivets, back
        { type: "array", pos: ring(6, 56, 30, 22), item: { type: "cyl", r: 4, r2: 3, h: 1.6, seg: 16, mat: "steel" } },  // rivet heads, floor
        { type: "array", pos: ring(4, 31, 45, -12), item: { type: "cyl", r: 3, h: 12, seg: 16, mat: "steel" } },        // oil pump drive pins
      ] } },
    // ---- hub ----
    { id: "w8", ref: "8", name: "Washer (25 x 66 x 3.5)", mat: "steel", small: true, parent: "spacer", stage: 4, A: [0, 35, 0], E: [0, 310, 0], dir: D,
      geom: RG(33, 12.6, 3.5) },
    { id: "hub", ref: "5", name: "Sleeve hub", mat: "alu", parent: "w8", stage: 4, A: [0, Y_HUB, 0], E: [0, 335, 0], dir: D,
      geom: { type: "group", items: [
        { type: "lathe", pts: [[12.6, 0], [24, 0], [24, 4], [51, 4], [51, 0], [63, 0], [63, 4], [53.5, 4], [53.5, 37.5], [51, 37.5], [51, 10], [24, 10], [24, 30], [12.6, 30]] },
        { type: "array", pos: ring(12, 54.4, 0, 20.75), item: { type: "box", size: [2.2, 33.5, 8], r: .3 } },        // outer splines
        { type: "array", pos: ring(N_SPR, R_SPR, 0, 10), item: { type: "cyl", r: 6.3, h: Y_TOWER - Y_HUB - 10, seg: 24 } }, // spring towers
        { type: "array", pos: ring(N_SPR, R_SPR, 0, Y_TOWER - Y_HUB - .1), item: { type: "cyl", r: 3, h: .4, seg: 16, mat: "black" } },
        { type: "array", pos: ring(N_SPR, 33, 30, 4), item: { type: "box", size: [18, 12, 4], r: .6, at: [0, 6, 0] } },  // web ribs between towers
      ] } },
    { id: "lockw", ref: "7", name: "Lock washer (hub nut)", mat: "spring", small: true, parent: "hub", stage: 5, A: [0, Y_HUB + 30, 0], E: [0, 415, 0], dir: D,
      geom: { type: "lathe", pts: [[12, 0], [12, 1], [20, 1.8], [20, .8]] } },
    { id: "nut", ref: "6", name: "Nut (sleeve hub)", mat: "zinc", small: true, parent: "hub", stage: 5, A: [0, Y_HUB + 31.8, 0], E: [0, 435, 0], dir: D,
      geom: { type: "hex", af: 32, h: 10, hole: 11 } },
    // ---- plates (columns either side, nested inside the basket when fitted) ----
    { id: "drive", ref: "9", name: "Drive plates (friction)", mat: "dark", parent: "basket", stage: 6, A: [0, Y_STACK, 0], E: [230, 250, 0], dir: D, count: N_F,
      geom: { type: "group", items: fY.map(y => ({ type: "group", items: [friction], at: [0, y, 0] })) } },
    { id: "driven", ref: "10", name: "Driven plates (steel)", mat: "steel", parent: "basket", stage: 6, A: [0, Y_STACK, 0], E: [-230, 250, 0], dir: D, count: N_S,
      geom: { type: "group", items: sY.map(y => ({ type: "group", items: [steel], at: [0, y, 0] })) } },
    // ---- release side ----
    { id: "push", ref: "15", name: "Clutch push piece", mat: "steel", parent: "hub", stage: 7, A: [0, 85, 0], E: [0, 495, 0], dir: D,
      geom: { type: "lathe", pts: [[0, -30], [4, -30], [4, 0], [13, 0], [13, 3], [7.4, 3], [7.4, 5.5], [5.5, 6], [5.5, 11], [0, 11]] } },
    { id: "tbrg", ref: "16", name: "Thrust bearing (push piece, 15 x 28 x 2)", mat: "steel", small: true, parent: "push", stage: 7, A: [0, 88, 0], E: [0, 522, 0], dir: D,
      geom: { type: "group", items: [ RG(14, 7.5, .6), { type: "torus", R: 10.7, r: 1, at: [0, 1, 0], mat: "dark" }, RG(14, 7.5, .6, { at: [0, 1.4, 0] }) ] } },
    { id: "w17", ref: "17", name: "Washer (push piece)", mat: "steel", small: true, parent: "push", stage: 7, A: [0, 90, 0], E: [0, 538, 0], dir: D,
      geom: RG(14, 7.6, 1.5) },
    { id: "pdisc", ref: "11", name: "Clutch pressure disc", mat: "alu", parent: "hub", stage: 8, A: [0, Y_PD, 0], E: [0, 560, 0], dir: D,
      geom: { type: "group", items: [
        { type: "lathe", pts: [[50, 0], [63, 0], [63, 6], [61, 8], [50, 8]] },                                   // pressing rim
        { type: "extrude", pts: circ(52), holes: [[0, 0, 31], ...holesAt(N_SPR, R_SPR, 7.2)], depth: 4, bevel: 0, rot: [-90, 0, 0], at: [0, 4, 0] }, // web with tower holes
        { type: "lathe", pts: [[8, 14.6], [24, 14.6], [31, 4], [33, 4], [33, 8], [26, 20], [8, 20]] },           // raised centre over the push piece
      ] } },
    { id: "springs", ref: "12", name: "Clutch springs", mat: "spring", parent: "pdisc", stage: 9, A: [0, Y_SPR, 0], E: [0, 600, 0], dir: D, count: N_SPR,
      geom: { type: "array", pos: ring(N_SPR, R_SPR), item: { type: "spring", R: 8.5, wire: 2.4, h: H_SPR, turns: 6.5 } } },
    { id: "w14", ref: "14", name: "Washers (spring bolts)", mat: "zinc", small: true, parent: "springs", stage: 9, A: [0, Y_W14, 0], E: [0, 645, 0], dir: D, count: N_SPR,
      geom: { type: "array", pos: ring(N_SPR, R_SPR), item: RG(11, 3.2, 1.6) } },
    { id: "bolts", ref: "13", name: "Clutch spring bolts", mat: "zinc", small: true, parent: "w14", stage: 9, A: [0, Y_BOLT, 0], E: [0, 690, 0], dir: D, count: N_SPR,
      geom: { type: "array", pos: ring(N_SPR, R_SPR), item: { type: "group", items: [
        { type: "lathe", pts: [[0, -25], [2.6, -25], [3, -24.4], [3, 0], [0, 0]] },
        { type: "hex", af: 10, h: 4.5 },
        { type: "cyl", r: 6, h: .8, seg: 24 } ] } } },
  ];

  D3_MODELS["DG-EN-03"] = {
    id: "DG-EN-03", title: "Clutch", units: "mm", page: "BLCK0009",
    accuracy: "Approximate geometry. Part identity, numbering and fitting order come from the CMSNL clutch page. A few sizes come from the catalogue descriptions (25 x 66 x 3.5 washer, 15 x 28 x 2 and 36 x 40 x 10 bearings, 38-tooth oil pump drive gear); the rest, including plate and spring counts, follows typical 750cc wet-clutch proportions and is not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [1.1, .75, 1.3], up: [0, 1, 0] },
    notModelled: "Ref 18 has two catalogue rows (18-1 superseded by 18-2, the 38-tooth gear); one gear is drawn. The input shaft, primary drive gear, oil pump and clutch push rod are on other pages and aren't drawn. How the basket drives the oil pump gear (pins shown) is not confirmed from the catalogue picture.",
    stages, parts,
  };
})();
