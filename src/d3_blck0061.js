/* ============ 3D parts model: right handlebar switch and front brake lever, GS750C/EC/N/EN (CMSNL BLCK0061) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: handlebar axis along X at Y = 0, Z = 0. +X = rider's LEFT (toward the middle of the bar), so the bar end
   and the grip are toward -X. +Y up, +Z forward. Every part's geometry is laid out in world coordinates, so every A is
   [0, 0, 0] and E is the exploded offset.
   Along the bar, from the middle outward: front brake master cylinder clamp (context part, from the front brake page),
   throttle housing, throttle grip. The brake lever pivots on the master cylinder ears in front of the bar and runs out in
   front of the housing and the grip. The stop switch sits on the inboard side of the lever pivot, its plunger against the
   back of the lever.
   Real figure used: 7/8 in (22.2 mm) handlebar. Everything else (housing, grip, lever, master cylinder sizes) is a typical
   1970s 750 proportion, not measured from a GS750. */
const D3_BLCK0061 = (() => {
  const r2 = v => Math.round(v * 100) / 100;
  // side-view outline [z, y] extruded along +X from x0 by w
  const side = (pts, w, x0, holes, extra) => ({ type: "extrude", pts: pts.map(([z, y]) => [r2(-z), r2(y)]), holes: (holes || []).map(([z, y, r]) => [r2(-z), r2(y), r]),
    depth: w, bevel: 1.2, rot: [0, 90, 0], at: [x0, 0, 0], ...(extra || {}) });
  // top-view outline [x, z] extruded up (+Y) from y0 by h
  const top = (pts, h, y0, holes, extra) => ({ type: "extrude", pts: pts.map(([x, z]) => [r2(x), r2(-z)]), holes: (holes || []).map(([x, z, r]) => [r2(x), r2(-z), r]),
    depth: h, bevel: .6, rot: [-90, 0, 0], at: [0, y0, 0], ...(extra || {}) });
  const arc = (cz, cy, r, a0, a1, n = 8) => Array.from({ length: n + 1 }, (_, k) => { const a = (a0 + (a1 - a0) * k / n) * Math.PI / 180; return [r2(cz + r * Math.cos(a)), r2(cy + r * Math.sin(a))]; });
  const rrect = (z0, z1, y0, y1, r) => [...arc(z1 - r, y0 + r, r, -90, 0), ...arc(z1 - r, y1 - r, r, 0, 90), ...arc(z0 + r, y1 - r, r, 90, 180), ...arc(z0 + r, y0 + r, r, 180, 270)];
  const alongNegX = (x0, item) => ({ ...item, rot: [0, 0, 90], at: [x0, 0, 0] });  // lathe axis (+Y) turned to -X, starting at x0

  // ---- master cylinder (context: front brake page) ----
  const PIV = { x: -30, z: 44 };                      // lever pivot axis (vertical)
  const mcyl = { type: "group", items: [
    alongNegX(-10, { type: "lathe", pts: [[11.1, 0], [19, 0], [20, 3], [20, 25], [19, 28], [11.1, 28]] }),           // bar clamp
    { type: "cyl", r: 12, h: 64, axis: "x", at: [-36, 0, 24] },                                                          // bore body
    { type: "cyl", r: 7, h: 10, axis: "x", at: [28, 0, 24] }, { type: "hex", af: 14, h: 6, rot: [0, 0, -90], at: [38, 0, 24] }, // outlet boss
    { type: "lathe", pts: [[0, 0], [17, 0], [20, 6], [20, 34], [0, 34]], at: [-12, 8, 18] },                               // reservoir
    { type: "gear", r: 22, teeth: 26, h: 7, toothH: 1.6, at: [-12, 42, 18] },                                             // reservoir cap
    { type: "box", size: [18, 8, 26], r: 2, at: [PIV.x, 8, 41] }, { type: "box", size: [18, 8, 26], r: 2, at: [PIV.x, -8, 41] }, // lever ears
    { type: "box", size: [16, 6, 14], r: 1.5, at: [-4, 7, 42] },                                                          // stop switch boss
  ] };

  // ---- throttle housing: rounded body round the bar, cable boss underneath, cavity for the grip pulley ----
  const housing = { type: "group", items: [
    side(rrect(-26, 30, -30, 28, 12), 45, -95, [[0, 0, 20.5]]),
    { type: "cyl", r: 7, h: 18, axis: "y", at: [-72, -46, -8] },                                                          // throttle cable outlet
    { type: "cyl", r: 7.5, h: 4, axis: "y", at: [-72, -50, -8], mat: "rubber" },
    { type: "box", size: [16, 8, 3], r: 1, at: [-72, 18, -26.5], mat: "dark" },                                          // button bezel
  ] };
  const grip = { type: "group", items: [
    alongNegX(-55, { type: "lathe", pts: [[11.3, 0], [18, 0], [18, 8], [13.5, 8], [13.5, 41], [19, 41], [19, 46], [16, 47], [16, 170], [19, 171], [19, 178], [11.3, 178]] }),
    { type: "array", pos: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => [0, r2(16 * Math.cos(a * Math.PI / 180)), r2(16 * Math.sin(a * Math.PI / 180))]),
      item: { type: "box", size: [118, 2, 2], r: .6, at: [-163, 0, 0] } },                                               // grip ribs
  ] };
  // brake lever, top-view outline in [dx, dz] from the pivot
  const lev = [[11, -6], [11, 6], [6, 10], [-10, 14], [-40, 22], [-100, 30], [-160, 34], [-172, 36], [-178, 32], [-174, 26], [-160, 24], [-100, 18], [-40, 10], [-14, -1], [-9, -10], [0, -12], [8, -10]];
  const lever = { type: "group", items: [
    top(lev.map(([x, z]) => [PIV.x + x, PIV.z + z]), 8, -4, [[PIV.x, PIV.z, 4.2]]),
    { type: "sphere", r: 6.5, at: [PIV.x - 178, 0, PIV.z + 31] },
  ] };
  const bolt = { type: "group", at: [PIV.x, 12, PIV.z], items: [
    { type: "lathe", pts: [[0, 0], [7, 0], [7.5, 2], [6, 6], [0, 7]] },                                                   // domed head
    { type: "lathe", pts: [[0, -42], [3.6, -42], [3.9, -40], [3.9, 0], [0, 0]] },
    { type: "cyl", r: .9, h: 9, axis: "x", at: [-4.5, -36, 0], mat: "black" },                                            // cotter pin hole
  ] };
  const castle = { type: "group", at: [PIV.x, -21, PIV.z], items: [
    { type: "hex", af: 12, h: 5, y: 0, hole: 3.9 },
    { type: "array", pos: [0, 60, 120, 180, 240, 300].map(a => [r2(5 * Math.cos((a + 30) * Math.PI / 180)), -1.5, r2(5 * Math.sin((a + 30) * Math.PI / 180)), -(a + 30)]),
      item: { type: "box", size: [2.4, 3, 2.6], r: .4 } } ] };
  const pin = { type: "group", at: [PIV.x, -24, PIV.z], items: [
    { type: "tube", pts: [[-7, 0, -.8], [5, 0, -.8], [8, -2, -.8], [10, -5, -1.5]], r: .8 },
    { type: "tube", pts: [[-7, 0, .8], [5, 0, .8], [8, -2, .8], [10, -5, 1.5]], r: .8 },
    { type: "torus", R: 1.9, r: .8, rot: [90, 0, 0], at: [-8.6, 0, 0] } ] };
  const sw = { type: "group", items: [
    { type: "box", size: [18, 8, 8], r: 1.5, at: [-4, 0, 43] },
    { type: "cyl", r: 2, h: 6, axis: "x", at: [-19, 0, 43], mat: "alu" },                                                  // plunger
    { type: "lathe", pts: [[0, 0], [3.5, 0], [3.5, 2], [2.9, 2], [2.9, 21], [0, 22]], at: [-4, -6, 43], mat: "zinc" },      // mounting screw
    { type: "tube", pts: [[5, 0, 43], [16, -3, 46], [24, -18, 46], [28, -45, 40], [30, -80, 34]], r: 2.2, mat: "black" },  // lead
    { type: "box", size: [8, 12, 6], r: 1, at: [30, -84, 34], mat: "black" },
  ] };

  return {
    id: "CMS-BLCK0061", title: "Right handlebar switch (GS750C, EC, N, EN)", units: "mm", page: "BLCK0061",
    accuracy: "Approximate geometry. Part identity, numbering and the layout follow the CMSNL right handle switch (GS750C, EC, N, EN) page and its picture. Only the 7/8 in handlebar size is a real figure; the housing, grip, lever, pivot hardware and stop switch sizes are typical 1970s proportions, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [1.1, .75, 1.25], up: [0, 1, 0] },
    notModelled: "Ref 1 (throttle case assembly, 1-1 and 1-2 are earlier and later numbers) is drawn as the throttle housing, because the housing has no number of its own; the grip, horn button, contact, spring and screw are drawn separately. Ref 7 (brake lever assembly, 7-1 and 7-2) is the lever with its bolt, washer, nut and cotter pin, which are all drawn on their own. Refs 2-1 and 2-2 are two numbers for the same grip. Where the 6 mm nut (ref 12) goes isn't clear from the picture; it is shown locking the stop switch screw on top of its boss, which is a guess. The master cylinder (marked —) is on the front brake page and is only there to show where the lever and the stop switch mount. The handlebar and throttle cables aren't drawn.",
    stages: [
      { t: "Throttle grip onto the bar", d: "Grease the right end of the handlebar and slide the throttle grip on until the pulley end sits next to the master cylinder clamp. It must turn freely." },
      { t: "Throttle housing", d: "Hook the throttle cables into the pulley, then close the housing round the bar and the pulley end of the grip." },
      { t: "Horn button, contact and spring", d: "Put the spring in its hole in the back of the housing, lay the contact on it and press the horn button in over them." },
      { t: "Housing screw", d: "Fit the screw from underneath and tighten it evenly. Check the grip snaps back closed with the bars turned lock to lock." },
      { t: "Brake lever", d: "Grease the pivot and slide the lever between the ears on the master cylinder." },
      { t: "Pivot bolt", d: "Drop the pivot bolt down through the top ear, the lever and the bottom ear." },
      { t: "Nut and cotter pin", d: "Fit the lock washer and the castle nut under the bottom ear. Snug it so the lever still swings freely, then fit a new cotter pin and bend the legs over." },
      { t: "Stop switch", d: "Put the stop switch under its boss with the plunger against the back of the lever, push the screw up through both and fit the 6 mm nut on top. Check the brake light comes on as soon as the lever moves." },
    ],
    parts: [
      { id: "mcyl", ref: "—", name: "Front brake master cylinder (front brake page, shown for position)", mat: "alu", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, -1, 0], geom: mcyl },
      { id: "grip", ref: "2", name: "Throttle grip", mat: "rubber", stage: 1, A: [0, 0, 0], E: [-150, 80, 0], dir: [1, 0, 0], geom: grip },
      { id: "housing", ref: "1", name: "Throttle housing (grip assembly)", mat: "black", shell: true, stage: 2, A: [0, 0, 0], E: [-90, 0, -40], dir: [1, 0, 0], geom: housing },
      { id: "spring", ref: "5", name: "Spring (horn button)", mat: "spring", small: true, parent: "housing", stage: 3, A: [0, 0, 0], E: [0, 0, -36], dir: [0, 0, 1],
        geom: { type: "spring", R: 3.2, wire: .6, h: 8, turns: 5, rot: [90, 0, 0], at: [-72, 8, -26] } },
      { id: "contact", ref: "4", name: "Contact (horn button)", mat: "brass", small: true, parent: "housing", stage: 3, A: [0, 0, 0], E: [0, 0, -48], dir: [0, 0, 1],
        geom: { type: "ring", ro: 4.5, ri: 1.2, h: 1, rot: [-90, 0, 0], at: [-72, 8, -27] } },
      { id: "button", ref: "3", name: "Horn button", mat: "dark", small: true, parent: "housing", stage: 3, A: [0, 0, 0], E: [0, 0, -66], dir: [0, 0, 1],
        geom: { type: "lathe", pts: [[0, 0], [5.5, 0], [5.5, 7], [4.5, 8.5], [0, 9]], rot: [-90, 0, 0], at: [-72, 8, -28] } },
      { id: "screw", ref: "6", name: "Screw (housing)", mat: "zinc", small: true, parent: "housing", stage: 4, A: [0, 0, 0], E: [0, -60, 0], dir: [0, 1, 0],
        geom: { type: "group", at: [-72, -30, 22], items: [
          { type: "lathe", pts: [[0, -4], [4.5, -4], [4.8, -1], [4.5, 0], [2.5, 0], [2.5, 21], [0, 22]] },
          { type: "box", size: [6, 1, 1.2], r: .2, at: [0, -4.2, 0], mat: "black" }, { type: "box", size: [1.2, 1, 6], r: .2, at: [0, -4.2, 0], mat: "black" } ] } },
      { id: "lever", ref: "8", name: "Brake lever", mat: "alu", stage: 5, A: [0, 0, 0], E: [0, 0, 110], dir: [0, 0, -1], geom: lever },
      { id: "bolt", ref: "9", name: "Lever pivot bolt", mat: "zinc", small: true, parent: "mcyl", stage: 6, A: [0, 0, 0], E: [0, 100, 0], dir: [0, -1, 0], geom: bolt },
      { id: "lockw", ref: "10", name: "Lock washer (pivot bolt)", mat: "spring", small: true, parent: "mcyl", stage: 7, A: [0, 0, 0], E: [0, -40, 0], dir: [0, 1, 0],
        geom: { type: "ring", ro: 6.5, ri: 4.1, h: 2, split: true, at: [PIV.x, -14, PIV.z] } },
      { id: "nut", ref: "11", name: "Castle nut (lever pivot)", mat: "zinc", small: true, parent: "mcyl", stage: 7, A: [0, 0, 0], E: [0, -62, 0], dir: [0, 1, 0], geom: castle },
      { id: "pin", ref: "13", name: "Cotter pin", mat: "steel", small: true, parent: "mcyl", stage: 7, A: [0, 0, 0], E: [-40, -95, 0], dir: [1, 0, 0], geom: pin },
      { id: "nut6", ref: "12", name: "Nut, 6 mm (stop switch screw, position assumed)", mat: "zinc", small: true, parent: "switch", stage: 8, A: [0, 0, 0], E: [40, -10, 30], dir: [0, -1, 0],
        geom: { type: "hex", af: 9, h: 4.5, y: 10, hole: 2.9, at: [-4, 0, 43] } },
      { id: "switch", ref: "14", name: "Front brake light switch", mat: "dark", parent: "mcyl", stage: 8, A: [0, 0, 0], E: [40, -70, 30], dir: [0, 1, 0], geom: sw },
    ],
  };
})();
D3_MODELS["CMS-BLCK0061"] = D3_BLCK0061;
