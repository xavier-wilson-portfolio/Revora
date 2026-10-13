/* ============ 3D parts model: starter clutch, GS750B 1977 (CMSNL BLCK0068) ============
   Mechanical data only. Units: millimetres.
   World frame: crankshaft axis along X through the origin, +X outboard to the left side of the engine (toward the
   generator cover), +Y up, +Z forward. X = 0 is the crank shoulder the thrust washer (ref 10) seats against.
   Angles around the crank: a point at radius r, angle a sits at Y = r cos a, Z = r sin a.
   The one-way clutch body (part of the clutch set, ref 4) is bolted to the inner face of the generator rotor by three
   Allen bolts (ref 8) put in from the rotor's outer face. The driven gear (the other half of the clutch set) turns on
   the needle bearing (ref 9) on the crank; its hub runs inside the clutch body on the three rollers (ref 5), which are
   pushed toward the narrow end of their ramps by the push pieces (ref 7) and springs (ref 6).
   The idle gear (ref 1) sits on its pin (ref 2) above and behind the crank, with a thrust washer (ref 3) each side.
   The crank end and the generator rotor are not on this page; they are drawn without a number (ref —) as context.
   Identity and numbering: CMSNL starter clutch page (GS750 1977 B, E03), refs 1 to 11.
   Geometry: APPROXIMATE. Bearing 25 x 29 x 9.9, washers 25 x 38 x 2.5 and 13.3 x 25 x 0.85, pin 13 x 56 and rollers
   15 x 13 are read from the catalogue descriptions (the roller is read as 13 mm diameter, 15 mm long). Everything else
   is typical 1970s Suzuki four proportions, not factory measurements. */
