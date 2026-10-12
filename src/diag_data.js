/* ============ 2D technical diagrams: data (chassis + brakes) ============
   Every diagram is drawn from the kit in diag_draw.js. Names and reference numbers come from the CMSNL
   parts list for the GS750 (B) 1977 USA (E03) unless a part says otherwise. Proportions are drawn, not measured.
   No torque values, clearances or fluid quantities appear anywhere: those come from the factory manual. Suzuki part numbers come from diag_cms.js (CMSNL). */
const CMS = "https://www.cmsnl.com/suzuki-gs750b-1977-b-usa-e03_model16048/partslist/";
const VFSM = "VERIFY IN FACTORY SERVICE MANUAL";
const gT = (t, s) => `<g transform="${t}">${s}</g>`;
const mirX = s => gT("scale(-1,1)", s), mirY = s => gT("scale(1,-1)", s);
/* half-section helpers for parts that turn about the x axis */
const ringSec = (x, w, rIn, rOut, h = "h-steel") => secRect(x, -rOut, w, rOut - rIn, h) + secRect(x, rIn, w, rOut - rIn, h);
function bearingSec(x, w, rIn, rOut) {
  const t = (rOut - rIn) * .27, rm = (rIn + rOut) / 2, br = Math.min(w * .3, (rOut - rIn) * .26);
  return ringSec(x, w, rOut - t, rOut) + ringSec(x, w, rIn, rIn + t) + [-rm, rm].map(y => dCircle(x + w / 2, y, br, "url(#gH-steel)", .9) + dLine(x + w / 2 - br * .5, y - br * .45, x + w / 2 + br * .3, y - br * .55, .6, "rgba(255,255,255,.8)")).join("");
}
function sealSec(x, w, rIn, rOut) { // rubber body with a steel case
  const one = s => `<path d="M${x},${s * rOut} H${x + w} V${s * (rIn + (rOut - rIn) * .35)} L${x + w * .55},${s * rIn} L${x + w * .2},${s * (rIn + (rOut - rIn) * .3)} H${x} Z" fill="url(#h-rubber)" stroke="${DK.ink}" stroke-width="1"/>` + `<path d="M${x + 1.5},${s * (rOut - 1.5)} H${x + w - 1.5} M${x + 1.5},${s * (rOut - 1.5)} V${s * (rIn + (rOut - rIn) * .45)}" fill="none" stroke="#c9ced2" stroke-width="1.6"/>`;
  return one(-1) + one(1);
}
function bellowsH(len, r1, r2, n) {
  const pts = []; for (let i = 0; i <= n; i++) pts.push([i * len / n, i % 2 ? r2 : r1]);
  const top = pts.map(([x, r], i) => `${i ? "L" : "M"}${x.toFixed(1)},${-r}`).join(" "), bot = pts.slice().reverse().map(([x, r]) => `L${x.toFixed(1)},${r}`).join(" ");
  return `<path d="${top} ${bot} Z" fill="url(#gH-rubber)" stroke="${DK.ink}" stroke-width="1.1" stroke-linejoin="round"/>` + pts.filter((_, i) => i % 2).map(([x]) => dLine(x, -r2 + 2, x, r2 - 2, .5, "#5d6165")).join("");
}
const axisLine = (x1, x2, y = 0) => dCenterH(y, x1, x2);
const DIAGRAMS = [];
/* build-up sequence: each step adds parts; later parts stay hidden, the new ones are highlighted */
function seqSteps(d) {
  const shown = []; const all = d.parts.map(p => p.k);
  return d.seq.map(s => { shown.push(...s.add); return { t: s.t, d: s.d, view: "assembled", hl: s.hl || s.add, hide: all.filter(k => !shown.includes(k)) }; });
}

