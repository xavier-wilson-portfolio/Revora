/* ============ 3D parts model: oil pump, GS750B 1977 (CMSNL BLCK0050) ============
   Mechanical data only. Units: millimetres.
   World frame: oil pump shaft axis along X through the origin, +X outboard (right side, toward the clutch),
   +Y up, +Z forward. X = 0 is the pump's mounting face against the crankcase (crankcase not drawn).
   The oil strainer hangs under the crankcase in the sump, inboard of the pump; Y = -80 is the underside of the case there.
   Identity and numbering: CMSNL oil pump (GS750B) page, refs 1 to 9.
   The pump is only sold complete (ref 1), so the body, cover, trochoid rotors and shaft are drawn as one part.
   Geometry: APPROXIMATE. O-ring size (1.9 x 13 ID) and pin size (4 x 15.8) come from the catalogue descriptions;
   everything else is typical 1970s Suzuki trochoid pump proportions, not factory measurements. */
const D3_BLCK0050 = (() => {
  const arc = (cx, cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
  // pump-local frame: shaft along +Y (rotated to world +X by rot [0,0,-90]); local x -> world -Y, local z -> world Z
  const EAR = [90, 210, 330].map(a => [37 * Math.cos(a * Math.PI / 180), 0, -37 * Math.sin(a * Math.PI / 180)]);
  const PORTS = [[17.3, 0, -10], [0, 0, 20]];
  const pump = { type: "group", rot: [0, 0, -90], items: [
    // pump body (rotor housing), hollow on the shaft line
    { type: "lathe", pts: [[5.2, 0], [30, 0], [30, 24], [29.4, 25], [5.2, 25]] },
    // three mounting ears on the mounting face
    { type: "array", pos: [[0, 0, 0, 90], [0, 0, 0, 210], [0, 0, 0, 330]], item: { type: "extrude", depth: 8, bevel: .5, rot: [-90, 0, 0], holes: [[37, 0, 3.3]],
      pts: [[22, -9], [37, -7], ...arc(37, 0, 7, -90, 90, 10).slice(1, 10), [37, 7], [22, 9]] } },
    // port spigots on the mounting face (O-rings ref 2 go on these)
    { type: "array", pos: PORTS, item: { type: "group", items: [
      { type: "lathe", pts: [[4.5, -3.5], [6.5, -3.5], [6.5, .2], [4.5, .2]] },
      { type: "cyl", r: 4.5, h: .5, at: [0, -1, 0], mat: "black" } ] } },
    // cover with the shaft boss
    { type: "lathe", pts: [[5.2, 25.4], [29.4, 25.4], [29.4, 31], [27.5, 33.5], [11, 33.5], [10, 38], [5.2, 38]] },
    // cover screws (part of the pump assembly)
    { type: "array", pos: [30, 150, 270].map(a => [22 * Math.cos(a * Math.PI / 180), 0, -22 * Math.sin(a * Math.PI / 180)]), item: { type: "group", items: [
      { type: "lathe", pts: [[0, 33.5], [3.6, 33.5], [3.6, 35], [2.6, 36.2], [0, 36.2]], mat: "zinc" },
      { type: "box", size: [4.4, .6, .8], r: .2, at: [0, 36.1, 0], mat: "black" },
      { type: "box", size: [.8, .6, 4.4], r: .2, at: [0, 36.1, 0], mat: "black" } ] } },
    // trochoid rotor set inside the body (seen with See through)
    { type: "ring", ro: 22, ri: 16, h: 12, at: [3, 7, 0], mat: "steel" },
    { type: "gear", r: 15.4, teeth: 4, toothH: 5, h: 12, bore: 5, at: [0, 7, 0], mat: "dark" },
    // shaft, sticking out of the cover boss, with the pin hole and circlip groove
    { type: "cyl", r: 5, h: 51, at: [0, 7, 0], mat: "steel" },
    { type: "torus", R: 4.85, r: .45, at: [0, 54.6, 0], mat: "dark" } ] };
  return {
    id: "CMS-BLCK0050", title: "Oil pump (GS750B)", units: "mm", page: "BLCK0050",
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL oil pump (GS750B) page. Only the O-ring (1.9 x 13 mm) and pin (4 x 15.8 mm) sizes are catalogue figures; the pump, gear and strainer shapes follow typical 1970s Suzuki trochoid pump proportions, not measurements of a GS750. Use the factory service manual for every dimension.",
    view: { dir: [1.2, .75, 1.1], up: [0, 1, 0] },
    notModelled: "Refs 1-1 and 1-2 are two versions of the same complete pump (the later one supersedes), so one pump is drawn as ref 1. The pump's body, cover, rotors and shaft aren't sold separately and are shown as part of it. The crankcase, oil pan and the oil pump drive gear behind the clutch are on other pages and aren't drawn, so the pump and strainer are shown where they sit against the case without the case itself.",
    stages: [
      { t: "O-rings on the pump ports", d: "Fit new O-rings over the two port spigots on the back face of the pump. A smear of clean engine oil keeps them from rolling." },
      { t: "Pump mounting screws", d: "Offer the pump up to the crankcase with the spigots in their holes, then fit the three screws through the ears. Thread locker and torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Shim on the shaft", d: "Slide the shim over the shaft against the cover boss." },
      { t: "Drive pin", d: "Push the pin through the cross-hole in the shaft so it sticks out evenly on both sides." },
      { t: "Driven gear", d: "Slide the driven gear on with the slots in its hub over the pin. Check it meshes with the drive gear." },
      { t: "Circlip", d: "Fit the circlip in the groove at the end of the shaft, sharp edge out. Use a new one if it's lost its tension." },
      { t: "Oil strainer", d: "Clean the strainer screen and hold it up to the underside of the crankcase over the pickup." },
      { t: "Strainer screws", d: "Fit the screws up through the strainer flange into the case. Torque: VERIFY IN FACTORY SERVICE MANUAL. Then refit the oil pan and fill with oil (grade and capacity: VERIFY IN FACTORY SERVICE MANUAL)." },
    ],
    parts: [
      { id: "pump", shell: true, ref: "1", name: "Oil pump assembly", mat: "alu", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [-1, 0, 0], geom: pump },
      { id: "orings", ref: "2", name: "O-rings (pump ports)", mat: "rubber", small: true, parent: "pump", stage: 1, A: [-1.75, 0, 0], E: [-45, 0, 0], dir: [1, 0, 0], count: 2,
        geom: { type: "array", rot: [0, 0, -90], pos: PORTS, item: { type: "torus", R: 7.45, r: .95 } } },
      { id: "screws", ref: "3", name: "Pump mounting screws", mat: "zinc", small: true, parent: "pump", stage: 2, A: [8, 0, 0], E: [95, 0, 0], dir: [-1, 0, 0], count: 3,
        geom: { type: "array", rot: [0, 0, -90], pos: EAR, item: { type: "group", items: [
          { type: "lathe", pts: [[0, -25], [2.6, -25], [3, -24.4], [3, 0], [5.5, 0], [5.5, 1.8], [4.2, 4], [0, 4]] },
          { type: "box", size: [6.4, .8, 1.1], r: .2, at: [0, 3.9, 0], mat: "black" },
          { type: "box", size: [1.1, .8, 6.4], r: .2, at: [0, 3.9, 0], mat: "black" } ] } } },
      { id: "shim", ref: "5", name: "Shim (pump shaft)", mat: "steel", small: true, parent: "pump", stage: 3, A: [38, 0, 0], E: [130, 0, 0], dir: [-1, 0, 0],
        geom: { type: "ring", ro: 9.5, ri: 5.1, h: 1, rot: [0, 0, -90] } },
      { id: "pin", ref: "6", name: "Pin (gear drive, 4 x 15.8)", mat: "steel", small: true, parent: "pump", stage: 4, A: [46, 0, 0], E: [150, 0, -60], dir: [0, 0, 1],
        geom: { type: "cyl", r: 2, h: 15.8, axis: "z", at: [0, 0, -7.9] } },
      { id: "gear", ref: "4", name: "Oil pump driven gear", mat: "steel", parent: "pump", stage: 5, A: [39.2, 0, 0], E: [180, 0, 0], dir: [-1, 0, 0],
        geom: { type: "group", rot: [0, 0, -90], items: [
          { type: "lathe", pts: [[5.1, 0], [9.5, 0], [9.5, 14], [5.1, 14]] },
          { type: "gear", r: 27, teeth: 48, toothH: 2.2, h: 7, bore: 9.4, at: [0, 5, 0], holes: [0, 90, 180, 270].map(a => [17 * Math.cos(a * Math.PI / 180), 17 * Math.sin(a * Math.PI / 180), 4]) },
          // slots in the hub face that take the pin
          { type: "box", size: [19.4, 4, 4.4], r: .3, at: [0, 1.6, 0], mat: "dark" } ] } },
      { id: "circlip", ref: "7", name: "Circlip (driven gear)", mat: "spring", small: true, parent: "pump", stage: 6, A: [54.6, 0, 0], E: [215, 0, 0], dir: [-1, 0, 0],
        geom: { type: "clip", R: 5.6, r: .75, gap: .6, rot: [0, 0, -90] } },
      { id: "strainer", ref: "8", name: "Oil strainer", mat: "steel", stage: 7, A: [-110, -80, 0], E: [-110, -170, 0], dir: [0, 1, 0],
        geom: { type: "group", items: [
          // mounting flange with two screw ears, top face against the crankcase
          { type: "extrude", depth: 2, bevel: .3, rot: [-90, 0, 0], at: [0, -2, 0], holes: [[-60, 0, 3.3], [60, 0, 3.3]],
            pts: [[-50, -24], [50, -24], [52, -8], ...arc(60, 0, 8, -90, 90, 10).slice(1, 10), [52, 8], [50, 24], [-50, 24], [-52, 8], ...arc(-60, 0, 8, 90, 270, 10).slice(1, 10), [-52, -8]] },
          // screen basket below the flange
          { type: "box", size: [96, 12, 42], r: 2, at: [0, -8, 0], mat: "steel" },
          { type: "box", size: [90, .6, 36], r: .2, at: [0, -14, 0], mat: "dark" },
          { type: "array", pos: Array.from({ length: 9 }, (_, i) => [-40 + i * 10, 0, 0]), item: { type: "box", size: [1.2, 1.2, 38], r: .3, at: [0, -14.4, 0] } } ] } },
      { id: "sscrews", ref: "9", name: "Strainer screws (6 x 12)", mat: "zinc", small: true, parent: "strainer", stage: 8, A: [-110, -82, 0], E: [-110, -215, 0], dir: [0, 1, 0], count: 2,
        geom: { type: "array", pos: [[-60, 0, 0], [60, 0, 0]], item: { type: "group", items: [
          { type: "lathe", pts: [[0, 12], [2.6, 12], [3, 11.4], [3, 0], [5.2, 0], [5.2, -1.6], [4, -3.6], [0, -3.6]] },
          { type: "box", size: [6, .8, 1.1], r: .2, at: [0, -3.5, 0], mat: "black" },
          { type: "box", size: [1.1, .8, 6], r: .2, at: [0, -3.5, 0], mat: "black" } ] } } },
    ],
  };
})();
D3_MODELS["CMS-BLCK0050"] = D3_BLCK0050;
