/* ============ 3D parts model: steering stem, GS750C 1977 (CMSNL BLCK0073) ============
   Mechanical data only (no rendering code). Units: millimetres.
   Built from a copy of the GS750B steering stem model (d3_blck0071.js) and changed to this page's parts list and picture.
   World frame: the same axes as the front fork leg model (DG-CH-01): +Y up, +Z forward, +X to the rider's left.
   The steering axis is drawn vertical (rake ignored) along X = 0, Z = 0. The fork tubes (not on this page) run parallel
   to it at X = +/-105, Z = +48 (48 mm offset ahead of the stem), with the 36 mm tube diameter of DG-CH-01 (bore r 18).
   Heights: the lower bracket stands on Y = 0; the frame head pipe (not drawn, frame page) would sit between the two
   bearing cups; the top bracket sits on the stem from Y = 248.
   Bearings: loose 1/4 in balls between cup-and-cone races. The lower cone is pressed on the base of the stem, the two cups
   go into the ends of the head pipe. No separate upper cone is listed, so the underside of the stem nut is drawn as the
   upper cone. That is a guess; check it on the bike.
   Differences from the GS750B page, taken from the CMSNL picture for this page:
   - headlamp brackets are long straps with a collar round the fork tube at each end and a rubber cushion at each collar
     (four cushions in all); they are held between the fork cover and the top bracket, no bolts;
   - the top bracket is clamped on the stem by a pinch bolt at the back (bolt 9 with washer, lock washer and nut);
   - the top bracket fork pinch bolts are 10 x 55 with a nut and lock washer on the far side;
   - the fork cover is a pressed cover over the lower bracket, open round each fork tube; there is no reflector on this page;
   - the top bracket is held on the stem by the 12 x 20 bolt (ref 8) and washer (ref 7), as on the GS750B.
   Bolt sizes in the names come from the catalogue descriptions; the pinch bolt 9 length is read from its part number
   (01517-08308, 8 x 30). Everything else (bracket spread, offset, cover shape, ball count) is typical proportion for a 1970s
   750 cc Japanese four, not a factory figure.
   Every part's geometry is laid out in world coordinates, so every A is [0, 0, 0] and E is the exploded offset. */
