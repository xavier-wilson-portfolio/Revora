/* ============ 3D parts model: rear master cylinder, GS750B (CMSNL BLCK0055) ============
   Mechanical data only. Units: millimetres.
   World frame: +X = rider's LEFT (inboard, toward the frame, for this right-side part), +Y up, +Z forward.
   The bore axis is vertical at X = 0, Z = 0, open at the bottom (mouth at Y = 0); the push rod comes up out of the
   brake pedal clevis into it. The ribbed reservoir plugs into a round socket on top of the body (O-ring seal, plate and
   one screw inside), the same layout as the CMSNL picture.
   Mounting: a lower rigid bolt (ref 9 with ref 10) and an upper rubber-mounted bolt (16, 18, 17, 20, 19) both go in
   from the outboard side (-X) through ears on the back of the body; the frame bracket they thread into isn't drawn.
   Geometry: APPROXIMATE. Typical 1970s Tokico rear master cylinder proportions, not factory measurements. */
const D3_BLCK0055 = {
  id: "CMS-BLCK0055", title: "Rear master cylinder (GS750B)", units: "mm", page: "BLCK0055",
  accuracy: "Approximate geometry. Part identity, numbering and layout follow the CMSNL rear master cylinder (GS750B) page and its picture. Sizes are typical for a 1970s rear master cylinder of this type, not factory measurements. Use the factory service manual for every dimension.",
  view: { dir: [-1.2, .55, 1.1], up: [0, 1, 0] },
  notModelled: "Ref 0 is the complete master cylinder; the body is drawn under ref 0 because the page doesn't sell it on its own. Refs 9 and 10 carry the same part number and no description on the page; they're drawn as the lower mounting bolt and its washer, the way the picture shows them. The frame bracket, brake pedal and hoses aren't on this page.",
  stages: [
    { t: "Piston and cup set into the bore", d: "Wet the new cups with clean brake fluid. Spring first, then the piston with its cups, pushed up into the bore from the bottom." },
    { t: "Push rod and circlip", d: "Put the ball end of the push rod against the piston, then press the stop washer in and fit the circlip in its groove in the mouth of the bore." },
    { t: "Boot", d: "Work the boot over the rod and onto the lip at the bottom of the body." },
    { t: "Locknut and yoke", d: "Run the locknut up the rod, then screw the yoke on. Pedal height is set with the yoke later: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "O-ring on the reservoir", d: "Roll a new O-ring into the groove at the base of the reservoir." },
    { t: "Reservoir into the socket", d: "Push the reservoir straight down into the round socket on top of the body." },
    { t: "Plate and screw", d: "Lay the plate on the reservoir floor and fit the screw through it into the body. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Lower mounting bolt", d: "Fit the bolt and washer through the lower ear into the frame bracket. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Upper rubber mount", d: "Press the cushion into the upper ear and slide the spacer through it. Fit the bolt with the lock washer and washer through the spacer into the bracket." },
    { t: "Fill and fit the diaphragm", d: "Fill with fresh brake fluid and bleed (fluid type and level: VERIFY IN FACTORY SERVICE MANUAL). Seat the diaphragm on the rim of the reservoir." },
    { t: "Plate and cap", d: "Lay the diaphragm plate on top and screw the cap down onto the reservoir." },
  ],
  parts: [
    { id: "body", shell: true, ref: "0", name: "Master cylinder body (part of the complete master cylinder)", mat: "alu", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, 1, 0],
      geom: { type: "group", items: [
        // barrel: bore 14 mm drawn, counterbore with circlip groove at the mouth, boot lip at the bottom
        { type: "lathe", pts: [[7, 52], [7, 7], [9.6, 7], [9.6, 0], [14, 0], [14, 3.5], [12.2, 4.5], [12.2, 7], [13, 8], [13, 58], [0, 58], [0, 52]] },
        // neck and round reservoir socket (floor at Y = 66, rim at Y = 74)
        { type: "cyl", r: 13, h: 6, at: [0, 56, 0] },
        { type: "lathe", at: [0, 62, 0], pts: [[0, 0], [17, 0], [21, 3], [21, 12], [18.4, 12], [18.4, 4], [0, 4]] },
        { type: "cyl", r: 3, h: .4, at: [0, 65.9, 0], mat: "black" },
        { type: "cyl", r: 2.2, h: .4, at: [8, 65.9, 0], mat: "black" },
        // outlet boss to the caliper hose, facing forward
        { type: "cyl", r: 7, h: 12, axis: "z", at: [0, 48, 10] },
        { type: "cyl", r: 3, h: .5, axis: "z", at: [0, 48, 21.8], mat: "black" },
        // lower mounting ear on the back (bolt along X)
        { type: "box", size: [12, 18, 20], r: 1.5, at: [0, 20, -18] },
        { type: "cyl", r: 9, h: 12, axis: "x", at: [-6, 20, -26] },
        { type: "cyl", r: 4.3, h: 12.4, axis: "x", at: [-6.2, 20, -26], mat: "black" },
        // upper ear for the rubber mount, cast onto the back of the socket
        { type: "box", size: [12, 22, 18], r: 1.5, at: [0, 64, -24] },
        { type: "cyl", r: 12, h: 12, axis: "x", at: [-6, 64, -33] },
        { type: "cyl", r: 8.1, h: 12.4, axis: "x", at: [-6.2, 64, -33], mat: "black" } ] } },
    { id: "piston", ref: "1", name: "Piston and cup set", mat: "steel", parent: "body", stage: 1, A: [0, 0, 0], E: [0, -75, 0], dir: [0, 1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[4.2, 8], [6.8, 8], [6.8, 12], [5, 12.5], [5, 20.5], [6.8, 21], [6.8, 26], [3, 26], [3, 13], [4.2, 13]] },
        { type: "ring", ro: 6.95, ri: 5, h: 6, at: [0, 13.5, 0], mat: "rubber" },
        { type: "lathe", pts: [[0, 26], [6.95, 26], [6.95, 30], [4.5, 31], [0, 31]], mat: "rubber" },
        { type: "spring", R: 4.6, wire: 1, h: 20, turns: 6, at: [0, 31, 0], mat: "spring" } ] } },
    { id: "rod", ref: "12", name: "Push rod", mat: "steel", parent: "body", stage: 2, A: [0, 0, 0], E: [0, -165, 0], dir: [0, 1, 0],
      geom: { type: "group", items: [
        { type: "sphere", r: 4, at: [0, 10, 0] },
        { type: "cyl", r: 3.5, h: 6, at: [0, 4, 0] },
        { type: "ring", ro: 9.2, ri: 3.5, h: 1.6, at: [0, 3.2, 0] },
        { type: "cyl", r: 4, h: 56, at: [0, -52, 0] },
        ...Array.from({ length: 12 }, (_, i) => ({ type: "torus", R: 4, r: .35, at: [0, -50 + i * 2, 0] })) ] } },
    { id: "circlip", ref: "15", name: "Circlip", mat: "spring", small: true, parent: "body", stage: 2, A: [0, 5.6, 0], E: [0, -90, 0], dir: [0, 1, 0],
      geom: { type: "clip", R: 9.2, r: .7, gap: .5 } },
    { id: "boot", ref: "14", name: "Boot", mat: "rubber", parent: "body", stage: 3, A: [0, 0, 0], E: [0, -105, 0], dir: [0, 1, 0],
      geom: { type: "lathe", pts: [[12.2, 4.5], [15.2, 4.5], [15.2, -3], [12, -7], [13.5, -11], [9, -15], [10.5, -19], [6.5, -23], [5.4, -27], [4.1, -27], [4.1, -25], [5.2, -22.5], [9, -19], [7.5, -15], [12, -11], [10.5, -7], [13.6, -3], [13.6, 0], [14.2, 0], [14.2, 3.5], [12.2, 3.5]] } },
    { id: "nut", ref: "13", name: "Locknut", mat: "zinc", small: true, parent: "rod", stage: 4, A: [0, -47, 0], E: [0, -240, 0], dir: [0, 1, 0],
      geom: { type: "hex", af: 12, h: 5, hole: 4 } },
    { id: "yoke", ref: "11", name: "Yoke (clevis)", mat: "steel", parent: "rod", stage: 4, A: [0, -43, 0], E: [0, -255, 0], dir: [0, 1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[0, -18], [8, -18], [8, -15], [6.5, -14], [6.5, -4], [0, -4]] },
        { type: "pair", pos: [[4, 0, 0], [-4, 0, 0]], item: { type: "box", size: [3.5, 16, 14], r: 1, at: [0, -26, 0] } },
        { type: "cyl", r: 3.3, h: 15, axis: "x", at: [-7.5, -28, 0], mat: "black" } ] } },
    { id: "oring", ref: "6", name: "O-ring (reservoir base)", mat: "rubber", small: true, parent: "res", stage: 5, A: [0, 69, 0], E: [0, 100, 0], dir: [0, -1, 0],
      geom: { type: "torus", R: 17.3, r: 1.2 } },
    { id: "res", ref: "5", name: "Reservoir", mat: "alu", parent: "body", stage: 6, A: [0, 66, 0], E: [0, 122, 0], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[3, 0], [17.6, 0], [17.6, 1.6], [16.4, 2.2], [16.4, 3.8], [17.6, 4.4], [17.6, 9], [18.6, 10], [18.6, 24.5], [17, 25], [17, 32], [15.4, 32], [15.4, 3], [3, 3]] },
        ...[12.5, 16, 19.5].map(y => ({ type: "torus", R: 18.6, r: .7, at: [0, y, 0] })),
        ...[27, 28.8, 30.6].map(y => ({ type: "torus", R: 17, r: .4, at: [0, y, 0] })),
        { type: "cyl", r: 3.1, h: .3, at: [0, 2.9, 0], mat: "black" } ] } },
    { id: "rplate", ref: "7", name: "Plate (reservoir floor)", mat: "steel", small: true, parent: "res", stage: 7, A: [0, 69, 0], E: [0, 170, 0], dir: [0, -1, 0],
      geom: { type: "extrude", depth: 1.2, bevel: .2, rot: [-90, 0, 0], holes: [[0, 0, 3.2], [8, 0, 2.4], [-6, 8, 1.6], [-6, -8, 1.6], [0, 10, 1.6]],
        pts: Array.from({ length: 40 }, (_, i) => { const a = i * Math.PI / 20; return [Math.cos(a) * 14.5, Math.sin(a) * 14.5]; }) } },
    { id: "rscrew", ref: "8", name: "Screw (reservoir)", mat: "zinc", small: true, parent: "res", stage: 7, A: [8, 70.4, 0], E: [8, 195, 0], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[0, -12], [2, -12], [2, 0], [4, 0], [4, 1.2], [3.2, 2.8], [0, 2.8]] },
        { type: "box", size: [4.6, .8, 1], r: .2, at: [0, 2.8, 0], mat: "black" },
        { type: "box", size: [1, .8, 4.6], r: .2, at: [0, 2.8, 0], mat: "black" } ] } },
    { id: "lwasher", ref: "10", name: "Washer (lower mounting bolt)", mat: "zinc", small: true, parent: "body", stage: 8, A: [-6, 20, -26], E: [-40, 20, -26], dir: [1, 0, 0],
      geom: { type: "ringX", ro: 8, ri: 4.2, h: 1.6, rot: [0, 180, 0] } },
    { id: "lbolt", ref: "9", name: "Bolt (lower mount)", mat: "zinc", small: true, parent: "body", stage: 8, A: [-7.6, 20, -26], E: [-75, 20, -26], dir: [1, 0, 0],
      geom: { type: "group", rot: [0, 0, -90], items: [
        { type: "hex", af: 12, h: 5.5, y: -5.5 },
        { type: "lathe", pts: [[0, 0], [4, 0], [4, 29.4], [3.5, 30], [0, 30]] } ] } },
    { id: "cushion", ref: "20", name: "Cushion (upper mount)", mat: "rubber", small: true, parent: "body", stage: 9, A: [0, 64, -33], E: [-30, 64, -33], dir: [1, 0, 0],
      geom: { type: "group", items: [
        { type: "ringX", ro: 8, ri: 6, h: 12, at: [-6, 0, 0] },
        { type: "ringX", ro: 11, ri: 6, h: 1.6, at: [-7.6, 0, 0] },
        { type: "ringX", ro: 11, ri: 6, h: 1.6, at: [6, 0, 0] } ] } },
    { id: "spacer", ref: "19", name: "Spacer (upper mount)", mat: "steel", small: true, parent: "cushion", stage: 9, A: [0, 64, -33], E: [-55, 64, -33], dir: [1, 0, 0],
      geom: { type: "ringX", ro: 6, ri: 4.25, h: 19, at: [-9.5, 0, 0] } },
    { id: "uwasher", ref: "17", name: "Washer 8.2 x 20 x 1.6 (upper mount)", mat: "zinc", small: true, parent: "spacer", stage: 9, A: [-9.5, 64, -33], E: [-80, 64, -33], dir: [1, 0, 0],
      geom: { type: "ringX", ro: 10, ri: 4.1, h: 1.6, rot: [0, 180, 0] } },
    { id: "lockw", ref: "18", name: "Lock washer (upper mount)", mat: "zinc", small: true, parent: "spacer", stage: 9, A: [-11.1, 64, -33], E: [-95, 64, -33], dir: [1, 0, 0],
      geom: { type: "ring", ro: 7, ri: 4.2, h: 2, split: true, rot: [0, 0, -90], at: [-2, 0, 0] } },
    { id: "ubolt", ref: "16", name: "Bolt (upper mount)", mat: "zinc", small: true, parent: "spacer", stage: 9, A: [-13.1, 64, -33], E: [-140, 64, -33], dir: [1, 0, 0],
      geom: { type: "group", rot: [0, 0, -90], items: [
        { type: "hex", af: 12, h: 5.5, y: -5.5 },
        { type: "lathe", pts: [[0, 0], [4, 0], [4, 34.4], [3.5, 35], [0, 35]] } ] } },
    { id: "diaph", ref: "4", name: "Diaphragm", mat: "rubber", parent: "res", stage: 10, A: [0, 98, 0], E: [0, 228, 0], dir: [0, -1, 0],
      geom: { type: "lathe", pts: [[0, -12], [11, -12], [13.6, -9.5], [13.6, 0], [17, 0], [17, 1.5], [12, 1.5], [12, -9], [10, -10.5], [0, -10.5]] } },
    { id: "dplate", ref: "3", name: "Diaphragm plate", mat: "steel", small: true, parent: "res", stage: 11, A: [0, 99.6, 0], E: [0, 250, 0], dir: [0, -1, 0],
      geom: { type: "ring", ro: 16.8, ri: 8, h: 1.2 } },
    { id: "cap", ref: "2", name: "Cap", mat: "chrome", parent: "res", stage: 11, A: [0, 92, 0], E: [0, 270, 0], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[17.2, 0], [20, 0], [20, 9.5], [19, 11], [0, 11], [0, 8.9], [17.2, 8.9]] },
        { type: "torus", R: 12, r: .5, at: [0, 11, 0] },
        { type: "array", pos: Array.from({ length: 24 }, (_, i) => { const a = i * Math.PI / 12; return [Math.cos(a) * 20, 0, Math.sin(a) * 20, -i * 15]; }),
          item: { type: "box", size: [1.4, 7, 1.4], r: .3, at: [0, 4.5, 0] } } ] } },
  ],
};
D3_MODELS["CMS-BLCK0055"] = D3_BLCK0055;
