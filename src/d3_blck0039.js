/* ============ 3D parts model: fuel tank, GS750N,EN 1977 (CMSNL BLCK0039) ============
   Same frame and geometry as the GS750B tank model (d3_blck0037.js, builder D3_TANK_BUILD): +X = rider's LEFT, +Y up, +Z forward.
   Only the ref numbers differ (from the CMSNL page BLCK0039 and its picture).
   Geometry: APPROXIMATE, no factory sizes. VERIFY IN FACTORY SERVICE MANUAL. */
const D3_BLCK0039 = D3_TANK_BUILD({
  id: "CMS-BLCK0039", page: "BLCK0039", title: "Fuel tank (GS750N, EN)", spacerLen: 17,
  refs: { tank: "1", tape: "2", emblem: "7", escrew: "8", cap: "9", gasket: "10", lock: "11", cover: "12", cb: "13", clw: "14", cw: "15", ccush: "16", holder: "17",
    hb: "18", hlw: "19", hw: "20", spring: "21", sscrew: "22", slw: "23", fcush: "24", pad: "25", rc1: "26", rc2: "27", rw: "28", rsp: "29", rb: "30" },
  notModelled: "Refs 3 and 5 are the same tank in other colours, and refs 4 and 6 are the stripe sets for them, so only ref 1 and its stripes (ref 2) are drawn. The stripe layout differs between colours; one outline is drawn. The touch-up paint can in the picture has no row on this page. The filler neck, the front brackets, the rear tab, the cover hinge base and the fuel cock mounting plate are part of the tank. The frame pegs and rear frame bracket belong to the frame and aren't drawn.",
});
D3_MODELS["CMS-BLCK0039"] = D3_BLCK0039;
