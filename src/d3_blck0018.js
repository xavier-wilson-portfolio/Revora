/* ============ 3D parts model: cylinder head, GS750B 1977 (CMSNL BLCK0018) ============
   Mechanical data only. Units: millimetres.
   World frame: head gasket face (underside of the head) at Y = 0, +Y up the cylinder axis (the forward cylinder tilt is ignored),
   +X along the crankshaft toward cylinder 1 is -X (cylinders 1..4 at X = -122, -52, +52, +122), +Z forward (exhaust side).
   Cam chain tunnel on the centre line X = 0. Camshaft axes at Y = 92 (cam cover face), Z = -34.5 (intake) and +34.5 (exhaust).
   Identity and numbering: CMSNL cylinder head page, refs 1 to 30.
   Geometry: APPROXIMATE. Real figures used: bore 65 mm (GS750 spec), DOHC 2 valves per cylinder, 12 head nuts,
   14 mm spark plug with 19 mm reach (NGK B8ES / ND W24ES class), 10 mm head nuts (washer sizes 10.5 x 22 from the catalogue names),
   6 mm bolts (6x39, 6x45, 6x30 from the part numbers), O-ring 3 mm cord (catalogue), hollow pin 6.2 x 8 x 11 (catalogue).
   Cylinder pitch 70 mm with a wider 104 mm centre gap for the cam chain; every other size is a typical 1970s
   DOHC proportion, not a factory measurement. */
