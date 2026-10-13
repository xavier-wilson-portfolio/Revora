/* ============ 2D technical diagrams: data (engine, carburetors, electrical) ============ */
const dpT = (svg, k, t) => { const g = svg.querySelector(`.dp[data-k="${k}"]`); if (g) g.setAttribute("transform", t); };
const ringPath = (r1, r2, cx = 0, cy = 0) => `M${cx + r1},${cy} A${r1},${r1} 0 1,0 ${cx - r1},${cy} A${r1},${r1} 0 1,0 ${cx + r1},${cy} Z M${cx + r2},${cy} A${r2},${r2} 0 1,1 ${cx - r2},${cy} A${r2},${r2} 0 1,1 ${cx + r2},${cy} Z`;
const ringShape = (r1, r2, fill, cx = 0, cy = 0, sw = 1.1) => `<path d="${ringPath(r1, r2, cx, cy)}" fill="${fill}" fill-rule="evenodd" stroke="${DK.ink}" stroke-width="${sw}"/>`;

/* ---------------- EN-01 valve train cross-section with cam animation ---------------- */
(() => {
  const CX = 450, CY = 109, RB = 38, H = 16, GAP = 3;
  const prof = Array.from({ length: 120 }, (_, i) => { const f = i * 3, d = Math.min(f, 360 - f), r = RB + (d < 70 ? H * Math.pow(Math.cos(d / 70 * Math.PI / 2), 2) : 0), a = f * Math.PI / 180; return [r * Math.sin(a), -r * Math.cos(a)]; });
  const lift = th => { const a = th * Math.PI / 180, s = Math.sin(a), c = Math.cos(a); let m = -1e9; prof.forEach(([x, y]) => { const yy = x * s + y * c; if (yy > m) m = yy; }); return Math.max(0, m - RB); };
  const BASE = { shim: 150, tappet: 152, retainer: 166, cotters: 163, valve: 161 };
  DIAGRAMS.push({
    id: "DG-EN-01", fig: "Fig. EN-01", title: "Camshaft and valve train (one valve)", system: "Engine", kinds: ["cross-section", "animation", "inspection"],
    vb: [900, 580], assembly: "Section through one intake valve: cam lobe, shim, tappet, cotters, retainer, springs, seat, stem seal, guide and valve in the head.",
    source: { label: "CMSNL GS750 (B) 1977 USA, Camshaft-valve and Cylinder head", url: CMS }, compat: "GS750 (B) 1977 USA (E03). The exhaust side uses the same layout.", verify: "schematic",
    inv: ["INV-0006", "INV-0002"], tasks: ["E-005", "E-018", "E-019"], tools: ["Feeler gauges", "Tappet tool (to hold the tappet down for shim changes)", "Valve spring compressor", "Micrometer (for shims)"], supplies: ["Assembly lube", "Shims as needed (thickness from measurement)", "New valve stem seals"],
    notes: "Schematic section. Shapes and the cam lift are drawn, not measured. The gap between the cam and the shim is the valve clearance: the animation shows the cam taking it up before the valve opens. The clearance value and how to measure it: " + VFSM + ". The cotter name is general; check it against the parts diagram.",
    parts: [
      { k: "cam", ref: "", name: "Camshaft (intake), lobe end view", short: "Cam lobe", z: 9, e: [CX, CY], anchor: [36, -16], co: [190, -20], part: "INV-0006", note: "Check the lobes for pitting and wear and the journals for scoring: " + VFSM + ".",
        draw: () => `<path d="M${prof.map(p => p.map(v => v.toFixed(1)).join(",")).join(" L")} Z" fill="url(#gH-steel)" stroke="${DK.ink}" stroke-width="1.2"/>` + `<circle r="17" fill="url(#h-steel)" stroke="${DK.ink}" stroke-width="1"/>` + dLine(0, -RB - H + 4, 0, -RB - H + 12, 1.4, "#b03a2e") + dCenterH(0, -60, 60) + dCenterV(0, -60, 60) },
      { k: "gauge", name: "Feeler gauge (valve clearance)", short: "Feeler gauge", z: 10, e: [CX, 148.5], anchor: [-110, 0], co: [-40, -46], note: "Measure with the lobe pointing away from the tappet (base circle on the shim). Clearance: " + VFSM + ".",
        draw: () => dRect(-150, -1, 140, 2, mat("chrome"), 0, .6) + dRect(-186, -7, 40, 14, mat("dark"), 3) },
      { k: "shim", ref: "", name: "Tappet shim", short: "Shim", z: 8, e: [CX, BASE.shim], anchor: [18, 2], co: [190, -34], part: "INV-0006", note: "Shim thickness sets the clearance. Measure the shim with a micrometer.",
        draw: () => dRect(-18, 0, 36, 5, mat("steel"), 1) },
      { k: "tappet", ref: "", name: "Tappet", short: "Tappet", z: 7, e: [CX, BASE.tappet], anchor: [30, 20], co: [160, -14], part: "INV-0006", note: "Check for scuffing on the outside and on its bore in the head.",
        draw: () => secPath("M-30,0 H-19 V3 H19 V0 H30 V60 H25 V9 H-25 V60 H-30 Z", "h-steel") },
      { k: "cotters", ref: "", name: "Valve cotters", short: "Cotters", z: 6, e: [CX, BASE.cotters], anchor: [-10, 9], co: [-200, 14], verify: "unverified",
        draw: () => dPath("M-5,0 L-12,0 L-9,15 L-5,15 Z", mat("dark")) + dPath("M5,0 L12,0 L9,15 L5,15 Z", mat("dark")) },
      { k: "retainer", ref: "", name: "Spring retainer", short: "Retainer", z: 5, e: [CX, BASE.retainer], anchor: [27, 2], co: [163, 22], part: "INV-0006",
        draw: () => dPath("M-27,0 H27 V4 L13,12 H-13 L-27,4 Z", mat("steel")) + dHidden("M-12,0 L-9,12 M12,0 L9,12") },
      { k: "springs", ref: "", name: "Valve spring set (inner and outer)", short: "Valve springs", z: 4, e: [CX, 178], anchor: [25, 70], co: [165, 0], part: "INV-0006", note: "Measure free length of both springs: " + VFSM + ".",
        draw: () => gT("translate(0,0)", springV(156, 34, 11, 2.2)) + springV(156, 50, 8, 3.2) },
      { k: "seat", ref: "", name: "Spring seat", short: "Spring seat", z: 3, e: [CX, 334], anchor: [-29, 2], co: [-170, 0], part: "INV-0006",
        draw: () => washerV(4, 58, "steel") },
      { k: "seal", ref: "", name: "Valve stem oil seal", short: "Stem seal", z: 3, e: [CX, 314], anchor: [-11, 6], co: [-190, -14], part: "INV-0043", note: "Replace whenever the valves come out.",
        draw: () => dRect(-11, 0, 22, 12, mat("rubber", true), 3) + dLine(-11, 4, 11, 4, .9, "#9aa1a6") },
      { k: "guide", ref: "", name: "Valve guide", short: "Valve guide", z: 1, e: [CX, 326], anchor: [11, 70], co: [180, 0], part: "INV-0002", note: "Measure stem-to-guide clearance or rock the valve with a dial indicator: " + VFSM + ".",
        draw: () => secRect(-11, 0, 6, 114, "h-steel") + secRect(5, 0, 6, 114, "h-steel") },
      { k: "valve", ref: "", name: "Intake valve", short: "Valve", z: 2, e: [CX, BASE.valve], anchor: [-42, 355], co: [-150, 10], part: "INV-0006", note: "Check the face, the stem and the tip. Measure stem diameter and runout: " + VFSM + ".",
        draw: () => dRect(-5, 0, 10, 318, mat("steel", true), 1) + dLine(-5, 6, 5, 6, .6) + dLine(-5, 11, 5, 11, .6) + dPath("M-5,318 C-6,336 -30,346 -42,350 L-42,361 L42,361 L42,350 C30,346 6,336 5,318 Z", mat("steel", true)) },
      { k: "head", ref: "", name: "Cylinder head (section)", short: "Cylinder head", z: 0, e: [CX, 0], anchor: [-130, 260], co: [-60, 0], part: "INV-0002", note: "Check for cracks between the valve seats and for warping on the gasket face: " + VFSM + ".",
        draw: () => secPath("M-170,150 H-31 V338 H-11 V430 Q-70,436 -170,416 Z", "h-alu") + secPath("M170,150 H31 V338 H11 V438 Q32,466 40,506 H170 Z", "h-alu") + secPath("M-170,470 Q-82,472 -50,506 L-50,530 L-170,530 Z", "h-alu") + secRect(50, 506, 120, 24, "h-alu") + secRect(-50, 506, 10, 18, "h-steel") + secRect(40, 506, 10, 18, "h-steel") + dLine(-170, 530, 170, 530, 1.1, DK.ink) },
    ],
    explodedExtra: () => dCenterV(CX, 40, 560) + dNote(CX - 160, 452, "intake port", "start", 10) + dNote(CX, 556, "combustion chamber", "middle", 10) + dNote(CX + 64, CY + 70, "clearance", "start", 10) + dArrow(CX + 62, CY + 66, CX + 22, CY + 39),
    anim: (svg, t) => { const th = (t * 110) % 360, L = lift(th), v = Math.max(0, L - GAP);
      dpT(svg, "cam", `translate(${CX},${CY}) rotate(${th.toFixed(1)})`); ["shim", "tappet"].forEach(k => dpT(svg, k, `translate(${CX},${BASE[k] + v})`)); ["retainer", "cotters", "valve"].forEach(k => dpT(svg, k, `translate(${CX},${BASE[k] + v})`));
      dpT(svg, "springs", `translate(${CX},${178 + v}) scale(1,${((156 - v) / 156).toFixed(4)})`); const g = svg.querySelector('.dp[data-k="gauge"]'); if (g) g.style.opacity = 0; },
    animLabel: "cam rotation",
    steps: [
      { t: "Lobe away from the tappet", hl: ["cam", "shim"], d: "Turn the engine (in its normal direction) until this cam's lobe points away from the tappet, so the base circle sits over the shim." },
      { t: "Measure the gap", hl: ["gauge", "shim"], d: `Slide feeler gauges between the cam and the shim. The one that drags slightly is the clearance. Write it down for every valve. Spec: ${VFSM}.` },
      { t: "Work out the shim", hl: ["shim", "tappet"], d: "If it's out of spec, work out the new shim from the old shim's thickness and the measured gap, using the method in the manual." },
      { t: "Swap and recheck", hl: ["shim", "tappet", "cam"], d: "Hold the tappet down with the tappet tool, swap the shim, release, turn the engine over a few times and measure again." },
    ],
    seqNote: "Shim-over-bucket clearance check, as on the GS750. Use the manual's procedure and engine-turning direction.",
  });
})();