/* ---------------- CH-01 front fork leg ---------------- */
(() => {
  const X = 150, Y = 300; // assembled origin (fork axis horizontal, top of the leg on the left)
  const at = (x, y = 0) => [X + x, Y + y];
  DIAGRAMS.push({
    id: "DG-CH-01", fig: "Fig. CH-01", title: "Front fork leg", system: "Chassis", kinds: ["exploded", "assembled", "step-by-step"],
    vb: [1200, 620], assembly: "One front fork leg (right leg shown). Inner tube, outer tube, damper rod, springs, seal stack and axle holder.",
    source: { label: "CMSNL GS750 (B) 1977 USA, Front fork", url: CMS }, compat: "GS750 (B) 1977 USA (E03). Check other years and variants before using.",
    verify: "names", inv: ["INV-0020"], tasks: ["F-004", "I-001", "J-002"], tools: ["Fork seal driver (size " + VFSM + ")", "Hex bit for the bottom bolt", "Measuring cylinder for fork oil", "Soft-jaw vise"], supplies: ["Fork oil (grade and amount: " + VFSM + ")", "New oil seals", "New bottom-bolt gasket", "New cap O-rings", "Thread locker if the manual calls for it"],
    notes: "Every item and reference number matches the CMSNL front fork page and its picture. Parts are drawn in proportion by eye, not measured.",
    parts: [
      { k: "cap", ref: "14", name: "Inner tube cap", short: "Cap", len: 25, z: 5, e: [60, 95], a: at(0), co: [-6, -48], ca: [-30, -70], part: "INV-0020",
        draw: () => dRect(0, -21, 9, 42, mat("chrome"), 2) + dRect(9, -17, 16, 34, mat("chrome")) + threadH(9, 16, 34, 2.4) + dLine(2, -21, 2, 21, .5, "rgba(255,255,255,.8)") },
      { k: "oring", ref: "15", name: "O-ring (cap)", short: "O-ring", len: 4, z: 6, e: [112, 95], a: at(10), co: [0, -48], ca: [6, 70], verify: "names", note: "Replace on reassembly.",
        draw: () => oringH(4, 36) },
      { k: "uspring", ref: "5", name: "Upper fork spring", short: "Upper spring", len: 40, z: 1, e: [135, 95], a: at(26), co: [0, -48], ca: [-4, -80], part: "INV-0020", note: "Short spring that sits on top of the main spring, under the cap.",
        draw: () => springH(40, 24, 4, 2.6) },
      { k: "swasher", ref: "25", name: "Washer (between the springs)", short: "Spring washer", len: 3, z: 2, e: [192, 95], a: at(67), co: [0, -48], ca: [10, 74],
        draw: () => washerH(3, 28, "steel") },
      { k: "spring", ref: "26", name: "Fork spring", short: "Fork spring", len: 420, z: 1, e: [215, 95], a: at(70), co: [0, -48], ca: [0, -80], part: "INV-0020", note: "Measure free length against the manual's limit: " + VFSM + ".",
        draw: () => springH(420, 26, 27, 3) },
      { k: "dring", ref: "13", name: "Ring (damper rod head)", short: "Damper ring", len: 4, z: 4, e: [655, 95], a: at(502), co: [0, -48], ca: [4, 74], note: "Sits in the groove on the damper rod head. Check it for wear when the fork is apart.",
        draw: () => dRect(0, -16, 4, 32, mat("dark"), 1, .8) },
      { k: "inner", ref: "1", name: "Inner tube", short: "Inner tube", len: 680, z: 3, phantom: 1, e: [60, 230], a: at(8), co: [0, -40], ca: [-120, -80], part: "INV-0020", note: "Check for pitting in the seal area and measure runout on V-blocks: " + VFSM + ".",
        draw: () => tubeH(680, 36, "chrome") + dHidden("M5,-13 H676 M5,13 H676") + dLine(668, -18, 668, 18, .6) + axisLine(-6, 686) },
      { k: "rebound", ref: "7", name: "Rebound spring", short: "Rebound spring", len: 50, z: 2, e: [690, 95], a: at(513), co: [0, -48], ca: [-6, 72],
        draw: () => springH(50, 20, 7, 2) },
      { k: "damper", ref: "4", name: "Cylinder (damper rod)", short: "Damper rod", len: 341, z: 2, e: [800, 230], a: at(495), co: [0, -40], ca: [80, 78], part: "INV-0020", note: "Check the oil holes are clear and the piston ring isn't worn.",
        draw: () => dRect(0, -15, 18, 30, mat("steel"), 2) + dLine(7, -15, 7, 15, .6) + dLine(11, -15, 11, 15, .6) + dRect(18, -9, 323, 18, mat("steel")) + [44, 64, 84].map(x => dCircle(x, 0, 2.4, "#2a2c2e", .5)) + dHidden("M300,-4 H341 M300,4 H341") + dLine(20, -5, 336, -5, .5, "rgba(255,255,255,.75)") },
      { k: "oillock", ref: "6", name: "Oil lock piece", short: "Oil lock piece", len: 16, z: 3, e: [780, 95], a: at(820), co: [0, -48], ca: [-10, -90],
        draw: () => dPath("M0,-13 L16,-9 L16,9 L0,13 Z", mat("steel")) + dHidden("M0,-4 H16 M0,4 H16") },
      { k: "boot", ref: "12", name: "Boot", short: "Boot", len: 76, z: 4, e: [60, 390], a: at(344), co: [0, -50], ca: [-10, -78],
        draw: () => bellowsH(76, 22, 27, 10) },
      { k: "stopper", ref: "9", name: "Oil seal stopper ring", short: "Stopper ring", len: 3, z: 5, e: [175, 390], a: at(424), co: [-10, -52], ca: [-34, 86],
        draw: () => dRect(0, -27, 3, 54, mat("spring"), .5, .8) + `<rect x="-.5" y="-3" width="4" height="6" fill="${DSHEET}"/>` },
      { k: "seal", ref: "8", name: "Oil seal", short: "Oil seal", len: 12, z: 5, e: [210, 390], a: at(428), co: [0, -54], ca: [-4, 96], part: "INV-0043", note: "Always fit new seals. Drive in square with a seal driver.",
        draw: () => dRect(0, -28, 12, 56, mat("rubber"), 2) + dLine(3.5, -26, 3.5, 26, 1.2, "#9aa1a6") + dHidden("M0,-18 H12 M0,18 H12") },
      { k: "spacer", ref: "10", name: "Oil seal spacer", short: "Seal spacer", len: 5, z: 5, e: [250, 390], a: at(440), co: [6, -52], ca: [22, 96],
        draw: () => washerH(5, 54, "steel") },
      { k: "spacer2", ref: "11", name: "Oil seal spacer (second)", short: "Seal spacer", len: 3, z: 5, e: [272, 390], a: at(445), co: [4, -52], ca: [40, 80], note: "The catalogue lists two seal spacers (10 and 11). Check which your fork has when you take it apart.",
        draw: () => washerH(3, 54, "steel") },
      { k: "outer", ref: "2", name: "Outer tube", short: "Outer tube", len: 440, z: 3, phantom: 1, e: [300, 390], a: at(420), co: [0, -48], ca: [60, -95], part: "INV-0020", note: "Check the seal bore, the axle lug and the studs. Look for cracks around the lug.",
        draw: () => dPath("M0,-29 L400,-26 L400,-30 L440,-30 L440,34 L432,34 A12,12 0 0,0 408,34 L400,34 L400,26 L0,29 Z", mat("alu")) + dLine(4, -20, 396, -18, .6, "rgba(255,255,255,.8)") + dHidden("M16,-19 H430 M16,19 H430") + dLine(16, -29, 16, 29, .6) + axisLine(-6, 448) },
      { k: "drain", ref: "22", name: "Drain screw", short: "Drain screw", z: 7, e: [700, 318], a: at(800, -41), anchor: [0, 6], co: [26, -14], ca: [-34, -40], note: "Drain the fork oil here. Use a new gasket when you refit it.",
        draw: () => boltV(9, 5, 8, 4) },
      { k: "dgasket", ref: "23", name: "Gasket (drain screw)", short: "Drain gasket", z: 8, e: [700, 342], a: at(800, -36), anchor: [0, 1], co: [26, 4], ca: [44, -18],
        draw: () => washerV(1.6, 11, "brass") },
      { k: "studs", ref: "24", name: "Studs (axle holder)", short: "Studs", z: 4, e: [600, 432], a: at(840, 34), anchor: [24, 17], co: [60, -6], ca: [56, -52], note: "Screwed into the outer tube. Check the threads before refitting the holder.",
        draw: () => [-24, 24].map(x => gT(`translate(${x},0)`, dRect(-2, 0, 4, 34, mat("steel", true)) + threadV(14, 18, 4, 2.2))).join("") },
      { k: "gasket", ref: "17", name: "Gasket (bottom bolt)", short: "Gasket", len: 3, z: 6, e: [775, 390], a: at(860), co: [0, -50], ca: [8, -74], note: "Use a new gasket.",
        draw: () => washerH(3, 18, "brass") },
      { k: "bolt", ref: "16", name: "Bolt (damper rod)", short: "Bottom bolt", len: 0, z: 6, e: [860, 390], a: at(875), anchor: [-6, 0], co: [0, -50], ca: [30, -60], note: "Holds the damper rod. Thread locker and torque: " + VFSM + ".",
        draw: () => mirX(boltH(12, 22, 34, 12)) },
      { k: "holder", ref: "18", name: "Axle holder", short: "Axle holder", z: 5, e: [600, 500], a: at(840, 34), anchor: [0, 12], co: [-70, 0], ca: [-60, 40], note: "Clamps the front axle in the lug. Tighten order and torque: " + VFSM + ".",
        draw: () => dPath("M-32,0 L-13,0 A13,13 0 0,0 13,0 L32,0 L32,12 Q32,22 22,22 L-22,22 Q-32,22 -32,12 Z", mat("alu")) + dHidden("M-26,0 V22 M-22,0 V22 M22,0 V22 M26,0 V22") },
      { k: "washers", ref: "19", name: "Washers (axle holder)", short: "Washers", z: 6, e: [600, 540], a: at(840, 56), anchor: [24, 1], co: [60, 0], ca: [90, -14],
        draw: () => washerV(2, 12, "zinc").replace(/x="(-?[\d.]+)"/, (m, v) => `x="${+v - 24}"`) + washerV(2, 12, "zinc").replace(/x="(-?[\d.]+)"/, (m, v) => `x="${+v + 24}"`) },
      { k: "lockw", ref: "20", name: "Lock washers (axle holder)", short: "Lock washers", z: 6, e: [600, 556], a: at(840, 58), anchor: [24, 1], co: [60, 6], ca: [90, 12],
        draw: () => [-24, 24].map(x => dRect(x - 6, 0, 12, 2.5, mat("spring", true), .5, .7)).join("") },
      { k: "nuts", ref: "21", name: "Nuts (axle holder)", short: "Nuts", z: 6, e: [600, 572], a: at(840, 61), anchor: [24, 5], co: [60, 14], ca: [90, 36],
        draw: () => [-24, 24].map(x => gT(`translate(${x},0)`, hexV(14, 10, "zinc"))).join("") },
    ],
    assembledExtra: () => dCenterH(Y, X - 30, X + 900),
    seq: [
      { t: "Rebound spring onto the damper rod", add: ["rebound", "damper", "dring"], d: "Slide the rebound spring onto the damper rod (the parts list calls it the cylinder) so it sits under the piston head." },
      { t: "Damper rod into the inner tube", add: ["inner", "oillock"], d: "Drop the damper rod into the inner tube until it comes out of the bottom. Fit the oil lock piece over the end of the rod." },
      { t: "Inner tube into the outer tube", add: ["outer", "studs", "drain", "dgasket"], d: "Slide the inner tube with the damper rod into the outer tube." },
      { t: "Bottom bolt", add: ["gasket", "bolt"], d: `Fit the bottom bolt with a new gasket through the outer tube into the damper rod. Thread locker and torque: ${VFSM}.` },
      { t: "Seal stack", add: ["spacer2", "spacer", "seal", "stopper"], d: "Fit the seal spacer, drive in a new oil seal square to the bore, then fit the stopper ring in its groove." },
      { t: "Boot", add: ["boot"], d: "Fit the boot over the top of the outer tube." },
      { t: "Fork oil", add: [], hl: ["inner", "outer"], d: `Fill with fork oil. Grade, amount and level: ${VFSM}. Pump the leg to bleed air before setting the level.` },
      { t: "Springs and cap", add: ["spring", "swasher", "uspring", "oring", "cap"], d: "Fit the main fork spring, the washer, then the short upper spring. Fit the cap with a new O-ring. Check which end of each spring goes up in the manual." },
      { t: "Axle holder (when the wheel goes in)", add: ["holder", "washers", "lockw", "nuts"], d: `With the axle in place, fit the axle holder, washers, lock washers and nuts. Tightening order and torque: ${VFSM}.` },
    ],
    seqNote: "Order follows the stacking on the parts diagram and the usual build for a damper-rod fork. Check it against the service manual before you rely on it.",
  });
})();

