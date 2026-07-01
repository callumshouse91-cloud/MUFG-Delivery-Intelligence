import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { renderTopbar, renderSidebar, renderMain } from "./render";
import { NAV, POLICY } from "./data";
import { buildEvidenceFromIngest, ingestApprovalEmail } from "./ingestApprovalEmail";
import {
  advanceProjectGate,
  attachEvidenceToApprover,
  newEvidenceId,
  removeEvidenceFromApprover,
  updateProjectInList,
} from "./gateApproval";
import { GateApprovalsInbox } from "./components/GateApprovalsInbox";
import { GateChasePanel } from "./components/GateChasePanel";
import { draftGateOutreach, resolveRecipientEmails } from "./draftGateOutreach";
import {
  copyEmail,
  mergeSelectedFromDraft,
  openInMail,
  selectedApproverIds,
  updateBodySalutation,
} from "./gateEmail";
import { findGateProject, findGateProjectById, seedGateProjects, STEERCO_MEMBERS } from "./gateSeed";
import { loadStageGate, saveStageGate } from "./persist";
import type {
  ApprovalEvidence,
  ChaseMode,
  GateChaseUiState,
  GateProject,
  StageGateState,
} from "./types/gate";
import { EMPTY_APPROVAL_UI } from "./types/gate";

function fallback(lang: string) {
  return lang === "en"
    ? "Based on the indexed policy, that depends on the project's assurance level and entity \u2014 connect the full policy set for a cited answer."
    : "\u30a4\u30f3\u30c7\u30c3\u30af\u30b9\u3055\u308c\u305f\u30dd\u30ea\u30b7\u30fc\u306b\u57fa\u3065\u304d\u307e\u3059\u304c\u3001\u30d7\u30ed\u30b8\u30a7\u30af\u30c8\u306e\u4fdd\u8a3c\u30ec\u30d9\u30eb\u3068\u30a8\u30f3\u30c6\u30a3\u30c6\u30a3\u306b\u3088\u308a\u307e\u3059\u3002";
}

const SEED: StageGateState = {
  projects: seedGateProjects(),
  chaseUi: null,
  approvalUi: EMPTY_APPROVAL_UI,
};

function emptyChaseUi(projectId: string, mode: ChaseMode): GateChaseUiState {
  return {
    projectId,
    mode,
    loading: true,
    error: null,
    draft: null,
    selectedIds: [],
    subject: "",
    body: "",
  };
}

