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

- **Iteration**: 7
- **Major mismatches remaining**: 0
- **Minor mismatches remaining**: several (header icon labels, mobile layout, shape SVGs, resize handle, attribution visibility, flow-mode radios)
- **Verified fixes**: 7 (Milestone 0 shell, MM-001 canvas, MM-002 components aside, MM-003 saved-locally banner, MM-004 cookie consent + token system, MM-006 particle animation, MM-007 edge label chips)
- **Regressions introduced**: 0

---

## Current Iteration

### Selected mismatch

MM-008 — Toolbar Export / Present buttons need visible text labels.

### Why this mismatch was selected

The reference shows "Export" and "Present" as labeled chips (icon + text). Mine shows them icon-only. This is a small, isolated change that improves the visual weight and clarity of two primary actions in the header.

### Reference observation

- Export button: download icon + "Export" text.
- Present button: present icon + "Present" text.
- Help and the flow-mode icons remain icon-only.

### Local observation

- All header buttons are icon-only.
- File: `src/components/layout/Header.tsx`.

### Planned change

Convert the Export and Present buttons to `inline-flex items-center gap-1.5 rounded-md px-2 py-1.5` containing the icon + a `text-xs font-medium` text label. Use the same hover treatment as the icon buttons.

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

### MM-006 — Edge particle animation missing (HEADLINE feature)

- **Category**: Major visual feature
- **Severity**: High
- **Status**: ✅ Fixed
- **Reference**: 22 particles + token labels riding edges via SMIL `<animateMotion>`; pause removes them from the DOM.
- **Local**: 25 `<animateMotion>` after load (13 particle circles + 12 token labels). Per-edge color / density / direction / token label all driven by `edge.data.animation`. Pause button removes all `<animateMotion>` from the DOM (25 → 0); Resume restores.
- **Result**: Headline visual effect works and is toggleable.
- **Evidence**: `.reverse-match/screenshots/iteration-005-local.png` shows `HTML`, `HTTPS`, `asset`, `route`, `GET`, `SQL`, `event`, `msg` token labels riding edges with the right per-kind colours.
- **Files changed**: `src/canvas/FlowEdge.tsx` (new), `src/store/flow.ts` (new), `src/canvas/Canvas.tsx`, `src/components/layout/Header.tsx`.

### MM-007 — Edge label chips missing

- **Category**: Edge UI
- **Severity**: Medium
- **Status**: ✅ Fixed
- **Reference**: Static HTML divs at edge midpoints showing labels like "request / response", "static assets", "app shell", "route", "session lookup", "publish event", "consume".
- **Local**: Each labelled edge now renders an `<EdgeLabelRenderer>` with `nodrag nopan absolute px-1.5 py-0.5 rounded bg-surface border border-border text-xs` div, positioned via `transform: translate(-50%,-50%) translate(labelX, labelY)` using `getStraightPath`'s midpoint.
- **Evidence**: `.reverse-match/screenshots/iteration-006-local.png` shows all 7 labelled edges with chips.
- **Files changed**: `src/canvas/FlowEdge.tsx`.

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
- **Commit**: `eaa0565` MM-004: render cookie consent card; wire Tailwind v4 colour tokens

### Iteration 6 — fix MM-006: edge particle animation + pause toggle

- **Goal**: Bring up the headline visual effect — colored particles + token labels riding each edge via SMIL `<animateMotion>` — and wire the toolbar Pause button.
- **Actions**:
  - Created `src/store/flow.ts` (zustand store: `paused`, `mode`, `togglePaused`, `setMode`).
  - Created `src/canvas/FlowEdge.tsx`:
    - Uses xyflow `getStraightPath` to derive the SVG path from source/target handle positions.
    - Renders a `<BaseEdge>` for the line stroke.
    - For each particle defined by `data.animation.density × direction`, renders `<circle r="3.2" fill={color}>` with `<animateMotion dur={BASE_DUR/speed}s begin="-phase*dur" repeatCount="indefinite" keyPoints="0;1" calcMode="linear" path={...}>`.
    - If `data.animation.tokenLabel` is set, also rides a `<text fontSize=9 fontFamily=var(--font-mono) fill={color}>token</text>` on the same path, slightly behind the dot.
    - When `paused` is true OR `data.animation.enabled === false`, returns only the static path (no `<animateMotion>`) — matching the reference's pause behaviour (DOM removal rather than `dur="0s"`).
  - Updated `src/canvas/Canvas.tsx`: `edgeTypes.flow = FlowEdge`.
  - Updated `src/components/layout/Header.tsx`: Pause button now reads `paused` from `useFlow`, toggles it, and swaps the icon between `pause` and `play`.
- **Verification**: 25 `<animateMotion>` elements after load (13 particle circles + 12 token labels). Click Pause → label flips to "Resume data flow", `aria-pressed=true`, and `animateMotion` count drops to 0. Click Resume → counts return. Zero console errors.
- **Result**: MM-006 fixed. The headline visual effect is now visible and toggleable.
- **Next action**: MM-007 — edge label chips at edge midpoints.
- **Commit**: `988c15e` MM-006: animate data-flow particles along edges via SMIL

### Iteration 7 — fix MM-007: edge label chips at edge midpoints

- **Goal**: Render the static HTML label div at each labelled edge's midpoint.
- **Actions**:
  - In `src/canvas/FlowEdge.tsx`:
    - Switched `getStraightPath` destructuring to `[edgePath, labelX, labelY]`.
    - Added an `<EdgeLabelRenderer>` block that renders a `nodrag nopan absolute px-1.5 py-0.5 rounded bg-surface border border-border text-xs` div positioned via `transform: translate(-50%,-50%) translate(labelX,labelY)`. Conditional on `data.label`.
    - Rendered in both the paused branch and the animated branch.
- **Verification**: Reloaded at 1440×900. Seven chips visible: "static assets", "app shell", "request / response", "route", "session lookup", "publish event", "consume". Zero console errors.
- **Result**: MM-007 fixed.
- **Next action**: MM-008 — toolbar Export / Present labels.
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
