import type { ApprovalIngestResult } from "../types/gate";
import { SEEDED_APPROVAL_EMAILS } from "../gateSeed";

interface GateApprovalsInboxProps {
  inboxText: string;
  loading: boolean;
  suggestion: ApprovalIngestResult | null;
  toast: string | null;
  onTextChange: (value: string) => void;
  onCapture: () => void;
  onConfirmSuggestion: () => void;
  onDismissSuggestion: () => void;
  onSeedClick: (body: string) => void;
  onDismissToast: () => void;
}

export function GateApprovalsInbox({
  inboxText,
  loading,
  suggestion,
  toast,
  onTextChange,
  onCapture,
  onConfirmSuggestion,
  onDismissSuggestion,
  onSeedClick,
  onDismissToast,
}: GateApprovalsInboxProps) {
  return (
    <div className="card" style={{ marginBottom: 14 }} onClick={(e) => e.stopPropagation()}>
      <div className="ch">
        <h3>Approvals inbox</h3>
        <span className="illus" style={{ marginLeft: "auto" }}>
          auto-capture
        </span>
      </div>
      <div className="cb">
        {toast ? (
          <div className="callout ok" style={{ marginBottom: 10 }}>
            <div>✓</div>
            <div style={{ flex: 1 }}>
              {toast}{" "}
              <button
                type="button"
                className="btn ghost"
                style={{ padding: "2px 0", marginLeft: 6 }}
                onClick={onDismissToast}
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}

        {suggestion && !toast ? (
          <div className="callout warn" style={{ marginBottom: 10 }}>
            <div>?</div>
            <div>
              <b>AI suggestion</b> — thinks this approves{" "}
              <b>{suggestion.team}</b>
              {suggestion.projectId ? " on the matched project" : ""}
              {suggestion.confidence != null
                ? ` (${Math.round(suggestion.confidence * 100)}% confidence)`
                : ""}
              . Attach?
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button type="button" className="btn primary" onClick={onConfirmSuggestion}>
                  Attach approval
                </button>
                <button type="button" className="btn" onClick={onDismissSuggestion}>
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <label className="small muted" htmlFor="approval-inbox">
          Paste an approval email
        </label>
        <textarea
          id="approval-inbox"
          rows={4}
          value={inboxText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="From: team@bank.example&#10;Subject: AG2 approval — Project name&#10;&#10;We approve…"
          style={{
            width: "100%",
            marginTop: 6,
            padding: "8px 10px",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontFamily: "inherit",
            fontSize: 13,
            resize: "vertical",
          }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn primary"
            disabled={loading || !inboxText.trim()}
            onClick={onCapture}
          >
            {loading ? "Processing…" : "Capture approval"}
          </button>
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="small muted" style={{ marginBottom: 6 }}>
            Try an illustrative inbound message
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SEEDED_APPROVAL_EMAILS.map((seed) => (
              <button
                key={seed.label}
                type="button"
                className="preset"
                onClick={() => onSeedClick(seed.body)}
              >
                {seed.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
