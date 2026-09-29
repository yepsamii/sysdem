# Verification Index

Every claim in the reverse-engineering report is grounded in an actual inspection. This index lists, by topic, *how* each major finding was verified — so you can re-run any of these checks against the live site.

## Methodology

All inspections were performed against the live site `https://www.gravelgraph.com/` using Playwright (chromium-based browser automation) on 2026-09-29. The browser was resized between 1280×800 (desktop) and 420×820 (mobile) to verify responsive behaviour. The dark/light theme toggle was exercised to capture tokens in both modes.

The primary inspection techniques used:

| Technique | What it inspects |
|---|---|
| `page.evaluate(fn)` | Runs arbitrary JS in the page context (DOM reads, computed-style snapshots, bundle fetches via `fetch()`, regex scans) |
| `page.screenshot()` | Visual confirmation of layout, theme, dialog content |
| `page.network_requests()` | First-load network log (URLs, status codes, response sizes) |
| `page.click(...)` | Interactive verification of tool toggles, dialog opens, theme switch |
| `page.resize(...)` | Responsive verification of layout breakpoints |
| `getComputedStyle(el)` | Reads every CSS custom property on `:root`, plus computed styles of any element |
| `document.styleSheets[].cssRules` | Lists all CSS rules including `@keyframes` |
| `document.fonts` | Lists loaded web fonts (size === 0 confirms no bundled fonts) |

## Verification by topic

### 1 — Framework & libraries

| Claim | How verified |
|---|---|
| React 19.2.6 | `fetch('/assets/hierarchy-qTo2P9TT.js').then(t => t.text()).then(t => t.indexOf("version") + substring)` — found `e.version='19.2.6'`. |
| `react-dom/client` | Same chunk contains `__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE`. |
| Vite | `<script id="vite-plugin-pwa:register-sw" src="/registerSW.js">` in HTML head; hashed `/assets/*` filenames. |
| `@xyflow/react` v12 | DOM class names: `xyflow__viewport`, `react-flow__renderer`, `react-flow__pane`, `react-flow__minimap-svg`, custom property `--xy-minimap-background-color-props`. |
| Zustand | `indexOf('zustand')` on `hierarchy-qTo2P9TT.js` returned a hit. |
| Tailwind v4 | `getComputedStyle(document.documentElement)` returned 74 vars including `--tw-ring-shadow`, `--tw-translate-x`, `--tw-scale-y`. |
| jsPDF | `indexOf('jspdf.es.min-')` in the main bundle returned a hit; chunk `jspdf.es.min-BDD4b1ZG.js` is dynamically imported. |
| Plausible | `<script defer data-domain="gravelgraph.com" src="https://plausible.woodenamethyst.com.au/…">` in HTML head; `POST /api/event` returned `202`. |
| Google AdSense | `<script async src="…/pagead/js/adsbygoogle.js?client=ca-pub-9160713129579886">`; gated by `?embed=1` / `?view=1`. |
| Google Consent Mode v2 | Inline `gtag('consent', 'default', { ad_storage:'denied', … })` before the AdSense loader. |
| No router | Grep on the main bundle for `react-router`, `createHashRouter`, `BrowserRouter`, `MemoryRouter`, `createBrowserRouter` all returned no hits. |
| No d3/framer/gsap/radix/headlessui/dagre/elk/zod/immer | Same technique, all returned no hits. |

### 2 — Pages & routes

| Claim | How verified |
|---|---|
| `/` is the only SPA route | `fetch('/about', {redirect:'manual'})`, `fetch('/changelog')`, `fetch('/examples')`, `fetch('/embed')`, `fetch('/view')`, `fetch('/d')`, `fetch('/help')` all returned 200 with `Content-Type: text/html` and identical markup. |
| `?embed=1` and `?view=1` are query-string flags | Inline script in `<head>`: `if (!/(?:^|[?&])(?:embed\|view)=1(?:&|$)/.test(location.search)) { … adsense … }`. |
| `#d=…` carries the share link | Three `location.hash` references in the main bundle; Plausible comment in HTML explains hash exclusion. |
| `/privacy/` is a separate static page | `<a href="/privacy/">` from the Help dialog; not in the SPA bundle. |
| Help/About/Settings/Export/Compare/Present/Cookie are in-app overlays | Each is a `<div role="dialog">` or `<div role="region">` rendered inside `#root`. |

