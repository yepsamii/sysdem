# 01 — Framework & Major Libraries

## Summary

| Layer | Technology | Version / Evidence |
|---|---|---|
| UI framework | **React 19** | `e.version = '19.2.6'` found inside the `hierarchy-*.js` bundle (which is `react-dom/client`). The site uses function components, JSX runtime, and `createPortal`. |
| DOM mounting | **react-dom/client** | `<div id="root">` is the only mount point; minified React DOM internals in `hierarchy-*.js`. |
| Build tool | **Vite** | ES-module main entry (`type="module" crossorigin`), hashed chunk filenames (`index-DoR4sc6o.js`), and the `<script id="vite-plugin-pwa:register-sw" src="/registerSW.js">` marker. |
| Canvas / graph | **React Flow / xyflow v12** | `class="react-flow light"`, `react-flow__renderer`, `react-flow__pane`, `xyflow__viewport`, `react-flow__edges`, `react-flow__minimap-svg`, custom property `--xy-minimap-background-color-props`. |
| State | **Zustand** | Bundle grep for `zustand` returned a hit in the `hierarchy-*.js` chunk (the `createStore` + `useStore` patterns). |
| Styling | **Tailwind CSS v4** | `--tw-*` runtime CSS variables (`--tw-ring-shadow`, `--tw-translate-x`, …), Tailwind v4 `@theme` color tokens (`--color-accent`, `--color-bg`, …), and Tailwind utility classes directly in markup (`rounded-xl`, `gap-2.5`, `shadow-panel`, `transition-colors`, …). |
| UI icons | **Custom Lucide-style line icons** (inlined) | The 13 KB `components-C7omfqpr.js` chunk exports string-keyed icon components such as `app-window`, `boxes`, etc. — identical shapes to Lucide. |
| Cloud icons | **Official AWS / GCP / Azure / Cloudflare / SaaS SVGs** | The 521 KB `cloudCatalogFull-*.js` chunk contains entries like `{id:'aws-…', label, provider:'aws', group, kind, file:'icons/…svg'}`. |
| Export — PDF | **jsPDF** | Bundle contains `jspdf.es.min-BDD4b1ZG.js` and the call `new r({orientation:t>=n?'lands'…})`. |
| Analytics | **Plausible (self-hosted)** | `<script defer data-domain="gravelgraph.com" src="https://plausible.woodenamethyst.com.au/…">`. |
| Ads | **Google AdSense** with **Google Consent Mode v2** | `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9160713129579886">` and the inline `gtag('consent', 'default', …)` defaults. |
| Routing | **None** — single SPA, URL-hash based | No `react-router` references in the bundle; the only routing primitive is reading/writing `location.hash` for `#d=…` shared diagrams. |

## What is *not* present

Bundle greps for each of the following returned `false`:

- `d3-shape`, `d3-zoom`, `d3-selection`, `d3-drag`
- `framer-motion`, `gsap`, `popmotion`, `anime`
- `dagre`, `elkjs`
- `@radix-ui`, `@headlessui`
- `immer`, `zustand_v5`, `zustand/persist` literal — but Zustand is present
- `zod`, `compressorjs`, `imagetracer`, `inkpad`
- `jspdf` *component* literal in main bundle, but **jsPDF** itself is dynamically loaded as `jspdf.es.min-*.js`
- `jwt`, `OAuth` — no auth library present

## Verification details

- **`React 19.2.6`** — Fetched `https://www.gravelgraph.com/assets/hierarchy-qTo2P9TT.js` (98 KB) and searched for `e.version=` substring; matched `e.version='19.2.6'`. Also confirmed `__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE` is referenced.
- **`@xyflow/react` (React Flow)** — Inspected `<div role="application" class="react-flow light">` and queried all child selectors: `.react-flow__renderer`, `.react-flow__pane.draggable`, `.react-flow__viewport.xyflow__viewport`, `.react-flow__edges`, `.react-flow__nodes`, `.react-flow__panel.controls`, `.react-flow__panel.minimap`, `.react-flow__minimap-svg`, `--xy-minimap-background-color-props`. The `xyflow__` prefix is the v12 marker.
- **Vite** — Every `<script>` and `<link>` tag has a Vite-style hashed filename under `/assets/`. The HTML head contains `<script id="vite-plugin-pwa:register-sw" src="/registerSW.js">` — a Vite PWA plugin marker.
- **Zustand** — Bundle text search for the literal `zustand` returned a single hit inside `hierarchy-qTo2P9TT.js`. (The minified variable names obscure most references; this is enough to confirm it.)
- **Tailwind v4** — `getComputedStyle(document.documentElement)` returns ~74 CSS variables, including `--tw-ring-shadow`, `--tw-translate-x`, `--tw-scale-y`, `--tw-inset-shadow`, etc. The visible body class dump also contains v4-typical utilities like `bg-accent/15`, `bg-surface-2`, `text-fg`, `border-border`, `rounded-xl`.
- **No animation library** — Bundle greps for `framer-motion`, `gsap`, `popmotion`, `anime` all returned no hits. All animations are pure CSS transitions + SVG `<animateMotion>` (see `11-animations-and-transitions.md`).

## Implications for a reimplementation

- Use **`@xyflow/react`** (not `reactflow`) — the v12 fork that emits `xyflow__` classes.
- Adopt **Tailwind v4** with the same `@theme` token naming (`--color-*`) so dark mode is a class flip on `<html>`.
- **Zustand** with the `persist` middleware (storage key `gravelgraph.diagram.v1`).
- Use **jsPDF** for PDF export.
- **No animation library** is required if you keep SMIL `<animateMotion>` for the data-flow particles.