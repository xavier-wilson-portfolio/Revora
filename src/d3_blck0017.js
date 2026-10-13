/* ============ 3D parts model: cylinder block, GS750B 1977 (CMSNL BLCK0017) ============
   Mechanical data only. Units: millimetres.
   World frame: the cylinder base face (top of the base gasket) is Y = 0, +Y up the cylinder axes (the forward tilt of the
   block on the bike is ignored), +X across the engine toward the rider's left, +Z forward. Cylinders 1 to 4 sit on the
   X axis at X = -127, -53, 53, 127 (Z = 0); the cam chain tunnel is the gap between cylinders 2 and 3 at X = 0.
   The crankcase isn't on this page and isn't drawn: the deck it would give is the underside of the base gasket (Y = -1).
   Identity and numbering: CMSNL cylinder page, refs 1 to 7 (dash numbers are supersessions of the same part).
   Geometry: APPROXIMATE. Bore 65 mm and stroke 56.4 mm are the published GS750 figures; the 70 mm ID x 2 mm sleeve
   O-ring and 3.05 mm section O-ring come from the catalogue descriptions. Cylinder pitch, block height, fin count,
   stud layout and dowel positions are typical 1970s Suzuki DOHC four proportions, not factory measurements. */
(function () {
  const BORE = 32.5, SLEEVE = 36, CX = [-127, -53, 53, 127], H = 98;
  const STUD_X = [-164, -90, -16, 16, 90, 164], STUD_Z = [-42, 42];
  const DOWELS = [[-164, 42], [164, -42]]; // studs that carry the base dowels (and their O-rings)
  const isDowel = (x, z) => DOWELS.some(d => d[0] === x && d[1] === z);
  // flat plate in world X/Z, y = bottom face, h = thickness; holes [[x, z, r]]
  const rect = (x0, x1, z0, z1, y, h, holes, bevel, ch) => {
    const c = ch || 0, a = Math.min(x0, x1), b = Math.max(x0, x1), p = Math.min(z0, z1), q = Math.max(z0, z1);
    const pts = c ? [[a + c, p], [b - c, p], [b, p + c], [b, q - c], [b - c, q], [a + c, q], [a, q - c], [a, p + c]] : [[a, p], [b, p], [b, q], [a, q]];
    return { type: "extrude", depth: h, bevel: bevel ?? .4, rot: [-90, 0, 0], at: [0, y, 0],
      pts: pts.map(([x, z]) => [x, -z]), holes: (holes || []).map(([x, z, r]) => [x, -z, r]) };
  };
  // one side of the block (s = -1: cylinders 1-2, s = +1: cylinders 3-4); the cam chain tunnel is |X| < 10
  const half = s => {
    const bores = CX.filter(x => Math.sign(x) === s).map(x => [x, 0, SLEEVE]);
    const studs = r => STUD_X.filter(x => Math.sign(x) === s).flatMap(x => STUD_Z.map(z => [x, z, typeof r === "function" ? r(x, z) : r]));
    const items = [];
    items.push(rect(s * 10, s * 176, -50, 50, 6, H - 6, [...bores, ...studs((x, z) => isDowel(x, z) ? 7.2 : 5.5)], .6)); // core casting
    items.push(rect(s * 10, s * 180, -54, 54, 0, 6, [...bores, ...studs((x, z) => isDowel(x, z) ? 10.2 : 5.5)], .5, 4)); // base flange with dowel counterbores
    for (let i = 0; i < 9; i++) items.push(rect(s * 10, s * 188, -62, 62, 14 + 8.5 * i, 2.5, [...bores, ...studs(5.5)], .4, 6)); // cooling fins
    items.push(rect(s * 10, s * 184, -58, 58, 90, 8, [...bores, ...studs(5.5)], .5, 5)); // top deck
    return items;
  };
  // walls of the cam chain tunnel, front and rear, with their own fins
  const centre = [];
  [-1, 1].forEach(t => {
    centre.push(rect(-10, 10, t * 26, t * 50, 6, H - 6, [], .6));
    centre.push(rect(-10, 10, t * 26, t * 54, 0, 6, [], .5));
    for (let i = 0; i < 9; i++) centre.push(rect(-10, 10, t * 26, t * 62, 14 + 8.5 * i, 2.5, [], .4));
    centre.push(rect(-10, 10, t * 26, t * 58, 90, 8, [], .5));
  });
  const sleeves = CX.map(x => ({ type: "lathe", mat: "dark", at: [x, 0, 0], pts: [[BORE, -18], [35.5, -18], [35.5, -16], [34.6, -15.5], [34.6, -12.5], [35.5, -12], [35.5, 0], [SLEEVE, 0], [SLEEVE, H], [BORE, H]] }));
  const tensioner = [ // cam chain tensioner mounting boss on the back of the tunnel
    { type: "cyl", r: 15, h: 14, axis: "z", at: [0, 52, -64] },
    { type: "cyl", r: 7, h: 1, axis: "z", mat: "black", at: [0, 52, -64.6] },
    { type: "pair", at: [[-21, 52, -58], [21, 52, -58]], item: { type: "cyl", r: 6, h: 8, axis: "z" } },
  ];
  const studItem = top => ({ type: "lathe", pts: [[0, -21], [4.5, -21], [5, -20], [5, top], [4.5, top + 1], [0, top + 1]] });
  const studPos = xs => xs.flatMap(x => STUD_Z.map(z => [x, 0, z]));

  D3_MODELS["CMS-BLCK0017"] = {
    id: "CMS-BLCK0017", title: "Cylinder", units: "mm", page: "BLCK0017",
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL cylinder page. Bore 65 mm and stroke 56.4 mm are the published GS750 figures and the O-ring sizes come from the catalogue descriptions; cylinder pitch, block height, fins, stud layout and dowel positions are typical proportions, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [1.1, .85, 1.35], up: [0, 1, 0] },
    notModelled: "Every ref on this page is drawn (dash numbers are supersessions of the same part). The crankcase the studs screw into, the pistons and the cylinder head aren't on this page, so they aren't drawn; the studs stand where the crankcase holds them. Which studs are ref 2 and which are ref 3, the dowel and small O-ring positions, and the stud count are not given by the catalogue and are shown in a typical layout.",
    stages: [
      { t: "Dowel pins over the studs", d: "With the head studs already screwed into the crankcase, push the two hollow dowel pins over their studs into the crankcase deck." },
      { t: "Small O-rings on the dowels", d: "Fit a new small O-ring around each dowel pin. They seal the oil passages up through the base joint." },
      { t: "Base gasket", d: "Clean both faces and lay a new base gasket over the studs and dowels onto the crankcase. Check it is the right way round so no oil hole is blocked: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Sleeve O-rings", d: "Fit a new O-ring into the groove on the bottom of each cylinder sleeve. Oil them lightly so they don't roll as the sleeves go into the crankcase." },
      { t: "Lower the cylinder block", d: "Oil the bores, stagger the piston ring gaps and lower the block straight down over the studs, guiding the cam chain up the tunnel and each piston into its bore. Ring gap positions: VERIFY IN FACTORY SERVICE MANUAL." },
    ],
    parts: [
      { id: "studs2", ref: "2", name: "Studs (cylinder head, inner)", mat: "steel", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, -1, 0], count: 8,
        geom: { type: "array", pos: studPos([-90, -16, 16, 90]), item: studItem(190) } },
      { id: "studs3", ref: "3", name: "Studs (cylinder head, outer)", mat: "steel", stage: 0, A: [0, 0, 0], E: [0, 0, 0], dir: [0, -1, 0], count: 4,
        geom: { type: "array", pos: studPos([-164, 164]), item: studItem(190) } },
      { id: "dowels", ref: "7", name: "Dowel pins (cylinder base)", mat: "steel", small: true, stage: 1, A: [0, 0, 0], E: [0, 222, 0], dir: [0, -1, 0], count: 2,
        geom: { type: "pair", at: DOWELS.map(([x, z]) => [x, -7, z]), item: { type: "ring", ro: 7, ri: 5.2, h: 14 } } },
      { id: "orings6", ref: "6", name: "O-rings (dowel pins)", mat: "rubber", small: true, stage: 2, A: [0, 0, 0], E: [0, 244, 0], dir: [0, -1, 0], count: 2,
        geom: { type: "pair", at: DOWELS.map(([x, z]) => [x, 1.6, z]), item: { type: "torus", R: 8.6, r: 1.52 } } },
      { id: "gasket", ref: "4", name: "Cylinder base gasket", mat: "dark", small: true, stage: 3, A: [0, 0, 0], E: [0, 262, 0], dir: [0, -1, 0],
        geom: rect(-180, 180, -54, 54, -1, 1, [...CX.map(x => [x, 0, 37]), [0, 0, 12],
          ...STUD_X.flatMap(x => STUD_Z.map(z => [x, z, isDowel(x, z) ? 10.5 : 6]))], 0, 4) },
      { id: "orings5", ref: "5", name: "O-rings (cylinder sleeves)", mat: "rubber", small: true, parent: "block", stage: 4, A: [0, 0, 0], E: [0, 296, 0], dir: [0, 1, 0], count: 4,
        geom: { type: "array", pos: CX.map(x => [x, -14, 0]), item: { type: "torus", R: 35.6, r: 1 } } },
      { id: "block", shell: true, ref: "1", name: "Cylinder block", mat: "alu", stage: 5, A: [0, 0, 0], E: [0, 340, 0], dir: [0, -1, 0],
        geom: { type: "group", items: [...half(-1), ...half(1), ...centre, ...sleeves, ...tensioner] } },
    ],
  };
})();
