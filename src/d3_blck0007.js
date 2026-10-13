/* ============ 3D parts model: carburetor bank, GS750 1977 (CMSNL BLCK0007, GS750N/EN page) ============
   Mechanical data only. Units: millimetres. World frame: +X = rider's LEFT, +Y up, +Z forward (engine side).
   Each carburetor has its own local frame: origin where the bore axis (along Z) meets the slide axis (along Y).
   Carburetors sit side by side across the bike: No. 1 on the left (+X), No. 4 on the right (-X).
   Air side (bell mouth) faces the rear (-Z), the intake spigot faces forward (+Z) through the mounting plate.
   Geometry: APPROXIMATE. Layout, part identity and numbering follow the CMSNL picture; shapes follow Mikuni
   slide-carburetor construction. No size here is a factory figure: VERIFY IN FACTORY SERVICE MANUAL.
   D3_CARB (shared builders) is reused by d3_fu01.js (single carburetor, DG-FU-01). */
const D3_CARB = (() => {
  // rounded rectangle footprint in x/z, written as XY points (y = -z) for an extrusion turned up with rot [-90,0,0]
  const foot = (x0, x1, z0, z1, r) => { const pts = [], cs = [[x1 - r, z1 - r, 0], [x0 + r, z1 - r, 90], [x0 + r, z0 + r, 180], [x1 - r, z0 + r, 270]];
    cs.forEach(([cx, cz, a0]) => { for (let k = 0; k <= 4; k++) { const a = (a0 + k * 22.5) * Math.PI / 180; pts.push([+(cx + r * Math.cos(a)).toFixed(3), +(-(cz + r * Math.sin(a))).toFixed(3)]); } });
    return pts; };
  // vertical slab: footprint x0..x1, z0..z1, from y0 up by h (bevel adds .6 at both faces unless bevel 0)
  const slab = (x0, x1, z0, z1, y0, h, r, holes, bevel, mat) => ({ type: "extrude", pts: foot(x0, x1, z0, z1, r), holes: (holes || []).map(([x, z, rr]) => [x, -z, rr]), depth: h, bevel: bevel ?? .6, rot: [-90, 0, 0], at: [0, y0, 0], mat });
  // slotted pan-head screw: shank along +Y from the origin (under-head face), head below the origin
  const scr = (hr, hh, r, L) => ({ type: "group", items: [
    { type: "lathe", pts: [[0, -hh], [hr * .82, -hh], [hr, -hh * .45], [hr, 0], [r, 0], [r, L], [0, L]] },
    { type: "box", size: [hr * 1.5, .7, .8], r: .2, at: [0, -hh - .05, 0], mat: "black" } ] });
  const at = (g, p, rot) => Object.assign({}, g, rot ? { rot } : {}, { at: p });
  const POS = { 1: 112, 2: 38, 3: -38, 4: -112 }; // carburetor centre lines across the bike (approximate spacing)

  /* ---- body casting (local frame) ---- */
  const core = () => ({ type: "group", items: [
    // bore tube: bell mouth at the rear, flange and spigot at the front
    { type: "lathe", pts: [[17, -44], [22, -44], [22, -40], [19, -36], [19, 22], [25, 22], [25, 28], [16.5, 28], [16.5, 46], [13.5, 46], [13, 40], [13, -34]], rot: [90, 0, 0] },
    slab(-23, 23, -19, 19, 8, 47.4, 5, [[0, 0, 16]]),             // slide chamber, bore for the slide
    slab(-26, 26, -24, 22, -32.4, 12.8, 5),                         // float chamber top (jets, float valve)
    { type: "cyl", r: 6, h: 10, axis: "x", at: [-36, -24, -22] },   // pilot air screw boss
    { type: "cyl", r: 5, h: 16, at: [0, 30, 22] },                  // starter plunger boss
    { type: "pair", pos: [[9.5, -36, 16], [-9.5, -36, 16]], item: { type: "box", size: [3, 6, 6], r: .6 } }, // float pin posts
    { type: "cyl", r: 2.4, h: 9, axis: "z", at: [14, 44, -28] },    // air vent nipple
    { type: "cyl", r: 4.5, h: 4, axis: "z", at: [12, -27, -28] },   // overflow nipple boss
  ] });
  const gasket40 = () => slab(-23, 23, -19, 19, 56, 1, 5, [[0, 0, 16]], 0);
  const cover = () => ({ type: "group", items: [ slab(-25, 25, -21, 21, 57.6, 5.8, 4, [[0, -6, 4.5]]),
    { type: "lathe", pts: [[4.5, 64], [8, 64], [7, 66], [4.5, 66]], at: [0, 0, -6] } ] });
  const COVER_SCREWS = [[18, 0, -14], [-18, 0, 14]];
  const coverScrews = () => ({ type: "pair", pos: COVER_SCREWS, item: at(scr(3, 2.2, 1.8, 12), [0, 65.2, 0], [180, 0, 0]) });
  const coverLockW = () => ({ type: "pair", pos: COVER_SCREWS, item: { type: "ring", ro: 3.4, ri: 1.9, h: 1.2, split: true, at: [0, 64, 0] } });
  const bowl = () => ({ type: "group", items: [ slab(-26, 26, -24, 22, -59.4, 24.8, 5, [[0, -1, 21]]), slab(-26, 26, -24, 22, -63.4, 2.8, 5),
    { type: "cyl", r: 6, h: 6, at: [0, -70, 0] } ] });
  const gasket9 = () => slab(-26, 26, -24, 22, -34, 1, 5, [[0, -1, 21.5]], 0);
  const BOWL_SCREWS = [[21, 0, -19], [-21, 0, -19], [21, 0, 17], [-21, 0, 17]];
  const bowlScrews = () => ({ type: "array", pos: BOWL_SCREWS, item: at(scr(3.2, 2.4, 2, 40), [0, -65.2, 0]) });
  const bowlLockW = () => ({ type: "array", pos: BOWL_SCREWS, item: { type: "ring", ro: 3.6, ri: 2.1, h: 1.2, split: true, at: [0, -65.2, 0] } });
  const drainScrew = () => at(scr(4, 2.6, 2.6, 8), [0, -71.2, 0]);
  const drainOring = () => ({ type: "torus", R: 3.3, r: .65, at: [0, -70.6, 0] });
  const floats = () => ({ type: "group", items: [
    { type: "pair", pos: [[13.5, -56, -2], [-13.5, -56, -2]], item: { type: "lathe", pts: [[0, 0], [6, 0], [7, 1.5], [7, 16.5], [6, 18], [0, 18]] } },
    { type: "pair", pos: [[13.5, -38.4, 7], [-13.5, -38.4, 7]], item: { type: "box", size: [2, 1.2, 18], r: .3 } },   // arms
    { type: "box", size: [29, 1.2, 3], r: .3, at: [0, -38.4, 15] },                                                     // cross bar
    { type: "pair", pos: [[6.5, -37.5, 16], [-6.5, -37.5, 16]], item: { type: "box", size: [1.5, 5, 7], r: .3 } },     // hinge tabs
    { type: "box", size: [6, .9, 6], r: .2, at: [0, -41, 11] },                                                          // tongue under the float needle
  ] });
  const floatPin = () => ({ type: "cyl", r: 1.1, h: 22, axis: "x", at: [-11, -37, 16] });
  const needleValve = () => ({ type: "group", at: [0, 0, 9], items: [
    { type: "lathe", pts: [[0, -33.6], [3.5, -33.6], [3.5, -29.5], [0, -29.5]] }, { type: "hex", af: 7, h: 4.6, y: -38.4 },
    { type: "lathe", pts: [[0, -40.5], [.5, -40.5], [1.3, -39.3], [1.3, -36], [0, -36]], mat: "steel" } ] });
  const valveGasket = () => ({ type: "ring", ro: 4.3, ri: 3.4, h: .6, at: [0, -33.6, 9] });
  const needleJet = () => ({ type: "lathe", pts: [[1.4, -30], [4.5, -30], [4.5, -28], [3.4, -28], [3.4, -11], [1.4, -11]] });
  const bleeder = () => ({ type: "group", items: [ { type: "lathe", pts: [[2.6, -33.4], [4, -33.4], [4, -30], [2.6, -30]] }, { type: "hex", af: 7, h: 4, y: -37.6 },
    { type: "lathe", pts: [[1.2, -43], [2.8, -43], [2.8, -37.6], [1.2, -37.6]] }, { type: "holes", y: [-41, -39.5], r: 2.8, d: .9 } ] });
  const bleederOring = () => ({ type: "torus", R: 4.3, r: .6, at: [0, -32.6, 0] });
  const mainJet = () => ({ type: "group", items: [ { type: "lathe", pts: [[0, -43], [2, -43], [2, -40], [0, -40]] }, { type: "hex", af: 6, h: 3, y: -46.6 },
    { type: "box", size: [4.5, .6, .8], r: .2, at: [0, -47.15, 0], mat: "black" } ] });
  const pilotJet = () => ({ type: "group", at: [0, 0, -12], items: [ { type: "lathe", pts: [[0, -40], [3, -40], [3, -38], [2.3, -38], [2.3, -26], [0, -26]] },
    { type: "box", size: [4.2, .6, .7], r: .2, at: [0, -40.1, 0], mat: "black" } ] });
  const PS = [-36, -24, -22]; // pilot air screw boss face
  const pilotScrew = () => ({ type: "lathe", pts: [[0, -10], [4, -10], [4.3, -9], [4.3, -6], [4, -5], [2, -5], [2, 10], [1.2, 14], [0, 14.5]], rot: [0, 0, -90], at: PS });
  const pilotSpring = () => ({ type: "spring", R: 3, wire: .7, h: 5, turns: 4, rot: [0, 0, 90], at: PS });
  const pilotOring = () => ({ type: "torus", R: 2.3, r: .6, rot: [0, 0, 90], at: [PS[0] + 3, PS[1], PS[2]] });
  /* ---- slide (throttle valve) and jet needle stack ---- */
  const slide = () => ({ type: "group", items: [ { type: "lathe", pts: [[2, -10], [15.5, -10], [15.5, 36], [13.5, 36], [13.5, -4], [2, -4]] },
    { type: "box", size: [3, 30, 1.2], r: .3, at: [0, 18, -15.6], mat: "dark" } ] });   // guide groove
  const needleWasher = () => ({ type: "ring", ro: 3.5, ri: 1.3, h: .8, at: [0, -4, 0] });
  const needle = () => ({ type: "group", items: [ { type: "lathe", pts: [[0, -28], [.45, -28], [1.25, -6], [1.25, 4], [0, 4]] },
    { type: "array", pos: [[0, -1, 0], [0, .4, 0], [0, 1.8, 0], [0, 3.2, 0]], item: { type: "torus", R: 1.26, r: .18, mat: "dark" } } ] });
  const needleClip = () => ({ type: "clip", R: 1.5, r: .45, gap: .9, at: [0, -2.7, 0] });
  const needleRing = () => ({ type: "torus", R: 1.9, r: .55, at: [0, -1.4, 0] });
  const needleSpring = () => ({ type: "spring", R: 4, wire: .8, h: 30, turns: 8 });
  const valvePlate = () => ({ type: "group", items: [ { type: "lathe", pts: [[0, 30], [13.2, 30], [13.2, 31.5], [0, 31.5]] } ] });
  const connector = () => ({ type: "group", items: [ { type: "box", size: [22, 3, 8], r: .6, at: [0, 33, -3] },
    { type: "cyl", r: 2, h: 37, at: [0, 34.5, -6] }, { type: "cyl", r: 3.2, h: 6, axis: "x", at: [-3, 74, -6] } ] });
  const CONN_SCREWS = [[8, 0, -3], [-8, 0, -3]];
  const connScrews = () => ({ type: "pair", pos: CONN_SCREWS, item: at(scr(2.2, 1.8, 1.2, 5), [0, 35.7, 0], [180, 0, 0]) });
  const connLockW = () => ({ type: "pair", pos: CONN_SCREWS, item: { type: "ring", ro: 2.5, ri: 1.3, h: 1.2, split: true, at: [0, 34.5, 0] } });
  /* ---- fuel delivery pipe between neighbouring carburetors (origin at the pipe centre) ---- */
  const pipe = () => ({ type: "group", items: [ { type: "cyl", r: 3.5, h: 30, axis: "x", at: [-15, 0, 0] }, { type: "cyl", r: 4.4, h: 3, axis: "x", at: [-1.5, 0, 0] } ] });
  const pipeSeals = () => ({ type: "pair", pos: [[-11, 0, 0], [11, 0, 0]], item: { type: "torus", R: 4.2, r: 1.1, rot: [0, 0, 90] } });
  /* ---- nipples and hoses (local frame of their carburetor) ---- */
  const NIP = [12, -27, -24], VENT = [14, 44, -19];
  const nippleStraight = () => ({ type: "lathe", pts: [[0, -6], [2.4, -6], [2.4, 0], [3.4, 0], [3.4, 2], [2.3, 3], [2.3, 6], [3, 7.5], [2.2, 12], [0, 12]], rot: [-90, 0, 0], at: NIP });
  const nippleElbow = () => ({ type: "group", at: NIP, items: [ { type: "lathe", pts: [[0, -6], [2.4, -6], [2.4, 0], [3.4, 0], [3.4, 2], [2.3, 3], [2.3, 9.5], [0, 9.5]], rot: [-90, 0, 0] },
    { type: "sphere", r: 2.8, at: [0, 0, -9.5] }, { type: "lathe", pts: [[0, 0], [2.3, 0], [2.3, 10], [3, 11.5], [2.2, 16], [0, 16]], rot: [180, 0, 0], at: [0, -1, -9.5] } ] });
  const hoseStraight = () => ({ type: "tube", r: 3.6, pts: [[0, 0, -9], [0, -1, -15], [0, -8, -21], [0, -24, -23], [0, -60, -23], [0, -130, -23]].map(p => [p[0] + NIP[0], p[1] + NIP[1], p[2] + NIP[2]]) });
  const hoseElbow = () => ({ type: "tube", r: 3.6, pts: [[0, -11, -9.5], [0, -30, -9.5], [0, -60, -10], [0, -130, -10]].map(p => [p[0] + NIP[0], p[1] + NIP[1], p[2] + NIP[2]]) });
  const ventShort = () => ({ type: "tube", r: 3.3, pts: [[0, 0, -5], [0, 0, -12], [0, -4, -20], [0, -14, -25], [0, -30, -26]].map(p => [p[0] + VENT[0], p[1] + VENT[1], p[2] + VENT[2]]) });
  const ventLong = () => ({ type: "tube", r: 4, pts: [[0, 0, -4], [0, 0, -14], [0, -6, -28], [0, -30, -40], [0, -80, -44], [0, -150, -44]].map(p => [p[0] + VENT[0], p[1] + VENT[1], p[2] + VENT[2]]) });
  /* ---- a complete carburetor drawn as one piece (body, top cover, float chamber, screws, slide link) ---- */
  const full = () => ({ type: "group", items: [ core(), Object.assign(cover(), { mat: "alu" }), gasket40(), gasket9(), bowl(),
    Object.assign(coverScrews(), { mat: "zinc" }), Object.assign(bowlScrews(), { mat: "zinc" }), Object.assign(connector(), { mat: "steel" }),
    Object.assign(pilotScrew(), { mat: "zinc" }), Object.assign(drainScrew(), { mat: "zinc" }) ] });
  return { foot, slab, scr, at, POS, core, gasket40, cover, coverScrews, coverLockW, bowl, gasket9, bowlScrews, bowlLockW, drainScrew, drainOring, floats, floatPin,
    needleValve, valveGasket, needleJet, bleeder, bleederOring, mainJet, pilotJet, pilotScrew, pilotSpring, pilotOring, slide, needleWasher, needle, needleClip,
    needleRing, needleSpring, valvePlate, connector, connScrews, connLockW, pipe, pipeSeals, NIP, VENT, nippleStraight, nippleElbow, hoseStraight, hoseElbow,
    ventShort, ventLong, full };
})();