export default function App() {
  const [level, setLevel] = useState(0);
  const [nav, setNav] = useState("foundation");
  const [lang, setLang] = useState("en");
  const [chat, setChat] = useState<{ role: string; text: string; cite?: string }[]>([]);
  const [step, setStep] = useState(0);
  const [gate, setGate] = useState<string | null>(null);
  const [gov, setGov] = useState("steerco");
  const [openNote, setOpenNote] = useState<number | null>(null);
  const [stageGate, setStageGate] = useState<StageGateState>(() =>
    loadStageGate(SEED)
  );
  const [copyOk, setCopyOk] = useState(false);
  const [gateMount, setGateMount] = useState<HTMLElement | null>(null);
  const [inboxMount, setInboxMount] = useState<HTMLElement | null>(null);

  const chaseUi = stageGate.chaseUi;
  const approvalUi = stageGate.approvalUi;
  const selectedProject = findGateProject(stageGate.projects, gate);

  const S = {
    level,
    nav,
    lang,
    chat,
    step,
    gate,
    gov,
    openNote,
    gateProjects: stageGate.projects,
  };

  useEffect(() => {
    const m = document.getElementById("msgs");
    if (m) m.scrollTop = m.scrollHeight;
  }, [chat, nav]);

  useLayoutEffect(() => {
    if (nav === "gates") {
      setInboxMount(document.getElementById("gate-inbox-mount"));
      setGateMount(gate ? document.getElementById("gate-chase-mount") : null);
    } else {
      setInboxMount(null);
      setGateMount(null);
    }
  }, [nav, gate, stageGate.projects, chaseUi, approvalUi]);

  const runDraft = useCallback(
    async (project: GateProject, mode: ChaseMode, selectedRecipientIds?: string[]) => {
      setStageGate((prev) => ({
        ...prev,
        chaseUi: { ...emptyChaseUi(project.id, mode), loading: true },
      }));
      try {
        const draft = await draftGateOutreach({
          project,
          mode,
          steerco: STEERCO_MEMBERS,
          selectedRecipientIds,
        });
        const selectedIds = mergeSelectedFromDraft(
          draft,
          selectedRecipientIds ?? selectedApproverIds(draft)
        );
        setStageGate((prev) => ({
          ...prev,
          chaseUi: {
            projectId: project.id,
            mode,
            loading: false,
            error: null,
            draft,
            selectedIds,
            subject: draft.subject,
            body: draft.body,
          },
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not draft outreach";
        setStageGate((prev) => ({
          ...prev,
          chaseUi: prev.chaseUi
            ? { ...prev.chaseUi, loading: false, error: message }
            : null,
        }));
      }
    },
    []
  );

  const startChase = useCallback(
    (mode: ChaseMode) => {
      if (!selectedProject) return;
      void runDraft(selectedProject, mode);
    },
    [selectedProject, runDraft]
  );

  const toggleRecipient = useCallback(
    (id: string) => {
      if (!chaseUi || !selectedProject) return;
      const selectedIds = chaseUi.selectedIds.includes(id)
        ? chaseUi.selectedIds.filter((x) => x !== id)
        : [...chaseUi.selectedIds, id];
      const rows =
        chaseUi.mode === "escalate"
          ? STEERCO_MEMBERS.filter((m) => selectedIds.includes(m.id))
          : selectedProject.approvers.filter((a) => selectedIds.includes(a.id));
      const body = updateBodySalutation(chaseUi.body, rows, chaseUi.mode);
      setStageGate((prev) => ({
        ...prev,
        chaseUi: prev.chaseUi ? { ...prev.chaseUi, selectedIds, body } : null,
      }));
    },
    [chaseUi, selectedProject]
  );

  const handleCopy = useCallback(async () => {
    if (!chaseUi) return;
    const ok = await copyEmail(chaseUi.subject, chaseUi.body);
    setCopyOk(ok);
    window.setTimeout(() => setCopyOk(false), 2000);
  }, [chaseUi]);

  const handleOpenMail = useCallback(() => {
    if (!chaseUi || !selectedProject) return;
    const emails = resolveRecipientEmails(
      selectedProject,
      chaseUi.mode,
      chaseUi.selectedIds,
      STEERCO_MEMBERS
    );
    openInMail(emails, chaseUi.subject, chaseUi.body);
  }, [chaseUi, selectedProject]);

  const handleMarkChased = useCallback(() => {
    if (!chaseUi || !selectedProject) return;
    const now = new Date().toISOString();
    const projects = stageGate.projects.map((p) =>
      p.id === selectedProject.id
        ? { ...p, lastChasedAt: now, lastChaseMode: chaseUi.mode }
        : p
    );
    setStageGate({ projects, chaseUi: null, approvalUi });
    saveStageGate({ projects, chaseUi: null, approvalUi });
  }, [chaseUi, selectedProject, stageGate.projects, approvalUi]);

  const handleRedraft = useCallback(() => {
    if (!selectedProject || !chaseUi) return;
    void runDraft(selectedProject, chaseUi.mode, chaseUi.selectedIds);
  }, [selectedProject, chaseUi, runDraft]);

  const clearChaseUi = useCallback(() => {
    setStageGate((prev) => ({ ...prev, chaseUi: null }));
  }, []);

  const persistStageGate = useCallback((next: StageGateState) => {
    setStageGate(next);
    saveStageGate(next);
  }, []);

  const applyEvidence = useCallback(
    (
      projectId: string,
      approverId: string,
      evidence: ApprovalEvidence,
      toast: string
    ) => {
      const project = stageGate.projects.find((p) => p.id === projectId);
      if (!project) return;
      const updated = attachEvidenceToApprover(project, approverId, evidence);
      const projects = updateProjectInList(stageGate.projects, updated);
      const next: StageGateState = {
        ...stageGate,
        projects,
        approvalUi: {
          ...EMPTY_APPROVAL_UI,
          toast,
        },
        chaseUi: null,
      };
      persistStageGate(next);
      const match = findGateProjectById(projects, projectId);
      if (match && gate !== match.name) setGate(match.name);
    },
    [stageGate, gate, persistStageGate]
  );

  const handleCaptureInbox = useCallback(async () => {
    const raw = approvalUi.inboxText.trim();
    if (!raw) return;
    setStageGate((prev) => ({
      ...prev,
      approvalUi: { ...prev.approvalUi, inboxLoading: true, suggestion: null },
    }));
    const result = await ingestApprovalEmail({
      rawEmail: raw,
      projects: stageGate.projects,
    });
    const confident =
      result.matched &&
      result.confidence != null &&
      result.confidence >= 0.6 &&
      result.projectId &&
      result.approverId;

    if (confident) {
      const meta = buildEvidenceFromIngest(result, "auto");
      const evidence: ApprovalEvidence = {
        id: newEvidenceId(),
        source: "auto",
        kind: "email",
        from: meta.from,
        subject: meta.subject,
        receivedAt: new Date().toISOString(),
        snippet: meta.snippet,
        confidence: meta.confidence,
      };
      const project = stageGate.projects.find((p) => p.id === result.projectId);
      const team = result.team ?? project?.approvers.find((a) => a.id === result.approverId)?.team;
      applyEvidence(
        result.projectId!,
        result.approverId!,
        evidence,
        `Auto-attached approval from ${team ?? "team"} to ${project?.gate ?? "gate"}`
      );
      return;
    }

    setStageGate((prev) => ({
      ...prev,
      approvalUi: {
        ...prev.approvalUi,
        inboxLoading: false,
        suggestion: result.matched ? result : null,
        toast: result.matched
          ? null
          : "Could not match this email to an outstanding approval — try manual attach.",
      },
    }));
  }, [approvalUi.inboxText, stageGate.projects, applyEvidence]);

  const handleConfirmSuggestion = useCallback(() => {
    const result = approvalUi.suggestion;
    if (!result?.projectId || !result.approverId) return;
    const meta = buildEvidenceFromIngest(result, "auto");
    const evidence: ApprovalEvidence = {
      id: newEvidenceId(),
      source: "auto",
      kind: "email",
      from: meta.from,
      subject: meta.subject,
      receivedAt: new Date().toISOString(),
      snippet: meta.snippet,
      confidence: meta.confidence,
    };
    const project = stageGate.projects.find((p) => p.id === result.projectId);
    applyEvidence(
      result.projectId,
      result.approverId,
      evidence,
      `Attached approval from ${result.team ?? "team"} to ${project?.gate ?? "gate"}`
    );
  }, [approvalUi.suggestion, stageGate.projects, applyEvidence]);

  const handleAttachEmail = useCallback(() => {
    if (!selectedProject || !approvalUi.attachApproverId) return;
    const paste = approvalUi.attachPaste.trim();
    if (!paste) return;
    const evidence: ApprovalEvidence = {
      id: newEvidenceId(),
      source: "manual",
      kind: "email",
      receivedAt: new Date().toISOString(),
      snippet: paste.slice(0, 240),
      subject: paste.match(/^Subject:\s*(.+)/im)?.[1]?.trim(),
      from: paste.match(/^From:\s*(.+)/im)?.[1]?.trim(),
    };
    const updated = attachEvidenceToApprover(
      selectedProject,
      approvalUi.attachApproverId,
      evidence
    );
    const projects = updateProjectInList(stageGate.projects, updated);
    persistStageGate({
      ...stageGate,
      projects,
      approvalUi: { ...approvalUi, attachApproverId: null, attachPaste: "" },
    });
  }, [selectedProject, approvalUi, stageGate, persistStageGate]);

  const handleAttachFile = useCallback(
    async (file: File) => {
      if (!selectedProject || !approvalUi.attachApproverId) return;
      let snippet = `Uploaded ${file.name}`;
      if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".eml")) {
        try {
          const text = await file.text();
          snippet = text.slice(0, 240);
        } catch {
          /* keep default snippet */
        }
      }
      const evidence: ApprovalEvidence = {
        id: newEvidenceId(),
        source: "manual",
        kind: "file",
        receivedAt: new Date().toISOString(),
        snippet,
        fileName: file.name,
        fileType: file.type || file.name.split(".").pop(),
      };
      const updated = attachEvidenceToApprover(
        selectedProject,
        approvalUi.attachApproverId,
        evidence
      );
      const projects = updateProjectInList(stageGate.projects, updated);
      persistStageGate({
        ...stageGate,
        projects,
        approvalUi: { ...approvalUi, attachApproverId: null, attachPaste: "" },
      });
    },
    [selectedProject, approvalUi, stageGate, persistStageGate]
  );

  const handleRemoveEvidence = useCallback(
    (approverId: string, evidenceId: string) => {
      if (!selectedProject) return;
      const updated = removeEvidenceFromApprover(selectedProject, approverId, evidenceId);
      const projects = updateProjectInList(stageGate.projects, updated);
      persistStageGate({ ...stageGate, projects });
    },
    [selectedProject, stageGate, persistStageGate]
  );

  const handleAdvanceGate = useCallback(() => {
    if (!selectedProject) return;
    const updated = advanceProjectGate(selectedProject);
    const projects = updateProjectInList(stageGate.projects, updated);
    persistStageGate({
      ...stageGate,
      projects,
      chaseUi: null,
      approvalUi: { ...approvalUi, historyExpanded: true },
    });
  }, [selectedProject, stageGate, approvalUi, persistStageGate]);

  useEffect(() => {
    if (nav !== "gates") clearChaseUi();
  }, [nav, clearChaseUi]);

  function onClick(e: React.MouseEvent) {
    const el = (e.target as HTMLElement).closest("[data-action]");
    if (!el) return;
    const a = el.getAttribute("data-action");
    const num = (k: string) => parseInt(el.getAttribute(k) || "0", 10);
    if (a === "setlevel") {
      const n = num("data-n");
      setLevel(n);
      const it = NAV.find((x: { id: string; min: number }) => x.id === nav);
      if (it && n < it.min) setNav("foundation");
    } else if (a === "nav") {
      setNav(el.getAttribute("data-id") || "foundation");
      setGate(null);
      clearChaseUi();
      window.scrollTo(0, 0);
    } else if (a === "lang") {
      setLang(el.getAttribute("data-l") || "en");
    } else if (a === "ask") {
      const p = POLICY[num("data-i")][lang as "en" | "jp"];
      setChat([...chat, { role: "u", text: p.q }, { role: "a", text: p.a, cite: p.c }]);
    } else if (a === "asktext") {
      const inp = document.getElementById("chatinput") as HTMLInputElement;
      const v = inp && inp.value.trim();
      if (v)
        setChat([
          ...chat,
          { role: "u", text: v },
          {
            role: "a",
            text: fallback(lang),
            cite: lang === "en" ? "Illustrative response" : "\u53c2\u8003\u56de\u7b54",
          },
        ]);
    } else if (a === "proj") {
      setNav("gates");
      setGate(el.getAttribute("data-name"));
      clearChaseUi();
      window.scrollTo(0, 0);
    } else if (a === "gate") {
      setGate(el.getAttribute("data-name"));
      clearChaseUi();
    } else if (a === "step") {
      setStep(num("data-n"));
    } else if (a === "gov") {
      setGov(el.getAttribute("data-v") || "steerco");
    } else if (a === "note") {
      const i = num("data-i");
      setOpenNote(openNote === i ? null : i);
    }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.target as HTMLElement).id === "chatinput") {
      const v = (e.target as HTMLInputElement).value.trim();
      if (v)
        setChat([
          ...chat,
          { role: "u", text: v },
          { role: "a", text: fallback(lang), cite: "Illustrative" },
        ]);
    }
  }

  const gateMountNode = gateMount;
  const inboxMountNode = inboxMount;

  return (
    <div onClick={onClick} onKeyDown={onKey}>
      <div className="topbar" dangerouslySetInnerHTML={{ __html: renderTopbar(S) }} />
      <div className="layout">
        <nav className="sidebar" dangerouslySetInnerHTML={{ __html: renderSidebar(S) }} />
        <main className="main" dangerouslySetInnerHTML={{ __html: renderMain(S) }} />
      </div>
      {inboxMountNode
        ? createPortal(
            <GateApprovalsInbox
              inboxText={approvalUi.inboxText}
              loading={approvalUi.inboxLoading}
              suggestion={approvalUi.suggestion}
              toast={approvalUi.toast}
              onTextChange={(inboxText) =>
                setStageGate((prev) => ({
                  ...prev,
                  approvalUi: { ...prev.approvalUi, inboxText },
                }))
              }
              onCapture={() => void handleCaptureInbox()}
              onConfirmSuggestion={handleConfirmSuggestion}
              onDismissSuggestion={() =>
                setStageGate((prev) => ({
                  ...prev,
                  approvalUi: { ...prev.approvalUi, suggestion: null, inboxLoading: false },
                }))
              }
              onSeedClick={(body) =>
                setStageGate((prev) => ({
                  ...prev,
                  approvalUi: { ...prev.approvalUi, inboxText: body },
                }))
              }
              onDismissToast={() =>
                setStageGate((prev) => ({
                  ...prev,
                  approvalUi: { ...prev.approvalUi, toast: null },
                }))
              }
            />,
            inboxMountNode
          )
        : null}
      {gateMountNode && selectedProject
        ? createPortal(
            <GateChasePanel
              project={selectedProject}
              approvalUi={approvalUi}
              mode={chaseUi?.mode ?? "chase"}
              loading={chaseUi?.loading ?? false}
              error={chaseUi?.error ?? null}
              draft={chaseUi?.draft ?? null}
              selectedIds={chaseUi?.selectedIds ?? []}
              subject={chaseUi?.subject ?? ""}
              body={chaseUi?.body ?? ""}
              steerco={STEERCO_MEMBERS}
              copyOk={copyOk}
              onToggleRecipient={toggleRecipient}
              onSubjectChange={(subject) =>
                setStageGate((prev) => ({
                  ...prev,
                  chaseUi: prev.chaseUi ? { ...prev.chaseUi, subject } : null,
                }))
              }
              onBodyChange={(body) =>
                setStageGate((prev) => ({
                  ...prev,
                  chaseUi: prev.chaseUi ? { ...prev.chaseUi, body } : null,
                }))
              }
              onRedraft={handleRedraft}
              onCopy={() => void handleCopy()}
              onOpenMail={handleOpenMail}
              onMarkChased={handleMarkChased}
              onSwitchEscalate={() => startChase("escalate")}
              onStartChase={() => startChase("chase")}
              onStartEscalate={() => startChase("escalate")}
              onOpenAttach={(approverId) =>
                setStageGate((prev) => ({
                  ...prev,
                  approvalUi: {
                    ...prev.approvalUi,
                    attachApproverId: approverId,
                    attachTab: "email",
                    attachPaste: "",
                  },
                }))
              }
              onCloseAttach={() =>
                setStageGate((prev) => ({
                  ...prev,
                  approvalUi: { ...prev.approvalUi, attachApproverId: null, attachPaste: "" },
                }))
              }
              onAttachTab={(attachTab) =>
                setStageGate((prev) => ({
                  ...prev,
                  approvalUi: { ...prev.approvalUi, attachTab },
                }))
              }
              onAttachPasteChange={(attachPaste) =>
                setStageGate((prev) => ({
                  ...prev,
                  approvalUi: { ...prev.approvalUi, attachPaste },
                }))
              }
              onAttachEmailSubmit={handleAttachEmail}
              onAttachFile={(file) => void handleAttachFile(file)}
              onRemoveEvidence={handleRemoveEvidence}
              onToggleEvidenceExpand={(expandedEvidenceApproverId) =>
                setStageGate((prev) => ({
                  ...prev,
                  approvalUi: { ...prev.approvalUi, expandedEvidenceApproverId },
                }))
              }
              onAdvanceGate={handleAdvanceGate}
              onToggleHistory={() =>
                setStageGate((prev) => ({
                  ...prev,
                  approvalUi: {
                    ...prev.approvalUi,
                    historyExpanded: !prev.approvalUi.historyExpanded,
                  },
                }))
              }
            />,
            gateMountNode
          )
        : null}
    </div>
  );
}
