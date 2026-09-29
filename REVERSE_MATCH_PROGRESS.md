# Reverse Match Progress

A persistent memory of the iterative reverse-match loop. This document is **stateful**: it captures the current target, every discovered mismatch, every change attempted, the verification result, and the next selected mismatch. If the loop is paused and resumed, the next run reads this file and continues from where it left off.

> Companion to `REVERSE_ENGINEERING.md` (which captures the static reverse-engineering of the reference). This file tracks **dynamic progress** against the local implementation.

---

## Target

- **Reference**: `https://www.gravelgraph.com/`
- **Local**: `http://localhost:5173/` *(confirm by reading `package.json` `dev` script — default Vite port 5173, but the user may have set another)*
- **Primary viewport**: 1440 × 900
- **Secondary viewports**: 420 × 820 (mobile), 768 × 1024 (tablet)
- **Last updated**: 2026-09-29 23:15

---

## Overall Progress

- **Iteration**: 3
- **Major mismatches remaining**: 2 (top "saved locally" banner, cookie consent card)
- **Minor mismatches remaining**: several (particle animation, header icon labels, edge label chips, mobile layout)
- **Verified fixes**: 3 (Milestone 0 shell, MM-001 canvas, MM-002 components aside)
- **Regressions introduced**: 0

---

## Current Iteration

### Selected mismatch

MM-003 — Top "saved locally" banner missing.

### Why this mismatch was selected

The banner sits directly below the header and is a persistent chrome element — its presence/absence affects the visual weight of the header region and the perceived height of the canvas. Adding it is a small, isolated change that improves overall fidelity before tackling more complex pieces like the cookie consent modal.

### Reference observation

- Dark strip beneath the header: `Your work is saved in this browser only — no account, no server. Use Save to keep a .gravel file, or Copy link to share it.`
- Three emphasis words styled with bold: "in this browser only", "Save", "Copy link".
- × close button on the far right.
- `localStorage["diagramr.seenSavedBanner"] = "1"` (assumption — needs verification) dismisses it permanently.

### Local observation

- No banner between header and main.
- File: `src/App.tsx`.

### Root-cause hypothesis

No `<Banners>` sibling exists in the shell.

### Planned change

Insert a `<SavedBanner>` strip between `<Header/>` and `<main>` with:

1. Inline copy with `<strong>` for the three emphasis phrases.
2. × dismiss button on the right that sets `localStorage["gravelgraph.seenSavedBanner"] = "1"`.
3. Conditional render: hidden if the flag is set.

For Milestone 1, no animation, no fade — just static markup with the dismiss interaction.

---

## Mismatch Queue

> Each mismatch gets an ID `MM-NNN`. Fill one out per discovered difference. Do not invent measurements.

### MM-001 — Empty main area: no canvas / diagram / controls / minimap

- **Category**: Major structural
- **Severity**: Blocking — page is visually empty
- **Status**: ✅ Fixed
- **Reference**: Full React Flow canvas with default System Architecture diagram (9 nodes, ~9 edges, dot background, controls, minimap)
- **Local**: `<ReactFlow>` mounted with `<Background>` dots, `<Controls>` bottom-left, `<MiniMap>` bottom-right (per-kind colors), and the default 9-node / 9-edge fixture.
- **Result**: Page now shows the same overall geometry as the reference (canvas fills remaining width below header; minimap and controls in expected corners). Particle animation is not yet implemented — only edges are drawn; this is acceptable for Milestone 1.
- **Evidence**: `.reverse-match/screenshots/iteration-001-local.png`. No console errors after reload.
- **Files changed**: `src/App.tsx`, `src/canvas/Canvas.tsx`, `src/canvas/ArchNode.tsx`, `src/canvas/defaultDiagram.ts`.

### MM-002 — Components aside missing

