// ============================================================================
// MUFG Delivery Intelligence — demo data
// All data here is SYNTHETIC and ILLUSTRATIVE. No real MUFG or SmartCo names.
// Edit copy / numbers here; the screens are built in render.ts.
// ----------------------------------------------------------------------------
// THE LADDER (no timeline). Capabilities appear at the level where their data
// actually exists:
//   L0 Foundation        — connect & capture; document chatbot; no predictions
//   L1 Prove             — gates + financial mismatch (CURRENT-STATE FACT only)
//   L2 Compound          — write-back, early-warning & gate PATTERNS (needs history)
//   L3 Predict & expand  — predictive cross-portfolio insight + procurement/vendor
// The growth spine is ACCUMULATED STRUCTURED HISTORY, not "connectors lit".
// Insight is gated by that history. Climbing the toggle = the Delivery
// Intelligence Debt curve, live.
// ============================================================================

export const LEVELS: any[] = [
  { n:0, name:"Foundation",       tag:"Connect & capture",     hist:"Capturing begins", histPct:3,  conf:42, connectors:2, wb:false },
  { n:1, name:"Prove",            tag:"Two solutions, proven", hist:"~6 weeks",         histPct:16, conf:61, connectors:5, wb:false },
  { n:2, name:"Compound",         tag:"It starts to pay off",  hist:"~6 months",        histPct:55, conf:78, connectors:7, wb:true  },
  { n:3, name:"Predict & expand", tag:"Intelligence, earned",  hist:"12+ months",       histPct:92, conf:91, connectors:9, wb:true  },
];

export const NAV: any[] = [
  { id:"foundation",  label:"Foundation",          icon:"\u25C8",   group:null,         min:0 },
  { id:"policy",      label:"Policy Assistant",     icon:"\u{1F4AC}",group:"Knowledge",  min:0 },
  { id:"portfolio",   label:"Portfolio Command",    icon:"\u25A6",   group:"Delivery",   min:1 },
  { id:"gates",       label:"Stage-Gate Tracker",   icon:"\u2630",   group:"Delivery",   min:1 },
  { id:"procurement", label:"Procurement Tracker",  icon:"\u21C4",   group:"Delivery",   min:3, badge:"Flow" },
  { id:"vendors",     label:"Vendor & SoW",         icon:"\u270D",   group:"Delivery",   min:3, badge:"Flow" },
  { id:"finance",     label:"Forecast & Mismatch",  icon:"\u00A3",   group:"Financial",  min:1 },
  { id:"artefacts",   label:"Artefact Studio",      icon:"\u2398",   group:"Reporting",  min:2 },
  { id:"governance",  label:"Governance Packs",     icon:"\u2637",   group:"Reporting",  min:3 },
  { id:"insights",    label:"AI Insights",          icon:"\u25C9",   group:"Intelligence",min:3 },
  { id:"data",        label:"Data & Connectors",    icon:"\u26A1",   group:null,         min:0 },
];

// Connectors light up as you climb. The two Prove solutions (gates + mismatch)
// need Plan View, Jira and Oracle — so those come on at L1.
export const CONNECTORS: any[] = [
  { name:"SharePoint",         lvl:0, cap:"Artefacts, sign-off emails, templates", conf:55 },
  { name:"Policy docs (EN/JP)",lvl:0, cap:"Financial-management policy, process guides", conf:70 },
  { name:"Plan View",          lvl:1, cap:"Workflows, gate status, forecast, RAID", conf:72, wb:true,
      note:"How we'd connect: read workflow, gate and forecast data via Plan View's API / scheduled export. In reach: gate status, RAID, forecast lines. Out of reach without further access: some narrative fields \u2014 which is why a full status report also draws on Teams and Outlook." },
  { name:"Jira",               lvl:1, cap:"Delivery tasks, gate evidence", conf:84 },
  { name:"Oracle ERP",         lvl:1, cap:"Actuals (US / EU / Asia) \u2014 feeds the mismatch", conf:88 },
  { name:"Teams",              lvl:2, cap:"Chat & meeting context", conf:48 },
  { name:"Outlook",            lvl:2, cap:"Approvals, escalations", conf:46 },
  { name:"Asana",              lvl:3, cap:"Team task tracking", conf:80 },
  { name:"Confluence",         lvl:3, cap:"Standardised sign-off tracking", conf:66 },
];

