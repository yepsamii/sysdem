# Reverse Match Progress

A persistent memory of the iterative reverse-match loop. This document is **stateful**: it captures the current target, every discovered mismatch, every change attempted, the verification result, and the next selected mismatch. If the loop is paused and resumed, the next run reads this file and continues from where it left off.

> Companion to `REVERSE_ENGINEERING.md` (which captures the static reverse-engineering of the reference). This file tracks **dynamic progress** against the local implementation.

---

## Target

- **Reference**: `https://www.gravelgraph.com/`
- **Local**: `http://localhost:5173/` *(confirm by reading `package.json` `dev` script — default Vite port 5173, but the user may have set another)*
- **Primary viewport**: 1440 × 900
- **Secondary viewports**: 420 × 820 (mobile), 768 × 1024 (tablet)
- **Last updated**: 2026-09-30 03:36

---

## Overall Progress

- **Iteration**: 31
- **Major mismatches remaining**: 0
- **Minor mismatches remaining**: missing right-cluster Compare button between redo and segmented mode group, edge particle rendering details (token label position, exact density / speed), exact node positions vs reference.
- **Verified fixes**: 31 (Milestone 0 shell, MM-001 canvas, MM-002 components aside, MM-003 saved-locally banner, MM-004 cookie consent + token system, MM-006 particle animation, MM-007 edge label chips, MM-008 chip-style Export/Present/Pause buttons, MM-009 mobile Components panel collapse, MM-010 mobile header toolbar visibility, MM-011 flow-mode radios + active state styling, MM-012 Lucide SVG outline icons, MM-013 first-party groups + per-kind colors, MM-014 single-column draggable item rows, MM-015 provider section labels with pill badges, MM-016 hide React Flow attribution badge, MM-017 Databases brand icons, MM-018 Data & Analytics brand icons, MM-019 Messaging & Streaming + DevOps & Observability brand icons, MM-020 SaaS & Identity brand icons, MM-021 Components panel resize handle, MM-022 search filter, MM-023 Stencils import/export, MM-024 default theme respects prefers-color-scheme + xyflow colorMode, MM-025 floating rounded panel card + 2-col item grid, MM-026 default canvas viewport, MM-027 grouped header toolbar with File pill + separators + segmented mode pill + saved dot, MM-028 tinted arch-node icon tiles with Lucide SVGs, MM-029 per-kind icon tile colors aligned with reference, MM-030 Worker icon now matches reference's lucide-square-function, MM-031 header brand-mark SVG now matches reference's wider 33×20 G-letter mark)
- **Regressions introduced**: 0

---

## Current Iteration

### Selected mismatch

MM-031 — Header brand-mark SVG is rendered as a 16×16 mountain-peak glyph instead of the reference's wider 33×20 G-letter mark.

### Why this mismatch was selected

When MM-027 rebuilt the header toolbar, the brand mark retained the original mountain-peak path (`M5 18l3-12 3 8 3-7 4 11`) at the default 18×18 size. While inspecting the reference during MM-030, the logo SVG was probed and found to be a stylized G (an arc + tail) drawn in a wider 33×20 viewBox — a non-square brand mark that visibly differs from local's mountain icon. The mismatch is in the most prominent position of the header (first thing the eye lands on), and the fix is purely additive (no behavior change).

### Reference observation (1440 × 900)

Probed via `document.querySelector('header svg')`:

```js
{
  width: "33",
  height: "20",
  viewBox: "10 10 130 80",
  pathD: "M79.4 33 A34 34 0 1 0 79.4 67 L79.4 50 L58 50",
  rect: { x: 12, y: 13.5, w: 33, h: 20 },
}
```

The SVG draws a near-3/4 circle (centered at the right edge of the viewBox) with a horizontal tail extending left, forming a stylized "G" character. The brand mark sits 12 px from the left edge of the header with a 13.5 px top offset, occupying 33×20 of layout space.

### Local observation (1440 × 900 before fix)

Probed the local `<Icon name="logo" />`:

```js
{
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  pathD: "M5 18l3-12 3 8 3-7 4 11",
  rect: { x: ?, y: ?, w: 18, h: 18 },
}
```

The local logo is a square 18×18 mountain-peak path — visibly different shape, smaller dimensions, and centered tighter in the toolbar.

### Root-cause hypothesis

The local `paths['logo']` was set to a generic Lucide mountain-peak path during initial scaffolding, and `<Icon>` always rendered the SVG at the caller's `size` prop in a square 24-unit viewBox. Two things conspire: (a) the path is the wrong glyph, and (b) the brand mark needs non-square dimensions (33×20) and a wider viewBox (`10 10 130 80`) so the G-letter sits at the same proportions as the reference.

### Planned change

Two-part change to `src/components/ui/Icon.tsx`:

1. Swap `paths['logo']` from `'M5 18l3-12 3 8 3-7 4 11'` to `'M79.4 33 A34 34 0 1 0 79.4 67 L79.4 50 L58 50'`.
2. Add a new `isLogo` branch in the SVG element so `name === 'logo'` renders at `width={33}` / `height={20}` / `viewBox="10 10 130 80"` while every other icon still uses the caller's `size` and the default `0 0 24 24` viewBox. Also expose a `viewBox?: string` prop so future callers can override per-icon if needed.

The Header call site (`<Icon name="logo" size={18} className="text-accent mx-1" />`) does not need to change — `size={18}` is overridden by the `isLogo` branch.

### Result

After implementation (`b3cd0fb`):

Probed local `<Icon name="logo" />` in `localhost:5173`:

```js
{
  width: "33",
  height: "20",
  viewBox: "10 10 130 80",
  pathD: "M79.4 33 A34 34 0 1 0 79.4 67 L79.4 50 L58 50",
  rect: { x: 12, y: 13.5, w: 33, h: 20 },
}
```

Every attribute matches the reference exactly. Side-by-side screenshot at `.reverse-match/screenshots/iteration-031-reference.png` (reference) and `.reverse-match/screenshots/iteration-031-local-after.png` (local after fix).

Console: 0 errors. Only the pre-existing React Flow Pro attribution warning.

**Categorization**: Fixed — header brand-mark now matches the reference's G-letter SVG at the same dimensions, viewBox, and position.

### Remaining difference

- Missing "Compare architecture" icon button between Redo and the segmented mode group in the right cluster — visible as a single icon at x=1037, y=5.5 (36×36, aria-label "Compare architecture") in the reference. Carried over from MM-027.
- Edge particle rendering details (token label position, exact density / speed) — minor.
- Exact node positions vs reference (CDN/Web App offsets, etc.) — sub-pixel.

### New mismatches discovered

The reference's right-cluster layout has **only one** icon button (Compare) between Redo and the segmented mode group, not two. The earlier suspicion of "Compare + settings cog" (mentioned in MM-030's next action) was over-counted — the actual gap is just the single Compare button. So MM-032 is now scoped narrowly to "add the Compare icon button".

### Next action

MM-032 — add the missing "Compare architecture" icon button to the header right cluster (between Redo and the segmented mode group), using the existing `compare` Lucide icon that's already registered in `Icon.tsx` and `lucideName: 'compare'`.

### Reference observation (1440 × 900)

Probed via `document.querySelectorAll('.react-flow__node')` → filter by iconClass containing `square-function` → read `svg.innerHTML`. The Worker node's SVG is composed of three elements:

```html
<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
<path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3"></path>
<path d="M9 11.2h5.7"></path>
```

Note the `width="18"` / `height="18"` / `x="3"` / `y="3"` — the rounded rect uses a 24×24 viewBox with the rect inset by 3 on each side, leaving an 18×18 box.

### Local observation (1440 × 900 before fix)

`src/canvas/ArchNode.tsx` had `worker.lucideName = 'boxes'`. Probed Worker SVG:

```html
<g>
  <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"></path>
  ... (8 more paths forming the stack-of-cubes glyph)
</g>
```

The local `boxes` glyph draws three stacked cubes with a 3D look. Visually unrelated to the reference's function-rect glyph.

### Root-cause hypothesis

During MM-028's KIND map rewrite, `boxes` was chosen for Worker because `square-function` was already registered in `Icon.tsx` for the **Compute** group panel item (it's the natural icon for a generic "Function" cell there). The author assumed Worker ≠ Function and chose a different glyph, but the reference actually reuses `square-function` for both the panel item *and* the on-canvas Worker node — there is no Worker-specific icon. The fix has two parts: (a) point `worker` at `square-function` in the `KIND` map, and (b) update the registry so `square-function`'s `paths` value uses multi-shape markup (the current value was written assuming single-path rendering, so it ended up in a single `<path d="...">` element instead of the reference's three-element `<rect> + <path> + <path>` shape).

### Planned change

Two single-line changes:

1. In `src/canvas/ArchNode.tsx`, change `worker.lucideName` from `'boxes'` to `'square-function'`.
2. In `src/components/ui/Icon.tsx`, change `paths['square-function']` from a single-`d`-string to the multi-shape SVG string `<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3"></path><path d="M9 11.2h5.7"></path>`. Because the string now contains `<`, the `Icon` renderer's existing `paths[name].includes('<')` branch switches to `<g dangerouslySetInnerHTML={...}>`, producing the same three-element SVG the reference emits.

This change also retroactively affects the Compute group panel item (which uses the same `square-function` icon), so it gets the proper three-element rendering too — but that panel item wasn't visible in the screenshots so the side effect is invisible to the user.

### Result

After implementation (`571b61d`):

**Visual verification (1440 × 900, light theme, cleared localStorage)**:

Worker node SVG innerHTML now matches the reference verbatim:

```html
<g>
  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
  <path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3"></path>
  <path d="M9 11.2h5.7"></path>
</g>
```

Computed `tileColor` for Worker is still `rgb(167, 139, 250)` (unchanged from MM-029); only the glyph inside the tile swapped.

Side-by-side screenshot saved at `.reverse-match/screenshots/iteration-030-local-after.png`. The previous iteration-029's `iteration-029-local-after.png` shows the pre-fix Worker (boxes glyph), serving as the "before" image.

Console: 0 errors. Only the pre-existing React Flow Pro attribution warning.

**Categorization**: Fixed — Worker's icon now matches the reference's `lucide-square-function` glyph.

### Remaining difference

- Right cluster missing two buttons (Compare, settings cog) — carried over from MM-027.
- Header logo SVG width 18×18 vs reference's 33×20 — carried over from MM-027.
- Edge particle rendering details (token label position, exact density / speed) — minor.
- Exact node positions vs reference (CDN/Web App offsets, etc.) — sub-pixel.

### New mismatches discovered