- **Category**: Major structural
- **Severity**: Major
- **Status**: ✅ Fixed
- **Reference**: Left-side `<aside aria-label="Components">` ~280 px wide with title, close button, search input, Expand all / Collapse all, Stencils row, Shapes (8) + Clients & Network (4) + Compute (4) groups with chevron + count badges
- **Local**: `<aside aria-label="Components">` renders with the same width, header layout, search input, Expand/Collapse buttons, Stencils row with ↓ import / ↑ export icons (matching the live site), and three collapsible groups with chevron + count badges. SVG icons on the close / chevron / expand / collapse / import / export buttons.
- **Result**: Geometry matches. Two minor remaining differences documented as future mismatches: (a) shape icons in the buttons are letter glyphs rather than real Lucide SVG outlines, and (b) the group is not yet resizable (no `<hr role="separator">`).
- **Evidence**: `.reverse-match/screenshots/iteration-002-local.png`
- **Files changed**: `src/App.tsx`, `src/components/panel/ComponentsPanel.tsx` (new), `src/components/ui/Icon.tsx` (added `upload` icon).

### MM-003 — Top "saved locally" banner missing

- **Category**: Component
- **Severity**: Medium
- **Status**: Pending
- **Reference**: Dismissible dark strip beneath the header: `Your work is saved in this browser only — no account, no server. Use Save to keep a .gravel file, or Copy link to share it.` with a × close on the right
- **Local**: Not present
- **Difference**: Banner absent
- **Evidence**: Reference screenshot top strip
- **Likely cause**: Not implemented
- **Planned fix**: Build `<SavedBanner>` with localStorage dismissal flag (`gravelgraph.seenSavedBanner`)

### MM-004 — Cookie consent card missing

- **Category**: Component
- **Severity**: Medium
- **Status**: Pending
- **Reference**: Bottom-left card with cookie icon, "Ads keep GravelGraph free…" copy, "Privacy & cookies" link, Accept/Decline buttons. Persisted via `diagramr.cookieConsent`
- **Local**: Not present
- **Difference**: Consent banner absent
- **Evidence**: Reference screenshot bottom-left
- **Likely cause**: Not implemented
- **Planned fix**: Build `<CookieConsent>` region with `Accept`/`Decline` toggling `localStorage["gravelgraph.cookieConsent"]`

### MM-005 — Header toolbar buttons lack visible text labels

- **Category**: Visual / components
- **Severity**: Minor
- **Status**: Pending
- **Reference**: Several buttons show icons + text ("Export", "Present", "Pause"). Help button is icon-only.
- **Local**: All toolbar buttons are icon-only with reduced visual weight
- **Difference**: "Export" and "Present" are missing their text labels
- **Evidence**: Toolbar aria-labels vs visual chrome in reference
- **Likely cause**: Local Header uses only icons
- **Planned fix**: Add text labels next to `download` and `present` icons in the same style as the reference

---

## Iteration Log

> Append one section per iteration. Never overwrite; never delete history.

### Iteration 1 — bootstrap Milestone 0 shell + first mismatch pass

- **Goal**: Bootstrap a working local SPA, take the first reference vs local screenshots, populate the Mismatch Queue, begin fixing MM-001.
- **Actions**:
  - Created `package.json` (Vite + React 19 + TS + Tailwind v4 + @xyflow/react + zustand).
  - Created `vite.config.ts`, `tsconfig.json`, `index.html`, `public/favicon.svg`.
  - Created `src/styles/tailwind.css` with the full design-token block from `REVERSE_ENGINEERING.md` §4.
  - Created `src/store/theme.ts` (zustand + persist), `src/components/ui/Icon.tsx` (Lucide-style line icons), `src/components/layout/Header.tsx`, `src/App.tsx`.
  - Allowed esbuild build via `pnpm-workspace.yaml` `onlyBuiltDependencies: [esbuild]`.
  - Started `pnpm dev` → server live at http://127.0.0.1:5173.
  - Captured reference shot at 1440×900 → `.reverse-match/screenshots/iteration-000-reference.png`.
  - Captured local shot at 1440×900 → `.reverse-match/screenshots/iteration-000-local.png`.
  - Compared and populated Mismatch Queue with MM-001…MM-005.