export const TEAMS = ["Planning","Technology","Compliance","Architecture","Security","Risk","Finance","Data","Change","Ops"];

export const PROJECTS: any[] = [
  { name:"Confirmations Automation",        type:"CTB", owner:"Daniel Okafor",  gate:"AG1", rag:"red",   budget:6.8,  forecast:7.0,  days:28, appr:7,  out:["Compliance","Risk","Security"], hook:"Stuck 4 weeks at AG1 \u2014 Compliance holding the gate" },
  { name:"Collateral Management Migration", type:"CTB", owner:"Tom Whitfield",  gate:"AG3", rag:"red",   budget:12.0, forecast:20.4, days:12, appr:9,  out:["Finance"], hook:"Forecast \u00a320.4m vs baseline \u00a312.0m \u2014 lines don't reconcile" },
  { name:"Client Onboarding KYC Refresh",   type:"CTB", owner:"Elena Vasquez",  gate:"AG1", rag:"amber", budget:4.1,  forecast:4.1,  days:9,  appr:6,  out:["Compliance","Data","Change","Ops"], hook:"Lost 3 weeks on vendor SoW sign-off" },
  { name:"Regulatory Reporting Remediation",type:"CTB", owner:"Priya Nair",     gate:"AG2", rag:"amber", budget:9.5,  forecast:9.6,  days:7,  appr:8,  out:["Risk","Compliance"], hook:"Regulatory \u2014 highest assurance, all 10 teams in scope" },
  { name:"Settlements Platform Uplift",     type:"CTB", owner:"Aisha Rahman",   gate:"AG2", rag:"amber", budget:14.2, forecast:14.8, days:5,  appr:8,  out:["Architecture","Security"], hook:"BRD drafted via in-house AI" },
  { name:"Payments Resilience",             type:"RTB", owner:"James Carter",   gate:"AG2", rag:"green", budget:3.2,  forecast:3.1,  days:3,  appr:9,  out:["Ops"] },
  { name:"Trade Surveillance Enhancement",  type:"CTB", owner:"Sofia Bianchi",  gate:"AG2", rag:"green", budget:7.4,  forecast:7.3,  days:4,  appr:9,  out:["Data"] },
  { name:"Reference Data Consolidation",    type:"CTB", owner:"Marcus Lee",     gate:"AG1", rag:"amber", budget:5.6,  forecast:5.9,  days:6,  appr:5,  out:["Compliance","Architecture","Risk","Finance","Change"] },
  { name:"Liquidity Reporting",             type:"RTB", owner:"Nina Patel",     gate:"AG3", rag:"green", budget:2.8,  forecast:2.7,  days:2,  appr:10, out:[] },
  { name:"Market Risk Engine Upgrade",      type:"CTB", owner:"Oliver Grant",   gate:"AG3", rag:"amber", budget:11.0, forecast:11.6, days:8,  appr:7,  out:["Security","Risk","Finance"] },
];

// CURRENT-STATE FACTS (Level 1) — facts about now, NOT predictions or patterns.
export const FACTS: any[] = [
  { cat:"delivery",  t:"Confirmations Automation has been at AG1 for 28 days \u2014 3 approvals outstanding." },
  { cat:"financial", t:"Collateral Management: forecast \u00a320.4m vs baseline \u00a312.0m \u2014 vendor and resource lines don't reconcile." },
  { cat:"delivery",  t:"2 projects haven't refreshed in 6 days." },
];

