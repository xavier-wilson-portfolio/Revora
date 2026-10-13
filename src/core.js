"use strict";
/* ============ utilities ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nowISO = () => new Date().toISOString();
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const n = v => { const x = parseFloat(v); return isFinite(x) ? x : 0; };
const money = v => (v < 0 ? "-" : "") + "$" + Math.abs(n(v)).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const money2 = v => "$" + n(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = v => Math.round(v * 100) + "%";
const fmtDate = s => { if (!s) return ""; const d = new Date(s.length === 10 ? s + "T12:00:00" : s); return isNaN(d) ? s : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); };
const fmtTime = s => { const d = new Date(s); if (isNaN(d)) return ""; const diff = (Date.now() - d) / 1000; if (diff < 60) return "just now"; if (diff < 3600) return Math.floor(diff / 60) + "m ago"; if (diff < 86400) return Math.floor(diff / 3600) + "h ago"; return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); };
const clone = o => JSON.parse(JSON.stringify(o));
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
const VERIFY = "VERIFY IN FACTORY SERVICE MANUAL";
const ICON = {
  camera: '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
  expand: '<path d="M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5"/>', shrink: '<path d="M9 4v5H4 M15 4v5h5 M9 20v-5H4 M15 20v-5h5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', undo: '<path d="M9 14L4 9l5-5 M4 9h10a6 6 0 010 12h-3"/>', refresh: '<path d="M20 11a8 8 0 10-2.3 5.7 M20 4v7h-7"/>',
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>',
  cube: '<path d="M12 2l9 5v10l-9 5-9-5V7z M3 7l9 5 9-5 M12 12v10"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.4"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z M3 13l9 5 9-5 M3 17.5l9 5 9-5"/>',
  route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3 3 0 000-6H9a3 3 0 010-6h7"/>',
  box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10"/>',
  check: '<path d="M9 11l3 3 8-8 M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h9"/>',
  engine: '<path d="M4 9h3l2-3h6l1 3h2v3h2v-2h1v7h-1v-2h-2v3h-3l-2 2H8l-2-3H4z"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  wheel: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 3v7 M12 14v7 M3 12h7 M14 12h7"/>',
  spray: '<path d="M9 9h6v12H9z M10 9V6h4v3 M12 3V2 M17 4l2-1 M17 7h3"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l3 12h11l2-8H6"/>',
  dollar: '<path d="M12 2v20 M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6 M16 4a3.5 3.5 0 010 7 M22 21c0-3-1.5-5-4-5.7"/>',
  gauge: '<path d="M4 18a9 9 0 1116 0 M12 13l4-5"/><circle cx="12" cy="14" r="1.5"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-6-6-9 9"/>',
  alert: '<path d="M12 3l10 18H2z M12 10v5 M12 18v.5"/>',
  shield: '<path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z M9 12l2 2 4-4"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 015 .5c0 1.5-2.5 2-2.5 3.5 M12 17v.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  x: '<path d="M6 6l12 12 M18 6L6 18"/>',
  plus: '<path d="M12 5v14 M5 12h14"/>',
  menu: '<path d="M4 6h16 M4 12h16 M4 18h16"/>',
  download: '<path d="M12 3v12 M7 10l5 5 5-5 M4 21h16"/>',
  fuel: '<path d="M4 21V5a2 2 0 012-2h6a2 2 0 012 2v16 M3 21h12 M14 10h2a2 2 0 012 2v5a1.5 1.5 0 003 0V8l-3-3 M7 7h4"/>',
};
Object.assign(ICON, {
  book: '<path d="M4 4.5A2.5 2.5 0 016.5 2H20v17H6.5A2.5 2.5 0 004 21.5z M4 19.5V4.5 M8 7h8 M8 11h6"/>',
  store: '<path d="M3 9l1.5-5h15L21 9 M3 9h18v2a3 3 0 01-6 0 3 3 0 01-6 0 3 3 0 01-6 0z M5 13v8h14v-8 M10 21v-5h4v5"/>',
  bulb: '<path d="M9 18h6 M10 21h4 M12 3a6 6 0 00-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0012 3z"/>',
  back: '<path d="M15 18l-6-6 6-6"/>', chev: '<path d="M6 9l6 6 6-6"/>', next: '<path d="M9 18l6-6-6-6"/>',
  zoom: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4 M11 8v6 M8 11h6"/>',
  rotate: '<path d="M21 12a9 9 0 11-3-6.7L21 8 M21 3v5h-5"/>',
  move: '<path d="M12 2v20 M2 12h20 M12 2l-3 3 M12 2l3 3 M12 22l-3-3 M12 22l3-3 M2 12l3-3 M2 12l3 3 M22 12l-3-3 M22 12l-3 3"/>',
  hand: '<path d="M9 11V5a1.5 1.5 0 013 0v5 M12 10V4a1.5 1.5 0 013 0v6 M15 10V6a1.5 1.5 0 013 0v8a7 7 0 01-7 7h-1a6 6 0 01-5-3l-2.5-4a1.5 1.5 0 012.5-1.6L9 15V8a1.5 1.5 0 013 0"/>',
  bike: '<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5L9 9h5l4.5 7.5 M9 9l3 7.5h6.5 M14 9l1.5-3H18 M7 9h4"/>',
  play: '<path d="M7 4v16l13-8z"/>', chat: '<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z M8.5 10.5h7 M8.5 13.5h4.5"/>', send: '<path d="M4 12l16-8-6 16-2.5-6.5z M11.5 13.5L20 4"/>', star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  warn: '<path d="M12 3l10 18H2z M12 10v4 M12 17.5v.5"/>', tick: '<path d="M5 12.5l4.5 4.5L19 7"/>', ext: '<path d="M14 4h6v6 M20 4l-9 9 M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',
});
const ic = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k] || ""}</svg>`;

/* ============ schema ============ */
const PART_STATUS = ["Not started", "In progress", "Awaiting parts", "Work complete", "Missing", "Not applicable"];
const TASK_STATUS = ["Not started", "In progress", "Blocked", "Awaiting parts", "Awaiting inspection", "Complete", "Cancelled"];
const PUR_STATUS = ["Research", "Quote", "Requested", "Ordered", "Shipped", "Delivered", "Inspected", "Returned", "Cancelled"];
const RESULT = ["Pending", "Pass", "Fail", "N/A"];
const SEV = ["Low", "Medium", "High", "Critical"];
const MODULES = { engine: "Engine & transmission", fuel: "Carburetors & fuel", electrical: "Electrical", chassis: "Chassis, suspension & brakes", finish: "Cleaning & refinishing", general: "General" };
const ROLES = ["Owner / administrator", "Mechanic / team member", "Inspector / approver", "Read-only viewer"];
const DOC_KINDS = ["Before photo", "During photo", "After photo", "Part ID photo", "Wiring diagram", "Manual reference", "Receipt", "Machine-shop report", "Inspection evidence", "Supplier document", "Restoration note", "Note"];

