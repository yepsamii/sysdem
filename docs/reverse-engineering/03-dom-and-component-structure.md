# 03 — DOM & Component Structure

## App shell

```
#root
├── <h1 hidden> + <p hidden>          (SEO crawlable description, visually hidden via clip-rect)
└── .gg-shell                          (flex flex-col, h-dvh, w-full, overflow-hidden)
    ├── <header role="banner">         (h-12, border-b, bg-surface)
    │     ├── [left]  brand "GG" + File menu, tool buttons
    │     │           (Select/Hand/Draw/Line/Arrow/Export/Present),
    │     │           Undo/Redo, autosave status
    │     └── [right] Compare, Flow-mode radios
    │                 (Continuous/Causal/Scenario), Pause/Play,
    │                 Help, Theme toggle
    ├── [first-run banner]             dismissible top strip ("Your work is saved in this browser only")
    ├── <main aria-label="Diagram canvas">       (flex-1, relative)
    │     └── <div role="application">  ← React Flow root `.react-flow .light|.dark`
    │           ├── .react-flow__renderer
    │           │     └── .react-flow__pane (pan/zoom)
    │           │           └── .react-flow__viewport (transform: translate + scale)
    │           │                 ├── .react-flow__edges           (SVG <g> per edge w/ <animateMotion>)
    │           │                 ├── .react-flow__edgelabel-renderer (absolutely positioned labels)
    │           │                 └── .react-flow__nodes           (each node = HTML div)
    │           ├── <svg class="react-flow__background">     (dotted pattern)
    │           ├── .react-flow__panel.controls (Zoom In/Out/Fit/Lock)
    │           └── .react-flow__panel.minimap (hidden md:block)
    ├── <aside aria-label="Components">         (resizable vertical panel)
    │     ├── header + search + expand/collapse
    │     ├── collapsible groups:
    │     │     Shapes, Clients & Network, Compute, Data & Storage,
    │     │     Messaging, Security & External, Structure,
    │     │     AWS (805), GCP (238), Azure (638), Cloudflare (9),
    │     │     Databases, Data & Analytics, Messaging & Streaming,
    │     │     DevOps & Observability, SaaS & Identity
    │     └── <hr role="separator" aria-label="Resize Components">
    └── <button aria-label="Diagram settings">  (gear, opens settings dialog)
```

Overlays (rendered alongside the shell, not inside `main`):

- First-run template chooser (`<div role="dialog">` — 8 starter templates + Blank)
- Help dialog (`<div role="dialog">` — shortcuts list + About + contact)
- Diagram settings dialog
- Export dialog
- Compare architecture
- Cookie consent (`<div role="region" aria-label="Cookie consent">`)

## React Flow subtree (verified by recursive walk)

```
.react-flow
├── .react-flow__renderer                          position:absolute, full size
│   └── .react-flow__pane.draggable                (pan/zoom surface)
│       └── .react-flow__viewport.xyflow__viewport.transform = "translate(X,Y) scale(Z)"
│           ├── .react-flow__edges                 (z-index:0, 9 SVG <g> in default state)
│           │   └── <svg> > <g class="react-flow__edge react-flow__edge-flow">
│           │         ├── <path class="react-flow__edge-path"/>            visible stroke
│           │         ├── <path class="react-flow__edge-interaction"/>     20px hit-area
│           │         └── <path stroke="transparent" stroke-width="22"/>  click target
│           ├── .react-flow__edgelabel-renderer    absolute labels (one per labeled edge)
│           └── .react-flow__nodes                 (each = HTML div, not <foreignObject>)
│               └── <div class="react-flow__node react-flow__node-arch">
├── <svg class="react-flow__background">          <pattern> + <rect> dot grid
├── .react-flow__panel.controls                    bottom-left, 4 icon buttons
└── .react-flow__panel.minimap                     bottom-right, hidden md:block
```

## Node markup (verified)

```html
<div class="react-flow__node react-flow__node-arch nopan selectable draggable"
     data-id="n_4e08883f"
     data-testid="rf__node-n_4e08883f"
     tabindex="0"
     role="group"
     aria-roledescription="node"
     aria-describedby="react-flow__node-desc-1"
     style="z-index:0; transform:translate(0px,200px); pointer-events:all;
            visibility:visible; width:180px; height:64px;">
  <div class="group relative flex items-center gap-2.5 rounded-xl border bg-surface
              px-3 py-2.5 min-h-full w-full shadow-panel transition-colors border-border"
       style="opacity:1;">
    <!-- icon slot (40×40 rounded-md bg-surface-2 wrapper) -->
    <div data-handleid="t" data-nodeid="…" data-handlepos="top" data-id="…-t-source"
         class="react-flow__handle react-flow__handle-top nodrag nopan
                !opacity-0 group-hover:!opacity-100 transition-opacity duration-150
                source connectable connectablestart connectableend connectionindicator"
         style="left:50%; width:8px; height:8px;
                background:var(--color-accent); border:2px solid var(--color-surface);"></div>
    <!-- …7 more handles per side: t, ta, tb / r, ra, rb / b, ba, bb / l, la, lb -->
    <div class="flex-1 min-w-0">
      <div class="text-sm font-semibold leading-tight truncate" title="…">User</div>
      <div class="text-xs text-faint leading-tight truncate">Browser</div>
    </div>
  </div>
</div>
```

Notable conventions:

- **8 handles per node**, three per side (`t/ta/tb`, `r/ra/rb`, etc.) — allows precise connection points and avoids overlap.
- Handles are **invisible until hover** (`!opacity-0 group-hover:!opacity-100 transition-opacity duration-150`).
- Default size is **180×64** with `rounded-xl` corners and a single-line title + subtitle (the subtitle is muted/mono and a tooltip via `title=`).
- Node ID format is **`n_<8-hex>`** (e.g. `n_4e08883f`) — short, ephemeral IDs.

