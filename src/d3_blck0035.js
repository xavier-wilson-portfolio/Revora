/* ============ 3D parts model: front wheel, cast 5-spoke, GS750EC/EN (CMSNL BLCK0035) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: origin on the axle at the middle of the hub, +X along the axle toward the rider's LEFT (speedometer
   gearbox side, axle head end), +Y up, +Z forward. The wheel turns in the YZ plane. No mirrorX needed.
   Identity, numbering and fitting order: CMSNL front wheel (GS750EC,EN) page and its picture (refs 1 to 17).
   Geometry: APPROXIMATE. Figures taken from the catalogue: rim 19 x MT1.85, 6302 bearings (15 x 42 x 13, from part no.
   08123-63020), spacer ref 8 15 x 22 x 30, 12 mm axle nut, 8 x 25 disc bolts. Hub, spokes, disc diameter, spacer
   lengths and fork-leg spacing are typical 1970s 750 proportions, not measured.
   The fork-leg axle lugs (front fork page, not drawn) sit in the gaps at X = 118..165 (left) and -110..-150 (right).
   Lathe profiles are [radius, axial]; rot AX turns lathe +Y onto world +X, AXN onto world -X. */
const D3_BLCK0035 = (() => {
  const AX = [0, 0, -90], AXN = [0, 0, 90];
  const r2 = v => v.map(n => Math.round(n * 100) / 100);
  const rad = d => d * Math.PI / 180;
  const circ = (r, n) => Array.from({ length: n }, (_, k) => r2([r * Math.cos(k / n * Math.PI * 2), r * Math.sin(k / n * Math.PI * 2)]));

  // ---- cast wheel: hub + 5 spokes + rim, one casting ----
  const hubProf = [[24, -64], [29, -64], [29, -60], [62, -60], [62, -43], [40, -38], [36, -28], [36, 28], [40, 38], [62, 43], [62, 60], [29, 60], [29, 64],
    [24, 64], [24, 57], [21, 57], [21, 44], [17, 44], [17, -44], [21, -44], [21, -57], [24, -57]];
  const rimProf = [[249, -28], [249, -24.5], [241.3, -23], [241.3, -14], [233, -9], [233, 9], [241.3, 14], [241.3, 23], [249, 24.5], [249, 28],
    [244, 28.5], [237, 26], [232, 18], [226, 8], [224, 0], [226, -8], [232, -18], [237, -26], [244, -28.5]];
  // spoke outline in its own plane: x tangential, y radial; extruded along the axle (rot [a, 90, 0] puts local z on world +X)
  const spokeWeb = [[-22, 30], [22, 30], [12, 192], [20, 228], [-20, 228], [-12, 192]];
  const ribL = [[-22, 32], [-16, 32], [-7, 196], [-12, 196]], ribR = ribL.map(([x, y]) => [-x, y]).reverse();
  const SPOKE_A = [0, 72, 144, 216, 288];
  const spokeItems = SPOKE_A.flatMap(a => [
    { type: "extrude", pts: spokeWeb, depth: 10, bevel: 1, rot: [a, 90, 0], at: [-5, 0, 0] },
    { type: "extrude", pts: ribL, depth: 22, bevel: 1, rot: [a, 90, 0], at: [-11, 0, 0] },
    { type: "extrude", pts: ribR, depth: 22, bevel: 1, rot: [a, 90, 0], at: [-11, 0, 0] } ]);

  // ---- tyre (3.25-19 class) and tube, from the wire-wheel model ----
  const tyre = (() => { const o = [], i = [];
    for (let n = 0; n <= 24; n++) { const f = -46.7 + (180 + 93.4) * n / 24, a = rad(f); o.push([284 + 44 * Math.sin(a), -41 * Math.cos(a)]); }
    for (let n = 24; n >= 0; n--) { const f = -62.7 + (180 + 125.4) * n / 24, a = rad(f); i.push([284 + 36 * Math.sin(a), -33 * Math.cos(a)]); }
    return [[241.3, -24.6], [249, -27], ...o.slice(1, -1), [249, 27], [241.3, 24.6], [241.3, 15.2], ...i.slice(1, -1), [241.3, -15.2]].map(r2); })();
  const tubeProf = Array.from({ length: 40 }, (_, n) => { const a = n / 40 * Math.PI * 2; return r2([279 + 37 * Math.cos(a), 30 * Math.sin(a)]); });
  const VALVE = 36;                                         // valve between two spokes

  // ---- brake discs: 6 bolts on a 52 mm radius ----
  const BOLT_A = [0, 60, 120, 180, 240, 300];
  const boltWorld = BOLT_A.map(a => r2([0, 52 * Math.cos(rad(a)), 52 * Math.sin(rad(a))]));
  // disc extruded along +Z then rot [0, 90, 0]: local (x, y) -> world (z = -x, y)
  const discHoles = [[0, 0, 40],
    ...BOLT_A.map(a => [...r2([-52 * Math.sin(rad(a)), 52 * Math.cos(rad(a))]), 4.3]),
    ...BOLT_A.map(a => [...r2([-76 * Math.sin(rad(a + 30)), 76 * Math.cos(rad(a + 30))]), 15])];
  const discGeom = { type: "extrude", pts: circ(137.5, 96), holes: discHoles, depth: 7, bevel: .4, rot: [0, 90, 0] };
  // lock plates: one plate under each pair of bolts, 3 per disc; long axis tangential at the pair's mid angle
  const plateOutline = (() => { const p = []; for (let n = 0; n <= 12; n++) { const a = -Math.PI / 2 + n / 12 * Math.PI; p.push([26 + 7 * Math.cos(a), 7 * Math.sin(a)]); }
    for (let n = 0; n <= 12; n++) { const a = Math.PI / 2 + n / 12 * Math.PI; p.push([-26 + 7 * Math.cos(a), 7 * Math.sin(a)]); } return p.map(r2); })();
  const PLATE_A = [30, 150, 270], RM = 52 * Math.cos(rad(30));
  const plates = x0 => ({ type: "group", items: PLATE_A.flatMap(a => [
    { type: "extrude", pts: plateOutline, holes: [[26, 0, 4.2], [-26, 0, 4.2]], depth: 1.2, bevel: 0, rot: [a, 90, 0], at: r2([x0, RM * Math.cos(rad(a)), RM * Math.sin(rad(a))]) } ]) });
  const bolt = rot => ({ type: "group", rot, items: [
    { type: "lathe", pts: [[0, -25], [3.4, -25], [4, -24.4], [4, 0], [0, 0]] },
    { type: "hex", af: 12, h: 5.5, y: 0 } ] });

  const bearing = { type: "group", rot: AX, items: [
    { type: "lathe", pts: [[17.2, 0], [21, 0], [21, 13], [17.2, 13], [17.2, 9.4], [17.7, 6.5], [17.2, 3.6]] },
    { type: "lathe", pts: [[7.5, 0], [11.3, 0], [11.3, 3.6], [10.8, 6.5], [11.3, 9.4], [11.3, 13], [7.5, 13]] },
    { type: "array", pos: Array.from({ length: 8 }, (_, n) => r2([14.25 * Math.cos(n * Math.PI / 4), 6.5, 14.25 * Math.sin(n * Math.PI / 4)])), item: { type: "sphere", r: 3.25 } },
    { type: "ring", ro: 15.4, ri: 13.1, h: 1.6, at: [0, 5.7, 0], mat: "brass" } ] };

  const WT_A = 216, WT_R = 221;
  const wt = r2([0, WT_R * Math.cos(rad(WT_A)), WT_R * Math.sin(rad(WT_A))]);

  return {
    id: "CMS-BLCK0035", title: "Front wheel (GS750EC, EN, cast)", units: "mm", page: "BLCK0035",
    accuracy: "Approximate geometry. Part identity, numbering and fitting order follow the CMSNL front wheel (GS750EC,EN) page and its picture. Rim 19 x MT1.85, 6302 bearings, the 15 x 22 x 30 spacer, the 12 mm axle nut and 8 x 25 disc bolts come from the catalogue; every other size (hub, spokes, disc diameter, spacer lengths) is a typical proportion, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [1.2, .6, .95], up: [0, 1, 0] },
    notModelled: "Refs 1-1/1-2, 2-1/2-2, 7-1/7-2 and 17-1/17-2 are alternative or superseded part numbers for the same piece, so one of each is drawn. Ref 12 is listed as 'DISC, REAR BRAKE' on this page; the same disc is drawn twice, one each side of the hub. Ref 14 is listed as a washer; it is drawn as a lock plate under each pair of disc bolts, as it looks in the picture (check against your parts). Fork legs and calipers are on other pages.",
    stages: [
      { t: "Wheel bearings and hub spacer", d: "Drive the right bearing in on its outer race until it seats. Drop the hub spacer in from the left, then drive the left bearing in. Both must turn freely." },
      { t: "Tube and tyre", d: "Put the tube in the tyre, push the valve through the rim hole and lever the beads on, taking care not to scratch the cast rim. Pressures: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Balance weight", d: "Spin-balance the wheel and fit the weight on the rim at the light spot." },
      { t: "Brake discs", d: "Fit a disc to each side of the hub, then the lock plates and bolts. Bend the plate edges up against the bolt head flats. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Gearbox dust seal", d: "Press the dust seal into the left end of the hub, lip facing out." },
      { t: "Speedometer gearbox and spacers", d: "Fit the gearbox to the left side with its drive tangs in the hub slots and the spacer outside it. Fit the right axle spacer into the right end of the hub." },
      { t: "Axle", d: "Lift the wheel between the fork legs with the gearbox stop against the left leg. Slide the axle in from the left through the leg, spacer, gearbox, hub and right spacer." },
      { t: "Washer, nut and cotter pin", d: "Fit the washer and the castle nut. Torque: VERIFY IN FACTORY SERVICE MANUAL. Tighten to line up a slot with the hole, fit a new cotter pin and bend the legs over." },
    ],
    parts: [
      { id: "wheel", ref: "1", name: "Front wheel, cast 5-spoke (19 x MT1.85)", mat: "alu", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, 0, 1],
        geom: { type: "group", items: [
          { type: "lathe", rot: AX, pts: hubProf },
          { type: "lathe", rot: AX, pts: rimProf },
          ...spokeItems ] } },
      { id: "bearingR", ref: "2", name: "Wheel bearing, right (6302)", mat: "steel", parent: "wheel", stage: 1, A: [-57, 0, 0], E: [-100, 0, 0], dir: [1, 0, 0],
        geom: bearing },
      { id: "spacer3", ref: "3", name: "Hub bearing spacer", mat: "steel", parent: "wheel", stage: 1, A: [-44, 0, 0], E: [80, 0, 0], dir: [-1, 0, 0],
        geom: { type: "ring", ro: 10.5, ri: 7.6, h: 88, rot: AX } },
      { id: "bearingL", ref: "2", name: "Wheel bearing, left (6302)", mat: "steel", parent: "wheel", stage: 1, A: [44, 0, 0], E: [190, 0, 0], dir: [-1, 0, 0],
        geom: bearing },
      { id: "tube", ref: "16", name: "Inner tube", mat: "black", parent: "wheel", stage: 2, A: [0, 0, 0], E: [-80, 700, 0], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "lathe", rot: AX, pts: tubeProf },
          { type: "cyl", r: 4, h: 50, axis: "y", rot: [VALVE, 0, 0], at: r2([0, 196 * Math.cos(rad(VALVE)), 196 * Math.sin(rad(VALVE))]), mat: "brass" },
          { type: "cyl", r: 5, h: 12, axis: "y", rot: [VALVE, 0, 0], at: r2([0, 186 * Math.cos(rad(VALVE)), 186 * Math.sin(rad(VALVE))]), mat: "black" } ] } },
      { id: "tyre", ref: "15", name: "Front tyre", mat: "rubber", parent: "wheel", stage: 2, A: [0, 0, 0], E: [150, 700, 0], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "lathe", rot: AX, pts: tyre },
          ...[-14, 0, 14].map(u => ({ type: "torus", R: 327.7, r: 1.3, rot: [0, 0, 90], at: [u, 0, 0], mat: "dark" })) ] } },
      { id: "weight", ref: "17", name: "Wheel balance weight", mat: "dark", small: true, parent: "wheel", stage: 3, A: wt, E: [-120, wt[1], wt[2]], dir: [1, 0, 0],
        geom: { type: "group", items: [
          { type: "box", size: [14, 5, 26], r: 1, rot: [WT_A - 90, 0, 0] },
          { type: "box", size: [3, 7, 8], r: .5, rot: [WT_A - 90, 0, 0], at: r2([0, 4 * Math.cos(rad(WT_A)), 4 * Math.sin(rad(WT_A))]), mat: "steel" } ] } },
      { id: "discR", ref: "12", name: "Brake disc, right", mat: "steel", parent: "wheel", stage: 4, A: [-67, 0, 0], E: [-150, 0, 0], dir: [1, 0, 0],
        geom: discGeom },
      { id: "platesR", ref: "14", name: "Disc bolt lock plates, right (3)", mat: "zinc", small: true, parent: "discR", stage: 4, A: [-67, 0, 0], E: [-195, 0, 0], dir: [1, 0, 0], count: 3,
        geom: plates(-1.2) },
      { id: "boltsR", ref: "13", name: "Disc bolts 8 x 25, right (6)", mat: "zinc", small: true, parent: "discR", stage: 4, A: [-68.2, 0, 0], E: [-232, 0, 0], dir: [1, 0, 0], count: 6,
        geom: { type: "array", pos: boltWorld, item: bolt(AXN) } },
      { id: "discL", ref: "12", name: "Brake disc, left", mat: "steel", parent: "wheel", stage: 4, A: [60, 0, 0], E: [240, 0, 0], dir: [-1, 0, 0],
        geom: discGeom },
      { id: "platesL", ref: "14", name: "Disc bolt lock plates, left (3)", mat: "zinc", small: true, parent: "discL", stage: 4, A: [67, 0, 0], E: [285, 0, 0], dir: [-1, 0, 0], count: 3,
        geom: plates(0) },
      { id: "boltsL", ref: "13", name: "Disc bolts 8 x 25, left (6)", mat: "zinc", small: true, parent: "discL", stage: 4, A: [68.2, 0, 0], E: [325, 0, 0], dir: [-1, 0, 0], count: 6,
        geom: { type: "array", pos: boltWorld, item: bolt(AX) } },
      { id: "seal10", ref: "10", name: "Dust seal, speedometer gearbox", mat: "rubber", small: true, parent: "wheel", stage: 5, A: [57.5, 0, 0], E: [370, 0, 0], dir: [-1, 0, 0],
        geom: { type: "lathe", rot: AX, pts: [[12.2, 4.5], [15, 0], [23.9, 0], [23.9, 5.5], [27.5, 5.5], [27.5, 7], [14, 7], [12.2, 6]] } },
      { id: "gearbox", ref: "11", name: "Speedometer gearbox", mat: "alu", parent: "wheel", stage: 6, A: [88, 0, 0], E: [430, 0, 0], dir: [-1, 0, 0],
        geom: { type: "group", items: [
          { type: "lathe", rot: AXN, pts: [[7.6, 0], [30, 0], [32, 2.5], [32, 19.5], [30, 22], [11, 22], [11, 31], [7.6, 31]] },
          { type: "cyl", r: 6.5, h: 34, axis: "y", rot: [-35, 0, 0], at: [-11, 0, 0] },
          { type: "hex", af: 14, h: 8, y: 34, hole: 3, rot: [-35, 0, 0], at: [-11, 0, 0], mat: "zinc" },
          { type: "box", size: [9, 14, 12], r: 1.5, at: [-4.5, -36, -14] } ] } },
      { id: "spacer8", ref: "8", name: "Spacer 15 x 22 x 30", mat: "steel", parent: "wheel", stage: 6, A: [88, 0, 0], E: [470, 0, 0], dir: [-1, 0, 0],
        geom: { type: "ring", ro: 11, ri: 7.55, h: 30, rot: AX } },
      { id: "spacer7", ref: "7", name: "Axle spacer, right", mat: "steel", parent: "wheel", stage: 6, A: [-57, 0, 0], E: [-290, 0, 0], dir: [1, 0, 0],
        geom: { type: "lathe", rot: AXN, pts: [[7.55, 0], [11, 0], [11, 9], [14, 10.5], [14, 53], [7.55, 53]] } },
      { id: "axle", ref: "4", name: "Front axle", mat: "steel", parent: "wheel", stage: 7, A: [165, 0, 0], E: [900, 0, 0], dir: [-1, 0, 0],
        geom: { type: "group", rot: AXN, items: [
          { type: "hex", af: 22, h: 10, y: -11 },
          { type: "lathe", pts: [[0, -1.2], [12, -1.2], [12, 0], [7.5, 0], [7.5, 300], [6, 302], [6, 335.5], [5, 337], [0, 337]] },
          { type: "holes", y: [327.6], r: 6, d: 3.2 } ] } },
      { id: "washer9", ref: "9", name: "Washer, axle nut", mat: "zinc", small: true, parent: "axle", stage: 8, A: [-150, 0, 0], E: [-380, 0, 0], dir: [1, 0, 0],
        geom: { type: "ring", ro: 12, ri: 6.2, h: 1.6, rot: AXN } },
      { id: "nut", ref: "5", name: "Axle nut 12 mm (castle)", mat: "zinc", small: true, parent: "axle", stage: 8, A: [-151.6, 0, 0], E: [-405, 0, 0], dir: [1, 0, 0],
        geom: { type: "group", rot: AXN, items: [
          { type: "hex", af: 17, h: 9, y: 0, hole: 6 },
          { type: "array", pos: [0, 60, 120, 180, 240, 300].map(a => r2([7.6 * Math.cos(rad(a + 30)), 11, 7.6 * Math.sin(rad(a + 30)), -(a + 30)])), item: { type: "box", size: [2.6, 4, 3.2], r: .4 } } ] } },
      { id: "cotter", ref: "6", name: "Cotter pin", mat: "zinc", small: true, parent: "axle", stage: 8, A: [-162.6, 0, 0], E: [-450, 0, 0], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "tube", pts: [[0, 10, -.85], [0, -6, -.85], [0, -9.5, -2.5], [0, -11, -7]], r: .85 },
          { type: "tube", pts: [[0, 10, .85], [0, -6, .85], [0, -9.5, 2.5], [0, -11, 7]], r: .85 },
          { type: "torus", R: 2.4, r: .85, rot: [0, 0, 90], at: [0, 12.4, 0] } ] } },
    ],
  };
})();
D3_MODELS["CMS-BLCK0035"] = D3_BLCK0035;