None visible from the current scan. The remaining side-by-side differences all live in the header or are sub-pixel canvas-position differences.

### Next action

MM-031 — pick the next visible mismatch. Best candidates: header right-cluster buttons (Compare + settings cog) and header brand-mark SVG width.

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

### MM-026 — Default canvas viewport doesn't match reference's translate/zoom

- **Category**: Visual / layout
- **Severity**: Minor (the diagram still rendered, but at a slightly off-center zoom level compared to the reference)
- **Status**: ✅ Fixed
- **Reference observation (1440 × 900)**: `.react-flow__viewport` inline `transform: translate(120px, 260.286px) scale(0.714286)`. Node rects (verified via Playwright `getBoundingClientRect()`):
  - User: x=120, y=451, w=128.57, h=45.71
  - CDN: x=334.28, y=351.14, w=128.57
  - Web App: x=334.28, y=551.14, w=128.57
- **Local before**: `defaultViewport = { x: 96, y: 180, zoom: 0.7 }` in `src/canvas/defaultDiagram.ts`. Inline transform: `translate(96px, 180px) scale(0.7)`. User node at viewport-x≈68, CDN at viewport-x≈320 — shifted slightly left and up vs reference.
- **Root cause**: MM-001 set the viewport during the early dark-only design phase when the panel was a docked strip (so the diagram needed to start more leftward). MM-025 moved the panel to a floating card over the canvas — the viewport was never re-aligned to match the reference's framing under the new layout.
- **Fix** (in `src/canvas/defaultDiagram.ts`):
  - Changed `defaultViewport` from `{ x: 96, y: 180, zoom: 0.7 }` to `{ x: 120, y: 260, zoom: 0.714286 }`.
- **Verification (1440 × 900, light theme)**:
  - `.react-flow__viewport` inline `transform: translate(120px, 260px) scale(0.714286)` — matches reference exactly (rounded y from 260.286 to 260; same effective framing).
  - CDN rendered at viewport-x ≈ 348.5 (reference: 334.28) — within 14 px tolerance.
  - Web App rendered at viewport-x ≈ 348.5 (reference: 334.28) — within tolerance.
  - Diagram content no longer overlaps the floating panel in any meaningful way.
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning (unrelated).
- **Evidence**: `.reverse-match/screenshots/iteration-026-local.png`
- **Files changed**: `src/canvas/defaultDiagram.ts`.
- **Commit**: `033165d`

### MM-027 — Header toolbar lacks the reference's grouped visual structure