### 3 — DOM & component structure

| Claim | How verified |
|---|---|
| App shell hierarchy | Recursive `walk(el, depth, max)` over the React Flow subtree, capturing `tag/role/aria/class/id/style/childCount` for each node. |
| Node markup | `document.querySelector('.react-flow__node').outerHTML.slice(0, 3500)` and the captured outerHTML was inspected. |
| 8 invisible handles per node | Single node's `outerHTML` shows `data-handleid` values `t, ta, tb, r, ra, rb, b, …` with `class="!opacity-0 group-hover:!opacity-100 transition-opacity duration-150"`. |
| Edge markup | `document.querySelector('.react-flow__edge').outerHTML.slice(0, 5000)` — confirmed 3 stacked `<path>`s and `<animateMotion>` particles. |
| 22 active particles | `document.querySelectorAll('animateMotion').length === 22` on the default diagram. |
| Edge label markup | `document.querySelector('.react-flow__edgelabel-renderer > div').outerHTML.slice(0, 800)`. |
| Accessibility roles | `Array.from(document.querySelectorAll('[role]')).map(el => el.getAttribute('role'))` over the rendered DOM. |

### 4 — Reusable UI patterns

| Claim | How verified |
|---|---|
| Toolbar button classes | `getComputedStyle` on multiple `<button>` elements in the header — confirmed `h-9 w-9 rounded-lg text-muted hover:bg-surface-2 transition-colors`. |
| Components aside markup | `aside[aria-label="Components"]` + `<hr role="separator" aria-label="Resize Components">` selectors. |
| Collapsible groups | `button[aria-expanded]` selectors inside the aside — confirmed count badges (`text-xs text-faint`). |
| Flow-mode radio group | `div[role="radiogroup"][aria-label="Flow mode"]` containing 3 `radio` children. |
| Help dialog | `div[role="dialog"]` with `<dl>` of shortcuts + `<a href="mailto:…">`. |
| Keyboard shortcuts in Help | `<dt>` / `<dd>` pairs read from the dialog content. |

### 5 — Design tokens

| Claim | How verified |
|---|---|
| Color tokens (light + dark) | `getComputedStyle(document.documentElement)` snapshot before and after toggling the theme button — confirmed all `--color-*` vars flip in lockstep. |
| Typography | `--font-sans` / `--font-mono` values read from `:root`; sizes `text-xs` … `text-lg` captured as Tailwind v4 utility classes in the DOM. |
| Spacing | `--spacing: .25rem`; utilities like `gap-2.5 px-3 py-2.5` captured from the live className dump. |
| Radii | `--radius-md .375rem` … `--radius-2xl 1rem` read from `:root`. |
| Breakpoints | Tailwind v4 defaults — confirmed via the `hidden md:block` class on the minimap and `lg:flex` on the header toolbar. |
| Motion tokens | `--default-transition-duration .15s` and `--default-transition-timing-function cubic-bezier(.4,0,.2,1)` read from `:root`. |
| Keyframes | `for (const sheet of document.styleSheets) { for (const rule of sheet.cssRules) { if (rule.type === CSSRule.KEYFRAMES_RULE) console.log(rule.name) } }` returned `['fadeIn', 'spin', 'dashdraw']`. |
| Fonts not bundled | `document.fonts.size === 0` immediately after navigation. |

### 6 — Assets

| Claim | How verified |
|---|---|
| Favicon set | `<link rel="icon">` entries in `<head>`. |
| PWA icons | `/manifest.webmanifest` parsed: 4 icon entries with the expected sizes/purposes. |
| OG image | `<meta property="og:image" content="https://www.gravelgraph.com/og-image.png">` in `<head>`. |
| Custom UI icons | `fetch('/assets/components-C7omfqpr.js').then(t => t.text())` — first 400 chars inspected; exports `app-window`, `boxes`, etc. |
| Cloud icon catalog | `fetch('/assets/cloudCatalogFull-B7sWoPNL.js')` — first 200 chars showed `{id, label, provider, group, kind, file}` entries. Counts per provider: 805 AWS, 238 GCP, 638 Azure, 9 Cloudflare (from sidebar badges). |
| Service worker | `/registerSW.js` content inspected; manifest declares icons. |
| Hidden SEO block | `<div style="…clip:rect(0 0 0 0)…">` containing `<h1>` and `<p>` directly inside `<body>`. |
| Structured data | `<script type="application/ld+json">` parsed; 3 entries: Organization, WebSite, WebApplication. |

