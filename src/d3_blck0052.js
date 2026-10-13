/* ============ 3D parts model: rear brake caliper, GS750B 1977 (CMSNL BLCK0052 "REAR CARIPERS") ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: the rear disc mid-plane is X = 0 (disc not drawn), +X points outboard (away from the wheel, toward the
   caliper bracket), +Y points radially out from the axle toward the rim of the disc, Z runs along the disc (tangential).
   The two piston bores share the X axis through Y = 0, Z = 0, which is also the centre of the pads.
   The caliper is drawn as a fixed opposed-piston caliper: two halves (outboard and inboard), each with one piston,
   bolted together through the two bridges over the rim of the disc (housing bolts, ref 6). The pads drop in through the
   window between the bridges and hang on two pad pins that run through both halves, locked by clips. A pad spring sits
   on the pads under the pins and a dust cover closes the window. The outboard half carries two mounting lugs that bolt
   to the caliper bracket (bracket not on this page, not drawn) with the 10 x 34 bolts, washers and lock washers.
   Identity and numbering: CMSNL page BLCK0052 rows. The CMSNL picture could not be opened from here, so the layout
   (two-piston opposed body, which seal is ref 5, where the bleeder and the breather sit) is the usual one for this
   family of 1970s Tokico rear calipers and should be checked against the picture.
   Geometry: APPROXIMATE. Pistons drawn 38 mm across, disc 7 mm thick; neither is a checked factory figure. */
