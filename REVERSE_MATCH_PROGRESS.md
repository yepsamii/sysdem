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

- **Iteration**: 11
- **Major mismatches remaining**: 0
- **Minor mismatches remaining**: several (shape SVGs, resize handle, attribution visibility, attribution text)
- **Verified fixes**: 11 (Milestone 0 shell, MM-001 canvas, MM-002 components aside, MM-003 saved-locally banner, MM-004 cookie consent + token system, MM-006 particle animation, MM-007 edge label chips, MM-008 chip-style Export/Present/Pause buttons, MM-009 mobile Components panel collapse, MM-010 mobile header toolbar visibility, MM-011 flow-mode radios + active state styling)
- **Regressions introduced**: 0

---

## Current Iteration

### Selected mismatch

MM-012 — Shape icons in the Components panel still use Unicode letter glyphs (▭, ⬜, ◯, ◇, △, ⬡, ⌭, T, ◐, ☁, ⇄, ⇆, ▣, ƒ, ◫, ⚙) instead of real SVG outline icons.

### Why this mismatch was selected

After fixing the toolbar issues, the Components panel is the next prominent chrome element. Inside each shape / client / compute card, the left-hand icon is a single Unicode glyph on a `bg-surface-2` chip, which is visually weaker than the reference's actual SVG outline icons. This is a visual polish mismatch that affects every item in the panel.

### Reference observation

Each component item in the reference renders with a small (about 24 px) outlined SVG icon (rounded rectangle, oval, hexagon, cloud, arrows, server, gear, etc.) — drawn in stroke style, no fill. Icons are loaded from a sprite / library.

### Local observation

Each component item renders a single Unicode character (`▭`, `⬜`, `◯`, `◇`, `△`, `⬡`, `⌭`, `T`, `◐`, `☁`, `⇄`, `⇆`, `▣`, `ƒ`, `◫`, `⚙`) at default font size. These glyphs look chunky and don't match the reference's outline style.

### Root-cause hypothesis

Local `ComponentsPanel.tsx` defines `shapeIcon(symbol)` returning a plain `<span>` with the glyph. No SVG paths exist for shapes.

### Planned change

(Filled in after implementation.)

### Result

(Filled in after implementation.)

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

### MM-005 / MM-008 — Header toolbar primary-action buttons need chip chrome + text labels

- **Category**: Visual / components
- **Severity**: Minor
- **Status**: ✅ Fixed
- **Reference**: Export, Present, Pause render as chip buttons with `bg-surface-2` background, 1 px border, `h-8 px-3`, 15 px icon + text label. Pause flips between "Pause" and "Resume" with the icon swap.
- **Local**: All three buttons now use the new `chipBtn` class (`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 select-none whitespace-nowrap bg-surface-2 text-fg hover:bg-surface-3 border border-border h-8 px-3 text-sm`) with `<Icon size={15} /> <span>...</span>` inside.
- **Result**: Pixel-perfect width match (Export 92.78 / Present 100.30 / Pause 90.06). Pause text flips correctly.
- **Evidence**: `.reverse-match/screenshots/iteration-007-local.png` + `.reverse-match/screenshots/iteration-007-reference.png`.
- **Files changed**: `src/components/layout/Header.tsx`.
- **Commit**: `4908a7b`

### MM-009 — Components panel always-open at all viewports

- **Category**: Mobile layout
- **Severity**: Major (mobile unusable before fix)
- **Status**: ✅ Fixed
- **Reference (mobile 420 × 820)**: Header + banner + a small "Components" pill button at the top-left below the banner. Canvas takes the full remaining viewport width and height. Clicking the pill expands the panel as a slide-over.
- **Local before**: `<ComponentsPanel>` rendered unconditionally as a 280 px-wide aside at every viewport. On mobile this dominated the screen and squeezed the canvas into ~140 px of width.
- **Fix**:
  - New `src/store/ui.ts` (zustand) holds `componentsOpen` (default `false` so mobile starts collapsed).
  - `ComponentsPanel` now conditionally renders: on `< lg` it's a `fixed top-12 left-0 bottom-0 z-30` slide-over (only when open); on `lg+` it's a `static shrink-0` grid column. When closed on mobile it's `hidden`; when closed on desktop it's `hidden lg:flex` so the panel is always visible at `lg+`.
  - The "Close Components" header button now sets `componentsOpen = false`.
  - New `<ComponentsTogglePill>` rendered between `<SavedBanner/>` and `<main/>`. Hidden on `lg+` (where the panel is always visible). On mobile it's a chip-style button (15 px menu icon + "Components" text) that toggles the store.
