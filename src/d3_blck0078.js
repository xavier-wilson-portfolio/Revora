/* ============ 3D parts model: wiring harness, GS750C/EC/N/EN (CMSNL BLCK0078) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: +X = rider's left, +Y up, +Z forward (same as d3_fork.js).
   The main harness runs along the frame backbone from the headlamp (front, Z = +330 breakout) to under the seat
   (Z = -380 breakout). The frame itself is on another page and is not drawn, so the clamps, guide, horn, switch
   brackets and ignition switch bolts are shown where they grip the harness or the missing frame tabs would be.
   Geometry: APPROXIMATE. Layout and which part goes where follow the CMSNL picture for this page; lengths, routing
   and sizes are guesses for a 1970s 750 cc frame, not measured from a GS750. */
const D3_BLCK0078 = (() => {
  const conn = (at, size, mat) => ({ type: "box", size: size || [14, 10, 16], r: 1.5, at, mat: mat || "black" });
  const bullet = (at, axis) => ({ type: "cyl", r: 2.6, h: 10, axis: axis || "z", at, mat: "brass" });
  const ALONG_Z = [90, 0, 0];                       // lathe/torus around Y -> around Z (the harness direction)
  const TRUNK = [[0, 40, 330], [0, 60, 250], [0, 68, 150], [0, 62, 60], [0, 55, 0], [0, 48, -75], [0, 40, -150], [0, 28, -230], [0, 20, -300], [0, 12, -380]];
  const br = (pts, r) => ({ type: "tube", r: r || 2.2, pts });
  const harness = { type: "group", items: [
    { type: "tube", r: 6, pts: TRUNK },
    { type: "lathe", pts: [[0, -8], [7.5, -8], [7.5, 8], [0, 8]], rot: ALONG_Z, at: [0, 40, 330], mat: "dark" },   // tape at the front breakout
    // front breakout: headlamp shell couplers, handlebar switches, ignition switch, horn
    br([[0, 40, 330], [12, 34, 360], [26, 22, 392], [32, 14, 404]]), conn([33, 12, 412]),
    br([[0, 40, 330], [-12, 34, 360], [-26, 22, 392], [-32, 14, 404]]), conn([-33, 12, 412], [18, 12, 18]),
    br([[0, 40, 330], [0, 52, 372], [0, 66, 404], [0, 70, 410]]), conn([0, 78, 416], [16, 12, 14]),
    br([[0, 40, 330], [26, 44, 346], [48, 44, 356], [58, 42, 360]]), bullet([62, 42, 354], "x"), bullet([62, 36, 362], "x"),
    br([[0, 40, 330], [-26, 44, 346], [-48, 44, 356], [-58, 42, 360]]), bullet([-72, 42, 354], "x"), bullet([-72, 36, 362], "x"),
    br([[0, 40, 330], [6, 0, 328], [16, -40, 324], [22, -72, 322]], 1.8), conn([24, -82, 322], [8, 10, 6]),
    // middle branch: regulator / rectifier and engine leads (right below the tie at Z = -150)
    br([[0, 40, -150], [14, 20, -162], [24, -14, -174], [26, -40, -180]]), conn([26, -50, -180], [12, 12, 10]),
    // brake light switch branch
    br([[0, 28, -230], [-18, 6, -240], [-40, -24, -250], [-50, -40, -252]], 2), conn([-52, -48, -252], [10, 10, 10]),
    // rear breakout: tail / stop lamp, rear turn signals, battery
    { type: "lathe", pts: [[0, -6], [7.5, -6], [7.5, 6], [0, 6]], rot: ALONG_Z, at: [0, 12, -380], mat: "dark" },
    br([[0, 12, -380], [20, 14, -404], [34, 18, -424]]), bullet([34, 18, -434]), br([[0, 12, -380], [-20, 14, -404], [-34, 18, -424]]), bullet([-34, 18, -434]),
    br([[0, 12, -380], [0, 26, -410], [0, 38, -430]]), conn([0, 42, -440], [16, 12, 12]) ] };
  const tie = (tail) => ({ type: "group", items: [
    { type: "torus", R: 7.6, r: 1.2, rot: ALONG_Z }, { type: "box", size: [6, 5, 7], r: .8, at: [0, 9.5, 0] },
    ...(tail ? [{ type: "tube", r: 1.2, pts: [[0, 12, 0], [8, 18, 0], [tail, 22, 0]] }] : []) ] });
  const IG = [0, 150, 470], HORN = [0, -130, 330], BS = [-70, -130, -250];
  const WIRE16 = [[26, -60, -180], [34, -100, -130], [40, -136, -50], [36, -160, 30], [30, -172, 78]];
  const parts = [
    { id: "harness", ref: "1", name: "Main wiring harness", mat: "black", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, -1, 0], geom: harness },
    { id: "boot", ref: "2", name: "Harness boot", mat: "rubber", parent: "harness", stage: 1, A: [0, 55, 0], E: [110, 55, 0], dir: [-1, 0, 0],
      geom: { type: "group", items: [{ type: "lathe", rot: ALONG_Z, pts: [[6.1, -22], [9.5, -22], [11, -17], [11, 17], [9.5, 22], [6.1, 22]] },
        { type: "cyl", r: 3, h: 8, at: [-5, 9, 8] }, { type: "cyl", r: 3, h: 8, at: [5, 9, -8] }] } },
    { id: "band4", ref: "4", name: "Band clamp (front of the backbone)", mat: "black", small: true, parent: "harness", stage: 2, A: [0, 60, 250], E: [110, 60, 250], dir: [-1, 0, 0],
      geom: { type: "group", items: [{ type: "lathe", rot: ALONG_Z, pts: [[6.1, -5], [8, -5], [8, 5], [6.1, 5]] }, { type: "box", size: [5, 16, 10], r: 1, at: [0, 14, 0] }] } },
    { id: "tie3", ref: "3", name: "Clamp (strap tie)", mat: "black", small: true, parent: "harness", stage: 2, A: [0, 68, 150], E: [110, 68, 150], dir: [-1, 0, 0], geom: tie(24) },
    { id: "tie19", ref: "19", name: "Clamp, 120 mm strap", mat: "black", small: true, parent: "harness", stage: 2, A: [0, 48, -75], E: [110, 48, -75], dir: [-1, 0, 0], geom: tie(40) },
    { id: "guide", ref: "5", name: "Harness guide (hook)", mat: "steel", parent: "harness", stage: 3, A: [0, 22.6, -300], E: [110, 22.6, -300], dir: [-1, 0, 0],
      geom: { type: "group", items: [
        { type: "tube", r: 1.4, pts: [[30, 30, 0], [22, 28, 0], [14, 18, 0], [10, 2, 0], [6, -8, 0], [-4, -10, 0], [-10, -2, 0], [-8, 6, 0]] },
        { type: "torus", R: 5, r: 1.4, at: [35, 30, 0] } ] } },
    { id: "washer7", ref: "7", name: "Washer (guide screw)", mat: "zinc", small: true, parent: "guide", stage: 3, A: [35, 54, -300], E: [145, 90, -300], dir: [0, -1, 0],
      geom: { type: "ring", ro: 6.5, ri: 3.2, h: 1.2 } },
    { id: "screw6", ref: "6", name: "Screw 6 x 12 (guide)", mat: "zinc", small: true, parent: "guide", stage: 3, A: [35, 55.2, -300], E: [145, 120, -300], dir: [0, -1, 0],
      geom: { type: "group", items: [{ type: "lathe", pts: [[0, -12], [3, -12], [3, 0], [5.5, 0], [5.5, 2], [4.3, 4], [0, 4]] },
        { type: "box", size: [6, 1.2, 1.2], r: .2, at: [0, 4, 0], mat: "black" }, { type: "box", size: [1.2, 1.2, 6], r: .2, at: [0, 4, 0], mat: "black" }] } },
    { id: "ign", ref: "8", name: "Ignition switch and steering lock assembly, with keys", mat: "chrome", stage: 4, A: IG, E: [0, 330, 470], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "box", size: [64, 14, 30], r: 2, at: [0, 7, 0], mat: "alu" },
        { type: "lathe", pts: [[0, 14], [17, 14], [17, 50], [15, 54], [0, 55]] },
        { type: "box", size: [3, 1, 12], r: .3, at: [0, 55, 0], mat: "black" },
        { type: "lathe", pts: [[0, -30], [14, -30], [14, 0], [0, 0]], mat: "black" },
        { type: "box", size: [2, 22, 8], r: .5, at: [0, 66, 0], mat: "steel" },
        { type: "extrude", pts: [[-12, 0], [12, 0], [14, 6], [11, 22], [-11, 22], [-14, 6]], holes: [[0, 15, 3]], depth: 3, bevel: .5, at: [0, 76, -1.5], mat: "black" },
        { type: "tube", r: 3, pts: [[0, -30, 0], [0, -42, -10], [0, -50, -34], [0, -52, -48]] }, conn([0, -62, -54], [16, 12, 14]),
        { type: "box", size: [2, 18, 7], r: .5, rot: [0, 0, 28], at: [24, 62, 10], mat: "steel" },
        { type: "extrude", pts: [[-11, 0], [11, 0], [13, 6], [10, 20], [-10, 20], [-13, 6]], holes: [[0, 13, 3]], depth: 3, bevel: .5, rot: [0, 0, 28], at: [20, 70, 8.5], mat: "black" } ] } },
    { id: "lockw10", ref: "10", name: "Lock washers (ignition switch)", mat: "spring", small: true, parent: "ign", stage: 4, A: [0, 138, 470], E: [0, 75, 520], dir: [0, 1, 0], count: 2,
      geom: { type: "pair", pos: [[22, 0, 0], [-22, 0, 0]], item: { type: "ring", ro: 6.6, ri: 4.1, h: 2, split: true } } },
    { id: "bolt9", ref: "9", name: "Bolts (ignition switch)", mat: "black", small: true, parent: "ign", stage: 4, A: [0, 138, 470], E: [0, 30, 520], dir: [0, 1, 0], count: 2,
      geom: { type: "pair", pos: [[22, 0, 0], [-22, 0, 0]], item: { type: "group", items: [
        { type: "lathe", pts: [[0, -6], [6.5, -6], [6.5, 0], [4, 0], [4, 24], [0, 24]] }, { type: "socket", y: -6, af: 5 }] } } },
    { id: "horn", ref: "13", name: "Horn with bracket", mat: "black", stage: 5, A: HORN, E: [0, -260, 330], dir: [0, 1, 0],
      geom: { type: "group", items: [
        { type: "lathe", rot: ALONG_Z, pts: [[0, -14], [20, -12], [38, -5], [46, 0], [46, 6], [44, 8], [8, 10], [6, 13], [0, 13]] },
        { type: "lathe", rot: ALONG_Z, pts: [[0, 10], [4, 10], [4, 14], [0, 14]], mat: "steel" },
        { type: "box", size: [16, 12, 5], r: 1, at: [0, 0, -16] },
        { type: "extrude", pts: [[-8, -6], [8, -6], [8, 60], [4, 68], [-4, 68], [-8, 60]], holes: [[0, 60, 4.2]], depth: 3, bevel: .4, at: [0, 0, -21.5], mat: "steel" },
        { type: "box", size: [3, 8, 6], r: .3, at: [24, 40, -8], mat: "brass" } ] } },
    { id: "washer15", ref: "15", name: "Washer (horn bolt)", mat: "zinc", small: true, parent: "horn", stage: 5, A: [0, -70, 311.5], E: [0, -200, 360], dir: [0, 0, -1],
      geom: { type: "ring", ro: 8, ri: 4.2, h: 1.6, rot: [90, 0, 0] } },
    { id: "bolt14", ref: "14", name: "Bolt 8 x 12 (horn)", mat: "zinc", small: true, parent: "horn", stage: 5, A: [0, -70, 313.1], E: [0, -200, 395], dir: [0, 0, -1],
      geom: { type: "group", rot: [90, 0, 0], items: [{ type: "lathe", pts: [[0, -12], [4, -12], [4, 0], [0, 0]] }, { type: "hex", af: 12, h: 5.5 }] } },
    { id: "bswitch", ref: "11", name: "Rear brake light switch", mat: "black", stage: 6, A: BS, E: [-200, -130, -250], dir: [0, 1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[0, -25], [7, -25], [7, 0], [0, 0]], mat: "steel" },
        { type: "hex", af: 17, h: 4, y: -12, mat: "steel" }, { type: "hex", af: 17, h: 4, y: -6, mat: "steel" },
        { type: "lathe", pts: [[0, 0], [9.5, 0], [9.5, 22], [7, 30], [0, 31]], mat: "rubber" },
        { type: "lathe", pts: [[0, -42], [2, -42], [2, -25], [0, -25]], mat: "steel" },
        { type: "torus", R: 2.4, r: .8, rot: [0, 0, 90], at: [0, -43, 0], mat: "steel" },
        { type: "tube", r: 2, pts: [[0, 30, 0], [4, 50, 0], [10, 60, 0], [16, 66, -2]] }, conn([18, 72, -2], [10, 10, 10]) ] } },
    { id: "spring12", ref: "12", name: "Brake light switch spring", mat: "spring", parent: "bswitch", stage: 6, A: [-70, -230, -250], E: [-200, -330, -250], dir: [0, 1, 0],
      geom: { type: "group", items: [{ type: "spring", R: 3.6, wire: .9, h: 48, turns: 16 },
        { type: "tube", r: .9, pts: [[3.6, 48, 0], [2, 52, 0], [0, 55, 0], [-2, 57.8, 0], [0, 59.8, 0]] },
        { type: "tube", r: .9, pts: [[3.6, 0, 0], [1, -6, 0], [0, -14, 0], [3, -18, 0], [5, -14, 0]] }] } },
    { id: "wire16", ref: "16", name: "Lead wire (engine switches)", mat: "black", parent: "harness", stage: 7, A: [0, 0, 0], E: [150, 0, 0], dir: [-1, 0, 0],
      geom: { type: "group", items: [{ type: "tube", r: 2.4, pts: WIRE16 }, conn([26, -62, -180], [10, 8, 10]),
        bullet([30, -172, 78]), bullet([24, -174, 76])] } },
    { id: "prot17", ref: "17", name: "Protector (terminal sleeve)", mat: "rubber", small: true, parent: "wire16", stage: 7, A: [27, -173, 82], E: [177, -173, 150], dir: [0, 0, -1],
      geom: { type: "lathe", rot: ALONG_Z, pts: [[5, -6], [8, -6], [8.5, 8], [5.5, 10], [3, 12], [2.5, 12], [2.5, 10], [5, 6]] } },
    { id: "clip18", ref: "18", name: "Clamp (wire clip)", mat: "spring", small: true, parent: "wire16", stage: 7, A: [40, -136, -50], E: [240, -136, -50], dir: [-1, 0, 0],
      geom: { type: "group", items: [{ type: "torus", R: 3.8, r: .8, rot: ALONG_Z }, { type: "tube", r: .8, pts: [[0, 3.8, 0], [0, 9, 2], [0, 14, -2], [0, 18, 3]] }] } },
  ];
  return {
    id: "CMS-BLCK0078", title: "Wiring harness (GS750C, EC, N, EN)", units: "mm", page: "BLCK0078",
    accuracy: "Approximate geometry. Which parts are on this page and how they fit follow the CMSNL picture; harness routing, lengths and every size are guesses for a 1970s 750 cc frame, not measured from a GS750. The frame is not drawn. Check wire colours and routing against the factory wiring diagram and service manual.",
    view: { dir: [-1.25, .7, .9], up: [0, 1, 0] },
    notModelled: "Refs 1-1 and 1-2 are two versions of the same main harness, drawn once as ref 1. The frame, top bridge and the brackets the clamps, horn and switches bolt to are on other pages.",
    stages: [
      { t: "Harness boot", d: "Slide the rubber boot over the junction in the middle of the harness before the harness goes on the frame." },
      { t: "Lay the harness and clamp it", d: "Lay the harness along the frame backbone, front breakout at the headlamp. Fit the band clamp at the front and the strap ties further back. Keep it clear of the steering stops." },
      { t: "Guide hook", d: "Hook the harness into the guide under the seat and screw the guide to the frame with its washer." },
      { t: "Ignition switch", d: "Fit the switch under the top bridge, two bolts with lock washers from below, then plug its lead into the harness coupler. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Horn", d: "Bolt the horn bracket to the frame tab with the washer under the bolt head, then push its lead onto the horn terminal." },
      { t: "Rear brake light switch", d: "Screw the switch into its bracket, hook the spring between the plunger and the brake pedal, and plug the lead into the harness. Set the switch height so the light comes on just as the brake starts to work." },
      { t: "Engine switch lead", d: "Plug the lead into the middle branch, run it down to the neutral and oil pressure switches, clip it in place and slide the protector over the terminals." },
    ],
    parts,
  };
})();
D3_MODELS["CMS-BLCK0078"] = D3_BLCK0078;
