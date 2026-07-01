import { PROJECTS, TEAMS } from "./data";
import type { GateApprover, GateProject, SteercoMember } from "./types/gate";
import { DEFAULT_GATE_ORDER } from "./types/gate";

export const TEAM_CONTACTS: Record<string, { person: string; email: string }> = {
  Planning: { person: "James Carter", email: "planning-review@bank.example" },
  Technology: { person: "Aisha Rahman", email: "technology-review@bank.example" },
  Compliance: { person: "Priya Nair", email: "compliance-review@bank.example" },
  Architecture: { person: "Marcus Lee", email: "architecture-review@bank.example" },
  Security: { person: "Oliver Grant", email: "security-review@bank.example" },
  Risk: { person: "Daniel Okafor", email: "risk-review@bank.example" },
  Finance: { person: "Tom Whitfield", email: "finance-review@bank.example" },
  Data: { person: "Sofia Bianchi", email: "data-review@bank.example" },
  Change: { person: "Elena Vasquez", email: "change-review@bank.example" },
  Ops: { person: "Nina Patel", email: "ops-review@bank.example" },
};

export function slugId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildApprovers(
  outstanding: string[],
  daysInGate: number,
  withEvidence: GateApprover[] | null = null
): GateApprover[] {
  return TEAMS.map((team, index) => {
    const contact = TEAM_CONTACTS[team];
    const isOutstanding = outstanding.includes(team);
    const prior = withEvidence?.find((a) => a.team === team);
    const daysOutstanding = isOutstanding
      ? Math.max(1, daysInGate - index % 4)
      : undefined;
    return {
      id: `${slugId(team)}-approver`,
      team,
      person: contact?.person,
      email: contact?.email,
      status: isOutstanding ? "outstanding" : "approved",
      daysOutstanding,
      evidence: prior?.evidence ?? (isOutstanding ? [] : []),
      approvedAt: isOutstanding ? undefined : prior?.approvedAt,
    };
  });
}

/** Demo: Settlements Platform Uplift at AG2 with only Architecture outstanding. */
function demoSettlementsProject(): GateProject {
  const name = "Settlements Platform Uplift";
  const p = PROJECTS.find((x) => x.name === name)!;
  const now = new Date(Date.now() - 86400000).toISOString();
  const approvers = TEAMS.map((team) => {
    const contact = TEAM_CONTACTS[team];
    const isOutstanding = team === "Architecture";
    return {
      id: `${slugId(team)}-approver`,
      team,
      person: contact?.person,
      email: contact?.email,
      status: isOutstanding ? ("outstanding" as const) : ("approved" as const),
      daysOutstanding: isOutstanding ? 5 : undefined,
      evidence: isOutstanding
        ? []
        : [
            {
              id: `ev-seed-${slugId(team)}`,
              source: "manual" as const,
              kind: "email" as const,
              from: contact?.email,
              subject: `AG2 approval — ${name}`,
              receivedAt: now,
              snippet: `${team} sign-off recorded for AG2.`,
            },
          ],
      approvedAt: isOutstanding ? undefined : now,
    };
  });
  return {
    id: slugId(name),
    name,
    gate: "AG2",
    rag: p.rag,
    owner: p.owner,
    daysInGate: p.days,
    approvers,
    gateOrder: DEFAULT_GATE_ORDER,
    history: [
      {
        id: "hist-seed-settlements-ag1",
        fromGate: "AG1",
        toGate: "AG2",
        advancedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        approvalsSnapshot: TEAMS.map((team) => ({
          team,
          approvedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
          evidenceId: `ev-seed-ag1-${slugId(team)}`,
        })),
      },
    ],
  };
}

/** Build gate projects from the portfolio seed data. */
export function seedGateProjects(): GateProject[] {
  return PROJECTS.map((p) => {
    if (p.name === "Settlements Platform Uplift") {
      return demoSettlementsProject();
    }
    return {
      id: slugId(p.name),
      name: p.name,
      gate: p.gate,
      rag: p.rag,
      owner: p.owner,
      daysInGate: p.days,
      approvers: buildApprovers(p.out, p.days).map((a) => ({
        ...a,
        evidence: a.evidence ?? [],
      })),
      gateOrder: DEFAULT_GATE_ORDER,
      history: [],
    };
  });
}

export const STEERCO_MEMBERS: SteercoMember[] = [
  { id: "steerco-chair", name: "Sarah Chen", role: "Steerco Chair", email: "steerco-chair@bank.example" },
  { id: "steerco-pmo", name: "Marcus Lee", role: "Head of PMO", email: "pmo-head@bank.example" },
  { id: "steerco-cfo", name: "Tom Whitfield", role: "CFO Delegate", email: "cfo-delegate@bank.example" },
  { id: "steerco-cto", name: "Aisha Rahman", role: "CTO Delegate", email: "cto-delegate@bank.example" },
];

export const SEEDED_APPROVAL_EMAILS: { label: string; body: string }[] = [
  {
    label: "Architecture approves Settlements (AG2)",
    body: `From: architecture-review@bank.example
Subject: RE: AG2 approval — Settlements Platform Uplift

Hi PMO,

Architecture has reviewed the BRD and design pack. We approve Settlements Platform Uplift to proceed through AG2.

Marcus Lee
Architecture Review`,
  },
  {
    label: "Security approves Settlements (AG2)",
    body: `From: security-review@bank.example
Subject: Security sign-off — Settlements Platform Uplift AG2

Security team approves Settlements Platform Uplift for AG2. No open findings.

Oliver Grant`,
  },
  {
    label: "Compliance approves Confirmations (AG1)",
    body: `From: compliance-review@bank.example
Subject: AG1 approval — Confirmations Automation

Compliance approves Confirmations Automation to clear AG1. Please proceed.

Priya Nair`,
  },
];

export function getOutstandingApprovers(project: GateProject): GateApprover[] {
  return project.approvers.filter((a) => a.status === "outstanding");
}

export function findGateProject(projects: GateProject[], name: string | null): GateProject | undefined {
  if (!name) return undefined;
  return projects.find((p) => p.name === name);
}

export function findGateProjectById(projects: GateProject[], id: string | null): GateProject | undefined {
  if (!id) return undefined;
  return projects.find((p) => p.id === id);
}
