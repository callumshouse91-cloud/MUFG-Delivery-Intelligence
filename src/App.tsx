import { useState, useEffect } from "react";
import { renderTopbar, renderSidebar, renderMain } from "./render";
import { NAV, POLICY } from "./data";

function fallback(lang: string) {
  return lang === "en"
    ? "Based on the indexed policy, that depends on the project's assurance level and entity \u2014 connect the full policy set for a cited answer."
    : "\u30a4\u30f3\u30c7\u30c3\u30af\u30b9\u3055\u308c\u305f\u30dd\u30ea\u30b7\u30fc\u306b\u57fa\u3065\u304d\u307e\u3059\u304c\u3001\u30d7\u30ed\u30b8\u30a7\u30af\u30c8\u306e\u4fdd\u8a3c\u30ec\u30d9\u30eb\u3068\u30a8\u30f3\u30c6\u30a3\u30c6\u30a3\u306b\u3088\u308a\u307e\u3059\u3002";
}

export default function App() {
  const [level, setLevel] = useState(0);
  const [nav, setNav] = useState("foundation");
  const [lang, setLang] = useState("en");
  const [chat, setChat] = useState<any[]>([]);
  const [step, setStep] = useState(0);
  const [gate, setGate] = useState<string | null>(null);
  const [gov, setGov] = useState("steerco");
  const [openNote, setOpenNote] = useState<number | null>(null);

  const S = { level, nav, lang, chat, step, gate, gov, openNote };

  useEffect(() => {
    const m = document.getElementById("msgs");
    if (m) m.scrollTop = m.scrollHeight;
  }, [chat, nav]);

  function onClick(e: any) {
    const el = (e.target as HTMLElement).closest("[data-action]");
    if (!el) return;
    const a = el.getAttribute("data-action");
    const num = (k: string) => parseInt(el.getAttribute(k) || "0", 10);
    if (a === "setlevel") {
      const n = num("data-n");
      setLevel(n);
      const it = NAV.find((x: any) => x.id === nav);
      if (it && n < it.min) setNav("foundation");
    } else if (a === "nav") {
      setNav(el.getAttribute("data-id") || "foundation");
      setGate(null);
      window.scrollTo(0, 0);
    } else if (a === "lang") {
      setLang(el.getAttribute("data-l") || "en");
    } else if (a === "ask") {
      const p = (POLICY as any)[num("data-i")][lang];
      setChat([...chat, { role: "u", text: p.q }, { role: "a", text: p.a, cite: p.c }]);
    } else if (a === "asktext") {
      const inp = document.getElementById("chatinput") as HTMLInputElement;
      const v = inp && inp.value.trim();
      if (v) setChat([...chat, { role: "u", text: v }, { role: "a", text: fallback(lang), cite: lang === "en" ? "Illustrative response" : "\u53c2\u8003\u56de\u7b54" }]);
    } else if (a === "proj") {
      setNav("gates");
      setGate(el.getAttribute("data-name"));
      window.scrollTo(0, 0);
    } else if (a === "gate") {
      setGate(el.getAttribute("data-name"));
    } else if (a === "step") {
      setStep(num("data-n"));
    } else if (a === "gov") {
      setGov(el.getAttribute("data-v") || "steerco");
    } else if (a === "note") {
      const i = num("data-i");
      setOpenNote(openNote === i ? null : i);
    }
  }

  function onKey(e: any) {
    if (e.key === "Enter" && (e.target as HTMLElement).id === "chatinput") {
      const v = (e.target as HTMLInputElement).value.trim();
      if (v) setChat([...chat, { role: "u", text: v }, { role: "a", text: fallback(lang), cite: "Illustrative" }]);
    }
  }

  return (
    <div onClick={onClick} onKeyDown={onKey}>
      <div className="topbar" dangerouslySetInnerHTML={{ __html: renderTopbar(S) }} />
      <div className="layout">
        <nav className="sidebar" dangerouslySetInnerHTML={{ __html: renderSidebar(S) }} />
        <main className="main" dangerouslySetInnerHTML={{ __html: renderMain(S) }} />
      </div>
    </div>
  );
}
