# MUFG Connected Delivery — demo

A clickable demo of SmartCo's phased approach for MUFG, built as a Vite + React + TypeScript project so you can drop it into Cursor and refine.

## Run it

```bash
npm install
npm run dev        # opens http://localhost:5173
```

Build / preview: `npm run build` then `npm run preview`.

## The idea

The whole story is the **build-level switch** in the top bar. We start narrow and build up — each level captures more, and insight only appears once the history exists to support it. Nothing is replaced.

- **Level 0 — Foundation.** Connect read-only sources, score data hygiene, and turn on the bilingual (EN / 日本語) Policy Assistant. The substrate starts to fill. No predictions.
- **Level 1 — Prove.** The two solutions we'd prove first: the **Stage-Gate Tracker** and the **Financial Mismatch** view, plus a real-time portfolio view. Insight here is **current-state fact only** — no patterns, because there's no history yet.
- **Level 2 — Compound.** What the accruing history unlocks: **Artefact Studio** with **write-back to Plan View**, **early-warning** on the mismatch (drift, uncommitted costs, resource flags) and **gate patterns**.
- **Level 3 — Predict & expand.** Genuine predictive cross-portfolio **AI Insights**, decision-focused governance, and the proven engine extended to **procurement** and **vendor / SoW** flows.

The growth metric is **accumulated structured delivery data**, not "connectors lit", and the Foundation screen shows how that data **builds up** level by level — what each amount of history enables, and why insight only appears once enough trusted data exists.

## What's interactive

The level switch, the Policy Assistant (presets + EN/JP toggle), the Stage-Gate detail/chase, Artefact Studio's generate → sign-off → write-back flow, and the Governance Steerco/Portfolio toggle.

## Structure

```
src/
  data.ts      ← all datasets, copy and the MUFG logo. Edit content here.
  render.ts    ← every screen, as functions returning markup. Edit screens here.
  App.tsx      ← React shell: state + click/keyboard handlers.
  main.tsx     ← entry point.
  styles.css   ← MUFG theme (red as chrome only; RAG as separate filled pills; Noto Sans JP).
```

The screens are rendered as markup strings and mounted via `dangerouslySetInnerHTML`, with a single delegated click handler reading `data-action` attributes. This keeps the demo in one place and easy to edit; refactor into proper React components in Cursor whenever you want.

## Before you show it

- **Logo:** the MUFG mark in `data.ts` (`MUFG_LOGO`) is a clean SVG rebuild — the supplied asset was watermarked. Swap in the official asset.
- **Synthetic / illustrative:** every name, number and AI reply is synthetic and badged "illustrative". If you want one genuinely live moment, wire a real model call into the Policy Assistant or Artefact generation.
- **Theme:** red is chrome only (header rule, active nav, primary buttons); RAG status uses a separate filled-pill palette so a red project never looks like a brand accent.
