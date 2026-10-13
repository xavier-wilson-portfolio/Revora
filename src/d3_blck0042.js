/* ============ 3D parts model: handlebar and front fender, GS750B 1977 (CMSNL BLCK0042) ============
   Mechanical data only. Units: millimetres.
   World frame: +X = rider's LEFT, +Y up, +Z forward (same as d3_fork.js). Origin = front axle centre.
   The fork is raked back 27 degrees. "Fork frame" below means: local +Y up the fork axis, local +Z forward, same X; it is
   turned into the world with rot [-27, 0, 0]. Fork legs sit at X = +/-105, their axis 34 mm behind the axle; the steering
   axis is a further 50 mm back. The handlebar clamps sit about 735 mm up the fork axis, which puts the handlebar centre at
   world (0, 610, -423). The fork, top bridge, lever brackets, switches, carburettors and frame are on other pages and are
   not drawn, so the handlebar, steering lock and cable ends sit where those parts would hold them.
   Identity, numbering and layout: CMSNL handlebar / front fender page (refs 1-17) and its picture.
   Geometry: APPROXIMATE. 22.2 mm (7/8 in) bar, about 790 mm wide; 19 in front wheel under a fender of about 348 mm radius;
   M8 x 16 fender bolts and M10 mirror threads read from the Suzuki part numbers / typical practice. Nothing here is a
   factory measurement. Every part's geometry is laid out in world coordinates, so every A is [0, 0, 0] and E is the
   exploded offset. */
