/* ============ 3D parts model: rear swinging arm, GS750B 1977 (CMSNL BLCK0057) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: origin on the swing arm pivot axis at the middle of the pivot tube. +X along the pivot shaft toward the
   right side of the bike (brake side; the chain is on the left), +Y up, +Z forward. The arms run back along -Z to the
   rear axle slots at about Z = -520. The arm is drawn level (in real life the axle end hangs lower, it depends on load).
   Every part's geometry is laid out in world coordinates, so every A is [0, 0, 0] and E is the exploded offset.
   Pivot stack, from the middle outward on each side: centre spacer (ref 2) on the shaft inside the pivot tube, needle
   bearing (ref 3) pressed into the tube end, pivot sleeve (ref 6) riding in the needles, dust cover (ref 10) over the tube
   end, thrust washer (ref 11), then the frame pivot plate (frame not drawn). Shaft (ref 7) goes in from the left, washer 9
   and nut 8 on the right. Clamping the nut locks the sleeves, centre spacer and washers solid to the frame; the tube turns
   on the needles around them.
   Torque link (ref 12) hangs under the right arm, from a lug welded to the arm back to the rear brake caliper bracket
   (bracket is on the rear brake page and isn't drawn). Each end has a 10 mm bolt, washer, nut and cotter pin.
   Real figures used: needle bearing 22 x 29 x 30 (catalogue description), 14 mm shaft nut (catalogue), thrust washer
   14.2 x 34 x 1 (catalogue), dust cover seal OD 40 (catalogue), bolt 10 x 39 (catalogue), cotter pin 2 x 20 (read from
   the part number 04111-20208). Everything else (tube and arm sizes, arm length, lug and link shapes) is a typical
   1970s 750 proportion, not measured from a GS750. */
