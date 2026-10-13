/* ============ 3D parts model: rear master cylinder, GS750C/EC/N/EN (CMSNL BLCK0056) ============
   Mechanical data only. Units: millimetres. Push rod end and piston set copied from the GS750B model (d3_blck0055.js).
   World frame: +X = rider's LEFT (inboard, toward the frame, for this right-side part), +Y up, +Z forward.
   The bore axis is vertical at X = 0, Z = 0, open at the bottom (mouth at Y = 0); the push rod comes up out of the
   brake pedal clevis into it. On this version the reservoir is a separate tank held in a clamp band above and inboard
   of the cylinder, fed down a short hose to a spigot on the side of the body, as in the CMSNL picture.
   The two mounting bolts go in from the outboard side (-X) through ears on the back of the body, and the clamp band bolt
   goes in the same way; the frame brackets they thread into aren't drawn.
   Geometry: APPROXIMATE. Typical 1970s Tokico rear master cylinder proportions, not factory measurements. */
const D3_BLCK0056 = {
  id: "CMS-BLCK0056", title: "Rear master cylinder (GS750C/EC/N/EN)", units: "mm", page: "BLCK0056",
  accuracy: "Approximate geometry. Part identity, numbering and layout follow the CMSNL rear master cylinder (GS750C, EC, N, EN) page and its picture. Sizes are typical for a 1970s rear master cylinder with a remote reservoir, not factory measurements. Use the factory service manual for every dimension.",
  view: { dir: [-1.2, .55, 1.1], up: [0, 1, 0] },
  notModelled: "Ref 1 is the complete master cylinder; the body is drawn under ref 1 because the page doesn't sell it on its own. 11-1/11-2 and 12-1/12-2 are part-number variants of one part each. The frame brackets, brake pedal, caliper hose and union bolt aren't on this page.",
  stages: [
    { t: "Piston and cup set into the bore", d: "Wet the new cups with clean brake fluid. Spring first, then the piston with its cups, pushed up into the bore from the bottom." },
    { t: "Push rod and circlip", d: "Put the ball end of the push rod against the piston, then press the stop washer in and fit the circlip in its groove in the mouth of the bore." },
    { t: "Boot", d: "Work the boot over the rod and onto the lip at the bottom of the body." },
    { t: "Locknut and yoke", d: "Run the locknut up the rod, then screw the yoke on. Pedal height is set with the yoke later: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Mount the cylinder", d: "Fit the two bolts, each with a lock washer and washer, through the ears into the frame bracket. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Clamp band", d: "Bolt the clamp band to its bracket with the lock washer under the bolt head." },
    { t: "Reservoir tank", d: "Push the tank down into the clamp band so its outlet spigot points straight down." },
    { t: "Hose and clamps", d: "Push the hose onto the tank spigot and the spigot on the body, then slide a clamp over each end." },
    { t: "Fill and fit the diaphragm", d: "Fill with fresh brake fluid and bleed (fluid type and level: VERIFY IN FACTORY SERVICE MANUAL). Seat the diaphragm on the rim of the tank." },
    { t: "Plate and cap", d: "Lay the diaphragm plate on top and screw the cap down onto the tank." },
  ],
  parts: [
    { id: "body", shell: true, ref: "1", name: "Master cylinder body (part of the complete master cylinder)", mat: "alu", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, 1, 0],
      geom: { type: "group", items: [
        // barrel: bore 14 mm drawn, counterbore with circlip groove at the mouth, boot lip at the bottom
        { type: "lathe", pts: [[7, 52], [7, 7], [9.6, 7], [9.6, 0], [14, 0], [14, 3.5], [12.2, 4.5], [12.2, 7], [13, 8], [13, 58], [11, 60], [0, 60], [0, 52]] },
        // outlet boss on top for the caliper hose union
        { type: "lathe", at: [0, 59, 0], pts: [[0, 0], [9, 0], [9, 9], [8, 10], [3, 10], [3, 9.6], [0, 9.6]] },
        // inlet spigot on the inboard side, fed from the tank
        { type: "cyl", r: 7, h: 6, axis: "x", at: [10, 50, 0] },
        { type: "lathe", rot: [0, 0, -90], at: [15, 50, 0], pts: [[1.8, 0], [4, 0], [4, 8], [4.6, 9], [4.6, 10], [3.6, 11], [1.8, 11]] },
        // two mounting ears on the back (bolts along X)
        ...[16, 44].flatMap(y => [
          { type: "box", size: [12, 18, 20], r: 1.5, at: [0, y, -18] },
          { type: "cyl", r: 9, h: 12, axis: "x", at: [-6, y, -26] },
          { type: "cyl", r: 4.3, h: 12.4, axis: "x", at: [-6.2, y, -26], mat: "black" }]) ] } },
    { id: "piston", ref: "2", name: "Piston and cup set", mat: "steel", parent: "body", stage: 1, A: [0, 0, 0], E: [0, -75, 0], dir: [0, 1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[4.2, 8], [6.8, 8], [6.8, 12], [5, 12.5], [5, 20.5], [6.8, 21], [6.8, 26], [3, 26], [3, 13], [4.2, 13]] },
        { type: "ring", ro: 6.95, ri: 5, h: 6, at: [0, 13.5, 0], mat: "rubber" },
        { type: "lathe", pts: [[0, 26], [6.95, 26], [6.95, 30], [4.5, 31], [0, 31]], mat: "rubber" },
        { type: "spring", R: 4.6, wire: 1, h: 20, turns: 6, at: [0, 31, 0], mat: "spring" } ] } },
    { id: "rod", ref: "4", name: "Push rod", mat: "steel", parent: "body", stage: 2, A: [0, 0, 0], E: [0, -165, 0], dir: [0, 1, 0],
      geom: { type: "group", items: [
        { type: "sphere", r: 4, at: [0, 10, 0] },
        { type: "cyl", r: 3.5, h: 6, at: [0, 4, 0] },
        { type: "ring", ro: 9.2, ri: 3.5, h: 1.6, at: [0, 3.2, 0] },
        { type: "cyl", r: 4, h: 56, at: [0, -52, 0] },
        ...Array.from({ length: 12 }, (_, i) => ({ type: "torus", R: 4, r: .35, at: [0, -50 + i * 2, 0] })) ] } },
    { id: "circlip", ref: "7", name: "Circlip", mat: "spring", small: true, parent: "body", stage: 2, A: [0, 5.6, 0], E: [0, -90, 0], dir: [0, 1, 0],
      geom: { type: "clip", R: 9.2, r: .7, gap: .5 } },
    { id: "boot", ref: "6", name: "Boot", mat: "rubber", parent: "body", stage: 3, A: [0, 0, 0], E: [0, -105, 0], dir: [0, 1, 0],
      geom: { type: "lathe", pts: [[12.2, 4.5], [15.2, 4.5], [15.2, -3], [12, -7], [13.5, -11], [9, -15], [10.5, -19], [6.5, -23], [5.4, -27], [4.1, -27], [4.1, -25], [5.2, -22.5], [9, -19], [7.5, -15], [12, -11], [10.5, -7], [13.6, -3], [13.6, 0], [14.2, 0], [14.2, 3.5], [12.2, 3.5]] } },
    { id: "nut", ref: "5", name: "Locknut", mat: "zinc", small: true, parent: "rod", stage: 4, A: [0, -47, 0], E: [0, -240, 0], dir: [0, 1, 0],
      geom: { type: "hex", af: 12, h: 5, hole: 4 } },
    { id: "yoke", ref: "3", name: "Yoke (clevis)", mat: "steel", parent: "rod", stage: 4, A: [0, -43, 0], E: [0, -255, 0], dir: [0, 1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[0, -18], [8, -18], [8, -15], [6.5, -14], [6.5, -4], [0, -4]] },
        { type: "pair", pos: [[4, 0, 0], [-4, 0, 0]], item: { type: "box", size: [3.5, 16, 14], r: 1, at: [0, -26, 0] } },
        { type: "cyl", r: 3.3, h: 15, axis: "x", at: [-7.5, -28, 0], mat: "black" } ] } },
    { id: "mwashers", ref: "9", name: "Washers (mounting bolts)", mat: "zinc", small: true, parent: "body", stage: 5, A: [-6, 0, -26], E: [-40, 0, -26], dir: [1, 0, 0], count: 2,
      geom: { type: "pair", pos: [[0, 16, 0], [0, 44, 0]], item: { type: "ringX", ro: 8, ri: 4.2, h: 1.6, rot: [0, 180, 0] } } },
    { id: "mlockw", ref: "10", name: "Lock washers (mounting bolts)", mat: "zinc", small: true, parent: "body", stage: 5, A: [-7.6, 0, -26], E: [-55, 0, -26], dir: [1, 0, 0], count: 2,
      geom: { type: "pair", pos: [[0, 16, 0], [0, 44, 0]], item: { type: "ring", ro: 7, ri: 4.2, h: 2, split: true, rot: [0, 0, -90], at: [-2, 0, 0] } } },
    { id: "mbolts", ref: "8", name: "Bolts 8 x 30 (mounting)", mat: "zinc", small: true, parent: "body", stage: 5, A: [-9.6, 0, -26], E: [-90, 0, -26], dir: [1, 0, 0], count: 2,
      geom: { type: "pair", pos: [[0, 16, 0], [0, 44, 0]], item: { type: "group", rot: [0, 0, -90], items: [
        { type: "hex", af: 12, h: 5.5, y: -5.5 },
        { type: "lathe", pts: [[0, 0], [4, 0], [4, 29.4], [3.5, 30], [0, 30]] } ] } } },
    { id: "band", ref: "15", name: "Clamp band (reservoir tank)", mat: "steel", parent: "body", stage: 6, A: [40, 116, 0], E: [40, 116, -60], dir: [0, 0, 1],
      geom: { type: "group", items: [
        { type: "ring", ro: 19.2, ri: 18.05, h: 10, split: true, rot: [0, 90, 0] },
        { type: "extrude", depth: 3, bevel: .3, rot: [0, 90, 0], at: [-1.5, 0, 0], holes: [[28, 5, 3.2]],
          pts: [[18, 0], [34, 0], [34, 10], [18, 10]] } ] } },
    { id: "bandlw", ref: "17", name: "Lock washer (clamp band bolt)", mat: "zinc", small: true, parent: "band", stage: 6, A: [38.5, 121, -28], E: [8, 121, -88], dir: [1, 0, 0],
      geom: { type: "ring", ro: 5.6, ri: 3.2, h: 1.6, split: true, rot: [0, 0, -90], at: [-1.6, 0, 0] } },
    { id: "bandbolt", ref: "16", name: "Bolt (clamp band)", mat: "zinc", small: true, parent: "band", stage: 6, A: [36.9, 121, -28], E: [-10, 121, -88], dir: [1, 0, 0],
      geom: { type: "group", rot: [0, 0, -90], items: [
        { type: "hex", af: 10, h: 4, y: -4 },
        { type: "lathe", pts: [[0, 0], [3, 0], [3, 15.5], [2.6, 16], [0, 16]] } ] } },
    { id: "tank", ref: "11", name: "Reservoir tank", mat: "alu", parent: "body", stage: 7, A: [40, 110, 0], E: [40, 180, 0], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[1.8, -14], [3.6, -14], [4.6, -12], [3.8, -11], [3.8, -4], [8, -1.5], [16, 0], [18, 2], [18, 31.5], [17, 32.5], [17, 40], [15.4, 40], [15.4, 3], [1.8, 3]] },
        ...[21, 24.5, 28].map(y => ({ type: "torus", R: 18, r: .7, at: [0, y, 0] })),
        ...[35, 36.8, 38.6].map(y => ({ type: "torus", R: 17, r: .4, at: [0, y, 0] })) ] } },
    { id: "hose", ref: "18", name: "Reservoir hose", mat: "rubber", parent: "body", stage: 8, A: [0, 0, 0], E: [0, 0, -75], dir: [0, 0, 1],
      geom: { type: "tube", r: 5, pts: [[17, 50, 0], [24, 50, 0], [32, 52, 0], [38, 60, 0], [40, 72, 0], [40, 88, 0], [40, 104, 0]] } },
    { id: "hclamps", ref: "19", name: "Hose clamps", mat: "spring", small: true, parent: "hose", stage: 8, A: [0, 0, 0], E: [0, 0, -115], dir: [0, 0, 1], count: 2,
      geom: { type: "group", items: [
        { type: "group", rot: [0, 0, 90], at: [21, 50, 0], items: [{ type: "torus", R: 5.5, r: .7 }, { type: "pair", pos: [[0, 0, -5.4], [0, 0, 5.4]], item: { type: "box", size: [1.4, 1.4, 3], r: .3, at: [-1.6, 0, 0] } }] },
        { type: "group", at: [40, 100, 0], items: [{ type: "torus", R: 5.5, r: .7 }, { type: "pair", pos: [[1.6, 0, -5.4], [1.6, 0, 5.4]], item: { type: "box", size: [3, 1.4, 1.4], r: .3 } }] } ] } },
    { id: "diaph", ref: "14", name: "Diaphragm", mat: "rubber", parent: "tank", stage: 9, A: [40, 150, 0], E: [40, 250, 0], dir: [0, -1, 0],
      geom: { type: "lathe", pts: [[0, -12], [11, -12], [13.6, -9.5], [13.6, 0], [17, 0], [17, 1.5], [12, 1.5], [12, -9], [10, -10.5], [0, -10.5]] } },
    { id: "dplate", ref: "13", name: "Diaphragm plate", mat: "steel", small: true, parent: "tank", stage: 10, A: [40, 151.6, 0], E: [40, 272, 0], dir: [0, -1, 0],
      geom: { type: "ring", ro: 16.8, ri: 8, h: 1.2 } },
    { id: "cap", ref: "12", name: "Cap", mat: "chrome", parent: "tank", stage: 10, A: [40, 144, 0], E: [40, 292, 0], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[17.2, 0], [20, 0], [20, 9.5], [19, 11], [0, 11], [0, 8.9], [17.2, 8.9]] },
        { type: "torus", R: 12, r: .5, at: [0, 11, 0] },
        { type: "array", pos: Array.from({ length: 24 }, (_, i) => { const a = i * Math.PI / 12; return [Math.cos(a) * 20, 0, Math.sin(a) * 20, -i * 15]; }),
          item: { type: "box", size: [1.4, 7, 1.4], r: .3, at: [0, 4.5, 0] } } ] } },
  ],
};
D3_MODELS["CMS-BLCK0056"] = D3_BLCK0056;
