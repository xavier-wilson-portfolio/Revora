/* ============ 3D parts model: cylinder head cover, GS750B 1977 (CMSNL BLCK0019) ============
   Mechanical data only. Units: millimetres.
   World frame: +X along the camshaft axes (toward the right-hand side of the bike), +Y up the cylinder axis, +Z forward
   (exhaust side). Y = 0 is the gasket face where the cover meets the cylinder head; the cover is centred on X = 0, Z = 0.
   Camshaft ends (and the round end caps over them) sit at Z = +77.5 (exhaust) and Z = -77.5 (intake), matching the
   camshaft model (DG d3_en01) cam spacing.
   Identity and numbering: CMSNL cylinder head cover page, refs 1 to 10.
   Counts: 12 cover bolts and 4 breather cover bolts are the figures GS owners give on thegsresources.com forum for the
   1977 GS750; the four round end caps with two screws each follow owners' descriptions of the 8-valve GS covers.
   Bolt sizes (6 x 40 and 6 x 25) are read from the Suzuki part numbers (01517-06408, 01517-06258); the cap screw (02132-05128)
   reads as 5 x 12.
   Geometry: APPROXIMATE. The cover is sized to sit on a DOHC inline-four head about 420 mm wide; cover height, flange,
   boss and breather chamber shapes are typical proportions, not factory measurements. */
