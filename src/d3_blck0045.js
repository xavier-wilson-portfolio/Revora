/* ============ 3D parts model: LH handle switch and clutch lever, GS750B 1977 (CMSNL BLCK0045) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: +X = rider's LEFT (outboard along the left handlebar), +Y up, +Z forward. The handlebar is drawn straight
   along X with its axis on Y = 0, Z = 0. Switch housing centred at X = 0, clutch lever holder inboard of it (X = -45),
   grip outboard (X = 23 .. 149, bar end at X = 148).
   Identity and numbering: CMSNL page BLCK0045 and its picture. Ref 2 (clutch lever assembly) has no separate number for
   the holder, so the holder body and its clamp are drawn as ref 2. Ref 11 (switch assembly) is drawn as its two housing halves.
   Geometry: APPROXIMATE. 22.2 mm (7/8 in) bar, other sizes are typical 1970s proportions, not measured from a GS750. */
(() => {
const arc = (r, a0, a1, n, cx = 0, cy = 0) => { const o = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; o.push([+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)]); } return o; };
const BR = 11.1, HOLE = 11.3;
// switch housing halves: outline in the Z-Y plane (profile x = world z), extruded across X from +22 to -22
const upperPts = [[-26, 0], [-HOLE, 0], ...arc(HOLE, 180, 0, 16), [24, 0], [24, 18], [16, 28], [0, 31], [-18, 28], [-26, 20]];
const lowerPts = [[-26, 0], [-26, -18], [-18, -27], [16, -27], [24, -16], [24, 0], ...arc(HOLE, 0, -180, 16)];
// clutch lever holder: body (front half clamp + lever jaws) and rear clamp, split on Z = 0
const bodyPts = [[0, 22], [10, 22], [10, 12], [15, 7], [17, 0], [15, -7], [10, -12], [10, -22], [0, -22], ...arc(HOLE, -90, 90, 14)];
const clampPts = [[0, 22], [0, HOLE], ...arc(HOLE, 90, 270, 14), [0, -22], [-10, -22], [-10, -12], [-15, -7], [-17, 0], [-15, 7], [-10, 12], [-10, 22]];
// jaw outline in X-Z (written as [x, -z] for the extrude turned flat)
const jawXZ = [[-12, 8], [12, 8], [14, 28], [10, 42], [-3, 43], [-12, 33]];
const jaw = y => ({ type: "extrude", pts: jawXZ.map(([x, z]) => [x, -z]), holes: [[3, -34, 3.2]], depth: 6, bevel: .5, rot: [-90, 0, 0], at: [0, y, 0] });
// clutch lever outline around the pivot (lx outboard, lz forward), written as [lx, -lz]
const leverXZ = [[-11, 2], [-10, -8], [-8, -15], [-2, -17], [4, -12], [12, -5], [40, 1], [100, 3], [160, 1], [176, -2], [182, -3], [187, 0], [189, 6], [186, 12], [180, 14], [172, 13], [160, 12], [100, 13], [40, 12], [14, 11], [4, 10], [-6, 8]];
const HX = -45, PV = [HX + 3, 0, 34]; // holder centre on the bar, lever pivot (world)
const ADJ = HX - 24; // face of the cable adjuster boss (world x)

