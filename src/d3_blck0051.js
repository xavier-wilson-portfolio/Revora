/* ============ 3D parts model: rear brake hose and pipe, GS750B 1977 (CMSNL BLCK0051) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: +X = rider's LEFT, +Y up, +Z forward. Everything here is on the right side of the bike (X negative).
   Origin = the hex face of hose No. 1's lower end fitting, where it passes through the grommet in a bracket on the
   frame near the swingarm pivot (bracket not drawn). The steel pipe runs back along the top of the right swingarm
   arm to the guide (9) near the axle, where hose No. 2 takes over down to the caliper.
   The master cylinder, frame bracket, swingarm and caliper are on other pages and are not drawn.
   Identity and numbering: CMSNL page BLCK0051 rows and picture. Geometry: APPROXIMATE, no factory dimensions. */
(() => {
  const R = { "+x": [0, 0, -90], "-x": [0, 0, 90], "+y": [0, 0, 0], "-y": [180, 0, 0], "+z": [90, 0, 0], "-z": [-90, 0, 0] };
  const V = { "+x": [1, 0, 0], "-x": [-1, 0, 0], "+y": [0, 1, 0], "-y": [0, -1, 0], "+z": [0, 0, 1], "-z": [0, 0, -1] };
  const or = (item, d, at) => ({ type: "group", items: [item], rot: R[d], at: at || [0, 0, 0] });
  const add = (a, b, k = 1) => a.map((v, i) => v + b[i] * k);
  const unionBolt = (d, L) => or({ type: "group", items: [
    { type: "hex", af: 14, h: 7.5, y: -8 },
    { type: "lathe", pts: [[0, -.5], [5, -.5], [5, 2], [4.2, 4], [4.2, 10], [5, 12], [5, L - 1], [4.4, L], [0, L]] },
    { type: "holes", y: [7], r: 4.2, d: 2.4 } ] }, d);
  const washers = (d, gaps, ro = 8, ri = 5.1) => ({ type: "array", pos: gaps.map(g => V[d].map(v => -v * g)), item: or({ type: "ring", ro, ri, h: 1.6 }, d) });
  const banjo = (c, d, n) => {
    const p0 = add(c, n, 8.5), p1 = add(c, n, 15), p2 = add(c, n, 33);
    return { items: [
      or({ type: "group", items: [{ type: "ring", ro: 9.5, ri: 5.1, h: 12, at: [0, -6, 0] }] }, d, c),
      { type: "tube", pts: [p0, p1], r: 4.6 }, { type: "tube", pts: [p1, p2], r: 6.4 },
      { type: "tube", pts: [add(p1, n, 3), add(p1, n, 4)], r: 6.9 }, { type: "tube", pts: [add(p2, n, -4), add(p2, n, -3)], r: 6.9 } ], end: add(c, n, 31) };
  };
  // hose end fitting through a grommet: crimp ferrule, hex, then a stub with the E-ring groove; local +Y points to the pipe
  const fitting = { type: "group", items: [
    { type: "lathe", pts: [[0, -26], [6.4, -26], [6.4, -22], [6.9, -21], [6.9, -19], [6.4, -18], [6.4, -10], [0, -10]] },
    { type: "hex", af: 14, h: 10, y: -10 },
    { type: "lathe", pts: [[3, 0], [6, 0], [6, 11], [5.2, 11.4], [5.2, 12.6], [6, 13], [6, 14], [3, 14]] } ] };
  const grommet = { type: "lathe", pts: [[6.1, 0], [11, 0], [11, 3], [8.4, 3.4], [8.4, 6.6], [11, 7], [11, 10], [6.1, 10]] };
  const eRing = { type: "clip", R: 5.9, r: .9, gap: 1.6 };
  const flareNut = d => or({ type: "group", items: [{ type: "hex", af: 10, h: 10, y: 0 }] }, d);

  // key points (world)
  const MC = [-90, 140, 150];            // master cylinder outlet banjo eye, bolt goes down into the master cylinder
  const JA = [-90, 0, 0], JB = [-100, -45, -492]; // hex faces of the hose end fittings (A: frame bracket, B: guide 9)
  const CAL = [-112, -115, -560];        // caliper banjo eye, bolt goes inboard (+X)

  const bm = banjo(MC, "-y", [0, 0, -1]);
  const hose1 = { type: "group", items: [
    { type: "group", mat: "steel", items: [...bm.items, or(fitting, "-z", JA)] },
    { type: "tube", r: 5, pts: [bm.end, [-90, 139, 106], [-90, 105, 74], [-90, 45, 50], [-90, 8, 38], [-90, 0, 30], [-90, 0, 24]] } ] };
  const bc = banjo(CAL, "+x", [0, 1, 0]);
  const hose2 = { type: "group", items: [
    { type: "group", mat: "steel", items: [...bc.items, or(fitting, "+z", JB)] },
    { type: "tube", r: 5, pts: [[-100, -45, -516], [-100, -45, -528], [-103, -53, -548], [-110, -66, -560], [-112, -76, -560], [-112, -86, -560]] },
    { type: "spring", R: 6.2, wire: 1, h: 14, turns: 6, rot: [-90, 0, 0], at: [-100, -45, -518] } ] };
  const pipe = { type: "group", items: [
    { type: "tube", r: 3.2, pts: [[-90, 0, -22], [-90, 0, -50], [-93, -14, -120], [-100, -40, -220], [-100, -45, -300], [-100, -45, -440], [-100, -45, -470]] },
    { ...flareNut("-z"), at: [-90, 0, -14] },
    { ...flareNut("+z"), at: [-100, -45, -478] } ] };
  const protector = { type: "lathe", rot: [90, 0, 0], at: [-100, -45, -430], pts: [[3.3, 0], [4.6, 1], [4.6, 119], [3.3, 120]] };
  const cover = { type: "extrude", depth: 80, bevel: .3, at: [0, 0, -410],
    pts: [[-112, -50], [-112, -37], [-72, -37], [-72, -39.6], [-109.4, -39.6], [-109.4, -50]] };
  const guide = { type: "extrude", depth: 3, bevel: .4,
    pts: [[-13, 0], [-9, 9], [0, 13], [9, 9], [13, 0], [10, -14], [8, -30], [6, -36], [-6, -36], [-8, -30], [-10, -14]],
    holes: [[0, 0, 8.5], [0, -29, 3.6]] };

  D3_MODELS["CMS-BLCK0051"] = {
    id: "CMS-BLCK0051", title: "Rear brake hose", units: "mm", page: "BLCK0051",
    accuracy: "Approximate geometry. Part identity, numbering and how the parts fit follow the CMSNL picture for this page; routing, lengths and all sizes are estimated, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [-1.1, .7, .35], up: [0, 1, 0] },
    notModelled: "Refs 3 and 4 are drawn as one pipe. The picture shows two pipes, but ref 4's part number is the replacement listed for ref 3, so they look like an early and a later version of the same pipe rather than two pipes fitted together; check on the bike. Ref 10, 11 and 12 are used at both ends and ref 13 at both banjos, so they appear more than once. The master cylinder, frame bracket, swingarm and caliper aren't on this page and aren't drawn.",
    stages: [
      { t: "Grommets", d: "Press one grommet into the hose bracket on the frame and the other into the hose guide on the swingarm." },
      { t: "Hose ends through the grommets", d: "Push the fitting on the lower end of hose No. 1 through the frame grommet, and the fitting on hose No. 2 through the guide grommet, threaded ends toward the pipe." },
      { t: "E-rings", d: "Clip an E-ring into the groove on each fitting so it can't pull back out of the grommet." },
      { t: "Protector on the pipe", d: "Slide the protector sleeve onto the straight part of the pipe." },
      { t: "Brake pipe", d: "Lay the pipe along the swingarm and start both flare nuts by hand into the hose fittings, then tighten. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Pipe cover", d: "Fit the cover over the pipe and protector, with the lock washer under the bolt head." },
      { t: "Banjo ends", d: "Fit the union bolts with a new copper washer on each side of each banjo, at the master cylinder and at the caliper. Torque: VERIFY IN FACTORY SERVICE MANUAL. Fill and bleed (fluid type: VERIFY IN FACTORY SERVICE MANUAL)." },
    ],
    parts: [
      { id: "guide", ref: "9", name: "Brake hose guide (swingarm)", mat: "black", stage: 0, A: [-100, -45, -488.5], E: [-100, -45, -488.5], dir: [0, 0, 1], geom: guide },
      { id: "gromB", ref: "10", name: "Grommet (hose guide)", mat: "rubber", small: true, parent: "guide", stage: 1, A: [-100, -45, -492], E: [-100, -45, -545], dir: [0, 0, 1],
        geom: or(grommet, "+z") },
      { id: "gromA", ref: "10", name: "Grommet (frame bracket)", mat: "rubber", small: true, stage: 1, A: [-90, 0, 0], E: [-90, 0, 55], dir: [0, 0, -1],
        geom: or(grommet, "-z") },
      { id: "hose1", ref: "1", name: "Rear brake hose No. 1 (master cylinder to pipe)", mat: "rubber", stage: 2, A: [0, 0, 0], E: [0, 0, 140], dir: [0, 0, -1], geom: hose1 },
      { id: "hose2", ref: "2", name: "Rear brake hose No. 2 (pipe to caliper)", mat: "rubber", stage: 2, A: [0, 0, 0], E: [0, 0, -150], dir: [0, 0, 1], geom: hose2 },
      { id: "eA", ref: "11", name: "E-ring (hose No. 1 fitting)", mat: "spring", small: true, parent: "hose1", stage: 3, A: [-90, 0, -12], E: [-90, 40, -12], dir: [0, -1, 0],
        geom: { type: "group", rot: [90, 0, 0], items: [eRing] } },
      { id: "eB", ref: "11", name: "E-ring (hose No. 2 fitting)", mat: "spring", small: true, parent: "hose2", stage: 3, A: [-100, -45, -480], E: [-100, 0, -480], dir: [0, -1, 0],
        geom: { type: "group", rot: [90, 0, 0], items: [eRing] } },
      { id: "pipe", ref: "3, 4", name: "Rear brake pipe", mat: "steel", stage: 5, A: [0, 0, 0], E: [0, -130, 0], dir: [0, 1, 0], geom: pipe },
      { id: "prot", ref: "5", name: "Brake pipe protector", mat: "rubber", parent: "pipe", stage: 4, A: [0, 0, 0], E: [0, -200, -80], dir: [0, 0, 1], geom: protector },
      { id: "cover", ref: "6", name: "Rear brake pipe cover", mat: "black", stage: 6, A: [0, 0, 0], E: [0, 85, 0], dir: [0, -1, 0], geom: cover },
      { id: "lw8", ref: "8", name: "Lock washer (cover bolt)", mat: "spring", small: true, parent: "cover", stage: 6, A: [-80, -35.4, -370], E: [-80, 110, -370], dir: [0, -1, 0],
        geom: or({ type: "ring", ro: 5.8, ri: 3.2, h: 1.6, split: true }, "-y") },
      { id: "b7", ref: "7", name: "Bolt 6 x 8 (cover)", mat: "zinc", small: true, parent: "cover", stage: 6, A: [-80, -35.4, -370], E: [-80, 135, -370], dir: [0, -1, 0],
        geom: or({ type: "group", items: [{ type: "hex", af: 10, h: 4.5, y: -4.5 }, { type: "lathe", pts: [[0, -.3], [3, -.3], [3, 7.4], [2.6, 8], [0, 8]] }] }, "-y") },
      { id: "w13m", ref: "13", name: "Copper washers (master cylinder banjo)", mat: "brass", small: true, count: 2, stage: 7, A: [-90, 134, 150], E: [-90, 178, 150], dir: [0, -1, 0],
        geom: washers("-y", [0, 13.6]) },
      { id: "b12m", ref: "12", name: "Union bolt (master cylinder)", mat: "zinc", small: true, stage: 7, A: [-90, 147.6, 150], E: [-90, 225, 150], dir: [0, -1, 0],
        geom: unionBolt("-y", 22) },
      { id: "w13c", ref: "13", name: "Copper washers (caliper banjo)", mat: "brass", small: true, count: 2, stage: 7, A: [-106, -115, -560], E: [-150, -115, -560], dir: [1, 0, 0],
        geom: washers("+x", [0, 13.6]) },
      { id: "b12c", ref: "12", name: "Union bolt (caliper)", mat: "zinc", small: true, stage: 7, A: [-119.6, -115, -560], E: [-195, -115, -560], dir: [1, 0, 0],
        geom: unionBolt("+x", 22) },
    ],
  };
})();