const D3_BLCK0073 = (() => {
  const CFG = {"headNut": false, "p9len": 30, "cable": false, "ref": {"top": "1", "stem": "2", "cupLo": "3", "earR": "4", "earL": "5", "cush": "6", "wash7": "7", "head": "8", "p9": "9", "nut10": "10", "lw11": "11", "w12": "12", "tb": "13", "tw": null, "tn": "14", "tlw": "15", "lb": "16", "llw": "17", "holder": "18", "hb": "19", "hlw": "20", "snut": "21", "cone": "22", "cupUp": "23", "balls": "24", "seal": "25", "cover": "26", "cable": null}};
  const R = CFG.ref;
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


  // ---------- lower bracket and stem ----------
  const stemTop = CFG.headNut
    ? [[12.5, 46], [12.5, 276], [9, 276], [9, 291], [8.4, 291.6], [0, 291.6]]
    : [[12.5, 46], [12.5, 272], [6, 272], [6, 250], [0, 250]];
  const lowerBracket = { type: "group", items: [
    plateXZ([[0, 0, 26], [TX, TZ, 30], [-TX, TZ, 30]], [[TX, -TZ, TR], [-TX, -TZ, TR]], 10, 22),
    { type: "lathe", pts: [[0, 0], [26, 0], [26, 32], [0, 32]] },                                   // hub under the stem
    ...both(s => ({ type: "lathe", pts: [[TR, 0], [30, 0], [30, 50], [TR, 50]], at: [s * TX, 0, TZ] })), // fork tube clamps
    ...both(s => ({ type: "box", size: [18, 50, 40], r: 2, at: [s * (TX + 29), 25, TZ] })),        // pinch lug
    ...both(s => ({ type: "box", size: [18, 50.6, 1.6], r: .2, at: [s * (TX + 29), 25, TZ], mat: "black" })), // pinch slot
    { type: "box", size: [34, 16, 18], r: 2, at: [0, 21, -30] },                                    // steering stop
    { type: "lathe", pts: [[0, 32], [15, 32], [15, 44.75], ...stemTop] },                            // stem
    { type: "lathe", pts: [[12.45, 222], [12.7, 222], [12.7, 250], [12.45, 250]], mat: "black" },   // threaded section for the stem nut
    ...(CFG.headNut ? [{ type: "lathe", pts: [[8.95, 279], [9.2, 279], [9.2, 290.5], [8.95, 290.5]], mat: "black" }] : []),
  ] };

  // ---------- top bracket with the lower handlebar holder bosses cast in and the stem pinch lug at the back ----------
  const HX = 38, HZ = 12, HB = 292, HR = 11.3;              // handlebar holder centres and bar axis height (7/8 in bar)
  const LW = CFG.p9len - 12, PY = 263, PZ = -32;            // stem pinch lug width, bolt height and position
  const CX = 64, CZ = 30;                                   // starter (choke) cable knob hole
  const lowHolder = [[-8, 270], [32, 270], [32, HB], ...arc(HZ, HB, HR, 0, -180), [-8, HB]];
  const upHolder = [[-8, HB], ...arc(HZ, HB, HR, 180, 0), [32, HB], [32, 308], [-8, 308]];
  const topBracket = { type: "group", items: [
    plateXZ([[0, 0, 24], [TX, TZ, 28], [-TX, TZ, 28]], [[TX, -TZ, TR], [-TX, -TZ, TR], [0, 0, 12.6], ...(CFG.cable ? [[CX, -CZ, 5.3]] : [])], 252, 18),
    { type: "lathe", pts: [[12.6, 250], [24, 250], [24, 276], [12.6, 276]] },                       // hub over the stem
    { type: "box", size: [LW, 22, 20], r: 2, at: [0, PY, -30] },                                    // stem pinch lug
    { type: "box", size: [1.6, 26.6, 28], r: .2, at: [0, PY, -26], mat: "black" },                  // stem pinch slot
    ...both(s => ({ type: "lathe", pts: [[TR, 248], [28, 248], [28, 282], [TR, 282]], at: [s * TX, 0, TZ] })),
    ...both(s => ({ type: "box", size: [16, 30, 36], r: 2, at: [s * (TX + 29), 265, TZ] })),
    ...both(s => ({ type: "box", size: [16, 30.6, 1.6], r: .2, at: [s * (TX + 29), 265, TZ], mat: "black" })),
    ...both(s => yzPlate(lowHolder, 24, s * HX)),
  ] };

  // ---------- headlamp brackets: strap with a collar at each end, ear plate forward for the headlamp shell ----------
  const LC = 60, UC = 234;                                  // lower and upper collar bottoms (10 mm tall)
  const earPlate = [[44, 128], [92, 132], [106, 136], [116, 146], [116, 160], [106, 170], [92, 174], [44, 178]];
  const ear = s => ({ type: "group", items: [
    { type: "ring", ri: 21.5, ro: 26, h: 10, at: [s * TX, LC, TZ] },
    { type: "ring", ri: 21.5, ro: 26, h: 10, at: [s * TX, UC, TZ] },
    { type: "box", size: [5, UC + 10 - LC - 2, 12], r: 1, at: [s * (TX + 24.5), (LC + UC + 10) / 2, TZ] },
    yzPlate(earPlate, 3, s * (TX + 28.5), [[104, 153, 5], [70, 153, 3.5]]),
  ] });
  const cushion = (s, up) => ({ type: "lathe", at: [s * TX, 0, TZ], pts: up
    ? [[TR, UC + 4], [21.5, UC + 4], [21.5, UC + 10], [25, UC + 10], [25, UC + 13.5], [TR, UC + 13.5]]
    : [[TR, LC - 3.5], [25, LC - 3.5], [25, LC], [21.5, LC], [21.5, LC + 6], [TR, LC + 6]] });

  // ---------- fork cover: top skin over the lower bracket with a hole for each tube, front wall and rounded ends ----------
  const CR = 48, CT = 2.4, CY = 54;
  const capPts = s => { const o = [], i = []; for (let k = 0; k <= 16; k++) { const a = (-30 + 120 * k / 16) * Math.PI / 180;
    o.push([r3(s * (TX + CR * Math.cos(a))), r3(-(TZ + CR * Math.sin(a)))]); i.push([r3(s * (TX + (CR - CT) * Math.cos(a))), r3(-(TZ + (CR - CT) * Math.sin(a)))]); }
    const p = o.concat(i.reverse()); return s > 0 ? p.reverse() : p; };
  const cover = { type: "group", items: [
    plateXZ([[TX, TZ, CR], [-TX, TZ, CR]], [[TX, -TZ, 19.5], [-TX, -TZ, 19.5]], CY, CT),
    { type: "box", size: [2 * TX, CY, CT], r: .6, at: [0, CY / 2, TZ + CR - CT / 2] },
    ...both(s => ({ type: "extrude", pts: capPts(s), depth: CY, bevel: .3, rot: [-90, 0, 0], at: [0, 0, 0] })),
  ] };

  // ---------- starter (choke) cable: knob and threaded body through the top bracket, cable down and back ----------
  const cable = { type: "group", items: [
    { type: "lathe", pts: [[0, 270], [9, 270], [9, 279], [7, 284], [0, 284]], at: [CX, 0, CZ], mat: "black" },
    { type: "lathe", pts: [[0, 238], [5, 238], [5, 270], [0, 270]], at: [CX, 0, CZ] },
    { type: "hex", af: 14, h: 5, y: 245, hole: 5, at: [CX, 0, CZ] },
    { type: "lathe", pts: [[0, 228], [4, 228], [4, 238], [0, 238]], at: [CX, 0, CZ], mat: "black" },
    { type: "tube", pts: [[CX, 229, CZ], [CX, 190, CZ], [CX - 2, 150, CZ - 12], [CX - 8, 115, CZ - 50], [CX - 14, 96, CZ - 110]], r: 3, mat: "black" },
  ] };

  const parts = [
    { id: "stem", ref: R.stem, name: "Steering stem (lower bracket)", mat: "dark", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, 1, 0], geom: lowerBracket },
    { id: "cone", ref: R.cone, name: "Steering race, inner lower (cone)", mat: "steel", parent: "stem", stage: 1, A: [0, 0, 0], E: [0, 262, 0], dir: [0, -1, 0],
      geom: { type: "lathe", pts: raceIn } },
    { id: "cupLo", ref: R.cupLo, name: "Steering race, outer lower (cup)", mat: "steel", parent: "stem", stage: 2, A: [0, 0, 0], E: [0, 302, 0], dir: [0, -1, 0],
      geom: { type: "lathe", pts: cupLo } },
    { id: "cupUp", ref: R.cupUp, name: "Steering race, outer upper (cup)", mat: "steel", parent: "stem", stage: 2, A: [0, 0, 0], E: [0, 146, 0], dir: [0, -1, 0],
      geom: { type: "lathe", pts: cupUp } },
    { id: "ballsLo", ref: R.balls, name: "Steel balls, lower bearing", mat: "chrome", small: true, parent: "stem", stage: 3, A: [0, 0, 0], E: [0, 282, 0], dir: [0, -1, 0], count: 18,
      geom: balls(LB.r, LB.y) },
    { id: "ballsUp", ref: R.balls, name: "Steel balls, upper bearing", mat: "chrome", small: true, parent: "stem", stage: 4, A: [0, 0, 0], E: [0, 167, 0], dir: [0, -1, 0], count: 18,
      geom: balls(UB.r, UB.y) },
    { id: "snut", ref: R.snut, name: "Steering stem nut (25 x 44 x 10)", mat: "steel", parent: "stem", stage: 5, A: [0, 0, 0], E: [0, 187, 0], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: nutPts },
        { type: "array", pos: [0, 90, 180, 270].map(a => [r3(21 * Math.cos(a * Math.PI / 180)), r3(nutTop - 3), r3(21 * Math.sin(a * Math.PI / 180)), -a]), item: { type: "box", size: [3, 6, 4], r: .2, mat: "black" } } ] } },
    { id: "seal", ref: R.seal, name: "Dust seal, steering upper", mat: "rubber", small: true, parent: "stem", stage: 6, A: [0, 0, 0], E: [0, 213, 0], dir: [0, -1, 0],
      geom: { type: "lathe", pts: [[22.2, 231], [31, 231], [31, 233.5], [24, 235.5], [22.2, 235.5]] } },
    { id: "cover", ref: R.cover, name: "Front fork cover", mat: "black", shell: true, parent: "stem", stage: 7, A: [0, 0, 0], E: [0, 0, 150], dir: [0, 0, -1], geom: cover },
    ...both(s => [false, true].map(up => ({ id: `cush${s > 0 ? "L" : "R"}${up ? "U" : "D"}`, ref: R.cush,
      name: `Cushion, headlamp bracket (${s > 0 ? "left" : "right"}, ${up ? "upper" : "lower"} collar)`, mat: "rubber", small: true, parent: s > 0 ? "earL" : "earR", stage: 8,
      A: [0, 0, 0], E: [s * 170, up ? 40 : -40, 0], dir: [0, up ? -1 : 1, 0], geom: cushion(s, up) }))).flat(),
    { id: "earR", ref: R.earR, name: "Headlamp bracket, right", mat: "black", parent: "stem", stage: 9, A: [0, 0, 0], E: [-170, 0, 0], dir: [1, 0, 0], geom: ear(-1) },
    { id: "earL", ref: R.earL, name: "Headlamp bracket, left", mat: "black", parent: "stem", stage: 9, A: [0, 0, 0], E: [170, 0, 0], dir: [-1, 0, 0], geom: ear(1) },
    { id: "top", ref: R.top, name: "Steering stem head (top bracket)", mat: "alu", parent: "stem", stage: 10, A: [0, 0, 0], E: [0, 214, 0], dir: [0, -1, 0], geom: topBracket },
    { id: "wash7", ref: R.wash7, name: "Washer (stem head)", mat: "zinc", small: true, parent: "top", stage: 10, A: [0, 0, 0], E: [0, 262, 0], dir: [0, -1, 0],
      geom: CFG.headNut ? ringOn(15, 9.2, 2.5, "+Y", [0, 276, 0]) : ringOn(13, 6.3, 2.5, "+Y", [0, 276, 0]) },
    CFG.headNut
      ? { id: "head8", ref: R.head, name: "Nut, steering stem head", mat: "zinc", small: true, parent: "top", stage: 10, A: [0, 0, 0], E: [0, 287, 0], dir: [0, -1, 0],
          geom: nutOn(27, 11, 9, "+Y", [0, 278.5, 0]) }
      : { id: "head8", ref: R.head, name: "Stem head bolt (12 x 20)", mat: "zinc", small: true, parent: "top", stage: 10, A: [0, 0, 0], E: [0, 287, 0], dir: [0, -1, 0],
          geom: bolt(20, 6, 17, 8, "-Y", [0, 278.5, 0]) },
    // stem pinch bolt (9) from the right, washer (12), lock washer (11) and nut (10) on the left
    { id: "bolt9", ref: R.p9, name: `Bolt 8 x ${CFG.p9len} (top bracket stem pinch)`, mat: "zinc", small: true, parent: "top", stage: 11, A: [0, 0, 0], E: [-200, 214, 0], dir: [1, 0, 0],
      geom: bolt(CFG.p9len, 4, 12, 5.5, "+X", [-LW / 2, PY, PZ]) },
    { id: "wash12", ref: R.w12, name: "Washer (stem pinch bolt)", mat: "zinc", small: true, parent: "top", stage: 11, A: [0, 0, 0], E: [200, 214, 0], dir: [-1, 0, 0],
      geom: ringOn(8, 4.2, 1.6, "+X", [LW / 2, PY, PZ]) },
    { id: "lw11", ref: R.lw11, name: "Lock washer (stem pinch bolt)", mat: "spring", small: true, parent: "top", stage: 11, A: [0, 0, 0], E: [225, 214, 0], dir: [-1, 0, 0],
      geom: ringOn(7, 4.2, 2, "+X", [LW / 2 + 1.6, PY, PZ], true) },
    { id: "nut10", ref: R.nut10, name: "Nut (stem pinch bolt)", mat: "zinc", small: true, parent: "top", stage: 11, A: [0, 0, 0], E: [255, 214, 0], dir: [-1, 0, 0],
      geom: nutOn(12, 6.5, 4, "+X", [LW / 2 + 3.6, PY, PZ]) },
    // lower bracket pinch bolts 10 x 40 and lock washers: in from behind along +Z
    { id: "lwLo", ref: R.llw, name: "Lock washers (lower bracket pinch bolts)", mat: "spring", small: true, parent: "stem", stage: 12, A: [0, 0, 0], E: [0, 0, -75], dir: [0, 0, 1], count: 2,
      geom: { type: "group", items: both(s => ringOn(8.5, 5.2, 2.5, "+Z", [s * (TX + 26), 25, 25.5], true)) } },
    { id: "boltLo", ref: R.lb, name: "Bolts 10 x 40 (lower bracket pinch)", mat: "zinc", small: true, parent: "stem", stage: 12, A: [0, 0, 0], E: [0, 0, -125], dir: [0, 0, 1], count: 2,
      geom: { type: "group", items: both(s => bolt(40, 5, 14, 7, "+Z", [s * (TX + 26), 25, 25.5])) } },
    // top bracket pinch bolts 10 x 55 from behind, lock washer and nut in front
    ...(R.tw ? [{ id: "washTop", ref: R.tw, name: "Washers (top bracket pinch bolts)", mat: "zinc", small: true, parent: "top", stage: 12, A: [0, 0, 0], E: [0, 0, -75], dir: [0, 0, 1], count: 2,
      geom: { type: "group", items: both(s => ringOn(10, 5.3, 1.6, "+Z", [s * (TX + 26), 265, 28.4])) } }] : []),
    { id: "boltTop", ref: R.tb, name: "Bolts 10 x 55 (top bracket pinch)", mat: "zinc", small: true, parent: "top", stage: 12, A: [0, 0, 0], E: [0, 0, -150], dir: [0, 0, 1], count: 2,
      geom: { type: "group", items: both(s => bolt(55, 5, 14, 7, "+Z", [s * (TX + 26), 265, R.tw ? 28.4 : 30])) } },
    { id: "lwTop", ref: R.tlw, name: "Lock washers (top bracket pinch nuts)", mat: "spring", small: true, parent: "top", stage: 12, A: [0, 0, 0], E: [0, 0, 60], dir: [0, 0, -1], count: 2,
      geom: { type: "group", items: both(s => ringOn(8.5, 5.2, 2.5, "+Z", [s * (TX + 26), 265, 66], true)) } },
    { id: "nutTop", ref: R.tn, name: "Nuts (top bracket pinch bolts)", mat: "zinc", small: true, parent: "top", stage: 12, A: [0, 0, 0], E: [0, 0, 90], dir: [0, 0, -1], count: 2,
      geom: { type: "group", items: both(s => nutOn(17, 8, 5, "+Z", [s * (TX + 26), 265, 68.5])) } },
    // handlebar holders, lock washers, bolts
    { id: "holder", ref: R.holder, name: "Handlebar holders (upper clamps)", mat: "alu", parent: "top", stage: 13, A: [0, 0, 0], E: [0, 290, 0], dir: [0, -1, 0], count: 2,
      geom: { type: "group", items: both(s => yzPlate(upHolder, 24, s * HX)) } },
    { id: "lwH", ref: R.hlw, name: "Lock washers (handlebar holder bolts)", mat: "spring", small: true, parent: "holder", stage: 13, A: [0, 0, 0], E: [0, 300, 0], dir: [0, -1, 0], count: 4,
      geom: { type: "array", pos: [[HX, 0, -1], [HX, 0, 25], [-HX, 0, -1], [-HX, 0, 25]], item: ringOn(7, 4.2, 2, "+Y", [0, 308, 0], true) } },
    { id: "boltH", ref: R.hb, name: "Bolts 8 x 35 (handlebar holders)", mat: "zinc", small: true, parent: "holder", stage: 13, A: [0, 0, 0], E: [0, 345, 0], dir: [0, -1, 0], count: 4,
      geom: { type: "array", pos: [[HX, 0, -1], [HX, 0, 25], [-HX, 0, -1], [-HX, 0, 25]], item: bolt(35, 4, 12, 5.5, "-Y", [0, 310, 0]) } },
    ...(CFG.cable ? [{ id: "cable", ref: R.cable, name: "Starter (choke) cable", mat: "steel", parent: "top", stage: 14, A: [0, 0, 0], E: [330, 200, 0], dir: [0, -1, 0], geom: cable }] : []),
  ];

  const stages = [
    { t: "Lower cone onto the stem", d: "Press a new lower inner race down onto the base of the stem until it sits on the bracket." },
    { t: "Cups into the head pipe", d: "Drive the lower and upper outer races square into the ends of the frame head pipe (the head pipe itself isn't drawn)." },
    { t: "Lower balls", d: "Pack the lower cone with grease and set the balls round it. Ball count and grease: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Stem in, upper balls", d: "Push the stem up through the head pipe and hold it there. Grease the upper cup and set the upper balls in it." },
    { t: "Stem nut", d: "Screw the stem nut down onto the balls. Turn the stem lock to lock: it should move freely with no play. Preload: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Dust seal", d: "Fit the upper dust seal over the nut onto the top of the upper race." },
    { t: "Fork cover", d: "Set the fork cover over the lower bracket so its two holes line up with the fork tube clamps." },
    { t: "Cushions into the headlamp brackets", d: "Push a rubber cushion into the top collar and the bottom collar of each headlamp bracket." },
    { t: "Headlamp brackets", d: "Stand each bracket on the fork cover over its tube hole, ear facing forward. The fork tube will pass up through both collars." },
    { t: "Top bracket", d: CFG.headNut ? "Set the top bracket on the stem, then the washer and the stem head nut. Slide the fork tubes up through both brackets. Torque: VERIFY IN FACTORY SERVICE MANUAL." : "Set the top bracket on the stem, then the washer and the stem head bolt. Slide the fork tubes up through both brackets. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Stem pinch bolt", d: "Fit the pinch bolt through the lug at the back of the top bracket with the washer, lock washer and nut. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Fork pinch bolts", d: "With the tubes at the right height, fit the lower pinch bolts with lock washers, then the top bolts with their lock washers and nuts. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Handlebar holders", d: "Lay the handlebar in the lower holders, fit the upper holders and the four bolts with lock washers. Tighten front and rear evenly; torque: VERIFY IN FACTORY SERVICE MANUAL." },
  ];
  if (CFG.cable) stages.push({ t: "Choke cable", d: "Push the choke knob body up through the hole in the top bracket, run the nut on from below and route the cable back to the carburettors." });

  return {
    id: "CMS-BLCK0073", title: "Steering stem (GS750C)", units: "mm", page: "BLCK0073",
    accuracy: "Approximate geometry. Part identity, numbering and the exploded layout follow the CMSNL picture for this page. Shapes and sizes are typical proportions for a 1970s 750 cc four, not measured from a GS750; the steering axis is drawn upright. Use the factory service manual for every dimension.",
    view: { dir: [1.05, .72, 1.35], up: [0, 1, 0] },
    notModelled: "Nothing from this page is left out. Refs 4 and 5 have two catalogue rows each (supersessions); one bracket per side is drawn. The frame head pipe, the fork tubes, handlebar and headlamp shell belong to other pages and are not drawn, so the bearing cups and headlamp brackets are shown where they sit without them. The balls are drawn as two sets of 18 (lower and upper); the real count is a guess: VERIFY IN FACTORY SERVICE MANUAL. No separate upper inner race is listed, so the stem nut is drawn with the upper cone on its underside. Ref 6 is drawn as four cushions, one at each collar of each headlamp bracket, as the picture shows.",
    stages,
    parts,
  };
})();
D3_MODELS["CMS-BLCK0073"] = D3_BLCK0073;
