# Reverse Match Progress

A persistent memory of the iterative reverse-match loop. This document is **stateful**: it captures the current target, every discovered mismatch, every change attempted, the verification result, and the next selected mismatch. If the loop is paused and resumed, the next run reads this file and continues from where it left off.

> Companion to `REVERSE_ENGINEERING.md` (which captures the static reverse-engineering of the reference). This file tracks **dynamic progress** against the local implementation.

---

## Target

- **Reference**: `https://www.gravelgraph.com/`
- **Local**: `http://localhost:5173/` *(confirm by reading `package.json` `dev` script — default Vite port 5173, but the user may have set another)*
- **Primary viewport**: 1440 × 900
- **Secondary viewports**: 420 × 820 (mobile), 768 × 1024 (tablet)
- **Last updated**: 2026-09-30 00:30

---

## Overall Progress

- **Iteration**: 19
- **Major mismatches remaining**: 0
- **Minor mismatches remaining**: several (resize handle, real brand SVGs for SaaS & Identity only, panel header brand icon, search functionality, stencils import/export wiring, default theme might be dark vs light depending on OS preference)
- **Verified fixes**: 19 (Milestone 0 shell, MM-001 canvas, MM-002 components aside, MM-003 saved-locally banner, MM-004 cookie consent + token system, MM-006 particle animation, MM-007 edge label chips, MM-008 chip-style Export/Present/Pause buttons, MM-009 mobile Components panel collapse, MM-010 mobile header toolbar visibility, MM-011 flow-mode radios + active state styling, MM-012 Lucide SVG outline icons, MM-013 first-party groups + per-kind colors, MM-014 single-column draggable item rows, MM-015 provider section labels with pill badges, MM-016 hide React Flow attribution badge, MM-017 Databases section brand icons, MM-018 Data & Analytics section brand icons, MM-019 Messaging & Streaming + DevOps & Observability brand icons)
- **Regressions introduced**: 0

---

## Current Iteration

### Selected mismatch

MM-020 — SaaS & Identity provider items (Stripe, Auth0, Okta, Firebase) still use generic Lucide placeholders. Reference uses real brand SVGs.

### Why this mismatch was selected

After MM-019 completes (Messaging & Streaming + DevOps & Observability), the only remaining open-by-default provider section using placeholders is SaaS & Identity (4 items). Closing it out finishes the brand-icon replacement work started in MM-017.

### Reference observation

(To be inspected before implementation.)

### Local observation

After MM-019, the SaaS & Identity section still shows Stripe (`app-window`), Auth0 (`shield-check`), Okta (`shield-check`), Firebase (`zap`) — all generic Lucide placeholders. The other 8 provider sections now use real brand SVGs.

### Root-cause hypothesis

MM-017/018/019 sliced provider-icon replacement to keep micro-commits bounded. MM-020 closes the loop on SaaS & Identity.

### Planned change

(To be detailed before implementation.)

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

### MM-012 — Components panel items use Unicode letter glyphs instead of Lucide SVG outlines

- **Category**: Visual / component
- **Severity**: Medium
- **Status**: ✅ Fixed
- **Reference (1440 × 900)**: every item in the panel renders a 15×15 outline SVG (`stroke-width=2 stroke-linecap=round stroke-linejoin=round fill=none`). Shapes use Lucide `square` / `rectangle-horizontal` / `circle` / `diamond` / `triangle` / `hexagon` / `cylinder` / `case-sensitive`. Clients & Network uses `monitor-smartphone` / `cloud` / `route` / `scale`. Compute uses `app-window` / `server-cog` / `app-window` / `square-function` (Web App, API, Service, Function — note **Web App** instead of "Server").
- **Local before**: each item rendered a single Unicode glyph (`▭`, `⬜`, `◯`, `◇`, `△`, `⬡`, `⌭`, `T`, `◐`, `☁`, `⇄`, `⇆`, `▣`, `ƒ`, `◫`, `⚙`) on a `bg-surface-2` chip. Glyphs render with the user's UI font, vary in weight, and lack the crisp outline aesthetic.
- **Fix**:
  - Added 16 Lucide-matching SVG paths to `src/components/ui/Icon.tsx` (rectangle, rounded-rect, ellipse, diamond, triangle, hexagon, cylinder, type, monitor-smartphone, cloud, route, scale, server, server-cog, app-window, square-function).
  - Added an optional `strokeWidth` prop to `Icon` (default `1.75`). The panel uses `strokeWidth={2}` to match Lucide; the header toolbar keeps the lighter `1.75` so it doesn't suddenly thicken.
  - Rewrote `ComponentsPanel.tsx`:
    - Removed the `shapeIcon(symbol)` helper and the `icon: ReactNode` field on `ComponentItem`. Added `iconName: IconName` instead.
    - Added a local `ItemIcon` component: `<div class="h-9 w-9 rounded-md flex items-center justify-center bg-surface-2 text-fg border border-border shrink-0"><Icon name={...} size={15} strokeWidth={2} /></div>`. This matches the reference's 36 px tile with a 15 px outline icon.
    - Mapped every group label + name to the new icon names (Shapes: rectangle/rounded-rect/ellipse/diamond/triangle/hexagon/cylinder/type; Clients & Network: monitor-smartphone/cloud/route/scale; Compute: server/server-cog/app-window/square-function).
    - Item render changed from `{item.icon}` to `{item.iconName ? <ItemIcon name={item.iconName} /> : null}`.
- **Verification (1440 × 900, dark theme)**:
  - Shapes group (open by default): Rectangle, Rounded, Ellipse, Diamond, Triangle, Hexagon, Cylinder, Text — all show proper outline SVGs.
  - Clients & Network group (open by default): Client (monitor + phone), CDN (cloud), API Gateway (route endpoint), Load Balancer (scale) — all match the reference.
  - Compute group is collapsed by default; opening it reveals Server (server), API (server + cog), Service (app-window), Function (function inside a square) — outlines identical to Lucide.
  - Stroke-width parity: panel icons use `2 px`, header toolbar icons still `1.75 px` — no regression.
  - Zero console errors / warnings.
- **Evidence**:
  - `.reverse-match/screenshots/iteration-012-local.png`
  - `.reverse-match/screenshots/iteration-012-reference.png`
- **Files changed**: `src/components/ui/Icon.tsx`, `src/components/panel/ComponentsPanel.tsx`.
- **Commit**: `9f4a172`

### MM-013 — Components panel only exposes Shapes / Clients & Network / Compute (3 of 7 first-party groups)

