import type { BoardState, GateProject, StageGateState } from "./types/gate";
import { EMPTY_APPROVAL_UI } from "./types/gate";

export const WORKSHOP_ID = "mufg-connected-delivery";

const STORAGE_KEY = `workshop:${WORKSHOP_ID}`;
const SESSION_KEY = `workshop-session:${WORKSHOP_ID}`;

function readStorage(): BoardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BoardState;
  } catch {
    /* ignore corrupt storage */
  }
  try {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) return JSON.parse(session) as BoardState;
  } catch {
    /* ignore */
  }
  return {};
}

function writeStorage(state: BoardState): void {
  const json = JSON.stringify(state);
  localStorage.setItem(STORAGE_KEY, json);
  sessionStorage.setItem(SESSION_KEY, json);
}

export function loadBoardState(): BoardState {
  return readStorage();
}

export function saveBoardState(patch: Partial<BoardState>): BoardState {
  const next = { ...readStorage(), ...patch };
  writeStorage(next);
  return next;
}

export function saveStageGate(stageGate: StageGateState): StageGateState {
  const toSave: StageGateState = {
    projects: stageGate.projects,
    chaseUi: null,
    approvalUi: EMPTY_APPROVAL_UI,
  };
  saveBoardState({ stageGate: toSave });
  return stageGate;
}

export function loadStageGate(fallback: StageGateState): StageGateState {
  const stored = readStorage().stageGate;
  if (!stored?.projects?.length) return fallback;
  return {
    projects: mergeProjects(fallback.projects, stored.projects),
    chaseUi: null,
    approvalUi: EMPTY_APPROVAL_UI,
  };
}

function mergeApprover(
  seed: GateProject["approvers"][0],
  saved: GateProject["approvers"][0] | undefined
) {
  if (!saved) return { ...seed, evidence: seed.evidence ?? [] };
  return {
    ...seed,
    status: saved.status,
    approvedAt: saved.approvedAt,
    evidence: saved.evidence ?? [],
    daysOutstanding: saved.daysOutstanding,
  };
}

function mergeProjects(seed: GateProject[], stored: GateProject[]): GateProject[] {
  const byId = new Map(stored.map((p) => [p.id, p]));
  return seed.map((p) => {
    const saved = byId.get(p.id);
    if (!saved) return p;
    const approverById = new Map(saved.approvers.map((a) => [a.id, a]));
    return {
      ...p,
      gate: saved.gate,
      daysInGate: saved.daysInGate,
      history: saved.history?.length ? saved.history : p.history,
      gateOrder: saved.gateOrder?.length ? saved.gateOrder : p.gateOrder,
      requiredApproverIds: saved.requiredApproverIds,
      lastChasedAt: saved.lastChasedAt,
      lastChaseMode: saved.lastChaseMode,
      approvers: p.approvers.map((a) => mergeApprover(a, approverById.get(a.id))),
    };
  });
}
