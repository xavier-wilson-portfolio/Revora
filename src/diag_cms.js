/* ============ CMSNL catalogue data for the 2D diagrams ============
   Rows copied from the CMSNL parts lists for the GS750B 1977 (B) USA (E03), model 16048.
   Each row: [ref, part number, catalogue description, replaced by]. Non-genuine alternatives are left out.
   "Current number" = start at the first variant of a ref and follow Suzuki's replacements to the end. */
const CMS_PAGES = {
  "DG-CH-01": { blk: "BLCK0030", title: "FRONT FORK (GS750B)", rows: [
    ["0-1", "5110345030", "DAMPER ASSEMBLY,RIGHT", "5110345031"], ["0-2", "5110345031", "DAMPER ASSEMBLY,RIGHT", ""], ["0-3", "5110445030", "DAMPER ASSEMBLY,LEFT", "5110445031"], ["0-4", "5110445031", "DAMPER ASSEMBLY,FRONT FORK,LEFT", ""],
    ["1", "5111045030", "TUBE,INNER", ""], ["2-1", "5113045031", "TUBE,FORK,OUTER,RIGHT", "5113045032"], ["2-2", "5113045032", "TUBE,FORK,OUTER,RIGHT", ""],
    ["3-1", "5114045031", "TUBE,FORK,LEFT,OUTER", "5114045032"], ["3-2", "5114045032", "TUBE,FORK,LEFT,OUTER", ""], ["4", "5114645030", "CYLINDER,FRONT FORK", ""],
    ["5", "5117145030", "SPRING,FRONT FORK,UPPER", ""], ["6", "5119545030", "PIECE,OIL LOCK", ""], ["7", "5117745030", "SPRING,FORK REBOUND", ""],
    ["8-1", "5115334730", "OIL SEAL,FRONT FORK", "5115319D10"], ["8-2", "5115345030", "OIL SEAL,FRONT FORK", "5115334200"], ["9", "5155631231", "RING,OIL SEAL STOPPER", "5115631231"],
    ["10", "5116845030", "SPACER,SEAL", "5116801A30"], ["11", "5116845031", "SPACER,SEAL", "5116801A30"], ["12", "5157131232", "BOOT", "5157134200"], ["13", "5119631230", "RING", ""],
    ["14", "5135131030", "CAP,INNER TUBE", ""], ["15", "5118131030", "O RING", ""], ["16-1", "5114731030", "BOLT", "5114748130"], ["16-2", "5114748130", "BOLT(8X27)", ""],
    ["17", "5114831030", "GASKET", "5114836011"], ["18", "5113231030", "HOLDER,AXLE", ""], ["19", "0832221088", "WASHER", "0832201087"], ["20", "0832121088", "LOCK WASHER", "0832101087"],
    ["21", "0831012088", "NUT", "0831000087"], ["22", "0211104067", "SCREW", "0211204068"], ["23", "5118333030", "GASKET", ""], ["24", "0142108258", "STUD 8X25", "014210825A"],
    ["25", "5119245030", "WASHER", "5119247200"], ["26", "5118445030", "SPRING,FRONT FORK", ""]] },
  "DG-BR-01": { blk: "BLCK0028", title: "FRONT CARIPERS (GS750B)", rows: [
    ["0-1", "5930045000", "CALIPER ASSEMBLY", "5930045001"], ["0-2", "5930045001", "CALIPER ASSEMBLY", "5930045002"], ["0-3", "5930045002", "CALIPER ASSEMBLY", ""],
    ["1-1", "5910045810", "PISTON SET", "5910045811"], ["1-2", "5910045830", "PISTON SET", "5910045831"], ["2", "5910045820", "59302-45830 (MCA)", "5910045821"],
    ["3-1", "5911118410", "O RING,CALIPER AXLE", ""], ["3-2", "5911145001", "O RING", ""], ["4", "5931245000", "COVER,AXLE DUST", ""], ["5", "5513666310", "SEAL,FR CALIPE", "6910738B00"],
    ["6", "5930845000", "BOOT,PISTON", ""], ["7-1", "5935045000", "HOLDER CALIPERS", ""], ["7-2", "5935045001", "HOLDER,CALIPERS", ""], ["7-3", "5935044002", "HOLDER, CARIPERS LH", "5935044003"],
    ["8", "0211206128", "SCREW 6X12", "0211206127"], ["9", "0832121068", "LOCK WASHER", "0832121067"], ["10-1", "5930545000", "AXLE,CALIPER", ""], ["10-2", "5930545001", "AXLE,CALIPER", ""],
    ["11", "5930545002", "AXLE,CALIPER", ""], ["12", "5937145000", "WASHER,AXLE", ""], ["13", "5912118410", "BLEEDER", ""], ["14", "5912218410", "CAP,BREATHER", "5515666310"],
    ["15", "0910410007", "BOLT", "0910410029"], ["16", "0832221108", "WASHER", "0832221107"], ["17", "0832121108", "LOCK WASHER", "0832121107"]] },
  "DG-CH-02": { blk: "BLCK0034", title: "FRONT WHEEL (GS750)", rows: [
    ["1-1", "5411145000", "CASTING WHEEL,FRONT", "5411145001"], ["1-2", "5411147000", "HUB,FRONT WHEEL", "5411147001"], ["1-3", "5411147001", "DRUM,FRONT HUB", "5411147002"],
    ["2-1", "0812363020", "BEARING", "0812363027"], ["2-2", "0812363027", "BEARING", "081236302B"], ["3", "5473018400", "SPACER,FR HUB BEARING", ""], ["4", "5471133002", "AXLE,FRONT", "547113300V"],
    ["5", "0831431128", "NUT 12MM", "083143112A"], ["6", "0411130308", "COTTER PIN", "041113030A"], ["7-1", "5474018401", "SPACER,FRONT AXLE,RIGHT", "5474018402"], ["7-2", "5474018402", "SPACER,FR AXLE,R", ""],
    ["8", "0918015034", "SPACER(15X22X30)", ""], ["9", "0832221128", "WASHER", "0832201127"], ["10", "5487145000", "COVER,FR HUB,R", ""], ["11-1", "5487131000", "DUST SEAL", ""],
    ["11-2", "5487145010", "DUST SEAL,SPEEDOMETER GEAR BOX", ""], ["12", "5460018401", "BOX ASSEMBLY,SPEEDOMETER GEAR", "5460018402"], ["13-1", "5921037001", "DISC,BRAKE", ""], ["13-2", "5921147000", "DISC,BRAKE", ""],
    ["14-1", "0910008094", "BOLT(8X30)", ""], ["14-2", "0910008140", "BOLT(8X25)", ""], ["15", "0916908016", "WASHER", ""], ["16", "5921445000", "SHIM,BRAKE DISC", ""],
    ["17-1", "5510031610", "TIRE,FRONT", "5510045030"], ["17-2", "5510045030", "TIRE,FRONT", ""], ["18", "5520015010", "TUBE,INNER", "5520044610"], ["19", "5526115010", "PROTECTOR,WHL INR TUBE", "5526115020"],
    ["20", "5531134020", "RIM,FR WHEEL", ""], ["21", "5532034805", "SPOKE SET,FRONT", "5532045000"], ["22", "5541111000", "BALANCER,WHEEL (B)", "5541126G00"], ["23", "5541211000", "BALANCER,WHEEL (30G)", "5541341F00"]] },
  "DG-EN-01": { blk: "BLCK0004", title: "CAM SHAFT - VALVE", rows: [
    ["1", "1271145001", "CAMSHAFT", "1271145002"], ["2", "1274045040", "SPROCKET,CAMSHAFT", "1274045051"], ["3", "0910606024", "BOLT 6X11", "0713006103"], ["4", "1272145001", "CAMSHAFT,EXHAUST", "1272145002"],
    ["5", "1275045040", "SPROCKET,EXHAUST CAMSHAFT", "1275045051"], ["6", "0910606024", "BOLT 6X11", "0713006103"], ["7", "1289145000", "TAPPET", "1289145001"],
    ["8-1", "1291145010", "VALVE,INTAKE", "1291145011"], ["8-2", "1291145011", "VALVE,INTAKE", "1291145030"], ["9-1", "1291245010", "VALVE,EXHAUST", "1291245011"], ["9-2", "1291245011", "VALVE,EXHAUST", "1291245021"],
    ["10", "1290045810", "SPRING SET,VALVE", "1292045010"], ["11", "1293145000", "RETAINER,VALVE SPRING", "1293145001"], ["12", "1293345001", "SEAT,VALVE SPRING", ""], ["13", "1290045820", "SHIM,TAPPET", "1293245010"],
    ["14", "0928907002", "SEAL,OIL(7X14.4X9)", ""],
    ["15-1", "1289245000", "SHIM,TAPPET", "1289245000215"], ["15-2", "1289245001", "SHIM,TAPPET", "1289245000220"], ["15-3", "1289245002", "SHIM,TAPPET", "1289245000225"], ["15-4", "1289245003", "SHIM,TAPPET", "1289245000230"],
    ["15-5", "1289245004", "SHIM,TAPPET", "1289245000235"], ["15-6", "1289245005", "SHIM,TAPPET", "1289245000240"], ["15-7", "1289245006", "SHIM,TAPPET", "1289245000245"], ["15-8", "1289245007", "SHIM,TAPPET", "1289245000250"],
    ["15-9", "1289245008", "SHIM,TAPPET", "1289245000255"], ["16-1", "1289245009", "SHIM,TAPPET", "1289245000260"], ["16-2", "1289245010", "SHIM,TAPPET", "1289245000265"], ["16-3", "1289245011", "SHIM,TAPPET", "1289245000270"],
    ["16-4", "1289245012", "SHIM,TAPPET", "1289245000275"], ["16-5", "1289245013", "SHIM,TAPPET", "1289245000280"], ["16-6", "1289245014", "SHIM,TAPPET", "1289245000285"], ["16-7", "1289245015", "SHIM,TAPPET", "1289245000290"],
    ["16-8", "1289245016", "SHIM,TAPPET", "1289245000295"], ["16-9", "1289245017", "SHIM,TAPPET", "1289245000300"], ["17-1", "1289245018", "SHIM,TAPPET", "1289245000305"], ["17-2", "1289245019", "SHIM,TAPPET", "1289245000310"],
    ["18", "1280045810", "SHIM SET,TAPPET", "1280045811"], ["19", "9900069480", "CASE", "9900069521"]] },
  "DG-EN-02": { blk: "BLCK0016", title: "CRANKSHAFT", rows: [
    ["1-1", "1220045000", "CRANKSHAFT ASSEMBLY", "1220045001"], ["1-2", "1220045001", "CRANKSHAFT ASSEMBLY", "1220045002"], ["1-3", "1220045002", "CRANKSHAFT ASSEMBLY", ""],
    ["2", "1216145000", "CONNECTING ROD", ""], ["3", "0916028009", "WASHER (28X48X2)", ""], ["4", "0916028010", "WASHER(28X48X1)", ""], ["5", "0926328010", "BEARING(28X38X19.8)", ""],
    ["6-1", "1222045000", "CRANKSHAFT", "1222045001"], ["6-2", "1222045001", "CRANKSHAFT", ""], ["7", "1223045000", "WEB,CRANK", ""], ["8-1", "1224145000", "CRANKSHAFT", "1224145001"], ["8-2", "1224145001", "CRANKSHAFT", ""],
    ["9", "1225045000", "WEB,CRANK,MIDDLE", ""], ["10", "1226145000", "CRANKSHAFT,LEFT", ""], ["11", "1223045000", "WEB,CRANK", ""], ["12", "1228145000", "SHAFT,TIMING CHAIN DRIVE", ""],
    ["13", "0926230033", "BEARING(30X72X19)", ""], ["14", "0833111308", "CIRCLIP,30MM", "0833131306"], ["15", "0833131329", "CIRCLIP.32MM", "0833131328"], ["16-1", "2111145000", "GEAR,PRIMARY DRIVE", "2111145001"],
    ["16-2", "2111145001", "GEAR,PRIMARY DRIVE", ""], ["17", "0910608006", "BOLT", "0910608043"], ["18", "0926432001", "BEARING", ""], ["19", "0939072004", "C RING", ""], ["20", "0422107129", "PIN", ""],
    ["21", "0928330021", "SEAL,OIL(30X72X11)", ""], ["22", "0928948001", "OIL SEAL", "0928948002"], ["23-1", "1211145002", "PISTON", ""], ["23-2", "1211145002050", "PISTON (65.50MM)", "1210345820050"],
    ["23-3", "1211145002100", "PISTON", "1210345820100"], ["24-1", "1214045013", "RING SET,PISTON", ""], ["24-2", "1214045013050", "RING SET,PISTON (OS:0.5)", ""], ["24-3", "1214045013100", "RING SET,PISTON (OS:1.0)", ""],
    ["25", "1215129001", "PIN,PISTON", ""], ["26", "0938116002", "CIRCLIP", "0938116001"]] },
  "DG-EN-03": { blk: "BLCK0009", title: "CLUTCH", rows: [
    ["1", "2120045001", "GEAR ASSEMBLY,PRIMARY DRIVE", ""], ["2", "0916025023", "WASHER", "0916025054"], ["3", "2125145001", "SPACER,PRIMARY DRIVEN", "2125149200"], ["4", "0926351001", "BEARING", "0926351002"],
    ["5", "2141145000", "HUB,CLUTCH SLEEVE", ""], ["6", "0914024004", "NUT", "0914024007"], ["7", "0916725007", "WASHER,LOCK", ""], ["8", "0916025022", "WASHER(25X66X3.5)", ""],
    ["9", "2144145000", "PLATE,CLUTCH DRIVE", "2144145001"], ["10", "2145145000", "PLATE,CLUTCH DRIVEN", "2145128C30"], ["11", "2146216500", "DISC,CLUTCH PRESSURE", "2146216501"], ["12", "0944019007", "SPRING", ""],
    ["13", "0110706168", "BOLT, UPPER", "0110706167"], ["14", "0916006020", "WASHER", "0916006066"], ["15", "2312145000", "PIECE,CLUTCH PUSH", ""], ["16", "0926315003", "BEARING(15X28X2)", ""],
    ["17", "0916015015", "WASHER", "0916015045"], ["18-1", "1632145001", "GEAR,OIL PUMP DRIVE", "1632145002"], ["18-2", "1632145002", "GEAR,ENG OIL PUMP DRIVE(NT:38)", ""], ["19", "1632545001", "SPACER,OIL PUMP DRIVE GEAR", ""],
    ["20", "0926336002", "BEARING(36X40X10)", ""]] },
};
/* Diagrams that aren't a catalogue page, and why. */
const CMS_NOTE = {
  "DG-FU-01": { blk: "BLCK0005", why: "CMSNL shows the carburetor picture but no parts list for this model, so names here can't be checked against it yet." },
  "DG-BR-02": { why: "An inspection guide, not a catalogue page. The disc itself is ref 13 on the Front wheel page." },
  "DG-EL-01": { blk: "BLCK0077", why: "A simplified block diagram of how the system works, not a catalogue page. The harness is on the Wiring harness page." },
};
/* Catalogue refs that aren't drawn as their own item, and why (shown in the catalogue list). */
const CMS_COVER = {
  "DG-CH-01": { "0": "The whole damper assembly: the parts drawn here", "3": "Left leg outer tube, mirror image of ref 2" },
  "DG-CH-02": { "17": "Tire: outside this axle view", "18": "Inner tube: outside this axle view", "19": "Rim band: outside this axle view", "20": "Rim: outside this axle view", "21": "Spokes: outside this axle view", "22": "Balance weight: outside this axle view", "23": "Balance weight: outside this axle view" },
  "DG-EN-01": { "2": "Cam sprocket: outside this one-valve view", "3": "Sprocket bolts: outside this one-valve view", "4": "Exhaust camshaft: same layout as ref 1 on the exhaust side", "5": "Exhaust cam sprocket: outside this one-valve view", "6": "Sprocket bolts: outside this one-valve view", "9": "Exhaust valve: same layout as ref 8 on the exhaust side", "16": "Other shim sizes, fits where ref 15 is", "17": "Other shim sizes, fits where ref 15 is", "18": "Shim set (all sizes in a case)", "19": "Case for the shim set" },
  "DG-EN-02": { "6": "Part of the crankshaft assembly (ref 1)", "7": "Part of the crankshaft assembly (ref 1)", "8": "Part of the crankshaft assembly (ref 1)", "9": "Part of the crankshaft assembly (ref 1)", "10": "Part of the crankshaft assembly (ref 1)", "11": "Part of the crankshaft assembly (ref 1)", "12": "Cam chain drive shaft: outside this one-cylinder view", "13": "Main bearing: outside this one-cylinder view", "14": "Circlip: outside this one-cylinder view", "15": "Circlip: outside this one-cylinder view", "16": "Primary drive gear: outside this one-cylinder view", "17": "Bolt: outside this one-cylinder view", "18": "Bearing: outside this one-cylinder view", "19": "C-ring: outside this one-cylinder view", "20": "Pin: outside this one-cylinder view", "21": "Crank oil seal: outside this one-cylinder view", "22": "Crank oil seal: outside this one-cylinder view" },
  "DG-EN-03": { "18": "Oil pump drive gear, behind the clutch: not drawn yet", "19": "Oil pump drive gear spacer: not drawn yet", "20": "Bearing for the oil pump drive gear: not drawn yet" },
};
/* Refs for parts drawn before the catalogue data was added (engine diagrams). */
const CMS_REFS = {
  "DG-EN-01": { cam: "1", shim: "15", tappet: "7", cotters: "13", retainer: "11", springs: "10", seat: "12", seal: "14", valve: "8" },
  "DG-EN-02": { rings: "24", piston: "23", pin: "25", clips: "26", rod: "2", bearing: "5", washers: "3, 4", crank: "1" },
};
const cmsBase = r => String(r).split("-")[0];
function cmsCurrent(rows, ref) {
  const vs = rows.filter(r => cmsBase(r[0]) === String(ref)); if (!vs.length) return null;
  let cur = vs[0], seen = new Set();
  for (;;) { if (!cur[3] || seen.has(cur[3])) return cur[3] || cur[1]; seen.add(cur[3]); const nx = rows.find(r => r[1] === cur[3]); if (!nx) return cur[3]; cur = nx; }
}
const fmtPn = pn => pn && /^[0-9A-Z]{10}$/.test(pn) ? pn.slice(0, 5) + "-" + pn.slice(5) : (pn || "");
(function cmsApply() {
  DIAGRAMS.forEach(d => {
    const pg = CMS_PAGES[d.id], nt = CMS_NOTE[d.id];
    if (nt) { d.cmsNote = nt.why; if (nt.blk) d.source = { label: d.source.label, url: CMS + nt.blk + ".html" }; }
    if (!pg) return;
    d.cms = pg; d.source = { label: `CMSNL GS750B 1977 USA, ${pg.title}`, url: CMS + pg.blk + ".html" };
    d.verify = "names";
    const refMap = CMS_REFS[d.id] || {};
    d.parts.forEach(p => { if (refMap[p.k]) p.ref = refMap[p.k]; });
    const drawn = new Set();
    d.parts.forEach(p => {
      const refs = String(p.ref || "").split(/,\s*/).map(cmsBase).filter(r => r !== "");
      refs.forEach(r => drawn.add(r));
      const pns = refs.map(r => cmsCurrent(pg.rows, r)).filter(Boolean);
      if (pns.length) p.pn = pns;
      const cats = refs.flatMap(r => pg.rows.filter(x => cmsBase(x[0]) === r).map(x => x[2]));
      if (cats.length) p.cat = [...new Set(cats)].join(" / ");
    });
    d.cmsDrawn = drawn;
  });
})();
function diagCatHtml(d) {
  if (!d.cms) return d.cmsNote ? `<div class="tcard stack"><h3 class="vh">Parts catalogue</h3><p class="hint-text" style="text-align:left;margin:0">${esc(d.cmsNote)}</p>${d.source && d.source.url ? `<a class="btn sm" href="${esc(d.source.url)}" target="_blank" rel="noopener">${ic("ext")} Open on CMSNL</a>` : ""}</div>` : "";
  const groups = []; d.cms.rows.forEach(r => { const b = cmsBase(r[0]); let g = groups.find(x => x.ref === b); if (!g) groups.push(g = { ref: b, rows: [] }); g.rows.push(r); });
  const byRef = r => d.parts.find(p => String(p.ref || "").split(/,\s*/).map(cmsBase).includes(r));
  const cover = CMS_COVER[d.id] || {}, miss = groups.filter(g => !d.cmsDrawn.has(g.ref) && !cover[g.ref]).length;
  return `<div class="tcard stack"><div class="row" style="justify-content:space-between"><h3 class="vh" style="margin:0">Catalogue page</h3><a class="linkbtn" href="${esc(d.source.url)}" target="_blank" rel="noopener">Open on CMSNL ${ic("ext")}</a></div>
    <p class="hint-text" style="text-align:left;margin:0">Every row of the CMSNL ${esc(d.cms.title.toLowerCase())} page. Current number follows Suzuki's replacements. ${miss ? `${miss} ref${miss > 1 ? "s are" : " is"} still to be drawn.` : "Every ref is drawn or accounted for."}</p>
    <div class="cmslist">${groups.map(g => { const p = byRef(g.ref), cur = cmsCurrent(d.cms.rows, g.ref), names = [...new Set(g.rows.map(r => r[2]))].join(" / ");
      return `<${p ? `button data-dp="${p.k}"` : "div"} class="cmsrow ${p ? "" : "nd"} ${p && DV.sel === p.k ? "on" : ""}"><b>${esc(g.ref)}</b><span>${esc(names)}${g.rows.length > 1 ? `<small>${g.rows.length} variants</small>` : ""}${p ? "" : `<small>${esc(cover[g.ref] || "Not drawn yet: position to be checked against the CMSNL picture")}</small>`}</span><code>${esc(fmtPn(cur))}</code></${p ? "button" : "div"}>`; }).join("")}</div></div>`;
}
