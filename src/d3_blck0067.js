/* ============ 3D parts model: stands and rear brake pedal, GS750B 1977 (CMSNL BLCK0067) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame (same as the frame model d3_blck0023.js): origin on the swing arm pivot axis at the middle of the pivot
   tube, +X to the rider's LEFT, +Y up, +Z forward. Every part's geometry is laid out in world coordinates, so every A is
   [0, 0, 0] and E is the exploded offset.
   Frame points used: the stand lugs low on the rear of the cradle are plates at |x| 147..153 with a hole at y -190, z 5
   (centre stand pivot here); the left cradle rail runs at about x 126, y -185 between z 200 and 275 (side stand bracket
   bolts up under it); the right rear down tube is at about x -145, z 35..75, so the brake pedal shaft sits behind it at
   y -120, z -20.
   Both stands are drawn up (riding position). The centre stand is built legs-down round its pivot and turned 78 degrees
   back about the pivot axis. The side stand pivots on a bolt across the bike and lies back along the left side.
   Layout and which part goes where follow the CMSNL picture. All sizes are approximate (typical 1970s 750 proportions);
   only the 10 mm stand bolts (part numbers), the spacer 10 x 16 x 38.8, bolt 10 x 30 and cushion 11.5 x 22 x 20 from the
   catalogue descriptions are real figures. */