/* ---------------- EN-02 crankshaft, rod and piston (one cylinder) ---------------- */
(() => {
  const CX = 500, CY = 690, T = 60, L = 300;
  const pinY = CY - T - L; // assembled piston pin centre
  const rings = gap => [0, gap, gap * 2 + 2].map((y, i) => dRect(-78, y, 156, i === 2 ? 5 : 3, mat(i === 2 ? "dark" : "spring"), .5, .7) + (i === 2 ? Array.from({ length: 9 }, (_, j) => dLine(-60 + j * 15, y + 1, -60 + j * 15, y + 4, .6, DSHEET)).join("") : "") + `<rect x="${-2 + (i - 1) * 30}" y="${y - .5}" width="3" height="${i === 2 ? 6 : 4}" fill="${DSHEET}"/>`).join("");
  DIAGRAMS.push({
    id: "DG-EN-02", fig: "Fig. EN-02", title: "Crankshaft, connecting rod and piston (one cylinder)", system: "Engine", kinds: ["exploded", "assembled", "animation"],
    vb: [1000, 870], assembly: "One cylinder seen along the crank axis: piston and rings, pin and circlips, one-piece rod, big-end bearing and thrust washers, crank throw.",
    source: { label: "CMSNL GS750 (B) 1977 USA, Crankshaft", url: CMS }, compat: "GS750 (B) 1977 USA (E03).", verify: "schematic",
    inv: ["INV-0004", "INV-0005"], tasks: ["E-008", "E-009", "E-016", "E-017"], tools: ["Piston ring compressor", "Ring expander", "Circlip pliers", "Feeler gauges (ring gap)"], supplies: ["New circlips", "Assembly lube", "Ring set (if rings are out of spec)"],
    notes: "The GS750 crank is a pressed-together crank with one-piece rods and roller big ends. Rods can't be taken off without pressing the crank apart, which is specialist work. The near crank web is left off the drawing so the big end shows. The bearing and washers are drawn as the big-end parts based on their listed sizes; check their positions on the parts diagram. Shapes, stroke and rod length are drawn, not measured.",
    parts: [
      { k: "rings", ref: "", name: "Piston ring set (top, second, oil)", short: "Rings", z: 6, e: [CX, 2], a: [CX, pinY - 62], anchor: [78, 10], co: [130, 0], ca: [150, -10], part: "INV-0004", note: "Check end gap in the bore and side clearance in the groove: " + VFSM + ". Fit with the marks up.",
        draw: v => rings(v === "assembled" ? 10 : 20) },
      { k: "piston", ref: "", name: "Piston", short: "Piston", z: 5, phantom: 1, e: [CX, 130], a: [CX, pinY], anchor: [75, 40], co: [130, 0], ca: [150, 20], part: "INV-0004", note: "Note the arrow or mark on the crown that shows which way it faces.",
        draw: () => dPath("M-75,-70 H75 V-30 L73,80 H-73 L-75,-30 Z", mat("alu", true)) + [[-62, 3], [-52, 3], [-40, 5]].map(([y, h]) => dRect(-75, y, 150, h, "#5f6468", 0, .5)).join("") + `<circle r="26" fill="none" stroke="${DK.hidden}" stroke-width=".8" stroke-dasharray="4 2.5"/><circle r="17" fill="#3c4045" stroke="${DK.ink}" stroke-width="1"/>` + dLine(-73, -66, 73, -66, .5, "rgba(255,255,255,.7)") },
      { k: "pin", ref: "", name: "Piston pin", short: "Pin", z: 7, e: [230, 130], a: [CX, pinY], anchor: [0, -17], co: [0, -40], ca: [-150, -30], part: "INV-0004",
        draw: v => v === "assembled" ? `<circle r="17" fill="url(#gH-chrome)" stroke="${DK.ink}" stroke-width="1"/><circle r="9" fill="#5f6468" stroke="${DK.ink}" stroke-width=".8"/>` : tubeH(140, 34, "chrome", -70) + dHidden("M-70,-9 H70 M-70,9 H70") },
      { k: "clips", ref: "", name: "Piston pin circlips", short: "Circlips", z: 8, e: [230, 200], a: [CX, pinY], anchor: [-19, 0], co: [-60, 50], ca: [-140, 40], part: "INV-0004", note: "Always fit new circlips, with the gap away from the cutout.",
        draw: v => v === "assembled" ? `<path d="M17.9,6.5 A19,19 0 1,1 17.9,-6.5" fill="none" stroke="${DK.ink}" stroke-width="2.4"/>` : [-40, 40].map(x => `<path d="M${x + 17.9},6.5 A19,19 0 1,1 ${x + 17.9},-6.5" fill="none" stroke="${DK.ink}" stroke-width="2.4"/>`).join("") },
      { k: "rod", ref: "", name: "Connecting rod (one-piece)", short: "Connecting rod", z: 3, e: [CX, 560], a: [CX, CY - T], anchor: [-16, -150], co: [-160, 0], ca: [-170, 0], part: "INV-0005", note: "One-piece rod on a pressed crank. Check side play and up-and-down play at the big end and wear at the small end: " + VFSM + ".",
        draw: () => dPath(`M-22,-36 L-13,${-L + 20} L13,${-L + 20} L22,-36 Z`, mat("steel", true)) + dPath(`M-11,-56 L-7,${-L + 36} M11,-56 L7,${-L + 36}`, "none", .6) + `<path d="${ringPath(44, 30)}" fill="url(#gV-steel)" fill-rule="evenodd" stroke="${DK.ink}" stroke-width="1.1"/><path d="${ringPath(26, 17, 0, -L)}" fill="url(#gV-steel)" fill-rule="evenodd" stroke="${DK.ink}" stroke-width="1.1"/>` + dCenterV(0, -L - 34, 54) },
      { k: "bearing", ref: "", name: "Big-end bearing (listed 28 × 38 × 19.8)", short: "Big-end bearing", z: 4, e: [800, 560], a: [CX, CY - T], anchor: [27, 0], co: [70, -50], ca: [120, -40], verify: "unverified", part: "INV-0005", note: "Size taken from the part name in the list. Position assumed: big end.",
        draw: () => ringShape(30, 24, "url(#gH-dark)", 0, 0, .7) + Array.from({ length: 14 }, (_, i) => { const a = i * Math.PI / 7; return `<circle cx="${(Math.cos(a) * 27).toFixed(1)}" cy="${(Math.sin(a) * 27).toFixed(1)}" r="3.1" fill="url(#gH-chrome)" stroke="${DK.ink}" stroke-width=".6"/>`; }).join("") },
      { k: "washers", ref: "", name: "Thrust washers (listed 28 × 48)", short: "Thrust washers", z: 2, e: [760, 680], a: [CX, CY - T], anchor: [46, 10], co: [60, 50], ca: [110, 40], verify: "unverified", part: "INV-0005", note: "Size taken from the part name in the list. Position assumed: either side of the big end.",
        draw: v => (v === "assembled" ? [0] : [-50, 50]).map(x => ringShape(48, 28, "url(#gH-zinc)", x, 0, .9)).join("") },
      { k: "crank", ref: "", name: "Crankshaft (one throw, near web removed)", short: "Crankshaft", z: 0, e: [CX, 745], a: [CX, CY], anchor: [-80, 40], co: [-120, 30], ca: [-130, 30], part: "INV-0005", note: "Check main journal runout and bearing play: " + VFSM + ". Crank work is a specialist job.",
        draw: () => dPath("M-95,0 A95,95 0 0,0 95,0 L42,-60 A42,42 0 0,0 -42,-60 Z", mat("dark")) + `<circle cy="${-T}" r="24" fill="url(#h-steel)" stroke="${DK.ink}" stroke-width="1"/><circle r="32" fill="none" stroke="${DK.hidden}" stroke-width=".8" stroke-dasharray="4 2.5"/>` + dCenterH(0, -110, 110) + dCenterV(0, -110, 110) },
    ],
    assembledExtra: () => `<circle cx="${CX}" cy="${CY}" r="${T}" fill="none" stroke="${DK.center}" stroke-width=".6" stroke-dasharray="14 3 2 3"/>` + dCenterV(CX, 160, CY + 110) + dNote(CX + 100, CY - T - 8, "crank pin path", "start", 10),
    animView: "assembled", animLabel: "crank rotation",
    anim: (svg, t) => { const th = (t * 90) % 360, a = th * Math.PI / 180, bx = CX + T * Math.sin(a), by = CY - T * Math.cos(a), py = by - Math.sqrt(L * L - Math.pow(CX - bx, 2)), al = Math.asin((CX - bx) / L) * 180 / Math.PI;
      dpT(svg, "crank", `translate(${CX},${CY}) rotate(${th.toFixed(1)})`); dpT(svg, "rod", `translate(${bx.toFixed(1)},${by.toFixed(1)}) rotate(${al.toFixed(2)})`); ["bearing", "washers"].forEach(k => dpT(svg, k, `translate(${bx.toFixed(1)},${by.toFixed(1)})`));
      ["piston", "pin", "clips"].forEach(k => dpT(svg, k, `translate(${CX},${py.toFixed(1)})`)); dpT(svg, "rings", `translate(${CX},${(py - 62).toFixed(1)})`); },
  });
})();

