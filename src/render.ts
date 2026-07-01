// ============================================================================
// MUFG Connected Delivery — screen renderers
// Each function returns an HTML string. App.tsx mounts these and handles clicks
// via data-action attributes. Edit data in data.ts; edit screens here.
// Refactor into React components in Cursor if/when you want.
// ============================================================================
import { LEVELS, NAV, CONNECTORS, PROJECTS, INSIGHTS, FACTS, POLICY, LIVE, PILLARS, MUFG_LOGO } from "./data";

type S = any;

/* ----------------------------- helpers ----------------------------------- */
const arrow = `<span class="arrowdot">\u203A</span>`;
const fmt = (n:number) => n.toLocaleString();
const confColor = (c:number) => c>=75 ? "var(--green)" : c>=55 ? "var(--amber)" : "var(--sred)";
const ragPill = (r:string) => `<span class="pill ${r}"><span class="rag ${r}"></span>${r==="red"?"Off track":r==="amber"?"At risk":"On track"}</span>`;
const bar = (pct:number,color:string) => `<div class="bartrack"><div class="barfill" style="width:${pct}%;background:${color}"></div></div>`;
const hd = (eyebrow:string,title:string,desc?:string) =>
  `<div class="pagehd"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${desc?`<p>${desc}</p>`:""}</div>`;

const LEVEL_ENABLES: Record<number,string> = {
  0: "Connect sources, score what can be trusted.",
  1: "Enough to show current state \u2014 gate stalls and financial mismatch.",
  2: "Enough history for early warnings and patterns.",
  3: "Enough to predict, and to extend to new flows.",
};

/* ------------------------------- TOP BAR ---------------------------------- */
export function renderTopbar(S:S){
  const L = LEVELS[S.level];
  const levels = `<span class="lbl">Build level</span>` + LEVELS.map((l:any)=>`
    <button class="levelbtn ${S.level===l.n?"active":""}" data-action="setlevel" data-n="${l.n}">
      <span class="n">LEVEL ${l.n}</span><span class="nm">${l.name}</span>
    </button>`).join("");
  const right = `
    <span class="pillmini">Structured history <b>${L.hist}</b></span>
    <span class="pillmini">Confidence <b>${L.conf}%</b></span>
    <span class="pillmini"><span class="dot"></span> data in \u00b7 no data out</span>
    <span class="pillmini">Illustrative \u00b7 synthetic data</span>`;
  return `<div class="brand">${MUFG_LOGO}<span class="sub">Connected Delivery</span></div>
          <div class="levels">${levels}</div>
          <div class="topright">${right}</div>`;
}

/* ------------------------------- SIDEBAR ---------------------------------- */
export function renderSidebar(S:S){
  let html = "", last = "__init";
  NAV.forEach((item:any)=>{
    const g = item.group || "";
    if(g !== last){ html += g ? `<div class="navgroup">${g}</div>` : `<div style="height:6px"></div>`; last = g; }
    const locked = S.level < item.min;
    html += `<div class="navitem ${S.nav===item.id?"active":""} ${locked?"locked":""}" ${locked?"":`data-action="nav" data-id="${item.id}"`}>
        <span class="nicon">${item.icon}</span><span>${item.label}</span>
        ${locked ? `<span class="navlock">\u{1F512} L${item.min}</span>` : (item.badge ? `<span class="navbadge">${item.badge}</span>` : "")}
      </div>`;
  });
  const L = LEVELS[S.level];
  html += `<div class="sidefoot"><b style="color:var(--ink)">Level ${S.level} \u2014 ${L.name}</b><br>Structured history: ${L.hist}<br>${L.connectors} sources connected<br><br>All data on these screens is synthetic and illustrative.</div>`;
  return html;
}

