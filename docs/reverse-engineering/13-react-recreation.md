# 13 — Recreating GravelGraph in React

This document maps each finding to concrete library choices and a folder layout for a faithful reimplementation.

## Stack

| Concern | Choice | Why |
|---|---|---|
| Build tool | **Vite** | Matches the current site's chunking + `vite-plugin-pwa`. |
| UI framework | **React 19 + TypeScript** | Matches the current site (`react-dom/client`, function components, JSX runtime). |
| Canvas / graph | **`@xyflow/react`** (v12, the actively-maintained fork) | Emits `xyflow__viewport`, `react-flow__*`, `--xy-minimap-*` — identical to the current site. |
| State | **Zustand** with `persist` middleware | Matches `createStore` + `useStore` patterns found in the bundle. Persist under `gravelgraph.diagram.v1`. |
| Styling | **Tailwind CSS v4** | Matches `--tw-*` runtime vars + `@theme` color tokens. Dark mode is a class flip on `<html>`. |
| PDF export | **`jspdf`** | Already dynamically imported on the current site. |
| GIF export | **`gifenc`** or **`gif.js`** | Not currently bundled on the site; would need to add. |
| Video export | **`MediaRecorder` over `canvas.captureStream`** | Built-in to the browser — no library needed. |
| PNG export | **`html-to-image`** (or hand-rolled `<canvas>` + `foreignObject` SVG snapshot) | Modern, well-maintained. |
| SVG export | Hand-rolled from xyflow internals | No library needed. |
| Fonts | **`@fontsource/inter`** + **`@fontsource/jetbrains-mono`** | The current site falls back to system fonts; bundling fixes visual consistency. |
| Routing | **None** | Single SPA + URL-hash for `#d=…`. |
| Service worker | **`vite-plugin-pwa`** | Generates `/sw.js` and `/registerSW.js` exactly as the current site. |
| Manifest | Hand-written `manifest.webmanifest` | Mirror the current site's icon set + colors. |
| Analytics | **Plausible** (self-host or use the official cloud) | Mirrors the current site (cookieless, hash excluded). |
| Ads | **Google AdSense** with **Google Consent Mode v2** | Optional for a recreation; gate with `?embed=1` / `?view=1` like the current site. |

## Folder layout