// INSIGHTS — gated by accumulated history.
//   kind:"trend"      (min 2) needs a few cycles of accrued snapshots
//   kind:"predictive" (min 3) needs 6\u201312 months of structured history
export const INSIGHTS: any[] = [
  { min:2, kind:"trend",      cat:"delivery",  t:"AG1 is averaging 4 weeks across the portfolio \u2014 the Compliance review is the recurring hold.", a:"Stand up a fixed Compliance slot for AG1." },
  { min:2, kind:"trend",      cat:"financial", t:"Collateral Management forecast revised up four weeks running (\u00a312.0m \u2192 \u00a320.4m) with no change request.", a:"Raise a CR; review reforecast governance." },
  { min:2, kind:"resource",   cat:"resource",  t:"Collateral Management is 2 BAs short from week 5; a test-analyst gap opens week 7.", a:"Re-plan resourcing or escalate to sponsor." },
  { min:3, kind:"predictive", cat:"delivery",  t:"Predicted: Confirmations Automation will miss its AG1 date by ~2 weeks at the current approval velocity.", a:"Escalate now to recover the date." },
  { min:3, kind:"predictive", cat:"financial", t:"Predicted: two further projects show the early signature of the same forecast-drift pattern.", a:"Pre-emptive forecast review." },
  { min:3, kind:"theme",      cat:"theme",     t:"Theme: vendor SoW sign-off has cost ~7 weeks across 4 projects this quarter.", a:"Evidence pack for the procurement conversation." },
  { min:3, kind:"theme",      cat:"theme",     t:"Dependency cascade: a Reference Data slip threatens 3 downstream milestones.", a:"Sequence review at portfolio level." },
  { min:3, kind:"predictive", cat:"delivery",  t:"Prioritise this week: Confirmations Automation (gate stall) and Collateral Management (budget-breach risk).", a:"Two items for the portfolio decision forum." },
];

export const POLICY: any[] = [
  { en:{ q:"What tolerance is allowed before a change request is required?",
         a:"Forecast movements within \u00b15% of the approved baseline can be absorbed without a change request. Beyond that threshold a CR must be raised and approved before the forecast is amended.",
         c:"Source: Financial Management Guide 2, \u00a74.3 (illustrative)" },
    jp:{ q:"\u5909\u66f4\u7533\u8acb\u304c\u5fc5\u8981\u306b\u306a\u308b\u524d\u306e\u8a31\u5bb9\u7bc4\u56f2\u306f\uff1f",
         a:"\u627f\u8a8d\u3055\u308c\u305f\u30d9\u30fc\u30b9\u30e9\u30a4\u30f3\u306e\u00b15\uff05\u4ee5\u5185\u306e\u4e88\u6e2c\u5909\u52d5\u306f\u5909\u66f4\u7533\u8acb\u306a\u3057\u3067\u5438\u53ce\u3067\u304d\u307e\u3059\u3002\u3053\u308c\u3092\u8d85\u3048\u308b\u5834\u5408\u306f\u3001\u4e88\u6e2c\u3092\u4fee\u6b63\u3059\u308b\u524d\u306bCR\u306e\u63d0\u51fa\u3068\u627f\u8a8d\u304c\u5fc5\u8981\u3067\u3059\u3002",
         c:"\u51fa\u5178: \u8ca1\u52d9\u7ba1\u7406\u30ac\u30a4\u30c92 \u00a74.3\uff08\u53c2\u8003\uff09" } },
  { en:{ q:"When does a budget increase need Tokyo (Head Office) approval?",
         a:"Any uplift that takes total approved spend above the sanctioned envelope requires Head Office (Tokyo) authorisation. Allow for the additional approval lead time when planning the reforecast.",
         c:"Source: Financial Management Guide 1, \u00a73.1 (illustrative)" },
    jp:{ q:"\u4e88\u7b97\u5897\u984d\u306b\u672c\u793e\uff08\u6771\u4eac\uff09\u306e\u627f\u8a8d\u304c\u5fc5\u8981\u306a\u306e\u306f\u3044\u3064\uff1f",
         a:"\u627f\u8a8d\u6e08\u307f\u306e\u4e0a\u9650\u3092\u8d85\u3048\u308b\u652f\u51fa\u306e\u5897\u984d\u306f\u672c\u793e\uff08\u6771\u4eac\uff09\u306e\u627f\u8a8d\u304c\u5fc5\u8981\u3067\u3059\u3002\u518d\u4e88\u6e2c\u306e\u8a08\u753b\u6642\u306b\u306f\u8ffd\u52a0\u306e\u627f\u8a8d\u671f\u9593\u3092\u8003\u616e\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
         c:"\u51fa\u5178: \u8ca1\u52d9\u7ba1\u7406\u30ac\u30a4\u30c91 \u00a73.1\uff08\u53c2\u8003\uff09" } },
  { en:{ q:"Which artefacts are required to clear assurance gate AG1?",
         a:"AG1 (end of planning) requires five artefacts \u2014 the PID, business case, high-level plan, security assessment and architecture overview \u2014 each approved by the ten review teams before the gate can close.",
         c:"Source: Assurance Framework, Gate 1 criteria (illustrative)" },
    jp:{ q:"AG1\u3092\u901a\u904e\u3059\u308b\u306b\u306f\u3069\u306e\u6210\u679c\u7269\u304c\u5fc5\u8981\uff1f",
         a:"AG1\uff08\u8a08\u753b\u7d42\u4e86\uff09\u3067\u306f5\u3064\u306e\u6210\u679c\u7269\uff08PID\u3001\u30d3\u30b8\u30cd\u30b9\u30b1\u30fc\u30b9\u3001\u4e0a\u4f4d\u8a08\u753b\u3001\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3\u8a55\u4fa1\u3001\u30a2\u30fc\u30ad\u30c6\u30af\u30c1\u30e3\u6982\u8981\uff09\u304c\u5fc5\u8981\u3067\u3001\u30b2\u30fc\u30c8\u3092\u9589\u3058\u308b\u524d\u306b10\u306e\u30ec\u30d3\u30e5\u30fc\u30c1\u30fc\u30e0\u304c\u627f\u8a8d\u3057\u307e\u3059\u3002",
         c:"\u51fa\u5178: \u30a2\u30b7\u30e5\u30a2\u30e9\u30f3\u30b9\u30d5\u30ec\u30fc\u30e0\u30ef\u30fc\u30af\u3001\u30b2\u30fc\u30c81\u57fa\u6e96\uff08\u53c2\u8003\uff09" } },
];

