# 14 — Implementation Plan

A 6-milestone plan that builds the recreation incrementally, with each milestone producing something testable against the live site.

## Milestone 0 — Bootstrap (½ day)

**Goal:** Empty app shell, dark-mode-aware, Tailwind v4 + design tokens wired.

**Tasks:**
1. Scaffold Vite + React 19 + TypeScript.
2. Install Tailwind CSS v4, copy the `@theme` block from [13-react-recreation.md](./13-react-recreation.md) into `styles/tailwind.css`.
3. Create `<div id="root">` with `<noscript>` fallback and the `h-dvh w-full flex flex-col` shell.
4. Mount a placeholder `App` component.
5. Add a `<ThemeToggle>` button that flips `<html class="dark">`.

**Acceptance:**
- Visiting `http://localhost:5173/` shows a blank dark canvas.
- Toggling the button flips between light and dark instantly.
- No console errors.

## Milestone 1 — Static canvas (1 day)

**Goal:** React Flow renders with `<Background>`, `<Controls>`, `<MiniMap>`; header toolbar renders with theme toggle.

**Tasks:**
1. Install `@xyflow/react`.
2. Wrap `<ReactFlow>` with `<Canvas>` and pass `proOptions={{ hideAttribution: true }}` (or keep the attribution — the current site keeps it).
3. Add `<Background variant="dots">`, `<Controls>`, `<MiniMap nodeColor={…} />`.
4. Render the header with brand mark, File button, the six toolbar buttons (icon-only, disabled for now), Undo/Redo (disabled), autosave status (placeholder), Compare, flow-mode radios, Pause/Play (disabled), Help, theme toggle.
5. Add the dismissible top banner with "Your work is saved in this browser only".
6. Persist the theme in `localStorage` (key `gravelgraph.theme`).

**Acceptance:**
- Side-by-side screenshot at 1280×800 matches the live site for the static layout.
- All Tailwind utilities from the live site resolve (no missing class warnings).
- Theme persists across reloads.

## Milestone 2 — Nodes & edges (1–2 days)

**Goal:** Functional canvas with drag-drop, 8-handle nodes, animated edges.

