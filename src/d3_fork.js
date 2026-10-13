/* ============ 3D parts model: front fork leg, GS750B 1977 (CMSNL BLCK0030) ============
   Mechanical data only (no rendering code). Units: millimetres. Axes: +Y up the fork leg (leg axis at X = 0, Z = 0),
   +Z forward toward the axle lug, +X to the rider's left.
   Identity and numbering: CMSNL front fork page and its picture (all 26 refs).
   Geometry: APPROXIMATE. Proportions follow a typical damper-rod fork of this size; no dimension here is a factory
   measurement. Check fit, clearances and lengths against the factory service manual.
   Each part:
     id        stable id                    ref     catalogue reference
     geom      geometry spec for the builder (lathe profiles, helices, extrusions, hex prisms)
     mat       material key                 small   counts as small hardware (for the hide-hardware toggle)
     parent    part it rides on once fitted (its installed position is relative to the parent's)
     A         installed position (world, mm) of the part's local origin
     E         exploded position (world, mm) for the parts-catalogue view
     dir       direction of the final installing move (unit vector)
     stage     assembly stage it goes on in (see stages)
     count     how many are shown (for pairs) */
const D3_FORK = {
  id: "DG-CH-01", title: "Front fork leg", units: "mm", page: "BLCK0030",
  accuracy: "Approximate geometry. Part identity, numbering and the order they fit come from the CMSNL front fork page and its picture. Shapes and sizes are modelled to typical damper-rod fork proportions, not measured from a GS750. Use the factory service manual for every dimension.",
  view: { dir: [1.15, .62, 1.25], up: [0, 1, 0] },
  lockView: true, // fixed angle: zoom in/out and move only, no rotating
  notModelled: "Ref 0 (complete damper assembly) and ref 3 (left leg outer tube, a mirror of ref 2) aren't separate parts of this leg, so they aren't drawn.",
  stages: [
    { t: "Rebound spring and ring onto the damper rod", d: "Slide the rebound spring onto the damper rod from the top, under the piston head. The ring sits in the groove on the head." },
    { t: "Damper rod into the inner tube", d: "Drop the damper rod into the inner tube until it comes out of the bottom. Fit the oil lock piece over the end of the rod." },
    { t: "Inner tube into the outer tube", d: "Slide the inner tube, with the damper rod inside, down into the outer tube." },
    { t: "Bottom bolt", d: "Fit the bottom bolt with a new gasket up through the outer tube into the damper rod. Thread locker and torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Seal stack", d: "Fit the two seal spacers, drive in a new oil seal square to the bore, then fit the stopper ring in its groove." },
    { t: "Boot", d: "Fit the boot over the top of the outer tube." },
    { t: "Springs", d: "Fill with fork oil first (grade, amount and level: VERIFY IN FACTORY SERVICE MANUAL). Then the main spring, the washer and the short upper spring." },
    { t: "Cap", d: "Fit a new O-ring to the cap and screw the cap into the top of the inner tube." },
    { t: "Drain screw and studs", d: "Fit the drain screw with a new gasket. Check the axle holder studs are tight in the lug." },
    { t: "Axle holder", d: "With the axle in place, fit the axle holder, washers, lock washers and nuts. Tightening order and torque: VERIFY IN FACTORY SERVICE MANUAL." },
  ],
  parts: [
    { id: "outer", shell: true, ref: "2", name: "Outer tube (right)", mat: "alu", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[4.2, 0], [14, 0], [21, 4], [26, 12], [26, 372], [29, 392], [29, 440], [24.6, 440], [24.6, 410], [18.6, 410], [18.6, 12], [4.2, 12]] },
        { type: "lug", x: [-24, 24], zy: [[14, 8], [14, 40], [22, 50], [46, 50], [54, 40], [54, 8]], notch: { z: 34, y: 8, r: 9.5 } } ] } },
    { id: "oillock", ref: "6", name: "Oil lock piece", mat: "steel", parent: "damper", stage: 2, A: [0, 12, 0], E: [0, 470, 0], dir: [0, 1, 0],
      geom: { type: "lathe", pts: [[7.2, 0], [13, 0], [10, 16], [7.2, 16]] } },
    { id: "spacer11", ref: "11", name: "Oil seal spacer (second)", mat: "steel", small: true, parent: "outer", stage: 5, A: [0, 410, 0], E: [0, 505, 0], dir: [0, -1, 0],
      geom: { type: "ring", ro: 24.4, ri: 18.4, h: 2.5 } },
    { id: "spacer10", ref: "10", name: "Oil seal spacer", mat: "steel", small: true, parent: "outer", stage: 5, A: [0, 412.5, 0], E: [0, 528, 0], dir: [0, -1, 0],
      geom: { type: "ring", ro: 24.4, ri: 18.4, h: 3 } },
    { id: "seal", ref: "8", name: "Oil seal", mat: "rubber", parent: "outer", stage: 5, A: [0, 415.5, 0], E: [0, 556, 0], dir: [0, -1, 0],
      geom: { type: "lathe", pts: [[18.2, 1], [21, 0], [24.4, 0], [24.4, 12], [20, 12], [18.2, 9], [19.5, 6], [18.2, 4]] } },
    { id: "stopper", ref: "9", name: "Oil seal stopper ring", mat: "spring", small: true, parent: "outer", stage: 5, A: [0, 431, 0], E: [0, 596, 0], dir: [0, -1, 0],
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
    { id: "bolt16", ref: "16", name: "Bolt (damper rod)", mat: "black", parent: "outer", stage: 4, A: [0, -1.6, 0], E: [0, -150, 0], dir: [0, 1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[0, -9.5], [6.6, -9.5], [7, -8.6], [7, 0], [3.9, 0], [3.9, 27], [0, 27]] },
        { type: "socket", y: -9.5, af: 6 } ] } },
    { id: "drain", ref: "22", name: "Drain screw", mat: "zinc", small: true, parent: "outer", stage: 9, A: [-28.6, 28, 0], E: [-120, 28, 0], dir: [1, 0, 0],
      geom: { type: "screwX", head: 4.5, headR: 5, len: 9, r: 2.4 } },
    { id: "dgasket", ref: "23", name: "Gasket (drain screw)", mat: "brass", small: true, parent: "drain", stage: 9, A: [-28.6, 28, 0], E: [-86, 28, 0], dir: [1, 0, 0],
      geom: { type: "ringX", ro: 5.2, ri: 2.6, h: 1.2 } },
    { id: "studs", ref: "24", name: "Studs (axle holder)", mat: "steel", small: true, parent: "outer", stage: 9, A: [0, -24, 0], E: [0, -48, 110], dir: [0, 1, 0], count: 2,
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
D3_MODELS["DG-CH-01"] = D3_FORK;
