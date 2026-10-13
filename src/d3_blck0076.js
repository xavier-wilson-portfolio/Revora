/* ============ 3D parts model: turn signal lamps, GS750B 1977 (CMSNL BLCK0076) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: +X = rider's left, +Y up, +Z forward (same as d3_fork.js).
   The page covers the front lamp (refs 1-11), the rear lamp on its bracket (12-24) and the flasher relays (25-28).
   They are drawn side by side, not at their real places on the bike: front lamp at X = 0 (lens facing forward),
   rear lamp on the left-hand bracket at X = +160 (lens facing back), relays at X = -160.
   Each lamp is built in a lamp frame: axis along local +Z, origin at the back of the shell where the stalk starts,
   lens toward +Z, stalk toward -Z. The rear lamp is the same frame turned 180 degrees about Y.
   Geometry: APPROXIMATE. Layout follows the CMSNL picture; sizes are typical for a 1970s Suzuki round
   indicator, not measured. Fastener sizes are read from the washer description (10.5 x 30) only. */
const D3_BLCK0076 = (() => {
  const OF = [0, 0, 60], OR = [160, 0, -40], LAMP_E_R = [160, 0, -200];
  // lamp-frame point -> world (front: plain offset; rear: turned 180 about Y)
  const wF = (o, p) => [o[0] + p[0], o[1] + p[1], o[2] + p[2]];
  const wR = (o, p) => [o[0] - p[0], o[1] + p[1], o[2] - p[2]];
  const ax = it => Object.assign({ rot: [90, 0, 0] }, it); // lathe along Y -> along lamp +Z
  const axN = it => Object.assign({ rot: [-90, 0, 0] }, it); // lathe along Y -> along lamp -Z (stalk side)
  const G = {
    housing: { type: "group", items: [
      ax({ type: "lathe", pts: [[0, -70], [9.5, -70], [9.5, -58], [10.5, -50], [13, -14], [20, -4], [32, 0], [41, 6], [45.5, 18], [46, 40], [43.8, 40], [43.8, 20], [40, 9], [30, 4], [0, 4]] }),
      ax({ type: "lathe", pts: [[0, -96], [5, -96], [5, -70], [0, -70]], mat: "steel" }),      // hollow threaded stud on the stalk end
      ax({ type: "lathe", pts: [[0, 4], [9, 4], [9, 12], [0, 12]], mat: "brass" }),           // bulb socket
      { type: "cyl", r: 4.5, h: 36, axis: "z", at: [0, -36, 4] },                             // boss for the lens screw
      { type: "tube", r: 2.4, mat: "black", pts: [[0, 0, -94], [0, 0, -101], [0, -6, -106], [0, -26, -108], [-14, -52, -104], [-30, -66, -96]] },
      { type: "cyl", r: 3.4, h: 14, axis: "x", at: [-44, -66, -96], mat: "brass" } ] },
    lens: { type: "group", items: [
      ax({ type: "lathe", pts: [[43.6, 0], [46.5, 0], [46.5, 4], [42, 6], [36, 10], [26, 14.5], [12, 17], [0, 17.5], [0, 15.5], [12, 15], [26, 12.5], [36, 8], [41, 4.5], [43.6, 3]] }),
      { type: "cyl", r: 5, h: 8.5, axis: "z", at: [0, -36, 0] } ] },
    gasket: { type: "torus", R: 44.5, r: 1.3, rot: [90, 0, 0] },
    bulb: { type: "group", items: [
      ax({ type: "lathe", pts: [[0, 0], [7.6, 0], [7.6, 14], [6, 15.5], [0, 15.5]], mat: "brass" }),
      { type: "pair", pos: [[7.6, 0, 6], [-7.6, 0, 6]], item: { type: "cyl", r: 1, h: 3, axis: "x", at: [-1.5, 0, 0] } },
      ax({ type: "lathe", pts: [[0, 14], [7, 14], [10, 19], [12.6, 26], [12.4, 32], [9, 37], [0, 38.5]], mat: "chrome" }) ] },
    screw: ax({ type: "lathe", pts: [[0, -26], [2.5, -26], [2.5, 0], [5.5, 0], [5.5, 1.8], [4.2, 3.6], [0, 3.6]] }),
    sgasket: ax({ type: "ring", ro: 5, ri: 2.6, h: 1 }),
    cushion: axN({ type: "lathe", pts: [[5.1, 0], [13.5, 0], [13.5, 3], [10.5, 3.6], [10.5, 8.4], [13.5, 9], [13.5, 12], [5.1, 12]] }),
    washer: axN({ type: "ring", ro: 15, ri: 5.25, h: 2.3 }),
    lockw: axN({ type: "ring", ro: 8.6, ri: 5.1, h: 2.2, split: true }),
    nut: axN({ type: "hex", af: 17, h: 8, hole: 5 }),
    wire: { type: "group", items: [
      axN({ type: "ring", ro: 9, ri: 5.2, h: 1, mat: "brass" }),
      { type: "box", size: [6, 10, 1.2], r: .3, at: [0, -12, -.6], mat: "brass" },
      { type: "tube", r: 2.2, mat: "black", pts: [[0, -16, -.6], [0, -26, -.6], [-8, -44, -.6], [-22, -58, -.6], [-40, -64, -.6]] },
      { type: "cyl", r: 3.2, h: 12, axis: "x", at: [-52, -64, -.6], mat: "brass" } ] },
  };
  // lamp-frame installed (a) and exploded (e) positions of the lamp's own parts
  const L = {
    bulb: { a: [0, 0, 12], e: [0, 0, 80] }, gasket: { a: [0, 0, 40], e: [0, 0, 130] }, lens: { a: [0, 0, 40], e: [0, 0, 145] },
    sgasket: { a: [0, -36, 48.5], e: [0, -36, 182] }, screw: { a: [0, -36, 49.5], e: [0, -36, 212] },
    cushion: { a: [0, 0, -70], e: [0, 0, -125] }, washer: { a: [0, 0, -82], e: [0, 0, -150] }, wire: { a: [0, 0, -84.3], e: [0, 0, -172] },
    lockw: { a: [0, 0, -85.3], e: [0, 0, -196] }, nut: { a: [0, 0, -87.5], e: [0, 0, -220] },
  };
  const flipG = g => ({ type: "group", rot: [0, 180, 0], items: [g] });
  const zF = [0, 0, 1], zR = [0, 0, -1], nF = [0, 0, -1], nR = [0, 0, 1];
  const parts = [
    // ---- front lamp (refs 1-11), the shell is the fixed part ----
    { id: "f_lamp", shell: true, ref: "1", name: "Front turn signal lamp (shell on stalk, with its lead)", mat: "chrome", stage: 0, A: OF, E: OF, dir: zR, geom: G.housing },
    { id: "f_bulb", ref: "4", name: "Bulb, 12V 23W (front)", mat: "brass", parent: "f_lamp", stage: 1, A: wF(OF, L.bulb.a), E: wF(OF, L.bulb.e), dir: nF, geom: G.bulb },
    { id: "f_gasket", ref: "3", name: "Lens gasket (front)", mat: "rubber", small: true, parent: "f_lamp", stage: 2, A: wF(OF, L.gasket.a), E: wF(OF, L.gasket.e), dir: nF, geom: G.gasket },
    { id: "f_lens", ref: "2", name: "Lens (front)", mat: "brass", parent: "f_lamp", stage: 2, A: wF(OF, L.lens.a), E: wF(OF, L.lens.e), dir: nF, geom: G.lens },
    { id: "f_sgasket", ref: "6", name: "Gasket (lens screw, front)", mat: "rubber", small: true, parent: "f_lens", stage: 3, A: wF(OF, L.sgasket.a), E: wF(OF, L.sgasket.e), dir: nF, geom: G.sgasket },
    { id: "f_screw", ref: "5", name: "Lens screw (front)", mat: "zinc", small: true, parent: "f_lens", stage: 3, A: wF(OF, L.screw.a), E: wF(OF, L.screw.e), dir: nF, geom: G.screw },
    { id: "f_cushion", ref: "7", name: "Cushion (stalk grommet, front)", mat: "rubber", small: true, parent: "f_lamp", stage: 4, A: wF(OF, L.cushion.a), E: wF(OF, L.cushion.e), dir: zF, geom: G.cushion },
    { id: "f_washer", ref: "8", name: "Washer 10.5 x 30 (front)", mat: "zinc", small: true, parent: "f_lamp", stage: 4, A: wF(OF, L.washer.a), E: wF(OF, L.washer.e), dir: zF, geom: G.washer },
    { id: "f_wire", ref: "11", name: "Earth wire with ring terminal (front)", mat: "black", parent: "f_lamp", stage: 4, A: wF(OF, L.wire.a), E: wF(OF, L.wire.e), dir: zF, geom: G.wire },
    { id: "f_lockw", ref: "9", name: "Lock washer (front)", mat: "spring", small: true, parent: "f_lamp", stage: 4, A: wF(OF, L.lockw.a), E: wF(OF, L.lockw.e), dir: zF, geom: G.lockw },
    { id: "f_nut", ref: "10", name: "Nut (front stalk)", mat: "zinc", small: true, parent: "f_lamp", stage: 4, A: wF(OF, L.nut.a), E: wF(OF, L.nut.e), dir: zF, geom: G.nut },
    // ---- rear lamp on the left bracket (refs 12-24); the bracket is the fixed part ----
    { id: "bracket", ref: "24", name: "Rear turn signal bracket, left", mat: "black", stage: 0, A: [160, 0, 34], E: [160, 0, 34], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "extrude", pts: [[-14, -14], [14, -14], [14, 44], [10, 52], [-10, 52], [-14, 44]], holes: [[0, 0, 10.6]], depth: 3, bevel: .4 },
        { type: "extrude", pts: [[-10, -2], [10, -2], [10, -26], [6, -32], [-6, -32], [-10, -26]], holes: [[0, -20, 4.2]], depth: 3, bevel: .4, rot: [-90, 0, 0], at: [0, 49, 0] } ] } },
    { id: "r_cushion", ref: "18", name: "Cushion (stalk grommet, rear)", mat: "rubber", small: true, parent: "bracket", stage: 5, A: wR(OR, L.cushion.a), E: [160, 0, -10], dir: nR, geom: flipG(G.cushion) },
    { id: "r_lamp", shell: true, ref: "12", name: "Rear turn signal lamp (shell on stalk, with its lead)", mat: "chrome", parent: "bracket", stage: 6, A: OR, E: LAMP_E_R, dir: nR, geom: flipG(G.housing) },
    { id: "r_bulb", ref: "15", name: "Bulb, 12V 23W (rear)", mat: "brass", parent: "r_lamp", stage: 1, A: wR(OR, L.bulb.a), E: wR(LAMP_E_R, L.bulb.e), dir: nR, geom: flipG(G.bulb) },
    { id: "r_gasket", ref: "14", name: "Lens gasket (rear)", mat: "rubber", small: true, parent: "r_lamp", stage: 2, A: wR(OR, L.gasket.a), E: wR(LAMP_E_R, L.gasket.e), dir: nR, geom: flipG(G.gasket) },
    { id: "r_lens", ref: "13", name: "Lens (rear)", mat: "brass", parent: "r_lamp", stage: 2, A: wR(OR, L.lens.a), E: wR(LAMP_E_R, L.lens.e), dir: nR, geom: flipG(G.lens) },
    { id: "r_sgasket", ref: "17", name: "Gasket (lens screw, rear)", mat: "rubber", small: true, parent: "r_lens", stage: 3, A: wR(OR, L.sgasket.a), E: wR(LAMP_E_R, L.sgasket.e), dir: nR, geom: flipG(G.sgasket) },
    { id: "r_screw", ref: "16", name: "Lens screw (rear)", mat: "zinc", small: true, parent: "r_lens", stage: 3, A: wR(OR, L.screw.a), E: wR(LAMP_E_R, L.screw.e), dir: nR, geom: flipG(G.screw) },
    { id: "r_washer", ref: "19", name: "Washer 10.5 x 30 (rear)", mat: "zinc", small: true, parent: "r_lamp", stage: 7, A: wR(OR, L.washer.a), E: [160, 0, 75], dir: zR, geom: flipG(G.washer) },
    { id: "r_wire", ref: "22", name: "Earth wire with ring terminal (rear)", mat: "black", parent: "r_lamp", stage: 7, A: wR(OR, L.wire.a), E: [160, 0, 100], dir: zR, geom: flipG(G.wire) },
    { id: "r_lockw", ref: "20", name: "Lock washer (rear)", mat: "spring", small: true, parent: "r_lamp", stage: 7, A: wR(OR, L.lockw.a), E: [160, 0, 124], dir: zR, geom: flipG(G.lockw) },
    { id: "r_nut", ref: "21", name: "Nut (rear stalk)", mat: "zinc", small: true, parent: "r_lamp", stage: 7, A: wR(OR, L.nut.a), E: [160, 0, 150], dir: zR, geom: flipG(G.nut) },
    // ---- flasher relays (25-28) ----
    { id: "relay25", ref: "25", name: "Turn signal relay (round can)", mat: "alu", stage: 8, A: [-160, 0, 40], E: [-160, 70, 40], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[0, 0], [19, 0], [20, 3], [20, 40], [17, 46], [0, 47]] },
        { type: "lathe", pts: [[0, -2], [21, -2], [21, 4], [0, 4]], mat: "black" },
        { type: "box", size: [16, 2.5, 26], r: .4, at: [0, -.75, 28], mat: "black" },
        { type: "array", pos: [[-6, 0, -9], [6, 0, -9], [0, 0, -14]], item: { type: "box", size: [6.3, 9, .8], r: .2, at: [0, 50, 0], mat: "brass" } } ] } },
    { id: "washer27", ref: "27", name: "Washer (relay screw)", mat: "zinc", small: true, parent: "relay25", stage: 8, A: [-160, .5, 73], E: [-160, 130, 73], dir: [0, -1, 0],
      geom: { type: "ring", ro: 6.5, ri: 3.2, h: 1.2 } },
    { id: "screw28", ref: "28", name: "Screw 6 x 16 (relay)", mat: "zinc", small: true, parent: "relay25", stage: 8, A: [-160, 1.7, 73], E: [-160, 160, 73], dir: [0, -1, 0],
      geom: { type: "group", items: [{ type: "lathe", pts: [[0, -16], [3, -16], [3, 0], [5.6, 0], [5.6, 2], [4.4, 4], [0, 4]] },
        { type: "box", size: [6, 1.2, 1.2], r: .2, at: [0, 4, 0], mat: "black" }, { type: "box", size: [1.2, 1.2, 6], r: .2, at: [0, 4, 0], mat: "black" }] } },
    { id: "relay26", ref: "26", name: "Turn signal relay (square case)", mat: "black", stage: 8, A: [-160, 24, -50], E: [-160, 24, -150], dir: [0, 0, 1],
      geom: { type: "group", items: [
        { type: "box", size: [46, 48, 32], r: 5 },
        { type: "box", size: [42, 4, 28], r: 1.5, at: [0, -25, 0], mat: "dark" },
        { type: "box", size: [10, 4, 6], r: .8, at: [0, -26, 18], mat: "dark" } ] } },
  ];
  return {
    id: "CMS-BLCK0076", title: "Turn signal lamps (GS750B)", units: "mm", page: "BLCK0076",
    accuracy: "Approximate geometry. Part numbering and the order the parts stack follow the CMSNL picture for this page; sizes are typical for a 1970s round indicator, not measured from a GS750. The front lamp, the rear lamp on its bracket and the relays are drawn side by side, not where they sit on the bike. Use the factory service manual for every dimension.",
    view: { dir: [-1.1, .75, 1.2], up: [0, 1, 0] },
    notModelled: "Ref 23 (right rear bracket) is the mirror of ref 24, and each lamp is fitted twice (left and right), so one of each is drawn. The front lamp's headlamp bracket is on another page. The catalogue lists two relays (25 and 26); check which one your bike has, both are shown.",
    stages: [
      { t: "Bulbs", d: "Push each bulb into its socket and turn it to lock the pins. Check it lights before closing the lamp." },
      { t: "Lens gaskets and lenses", d: "Seat the gasket on the rim of the shell, then fit the lens over it so the screw boss lines up." },
      { t: "Lens screws", d: "Put a small gasket under each screw head and run the screw through the lens into the shell. Snug only, the lens cracks easily. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Front lamp onto its bracket", d: "Slide the cushion onto the front stalk and seat it in the headlamp bracket. Feed the lead through, then the washer, the earth wire terminal, the lock washer and the nut." },
      { t: "Rear cushion into the bracket", d: "Press the rubber cushion into the square hole in the left rear bracket." },
      { t: "Rear lamp through the bracket", d: "Feed the lead and stalk of the rear lamp through the cushion until the stalk shoulder sits against it." },
      { t: "Rear washer, earth wire and nut", d: "On the inside of the bracket fit the washer, the earth wire terminal, the lock washer and the nut. Point the lamp straight back before tightening. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Relay", d: "Mount the relay on its tab with the washer and screw and plug it into the harness. Only one relay is fitted; match it to your harness." },
    ],
    parts,
  };
})();
D3_MODELS["CMS-BLCK0076"] = D3_BLCK0076;
