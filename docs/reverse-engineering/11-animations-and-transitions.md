# 11 — Animations & Transitions

The site achieves its distinctive look with **no animation library**. Every motion is either a CSS transition or an SVG SMIL `<animateMotion>`.

## 1. SVG SMIL particles (the headline effect)

This is what makes the data flow "alive". Each animated edge contains **2–4 particles** (circles + protocol labels) that travel along the edge's path via SVG `<animateMotion>`.

### Default diagram: 22 active particles

Verified: `document.querySelectorAll('animateMotion').length === 22` on the default System Architecture diagram (9 edges × ~2.4 particles per edge on average).

### Particle markup (verified)

```svg
<g class="react-flow__edge react-flow__edge-flow" data-id="e_fa54bf63">
  <path id="e_fa54bf63" d="M183 232L203 232L 390,232 …L597.0000203450521 232"
        class="react-flow__edge-path" style="stroke:var(--color-border-strong);stroke-width:1.5"/>
  <path d="…" stroke-opacity="0" stroke-width="20" class="react-flow__edge-interaction"/>
  <path d="…" stroke="transparent" stroke-width="22" pointer-events="stroke" style="cursor:pointer"/>
  <g pointer-events="none">
    <!-- forward particle, phase 0 -->
    <circle r="3.2" fill="#22d3ee" data-flow-particle data-phase="0.0000" data-dir="forward">
      <animateMotion dur="20.700001017252628s" begin="-0.000s" repeatCount="indefinite"
                     keyPoints="0;1" keyTimes="0;1" calcMode="linear" path="…"/>
    </circle>
    <text font-size="9" fill="#22d3ee" text-anchor="middle" dy="-7"
          pointer-events="none" data-flow-particle data-phase="0.0000" data-dir="forward"
          style="font-family:var(--font-mono);">HTTPS
      <animateMotion dur="20.700001017252628s" begin="-0.000s" repeatCount="indefinite"
                     keyPoints="0;1" keyTimes="0;1" calcMode="linear" path="…"/>
    </text>
    <!-- forward particle, phase 0.5 (offset by half a cycle) -->
    <circle r="3.2" fill="#22d3ee" data-flow-particle data-phase="0.5000" data-dir="forward">
      <animateMotion dur="20.700001017252628s" begin="-10.350s" repeatCount="indefinite"
                     keyPoints="0;1" keyTimes="0;1" calcMode="linear" path="…"/>
    </circle>
    <!-- reverse particle -->
    <circle r="3.2" fill="#22d3ee" data-flow-particle data-phase="0.0000" data-dir="reverse">
      <animateMotion dur="20.700001017252628s" begin="-0.000s" repeatCount="indefinite"
                     keyPoints="1;0" keyTimes="0;1" calcMode="linear" path="…"/>
    </circle>
    <text …>HTTPS<animateMotion … keyPoints="1;0" …/></text>
  </g>
</g>
```

### Stagger via `data-phase`

Each particle has a `data-phase` attribute (0 to 1) which translates to a **negative `begin` time**:

```js
begin_seconds = -phase * dur
```

This is the trick that lets you have multiple particles on the same edge without snapping to the same starting position — they all run on a single shared timeline but at different starting offsets.

### Forward vs reverse via `keyPoints`

`data-dir="forward"` → `keyPoints="0;1"` (start to end).
`data-dir="reverse"` → `keyPoints="1;0"` (end to start).

The path is identical for both directions; only the keyframes are reversed. This is how request/response flows are visualized.

### Color

`fill="#22d3ee"` (and other hex values per edge type) — these are **not** driven by CSS variables. They're hard-coded per-edge from a palette (see [05-design-tokens.md](./05-design-tokens.md#particle-palette)).

### Causal and Scenario modes

In **Continuous** mode, every edge animates independently on its own timer (durations vary per edge based on length).