(() => {
  // rounded rectangle outline in the extrude plane: half-width hx (X), half-depth hz (plan Y = -Z), corner radius r
  const rr = (hx, hz, r, n = 6) => { const p = [], c = [[hx - r, hz - r, 0], [-hx + r, hz - r, 90], [-hx + r, -hz + r, 180], [hx - r, -hz + r, 270]];
    c.forEach(([cx, cy, a0]) => { for (let i = 0; i <= n; i++) { const a = (a0 + 90 * i / n) * Math.PI / 180; p.push([+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)]); } }); return p; };
  const flat = (g, y) => Object.assign(g, { rot: [-90, 0, 0], at: [0, y, 0] }); // extrude outline lies flat, depth goes up +Y from y
  const BX = [-170, -102, -34, 34, 102, 170], BZ = 116;            // 12 cover bolts, 6 along each long edge
  const BOLTS = BX.flatMap(x => [[x, 0, BZ], [x, 0, -BZ]]);
  const CZ = 77.5, CY = 24, CEND = 198, EAR = 28;                 // cam end cap centres and the cover end face they seat on
  const PZ = -8;                                                    // breather chamber centre (Z)
  const BB = [[42, 0, 28], [-42, 0, 28], [42, 0, -28], [-42, 0, -28]]; // breather cover bolts, relative to the chamber centre

  const boltHex = len => ({ type: "group", items: [
    { type: "lathe", pts: [[0, -len], [2.6, -len], [3, -len + .6], [3, 0], [7, 0], [7, 1.4], [0, 1.4]] },
    { type: "hex", af: 10, h: 4.6, y: 1.4 } ] });

  // round cam end cap, mounting face at local x = 0, facing +X
  const cap = { type: "group", items: [
    { type: "lathe", rot: [0, 0, -90], pts: [[0, 0], [22, 0], [22, 4.5], [20.5, 6.5], [15, 8.8], [0, 9.6]] },
    { type: "box", size: [4, 9, 12], r: 1.5, at: [2, 0, EAR] },
    { type: "box", size: [4, 9, 12], r: 1.5, at: [2, 0, -EAR] } ] };
  const capPair = { type: "pair", at: [[0, 0, CZ], [0, 0, -CZ]], item: cap };
  const screw = { type: "group", items: [
    { type: "lathe", rot: [0, 0, -90], pts: [[0, -3.4], [3.2, -3.4], [4.5, -2], [4.5, 0], [2.5, 0], [2.5, 12], [0, 12]] }, // pan head, shank along +X
    { type: "box", size: [.8, 4.6, 1], r: .3, at: [-3.6, 0, 0], mat: "black" }, { type: "box", size: [.8, 1, 4.6], r: .3, at: [-3.6, 0, 0], mat: "black" } ] };
  // two screws per cap; built for the left side (shank toward +X), turned round for the right side
  const screwSet = { type: "array", pos: [[0, 0, CZ + EAR], [0, 0, CZ - EAR], [0, 0, -CZ + EAR], [0, 0, -CZ - EAR]], item: screw };

  // gasket path: closed loop just inside the flange, inboard of the bolt line
  const loop = rr(182, 100, 30, 5).map(([x, y]) => [x, 1.6, -y]); loop.push(loop[0]);

  const cover = { type: "group", items: [
    flat({ type: "extrude", pts: rr(192, 128, 24), depth: 5.4, bevel: .3, holes: BOLTS.map(([x, , z]) => [x, -z, 3.4]) }, .3),          // flange
    flat({ type: "extrude", pts: rr(186, 104, 30), depth: 39, bevel: 3 }, 6),                                                          // main body
    flat({ type: "extrude", pts: rr(150, 62, 26), depth: 1.5, bevel: 1 }, 48),                                                         // raised top panel
    { type: "array", pos: BOLTS, item: { type: "lathe", pts: [[3.4, 0], [8, 0], [8, 28], [3.4, 28]] } },                              // bolt bosses
    // cam end bosses and the screw ears either side of each cap, both ends
    ...[1, -1].flatMap(s => [CZ, -CZ].flatMap(z => [
      { type: "cyl", axis: "x", r: 24, h: 22, at: [s > 0 ? 176 : -198, CY, z] },
      { type: "box", size: [22, 10, 12], r: 2, at: [s * 187, CY, z + EAR] },
      { type: "box", size: [22, 10, 12], r: 2, at: [s * 187, CY, z - EAR] } ])),
    // breather chamber walls on top of the cover (open pocket for the separator)
    { type: "box", size: [100, 15, 6], r: 1.5, at: [0, 56.5, PZ + 33] },
    { type: "box", size: [100, 15, 6], r: 1.5, at: [0, 56.5, PZ - 33] },
    { type: "box", size: [6, 15, 72], r: 1.5, at: [47, 56.5, PZ] },
    { type: "box", size: [6, 15, 72], r: 1.5, at: [-47, 56.5, PZ] },
    { type: "array", pos: BB.map(([x, , z]) => [x, 49.5, PZ + z]), item: { type: "cyl", r: 6.5, h: 14.5 } },
  ] };

  // inner breather cover: pressed plate with notched corners clear of the bolt bosses and a row of vent holes
  const plateOutline = [[-34, -27], [34, -27], [34, -19], [42, -19], [42, 19], [34, 19], [34, 27], [-34, 27], [-34, 19], [-42, 19], [-42, -19], [-34, -19]];
  const sepFins = [-28, -14, 0, 14, 28].map(x => ({ type: "box", size: [2, 11, 44], r: .4, at: [x, 6.5, 0] }));

  const breatherCover = { type: "group", items: [
    flat({ type: "extrude", pts: rr(50, 36, 8), depth: 4.4, bevel: .3, holes: BB.map(([x, , z]) => [x, -z, 3.4]) }, .3),
    flat({ type: "extrude", pts: rr(36, 24, 10), depth: 4, bevel: 1 }, 5),                    // raised centre
    { type: "lathe", rot: [90, 0, 0], at: [0, 5, -58], pts: [[5.5, 0], [8, 0], [8, 18], [9.5, 19], [9.5, 21], [8, 22], [5.5, 22]] }, // hose spigot, points back
    { type: "box", size: [16, 8, 6], r: 1, at: [0, 4, -36] } ] };

  D3_MODELS["CMS-BLCK0019"] = {
    id: "CMS-BLCK0019", title: "Cylinder head cover", units: "mm", page: "BLCK0019",
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL cylinder head cover page; bolt and cap counts come from GS750 owners, bolt sizes from the Suzuki part numbers. Shapes and sizes are typical 1970s DOHC inline-four proportions, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [1.1, .95, 1.3], up: [0, 1, 0] },
    notModelled: "All ten refs are drawn. Refs 2-1 and 2-2 are the same cover gasket under successive part numbers, so one gasket stands for both. The cylinder head, camshafts and the half-moon plugs under the end caps are on other pages and aren't drawn. The cover is shown on its own, gasket face at the bottom. Which of the two breather covers (refs 6 and 9) is the outer one isn't clear from the parts list; here ref 6 is the outer lid with the hose outlet and ref 9 is the inner baffle plate over the separator.",
    stages: [
      { t: "Gasket into the cover", d: "Clean both faces and press a new gasket into the groove in the cover flange. Sealant at the cam end half-moons: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Cover onto the head, cover bolts", d: "Lower the cover straight down onto the head without pinching the gasket. Fit the twelve bolts. Tightening order and torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Separator and baffle plate", d: "Drop the oil breather separator into the chamber on top of the cover, then lay the inner breather plate over it." },
      { t: "Breather gasket and cover", d: "Fit a new gasket on the chamber rim and set the outer breather cover on it with the hose outlet pointing back toward the air box." },
      { t: "Breather cover bolts", d: "Fit the four bolts through the breather cover into the chamber. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "End caps", d: "Fit the four round caps over the cam ends, two on each side of the cover." },
      { t: "End cap screws", d: "Fit two screws through the ears of each cap. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    ],
    parts: [
      { id: "cover", shell: true, ref: "1", name: "Cylinder head cover", mat: "alu", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, -1, 0], geom: cover },
      { id: "gasket", ref: "2", name: "Cylinder head cover gasket", mat: "rubber", small: true, parent: "cover", stage: 1, A: [0, 0, 0], E: [0, -70, 0], dir: [0, 1, 0],
        geom: { type: "tube", pts: loop, r: 2.4 } },
      { id: "bolts", ref: "3", name: "Cover bolts 6 x 40", mat: "zinc", small: true, parent: "cover", stage: 2, count: 12, A: [0, 28, 0], E: [0, 135, 0], dir: [0, -1, 0],
        geom: { type: "array", pos: BOLTS, item: boltHex(40) } },
      { id: "separator", ref: "10", name: "Oil breather separator", mat: "steel", parent: "cover", stage: 3, A: [0, 50.5, PZ], E: [0, 172, PZ], dir: [0, -1, 0],
        geom: { type: "group", items: [{ type: "box", size: [64, 2, 44], r: .5, at: [0, 1, 0] }, ...sepFins] } },
      { id: "plate", ref: "9", name: "Breather cover, inner baffle plate", mat: "steel", parent: "cover", stage: 3, A: [0, 62.5, PZ], E: [0, 205, PZ], dir: [0, -1, 0],
        geom: flat({ type: "extrude", pts: plateOutline.map(([x, z]) => [x, -z]), depth: 1.6, bevel: .2, holes: [[-20, 0, 3], [-10, 0, 3], [0, 0, 3], [10, 0, 3], [20, 0, 3]] }, .2) },
      { id: "bgasket", ref: "7", name: "Breather cover gasket", mat: "rubber", small: true, parent: "cover", stage: 4, A: [0, 64.5, PZ], E: [0, 232, PZ], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "box", size: [100, .8, 6], r: .3, at: [0, .4, 33] }, { type: "box", size: [100, .8, 6], r: .3, at: [0, .4, -33] },
          { type: "box", size: [6, .8, 60], r: .3, at: [47, .4, 0] }, { type: "box", size: [6, .8, 60], r: .3, at: [-47, .4, 0] } ] } },
      { id: "bcover", shell: true, ref: "6", name: "Breather cover (outer, with hose outlet)", mat: "alu", parent: "cover", stage: 4, A: [0, 65.3, PZ], E: [0, 262, PZ], dir: [0, -1, 0], geom: breatherCover },
      { id: "bbolts", ref: "8", name: "Breather cover bolts 6 x 25", mat: "zinc", small: true, parent: "bcover", stage: 5, count: 4, A: [0, 70.3, PZ], E: [0, 330, PZ], dir: [0, -1, 0],
        geom: { type: "array", pos: BB, item: boltHex(25) } },
      { id: "capsR", ref: "4", name: "Cam end caps, right side", mat: "chrome", parent: "cover", stage: 6, count: 2, A: [CEND, CY, 0], E: [CEND + 80, CY, 0], dir: [-1, 0, 0], geom: capPair },
      { id: "capsL", ref: "4", name: "Cam end caps, left side", mat: "chrome", parent: "cover", stage: 6, count: 2, A: [-CEND, CY, 0], E: [-CEND - 80, CY, 0], dir: [1, 0, 0],
        geom: { type: "group", rot: [0, 180, 0], items: [capPair] } },
      { id: "screwsR", ref: "5", name: "End cap screws 5 x 12, right side", mat: "zinc", small: true, parent: "capsR", stage: 7, count: 4, A: [CEND + 4, CY, 0], E: [CEND + 150, CY, 0], dir: [-1, 0, 0],
        geom: { type: "group", rot: [0, 180, 0], items: [screwSet] } },
      { id: "screwsL", ref: "5", name: "End cap screws 5 x 12, left side", mat: "zinc", small: true, parent: "capsL", stage: 7, count: 4, A: [-CEND - 4, CY, 0], E: [-CEND - 150, CY, 0], dir: [1, 0, 0], geom: screwSet },
    ],
  };
})();
