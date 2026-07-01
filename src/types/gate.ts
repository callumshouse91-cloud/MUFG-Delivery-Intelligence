export type ApprovalStatus = "approved" | "outstanding" | "rejected" | "na";
export type ChaseMode = "chase" | "escalate";
export type EvidenceSource = "auto" | "manual";
export type EvidenceKind = "email" | "file";

export interface ApprovalEvidence {
  id: string;
  source: EvidenceSource;
  kind: EvidenceKind;
  from?: string;
  subject?: string;
  receivedAt: string;
  snippet: string;
  fileName?: string;
  fileType?: string;
  confidence?: number;
}

export interface GateApprover {
  id: string;
  team: string;
  person?: string;
  email?: string;
  status: ApprovalStatus;
  daysOutstanding?: number;
  evidence: ApprovalEvidence[];
  approvedAt?: string;
}

export interface GateHistoryEntry {
  id: string;
  fromGate: string;
  toGate: string;
  advancedAt: string;
  approvalsSnapshot: {
    team: string;
    approvedAt?: string;
    evidenceId?: string;
  }[];
}

export interface GateProject {
  id: string;
  name: string;
  gate: string;
  rag: "red" | "amber" | "green";
  owner: string;
  daysInGate: number;
  approvers: GateApprover[];
  gateOrder: string[];
  requiredApproverIds?: string[];
  history: GateHistoryEntry[];
  lastChasedAt?: string;
  lastChaseMode?: ChaseMode;
}

export interface SteercoMember {
  id: string;
  name: string;
  role: string;
  email?: string;
}

export interface OutreachRecipient {
  approverId: string;
  recommended: boolean;
  reason: string;
}

export interface GateOutreachDraft {
  recipients: OutreachRecipient[];
  subject: string;
  body: string;
  escalationSuggested: boolean;
  escalationNote: string | null;
}

export interface GateChaseUiState {
  projectId: string;
  mode: ChaseMode;
  loading: boolean;
  error: string | null;
  draft: GateOutreachDraft | null;
  selectedIds: string[];
  subject: string;
  body: string;
}

export interface ApprovalIngestResult {
  matched: boolean;
  projectId?: string;
  approverId?: string;
  team?: string;
  from?: string;
  subject?: string;
  summary?: string;
  confidence?: number;
}

export interface GateApprovalUiState {
  inboxText: string;
  inboxLoading: boolean;
  suggestion: ApprovalIngestResult | null;
  toast: string | null;
  attachApproverId: string | null;
  attachTab: EvidenceKind;
  attachPaste: string;
  expandedEvidenceApproverId: string | null;
  historyExpanded: boolean;
}

export interface StageGateState {
  projects: GateProject[];
  chaseUi: GateChaseUiState | null;
  approvalUi: GateApprovalUiState;
}

export interface BoardState {
  stageGate?: StageGateState;
}

export const DEFAULT_GATE_ORDER = ["AG1", "AG2", "AG3"];

export const EMPTY_APPROVAL_UI: GateApprovalUiState = {
  inboxText: "",
  inboxLoading: false,
  suggestion: null,
  toast: null,
  attachApproverId: null,
  attachTab: "email",
  attachPaste: "",
  expandedEvidenceApproverId: null,
  historyExpanded: false,
};
