/* ============ 3D parts model: generator (alternator), GS750B 1977 (CMSNL BLCK0041) ============
   Mechanical data only. Units: millimetres.
   World frame: the same as the crankshaft model (DG-EN-02): crank axis = X (+X toward the right / clutch side), crank axis
   through the origin, +Y up, +Z forward. The generator sits on the left crank end (-X). In DG-EN-02 the left oil seal sits at
   X = -175..-183 and the alternator taper runs out to about X = -240, so the rotor hub is put on X = -188..-240.
   u below means distance outward along -X (u = -x). Parts are built round a local Y axis (local y = u) and turned onto the
   crank axis with rot [0, 0, 90], which sends local +Y to world -X, local x to world Y and local z to world Z.
   The stator lives inside the left generator cover (not on this page, not drawn); the cover's inner face is taken as u = 245.
   Every part's geometry is laid out in world coordinates, so every A is [0, 0, 0] and E is the exploded offset.
   Identity, numbering and layout: CMSNL generator page (refs 1-14) and its picture.
   Geometry: APPROXIMATE. Rotor about 120 mm across, 12-pole stator, lead route and clamp shapes are typical for a 1970s
   Suzuki four, not measured from a GS750. Fastener sizes come from the Suzuki part numbers (02112-05308 = 5 x 30 etc.). */