- **Verification**: Local page renders dark canvas with header. No console errors. Theme toggle wired (via store).
- **Result**: Milestone 0 acceptance met. Selected MM-001 for next iteration.
- **Next action**: Build `<Canvas>` with React Flow + default system architecture fixture + Background/Controls/MiniMap.
- **Commit**: `0388fcd` Bootstrap Milestone 0: Vite + React 19 + Tailwind v4 shell

### Iteration 2 — fix MM-001: render React Flow canvas with default diagram

- **Goal**: Bring up the main canvas region to match the reference.
- **Actions**:
  - Created `src/canvas/defaultDiagram.ts` with the 9-node / 9-edge "System Architecture" fixture and per-kind colour metadata.
  - Created `src/canvas/ArchNode.tsx` (180×64 rounded card, icon chip + 2-line label, 8 invisible hover handles per node).
  - Created `src/canvas/Canvas.tsx` mounting `<ReactFlow>` with `<Background variant="dots">`, `<Controls position="bottom-left">`, and `<MiniMap position="bottom-right">` using per-kind nodeColor (cyan/pink/amber/violet).
  - Updated `src/App.tsx` to mount `<Canvas>` inside `<main>`.
- **Verification**: Reloaded http://127.0.0.1:5173 at 1440×900; 9 nodes and 9 edges render, dot background visible, controls bottom-left, minimap bottom-right with expected palette. Zero console errors.
- **Result**: MM-001 fixed. Remaining differences inside the canvas (particle animation, edge label chips, custom curve smoothing) are deferred to Milestone 2.
- **Next action**: MM-002 — add the left-side Components aside.
- **Commit**: `e3fb1b3` MM-001: render React Flow canvas with default System Architecture

### Iteration 3 — fix MM-002: render Components aside on the left

- **Goal**: Bring up the left-side Components panel.
- **Actions**:
  - Created `src/components/panel/ComponentsPanel.tsx`:
    - Header: title "Components" + close button with `aria-label="Close Components"`.
    - Search input with magnifier and placeholder "Search components & services".
    - Expand all / Collapse all buttons with title attributes (`Expand every section` / `Collapse every section`).
    - Stencils row: `Stencils` label + ↓ import + ↑ export SVG buttons (down-arrow / up-arrow), italic helper copy.
    - Three groups (Shapes 8, Clients & Network 4, Compute 4) with chevron + label + count, default-open for Shapes and Clients & Network, collapsible.
    - 2-col grid of items per group with icon chip + name.
  - Updated `src/components/ui/Icon.tsx` to add `upload` icon (used elsewhere).
  - Restructured `<App>` to use `<main className="flex">` with `<ComponentsPanel/>` + `<div className="flex-1"><Canvas/></div>`.
- **Verification**: Reloaded at 1440×900. Aside renders at correct width, all sections visible, icons match the live site's arrow directions. Zero console errors.
- **Result**: MM-002 fixed. Remaining differences: shape buttons still use letter glyphs (not real SVG outlines), panel is fixed-width (resize handle not implemented).
- **Next action**: MM-003 — top "saved locally" banner.
- **Commit**: (next)

---

## Per-Iteration Evidence

> One row per iteration pointing to the screenshots and measurements.

| Iter | Selected MM | Reference shot | Local shot | Diff shot | Measurements |
|------|-------------|----------------|------------|-----------|--------------|
| 000  | (pre-flight) | — | — | — | — |

---

## Final Verification

> Filled in once the page is sufficiently close to the reference.

### Desktop (1440 × 900)

- **Status**: PENDING

### Mobile (420 × 820)

- **Status**: PENDING

### Tablet (768 × 1024)

- **Status**: PENDING

### Interactions

- **Status**: PENDING

### Remaining differences

1. *(none yet)*

### Known limitations

1. *(none yet)*

---

## How to resume

If a new session picks up this file:

1. Read `REVERSE_ENGINEERING.md` (static knowledge).
2. Read the **Current Iteration** section above.
3. Read the most recent entries in the **Iteration Log**.
4. Start the local dev server (`pnpm dev` / `npm run dev` / `yarn dev` — check `package.json`).
5. Use Playwright to inspect both URLs at the same viewport.
6. Continue from the "Next action" of the most recent iteration.