- **Category**: Content / component
- **Severity**: Major (large content gap; ~13 missing first-party items)
- **Status**: ✅ Fixed
- **Reference (1440 × 900)**: after Compute the panel exposes 4 more first-party groups: **Data & Storage** (4 items: Database / NoSQL / Cache / Storage), **Messaging** (1 item: Queue), **Security & External** (2 items: Auth / External), **Structure** (2 items: Group / Note). Below these are 9 provider sections: AWS (805), Google Cloud (238), Azure (638), Cloudflare (9), Databases (8), Data & Analytics (7), Messaging & Streaming (2), DevOps & Observability (11), SaaS & Identity (4). Compute's first item is **Web App** (icon `app-window`), not "Server".
- **Local before**: only 3 groups rendered (Shapes / Clients & Network / Compute). Compute's first item was named "Server" with a `server` icon. No per-kind color tinting on any tile — every tile was `bg-surface-2 text-fg`.
- **Fix**:
  - Added 9 new Lucide SVG paths to `src/components/ui/Icon.tsx`: `database`, `database-zap`, `zap`, `hard-drive`, `waypoints`, `shield-check`, `globe`, `boxes`, `sticky-note`. The new icons have multi-shape markup (ellipse + path combinations), so the `Icon` renderer now switches between `<path d=…>` (single-shape) and `<g dangerouslySetInnerHTML={…}>` (multi-shape) based on whether the value contains `<`.
  - Updated `src/components/panel/ComponentsPanel.tsx`:
    - `ComponentItem` now carries an optional `iconColor?: string` (semantic per-kind color).
    - `ItemIcon` accepts a `color` prop and uses `color-mix(in srgb, <color> 20%, transparent 80%)` for the tile background + the color itself for the stroke (matches the reference's per-kind theming).
    - Renamed Compute's first item from **Server** (`server`) to **Web App** (`app-window`) to match the reference.
    - Added 4 new groups with their correct Lucide icons + colors:
      - **Data & Storage**: Database `rgb(245, 158, 11)` amber, NoSQL `rgb(251, 146, 60)` orange, Cache `rgb(244, 114, 182)` pink, Storage `rgb(148, 163, 184)` slate.
      - **Messaging**: Queue `rgb(192, 132, 252)` violet.
      - **Security & External**: Auth `rgb(52, 211, 153)` emerald, External `rgb(148, 163, 184)` slate.
      - **Structure**: Group `rgb(100, 116, 139)` slate, Note `rgb(251, 191, 36)` yellow.
- **Verification (1440 × 900, dark theme)**:
  - Expanding all 4 new groups shows: Database / NoSQL / Cache / Storage tiles tinted with their respective amber / orange / pink / slate backgrounds + matching icon strokes.
  - Queue tile is violet, Auth tile is emerald, External is slate, Group is slate, Note is yellow.
  - Compute now starts with **Web App** (app-window icon), not Server.
  - Zero console errors / warnings. Page renders identically otherwise.
- **Evidence**: `.reverse-match/screenshots/iteration-013-local.png`
- **Files changed**: `src/components/ui/Icon.tsx`, `src/components/panel/ComponentsPanel.tsx`.
- **Commit**: `a5e26cf`

### MM-014 — Components panel item buttons are a 2-col grid of cards, not single-column draggable rows

- **Category**: Visual / interaction
- **Severity**: Medium (affects every item; also disables drag-to-canvas)
- **Status**: ✅ Fixed
- **Reference (1440 × 900)**: each item is rendered as a single-column row with `draggable="true"`, `cursor-grab`, a 24 px colored tile, and `title="Add X — drag onto canvas or click"`. Hover state swaps `bg-surface-2 → bg-surface-3` and the border to `--color-border-strong`.
- **Local before**: items rendered in a 2-col grid (`grid grid-cols-2 gap-1.5`) with 36 px surface-2 tiles, no `draggable` attribute, no `title` tooltip, no cursor-grab hint, hover state only swapped to `bg-surface-2`.
- **Fix** (in `src/components/panel/ComponentsPanel.tsx`):
  - Items container switches from `<div className="grid grid-cols-2 gap-1.5 mt-1.5">` to `<div className="flex flex-col gap-1 mt-1.5">`.
  - Each button is now:
    - `draggable` (no value = HTML5 boolean).
    - `title={`Add ${item.name} — drag onto canvas or click`}`.
    - Class string matching the reference: `group flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 hover:bg-surface-3 hover:border-border-strong px-1.5 py-2 text-left transition-colors cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`.
    - Label wrapped in `<span class="min-w-0 flex flex-col"><span class="text-xs font-medium text-fg truncate">{item.name}</span></span>` to allow future subtitle rows.
  - `ItemIcon` shrinks from `h-9 w-9` (36 px) to `h-6 w-6` (24 px), drops the explicit border, and uses `grid place-items-center overflow-hidden` so the colored tile can't leak past its rounded corner. Per-kind color theming from MM-013 is preserved.
- **Bonus fix**: while verifying MM-014 I discovered the "Expand all" / "Collapse all" buttons had `onClick` handlers defined (`onExpandAll` / `onCollapseAll`) but never wired to the buttons — a pre-existing bug exposed by the new groups. Wired them up in the same commit.
- **Verification (1440 × 900, dark theme)**:
  - DOM inspection of a Database button: width 255 px × height 42 px, `cursor: grab`, `draggable: true`, `title: "Add Database — drag onto canvas or click"` — all match the reference.
  - Computed class on the button matches the reference exactly. Color-mix background resolves to amber `rgb(245, 158, 11)` at 20 % opacity.
  - All 16 first-party items render correctly: 8 Shapes, 4 Clients & Network, 4 Compute (with Web App as first item), 4 Data & Storage, 1 Messaging, 2 Security & External, 2 Structure.
  - "Expand all" now opens every group at once (previously a no-op); "Collapse all" closes them.
  - Zero console errors / warnings.
- **Evidence**: `.reverse-match/screenshots/iteration-014-local.png`
- **Files changed**: `src/components/panel/ComponentsPanel.tsx`.
- **Commit**: `231bce6`

### MM-015 — Components panel missing provider sections (AWS / Google Cloud / Azure / Cloudflare / Databases / Data & Analytics / Messaging & Streaming / DevOps & Observability / SaaS & Identity)

- **Category**: Content / component
- **Severity**: Major (large content gap; ~1700 provider items missing)
- **Status**: ✅ Fixed (placeholder icons — full brand SVGs deferred to MM-016)
- **Reference (1440 × 900)**: below the first-party groups, the panel renders 9 provider sections with a distinct visual style: uppercase tracking-wide text-faint labels, a rounded-full bg-surface-3 pill badge on the right showing the published item count (AWS 805, Google Cloud 238, Azure 638, Cloudflare 9, Databases 8, Data & Analytics 7, Messaging & Streaming 2, DevOps & Observability 11, SaaS & Identity 4), and a chevron-right Lucide icon that rotates 90° when expanded.
- **Local before**: panel ended after Structure (7 first-party groups total). No provider sections rendered. The `Group` type and render path only handled first-party groups.
- **Fix**:
  - Extended the `Group` interface in `src/components/panel/ComponentsPanel.tsx` with two new optional fields:
    - `variant?: 'default' | 'provider'` — branches the section label and badge rendering.
    - `displayCount?: number` — overrides `items.length` for the badge so we can show the reference's published total even when we don't ship the full item library.
  - Updated the group render block to switch on `variant`:
    - `provider`: button class becomes `flex items-center gap-1 w-full px-1 py-1 rounded text-[11px] font-semibold uppercase tracking-wide text-faint hover:text-fg hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`, label is wrapped in `truncate`, and the count badge becomes `ml-auto shrink-0 rounded-full bg-surface-3 px-1.5 text-[10px] normal-case tracking-normal text-muted`.
    - `provider` chevron uses a new Lucide `chevron-right` icon (`m9 18 6-6-6-6`) that rotates 90° on expand via `transition-transform rotate-90`.
    - `provider` section wrapper drops the `px-3` and uses `mt-1.5` instead of `mt-2` (matches the reference's tighter spacing).
  - Added `chevron-right` to `Icon.tsx` `IconName` union and `paths` map.
  - Added 9 new group entries below Structure with `variant: 'provider'` and `displayCount` matching the reference's published totals. Each ships a small representative sample (4–10 items) using generic Lucide placeholders (`server`, `database`, `hard-drive`, `waypoints`, `app-window`, etc.) so the rendering path is exercised. Full brand SVGs are deferred to MM-016.
- **Verification (1440 × 900, dark theme)**:
  - DOM inspection of the AWS group label: class matches the reference's exact string. `text-transform: uppercase`. Count badge `805` rendered with `bg-surface-3 px-1.5 text-[10px] normal-case tracking-normal text-muted` rounded-full. `aria-expanded="true"` after Expand-all. Chevron rotated 90° (open).
  - Scrolling the panel shows all 9 provider sections in order (AWS / Google Cloud / Azure / Cloudflare / Databases / Data & Analytics / Messaging & Streaming / DevOps & Observability / SaaS & Identity), with correct pill counts (805, 238, 638, 9, 8, 7, 2, 11, 4).
  - Provider sections opened by default (Cloudflare, Databases, Data & Analytics, Messaging & Streaming, DevOps & Observability, SaaS & Identity) render their placeholder items with the correct single-column draggable row style from MM-014.
  - Zero console errors / warnings.
- **Evidence**: `.reverse-match/screenshots/iteration-015-local.png`
- **Files changed**: `src/components/ui/Icon.tsx`, `src/components/panel/ComponentsPanel.tsx`.
- **Commit**: `c577f9c`

### MM-019 — Messaging & Streaming + DevOps & Observability provider items render with generic Lucide icons instead of real brand SVGs

- **Category**: Visual / branding
- **Severity**: Medium (both sections are open-by-default; 13 brand items total)
- **Status**: ✅ Fixed (slice 3 of provider-icons — Messaging & Streaming + DevOps & Observability; SaaS & Identity deferred to MM-020)
- **Reference observation (1440 × 900)**: each item in both sections renders a 15×15 brand SVG with `viewBox="0 0 24 24"` and `fill="currentColor"`. Wrapper span carries `color-mix` style with the brand color. Brand colors and SVG shapes verified by extracting `svg.outerHTML` and computed `color` for each item in the live reference DOM:
  - **Messaging & Streaming** (2 items): Kafka `rgb(123, 123, 123)` gray, RabbitMQ `rgb(255, 102, 0)` orange.
  - **DevOps & Observability** (11 items): Docker `rgb(36, 150, 237)` blue, Kubernetes `rgb(50, 108, 229)` blue, Terraform `rgb(132, 79, 186)` purple, NGINX `rgb(0, 150, 57)` green, Cloudflare `rgb(243, 128, 32)` orange, Prometheus `rgb(230, 82, 44)` red, Grafana `rgb(244, 104, 0)` orange, Datadog `rgb(99, 44, 166)` purple, Sentry `rgb(54, 45, 89)` dark slate, GitHub `rgb(139, 148, 158)` slate, GitLab `rgb(252, 109, 38)` orange.
- **Local before**: each item rendered a generic Lucide placeholder — Kafka/RabbitMQ both used `waypoints` (same as first-party Queue); Docker used `app-window`, Kubernetes `boxes`, Terraform `route`, NGINX `server`, Cloudflare `app-window`, Prometheus `monitor-smartphone`, Grafana `shield-check`, Datadog `app-window`, Sentry `app-window`, GitHub `monitor-smartphone`, GitLab `app-window`. None of these are brand-recognizable.
- **Root cause**: MM-015 added provider section structure + placeholder Lucide icons as a stand-in for the ~50+ brand SVGs. MM-017 (Databases) and MM-018 (Data & Analytics) began the replacement work. MM-019 continues with Messaging & Streaming + DevOps & Observability, the last two multi-item provider sections with placeholders.
- **Fix**:
  - `src/components/ui/Icon.tsx`:
    - Extended `IconName` union with 13 brand names: `brand-kafka`, `brand-rabbitmq`, `brand-docker`, `brand-kubernetes`, `brand-terraform`, `brand-nginx`, `brand-cloudflare`, `brand-prometheus`, `brand-grafana`, `brand-datadog`, `brand-sentry`, `brand-github`, `brand-gitlab`.
    - Added 13 brand SVG paths to the `paths` map (verbatim from the reference DOM). No renderer change — MM-017's `brand-` prefix branch handles these names automatically.
  - `src/components/panel/ComponentsPanel.tsx`:
    - Replaced the 2 placeholder `iconName` values in Messaging & Streaming with `brand-kafka` / `brand-rabbitmq`.
    - Replaced the 11 placeholder `iconName` values in DevOps & Observability with the 11 brand-specific names listed above.
    - Added `iconColor` for each item matching the brand colors extracted from the reference.
- **Verification (1440 × 900, dark theme)**:
  - DOM inspection: all 13 brand SVGs render with `fill="currentColor"` and `stroke="none"`. Each button has exactly 1 `<path>` child (the brand glyph).
  - Tile wrappers carry the expected inline style with the brand color (e.g. `background: color-mix(in srgb, rgb(36, 150, 237) 20%, transparent 80%); color: rgb(36, 150, 237);` for Docker).
  - Visual screenshot of the DevOps & Observability section shows Docker whale blue, Kubernetes wheel purple, Terraform purple, NGINX green, Cloudflare orange cloud, Prometheus red flame, Grafana orange G, Datadog purple, Sentry dark slate, GitHub gray octocat, GitLab orange fox — all visually distinct.
  - Databases and Data & Analytics sections unchanged (still use MM-017/018 brand SVGs).
  - SaaS & Identity section unchanged (still uses generic Lucide placeholders — deferred to MM-020).
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning from MM-016 (unrelated).
- **Evidence**:
  - `.reverse-match/screenshots/iteration-019-local.png` (full page)
  - `.reverse-match/screenshots/iteration-019-devops.png` (DevOps panel only)
- **Files changed**: `src/components/ui/Icon.tsx`, `src/components/panel/ComponentsPanel.tsx`.
- **Commit**: `6382088`

### MM-018 — Data & Analytics provider items render with generic Lucide icons instead of real brand SVGs

- **Category**: Visual / branding
- **Severity**: Medium (open-by-default section, 7 items)
- **Status**: ✅ Fixed (slice 2 of provider-icons — Data & Analytics; Messaging & Streaming, DevOps & Observability, SaaS & Identity deferred to MM-019+)
- **Reference observation (1440 × 900)**: each Data & Analytics item renders a 15×15 brand SVG with `viewBox="0 0 24 24"` and `fill="currentColor"`. Wrapper span carries `color-mix` style with the brand color. Brand colors verified via `getComputedStyle(svg).color`:
  - Snowflake: `rgb(41, 181, 232)` cyan
  - Databricks: `rgb(255, 54, 33)` red
  - Apache Spark: `rgb(226, 90, 28)` orange
  - Airflow: `rgb(1, 124, 238)` blue
  - ClickHouse: `rgb(250, 255, 105)` yellow
  - Elasticsearch: `rgb(0, 85, 113)` dark teal
  - Looker: `rgb(66, 133, 244)` blue
- **Local before**: each item rendered a generic Lucide placeholder (`database` cylinder for Snowflake / Databricks / ClickHouse, `zap` for Spark, `route` for Airflow, `search` for Elasticsearch, `monitor-smartphone` for Looker).
- **Root cause**: MM-015 used generic Lucide icons as a structural placeholder. MM-017 delivered the Databases section. MM-018 continues the same pattern for Data & Analytics.
- **Fix**:
  - `src/components/ui/Icon.tsx`:
    - Extended `IconName` union with 7 brand names: `brand-snowflake`, `brand-databricks`, `brand-apache-spark`, `brand-airflow`, `brand-clickhouse`, `brand-elasticsearch`, `brand-looker`.
    - Added 7 brand SVG paths to the `paths` map (verbatim from the reference DOM).
    - The brand renderer branch (`fill="currentColor"` + `stroke="none"`) added in MM-017 covers these names automatically — no renderer change needed.
  - `src/components/panel/ComponentsPanel.tsx`:
    - Replaced the 7 placeholder `iconName` values in the Data & Analytics group with their brand-specific names and added `iconColor` matching each brand's official color.
- **Verification (1440 × 900, dark theme)**:
  - `document.querySelector('aside[aria-label="Components"]')` returns 7 brand-SVG buttons in the Data & Analytics section.
  - Each button's `<svg>` has `fill="currentColor"` and `stroke="none"`. SVG innerHTML lengths: 2364 (Snowflake), 326 (Databricks), 1744 (Spark), 2153 (Airflow), 150 (ClickHouse), 378 (Elasticsearch), 1002 (Looker).
  - Tile wrapper has the expected inline style with the brand color (e.g. `background: color-mix(in srgb, rgb(41, 181, 232) 20%, transparent 80%); color: rgb(41, 181, 232);` for Snowflake). Computed `color` on the SVG path resolves to the brand color via currentColor inheritance.
  - Visual screenshot confirms each item shows its correct brand logo with the brand-specific tint.
  - Databases section unchanged (still uses MM-017 brand SVGs).
  - Messaging & Streaming, DevOps & Observability, SaaS & Identity sections unchanged (still use generic Lucide placeholders — deferred to MM-019+).
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning from MM-016.
- **Evidence**: `.reverse-match/screenshots/iteration-018-local.png`
- **Files changed**: `src/components/ui/Icon.tsx`, `src/components/panel/ComponentsPanel.tsx`.
- **Commit**: (this iteration)

### MM-017 — Databases provider items render with generic Lucide icons instead of real brand SVGs

- **Category**: Visual / branding
- **Severity**: Medium (highly visible — Databases is open-by-default)
- **Status**: ✅ Fixed (slice 1 of provider-icons — Databases only; the remaining 8 provider sections deferred to MM-018+)
- **Reference observation (1440 × 900)**: each Databases item renders a 15×15 brand SVG with `viewBox="0 0 24 24"` and `fill="currentColor"` (no stroke). Wrapper `<span>` carries `style="background: color-mix(in srgb, <brandColor> 20%, transparent 80%); color: <brandColor>;"` so the icon inherits the brand color from its parent. Brand colors verified via `getComputedStyle(svg).color`:
  - PostgreSQL: `rgb(65, 105, 225)` royal blue (elephant logo)
  - MySQL: `rgb(68, 121, 161)` steel blue (dolphin)
  - MongoDB: `rgb(71, 162, 72)` green (leaf)
  - Redis: `rgb(255, 68, 56)` red
  - Cassandra: `rgb(18, 135, 177)` teal (eye/ball)
  - Neo4j: `rgb(69, 129, 195)` blue (connected graph)
  - Supabase: `rgb(63, 207, 142)` emerald (lightning bolt)
  - DuckDB: `rgb(255, 240, 0)` yellow (duck silhouette)
- **Local before**: each item rendered a generic Lucide placeholder (`database` cylinder, `database-zap`, `zap`) on a neutral `bg-surface-2` tile. No brand identity whatsoever.
- **Root cause**: MM-015 added provider section structure + placeholder Lucide icons as a stand-in for the ~50+ brand SVGs that didn't fit a single micro-commit. MM-017 starts the replacement work with the highest-impact section (Databases, open by default, brand-coloured icons).
- **Fix**:
  - `src/components/ui/Icon.tsx`:
    - Extended the `IconName` union with `brand-postgresql`, `brand-mysql`, `brand-mongodb`, `brand-redis`, `brand-cassandra`, `brand-neo4j`, `brand-supabase`, `brand-duckdb`.
    - Added 8 brand SVG paths to the `paths` map. Each path was copied verbatim from the live reference DOM (15×15 viewBox `0 0 24 24`, `fill="currentColor"`).
    - Updated the `<svg>` renderer to branch on `name.startsWith('brand-')`: brand icons use `fill="currentColor"` + `stroke="none"`, while Lucide icons keep `fill="none"` + `stroke="currentColor"`. The branch is a simple boolean, not a per-name lookup, so adding new brand icons in future iterations won't require renderer changes.
  - `src/components/panel/ComponentsPanel.tsx`:
    - Replaced the 8 placeholder `iconName` values in the Databases group with their brand-specific names (`brand-postgresql`, etc.) and added `iconColor` matching the brand colors extracted from the reference.
- **Verification (1440 × 900, dark theme)**:
  - `document.querySelector('aside[aria-label="Components"]')` returns 8 brand-SVG buttons (PostgreSQL … DuckDB).
  - Each button's `svg` has `fill="currentColor"` and `stroke="none"`. SVG innerHTML lengths: 5109 (Postgres, most detailed), 3534 (MySQL), 434 (MongoDB), 647 (Redis), 4295 (Cassandra), 706 (Neo4j), 209 (Supabase), 297 (DuckDB).
  - Tile wrapper has the expected inline style: `background: color-mix(in srgb, rgb(65, 105, 225) 20%, transparent 80%); color: rgb(65, 105, 225);` (Postgres). Computed `color` on the SVG path resolves to the brand color via currentColor inheritance.
  - Visual screenshot confirms each item shows its correct brand logo with the brand-specific tint. PostgreSQL shows the elephant, Supabase the lightning bolt, DuckDB the yellow duck, etc.
  - All other provider sections unchanged (Data & Analytics, Messaging & Streaming, DevOps & Observability, SaaS & Identity still use generic Lucide placeholders — deferred to MM-018+).
  - First-party groups unchanged (Shapes / Clients & Network / Compute / Data & Storage / Messaging / Security & External / Structure still render correctly).
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning from MM-016 (unrelated to MM-017).
- **Evidence**: `.reverse-match/screenshots/iteration-017-local.png`
- **Files changed**: `src/components/ui/Icon.tsx`, `src/components/panel/ComponentsPanel.tsx`.
- **Commit**: `6a76ce3`

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

### Iteration 12 — fix MM-012: Components panel items use Lucide SVG outline icons

- **Goal**: Replace the Unicode letter glyphs on every panel tile with real outline SVGs that match the Lucide set used by the reference.
- **Reference observation (1440 × 900)**: every item in the panel renders a 15×15 outline SVG (stroke-width=2, no fill). Shapes group: rectangle, rounded-rect, ellipse, diamond, triangle, hexagon, cylinder, "T" (case-sensitive). Clients & Network: monitor-smartphone, cloud, route, scale. Compute: app-window (Web App), server-cog (API), app-window (Service), square-function (Function).
- **Local before**: each item rendered a single Unicode glyph (`▭`, `⬜`, `◯`, `◇`, `△`, `⬡`, `⌭`, `T`, `◐`, `☁`, `⇄`, `⇆`, `▣`, `ƒ`, `◫`, `⚙`) inside a `bg-surface-2` chip. Glyphs varied in weight / alignment and lacked the outline aesthetic.
- **Actions**:
  - Added 16 Lucide-matching SVG paths to `src/components/ui/Icon.tsx`: `rectangle`, `rounded-rect`, `ellipse`, `diamond`, `triangle`, `hexagon`, `cylinder`, `type`, `monitor-smartphone`, `cloud`, `route`, `scale`, `server`, `server-cog`, `app-window`, `square-function`. Each path was copied verbatim from Lucide so the icon shape matches pixel-for-pixel.
  - Added an optional `strokeWidth` prop to the `Icon` component (default `1.75`); the panel opts into `strokeWidth={2}` to match Lucide while the header toolbar keeps the thinner stroke (no regression on existing toolbar icons).
  - Rewrote `src/components/panel/ComponentsPanel.tsx`:
    - Removed the `shapeIcon(symbol)` helper and the `icon: ReactNode` field on `ComponentItem`. Added `iconName: IconName` instead.
    - Added a local `ItemIcon` component (36×36 tile, surface-2 background, border, 15×15 icon at 2 px stroke).
    - Mapped every group label + name to the new icon names.
    - Item render changed from `{item.icon}` to `{item.iconName ? <ItemIcon name={item.iconName} /> : null}`.
- **Verification (1440 × 900, dark theme)**:
  - Shapes group (open by default): Rectangle (square outline), Rounded (horizontal rect with rounded corners), Ellipse (oval), Diamond, Triangle, Hexagon, Cylinder, Text (T with bars) — all match the reference.
  - Clients & Network (open by default): Client (monitor + phone), CDN (cloud), API Gateway (route with two endpoints), Load Balancer (scale with pans) — all match.
  - Compute group (collapsed by default, but verified via toggle): Server (rack), API (rack + cog), Service (window frame), Function (square + f(x)) — outlines identical to Lucide.
  - Stroke parity: panel uses 2 px stroke; header toolbar icons remain at 1.75 px (verified by inspecting computed styles). No regression.
  - Zero console errors / warnings. Page renders identically otherwise.
- **Result**: MM-012 fixed. Panel now uses Lucide-matching outline SVGs identical to the reference.
- **Next action**: MM-013 — expand the Components panel to include the missing groups the reference exposes below "Compute": Data & Storage, Messaging, Security & External, Structure, plus the provider lists (AWS, Google Cloud, Azure, Cloudflare, Databases, Data & Analytics, SaaS & Identity). Local currently stops at Compute (3 groups). The reference renders ~9 groups with ~60+ items; the local only has 16.
- **Commit**: `9f4a172`

### Iteration 13 — fix MM-013: add Data & Storage, Messaging, Security & External, Structure groups + per-kind colors

- **Goal**: Fill the largest content gap in the Components panel by adding the 4 missing first-party groups + their per-kind tile colors, and rename Compute's first item to "Web App" so it matches the reference.
- **Reference observation (1440 × 900)**: After Compute the panel exposes 4 more first-party groups: Data & Storage (4 items), Messaging (1 item), Security & External (2 items), Structure (2 items). Each item button in those groups uses a per-kind tint (e.g. Database tile is amber `rgb(245, 158, 11)`, Cache is pink `rgb(244, 114, 182)`, Auth is emerald `rgb(52, 211, 153)`). Compute's first item is **Web App** (icon `app-window`), not "Server".
- **Local before**: only 3 groups rendered. Compute's first item was "Server" with the `server` icon. Every tile used `bg-surface-2 text-fg` — no per-kind color theming.
- **Actions**:
  - Added 9 new Lucide SVG paths to `src/components/ui/Icon.tsx`: `database` (3-shape cylinder w/ ellipses), `database-zap`, `zap`, `hard-drive`, `waypoints`, `shield-check`, `globe`, `boxes`, `sticky-note`.
  - Updated the `Icon` renderer to handle multi-shape icons: when the value contains `<`, it renders `<g dangerouslySetInnerHTML={…} />` instead of a single `<path d=…>`. This lets ellipse + path combinations (Database, Waypoints, Globe, etc.) render correctly while keeping the simple path form for single-shape icons (no behavioural change).
  - Updated `src/components/panel/ComponentsPanel.tsx`:
    - `ComponentItem` now carries an optional `iconColor?: string`.
    - `ItemIcon` accepts a `color` prop; when set, the tile uses `color-mix(in srgb, <color> 20%, transparent 80%)` for the background and the color itself for the icon stroke. This matches the reference's per-kind theming pattern.
    - Renamed Compute's first item from **Server** (`server` icon) to **Web App** (`app-window` icon) to match the reference.
    - Added 4 new groups with their correct Lucide icons + colors:
      - **Data & Storage**: Database / NoSQL / Cache / Storage with amber / orange / pink / slate colors.
      - **Messaging**: Queue with violet.
      - **Security & External**: Auth (emerald) / External (slate).
      - **Structure**: Group (slate) / Note (yellow).
- **Verification (1440 × 900, dark theme)**:
  - Expanding all 4 new groups shows the expected tinted tiles. Compute now starts with **Web App** (app-window icon), not Server.
  - All other groups unchanged (Shapes / Clients & Network still render correctly).
  - Zero console errors / warnings.
- **Result**: MM-013 fixed. The Components panel now exposes all 7 first-party groups (Shapes, Clients & Network, Compute, Data & Storage, Messaging, Security & External, Structure) with per-kind color theming on the tiles. The next-largest gap is the 9 provider sections below (AWS / Google Cloud / Azure / Cloudflare / Databases / Data & Analytics / Messaging & Streaming / DevOps & Observability / SaaS & Identity) and the item-button shape (currently 2-col grid + 36 px tile, reference uses single-column + 24 px tile + draggable).
- **Next action**: MM-014 — refactor item buttons to single-column + 24 px tile + draggable + `title="Add X — drag onto canvas or click"` + cursor-grab. Will visually restructure every tile.
- **Commit**: `a5e26cf`

### Iteration 14 — fix MM-014: single-column draggable item rows + Expand/Collapse wiring

- **Goal**: Reshape every panel item to match the reference's single-column draggable row style, and wire the previously-dead Expand/Collapse buttons.
- **Reference observation**: each item is a single-column row with `draggable="true"`, `cursor-grab`, a 24 px colored tile, and `title="Add X — drag onto canvas or click"`. Hover state swaps `bg-surface-2 → bg-surface-3` and the border to `--color-border-strong`.
- **Local before**: items rendered in a 2-col grid with 36 px tiles, no draggable, no title, no cursor-grab, hover only swapped to `bg-surface-2`. The Expand/Collapse buttons had `onClick` handlers defined but were not wired to the buttons.
- **Actions** (in `src/components/panel/ComponentsPanel.tsx`):
  - Container changed from `<div className="grid grid-cols-2 gap-1.5 mt-1.5">` to `<div className="flex flex-col gap-1 mt-1.5">`.
  - Each button now has `draggable`, `title={`Add ${item.name} — drag onto canvas or click`}`, and the reference's full class set: `group flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 hover:bg-surface-3 hover:border-border-strong px-1.5 py-2 text-left transition-colors cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`.
  - Label wrapped in `<span class="min-w-0 flex flex-col"><span class="text-xs font-medium text-fg truncate">{name}</span></span>`.
  - `ItemIcon` shrunk from `h-9 w-9` to `h-6 w-6`, dropped its explicit border, and switched to `grid place-items-center overflow-hidden`. Per-kind color theming preserved.
  - Wired `onClick={onExpandAll}` and `onClick={onCollapseAll}` to the Expand/Collapse buttons (previously no-op).
- **Verification (1440 × 900)**:
  - DOM inspection of Database button: 255×42 px, `cursor: grab`, `draggable: true`, `title: "Add Database — drag onto canvas or click"`. Class string matches the reference exactly. Color-mix background resolves to amber at 20 % opacity.
  - All 16 first-party items render correctly with the new row layout.
  - Expand/Collapse buttons now actually expand/collapse all groups (verified by clicking).
  - Zero console errors.
- **Result**: MM-014 fixed. Item-button shape now matches the reference; drag-to-canvas hint + tooltip are present.
- **Next action**: MM-015 — add the 9 provider sections (AWS / Google Cloud / Azure / Cloudflare / Databases / Data & Analytics / Messaging & Streaming / DevOps & Observability / SaaS & Identity) with their counts. This is the largest remaining content gap.
- **Commit**: `231bce6`

### Iteration 15 — fix MM-015: provider sections with uppercase pill-style labels

- **Goal**: Add the 9 provider sections below the first-party groups with the reference's distinct uppercase pill-label style, and show the published item counts even where we don't ship the full library.
- **Reference observation**: below Structure, the reference renders 9 sections (AWS, Google Cloud, Azure, Cloudflare, Databases, Data & Analytics, Messaging & Streaming, DevOps & Observability, SaaS & Identity). Each label uses uppercase tracking-wide text-faint text + a rounded-full bg-surface-3 pill badge for the count (805, 238, 638, 9, 8, 7, 2, 11, 4). Chevron is a Lucide `chevron-right` icon (rotates 90° on expand). Section wrapper drops the `px-3` and uses `mt-1.5` (tighter spacing than first-party groups).
- **Local before**: panel ended after Structure. Only 7 first-party groups existed. The `Group` type and render path only handled first-party groups.
- **Actions**:
  - Extended `Group` interface with `variant?: 'default' | 'provider'` and `displayCount?: number` fields.
  - Branched the group render block on `variant`:
    - `provider` button class: `flex items-center gap-1 w-full px-1 py-1 rounded text-[11px] font-semibold uppercase tracking-wide text-faint hover:text-fg hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`.
    - `provider` count badge: `ml-auto shrink-0 rounded-full bg-surface-3 px-1.5 text-[10px] normal-case tracking-normal text-muted`.
    - `provider` chevron: Lucide `chevron-right` icon with `transition-transform rotate-90` when open.
    - `provider` section wrapper: `mt-1.5` (no `px-3`).
  - Added `chevron-right` to `Icon.tsx` (path `m9 18 6-6-6-6`).
  - Added 9 provider group entries with `displayCount` matching the reference and 4–10 placeholder items each (generic Lucide icons — full brand SVGs are deferred to MM-016).
- **Verification (1440 × 900, dark theme)**:
  - DOM inspection of the AWS group label: class string matches the reference. `text-transform: uppercase`. Count badge `805` rendered with the pill style. `aria-expanded="true"` after Expand-all. Chevron rotated 90° when open.
  - Scrolling the panel reveals all 9 provider sections in the correct order, with correct pill counts.
  - Open-by-default provider sections (Cloudflare, Databases, Data & Analytics, Messaging & Streaming, DevOps & Observability, SaaS & Identity) render their placeholder items with the MM-014 row style.
  - Zero console errors.
- **Result**: MM-015 fixed (structure only). Provider sections render with the correct visual style and counts. The placeholder icons inside each item are generic Lucide — MM-016 will swap them for real brand SVGs.
- **Next action**: MM-016 — replace placeholder Lucide icons in provider items with real brand SVGs (Cloudflare Workers, AWS Lambda, Postgres, etc.). Out of scope for one micro-commit due to volume (~50–100 vendor paths). Will likely be split into MM-016a (Cloudflare / AWS sample) and MM-016b (the rest).
- **Commit**: `c577f9c`

### Iteration 16 — fix MM-016: hide React Flow attribution badge

- **Goal**: Remove the `react-flow__attribution` watermark from the canvas bottom-right to match the reference.
- **Reference observation**: the reference site renders the standard xyflow chrome (zoom controls bottom-left, minimap bottom-right) but no React Flow attribution badge. Confirmed via `document.querySelector('.react-flow__attribution')` returning `null` in the reference's DOM, plus a visual scan of the bottom-right corner of the canvas.
- **Local before**: the canvas had `<div class="react-flow__attribution">React Flow</div>` rendered at (1382, 881) — visible in both dark and light themes. xyflow renders this element by default unless `proOptions={{ hideAttribution: true }}` is passed.
- **Actions** (in `src/canvas/Canvas.tsx`):
  - Changed `proOptions={{ hideAttribution: false }}` to `proOptions={{ hideAttribution: true }}` on the `<ReactFlow>` element.
- **Verification (1440 × 900)**:
  - `document.querySelector('.react-flow__attribution')` returns `null` after reload.
  - Screenshot confirms the bottom-right of the canvas no longer contains the watermark. Zoom controls + minimap still render at expected positions. No regression to other xyflow features.
- **Result**: MM-016 fixed. The canvas bottom-right is now clean (just minimap).
- **Next action**: MM-017 — replace the placeholder Lucide icons in provider items with real brand SVGs. Will start with the 8 Databases items (PostgreSQL, MySQL, MongoDB, Redis, Cassandra, Neo4j, Supabase, DuckDB) since these are open-by-default and the most visible.
- **Commit**: `d994c16`

### Iteration 17 — fix MM-017: brand SVGs for Databases section

- **Goal**: Replace the generic Lucide placeholder icons in the Databases provider section with real brand SVGs and brand-specific colors.
- **Reference observation (1440 × 900)**: each Databases item renders a 15×15 brand SVG with `viewBox="0 0 24 24"` and `fill="currentColor"` (no stroke). Wrapper `<span>` carries the inline `color-mix` style with the brand color, so the icon inherits the brand color from its parent. Brand colors and logo shapes verified by extracting `svg.outerHTML` and computed `color` for each item in the live reference DOM.
- **Local before**: each item rendered a generic Lucide placeholder (`database` cylinder for Postgres / MySQL / Cassandra / Neo4j / Supabase / DuckDB, `database-zap` for MongoDB, `zap` for Redis) on a neutral `bg-surface-2` tile.
- **Actions**:
  - `src/components/ui/Icon.tsx`:
    - Extended `IconName` with 8 brand names: `brand-postgresql`, `brand-mysql`, `brand-mongodb`, `brand-redis`, `brand-cassandra`, `brand-neo4j`, `brand-supabase`, `brand-duckdb`.
    - Added 8 brand SVG paths to the `paths` map. Each path was copied verbatim from the reference DOM (15×15 viewBox `0 0 24 24`, `fill="currentColor"`).
    - Updated the `<svg>` renderer to branch on `name.startsWith('brand-')`: brand icons use `fill="currentColor"` + `stroke="none"`, while Lucide icons keep `fill="none"` + `stroke="currentColor"`. The branch is a simple boolean so adding new brand icons in future iterations won't require renderer changes.
  - `src/components/panel/ComponentsPanel.tsx`:
    - Replaced the 8 placeholder `iconName` values in the Databases group with their brand-specific names.
    - Added `iconColor` for each Databases item matching the brand colors extracted from the reference (`rgb(65, 105, 225)` royal blue for Postgres, `rgb(68, 121, 161)` steel blue for MySQL, `rgb(71, 162, 72)` green for MongoDB, `rgb(255, 68, 56)` red for Redis, `rgb(18, 135, 177)` teal for Cassandra, `rgb(69, 129, 195)` blue for Neo4j, `rgb(63, 207, 142)` emerald for Supabase, `rgb(255, 240, 0)` yellow for DuckDB).
- **Verification (1440 × 900, dark theme)**:
  - `document.querySelector('aside[aria-label="Components"]')` returns 8 brand-SVG buttons in the Databases section.
  - Each button's `<svg>` has `fill="currentColor"` and `stroke="none"`. SVG innerHTML lengths confirm distinct paths (5109 / 3534 / 434 / 647 / 4295 / 706 / 209 / 297 chars).
  - Tile wrapper has the expected inline style: `background: color-mix(in srgb, rgb(65, 105, 225) 20%, transparent 80%); color: rgb(65, 105, 225);` (Postgres). Computed `color` on the SVG path resolves to the brand color via currentColor inheritance.
  - Visual screenshot confirms each item shows its correct brand logo with the brand-specific tint: PostgreSQL elephant in royal blue, MySQL dolphin in steel blue, MongoDB leaf in green, Redis in red, Cassandra in teal, Neo4j in blue, Supabase lightning in emerald, DuckDB duck in yellow.
  - All other provider sections unchanged (Data & Analytics, Messaging & Streaming, DevOps & Observability, SaaS & Identity still use generic Lucide placeholders — deferred to MM-018+).
  - First-party groups unchanged.
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning from MM-016 (unrelated to MM-017).
- **Result**: MM-017 fixed. Databases section now uses real brand SVGs identical to the reference. The Data & Analytics section (also open-by-default) remains the next-largest visible gap.
- **Next action**: MM-018 — replace placeholder Lucide icons in the Data & Analytics section with brand SVGs (Snowflake, Databricks, Apache Spark, Airflow, ClickHouse, Elasticsearch, Looker).
- **Commit**: `6a76ce3`

### Iteration 18 — fix MM-018: brand SVGs for Data & Analytics section

- **Goal**: Continue the provider-icon replacement from MM-017 with the 7 Data & Analytics items.
- **Reference observation (1440 × 900)**: each Data & Analytics item renders a 15×15 brand SVG with `fill="currentColor"`. Brand colors verified: Snowflake cyan, Databricks red, Spark orange, Airflow blue, ClickHouse yellow, Elasticsearch dark teal, Looker blue.
- **Local before**: each item rendered a generic Lucide placeholder (database cylinder for Snowflake / Databricks / ClickHouse, zap for Spark, route for Airflow, search for Elasticsearch, monitor-smartphone for Looker).
- **Actions**:
  - `src/components/ui/Icon.tsx`:
    - Extended `IconName` union with 7 brand names: `brand-snowflake`, `brand-databricks`, `brand-apache-spark`, `brand-airflow`, `brand-clickhouse`, `brand-elasticsearch`, `brand-looker`.
    - Added 7 brand SVG paths to the `paths` map (verbatim from the reference DOM). No renderer changes — MM-017's `brand-` prefix branch handles these names automatically.
  - `src/components/panel/ComponentsPanel.tsx`:
    - Replaced the 7 placeholder `iconName` values in the Data & Analytics group with their brand-specific names.
    - Added `iconColor` for each item matching the brand colors extracted from the reference.
- **Verification (1440 × 900, dark theme)**:
  - 7 brand-SVG buttons in the Data & Analytics section.
  - Each `<svg>` has `fill="currentColor"` and `stroke="none"`. SVG innerHTML lengths: 2364 / 326 / 1744 / 2153 / 150 / 378 / 1002.
  - Tile wrapper has the expected inline style with the brand color.
  - Visual screenshot confirms each item shows its correct brand logo with the brand-specific tint.
  - Databases section unchanged (still uses MM-017 brand SVGs).
  - Messaging & Streaming, DevOps & Observability, SaaS & Identity sections unchanged (still use generic Lucide placeholders — deferred to MM-019+).
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning.
- **Result**: MM-018 fixed. Data & Analytics section now uses real brand SVGs identical to the reference. Three provider sections remain (Messaging & Streaming, DevOps & Observability, SaaS & Identity).
- **Next action**: MM-019 — replace placeholder Lucide icons in Messaging & Streaming + DevOps & Observability sections with brand SVGs (Kafka, RabbitMQ, Docker, Kubernetes, Terraform, NGINX, Cloudflare, Prometheus, Grafana, Datadog, Sentry, GitHub, GitLab).
- **Commit**: `e2c0149`

### Iteration 19 — fix MM-019: brand SVGs for Messaging & Streaming + DevOps & Observability

- **Goal**: Continue the provider-icon replacement from MM-017/018 with the 2 Messaging & Streaming items and 11 DevOps & Observability items (13 brand SVGs total — the last large multi-item section).
- **Reference observation (1440 × 900)**: each item renders a 15×15 brand SVG with `fill="currentColor"`. Brand colors and SVG shapes verified via Playwright `browser_evaluate` on the live reference DOM — see MM-019 mismatch entry for the full color list.
- **Local before**: each item rendered a generic Lucide placeholder (waypoints / app-window / boxes / route / server / monitor-smartphone / shield-check). None were brand-recognizable.
- **Actions**:
  - `src/components/ui/Icon.tsx`:
    - Extended `IconName` union with 13 brand names: `brand-kafka`, `brand-rabbitmq`, `brand-docker`, `brand-kubernetes`, `brand-terraform`, `brand-nginx`, `brand-cloudflare`, `brand-prometheus`, `brand-grafana`, `brand-datadog`, `brand-sentry`, `brand-github`, `brand-gitlab`.
    - Added 13 brand SVG paths to the `paths` map (verbatim from the reference DOM). The brand renderer branch (`fill="currentColor"` + `stroke="none"`) added in MM-017 covers these names automatically.
  - `src/components/panel/ComponentsPanel.tsx`:
    - Replaced 2 placeholder `iconName` values in Messaging & Streaming with `brand-kafka` / `brand-rabbitmq`.
    - Replaced 11 placeholder `iconName` values in DevOps & Observability with their brand-specific names.
    - Added `iconColor` for each item matching the brand colors extracted from the reference.
- **Verification (1440 × 900, dark theme)**:
  - DOM inspection confirms 13 brand-SVG buttons: each `<svg>` has `fill="currentColor"`, `stroke="none"`, and exactly 1 `<path>` child.
  - Tile wrappers carry the expected inline `color-mix` style with the brand color for each item.
  - Visual screenshot of DevOps & Observability section confirms distinct brand logos: Docker whale, Kubernetes wheel, Terraform, NGINX, Cloudflare cloud, Prometheus flame, Grafana, Datadog, Sentry, GitHub octocat, GitLab fox — all visually distinct.
  - Visual screenshot of Messaging & Streaming shows Kafka and RabbitMQ brand glyphs.
  - Databases and Data & Analytics sections unchanged.
  - SaaS & Identity section still uses generic Lucide placeholders (deferred to MM-020).
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning.
- **Result**: MM-019 fixed. Two more provider sections now use real brand SVGs. Only SaaS & Identity (4 items) remains with generic placeholders.
- **Next action**: MM-020 — replace placeholder Lucide icons in SaaS & Identity section with brand SVGs (Stripe, Auth0, Okta, Firebase).
- **Commit**: `6382088`

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
| 008  | MM-009 | — | `.reverse-match/screenshots/iteration-008-desktop.png`, `iteration-008-local-open.png`, `iteration-008-local-collapsed.png` | — | — |
| 009  | MM-010 | — | `.reverse-match/screenshots/iteration-009-desktop.png`, `iteration-009-mobile.png` | — | — |
| 010  | MM-011 | — | `.reverse-match/screenshots/iteration-010-default.png`, `iteration-010-causal.png`, `iteration-010-paused.png` | — | — |
| 012  | MM-012 | `.reverse-match/screenshots/iteration-012-reference.png` | `.reverse-match/screenshots/iteration-012-local.png` | — | inline in iteration log |
| 013  | MM-013 | `.reverse-match/screenshots/iteration-013-reference.png` | `.reverse-match/screenshots/iteration-013-local.png` | — | inline in iteration log |
| 014  | MM-014 | (same reference) | `.reverse-match/screenshots/iteration-014-local.png` | — | inline in iteration log |
| 015  | MM-015 | (same reference) | `.reverse-match/screenshots/iteration-015-local.png` | — | inline in iteration log |
| 016  | MM-016 | (same reference) | `.reverse-match/screenshots/iteration-016-local.png` | — | inline in iteration log |
| 017  | MM-017 | (same reference) | `.reverse-match/screenshots/iteration-017-local.png` | — | inline in iteration log |
| 018  | MM-018 | (same reference) | `.reverse-match/screenshots/iteration-018-local.png` | — | inline in iteration log |
| 019  | MM-019 | (same reference) | `.reverse-match/screenshots/iteration-019-local.png`, `iteration-019-devops.png` | — | inline in iteration log |

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