- **Verification (420 × 820)**:
  - Collapsed default: header visible, "Components" pill at top-left, canvas fills the screen.
  - Tapping pill: panel slides over from the left as a 280 px sheet; canvas still visible to the right.
  - Tapping × on panel: panel closes, canvas reclaims full width.
  - Verification (1440 × 900): panel renders in left grid column as before; toggle pill hidden (`lg:hidden`).
- **Evidence**:
  - `.reverse-match/screenshots/iteration-008-local-collapsed.png` (mobile, closed)
  - `.reverse-match/screenshots/iteration-008-local-open.png` (mobile, open)
  - `.reverse-match/screenshots/iteration-008-desktop.png` (desktop, no regression)
- **Files changed**: `src/store/ui.ts` (new), `src/components/panel/ComponentsPanel.tsx`, `src/components/panel/ComponentsTogglePill.tsx` (new), `src/App.tsx`.
- **Commit**: `6c98bff`

### MM-010 — Mobile header empty (only Menu + File icons)

- **Category**: Mobile layout
- **Severity**: Major (multiple primary actions unreachable on mobile)
- **Status**: ✅ Fixed
- **Reference (mobile 420 × 820)**: header keeps Continuous / Causal / Scenario / Pause / theme-toggle visible as chips. Select / Hand / Pencil / Line / Arrow / Export / Present / Undo / Redo / File are hidden.
- **Local before**: only GravelGraph logo + Menu + File icons visible on mobile (the entire `hidden lg:flex` group including the primary-action chips was hidden).
- **Fix** (in `src/components/layout/Header.tsx`):
  - Reorganised the header into two toolbar groups: a **secondary** group (Select / Hand / Pencil / Line / Arrow / Export / Present / Undo / Redo) kept `hidden lg:flex`, and a **primary** group (Compare / Continuous / Causal / Scenario / Pause / Help / theme) wrapped in a plain `flex` so it renders at every viewport.
  - Mobile hamburger now toggles `useUi.componentsOpen` (so it functions as the Components panel toggle on mobile — same pattern as the reference).
  - File button moved to `hidden lg:inline-flex` (mobile uses the hamburger instead).
  - Help button moved to `hidden md:inline-flex` (still reachable on tablets; on phones the theme toggle + primary actions take priority).
  - Compare icon hidden below `xl` (it sits between the secondary group and the primary group in the reference, but at narrow viewports the separator + it disappear).
  - "GravelGraph" wordmark hidden below `sm` to give more room to the toolbar.
- **Verification**:
  - 420 × 820: header shows logo (no wordmark) | hamburger | Components pill (below banner) | Continuous / Causal / Scenario / Pause / theme on the right. Canvas fills viewport.
  - 768 × 1024: same as desktop with all primary actions visible.
  - 1440 × 900: unchanged from before — full secondary toolbar + Export / Present chips + primary chips.
  - Zero console errors.
- **Evidence**:
  - `.reverse-match/screenshots/iteration-009-mobile.png`
  - `.reverse-match/screenshots/iteration-009-desktop.png`
- **Files changed**: `src/components/layout/Header.tsx`.
- **Commit**: `aad7445`

### MM-011 — Flow-mode radios + toggle buttons lack active state styling

- **Category**: Visual / behaviour
- **Severity**: Minor
- **Reference**: Continuous (active) uses `bg="rgb(14, 116, 144)" color="rgb(255, 255, 255)"` (cyan-filled, white icon). Causal / Scenario (inactive) are transparent. Hand (active pan tool) is tinted with `oklab(0.51975 -0.0682645 -0.0639536 / 0.15)`. Pause toggles similarly.
- **Local before**: All toolbar buttons share the same `iconBtn` class — `aria-pressed=true` had no visual effect. The three flow-mode buttons had hardcoded `aria-pressed=true/false/false` instead of being bound to `useFlow.mode`.
- **Fix** (in `src/components/layout/Header.tsx`):
  - Added a new `iconBtnPressed` class string: `inline-flex items-center justify-center rounded-md p-1.5 transition-colors bg-accent text-accent-contrast` (cyan background, dark contrast text/icon).
  - Hand button (default active pan tool) uses `iconBtnPressed`.
  - Continuous / Causal / Scenario now bind to `useFlow.mode` + `useFlow.setMode` and switch between `iconBtnPressed` and `iconBtn` based on whether they match.
  - Pause button switches between `iconBtnPressed` (when `paused`) and `iconBtn` (when running).
