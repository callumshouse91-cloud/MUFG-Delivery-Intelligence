import type { GateApprover, GateOutreachDraft, GateProject, SteercoMember, ChaseMode } from "./types/gate";

export function buildSalutation(teams: string[]): string {
  if (!teams.length) return "Hi all,";
  if (teams.length === 1) return `Hi ${teams[0]} team,`;
  if (teams.length === 2) return `Hi ${teams[0]} and ${teams[1]} teams,`;
  return `Hi ${teams.slice(0, -1).join(", ")} and ${teams[teams.length - 1]} teams,`;
}

export function replaceSalutation(body: string, salutation: string): string {
  const trimmed = body.trim();
  const match = trimmed.match(/^Hi[^,\n]*,/i);
  if (match) return salutation + trimmed.slice(match[0].length);
  return `${salutation}\n\n${trimmed}`;
}

export function updateBodySalutation(
  body: string,
  recipients: GateApprover[] | SteercoMember[],
  mode: ChaseMode
): string {
  const names =
    mode === "chase"
      ? (recipients as GateApprover[]).map((r) => r.team)
      : (recipients as SteercoMember[]).map((r) => r.name);
  return replaceSalutation(body, buildSalutation(names));
}

export async function copyEmail(subject: string, body: string): Promise<boolean> {
  const text = `Subject: ${subject}\n\n${body}`;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

export function openInMail(
  emails: string[],
  subject: string,
  body: string
): void {
  const to = emails.filter(Boolean).join(",");
  const href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = href;
}

export function formatChasedLabel(iso: string | undefined): string | null {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "Chased just now";
  if (diff < 3_600_000) return `Chased ${Math.max(1, Math.round(diff / 60_000))}m ago`;
  if (diff < 86_400_000) return `Chased ${Math.round(diff / 3_600_000)}h ago`;
  return `Chased ${new Date(iso).toLocaleDateString()}`;
}

export function selectedApproverIds(draft: GateOutreachDraft): string[] {
  return draft.recipients.filter((r) => r.recommended).map((r) => r.approverId);
}

export function mergeSelectedFromDraft(
  draft: GateOutreachDraft,
  previous: string[] | undefined
): string[] {
  const recommended = selectedApproverIds(draft);
  if (!previous?.length) return recommended;
  const valid = new Set(draft.recipients.map((r) => r.approverId));
  return previous.filter((id) => valid.has(id));
}
