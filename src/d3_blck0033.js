/* ============ 3D parts model: front master cylinder, GS750EC (CMSNL BLCK0033) ============
   Mechanical data only. Units: millimetres. Adapted from the GS750B model (d3_blck0032.js).
   World frame: right handlebar axis along X through the origin (7/8 in bar, radius 11.1), +X outboard toward the bar end,
   which is the rider's RIGHT, so the model sets mirrorX. +Y up, +Z forward. The bore lies parallel to the bar in front of it,
   centred at Y = 0, Z = 28, open at the outboard end.
   This version has a tall ribbed reservoir that plugs into a round socket on top of the body, sealed by a large O-ring
   and held by one screw through a plate on the reservoir floor (as in the CMSNL picture).
   Ref 1 is the complete master cylinder: the body, its clamp holder and the piston set are all drawn under ref 1.
   Geometry: APPROXIMATE. Typical 1970s Tokico handlebar-master proportions, not factory measurements. */
const D3_BLCK0033 = {
  id: "CMS-BLCK0033", title: "Front master cylinder (GS750EC)", units: "mm", page: "BLCK0033", mirrorX: true,
  accuracy: "Approximate geometry. Part identity, numbering and layout follow the CMSNL front master cylinder (GS750EC) page and its picture. Sizes are typical for a 1970s handlebar master cylinder with a screw-held ribbed reservoir, not factory measurements. Use the factory service manual for every dimension.",
  view: { dir: [-1.1, .8, 1.3], up: [0, 1, 0] },
  notModelled: "The two unnumbered rows are earlier complete master cylinders (superseded part numbers), so they aren't drawn twice. Ref 1 is the complete master cylinder; its body, clamp holder and piston set are each drawn and labelled ref 1 because the page sells them only as that assembly. 2-1/2-2, 4-1/4-2 and 9-1/9-2 are part-number variants of one part each. The picture shows one clamp bolt and washer; two are drawn because the holder has two holes. The brake lever, light switch and hose aren't on this page.",
  stages: [
    { t: "Piston and cup set into the bore", d: "Wet the new cups with clean brake fluid. Spring first, then the piston with its cups, then the stop washer and circlip in the mouth of the bore." },
    { t: "O-ring on the reservoir", d: "Roll a new O-ring into the groove at the base of the reservoir." },
    { t: "Reservoir into the socket", d: "Push the reservoir straight down into the round socket on top of the body so the O-ring seals in the socket wall." },
    { t: "Plate and screw", d: "Lay the plate on the reservoir floor and fit the screw through it into the body. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Onto the handlebar", d: "Set the body on the bar and fit the clamp holder behind it. Holder orientation mark: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Clamp bolts and washers", d: "Fit the two bolts with their washers through the holder into the body. Tightening order and torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Fill and fit the diaphragm", d: "Fill with fresh brake fluid and bleed (fluid type and level: VERIFY IN FACTORY SERVICE MANUAL). Seat the diaphragm on the rim of the reservoir." },
    { t: "Plate and cap", d: "Lay the diaphragm plate on top and screw the cap down onto the reservoir." },
  ],
  parts: [
    { id: "body", shell: true, ref: "1", name: "Master cylinder body (part of the complete master cylinder)", mat: "alu", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, -1, 0],
      geom: { type: "group", items: [
        // half clamp on the front of the bar
        { type: "extrude", depth: 18, bevel: .6, rot: [0, 90, 0], at: [-12, 0, 0],
          pts: [[0, -18], [-18, -18], [-18, 18], [0, 18], [0, 11.3],
            ...Array.from({ length: 13 }, (_, i) => { const a = Math.PI / 2 - i * Math.PI / 12; return [-11.3 * Math.cos(a), 11.3 * Math.sin(a)]; }).slice(1, 12),
            [0, -11.3]] },
        // cylinder barrel, counterbore at the mouth for the stop washer and circlip
        { type: "lathe", rot: [0, 0, -90], at: [-14, 0, 28], pts: [[0, 0], [10, 0], [12.5, 2.5], [12.5, 64], [9, 64], [9, 60], [7, 60], [7, 14], [0, 14]] },
        // neck and round reservoir socket (floor at Y = 14, rim at Y = 22)
        { type: "cyl", r: 13, h: 6, at: [20, 6, 28] },
        { type: "lathe", at: [20, 10, 28], pts: [[0, 0], [17, 0], [20.5, 3], [20.5, 12], [18.4, 12], [18.4, 4], [0, 4]] },
        { type: "cyl", r: 3, h: .4, at: [20, 13.9, 28], mat: "black" },
        { type: "cyl", r: 2.2, h: .4, at: [28, 13.9, 28], mat: "black" },
        // lever pivot ears at the outboard end
        { type: "pair", pos: [[0, 10, 0], [0, -10, 0]], item: { type: "box", size: [16, 4, 22], r: 1, at: [48, 0, 41] } },
        { type: "cyl", r: 5, h: 24, at: [50, -12, 47] },
        // hose outlet boss under the inboard end
        { type: "cyl", r: 7, h: 11, at: [-6, -23, 28] },
        { type: "cyl", r: 3, h: .5, at: [-6, -23.3, 28], mat: "black" } ] } },
    { id: "piston", ref: "1", name: "Piston, cups and spring (part of the complete master cylinder)", mat: "steel", parent: "body", stage: 1, A: [0, 0, 28], E: [80, 0, 28], dir: [-1, 0, 0],
      geom: { type: "group", rot: [0, 0, -90], items: [
        { type: "spring", R: 4.6, wire: 1, h: 21, turns: 6, at: [0, 1, 0], mat: "spring" },
        { type: "lathe", pts: [[0, 22], [6.95, 22], [6.95, 26], [4.5, 27], [0, 27]], mat: "rubber" },
        { type: "lathe", pts: [[0, 27], [6.8, 27], [6.8, 31], [5, 31.5], [5, 39.5], [6.8, 40], [6.8, 45], [2.5, 45], [2.5, 43], [0, 43]] },
        { type: "ring", ro: 6.95, ri: 5, h: 6, at: [0, 32.5, 0], mat: "rubber" },
        { type: "ring", ro: 8.8, ri: 3.5, h: 1.4, at: [0, 45.2, 0] },
        { type: "clip", R: 8.4, r: .7, gap: .5, at: [0, 48, 0], mat: "spring" } ] } },
    { id: "oring", ref: "7", name: "O-ring (reservoir base)", mat: "rubber", small: true, parent: "res", stage: 2, A: [20, 17, 28], E: [20, 50, 28], dir: [0, -1, 0],
      geom: { type: "torus", R: 17.3, r: 1.2 } },
    { id: "res", ref: "10", name: "Reservoir", mat: "alu", parent: "body", stage: 3, A: [20, 14, 28], E: [20, 72, 28], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[3, 0], [17.6, 0], [17.6, 1.6], [16.4, 2.2], [16.4, 3.8], [17.6, 4.4], [17.6, 9], [18.6, 10], [18.6, 26.5], [17, 27], [17, 34], [15.4, 34], [15.4, 3], [3, 3]] },
        ...[12.5, 16, 19.5, 23].map(y => ({ type: "torus", R: 18.6, r: .7, at: [0, y, 0] })),
        ...[29, 30.8, 32.6].map(y => ({ type: "torus", R: 17, r: .4, at: [0, y, 0] })),
        { type: "cyl", r: 3.1, h: .3, at: [0, 2.9, 0], mat: "black" } ] } },
    { id: "rplate", ref: "8", name: "Plate (reservoir floor)", mat: "steel", small: true, parent: "res", stage: 4, A: [20, 17, 28], E: [20, 125, 28], dir: [0, -1, 0],
      geom: { type: "extrude", depth: 1.2, bevel: .2, rot: [-90, 0, 0], holes: [[0, 0, 3.2], [8, 0, 2.4]],
        pts: Array.from({ length: 40 }, (_, i) => { const a = i * Math.PI / 20; return [Math.cos(a) * 14.5, Math.sin(a) * 14.5]; }) } },
    { id: "rscrew", ref: "9", name: "Screw (reservoir)", mat: "zinc", small: true, parent: "res", stage: 4, A: [28, 18.4, 28], E: [28, 150, 28], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[0, -12], [2, -12], [2, 0], [4, 0], [4, 1.2], [3.2, 2.8], [0, 2.8]] },
        { type: "box", size: [4.6, .8, 1], r: .2, at: [0, 2.8, 0], mat: "black" },
        { type: "box", size: [1, .8, 4.6], r: .2, at: [0, 2.8, 0], mat: "black" } ] } },
    { id: "holder", ref: "1", name: "Clamp holder (part of the complete master cylinder)", mat: "alu", parent: "body", stage: 5, A: [0, 0, 0], E: [0, 0, -34], dir: [0, 0, 1],
      geom: { type: "extrude", depth: 18, bevel: .6, rot: [0, 90, 0], at: [-12, 0, 0],
        pts: [[0, 18], [0, 11.3],
          ...Array.from({ length: 13 }, (_, i) => { const a = Math.PI / 2 - i * Math.PI / 12; return [11.3 * Math.cos(a), 11.3 * Math.sin(a)]; }).slice(1, 12),
          [0, -11.3], [0, -18], [12, -18], [12, 18]] } },
    { id: "washers", ref: "5", name: "Washers (clamp bolts)", mat: "zinc", small: true, parent: "holder", stage: 6, A: [-3, 0, -13.6], E: [-3, 0, -66], dir: [0, 0, 1], count: 2,
      geom: { type: "pair", pos: [[0, 14.6, 0], [0, -14.6, 0]], item: { type: "ring", ro: 6, ri: 3.2, h: 1.6, rot: [90, 0, 0] } } },
    { id: "bolts", ref: "6", name: "Clamp bolts", mat: "zinc", small: true, parent: "holder", stage: 6, A: [-3, 0, -13.6], E: [-3, 0, -100], dir: [0, 0, 1], count: 2,
      geom: { type: "pair", pos: [[0, 14.6, 0], [0, -14.6, 0]], item: { type: "group", rot: [90, 0, 0], items: [
        { type: "hex", af: 10, h: 4, y: -4.5 },
        { type: "lathe", pts: [[0, 0], [3, 0], [3, 24.4], [2.6, 25], [0, 25]] } ] } } },
    { id: "diaph", ref: "2", name: "Diaphragm", mat: "rubber", parent: "res", stage: 7, A: [20, 48, 28], E: [20, 180, 28], dir: [0, -1, 0],
      geom: { type: "lathe", pts: [[0, -12], [11, -12], [13.6, -9.5], [13.6, 0], [17, 0], [17, 1.5], [12, 1.5], [12, -9], [10, -10.5], [0, -10.5]] } },
    { id: "plate", ref: "3", name: "Diaphragm plate", mat: "steel", small: true, parent: "res", stage: 8, A: [20, 49.6, 28], E: [20, 205, 28], dir: [0, -1, 0],
      geom: { type: "ring", ro: 16.8, ri: 8, h: 1.2 } },
    { id: "cap", ref: "4", name: "Cap", mat: "chrome", parent: "res", stage: 8, A: [20, 42, 28], E: [20, 230, 28], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[17.2, 0], [20, 0], [20, 9.5], [19, 11], [0, 11], [0, 8.9], [17.2, 8.9]] },
        { type: "torus", R: 12, r: .5, at: [0, 11, 0] },
        { type: "array", pos: Array.from({ length: 24 }, (_, i) => { const a = i * Math.PI / 12; return [Math.cos(a) * 20, 0, Math.sin(a) * 20, -i * 15]; }),
          item: { type: "box", size: [1.4, 7, 1.4], r: .3, at: [0, 4.5, 0] } } ] } },
  ],
};
D3_MODELS["CMS-BLCK0033"] = D3_BLCK0033;
