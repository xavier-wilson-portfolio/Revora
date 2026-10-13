/* ============ 3D parts model: speedometer and tachometer, GS750C/EC/N/EN (CMSNL BLCK0066) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: +X = rider's LEFT, +Y up, +Z forward. Origin at the middle of the meter case face, centred between the two
   meters. The speedometer is on the left (+X), the tachometer on the right (-X).
   The meter cluster is tilted back toward the rider: its own frame ("meter frame") is the world frame turned -40 degrees
   about X, so a meter's axis (meter-frame +Y) points up and back. Cluster parts are drawn in the meter frame and turned
   into place with rot [-40, 0, 0]; M() turns a meter-frame point or offset into world coordinates.
   Stack along the meter axis, top down: case (ref 5) with the meters (1, 3) dropped in from below, pilot lamp box (22) and
   gear indicator (14, 15, 16, 17, 18) between the meters, under plate (7) screwed to the meter cans (11), under cover (21),
   cushion A (8), the bracket's meter plate (6), cushion B (9) and nut (10) on studs welded under plate 7. The bracket bends
   down to a flat foot that bolts to the steering stem upper bracket (context part, frame page) through rubber cushions
   (25): bolt 24 and washer 26 on top, washer 27 under, lock washer 28 and nut 29 under the upper bracket. Cables run from
   the drive bosses under each meter; the speedometer cable passes through the guide (31) bolted under the upper bracket.
   Real figures used (catalogue descriptions): bolt 8 x 31, washer 8.7 x 22 x 2, bulbs 12 V 3.4 W and 14 V 1.12 W. Everything else (meter size about
   100 mm, case, plates, bracket, cushions, cable runs) is a typical 1970s proportion, not measured from a GS750. */
