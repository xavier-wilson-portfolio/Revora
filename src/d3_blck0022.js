/* ============ 3D parts model: footrests, GS750N, EN 1977 (CMSNL BLCK0022) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: origin on the bike centreline, level with the front footrest bracket bolts. +X = rider's LEFT, +Y up,
   +Z forward (same as d3_fork.js, right-handed, no mirroring).
   Front footrests: a cast bracket (refs 1 right, 2 left) with a mounting eye at the inner end. The eye carries a bush
   (ref 3) and bolts sideways (along X) into the frame footrest mount with a 10 mm bolt (ref 4), lock washer (ref 6) and a
   washer (ref 5) each side of the eye. The outer end of the bracket is a clevis. The folding footrest (refs 7 right,
   8 left) sits in the clevis on a pin (ref 10) running fore and aft, with a washer (ref 11) and cotter pin (ref 12) on the
   front end. A coil spring (refs 13 and 14) round the pin pushes the footrest back down. Rubber 9 goes on the footrest.
   The right bracket has a tab with the brake pedal stop bolt (ref 15) and lock nut (ref 16).
   Pillion footrests: a folding bar (17 right, 18 left) with a flat tongue at the inner end. The tongue sits in a clevis
   on the frame (frame not drawn) on a pin (ref 22) held by a cotter pin (ref 23). The shaped washer (ref 21) and the
   rubber (19 right, 20 left) slide on from the tongue end.
   Real figures used: washer 10.1 x 21 x 2.3 (catalogue description), 8 mm pin and washer and 6 mm pin, bolt and nut
   (read from the part numbers), cotter pin 2 x 20 (catalogue). Everything else (bracket and bar shapes, peg height and
   spread, rubber and spring sizes) is a typical 1970s 750 proportion, not measured from a GS750. Layout and which part
   fits onto which follow the CMSNL picture. */