const D3_BLCK0068 = (() => {
  const R = Math.PI / 180, P = (r, a) => [r * Math.cos(a * R), r * Math.sin(a * R)]; // -> [Y, Z]
  const L = (r, a) => { const [y, z] = P(r, a); return [-z, y]; }; // extrude-local [x, y] for an item turned with rot [0, 90, 0]
  const POCKETS = [90, 210, 330], BOLTS = POCKETS.map(a => a - 60);
  // one 120-degree sector of the clutch body with one roller ramp pocket; three sectors close up into the full body
  const sectorFine = a0 => {
    const pts = [];
    for (let a = a0 - 90; a <= a0 + 30 + 1e-6; a += 4) pts.push(L(50, a));
    for (let a = a0 + 30; a >= a0 + 22; a -= 2) pts.push(L(25.5, a));
    [[20, 37], [14, 37.22], [8, 37.45], [2, 37.68], [-4, 37.9], [-10, 38.12], [-16, 38.35], [-22, 38.58], [-28, 38.8], [-34, 39]].forEach(([f, r]) => pts.push(L(r, a0 + f)));
    for (let a = a0 - 36; a >= a0 - 90 - 1e-6; a -= 3) pts.push(L(25.5, a));
    return { type: "extrude", pts, holes: BOLTS.filter(b => b > a0 - 90 && b < a0 + 30).map(b => [...L(45, b), 3.4]), depth: 14.2, bevel: .4, rot: [0, 90, 0], at: [.4, 0, 0] };
  };
  const circ = (r, n = 72) => Array.from({ length: n }, (_, i) => L(r, i * 360 / n));
  // tangential items (spring, push piece) centred at radius 31.5, angle a, built along local +Y then turned onto the tangent
  const tang = (item, a, h) => { const [y, z] = P(31.5, a), ty = -Math.sin(a * R), tz = Math.cos(a * R);
    return Object.assign({}, item, { rot: [a + 90, 0, 0], at: [0, y - ty * h / 2, z - tz * h / 2] }); };
  const IY = 38.1, IZ = -38.1; // idle gear axis (centre distance about 54 mm from the crank)

  return {
    id: "CMS-BLCK0068", title: "Starter clutch", units: "mm", page: "BLCK0068",
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL starter clutch page. The bearing, washer, pin and roller sizes are read from the catalogue descriptions; every other shape and size follows a typical 1970s Suzuki four-cylinder roller starter clutch, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [.75, .7, 1.25], up: [0, 1, 0] },
    notModelled: "Every ref on this page is drawn. The clutch set (ref 4) is two separate pieces, the clutch body and the starter driven gear, so both carry ref 4. The two idle gear washers are both ref 3. The crankshaft end and the generator rotor (ref —) aren't on this page and are drawn only to show where the clutch bolts on and runs. The crankcase bosses that carry the idle gear pin, the starter motor and the rotor bolt aren't drawn.",
    stages: [
      { t: "Clutch body onto the rotor", d: "Set the clutch body against the inner face of the generator rotor with the bolt holes lined up." },
      { t: "Clutch bolts", d: "Fit the three Allen bolts from the magnet side of the rotor into the clutch body. Thread locker, staking and torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Springs and push pieces", d: "Put a spring and then a push piece into the back of each of the three roller pockets." },
      { t: "Rollers", d: "Push each roller into its pocket against the push piece. The springs hold them toward the narrow end of the ramp." },
      { t: "Washer and needle bearing", d: "Slide the thrust washer onto the crank against the shoulder, then the needle bearing. Oil the bearing." },
      { t: "Starter driven gear", d: "Slide the driven gear onto the needle bearing, gear teeth inboard and the hub facing out." },
      { t: "Hub shim", d: "Fit the shim on the end of the driven gear hub." },
      { t: "Rotor and clutch onto the crank", d: "Turn the driven gear while pushing the rotor on so the hub works in under the rollers, then seat the rotor on the taper. Rotor bolt torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Idle gear and washers", d: "Hold the idle gear in the case with a washer each side, small gear meshed with the driven gear." },
      { t: "Idle gear pin", d: "Push the pin through the case, the washers and the gear. Check the gear turns freely and the driven gear turns one way only." },
    ],
    parts: [
      { id: "crank", ref: "—", name: "Crankshaft left end (not on this page)", mat: "steel", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [-1, 0, 0],
        geom: { type: "lathe", rot: [0, 0, -90], pts: [[0, -30], [22, -30], [22, -.6], [21.4, 0], [12.5, 0], [12.5, 31], [9.5, 60], [0, 60]] } },
      { id: "washer10", ref: "10", name: "Thrust washer (driven gear)", mat: "steel", small: true, parent: "crank", stage: 5, A: [0, 0, 0], E: [85, 0, 0], dir: [-1, 0, 0],
        geom: { type: "ring", ri: 12.6, ro: 19, h: 2.5, rot: [0, 0, -90] } },
      { id: "bearing9", ref: "9", name: "Needle bearing (driven gear)", mat: "steel", parent: "crank", stage: 5, A: [10, 0, 0], E: [100, 0, 0], dir: [-1, 0, 0],
        geom: { type: "group", rot: [0, 0, -90], items: [
          { type: "lathe", pts: [[12.55, 0], [14.5, 0], [14.5, 1.2], [13.6, 1.2], [13.6, 8.7], [14.5, 8.7], [14.5, 9.9], [12.55, 9.9]] },
          { type: "array", pos: Array.from({ length: 22 }, (_, i) => { const a = i * 360 / 22 * R; return [Math.cos(a) * 13.55, 1.5, Math.sin(a) * 13.55]; }),
            item: { type: "cyl", r: .95, h: 6.9, seg: 10 } } ] } },
      { id: "dgear", ref: "4", name: "Starter driven gear (part of clutch set)", mat: "steel", parent: "crank", stage: 6, A: [2.5, 0, 0], E: [125, 0, 0], dir: [-1, 0, 0],
        geom: { type: "group", rot: [0, 0, -90], items: [
          { type: "gear", r: 43, teeth: 46, h: 11, bore: 14.5, toothH: 3.4, holes: [0, 60, 120, 180, 240, 300].map(a => [Math.cos(a * R) * 32, Math.sin(a * R) * 32, 4.6]) },
          { type: "lathe", pts: [[14.5, 0], [26, 0], [26, 11], [25, 12], [25, 27], [24.4, 27.5], [14.5, 27.5]] } ] } },
      { id: "shim11", ref: "11", name: "Shim (starter clutch hub)", mat: "steel", small: true, parent: "dgear", stage: 7, A: [30, 0, 0], E: [165, 0, 0], dir: [-1, 0, 0],
        geom: { type: "ring", ri: 12.6, ro: 17, h: .5, rot: [0, 0, -90] } },
      { id: "rotor", ref: "—", shell: true, name: "Generator rotor (not on this page)", mat: "dark", parent: "crank", stage: 8, A: [30.5, 0, 0], E: [260, 0, 0], dir: [-1, 0, 0],
        geom: { type: "group", items: [
          { type: "extrude", pts: circ(58), holes: [[0, 0, 21.5], ...BOLTS.map(b => [...L(45, b), 4.3])], depth: 5.2, bevel: .4, rot: [0, 90, 0], at: [.4, 0, 0] },
          { type: "lathe", rot: [0, 0, -90], pts: [[12.4, 0], [22, 0], [22, 29.5], [9.4, 29.5]] },
          { type: "lathe", rot: [0, 0, -90], pts: [[53.6, 0], [58, 0], [58, 38], [53.6, 38]] } ] } },
      { id: "cbody", ref: "4", shell: true, name: "Starter clutch body (part of clutch set)", mat: "steel", parent: "rotor", stage: 1, A: [15.5, 0, 0], E: [225, 0, 0], dir: [1, 0, 0],
        geom: { type: "group", items: POCKETS.map(sectorFine) } },
      { id: "bolts8", ref: "8", name: "Allen bolts (clutch body to rotor)", mat: "black", small: true, parent: "rotor", stage: 2, A: [36.5, 0, 0], E: [330, 0, 0], dir: [-1, 0, 0], count: 3,
        geom: { type: "array", pos: BOLTS.map(b => [0, ...P(45, b)]), item: { type: "group", rot: [0, 0, 90], items: [
          { type: "lathe", pts: [[0, -8], [5.9, -8], [6.5, -7.4], [6.5, 0], [3.9, 0], [3.9, 18.4], [3.4, 19.4], [0, 19.4]] },
          { type: "socket", y: -8, af: 6 } ] } } },
      { id: "springs6", ref: "6", name: "Roller springs", mat: "spring", small: true, parent: "cbody", stage: 3, A: [23, 0, 0], E: [213, 0, 0], dir: [1, 0, 0], count: 3,
        geom: { type: "group", items: POCKETS.map(a => tang({ type: "spring", R: 3.1, wire: .9, h: 8.6, turns: 5 }, a - 26.2, 8.6)) } },
      { id: "push7", ref: "7", name: "Push pieces", mat: "brass", small: true, parent: "cbody", stage: 3, A: [23, 0, 0], E: [200, 0, 0], dir: [1, 0, 0], count: 3,
        geom: { type: "group", items: POCKETS.map(a => tang({ type: "lathe", pts: [[0, 0], [3.6, 0], [4, .4], [4, 5.4], [3, 7], [0, 7]] }, a - 12.2, 7)) } },
      { id: "rollers5", ref: "5", name: "Clutch rollers", mat: "chrome", parent: "cbody", stage: 4, A: [15.5, 0, 0], E: [177, 0, 0], dir: [1, 0, 0], count: 3,
        geom: { type: "array", pos: POCKETS.map(a => [0, ...P(31.5, a + 6)]), item: { type: "lathe", rot: [0, 0, -90], pts: [[0, 0], [6, 0], [6.5, .5], [6.5, 14.5], [6, 15], [0, 15]] } } },
      { id: "washer3a", ref: "3", name: "Idle gear washer (inner)", mat: "steel", small: true, stage: 9, A: [-14.5, IY, IZ], E: [40, IY + 90, IZ], dir: [-1, 0, 0],
        geom: { type: "ring", ri: 6.65, ro: 12.5, h: .85, rot: [0, 0, -90] } },
      { id: "idle1", ref: "1", name: "Starter idle gear", mat: "steel", stage: 9, A: [-13.65, IY, IZ], E: [60, IY + 90, IZ], dir: [-1, 0, 0],
        geom: { type: "group", rot: [0, 0, -90], items: [
          { type: "gear", r: 30, teeth: 32, h: 10, bore: 6.6, toothH: 3.4, holes: [0, 90, 180, 270].map(a => [Math.cos(a * R) * 18, Math.sin(a * R) * 18, 3.6]) },
          { type: "gear", r: 13.8, teeth: 14, h: 16.3, bore: 6.6, toothH: 3, at: [0, 10, 0] } ] } },
      { id: "washer3b", ref: "3", name: "Idle gear washer (outer)", mat: "steel", small: true, stage: 9, A: [12.65, IY, IZ], E: [100, IY + 90, IZ], dir: [-1, 0, 0],
        geom: { type: "ring", ri: 6.65, ro: 12.5, h: .85, rot: [0, 0, -90] } },
      { id: "pin2", ref: "2", name: "Idle gear pin", mat: "steel", stage: 10, A: [-41.5, IY, IZ], E: [120, IY + 90, IZ], dir: [-1, 0, 0],
        geom: { type: "lathe", rot: [0, 0, -90], pts: [[0, 0], [5.9, 0], [6.5, .6], [6.5, 55.4], [5.9, 56], [0, 56]] } },
    ],
  };
})();
D3_MODELS["CMS-BLCK0068"] = D3_BLCK0068;
