/* ============ Course content, page guidance, parts shops ============ */
const LESSONS = {
  A: { title: "Get set up", img: "l-A", focus: null, short: "Confirm which GS750 you have, set up the workshop, photograph everything and set a budget.",
    about: "Before touching a wrench, confirm exactly which GS750 you have, set up a clean and safe work area, photograph every box and bag, and decide on a budget. It feels slow, but it prevents expensive mistakes later.",
    why: "1977 GS750s were sold in different versions (model letters like B, E and EC, plus different markets). The version decides which part numbers, wiring diagram and carburetor settings are right for your bike.",
    tips: ["Write down the frame and engine numbers, but keep them out of photos you post online.", "Photograph every tray, bag and assembly before you move or clean anything. Those photos are your reassembly guide.", "Have a fire extinguisher, gloves, eye protection and good airflow before using cleaners or solvents."],
    shops: ["cmsnl", "partzilla", "gsr"] },
  B: { title: "Count & check every part", img: "l-B", focus: null, short: "Label every part, count the hardware and note what shape each piece is in.",
    about: "Give every part and bag an ID, count the bolts and spacers, and write down the condition of each piece. This becomes your master parts list, and every other page in this app uses it.",
    why: "You can't plan the budget or order parts until you know what's missing, damaged or still good.",
    tips: ["Label bags with masking tape and a marker. Write the part ID and where it came from.", "Egg cartons and muffin tins are great for keeping small hardware in order.", "Compare what you have against the official parts diagrams to spot missing pieces."],
    shops: ["cmsnl", "partzilla", "ebay"] },
  C: { title: "Research, budget & order", img: "l-C", focus: "gauges", short: "Get the factory manual and parts diagrams, forecast costs, and order once fitment is confirmed.",
    about: "Get the factory service manual and the parts diagrams for your exact model, build a cost forecast from what you found, and order parts only after you've confirmed they fit.",
    why: "Numbers like torque values, valve clearances and wear limits must come from the factory manual for your model. Guessed numbers can wreck an engine or cause a crash.",
    tips: ["Buy gaskets and seals as sets. It's usually cheaper than one at a time.", "Compare the total delivered price (parts + shipping + tax), not just the sticker price.", "Save every receipt in Photos & files so the budget stays accurate."],
    shops: ["manuals", "cmsnl", "partzilla", "z1", "ebay"] },
  D: { title: "Clean & inspect", img: "l-D", focus: "frame", short: "Clean parts in small batches, look closely for damage, and plan your measurements.",
    about: "Clean parts in small, organized batches, then inspect them closely: frame, rubber parts and anything that wears. Write a measurement plan for the parts the manual says to measure.",
    why: "Dirt and grease hide cracks, rust and wear. You can only judge a part once it's clean.",
    tips: ["Protect threads, bearing seats and machined surfaces when blasting or wire-brushing.", "Old rubber (fuel lines, brake hoses, intake boots) is usually hard and cracked. Plan to replace it.", "Take before-and-after photos of each batch."],
    shops: ["z1", "allballs"] },
  E: { title: "Engine & transmission", img: "l-E", focus: "engine", short: "Inspect, take apart only as far as needed, measure, decide on machine work, then rebuild.",
    about: "Inspect the engine from the outside, take it apart only as far as needed, measure the wear parts, decide what needs a machine shop, then rebuild it carefully and set cam timing and valve clearances.",
    why: "The engine is the most expensive part to get wrong. Measuring first stops you replacing good parts or reusing worn ones.",
    tips: ["Bag and label every shim, bolt and bearing by where it came from.", "Never guess a torque value. Use the factory manual for your exact engine.", "After assembly, turn the engine over by hand before it ever runs."],
    shops: ["z1", "cmsnl", "partzilla", "gsr"] },
  F: { title: "Frame, wheels, suspension & brakes", img: "l-F", focus: "fork", short: "Check the frame, steering, forks, shocks, wheels, tires, chain and brakes.",
    about: "Check the frame for damage, then inspect the steering bearings, swingarm, forks, rear shocks, wheels, tires, chain and both brakes. Rebuild or replace whatever is worn.",
    why: "These parts keep the bike upright and stop it. Almost all of them are safety-critical, so they get an independent check.",
    tips: ["Tires age out even with tread left. Check the four-digit date code on the sidewall.", "If you're unsure about a brake hose or seal, replace it.", "Bleed the brakes with fresh fluid of the type printed on the reservoir cap."],
    shops: ["allballs", "revzilla", "denniskirk", "z1"] },
  G: { title: "Electrical & wiring", img: "l-G", focus: "headlight", short: "Find the right wiring diagram, check every wire and connector, then test each circuit.",
    about: "Identify the right wiring diagram, check every wire, connector and ground, then test circuits one at a time: charging, ignition, lights, switches, horn and gauges.",
    why: "Old wiring causes most no-start and charging problems, and damaged wiring can cause a fire.",
    tips: ["Test with the battery disconnected first, then reconnect when the circuits check out.", "Clean ground connections down to bare metal.", "Replace any connector that is melted, green or loose."],
    shops: ["ricks", "z1", "gsr"] },
  H: { title: "Paint & refinish", img: "l-H", focus: "tank", short: "Choose original or custom paint, mask the right surfaces, then refinish.",
    about: "Decide on original-style paint or a custom finish, mask machined and bearing surfaces, then refinish the frame, tank, covers and engine cases.",
    why: "A good finish stops rust, but paint or powder in the wrong place (threads, bearing seats, ground points) causes problems during assembly.",
    tips: ["Fix rust and pinholes in the tank before any paint goes on.", "Write down every product you use and its cure time.", "Never blast an engine that still has its internals inside."],
    shops: ["caswell", "por15", "ebay"] },
  I: { title: "Rebuild the subassemblies", img: "l-I", focus: "carbs", short: "Rebuild forks, wheels, brakes, carbs, fuel tank and exhaust as finished units.",
    about: "Rebuild the forks, wheels, brakes, carburetors, fuel tank and intake/exhaust as complete units on the bench before final assembly.",
    why: "Finished subassemblies make final assembly faster, and you can test each one before it goes on the bike.",
    tips: ["Rebuild the carbs as a set and keep each carb's parts separate.", "Write down every jet size and float height you find before changing anything.", "An ultrasonic cleaner helps clear tiny carb passages."],
    shops: ["sudco", "z1", "gsr", "caswell"] },
  J: { title: "Put it back together", img: "l-J", focus: "harness", short: "Install suspension, wheels, brakes, engine, wiring, controls, carbs and exhaust.",
    about: "Install the steering, suspension, wheels, brakes, engine, wiring harness, controls, carburetors and exhaust onto the finished frame.",
    why: "The order matters. For example, the harness needs routing before parts block the path.",
    tips: ["Get a helper to lift the engine into the frame.", "Protect fresh paint with tape where tools or parts might rub.", "Route cables and wires the way your before-photos show."],
    shops: ["z1", "cmsnl"] },
  K: { title: "Fluids, adjustments & pre-start", img: "l-K", focus: "cases", short: "Fill oil, adjust cables, test wiring, leak-test fuel and run the pre-start checklist.",
    about: "Fill the oil, adjust the throttle and clutch cables, test the wiring before connecting the battery, leak-test the fuel system, check fasteners and finish the pre-start checklist.",
    why: "These checks protect a fresh engine from damage in its first seconds of running.",
    tips: ["Follow the manual's oil priming steps for a rebuilt engine.", "Make sure the throttle snaps closed by itself with the bars turned fully left and right.", "Keep a fire extinguisher within reach during fuel tests."],
    shops: ["revzilla", "denniskirk"] },
  L: { title: "First start", img: "l-L", focus: "exhaust", short: "Start it in a safe spot, watch for leaks and noises, then sync the carbs.",
    about: "Start the engine in a safe, well-ventilated area, watch for leaks, strange noises, smoke and charging, then synchronize the carbs and set the idle.",
    why: "The first few minutes show problems early, while they're still cheap to fix.",
    tips: ["Never run the engine indoors with the doors closed.", "Have a helper ready at the kill switch.", "Let it cool, then recheck for leaks and loose parts."],
    shops: ["sudco", "gsr"] },
  M: { title: "Safety check & first ride", img: "l-M", focus: "caliper", short: "Independent inspection, lights and legal equipment, then a careful low-speed test.",
    about: "Have someone else inspect the brakes, tires, wheels, steering and suspension, check the lights and legal equipment, then do a careful low-speed test.",
    why: "A second set of eyes catches what the builder misses. This is the last gate before the road.",
    tips: ["Test in a quiet, legal area with no traffic.", "Try the brakes at walking speed first.", "Re-inspect everything after the first ride."],
    shops: ["revzilla", "denniskirk"] },
  N: { title: "Wrap up & keep it running", img: "l-N", focus: null, short: "Reconcile receipts and parts, build a maintenance schedule and back everything up.",
    about: "Reconcile the receipts, labor and parts, build a maintenance schedule from the factory manual, and archive the project records.",
    why: "Good records make future maintenance easy and add value if you ever sell the bike.",
    tips: ["Download a full backup from Settings.", "Log every service in the Maintenance log.", "Keep the factory manual with the bike's records."],
    shops: ["manuals", "gsr"] },
};
const SHOPS = {
  cmsnl: { name: "CMSNL", url: "https://www.cmsnl.com/suzuki-gs750b-1977-b-usa-e03_model16048/partslist/", short: "Original Suzuki parts diagrams", what: "Official exploded diagrams and part numbers for the 1977 GS750B (USA). Many original parts are still listed.", tags: ["Original parts", "Diagrams"] },
  partzilla: { name: "Partzilla", url: "https://www.partzilla.com/catalog/suzuki/motorcycle/1977/gs750b", short: "Suzuki diagrams, US shipping", what: "Original-equipment Suzuki diagrams and part numbers for the 1977 GS750B, shipped from the US.", tags: ["Original parts", "Diagrams"] },
  z1: { name: "Z1 Enterprises", url: "https://www.z1enterprises.com", short: "Vintage Japanese bike parts", what: "Gaskets, seals, cables, carb kits, electrical and hardware for 1970s–80s Japanese bikes, including Suzuki GS models.", tags: ["Gaskets", "Carb kits", "Hardware"] },
  sudco: { name: "Sudco", url: "https://www.sudco.com", short: "Mikuni carb parts", what: "Mikuni carburetor jets, needles and rebuild parts. Handy once you know your exact carb model.", tags: ["Carburetors"] },
  ricks: { name: "Rick's Motorsport Electrics", url: "https://ricksmotorsportelectrics.com", short: "Charging & starting parts", what: "Regulator/rectifiers, stators, starter motors and other charging and ignition parts.", tags: ["Electrical"] },
  allballs: { name: "All Balls Racing", url: "https://www.allballsracing.com", short: "Bearings & seals", what: "Wheel bearings, steering-head bearings, fork seals and swingarm kits.", tags: ["Bearings", "Seals"] },
  revzilla: { name: "RevZilla", url: "https://www.revzilla.com", short: "Tires, chains, batteries", what: "Tires, chains, sprockets, batteries, tools and riding gear.", tags: ["Tires", "Chain", "Tools"] },
  denniskirk: { name: "Dennis Kirk", url: "https://www.denniskirk.com", short: "Tires & consumables", what: "Tires, brake pads, chains, filters and everyday consumables.", tags: ["Tires", "Brakes"] },
  ebay: { name: "eBay Motors", url: "https://www.ebay.com/sch/i.html?_nkw=suzuki+gs750+1977", short: "Used & new-old-stock parts", what: "Used original parts and new old stock. Check photos and part numbers carefully before buying.", tags: ["Used", "Hard to find"] },
  gsr: { name: "The GS Resources", url: "https://www.thegsresources.com", short: "GS owners' community", what: "A long-running community for vintage Suzuki GS owners: how-tos, troubleshooting and parts advice.", tags: ["Help", "Forum"] },
  manuals: { name: "Haynes / Clymer manuals", url: "https://haynes.com", short: "Repair manuals", what: "Repair manuals that cover the GS750. Still try to get the factory service manual for exact specs.", tags: ["Manuals"] },
  caswell: { name: "Caswell", url: "https://www.caswellplating.com", short: "Tank sealer kits", what: "Fuel-tank sealer kits and plating supplies.", tags: ["Fuel tank", "Plating"] },
  por15: { name: "POR-15", url: "https://www.por15.com", short: "Rust & tank coatings", what: "Rust-prevention coatings and fuel-tank repair kits.", tags: ["Rust", "Fuel tank"] },
};
const CAT_SHOPS = { Engine: ["z1", "cmsnl", "partzilla"], Fuel: ["sudco", "z1", "caswell"], Exhaust: ["z1", "cmsnl"], Electrical: ["ricks", "z1", "cmsnl"], Chassis: ["allballs", "z1", "partzilla"], Wheels: ["allballs", "revzilla", "denniskirk"], Brakes: ["z1", "partzilla", "denniskirk"], "Final drive": ["revzilla", "denniskirk"], Controls: ["z1", "partzilla"], Cosmetics: ["cmsnl", "partzilla"], Hardware: ["z1", "cmsnl"], Consumables: ["z1", "allballs"] };
function shopLinksFor(p) {
  const keys = CAT_SHOPS[p.category] || ["cmsnl", "partzilla"];
  const list = keys.map(k => SHOPS[k]);
  list.push({ name: "Search eBay for this part", url: "https://www.ebay.com/sch/i.html?_nkw=" + encodeURIComponent("suzuki gs750 " + p.name.replace(/[\/()]/g, " ")), short: "Used and new-old-stock listings" });
  return list;
}
const SUGGESTIONS = [
  ["Get the factory service manual first", "Every spec in this app says VERIFY until it comes from the manual for your exact model."],
  ["Buy rebuild kits as sets", "Gasket sets, carb kits and seal kits usually cost less than single pieces and nothing gets missed."],
  ["Replace old rubber", "Fuel lines, brake hoses, intake boots and tires harden with age even if they look fine."],
  ["Compare the delivered price", "Add shipping and tax before deciding which shop is cheapest."],
  ["Check part numbers twice", "1977 parts can differ by model letter. Match numbers to your bike's diagram before ordering."],
  ["Ask the community", "GS owners have solved most problems before. Search the forum before buying something expensive."],
];
const PART_IMG = {}; PROTO.forEach(([k, , pid]) => { if (!PART_IMG[pid]) PART_IMG[pid] = "img/g-" + k + ".svg"; });
const CAT_ICON = { Engine: "engine", Fuel: "fuel", Exhaust: "engine", Chassis: "wheel", Wheels: "wheel", Brakes: "wheel", "Final drive": "wheel", Electrical: "bolt", Cosmetics: "spray", Hardware: "wrench", Consumables: "wrench", Controls: "hand", Miscellaneous: "box" };
const partImg = p => PART_IMG[p.id] ? `<img src="${PART_IMG[p.id]}" alt="" loading="lazy">` : ic(CAT_ICON[p.category] || "box");
const MODULE_IMG = { engine: "d-engine", fuel: "l-I", electrical: "d-cockpit", chassis: "d-wheel", finish: "d-tank" };
const MODULE_GROUP = { engine: "engine", fuel: "carbs", electrical: "headlight", chassis: "fork", finish: "tank" };

