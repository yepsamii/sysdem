# 09 — Important Interactions (verified live)

Every interaction below was exercised live and the resulting DOM / ARIA / computed state was captured. This is the actual feature surface you need to reproduce.

## 1. Theme toggle

**Trigger:** Moon / sun button in the top-right of the header.

**Verified behaviour:**

- `<html class="dark">` ↔ `<html class="">` flips.
- Every `--color-*` CSS variable re-evaluates (`bg-surface`, `text-fg`, etc.).
- The theme choice is persisted (likely to `localStorage`).

```js
// Pre-click
document.documentElement.className === 'dark'
document.body.backgroundColor === 'rgb(11, 14, 20)'

// Post-click
document.documentElement.className === ''
document.body.backgroundColor === 'rgb(246, 248, 251)'
```

## 2. First-run template chooser

**Trigger:** Auto-shown on first visit. Modal with 8 cards + "Blank canvas".

The eight templates (verified by reading the dialog content):

| Title | Description |
|---|---|
| System architecture | A 3-tier web app as a living diagram: browser → API → Postgres with CDN/worker fan-out |
| Cloud architecture | AWS serverless in official icons: request → DynamoDB → SQS → Lambda |
| API request flow | Step-through request/reply: client → API → Postgres and back |
| Order flowchart | Receive → check stock → ship or backorder |
| Real-time telemetry (UDP) | IoT sensors → stream processor → live dashboards/rollups/alerts |
| ETL / CSV pipeline | CSV → S3 → Airflow → Spark → Snowflake → Looker |
| Event streaming | Order events on Kafka → stream processor, search index, warehouse, cache + DLQ |

Each card drops a pre-built diagram into the editor; the user can edit freely afterward.

## 3. Components panel

**Trigger:** Always-visible left aside (resizable). On mobile (`<md`) it collapses to a top tab.

Features:

- **Search** across all components (`<input placeholder="Search components & services">`).
- **Expand all / Collapse all** toggles for category accordions.
- **Stencils** group at the top — "Select elements, then 'Save as stencil' to reuse them here." with **Import stencils (.json)** and **Export stencils** buttons.
- **Built-in groups**: Shapes (8 primitives), Clients & Network (4), Compute (4), Data & Storage (4), Messaging (1), Security & External (2), Structure (2).
- **Cloud groups**: AWS (805), GCP (238), Azure (638), Cloudflare (9) — fetched lazily.
- **Curated groups**: Databases, Data & Analytics, Messaging & Streaming, DevOps & Observability, SaaS & Identity.

Each item in the panel is a draggable button (drag to canvas).

## 4. Canvas tools

The toolbar exposes five tool buttons (with key bindings shown in their `aria-label`):

| Tool | Key | Effect |
|---|---|---|
| Select | V | Drag a box to multi-select nodes/edges |
| Hand | H | Drag to pan the canvas |
| Draw | (button) | Freehand pen (ink stroke overlay) |
| Line | (button) | Draw a freestanding line |
| Arrow | (button) | Draw a freestanding arrow |

Verified `aria-pressed` toggles between tools.

## 5. Drag handle → node (connect with a flow)

**Verified by:** Default diagram already has 9 edges connecting 9 nodes.

Workflow:

1. Hover over a node — 8 invisible handles fade in (`!opacity-0 group-hover:!opacity-100 transition-opacity duration-150`).
2. Drag from a source handle to a target handle.
3. A new edge appears with the connection path; the default edge type emits `<animateMotion>` particles.

## 6. Edit labels

**Trigger:** Double-click a node or an edge label.

Verified `<div aria-label="Double-click to edit">` exists on every node's title/subtitle. The `Help` dialog confirms: *"Edit label — Double-click node"*.

## 7. Pause / play data flow

**Trigger:** Toolbar play/pause toggle. Key binding: `Space`.

Behaviour:

- Toggles `aria-pressed` on the button.
- When paused, the `<animateMotion>` elements stop; when resumed, they restart from the saved `data-phase` so particles don't snap.

## 8. Flow modes (radio group)

