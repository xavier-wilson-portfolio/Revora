/* ============ 3D parts model: rear fender, GS750B 1977 (CMSNL BLCK0054) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame (same as the frame model d3_blck0023.js): origin on the swing arm pivot axis at the middle of the pivot
   tube, +X to the rider's LEFT, +Y up, +Z forward. Every part's geometry is laid out in world coordinates, so every A is
   [0, 0, 0] and E is the exploded offset.
   Frame points used: rear sub rails pass about (|x| 93.6, y 397, z -500), the top rails run at about |x| 80, y 421 near
   z -600, and the rear tab under the rear loop sits at y 412..416, z -655..-625.
   Rear wheel: axle taken at z -520, y 0 (swing arm drawn level, as in d3_blck0057.js), tyre radius about 315.
   Both fender pieces are arcs round the axle: the front piece (1) under the battery and down in front of the tyre,
   the rear piece (2) over the top and back past the frame, with a raised box (the "body") at the tail. The U-shaped
   reinforcement (19) is rubber mounted to the frame and the rear piece hangs from it.
   Layout and which part goes where follow the CMSNL picture. All sizes are approximate (typical 1970s 750 proportions);
   only the washer and spacer sizes in the catalogue descriptions are real figures. */
const D3_BLCK0054 = (() => {
  const r2 = v => Math.round(v * 100) / 100, D = Math.PI / 180;
  const AX = -520;                                                            // axle z
  const P = (R, a) => [r2(AX + R * Math.sin(a * D)), r2(R * Math.cos(a * D))];   // [z, y] on an arc round the axle, a = degrees from straight up (+ = forward)
  const arc = (R, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, k) => P(R, a0 + (a1 - a0) * k / n));
  const sector = (R1, R2, a0, a1) => [...arc(R2, a0, a1), ...arc(R1, a1, a0)];
  // flat outline drawn in the side view as [z, y] points, extruded across X from x0 by w (as in the frame model)
  const side = (pts, w, x0, holes, extra) => ({ type: "extrude", pts: pts.map(([z, y]) => [r2(-z), r2(y)]), holes: (holes || []).map(([z, y, r]) => [r2(-z), r2(y), r]),
    depth: w, bevel: .4, rot: [0, 90, 0], at: [r2(x0), 0, 0], ...(extra || {}) });
  // flat plate drawn in the plan view as [x, z] points, thickness t below ytop
  const flat = (pts, t, ytop, holes) => ({ type: "extrude", pts, holes: holes || [], depth: t, bevel: .4, rot: [90, 0, 0], at: [0, ytop, 0] });
  const hull = (cs, n = 20) => {
    const p = cs.flatMap(([a, b, r]) => Array.from({ length: n }, (_, k) => { const t = k / n * Math.PI * 2; return [a + r * Math.cos(t), b + r * Math.sin(t)]; }))
      .sort((u, v) => u[0] - v[0] || u[1] - v[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    p.forEach(q => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
    p.slice().reverse().forEach(q => { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); });
    return [...lo.slice(0, -1), ...up.slice(0, -1)].map(([a, b]) => [r2(a), r2(b)]);
  };
  // anything built along +Y, turned to run along X from |x| = x0 in direction d (1 outward, -1 inward) on side s
  const onX = (s, x0, d, y, z, items) => ({ type: "group", rot: [0, 0, s * d > 0 ? -90 : 90], at: [r2(s * x0), y, z], items });
  // ring along X from |x| = x0 running outward (o = 1) or inward (o = -1) on side s
  const wX = (s, x0, o, ro, ri, h, y, z, extra) => { const a = s * x0, b = s * (x0 + o * h); return { type: "ringX", ro, ri, h, at: [r2(Math.min(a, b)), y, z], ...(extra || {}) }; };
  const ex = (dx, dy = 0, dz = 0) => [dx, dy, dz], Z = [0, 0, 0];

  // ---- front piece (1): arc from 3 to 72 degrees, inside the rear piece where they overlap ----
  const tab3 = P(302, 60);
  const front = s => [
    side(sector(318, 363, 3, 72), 2.5, s > 0 ? 67.5 : -70),
    side(hull([[...P(332, 56), 8], [...P(332, 64), 8], [...tab3, 12]]), 2.5, s > 0 ? 67.5 : -70, [[...tab3, 6]]),
  ];
  const fender1 = { type: "group", items: [side(sector(360, 363, 3, 72), 140, -70), ...front(1), ...front(-1),
    side(sector(352, 363, 70, 72), 140, -70) ] };                               // rolled lip at the lower end

  // ---- rear piece (2): arc from 9 to -50 degrees, raised box at the tail, side tabs for the rubber mounts ----
  const T10 = [-600, 380];                                                    // cushion 10 / bolt 8 hole [z, y]
  const bodyWall = [[-660, 392], [-770, 392], ...arc(364, -43.4, -22.6, 8)];
  const rear = s => [
    side(sector(320, 366, 9, -50), 2.5, s > 0 ? 70 : -72.5),
    side(hull([[...T10, 11], [-622, 352, 5], [-578, 356, 5]]), 2.5, s > 0 ? 70 : -72.5, [[...T10, 6.5]]),
    side(bodyWall, 2.5, s > 0 ? 70 : -72.5),
  ];
  const fender2 = { type: "group", items: [side(sector(363, 366, 9, -50), 145, -72.5), ...rear(1), ...rear(-1),
    { type: "box", size: [145, 3, 110], r: 1, at: [0, 390.5, -715] },        // top of the body
    { type: "box", size: [145, 128, 3], r: 1, at: [0, 328, -768.5] },         // back of the body
    side(sector(358, 366, -48, -50), 145, -72.5) ] };                         // rolled lip at the tail

  // ---- reinforcement (19): two side arms joined by a cross plate at the back ----
  const H16 = [-500, 397];                                                    // front rubber mount [z, y]
  const arm = s => side(hull([[...H16, 16], [-650, 392, 9], [...T10, 11]]), 3, s > 0 ? 75 : -78, [[...H16, 11], [...T10, 3.2]]);
  const reinf = { type: "group", items: [arm(1), arm(-1),
    flat([[-78, -655], [78, -655], [78, -625], [-78, -625]], 4, 400, [[0, -640, 8.5]]),
    onX(1, 78, 1, T10[1], T10[0], [{ type: "hex", af: 10, h: 5, y: 0, hole: 3 }]),        // weld nuts for bolts 8
    onX(-1, 78, 1, T10[1], T10[0], [{ type: "hex", af: 10, h: 5, y: 0, hole: 3 }]) ] };

  // ---- front rubber mounts: bolt 12 from outside through the frame rail, nut inside ----
  const grom = (s, x0, L, ri, rb, rc, cw, y, z) => onX(s, x0, 1, y, z, [{ type: "lathe", pts: [[ri, 0], [rc, 0], [rc, cw], [rb, cw], [rb, L - cw], [rc, L - cw], [rc, L], [ri, L]] }]);
  const cush16 = s => grom(s, 72.75, 7.5, 6, 11, 13, 2.25, H16[1], H16[0]);
  const sp17 = s => wX(s, 72.75, 1, 6, 4.1, 7.5, H16[1], H16[0]);
  const w18 = s => wX(s, 80.25, 1, 9, 4.25, 1.2, H16[1], H16[0]);
  const w15 = s => wX(s, 72.75, -1, 13, 4.25, 1.2, H16[1], H16[0]);
  const lw14 = s => wX(s, 71.55, -1, 7.5, 4.2, 2, H16[1], H16[0], { split: true });
  const nut13 = s => onX(s, 69.55, -1, H16[1], H16[0], [{ type: "hex", af: 12, h: 6.5, y: 0, hole: 4 }]);
  const bolt12 = s => onX(s, 104.6, -1, H16[1], H16[0], [
    { type: "hex", af: 12, h: 5.5, y: -5.5 },
    { type: "lathe", pts: [[0, -.3], [4, -.3], [4, 43], [3.4, 43.6], [0, 43.6]] } ]);

  // ---- fender to reinforcement: bolt 8 from inside through cushion 10 / spacer 11 into the weld nut ----
  const cush10 = s => grom(s, 67.5, 7.5, 4.5, 6.5, 8.5, 2.5, T10[1], T10[0]);
  const sp11 = s => wX(s, 67.5, 1, 4.5, 3.05, 7.5, T10[1], T10[0]);
  const lw9 = s => wX(s, 65.5, -1, 5.5, 3.1, 2, T10[1], T10[0], { split: true });
  const bolt8 = s => onX(s, 65.5, 1, T10[1], T10[0], [
    { type: "hex", af: 10, h: 4, y: -4 },
    { type: "lathe", pts: [[0, -.3], [3, -.3], [3, 19.4], [2.5, 20], [0, 20]] } ]);

  // ---- rear mount: screw 20 down through the frame tab, spacer 21, cushion 22 in the cross plate ----
  const C = [0, -640];                                                        // [x, z]
  const atC = (y, item) => ({ ...item, at: [C[0], y, C[1]] });
  const scr20 = atC(416, { type: "group", items: [
    { type: "lathe", pts: [[0, 0], [6, 0], [6, 2.5], [4.5, 4], [0, 4]] },
    { type: "lathe", pts: [[0, .3], [3, .3], [3, -32.4], [2.5, -33], [0, -33]] } ] });
  const sp21 = atC(403, { type: "ring", ro: 4.5, ri: 3.05, h: 9 });
  const cush22 = atC(393, { type: "lathe", pts: [[3.1 + 1.4, 0], [11, 0], [11, 3], [8.5, 3], [8.5, 7], [11, 7], [11, 10], [4.5, 10]] });
  const w23 = atC(391.4, { type: "ring", ro: 11, ri: 3.25, h: 1.6 });
  const lw24 = atC(389.4, { type: "ring", ro: 5.5, ri: 3.1, h: 2, split: true });
  const nut25 = atC(384.4, { type: "hex", af: 10, h: 5, y: 0, hole: 3 });

  // ---- joint between the two pieces: screws 4 square to the fender at 6 degrees, washer, lock washer, nut inside ----
  const J = P(366, 6), JX = [-45, 45];
  const atJ = item => ({ type: "group", items: JX.map(x => ({ type: "group", rot: [6, 0, 0], at: [x, J[1], J[0]], items: [item] })) });
  const scr4 = atJ({ type: "group", items: [
    { type: "lathe", pts: [[0, 0], [4.5, 0], [4.5, 2.2], [3, 3.5], [0, 3.5]] },
    { type: "lathe", pts: [[0, .3], [2.5, .3], [2.5, -15], [0, -15]] } ] });
  const w5 = atJ({ type: "ring", ro: 8, ri: 2.75, h: 1.2, at: [0, -7.2, 0] });
  const lw6 = atJ({ type: "ring", ro: 4.6, ri: 2.6, h: 2, split: true, at: [0, -9.2, 0] });
  const nut7 = atJ({ type: "hex", af: 8, h: 4, y: -13.2, hole: 2.5 });

  // ---- cushion 3: grommet in the side tab of the front piece ----
  const cush3 = s => grom(s, 64.75, 8, 3, 6, 8, 2.75, tab3[1], tab3[0]);

  // ---- mud guide (26): rubber flap continuing the lower end of the front piece ----
  const a72 = 72 * D, t72 = [Math.cos(a72), -Math.sin(a72)], n72 = [Math.sin(a72), Math.cos(a72)];
  const M0 = P(360, 72), M1 = [r2(M0[0] + 110 * t72[0]), r2(M0[1] + 110 * t72[1])];
  const mud = side([P(360, 64), ...arc(360, 64, 72, 6).slice(1), M1, [r2(M1[0] - 3 * n72[0]), r2(M1[1] - 3 * n72[1])], ...arc(357, 72, 64, 6)], 130, -65);

  // ---- extension (27) bolted to the top of the body, sloping back and down ----
  const ext = { type: "group", items: [
    side([[-728, 400.7], [-772, 400.7], [-850, 353], [-885, 348], [-885, 345], [-850, 350], [-772, 397.7], [-728, 397.7]], 90, -45),
    side([[-772, 397.7], [-850, 350], [-850, 340], [-772, 387.7]], 3, 42),
    side([[-772, 397.7], [-850, 350], [-850, 340], [-772, 387.7]], 3, -45) ] };
  const EX = [-25, 25], EZ = -750;
  const atE = item => ({ type: "group", items: EX.map(x => ({ ...item, at: [x, item.at ? item.at[1] : 0, EZ] })) });
  const scr28 = { type: "group", items: EX.map(x => ({ type: "group", at: [x, 400.7, EZ], items: [
    { type: "lathe", pts: [[0, 0], [6, 0], [6, 2.5], [4.5, 4], [0, 4]] },
    { type: "lathe", pts: [[0, .3], [3, .3], [3, -16.4], [2.5, -17], [0, -17]] } ] })) };
  const sp29 = atE({ type: "ring", ro: 4.15, ri: 3.1, h: 5.7, at: [0, 392, 0] });
  const w30 = atE({ type: "ring", ro: 9, ri: 3.25, h: 1, at: [0, 388, 0] });
  const lw31 = atE({ type: "ring", ro: 5.5, ri: 3.1, h: 2, split: true, at: [0, 386, 0] });
  const nut32 = { type: "group", items: EX.map(x => ({ type: "hex", af: 10, h: 5, y: 0, hole: 3, at: [x, 381, EZ] })) };

  const F2 = ex(0, -260), F1 = ex(0, -260, 260), E27 = ex(0, -150, -140);
  const add = (a, b) => a.map((v, i) => v + b[i]);

  return {
    id: "CMS-BLCK0054", title: "Rear fender", units: "mm", page: "BLCK0054",
    accuracy: "Approximate geometry. Part identity, numbering and which part fits onto which follow the CMSNL rear fender page and its picture. Fender radius, widths, bracket shapes and mounting points are typical 1970s 750 proportions placed on the same frame and axle points as the frame and swing arm models, not measured from a GS750. Only the washer and spacer sizes in the catalogue descriptions are real figures. Use the factory service manual for every dimension.",
    view: { dir: [1, .75, 1], up: [0, 1, 0] },
    notModelled: "Every ref is drawn. Refs 1-1/1-2 and 2-1/2-2 are earlier and later part numbers for the same two fender pieces, so one of each is shown. Where the picture shows one set of mounting hardware, a matching set is drawn on the other side (refs 3, 8 to 18) and two screws are drawn at the joint and at the extension (refs 4 to 7, 28 to 32); check the count on your bike. The frame tabs that bolts 12 and screw 20 pass through are on the frame model; the peg cushion 3 sits on and the clips that hold the mud guide are not drawn. Rubber mounting order (which washer goes on which side of the cushions) is a best reading of the picture.",
    stages: [
      { t: "Rubber mounts into the reinforcement", d: "Push the cushions into the two front holes and the rear hole of the reinforcement, then the spacers into the cushions." },
      { t: "Front mounts to the frame", d: "Hold the reinforcement up under the rear frame. Fit a bolt from outside through each rear sub rail, the washer, the cushion and the big washer, then the lock washer and nut on the inside." },
      { t: "Rear mount to the frame tab", d: "Fit the screw down through the frame tab and the spacer into the rear cushion. Washer, lock washer and nut go on underneath. Torque for all mounts: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Cushions into the rear fender", d: "Fit the cushions and spacers into the side tabs of the rear fender." },
      { t: "Rear fender up into place", d: "Lift the rear fender up between the reinforcement arms so the tabs line up with the weld nuts." },
      { t: "Rear fender bolts", d: "From inside the fender, fit the bolts with lock washers through the spacers into the weld nuts on the arms." },
      { t: "Front piece", d: "Slide the front piece up under the front edge of the rear fender so the holes line up. The cushions in its side tabs go over the pegs on the frame." },
      { t: "Joint screws", d: "Fit the screws down through both pieces with the washer, lock washer and nut underneath." },
      { t: "Mud guide", d: "Fit the mud guide over the lower end of the front piece." },
      { t: "Extension", d: "Put the spacers on the body of the rear fender, sit the extension on them and fit the screws. Washer, lock washer and nut go inside the body." },
    ],
    parts: [
      { id: "reinf", ref: "19", name: "Rear fender reinforcement", mat: "black", stage: 0, A: Z, E: Z, dir: [0, 1, 0], geom: reinf },
      // stage 1: rubber mounts into the reinforcement
      { id: "c16L", ref: "16", name: "Cushion, front mount (left)", mat: "rubber", small: true, parent: "reinf", stage: 1, A: Z, E: ex(40), dir: [-1, 0, 0], geom: cush16(1) },
      { id: "c16R", ref: "16", name: "Cushion, front mount (right)", mat: "rubber", small: true, parent: "reinf", stage: 1, A: Z, E: ex(-40), dir: [1, 0, 0], geom: cush16(-1) },
      { id: "s17L", ref: "17", name: "Spacer 8.2 x 12 x 7.5 (left)", mat: "steel", small: true, parent: "c16L", stage: 1, A: Z, E: ex(80), dir: [-1, 0, 0], geom: sp17(1) },
      { id: "s17R", ref: "17", name: "Spacer 8.2 x 12 x 7.5 (right)", mat: "steel", small: true, parent: "c16R", stage: 1, A: Z, E: ex(-80), dir: [1, 0, 0], geom: sp17(-1) },
      { id: "c22", ref: "22", name: "Cushion, rear mount", mat: "rubber", small: true, parent: "reinf", stage: 1, A: Z, E: ex(0, 30), dir: [0, -1, 0], geom: cush22 },
      // stage 2: front mounts
      { id: "w18L", ref: "18", name: "Washer, front mount (left)", mat: "zinc", small: true, parent: "reinf", stage: 2, A: Z, E: ex(110), dir: [-1, 0, 0], geom: w18(1) },
      { id: "w18R", ref: "18", name: "Washer, front mount (right)", mat: "zinc", small: true, parent: "reinf", stage: 2, A: Z, E: ex(-110), dir: [1, 0, 0], geom: w18(-1) },
      { id: "b12L", ref: "12", name: "Bolt, front mount (left)", mat: "zinc", small: true, parent: "reinf", stage: 2, A: Z, E: ex(150), dir: [-1, 0, 0], geom: bolt12(1) },
      { id: "b12R", ref: "12", name: "Bolt, front mount (right)", mat: "zinc", small: true, parent: "reinf", stage: 2, A: Z, E: ex(-150), dir: [1, 0, 0], geom: bolt12(-1) },
      { id: "w15L", ref: "15", name: "Washer 8.5 x 26 x 1.2 (left)", mat: "zinc", small: true, parent: "b12L", stage: 2, A: Z, E: ex(-20, 0, 40), dir: [1, 0, 0], geom: w15(1) },
      { id: "w15R", ref: "15", name: "Washer 8.5 x 26 x 1.2 (right)", mat: "zinc", small: true, parent: "b12R", stage: 2, A: Z, E: ex(20, 0, 40), dir: [-1, 0, 0], geom: w15(-1) },
      { id: "lw14L", ref: "14", name: "Lock washer, front mount (left)", mat: "spring", small: true, parent: "b12L", stage: 2, A: Z, E: ex(-30, 0, 40), dir: [1, 0, 0], geom: lw14(1) },
      { id: "lw14R", ref: "14", name: "Lock washer, front mount (right)", mat: "spring", small: true, parent: "b12R", stage: 2, A: Z, E: ex(30, 0, 40), dir: [-1, 0, 0], geom: lw14(-1) },
      { id: "n13L", ref: "13", name: "Nut, front mount (left)", mat: "zinc", small: true, parent: "b12L", stage: 2, A: Z, E: ex(-45, 0, 40), dir: [1, 0, 0], geom: nut13(1) },
      { id: "n13R", ref: "13", name: "Nut, front mount (right)", mat: "zinc", small: true, parent: "b12R", stage: 2, A: Z, E: ex(45, 0, 40), dir: [-1, 0, 0], geom: nut13(-1) },
      // stage 3: rear mount
      { id: "s21", ref: "21", name: "Spacer 6.1 x 9 x 9", mat: "steel", small: true, parent: "reinf", stage: 3, A: Z, E: ex(0, 45), dir: [0, -1, 0], geom: sp21 },
      { id: "sc20", ref: "20", name: "Screw, rear mount", mat: "zinc", small: true, parent: "reinf", stage: 3, A: Z, E: ex(0, 100), dir: [0, -1, 0], geom: scr20 },
      { id: "w23", ref: "23", name: "Washer 6.5 x 22 x 1.6", mat: "zinc", small: true, parent: "sc20", stage: 3, A: Z, E: ex(0, -40), dir: [0, 1, 0], geom: w23 },
      { id: "lw24", ref: "24", name: "Lock washer, rear mount", mat: "spring", small: true, parent: "sc20", stage: 3, A: Z, E: ex(0, -60), dir: [0, 1, 0], geom: lw24 },
      { id: "n25", ref: "25", name: "Nut, rear mount", mat: "zinc", small: true, parent: "sc20", stage: 3, A: Z, E: ex(0, -80), dir: [0, 1, 0], geom: nut25 },
      // stages 4-6: rear fender
      { id: "f2", ref: "2", name: "Rear fender (rear piece)", mat: "black", shell: true, parent: "reinf", stage: 5, A: Z, E: F2, dir: [0, 1, 0], geom: fender2 },
      { id: "c10L", ref: "10", name: "Cushion, fender side tab (left)", mat: "rubber", small: true, parent: "f2", stage: 4, A: Z, E: add(F2, ex(40)), dir: [-1, 0, 0], geom: cush10(1) },
      { id: "c10R", ref: "10", name: "Cushion, fender side tab (right)", mat: "rubber", small: true, parent: "f2", stage: 4, A: Z, E: add(F2, ex(-40)), dir: [1, 0, 0], geom: cush10(-1) },
      { id: "s11L", ref: "11", name: "Spacer 6.1 x 9 x 7.5 (left)", mat: "steel", small: true, parent: "c10L", stage: 4, A: Z, E: add(F2, ex(80)), dir: [-1, 0, 0], geom: sp11(1) },
      { id: "s11R", ref: "11", name: "Spacer 6.1 x 9 x 7.5 (right)", mat: "steel", small: true, parent: "c10R", stage: 4, A: Z, E: add(F2, ex(-80)), dir: [1, 0, 0], geom: sp11(-1) },
      { id: "lw9L", ref: "9", name: "Lock washer, fender bolt (left)", mat: "spring", small: true, parent: "f2", stage: 6, A: Z, E: ex(-15, 50), dir: [1, 0, 0], geom: lw9(1) },
      { id: "lw9R", ref: "9", name: "Lock washer, fender bolt (right)", mat: "spring", small: true, parent: "f2", stage: 6, A: Z, E: ex(15, 50), dir: [-1, 0, 0], geom: lw9(-1) },
      { id: "b8L", ref: "8", name: "Bolt, fender to reinforcement (left)", mat: "zinc", small: true, parent: "f2", stage: 6, A: Z, E: ex(-40, 50), dir: [1, 0, 0], geom: bolt8(1) },
      { id: "b8R", ref: "8", name: "Bolt, fender to reinforcement (right)", mat: "zinc", small: true, parent: "f2", stage: 6, A: Z, E: ex(40, 50), dir: [-1, 0, 0], geom: bolt8(-1) },
      // stages 7-9: front piece
      { id: "f1", ref: "1", name: "Rear fender (front piece)", mat: "dark", shell: true, parent: "f2", stage: 7, A: Z, E: F1, dir: [0, .26, -.97], geom: fender1 },
      { id: "c3L", ref: "3", name: "Cushion, front piece (left)", mat: "rubber", small: true, parent: "f1", stage: 7, A: Z, E: add(F1, ex(40)), dir: [-1, 0, 0], geom: cush3(1) },
      { id: "c3R", ref: "3", name: "Cushion, front piece (right)", mat: "rubber", small: true, parent: "f1", stage: 7, A: Z, E: add(F1, ex(-40)), dir: [1, 0, 0], geom: cush3(-1) },
      { id: "sc4", ref: "4", name: "Screws, fender joint", mat: "zinc", small: true, parent: "f1", stage: 8, A: Z, E: ex(0, 80, 20), dir: [0, -.99, -.1], count: 2, geom: scr4 },
      { id: "w5", ref: "5", name: "Washers 5.5 x 16 x 1.2", mat: "zinc", small: true, parent: "sc4", stage: 8, A: Z, E: ex(0, -40), dir: [0, .99, .1], count: 2, geom: w5 },
      { id: "lw6", ref: "6", name: "Lock washers, fender joint", mat: "spring", small: true, parent: "sc4", stage: 8, A: Z, E: ex(0, -60), dir: [0, .99, .1], count: 2, geom: lw6 },
      { id: "n7", ref: "7", name: "Nuts, fender joint", mat: "zinc", small: true, parent: "sc4", stage: 8, A: Z, E: ex(0, -85), dir: [0, .99, .1], count: 2, geom: nut7 },
      { id: "mud", ref: "26", name: "Mud guide", mat: "rubber", parent: "f1", stage: 9, A: Z, E: ex(0, -410, 320), dir: [0, .95, -.31], geom: mud },
      // stage 10: extension
      { id: "ext", ref: "27", name: "Rear fender extension", mat: "black", parent: "f2", stage: 10, A: Z, E: E27, dir: [0, -1, 0], geom: ext },
      { id: "sp29", ref: "29", name: "Spacers 6.2 x 8.3 x 5.7", mat: "steel", small: true, parent: "f2", stage: 10, A: Z, E: add(E27, ex(0, -65)), dir: [0, -1, 0], count: 2, geom: sp29 },
      { id: "sc28", ref: "28", name: "Screws 6 x 15, extension", mat: "zinc", small: true, parent: "ext", stage: 10, A: Z, E: add(E27, ex(0, 70)), dir: [0, -1, 0], count: 2, geom: scr28 },
      { id: "w30", ref: "30", name: "Washers 6.5 x 18 x 1", mat: "zinc", small: true, parent: "sc28", stage: 10, A: Z, E: add(E27, ex(0, -100)), dir: [0, 1, 0], count: 2, geom: w30 },
      { id: "lw31", ref: "31", name: "Lock washers, extension", mat: "spring", small: true, parent: "sc28", stage: 10, A: Z, E: add(E27, ex(0, -120)), dir: [0, 1, 0], count: 2, geom: lw31 },
      { id: "n32", ref: "32", name: "Nuts, extension", mat: "zinc", small: true, parent: "sc28", stage: 10, A: Z, E: add(E27, ex(0, -145)), dir: [0, 1, 0], count: 2, geom: nut32 },
    ],
  };
})();
D3_MODELS["CMS-BLCK0054"] = D3_BLCK0054;