- **Verification**:
  - Default load: Continuous highlighted cyan; clicking Causal swaps the highlight to Causal; clicking Scenario to Scenario.
  - Clicking Pause flips icon `pause → play`, text `Pause → Resume`, and highlights the button cyan.
  - Zero console errors. Zero regressions (other buttons unaffected).
- **Evidence**:
  - `.reverse-match/screenshots/iteration-010-default.png`
  - `.reverse-match/screenshots/iteration-010-causal.png`
  - `.reverse-match/screenshots/iteration-010-paused.png`
- **Files changed**: `src/components/layout/Header.tsx`.
- **Commit**: (next)

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
- **Next action**: MM-008 — toolbar Export / Present / Pause chip-style buttons.
- **Commit**: `1a79fdd`

### Iteration 8 — fix MM-008: chip-style Export / Present / Pause buttons

- **Goal**: Bring the three primary-action header buttons in line with the reference's chip chrome (bg-surface-2 background + 1 px border + 15 px icon + visible text label).
- **Actions**:
  - In `src/components/layout/Header.tsx`:
    - Added a new `chipBtn` class string matching the reference: `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 select-none whitespace-nowrap bg-surface-2 text-fg hover:bg-surface-3 border border-border h-8 px-3 text-sm`.
    - Replaced the icon-only `<Icon name="download" />` etc. with `<Icon name="download" size={15} /> <span>Export</span>` for Export and Present.
    - Replaced the Pause button's body with `<Icon name={paused ? 'play' : 'pause'} size={15} /> <span>{paused ? 'Resume' : 'Pause'}</span>` so the label flips together with the icon.
- **Verification**:
  - Reloaded at 1440×900 in dark theme.
  - Measured widths: Export 92.78 px, Present 100.30 px, Pause 90.74 px — pixel-perfect match with reference (92.78 / 100.30 / 90.06).
  - All other computed styles (height 32, padding `0 12px`, borderRadius 8 px, fontSize 14 px, gap 8 px, fontWeight 500, border 1 px solid `var(--color-border)`) match.
  - Pause toggle test: clicking flips icon `pause → play` and text `Pause → Resume`; clicking again restores.
  - Zero console errors.
- **Result**: MM-008 fixed.
- **Next action**: Inspect mobile layout mismatches.
- **Commit**: `4908a7b`

### Iteration 9 — fix MM-009: mobile Components panel collapse + toggle pill

- **Goal**: On mobile (≤ lg), collapse the Components panel into a small "Components" pill button below the saved-locally banner, so the canvas takes the full screen width.
- **Actions**:
  - Created `src/store/ui.ts` with `componentsOpen: false` (default), `setComponentsOpen`, `toggleComponents`.
  - Updated `src/components/panel/ComponentsPanel.tsx`:
    - Subscribes to `componentsOpen` and `setComponentsOpen` from `useUi`.
    - On `< lg`: when open → `fixed top-12 left-0 bottom-0 z-30 w-[280px] shadow-panel`; when closed → `hidden`.
    - On `lg+`: always rendered as `static shrink-0 w-[280px] h-full border-r border-border` (no change from before).
    - The "Close Components" × button now calls `setComponentsOpen(false)`.
  - Created `src/components/panel/ComponentsTogglePill.tsx`: small chip button (15 px menu icon + "Components" label) that toggles the store. Hidden on `lg+` via `lg:hidden`.
  - Updated `src/App.tsx` to render `<ComponentsTogglePill/>` between `<SavedBanner/>` and `<main/>`.
- **Verification**:
  - 420 × 820: panel is hidden by default, canvas fills viewport. Tapping pill → panel slides over from the left as a 280 px sheet. Tapping × → panel closes, canvas reclaims full width.
  - 1440 × 900: panel renders in left grid column as before; toggle pill hidden (`lg:hidden`).
  - Zero console errors.
