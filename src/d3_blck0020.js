/* ============ 3D parts model: electrical parts under the seat and ignition coils, GS750B 1977 (CMSNL BLCK0020) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: +X = rider's RIGHT, +Y up, +Z forward (engine-model frame), so the model sets mirrorX: true.
   Origin = bottom rear corner of the inner face of the electrical parts plate (ref 21). The plate stands upright on the
   right side under the seat (the CMSNL picture shows the parts facing out with the front to the right); its outer face
   is at X = 2 and everything on it bolts on from the right (outside). The bike centre line is taken at about X = -100.
   The two ignition coils (refs 23, 24) hang under the frame top tubes, under the tank, further forward and higher up.
   Parts in the lower group are drawn directly in world coordinates (A = [0, 0, 0]); E is then just the exploded offset.
   The coils carry their own local frame (origin = centre of the low-tension end, coil axis along +X).
   Identity, numbering and layout: CMSNL electrical page (refs 1-32) and its picture.
   Geometry: APPROXIMATE. Box sizes, plate outline, lead routing and fuse positions are typical for a 1970s Suzuki and are
   not measured from a GS750. The frame brackets the plate and coils bolt to are on the frame page and are not drawn.
   Screw sizes in the names come from the Suzuki part numbers (02112-06108 = 6 x 10 and so on). */