const D3_BLCK0057 = (() => {
  const r2 = v => Math.round(v * 100) / 100;
  // turn a lathe profile [r, axial] onto the X axis, starting at x0 and running toward +X (s = 1) or -X (s = -1)
  const onX = (x0, s, item) => ({ ...item, rot: s > 0 ? [0, 0, -90] : [0, 0, 90], at: [x0, 0, 0] });
  // flat outline drawn in the side view as [z, y] points, extruded across X from x0 by w
  const side = (pts, w, x0, holes, mat) => ({ type: "extrude", pts: pts.map(([z, y]) => [r2(-z), r2(y)]), holes: (holes || []).map(([z, y, r]) => [r2(-z), r2(y), r]),
    depth: w, bevel: .6, rot: [0, 90, 0], at: [x0, 0, 0], ...(mat ? { mat } : {}) });
  const arc = (cz, cy, r, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, k) => { const a = (a0 + (a1 - a0) * k / n) * Math.PI / 180; return [cz + r * Math.cos(a), cy + r * Math.sin(a)]; });

  // ---- swing arm: pivot tube, two box arms, cross brace, shock studs, torque link lug ----
  const TUBE_R = 18, TUBE_L = 125, BR_IN = 95;        // tube outer radius, half length, depth where the bearing bores step down
  const armPts = [[10, 20], [-10, 30], [-480, 22], [-555, 22], [-555, 9], [-490, 9], [-490, -9], [-555, -9], [-555, -22], [-480, -22], [-10, -30], [10, -20]];
  const LUG = { z: -250, y: -50 }, REAR = { z: -470, y: -62 }; // torque link eyes (front on the arm lug, rear on the caliper bracket)
  const lugPts = [[-236, -18], [-264, -18], ...arc(LUG.z, LUG.y, 12, 180, 360)];
  const swingarm = { type: "group", items: [
    onX(-TUBE_L, 1, { type: "lathe", pts: [[14.5, 0], [TUBE_R, 0], [TUBE_R, 250], [14.5, 250], [14.5, 250 - (TUBE_L - BR_IN)], [12, 250 - (TUBE_L - BR_IN)], [12, TUBE_L - BR_IN], [14.5, TUBE_L - BR_IN]] }),
    { type: "cyl", r: 6, h: 6, axis: "y", at: [0, 16, 0] },                                  // grease nipple boss on top of the tube
    side(armPts, 30, BR_IN), side(armPts, 30, -TUBE_L),                                      // right and left arms
    { type: "box", size: [190, 34, 40], r: 3, at: [0, 0, -140] },                             // cross brace
    { type: "cyl", r: 6, h: 22, axis: "x", at: [TUBE_L, 6, -440] },                           // right shock stud
    { type: "cyl", r: 6, h: 22, axis: "x", at: [-TUBE_L - 22, 6, -440] },                     // left shock stud
    { type: "cyl", r: 8.5, h: 3, axis: "x", at: [TUBE_L, 6, -440] }, { type: "cyl", r: 8.5, h: 3, axis: "x", at: [-TUBE_L - 3, 6, -440] },
    side(lugPts, 8, 112, [[LUG.z, LUG.y, 5.2]]),                                             // torque link lug under the right arm
  ] };

  // ---- pivot parts ----
  const needles = Array.from({ length: 18 }, (_, n) => { const a = n / 18 * Math.PI * 2; return [r2(12.25 * Math.cos(a)), 2, r2(12.25 * Math.sin(a))]; });
  const bearing = (x0, s) => ({ type: "group", rot: s > 0 ? [0, 0, -90] : [0, 0, 90], at: [x0, 0, 0], items: [
    { type: "lathe", pts: [[12.6, 0], [14.5, 0], [14.5, 30], [12.6, 30], [12.6, 29], [13.5, 29], [13.5, 1], [12.6, 1]] },
    { type: "array", pos: needles, item: { type: "cyl", r: 1.15, h: 26, axis: "y" } } ] });
  const sleeve = (s) => onX(s * BR_IN, s, { type: "lathe", pts: [[7.1, 0], [11, 0], [11, 38], [7.1, 38]] });
  const cover = (s) => onX(s * 118, s, { type: "lathe", pts: [[18.2, 0], [20, 0], [20, 12], [18.6, 13], [11.4, 13], [11.4, 9], [12.6, 7], [18.2, 7]] });
  const thrust = (s) => onX(s * 133, s, { type: "ring", ro: 17, ri: 7.1, h: 1 });

  // ---- 10 mm torque link fasteners (bolt head inboard at X = 112, nut outboard) ----
  const bolt10 = (e, L) => ({ type: "group", rot: [0, 0, -90], at: [112, e.y, e.z], items: [
    { type: "hex", af: 14, h: 6.5, y: -6.5 },
    { type: "lathe", pts: [[0, -.5], [5, -.5], [5, L - 1], [4.2, L], [0, L]] } ] });
  const castle = e => ({ type: "group", rot: [0, 0, -90], at: [130, e.y, e.z], items: [
    { type: "hex", af: 14, h: 7, y: 0, hole: 5 },
    { type: "array", pos: [0, 60, 120, 180, 240, 300].map(a => [r2(5.9 * Math.cos((a + 30) * Math.PI / 180)), 9, r2(5.9 * Math.sin((a + 30) * Math.PI / 180)), -(a + 30)]),
      item: { type: "box", size: [2.4, 4, 3], r: .4 } } ] });
  const cotter = e => ({ type: "group", at: [139.5, e.y, e.z], items: [
    { type: "tube", pts: [[0, 9, -.85], [0, -6, -.85], [0, -9, -2.5], [0, -10.5, -7]], r: .85 },
    { type: "tube", pts: [[0, 9, .85], [0, -6, .85], [0, -9, 2.5], [0, -10.5, 7]], r: .85 },
    { type: "torus", R: 2.2, r: .85, rot: [0, 0, 90], at: [0, 11.2, 0] } ] });

  // torque link outline: two eyes joined by a straight strap, eyes r 12 (front) and 11 (rear)
  const linkPts = (() => {
    const dz = REAR.z - LUG.z, dy = REAR.y - LUG.y, a = Math.atan2(dy, dz) * 180 / Math.PI;
    return [...arc(LUG.z, LUG.y, 12, a + 90, a + 270, 16), ...arc(REAR.z, REAR.y, 11, a - 90, a + 90, 16)];
  })();

  const LINK_DROP = -120;                              // the torque link and its hardware are exploded below the arm
  const ex = (dx, dy = 0, dz = 0) => [dx, dy, dz], Z = [0, 0, 0];

  return {
    id: "CMS-BLCK0057", title: "Rear swinging arm", units: "mm", page: "BLCK0057",
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL rear swinging arm page. The needle bearing (22 x 29 x 30), 14 mm shaft nut, 14.2 x 34 x 1 thrust washer, 40 mm dust cover and 10 x 39 bolt sizes come from the catalogue descriptions. Arm length, tube and arm sections, the lug and torque link shapes are typical 1970s 750 proportions, not measured from a GS750. How many needle bearings sit in each end and what the bush (ref 5) is for are a best reading of the parts list. Use the factory service manual for every dimension.",
    view: { dir: [1.35, .8, .75], up: [0, 1, 0] },
    notModelled: "Every ref is drawn. Refs 1-1/1-2, 2-1/2-2/2-3, 6-1/6-2 and 10-1/10-2 are earlier and later part numbers for the same parts, so one of each is shown. One needle bearing is drawn in each end of the pivot tube; some GS swing arms use two per side, so check the CMSNL picture. Ref 5 (bush, 10 mm) is shown as the collar in the front eye of the torque link; that is a guess. Ref 13 is drawn at the rear end of the torque link with its own washer, nut and cotter pin, so refs 15, 16 and 17 are shown as two each. The frame pivot plates, the rear shocks, the rear wheel and the brake caliper bracket the link bolts to are on other pages and aren't drawn.",
    stages: [
      { t: "Needle bearings and grease nipple", d: "Press a needle bearing into each end of the pivot tube, pushing on the marked face, until it sits flush with the tube end. Screw the grease nipple into the boss on top of the tube." },
      { t: "Centre spacer", d: "Slide the centre spacer into the pivot tube through one of the bearings so it sits in the middle of the tube." },
      { t: "Pivot sleeves", d: "Grease the needles and push a pivot sleeve into each bearing until it meets the centre spacer." },
      { t: "Dust covers", d: "Pack the dust cover lips with grease and push one over each end of the pivot tube." },
      { t: "Arm into the frame", d: "Put a thrust washer on each end, lift the arm into the frame pivot and slide the shaft in from the left through the frame, the sleeves and the centre spacer." },
      { t: "Shaft nut", d: "Fit the washer and the 14 mm nut on the right end of the shaft. Torque: VERIFY IN FACTORY SERVICE MANUAL. The arm should swing freely with no side play." },
      { t: "Torque link", d: "Press the bush into the front eye of the torque link, then offer the link up between the lug under the right arm and the brake caliper bracket." },
      { t: "Torque link bolts", d: "Push the bolts through from the inside, fit the washers and nuts, and tighten. Torque: VERIFY IN FACTORY SERVICE MANUAL. Line up a slot and fit a new cotter pin in each, legs bent over." },
    ],
    parts: [
      { id: "arm", ref: "1", name: "Swing arm", mat: "black", shell: true, stage: 0, A: Z, E: Z, dir: [0, 0, 1], geom: swingarm },
      { id: "nipple", ref: "4", name: "Grease nipple", mat: "brass", small: true, parent: "arm", stage: 1, A: Z, E: ex(0, 55), dir: [0, -1, 0],
        geom: { type: "group", at: [0, 22, 0], items: [
          { type: "lathe", pts: [[0, -5], [2.6, -5], [2.6, 0], [0, 0]] },
          { type: "hex", af: 8, h: 4, y: 0 },
          { type: "cyl", r: 2, h: 3, axis: "y", at: [0, 4, 0] },
          { type: "sphere", r: 3, at: [0, 9, 0] } ] } },
      { id: "brgR", ref: "3", name: "Needle bearing 22 x 29 x 30 (right)", mat: "steel", parent: "arm", stage: 1, A: Z, E: ex(80), dir: [-1, 0, 0], geom: bearing(BR_IN, 1) },
      { id: "brgL", ref: "3", name: "Needle bearing 22 x 29 x 30 (left)", mat: "steel", parent: "arm", stage: 1, A: Z, E: ex(-80), dir: [1, 0, 0], geom: bearing(-BR_IN, -1) },
      { id: "spacer2", ref: "2", name: "Centre spacer (pivot)", mat: "steel", parent: "arm", stage: 2, A: Z, E: ex(-330), dir: [1, 0, 0],
        geom: onX(-BR_IN, 1, { type: "ring", ro: 10, ri: 7.1, h: 2 * BR_IN }) },
      { id: "sleeveR", ref: "6", name: "Pivot sleeve (right)", mat: "steel", parent: "arm", stage: 3, A: Z, E: ex(140), dir: [-1, 0, 0], geom: sleeve(1) },
      { id: "sleeveL", ref: "6", name: "Pivot sleeve (left)", mat: "steel", parent: "arm", stage: 3, A: Z, E: ex(-355), dir: [1, 0, 0], geom: sleeve(-1) },
      { id: "coverR", ref: "10", name: "Dust cover (right)", mat: "rubber", small: true, parent: "arm", stage: 4, A: Z, E: ex(180), dir: [-1, 0, 0], geom: cover(1) },
      { id: "coverL", ref: "10", name: "Dust cover (left)", mat: "rubber", small: true, parent: "arm", stage: 4, A: Z, E: ex(-385), dir: [1, 0, 0], geom: cover(-1) },
      { id: "thrustR", ref: "11", name: "Thrust washer 14.2 x 34 x 1 (right)", mat: "steel", small: true, parent: "arm", stage: 5, A: Z, E: ex(195), dir: [-1, 0, 0], geom: thrust(1) },
      { id: "thrustL", ref: "11", name: "Thrust washer 14.2 x 34 x 1 (left)", mat: "steel", small: true, parent: "arm", stage: 5, A: Z, E: ex(-405), dir: [1, 0, 0], geom: thrust(-1) },
      { id: "shaft", ref: "7", name: "Swing arm pivot shaft (14 mm)", mat: "steel", parent: "arm", stage: 5, A: Z, E: ex(-470, 110), dir: [1, 0, 0],
        geom: { type: "group", rot: [0, 0, -90], at: [-152, 0, 0], items: [
          { type: "hex", af: 22, h: 10, y: -10 },
          { type: "lathe", pts: [[0, -.5], [7, -.5], [7, 322], [6, 324], [0, 324]] } ] } },
      { id: "washer9", ref: "9", name: "Washer (shaft nut)", mat: "zinc", small: true, parent: "shaft", stage: 6, A: Z, E: ex(195), dir: [-1, 0, 0],
        geom: onX(152, 1, { type: "ring", ro: 14, ri: 7.2, h: 2.5 }) },
      { id: "nut8", ref: "8", name: "Shaft nut (14 mm)", mat: "zinc", small: true, parent: "shaft", stage: 6, A: Z, E: ex(215), dir: [-1, 0, 0],
        geom: { type: "group", rot: [0, 0, -90], at: [154.5, 0, 0], items: [{ type: "hex", af: 22, h: 12, y: 0, hole: 7 }] } },
      { id: "link", ref: "12", name: "Rear brake torque link", mat: "zinc", parent: "arm", stage: 7, A: Z, E: ex(80, LINK_DROP), dir: [-1, 0, 0],
        geom: side(linkPts, 8, 120, [[LUG.z, LUG.y, 7], [REAR.z, REAR.y, 5.2]]) },
      { id: "bush5", ref: "5", name: "Bush (torque link front eye)", mat: "steel", small: true, parent: "link", stage: 7, A: Z, E: ex(120, LINK_DROP), dir: [-1, 0, 0],
        geom: { type: "ringX", ro: 7, ri: 5.1, h: 8, at: [120, LUG.y, LUG.z] } },
      { id: "bolt14", ref: "14", name: "Bolt 10 x 39 (torque link to swing arm)", mat: "zinc", small: true, parent: "link", stage: 8, A: Z, E: ex(-125, LINK_DROP), dir: [1, 0, 0], geom: bolt10(LUG, 39) },
      { id: "bolt13", ref: "13", name: "Bolt (torque link to caliper bracket)", mat: "zinc", small: true, parent: "link", stage: 8, A: Z, E: ex(-125, LINK_DROP), dir: [1, 0, 0], geom: bolt10(REAR, 36) },
      { id: "washer15", ref: "15", name: "Washers (torque link bolts)", mat: "zinc", small: true, parent: "link", stage: 8, A: Z, E: ex(150, LINK_DROP), dir: [-1, 0, 0], count: 2,
        geom: { type: "group", items: [LUG, REAR].map(e => ({ type: "ringX", ro: 10, ri: 5.2, h: 2, at: [128, e.y, e.z] })) } },
      { id: "nut16", ref: "16", name: "Castle nuts 10 mm (torque link)", mat: "zinc", small: true, parent: "link", stage: 8, A: Z, E: ex(175, LINK_DROP), dir: [-1, 0, 0], count: 2,
        geom: { type: "group", items: [castle(LUG), castle(REAR)] } },
      { id: "pin17", ref: "17", name: "Cotter pins 2 x 20", mat: "zinc", small: true, parent: "link", stage: 8, A: Z, E: ex(210, LINK_DROP), dir: [0, -1, 0], count: 2,
        geom: { type: "group", items: [cotter(LUG), cotter(REAR)] } },
    ],
  };
})();
D3_MODELS["CMS-BLCK0057"] = D3_BLCK0057;
