import { useMemo, useRef } from "react";
import { recipientRows } from "../draftGateOutreach";
import {
  approvedCount,
  formatHistoryDate,
  getNextGate,
  isFinalGate,
  isGateComplete,
  outstandingRequired,
  requiredCount,
} from "../gateApproval";
import { formatChasedLabel } from "../gateEmail";
import type {
  ApprovalEvidence,
  ChaseMode,
  GateApprovalUiState,
  GateOutreachDraft,
  GateProject,
  SteercoMember,
} from "../types/gate";

interface GateChasePanelProps {
  project: GateProject;
  approvalUi: GateApprovalUiState;
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
  onOpenAttach: (approverId: string) => void;
  onCloseAttach: () => void;
  onAttachTab: (tab: "email" | "file") => void;
  onAttachPasteChange: (value: string) => void;
  onAttachEmailSubmit: () => void;
  onAttachFile: (file: File) => void;
  onRemoveEvidence: (approverId: string, evidenceId: string) => void;
  onToggleEvidenceExpand: (approverId: string | null) => void;
  onAdvanceGate: () => void;
  onToggleHistory: () => void;
}

function reasonFor(draft: GateOutreachDraft | null, id: string): string | undefined {
  return draft?.recipients.find((r) => r.approverId === id)?.reason;
}

function evidenceLabel(ev: ApprovalEvidence): string {
  if (ev.kind === "file") return ev.fileName ?? "File";
  return ev.subject ?? "Email approval";
}

