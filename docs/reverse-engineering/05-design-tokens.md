# 05 — Design Tokens (colors, typography, spacing, motion)

All values were captured by running `getComputedStyle(document.documentElement)` after toggling the moon button to switch between light and dark themes. Every token is a CSS custom property — markup never references hex values directly.

## Color tokens

| Token | Light | Dark | Notes |
|---|---|---|---|
| `--color-bg` | `#f6f8fb` | `#0b0e14` | Page background |
| `--color-surface` | `#ffffff` | `#12151d` | Panels, cards, dialogs |
| `--color-surface-2` | `#eceff4` | `#1a1f29` | Hover, subtle recedes |
| `--color-surface-3` | `#e2e7ee` | `#232a36` | Deeper recede |
| `--color-canvas` | `#eef1f6` | `#0a0c12` | The dot-grid background inside React Flow |
| `--color-overlay` | `#fff` | `#161b24` | Modal scrim/dialog bg |
| `--color-fg` | `#0f141c` | `#e7eaf0` | Primary text |
| `--color-muted` | `#54606f` | `#9aa4b4` | Secondary text |
| `--color-faint` | `#5c6776` | `#8c97a7` | Hint text, subtitles, badges |
| `--color-border` | `#e1e6ee` | `#262c38` | Default borders |
| `--color-border-strong` | `#ccd3df` | `#3a4252` | Edges, dividers |
| `--color-accent` | `#0e7490` (cyan-700) | `#22d3ee` (cyan-400) | Primary accent |
| `--color-accent-hover` | `#155e75` (cyan-800) | `#67e8f9` (cyan-300) | Hover/active accent |
| `--color-accent-contrast` | `#ffffff` | `#04141a` | Foreground on accent |
| `--color-ring` | `#0e7490` | `#22d3ee` | Focus ring |
| `--color-success` | `#15803d` | `#34d399` | Success toasts |
| `--color-warning` | `#b45309` | `#fbbf24` | Warnings |
| `--color-error` | `#b91c1c` | `#f87171` | Errors |

### Composite (motion) shadows

| Token | Light / Dark | Composition |
|---|---|---|
| `--shadow-panel` | same in both | `0 1px 2px #10141b0f, 0 8px 24px #10141b14` |
| `--shadow-glow` | uses cyan-700/cyan-400 | `0 0 0 1px color-mix(in srgb, #0e7490 35%, transparent), 0 0 18px color-mix(in srgb, #0e7490 45%, transparent)` |

### Particle palette

The animated circles on edges are not driven by tokens — they're hard-coded hex values inside the SVG markup. Examples observed in the default diagram:

- `#22d3ee` — teal (default forward edge, also the accent color)
- `#38bdf8` — sky-400 (CDN / Cloudflare-style)
- `#34d399` — emerald-400 (Redis / cache)
- `#818cf8` — indigo-400 (Postgres / DB)
- `#22d3ee` — cyan-400 (API gateway)
- `#f472b6` — pink-400 (events / queue)
- `#f59e0b` — amber-400 (worker / batch)

Minimap node fills use a per-type tinted version of `color-mix(in srgb, #X 55%, var(--color-surface-2))`, so the minimap stays theme-aware while still colour-coding node categories.

## Typography

| Property | Value |
|---|---|
| Sans family | `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| Mono family | `"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace` |
| `--text-xs` | `.75rem` (line-height `1/0.75`) |
| `--text-sm` | `.875rem` (line-height `1.25/0.875`) |
| `--text-base` | `1rem` (line-height `1.5/1`) |
| `--text-lg` | `1.125rem` (line-height `1.75/1.125`) |
| `--font-weight-normal` | `400` |
| `--font-weight-medium` | `500` |
| `--font-weight-semibold` | `600` |
| `--font-weight-bold` | `700` |
| `--tracking-tight` | `-0.025em` |
| `--tracking-normal` | `0em` |
| `--tracking-wide` | `0.025em` |

**Fonts are not bundled.** The site relies on the OS fallback chain (or an implicit Google Fonts link) — `document.fonts.size` was `0` after navigation. A recreation should either bundle Inter + JetBrains Mono (`@fontsource/inter`, `@fontsource/jetbrains-mono`) or pull from Google Fonts.

## Spacing

| Token | Value | Notes |
|---|---|---|
| `--spacing` | `.25rem` | The 4 px base unit (Tailwind v4 default) |
| `--container-xs` | `20rem` | Small dialogs |
| `--container-md` | `28rem` | Mid dialogs |

All other spacing comes from Tailwind's scale (`gap-1`, `gap-1.5`, `gap-2`, `gap-2.5`, `p-1`, `px-2.5`, `py-0.5`, etc.) — observed in classNames like `gap-2.5 px-3 py-2.5` for the node card and `gap-1.5 p-1.5` for collapsible group bodies.

## Radii

| Token | Value | Use |
|---|---|---|
| `--radius-md` | `.375rem` | Small buttons, chips |
| `--radius-lg` | `.5rem` | Default |
| `--radius-xl` | `.75rem` | Cards, dialogs, nodes |
| `--radius-2xl` | `1rem` | Big rounded panels (rare) |
| `--radius-card` | `.75rem` | Alias for `--radius-xl` |

## Layout / breakpoints

Tailwind v4 defaults:

| Breakpoint | Width |
|---|---|
| `sm` | `640px` |
| `md` | `768px` |
| `lg` | `1024px` |
| `xl` | `1280px` |
| `2xl` | `1536px` |

The app shell is always `h-dvh w-full flex flex-col`. The canvas main is `flex-1 min-h-0 relative`. Components aside and minimap use Tailwind responsive utilities (`hidden md:block`, `lg:flex`, etc.).

## Motion tokens

| Token | Value |
|---|---|
| `--default-transition-duration` | `.15s` |
| `--default-transition-timing-function` | `cubic-bezier(.4,0,.2,1)` |
| `--animate-spin` | `spin 1s linear infinite` |

**Three `@keyframes`** are defined in the stylesheet:

| Name | Likely use |
|---|---|
| `fadeIn` | Dialog enter / exit |
| `spin` | Loader spinners |
| `dashdraw` | Selection marching-ants on edges/nodes |

Otherwise, motion is achieved through:

- Tailwind utilities: `transition-colors`, `transition-opacity`, `duration-150`, `ease-in-out` (inherits from `--default-transition-*`).
- SMIL `<animateMotion>` for data-flow particles (see [11-animations-and-transitions.md](./11-animations-and-transitions.md)).

## Verification

These values were captured by:

1. Navigating to `https://www.gravelgraph.com/`.
2. Running `getComputedStyle(document.documentElement)` and iterating its `[]` of CSS variable names to read every `--*` value.
3. Clicking the moon button to toggle to dark mode, then re-running the same query.
4. Reading computed styles for `body`, `header`, `aside`, `.react-flow`, `main`, and individual nodes/edges.

The raw object included 74 CSS custom properties; the values above are the curated subset that drives the visual design.