/* field types: text, textarea, num, money, date, select(opts), ref(coll), refs(coll), bool, url */
const F = (k, label, type = "text", extra = {}) => ({ k, label, type, ...extra });
const SCHEMA = {
  parts: { label: "Part", plural: "Parts", prefix: "INV-", pad: 4, title: "name", fields: [
    F("name", "Part name", "text", { req: 1, full: 1 }), F("oemPn", "OEM part number", "text", { hint: "Only enter numbers verified against the parts fiche for this exact bike." }), F("pnVerified", "Part number verified", "bool"),
    F("category", "Category", "text", { list: "cats" }), F("subsystem", "Subsystem", "text"), F("module", "Module", "select", { opts: Object.keys(MODULES), lbl: MODULES }), F("parent", "Parent assembly", "ref", { ref: "parts" }),
    F("status", "Restoration status", "select", { opts: PART_STATUS }), F("condition", "Condition", "select", { opts: ["Uninspected", "Good", "Serviceable", "Worn", "Damaged", "Corroded", "Unusable", "Missing"] }),
    F("qtyExpected", "Qty expected", "num"), F("qtyFound", "Qty found", "num"), F("qtyServiceable", "Qty serviceable", "num"), F("qtyDamaged", "Qty damaged", "num"), F("qtyMissing", "Qty missing", "num"),
    F("cleaning", "Cleaning status", "select", { opts: ["Required", "In progress", "Done", "Not required"] }), F("replacement", "Replacement required", "select", { opts: ["Unknown", "Yes", "No", "Partial"] }),
    F("classification", "Classification", "select", { opts: ["Unknown", "Original", "Refurbished", "Replacement OEM", "Aftermarket"] }), F("priority", "Priority", "select", { opts: ["Low", "Normal", "High", "Critical"] }),
    F("location", "Storage location", "text"), F("bin", "Bin / label no.", "text"), F("assignee", "Assigned to", "ref", { ref: "team" }), F("estCost", "Estimated cost", "money"),
    F("disposition", "Final disposition", "select", { opts: ["Undecided", "Reuse", "Repair", "Replace", "Discard", "Sell"] }),
    F("workRequired", "Work required", "textarea", { full: 1 }), F("notes", "Notes", "textarea", { full: 1 })] },
  tasks: { label: "Task", plural: "Tasks", prefix: "T-", pad: 3, title: "title", fields: [
    F("title", "Title", "text", { req: 1, full: 1 }), F("phase", "Phase", "select", { optsFn: () => sorted("phases").map(p => p.id), lblFn: id => id + " · " + (S.phases[id]?.name || "") }),
    F("module", "Module", "select", { opts: Object.keys(MODULES), lbl: MODULES }), F("subsystem", "Subsystem", "text"),
    F("status", "Status", "select", { opts: TASK_STATUS }), F("priority", "Priority", "select", { opts: ["Low", "Normal", "High", "Critical"] }), F("safety", "Safety classification", "select", { opts: SEV }),
    F("assignee", "Assigned to", "ref", { ref: "team" }), F("estHours", "Estimated labor (h)", "num"), F("estCost", "Estimated cost", "money"), F("start", "Start date", "date"), F("due", "Due date", "date"),
    F("prereqs", "Prerequisite tasks", "refs", { ref: "tasks", full: 1 }), F("partIds", "Linked parts", "refs", { ref: "parts", full: 1 }),
    F("instructions", "Detailed instructions", "textarea", { full: 1 }), F("tools", "Required tools", "textarea"), F("supplies", "Required supplies", "textarea"),
    F("expected", "Expected result", "textarea", { full: 1 }), F("inspectionCriteria", "Inspection criteria", "textarea", { full: 1 }), F("manualRef", "Manual reference / page", "text", { full: 1 }),
    F("reviewer", "Reviewer", "ref", { ref: "team" }), F("approval", "Approval", "select", { opts: ["Pending", "Approved", "Rejected"] }), F("completedAt", "Completion date", "date"), F("notes", "Notes", "textarea", { full: 1 })] },
  steps: { label: "Procedure step", plural: "Procedure steps", prefix: "STEP-", pad: 3, title: "title", fields: [
    F("title", "Task / inspection", "text", { req: 1, full: 1 }), F("module", "Module", "select", { opts: Object.keys(MODULES), lbl: MODULES }), F("seq", "Sequence", "num"), F("workPackage", "Work package", "text"),
    F("status", "Status", "select", { opts: TASK_STATUS }), F("result", "Pass / fail", "select", { opts: RESULT }), F("owner", "Owner", "ref", { ref: "team" }), F("reviewer", "Reviewer", "ref", { ref: "team" }),
    F("taskId", "Linked task", "ref", { ref: "tasks" }), F("estHours", "Estimated labor (h)", "num"), F("procedure", "Procedure", "textarea", { full: 1 }), F("prereqs", "Prerequisites", "text"), F("tools", "Tools", "text"),
    F("materials", "Parts / materials", "text"), F("evidence", "Measurement / evidence required", "text"), F("acceptance", "Acceptance criteria", "textarea", { full: 1 }), F("manualRef", "Manual reference / page", "text"), F("notes", "Notes", "textarea", { full: 1 })] },
  inspections: { label: "Inspection", plural: "Inspections", prefix: "INS-", pad: 4, title: "point", fields: [
    F("point", "Inspection point", "text", { req: 1, full: 1 }), F("partId", "Part", "ref", { ref: "parts" }), F("component", "Component", "text"),
    F("result", "Result", "select", { opts: RESULT }), F("safetyCritical", "Safety-critical", "bool"),
    F("procedure", "Inspection procedure", "textarea", { full: 1 }), F("spec", "Factory specification", "text", { full: 1, hint: "Leave as VERIFY IN FACTORY SERVICE MANUAL until you have the exact manual value and page." }),
    F("min", "Minimum limit", "text"), F("max", "Maximum limit", "text"), F("actual", "Actual measurement", "text"), F("units", "Units", "text"), F("tool", "Tool used", "text"),
    F("technician", "Technician", "ref", { ref: "team" }), F("date", "Date", "date"), F("reviewer", "Reviewer", "ref", { ref: "team" }),
    F("corrective", "Corrective action", "textarea", { full: 1 }), F("reinspection", "Reinspection result", "select", { opts: ["", "Pass", "Fail", "Pending"] }), F("manualRef", "Source and manual page", "text"), F("notes", "Notes", "textarea", { full: 1 })] },
  purchases: { label: "Purchase request", plural: "Purchases", prefix: "PUR-", pad: 4, title: "description", fields: [
    F("description", "Description", "text", { req: 1, full: 1 }), F("partId", "Linked part", "ref", { ref: "parts" }), F("taskId", "Linked task", "ref", { ref: "tasks" }),
    F("status", "Order status", "select", { opts: PUR_STATUS }), F("sourceType", "OEM / aftermarket", "select", { opts: ["", "OEM", "OEM / Aftermarket", "Aftermarket", "Used / salvage", "Reference / Tool"] }), F("oemPn", "Part number", "text"),
    F("qty", "Quantity", "num"), F("supplier", "Supplier", "text"), F("url", "Product URL", "url", { full: 1, hint: "Paste the real listing link. The app never fills these in." }),
    F("unitPrice", "Unit price", "money"), F("shipping", "Shipping", "money"), F("tax", "Tax", "money"), F("fees", "Other fees", "money"),
    F("quoteDate", "Quote date", "date"), F("orderDate", "Order date", "date"), F("expected", "Expected delivery", "date"), F("delivered", "Actual delivery", "date"),
    F("tracking", "Tracking number", "text"), F("returnBy", "Return deadline", "date"), F("warranty", "Warranty", "text"), F("buyer", "Buyer", "ref", { ref: "team" }),
    F("fitment", "Fitment verification", "select", { opts: ["Pending", "Verified", "Failed"] }), F("fitmentSource", "Fitment source", "text"), F("qc", "Quality inspection", "select", { opts: ["Pending", "Pass", "Fail"] }), F("receipt", "Receipt reference", "text"), F("notes", "Notes", "textarea", { full: 1 })] },
  expenses: { label: "Expense", plural: "Expenses", prefix: "TXN-", pad: 4, title: "description", fields: [
    F("description", "Description", "text", { req: 1, full: 1 }), F("date", "Date", "date", { req: 1 }), F("amount", "Amount", "money", { req: 1 }),
    F("status", "Payment status", "select", { opts: ["Paid", "Unpaid"] }), F("category", "Category", "text", { list: "expcats" }), F("vendor", "Vendor", "text"),
    F("purchaseId", "Linked purchase", "ref", { ref: "purchases", hint: "Link the purchase so its cost is not counted twice." }), F("taskId", "Linked task", "ref", { ref: "tasks" }), F("partId", "Linked part", "ref", { ref: "parts" }),
    F("receipt", "Receipt reference", "text"), F("notes", "Notes", "textarea", { full: 1 })] },
  team: { label: "Team member", plural: "Team", prefix: "TM-", pad: 3, title: "name", fields: [
    F("name", "Name", "text", { req: 1 }), F("role", "Role", "select", { opts: ROLES }), F("experience", "Experience", "select", { opts: ["Beginner", "Intermediate", "Experienced", "Professional"] }),
    F("rate", "Hourly rate (optional)", "money"), F("skills", "Skills", "textarea", { full: 1 }), F("contact", "Contact", "text", { full: 1 }), F("notes", "Notes", "textarea", { full: 1 })] },
  worklogs: { label: "Work session", plural: "Work log", prefix: "LAB-", pad: 4, title: "work", fields: [
    F("memberId", "Team member", "ref", { ref: "team", req: 1 }), F("date", "Date", "date", { req: 1 }), F("hours", "Net hours", "num", { req: 1 }), F("taskId", "Task", "ref", { ref: "tasks" }),
    F("work", "Work performed", "textarea", { full: 1, req: 1 }), F("partsUsed", "Parts used", "text", { full: 1 }), F("problems", "Problems encountered", "textarea", { full: 1 }),
    F("handoff", "Handoff to", "ref", { ref: "team" }), F("next", "Next steps / handoff notes", "textarea", { full: 1 }), F("approval", "Reviewer approval", "select", { opts: ["Pending", "Approved"] })] },
  docs: { label: "Photo or document", plural: "Photos & documents", prefix: "DOC-", pad: 4, title: "title", fields: [
    F("title", "Title", "text", { req: 1, full: 1 }), F("kind", "Type", "select", { opts: DOC_KINDS }), F("date", "Date", "date"),
    F("partId", "Part", "ref", { ref: "parts" }), F("taskId", "Task", "ref", { ref: "tasks" }), F("inspectionId", "Inspection", "ref", { ref: "inspections" }), F("purchaseId", "Purchase", "ref", { ref: "purchases" }),
    F("folder", "Folder", "text", { list: "folders" }), F("link", "External link", "url", { full: 1, hint: "For large files: link to the shared drive copy." }), F("tags", "Tags", "text", { full: 1 }), F("caption", "Caption", "textarea", { full: 1 }), F("notes", "Notes", "textarea", { full: 1 })] },
  issues: { label: "Problem", plural: "Problems", prefix: "ISS-", pad: 4, title: "description", fields: [
    F("description", "Description", "text", { req: 1, full: 1 }), F("type", "Type", "select", { opts: ["Issue", "Risk", "Damaged component", "Missing part", "Engine wear", "Electrical fault", "Corrosion", "Delayed order", "Budget overrun", "Compatibility", "Safety concern"] }),
    F("severity", "Severity", "select", { opts: SEV }), F("status", "Status", "select", { opts: ["Open", "In progress", "Resolved", "Closed"] }), F("safety", "Safety impact", "select", { opts: ["", "Yes", "Potential", "No"] }),
    F("partId", "Part", "ref", { ref: "parts" }), F("ref", "Related task", "ref", { ref: "tasks" }), F("owner", "Owner", "ref", { ref: "team" }), F("ownerRole", "Owner role", "text"), F("date", "Date identified", "date"), F("target", "Target resolution", "date"),
    F("costImpact", "Cost impact", "money"), F("timeImpact", "Time impact (days)", "num"), F("rootCause", "Root cause", "textarea", { full: 1 }), F("proposed", "Proposed solution", "textarea", { full: 1 }),
    F("decision", "Decision", "textarea", { full: 1 }), F("corrective", "Corrective action", "textarea", { full: 1 }), F("verification", "Verification", "textarea", { full: 1 }), F("signoff", "Sign-off", "ref", { ref: "team" }), F("notes", "Notes", "textarea", { full: 1 })] },
  decisions: { label: "Decision", plural: "Decisions", prefix: "DEC-", pad: 4, title: "topic", fields: [
    F("topic", "Decision", "text", { req: 1, full: 1 }), F("status", "Status", "select", { opts: ["Open", "Decided", "Revisit"] }), F("severity", "Impact", "select", { opts: SEV }),
    F("options", "Options considered", "textarea", { full: 1 }), F("choice", "Choice made", "textarea", { full: 1 }), F("rationale", "Rationale", "textarea", { full: 1 }),
    F("costImpact", "Cost impact", "money"), F("decidedBy", "Decided by", "ref", { ref: "team" }), F("decisionFrom", "Decision needed from", "text"), F("date", "Date", "date"), F("taskId", "Related task", "ref", { ref: "tasks" }), F("notes", "Notes", "textarea", { full: 1 })] },
  gates: { label: "Quality gate", plural: "Quality gates", prefix: "GATE-", pad: 2, title: "name", fields: [
    F("name", "Checkpoint", "text", { req: 1, full: 1 }), F("status", "Status", "select", { opts: ["Not started", "In review", "Passed", "Failed"] }), F("required", "Required for road-ready", "bool"),
    F("criteria", "Objective criteria / evidence", "textarea", { full: 1 }), F("prereqs", "Required tasks", "text", { full: 1, hint: "Task IDs separated by ; ranges allowed, e.g. E-016:E-020" }),
    F("result", "Documented result", "textarea", { full: 1 }), F("reviewer", "Independent reviewer", "ref", { ref: "team" }), F("date", "Date reviewed", "date"),
    F("corrective", "Corrective action / reinspection", "textarea", { full: 1 }), F("evidence", "Evidence reference", "text", { full: 1 }), F("notes", "Notes", "textarea", { full: 1 })] },
  checks: { label: "Safety check", plural: "Pre-start & road checks", prefix: "SAFE-", pad: 3, title: "check", fields: [
    F("check", "Safety check", "text", { req: 1, full: 1 }), F("system", "System", "text"), F("criticality", "Criticality", "select", { opts: ["Critical", "High", "Medium"] }),
    F("result", "Result", "select", { opts: RESULT }), F("links", "Task / gate links", "text"), F("criteria", "Acceptance criteria / procedure", "textarea", { full: 1 }), F("evidence", "Evidence / measurement", "text", { full: 1 }),
    F("inspector", "Inspector", "ref", { ref: "team" }), F("reviewer", "Independent reviewer", "ref", { ref: "team" }), F("date", "Date", "date"), F("reinspection", "Reinspection result", "select", { opts: ["", "Pass", "Fail", "Pending"] }),
    F("corrective", "Corrective action", "textarea", { full: 1 }), F("notes", "Notes", "textarea", { full: 1 })] },
  finishes: { label: "Finish record", plural: "Finish records", prefix: "COS-", pad: 3, title: "component", fields: [
    F("component", "Component", "text", { req: 1 }), F("partId", "Part", "ref", { ref: "parts" }), F("status", "Status", "select", { opts: TASK_STATUS }), F("qc", "Quality approval", "select", { opts: ["Pending", "Pass", "Fail"] }),
    F("work", "Work", "text", { full: 1 }), F("prep", "Surface preparation", "textarea", { full: 1 }), F("process", "Product / process", "text", { full: 1 }), F("protect", "Must protect / do not coat", "text", { full: 1 }),
    F("timing", "Assembly timing", "text"), F("cure", "Cure time / source", "text"), F("approvedBy", "Approved by", "ref", { ref: "team" }), F("completedAt", "Completed", "date"), F("estCost", "Estimated cost", "money"), F("taskId", "Linked task", "ref", { ref: "tasks" }), F("notes", "Notes", "textarea", { full: 1 })] },
  maintenance: { label: "Maintenance entry", plural: "Maintenance log", prefix: "MAINT-", pad: 3, title: "service", fields: [
    F("service", "Service performed / item", "text", { req: 1, full: 1 }), F("date", "Date", "date"), F("odometer", "Odometer", "text"), F("interval", "Required interval", "text", { hint: "Only from the factory manual or the rebuilder's instructions." }),
    F("partsUsed", "Parts used", "text", { full: 1 }), F("cost", "Cost", "money"), F("technician", "Technician", "ref", { ref: "team" }), F("nextDate", "Next service date", "date"), F("nextMiles", "Next service mileage", "text"), F("source", "Source / manual page", "text", { full: 1 }), F("planned", "Planned (not yet performed)", "bool"), F("notes", "Notes", "textarea", { full: 1 })] },
  tools: { label: "Tool or supply", plural: "Tools & supplies", prefix: "TOOL-", pad: 3, title: "name", fields: [
    F("name", "Tool / material", "text", { req: 1, full: 1 }), F("category", "Category", "text"), F("qty", "Qty needed", "text"), F("available", "Available", "select", { opts: ["Unknown", "Yes", "No", "Borrow"] }), F("status", "Status", "select", { opts: ["Planning", "To buy", "On hand", "Borrowed", "Returned"] }),
    F("cost", "Purchase / rental cost", "money"), F("location", "Storage location", "text"), F("assignee", "Assigned to", "ref", { ref: "team" }), F("usage", "Usage", "textarea", { full: 1 }), F("safety", "Safety requirements", "text", { full: 1 }), F("calibration", "Accuracy / calibration", "text", { full: 1 }), F("notes", "Notes", "textarea", { full: 1 })] },
  sources: { label: "Reference source", plural: "Reference sources", prefix: "SRC-", pad: 3, title: "title", fields: [
    F("title", "Title", "text", { req: 1, full: 1 }), F("publisher", "Publisher / site", "text"), F("url", "URL", "url", { full: 1 }), F("applies", "Applicable model / year", "text"), F("subject", "Subject", "text"), F("verification", "Verification status", "text", { full: 1 }), F("notes", "Notes", "textarea", { full: 1 })] },
  phases: { label: "Phase", plural: "Phases", prefix: "", pad: 1, title: "name", fields: [
    F("name", "Phase name", "text", { req: 1, full: 1 }), F("start", "Planned start", "date"), F("finish", "Planned finish", "date"),
    F("approval", "Approval status", "select", { opts: ["Not started", "In progress", "Ready for review", "Approved"] }), F("approvedBy", "Approved by", "ref", { ref: "team" }), F("notes", "Notes", "textarea", { full: 1 })] },
};
const COLLS = ["meta", ...Object.keys(SCHEMA), "activity"];