export function GateChasePanel({
  project,
  approvalUi,
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
  onOpenAttach,
  onCloseAttach,
  onAttachTab,
  onAttachPasteChange,
  onAttachEmailSubmit,
  onAttachFile,
  onRemoveEvidence,
  onToggleEvidenceExpand,
  onAdvanceGate,
  onToggleHistory,
}: GateChasePanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const outstanding = outstandingRequired(project);
  const gateComplete = isGateComplete(project);
  const nextGate = getNextGate(project);
  const finalGate = isFinalGate(project);
  const chasedLabel = formatChasedLabel(project.lastChasedAt);
  const appr = approvedCount(project);
  const req = requiredCount(project);
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
        Owner {project.owner} · {project.daysInGate} days in gate · {appr}/{req} approved
        {chasedLabel ? (
          <span className="pill grey" style={{ marginLeft: 8 }}>
            {chasedLabel}
          </span>
        ) : null}
      </div>

      {project.history.length > 0 ? (
        <div style={{ marginBottom: 10 }}>
          <button
            type="button"
            className="btn ghost"
            style={{ padding: "4px 0", fontSize: 12 }}
            onClick={onToggleHistory}
          >
            {approvalUi.historyExpanded ? "Hide" : "Show"} gate history ({project.history.length})
          </button>
          {approvalUi.historyExpanded ? (
            <div style={{ marginTop: 6 }}>
              {project.history.map((h) => (
                <div key={h.id} className="teamrow" style={{ fontSize: 12 }}>
                  <span>
                    <b>
                      {h.fromGate} → {h.toGate}
                    </b>{" "}
                    · {formatHistoryDate(h.advancedAt)} · {h.approvalsSnapshot.length}/
                    {h.approvalsSnapshot.length} approved
                  </span>
                </div>
              ))}
              {project.history.map((h) => (
                <details key={`${h.id}-detail`} style={{ marginTop: 4, fontSize: 12 }}>
                  <summary className="muted small" style={{ cursor: "pointer" }}>
                    {h.fromGate} → {h.toGate} audit trail
                  </summary>
                  <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                    {h.approvalsSnapshot.map((s) => (
                      <li key={s.team}>
                        {s.team}
                        {s.approvedAt ? ` · ${formatHistoryDate(s.approvedAt)}` : ""}
                        {s.evidenceId ? ` · evidence ${s.evidenceId.slice(0, 10)}…` : ""}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {project.approvers.map((a) => {
        const isAttachOpen = approvalUi.attachApproverId === a.id;
        const evidenceOpen = approvalUi.expandedEvidenceApproverId === a.id;
        return (
          <div key={a.id} style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="teamrow">
              <span>
                {a.team}
                {a.person ? <span className="muted small"> · {a.person}</span> : null}
                {a.evidence.length > 0 ? (
                  <button
                    type="button"
                    className="btn ghost"
                    style={{ padding: "0 4px", marginLeft: 4, fontSize: 11 }}
                    onClick={() =>
                      onToggleEvidenceExpand(evidenceOpen ? null : a.id)
                    }
                    title="View evidence"
                  >
                    📎 {a.evidence.length}
                  </button>
                ) : null}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {a.status === "approved" ? (
                  <span className="pill green">✓ Approved</span>
                ) : (
                  <>
                    <span className="pill red">Outstanding</span>
                    <button
                      type="button"
                      className="btn ghost"
                      style={{ padding: "2px 6px", fontSize: 11 }}
                      onClick={() => onOpenAttach(a.id)}
                    >
                      Attach
                    </button>
                  </>
                )}
              </span>
            </div>

            {evidenceOpen && a.evidence.length > 0 ? (
              <div style={{ padding: "4px 0 8px 12px" }}>
                {a.evidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="callout info"
                    style={{ marginBottom: 6, fontSize: 12 }}
                  >
                    <div>
                      <b>{evidenceLabel(ev)}</b>
                      <span className="pill grey" style={{ marginLeft: 6, fontSize: 10 }}>
                        {ev.source}
                      </span>
                      <div className="muted small" style={{ marginTop: 4 }}>
                        {ev.from ? `From: ${ev.from} · ` : ""}
                        {formatHistoryDate(ev.receivedAt)}
                        {ev.confidence != null
                          ? ` · ${Math.round(ev.confidence * 100)}% match`
                          : ""}
                      </div>
                      <div style={{ marginTop: 4 }}>{ev.snippet}</div>
                      {ev.fileName ? (
                        <div className="muted small" style={{ marginTop: 2 }}>
                          {ev.fileName}
                          {ev.fileType ? ` (${ev.fileType})` : ""}
                        </div>
                      ) : null}
                      <button
                        type="button"
                        className="btn ghost"
                        style={{ padding: "2px 0", marginTop: 4, fontSize: 11 }}
                        onClick={() => onRemoveEvidence(a.id, ev.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {isAttachOpen ? (
              <div
                className="callout info"
                style={{ margin: "6px 0 10px", fontSize: 13 }}
              >
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <button
                    type="button"
                    className={`btn ${approvalUi.attachTab === "email" ? "primary" : ""}`}
                    onClick={() => onAttachTab("email")}
                  >
                    Paste email
                  </button>
                  <button
                    type="button"
                    className={`btn ${approvalUi.attachTab === "file" ? "primary" : ""}`}
                    onClick={() => onAttachTab("file")}
                  >
                    Upload file
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    style={{ marginLeft: "auto" }}
                    onClick={onCloseAttach}
                  >
                    Close
                  </button>
                </div>
                {approvalUi.attachTab === "email" ? (
                  <>
                    <textarea
                      rows={4}
                      value={approvalUi.attachPaste}
                      onChange={(e) => onAttachPasteChange(e.target.value)}
                      placeholder="Paste approval email text…"
                      style={{
                        width: "100%",
                        padding: 8,
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        fontFamily: "inherit",
                        fontSize: 13,
                      }}
                    />
                    <button
                      type="button"
                      className="btn primary"
                      style={{ marginTop: 8 }}
                      disabled={!approvalUi.attachPaste.trim()}
                      onClick={onAttachEmailSubmit}
                    >
                      Attach approval
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".txt,.pdf,.eml,.msg,.doc,.docx"
                      style={{ fontSize: 12 }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onAttachFile(f);
                        e.target.value = "";
                      }}
                    />
                    <p className="muted small" style={{ margin: "6px 0 0" }}>
                      Metadata + snippet only are stored; file stays in this session for preview.
                    </p>
                  </>
                )}
              </div>
            ) : null}
          </div>
        );
      })}

      {gateComplete ? (
        <div className="callout ok" style={{ marginTop: 12 }}>
          <div>✓</div>
          <div>
            {finalGate
              ? "Gate complete — ready to close. All required approvals collected."
              : `All required approvals collected for ${project.gate}.`}
          </div>
        </div>
      ) : null}

      {gateComplete && !finalGate && nextGate ? (
        <button
          type="button"
          className="btn primary"
          style={{ marginTop: 10, width: "100%" }}
          onClick={onAdvanceGate}
        >
          <span className="arrowdot">›</span> Advance to {nextGate}
        </button>
      ) : null}

      {gateComplete && finalGate ? (
        <div className="muted small" style={{ marginTop: 10 }}>
          Final gate reached — no further advance.
        </div>
      ) : null}

      {!gateComplete && outstanding.length > 0 ? (
        <div className="muted small" style={{ marginTop: 10 }}>
          {outstanding.length} approval{outstanding.length !== 1 ? "s" : ""} outstanding
          {nextGate ? ` before advancing to ${nextGate}` : ""}
        </div>
      ) : null}

      {!gateComplete && (
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
