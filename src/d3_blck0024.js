/* ============ 3D parts model: frame covers (side covers), GS750N,EN 1977 (CMSNL BLCK0024) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: same as the front fork leg model (DG-CH-01): +X = rider's LEFT, +Y up, +Z forward. Right-handed, no mirrorX.
   The bike centre line is X = 0. Each cover's outer face sits at X = +/-125 (left/right), the cover's middle at Y = 0, Z = 0.
   Identity and numbering: CMSNL page BLCK0024 and its picture (ref 1 = right cover, ref 10 = left cover per the catalogue rows).
   Same geometry as the GS750B,C,EC page (CMS-BLCK0025); this page has a different washer and no company label.
   Geometry: APPROXIMATE. The covers are drawn as flat moulded panels with a turned-in top lip; the real covers are curved.
   The frame tabs the screws thread into are not on this page and are not drawn.
   Each part: id, ref, name, mat, geom, A (installed, world mm), E (exploded, world mm), dir (installing move), stage, parent, small, count.
   The emblem lettering is built from raised strokes in the emblem's own XY plane (reading along +x, raised toward +z) and turned so
   it faces outward and reads left to right from outside the bike on both sides. */
const D3_BLCK0024 = (() => {
  const OUT = 125, DROP = 70; // outer face distance from centre line; how far the covers sit out in the exploded view
  const topY = z => 105 + (165 - z) * 20 / 340; // top edge of the cover (front lower than rear)
  // cover outline in the side plane as [z, y] (front = +z)
  const OUTLINE = [[165, 105], [-170, 125], [-180, 122], [-185, 112], [-180, 90], [-135, -15], [-130, -22], [40, -118], [52, -125], [62, -118],
    [72, -95], [85, -45], [105, 10], [130, 60], [150, 90], [160, 102]];
  const HOLE = [-40, -45], EMB = [-40, 30], CUSH = -110; // [z, y] of grommet hole and emblem centre; cushion z
  // one straight stroke from (x1,y1) to (x2,y2), width w, raised th above z0
  const seg = (x1, y1, x2, y2, w, th, z0) => { const L = Math.hypot(x2 - x1, y2 - y1); return { type: "box", size: [L + w, w, th], r: Math.min(.4, w / 3),
    rot: [0, 0, Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI], at: [(x1 + x2) / 2, (y1 + y2) / 2, z0 + th / 2] }; };
  const GLYPH = { // strokes in a 12 x 18 box, origin bottom-left
    G: [[3, 18, 12, 18], [0, 15, 3, 18], [0, 15, 0, 3], [0, 3, 3, 0], [3, 0, 9, 0], [9, 0, 12, 3], [12, 3, 12, 9], [6, 9, 12, 9]],
    S: [[3, 18, 12, 18], [0, 15, 3, 18], [0, 15, 0, 11], [0, 11, 2, 9], [2, 9, 10, 9], [10, 9, 12, 7], [12, 7, 12, 3], [12, 3, 9, 0], [9, 0, 0, 0]],
    7: [[0, 18, 12, 18], [12, 18, 4, 0]],
    5: [[0, 18, 12, 18], [0, 18, 0, 10], [0, 10, 9, 10], [9, 10, 12, 7], [12, 7, 12, 3], [12, 3, 9, 0], [9, 0, 0, 0]],
    0: [[3, 18, 9, 18], [9, 18, 12, 15], [12, 15, 12, 3], [12, 3, 9, 0], [9, 0, 3, 0], [3, 0, 0, 3], [0, 3, 0, 15], [0, 15, 3, 18]],
    E: [[0, 0, 0, 18], [0, 18, 12, 18], [0, 9, 9, 9], [0, 0, 12, 0]],
    U: [[0, 18, 0, 3], [0, 3, 3, 0], [3, 0, 9, 0], [9, 0, 12, 3], [12, 3, 12, 18]],
    Z: [[0, 18, 12, 18], [12, 18, 0, 0], [0, 0, 12, 0]],
    K: [[0, 0, 0, 18], [0, 8, 12, 18], [4, 11, 12, 0]],
    I: [[6, 0, 6, 18]],
  };
  const word = (txt, k, w, th, z0, mat) => { const pitch = 16 * k, x0 = -(txt.length * pitch - 4 * k) / 2, y0 = -9 * k; const items = [];
    [...txt].forEach((ch, i) => GLYPH[ch].forEach(s => items.push(Object.assign(seg(x0 + i * pitch + s[0] * k, y0 + s[1] * k, x0 + i * pitch + s[2] * k, y0 + s[3] * k, w, th, z0), mat ? { mat } : {})))); return items; };
  const slab = (W, H, sl) => [[-W / 2 + sl, H / 2], [-W / 2, -H / 2], [W / 2 - sl, -H / 2], [W / 2, H / 2]]; // slanted plate outline

  function side(s) { // s = +1 left (ref 10..18), -1 right (ref 1..9)
    const L = s > 0, R0 = L ? 9 : 0, k = L ? "L" : "R", nm = L ? "left" : "right", X = s * OUT, XE = s * (OUT + DROP);
    const ry = L ? -90 : 90;            // turns an XY outline (depth +z) so the outline lies in the side plane and depth goes inboard
    const face = L ? 90 : -90;          // turns emblem-local +z (raised face) to point outward, reading front to rear... from outside, left to right
    const outline = OUTLINE.map(([z, y]) => [L ? z : -z, y]);
    const hx = L ? HOLE[0] : -HOLE[0];
    const cover = { id: "cover" + k, ref: String(R0 + 1), name: `Frame cover, ${nm}`, mat: "black", shell: true, stage: 4, A: [X, 0, 0], E: [XE, 0, 0], dir: [-s, 0, 0],
      geom: { type: "group", items: [
        { type: "extrude", pts: outline, holes: [[hx, HOLE[1], 6]], depth: 3, bevel: .6, rot: [0, ry, 0] },
        { type: "box", size: [25, 3, 330], r: 1, rot: [3.37, 0, 0], at: [-s * 12.5, topY(-5) - 2, -5] },                       // turned-in top lip
        { type: "box", size: [12, 1.2, 40], r: .4, rot: [3.37, 0, 0], at: [-s * 13, topY(60) - .2, 60], mat: "dark" },        // front slot in the lip
        { type: "box", size: [12, 1.2, 40], r: .4, rot: [3.37, 0, 0], at: [-s * 13, topY(CUSH) - .2, CUSH], mat: "dark" },    // rear slot (cushion)
        { type: "tube", r: 1.6, pts: [[s * .6, 85, 140], [s * .6, topY(60) - 11, 60], [s * .6, topY(-60) - 11, -60], [s * .6, topY(-165) - 11, -165]] },  // moulded ribs
        { type: "tube", r: 1.6, pts: [[s * .6, 75, 132], [s * .6, topY(60) - 19, 60], [s * .6, topY(-60) - 19, -60], [s * .6, topY(-160) - 19, -160]] },
        { type: "tube", r: 1.6, pts: [[s * .6, -100, 58], [s * .6, -45, 72], [s * .6, 10, 92], [s * .6, 55, 115], [s * .6, 85, 140]] },
      ] } };
    const zz = z => z; // the right cover mirrors the left about X = 0, so Z (front) is the same on both
    const at = (dx, y, z) => [X + dx, y, zz(z)], ex = (dx, y, z) => [XE + dx, y, zz(z)];
    const axY = L ? [0, 0, -90] : [0, 0, 90]; // local +Y -> outward (+X on the left, -X on the right)
    const parts = [cover];
    // grommet stack at the bottom hole: cushion in the hole, spacer through it, washer and screw from outside
    parts.push({ id: "grom" + k, ref: String(R0 + 4), name: `Cushion (mounting grommet, ${nm} cover)`, mat: "rubber", small: true, parent: cover.id, stage: 1,
      A: at(0, HOLE[1], HOLE[0]), E: ex(s * 50, HOLE[1], HOLE[0]), dir: [-s, 0, 0],
      geom: { type: "lathe", pts: [[5, -6], [9, -6], [9, -3], [6, -3], [6, 0], [9, 0], [9, 3], [5, 3]], rot: axY } });
    parts.push({ id: "spac" + k, ref: String(R0 + 5), name: `Spacer (in the grommet, ${nm})`, mat: "steel", small: true, parent: "grom" + k, stage: 1,
      A: at(0, HOLE[1], HOLE[0]), E: ex(s * 80, HOLE[1], HOLE[0]), dir: [-s, 0, 0],
      geom: { type: "lathe", pts: [[3.4, -6], [5, -6], [5, 4], [3.4, 4]], rot: axY } });
    parts.push({ id: "wash" + k, ref: String(R0 + 3), name: `Washer (cover screw, ${nm})`, mat: "zinc", small: true, parent: cover.id, stage: 5,
      A: at(s * 4, HOLE[1], HOLE[0]), E: ex(s * 115, HOLE[1], HOLE[0]), dir: [-s, 0, 0],
      geom: { type: "ring", ro: 10, ri: 3.25, h: 1.2, rot: axY } });
    parts.push({ id: "scr" + k, ref: String(R0 + 2), name: `Screw (cover mounting, ${nm})`, mat: "zinc", small: true, parent: cover.id, stage: 5,
      A: at(s * 5.2, HOLE[1], HOLE[0]), E: ex(s * 155, HOLE[1], HOLE[0]), dir: [-s, 0, 0],
      geom: { type: "group", rot: axY, items: [
        { type: "lathe", pts: [[0, -20], [2.9, -20], [3, -19.4], [3, 0], [6.5, 0], [6.5, 1.5], [5.6, 3.6], [3.5, 4.2], [0, 4.2]] },
        { type: "box", size: [6, 1.2, 1.1], r: .2, at: [0, 4.1, 0], mat: "dark" }, { type: "box", size: [1.1, 1.2, 6], r: .2, at: [0, 4.1, 0], mat: "dark" } ] } });
    // emblem with two studs, held by push nuts on the inside (this page has no company label)
    const EW = 104, EH = 30;
    parts.push({ id: "emb" + k, ref: String(R0 + 7), name: `Emblem "GS750" (${nm} cover)`, mat: "chrome", parent: cover.id, stage: 2,
      A: at(0, EMB[1], EMB[0]), E: ex(s * 130, EMB[1], EMB[0]), dir: [-s, 0, 0],
      geom: { type: "group", rot: [0, face, 0], items: [
        { type: "extrude", pts: slab(EW, EH, 6), depth: 2, bevel: .6, mat: "black" },
        { type: "extrude", pts: slab(EW - 7, EH - 7, 5), depth: .6, bevel: .3, at: [0, 0, 2.2], mat: "chrome" },
        ...word("GS750", 1.12, 3.2, 1.6, 2.8, "chrome"),
        { type: "pair", at: [[-EW / 2 + 12, 0, 0], [EW / 2 - 12, 0, 0]], item: { type: "cyl", r: 1.5, h: 9, axis: "z", at: [0, 0, -9] } } ] } });
    parts.push({ id: "nut" + k, ref: String(R0 + 9), name: `Nuts (emblem studs, ${nm})`, mat: "spring", small: true, parent: "emb" + k, stage: 2, count: 2,
      A: at(-s * 3, EMB[1], EMB[0]), E: ex(-s * 60, EMB[1], EMB[0]), dir: [s, 0, 0],
      geom: { type: "pair", at: [[0, 0, -EW / 2 + 12], [0, 0, EW / 2 - 12]], item: { type: "hex", af: 7, h: 1.6, hole: 1.5, rot: L ? [0, 0, 90] : [0, 0, -90] } } });
    parts.push({ id: "cush" + k, ref: String(R0 + 6), name: `Cushion (top of ${nm} cover)`, mat: "rubber", small: true, parent: cover.id, stage: 3,
      A: [X - s * 13, topY(CUSH) + .2, zz(CUSH)], E: [XE - s * 13, topY(CUSH) + 60, zz(CUSH)], dir: [0, -1, 0],
      geom: { type: "group", items: [{ type: "box", size: [14, 6, 36], r: 1.2, at: [0, 3, 0] }, { type: "box", size: [6, 7, 36], r: 1.2, at: [-s * 4, 9, 0] }] } });
    return parts;
  }

  return {
    id: "CMS-BLCK0024", title: "Frame covers (GS750N, EN)", units: "mm", page: "BLCK0024",
    accuracy: "Approximate geometry. Part identity, numbering and layout follow the CMSNL frame cover picture (GS750N, EN). The covers are drawn as flat panels with a turned-in top lip; the real covers are curved mouldings. Every size here is an estimate, not a factory figure. The frame tabs the screws go into are not on this page and are not drawn.",
    view: { dir: [1.1, .5, .95], up: [0, 1, 0] },
    notModelled: "Ref 8 and ref 17 (the GS750E emblem) are the EN-model alternative to the GS750 emblem (refs 7 and 16) and fit in the same place, so only the GS750 emblem is drawn. Refs 1 and 10 have several colour codes (1-1 to 1-3, 10-1 to 10-3); one cover is drawn for each side. The frame tabs the screws thread into are part of the frame, not this page.",
    stages: [
      { t: "Grommets and spacers", d: "Push the rubber grommet into the hole low on each cover, then push the spacer into the grommet." },
      { t: "Emblems", d: "Fit the GS750 emblem from the outside with its studs through the cover and press the nuts onto the studs from the inside. Don't crack the plastic." },
      { t: "Top cushion", d: "Fit the rubber cushion in the rear slot of the top lip of each cover." },
      { t: "Covers onto the frame", d: "Hold each cover against the frame so the top lip and cushion sit on the frame rail and the grommet lines up with the frame tab." },
      { t: "Screws", d: "Fit the washer and screw through the spacer into the frame tab on each side. Snug only, the spacer takes the load. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    ],
    parts: [...side(-1), ...side(1)],
  };
})();
D3_MODELS["CMS-BLCK0024"] = D3_BLCK0024;