## Edge markup (verified)

```svg
<g class="react-flow__edge react-flow__edge-flow nopan selectable"
   tabindex="0" role="group"
   aria-roledescription="edge"
   data-id="e_fa54bf63"
   data-testid="rf__edge-e_fa54bf63"
   aria-label="Edge from n_4e08883f to n_826e359a"
   aria-describedby="react-flow__edge-desc-1">
  <path id="e_fa54bf63"
        d="M183 232L203 232L 390,232Q 390.00001017252606,232 …L577.0000203450521 232L597.0000203450521 232"
        fill="none" class="react-flow__edge-path"
        style="stroke:var(--color-border-strong); stroke-width:1.5;"/>
  <path d="…" fill="none" stroke-opacity="0" stroke-width="20" class="react-flow__edge-interaction"/>
  <path d="…" fill="none" stroke="transparent" stroke-width="22"
        pointer-events="stroke" style="cursor:pointer;"/>
  <g pointer-events="none">
    <circle r="3.2" fill="#22d3ee"
            data-flow-particle data-phase="0.0000" data-dir="forward">
      <animateMotion dur="20.7s" begin="-0.0s" repeatCount="indefinite"
                     keyPoints="0;1" keyTimes="0;1" calcMode="linear"
                     path="M183 232L203 232L 390,232 …L597.0000203450521 232"/>
    </circle>
    <text font-size="9" fill="#22d3ee" text-anchor="middle" dy="-7"
          pointer-events="none"
          data-flow-particle data-phase="0.0000" data-dir="forward"
          style="font-family:var(--font-mono);">HTTPS
      <animateMotion …same path…/>
    </text>
  </g>
  <g pointer-events="none">
    <circle r="3.2" fill="#22d3ee" data-flow-particle data-phase="0.5000" data-dir="forward">
      <animateMotion dur="20.7s" begin="-10.35s" …/>
    </circle>
  </g>
  <g pointer-events="none">
    <circle r="3.2" fill="#22d3ee" data-flow-particle data-phase="0.0000" data-dir="reverse">
      <animateMotion dur="20.7s" begin="-0.0s" repeatCount="indefinite"
                     keyPoints="1;0" keyTimes="0;1" …/>
    </circle>
    <text …>HTTPS<animateMotion … keyPoints="1;0" …/></text>
  </g>
  <!-- … -->
</g>
```

Observations:

- Edge IDs are **`e_<8-hex>`** (`e_fa54bf63`).
- Each edge renders **3 stacked `<path>`s**: a visible stroke, a 20-px invisible hit-target, and a 22-px transparent click-target (so you can grab the edge even on small strokes).
- Particles are emitted via `<animateMotion>` along the **same path** as the visible stroke, so labels and circles move together.
- **Forward and reverse** particles share the same edge — `data-dir="reverse"` reverses `keyPoints` (`"1;0"` instead of `"0;1"`).
- The data-phase is used to **stagger** particles so multiple circles animate on the same edge with offsets (e.g. `data-phase="0.0000"` and `data-phase="0.5000"`).
- Color is per-edge (`fill="#22d3ee"`, etc.) — drawn from a palette shared across edges (matches the accent in light theme, but each edge type has its own color).
- Verified on the default diagram: **22 active `<animateMotion>` particles** at any time.

## Edge label markup (verified)

Edge labels are **HTML divs**, not SVG `<text>` (positioned by xyflow's `EdgeLabelRenderer`):

```html
<div class="nodrag nopan absolute px-1.5 py-0.5 rounded
            bg-surface border border-border text-xs"
     title="Drag to slide along the edge · double-click to centre"
     style="transform: translate(-50%,-50%) translate(307.2px,232px);
            pointer-events:all; cursor:grab; touch-action:none;">
  request / response
</div>
```

The label is absolutely positioned at `(x,y)` and translated by `-50% -50%` to centre on the midpoint of the edge. Tooltip via `title=` explains the drag-to-slide affordance.

## Accessibility roles in use

| Role | Where |
|---|---|
| `banner` | The header |
| `application` | The canvas wrapper (`<div role="application">`) |
| `group` | Each node (xyflow default) and each edge (xyflow default) |
| `radiogroup` | Flow-mode radios |
| `radio` | Each flow-mode option |
| `dialog` | First-run template chooser, Help, Settings, Export |
| `region` + `aria-label="Cookie consent"` | Cookie banner |
| `complementary` | Components aside |

## Live DOM count (on default loaded diagram)

- `.react-flow__node` — 9
- `.react-flow__edge` — 9
- `<animateMotion>` — 22 (2 particles × ~9 edges, some forward+reverse)
- `[data-flow-particle]` — 22
- Handles — 9 × 8 = **72 invisible handles**

## Implications for a reimplementation

- Treat nodes as **HTML divs**, not `<foreignObject>`, so you can use full Tailwind classes.
- Reuse the **8-handle layout** by extending xyflow's `Handle` positions to top/a/b/c/left etc., or by adding multiple `<Handle>` components at `top/22%`, `top/50%`, `top/78%` per side.
- Render edges as a **custom edge type** (`type: 'flow'`) where you control the full SVG output (so you can emit `<animateMotion>` inside).
- Render edge labels via xyflow's `<EdgeLabelRenderer>` with the exact class set above (`nodrag nopan absolute px-1.5 py-0.5 rounded bg-surface border border-border text-xs`).
- All overlays are simple portals — no `Popover.js` library required, just `<dialog>` or your own focus-trap.