const D3_BLCK0045 = {
  id: "CMS-BLCK0045", title: "LH handle switch and clutch lever (GS750B)", units: "mm", page: "BLCK0045",
  accuracy: "Approximate geometry. Part identity, numbering and layout follow the CMSNL picture for this page; shapes and sizes are typical for a 1970s 750 and were not measured from a GS750 (bar taken as 22.2 mm). Use the factory service manual for every dimension.",
  view: { dir: [1, .7, 1.05], up: [0, 1, 0] },
  notModelled: "All refs are drawn. Ref 2 is the clutch lever assembly; its holder body and clamp have no number of their own, so they carry ref 2. Ref 11 is shown as the two switch housing halves (the switches inside are not drawn). The handlebar (no ref) is drawn for context only.",
  stages: [
    { t: "Lever holder onto the bar", d: "Set the holder body on the front of the bar inboard of where the switch housing goes." },
    { t: "Holder clamp", d: "Fit the clamp from behind and run in the two bolts evenly. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Clutch lever", d: "Grease the pivot and slide the lever between the holder jaws so the holes line up." },
    { t: "Pivot bolt", d: "Push the pivot bolt down through the jaws and the lever." },
    { t: "Lock washer, nut and cotter pin", d: "Fit the lock washer and nut under the holder. Tighten until the lever moves freely without play, then fit a new cotter pin." },
    { t: "Cable adjuster", d: "Thread the locknut onto the adjuster, screw the adjuster into the holder and slide the cable boot over it. Set free play: VERIFY IN FACTORY SERVICE MANUAL." },
    { t: "Lever cover", d: "Pull the rubber cover over the front of the holder and the pivot." },
    { t: "Switch housing", d: "Put the two halves round the bar outboard of the lever holder with the wires leading out underneath, and fit the two screws from below." },
    { t: "Switch knobs", d: "Fit the knob plates and knobs on the top, the screw in the outboard knob, then the knob on the back and the turn signal knob." },
    { t: "Grip", d: "Slide the grip onto the bar end until it stops against the switch housing. Use grip glue if the old one came off easily." },
  ],
  parts: [
    { id: "bar", ref: "—", name: "Handlebar, left end (not on this page)", mat: "chrome", stage: 0, A: [-140, 0, 0], E: [-140, 0, 0], dir: [1, 0, 0],
      geom: { type: "group", items: [
        { type: "cyl", r: BR, h: 288, axis: "x" },
        { type: "cyl", r: 3, h: 1, axis: "x", at: [288, 0, 0], mat: "black" } ] } },
    // ---- clutch lever holder
    { id: "body", ref: "2", name: "Clutch lever holder (part of lever assembly 2)", mat: "alu", stage: 1, A: [HX, 0, 0], E: [HX, 0, 110], dir: [0, 0, -1],
      geom: { type: "group", items: [
        { type: "extrude", pts: bodyPts, depth: 24, bevel: .6, rot: [0, -90, 0], at: [12, 0, 0] },
        jaw(4), jaw(-10),
        { type: "cyl", r: 6.5, h: 14, axis: "x", at: [-24, 0, 24] },
        { type: "cyl", r: 4.2, h: .6, axis: "x", at: [-24.3, 0, 24], mat: "black" } ] } },
    { id: "clamp", ref: "2", name: "Lever holder clamp (part of lever assembly 2)", mat: "alu", parent: "body", stage: 2, A: [HX, 0, 0], E: [HX, 0, -110], dir: [0, 0, 1],
      geom: { type: "extrude", pts: clampPts, depth: 24, bevel: .6, rot: [0, -90, 0], at: [12, 0, 0] } },
    { id: "bolts10", ref: "10", name: "Clamp bolts", mat: "zinc", small: true, parent: "clamp", stage: 2, A: [HX, 0, -10.6], E: [HX, 0, -175], dir: [0, 0, 1], count: 2,
      geom: { type: "pair", at: [[0, 17, 0], [0, -17, 0]], item: { type: "group", rot: [90, 0, 0], items: [
        { type: "hex", af: 10, h: 4, y: -4.5 },
        { type: "lathe", pts: [[0, -.5], [5.6, -.5], [5.6, 0], [3, 0], [3, 18], [0, 18]] } ] } } },
    // ---- lever and pivot
    { id: "lever", ref: "3", name: "Clutch lever", mat: "alu", parent: "body", stage: 3, A: [PV[0], -3, PV[2]], E: [PV[0], -63, PV[2] + 110], dir: [0, 0, -1],
      geom: { type: "group", items: [
        { type: "extrude", pts: leverXZ.map(([x, z]) => [x, -z]), holes: [[0, 0, 3.2], [-4, 10, 2.6]], depth: 6, bevel: .3, rot: [-90, 0, 0] } ] } },
    { id: "pivot", ref: "4", name: "Lever pivot bolt", mat: "zinc", small: true, parent: "body", stage: 4, A: [PV[0], 10.5, PV[2]], E: [PV[0], 85, PV[2] + 110], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "lathe", pts: [[0, 0], [7, 0], [7, 4], [6, 5.5], [0, 5.5]] },
        { type: "socket", y: 5.8, af: 5 },
        { type: "lathe", pts: [[0, -34], [2.9, -34], [3, -33], [3, 0], [0, 0]] },
        { type: "cyl", r: .9, h: 7, axis: "z", at: [0, -28.5, -3.5], mat: "black" } ] } },
    { id: "lw5", ref: "5", name: "Lock washer (pivot bolt)", mat: "spring", small: true, parent: "pivot", stage: 5, A: [PV[0], -12.2, PV[2]], E: [PV[0], -100, PV[2] + 110], dir: [0, 1, 0],
      geom: { type: "ring", ro: 5.6, ri: 3.1, h: 1.6, split: true } },
    { id: "nut6", ref: "6", name: "Lever pivot nut", mat: "zinc", small: true, parent: "pivot", stage: 5, A: [PV[0], -17.2, PV[2]], E: [PV[0], -128, PV[2] + 110], dir: [0, 1, 0],
      geom: { type: "group", items: [ { type: "hex", af: 10, h: 5, y: 0, hole: 3 }, { type: "lathe", pts: [[3, -1.6], [4.4, -1.6], [4.6, 0], [3, 0]] } ] } },
    { id: "cotter", ref: "7", name: "Cotter pin", mat: "steel", small: true, parent: "pivot", stage: 5, A: [PV[0], -18, PV[2]], E: [PV[0] - 60, -152, PV[2] + 110], dir: [1, 0, 0],
      geom: { type: "group", items: [
        { type: "tube", r: .75, pts: [[8, 0, .8], [0, 0, .8], [-6, 0, .8], [-8, 0, 1.6], [-9.5, 0, 0], [-8, 0, -1.6], [-6, 0, -.8], [0, 0, -.8], [6, 0, -.8]] } ] } },
    // ---- cable adjuster
    { id: "nut9", ref: "9", name: "Cable adjuster locknut", mat: "zinc", small: true, parent: "body", stage: 6, A: [ADJ - .2, 0, 24], E: [ADJ - 45, 0, 134], dir: [1, 0, 0],
      geom: { type: "group", rot: [0, 0, 90], items: [ { type: "lathe", pts: [[4.1, 0], [7.5, 0], [7.5, 5.5], [4.1, 5.5]] }, { type: "holes", y: [2.75], r: 7.5, d: 1.6 } ] } },
    { id: "adj", ref: "8", name: "Cable adjuster", mat: "zinc", parent: "body", stage: 6, A: [ADJ, 0, 24], E: [ADJ - 110, 0, 134], dir: [1, 0, 0],
      geom: { type: "group", rot: [0, 0, 90], items: [
        { type: "lathe", pts: [[1.6, -12], [4, -12], [4, 8], [1.6, 8]] },
        { type: "lathe", pts: [[1.6, 8], [7, 8], [7.2, 9], [7.2, 17], [7, 18], [1.6, 18]] },
        { type: "holes", y: [11, 13, 15], r: 7.2, d: 1.2 } ] } },
    { id: "boot19", ref: "19", name: "Clutch cable boot", mat: "rubber", parent: "adj", stage: 6, A: [ADJ - 6, 0, 24], E: [ADJ - 175, 0, 134], dir: [1, 0, 0],
      geom: { type: "group", rot: [0, 0, 90], items: [
        { type: "lathe", pts: [[7.6, 0], [9, 0], [9, 13], [5, 26], [4.4, 36], [2.6, 36], [2.6, 27], [7.6, 13]] },
        { type: "tube", r: 2.6, pts: [[0, 36, 0], [0, 50, 0], [-2, 66, 4]], mat: "black" } ] } },
    { id: "cover18", ref: "18", shell: true, name: "Clutch lever cover", mat: "rubber", parent: "body", stage: 7, A: [HX, -13, 0], E: [HX, -13, 245], dir: [0, 0, -1],
      geom: { type: "extrude", pts: [[-14, -14], [14, -14], [16, -30], [12, -46], [-4, -47], [-14, -36]], depth: 30, bevel: 3, rot: [-90, 0, 0] } },
    // ---- switch housing
    { id: "lower", shell: true, ref: "11", name: "Switch housing, lower half (switch assembly 11)", mat: "black", stage: 8, A: [0, 0, 0], E: [0, -130, -40], dir: [0, 1, 0],
      geom: { type: "group", items: [
        { type: "extrude", pts: lowerPts, depth: 44, bevel: .8, rot: [0, -90, 0], at: [22, 0, 0] },
        { type: "tube", r: 4, pts: [[-12, -26, 4], [-16, -33, 6], [-40, -40, 8], [-80, -42, 10]], mat: "rubber" } ] } },
    { id: "upper", shell: true, ref: "11", name: "Switch housing, upper half (switch assembly 11)", mat: "black", parent: "lower", stage: 8, A: [0, 0, 0], E: [0, 95, 0], dir: [0, -1, 0],
      geom: { type: "extrude", pts: upperPts, depth: 44, bevel: .8, rot: [0, -90, 0], at: [22, 0, 0] } },
    { id: "screws17", ref: "17", name: "Housing screws", mat: "zinc", small: true, parent: "lower", stage: 8, A: [0, -27.8, 0], E: [0, -215, -40], dir: [0, 1, 0], count: 2,
      geom: { type: "pair", at: [[0, 0, -14], [0, 0, 12]], item: { type: "group", items: [
        { type: "lathe", pts: [[0, -3.2], [4.4, -3.2], [4.6, -1], [4.6, 0], [2.5, 0], [2.5, 30], [0, 30]] },
        { type: "box", size: [1.2, .8, 6], r: .2, at: [0, -3.4, 0], mat: "black" } ] } } },
    { id: "plate21", ref: "21", name: "Knob plate (inboard knob)", mat: "chrome", small: true, parent: "upper", stage: 9, A: [-10, 31.2, -5], E: [-10, 175, -5], dir: [0, -1, 0],
      geom: { type: "box", size: [17, 1.2, 13], r: .5 } },
    { id: "knob20", ref: "20", name: "Switch knob (top, inboard)", mat: "black", parent: "upper", stage: 9, A: [-10, 31.8, -5], E: [-10, 205, -5], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "cyl", r: 5, h: 3.5 },
        { type: "extrude", pts: [[-8, 0], [8, 0], [5, 7], [2, 10], [-2, 10], [-5, 7]], depth: 4, bevel: .5, at: [0, 2.5, -2] } ] } },
    { id: "plate14", ref: "14", name: "Knob plate (outboard knob)", mat: "chrome", small: true, parent: "upper", stage: 9, A: [10, 31.2, -5], E: [10, 165, -5], dir: [0, -1, 0],
      geom: { type: "box", size: [17, 1.2, 13], r: .5 } },
    { id: "knob13", ref: "13", name: "Switch knob (top, outboard)", mat: "black", parent: "upper", stage: 9, A: [10, 31.8, -5], E: [10, 190, -5], dir: [0, -1, 0],
      geom: { type: "group", items: [
        { type: "cyl", r: 5, h: 3.5 },
        { type: "extrude", pts: [[-9, 0], [9, 0], [7, 6], [3, 9], [-3, 9], [-7, 6]], depth: 5, bevel: .5, at: [0, 2.5, -2.5] } ] } },
    { id: "screw15", ref: "15", name: "Knob screw", mat: "zinc", small: true, parent: "knob13", stage: 9, A: [10, 44.2, -5], E: [10, 235, -5], dir: [0, -1, 0],
      geom: { type: "lathe", pts: [[0, -6], [1.3, -6], [1.3, 0], [2.6, 0], [2.6, 1.6], [0, 2]] } },
    { id: "knob12", ref: "12", name: "Switch knob (back of housing)", mat: "black", parent: "upper", stage: 9, A: [-8, 11, -26.8], E: [-8, 11, -95], dir: [0, 0, 1],
      geom: { type: "group", items: [
        { type: "cyl", r: 6, h: 3.5, axis: "z", at: [0, 0, -3.5] },
        { type: "extrude", pts: [[-3, -7], [3, -7], [2, 8], [-2, 8]], depth: 5, bevel: .5, at: [0, 0, -8.5] } ] } },
    { id: "knob16", ref: "16", name: "Turn signal switch knob", mat: "black", parent: "lower", stage: 9, A: [10, -9, -26.8], E: [10, -9, -120], dir: [0, 0, 1],
      geom: { type: "group", items: [
        { type: "cyl", r: 4.5, h: 6, axis: "z", at: [0, 0, -6] },
        { type: "tube", r: 2.4, pts: [[0, 0, -4], [-2, -6, -7], [-6, -14, -9], [-12, -19, -10]] },
        { type: "box", size: [11, 7, 5], r: 1.5, at: [-15, -21, -10] } ] } },
    // ---- grip
    { id: "grip", ref: "1", name: "Left grip", mat: "rubber", parent: "bar", stage: 10, A: [23, 0, 0], E: [240, 0, 0], dir: [-1, 0, 0],
      geom: { type: "group", rot: [0, 0, -90], items: [
        { type: "lathe", pts: [[BR, 0], [19, 0], [19, 5], [15.6, 8], [16.2, 60], [16.8, 112], [16, 122], [12, 126], [4, 126], [4, 125], [BR, 125]] },
        { type: "array", pos: Array.from({ length: 20 }, (_, i) => { const a = i * 18; return [+(16.3 * Math.cos(a * Math.PI / 180)).toFixed(2), 14, +(16.3 * Math.sin(a * Math.PI / 180)).toFixed(2), -a]; }), item: { type: "box", size: [1.6, 94, 1.6], r: .5, at: [0, 47, 0] } } ] } },
  ],
};
D3_MODELS["CMS-BLCK0045"] = D3_BLCK0045;
})();