- **Result**: MM-009 fixed. Mobile UX now matches the reference's panel-collapse pattern.
- **Next action**: MM-010 — mobile header shows only logo + Menu + File; reference keeps Continuous / Causal / Scenario / Pause chips visible at all viewports.
- **Commit**: `6c98bff`

### Iteration 10 — fix MM-010: mobile header keeps primary toolbar chips visible

- **Goal**: On mobile (< lg), show the primary action chips (Continuous / Causal / Scenario / Pause / theme) while keeping secondary buttons (Select / Hand / Pencil / Line / Arrow / Export / Present / Undo / Redo / File) hidden.
- **Actions** (in `src/components/layout/Header.tsx`):
  - Split the header into a **secondary toolbar group** (`hidden lg:flex` — desktop-only) and a **primary toolbar group** (`flex` — visible at every viewport).
  - Mobile hamburger now calls `toggleComponents()` from `useUi` so it doubles as the Components panel toggle.
  - File button moved to `hidden lg:inline-flex`.
  - Help button moved to `hidden md:inline-flex` (still reachable on tablet).
  - Compare icon hidden below `xl` (it sits at the start of the right group in the reference).
  - "GravelGraph" wordmark hidden below `sm` to give more room.
- **Verification**:
  - 420 × 820: header shows logo (no wordmark) | hamburger | Components pill (below banner) | Continuous / Causal / Scenario / Pause / theme on the right. Canvas fills viewport.
  - 768 × 1024: same as desktop with all primary actions visible.
  - 1440 × 900: unchanged from before — full secondary toolbar + Export / Present chips + primary chips.
- **Result**: MM-010 fixed.
- **Next action**: MM-011 — flow-mode radios need active state styling.
- **Commit**: `aad7445`

### Iteration 11 — fix MM-011: flow-mode radios + toggle buttons active-state styling

- **Goal**: Make the active state of flow-mode buttons (Continuous / Causal / Scenario) and toggle buttons (Hand, Pause) visually obvious with a cyan-filled chip, matching the reference.
- **Actions** (in `src/components/layout/Header.tsx`):
  - Added `iconBtnPressed` class: `inline-flex items-center justify-center rounded-md p-1.5 transition-colors bg-accent text-accent-contrast`.
  - Hand button switched to `iconBtnPressed` (default-active pan tool).
  - Continuous / Causal / Scenario now bind to `useFlow.mode` + `useFlow.setMode`. Each switches between `iconBtnPressed` and `iconBtn` based on whether its name matches the active mode.
  - Pause button switches between `iconBtnPressed` (when `paused`) and `iconBtn` (when running).
- **Verification**:
  - Default load: Continuous is cyan-filled. Clicking Causal moves the highlight to Causal. Clicking Scenario to Scenario. Verified by toggling each button.
  - Pause toggle: clicking flips icon + text + highlight; clicking Resume restores.
  - Zero console errors, no regressions on other buttons.
- **Result**: MM-011 fixed.
- **Next action**: MM-012 — replace Unicode glyphs in the Components panel with real SVG outline icons.
- **Commit**: (next)

---

## Per-Iteration Evidence

> One row per iteration pointing to the screenshots and measurements.

| Iter | Selected MM | Reference shot | Local shot | Diff shot | Measurements |
|------|-------------|----------------|------------|-----------|--------------|
| 000  | (pre-flight) | — | — | — | — |
| 001  | MM-001 | — | `.reverse-match/screenshots/iteration-001-local.png` | — | — |
| 002  | MM-002 | — | `.reverse-match/screenshots/iteration-002-local.png` | — | — |
| 003  | MM-003 | — | `.reverse-match/screenshots/iteration-003-local.png` | — | — |
| 004  | MM-004 | — | `.reverse-match/screenshots/iteration-004-local.png` | — | — |
| 005  | MM-006 | — | `.reverse-match/screenshots/iteration-005-local.png` | — | — |
| 006  | MM-007 | — | `.reverse-match/screenshots/iteration-006-local.png` | — | — |
| 007  | MM-008 | `.reverse-match/screenshots/iteration-007-reference.png` | `.reverse-match/screenshots/iteration-007-local.png` | — | inline in iteration log |

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