/* ---------------- BR-01 front brake caliper ---------------- */
(() => {
  const X = 330, Y = 250;
  const at = (x, y = 0) => [X + x, Y + y];
  const body = () => {
    const h = "h-alu";
    return secRect(0, -45, 20, 90, h) + secRect(20, -45, 52, 15, h) + secRect(20, 30, 52, 15, h) + secRect(20, -70, 130, 25, h) + secRect(113, -45, 37, 80, h)
      + secRect(0, 45, 20, 30, h) + secRect(120, 35, 30, 40, h) + dLine(52, -33, 58, -33, .8) + dLine(52, 33, 58, 33, .8)
      + dHidden("M10,-45 V-30");
  };
  const pad = flip => { const pl = dRect(0, -32, 4, 64, mat("steel"), .5), fr = dRect(4, -30, 9, 60, "url(#h-friction)", 1); return flip ? mirX(gT("translate(-13,0)", pl + fr)) : pl + fr; };
  DIAGRAMS.push({
    id: "DG-BR-01", fig: "Fig. BR-01", title: "Front brake caliper", system: "Brakes", kinds: ["exploded", "assembled", "cross-section", "step-by-step"],
    vb: [1000, 580], assembly: "Front caliper in section through the piston: body, piston, seal, boot, pads, caliper axles, holder, bleeder.",
    source: { label: "CMSNL GS750 (B) 1977 USA, Front caliper", url: CMS }, compat: "GS750 (B) 1977 USA (E03).", verify: "schematic",
    inv: ["INV-0029", "INV-0026"], tasks: ["F-010", "I-003", "J-003"], tools: ["Bleeder wrench", "Clear bleed hose and bottle", "Brass or plastic pick (for the seal groove)", "Low-pressure air (piston removal, with care)"], supplies: ["Brake fluid (type on the reservoir cap)", "Caliper seal and boot kit", "Brake cleaner", "Rubber grease for seals"],
    notes: "Names come from the parts diagram. The drawing is a schematic section: the body shape, pad shape and the routing of the caliper axles are simplified and not measured. Ref 2 is listed by part number only; it's drawn here as the pad set, which you should check against the parts diagram.",
    parts: [
      { k: "body", ref: "0", name: "Caliper body", short: "Caliper body", z: 1, e: [70, 230], a: at(0), anchor: [140, -60], caAt: [560, 140], co: [30, -50], ca: [90, -60], part: "INV-0029", note: "Check the bore for pitting and corrosion. A pitted bore usually means a new caliper.",
        draw: body },
      { k: "seal", ref: "5", name: "Piston seal", short: "Seal", z: 3, e: [300, 230], a: at(52), anchor: [3, -30], caAt: [220, 190], co: [0, -60], ca: [-50, -110], part: "INV-0043", note: "Always replace. Clean the groove without scratching it.",
        draw: () => secRect(0, -33, 6, 5, "h-rubber", .8) + secRect(0, 28, 6, 5, "h-rubber", .8) },
      { k: "piston", ref: "1", name: "Piston", short: "Piston", len: 50, z: 2, e: [350, 230], a: at(24), caAt: [220, 240], co: [0, -66], ca: [-40, 110], part: "INV-0029", note: "Replace if the surface is scored, pitted or the plating is lifting.",
        draw: () => dRect(0, -28, 50, 56, mat("chrome"), 2) + dHidden("M8,-20 H50 M8,20 H50 M8,-20 V20") + dLine(3, -20, 47, -20, .5, "rgba(255,255,255,.85)") },
      { k: "boot", ref: "6", name: "Piston boot", short: "Boot", z: 4, e: [440, 230], a: at(70), anchor: [4, -36], caAt: [560, 180], co: [0, -30], ca: [-10, -100], part: "INV-0043",
        draw: () => secRect(0, -37, 8, 8, "h-rubber", .8) + secRect(0, 29, 8, 8, "h-rubber", .8) },
      { k: "padI", ref: "2", name: "Brake pad (piston side)", short: "Pad", len: 13, z: 3, e: [510, 230], a: at(75), caAt: [560, 220], co: [0, -66], ca: [-4, 110], verify: "unverified", note: "Ref 2 is listed by part number only. Check it is the pad set before ordering.",
        draw: () => pad(false) },
      { k: "padO", ref: "2", name: "Brake pad (outer)", short: "Pad", len: 13, z: 3, e: [560, 230], a: at(100), caAt: [560, 260], co: [0, -66], ca: [30, 110], verify: "unverified",
        draw: () => pad(true) },
      { k: "bleeder", ref: "13", name: "Bleeder", short: "Bleeder", z: 5, e: [600, 110], a: at(10, -45), anchor: [0, -18], caAt: [220, 140], co: [40, 0], ca: [-60, -30],
        draw: () => dRect(-4, -14, 8, 14, mat("zinc", true)) + threadV(-14, 14, 8, 2.2) + hexV(14, 10, "zinc", -24) + dRect(-3, -36, 6, 12, mat("zinc", true)) + dHidden("M0,-36 V0") },
      { k: "cap", ref: "14", name: "Bleeder cap", short: "Cap", z: 6, e: [600, 60], a: at(10, -82), anchor: [0, -6], caAt: [220, 110], co: [40, 0], ca: [-60, -10],
        draw: () => dRect(-5, -10, 10, 12, mat("rubber", true), 3) },
      { k: "axle", ref: "10, 11", name: "Caliper axles", short: "Axles", len: 150, z: 2, e: [80, 450], a: at(-12, 62), caAt: [220, 310], co: [0, 40], ca: [-40, 60], note: "The caliper slides on these. They must be clean, straight and lightly greased with the grease the manual specifies.",
        draw: () => hexH(10, 18, "zinc") + dRect(10, -6, 140, 12, mat("chrome")) + threadH(130, 20, 12, 2.4) },
      { k: "dust", ref: "4", name: "Axle dust covers", short: "Dust covers", z: 3, e: [290, 450], a: at(22, 62), anchor: [4, 0], caAt: [220, 350], co: [0, 40], ca: [-20, 50], part: "INV-0043",
        draw: () => [0, 92].map(x => dRect(x, -10, 8, 20, mat("rubber"), 3)).join("") },
      { k: "orings", ref: "3", name: "O-rings", short: "O-rings", z: 3, e: [440, 450], a: at(120, 62), anchor: [2, 0], caAt: [560, 320], co: [0, 40], ca: [30, 54], verify: "unverified", note: "Listed in the diagram. The exact fitting position wasn't confirmed: check the parts diagram.",
        draw: () => oringH(4, 18) },
      { k: "holder", ref: "7", name: "Caliper holder", short: "Holder", len: 170, z: 0, e: [600, 400], a: at(-15, 40), anchor: [85, 50], caAt: [560, 360], co: [0, 40], ca: [40, 56], part: "INV-0029",
        draw: () => dPath("M0,12 Q0,8 4,8 H166 Q170,8 170,12 V50 Q170,58 162,58 H8 Q0,58 0,50 Z", mat("dark")) + dCircle(13, 22, 12, mat("dark")) + dCircle(157, 22, 12, mat("dark")) + dHidden("M1,16 H169 M1,28 H169") },
      { k: "bolts", ref: "15", name: "Holder mounting bolts", short: "Bolts", z: 6, e: [660, 530], a: at(35, 118), anchor: [0, -6], caAt: [220, 400], co: [-40, 20], ca: [-40, 30], note: "Torque: " + VFSM + ".",
        draw: () => [0, 70].map(x => gT(`translate(${x},0) scale(1,-1)`, boltV(16, 9, 26, 9))).join("") },
      { k: "washers", ref: "16, 17", name: "Washers and lock washers", short: "Washers", z: 6, e: [660, 468], a: at(35, 98), anchor: [0, 0], caAt: [220, 375], co: [-40, -10], ca: [-40, 8],
        draw: () => [0, 70].map(x => washerV(2.5, 16, "zinc", 0).replace(/x="(-?[\d.]+)"/, (m, v) => `x="${+v + x}"`) + dRect(x - 7, 3, 14, 2.5, mat("spring", true), .5, .7)).join("") },
    ],
    assembledExtra: () => `<g opacity=".5">${dRect(X + 88, Y - 110, 12, 220, "url(#gH-steel)", 0, .8)}</g>` + dNote(X + 94, Y - 116, "disc (reference)", "middle", 10) + dCenterH(Y, X - 30, X + 180),
    explodedExtra: () => dCenterH(230, 50, 600) + dCenterH(450, 60, 470),
    steps: [
      { t: "Pads out", hl: ["padI", "padO"], view: "assembled", d: "With the caliper off the disc, take out both pads. Note which way round they go." },
      { t: "Piston out", hl: ["piston"], view: "assembled", d: "Push the piston out with low-pressure air through the hose port, with a rag in the jaws to catch it. Keep fingers clear." },
      { t: "Boot and seal out", hl: ["boot", "seal"], view: "exploded", d: "Remove the boot, then pick the seal out of its groove with a plastic or brass pick. Don't scratch the bore." },
      { t: "Clean and inspect", hl: ["body", "piston", "axle"], view: "exploded", d: "Clean everything with brake cleaner or fresh brake fluid. Check the bore and piston for pitting, and the axles for wear. Record it in Measurements." },
      { t: "New seal, boot and piston", hl: ["seal", "boot", "piston"], view: "assembled", d: "Fit a new seal and boot. Lubricate with fresh brake fluid or the grease the manual specifies and press the piston in square." },
      { t: "Pads, bleeder and axles", hl: ["padI", "padO", "bleeder", "axle"], view: "assembled", d: `Refit the pads, bleeder and cap, and the axles with their dust covers. Bolt torques: ${VFSM}. Bleed the brake once it's on the bike.` },
    ],
    seqNote: "General single-piston caliper rebuild order. Check it against the service manual.",
  });
})();