```
src/
├── main.tsx                            # createRoot + registerSW
├── App.tsx                             # reads #d hash, hydrates store, renders Layout
│
├── state/
│   ├── diagramStore.ts                 # zustand: nodes, edges, viewport, undo/redo, labels, scenarios
│   ├── uiStore.ts                      # active tool, theme, modal stack, panel sizes
│   ├── consentStore.ts                 # cookie consent v1 (mirrors diagramr.cookieConsent)
│   └── stencilStore.ts                 # user-saved stencils (.json)
│
├── domain/
│   ├── graphModel.ts                   # types: Node, Edge, EdgeLabel, Scenario
│   ├── importer/
│   │   ├── mermaid.ts                  # .mmd → graph
│   │   └── terraform.ts                # .hcl → graph
│   ├── exporter/
│   │   ├── png.ts                      # html-to-image
│   │   ├── svg.ts                      # serialize React Flow tree
│   │   ├── pdf.ts                      # jsPDF + SVG embedding
│   │   ├── gif.ts                      # canvas captureStream + GIF encoder
│   │   └── video.ts                    # MediaRecorder
│   ├── share.ts                        # LZ-compressed graph JSON ↔ URL-safe base64 in #d=
│   ├── serializer.ts                   # graph ↔ .gravel file
│   ├── flow.ts                         # particle phases/directions/paths for animateMotion
│   └── stencil.ts                      # user-saved groups ↔ JSON
│
├── ui/
│   ├── icons/                          # custom Lucide-style React components
│   │   ├── Hand.tsx
│   │   ├── Select.tsx
│   │   ├── Draw.tsx
│   │   ├── Line.tsx
│   │   ├── Arrow.tsx
│   │   ├── Export.tsx
│   │   ├── Present.tsx
│   │   ├── Compare.tsx
│   │   ├── Pause.tsx
│   │   ├── Play.tsx
│   │   ├── Help.tsx
│   │   ├── Theme.tsx
│   │   ├── Close.tsx
│   │   └── …
│   │
│   ├── CloudIcons/                     # generated icons for the cloud catalog
│   │   ├── index.ts                    # map (provider, id) → icon component
│   │   └── …
│   │
│   ├── primitives/                     # reusable UI primitives
│   │   ├── ToolbarButton.tsx
│   │   ├── IconChip.tsx
│   │   ├── SegmentedRadio.tsx
│   │   ├── Dialog.tsx                  # focus trap + Escape + portal
│   │   ├── Banner.tsx                  # dismissible top strip
│   │   ├── CollapsibleGroup.tsx
│   │   └── Kbd.tsx                     # keyboard shortcut chip
│   │
│   ├── Layout.tsx                      # shell: Header + Banner + Main + Aside + DiagramSettingsButton
│   ├── Header.tsx
│   ├── AutosaveStatus.tsx
│   ├── ThemeToggle.tsx
│   │
│   ├── Canvas/
│   │   ├── Canvas.tsx                  # ReactFlow root, providers, viewport
│   │   ├── ArchNode.tsx                # .react-flow__node-arch with 8 handles
│   │   ├── FlowEdge.tsx                # SVG path + particles via <animateMotion>
│   │   ├── EdgeLabel.tsx
│   │   ├── Background.tsx              # dot pattern
│   │   ├── Controls.tsx                # zoom/fit/lock
│   │   └── MiniMap.tsx                 # custom coloured rects
│   │
│   ├── ComponentsPanel/
│   │   ├── Aside.tsx
│   │   ├── Search.tsx
│   │   ├── Stencils.tsx
│   │   ├── Group.tsx                   # CollapsibleGroup wrapper
│   │   ├── PrimitiveButton.tsx         # draggable button
│   │   └── ExpandCollapse.tsx
│   │
│   ├── dialogs/
│   │   ├── FirstRunTemplates.tsx
│   │   ├── Help.tsx
│   │   ├── DiagramSettings.tsx
│   │   ├── ExportDialog.tsx
│   │   ├── CompareArchitecture.tsx
│   │   └── CookieConsent.tsx
│   │
│   └── present/
│       └── PresentMode.tsx             # fullscreen + laser pointer
│
├── styles/
│   └── tailwind.css                    # @import "tailwindcss"; @theme { … }; .dark { … }
│
└── utils/
    ├── pwa.ts                          # registerSW
    ├── plausible.ts                    # window.plausible shim + hash exclusion
    ├── consentMode.ts                  # gtag defaults + replay from consentStore
    └── clipboard.ts                    # copy link / save .gravel
```

## Component tree (one-to-one)

```tsx
<App>
  <Layout>
    <Header>
      <Brand />
      <ToolbarCluster>          {/* left */}
        <FileButton />
        <ToolbarButton kind="select" />
        <ToolbarButton kind="hand" />
        <ToolbarButton kind="draw" />
        <ToolbarButton kind="line" />
        <ToolbarButton kind="arrow" />
        <ExportButton />
        <PresentButton />
      </ToolbarCluster>
      <CenterAutosave />
      <UndoRedo />
      <ToolbarCluster>          {/* right */}
        <CompareButton />
        <FlowModeRadio />
        <PlayPauseToggle />
        <HelpButton />
        <ThemeToggle />
      </ToolbarCluster>
    </Header>

    <SavedLocallyBanner />      {/* dismissible */}

    <main>
      <Canvas>
        <ReactFlow …>
          <Background variant="dots" />
          <Controls />
          <MiniMap nodeColor={…} />
          <ArchNode />
          <FlowEdge />
          <EdgeLabelRenderer>
            <EdgeLabel />
          </EdgeLabelRenderer>
        </ReactFlow>
      </Canvas>
      <ComponentsPanel />
      <DiagramSettingsButton />
    </main>

    <FirstRunTemplatesDialog />   {/* shown once */}
    <HelpDialog />                {/* ? */}
    <DiagramSettingsDialog />     {/* gear */}
    <ExportDialog />              {/* Export */}
    <CompareArchitectureDialog /> {/* Compare */}
    <PresentMode />               {/* Present, fullscreen */}
    <CookieConsentRegion />
  </Layout>
</App>
```

