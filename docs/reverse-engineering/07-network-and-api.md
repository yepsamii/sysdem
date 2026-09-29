# 07 — Network & API Requests

## TL;DR

The site has **no backend API**. Everything runs client-side. The only network activity beyond static-asset loading is analytics (Plausible) and ads (Google AdSense), both of which are gated by URL flags.

## First-load request log

Captured live via the network panel during a cold load of `https://www.gravelgraph.com/`:

| # | Method | URL | Status | Purpose |
|---|---|---|---|---|
| 1 | GET | `https://www.gravelgraph.com/` | 200 | HTML shell |
| 2 | GET | `https://plausible.woodenamethyst.com.au/js/script.file-downloads.outbound-links.pageview-props.tagged-events.js` | 200 | Plausible analytics loader |
| 3 | GET | `https://www.gravelgraph.com/assets/index-DoR4sc6o.js` | 200 | Main JS bundle (Vite) |
| 4 | GET | `https://www.gravelgraph.com/assets/zap-CCG6ZsWE.js` | 200 | Small shared helpers (modulepreloaded) |
| 5 | GET | `https://www.gravelgraph.com/assets/hierarchy-qTo2P9TT.js` | 200 | React 19 + react-dom/client (modulepreloaded) |
| 6 | GET | `https://www.gravelgraph.com/assets/components-C7omfqpr.js` | 200 | Custom UI icons (modulepreloaded) |
| 7 | GET | `https://www.gravelgraph.com/assets/jsx-runtime-Cekjicix.js` | 200 | JSX runtime (modulepreloaded) |
| 8 | GET | `https://www.gravelgraph.com/assets/index-DrZ_bsUd.css` | 200 | Compiled Tailwind v4 CSS |
| 9 | GET | `https://www.gravelgraph.com/registerSW.js` | 200 | Vite PWA register helper |
| 10 | GET | `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9160713129579886` | 200 | AdSense loader |
| 11 | GET | `https://www.gravelgraph.com/manifest.webmanifest` | 200 | PWA manifest |
| 12 | GET | `https://static.cloudflareinsights.com/beacon.min.js/...` | **FAILED csp** | Cloudflare Web Analytics — blocked by CSP (harmless) |
| 13 | POST | `https://plausible.woodenamethyst.com.au/api/event` | 202 | Page-view event |
| 14 | GET | `https://www.gravelgraph.com/assets/cloudCatalogFull-B7sWoPNL.js` | 200 | Cloud icon catalog (deferred until needed) |
| 15 | GET | `https://googleads.g.doubleclick.net/pagead/html/...` | 200 | Ad iframe (AdSense) |
| 16 | GET | `https://www.gravelgraph.com/favicon.svg?v=2` | 200 | SVG favicon |
| 17 | GET | `https://www.gravelgraph.com/favicon.svg` | 200 | (duplicate request) |
| 18+ | GET | AdSense beacon endpoints (`/pagead/gen_204`, `/pagead/sodar`, etc.) | 204 | Ad measurement pixels |

## Bundle layout (code splitting)

Vite emits five preloaded chunks:

| File | Size | Role |
|---|---|---|
| `index-*.js` | 622 KB | Main app code, all UI, export pipeline, importers |
| `hierarchy-*.js` | 99 KB | React 19 + react-dom/client |
| `zap-*.js` | 13 KB | Shared helpers (also pulled by `hierarchy` and `components`) |
| `components-*.js` | 9 KB | Custom Lucide-style line icons |
| `jsx-runtime-*.js` | 0.4 KB | React JSX runtime shim |
| `index-*.css` | (CSS) | Tailwind v4 compiled output |

The cloud catalog (`cloudCatalogFull-*.js`, 521 KB) is **not** preloaded — it's deferred and fetched only when the user opens one of the cloud categories (AWS, GCP, Azure, Cloudflare) or drops a cloud component. The chunk URL is hinted by:

```html
<meta name="gg-cloud-catalog-chunk" content="/assets/cloudCatalogFull-B7sWoPNL.js">
```

PDF export also dynamically imports `jspdf.es.min-*.js` (`jspdf.es.min-BDD4b1ZG.js`) — only fetched when the user actually exports a PDF.

## No REST / GraphQL / WebSocket APIs

The bundle contains **no `/api/*` endpoints, no `fetch('/...')` calls, no `XMLHttpRequest`, and no `EventSource`** beyond:

- The bundle's own preloads (already enumerated).
- Cloud icon SVG fetches via plain `<img>` (browser-driven, not from JS).
- jsPDF dynamic import.

All persistence is **client-side**:

- **localStorage** — autosave of the active diagram and the cookie-consent choice.
- **URL hash** (`#d=…`) — encoded, compressed diagram JSON for share links.

## Analytics

### Plausible (self-hosted)

- Loader: `https://plausible.woodenamethyst.com.au/js/script.file-downloads.outbound-links.pageview-props.tagged-events.js`
- Endpoint: `POST https://plausible.woodenamethyst.com.au/api/event` (returns `202 Accepted`)
- **Hash is excluded** by design — comment in HTML:

  > `data-domain="gravelgraph.com"`
  > src="https://plausible.woodenamethyst.com.au/js/script.file-downloads.outbound-links.pageview-props.tagged-events.js"
  >
  > `.hash deliberately removed: the URL hash carries diagram data (#d=…), so hash-tracking would leak diagrams + flood stats with unique URLs.`

- The script is loaded with `defer` and a polyfill (`window.plausible = window.plausible || function(){ (window.plausible.q = window.plausible.q || []).push(arguments) }`).

### Google AdSense + Consent Mode v2

AdSense is loaded **only outside `?embed=1` and `?view=1`** — the inline gate:

```html
<script>
  if (!/(?:^|[?&])(?:embed|view)=1(?:&|$)/.test(location.search)) {
    var adsenseScript = document.createElement('script')
    adsenseScript.async = true
    adsenseScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9160713129579886'
    adsenseScript.crossOrigin = 'anonymous'
    document.head.appendChild(adsenseScript)
  }
</script>
```

Google Consent Mode v2 is wired before AdSense with all `ad_*` defaults set to `denied`:

```js
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
})
```

If the user already accepted cookies (key `diagramr.cookieConsent` in localStorage), the script synchronously replays `gtag('consent', 'update', { ad_storage:'granted', ad_user_data:'granted', ad_personalization:'granted' })`.

## Cookie / storage

| Key | Type | Owner | Purpose |
|---|---|---|---|
| `diagramr.cookieConsent` | JSON `{v:1, ads:boolean}` | App (consent banner) | Remembers the visitor's ad-storage choice |
| (diagram autosave key, not in the public HTML comments) | JSON | App (diagram store) | Autosave of the current diagram (verified by the "Saved locally · 54s ago" indicator) |
| `cookie` (Google) | real cookie, third-party | AdSense | Ad targeting (denied by default) |

## Cloudflare Web Analytics

A beacon script was injected by the CDN but is blocked by CSP (`FAILED csp`). It is harmless but no signal — the site does not rely on it. (Likely a leftover from previous hosting.)

## Implications for a reimplementation

- The bundle is small (~750 KB raw, ~250 KB gzipped) and survives without a backend.
- Lazy-load:
  - The cloud catalog only when the user opens the cloud section.
  - jsPDF only on PDF export.
  - The icon SVG file only when a specific component is dropped on the canvas.
- Wire Google Consent Mode v2 before any ad script. Honour `?embed=1` / `?view=1` by skipping the ad loader entirely.
- Self-host Plausible or omit analytics entirely. If you self-host Plausible, configure the script to ignore `location.hash`.