(() => {
  const R3 = v => +v.toFixed(3);
  const AX = items => ({ type: "group", items, rot: [0, 0, 90] });          // local Y axis -> world -X (u outward)
  const lath = (pts, mat) => ({ type: "lathe", pts, ...(mat ? { mat } : {}) });
  const ring = (ri, ro, u0, u1, mat) => lath([[ri, u0], [ro, u0], [ro, u1], [ri, u1]], mat);
  const polar = (n, R, a0 = 0) => Array.from({ length: n }, (_, i) => { const a = a0 + i / n * Math.PI * 2; return [R3(R * Math.cos(a)), 0, R3(R * Math.sin(a)), R3(-(a * 180 / Math.PI))]; });

  // ---- rotor (refs 3 / 6): cup open outward, tapered hub on the crank end, magnets round the inside of the rim ----
  const rotor = AX([
    lath([[13.6, 188], [22, 188], [22, 192], [60, 192], [60.8, 193], [60.8, 231], [60, 232.4], [54.5, 232.4], [54.5, 197.5], [24, 197.5], [22, 200], [22, 239], [21, 240], [12.4, 240], [12.4, 236], [11, 236]]),
    { type: "array", pos: polar(6, 51.2, Math.PI / 6), item: { type: "box", size: [6.4, 28, 34], r: 1, at: [0, 214, 0], mat: "dark" } }, // magnets
    { type: "array", pos: polar(6, 38, 0), item: { type: "cyl", r: 4.5, h: 1, at: [0, 191.8, 0], mat: "black" } },                       // lightening holes in the back plate
    ring(6.2, 11, 236, 236.6, "black"),                                                                                               // threaded hole mouth
  ]);

  // ---- stator (refs 2 / 5): 12-pole core with coils, mounting ring with three screw bosses, output lead with grommet ----
  const SCR_R = 31, SCR_A = [90, 210, 330].map(a => a * Math.PI / 180);
  const pole = { type: "group", items: [
    { type: "box", size: [12, 14, 7], r: .5, at: [40, 215, 0], mat: "steel" },        // tooth
    { type: "box", size: [3.2, 15, 13], r: .6, at: [44.2, 215, 0], mat: "steel" },     // pole shoe
    { type: "box", size: [8.5, 22, 14], r: 3.2, at: [38.5, 215, 0], mat: "brass" },     // winding
  ] };
  const lead = { type: "tube", r: 3.8, mat: "black", pts: [
    [-224, -36, 0], [-233, -40, 0], [-239, -50, 2], [-240, -66, 4], [-240, -78, 10], [-240, -84, 20], [-240, -84, 30], [-240, -84, 40],
    [-240, -80, 58], [-240, -70, 82], [-240, -54, 98], [-240, -40, 100], [-240, -30, 100], [-240, -20, 100], [-240, 0, 101], [-241, 22, 101], [-244, 40, 100], [-248, 54, 99]] };
  const grommet = { type: "lathe", pts: [[3.8, 0], [7.5, 0], [7.5, 3], [6, 3], [6, 8], [7.5, 8], [7.5, 12], [3.8, 12]], rot: [-14, 0, 0], at: [-248, 46, 99], mat: "rubber" };
  const stator = { type: "group", items: [
    AX([
      lath([[27, 206], [36, 206], [36, 210], [34.5, 210], [34.5, 220], [36, 220], [36, 224], [27, 224]]),           // core ring / mounting ring
      { type: "array", pos: SCR_A.map(a => [R3(SCR_R * Math.cos(a)), 0, R3(SCR_R * Math.sin(a))]), item: lath([[2.8, 205.4], [6, 205.4], [6, 206.2], [2.8, 206.2]], "black") }, // screw holes
      { type: "array", pos: polar(12, 0, 0).map((p, i) => [0, 0, 0, R3(-i * 30 - 15)]), item: pole },
    ]),
    lead, grommet,
  ] };

  // ---- fasteners on the crank axis ----
  // bolt 9 (12 x 45) through the rotor hub into the crank end, lock washer 10 under the head
  const bolt9 = AX([
    lath([[0, 198], [5.4, 198], [6, 199], [6, 243], [0, 243]]),
    { type: "hex", af: 17, h: 7.5, y: 243.4 },
    ring(6, 11, 243, 243.6),
  ]);
  const washer10 = AX([{ type: "clip", R: 8.6, r: 1.5, gap: .35, at: [0, 241.5, 0] }]);

  // stator screws 7 (5 x 30, pan head) put in from the crank side, out through the stator into the cover bosses; lock washers 8 under the heads
  const screw7 = a => ({ type: "group", at: [R3(SCR_R * Math.cos(a)), 0, R3(SCR_R * Math.sin(a))], items: [
    lath([[0, 200.3], [3.4, 200.3], [4.4, 201.2], [4.4, 204.5], [0, 204.5]]),
    lath([[0, 204.5], [2.5, 204.5], [2.5, 234], [2, 234.5], [0, 234.5]]),
    { type: "box", size: [6, 1.1, 1.1], r: .2, at: [0, 200.4, 0], mat: "black" },
    { type: "box", size: [1.1, 1.1, 6], r: .2, at: [0, 200.4, 0], mat: "black" },
  ] });
  const screws7 = AX(SCR_A.map(screw7));
  const washers8 = AX(SCR_A.map(a => ({ type: "clip", R: 3.6, r: .75, gap: .35, at: [R3(SCR_R * Math.cos(a)), 205.5, R3(SCR_R * Math.sin(a))] })));

  // ---- lead clamps against the inside of the cover (cover face at x = -245) ----
  // clamp 13: P-shaped strap round the lead where it runs forward along the bottom; one 6 mm screw (14) into the cover
  const C13 = [-240, -84], C13Z = 30;
  const ringXY = (cx, cy, ro, ri, n = 32) => ({ pts: Array.from({ length: n }, (_, i) => { const t = i / n * Math.PI * 2; return [R3(cx + ro * Math.cos(t)), R3(cy + ro * Math.sin(t))]; }), holes: [[cx, cy, ri]] });
  const clamp13 = { type: "group", items: [
    { type: "extrude", ...ringXY(C13[0], C13[1], 5.6, 4), depth: 16, bevel: 0, at: [0, 0, C13Z - 8] },
    { type: "extrude", pts: [[-245.4, -84], [-244, -84], [-244, -66], [-245.4, -66]], depth: 16, bevel: 0, at: [0, 0, C13Z - 8] },
  ] };
  const screw14 = { type: "group", items: [
    { type: "lathe", pts: [[0, -12], [2.9, -12], [2.9, 0], [0, 0]] },
    { type: "lathe", pts: [[0, 0], [5.2, 0], [5.2, 2.6], [3.6, 4], [0, 4]] },
    { type: "box", size: [7, 1.2, 1.2], r: .2, at: [0, 3.8, 0], mat: "black" } ], rot: [0, 0, -90], at: [-244, -71, C13Z] };
  // clamp 11: small tab round the lead where it runs up the front; one 5 mm screw (12) into the cover
  const C11 = [-240, 100], C11Y = -30;
  const clamp11 = { type: "group", rot: [-90, 0, 0], at: [0, C11Y - 6, 0], items: [   // drawn as (x, -z), extruded up along +Y
    { type: "extrude", ...ringXY(C11[0], -C11[1], 5.4, 3.9), depth: 12, bevel: 0 },
    { type: "extrude", pts: [[-245.4, -100], [-244, -100], [-244, -82], [-245.4, -82]], depth: 12, bevel: 0 },
  ] };
  const screw12 = { type: "group", items: [
    { type: "lathe", pts: [[0, -6], [2.5, -6], [2.5, 0], [0, 0]] },
    { type: "lathe", pts: [[0, 0], [4.4, 0], [4.4, 2.4], [3, 3.6], [0, 3.6]] },
    { type: "box", size: [6, 1.1, 1.1], r: .2, at: [0, 3.4, 0], mat: "black" } ], rot: [0, 0, -90], at: [-244, C11Y, 88] };

  const Z = [0, 0, 0], X = x => [x, 0, 0];
  const SE = -200;                                          // stator exploded outward along the crank axis
  const P = [
    { id: "rotor", ref: "3, 6", name: "Generator rotor (flywheel magneto)", mat: "steel", stage: 1, A: Z, E: X(-60), dir: [1, 0, 0], geom: rotor },
    { id: "washer10", ref: "10", name: "Lock washer, 12 mm (rotor bolt)", mat: "spring", small: true, parent: "rotor", stage: 2, A: Z, E: X(-262), dir: [1, 0, 0], geom: washer10 },
    { id: "bolt9", ref: "9", name: "Bolt 12 x 45 (rotor to crank)", mat: "zinc", small: true, parent: "rotor", stage: 2, A: Z, E: X(-330), dir: [1, 0, 0], geom: bolt9 },
    { id: "stator", ref: "2, 5", name: "Generator stator with output lead", mat: "steel", stage: 5, A: Z, E: X(SE), dir: [1, 0, 0], geom: stator },
    { id: "screws7", ref: "7", name: "Screws 5 x 30 (stator to cover)", mat: "zinc", small: true, parent: "stator", stage: 3, A: Z, E: X(SE + 70), dir: [-1, 0, 0], count: 3, geom: screws7 },
    { id: "washers8", ref: "8", name: "Lock washers, 5 mm (stator screws)", mat: "spring", small: true, parent: "stator", stage: 3, A: Z, E: X(SE + 25), dir: [-1, 0, 0], count: 3, geom: washers8 },
    { id: "clamp13", ref: "13", name: "Lead wire clamp (lower)", mat: "steel", small: true, parent: "stator", stage: 4, A: Z, E: X(SE + 55), dir: [-1, 0, 0], geom: clamp13 },
    { id: "screw14", ref: "14", name: "Screw 6 x 10 (lower lead clamp)", mat: "zinc", small: true, parent: "clamp13", stage: 4, A: Z, E: X(SE + 95), dir: [-1, 0, 0], geom: screw14 },
    { id: "clamp11", ref: "11", name: "Lead wire clamp (front)", mat: "steel", small: true, parent: "stator", stage: 4, A: Z, E: X(SE + 55), dir: [-1, 0, 0], geom: clamp11 },
    { id: "screw12", ref: "12", name: "Screw 5 x 6 (front lead clamp)", mat: "zinc", small: true, parent: "clamp11", stage: 4, A: Z, E: X(SE + 95), dir: [-1, 0, 0], geom: screw12 },
  ];

  D3_MODELS["CMS-BLCK0041"] = {
    id: "CMS-BLCK0041", title: "Generator", units: "mm", page: "BLCK0041",
    accuracy: "Approximate geometry. Part identity, numbering and the exploded layout follow the CMSNL generator page and its picture. Sizes are typical for a 1970s Suzuki four, not measured from a GS750: rotor about 120 mm across, 12-pole stator, lead route and clamp shapes are a best reading of the picture. Screw sizes are read from the Suzuki part numbers. Use the factory service manual for every dimension.",
    view: { dir: [-1.1, .55, .95], up: [0, 1, 0] },
    notModelled: "Refs 1 and 4 (generator assembly) are the stator and rotor sold together, not separate pieces. Refs 2-1/2-2 and 5 are early and late versions of the same stator, and 3-1/3-2 and 6 the same for the rotor, so one of each is drawn. The left generator cover the stator, screws and clamps fix into is on another page and is not drawn, nor is the crankshaft.",
    stages: [
      { t: "Rotor onto the crank", d: "Wipe the crank taper and the rotor bore clean and dry, line up the key if fitted, and push the rotor onto the left end of the crank." },
      { t: "Rotor bolt", d: "Fit the 12 mm lock washer and the rotor bolt. Hold the rotor and tighten. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Stator into the cover", d: "Set the stator in the left generator cover and fit the three screws with their lock washers from the inside. A drop of thread lock is common here; VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Lead clamps", d: "Lay the output lead in its path along the cover and fit the two clamps and their screws so the wire can't touch the rotor." },
      { t: "Cover on", d: "Fit a new cover gasket and offer the cover up over the rotor so the stator slides into the rotor cup. Bolt the cover down and plug in the lead." },
    ],
    parts: P,
  };
})();
