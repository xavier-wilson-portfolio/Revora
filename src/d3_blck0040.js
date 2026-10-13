/* ============ 3D parts model: gear shifting (shift drum, forks, shift shaft), GS750B 1977 (CMSNL BLCK0040) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: the same engine frame as the transmission model (CMS-BLCK0074): +X toward the right (clutch) side, +Y up,
   +Z forward. Countershaft on the line Y = 0, Z = 0; drive shaft at Y = -30, Z = -56. Neither shaft is drawn here.
   The shift forks sit in the fork grooves of the three sliding gears of that model: 3rd drive gear on the countershaft
   (groove centre X = -32), 4th driven gear (X = -58) and 5th driven gear (X = -6) on the drive shaft.
   Layout chosen here (a best guess, not measured): shift drum (gear shift cam) along X under and between the shafts at
   Y = -85, Z = 5. Two fork shafts: one ahead of and above the drum for the countershaft fork, one behind it for the two
   drive shaft forks. Gear shift shaft along X behind and below the drum at Y = -120, Z = -45, coming out of the left case
   behind and below the engine sprocket, with the pedal on the left end and the shift arm on the right end.
   Right end of the drum, outward: shim washer, needle bearing (in the case wall), cam stopper plate on two dowel pins,
   the cam stopper arm, the pawl guide (screwed to the case) round the pawl lifter, the lifter with its two pawls, then the
   retainer and its centre screw. The shift arm drives a peg on the lifter. Left end: neutral contact pin and spring in the
   drum, neutral switch base on the case. The second cam stopper is a spring plunger in a plug screwed up into the lower case.
   The cam tracks are drawn as plain ring grooves; the real tracks step sideways to move each fork from gear to gear.
   Geometry: APPROXIMATE. Sizes from the catalogue: washer 40 x 45 x 1, bearing 25 x 32 x 12, plug gasket 14 x 19.2 x 2,
   O-ring ID 26.2 section 2.4, pins 5 x 8, 4 x 6 and 5 x 15.5, screws 5 x 12 and 5 x 20, oil seal 12 x 22 x 7
   (size from the non-OE alternative listed for ref 29). Everything else is typical proportion, not a factory figure.
   Every part's geometry is laid out in world coordinates, so every A is [0, 0, 0] and E is the exploded offset. */