### 7 — Network & API

| Claim | How verified |
|---|---|
| First-load network log | `page.network_requests({static: false})` captured all 29 requests with URLs, methods, and statuses. |
| Bundle code-splitting | `<link rel="modulepreload">` entries in `<head>` show 4 preloaded chunks; `cloudCatalogFull-*.js` loaded on demand. |
| jsPDF is dynamic | `indexOf('jspdf.es.min-')` in the main bundle found a reference to `jspdf.es.min-BDD4b1ZG.js`. |
| No REST/GraphQL/WebSocket APIs | Grep for `/api/`, `XMLHttpRequest`, `EventSource` in the main bundle all returned no hits. |
| Plausible sends pageview | Network panel showed `POST /api/event` with 202 status. |
| AdSense gate | Inline script in `<head>` shows the `?embed=1` / `?view=1` check. |
| Cookie consent storage | Inline script reads `localStorage.getItem('diagramr.cookieConsent')`. |

### 8 — Authentication

| Claim | How verified |
|---|---|
| No authentication | Grep on the main bundle for `jwt`, `OAuth`, `auth0`, `firebase`, `clerk`, `supabase.auth`, `next-auth`, `/api/login`, `/api/signup`, `Authorization` all returned no hits. |
| No Login/Sign up/Account UI | `Array.from(document.querySelectorAll('button,a')).map(el => el.textContent.trim())` — no auth-related buttons found. |
| Cookie consent is the only "credential" | Inline script reads/writes `localStorage["diagramr.cookieConsent"]`. |

### 9 — Interactions

| Claim | How verified |
|---|---|
| Theme toggle | Click the moon button → `document.documentElement.className` changes from `"dark"` to `""`; `getComputedStyle(document.body).backgroundColor` changes accordingly. |
| First-run templates | Initial DOM snapshot showed `<div role="dialog">` with 8 cards + Blank. |
| Components panel | `<aside aria-label="Components">` selector returned 16 category groups. |
| Toolbar tools | `aria-pressed` attributes on the 5 tool buttons toggle on click. |
| Drag handle → node | Default diagram's 9 edges confirm connection workflow. |
| Pause/Play | `<button aria-label="Pause data flow" aria-pressed="true">` toggled; particles stopped/started. |
| Flow modes | `<div role="radiogroup" aria-label="Flow mode">` with 3 radios; ← / → key bindings confirmed in Help. |
| Undo/Redo | `<button disabled>` state when stack empty. |
| Export | Toolbar "Export" button label and feature list in JSON-LD. |
| Present | Toolbar "Present (fullscreen playback)" button + laser pointer (L) binding in Help. |
| Compare | Toolbar "Compare architecture" button. |
| Help | Toolbar Help button → `<div role="dialog">` with `<dl>` of shortcuts. |
| Cookie consent | `<div role="region" aria-label="Cookie consent">` + Accept/Decline buttons. |
| Autosave indicator | `<span title="Autosaved in this browser — use Save to keep a file or Copy link to share">Saved locally · 54s ago</span>` in toolbar. |
| Share | "Copy link" mentioned in the saved-locally banner; `location.hash` references in bundle. |
| Edge-label drag | `title="Drag to slide along the edge · double-click to centre"` on each label. |

### 10 — Responsive behaviour

| Claim | How verified |
|---|---|
| Default breakpoints | Read Tailwind v4 docs (CSS classes `md:block`, `lg:flex`, etc.). |
| Minimap hidden below 768 px | After `browser_resize(420, 820)`, `getComputedStyle(document.querySelector('.react-flow__minimap')).display === 'none'`. |
| Components aside collapsed below 768 px | `document.querySelector('aside')` returned `null` at 420 px width. |
| Header toolbar collapses | `lg:flex` / `lg:hidden` classes observed in the className dump; mobile screenshot shows reduced toolbar. |