const D3_BLCK0042 = (() => {
  const r3 = v => +(+v).toFixed(2);
  const RAKE = -27, H = [0, 610, -423];
  const add = (a, b) => a.map((v, i) => r3(v + b[i]));
  const sub = (a, b) => a.map((v, i) => v - b[i]);
  const norm = a => { const l = Math.hypot(...a) || 1; return a.map(v => v / l); };
  // Euler rotation (degrees, three.js XYZ order) that turns local +Y into direction d
  const alignY = d => { const [x, y, z] = norm(d); return [r3(Math.atan2(z, y) * 180 / Math.PI), 0, r3(Math.asin(-x) * 180 / Math.PI)]; };
  const RG = (ro, ri, h, o = {}) => ({ type: "lathe", pts: [[ri, 0], [ro, 0], [ro, h], [ri, h]], ...o });
  const fork = items => ({ type: "group", items, rot: [RAKE, 0, 0] });

  // ---- handlebar (ref 1): 22.2 mm tube, flat centre, rises and pulls back to the grips ----
  const halfBar = s => [[s * 395, 118, -176], [s * 345, 118, -173], [s * 300, 118, -170], [s * 255, 113, -161], [s * 218, 96, -136],
    [s * 186, 63, -92], [s * 160, 29, -42], [s * 134, 7, -9], [s * 100, 0, 0]];
  const barPts = [...halfBar(-1), [0, 0, 0], ...halfBar(1).reverse()].map(p => add(p, H));
  const handlebar = { type: "group", items: [
    { type: "tube", pts: barPts, r: 11.1 },
    // knurled bands where the holders clamp
    ...[-1, 1].map(s => ({ type: "cyl", r: 11.5, h: 32, axis: "x", at: add([s > 0 ? 40 : -72, 0, 0], H), mat: "dark" })),
    // open bar ends
    ...[-1, 1].map(s => ({ type: "lathe", pts: [[8.5, 0], [11.2, 0], [11.2, 1], [8.5, 1]], rot: [0, 0, s > 0 ? -90 : 90], at: add([s * 395, 118, -176], H), mat: "dark" })),
  ] };

  // ---- mirrors (refs 2 right, 3 left), cushions (4), lock nuts (5) ----
  // base of each mirror thread = top of the lever bracket (not on this page), just inboard of the grip
  const mBase = s => add([s * 262, 148, -165], H);
  const mirror = s => { const b = mBase(s); const P = p => add(p, b); return { type: "group", items: [
    { type: "lathe", pts: [[0, -14], [5, -14], [5, 30], [4.5, 31], [0, 31]], at: b, mat: "steel" },           // M10 thread
    { type: "tube", r: 4.5, pts: [P([0, 28, 0]), P([0, 80, 0]), P([s * 5, 150, -5]), P([s * 28, 212, -8]), P([s * 66, 248, -6]), P([s * 104, 262, -3])] },
    { type: "sphere", r: 7, at: P([s * 106, 263, -3]) },
    { type: "lathe", pts: [[0, 0], [55, 0], [56.5, 3], [54, 11], [40, 18], [0, 21]], rot: [90, 0, 0], at: P([s * 125, 268, -19]) }, // shell
    { type: "cyl", r: 51, h: 1, axis: "z", at: P([s * 125, 268, -20]), mat: "dark" },                       // glass
  ] }; };
  const nut = s => ({ type: "hex", af: 14, h: 7, hole: 5, at: add(mBase(s), [0, 1, 0]) });
  const cushion = s => ({ type: "lathe", pts: [[5, 0], [10.5, 0], [11, 3], [11, 15], [8, 24], [5, 24]], at: add(mBase(s), [0, 8.5, 0]) });

  // ---- cables ----
  // end fitting along the outward direction u at p: ferrule, adjuster, inner wire and nipple
  const ends = (p, q, o) => { const u = norm(sub(p, q)), at = d => add(p, u.map(v => v * d)), rot = alignY(u); const it = [
    { type: "cyl", r: 4.6, h: 12, rot, at: at(-4), mat: "chrome" },
    { type: "cyl", r: o.adjR || 4, h: o.adj || 16, rot, at: at(8), mat: "zinc" },
    { type: "hex", af: 9, h: 4, rot, at: at(10), mat: "zinc" },
    { type: "cyl", r: .9, h: o.wire || 14, rot, at: at(8 + (o.adj || 16)), mat: "steel" },
    { type: "cyl", r: 3, h: 5, rot, at: at(8 + (o.adj || 16) + (o.wire || 14)), mat: "brass" },
  ]; return it; };
  const cable = (pts, oTop, oBot, extra = []) => [{ type: "tube", pts, r: 3.6, mat: "black" }, ...ends(pts[0], pts[1], oTop), ...ends(pts[pts.length - 1], pts[pts.length - 2], oBot), ...extra];
  // throttle cables (ref 11): from the throttle housing under the right grip, down past the right side of the steering head,
  // back to the carburettors. Two cables (pull and return) side by side, 12 mm apart.
  const thr0 = [[-290, 700, -574], [-286, 672, -562], [-252, 612, -518], [-172, 546, -452], [-100, 508, -404], [-74, 486, -388],
    [-70, 458, -392], [-68, 446, -430], [-60, 452, -520], [-52, 466, -598], [-50, 458, -636], [-50, 428, -642]];
  const thrA = thr0, thrB = thr0.map(p => add(p, [12, 0, 4]));
  const throttle = { type: "group", items: [...cable(thrA, { adj: 18 }, { adj: 22, adjR: 5 }), ...cable(thrB, { adj: 18 }, { adj: 22, adjR: 5 })] };
  // clutch cable (ref 10): from the clutch lever bracket on the left, down the left side of the head and frame to the
  // release on the left engine cover
  const clu = [[256, 694, -562], [244, 684, -544], [196, 622, -484], [128, 540, -424], [96, 470, -396], [112, 410, -430],
    [124, 320, -490], [126, 236, -566], [118, 168, -680], [106, 128, -800], [100, 118, -846]];
  const clutch = { type: "group", items: cable(clu, { adj: 14 }, { adj: 30, adjR: 5, wire: 24 }, [
    { type: "lathe", pts: [[3.6, 0], [7.5, 0], [8, 6], [8, 34], [6, 40], [3.6, 40]], rot: alignY(sub(clu[9], clu[10])), at: add(clu[9], [0, 0, 0]), mat: "rubber" }, // rubber boot
  ]) };

  // clip (ref 12): holds the two throttle cables together just below the steering head line
  const at12 = thrA[5], dir12 = sub(thrA[4], thrA[6]);
  const clip = { type: "group", rot: alignY(dir12), at: at12, items: [
    RG(5.6, 4.0, 7, { at: [0, -3.5, 0] }), RG(5.6, 4.0, 7, { at: [12, -3.5, 0] }),
    { type: "box", size: [6, 7, 3], r: .8, at: [6, 0, 4.4] },
  ] };
  // band clamp (ref 9, 120 mm strap): ties the throttle cables together further back, by the carburettors
  const at9 = thrA[8], dir9 = sub(thrA[9], thrA[7]);
  const band = { type: "group", rot: alignY(dir9), at: add(at9, [6, 0, 2]), items: [
    { type: "lathe", pts: [[12, -3.5], [13.4, -3.5], [13.4, 3.5], [12, 3.5]], seg: 40 },
    { type: "box", size: [8, 7, 6], r: 1, at: [0, 0, 15.5] },                    // buckle
    { type: "box", size: [26, 6, 1.4], r: .5, at: [17, 0, 17] },                  // strap tail
  ] };
  // clamp (ref 13): holds the clutch cable on its way down the frame
  const at13 = clu[6], dir13 = sub(clu[7], clu[5]);
  const clamp13 = { type: "group", rot: alignY(dir13), at: at13, items: [
    RG(5.6, 3.9, 9, { at: [0, -4.5, 0] }),
    { type: "extrude", pts: [[-5.6, 0], [-5.6, 22], [5.6, 22], [5.6, 0]], holes: [[0, 15, 2.6]], depth: 1.6, bevel: .3, rot: [90, 0, 0], at: [0, 4.5, 2.5] },
    { type: "extrude", pts: [[-5.6, 0], [-5.6, 22], [5.6, 22], [5.6, 0]], holes: [[0, 15, 2.6]], depth: 1.6, bevel: .3, rot: [90, 0, 0], at: [0, -2.9, 2.5] },
  ].map(x => x) };

  // ---- steering lock (ref 6) with screw (7) and lock washer (8): under the left side of the steering head ----
  const LK = [46, 434, -318];
  const lock = { type: "group", items: [
    { type: "cyl", r: 12, h: 36, axis: "x", at: add(LK, [-16, 0, 0]) },                 // lock barrel
    { type: "cyl", r: 13.5, h: 4, axis: "x", at: add(LK, [20, 0, 0]), mat: "chrome" },     // face
    { type: "box", size: [1.5, 9, 2.4], r: .3, at: add(LK, [24.4, 0, 0]), mat: "black" },  // key slot
    { type: "cyl", r: 5, h: 10, axis: "z", at: add(LK, [-4, -14, -5]), mat: "dark" },      // plunger housing
    { type: "box", size: [40, 4, 54], r: .8, at: add(LK, [4, 14, -16]) },                  // mounting bracket
    { type: "box", size: [40, 12, 3], r: .6, at: add(LK, [4, 8, 9.5]) },
    { type: "group", items: [ // key
      { type: "box", size: [16, 2.4, 6], r: .4, at: add(LK, [33, 0, 0]), mat: "steel" },
      { type: "box", size: [3, 22, 18], r: 3, at: add(LK, [43, 0, 0]), mat: "black" } ] },
  ] };
  const SCR = add(LK, [4, 16, -36]);
  const screw = { type: "group", items: [
    { type: "lathe", pts: [[0, -22], [2.5, -22], [2.5, 0], [4.6, 0], [4.6, 2.2], [3.6, 3.6], [0, 3.8]], at: add(SCR, [0, 1.6, 0]) },
    { type: "box", size: [6, 1, 1], r: .2, at: add(SCR, [0, 5.3, 0]), mat: "black" },
  ] };
  const lw8 = RG(4.8, 2.6, 1.6, { at: SCR });

  // ---- front fender (ref 14) in the fork frame: crown, side skirts, two crown ribs, under brace with bolt flanges ----
  const R0 = 346, T0 = 5, T1 = 150;
  const arc = (ri, ro) => { const a = [], b = []; for (let t = T0; t <= T1 + .01; t += 5) { const r = t * Math.PI / 180; a.push([r3(ro * Math.cos(r)), r3(ro * Math.sin(r))]); b.push([r3(ri * Math.cos(r)), r3(ri * Math.sin(r))]); } return [...a, ...b.reverse()]; };
  const side = (pts, depth, x) => ({ type: "extrude", pts, depth, bevel: .4, rot: [0, -90, 0], at: [x, 0, 0] });
  const brace = { type: "extrude", depth: 44, bevel: .5, at: [0, 0, -56], mat: "steel", pts: [
    [-64, 340], [64, 340], [64, 316], [78, 316], [78, 282], [75, 282], [75, 313], [61, 313], [61, 337], [-61, 337], [-61, 313], [-75, 313], [-75, 282], [-78, 282], [-78, 316], [-64, 316]] };
  const fender = fork([
    side(arc(R0, R0 + 2), 128, 64),
    side(arc(R0 - 22, R0 + 2), 1.6, 65), side(arc(R0 - 22, R0 + 2), 1.6, -63.4),
    side(arc(R0 + 2, R0 + 3.5), 4, 24), side(arc(R0 + 2, R0 + 3.5), 4, -20),
    brace,
  ]);
  // fender bolts (15) and lock washers (16): two per side, heads inboard of the brace flanges, into the fork leg bosses
  const BY = 298, BZ = [-46, -22];
  const bolt = s => fork(BZ.map(z => ({ type: "group", rot: [0, 0, -90 * s], at: [s * 67, BY, z], items: [
    { type: "hex", af: 12, h: 5.6 }, { type: "lathe", pts: [[0, 5.6], [4, 5.6], [4, 21], [3.4, 22], [0, 22]] } ] })));
  const lwash = s => fork(BZ.map(z => ({ type: "ring", ro: 7.4, ri: 4.2, h: 2, split: true, rot: [0, 0, -90 * s], at: [s * 73, BY, z] })));
  // cable guide (17): plugs into the left skirt and holds the speedometer cable along the fork leg
  const GY = 322, GZ = -100;
  const guide = fork([
    { type: "cyl", r: 3.4, h: 8, axis: "x", at: [58, GY, GZ] },
    { type: "cyl", r: 6, h: 2, axis: "x", at: [65.6, GY, GZ] },
    { type: "box", size: [8, 8, 8], r: 1.5, at: [71, GY, GZ] },
    RG(9.5, 6.2, 9, { at: [80.5, GY - 4.5, GZ] }),
  ]);

  const P = (id, ref, name, mat, stage, E, dir, geom, o = {}) => ({ id, ref, name, mat, stage, A: [0, 0, 0], E, dir, geom, ...o });
  return {
    id: "CMS-BLCK0042", title: "Handlebar - front fender", units: "mm", page: "BLCK0042",
    accuracy: "Approximate geometry. Part identity, numbering and layout follow the CMSNL handlebar / front fender picture; sizes and cable routes are typical for a 1970s 750 and are not factory measurements. Check everything against the factory service manual.",
    view: { dir: [0.55, 0.5, 1] },
    notModelled: "Every ref on the page is drawn. The fork, top bridge, lever brackets, switch housings, carburettors and frame belong to other pages, so the cables, mirrors and steering lock are shown where those parts would hold them. The page has no choke cable or reflector for this model, so none is drawn. Refs 5, 4, 15 and 16 are split into left and right halves so each side can move along its own fitting direction.",
    stages: [
      { t: "Fender bolts", d: "With the wheel out, hold the fender between the fork legs and fit the four bolts with lock washers from the inside of the brace into the leg bosses. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Cable guide", d: "Press the cable guide into the hole in the left side of the fender. The speedometer cable runs through it." },
      { t: "Steering lock", d: "Put the lock in its mount under the steering head and fit the screw with its lock washer." },
      { t: "Handlebar", d: "Set the handlebar in the lower holders with the knurled parts centred, then fit the upper holders. Bolt order and torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Cushions and nuts on the mirrors", d: "Slide the rubber cushion up the mirror stem, then run the lock nut up the thread." },
      { t: "Mirrors", d: "Screw each mirror into its lever bracket, set the angle, tighten the lock nut and pull the cushion down over it. The right mirror goes on the brake side, the left on the clutch side." },
      { t: "Throttle cables", d: "Route both throttle cables down the right side of the steering head to the carburettors. Clip them together below the head. Free play: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Clutch cable", d: "Route the clutch cable down the left side to the release on the engine cover and fit the boot over the lower adjuster. Free play: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Clamps", d: "Strap the throttle cables together near the carburettors and clamp the clutch cable to the frame. Turn the bars lock to lock and check nothing pulls or binds." },
    ],
    parts: [
      P("fender", "14", "Front fender", "chrome", 0, [0, 0, 0], [0, 1, 0], fender, { shell: true }),
      P("boltL", "15", "Bolts, fender (left)", "zinc", 1, [-45, -300, 0], [1, 0, 0], bolt(1), { small: true, count: 2, parent: "fender" }),
      P("lwL", "16", "Lock washers, fender bolts (left)", "spring", 1, [-20, -300, 0], [1, 0, 0], lwash(1), { small: true, count: 2, parent: "fender" }),
      P("boltR", "15", "Bolts, fender (right)", "zinc", 1, [45, -300, 0], [-1, 0, 0], bolt(-1), { small: true, count: 2, parent: "fender" }),
      P("lwR", "16", "Lock washers, fender bolts (right)", "spring", 1, [20, -300, 0], [-1, 0, 0], lwash(-1), { small: true, count: 2, parent: "fender" }),
      P("guide", "17", "Cable guide", "black", 2, [80, 0, 0], [-1, 0, 0], guide, { small: true, parent: "fender" }),
      P("lock", "6", "Steering lock", "dark", 3, [120, 0, 0], [-1, 0, 0], lock),
      P("lw8", "8", "Lock washer, steering lock screw", "spring", 3, [120, 50, 0], [0, -1, 0], lw8, { small: true, parent: "lock" }),
      P("screw7", "7", "Screw, steering lock", "zinc", 3, [120, 80, 0], [0, -1, 0], screw, { small: true, parent: "lock" }),
      P("bar", "1", "Handlebar", "chrome", 4, [0, 60, 0], [0, -1, 0], handlebar),
      P("mirR", "2", "Mirror, right", "chrome", 6, [0, 170, 0], [0, -1, 0], mirror(-1)),
      P("mirL", "3", "Mirror, left", "chrome", 6, [0, 170, 0], [0, -1, 0], mirror(1)),
      P("cushR", "4", "Cushion, right mirror", "rubber", 5, [0, 115, 0], [0, 1, 0], cushion(-1), { small: true, parent: "mirR" }),
      P("cushL", "4", "Cushion, left mirror", "rubber", 5, [0, 115, 0], [0, 1, 0], cushion(1), { small: true, parent: "mirL" }),
      P("nutR", "5", "Lock nut, right mirror", "zinc", 5, [0, 90, 0], [0, 1, 0], nut(-1), { small: true, parent: "mirR" }),
      P("nutL", "5", "Lock nut, left mirror", "zinc", 5, [0, 90, 0], [0, 1, 0], nut(1), { small: true, parent: "mirL" }),
      P("throttle", "11", "Throttle cables (pull and return)", "black", 7, [-100, -120, 0], [0, -1, 0], throttle, { count: 2 }),
      P("clip", "12", "Clip, throttle cables", "black", 7, [-420, -120, 0], [1, 0, 0], clip, { small: true, parent: "throttle" }),
      P("clutch", "10", "Clutch cable", "black", 8, [150, -120, 0], [0, -1, 0], clutch),
      P("band", "9", "Clamp (120 mm band)", "black", 9, [-420, -200, 0], [1, 0, 0], band, { small: true, parent: "throttle" }),
      P("clamp13", "13", "Clamp, clutch cable", "black", 9, [420, -120, 0], [-1, 0, 0], clamp13, { small: true, parent: "clutch" }),
    ],
  };
})();
D3_MODELS["CMS-BLCK0042"] = D3_BLCK0042;
