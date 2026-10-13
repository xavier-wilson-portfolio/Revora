/* ============ 3D parts model: seat, GS750B 1977 (CMSNL BLCK0062) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: +X = rider's LEFT, +Y up, +Z forward (same as d3_fork.js, no mirroring).
     Origin on the bike centreline at the underside of the seat pan, Z = 0 near the middle of the seat.
   The seat hinges on the left (pins 2 with split pins 3 on the near side of the CMSNL picture) and latches
   on the right: striker 7 under the pan drops into the seat lock 20, which is bolted to a frame bracket.
   The frame itself is on another page and is not drawn, so the lock is shown where it sits under the striker.
   Layout and numbering follow the CMSNL picture. Geometry: APPROXIMATE. Seat about 800 mm long and 296 mm wide,
   typical for a 1970s 750; nothing here is a factory measurement. */
const D3_BLCK0062 = (() => {
  // outer skin of the seat cover, side view [z, y], from the bottom of the back round the top to the bottom of the nose
  const S = [[-300, 12], [-300, 42], [-300, 100], [-296, 116], [-286, 126], [-270, 130], [-240, 130], [-100, 130], [-84, 129], [-70, 125], [-55, 117],
    [-40, 106], [-25, 96], [-10, 91], [10, 89], [120, 88], [260, 89], [320, 92], [350, 95], [370, 94], [384, 88], [394, 76], [398, 60], [396, 42], [390, 24], [384, 12]];
  const R = 30, W = 144; // edge roll radius, half width of the cover
  const Q = S.map((p, i) => { const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)], tz = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tz, ty);
    return [+(p[0] + R * ty / l).toFixed(2), +Math.max(12, p[1] - R * tz / l).toFixed(2)]; });   // skin moved in by R: centre line of the edge rolls
  const QR = Q.filter(q => q[1] >= 42), q0 = QR[0], q1 = QR[QR.length - 1];
  const yTop = z => { for (let i = 5; i < 20; i++) { const a = S[i], b = S[i + 1]; if (z >= a[0] && z <= b[0]) return a[1] + (b[1] - a[1]) * (z - a[0]) / (b[0] - a[0]); } return 88; };
  const xs = [-100, -72, -44, -16, 16, 44, 72, 100];
  const rib = (x, z0, z1) => ({ type: "tube", r: 2.6, pts: Array.from({ length: 7 }, (_, i) => { const z = z0 + (z1 - z0) * i / 6; return [x, yTop(z) + .4, z]; }) });
  const riderRibs = xs.map(x => rib(x, 30, 330)), pillionRibs = xs.map(x => rib(x, -236, -134));
  const arcPts = (cx, cy, r, a0, a1, n = 8) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)]; });
  const band = (r) => [[W - R + r, 20], ...arcPts(W - R, 130 - R, r, 0, 90), ...arcPts(-(W - R), 130 - R, r, 90, 180), [-(W - R) - r, 20]];
  const sIn = band(R), sOut = band(R + 3.5);
  const coverItems = [
    { type: "extrude", pts: S, depth: 2 * (W - R), bevel: 0, rot: [0, -90, 0], at: [W - R, 0, 0] },        // crown
    { type: "extrude", pts: [...Q, [Q[0][0], 12]], depth: 2 * W, bevel: 0, rot: [0, -90, 0], at: [W, 0, 0] }, // sides
    ...[W - R, -(W - R)].flatMap(x => [
      { type: "tube", r: R, pts: QR.map(q => [x, q[1], q[0]]) },                                          // rolled edges
      ...[q0, q1].flatMap(q => [{ type: "sphere", r: R, at: [x, q[1], q[0]] }, { type: "cyl", r: R, h: q[1] - 12, at: [x, 12, q[0]] }]) ]),
  ];
  // tail cover plan outline [x, v], v = distance back from its front edge
  const ell = (rx, ry, n = 20) => Array.from({ length: n + 1 }, (_, i) => { const a = i / n * Math.PI; return [+(rx * Math.cos(a)).toFixed(2), +(70 + ry * Math.sin(a)).toFixed(2)]; });
  const outer = [[150, 0], ...ell(150, 42), [-150, 0]];
  const inner = [[-146, 0], ...ell(146, 38).reverse(), [146, 0]];
  const C = [0, 12, -302];                       // tail cover origin: front edge, on the pan
  const at = (o, d) => [o[0] + d[0], o[1] + d[1], o[2] + d[2]];
  const CE = [0, 12, -580];                      // tail cover exploded
  const L = [-110, -80, -20], LE = [-250, -500, -20]; // seat lock installed / exploded
  const pinItem = { type: "lathe", pts: [[0, 0], [6, 0], [6, 3], [4, 3], [4, 47], [0, 47]], rot: [90, 0, 0] };
  const cotter = { type: "group", items: [
    { type: "tube", r: .9, pts: [[-9, 1, 0], [4, 1, 0], [7, 1.6, 0], [10, 0, 0], [7, -1.6, 0], [4, -1, 0], [-9, -1, 0]] } ] };
  const screwUp = (head, len, r, hr) => ({ type: "group", items: [ // head below, bearing face at y = 0, thread going up
    { type: "lathe", pts: [[0, -head], [hr, -head], [hr, 0], [r, 0], [r, len], [0, len]] }, { type: "box", size: [hr * 1.3, 1, 1], r: .2, at: [0, -head - .3, 0], mat: "black" }] });
  const boltUp = (len) => ({ type: "group", items: [{ type: "hex", af: 10, h: 4.5, y: -4.5 }, { type: "lathe", pts: [[0, -.5], [3, -.5], [3, len], [0, len]] }] });
  return {
    id: "CMS-BLCK0062", title: "Seat (GS750B)", units: "mm", page: "BLCK0062",
    accuracy: "Approximate geometry. Part identity, numbering and layout follow the CMSNL seat picture for the GS750B. Shapes and sizes are typical for a 1970s 750 seat, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [1, .75, .62], up: [0, 1, 0] },
    notModelled: "Ref 14 (tail cover) and ref 15 (its tape) are the same parts as 12 and 13 in another colour, so only 12 and 13 are drawn. The frame brackets the hinge pins and the lock fit to belong to the frame page and are not drawn.",
    stages: [
      { t: "Cushions", d: "Push the three rubber cushions into their holes in the seat pan. They rest on the frame when the seat is shut." },
      { t: "Lock striker", d: "Fit the striker under the right side of the pan with the shim between them. Screw, lock washer and plain washer go in from below." },
      { t: "Tail cover", d: "Slide the tail cover onto the back of the seat pan and bolt it from underneath with a plain washer and a lock washer on each bolt." },
      { t: "Tape and emblem", d: "Stick the tape on each side of the tail cover and fit the emblem on the back. Clean the paint first." },
      { t: "Seat lock", d: "Bolt the seat lock to its bracket on the right frame rail, under the striker, with a lock washer under each screw head." },
      { t: "Helmet holder", d: "Fit the helmet holder spring on top of the lock with its small screw." },
      { t: "Hinge pins", d: "Line up the seat hinge lugs with the frame brackets on the left side and push the two pins through from the back. Fit a split pin through the front end of each. Check the seat shuts and locks. Any adjustment: VERIFY IN FACTORY SERVICE MANUAL." },
    ],
    parts: [
      { id: "seat", ref: "1", name: "Seat assembly (pan and padded cover)", mat: "rubber", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "box", size: [296, 12, 800], r: 4, at: [0, 6, -2], mat: "black" },                         // steel pan
          ...coverItems,                                                                                    // padded cover
          ...riderRibs, ...pillionRibs,
          { type: "extrude", pts: [...sOut, ...sIn.slice().reverse()], depth: 28, bevel: .5, at: [0, 0, -130], mat: "black" }, // strap
          ...[150, -150].map(z => ({ type: "extrude", pts: [[134, 0], [154, 0], [154, -16], [150, -23], [138, -23], [134, -16]], holes: [[144, -14, 4.3]], depth: 4, bevel: .4, at: [0, 0, z], mat: "black" })), // hinge lugs
        ] } },
      // cushions in the pan
      { id: "cush5", ref: "5", name: "Cushion, front (11.5 x 22 x 20)", mat: "rubber", small: true, parent: "seat", stage: 1, A: [100, 0, 270], E: [100, -90, 270], dir: [0, 1, 0],
        geom: { type: "lathe", pts: [[0, -16], [9, -16], [11, -13], [11, 0], [5, 0], [5, 3], [6.5, 4.5], [5, 6], [0, 6]] } },
      { id: "cush6", ref: "6", name: "Cushion, middle", mat: "rubber", small: true, parent: "seat", stage: 1, A: [-100, 0, 60], E: [-100, -90, 60], dir: [0, 1, 0],
        geom: { type: "lathe", pts: [[0, -14], [7.5, -14], [9.5, -11], [9.5, 0], [5, 0], [5, 3], [6.5, 4.5], [5, 6], [0, 6]] } },
      { id: "cush4", ref: "4", name: "Cushion, rear (square)", mat: "rubber", small: true, parent: "seat", stage: 1, A: [90, 0, -250], E: [90, -90, -250], dir: [0, 1, 0],
        geom: { type: "group", items: [{ type: "box", size: [24, 16, 20], r: 3, at: [0, -8, 0] }, { type: "cyl", r: 5, h: 6 }] } },
      // lock striker stack (right side under the pan)
      { id: "shim", ref: "11", name: "Seat lock striker shim", mat: "steel", small: true, parent: "seat", stage: 2, A: [-110, 0, -20], E: [-110, -90, -20], dir: [0, 1, 0],
        geom: { type: "extrude", pts: [[-22, -12], [22, -12], [22, 12], [-22, 12]], holes: [[10, 0, 3.4]], depth: 2, bevel: .2, rot: [90, 0, 0] } },
      { id: "striker", ref: "7", name: "Seat lock striker", mat: "zinc", parent: "seat", stage: 2, A: [-110, -2, -20], E: [-110, -140, -20], dir: [0, 1, 0],
        geom: { type: "group", items: [
          { type: "extrude", pts: [[-22, -12], [22, -12], [22, 12], [-22, 12]], holes: [[10, 0, 3.4]], depth: 3, bevel: .3, rot: [90, 0, 0] },
          { type: "box", size: [3, 40, 20], r: .6, at: [-14, -23, 0] },
          { type: "cyl", r: 3, h: 20, axis: "z", at: [-14, -39, -10] } ] } },
      { id: "washer10", ref: "10", name: "Washer (striker screw)", mat: "zinc", small: true, parent: "striker", stage: 2, A: [-100, -6.6, -20], E: [-100, -215, -20], dir: [0, 1, 0],
        geom: { type: "ring", ro: 7, ri: 3.2, h: 1.6 } },
      { id: "lockw9", ref: "9", name: "Lock washer (striker screw)", mat: "spring", small: true, parent: "striker", stage: 2, A: [-100, -8.6, -20], E: [-100, -240, -20], dir: [0, 1, 0],
        geom: { type: "ring", ro: 5.6, ri: 3.2, h: 2, split: true } },
      { id: "screw8", ref: "8", name: "Screw 6 x 12 (striker)", mat: "zinc", small: true, parent: "striker", stage: 2, A: [-100, -8.6, -20], E: [-100, -275, -20], dir: [0, 1, 0],
        geom: screwUp(4.5, 18, 3, 5.4) },
      // tail cover
      { id: "tail", ref: "12", shell: true, name: "Seat tail cover", mat: "steel", parent: "seat", stage: 3, A: C, E: CE, dir: [0, 0, 1],
        geom: { type: "group", items: [
          { type: "extrude", pts: [...outer, ...inner], depth: 118, bevel: .6, rot: [-90, 0, 0] },
          { type: "extrude", pts: outer, depth: 5, bevel: 3, rot: [-90, 0, 0], at: [0, 118, 0] },
          { type: "extrude", pts: [[155, 0], [155, 114], [148, 126], [-148, 126], [-155, 114], [-155, 0], [-146, 0], [-146, 118], [146, 118], [146, 0]], depth: 4, bevel: .5, at: [0, 0, -4] }, // front lip
          { type: "pair", at: [[139, 0, -28], [-139, 0, -28]], item: { type: "cyl", r: 7, h: 30 } } ] } },
      { id: "washer16", ref: "16", name: "Washers (tail cover bolts)", mat: "zinc", small: true, count: 2, parent: "tail", stage: 3, A: [0, -1.6, -330], E: [0, -60, -608], dir: [0, 1, 0],
        geom: { type: "pair", at: [[139, 0, 0], [-139, 0, 0]], item: { type: "ring", ro: 7, ri: 3.2, h: 1.6 } } },
      { id: "lockw17", ref: "17", name: "Lock washers (tail cover bolts)", mat: "spring", small: true, count: 2, parent: "tail", stage: 3, A: [0, -3.6, -330], E: [0, -85, -608], dir: [0, 1, 0],
        geom: { type: "pair", at: [[139, 0, 0], [-139, 0, 0]], item: { type: "ring", ro: 5.6, ri: 3.2, h: 2, split: true } } },
      { id: "bolt18", ref: "18", name: "Bolts, tail cover", mat: "zinc", small: true, count: 2, parent: "tail", stage: 3, A: [0, -3.6, -330], E: [0, -125, -608], dir: [0, 1, 0],
        geom: { type: "pair", at: [[139, 0, 0], [-139, 0, 0]], item: boltUp(26) } },
      { id: "tape", ref: "13", name: "Tail cover tape (both sides)", mat: "dark", small: true, count: 2, parent: "tail", stage: 4, A: C, E: at(CE, [0, 230, 0]), dir: [0, -1, 0],
        geom: { type: "pair", at: [[150.7, 34, -48], [-150.7, 34, -48]], item: { type: "box", size: [1.2, 9, 84], r: .4 } } },
      { id: "emblem", ref: "19", name: "Emblem (tail cover)", mat: "chrome", small: true, parent: "tail", stage: 4, A: C, E: at(CE, [0, 0, -150]), dir: [0, 0, 1],
        geom: { type: "box", size: [80, 15, 2.4], r: .8, at: [0, 86, -113.2] } },
      // seat lock on the frame (right side)
      { id: "lock", ref: "20", name: "Seat lock assembly", mat: "chrome", stage: 5, A: L, E: LE, dir: [0, 1, 0],
        geom: { type: "group", items: [
          { type: "cyl", r: 13, h: 52, axis: "x", at: [-34, 0, 0] },
          { type: "box", size: [2, 3, 12], r: .3, at: [-34.6, 0, 0], mat: "black" },
          { type: "box", size: [36, 26, 30], r: 2, at: [0, 22, 0], mat: "steel" },
          { type: "box", size: [6, 1, 22], r: .2, at: [-14, 35.2, 0], mat: "black" },
          { type: "extrude", pts: [[-38, -25], [38, -25], [38, 33], [-38, 33]], holes: [[28, 0, 3.3], [-28, 0, 3.3]], depth: 3, bevel: .4, rot: [0, -90, 0], at: [21, 0, 0], mat: "steel" } ] } },
      { id: "lockw22", ref: "22", name: "Lock washers (lock screws)", mat: "spring", small: true, count: 2, parent: "lock", stage: 5, A: at(L, [16, 0, 0]), E: at(LE, [-80, 0, 0]), dir: [1, 0, 0],
        geom: { type: "pair", at: [[0, 0, 28], [0, 0, -28]], item: { type: "ringX", ro: 5.4, ri: 3.1, h: 2 } } },
      { id: "screw21", ref: "21", name: "Screws (seat lock)", mat: "zinc", small: true, count: 2, parent: "lock", stage: 5, A: at(L, [16, 0, 0]), E: at(LE, [-115, 0, 0]), dir: [1, 0, 0],
        geom: { type: "pair", at: [[0, 0, 28], [0, 0, -28]], item: { type: "screwX", head: 4, headR: 5, len: 12, r: 2.9 } } },
      { id: "spring", ref: "23", name: "Helmet holder spring", mat: "spring", small: true, parent: "lock", stage: 6, A: at(L, [8, 36, -9]), E: at(LE, [8, 100, -9]), dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "torus", R: 3.2, r: 1 },
          { type: "tube", r: 1, pts: [[0, 0, -3.2], [0, 0, -9], [0, 0, -14], [0, -3, -17], [0, -12, -17], [0, -20, -15]] } ] } },
      { id: "screw24", ref: "24", name: "Screw (helmet holder spring)", mat: "zinc", small: true, parent: "lock", stage: 6, A: at(L, [8, 37, -9]), E: at(LE, [8, 140, -9]), dir: [0, -1, 0],
        geom: { type: "lathe", pts: [[0, -10], [2.4, -10], [2.4, 0], [4.4, 0], [4.4, 2.4], [3, 3.6], [0, 3.6]] } },
      // hinge (left side)
      { id: "pins", ref: "2", name: "Hinge pins", mat: "steel", small: true, count: 2, parent: "seat", stage: 7, A: [144, -14, 0], E: [214, -64, -110], dir: [0, 0, 1],
        geom: { type: "pair", at: [[0, 0, 140], [0, 0, -160]], item: pinItem } },
      { id: "cotters", ref: "3", name: "Split pins (hinge pins)", mat: "spring", small: true, count: 2, parent: "pins", stage: 7, A: [144, -14, 0], E: [274, -14, 0], dir: [-1, 0, 0],
        geom: { type: "pair", at: [[0, 0, 181], [0, 0, -119]], item: cotter } },
    ],
  };
})();
D3_MODELS["CMS-BLCK0062"] = D3_BLCK0062;
