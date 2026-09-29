# 10 — Responsive Behaviour

## TL;DR

The app uses **Tailwind v4's default breakpoints** (`sm 640`, `md 768`, `lg 1024`, `xl 1280`). The critical breakpoint is `md` (768 px) — below it the minimap disappears and the components panel collapses; below `lg` (1024 px) the toolbar's right-hand cluster condenses.

## Breakpoints (verified by reading the className dump)

Tailwind v4 utility classes observed in the live DOM:

| Breakpoint | Width | Where used |
|---|---|---|
| `sm:` | 640 px | `sm:px-3`, `sm:gap-2` — minor padding tweaks in the header |
| `md:` | 768 px | `hidden md:block` (minimap), `md:absolute`, `md:top-full` (file popover) |
| `lg:` | 1024 px | `lg:flex`, `lg:hidden`, `lg:block` — header toolbar collapses |

## Verified mobile layout (viewport = 420 × 820)

After resizing to 420 × 820, the computed styles showed:

| Element | Visibility | Source |
|---|---|---|
| `.react-flow__minimap` | `display: none` | `hidden md:block` |
| `<aside aria-label="Components">` | not in DOM (collapsed into a tab strip) | Component-level conditional |
| `.react-flow__controls` | visible (`display: flex`) | No responsive class |
| Header brand (GG) | visible | Always shown |
| File button | visible | Always shown |
| Some tool buttons | hidden | `lg:flex` / `lg:hidden` |
| Compare | visible | Always shown |
| Pause / Play | visible | Always shown |
| Theme toggle | visible | Always shown |
| Canvas | fills the available area | `flex-1 min-h-0` |

## Mobile screenshot — what changed

```
Mobile (420 px)                          Desktop (1280 px)
────────────────────                     ─────────────────────
[GG] [☰] [↻] [⏸] [☀]                     [GG] [File] [↖] [✋] [✏] [/] [→] [Export] [Present]
                                          [↶] [↷]          (Saved locally · 54s ago)
                                          [Compare] [Continuous ⏸] [Pause] [?] [☀]
─────────────────────────────────         ─────────────────────────────────
[Components] (collapsed tab strip)        |                       Components  | close
                                         |                       ────────────  |
                                         |                       | search     |
                                         |                       | …          |
                                         |                       | AWS 805    |
                                         |                       | …          |
─────────────────────────────────         ─────────────────────────────────
       canvas (dot grid, 1 node visible)  |                       canvas     |
                                         |                                  |
[Cookies banner]                          |                                  |
[Accept] [Decline]                        |                                  |
```

## Responsive components in detail

### Header

- **`<lg` (1024 px and below):** the toolbar cluster (Select, Hand, Draw, Line, Arrow, Export, Present) collapses. Only the brand mark, File, two connected-flow icons, Compare, Pause/Play, and the Theme toggle remain inline. The Undo/Redo are hidden by `lg:flex`.
- **≥lg:** the full toolbar is shown inline.

### Components aside

- **`<md` (768 px and below):** the `<aside>` is removed from the DOM. A floating **"Components" pill** appears at the top-left that re-opens the panel as an overlay sheet.
- **≥md:** the aside sits permanently on the left, resizable via the `<hr role="separator">` handle.

### Minimap

- **`hidden md:block`** — hidden below 768 px, visible from 768 px up.
- Verified `display: none` at 420 px width.

### Canvas

- Always fills `flex-1 min-h-0 relative`. React Flow re-runs `fitView` when the viewport changes.

### Edge labels

- At any size, labels are absolutely positioned and scale with the viewport transform — they never overlap and remain draggable.

### Help dialog & modals

- Use `max-w-2xl w-full` and `p-4`, so they shrink gracefully on mobile.
- The Cookie consent banner is anchored bottom-center with `max-w-md` and stacks vertically on narrow viewports.

## Verification details

- **Breakpoints:** confirmed by reading the rendered className on multiple elements after resizing to 420 × 820 and 1280 × 800.
- **Minimap hide:** `getComputedStyle(document.querySelector('.react-flow__minimap')).display === 'none'` at 420 px.
- **Aside collapse:** `document.querySelector('aside')` returned `null` at 420 px.
- **Header collapse:** the toolbar cluster was missing `lg:flex` buttons in the mobile snapshot.

## Implications for a reimplementation

- Use Tailwind v4 with the default breakpoints — no custom config needed.
- Wrap the minimap in `<div className="hidden md:block">`.
- Conditionally render the `<aside>` (or use `<Sheet>` from any mobile-friendly primitive) below `md`.
- Keep the toolbar cluster intact but use `lg:flex` / `lg:hidden` for collapsing.
- Use a Sheet / Drawer pattern for the mobile version of the components panel.