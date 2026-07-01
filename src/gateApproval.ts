import { TEAMS } from "./data";
import { TEAM_CONTACTS, slugId } from "./gateSeed";
import type {
  ApprovalEvidence,
  GateApprover,
  GateHistoryEntry,
  GateProject,
} from "./types/gate";
import { DEFAULT_GATE_ORDER } from "./types/gate";

export function newEvidenceId(): string {
  return `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function newHistoryId(): string {
  return `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function requiredApproverIds(project: GateProject): string[] {
  if (project.requiredApproverIds?.length) return project.requiredApproverIds;
  return project.approvers.map((a) => a.id);
}

export function approvedCount(project: GateProject): number {
  const required = new Set(requiredApproverIds(project));
  return project.approvers.filter(
    (a) => required.has(a.id) && a.status === "approved"
  ).length;
}

export function requiredCount(project: GateProject): number {
  return requiredApproverIds(project).length;
}

export function outstandingRequired(project: GateProject): GateApprover[] {
  const required = new Set(requiredApproverIds(project));
  return project.approvers.filter(
    (a) => required.has(a.id) && a.status === "outstanding"
  );
}

export function isGateComplete(project: GateProject): boolean {
  return outstandingRequired(project).length === 0;
}

export function getNextGate(project: GateProject): string | null {
  const order = project.gateOrder.length ? project.gateOrder : DEFAULT_GATE_ORDER;
  const idx = order.indexOf(project.gate);
  if (idx < 0 || idx >= order.length - 1) return null;
  return order[idx + 1];
}

export function isFinalGate(project: GateProject): boolean {
  return getNextGate(project) === null;
}

export function freshApproversForGate(): GateApprover[] {
  return TEAMS.map((team) => {
    const contact = TEAM_CONTACTS[team];
    return {
      id: `${slugId(team)}-approver`,
      team,
      person: contact?.person,
      email: contact?.email,
      status: "outstanding" as const,
      evidence: [],
    };
  });
}

export function attachEvidenceToApprover(
  project: GateProject,
  approverId: string,
  evidence: ApprovalEvidence
): GateProject {
  const now = evidence.receivedAt;
  return {
    ...project,
    approvers: project.approvers.map((a) =>
      a.id === approverId
        ? {
            ...a,
            status: "approved" as const,
            approvedAt: now,
            evidence: [...a.evidence, evidence],
            daysOutstanding: undefined,
          }
        : a
    ),
  };
}

export function removeEvidenceFromApprover(
  project: GateProject,
  approverId: string,
  evidenceId: string
): GateProject {
  return {
    ...project,
    approvers: project.approvers.map((a) => {
      if (a.id !== approverId) return a;
      const evidence = a.evidence.filter((e) => e.id !== evidenceId);
      const stillApproved = evidence.length > 0;
      return {
        ...a,
        evidence,
        status: stillApproved ? ("approved" as const) : ("outstanding" as const),
        approvedAt: stillApproved ? a.approvedAt : undefined,
      };
    }),
  };
}

export function advanceProjectGate(project: GateProject): GateProject {
  const nextGate = getNextGate(project);
  if (!nextGate || !isGateComplete(project)) return project;

  const required = new Set(requiredApproverIds(project));
  const snapshot = project.approvers
    .filter((a) => required.has(a.id) && a.status === "approved")
    .map((a) => ({
      team: a.team,
      approvedAt: a.approvedAt,
      evidenceId: a.evidence[a.evidence.length - 1]?.id,
    }));

  const entry: GateHistoryEntry = {
    id: newHistoryId(),
    fromGate: project.gate,
    toGate: nextGate,
    advancedAt: new Date().toISOString(),
    approvalsSnapshot: snapshot,
  };

  return {
    ...project,
    gate: nextGate,
    daysInGate: 0,
    history: [...project.history, entry],
    approvers: freshApproversForGate(),
  };
}

export function updateProjectInList(
  projects: GateProject[],
  updated: GateProject
): GateProject[] {
  return projects.map((p) => (p.id === updated.id ? updated : p));
}

export function formatHistoryDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