const GUIDE = {
  home: { how: ["Follow <b>The course</b> from Part 1 to Part 14. Each part explains what to do, why, and what tools you need.", "Tick steps off as you finish them. Progress updates everywhere automatically.", "Jump to anything, any time, from the menu or the search box at the top."] },
  course: { eyebrow: "Step by step", title: "The restoration course", sub: "Fourteen parts, in the order the work usually happens. Some parts can run side by side; each one tells you what it's waiting on.", how: ["Open a part to see the steps, tools, tips and parts shops for it.", "You don't have to finish one part before peeking at the next. Steps that are waiting on earlier work are clearly marked.", "Green means done, tan means up next."] },
  diagrams: { eyebrow: "Learn", title: "Technical diagrams", sub: "Exploded views, sections and step sequences for the GS750 (B). Every part is selectable and linked to your inventory. Each diagram says where it comes from and how far it's verified.", howOff: [] },
  viewer: { eyebrow: "Explore", title: "3D garage", sub: "A part-by-part 3D model of the 1977 GS750 (B).", howOff: [] },
  inventory: { eyebrow: "Everything on the bench", title: "Parts", sub: "Every part of the bike, where it's stored and how far along it is.", how: ["Click any part to see its details, change its status, add photos or find where to buy it.", "Use the filters to narrow the list, for example everything in the engine or everything still untouched.", "Switch to the table view to update many parts at once."] },
  tasks: { eyebrow: "What needs doing", title: "To-do list", sub: "Every step from the course in one list. The course pages are the easiest way to work through them.", how: ["Tick a step off by changing its status to Complete.", "\"Ready to start\" shows steps whose earlier steps are done.", "The board view lets you drag steps between columns."] },
  budget: { eyebrow: "Money", title: "Money overview", sub: "What you've spent, what you've ordered, and what's still coming.", how: ["Log an expense whenever money is spent. Link it to the order it paid for so nothing is counted twice.", "<b>Paid</b> is cash out. <b>Ordered</b> means bought but not paid yet. <b>Planned</b> is what you still expect to spend.", "Set the budget and safety cushion (contingency) in Settings."] },
  purchasing: { eyebrow: "Money", title: "Shopping list", sub: "Parts you need, quotes you've collected and orders on the way.", how: ["Add a request for anything you need to buy, linked to the part it's for.", "Add more than one quote for the same part to compare total delivered prices.", "When an order arrives, check it fits and mark its quality check."] },
  shops: { eyebrow: "Money", title: "Where to buy parts", sub: "Trusted places to find parts, diagrams and help for a 1977 GS750. Prices change, so the app never guesses them.", how: ["Start with the official diagrams (CMSNL or Partzilla) to get the right part number.", "Then compare prices across shops, including shipping.", "Every part's detail panel also has its own \"Where to find it\" links."] },
  gates: { eyebrow: "Safety", title: "Safety checks", sub: "The checkpoints that prove the bike is safe. It can't be marked road-ready until every one passes.", how: ["Each gate needs its steps finished, a written result, a reviewer and a date.", "Critical checks need the person who did the check and the date.", "A failed check blocks road-ready until a re-check passes."] },
  inspections: { eyebrow: "Quality", title: "Measurements & inspections", sub: "Every check and measurement, with the limits from the factory manual.", how: ["Fill in the factory spec and page only from the factory manual. Until then it shows VERIFY.", "Record the actual measurement, the tool, and who did it.", "A part only turns green once its inspections pass."] },
  docs: { eyebrow: "Records", title: "Photos & files", sub: "Before, during and after photos, receipts, diagrams and notes.", how: ["Upload photos straight from your phone. They're shrunk so they fit.", "Link each photo to a part or step so it shows up there too.", "Keep large PDFs in a shared drive and add them as links."] },
  problems: { eyebrow: "Records", title: "Problems & decisions", sub: "Log surprises as they come up, and record the big choices once.", how: ["Add a problem for anything damaged, missing, worn or confusing.", "High-severity problems show at the top until they're resolved.", "Decisions capture choices like original vs. aftermarket parts so nobody has to re-argue them."] },
  team: { eyebrow: "People", title: "Team & work log", sub: "Who's working on the bike and what they did.", how: ["Add everyone who works on the bike, with a role. Inspectors can sign off checks.", "Log each work session with hours and notes for whoever is next.", "Choose who you are on this device under \"I'm working as\"."] },
  maintenance: { eyebrow: "After the build", title: "Maintenance log", sub: "Service history once the bike is on the road.", how: ["Log every service with the date and odometer reading.", "Service intervals only come from the factory manual or your rebuilder's instructions."] },
  settings: { eyebrow: "Admin", title: "Settings & backups", sub: "Project details, budget settings and backups.", how: ["Set your budget and safety cushion here.", "Download a full backup before big changes.", "Import a backup to restore it."] },
  help: { eyebrow: "Help", title: "How everything works" },
  paint: { eyebrow: "Paint studio", title: "Colors, finishes & how to paint", sub: "Try colors on the bike, plan which finish each part gets, and follow the right order for painting the tank and parts.", how: ["Pick a tank color, frame finish and pinstripe. The picture updates as you go. Press <b>See it in 3D</b> for your exact choice.", "Save the scheme so the whole team (and the 3D bike) use it.", "Fill in the repaint plan, then follow the tank steps from 01 to 12."] },
  videos: { eyebrow: "Watch & learn", title: "GS750 restoration video series", sub: "A 20-part YouTube series by plaxsax following one GS750 from tired to finished. Watch it alongside the course.", how: ["Press play on any part and it opens on YouTube in a new tab.", "Tick <b>Watched</b> when you finish one. The whole team sees it.", "This is someone else's bike, so check anything you copy against your factory manual."] },
  guides: { eyebrow: "Learn", title: "Guides", sub: "Short, plain-language guides to the systems on a GS750. Read one before you start that part of the course.", how: ["Pick a topic to read it.", "Every guide has an <b>Ask</b> button if something isn't clear."] },
  engine: { eyebrow: "Workshop area", title: "Engine & transmission", sub: "Assessment, teardown, measurement, machine-shop decisions and rebuild.", how: ["Work the procedure top to bottom; tick each step's status as you go.", "Open the 3D view to pull the engine out and see how it fits together.", "Measurements must come from the factory manual."] },
  fuel: { eyebrow: "Workshop area", title: "Carburetors & fuel", sub: "Carb identification and rebuild, fuel tank, petcock, lines, sync and leak tests.", how: ["Record carb markings and settings before changing anything.", "Rebuild the four carbs as a set.", "Leak-test before the first start."] },
  electrical: { eyebrow: "Workshop area", title: "Electrical system", sub: "Harness, connectors, grounds, charging, ignition, lights and gauges.", how: ["Find the right wiring diagram first.", "Test circuit by circuit with the battery disconnected.", "Note anything you replace with aftermarket parts."] },
  chassis: { eyebrow: "Workshop area", title: "Frame, wheels & brakes", sub: "Frame, steering, swingarm, forks, shocks, wheels, tires, chain and brakes.", how: ["Most items here are safety-critical and need an independent check.", "Check tire date codes, not just tread.", "Bleed brakes with the fluid type on the reservoir cap."] },
  finish: { eyebrow: "Workshop area", title: "Cleaning & paint", sub: "Degreasing, rust removal, paint, powder coat, chrome and seat.", how: ["Record products and cure times.", "Mask machined, bearing and sealing surfaces.", "Add before-and-after photos for each part."] },
};

