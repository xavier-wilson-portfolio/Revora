/* ============ 3D parts model: front brake hose, GS750B 1977 single disc (CMSNL BLCK0026) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: +X = rider's LEFT, +Y up, +Z forward. Origin = bottom of the 3-way joint (7), on the centre line,
   where the joint sits on the lower fork bracket (bracket not drawn, taken as 5 mm thick below Y = 0).
   The master cylinder is on the right handlebar (X negative), its outlet about 300 mm above the joint.
   The single caliper is drawn on the right fork leg (X negative), behind the leg, about 520 mm below the joint.
   The master cylinder, fork brackets, fork leg and caliper are on other pages and are not drawn: banjo bolts end
   in empty space where those threads are.
   Identity and numbering: CMSNL page BLCK0026 rows and picture. Geometry: APPROXIMATE, no factory dimensions. */
(() => {
  const R = { "+x": [0, 0, -90], "-x": [0, 0, 90], "+y": [0, 0, 0], "-y": [180, 0, 0], "+z": [90, 0, 0], "-z": [-90, 0, 0] };
  const V = { "+x": [1, 0, 0], "-x": [-1, 0, 0], "+y": [0, 1, 0], "-y": [0, -1, 0], "+z": [0, 0, 1], "-z": [0, 0, -1] };
  const or = (item, d, at) => ({ type: "group", items: [item], rot: R[d], at: at || [0, 0, 0] });
  const add = (a, b, k = 1) => a.map((v, i) => v + b[i] * k);
  // banjo union bolt pointing along d; local origin = underside of the head
  const unionBolt = (d, L) => or({ type: "group", items: [
    { type: "hex", af: 14, h: 7.5, y: -8 },
    { type: "lathe", pts: [[0, -.5], [5, -.5], [5, 2], [4.2, 4], [4.2, 10], [5, 12], [5, L - 1], [4.4, L], [0, L]] },
    { type: "holes", y: [7], r: 4.2, d: 2.4 } ] }, d);
  const washers = (d, gaps, ro = 8, ri = 5.1) => ({ type: "array", pos: gaps.map(g => V[d].map(v => -v * g)), item: or({ type: "ring", ro, ri, h: 1.6 }, d) });
  // banjo eye on bolt axis d (centre c) with neck and crimped ferrule along n; returns items + the point the hose starts
  const banjo = (c, d, n) => {
    const p0 = add(c, n, 8.5), p1 = add(c, n, 15), p2 = add(c, n, 33);
    return { items: [
      or({ type: "group", items: [{ type: "ring", ro: 9.5, ri: 5.1, h: 12, at: [0, -6, 0] }] }, d, c),
      { type: "tube", pts: [p0, p1], r: 4.6 }, { type: "tube", pts: [p1, add(p1, n, .1)], r: 6.4 },
      { type: "tube", pts: [p1, p2], r: 6.4 }, { type: "tube", pts: [add(p1, n, 3), add(p1, n, 4)], r: 6.9 }, { type: "tube", pts: [add(p2, n, -4), add(p2, n, -3)], r: 6.9 } ], end: add(c, n, 31) };
  };

  // key points (world)
  const JR = [0, 14, -23.6], JF = [0, 14, 23.6];     // joint: rear (inlet) and front (outlet) banjo eyes
  const MC = [-180, 308.4, -40];                       // master cylinder outlet banjo eye, bolt goes up into the master cylinder
  const CAL = [-107.6, -520, -40];                     // caliper inlet banjo eye, bolt goes inboard (+X) into the caliper

  const b4a = banjo(MC, "+y", [1, 0, 0]), b4b = banjo(JR, "+z", [0, 1, 0]);
  const hose4 = { type: "group", items: [
    { type: "group", mat: "steel", items: [...b4a.items, ...b4b.items] },
    { type: "tube", r: 5, pts: [b4a.end, [-128, 308, -40], [-84, 290, -35], [-60, 245, -30], [-60, 200, -30], [-60, 140, -30], [-34, 86, -25], [0, 62, -23.6], b4b.end] } ] };

  const b11a = banjo(JF, "+z", [-1, 0, 0]), b11b = banjo(CAL, "+x", [0, 1, 0]);
  const hose11 = { type: "group", items: [
    { type: "group", mat: "steel", items: [...b11a.items.slice(0, 2), ...b11b.items ] },
    { type: "tube", mat: "chrome", r: 3.2, pts: [[-14, 14, 23.6], [-60, 14, 23.6], [-125, 14, 23.6], [-152, 7, 23.6], [-165, -10, 23.6], [-168, -32, 23.6]] },
    { type: "tube", mat: "steel", r: 6.4, pts: [[-168, -32, 23.6], [-168, -54, 23.6]] },
    { type: "tube", mat: "steel", r: 6.9, pts: [[-168, -50, 23.6], [-168, -52, 23.6]] },
    { type: "tube", r: 5, pts: [[-168, -52, 23.6], [-168, -80, 22.5], [-160, -230, 12], [-146, -380, -10], [-118, -455, -36], [-107.6, -472, -40], b11b.end] } ] };

  const joint = { type: "group", items: [
    { type: "box", size: [30, 22, 26], r: 3, at: [0, 14, 0] },
    { type: "cyl", r: 9.5, h: 33, axis: "z", at: [0, 14, -16.5] },
    { type: "cyl", r: 8, h: 3.2, at: [0, 0, 0] },
    { type: "cyl", r: 3.5, h: 1, axis: "x", at: [15, 6, 6], mat: "black" } ] };

  const boot = { type: "group", items: [
    { type: "lathe", pts: [[0, 0], [10, 0], [14.5, 4], [14.5, 32], [12.6, 32], [12.6, 5], [9, 2], [0, 2]] },
    { type: "cyl", r: 8, h: 14, axis: "x", at: [10, 20.4, 0] },
    { type: "lathe", pts: [[12.6, 30], [15.5, 30], [15.5, 32], [12.6, 32]] } ] };

  const guide = { type: "extrude", depth: 3, bevel: .4, rot: [-90, 0, 0],
    pts: [[-14, 0], [-10, -10], [0, -14], [12, -12], [30, -9], [41, -8], [47, 0], [41, 8], [30, 9], [12, 12], [0, 14], [-10, 10]],
    holes: [[0, 0, 8.2], [41, 0, 3.6]] };
  const grommet = { type: "lathe", pts: [[5.2, 0], [11, 0], [11, 3], [8.2, 3.4], [8.2, 6.6], [11, 7], [11, 10], [5.2, 10]] };

  D3_MODELS["CMS-BLCK0026"] = {
    id: "CMS-BLCK0026", title: "Front brake hose (GS750B)", units: "mm", page: "BLCK0026",
    accuracy: "Approximate geometry. Part identity, numbering and how the parts fit follow the CMSNL picture for this page; hose routing, lengths and all sizes are estimated, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [-.75, .55, -1.15], up: [0, 1, 0] },
    notModelled: "All refs are drawn. Ref 5 is listed as 5-1 and 5-2 (two part numbers for the hose guide); one guide is drawn. Ref 2 and ref 3 are used at both ends of hose No. 1, so each appears twice. The master cylinder, fork brackets, fork leg and caliper aren't on this page and aren't drawn. Which fork leg carries the single caliper is assumed to be the right one; check on the bike.",
    stages: [
      { t: "Joint on the lower bracket", d: "Bolt the 3-way joint to the lower fork bracket from below with the washer and lock washer under the bolt head." },
      { t: "Hose guide", d: "Fit the hose guide in place on the fork bracket." },
      { t: "Grommet", d: "Press the grommet into the hole in the hose guide." },
      { t: "Hose No. 1", d: "Route hose No. 1 from the master cylinder down through the grommet to the joint." },
      { t: "Hose No. 1 at the joint", d: "Fit the union bolt with a new copper washer on each side of the banjo into the rear port of the joint. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Hose No. 1 at the master cylinder", d: "Same at the master cylinder: new copper washers both sides, union bolt up into the outlet. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Boot", d: "Push the rubber boot up over the union bolt and banjo so the hose comes out through the side spout." },
      { t: "Front brake hose", d: "Lay the front brake hose from the joint across and down the fork leg to the caliper, steel pipe end at the joint." },
      { t: "Union bolts, joint and caliper", d: "Fit both union bolts with new copper washers on each side of each banjo. Torque: VERIFY IN FACTORY SERVICE MANUAL. Fill and bleed the system (fluid type: VERIFY IN FACTORY SERVICE MANUAL)." },
    ],
    parts: [
      { id: "joint", ref: "7", name: "Brake hose joint (3-way)", mat: "alu", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, 1, 0], geom: joint },
      { id: "w9", ref: "9", name: "Washer (joint bolt)", mat: "zinc", small: true, parent: "joint", stage: 1, A: [0, -6.2, 0], E: [0, -45, 0], dir: [0, 1, 0],
        geom: { type: "ring", ro: 8, ri: 3.2, h: 1.2 } },
      { id: "lw10", ref: "10", name: "Lock washer (joint bolt)", mat: "spring", small: true, parent: "joint", stage: 1, A: [0, -7.8, 0], E: [0, -62, 0], dir: [0, 1, 0],
        geom: { type: "ring", ro: 5.8, ri: 3.2, h: 1.6, split: true } },
      { id: "b8", ref: "8", name: "Bolt (joint to bracket)", mat: "zinc", small: true, parent: "joint", stage: 1, A: [0, -7.8, 0], E: [0, -100, 0], dir: [0, 1, 0],
        geom: { type: "group", items: [{ type: "hex", af: 10, h: 4.5, y: -4.5 }, { type: "lathe", pts: [[0, -.3], [3, -.3], [3, 19.4], [2.6, 20], [0, 20]] }] } },
      { id: "guide", ref: "5", name: "Brake hose guide", mat: "black", stage: 2, A: [-60, 168, -30], E: [0, 168, -30], dir: [-1, 0, 0], geom: guide },
      { id: "grommet", ref: "6", name: "Grommet (hose guide)", mat: "rubber", small: true, parent: "guide", stage: 3, A: [-60, 164.6, -30], E: [-60, 215, -30], dir: [0, -1, 0], geom: grommet },
      { id: "hose4", ref: "4", name: "Brake hose No. 1 (master cylinder to joint)", mat: "rubber", stage: 4, A: [0, 0, 0], E: [0, 0, -170], dir: [0, 0, 1], geom: hose4 },
      { id: "w3j", ref: "3", name: "Copper washers (hose No. 1 at the joint)", mat: "brass", small: true, count: 2, parent: "joint", stage: 5, A: [0, 14, -17.6], E: [0, 14, -62], dir: [0, 0, 1],
        geom: washers("+z", [0, 13.6]) },
      { id: "b2j", ref: "2", name: "Union bolt (hose No. 1 at the joint)", mat: "zinc", small: true, parent: "joint", stage: 5, A: [0, 14, -31.2], E: [0, 14, -110], dir: [0, 0, 1],
        geom: unionBolt("+z", 22) },
      { id: "w3m", ref: "3", name: "Copper washers (hose No. 1 at the master cylinder)", mat: "brass", small: true, count: 2, stage: 6, A: [-180, 300.8, -40], E: [-180, 252, -40], dir: [0, 1, 0],
        geom: { type: "array", pos: [[0, 0, 0], [0, 13.6, 0]], item: { type: "ring", ro: 8, ri: 5.1, h: 1.6 } } },
      { id: "b2m", ref: "2", name: "Union bolt (hose No. 1 at the master cylinder)", mat: "zinc", small: true, stage: 6, A: [-180, 300.8, -40], E: [-180, 222, -40], dir: [0, 1, 0],
        geom: unionBolt("+y", 22) },
      { id: "boot", ref: "1", name: "Boot (master cylinder union)", mat: "rubber", shell: true, stage: 7, A: [-180, 288, -40], E: [-180, 150, -40], dir: [0, 1, 0], geom: boot },
      { id: "hose11", ref: "11", name: "Front brake hose (joint to caliper)", mat: "rubber", stage: 8, A: [0, 0, 0], E: [0, 0, 170], dir: [0, 0, -1], geom: hose11 },
      { id: "w13j", ref: "13", name: "Copper washers (front hose at the joint)", mat: "brass", small: true, count: 2, parent: "joint", stage: 9, A: [0, 14, 17.6], E: [0, 14, 58], dir: [0, 0, -1],
        geom: washers("-z", [0, 13.6]) },
      { id: "b12j", ref: "12", name: "Union bolt (front hose at the joint)", mat: "zinc", small: true, parent: "joint", stage: 9, A: [0, 14, 31.2], E: [0, 14, 105], dir: [0, 0, -1],
        geom: unionBolt("-z", 22) },
      { id: "w13c", ref: "13", name: "Copper washers (front hose at the caliper)", mat: "brass", small: true, count: 2, stage: 9, A: [-101.6, -520, -40], E: [-150, -520, -40], dir: [1, 0, 0],
        geom: washers("+x", [0, 13.6]) },
      { id: "b12c", ref: "12", name: "Union bolt (front hose at the caliper)", mat: "zinc", small: true, stage: 9, A: [-115.2, -520, -40], E: [-205, -520, -40], dir: [1, 0, 0],
        geom: unionBolt("+x", 22) },
    ],
  };
})();
