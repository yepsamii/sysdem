# 02 — Pages & Routes

## TL;DR

GravelGraph is a **single-page app**. There is effectively **one route** (`/`) plus a **separate static privacy policy**. Everything else (Help, About, Settings, Export, Stencils, Compare, Present, Cookie banner) is an **in-app overlay**.

## Route map (verified)

Each path was fetched with `redirect: 'manual'` and the response inspected.

| Path | Response | What it is |
|---|---|---|
| `/` | 200 · `text/html` | The editor SPA |
| `/?embed=1` | 200 · `text/html` | Same SPA, but the inline script suppresses AdSense (the help-dialog explicitly notes that embeds hide the consent banner) |
| `/?view=1` | 200 · `text/html` | Same SPA, read-only viewer mode (also suppresses ads) |
| `#d=…` (hash) | n/a | The SPA decodes the URL hash into the diagram — there are 3 references to `location.hash` in the bundle |
| `/help`, `/about`, `/docs`, `/changelog`, `/examples`, `/terms`, `/contact`, `/embed`, `/view`, `/d` | 200 · `text/html` | All serve the **same** `index.html` — the SPA falls back to the editor |
| `/privacy/` | 200 · `text/html` | A separate static page (anchor `<a href="/privacy/">` from inside the Help dialog). Not part of the SPA bundle. |

**Verification.** The single-page pattern is confirmed by:

1. All candidate paths returning identical `Content-Type: text/html`.
2. No `react-router`, `createHashRouter`, `BrowserRouter`, or `MemoryRouter` references in the bundle.
3. The inline script at the bottom of `<head>`:

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

   — this is the only routing logic the HTML itself does, and it's just to gate AdSense on `/`.
4. The comment in `<head>` that documents the analytics behaviour around `#d=…`:

   > `.hash deliberately removed: the URL hash carries diagram data (#d=…), so hash-tracking would leak diagrams + flood stats with unique URLs.`

## In-app destinations

These are *not* separate routes — they live as overlays or panels inside the single `/` route:

| Destination | How it's surfaced | Verified |
|---|---|---|
| Help & shortcuts | `<div role="dialog">` modal opened by the toolbar "Help" button | Dialog title "Help", `<dl>` of keyboard shortcuts, contact email + privacy link |
| About | Section inside the Help dialog | "GravelGraph is free and runs entirely in your browser…" paragraph |
| Contact | `<a href="mailto:support@woodenamethyst.com.au?subject=GravelGraph%20feedback">` inside Help | Direct link |
| Privacy policy | `<a href="/privacy/">` inside Help → separate static page | Fetched `/privacy/` returns 200 HTML |
| Diagram settings | `<button aria-label="Diagram settings">` (gear) in the right of the canvas | Opens a settings dialog |
| Components panel | `<aside aria-label="Components">` on the left, resizable | Verified via `aside` element + `role="separator"` resize handle |
| First-run templates | `<div role="dialog">` auto-shown on first visit (8 templates + Blank) | 8 cards inside dialog with template IDs |
| Cookie consent | `<div role="region" aria-label="Cookie consent">` bottom-center | Accept / Decline buttons |
| Present mode | Toolbar "Present" button → fullscreen via Fullscreen API | Verified by button label "Present (fullscreen playback)" |
| Compare architecture | Toolbar "Compare architecture" button | Opens side-by-side diff view |
| Export | Toolbar "Export" button → export dialog (PNG / SVG / PDF / GIF / Video) | Verified by button label "Export diagram" + Export option |

## Query-string and hash modes

| Mode | Trigger | Effect |
|---|---|---|
| **Edit** | `/` (default) | Full editor |
| **Embed** | `?embed=1` | Hides header chrome, controls, consent banner, ads — for use inside `<iframe>` |
| **View** | `?view=1` | Read-only diagram view, also no ads / banner |
| **Share** | `#d=…` | Compressed base64-encoded diagram JSON loaded into the editor (the SPA decodes and hydrates the store on mount) |

## Implications for a reimplementation

- **Do not add a router** unless you intend to host standalone marketing pages. A single `<App/>` reading `location.search` and `location.hash` is sufficient.
- The three "modes" (`?embed=1`, `?view=1`, default) can be a small `useSearchParams()` polyfill or a hand-rolled `useQuery()` hook.
- Share links: implement `share.ts` that compresses the graph JSON (e.g. `lz-string`) → URL-safe base64 → `location.hash`. Subscribe to `hashchange` so pasted links also work in real time.
- Treat `/privacy/` as a static HTML file (or a separate route if you decide to bring marketing content into the SPA later).