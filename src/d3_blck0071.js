/* ============ 3D parts model: steering stem, GS750B 1977 (CMSNL BLCK0071) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: the same axes as the front fork leg model (DG-CH-01): +Y up, +Z forward, +X to the rider's left.
   The steering axis is drawn vertical (rake ignored) along X = 0, Z = 0. The fork tubes (not on this page) run parallel
   to it at X = +/-105, Z = +48 (48 mm offset ahead of the stem), with the 36 mm tube diameter of DG-CH-01 (bore r 18).
   Heights: the lower bracket stands on Y = 0; the stem runs up to Y = 272; the frame head pipe (not drawn, frame page)
   would run from about Y = 40 to Y = 231 between the two bearing cups; the top bracket sits on the stem from Y = 248.
   Bearings: loose 1/4 in balls (ref 23) between cup-and-cone races. The lower cone (ref 21) is pressed on the base of the stem;
   the two cups (refs 3 and 22) are pressed into the ends of the head pipe. No separate upper cone is listed on this page, so
   the underside of the stem nut (ref 20) is drawn as the upper cone. That is a guess; check it on the bike.
   Headlamp brackets: drawn as split collars round each fork tube between the brackets, lined with the rubber cushion (ref 6)
   and pinched by the 8 x 50 bolt, washer, lock washer and nut (refs 9 to 12), with an arm forward for the headlamp shell.
   This is the most plausible use of those parts found without the picture; the real brackets may differ.
   Fork cover (ref 25) and reflector (ref 26): drawn as a cover plate across the front of the lower bracket with the front
   reflector on it. Uncertain; compare with the CMSNL picture.
   Identity and numbering: CMSNL steering stem (GS750B) page, refs 1 to 26. Bolt sizes in the names come from the catalogue
   descriptions (12 x 20, 8 x 50, 10 x 40) and the part numbers (01204-08357 read as 8 x 35); the stem nut size 25 x 44 x 10
   is from the catalogue. Everything else (bracket spread, offset, head pipe length, ball count) is typical proportion for a
   1970s 750 cc Japanese four, not a factory figure.
   Every part's geometry is laid out in world coordinates, so every A is [0, 0, 0] and E is the exploded offset. */