## Particle animation reimplementation

The current site uses SMIL `<animateMotion>`. In React, the cleanest reproduction is:

```tsx
// ui/Canvas/FlowEdge.tsx
import { BaseEdge, getBezierPath, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';

type FlowEdgeData = {
  dur?: number;           // seconds, default 20
  phases?: number[];      // default [0, 0.5]
  dirs?: Array<'forward' | 'reverse'>;  // default ['forward']
  color?: string;         // default '#22d3ee'
  label?: string;         // rides the particle
};

export function FlowEdge({
  id, sourceX, sourceY, targetX, targetY, data,
}: EdgeProps<FlowEdgeData>) {
  const [path, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY });
  const dur = data?.dur ?? 20;
  const phases = data?.phases ?? [0, 0.5];
  const dirs = data?.dirs ?? ['forward'];
  const color = data?.color ?? '#22d3ee';

  return (
    <>
      <BaseEdge id={id} path={path} style={{ stroke: 'var(--color-border-strong)', strokeWidth: 1.5 }} />
      <path d={path} fill="none" stroke="transparent" strokeWidth={22} style={{ cursor: 'pointer' }} />

      <g pointerEvents="none">
        {dirs.flatMap(dir =>
          phases.map((phase, i) => (
            <Fragment key={`${dir}-${i}`}>
              <circle r="3.2" fill={color} data-flow-particle data-phase={phase} data-dir={dir}>
                <animateMotion
                  dur={`${dur}s`}
                  begin={`${-phase * dur}s`}
                  repeatCount="indefinite"
                  keyPoints={dir === 'reverse' ? '1;0' : '0;1'}
                  keyTimes="0;1"
                  calcMode="linear"
                  path={path}
                />
              </circle>
              {data?.label && dir === 'forward' && phase === 0 && (
                <text
                  fontSize={9} fill={color} textAnchor="middle" dy={-7}
                  pointerEvents="none"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {data.label}
                  <animateMotion dur={`${dur}s`} begin="0s" repeatCount="indefinite"
                    keyPoints="0;1" keyTimes="0;1" calcMode="linear" path={path}/>
                </text>
              )}
            </Fragment>
          ))
        )}
      </g>

      <EdgeLabelRenderer>
        {data?.label && (
          <div className="nodrag nopan absolute px-1.5 py-0.5 rounded bg-surface
                          border border-border text-xs"
               style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}>
            {data.label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
```

Pause behaviour: remove `<animateMotion>` from the DOM when paused, re-create it on resume with the same `data-phase` so particles restart at the right offset.

If you need to replace SMIL for compatibility reasons (some browsers deprecate it), use `framer-motion`'s `motionPath`:

```tsx
import { motion } from 'framer-motion';

<motion.circle r="3.2" fill={color} initial={{ offsetDistance: '0%' }}
  animate={{ offsetDistance: '100%' }}
  transition={{ duration: dur, repeat: Infinity, ease: 'linear', delay: -phase * dur }}>
  <motionMotionPath d={path} />
</motion.circle>
```

## Theme handling

