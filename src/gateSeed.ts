import { PROJECTS, TEAMS } from "./data";
import type { GateApprover, GateProject, SteercoMember } from "./types/gate";

const TEAM_CONTACTS: Record<string, { person: string; email: string }> = {
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

function slugId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildApprovers(outstanding: string[], daysInGate: number): GateApprover[] {
  return TEAMS.map((team, index) => {
    const contact = TEAM_CONTACTS[team];
    const isOutstanding = outstanding.includes(team);
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
    };
  });
}

/** Build gate projects from the portfolio seed data. */
export function seedGateProjects(): GateProject[] {
  return PROJECTS.map((p) => ({
    id: slugId(p.name),
    name: p.name,
    gate: p.gate,
    rag: p.rag,
    owner: p.owner,
    daysInGate: p.days,
    approvers: buildApprovers(p.out, p.days),
  }));
}

export const STEERCO_MEMBERS: SteercoMember[] = [
  { id: "steerco-chair", name: "Sarah Chen", role: "Steerco Chair", email: "steerco-chair@bank.example" },
  { id: "steerco-pmo", name: "Marcus Lee", role: "Head of PMO", email: "pmo-head@bank.example" },
  { id: "steerco-cfo", name: "Tom Whitfield", role: "CFO Delegate", email: "cfo-delegate@bank.example" },
  { id: "steerco-cto", name: "Aisha Rahman", role: "CTO Delegate", email: "cto-delegate@bank.example" },
];

export function getOutstandingApprovers(project: GateProject): GateApprover[] {
  return project.approvers.filter((a) => a.status === "outstanding");
}

export function findGateProject(projects: GateProject[], name: string | null): GateProject | undefined {
  if (!name) return undefined;
  return projects.find((p) => p.name === name);
}
