/* ============ GS750 digital twin: hierarchy, metadata and source register ============
   Model designation researched: Suzuki GS750 (B), 1977, USA market (E03) — CMSNL model 34273.
   Nothing in here is presented as factory-accurate geometry. Every assembly carries a confidence
   level and the parts-diagram groups it was identified from. */
const CMSNL = "https://www.cmsnl.com/suzuki-gs750-1977-b-usa-e03_model34273/partslist/";
const TW_DIAGRAM = {
  1: "Air cleaner", 2: "Battery", 3: "Cam chain", 4: "Camshaft - valve", 5: "Carburetor (GS750B)", 8: "Chain case - shock absorber", 9: "Clutch", 10: "Clutch release",
  11: "Contact breaker (Kokusan) (GS750B)", 13: "Crankcase LH cover", 14: "Crankcase", 15: "Crankcase RH cover", 16: "Crankshaft", 17: "Cylinder", 18: "Cylinder head",
  19: "Cylinder head cover", 20: "Electrical", 21: "Footrest", 23: "Frame", 25: "Frame cover (GS750B)", 26: "Front brake hose (GS750B)", 28: "Front calipers (GS750B)",
  30: "Front fork (GS750B)", 32: "Front master cylinder (GS750B)", 34: "Front wheel (GS750)", 36: "Fuel cock", 37: "Fuel tank (GS750B)", 40: "Gear shifting",
  41: "Generator", 42: "Handlebar - front fender", 43: "Headlamp", 44: "Kick starter", 45: "LH handle switch (GS750B)", 48: "Muffler", 49: "Oil pan", 50: "Oil pump",
  51: "Rear brake hose", 52: "Rear calipers", 53: "Rear combination lamp", 54: "Rear fender", 55: "Rear master cylinder (GS750B)", 57: "Rear swinging arm",
  58: "Rear wheel (GS750B)", 60: "RH handle switch (GS750B)", 62: "Seat (GS750B)", 65: "Speedometer - tachometer (GS750B)", 67: "Stand", 68: "Starter clutch",
  69: "Starting motor (Mitsuba)", 71: "Steering stem (GS750B)", 74: "Transmission", 75: "Turn signal lamp", 77: "Wiring harness (GS750B)" };
const diagUrl = n => `${CMSNL}BLCK${String(n).padStart(4, "0")}.html`;

