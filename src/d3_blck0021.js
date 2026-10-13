/* ============ 3D parts model: footrests, GS750B, C, EC 1977 (CMSNL BLCK0021) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: origin on the bike centreline, level with the front footrest mounting bolts. +X = rider's LEFT, +Y up,
   +Z forward (same as d3_fork.js, right-handed, no mirroring).
   Front footrests (refs 1 right, 2 left): a fixed bent bar with a mounting eye at the inner end. The eye carries a bush
   (ref 3) and bolts sideways (along X) into the frame footrest mount with a 10 mm bolt (ref 4), lock washer (ref 6) and a
   washer (ref 5) each side of the eye. The bar runs forward, down and out to the peg, which carries the rubber (7 right,
   8 left). The right bar has a small tab with the brake pedal stop bolt (ref 9) and lock nut (ref 10).
   Pillion footrests: a folding bar (ref 11) with a flat tongue at the inner end. The tongue sits in a clevis on the frame
   (frame not drawn) on a pin (ref 14) running fore and aft, held by a cotter pin (ref 15). Washer 13 and rubber 12 slide
   onto the bar from the tongue end. One pillion set is shown in the CMSNL picture; both sides are drawn here.
   Real figures used: washer 10.1 x 21 x 2.3 and washer 19.5 x 32 x 2 (catalogue descriptions), 6 mm nut (catalogue),
   cotter pin 2 x 20 (catalogue). Everything else (bar shapes, peg height and spread, rubber sizes) is a typical 1970s
   750 proportion, not measured from a GS750. Layout and which part fits onto which follow the CMSNL picture. */