/* ============ Specs, paint studio, guides ============ */
const SPECS = [["748 cc", "air-cooled inline four"], ["DOHC", "two valves per cylinder"], ["4 × Mikuni", "VM26SS slide carburetors"], ["5-speed", "chain final drive"], ["19\" / 18\"", "wire-spoke wheels"], ["Disc", "brakes front and rear"]];
const SPEC_SOURCE = { name: "MotorcycleSpecs: Suzuki GS750 (1976-77)", url: "https://www.motorcyclespecs.co.za/model/suzu/suzuki_gs750%2076.htm" };
const GALLERY = [["d-engine", "The engine", "Finned DOHC inline four with polished covers.", "engine"], ["d-wheel", "Front end", "19-inch wire wheel, single disc and fork.", "brakeF"], ["d-cockpit", "Cockpit", "Speedo, tach and indicator lights.", "gauges"], ["d-tank", "Fuel tank", "Teardrop tank with pinstripes and knee pads.", "tank"], ["d-exhaust", "Exhaust", "Header pipes sweeping into chrome mufflers.", "exhaust"], ["d-rear", "Rear end", "Shocks, chain, sprocket and rear disc.", "shocks"]];
const PAINT_SLUG = nm => "paint-" + nm.toLowerCase().replace(/ /g, "-");
const PAINT_PARTS = [["tank", "Fuel tank", "INV-0012"], ["coverL", "Left side cover", "INV-0047"], ["coverR", "Right side cover", "INV-0048"], ["fenders", "Fenders", "INV-0040"], ["frame", "Frame", "INV-0017"], ["swingarm", "Swingarm", "INV-0018"], ["cases", "Engine cases", "INV-0003"], ["head", "Cylinder head & cam cover", "INV-0002"], ["wheelF", "Front wheel & hub", "INV-0022"], ["wheelR", "Rear wheel & hub", "INV-0023"], ["exhaust", "Exhaust", "INV-0016"], ["headlight", "Headlight bucket", "INV-0038"]];
const FINISH_TYPES = [
  ["Body color (2K base + clear)", "The classic show finish for tank, covers and fenders. Color coats, then a tough two-part clear that stands up to fuel.", "Tank, side covers, fenders"],
  ["Candy (metallic base + tinted clear)", "Deep, glowing color like 1970s candy paint. Harder to match on repairs because the color depends on how many coats go on.", "Tank, side covers"],
  ["Powder coat", "Dry powder baked on at a shop. Thick and chip-resistant. The go-to for frames and swingarms.", "Frame, swingarm, stands, brackets"],
  ["High-temp engine finish", "Paint or clear made for engine heat. Keeps cases looking clean without peeling.", "Engine cases, cylinder fins"],
  ["Polish", "Bare aluminium polished to a shine, then kept clean. No paint at all.", "Cam cover, side covers, clutch cover"],
  ["Chrome plating", "Done by a plating shop. The only true fix for rusty or pitted chrome.", "Fenders, rims, headlight bucket, mufflers"],
  ["Aerosol (1K)", "Budget-friendly cans. Fine for small brackets. Most 1K clears are not fuel-proof, so avoid them on the tank.", "Small brackets, hidden parts"],
];
const TANK_STEPS = [
  ["Make it safe", "Drain the tank, take off the cap, petcock and badges, and rinse it out until it no longer smells of fuel. Fuel fumes can ignite from a spark or heat. Never weld, grind or heat a tank that has held fuel unless a pro has made it vapor-free.", "warn"],
  ["Check it over", "Look inside with a flashlight or borescope for rust, scale and pinholes. Check the outside for dents, cracks near the mounts and old filler. Take photos of the original stripes and decals so you can match them.", "zoom"],
  ["Clean out the inside", "Remove rust with a tank rust remover (or electrolysis if you know how), following the product instructions. Rinse, then dry it right away so flash rust can't form.", "spray"],
  ["Seal it if needed", "If there are pinholes or heavy pitting, use a tank liner kit that's rated for ethanol fuel. Follow the kit's steps exactly, and let it cure fully before any fuel goes in.", "shield"],
  ["Strip the outside", "Remove the old paint with chemical stripper or careful sanding. Gentle blasting media (like soda or plastic) is safer for thin tank metal than sand. Plug every opening first.", "wrench"],
  ["Fix the dents", "Pull or tap out what you can. Fill small low spots with a thin skim of body filler, applied the way the filler maker says (often over epoxy primer). Sand it smooth to the tank's shape.", "hand"],
  ["Prime and block sand", "Spray epoxy primer on bare metal, then a high-build primer. Dust on a light guide coat and block sand until the guide coat disappears evenly. That's how you find low spots.", "move"],
  ["Spray the color", "Wipe down with a wax and grease remover and a tack cloth. Spray light, even coats of base color, waiting the flash time on the product sheet between coats. Candy colors go over a metallic base.", "spray"],
  ["Stripes and decals", "Mask and paint pinstripes, or lay decals, before the clear so the clear protects them. Line them up with your photos of the original.", "star"],
  ["Clear coat", "Spray two or three wet coats of a fuel-resistant clear. Most fuel-proof clears are 2K (two-part) and contain isocyanates, so use a fresh-air respirator or have a shop spray it.", "shield"],
  ["Cure, cut and polish", "Let it cure as long as the clear's data sheet says. Then wet sand any orange peel with very fine paper and polish to a deep shine.", "star"],
  ["Put it back", "Fit new cap and petcock gaskets, protect the paint where the tank touches the frame, and leak-test before you ride.", "tick"],
];
const PARTS_PROCESS = [
  ["Frame and swingarm", "Strip everything off, including steering and swingarm bearings. Mask bearing races, threads and ground points (or have the coater plug them). Powder coat is the toughest option; gloss black is the classic look. Check the frame for cracks first; never coat over damage."],
  ["Side covers and fenders", "Same steps as the tank: strip, repair, prime, color, clear. If a cover is plastic, use an adhesion promoter and a flexible primer made for plastic."],
  ["Engine cases", "Only clean or blast cases that are completely apart, and wash out every passage afterwards; grit inside an engine destroys it. Finish with a high-temp engine paint or clear, or polish the covers."],
  ["Chrome parts", "Light rust on chrome often polishes off with chrome polish and #0000 steel wool. Pitted or peeling chrome needs a plating shop, or a replacement part."],
  ["Wheels", "Take the wheels to a wheel builder to unlace, re-plate or replace rims and spokes, and true them. Paint or polish the hubs while they're apart."],
  ["Exhaust", "Chrome mufflers can't really be painted to look like chrome. Polish, re-chrome or replace. Black parts get high-temp paint."],
];
const PAINT_SAFETY = ["Wear a respirator rated for paint. With 2K (two-part) products, use a fresh-air supplied respirator or let a body shop spray them.", "Spray with plenty of airflow and no flames, heaters or sparks nearby.", "Wear nitrile gloves and eye protection when using strippers and rust removers.", "Keep a fire extinguisher in the paint area.", "Read each product's data sheet. Flash times, cure times and mix ratios come from there, not from guesses."];

