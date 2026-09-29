---
name: reverse-match
description: Iteratively observe a reference website, compare it to a local implementation, fix one mismatch at a time, verify in the browser, and update a persistent progress document. Use when a local app needs to converge toward a reverse-engineered reference (e.g. matching gravelgraph.com recreation against https://www.gravelgraph.com/).
---

# Reverse Match

Iteratively recreate and match a local implementation against a reference website.

This skill is for situations where the reference website has already been reverse-engineered and the local implementation exists, but the implementation needs to converge toward the reference through repeated inspection, comparison, implementation, and verification.

## Core principle

**Do NOT attempt to recreate everything in one pass.**

Instead:

```
Reference
    ↓
Observe
    ↓
Compare with localhost
    ↓
Identify mismatches
    ↓
Prioritize ONE mismatch
    ↓
Fix it
    ↓
Verify
    ↓
Update progress document
    ↓
Repeat
```

The goal is **progressive convergence**, not a generic approximation.

## Inputs

The user may provide:

- **Reference URL** (e.g. `https://www.gravelgraph.com/`)
- **Local URL** (e.g. `http://localhost:5173/`)
- **Specific page/path** (e.g. `/?embed=1`)
- **Optional viewport size**
- **Optional scope** (homepage, navbar, hero, footer, etc.)

If the reference URL or local URL is not known, ask for them.

Default local URL: `http://localhost:3000`. Do not assume the port if the user has already provided a different one.

## Phase 1 — Read existing context

Before making changes:

1. Read `REVERSE_ENGINEERING.md` if it exists.
2. Read `REVERSE_MATCH_PROGRESS.md` if it exists.
3. Inspect the existing project structure.
4. Determine the frontend framework and development command.
5. Determine how the local application is currently accessed.
6. Check whether Playwright/browser tooling is available.

Do not rewrite existing documentation. Continue from the current state.

## Phase 2 — Establish the comparison environment

Open both:

- `REFERENCE_URL`
- `LOCAL_URL`

Use the same viewport dimensions whenever possible.

Default viewport: `1440 × 900`.

Also check responsive layouts when relevant (420 × 820 mobile, 768 × 1024 tablet).

For each comparison, keep the following **consistent**:

- viewport
- browser
- zoom
- page path
- scroll position
- interaction state

Do not compare screenshots taken under different conditions.

## Phase 3 — Inspect before changing anything

Inspect both implementations. Compare:

**Layout**

- page width
- container width
- horizontal alignment
- vertical positioning
- section heights
- gaps, padding, margins
- grid/flex structure
- element positioning

**Typography**

- font family
- font loading
- font size
- font weight
- line height
- letter spacing
- text width / wrapping

**Visual styling**

- colors
- gradients
- borders, border radius
- shadows
- opacity
- backgrounds
- overlays, blur effects

**Components**

- navbar, hero, cards, buttons, forms, menus, footer
- modals, tabs, carousels
- repeated components

**Assets**

- images, SVGs, icons, logos
- fonts
- videos, background assets

**Behavior**

- hover, focus, click
- navigation, dropdowns, modals
- scrolling, animations, transitions
- loading states

## Phase 4 — Generate mismatch list

Create or update `REVERSE_MATCH_PROGRESS.md`. Every discovered mismatch should have an entry using the format documented in `REVERSE_MATCH_PROGRESS.md`.

Do not invent measurements. If an exact measurement cannot be established, say so.

## Phase 5 — Prioritize

Do NOT fix all mismatches at once. Select exactly ONE next mismatch.

Prioritize approximately in this order:

1. Major structural / layout differences
2. Incorrect page dimensions
3. Incorrect section positioning
4. Major typography differences
5. Missing / incorrect assets
6. Component sizing
7. Colors / backgrounds
8. Spacing
9. Borders / shadows
10. Animations
11. Minor pixel-level differences

However, use judgment. **A mismatch that affects many downstream elements should be fixed before smaller independent differences.** For example, if the container is too narrow, multiple cards will overflow — fix the container first; do not fix each card separately.

## Phase 6 — Explain the selected mismatch

Before editing code, record in the progress document:

```
## Current Iteration

### Selected mismatch
MM-NNN — <short title>

### Why this mismatch was selected
<impact reasoning>

### Reference observation
<exact observation>

### Local observation
<exact observation>

### Root-cause hypothesis
<best explanation>

### Planned change
<smallest sufficient change>
```

Then implement the smallest appropriate change.

## Phase 7 — Implement

Modify the existing implementation. Rules:

- Prefer existing components.
- Reuse existing design tokens.
- Do not unnecessarily rewrite components.
- Do not introduce dependencies unless necessary.
- Do not replace working architecture merely to solve a visual mismatch.
- Avoid hardcoding values when the reference clearly implies a reusable layout rule.
- Preserve responsive behavior.
- Preserve existing functionality.

If the problem is caused by architecture rather than styling, fix the architecture.

## Phase 8 — Verify with browser

After the change:

1. Reload localhost.
2. Navigate to the affected page.
3. Reproduce the same state on the reference.
4. Capture comparable screenshots into `.reverse-match/screenshots/`.
5. Inspect relevant DOM elements.
6. Compare bounding boxes when useful.
7. Compare computed styles when useful.
8. Test the affected interaction if applicable.

Do not assume the fix worked because the code looks correct. **The browser result is the source of truth.**

## Phase 9 — Determine result

Classify the mismatch:

- **Fixed** — reference and local match sufficiently.
- **Improved** — difference became smaller but still exists.
- **Unchanged** — modification did not address the actual cause.
- **Regressed** — modification introduced another mismatch.

If the change was ineffective, **investigate the root cause** before attempting another random adjustment.

## Phase 10 — Update progress

After EVERY iteration, update `REVERSE_MATCH_PROGRESS.md` with:

- Target mismatch
- Change made
- Reference vs Local verification (with evidence pointers)
- Result
- Remaining difference
- New mismatches discovered
- Next mismatch

Do not merely write "Fixed hero." The progress document must contain enough detail for another agent or developer to continue the process without repeating previous investigation.

Also save a per-iteration evidence snapshot:

```
.reverse-match/
├── screenshots/
│   ├── iteration-001-reference.png
│   ├── iteration-001-local.png
│   ├── iteration-001-diff.png
│   └── …
└── measurements/
    ├── iteration-001.json
    └── …
```

The progress document references these artifacts instead of relying entirely on textual description.

## Phase 11 — Continue the loop

After updating the progress document:

```
if significant mismatches remain:
    select next highest-impact mismatch
    repeat
else:
    perform final verification
```

Do NOT stop after fixing one mismatch unless the user explicitly asks for one iteration only. However, do not blindly perform an unlimited number of iterations. Before each iteration, check whether the remaining difference is meaningful.

## Final verification

When the page is sufficiently close, compare:

- desktop
- mobile
- tablet (if relevant)
- initial page state
- important interactive states
- navigation
- hover states
- dropdowns / modals
- scrolling behavior
- animations where practical

Then update the progress document's `## Final Verification` section.

Do not claim pixel-perfect accuracy unless it has actually been verified.

## Important rules

1. **Never guess when you can inspect.** Bad: "The padding looks like 40px." Good: "Reference bounding box indicates approximately 40px." Or: "Exact value could not be determined from the rendered page."

2. **One primary mismatch per iteration.** Do not simultaneously change navbar + hero + footer + font + cards unless they are all consequences of the same root cause. The purpose of iterations is to maintain causality.

3. **Root causes over symptoms.** If five elements are shifted by the same amount, investigate the parent container before changing five children.

4. **Reference is the visual source of truth.** Do not change the reference to make comparison easier.

5. **Code quality still matters.** Do not reproduce visual behavior using fragile hacks when a clean implementation can produce the same result.

6. **Preserve discovered knowledge.** Never discard previous findings from `REVERSE_ENGINEERING.md` or `REVERSE_MATCH_PROGRESS.md`. Treat these files as the accumulated reverse-engineering knowledge base.

7. **Screenshot comparison is not enough.** When useful, combine: screenshot + DOM inspection + bounding boxes + computed styles + browser interaction + network behavior. Use the cheapest reliable method for the question being investigated.

## Project conventions for this repo

This project reverse-engineers `https://www.gravelgraph.com/`. Use these defaults unless the user overrides:

- **Reference URL**: `https://www.gravelgraph.com/`
- **Local URL**: `http://localhost:5173/` (Vite default — confirm by checking `package.json` `dev` script)
- **Viewport**: 1440 × 900 desktop, 420 × 820 mobile, 768 × 1024 tablet
- **Design tokens**: see `REVERSE_ENGINEERING.md` §4 (light/dark color tokens, Inter sans, JetBrains Mono)
- **Canvas library**: `@xyflow/react` v12
- **State**: Zustand
- **Styling**: Tailwind v4

## Invocation

```
/reverse-match
/reverse-match https://www.gravelgraph.com/ http://localhost:5173/
/reverse-match https://www.gravelgraph.com/ http://localhost:5173/ "focus on header"
```

When invoked, the skill should immediately:

1. Read previous progress (`REVERSE_MATCH_PROGRESS.md`).
2. Inspect the reference.
3. Inspect localhost.
4. Compare them.
5. Find mismatches.
6. Select the highest-impact unresolved mismatch.
7. Explain the mismatch internally and in the progress document.
8. Modify the implementation.
9. Verify the change in the browser.
10. Record the result.
11. Continue to the next mismatch.
12. Repeat until the page is sufficiently matched or the user stops the process.

**Never treat the first generated implementation as the final result.**