/* ============ state ============ */
const S = {}; COLLS.forEach(c => S[c] = {});
const sorted = c => Object.values(S[c]).filter(r => !r.archived).sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));
const all = c => Object.values(S[c]);
const meta = () => S.meta.project || {};
const ME = { id: null, name: "", canWrite: true, mode: "local", actingAs: lsGet("gs750.actingAs", "") };
/* the project owner is Xavier: any "Stephen" name (from the signed-in account or older records) is shown and saved as Xavier */
const ownerName = n => String(n || "").replace(/\bStephen(\s+Cain)?\b/gi, "Xavier");
let ownerFixed = false;
async function fixOwnerNames() {
  if (ownerFixed || !ME.canWrite) return; ownerFixed = true;
  for (const c of COLLS) for (const r of Object.values(S[c] || {})) {
    const j = JSON.stringify(r); if (!/stephen/i.test(j)) continue;
    const fixed = JSON.parse(j.replace(/\bStephen(\s+Cain)?\b/gi, "Xavier"));
    try { await store.put(c, fixed, { silent: true, noLog: true }); } catch (e) {}
  }
}
const whoName = () => (ME.actingAs && S.team[ME.actingAs]?.name) || ME.name || (ME.mode === "local" ? "You (this browser)" : "Team member");

/* ============ storage adapter ============ */
const store = {
  db: null, ready: false, loaded: new Set(), listeners: [],
  async init() {
    let db = null, user = null;
    try { if (window.claude && window.claude.use) { [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]); } } catch (e) { db = null; }
    if (db) {
      this.db = db; ME.mode = "shared";
      if (user) {
        try { const me = await user.me(); ME.id = me.id; ME.name = ownerName(me.name || ""); } catch (e) {}
        try { const w = await user.can("data.write"); if (w === false) ME.canWrite = false; } catch (e) {}
      }
      this.subscribe();
    } else {
      ME.mode = "local";
      const saved = lsGet("gs750hq.data.v1", null);
      if (saved) COLLS.forEach(c => S[c] = saved[c] || {});
      COLLS.forEach(c => this.loaded.add(c));
      this.ready = true; onData(true); setTimeout(fixOwnerNames, 500);
    }
  },
  subscribe() {
    COLLS.forEach(c => {
      let q = this.db.collection(c);
      if (c === "activity") q = q.orderBy("ts", "desc").limit(300);
      q.onSnapshot(snap => {
        const next = {}; snap.docs.forEach(d => { const v = d.data(); if (v) next[d.id] = { ...v, id: d.id }; });
        S[c] = next; this.loaded.add(c);
        if (this.loaded.size === COLLS.length && !this.ready) { this.ready = true; onData(true); setTimeout(fixOwnerNames, 500); } else if (this.ready) onData(false, c);
      }, err => { setSave("err", "Sync stopped: " + (err && err.code || "error") + ". Reload the page."); });
    });
  },
  saveLocal: debounce(function () {
    const ok = lsSet("gs750hq.data.v1", S);
    setSave(ok ? "ok" : "err", ok ? "Saved in this browser" : "Browser storage is full or blocked. Export a backup now.");
  }, 250),
  pending: 0,
  async put(c, rec, opts = {}) {
    if (!ME.canWrite) { toast("You have view-only access. Ask the owner for Contributor access to edit.", "err"); throw new Error("readonly"); }
    rec = clone(rec);
    rec.updatedAt = nowISO(); rec.updatedBy = whoName(); rec.updatedById = ME.id || "";
    if (!rec.createdAt) rec.createdAt = rec.updatedAt;
    const prev = S[c][rec.id] ? clone(S[c][rec.id]) : null;
    S[c][rec.id] = rec;
    if (!opts.silent) scheduleRender();
    if (c !== "activity" && !opts.noLog) logActivity(c, rec, prev, opts.action);
    if (this.db) {
      this.pending++; setSave("busy");
      try { const body = { ...rec }; delete body.id; await this.retry(() => this.db.collection(c).doc(rec.id).set(body)); }
      catch (e) { if (prev) S[c][rec.id] = prev; else delete S[c][rec.id]; scheduleRender(); this.fail(e); throw e; }
      finally { this.pending--; if (!this.pending) setSave("ok"); }
    } else this.saveLocal();
    return prev;
  },
  async del(c, id, opts = {}) {
    if (!ME.canWrite) { toast("You have view-only access.", "err"); throw new Error("readonly"); }
    const prev = S[c][id] ? clone(S[c][id]) : null;
    delete S[c][id]; scheduleRender();
    if (c !== "activity" && prev && !opts.noLog) logActivity(c, prev, prev, "deleted");
    if (this.db) {
      this.pending++; setSave("busy");
      try { await this.retry(() => this.db.collection(c).doc(id).delete()); }
      catch (e) { if (prev) S[c][id] = prev; scheduleRender(); this.fail(e); throw e; }
      finally { this.pending--; if (!this.pending) setSave("ok"); }
    } else this.saveLocal();
    return prev;
  },
  async retry(fn) {
    for (let i = 0; ; i++) {
      try { return await fn(); }
      catch (e) { const code = e && e.code; if ((code === "unavailable" || code === "resource_exhausted") && i < 4) { await new Promise(r => setTimeout(r, 400 * (i + 1) + Math.random() * 300)); continue; } throw e; }
    }
  },
  fail(e) {
    const code = e && e.code;
    const msg = code === "quota_exceeded" ? "The project database is full. Delete old photos or archived records, then try again."
      : code === "invalid_argument" ? "That change was refused. If you have view-only access, ask the owner for Contributor access. Large photos must be under 180 KB after compression."
      : "Could not save that change (" + (code || "network") + "). Check your connection and try again.";
    setSave("err", msg); toast(msg, "err");
  },
  async bulk(writes, onProgress) {
    // writes: [{c, rec}] — sequential with light concurrency to respect rate limits
    let done = 0; const q = writes.slice(); const workers = [];
    const run = async () => { while (q.length) { const w = q.shift(); await this.put(w.c, w.rec, { silent: true, noLog: true }); done++; onProgress && onProgress(done, writes.length); } };
    for (let i = 0; i < (this.db ? 3 : 1); i++) workers.push(run());
    await Promise.all(workers); scheduleRender();
  }
};

