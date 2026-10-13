/* ============ 3D parts model: crankcase, GS750B 1977 (CMSNL BLCK0014) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: the engine frame of the crankshaft and transmission models (DG-EN-02, CMS-BLCK0074): crank axis = X
   (+X toward the right / clutch side), crank axis through the origin, +Y up the cylinder bores (forward tilt ignored), +Z forward.
   The case splits horizontally on the plane Y = 0, through the crank axis. Upper case above, lower case below.
   Main bearing saddles sit where DG-EN-02 puts the main bearings (X = -160, -88, -17, 17, 88 for the roller mains, 183 for the
   right ball bearing). Bore centres X = -124, -52, 52, 124 and the 65 mm bore come from DG-EN-02 as well.
   Gearbox shafts are drawn as bearing saddles only, both on the split plane, countershaft 120 mm and drive shaft 200 mm behind
   the crank. That offset is a guess and does not match the shaft-to-shaft layout of CMS-BLCK0074 exactly.
   Layout, fastener groups and which side each bolt goes in from follow the CMSNL picture for this page (top view of the upper
   case, bottom view of the lower case, and the exploded drawing). Bolt lengths are read from the Suzuki part names
   (e.g. 01517-08908 = 8 x 90). Casting shapes, bolt positions and every other size are APPROXIMATE.
   Every part's geometry is laid out in world coordinates, so every A is [0, 0, 0] and E is the exploded offset. */
