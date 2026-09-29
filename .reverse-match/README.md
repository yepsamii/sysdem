# Reverse Match Artifacts

Evidence captured by the `/reverse-match` skill loop.

## Layout

```
.reverse-match/
├── screenshots/         # reference / local / diff per iteration
│   └── iteration-NNN-*.png
├── measurements/        # DOM bboxes, computed styles, tokens per iteration
│   └── iteration-NNN.json
└── README.md            # this file
```

## Naming convention

```
iteration-NNN-reference.png   # the live reference at the iteration's viewport
iteration-NNN-local.png       # the local implementation at the same viewport
iteration-NNN-diff.png        # pixel-diff overlay (when useful)
```

## Per-iteration measurement JSON

```json
{
  "iteration": 1,
  "viewport": { "width": 1440, "height": 900 },
  "reference": { "url": "https://www.gravelgraph.com/", "title": "GravelGraph" },
  "local":     { "url": "http://localhost:5173/",          "title": "…" },
  "captured_at": "2026-09-29T23:15:00Z",
  "selectors": [
    {
      "selector": "header",
      "reference": { "bbox": { "x": 0, "y": 0, "width": 1440, "height": 48 }, "computed": { … } },
      "local":     { "bbox": { … }, "computed": { … } }
    }
  ]
}
```

The progress document (`REVERSE_MATCH_PROGRESS.md`) points to these files as evidence for each iteration's verification step.