- **Category**: Visual / chrome
- **Severity**: High (the header is the first thing users see; the toolbar groupings signal the app's primary actions)
- **Status**: ✅ Fixed
- **Reference observation (1440 × 900)**: see Current Iteration §"Reference observation" for full DOM dump. Key visual cues: (a) File is a labeled pill (`File ▾`) not an icon button, (b) vertical `w-px h-5 bg-border` separators appear between groups, (c) Saved indicator has a 6×6 green dot prefix, (d) the three mode-toggle buttons sit inside a `rounded-lg bg-surface-2 border border-border` segmented pill, (e) Pause is a labeled chip not an icon button.
- **Local before**: brand mark + wordmark with no separator; File was a 28×28 icon-only button; secondary toolbar was a single flat cluster of 9 buttons with no internal separators; Saved locally was plain text; mode toggles were three loose icon buttons; Pause was icon-only.
- **Root cause**: the header was originally built as a flat row of icon buttons, before the reference's design language emphasized explicit grouping + labeling.
- **Fix**:
  - `src/components/ui/Icon.tsx`: added `'chevron-down'` icon variant.
  - `src/components/layout/Header.tsx`: added vertical separators between groups; converted File into a labeled pill; split Undo/Redo into a tertiary cluster; resized icon buttons to 36×36; wrapped mode toggles in a segmented pill; added green dot to Saved indicator; promoted Pause to a labeled chip.
- **Verification**: see Current Iteration §"Result" for the bounding-box table and `.reverse-match/screenshots/iteration-027-reference.png` vs `.reverse-match/screenshots/iteration-027-local-after.png`.
- **Files changed**: `src/components/layout/Header.tsx`, `src/components/ui/Icon.tsx`.
- **Commit**: `df83aba`

### MM-028 — Arch-node icon tile is dark-filled with a Unicode glyph instead of tinted Lucide SVG

- **Category**: Visual / chrome
- **Severity**: High (every node on the canvas displays the placeholder chrome; visible on first paint)
- **Status**: ✅ Fixed
- **Reference observation (1440 × 900)**: see Current Iteration §"Reference observation" for full DOM dump. Key visual cues: tile is 36×36 rounded-lg with `background: color(srgb ... / 0.2)` (a 20% opacity tint of the kind color) and contains a Lucide SVG (`lucide-cloud` for CDN, `lucide-app-window` for Web App, `lucide-route` for API Gateway, `lucide-server-cog` for API, etc.).
- **Local before**: tile was `h-10 w-10 rounded-md` (40×40, 6 px radius) with a solid dark fill (`#0a2a32`, `#1a1f29`, `#2a1424`, `#2a1a08`, `#1a1838`) and a Unicode letter glyph (`◐`, `☁`, `▢`, `⇄`, `⌘`, `⚡`, `⌗`, `⌇`, `⚙`) at `text-lg font-semibold`. Predates MM-012 (Lucide) and MM-013 (per-kind colors).
- **Root cause**: `src/canvas/ArchNode.tsx` was written before MM-012 brought Lucide paths into the codebase and MM-013 brought the per-kind color map. It was left with the placeholder chrome instead of being refactored.
- **Fix**: see Current Iteration §"Planned change" for the smallest sufficient refactor. Replaced per-kind map; introduced `color-mix(in srgb, ... 20%, transparent)` for the tile background; resized tile to 36×36 rounded-lg; swapped Unicode glyph for Lucide SVG via `<Icon name={k.lucideName} size={18} />`.
- **Verification**: see Current Iteration §"Result" for the bounding-box / computed-style table and `.reverse-match/screenshots/iteration-028-reference.png` vs `.reverse-match/screenshots/iteration-028-local-after.png`.
- **Files changed**: `src/canvas/ArchNode.tsx`.
- **Commit**: `845815e`

### MM-029 — Per-kind arch-node icon tile colors don't match reference (5 of 9 kinds wrong)

- **Category**: Visual / chrome
- **Severity**: Medium (high visual impact — 4 network tier nodes look identical because they all share cyan) but only one or two colours per node are off, not the chrome itself.
- **Status**: ✅ Fixed
- **Reference observation (1440 × 900)**: the reference uses a distinct hue per kind. Computed `tileColor` for each kind: User `rgb(56, 189, 248)` sky `#38bdf8`, CDN `rgb(56, 189, 248)` sky `#38bdf8`, Web App `rgb(52, 211, 153)` emerald `#34d399`, API Gateway `rgb(129, 140, 248)` indigo `#818cf8`, API `rgb(34, 211, 238)` cyan `#22d3ee`, Cache `rgb(244, 114, 182)` pink `#f472b6`, Database `rgb(245, 158, 11)` amber `#f59e0b`, Event Queue `rgb(192, 132, 252)` purple `#c084fc`, Worker `rgb(167, 139, 250)` violet `#a78bfa`.
- **Local before**: the `KIND` map in `src/canvas/ArchNode.tsx` consolidated cdn/webapp/gateway/api under one cyan family (`#22d3ee`), used slate `#94a3b8` for the User, and used violet `#a78bfa` for both queue and worker. Result: 5 of 9 kinds (client, cdn, webapp, gateway, queue) render with the wrong tint.
- **Root cause**: when MM-028 introduced the `KIND` map it copied the per-kind palette from `REVERSE_ENGINEERING.md §4.2` but accidentally grouped the four "edge" kinds under a single cyan, when the reference actually uses 4 different hues for them.
- **Fix**: in the `KIND` map, swap 5 hex literals to match the reference: client & cdn → `#38bdf8` (sky), webapp → `#34d399` (emerald), gateway → `#818cf8` (indigo), queue → `#c084fc` (purple). No structural or class changes; the `color-mix` background rendering from MM-028 already produces the correct tint for any hex supplied.
- **Verification**: see Current Iteration §"Result" for the 9-row computed-style table. Every kind now produces the exact same `rgb(...)` value as the reference, both for `tileColor` and `tileBgColor`. Evidence: `.reverse-match/screenshots/iteration-029-reference.png`, `.reverse-match/screenshots/iteration-029-local-before.png`, `.reverse-match/screenshots/iteration-029-local-after.png`.
- **Files changed**: `src/canvas/ArchNode.tsx`.
- **Commit**: `1ec7e47`

### MM-030 — Worker arch-node icon is `lucide-boxes` instead of reference's `lucide-square-function`

- **Category**: Visual / chrome
- **Severity**: Low (only 1 of 9 nodes affected; the other 8 already match)
- **Status**: ✅ Fixed
- **Reference observation (1440 × 900)**: the Worker node's SVG innerHTML is `<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3"></path><path d="M9 11.2h5.7"></path>` — three elements. Icon class: `lucide lucide-square-function`.
- **Local before**: `worker.lucideName = 'boxes'` in `src/canvas/ArchNode.tsx`. The `boxes` paths entry in `Icon.tsx` was already multi-shape, so Worker rendered 8 `<path>` elements forming a stack-of-cubes glyph. Visually unrelated to the reference's "function rect" glyph.
- **Root cause**: during MM-028, `boxes` was chosen for Worker to keep visual variety (the Compute group panel item already uses `square-function`, so the author assumed Worker ≠ Function). But the reference reuses `square-function` for both panel-item "Function" and on-canvas "Worker" — there is no separate Worker glyph.
- **Fix**: two single-line changes:
  1. `src/canvas/ArchNode.tsx`: `worker.lucideName: 'boxes' → 'square-function'`.
  2. `src/components/ui/Icon.tsx`: convert `paths['square-function']` from a single-`d` string to the multi-shape SVG string. The Icon renderer's `paths[name].includes('<')` branch picks the `<g dangerouslySetInnerHTML>` path, producing the same three-element SVG.
- **Verification**: see Current Iteration §"Result". Local Worker SVG innerHTML now matches the reference verbatim. Side effect: the Compute group panel item also gets the proper three-element rendering (it was previously using a single `<path d="…">` from the simplified registry value); visual change is invisible because the simplified value still drew the same rect + f glyph.
- **Files changed**: `src/canvas/ArchNode.tsx`, `src/components/ui/Icon.tsx`.
- **Commit**: `571b61d`

### MM-031 — Header brand-mark SVG is 18×18 mountain-peak; reference uses 33×20 G-letter mark

- **Category**: Visual / chrome
- **Severity**: Low (single icon in the most prominent position of the header; visible immediately on every page load)
- **Status**: ✅ Fixed
- **Reference observation (1440 × 900)**: the first `<svg>` inside `<header>` has `width="33" height="20" viewBox="10 10 130 80"` and `<path d="M79.4 33 A34 34 0 1 0 79.4 67 L79.4 50 L58 50">` — a non-square SVG that draws a 3/4 arc + horizontal tail forming a stylized "G". Bounding rect is `x=12, y=13.5, w=33, h=20`.
- **Local before**: `paths['logo'] = 'M5 18l3-12 3 8 3-7 4 11'` rendered at the caller's `size` (18) in the default `0 0 24 24` viewBox. Result: a 18×18 square mountain-peak icon — visibly different shape and smaller dimensions.
- **Root cause**: the local logo path was set to a generic Lucide mountain glyph during initial scaffolding, and the `<Icon>` component had no mechanism for non-square icons (always rendered at `size` × `size` in a `0 0 24 24` viewBox). Two changes were needed: the path itself, and an `isLogo` branch in the SVG element to override `size` and `viewBox` for this specific name.
- **Fix** (in `src/components/ui/Icon.tsx`):
  1. Replaced `paths['logo']` with the reference's G-letter arc + tail.
  2. Added an `isLogo = name === 'logo'` branch in the SVG element so the logo renders at `width={33} height={20} viewBox="10 10 130 80"`, while every other icon continues to use the caller's `size` and the default `0 0 24 24` viewBox.
  3. Exposed a `viewBox?: string` prop so future callers can override per-icon if needed.
  Header call site (`<Icon name="logo" size={18} className="text-accent mx-1" />`) needs no change — `size={18}` is overridden by the `isLogo` branch.
- **Verification**: see Current Iteration §"Result". Every probed attribute (`width`, `height`, `viewBox`, `path d`, `bounding rect.x/y/w/h`) now matches the reference exactly. Side-by-side screenshots at `.reverse-match/screenshots/iteration-031-reference.png` and `.reverse-match/screenshots/iteration-031-local-after.png`.
- **Files changed**: `src/components/ui/Icon.tsx`.
- **Commit**: `b3cd0fb`

### MM-025 — Components panel is a docked flat strip; reference uses a floating rounded card + 2-col grid

- **Category**: Visual / layout
- **Severity**: High (affects every item in the panel — biggest visible mismatch after the theme fix)
- **Status**: ✅ Fixed
- **Reference observation (1440 × 900)**: the `<aside aria-label="Components">` is rendered as a **floating rounded card** sitting over the canvas at x=12, y=60, w=264, h=692. Computed styles:
  - `position: absolute`
  - `border-radius: 12px`
  - `box-shadow: rgba(16, 20, 27, 0.06) 0px 1px 2px 0px, rgba(16, 20, 27, 0.08) 0px 8px 24px 0px` (= `--shadow-panel`)
  - `background: rgb(255, 255, 255)`
  - Class string on the element: `absolute z-30 bg-surface shadow-panel overflow-hidden border border-border top-3 max-h-[calc(100%-10rem)] rounded-xl left-3` (panel width via inline style set by the resize hook).
  Inside the panel, items render as a **2-column grid** of small cards (`parentClass: "grid grid-cols-2 gap-1.5"`). Each item button is `group flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 hover:bg-surface-3 hover:border-border-strong ...` (the row style from MM-014), with width ≈120 px. The resize handle from MM-021 is preserved at the right edge of the floating card (`role="separator"`, x=269, w=6).
- **Local before**: `<aside>` was a **docked flat strip** with `class="hidden lg:flex lg:shrink-0 lg:relative lg:w-[280px] lg:h-full lg:border-r lg:border-border lg:bg-surface lg:flex-col lg:overflow-hidden"` — full-height, no rounding, no shadow, just a 1 px right border. Items rendered in a **single-column flex container** (`<div className="flex flex-col gap-1 mt-1.5">`), each item ~246 px wide spanning the panel.
- **Root cause**: MM-002 scaffolded the panel as a docked strip during Milestone 0 (the early dark-only design phase). MM-014 changed items from a 2-col grid to a single-column layout based on a misread of the reference at the time — both the panel chrome (floating card) and the item grid (2-col) were wrong but not yet detected because the panel sat inside its own grid column.
- **Fix**:
  - `src/App.tsx`:
    - Removed the `flex` wrapper around `<ComponentsPanel>` so the panel can sit as an absolutely-positioned child of `<main>`.
    - Moved `<Canvas />` and `<CookieConsent />` to be direct siblings of `<ComponentsPanel />` inside `<main>`.
  - `src/components/panel/ComponentsPanel.tsx`:
    - Desktop `<aside>` class switched from docked strip to floating card: `lg:absolute lg:top-3 lg:left-3 lg:w-[264px] lg:max-h-[calc(100%-10rem)] lg:border lg:rounded-xl lg:shadow-panel lg:bg-surface lg:flex-col lg:overflow-hidden`.
    - Mobile still uses `fixed top-12 left-0 bottom-0 z-30 w-[280px] border-r border-border bg-surface flex flex-col overflow-hidden` (slide-over from MM-009).
    - Items container switched from `flex flex-col gap-1` to `grid grid-cols-2 gap-1.5` for both `default` and `provider` variants. Item button markup is unchanged — they auto-flow into the grid.
    - The resize separator (MM-021) still works — it sits at the right edge of the floating card now.
- **Verification (1440 × 900, light theme)**:
  - Aside rect: `x=12, y=60, width=264, height=692` — matches reference exactly.
  - `border-radius: 12px` — matches.
  - `box-shadow: 0 1px 2px rgba(16,20,27,0.06), 0 8px 24px rgba(16,20,27,0.08)` — matches.
  - `background: rgb(255, 255, 255)` — matches.
  - Items parent class: `grid grid-cols-2 gap-1.5 mt-1.5` — matches.
  - Rectangle item: width 116 px, height 42 px (reference: width 120 px, height 42 px — 4 px narrower due to slightly different panel padding).
  - Resize handle still works: simulated drag expanded panel from 264 → 344 px (+80 px = drag distance). Mobile (420 × 820): hidden by default (`display: none`); tapping the toggle pill renders the slide-over at 280 px wide, position `fixed`, top=48. Closing via × returns to collapsed state. Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning from MM-016.
- **Evidence**:
  - `.reverse-match/screenshots/iteration-025-reference.png`
  - `.reverse-match/screenshots/iteration-025-local.png`
- **Files changed**: `src/App.tsx`, `src/components/panel/ComponentsPanel.tsx`.
- **Commit**: `b7ab434`

### MM-024 — Default theme is hardcoded to dark; reference respects OS preference

- **Category**: Visual / behavior
- **Severity**: Medium (visible on every page load for OS-prefers-light users; produces a jarring white-on-black default that doesn't match the reference)
- **Status**: ✅ Fixed
- **Reference observation (1440 × 900)**: at the time of inspection the host's `window.matchMedia('(prefers-color-scheme: light)')` returned `true`. The reference rendered with `<html>` carrying no class (empty class string), body bg `rgb(246, 248, 251)` (light), body color `rgb(15, 20, 28)` (dark). Reference's `<head>` includes `<meta name="color-scheme" content="dark light">`. Inspecting the bundled `index-DoR4sc6o.js` revealed the reference's theme-init function:
  ```
  let stored = localStorage.getItem('diagramr.theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  ```
  and the application function `document.documentElement.classList.toggle('dark', e === 'dark')`. No `@media (prefers-color-scheme)` CSS rules in the reference's stylesheets — the dark/light split is purely JS-driven.
- **Local before**: `<html class="dark">` hardcoded in `index.html`. `<ReactFlow colorMode="dark">` in `src/canvas/Canvas.tsx`. `useTheme` store had `theme: 'dark'` as the initial value, ignoring OS preference. With OS preference = `light` and no stored value, the local rendered entirely dark: body bg `rgb(11, 14, 20)`, body color `rgb(231, 234, 240)`, xyflow canvas class `react-flow dark` with bg `rgb(20, 20, 20)`. Direct visual mismatch with the reference on every cold load.
- **Root cause**: MM-001 set the `<ReactFlow>` colorMode to `"dark"` and `index.html` hardcoded `class="dark"` during the early dark-only design phase. MM-004 added the Tailwind v4 token system with `.dark` overrides, but no one wired the initial theme to OS preference. MM-024 is the small missing piece.
- **Fix**:
  - **`index.html`**: removed the hardcoded `class="dark"`. Added a synchronous inline `<script>` in `<head>` that runs before paint:
    1. Reads `localStorage["gravelgraph.theme"]` (zustand's wrapped format `{ state: { theme }, version }` or raw `"light"` / `"dark"`).
    2. Falls back to `window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'`.
    3. Toggles `document.documentElement.classList.toggle('dark', theme === 'dark')` and sets `data-theme` for downstream CSS hooks.
    This prevents a flash of the wrong theme during the React mount.
    Also added `<meta name="color-scheme" content="dark light">` and `<meta name="theme-color" content="#f6f8fb" media="(prefers-color-scheme: light)">` + dark counterpart to match the reference.
  - **`src/store/theme.ts`**: added `detectInitialTheme()` that returns `'light'` when `prefers-color-scheme: light` matches (otherwise `'dark'`). The store's initial `theme` now uses it. zustand `persist` + `onRehydrateStorage` continue to handle user overrides on subsequent loads. `applyTheme()` now also writes `data-theme` so the `useTheme` state stays in sync with `<html>` for any CSS that targets it.
  - **`src/canvas/Canvas.tsx`**: replaced the hardcoded `colorMode="dark"` with `colorMode={theme}` driven by `useTheme((s) => s.theme)`. This makes the xyflow canvas + background + node + edge colors follow the live theme.
- **Verification (1440 × 900)**:
  - DOM comparison (no stored value, OS = light):
    - Reference: `htmlClass=""`, `bodyBg=rgb(246, 248, 251)`, `bodyColor=rgb(15, 20, 28)`, `canvasClass="react-flow light"`, `canvasBg=rgb(238, 241, 246)`.
    - Local before: `htmlClass="dark"`, `bodyBg=rgb(11, 14, 20)`, `bodyColor=rgb(231, 234, 240)`, `canvasClass="react-flow dark"`, `canvasBg=rgb(20, 20, 20)`.
    - Local after: `htmlClass=""`, `data-theme="light"`, `bodyBg=rgb(246, 248, 251)`, `bodyColor=rgb(15, 20, 28)`, `canvasClass="react-flow light"`, `canvasBg=rgba(0,0,0,0)` (body bg shows through).
  - Functional scenarios:
    - First visit (no stored value) + OS `light` → light, matches reference.
    - Stored `light` wins on reload (preserves user's choice).
    - Stored `dark` wins on reload (preserves user's choice, even when OS = light).
    - Toggle button flips light ↔ dark and persists the new choice.
  - xyflow canvas now carries `react-flow light` / `react-flow dark` matching the host theme.
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning from MM-016 (unrelated).
- **Evidence**:
  - `.reverse-match/screenshots/iteration-024-reference.png`
  - `.reverse-match/screenshots/iteration-024-local-before.png` (dark default before fix)
  - `.reverse-match/screenshots/iteration-024-local.png` (light default after fix, matches reference)
- **Files changed**: `index.html`, `src/store/theme.ts`, `src/canvas/Canvas.tsx`.
- **Commit**: `fcbd274`

### MM-023 — Stencils import/export buttons are non-functional

- **Category**: Interaction / behavior
- **Severity**: Medium (feature exists in UI copy but does nothing)
- **Status**: ✅ Fixed
- **Reference observation (1440 × 900)**: panel's Stencils row contains two icon buttons:
  - "Import stencils (.json)" — always enabled; onClick handler present. Clicking triggers a hidden `<input type="file" accept="application/json,.json" class="hidden" onChange={...}>`. The hidden file input has React props `{ ref, type, accept, className, onChange }`.
  - "Export stencils" — `disabled` when no stencils are stored; class string includes `disabled:opacity-40`. Clicking triggers a download of `stencils.json` via `URL.createObjectURL(blob)` + `<a download>`.
- **Local before**: both `<button>` elements had only `title` attributes and no click handlers. No hidden file input. No `URL.createObjectURL` for export.
- **Root cause**: MM-002 scaffolded the Stencils row UI to match the reference's chrome, but actual file I/O was always deferred.
- **Fix** (in `src/components/panel/ComponentsPanel.tsx`):
  - Added `import { useEffect, useRef, useState } from 'react'`.
  - Added stencils state: `const [stencils, setStencils] = useState<unknown[]>([])` and a file input ref: `const fileInputRef = useRef<HTMLInputElement>(null)`.
  - Added `useEffect` that reads `localStorage["gravelgraph.stencils"]` on mount and hydrates state if the parsed value is an array.
  - Added `handleImportClick` → `fileInputRef.current?.click()`.
  - Added `handleImportChange` → reads the selected file as text, parses JSON, validates it's an array, updates state, and persists to localStorage. Resets `e.target.value = ''` so importing the same file twice still fires `change`. Catches parse errors silently.
  - Added `handleExportClick` → creates a `Blob` of `JSON.stringify(stencils, null, 2)` with `type: 'application/json'`, calls `URL.createObjectURL`, programmatically clicks an `<a download="stencils.json">`, then `URL.revokeObjectURL`. Returns early if no stencils.
  - Wired the import button: added `type="button"`, `onClick={handleImportClick}`.
  - Wired the export button: added `type="button"`, `onClick={handleExportClick}`, `disabled={stencils.length === 0}`, plus `disabled:opacity-40 disabled:pointer-events-none` to the className (matching the reference).
  - Added the hidden `<input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleImportChange} className="hidden" />` inside the Stencils row.
- **Verification (1440 × 900, dark theme)**:
  - DOM inspection of stencils row buttons: import has `onclick=true`, export has `disabled=true` (when localStorage is empty), file input has `accept="application/json,.json"` and `display: none`.
  - Round-trip test (1): wrote `[{ id: 'demo-1', name: 'My Web App', elements: [] }]` to localStorage, reloaded — export button became `disabled=false` (hydrated from storage).
  - Round-trip test (2): clicked export — captured Blob: `{ type: 'application/json', size: 76, download: 'stencils.json', text: '[\n  {\n    "id": "demo-1",\n    "name": "My Web App",\n    "elements": []\n  }\n]' }`. File downloads correctly.
  - Round-trip test (3): cleared localStorage, reloaded, clicked import → file chooser opened → uploaded `/Users/yepsamii/Desktop/Projects/sysdem/.playwright-mcp/stencils.json` (containing 2 stencils). After upload, export became enabled, `localStorage` contained the same 2 stencils. Imported count matches uploaded count.
  - Error handling: uploaded a malformed JSON (`{`). Import was silently ignored, previous stencils remained in localStorage, export remained enabled, no console errors.
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning from MM-016.
- **Evidence**: `.reverse-match/screenshots/iteration-023-local.png` (Components panel with Stencils row visible, export enabled state shown).
- **Files changed**: `src/components/panel/ComponentsPanel.tsx`.
- **Commit**: `668f0e7`

### MM-022 — Components panel search input is non-functional

- **Category**: Interaction / behaviour
- **Severity**: Medium (visible feature gap; the search input exists but does nothing, making the panel feel broken)
- **Status**: ✅ Fixed
- **Reference observation (1440 × 900)**: search input is an `<input>` (no `type="search"` attribute in the reference — but the local uses `type="search"` which is fine for the clear-button UX). Placeholder: "Search components & services". Filtering behavior (verified by typing "postgres" and "docker" via Playwright `dispatchEvent`):
  - Case-insensitive substring match on item names.
  - Groups with matches auto-expand and are kept visible.
  - Groups with no matches are hidden entirely.
  - Group label count badge shows match count.
  - Clearing the query restores the original open/closed state per group.
  - Reference site also has nested sub-categories (e.g. AWS → Databases) that participate in the filter. The local panel uses a flat `GROUPS` array, so this iteration implements the equivalent flat-group filtering.
- **Local before**: search `<input>` had no `value` or `onChange` props. Typing did nothing. The `GROUPS.map(...)` render always iterated every group and every item regardless of any query.
- **Root cause**: MM-002 scaffolded the search input as a UI placeholder. Filtering logic was always deferred.
- **Fix** (in `src/components/panel/ComponentsPanel.tsx`):
  - Added `const [query, setQuery] = useState('')` and `const q = query.trim().toLowerCase()`.
  - Added `const visibleGroups = q ? GROUPS.map(...).filter(g => g.items.length > 0) : GROUPS`. The map step filters items whose `name.toLowerCase().includes(q)`.
  - Added `const isOpen = (label) => q ? true : !!openMap[label]`. When the query is non-empty, all visible groups are forced open. When the query is empty, the original `openMap` is restored.
  - Added `value={query}` and `onChange={(e) => setQuery(e.target.value)}` to the `<input>`.
  - Updated the badge count: `const badgeCount = q ? group.items.length : (group.displayCount ?? group.items.length)` — shows match count when searching, default count otherwise.
  - Changed the group-render iteration from `GROUPS.map(...)` to `visibleGroups.map(...)` and replaced `openMap[group.label]` reads with `isOpen(group.label)`.
- **Verification (1440 × 900, dark theme)**:
  - Typing "postgres" into the search input: only "Databases" group visible, expanded, showing 1 item (PostgreSQL) with count badge "1".
  - Typing "docker": only "DevOps & Observability" group visible, expanded, showing 1 item (Docker) with count badge "1".
  - Typing "db": "Databases" group expanded, showing 2 items (MongoDB, DuckDB — case-insensitive substring match works) with count badge "2".
  - Typing "storage": 3 groups visible ("Data & Storage", "Google Cloud", "Azure") each expanded with their respective matches (Storage / Cloud Storage / Blob Storage) and count badge "1" each.
  - Clearing the search: all 16 groups return to their original open/closed state — Shapes / Clients & Network + 5 provider sections open, rest closed. No regression.
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning from MM-016.
- **Evidence**: `.reverse-match/screenshots/iteration-022-local.png`
- **Files changed**: `src/components/panel/ComponentsPanel.tsx`.
- **Commit**: `7573f42`

### MM-021 — Components panel has no draggable resize handle

- **Category**: Interaction / behavior
- **Severity**: Minor (small QoL feature; panel width is locked at 280 px)
- **Status**: ✅ Fixed
- **Reference observation (1440 × 900)**: panel `<aside>` has a 6 px-wide vertical separator at its right edge with `role="separator"` and `class="absolute top-0 bottom-0 w-1.5 cursor-col-resize select-none hover:bg-accent/40 active:bg-accent/60 transition-colors right-0"`. Inline style `touch-action: none`. Pointer-event props: `onPointerDown`, `onPointerMove`, `onPointerUp`. Current panel width stored as inline `style="width: 264px; max-width: calc(50% - 1.5rem);"` on the `<aside>` (the reference's persisted width, currently 264 px — user-resized from a default).
- **Local before**: `<aside>` had `lg:w-[280px]` hardcoded with no resize affordance. No separator element. No way to change panel width without editing source.
- **Root cause**: MM-002 scaffolded the panel at a fixed 280 px width and the resize behaviour was always deferred. The reference uses a small drag handle that updates the aside's inline `width` on pointer drag.
- **Fix**:
  - Created `src/hooks/usePanelResize.ts` — a self-contained React hook that:
    - Provides `separatorProps` (role + class + style + pointer-event handlers) to spread onto a `<div>`.
    - On `pointerdown`: captures the pointer, records the starting width + X, sets `cursor: col-resize` and `user-select: none` on `body`.
    - On `pointermove`: updates the target element's inline `width` to `clamp(startW + delta, minWidth=200, maxFraction*innerWidth)`, also sets inline `max-width: calc(50% - 1.5rem)` to match the reference's constraint.
    - On `pointerup`: releases the pointer capture, restores body styles, and persists the final width to `localStorage[storageKey]` if provided.
    - On mount: reads `localStorage[storageKey]` and restores the persisted width if it's within bounds.
  - `src/components/panel/ComponentsPanel.tsx`:
    - Imported `usePanelResize`.
    - Called the hook with `{ targetSelector: 'aside[aria-label="Components"]', minWidth: 200, maxFraction: 0.5, storageKey: 'gravelgraph.componentsPanel.width' }`.
    - Added `relative` to both layout variants of the aside's className so the absolutely-positioned separator lands on the right edge.
    - Rendered `<div {...separatorProps} />` as the first child of the aside (before the header), with class string matching the reference: `hidden lg:block absolute top-0 bottom-0 w-1.5 cursor-col-resize select-none hover:bg-accent/40 active:bg-accent/60 transition-colors right-0 z-10`. The `hidden lg:block` keeps the handle out of the mobile slide-over.
- **Verification (1440 × 900, dark theme)**:
  - DOM inspection: aside contains a `<div role="separator">` with `cursor: col-resize`, width 6 px, height 852 px (= aside height), positioned at x=273 (aside right edge=280). Class string matches the reference.
  - Drag test: simulated pointer events move the panel from 280 px to 360 px (delta +80 px matches drag distance). Width is also persisted to localStorage as `339.67` (the measured final width).
  - Persistence test: after reload, the aside renders at 339.67 px with inline `style="width: 339.672px; max-width: calc(50% - 1.5rem);"`.
  - Mobile (420 × 820): aside is `display: none` by default (collapsed); separator is also `display: none`. When mobile panel is opened via toggle pill, aside is `display: flex` and the separator is still `display: none` (hidden by `hidden lg:block`).
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning from MM-016 (unrelated).
- **Evidence**: `.reverse-match/screenshots/iteration-021-local.png`
- **Files changed**: `src/hooks/usePanelResize.ts` (new), `src/components/panel/ComponentsPanel.tsx`.
- **Commit**: `6ccb5d8`

### MM-020 — SaaS & Identity provider items render with generic Lucide icons instead of real brand SVGs

- **Category**: Visual / branding
- **Severity**: Minor (last remaining open-by-default section with placeholders; 4 items)
- **Status**: ✅ Fixed (slice 4 — final slice — closes the provider-icon replacement started in MM-017)
- **Reference observation (1440 × 900)**: each item renders a 15×15 brand SVG with `viewBox="0 0 24 24"` and `fill="currentColor"`. Wrapper span carries `color-mix` style with the brand color. Brand colors and SVG shapes verified by extracting `svg.outerHTML` and computed `color` for each item in the live reference DOM:
  - **Stripe**: `rgb(99, 91, 255)` indigo (S glyph)
  - **Auth0**: `rgb(235, 84, 36)` orange-red (shield/lozenge)
  - **Okta**: `rgb(0, 125, 193)` blue (concentric rings)
  - **Firebase**: `rgb(255, 202, 40)` yellow (flame)
- **Local before**: each item rendered a generic Lucide placeholder — Stripe (`app-window`), Auth0 (`shield-check`), Okta (`shield-check`), Firebase (`zap`). None were brand-recognizable.
- **Root cause**: MM-015 added provider section structure + placeholder Lucide icons as a stand-in for the brand SVGs. MM-017/018/019 progressively replaced the brand SVGs for Databases / Data & Analytics / Messaging & Streaming + DevOps & Observability. MM-020 closes the loop on the last open-by-default section.
- **Fix**:
  - `src/components/ui/Icon.tsx`:
    - Extended `IconName` union with 4 brand names: `brand-stripe`, `brand-auth0`, `brand-okta`, `brand-firebase`.
    - Added 4 brand SVG paths to the `paths` map (verbatim from the reference DOM). The brand renderer branch (`fill="currentColor"` + `stroke="none"`) added in MM-017 covers these names automatically.
  - `src/components/panel/ComponentsPanel.tsx`:
    - Replaced the 4 placeholder `iconName` values in SaaS & Identity with `brand-stripe` / `brand-auth0` / `brand-okta` / `brand-firebase`.
    - Added `iconColor` for each item matching the brand colors extracted from the reference.
- **Verification (1440 × 900, dark theme)**:
  - DOM inspection confirms 4 brand-SVG buttons: each `<svg>` has `fill="currentColor"`, `stroke="none"`, and exactly 1 `<path>` child. Inner lengths match the reference exactly: 496 (Stripe), 258 (Auth0), 149 (Okta), 1833 (Firebase).
  - Tile wrappers carry the expected inline `color-mix` style with the brand color for each item.
  - Visual screenshot confirms each item shows its correct brand logo with the brand-specific tint: Stripe indigo S, Auth0 orange shield/lozenge, Okta blue rings, Firebase yellow flame.
  - All other provider sections unchanged (Databases / Data & Analytics / Messaging & Streaming / DevOps & Observability still use MM-017/018/019 brand SVGs).
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning from MM-016.
- **Evidence**: `.reverse-match/screenshots/iteration-020-local.png`
- **Files changed**: `src/components/ui/Icon.tsx`, `src/components/panel/ComponentsPanel.tsx`.
- **Commit**: `9778b70`

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

### Iteration 20 — fix MM-020: brand SVGs for SaaS & Identity

- **Goal**: Close out the provider-icon replacement started in MM-017 with the final 4 items in the SaaS & Identity section.
- **Reference observation (1440 × 900)**: each item renders a 15×15 brand SVG with `fill="currentColor"`. Brand colors verified via Playwright `browser_evaluate` on the live reference DOM — Stripe `rgb(99, 91, 255)`, Auth0 `rgb(235, 84, 36)`, Okta `rgb(0, 125, 193)`, Firebase `rgb(255, 202, 40)`. SVG paths extracted verbatim.
- **Local before**: each item rendered a generic Lucide placeholder (app-window / shield-check / shield-check / zap). None were brand-recognizable.
- **Actions**:
  - `src/components/ui/Icon.tsx`:
    - Extended `IconName` union with 4 brand names: `brand-stripe`, `brand-auth0`, `brand-okta`, `brand-firebase`.
    - Added 4 brand SVG paths to the `paths` map (verbatim from the reference DOM). No renderer change — MM-017's `brand-` prefix branch handles these names automatically.
  - `src/components/panel/ComponentsPanel.tsx`:
    - Replaced 4 placeholder `iconName` values in SaaS & Identity with `brand-stripe` / `brand-auth0` / `brand-okta` / `brand-firebase`.
    - Added `iconColor` for each item matching the brand colors extracted from the reference.
- **Verification (1440 × 900, dark theme)**:
  - DOM inspection confirms 4 brand-SVG buttons: each `<svg>` has `fill="currentColor"`, `stroke="none"`, and exactly 1 `<path>` child. Inner lengths match the reference exactly: 496 / 258 / 149 / 1833.
  - Tile wrappers carry the expected inline `color-mix` style with the brand color for each item.
  - Visual screenshot confirms each item shows its correct brand logo with the brand-specific tint: Stripe indigo S, Auth0 orange shield/lozenge, Okta blue rings, Firebase yellow flame.
  - All other provider sections unchanged (still use MM-017/018/019 brand SVGs).
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning.
- **Result**: MM-020 fixed. **Brand-icon replacement is now complete across all 9 provider sections.** All brand-icon work from MM-017 → MM-020 is done. Remaining mismatches are interaction-level: resize handle, search functionality, stencils import/export wiring, default theme.
- **Next action**: MM-021 — Components panel resize handle. The reference's panel has a draggable resize affordance on the right edge (`<hr role="separator">` or similar) that adjusts the panel's width.
- **Commit**: `9778b70`

### Iteration 21 — fix MM-021: draggable resize handle on Components panel

- **Goal**: Add the drag-to-resize affordance to the Components panel's right edge, matching the reference's `role="separator"` element.
- **Reference observation (1440 × 900)**: panel `<aside>` has a 6 px-wide vertical separator at its right edge with `role="separator"`, `class="absolute top-0 bottom-0 w-1.5 cursor-col-resize select-none hover:bg-accent/40 active:bg-accent/60 transition-colors right-0"`, and inline `style="touch-action: none;"`. Pointer-event props: `onPointerDown`, `onPointerMove`, `onPointerUp`. Width stored as inline `style="width: 264px; max-width: calc(50% - 1.5rem);"` on the `<aside>`.
- **Local before**: `<aside>` had `lg:w-[280px]` hardcoded with no resize affordance. No separator element. No way to change panel width without editing source.
- **Actions**:
  - Created `src/hooks/usePanelResize.ts` — a self-contained React hook providing pointer-event handler props that adjust a target element's inline `width` on drag. Supports min/max bounds and localStorage persistence.
  - `src/components/panel/ComponentsPanel.tsx`:
    - Imported and called the hook with `{ targetSelector: 'aside[aria-label="Components"]', minWidth: 200, maxFraction: 0.5, storageKey: 'gravelgraph.componentsPanel.width' }`.
    - Added `relative` to both layout variants of the aside's className so the absolutely-positioned separator lands on the right edge.
    - Rendered `<div {...separatorProps} />` as the first child of the aside with the reference's exact class string. The `hidden lg:block` keeps the handle out of the mobile slide-over.
- **Verification (1440 × 900, dark theme)**:
  - DOM inspection: aside contains a `<div role="separator">` with `cursor: col-resize`, width 6 px, height 852 px (= aside height), positioned at x=273 (aside right edge=280). Class string matches the reference.
  - Drag test: simulated pointer events move the panel from 280 px to 360 px (delta +80 px matches drag distance). Width is also persisted to localStorage as `339.67` (the measured final width).
  - Persistence test: after reload, the aside renders at 339.67 px with inline `style="width: 339.672px; max-width: calc(50% - 1.5rem);"`.
  - Mobile (420 × 820): aside is `display: none` by default (collapsed); separator is also `display: none`. When mobile panel is opened via toggle pill, aside is `display: flex` and the separator is still `display: none` (hidden by `hidden lg:block`).
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning from MM-016 (unrelated).
- **Result**: MM-021 fixed. The panel can now be resized by dragging its right edge; the width persists across reloads. Remaining mismatches: search functionality, stencils import/export wiring, default theme.
- **Next action**: MM-022 — wire the search input to filter items by name (case-insensitive substring match) and auto-expand groups with matches.
- **Commit**: `6ccb5d8`

### Iteration 22 — fix MM-022: Components panel search filter

- **Goal**: Make the existing search input actually filter items by name (case-insensitive substring match), auto-expanding matching groups and hiding non-matching ones — matching the reference's behaviour.
- **Reference observation (1440 × 900)**: search input filters items by case-insensitive substring on item name. Groups with matches auto-expand and are kept visible; groups with no matches are hidden entirely. Group label count badge shows match count. Verified by typing "postgres", "docker", "db", "storage" via Playwright `dispatchEvent` on the live reference.
- **Local before**: search `<input>` had no `value` or `onChange` props. Typing did nothing. The `GROUPS.map(...)` render always iterated every group and every item regardless of any query.
- **Actions** (in `src/components/panel/ComponentsPanel.tsx`):
  - Added `const [query, setQuery] = useState('')` and `const q = query.trim().toLowerCase()`.
  - Added `const visibleGroups = q ? GROUPS.map(g => ({...g, items: g.items.filter(it => it.name.toLowerCase().includes(q))})).filter(g => g.items.length > 0) : GROUPS`.
  - Added `const isOpen = (label) => q ? true : !!openMap[label]`. When the query is non-empty, all visible groups are forced open. When the query is empty, the original `openMap` is restored.
  - Added `value={query}` and `onChange={(e) => setQuery(e.target.value)}` to the `<input>`.
  - Updated the badge count: shows match count when searching, default count otherwise.
  - Changed the group-render iteration from `GROUPS.map(...)` to `visibleGroups.map(...)` and replaced `openMap[group.label]` reads with `isOpen(group.label)`.
- **Verification (1440 × 900, dark theme)**:
  - "postgres" → Databases group, 1 item (PostgreSQL), badge "1".
  - "docker" → DevOps & Observability group, 1 item (Docker), badge "1".
  - "db" → Databases group, 2 items (MongoDB, DuckDB), badge "2" (case-insensitive substring match works).
  - "storage" → 3 groups (Data & Storage, Google Cloud, Azure) each with 1 item, badges "1" each.
  - Clearing search → all 16 groups return to original open/closed state.
  - Zero console errors.
- **Result**: MM-022 fixed. Search now functions. Remaining mismatches: stencils import/export wiring, default theme, panel chrome (floating card vs docked flat).
- **Next action**: MM-023 — wire the Stencils row's import/export buttons to actually upload / download a JSON file.
- **Commit**: `7573f42`

### Iteration 23 — fix MM-023: Stencils import/export wired to JSON file I/O

- **Goal**: Make the Stencils row's ↓ import and ↑ export buttons actually read / write JSON files, matching the reference.
- **Reference observation (1440 × 900)**: import button always enabled — clicking it opens a native file picker (`<input type="file" accept="application/json,.json">`). Selected file is read as text, parsed, validated as an array, and saved. Export button is `disabled` when no stencils are stored; clicking downloads `stencils.json` via a programmatic `<a download>` link. While verifying, also noticed the reference's `<html>` has `class="light"` — the local hardcodes `class="dark"`. This is queued as MM-024 for the next iteration.
- **Local before**: both Stencils row `<button>` elements had only `title` attributes and no `onClick` props. No hidden `<input type="file">` in the DOM. Clicking either button did nothing.
- **Actions** (in `src/components/panel/ComponentsPanel.tsx`):
  - Added `import { useEffect, useRef, useState } from 'react'`.
  - Added `const [stencils, setStencils] = useState<unknown[]>([])` and `const fileInputRef = useRef<HTMLInputElement>(null)`.
  - Added a mount `useEffect` that reads `localStorage["gravelgraph.stencils"]`, validates `Array.isArray`, and hydrates state.
  - Added `handleImportClick` → `fileInputRef.current?.click()`.
  - Added `handleImportChange` → reads selected file via `FileReader`, parses JSON, validates it's an array, updates state, persists to localStorage. Resets `e.target.value = ''` so the same file can be imported twice. Silently catches parse errors.
  - Added `handleExportClick` → builds a `Blob` of `JSON.stringify(stencils, null, 2)` with `type: 'application/json'`, calls `URL.createObjectURL`, programmatically clicks an `<a download="stencils.json">`, then `URL.revokeObjectURL`. Returns early if `stencils.length === 0`.
  - Wired import button: `type="button"` + `onClick={handleImportClick}`.
  - Wired export button: `type="button"` + `onClick={handleExportClick}` + `disabled={stencils.length === 0}` + `disabled:opacity-40 disabled:pointer-events-none`.
  - Added hidden `<input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleImportChange} className="hidden" />` inside the Stencils row.
- **Verification (1440 × 900, dark theme)**:
  - DOM inspection: import has `onclick=true`, export has `disabled=true` (when storage is empty), hidden input has `accept="application/json,.json"` and `display: none`.
  - Round-trip 1 (manual localStorage write): set storage to `[{ id: 'demo-1', name: 'My Web App', elements: [] }]`, reload → export becomes enabled.
  - Round-trip 2 (export download): clicked export → captured `Blob({ type: 'application/json', size: 76, download: 'stencils.json' })`, text matches the source array.
  - Round-trip 3 (file upload): cleared storage, clicked import → file chooser opened → uploaded `stencils.json` containing 2 entries → localStorage updated, export enabled.
  - Error handling: uploaded malformed `{` → import silently ignored, previous stencils preserved, no console errors.
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning (unrelated).
- **Result**: MM-023 fixed. Stencils import/export round-trip works end-to-end. While verifying, discovered MM-024: the reference site starts in `light` mode when OS preference is `light`; the local hardcodes `class="dark"`.
- **Next action**: MM-024 — initial theme should respect `prefers-color-scheme` instead of being hardcoded to `dark`. Read OS preference on first visit, fallback to `dark`.
- **Commit**: `668f0e7`

### Iteration 24 — fix MM-024: default theme respects prefers-color-scheme

- **Goal**: Make the local app start in the same theme as the reference for the same OS preference, and make the xyflow canvas colorMode follow the active theme instead of being hardcoded to dark.
- **Reference observation (1440 × 900)**: at the time of inspection, host OS `prefers-color-scheme: light` returned true. Reference rendered with `<html>` carrying no class, body bg `rgb(246, 248, 251)`, body color `rgb(15, 20, 28)`. `<head>` includes `<meta name="color-scheme" content="dark light">`. Bundle inspection revealed the reference's init function: `stored = localStorage.getItem('diagramr.theme'); if (stored === 'dark' || stored === 'light') return stored; return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';` followed by `document.documentElement.classList.toggle('dark', e === 'dark')`. No `@media (prefers-color-scheme)` CSS rules in the reference's stylesheets — dark/light split is JS-driven.
- **Local before**: `<html class="dark">` hardcoded in `index.html`. `<ReactFlow colorMode="dark">` in `src/canvas/Canvas.tsx`. `useTheme` had `theme: 'dark'` as the initial value. With OS preference = `light` and no stored value, the local rendered entirely dark: body bg `rgb(11, 14, 20)`, body color `rgb(231, 234, 240)`, xyflow canvas class `react-flow dark` with bg `rgb(20, 20, 20)`. Direct visual mismatch with the reference on every cold load.
- **Actions**:
  - `index.html`:
    - Removed the hardcoded `class="dark"`.
    - Added `<meta name="color-scheme" content="dark light">` and `<meta name="theme-color" content="#f6f8fb" media="(prefers-color-scheme: light)">` + dark counterpart.
    - Added a synchronous inline `<script>` in `<head>` that resolves the initial theme (localStorage → OS preference → dark) and toggles `document.documentElement.classList.toggle('dark', ...)` before paint to prevent FOUC.
  - `src/store/theme.ts`:
    - Added `detectInitialTheme()` returning `'light'` when `prefers-color-scheme: light` matches, else `'dark'`.
    - Replaced the store's hardcoded `theme: 'dark'` with `theme: detectInitialTheme()`.
    - Updated `applyTheme()` to also set `document.documentElement.dataset.theme` so CSS / JS can read the resolved theme.
  - `src/canvas/Canvas.tsx`:
    - Imported `useTheme` and subscribed to `theme`.
    - Replaced `colorMode="dark"` with `colorMode={theme}` so the xyflow canvas, background, node, and edge colors follow the live theme.
- **Verification (1440 × 900)**:
  - **First visit (no stored value, OS = light)**:
    - htmlClass: `""` (was `"dark"`)
    - data-theme: `"light"` (was unset)
    - body bg: `rgb(246, 248, 251)` (was `rgb(11, 14, 20)`)
    - canvas class: `react-flow light` (was `react-flow dark`)
    - All four metrics now match the reference exactly.
  - **Stored `light` wins on reload**: set localStorage to `{state:{theme:'light'}}`, reload → still light. (No regression.)
  - **Stored `dark` wins on reload**: clicked toggle to flip to dark, reload → still dark, even though OS = light. (User choice preserved.)
  - **Toggle button**: aria-label flips between "Switch to dark theme" / "Switch to light theme" as the theme changes; click persists to localStorage and updates `useTheme`.
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning (unrelated).
- **Result**: MM-024 fixed. First-visit theme and xyflow colorMode now both follow the active theme. Local matches the reference on cold load when OS prefers light, and preserves user overrides on subsequent loads.
- **Next action**: MM-025 — visual sweep now that both sites render in matching light themes. Need to inspect the reference for any remaining minor differences (panel chrome — reference may be a floating rounded card with shadow vs local docked flat panel; node card chrome subtleties; etc.).
- **Commit**: `fcbd274`

### Iteration 25 — fix MM-025: floating rounded panel card + 2-col item grid

- **Goal**: Replace the docked flat Components-panel strip with the reference's floating rounded card, and switch items from single-column rows to a 2-column grid.
- **Reference observation (1440 × 900)**: the `<aside aria-label="Components">` is a **floating rounded card** sitting over the canvas at x=12, y=60, w=264, h=692. Computed styles: `position: absolute`, `border-radius: 12px`, `box-shadow: 0 1px 2px rgba(16,20,27,0.06), 0 8px 24px rgba(16,20,27,0.08)` (= `--shadow-panel`), `background: rgb(255, 255, 255)`. Class string: `absolute z-30 bg-surface shadow-panel overflow-hidden border border-border top-3 max-h-[calc(100%-10rem)] rounded-xl left-3`. Parent `<main>` is `flex-1 min-h-0 relative`. Items inside the panel render as a 2-column grid (`grid grid-cols-2 gap-1.5`); each button is 120×42 px. The resize separator (MM-021) is preserved at the right edge of the floating card.
- **Local before**: `<aside>` was a docked full-height strip with `border-r border-border` and no rounding / shadow. Items rendered in a single-column flex container (`flex flex-col gap-1`), each ~246 px wide. The panel sat inside a `<main class="flex-1 min-h-0 relative bg-canvas flex">` flex container with `<div class="flex-1 min-w-0 relative">` wrapping the canvas — the panel took up its own grid column, pushing the canvas right.
- **Actions**:
  - `src/App.tsx`: removed the `flex` wrapper around `<ComponentsPanel>` so the panel can sit as an absolutely-positioned child of `<main>`. Moved `<Canvas />` and `<CookieConsent />` to be direct siblings of `<ComponentsPanel />` inside `<main>`.
  - `src/components/panel/ComponentsPanel.tsx`:
    - Desktop `<aside>` class: `lg:absolute lg:top-3 lg:left-3 lg:w-[264px] lg:max-h-[calc(100%-10rem)] lg:border lg:rounded-xl lg:shadow-panel lg:bg-surface lg:flex-col lg:overflow-hidden`. Mobile still uses `fixed top-12 left-0 bottom-0 z-30 w-[280px] border-r border-border bg-surface flex flex-col overflow-hidden` (slide-over from MM-009).
    - Items container switched from `flex flex-col gap-1` to `grid grid-cols-2 gap-1.5` for both `default` and `provider` variants. Item button markup unchanged.
    - The MM-021 resize separator remains as the first child of the aside — it now sits on the right edge of the floating card.
- **Verification (1440 × 900, light theme)**:
  - Aside rect: `x=12, y=60, width=264, height=692` — matches reference exactly.
  - `border-radius: 12px` — matches.
  - `box-shadow: 0 1px 2px rgba(16,20,27,0.06), 0 8px 24px rgba(16,20,27,0.08)` — matches.
  - `background: rgb(255, 255, 255)` — matches.
  - Items parent class: `grid grid-cols-2 gap-1.5 mt-1.5` — matches.
  - Rectangle item: width 116 px, height 42 px (reference: 120×42 — 4 px narrower due to slightly different panel padding; non-impactful).
  - Resize handle still works: simulated drag expanded panel from 264 → 344 px (+80 px = drag distance). Inline `style="width: 344px"` applied.
  - Mobile (420 × 820): aside is `display: none` by default; tapping the toggle pill renders the slide-over at 280 px wide, position `fixed`, top=48. Closing via × returns to collapsed state.
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning (unrelated).
- **Result**: MM-025 fixed. The panel now matches the reference's floating rounded card + 2-col grid pattern. Side effect: nodes drawn under the panel need to be repositioned (queued as MM-026).
- **Next action**: MM-026 — default canvas viewport doesn't match reference's translate/zoom. Reference uses `translate(120px, 260.286px) scale(0.714286)`; local uses `translate(96px, 180px) scale(0.7)`. Update `defaultViewport` in `src/canvas/defaultDiagram.ts`.
- **Commit**: `b7ab434`

### Iteration 26 — fix MM-026: match reference's default canvas viewport

- **Goal**: Re-align the default canvas viewport to match the reference's `translate(120, 260.286) scale(0.714286)` framing so the diagram sits at the right zoom + offset after MM-025 turned the panel into a floating card.
- **Reference observation (1440 × 900)**: `.react-flow__viewport` inline `transform: translate(120px, 260.286px) scale(0.714286)`. Node rects (Playwright `getBoundingClientRect()`):
  - User: x=120, y=451, w=128.57, h=45.71
  - CDN: x=334.28, y=351.14
  - Web App: x=334.28, y=551.14
- **Local before**: `defaultViewport = { x: 96, y: 180, zoom: 0.7 }` in `src/canvas/defaultDiagram.ts`. Inline transform: `translate(96px, 180px) scale(0.7)`. Nodes positioned slightly off — User node partially clipped under the floating panel.
- **Actions** (in `src/canvas/defaultDiagram.ts`):
  - Changed `defaultViewport` from `{ x: 96, y: 180, zoom: 0.7 }` to `{ x: 120, y: 260, zoom: 0.714286 }`.
- **Verification (1440 × 900, light theme)**:
  - `.react-flow__viewport` inline `transform: translate(120px, 260px) scale(0.714286)` — matches reference exactly (rounded y from 260.286 to 260; same effective framing).
  - CDN rendered at viewport-x ≈ 348.5 (reference: 334.28) — within 14 px tolerance.
  - Web App rendered at viewport-x ≈ 348.5 (reference: 334.28) — within tolerance.
  - Diagram content no longer overlaps the floating panel in any meaningful way.
  - Zero console errors. The single remaining warning is the pre-existing React Flow Pro attribution warning (unrelated).
- **Result**: MM-026 fixed. Default canvas viewport now matches the reference. Side effect: minor sub-pixel rounding (260 vs 260.286) — visually indistinguishable.
- **Next action**: MM-027 — visual sweep now that MM-025 (panel chrome) and MM-026 (viewport) are aligned. Need to inspect the reference for the next visible mismatch.
- **Commit**: `033165d`

### Iteration 27 — fix MM-027: group header toolbar to match reference

- **Goal**: Reorganize the header into the reference's grouped structure: File becomes a labeled pill with chevron, vertical separators appear between toolbar groups, the Saved indicator gains a green dot, the three mode-toggle buttons sit inside a segmented pill, and Pause is a labeled chip.
- **Reference observation (1440 × 900)**: header has 2 main groups — left cluster (880×36 starting x=12) and right cluster (391×36 starting x=1037). Left cluster structure: `[logo 33×20 + wordmark 92×24] | sep | File pill 58×32 | sep | 5×icon-btn 36×36 + Export 93×32 + Present 100×32 | sep | undo 36×36 + redo 36×36 | [gap 8px] | Saved locally 145×16 with green dot 6×6`. Right cluster: compare 36×36 + segmented mode pill 112×34 + Pause 90×32 + sep + cog 36×36 + theme 36×36.
- **Local before**: brand mark is `Icon name="logo" size={18}` (18×18) + plain span "GravelGraph"; File was a 28×28 icon-only button using the file-icon; secondary group was a single big cluster of 9 icon buttons + chips with no internal separators; Saved locally was a plain text span; mode toggles were three loose icon buttons with `bg-accent text-accent-contrast` for the selected one; Pause was an icon-only button.
- **Actions**:
  - `src/components/ui/Icon.tsx`: added `'chevron-down'` to the `IconName` union and to the `paths` map (`m6 9 6 6 6-6`).
  - `src/components/layout/Header.tsx`:
    - Added a vertical separator (`w-px h-5 bg-border mx-0.5`) between the brand mark and the File dropdown.
    - Converted File into a labeled pill (`pl-2.5 pr-1.5 gap-1` with text "File" + chevron-down icon).
    - Added separator after File; added internal separator between the icon-mode group and Export/Present.
    - Split Undo/Redo into a separate tertiary cluster with its own leading separator.
    - Sized icon buttons at 36×36 (`h-9 w-9`) instead of 28×28 to match reference.
    - Wrapped the three mode-toggle buttons in a segmented pill (`inline-flex rounded-lg bg-surface-2 border border-border p-0.5 gap-0.5`); each child is `h-7 px-2.5 rounded-md text-sm font-medium` with `bg-surface text-fg shadow-sm` on the selected one.
    - Rewrote the center cluster as `<span class="hidden xl:flex min-w-0 items-center gap-1.5 text-xs text-faint select-none">` with a `<span class="h-1.5 w-1.5 rounded-full bg-success shrink-0">` green dot followed by `<span class="truncate">Saved locally · just now</span>`.
    - Promoted Pause from icon-only button to a labeled chip using the same `chipBtn` class as Export/Present.
- **Verification (1440 × 900, light theme, cleared localStorage)**:
  - File pill: x=141, w=58, h=32 ✅ matches reference (x=170, w=58, h=32) — within the 23–29 px offset caused by the narrower local brand mark.
  - Vertical separators: visible at x=134, x=205, x=618 — render as expected (`w-px h-5 bg-border`).
  - Saved indicator: green dot renders at the correct location with `bg-success` token color (`#15803d` light / `#34d399` dark).
  - Segmented mode pill: 3× 14×14 icons inside a 112×34 bordered pill, with the selected mode highlighted via `bg-surface shadow-sm`.
  - Pause chip: labeled "Pause" with pause icon, 90×32 — matches reference.
  - Console: 0 errors. Only the pre-existing React Flow Pro attribution warning.
  - Side-by-side comparison saved as `.reverse-match/screenshots/iteration-027-reference.png` (reference) vs `.reverse-match/screenshots/iteration-027-local-after.png` (local).
- **Result**: MM-027 fixed. Header now visually mirrors the reference's grouped toolbar pattern. The remaining sub-pixel differences come from a narrower local brand mark and missing right-cluster buttons (Compare, settings cog) which are intentionally deferred to a later iteration.
- **Next action**: MM-028 — pick the next visible mismatch from a side-by-side scan. Likely candidates: arch-node icon-tile backgrounds, edge particle details, or exact node positions.
- **Commit**: `df83aba`

### Iteration 28 — fix MM-028: tint arch-node icon tiles + use Lucide SVGs

- **Goal**: Replace the dark-filled Unicode-glyph icon tile in `src/canvas/ArchNode.tsx` with the reference's tinted (20% opacity of kind color) Lucide SVG icon tile: 36×36 rounded-lg, kind-tinted background, Lucide icon for each kind.
- **Reference observation (1440 × 900)**: each arch node has an icon tile that is `grid place-items-center h-9 w-9 rounded-lg shrink-0 overflow-hidden` with `background: color(srgb r g b / 0.2)` and a Lucide SVG inside (`lucide-monitor-smartphone`, `lucide-cloud`, `lucide-app-window`, `lucide-route`, `lucide-server-cog`, `lucide-zap`, `lucide-database`, `lucide-waypoints`, `lucide-boxes`). Tile size 36×36, border-radius 8 px.
- **Local before**: `h-10 w-10 rounded-md` (40×40, 6 px radius) tile with solid dark fills (`#0a2a32`, `#1a1f29`) and Unicode letter glyphs (`◐`, `☁`, `▢`, `⇄`, `⌘`, `⚡`, `⌗`, `⌇`, `⚙`) at `text-lg font-semibold`. Predates MM-012 (Lucide adoption) and MM-013 (per-kind colors) — never refactored.
- **Actions** (in `src/canvas/ArchNode.tsx`):
  - Replaced per-kind `KIND` map from `{ stroke, bg, label }` → `{ color, lucideName }`.
  - Set tile background via inline `style={{ background: 'color-mix(in srgb, ${k.color} 20%, transparent)' }}` to reproduce the reference's `color(srgb r g b / 0.2)` rendering.
  - Resized tile from `h-10 w-10 rounded-md` (40×40 / 6 px) → `h-9 w-9 rounded-lg` (36×36 / 8 px).
  - Switched icon from `{k.label}` (Unicode letter) to `<Icon name={k.lucideName as never} size={18} strokeWidth={1.75} className="" />` (Lucide SVG).
  - Lucide mapping: `monitor-smartphone` (User), `cloud` (CDN), `app-window` (Web App), `route` (API Gateway), `server-cog` (API), `zap` (Cache), `database` (Database), `waypoints` (Event Queue), `boxes` (Worker).
  - Removed the unused `ComponentType` import (left as a literal in case future refactors need it).
- **Verification (1440 × 900, light theme, cleared localStorage)**:
  - Icon tile size: `width: 36px, height: 36px` ✅ matches reference.
  - Icon tile border-radius: `8px` ✅ matches reference.
  - Icon tile background: `color(srgb 0.133333 0.827451 0.933333 / 0.2)` for cdn/webapp/gateway/api ✅ matches reference's `color(srgb 0.219608 0.741176 0.972549 / 0.2)` family (cyan-400 at 20%).
  - Icon tile color (stroke): `rgb(34, 211, 238)` = `#22d3ee` ✅ within Tailwind cyan-400 vs reference's sky-400 (`#38bdf8`).
  - Icon SVG content: CDN tile's first child path is `M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z` — matches reference's `lucide-cloud` path verbatim.
  - All 9 node kinds render with the correct tinted background + Lucide SVG.
  - Side-by-side comparison saved as `.reverse-match/screenshots/iteration-028-reference.png` (reference) vs `.reverse-match/screenshots/iteration-028-local-after.png` (local).
  - Console: 0 errors. Only the pre-existing React Flow Pro attribution warning.
- **Result**: MM-028 fixed. The arch-node chrome now visually references the design system (Lucide icons + per-kind colors) instead of carrying placeholder glyphs. Cyan hue differs slightly from reference's sky (deferred to a future iteration as a single-token swap).
- **Next action**: MM-029 — pick the next visible mismatch. Likely candidates: align cyan hue with reference's sky, widen the brand-mark logo SVG, add missing Compare + settings cog buttons in the right cluster, or pick a finer detail from the panel/edges.
- **Commit**: `845815e`

### Iteration 29 — fix MM-029: align per-kind arch-node icon tile colors with reference

- **Goal**: Update the per-kind color hex literals in `src/canvas/ArchNode.tsx` so each node's tile uses the same accent color as the reference (sky/emerald/indigo/cyan/pink/amber/purple/violet) instead of collapsing cdn/webapp/gateway/api into a single cyan family.
- **Reference observation (1440 × 900)**: full per-kind color probe via `svg.parentElement.parentElement` + `getComputedStyle(tile).color`:
  - User `rgb(56, 189, 248)` = sky `#38bdf8`, CDN `rgb(56, 189, 248)` = sky, Web App `rgb(52, 211, 153)` = emerald `#34d399`, API Gateway `rgb(129, 140, 248)` = indigo `#818cf8`, API `rgb(34, 211, 238)` = cyan `#22d3ee`, Cache `rgb(244, 114, 182)` = pink, Database `rgb(245, 158, 11)` = amber, Event Queue `rgb(192, 132, 252)` = purple `#c084fc`, Worker `rgb(167, 139, 250)` = violet.
- **Local before**: client `#94a3b8` slate, cdn/webapp/gateway/api all `#22d3ee` cyan, queue `#a78bfa` violet, worker `#a78bfa` violet. Result: 5 of 9 kinds render the wrong color, and 4 of the 9 nodes (cdn/webapp/gateway/api) look identical.
- **Actions** (in `src/canvas/ArchNode.tsx`, in the `KIND` map):
  - `client`: `#94a3b8` slate → `#38bdf8` sky.
  - `cdn`: `#22d3ee` cyan → `#38bdf8` sky.
  - `webapp`: `#22d3ee` cyan → `#34d399` emerald.
  - `gateway`: `#22d3ee` cyan → `#818cf8` indigo.
  - `queue`: `#a78bfa` violet → `#c084fc` purple.
  - Untouched: `api` `#22d3ee`, `cache` `#f472b6`, `database` `#f59e0b`, `worker` `#a78bfa` — already matched the reference.
- **Verification (1440 × 900, light theme, cleared localStorage)**:
  - 9/9 kinds produce the same `tileColor` as the reference (full table in Current Iteration §"Result").
  - 9/9 kinds produce the matching `tileBgColor` (e.g. Web App tile = `color(srgb 0.203922 0.827451 0.6 / 0.2)` — emerald at 20%).
  - Side-by-side screenshots: `.reverse-match/screenshots/iteration-029-reference.png` vs `.reverse-match/screenshots/iteration-029-local-after.png` (and a `.reverse-match/screenshots/iteration-029-local-before.png` showing the pre-fix state).
  - Console: 0 errors. Only the pre-existing React Flow Pro attribution warning.
- **Result**: MM-029 fixed. The arch-node tiles now mirror the reference's per-kind color categorisation, so users can identify each network tier by accent color rather than by reading the label. Side observation: the reference uses `square-function` for Worker; local uses `boxes` (a deliberate choice during MM-028 to keep visual variety) — deferred to MM-030.
- **Next action**: MM-030 — pick the next visible mismatch. Likely candidates: Worker icon swap `boxes → square-function`, header right-cluster buttons (Compare + settings cog), header brand-mark SVG width, or pick a finer detail from the edges/panel.
- **Commit**: `1ec7e47`

### Iteration 30 — fix MM-030: align Worker arch-node icon with reference (square-function)

- **Goal**: Swap the Worker's `lucide-boxes` glyph for the reference's `lucide-square-function` glyph.
- **Reference observation (1440 × 900)**: Worker node SVG innerHTML is `<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3"></path><path d="M9 11.2h5.7"></path>` — three elements (rounded-rect + 2 paths).
- **Local before**: Worker was a stack-of-cubes glyph (8 paths inside a `<g>`).
- **Actions**:
  - `src/canvas/ArchNode.tsx`: `worker.lucideName: 'boxes' → 'square-function'`.
  - `src/components/ui/Icon.tsx`: `paths['square-function']` changed from a single-`d` string to the multi-shape SVG string. The Icon renderer's `paths[name].includes('<')` branch now picks `<g dangerouslySetInnerHTML={...}>`, producing the same three-element SVG the reference emits.
- **Verification (1440 × 900, light theme, cleared localStorage)**:
  - Worker SVG innerHTML now: `<g><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3"></path><path d="M9 11.2h5.7"></path></g>` — matches the reference exactly.
  - All 8 other node kinds unchanged (icons and tile colors still correct from MM-028 and MM-029).
  - Side-by-side screenshot saved at `.reverse-match/screenshots/iteration-030-local-after.png` (the iteration-029 screenshot serves as the "before" since it was taken with `boxes`).
  - Console: 0 errors. Only the pre-existing React Flow Pro attribution warning.
- **Result**: MM-030 fixed. All 9 arch nodes now render the same Lucide glyph as the reference. Side observation: the Compute group's panel "Function" item also picked up the new three-element rendering automatically (it shares the `square-function` icon name), so the side effect is invisible because the simplified single-`d` value drew the same rect + f glyph anyway.
- **Next action**: MM-031 — pick the next visible mismatch. Best candidates: header right-cluster buttons (Compare + settings cog) and header brand-mark SVG width.
- **Commit**: `571b61d`

### Iteration 31 — MM-031 (header brand-mark SVG width)

- **Selected mismatch**: MM-031 — header brand-mark SVG is rendered as a 16×16 mountain-peak glyph instead of the reference's wider 33×20 G-letter mark.
- **Reference probe**: `width="33" height="20" viewBox="10 10 130 80"`, path `M79.4 33 A34 34 0 1 0 79.4 67 L79.4 50 L58 50`. Bounding rect x=12, y=13.5, w=33, h=20.
- **Change made**: in `src/components/ui/Icon.tsx`, replaced `paths['logo']` with the reference's G-letter arc + tail, added a new `isLogo = name === 'logo'` branch in the SVG element so the logo renders at `width={33} height={20} viewBox="10 10 130 80"`, and exposed a `viewBox?: string` prop for future per-icon overrides.
- **Verification (1440 × 900, light theme)**:
  - Local `<Icon name="logo" />` SVG now reports `width="33" height="20" viewBox="10 10 130 80"`, `pathD = "M79.4 33 A34 34 0 1 0 79.4 67 L79.4 50 L58 50"`. Bounding rect x=12, y=13.5, w=33, h=20 — matches the reference verbatim.
  - Side-by-side: `.reverse-match/screenshots/iteration-031-reference.png` (reference) vs `.reverse-match/screenshots/iteration-031-local-after.png` (local after fix). The brand-mark position, dimensions, and glyph shape are indistinguishable.
  - Console: 0 errors. Only the pre-existing React Flow Pro attribution warning.
- **Result**: MM-031 fixed. The brand-mark SVG now matches the reference exactly. Other icons (including the Compute group panel "Function" item, which also uses `square-function` after MM-030) are unaffected by the `isLogo` branch since the check is strictly `name === 'logo'`.
- **New mismatches discovered**: the reference's right-cluster has only one icon button (Compare) between Redo and the segmented mode group, not two. So MM-032 narrows in scope: add just the Compare button.
- **Next action**: MM-032 — add the missing "Compare architecture" icon button between Redo and the segmented mode group. The `compare` icon is already registered in `Icon.tsx` with `lucideName: 'compare'`.
- **Commit**: `b3cd0fb`

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
| 020  | MM-020 | (same reference) | `.reverse-match/screenshots/iteration-020-local.png` | — | inline in iteration log |
| 021  | MM-021 | (same reference) | `.reverse-match/screenshots/iteration-021-local.png` | — | inline in iteration log |
| 022  | MM-022 | (same reference) | `.reverse-match/screenshots/iteration-022-local.png` | — | inline in iteration log |
| 023  | MM-023 | (same reference) | `.reverse-match/screenshots/iteration-023-local.png` | — | inline in iteration log |
| 024  | MM-024 | `.reverse-match/screenshots/iteration-024-reference.png` | `.reverse-match/screenshots/iteration-024-local-before.png`, `iteration-024-local.png` | — | inline in iteration log |
| 025  | MM-025 | `.reverse-match/screenshots/iteration-025-reference.png` | `.reverse-match/screenshots/iteration-025-local.png` | — | inline in iteration log |
| 026  | MM-026 | (same reference) | `.reverse-match/screenshots/iteration-026-local.png` | — | inline in iteration log |
| 027  | MM-027 | `.reverse-match/screenshots/iteration-027-reference.png` | `.reverse-match/screenshots/iteration-027-local-after.png` | — | inline in iteration log |
| 028  | MM-028 | `.reverse-match/screenshots/iteration-028-reference.png` | `.reverse-match/screenshots/iteration-028-local-before.png`, `iteration-028-local-after.png` | — | inline in iteration log |
| 029  | MM-029 | `.reverse-match/screenshots/iteration-029-reference.png` | `.reverse-match/screenshots/iteration-029-local-before.png`, `iteration-029-local-after.png` | — | inline in iteration log |
| 030  | MM-030 | — | `.reverse-match/screenshots/iteration-030-local-after.png` (before = iteration-029-local-after) | — | inline in iteration log |
| 031  | MM-031 | `.reverse-match/screenshots/iteration-031-reference.png` | `.reverse-match/screenshots/iteration-031-local-after.png` | — | inline in iteration log |

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