const D3_BLCK0022 = (() => {

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
  const pin6 = { type: "group", items: [                                                      // pillion pin along Z, head at the rear
    { type: "cyl", r: 5, h: 2.5, axis: "z", at: [0, 0, -16] },
    { type: "lathe", pts: [[0, 0], [3, 0], [3, 27], [2.5, 28], [0, 28]], rot: [90, 0, 0], at: [0, 0, -13.5] },
    { type: "cyl", r: 1.05, h: 7, axis: "y", at: [0, -3.5, 11], mat: "black" } ] };
  const plate21 = s => ({ type: "extrude", pts: [[-14, -8], [-8, -14], [8, -14], [14, -8], [14, 8], [8, 14], [-8, 14], [-14, 8]], holes: [[0, 0, 9.75]], depth: 2, bevel: .3, rot: [0, 90, 0], at: [s > 0 ? 0 : -2, 0, 0] });

  // ---- front footrest bracket (s = 1 left). Origin = centre of the mounting eye; P = pivot pin centre ----
  const EYE = 82, P = { x: 52, y: -36, z: 34 }, BZ = 4.5, TAB = { x: 22, y: -19, z: 6 };
  const cheek = (s, z0) => ({ type: "extrude", pts: [[38 * s, -46], ...arc(P.x, P.y, 10, -90, 90).map(([x, y]) => [r2(x * s), y]), [38 * s, -26]], holes: [[P.x * s, P.y, 4.1]], depth: 6, bevel: .5, at: [0, 0, z0] });
  const bracket = s => ({ type: "group", items: [
    onX(-12 * s, s, { type: "lathe", pts: [[7.6, 0], [14, 0], [14, 24], [7.6, 24]] }),                          // mounting eye
    { type: "tube", pts: [[4, -12, 12], [20, -24, 22], [33, -33, 30], [39, -37, 34]].map(p => mx(p, s)), r: 8 },  // arm
    { type: "box", size: [6, 20, 34], r: 1.5, at: [39 * s, -37, P.z] },                                          // bridge between the clevis cheeks
    cheek(s, P.z + 11), cheek(s, P.z - 17),                                                                      // clevis cheeks
    ...(s < 0 ? [{ type: "extrude", pts: [[-7, -9], [7, -9], [9, 18], [-9, 18]], holes: [[0, 0, 3]], depth: 5, bevel: .5, rot: [90, 0, 0], at: [-TAB.x, TAB.y, TAB.z] }] : []), // brake pedal stop tab (right only)
  ] });
  // folding footrest: origin on the pin centre. Tongue z -1..10, bar centred on it
  const peg = s => ({ type: "group", items: [
    { type: "extrude", pts: [...arc(0, 0, 9, 90, 270).map(([x, y]) => [r2(x * s), y]), [16 * s, -9], [16 * s, 9]], holes: [[0, 0, 4.1]], depth: 11, bevel: .5, at: [0, 0, -1] },
    cylX(14, 140, 9.5, s, 0, BZ),
    onX(154 * s, s, { type: "lathe", pts: [[0, 0], [11, 0], [12, 2], [12, 4], [0, 4]] }, 0, BZ) ] });
  const rubber9 = s => ({ type: "group", items: [
    { type: "box", size: [118, 22, 32], r: 5, at: [59 * s, 0, 0] },
    { type: "array", pos: Array.from({ length: 13 }, (_, i) => [r2(s * (6 + i * 9)), 0, 0]), item: { type: "box", size: [4, 27, 37], r: 1.5 } } ] });
  const spring = s => ({ type: "group", items: [                                                // origin at the rear end of the coil
    { type: "spring", R: 6.5, wire: 1.6, h: 8, turns: 4, rot: [90, 0, 0] },
    { type: "tube", pts: [[6.5, 0, 7.2], [10, 5, 8.5], [14, 10, 12]].map(p => mx(p, s)), r: .8 },
    { type: "tube", pts: [[6.5, 0, .8], [-2, -6, .8], [-11, -8, .8]].map(p => mx(p, s)), r: .8 } ] });
  const pin8 = { type: "group", items: [                                                       // footrest pin along Z, head at the rear
    { type: "cyl", r: 6.5, h: 3, axis: "z", at: [0, 0, -20] },
    { type: "lathe", pts: [[0, 0], [4, 0], [4, 38], [3.4, 39], [0, 39]], rot: [90, 0, 0], at: [0, 0, -17] },
    { type: "cyl", r: 1.05, h: 9, axis: "y", at: [0, -4.5, 20.5], mat: "black" } ] };

  const parts = [];
  const add = p => parts.push(p);
  [-1, 1].forEach(s => {
    const R = s < 0, side = R ? "right" : "left", k = R ? "R" : "L";
    const X = v => r2(v * s);
    const PW = [X(EYE + P.x), P.y, P.z], PE = [X(130 + P.x), P.y, P.z];       // pin centre installed / exploded
    add({ id: "fwasherIn" + k, ref: "5", name: `Washer, inner side of the eye (${side} front)`, mat: "zinc", small: true, stage: 2,
      A: [X(67.7), 0, 0], E: [X(40), 0, 0], dir: [s, 0, 0], geom: ringX(s, 5.05, 10.5, 2.3) });
    add({ id: "fbracket" + k, ref: R ? "1" : "2", name: `Front footrest bracket (${side})`, mat: "alu", stage: 3,
      A: [X(EYE), 0, 0], E: [X(130), 0, 0], dir: [-s, 0, 0], geom: bracket(s) });
    add({ id: "fbush" + k, ref: "3", name: `Bush (${side} bracket eye)`, mat: "steel", parent: "fbracket" + k, stage: 1,
      A: [X(70), 0, 0], E: [X(230), 0, 0], dir: [-s, 0, 0], geom: ringX(s, 5.1, 7.5, 25) });
    add({ id: "fwasherOut" + k, ref: "5", name: `Washer, outer side of the eye (${side} front)`, mat: "zinc", small: true, parent: "fbracket" + k, stage: 4,
      A: [X(95), 0, 0], E: [X(270), 0, 0], dir: [-s, 0, 0], geom: ringX(s, 5.05, 10.5, 2.3) });
    add({ id: "flock" + k, ref: "6", name: `Lock washer (${side} bracket bolt)`, mat: "spring", small: true, parent: "fbracket" + k, stage: 4,
      A: [X(97.3), 0, 0], E: [X(290), 0, 0], dir: [-s, 0, 0], geom: ringX(s, 5.1, 8.5, 2.5, true) });
    add({ id: "fbolt" + k, ref: "4", name: `Bolt, 10 mm (${side} footrest bracket)`, mat: "zinc", small: true, parent: "fbracket" + k, stage: 4,
      A: [X(99.8), 0, 0], E: [X(350), 0, 0], dir: [-s, 0, 0], geom: bolt10(s) });
    add({ id: "frubber" + k, ref: "9", name: `Footrest rubber (${side} front)`, mat: "rubber", parent: "fpeg" + k, stage: 5,
      A: [X(EYE + P.x + 30), P.y, P.z + BZ], E: [X(440), P.y, P.z + BZ], dir: [-s, 0, 0], geom: rubber9(s) });
    add({ id: "fspring" + k, ref: R ? "13" : "14", name: `Footrest return spring (${side})`, mat: "spring", small: true, parent: "fbracket" + k, stage: 6,
      A: [PW[0], P.y, P.z - 10], E: [PE[0], P.y, -40], dir: [0, 0, 1], geom: spring(s) });
    add({ id: "fpeg" + k, ref: R ? "7" : "8", name: `Folding footrest (${side} front)`, mat: "chrome", parent: "fbracket" + k, stage: 7,
      A: PW, E: [X(130 + P.x + 70), P.y, P.z], dir: [-s, 0, 0], geom: peg(s) });
    add({ id: "fpin" + k, ref: "10", name: `Footrest pin, 8 mm (${side})`, mat: "steel", small: true, parent: "fbracket" + k, stage: 8,
      A: PW, E: [PE[0], P.y, -72], dir: [0, 0, 1], geom: pin8 });
    add({ id: "fpwasher" + k, ref: "11", name: `Washer, 8 mm (${side} footrest pin)`, mat: "zinc", small: true, parent: "fbracket" + k, stage: 8,
      A: [PW[0], P.y, P.z + 17], E: [PE[0], P.y, 81], dir: [0, 0, -1], geom: { type: "ring", ri: 4.2, ro: 8, h: 1.6, rot: [90, 0, 0] } });
    add({ id: "fcotter" + k, ref: "12", name: `Cotter pin 2 x 20 (${side} footrest pin)`, mat: "steel", small: true, parent: "fpin" + k, stage: 8,
      A: [PW[0], P.y, P.z + 20.5], E: [PE[0], P.y + 35, 104.5], dir: [0, -1, 0], geom: cotter() });
    // pillion
    add({ id: "pbar" + k, ref: R ? "17" : "18", name: `Pillion footrest bar (${side})`, mat: "chrome", stage: 11,
      A: [X(PIL.x), PIL.y, PIL.z], E: [X(200), PIL.y, PIL.z], dir: [-s, 0, 0], geom: pillionBar(s) });
    add({ id: "pwasher" + k, ref: "21", name: `Rubber washer plate (${side} pillion)`, mat: "steel", small: true, parent: "pbar" + k, stage: 10,
      A: [X(PIL.x + 16), PIL.y, PIL.z], E: [X(22), PIL.y, PIL.z], dir: [s, 0, 0], geom: plate21(s) });
    add({ id: "prubber" + k, ref: R ? "19" : "20", name: `Pillion footrest rubber (${side})`, mat: "rubber", parent: "pbar" + k, stage: 10,
      A: [X(PIL.x + 18), PIL.y, PIL.z], E: [X(36), PIL.y, PIL.z], dir: [s, 0, 0], geom: pillionRubber(s) });
    add({ id: "ppin" + k, ref: "22", name: `Pivot pin, 6 mm (${side} pillion footrest)`, mat: "steel", small: true, parent: "pbar" + k, stage: 12,
      A: [X(PIL.x), PIL.y, PIL.z], E: [X(PIL.x), PIL.y, PIL.z - 80], dir: [0, 0, 1], geom: pin6 });
    add({ id: "pcotter" + k, ref: "23", name: `Cotter pin 2 x 20 (${side} pillion pin)`, mat: "steel", small: true, parent: "ppin" + k, stage: 12,
      A: [X(PIL.x), PIL.y, PIL.z + 11], E: [X(PIL.x), PIL.y + 40, PIL.z + 11], dir: [0, -1, 0], geom: cotter() });
  });
  // brake pedal stop on the right bracket: bolt down through the tab from above, lock nut underneath
  const tabX = -(EYE + TAB.x), tabEX = -(130 + TAB.x);
  add({ id: "stopbolt", ref: "15", name: "Brake pedal stop bolt, 6 mm", mat: "zinc", small: true, parent: "fbracketR", stage: 9,
    A: [tabX, TAB.y + 6, TAB.z], E: [tabEX, 45, TAB.z], dir: [0, -1, 0],
    geom: { type: "group", items: [{ type: "hex", af: 10, h: 4, y: 0 }, { type: "lathe", pts: [[0, .3], [3, .3], [3, -19.5], [2.5, -20], [0, -20]] }] } });
  add({ id: "stopnut", ref: "16", name: "Nut, 6 mm (pedal stop bolt)", mat: "zinc", small: true, parent: "fbracketR", stage: 9,
    A: [tabX, TAB.y - 10, TAB.z], E: [tabEX, -90, TAB.z], dir: [0, 1, 0], geom: { type: "hex", af: 10, h: 5, y: 0, hole: 3 } });

  return {
    id: "CMS-BLCK0022", title: "Footrests (GS750N, EN)", units: "mm", page: "BLCK0022",
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL footrest page (GS750N, EN) and the layout follows its picture. The 10.1 x 21 x 2.3 washer and the 2 x 20 cotter pins come from the catalogue descriptions, the 8 mm and 6 mm pin, bolt and nut sizes are read from the part numbers. Bracket and bar shapes, peg height and spread, rubber and spring sizes are typical 1970s 750 proportions, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [1.1, .8, 1.2], up: [0, 1, 0] },
    notModelled: "Every ref is drawn. Refs 3, 4, 5, 6, 9, 10, 11, 12, 21, 22 and 23 are used on both sides, so each is drawn once per side (ref 5 twice per side). Which of the two springs (13, 14) is the right one and which the left is a guess. The frame footrest mounts and the pillion footrest clevises are part of the frame and aren't drawn, so the bracket bolts and the pillion pins are shown without the frame around them.",
    stages: [
      { t: "Bushes into the brackets", d: "Push a bush into the mounting eye of each front footrest bracket. Clean and lightly grease it first." },
      { t: "Inner washers", d: "Hold a washer against each frame footrest mount, lined up with the threaded hole." },
      { t: "Brackets onto the frame", d: "Offer each bracket up to its mount with the clevis pointing forward and out. The right bracket is the one with the tab for the brake pedal stop." },
      { t: "Bracket bolts", d: "Fit the outer washer and lock washer on each bolt and screw it through the bush into the frame. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Rubbers onto the footrests", d: "Push a rubber onto each folding footrest from the outer end until it sits against the tongue." },
      { t: "Return springs", d: "Put the spring into the rear half of the clevis gap with its short leg against the bracket." },
      { t: "Footrests into the clevis", d: "Slide the footrest tongue into the clevis in front of the spring and hook the other spring leg over the tongue." },
      { t: "Footrest pins", d: "Push the pin through from the rear, fit the washer on the front end and a new cotter pin. Check the footrest folds up and springs back down." },
      { t: "Brake pedal stop", d: "Screw the stop bolt down through the tab on the right bracket and run the lock nut up underneath. Set the pedal height and lock the nut. Pedal height: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Pillion rubbers", d: "Slide the shaped washer, then the rubber, onto each pillion bar from the tongue end. The right and left rubbers have different part numbers." },
      { t: "Pillion bars onto the frame", d: "Put the flat tongue of each pillion bar into the clevis on the frame, rubber pointing out." },
      { t: "Pillion pins", d: "Push the pin through the clevis and tongue from the rear and fit a new cotter pin through its end. Check the footrest folds up and drops back freely." },
    ],
    parts,
  };
})();
D3_MODELS["CMS-BLCK0022"] = D3_BLCK0022;