/* ------------------------------- SCREENS ---------------------------------- */
function scrFoundation(S:S){
  const L = LEVELS[S.level];
  const pillars = PILLARS[S.level];
  let html = hd("Foundation \u00b7 the data spine", "MUFG Connected Delivery",
    `Level ${L.n}. ${L.name} \u2014 ${L.tag}. We start narrow and build up: each level captures more, and insight only appears once the history exists to support it. Nothing is replaced.`);

  html += `<div class="kpis" style="grid-template-columns:repeat(3,1fr)">
    <div class="kpi"><div class="k">Structured history</div><div class="v" style="font-size:21px">${L.hist}</div><div style="margin-top:8px">${bar(L.histPct,"var(--mufg-red)")}</div></div>
    <div class="kpi"><div class="k">Data confidence</div><div class="v">${L.conf}%</div><div style="margin-top:8px">${bar(L.conf,confColor(L.conf))}</div></div>
    <div class="kpi"><div class="k">Sources connected</div><div class="v">${L.connectors}<small> / 9</small></div></div>
  </div>`;

  html += `<div class="card" style="margin-bottom:16px"><div class="ch"><h3>Your delivery data, building up</h3><span class="muted small" style="margin-left:auto">You are here: ${L.name}</span></div>
    <div class="cb">${LEVELS.map((lv:any)=>{
      const cur = S.level === lv.n;
      return `<div class="teamrow" style="gap:12px">
        <span class="${cur?"b":""}" style="${cur?"color:var(--mufg-red)":""};min-width:130px">${lv.name}</span>
        <span class="muted small" style="min-width:88px">${lv.hist}</span>
        <span style="flex:1;min-width:72px">${bar(lv.histPct, cur?"var(--mufg-red)":"#c9cbcd")}</span>
        <span class="muted small" style="flex:2">${LEVEL_ENABLES[lv.n]}</span>
      </div>`;
    }).join("")}
    <p class="muted small" style="margin:10px 0 0">It all starts with connected, trusted data. The more structured delivery data you capture, the more the platform can do.</p></div></div>`;

  // architecture bands
  html += `<div class="card" style="margin-bottom:16px"><div class="ch"><h3>How it fits together</h3><span class="muted small" style="margin-left:auto">We surface, track and generate \u2014 we don't re-engineer what you don't own</span></div><div class="cb"><div class="bands">
      <div class="band"><div class="bt">Applications (what you use)</div><div class="chips">${pillars.map((p:string)=>`<span class="pillarbox on"><span class="pd"></span>${p}</span>`).join("")}</div></div>
      ${L.wb ? `<div class="wbarrow">\u2193 generated artefacts write back to Plan View \u2193</div>` : `<div class="wbarrow" style="color:var(--muted)">\u2191 read-only \u2014 write-back unlocks at Compound \u2191</div>`}
      <div class="band"><div class="bt">Data & consolidation layer (the spine)</div><div class="chips">${CONNECTORS.map((c:any)=>`<span class="chip ${c.lvl<=S.level?"lit":"off"}"><span class="ld"></span>${c.name}</span>`).join("")}</div></div>
      <div class="band base"><div class="bt">Systems of record \u2014 read-only, you own them, we don't change them</div><div class="chips"><span class="chip">Oracle ERP</span><span class="chip">Assurance-gate framework</span><span class="chip">Procurement</span><span class="chip">Vendor / SoW</span></div></div>
    </div></div></div>`;

  // whats live + next
  html += `<div class="row"><div class="card" style="flex:1"><div class="ch"><h3>What's live at Level ${L.n}</h3></div><div class="cb"><ul style="margin:0;padding-left:18px;line-height:1.9">${LIVE[S.level].map((x:string)=>`<li>${x}</li>`).join("")}</ul></div></div>`;
  if(S.level < 3){ const nx = LEVELS[S.level+1];
    html += `<div class="card" style="flex:0 0 320px"><div class="ch"><h3>Next: Level ${nx.n} \u2014 ${nx.name}</h3></div><div class="cb"><p class="muted" style="margin-top:0">${nx.tag}. History grows to ${nx.hist}; confidence to ${nx.conf}%.</p><button class="btn primary" data-action="setlevel" data-n="${nx.n}">${arrow} Build to ${nx.name}</button></div></div>`;
  } else {
    html += `<div class="card" style="flex:0 0 320px"><div class="ch"><h3>Fully built</h3></div><div class="cb"><p class="muted" style="margin-top:0">Predict & expand does more than the two solutions we started with \u2014 because the substrate underneath now makes prediction possible.</p><button class="btn" data-action="setlevel" data-n="0">Replay from Foundation</button></div></div>`;
  }
  html += `</div>`;
  return html;
}