const D3_BLCK0021 = (() => {
  const r2 = v => Math.round(v * 100) / 100;
  const mx = (p, s) => [r2(p[0] * s), p[1], p[2]];
  // lathe profile [r, axial] turned onto the X axis, running toward +X (s = 1) or -X (s = -1) from x0
  const onX = (x0, s, item, y = 0, z = 0) => ({ ...item, rot: s > 0 ? [0, 0, -90] : [0, 0, 90], at: [x0, y, z] });
  // plain cylinder along X from x0 for len, toward s
  const cylX = (x0, len, r, s, y = 0, z = 0) => ({ type: "cyl", r, h: len, axis: "x", at: [s > 0 ? x0 : -x0 - len, y, z] });
  const arc = (cx, cy, r, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, k) => { const a = (a0 + (a1 - a0) * k / n) * Math.PI / 180; return [r2(cx + r * Math.cos(a)), r2(cy + r * Math.sin(a))]; });
  const cotter = (rotY = 0) => ({ type: "group", rot: [0, rotY, 0], items: [
    { type: "tube", pts: [[0, 8, -.8], [0, -6, -.8], [0, -8, -2.5], [0, -9.5, -6]], r: .8 },
    { type: "tube", pts: [[0, 8, .8], [0, -6, .8], [0, -8, 2.5], [0, -9.5, 6]], r: .8 },
    { type: "torus", R: 2, r: .8, rot: [0, 0, 90], at: [0, 10, 0] } ] });

  // ---- front footrest (s = 1 left, s = -1 right). Origin of the bar = centre of its mounting eye ----
  const EYE = 82, PEG = { y: -28, z: 52 }, TAB = { x: 22, y: -18.5, z: 2 };
  const frontBar = s => ({ type: "group", items: [
    onX(-12 * s, s, { type: "lathe", pts: [[7.6, 0], [13, 0], [13, 24], [7.6, 24]] }),                          // mounting eye
    { type: "tube", pts: [[4, -11, 11], [16, -16, 24], [32, -23, 40], [46, -27, 50], [56, -28, 52]].map(p => mx(p, s)), r: 7.5 }, // bent arm
    cylX(48, 152, 10, s, PEG.y, PEG.z),                                                                           // peg
    onX(200 * s, s, { type: "lathe", pts: [[0, 0], [10, 0], [11, 2], [11, 5], [0, 5]] }, PEG.y, PEG.z),            // end knob that keeps the rubber on
    ...(s < 0 ? [{ type: "extrude", pts: [[-7, -9], [7, -9], [9, 19], [-9, 19]], holes: [[0, 0, 3]], depth: 5, bevel: .5, rot: [90, 0, 0], at: [-TAB.x, TAB.y + 5, TAB.z] }] : []), // brake pedal stop tab (right bar only)
  ] });
  const rubberC = s => ({ type: "group", items: [
    { type: "box", size: [128, 24, 34], r: 6, at: [s * 64, 0, 0] },
    { type: "array", pos: [0, 1, 2, 3, 4, 5, 6].flatMap(i => [-11, 0, 11].map(z => [r2(s * (12 + i * 17.3)), 12.5, z])), item: { type: "box", size: [12, 3, 8], r: 1 } },
    { type: "box", size: [6, 28, 38], r: 3, at: [s * 3, 0, 0] } ] });
  const bolt10 = s => ({ type: "group", rot: [0, 0, 90 * s], items: [                      // M10 bolt, shank pointing inward, origin under the head
    { type: "hex", af: 14, h: 7, y: -7 },
    { type: "lathe", pts: [[0, -.3], [5, -.3], [5, 44], [4.3, 45], [0, 45]] } ] });
  const ringX = (s, ri, ro, h, split) => onX(0, s, { type: "ring", ri, ro, h, split });

  // ---- pillion footrest (s = 1 left). Origin of the bar = centre of the pivot pin ----
  const PIL = { x: 140, y: 70, z: -330 };
  const pillionBar = s => ({ type: "group", items: [
    { type: "extrude", pts: [...arc(0, 0, 9, 90, 270).map(([x, y]) => [r2(x * s), y]), [16 * s, -9], [16 * s, 9]], holes: [[0, 0, 3.2]], depth: 8, bevel: .5, at: [0, 0, -4] }, // tongue
    cylX(14, 138, 9.5, s),                                                                                       // bar
    onX(152 * s, s, { type: "lathe", pts: [[0, 0], [12, 0], [14, 2], [14, 4], [12, 6], [0, 6]] }) ] });           // end knob
  const pillionRubber = s => onX(0, s, { type: "lathe", pts: [[9.6, 0], [16.5, 0], [16.5, 6],
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap(i => [[14, 6 + i * 11], [14, 9 + i * 11], [16.5, 11 + i * 11], [16.5, 17 + i * 11]]).slice(0, -1), [16.5, 128], [17, 130], [17, 134], [9.6, 134]] });
  const pin6 = { type: "group", items: [                                                      // pin along Z, head at the rear
    { type: "cyl", r: 5, h: 2.5, axis: "z", at: [0, 0, -16] },
    { type: "lathe", pts: [[0, 0], [3, 0], [3, 27], [2.5, 28], [0, 28]], rot: [90, 0, 0], at: [0, 0, -13.5] },
    { type: "cyl", r: 1.05, h: 7, axis: "y", at: [0, -3.5, 11], mat: "black" } ] };

  const parts = [];
  const add = p => parts.push(p);
  [-1, 1].forEach(s => {
    const R = s < 0, side = R ? "right" : "left", k = R ? "R" : "L";
    const X = v => r2(v * s);
    // front: inner washer, bar, bush, outer washer, lock washer, bolt
    add({ id: "fwasherIn" + k, ref: "5", name: `Washer, inner side of the eye (${side} front)`, mat: "zinc", small: true, stage: 2,
      A: [X(67.7), 0, 0], E: [X(40), 0, 0], dir: [s, 0, 0], geom: ringX(s, 5.05, 10.5, 2.3) });
    add({ id: "fbar" + k, ref: R ? "1" : "2", name: `Front footrest bar (${side})`, mat: "chrome", stage: 3,
      A: [X(EYE), 0, 0], E: [X(130), 0, 0], dir: [-s, 0, 0], geom: frontBar(s) });
    add({ id: "fbush" + k, ref: "3", name: `Bush (${side} front eye)`, mat: "steel", parent: "fbar" + k, stage: 1,
      A: [X(70), 0, 0], E: [X(360), 0, 0], dir: [-s, 0, 0], geom: ringX(s, 5.1, 7.5, 25) });
    add({ id: "fwasherOut" + k, ref: "5", name: `Washer, outer side of the eye (${side} front)`, mat: "zinc", small: true, parent: "fbar" + k, stage: 4,
      A: [X(95), 0, 0], E: [X(400), 0, 0], dir: [-s, 0, 0], geom: ringX(s, 5.05, 10.5, 2.3) });
    add({ id: "flock" + k, ref: "6", name: `Lock washer (${side} front bolt)`, mat: "spring", small: true, parent: "fbar" + k, stage: 4,
      A: [X(97.3), 0, 0], E: [X(420), 0, 0], dir: [-s, 0, 0], geom: ringX(s, 5.1, 8.5, 2.5, true) });
    add({ id: "fbolt" + k, ref: "4", name: `Bolt, 10 mm (${side} front footrest)`, mat: "zinc", small: true, parent: "fbar" + k, stage: 4,
      A: [X(99.8), 0, 0], E: [X(480), 0, 0], dir: [-s, 0, 0], geom: bolt10(s) });
    add({ id: "frubber" + k, ref: R ? "7" : "8", name: `Footrest rubber (${side} front)`, mat: "rubber", parent: "fbar" + k, stage: 5,
      A: [X(EYE + 63), PEG.y, PEG.z], E: [X(370), PEG.y, PEG.z], dir: [-s, 0, 0], geom: rubberC(s) });
    // pillion: bar, washer, rubber, pin, cotter pin
    add({ id: "pbar" + k, ref: "11", name: `Pillion footrest bar (${side})`, mat: "chrome", stage: 8,
      A: [X(PIL.x), PIL.y, PIL.z], E: [X(200), PIL.y, PIL.z], dir: [-s, 0, 0], geom: pillionBar(s) });
    add({ id: "pwasher" + k, ref: "13", name: `Washer 19.5 x 32 (${side} pillion rubber)`, mat: "zinc", small: true, parent: "pbar" + k, stage: 7,
      A: [X(PIL.x + 16), PIL.y, PIL.z], E: [X(22), PIL.y, PIL.z], dir: [s, 0, 0], geom: ringX(s, 9.75, 16, 2) });
    add({ id: "prubber" + k, ref: "12", name: `Pillion footrest rubber (${side})`, mat: "rubber", parent: "pbar" + k, stage: 7,
      A: [X(PIL.x + 18), PIL.y, PIL.z], E: [X(36), PIL.y, PIL.z], dir: [s, 0, 0], geom: pillionRubber(s) });
    add({ id: "ppin" + k, ref: "14", name: `Pivot pin (${side} pillion footrest)`, mat: "steel", small: true, parent: "pbar" + k, stage: 9,
      A: [X(PIL.x), PIL.y, PIL.z], E: [X(PIL.x), PIL.y, PIL.z - 80], dir: [0, 0, 1], geom: pin6 });
    add({ id: "pcotter" + k, ref: "15", name: `Cotter pin 2 x 20 (${side} pillion pin)`, mat: "steel", small: true, parent: "ppin" + k, stage: 9,
      A: [X(PIL.x), PIL.y, PIL.z + 11], E: [X(PIL.x), PIL.y + 40, PIL.z + 11], dir: [0, -1, 0], geom: cotter() });
  });
  // brake pedal stop on the right front bar: bolt up from below, lock nut on top
  const tabX = -(EYE + TAB.x), tabEX = -(130 + TAB.x);
  add({ id: "stopbolt", ref: "9", name: "Brake pedal stop bolt, 6 mm", mat: "zinc", small: true, parent: "fbarR", stage: 6,
    A: [tabX, TAB.y, TAB.z], E: [tabEX, -80, TAB.z], dir: [0, 1, 0],
    geom: { type: "group", items: [{ type: "hex", af: 10, h: 4, y: -4 }, { type: "lathe", pts: [[0, -.3], [3, -.3], [3, 19.5], [2.5, 20], [0, 20]] }] } });
  add({ id: "stopnut", ref: "10", name: "Nut, 6 mm (pedal stop bolt)", mat: "zinc", small: true, parent: "fbarR", stage: 6,
    A: [tabX, TAB.y + 5, TAB.z], E: [tabEX, 40, TAB.z], dir: [0, -1, 0], geom: { type: "hex", af: 10, h: 5, y: 0, hole: 3 } });

  return {
    id: "CMS-BLCK0021", title: "Footrests (GS750B, C, EC)", units: "mm", page: "BLCK0021",
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL footrest page (GS750B, C, EC) and the layout follows its picture. The washer sizes, the 6 mm nut and the 2 x 20 cotter pin come from the catalogue descriptions. Bar shapes, peg height and spread and rubber sizes are typical 1970s 750 proportions, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [1.1, .8, 1.2], up: [0, 1, 0] },
    notModelled: "Every ref is drawn. The CMSNL picture shows one pillion footrest set; refs 11 to 15 are drawn on both sides because the bike has two. Refs 3, 4, 5 and 6 are used on both front footrests (ref 5 twice per side). The frame footrest mounts and the pillion footrest clevises are part of the frame and aren't drawn, so the front bolts and the pillion pins are shown without the frame around them.",
    stages: [
      { t: "Bushes into the front bars", d: "Push a bush into the mounting eye of each front footrest bar. Clean and lightly grease it first." },
      { t: "Inner washers", d: "Hold a washer against each frame footrest mount, lined up with the threaded hole." },
      { t: "Front bars onto the frame", d: "Offer each bar up to its mount with the peg pointing forward and out. The right bar is the one with the small tab for the brake pedal stop." },
      { t: "Front bolts", d: "Fit the outer washer and lock washer on each bolt and screw it through the bush into the frame. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Front rubbers", d: "Push the rubbers onto the pegs from the outer end, over the end knob. The right rubber has its own part number, so don't swap them." },
      { t: "Brake pedal stop", d: "Run the lock nut onto the stop bolt, then screw the bolt up through the tab on the right bar. Set the pedal height and lock the nut. Pedal height: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Pillion rubbers", d: "Slide the washer, then the rubber, onto each pillion bar from the tongue end until the rubber stops against the end knob." },
      { t: "Pillion bars onto the frame", d: "Put the flat tongue of each pillion bar into the clevis on the frame, rubber pointing out." },
      { t: "Pillion pins", d: "Push the pin through the clevis and tongue from the rear and fit a new cotter pin through its end. Check the footrest folds up and drops back freely." },
    ],
    parts,
  };
})();
D3_MODELS["CMS-BLCK0021"] = D3_BLCK0021;
