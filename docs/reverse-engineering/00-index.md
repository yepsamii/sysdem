# GravelGraph Reverse-Engineering

A systematic investigation of [gravelgraph.com](https://www.gravelgraph.com/), a free, no-login, browser-based architecture & data-flow diagram tool with live animated particles.

> **Method.** Every claim below is labeled with *how I verified it* — DOM inspection, computed-style snapshots, bundle string scans, network panel captures, theme/responsive toggling, and dialog interactions — using Playwright against the live site. Nothing is guessed where it can be inspected.

## Document index

| # | File | Topic |
|---|---|---|
| 1 | [01-framework-and-libraries.md](./01-framework-and-libraries.md) | React 19, xyflow, Zustand, Tailwind v4, build & analytics stack |
| 2 | [02-pages-and-routes.md](./02-pages-and-routes.md) | Single SPA + URL flags + URL-hash sharing; no router |
| 3 | [03-dom-and-component-structure.md](./03-dom-and-component-structure.md) | DOM tree, node/edge/label markup, accessibility roles |
| 4 | [04-reusable-ui-patterns.md](./04-reusable-ui-patterns.md) | Toolbar button, panel, dialog, radio, particle patterns |
| 5 | [05-design-tokens.md](./05-design-tokens.md) | Light/dark colors, typography, spacing, radii, motion tokens |
| 6 | [06-assets.md](./06-assets.md) | Favicons, icons (custom + 1500 cloud), fonts, manifest, SW |
| 7 | [07-network-and-api.md](./07-network-and-api.md) | Bundle requests, Plausible, AdSense, no backend APIs |
| 8 | [08-authentication.md](./08-authentication.md) | No auth; only localStorage cookie consent |
| 9 | [09-interactions.md](./09-interactions.md) | Live-tested: theme, tools, flow modes, undo, present, etc. |
| 10 | [10-responsive-behavior.md](./10-responsive-behavior.md) | Tailwind breakpoints, mobile layout, minimap hide |
| 11 | [11-animations-and-transitions.md](./11-animations-and-transitions.md) | SMIL `<animateMotion>` particles, CSS transitions, keyframes |
| 12 | [12-architecture-diagram.md](./12-architecture-diagram.md) | Full system diagram (browser-only, no backend) |
| 13 | [13-react-recreation.md](./13-react-recreation.md) | Stack, folder layout, component tree, particle reimplementation |
| 14 | [14-implementation-plan.md](./14-implementation-plan.md) | 6-milestone plan with acceptance tests |
| — | [verification.md](./verification.md) | Index of *how* each major claim was verified |

## TL;DR

GravelGraph is a **single-page, no-backend, client-only React 19 app** that uses **`@xyflow/react` for the canvas**, **Zustand for state**, **Tailwind v4 for styling**, and **SVG SMIL `<animateMotion>`** for the data-flow particles. The "icon catalog" (1500+ entries across AWS/GCP/Azure/Cloudflare/SaaS) is delivered as a deferred Vite chunk (`cloudCatalogFull-*.js`). Diagrams persist to `localStorage` and are shared as compressed JSON in the URL hash (`#d=…`). There is no authentication, no router, and no server beyond static asset hosting (Cloudflare).