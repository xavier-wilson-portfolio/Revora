/* ============ 3D parts model: front wheel, GS750B 1977 (CMSNL BLCK0034) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: +X along the axle toward the right side of the bike (disc side, axle nut end), origin on the axle at the
   middle of the hub. +Y up, +Z forward. The wheel turns in the YZ plane.
   Identity and numbering: CMSNL front wheel page (refs 1 to 23).
   Geometry: APPROXIMATE. Real figures used: wheel bearings 6302 (15 x 42 x 13, from Suzuki part no. 08123-63020),
   spacer ref 8 15 x 22 x 30 (catalogue description), axle nut 12 mm and disc bolts 8 mm (catalogue descriptions),
   19 in rim (482.6 mm bead seat diameter) and a 3.25-19 tyre size class. Everything else (hub, flanges, disc diameter,
   spacer lengths, fork spacing) is a typical 1970s 750 proportion, not a factory measurement.
   The axle passes through the fork-leg axle lugs in the gaps at u = -160..-112 (left) and 96..144 (right); the fork
   legs themselves are on the front fork page and aren't drawn here.
   Lathe profiles are [radius, axial] and are turned onto the X axis with rot [0, 0, -90] (lathe Y becomes world +X). */
(() => {
  const AX = [0, 0, -90];                       // lathe axis Y -> world +X
  const RIM_U = -6;                              // rim / tyre centre line on the axle
  const FL = [-43, 31];                          // spoke flange centre planes (left, right)
  const R_HOLE = 56, R_NIP = 231;                // spoke hole circle on the flanges, nipple seat radius in the rim well
  const P = (u, r, deg) => { const a = deg * Math.PI / 180; return [u, r * Math.cos(a), r * Math.sin(a)]; };
  const r2 = v => v.map(n => Math.round(n * 100) / 100);

  // 36 spokes, 18 per flange, laced 3-cross (rim hole 60 deg from the hub hole), heads alternately outside and inside.
  const spokes = [];
  for (let s = 0; s < 2; s++) for (let k = 0; k < 18; k++) {
    const aH = k * 20 + s * 10, aR = aH + (k % 2 ? -60 : 60), out = s ? 1 : -1, headOut = k % 2 === 0;
    const uf = FL[s], hs = headOut ? out : -out;        // side of the flange the head sits on
    const head = P(uf + hs * 4.2, R_HOLE, aH), thru = P(uf - hs * 4.2, R_HOLE, aH), nip = P(RIM_U + (s ? 4 : -4), R_NIP, aR);
    const d = nip.map((v, i) => v - thru[i]), L = Math.hypot(...d), e = d.map(v => v / L);
    const bend = thru.map((v, i) => v + e[i] * 10), nipIn = nip.map((v, i) => v - e[i] * 15);
    spokes.push({ aH, aR, s, thru, e, L, head, nip });
    spokes[spokes.length - 1].items = [
      { type: "tube", pts: [head, thru, bend, nip].map(r2), r: 1.9 },
      { type: "sphere", r: 2.9, at: r2(head) },
      { type: "tube", pts: [nipIn, nip.map((v, i) => v + e[i] * 2)].map(r2), r: 3, mat: "zinc" } ];
  }
  const spokeItems = spokes.flatMap(q => q.items);
  const along = (q, rad) => { const t = (rad - R_HOLE) / (R_NIP - R_HOLE); return q.thru.map((v, i) => v + (q.nip[i] - q.thru[i]) * t); };
  const sp23 = spokes.find(q => q.s === 0 && ((q.aR % 360) + 360) % 360 === 0);    // left-flange spoke ending at the top of the rim
  const sp22 = spokes.find(q => q.s === 1 && ((q.aR % 360) + 360) % 360 === 350);   // right-flange spoke next to it
  const weight = (q, r0, r1, rr) => ({ type: "tube", pts: [r2(along(q, r0)), r2(along(q, (r0 + r1) / 2)), r2(along(q, r1))], r: rr });

  // tyre section 3.25-19 class: bead seat r 241.3, overall radius about 328, section width about 82
  const tyre = (() => { const o = [], i = [];
    for (let n = 0; n <= 24; n++) { const f = -46.7 + (180 + 93.4) * n / 24, a = f * Math.PI / 180; o.push([284 + 44 * Math.sin(a), -41 * Math.cos(a)]); }
    for (let n = 24; n >= 0; n--) { const f = -62.7 + (180 + 125.4) * n / 24, a = f * Math.PI / 180; i.push([284 + 36 * Math.sin(a), -33 * Math.cos(a)]); }
    const pts = [[241, -24.6], [249, -27], ...o.slice(1, -1), [249, 27], [241, 24.6], [241, 15.2], ...i.slice(1, -1), [241, -15.2]];
    return pts.map(r2); })();
  const tubeProf = (() => { const p = []; for (let n = 0; n < 40; n++) { const a = n / 40 * Math.PI * 2; p.push(r2([279 + 39 * Math.cos(a), 31 * Math.sin(a)])); } return p; })();

  const disc = (() => { const p = []; for (let n = 0; n < 96; n++) { const a = n / 96 * Math.PI * 2; p.push(r2([137.5 * Math.cos(a), 137.5 * Math.sin(a)])); } return p; })();
  const shim = (() => { const p = []; for (let n = 0; n < 64; n++) { const a = n / 64 * Math.PI * 2; p.push(r2([60 * Math.cos(a), 60 * Math.sin(a)])); } return p; })();
  const BOLT = [0, 60, 120, 180, 240, 300].map(a => [52 * Math.cos(a * Math.PI / 180), 52 * Math.sin(a * Math.PI / 180)]);  // in the disc's own XY
  const boltHoles = BOLT.map(([x, y]) => [r2([x, y])[0], r2([x, y])[1], 4.3]);
  // disc is extruded along +Z and turned with rot [0, 90, 0]: local (x, y, z) -> world (z, y, -x)
  const boltWorld = BOLT.map(([x, y]) => r2([0, y, -x]));

  const bearing = { type: "group", rot: AX, items: [
    { type: "lathe", pts: [[17.2, 0], [21, 0], [21, 13], [17.2, 13], [17.2, 9.4], [17.7, 6.5], [17.2, 3.6]] },
    { type: "lathe", pts: [[7.5, 0], [11.3, 0], [11.3, 3.6], [10.8, 6.5], [11.3, 9.4], [11.3, 13], [7.5, 13]] },
    { type: "array", pos: Array.from({ length: 8 }, (_, n) => r2([14.25 * Math.cos(n * Math.PI / 4), 6.5, 14.25 * Math.sin(n * Math.PI / 4)])), item: { type: "sphere", r: 3.25 } },
    { type: "ring", ro: 15.4, ri: 13.1, h: 1.6, at: [0, 5.7, 0], mat: "brass" } ] };

  D3_MODELS["DG-CH-02"] = {
    id: "DG-CH-02", title: "Front wheel", units: "mm", page: "BLCK0034",
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL front wheel page. The 6302 bearing size (15 x 42 x 13), the 15 x 22 x 30 spacer, the 12 mm axle nut and the 8 mm disc bolts come from the catalogue; the 19 in rim and 3.25-19 tyre are size class only. Hub, disc, spacer lengths and spoke lacing are typical proportions, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [1.25, .55, .95], up: [0, 1, 0] },
    notModelled: "Every ref is drawn. Ref 1 on this page also lists a cast wheel (1-1) and a drum hub (1-3) for other models; only the wire-spoke hub (1-2) is drawn. Refs 7-2, 13-2, 14-2 and 17-2 are alternative part numbers, so one of each is shown. One disc is drawn on the right. Where spacer 8 (15 x 22 x 30) sits isn't confirmed by the picture available here: it's shown on the axle between the speedometer gearbox and the left fork leg. Check against the CMSNL picture.",
    stages: [
      { t: "Wheel bearings and hub spacer", d: "Drive the left bearing in on its outer race until it seats, drop the hub spacer in from the right, then drive the right bearing in. The bearings must still turn freely." },
      { t: "Lace the hub to the rim", d: "Lace the 36 spokes from the hub flanges to the rim, three-cross, then true the wheel for runout and offset. Runout limits: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Rim band", d: "Fit the rim band in the well so it covers every spoke nipple." },
      { t: "Tube and tyre", d: "Put the tube in the tyre, push the valve through the rim, then lever the beads on. Pressures: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Balance weights", d: "Balance the wheel and clamp the weights on the spokes next to the nipples at the light spot." },
      { t: "Dust seals and hub cover", d: "Press a new dust seal into each end of the hub and fit the right hub cover." },
      { t: "Brake disc", d: "Fit the shim, the disc, the washers and the bolts. Thread locker and torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Speedometer gearbox and spacers", d: "Fit the gearbox to the left side with its drive tangs in the hub slots, then the spacer outside it. Fit the right axle spacer through the right seal." },
      { t: "Axle", d: "With the wheel between the fork legs, slide the axle in from the left through the leg, spacer, gearbox, hub and right spacer." },
      { t: "Nut and cotter pin", d: "Fit the washer and the nut. Torque: VERIFY IN FACTORY SERVICE MANUAL. Line up a slot by tightening, then fit a new cotter pin and bend the legs over." },
    ],
    parts: [
      { id: "hub", ref: "1", name: "Front hub (wire-spoke)", mat: "alu", shell: true, stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, 0, 1],
        geom: { type: "group", items: [
          { type: "lathe", rot: AX, pts: [[24, -58], [28, -58], [28, -47.5], [30, -46], [62, -46], [64, -44.5], [64, -41.5], [62, -40], [33, -40], [31, -35], [30, -20], [30, 20], [32, 25], [35, 28], [62, 28], [64, 29.5],
            [64, 32.5], [62, 34], [44, 34], [44, 38], [60, 38], [62, 40], [62, 56.5], [60.5, 58], [28, 58], [28, 60], [24, 60], [24, 54], [21, 54], [21, 41], [17, 41], [17, -39], [21, -39], [21, -52], [24, -52]] } ] } },
      { id: "bearings", ref: "2", name: "Wheel bearings (6302)", mat: "steel", parent: "hub", stage: 1, A: [0, 0, 0], E: [0, 150, 0], dir: [1, 0, 0], count: 2,
        geom: { type: "pair", at: [[-52, 0, 0], [41, 0, 0]], item: bearing } },
      { id: "spacer3", ref: "3", name: "Hub bearing spacer", mat: "steel", parent: "hub", stage: 1, A: [-39, 0, 0], E: [-39, 215, 0], dir: [1, 0, 0],
        geom: { type: "ring", ro: 10.5, ri: 7.6, h: 80, rot: AX } },
      { id: "rim", ref: "20", name: "Rim (19 in)", mat: "chrome", parent: "hub", stage: 2, A: [RIM_U, 0, 0], E: [140, 620, 0], dir: [0, -1, 0],
        geom: { type: "lathe", rot: AX, pts: [[248, -26], [241, -24.6], [241, -14], [233, -9], [233, 9], [241, 14], [241, 24.6], [248, 26], [247, 23.6], [238.6, 22.4], [238.6, 15.4],
          [230.6, 10.4], [230.6, -10.4], [238.6, -15.4], [238.6, -22.4], [247, -23.6]] } },
      { id: "spokes", ref: "21", name: "Spokes and nipples (36)", mat: "chrome", parent: "hub", stage: 2, A: [0, 0, 0], E: [0, 620, 0], dir: [0, -1, 0], count: 36,
        geom: { type: "group", items: spokeItems } },
      { id: "band", ref: "19", name: "Rim band (tube protector)", mat: "rubber", parent: "rim", stage: 3, A: [RIM_U, 0, 0], E: [250, 620, 0], dir: [0, -1, 0],
        geom: { type: "lathe", rot: AX, pts: [[233, -8.6], [235, -8.6], [235, 8.6], [233, 8.6]] } },
      { id: "tube", ref: "18", name: "Inner tube", mat: "black", parent: "rim", stage: 4, A: [RIM_U, 0, 0], E: [350, 620, 0], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "lathe", rot: AX, pts: tubeProf },
          { type: "cyl", r: 4, h: 44, axis: "y", rot: [95, 0, 0], at: r2([0, 196 * Math.cos(95 * Math.PI / 180), 196 * Math.sin(95 * Math.PI / 180)]), mat: "brass" },
          { type: "cyl", r: 5, h: 12, axis: "y", rot: [95, 0, 0], at: r2([0, 186 * Math.cos(95 * Math.PI / 180), 186 * Math.sin(95 * Math.PI / 180)]), mat: "black" } ] } },
      { id: "tyre", ref: "17", name: "Front tyre (3.25-19 class)", mat: "rubber", parent: "rim", stage: 4, A: [RIM_U, 0, 0], E: [480, 620, 0], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "lathe", rot: AX, pts: tyre },
          ...[-12, 0, 12].map(u => ({ type: "torus", R: 327.7, r: 1.3, rot: [0, 0, 90], at: [u, 0, 0], mat: "dark" })) ] } },
      { id: "wt23", ref: "23", name: "Balance weight (30 g)", mat: "dark", small: true, parent: "spokes", stage: 5, A: [0, 0, 0], E: [0, 740, 0], dir: [0, -1, 0],
        geom: weight(sp23, 186, 216, 5) },
      { id: "wt22", ref: "22", name: "Balance weight (B)", mat: "dark", small: true, parent: "spokes", stage: 5, A: [0, 0, 0], E: [0, 790, 0], dir: [0, -1, 0],
        geom: weight(sp22, 204, 216, 4) },
      { id: "seal11L", ref: "11", name: "Dust seal (speedometer gearbox side)", mat: "rubber", small: true, parent: "hub", stage: 6, A: [-58, 0, 0], E: [-95, 0, 0], dir: [1, 0, 0],
        geom: { type: "lathe", rot: AX, pts: [[11.1, 1.5], [13, 0], [24, 0], [24, 6], [14, 6], [11.1, 4.5]] } },
      { id: "seal11R", ref: "11", name: "Dust seal (right)", mat: "rubber", small: true, parent: "hub", stage: 6, A: [54, 0, 0], E: [90, 0, 0], dir: [-1, 0, 0],
        geom: { type: "lathe", rot: AX, pts: [[11.1, 4.5], [14, 6], [24, 6], [24, 0], [13, 0], [11.1, 1.5]] } },
      { id: "cover", ref: "10", name: "Hub cover (right)", mat: "chrome", shell: true, parent: "hub", stage: 6, A: [58, 0, 0], E: [115, 0, 0], dir: [-1, 0, 0],
        geom: { type: "lathe", rot: AX, pts: [[28.2, 0], [31, 0], [31, 7.5], [29.5, 9], [11.6, 9], [11.6, 2], [28.2, 2]] } },
      { id: "shim", ref: "16", name: "Brake disc shim", mat: "brass", small: true, parent: "hub", stage: 7, A: [58, 0, 0], E: [145, 0, 0], dir: [-1, 0, 0],
        geom: { type: "extrude", pts: shim, holes: [[0, 0, 45], ...boltHoles], depth: 1, bevel: 0, rot: [0, 90, 0] } },
      { id: "disc", ref: "13", name: "Brake disc", mat: "steel", parent: "hub", stage: 7, A: [59, 0, 0], E: [165, 0, 0], dir: [-1, 0, 0],
        geom: { type: "extrude", pts: disc, holes: [[0, 0, 40], ...boltHoles], depth: 7, bevel: .4, rot: [0, 90, 0] } },
      { id: "dwashers", ref: "15", name: "Washers (disc bolts)", mat: "zinc", small: true, parent: "disc", stage: 7, A: [66, 0, 0], E: [200, 0, 0], dir: [-1, 0, 0], count: 6,
        geom: { type: "array", pos: boltWorld, item: { type: "ringX", ro: 8, ri: 4.2, h: 1.6 } } },
      { id: "dbolts", ref: "14", name: "Disc bolts (8 mm)", mat: "zinc", small: true, parent: "disc", stage: 7, A: [67.6, 0, 0], E: [240, 0, 0], dir: [-1, 0, 0], count: 6,
        geom: { type: "array", pos: boltWorld, item: { type: "group", rot: AX, items: [
          { type: "lathe", pts: [[0, -25], [3.4, -25], [4, -24.4], [4, 0], [0, 0]] },
          { type: "hex", af: 12, h: 5.5, y: 0 } ] } } },
      { id: "gearbox", ref: "12", name: "Speedometer gearbox", mat: "alu", parent: "hub", stage: 8, A: [-82, 0, 0], E: [-165, 0, 0], dir: [1, 0, 0],
        geom: { type: "group", items: [
          { type: "lathe", rot: AX, pts: [[7.6, 0], [30, 0], [32, 2.5], [32, 20], [30, 22], [11, 22], [11, 30], [7.6, 30]] },
          { type: "cyl", r: 6.5, h: 34, axis: "y", rot: [-35, 0, 0], at: [11, 0, 0] },
          { type: "hex", af: 14, h: 8, y: 34, hole: 3, rot: [-35, 0, 0], at: [11, 0, 0], mat: "zinc" },
          { type: "box", size: [9, 12, 12], r: 1.5, at: [4.5, -18, -33] } ] } },
      { id: "spacer8", ref: "8", name: "Spacer (15 x 22 x 30)", mat: "steel", parent: "hub", stage: 8, A: [-112, 0, 0], E: [-225, 0, 0], dir: [1, 0, 0],
        geom: { type: "ring", ro: 11, ri: 7.55, h: 30, rot: AX } },
      { id: "spacer7", ref: "7", name: "Axle spacer (right)", mat: "steel", parent: "hub", stage: 8, A: [54, 0, 0], E: [275, 0, 0], dir: [-1, 0, 0],
        geom: { type: "lathe", rot: AX, pts: [[7.55, 0], [11, 0], [11, 15], [14, 16.5], [14, 42], [7.55, 42]] } },
      { id: "axle", ref: "4", name: "Front axle", mat: "steel", parent: "hub", stage: 9, A: [-160, 0, 0], E: [-575, 0, 0], dir: [1, 0, 0],
        geom: { type: "group", rot: AX, items: [
          { type: "hex", af: 22, h: 10, y: -11 },
          { type: "lathe", pts: [[0, -1.2], [12, -1.2], [12, 0], [7.5, 0], [7.5, 299], [6, 301], [6, 326.5], [5, 328], [0, 328]] },
          { type: "holes", y: [316.6], r: 6, d: 3.2 } ] } },
      { id: "washer9", ref: "9", name: "Washer (axle nut)", mat: "zinc", small: true, parent: "axle", stage: 10, A: [144, 0, 0], E: [340, 0, 0], dir: [-1, 0, 0],
        geom: { type: "ring", ro: 12, ri: 6.2, h: 1.6, rot: AX } },
      { id: "nut", ref: "5", name: "Axle nut (12 mm, castle)", mat: "zinc", small: true, parent: "axle", stage: 10, A: [145.6, 0, 0], E: [365, 0, 0], dir: [-1, 0, 0],
        geom: { type: "group", rot: AX, items: [
          { type: "hex", af: 17, h: 9, y: 0, hole: 6 },
          { type: "array", pos: [0, 60, 120, 180, 240, 300].map(a => r2([7.6 * Math.cos((a + 30) * Math.PI / 180), 11, 7.6 * Math.sin((a + 30) * Math.PI / 180), -(a + 30)])), item: { type: "box", size: [2.6, 4, 3.2], r: .4 } } ] } },
      { id: "cotter", ref: "6", name: "Cotter pin", mat: "zinc", small: true, parent: "axle", stage: 10, A: [156.6, 0, 0], E: [405, 0, 0], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "tube", pts: [[0, 10, -.85], [0, -6, -.85], [0, -9.5, -2.5], [0, -11, -7]], r: .85 },
          { type: "tube", pts: [[0, 10, .85], [0, -6, .85], [0, -9.5, 2.5], [0, -11, 7]], r: .85 },
          { type: "torus", R: 2.4, r: .85, rot: [0, 0, 90], at: [0, 12.4, 0] } ] } },
    ],
  };
})();