const D3_BLCK0040 = (() => {
  const r3 = v => +(+v).toFixed(3), rad = a => a * Math.PI / 180, deg = a => a * 180 / Math.PI;
  const D = { y: -85, z: 5 };                  // shift drum axis
  const F1 = { y: -50, z: 35 };                // fork shaft, countershaft fork
  const F2 = { y: -92, z: -40 };               // fork shaft, drive shaft forks
  const S = { y: -120, z: -45 };               // gear shift shaft
  const CS = { y: 0, z: 0 }, DS = { y: -30, z: -56 };
  const XT = { cs: -32, d4: -58, d5: -6 };    // fork groove centres (from the transmission model)

  // items drawn along local +Y from y = 0; ax() turns local +Y into world +X and puts local y = 0 at world x0 on the axis s
  const ax = (items, x0, s) => ({ type: "group", items, rot: [0, 0, -90], at: [r3(x0), r3(s.y), r3(s.z)] });
  const RG = (ro, ri, h) => ({ type: "lathe", pts: [[ri, 0], [ro, 0], [ro, h], [ri, h]] });
  const pol = (c, r, a) => [c.y + r * Math.cos(rad(a)), c.z + r * Math.sin(rad(a))];   // [y, z]; angle from +Y toward +Z
  const P2 = (c, r, a) => { const p = pol(c, r, a); return { y: p[0], z: p[1] }; };
  const angTo = (a, b) => deg(Math.atan2(b.z - a.z, b.y - a.y));
  const dist = (a, b) => Math.hypot(b.y - a.y, b.z - a.z);
  // outline in the YZ plane ([y, z] points, holes [y, z, r]), w thick across X, centred on x0
  const yz = (pts, w, x0, bevel = .4, holes) => ({ type: "extrude", pts: pts.map(p => [r3(-p[1]), r3(p[0])]), holes: (holes || []).map(h => [r3(-h[1]), r3(h[0]), h[2]]),
    depth: r3(w - 2 * bevel), bevel, rot: [0, 90, 0], at: [r3(x0 - w / 2 + bevel), 0, 0] });
  // rod in the YZ plane starting r0 from point c along angle a, length L, at x
  const rodYZ = (c, a, r0, L, r, x) => { const p = pol(c, r0, a); return { type: "cyl", r, h: r3(L), rot: [r3(a), 0, 0], at: [x, r3(p[0]), r3(p[1])] }; };
  const arcPts = (c, r, a0, a1, n = 16) => Array.from({ length: n + 1 }, (_, i) => pol(c, r, a0 + (a1 - a0) * i / n));
  const pan = (L, rh = 4.5) => ({ type: "group", items: [ // pan-head screw: head at local y -3.5..0, shank along +Y
    { type: "lathe", pts: [[0, -3.5], [rh - 1, -3.5], [rh, -2.5], [rh, 0], [2.5, 0], [2.5, L], [0, L]] },
    { type: "box", size: [6, 1, 1.2], r: .2, at: [0, -3.4, 0], mat: "black" }] });
  const tube = (pts, r) => ({ type: "tube", pts: pts.map(q => q.map(r3)), r });

  // ================= shift drum (ref 4) =================
  const X_D0 = -84;                                         // left end face of the drum
  const prof = [[2.7, 0], [11, 0], [11, 12], [22, 12]];
  [XT.d4, XT.cs, XT.d5].forEach(x => { const y = x - X_D0; prof.push([22, y - 4], [17, y - 4], [17, y + 4], [22, y + 4]); });
  prof.push([22, 92], [19.8, 92], [19.8, 93.5], [12.5, 93.5], [12.5, 110], [8, 110], [8, 130.5], [0, 130.5], [0, 22], [2.7, 22]);
  const drum = ax([{ type: "lathe", pts: prof },
    { type: "lathe", pts: [[19, 3.4], [22.3, 3.4], [22.3, 4.6], [19, 4.6]], mat: "dark" }], X_D0, D);   // neutral detent land mark

  // ================= shift forks =================
  // yoke: half ring in the gear groove; thicker pads outside the gear; web to the boss on the fork shaft; pin into the drum track
  const fork = (gc, gOut, gBot, F, x, span) => {
    const phi = angTo(gc, F), ro = gOut + 5, ri = gBot + 1, ph2 = phi + 180;
    const yoke = arcPts(gc, ro, phi - span, phi + span, 24).concat(arcPts(gc, ri, phi + span, phi - span, 24));
    const pad = arcPts(gc, ro, phi - span + 4, phi + span - 4, 20).concat(arcPts(gc, gOut + 1.5, phi + span - 4, phi - span + 4, 20));
    const web = [pol(gc, ro - 2, phi - 24), pol(F, 8.5, ph2 + 75), pol(F, 8.5, ph2 - 75), pol(gc, ro - 2, phi + 24)];
    const toD = angTo(F, D), Lp = dist(F, D) - 21 - 8;
    return { type: "group", items: [
      yz(yoke, 3.4, x, 0), yz(pad, 7, x, .5), yz(web, 6, x, .5),
      ax([{ type: "lathe", pts: [[6.1, 0], [10, 0], [10, 18], [6.1, 18]] }], x - 9, F),
      rodYZ(F, toD, 8, Lp, 3.4, x),
      { type: "sphere", r: 3.4, at: [x, ...pol(F, 8 + Lp, toD).map(r3)] } ] };
  };
  // gear outside / groove-bottom radii from the transmission model (3rd drive slider, 4th and 5th driven sliders)
  const forkCS = fork(CS, 29, 20.8, F1, XT.cs, 55);
  const fork4 = fork(DS, 35.9, 27.8, F2, XT.d4, 65);
  const fork5 = fork(DS, 33.4, 25.3, F2, XT.d5, 65);
  const fshaft = F => ax([{ type: "lathe", pts: [[0, 0], [5.4, 0], [6, .6], [6, 111.4], [5.4, 112], [0, 112]] }], -90, F);

  // ================= right end of the drum =================
  // cam stopper plate (ref 22): five-notch star on the drum stub, X 26..29.5
  const aRoll = 40, notch = (a) => { let d = ((a - aRoll) % 72 + 72) % 72; if (d > 36) d -= 72; return Math.abs(d) < 14 ? 23 - 4.5 * Math.cos(rad(d / 14 * 90)) : 23; };
  const star = Array.from({ length: 180 }, (_, i) => pol(D, notch(i * 2), i * 2));
  const plate22 = yz(star, 3.5, 27.75, .3, [[D.y, D.z, 8.2]]);
  const dowels = [36, 216].map(a => pol(D, 14, a));
  // cam stopper (ref 16): arm on a shouldered pivot pin, roller in a star notch; torsion spring (ref 17) round the pivot
  const QP = { y: -45, z: 58 };
  const RL = P2(D, 23.3, aRoll), aSt = angTo(QP, RL);
  const stArm = [...arcPts(QP, 8, aSt + 90, aSt + 270, 12), ...arcPts(RL, 6, aSt - 90, aSt + 90, 10)];
  const stopper = { type: "group", items: [
    yz(stArm, 3, 31.3, .3, [[QP.y, QP.z, 4.2], [RL.y, RL.z, 2.1]]),
    ax([RG(4.5, 2.1, 3.5)], 26, RL),
    ax([{ type: "lathe", pts: [[0, 0], [2, 0], [2, 7.5], [3.2, 7.5], [3.2, 8.7], [0, 8.7]] }], 25.4, RL),
    ax([{ type: "lathe", pts: [[0, 0], [4, 0], [4, 10.8], [7, 10.8], [7, 13.3], [0, 13.3]] }], 22, QP) ] };
  const sspring = { type: "group", items: [ax([{ type: "spring", R: 6.2, wire: 1.4, h: 4.6, turns: 2.5 }], 24.8, QP),
    tube([[25.5, ...pol(QP, 6.2, aSt + 80)], [25.5, ...pol(QP, 14, aSt + 76)], [25.5, ...pol(QP, 20, aSt + 72)]], .7),
    tube([[28.7, ...pol(QP, 6.2, aSt - 30)], [29, ...pol(QP, 12, aSt - 14)], [29.4, ...pol(QP, 15, aSt - 8)]], .7)] };
  // pawl guide (ref 12): ring round the lifter, two ears screwed to the case, X 33.5..39.5
  const earA = [180, 0], earC = earA.map(a => P2(D, 42, a));
  const guidePts = []; earA.forEach((a, i) => { guidePts.push(...arcPts(D, 34, a - 166, a - 14, 20)); guidePts.push(...arcPts(earC[i], 8, a - 80, a + 80, 10)); });
  const guide = yz(guidePts, 6, 36.5, .4, [[D.y, D.z, 25.6], ...earC.map(c => [c.y, c.z, 2.8])]);
  // pawl lifter (ref 10): disc in the guide bore, hub on the drum stub, drive peg for the shift arm
  const aPeg = angTo(D, S), PEG = P2(D, 21, aPeg);
  const lifter = { type: "group", items: [
    ax([{ type: "lathe", pts: [[8.2, 0], [25, 0], [25, 8], [12, 8], [12, 13], [8.2, 13]] }], 33.5, D),
    ax([{ type: "lathe", pts: [[0, 0], [3, 0], [3, 9], [0, 9]] }], 41.5, PEG) ] };
  const PA = [aPeg + 90, aPeg - 90];
  const pawl = a => yz([...arcPts(D, 22, a - 25, a + 5, 8), pol(D, 17.5, a + 14), ...arcPts(D, 15, a + 5, a - 25, 8)], 3, 43, .3, [[...pol(D, 18.5, a - 18), 2.6]]);
  const pinAt = a => pol(D, 18.5, a - 18), sprAt = a => pol(D, 18.5, a + 24);

  // ================= neutral switch (left end of the drum) =================
  const flange = [...arcPts(D, 18, -50, 50, 8), ...arcPts({ y: D.y, z: D.z + 24 }, 6.5, 0, 180, 10), ...arcPts(D, 18, 130, 230, 8), ...arcPts({ y: D.y, z: D.z - 24 }, 6.5, 180, 360, 10)];
  const base = { type: "group", items: [
    ax([{ type: "lathe", pts: [[0, 0], [9, 0], [9, 5], [0, 5]] }], -99, D),
    yz(flange, 4, -92, .4, [[D.y, D.z + 24, 2.8], [D.y, D.z - 24, 2.8]]),
    ax([{ type: "lathe", pts: [[0, 0], [13.1, 0], [13.1, 1], [12, 1], [12, 3.4], [13.1, 3.4], [13.1, 4.5], [0, 4.5]] }], -90, D),
    { type: "cyl", r: 2.2, h: 14, at: [-96.5, D.y + 6, D.z], mat: "brass" },
    { type: "cyl", r: 3.4, h: 7, at: [-96.5, D.y + 12, D.z], mat: "rubber" } ] };

  // ================= second cam stopper: plunger in a plug under the drum (refs 18-21) =================
  const XDt = -67, yTop = D.y - 22;                     // plunger tip on the drum land at X = -67
  const plug = { type: "group", items: [
    { type: "lathe", pts: [[5.6, 0], [7, 0], [7, 26], [5.6, 26]], at: [XDt, yTop - 31, D.z] },
    { type: "lathe", pts: [[0, 0], [5.6, 0], [5.6, 2], [0, 2]], at: [XDt, yTop - 33, D.z] },
    { type: "hex", af: 17, h: 7, y: yTop - 38, at: [XDt, 0, D.z] } ] };

  // ================= gear shift shaft (ref 25), arm and return spring =================
  const aArm = angTo(S, PEG);
  const armOut = [...arcPts(S, 12, aArm + 90, aArm + 270, 14), ...arcPts(PEG, 5.5, aArm - 90, aArm + 90, 10)];
  const sshaft = { type: "group", items: [
    ax([{ type: "lathe", pts: [[0, 0], [6, 0], [6, 200], [7, 200], [7, 252], [0, 252]] }], -200, S),
    { type: "array", pos: Array.from({ length: 12 }, (_, k) => [-187, r3(S.y + Math.cos(k * Math.PI / 6) * 6), r3(S.z + Math.sin(k * Math.PI / 6) * 6)]), item: { type: "box", size: [24, 1.2, 1.2], r: .2, mat: "dark" } },
    ax([RG(12, 7, 14)], 40, S),
    yz(armOut, 4, 49.5, .4, [[PEG.y, PEG.z, 3.3]]) ] };
  const STP = { y: -88, z: -72 }, aStp = angTo(S, STP);
  const rspring = { type: "group", items: [ax([{ type: "spring", R: 9.5, wire: 2.2, h: 8, turns: 3.2 }], 30, S),
    ...[-1, 1].map(s => { const xx = s < 0 ? 31.1 : 36.9, e = pol(STP, 6.2, aStp + 180 + s * 90);
      return tube([[xx, ...pol(S, 9.5, aStp - s * 25)], [xx, ...pol(S, 20, aStp - s * 12)], [xx, ...e], [xx, ...pol(STP, 9, aStp + s * 70)]], 1.1); })] };

  // ================= pedal (ref 30) =================
  const TIP = { y: -100, z: 100 }, aLev = angTo(S, TIP);
  const lever = { type: "group", items: [
    ax([RG(13, 6.05, 16)], -198, S),
    yz([...arcPts(S, 12, aLev + 90, aLev + 270, 14), ...arcPts(TIP, 8, aLev - 90, aLev + 90, 10)], 6, -186),
    yz([pol(S, 11, aLev + 150), pol(S, 23, aLev + 162), pol(S, 23, aLev + 198), pol(S, 11, aLev + 210)], 14, -190),
    { type: "cyl", r: 5, h: 42, axis: "x", at: [-230, TIP.y, TIP.z] } ] };
  const clampC = P2(S, 17.5, aLev + 180);

  // ================= parts =================
  const P = [];
  const add = (id, ref, name, mat, geom, o = {}) => P.push({ id, ref, name, mat, A: [0, 0, 0], E: [0, 0, 0], geom, ...o });

  add("drum", "4", "Gear shift cam (shift drum)", "steel", drum, { stage: 0 });
  add("sp39", "39", "Spring (neutral contact pin)", "spring", ax([{ type: "spring", R: 2, wire: .6, h: 8, turns: 5 }], -70, D), { parent: "drum", stage: 1, small: true });
  add("pin38", "38", "Neutral contact pin 5 x 15.5", "brass", ax([{ type: "lathe", pts: [[0, 0], [1.8, 0], [2.5, 1], [2.5, 15.5], [0, 15.5]] }], -85.5, D), { parent: "drum", stage: 1, small: true });
  add("w14", "14", "Washer 40 x 45 x 1 (drum shim)", "steel", ax([RG(22.5, 20, 1)], 8, D), { parent: "drum", stage: 2, small: true });
  add("b15", "15", "Needle bearing 25 x 32 x 12 (drum, right end)", "steel", ax([
    { type: "lathe", pts: [[12.6, 0], [16, 0], [16, 12], [12.6, 12], [12.6, 11], [15, 11], [15, 1], [12.6, 1]] },
    { type: "array", pos: Array.from({ length: 22 }, (_, k) => [r3(Math.cos(k * Math.PI / 11) * 13.8), 1.5, r3(Math.sin(k * Math.PI / 11) * 13.8)]), item: { type: "cyl", r: 1.05, h: 9, mat: "chrome" } }], 12, D), { parent: "drum", stage: 2 });

  add("fork1", "1", "Shift fork No. 1 (countershaft, 3rd drive gear)", "steel", forkCS, { stage: 3 });
  add("fork3a", "2", "Shift fork No. 3 (drive shaft, 4th driven gear)", "steel", fork4, { stage: 3 });
  add("fork3b", "2", "Shift fork No. 3 (drive shaft, 5th driven gear)", "steel", fork5, { stage: 3 });
  add("fs", "3", "Shift fork shafts", "steel", { type: "group", items: [fshaft(F1), fshaft(F2)] }, { stage: 4, count: 2 });

  add("p23", "23", "Dowel pins 4 x 6 (stopper plate)", "steel", { type: "array", pos: dowels.map(p => [23.5, r3(p[0]), r3(p[1])]), item: { type: "cyl", r: 2, h: 6, axis: "x" } }, { parent: "drum", stage: 5, small: true, count: 2 });
  add("pl22", "22", "Gear shift cam stopper plate", "steel", plate22, { parent: "drum", stage: 5 });
  add("sp17", "17", "Spring (cam stopper)", "spring", sspring, { parent: "st16", stage: 6, small: true });
  add("st16", "16", "Gear shift cam stopper (arm, roller and pivot)", "steel", stopper, { stage: 6 });
  add("g12", "12", "Gear shift cam guide (pawl guide)", "steel", guide, { stage: 7 });
  add("s13", "13", "Screws (cam guide)", "zinc", { type: "array", pos: earC.map(c => [39.5, r3(c.y), r3(c.z)]), item: { ...pan(12), rot: [0, 0, 90] } }, { parent: "g12", stage: 7, small: true, count: 2 });
  add("p8", "8", "Pins 5 x 8 (pawl pivots)", "steel", { type: "array", pos: PA.map(a => [37.5, ...pinAt(a).map(r3)]), item: { type: "cyl", r: 2.5, h: 8, axis: "x" } }, { parent: "l10", stage: 8, small: true, count: 2 });
  add("sp9", "9", "Springs (pawls)", "spring", { type: "array", pos: PA.map(a => [41.5, ...sprAt(a).map(r3)]), item: { type: "spring", R: 1.6, wire: .5, h: 4.5, turns: 4, rot: [0, 0, -90] } }, { parent: "l10", stage: 8, small: true, count: 2 });
  add("pw6", "6", "Gear shift pawl No. 1", "steel", pawl(PA[0]), { parent: "l10", stage: 8 });
  add("pw7", "7", "Gear shift pawl No. 2", "steel", pawl(PA[1]), { parent: "l10", stage: 8 });
  add("l10", "10", "Gear shift pawl lifter", "steel", lifter, { stage: 9 });
  add("r5", "5", "Gear shift cam retainer", "steel", ax([RG(14, 2.7, 2.5)], 46.5, D), { stage: 10 });
  add("s11", "11", "Screw 5 x 12 (retainer)", "zinc", ax([{ ...pan(12), rot: [0, 0, 180] }], 49, D), { parent: "r5", stage: 10, small: true });

  add("st18", "18", "Gear shift cam stopper No. 2 (plunger)", "steel", { type: "lathe", pts: [[0, 0], [4.4, 0], [4.4, 11], [3.4, 13.5], [0, 14.5]], at: [XDt, yTop - 14.5, D.z] }, { parent: "h19", stage: 11 });
  add("sp20a", "20", "Inner spring (stopper No. 2)", "spring", { type: "spring", R: 2.4, wire: .8, h: 16.5, turns: 7, at: [XDt, yTop - 31, D.z] }, { parent: "h19", stage: 11, small: true });
  add("sp20b", "20", "Outer spring (stopper No. 2)", "spring", { type: "spring", R: 4.6, wire: 1, h: 16.5, turns: 6, at: [XDt, yTop - 31, D.z] }, { parent: "h19", stage: 11, small: true });
  add("gk21", "21", "Gasket 14 x 19.2 x 2 (plug)", "brass", { type: "lathe", pts: [[7.05, 0], [9.6, 0], [9.6, 2], [7.05, 2]], at: [XDt, yTop - 33, D.z] }, { parent: "h19", stage: 11, small: true });
  add("h19", "19", "Holder (stopper spring plug)", "steel", plug, { stage: 11 });

  add("lw28", "28", "Lock washer (stopper pin)", "steel", ax([RG(6.5, 3.6, 1.2)], 24.8, STP), { parent: "st27", stage: 12, small: true });
  add("st27", "27", "Stopper pin (shift shaft return spring)", "steel", ax([{ type: "lathe", pts: [[0, 0], [3.5, 0], [3.5, 12], [5, 12], [5, 22], [0, 22]] }, { type: "hex", af: 12, h: 4, y: 22 }], 14, STP), { stage: 12 });
  add("sp26", "26", "Return spring (shift shaft)", "spring", rspring, { parent: "ss25", stage: 13 });
  add("ss25", "25", "Gear shift shaft with arm", "steel", sshaft, { stage: 13 });

  add("os29", "29", "Oil seal 12 x 22 x 7 (shift shaft)", "rubber", ax([{ type: "lathe", pts: [[6.1, 0], [8, 0], [8, 1], [11, 1], [11, 7], [7, 7], [6, 5], [6.6, 3]] }], -166, S), { stage: 14, small: true });
  add("c24", "24", "Circlip (shift shaft)", "spring", ax([{ type: "ring", ro: 9, ri: 5.6, h: 1.2, split: true }], -170, S), { parent: "ss25", stage: 14, small: true });
  add("lv30", "30", "Gear shift lever (pedal)", "steel", lever, { parent: "ss25", stage: 15 });
  add("b32", "32", "Bolt (pedal clamp)", "zinc", { type: "group", items: [{ type: "cyl", r: 3, h: 24, at: [-190, -12, 0] }, { type: "hex", af: 10, h: 5, y: 12, at: [-190, 0, 0] }], rot: [r3(aLev + 90), 0, 0], at: [0, r3(clampC.y), r3(clampC.z)] }, { parent: "lv30", stage: 15, small: true });
  add("rb31", "31", "Pedal rubber", "rubber", ax([{ type: "lathe", pts: [[5, 0], [8.5, 0], [9.5, 2], [9.5, 26], [8.5, 28], [5, 28]] }], -227, TIP), { parent: "lv30", stage: 15 });

  add("o34", "34", "O-ring 26.2 x 2.4 (neutral switch)", "rubber", ax([{ type: "torus", R: 13.4, r: 1.2 }], -87.8, D), { parent: "ns33", stage: 16, small: true });
  add("ns33", "33", "Neutral switch terminal base", "black", base, { stage: 16 });
  add("w37", "37", "Washers (switch screws)", "steel", { type: "array", pos: [24, -24].map(dz => [-95, D.y, D.z + dz]), item: { type: "ringX", ro: 5, ri: 2.7, h: 1 } }, { parent: "ns33", stage: 16, small: true, count: 2 });
  add("lw36", "36", "Lock washers (switch screws)", "steel", { type: "array", pos: [24, -24].map(dz => [-96.4, D.y, D.z + dz]), item: { type: "ringX", ro: 4.6, ri: 2.7, h: 1.4 } }, { parent: "ns33", stage: 16, small: true, count: 2 });
  add("s35", "35", "Screws 5 x 20 (neutral switch)", "zinc", { type: "array", pos: [24, -24].map(dz => [-96.4, D.y, D.z + dz]), item: { ...pan(20), rot: [0, 0, -90] } }, { parent: "ns33", stage: 16, small: true, count: 2 });

  // ================= exploded layout =================
  const byId = Object.fromEntries(P.map(p => [p.id, p]));
  const setE = (id, e, dir) => { byId[id].E = e.map(r3); const n = Math.hypot(...e) || 1; byId[id].dir = dir || e.map(v => r3(-v / n)); };
  // right end of the drum: everything pulled off to the right along the drum axis, in fitting order
  const xr = { w14: [8, 9], b15: [12, 24], p23: [23.5, 29.5], pl22: [26, 29.5], lw28: [24.8, 26], st27: [14, 40], sp17: [24, 30], st16: [22, 35.3],
    g12: [33.5, 39.5], s13: [27.5, 43], l10: [33.5, 50.5], p8: [37.5, 45.5], sp9: [41.5, 46], pw: [41.5, 44.5], r5: [46.5, 49], s11: [37, 52.5] };
  let cur = 70;
  ["w14", "b15", "p23", "pl22", "lw28", "st27", "sp17", "st16", "g12", "s13", "l10", "p8", "sp9", "pw", "r5", "s11"].forEach(id => {
    const [a, b] = xr[id], dx = cur - a; cur = b + dx + 10;
    (id === "pw" ? ["pw6", "pw7"] : [id]).forEach(k => setE(k, [dx, 0, 0], [-1, 0, 0])); });
  // left end of the drum: contact pin and switch pulled off to the left
  setE("sp39", [-40, 0, 0], [1, 0, 0]); setE("pin38", [-60, 0, 0], [1, 0, 0]); setE("o34", [-75, 0, 0], [1, 0, 0]); setE("ns33", [-100, 0, 0], [1, 0, 0]);
  setE("w37", [-110, 0, 0], [1, 0, 0]); setE("lw36", [-118, 0, 0], [1, 0, 0]); setE("s35", [-140, 0, 0], [1, 0, 0]);
  // forks lifted out of their gear grooves, fork shafts drawn out to the left
  setE("fork1", [0, 40, 35]); setE("fork3a", [0, -25, -60]); setE("fork3b", [0, -25, -60]); setE("fs", [-280, 0, 0], [1, 0, 0]);
  // detent plug stack pulled down
  setE("st18", [0, -15, 0], [0, 1, 0]); setE("sp20a", [0, -40, 0], [0, 1, 0]); setE("sp20b", [0, -66, 0], [0, 1, 0]); setE("gk21", [0, -90, 0], [0, 1, 0]); setE("h19", [0, -125, 0], [0, 1, 0]);
  // shift shaft dropped clear underneath; it goes in from the right, pedal parts pulled to the left
  const DROP = -175;
  setE("ss25", [0, DROP, 0], [-1, 0, 0]); setE("sp26", [60, DROP, 0], [-1, 0, 0]);
  setE("os29", [-50, 0, 0], [1, 0, 0]); setE("c24", [-25, 0, 0], [1, 0, 0]);
  setE("lv30", [-90, DROP, 0], [1, 0, 0]); setE("rb31", [-150, DROP, 0], [1, 0, 0]);
  const bd = [Math.cos(rad(aLev + 90)), Math.sin(rad(aLev + 90))];
  setE("b32", [-90, DROP + 30 * bd[0], 30 * bd[1]], [0, r3(-bd[0]), r3(-bd[1])]);

  const stages = [
    { t: "Neutral contact pin", d: "Drop the small spring and then the contact pin into the hole in the left end of the shift drum." },
    { t: "Drum shim and bearing", d: "Fit the thin shim washer on the shoulder at the right end of the drum. The needle bearing sits in the case wall on the right-hand journal." },
    { t: "Shift forks", d: "Set each fork in the groove of its sliding gear with its pin in the matching drum track: No. 1 on the countershaft 3rd gear, the two No. 3 forks on the drive shaft 4th and 5th gears." },
    { t: "Fork shafts", d: "Slide the two fork shafts in from the left through the case and the fork bosses. Check every fork moves freely." },
    { t: "Cam stopper plate", d: "Fit the two dowel pins in the drum end and fit the star plate over them." },
    { t: "Cam stopper", d: "Fit the stopper arm on its pivot with the spring, and let the roller drop into a notch of the star plate." },
    { t: "Pawl guide", d: "Fit the guide plate round the drum end and fit its two screws. Thread locker and torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Pawls into the lifter", d: "Fit both pawls on their pins in the lifter, with their springs behind them. The No. 1 and No. 2 pawls are not the same; check which side each goes." },
    { t: "Pawl lifter", d: "Hold the pawls in and slide the lifter onto the drum end, inside the guide plate, with the peg toward the shift shaft." },
    { t: "Cam retainer", d: "Fit the retainer and its centre screw into the drum end. Thread locker and torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Second cam stopper", d: "Put the plunger and both springs into the holder, fit a new gasket and screw the holder up into the case so the plunger bears on the drum. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Return spring stopper", d: "Screw in the stopper pin with its lock washer. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Gear shift shaft", d: "Fit the return spring on the shaft and slide the shaft in from the right. The spring ends go either side of the stopper pin and the arm engages the peg on the lifter." },
    { t: "Oil seal and circlip", d: "Press a new oil seal into the left case over the shaft, lip inward, then fit the circlip on the shaft." },
    { t: "Shift pedal", d: "Fit the pedal on the splines at the height you want and tighten the clamp bolt. Torque: VERIFY IN FACTORY SERVICE MANUAL. Push the rubber onto the peg." },
    { t: "Neutral switch", d: "Fit a new O-ring to the switch base and fit it over the left end of the drum with the drum in neutral. Fit the two screws with their lock washers and washers." },
  ];

  return {
    id: "CMS-BLCK0040", title: "Gear shifting", units: "mm", page: "BLCK0040",
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL gear shifting page. Sizes in the part names come from the catalogue descriptions. Where the drum, fork shafts and shift shaft sit, the fork and arm shapes, and how the pawl lifter, guide and stoppers fit together are a best guess at a 1970s Suzuki four, built to line up with the transmission model, not measured from a GS750. The cam tracks are drawn as plain grooves. Use the factory service manual for every dimension.",
    view: { dir: [1, .62, .95], up: [0, 1, 0] },
    notModelled: "Every catalogue ref is drawn. Ref 20 (20-1 and 20-2) is drawn as an inner and an outer spring in the plunger holder. Ref 2 is drawn twice (4th and 5th driven gear forks) and ref 3 as two fork shafts; CMSNL gives no quantities, so check both counts. The exact arrangement of the pawls, pawl guide, retainer and the two cam stoppers on a 1977 GS750 isn't confirmed; it's drawn as one plausible layout. The gears, crankcase and engine sprocket are on other pages and are not drawn.",
    stages, parts: P,
  };
})();
D3_MODELS["CMS-BLCK0040"] = D3_BLCK0040;
