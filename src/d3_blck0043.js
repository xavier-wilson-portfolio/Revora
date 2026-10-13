/* ============ 3D parts model: headlamp, GS750B 1977 (CMSNL BLCK0043) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: +X = rider's LEFT, +Y up, +Z forward. The lamp axis is the Z axis; Z = 0 is the front lip of the housing.
   Layout follows the CMSNL picture: housing (17) at the back, then the mounting ring (5), the sealed beam unit (2), the
   retainer (4) and the chrome rim (3) at the front. Housing hangs from the fork brackets (not drawn) on a bolt each side
   through a rubber cushion, spacer and nut plate. The rim is held to the housing by a screw at the top and one at the bottom.
   How the ring/retainer hangs in the rim is read from the picture and is approximate: a pivot screw at the top (6, 7, 8)
   and a sprung horizontal adjusting screw on the right side (10 to 13).
   Sizes: a 7 in (178 mm) sealed beam unit is assumed; everything else is typical proportion for a 1970s Japanese
   headlamp, not measured. Geometry is APPROXIMATE. Every part is drawn in world coordinates, so A = [0, 0, 0]
   and E is the exploded offset. */
const D3_BLCK0043 = (() => {
  const r3 = v => +(+v).toFixed(3);
  // lathe profiles [r, z]: turned around Y, then rot X +90 turns local +Y into world +Z
  const zl = (pts, o = {}) => ({ type: "lathe", pts, rot: [90, 0, 0], ...o });
  // lathe along X: local +Y -> world +X (sgn 1) or world -X (sgn -1)
  const xl = (pts, sgn, at, o = {}) => ({ type: "lathe", pts, rot: [0, 0, sgn > 0 ? -90 : 90], at, ...o });
  const xhex = (af, h, y, sgn, at, hole) => ({ type: "hex", af, h, y, hole, rot: [0, 0, sgn > 0 ? -90 : 90], at });
  const polar = (a, R) => [r3(Math.cos(a * Math.PI / 180) * R), r3(Math.sin(a * Math.PI / 180) * R)];

  // ---- housing (17): deep steel shell, side pads for the mounting bolts ----
  const housing = { type: "group", items: [
    zl([[0, -112], [30, -111], [52, -107], [70, -100], [83, -90], [92, -76], [96.5, -60], [98, -42], [98, 0], [95.5, 0], [95.5, -42], [94, -59.5], [89.7, -74.5], [81, -87.6], [68.6, -97.7], [51.3, -104.6], [30, -108.5], [0, -109.5]]),
    { type: "box", size: [2, 26, 26], r: .8, at: [97.2, 0, -40] },
    { type: "box", size: [2, 26, 26], r: .8, at: [-97.2, 0, -40] },
  ] };

  // ---- rim (3): chrome front ring with a skirt that slides inside the housing lip ----
  const rim = { type: "group", items: [
    zl([[93.3, -20], [95.3, -20], [95.3, -.2], [98.5, 0], [103, 1.5], [104.5, 5], [104.5, 22], [103, 27], [98, 30], [88, 31], [85.5, 30], [85.5, 28.6],
      [96, 27.2], [102, 22], [102, 5], [100.5, 2.5], [96, 1.8], [93.3, 1.8]]),
    // top bracket for the pivot screw: ledge plus two webs to the rim wall
    { type: "box", size: [16, 1.5, 14], r: .3, at: [0, 98.75, 16], mat: "steel" },
    { type: "box", size: [3, 3.4, 12], r: .3, at: [-6.5, 100.6, 16], mat: "steel" },
    { type: "box", size: [3, 3.4, 12], r: .3, at: [6.5, 100.6, 16], mat: "steel" },
    // threaded bosses inside the skirt for the two rim screws
    { type: "box", size: [10, 2, 10], r: .4, at: [0, 92.4, -10], mat: "steel" },
    { type: "box", size: [10, 2, 10], r: .4, at: [0, -92.4, -10], mat: "steel" },
  ] };

  // ---- sealed beam unit (2): glass lens with prism pattern, reflector bowl, terminal block ----
  const lensZ = r => r < 40 ? 26 - r / 40 : r < 70 ? 25 - (r - 40) / 30 * 2.5 : 22.5 - (r - 70) / 16 * 3;
  const prisms = [];
  for (let x = -70; x <= 70; x += 10) for (let y = -66; y <= 66; y += 6) {
    const xx = x + ((Math.round(y / 6) & 1) ? 5 : 0), r = Math.hypot(xx, y); if (r > 76) continue;
    prisms.push([r3(xx), r3(y), r3(lensZ(r) + .1)]); }
  const unit = { type: "group", items: [
    zl([[0, 10], [89, 10], [89, 17.5], [86, 19.5], [70, 22.5], [40, 25], [0, 26]], { mat: "alu" }),
    zl([[0, -57], [20, -56], [30, -50], [48, -34], [66, -14], [80, 4], [86, 9], [89, 10], [0, 10]]),
    { type: "array", pos: prisms, item: { type: "box", size: [8.6, 4.8, .5], r: .2 }, mat: "chrome" },
    { type: "box", size: [30, 16, 10], r: 2, at: [0, 0, -61], mat: "black" },
    { type: "array", pos: [[-9, 3, -70], [9, 3, -70], [0, -4, -70]], item: { type: "box", size: [6, 1, 9], r: .2 }, mat: "brass" },
  ] };

  // ---- mounting ring (5): cup behind the unit, tabs for the retainer screws ----
  const SA = [330, 210];                                   // angles of the two retainer screws (9)
  const ring5 = { type: "group", items: [
    zl([[84, 7], [90, 7], [90, -2.6], [76, -13.5], [60, -29.5], [62, -31], [78, -15], [92, -4], [92, 9], [84, 9]]),
    ...SA.map(a => ({ type: "box", size: [10, 9, 2], r: .4, rot: [0, 0, a], at: [...polar(a, 95.5), 8] })),
  ] };

  // ---- retainer (4): front ring over the unit edge, top pivot tab and right-side adjuster tab ----
  const retainer = { type: "group", items: [
    zl([[89.3, 9.5], [90.8, 9.5], [90.8, 18.6], [88, 20.4], [86.6, 20], [89.3, 17.7]]),
    ...SA.map(a => ({ type: "box", size: [10, 9, 1.5], r: .3, rot: [0, 0, a], at: [...polar(a, 95.5), 10.75] })),
    { type: "box", size: [12, 1.5, 11], r: .3, at: [0, 94.75, 15.5] },        // top tab
    { type: "box", size: [12, 4.4, 1.5], r: .3, at: [0, 92.6, 10.75] },       // its leg down to the band
    { type: "box", size: [1.5, 12, 11], r: .3, at: [-95.25, 0, 15.5] },       // right-side tab
    { type: "box", size: [4.8, 12, 1.5], r: .3, at: [-92.9, 0, 10.75] },      // its leg in to the band
  ] };

  // ---- retainer screws (9): pan screws from the front through the retainer tab into the ring tab ----
  const screw9 = { type: "group", items: SA.map(a => ({ type: "group", items: [
    zl([[0, 3.5], [1.9, 3.5], [1.9, 11.5], [3.5, 11.5], [3.5, 13], [2.5, 14], [0, 14]]),
    { type: "box", size: [6, .9, 1], r: .1, at: [0, 0, 13.8], mat: "black" },
  ], at: [...polar(a, 95.5), 0] })) };

  // ---- top pivot: screw 6 down through the rim ledge, spacer 7, retainer tab, adjusting nut 8 underneath ----
  const PZ = 16;
  const screw6 = { type: "group", items: [
    { type: "lathe", pts: [[0, 90.9], [2.4, 90.9], [2.4, 99.5], [4, 99.5], [4, 100.8], [3, 101.5], [0, 101.5]] },
    { type: "box", size: [6.5, .8, .9], r: .1, at: [0, 101.4, 0], mat: "black" },
  ], at: [0, 0, PZ] };
  const spacer7 = { type: "ring", ro: 4.5, ri: 2.6, h: 2.5, at: [0, 95.5, PZ] };
  const nut8 = { type: "hex", af: 8, h: 3, y: 90.95, hole: 2.4, at: [0, 0, PZ] };

  // ---- side adjuster (rider's right, -X): screw 10 in through the rim wall, spring 13, retainer tab, washer 12, nut 11 ----
  const screw10 = { type: "group", items: [
    xl([[0, 90.9], [2, 90.9], [2, 104.5], [4.2, 104.5], [4.2, 106], [3.2, 107], [0, 107]], -1, [0, 0, 0]),
    { type: "box", size: [.9, 7, .9], r: .1, at: [-106.9, 0, 0], mat: "black" },
  ], at: [0, 0, PZ] };
  const spring13 = { type: "spring", R: 3.4, wire: .8, h: 6, turns: 4.5, rot: [0, 0, 90], at: [-96, 0, PZ] };
  const washer12 = xl([[2.1, 0], [4.5, 0], [4.5, 1], [2.1, 1]], -1, [-93.5, 0, PZ]);
  const nut11 = xhex(7, 2.6, 0, -1, [-90.9, 0, PZ], 2);

  // ---- rim screws (14) with lock washer (15) and washer (16), radial at the top and bottom, Z = -10 ----
  const vstack = (sgn, items) => ({ type: "group", items, rot: sgn > 0 ? [0, 0, 0] : [180, 0, 0], at: [0, 0, -10] });
  const screw14 = s => vstack(s, [
    { type: "lathe", pts: [[0, 92], [2.4, 92], [2.4, 100.2], [4.5, 100.2], [4.5, 101.8], [3.4, 103.5], [0, 103.5]] },
    { type: "box", size: [1, .8, 7], r: .1, at: [0, 103.4, 0], mat: "black" },
    { type: "box", size: [7, .8, 1], r: .1, at: [0, 103.4, 0], mat: "black" },
  ]);
  const lock15 = s => vstack(s, [{ type: "ring", ro: 4.3, ri: 2.6, h: 1.2, split: true, at: [0, 99, 0] }]);
  const washer16 = s => vstack(s, [{ type: "ring", ro: 5.5, ri: 2.6, h: 1, at: [0, 98, 0] }]);

  // ---- side mounting (each side, X = +-): nut plate 23 inside, cushion 22 in the wall, spacer 21, (fork bracket, not drawn),
  //      washer 19, lock washer 20, bolt 18 ----
  const plate23 = s => ({ type: "group", items: [
    { type: "box", size: [2, 22, 22], r: .5, at: [s * 92.2, 0, -40] },
    xhex(12, 6, 0, s, [s * 85.2, 0, -40], 4),
  ] });
  const cushion22 = s => xl([[6, 0], [9, 0], [9, 2], [7, 2], [7, 4.5], [9, 4.5], [9, 6.5], [6, 6.5]], s, [s * 93.2, 0, -40]);
  const spacer21 = s => xl([[4.4, 0], [6, 0], [6, 7], [4.4, 7]], s, [s * 93.2, 0, -40]);
  const washer19 = s => xl([[4.25, 0], [8, 0], [8, 1.6], [4.25, 1.6]], s, [s * 103.2, 0, -40]);
  const lock20 = s => ({ type: "ring", ro: 7, ri: 4.2, h: 2, split: true, rot: [0, 0, s > 0 ? -90 : 90], at: [s * 104.8, 0, -40] });
  const bolt18 = s => ({ type: "group", items: [
    xl([[0, 0], [3.9, 0], [3.9, 20.8], [3.4, 21.3], [0, 21.3]], s, [s * 85.5, 0, -40]),
    xhex(12, 5.5, 0, s, [s * 106.8, 0, -40]),
  ] });

  // ================= parts =================
  const P = [];
  const add = (id, ref, name, mat, stage, dir, geom, E, o = {}) => P.push({ id, ref, name, mat, stage, dir, A: [0, 0, 0], E, geom, ...o });
  const side = [[1, "L", "left"], [-1, "R", "right"]];
  add("housing", "17", "Headlamp housing (black)", "black", 0, [0, 0, -1], housing, [0, 0, 0], { shell: true });
  side.forEach(([s, k, w]) => {
    add("plate" + k, "23", `Nut plate, housing (${w})`, "steel", 1, [-s, 0, 0], plate23(s), [s * 30, 0, 0], { parent: "housing", small: true });
    add("cush" + k, "22", `Cushion (${w} mounting)`, "rubber", 1, [-s, 0, 0], cushion22(s), [s * 42, 0, 0], { parent: "housing", small: true });
    add("spac" + k, "21", `Spacer 8.8 x 12 x 7 (${w} mounting)`, "zinc", 1, [-s, 0, 0], spacer21(s), [s * 58, 0, 0], { parent: "housing", small: true });
    add("wash" + k, "19", `Washer 8 mm (${w} mounting)`, "zinc", 2, [-s, 0, 0], washer19(s), [s * 68, 0, 0], { parent: "housing", small: true });
    add("lockw" + k, "20", `Lock washer (${w} mounting)`, "spring", 2, [-s, 0, 0], lock20(s), [s * 80, 0, 0], { parent: "housing", small: true });
    add("bolt" + k, "18", `Bolt (${w} mounting)`, "zinc", 2, [-s, 0, 0], bolt18(s), [s * 116, 0, 0], { parent: "housing", small: true });
  });
  const RZ = 360;                                        // rim exploded forward
  add("ring5", "5", "Headlamp unit ring (mounting ring)", "black", 5, [0, 0, 1], ring5, [0, 0, 70], { parent: "rim" });
  add("unit", "2", "Lamp unit (sealed beam)", "chrome", 3, [0, 0, -1], unit, [0, 0, 190], { parent: "ring5" });
  add("retainer", "4", "Retainer", "steel", 4, [0, 0, -1], retainer, [0, 0, 245], { parent: "ring5" });
  add("screw9", "9", "Screws (retainer to ring)", "zinc", 4, [0, 0, -1], screw9, [0, 0, 290], { parent: "retainer", small: true, count: 2 });
  add("rim", "3", "Rim", "chrome", 7, [0, 0, -1], rim, [0, 0, RZ]);
  add("nut8", "8", "Adjusting nut (top pivot)", "zinc", 5, [0, -1, 0], nut8, [0, 25, RZ], { parent: "rim", small: true });
  add("spacer7", "7", "Spacer (top pivot)", "zinc", 5, [0, -1, 0], spacer7, [0, 36, RZ], { parent: "rim", small: true });
  add("screw6", "6", "Screw (top pivot)", "zinc", 5, [0, -1, 0], screw6, [0, 60, RZ], { parent: "rim", small: true });
  add("nut11", "11", "Nut (adjusting screw)", "zinc", 6, [1, 0, 0], nut11, [-25, 0, RZ], { parent: "rim", small: true });
  add("washer12", "12", "Washer (adjusting screw)", "zinc", 6, [1, 0, 0], washer12, [-36, 0, RZ], { parent: "rim", small: true });
  add("spring13", "13", "Headlamp adjusting spring", "spring", 6, [1, 0, 0], spring13, [-47, 0, RZ], { parent: "rim", small: true });
  add("screw10", "10", "Headlamp adjusting screw", "zinc", 6, [1, 0, 0], screw10, [-72, 0, RZ], { parent: "rim", small: true });
  [[1, "T", "top"], [-1, "B", "bottom"]].forEach(([s, k, w]) => {
    add("wash16" + k, "16", `Washer (${w} rim screw)`, "zinc", 8, [0, -s, 0], washer16(s), [0, s * 25, 0], { parent: "housing", small: true });
    add("lock15" + k, "15", `Lock washer (${w} rim screw)`, "spring", 8, [0, -s, 0], lock15(s), [0, s * 38, 0], { parent: "housing", small: true });
    add("screw14" + k, "14", `Screw (${w}, rim to housing)`, "zinc", 8, [0, -s, 0], screw14(s), [0, s * 62, 0], { parent: "housing", small: true });
  });

  return {
    id: "CMS-BLCK0043", title: "Headlamp", units: "mm", page: "BLCK0043",
    accuracy: "Approximate geometry. Part identity, numbering and layout follow the CMSNL headlamp page and its picture. Sizes assume a 7 inch sealed beam unit; everything else is typical proportion for a 1970s Japanese headlamp, not measured from a GS750. Use the factory service manual for every dimension, torque and aiming figure.",
    view: { dir: [0.95, 0.55, 1.15], up: [0, 1, 0] },
    notModelled: "Ref 1 is the complete headlamp assembly, not a separate part. The fork headlamp brackets that sit between the spacer (21) and washer (19) on each side belong to another page and are not drawn, so a small gap is left there. Wiring and the bulb socket plug are not drawn. The exact way the ring and retainer hang in the rim (top pivot 6-8, side adjuster 10-13) is read from the picture and may differ in detail on the real lamp.",
    stages: [
      { t: "Cushions, spacers and nut plates", d: "Push a rubber cushion into the mounting hole on each side of the housing, slide a spacer through it and hold the nut plate behind it on the inside." },
      { t: "Housing onto the fork brackets", d: "Hang the housing between the headlamp brackets and fit a bolt, lock washer and washer on each side into the nut plates. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Lamp unit into the ring", d: "Set the sealed beam unit into the mounting ring with the lens facing forward and the top mark at the top." },
      { t: "Retainer and screws", d: "Fit the retainer over the edge of the lens and screw it to the ring with the two screws. Snug them evenly so the lens isn't stressed." },
      { t: "Ring into the rim, top pivot", d: "Put the ring and unit into the rim from behind. Fit the top screw down through the rim bracket, the spacer and the retainer tab into the adjusting nut." },
      { t: "Side adjusting screw", d: "Run the adjusting screw in through the side of the rim, through the spring and the retainer tab, then the washer and nut." },
      { t: "Rim onto the housing", d: "Plug in the lamp unit, tuck the wiring into the housing and push the rim skirt into the front of the housing." },
      { t: "Rim screws and aiming", d: "Fit the top and bottom screws with washer and lock washer. Aim the beam with the adjusting screw and by turning the housing on its bolts. Aiming figures: VERIFY IN FACTORY SERVICE MANUAL." },
    ],
    parts: P,
  };
})();
D3_MODELS["CMS-BLCK0043"] = D3_BLCK0043;