const GUIDES = {
  paint: { title: "Paint, powder & chrome", img: "d-tank", sum: "Which finish goes where, and the right order to do it.", sec: "paint" },
  carbs: { title: "Carburetors 101", img: "g-carbs", sum: "How slide carbs work and how to rebuild a set of four.", body: [
    ["What they do", "Each carb mixes fuel with air for one cylinder. A slide moves up when you open the throttle, letting in more air, and a needle on the slide lets in more fuel to match."],
    ["Why they fail", "Old fuel turns to varnish and blocks the tiny jets and passages. Rubber parts harden and leak. Floats stick, so carbs overflow or starve."],
    ["Rebuild basics", "Work on one carb at a time so parts never mix. Photograph everything. Soak and clean the bodies, blow every passage clear, and fit a rebuild kit's new gaskets, O-rings and needle valves. Measure and set float height to the manual's figure."],
    ["Settings", "Jet sizes, needle positions and float height come from the factory manual for your carb model. Write down what you find before changing anything, in case someone modified them."],
    ["After the rebuild", "Once the engine runs, the four carbs are synchronized with gauges so each cylinder pulls the same. Then set the idle."]] },
  electrical: { title: "Electrical testing 101", img: "d-cockpit", sum: "Using a multimeter, finding bad grounds and testing one circuit at a time.", body: [
    ["Your main tool", "A multimeter measures voltage (V), resistance (ohms) and continuity (the beep). Resistance and continuity tests are only done with the power off."],
    ["Start with the basics", "Most electrical trouble on old bikes is bad grounds, dirty connectors and a tired battery. Clean those first."],
    ["One circuit at a time", "Use the wiring diagram for your exact model. Follow one circuit, like the headlight, from the battery through the fuse and switch to the bulb, testing at each connector."],
    ["Charging system", "The alternator makes power and the regulator/rectifier controls it. Testing them uses the procedures and numbers in the factory manual."],
    ["Safety", "Disconnect the battery before working on wiring. A short can melt wires and start a fire."]] },
  brakes: { title: "Brakes 101", img: "g-brakeR", sum: "Hydraulic disc brakes, what wears out and how to bleed them.", body: [
    ["How they work", "Squeezing the lever pushes fluid from the master cylinder to the caliper. The caliper's piston pushes the pads onto the disc."],
    ["What wears out", "Pads, seals, hoses and the fluid itself. Old rubber hoses can swell inside and keep the brake on, or burst."],
    ["Fluid", "Use the DOT type printed on the reservoir cap. Brake fluid strips paint, so cover painted parts and wipe spills straight away."],
    ["Bleeding", "Bleeding pushes air out of the lines. Work from the master cylinder to the caliper, keep the reservoir from running dry, and finish when the lever feels firm with no bubbles."],
    ["Check before riding", "Disc thickness and condition must meet the manual's limits. Test the brakes at walking speed first."]] },
  wheels: { title: "Wheels & tires", img: "d-wheel", sum: "Wire wheels, bearings and how to read a tire's age.", body: [
    ["Wire wheels", "Each wheel has 36 spokes pulling the rim true. Loose or rusted spokes, a bent rim or a wobble (runout) mean a trip to a wheel builder."],
    ["Bearings", "Spin the axle by hand. Any roughness or play means new bearings and seals."],
    ["Tire age", "Find the DOT code on the sidewall. The last four digits are the week and year it was made (for example 2319 = week 23 of 2019). Old rubber gets hard and slippery even with tread left."],
    ["Sizes", "Use the sizes and load and speed ratings the manual calls for. The 1977 GS750 runs a 19-inch front and 18-inch rear."]] },
  measuring: { title: "Measuring tools", img: "x-tools", sum: "Calipers, micrometers, feeler gauges and torque wrenches.", body: [
    ["Calipers", "Good for quick measurements of length, inside and outside diameter, and depth."],
    ["Micrometers", "More precise. Used for things like piston diameter and crank journals."],
    ["Feeler gauges", "Thin steel blades used to measure small gaps, like valve clearances."],
    ["Dial indicator", "Shows tiny movements, like a wobbling disc or wheel (runout)."],
    ["Torque wrench", "Tightens bolts to an exact amount. Use the value from the manual for that exact bolt, and keep the wrench in good condition."]] },
  cleaning: { title: "Cleaning & rust removal", img: "g-cases", sum: "Degreasers, blasting, rust removers and what not to do.", body: [
    ["Degrease first", "Remove oil and grime before anything else, so you can see cracks and wear."],
    ["Blasting", "Bead or soda blasting cleans parts fast, but grit left inside an engine or carb destroys it. Plug openings and clean everything thoroughly afterwards."],
    ["Rust", "Light rust: wire brush or rust remover. Heavy rust on structural parts: inspect carefully before deciding the part is still safe."],
    ["Protect surfaces", "Keep blasting and wire wheels away from bearing seats, gasket faces, threads and machined surfaces."]] },
  organizing: { title: "Labeling & storing parts", img: "l-B", sum: "Keep thousands of pieces in order so reassembly is easy.", body: [
    ["Bag and tag", "Every bag gets the part ID, what it is and where it came from."],
    ["Photograph first", "Take photos before anything comes apart. They're your best reassembly guide."],
    ["Small hardware", "Use egg cartons, muffin tins or a cardboard sheet with bolts pushed through in the shape of the cover they hold."],
    ["Store by area", "Keep engine, chassis and electrical parts in separate, labeled bins, and record the bin in the Parts list."]] },
  safety: { title: "Shop safety", img: "x-safety", sum: "Lifting, chemicals, fuel and fire.", body: [
    ["Lifting", "Engines and frames are heavy and awkward. Lift with a helper or a proper stand."],
    ["Fuel and fumes", "No flames or sparks near fuel. Store fuel and soaked rags safely."],
    ["Chemicals", "Gloves and eye protection for cleaners, strippers and brake fluid. Good airflow always."],
    ["Fire", "Keep a fire extinguisher where you can reach it, especially during first start and fuel tests."],
    ["Before you ride", "Every safety check in the app must pass first."]] },
};