const D3_BLCK0067 = (() => {
  const r2 = v => Math.round(v * 100) / 100, D = Math.PI / 180;
  const side = (pts, w, x0, holes, extra) => ({ type: "extrude", pts: pts.map(([z, y]) => [r2(-z), r2(y)]), holes: (holes || []).map(([z, y, r]) => [r2(-z), r2(y), r]),
    depth: w, bevel: .5, rot: [0, 90, 0], at: [r2(x0), 0, 0], ...(extra || {}) });
  const hull = (cs, n = 20) => {
    const p = cs.flatMap(([a, b, r]) => Array.from({ length: n }, (_, k) => { const t = k / n * Math.PI * 2; return [a + r * Math.cos(t), b + r * Math.sin(t)]; }))
      .sort((u, v) => u[0] - v[0] || u[1] - v[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    p.forEach(q => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
    p.slice().reverse().forEach(q => { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); });
    return [...lo.slice(0, -1), ...up.slice(0, -1)].map(([a, b]) => [r2(a), r2(b)]);
  };
  const onX = (s, x0, d, y, z, items) => ({ type: "group", rot: [0, 0, s * d > 0 ? -90 : 90], at: [r2(s * x0), y, z], items });
  const wX = (s, x0, o, ro, ri, h, y, z, extra) => { const a = s * x0, b = s * (x0 + o * h); return { type: "ringX", ro, ri, h, at: [r2(Math.min(a, b)), y, z], ...(extra || {}) }; };
  const tube = (pts, r, extra) => ({ type: "tube", pts: pts.map(p => p.map(r2)), r, ...(extra || {}) });
  const ex = (dx, dy = 0, dz = 0) => [dx, dy, dz], Z = [0, 0, 0];
  const add = (a, b) => a.map((v, i) => v + b[i]);

  // ================= centre stand =================
  const PY = -190, PZ = 5, TH = 78, c = Math.cos(TH * D), s_ = Math.sin(TH * D);
  // stand local (legs straight down from the pivot, -Z = rear side) -> world, turned TH degrees back
  const R = ([x, y, z]) => [r2(x), r2(PY + y * c - z * s_), r2(PZ + y * s_ + z * c)];
  const leg = s => [[s * 173, -6, 0], [s * 170, -60, -6], [s * 164, -180, -10], [s * 156, -280, -8], [s * 150, -322, -4]];
  const cstand = { type: "group", items: [
    wX(1, 154, 1, 13, 8, 38, PY, PZ), wX(-1, 154, 1, 13, 8, 38, PY, PZ),           // pivot bosses
    tube(leg(1).map(R), 12), tube(leg(-1).map(R), 12),
    tube([[-166, -190, -12], [-80, -200, -26], [0, -203, -30], [80, -200, -26], [166, -190, -12]].map(R), 11),   // cross tube
    ...[1, -1].map(s => ({ type: "box", size: [44, 10, 64], r: 3, rot: [TH, 0, 0], at: R([s * 150, -330, 0]) })),  // feet
    tube([[158, -255, -10], [196, -250, -24], [222, -236, -44]].map(R), 9),                          // foot lever
    { type: "box", size: [34, 8, 44], r: 2, rot: [TH, 0, 0], at: R([228, -232, -50]) },
    { type: "box", size: [26, 26, 5], r: 1, rot: [TH, 0, 0], at: R([150, -290, -14.5]) },           // stopper tab for cushion 7
  ] };
  // spring tab on the right boss, behind the pivot (local (x, -42.7, -39.7) -> about y -160, z -45)
  const SP6a = R([-161, -42.7, -39.7]);                                      // stand end of spring 6
  const SP6b = [-161, -150, 40];                                              // frame end: top of the right stand lug
  cstand.items.push(side(hull([[PZ, PY, 13], [SP6a[2], SP6a[1], 6]]), 6, -164, [[SP6a[2], SP6a[1], 2.2]]));
  // cushion 7 on the stopper tab (sticks out of the stand's rear side, up when the stand is folded)
  const cush7 = { type: "group", rot: [TH - 90, 0, 0], at: R([150, -290, -17]), items: [
    { type: "lathe", pts: [[0, 0], [9, 0], [9, 9], [7, 12], [0, 12]] } ] };

  // pivot hardware: spacer 2 in the boss, bolt 3 from outside through spacer and lug, clip 5 through the bolt tip
  const sp2 = s => wX(s, 153.6, 1, 8, 5.1, 38.8, PY, PZ);
  const lw4 = s => wX(s, 192.4, 1, 9, 5.2, 2.5, PY, PZ, { split: true });
  const bolt3 = s => onX(s, 194.9, -1, PY, PZ, [
    { type: "hex", af: 14, h: 7, y: -7 },
    { type: "lathe", pts: [[0, -.3], [5, -.3], [5, 59], [4.4, 60], [0, 60]] } ]);
  const clip5 = s => tube([[s * 140, PY + 7, PZ - 1.5], [s * 140, PY, PZ], [s * 140, PY - 7, PZ + 1.5], [s * 140, PY - 9, PZ + 6], [s * 140, PY - 4, PZ + 11], [s * 140, PY + 4, PZ + 10], [s * 140, PY + 8, PZ + 4]], 1.1);

  // spring 6: between the tab and the stand lug, with hooks
  const springBetween = (a, b, R0, wire, turns, hookLen) => {
    const dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dy, dz), uy = dy / L, uz = dz / L, ang = Math.atan2(dz, dy) / D;
    const p = t => [a[0], r2(a[1] + uy * t), r2(a[2] + uz * t)];
    return { type: "group", items: [
      { type: "spring", R: R0, wire, h: r2(L - 2 * hookLen), turns, rot: [ang, 0, 0], at: p(hookLen) },
      tube([a, [a[0], r2(a[1] + uy * hookLen * .5 + 3), r2(a[2] + uz * hookLen * .5)], p(hookLen)], wire / 2),
      tube([p(L - hookLen), [a[0], r2(b[1] - uy * hookLen * .5 + 3), r2(b[2] - uz * hookLen * .5)], b], wire / 2) ] };
  };
  const spring6 = springBetween(SP6a, SP6b, 6, 2.2, 18, 14);

  // ================= side stand =================
  const BZ = [200, 275], BX = 127, BY = -199.5;                               // bracket flange under the left cradle rail
  const SPV = [158, -245, 230];                                               // side stand pivot centre (x is the middle of the boss)
  const PEG = [300, -265];                                                    // spring 9 peg on the bracket [z, y]
  const bracket = { type: "group", items: [
    { type: "box", size: [30, 4, 75], r: 1, at: [BX, BY - 2, (BZ[0] + BZ[1]) / 2] },
    side([[200, -199.5], [275, -199.5], [318, -248], [314, -276], [290, -281], [252, -270], [212, -266], [200, -240]], 5, 142,
      [[SPV[2], SPV[1], 5.2]]),
    { type: "cyl", r: 3, h: 21, axis: "x", at: [147, PEG[1], PEG[0]] },
    { type: "cyl", r: 4.5, h: 2, axis: "x", at: [166, PEG[1], PEG[0]] } ] };
  const lw15 = { type: "group", items: [215, 260].map(z => ({ type: "ring", ro: 9, ri: 5.2, h: 2, split: true, at: [BX, BY - 6, z] })) };
  const bolts14 = { type: "group", items: [215, 260].map(z => ({ type: "group", at: [BX, BY - 4, z], items: [
    { type: "hex", af: 14, h: 6, y: -8 },
    { type: "lathe", pts: [[0, -2.3], [5, -2.3], [5, 25], [4.4, 26], [0, 26]] } ] })) };

  const sarm = [[158, -245, 230], [166, -246, 150], [188, -245, 20], [202, -242, -60], [208, -238, -96]];
  const sstand = { type: "group", items: [
    wX(1, 147, 1, 13, 5.1, 22, SPV[1], SPV[2]),
    tube(sarm, 11),
    { type: "box", size: [40, 12, 56], r: 3, at: [196, -254, -30] },              // foot
    side([[200, -240], [180, -240], [182, -282], [196, -282]], 6, 160, [[189, -275, 2.5]]),    // spring tab
    { type: "cyl", r: 5.75, h: 14, axis: "z", at: [208, -238, -116] } ] };          // tip pin for cushion 12
  const cush12 = { type: "group", items: [{ type: "lathe", rot: [-90, 0, 0], at: [208, -238, -100], pts: [[5.75, 0], [11, 0], [11, 20], [5.75, 20]] }] };
  const bolt10 = onX(1, 169, -1, SPV[1], SPV[2], [
    { type: "hex", af: 14, h: 7, y: -7 },
    { type: "lathe", pts: [[0, -.3], [5, -.3], [5, 29], [4.4, 30], [0, 30]] } ]);
  const nut11 = onX(1, 142, -1, SPV[1], SPV[2], [{ type: "hex", af: 14, h: 8, y: 0, hole: 5 }]);
  const spring9 = springBetween([163, -275, 189], [163, PEG[1], PEG[0]], 5.5, 2, 16, 12);

  // ================= rear brake pedal (right side) =================
  const BY0 = -120, BZ0 = -20;                                                // pedal shaft axis
  const arm17 = { type: "group", items: [
    onX(-1, 120, 1, BY0, BZ0, [
      { type: "lathe", pts: [[0, 0], [8.5, 0], [8.5, 50], [9, 50], [9, 72], [0, 72]] } ]),        // plain shaft, splined end outboard
    ...Array.from({ length: 12 }, (_, k) => ({ type: "box", size: [22, 2, 2], r: .3, at: [-181, r2(BY0 + 9 * Math.cos(k * 30 * D)), r2(BZ0 + 9 * Math.sin(k * 30 * D))] })),
    side(hull([[BZ0, BY0, 15], [-70, -120, 10]]), 6, -128, [[-70, -120, 4.1]]) ] };
  const spring20 = { type: "group", items: [
    { type: "spring", R: 13, wire: 2.2, h: 14, turns: 3.5, rot: [0, 0, 90], at: [-150, BY0, BZ0] },
    tube([[-150, BY0 - 13, BZ0], [-150, BY0 - 26, BZ0 + 12], [-150, BY0 - 30, BZ0 + 26]], 1.1),
    tube([[-164, BY0 + 13, BZ0], [-166, BY0 + 18, BZ0 - 8], [-168, BY0 + 18, BZ0 - 30]], 1.1) ] };
  const pedal = { type: "group", items: [
    wX(-1, 168, 1, 18, 9, 22, BY0, BZ0),
    side([[BZ0 - 12, BY0 + 10], [-58, BY0 + 10], [-58, BY0 - 1], [BZ0 - 12, BY0 - 1]], 16, -186),       // clamp jaws either side of the slot
    side([[BZ0 - 12, BY0 - 3], [-58, BY0 - 3], [-58, BY0 - 14], [BZ0 - 12, BY0 - 14]], 16, -186),
    tube([[-182, BY0 - 4, BZ0 + 14], [-186, BY0 - 14, 60], [-196, BY0 - 10, 170], [-206, BY0 + 2, 232]], 8),
    { type: "cyl", r: 13, h: 40, axis: "x", at: [-232, BY0 + 4, 240], mat: "rubber" } ] };
  const bolt18 = { type: "group", at: [-178, BY0 + 10, -48], items: [
    { type: "hex", af: 12, h: 5.5, y: 2 },
    { type: "lathe", pts: [[0, 2.3], [4, 2.3], [4, -23], [3.4, -24], [0, -24]] } ] };
  const lw19 = { type: "ring", ro: 7.5, ri: 4.2, h: 2, split: true, at: [-178, BY0 + 10, -48] };
  // clevis pin 21 from inside through the arm, washer 23 and cotter pin 22 outboard
  const pin21 = onX(-1, 122, 1, -120, -70, [
    { type: "lathe", pts: [[0, -4], [6.5, -4], [6.5, 0], [4, 0], [4, 13], [3.5, 14], [0, 14]] } ]);
  const w23 = wX(-1, 128, 1, 8, 4.1, 1.6, -120, -70);
  const cot22 = tube([[-132.5, -111, -70], [-132.5, -120, -70.6], [-132.5, -129, -71.2], [-134, -133, -70], [-132.5, -129, -68.8], [-132.5, -120, -69.4]], 1);

  const ECS = ex(0, -200);                                                    // centre stand exploded
  const ESS = ex(80);                                                         // side stand exploded
  const EAR = ex(100);                                                        // brake shaft exploded (inboard)
  const EPD = ex(-150);                                                       // pedal exploded

  return {
    id: "CMS-BLCK0067", title: "Stand", units: "mm", page: "BLCK0067",
    accuracy: "Approximate geometry. Part identity, numbering and which part fits onto which follow the CMSNL stand page and its picture. Leg shapes, lengths, bracket outlines, the brake pedal and the pivot positions are typical 1970s 750 proportions placed on the stand lugs and rails of the frame model, not measured from a GS750. Real figures used: 10 mm stand bolts (part numbers), spacer 10 x 16 x 38.8, bolt 10 x 30 and cushion 11.5 x 22 x 20 from the catalogue descriptions. Use the factory service manual for every dimension.",
    view: { dir: [1, .7, .95], up: [0, 1, 0] },
    notModelled: "Every ref is drawn. Refs 1-1/1-2 are earlier and later part numbers for the same centre stand, so one is shown. The picture shows one set of centre stand pivot hardware (refs 2 to 5); a matching set is drawn on the other side. Only one centre stand spring is drawn, as in the picture. The frame tapped bosses that bolts 14 go into, the frame boss the brake pedal shaft turns in and the master cylinder push rod clevis that pin 21 goes through are on other models and aren't drawn. Clip 5 is read as a clip through the tip of each pivot bolt; check your bike.",
    stages: [
      { t: "Side stand bracket bolts", d: "Hold the bracket up under the left frame rail and fit the two bolts with lock washers. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Side stand", d: "Fit the cushion on the tip of the side stand, then hold the stand's boss against the outside of the bracket." },
      { t: "Side stand pivot bolt", d: "Grease the bolt, push it through the boss and the bracket from outside and fit the nut on the inside. The stand must swing freely." },
      { t: "Side stand spring", d: "Hook the spring onto the tab on the stand, stretch it and hook the other end over the peg on the bracket." },
      { t: "Centre stand spacers", d: "Grease the spacers and push them into the two pivot bosses. Fit the rubber stopper to its tab." },
      { t: "Centre stand", d: "Hold the centre stand up so its bosses line up with the holes in the stand lugs on the frame." },
      { t: "Centre stand bolts", d: "Fit a pivot bolt with lock washer through each boss and lug, then the clip through the tip. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Centre stand spring", d: "Hook the spring onto the tab behind the right pivot and pull it forward onto the stand lug. Check the stand snaps up and stays up." },
      { t: "Brake pedal shaft", d: "Grease the shaft and slide it out through the frame boss from inside, arm end inboard." },
      { t: "Pedal return spring", d: "Slide the spring onto the shaft with one leg against the frame and the other ready to catch the pedal." },
      { t: "Brake pedal", d: "Push the pedal onto the splines at the height you want, with the spring leg behind it, and fit the pinch bolt with lock washer. Pedal height: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Push rod pin", d: "Line the arm up with the master cylinder push rod clevis, fit the pin from inside, the washer and a new cotter pin." },
    ],
    parts: [
      { id: "brk", ref: "13", name: "Side stand bracket", mat: "black", stage: 0, A: Z, E: Z, dir: [0, 1, 0], geom: bracket },
      { id: "lw15", ref: "15", name: "Lock washers, bracket bolts", mat: "spring", small: true, parent: "brk", stage: 1, A: Z, E: ex(0, -85), dir: [0, 1, 0], count: 2, geom: lw15 },
      { id: "b14", ref: "14", name: "Bolts, side stand bracket", mat: "zinc", small: true, parent: "brk", stage: 1, A: Z, E: ex(0, -130), dir: [0, 1, 0], count: 2, geom: bolts14 },
      { id: "ss", ref: "8", name: "Side stand", mat: "black", parent: "brk", stage: 2, A: Z, E: ESS, dir: [-1, 0, 0], geom: sstand },
      { id: "c12", ref: "12", name: "Cushion 11.5 x 22 x 20 (side stand tip)", mat: "rubber", small: true, parent: "ss", stage: 2, A: Z, E: add(ESS, ex(0, 0, -60)), dir: [0, 0, 1], geom: cush12 },
      { id: "b10", ref: "10", name: "Bolt 10 x 30, side stand pivot", mat: "zinc", small: true, parent: "ss", stage: 3, A: Z, E: ex(200), dir: [-1, 0, 0], geom: bolt10 },
      { id: "n11", ref: "11", name: "Nut, side stand pivot", mat: "zinc", small: true, parent: "b10", stage: 3, A: Z, E: ex(-60), dir: [1, 0, 0], geom: nut11 },
      { id: "sp9", ref: "9", name: "Side stand spring", mat: "spring", parent: "ss", stage: 4, A: Z, E: ex(0, -100), dir: [0, 1, 0], geom: spring9 },
      // centre stand
      { id: "cs", ref: "1", name: "Centre stand", mat: "black", stage: 6, A: Z, E: ECS, dir: [0, 1, 0], geom: cstand },
      { id: "s2L", ref: "2", name: "Spacer 10 x 16 x 38.8 (left)", mat: "steel", small: true, parent: "cs", stage: 5, A: Z, E: add(ECS, ex(110)), dir: [-1, 0, 0], geom: sp2(1) },
      { id: "s2R", ref: "2", name: "Spacer 10 x 16 x 38.8 (right)", mat: "steel", small: true, parent: "cs", stage: 5, A: Z, E: add(ECS, ex(-110)), dir: [1, 0, 0], geom: sp2(-1) },
      { id: "c7", ref: "7", name: "Cushion (centre stand stopper)", mat: "rubber", small: true, parent: "cs", stage: 5, A: Z, E: add(ECS, [0, r2(140 * s_), r2(-140 * c)]), dir: [0, -s_, c], geom: cush7 },
      { id: "lw4L", ref: "4", name: "Lock washer, pivot bolt (left)", mat: "spring", small: true, parent: "cs", stage: 7, A: Z, E: ex(40), dir: [-1, 0, 0], geom: lw4(1) },
      { id: "lw4R", ref: "4", name: "Lock washer, pivot bolt (right)", mat: "spring", small: true, parent: "cs", stage: 7, A: Z, E: ex(-40), dir: [1, 0, 0], geom: lw4(-1) },
      { id: "b3L", ref: "3", name: "Bolt, centre stand pivot (left)", mat: "zinc", small: true, parent: "cs", stage: 7, A: Z, E: ex(110), dir: [-1, 0, 0], geom: bolt3(1) },
      { id: "b3R", ref: "3", name: "Bolt, centre stand pivot (right)", mat: "zinc", small: true, parent: "cs", stage: 7, A: Z, E: ex(-110), dir: [1, 0, 0], geom: bolt3(-1) },
      { id: "cl5L", ref: "5", name: "Clip, pivot bolt (left)", mat: "spring", small: true, parent: "b3L", stage: 7, A: Z, E: ex(-40), dir: [1, 0, 0], geom: clip5(1) },
      { id: "cl5R", ref: "5", name: "Clip, pivot bolt (right)", mat: "spring", small: true, parent: "b3R", stage: 7, A: Z, E: ex(40), dir: [-1, 0, 0], geom: clip5(-1) },
      { id: "sp6", ref: "6", name: "Centre stand spring", mat: "spring", parent: "cs", stage: 8, A: Z, E: ex(-120), dir: [1, 0, 0], geom: spring6 },
      // brake pedal
      { id: "arm", ref: "17", name: "Brake pedal shaft and rod arm", mat: "black", stage: 9, A: Z, E: EAR, dir: [-1, 0, 0], geom: arm17 },
      { id: "sp20", ref: "20", name: "Brake pedal return spring", mat: "spring", parent: "arm", stage: 10, A: Z, E: ex(-80), dir: [1, 0, 0], geom: spring20 },
      { id: "ped", ref: "16", name: "Brake pedal", mat: "black", parent: "arm", stage: 11, A: Z, E: EPD, dir: [1, 0, 0], geom: pedal },
      { id: "lw19", ref: "19", name: "Lock washer, pedal pinch bolt", mat: "spring", small: true, parent: "ped", stage: 11, A: Z, E: add(EPD, ex(0, 40)), dir: [0, -1, 0], geom: lw19 },
      { id: "b18", ref: "18", name: "Pinch bolt, brake pedal", mat: "zinc", small: true, parent: "ped", stage: 11, A: Z, E: add(EPD, ex(0, 80)), dir: [0, -1, 0], geom: bolt18 },
      { id: "pin21", ref: "21", name: "Pin, push rod clevis", mat: "zinc", small: true, parent: "arm", stage: 12, A: Z, E: add(EAR, ex(60)), dir: [-1, 0, 0], geom: pin21 },
      { id: "w23", ref: "23", name: "Washer, clevis pin", mat: "zinc", small: true, parent: "pin21", stage: 12, A: Z, E: add(EAR, ex(0, -60)), dir: [1, 0, 0], geom: w23 },
      { id: "cot22", ref: "22", name: "Cotter pin", mat: "spring", small: true, parent: "pin21", stage: 12, A: Z, E: add(EAR, ex(0, -90)), dir: [1, 0, 0], geom: cot22 },
    ],
  };
})();
D3_MODELS["CMS-BLCK0067"] = D3_BLCK0067;
