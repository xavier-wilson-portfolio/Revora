/* ============ 3D parts model: front master cylinder, GS750B 1977 (CMSNL BLCK0032) ============
   Mechanical data only. Units: millimetres.
   World frame: right handlebar axis along X through the origin (bar radius 11.1, 7/8 in bar), +X outboard toward the bar end,
   +Y up, +Z forward. The cylinder bore lies parallel to the bar, in front of it, centred at Y = 0, Z = 28, open at the outboard end.
   Identity and numbering: CMSNL front master cylinder (GS750B) page, refs 1 to 9.
   The cylinder body and the clamp holder are not listed on this page (they come only as the complete master cylinder),
   but the listed parts fit into and onto them, so they are drawn as unnumbered context parts (ref "—").
   Geometry: APPROXIMATE. 14 mm bore is the figure owners quote for the single-disc GS750 front master cylinder;
   everything else is typical 1970s Tokico handlebar-master proportions, not factory measurements. */
const D3_BLCK0032 = {
  id: "CMS-BLCK0032", title: "Front master cylinder (GS750B)", units: "mm", page: "BLCK0032",
  accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL front master cylinder (GS750B) page. Shapes and sizes follow a typical 1970s handlebar master cylinder with a round screw-on reservoir cup; only the 14 mm bore is an owner-quoted figure. Use the factory service manual for every dimension.",
  view: { dir: [1.1, .8, 1.3], up: [0, 1, 0] },
  notModelled: "This page doesn't list the master cylinder body, the clamp holder, the brake lever, the brake light switch or the hose union bolt. The body and holder are drawn without a number (ref —) because the listed parts fit into and onto them. The lever, switch and hose aren't drawn.",
  stages: [
    { t: "Piston and cup set into the bore", d: "Wet the new cups with clean brake fluid. Spring first, then the piston with its cups, then the stop washer and circlip in the mouth of the bore." },
    { t: "O-ring in the reservoir port", d: "Fit a new O-ring over the reservoir outlet spigot so it seals in the port on top of the body." },
    { t: "Reservoir onto the body", d: "Push the reservoir spigot straight down into the port without rolling the O-ring." },
    { t: "Reservoir screws", d: "Fit the two screws through the reservoir ears into the body. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Onto the handlebar", d: "Set the body on the bar and fit the clamp holder behind it. Holder orientation mark: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Clamp bolts and washers", d: "Fit the two bolts with their washers through the holder into the body. Tightening order and torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Fill and fit the diaphragm", d: "Fill with fresh brake fluid and bleed (fluid type and level: VERIFY IN FACTORY SERVICE MANUAL). Seat the diaphragm on the rim of the cup." },
    { t: "Plate and cap", d: "Lay the plate on the diaphragm and screw the cap down onto the reservoir." },
  ],
  parts: [
    { id: "body", shell: true, ref: "—", name: "Master cylinder body (not sold separately on this page)", mat: "alu", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, -1, 0],
      geom: { type: "group", items: [
        // half clamp on the front of the bar
        { type: "extrude", depth: 18, bevel: .6, rot: [0, 90, 0], at: [-12, 0, 0],
          pts: [[0, -18], [-18, -18], [-18, 18], [0, 18], [0, 11.3],
            ...Array.from({ length: 13 }, (_, i) => { const a = Math.PI / 2 - i * Math.PI / 12; return [-11.3 * Math.cos(a), 11.3 * Math.sin(a)]; }).slice(1, 12),
            [0, -11.3]] },
        // cylinder barrel, bore 14 mm, counterbore at the mouth for the stop washer and circlip
        { type: "lathe", rot: [0, 0, -90], at: [-14, 0, 28], pts: [[0, 0], [10, 0], [12.5, 2.5], [12.5, 64], [9, 64], [9, 60], [7, 60], [7, 14], [0, 14]] },
        // reservoir seat
        { type: "box", size: [54, 6, 30], r: 1.5, at: [20, 13.5, 28] },
        { type: "cyl", r: 7.6, h: .4, at: [20, 16.4, 28], mat: "black" },
        // lever pivot ears at the outboard end
        { type: "pair", pos: [[0, 10, 0], [0, -10, 0]], item: { type: "box", size: [16, 4, 22], r: 1, at: [48, 0, 41] } },
        { type: "cyl", r: 5, h: 24, at: [50, -12, 47] },
        // hose outlet boss under the inboard end
        { type: "cyl", r: 7, h: 11, at: [-6, -23, 28] },
        { type: "cyl", r: 3, h: .5, at: [-6, -23.3, 28], mat: "black" } ] } },
    { id: "piston", ref: "1", name: "Piston and cup set", mat: "steel", parent: "body", stage: 1, A: [0, 0, 28], E: [80, 0, 28], dir: [-1, 0, 0],
      geom: { type: "group", rot: [0, 0, -90], items: [
        { type: "spring", R: 4.6, wire: 1, h: 21, turns: 6, at: [0, 1, 0], mat: "spring" },
        { type: "lathe", pts: [[0, 22], [6.95, 22], [6.95, 26], [4.5, 27], [0, 27]], mat: "rubber" },
        { type: "lathe", pts: [[0, 27], [6.8, 27], [6.8, 31], [5, 31.5], [5, 39.5], [6.8, 40], [6.8, 45], [2.5, 45], [2.5, 43], [0, 43]] },
        { type: "ring", ro: 6.95, ri: 5, h: 6, at: [0, 32.5, 0], mat: "rubber" },
        { type: "ring", ro: 8.8, ri: 3.5, h: 1.4, at: [0, 45.2, 0] },
        { type: "clip", R: 8.4, r: .7, gap: .5, at: [0, 48, 0], mat: "spring" } ] } },
    { id: "oring", ref: "9", name: "O-ring (reservoir port)", mat: "rubber", small: true, parent: "res", stage: 2, A: [20, 13.5, 28], E: [20, 44, 28], dir: [0, -1, 0],
      geom: { type: "torus", R: 6.4, r: 1.1 } },
    { id: "res", ref: "5", name: "Reservoir cup", mat: "alu", parent: "body", stage: 3, A: [20, 16.5, 28], E: [20, 66, 28], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[3, -6], [5.3, -6], [5.3, 0], [17, 0], [17, 21.5], [16.6, 22], [16.6, 28], [14.5, 28], [14.5, 3], [3, 3]] },
        ...[23.2, 25, 26.8].map(y => ({ type: "torus", R: 16.6, r: .45, at: [0, y, 0] })),
        { type: "extrude", depth: 4, bevel: .5, rot: [90, 0, 0], at: [0, 4, 0], holes: [[-20, 0, 2.6], [20, 0, 2.6]],
          pts: [[-12, -6], [-20, -6], ...Array.from({ length: 7 }, (_, i) => { const a = -Math.PI / 2 - i * Math.PI / 6; return [-20 + 6 * Math.cos(a), 6 * Math.sin(a)]; }).slice(1, 6), [-20, 6], [-12, 6],
            [12, 6], [20, 6], ...Array.from({ length: 7 }, (_, i) => { const a = Math.PI / 2 - i * Math.PI / 6; return [20 + 6 * Math.cos(a), 6 * Math.sin(a)]; }).slice(1, 6), [20, -6], [12, -6]] } ] } },
    { id: "screws", ref: "6", name: "Reservoir screws", mat: "zinc", small: true, parent: "res", stage: 4, A: [20, 20.5, 28], E: [20, 110, 28], dir: [0, -1, 0], count: 2,
      geom: { type: "pair", pos: [[-20, 0, 0], [20, 0, 0]], item: { type: "group", items: [
        { type: "lathe", pts: [[0, -9], [2.4, -9], [2.4, 0], [4.5, 0], [4.5, 1.4], [3.6, 3], [0, 3]] },
        { type: "box", size: [5, .8, 1], r: .2, at: [0, 3, 0], mat: "black" },
        { type: "box", size: [1, .8, 5], r: .2, at: [0, 3, 0], mat: "black" } ] } } },
    { id: "holder", ref: "—", name: "Clamp holder (not listed on this page)", mat: "alu", parent: "body", stage: 5, A: [0, 0, 0], E: [0, 0, -34], dir: [0, 0, 1],
      geom: { type: "extrude", depth: 18, bevel: .6, rot: [0, 90, 0], at: [-12, 0, 0],
        pts: [[0, 18], [0, 11.3],
          ...Array.from({ length: 13 }, (_, i) => { const a = Math.PI / 2 - i * Math.PI / 12; return [11.3 * Math.cos(a), 11.3 * Math.sin(a)]; }).slice(1, 12),
          [0, -11.3], [0, -18], [12, -18], [12, 18]] } },
    { id: "washers", ref: "8", name: "Washers (clamp bolts)", mat: "zinc", small: true, parent: "holder", stage: 6, A: [-3, 0, -13.6], E: [-3, 0, -66], dir: [0, 0, 1], count: 2,
      geom: { type: "pair", pos: [[0, 14.6, 0], [0, -14.6, 0]], item: { type: "ring", ro: 6, ri: 3.2, h: 1.6, rot: [90, 0, 0] } } },
    { id: "bolts", ref: "7", name: "Clamp bolts", mat: "zinc", small: true, parent: "holder", stage: 6, A: [-3, 0, -13.6], E: [-3, 0, -100], dir: [0, 0, 1], count: 2,
      geom: { type: "pair", pos: [[0, 14.6, 0], [0, -14.6, 0]], item: { type: "group", rot: [90, 0, 0], items: [
        { type: "hex", af: 10, h: 4, y: -4.5 },
        { type: "lathe", pts: [[0, 0], [3, 0], [3, 24.4], [2.6, 25], [0, 25]] } ] } } },
    { id: "diaph", ref: "2", name: "Diaphragm", mat: "rubber", parent: "res", stage: 7, A: [20, 44.5, 28], E: [20, 140, 28], dir: [0, -1, 0],
      geom: { type: "lathe", pts: [[0, -10], [11, -10], [12.5, -8], [12.5, 0], [16.4, 0], [16.4, 1.5], [11, 1.5], [11, -7.5], [9.5, -8.5], [0, -8.5]] } },
    { id: "plate", ref: "3", name: "Diaphragm plate", mat: "steel", small: true, parent: "res", stage: 8, A: [20, 46, 28], E: [20, 165, 28], dir: [0, -1, 0],
      geom: { type: "lathe", pts: [[0, 0], [15.8, 0], [15.8, 1.2], [0, 1.2]] } },
    { id: "cap", ref: "4", name: "Reservoir cap", mat: "chrome", parent: "res", stage: 8, A: [20, 38.5, 28], E: [20, 190, 28], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[17.1, 0], [19.5, 0], [19.5, 9.5], [18.5, 11], [0, 11], [0, 8.7], [17.1, 8.7]] },
        { type: "array", pos: Array.from({ length: 24 }, (_, i) => { const a = i * Math.PI / 12; return [Math.cos(a) * 19.5, 0, Math.sin(a) * 19.5, -i * 15]; }),
          item: { type: "box", size: [1.4, 7, 1.4], r: .3, at: [0, 4.5, 0] } } ] } },
  ],
};
D3_MODELS["CMS-BLCK0032"] = D3_BLCK0032;
