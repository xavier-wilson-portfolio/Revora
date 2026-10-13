/* ============ 3D parts model: battery, holder, band and leads, GS750B 1977 (CMSNL BLCK0002) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: +X = rider's LEFT, +Y up, +Z forward (same as the fork model). Origin = centre of the underside of the
   battery holder floor. The holder is open on its left (+X) side; the battery slides in from that side and the rubber
   band hooks across the open side to hold it.
   Battery: drawn to the published outside size of a YB14L-A2 type 12 V battery (about 134 long x 89 wide x 166 high);
   it is ref 1 in the picture but is not sold on this page, so it carries no catalogue number here.
   Identity, numbering and layout: CMSNL battery page (refs 2-14) and its picture.
   Geometry: APPROXIMATE. Holder, band, lead and cushion shapes are typical for a 1970s Suzuki, not measured from a GS750.
   The fastener sizes in the names come from the Suzuki part numbers (01107-06168 = 6 x 16 bolt; washer and spacer sizes
   are in the catalogue descriptions). The frame the holder bolts to is on another page and is not drawn. */
(() => {
  const r1 = v => +v.toFixed(2);
  // ring terminal (eyelet) lying flat, barrel pointing at yaw degrees (0 = +Z, 90 = +X)
  const eyelet = (c, yaw) => ({ type: "group", rot: [0, yaw, 0], at: c, items: [
    { type: "ring", ro: 6.5, ri: 3.3, h: 1.2 },
    { type: "cyl", r: 3, h: 10, axis: "z", at: [0, .6, 6] } ] });
  const bEnd = (c, yaw) => { const a = yaw * Math.PI / 180; return [r1(c[0] + 16 * Math.sin(a)), r1(c[1] + .6), r1(c[2] + 16 * Math.cos(a))]; };
  // a cable with an eyelet on each end; world points, given relative to the part origin A
  const lead = (A, e0, e1, mids, r, mat) => {
    const L = p => [r1(p[0] - A[0]), r1(p[1] - A[1]), r1(p[2] - A[2])];
    return { type: "group", items: [
      Object.assign(eyelet(L(e0.c), e0.yaw), { mat: "brass" }),
      Object.assign(eyelet(L(e1.c), e1.yaw), { mat: "brass" }),
      { type: "tube", r, pts: [bEnd(e0.c, e0.yaw), ...mids, bEnd(e1.c, e1.yaw)].map(L), mat } ] };
  };

  const BY = 4.6;                       // battery underside sits on the protector mat
  const TOP = BY + 166;                 // battery top (lid) = 170.6
  const TT = TOP + 10;                  // terminal top = 180.6
  const LUG = [-20, 118.4, 88];         // holder mounting hole: underside of the lug sheet
  const W12 = 121.7, E7 = 123.3, E8 = 124.5, HEAD = 125.7; // stack on the lug: washer, eyelet 7, eyelet 8, bolt head

  const A8 = [28, TT, 52], A6 = [28, TT, -52], A7 = [LUG[0], E7, LUG[2]];

  const M = {
    id: "CMS-BLCK0002", title: "Battery", units: "mm", page: "BLCK0002",
    accuracy: "Approximate geometry. Part identity, numbering and layout follow the CMSNL battery page and its picture. The battery is drawn to the published outside size of a YB14L-A2 type battery; the holder, band, cushion and lead shapes and every other size are typical proportions, not measured from a GS750. Use the factory service manual for any dimension, lead routing or torque.",
    view: { dir: [1.1, .75, 1.05], up: [0, 1, 0] },
    lockView: true,
    notModelled: "Every catalogue ref is drawn. Refs 6 (two part numbers) and 10 (three part numbers) are running changes of the same part, so one of each is shown. The battery (ref 1 in the picture) isn't sold on this page; it is drawn without a number. The frame bracket the holder bolts to is on another page and isn't drawn.",
    stages: [
      { t: "Rubber protectors into the holder", d: "Lay the ribbed protector mat on the holder floor and stick the two small protectors to the inside of the holder wall." },
      { t: "Cushion and spacer in the mounting lug", d: "Push the rubber cushion into the hole in the holder's front lug, then slide the spacer into the cushion." },
      { t: "Battery in", d: "Slide the battery into the holder from the left side, terminals up and on the outside. Filling and charging a new battery: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Breather tube", d: "Push the breather tube onto the battery vent and run it down so the end is clear of the chain and frame. Routing: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Battery band", d: "Hook the rubber band over the pins at the front and back of the holder so it holds the battery in." },
      { t: "Positive lead", d: "Bolt the positive lead to the + terminal and push the rubber cap over it." },
      { t: "Ground leads and holder bolt", d: "Put the washer on the lug, then the eyelets of the starter lead and the short ground wire, and fit the bolt. Connect the other end of the ground wire to the - terminal last." },
    ],
    parts: [
      { id: "holder", shell: true, ref: "10", name: "Battery holder", mat: "black", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "box", size: [93.6, 1.6, 141.2], r: .6, at: [-.8, .8, 0] },                 // floor
          { type: "box", size: [1.6, 135, 141.2], r: .6, at: [-46.8, 67.5, 0] },              // inner (right) wall
          { type: "box", size: [91.6, 120, 1.6], r: .6, at: [-1.8, 60, 69.8] },               // front wall
          { type: "box", size: [91.6, 120, 1.6], r: .6, at: [-1.8, 60, -69.8] },              // rear wall
          { type: "extrude", pts: [[-40, -69], [0, -69], [0, -90], [-8, -98], [-32, -98], [-40, -90]], holes: [[-20, -88, 6.2]], depth: 1.6, bevel: 0, rot: [-90, 0, 0], at: [0, 118.4, 0] }, // front mounting lug
          { type: "extrude", pts: [[-40, 118], [20, 118], [20, 150], [12, 160], [-32, 160], [-40, 152]], holes: [[-25, 146, 4], [5, 146, 4]], depth: 1.6, bevel: 0, at: [0, 0, -70.6] }, // rear bracket
          { type: "pair", at: [[0, 0, 73.3], [0, 0, -73.3]], item: { type: "box", size: [3, 20, 6], r: .5, at: [41.5, 102, 0] } }, // band hook arms
          { type: "pair", at: [[41.5, 92, 77], [41.5, 92, -77]], item: { type: "cyl", r: 2.5, h: 22 } } ] } }, // band hook pins
      { id: "mat", ref: "3", name: "Battery protector (ribbed mat)", mat: "rubber", parent: "holder", stage: 1, A: [0, 0, 0], E: [0, 300, 0], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "box", size: [88, 1.6, 134], r: .4, at: [0, 2.4, 0] },
          { type: "array", pos: [-60, -48, -36, -24, -12, 0, 12, 24, 36, 48, 60].map(z => [0, 3.9, z]), item: { type: "box", size: [80, 1.4, 4], r: .4 } } ] } },
      { id: "pads", ref: "4", name: "Protectors, 20 x 9 (holder wall)", mat: "rubber", small: true, parent: "holder", stage: 1, A: [0, 0, 0], E: [0, 230, 0], dir: [0, -1, 0], count: 2,
        geom: { type: "pair", at: [[-45.25, 110, 40], [-45.25, 110, -40]], item: { type: "box", size: [1.5, 20, 9], r: .4 } } },
      { id: "cushion", ref: "13", name: "Cushion (holder mounting)", mat: "rubber", small: true, parent: "holder", stage: 2, A: LUG, E: [LUG[0], 175, LUG[2]], dir: [0, -1, 0],
        geom: { type: "lathe", pts: [[4.2, -2.4], [9, -2.4], [9, 0], [6.2, 0], [6.2, 1.6], [9, 1.6], [9, 3.3], [4.2, 3.3]] } },
      { id: "spacer", ref: "14", name: "Spacer, 6.2 x 8.3 x 5.7", mat: "zinc", small: true, parent: "cushion", stage: 2, A: [LUG[0], 116, LUG[2]], E: [LUG[0], 205, LUG[2]], dir: [0, -1, 0],
        geom: { type: "ring", ro: 4.15, ri: 3.1, h: 5.7 } },
      { id: "battery", ref: "—", name: "Battery (ref 1 in the picture, not sold on this page)", mat: "zinc", parent: "holder", stage: 3, A: [0, BY, 0], E: [240, BY, 0], dir: [-1, 0, 0],
        geom: { type: "group", items: [
          { type: "box", size: [89, 154, 134], r: 2, at: [0, 77, 0] },                         // case
          { type: "box", size: [91, 12, 136], r: 2, at: [0, 160, 0], mat: "dark" },             // lid
          { type: "array", pos: [-55, -33, -11, 11, 33, 55].map(z => [-14, 166, z]), item: { type: "cyl", r: 6, h: 3, mat: "black" } }, // cell plugs
          { type: "pair", at: [[28, 171, 52], [28, 171, -52]], item: { type: "box", size: [12, 10, 14], r: 1, mat: "dark" } }, // terminals
          { type: "pair", at: [[28, 176, 52], [28, 176, -52]], item: { type: "hex", af: 10, h: 3, y: 1.2, mat: "steel" } },    // terminal bolts
          { type: "cyl", r: 3, h: 7.5, axis: "x", at: [44.5, 148, 58], mat: "black" },          // vent nipple
          { type: "box", size: [.8, 2, 110], r: .3, at: [44.7, 135, 0], mat: "dark" },          // upper level line
          { type: "box", size: [.8, 2, 110], r: .3, at: [44.7, 95, 0], mat: "dark" } ] } },     // lower level line
      { id: "hose", ref: "2", name: "Battery breather tube", mat: "rubber", parent: "battery", stage: 4, A: [48, BY + 148, 58], E: [350, BY + 148, 58], dir: [-1, 0, 0],
        geom: { type: "tube", r: 4.2, pts: [[0, 0, 0], [8, 0, 0], [14, -8, 2], [16, -30, 6], [16, -120, 10], [14, -230, 8], [12, -300, 4]] } },
      { id: "band", ref: "5", name: "Battery band", mat: "rubber", parent: "holder", stage: 5, A: [0, 0, 0], E: [430, 0, 0], dir: [-1, 0, 0],
        geom: { type: "group", items: [
          { type: "box", size: [2.5, 22, 166], r: .6, at: [46.85, 103, 0] },
          { type: "pair", at: [[41.8, 103, 81.75], [41.8, 103, -81.75]], item: { type: "box", size: [11.6, 22, 2.5], r: .6 } },
          { type: "pair", at: [[37.25, 103, 78.5], [37.25, 103, -78.5]], item: { type: "box", size: [2.5, 22, 9], r: .6 } } ] } },
      { id: "lead6", ref: "6", name: "Battery plus wire", mat: "dark", parent: "battery", stage: 6, A: A6, E: [A6[0], A6[1] + 200, A6[2] - 40], dir: [0, -1, 0],
        geom: lead(A6, { c: A6, yaw: 180 }, { c: [-20, 150, -160], yaw: 0 }, [[28, 184, -80], [22, 176, -100], [4, 160, -125]], 3.6, "dark") },
      { id: "cap", ref: "9", name: "Terminal cap (positive)", mat: "rubber", parent: "lead6", stage: 6, A: [28, TOP + 8.4, -40], E: [28, TOP + 8.4 + 110, -100], dir: [0, 0, 1],
        geom: { type: "lathe", rot: [-90, 0, 0], pts: [[0, 0], [7, 0], [9, 3], [9, 18], [6, 26], [4.2, 32], [0, 32]] } },
      { id: "washer", ref: "12", name: "Washer, 6.5 x 22 x 1.6", mat: "zinc", small: true, parent: "holder", stage: 7, A: [LUG[0], W12, LUG[2]], E: [LUG[0], 240, LUG[2]], dir: [0, -1, 0],
        geom: { type: "ring", ro: 11, ri: 3.25, h: 1.6 } },
      { id: "lead7", ref: "7", name: "Starter motor lead", mat: "dark", parent: "holder", stage: 7, A: A7, E: [A7[0] - 90, A7[1] + 170, A7[2]], dir: [0, -1, 0],
        geom: lead(A7, { c: A7, yaw: -90 }, { c: [-45, -150, 4], yaw: 0 }, [[-52, 115, 86], [-60, 80, 82], [-62, 0, 70], [-55, -100, 40]], 4, "dark") },
      { id: "lead8", ref: "8", name: "Ground wire (battery minus)", mat: "dark", parent: "holder", stage: 7, A: [LUG[0], E8, LUG[2]], E: [LUG[0], E8 + 240, LUG[2]], dir: [0, -1, 0],
        geom: lead([LUG[0], E8, LUG[2]], { c: [LUG[0], E8, LUG[2]], yaw: 45 }, { c: A8, yaw: 0 }, [[0, 132, 100], [18, 160, 88], [27, 178, 76]], 3.2, "dark") },
      { id: "bolt", ref: "11", name: "Bolt, 6 x 16 (holder upper)", mat: "zinc", small: true, parent: "holder", stage: 7, A: [LUG[0], HEAD, LUG[2]], E: [LUG[0], 480, LUG[2]], dir: [0, -1, 0],
        geom: { type: "group", items: [
          { type: "hex", af: 10, h: 4, y: 0 },
          { type: "lathe", pts: [[0, -16], [2.8, -16], [3, -15.5], [3, 0], [0, 0]] } ] } },
    ],
  };
  D3_MODELS["CMS-BLCK0002"] = M;
})();
