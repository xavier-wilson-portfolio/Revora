/* ============ 3D parts model: front fork leg, GS750EC / GS750EN (CMSNL BLCK0031) ============
   Mechanical data only. Units: millimetres. Adapted from d3_fork.js (GS750B fork leg, BLCK0030).
   World frame: +Y up the fork leg (leg axis at X = 0, Z = 0), +Z forward toward the axle lug, +X to the rider's LEFT
   (right-handed, so no mirrorX). The leg drawn is the RIGHT leg (ref 2), so its inboard side faces +X.
   EC/EN difference from the B leg: twin front discs, so the outer tube carries two caliper mounting lugs at the back,
   offset inboard toward the disc; the bolt holes run across the bike (along X). There is also a boss on the inboard side
   higher up (shown in the CMSNL picture; taken to be a mudguard mount).
   Geometry: APPROXIMATE. Layout follows the CMSNL picture; sizes are typical damper-rod fork proportions, not factory
   measurements. Ref numbering on this page differs from BLCK0030 (here 9/10 are the seal spacers, 11 the stopper ring). */
function d3B31Tab(y, uMax, half, hole) { // caliper lug outline in (u = rearward, y), round end at the rear
  const p = [[14, y - half], [uMax, y - half]];
  for (let k = 1; k < 16; k++) { const a = -Math.PI / 2 + Math.PI * k / 16; p.push([uMax + half * Math.cos(a), y + half * Math.sin(a)]); }
  p.push([uMax, y + half], [14, y + half]);
  return { type: "extrude", pts: p, holes: [[uMax, y, hole]], depth: 18, bevel: .8, rot: [0, 90, 0], at: [-2, 0, 0] };
}
const D3_BLCK0031 = {
  id: "CMS-BLCK0031", title: "Front fork leg (GS750EC, EN)", units: "mm", page: "BLCK0031",
  accuracy: "Approximate geometry. Part identity, numbering and fitting order come from the CMSNL front fork (GS750EC, EN) page; the layout follows its picture. Shapes and sizes are typical damper-rod fork proportions, not measured from a GS750, and the caliper lug positions are estimated. VERIFY IN FACTORY SERVICE MANUAL for every dimension.",
  view: { dir: [1.15, .62, 1.25], up: [0, 1, 0] },
  lockView: true,
  notModelled: "Ref 0 (damper assembly, right and left) is the complete leg sold as one unit, not a separate part. Ref 3 (left outer tube) is the mirror of ref 2 on the other side of the bike, so only the right leg is drawn. The brake caliper that bolts to the rear lugs is on its own page.",
  stages: [
    { t: "Rebound spring and ring onto the damper rod", d: "Slide the rebound spring (7) onto the damper rod (4) from the top, under the piston head. The ring (13) sits in the groove on the head." },
    { t: "Damper rod into the inner tube", d: "Drop the damper rod into the inner tube (1) until it comes out of the bottom. Fit the oil lock piece (6) over the end of the rod." },
    { t: "Inner tube into the outer tube", d: "Slide the inner tube, with the damper rod inside, down into the outer tube (2). The caliper lugs go to the back." },
    { t: "Bottom bolt", d: "Fit the bottom bolt (16) with a new gasket (17) up through the outer tube into the damper rod. Thread locker and torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Seal stack", d: "Fit the two seal spacers (10, 9), drive in a new oil seal (8) square to the bore, then fit the stopper ring (11) in its groove." },
    { t: "Boot", d: "Fit the boot (12) over the top of the outer tube." },
    { t: "Springs", d: "Fill with fork oil first. Grade, amount and level: VERIFY IN FACTORY SERVICE MANUAL. Then fit the main spring (26), the washer (25) and the short upper spring (5)." },
    { t: "Cap", d: "Put a new O-ring (15) on the cap (14) and screw the cap into the top of the inner tube." },
    { t: "Drain screw and studs", d: "Fit the drain screw (22) with a new gasket (23). Check the axle holder studs (24) are tight in the lug." },
    { t: "Axle holder", d: "With the axle in place, fit the axle holder (18), washers (19), lock washers (20) and nuts (21). Tightening order and torque: VERIFY IN FACTORY SERVICE MANUAL." },
  ],
  parts: [
    { id: "outer", shell: true, ref: "2", name: "Outer tube, right (twin-disc type)", mat: "alu", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[4.2, 0], [14, 0], [21, 4], [26, 12], [26, 372], [29, 392], [29, 440], [24.6, 440], [24.6, 410], [18.6, 410], [18.6, 12], [4.2, 12]] },
        { type: "lug", x: [-24, 24], zy: [[14, 8], [14, 40], [22, 50], [46, 50], [54, 40], [54, 8]], notch: { z: 34, y: 8, r: 9.5 } },
        d3B31Tab(78, 40, 11, 4.4),
        d3B31Tab(160, 40, 11, 4.4),
        { type: "extrude", pts: [[14, 78], [28, 84], [28, 154], [14, 160]], depth: 8, bevel: .6, rot: [0, 90, 0], at: [3, 0, 0] },
        { type: "cyl", r: 7, h: 14, axis: "x", at: [16, 330, 6] },
        { type: "cyl", r: 2.6, h: .6, axis: "x", at: [30.1, 330, 6], mat: "black" } ] } },
    { id: "oillock", ref: "6", name: "Oil lock piece", mat: "steel", parent: "damper", stage: 2, A: [0, 12, 0], E: [0, 470, 0], dir: [0, 1, 0],
      geom: { type: "lathe", pts: [[7.2, 0], [13, 0], [10, 16], [7.2, 16]] } },
    { id: "spacer10", ref: "10", name: "Seal spacer (lower)", mat: "steel", small: true, parent: "outer", stage: 5, A: [0, 410, 0], E: [0, 505, 0], dir: [0, -1, 0],
      geom: { type: "ring", ro: 24.4, ri: 18.4, h: 2.5 } },
    { id: "spacer9", ref: "9", name: "Seal spacer (upper)", mat: "steel", small: true, parent: "outer", stage: 5, A: [0, 412.5, 0], E: [0, 528, 0], dir: [0, -1, 0],
      geom: { type: "ring", ro: 24.4, ri: 18.4, h: 3 } },
    { id: "seal", ref: "8", name: "Oil seal", mat: "rubber", parent: "outer", stage: 5, A: [0, 415.5, 0], E: [0, 556, 0], dir: [0, -1, 0],
      geom: { type: "lathe", pts: [[18.2, 1], [21, 0], [24.4, 0], [24.4, 12], [20, 12], [18.2, 9], [19.5, 6], [18.2, 4]] } },
    { id: "stopper", ref: "11", name: "Oil seal stopper ring", mat: "spring", small: true, parent: "outer", stage: 5, A: [0, 431, 0], E: [0, 596, 0], dir: [0, -1, 0],
      geom: { type: "clip", R: 23.2, r: 1.2, gap: .35 } },
    { id: "boot", shell: true, ref: "12", name: "Boot", mat: "rubber", parent: "outer", stage: 6, A: [0, 440, 0], E: [0, 640, 0], dir: [0, -1, 0],
      geom: { type: "bellows", rIn: 18.6, r1: 23, r2: 28, h: 80, n: 7 } },
    { id: "damper", ref: "4", name: "Cylinder (damper rod)", mat: "steel", parent: "inner", stage: 2, A: [0, 10, 0], E: [0, 790, 0], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[0, 0], [6.8, 0], [6.8, 18], [9, 20], [9, 320], [15.6, 322], [15.6, 342], [0, 342]] },
        { type: "holes", y: [60, 78, 96, 296], r: 9.05, d: 3.2 } ] } },
    { id: "rebound", ref: "7", name: "Rebound spring", mat: "spring", parent: "damper", stage: 1, A: [0, 262, 0], E: [0, 1162, 0], dir: [0, -1, 0],
      geom: { type: "spring", R: 11.2, wire: 1.7, h: 56, turns: 7 } },
    { id: "ring", ref: "13", name: "Ring (damper rod head)", mat: "dark", small: true, parent: "damper", stage: 1, A: [0, 340, 0], E: [0, 1246, 0], dir: [0, -1, 0],
      geom: { type: "torus", R: 15.2, r: 1.6 } },
    { id: "inner", shell: true, ref: "1", name: "Inner tube", mat: "chrome", stage: 3, A: [0, 70, 0], E: [-170, 300, 0], dir: [0, -1, 0],
      geom: { type: "lathe", pts: [[16.4, 0], [18, 0], [18, 560], [16.4, 560]] } },
    { id: "spring", ref: "26", name: "Fork spring", mat: "spring", parent: "inner", stage: 7, A: [0, 354, 0], E: [-330, 120, 0], dir: [0, -1, 0],
      geom: { type: "spring", R: 13, wire: 2.4, h: 218, turns: 22 } },
    { id: "washer25", ref: "25", name: "Washer (between the springs)", mat: "steel", small: true, parent: "inner", stage: 7, A: [0, 572, 0], E: [-330, 372, 0], dir: [0, -1, 0],
      geom: { type: "ring", ro: 15, ri: 8.5, h: 3 } },
    { id: "uspring", ref: "5", name: "Upper fork spring", mat: "spring", parent: "inner", stage: 7, A: [0, 575, 0], E: [-330, 404, 0], dir: [0, -1, 0],
      geom: { type: "spring", R: 13, wire: 2.4, h: 26, turns: 3.2 } },
    { id: "cap", ref: "14", name: "Inner tube cap", mat: "chrome", parent: "inner", stage: 8, A: [0, 606, 0], E: [-330, 492, 0], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[0, 0], [16, 0], [16.2, 24], [19.2, 24], [19.2, 33], [15, 35], [0, 35]] },
        { type: "hex", af: 17, h: 7, y: 35 } ] } },
    { id: "oring", ref: "15", name: "O-ring (cap)", mat: "rubber", small: true, parent: "cap", stage: 8, A: [0, 626, 0], E: [-330, 460, 0], dir: [0, -1, 0],
      geom: { type: "torus", R: 15.6, r: 1.5 } },
    { id: "gasket17", ref: "17", name: "Gasket (bottom bolt)", mat: "brass", small: true, parent: "outer", stage: 4, A: [0, -1.6, 0], E: [0, -62, 0], dir: [0, 1, 0],
      geom: { type: "ring", ro: 8.5, ri: 4.2, h: 1.6 } },
    { id: "bolt16", ref: "16", name: "Bolt (damper rod, 8x27)", mat: "black", parent: "outer", stage: 4, A: [0, -1.6, 0], E: [0, -150, 0], dir: [0, 1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[0, -9.5], [6.6, -9.5], [7, -8.6], [7, 0], [3.9, 0], [3.9, 27], [0, 27]] },
        { type: "socket", y: -9.5, af: 6 } ] } },
    { id: "drain", ref: "22", name: "Drain screw", mat: "zinc", small: true, parent: "outer", stage: 9, A: [-28.6, 28, 0], E: [-120, 28, 0], dir: [1, 0, 0],
      geom: { type: "screwX", head: 4.5, headR: 5, len: 9, r: 2.4 } },
    { id: "dgasket", ref: "23", name: "Gasket (drain screw)", mat: "brass", small: true, parent: "drain", stage: 9, A: [-28.6, 28, 0], E: [-86, 28, 0], dir: [1, 0, 0],
      geom: { type: "ringX", ro: 5.2, ri: 2.6, h: 1.2 } },
    { id: "studs", ref: "24", name: "Studs 8x25 (axle holder)", mat: "steel", small: true, parent: "outer", stage: 9, A: [0, -24, 0], E: [0, -48, 110], dir: [0, 1, 0], count: 2,
      geom: { type: "pair", at: [[0, 0, 20], [0, 0, 48]], item: { type: "lathe", pts: [[0, 0], [3.9, 0], [3.9, 44], [0, 44]] } } },
    { id: "holder", ref: "18", name: "Axle holder", mat: "alu", parent: "outer", stage: 10, A: [0, 0, 0], E: [0, -96, 110], dir: [0, 1, 0],
      geom: { type: "lug", x: [-17, 17], zy: [[14, -6], [14, 8], [54, 8], [54, -6]], notch: { z: 34, y: 8, r: 9.5, up: true }, holes: [20, 48] } },
    { id: "washers", ref: "19", name: "Washers (axle holder)", mat: "zinc", small: true, parent: "holder", stage: 10, A: [0, -8, 0], E: [0, -130, 110], dir: [0, 1, 0], count: 2,
      geom: { type: "pair", at: [[0, 0, 20], [0, 0, 48]], item: { type: "ring", ro: 8, ri: 4.2, h: 1.6 } } },
    { id: "lockw", ref: "20", name: "Lock washers (axle holder)", mat: "spring", small: true, parent: "holder", stage: 10, A: [0, -10.2, 0], E: [0, -154, 110], dir: [0, 1, 0], count: 2,
      geom: { type: "pair", at: [[0, 0, 20], [0, 0, 48]], item: { type: "ring", ro: 7, ri: 4.2, h: 2, split: true } } },
    { id: "nuts", ref: "21", name: "Nuts (axle holder)", mat: "zinc", small: true, parent: "holder", stage: 10, A: [0, -18.4, 0], E: [0, -186, 110], dir: [0, 1, 0], count: 2,
      geom: { type: "pair", at: [[0, 0, 20], [0, 0, 48]], item: { type: "hex", af: 12, h: 8, y: 0, hole: 3.9 } } },
  ],
};
D3_MODELS["CMS-BLCK0031"] = D3_BLCK0031;