const D3_BLCK0014 = (() => {
  const r3 = v => +(+v).toFixed(3);
  const XC = [-124, -52, 52, 124], BORE_R = 36;                   // cylinder spigot openings (65 mm bore + liner)
  const XL = -190, XR = 207;                                        // left and right outer faces of the crank section
  const ZF = 80, ZB = -75, ZG = -250;                               // front face, back of crank section, back of gearbox section
  const GL = -126, GR = 136;                                        // gearbox section side faces
  const CS_Z = -120, DS_Z = -200;                                   // gearbox shaft lines (on the split plane)

  // ---- geometry helpers ----
  const box = (x0, x1, y0, y1, z0, z1, o = {}) => ({ type: "box", size: [x1 - x0, y1 - y0, z1 - z0].map(r3), r: 1, at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2].map(r3), ...o });
  // outline in the Y-Z plane ([y, z] points), pushed out along X from x0 to x1
  const yz = (pts, x0, x1, o = {}) => ({ type: "extrude", pts: pts.map(p => [r3(-p[1]), r3(p[0])]), depth: x1 - x0, bevel: .5, rot: [0, 90, 0], at: [x0, 0, 0], ...o });
  // outline in the X-Z plane ([x, z] points, holes [x, z, r]), pushed up along Y from y0 to y1
  const xz = (pts, holes, y0, y1, o = {}) => ({ type: "extrude", pts: pts.map(p => [r3(p[0]), r3(-p[1])]), holes: holes.map(h => [r3(h[0]), r3(-h[1]), h[2]]), depth: y1 - y0, bevel: .6, rot: [-90, 0, 0], at: [0, y0, 0], ...o });
  // web/wall profile [y, z] from z0 to z1 with half-round notches cut into the edge at yE; body runs to yFar (below or above the edge)
  const notched = (z0, z1, yFar, yE, notches) => {
    const up = yFar > yE, pts = [[yFar, z0], [yFar, z1], [yE, z1]];
    notches.slice().sort((a, b) => b.c - a.c).forEach(({ c, r }) => {
      for (let i = 0; i <= 18; i++) { const t = i / 18 * Math.PI; pts.push([r3(yE + (up ? 1 : -1) * r * Math.sin(t)), r3(c + r * Math.cos(t))]); }
    });
    pts.push([yE, z0]); return pts;
  };
  // half ring round the crank axis on an end face ([y, z] outline), s = +1 upper half, -1 lower half
  const halfRing = (ri, ro, s) => { const pts = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24 * Math.PI; pts.push([r3(s * ro * Math.sin(t)), r3(ro * Math.cos(t))]); }
    for (let i = 24; i >= 0; i--) { const t = i / 24 * Math.PI; pts.push([r3(s * ri * Math.sin(t)), r3(ri * Math.cos(t))]); }
    return pts; };
  const colY = (x, z, y0, y1, r = 7.5) => ({ type: "cyl", r, h: r3(y1 - y0), at: [x, y0, z] });
  const cylX = (r, x0, x1, y, z, o = {}) => ({ type: "cyl", r, h: r3(x1 - x0), axis: "x", at: [x0, y, z], ...o });
  const AF = { 6: 10, 8: 12, 10: 14 }, HH = { 6: 4, 8: 5.5, 10: 6.5 };
  // vertical bolt: head bearing face at hy; s = +1 goes in upward (from below), s = -1 goes in downward (from above)
  const vbolt = (x, z, hy, L, d, s) => {
    const a = s > 0 ? hy : hy - L, b = s > 0 ? hy + L : hy, h = HH[d];
    return { type: "group", at: [x, 0, z], items: [
      { type: "lathe", pts: [[0, a], [d / 2, a], [d / 2, b], [0, b]] },
      { type: "hex", af: AF[d], h, y: s > 0 ? hy - h : hy } ] };
  };
  const vgroup = (list, L, d, s) => ({ type: "group", items: list.map(([x, z, hy]) => vbolt(x, z, hy, L, d, s)) });
  // X-axis pieces, built along local Y then turned so local +Y = world +X (local y value = world x)
  const onX = (items, y, z) => ({ type: "group", items, rot: [0, 0, -90], at: [0, y, z] });
  const RG = (ro, ri, a, b) => ({ type: "lathe", pts: [[ri, a], [ro, a], [ro, b], [ri, b]] });
  // X bolt: head bearing face at hx, shank runs toward s (+1 = +X, -1 = -X)
  const xbolt = (hx, y, z, L, d, s) => { const h = HH[d], tip = hx + s * L;
    return onX([RG(d / 2, 0, Math.min(hx, tip), Math.max(hx, tip)), { type: "hex", af: AF[d], h, y: s > 0 ? hx - h : hx }], y, z); };
  const xwasher = (ro, ri, x0, x1, y, z) => onX([RG(ro, ri, x0, x1)], y, z);
  const xnut = (af, x0, x1, y, z, tab) => onX([{ type: "hex", af, h: x1 - x0 - 1, y: x0 + .5, hole: 5.2 },
    ...(tab ? [{ type: "box", size: [9, x1 - x0 - 1, 12], r: 1.5, at: [-11, (x0 + x1) / 2, 0] }] : [])], y, z);

  // ================= upper case =================
  const outline = [[XL, ZF], [XR, ZF], [XR, ZB], [GR, ZB], [GR, ZG], [GL, ZG], [GL, ZB], [XL, ZB]];
  const boreHoles = XC.map(x => [x, 0, BORE_R]);
  const STUD_X = [-160, -88, -18, 18, 88, 160];
  const studHoles = STUD_X.flatMap(x => [[x, 40, 5.5], [x, -40, 5.5]]);
  const plinthPts = [[-160, 52], [160, 52], [172, 40], [172, -40], [160, -52], [-160, -52], [-172, -40], [-172, 40]];
  const SADDLES = [[-168, -152, 31], [-96, -80, 31], [-25, -9, 31], [9, 25, 31], [80, 96, 31], [174, 193, 36]];

  // ---- bolt positions [x, z, head y] ----
  // from below
  const B13 = [[-170, 86], [-90, 86], [0, 86], [90, 86], [170, 86], [-60, -256], [60, -256], [-132, -240], [142, -85], [142, -165], [142, -240]].map(p => [...p, -25]);
  const B11L = [[-115, -256, -25]];
  const MZ = 44, tipM = 18;
  const B5L = [[-160, MZ], [-160, -MZ]].map(p => [...p, tipM - 90]), B5R = [[183, MZ], [183, -MZ]].map(p => [...p, tipM - 90]);
  const B6L = [[-88, MZ], [-88, -MZ]].map(p => [...p, tipM - 65]), B6R = [[88, MZ], [88, -MZ]].map(p => [...p, tipM - 65]);
  const B7 = [[-17, MZ, -45], [-17, -MZ, -45]], B3 = [[17, MZ, -45], [17, -MZ, -45]];
  // from above
  const B12 = [[-132, -85, 25], [-132, -165, 25]];
  const B11U = [[115, -256, 30]];
  const B10 = [[50, -80, 60], [50, -160, 60], [50, -240, 60], [-60, -160, 60]];
  const B9 = [[100, -165, 70], [100, -240, 70]];
  const B8 = [[110, -80, 80]];
  const B4 = [[-100, -240, 75]];

  const upper = { type: "group", items: [
    xz(outline, boreHoles, 50, 60),                                                    // top plate over crank and gearbox
    xz(plinthPts, [...boreHoles, ...studHoles], 60, 90),                                // cylinder base deck with spigot and stud holes
    box(-11, 11, 90, 90.8, -24, 24, { mat: "dark" }),                                   // cam chain tunnel opening
    box(XL, XR, 0, 50, 68, ZF),                                                         // front wall
    box(XL, XR, 0, 20, ZF, 92),                                                         // front bolt flange
    ...Array.from({ length: 26 }, (_, i) => -180 + i * 15).map(x => box(x - 1.5, x + 1.5, 22, 58, ZF, 90)), // cooling fins
    yz(notched(ZB, ZF, 50, 0, [{ c: 0, r: 25 }]), XL, -174),                             // left end wall, seal bore
    yz(notched(ZB, ZF, 50, 0, [{ c: 0, r: 36 }]), 193, XR),                              // right end wall, ball bearing / seal bore
    box(XL, XR, 0, 50, ZB, -63),                                                        // wall between crank and gearbox
    ...SADDLES.map(([x0, x1, r]) => yz(notched(-63, 68, 50, 0, [{ c: 0, r }]), x0, x1)), // upper main bearing saddles
    yz(notched(ZG, ZB, 50, 0, [{ c: CS_Z, r: 31 }, { c: DS_Z, r: 24 }]), GL, GL + 12),  // gearbox side walls with shaft saddles
    yz(notched(ZG, ZB, 50, 0, [{ c: CS_Z, r: 31 }, { c: DS_Z, r: 24 }]), GR - 12, GR),
    box(GL, GR, 0, 50, ZG, ZG + 12),                                                    // gearbox rear wall
    box(-100, -84, 30, 60, -272, ZG), box(84, 100, 30, 60, -272, ZG),                   // rear upper engine mount ears
    yz(halfRing(25, 46, 1), XL - 6, XL), yz(halfRing(36, 52, 1), XR, XR + 6),            // bosses round the crank bores
    yz(notched(-138, -78, 60, 86, [{ c: -108, r: 22 }]), -110, 10),                      // starter motor cradle behind the cylinders
    cylX(10, XL, -145, 40, 60),                                                         // front left engine mount boss
    // bolt bosses
    ...[...B13.slice(5), ...B11L].map(([x, z]) => colY(x, z, 0, x === -115 ? 38 : 30)),
    ...B12.map(([x, z]) => colY(x, z, 0, 25)), ...B11U.map(([x, z]) => colY(x, z, 0, 30)),
    ...[...B10, ...B9, ...B8].map(([x, z, h]) => colY(x, z, 0, h, 7)), ...B4.map(([x, z, h]) => colY(x, z, 0, h, 8)),
  ] };

  // ================= lower case =================
  const lower = { type: "group", items: [
    box(XL, XR, -100, 0, 68, ZF),                                                       // front wall
    box(XL, XR, -25, 0, ZF, 92),                                                        // front bolt flange
    ...Array.from({ length: 26 }, (_, i) => -180 + i * 15).map(x => box(x - 1.5, x + 1.5, -62, -30, ZF, 88)),
    yz(notched(ZB, ZF, -100, 0, [{ c: 0, r: 25 }]), XL, -174),
    yz(notched(ZB, ZF, -100, 0, [{ c: 0, r: 36 }]), 193, XR),
    box(XL, XR, -100, 0, ZB, -63),
    ...SADDLES.map(([x0, x1, r]) => yz(notched(-63, 68, -45, 0, [{ c: 0, r }]), x0, x1)), // lower main bearing saddles
    yz(notched(ZG, ZB, -100, 0, [{ c: CS_Z, r: 31 }, { c: DS_Z, r: 24 }]), GL, GL + 12),
    yz(notched(ZG, ZB, -100, 0, [{ c: CS_Z, r: 31 }, { c: DS_Z, r: 24 }]), GR - 12, GR),
    box(GL, GR, -100, 0, ZG, ZG + 12),
    box(GL, GR, -100, -90, ZG, ZB),                                                     // gearbox floor
    box(XL, XR, -100, -92, 56, 68), box(XL, GL, -100, -92, -63, -51), box(GR, XR, -100, -92, -63, -51), // oil pan flange lip
    box(-100, -84, -100, -66, ZF, 112), box(84, 100, -100, -66, ZF, 112),               // front lower engine mount ears
    box(-70, -56, -100, -62, -272, ZG), box(56, 70, -100, -62, -272, ZG),                // rear lower engine mount ears
    yz(halfRing(25, 46, -1), XL - 6, XL), yz(halfRing(36, 52, -1), XR, XR + 6),
    box(-60, -30, -12, 0, -80, -58),                                                    // oil passage pad (O-ring 26)
    cylX(10, 160, XR, -50, 60),                                                         // front right engine mount boss
    // bolt bosses
    ...[...B5L, ...B5R, ...B6L, ...B6R].map(([x, z, h]) => colY(x, z, h, -45, 8)),
    ...[...B13.slice(5), ...B11L].map(([x, z]) => colY(x, z, -25, 0)),
    ...[...B12, ...B10, ...B9, ...B8].map(([x, z]) => colY(x, z, -28, 0, 7)), ...B11U.map(([x, z]) => colY(x, z, -33, 0)), ...B4.map(([x, z]) => colY(x, z, -28, 0, 8)),
  ] };

  // ================= small parts on the upper case =================
  const capPts = [[-122, -160], [-112, -171], [-84, -171], [-74, -160], [-84, -149], [-112, -149]];
  const capHoles = [[-112, -160, 3.3], [-84, -160, 3.3]];
  const gasket30 = xz(capPts, capHoles, 60, 61, { bevel: 0 });
  const cap29 = { type: "group", items: [xz(capPts, capHoles, 61, 67), { type: "lathe", pts: [[0, 67], [12, 67], [12, 70], [0, 70]], at: [-98, 0, -160] }] };
  const screw = (x, z, y, L) => ({ type: "group", at: [x, 0, z], items: [
    { type: "lathe", pts: [[0, y - L], [3, y - L], [3, y], [0, y]] },
    { type: "lathe", pts: [[0, y], [5.2, y], [5.2, y + 2.2], [3.6, y + 3.6], [0, y + 3.6]] },
    { type: "box", size: [8, 1, 1], r: .2, at: [0, y + 3.4, 0], mat: "black" } ] });
  const screws31 = { type: "group", items: capHoles.map(([x, z]) => screw(x, z, 67, 16)) };
  // oil pressure switch housing: plate with one bolt ear, spigot down into the case, boss on top for the switch
  const SX = 80, SZ = -120;
  const hsgPts = [[SX - 22, SZ - 12], [SX + 12, SZ - 12], [SX + 24, SZ - 6], [SX + 24, SZ + 6], [SX + 12, SZ + 12], [SX - 22, SZ + 12]];
  const housing32 = { type: "group", items: [
    xz(hsgPts, [[SX + 18, SZ, 3.3]], 61.5, 68),
    { type: "lathe", pts: [[0, 50], [9, 50], [9, 61.5], [0, 61.5]], at: [SX, 0, SZ] },
    { type: "lathe", pts: [[0, 68], [12, 68], [12, 80], [0, 80]], at: [SX, 0, SZ] } ] };
  const oring33 = { type: "torus", R: 10.3, r: 1.2, at: [SX, 61, SZ] };
  const switch36 = { type: "group", at: [SX, 0, SZ], items: [
    { type: "lathe", pts: [[0, 70], [5, 70], [5, 80], [0, 80]] },
    { type: "hex", af: 22, h: 6, y: 81 },
    { type: "lathe", pts: [[0, 87], [10, 87], [10, 92], [7, 98], [0, 98]], mat: "black" },
    { type: "lathe", pts: [[0, 98], [1.8, 98], [1.8, 104], [0, 104]], mat: "brass" } ] };
  const oring37 = { type: "torus", R: 10.35, r: .95, at: [SX, 81, SZ] };
  const gasket35 = { type: "lathe", pts: [[3.1, 68], [6.5, 68], [6.5, 69.5], [3.1, 69.5]], at: [SX + 18, 0, SZ] };
  const bolt34 = vbolt(SX + 18, SZ, 69.5, 20, 6, -1);
  // oil gallery plug in the left end wall
  const plug27 = onX([RG(7, 0, -192, -178), { type: "hex", af: 17, h: 8, y: -200.5 }], 30, -55);
  const gasket28 = xwasher(9.6, 7, -192, -190, 30, -55);
  // starter motor grommet at the end of the cradle
  const grommet38 = onX([RG(16, 8, 10, 20)], 80, -108);

  // ================= engine mounting hardware =================
  const Y14 = 47, Z14 = -261, Y15 = -83, Z15 = 98, Y16 = -81, Z16 = -261;
  const DROP = -260;                                                 // exploded drop of the lower case
  const UPB = 220, B13S = -420, BMS = -520;                         // exploded shifts of the bolt groups (above, below 6 mm, below mains)
  const Z = [0, 0, 0];
  const P = [
    { id: "upper", ref: "1", name: "Upper crankcase (part of the crankcase set)", mat: "alu", shell: true, stage: 0, A: Z, E: Z, dir: [0, -1, 0], geom: upper },
    { id: "pin2", ref: "2", name: "Dowel pins (case halves)", mat: "steel", small: true, parent: "lower", stage: 1, count: 2, A: Z, E: [0, DROP + 40, 0], dir: [0, -1, 0],
      geom: { type: "array", pos: [[-180, -8, 74], [130, -8, -244]], item: { type: "cyl", r: 5, h: 16 } } },
    { id: "oring26", ref: "26", name: "O-ring, oil passage between the halves", mat: "rubber", small: true, parent: "lower", stage: 1, A: Z, E: [0, DROP + 70, 0], dir: [0, -1, 0],
      geom: { type: "torus", R: 8.05, r: 1.6, at: [-45, 0, -69] } },
    { id: "lower", ref: "1", name: "Lower crankcase (part of the crankcase set)", mat: "alu", shell: true, stage: 2, A: Z, E: [0, DROP, 0], dir: [0, 1, 0], geom: lower },
    // crank journal bolts from below
    { id: "b5l", ref: "5", name: "Bolts 8 x 90 (left journal, from below)", mat: "zinc", small: true, stage: 3, count: 2, A: Z, E: [0, BMS, 0], dir: [0, 1, 0], geom: vgroup(B5L, 90, 8, 1) },
    { id: "b6l", ref: "6", name: "Bolts 8 x 65 (journal 1-2, from below)", mat: "zinc", small: true, stage: 3, count: 2, A: Z, E: [0, BMS, 0], dir: [0, 1, 0], geom: vgroup(B6L, 65, 8, 1) },
    { id: "b7", ref: "7", name: "Bolts 8 x 60 (centre left journal, from below)", mat: "zinc", small: true, stage: 3, count: 2, A: Z, E: [0, BMS, 0], dir: [0, 1, 0], geom: vgroup(B7, 60, 8, 1) },
    { id: "b3", ref: "3", name: "Bolts 8 mm (centre right journal, from below)", mat: "zinc", small: true, stage: 3, count: 2, A: Z, E: [0, BMS, 0], dir: [0, 1, 0], geom: vgroup(B3, 60, 8, 1) },
    { id: "b6r", ref: "6", name: "Bolts 8 x 65 (journal 3-4, from below)", mat: "zinc", small: true, stage: 3, count: 2, A: Z, E: [0, BMS, 0], dir: [0, 1, 0], geom: vgroup(B6R, 65, 8, 1) },
    { id: "b5r", ref: "5", name: "Bolts 8 x 90 (right journal, from below)", mat: "zinc", small: true, stage: 3, count: 2, A: Z, E: [0, BMS, 0], dir: [0, 1, 0], geom: vgroup(B5R, 90, 8, 1) },
    // 6 mm bolts from below
    { id: "b13", ref: "13", name: "Bolts 6 x 40 (from below, round the joint)", mat: "zinc", small: true, stage: 4, count: 11, A: Z, E: [0, B13S, 0], dir: [0, 1, 0], geom: vgroup(B13, 40, 6, 1) },
    { id: "b11l", ref: "11", name: "Bolt 6 x 55 (rear left, from below)", mat: "zinc", small: true, stage: 4, A: Z, E: [0, BMS, 0], dir: [0, 1, 0], geom: vgroup(B11L, 55, 6, 1) },
    // bolts from above
    { id: "b12", ref: "12", name: "Bolts 6 x 45 (left side, from above)", mat: "zinc", small: true, stage: 5, count: 2, A: Z, E: [0, UPB, 0], dir: [0, -1, 0], geom: vgroup(B12, 45, 6, -1) },
    { id: "b10", ref: "10", name: "Bolts 6 x 80 (gearbox top, from above)", mat: "zinc", small: true, stage: 5, count: 4, A: Z, E: [0, UPB, 0], dir: [0, -1, 0], geom: vgroup(B10, 80, 6, -1) },
    { id: "b9", ref: "9", name: "Bolts 6 x 90 (gearbox top right, from above)", mat: "zinc", small: true, stage: 5, count: 2, A: Z, E: [0, UPB, 0], dir: [0, -1, 0], geom: vgroup(B9, 90, 6, -1) },
    { id: "b8", ref: "8", name: "Bolt 6 x 100 (behind cylinder 4, from above)", mat: "zinc", small: true, stage: 5, A: Z, E: [0, UPB, 0], dir: [0, -1, 0], geom: vgroup(B8, 100, 6, -1) },
    { id: "b4", ref: "4", name: "Bolt 8 x 95 (gearbox top left, from above)", mat: "zinc", small: true, stage: 5, A: Z, E: [0, UPB, 0], dir: [0, -1, 0], geom: vgroup(B4, 95, 8, -1) },
    { id: "b11u", ref: "11", name: "Bolt 6 x 55 (rear right, from above)", mat: "zinc", small: true, stage: 5, A: Z, E: [0, UPB, 0], dir: [0, -1, 0], geom: vgroup(B11U, 55, 6, -1) },
    // oil gallery
    { id: "gasket30", ref: "30", name: "Oil gallery cap gasket", mat: "brass", small: true, parent: "upper", stage: 6, A: Z, E: [0, 60, 0], dir: [0, -1, 0], geom: gasket30 },
    { id: "cap29", ref: "29", name: "Oil gallery cap", mat: "alu", parent: "upper", stage: 6, A: Z, E: [0, 90, 0], dir: [0, -1, 0], geom: cap29 },
    { id: "screw31", ref: "31", name: "Screws (oil gallery cap)", mat: "zinc", small: true, parent: "cap29", stage: 6, count: 2, A: Z, E: [0, 150, 0], dir: [0, -1, 0], geom: screws31 },
    { id: "gasket28", ref: "28", name: "Gasket 14 x 19.2 x 2 (oil gallery plug)", mat: "brass", small: true, parent: "plug27", stage: 6, A: Z, E: [-30, 0, 0], dir: [1, 0, 0], geom: gasket28 },
    { id: "plug27", ref: "27", name: "Plug 14 x 12 (oil gallery, left end)", mat: "steel", small: true, parent: "upper", stage: 6, A: Z, E: [-60, 0, 0], dir: [1, 0, 0], geom: plug27 },
    // oil pressure switch
    { id: "oring33", ref: "33", name: "O-ring (pressure switch housing)", mat: "rubber", small: true, parent: "hsg32", stage: 7, A: Z, E: [0, 40, 0], dir: [0, -1, 0], geom: oring33 },
    { id: "hsg32", ref: "32", name: "Oil pressure switch housing", mat: "alu", parent: "upper", stage: 7, A: Z, E: [0, 70, 0], dir: [0, -1, 0], geom: housing32 },
    { id: "gasket35", ref: "35", name: "Gasket (housing bolt)", mat: "brass", small: true, parent: "hsg32", stage: 7, A: Z, E: [0, 100, 0], dir: [0, -1, 0], geom: gasket35 },
    { id: "bolt34", ref: "34", name: "Bolt (pressure switch housing)", mat: "zinc", small: true, parent: "hsg32", stage: 7, A: Z, E: [0, 230, 0], dir: [0, -1, 0], geom: bolt34 },
    { id: "oring37", ref: "37", name: "O-ring (oil pressure switch)", mat: "rubber", small: true, parent: "sw36", stage: 7, A: Z, E: [0, 120, 0], dir: [0, -1, 0], geom: oring37 },
    { id: "sw36", ref: "36", name: "Oil pressure switch", mat: "steel", parent: "hsg32", stage: 7, A: Z, E: [0, 150, 0], dir: [0, -1, 0], geom: switch36 },
    { id: "grom38", ref: "38", name: "Starter motor grommet", mat: "rubber", parent: "upper", stage: 8, A: Z, E: [0, 80, 0], dir: [0, -1, 0], geom: grommet38 },
    // engine mounting: rear upper long bolt 14
    { id: "sp24", ref: "24", name: "Engine mount spacer (rear upper, right)", mat: "steel", parent: "upper", stage: 9, A: Z, E: [120, 0, 0], dir: [-1, 0, 0], geom: xwasher(12, 5.2, 100, 115, Y14, Z14) },
    { id: "w22a", ref: "22", name: "Washer (rear upper bolt head)", mat: "steel", small: true, parent: "upper", stage: 9, A: Z, E: [140, 0, 0], dir: [-1, 0, 0], geom: xwasher(10, 5.2, 121, 124, Y14, Z14) },
    { id: "b14", ref: "14", name: "Bolt 10 x 250 (rear upper engine mount)", mat: "zinc", small: true, parent: "upper", stage: 9, A: Z, E: [400, 0, 0], dir: [-1, 0, 0], geom: xbolt(124, Y14, Z14, 250, 10, -1) },
    { id: "w22b", ref: "22", name: "Washer (rear upper nut)", mat: "steel", small: true, parent: "upper", stage: 9, A: Z, E: [-100, 0, 0], dir: [1, 0, 0], geom: xwasher(10, 5.2, -109, -106, Y14, Z14) },
    { id: "n19", ref: "19", name: "Nut (rear upper engine mount)", mat: "zinc", small: true, parent: "upper", stage: 9, A: Z, E: [-130, 0, 0], dir: [1, 0, 0], geom: xnut(14, -117, -109, Y14, Z14) },
    // front lower long bolt 15
    { id: "b15", ref: "15", name: "Bolt 10 x 235 (front lower engine mount)", mat: "zinc", small: true, parent: "lower", stage: 9, A: Z, E: [360, DROP, 0], dir: [-1, 0, 0], geom: xbolt(107, Y15, Z15, 235, 10, -1) },
    { id: "w22c", ref: "22", name: "Washer (front lower nut)", mat: "steel", small: true, parent: "lower", stage: 9, A: Z, E: [-100, DROP, 0], dir: [1, 0, 0], geom: xwasher(10, 5.2, -110, -107, Y15, Z15) },
    { id: "n20a", ref: "20", name: "Nut (front lower engine mount)", mat: "zinc", small: true, parent: "lower", stage: 9, A: Z, E: [-130, DROP, 0], dir: [1, 0, 0], geom: xnut(14, -118, -110, Y15, Z15, true) },
    // rear lower bolt 16
    { id: "w22d", ref: "22", name: "Washer (rear lower bolt head)", mat: "steel", small: true, parent: "lower", stage: 9, A: Z, E: [150, DROP, 0], dir: [-1, 0, 0], geom: xwasher(10, 5.2, 77, 80, Y16, Z16) },
    { id: "b16", ref: "16", name: "Bolt 10 x 160 / 10 x 165 (rear lower engine mount)", mat: "zinc", small: true, parent: "lower", stage: 9, A: Z, E: [320, DROP, 0], dir: [-1, 0, 0], geom: xbolt(80, Y16, Z16, 160, 10, -1) },
    { id: "n20b", ref: "20", name: "Nut (rear lower engine mount)", mat: "zinc", small: true, parent: "lower", stage: 9, A: Z, E: [-150, DROP, 0], dir: [1, 0, 0], geom: xnut(14, -85, -77, Y16, Z16, true) },
    // front upper short bolts 17 (left) and 18 (right)
    { id: "sp25", ref: "25", name: "Spacer 10.2 x 24 x 11 (front left mount)", mat: "steel", parent: "upper", stage: 9, A: Z, E: [-40, 0, 0], dir: [1, 0, 0], geom: xwasher(12, 5.1, -201, XL, 40, 60) },
    { id: "w21a", ref: "21", name: "Washer 10.5 x 20 x 3.2 (front left mount)", mat: "steel", small: true, parent: "upper", stage: 9, A: Z, E: [-60, 0, 0], dir: [1, 0, 0], geom: xwasher(10, 5.25, -210.2, -207, 40, 60) },
    { id: "lw23a", ref: "23", name: "Lock washer (front left mount)", mat: "spring", small: true, parent: "upper", stage: 9, A: Z, E: [-75, 0, 0], dir: [1, 0, 0], geom: xwasher(8.6, 5.2, -212.2, -210.2, 40, 60) },
    { id: "b17", ref: "17", name: "Bolt 10 x 65 (front left engine mount)", mat: "zinc", small: true, parent: "upper", stage: 9, A: Z, E: [-170, 0, 0], dir: [1, 0, 0], geom: xbolt(-212.2, 40, 60, 65, 10, 1) },
    { id: "w21b", ref: "21", name: "Washer 10.5 x 20 x 3.2 (front right mount)", mat: "steel", small: true, parent: "lower", stage: 9, A: Z, E: [40, DROP, 0], dir: [-1, 0, 0], geom: xwasher(10, 5.25, 213, 216.2, -50, 60) },
    { id: "lw23b", ref: "23", name: "Lock washer (front right mount)", mat: "spring", small: true, parent: "lower", stage: 9, A: Z, E: [55, DROP, 0], dir: [-1, 0, 0], geom: xwasher(8.6, 5.2, 216.2, 218.2, -50, 60) },
    { id: "b18", ref: "18", name: "Bolt 10 x 55 (front right engine mount)", mat: "zinc", small: true, parent: "lower", stage: 9, A: Z, E: [120, DROP, 0], dir: [-1, 0, 0], geom: xbolt(218.2, -50, 60, 55, 10, -1) },
  ];

  return {
    id: "CMS-BLCK0014", title: "Crankcase", units: "mm", page: "BLCK0014",
    accuracy: "Approximate geometry. Part identity, numbering, which side each bolt goes in from and the rough bolt layout follow the CMSNL crankcase picture; bolt sizes come from the Suzuki part names. Bore spacing and main bearing positions match the crankshaft model. The casting shapes, wall thicknesses, bolt positions, gearbox shaft positions and engine mount positions are approximate, not measured from a GS750. Use the factory service manual for every dimension and the bolt tightening order.",
    view: { dir: [.95, .78, 1.15], up: [0, 1, 0] },
    notModelled: "Ref 1 (crankcase set) is the matched pair of upper and lower halves, so it is drawn as two parts that share ref 1. Refs 16-1 and 16-2 are two lengths of the same rear lower bolt; one is drawn. Ref 11 is used twice in the picture, once from above and once from below, so two bolts carry ref 11. Ref 6 is drawn as four bolts (two per journal at journals 1-2 and 3-4); the picture labels three, so one of them may really be a ref 7 or ref 3 bolt. Which journal takes refs 3 and 7 is a guess. The crankshaft, transmission, studs, oil pan and engine hanger plates are on other pages and are not drawn.",
    stages: [
      { t: "Dowel pins and O-ring", d: "Clean both joint faces. Fit the two dowel pins and a new O-ring on the oil passage in the lower case." },
      { t: "Close the case", d: "With the crank and gearbox laid in the upper case (upside down on the bench), put sealant on the joint face and lower the lower case on. Sealant type: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Crank journal bolts", d: "Fit the 8 mm journal bolts from underneath. Tighten them a little at a time in the number order cast next to each bolt. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "6 mm bolts from below", d: "Fit the 6 mm bolts round the joint from underneath and snug them down evenly." },
      { t: "Bolts from above", d: "Turn the engine upright and fit the bolts that go down through the upper case. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Oil gallery cap and plug", d: "Fit the oil gallery cap on a new gasket with its two screws, and the plug with a new gasket in the left end of the case." },
      { t: "Oil pressure switch", d: "Put a new O-ring on the housing spigot and bolt the housing down with its sealing gasket under the bolt head. Fit the switch with its O-ring." },
      { t: "Starter grommet", d: "Push the rubber grommet onto the end of the starter motor cradle." },
      { t: "Engine mounting", d: "With the engine in the frame, fit the long bolts through the mounting lugs with their spacers, washers and nuts, then the two short front bolts. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    ],
    parts: P,
  };
})();
D3_MODELS["CMS-BLCK0014"] = D3_BLCK0014;
