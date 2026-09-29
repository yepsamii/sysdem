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

- **Iteration**: 5
- **Major mismatches remaining**: 0
- **Minor mismatches remaining**: several (particle animation, header icon labels, edge label chips, mobile layout, shape SVGs, resize handle, attribution visibility)
- **Verified fixes**: 5 (Milestone 0 shell, MM-001 canvas, MM-002 components aside, MM-003 saved-locally banner, MM-004 cookie consent + token system)
- **Regressions introduced**: 0

---

## Current Iteration

### Selected mismatch

MM-006 — Edge particle animation: edges are static lines, but the reference animates colored particles + token labels along each edge via `<animateMotion>`.

### Why this mismatch was selected

The particles are the **headline visual feature** of GravelGraph. The reference animates 22 particles on the default diagram (data-phase staggered, two directions per edge, token labels like HTTPS / SQL / route / event). Without them, the canvas looks like a generic diagram tool. Fixing this is a high-impact visual change that brings the local noticeably closer to the reference's character. It also moves us from Milestone 1 (static canvas) into Milestone 2 (functional canvas).

### Reference observation

- Each edge has 1–2 particles per direction (`data-phase` 0..1, `data-dir` forward/reverse).
- Particle = `<circle r="3.2" fill="#…">` with `<animateMotion dur="20s" begin="-phase*20s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear" path="M…L…L…">`.
- Token label = `<text font-size="9" font-family="var(--font-mono)">` riding the same path with the same duration, just offset by `begin="0s"` so it trails the dot slightly.
- Pause behaviour removes `<animateMotion>` from the DOM (not `dur="0s"`).
- Colours come from `edge.data.animation.color` (cyan, emerald, pink, amber, violet, indigo, sky).

### Local observation

- Edges render as plain SVG paths with no `<animateMotion>` children.
- File: `src/canvas/Canvas.tsx` (no custom edge type yet; `edgeTypes.flow` is set to `undefined as never`).

### Root-cause hypothesis

No custom edge component. The plan called this out as Milestone 2 work.

### Planned change

1. Create `src/canvas/FlowEdge.tsx` — a custom xyflow edge that:
   - Renders the SVG path with `stroke="var(--color-border-strong)"`, `strokeWidth={1.5}`.
   - For each particle defined by `data.animation.density` × direction, mounts a `<circle>` + `<text>` with `<animateMotion>` whose `path` is computed from xyflow's source/target handle positions.
   - Reads `paused` state from a small `flowStore` (default `true` for this iteration, since the toolbar Pause button is still decorative).
2. Wire `edgeTypes.flow = FlowEdge` in `Canvas.tsx`.
3. Smoke test: count `animateMotion` after load — should be 9 (one particle per edge in this fixture).

For this iteration, no pause toggle, no flow-mode radios affecting timing — just the base animation working. Those refinements follow in MM-007…MM-008.

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
- **Status**: ✅ Fixed
- **Reference**: Dismissible dark strip beneath the header with three bold emphasis words.
- **Local**: `<SavedBanner>` renders between `<Header/>` and `<main>` with the same copy and bold words ("in this browser only", "Save", "Copy link"). Dismiss button sets `localStorage["gravelgraph.seenSavedBanner"]="1"` and hides the strip.
- **Evidence**: `.reverse-match/screenshots/iteration-003-local.png`
- **Files changed**: `src/components/layout/SavedBanner.tsx` (new), `src/App.tsx`.

### MM-004 — Cookie consent card missing

- **Category**: Component
- **Severity**: Medium
- **Status**: ✅ Fixed
- **Reference**: Bottom-left card with cookie icon, copy, "Privacy & cookies" link, cyan Accept / bordered Decline buttons. Persisted via `diagramr.cookieConsent`.
- **Local**: `<CookieConsent>` overlay positioned bottom-left (raised to `bottom-20 left-4` to clear the zoom controls) with cyan cookie icon, copy, cyan **Privacy & cookies** link, cyan-filled Accept + bordered Decline buttons. Persists `localStorage["gravelgraph.cookieConsent"] = { v:1, ads:boolean }` and hides on subsequent loads.
- **Result**: Geometry and palette match. Accept button now uses cyan accent (Tailwind v4 `@theme` colour tokens wired up in this iteration).
- **Evidence**: `.reverse-match/screenshots/iteration-004-local.png`
- **Files changed**: `src/components/overlays/CookieConsent.tsx` (new), `src/App.tsx`, `src/styles/tailwind.css` (moved colour tokens into `@theme` so `bg-accent`/`text-fg`/`text-muted`/`text-faint`/`border-border`/`bg-surface`/`bg-canvas` resolve as utilities).
- **Side effect of this iteration**: token-system fix retroactively improves the entire app — header, banner, aside, and node card colours all became correct.

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
- **Commit**: `b581971` MM-002: render left-side Components panel aside

### Iteration 4 — fix MM-003: render top "saved locally" banner

- **Goal**: Add the dismissible top banner with the three bold emphasis words.
- **Actions**:
  - Created `src/components/layout/SavedBanner.tsx`:
    - Reads `localStorage["gravelgraph.seenSavedBanner"]` on mount; hidden if `"1"`.
    - Renders the exact copy from the reference with three `<strong className="text-fg">` emphasis words.
    - × dismiss button on the right that sets the flag and hides itself.
- **Verification**: Reloaded at 1440×900. Banner appears directly under the header, copy matches, dismiss button works.
- **Result**: MM-003 fixed.
- **Next action**: MM-004 — cookie consent card.
- **Commit**: `bd8eedf` MM-003: render top "saved locally" dismissible banner

### Iteration 5 — fix MM-004: cookie consent card + token system fix

- **Goal**: Add bottom-left consent card and fix the Tailwind v4 token system so accent colours resolve.
- **Actions**:
  - Created `src/components/overlays/CookieConsent.tsx`: card with cookie icon, copy, cyan Privacy & cookies link, cyan Accept + bordered Decline buttons. Reads / writes `localStorage["gravelgraph.cookieConsent"]`.
  - Positioned at `bottom-20 left-4` (raised to clear the xyflow zoom Controls).
  - **Token-system fix** in `src/styles/tailwind.css`: moved all `--color-*` from `:root` into `@theme {}` block so Tailwind v4 generates the corresponding `bg-*` / `text-*` / `border-*` utilities (`bg-accent`, `text-fg`, `text-muted`, `text-faint`, `border-border`, `bg-surface`, `bg-canvas`).
- **Verification**: Cookie card renders with cyan accent on cookie icon + link + Accept button; Decline button uses bordered surface. Re-running earlier shots shows the whole app is now colour-correct: banner text emphasis, header buttons, node card borders, aside search input, components panel cards all use the right palette.
- **Result**: MM-004 fixed.
- **Next action**: MM-006 — edge particle animation (the headline visual effect).
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
