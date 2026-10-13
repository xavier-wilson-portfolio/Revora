/* ============ 3D parts model: contact breaker (Kokusan), GS750B 1977 (CMSNL BLCK0011) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: the engine frame used by the crankshaft and RH cover models (DG-EN-02 / CMS-BLCK0015): crank axis = X through
   the origin, +X toward the rider's right, +Y up, +Z forward. That frame is left-handed in Three.js, so mirrorX is set.
   The points sit on the right-hand end of the crank, inside the round recess of the RH cover. The plate seat is taken as the
   plane X = 212. The advance unit (governor) slides onto the crank end and the long bolt goes through it into the crank.
   Every part's geometry is laid out in world coordinates, so every A is [0, 0, 0] and E is the exploded offset.
   Identity and numbering: CMSNL contact breaker (Kokusan) page and its picture. Points sets sit either side of the cam
   (upper rear and lower front), the condenser pair lower rear and the lead leaves the plate at the rear, as in the picture.
   Geometry: APPROXIMATE. Plate size, cam size, condenser size and screw positions are typical for a 1970s points plate,
   not measured from a GS750. Screw and bolt sizes are read from the Suzuki part numbers where they show one
   (09125-05024 = 5 x 12, 01107-08608 = 8 x 60). */
const D3_BLCK0011 = (() => {
  const r3 = v => +v.toFixed(3), D2R = Math.PI / 180;
  const XS = 212;                         // plate seat (back face of the timing plate)
  const X12 = XS + 1.2;                   // back face of the base plate (timing plate is 1.2 thick)
  const XP = X12 + 2;                     // outer face of the base plate
  const RP = 37;                          // base plate radius
  const SA = -45, SB = 135;               // points sets: rotation (deg about X) from the 12 o'clock position
  const CA = -150;                          // condensers: rotation from 12 o'clock (lower rear)
  const rot = (y, z, a) => { const c = Math.cos(a * D2R), s = Math.sin(a * D2R); return [r3(y * c - z * s), r3(y * s + z * c)]; }; // -> [y, z]
  const polar = (r, a) => [r3(r * Math.cos(a * D2R)), r3(r * Math.sin(a * D2R))]; // [z, y] at angle a (0 = forward, 90 = up)
  const circ = (r, n = 48, c = [0, 0]) => Array.from({ length: n }, (_, i) => [r3(c[0] + r * Math.cos(i / n * 2 * Math.PI)), r3(c[1] + r * Math.sin(i / n * 2 * Math.PI))]);

  // ---- builders (all in world coordinates) ----
  const latheX = (pts, x0, y = 0, z = 0, mat) => ({ type: "lathe", pts, rot: [0, 0, -90], at: [x0, y, z], ...(mat ? { mat } : {}) });
  const yz = (pts, depth, x0, holes = [], bevel = .3, mat) => ({ type: "extrude", pts: pts.map(p => [r3(-p[0]), p[1]]), holes: holes.map(h => [r3(-h[0]), h[1], h[2]]), depth, bevel, rot: [0, 90, 0], at: [x0, 0, 0], ...(mat ? { mat } : {}) });
  const box = (x, y, z, sx, sy, sz, mat) => ({ type: "box", size: [sx, sy, sz], r: .4, at: [x, y, z], ...(mat ? { mat } : {}) });
  const cylX = (r, x0, len, y, z, mat) => ({ type: "cyl", r, h: len, axis: "x", at: [x0, y, z], ...(mat ? { mat } : {}) });
  const cylZ = (r, z0, len, x, y, mat) => ({ type: "cyl", r, h: len, axis: "z", at: [x, y, z0], ...(mat ? { mat } : {}) });
  const hexX = (af, h, x0, y = 0, z = 0, hole) => ({ type: "hex", af, h, y: 0, ...(hole ? { hole } : {}), rot: [0, 0, -90], at: [x0, y, z] });
  const turn = (a, items) => ({ type: "group", rot: [a, 0, 0], items });   // turn a group about the crank axis
  // pan-head screw lying along X, head outward: head from xh to xh + hh, shank back into the plate
  const panX = (r, len, headR, hh, xh, y, z) => latheX([[0, -len], [r, -len], [r, 0], [headR, 0], [headR, hh * .6], [headR * .8, hh], [0, hh]], xh, y, z);
  const washerX = (ro, ri, h, x0, y, z, split) => latheX(split ? [[ri, 0], [ro, 0], [ro, h], [ri, h]] : [[ri, 0], [ro, 0], [ro, h], [ri, h]], x0, y, z);

  // ---- one set of points, drawn at 12 o'clock above the cam (arm runs front-to-back), then turned into place ----
  // base on the plate, pivot post, arm with fibre heel on the cam, leaf spring, fixed contact, lead terminal
  const PS = [6, 19];                                         // [z, y] of the points screw (12 o'clock layout)
  const pointsSet = a => turn(a, [
    yz([[-9, 11], [15, 11], [15, 16], [9, 24], [-9, 24]], 1.2, XP, [[PS[0], PS[1], 2.2]], .25),  // fixed base with screw hole
    box(XP + 4.4, 12.6, 13.8, 6.4, 2.6, 2, "steel"),           // fixed contact bracket (bent up)
    cylX(1.3, XP + 1.2, 6, 13.8, 12.6, "brass"),               // fixed contact
    cylX(1.7, XP + 1.2, 9.5, 16, -7, "steel"),                 // pivot post
    box(XP + 6.6, 15.8, 2.5, 3, 2.2, 21, "steel"),             // moving arm
    box(XP + 6.6, 12.8, -1, 3, 3.6, 4, "black"),               // fibre heel (rubbing block) on the cam
    cylX(1.3, XP + 4.6, 4, 14.2, 11.6, "brass"),               // moving contact
    box(XP + 6.6, 17.4, -4.5, 2.6, .6, 13, "spring"),          // leaf spring
    cylX(1.6, XP + 1.2, 8.5, 18.2, -12, "brass"),              // spring and lead terminal post
  ]);

  // ---- condensers: two cans side by side on one strap, axes radial, drawn at 12 o'clock then turned ----
  const CS = [0, 33.5];                                       // [z, y] of the condenser screw (12 o'clock layout)
  const condensers = a => turn(a, [
    yz([[-13, 15.5], [13, 15.5], [13, 29.5], [3.2, 29.5], [3.2, 37], [-3.2, 37], [-3.2, 29.5], [-13, 29.5]], 1, XP, [[CS[0], CS[1], 2.2]], .25, "steel"), // strap foot
    ...[-6.5, 6.5].flatMap(z => [
      { type: "cyl", r: 6, h: 13, at: [XP + 7.2, 15.5, z], mat: "dark" },     // can
      { type: "cyl", r: 4.6, h: 1, at: [XP + 7.2, 14.5, z], mat: "black" },   // sealed end
      { type: "cyl", r: .6, h: 4, at: [XP + 7.2, 10.5, z], mat: "brass" }]),  // pigtail lead
    box(XP + 13.6, 22, 0, 1, 5, 25.6, "steel"),                                // strap over the cans
    box(XP + 7.2, 22, 12.9, 13, 5, 1, "steel"), box(XP + 7.2, 22, -12.9, 13, 5, 1, "steel"),
  ]);
  const pA = (p, a) => { const [y, z] = rot(p[1], p[0], a); return [z, y]; };   // [z, y] of a 12 o'clock point after turning
  const ps2 = pA(PS, SA), ps3 = pA(PS, SB), cs = pA(CS, CA);

  // ---- base plate (4) outline: disc with cam hole, three curved timing slots and a grommet notch at the rear ----
  const SCR = [polar(31, 75), polar(31, -15)];                // screws 15 (top and front), through slots
  const GROM = polar(RP, 180);                                // lead grommet at the rear edge
  const lead = [[XP + 3, GROM[1], GROM[0] + 1], [XP - 2, 4, -46], [XP - 8, 8, -62], [XP - 14, 14, -78], [XP - 18, 16, -92]];
  const slot = (p, w = 2.8) => {                         // short curved slot round the crank axis, centred on p ([z, y])
    const r = Math.hypot(p[0], p[1]), a0 = Math.atan2(p[1], p[0]) / D2R, out = [], inn = [];
    for (let i = -6; i <= 6; i++) { const a = a0 + i * 1.6; out.push(polar(r + w, a)); inn.unshift(polar(r - w, a)); }
    return out.concat(inn); };
  const plate4 = { type: "group", items: [
    yz(circ(RP, 64), 2, X12, [[0, 0, 14], ...SCR.map(p => [p[0], p[1], 3.2])], .3),
    ...SCR.map(p => yz(slot(p), .2, XP, [[p[0], p[1], 2.7]], 0, "black")),                      // timing slots (drawn on the face)
    yz(slot(polar(31, 110), 3), .2, XP, [], 0, "black"),                                          // spare slot, top rear
    latheX([[RP - 2.2, 0], [RP, 0], [RP, 1.6], [RP - 2.2, 1.6]], XP),                            // turned-up rim
    turn(65, [box(XP + 3.5, 17.5, 0, 7, 4, 6, "steel"), box(XP + 5.5, 14.2, 0, 4, 2.6, 4.6, "rubber")]),      // cam lubricating felt and holder
    latheX([[14, 0], [16.5, 0], [16.5, .6], [14, .6]], XP),                                       // stiffening ring round the cam hole
    latheX([[3, 0], [5.4, 0], [5.4, 6], [4.6, 7], [3, 7]], XP - 1.5, GROM[1], GROM[0] + 2, "rubber"),   // grommet (turned on X)
    { type: "tube", pts: lead, r: 3.1, mat: "black" },                                                  // lead bundle to the coils
    { type: "tube", pts: [[XP + 9.7, ...rot(18.2, -12, SA)], [XP + 10, 26, -20], [XP + 6, 6, -33], [XP + 3, GROM[1], GROM[0] + 2]], r: .9, mat: "black" },  // lead from upper points
    { type: "tube", pts: [[XP + 9.7, ...rot(18.2, -12, SB)], [XP + 12, -22, 24], [XP + 15, -35, 2], [XP + 15, -30, -22], [XP + 8, -12, -33], [XP + 3, GROM[1], GROM[0] + 2]], r: .9, mat: "black" },  // lead from lower points
  ] };
  // timing plate (12): thin plate behind the base plate, bigger centre hole, two tabs and a notch
  const plate12 = { type: "group", items: [
    yz([...circ(RP + 1, 64).filter(p => !(p[0] < -30 && Math.abs(p[1]) < 10)), ], 1.2, XS, [[0, 0, 17], ...SCR.map(p => [p[0], p[1], 2.8]), [polar(30, 230)[0], polar(30, 230)[1], 2.5]], .2),
  ] };
  // advance unit (11): backing plate, two weights on pins with springs, cam sleeve with one lobe
  const gov = { type: "group", items: [
    latheX([[4.3, 0], [27, 0], [27, 2.5], [4.3, 2.5]], 194),                                            // backing plate
    latheX([[4.3, 0], [7, 0], [7, 6], [4.3, 6]], 188),                                                // boss onto the crank end
    turn(0, [yz([[4, 8], [16, 6], [23, 2], [24.5, 10], [19, 18], [8, 20]], 4.5, 196.5, [], .5)]),        // weight
    turn(180, [yz([[4, 8], [16, 6], [23, 2], [24.5, 10], [19, 18], [8, 20]], 4.5, 196.5, [], .5)]),      // weight
    cylX(2, 196.5, 6.5, 14, 6), cylX(2, 196.5, 6.5, -14, -6),                                            // weight pivot pins
    { type: "spring", R: 1.6, wire: .5, h: 11, turns: 7, rot: [90, 0, 0], at: [199, -13, -5.5], mat: "spring" },
    { type: "spring", R: 1.6, wire: .5, h: 11, turns: 7, rot: [-90, 0, 0], at: [199, 13, 5.5], mat: "spring" },
    latheX([[4.3, 0], [9.5, 0], [9.5, 30.5], [8.6, 31.5], [4.3, 31.5]], 196.5),                                 // cam sleeve
    box(XP + 6.6, 0, 10.8, 9, 6.5, 3.2, "steel"),                                                        // cam lobe (forward at this crank position)
    latheX([[9.5, 0], [11.5, 0], [11.5, 2.5], [9.5, 2.5]], 201),                                          // collar with the drive tongue
  ] };

  const P = (o) => Object.assign({ A: [0, 0, 0] }, o);
  const DY = -95;                                             // plate column hangs below the crank-axis column when exploded
  const parts = [
    P({ id: "gov", ref: "11", name: "Advance governor (with points cam)", mat: "steel", stage: 0, E: [0, 0, 0], dir: [-1, 0, 0], geom: gov }),
    P({ id: "bolt", ref: "13", name: "Contact breaker bolt (8 x 60, through the cam into the crank)", mat: "steel", stage: 1, E: [110, 0, 0], dir: [-1, 0, 0],
      geom: { type: "group", items: [latheX([[0, 0], [3.9, 0], [3.9, 70], [4.2, 70.5], [4.2, 79.6], [0, 79.6]], 150), hexX(12, 6, 229.6)] } }),
    P({ id: "w14", ref: "14", name: "Washer, contact breaker bolt", mat: "zinc", small: true, parent: "bolt", stage: 1, E: [18, 0, 0], dir: [-1, 0, 0],
      geom: washerX(10, 4.3, 1.6, 228, 0, 0) }),
    P({ id: "plate12", ref: "12", name: "Ignition timing plate", mat: "steel", stage: 2, E: [0, DY, 0], dir: [-1, 0, 0], geom: plate12 }),
    P({ id: "plate4", ref: "4", name: "Contact point plate (base plate, with lead and grommet)", mat: "steel", parent: "plate12", stage: 3, E: [32, DY, 0], dir: [-1, 0, 0], geom: plate4 }),
    P({ id: "w16", ref: "16", name: "Washers 5 mm (plate screws)", mat: "zinc", small: true, parent: "plate4", stage: 3, E: [118, DY, 0], dir: [-1, 0, 0], count: 2,
      geom: { type: "group", items: SCR.map(p => washerX(5.2, 2.7, 1, XP, p[1], p[0])) } }),
    P({ id: "s15", ref: "15", name: "Screws 5 x 12 (base plate)", mat: "zinc", small: true, parent: "plate4", stage: 3, E: [140, DY, 0], dir: [-1, 0, 0], count: 2,
      geom: { type: "group", items: SCR.map(p => panX(2.45, 13, 4.4, 3.4, XP + 1, p[1], p[0])) } }),
    P({ id: "pts2", ref: "2", name: "Contact points, lower front set", mat: "steel", parent: "plate4", stage: 4, E: [50, DY, 0], dir: [-1, 0, 0], geom: pointsSet(SB) }),
    P({ id: "pts3", ref: "3", name: "Contact points, upper rear set", mat: "steel", parent: "plate4", stage: 4, E: [50, DY, 0], dir: [-1, 0, 0], geom: pointsSet(SA) }),
    P({ id: "w6", ref: "6", name: "Washers (points screws)", mat: "zinc", small: true, parent: "plate4", stage: 4, E: [70, DY, 0], dir: [-1, 0, 0], count: 2,
      geom: { type: "group", items: [ps2, ps3].map(p => washerX(4.6, 2.1, .8, XP + 1.2, p[1], p[0])) } }),
    P({ id: "lw7", ref: "7", name: "Lock washers (points screws)", mat: "spring", small: true, parent: "plate4", stage: 4, E: [80, DY, 0], dir: [-1, 0, 0], count: 2,
      geom: { type: "group", items: [ps2, ps3].map(p => ({ type: "ring", ro: 3.8, ri: 2.1, h: 1.1, split: true, rot: [0, 0, -90], at: [XP + 2, p[1], p[0]] })) } }),
    P({ id: "s5", ref: "5", name: "Screws (points sets)", mat: "zinc", small: true, parent: "plate4", stage: 4, E: [95, DY, 0], dir: [-1, 0, 0], count: 2,
      geom: { type: "group", items: [ps2, ps3].map(p => panX(1.95, 6, 3.6, 2.6, XP + 3.1, p[1], p[0])) } }),
    P({ id: "cond", ref: "8", name: "Condensers (pair on one strap, one per points set)", mat: "dark", parent: "plate4", stage: 5, E: [50, DY, -80], dir: [-1, 0, 0],
      geom: condensers(CA) }),
    P({ id: "lw10", ref: "10", name: "Lock washer (condenser screw)", mat: "spring", small: true, parent: "cond", stage: 5, E: [68, DY, -80], dir: [-1, 0, 0],
      geom: { type: "group", items: [cs].map(p => ({ type: "ring", ro: 3.8, ri: 2.1, h: 1.1, split: true, rot: [0, 0, -90], at: [XP + 1, p[1], p[0]] })) } }),
    P({ id: "s9", ref: "9", name: "Screw (condenser strap)", mat: "zinc", small: true, parent: "cond", stage: 5, E: [80, DY, -80], dir: [-1, 0, 0],
      geom: { type: "group", items: [cs].map(p => panX(1.95, 6, 3.6, 2.6, XP + 2.1, p[1], p[0])) } }),
    // lead clamps: flat straps round the lead, bolted under nearby engine screws (not part of this page)
    P({ id: "c17", ref: "17", name: "Lead clamp, L 35", mat: "zinc", small: true, parent: "plate4", stage: 6, E: [0, DY - 30, -40], dir: [0, 1, 0],
      geom: { type: "group", items: [{ type: "torus", R: 4.2, r: .7, rot: [90, 0, 0], at: [XP - 5, 6.5, -55] }, box(XP - 5, -2.5, -55, 1.6, 12, 6), cylX(2.6, XP - 6, .2, -7, -55, "dark")] } }),
    P({ id: "c18", ref: "18", name: "Lead clamp", mat: "zinc", small: true, parent: "plate4", stage: 6, E: [0, DY - 30, -45], dir: [0, 1, 0],
      geom: { type: "group", items: [{ type: "torus", R: 4.2, r: .7, rot: [90, 0, 0], at: [XP - 12, 12, -72] }, box(XP - 12, 4, -72, 1.6, 12, 6), cylX(2.6, XP - 13, .2, -.5, -72, "dark")] } }),
    P({ id: "c19", ref: "19", name: "Cable band", mat: "black", small: true, parent: "plate4", stage: 6, E: [0, DY - 30, -50], dir: [0, 1, 0],
      geom: { type: "group", items: [{ type: "torus", R: 3.8, r: .6, rot: [90, 0, 0], at: [XP - 17, 15.6, -88] }, box(XP - 17, 21.5, -88, 2.6, 5, 3.6), box(XP - 17, 21, -80, 1.2, 1.4, 14)] } }),
  ];

  return {
    id: "CMS-BLCK0011", title: "Contact breaker (Kokusan)", units: "mm", page: "BLCK0011", mirrorX: true,
    accuracy: "Approximate geometry. Part identity, numbering and the layout follow the CMSNL contact breaker (Kokusan) page and its picture. Plate, cam, condenser and screw sizes are typical proportions for a 1970s points ignition, not measured from a GS750; only the 5 x 12 plate screws and the 8 x 60 bolt come from the part numbers. Use the factory service manual for every dimension.",
    view: { dir: [-1.25, .55, .75], up: [0, 1, 0] },
    notModelled: "Ref 1 (contact breaker assembly) is the complete plate with points and condensers, so it isn't drawn on its own. Refs 11-2, 13-2 and 14-2 are alternative or later part numbers for the governor, bolt and washer; one of each is drawn. The picture shows two condenser cans on one strap under a single catalogue line (ref 8), so they are drawn as one part held by one screw. The lead and grommet belong to the assembly and are drawn with the base plate. The engine screws that hold the lead clamps belong to other pages.",
    stages: [
      { t: "Advance governor", d: "Fit the governor onto the right end of the crank so its tongue engages the slot. The weights should swing out and spring back freely." },
      { t: "Bolt and washer", d: "Fit the washer on the long bolt and run it through the cam into the crank. Hold the crank while tightening. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Timing plate", d: "Lay the ignition timing plate against its seat in the cover recess, holes lined up." },
      { t: "Base plate", d: "Fit the points base plate over the cam with the lead grommet at the rear, then the two screws and washers. Leave them snug so the plate can turn for timing." },
      { t: "Points sets", d: "Fit both sets of points with their screws, flat washers and lock washers. Put a smear of cam grease on the felt or cam. Point gap: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Condensers", d: "Fit the condenser pair with its screw and lock washer and connect the leads. Then set the timing with a test light and lock the plate screws. Timing marks and settings: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Lead clamps", d: "Route the lead out of the grommet and secure it with the two clamps and the cable band, clear of the chain and hot parts." },
    ],
    parts,
  };
})();
D3_MODELS["CMS-BLCK0011"] = D3_BLCK0011;