function scrPolicy(S:S){
  let html = hd("Knowledge \u00b7 Foundation", "Policy Assistant",
    "A chatbot over your financial-management policy and process guides \u2014 300+ pages, partly in Japanese. Cited answers, in either language. The first thing we connect: it helps immediately and needs no history.");
  html += `<div class="row"><div class="card" style="flex:1">
    <div class="ch"><h3>Ask the policy</h3><div style="margin-left:auto" class="langtoggle"><button class="${S.lang==="en"?"on":""}" data-action="lang" data-l="en">EN</button><button class="${S.lang==="jp"?"on":""}" data-action="lang" data-l="jp">\u65e5\u672c\u8a9e</button></div></div>
    <div class="cb"><div class="chat"><div class="msgs" id="msgs">${
      S.chat.length===0 ? `<div class="msg a">Ask a question about the financial-management policy, or pick one below. <span class="illus">AI output \u2014 illustrative</span></div>`
      : S.chat.map((m:any)=> m.role==="u" ? `<div class="msg u">${m.text}</div>` : `<div class="msg a">${m.text}<div class="cite">${m.cite}</div></div>`).join("")
    }</div>
    <div class="presets">${POLICY.map((p:any,i:number)=>`<span class="preset" data-action="ask" data-i="${i}">${p[S.lang].q}</span>`).join("")}</div>
    <div class="chatin"><input id="chatinput" placeholder="${S.lang==="en"?"Type a question\u2026":"\u8cea\u554f\u3092\u5165\u529b\u2026"}"><button class="btn primary" data-action="asktext">${arrow} Ask</button></div>
    </div></div></div>
    <div class="card" style="flex:0 0 300px"><div class="ch"><h3>What this captures</h3></div><div class="cb"><p class="muted small" style="margin-top:0">Indexing your policy and process guides is step one of the data layer. Every later level builds on what's captured here.</p>
      <div class="callout info" style="margin-top:8px">Sources read (read-only): financial-management policy (3 guides), assurance framework, process guides. <span class="illus">illustrative</span></div></div></div>
    </div>`;
  return html;
}

function scrPortfolio(S:S){
  const off = PROJECTS.filter((p:any)=>p.rag!=="green").length;
  const overdue = PROJECTS.filter((p:any)=>p.days>14).length;
  const val = PROJECTS.reduce((a:number,p:any)=>a+p.budget,0).toFixed(1);
  let html = hd("Delivery \u00b7 Prove", "Portfolio Command",
    "Every project in flight \u2014 run-the-bank and change-the-bank \u2014 in one real-time view. Refreshed from the connected sources, not a Friday-afternoon snapshot.");
  html += `<div class="kpis">
    <div class="kpi"><div class="k">Active projects</div><div class="v">${PROJECTS.length}</div></div>
    <div class="kpi"><div class="k">Portfolio value</div><div class="v">\u00a3${val}m</div></div>
    <div class="kpi alert"><div class="k">Off track</div><div class="v">${off}</div></div>
    <div class="kpi alert"><div class="k">Gates overdue</div><div class="v">${overdue}</div></div>
    <div class="kpi"><div class="k">Data confidence</div><div class="v">${LEVELS[S.level].conf}%</div></div>
  </div>`;
  html += `<div class="row"><div class="card" style="flex:1"><div class="ch"><h3>Portfolio</h3><span class="muted small" style="margin-left:auto">Last refreshed 4 min ago \u00b7 live</span></div>
    <table><thead><tr><th>Project</th><th>Type</th><th>Owner</th><th>Gate</th><th>Status</th><th>Budget</th><th>Forecast</th><th>Var.</th></tr></thead><tbody>
    ${PROJECTS.map((p:any)=>{const v=(p.forecast-p.budget); const vs=v>0.05?`<span class="over">+\u00a3${v.toFixed(1)}m</span>`:v<-0.05?`<span class="under">\u2212\u00a3${Math.abs(v).toFixed(1)}m</span>`:`<span class="muted">\u2014</span>`;
      return `<tr data-action="proj" data-name="${p.name}"><td class="b">${p.name}${p.hook?`<div class="muted small" style="font-weight:400">${p.hook}</div>`:""}</td><td><span class="ttype">${p.type}</span></td><td>${p.owner}</td><td>${p.gate}</td><td>${ragPill(p.rag)}</td><td>\u00a3${p.budget.toFixed(1)}m</td><td>\u00a3${p.forecast.toFixed(1)}m</td><td>${vs}</td></tr>`;}).join("")}
    </tbody></table></div>
    <div class="card" style="flex:0 0 300px"><div class="ch"><h3>Current state</h3><span class="illus" style="margin-left:auto">facts, not predictions</span></div><div class="cb">
      ${FACTS.map((f:any)=>`<div class="insight"><span class="ibadge ${f.cat}">${f.cat.toUpperCase()}</span><div>${f.t}</div></div>`).join("")}
      <div class="callout info" style="margin-top:10px"><div>\u2139</div><div>This is current state only. Patterns and predictions appear at higher levels, once history accrues.</div></div>
    </div></div></div>`;
  return html;
}