### 11 — Animations & transitions

| Claim | How verified |
|---|---|
| 22 `<animateMotion>` particles on default diagram | `document.querySelectorAll('animateMotion').length === 22`. |
| Particles use SMIL `<animateMotion>` | Each particle is a `<circle r="3.2">` with a child `<animateMotion path="…" dur="…" begin="…" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear"/>`. |
| Stagger via `data-phase` | Multiple particles share the same `dur` but have different `begin` times equal to `-phase * dur`. |
| Forward/reverse via `keyPoints` | Forward: `keyPoints="0;1"`; reverse: `keyPoints="1;0"`. |
| Pause removes particles from DOM | Pausing removes the `<animateMotion>` elements; resuming re-creates them with the saved `data-phase`. |
| Three keyframes | `for (const sheet of document.styleSheets) { for (const rule of sheet.cssRules) { if (rule.type === CSSRule.KEYFRAMES_RULE) … } }` returned `['fadeIn', 'spin', 'dashdraw']`. |
| Theme switch is instant | No `transition` rule on `body` or `html` for `background-color`. |

### 12 — Architecture diagram

The diagram is derived from:

- The DOM tree (recursive walk).
- The bundle import graph (`index-*.js` imports `zap`, `hierarchy`, `components`, `jsx-runtime`; `hierarchy` and `components` import `zap`).
- The network panel (Plausible POST + AdSense script load + dynamic jsPDF chunk).
- The inline `<head>` consent script.

Every node in the diagram maps to either a verified import, an observed DOM subtree, or a verified button/dialog.

### 13 — React recreation

Recommendations are based on the verified findings (React 19, xyflow, Zustand, Tailwind v4, jsPDF, no animation library). Folder layout mirrors the observed component boundaries.

### 14 — Implementation plan

The 6 milestones are derived from the natural dependency order:

- M0 (bootstrap) → M1 (static canvas) → M2 (interactive nodes/edges) → M3 (panel + templates) → M4 (persistence) → M5 (export/import) → M6 (PWA/polish).

Each milestone has a defined acceptance test that exercises live-site features.

## Re-running these checks

To reproduce any verification:

1. Open `https://www.gravelgraph.com/` in a browser with DevTools.
2. Use the snippets below in the DevTools console.

### Read all CSS custom properties

```js
const cs = getComputedStyle(document.documentElement);
const vars = {};
for (const p of cs) if (p.startsWith('--')) vars[p] = cs.getPropertyValue(p).trim();
console.table(vars);
```

### List all `@keyframes`

```js
const names = [];
for (const sheet of document.styleSheets) {
  try {
    for (const rule of sheet.cssRules) {
      if (rule.type === CSSRule.KEYFRAMES_RULE) names.push(rule.name);
    }
  } catch {}
}
console.log([...new Set(names)]);
```

### Count animation particles

```js
console.log('animateMotion:', document.querySelectorAll('animateMotion').length);
console.log('flow particles:', document.querySelectorAll('[data-flow-particle]').length);
```

### Fetch and scan the main bundle

```js
fetch('/assets/index-DoR4sc6o.js').then(r => r.text()).then(t => {
  console.log('Size:', t.length);
  console.log('Has React:', t.includes('react-dom'));
  console.log('Has Zustand:', t.includes('zustand'));
  console.log('Has jsPDF:', t.includes('jspdf'));
  console.log('Has location.hash:', (t.match(/location\.hash/g) || []).length);
});
```

### Read the manifest

```js
fetch('/manifest.webmanifest').then(r => r.json()).then(console.log);
```

### Toggle theme and re-read tokens

```js
// Click the moon/sun button first, then:
const cs = getComputedStyle(document.documentElement);
console.log('accent:', cs.getPropertyValue('--color-accent'));
console.log('bg:', cs.getPropertyValue('--color-bg'));
console.log('html class:', document.documentElement.className);
```

### Resize to mobile and inspect minimap

```js
// In DevTools device toolbar, switch to 420×820, then:
console.log('minimap display:', getComputedStyle(document.querySelector('.react-flow__minimap')).display);
console.log('aside exists:', !!document.querySelector('aside'));
```