const D3_BLCK0018 = (() => {
  const CYL = [-122, -52, 52, 122], ZC = 34.5, TILT = 15, FLOOR = 62, TOP = 92, W = 175, D = 76;
  const STUDS14 = [[-157, -58], [-157, 58], [-87, -58], [-87, 58], [87, -58], [87, 58], [157, -58], [157, 58]];
  const STUDS12 = [[-24, -58], [-24, 58], [24, -58], [24, 58]];
  const arc = (cx, cy, r, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
  // left half (x <= 0) of a plate outline in (x, z) with notches cut along the centre seam; feats sorted by z:
  // { c, r } = round hole on the seam, { slot: L, hw } = cam chain tunnel (straight half-length L, half-width hw, round ends)
  const seam = feats => { const p = [[0, D], [-W, D], [-W, -D], [0, -D]];
    feats.forEach(f => { const n = 12;
      if (f.slot != null) { for (let i = 0; i <= n; i++) { const t = Math.PI / 2 * i / n; p.push([-f.hw * Math.sin(t), -f.slot - f.hw * Math.cos(t)]); }
        for (let i = 0; i <= n; i++) { const t = Math.PI / 2 * i / n; p.push([-f.hw * Math.cos(t), f.slot + f.hw * Math.sin(t)]); } }
      else for (let i = 0; i <= n; i++) { const t = Math.PI * i / n; p.push([-f.r * Math.sin(t), f.c - f.r * Math.cos(t)]); } });
    return p; };
  // flat plate in the XZ plane from y = 0 up to depth, as two halves either side of the seam; holes [[x, z, r]]
  const plate = (feats, holes, depth, bevel) => { const L = seam(feats), R = L.map(([x, z]) => [-x, z]).reverse();
    return [L, R].map((h, k) => ({ type: "extrude", depth, bevel, rot: [-90, 0, 0], pts: h.map(([x, z]) => [x, -z]),
      holes: holes.filter(([x]) => (k ? x > 0 : x < 0)).map(([x, z, r]) => [x, -z, r]) })); };
  const tunnel = hw => ({ slot: 19, hw });
  const along = (A, dz, d) => { const t = TILT * Math.PI / 180; return [A[0], A[1] + Math.cos(t) * d, A[2] + dz * Math.sin(t) * d]; };

  // ---- head casting ----
  const head = [];
  head.push(...plate([tunnel(13)], [], 28, .5));                                                   // lower body (combustion side)
  head.push(...plate([{ c: -42, r: 9 }, tunnel(13), { c: 42, r: 9 }], CYL.map(x => [x, 0, 13]), 34, .5).map(g => ({ ...g, at: [0, 28, 0] }))); // valve-gear floor with plug wells and bolt pockets
  CYL.forEach(x => head.push({ type: "lathe", mat: "dark", pts: [[0, -.25], [32.5, -.25], [32.5, 0], [0, 0]], at: [x, 0, 0] }));              // combustion chambers
  for (let i = 0; i < 6; i++) { const y = 14 + 8 * i + 1.5;                                        // cooling fins round the outside
    [[1, 20.5], [-1, 22.5]].forEach(([s, g]) => { let x0 = -W - 3; [...CYL.map(c => [c - g, c + g]), [W + 3, W + 3]].forEach(([a, b]) => { // front and back strips, broken round the ports
      head.push({ type: "box", size: [a - x0, 3, 22], r: 1.2, at: [(a + x0) / 2, y, s * (D + 5)] }); x0 = b; }); });
    head.push({ type: "box", size: [9, 3, 2 * D + 32], r: 1.2, at: [-W + 1.5, y, 0] }, { type: "box", size: [9, 3, 2 * D + 32], r: 1.2, at: [W - 1.5, y, 0] }); }
  head.push({ type: "extrude", depth: 6, pts: [[-W, FLOOR], [W, FLOOR], [W, TOP], [-W, TOP]], holes: [[-75, 76, 7.5]], at: [0, 0, D - 6] });   // front wall of the cam box, tach drive bore
  head.push({ type: "extrude", depth: 6, pts: [[-W, FLOOR], [W, FLOOR], [W, TOP], [-W, TOP]], at: [0, 0, -D] });                                // rear wall
  head.push({ type: "extrude", depth: 6, rot: [0, 90, 0], pts: [[-D + 6, FLOOR], [D - 6, FLOOR], [D - 6, TOP], [-D + 6, TOP]], holes: [[ZC, 78, 11.5]], at: [-W, 0, 0] }); // left end wall with the plug bore
  head.push({ type: "box", size: [6, TOP - FLOOR, 2 * D - 12], r: .6, at: [W - 3, (FLOOR + TOP) / 2, 0] });                                    // right end wall
  head.push({ type: "cyl", r: 6, h: 3, axis: "z", at: [-55, 76, D] });                                                                         // boss for the tach plate screw
  const saddle = []; saddle.push([-12, FLOOR], [12, FLOOR], [12, TOP]); arc(0, TOP, 11, 0, -Math.PI, 16).forEach(q => saddle.push(q)); saddle.push([-12, TOP]);
  [-157, -87, -24, 24, 87, 157].forEach(x => [-ZC, ZC].forEach(z => head.push({ type: "extrude", depth: 10, rot: [0, 90, 0], pts: saddle.map(([u, v]) => [-u, v]), at: [x - 5, 0, z] }))); // cam journal saddles
  CYL.forEach(x => [-1, 1].forEach(s => head.push({ type: "group", rot: [s * TILT, 0, 0], at: [x, FLOOR, s * 26.5], items: [{ type: "ring", ro: 16, ri: 13.5, h: 22 }] }))); // tappet bores
  CYL.forEach(x => head.push({ type: "ring", ro: 16, ri: 13, h: TOP - FLOOR, at: [x, FLOOR, 0] }));                                            // spark plug wells
  CYL.forEach(x => {                                                                                                                         // exhaust ports (front), intake ports (rear, angled up)
    head.push({ type: "group", rot: [90, 0, 0], at: [x, 30, D - 6], items: [{ type: "lathe", pts: [[15, 0], [20, 0], [20, 22], [24, 22], [24, 26], [15, 26]] }, { type: "lathe", mat: "dark", pts: [[0, 8], [15, 8], [15, 9], [0, 9]] }] });
    head.push({ type: "group", rot: [-70, 0, 0], at: [x, 40, -D + 6], items: [{ type: "lathe", pts: [[17, 0], [22, 0], [22, 24], [25, 24], [25, 28], [17, 28]] }, { type: "lathe", mat: "dark", pts: [[0, 10], [17, 10], [17, 11], [0, 11]] }] }); });

  // ---- shared shapes ----
  const guide = s => ({ type: "array", pos: CYL.map(x => [x, 0, 0]), item: { type: "lathe", rot: [s * TILT, 0, 0], pts: [[3.5, -22], [5.6, -22], [6, -21], [6, 16], [5.4, 16.6], [3.5, 16.6]] } });
  const snap = s => ({ type: "array", pos: CYL.map(x => [x, 0, 0]), item: { type: "group", rot: [s * TILT, 0, 0], items: [{ type: "clip", R: 6.5, r: .75, gap: .5, at: [0, .75, 0] }] } });
  const capNut = { type: "group", items: [{ type: "hex", af: 14, h: 9, y: 0 }, { type: "lathe", pts: [[0, 9], [6.6, 9], [6.6, 10.5], [4.5, 13.2], [0, 14]] }] };
  const flBolt = (len, up) => up
    ? { type: "group", items: [{ type: "lathe", pts: [[0, 0], [3, 0], [3, len - .8], [2.4, len], [0, len]] }, { type: "lathe", pts: [[0, -1.5], [7, -1.5], [7, 0], [0, 0]] }, { type: "hex", af: 10, h: 5, y: -6.5 }] }
    : { type: "group", items: [{ type: "lathe", pts: [[0, 0], [3, 0], [3, -len + .8], [2.4, -len], [0, -len]] }, { type: "lathe", pts: [[0, 0], [7, 0], [7, 1.5], [0, 1.5]] }, { type: "hex", af: 10, h: 5, y: 1.5 }] };
  const plug = { type: "group", items: [
    { type: "lathe", pts: [[0, -19], [6.6, -19], [7, -18.4], [7, 0], [0, 0]] },
    { type: "lathe", mat: "zinc", pts: [[7, 0], [10, 0], [10, 1.5], [7, 1.5]] },
    { type: "hex", af: 20.8, h: 12, y: 1.5 },
    { type: "lathe", mat: "chrome", pts: [[0, 13.5], [9, 13.5], [7.6, 21], [6.2, 40], [5.8, 44], [0, 44]] },
    { type: "lathe", pts: [[0, 44], [3.6, 44], [3.6, 50], [2.6, 52], [0, 52]] } ] };
  const cap = { type: "group", items: [
    { type: "lathe", pts: [[0, 0], [9.5, 0], [9.5, 34], [10.5, 36], [10.5, 48], [8, 52], [0, 53]] },
    { type: "tube", mat: "rubber", r: 3.5, pts: [[0, 46, 0], [0, 55, -5], [0, 60, -22], [0, 62, -46]] } ] };
  const pad = { type: "group", items: [
    ...[19.5, 27.5, 35.5, 43.5, 51.5].map(y => ({ type: "box", size: [12, 4.6, 14], r: 1, at: [0, y, -7] })),
    { type: "box", size: [12, 42, 4], r: 1.2, at: [0, 35.5, 2] } ] };
  const tachPlate = []; arc(0, 0, 11, Math.PI * 32 / 180, Math.PI * 328 / 180, 20).forEach(q => tachPlate.push(q)); arc(20, 0, 6, -Math.PI / 2, Math.PI / 2, 10).forEach(q => tachPlate.push(q));
  const oringPts = []; arc(0, -19, 14.5, Math.PI, 2 * Math.PI, 12).forEach(([x, z]) => oringPts.push([x, 0, z])); arc(0, 19, 14.5, 0, Math.PI, 12).forEach(([x, z]) => oringPts.push([x, 0, z])); oringPts.push(oringPts[0]);

  const gIn = [0, FLOOR, -26.5], gEx = [0, FLOOR, 26.5];
  return {
    id: "CMS-BLCK0018", title: "Cylinder head", units: "mm", page: "BLCK0018",
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL cylinder head page. The 65 mm bore, the 12-nut head, 14 mm spark plugs and the washer, O-ring, pin and bolt sizes in the catalogue names are real figures; the casting, ports, fins and everything else are typical 1970s DOHC proportions, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [1.05, .95, 1.3], up: [0, 1, 0] },
    notModelled: "Ref 1 is drawn as the head casting itself (the catalogue sells it only as an assembly with guides fitted). Ref 20 covers two alternative spark plug numbers (20-1, 20-2): one plug per cylinder is drawn. The camshafts, cam holders, valves, springs, tappets, cam cover and the cylinder studs are on other pages and aren't drawn, so the head nuts sit on the bosses without their studs and the 6 mm under-bolts hang below the head where the cylinder flange would be.",
    stages: [
      { t: "Snap rings onto the valve guides", d: "Fit a snap ring into the groove on each new valve guide. The ring sets how deep the guide goes in." },
      { t: "Valve guides into the head", d: "Drive the guides in from the camshaft side until the snap ring sits on the head. Heating the head and reaming the guides afterwards: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Dowels and cam chain tunnel O-ring", d: "Fit the two dowel pins, the two hollow pins round the 6 mm bolt holes and a new O-ring round the cam chain tunnel. On the bike these go on the top of the cylinder before the head comes down." },
      { t: "Head gasket", d: "Lay a new head gasket on the cylinder over the dowels, then lower the head onto it with the cam chain fed up through the tunnel." },
      { t: "Head nuts and washers", d: "Copper gaskets and plain nuts go on the four studs next to the cam chain, plain washers and cap nuts on the other eight. Tightening order and torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "6 mm bolts", d: "Fit the two 6 mm bolts down through the head beside the cam chain tunnel, and the under-bolts up through the cylinder flange. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Oil bolt and plug", d: "Fit the small bolt with a new gasket into the back of the cam box and push the blanking plug into the left end of the head." },
      { t: "Fin pads", d: "Push the rubber anti-ringing pads into the fins between the cylinders, front and back." },
      { t: "Tachometer driven gear", d: "Slide the tachometer driven gear in through the bore in the front of the cam box so it meshes with the drive on the camshaft." },
      { t: "Seals onto the tach sleeve", d: "Press a new oil seal into the sleeve and fit a new O-ring on its outside." },
      { t: "Tach sleeve into the head", d: "Slide the sleeve over the gear shaft into the bore until the flange sits on the head." },
      { t: "Sleeve plate and screw", d: "Fit the plate over the sleeve flange and screw it to the head." },
      { t: "Spark plugs", d: "Screw the spark plugs into the bottom of the plug wells by hand first, then tighten. Gap and torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Plug well seals and caps", d: "Fit the plug well seals on top of the wells, push the caps down onto the plugs and slide the cap seals down to meet them." },
    ],
    parts: [
      { id: "head", shell: true, ref: "1", name: "Cylinder head", mat: "alu", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, -1, 0], geom: { type: "group", items: head } },

      { id: "guideIn", ref: "2", name: "Valve guides (intake)", mat: "brass", parent: "head", stage: 2, count: 4, A: gIn, E: along(gIn, -1, 100), dir: [0, -Math.cos(TILT * Math.PI / 180), Math.sin(TILT * Math.PI / 180)], geom: guide(-1) },
      { id: "guideEx", ref: "3", name: "Valve guides (exhaust)", mat: "brass", parent: "head", stage: 2, count: 4, A: gEx, E: along(gEx, 1, 100), dir: [0, -Math.cos(TILT * Math.PI / 180), -Math.sin(TILT * Math.PI / 180)], geom: guide(1) },
      { id: "snapIn", ref: "4", name: "Snap rings (intake guides)", mat: "spring", small: true, parent: "guideIn", stage: 1, count: 4, A: gIn, E: along(gIn, -1, 150), dir: [0, -Math.cos(TILT * Math.PI / 180), Math.sin(TILT * Math.PI / 180)], geom: snap(-1) },
      { id: "snapEx", ref: "4", name: "Snap rings (exhaust guides)", mat: "spring", small: true, parent: "guideEx", stage: 1, count: 4, A: gEx, E: along(gEx, 1, 150), dir: [0, -Math.cos(TILT * Math.PI / 180), -Math.sin(TILT * Math.PI / 180)], geom: snap(1) },

      { id: "oring", ref: "8", name: "O-ring (cam chain tunnel)", mat: "rubber", small: true, parent: "head", stage: 3, A: [0, 0, 0], E: [0, -30, 0], dir: [0, 1, 0], geom: { type: "tube", r: 1.5, pts: oringPts } },
      { id: "pin6", ref: "6", name: "Hollow pins (6 mm bolts)", mat: "steel", small: true, parent: "head", stage: 3, count: 2, A: [0, -5.5, 0], E: [0, -55, 0], dir: [0, 1, 0],
        geom: { type: "pair", at: [[0, 0, -42], [0, 0, 42]], item: { type: "ring", ro: 4, ri: 3.1, h: 11 } } },
      { id: "dowel", ref: "9", name: "Dowel pins (head to cylinder)", mat: "steel", small: true, parent: "head", stage: 3, count: 2, A: [0, -9, 0], E: [0, -78, 0], dir: [0, 1, 0],
        geom: { type: "pair", at: [[-166, 0, 0], [166, 0, 0]], item: { type: "ring", ro: 5.5, ri: 3.2, h: 18 } } },
      { id: "gasket", ref: "7", name: "Cylinder head gasket", mat: "steel", small: true, parent: "head", stage: 4, A: [0, -1.2, 0], E: [0, -96, 0], dir: [0, 1, 0],
        geom: { type: "group", items: plate([{ c: -42, r: 4.2 }, tunnel(16), { c: 42, r: 4.2 }],
          [...CYL.map(x => [x, 0, 33.5]), ...STUDS14.map(([x, z]) => [x, z, 5.6]), ...STUDS12.map(([x, z]) => [x, z, 5.6]), [-166, 0, 5.8], [166, 0, 5.8], [-166, 28, 3.4], [166, 28, 3.4], [-166, -28, 3.4], [166, -28, 3.4]], 1.2, 0) } },

      { id: "washer15", ref: "15", name: "Washers (head cap nuts)", mat: "steel", small: true, parent: "head", stage: 5, count: 8, A: [0, FLOOR, 0], E: [0, 240, 0], dir: [0, -1, 0],
        geom: { type: "array", pos: STUDS14.map(([x, z]) => [x, 0, z]), item: { type: "ring", ro: 10.8, ri: 5.25, h: 2.3 } } },
      { id: "nut14", ref: "14", name: "Head cap nuts", mat: "zinc", small: true, parent: "head", stage: 5, count: 8, A: [0, FLOOR + 2.3, 0], E: [0, 262, 0], dir: [0, -1, 0],
        geom: { type: "array", pos: STUDS14.map(([x, z]) => [x, 0, z]), item: capNut } },
      { id: "gasket13", ref: "13", name: "Copper gaskets (centre head nuts)", mat: "brass", small: true, parent: "head", stage: 5, count: 4, A: [0, FLOOR, 0], E: [0, 292, 0], dir: [0, -1, 0],
        geom: { type: "array", pos: STUDS12.map(([x, z]) => [x, 0, z]), item: { type: "ring", ro: 10.8, ri: 5.25, h: 2 } } },
      { id: "nut12", ref: "12", name: "Head nuts (centre, beside the cam chain)", mat: "zinc", small: true, parent: "head", stage: 5, count: 4, A: [0, FLOOR + 2, 0], E: [0, 308, 0], dir: [0, -1, 0],
        geom: { type: "array", pos: STUDS12.map(([x, z]) => [x, 0, z]), item: { type: "hex", af: 14, h: 10, y: 0, hole: 5 } } },

      { id: "bolt5", ref: "5", name: "Bolts 6 x 39 (beside the cam chain tunnel)", mat: "zinc", small: true, parent: "head", stage: 6, count: 2, A: [0, 28, 0], E: [0, 370, 0], dir: [0, -1, 0],
        geom: { type: "pair", at: [[0, 0, -42], [0, 0, 42]], item: flBolt(39, false) } },
      { id: "bolt10", ref: "10", name: "Under-bolts 6 x 45 (from the cylinder flange)", mat: "zinc", small: true, parent: "head", stage: 6, count: 2, A: [0, -30, 0], E: [0, -155, 0], dir: [0, 1, 0],
        geom: { type: "pair", at: [[-166, 0, 28], [166, 0, 28]], item: flBolt(45, true) } },
      { id: "bolt11", ref: "11", name: "Under-bolts 6 x 30 (from the cylinder flange)", mat: "zinc", small: true, parent: "head", stage: 6, count: 2, A: [0, -15, 0], E: [0, -140, 0], dir: [0, 1, 0],
        geom: { type: "pair", at: [[-166, 0, -28], [166, 0, -28]], item: flBolt(30, true) } },

      { id: "bolt16", ref: "16", name: "Bolt (cam box oil passage)", mat: "zinc", small: true, parent: "head", stage: 7, A: [75, 78, -D - 1.2], E: [75, 78, -160], dir: [0, 0, 1],
        geom: { type: "group", rot: [90, 0, 0], items: [{ type: "hex", af: 8, h: 4, y: -4 }, { type: "lathe", pts: [[0, 0], [2.5, 0], [2.5, 10], [0, 10]] }] } },
      { id: "gasket17", ref: "17", name: "Gasket (oil passage bolt)", mat: "brass", small: true, parent: "bolt16", stage: 7, A: [75, 78, -D - 1.2], E: [75, 78, -130], dir: [0, 0, 1],
        geom: { type: "ring", rot: [90, 0, 0], ro: 4.65, ri: 2.65, h: 1.2 } },
      { id: "plug18", ref: "18", name: "Blanking plug (left end of head)", mat: "rubber", small: true, parent: "head", stage: 7, A: [-W, 78, -ZC], E: [-245, 78, -ZC], dir: [1, 0, 0],
        geom: { type: "lathe", rot: [0, 0, 90], pts: [[0, -6], [11.5, -6], [11.5, 0], [13.5, 0], [13.5, 2.5], [0, 2.5]] } },

      { id: "padF", ref: "19", name: "Fin pads (front)", mat: "rubber", parent: "head", stage: 8, count: 2, A: [0, 0, D + 16], E: [0, 0, 175], dir: [0, 0, -1],
        geom: { type: "pair", at: [[-87, 0, 0], [87, 0, 0]], item: pad } },
      { id: "padR", ref: "19", name: "Fin pads (rear)", mat: "rubber", parent: "head", stage: 8, count: 2, A: [0, 0, -D - 16], E: [0, 0, -175], dir: [0, 0, 1],
        geom: { type: "pair", at: [[-87, 0, 0, 180], [87, 0, 0, 180]], item: pad } },

      { id: "tgear", ref: "25", name: "Tachometer driven gear", mat: "steel", parent: "head", stage: 9, A: [-75, 76, 30.5], E: [-75, 76, 150], dir: [0, 0, -1],
        geom: { type: "group", rot: [90, 0, 0], items: [{ type: "gear", r: 5.5, teeth: 14, h: 8, toothH: 1.2 }, { type: "cyl", r: 3, h: 52, at: [0, 8, 0] }, { type: "box", size: [3.2, 6, 3.2], r: .3, at: [0, 62, 0] }] } },
      { id: "tsleeve", ref: "26", name: "Tachometer drive sleeve", mat: "alu", parent: "head", stage: 11, A: [-75, 76, 66], E: [-75, 76, 285], dir: [0, 0, -1],
        geom: { type: "lathe", rot: [90, 0, 0], pts: [[5.5, 0], [7.3, 0], [7.3, 10], [11, 10], [11, 13], [7, 13], [7, 26], [3.1, 26], [3.1, 5], [5.5, 5]] } },
      { id: "tseal", ref: "27", name: "Tachometer driven gear oil seal", mat: "rubber", small: true, parent: "tsleeve", stage: 10, A: [-75, 76, 66.3], E: [-75, 76, 235], dir: [0, 0, -1],
        geom: { type: "ring", rot: [90, 0, 0], ro: 5.5, ri: 3.1, h: 4.5 } },
      { id: "toring", ref: "28", name: "O-ring (tach sleeve)", mat: "rubber", small: true, parent: "tsleeve", stage: 10, A: [-75, 76, 72], E: [-75, 76, 260], dir: [0, 0, -1],
        geom: { type: "torus", rot: [90, 0, 0], R: 7.4, r: 1 } },
      { id: "tplate", ref: "29", name: "Tach sleeve plate", mat: "steel", parent: "head", stage: 12, A: [-75, 76, 79], E: [-75, 76, 325], dir: [0, 0, -1],
        geom: { type: "extrude", depth: 1.6, bevel: 0, pts: tachPlate, holes: [[0, 0, 7.2], [20, 0, 2.8]] } },
      { id: "tscrew", ref: "30", name: "Screw 5 x 12 (tach plate)", mat: "zinc", small: true, parent: "tplate", stage: 12, A: [-55, 76, 80.6], E: [-55, 76, 350], dir: [0, 0, -1],
        geom: { type: "lathe", rot: [-90, 0, 0], pts: [[0, -3.4], [3.6, -3.4], [4.5, -2], [4.5, 0], [2.5, 0], [2.5, 12], [0, 12]] } },

      { id: "plugs", ref: "20", name: "Spark plugs", mat: "steel", parent: "head", stage: 13, count: 4, A: [0, 28, 0], E: [0, 415, 0], dir: [0, -1, 0],
        geom: { type: "array", pos: CYL.map(x => [x, 0, 0]), item: plug } },
      { id: "seal23", ref: "23", name: "Spark plug well seals", mat: "rubber", small: true, parent: "head", stage: 14, count: 4, A: [0, TOP, 0], E: [0, 495, 0], dir: [0, -1, 0],
        geom: { type: "array", pos: CYL.map(x => [x, 0, 0]), item: { type: "lathe", pts: [[9.6, -8], [12.8, -8], [12.8, 0], [17, 0], [17, 4], [14, 7], [9.6, 7]] } } },
      { id: "seal24", ref: "24", name: "Spark plug cap seals", mat: "rubber", small: true, parent: "head", stage: 14, count: 4, A: [0, TOP + 7, 0], E: [0, 525, 0], dir: [0, -1, 0],
        geom: { type: "array", pos: CYL.map(x => [x, 0, 0]), item: { type: "lathe", pts: [[9.6, 0], [12.5, 0], [10.6, 9], [9.6, 9]] } } },
      { id: "cap22", ref: "22", name: "Spark plug cap assemblies (cylinders 2 and 3)", mat: "black", parent: "head", stage: 14, count: 2, A: [0, 66, 0], E: [0, 550, 0], dir: [0, -1, 0],
        geom: { type: "pair", at: [[-52, 0, 0], [52, 0, 0]], item: cap } },
      { id: "cap21", ref: "21", name: "Spark plug caps (cylinders 1 and 4)", mat: "black", parent: "head", stage: 14, count: 2, A: [0, 66, 0], E: [0, 640, 0], dir: [0, -1, 0],
        geom: { type: "pair", at: [[-122, 0, 0], [122, 0, 0]], item: cap } },
    ],
  };
})();
D3_MODELS["CMS-BLCK0018"] = D3_BLCK0018;