function scrGates(S:S){
  const lanes = ["AG1","AG2","AG3"];
  const projects = S.gateProjects || [];
  let html = hd("Delivery \u00b7 Prove", "Stage-Gate Tracker",
    "Where every project is stuck, across assurance gates AG1\u2013AG3. The data already lives in Plan View \u2014 we elevate it to the right form, and draft the chase.");
  if(S.level >= 2){
    html += `<div class="callout warn" style="margin-bottom:14px"><div>\u26A0</div><div><b>Pattern (now history exists):</b> AG1 is averaging 4 weeks across the portfolio \u2014 the Compliance review is the recurring hold.</div></div>`;
  } else {
    html += `<div class="callout info" style="margin-bottom:14px"><div>\u2139</div><div><b>Current state only.</b> Gate patterns (e.g. average time per gate, recurring holds) appear at Compound, once a few cycles of history have accrued.</div></div>`;
  }
  html += `<div id="gate-inbox-mount"></div>`;
  html += `<div class="row"><div style="flex:1"><div class="lanes">${lanes.map(g=>{
    const items = projects.filter((p:any)=>p.gate===g);
    return `<div class="lane"><h4>${g}<span>${items.length} project${items.length!==1?"s":""}</span></h4>${items.map((p:any)=>{
      const sel = S.gate===p.name?"sel":""; const late = p.daysInGate>14;
      const appr = p.approvers.filter((a:any)=>a.status==="approved").length;
      const req = (p.requiredApproverIds?.length) || p.approvers.length;
      const chased = p.lastChasedAt ? `<span class="pill grey" style="font-size:10px;margin-left:6px">Chased</span>` : "";
      const hist = p.history?.length ? `<span class="muted small" style="display:block;font-weight:400;margin-top:2px">${p.history[p.history.length-1].fromGate} \u2192 ${p.history[p.history.length-1].toGate}</span>` : "";
      return `<div class="gcard ${p.rag==="red"?"red":""} ${sel}" data-action="gate" data-name="${p.name}">
        <div class="gt"><span class="rag ${p.rag}"></span>${p.name}${chased}${hist}</div>
        <div class="gm"><span>${appr}/${req} approved</span><span style="color:${late?"var(--sred)":"var(--muted)"}">${p.daysInGate}d in gate</span></div>
        <div style="margin-top:7px">${bar(Math.round(appr/Math.max(req,1)*100), appr>=req-1?"var(--green)":appr>=req-3?"var(--amber)":"var(--sred)")}</div>
      </div>`;}).join("")||`<div class="muted small">None</div>`}</div>`;
  }).join("")}</div></div>`;
  const p = projects.find((x:any)=>x.name===S.gate);
  html += `<div class="card" style="flex:0 0 360px">${ p ? `
    <div class="ch"><h3>${p.name}</h3><span class="pill ${p.rag}" style="margin-left:auto"><span class="rag ${p.rag}"></span>${p.gate}</span></div>
    <div id="gate-chase-mount"></div>`
    : `<div class="ch"><h3>Gate detail</h3></div><div class="cb"><p class="muted">Select a project card to see its 10-team approval matrix, the drafted chase, and the escalation option.</p></div>` }
  </div></div>`;
  return html;
}