```css
/* styles/tailwind.css */
@import "tailwindcss";

@theme {
  --color-bg: #f6f8fb;
  --color-surface: #ffffff;
  --color-surface-2: #eceff4;
  --color-surface-3: #e2e7ee;
  --color-canvas: #eef1f6;
  --color-overlay: #fff;
  --color-fg: #0f141c;
  --color-muted: #54606f;
  --color-faint: #5c6776;
  --color-border: #e1e6ee;
  --color-border-strong: #ccd3df;
  --color-accent: #0e7490;
  --color-accent-hover: #155e75;
  --color-accent-contrast: #ffffff;
  --color-ring: #0e7490;
  --color-success: #15803d;
  --color-warning: #b45309;
  --color-error: #b91c1c;
  --shadow-panel: 0 1px 2px #10141b0f, 0 8px 24px #10141b14;
  --shadow-glow: 0 0 0 1px color-mix(in srgb, #0e7490 35%, transparent), 0 0 18px color-mix(in srgb, #0e7490 45%, transparent);
  --radius-card: .75rem;
  --default-transition-duration: .15s;
  --default-transition-timing-function: cubic-bezier(.4, 0, .2, 1);
}

html.dark {
  --color-bg: #0b0e14;
  --color-surface: #12151d;
  --color-surface-2: #1a1f29;
  --color-surface-3: #232a36;
  --color-canvas: #0a0c12;
  --color-overlay: #161b24;
  --color-fg: #e7eaf0;
  --color-muted: #9aa4b4;
  --color-faint: #8c97a7;
  --color-border: #262c38;
  --color-border-strong: #3a4252;
  --color-accent: #22d3ee;
  --color-accent-hover: #67e8f9;
  --color-accent-contrast: #04141a;
  --color-ring: #22d3ee;
  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-error: #f87171;
}
```

```tsx
// ui/ThemeToggle.tsx
const theme = useUiStore(s => s.theme);
useEffect(() => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}, [theme]);
```

## Share link encoding

```ts
// domain/share.ts
import LZString from 'lz-string';

export function encodeShareLink(graph: Graph): string {
  const json = JSON.stringify(graph);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return `${location.origin}${location.pathname}#d=${compressed}`;
}

export function decodeShareLink(): Graph | null {
  const m = location.hash.match(/^#d=(.+)$/);
  if (!m) return null;
  try {
    const json = LZString.decompressFromEncodedURIComponent(m[1]);
    return JSON.parse(json);
  } catch {
    return null;
  }
}
```

## Cloud icon catalog

Convert the bundled catalog to a JSON file served at `/assets/cloud-catalog.json`:

```json
[
  { "id": "aws-amazon-api-gateway", "label": "Amazon API Gateway", "provider": "aws",
    "group": "Networking & Content Delivery", "kind": "service",
    "file": "icons/aws/amazon-api-gateway.svg" }
]
```

In Vite, you can keep the dynamic import (`cloudCatalogFull-*.js`) so the bundle code-splits naturally. Vite's `import.meta.glob('/assets/icons/*.svg', { eager: false, as: 'url' })` gives you the URL for any icon without bundling all of them.

## Accessibility checklist

- All toolbar buttons have `aria-label` (verified on the live site).
- The canvas is `role="application"` (xyflow default).
- Radio group has `role="radiogroup"` and `aria-label`.
- Dialogs have `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.
- Cookie banner has `role="region"` + `aria-label="Cookie consent"`.
- Focus trap on dialogs; `Esc` closes.

## Performance budget

Aim for:

- Initial JS: <300 KB gzipped (current site is ~250 KB gzipped).
- Cloud catalog: lazy-loaded only when the user opens a cloud section.
- jsPDF: lazy-loaded only on PDF export.
- LCP < 1.5 s on a fast 3G connection (the current site achieves this).

## Verification

After building, you can compare against the live site by:

1. Side-by-side screenshots at 1280×800 and 420×820 — should be visually indistinguishable.
2. Drop the same 9 nodes, connect the same 9 edges, and confirm the 22 particles appear.
3. Toggle theme — confirm all `--color-*` tokens flip.
4. Copy link → paste in private window → diagram loads identically.
5. Run Lighthouse — should score 95+ on Performance, Accessibility, Best Practices.