const TW_SYSTEMS = [
  ["sys.chassis", "Frame & chassis", "Frame, swingarm, rear shocks, footrests and stands."],
  ["sys.steer", "Steering & front suspension", "Steering stem, triple clamps and the front fork."],
  ["sys.wheels", "Wheels & brakes", "Both wheels, tires, discs, calipers, hoses and master cylinders."],
  ["sys.drive", "Final drive", "Drive chain and sprockets."],
  ["sys.engine", "Engine", "Cases, cylinders, head, covers, starter and the internal rotating parts."],
  ["sys.fuel", "Fuel & intake", "Tank, fuel tap, carburetors, intake boots and airbox."],
  ["sys.exhaust", "Exhaust", "Header pipes and the four mufflers."],
  ["sys.elec", "Electrical", "Harness, ignition, lights, switches and instruments."],
  ["sys.controls", "Controls", "Handlebar, levers and control cables."],
  ["sys.body", "Seat & bodywork", "Seat, side covers and fenders."],
];
/* assembly key → system, diagram groups, explode behaviour, what to move aside for a clear view, confidence */
const TW_ASSY = {
  frame:    { sys: "sys.chassis", d: [23], ex: "radial", conf: "approx" },
  swingarm: { sys: "sys.chassis", d: [57], ex: "z", conf: "approx", clear: ["exhaust", "chain"] },
  shocks:   { sys: "sys.chassis", d: [8], ex: "axis", conf: "approx", clear: ["exhaust", "seat"] },
  pegs:     { sys: "sys.chassis", d: [21, 67, 40], ex: "radial", conf: "approx" },
  stem:     { sys: "sys.steer", d: [71], ex: "fork", conf: "approx", clear: ["headlight", "gauges", "handlebar"] },
  fork:     { sys: "sys.steer", d: [30], ex: "fork", conf: "approx", clear: ["fenders", "headlight"] },
  wheelF:   { sys: "sys.wheels", d: [34], ex: "z", conf: "spec", clear: ["fenders", "brakeF", "caliper"] },
  wheelR:   { sys: "sys.wheels", d: [58], ex: "z", conf: "spec", clear: ["exhaust", "brakeR", "fenders"] },
  tires:    { sys: "sys.wheels", d: [34, 58], ex: "z", conf: "spec", clear: ["fenders"] },
  brakeF:   { sys: "sys.wheels", d: [34], ex: "z", conf: "approx", clear: ["caliper"] },
  caliper:  { sys: "sys.wheels", d: [28], ex: "z", conf: "approx", clear: ["fenders", "hoses"] },
  hoses:    { sys: "sys.wheels", d: [26], ex: "radial", conf: "approx" },
  mcyl:     { sys: "sys.wheels", d: [32], ex: "radial", conf: "approx" },
  brakeR:   { sys: "sys.wheels", d: [52, 55, 51], ex: "z", conf: "approx", clear: ["exhaust"] },
  chain:    { sys: "sys.drive", d: [8], ex: "z", conf: "approx", clear: ["pegs"] },
  cases:    { sys: "sys.engine", d: [14, 49], ex: "radial", conf: "approx", shell: true, clear: ["exhaust", "pegs"] },
  engine:   { sys: "sys.engine", d: [17], ex: "cyl", conf: "approx", shell: true, clear: ["exhaust", "tank", "carbs"] },
  head:     { sys: "sys.engine", d: [18, 19], ex: "cyl", conf: "approx", shell: true, clear: ["tank", "ignition", "harness"] },
  clutch:   { sys: "sys.engine", d: [15, 9], ex: "z", conf: "approx", shell: true, clear: ["pegs", "exhaust"] },
  alt:      { sys: "sys.engine", d: [13, 41], ex: "z", conf: "approx", shell: true, clear: ["pegs", "chain"] },
  starter:  { sys: "sys.engine", d: [69, 68], ex: "radial", conf: "approx", clear: ["carbs", "airbox", "tank"] },
  carbs:    { sys: "sys.fuel", d: [5], ex: "carbs", conf: "approx", clear: ["airbox", "tank", "coverL", "coverR", "seat"] },
  boots:    { sys: "sys.fuel", d: [5], ex: "radial", conf: "approx", clear: ["carbs", "tank"] },
  airbox:   { sys: "sys.fuel", d: [1], ex: "radial", conf: "approx", clear: ["seat", "coverL", "coverR", "tank"] },
  tank:     { sys: "sys.fuel", d: [37], ex: "radial", conf: "approx" },
  tap:      { sys: "sys.fuel", d: [36], ex: "radial", conf: "approx", clear: ["tank", "coverL"] },
  exhaust:  { sys: "sys.exhaust", d: [48], ex: "radial", conf: "approx" },
  harness:  { sys: "sys.elec", d: [77, 20], ex: "radial", conf: "approx", clear: ["tank", "seat", "coverL", "coverR"] },
  ignition: { sys: "sys.elec", d: [11, 20], ex: "radial", conf: "approx", clear: ["tank"] },
  headlight:{ sys: "sys.elec", d: [43], ex: "x", conf: "approx" },
  sigF:     { sys: "sys.elec", d: [75], ex: "radial", conf: "approx" },
  tail:     { sys: "sys.elec", d: [53], ex: "radial", conf: "approx" },
  switches: { sys: "sys.elec", d: [45, 60], ex: "radial", conf: "approx" },
  gauges:   { sys: "sys.elec", d: [65], ex: "radial", conf: "approx" },
  handlebar:{ sys: "sys.controls", d: [42], ex: "radial", conf: "approx" },
  controls: { sys: "sys.controls", d: [42, 10], ex: "radial", conf: "approx" },
  seat:     { sys: "sys.body", d: [62], ex: "radial", conf: "approx" },
  coverL:   { sys: "sys.body", d: [25], ex: "z", conf: "approx" },
  coverR:   { sys: "sys.body", d: [25], ex: "z", conf: "approx" },
  fenders:  { sys: "sys.body", d: [42, 54], ex: "radial", conf: "approx" },
  /* internal assemblies (built on demand by twin_internals.js) */
  crank:    { sys: "sys.engine", d: [16], ex: "z", conf: "schematic", internal: true, label: "Crankshaft & connecting rods", part: "INV-0005", blurb: "Four-throw crankshaft with its connecting rods.", clear: ["cases", "engine", "head", "clutch", "alt", "exhaust", "carbs", "pegs", "ignition", "starter"] },
  pistons:  { sys: "sys.engine", d: [16], ex: "cyl", conf: "schematic", internal: true, label: "Pistons, rings & pins", part: "INV-0004", blurb: "Four pistons with ring packs, wrist pins and circlips.", clear: ["engine", "head", "exhaust", "carbs", "tank", "ignition"] },
  valvetrain:{ sys: "sys.engine", d: [4], ex: "cyl", conf: "schematic", internal: true, label: "Camshafts & valve train", part: "INV-0006", blurb: "Intake and exhaust camshafts, 8 tappets with shims, valves and springs.", clear: ["head", "tank", "ignition", "harness", "carbs"] },
  camchain: { sys: "sys.engine", d: [3], ex: "radial", conf: "schematic", internal: true, label: "Cam chain, sprockets & guides", part: "INV-0007", blurb: "Drives both camshafts from the crankshaft.", clear: ["head", "engine", "tank", "ignition"] },
  clutchpack:{ sys: "sys.engine", d: [9], ex: "z", conf: "schematic", internal: true, label: "Clutch basket, plates & springs", part: "INV-0008", blurb: "Primary driven gear/basket, drive and driven plates, pressure plate and springs.", clear: ["clutch", "pegs", "exhaust"] },
  gearbox:  { sys: "sys.engine", d: [74], ex: "radial", conf: "schematic", internal: true, label: "Transmission shafts & gears", part: "INV-0009", blurb: "Five-speed constant-mesh gearbox: input and output shafts.", clear: ["cases", "clutch", "alt", "pegs", "exhaust", "chain"] },
  oilpump:  { sys: "sys.engine", d: [50], ex: "radial", conf: "schematic", internal: true, label: "Oil pump", part: "INV-0010", blurb: "Trochoid oil pump driven from the clutch side.", clear: ["cases", "clutch", "exhaust", "pegs"] },
  carbguts: { sys: "sys.fuel", d: [5], ex: "carbguts", conf: "schematic", internal: true, label: "Carburetor 1 internals", part: "INV-0011", blurb: "Slide, needle, main jet, pilot jet, needle jet, float and float needle for one carburetor.", clear: ["airbox", "tank", "coverL", "coverR", "seat"] },
  forkguts: { sys: "sys.steer", d: [30], ex: "fork", conf: "schematic", internal: true, label: "Fork internals (right leg)", part: "INV-0020", blurb: "Fork spring, damper rod (cylinder), rebound spring, oil lock piece and seal.", clear: ["fenders", "headlight"] },
  calguts:  { sys: "sys.wheels", d: [28], ex: "z", conf: "schematic", internal: true, label: "Front caliper internals", part: "INV-0029", blurb: "Piston, seal, boot and pads.", clear: ["fenders"] },
  axleF:    { sys: "sys.wheels", d: [34], ex: "z", conf: "schematic", internal: true, label: "Front axle, bearings & spacers", part: "INV-0024", blurb: "Axle, two hub bearings, centre spacer, side spacers and dust seals.", clear: ["fenders"] },
};
/* which assembly's shell has to be ghosted/moved to see each internal assembly */
const TW_SHELLS = { crank: ["cases", "engine", "clutch", "alt", "ignition"], pistons: ["engine", "head"], valvetrain: ["head"], camchain: ["head", "engine"], clutchpack: ["clutch"], gearbox: ["cases", "clutch", "alt"], oilpump: ["cases", "clutch"], carbguts: ["carbs"], forkguts: ["fork"], calguts: ["caliper"], axleF: ["wheelF", "brakeF"] };
const TW_CONF = { spec: ["Spec-checked size", "Overall size matches a published specification. Detail shape is still approximate."], approx: ["Approximate", "Shape and position estimated from photos, diagrams and published dimensions. Not factory CAD."], schematic: ["Schematic internal", "Built so you can see how the parts relate. Sizes and shapes are not measured and must not be used for machining or ordering."] };
/* components listed in the parts diagrams that are NOT modeled yet (shown greyed in the tree) */
const TW_MISSING = {
  valvetrain: ["Valve guides", "Valve stem oil seals", "Valve spring seats (lower)", "Cotters / keepers"],
  crank: ["Crank main bearings (individual shells)", "Crankcase oil seals", "Primary drive gear detail"],
  gearbox: ["Shift forks", "Shift drum", "Gear-shift shaft & pawls", "Neutral switch", "Bearings & circlips"],
  clutchpack: ["Clutch push rod & release mechanism", "Needle bearing", "Oil pump drive gear"],
  carbguts: ["Pilot air screw", "Starter (choke) plunger", "Float bowl gasket", "Throttle return springs"],
  engine: ["Base gasket", "Dowel pins", "Cylinder O-rings"],
  head: ["Head gasket", "Spark plugs (inside plug wells)", "Tachometer drive gear"],
  cases: ["Oil strainer", "Oil pressure switch", "Breather"],
  starter: ["Starter clutch", "Starter idle gear"],
  harness: ["Individual connectors", "Ground points", "Fuse box", "Rectifier & regulator", "Battery"],
  forkguts: ["Inner tube bushings", "Dust boots (if fitted)", "Drain screws"],
  wheelF: ["Speedometer gear box internals", "Wheel balancers"], wheelR: ["Rear hub cush drive", "Sprocket carrier bearing"],
  pegs: ["Kick starter (diagram group 44)", "Gear-shift linkage internals"],
};
/* published figures used to size the model; anything not here is an estimate */
const TW_SPECS = [
  ["Model designation", "GS750 (B), 1977, USA (E03)", "CMSNL parts catalogue model 34273", CMSNL],
  ["Wheelbase", "1,490 mm", "Suzuki Global digital archive (GS750, 1976) and suzukicycles.org (GS750DB 1977)", "https://www.globalsuzuki.com/motorcycle/smgs/digital-archive/2_bike/ss4_036.php"],
  ["Overall length × width × height", "2,225 × 855 × 1,170 mm", "Suzuki Global digital archive; suzukicycles.org", "https://mail.suzukicycles.org/GS-series/GS750.shtml"],
  ["Bore × stroke", "65.0 × 56.4 mm (748 cc)", "Suzuki Global digital archive", "https://www.globalsuzuki.com/motorcycle/smgs/digital-archive/2_bike/ss4_036.php"],
  ["Tires", "3.25H-19 front, 4.00H-18 rear", "Suzuki Global digital archive", "https://www.globalsuzuki.com/motorcycle/smgs/digital-archive/2_bike/ss4_036.php"],
  ["Wheels", "Wire-spoke (cast wheels arrived on the GS750E in 1978)", "suzukicycles.org", "https://mail.suzukicycles.org/GS-series/GS750.shtml"],
  ["Carburetors", "Mikuni VM26SS × 4 (general GS750 table)", "suzukicycles.org", "https://mail.suzukicycles.org/GS-series/GS750.shtml"],
  ["Transmission", "5-speed constant mesh", "Suzuki Global digital archive", "https://www.globalsuzuki.com/motorcycle/smgs/digital-archive/2_bike/ss4_036.php"],
  ["Front brake", "UNRESOLVED: modeled as a single disc. Sources conflict (Suzuki archive says twin discs came in Jan 1978; suzukicycles.org says twin in one place, single in another).", "Check your own hub and fork legs", ""],
  ["Exhaust", "4-into-4 (modeled). Not confirmed by a cited source here.", "VERIFY against your bike", ""],
  ["Tappet count", "8 tappets with shims", "CMSNL diagram: Camshaft - valve", diagUrl(4)],
];
const TW_SOURCES = [
  ["CMSNL parts catalogue, GS750 1977 (B) USA (E03)", CMSNL, "Component names, groupings and assembly relationships for every diagram group listed per assembly. Diagrams are not used as dimensioned drawings."],
  ["Suzuki Global digital archive: 1976 GS750", "https://www.globalsuzuki.com/motorcycle/smgs/digital-archive/2_bike/ss4_036.php", "Overall dimensions, wheelbase, bore/stroke, tire sizes."],
  ["suzukicycles.org GS750 page", "https://mail.suzukicycles.org/GS-series/GS750.shtml", "1977 GS750DB dimensions, wire wheels, carburetor type, model-year differences."],
  ["Crossbay Motorsports parts finder (1977-79 GS750)", "https://www.crossbaymotorsports.com/Parts/Parts-Finder/suzuki/motorcycles/1977/gs750-bcecnen-1977-1979", "Second parts-diagram reference (not yet cross-checked part by part)."],
  ["Factory service manual (1977-78 GS750)", "https://www.repairmanual.com/product/1977-1978-suzuki-gs750-motorcycle-factory-repair-service-manual-r-sr-8001/", "NOT consulted here. Needed for every dimension, clearance, torque and disassembly order."],
];