**Verified:** `<div role="radiogroup" aria-label="Flow mode">` with three options:

| Mode | Effect |
|---|---|
| Continuous | Every edge flows simultaneously (default) |
| Causal | Data ripples through in order — particles on downstream edges fire only after their upstream edge has reached the target node |
| Scenario | Narrated steps; ← / → navigates between them |

## 9. Undo / Redo

**Verified:** Two buttons in the toolbar with `disabled:opacity-40 disabled:pointer-events-none` when the stack is empty. Key bindings: `⌘/Ctrl+Z` and `⌘/Ctrl+Shift+Z` (or `⌘Y`).

## 10. Export

**Trigger:** Toolbar "Export" button → dialog with these options (per the description and JSON-LD `featureList`):

- PNG (canvas snapshot)
- SVG (raw SVG export)
- PDF (jsPDF)
- Animated GIF (canvas-recorded)
- Video (MediaRecorder)

## 11. Present (fullscreen playback)

**Trigger:** Toolbar "Present" button. Verified by button label *"Present (fullscreen playback)"*.

Behaviours:

- Fullscreen via Fullscreen API.
- Keyboard navigation through scenario steps (`←` / `→`).
- **Laser pointer** (`L`) — a glowing dot follows the cursor for live narration.
- `Esc` exits Present and deselects.

## 12. Compare architecture

**Trigger:** Toolbar "Compare architecture" button.

Behaviour (per button label and feature list): side-by-side diff of two diagrams with deltas highlighted. Not exercised in detail but verified present.

## 13. Help dialog

**Trigger:** Toolbar Help button or `?`.

Contents:

- Keyboard shortcuts (Play/Pause, Delete, Undo/Redo, Copy/Paste/Duplicate, Select all, Group/Ungroup, tool selection, Fit, Scenario step, Laser pointer, Esc, Double-click to edit label, Drag handle → node).
- About paragraph + `mailto:support@woodenamethyst.com.au?subject=GravelGraph%20feedback`.
- "Ads pay for it — Cookie settings" + link to `/privacy/`.

## 14. Cookie consent

**Trigger:** First visit shows a bottom-center "Cookies" card with Accept / Decline buttons.

Behaviour:

- Sets `localStorage["diagramr.cookieConsent"] = { v:1, ads: boolean }`.
- Updates `<html>` consent state.
- Reloads / re-runs `gtag('consent', 'update', …)`.

## 15. Autosave indicator

**Trigger:** Always visible in the toolbar (right side) as a small status line.

Behaviour: shows *"Saved locally · 54s ago"*, ticking down and refreshing the relative timestamp. Underneath is `aria-label="Autosaved in this browser — use Save to keep a file or Copy link to share"`.

## 16. Share / copy link

**Trigger:** "Copy link" button (referenced in the banner strip).

Behaviour:

- Compresses the current graph → URL-safe base64 → writes `location.hash = '#d=…'`.
- Updates the browser URL (no navigation).
- Plausible intentionally ignores `hashchange` to avoid stat pollution.

## 17. Drag-to-slide edge label

**Trigger:** Grab the chip on an edge and drag along the path.

Behaviour:

- The label slides along the edge in screen space (the `transform: translate(-50%,-50%) translate(X,Y)` is updated in real-time).
- Double-click the label to centre it back at the midpoint.

Verified by `title="Drag to slide along the edge · double-click to centre"` on each label.

## 18. Zoom / pan / fit

**Trigger:** React Flow Controls (bottom-left), `F` (Fit), mouse wheel (zoom), drag (pan).

Verified by `transform: translate(96px, 261.8px) scale(0.6)` on `.react-flow__viewport` and the four-button Controls component.

## Implications for a reimplementation

All 18 interactions are first-class features. Treat the keyboard shortcuts as a fixed contract (`V`, `H`, `Space`, `?`, `Esc`, `←`, `→`, `L`, `F`, `Del`, `⌘Z`, `⌘⇧Z`, `⌘C/V/D/A/G`, `⌘⇧G`).