function logActivity(c, rec, prev, action) {
  const id = "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  let summary = action || (prev ? "updated" : "created");
  if (prev && !action) {
    const changed = Object.keys(rec).filter(k => !["updatedAt", "updatedBy", "updatedById", "createdAt"].includes(k) && JSON.stringify(rec[k]) !== JSON.stringify(prev[k]));
    if (!changed.length) return;
    const fdef = SCHEMA[c]?.fields || [];
    const nice = changed.slice(0, 3).map(k => { const f = fdef.find(x => x.k === k); const v = rec[k]; return (f ? f.label : k) + (typeof v === "string" && v.length < 40 && f && f.type === "select" ? " → " + v : ""); });
    summary = "changed " + nice.join(", ") + (changed.length > 3 ? " +" + (changed.length - 3) : "");
  }
  const a = { id, ts: nowISO(), by: whoName(), byId: ME.id || "", coll: c, rid: rec.id, title: titleOf(c, rec), summary };
  store.put("activity", a, { silent: true, noLog: true }).catch(() => {});
}
const titleOf = (c, r) => r ? (r[SCHEMA[c]?.title] || r.name || r.title || r.id) : "";

function nextId(c) {
  const sc = SCHEMA[c]; let max = 0;
  all(c).forEach(r => { const m = String(r.id).match(/(\d+)$/); if (String(r.id).startsWith(sc.prefix) && m) max = Math.max(max, +m[1]); });
  let id; do { max++; id = sc.prefix + String(max).padStart(sc.pad, "0"); } while (S[c][id]);
  return id;
}
function blank(c, init = {}) {
  const r = { id: nextId(c), archived: false };
  SCHEMA[c].fields.forEach(f => { r[f.k] = f.type === "refs" ? [] : f.type === "bool" ? false : (f.type === "num" || f.type === "money") ? 0 : f.type === "select" ? ((f.opts || (f.optsFn ? f.optsFn() : []))[0] ?? "") : ""; });
  const defaults = { parts: { status: "Not started", condition: "Uninspected", module: "general", qtyExpected: 1, priority: "Normal", replacement: "Unknown", classification: "Unknown", cleaning: "Required", disposition: "Undecided" },
    tasks: { status: "Not started", priority: "Normal", safety: "Medium", approval: "Pending", module: "general", phase: "A", comments: [] }, inspections: { result: "Pending", spec: VERIFY, date: today() },
    purchases: { status: "Requested", qty: 1, fitment: "Pending", qc: "Pending" }, expenses: { status: "Paid", date: today() }, worklogs: { date: today(), approval: "Pending", memberId: ME.actingAs || "" },
    docs: { kind: "During photo", date: today() }, issues: { status: "Open", severity: "Medium", date: today(), type: "Issue" }, decisions: { status: "Open", severity: "Medium" },
    gates: { status: "Not started", required: true }, checks: { result: "Pending", criticality: "Critical" }, finishes: { status: "Not started", qc: "Pending" }, maintenance: { date: today(), planned: false }, team: { role: ROLES[1] }, steps: { status: "Not started", result: "Pending" } };
  return Object.assign(r, defaults[c] || {}, init);
}