function scrFinance(S:S){
  const p = PROJECTS[1]; // Collateral Management
  let html = hd(`Financial \u00b7 ${S.level>=2?"Compound":"Prove"}`, "Forecast & Mismatch",
    "Forecast vs actuals \u2014 where the money doesn't reconcile. Read-only from Oracle and Plan View. We sharpen the bit in your control: reporting visibility and uncommitted costs. We don't touch group financial policy.");
  html += `<div class="callout info" style="margin-bottom:14px"><div>\u2139</div><div>Read-only from Oracle (actuals) and Plan View (forecast).</div></div>`;
  html += `<div class="kpis" style="grid-template-columns:repeat(4,1fr)">
    <div class="kpi"><div class="k">${p.name} \u00b7 baseline</div><div class="v">\u00a3${p.budget.toFixed(1)}m</div></div>
    <div class="kpi alert"><div class="k">Current forecast</div><div class="v">\u00a3${p.forecast.toFixed(1)}m</div></div>
    <div class="kpi alert"><div class="k">Lines not reconciling</div><div class="v">2</div></div>
    <div class="kpi"><div class="k">CRs raised</div><div class="v">0</div></div>
  </div>`;
  // Level 1: current-state reconciliation only
  const lines = [["Build","8.0","7.6",true],["Vendor","6.4","3.0",false],["Resource","4.0","1.4",false],["Licences","2.0","2.0",true]];
  html += `<div class="card" style="margin-bottom:14px"><div class="ch"><h3>Line-by-line reconciliation (current state)</h3><span class="illus" style="margin-left:auto">fact, not prediction</span></div><div class="cb">
    <table><thead><tr><th>Line</th><th>Forecast</th><th>Committed / actual</th><th>Reconciles?</th></tr></thead><tbody>
    ${lines.map(l=>`<tr><td class="b">${l[0]}</td><td>\u00a3${l[1]}m</td><td>\u00a3${l[2]}m</td><td>${l[3]?`<span class="pill green">\u2713 Yes</span>`:`<span class="pill red">\u2715 No</span>`}</td></tr>`).join("")}
    </tbody></table></div></div>`;
  if(S.level >= 2){
    html += `<div class="row"><div class="card" style="flex:1"><div class="ch"><h3>Forecast change history (needs accrued snapshots)</h3></div><div class="cb">
      ${[["4 weeks ago","\u00a312.0m","baseline"],["3 weeks ago","\u00a314.2m","vendor lines up, no CR"],["2 weeks ago","\u00a318.0m","added test cycle, no CR"],["This week","\u00a320.4m","resource uplift, no CR"]].map(r=>`<div class="teamrow"><span>${r[0]} \u2014 <b>${r[1]}</b></span><span class="muted small">${r[2]}</span></div>`).join("")}
      <div class="callout warn" style="margin-top:12px"><div>\u26A0</div><div>Forecast revised up four weeks running with no change request. +70% over baseline \u2014 above the envelope, so Tokyo (Head Office) approval is required. Allow lead time.</div></div>
    </div></div>
    <div class="card" style="flex:0 0 340px"><div class="ch"><h3>Predictive resource flags</h3></div><div class="cb">
      <div class="callout warn"><div>\u26A0</div><div><b>Week 5:</b> 2 BAs short on ${p.name}.</div></div>
      <div class="callout warn" style="margin-top:8px"><div>\u26A0</div><div><b>Week 7:</b> test-analyst gap \u2014 UAT at risk.</div></div>
      <div class="callout info" style="margin-top:8px"><div>\u2139</div><div>\u00a33.4m uncommitted costs unflagged across 3 projects. <span class="illus">illustrative</span></div></div>
    </div></div></div>`;
  } else {
    html += `<div class="callout info"><div>\u2139</div><div><b>Early-warning unlocks at Compound.</b> Drift detection ("revised four weeks running"), predictive resource gaps and uncommitted-cost trends all need a few cycles of accrued snapshots. Right now this is current-state reconciliation only.</div></div>`;
  }
  return html;
}

