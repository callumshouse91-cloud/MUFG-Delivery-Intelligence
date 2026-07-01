import { getAiModel, getAiProvider } from "./aiConfig";
import type { ApprovalIngestResult, GateProject } from "./types/gate";

const INGEST_SYSTEM = `You process inbound approval emails for a delivery/PMO tool. Given the raw email and a list of projects with their gates and outstanding approver teams, determine which project, which gate, and which approving team this email is granting approval for. Extract sender, subject, and a one-line summary. If it clearly does NOT approve anything, say so. Return ONLY valid JSON, no markdown fences, no preamble.

Response shape:
{"matched":true,"projectId":"...","approverId":"...","team":"Architecture","from":"...","subject":"...","summary":"...","confidence":0.85}`;

export interface IngestApprovalEmailInput {
  rawEmail: string;
  projects: GateProject[];
}

function parseIngestJson(raw: string): ApprovalIngestResult {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as ApprovalIngestResult;
  return {
    matched: Boolean(parsed.matched),
    projectId: parsed.projectId,
    approverId: parsed.approverId,
    team: parsed.team,
    from: parsed.from,
    subject: parsed.subject,
    summary: parsed.summary,
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : undefined,
  };
}

function parseEmailHeaders(raw: string): { from?: string; subject?: string; body: string } {
  const lines = raw.split(/\r?\n/);
  let from: string | undefined;
  let subject: string | undefined;
  const bodyLines: string[] = [];
  let inBody = false;
  for (const line of lines) {
    if (!inBody) {
      const fromMatch = line.match(/^From:\s*(.+)/i);
      const subjMatch = line.match(/^Subject:\s*(.+)/i);
      if (fromMatch) from = fromMatch[1].trim();
      else if (subjMatch) subject = subjMatch[1].trim();
      else if (line.trim() === "") inBody = true;
    } else {
      bodyLines.push(line);
    }
  }
  return { from, subject, body: bodyLines.join("\n").trim() || raw };
}

function fallbackIngest(
  rawEmail: string,
  projects: GateProject[]
): ApprovalIngestResult {
  const { from, subject, body } = parseEmailHeaders(rawEmail);
  const haystack = `${from ?? ""} ${subject ?? ""} ${body} ${rawEmail}`.toLowerCase();

  if (/reject|decline|cannot approve|not approved/i.test(haystack)) {
    return { matched: false, confidence: 0.9 };
  }

  let best: ApprovalIngestResult = { matched: false, confidence: 0 };

  for (const project of projects) {
    const nameHit = haystack.includes(project.name.toLowerCase());
    const gateHit = haystack.includes(project.gate.toLowerCase());
    if (!nameHit && !gateHit) continue;

    for (const approver of project.approvers) {
      if (approver.status !== "outstanding") continue;
      const team = approver.team.toLowerCase();
      const emailHit = approver.email && haystack.includes(approver.email.toLowerCase());
      const teamHit = haystack.includes(team);
      const approveHit = /approv|sign.?off|cleared|granted/i.test(haystack);

      if ((teamHit || emailHit) && approveHit) {
        const confidence = nameHit && gateHit && teamHit ? 0.88 : nameHit && teamHit ? 0.75 : 0.55;
        if (confidence > (best.confidence ?? 0)) {
          best = {
            matched: true,
            projectId: project.id,
            approverId: approver.id,
            team: approver.team,
            from: from ?? approver.email,
            subject: subject ?? `Approval for ${project.name}`,
            summary:
              body.split("\n").find((l) => l.trim().length > 20)?.slice(0, 120) ??
              `Approval recorded from ${approver.team}`,
            confidence,
          };
        }
      }
    }
  }

  return best;
}

export async function ingestApprovalEmail(
  input: IngestApprovalEmailInput
): Promise<ApprovalIngestResult> {
  const payload = {
    rawEmail: input.rawEmail,
    projects: input.projects.map((p) => ({
      id: p.id,
      name: p.name,
      gate: p.gate,
      outstanding: p.approvers
        .filter((a) => a.status === "outstanding")
        .map((a) => ({ approverId: a.id, team: a.team })),
    })),
  };

  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: getAiProvider(),
        model: getAiModel(),
        system: INGEST_SYSTEM,
        user: JSON.stringify(payload),
      }),
    });
    if (!res.ok) throw new Error(`AI request failed (${res.status})`);
    const data = (await res.json()) as { text?: string };
    if (!data.text) throw new Error("Empty AI response");
    return parseIngestJson(data.text);
  } catch {
    return fallbackIngest(input.rawEmail, input.projects);
  }
}

export function buildEvidenceFromIngest(
  result: ApprovalIngestResult,
  source: "auto" | "manual"
): {
  from?: string;
  subject?: string;
  snippet: string;
  confidence?: number;
} {
  return {
    from: result.from,
    subject: result.subject,
    snippet: result.summary ?? "Approval attached",
    confidence: result.confidence,
  };
}
