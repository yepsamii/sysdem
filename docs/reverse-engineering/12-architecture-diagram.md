# 12 — Architecture Diagram

GravelGraph is a **single-page, no-backend, client-only web app**. The diagram below shows every component, the data flow between them, and the external integrations.

```
┌────────────────────────────────── Browser only (no backend) ──────────────────────────────────┐
│                                                                                                │
│  ┌────────────────────────────── index.html (HTML shell) ──────────────────────────────────┐ │
│  │  <noscript> fallback                                                                   │ │
│  │  Plausible script (cookieless)                                                         │ │
│  │  Google Consent Mode v2 (defaults denied)                                              │ │
│  │  AdSense loader (skipped on ?embed=1 / ?view=1)                                        │ │
│  │  Vite client manifest: /assets/index-*.js                                              │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                            │                                                  │
│                                            ▼                                                  │
│  ┌──────────────────── App bootstrap (React 19.2.6) ────────────────────────────────────────┐ │
│  │  createRoot(#root) → <App/>                                                             │ │
│  │                                                                                         │ │
│  │  ┌── Top-level store (zustand, persisted to localStorage) ──────────────────────────┐   │ │
│  │  │ • diagram   — nodes, edges, viewport, labels, scenarios, theme                  │   │ │
│  │  │ • ui        — active tool, selection, modal stack, panel sizes                  │   │ │
│  │  │ • consent   — cookie consent state                                              │   │ │
│  │  │ • stencils  — user-saved stencils (JSON)                                         │   │ │
│  │  └─────────────────────────────────────────────────────────────────────────────────┘   │ │
│  │                                            │                                            │ │
│  │  ┌─────────────────────────────────────────────▼── Layout (flex-col, h-dvh) ────────┐   │ │
│  │  │ <Header/>        toolbar, undo/redo, autosave status, flow-mode, theme         │   │ │
│  │  │ <Banner/>        dismissible first-run / saved-locally strip                   │   │ │
│  │  │ <main>                                                                             │   │ │
│  │  │    <ReactFlow/>       — @xyflow/react v12                                         │   │ │
│  │  │      ├── <Background/>      dot pattern SVG                                       │   │ │
│  │  │      ├── <Controls/>        zoom/fit/lock                                         │   │ │
│  │  │      ├── <MiniMap/>         custom coloured rects                                 │   │ │
│  │  │      ├── <EdgeRenderer/>     per-edge SVG with SMIL particles                     │   │ │
│  │  │      ├── <NodeRenderer/>     custom .react-flow__node-arch cards                  │   │ │
│  │  │      └── useReactFlow()      for zoom/fit/setCenter                               │   │ │
│  │  │ <Aside/>           Components panel (resizable, collapsible groups)                │   │ │
│  │  │ <DiagramSettingsButton/>   opens settings dialog                                   │   │ │
│  │  └─────────────────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                                         │ │
│  │  ┌── Overlays (rendered via portals / sibling layers) ─────────────────────────────┐   │ │
│  │  │ • First-run template chooser (Dialog)                                            │   │ │
│  │  │ • Help dialog (shortcuts + About + contact)                                      │   │ │
│  │  │ • Cookie consent (region)                                                        │   │ │
│  │  │ • Diagram settings dialog                                                        │   │ │
│  │  │ • Export dialog (PNG / SVG / PDF / GIF / Video via jsPDF + canvas + webcodec)   │   │ │
│  │  │ • Compare architecture                                                           │   │ │
│  │  │ • Present fullscreen + laser pointer                                             │   │ │
│  │  └─────────────────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                                         │ │
│  │  ┌── Domain modules (pure-ish, in /src/state or /src/lib) ──────────────────────────┐   │ │
│  │  │ • importer/{mermaid,terraform}.ts   Mermaid (.mmd) → graph, Terraform HCL → graph│   │ │
│  │  │ • exporter/{png,svg,pdf,gif,video}.ts                                            │   │ │
│  │  │      PNG:  html-to-image / canvas snapshot                                       │   │ │
│  │  │      SVG:  serialize React Flow tree                                             │   │ │
│  │  │      PDF:  jsPDF + SVG embedding                                                 │   │ │
│  │  │      GIF:  canvas captureStream → GIF encoder                                    │   │ │
│  │  │      Video:MediaRecorder over canvas captureStream                               │   │ │
│  │  │ • share.ts        graph ⇄ LZ-compressed JSON in #d=…                            │   │ │
│  │  │ • serializer.ts   graph ⇄ .gravel file                                          │   │ │
│  │  │ • flow.ts         particles, phases, paths for <animateMotion>                  │   │ │
│  │  │ • stencil.ts      user-saved groups ⇄ JSON                                       │   │ │
│  │  └─────────────────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                                         │ │
│  │  ┌── Static assets (Vite /assets/*) ──────────────────────────────────────────────┐    │ │
│  │  │ /assets/components-*.js          custom Lucide-style icon components           │    │ │
│  │  │ /assets/zap-*.js                 small shared helpers                          │    │ │
│  │  │ /assets/hierarchy-*.js           React 19 + react-dom/client                   │    │ │
│  │  │ /assets/jsx-runtime-*.js         React JSX runtime shim                         │    │ │
│  │  │ /assets/cloudCatalogFull-*.js    ~1500 cloud icon entries (lazy-loaded)        │    │ │
│  │  │ /assets/icons/...svg              vendor official SVG icons                      │    │ │
│  │  │ /assets/jspdf.es.min-*.js        jsPDF (dynamic import on PDF export)          │    │ │
│  │  └─────────────────────────────────────────────────────────────────────────────────┘    │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                │
│  Service worker (/sw.js, vite-plugin-pwa) caches HTML + assets for offline use                │
│  Plausible (self-hosted, cookieless) tracks pageviews, ignores #d= hash                      │
│  Google AdSense loads only on `/` (skipped on ?embed=1/?view=1)                             │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component responsibilities

| Component | Owns |
|---|---|
| `App` | Reads `#d=…` from URL hash, hydrates the store, renders the layout |
| `diagramStore` | Nodes, edges, viewport, labels, scenarios, undo/redo stack, autosave to `localStorage` |
| `uiStore` | Active tool, theme, modal stack, panel sizes, mini-map visibility |
| `consentStore` | Cookie consent flag (persisted under `diagramr.cookieConsent`) |
| `Layout` | Shell with header, banner, main canvas, aside, settings button |
| `Header` | File menu, tool buttons, undo/redo, autosave status, Compare, flow-mode radios, Pause/Play, Help, theme toggle |
| `ReactFlow` (from `@xyflow/react`) | Pan/zoom, node/edge lifecycle, hit-testing, accessibility |
| `ArchNode` | Custom node renderer (`react-flow__node-arch`) with 8 handles |
| `FlowEdge` | Custom edge renderer with `<animateMotion>` particles |
| `EdgeLabelRenderer` (xyflow built-in) | Absolute-positioned HTML labels at edge midpoints |
| `Background` | Dot pattern SVG |
| `Controls` | Zoom/fit/lock panel |
| `MiniMap` | Coloured mini-rectangles per node |
| `Aside` | Components panel — search, expand/collapse, drag source |
| `CookieConsent` | Region with Accept/Decline |
| `FirstRunTemplates` | Dialog with 8 starter diagrams + Blank |
| `Help` | Dialog with shortcuts + About + contact |
| `DiagramSettings` | Dialog with theme accent, grid snap, particle speed |
| `ExportDialog` | Dialog with PNG/SVG/PDF/GIF/Video options |
| `Compare` | Side-by-side diff view |
| `Present` | Fullscreen mode with laser pointer |

## Data flow

```
User action ──► React component ──► zustand store action ──► state update ──► re-render
                                              │
                                              ├─► debounced autosave → localStorage
                                              └─► hash update on share (#d=…)
```

External integrations:

- **Plausible** — `POST /api/event` on pageview (anonymous, no PII, hash excluded).
- **AdSense** — `GET /pagead/js/adsbygoogle.js`, then a series of `gen_204`, `sodar`, iframe `googleads.g.doubleclick.net` calls. Skipped on `?embed=1` and `?view=1`.

## Verification

This diagram was built from the actual DOM tree (recursive `walk()` over the React Flow subtree), the bundle import graph (`index-*.js` imports `zap`, `hierarchy`, `components`, `jsx-runtime`; `hierarchy` and `components` import `zap`), the network panel (Plausible POST + AdSense script load + dynamic jsPDF chunk), and the inline `<head>` consent script. No node in the diagram is speculative — each maps to either a verified import, an observed DOM subtree, or a verified button/dialog.