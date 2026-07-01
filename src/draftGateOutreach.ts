import { getAiModel, getAiProvider } from "./aiConfig";
import { getOutstandingApprovers, STEERCO_MEMBERS } from "./gateSeed";
import { buildSalutation } from "./gateEmail";
import type {
  ChaseMode,
  GateApprover,
  GateOutreachDraft,
  GateProject,
  SteercoMember,
} from "./types/gate";

const CHASE_SYSTEM = `You assist a PMO / delivery tool. A project is stuck at an assurance gate because some approving teams have not yet approved. Given the project, its gate, days in gate, and the outstanding approvers, decide which to chase NOW, give a one-line reason each (favour the ones holding the gate longest / on the critical path), flag any that warrant escalation instead of a chase, and draft ONE concise, professional chase email addressed to the recommended teams. Keep it under ~90 words, courteous, with a clear ask and a by-when. Return ONLY valid JSON, no markdown fences, no preamble.

Response shape:
{"recipients":[{"approverId":"...","recommended":true,"reason":"..."}],"subject":"...","body":"...","escalationSuggested":false,"escalationNote":null}`;

const ESCALATE_SYSTEM = `You assist a PMO / delivery tool. A project is stuck at an assurance gate. Draft a short ESCALATION note to the Steering Committee summarising the blockage: project, gate, days in gate, which teams are outstanding and for how long, the delivery impact, and the specific steer/decision requested. Recommend the Steerco distribution as recipients. Return ONLY valid JSON, no markdown fences, no preamble.

Response shape:
{"recipients":[{"approverId":"steerco-member-id","recommended":true,"reason":"..."}],"subject":"...","body":"...","escalationSuggested":false,"escalationNote":null}`;

export interface DraftGateOutreachInput {
  project: GateProject;
  mode: ChaseMode;
  steerco?: SteercoMember[];
  selectedRecipientIds?: string[];
}

function parseAiJson(raw: string): GateOutreachDraft {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as GateOutreachDraft;
  if (!parsed.subject || !parsed.body || !Array.isArray(parsed.recipients)) {
    throw new Error("Invalid AI response shape");
  }
  return {
    recipients: parsed.recipients,
    subject: parsed.subject,
    body: parsed.body,
    escalationSuggested: Boolean(parsed.escalationSuggested),
    escalationNote: parsed.escalationNote ?? null,
  };
}

function composeFallback(
  project: GateProject,
  mode: ChaseMode,
  steerco: SteercoMember[],
  filterIds?: string[]
): GateOutreachDraft {
  const outstanding = getOutstandingApprovers(project);
  const sorted = [...outstanding].sort(
    (a, b) => (b.daysOutstanding ?? 0) - (a.daysOutstanding ?? 0)
  );

  if (mode === "escalate") {
    const members = steerco.length ? steerco : STEERCO_MEMBERS;
    const recipients = members.map((m, i) => ({
      approverId: m.id,
      recommended: i < 3,
      reason: i === 0 ? "Steerco chair — decision owner" : "Needs visibility on gate stall",
    }));
    const teams = sorted.map((a) => `${a.team} (${a.daysOutstanding ?? project.daysInGate}d)`).join(", ");
    return {
      recipients,
      subject: `Escalation: ${project.name} blocked at ${project.gate}`,
      body: `Steerco,\n\n${project.name} has been at ${project.gate} for ${project.daysInGate} days. Outstanding approvals: ${teams || "none"}. This is delaying delivery and forecast reconciliation.\n\nPlease steer: authorise a fast-track review or confirm re-plan.\n\nThanks,\nPMO`,
      escalationSuggested: false,
      escalationNote: null,
    };
  }

  const candidates = filterIds?.length
    ? sorted.filter((a) => filterIds.includes(a.id))
    : sorted;
  const chaseTargets = candidates.length ? candidates : sorted;
  const top = chaseTargets.slice(0, Math.min(3, chaseTargets.length));
  const longHeld = sorted.find((a) => (a.daysOutstanding ?? 0) >= 14);

  const recipients = outstanding.map((a) => ({
    approverId: a.id,
    recommended: top.some((t) => t.id === a.id),
    reason:
      top[0]?.id === a.id
        ? `Holding the gate ${a.daysOutstanding ?? project.daysInGate}d; critical path`
        : top.some((t) => t.id === a.id)
          ? "Outstanding approval blocking gate closure"
          : "Lower priority — chase if capacity allows",
  }));

  const teamNames = top.map((a) => a.team);
  const salutation = buildSalutation(teamNames);
  const byWhen = project.daysInGate > 14 ? "end of week" : "EOD tomorrow";

  return {
    recipients,
    subject: `Approval outstanding: ${project.name} (${project.gate})`,
    body: `${salutation}\n\nYour approval for ${project.name} (${project.gate}) is outstanding and is holding the gate (${project.daysInGate} days). Could you review and approve by ${byWhen}?\n\nThank you,\nPMO`,
    escalationSuggested: Boolean(longHeld),
    escalationNote: longHeld
      ? `${longHeld.team} has been outstanding ${longHeld.daysOutstanding}d — consider Steerco escalation`
      : null,
  };
}

export async function draftGateOutreach(
  input: DraftGateOutreachInput
): Promise<GateOutreachDraft> {
  const { project, mode, steerco = STEERCO_MEMBERS, selectedRecipientIds } = input;
  const outstanding = getOutstandingApprovers(project);

  const userPayload =
    mode === "chase"
      ? {
          projectName: project.name,
          gate: project.gate,
          daysInGate: project.daysInGate,
          outstanding: (selectedRecipientIds?.length
            ? outstanding.filter((a) => selectedRecipientIds.includes(a.id))
            : outstanding
          ).map((a) => ({
            approverId: a.id,
            team: a.team,
            person: a.person,
            daysOutstanding: a.daysOutstanding ?? project.daysInGate,
          })),
        }
      : {
          projectName: project.name,
          gate: project.gate,
          daysInGate: project.daysInGate,
          outstanding: outstanding.map((a) => ({
            approverId: a.id,
            team: a.team,
            person: a.person,
            daysOutstanding: a.daysOutstanding ?? project.daysInGate,
          })),
          steerco: steerco.map((m) => ({ id: m.id, name: m.name, role: m.role })),
        };

  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: getAiProvider(),
        model: getAiModel(),
        system: mode === "chase" ? CHASE_SYSTEM : ESCALATE_SYSTEM,
        user: JSON.stringify(userPayload),
      }),
    });
    if (!res.ok) throw new Error(`AI request failed (${res.status})`);
    const data = (await res.json()) as { text?: string };
    if (!data.text) throw new Error("Empty AI response");
    return parseAiJson(data.text);
  } catch {
    return composeFallback(project, mode, steerco, selectedRecipientIds);
  }
}

export function resolveRecipientEmails(
  project: GateProject,
  mode: ChaseMode,
  selectedIds: string[],
  steerco: SteercoMember[]
): string[] {
  if (mode === "escalate") {
    return steerco.filter((m) => selectedIds.includes(m.id)).map((m) => m.email ?? "");
  }
  return project.approvers
    .filter((a) => selectedIds.includes(a.id))
    .map((a) => a.email ?? "");
}

export function recipientRows(
  project: GateProject,
  mode: ChaseMode,
  steerco: SteercoMember[]
): Array<GateApprover | SteercoMember> {
  return mode === "escalate" ? steerco : getOutstandingApprovers(project);
}
