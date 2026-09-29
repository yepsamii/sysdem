# 08 — Authentication

## TL;DR

There is **no authentication** of any kind. The site is explicitly "no account, no server, no sign-up" and has no auth-related code in the bundle.

## Evidence

### 1. Marketing copy

Found in the SEO crawlable block, the page `<title>`, the OG description, the Help dialog, and the structured data:

> *"GravelGraph is a free, no-login, browser-based diagramming tool … Diagrams are self-contained `.gravel` files and shareable links, with no server, no database and no sign-up."*

> *"GravelGraph is free and runs entirely in your browser — no account, no server. Your diagrams never leave this device."*

The `@type: WebApplication` JSON-LD declares `isAccessibleForFree: true` and `offers.price: '0'`.

### 2. Bundle greps

The following substrings **were searched for** in `/assets/index-DoR4sc6o.js` (622 KB) and all returned **no hits**:

- `jwt`
- `OAuth`
- `auth0`
- `firebase`
- `clerk`
- `supabase.auth`
- `next-auth`
- `/api/login`
- `/api/signup`
- `Authorization`

### 3. UI surface

There is no Login / Sign in / Sign up / Account / Profile button anywhere in the toolbar, the help dialog, or any modal. The only `support` link is `mailto:`.

### 4. Data storage model

The only thing that resembles "credential" state is the **cookie consent choice**, which is just a flag stored locally:

```js
try {
  var stored = JSON.parse(localStorage.getItem('diagramr.cookieConsent') || 'null')
  if (stored && stored.v === 1 && stored.ads === true) {
    gtag('consent', 'update', { ad_storage:'granted', ad_user_data:'granted', ad_personalization:'granted' })
  }
} catch (e) { /* storage blocked or corrupt — stay denied */ }
```

This is **not authentication** — it just remembers whether the user accepted personalised ads.

## How sharing works without accounts

Diagrams are shared as **fully self-contained URLs**. The graph JSON is:

1. Serialised (nodes + edges + viewport + labels + theme + flow mode).
2. Compressed (likely `lz-string` or `pako/deflate`).
3. URL-safe base64-encoded.
4. Written to `location.hash` as `#d=…`.

Anyone with the link sees the same diagram because the entire state travels with the URL. The Plausible analytics explicitly **excludes the hash** to avoid leaking diagrams to stats.

## Implications for a reimplementation

- **Do not add auth.** The site's value proposition is built on "no login". Adding auth would defeat the purpose.
- If you need to monetise beyond ads, prefer one of:
  - **Local + sync** — add an opt-in "Sign in to sync" feature using a third-party identity (Apple, Google, GitHub OAuth) — but keep the local-only default.
  - **Paid cloud save** — same model, gated behind a subscription.
  - **Embed license** — for commercial embedding.
- Keep `#d=…` URLs working without any backend.
- Keep the cookie consent flow local-only (no remote profile).