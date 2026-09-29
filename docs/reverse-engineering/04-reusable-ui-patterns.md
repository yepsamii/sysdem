# 04 — Reusable UI Patterns

These are the design primitives that recur throughout the UI. In a React recreation each becomes a single small component.

## 1. Toolbar button (segmented, optionally pressed)

Used for: Select, Hand, Draw, Line, Arrow, Undo/Redo, Export, Present, File, Compare, Theme toggle, Play/Pause.

```html
<button
  type="button"
  aria-pressed="false"
  aria-label="Hand — drag to pan the canvas (H)"
  class="inline-flex h-9 w-9 items-center justify-center
         rounded-lg text-muted hover:bg-surface-2 hover:text-fg
         transition-colors focus-visible:ring-2 focus-visible:ring-ring
         disabled:opacity-40 disabled:pointer-events-none">
  <IconComponent class="h-5 w-5"/>
</button>
```

Variants:

- **Pressed state** (active tool) — `aria-pressed="true"` adds `bg-surface-2 text-fg` (or `bg-accent text-accent-contrast` for primary actions).
- **Icon-only** (default 9×9) vs **icon + label** (e.g. Export/Present).
- **Disabled** — `disabled:opacity-40 disabled:pointer-events-none`.
- **Primary action** — `bg-accent text-accent-contrast hover:bg-accent-hover`.

Verified by reading the actual className of each toolbar button.

## 2. Resizable side panel / sheet

Used for: Components aside, Settings dialog (when docked).

```html
<aside aria-label="Components"
       class="flex flex-col absolute z-30 bg-surface shadow-panel
              overflow-hidden border border-border rounded-2xl"
       style="left:0; top:0; bottom:0; width:300px; min-width:240px; max-width:480px;">
  <header class="flex items-center justify-between p-3 border-b border-border">
    <h2 class="text-sm font-semibold">Components</h2>
    <button class="…"><CloseIcon/></button>
  </header>
  <!-- … -->
  <hr role="separator" aria-label="Resize Components"
      class="absolute top-0 right-0 h-full w-1.5
             cursor-col-resize hover:bg-accent/15 transition-colors"/>
</aside>
```

Verified: `<aside aria-label="Components">` + `<hr role="separator" aria-label="Resize Components">`.

## 3. Node card