(() => {
  const zy = a => a.map(([z, y]) => [-z, y]);            // outlines written as (Z, Y) pairs; the extrude is turned so its depth runs along +X
  const zyh = a => a.map(([z, y, r]) => [-z, y, r]);
  const onX = { rot: [0, 0, -90] };                        // lathe/ring/hex built along Y, turned to run along +X
  const onNX = { rot: [0, 0, 90] };                        // the same, turned to run along -X (inboard half)
  const ex = (pts, depth, x, mat, holes) => ({ type: "extrude", pts: zy(pts), holes: holes && zyh(holes), depth, bevel: .4, rot: [0, 90, 0], at: [x, 0, 0], mat });

  // pad backing plate: body plus two ears with the pad pin holes
  const plate = [[-24.5, -16], [-22, -18], [22, -18], [24.5, -16], [24.5, 32], [22.5, 34], [14, 34], [14, 44], [6, 44], [6, 34],
    [-6, 34], [-6, 44], [-14, 44], [-14, 34], [-22.5, 34], [-24.5, 32]];
  const plateHoles = [[10, 40, 2.7], [-10, 40, 2.7]];
  const lining = [[-23.5, -15], [-21, -17], [21, -17], [23.5, -15], [23.5, 30], [21.5, 32], [-21.5, 32], [-23.5, 30]];
  const shim = [[-20, -14], [20, -14], [20, 28], [-20, 28]];
  // piston housing turned about the bore axis: 38 mm bore, boot counterbore at the mouth, seal groove, closed end
  const housing = [[22, 16], [28, 16], [28, 42], [26, 44], [0, 44], [0, 38], [19.1, 38], [19.1, 30], [21, 30], [21, 26], [19.1, 26], [19.1, 20], [22, 20]];
  // cup piston, open end toward the pad, boot groove near the mouth
  const piston = [[15, 0], [19, 0], [19, 2], [18, 2], [18, 4], [19, 4], [19, 22], [0, 22], [0, 17], [15, 17]];
  const boot = [[18.05, 2], [20, 1.2], [21.9, 1.2], [21.9, 5], [19.2, 5], [18.05, 4]];
  // half body without the housing: top plate (pin bosses) and the two bridges; s = +1 outboard, -1 inboard
  const halfBlocks = s => [
    { type: "box", size: [8, 20, 76], r: 2, at: [s * 20, 36, 0] },                      // top plate across the end of the pad window (pad pin bosses)
    { type: "box", size: [17, 18, 13], r: 1.5, at: [s * 8.5, 37, 31.5] },                  // bridge over the disc rim, front
    { type: "box", size: [17, 18, 13], r: 1.5, at: [s * 8.5, 37, -31.5] },                 // bridge, rear
    { type: "box", size: [10, 14, 10], r: 1.5, at: [s * 21, 23, 31.5] },                 // web from the bridge down to the housing
    { type: "box", size: [10, 14, 10], r: 1.5, at: [s * 21, 23, -31.5] },
    { type: "cyl", r: 6.5, h: 15, at: [s * 32, 16, -14] },                               // bleed boss on top of the housing
  ];
  const lug = [[-42, -18], [-42, -32], [-36, -38], [36, -38], [42, -32], [42, -18], [24, -10], [-24, -10]];

  D3_MODELS["CMS-BLCK0052"] = {
    id: "CMS-BLCK0052", title: "Rear brake caliper", units: "mm", page: "BLCK0052",
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL rear caliper page (BLCK0052). The body is drawn as the usual 1970s Tokico two-piston opposed rear caliper; shapes and sizes are typical proportions, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [1.1, .8, 1.2], up: [0, 1, 0] },
    notModelled: "Ref 0 (0-1/0-2) is the complete caliper assembly; the two body halves are only sold inside it, so both halves are drawn under ref 0. Ref 1 is a set (1-1 piston/pad set, 1-2 piston set): it is drawn as the two pistons. Suffix variants 2-1/2-2 (pads) and 14-1/14-2 (shims) are drawn once each. The caliper bracket, brake disc and brake hose are not on this page and are not drawn, so the 10 x 34 mounting bolts (15) with their washers (16, 17) stand off the mounting lugs by the thickness of the bracket. Ref 5 is drawn as the O-ring that seals the fluid passage between the two halves, and the bleeder (11) and breather (12, with cap 13) are put one on each half; both are assumptions not checked against the CMSNL picture.",
    stages: [
      { t: "Piston seals", d: "Fit a new piston seal into the groove in each half's bore. Lubricate them first (fluid or grease type: VERIFY IN FACTORY SERVICE MANUAL)." },
      { t: "Pistons", d: "Press each piston into its bore square, open end toward the pad, until it sits through the seal." },
      { t: "Piston boots", d: "Fit each boot into the counterbore at the mouth of the bore and over the groove on the piston." },
      { t: "Passage O-ring", d: "Fit a new O-ring into the counterbore of the fluid passage on the joint face of the outboard half." },
      { t: "Join the halves", d: "Bring the inboard half up to the outboard half so the joint faces meet over the O-ring." },
      { t: "Housing bolts", d: "Fit the two housing bolts through the outboard half into the inboard half and tighten evenly. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Bleeder and breather", d: "Screw the bleeder into the outboard half and the breather into the inboard half, then fit the rubber cap. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Shims and pads", d: "Drop the pads in through the window, lining toward the disc, with a shim between each pad and its piston." },
      { t: "Pad spring and pins", d: "Lay the pad spring on top of the pads and push the pad pins in from the inboard side through both halves and the pad ears, over the spring arms." },
      { t: "Pad pin clips", d: "Fit a clip into the cross hole at the outboard end of each pad pin." },
      { t: "Dust cover", d: "Press the dust cover over the pad window." },
      { t: "Caliper onto the bracket", d: "Fit the caliper over the disc and bolt it to the bracket with the washers and lock washers under the bolt heads. Torque: VERIFY IN FACTORY SERVICE MANUAL. Bleed the brake." },
    ],
    parts: [
      { id: "bodyO", shell: true, ref: "0", name: "Caliper body, outboard half (part of the caliper assembly)", mat: "alu", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "lathe", ...onX, pts: housing },
          ...halfBlocks(1),
          { type: "cyl", r: 7, h: 15, at: [32, 16, 14] },                                   // brake hose inlet boss
          { type: "cyl", r: 3, h: .4, at: [32, 31, 14], mat: "black" },                    // inlet port
          ex(lug, 22, 22, undefined, [[32, -28, 5.2], [-32, -28, 5.2]]),                   // mounting lugs (to the bracket)
        ] } },
      { id: "sealO", ref: "3", name: "Piston seal (outboard)", mat: "rubber", small: true, parent: "bodyO", stage: 1, A: [26, 0, 0], E: [-30, 0, 0], dir: [1, 0, 0],
        geom: { type: "ring", ...onX, ro: 21, ri: 18.95, h: 4 } },
      { id: "sealI", ref: "3", name: "Piston seal (inboard)", mat: "rubber", small: true, parent: "bodyI", stage: 1, A: [-26, 0, 0], E: [-200, 0, 0], dir: [-1, 0, 0],
        geom: { type: "ring", ...onNX, ro: 21, ri: 18.95, h: 4 } },
      { id: "pistonO", ref: "1", name: "Piston (outboard)", mat: "chrome", parent: "bodyO", stage: 2, A: [15, 0, 0], E: [-65, 0, 0], dir: [1, 0, 0],
        geom: { type: "lathe", ...onX, pts: piston } },
      { id: "pistonI", ref: "1", name: "Piston (inboard)", mat: "chrome", parent: "bodyI", stage: 2, A: [-15, 0, 0], E: [-150, 0, 0], dir: [-1, 0, 0],
        geom: { type: "lathe", ...onNX, pts: piston } },
      { id: "bootO", ref: "4", name: "Piston boot (outboard)", mat: "rubber", small: true, parent: "pistonO", stage: 3, A: [15, 0, 0], E: [-85, 0, 0], dir: [1, 0, 0],
        geom: { type: "lathe", ...onX, pts: boot } },
      { id: "bootI", ref: "4", name: "Piston boot (inboard)", mat: "rubber", small: true, parent: "pistonI", stage: 3, A: [-15, 0, 0], E: [-110, 0, 0], dir: [-1, 0, 0],
        geom: { type: "lathe", ...onNX, pts: boot } },
      { id: "oring5", ref: "5", name: "O-ring (fluid passage between the halves)", mat: "rubber", small: true, parent: "bodyO", stage: 4, A: [0, 31.5, -31.5], E: [-30, 31.5, -31.5], dir: [1, 0, 0],
        geom: { type: "torus", rot: [0, 0, 90], R: 2.6, r: .8 } },
      { id: "bodyI", shell: true, ref: "0", name: "Caliper body, inboard half (part of the caliper assembly)", mat: "alu", parent: "bodyO", stage: 5, A: [0, 0, 0], E: [-260, 0, 0], dir: [1, 0, 0],
        geom: { type: "group", items: [
          { type: "lathe", ...onNX, pts: housing },
          ...halfBlocks(-1),
        ] } },
      { id: "hbolts", ref: "6", name: "Housing bolts", mat: "zinc", small: true, parent: "bodyO", stage: 6, A: [0, 0, 0], E: [130, 0, 0], dir: [-1, 0, 0], count: 2,
        geom: { type: "pair", at: [[24, 39, 31.5], [24, 39, -31.5]], item: { type: "group", items: [
          { type: "lathe", ...onX, pts: [[0, -37], [3.4, -37], [4, -36], [4, 0], [0, 0]] },
          { type: "hex", ...onX, af: 12, h: 6, y: 0 } ] } } },
      { id: "bleeder", ref: "11", name: "Bleeder (outboard half)", mat: "zinc", small: true, parent: "bodyO", stage: 7, A: [32, 31, -14], E: [32, 80, -14], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "lathe", pts: [[0, -10], [2, -10], [3.5, -8], [3.5, 0], [3, 0], [3, 13], [2.2, 15], [0, 15]] },
          { type: "hex", af: 8, h: 5, y: 0 } ] } },
      { id: "breather", ref: "12", name: "Breather (bleed valve, inboard half)", mat: "zinc", small: true, parent: "bodyI", stage: 7, A: [-32, 31, -14], E: [-292, 80, -14], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "lathe", pts: [[0, -10], [2, -10], [3.5, -8], [3.5, 0], [3, 0], [3, 13], [2.2, 15], [0, 15]] },
          { type: "hex", af: 8, h: 5, y: 0 } ] } },
      { id: "cap", ref: "13", name: "Breather cap", mat: "rubber", small: true, parent: "breather", stage: 7, A: [-32, 31, -14], E: [-292, 112, -14], dir: [0, -1, 0],
        geom: { type: "lathe", pts: [[3.05, 6], [4.6, 6], [4.6, 17], [3.6, 18.5], [0, 18.5], [0, 15.2], [3.05, 15.2]] } },
      { id: "shimO", ref: "14", name: "Shim (outboard pad)", mat: "steel", small: true, parent: "bodyO", stage: 8, A: [0, 0, 0], E: [10, 100, 0], dir: [0, -1, 0],
        geom: ex(shim, .5, 14.5, undefined) },
      { id: "shimI", ref: "14", name: "Shim (inboard pad)", mat: "steel", small: true, parent: "bodyO", stage: 8, A: [0, 0, 0], E: [-10, 100, 0], dir: [0, -1, 0],
        geom: ex(shim, .5, -15, undefined) },
      { id: "padO", ref: "2", name: "Brake pad (outboard)", mat: "steel", parent: "bodyO", stage: 8, A: [0, 0, 0], E: [0, 100, 0], dir: [0, -1, 0],
        geom: { type: "group", items: [ex(lining, 8, 3.5, "black"), ex(plate, 3, 11.5, undefined, plateHoles)] } },
      { id: "padI", ref: "2", name: "Brake pad (inboard)", mat: "steel", parent: "bodyO", stage: 8, A: [0, 0, 0], E: [0, 100, 0], dir: [0, -1, 0],
        geom: { type: "group", items: [ex(plate, 3, -14.5, undefined, plateHoles), ex(lining, 8, -11.5, "black")] } },
      { id: "spring", ref: "9", name: "Pad spring", mat: "spring", small: true, parent: "bodyO", stage: 9, A: [0, 0, 0], E: [0, 140, 0], dir: [0, -1, 0],
        geom: { type: "tube", r: .8, pts: [[-10, 36.7, -10], [10, 36.7, -10], [12.8, 35.2, -4.5], [13, 34.8, 0], [12.8, 35.2, 4.5], [10, 36.7, 10],
          [-10, 36.7, 10], [-12.8, 35.2, 4.5], [-13, 34.8, 0], [-12.8, 35.2, -4.5], [-10, 36.7, -10]] } },
      { id: "pins", ref: "7", name: "Pad pins", mat: "chrome", small: true, parent: "bodyO", stage: 9, A: [0, 0, 0], E: [-90, 0, 0], dir: [1, 0, 0], count: 2,
        geom: { type: "pair", at: [[0, 40, 10], [0, 40, -10]], item: { type: "lathe", ...onX, pts: [[0, -27], [4, -27], [4, -24], [2.5, -24], [2.5, 27.5], [2, 28], [0, 28]] } } },
      { id: "clips", ref: "8", name: "Pad pin clips", mat: "spring", small: true, parent: "pins", stage: 10, A: [0, 0, 0], E: [70, 0, 0], dir: [-1, 0, 0], count: 2,
        geom: { type: "pair", at: [[26, 40, 10], [26, 40, -10]], item: { type: "clip", rot: [0, 0, 90], R: 3.3, r: .6, gap: .9 } } },
      { id: "cover", ref: "10", name: "Dust cover (pad window)", mat: "black", small: true, parent: "bodyO", stage: 11, A: [0, 0, 0], E: [0, 200, 0], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "box", size: [48, 1.6, 58], r: .7, at: [0, 46.8, 0] },
          { type: "box", size: [1.6, 5, 50], r: .5, at: [-24.8, 44.5, 0] },
          { type: "box", size: [1.6, 5, 50], r: .5, at: [24.8, 44.5, 0] } ] } },
      { id: "washer16", ref: "16", name: "Washers (mounting bolts)", mat: "zinc", small: true, parent: "bodyO", stage: 12, A: [0, 0, 0], E: [40, 0, 0], dir: [-1, 0, 0], count: 2,
        geom: { type: "pair", at: [[52, -28, 32], [52, -28, -32]], item: { type: "ring", ...onX, ro: 10, ri: 5.3, h: 2 } } },
      { id: "lockw17", ref: "17", name: "Lock washers (mounting bolts)", mat: "spring", small: true, parent: "bodyO", stage: 12, A: [0, 0, 0], E: [60, 0, 0], dir: [-1, 0, 0], count: 2,
        geom: { type: "pair", at: [[54, -28, 32], [54, -28, -32]], item: { type: "ring", ...onX, ro: 8.6, ri: 5.2, h: 2.5, split: true } } },
      { id: "bolts15", ref: "15", name: "Bolts 10 x 34 (caliper to bracket)", mat: "zinc", small: true, parent: "bodyO", stage: 12, A: [0, 0, 0], E: [95, 0, 0], dir: [-1, 0, 0], count: 2,
        geom: { type: "pair", at: [[56.5, -28, 32], [56.5, -28, -32]], item: { type: "group", items: [
          { type: "lathe", ...onX, pts: [[0, -34], [4.2, -34], [5, -33], [5, 0], [0, 0]] },
          { type: "hex", ...onX, af: 14, h: 7, y: 0 } ] } } },
    ],
  };
})();