const D3_BLCK0007 = (() => {
  const G = D3_CARB, X = G.POS, add = (a, b) => a.map((v, i) => v + b[i]);
  // the internals of carburetor No. 4 (rider's right, nearest in the CMSNL picture) are shown taken apart; the others are complete
  const c4 = [X[4], 0, 0], E3 = [X[3] + 70, 0, 0], E2 = [X[2] + 140, 0, 0], E1 = [X[1] + 210, 0, 0];
  const P = [];
  const part = (o) => { P.push(o); return o; };
  // carb-4 internal part: geometry in the carb's local frame, origin on the carb origin; d = exploded offset
  const in4 = (id, ref, name, mat, geom, stage, d, dir, parent, extra) => part(Object.assign({ id, ref, name, mat, geom, A: c4, E: add(c4, d), dir, stage, parent: parent || "body4" }, extra || {}));
  const S = { jets: 1, valve: 2, floats: 3, bowl: 4, pilot: 5, needle: 6, conn: 7, slide: 8, cover: 9, j3: 10, j2: 11, j1: 12, plate: 13, shaft: 14, lever: 15, ret: 16, choke: 17, cable: 18, nip: 19, hose: 20 };
  /* bodies */
  part({ id: "body4", ref: "4", name: "Carburetor No. 4 body (right)", mat: "alu", shell: true, stage: 0, A: c4, E: c4, dir: [-1, 0, 0], geom: G.core() });
  part({ id: "body3", ref: "3", name: "Carburetor No. 3 (complete)", mat: "alu", shell: true, stage: S.j3, A: [X[3], 0, 0], E: E3, dir: [-1, 0, 0], geom: G.full() });
  part({ id: "body2", ref: "2", name: "Carburetor No. 2 (complete)", mat: "alu", shell: true, stage: S.j2, A: [X[2], 0, 0], E: E2, dir: [-1, 0, 0], geom: G.full() });
  part({ id: "body1", ref: "1", name: "Carburetor No. 1 (complete, left)", mat: "alu", shell: true, stage: S.j1, A: [X[1], 0, 0], E: E1, dir: [-1, 0, 0], geom: G.full() });
  /* jets */
  in4("njet", "14", "Needle jet", "brass", G.needleJet(), S.jets, [0, -45, 0], [0, 1, 0], null, { small: true });
  in4("bleed", "15", "Bleeder pipe (jet holder)", "brass", G.bleeder(), S.jets, [0, -65, 0], [0, 1, 0]);
  in4("bleedor", "16", "O-ring (bleeder pipe)", "rubber", G.bleederOring(), S.jets, [0, -60, 0], [0, 1, 0], "bleed", { small: true });
  in4("mjet", "17", "Main jet", "brass", G.mainJet(), S.jets, [0, -75, 0], [0, 1, 0], "bleed", { small: true });
  in4("pjet", "21", "Pilot jet", "brass", G.pilotJet(), S.jets, [0, -55, 0], [0, 1, 0], null, { small: true });
  /* float valve and floats */
  in4("vgask", "13", "Gasket (float valve seat)", "brass", G.valveGasket(), S.valve, [0, -42, 0], [0, 1, 0], null, { small: true });
  in4("fvalve", "12", "Float needle valve (needle and seat)", "brass", G.needleValve(), S.valve, [0, -50, 0], [0, 1, 0]);
  in4("floats", "7", "Floats", "brass", G.floats(), S.floats, [0, -100, 0], [0, 1, 0]);
  in4("fpin", "8", "Float pin", "steel", G.floatPin(), S.floats, [45, -100, 0], [-1, 0, 0], null, { small: true });
  /* float chamber */
  in4("gask9", "9", "Float chamber gasket", "rubber", G.gasket9(), S.bowl, [0, -125, 0], [0, 1, 0], null, { small: true });
  in4("bowl4", "4", "Float chamber (part of carburetor No. 4)", "alu", G.bowl(), S.bowl, [0, -140, 0], [0, 1, 0], null, { shell: true });
  in4("bowlw", "6", "Lock washers (float chamber screws)", "spring", G.bowlLockW(), S.bowl, [0, -150, 0], [0, 1, 0], "bowl4", { small: true, count: 4 });
  in4("bowls", "5", "Screws (float chamber)", "zinc", G.bowlScrews(), S.bowl, [0, -195, 0], [0, 1, 0], "bowl4", { small: true, count: 4 });
  in4("drainor", "10", "O-ring (drain screw)", "rubber", G.drainOring(), S.bowl, [0, -205, 0], [0, 1, 0], "bowl4", { small: true });
  in4("drain", "11", "Drain screw", "zinc", G.drainScrew(), S.bowl, [0, -215, 0], [0, 1, 0], "bowl4", { small: true });
  /* pilot air screw */
  in4("psor", "19", "O-ring (pilot air screw)", "rubber", G.pilotOring(), S.pilot, [-40, 0, 0], [1, 0, 0], null, { small: true });
  in4("pspr", "20", "Spring (pilot air screw)", "spring", G.pilotSpring(), S.pilot, [-50, 0, 0], [1, 0, 0], null, { small: true });
  in4("pscrew", "18", "Pilot air screw", "zinc", G.pilotScrew(), S.pilot, [-75, 0, 0], [1, 0, 0]);
  /* slide and jet needle */
  in4("slide", "39", "Throttle valve (slide)", "chrome", G.slide(), S.slide, [0, 80, 0], [0, -1, 0], null, { shell: true });
  in4("nwash", "25", "Washer (jet needle)", "steel", G.needleWasher(), S.needle, [0, 128, 0], [0, -1, 0], "slide", { small: true });
  in4("needle", "22", "Jet needle", "chrome", G.needle(), S.needle, [0, 162, 0], [0, -1, 0], "slide");
  in4("nclip", "23", "Clip (jet needle)", "spring", G.needleClip(), S.needle, [14, 162, 0], [-1, 0, 0], "needle", { small: true });
  in4("nring", "26", "Ring (jet needle)", "rubber", G.needleRing(), S.needle, [0, 176, 0], [0, -1, 0], "needle", { small: true });
  in4("nspr", "24", "Spring (jet needle)", "spring", G.needleSpring(), S.needle, [0, 180, 0], [0, -1, 0], "slide");
  in4("vplate", "27", "Throttle valve plate", "steel", G.valvePlate(), S.needle, [0, 190, 0], [0, -1, 0], "slide");
  in4("conn", "28", "Connector (slide lift link)", "steel", G.connector(), S.conn, [0, 196, 0], [0, -1, 0], "slide");
  in4("connw", "30", "Lock washers (connector screws)", "spring", G.connLockW(), S.conn, [0, 246, 0], [0, -1, 0], "conn", { small: true, count: 2 });
  in4("conns", "29", "Screws (connector)", "zinc", G.connScrews(), S.conn, [0, 252, 0], [0, -1, 0], "conn", { small: true, count: 2 });
  /* top cover */
  in4("gask40", "40", "Gasket (top cover)", "rubber", G.gasket40(), S.cover, [0, 240, 0], [0, -1, 0], null, { small: true });
  in4("cover4", "4", "Top cover (part of carburetor No. 4)", "alu", G.cover(), S.cover, [0, 250, 0], [0, -1, 0], null, { shell: true });
  in4("coverw", "42", "Lock washers (top cover screws)", "spring", G.coverLockW(), S.cover, [0, 256, 0], [0, -1, 0], "cover4", { small: true, count: 2 });
  in4("covers", "41", "Screws (top cover)", "zinc", G.coverScrews(), S.cover, [0, 276, 0], [0, -1, 0], "cover4", { small: true, count: 2 });
  /* joining the carburetors: delivery pipe with two seals at each joint */
  const joint = (k, cx, parent, Ex, stage) => {
    part({ id: "pipe" + k, ref: "43", name: `Fuel delivery pipe (No. ${k[0]} to No. ${k[1]})`, mat: "brass", parent, stage, A: [cx, -26, 8], E: [Ex, -26, 8], dir: [-1, 0, 0], geom: G.pipe() });
    part({ id: "seal" + k, ref: "44", name: `Seals (delivery pipe, No. ${k[0]} to No. ${k[1]})`, mat: "rubber", parent: "pipe" + k, stage, A: [cx, -26, 8], E: [Ex, -40, 8], dir: [-1, 0, 0], small: true, count: 2, geom: G.pipeSeals() });
  };
  joint("34", -75, "body4", -33, S.j3); joint("23", 0, "body3", 105, S.j2); joint("12", 75, "body2", 250, S.j1);
  /* nipples and hoses on every carburetor (they follow their own carburetor) */
  const CA = { 1: [X[1], 0, 0], 2: [X[2], 0, 0], 3: [X[3], 0, 0], 4: c4 }, CE = { 1: E1, 2: E2, 3: E3, 4: c4 };
  [1, 2, 3, 4].forEach(n => {
    const elbow = n === 2 || n === 3;
    part({ id: "nip" + n, ref: elbow ? "46" : "45", name: `Nipple (overflow, No. ${n})`, mat: "brass", parent: "body" + n, stage: S.nip, A: CA[n], E: add(CE[n], [0, 0, -31]), dir: [0, 0, 1], small: true, geom: elbow ? G.nippleElbow() : G.nippleStraight() });
    part({ id: "hose" + n, ref: "47", name: `Overflow hose (No. ${n})`, mat: "rubber", parent: "nip" + n, stage: S.hose, A: CA[n], E: add(CE[n], [0, -30, -105]), dir: [0, 1, 0], geom: elbow ? G.hoseElbow() : G.hoseStraight() });
    const longV = n === 1 || n === 2;
    part({ id: "vent" + n, ref: longV ? "50" : "49", name: longV ? `Vent hose, long (No. ${n})` : `Vent hose, short (No. ${n})`, mat: "rubber", parent: "body" + n, stage: S.hose, A: CA[n], E: add(CE[n], [0, 0, -52]), dir: [0, 0, 1], geom: longV ? G.ventLong() : G.ventShort() });
  });
  /* mounting plate (world coordinates, origin 0): carries the throttle shaft and choke shaft in four tabs */
  const TABS = [-150, -75, 75, 150], CX = [X[1], X[2], X[3], X[4]];
  const plateG = { type: "group", items: [
    { type: "extrude", depth: 3, bevel: .5, at: [0, 0, 28], pts: [[-150, -30], [150, -30], [154, -26], [154, 92], [150, 96], [22, 96], [22, 100], [-22, 100], [-22, 96], [-150, 96], [-154, 92], [-154, -26]],
      holes: [...CX.map(c => [c, 0, 18]), ...CX.map(c => [c, 21, 2]), ...CX.map(c => [c, -21, 2]), [-75, 22, 9], [75, 22, 9], [0, 40, 8]] },
    { type: "array", pos: TABS.map(t => [t, 61, 15]), item: { type: "box", size: [3, 46, 26], r: .8 } },
    { type: "box", size: [10, 8, 8], r: 1, at: [-66, 90, 25] },     // idle screw boss
    { type: "box", size: [6, 4, 22], r: .8, at: [8, 16, 18] },      // return spring anchor
  ] };
  part({ id: "plate", ref: "51", name: "Mounting plate (comes with ref 51)", mat: "steel", stage: S.plate, A: [0, 0, 0], E: [0, 0, 200], dir: [0, 0, -1], geom: plateG });
  part({ id: "pscrT", ref: "60", name: "Screws (plate to carburetors, top)", mat: "zinc", parent: "plate", stage: S.plate, A: [0, 0, 0], E: [0, 0, 260], dir: [0, 0, -1], small: true, count: 4,
    geom: { type: "array", pos: CX.map(c => [c, 21, 32.5]), item: Object.assign(G.scr(3.6, 3, 2.4, 13.5), { rot: [-90, 0, 0] }) } });
  part({ id: "pwT", ref: "61", name: "Lock washers (plate screws, top)", mat: "spring", parent: "plate", stage: S.plate, A: [0, 0, 0], E: [0, 0, 240], dir: [0, 0, -1], small: true, count: 4,
    geom: { type: "array", pos: CX.map(c => [c, 21, 31]), item: { type: "ring", ro: 4, ri: 2.5, h: 1.5, split: true, rot: [90, 0, 0] } } });
  part({ id: "pscrB", ref: "48", name: "Screws (plate to carburetors, bottom)", mat: "zinc", parent: "plate", stage: S.plate, A: [0, 0, 0], E: [0, 0, 260], dir: [0, 0, -1], small: true, count: 4,
    geom: { type: "array", pos: CX.map(c => [c, -21, 31]), item: Object.assign(G.scr(3.6, 3, 2.4, 12), { rot: [-90, 0, 0] }) } });
  /* throttle shaft assembly: shaft, cable pulley, idle stop lever and one lift lever per carburetor */
  const SY = 74, SZ = 8;
  const shaftG = { type: "group", items: [
    { type: "cyl", r: 3.5, h: 316, axis: "x", at: [-158, SY, SZ] },
    { type: "lathe", pts: [[3.5, -5], [14, -5], [14, -3], [12, -1.5], [12, 1.5], [14, 3], [14, 5], [3.5, 5]], rot: [0, 0, 90], at: [0, SY, SZ] },
    { type: "box", size: [5, 20, 5], r: .8, at: [-66, 84, 9] },
    { type: "array", pos: CX.map(c => [c, 0, 0]), item: { type: "group", items: [
      { type: "box", size: [8, 16, 14], r: 1, at: [0, 76, 9] },                                     // clamp boss
      { type: "pair", pos: [[4.5, 74, -3], [-4.5, 74, -3]], item: { type: "box", size: [2, 8, 14], r: .5 } }, // fork plates to the link pin
      { type: "box", size: [11, 3, 7], r: .6, at: [0, 79, -12] },                                   // tab for the adjusting screw
    ] } } ] };
  part({ id: "shaft", ref: "64", name: "Throttle shaft assembly (shaft, pulley, levers)", mat: "steel", parent: "plate", stage: S.shaft, A: [0, 0, 0], E: [0, 0, 330], dir: [1, 0, 0], geom: shaftG });
  const arr = (item) => ({ type: "array", pos: CX.map(c => [c, 0, 0]), item });
  part({ id: "lbw", ref: "38", name: "Lock washers (lever clamp bolts)", mat: "spring", parent: "shaft", stage: S.lever, A: [0, 0, 0], E: [0, 0, 370], dir: [0, 0, -1], small: true, count: 4,
    geom: arr({ type: "ring", ro: 4, ri: 2.5, h: 1.5, split: true, rot: [90, 0, 0], at: [0, 80, 16] }) });
  part({ id: "lbolt", ref: "37", name: "Bolts (lever clamp)", mat: "zinc", parent: "shaft", stage: S.lever, A: [0, 0, 0], E: [0, 0, 385], dir: [0, 0, -1], small: true, count: 4,
    geom: arr({ type: "group", rot: [-90, 0, 0], at: [0, 80, 17.5], items: [{ type: "hex", af: 7, h: 3.5, y: -3.5 }, { type: "lathe", pts: [[0, 0], [2.5, 0], [2.5, 13], [0, 13]] }] }) });
  part({ id: "lpin", ref: "32", name: "Pins (lever to slide link)", mat: "steel", parent: "shaft", stage: S.lever, A: [0, 0, 0], E: [0, 0, 290], dir: [-1, 0, 0], small: true, count: 4,
    geom: arr({ type: "group", items: [{ type: "cyl", r: 1.5, h: 15, axis: "x", at: [-6, 74, -6] }, { type: "cyl", r: 2.4, h: 1, axis: "x", at: [-7, 74, -6] }] }) });
  part({ id: "lspr", ref: "31", name: "Springs (lever pins)", mat: "spring", parent: "shaft", stage: S.lever, A: [0, 0, 0], E: [0, 0, 272], dir: [-1, 0, 0], small: true, count: 4,
    geom: arr({ type: "spring", R: 3.1, wire: .7, h: 3.6, turns: 3, rot: [0, 0, -90], at: [5.8, 74, -6] }) });
  part({ id: "lw36", ref: "36", name: "Washers (adjusting screws)", mat: "zinc", parent: "shaft", stage: S.lever, A: [0, 0, 0], E: [0, 30, 330], dir: [0, -1, 0], small: true, count: 4,
    geom: arr({ type: "ring", ro: 3.5, ri: 2.1, h: .8, at: [0, 80.6, -12] }) });
  part({ id: "lw35", ref: "35", name: "Lock washers (adjusting screws)", mat: "spring", parent: "shaft", stage: S.lever, A: [0, 0, 0], E: [0, 36, 330], dir: [0, -1, 0], small: true, count: 4,
    geom: arr({ type: "ring", ro: 3.4, ri: 2.1, h: 1.2, split: true, at: [0, 81.4, -12] }) });
  part({ id: "lnut", ref: "34", name: "Nuts (adjusting screws)", mat: "zinc", parent: "shaft", stage: S.lever, A: [0, 0, 0], E: [0, 42, 330], dir: [0, -1, 0], small: true, count: 4,
    geom: arr({ type: "hex", af: 6, h: 3.6, y: 82.8, hole: 2, at: [0, 0, -12] }) });
  part({ id: "ladj", ref: "33", name: "Adjusting screws (slide lift, synchronising)", mat: "zinc", parent: "shaft", stage: S.lever, A: [0, 0, 0], E: [0, 70, 330], dir: [0, -1, 0], small: true, count: 4,
    geom: arr({ type: "group", at: [0, 0, -12], items: [{ type: "lathe", pts: [[0, 70], [2, 70], [2, 90], [0, 90]] }, { type: "box", size: [3.2, .6, .7], r: .2, at: [0, 90, 0], mat: "black" }] }) });
  /* return spring and idle adjuster */
  part({ id: "rspr", ref: "59", name: "Throttle return spring", mat: "spring", parent: "plate", stage: S.ret, A: [0, 0, 0], E: [0, -10, 330], dir: [0, 1, 0],
    geom: { type: "group", items: [{ type: "spring", R: 3.5, wire: .9, h: 40, turns: 14, at: [8, 18, 8] }, { type: "tube", r: .5, pts: [[8, 58, 8], [6.5, 60.5, 8], [4, 62, 8]] }, { type: "tube", r: .5, pts: [[8, 18, 8], [8, 16.5, 10], [8, 16, 13]] }] } });
  part({ id: "idle", ref: "62", name: "Idle adjuster (throttle stop screw)", mat: "zinc", parent: "plate", stage: S.ret, A: [0, 0, 0], E: [0, 30, 330], dir: [0, 0, -1],
    geom: { type: "lathe", pts: [[0, 0], [2.5, 0], [2.5, 28.5], [5, 28.5], [6, 30], [6, 36], [5, 37], [0, 37]], rot: [90, 0, 0], at: [-66, 90, 11.5] } });
  part({ id: "idlespr", ref: "63", name: "Spring (idle adjuster)", mat: "spring", parent: "idle", stage: S.ret, A: [0, 0, 0], E: [0, 30, 362], dir: [0, 0, -1], small: true,
    geom: { type: "spring", R: 3.6, wire: .8, h: 10.5, turns: 6, rot: [90, 0, 0], at: [-66, 90, 29.5] } });
  /* choke (starter) shaft */
  const CY = 44, CZ = 22;
  part({ id: "choke", ref: "52", name: "Starter (choke) shaft", mat: "steel", parent: "plate", stage: S.choke, A: [0, 0, 0], E: [0, -140, 230], dir: [1, 0, 0],
    geom: { type: "group", items: [{ type: "cyl", r: 2.5, h: 325, axis: "x", at: [-162, CY, CZ] }, { type: "array", pos: CX.map(c => [c, CY, CZ]), item: { type: "box", size: [6, 3, 10], r: .6, at: [0, -2, 0] } }] } });
  part({ id: "cw53", ref: "53", name: "Washer (starter shaft)", mat: "zinc", parent: "choke", stage: S.choke, A: [0, 0, 0], E: [40, -140, 230], dir: [-1, 0, 0], small: true,
    geom: { type: "ringX", ro: 4.5, ri: 2.6, h: 1, at: [152, CY, CZ] } });
  part({ id: "cspr", ref: "54", name: "Spring (starter shaft)", mat: "spring", parent: "choke", stage: S.choke, A: [0, 0, 0], E: [42, -140, 230], dir: [-1, 0, 0], small: true,
    geom: { type: "spring", R: 3.6, wire: .7, h: 6, turns: 4, rot: [0, 0, -90], at: [153, CY, CZ] } });
  part({ id: "cw55", ref: "55", name: "Washer (starter shaft end)", mat: "zinc", parent: "choke", stage: S.choke, A: [0, 0, 0], E: [44, -140, 230], dir: [-1, 0, 0], small: true,
    geom: { type: "ringX", ro: 4.5, ri: 2.6, h: 1, at: [159, CY, CZ] } });
  part({ id: "clever", ref: "65", name: "Starter (choke) lever", mat: "steel", parent: "choke", stage: S.choke, A: [0, 0, 0], E: [-40, -140, 230], dir: [1, 0, 0],
    geom: { type: "group", items: [{ type: "cyl", r: 5, h: 5, axis: "x", at: [-160, CY, CZ] }, { type: "box", size: [3, 30, 7], r: .8, at: [-157.5, CY + 14, CZ] }, { type: "cyl", r: 3.5, h: 3, axis: "x", at: [-159, CY + 28, CZ] }] } });
  part({ id: "cscrew", ref: "66", name: "Screw (starter lever)", mat: "zinc", parent: "clever", stage: S.choke, A: [0, 0, 0], E: [-40, -140, 260], dir: [0, 0, -1], small: true,
    geom: Object.assign(G.scr(2.5, 2, 1.5, 7), { rot: [-90, 0, 0], at: [-157.5, CY, CZ + 7] }) });
  /* throttle cable bracket, adjuster and nut */
  part({ id: "cgask", ref: "58", name: "Gasket (cable bracket)", mat: "rubber", parent: "plate", stage: S.cable, A: [0, 0, 0], E: [0, 60, 280], dir: [0, 0, -1], small: true,
    geom: { type: "box", size: [20, 14, 1], r: .2, at: [0, 93, 31.5] } });
  part({ id: "cbrk", ref: "51", name: "Throttle cable bracket (comes with ref 51)", mat: "steel", parent: "plate", stage: S.cable, A: [0, 0, 0], E: [0, 60, 300], dir: [0, 0, -1],
    geom: { type: "group", items: [{ type: "box", size: [20, 14, 3], r: .5, at: [0, 93, 33.5] }, { type: "box", size: [20, 3, 24], r: .5, at: [0, 98.5, 47] }, { type: "box", size: [20, 22, 3], r: .5, at: [0, 88.5, 57.5] }] } });
  part({ id: "cbw", ref: "57", name: "Lock washers (cable bracket screws)", mat: "spring", parent: "cbrk", stage: S.cable, A: [0, 0, 0], E: [0, 60, 330], dir: [0, 0, -1], small: true, count: 2,
    geom: { type: "pair", pos: [[6, 93, 35], [-6, 93, 35]], item: { type: "ring", ro: 3.6, ri: 2.1, h: 1.4, split: true, rot: [90, 0, 0] } } });
  part({ id: "cbs", ref: "56", name: "Screws (cable bracket)", mat: "zinc", parent: "cbrk", stage: S.cable, A: [0, 0, 0], E: [0, 60, 345], dir: [0, 0, -1], small: true, count: 2,
    geom: { type: "pair", pos: [[6, 93, 36.4], [-6, 93, 36.4]], item: Object.assign(G.scr(3.4, 2.6, 2, 9), { rot: [-90, 0, 0] }) } });
  part({ id: "cnut", ref: "68", name: "Nut (cable adjuster)", mat: "zinc", parent: "cbrk", stage: S.cable, A: [0, 0, 0], E: [0, 60, 340], dir: [0, 0, 1], small: true,
    geom: { type: "hex", af: 10, h: 4, hole: 3.5, rot: [90, 0, 0], at: [0, 86, 51.5] } });
  part({ id: "cadj", ref: "67", name: "Throttle cable adjuster", mat: "zinc", parent: "cbrk", stage: S.cable, A: [0, 0, 0], E: [0, 60, 360], dir: [0, 0, -1],
    geom: { type: "group", rot: [90, 0, 0], at: [0, 86, 46], items: [{ type: "lathe", pts: [[1.3, 0], [3.5, 0], [3.5, 22], [1.3, 22]] }, { type: "hex", af: 10, h: 6, y: 22, hole: 1.3 }] } });

  // the mounting plate and everything carried on it explode together, off to the right of carburetor No. 4's column
  const PG = [-170, 20, 60], root = q => { let r = q; while (r.parent) r = P.find(z => z.id === r.parent); return r.id; };
  P.forEach(q => { if (root(q) === "plate") q.E = add(q.E, PG); });
  return {
    id: "CMS-BLCK0007", title: "Carburetors (bank of four)", units: "mm", page: "BLCK0007",
    accuracy: "Approximate geometry. Part identity, numbering and the layout follow the CMSNL carburetor picture (GS750N/EN page). Shapes follow Mikuni slide-carburetor construction and the sizes are approximate, not measured from a GS750. Check every size, jet and setting in the factory service manual.",
    view: { dir: [-1, .95, -1.05], up: [0, 1, 0] },
    notModelled: "Ref 0 is the complete set of four carburetors (the parts drawn here). Refs 1 to 4 are the four carburetor assemblies; No. 4 is drawn taken apart like in the CMSNL picture and its top cover and float chamber carry ref 4 because they are only sold with it. Nos. 1 to 3 are drawn complete: their jets, floats, slides and screws are the same parts as No. 4's. Ref 51 is sold as an assembly; its mounting plate and cable bracket are drawn under ref 51. Lever hardware (refs 31 to 38) is drawn on all four levers. Which carburetors take the straight nipple (45) or the elbow (46), and which take the long (50) or short (49) vent hose, isn't readable from the picture; the split shown is a guess.",
    stages: [
      { t: "Jets", d: "Fit the needle jet from below, then the bleeder pipe with its O-ring, the main jet into the bleeder pipe, and the pilot jet. Jet sizes: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Float valve", d: "Fit the float valve seat with a new gasket and drop the needle into it." },
      { t: "Floats", d: "Set the floats in place and push the float pin through the posts. Float height: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Float chamber", d: "Fit a new gasket, then the float chamber with its four screws and lock washers. Fit the drain screw with a new O-ring." },
      { t: "Pilot air screw", d: "Fit the O-ring and spring, then turn the pilot air screw in gently until it seats and back it out to the setting in the factory service manual." },
      { t: "Jet needle into the slide", d: "Drop the washer into the slide, then the jet needle with its clip and ring, the spring and the throttle valve plate. Clip position: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Connector", d: "Fit the connector on top of the plate and fix it with two screws and lock washers." },
      { t: "Slide into the body", d: "Slide the throttle valve into the chamber with the groove lined up with the guide. It should drop freely." },
      { t: "Top cover", d: "Fit a new gasket and the top cover over the connector rod, then the two screws and lock washers." },
      { t: "Join No. 3", d: "Fit seals on a delivery pipe, push it into No. 4 and slide No. 3 onto it." },
      { t: "Join No. 2", d: "Same again: delivery pipe and seals into No. 3, then slide No. 2 on." },
      { t: "Join No. 1", d: "Delivery pipe and seals into No. 2, then slide No. 1 on. The four carburetors are now one bank." },
      { t: "Mounting plate", d: "Fit the mounting plate over the intake spigots and fix it to each carburetor with a top screw and lock washer and a bottom screw." },
      { t: "Throttle shaft", d: "Slide the throttle shaft through the plate tabs, picking up the lever for each carburetor." },
      { t: "Lever hardware", d: "Clamp each lever with its bolt and lock washer, pin it to the slide link with the pin and spring, and fit the adjusting screw with washer, lock washer and nut. Synchronising: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Return spring and idle screw", d: "Hook the throttle return spring between the plate and the pulley. Fit the idle adjuster with its spring against the stop lever." },
      { t: "Choke shaft", d: "Slide the starter shaft through the tabs, fit the washers and spring on the left end and the starter lever with its screw on the right end." },
      { t: "Cable bracket", d: "Fit the cable bracket with its gasket, two screws and lock washers, then the cable adjuster and nut." },
      { t: "Overflow nipples", d: "Press an overflow nipple into each carburetor." },
      { t: "Hoses", d: "Push the overflow hoses onto the nipples and the vent hoses onto the vent nipples. Route them clear of the chain and exhaust." },
    ],
    parts: P,
  };
})();
D3_MODELS["CMS-BLCK0007"] = D3_BLCK0007;