export const LIVE: any = {
  0:["Read-only connections + data-hygiene scoring \u2014 we trust the data before acting on it",
     "Bilingual (EN / \u65e5\u672c\u8a9e) document & policy assistant \u2014 the immediate quick win",
     "Structured capture begins \u2014 the substrate starts to fill (no predictions yet)"],
  1:["Everything in Foundation, plus the two solutions we'd prove first:",
     "Stage-Gate Tracker \u2014 see exactly where each project is stuck (current-state fact)",
     "Financial Mismatch \u2014 forecast vs actuals, line-by-line reconciliation",
     "A real-time portfolio view of current state",
     "Insight here is current fact only \u2014 no patterns yet, because there's no history yet"],
  2:["Everything in Prove, plus what the accruing history unlocks:",
     "Artefact Studio \u2014 status reports generated and written back into Plan View",
     "Early-warning on the mismatch \u2014 forecast drift, uncommitted costs, first resource flags",
     "Gate patterns \u2014 e.g. \u201CAG1 averages 4 weeks; Compliance is the recurring hold\u201D"],
  3:["Everything in Compound, plus genuine intelligence \u2014 only possible now:",
     "Predictive cross-portfolio insight \u2014 slippage, dependency cascades, benefits drift",
     "Prioritisation & escalation, and decision-focused governance packs",
     "The proven engine extends to procurement and vendor / SoW flows"],
};

export const PILLARS: any = {
  0:["Knowledge / documents","Capture"],
  1:["Knowledge","Gate visibility","Financial mismatch","Portfolio view"],
  2:["Knowledge","Gates + patterns","Financial early-warning","Artefacts + write-back"],
  3:["All of the above","Cross-portfolio intelligence","Procurement & vendor flows","Decision governance"],
};

// Clean MUFG mark (rebuilt as SVG — the uploaded asset was watermarked).
// Swap for the official asset in Cursor.
export const MUFG_LOGO = `<svg width="104" height="28" viewBox="0 0 236 60" aria-label="MUFG">
  <circle cx="44" cy="30" r="23" fill="none" stroke="#E50000" stroke-width="11"/>
  <circle cx="72" cy="30" r="23" fill="none" stroke="#E50000" stroke-width="11"/>
  <circle cx="72" cy="30" r="8.5" fill="#E50000"/>
  <text x="108" y="44" font-family="'Noto Sans',sans-serif" font-weight="700" font-size="40" fill="#58595B" letter-spacing="2">MUFG</text>
</svg>`;
