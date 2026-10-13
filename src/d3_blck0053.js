/* ============ 3D parts model: rear combination lamp, GS750B 1977 (CMSNL BLCK0053) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: +X = rider's LEFT, +Y up, +Z forward. The lamp faces backward (-Z). Z = 0 is the front face of the lamp base,
   which sits against the licence plate bracket (10); the stay (11) is bolted on in front of that.
   Layout follows the CMSNL picture: from the back, lens screws (5) with their rubber gaskets (6), lens (2), lens gasket (3),
   bulb (4), lamp base (part of assembly 1), licence plate bracket (10), stay (11), then washers (7), lock washers (8) and
   bolts (9) from the front. The four bolts (M6 x 12 going by the part number) go through the stay and the plate bracket into
   threaded inserts in the lamp base; that is read from the picture (four matching holes on both brackets) and not confirmed.
   Sizes: typical proportions for a 1970s Suzuki tail lamp, not measured. Geometry is APPROXIMATE. Every part is drawn in
   world coordinates, so A = [0, 0, 0] and E is the exploded offset. */
const D3_BLCK0053 = (() => {
  const r3 = v => +(+v).toFixed(3);
  // rounded rectangle outline, counter-clockwise, centred on (cx, cy)
  const rr = (w, h, r, cx = 0, cy = 0, n = 6) => { const out = [], q = [[1, 1, 0], [-1, 1, 90], [-1, -1, 180], [1, -1, 270]];
    q.forEach(([sx, sy, a0]) => { for (let i = 0; i <= n; i++) { const a = (a0 + i * 90 / n) * Math.PI / 180;
      out.push([r3(cx + sx * (w / 2 - r) + Math.cos(a) * r), r3(cy + sy * (h / 2 - r) + Math.sin(a) * r)]); } }); return out; };
  // ring between two rounded rectangles, as one outline joined by a hairline slit
  const rrRing = (w, h, r, t) => { const o = rr(w, h, r), i = rr(w - 2 * t, h - 2 * t, Math.max(1, r - t)).reverse();
    return [...o, o[0], i[i.length - 1], ...i]; };
  const zl = (pts, o = {}) => ({ type: "lathe", pts, rot: [90, 0, 0], ...o });

  const LW = 150, LH = 86, LR = 14;                         // lamp outline
  const SX = 55;                                            // lens screw positions x = +-55, y = 0
  const BOLTS = [[-30, 6, 0], [30, 6, 0], [-30, 26, 0], [30, 26, 0]];
  const BULB = [0, 10];

  // ---- lamp base / housing (ref 1, comes only with the lamp assembly) ----
  const base = { type: "group", items: [
    { type: "extrude", pts: rr(LW, LH, LR), depth: 3.4, bevel: .3, at: [0, 0, -3.7] },
    { type: "box", size: [118, 58, .6], r: .2, at: [0, 8, -4.2], mat: "chrome" },            // reflector plate
    zl([[7.6, -18], [9.6, -18], [9.6, -4.4], [7.6, -4.4]], { at: [BULB[0], BULB[1], 0] }),   // bulb socket
    zl([[0, 0], [13, 0], [13, 11], [11, 12], [0, 12]], { at: [BULB[0], BULB[1], 0] }),         // wiring boss through the brackets
    ...[-1, 1].map(s => zl([[2.5, -46], [5, -46], [5, -4], [2.5, -4]], { at: [s * SX, 0, 0] })),  // lens screw bosses
    { type: "array", pos: BOLTS, item: zl([[3, -10], [5.5, -10], [5.5, -3.7], [3, -3.7]]), mat: "brass" },  // threaded inserts
  ] };

  // ---- lens (2): one-piece moulding, ribbed upper section, licence light window in the bottom wall ----
  const ribs = []; for (let y = 2; y <= 34; y += 4) ribs.push([0, y, -60.4]);
  const lens = { type: "group", items: [
    { type: "extrude", pts: rrRing(LW, LH, LR, 2.5), depth: 50.4, bevel: .3, at: [0, 0, -56.7] },
    { type: "extrude", pts: rr(LW, LH, LR), depth: 2.4, bevel: .3, at: [0, 0, -59.7] },
    { type: "array", pos: ribs, item: { type: "box", size: [122, 1.6, .8], r: .2 }, mat: "dark" },
    ...[-1, 1].map(s => zl([[2.6, -57], [5.5, -57], [5.5, -47], [2.6, -47]], { at: [s * SX, 0, 0] })),
    { type: "cyl", r: 20, h: 1.6, axis: "y", at: [36, -44.6, -30], mat: "steel" },             // licence light window
  ] };

  const gasket3 = { type: "extrude", pts: rrRing(LW - 2, LH - 2, LR - 1, 3), depth: 1.6, bevel: .2, at: [0, 0, -5.8] };

  // ---- bulb (4): 12 V 23 W, bayonet cap in the socket, glass toward the lens ----
  const bulb = { type: "group", items: [
    zl([[0, -18], [7.4, -18], [7.4, -5], [6, -4.4], [0, -4.4]], { mat: "brass" }),
    zl([[0, -44], [6, -43], [10.5, -39], [12.8, -32], [12.6, -25], [9.5, -20.5], [6.2, -18], [0, -18]], { mat: "alu" }),
    { type: "array", pos: [[-7.6, 0, -9], [7.6, 0, -9]], item: { type: "box", size: [1.4, 2, 2], r: .2 } },
    { type: "array", pos: [[-2, 0, -32], [2, 0, -32]], item: { type: "box", size: [.6, .6, 12], r: .1 }, mat: "black" },
  ], at: [BULB[0], BULB[1], 0] };

  // ---- lens screws (5) and their rubber gaskets (6) ----
  const screw5 = { type: "array", pos: [[-SX, 0, 0], [SX, 0, 0]], item: { type: "group", items: [
    zl([[0, -65], [3.4, -65], [5, -63.8], [5, -62], [2.4, -62], [2.4, -20], [0, -20]]),
    { type: "box", size: [7, .9, 1], r: .1, at: [0, 0, -65], mat: "black" },
    { type: "box", size: [.9, 7, 1], r: .1, at: [0, 0, -65], mat: "black" },
  ] } };
  const gasket6 = { type: "array", pos: [[-SX, 0, 0], [SX, 0, 0]], item: zl([[2.5, -62], [6, -62], [6, -60], [2.5, -60]]) };

  // ---- licence plate bracket (10): flat plate, lamp on the back face, plate holes at the bottom ----
  const brk10 = { type: "extrude", depth: 2, bevel: .25, at: [0, 0, .25],
    pts: [[-62, 44], [-62, -40], [-45, -56], [-45, -126], [45, -126], [45, -56], [62, -40], [62, 44]].reverse(),
    holes: [[BULB[0], BULB[1], 16], ...BOLTS.map(b => [b[0], b[1], 3.3]), [-30, -110, 4], [30, -110, 4], [0, -82, 4]] };

  // ---- stay (11): hat section, face against bracket 10, side walls forward, flanges out to the mudguard mounts ----
  const flange = s => ({ type: "extrude", depth: 2.5, bevel: 0, rot: [90, 0, 0], at: [0, -9.5, 0],
    pts: s > 0 ? [[44.5, 5], [72, 9], [72, 33], [44.5, 37]] : [[-44.5, 37], [-72, 33], [-72, 9], [-44.5, 5]],
    holes: [[s * 60, 21, 4]] });
  const brk11 = { type: "group", items: [
    { type: "extrude", depth: 2, bevel: .25, at: [0, 0, 2.75], pts: [[-44.5, -12], [44.5, -12], [44.5, 40], [-44.5, 40]],
      holes: [[BULB[0], BULB[1], 16], ...BOLTS.map(b => [b[0], b[1], 3.3])] },
    { type: "box", size: [2.5, 52, 32], r: .4, at: [-43.25, 14, 21] },
    { type: "box", size: [2.5, 52, 32], r: .4, at: [43.25, 14, 21] },
    flange(1), flange(-1),
  ] };

  // ---- washers (7), lock washers (8), bolts (9) from the front ----
  const washer7 = { type: "array", pos: BOLTS, item: zl([[3.2, 5], [6.5, 5], [6.5, 6.6], [3.2, 6.6]]) };
  const lock8 = { type: "array", pos: BOLTS, item: { type: "ring", ro: 5.6, ri: 3.1, h: 1.6, split: true, rot: [90, 0, 0], at: [0, 0, 6.6] } };
  const bolt9 = { type: "array", pos: BOLTS, item: { type: "group", items: [
    zl([[0, -3.8], [2.9, -3.8], [2.9, 8.2], [0, 8.2]]),
    { type: "hex", af: 10, h: 4, y: 0, rot: [90, 0, 0], at: [0, 0, 8.2] },
  ] } };

  // ================= parts =================
  const P = [];
  const add = (id, ref, name, mat, stage, dir, geom, E, o = {}) => P.push({ id, ref, name, mat, stage, dir, A: [0, 0, 0], E, geom, ...o });
  const B = [0, 0, 1], F = [0, 0, -1];
  add("brk11", "11", "Licence plate bracket stay (to the mudguard)", "black", 0, B, brk11, [0, 0, 0]);
  add("brk10", "10", "Licence plate bracket", "black", 4, B, brk10, [0, 0, -36]);
  add("base", "1", "Lamp base / housing (part of the lamp assembly)", "black", 5, B, base, [0, 0, -78], { shell: true });
  add("bulb", "4", "Bulb 12 V 23 W", "chrome", 1, B, bulb, [0, 0, -140], { parent: "base" });
  add("gasket3", "3", "Lens gasket", "rubber", 2, B, gasket3, [0, 0, -200], { parent: "base", small: true });
  add("lens", "2", "Rear combination lamp lens", "alu", 2, B, lens, [0, 0, -220], { parent: "base", shell: true });
  add("gasket6", "6", "Gaskets (lens screws)", "rubber", 3, B, gasket6, [0, 0, -236], { parent: "lens", small: true, count: 2 });
  add("screw5", "5", "Lens screws", "zinc", 3, B, screw5, [0, 0, -300], { parent: "lens", small: true, count: 2 });
  add("washer7", "7", "Washers (bracket bolts)", "zinc", 6, F, washer7, [0, 0, 58], { parent: "brk11", small: true, count: 4 });
  add("lock8", "8", "Lock washers (bracket bolts)", "spring", 6, F, lock8, [0, 0, 79], { parent: "brk11", small: true, count: 4 });
  add("bolt9", "9", "Bolts (bracket and lamp)", "zinc", 6, F, bolt9, [0, 0, 110], { parent: "brk11", small: true, count: 4 });

  return {
    id: "CMS-BLCK0053", title: "Rear combination lamp", units: "mm", page: "BLCK0053",
    accuracy: "Approximate geometry. Part identity, numbering and layout follow the CMSNL rear combination lamp page and its picture. Shapes and sizes are typical of a 1970s Suzuki tail lamp, not measured from a GS750. Use the factory service manual for every dimension and torque.",
    view: { dir: [-0.85, 0.6, -1.2], up: [0, 1, 0] },
    notModelled: "Ref 1 is the complete lamp assembly; its base/housing isn't sold on its own, so it is drawn as ref 1. The wiring, the bulb socket contacts and the mudguard the stay bolts to are not drawn. How the bolts (9) join the two brackets and the lamp is read from the picture and may differ on the real bike.",
    stages: [
      { t: "Bulb", d: "Push the bulb into the socket and turn it to lock the bayonet pins." },
      { t: "Gasket and lens", d: "Lay the gasket on the lip of the base and set the lens on it." },
      { t: "Lens screws", d: "Fit the two long screws, each with its rubber gasket, through the lens into the base. Tighten them only enough to seal; the lens cracks if overdone." },
      { t: "Licence plate bracket", d: "Hold the licence plate bracket against the back of the stay on the mudguard, holes lined up." },
      { t: "Lamp onto the bracket", d: "Feed the wiring through the large hole and set the lamp base flat against the bracket." },
      { t: "Bolts from the front", d: "From the front of the stay fit the four bolts with lock washer and washer into the lamp base. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    ],
    parts: P,
  };
})();
D3_MODELS["CMS-BLCK0053"] = D3_BLCK0053;