/* ---------------- CH-02 front wheel: axle, bearings, spacers and seals ---------------- */
(() => {
  const X = 220, Y = 320;
  const at = (x, y = 0) => [X + x, Y + y];
  const hub = () => {
    const top = "M0,-26 L0,-48 L28,-48 L28,-72 L42,-72 L42,-46 L218,-46 L218,-72 L232,-72 L232,-60 L260,-60 L260,-26 L232,-26 L232,-20 L28,-20 L28,-26 Z";
    return secPath(top, "h-alu") + mirY(secPath(top, "h-alu")) + [35, 225].map(x => `<circle cx="${x}" cy="-64" r="2.6" fill="${DSHEET}" stroke="${DK.ink}" stroke-width=".7"/><circle cx="${x}" cy="64" r="2.6" fill="${DSHEET}" stroke="${DK.ink}" stroke-width=".7"/>`).join("") + axisLine(-8, 268);
  };
  DIAGRAMS.push({
    id: "DG-CH-02", fig: "Fig. CH-02", title: "Front wheel: axle, bearings, spacers and seals", system: "Chassis", kinds: ["exploded", "assembled", "cross-section", "step-by-step"],
    vb: [1100, 640], assembly: "Front hub in half section along the axle: the order of every bearing, spacer, seal and cover on the axle.",
    source: { label: "CMSNL GS750 (B) 1977 USA, Front wheel", url: CMS }, compat: "GS750 (B) 1977 USA (E03).", verify: "names",
    inv: ["INV-0022", "INV-0024", "INV-0026"], tasks: ["F-006", "F-007", "I-002", "J-003"], tools: ["Bearing drift or blind-bearing puller", "Bearing driver set", "Heat gun (hub, gently)", "Dial indicator for runout"], supplies: ["New wheel bearings (size from the old ones or the parts list)", "New dust seals", "Bearing grease", "New cotter pin"],
    notes: "Names and refs come from the parts diagram. The hub section is simplified, sizes aren't measured, and only one disc is drawn. Check which side the disc and the speedometer gearbox sit on your hub. Ref 8 (spacer 15×22×30) and ref 9 (washer) are listed but their exact positions weren't confirmed, so ref 8 isn't drawn and ref 9 is drawn at the axle nut.",
    parts: [
      { k: "axle", ref: "4", name: "Front axle", short: "Axle", len: 500, z: 1, e: [60, 80], a: at(0), co: [0, -40], ca: [-150, -170], part: "INV-0024", note: "Roll it on a flat surface or check on V-blocks for bend: " + VFSM + ".",
        draw: () => dRect(0, -17, 10, 34, mat("steel"), 1.5) + tubeH(490, 24, "steel", 10) + threadH(470, 30, 24, 2.6) + dCircle(486, 0, 2, DSHEET, .6) },
      { k: "gear", ref: "12", name: "Speedometer gearbox", short: "Speedo gearbox", len: 60, z: 3, e: [40, 330], a: at(70), co: [0, -70], ca: [-60, -120], note: "Check the drive tangs engage the hub and the gears turn freely.",
        draw: () => ringSec(0, 60, 22, 42, "h-alu") + ringSec(6, 48, 12, 18, "h-steel") + [12, 22, 32, 42].map(x => dLine(x, -22, x + 4, -18, .6) + dLine(x, 22, x + 4, 18, .6)).join("") },
      { k: "gseal", ref: "11-2", name: "Dust seal (speedometer gearbox)", short: "Dust seal", len: 7, z: 4, e: [125, 330], a: at(132), co: [0, -60], ca: [-30, -150], part: "INV-0024",
        draw: () => sealSec(0, 7, 18, 28) },
      { k: "brgL", ref: "2", name: "Wheel bearing (speedometer side)", short: "Bearing", len: 24, z: 4, e: [160, 330], a: at(144), co: [0, -60], ca: [-10, -150], part: "INV-0024", note: "Replace in pairs. Note which way any sealed face points before you remove them.",
        draw: () => bearingSec(0, 24, 12, 26) },
      { k: "hub", ref: "1", name: "Hub", short: "Hub", len: 260, z: 2, e: [220, 330], a: at(140), anchor: [130, -46], co: [0, -60], ca: [20, -150], part: "INV-0022",
        draw: hub },
      { k: "spacer", ref: "3", name: "Hub bearing spacer", short: "Hub spacer", len: 204, z: 3, e: [230, 560], a: at(168), co: [0, 36], ca: [0, 120], part: "INV-0024", note: "Sits between the two bearings so the axle nut doesn't crush them. Don't leave it out.",
        draw: () => ringSec(0, 204, 12, 17, "h-steel") },
      { k: "brgR", ref: "2", name: "Wheel bearing (disc side)", short: "Bearing", len: 24, z: 4, e: [520, 330], a: at(372), co: [0, -60], ca: [-20, 150], part: "INV-0024",
        draw: () => bearingSec(0, 24, 12, 26) },
      { k: "seal", ref: "11-1", name: "Dust seal", short: "Dust seal", len: 8, z: 4, e: [575, 330], a: at(394), co: [0, -60], ca: [0, 150], part: "INV-0024",
        draw: () => sealSec(0, 8, 18, 30) },
      { k: "cover", ref: "10", name: "Hub cover (right)", short: "Hub cover", len: 20, z: 4, e: [610, 330], a: at(400), co: [0, -60], ca: [20, 150],
        draw: () => ringSec(0, 6, 14, 34) + ringSec(6, 14, 28, 34) },
      { k: "rspacer", ref: "7", name: "Right axle spacer", short: "Axle spacer", len: 40, z: 4, e: [660, 330], a: at(420), co: [0, -60], ca: [40, 150],
        draw: () => ringSec(0, 40, 12, 18) },
      { k: "washer", ref: "9", name: "Washer", short: "Washer", len: 4, z: 5, e: [730, 330], a: at(460), co: [0, -60], ca: [40, -120], verify: "unverified", note: "Position not confirmed from the list.",
        draw: () => ringSec(0, 4, 12, 22) },
      { k: "nut", ref: "5", name: "Axle nut", short: "Axle nut", len: 16, z: 5, e: [765, 330], a: at(464), co: [0, -60], ca: [50, -90], note: "Torque: " + VFSM + ". Line up the cotter pin hole by tightening, never by backing off.",
        draw: () => hexH(16, 34, "zinc") + dHidden("M0,-12 H16 M0,12 H16") },
      { k: "cotter", ref: "6", name: "Cotter pin", short: "Cotter pin", z: 6, e: [820, 330], a: at(486), anchor: [0, -20], co: [0, -40], ca: [40, -50], note: "Always fit a new one.",
        draw: () => dRect(-1.6, -22, 3.2, 44, mat("zinc", true), 1.2, .7) + dCircle(0, -25, 4, "none", .9) + dLine(0, 22, 3, 30, 1.1, DK.ink) },
      { k: "disc", ref: "13", name: "Brake disc", short: "Disc", len: 7, z: 3, e: [900, 330], a: at(400), anchor: [3.5, -130], co: [30, -20], ca: [40, -40], part: "INV-0026", note: "One disc drawn. Check how many your bike has and which side.",
        draw: () => ringSec(0, 7, 38, 150, "h-steel") + dHidden("M0,-50 H7 M0,50 H7") },
      { k: "shim", ref: "16", name: "Disc shim", short: "Shim", len: 2, z: 4, e: [880, 330], a: at(407), anchor: [1, -50], co: [-30, -110], ca: [-20, -200], verify: "unverified", note: "Listed in the diagram. Exact position not confirmed: check the parts diagram.",
        draw: () => ringSec(0, 2, 44, 56, "h-brass") },
      { k: "dbolts", ref: "14", name: "Disc bolts", short: "Disc bolts", z: 5, e: [970, 330], a: at(417), anchor: [-4, -50], co: [40, -40], ca: [60, -60], note: "Thread locker and torque: " + VFSM + ".",
        draw: () => [-50, 50].map(y => gT(`translate(0,${y})`, mirX(boltH(8, 14, 22, 8)))).join("") },
    ],
    assembledExtra: () => dCenterH(Y, X - 30, X + 520) + dNote(X + 70, Y + 70, "speedometer side", "middle", 10) + dNote(X + 420, Y + 175, "disc side", "middle", 10),
    explodedExtra: () => dCenterH(330, 30, 850),
    seq: [
      { t: "First bearing", add: ["hub", "brgL"], d: "Drive the first bearing into the hub square, pressing on the outer race only, until it seats." },
      { t: "Hub spacer", add: ["spacer"], d: "Drop the hub bearing spacer in from the other side." },
      { t: "Second bearing", add: ["brgR"], d: "Drive the second bearing in on the outer race until it seats. The spacer should be trapped but the bearings must turn freely." },
      { t: "Seals and cover", add: ["seal", "cover", "gseal"], d: "Fit new dust seals and the hub cover." },
      { t: "Disc", add: ["disc", "shim", "dbolts"], d: `Bolt the disc on. Thread locker and torque: ${VFSM}.` },
      { t: "Axle stack", add: ["gear", "axle", "rspacer"], d: "Fit the speedometer gearbox (tangs engaged), slide the axle through, and fit the right axle spacer." },
      { t: "Nut and cotter pin", add: ["washer", "nut", "cotter"], d: `Fit the washer and nut. Torque: ${VFSM}. Fit a new cotter pin and bend the legs over.` },
    ],
    seqNote: "General order for a hub with a centre spacer. Check bearing direction and the manual's order before you start.",
  });
})();

