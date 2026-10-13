/* ============ 3D parts model: rear wheel, GS750EC, cast (CMSNL BLCK0059)
   Built from the GS750B spoked wheel model (d3_blck0058.js): same axle stack, drum, sprocket, disc, bracket and adjusters,
   with a one-piece cast wheel in place of the hub, spokes and rim, and no hub cover, rim band or cush plate. ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: origin on the rear axle at the wheel's centre plane. +X = rider's LEFT (sprocket side), +Y up, +Z forward.
   Every part's geometry is laid out in world coordinates, so every A is [0, 0, 0] and E is the exploded offset.
   Ties to the swing arm model (d3_blck0057.js, which uses +X = rider's right): its axle slots sit about Z = -520 from the
   pivot, the arm walls run 95..125 mm either side of the centre line and the torque link's rear eye is 50 mm ahead of and
   62 mm below the axle on the right side. The same numbers are used here (right side = -X).
   Axle stack, from the left (sprocket side): axle head, chain adjuster 18, swing arm (not drawn), spacer 8, sprocket drum 12
   with its bearing and oil seal, spacer 5, left wheel bearing, long spacer 4, right wheel bearing, spacer 7, caliper bracket 16,
   spacer 17, swing arm, chain adjuster 18, washer 11, nut 9 and cotter pin 10.
   Layout and which part fits where follow the CMSNL picture. Real figures used: bearing sizes read from the part numbers
   (6204 = 20 x 47 x 14 in the hub, 6305 = 25 x 62 x 17 in the drum), oil seal 33 x 62 x 7, spacers 20 x 33 x 28.3 and
   20 x 38 x 12, washer 19 x 34 x 4, 18 mm axle nut, disc bolts 8 x 30 (all catalogue descriptions), 4.00-18 tyre on an
   18 in rim. Everything else is a typical 1970s 750 proportion, not measured from a GS750. */
