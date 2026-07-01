import type { BoardState, StageGateState } from "./types/gate";

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
  saveBoardState({ stageGate });
  return stageGate;
}

export function loadStageGate(fallback: StageGateState): StageGateState {
  const stored = readStorage().stageGate;
  if (!stored?.projects?.length) return fallback;
  return {
    projects: mergeProjects(fallback.projects, stored.projects),
    chaseUi: null,
  };
}

function mergeProjects(seed: StageGateState["projects"], stored: StageGateState["projects"]) {
  const byId = new Map(stored.map((p) => [p.id, p]));
  return seed.map((p) => {
    const saved = byId.get(p.id);
    if (!saved) return p;
    return {
      ...p,
      lastChasedAt: saved.lastChasedAt,
      lastChaseMode: saved.lastChaseMode,
    };
  });
}
