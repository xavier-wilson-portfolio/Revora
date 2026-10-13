/* ============ 3D parts model: exhaust pipes and mufflers, GS750B 1977 (CMSNL BLCK0048) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: +X = rider's LEFT, +Y up, +Z forward (same as d3_fork.js, so no mirroring).
   Origin: centre line height of the exhaust ports (Y = 0) on the plane of the port faces (Z = 0), midway between
   cylinders 2 and 3. The ports are drawn pointing straight forward; the head itself is not drawn.
   Cylinder centre lines at X = +124, +52, -52, -124 (cylinders 1-4, left to right), the spacing used in d3_en02.js.
   4-into-4 layout: each side has an upper and a lower muffler. The centre pipes (ref 3, cylinders 2 and 3) feed the
   upper mufflers, the outer pipes (ref 2 left, ref 1 right) feed the lower ones. Mufflers rise 7 degrees toward the rear.
   Ref 14 is taken as the right-hand muffler pair and ref 15 as the left-hand pair (they follow the RH / LH connector plates
   12 and 13); covers 22 and 23 are taken as right and left.
   Identity and numbering: CMSNL page BLCK0048 and its picture. Geometry: APPROXIMATE, typical 1970s 750 proportions,
   not measured from a GS750. */
(() => {
const A7 = 7 * Math.PI / 180;
const M = [0, Math.sin(A7), -Math.cos(A7)];          // muffler axis, pointing rearward and up
const U = [0, Math.cos(A7), Math.sin(A7)];           // "up" across the muffler axis
const ROT_M = [-83, 0, 0];                            // turns a Y-axis lathe onto M
const r1 = v => +v.toFixed(2);
const add = (p, q, k = 1) => [r1(p[0] + q[0] * k), r1(p[1] + q[1] * k), r1(p[2] + q[2] * k)];
const PR = 17.5;                                      // header pipe outside radius (approx.)
const CYL = [124, 52, -52, -124];
const PORT_Z = 0;

// ---- generic shapes ----
const hexBolt = (L, r, af, hh) => ({ type: "group", items: [
  { type: "hex", af, h: hh, y: -hh },
  { type: "lathe", pts: [[0, 0], [r, 0], [r, L - 1], [r - .8, L], [0, L]] } ] });
const alongX = (item, sh) => Object.assign({}, item, { rot: [0, 0, sh > 0 ? -90 : 90] });   // local +Y -> sh * X
const washerX = (ro, ri, h, split, sh) => ({ type: "ring", ro, ri, h, split, rot: [0, 0, sh > 0 ? -90 : 90] });

// ---- muffler (one per position) ----
// lathe along local Y from the inlet neck (y = 0) to the tail; lug for the connector plate at y = 280, tab for the cover screw at y = 55
function mufflerGeom(lugX0, lugX1, tabX0, tabX1) {
  return { type: "group", rot: ROT_M, items: [
    { type: "lathe", pts: [[14.5, 0], [PR, 0], [PR, 62], [24, 80], [44, 132], [46, 142], [46, 628], [44, 640], [30, 676], [16, 682], [16, 712], [13.5, 712], [13.5, 684], [0, 684]] },
    { type: "lathe", pts: [[0, 140], [45.6, 140], [45.6, 141], [0, 141]] },
    { type: "ring", ro: 47.5, ri: 45.5, h: 6, at: [0, 150, 0], mat: "chrome" },
    { type: "ring", ro: 47.5, ri: 45.5, h: 6, at: [0, 612, 0], mat: "chrome" },
    { type: "box", size: [Math.abs(lugX1 - lugX0), 34, 30], r: 2, at: [r1((lugX0 + lugX1) / 2), 280, 0], mat: "steel" },
    { type: "box", size: [Math.abs(tabX1 - tabX0), 12, 16], r: 1, at: [r1((tabX0 + tabX1) / 2), 55, 0], mat: "steel" } ] };
}
const connectorGeom = { type: "lathe", rot: ROT_M, pts: [[PR + .1, 0], [20, 0], [20, 70], [PR + .1, 70]] };
// band clamp: band around the connector with two ears on top and the bolt across them
const bandClampGeom = { type: "group", rot: ROT_M, items: [
  { type: "ring", ro: 22.4, ri: 20.1, h: 12 },
  { type: "box", size: [3, 12, 12], r: .6, at: [5, 6, 26] },
  { type: "box", size: [3, 12, 12], r: .6, at: [-5, 6, 26] } ] };

// ---- one side of the bike (sh = +1 left, -1 right) ----
function side(sh) {
  const L = sh > 0, nm = L ? "left" : "right", S = L ? "l" : "r";
  const SU = [150 * sh, -230, -420], SL = [180 * sh, -340, -420];   // where each pipe meets its muffler
  const OFF = [130 * sh, 0, 0];                                        // lower chain exploded outboard of the upper one
  const at = (base, t) => add(base, M, t);
  const muffRef = L ? "15" : "14", plateRef = L ? "13" : "12", coverRef = L ? "23" : "22";
  const PX = 89 * sh, PXo = 95 * sh;                                   // connector plate inner and outer faces
  const plateZ = at(SU, 280)[2], yU = at(SU, 280)[1], yL = at(SL, 280)[1], yM = -135;
  const parts = [];
  // connector plate (base) and its frame bolt
  parts.push({ id: "plate_" + S, ref: plateRef, name: `Connector plate, ${nm}`, mat: "black", stage: 0,
    A: [L ? PX : -95, 0, plateZ], E: [L ? PX : -95, 0, plateZ], dir: [-sh, 0, 0],
    geom: { type: "extrude", rot: [0, 90, 0], depth: 6, bevel: .6,
      pts: [[-25, -330], [25, -330], [25, -180], [18, -124], [0, -116], [-18, -124], [-25, -180]],
      holes: [[0, r1(yU), 4.3], [0, r1(yL), 4.3], [0, yM, 5.4]] } });
  parts.push({ id: "w20_" + S, ref: "20", name: `Washer, plate bolt (${nm})`, mat: "zinc", small: true, parent: "plate_" + S, stage: 1,
    A: [r1(PXo + (L ? .7 : -.7)), yM, plateZ], E: [r1(PXo + 40 * sh), yM, plateZ], dir: [-sh, 0, 0],
    geom: washerX(10, 5.3, 2, false, sh) });
  parts.push({ id: "lw21_" + S, ref: "21", name: `Lock washer, plate bolt (${nm})`, mat: "spring", small: true, parent: "plate_" + S, stage: 1,
    A: [r1(PXo + 2.8 * sh), yM, plateZ], E: [r1(PXo + 60 * sh), yM, plateZ], dir: [-sh, 0, 0],
    geom: washerX(8.6, 5.3, 2.4, true, sh) });
  parts.push({ id: "b19_" + S, ref: "19", name: `Bolt 10 x 30, plate to frame bracket (${nm})`, mat: "zinc", small: true, parent: "plate_" + S, stage: 1,
    A: [r1(PXo + 5.3 * sh), yM, plateZ], E: [r1(PXo + 105 * sh), yM, plateZ], dir: [-sh, 0, 0],
    geom: alongX(hexBolt(30, 5, 14, 7), -sh) });
  // mufflers
  const lugU = L ? [-55, -40] : [40, 55], lugL = L ? [-85, -40] : [40, 85];
  const tabU = L ? [16, 50] : [-50, -16], tabL = L ? [16, 33] : [-33, -16];
  parts.push({ id: "mufU_" + S, ref: muffRef, name: `Muffler, ${nm} upper`, mat: "chrome", shell: true, parent: "plate_" + S, stage: 2,
    A: SU, E: at(SU, 360), dir: [-M[0], -M[1], -M[2]], geom: mufflerGeom(...lugU, ...tabU) });
  parts.push({ id: "mufL_" + S, ref: muffRef, name: `Muffler, ${nm} lower`, mat: "chrome", shell: true, parent: "plate_" + S, stage: 2,
    A: SL, E: add(at(SL, 360), OFF), dir: [-M[0], -M[1], -M[2]], geom: mufflerGeom(...lugL, ...tabL) });
  // muffler-to-plate bolts (one upper, one lower), heads on the inboard side of the plate
  const bpos = [[0, r1(yU), 0], [0, r1(yL), 0]];
  parts.push({ id: "w17_" + S, ref: "17", name: `Washers 8.2 x 20 x 1.6, muffler to plate (${nm})`, mat: "zinc", small: true, parent: "plate_" + S, stage: 3, count: 2,
    A: [r1(PX - 2.3 * sh), 0, plateZ], E: [r1(PX - 22 * sh), 0, plateZ], dir: [sh, 0, 0],
    geom: { type: "array", pos: bpos, item: washerX(10, 4.2, 1.6, false, sh) } });
  parts.push({ id: "lw18_" + S, ref: "18", name: `Lock washers, muffler to plate (${nm})`, mat: "spring", small: true, parent: "plate_" + S, stage: 3, count: 2,
    A: [r1(PX - 4.4 * sh), 0, plateZ], E: [r1(PX - 40 * sh), 0, plateZ], dir: [sh, 0, 0],
    geom: { type: "array", pos: bpos, item: washerX(7.2, 4.2, 2, true, sh) } });
  parts.push({ id: "b16_" + S, ref: "16", name: `Bolts, muffler to plate (${nm})`, mat: "zinc", small: true, parent: "plate_" + S, stage: 3, count: 2,
    A: [r1(PX - 4.4 * sh), 0, plateZ], E: [r1(PX - 75 * sh), 0, plateZ], dir: [sh, 0, 0],
    geom: { type: "array", pos: bpos, item: alongX(hexBolt(26, 4, 12, 5.5), sh) } });
  // connectors, band clamps and clamp bolts, upper (U) and lower (Lo)
  [["U", SU, [0, 0, 0], "upper", "mufU_"], ["Lo", SL, OFF, "lower", "mufL_"]].forEach(([k, base, off, lvl, muf]) => {
    parts.push({ id: `con_${k}_${S}`, ref: "8", name: `Muffler connector, ${nm} ${lvl}`, mat: "steel", parent: muf + S, stage: 4,
      A: at(base, -35), E: add(at(base, 60), off), dir: [-M[0], -M[1], -M[2]], geom: connectorGeom });
    parts.push({ id: `c9_${k}_${S}`, ref: "9", name: `Clamp, pipe end of connector (${nm} ${lvl})`, mat: "zinc", small: true, parent: `con_${k}_${S}`, stage: 4,
      A: at(base, -28), E: add(at(base, -112), off), dir: M, geom: bandClampGeom });
    parts.push({ id: `c10_${k}_${S}`, ref: "10", name: `Clamp, muffler end of connector (${nm} ${lvl})`, mat: "zinc", small: true, parent: `con_${k}_${S}`, stage: 4,
      A: at(base, 16), E: add(at(base, 200), off), dir: [-M[0], -M[1], -M[2]], geom: bandClampGeom });
    [["c9", -28, -112], ["c10", 16, 200]].forEach(([c, tA, tE]) => {
      const ear = add(add([0, 0, 0], M, 6), U, 26);
      parts.push({ id: `b11_${c}_${k}_${S}`, ref: "11", name: `Clamp bolt (${c === "c9" ? "pipe" : "muffler"} end, ${nm} ${lvl})`, mat: "zinc", small: true,
        parent: `${c}_${k}_${S}`, stage: 9,
        A: add(add(at(base, tA), ear), [6.6 * sh, 0, 0]), E: add(add(add(at(base, tE), ear), [46 * sh, 0, 0]), off), dir: [-sh, 0, 0],
        geom: alongX(hexBolt(22, 3, 10, 4), -sh) });
    });
  });
  // heat cover over both connector joints, outboard side
  const prof = [[160, 40], [188, 30], [200, 10], [201, -30], [204, -70], [213, -100], [214, -115], [208, -142]];
  const offs = prof.map((p, i) => { // push each point 1.6 mm outward along the averaged segment normal
    const a = prof[Math.max(0, i - 1)], b = prof[Math.min(prof.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
    return [p[0] - dy / l * 1.6, p[1] + dx / l * 1.6]; });
  const band = [...prof, ...offs.reverse()].map(([x, y]) => [r1(x * sh), r1(y)]);
  if (!L) band.reverse();
  const cO = at(SU, 80);
  parts.push({ id: "cover_" + S, ref: coverRef, name: `Muffler cover, ${nm}`, mat: "chrome", shell: true, parent: "mufU_" + S, stage: 10,
    A: [0, cO[1], cO[2]], E: [220 * sh, cO[1], cO[2]], dir: [-sh, 0, 0],
    geom: { type: "extrude", pts: band, depth: 130, bevel: .3, rot: [7, 0, 0] } });
  const sU = at(SU, 55), sL = at(SL, 55);
  parts.push({ id: "s24_" + S, ref: "24", name: `Screw 5 x 20, cover to upper muffler (${nm})`, mat: "zinc", small: true, parent: "cover_" + S, stage: 10,
    A: [r1(202 * sh), sU[1], sU[2]], E: [r1(470 * sh), sU[1], sU[2]], dir: [-sh, 0, 0],
    geom: alongX({ type: "lathe", pts: [[0, -3.5], [4.4, -3.5], [4.8, -2], [4.8, 0], [2.5, 0], [2.5, 20], [0, 20]] }, -sh) });
  parts.push({ id: "s25_" + S, ref: "25", name: `Screw, cover to lower muffler (${nm})`, mat: "zinc", small: true, parent: "cover_" + S, stage: 10,
    A: [r1(215.7 * sh), sL[1], sL[2]], E: [r1(485 * sh), sL[1], sL[2]], dir: [-sh, 0, 0],
    geom: alongX({ type: "lathe", pts: [[0, -3.5], [4.4, -3.5], [4.8, -2], [4.8, 0], [2.5, 0], [2.5, 16], [0, 16]] }, -sh) });
  // header pipes: centre pipe to the upper muffler, outer pipe to the lower one
  const ctrX = 52 * sh, outX = 124 * sh, X = v => r1(v * sh);
  const pipe = (id, ref, name, x0, pts, off) => parts.push({ id, ref, name, mat: "chrome", stage: 6,
    A: [x0, 0, PORT_Z], E: [r1(x0 + off), -70, PORT_Z + 180], dir: [0, 0, -1],
    geom: { type: "group", items: [
      { type: "tube", r: PR, pts: pts.map(p => [r1(p[0] - x0), p[1], p[2]]) },
      { type: "ring", ro: 21, ri: PR - .2, h: 4, rot: [90, 0, 0], at: [0, 0, 2] } ] } });
  const tail = b => [at(b, -125), at(b, -60), b];
  pipe("pipe_c_" + S, "3", `Exhaust pipe, centre (cylinder ${L ? 2 : 3})`, ctrX,
    [[ctrX, 0, -6], [ctrX, 0, 22], [X(52), -32, 74], [X(55), -125, 96], [X(64), -205, 62], [X(86), -242, -40], [X(126), -252, -190], ...tail(SU)], 0);
  pipe("pipe_o_" + S, L ? "2" : "1", `Exhaust pipe, ${nm} (cylinder ${L ? 1 : 4})`, outX,
    [[outX, 0, -6], [outX, 0, 22], [X(124), -34, 80], [X(127), -148, 112], [X(133), -272, 84], [X(148), -338, 4], [X(168), -358, -165], ...tail(SL)], 130 * sh);
  return parts;
}

const ports = CYL.flatMap(x => [[x, 32, 0], [x, -32, 0]]);
const ellipse = Array.from({ length: 40 }, (_, i) => { const a = i / 40 * Math.PI * 2; return [r1(26 * Math.cos(a)), r1(41 * Math.sin(a))]; });
const portParts = [
  { id: "gaskets", ref: "4", name: "Exhaust pipe gaskets (one per port)", mat: "brass", small: true, stage: 5, count: 4,
    A: [0, 0, -10], E: [0, 0, 60], dir: [0, 0, -1],
    geom: { type: "array", pos: CYL.map(x => [x, 0, 0]), item: { type: "lathe", rot: [90, 0, 0], pts: [[15.5, 0], [23, 0], [23, 4], [15.5, 4]] } } },
  { id: "clamps5", ref: "5", name: "Exhaust pipe clamps (flanges)", mat: "chrome", stage: 7, count: 4,
    A: [0, 0, 6.6], E: [0, 0, 240], dir: [0, 0, -1],
    geom: { type: "array", pos: CYL.map(x => [x, 0, 0]), item: { type: "extrude", pts: ellipse, holes: [[0, 0, 18.4], [0, 32, 4.4], [0, -32, 4.4]], depth: 7, bevel: .6 } } },
  { id: "lw7", ref: "7", name: "Lock washers, pipe clamp bolts", mat: "spring", small: true, parent: "clamps5", stage: 8, count: 8,
    A: [0, 0, 14.3], E: [0, 0, 280], dir: [0, 0, -1],
    geom: { type: "array", pos: ports, item: { type: "ring", ro: 7.2, ri: 4.2, h: 2, split: true, rot: [90, 0, 0] } } },
  { id: "b6", ref: "6", name: "Bolts, pipe clamp to cylinder head", mat: "zinc", small: true, parent: "clamps5", stage: 8, count: 8,
    A: [0, 0, 16.4], E: [0, 0, 330], dir: [0, 0, -1],
    geom: { type: "array", pos: ports, item: Object.assign({}, hexBolt(28, 4, 12, 5.5), { rot: [-90, 0, 0] }) } },
];

const D3_BLCK0048 = {
  id: "CMS-BLCK0048", title: "Exhaust pipes and mufflers", units: "mm", page: "BLCK0048", mirrorX: false,
  accuracy: "Approximate geometry. Part identity, numbering and layout follow the CMSNL picture for this page. Pipe routing, muffler size and every other dimension are typical 1970s 750 proportions, not measured from a GS750; the header spacing follows the cylinder spacing used in the crankshaft model. Use the factory service manual for every dimension.",
  view: { dir: [1, .62, .5], up: [0, 1, 0] },
  notModelled: "All refs are drawn. Refs 14-1/14-2 and 15-1/15-2 are later part numbers for the same mufflers and are drawn once as 14 and 15. Which muffler pair is 14 and which is 15, which cover is 22 and which is 23, and which pipes feed the upper or lower mufflers are reasonable guesses from the picture. The cylinder head and the frame bracket the plates bolt to are not drawn.",
  stages: [
    { t: "Connector plates", d: "Bolt the right and left connector plates to the frame brackets behind the footrests with the 10 mm bolt, lock washer and washer. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Mufflers", d: "Hold each muffler up to its plate so the welded lug sits against the plate. Upper and lower on each side." },
    { t: "Muffler bolts", d: "Fit the bolts from the inside of the plate with a lock washer and washer under each head. Snug them only for now." },
    { t: "Connectors and clamps", d: "Slide a connector onto each muffler inlet with a clamp loose at each end." },
    { t: "Port gaskets", d: "Put a new gasket in each exhaust port. Reusing old ones is a common cause of leaks." },
    { t: "Exhaust pipes", d: "Feed each pipe into its connector and then into its port. The centre pipes go to the upper mufflers, the outer pipes to the lower ones." },
    { t: "Pipe clamps", d: "Slide each clamp up the pipe against the ring on the pipe so it holds the pipe in the port." },
    { t: "Clamp bolts at the ports", d: "Fit the two bolts with lock washers to each clamp and pull them in evenly so the pipe sits square. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Connector clamp bolts", d: "With every pipe seated, tighten the connector clamps and then the muffler bolts at the plates." },
    { t: "Covers", d: "Fit the cover over the connector joints on each side with its two screws." },
  ],
  parts: [...portParts, ...side(1), ...side(-1)],
};
D3_MODELS["CMS-BLCK0048"] = D3_BLCK0048;
})();
