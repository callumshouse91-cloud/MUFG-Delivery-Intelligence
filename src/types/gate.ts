export type ApprovalStatus = "approved" | "outstanding" | "rejected" | "na";
export type ChaseMode = "chase" | "escalate";

export interface GateApprover {
  id: string;
  team: string;
  person?: string;
  email?: string;
  status: ApprovalStatus;
  daysOutstanding?: number;
}

export interface GateProject {
  id: string;
  name: string;
  gate: string;
  rag: "red" | "amber" | "green";
  owner: string;
  daysInGate: number;
  approvers: GateApprover[];
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

export interface StageGateState {
  projects: GateProject[];
  chaseUi: GateChaseUiState | null;
}

export interface BoardState {
  stageGate?: StageGateState;
}
