/* ============ 3D parts model: front caliper, GS750EC / GS750EN (CMSNL BLCK0029) ============
   Mechanical data only. Units: millimetres. Geometry adapted from d3_br01.js (same caliper family).
   World frame (right-hand caliper as fitted): the brake disc mid-plane is X = 0 (disc not drawn), +X = outboard = rider's RIGHT,
   +Y up, +Z forward, toward the wheel axle. Because +X is the rider's right, the model sets mirrorX: true.
   The piston axis is the X axis through Y = 0, Z = 0. Single-piston sliding caliper: piston bore in the outboard half,
   a bridge over the disc rim to the inboard jaw, and the body slides on two caliper axles held in the holder.
   Layout follows the CMSNL picture for this page: two different axles (9 with a hex head, 10 with a round flanged head),
   an O-ring (3) and an axle washer (11) on each axle, dust covers (4) on the axle bosses, a single 6 x 12 pad screw (8)
   with no lock washer, and holder bolts (14) with plain (15) and lock (16) washers.
   Geometry: APPROXIMATE. Typical 1970s single-piston caliper proportions; nothing here is a factory measurement. */
const D3_BLCK0029 = (() => {
  const zy = a => a.map(([z, y]) => [-z, y]);            // outlines written as (Z, Y); the extrude is turned so its depth runs along +X
  const zyh = a => a.map(([z, y, r]) => [-z, y, r]);
  const onX = { rot: [0, 0, -90] };                        // lathe/ring/hex built along Y, turned to run along +X
  const padOutline = [[-22, -26], [-22, 26], [-15, 29], [10, 25], [17, 17], [17, -17], [10, -25], [-15, -29]];
  const liningOutline = [[-21, -24], [-21, 24], [-14, 27], [9, 23], [15.5, 15], [15.5, -15], [9, -23], [-14, -27]];
  const ex = (pts, depth, x, mat) => ({ type: "extrude", pts: zy(pts), depth, bevel: .4, rot: [0, 90, 0], at: [x, 0, 0], mat });
  const AX_UP = [0, 48, -10], AX_LO = [0, -48, -10];

  return {
    id: "CMS-BLCK0029", title: "Front caliper (GS750EC, EN)", units: "mm", page: "BLCK0029", mirrorX: true,
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL front caliper page for the GS750EC and EN, and the layout follows the CMSNL picture. Shapes and sizes are typical proportions for a single-piston sliding caliper, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [-1.1, .75, 1.05], up: [0, 1, 0] },
    notModelled: "Refs 0-1 to 0-4 are the complete caliper assemblies (right and left, two part-number versions each). The body is only sold inside them, so it is drawn once under ref 0. Holder 7 has four rows: 7-1/7-2 are the right-hand holder (old and new number), 7-3/7-4 are the left-hand holder for the other caliper, which isn't drawn. The right-hand caliper is the one shown; the left one is its mirror image. The brake disc, hose and fork leg lugs aren't on this page, so they aren't drawn: the holder bolt shanks (14) end in empty space where the fork lugs sit. The CMSNL picture shows one of each small part; the model fits one O-ring, washer and dust cover per axle and two holder bolt sets, which is how the caliper goes together.",
    stages: [
      { t: "Piston seal", d: "Fit a new piston seal into the groove in the bore. Lubricate it first (fluid or grease type: VERIFY IN FACTORY SERVICE MANUAL)." },
      { t: "Piston", d: "Press the piston into the bore square, open end toward the pad, until it sits through the seal." },
      { t: "Piston boot", d: "Fit the boot into the counterbore at the mouth of the bore and over the groove on the piston." },
      { t: "Bleeder and cap", d: "Screw the bleeder into the top of the body and push the rubber cap on. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Dust covers and O-rings", d: "Fit the dust covers on the axle bosses of the body and the O-rings into the axle bores of the holder." },
      { t: "Holder onto the body", d: "Offer the holder up to the outboard side of the body so its axle bores line up with the threaded holes in the body." },
      { t: "Caliper axles", d: "Grease the axles lightly (grease type: VERIFY IN FACTORY SERVICE MANUAL). Put a washer on each, then screw the hex-head axle in at the top and the flanged axle at the bottom. The body has to slide freely." },
      { t: "Pads", d: "Slide both pads in from the open side of the caliper with the lining toward the disc." },
      { t: "Pad screw", d: "Fit the 6 x 12 screw through the inboard jaw into the inboard pad." },
      { t: "Caliper onto the fork leg", d: "Fit the caliper over the disc and bolt the holder to the fork leg lugs, plain washer then lock washer under each bolt head. Torque: VERIFY IN FACTORY SERVICE MANUAL. Bleed the brake." },
    ],
    parts: [
      { id: "body", shell: true, ref: "0", name: "Caliper body (comes with the caliper assembly)", mat: "alu", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "lathe", ...onX, pts: [[24.5, 20], [31, 22], [31, 54], [28, 56], [0, 56], [0, 50], [21.5, 50], [21.5, 34], [24, 34], [24, 30], [21.5, 30], [21.5, 25], [24.5, 25]] },
          { type: "cyl", r: 7, h: 6, axis: "x", at: [56, 0, 0] },                           // hose inlet boss
          { type: "box", size: [83, 52, 18], r: 3, at: [14.5, 0, -38] },                    // bridge over the disc rim
          { type: "box", size: [10.5, 50, 69], r: 3, at: [-21.75, 0, -12.5] },              // inboard jaw
          { type: "cyl", r: 9.5, h: 20, axis: "x", at: [36, 48, -10] },                    // upper axle boss
          { type: "cyl", r: 9.5, h: 20, axis: "x", at: [36, -48, -10] },                   // lower axle boss
          { type: "box", size: [18, 22, 12], r: 2, at: [46, 36, -10] },
          { type: "box", size: [18, 22, 12], r: 2, at: [46, -36, -10] },
          { type: "cyl", r: 7, h: 14, at: [46, 20, 14] },                                   // bleeder boss
        ] } },
      { id: "seal", ref: "5", name: "Piston seal", mat: "rubber", small: true, parent: "body", stage: 1, A: [30, 0, 0], E: [54, 0, 120], dir: [1, 0, 0],
        geom: { type: "ring", ...onX, ro: 24, ri: 21.25, h: 4 } },
      { id: "piston", ref: "1", name: "Piston", mat: "chrome", parent: "body", stage: 2, A: [16.5, 0, 0], E: [0, 0, 120], dir: [1, 0, 0],
        geom: { type: "lathe", ...onX, pts: [[16.5, 0], [21.4, 0], [21.4, 1.5], [20.4, 1.5], [20.4, 4], [21.4, 4], [21.4, 30], [0, 30], [0, 25], [16.5, 25]] } },
      { id: "boot", ref: "6", name: "Piston boot", mat: "rubber", small: true, parent: "piston", stage: 3, A: [16.5, 0, 0], E: [-40, 0, 120], dir: [1, 0, 0],
        geom: { type: "lathe", ...onX, pts: [[20.45, 1.5], [23, 1.5], [24.4, 4], [24.4, 8.5], [22, 8.5], [21.6, 5.5], [20.45, 4]] } },
      { id: "bleeder", ref: "12", name: "Bleeder", mat: "zinc", small: true, parent: "body", stage: 4, A: [46, 34, 14], E: [46, 78, 14], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "lathe", pts: [[0, -10], [2, -10], [3.5, -8], [3.5, .5], [3, .5], [3, 17], [2.2, 19], [0, 19]] },
          { type: "hex", af: 8, h: 6, y: .5 } ] } },
      { id: "cap", ref: "13", name: "Bleeder cap", mat: "rubber", small: true, parent: "bleeder", stage: 4, A: [46, 34, 14], E: [46, 112, 14], dir: [0, -1, 0],
        geom: { type: "lathe", pts: [[3.05, 9], [4.6, 9], [4.6, 21], [3.6, 22.5], [0, 22.5], [0, 19.2], [3.05, 19.2]] } },
      { id: "dust", ref: "4", name: "Axle dust covers", mat: "rubber", small: true, parent: "body", stage: 5, A: [56, 0, 0], E: [90, 0, 0], dir: [-1, 0, 0], count: 2,
        geom: { type: "pair", at: [AX_UP, AX_LO], item: { type: "bellows", ...onX, rIn: 5.05, r1: 7, r2: 8.5, h: 8, n: 2 } } },
      { id: "orings", ref: "3", name: "O-rings (caliper axles)", mat: "rubber", small: true, parent: "holder", stage: 5, A: [70, 0, 0], E: [124, 0, 0], dir: [-1, 0, 0], count: 2,
        geom: { type: "pair", at: [AX_UP, AX_LO], item: { type: "torus", rot: [0, 0, 90], R: 5.6, r: 1 } } },
      { id: "holder", ref: "7", name: "Caliper holder, right", mat: "dark", parent: "body", stage: 6, A: [64, 0, 0], E: [150, 0, 0], dir: [-1, 0, 0],
        geom: { type: "group", items: [
          { type: "extrude", rot: [0, 90, 0], depth: 12, bevel: .8,
            pts: zy([[-22, -60], [-22, -38], [34, -38], [34, 38], [-22, 38], [-22, 60], [50, 60], [74, 44], [74, 16], [60, 16], [60, -16], [74, -16], [74, -44], [50, -60]]),
            holes: zyh([[-10, 48, 5.6], [-10, -48, 5.6], [64, 30, 5.3], [64, -30, 5.3]]) },
          { type: "ring", ...onX, ro: 9, ri: 5.6, h: 4, at: [12, 48, -10] },                 // raised boss round the upper axle bore
          { type: "ring", ...onX, ro: 9, ri: 5.6, h: 4, at: [12, -48, -10] } ] } },
      { id: "washer11", ref: "11", name: "Axle washers", mat: "zinc", small: true, parent: "holder", stage: 7, A: [80, 0, 0], E: [180, 0, 0], dir: [-1, 0, 0], count: 2,
        geom: { type: "pair", at: [AX_UP, AX_LO], item: { type: "ring", ...onX, ro: 8.5, ri: 5.1, h: 2 } } },
      { id: "axle9", ref: "9", name: "Caliper axle, hex head (upper)", mat: "chrome", parent: "holder", stage: 7, A: [82, 48, -10], E: [240, 48, -10], dir: [-1, 0, 0],
        geom: { type: "group", items: [
          { type: "lathe", ...onX, pts: [[0, -48], [4.2, -48], [5, -47], [5, 0], [0, 0]] },
          { type: "hex", ...onX, af: 14, h: 8, y: 0 } ] } },
      { id: "axle10", ref: "10", name: "Caliper axle, flanged head (lower)", mat: "chrome", parent: "holder", stage: 7, A: [82, -48, -10], E: [240, -48, -10], dir: [-1, 0, 0],
        geom: { type: "lathe", ...onX, pts: [[0, -48], [4.2, -48], [5, -47], [5, 0], [10, 0], [10.5, 1], [10.5, 4], [9, 6], [0, 6]] } },
      { id: "pads", ref: "2", name: "Brake pads", mat: "steel", parent: "body", stage: 8, A: [0, 0, 0], E: [0, 0, 58], dir: [0, 0, -1], count: 2,
        geom: { type: "group", items: [
          ex(padOutline, 4, -16.5), ex(liningOutline, 9, -12.5, "black"),
          ex(liningOutline, 9, 3.5, "black"), ex(padOutline, 4, 12.5) ] } },
      { id: "screw8", ref: "8", name: "Screw 6 x 12 (pad)", mat: "zinc", small: true, parent: "body", stage: 9, A: [-27, 0, -10], E: [-70, 0, -10], dir: [1, 0, 0],
        geom: { type: "screwX", head: 4, headR: 5, len: 12, r: 3 } },
      { id: "washer15", ref: "15", name: "Washers (holder bolts)", mat: "zinc", small: true, parent: "holder", stage: 10, A: [76, 0, 0], E: [270, 0, 0], dir: [-1, 0, 0], count: 2,
        geom: { type: "pair", at: [[0, 30, 64], [0, -30, 64]], item: { type: "ring", ...onX, ro: 10, ri: 5.3, h: 2 } } },
      { id: "lockw16", ref: "16", name: "Lock washers (holder bolts)", mat: "spring", small: true, parent: "holder", stage: 10, A: [78, 0, 0], E: [290, 0, 0], dir: [-1, 0, 0], count: 2,
        geom: { type: "pair", at: [[0, 30, 64], [0, -30, 64]], item: { type: "ring", ...onX, ro: 8.6, ri: 5.2, h: 2.5, split: true } } },
      { id: "bolts14", ref: "14", name: "Bolts (holder to fork leg)", mat: "zinc", small: true, parent: "holder", stage: 10, A: [80.5, 0, 0], E: [350, 0, 0], dir: [-1, 0, 0], count: 2,
        geom: { type: "pair", at: [[0, 30, 64], [0, -30, 64]], item: { type: "group", items: [
          { type: "lathe", ...onX, pts: [[0, -35], [4.2, -35], [5, -34], [5, 0], [0, 0]] },
          { type: "hex", ...onX, af: 14, h: 7, y: 0 } ] } } },
    ],
  };
})();
D3_MODELS["CMS-BLCK0029"] = D3_BLCK0029;