/* ============ derived logic ============ */
const tasksDone = t => t.status === "Complete";
const tasksClosed = t => t.status === "Complete" || t.status === "Cancelled";
function partInspections(pid) { return sorted("inspections").filter(i => i.partId === pid); }
function inspOpenFail(i) { return i.result === "Fail" && i.reinspection !== "Pass"; }
function partInspectionState(p) {
  const ins = partInspections(p.id);
  if (ins.some(inspOpenFail)) return "Failed";
  if (ins.some(i => i.result === "Pending" || (i.result === "Fail" && i.reinspection === "Pending"))) return "Pending";
  if (ins.some(i => i.result === "Pass" || (i.result === "Fail" && i.reinspection === "Pass"))) return "Passed";
  return "Not inspected";
}
/* RED untouched · AMBER in work / awaiting · GREEN work complete AND inspection passed · GRAY missing/NA/archived */
function partColor(p) {
  if (!p || p.archived || p.status === "Missing" || p.status === "Not applicable") return "gray";
  const ins = partInspectionState(p);
  if (p.status === "Work complete" && ins === "Passed") return "green";
  if (p.status === "Not started") return "red";
  return "amber";
}
const COLOR_LABEL = { red: "Untouched / not restored", amber: "In work or awaiting inspection", green: "Restored & approved", gray: "Missing / not applicable" };
function partStatusLabel(p) {
  const c = partColor(p);
  if (c === "green") return "Restored & approved";
  if (p.status === "Work complete") { const s = partInspectionState(p); return s === "Failed" ? "Inspection failed" : "Awaiting inspection"; }
  return p.status;
}
function pill(color, text) { return `<span class="pill ${color}">${esc(text)}</span>`; }
const partPill = p => pill(partColor(p), partStatusLabel(p));
const TASK_COLOR = { "Not started": "red", "In progress": "amber", "Blocked": "red", "Awaiting parts": "amber", "Awaiting inspection": "amber", "Complete": "green", "Cancelled": "gray" };
const taskPill = t => pill(TASK_COLOR[t.status] || "gray", t.status);
const RES_COLOR = { Pending: "amber", Pass: "green", Fail: "red", "N/A": "gray", Passed: "green", Failed: "red", "Not started": "gray", "In review": "amber", Open: "red", "In progress": "amber", Resolved: "green", Closed: "gray", Decided: "green", Revisit: "amber" };
const resPill = r => pill(RES_COLOR[r] || "gray", r || "—");
const SEV_COLOR = { Low: "gray", Medium: "amber", High: "red", Critical: "red" };
const sevPill = s => `<span class="pill ${SEV_COLOR[s] || "gray"} plain" style="${s === "Critical" ? "font-weight:700" : ""}">${esc(s || "—")}</span>`;

