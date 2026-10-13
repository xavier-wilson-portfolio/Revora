/* ============ 3D parts model: one carburetor, slide type (hand-made diagram DG-FU-01) ============
   Mechanical data only. Units: millimetres. Frame (same as the bank model in d3_blck0007.js, which this file reuses):
   +X = rider's LEFT, +Y up, +Z forward. Origin where the bore axis (along Z) meets the slide axis (along Y).
   Air side (bell mouth) faces the rear (-Z), the intake spigot faces forward (+Z).
   Drawn as carburetor No. 1 (left end of the bank), with the fuel delivery pipe on its right side toward No. 2.
   Refs: the GS750B carburetor page (BLCK0005) has a picture but no parts list, so refs and names come from the
   GS750N/EN page (BLCK0007), which lists the same carburetor parts. `k` links a part to the matching item of the
   2D drawing of DG-FU-01. Geometry: APPROXIMATE, no factory sizes: VERIFY IN FACTORY SERVICE MANUAL. */
const D3_FU01 = (() => {
  const G = D3_CARB, O = [0, 0, 0], add = (a, b) => a.map((v, i) => v + b[i]), P = [];
  const p = (id, ref, k, name, mat, geom, stage, d, dir, parent, extra) => P.push(Object.assign({ id, ref, name, mat, geom, A: O, E: add(O, d), dir, stage, parent: parent === undefined ? "body" : parent }, k ? { k } : {}, extra || {}));
  const S = { jets: 1, valve: 2, floats: 3, bowl: 4, pilot: 5, needle: 6, conn: 7, slide: 8, cover: 9, pipe: 10, hose: 11 };
  P.push({ id: "body", ref: "1", k: "body", name: "Carburetor body", mat: "alu", shell: true, stage: 0, A: O, E: O, dir: [0, -1, 0], geom: G.core() });
  p("njet", "14", "njet", "Needle jet", "brass", G.needleJet(), S.jets, [0, -45, 0], [0, 1, 0], null, { small: true });
  p("bleed", "15", null, "Bleeder pipe (jet holder)", "brass", G.bleeder(), S.jets, [0, -65, 0], [0, 1, 0]);
  p("bleedor", "16", null, "O-ring (bleeder pipe)", "rubber", G.bleederOring(), S.jets, [0, -60, 0], [0, 1, 0], "bleed", { small: true });
  p("mjet", "17", "mjet", "Main jet", "brass", G.mainJet(), S.jets, [0, -75, 0], [0, 1, 0], "bleed", { small: true });
  p("pjet", "21", "pjet", "Pilot jet", "brass", G.pilotJet(), S.jets, [0, -55, 0], [0, 1, 0], null, { small: true });
  p("vgask", "13", null, "Gasket (float valve seat)", "brass", G.valveGasket(), S.valve, [0, -42, 0], [0, 1, 0], null, { small: true });
  p("fvalve", "12", "fvalve", "Float needle valve (needle and seat)", "brass", G.needleValve(), S.valve, [0, -50, 0], [0, 1, 0]);
  p("floats", "7", "floats", "Floats", "brass", G.floats(), S.floats, [0, -100, 0], [0, 1, 0]);
  p("fpin", "8", null, "Float pin", "steel", G.floatPin(), S.floats, [45, -100, 0], [-1, 0, 0], null, { small: true });
  p("gask9", "9", "gasket", "Float chamber gasket", "rubber", G.gasket9(), S.bowl, [0, -125, 0], [0, 1, 0], null, { small: true });
  p("bowl", "1", "bowl", "Float chamber (part of the carburetor)", "alu", G.bowl(), S.bowl, [0, -140, 0], [0, 1, 0], null, { shell: true });
  p("bowlw", "6", null, "Lock washers (float chamber screws)", "spring", G.bowlLockW(), S.bowl, [0, -150, 0], [0, 1, 0], "bowl", { small: true, count: 4 });
  p("bowls", "5", null, "Screws (float chamber)", "zinc", G.bowlScrews(), S.bowl, [0, -195, 0], [0, 1, 0], "bowl", { small: true, count: 4 });
  p("drainor", "10", null, "O-ring (drain screw)", "rubber", G.drainOring(), S.bowl, [0, -205, 0], [0, 1, 0], "bowl", { small: true });
  p("drain", "11", null, "Drain screw", "zinc", G.drainScrew(), S.bowl, [0, -215, 0], [0, 1, 0], "bowl", { small: true });
  p("psor", "19", null, "O-ring (pilot air screw)", "rubber", G.pilotOring(), S.pilot, [-40, 0, 0], [1, 0, 0], null, { small: true });
  p("pspr", "20", null, "Spring (pilot air screw)", "spring", G.pilotSpring(), S.pilot, [-50, 0, 0], [1, 0, 0], null, { small: true });
  p("pscrew", "18", "pscrew", "Pilot air screw", "zinc", G.pilotScrew(), S.pilot, [-75, 0, 0], [1, 0, 0]);
  p("slide", "39", "slide", "Throttle valve (slide)", "chrome", G.slide(), S.slide, [0, 80, 0], [0, -1, 0], null, { shell: true });
  p("nwash", "25", null, "Washer (jet needle)", "steel", G.needleWasher(), S.needle, [0, 128, 0], [0, -1, 0], "slide", { small: true });
  p("needle", "22", "needle", "Jet needle", "chrome", G.needle(), S.needle, [0, 162, 0], [0, -1, 0], "slide");
  p("nclip", "23", null, "Clip (jet needle)", "spring", G.needleClip(), S.needle, [14, 162, 0], [-1, 0, 0], "needle", { small: true });
  p("nring", "26", null, "Ring (jet needle)", "rubber", G.needleRing(), S.needle, [0, 176, 0], [0, -1, 0], "needle", { small: true });
  p("nspr", "24", "spring", "Spring (jet needle)", "spring", G.needleSpring(), S.needle, [0, 180, 0], [0, -1, 0], "slide");
  p("vplate", "27", "retainer", "Throttle valve plate (needle retainer)", "steel", G.valvePlate(), S.needle, [0, 190, 0], [0, -1, 0], "slide");
  p("conn", "28", null, "Connector (slide lift link)", "steel", G.connector(), S.conn, [0, 196, 0], [0, -1, 0], "slide");
  p("connw", "30", null, "Lock washers (connector screws)", "spring", G.connLockW(), S.conn, [0, 246, 0], [0, -1, 0], "conn", { small: true, count: 2 });
  p("conns", "29", null, "Screws (connector)", "zinc", G.connScrews(), S.conn, [0, 252, 0], [0, -1, 0], "conn", { small: true, count: 2 });
  p("gask40", "40", null, "Gasket (top cover)", "rubber", G.gasket40(), S.cover, [0, 240, 0], [0, -1, 0], null, { small: true });
  p("cover", "1", "cap", "Top cover (part of the carburetor)", "alu", G.cover(), S.cover, [0, 250, 0], [0, -1, 0], null, { shell: true });
  p("coverw", "42", null, "Lock washers (top cover screws)", "spring", G.coverLockW(), S.cover, [0, 256, 0], [0, -1, 0], "cover", { small: true, count: 2 });
  p("covers", "41", null, "Screws (top cover)", "zinc", G.coverScrews(), S.cover, [0, 276, 0], [0, -1, 0], "cover", { small: true, count: 2 });
  P.push({ id: "pipe", ref: "43", name: "Fuel delivery pipe (to carburetor No. 2)", mat: "brass", parent: "body", stage: S.pipe, A: [-37, -26, 8], E: [-95, -26, 8], dir: [1, 0, 0], geom: G.pipe() });
  P.push({ id: "seals", ref: "44", name: "Seals (delivery pipe)", mat: "rubber", parent: "pipe", stage: S.pipe, A: [-37, -26, 8], E: [-95, -40, 8], dir: [1, 0, 0], small: true, count: 2, geom: G.pipeSeals() });
  p("nip", "45", null, "Nipple (overflow)", "brass", G.nippleStraight(), S.hose, [0, 0, -31], [0, 0, 1], null, { small: true });
  p("hose", "47", null, "Overflow hose", "rubber", G.hoseStraight(), S.hose, [0, -30, -105], [0, 1, 0], "nip");
  p("vent", "49", null, "Vent hose (short)", "rubber", G.ventShort(), S.hose, [0, 0, -52], [0, 0, 1]);
  return {
    id: "DG-FU-01", title: "Carburetor (one of four), slide type", units: "mm", page: "BLCK0007",
    accuracy: "Approximate geometry. Shapes follow the CMSNL GS750B carburetor picture (BLCK0005) and Mikuni slide-carburetor construction. Refs and names come from the GS750N/EN carburetor page (BLCK0007), which lists the same carburetor; the B page has no parts list. Sizes are approximate, not measured. Check every size, jet and setting in the factory service manual.",
    view: { dir: [-1, .8, -1.1], up: [0, 1, 0] },
    notModelled: "Ref numbers are from the GS750N/EN page (BLCK0007); the GS750B picture numbers some parts differently (for example the slide is 35 there, 39 here). One carburetor is drawn, as No. 1: ref 0 (set of four) and refs 2 to 4 (the other three carburetors) aren't drawn. Its top cover and float chamber carry ref 1 because they are only sold with the carburetor. The parts shared by the bank (mounting plate 51, throttle shaft 64, lever hardware 31 to 38, choke shaft 52 to 55, 65, 66, return spring 59, idle adjuster 62, 63, cable bracket parts 56 to 58, 67, 68, plate screws 48, 60, 61, elbow nipple 46 and long vent hose 50) are on the 'Carburetors (bank of four)' model.",
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
      { t: "Delivery pipe", d: "Fit a seal on each end of the delivery pipe and push it into the side of the body. The next carburetor slides onto the other end." },
      { t: "Nipple and hoses", d: "Press in the overflow nipple, then push on the overflow hose and the vent hose." },
    ],
    parts: P,
  };
})();
D3_MODELS["DG-FU-01"] = D3_FU01;