/* ---------------- BR-02 brake disc inspection reference ---------------- */
(() => {
  const C = [280, 290], R = 200, EX = 780;
  const ptsXY = Array.from({ length: 6 }, (_, i) => { const a = (i * 60 - 90) * Math.PI / 180; return [Math.cos(a) * 150, Math.sin(a) * 150]; });
  const arc = (r, a0, a1) => { const p = a => [Math.cos(a * Math.PI / 180) * r, Math.sin(a * Math.PI / 180) * r], [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0},1 ${x1.toFixed(1)},${y1.toFixed(1)}`; };
  DIAGRAMS.push({
    id: "DG-BR-02", fig: "Fig. BR-02", title: "Brake disc: where to measure and what to look for", system: "Brakes", kinds: ["inspection", "step-by-step"],
    vb: [1100, 580], assembly: "Inspection reference for a front or rear disc: thickness points, runout check and wear to look for.",
    source: { label: "General disc-brake inspection practice (limits from the factory manual)", url: CMS }, compat: "Any GS750 disc. Limits differ front and rear.", verify: "schematic",
    inv: ["INV-0026", "INV-0027"], tasks: ["F-009", "M-001"], tools: ["Outside micrometer", "Dial indicator with magnetic base", "Straight edge"], supplies: ["Brake cleaner", "Lint-free rags"],
    notes: "This is a reference for where and how to check, not a drawing of the GS750 disc. Mounting holes aren't drawn because the count wasn't verified. Minimum thickness and maximum runout: " + VFSM + ". Some discs also have a minimum thickness stamped on them.",
    parts: [
      { k: "disc", name: "Brake disc (face view)", short: "Disc", z: 0, e: C, anchor: [0, -R], co: [-120, -6], part: "INV-0026",
        draw: () => `<circle r="${R}" fill="url(#gH-steel)" stroke="${DK.ink}" stroke-width="1.2"/><circle r="105" fill="url(#gH-dark)" stroke="${DK.ink}" stroke-width="1"/><circle r="60" fill="${DSHEET}" stroke="${DK.ink}" stroke-width="1"/>` + `<circle r="${(R + 105) / 2}" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="${R - 110}" opacity=".25"/>` + dCenterH(0, -R - 14, R + 14) + dCenterV(0, -R - 14, R + 14) },
      { k: "points", name: "Thickness measuring points", short: "Measure here", z: 3, e: C, anchor: [ptsXY[1][0], ptsXY[1][1]], co: [90, -40], note: "Measure at several points around the pad track, in the middle of the swept area. Use the smallest reading.",
        draw: () => ptsXY.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="#fff" stroke="#2b6f9a" stroke-width="1.6"/>` + dLine(x - 11, y, x + 11, y, .9, "#2b6f9a") + dLine(x, y - 11, x, y + 11, .9, "#2b6f9a") + dNote(x + (x >= 0 ? 12 : -12), y - 9, "T" + (i + 1), x >= 0 ? "start" : "end", 10)).join("") },
      { k: "scoring", name: "Look for: grooves and scoring", short: "Grooves", z: 2, e: C, anchor: [-140, 60], co: [-60, 120], note: "Deep grooves you can catch a fingernail in point to worn-out pads or grit. Measure in the grooves.",
        draw: () => [120, 128, 141, 152, 166, 178].map((r, i) => `<path d="${arc(r, 120 + i * 4, 205 - i * 3)}" fill="none" stroke="#5b6168" stroke-width="${i % 2 ? .7 : 1.2}"/>`).join("") },
      { k: "cracks", name: "Look for: heat cracks", short: "Cracks", z: 2, e: C, anchor: [130, 100], co: [120, 60], note: "Any crack means a new disc. Look closely at the edges and around any holes.",
        draw: () => [[110, 110], [128, 96], [100, 128]].map(([x, y]) => `<path d="M${x},${y} l6,-5 l-2,-6 l7,-4" fill="none" stroke="#b03a2e" stroke-width="1.3"/>`).join("") },
      { k: "lip", name: "Look for: lip at the outer edge", short: "Edge lip", z: 2, e: C, anchor: [-R + 3, -40], co: [-40, -150], note: "A raised lip or rust ridge at the outer edge means wear on the swept face. Measure inside the lip, not on it.",
        draw: () => `<path d="${arc(R - 4, 160, 260)}" fill="none" stroke="#8a5a2b" stroke-width="5" opacity=".75"/>` },
      { k: "edge", name: "Disc edge (side view)", short: "Disc edge", z: 1, e: [EX, C[1]], anchor: [5, -R], co: [-30, -30],
        draw: () => dRect(0, -R, 10, 2 * R, "url(#gV-steel)", 0, 1.1) + dRect(-6, -60, 22, 120, "url(#gV-dark)", 0, 1) + dCenterH(0, -40, 50) },
      { k: "mic", name: "Micrometer (thickness)", short: "Micrometer", z: 4, e: [EX, C[1] - 150], anchor: [20, -86], co: [-40, -30], note: "Reach in from the outer edge, square to the disc face, anvil and spindle on the pad track. Read to the manual's limit: " + VFSM + ".",
        draw: () => dPath("M-20,6 V-70 Q-20,-88 -2,-88 H34 Q52,-88 52,-70 V-8 H40 V-70 Q40,-76 34,-76 H-2 Q-8,-76 -8,-70 V6 Z", mat("dark")) + dRect(-8, -3, 8, 6, mat("chrome"), 1) + dRect(10, -3, 30, 6, mat("chrome"), 1) + dRect(40, -9, 64, 18, mat("chrome"), 2) + Array.from({ length: 8 }, (_, i) => dLine(46 + i * 7, -9, 46 + i * 7, 9, .5)).join("") + dRect(104, -11, 26, 22, mat("chrome"), 3) + Array.from({ length: 5 }, (_, i) => dLine(108 + i * 5, -11, 108 + i * 5, 11, .5)).join("") },
      { k: "dial", name: "Dial indicator (runout)", short: "Dial indicator", z: 4, e: [EX + 70, C[1] + 165], anchor: [22, -24], co: [40, -50], note: "Wheel on the bike, axle tight. Touch the plunger on the face near the outer edge and turn the wheel slowly. Max runout: " + VFSM + ".",
        draw: () => dRect(-60, -2, 48, 4, mat("chrome"), 1) + dRect(-14, -5, 12, 10, mat("chrome"), 1) + `<circle cx="22" cy="0" r="24" fill="#fff" stroke="${DK.ink}" stroke-width="1.4"/><circle cx="22" cy="0" r="20" fill="none" stroke="${DK.fine}" stroke-width=".6"/>` + Array.from({ length: 20 }, (_, i) => { const a = i * 18 * Math.PI / 180; return dLine(22 + Math.cos(a) * 17, Math.sin(a) * 17, 22 + Math.cos(a) * 20, Math.sin(a) * 20, .6); }).join("") + dLine(22, 0, 34, -10, 1.2, "#b03a2e") + dRect(14, 24, 16, 40, mat("dark", true), 2) + dRect(0, 64, 44, 22, mat("dark"), 2) },
    ],
    explodedExtra: () => dNote(C[0], 36, "Face view", "middle", 12) + dNote(EX, 36, "Edge view", "middle", 12) + `<path d="M${EX - 40},${C[1] + 90} a40,40 0 0,0 0,60" fill="none" stroke="${DK.fine}" stroke-width=".9" marker-end="url(#m-arrow)"/>` + dNote(EX - 50, C[1] + 125, "turn the wheel slowly", "end", 10),
    steps: [
      { t: "Clean and look", hl: ["disc", "scoring", "cracks", "lip"], d: "Clean both faces with brake cleaner. Look for cracks, deep grooves, a lip at the outer edge, rust pitting and any blue heat marks." },
      { t: "Measure thickness", hl: ["points", "mic", "edge"], d: `Measure at each point around the pad track with a micrometer. Write down the smallest reading. Minimum thickness: ${VFSM}.` },
      { t: "Measure runout", hl: ["dial", "edge"], d: `With the wheel on the bike and the axle tight, set the dial indicator on the face near the outer edge and turn the wheel slowly. Maximum runout: ${VFSM}.` },
      { t: "Record it", hl: ["disc"], d: "Enter the readings in Measurements against the disc. A reading inside the limit still needs someone to approve it." },
    ],
  });
})();