In **Causal** mode, the **durations across the graph are coordinated** — upstream particles finish before downstream ones start, producing a chain effect. This is implemented by setting `dur` per edge based on topological order rather than just length.

In **Scenario** mode, edges are grouped into named steps (defined in the diagram data). Only the edges belonging to the current step animate; ← / → advance through steps.

### Pause

Pressing `Space` (or the Pause button) **removes the `<animateMotion>` elements from the DOM** rather than just setting `dur="0s"` or pausing via JS — the markup simply disappears. Resuming re-creates them with the correct `data-phase` so each particle restarts at the right offset.

## 2. CSS transitions on interactive elements

| Selector | Effect |
|---|---|
| Buttons (`hover:bg-surface-2 hover:text-fg transition-colors`) | Background + text colour fade in 150 ms with `cubic-bezier(.4,0,.2,1)` |
| Active pressed state (`bg-surface-2 text-fg` or `bg-accent text-accent-contrast`) | Same transition |
| Handles (`.react-flow__handle`) | `!opacity-0 group-hover:!opacity-100 transition-opacity duration-150` |
| MiniMap | Hidden / shown with `display: none` / `block` (no transition) |
| Theme toggle | Instant — no `transition: background-color` on `body` |

## 3. CSS keyframes (verified by iterating `document.styleSheets`)

Three keyframes exist in the stylesheet:

| Name | Likely use |
|---|---|
| `fadeIn` | Dialog enter / exit (`animation: fadeIn 0.15s ease-out`) |
| `spin` | Loader spinners (used in the autosave indicator and any "loading" affordance) |
| `dashdraw` | Marching-ants animation for selection rectangles on edges/nodes |

A spinner keyframe is also exposed as `--animate-spin: spin 1s linear infinite` — used by Tailwind's `animate-spin` utility.

## 4. Edge-label drag

Edge labels are HTML divs (not SVG). When you drag them, React Flow updates the `style.transform` in real-time:

```html
<div style="transform: translate(-50%,-50%) translate(307.2px,232px); …">request / response</div>
```

No spring physics — direct 1:1 mapping from cursor to label position. Double-click snaps back to the midpoint.

## 5. MiniMap

The MiniMap is a static SVG with one `<rect>` per node, coloured by type using `color-mix(in srgb, #X 55%, var(--color-surface-2))`. No animation.

## 6. Theme transition

Toggling the moon button flips `<html class="dark">` instantly. Because every colour is a CSS variable and Tailwind utilities reference those variables, the entire UI repaints synchronously without an explicit `transition: background-color` rule. The result feels fast and snappy on a modern browser; recreations should preserve this lack of fade.

## 7. Why SMIL instead of JS animation

- **Zero JS runtime cost** during playback — the browser's compositor handles `<animateMotion>` natively.
- **Pause by removal** — no need to manage a global RAF loop.
- **Stagger is data-driven** (`data-phase`) — no per-edge animation logic.
- **No animation library** keeps the bundle small (no framer-motion, no gsap).

## Verification details

- `document.querySelectorAll('animateMotion').length === 22` on the default diagram.
- `for (const sheet of document.styleSheets) { for (const rule of sheet.cssRules) { if (rule.type === CSSRule.KEYFRAMES_RULE) … } }` returned `['fadeIn', 'spin', 'dashdraw']`.
- Inspected raw `outerHTML` of one `.react-flow__edge` to confirm the structure shown above.

## Implications for a reimplementation

- **Keep SMIL** — it is the simplest path to parity and ships zero JS.
- If you need more control (e.g. anti-aliased motion on sub-pixel paths), consider `framer-motion`'s `motionPath` or a tiny RAF loop using `SVGGeometryElement.getPointAtLength()`. Either way, the data model (`{dur, phases[], dirs[]}`) stays the same.
- Theme switch must be **instant** — do not add a `transition` on `background-color` at the root.
- The pause behaviour (remove `<animateMotion>` from the DOM) is preferable to setting `dur="0s"` because it also frees the compositor.