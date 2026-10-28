# spec-v1688 — The design-system cleanup, as shipped

> Status: **SHIPPED (2026-10-27)**: presentation only, no new tool and no changed number. Follows [spec-v1687](spec-v1687.md).

[docs/design.md](design.md) described a component set the site did not yet have: the file readers
still used the raw native file input, a result band was a sentence, a two-way choice was a dropdown,
and a tile that answered with several numbers stacked them as `Label: Value` lines. This is what was
built against it, and what now holds it in place.

## What changed on screen

| Component | Built as | Where it is used |
|---|---|---|
| Dropzone card | `dropzone(input)` in `lib/components.js` wraps the native input, which stays the accessible control | every file reader; `intake` keeps its own folder/zip drop handling inside the same card |
| Segmented control | `segmentedFromSelect(select)` renders a radiogroup **over** a `<select>` that stays in the DOM as the value model | the short sex and formula choices, in place of a dropdown |
| Status chip | `statusChip(severity, label)` | the answer card of a banded score, with severity authored from the band the tile already computes |
| Stat grid | `statGrid(cells)`, reached by `resultRow(o, items, { stats: true })` | a tile that answers with several numbers at once |
| Input chip | `.chip--input` with a remove button | the files chosen or dropped on a dropzone |

Two rules decide where a component is allowed. A **status chip's severity is authored at the
compute's own band or score, never inferred** from a value against a printed range: the band ranges
are free text and a tile's compute tiers can differ from the tiers its interpretation table prints,
so matching one to the other invents a claim. A **stat cell holds a number**: a `label:` row whose
value is a criterion met or not met, a "flagged"/"not flagged", or an "(enter a weight)" fallback is
a verdict, and it stays a list row.

## Why it is safe

Nothing above changes a computed value, a threshold, a citation, an example, an MCP adapter or a
deep-link hash. The two renderers that gained a component (`lib/result-copy.js`, `lib/screener.js`)
take it as an **opt-in**: a caller that passes nothing renders exactly what it rendered before. The
copy payload is built from the items a tile supplies, not from the DOM, so it is identical with and
without the grid, and every number a list stated is still on the page — which is what the worked
example sweep reads.

## Proof

- `test/unit/result-copy-stats.test.js` — document order survives the grid, the copy payload does not change, and the list path is untouched without the opt-in.
- `test/unit/design-components.test.js` — a status chip carries its word; a band authoring a severity with no label renders no chip rather than a wordless one.
- `scripts/check-design-system.mjs` (in `npm run lint`) — no view styles itself inline, no file input sits off the dropzone card, and `.chip--status` is reachable only through the builder. Checked against a deliberately dirtied view.
- `mobile-no-hscroll` samples the three new shapes at 320 and 360px; `mobile-touch-targets` holds the segmented options and the remove chip to 44px. Both were checked to fail when the component shrinks.
- The catalog-wide sweeps — worked-example correctness, `answer-said-once`, and the 320px pass over every tile — were green on each wave.
- Contrast was measured on the components **as they render**: each one's own translucent tint composited over the tinted answer card, in both themes. Read that way three severity chips and the chosen segmented option were just under the 4.5:1 AA floor for normal text (4.45, 4.12, 4.10, 4.45) although the raw token pairs passed, and the primary stat cell's caption fell to 3.5:1 in dark mode. All five are fixed and now measure 4.95:1 to 11.5:1.

## What is left

The rollout, not the system: more banded tiles can author a severity, and the remaining multi-number
results can opt into the grid. `test/integration/design-conformance-probe.spec.js` (`RUN_PROBES=1`)
counts both, and `openspec/changes/design-system-cleanup/tasks.md` tracks the waves.
