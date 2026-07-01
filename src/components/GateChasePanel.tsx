import { useMemo } from "react";
import { recipientRows } from "../draftGateOutreach";
import { formatChasedLabel } from "../gateEmail";
import type {
  ChaseMode,
  GateChaseUiState,
  GateOutreachDraft,
  GateProject,
  SteercoMember,
} from "../types/gate";

interface GateChasePanelProps {
  project: GateProject;
  mode: ChaseMode;
  loading: boolean;
  error: string | null;
  draft: GateOutreachDraft | null;
  selectedIds: string[];
  subject: string;
  body: string;
  steerco: SteercoMember[];
  copyOk: boolean;
  onToggleRecipient: (id: string) => void;
  onSubjectChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onRedraft: () => void;
  onCopy: () => void;
  onOpenMail: () => void;
  onMarkChased: () => void;
  onSwitchEscalate: () => void;
  onStartChase: () => void;
  onStartEscalate: () => void;
}

function reasonFor(
  draft: GateOutreachDraft | null,
  id: string
): string | undefined {
  return draft?.recipients.find((r) => r.approverId === id)?.reason;
}

export function GateChasePanel({
  project,
  mode,
  loading,
  error,
  draft,
  selectedIds,
  subject,
  body,
  steerco,
  copyOk,
  onToggleRecipient,
  onSubjectChange,
  onBodyChange,
  onRedraft,
  onCopy,
  onOpenMail,
  onMarkChased,
  onSwitchEscalate,
  onStartChase,
  onStartEscalate,
}: GateChasePanelProps) {
  const outstanding = project.approvers.filter((a) => a.status === "outstanding");
  const gateClear = outstanding.length === 0;
  const chasedLabel = formatChasedLabel(project.lastChasedAt);
  const rows = useMemo(
    () => recipientRows(project, mode, steerco),
    [project, mode, steerco]
  );

  const escalationHint = useMemo(() => {
    if (mode !== "chase" || !draft?.escalationSuggested) return null;
    const long = [...outstanding].sort(
      (a, b) => (b.daysOutstanding ?? 0) - (a.daysOutstanding ?? 0)
    )[0];
    if (!long) return draft.escalationNote;
    return `AI suggests escalating ${long.team} — ${long.daysOutstanding ?? project.daysInGate} days outstanding`;
  }, [mode, draft, outstanding, project.daysInGate]);

  return (
    <div className="cb" onClick={(e) => e.stopPropagation()}>
      <div className="muted small" style={{ marginBottom: 10 }}>
        Owner {project.owner} · {project.daysInGate} days in gate ·{" "}
        {project.approvers.filter((a) => a.status === "approved").length}/10 approvals
        {chasedLabel ? (
          <span className="pill grey" style={{ marginLeft: 8 }}>
            {chasedLabel}
          </span>
        ) : null}
      </div>

      {project.approvers.map((a) => (
        <div className="teamrow" key={a.id}>
          <span>
            {a.team}
            {a.person ? <span className="muted small"> · {a.person}</span> : null}
          </span>
          {a.status === "approved" ? (
            <span className="pill green">✓ Approved</span>
          ) : (
            <span className="pill red">Outstanding</span>
          )}
        </div>
      ))}

      {gateClear ? (
        <div className="callout ok" style={{ marginTop: 12 }}>
          <div>✓</div>
          <div>Gate clear — all approvals in. Ready to close the gate.</div>
        </div>
      ) : (
        <>
          {!draft && !loading && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                type="button"
                className="btn primary"
                disabled={loading}
                onClick={onStartChase}
              >
                <span className="arrowdot">›</span> Chase all outstanding
              </button>
              <button
                type="button"
                className="btn"
                disabled={loading}
                onClick={onStartEscalate}
              >
                Escalate to Steerco
              </button>
            </div>
          )}

          {loading && (
            <div className="callout info" style={{ marginTop: 12 }}>
              <div>…</div>
              <div>
                Drafting {mode === "chase" ? "chase email" : "Steerco escalation"} with AI…
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="callout warn" style={{ marginTop: 12 }}>
              <div>⚠</div>
              <div>{error}</div>
            </div>
          )}

          {draft && !loading && (
            <div className="callout info" style={{ marginTop: 12 }}>
              <div>✎</div>
              <div>
                <b>Drafted {mode === "chase" ? "chase" : "escalation"}</b>
                <span className="illus"> AI-generated · illustrative</span>
                {escalationHint && (
                  <div className="callout warn" style={{ marginTop: 8 }}>
                    <div>⚠</div>
                    <div>
                      {escalationHint}{" "}
                      <button
                        type="button"
                        className="btn ghost"
                        style={{ padding: "2px 0", marginLeft: 4 }}
                        onClick={onSwitchEscalate}
                      >
                        Switch to escalate →
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 12 }}>
                  <div className="small b" style={{ marginBottom: 6 }}>
                    Recipients
                  </div>
                  {rows.map((row) => {
                    const id = "id" in row && row.id ? row.id : "";
                    const label =
                      mode === "chase"
                        ? `${(row as { team: string; person?: string }).team}${
                            (row as { person?: string }).person
                              ? ` · ${(row as { person?: string }).person}`
                              : ""
                          }`
                        : `${(row as SteercoMember).name} · ${(row as SteercoMember).role}`;
                    const reason = reasonFor(draft, id);
                    const checked = selectedIds.includes(id);
                    return (
                      <label
                        key={id}
                        className="teamrow"
                        style={{ cursor: "pointer", gap: 8 }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleRecipient(id)}
                        />
                        <span style={{ flex: 1 }}>{label}</span>
                        {reason ? (
                          <span className="pill grey" style={{ fontSize: 11 }}>
                            {reason}
                          </span>
                        ) : null}
                      </label>
                    );
                  })}
                </div>

                <div style={{ marginTop: 12 }}>
                  <label className="small b" htmlFor="gate-subject">
                    Subject
                  </label>
                  <input
                    id="gate-subject"
                    className="chatin"
                    style={{
                      width: "100%",
                      marginTop: 4,
                      padding: "8px 10px",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                    }}
                    value={subject}
                    onChange={(e) => onSubjectChange(e.target.value)}
                  />
                </div>

                <div style={{ marginTop: 10 }}>
                  <label className="small b" htmlFor="gate-body">
                    Body
                  </label>
                  <textarea
                    id="gate-body"
                    rows={7}
                    style={{
                      width: "100%",
                      marginTop: 4,
                      padding: "8px 10px",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      fontFamily: "inherit",
                      fontSize: 13,
                      resize: "vertical",
                    }}
                    value={body}
                    onChange={(e) => onBodyChange(e.target.value)}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 12,
                  }}
                >
                  <button
                    type="button"
                    className="btn"
                    disabled={!selectedIds.length}
                    onClick={onRedraft}
                  >
                    Re-draft with selected
                  </button>
                  <button type="button" className="btn" onClick={onCopy}>
                    {copyOk ? "Copied!" : "Copy email"}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    disabled={!selectedIds.length}
                    onClick={onOpenMail}
                  >
                    Open in mail
                  </button>
                  <button
                    type="button"
                    className="btn primary"
                    disabled={!selectedIds.length}
                    onClick={onMarkChased}
                  >
                    <span className="arrowdot">›</span> Mark as chased
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export type { GateChaseUiState };