**Tasks:**
1. Build `ArchNode` (icon + 2-line label, 8 invisible hover handles, 180×64 default, `shadow-panel`).
2. Build `FlowEdge` rendering the SVG path + 2-4 `<animateMotion>` particles via the formula in [13-react-recreation.md](./13-react-recreation.md#particle-animation-reimplementation).
3. Build `EdgeLabel` as an absolutely-positioned div inside `<EdgeLabelRenderer>`.
4. Wire up xyflow's `selectionOnDrag`, `panOnDrag`, and custom `onPaneClick` for tool switching.
5. Add a `useKeyboardShortcuts` hook for `V`, `H`, `Space`, `F`, `←`, `→`, `L`, `Esc`, `?`, `Del`, `⌘Z`, `⌘⇧Z`, `⌘C/V/D/A/G`, `⌘⇧G`.
6. Wire toolbar buttons to update `uiStore.activeTool`.
7. Implement Pause/Play: removes/adds `<animateMotion>` from the DOM.
8. Implement the three flow modes (Continuous / Causal / Scenario) — change `dur` per edge based on topology for Causal; gate by step membership for Scenario.

**Acceptance:**
- Drop a Rectangle from the Components panel, drag from its handle to another node → edge appears with a teal particle.
- `Space` pauses and resumes particles without snapping.
- `←` / `→` navigate scenario steps; only edges in the current step animate.
- 22 active `<animateMotion>` particles on the default System Architecture diagram.

## Milestone 3 — Components panel & first-run templates (1 day)

**Goal:** Sidebar with all categories + first-run modal with 8 starter templates.

**Tasks:**
1. Build `<Aside>` resizable sheet with the `<hr role="separator">` drag handle.
2. Build `<Search>` (fuzzy match across component name + label + provider).
3. Build `<CollapsibleGroup>` with `aria-expanded` and count badge.
4. Wire drag-from-panel to drop-on-canvas (`onDragStart` + xyflow's `onDrop` + `screenToFlowPosition`).
5. Build the 8 starter diagrams as JSON fixtures under `src/templates/`.
6. Build the first-run modal with cards and "Blank canvas" option.
7. Add Stencils group with Import/Export `.json` (just JSON.stringify round-trip).
8. Lazy-load `cloudCatalogFull` on first cloud-category expand.

**Acceptance:**
- First-load modal appears with 8 templates.
- Clicking "Event streaming" drops the canonical Kafka → stream-processor → search/warehouse/cache diagram.
- Searching "post" highlights PostgreSQL.
- Dragging "Rectangle" to canvas creates a new node at the cursor.
- Expand/collapse state for each group is preserved across reloads.

## Milestone 4 — Persistence, sharing, settings (1 day)

**Goal:** Autosave, share links, settings dialog, cookie consent.

**Tasks:**
1. Set up `diagramStore` with `zustand/middleware`'s `persist` (storage key `gravelgraph.diagram.v1`, debounce autosave by 1 s).
2. Implement `domain/share.ts` using `lz-string`:
   - `encodeShareLink(graph)` → URL with `#d=…`.
   - `decodeShareLink()` → graph or null.
3. On `App` mount, call `decodeShareLink()` and hydrate the store.
4. Add "Copy link" button — writes the share URL to the clipboard.
5. Add "Save" / "Open" buttons (download/upload `.gravel` JSON file).
6. Add "Diagram settings" dialog with: theme accent colour, grid snap, particle speed, edge label visibility.
7. Add cookie consent region with Accept/Decline + `localStorage["diagramr.cookieConsent"]`.
8. Wire Google Consent Mode v2 (denied by default; replay from consentStore).

**Acceptance:**
- Edit diagram → reload → state restored from localStorage.
- Copy link → open in private window → identical diagram loads from `#d=…`.
- Accepting cookies persists across reloads and the consent banner does not re-appear.
- Adjusting particle speed in settings immediately changes `dur` on all edges.

## Milestone 5 — File menu, import, export, present mode (1–2 days)

**Goal:** All export formats work; import works; present mode works.

**Tasks:**
1. Build `<FileMenu>` popover (File button) with: New, Open `.gravel`, Save `.gravel`, Import → Mermaid / Terraform, Export → PNG / SVG / PDF / GIF / Video.
2. Implement `domain/importer/mermaid.ts` using `mermaid.parse` (or a simpler hand-rolled parser).
3. Implement `domain/importer/terraform.ts` (basic resource → node mapping).
4. Implement exporters:
   - **PNG** — `html-to-image` on the React Flow container.
   - **SVG** — serialize xyflow's internal SVG (or use `toSvg` from `@xyflow/react`).
   - **PDF** — `jspdf` + SVG embedding.
   - **GIF** — `canvas.captureStream()` + `MediaRecorder` + GIF encoder.
   - **Video** — `canvas.captureStream()` + `MediaRecorder` (webm).
5. Implement Present mode (Fullscreen API + laser pointer overlay + scenario-step navigation with ←/→).
6. Build `<Help>` dialog with all shortcuts + About + contact + privacy link.
7. Implement Compare architecture (two diagrams side-by-side with deltas).

**Acceptance:**
- Export PNG, open it, confirm it matches the on-screen canvas.
- Export SVG, open it in a vector editor — looks identical.
- Export PDF, open it — first page shows the diagram.
- Enter Present mode → press Space → press ← / → → walk through scenario steps; `L` toggles the laser pointer.
- Compare two diagrams side-by-side; deltas highlighted.

## Milestone 6 — PWA, embed/view modes, polish (½ day)

**Goal:** Offline-capable PWA, embed/view modes, final polish.

**Tasks:**
1. Install `vite-plugin-pwa`. Configure precaching for the app shell, JS chunks, CSS, icons, manifest.
2. Generate `manifest.webmanifest` matching the current site (icons, `start_url: '.'`, `display: 'standalone'`, `background_color: '#0b0e14'`).
3. Honour `?embed=1` (hide header chrome, controls, banner, adsense) and `?view=1` (read-only, allow zoom and present).
4. Inline Plausible snippet with hash exclusion (mirrors the current site's HTML).
5. Wire Google AdSense loader behind the `?embed=1` / `?view=1` gate.
6. Bundle Inter and JetBrains Mono locally via `@fontsource`.
7. Add a content-security-policy that allows Plausible, AdSense, and the static asset origins.
8. Lighthouse pass: aim for 95+ on all four categories.
9. Manual offline test: load once, go offline, reload — app boots and last diagram loads.

**Acceptance:**
- Lighthouse: Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- Offline: after one visit, going offline and reloading still serves the app.
- Embed: `<iframe src="…?embed=1">` in a third-party page renders the diagram with no chrome.

---

## Acceptance tests (end-to-end)

1. **Visual parity:** Side-by-side screenshots at desktop (1280×800) and mobile (420×820) match the live site within stylistic tolerance.
2. **Functional parity:** Drop → connect → press Space → particle animates along the edge; ← / → steps through scenario; fullscreen Present plays the data flow.
3. **Persistence:** Edit → reload → state restored; copy link → opens identical diagram in private window.
4. **Theme parity:** Toggle persists; all colors swap via `--color-*` tokens only.
5. **Export parity:** PNG/SVG/PDF/GIF/Video all produce valid files matching the on-screen diagram.
6. **PWA:** Visit once, go offline, reload → app still loads and last diagram is present.

## Suggested effort

- **Solo developer:** 6–8 working days.
- **Two developers (one on canvas/state, one on UI/dialogs):** 4–5 days.
- **One-week sprint with three devs:** ~3 days.

## Open questions for the product owner

1. Do we want to ship **vendor cloud icons** (AWS/GCP/Azure/Cloudflare), or replace them with neutral inline SVGs to avoid licensing concerns?
2. Should **Settings** allow custom accent colours, or should we lock to the cyan accent?
3. Do we need **multi-user real-time collaboration** (Yjs / Liveblocks), or is single-user + share-link enough?
4. Do we want to keep **Plausible self-hosted** or switch to the official Plausible cloud?
5. Should **GIF/Video export** be free, or behind a "Pro" tier?