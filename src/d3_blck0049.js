/* ============ 3D parts model: oil pan and oil filter, GS750B 1977 (CMSNL BLCK0049) ============
   Mechanical data only. Units: millimetres.
   World frame: X right (+X = right side of the bike), Y up, Z forward. Y = 0 is the underside of the crankcase,
   where the oil pan gasket sits; X = 0, Z = 0 is roughly the middle of the pan. The crankcase itself is not drawn.
   Layout follows the CMSNL picture: 13 pan bolts (7 x ref 3 round the front and sides, 6 x ref 4 at the front-left
   bulge and the rear), drain plug in a boss on the finned bottom, and a cartridge filter chamber at the front-left
   of the pan with its axis running fore and aft. The ribbed cap closes the chamber on three studs with washers and nuts.
   Identity and numbering: CMSNL oil pan page, refs 1 to 15.
   Geometry: APPROXIMATE. The plug and gasket sizes in the names come from the catalogue descriptions (14 x 19.2 x 2,
   10 x 14 x 3.6, stud 6 x 20); bolt lengths are read from the Suzuki part numbers (01517-06308 = 6 x 30,
   01517-06258 = 6 x 25). Pan outline, depth, filter and cap sizes are scaled by eye from the picture, not measured. */
const D3_BLCK0049 = (() => {
  const r1 = v => +v.toFixed(2), rad = a => a * Math.PI / 180;
  // pan outline in plan, as [x, z], counter-clockwise seen from above (front-left bulge holds the filter chamber)
  const O = [[-160, -110], [-28, -110], [-18, -90], [157, -90], [157, 108], [-30, 108], [-46, 150], [-160, 150]];
  // offset a polygon inward by d (mitred corners)
  const offs = (P, d) => P.map((p, i) => {
    const a = P[(i + P.length - 1) % P.length], b = P[(i + 1) % P.length];
    const e1 = [p[0] - a[0], p[1] - a[1]], e2 = [b[0] - p[0], b[1] - p[1]];
    const l1 = Math.hypot(...e1), l2 = Math.hypot(...e2);
    const n1 = [-e1[1] / l1, e1[0] / l1], n2 = [-e2[1] / l2, e2[0] / l2];
    const m = [n1[0] + n2[0], n1[1] + n2[1]], k = d / (1 + n1[0] * n2[0] + n1[1] * n2[1]);
    return [r1(p[0] + m[0] * k), r1(p[1] + m[1] * k)];
  });
  // a flat frame (outline with the middle cut out) joined by a hairline slit, so one extrude can carry it
  const frameSlit = (outer, inner) => {
    const inn = [inner[0], ...inner.slice(1).reverse()];
    return [...outer, [outer[0][0] + .01, outer[0][1]], [inn[0][0] + .01, inn[0][1]], ...inn.slice(1), inn[0]];
  };
  // plan slab: outline [x, z] laid flat, top face at y = top, thickness t downward
  const slab = (pts, t, top, holes, mat) => ({ type: "extrude", pts, holes: holes || [], depth: t, bevel: 0, rot: [90, 0, 0], at: [0, top, 0], ...(mat ? { mat } : {}) });

  const B3 = [[-15, 100], [60, 100], [130, 100], [-152, 70], [-152, -15], [149, 30], [149, -45]];       // 6 x 30
  const B4 = [[-140, 142], [-66, 142], [-140, -102], [-70, -102], [5, -82], [80, -82]];                // 6 x 25
  const BH = [...B3, ...B4].map(([x, z]) => [x, z, 3.3]);
  const FL_TOP = -1, FL_T = 8, FL_BOT = FL_TOP - FL_T, FLOOR = -75;

  // filter chamber: axis along Z at (CX, CY), front face at FZ; cap studs on radius SR
  const CX = -97, CY = -66, FZ = 156, SR = 49, SA = [30, 150, 270];
  const SP = SA.map(a => [r1(CX + SR * Math.cos(rad(a))), r1(CY + SR * Math.sin(rad(a)))]);
  const circle = (r, n = 48, cx = 0, cy = 0) => Array.from({ length: n }, (_, i) => [r1(cx + r * Math.cos(i / n * Math.PI * 2)), r1(cy + r * Math.sin(i / n * Math.PI * 2))]);
  const DX = -27, DZ = 24;                                                                              // drain plug position
  const PA = rad(-60), PX = r1(CX + 28 * Math.cos(PA)), PY = r1(CY + 28 * Math.sin(PA));               // cap plug position

  // ---- oil pan (ref 1) ----
  const fins = [];
  for (let z = -64; z <= 84; z += 12) {
    const xs = Math.abs(z - DZ) < 16 ? [[-130, DX - 17], [DX + 17, 140]] : [[-130, 140]];
    xs.forEach(([x0, x1]) => fins.push({ type: "box", size: [x1 - x0, 4, 3], r: .8, at: [(x0 + x1) / 2, FLOOR - 2, z] }));
  }
  const pan = { type: "group", items: [
    slab(frameSlit(O, offs(O, 16)), FL_T, FL_TOP, BH),                                    // gasket flange with the 13 bolt holes
    slab(frameSlit(offs(O, 9), offs(O, 14)), FL_BOT - FLOOR + 3, FL_BOT, []),             // side walls
    slab(offs(O, 9), 5, FLOOR + 5, []),                                                   // floor
    { type: "group", items: fins },                                                       // cooling fins under the floor
    { type: "lathe", pts: [[0, FLOOR - 5], [13, FLOOR - 5], [14.5, FLOOR - 1], [14.5, FLOOR + 6], [0, FLOOR + 6]], at: [DX, 0, DZ] },  // drain boss
    { type: "cyl", r: 7, h: .6, at: [DX, FLOOR - 5.3, DZ], mat: "black" },                // drain hole
    // filter chamber: barrel back into the pan, closed at the back, with a centre spigot for the element
    { type: "lathe", rot: [90, 0, 0], at: [CX, CY, 60], pts: [[0, 0], [44, 0], [44, FZ - 8 - 60], [39.5, FZ - 8 - 60], [39.5, 6], [12.5, 6], [12.5, 20], [0, 20]] },
    // chamber front flange with the three tapped stud holes
    { type: "extrude", pts: circle(56, 64, CX, CY), holes: [[CX, CY, 39.5], ...SP.map(([x, y]) => [x, y, 2.6])], depth: 8, bevel: .5, at: [0, 0, FZ - 8] },
  ] };

  // ---- gasket (ref 2) ----
  const gasket = slab(frameSlit(O, offs(O, 15)), 1, 0, BH, "brass");

  // ---- pan bolts (refs 3 and 4): hex head under the flange, shank up into the crankcase ----
  const bolt = L => ({ type: "group", items: [
    { type: "hex", af: 10, h: 4, y: -4.4 },
    { type: "lathe", pts: [[3, -.6], [6.6, -.6], [6.6, 0], [3, 0]] },
    { type: "lathe", pts: [[0, 0], [3, 0], [3, L - .6], [2.4, L], [0, L]] } ] });
  const bolts = (P, L) => ({ type: "array", pos: P.map(([x, z]) => [x, FL_BOT, z]), item: bolt(L) });

  // ---- drain plug (ref 5) and its gasket (ref 6) ----
  const drainGasket = { type: "ring", ro: 9.6, ri: 7, h: 2, at: [DX, FLOOR - 7, DZ] };
  const drainPlug = { type: "group", at: [DX, FLOOR - 7, DZ], items: [
    { type: "lathe", pts: [[0, 0], [7, 0], [7, 13], [6.2, 14], [0, 14]] },
    { type: "lathe", pts: [[0, -1.5], [11, -1.5], [11, 0], [0, 0]] },
    { type: "hex", af: 17, h: 8, y: -9.5 } ] };

  // ---- filter element (ref 7), pleated paper between steel end plates ----
  const filter = { type: "group", rot: [90, 0, 0], at: [CX, CY, 72], items: [
    { type: "ring", ro: 37.5, ri: 13, h: 2.5, mat: "steel" },
    { type: "gear", r: 37, teeth: 64, toothH: 3, h: 55, bore: 20, at: [0, 2.5, 0], mat: "dark" },
    { type: "ring", ro: 37.5, ri: 13, h: 2.5, at: [0, 57.5, 0], mat: "steel" } ] };

  // ---- spring (ref 8) between the element and the cap ----
  const spring = { type: "spring", R: 20, wire: 2.4, h: 32, turns: 4.5, rot: [90, 0, 0], at: [CX, CY, 132] };

  // ---- cap (ref 9): round flange on the studs, domed face with radial ribs, boss for plug 11 ----
  const rib = { type: "extrude", pts: [[16, 0], [52, 0], [52, 4], [50, 7.6], [40, 13.6], [16, 16.6]], depth: 3, bevel: 0, at: [0, 0, -1.5] };
  const cap = { type: "group", items: [
    { type: "extrude", pts: circle(56, 64, CX, CY), holes: [[CX, CY, 30], ...SP.map(([x, y]) => [x, y, 3.4])], depth: 6, bevel: .5, at: [0, 0, FZ + 2] },
    { type: "group", rot: [90, 0, 0], at: [CX, CY, FZ + 8], items: [
      { type: "lathe", pts: [[0, 0], [52, 0], [50, 6], [40, 12], [16, 15], [0, 15]] },
      { type: "array", pos: [0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map(a => [0, 0, 0, a + 18]), item: rib } ] },
    { type: "cyl", r: 8, h: 17, axis: "z", at: [PX, PY, FZ + 8] },
    { type: "cyl", r: 5, h: .6, axis: "z", at: [PX, PY, FZ + 25], mat: "black" } ] };
  const oring = { type: "torus", R: 42, r: 1.6, rot: [90, 0, 0], at: [CX, CY, FZ + 1] };

  // ---- cap plug (ref 11) and gasket (ref 12) ----
  const capGasket = { type: "ring", ro: 7, ri: 5, h: 3.6, rot: [90, 0, 0], at: [PX, PY, FZ + 25] };
  const capPlug = { type: "group", rot: [90, 0, 0], at: [PX, PY, FZ + 28.6], items: [
    { type: "lathe", pts: [[0, -10], [4.6, -10], [5, -9.4], [5, 0], [0, 0]] },
    { type: "lathe", pts: [[0, 0], [7.5, 0], [7.5, 1.2], [0, 1.2]] },
    { type: "hex", af: 12, h: 5.5, y: 1.2 } ] };

  // ---- studs (13), washers (15), nuts (14) ----
  const studs = { type: "array", pos: SP.map(([x, y]) => [x, y, FZ - 8]), item: { type: "group", items: [
    { type: "cyl", r: 3, h: 19.4, axis: "z" },
    { type: "cyl", r: 3, r2: 2.4, h: .6, axis: "z", at: [0, 0, 19.4] } ] } };
  const washers = { type: "array", pos: SP.map(([x, y]) => [x, y, FZ + 8]), item: { type: "ring", ro: 6.5, ri: 3.2, h: 1.2, rot: [90, 0, 0] } };
  const nuts = { type: "array", pos: SP.map(([x, y]) => [x, y, FZ + 9.2]), item: { type: "hex", af: 10, h: 5, hole: 3, rot: [90, 0, 0] } };

  const Z = [0, 0, 0];
  return {
    id: "CMS-BLCK0049", title: "Oil pan and oil filter", units: "mm", page: "BLCK0049",
    accuracy: "Approximate geometry. Part identity, numbering and layout follow the CMSNL oil pan picture (bolt positions and counts, drain plug in the finned bottom, filter chamber at the front-left with a ribbed cap on three studs). Only the gasket and stud sizes in the names are catalogue figures and the bolt lengths are read from the part numbers; the pan outline, depth, filter and cap sizes are scaled by eye from the picture, not measured from a GS750. Where plug 11 goes is a best reading of the picture. Use the factory service manual for every dimension.",
    view: { dir: [1.1, 1.0, 1.2], up: [0, 1, 0] },
    notModelled: "Refs 1-1 and 1-2, 2-1 and 2-2, and 9-1 and 9-2 are early and late versions of the same pan, gasket and cap, so one of each is drawn under refs 1, 2 and 9. The crankcase the pan bolts up to is on another page and isn't drawn.",
    stages: [
      { t: "Filter cap studs", d: "Screw the three studs into the front face of the filter chamber, short end in. Run them in with two nuts locked together." },
      { t: "Oil pan gasket", d: "Clean both faces and lay a new gasket on the pan flange with the bolt holes lined up." },
      { t: "Oil pan to crankcase", d: "Lift the pan up to the crankcase and fit the bolts: the 6 x 30 ones round the front and sides, the 6 x 25 ones at the front-left corner and along the back. Tighten across the pan in steps. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Drain plug", d: "Fit the drain plug with a new gasket. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Oil filter", d: "Push a new filter element into the chamber until it sits over the centre spigot at the back." },
      { t: "Spring", d: "Put the spring against the front of the element. It holds the element on its seat once the cap is on." },
      { t: "Plug in the cap", d: "Screw the small plug into the cap with its gasket." },
      { t: "O-ring and cap", d: "Fit a new O-ring, oiled, then slide the cap over the studs and press it home against the spring." },
      { t: "Washers and nuts", d: "Put a washer and nut on each stud and pull the cap down evenly. Torque: VERIFY IN FACTORY SERVICE MANUAL. Fill with oil; grade and amount: VERIFY IN FACTORY SERVICE MANUAL." },
    ],
    parts: [
      { id: "pan", shell: true, ref: "1", name: "Oil pan", mat: "alu", stage: 0, A: Z, E: Z, dir: [0, 1, 0], geom: pan },
      { id: "studs", ref: "13", name: "Studs 6 x 20 (filter cap)", mat: "steel", small: true, parent: "pan", stage: 1, A: Z, E: [0, 110, 150], dir: [0, 0, -1], count: 3, geom: studs },
      { id: "gasket", ref: "2", name: "Oil pan gasket", mat: "brass", small: true, parent: "pan", stage: 2, A: Z, E: [0, 60, 0], dir: [0, -1, 0], geom: gasket },
      { id: "bolts4", ref: "4", name: "Bolts 6 x 25 (oil pan)", mat: "zinc", small: true, parent: "pan", stage: 3, A: Z, E: [0, -150, 0], dir: [0, 1, 0], count: 6, geom: bolts(B4, 25) },
      { id: "bolts3", ref: "3", name: "Bolts 6 x 30 (oil pan)", mat: "zinc", small: true, parent: "pan", stage: 3, A: Z, E: [0, -205, 0], dir: [0, 1, 0], count: 7, geom: bolts(B3, 30) },
      { id: "dgasket", ref: "6", name: "Drain plug gasket (14 x 19.2 x 2)", mat: "brass", small: true, parent: "pan", stage: 4, A: Z, E: [0, -210, 0], dir: [0, 1, 0], geom: drainGasket },
      { id: "dplug", ref: "5", name: "Drain plug", mat: "zinc", small: true, parent: "pan", stage: 4, A: Z, E: [0, -250, 0], dir: [0, 1, 0], geom: drainPlug },
      { id: "filter", ref: "7", name: "Oil filter element", mat: "steel", parent: "pan", stage: 5, A: Z, E: [0, 0, 128], dir: [0, 0, -1], geom: filter },
      { id: "spring", ref: "8", name: "Spring (oil filter)", mat: "spring", parent: "pan", stage: 6, A: Z, E: [0, 0, 160], dir: [0, 0, -1], geom: spring },
      { id: "capgasket", ref: "12", name: "Gasket (10 x 14 x 3.6, cap plug)", mat: "brass", small: true, parent: "cap", stage: 7, A: Z, E: [0, 0, 260], dir: [0, 0, -1], geom: capGasket },
      { id: "capplug", ref: "11", name: "Plug (filter cap)", mat: "zinc", small: true, parent: "cap", stage: 7, A: Z, E: [0, 0, 298], dir: [0, 0, -1], geom: capPlug },
      { id: "oring", ref: "10", name: "O-ring (filter chamber cap)", mat: "rubber", small: true, parent: "cap", stage: 8, A: Z, E: [0, 0, 196], dir: [0, 0, -1], geom: oring },
      { id: "cap", ref: "9", name: "Oil filter cap", mat: "alu", parent: "pan", stage: 8, A: Z, E: [0, 0, 222], dir: [0, 0, -1], geom: cap },
      { id: "washers", ref: "15", name: "Washers (filter cap)", mat: "steel", small: true, parent: "cap", stage: 9, A: Z, E: [0, 0, 345], dir: [0, 0, -1], count: 3, geom: washers },
      { id: "nuts", ref: "14", name: "Nuts (filter cap)", mat: "zinc", small: true, parent: "cap", stage: 9, A: Z, E: [0, 0, 372], dir: [0, 0, -1], count: 3, geom: nuts },
    ],
  };
})();
D3_MODELS["CMS-BLCK0049"] = D3_BLCK0049;
