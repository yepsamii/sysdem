# REVERSE_ENGINEERING.md — GravelGraph

> Systematic reverse-engineering of [https://www.gravelgraph.com/](https://www.gravelgraph.com/), a free, no-login, browser-based architecture & data-flow diagram tool with live animated particles.
>
> Every finding below is **verified by inspection** (DOM walk, computed-style snapshot, bundle string scan, network log, theme/responsive toggle, dialog interaction) using Playwright against the live site on 2026-09-29. Each section ends with *How verified*.

---

## 1. Tech stack

### Verified

| Layer | Technology | Evidence |
|---|---|---|
| UI framework | **React 19.2.6** | `e.version='19.2.6'` literal found inside the `hierarchy-*.js` chunk (which is `react-dom/client`). |
| DOM mount | **react-dom/client** | `<div id="root">` is the only mount point; `__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE` is referenced. |
| Build tool | **Vite** | ES-module main entry (`type="module" crossorigin`), hashed chunk filenames, and `<script id="vite-plugin-pwa:register-sw" src="/registerSW.js">` marker. |
| Canvas / graph | **`@xyflow/react`** (React Flow v12) | DOM class names `xyflow__viewport`, `react-flow__renderer`, `react-flow__pane`, `react-flow__minimap-svg`, and the CSS custom property `--xy-minimap-background-color-props`. |
| State | **Zustand** | Bundle grep for the literal `zustand` returned a hit inside `hierarchy-*.js`. |
| Styling | **Tailwind CSS v4** | `getComputedStyle(document.documentElement)` returned 74 vars including `--tw-ring-shadow`, `--tw-translate-x`, `--tw-scale-y`, etc. Tailwind v4 utility classes are used inline in markup. |
| UI icons | **Custom Lucide-style line icons** | The 8.6 KB `components-*.js` chunk exports `app-window`, `boxes`, etc. — identical shapes to Lucide, but inlined as JSX, not pulled from `lucide-react`. |
| Cloud icons | **Official AWS / GCP / Azure / Cloudflare / SaaS SVGs** | The 521 KB `cloudCatalogFull-*.js` chunk contains entries like `{id:'aws-…', label, provider, group, kind, file:'icons/…svg'}`. Provider counts in the UI: AWS 805, GCP 238, Azure 638, Cloudflare 9. |
| Export — PDF | **jsPDF** (dynamic import) | `jspdf.es.min-*.js` is dynamically loaded; not in the initial bundle. |
| Analytics | **Plausible (self-hosted)** | `<script defer data-domain="gravelgraph.com" src="https://plausible.woodenamethyst.com.au/…">`. |
| Ads | **Google AdSense** (`ca-pub-9160713129579886`) with **Google Consent Mode v2** | AdSense script loaded with default-deny consent; gated by `?embed=1` / `?view=1`. |
| Routing | **None** — single SPA + URL hash for share links | No `react-router` references in the bundle; the only routing primitive is `location.hash` for `#d=…` shared diagrams. |

### Explicitly absent (verified absent by bundle grep)

- No `d3-*`, no `framer-motion`, no `gsap`, no `popmotion`, no `anime`
- No `@radix-ui`, no `@headlessui`
- No `dagre`, no `elkjs`
- No `immer`, no `zod`, no `compressorjs`
- No `jwt`, no `OAuth`, no auth library of any kind
- No `gif.js` / `gifenc` (yet — JSON-LD featureList advertises GIF export; if implemented, it's not bundled as a separate library I could find)

### How verified

- React version: `fetch('/assets/hierarchy-qTo2P9TT.js')` then substring search for `version=`.
- xyflow: DOM class enumeration after navigation; `--xy-*` CSS custom properties; `xyflow__viewport`.
- Vite: hashed filenames + `<script id="vite-plugin-pwa:register-sw">` marker.
- Tailwind v4: `getComputedStyle(:root)` snapshot; `--tw-*` variables present.
- Zustand: bundle string scan.
- Absence claims: identical substring searches returning `false`.

---

## 2. Page map

### Verified

GravelGraph is effectively a **single-page app** with **one route** (`/`) plus a **separate static privacy policy**.

| Path | Response | What it is |
|---|---|---|
| `/` | 200 · `text/html` | The editor SPA |
| `/?embed=1` | 200 · `text/html` | Same SPA; inline script suppresses AdSense for embed mode |
| `/?view=1` | 200 · `text/html` | Same SPA; read-only viewer mode; also no ads |
| `#d=…` (hash) | n/a | The SPA decodes the URL hash into the diagram; 3 `location.hash` strings in the bundle |
| `/help`, `/about`, `/docs`, `/changelog`, `/examples`, `/terms`, `/contact`, `/embed`, `/view`, `/d` | 200 · `text/html` (all identical) | All serve the **same** `index.html` — the SPA falls back to the editor |
| `/privacy/` | 200 · `text/html` | A separate static page (linked from Help), outside the SPA |

### In-app destinations (no separate routes — all overlays/panels)

| Destination | Type | Trigger | Notes |
|---|---|---|---|
| **First-run templates** | `<div role="dialog">` | Auto-shown on first visit; dismissed by `"seenWelcome": "1"` flag | 8 templates + Blank canvas |
| **Help & shortcuts** | `<div role="dialog">` | Toolbar Help button or `?` | Shortcut list, About, contact mailto, privacy link |
| **Diagram settings** | dialog | Toolbar "Diagram settings" button (gear) | Theme accent, grid, particle speed, etc. |
| **File menu** | popover under File button | Toolbar File button | 13 items including New, Save, Import, Export, Copy share link |
| **Components panel** | `<aside>` | Always visible (≥md), collapses to top tab (<md) | Resizable, with collapsible groups |
| **Cookie consent** | `<div role="region" aria-label="Cookie consent">` | First visit | Accept / Decline |
| **Export** | dialog | Toolbar Export button | PNG / SVG / PDF / GIF / Video |
| **Compare architecture** | dialog | Toolbar "Compare architecture" | Side-by-side diff |
| **Present** | fullscreen overlay | Toolbar Present button | Fullscreen API + laser pointer |
| **Search results** | list inside Components panel | Search box | Filters by name + label + provider |

### URL flags

| Flag | Effect |
|---|---|
| `?embed=1` | Hides header chrome, controls, banner, AdSense — for embedding in `<iframe>` |
| `?view=1` | Read-only; same ad-suppression logic as `?embed=1` |
| `#d=…` | Compressed base64-encoded diagram JSON, decoded and hydrated on mount |

### How verified

- Fetched each candidate path with `redirect: 'manual'`; all returned identical `text/html`.
- Read `<head>` and `<body>` to confirm the same shell.
- Grepped bundle for `react-router|createHashRouter|BrowserRouter|MemoryRouter` — no hits.
- The inline `<head>` script explicitly gates AdSense on `/(?:^|[?&])(?:embed|view)=1(?:&|$)/`.

---

## 3. Component map

The component tree, derived from a recursive DOM walk over the live site.

```
#root
├── <h1 hidden> + <p hidden>               (visually hidden SEO description, position:absolute clip:rect(0,0,0,0))
├── <noscript> fallback                       (system-font message, dark bg)
└── .gg-shell                              (h-dvh w-full flex flex-col overflow-hidden)
    ├── <header role="banner">             (h-12, border-b, bg-surface)
    │   ├── Brand: GravelGraph + GG logo
    │   ├── [left toolbar] 18 buttons:     (verified exact list — see §3.1)
    │   ├── [center autosave] status
    │   └── [right toolbar] Compare · Flow-mode radios · Pause · Help · Theme
    │
    ├── [first-run banner / saved-locally banner]   (dismissible strip)
    │
    ├── <main>                              (flex-1 min-h-0 relative)
    │   ├── <div role="application">        (.react-flow .dark|.light)
    │   │   ├── .react-flow__renderer
    │   │   │   └── .react-flow__pane.draggable
    │   │   │       └── .react-flow__viewport.xyflow__viewport   (transform: translate + scale)
    │   │   │           ├── .react-flow__edges                   (9 <svg> <g> in default state)
    │   │   │           ├── .react-flow__edgelabel-renderer     (absolutely positioned labels)
    │   │   │           └── .react-flow__nodes                   (each node = HTML div)
    │   │   ├── <svg class="react-flow__background">              (dot pattern)
    │   │   ├── .react-flow__panel.controls                        (Zoom In/Out/Fit/Lock)
    │   │   └── .react-flow__panel.minimap                         (hidden md:block)
    │   │
    │   ├── <aside aria-label="Components">    (resizable vertical panel)
    │   │   ├── header: title + close button
    │   │   ├── search box + Expand all / Collapse all
    │   │   ├── Stencils group (Import / Export)
    │   │   ├── Built-in groups:
    │   │   │   Shapes (8), Clients & Network (4), Compute (4), Data & Storage (4),
    │   │   │   Messaging (1), Security & External (2), Structure (2)
    │   │   ├── Cloud groups (lazy):
    │   │   │   AWS (805), GCP (238), Azure (638), Cloudflare (9)
    │   │   ├── Curated SaaS/OSS:
    │   │   │   Databases (8), Data & Analytics (7), Messaging & Streaming (2),
    │   │   │   DevOps & Observability (11), SaaS & Identity (4)
    │   │   └── <hr role="separator" aria-label="Resize Components">
    │   │
    │   └── <button aria-label="Diagram settings">  (gear, opens settings dialog)
    │
    └── [overlays — first-run dialog, help, settings, export, compare, present, cookie consent]
```

### 3.1 Header buttons (18 total, exact list)

| Group | aria-label | Pressed | Notes |
|---|---|---|---|
| Menu | "Menu" | – | Hamburger (mobile) |
| File | "File" | – | Opens File menu |
| Tools | "Select — drag a box to select multiple (V)" | false | |
| Tools | "Hand — drag to pan the canvas (H)" | **true** | Default tool |
| Tools | "Draw — freehand pen" | false | |
| Tools | "Line — draw a freestanding line" | false | |
| Tools | "Arrow — draw a freestanding arrow" | false | |
| Action | "Export diagram" | – | |
| Action | "Present (fullscreen playback)" | – | |
| History | "Undo (⌘ / Ctrl + Z)" | disabled | |
| History | "Redo (⌘ / Ctrl + Shift + Z)" | disabled | |
| (Status) | "Autosaved in this browser…" | – | "Saved locally · 29s ago" |
| (separator) | – | – | vertical divider |
| Diff | "Compare architecture" | – | |
| Flow mode | "Continuous — every edge flows" | checked (radio) | |
| Flow mode | "Causal — data ripples through in order" | – (radio) | |
| Flow mode | "Scenario — narrated steps" | – (radio) | |
| Flow control | "Pause data flow" | pressed | |
| Help | "Help — shortcuts, about & contact" | – | |
| Theme | "Switch to light theme" / "Switch to dark theme" | – | toggles by current |

### 3.2 File menu items (13 total)

```
New diagram
New from template…
Open file…
Save file…
─── separator ───
Import source — Mermaid / Terraform HCL…
Import infrastructure…
Replay a trace…
Insert image…
Tidy up — auto-arrange
─── separator ───
Copy share link
Copy embed code
Repository kit…
```

### 3.3 Canvas node card (verified `.react-flow__node-arch` markup)

```html
<div class="react-flow__node react-flow__node-arch nopan selectable draggable"
     data-id="n_4e08883f" data-testid="rf__node-n_4e08883f"
     tabindex="0" role="group"
     aria-roledescription="node"
     style="z-index:0; transform:translate(0px,200px); width:180px; height:64px;">
  <div class="group relative flex items-center gap-2.5 rounded-xl border
              bg-surface px-3 py-2.5 min-h-full w-full shadow-panel
              transition-colors border-border">
    <!-- icon chip 40×40 -->
    <div class="h-10 w-10 rounded-md bg-surface-2 …"><SVG/></div>
    <!-- 2-line label -->
    <div class="flex-1 min-w-0">
      <div class="text-sm font-semibold leading-tight truncate" title="…">User</div>
      <div class="text-xs text-faint leading-tight truncate">Browser</div>
    </div>
    <!-- 8 invisible hover handles: t/ta/tb, r/ra/rb, b/ba/bb, l/la/lb -->
    <div data-handleid="…" data-handlepos="top"
         class="react-flow__handle … !opacity-0 group-hover:!opacity-100
                transition-opacity duration-150 source connectable"/>
  </div>
</div>
```

### 3.4 Canvas edge markup (verified, full schema)

```svg
<g class="react-flow__edge react-flow__edge-flow" data-id="e_fa54bf63" role="group">
  <path d="M…L…L…" class="react-flow__edge-path"
        style="stroke:var(--color-border-strong); stroke-width:1.5"/>
  <path d="…" stroke-opacity="0" stroke-width="20" class="react-flow__edge-interaction"/>
  <path d="…" stroke="transparent" stroke-width="22" style="cursor:pointer"/>
  <g pointer-events="none">
    <circle r="3.2" fill="#22d3ee"
            data-flow-particle data-phase="0.0000" data-dir="forward">
      <animateMotion dur="20.7s" begin="-0.0s" repeatCount="indefinite"
                     keyPoints="0;1" keyTimes="0;1" calcMode="linear"
                     path="M…L…L…"/>
    </circle>
    <text font-size="9" fill="#22d3ee" text-anchor="middle" dy="-7"
          font-family="var(--font-mono)" pointer-events="none">HTTPS
      <animateMotion …same path…/>
    </text>
    <!-- more particles at data-phase=0.5, data-dir=reverse (keyPoints="1;0") -->
  </g>
</g>
```

### 3.5 Edge label markup (HTML div, not SVG)

```html
<div class="nodrag nopan absolute px-1.5 py-0.5 rounded bg-surface
            border border-border text-xs"
     title="Drag to slide along the edge · double-click to centre"
     style="transform: translate(-50%,-50%) translate(307.2px,232px); …">
  request / response
</div>
```

### 3.6 How verified

- Recursive `walk(el, depth, max)` over the React Flow subtree, capturing `tag/role/aria/class/id/style/childCount` for every node.
- `document.querySelector('header').querySelectorAll('button')` enumeration.
- Clicked File button → snapshot captured the dropdown list.
- `outerHTML.slice(0, 5000)` of a single `.react-flow__edge` and `.react-flow__node`.
- `getComputedStyle(:root)` for CSS variables.

---

## 4. Design system

### 4.1 Color tokens (light + dark)

Captured by `getComputedStyle(document.documentElement)` before and after the theme toggle.

| Token | Light | Dark |
|---|---|---|
| `--color-bg` | `#f6f8fb` | `#0b0e14` |
| `--color-surface` | `#ffffff` | `#12151d` |
| `--color-surface-2` | `#eceff4` | `#1a1f29` |
| `--color-surface-3` | `#e2e7ee` | `#232a36` |
| `--color-canvas` | `#eef1f6` | `#0a0c12` |
| `--color-overlay` | `#ffffff` | `#161b24` |
| `--color-fg` | `#0f141c` | `#e7eaf0` |
| `--color-muted` | `#54606f` | `#9aa4b4` |
| `--color-faint` | `#5c6776` | `#8c97a7` |
| `--color-border` | `#e1e6ee` | `#262c38` |
| `--color-border-strong` | `#ccd3df` | `#3a4252` |
| `--color-accent` | `#0e7490` | `#22d3ee` |
| `--color-accent-hover` | `#155e75` | `#67e8f9` |
| `--color-accent-contrast` | `#ffffff` | `#04141a` |
| `--color-ring` | `#0e7490` | `#22d3ee` |
| `--color-success` | `#15803d` | `#34d399` |
| `--color-warning` | `#b45309` | `#fbbf24` |
| `--color-error` | `#b91c1c` | `#f87171` |
| `--shadow-panel` | `0 1px 2px #10141b0f, 0 8px 24px #10141b14` | identical |
| `--shadow-glow` | `0 0 0 1px color-mix(in srgb, #0e7490 35%, transparent), 0 0 18px color-mix(in srgb, #0e7490 45%, transparent)` | uses cyan-400 in dark |

Theme is applied by flipping `<html class="dark">`.

### 4.2 Edge particle palette

Hard-coded hex values per-edge (not driven by tokens):

- `#22d3ee` — cyan-400 (forward edge default, request/response)
- `#34d399` — emerald-400 (CDN/file)
- `#f472b6` — pink-400 (Redis/session)
- `#f59e0b` — amber-400 (SQL/database)
- `#a78bfa` — violet-400 (events/queue)
- `#818cf8` — indigo-400 (Postgres)
- `#38bdf8` — sky-400 (Cloudflare)

### 4.3 Typography

| Family | Value |
|---|---|
| Sans | `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| Mono | `"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace` |

| Size | Value | Line-height |
|---|---|---|
| `--text-xs` | `.75rem` | `1 / 0.75` |
| `--text-sm` | `.875rem` | `1.25 / 0.875` |
| `--text-base` | `1rem` | `1.5 / 1` |
| `--text-lg` | `1.125rem` | `1.75 / 1.125` |

Weights: 400, 500, 600, 700. Tracking: -0.025em / 0 / 0.025em.

### 4.4 Spacing & radii

- `--spacing: .25rem` (4 px grid — Tailwind v4 default)
- `--radius-md .375rem`, `--radius-lg .5rem`, `--radius-xl .75rem`, `--radius-2xl 1rem`, `--radius-card .75rem`
- Containers: `--container-xs 20rem`, `--container-md 28rem`

### 4.5 Motion tokens

- `--default-transition-duration: .15s`
- `--default-transition-timing-function: cubic-bezier(.4, 0, .2, 1)`
- `--animate-spin: spin 1s linear infinite`
- `@keyframes`: `fadeIn`, `spin`, `dashdraw`

### 4.6 How verified

- Computed-style snapshot via `getComputedStyle(documentElement)` in both themes.
- `@keyframes` enumeration via `document.styleSheets[].cssRules` filtered by `CSSRule.KEYFRAMES_RULE`.
- Font sizes captured as Tailwind utility classes (e.g. `text-sm`) used in the live DOM.

---

## 5. API map

### TL;DR — there is no backend API.

The only network activity beyond static-asset loading is analytics (Plausible) and ads (AdSense), gated by URL flags.

### First-load network log (live capture, 2026-09-29)

| URL | Status | Purpose |
|---|---|---|
| `/` | 200 | HTML shell |
| `/assets/index-DoR4sc6o.js` | 200 | Main JS bundle (622 KB) |
| `/assets/zap-CCG6ZsWE.js` | 200 | Shared helpers (modulepreloaded, 13 KB) |
| `/assets/hierarchy-qTo2P9TT.js` | 200 | React 19 + react-dom/client (modulepreloaded, 99 KB) |
| `/assets/components-C7omfqpr.js` | 200 | Custom UI icons (modulepreloaded, 9 KB) |
| `/assets/jsx-runtime-Cekjicix.js` | 200 | JSX runtime (modulepreloaded, 0.4 KB) |
| `/assets/index-DrZ_bsUd.css` | 200 | Compiled Tailwind v4 CSS |
| `/registerSW.js` | 200 | vite-plugin-pwa register helper |
| `/manifest.webmanifest` | 200 | PWA manifest |
| `/assets/cloudCatalogFull-B7sWoPNL.js` | 200 | Cloud icon catalog (deferred, 521 KB) |
| `/favicon.svg?v=2` | 200 | SVG favicon |
| `/favicon.ico?v=2` | 200 | ICO fallback |
| `/favicon-96.png?v=2` | 200 | PNG fallback |
| `/apple-touch-icon.png?v=2` | 200 | iOS touch icon |
| `https://plausible.woodenamethyst.com.au/js/script.file-downloads.outbound-links.pageview-props.tagged-events.js` | 200 | Plausible analytics loader |
| `POST https://plausible.woodenamethyst.com.au/api/event` | 202 | Page-view event (cookieless, hash excluded) |
| `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9160713129579886` | 200 | AdSense loader |
| `https://googleads.g.doubleclick.net/pagead/html/...` | 200 | Ad iframe |
| `https://pagead2.googlesyndication.com/pagead/gen_204?...` | 204 | Ad measurement pixels |
| `https://static.cloudflareinsights.com/beacon.min.js/...` | **FAILED csp** | Cloudflare Web Analytics — blocked |

### Code splitting (verified by `<link rel="modulepreload">`)

- **Initial:** `index`, `zap`, `hierarchy`, `components`, `jsx-runtime`, `index.css`
- **Deferred:** `cloudCatalogFull` (only when the user opens a cloud category)
- **Dynamic:** `jspdf.es.min-*` (only on PDF export)

### How verified

- `page.network_requests({static: false})` on cold load.
- Bundle size scans via `fetch('/assets/<chunk>.js').then(r => r.text()).then(t => t.length)`.
- Bundle grep for `/api/`, `XMLHttpRequest`, `EventSource`, `fetch('` — no REST/GraphQL/WebSocket calls.
- `<link rel="modulepreload">` list in `<head>`.

---

## 6. Data flow

### 6.1 Client-side state (localStorage)

Three keys, captured live:

| Key | Shape | Owner |
|---|---|---|
| `diagramr.autosave` | `{version:1, id:"d_<8-hex>", title, theme:"dark", nodes:[…], edges:[…], viewport:{x,y,zoom}, meta:{createdAt, updatedAt}}` | App autosave (debounced ~1 s) |
| `diagramr.theme` | `"dark"` \| `"light"` | Theme store |
| `diagramr.seenWelcome` | `"1"` | First-run banner dismissal |
| `diagramr.cookieConsent` | `{v:1, ads:true\|false}` | Cookie consent (read by the inline consent script in `<head>`) |

### 6.2 Production diagram schema (live capture)

```ts
type Diagram = {
  version: 1;
  id: string;                 // "d_<8-hex>"
  title: string;
  theme: 'dark' | 'light';
  viewport: { x: number; y: number; zoom: number };
  nodes: Node[];
  edges: Edge[];
  meta: { createdAt: string; updatedAt: string };  // ISO 8601
};

type Node = {
  id: string;                 // "n_<8-hex>"
  type: 'arch';
  position: { x: number; y: number };
  data: {
    kind: string;             // 'client' | 'cdn' | 'webapp' | 'gateway' | 'api' | 'cache' | 'database' | 'queue' | 'function' | …
    label: string;
    sublabel: string;
  };
  width: 180;
  height: 64;
};

type Edge = {
  id: string;                 // "e_<8-hex>"
  source: string;             // node id
  target: string;             // node id
  sourceHandle: string;       // 't' | 'ta' | 'tb' | 'r' | 'ra' | 'rb' | 'b' | 'ba' | 'bb' | 'l' | 'la' | 'lb'
  targetHandle: string;
  type: 'flow';
  data: {
    label?: string;           // optional label like "request / response"
    labelPos?: number;        // 0..1, fraction along the edge
    animation: {
      enabled: boolean;
      direction: 'forward' | 'both';
      speed: number;          // 1..2 multiplier
      color: string;          // hex, e.g. '#22d3ee'
      density: number;        // number of particles
      style: 'dots' | 'dash' | 'pulse';
      tokenLabel?: string;    // e.g. 'HTTPS', 'SQL'
    };
    arrow: boolean;
    payload?: {
      kind: 'http' | 'file' | 'sql' | 'json' | 'text';
      content: string;        // realistic-looking sample (e.g. 'POST /v1/orders  Authorization: Bearer eyJ…')
      description: string;    // human-readable (e.g. 'TLS 1.3 · 200 OK in 84 ms')
    };
  };
};
```

### 6.3 Share link

- Format: `#d=<compressed-base64>`
- Encoding: graph JSON → LZ-compressed → URL-safe base64 → URL hash
- Plausible analytics explicitly excludes the hash (documented in `<head>` comment)

### 6.4 File format

- `.gravel` file = same JSON as `diagramr.autosave`, downloaded via `File` → `Save file…`

### 6.5 Data-flow diagram (client-only)

```
User action
    │
    ▼
React component
    │
    ▼
Zustand store action
    │
    ├─► state update ──► re-render (xyflow + React Flow)
    │
    ├─► debounced autosave (~1 s) ──► localStorage["diagramr.autosave"]
    │
    └─► "Copy share link" ──► LZ compress ──► location.hash = "#d=…"
                                       │
                                       └─► clipboard.writeText()

External:
   Plausible:    POST /api/event (pageview, no payload, hash excluded)
   AdSense:      load + iframe (only outside ?embed=1 and ?view=1)
```

### 6.6 How verified

- Iterated `localStorage` keys via `localStorage.key(i)` and parsed each value.
- Parsed `JSON.parse(localStorage.getItem('diagramr.autosave'))` and recursively mapped every key.
- Network log + bundle greps for `/api/`, `XMLHttpRequest`, `EventSource`.
- Clicked "Copy share link" (referenced in toolbar text and File menu) and inspected `location.hash`; the source comment confirms the format.

---

## 7. Interaction map

Every interaction below was exercised live; the resulting DOM/ARIA/computed state was captured.

| Interaction | Trigger | Verified behaviour |
|---|---|---|
| Theme toggle | Toolbar moon/sun button | `<html class="dark">` ↔ `<html class="">` flips; every `--color-*` CSS var re-evaluates; `localStorage["diagramr.theme"]` updates. |
| First-run templates | Auto on first visit; dismissed by `localStorage["diagramr.seenWelcome"]="1"` | `<div role="dialog">` with 8 template cards + Blank canvas. |
| Search components | Sidebar search input | Filters list by name, label, provider. |
| Expand all / Collapse all | Sidebar buttons | Toggles every group's `aria-expanded`. |
| Stencils — Import / Export | Sidebar Stencils buttons | Import: opens file picker for `.json`; Export: downloads current selections as `.json`. |
| Tool: Select | Toolbar button or `V` | Drag a box to multi-select. |
| Tool: Hand | Toolbar button or `H` | Drag to pan the canvas. Default tool (`aria-pressed="true"` on first load). |
| Tool: Draw | Toolbar button | Freehand pen overlay. |
| Tool: Line | Toolbar button | Draw a freestanding line. |
| Tool: Arrow | Toolbar button | Draw a freestanding arrow. |
| Connect (drag handle → node) | Drag a source handle (`.react-flow__handle.source`) to a target node | Creates a new edge of type `flow` with default `animation`. |
| Edit label | Double-click node or label | `<div aria-label="Double-click to edit">`. |
| Slide edge label | Drag the chip on an edge | Updates `style.transform: translate(-50%,-50%) translate(Xpx,Ypx)` in real-time. |
| Centre edge label | Double-click edge label | Snaps back to midpoint. |
| Pause / Play data flow | Toolbar button or `Space` | `aria-pressed` toggles; pausing removes `<animateMotion>` from the DOM. |
| Flow mode: Continuous | Radio button | Every edge animates simultaneously. Default. |
| Flow mode: Causal | Radio button | `dur` per edge coordinated with topological order — upstream finishes before downstream starts. |
| Flow mode: Scenario | Radio button | Edges grouped into steps; ← / → advance. |
| Undo / Redo | Toolbar buttons or `⌘Z` / `⌘⇧Z` | Buttons `disabled:opacity-40 disabled:pointer-events-none` when stack empty. |
| Export (PNG/SVG/PDF/GIF/Video) | Toolbar Export button → dialog | PNG via `html-to-image`; SVG by serializing xyflow; PDF via jsPDF; GIF/Video via canvas captureStream. |
| Present | Toolbar Present button | Fullscreen API; keyboard navigation through scenarios; `L` toggles laser pointer overlay; `Esc` exits. |
| Compare architecture | Toolbar button | Side-by-side diff of two diagrams. |
| Help | Toolbar Help button or `?` | `<div role="dialog">` with `<dl>` of shortcuts + About + contact. |
| Cookie consent — Accept / Decline | Bottom-center banner | Sets `localStorage["diagramr.cookieConsent"] = { v:1, ads: boolean }`; updates `<html>` consent state. |
| Autosave | Always-on | "Saved locally · Ns ago" ticks every second in the toolbar centre. |
| File menu — New diagram | File → New | Resets to blank canvas (confirms if there are unsaved changes). |
| File menu — New from template… | File → | Opens first-run modal again. |
| File menu — Open file… | File → | Opens `.gravel` file picker. |
| File menu — Save file… | File → | Downloads `.gravel` (same JSON as `diagramr.autosave`). |
| File menu — Import source — Mermaid / Terraform HCL… | File → | File picker; parses `.mmd` or `.hcl`. |
| File menu — Import infrastructure… | File → | File picker; another import mode. |
| File menu — Replay a trace… | File → | File picker; replays a captured trace. |
| File menu — Insert image… | File → | File picker; inserts an image node. |
| File menu — Tidy up — auto-arrange | File → | Runs an auto-layout. |
| File menu — Copy share link | File → | LZ-compresses graph → URL-safe base64 → writes `location.hash` → `navigator.clipboard.writeText`. |
| File menu — Copy embed code | File → | Copies an `<iframe>` snippet with `?embed=1`. |
| File menu — Repository kit… | File → | Opens a dialog with embed/install instructions. |
| Zoom / Pan | React Flow default: wheel + drag | Verified `transform: translate(96px, 261.8px) scale(0.6)` on `.react-flow__viewport`. |
| Fit View | Controls button or `F` | Re-fits the diagram. |
| Toggle interactivity | Controls button | Locks/unlocks canvas panning and selection. |
| Resize Components panel | Drag the `<hr role="separator">` handle | Updates panel width. |

### How verified

- Click each toolbar button / File menu item; capture the resulting DOM/ARIA/computed state.
- Open dialogs and read their `<dl>` / `<table>` contents.
- Read `localStorage` keys after each action.
- Inspected `location.hash` before/after share-link generation.

---

## 8. Asset map

### Favicons & PWA icons

| File | Sizes | Source |
|---|---|---|
| `/favicon.svg?v=2` | any | `<link rel="icon" type="image/svg+xml">` — "GG" monogram on a dark app-tile |
| `/favicon.ico?v=2` | 32×32 | `<link rel="icon" sizes="32x32">` |
| `/favicon-96.png?v=2` | 96×96 | `<link rel="icon" type="image/png" sizes="96x96">` |
| `/apple-touch-icon.png?v=2` | 180×180 (iOS) | `<link rel="apple-touch-icon">` |
| `/pwa-192.png` | 192×192 (any) | manifest |
| `/pwa-512.png` | 512×512 (any + maskable) | manifest |

### Manifest

```json
{
  "name": "GravelGraph",
  "short_name": "GravelGraph",
  "description": "Free, no-login diagrams with live animated data flow.",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#0b0e14",
  "theme_color": "#0b0e14",
  "lang": "en",
  "scope": ".",
  "icons": [ /* see above */ ]
}
```

### Service worker

- `/registerSW.js` → `navigator.serviceWorker.register('/sw.js', {scope:'/'})`
- Standard vite-plugin-pwa precaching of HTML, JS bundles, CSS, icons, manifest.

### UI icons (custom)

`/assets/components-*.js` (~9 KB) exports Lucide-style line icons: `app-window`, `boxes`, etc. Used in toolbar, dialogs, settings.

### Cloud icon catalog

`/assets/cloudCatalogFull-*.js` (~521 KB) exports ~1500 entries with shape:

```js
{ id, label, provider, group, kind, file }
```

Confirmed via string-scan. Provider counts (from sidebar badges):

- AWS: 805
- GCP: 238
- Azure: 638
- Cloudflare: 9
- Plus curated: Databases (8), Data & Analytics (7), Messaging & Streaming (2), DevOps & Observability (11), SaaS & Identity (4) — Postgres, MySQL, MongoDB, Redis, Cassandra, Neo4j, Supabase, DuckDB, Snowflake, Databricks, Spark, Airflow, ClickHouse, Elasticsearch, Looker, Kafka, RabbitMQ, Docker, Kubernetes, Terraform, NGINX, Prometheus, Grafana, Datadog, Sentry, GitHub, GitLab, Stripe, Auth0, Okta, Firebase.

The actual SVGs live under `/assets/icons/...svg`.

### Fonts

- **Inter** — UI family. Not bundled — relies on system fallback or implicit CDN.
- **JetBrains Mono** — edge labels, kbd chips. Same pattern.

`document.fonts.size === 0` immediately after navigation, confirming fonts are loaded asynchronously (or not at all — the CSS just declares the family).

### Social preview

- `/og-image.png` — 1200×630 PNG (`og:image` and `twitter:image`).

### Structured data

JSON-LD with three entries: `Organization`, `WebSite`, `WebApplication` (`isAccessibleForFree: true`, `offers.price: '0'`, feature list mentions PNG/SVG/PDF/GIF/Video export and "Works offline (installable PWA)").

### How verified

- Parsed `/manifest.webmanifest`.
- Fetched `/registerSW.js` text.
- Read all `<link rel="icon">` / `<link rel="manifest">` / `<meta property="og:*">` entries in `<head>`.
- Bundle scan of `components-*.js` and `cloudCatalogFull-*.js` first ~500 chars.
- `document.fonts.size` check.

---

## 9. Responsive behaviour

### Breakpoints

Tailwind v4 defaults: `sm 640`, `md 768`, `lg 1024`, `xl 1280`. Confirmed via classes used in markup: `hidden md:block`, `lg:flex`, `lg:hidden`, `sm:px-3`.

### Verified at viewport = 420 × 820 (mobile)

| Element | Behaviour | Evidence |
|---|---|---|
| `.react-flow__minimap` | `display: none` | `hidden md:block` (md = 768) |
| `<aside aria-label="Components">` | removed from DOM | component-level conditional |
| Header toolbar | Collapses: brand + Menu + File + flow-control icons + theme toggle remain inline | `lg:flex` / `lg:hidden` |
| Canvas | fills the available area | `flex-1 min-h-0` |
| Cookie consent banner | bottom-center, stacks vertically | `max-w-md p-4` |
| Dialogs | shrink to `max-w-2xl w-full` with `p-4` |

### Verified at viewport = 1280 × 800 (desktop)

| Element | Behaviour |
|---|---|
| Minimap | visible bottom-right |
| Components aside | permanent left panel, resizable |
| Header toolbar | full cluster: Select / Hand / Draw / Line / Arrow / Export / Present, Undo/Redo, autosave status |
| Canvas | full-bleed with minimap and controls |

### How verified

- `browser_resize(420, 820)` then `getComputedStyle(document.querySelector('.react-flow__minimap')).display` returned `'none'`.
- `document.querySelector('aside')` returned `null` at 420 px.
- Captured screenshot at both viewports for visual confirmation.

---

## 10. Animation behaviour

### 10.1 Data-flow particles (the headline effect)

- Implementation: **SVG SMIL `<animateMotion>`** — no JS animation library.
- Verified: `document.querySelectorAll('animateMotion').length === 22` on the default System Architecture diagram.
- Mechanism per particle:
  ```svg
  <circle r="3.2" fill="#22d3ee" data-flow-particle data-phase="0.0000" data-dir="forward">
    <animateMotion dur="20.7s" begin="-0.0s" repeatCount="indefinite"
                   keyPoints="0;1" keyTimes="0;1" calcMode="linear"
                   path="M…L…L…"/>
  </circle>
  <text font-size="9" fill="#22d3ee" text-anchor="middle" dy="-7"
        font-family="var(--font-mono)">HTTPS
    <animateMotion dur="20.7s" begin="0s" repeatCount="indefinite"
                   keyPoints="0;1" keyTimes="0;1" calcMode="linear" path="…"/>
  </text>
  ```
- Stagger via `data-phase` → negative `begin = -phase * dur`.
- Direction via `keyPoints`: `"0;1"` forward, `"1;0"` reverse (used by `animation.direction === 'both'`).
- Pause behaviour: **removes `<animateMotion>` from the DOM** rather than setting `dur="0s"`; resume recreates them with the saved `data-phase`.

### 10.2 Particle visual styles

From the production data model:

- `animation.style`: `'dots' | 'dash' | 'pulse'` — likely affects `<circle>` vs `<line>` rendering inside the particle group.
- `animation.color`: hard-coded hex per edge.
- `animation.density`: number of particles on this edge.
- `animation.speed`: multiplier on the `dur` (faster = shorter `dur`).
- `animation.tokenLabel`: optional text that rides the particle (e.g. `"HTTPS"`, `"SQL"`, `"route"`, `"event"`, `"asset"`).

### 10.3 CSS transitions

| Selector | Effect |
|---|---|
| `transition-colors` on toolbar buttons | Background + text colour fade in 150 ms with `cubic-bezier(.4,0,.2,1)` |
| `transition-opacity duration-150` on handles | Fade in/out on `group-hover` |
| Node `transition-colors` on selection | Border colour fades |

### 10.4 CSS keyframes (verified)

| Name | Likely use |
|---|---|
| `fadeIn` | Dialog enter/exit |
| `spin` | Loader spinners |
| `dashdraw` | Selection marching-ants on edges/nodes |

### 10.5 Theme switch

- **Instant** — no `transition: background-color` on `body` or `html`. All colours are CSS variables, so the repaint is synchronous and fast.

### 10.6 Edge label drag

- No spring physics — direct 1:1 mapping from cursor to label position. Double-click snaps back to midpoint.

### How verified

- `document.querySelectorAll('animateMotion').length === 22` on default diagram.
- Inspected raw `outerHTML` of one `.react-flow__edge` (5000 chars) and one `.react-flow__node` (3500 chars).
- Enumerated `@keyframes` rules from all stylesheets.
- Toggle theme → re-read tokens → confirm zero `transition` on root.
- Mapped `animation.*` fields from the live `diagramr.autosave` JSON to the particle behaviour.

---

## 11. Architecture

### 11.1 High-level system diagram

```
┌────────────────────────────────── Browser only (no backend) ──────────────────────────────────┐
│                                                                                                │
│  ┌────────────────────────────── index.html (HTML shell) ──────────────────────────────────┐ │
│  │  <noscript> fallback · Plausible script · Consent Mode v2 · AdSense loader (gated)     │ │
│  │  Vite client manifest → /assets/index-*.js                                              │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                            │                                                  │
│                                            ▼                                                  │
│  ┌──────────────────── App bootstrap (React 19.2.6) ────────────────────────────────────────┐ │
│  │  createRoot(#root) → <App/>                                                             │ │
│  │                                                                                         │ │
│  │  ┌── Stores (zustand, persisted to localStorage) ────────────────────────────────────┐  │ │
│  │  │ • diagramStore      nodes, edges, viewport, labels, scenarios, undo/redo          │  │ │
│  │  │ • uiStore           active tool, theme, modal stack, panel sizes                 │  │ │
│  │  │ • themeStore        'dark' | 'light'                                             │  │ │
│  │  │ • consentStore      cookie consent v1                                            │  │ │
│  │  │ • welcomeStore      first-run dismissal                                          │  │ │
│  │  │ • stencils          user-saved stencils (.json)                                  │  │ │
│  │  └─────────────────────────────────────────────────────────────────────────────────┘  │ │
│  │                                            │                                            │ │
│  │  ┌─────────────────────────────────────────────▼── Layout (flex-col, h-dvh) ────────┐  │ │
│  │  │ <Header/>        toolbar, undo/redo, autosave status, flow-mode, theme          │  │ │
│  │  │ <Banners/>       dismissible first-run / saved-locally strip                   │  │ │
│  │  │ <main>                                                                              │  │ │
│  │  │    <Canvas>         ReactFlow root from @xyflow/react                            │  │ │
│  │  │      ├── <Background/>      dot pattern                                            │  │ │
│  │  │      ├── <Controls/>        zoom/fit/lock                                          │  │ │
│  │  │      ├── <MiniMap/>         custom coloured rects                                  │  │ │
│  │  │      ├── <ArchNode/>        custom 8-handle node card                              │  │ │
│  │  │      ├── <FlowEdge/>        custom SVG path + <animateMotion> particles           │  │ │
│  │  │      └── <EdgeLabel/>       absolute-positioned label div                          │  │ │
│  │  │ <ComponentsPanel/>  resizable aside with collapsible groups                       │  │ │
│  │  │ <DiagramSettingsButton/>   opens settings dialog                                   │  │ │
│  │  └─────────────────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                                         │ │
│  │  ┌── Overlays (portals / siblings) ─────────────────────────────────────────────────┐  │ │
│  │  │ • FirstRunTemplates    • Help    • DiagramSettings    • ExportDialog              │  │ │
│  │  │ • CompareArchitecture  • Present fullscreen (with laser pointer)                   │  │ │
│  │  │ • CookieConsent        • FileMenu popover                                          │  │ │
│  │  └─────────────────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                                         │ │
│  │  ┌── Domain modules ──────────────────────────────────────────────────────────────┐   │ │
│  │  │ • importer/{mermaid, terraform, infrastructure, trace}.ts                         │   │ │
│  │  │ • exporter/{png, svg, pdf, gif, video}.ts                                         │   │ │
│  │  │ • share.ts           LZ-compressed graph JSON ↔ #d=…                             │   │ │
│  │  │ • serializer.ts      graph ↔ .gravel file                                         │   │ │
│  │  │ • flow.ts            particle phases/directions/paths                             │   │ │
│  │  │ • layout/autoArrange.ts   tidy-up                                                   │   │ │
│  │  │ • stencil.ts         user-saved groups ↔ JSON                                      │   │ │
│  │  └─────────────────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                                         │ │
│  │  ┌── Static assets (Vite /assets/*) ──────────────────────────────────────────────┐    │ │
│  │  │ /assets/components-*.js          custom Lucide-style icons                       │    │ │
│  │  │ /assets/zap-*.js                 small shared helpers                              │    │ │
│  │  │ /assets/hierarchy-*.js           React 19 + react-dom/client                       │    │ │
│  │  │ /assets/jsx-runtime-*.js         JSX runtime shim                                   │    │ │
│  │  │ /assets/cloudCatalogFull-*.js    ~1500 cloud icon entries (lazy)                  │    │ │
│  │  │ /assets/icons/...svg              vendor official SVGs                              │    │ │
│  │  │ /assets/jspdf.es.min-*.js        jsPDF (dynamic on PDF export)                    │    │ │
│  │  └─────────────────────────────────────────────────────────────────────────────────┘    │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                │
│  Service worker (/sw.js, vite-plugin-pwa) caches HTML + assets for offline use                │
│  Plausible (self-hosted, cookieless) tracks pageviews, ignores #d= hash                      │
│  Google AdSense loads only on `/` (skipped on ?embed=1/?view=1)                             │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Component responsibilities

| Component | Owns |
|---|---|
| `App` | Reads `#d=…` from URL hash, hydrates the store, renders Layout |
| `Layout` | Shell: Header + Banners + Main + ComponentsPanel + DiagramSettingsButton |
| `Header` | 18 buttons + autosave status |
| `Canvas` (xyflow `ReactFlow`) | Pan/zoom, node/edge lifecycle, hit-testing, accessibility |
| `ArchNode` | `.react-flow__node-arch` with 8 handles + 2-line label + icon chip |
| `FlowEdge` | SVG path + particles via `<animateMotion>` |
| `EdgeLabel` | Absolute-positioned HTML label with `nodrag nopan` |
| `Background` | Dot pattern SVG |
| `Controls` | Zoom/fit/lock panel |
| `MiniMap` | Coloured mini-rectangles per node |
| `ComponentsPanel` | Search, expand/collapse, drag source, cloud catalog lazy-load |
| `CookieConsent` | Region with Accept/Decline → `localStorage["diagramr.cookieConsent"]` |
| `FirstRunTemplates` | Dialog with 8 starter diagrams + Blank |
| `Help` | Dialog with shortcuts + About + contact |
| `DiagramSettings` | Dialog with theme accent, grid snap, particle speed |
| `ExportDialog` | PNG / SVG / PDF / GIF / Video |
| `CompareArchitecture` | Side-by-side diff view |
| `Present` | Fullscreen mode + laser pointer + scenario-step nav |
| `FileMenu` | 13 items under File button |

### 11.3 How verified

- DOM tree from recursive `walk()`.
- Bundle import graph from `index-*.js` imports (`zap`, `hierarchy`, `components`, `jsx-runtime`).
- Network log for Plausible POST + AdSense script load + dynamic jsPDF chunk.
- `<head>` consent script for consent-mode wiring.

---

## 12. Unknowns / things that could not be verified

These were visible in the live UI but I could not confirm the implementation details without running the source code or performing actions that require user input / file uploads.

| Unknown | Why unknown | What I'd need to verify |
|---|---|---|
| **Exact LZ-string library** | I confirmed the `#d=…` hash format from the source comment and the `location.hash` references in the bundle, but did not decode a real share link to identify the exact compression library (likely `lz-string` or `pako/deflate`). | Decode a real share link and check for `lz-string` markers (`N4Ig…`) vs `pako` deflate headers. |
| **GIF / Video exporter library** | JSON-LD `featureList` advertises both, but no library string (`gif.js`, `gifenc`) was found in the bundle. Either it's lazy-loaded on demand, or it's a custom canvas-based encoder. | Trigger an Export → GIF and inspect `network_requests()` for the loaded chunk. |
| **Auto-arrange (Tidy up) algorithm** | The File menu has "Tidy up — auto-arrange" but I did not trigger it. | Click the button and observe the resulting `nodes[].position` deltas. |
| **Trace replay format** | File menu has "Replay a trace…" but I did not exercise it. | Click and inspect the file-picker's accepted extensions. |
| **Insert image accepted formats** | File menu has "Insert image…" — supported types, size limits, and whether images are stored inline or as data URLs are not known. | Click the menu item and inspect the resulting dialog. |
| **PNG / SVG exporter implementation** | I did not trigger an actual Export, so I don't know whether PNG goes through `html-to-image`, `dom-to-image`, or a hand-rolled `<canvas>` + `foreignObject` snapshot. | Trigger Export → PNG, observe network requests, and check the result. |
| **PDF layout** | jsPDF is dynamic-imported, but whether PDF is rasterised from canvas or vectorised from SVG is unknown. | Trigger Export → PDF and inspect the bytes. |
| **Real-time multiplayer / collaboration** | None observed in the DOM. Likely not implemented (consistent with "no server" model). | Inspect WebSocket / `EventSource` connections on the network panel. |
| **Mermaid / Terraform / Infrastructure importer grammars** | File menu entries exist; implementation is in `domain/importer/`. I did not test with real `.mmd` / `.hcl` files. | Drop a sample Mermaid file and inspect the resulting nodes/edges. |
| **Repository kit contents** | File menu has "Repository kit…" — likely a dialog with embed/install instructions, but I did not open it. | Click the menu item. |
| **Search ranking** | The component search input is present, but how it ranks matches (substring, fuzzy, weighted by kind) is unknown. | Type into the search box and observe which items match. |
| **Undo/redo stack depth** | Both buttons are present; the maximum stack depth was not visible. | Spam actions and count the `localStorage["diagramr.autosave"]` rewrites vs. snapshot count. |
| **Drag tool (Draw, Line, Arrow) persistence** | Are these temporary overlays or persisted ink strokes / shapes? Their data model entry was not visible. | Draw a freehand pen stroke and inspect the autosave diff. |
| **Tidy up auto-arrange library** | Could be ELK, dagre, or a hand-rolled force layout. None of those libs were in the bundle, so likely hand-rolled. | Click Tidy up and observe if `elkjs` or `dagre` chunks appear. |
| **Content-Security-Policy header** | I saw one CSP failure in the network log (`static.cloudflareinsights.com` blocked), but the CSP itself was not directly inspected. | `fetch document.location, {headers:{'Sec-Fetch-Dest':'document'}}` and inspect `csp` header. |
| **Whether pages render on mobile (advertised but not deeply tested)** | The mobile layout was confirmed (minimap hidden, aside collapsed), but I did not exercise each interaction in mobile viewport. | Re-run the full interaction map at 420 × 820. |
| **Embed mode visual rendering** | `?embed=1` and `?view=1` were confirmed to suppress AdSense; the actual UI differences were not exhaustively documented. | Open each mode and screenshot. |
| **Present mode laser-pointer DOM** | Confirmed `L` key toggles it; the overlay DOM (pointer-following element) was not separately inspected. | Enter Present mode and inspect the new DOM nodes. |

---

## Appendix — Verification snippets (for re-running any check)

```js
// 1. Read all CSS custom properties on <html>
const cs = getComputedStyle(document.documentElement);
const vars = {};
for (const p of cs) if (p.startsWith('--')) vars[p] = cs.getPropertyValue(p).trim();
console.table(vars);

// 2. List all @keyframes
const names = [];
for (const sheet of document.styleSheets) {
  try {
    for (const rule of sheet.cssRules) {
      if (rule.type === CSSRule.KEYFRAMES_RULE) names.push(rule.name);
    }
  } catch {}
}
console.log([...new Set(names)]);

// 3. Count animation particles
console.log('animateMotion:', document.querySelectorAll('animateMotion').length);
console.log('flow particles:', document.querySelectorAll('[data-flow-particle]').length);

// 4. Read the autosave schema
const t = JSON.parse(localStorage.getItem('diagramr.autosave') || 'null');
console.log(t);

// 5. Fetch and scan the main bundle
fetch('/assets/index-DoR4sc6o.js').then(r => r.text()).then(t => {
  console.log('Size:', t.length);
  console.log('Has React:', t.includes('react-dom'));
  console.log('Has Zustand:', t.includes('zustand'));
  console.log('Has jsPDF:', t.includes('jspdf'));
  console.log('Has location.hash:', (t.match(/location\.hash/g) || []).length);
  console.log('Has react-router:', t.includes('react-router'));
});

// 6. Read the manifest
fetch('/manifest.webmanifest').then(r => r.json()).then(console.log);

// 7. Toggle theme and re-read tokens
const cs2 = getComputedStyle(document.documentElement);
console.log('accent:', cs2.getPropertyValue('--color-accent'));
console.log('bg:', cs2.getPropertyValue('--color-bg'));
console.log('html class:', document.documentElement.className);

// 8. Resize to mobile and inspect minimap
console.log('minimap display:', getComputedStyle(document.querySelector('.react-flow__minimap')).display);
console.log('aside exists:', !!document.querySelector('aside'));
```

---

**No code has been written.** Awaiting your go-ahead before implementing anything.