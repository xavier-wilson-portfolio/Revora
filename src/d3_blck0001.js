/* ============ 3D parts model: air cleaner, GS750B 1977 (CMSNL BLCK0001) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: +X = rider's LEFT, +Y up, +Z forward (same as d3_fork.js, no mirrorX).
   The airbox sits behind the carburettors; its front face is the plane Z = 0, centre of the box at (0, 0, -85).
   The four intake axes run straight fore-aft at Y = 20, X = -114, -42, +42, +114 (cylinders 1-4 from rider's right to left;
   pitch is an estimate, not measured). The carburettors (not on this page) fill the gap from Z = 60 to Z = 170,
   and the cylinder head intake face is at Z = 215.
   Identity and numbering: CMSNL air cleaner page and its picture (layout follows the picture).
   Geometry: APPROXIMATE. No dimension here is a factory figure apart from the O-ring size printed in the catalogue
   (2.4 mm section, 31.7 mm ID). Check everything against the factory service manual. */
const D3_BLCK0001 = (() => {
  const XS = [-114, -42, 42, 114];          // intake axes (estimated)
  const IY = 20;                             // intake axis height
  const toZ = [90, 0, 0];                    // turns a Y-axis lathe so it points forward along +Z
  // left cover outline [z, y] relative to the case centre: the case side profile inset by about 4 mm
  const CO = [[81, -68], [81, 68], [53, 86], [-63, 86], [-81, 68], [-81, -38], [-43, -86], [63, -86]];
  return {
  id: "CMS-BLCK0001", title: "Air cleaner", units: "mm", page: "BLCK0001",
  accuracy: "Approximate geometry. Part identity, numbering and layout follow the CMSNL air cleaner picture. Sizes are estimated from typical 1970s 750cc proportions, not measured from a GS750. The carburettors and cylinder head sit between and beyond these parts but are on other pages, so the gap between the rubber hoses and the intake pipes is where the carbs go. Use the factory service manual for every dimension.",
  view: { dir: [1, .8, 1.1], up: [0, 1, 0] },
  notModelled: "Refs 1-1 and 1-2 are the same air cleaner case under two part numbers (superseded), so one case is drawn as ref 1. The carburettors, frame and cylinder head are on other pages and are not drawn.",
  stages: [
    { t: "O-rings into the intake pipes", d: "Fit a new O-ring into the groove on the face of each intake pipe flange." },
    { t: "Intake pipes onto the head", d: "Hold each intake pipe against its port on the cylinder head with the O-ring in place." },
    { t: "Intake pipe screws and clamps", d: "Fit the two screws in each flange and tighten them evenly. Slip a clamp loosely over the rubber end of each pipe, ready for the carburettor. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Air cleaner case mounting", d: "With the case in the frame and the carbs fitted, put the flat washer and lock washer on the mounting bolt and fit it through the tab on top of the case." },
    { t: "Hoses and clamps", d: "Push the four rubber hoses onto the spigots on the front of the case and over the carb intakes. Tighten a clamp around the carb end of each hose." },
    { t: "Filter onto its frame", d: "Slide the foam filter over the element frame. Clean or oil it as the manual says: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Element into the case", d: "Slide the element into the case from the left side until the end plate sits against the case." },
    { t: "Element screw", d: "Fit the screw and lock washer that hold the element end plate to the case." },
    { t: "Left cover", d: "Fit the left cover over the end of the case and secure it with its screw and lock washer." },
    { t: "Cap", d: "Fit the cap on the right-hand end of the case with its tapping screw. Don't overtighten into the plastic." },
    { t: "Breather hose", d: "Push the breather hose onto the nipple on top of the case and run it forward to the engine breather. Fit a clip at each end and the strap clamp around the middle of the hose." },
  ],
  parts: [
    // ---------- case (base) ----------
    { id: "case", shell: true, ref: "1", name: "Air cleaner case", mat: "dark", stage: 0, A: [0, 0, -85], E: [0, 0, -85], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "extrude", pts: [[-85, -70], [-85, 70], [-55, 90], [65, 90], [85, 70], [85, -40], [45, -90], [-65, -90]], depth: 324, bevel: 3, rot: [0, 90, 0], at: [-162, 0, 0] }, // side profile, pushed across
        { type: "box", size: [334, 6, 174], r: 2, at: [0, 32, 0] },                                  // lid joint flange
        { type: "array", pos: XS.map(x => [x, IY, 83]), item: { type: "cyl", r: 28.5, h: 12, axis: "z" } }, // hose spigots
        { type: "array", pos: XS.map(x => [x, IY, 94.5]), item: { type: "cyl", r: 24, h: .8, axis: "z", mat: "black" } }, // openings
        { type: "cyl", r: 6, h: 19, axis: "x", at: [164, -66, 70] },                                 // boss for the cover screw
        { type: "cyl", r: 5, h: 18, at: [-40, 90, 25] },                                              // breather nipple
        { type: "extrude", pts: [[-15, -20], [15, -20], [15, 8], [8, 15], [-8, 15], [-15, 8]], holes: [[0, 0, 4]], depth: 8, rot: [0, 90, 0], at: [40, 110, -50] }, // mounting tab
      ] } },

    // ---------- intake pipes at the head ----------
    { id: "pipe", ref: "16", name: "Intake pipes", mat: "rubber", count: 4, stage: 2, A: [0, IY, 170], E: [0, IY, 300], dir: [0, 0, 1],
      geom: { type: "array", pos: XS.map(x => [x, 0, 0]), item: { type: "group", items: [
        { type: "lathe", pts: [[16, 0], [22, 0], [22, 3], [23.6, 5], [22, 8], [22, 35], [16, 35]], rot: toZ },
        { type: "extrude", pts: [[-14, -40], [14, -40], [22, -30], [22, 30], [14, 40], [-14, 40], [-22, 30], [-22, -30]], holes: [[0, 0, 14], [0, 28, 3.3], [0, -28, 3.3]], depth: 9, bevel: .6, at: [0, 0, 35.4], mat: "alu" },
      ] } } },
    { id: "oring", ref: "17", name: "O-rings (intake pipe)", mat: "rubber", small: true, count: 4, parent: "pipe", stage: 1, A: [0, IY, 214.6], E: [0, IY, 370], dir: [0, 0, -1],
      geom: { type: "array", pos: XS.map(x => [x, 0, 0]), item: { type: "torus", R: 17.05, r: 1.2, rot: toZ } } },
    { id: "screw19", ref: "19", name: "Screws (intake pipe flange)", mat: "zinc", small: true, count: 8, parent: "pipe", stage: 3, A: [0, IY, 205], E: [0, IY, 250], dir: [0, 0, 1],
      geom: { type: "array", pos: XS.flatMap(x => [[x, 28, 0], [x, -28, 0]]), item: { type: "lathe", pts: [[0, -4], [4.6, -4], [5, -3], [5, 0], [3, 0], [3, 22], [0, 22]], rot: toZ } } },
    { id: "clamp18", ref: "18", name: "Clamps (intake pipe to carburettor)", mat: "zinc", small: true, count: 4, parent: "pipe", stage: 3, A: [0, IY, 180], E: [0, IY, 215], dir: [0, 0, 1],
      geom: { type: "array", pos: XS.map(x => [x, 0, 0]), item: { type: "group", items: [
        { type: "ring", ro: 23.8, ri: 22.2, h: 8, rot: toZ },
        { type: "box", size: [8, 10, 8], r: 1, at: [27, 0, 4] },
        { type: "cyl", r: 2, h: 14, axis: "y", at: [27.5, -7, 4], mat: "steel" },
      ] } } },

    // ---------- case mounting bolt ----------
    { id: "washer13", ref: "13", name: "Washer (case mounting bolt)", mat: "zinc", small: true, parent: "case", stage: 4, A: [48, 110, -135], E: [200, 110, -135], dir: [-1, 0, 0],
      geom: { type: "ringX", ro: 8, ri: 3.2, h: 1.6 } },
    { id: "lock12", ref: "12", name: "Lock washer (case mounting bolt)", mat: "spring", small: true, parent: "case", stage: 4, A: [49.6, 110, -135], E: [222, 110, -135], dir: [-1, 0, 0],
      geom: { type: "ring", ro: 6, ri: 3.2, h: 2, split: true, rot: [0, 0, -90] } },
    { id: "bolt11", ref: "11", name: "Bolt (case mounting)", mat: "zinc", small: true, parent: "case", stage: 4, A: [51.6, 110, -135], E: [270, 110, -135], dir: [-1, 0, 0],
      geom: { type: "group", rot: [0, 0, 90], items: [
        { type: "hex", af: 10, h: 6, y: -6 },
        { type: "cyl", r: 3, h: 25 },
      ] } },

    // ---------- hoses between case and carbs ----------
    { id: "hose10", ref: "10", name: "Hoses (case to carburettors)", mat: "rubber", count: 4, parent: "case", stage: 5, A: [0, IY, 0], E: [0, IY, 80], dir: [0, 0, -1],
      geom: { type: "array", pos: XS.map(x => [x, 0, 0]), item: { type: "lathe", rot: toZ, pts: [
        [28.7, 0], [33.5, 0], [33.5, 6], [32, 9], [32, 40], [34, 42], [34, 45], [32, 46], [32, 56], [34, 57], [34, 60], [25.2, 60], [25.2, 13], [28.7, 11]] } } },
    { id: "clamp20", ref: "20", name: "Clamps (hose to carburettor)", mat: "zinc", small: true, count: 4, parent: "hose10", stage: 5, A: [0, IY, 46.5], E: [0, IY, 166], dir: [0, 0, -1],
      geom: { type: "array", pos: XS.map(x => [x, 0, 0]), item: { type: "group", items: [
        { type: "ring", ro: 33.6, ri: 32.1, h: 9, rot: toZ },
        { type: "box", size: [10, 8, 9], r: 1, at: [0, 36.5, 4.5] },
        { type: "cyl", r: 2, h: 16, axis: "x", at: [-8, 37, 4.5], mat: "steel" },
      ] } } },

    // ---------- element ----------
    { id: "element", ref: "2", name: "Air cleaner element (frame and end plate)", mat: "zinc", parent: "case", stage: 7, A: [0, 0, -85], E: [330, 0, -85], dir: [-1, 0, 0],
      geom: { type: "group", items: [
        { type: "box", size: [300, 96, 116], r: 4, at: [10, 0, 0] },
        { type: "array", pos: [[-90, 0, 0], [-30, 0, 0], [30, 0, 0], [90, 0, 0]], item: { type: "box", size: [4, 100, 120], r: 1, mat: "steel" } }, // frame ribs
        { type: "box", size: [6, 108, 128], r: 3, at: [166, 0, 0], mat: "dark" },     // end plate
        { type: "box", size: [4, 14, 22], r: 2, at: [171, 0, 0], mat: "dark" },        // finger grip
      ] } },
    { id: "filter", ref: "3", name: "Filter (foam)", mat: "rubber", parent: "element", stage: 6, A: [12, 0, -85], E: [342, 190, -85], dir: [0, -1, 0],
      geom: { type: "box", size: [292, 104, 124], r: 6 } },
    { id: "washer5", ref: "5", name: "Lock washer (element screw)", mat: "spring", small: true, parent: "element", stage: 8, A: [169, 48, -85], E: [514, 48, -85], dir: [-1, 0, 0],
      geom: { type: "ring", ro: 5.6, ri: 3.2, h: 2, split: true, rot: [0, 0, -90] } },
    { id: "screw4", ref: "4", name: "Screw (element)", mat: "zinc", small: true, parent: "element", stage: 8, A: [171, 48, -85], E: [531, 48, -85], dir: [-1, 0, 0],
      geom: { type: "screwX", head: 4.5, headR: 5.5, len: 12, r: 3, rot: [0, 180, 0] } },

    // ---------- left cover ----------
    { id: "cover", shell: true, ref: "7", name: "Left cover", mat: "black", parent: "case", stage: 9, A: [169, 0, -85], E: [559, 0, -85], dir: [-1, 0, 0],
      geom: { type: "group", items: [
        { type: "extrude", pts: CO.map(([z, y]) => [-z, y]), depth: 3, bevel: .6, rot: [0, 90, 0], at: [14, 0, 0] },              // face
        ...CO.map((a, k) => { const b = CO[(k + 1) % CO.length], dz = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dz, dy);       // skirt
          return { type: "box", size: [14, 3, L + 2], r: 1, rot: [Math.atan2(-dy, dz) * 180 / Math.PI, 0, 0], at: [7, (a[1] + b[1]) / 2, (a[0] + b[0]) / 2] }; }),
        { type: "extrude", pts: CO.map(([z, y]) => [-z * .7 + 6, y * .7 + 8]), depth: 2, bevel: .5, rot: [0, 90, 0], at: [17, 0, 0] }, // raised panel
      ] } },
    { id: "washer9", ref: "9", name: "Lock washer (cover screw)", mat: "spring", small: true, parent: "cover", stage: 9, A: [186, -66, -15], E: [598, -66, -15], dir: [-1, 0, 0],
      geom: { type: "ring", ro: 5, ri: 2.7, h: 2, split: true, rot: [0, 0, -90] } },
    { id: "screw8", ref: "8", name: "Screw (left cover)", mat: "zinc", small: true, parent: "cover", stage: 9, A: [188, -66, -15], E: [628, -66, -15], dir: [-1, 0, 0],
      geom: { type: "screwX", head: 4, headR: 5, len: 18, r: 2.5, rot: [0, 180, 0] } },

    // ---------- right end cap ----------
    { id: "cap", ref: "6", name: "Cap (right end of case)", mat: "black", parent: "case", stage: 10, A: [-169, 50, -40], E: [-209, 50, -40], dir: [1, 0, 0],
      geom: { type: "box", size: [4, 40, 60], r: 1.5, at: [2, 0, 0] } },
    { id: "screw21", ref: "21", name: "Tapping screw (cap)", mat: "zinc", small: true, parent: "cap", stage: 10, A: [-169, 50, -40], E: [-239, 50, -40], dir: [1, 0, 0],
      geom: { type: "screwX", head: 3.5, headR: 4.5, len: 12, r: 2 } },

    // ---------- breather ----------
    { id: "hose14", ref: "14", name: "Breather hose", mat: "rubber", parent: "case", stage: 11, A: [-40, 96, -60], E: [-40, 246, -60], dir: [0, -1, 0],
      geom: { type: "tube", r: 8, pts: [[0, 0, 0], [0, 30, 8], [0, 48, 60], [0, 46, 140], [0, 30, 220], [0, 14, 262]] } },
    { id: "clip15", ref: "15", name: "Clips (breather hose)", mat: "spring", small: true, count: 2, parent: "hose14", stage: 11, A: [-40, 96, -60], E: [-40, 356, -60], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "clip", R: 9.4, r: 1.3, gap: .5, at: [0, 6, 0] },
        { type: "clip", R: 9.4, r: 1.3, gap: .5, rot: [111, 0, 0], at: [0, 18, 252] },
      ] } },
    { id: "clamp22", ref: "22", name: "Strap clamp (breather hose)", mat: "zinc", small: true, parent: "hose14", stage: 11, A: [-40, 96, -60], E: [-130, 246, -60], dir: [1, 0, 0],
      geom: { type: "group", items: [
        { type: "ring", ro: 9.9, ri: 8.3, h: 12, rot: toZ, at: [0, 48.5, 94] },
        { type: "box", size: [1.6, 34, 12], r: .5, at: [9.1, 31, 100] },
        { type: "box", size: [1.6, 34, 12], r: .5, at: [-9.1, 31, 100] },
        { type: "box", size: [20, 1.6, 12], r: .5, at: [0, 13.2, 100] },
      ] } },
  ],
  };
})();
D3_MODELS["CMS-BLCK0001"] = D3_BLCK0001;