function expandIds(text) {
  const ids = [], tids = sorted("tasks").map(t => t.id);
  String(text || "").split(/[;,]/).map(s => s.trim()).filter(Boolean).forEach(tok => {
    const m = tok.match(/^([A-Z]+-\d+):([A-Z]+-\d+)$/);
    if (m) { const a = tids.indexOf(m[1]), b = tids.indexOf(m[2]); if (a >= 0 && b >= 0) ids.push(...tids.slice(a, b + 1)); }
    else ids.push(tok);
  });
  return ids;
}
const openPrereqs = t => (t.prereqs || []).filter(id => S.tasks[id] && !tasksDone(S.tasks[id]));
const isOverdue = t => t.due && t.due < today() && !tasksClosed(t);
const tasksForPart = pid => sorted("tasks").filter(t => (t.partIds || []).includes(pid));
const purchasesForPart = pid => sorted("purchases").filter(p => p.partId === pid);
const docsFor = (key, id) => sorted("docs").filter(d => d[key] === id);
const landed = p => n(p.qty || 1) * n(p.unitPrice) + n(p.shipping) + n(p.tax) + n(p.fees);
const ORDERED = ["Ordered", "Shipped", "Delivered", "Inspected"];
const taskHours = tid => sorted("worklogs").filter(w => w.taskId === tid).reduce((s, w) => s + n(w.hours), 0);
function partActualCost(pid) {
  const pids = new Set(purchasesForPart(pid).map(p => p.id));
  return sorted("expenses").filter(e => e.status === "Paid" && (e.partId === pid || pids.has(e.purchaseId))).reduce((s, e) => s + n(e.amount), 0);
}