function scrArtefacts(S:S){
  const steps = ["Sources","Generate","Review & sign off","Write back"];
  let html = hd("Reporting \u00b7 Compound", "Artefact Studio",
    "Generate the status report from the connected sources \u2014 then write it back into Plan View. Building the report is what builds your data layer; writing it back is what makes it your source of truth, not a dead end.");
  html += `<div class="steps">${steps.map((s,i)=>`<div class="step ${i<S.step?"done":""} ${i===S.step?"cur":""}"><div class="sn">STEP ${i+1}</div><div class="st">${s}</div></div>`).join("")}</div>`;
  html += `<div class="row"><div class="card" style="flex:1"><div class="cb">`;
  if(S.step===0){
    html += `<h4>Pulling from your sources</h4><p class="muted small">A status report draws from everywhere the truth lives \u2014 not just one tool.</p>
      <div class="chips" style="margin:10px 0">${["Plan View","Teams","Outlook","Jira","SharePoint","Asana"].map(c=>`<span class="chip lit"><span class="ld"></span>${c}</span>`).join("")}</div>
      <button class="btn primary" data-action="step" data-n="1">${arrow} Generate PSR for Collateral Management</button>`;
  } else if(S.step===1 || S.step===2){
    html += `<div class="docdraft"><h4>Project Status Report \u2014 Collateral Management Migration <span class="illus">AI-generated \u00b7 illustrative</span></h4>
      <div class="line"><b>Status:</b> Red \u2014 budget breach risk; AG3 in progress.</div>
      <div class="line"><b>Progress:</b> Migration build 72% complete; UAT planning underway.</div>
      <div class="line"><b>Risks:</b> Forecast +70% over baseline, no CR raised; 2 BAs short from week 5.</div>
      <div class="line"><b>Blockers:</b> Finance approval outstanding at AG3.</div>
      <div class="line"><b>Budget:</b> Baseline \u00a312.0m \u00b7 Forecast \u00a320.4m \u00b7 \u00a33.4m uncommitted.</div></div>`;
    if(S.step===1) html += `<div style="display:flex;gap:8px;margin-top:12px"><button class="btn primary" data-action="step" data-n="2">${arrow} Edit & sign off</button></div>`;
    else html += `<div class="callout ok" style="margin-top:12px"><div>\u270D</div><div>Human in the loop: edit any line, then sign off. Nothing is published automatically.</div></div>
      <div style="display:flex;gap:8px;margin-top:12px"><button class="btn primary" data-action="step" data-n="3">${arrow} Sign off & write back to Plan View</button></div>`;
  } else {
    html += `<div class="callout ok"><div>\u2713</div><div><b>Written back to Plan View.</b> Next cycle's report starts from here \u2014 it compounds instead of resetting. This is the answer to \u201Cso what \u2014 where does the data go?\u201D</div></div>
      <div class="wbarrow" style="margin:16px 0">Artefact Studio \u2192 Plan View (the one place we write to)</div>
      <button class="btn" data-action="step" data-n="0">Run another</button>`;
  }
  html += `</div></div>
    <div class="card" style="flex:0 0 300px"><div class="ch"><h3>Why this matters</h3></div><div class="cb"><p class="muted small" style="margin-top:0">The report isn't the prize. Producing it forces the consolidated, trusted data layer that powers the gate tracker and the financial early-warning. And the write-back means your source of truth gets better every cycle.</p></div></div></div>`;
  return html;
}

function scrGovernance(S:S){
  let html = hd("Reporting \u00b7 Predict & expand", "Governance Packs",
    "Packs generated for each forum \u2014 with the decisions surfaced first. The forum opens on what needs deciding, not forty slides of status.");
  html += `<div style="display:flex;gap:8px;margin-bottom:14px"><button class="btn ${S.gov==="steerco"?"primary":""}" data-action="gov" data-v="steerco">Steerco (programme)</button><button class="btn ${S.gov==="portfolio"?"primary":""}" data-action="gov" data-v="portfolio">Portfolio Committee</button></div>`;
  const decisions = S.gov==="steerco"
    ? [["Confirmations Automation","Approve Compliance fast-track to clear AG1 (4 weeks stalled)","Daniel Okafor \u2192 Steerco chair"],["Reference Data Consolidation","Approve additional BA to hold the plan","Marcus Lee \u2192 Steerco chair"]]
    : [["Collateral Management","Approve reforecast \u00a312.0m\u2192\u00a320.4m (needs Tokyo) or re-scope","Portfolio Committee + Head Office"],["Portfolio resourcing","Approve cross-project BA reallocation, weeks 5\u20137","Portfolio Committee"]];
  html += `<div class="row"><div class="card" style="flex:0 0 360px"><div class="ch"><h3>Decisions required this cycle</h3></div><div class="cb">`;
  html += decisions.map((d:any)=>`<div class="callout warn" style="margin-bottom:8px"><div class="ibadge financial">DECIDE</div><div><b>${d[0]}</b><br>${d[1]}<div class="muted small" style="margin-top:4px">${d[2]}</div></div></div>`).join("");
  html += `</div></div>
    <div class="card" style="flex:1"><div class="ch"><h3>${S.gov==="steerco"?"Steerco":"Portfolio"} pack \u2014 for information</h3><span class="illus" style="margin-left:auto">AI-generated</span></div><div class="cb">
    <table><thead><tr><th>Project</th><th>Status</th><th>Gate</th><th>Forecast var.</th></tr></thead><tbody>
    ${PROJECTS.slice(0, S.gov==="steerco"?6:10).map((p:any)=>{const v=p.forecast-p.budget;return `<tr><td class="b">${p.name}</td><td>${ragPill(p.rag)}</td><td>${p.gate}</td><td>${v>0.05?`<span class="over">+\u00a3${v.toFixed(1)}m</span>`:`<span class="muted">\u2014</span>`}</td></tr>`;}).join("")}
    </tbody></table>
    <p class="muted small" style="margin-top:10px">Everything here goes out <b>before</b> the meeting. The room spends its time on the decisions panel.</p>
    </div></div></div>`;
  return html;
}