/* ---------------- EN-03 clutch ---------------- */
(() => {
  const Y = 260, AX = 0;
  const drive = offs => offs.map(x => dRect(x, -108, 4, 216, "url(#h-friction)", .5, .8) + dRect(x, -114, 4, 7, mat("steel"), 0, .6) + dRect(x, 107, 4, 7, mat("steel"), 0, .6)).join("");
  const driven = offs => offs.map(x => dRect(x, -92, 3, 184, mat("steel"), .5, .8)).join("");
  DIAGRAMS.push({
    id: "DG-EN-03", fig: "Fig. EN-03", title: "Clutch", system: "Engine", kinds: ["exploded", "assembled", "step-by-step"],
    vb: [1200, 520], assembly: "Clutch on the transmission input shaft, side elevation: basket, sleeve hub, plates, pressure disc, push piece, springs and bolts.",
    source: { label: "CMSNL GS750 (B) 1977 USA, Clutch", url: CMS }, compat: "GS750 (B) 1977 USA (E03).", verify: "names",
    inv: ["INV-0008"], tasks: ["E-012", "E-016"], tools: ["Clutch hub holder", "Socket for the hub nut", "Vernier caliper (plates, springs)", "Feeler gauges and surface plate (plate warp)"], supplies: ["Engine oil to soak new friction plates", "New lock washer if it's the tab type", "Clutch cover gasket"],
    notes: "Names and refs come from the parts diagram. The number of plates is drawn for clarity: count yours and check the manual. Refs 18 to 20 (oil pump drive gear, spacer, bearing) sit behind the basket and aren't drawn. Proportions aren't measured.",
    parts: [
      { k: "tw", ref: "2", name: "Thrust washer", short: "Washer", len: 4, z: 3, e: [40, Y], a: [352, Y], co: [0, -150], ca: [-40, -170],
        draw: () => washerH(4, 60, "steel") },
      { k: "spacer", ref: "3", name: "Spacer", short: "Spacer", len: 36, z: 4, e: [80, Y], a: [362, Y], co: [0, -150], ca: [-30, 190],
        draw: () => dRect(0, -22, 36, 44, mat("steel")) + dHidden("M0,-14 H36 M0,14 H36") },
      { k: "brg", ref: "4", name: "Bearing", short: "Bearing", len: 32, z: 4, e: [150, Y], a: [364, Y], co: [0, -150], ca: [-60, 150],
        draw: () => dRect(0, -28, 32, 56, mat("steel")) + Array.from({ length: 6 }, (_, i) => dLine(4 + i * 5, -26, 4 + i * 5, 26, .5)).join("") + dHidden("M0,-22 H32 M0,22 H32") },
      { k: "basket", ref: "1", name: "Primary driven gear assembly (basket)", short: "Basket", len: 120, z: 1, phantom: 1, e: [220, Y], a: [356, Y], anchor: [70, -115], co: [0, -40], ca: [-40, -50], part: "INV-0008", note: "Check the slots for notches worn by the plate tabs and the gear for chipped teeth and play in the damper.",
        draw: () => dRect(0, -140, 20, 280, mat("dark")) + Array.from({ length: 5 }, (_, i) => dLine(2 + i * 4, -140, 2 + i * 4, -133, .6) + dLine(2 + i * 4, 140, 2 + i * 4, 133, .6)).join("") + dRect(20, -115, 100, 230, mat("cast")) + [-90, -60, -30, 0, 30, 60, 90].map(dg => { const y = Math.sin(dg * Math.PI / 180) * 112, h = Math.max(2, Math.cos(dg * Math.PI / 180) * 8); return dRect(40, y - h / 2, 80, h, "#3d4145", 0, .5); }).join("") + dHidden("M0,-30 H120 M0,30 H120") },
      { k: "washer", ref: "8", name: "Washer", short: "Washer", len: 4, z: 4, e: [380, Y], a: [400, Y], co: [0, -150], ca: [0, 190],
        draw: () => washerH(4, 70, "steel") },
      { k: "hub", ref: "5", name: "Sleeve hub", short: "Sleeve hub", len: 80, z: 3, e: [420, Y], a: [404, Y], anchor: [40, -85], co: [0, -40], ca: [-10, -100], part: "INV-0008", note: "Check the splines for notches and the spring towers for cracks.",
        draw: () => dRect(0, -40, 66, 80, mat("steel")) + dRect(16, -85, 50, 170, mat("cast")) + Array.from({ length: 15 }, (_, i) => dLine(18, -80 + i * 11.4, 64, -80 + i * 11.4, .5)).join("") + dRect(66, -62, 14, 14, mat("cast"), 1) + dRect(66, 48, 14, 14, mat("cast"), 1) },
      { k: "lockw", ref: "7", name: "Lock washer", short: "Lock washer", len: 3, z: 5, e: [540, Y], a: [470, Y], co: [0, -150], ca: [-10, 170],
        draw: () => washerH(3, 52, "spring") },
      { k: "nut", ref: "6", name: "Nut (sleeve hub)", short: "Hub nut", len: 14, z: 5, e: [570, Y], a: [473, Y], co: [0, -150], ca: [10, 150], note: "Torque: " + VFSM + ".",
        draw: () => hexH(14, 52, "zinc") },
      { k: "drive", ref: "9", name: "Drive plates (friction)", short: "Drive plates", z: 6, e: [630, Y], a: [424, Y], anchor: [2, -108], co: [0, -40], ca: [30, -150], part: "INV-0008", note: "Measure thickness and tab width on each plate: " + VFSM + ". Soak new plates in engine oil.",
        draw: v => drive(v === "assembled" ? [0, 14, 28, 42] : [0, 28, 56, 84]) },
      { k: "driven", ref: "10", name: "Driven plates (steel)", short: "Driven plates", z: 6, e: [754, Y], a: [424, Y], anchor: [15, 92], co: [0, 60], ca: [20, 120], part: "INV-0008", note: "Check each plate for warp on a flat surface with feeler gauges: " + VFSM + ".",
        draw: v => driven(v === "assembled" ? [7, 21, 35] : [0, 28, 56]) },
      { k: "pdisc", ref: "11", name: "Pressure disc", short: "Pressure disc", len: 14, z: 7, e: [870, Y], a: [476, Y], anchor: [7, -100], co: [0, -40], ca: [60, -110],
        draw: () => dRect(0, -100, 14, 200, mat("cast"), 2) + dRect(14, -16, 8, 32, mat("cast"), 1) + dHidden("M0,-62 H14 M0,-48 H14 M0,48 H14 M0,62 H14") },
      { k: "push", ref: "15", name: "Push piece", short: "Push piece", len: 22, z: 8, e: [920, Y], a: [470, Y], co: [0, -150], ca: [60, 130],
        draw: () => dRect(0, -9, 22, 18, mat("steel")) + dRect(16, -14, 6, 28, mat("steel"), 1) },
      { k: "pbrg", ref: "16", name: "Bearing (push piece)", short: "Bearing", len: 10, z: 8, e: [965, Y], a: [492, Y], co: [0, -150], ca: [70, 100],
        draw: () => dRect(0, -18, 10, 36, mat("steel")) + dHidden("M0,-10 H10 M0,10 H10") },
      { k: "pwasher", ref: "17", name: "Washer (push piece)", short: "Washer", len: 3, z: 8, e: [1000, Y], a: [502, Y], co: [0, -150], ca: [80, 70],
        draw: () => washerH(3, 36, "steel") },
      { k: "springs", ref: "12", name: "Clutch springs", short: "Springs", len: 40, z: 9, e: [1035, Y], a: [490, Y], anchor: [20, -67], co: [0, -60], ca: [40, -80], part: "INV-0008", note: "Measure free length of every spring: " + VFSM + ". Replace as a set.",
        draw: () => [-55, 55].map(y => gT(`translate(0,${y})`, springH(40, 24, 6, 3))).join("") },
      { k: "bolts", ref: "13, 14", name: "Clutch spring bolts and washers", short: "Bolts", z: 10, e: [1150, Y], a: [531, Y], anchor: [-6, -55], co: [0, -90], ca: [60, -60], note: "Tighten evenly in a cross pattern. Torque: " + VFSM + ".",
        draw: () => [-55, 55].map(y => gT(`translate(0,${y})`, mirX(boltH(10, 18, 44, 8)) + dRect(-12, -15, 2.5, 30, mat("zinc"), .5, .7))).join("") },
    ],
    assembledExtra: () => dCenterH(Y, 320, 560) + dNote(370, Y + 200, "engine side", "middle", 10) + dNote(520, Y + 200, "clutch cover side", "middle", 10),
    explodedExtra: () => dCenterH(Y, 20, 1170),
    seq: [
      { t: "Washer, spacer and bearing", add: ["tw", "spacer", "brg"], d: "Fit the thrust washer, then the spacer with its bearing, onto the input shaft." },
      { t: "Basket", add: ["basket"], d: "Fit the primary driven gear assembly (basket). Make sure it meshes with the primary drive and the oil pump drive." },
      { t: "Washer and sleeve hub", add: ["washer", "hub"], d: "Fit the washer and the sleeve hub on the shaft splines." },
      { t: "Lock washer and nut", add: ["lockw", "nut"], d: `Fit the lock washer and nut. Hold the hub with a holder and tighten. Torque: ${VFSM}.` },
      { t: "Plates", add: ["drive", "driven"], d: "Fit the plates alternately, starting and finishing with the type the manual says. Oil new friction plates first." },
      { t: "Push piece and pressure disc", add: ["push", "pbrg", "pwasher", "pdisc"], d: "Fit the push piece with its bearing and washer, then the pressure disc." },
      { t: "Springs and bolts", add: ["springs", "bolts"], d: `Fit the springs and bolts. Tighten evenly in a cross pattern. Torque: ${VFSM}.` },
    ],
    seqNote: "Order follows the parts diagram stacking from the engine side out. Check it against the service manual.",
  });
})();