function finance() {
  const m = meta();
  const base = n(m.baseBudget), changes = (m.budgetChanges || []).filter(c => c.approved !== false).reduce((s, c) => s + n(c.amount), 0);
  const revised = base + changes, contingency = revised * n(m.contingencyPct) / 100, total = revised + contingency;
  const exp = sorted("expenses");
  const paid = exp.filter(e => e.status === "Paid").reduce((s, e) => s + n(e.amount), 0);
  const unpaidInvoices = exp.filter(e => e.status === "Unpaid").reduce((s, e) => s + n(e.amount), 0);
  const expensedPurchases = new Set(exp.filter(e => e.purchaseId).map(e => e.purchaseId));
  const purs = sorted("purchases");
  // committed: ordered purchases not yet covered by any expense record + unpaid invoices
  const committedOrders = purs.filter(p => ORDERED.includes(p.status) && !expensedPurchases.has(p.id)).reduce((s, p) => s + landed(p), 0);
  const committed = committedOrders + unpaidInvoices;
  // planned: cheapest open quote/request per part (or per purchase if unlinked) not yet ordered; plus open-task estimates
  const orderedParts = new Set(purs.filter(p => ORDERED.includes(p.status)).map(p => p.partId).filter(Boolean));
  const best = {};
  purs.filter(p => ["Research", "Quote", "Requested"].includes(p.status)).forEach(p => {
    const key = p.partId || p.id; if (p.partId && orderedParts.has(p.partId)) return;
    const v = landed(p); if (!(key in best) || (v > 0 && (best[key] === 0 || v < best[key]))) best[key] = v;
  });
  const plannedPurch = Object.values(best).reduce((s, v) => s + v, 0);
  const plannedTasks = sorted("tasks").filter(t => !tasksClosed(t)).reduce((s, t) => s + n(t.estCost), 0);
  const planned = plannedPurch + plannedTasks;
  const forecast = paid + committed + planned;
  const hours = sorted("worklogs").reduce((s, w) => s + n(w.hours), 0);
  const laborValue = sorted("worklogs").reduce((s, w) => s + n(w.hours) * (n(S.team[w.memberId]?.rate) || n(m.laborRate)), 0);
  return { base, changes, revised, contingency, total, paid, committed, committedOrders, unpaidInvoices, plannedPurch, plannedTasks, planned, forecast, remaining: total - paid - committed, forecastRemaining: total - forecast, hours, laborValue };
}