function flowBoard(title:string, stages:any[], items:any[], callout?:string){
  let html = `<div class="card"><div class="ch"><h3>${title}</h3><span class="illus" style="margin-left:auto">read-only \u00b7 illustrative</span></div><div class="cb">`;
  if(callout) html += `<div class="callout warn" style="margin-bottom:12px"><div>\u26A0</div><div>${callout}</div></div>`;
  html += `<div class="lanes" style="grid-template-columns:repeat(${stages.length},1fr)">${stages.map((st:any)=>`<div class="lane"><h4 style="font-size:12px">${st.name}</h4>${(items.filter((i:any)=>i.stage===st.name)).map((i:any)=>`<div class="gcard ${i.late?"red":""}"><div class="gt" style="font-size:12px">${i.name}</div><div class="gm"><span>${i.owner}</span><span style="color:${i.late?"var(--sred)":"var(--muted)"}">${i.days}d</span></div></div>`).join("")||`<div class="muted small">\u2014</div>`}</div>`).join("")}</div></div></div>`;
  return html;
}
function scrProcurement(S:S){
  const stages=[{name:"Requisition"},{name:"Commercial review"},{name:"Approval"},{name:"PO"},{name:"Invoice"}];
  const items=[
    {name:"Vendor A \u2014 testing",stage:"Commercial review",owner:"E. Vasquez",days:11,late:true},
    {name:"Vendor B \u2014 data migration",stage:"Commercial review",owner:"M. Lee",days:9,late:true},
    {name:"Vendor C \u2014 SME days",stage:"Approval",owner:"P. Nair",days:5},
    {name:"Vendor D \u2014 licences",stage:"PO",owner:"O. Grant",days:2},
    {name:"Vendor E \u2014 build",stage:"Requisition",owner:"A. Rahman",days:1},
  ];
  let html = hd("Delivery flows \u00b7 Predict & expand", "Procurement Tracker",
    "The same engine as the gate tracker, pointed at a process you don't own. Lower priority \u2014 it makes life slightly easier, and gives you the evidence to make the case for the end-to-end fix later.");
  html += flowBoard("Your procurement engagements", stages, items, "<b>Stage 2 is the recurring bottleneck:</b> commercial review averaging 11 days vs a 2-day target across 4 engagements. This is the evidence pack for the procurement conversation.");
  return html;
}
function scrVendors(S:S){
  const stages=[{name:"Identify"},{name:"Onboard"},{name:"SoW draft"},{name:"SoW sign-off"},{name:"Active"}];
  const items=[
    {name:"KYC vendor",stage:"SoW sign-off",owner:"E. Vasquez",days:21,late:true},
    {name:"Surveillance vendor",stage:"Active",owner:"S. Bianchi",days:3},
    {name:"Migration partner",stage:"SoW draft",owner:"T. Whitfield",days:8},
    {name:"UAT supplier",stage:"Onboard",owner:"D. Okafor",days:6},
  ];
  let html = hd("Delivery flows \u00b7 Predict & expand", "Vendor & SoW Tracker",
    "Vendor onboarding and SoW sign-off \u2014 the thing that quietly loses weeks at project start. Another flow on the same pillar.");
  html += `<div class="kpis" style="grid-template-columns:repeat(3,1fr);margin-bottom:14px"><div class="kpi alert"><div class="k">Time lost to onboarding (qtr)</div><div class="v">~7 wks</div></div><div class="kpi"><div class="k">Engagements in flight</div><div class="v">4</div></div><div class="kpi alert"><div class="k">Stuck at SoW sign-off</div><div class="v">1</div></div></div>`;
  html += flowBoard("Vendor onboarding", stages, items, "<b>KYC vendor</b> has been at SoW sign-off for 21 days \u2014 the recurring cause of slow starts.");
  return html;
}