/* ---------------- FU-01 carburetor (one of four) ---------------- */
(() => {
  const B = [560, 400];
  const at = (x, y) => [B[0] + x, B[1] + y];
  const body = () => secPath("M-46,-160 H46 V-40 H110 V80 H72 V96 H-72 V80 H-110 V-40 H-46 Z", "h-alu")
    + `<path d="M-32,-160 H32 V-24 A40,40 0 1,1 -32,-24 Z" fill="${DSHEET}" stroke="${DK.ink}" stroke-width="1"/>`
    + [[-7, 38, 14, 58], [33, 40, 12, 56], [-47, 52, 12, 44], [70, 36, 40, 8]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${DSHEET}" stroke="${DK.ink}" stroke-width=".8"/>`).join("")
    + dCenterH(0, -60, 60) + dCenterV(0, -170, 105);
  DIAGRAMS.push({
    id: "DG-FU-01", fig: "Fig. FU-01", title: "Carburetor (one of four), slide type", system: "Carburetors", kinds: ["exploded", "assembled", "cutaway", "animation"],
    vb: [1000, 790], assembly: "One carburetor looking along the bore, body cut away: slide and needle, needle jet, main and pilot jets, float valve, floats, float bowl, pilot screw.",
    source: { label: "General Mikuni VM-type slide carburetor construction (GS750 (B) carburetor list not readable as text)", url: CMS }, compat: "Fitted carburetor type and size on a 1977 GS750: VERIFY from the stamp on the carb body.", verify: "unverified",
    inv: ["INV-0011"], tasks: ["I-004", "J-007", "L-004"], tools: ["JIS screwdrivers", "Small jet wrench", "Carb cleaner and soft wire (never drill jets)", "Float level gauge or ruler"], supplies: ["Gasket and O-ring kit for this carb", "Carb cleaner", "Compressed air"],
    notes: "UNVERIFIED. Component names and shapes follow general Mikuni VM slide-carb construction because the GS750 (B) carburetor parts list could only be read as an image. Before buying parts, check every name against the parts diagram and the jet sizes and settings against the manual. Do one carburetor at a time so parts don't get mixed.",
    parts: [
      { k: "cap", name: "Top cap", short: "Top cap", z: 6, e: [230, 70], a: at(0, -160), anchor: [50, -7], co: [60, 0], ca: [-140, -20],
        draw: () => dRect(-50, -14, 100, 14, mat("alu"), 3) + dRect(-8, -30, 16, 16, mat("zinc"), 1.5) + dLine(0, -30, 0, -46, 1.6, DK.ink) },
      { k: "spring", name: "Throttle valve spring", short: "Slide spring", len: 115, z: 3, e: [230, 90], a: at(0, -160), anchor: [19, 50], co: [80, 0], ca: [-140, 10],
        draw: () => springV(115, 38, 9, 2.2) },
      { k: "retainer", name: "Needle retainer", short: "Retainer", z: 5, e: [230, 236], a: at(0, -7), anchor: [-14, 1], co: [80, 0], ca: [-130, -40],
        draw: () => dRect(-14, 0, 28, 3, mat("steel"), .5, .8) },
      { k: "needle", name: "Jet needle and clip", short: "Jet needle", z: 4, e: [230, 262], a: at(0, -4), anchor: [-1, 60], co: [80, 0], ca: [-150, 20], note: "Note which groove the clip is in before you take it off.",
        draw: () => dPath("M-1.8,0 L1.8,0 L1.6,55 L.5,100 L-.5,100 L-1.6,55 Z", mat("chrome", true), .8) + [4, 8, 12, 16, 20].map(y => dLine(-1.8, y, 1.8, y, .6)).join("") + dRect(-5.5, 11, 11, 2.5, mat("dark"), .5, .6) },
      { k: "slide", name: "Throttle valve (slide)", short: "Slide", z: 2, e: [230, 390], a: at(0, -45), anchor: [-31, 35], co: [80, 0], ca: [-120, 0], note: "Check for scoring and that it slides freely in the body.",
        draw: () => dRect(-31, 0, 62, 70, mat("chrome", true), 3) + dHidden("M0,0 V38 M-31,52 H31") + dLine(-31, 38, 31, 38, .6) },
      { k: "body", name: "Carburetor body", short: "Body", z: 0, e: [560, 270], a: B, anchor: [-110, 0], co: [-60, -20], ca: [-110, 30], part: "INV-0011", note: "Soak and clean every passage. Don't put rubber parts in strong cleaner.",
        draw: body },
      { k: "njet", name: "Needle jet", short: "Needle jet", z: 3, e: [560, 420], a: at(0, 38), anchor: [6, 30], co: [70, 0], ca: [150, -30],
        draw: () => dRect(-6, 0, 12, 58, mat("brass", true), 1) + dHidden("M-2.5,0 V58 M2.5,0 V58") + [14, 26, 38].map(y => dCircle(-4, y, 1.2, "#5c4b37", .4) + dCircle(4, y, 1.2, "#5c4b37", .4)).join("") },
      { k: "mjet", name: "Main jet", short: "Main jet", z: 4, e: [560, 500], a: at(0, 96), anchor: [7, 15], co: [70, 0], ca: [150, 10], note: "Jet size is stamped on it. Record it before cleaning.",
        draw: () => dRect(-5, 0, 10, 12, mat("brass", true), 1) + threadV(0, 12, 10, 2.2) + hexV(14, 8, "brass", 12) },
      { k: "pjet", name: "Pilot jet", short: "Pilot jet", z: 3, e: [660, 420], a: at(39, 44), anchor: [4, 20], co: [70, 0], ca: [150, -60], note: "Tiny bore that blocks easily. Clean with carb cleaner and a soft wire, never a drill.",
        draw: () => dRect(-4, 0, 8, 40, mat("brass", true), 1) + threadV(0, 14, 8, 2) + dLine(-4, 2, 4, 2, .8) },
      { k: "fvalve", name: "Float valve (needle and seat)", short: "Float valve", z: 4, e: [470, 420], a: at(-41, 56), anchor: [-6, 12], co: [-70, 0], ca: [-110, 60], note: "Look for a groove worn in the needle tip. Replace needle and seat together.",
        draw: () => dRect(-6, 0, 12, 16, mat("brass", true), 1) + hexV(14, 6, "brass", 16) + dRect(-2.5, 22, 5, 14, mat("steel", true), 1, .8) + dPath("M-2.5,36 L0,42 L2.5,36", "#2a2c2e", .6) },
      { k: "floats", name: "Floats", short: "Floats", z: 3, e: [560, 560], a: at(0, 100), anchor: [-64, 30], co: [-70, 0], ca: [-110, 70], note: "Float height sets the fuel level: " + VFSM + ". Shake brass floats to check for fuel inside.",
        draw: () => dRect(-64, 10, 44, 40, mat("brass"), 10) + dRect(20, 10, 44, 40, mat("brass"), 10) + dRect(-64, 2, 128, 3, mat("brass"), .5, .7) + dRect(-44, -2, 6, 6, mat("brass"), .5, .7) + dCircle(-64, 3.5, 3, mat("steel"), .7) },
      { k: "gasket", name: "Float chamber gasket", short: "Gasket", z: 4, e: [560, 640], a: at(0, 96), anchor: [74, 1.5], co: [60, 0], ca: [130, 40], part: "INV-0043",
        draw: () => dRect(-74, 0, 148, 3, mat("rubber"), 1, .7) },
      { k: "bowl", name: "Float chamber (bowl)", short: "Float bowl", z: 1, e: [560, 670], a: at(0, 99), anchor: [74, 50], co: [60, 0], ca: [100, 60],
        draw: () => secPath("M-74,0 H74 V70 Q74,92 52,92 H-52 Q-74,92 -74,70 Z M-66,0 V68 Q-66,84 -50,84 H50 Q66,84 66,68 V0 Z", "h-alu").replace("<path ", '<path fill-rule="evenodd" ') + dRect(36, 92, 14, 7, mat("zinc"), 1, .8) },
      { k: "pscrew", name: "Pilot (mixture) screw and spring", short: "Pilot screw", z: 5, e: [860, 310], a: at(112, 40), anchor: [-10, -6], co: [0, -50], ca: [40, -60], note: "Count the turns to lightly seated before removing and write it down. Setting: " + VFSM + ".",
        draw: () => mirX(dRect(0, -5, 8, 10, mat("zinc"), 1.5) + dRect(8, -3, 28, 6, mat("zinc")) + dPath("M36,-3 L44,0 L36,3 Z", mat("zinc"), .8) + gT("translate(10,0)", springH(16, 12, 5, 1.4))) },
    ],
    explodedExtra: () => dCenterV(230, 40, 470) + dCenterV(560, 90, 770),
    assembledExtra: () => dNote(B[0], B[1] + 8, "bore", "middle", 10),
    animView: "assembled", animLabel: "throttle opening",
    anim: (svg, t) => { const o = 55 * (1 - Math.cos(t * 1.6)) / 2;
      dpT(svg, "slide", `translate(${B[0]},${(B[1] - 45 - o).toFixed(1)})`); dpT(svg, "retainer", `translate(${B[0]},${(B[1] - 7 - o).toFixed(1)})`); dpT(svg, "needle", `translate(${B[0]},${(B[1] - 4 - o).toFixed(1)})`);
      dpT(svg, "spring", `translate(${B[0]},${B[1] - 160}) scale(1,${((115 - o) / 115).toFixed(4)})`); },
  });
})();

/* ---------------- EL-01 electrical system block diagram ---------------- */
(() => {
  const W = 170, H = 70;
  const blk = (title, sub, sym) => `<rect width="${W}" height="${H}" rx="6" fill="#ffffff" stroke="${DK.ink}" stroke-width="1.2"/><rect width="54" height="${H}" rx="6" fill="#EAF4F8" stroke="none"/><line x1="54" y1="0" x2="54" y2="${H}" stroke="${DK.ink}" stroke-width=".6"/>` + gT("translate(27,35)", sym) + dNote(64, 31, title, "start", 13).replace("<text ", '<text font-weight="700" ') + dNote(64, 50, sub, "start", 11);
  const s = {
    gen: `<circle r="16" fill="none" stroke="${DK.ink}" stroke-width="1.4"/><path d="M-9,0 q4.5,-9 9,0 t9,0" fill="none" stroke="${DK.ink}" stroke-width="1.4"/>`,
    rect: `<path d="M-12,-9 L-12,9 L4,0 Z" fill="${DK.ink}"/><line x1="4" y1="-10" x2="4" y2="10" stroke="${DK.ink}" stroke-width="2"/><line x1="-20" y1="0" x2="16" y2="0" stroke="${DK.ink}" stroke-width="1.2"/>`,
    reg: `<rect x="-15" y="-11" width="30" height="22" fill="none" stroke="${DK.ink}" stroke-width="1.3"/><text x="0" y="4" font-size="9" text-anchor="middle" font-family="Arial" font-weight="700">REG</text>`,
    bat: [-12, -4, 4, 12].map((x, i) => `<line x1="${x}" y1="${i % 2 ? -6 : -13}" x2="${x}" y2="${i % 2 ? 6 : 13}" stroke="${DK.ink}" stroke-width="${i % 2 ? 3 : 1.5}"/>`).join("") + `<text x="-16" y="-14" font-size="10" font-family="Arial">+</text>`,
    relay: `<rect x="-16" y="-6" width="12" height="16" fill="none" stroke="${DK.ink}" stroke-width="1.2"/><path d="M2,8 L14,-4" stroke="${DK.ink}" stroke-width="1.4"/><circle cx="2" cy="8" r="2" fill="${DK.ink}"/><circle cx="15" cy="9" r="2" fill="none" stroke="${DK.ink}"/>`,
    motor: `<circle r="16" fill="none" stroke="${DK.ink}" stroke-width="1.4"/><text x="0" y="5" font-size="14" text-anchor="middle" font-family="Arial" font-weight="700">M</text>`,
    key: `<circle cx="-8" cy="0" r="7" fill="none" stroke="${DK.ink}" stroke-width="1.4"/><path d="M-1,0 H16 M10,0 V6 M14,0 V5" stroke="${DK.ink}" stroke-width="1.4" fill="none"/>`,
    fuse: [-7, 7].map(y => `<rect x="-14" y="${y - 4}" width="28" height="8" rx="4" fill="none" stroke="${DK.ink}" stroke-width="1.2"/><path d="M-14,${y} H14" stroke="${DK.ink}" stroke-width=".8"/>`).join(""),
    sw: `<circle cx="-12" cy="6" r="2.2" fill="${DK.ink}"/><circle cx="12" cy="6" r="2.2" fill="none" stroke="${DK.ink}"/><path d="M-12,6 L10,-6" stroke="${DK.ink}" stroke-width="1.4"/>`,
    coil: `<path d="M-14,-8 q3.5,-7 7,0 t7,0 t7,0 t7,0" fill="none" stroke="${DK.ink}" stroke-width="1.3"/><path d="M-14,8 q3.5,-7 7,0 t7,0 t7,0 t7,0" fill="none" stroke="${DK.ink}" stroke-width="1.3"/><line x1="-14" y1="0" x2="14" y2="0" stroke="${DK.ink}" stroke-width="1"/><line x1="-14" y1="-2" x2="14" y2="-2" stroke="${DK.ink}" stroke-width="1"/>`,
    points: `<circle cx="-12" cy="4" r="2.2" fill="${DK.ink}"/><circle cx="12" cy="4" r="2.2" fill="${DK.ink}"/><path d="M-12,4 L11,-4" stroke="${DK.ink}" stroke-width="1.4"/><path d="M-4,10 l4,-6 l4,6 z" fill="none" stroke="${DK.ink}"/>`,
    plug: `<rect x="-4" y="-16" width="8" height="12" fill="none" stroke="${DK.ink}" stroke-width="1.2"/><rect x="-7" y="-4" width="14" height="8" fill="none" stroke="${DK.ink}" stroke-width="1.2"/><path d="M0,4 V12 M-4,14 H4" stroke="${DK.ink}" stroke-width="1.4"/>`,
    lamp: `<circle r="13" fill="none" stroke="${DK.ink}" stroke-width="1.4"/><path d="M-9,-9 L9,9 M9,-9 L-9,9" stroke="${DK.ink}" stroke-width="1.2"/>`,
  };
  const P = { gen: [40, 70], rect: [260, 70], bat: [500, 70], relay: [740, 70], motor: [980, 70], reg: [260, 250], key: [500, 250], fuse: [740, 250], sw: [980, 250], points: [260, 430], coil: [500, 430], plug: [740, 430], lamp: [980, 430] };
  const wire = (pts, lbl, lx, ly, cls = "", heavy) => `<polyline class="flow ${cls}" points="${pts.map(p => p.join(",")).join(" ")}" fill="none" stroke="${heavy ? "#233746" : "#3f6f8c"}" stroke-width="${heavy ? 3.2 : 1.8}" stroke-dasharray="7 6" stroke-linejoin="round"/>` + (lbl ? dNote(lx, ly, lbl, "middle", 10).replace("<text ", `<text paint-order="stroke" stroke="${DSHEET}" stroke-width="4" `) : "");
  const lines = () => [
    wire([[210, 105], [260, 105]], "AC", 235, 98),
    wire([[430, 105], [500, 105]], "DC charge", 465, 98),
    wire([[345, 140], [345, 250]], "connections: VERIFY", 345, 200, "dashed"),
    wire([[670, 95], [740, 95]], "battery cable", 705, 88, "", 1),
    wire([[910, 95], [980, 95]], "starter cable", 945, 88, "", 1),
    wire([[585, 140], [585, 250]], "", 0, 0),
    wire([[670, 285], [740, 285]], "switched feed", 705, 278),
    wire([[910, 285], [980, 285]], "", 0, 0),
    wire([[1065, 250], [1065, 190], [825, 190], [825, 140]], "starter button → relay coil", 945, 183),
    wire([[825, 320], [825, 380], [585, 380], [585, 430]], "ignition feed", 705, 373),
    wire([[430, 465], [500, 465]], "trigger", 465, 458),
    wire([[670, 465], [740, 465]], "HT leads", 705, 458),
    wire([[1065, 320], [1065, 430]], "lighting & signals", 1065, 380),
  ].join("") + dNote(40, 600, "Block diagram: shows which parts feed which. It is not a wiring diagram. Wire colours, connectors and grounds come from the factory wiring diagram.", "start", 11) + `<g transform="translate(40,540)"><line x1="0" y1="0" x2="30" y2="0" stroke="#233746" stroke-width="3.2"/>${dNote(38, 4, "heavy current", "start", 10)}<line x1="150" y1="0" x2="180" y2="0" stroke="#3f6f8c" stroke-width="1.8"/>${dNote(188, 4, "feed or signal", "start", 10)}</g>`;
  DIAGRAMS.push({
    id: "DG-EL-01", fig: "Fig. EL-01", title: "Electrical system overview (block diagram)", system: "Electrical", kinds: ["block diagram", "animation"],
    vb: [1200, 620], assembly: "How charging, starting, ignition and lighting connect. One block per component group.",
    source: { label: "CMSNL GS750 (B) 1977 USA, Electrical (component names, fuse ratings)", url: CMS }, compat: "GS750 (B) 1977 USA (E03).", verify: "schematic",
    inv: ["INV-0032", "INV-0033", "INV-0034", "INV-0035", "INV-0037", "INV-0038", "INV-0039"], tasks: ["G-001", "G-002", "G-003", "G-004", "G-005", "K-003"], tools: ["Multimeter", "Test light", "Battery charger"], supplies: ["Dielectric grease", "Contact cleaner", "Heat-shrink and the correct crimp terminals"],
    notes: "Not a wiring diagram. It shows which component groups connect, so you can follow a fault from one block to the next. Fuse ratings (15A and 10A) come from the fuse names in the parts list; which circuit each protects: VERIFY. How the regulator connects isn't shown because it couldn't be confirmed. Get the factory wiring diagram for your exact model before testing circuit by circuit.",
    parts: [
      { k: "gen", name: "Generator (alternator)", short: "Generator", e: P.gen, anchor: [85, 0], co: [0, -36], part: "INV-0034", draw: () => blk("Generator", "makes AC", s.gen) },
      { k: "rect", name: "Rectifier", short: "Rectifier", e: P.rect, anchor: [85, 0], co: [0, -36], part: "INV-0034", draw: () => blk("Rectifier", "AC to DC", s.rect) },
      { k: "bat", name: "Battery", short: "Battery", e: P.bat, anchor: [85, 0], co: [0, -36], note: "Charge and test it off the bike before any electrical testing.", draw: () => blk("Battery", "12 V", s.bat) },
      { k: "relay", name: "Starter relay", short: "Starter relay", e: P.relay, anchor: [85, 0], co: [0, -36], part: "INV-0035", draw: () => blk("Starter relay", "starter current", s.relay) },
      { k: "motor", name: "Starter motor", short: "Starter motor", e: P.motor, anchor: [85, 0], co: [0, -36], part: "INV-0035", draw: () => blk("Starter motor", "", s.motor) },
      { k: "reg", name: "Regulator", short: "Regulator", e: P.reg, anchor: [0, 35], co: [-24, 0], part: "INV-0034", verify: "unverified", note: "How the regulator is wired into the charging circuit wasn't confirmed. Use the factory wiring diagram.", draw: () => blk("Regulator", "controls charging", s.reg) },
      { k: "key", name: "Ignition switch", short: "Ignition switch", e: P.key, anchor: [0, 35], co: [-24, 0], part: "INV-0032", draw: () => blk("Ignition", "key switch", s.key) },
      { k: "fuse", name: "Fuse box (15A, 10A)", short: "Fuse box", e: P.fuse, anchor: [0, 35], co: [-24, 0], part: "INV-0032", note: "Ratings from the parts list fuse names. Which circuit each fuse protects: VERIFY.", draw: () => blk("Fuse box", "15A and 10A fuses", s.fuse) },
      { k: "sw", name: "Handlebar switches", short: "Switches", e: P.sw, anchor: [170, 35], co: [24, 0], part: "INV-0037", draw: () => blk("Switches", "handlebar controls", s.sw) },
      { k: "points", name: "Ignition trigger (points as fitted)", short: "Trigger", e: P.points, anchor: [0, 35], co: [-24, 0], part: "INV-0033", verify: "unverified", note: "Check what's fitted: contact-breaker points or an aftermarket electronic trigger.", draw: () => blk("Trigger", "points or electronic", s.points) },
      { k: "coil", name: "Ignition coils (2)", short: "Coils", e: P.coil, anchor: [85, 70], co: [0, 36], part: "INV-0033", note: "Two coils are listed. Each fires two plugs; which cylinders pair up: VERIFY.", draw: () => blk("Ignition coils", "two coils", s.coil) },
      { k: "plug", name: "Spark plugs (4)", short: "Plugs", e: P.plug, anchor: [85, 70], co: [0, 36], part: "INV-0033", note: "Plug type and gap: " + VFSM + ".", draw: () => blk("Spark plugs", "four, via HT leads", s.plug) },
      { k: "lamp", name: "Lights, horn and signals", short: "Lighting", e: P.lamp, anchor: [85, 70], co: [0, 36], part: "INV-0038", draw: () => blk("Lighting", "lights, signals, horn", s.lamp) },
    ],
    explodedExtra: lines,
    animLabel: "current flow",
    anim: (svg, t) => svg.querySelectorAll(".flow").forEach(l => l.setAttribute("stroke-dashoffset", (-t * 30).toFixed(1))),
    steps: [
      { t: "Charging", hl: ["gen", "rect", "reg", "bat"], d: "The generator makes AC, the rectifier turns it into DC to charge the battery, and the regulator keeps the voltage in range. Test each one with the manual's procedure." },
      { t: "Starting", hl: ["bat", "relay", "motor", "sw", "fuse", "key"], d: "The starter button energises the starter relay, which switches heavy battery current to the starter motor." },
      { t: "Ignition", hl: ["key", "fuse", "points", "coil", "plug"], d: "Switched power feeds the coils. The trigger tells each coil when to fire, and each coil fires two plugs." },
      { t: "Lighting", hl: ["key", "fuse", "sw", "lamp"], d: "Fused, switched power runs the lights, horn and signals through the handlebar switches." },
    ],
  });
})();

/* finish: build-up sequences and sort into the five systems */
DIAGRAMS.forEach(d => { if (d.seq) d.steps = seqSteps(d); });
const DIAG_PENDING = [
  ["Cylinder head cover removal", "Needs the service manual's bolt order and photos of this engine. Not drawn to avoid guessing."],
  ["Wiring diagram (wire by wire)", "Needs the factory wiring diagram for the GS750 (B). The block diagram above covers how systems connect."],
  ["Harness routing", "Needs reference photos of a correctly routed frame. Add your own photos to the harness part until then."],
];
