/* ============ 3D parts model: fuel cock, GS750 1977 (CMSNL BLCK0036) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: same as the front fork leg model (DG-CH-01): +X = rider's LEFT, +Y up, +Z forward. Right-handed, no mirrorX.
   Origin at the middle of the top face of the fuel cock flange, which is the face that seals against the mounting plate under
   the tank (the tank is on the fuel tank pages and isn't drawn here). The filter stands up from the flange into the tank,
   the lever is on the left (+X) face of the valve body, the outlet spigot points to the right (-X) and the hose runs back to the carburetors.
   Identity and numbering: CMSNL page BLCK0036 and its picture. Ref 1 is the complete fuel cock; its body, filter, lever, lever
   plate and plate screws come only with it, so they are drawn as separate pieces that all carry ref 1.
   Geometry: APPROXIMATE. No size here is a factory measurement. VERIFY IN FACTORY SERVICE MANUAL. */
const D3_BLCK0036 = (() => {
  const VY = -28; // valve (lever) axis height, along X
  const stad = (a, b, n = 10) => { // stadium outline: straight length 2a along the first axis, end radius b
    const p = []; for (let i = 0; i <= n; i++) { const t = -Math.PI / 2 + Math.PI * i / n; p.push([a + b * Math.cos(t), b * Math.sin(t)]); }
    for (let i = 0; i <= n; i++) { const t = Math.PI / 2 + Math.PI * i / n; p.push([-a + b * Math.cos(t), b * Math.sin(t)]); } return p; };
  const hosePts = [[-23, -30, 0], [-34, -30, 0], [-50, -32, 0], [-68, -45, -10], [-80, -75, -30], [-84, -115, -50]];
  const cd = [-.09, -.89, -.45]; // hose direction at its far end
  const clipA = [-83.6, -111, -48];
  const parts = [
    { id: "body", ref: "1", name: "Fuel cock body", mat: "alu", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, 1, 0],
      geom: { type: "group", items: [
        { type: "extrude", pts: stad(20, 15), holes: [[25, 0, 3.3], [-25, 0, 3.3], [0, 0, 7]], depth: 6, bevel: .5, rot: [90, 0, 0] },   // flange
        { type: "box", size: [30, 12, 24], r: 2, at: [0, -10, 0] },                                       // neck
        { type: "cyl", r: 16, h: 32, axis: "x", at: [-16, VY, 0] },                                     // valve body
        { type: "box", size: [8, 44, 18], r: 2, at: [12, VY, 0] },                                       // screw bosses for the lever plate
        { type: "cyl", r: 7, h: 6, axis: "x", at: [-22, VY - 2, 0] },                                    // outlet boss
        { type: "cyl", r: 4, h: 14, axis: "x", at: [-36, VY - 2, 0], mat: "brass" },                     // outlet spigot
        { type: "lathe", pts: [[0, 0], [5, 0], [4, 3], [0, 3]], rot: [0, 0, 90], at: [-33, VY - 2, 0], mat: "brass" },  // barb
        { type: "lathe", pts: [[0, 0], [9, 0], [7, 8], [0, 8]], rot: [180, 0, 0], at: [0, VY - 14, 0] },  // sediment bowl boss underneath
      ] } },
    { id: "gask4", ref: "4", name: "Gasket (fuel cock to tank)", mat: "rubber", small: true, parent: "body", stage: 3, A: [0, 0, 0], E: [0, 40, 0], dir: [0, -1, 0],
      geom: { type: "extrude", pts: stad(20, 13), holes: [[25, 0, 3.3], [-25, 0, 3.3], [0, 0, 7]], depth: 1.5, bevel: 0, rot: [-90, 0, 0] } },
    { id: "filter", ref: "1", name: "Filter (with the fuel pipes, part of the fuel cock)", mat: "dark", parent: "body", stage: 3, A: [0, 1.5, 0], E: [0, 72, 0], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "cyl", r: 6.6, h: 7.5, at: [0, -7.5, 0], mat: "brass" },                                 // spigot into the flange
        { type: "cyl", r: 7.5, h: 44 },                                                                  // screen
        { type: "cyl", r: 8.2, h: 2, at: [0, 44, 0], mat: "brass" },
        { type: "cyl", r: 8.2, h: 2, mat: "brass" },
        { type: "cyl", r: 3.2, h: 30, at: [0, 46, 0], mat: "brass" },                                    // main pipe
        { type: "lathe", pts: [[2, 0], [3.6, 0], [3.6, 1.5], [2, 1.5]], at: [0, 76, 0], mat: "brass" },
      ] } },
    { id: "gask3", ref: "3", name: "Gasket (lever side)", mat: "rubber", small: true, parent: "body", stage: 1, A: [16, VY, 0], E: [50, VY, 0], dir: [-1, 0, 0],
      geom: { type: "ringX", ro: 13, ri: 4, h: 1 } },
    { id: "vseal", ref: "2", name: "V seal (lever)", mat: "rubber", small: true, parent: "body", stage: 1, A: [17, VY, 0], E: [72, VY, 0], dir: [-1, 0, 0],
      geom: { type: "lathe", pts: [[5, 0], [12, 0], [12, .8], [8, 2.5], [5, 2.5]], rot: [0, 0, -90] } },
    { id: "lever", ref: "1", name: "Lever (part of the fuel cock)", mat: "chrome", parent: "body", stage: 2, A: [19.5, VY, 0], E: [100, VY, 0], dir: [-1, 0, 0],
      geom: { type: "group", items: [
        { type: "cyl", r: 12, h: 4.5, axis: "x" },
        { type: "cyl", r: 5, h: 3, axis: "x", at: [4.5, 0, 0] },
        { type: "box", size: [4.5, 9, 34], r: 1.2, at: [9.75, 0, 0], mat: "black" },
        { type: "box", size: [2, 2, 26], r: .5, at: [12.6, 0, 0], mat: "black" },                         // ridge on the handle
      ] } },
    { id: "plate", ref: "1", name: "Lever plate (part of the fuel cock)", mat: "steel", parent: "body", stage: 2, A: [26.5, VY, 0], E: [130, VY, 0], dir: [-1, 0, 0],
      geom: { type: "extrude", pts: stad(11, 11).map(([y, z]) => [z, y]), holes: [[0, 16, 2.2], [0, -16, 2.2], [0, 0, 5.5]], depth: 2.5, bevel: .3, rot: [0, -90, 0] } },
    { id: "pscrews", ref: "1", name: "Screws (lever plate, part of the fuel cock)", mat: "zinc", small: true, count: 2, parent: "plate", stage: 2, A: [26.5, VY, 0], E: [170, VY, 0], dir: [-1, 0, 0],
      geom: { type: "pair", at: [[0, 16, 0], [0, -16, 0]], item: { type: "screwX", head: 2, headR: 3.2, len: 10, r: 2, rot: [0, 180, 0] } } },
    { id: "bgask", ref: "6", name: "Gaskets (mounting bolts)", mat: "brass", small: true, count: 2, parent: "body", stage: 4, A: [0, -7.5, 0], E: [0, -55, 0], dir: [0, 1, 0],
      geom: { type: "pair", at: [[25, 0, 0], [-25, 0, 0]], item: { type: "ring", ro: 6, ri: 3.1, h: 1.5 } } },
    { id: "bolts", ref: "5", name: "Bolts (6 x 20, fuel cock to tank)", mat: "zinc", small: true, count: 2, parent: "body", stage: 4, A: [0, -7.5, 0], E: [0, -90, 0], dir: [0, 1, 0],
      geom: { type: "pair", at: [[25, 0, 0], [-25, 0, 0]], item: { type: "group", items: [{ type: "hex", af: 10, h: 4.5, y: -4.5 }, { type: "cyl", r: 3, h: 20 }] } } },
    { id: "hose", ref: "7", name: "Fuel hose (to the carburetors)", mat: "rubber", parent: "body", stage: 5, A: [0, 0, 0], E: [-70, 0, 0], dir: [1, 0, 0],
      geom: { type: "tube", r: 5.5, pts: hosePts } },
    { id: "clip", ref: "8", name: "Clip (hose)", mat: "spring", small: true, parent: "hose", stage: 5, A: clipA, E: clipA.map((v, i) => v + cd[i] * 45), dir: cd.map(v => -v),
      geom: { type: "clip", R: 6.6, r: 1.1, gap: .5, rot: [-27, 0, 0] } },
  ];
  return {
    id: "CMS-BLCK0036", title: "Fuel cock", units: "mm", page: "BLCK0036",
    accuracy: "Approximate geometry. Which part fits where follows the CMSNL picture for this page; shapes and sizes are modelled to a typical 1970s manual fuel cock, not measured from a GS750. Check every fit and size against the real part and the factory service manual.",
    view: { dir: [1.1, .7, .9], up: [0, 1, 0] },
    notModelled: "Refs 1-1 to 1-3 are the same complete fuel cock under different part numbers; one is drawn. Its body, filter, lever, lever plate and plate screws aren't sold separately, so they all carry ref 1. The pick-up pipes inside the filter, the tank and the carburetor end of the hose are not drawn.",
    stages: [
      { t: "Lever seals", d: "Fit the gasket and a new V seal into the lever bore on the left face of the body." },
      { t: "Lever", d: "Fit the lever, then the lever plate and its two screws. Turn the lever through each position and check it moves without sticking." },
      { t: "Filter and tank gasket", d: "Push the filter onto the top of the flange and lay a new gasket on the flange." },
      { t: "Mount to the tank", d: "Hold the fuel cock up to the plate under the tank, filter first, and fit the two bolts with new gaskets. Tighten evenly. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Fuel hose", d: "Push the hose over the outlet spigot and route it to the carburetors. Fit the clip on the hose end and check for leaks with fuel in the tank." },
    ],
    parts,
  };
})();
D3_MODELS["CMS-BLCK0036"] = D3_BLCK0036;