function scrInsights(S:S){
  const items = INSIGHTS.filter((i:any)=>i.min<=S.level);
  let html = hd("Intelligence \u00b7 Predict & expand", "AI Insights",
    "Predictive, cross-portfolio intelligence \u2014 slippage, dependency cascades, benefits drift, prioritisation. This is the part that's structurally impossible without everything beneath it.");
  html += `<div class="callout ok" style="margin-bottom:14px"><div>\u2713</div><div><b>Now possible.</b> Built on ${LEVELS[S.level].hist} of accumulated structured delivery data \u2014 none of this was possible at the earlier levels, because the data wasn't there yet.</div></div>`;
  html += `<div class="card"><div class="cb">`;
  html += items.map((i:any)=>`<div class="insight"><span class="ibadge ${i.cat}">${(i.kind==="predictive"?"PREDICTED":i.cat.toUpperCase())}</span><div><div>${i.t}</div><div class="muted small" style="margin-top:4px">\u2192 ${i.a}</div></div></div>`).join("");
  html += `</div></div>`;
  return html;
}

const SCREENS:any = { foundation:scrFoundation, policy:scrPolicy, portfolio:scrPortfolio, gates:scrGates, finance:scrFinance, artefacts:scrArtefacts, governance:scrGovernance, procurement:scrProcurement, vendors:scrVendors, insights:scrInsights, data:scrData };

export function renderMain(S:S){
  const item = NAV.find((n:any)=>n.id===S.nav);
  if(item && S.level < item.min){
    return `<div class="lockbox"><div class="lk">\u{1F512}</div><h2>${item.label} unlocks at Level ${item.min}</h2><p class="muted">This capability is part of the ${LEVELS[item.min].name} build \u2014 it needs the data and history from the levels beneath it. Nothing here is thrown away.</p><button class="btn primary" data-action="setlevel" data-n="${item.min}">${arrow} Build to ${LEVELS[item.min].name}</button></div>`;
  }
  return (SCREENS[S.nav] || scrFoundation)(S);
}

function scrData(S:S){
  const L = LEVELS[S.level];
  let html = hd("Foundation", "Data & Connectors",
    "Where the data comes from \u2014 and the one place it goes back to. Hygiene first: we score what can be trusted before acting on it. Everything is read-only except the single write-back into Plan View.");
  html += `<div class="kpis" style="grid-template-columns:repeat(3,1fr)"><div class="kpi"><div class="k">Sources connected</div><div class="v">${L.connectors}<small> / 9</small></div></div><div class="kpi"><div class="k">Structured history</div><div class="v" style="font-size:18px">${L.hist}</div></div><div class="kpi"><div class="k">Write-back</div><div class="v" style="font-size:18px">${L.wb?"Plan View":"\u2014 (Compound)"}</div></div></div>`;
  html += `<div class="grid" style="grid-template-columns:repeat(2,1fr)">${CONNECTORS.map((c:any,i:number)=>{
    const lit = c.lvl<=S.level;
    return `<div class="card"><div class="cb" style="opacity:${lit?1:.55}">
      <div style="display:flex;align-items:center;gap:8px"><span class="rag ${lit?"green":""}" style="${lit?"":"background:#c9cbcd"}"></span><b>${c.name}</b>
        ${lit?`<span class="pill grey" style="margin-left:auto">${c.wb&&L.wb?"Read / write":"Read-only"}</span>`:`<span class="pill grey" style="margin-left:auto">Lights up at L${c.lvl}</span>`}</div>
      <div class="muted small" style="margin:7px 0">Captures: ${c.cap}</div>
      <div style="display:flex;align-items:center;gap:8px"><span class="small muted">Confidence</span>${bar(lit?c.conf:8, confColor(c.conf))}<span class="small b">${lit?c.conf+"%":"\u2014"}</span></div>
      ${c.note?`<div style="margin-top:8px"><button class="btn ghost" style="padding:4px 0" data-action="note" data-i="${i}">${S.openNote===i?"Hide":"How we'd connect"} \u203A</button>${S.openNote===i?`<div class="callout info" style="margin-top:6px">${c.note}</div>`:""}</div>`:""}
      <span class="illus" style="margin-top:8px;display:inline-block">illustrative connector</span>
    </div></div>`;
  }).join("")}</div>`;
  html += `<div class="callout info" style="margin-top:14px"><div><span class="dot"></span></div><div><b>Data in, no data out.</b> Web-enabled models (GPT, Gemini) handle external lookups; reasoning runs in a walled environment (Claude, no internet). Your data is read in place and never leaves.</div></div>`;
  return html;
}