function phaseStats(ph) {
  const ts = sorted("tasks").filter(t => t.phase === ph.id && t.status !== "Cancelled");
  const hrs = ts.reduce((s, t) => s + (n(t.estHours) || 1), 0), doneH = ts.filter(tasksDone).reduce((s, t) => s + (n(t.estHours) || 1), 0);
  const tids = new Set(ts.map(t => t.id));
  const deps = new Set(); ts.forEach(t => (t.prereqs || []).forEach(p => { const q = S.tasks[p]; if (q && q.phase !== ph.id) deps.add(q.phase); }));
  const ready = ts.filter(t => !tasksDone(t) && !openPrereqs(t).length).length;
  const purchaseIds = sorted("purchases").filter(p => tids.has(p.taskId));
  const partsNeeded = purchaseIds.filter(p => !["Delivered", "Inspected", "Cancelled", "Returned"].includes(p.status)).length;
  const est = ts.reduce((s, t) => s + n(t.estCost), 0) + purchaseIds.reduce((s, p) => s + landed(p), 0);
  const pset = new Set(purchaseIds.map(p => p.id));
  const actual = sorted("expenses").filter(e => e.status === "Paid" && (tids.has(e.taskId) || pset.has(e.purchaseId))).reduce((s, e) => s + n(e.amount), 0);
  const start = ph.start || ts.map(t => t.start).filter(Boolean).sort()[0] || "";
  const finish = ph.finish || ts.map(t => t.due).filter(Boolean).sort().slice(-1)[0] || "";
  return { tasks: ts, total: ts.length, done: ts.filter(tasksDone).length, remaining: ts.filter(t => !tasksDone(t)).length, pct: hrs ? doneH / hrs : 0, deps: [...deps].sort(), ready, partsNeeded, est, actual, start, finish };
}
function overallProgress() {
  const ts = sorted("tasks").filter(t => t.status !== "Cancelled");
  const hrs = ts.reduce((s, t) => s + (n(t.estHours) || 1), 0), done = ts.filter(tasksDone).reduce((s, t) => s + (n(t.estHours) || 1), 0);
  return hrs ? done / hrs : 0;
}
function currentPhase() { for (const ph of sorted("phases")) { const s = phaseStats(ph); if (s.remaining > 0) return ph; } return null; }
const PRI_RANK = { Critical: 0, High: 1, Normal: 2, Low: 3 };
function recommendedTasks(k = 5) {
  const order = {}; sorted("phases").forEach((p, i) => order[p.id] = i);
  return sorted("tasks").filter(t => !tasksClosed(t) && t.status !== "Blocked" && !openPrereqs(t).length)
    .sort((a, b) => (a.status === "In progress" ? -1 : 0) - (b.status === "In progress" ? -1 : 0) || (order[a.phase] - order[b.phase]) || (PRI_RANK[a.priority] - PRI_RANK[b.priority]) || a.id.localeCompare(b.id)).slice(0, k);
}
function gateOutstanding(g) { return expandIds(g.prereqs).filter(id => S.tasks[id] && !tasksDone(S.tasks[id])); }
function roadReadyBlockers() {
  const b = [];
  sorted("gates").filter(g => g.required && g.id !== "GATE-16").forEach(g => { if (g.status !== "Passed") b.push({ c: "gates", id: g.id, t: `${g.id} ${g.name}: ${g.status}` }); });
  sorted("checks").forEach(c => { const ok = c.result === "Pass" || c.result === "N/A" || (c.result === "Fail" && c.reinspection === "Pass"); if (!ok) b.push({ c: "checks", id: c.id, t: `${c.id} ${c.check}: ${c.result === "Fail" ? "FAILED" : c.result}` }); });
  sorted("inspections").filter(i => i.safetyCritical && inspOpenFail(i)).forEach(i => b.push({ c: "inspections", id: i.id, t: `${i.id} ${i.point}: FAILED, not reinspected` }));
  sorted("issues").filter(i => (i.severity === "Critical" || i.safety === "Yes") && !["Resolved", "Closed"].includes(i.status)).forEach(i => b.push({ c: "issues", id: i.id, t: `${i.id} ${i.description}: ${i.status}` }));
  return b;
}
function safetyUnresolved() {
  return sorted("issues").filter(i => (i.severity === "Critical" || i.safety === "Yes") && !["Resolved", "Closed"].includes(i.status)).length
    + sorted("checks").filter(c => c.result === "Fail" && c.reinspection !== "Pass").length
    + sorted("inspections").filter(i => i.safetyCritical && inspOpenFail(i)).length;
}
function purchaseAlerts() {
  const a = [], t = today(), ps = sorted("purchases");
  ps.forEach(p => {
    if (p.expected && p.expected < t && ["Ordered", "Shipped"].includes(p.status)) a.push({ kind: "Delayed", p, msg: `Expected ${fmtDate(p.expected)}, still ${p.status.toLowerCase()}` });
    if (p.status === "Delivered" && p.qc === "Pending") a.push({ kind: "Not inspected", p, msg: "Delivered but quality inspection is pending" });
    if (p.returnBy && p.returnBy >= t && p.returnBy <= addDays(t, 7) && p.qc !== "Pass") a.push({ kind: "Return window", p, msg: "Return deadline " + fmtDate(p.returnBy) });
    if (p.fitment === "Failed") a.push({ kind: "Fitment", p, msg: "Fitment failed" });
  });
  const seen = {};
  ps.filter(p => ORDERED.includes(p.status)).forEach(p => { const k = (p.partId || "") + "|" + (p.description || "").toLowerCase().trim(); if (seen[k]) a.push({ kind: "Duplicate", p, msg: "Possible duplicate of " + seen[k] }); else seen[k] = p.id; });
  const f = finance(); if (f.forecast > f.total && f.total > 0) a.push({ kind: "Budget", p: null, msg: `Forecast ${money(f.forecast)} is over the ${money(f.total)} budget by ${money(f.forecast - f.total)}` });
  return a;
}
function addDays(iso, d) { const x = new Date(iso + "T12:00:00"); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); }