(() => {
  const r1 = v => +v.toFixed(2);
  // pan-head cross screw, origin = underside of the head; down = shank points -Y, side = shank points -X
  const screwV = (R, h, r, len) => ({ type: "group", items: [
    { type: "lathe", pts: [[0, -len], [r - .3, -len], [r, -len + .5], [r, 0], [R, 0], [R, h * .55], [R * .72, h], [0, h]] },
    { type: "box", size: [R * 1.15, .8, 1.1], r: .2, at: [0, h + .05, 0], mat: "black" },
    { type: "box", size: [1.1, .8, R * 1.15], r: .2, at: [0, h + .05, 0], mat: "black" } ] });
  const screwX = (c, R, h, r, len) => Object.assign(screwV(R, h, r, len), { rot: [0, 0, -90], at: c });
  const screwDown = (c, R, h, r, len) => Object.assign(screwV(R, h, r, len), { at: c });
  // flat washer / lock washer lying on a face that looks along +X (origin = its back face)
  const washX = (c, ro, ri, h) => ({ type: "ringX", ro, ri, h, at: c });
  // glass fuse: 30 long, axis along Z (centre at c) or along Y
  const fuse = (c, axis) => ({ type: "group", rot: axis === "y" ? [-90, 0, 0] : [0, 0, 0], at: c, items: [
    { type: "cyl", r: 3.2, h: 6, axis: "z", at: [0, 0, -15], mat: "chrome" },
    { type: "cyl", r: 2.8, h: 18, axis: "z", at: [0, 0, -9], mat: "alu" },
    { type: "cyl", r: .5, h: 18, axis: "z", at: [0, 0, -9], mat: "dark" },
    { type: "cyl", r: 3.2, h: 6, axis: "z", at: [0, 0, 9], mat: "chrome" } ] });
  // ring terminal (eyelet) lying flat on a stud that points +Y, barrel toward yaw degrees (0 = +Z, 90 = +X)
  const eyelet = (c, yaw) => ({ type: "group", rot: [0, yaw, 0], at: c, mat: "brass", items: [
    { type: "ring", ro: 6.5, ri: 3.2, h: 1.2 },
    { type: "cyl", r: 3.4, h: 10, axis: "z", at: [0, .6, 6] } ] });
  const bEnd = (c, yaw) => { const a = yaw * Math.PI / 180; return [r1(c[0] + 16 * Math.sin(a)), r1(c[1] + .6), r1(c[2] + 16 * Math.cos(a))]; };

  // ---- key positions (world) ----
  const PY = 60;                                   // top of the relay terminal bosses
  const POST5 = [24, PY, -15], POST32 = [44, PY, -15];
  const SCR2 = [34, 12.5, -41.5];                  // relay mounting screw, top of the relay ear
  const REG = [[-142, 47.5], [-58, 47.5]];         // regulator screw holes (z, y)
  const RECT = [-100, 150];                        // rectifier centre screw (z, y)
  const FBX = [40, 152.5];                         // fuse box ear screw (z, y)
  const TRM = [43.5, 42];                          // terminal block ear screw (z, y)
  const C23 = [-62, 320, 250], C24 = [-136, 320, 250]; // ignition coils: centre of the low-tension (rear) end
  // coil local point (axis along local +X) -> world; the coil is turned so its axis runs forward (+Z)
  const CW = (C, l) => [r1(C[0] - l[2]), r1(C[1] + l[1]), r1(C[2] + l[0])];

  // ignition coil, axis along +X; s = which way its leads lean (-1 rear, +1 front)
  const coil = s => ({ type: "group", rot: [0, -90, 0], items: [
    { type: "lathe", rot: [0, 0, -90], pts: [[0, 0], [21, 0], [24.5, 3], [27, 8], [27, 102], [24.5, 107], [21, 110], [0, 110]] },
    { type: "torus", R: 27.4, r: 1.4, rot: [0, 0, 90], at: [20, 0, 0], mat: "steel" },
    { type: "torus", R: 27.4, r: 1.4, rot: [0, 0, 90], at: [90, 0, 0], mat: "steel" },
    { type: "cyl", r: 10, h: 8, axis: "x", at: [-8, 0, 0], mat: "rubber" },
    { type: "pair", at: [[110, 0, -11], [110, 0, 11]], item: { type: "cyl", r: 7, r2: 5.5, h: 14, axis: "x", mat: "rubber" } },
    { type: "pair", at: [[8, 28.5, 0], [102, 28.5, 0]], item: { type: "box", size: [16, 3, 34], r: .8, mat: "steel" } },
    { type: "pair", at: [[8, 30, 0], [102, 30, 0]], item: { type: "cyl", r: 3, h: 20, mat: "steel" } },
    ...[-11, 11].map(z => ({ type: "tube", r: 3.5, mat: "rubber", pts: [[122, 0, z], [146, -6, z + s * 4], [164, -50, z + s * 10], [162, -110, z + s * 16], [158, -130, z + s * 18]] })),
    ...[-4, 4].map(z => ({ type: "tube", r: 1.6, mat: "dark", pts: [[-7, 0, z], [-18, 11, z], [-40, 14, z], [-64, 8, z]] })),
    { type: "pair", at: [[-66, 8, -4], [-66, 8, 4]], item: { type: "cyl", r: 2.4, h: 10, axis: "x", mat: "brass", at: [-8, 0, 0] } } ] });

  const M = {
    id: "CMS-BLCK0020", title: "Electrical parts (under seat and coils)", units: "mm", page: "BLCK0020",
    accuracy: "Approximate geometry. Part identity, numbering and the layout follow the CMSNL electrical page and its picture. Every size, the plate outline, the lead routing and the number of fuses in each holder are typical proportions for a 1970s Suzuki, not measured from a GS750. Use the factory service manual and wiring diagram for any dimension, routing, fuse rating or torque.",
    mirrorX: true,
    view: { dir: [-1.25, .7, .55], up: [0, 1, 0] },
    lockView: true,
    notModelled: "All 32 refs are drawn (variants 5-1/5-2, 7-1/7-2/7-3, 20-1/20-2, 23-1/23-2 and 24-1/24-2 are the same part in different years, so each is drawn once). There is no turn signal relay or grommet on this page, so none is drawn. The frame brackets the plate and the coils bolt to, the fuse box lid and the plug caps are not on this page and are not drawn.",
    stages: [
      { t: "Relay holder", d: "Fit the relay holder to the electrical parts plate. The plate itself stays bolted to the frame under the seat." },
      { t: "Regulator", d: "Put the regulator on the plate, lay the clamp over the rear ear around the regulator lead, and fit both screws." },
      { t: "Rectifier", d: "Put the rectifier on the plate and fit the long screw with its lock washer through the middle." },
      { t: "Fuse box", d: "Screw the fuse box to the plate with its washer, then press the fuses into the clips. Fuse ratings: VERIFY IN FACTORY SERVICE MANUAL and the wiring diagram." },
      { t: "Power source terminal", d: "Fit the terminal block with the flat washer, lock washer and screw, then push its 10 A fuse into the clips." },
      { t: "Main fuse holder", d: "Lay the in-line fuse holder against the plate and clip the 15 A fuse into it." },
      { t: "Starter relay", d: "Set the relay on its holder. Put the earth wire's ring terminal on the ear and fit the screw through both." },
      { t: "Relay leads", d: "Fit the starter motor lead and the power lead on the relay studs with a lock washer and nut each. Push the rubber cap over the starter lead terminal. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Ignition coils", d: "Offer both coils up under the frame so the studs go through the bracket. Route the high tension leads down to the plugs." },
      { t: "Coil nuts and clamp", d: "Hook the clamp around the coil wires and over the rear stud of the left-hand coil, then fit all four nuts." },
    ],
    parts: [
      // ---------- base: electrical parts plate ----------
      { id: "plate", shell: true, ref: "21", name: "Electrical parts plate (holder 21)", mat: "black", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [-1, 0, 0],
        geom: { type: "group", items: [
          { type: "extrude", rot: [0, 90, 0], depth: 2, bevel: .3,
            pts: [[-140, 8], [-132, 0], [142, 0], [150, 8], [150, 192], [142, 200], [-132, 200], [-140, 192]],
            holes: [[RECT[0] * -1, RECT[1], 3.3], [-FBX[0], FBX[1], 3.3], [-TRM[0], TRM[1], 3.3], ...REG.map(([z, y]) => [-z, y, 3.3]), [10, 160, 13], [-60, 175, 6]] },
          ...[[100, 136], [-146, -110]].map(([z0, z1]) => ({ type: "extrude", rot: [90, 0, 0], at: [0, 200, 0], depth: 2, bevel: .3,
            pts: [[-30, z0], [0, z0], [0, z1], [-30, z1]], holes: [[-17, (z0 + z1) / 2, 4.2]] })) ] } },
      { id: "holder20", ref: "20", name: "Starter relay holder (holder 20)", mat: "black", parent: "plate", stage: 1, A: [0, 0, 0], E: [70, -40, 0], dir: [-1, 0, 0],
        geom: { type: "extrude", at: [0, 0, -45], depth: 60, bevel: .3, pts: [[2, 8], [64, 8], [64, 10], [4.5, 10], [4.5, 62], [2, 62]] } },

      // ---------- regulator ----------
      { id: "reg", ref: "7", name: "Regulator", mat: "dark", parent: "plate", stage: 2, A: [0, 0, 0], E: [120, -60, 0], dir: [-1, 0, 0],
        geom: { type: "group", items: [
          { type: "box", size: [3, 25, 96], r: .8, at: [3.5, 47.5, -100], mat: "steel" },
          { type: "extrude", at: [0, 0, -132], depth: 64, bevel: 1, pts: [[5, 22], [31, 26], [33, 30], [33, 64], [31, 68], [5, 72]] },
          ...[-120, -110, -100, -90, -80].map(z => ({ type: "box", size: [2, 36, 3], r: .4, at: [34, 47, z] })),
          { type: "tube", r: 3, mat: "rubber", pts: [[20, 23, -118], [15, 13, -128], [9, 8, -142], [9, 8, -162], [12, 10, -174]] },
          { type: "box", size: [12, 12, 14], r: 1.5, at: [12, 10, -180], mat: "rubber" } ] } },
      { id: "clamp9", ref: "9", name: "Clamp (regulator lead)", mat: "steel", small: true, parent: "reg", stage: 2, A: [0, 0, 0], E: [150, -80, -40], dir: [-1, 0, 0],
        geom: { type: "group", items: [
          { type: "extrude", rot: [0, 90, 0], at: [5, 0, 0], depth: 1.2, bevel: 0, pts: [[137, 13], [147, 13], [147, 54], [137, 54]], holes: [[142, 47.5, 3.3]] },
          { type: "clip", R: 4.5, r: .7, gap: 1.2, rot: [0, 0, 90], at: [9, 8, -142] } ] } },
      { id: "screws8", ref: "8", name: "Screws 6 x 10 (regulator)", mat: "zinc", small: true, parent: "reg", stage: 2, A: [0, 0, 0], E: [200, -60, 0], dir: [-1, 0, 0], count: 2,
        geom: { type: "group", items: [screwX([6.2, REG[0][1], REG[0][0]], 5.5, 3.6, 3, 10), screwX([5, REG[1][1], REG[1][0]], 5.5, 3.6, 3, 10)] } },

      // ---------- rectifier ----------
      { id: "rect", ref: "17", name: "Rectifier", mat: "alu", parent: "plate", stage: 3, A: [0, 0, 0], E: [120, 40, 0], dir: [-1, 0, 0],
        geom: { type: "group", items: [
          { type: "box", size: [6, 70, 70], r: 1.2, at: [5, RECT[1], RECT[0]] },
          ...[-30, -22.5, -15, 15, 22.5, 30].map(dz => ({ type: "box", size: [14, 64, 2.4], r: .4, at: [15, RECT[1], RECT[0] + dz] })),
          ...[-7.5, 7.5].map(dz => ({ type: "box", size: [14, 22, 2.4], r: .4, at: [15, RECT[1] + (dz > 0 ? 21 : -21), RECT[0] + dz] })),
          { type: "cyl", r: 8, h: 14, axis: "x", at: [8, RECT[1], RECT[0]] },
          { type: "tube", r: 2.2, mat: "rubber", pts: [[6, 116, -80], [8, 104, -74], [12, 94, -62], [14, 92, -56]] },
          { type: "box", size: [10, 8, 9], r: 1, at: [14, 92, -52], mat: "rubber" } ] } },
      { id: "lw19", ref: "19", name: "Lock washer (rectifier)", mat: "spring", small: true, parent: "rect", stage: 3, A: [0, 0, 0], E: [170, 40, 0], dir: [-1, 0, 0],
        geom: washX([22, RECT[1], RECT[0]], 5.6, 3.2, 1.6) },
      { id: "screw18", ref: "18", name: "Screw 6 x 25 (rectifier)", mat: "zinc", small: true, parent: "rect", stage: 3, A: [0, 0, 0], E: [215, 40, 0], dir: [-1, 0, 0],
        geom: screwX([23.6, RECT[1], RECT[0]], 5.5, 3.6, 3, 25) },

      // ---------- fuse box ----------
      { id: "fbox", ref: "12", name: "Fuse box", mat: "black", parent: "plate", stage: 4, A: [0, 0, 0], E: [110, 60, 40], dir: [-1, 0, 0],
        geom: { type: "group", items: [
          { type: "box", size: [18, 65, 46], r: 2, at: [11, 152.5, 75] },
          { type: "box", size: [3, 25, 22], r: .8, at: [3.5, 152.5, 41] },
          ...[132, 145, 158, 171].flatMap(y => [61, 89].map(z => ({ type: "box", size: [4, 8, 5], r: .5, at: [22, y, z], mat: "brass" }))),
          { type: "tube", r: 4, mat: "rubber", pts: [[11, 184, 70], [11, 200, 68], [0, 214, 60], [-20, 218, 55]] } ] } },
      { id: "fuse13", ref: "13", name: "Fuses 10 A (fuse box)", mat: "alu", small: true, parent: "fbox", stage: 4, A: [0, 0, 0], E: [150, 60, 100], dir: [-1, 0, 0], count: 3,
        geom: { type: "group", items: [132, 145, 158].map(y => fuse([25, y, 75])) } },
      { id: "fuse14", ref: "14", name: "Fuse 15 A (fuse box)", mat: "alu", small: true, parent: "fbox", stage: 4, A: [0, 0, 0], E: [150, 80, 100], dir: [-1, 0, 0],
        geom: fuse([25, 171, 75]) },
      { id: "w16", ref: "16", name: "Washer (fuse box)", mat: "zinc", small: true, parent: "fbox", stage: 4, A: [0, 0, 0], E: [150, 60, 40], dir: [-1, 0, 0],
        geom: washX([5, FBX[1], FBX[0]], 6.5, 3.2, 1.5) },
      { id: "screw15", ref: "15", name: "Screw 6 x 12 (fuse box)", mat: "zinc", small: true, parent: "fbox", stage: 4, A: [0, 0, 0], E: [190, 60, 40], dir: [-1, 0, 0],
        geom: screwX([6.5, FBX[1], FBX[0]], 5.5, 3.6, 3, 12) },

      // ---------- power source terminal ----------
      { id: "term", ref: "27", name: "Power source terminal block", mat: "black", parent: "plate", stage: 5, A: [0, 0, 0], E: [110, -70, 40], dir: [-1, 0, 0],
        geom: { type: "group", items: [
          { type: "box", size: [20, 55, 46], r: 4, at: [12, 42.5, 75] },
          { type: "box", size: [3, 24, 17], r: .8, at: [3.5, 42, 43.5] },
          ...[61, 89].map(z => ({ type: "box", size: [4, 8, 5], r: .5, at: [24, 42.5, z], mat: "brass" })),
          { type: "tube", r: 3, mat: "rubber", pts: [[12, 16, 75], [12, 2, 80], [16, -18, 90], [18, -30, 96]] } ] } },
      { id: "fuse28", ref: "28", name: "Fuse 10 A (terminal block)", mat: "alu", small: true, parent: "term", stage: 5, A: [0, 0, 0], E: [150, -70, 100], dir: [-1, 0, 0],
        geom: fuse([27, 42.5, 75]) },
      { id: "w31", ref: "31", name: "Washer (terminal block)", mat: "zinc", small: true, parent: "term", stage: 5, A: [0, 0, 0], E: [140, -70, 40], dir: [-1, 0, 0],
        geom: washX([5, TRM[1], TRM[0]], 6.5, 3.2, 1.5) },
      { id: "lw30", ref: "30", name: "Lock washer (terminal block)", mat: "spring", small: true, parent: "term", stage: 5, A: [0, 0, 0], E: [165, -70, 40], dir: [-1, 0, 0],
        geom: washX([6.5, TRM[1], TRM[0]], 5.6, 3.2, 1.8) },
      { id: "screw29", ref: "29", name: "Screw 6 x 16 (terminal block)", mat: "zinc", small: true, parent: "term", stage: 5, A: [0, 0, 0], E: [200, -70, 40], dir: [-1, 0, 0],
        geom: screwX([8.3, TRM[1], TRM[0]], 5.5, 3.6, 3, 16) },

      // ---------- in-line main fuse ----------
      { id: "ifuse", ref: "10", name: "In-line fuse holder", mat: "black", parent: "plate", stage: 6, A: [0, 0, 0], E: [90, 30, 30], dir: [-1, 0, 0],
        geom: { type: "group", items: [
          { type: "box", size: [8, 50, 16], r: 2, at: [6, 50, 22] },
          ...[33, 67].map(y => ({ type: "box", size: [4, 6, 8], r: .5, at: [12, y, 22], mat: "brass" })),
          { type: "tube", r: 2.4, mat: "rubber", pts: [[6, 74, 22], [6, 92, 22], [9, 106, 28], [12, 112, 32]] },
          { type: "tube", r: 2.4, mat: "rubber", pts: [[6, 26, 22], [6, 6, 24], [10, -10, 30], [12, -18, 34]] } ] } },
      { id: "fuse11", ref: "11", name: "Fuse 15 A (main)", mat: "alu", small: true, parent: "ifuse", stage: 6, A: [0, 0, 0], E: [130, 30, 30], dir: [-1, 0, 0],
        geom: fuse([14.5, 50, 22], "y") },

      // ---------- starter relay ----------
      { id: "relay", ref: "1", name: "Starter relay", mat: "dark", parent: "holder20", stage: 7, A: [0, 0, 0], E: [130, 80, 0], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "box", size: [44, 44, 46], r: 3, at: [34, 32, -15] },
          { type: "box", size: [20, 2.5, 10], r: .6, at: [34, 11.25, -42], mat: "steel" },
          ...[POST5, POST32].flatMap(p => [
            { type: "cyl", r: 7, h: 6, at: [p[0], 54, p[2]], mat: "black" },
            { type: "cyl", r: 3, h: 18, at: [p[0], PY, p[2]], mat: "brass" } ]),
          ...[-3, 3].map(dx => ({ type: "tube", r: 1.4, mat: "dark", pts: [[44 + dx, 22, 8], [46 + dx, 16, 20], [46 + dx, 13, 30]] })),
          { type: "box", size: [12, 8, 8], r: 1, at: [46, 13, 34], mat: "black" } ] } },
      { id: "wire22", ref: "22", name: "Earth wire (relay)", mat: "rubber", parent: "relay", stage: 7, A: [0, 0, 0], E: [170, 60, -10], dir: [0, -1, 0],
        geom: { type: "group", items: [eyelet(SCR2, 90),
          { type: "tube", r: 2, pts: [bEnd(SCR2, 90), [60, 14, -41.5], [72, 6, -32], [76, -24, -22], [76, -34, -20]] },
          { type: "cyl", r: 2.6, h: 10, at: [76, -44, -20], mat: "brass" } ] } },
      { id: "screw2", ref: "2", name: "Screw 6 x 10 (relay)", mat: "zinc", small: true, parent: "relay", stage: 7, A: [0, 0, 0], E: [130, 150, -45], dir: [0, -1, 0],
        geom: screwDown([SCR2[0], SCR2[1] + 1.2, SCR2[2]], 5.5, 3.6, 3, 10) },

      // ---------- relay leads ----------
      { id: "lead5", ref: "5", name: "Starter motor lead", mat: "rubber", parent: "relay", stage: 8, A: [0, 0, 0], E: [260, 120, -60], dir: [0, -1, 0],
        geom: { type: "group", items: [eyelet(POST5, 180),
          { type: "tube", r: 4, pts: [bEnd(POST5, 180), [24, 62, -48], [26, 38, -58], [32, 0, -62], [42, -40, -60], [50, -78, -50]] },
          Object.assign(eyelet([52, -96, -46], 160), { rot: [90, 160, 0] }) ] } },
      { id: "lead32", ref: "32", name: "Power source lead", mat: "rubber", parent: "relay", stage: 8, A: [0, 0, 0], E: [180, 150, 60], dir: [0, -1, 0],
        geom: { type: "group", items: [eyelet(POST32, 0),
          { type: "tube", r: 3.6, pts: [bEnd(POST32, 0), [44, 63, 22], [46, 72, 44], [46, 82, 90], [42, 92, 128]] },
          Object.assign(eyelet([41, 95, 146], 0), { rot: [-20, 0, 0] }) ] } },
      { id: "lw4", ref: "4", name: "Lock washers (relay studs)", mat: "spring", small: true, parent: "relay", stage: 8, A: [0, 0, 0], E: [130, 190, 0], dir: [0, -1, 0], count: 2,
        geom: { type: "pair", at: [[POST5[0], PY + 1.2, POST5[2]], [POST32[0], PY + 1.2, POST32[2]]], item: { type: "ring", ro: 5.6, ri: 3.1, h: 1.8, split: true } } },
      { id: "nut3", ref: "3", name: "Nuts 6 mm (relay studs)", mat: "zinc", small: true, parent: "relay", stage: 8, A: [0, 0, 0], E: [130, 215, 0], dir: [0, -1, 0], count: 2,
        geom: { type: "pair", at: [[POST5[0], PY + 3, POST5[2]], [POST32[0], PY + 3, POST32[2]]], item: { type: "hex", af: 10, h: 5, hole: 3 } } },
      { id: "cap6", ref: "6", name: "Rubber cap (starter relay terminal)", mat: "rubber", parent: "relay", stage: 8, A: [0, 0, 0], E: [130, 250, 0], dir: [0, -1, 0],
        geom: { type: "lathe", at: [POST5[0], 0, POST5[2]], pts: [[7.6, 56], [9.2, 56], [9.2, 80], [6, 86], [0, 86], [0, 84.4], [5.2, 84.4], [7.6, 79]] } },

      // ---------- ignition coils ----------
      { id: "coil23", ref: "23", name: "Ignition coil (cylinders 1 and 4)", mat: "black", stage: 9, A: C23, E: [-10, 190, 230], dir: [0, 1, 0],
        geom: coil(-1) },
      { id: "coil24", ref: "24", name: "Ignition coil (cylinders 2 and 3)", mat: "black", stage: 9, A: C24, E: [-190, 220, 270], dir: [0, 1, 0],
        geom: coil(1) },
      { id: "clamp26", ref: "26", name: "Clamp (coil wires)", mat: "steel", small: true, parent: "coil24", stage: 10, A: [0, 0, 0], E: [0, 70, 0], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "ring", ro: 6, ri: 3.2, h: 1.2, at: CW(C24, [8, 30, 0]) },
          { type: "tube", r: 1, pts: [CW(C24, [2, 30.6, 0]), CW(C24, [-8, 28, 0]), CW(C24, [-16, 21, 0])] },
          { type: "clip", R: 8, r: 1, gap: 1.4, rot: [90, 0, 0], at: CW(C24, [-20, 12, 0]) } ] } },
      { id: "nut25", ref: "25", name: "Nuts (coil studs)", mat: "zinc", small: true, parent: "coil23", stage: 10, A: [0, 0, 0], E: [0, 130, 0], dir: [0, -1, 0], count: 4,
        geom: { type: "array", pos: [CW(C23, [8, 30, 0]), CW(C23, [102, 30, 0]), CW(C24, [8, 31.2, 0]), CW(C24, [102, 30, 0])],
          item: { type: "hex", af: 10, h: 5, hole: 3 } } },
    ],
  };
  D3_MODELS["CMS-BLCK0020"] = M;
})();