const D3_BLCK0066 = (() => {
  const r2 = v => Math.round(v * 100) / 100;
  const C = Math.cos(-40 * Math.PI / 180), S = Math.sin(-40 * Math.PI / 180);
  const M = ([x, y, z]) => [r2(x), r2(y * C - z * S), r2(y * S + z * C)];          // meter frame -> world
  const tilt = items => ({ type: "group", rot: [-40, 0, 0], items });
  // flat outline [x, z] extruded along +Y from y0 by h (works in any frame)
  const flat = (pts, h, y0, holes, extra) => ({ type: "extrude", pts: pts.map(([x, z]) => [r2(x), r2(-z)]), holes: (holes || []).map(([x, z, r]) => [r2(x), r2(-z), r]),
    depth: h, bevel: .6, rot: [-90, 0, 0], at: [0, y0, 0], ...(extra || {}) });
  const arc = (cx, cz, r, a0, a1, n = 16) => Array.from({ length: n + 1 }, (_, k) => { const a = (a0 + (a1 - a0) * k / n) * Math.PI / 180; return [r2(cx + r * Math.cos(a)), r2(cz + r * Math.sin(a))]; });
  const stadium = r => [...arc(70, 0, r, -90, 90), ...arc(-70, 0, r, 90, 270)];
  const SP = 70, TA = -70;                                   // meter centres (x) in the meter frame

  // ---- meter head: hollow can, chrome bezel, dial, needle, cable drive boss underneath ----
  const ticks = Array.from({ length: 13 }, (_, k) => { const a = (-135 - k * 22.5) * Math.PI / 180; return [r2(38 * Math.cos(a)), 2.8, r2(38 * Math.sin(a)), r2(-(-135 - k * 22.5) + 90)]; });
  const head = (cx, extra) => tilt([
    { type: "lathe", pts: [[0, -58], [46, -58], [46, 4], [50.5, 5], [51, 7], [49, 9], [45, 9.5], [44, 9.5], [44, -55], [0, -55]], at: [cx, 0, 0] },
    { type: "cyl", r: 44, h: 1.5, at: [cx, 1, 0], mat: "black" },
    { type: "group", at: [cx, 0, 0], mat: "alu", items: [{ type: "array", pos: ticks, item: { type: "box", size: [1.2, .6, 6], r: .2 } }] },
    { type: "cyl", r: 4, h: 3, at: [cx, 2.5, 0], mat: "chrome" },
    { type: "box", size: [2.2, 1, 34], r: .3, rot: [0, -130, 0], at: [cx - 13, 3.6, -11], mat: "alu" },
    { type: "cyl", r: 9, h: 14, at: [cx, -72, 0] },                                             // cable drive boss
    { type: "cyl", r: 6, h: 3, at: [cx, -75, 0], mat: "dark" },
    ...(extra || []) ]);
  const speedo = head(SP, [
    { type: "box", size: [22, .8, 6], r: .3, at: [SP, 2.9, 16], mat: "alu" },                  // odometer window
    { type: "cyl", r: 2, h: 10, at: [SP, 1, -30], mat: "steel" } ]);                            // trip reset shaft
  const tacho = head(TA, [{ type: "box", size: [16, .8, 5], r: .3, rot: [0, 30, 0], at: [TA - 30, 2.9, 22], mat: "dark" }]);

  // ---- case: face plate with two meter openings, lamp windows, cups round each meter ----
  const caseG = tilt([
    flat(stadium(60), 6, -2, [[SP, 0, 47], [TA, 0, 47], [0, -42, 4.5], [0, -30, 4.5], [0, -18, 4.5], [0, -6, 4.5], [0, 16, 5.5], [0, 30, 5.5]]),
    { type: "ring", ro: 54, ri: 51, h: 60, at: [SP, -62, 0] }, { type: "ring", ro: 54, ri: 51, h: 60, at: [TA, -62, 0] },
    { type: "box", size: [30, 1, 74], r: .3, at: [0, 4.3, -14], mat: "dark" },                    // lamp panel strip
  ]);
  // ---- pilot lamp box, gear indicator (case, lower cover, bulbs), gear indicator lead and plug ----
  const pilot = tilt([
    { type: "box", size: [28, 32, 48], r: 2, at: [0, -20, -24] },
    { type: "box", size: [12, 4, 8], r: 1, at: [0, -6, -54] } ]);
  const gcase = tilt([
    { type: "box", size: [24, 20, 34], r: 2, at: [0, -14, 23] },
    { type: "box", size: [12, 4, 8], r: 1, at: [0, -6, 46] } ]);
  const gcover = tilt([{ type: "box", size: [24, 3, 34], r: .8, at: [0, -25.5, 23] }]);
  const GB = [[6, -24, 13], [-6, -24, 13], [6, -24, 23], [-6, -24, 23], [6, -24, 33], [-6, -24, 33]];
  const lead = tilt([
    { type: "tube", pts: [[0, -27, 23], [0, -45, 18], [0, -64, 12], [0, -85, 4], [0, -110, -10], [0, -122, -14]], r: 2.5, mat: "black" },
    { type: "box", size: [14, 10, 20], r: 1.5, at: [0, -128, -16], mat: "dark" },
    { type: "box", size: [10, 2, 10], r: .5, at: [0, -65, 31], mat: "steel" },
    { type: "tube", pts: [[0, -65, 26], [0, -64.5, 20], [0, -64, 12.5]], r: 1, mat: "steel" } ]);
  const SOCK = [[SP + 25, -58, -20], [SP - 25, -58, -20], [TA + 25, -58, -20], [TA - 25, -58, -20], [0, -36, -42], [0, -36, -30], [0, -36, -18], [0, -36, -6]];
  const sockets = tilt([{ type: "array", pos: SOCK, item: { type: "lathe", pts: [[0, 0], [5, 0], [5.5, -2], [5, -14], [2.5, -16], [0, -16]] } }]);
  const bulbs = tilt([{ type: "array", pos: SOCK, item: { type: "group", items: [{ type: "cyl", r: 3.2, h: 6 }, { type: "sphere", r: 4.2, at: [0, 9, 0], mat: "chrome" }] } }]);
  // ---- under plate with two mounting studs, under cover ----
  const SCR = [[SP + 30, 25], [SP - 30, 25], [TA + 30, 25], [TA - 30, 25]], STUD = [[60, 34], [-60, 34]];
  const plate7 = tilt([
    flat(stadium(56), 2, -64, [[SP, 0, 10], [TA, 0, 10], ...SCR.map(([x, z]) => [x, z, 2.2]), ...SOCK.slice(0, 4).map(([x, , z]) => [x, z, 6]), [0, 10, 6]]),
    ...STUD.map(([x, z]) => ({ type: "cyl", r: 2.5, h: 48, at: [x, -112, z] })) ]);
  const cover = tilt([flat(stadium(60), 3, -80, [[SP, 0, 10], [TA, 0, 10], ...STUD.map(([x, z]) => [x, z, 3.2]), [0, 4, 6]])]);

  // ---- bracket: meter plate (tilted), web, flat foot on the steering stem upper bracket ----
  const FOOT = [[45, 52], [-45, 52]];
  const bracket = { type: "group", items: [
    tilt([flat([[-100, 14], [100, 14], [100, 54], [-100, 54]], 4, -96, STUD.map(([x, z]) => [x, z, 9]))]),
    { type: "box", size: [120, 84, 4], r: 1, at: [0, -104, 72] },
    flat([[-60, 35], [60, 35], [60, 74], [-60, 74]], 4, -150, FOOT.map(([x, z]) => [x, z, 10.5])) ] };
  const upper = flat([[-130, -70], [130, -70], [150, -30], [148, 10], [120, 45], [70, 64], [-70, 64], [-120, 45], [-148, 10], [-150, -30]], 5, -163,
    [[110, -10, 20], [-110, -10, 20], [0, -30, 13], [45, 52, 4.5], [-45, 52, 4.5], [85, 42, 3.2]]);

  // ---- cables: ferrule nut on the meter boss, inner run, end fitting ----
  const cable = (cx, pts) => ({ type: "group", items: [
    tilt([{ type: "hex", af: 14, h: 12, y: -87, at: [cx, 0, 0] }, { type: "cyl", r: 5, h: 8, at: [cx, -95, 0] }]),
    { type: "tube", pts: [M([cx, -95, 0]), M([cx, -112, 0]), ...pts], r: 3.5, mat: "black" },
    { type: "cyl", r: 5.5, h: 22, at: [pts[pts.length - 1][0], pts[pts.length - 1][1] - 22, pts[pts.length - 1][2]] },
    { type: "hex", af: 12, h: 8, y: pts[pts.length - 1][1] - 30, at: [pts[pts.length - 1][0], 0, pts[pts.length - 1][2]] } ] });
  const speedoCable = cable(SP, [[76, -120, 72], [82, -145, 75], [85, -164, 76], [89, -240, 82], [96, -380, 102], [100, -520, 128]]);
  const tachoCable = cable(TA, [[-76, -120, 72], [-80, -145, 75], [-84, -200, 78], [-86, -290, 55], [-82, -380, 5], [-76, -440, -40]]);

  // explode helpers: meter-frame offset, world offset
  const L = (x, y, z) => M([x, y, z]), W = (x, y, z) => [x, y, z];
  const at = (x, y, z, item) => ({ ...item, at: [x, y, z] });

  return {
    id: "CMS-BLCK0066", title: "Speedometer and tachometer (GS750C, EC, N, EN)", units: "mm", page: "BLCK0066",
    accuracy: "Approximate geometry. Part identity, numbering and the layout follow the CMSNL speedometer and tachometer (GS750C, EC, N, EN) page and its picture. The 8 x 31 mounting bolt, the 8.7 x 22 x 2 washer and the bulb ratings come from the catalogue descriptions; the meter size, case, plates, bracket, cushions and cable runs are typical 1970s proportions, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [1.1, .75, -.75], up: [0, 1, 0] },
    notModelled: "Refs 0-1 and 0-2 (speedometer assembly) are complete meters and aren't separate parts; ref 1 (1-1, 1-2) is drawn as the speedometer head. Ref 13 (gear position indicator assembly) is the case 14, lower cover 15, screws 16 and 18 and bulbs 17, all drawn on their own. Ref 5 covers 5-1 (case set) and 5-2 (case), drawn as one case. Refs with -1/-2 suffixes (3, 4, 21, 22, 34) are earlier and later numbers or small variants of the same part, so one of each is shown. Ref 12 is drawn as the gear indicator lead and plug held by a clip and screw 19; what refs 12 and 19 are exactly isn't clear from the catalogue text, so that is a best reading of the picture. The steering stem upper bracket (marked —) is a frame part and is only there to show what the bracket bolts to; its thickness is a guess picked so the 31 mm bolt reaches the nut. Bulb and socket counts are a best reading of the picture. The meter wiring loom, the front wheel gearbox and the engine drive aren't drawn, and the cables are shortened.",
    stages: [
      { t: "Meters into the case", d: "Turn the case face down and drop the speedometer and the tachometer into their cups." },
      { t: "Under plate", d: "Lay the under plate over the backs of the meters, studs pointing away, and screw it to both meter cans." },
      { t: "Pilot box, gear indicator and trip knob", d: "Screw the pilot lamp box under the middle of the case. Fit the bulbs in the gear indicator case, screw on its lower cover with the lead, and screw the case under the case windows. Clip the lead under the plate area and push the knob onto the trip reset shaft." },
      { t: "Bulbs and sockets", d: "Push the bulbs into their sockets and the sockets into the backs of the meters and the pilot lamp box." },
      { t: "Under cover", d: "Fit the under cover over the studs, with the cables and leads through their holes." },
      { t: "Bracket on the steering head", d: "Fit the rubber cushions in the bracket foot. Put the bracket on the upper bracket and fit the bolts with washer 26 on top of the cushion and washer 27 under it." },
      { t: "Bracket nuts", d: "Fit the lock washers and nuts under the upper bracket. Tighten them only enough to hold, so the cushions are not crushed. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Meters onto the bracket", d: "Fit cushion A over each stud, lower the meters onto the bracket, then cushion B and the nut under the bracket. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Cables", d: "Screw the speedometer and tachometer cables onto the drive bosses under the meters, finger tight and then a little more." },
      { t: "Cable guide", d: "Clip the guide round the speedometer cable and bolt it under the upper bracket with the washer." },
    ],
    parts: [
      { id: "upper", ref: "—", name: "Steering stem upper bracket (frame part, shown for position)", mat: "alu", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, -1, 0], geom: upper },
      { id: "case", ref: "5", name: "Meter case", mat: "dark", shell: true, stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, -1, 0], geom: caseG },
      { id: "speedo", ref: "1", name: "Speedometer head", mat: "chrome", parent: "case", stage: 1, A: [0, 0, 0], E: L(60, -250, 0), dir: M([0, 1, 0]), geom: speedo },
      { id: "tacho", ref: "3", name: "Tachometer", mat: "chrome", parent: "case", stage: 1, A: [0, 0, 0], E: L(-60, -250, 0), dir: M([0, 1, 0]), geom: tacho },
      { id: "plate7", ref: "7", name: "Meter under plate", mat: "steel", parent: "case", stage: 2, A: [0, 0, 0], E: L(0, -420, 0), dir: M([0, 1, 0]), geom: plate7 },
      { id: "screws", ref: "11", name: "Screws (under plate to meters)", mat: "zinc", small: true, parent: "plate7", stage: 2, A: [0, 0, 0], E: L(0, -500, 0), dir: M([0, 1, 0]), count: 4,
        geom: tilt([{ type: "array", pos: SCR.map(([x, z]) => [x, -66, z]), item: { type: "lathe", pts: [[0, 0], [3.6, 0], [3.6, 1.5], [3, 2], [2, 2], [2, 12], [0, 12]] } }]) },
      { id: "pilot", ref: "22", name: "Pilot lamp box", mat: "dark", parent: "case", stage: 3, A: [0, 0, 0], E: L(0, -300, 0), dir: M([0, 1, 0]), geom: pilot },
      { id: "pscrew", ref: "23", name: "Screw (pilot lamp box)", mat: "zinc", small: true, parent: "pilot", stage: 3, A: [0, 0, 0], E: L(0, -300, -70), dir: M([0, 1, 0]),
        geom: tilt([{ type: "lathe", pts: [[0, 0], [3, 0], [3, 1.6], [1.5, 2], [1.5, 12], [0, 12]], at: [0, -10, -54] }]) },
      { id: "gcase", ref: "14", name: "Gear indicator case", mat: "dark", parent: "case", stage: 3, A: [0, 0, 0], E: L(0, -130, 0), dir: M([0, 1, 0]), geom: gcase },
      { id: "gscrew", ref: "18", name: "Screw (gear indicator to case)", mat: "zinc", small: true, parent: "gcase", stage: 3, A: [0, 0, 0], E: L(0, -130, 60), dir: M([0, 1, 0]),
        geom: tilt([{ type: "lathe", pts: [[0, 0], [3, 0], [3, 1.6], [1.5, 2], [1.5, 12], [0, 12]], at: [0, -10, 46] }]) },
      { id: "gbulbs", ref: "17", name: "Gear indicator bulbs (14 V 1.12 W)", mat: "brass", small: true, parent: "gcase", stage: 3, A: [0, 0, 0], E: L(0, -100, 190), dir: M([0, 1, 0]), count: 6,
        geom: tilt([{ type: "array", pos: GB, item: { type: "group", items: [{ type: "cyl", r: 2, h: 4 }, { type: "sphere", r: 2.6, at: [0, 6, 0], mat: "chrome" }] } }]) },
      { id: "gcover", ref: "15", name: "Gear indicator lower cover", mat: "black", parent: "gcase", stage: 3, A: [0, 0, 0], E: L(0, -190, 0), dir: M([0, 1, 0]), geom: gcover },
      { id: "gcscrews", ref: "16", name: "Screws (gear indicator cover)", mat: "zinc", small: true, parent: "gcover", stage: 3, A: [0, 0, 0], E: L(0, -235, 0), dir: M([0, 1, 0]), count: 2,
        geom: tilt([{ type: "pair", at: [[0, -29, 10], [0, -29, 36]], item: { type: "lathe", pts: [[0, 0], [2.6, 0], [2.6, 1.4], [1.3, 2], [1.3, 12], [0, 12]] } }]) },
      { id: "lead", ref: "12", name: "Gear indicator lead and plug", mat: "black", parent: "gcover", stage: 3, A: [0, 0, 0], E: L(0, -120, -160), dir: M([0, 1, 0]), geom: lead },
      { id: "lscrew", ref: "19", name: "Screw (lead clip)", mat: "zinc", small: true, parent: "lead", stage: 3, A: [0, 0, 0], E: L(0, -170, -160), dir: M([0, 1, 0]),
        geom: tilt([{ type: "lathe", pts: [[0, 0], [3, 0], [3, 1.6], [1.5, 2], [1.5, 6], [0, 6]], at: [0, -68, 31] }]) },
      { id: "knob", ref: "2", name: "Knob (trip reset)", mat: "black", small: true, parent: "speedo", stage: 3, A: [0, 0, 0], E: L(0, 45, 0), dir: M([0, -1, 0]),
        geom: tilt([{ type: "lathe", pts: [[1.9, 0], [5, 0], [5.5, 1], [5.5, 6], [4.5, 7], [0, 7], [0, 3], [1.9, 3]], at: [SP, 10, -30] }]) },
      { id: "bulbs", ref: "20", name: "Bulbs (12 V 3.4 W)", mat: "brass", small: true, parent: "case", stage: 4, A: [0, 0, 0], E: L(0, -200, 190), dir: M([0, 1, 0]), count: 8, geom: bulbs },
      { id: "sockets", ref: "4", name: "Meter lamp sockets", mat: "rubber", parent: "case", stage: 4, A: [0, 0, 0], E: L(0, -250, 190), dir: M([0, 1, 0]), count: 8, geom: sockets },
      { id: "cover", ref: "21", name: "Under cover", mat: "black", shell: true, parent: "plate7", stage: 5, A: [0, 0, 0], E: L(0, -560, 0), dir: M([0, 1, 0]), geom: cover },
      { id: "bracket", ref: "6", name: "Meter bracket", mat: "steel", stage: 6, A: [0, 0, 0], E: W(0, 120, 300), dir: [0, -1, 0], geom: bracket },
      { id: "cush17", ref: "25", name: "Cushions (bracket foot)", mat: "rubber", small: true, parent: "bracket", stage: 6, A: [0, 0, 0], E: W(0, 120, 390), dir: [0, -1, 0], count: 2,
        geom: { type: "pair", at: FOOT.map(([x, z]) => [x, 0, z]), item: { type: "lathe", pts: [[5.2, -156], [14, -156], [14, -150], [10.4, -150], [10.4, -146], [14, -146], [14, -140], [5.2, -140]] } } },
      { id: "w20", ref: "27", name: "Washers, 8.7 x 22 x 2 (under the cushions)", mat: "zinc", small: true, parent: "bracket", stage: 6, A: [0, 0, 0], E: W(0, 95, 390), dir: [0, 1, 0], count: 2,
        geom: { type: "pair", at: FOOT.map(([x, z]) => [x, -158, z]), item: { type: "ring", ro: 11, ri: 4.35, h: 2 } } },
      { id: "w18", ref: "26", name: "Washers (under the bolt heads)", mat: "zinc", small: true, parent: "bracket", stage: 6, A: [0, 0, 0], E: W(0, 170, 390), dir: [0, -1, 0], count: 2,
        geom: { type: "pair", at: FOOT.map(([x, z]) => [x, -140, z]), item: { type: "ring", ro: 8.5, ri: 4.3, h: 1.6 } } },
      { id: "bolts16", ref: "24", name: "Bolts, 8 x 31 (bracket)", mat: "zinc", small: true, parent: "bracket", stage: 6, A: [0, 0, 0], E: W(0, 230, 390), dir: [0, -1, 0], count: 2,
        geom: { type: "pair", at: FOOT.map(([x, z]) => [x, -138.4, z]), item: { type: "group", items: [
          { type: "hex", af: 12, h: 5.5, y: 0 }, { type: "lathe", pts: [[0, -31], [3.6, -31], [4, -30], [4, 0], [0, 0]] } ] } } },
      { id: "lw21", ref: "28", name: "Lock washers (bracket)", mat: "spring", small: true, parent: "upper", stage: 7, A: [0, 0, 0], E: W(0, 40, 390), dir: [0, 1, 0], count: 2,
        geom: { type: "pair", at: FOOT.map(([x, z]) => [x, -165, z]), item: { type: "ring", ro: 7.5, ri: 4.1, h: 2, split: true } } },
      { id: "nut22", ref: "29", name: "Nuts (bracket)", mat: "zinc", small: true, parent: "upper", stage: 7, A: [0, 0, 0], E: W(0, 10, 390), dir: [0, 1, 0], count: 2,
        geom: { type: "pair", at: FOOT.map(([x, z]) => [x, -171.5, z]), item: { type: "hex", af: 13, h: 6.5, y: 0, hole: 4 } } },
      { id: "cush8", ref: "8", name: "Cushions A (on the bracket)", mat: "rubber", small: true, parent: "bracket", stage: 8, A: [0, 0, 0], E: L(0, -680, 0), dir: M([0, -1, 0]), count: 2,
        geom: tilt([{ type: "pair", at: STUD.map(([x, z]) => [x, -92, z]), item: { type: "ring", ro: 11, ri: 2.6, h: 12 } }]) },
      { id: "cush9", ref: "9", name: "Cushions B (under the bracket)", mat: "rubber", small: true, parent: "bracket", stage: 8, A: [0, 0, 0], E: L(0, -780, 0), dir: M([0, 1, 0]), count: 2,
        geom: tilt([{ type: "pair", at: STUD.map(([x, z]) => [x, 0, z]), item: { type: "lathe", pts: [[2.6, -104], [11, -104], [11, -96], [8.8, -96], [8.8, -92], [2.6, -92]] } }]) },
      { id: "nut10", ref: "10", name: "Nuts (meter studs)", mat: "zinc", small: true, parent: "plate7", stage: 8, A: [0, 0, 0], E: L(0, -830, 0), dir: M([0, 1, 0]), count: 2,
        geom: tilt([{ type: "pair", at: STUD.map(([x, z]) => [x, 0, z]), item: { type: "hex", af: 8, h: 5, y: -109, hole: 2.5 } }]) },
      { id: "scable", ref: "30", name: "Speedometer cable", mat: "chrome", parent: "speedo", stage: 9, A: [0, 0, 0], E: W(200, -40, 80), dir: M([0, 1, 0]), geom: speedoCable },
      { id: "tcable", ref: "34", name: "Tachometer cable", mat: "chrome", parent: "tacho", stage: 9, A: [0, 0, 0], E: W(-200, -40, 80), dir: M([0, 1, 0]), geom: tachoCable },
      { id: "guide", ref: "31", name: "Speedometer cable guide", mat: "steel", parent: "upper", stage: 10, A: [0, 0, 0], E: W(80, -20, 0), dir: [0, 1, 0],
        geom: { type: "group", items: [flat([[79, 34], [91, 34], [91, 70], [79, 70]], 2, -165, [[85, 42, 3.2]]), at(85, -164, 76, { type: "torus", R: 6, r: 1.6 })] } },
      { id: "w26", ref: "32", name: "Washer, 6 mm (guide bolt)", mat: "zinc", small: true, parent: "guide", stage: 10, A: [0, 0, 0], E: W(80, -40, 0), dir: [0, 1, 0],
        geom: { type: "ring", ro: 6.5, ri: 3.2, h: 1.6, at: [85, -166.6, 42] } },
      { id: "bolt28", ref: "33", name: "Bolt (guide)", mat: "zinc", small: true, parent: "guide", stage: 10, A: [0, 0, 0], E: W(80, -80, 0), dir: [0, 1, 0],
        geom: { type: "group", at: [85, -166.6, 42], items: [{ type: "hex", af: 10, h: 4.4, y: -4.4 }, { type: "lathe", pts: [[0, 0], [3, 0], [3, 8], [2.6, 8.5], [0, 8.5]] }] } },
    ],
  };
})();
D3_MODELS["CMS-BLCK0066"] = D3_BLCK0066;
