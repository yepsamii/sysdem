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

- **Iteration**: 2
- **Major mismatches remaining**: 3 (components aside, cookie consent, top banner)
- **Minor mismatches remaining**: several (header icon labels, particle animation, etc.)
- **Verified fixes**: 2 (Milestone 0 shell + MM-001 canvas)
- **Regressions introduced**: 0

---

## Current Iteration

### Selected mismatch

MM-002 — Components aside missing on the left side.

### Why this mismatch was selected

The aside is a structural sibling of the canvas in the reference (`.gg-shell` → `<main>` (flex-1) + `<aside>`), and removing it would force a layout-level comparison fix before visual fidelity. Once the aside exists, the right-toolbar cluster and the main canvas can be compared with the same expectations in both implementations.

### Reference observation

- `<aside aria-label="Components">` rendered on the left of `<main>`, ~280 px wide.
- Header inside the aside: bold title "Components" and a close (×) button on the right.
- Search input with magnifier icon and placeholder "Search components & services".
- "Expand all" / "Collapse all" buttons below search.
- Below those: a "STENCILS" group (italic helper text "Select elements, then 'Save as stencil' to reuse them here." + Import ↑ and Export ↓ icon buttons on the right).
- Below Stencils: collapsible "SHAPES" group with count badge "8" and 8 buttons in a 2-column grid (Rectangle, Rounded, Ellipse, Diamond, Triangle, Hexagon, Cylinder, Text).
- Below Shapes: collapsible "CLIENTS & NETWORK" group with count "4" and items Client, CDN, API Gateway, Load Balancer.

### Local observation

- No `<aside>` exists in the DOM.
- `<main>` is the only child of `.gg-shell` below the header.
- File: `src/App.tsx`.

### Root-cause hypothesis

`<Aside>` component never implemented. No components panel CSS or markup exists.

### Planned change

Add `<ComponentsPanel>` (initially non-resizable, fixed 280 px width) under `<main>` in a `flex` row, with:

1. Title + close button.
2. Search input (placeholder only — filtering comes later).
3. "Expand all" / "Collapse all" buttons (no-op for now).
4. STENCILS group header.
5. SHAPES group with 8 buttons in 2-col grid + count badge.
6. CLIENTS & NETWORK group with 4 buttons + count badge.

For Milestone 1 acceptance, the visual geometry (width, padding, scroll behaviour) is what matters — click behaviour is not in scope this iteration.

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
- **Status**: Pending
- **Reference**: Left-side `<aside aria-label="Components">` ~280 px wide, with title + close, search input, Expand/Collapse all buttons, STENCILS group, SHAPES group (Rectangle/Rounded/Ellipse/Diamond/Triangle/Hexagon/Cylinder/Text), CLIENTS & NETWORK (Client/CDN/API Gateway/Load Balancer), COMPUTE group
- **Local**: Nothing — `<main>` is empty
- **Difference**: Sidebar component entirely absent
- **Evidence**: Reference screenshot left side
- **Likely cause**: Not implemented yet
- **Planned fix**: Build `<ComponentsPanel>` aside with at least Shapes + Clients & Network + Compute + first-run Stencils stub

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