const D3_BLCK0059 = (() => {
  const r2 = v => Math.round(v * 100) / 100, rad = d => d * Math.PI / 180;
  // lathe-type item turned around the axle: its local Y becomes world X, then shifted by x0
  const ax = (x0, ...items) => ({ type: "group", rot: [0, 0, -90], at: [x0, 0, 0], items });
  // flat outline in the side view as [z, y] points, extruded across X from x0 by w
  const side = (pts, w, x0, holes, extra) => ({ type: "extrude", pts: pts.map(([z, y]) => [r2(-z), r2(y)]), holes: (holes || []).map(([z, y, r]) => [r2(-z), r2(y), r]),
    depth: w, bevel: .6, rot: [0, 90, 0], at: [x0, 0, 0], ...(extra || {}) });
  const arc = (cz, cy, r, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, k) => { const a = rad(a0 + (a1 - a0) * k / n); return [cz + r * Math.cos(a), cy + r * Math.sin(a)]; });
  const circ = (r, n = 72) => arc(0, 0, r, 0, 360 - 360 / n, n - 1);
  // annular sector (for the cush rubbers and the drum's drive dogs), axial from x0 to x0 + h
  const sector = (r1, r2_, a0, a1, h, x0) => side([...arc(0, 0, r2_, a0, a1, 10), ...arc(0, 0, r1, a1, a0, 10)], h, x0, [], { bevel: .5 });
  // points on a circle round the axle at radius r, in the local frame used inside ax() (local x -> world -y, z -> z)
  const ring6 = (r, off) => [0, 60, 120, 180, 240, 300].map(a => [r2(r * Math.cos(rad(a + off))), 0, r2(r * Math.sin(rad(a + off)))]);
  // the same angles as world [y, z] for things drawn with side()
  const yz = (r, a) => [r2(-r * Math.cos(rad(a))), r2(r * Math.sin(rad(a)))]; // [y, z]; matches ring6 after the ax() turn (world y = -local x, z = local z)
  const bearing = (x0, w, ri, ro) => ax(x0,
    { type: "ring", ri, ro: ri + (ro - ri) * .28, h: w },
    { type: "ring", ri: ro - (ro - ri) * .28, ro, h: w },
    { type: "ring", ri: ri + (ro - ri) * .27, ro: ro - (ro - ri) * .27, h: w - 1.2, at: [0, .6, 0], mat: "black" });

  // ---- hub centre of the cast wheel (ref 1): disc boss on the right, cush drive cavity on the left ----
  const hub = ax(0, { type: "lathe", pts: [[23.5, -60], [75, -60], [75, -40], [82, -40], [82, -34], [60, -28], [55, 0], [60, 18], [88, 22], [88, 40], [70, 40], [70, 14],
    [30, 14], [30, 40], [23.5, 40], [23.5, 26], [17, 26], [17, -46], [23.5, -46]] });

  // ---- cast spokes: five twin-leg spokes; each pair of legs starts together at the hub and splits toward the rim ----
  const leg = (a0, a1) => { const w0 = 9 / 58 * 180 / Math.PI, w1 = 8 / 216 * 180 / Math.PI; // angular half-widths at the hub and rim ends
    return side([...arc(0, 0, 58, a0 - w0, a0 + w0, 3), ...arc(0, 0, 219, a1 + w1, a1 - w1, 3)], 18, -9, [], { bevel: 2 }); };
  const castSpokes = [0, 72, 144, 216, 288].flatMap(a => [leg(a, a - 11), leg(a, a + 11)]);
  const lerp = (a, b, t) => a.map((v, i) => r2(v + (b[i] - v) * t));
  // clip-on balance weight on the rim's centre rib (underside), at angle a
  const weight = a => ({ type: "box", size: [16, 7, 22], r: 2, rot: [a, 0, 0], at: [0, r2(209 * Math.cos(rad(a))), r2(209 * Math.sin(rad(a)))] });

  // ---- cast rim (part of ref 1), tube (31), tyre (30) ----
  const rim = ax(0, { type: "lathe", pts: [[216, -29], [236, -32], [241, -31], [231, -26], [230, -7], [224, -3], [224, 3], [230, 7], [231, 26], [241, 31], [236, 32], [216, 29], [212, 8], [204, 8], [204, -8], [212, -8]] });
  const wheel = { type: "group", items: [hub, rim, ...castSpokes] };
  const tyreProfile = [[229, -27], [236, -40], [252, -52], [275, -57], [300, -53], [318, -43], [328, -27], [333, -9], [333, 9], [328, 27], [318, 43], [300, 53], [275, 57], [252, 52], [236, 40], [229, 27],
    [234, 24], [241, 35], [255, 46], [275, 50], [297, 46], [312, 37], [321, 24], [326, 8], [326, -8], [321, -24], [312, -37], [297, -46], [275, -50], [255, -46], [241, -35], [234, -24]];
  // shallow tread blocks in two staggered rows (block pattern, about 2 mm proud of the crown)
  const treadBlocks = []; for (let k = 0; k < 72; k++) { const a = k * 5, x = k % 2 ? 13 : -13;
    treadBlocks.push({ type: "box", size: [22, 4, 11], r: 1.2, rot: [a, 0, 0], at: [x, r2(333 * Math.cos(rad(a))), r2(333 * Math.sin(rad(a)))] }); }
  const tyre = { type: "group", items: [ax(0, { type: "lathe", pts: tyreProfile }), ...treadBlocks] };
  const tube = { type: "group", items: [ax(0, { type: "torus", R: 281, r: 40 }), { type: "cyl", r: 4, h: 44, axis: "y", at: [0, 200, 0], mat: "brass" }, { type: "cyl", r: 6, h: 8, axis: "y", at: [0, 236, 0] }] };

  // ---- right side: disc 23, bolts 24 with lock plates 25 ----
  // extrude in the XY plane, depth along +Z, turned so +Z -> +X: local x -> world -z, local y -> world y
  const discPts = circ(137, 96).map(([c, s]) => [r2(c), r2(s)]);
  const disc = { type: "extrude", pts: discPts, holes: [[0, 0, 55], ...[0, 60, 120, 180, 240, 300].map(a => { const [y, z] = yz(68, a); return [-z, y, 4.4]; }),
    ...[0, 60, 120, 180, 240, 300].map(a => { const [y, z] = yz(97, a + 30); return [-z, y, 12]; })], depth: 6, bevel: .4, rot: [0, 90, 0], at: [-66, 0, 0] };
  // a two-hole lock plate (tab washer) spanning bolts at angles a and a + 60 on radius R, from x0 to x0 + t
  const lockPlate = (R, a, x0, t, holeR) => { const [y1, z1] = yz(R, a), [y2, z2] = yz(R, a + 60), dz = z2 - z1, dy = y2 - y1, ang = Math.atan2(dy, dz) * 180 / Math.PI;
    return side([...arc(z1, y1, 8.5, ang + 90, ang + 270, 10), ...arc(z2, y2, 8.5, ang - 90, ang + 90, 10)], t, x0, [[z1, y1, holeR], [z2, y2, holeR]], { bevel: .3 }); };
  const discBolt = { type: "group", items: [{ type: "hex", af: 12, h: 6, y: -6 }, { type: "lathe", pts: [[0, 0], [4, 0], [4, 31], [3.4, 32], [0, 32]] }] };

  // ---- left side: cush rubbers 15, drum 12, sprocket 26, bolts 27, nuts 28, lock plates 29 ----
  const rubbers = { type: "group", items: [0, 60, 120, 180, 240, 300].map(a => sector(38, 68, a - 21, a + 21, 26, 14)) };
  const drum = { type: "group", items: [
    ax(0, { type: "lathe", pts: [[14, 44], [66, 44], [66, 50], [88, 50], [88, 58], [38, 58], [38, 73.7], [31, 73.7], [31, 49.7], [14, 49.7]] }),
    ...[0, 60, 120, 180, 240, 300].map(a => sector(41, 64, a + 30 - 8, a + 30 + 8, 26.5, 18)) ] };
  const sprBolt = { type: "group", items: [{ type: "hex", af: 14, h: 6, y: 44 }, { type: "lathe", pts: [[0, 50], [5, 50], [5, 75], [4.3, 76], [0, 76]] }] };
  const screw = { type: "group", items: [{ type: "lathe", pts: [[0, 43.5], [5, 43.5], [5, 46.5], [3.5, 48], [0, 48]] }, { type: "lathe", pts: [[0, 32], [2.5, 32], [2.5, 43.6], [0, 43.6]] },
    { type: "box", size: [7, 1, 1.2], r: .2, at: [0, 48, 0], mat: "black" }, { type: "box", size: [1.2, 1, 7], r: .2, at: [0, 48, 0], mat: "black" }] };

  // ---- axle hardware ----
  const castle = { type: "group", items: [{ type: "lathe", pts: [[9, 0], [12.5, 0], [12.5, 6], [9, 6]] }, { type: "hex", af: 27, h: 10, y: 6, hole: 9 },
    ...[0, 60, 120].map(a => ({ type: "box", size: [27, 4.5, 2.6], r: .2, rot: [0, a, 0], at: [0, 2.5, 0], mat: "black" }))] };
  const cotter = { type: "group", at: [-148, 0, 0], items: [
    { type: "tube", pts: [[0, 13, -.9], [0, -11, -.9], [0, -14, -3], [0, -16, -8]], r: .9 },
    { type: "tube", pts: [[.9, 13, .9], [0, -11, .9], [0, -14, 3], [0, -16, 8]], r: .9 },
    { type: "torus", R: 2.4, r: .9, rot: [0, 0, 90], at: [0, 15.5, 0] } ] };

  // ---- chain adjuster set, one per side (s = 1 left, -1 right); slot in the swing arm end runs to Z = -35 ----
  const adjuster = s => ({ type: "group", items: [
    side([...arc(0, 0, 22, -90, 90, 14), [-27, 22], [-27, -22]], 6, s > 0 ? 125 : -131, [[0, 0, 10.2]]),
    { type: "box", size: [30, 17, 11], r: 1, at: [s * 110, 0, -16.5] } ] });
  const supporter = s => ({ type: "group", items: [{ type: "box", size: [30, 17, 9], r: 1, at: [s * 110, 0, -30.5] }, { type: "box", size: [30, 44, 10], r: 2, at: [s * 110, 0, -40] }] });
  const bolt25 = s => ({ type: "group", at: [s * 102, 0, -30], items: [{ type: "hex", af: 12, h: 6, y: 22 }, { type: "lathe", pts: [[0, -22], [4, -22], [4, 22.2], [0, 22.2]] }] });
  const bolt22 = s => ({ type: "group", rot: [90, 0, 0], at: [s * 116, 0, 0], items: [{ type: "hex", af: 12, h: 7, y: -60 }, { type: "lathe", pts: [[0, -53.2], [4, -53.2], [4, -11], [0, -11]] }] });
  const nut23 = s => ({ type: "group", rot: [90, 0, 0], at: [s * 116, 0, 0], items: [{ type: "hex", af: 12, h: 7.5, y: -53, hole: 4 }] });

  // ---- caliper bracket (16), right side; ears for the caliper (other page) below and behind the axle ----
  const C1 = [-55, -122], C2 = [-110, -84], TT = [40, -38], LK = [50, -62];
  const brPts = [...arc(0, 0, 24, 40, 200, 12), ...arc(C2[0], C2[1], 13, 120, 300, 10), ...arc(C1[0], C1[1], 13, 200, 340, 10), ...arc(TT[0], TT[1], 12, 250, 450, 12)];
  const lkAng = Math.atan2(LK[1] - TT[1], LK[0] - TT[0]) * 180 / Math.PI;
  const bracket = { type: "group", items: [
    side(brPts, 8, -83, [[0, 0, 10.2], [C1[0], C1[1], 5.2], [C2[0], C2[1], 5.2]]),
    { type: "box", size: [30, 16, 18], r: 2, at: [-97.5, TT[1], TT[0]] },
    side([...arc(TT[0], TT[1], 11, lkAng + 90, lkAng + 270, 10), ...arc(LK[0], LK[1], 12, lkAng - 90, lkAng + 90, 10)], 8, -120, [[LK[0], LK[1], 5.2]]) ] };

  // ---- exploded layout: parts on the axle line are spaced out along X in fitting order, gap G ----
  const G = 16, E = {};
  const lineOut = (start, list, sgn) => { let cur = start; list.forEach(([id, a, b]) => { const dx = sgn < 0 ? (cur - G) - b : (cur + G) - a; E[id] = [r2(dx), 0, 0]; cur = sgn < 0 ? a + dx : b + dx; }); };
  lineOut(-60, [["brg2", -60, -46], ["sp4", -46, 26], ["disc", -66, -60], ["lock29", -68, -66], ["bolt28", -74, -36], ["sp7", -75, -60],
    ["bracket", -120, -75], ["sp26", -95, -83], ["adjR", -131, -95], ["washer11", -135, -131], ["nut9", -151, -135], ["cotter", -150, -146]], -1);
  lineOut(40, [["brg3", 26, 40], ["rubber", 14, 40], ["bolt31", 44, 76], ["sp5", 40, 66.7], ["drum", 18, 73.7],
    ["brg14", 49.7, 66.7], ["seal", 66.7, 73.7], ["sprocket", 58, 64], ["lock33", 64, 66], ["nut32", 66, 74], ["sp8", 66.7, 95], ["adjL", 95, 131], ["axle", -158, 143]], 1);
  E.cotter = [E.cotter[0], 40, 0];
  ["L", "R"].forEach(k => { const dx = E["adj" + k][0]; E["sup" + k] = [dx, 0, -50]; E["b25" + k] = [dx, 90, 0]; E["n23" + k] = [dx, 0, -90]; E["b22" + k] = [dx, 0, -150]; });
  const WZ = -720; // the tube and tyre are drawn behind the axle line
  Object.assign(E, { tube: [-60, 0, WZ], tyre: [-220, 0, WZ], bal32: [0, -150, 0], bal33: [0, 150, 0] });
  const Z = [0, 0, 0], P = (id, o) => ({ id, A: Z, E: E[id], parent: "wheel", ...o });
  const sideSet = (k, s) => [
    P("sup" + k, { ref: "21", name: `Chain adjuster supporter (${s > 0 ? "left" : "right"})`, mat: "zinc", stage: 10, dir: [0, 0, 1], geom: supporter(s) }),
    P("b25" + k, { ref: "22", name: `Supporter bolt 8 x 40 (${s > 0 ? "left" : "right"})`, mat: "zinc", small: true, stage: 10, dir: [0, -1, 0], geom: bolt25(s) }),
    P("n23" + k, { ref: "20", name: `Adjuster lock nut (${s > 0 ? "left" : "right"})`, mat: "zinc", small: true, stage: 10, dir: [0, 0, 1], geom: nut23(s) }),
    P("b22" + k, { ref: "19", name: `Chain adjuster bolt (${s > 0 ? "left" : "right"})`, mat: "zinc", small: true, stage: 10, dir: [0, 0, 1], geom: bolt22(s) }),
    P("adj" + k, { ref: "18", name: `Chain adjuster (${s > 0 ? "left" : "right"})`, mat: "zinc", stage: 11, dir: [-s, 0, 0], geom: adjuster(s) }) ];

  return {
    id: "CMS-BLCK0059", title: "Rear wheel (GS750EC, cast)", units: "mm", page: "BLCK0059",
    accuracy: "Approximate geometry. Part identity, numbering and the layout follow the CMSNL rear wheel page for the GS750EC and its picture. Bearing, seal, spacer, washer, nut and bolt sizes come from the catalogue descriptions and part numbers; the tyre is drawn as a 4.00-18 on an 18 in rim. The cast wheel's spoke shape, hub, drum, disc, sprocket, bracket and adjuster shapes and every other size are typical late-1970s 750 proportions, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [1.1, .62, 1.0], up: [0, 1, 0] },
    notModelled: "Every ref is drawn. Refs with -1/-2 numbers are earlier and later part numbers for the same part, so one of each is shown. The chain adjuster set (refs 18 to 22) is drawn on both sides. The swing arm, torque link, rear caliper and chain are on other pages and aren't drawn. How the adjuster bolt, lock nut and supporter work together is a best reading of the picture. The cast spokes are drawn as five twin-leg spokes after the picture; count and section are approximate. Where the two balance weights sit on the rim is arbitrary (they go wherever the wheel needs them).",
    stages: [
      { t: "Tube and tyre", d: "Put the tube in the tyre and fit the tyre to the rim with the valve through its hole. Pressure: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Balance", d: "Spin the wheel and clip the balance weights onto the rim's centre rib at the light spot." },
      { t: "Wheel bearings", d: "Press the right bearing into the hub, drop the long spacer in from the left and press the left bearing in until it meets the spacer. Push on the outer race only." },
      { t: "Brake disc", d: "Fit the disc to the right side of the hub with the bolts and lock plates. Thread locker and torque: VERIFY IN FACTORY SERVICE MANUAL. Bend the tabs up against the bolt heads." },
      { t: "Cush drive rubbers", d: "Push the shock absorber rubbers into the cavity in the left side of the hub." },
      { t: "Drum bearing and seal", d: "Press the bearing into the sprocket drum, then the oil seal, lip facing in. Grease the lip." },
      { t: "Sprocket", d: "Put the bolts through the drum from the inside, fit the sprocket, the lock plates and the nuts. Torque: VERIFY IN FACTORY SERVICE MANUAL. Bend the tabs against the nuts." },
      { t: "Drum into the hub", d: "Slide the short spacer into the hub bearing and push the sprocket drum onto the hub so the drive dogs go between the rubbers." },
      { t: "Axle spacers and caliper bracket", d: "Fit spacer 7 against the right bearing, then the caliper bracket over the disc and spacer 17. Fit the long spacer 8 into the drum seal on the left." },
      { t: "Adjuster supporters", d: "Push a supporter into the end of each swing arm slot and bolt it in. Run the adjuster bolt and lock nut through the supporter." },
      { t: "Wheel into the swing arm", d: "Put the chain on the sprocket, lift the wheel into the swing arm with the adjusters on the arm ends and push the axle through from the left." },
      { t: "Axle nut", d: "Set chain slack with the adjuster bolts, then fit the washer and the axle nut. Chain slack and torque: VERIFY IN FACTORY SERVICE MANUAL. Line up a slot and fit a new cotter pin. Bolt the torque link to the bracket (swing arm page)." },
    ],
    parts: [
      { id: "wheel", ref: "1", name: "Rear wheel (cast, one piece)", mat: "alu", shell: true, stage: 0, A: Z, E: Z, dir: [0, 0, 1], geom: wheel },
      P("tube", { ref: "31", name: "Inner tube", mat: "rubber", stage: 1, dir: [0, 0, 1], geom: tube }),
      P("tyre", { ref: "30", name: "Tyre, 4.00-18", mat: "rubber", shell: true, stage: 1, dir: [0, 0, 1], geom: tyre }),
      P("bal32", { ref: "32", name: "Balance weight", mat: "dark", small: true, stage: 2, dir: [0, 1, 0], geom: weight(180) }),
      P("bal33", { ref: "33", name: "Balance weight (second size)", mat: "dark", small: true, stage: 2, dir: [0, -1, 0], geom: weight(0) }),
      P("brg2", { ref: "2", name: "Bearing, right (6204, 20 x 47 x 14)", mat: "steel", stage: 3, dir: [1, 0, 0], geom: bearing(-60, 14, 10, 23.5) }),
      P("sp4", { ref: "4", name: "Hub bearing spacer (long)", mat: "steel", stage: 3, dir: [1, 0, 0], geom: ax(-46, { type: "ring", ri: 10, ro: 13, h: 72 }) }),
      P("brg3", { ref: "3", name: "Bearing, left (6204)", mat: "steel", stage: 3, dir: [-1, 0, 0], geom: bearing(26, 14, 10, 23.5) }),
      P("disc", { ref: "23", name: "Brake disc", mat: "steel", stage: 4, dir: [1, 0, 0], geom: disc }),
      P("lock29", { ref: "25", name: "Lock plates (disc bolts)", mat: "zinc", small: true, parent: "disc", stage: 4, count: 3, dir: [1, 0, 0],
        geom: { type: "group", items: [0, 120, 240].map(a => lockPlate(68, a, -68, 1.6, 4.3)) } }),
      P("bolt28", { ref: "24", name: "Disc bolts 8 x 30", mat: "zinc", small: true, parent: "disc", stage: 4, count: 6, dir: [1, 0, 0],
        geom: ax(-68, { type: "array", pos: ring6(68, 0), item: discBolt }) }),
      P("rubber", { ref: "15", name: "Rear hub shock absorber (cush rubbers)", mat: "rubber", stage: 5, dir: [-1, 0, 0], geom: rubbers }),
      P("brg14", { ref: "13", name: "Bearing, sprocket drum (6305)", mat: "steel", parent: "drum", stage: 6, dir: [-1, 0, 0], geom: bearing(49.7, 17, 12.5, 31) }),
      P("seal", { ref: "14", name: "Oil seal 33 x 62 x 7", mat: "rubber", small: true, parent: "drum", stage: 6, dir: [-1, 0, 0],
        geom: ax(66.7, { type: "lathe", pts: [[16.5, 1.5], [19, 0], [31, 0], [31, 7], [21, 7], [16.5, 5], [18, 3]] }) }),
      P("bolt31", { ref: "27", name: "Sprocket bolts", mat: "zinc", small: true, parent: "drum", stage: 7, count: 6, dir: [1, 0, 0], geom: ax(0, { type: "array", pos: ring6(75, 0), item: sprBolt }) }),
      P("sprocket", { ref: "26", name: "Rear sprocket", mat: "steel", parent: "drum", stage: 7, dir: [-1, 0, 0],
        geom: ax(58, { type: "gear", r: 116, teeth: 45, toothH: 7.5, h: 6, bore: 40, holes: [...[0, 60, 120, 180, 240, 300].map(a => [r2(75 * Math.cos(rad(a))), r2(-75 * Math.sin(rad(a))), 5.3]),
          ...[30, 90, 150, 210, 270, 330].map(a => [r2(94 * Math.cos(rad(a))), r2(-94 * Math.sin(rad(a))), 11])] }) }),
      P("lock33", { ref: "29", name: "Lock plates (sprocket nuts)", mat: "zinc", small: true, parent: "sprocket", stage: 7, count: 3, dir: [-1, 0, 0],
        geom: { type: "group", items: [0, 120, 240].map(a => lockPlate(75, a, 64, 1.6, 5.2)) } }),
      P("nut32", { ref: "28", name: "Sprocket nuts", mat: "zinc", small: true, parent: "sprocket", stage: 7, count: 6, dir: [-1, 0, 0],
        geom: ax(0, { type: "array", pos: ring6(75, 0), item: { type: "hex", af: 14, h: 8, y: 65.6, hole: 5 } }) }),
      P("sp5", { ref: "5", name: "Spacer (drum bearing to hub bearing)", mat: "steel", stage: 8, dir: [-1, 0, 0], geom: ax(40, { type: "ring", ri: 10, ro: 12.5, h: 26.7 }) }),
      P("drum", { ref: "12", name: "Sprocket mounting drum", mat: "alu", stage: 8, dir: [-1, 0, 0], geom: drum }),
      P("sp7", { ref: "7", name: "Rear axle spacer (right)", mat: "steel", stage: 9, dir: [1, 0, 0], geom: ax(-75, { type: "ring", ri: 10, ro: 15, h: 15 }) }),
      P("bracket", { ref: "16", name: "Rear caliper bracket", mat: "alu", stage: 9, dir: [1, 0, 0], geom: bracket }),
      P("sp26", { ref: "17", name: "Spacer 20 x 38 x 12", mat: "steel", stage: 9, dir: [1, 0, 0], geom: ax(-95, { type: "ring", ri: 10, ro: 19, h: 12 }) }),
      P("sp8", { ref: "8", name: "Spacer 20 x 33 x 28.3", mat: "steel", stage: 9, dir: [-1, 0, 0], geom: ax(66.7, { type: "ring", ri: 10, ro: 16.5, h: 28.3 }) }),
      ...sideSet("L", 1), ...sideSet("R", -1),
      P("axle", { ref: "6", name: "Rear axle", mat: "steel", stage: 11, dir: [-1, 0, 0],
        geom: ax(0, { type: "lathe", pts: [[0, -158], [8, -158], [9, -157], [9, -122], [10, -120], [10, 131.2], [0, 131.2]] }, { type: "hex", af: 24, h: 12, y: 131 }) }),
      P("washer11", { ref: "11", name: "Washer 19 x 34 x 4", mat: "zinc", small: true, parent: "axle", stage: 12, dir: [1, 0, 0], geom: ax(-135, { type: "ring", ri: 9.5, ro: 17, h: 4 }) }),
      P("nut9", { ref: "9", name: "Axle nut, 18 mm (castle)", mat: "zinc", small: true, parent: "axle", stage: 12, dir: [1, 0, 0], geom: ax(-151, castle) }),
      P("cotter", { ref: "10", name: "Cotter pin", mat: "zinc", small: true, parent: "nut9", stage: 12, dir: [0, -1, 0], geom: cotter }),
    ],
  };
})();
D3_MODELS["CMS-BLCK0059"] = D3_BLCK0059;