The fundamental `.react-flow__node-arch` pattern. See [03-dom-and-component-structure.md](./03-dom-and-component-structure.md#node-markup-verified) for the full markup; the **React abstraction** is:

```tsx
function ArchNode({ id, data, selected }) {
  return (
    <div className={
      'group relative flex items-center gap-2.5 rounded-xl border ' +
      'bg-surface px-3 py-2.5 min-h-full w-full shadow-panel ' +
      'transition-colors ' +
      (selected ? 'border-accent shadow-glow' : 'border-border')
    }>
      {/* 8 handles */}
      <Handle id={`${id}-t`}   type="source" position={Position.Top}    style={handleStyle('50%')} />
      <Handle id={`${id}-ta`}  type="source" position={Position.Top}    style={handleStyle('22%')} />
      <Handle id={`${id}-tb`}  type="source" position={Position.Top}    style={handleStyle('78%')} />
      <Handle id={`${id}-r`}   type="source" position={Position.Right}  style={handleStyle('50%')} />
      <Handle id={`${id}-ra`}  type="source" position={Position.Right}  style={handleStyle('22%')} />
      <Handle id={`${id}-rb`}  type="source" position={Position.Right}  style={handleStyle('78%')} />
      <Handle id={`${id}-b`}   type="source" position={Position.Bottom} style={handleStyle('50%')} />
      <Handle id={`${id}-l`}   type="source" position={Position.Left}   style={handleStyle('50%')} />
      <div className="h-10 w-10 rounded-md bg-surface-2 flex items-center justify-center">
        <IconFor data.kind />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold leading-tight truncate" title={data.title}>
          {data.title}
        </div>
        <div className="text-xs text-faint leading-tight truncate">{data.subtitle}</div>
      </div>
    </div>
  );
}
```

## 4. Icon chip (40×40 with rounded background)

Used everywhere a cloud icon appears (components panel, nodes).

```html
<div class="h-10 w-10 rounded-md bg-surface-2 flex items-center justify-center
            ring-1 ring-border overflow-hidden">
  <img src={iconSrc} class="h-7 w-7" alt=""/>
</div>
```

The component panel uses a smaller variant (`h-7 w-7`) without the inner ring.

## 5. Collapsible group (button header + count badge + body)

Used for every group in the Components panel.

```html
<div class="rounded-lg">
  <button aria-expanded="true"
          class="w-full flex items-center justify-between
                 px-2 py-1.5 rounded-md hover:bg-surface-2 transition-colors">
    <span class="text-sm font-medium">Compute</span>
    <span class="text-xs text-faint">4</span>
  </button>
  <div class="grid grid-cols-2 gap-1.5 p-1.5">
    <!-- items -->
  </div>
</div>
```

Verified by the components panel layout: each group is a `<button aria-expanded="…">` with a count badge, and the body is a 2-column grid.

## 6. Centered dialog (modal)

Used for: First-run templates, Help, Settings, Export, Compare, Cookie consent.

```html
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title"
     class="fixed inset-0 z-50 flex items-center justify-center
            bg-overlay/70 p-4 animate-fadeIn">
  <div class="m-auto max-w-2xl w-full rounded-2xl bg-surface
              shadow-panel border border-border overflow-hidden
              animate-fadeIn">
    <header class="flex items-center justify-between p-4 border-b border-border">
      <h2 id="dialog-title" class="text-base font-semibold">Dialog title</h2>
      <button aria-label="Close"><CloseIcon/></button>
    </header>
    <div class="p-4">…</div>
  </div>
</div>
```

Animations: `@keyframes fadeIn` is defined in the stylesheet (verified by iterating `document.styleSheets[].cssRules` for `CSSRule.KEYFRAMES_RULE`).

## 7. Top-of-canvas banner (dismissible)

Used for "Your work is saved in this browser only" and the autosave status row.

```html
<div class="border-b border-border bg-surface text-sm">
  <p class="container py-2">
    Your work is saved <strong>in this browser only</strong> — no account, no server.
    Use <strong>Save</strong> to keep a <code>.gravel</code> file, or
    <strong>Copy link</strong> to share it.
    <button aria-label="Dismiss"
            class="ml-2 … hover:bg-surface-2 rounded-md">×</button>
  </p>
</div>
```

## 8. Segmented radio group (flow mode)

```html
<div role="radiogroup" aria-label="Flow mode"
     class="inline-flex items-center rounded-md bg-surface-2 p-0.5">
  <button role="radio" aria-checked="true"
          class="px-2.5 py-1 rounded text-sm bg-surface text-fg shadow-sm">
    Continuous
  </button>
  <button role="radio" aria-checked="false"
          class="px-2.5 py-1 rounded text-sm text-muted hover:text-fg">
    Causal
  </button>
  <button role="radio" aria-checked="false"
          class="px-2.5 py-1 rounded text-sm text-muted hover:text-fg">
    Scenario
  </button>
</div>
```

The active item is a small "card" inset on a darker track. Verified by reading the actual className of the radiogroup.

## 9. Theme-aware color tokens

Every color is routed through a `--color-*` CSS variable. This makes the entire palette dark-mode-compatible without per-component logic:

```html
<!-- The same class works in light and dark because the underlying var flips -->
<div class="bg-surface text-fg text-muted hover:text-fg">…</div>
```

Verified by toggling theme and re-reading computed styles: all `--color-*` vars change in lockstep, but the markup stays identical.

## 10. Particle on edge (SMIL)

The most distinctive pattern. Each edge renders one visible path plus 2-4 animated circles:

```jsx
function FlowEdge({ id, sourceX, sourceY, targetX, targetY, data }) {
  const path = useMemo(() => makeStepPath(sourceX, sourceY, targetX, targetY), [sourceX, sourceY, targetX, targetY]);
  const dur = data?.dur ?? 20;            // seconds
  const phases = data?.phases ?? [0, 0.5];
  const dirs = data?.dirs ?? ['forward'];
  const color = data?.color ?? '#22d3ee';
  const label = data?.label;             // rides the particle

  return (
    <g className="react-flow__edge react-flow__edge-flow">
      <path d={path} className="react-flow__edge-path"
            style={{ stroke: 'var(--color-border-strong)', strokeWidth: 1.5 }}/>
      <path d={path} className="react-flow__edge-interaction" strokeOpacity="0" strokeWidth={20}/>
      <path d={path} stroke="transparent" strokeWidth={22} pointerEvents="stroke" style={{ cursor: 'pointer' }}/>
      <g pointerEvents="none">
        {dirs.flatMap(dir =>
          phases.map((phase, i) => (
            <Fragment key={`${dir}-${i}`}>
              <circle r="3.2" fill={color}
                      data-flow-particle data-phase={phase} data-dir={dir}>
                <animateMotion dur={`${dur}s`} begin={`${-phase * dur}s`}
                               repeatCount="indefinite"
                               keyPoints={dir === 'reverse' ? '1;0' : '0;1'}
                               keyTimes="0;1" calcMode="linear"
                               path={path}/>
              </circle>
              {label && dir === 'forward' && phase === 0 && (
                <text fontSize={9} fill={color} textAnchor="middle" dy={-7}
                      pointerEvents="none"
                      style={{ fontFamily: 'var(--font-mono)' }}>
                  {label}
                  <animateMotion dur={`${dur}s`} begin="0s"
                                 repeatCount="indefinite"
                                 keyPoints="0;1" keyTimes="0;1" calcMode="linear"
                                 path={path}/>
                </text>
              )}
            </Fragment>
          ))
        )}
      </g>
    </g>
  );
}
```

Verified: 22 active `<animateMotion>` elements on the default diagram, with `data-phase` staggering and `data-dir` reversing via `keyPoints="1;0"`.

## 11. Mini tooltip via `title` attribute

The site relies heavily on the native HTML `title` attribute for tooltips on toolbar buttons (rather than a custom tooltip library):

```html
<button aria-label="Delete selection" title="Delete / Backspace" …>…</button>
<button title="Drag handle → node" …>…</button>
<button title="Drag to slide along the edge · double-click to centre" …>…</button>
```

This means **no tooltip library** is needed — `<button title="…">` and `<div title="…">` do all the work.

## 12. Keyboard shortcut display chip (in Help dialog)

```html
<dt class="text-faint">Play / pause data flow</dt>
<dd class="ml-auto">
  <kbd class="px-1.5 py-0.5 rounded bg-surface-2 border border-border
              text-xs font-mono">Space</kbd>
</dd>
```

Verified by reading the `<dt>` / `<dd>` shortcut list inside the Help dialog.

## Summary

A reimplementation that wants to feel like GravelGraph needs at least these 12 primitives. None require a third-party library beyond `@xyflow/react`, Tailwind v4, and Zustand.