const D3_BLCK0071 = (() => {
  const r3 = v => +(+v).toFixed(3);
  const TX = 105, TZ = 48, TR = 18;                         // fork tube centres and bore radius
  const RB = 3.175, D45 = RB / Math.SQRT2;                  // 1/4 in ball radius, its 45 degree contact offset
  // rotations that turn local +Y into a world direction
  const ROT = { "+Y": [0, 0, 0], "-Y": [180, 0, 0], "+X": [0, 0, -90], "-X": [0, 0, 90], "+Z": [90, 0, 0], "-Z": [-90, 0, 0] };
  // bolt: local y = 0 is the underside of the head, shank runs along +y for L, hex head below
  const bolt = (L, r, af, hh, d, at) => ({ type: "group", rot: ROT[d], at, items: [
    { type: "lathe", pts: [[0, 0], [r, 0], [r, L - r * .4], [r * .6, L], [0, L]] },
    { type: "hex", af, h: hh, y: -hh },
    { type: "lathe", pts: [[r, -.01], [af * .55, -.01], [af * .55, .6], [r, .6]] } ] });
  const ringOn = (ro, ri, h, d, at, split) => ({ type: "ring", ro, ri, h, split: !!split, rot: ROT[d], at });
  const nutOn = (af, h, hole, d, at) => ({ type: "hex", af, h, y: 0, hole, rot: ROT[d], at });

  // convex hull of sampled circles, returned as an extrude outline in the XZ plane ([x, -z]) for rot [-90, 0, 0]
  const hull = circles => {
    const P = []; circles.forEach(([x, z, r]) => { for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; P.push([x + r * Math.cos(a), -(z + r * Math.sin(a))]); } });
    P.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    P.forEach(p => { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
    P.slice().reverse().forEach(p => { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); });
    return lo.slice(0, -1).concat(up.slice(0, -1)).map(p => p.map(r3));
  };
  const plateXZ = (circles, holes, y0, h, mat) => ({ type: "extrude", pts: hull(circles), holes, depth: h, bevel: .6, rot: [-90, 0, 0], at: [0, y0, 0], ...(mat ? { mat } : {}) });
  // outline in the YZ plane given as [z, y] points, extruded w along X and centred on x0
  const yzPlate = (zy, w, x0, holes) => ({ type: "extrude", pts: zy.map(([z, y]) => [r3(-z), r3(y)]), holes: (holes || []).map(([z, y, r]) => [r3(-z), r3(y), r]), depth: w, bevel: .5, rot: [0, 90, 0], at: [x0 - w / 2, 0, 0] });
  const arc = (cz, cy, r, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, k) => { const a = (a0 + (a1 - a0) * k / n) * Math.PI / 180; return [cz + r * Math.cos(a), cy + r * Math.sin(a)]; });
  const both = f => [f(1), f(-1)];

  // ---------- bearing geometry (45 degree angular contact, cup-and-cone) ----------
  const LB = { r: 24, y: 42 };                               // lower ball circle
  const UB = { r: 19, y: 228 };                              // upper ball circle
  const c1 = [LB.r - D45, LB.y - D45], c2 = [LB.r + D45, LB.y + D45];   // lower contact points (cone, cup)
  const raceIn = [[15, 32], [c1[0] + 4, 32], [c1[0] + 4, c1[1] - 4], [c1[0] - 5, c1[1] + 5], [15, c1[1] + 5]].map(p => p.map(r3));
  const cupLo = [[c2[0] + 4, c2[1] - 4], [33, c2[1] - 4], [33, 53], [c2[0] - 6, 53], [c2[0] - 6, c2[1] + 6]].map(p => p.map(r3));
  const u1 = [UB.r - D45, UB.y + D45], u2 = [UB.r + D45, UB.y - D45];   // upper contact points (nut cone, cup)
  const nutTop = r3(u1[1] + 3.5 + 10);
  const nutPts = [[12.5, r3(u1[1] - 4.25)], [r3(u1[0] + 3.5), r3(u1[1] + 3.5)], [22, r3(u1[1] + 3.5)], [22, nutTop], [12.5, nutTop]];
  const cupUp = [[r3(u2[0] - 4), r3(u2[1] - 4)], [r3(u2[0] - 4), 219], [30, 219], [30, r3(u2[1] + 5)], [r3(u2[0] + 5), r3(u2[1] + 5)]];
  const balls = (R, y) => ({ type: "array", pos: Array.from({ length: 18 }, (_, k) => { const a = k / 18 * Math.PI * 2; return [r3(R * Math.cos(a)), y, r3(R * Math.sin(a))]; }), item: { type: "sphere", r: RB } });

  // ---------- lower bracket and stem (ref 2) ----------
  const lowerBracket = { type: "group", items: [
    plateXZ([[0, 0, 26], [TX, TZ, 30], [-TX, TZ, 30]], [[TX, -TZ, TR], [-TX, -TZ, TR]], 10, 22),
    { type: "lathe", pts: [[0, 0], [26, 0], [26, 32], [0, 32]] },                                   // hub under the stem
    ...both(s => ({ type: "lathe", pts: [[TR, 0], [30, 0], [30, 50], [TR, 50]], at: [s * TX, 0, TZ] })), // fork tube clamps
    ...both(s => ({ type: "box", size: [18, 50, 40], r: 2, at: [s * (TX + 29), 25, TZ] })),        // pinch lug
    ...both(s => ({ type: "box", size: [18, 50.6, 1.6], r: .2, at: [s * (TX + 29), 25, TZ], mat: "black" })), // pinch slot
    { type: "box", size: [34, 16, 18], r: 2, at: [0, 21, -30] },                                    // steering stop
    { type: "lathe", pts: [[0, 32], [15, 32], [15, 44.75], [12.5, 46], [12.5, 272], [6, 272], [6, 250], [0, 250]] }, // stem
    { type: "lathe", pts: [[12.45, 222], [12.7, 222], [12.7, 250], [12.45, 250]], mat: "black" },   // threaded section
  ] };

  // ---------- top bracket (ref 1) with the lower handlebar holder bosses cast in ----------
  const HX = 38, HZ = 12, HB = 292, HR = 11.3;              // handlebar holder centres and bar axis height (7/8 in bar)
  const lowHolder = [[-8, 270], [32, 270], [32, HB], ...arc(HZ, HB, HR, 0, -180), [-8, HB]];
  const upHolder = [[-8, HB], ...arc(HZ, HB, HR, 180, 0), [32, HB], [32, 308], [-8, 308]];
  const topBracket = { type: "group", items: [
    plateXZ([[0, 0, 24], [TX, TZ, 28], [-TX, TZ, 28]], [[TX, -TZ, TR], [-TX, -TZ, TR], [0, 0, 12.6]], 252, 18),
    { type: "lathe", pts: [[12.6, 250], [24, 250], [24, 276], [12.6, 276]] },                       // hub over the stem
    ...both(s => ({ type: "lathe", pts: [[TR, 248], [28, 248], [28, 282], [TR, 282]], at: [s * TX, 0, TZ] })),
    ...both(s => ({ type: "box", size: [16, 30, 36], r: 2, at: [s * (TX + 29), 265, TZ] })),
    ...both(s => ({ type: "box", size: [16, 30.6, 1.6], r: .2, at: [s * (TX + 29), 265, TZ], mat: "black" })),
    ...both(s => yzPlate(lowHolder, 24, s * HX)),
  ] };

  // ---------- headlamp brackets (refs 4, 5): split collar, rear pinch lugs, arm forward ----------
  const CY0 = 120, CY1 = 156, LY = 138, LZ = 15;
  const arm = [[70, 122], [114, 130], [124, 131], [131, 138], [124, 145], [114, 146], [70, 154]];
  const ear = s => ({ type: "group", items: [
    { type: "ring", ri: 21.5, ro: 26, h: CY1 - CY0, split: true, rot: [0, 188.6, 0], at: [s * TX, CY0, TZ] },
    { type: "box", size: [12, 30, 18], r: 1.5, at: [s * TX + 10, LY, 17] },
    { type: "box", size: [12, 30, 18], r: 1.5, at: [s * TX - 10, LY, 17] },
    yzPlate(arm, 6, s * TX, [[123, 138, 4.2]]),
  ] });

  // fastener sets
  const xIn = s => (s > 0 ? "-X" : "+X"), xOut = s => (s > 0 ? "+X" : "-X");
  const P = [
    { id: "stem", ref: "2", name: "Steering stem (lower bracket)", mat: "dark", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, 1, 0], geom: lowerBracket },
    { id: "race21", ref: "21", name: "Steering race, inner lower (cone)", mat: "steel", parent: "stem", stage: 1, A: [0, 0, 0], E: [0, 262, 0], dir: [0, -1, 0],
      geom: { type: "lathe", pts: raceIn } },
    { id: "race3", ref: "3", name: "Steering race, outer lower (cup)", mat: "steel", parent: "stem", stage: 2, A: [0, 0, 0], E: [0, 302, 0], dir: [0, -1, 0],
      geom: { type: "lathe", pts: cupLo } },
    { id: "race22", ref: "22", name: "Steering race, outer upper (cup)", mat: "steel", parent: "stem", stage: 2, A: [0, 0, 0], E: [0, 146, 0], dir: [0, -1, 0],
      geom: { type: "lathe", pts: cupUp } },
    { id: "ballsLo", ref: "23", name: "Steel balls, lower bearing", mat: "chrome", small: true, parent: "stem", stage: 3, A: [0, 0, 0], E: [0, 282, 0], dir: [0, -1, 0], count: 18,
      geom: balls(LB.r, LB.y) },
    { id: "ballsUp", ref: "23", name: "Steel balls, upper bearing", mat: "chrome", small: true, parent: "stem", stage: 4, A: [0, 0, 0], E: [0, 167, 0], dir: [0, -1, 0], count: 18,
      geom: balls(UB.r, UB.y) },
    { id: "nut20", ref: "20", name: "Steering stem nut (25 x 44 x 10)", mat: "steel", parent: "stem", stage: 5, A: [0, 0, 0], E: [0, 187, 0], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: nutPts },
        { type: "array", pos: [0, 90, 180, 270].map(a => [r3(21 * Math.cos(a * Math.PI / 180)), r3(nutTop - 3), r3(21 * Math.sin(a * Math.PI / 180)), -a]), item: { type: "box", size: [3, 6, 4], r: .2, mat: "black" } } ] } },
    { id: "seal24", ref: "24", name: "Dust seal, steering upper", mat: "rubber", small: true, parent: "stem", stage: 6, A: [0, 0, 0], E: [0, 213, 0], dir: [0, -1, 0],
      geom: { type: "lathe", pts: [[22.2, 231], [31, 231], [31, 233.5], [24, 235.5], [22.2, 235.5]] } },
    ...both(s => ({ id: s > 0 ? "cushL" : "cushR", ref: "6", name: `Cushion, headlamp bracket (${s > 0 ? "left" : "right"})`, mat: "rubber", small: true, parent: s > 0 ? "earL" : "earR", stage: 7,
      A: [0, 0, 0], E: [s * 290, 0, 0], dir: [-s, 0, 0], geom: { type: "ring", ri: TR, ro: 21.5, h: 40, at: [s * TX, CY0 - 2, TZ] } })),
    { id: "earR", ref: "4", name: "Headlamp bracket, right", mat: "black", parent: "stem", stage: 8, A: [0, 0, 0], E: [-160, 0, 0], dir: [1, 0, 0], geom: ear(-1) },
    { id: "earL", ref: "5", name: "Headlamp bracket, left", mat: "black", parent: "stem", stage: 8, A: [0, 0, 0], E: [160, 0, 0], dir: [-1, 0, 0], geom: ear(1) },
    { id: "top", ref: "1", name: "Steering stem head (top bracket)", mat: "alu", parent: "stem", stage: 9, A: [0, 0, 0], E: [0, 214, 0], dir: [0, -1, 0], geom: topBracket },
    { id: "wash7", ref: "7", name: "Washer (stem head bolt)", mat: "zinc", small: true, parent: "top", stage: 9, A: [0, 0, 0], E: [0, 262, 0], dir: [0, -1, 0],
      geom: ringOn(13, 6.3, 2.5, "+Y", [0, 276, 0]) },
    { id: "bolt8", ref: "8", name: "Stem head bolt (12 x 20)", mat: "zinc", small: true, parent: "top", stage: 9, A: [0, 0, 0], E: [0, 287, 0], dir: [0, -1, 0],
      geom: bolt(20, 6, 17, 8, "-Y", [0, 278.5, 0]) },
    // lower pinch bolts (13) and lock washers (14): in from behind along +Z
    { id: "lw14", ref: "14", name: "Lock washers (lower bracket pinch bolts)", mat: "spring", small: true, parent: "stem", stage: 10, A: [0, 0, 0], E: [0, 0, -75], dir: [0, 0, 1], count: 2,
      geom: { type: "group", items: both(s => ringOn(8.5, 5.2, 2.5, "+Z", [s * (TX + 26), 25, 25.5], true)) } },
    { id: "bolt13", ref: "13", name: "Bolts 10 x 40 (lower bracket pinch)", mat: "zinc", small: true, parent: "stem", stage: 10, A: [0, 0, 0], E: [0, 0, -125], dir: [0, 0, 1], count: 2,
      geom: { type: "group", items: both(s => bolt(40, 5, 14, 7, "+Z", [s * (TX + 26), 25, 25.5])) } },
    // upper pinch bolts (15) and lock washers (16)
    { id: "lw16", ref: "16", name: "Lock washers (top bracket pinch bolts)", mat: "spring", small: true, parent: "top", stage: 10, A: [0, 0, 0], E: [0, 0, -75], dir: [0, 0, 1], count: 2,
      geom: { type: "group", items: both(s => ringOn(8.5, 5.2, 2.5, "+Z", [s * (TX + 26), 265, 27.5], true)) } },
    { id: "bolt15", ref: "15", name: "Bolts 10 x 40 (top bracket pinch)", mat: "zinc", small: true, parent: "top", stage: 10, A: [0, 0, 0], E: [0, 0, -125], dir: [0, 0, 1], count: 2,
      geom: { type: "group", items: both(s => bolt(40, 5, 14, 7, "+Z", [s * (TX + 26), 265, 27.5])) } },
    // headlamp bracket pinch bolts (9) and their washer (12), lock washer (11) and nut (10) on the inboard side
    ...both(s => ({ id: s > 0 ? "bolt9L" : "bolt9R", ref: "9", name: `Bolt 8 x 50 (headlamp bracket, ${s > 0 ? "left" : "right"})`, mat: "zinc", small: true, parent: s > 0 ? "earL" : "earR", stage: 11,
      A: [0, 0, 0], E: [s * 300, 0, 0], dir: [-s, 0, 0], geom: bolt(50, 4, 12, 5.5, xIn(s), [s * (TX + 16), LY, LZ]) })),
    ...[["wash12", "12", "Washer", "zinc", -66, (x, k) => ringOn(8, 4.2, 1.6, xIn(k), [x, LY, LZ])],
        ["lw11", "11", "Lock washer", "spring", -88, (x, k) => ringOn(7, 4.2, 2, xIn(k), [x - k * 1.6, LY, LZ], true)],
        ["nut10", "10", "Nut", "zinc", -112, (x, k) => nutOn(12, 6.5, 4, xIn(k), [x - k * 3.6, LY, LZ])]].flatMap(([id, ref, nm, mat, dz, g]) =>
      both(s => ({ id: id + (s > 0 ? "L" : "R"), ref, name: `${nm} (headlamp bracket bolt, ${s > 0 ? "left" : "right"})`, mat, small: true, parent: s > 0 ? "earL" : "earR", stage: 11,
        A: [0, 0, 0], E: [0, 0, dz], dir: [s, 0, 0], geom: g(s * (TX - 16), s) }))),
    // handlebar holders (17), lock washers (19), bolts (18)
    { id: "holder17", ref: "17", name: "Handlebar holders (upper clamps)", mat: "alu", parent: "top", stage: 12, A: [0, 0, 0], E: [0, 290, 0], dir: [0, -1, 0], count: 2,
      geom: { type: "group", items: both(s => yzPlate(upHolder, 24, s * HX)) } },
    { id: "lw19", ref: "19", name: "Lock washers (handlebar holder bolts)", mat: "spring", small: true, parent: "holder17", stage: 12, A: [0, 0, 0], E: [0, 300, 0], dir: [0, -1, 0], count: 4,
      geom: { type: "array", pos: [[HX, 0, -1], [HX, 0, 25], [-HX, 0, -1], [-HX, 0, 25]], item: ringOn(7, 4.2, 2, "+Y", [0, 308, 0], true) } },
    { id: "bolt18", ref: "18", name: "Bolts 8 x 35 (handlebar holders)", mat: "zinc", small: true, parent: "holder17", stage: 12, A: [0, 0, 0], E: [0, 345, 0], dir: [0, -1, 0], count: 4,
      geom: { type: "array", pos: [[HX, 0, -1], [HX, 0, 25], [-HX, 0, -1], [-HX, 0, 25]], item: bolt(35, 4, 12, 5.5, "-Y", [0, 310, 0]) } },
    // fork cover (25) and front reflector (26) on the front of the lower bracket
    { id: "cover25", ref: "25", name: "Front fork cover", mat: "chrome", shell: true, parent: "stem", stage: 13, A: [0, 0, 0], E: [0, 0, 70], dir: [0, 0, -1],
      geom: { type: "group", items: [
        { type: "box", size: [110, 34, 2.4], r: 1, at: [0, 22, 79.4] },
        { type: "box", size: [110, 2.4, 10], r: 1, at: [0, 38, 74.6] } ] } },
    { id: "refl26", ref: "26", name: "Front reflex reflector", mat: "brass", parent: "cover25", stage: 13, A: [0, 0, 0], E: [0, 0, 120], dir: [0, 0, -1],
      geom: { type: "group", rot: [90, 0, 0], at: [0, 22, 80.6], items: [
        { type: "lathe", pts: [[0, 0], [17, 0], [17, 4], [15, 7], [0, 7]] },
        { type: "lathe", pts: [[0, -10], [3, -10], [3, 0], [0, 0]], mat: "zinc" } ] } },
  ];

  return {
    id: "CMS-BLCK0071", title: "Steering stem (GS750B)", units: "mm", page: "BLCK0071",
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL steering stem (GS750B) page. Shapes and sizes are typical proportions for a 1970s 750 cc four, not measured from a GS750; the steering axis is drawn upright. Where the parts fit (headlamp bracket clamps, fork cover, upper bearing cone on the stem nut) is a best guess. Use the factory service manual for every dimension.",
    view: { dir: [1.05, .72, 1.35], up: [0, 1, 0] },
    notModelled: "Nothing from this page is left out. The frame head pipe, the fork tubes, handlebar and headlamp shell belong to other pages and are not drawn, so the bearing cups and headlamp brackets are shown where they sit without them. Ref 23 (balls) is drawn as two sets of 18 (lower and upper); the real count is a guess: VERIFY IN FACTORY SERVICE MANUAL. No separate upper inner race is listed, so the stem nut is drawn with the upper cone on its underside. The headlamp bracket layout (split collar with a rubber liner, pinched by bolt 9, washer 12, lock washer 11 and nut 10) and the fork cover with the reflector on the front of the lower bracket are guesses made without the picture; compare with the CMSNL drawing.",
    stages: [
      { t: "Lower cone onto the stem", d: "Press a new lower inner race down onto the base of the stem until it sits on the bracket." },
      { t: "Cups into the head pipe", d: "Drive the lower and upper outer races square into the ends of the frame head pipe (the head pipe itself isn't drawn)." },
      { t: "Lower balls", d: "Pack the lower cone with grease and set the balls round it. Ball count and grease: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Stem in, upper balls", d: "Push the stem up through the head pipe and hold it there. Grease the upper cup and set the upper balls in it." },
      { t: "Stem nut", d: "Screw the stem nut down onto the balls. Turn the stem lock to lock: it should move freely with no play. Preload: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Dust seal", d: "Fit the upper dust seal over the nut onto the top of the upper race." },
      { t: "Cushions into the headlamp brackets", d: "Fit the rubber cushion inside each headlamp bracket collar." },
      { t: "Headlamp brackets", d: "Hold each bracket between the lower and top bracket positions so the fork tube can pass through it." },
      { t: "Top bracket", d: "Set the top bracket on the stem, then the washer and stem head bolt. Slide the fork tubes up through both brackets. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Fork pinch bolts", d: "With the tubes at the right height, fit the pinch bolts with lock washers in the lower and top brackets. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Headlamp bracket bolts", d: "Line up both headlamp brackets and clamp them with the bolt, washer, lock washer and nut." },
      { t: "Handlebar holders", d: "Lay the handlebar in the lower holders, fit the upper holders and the four bolts with lock washers. Tighten front and rear evenly; torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Fork cover and reflector", d: "Fit the fork cover across the front of the lower bracket and the reflector on it." },
    ],
    parts: P,
  };
})();
D3_MODELS["CMS-BLCK0071"] = D3_BLCK0071;
