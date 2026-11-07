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
| Status chip | `statusChip(severity, label)` | the answer card of a banded score, with severity authored from the band the tile already computes (directly, or by putting `severity` + `severityLabel` on the band item a shared renderer takes) |
| Stat grid | `statGrid(cells)`, reached by `resultRow(o, items, { stats: true })` | a tile that answers with several numbers at once |
| Input chip | `.chip--input` with a remove button | the files chosen or dropped on a dropzone |

Where a compute already returns an ordinal tier at its published cut, the chip is a mapping and
nothing is authored twice: the view maps that tier to a severity token by its **rank inside its own
instrument**, and the chip's label states the authored word verbatim. Rank, not name-matching -- a
four-tier instrument spends all four tokens so its own levels stay distinguishable, which is why the
ISI's `moderate` tier wears the `high` token while its `severe` tier wears `critical`. A tier whose
word is not a severity at all is the limit of this: the ABC scale's `high` means high physical
functioning, so it gets no chip rather than a red one on a reassuring answer.

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
- `test/unit/chip-severity-maps.test.js` — every per-tile tier-to-severity map covers exactly the tiers its compute can return, and maps them only to real tokens with a word. A map that misses a tier is the quiet failure here: the lookup yields nothing, so the band renders **no chip** for exactly the patients in that tier while everything else still reads correctly. Checked against both dirtied shapes (a mistyped key, a token that does not exist).
- `test/unit/design-components.test.js` — a status chip carries its word; a band authoring a severity with no label renders no chip rather than a wordless one.
- `scripts/check-design-system.mjs` (in `npm run lint`) — no view styles itself inline, no file input sits off the dropzone card, and `.chip--status` is reachable only through the builder. Checked against a deliberately dirtied view.
- `mobile-no-hscroll` samples the three new shapes at 320 and 360px; `mobile-touch-targets` holds the segmented options and the remove chip to 44px. Both were checked to fail when the component shrinks.
- The catalog-wide sweeps — worked-example correctness, `answer-said-once`, and the 320px pass over every tile — were green on each wave.
- Contrast was measured on the components **as they render**: each one's own translucent tint composited over the tinted answer card, in both themes. Read that way three severity chips and the chosen segmented option were just under the 4.5:1 AA floor for normal text (4.45, 4.12, 4.10, 4.45) although the raw token pairs passed, and the primary stat cell's caption fell to 3.5:1 in dark mode. All five are fixed and now measure 4.95:1 to 11.5:1.

## What is left

The rollout, not the system: more banded tiles can author a severity, and the remaining multi-number
results can opt into the grid. `test/integration/design-conformance-probe.spec.js` (`RUN_PROBES=1`)
counts both, and `openspec/changes/design-system-cleanup/tasks.md` tracks the waves.

The chip rollout's mechanical shapes are spent as of batch 7: every compute that hands its view an
ordinal tier carries a chip, as do the four whose band helper assigns an ordered severity word with
no unassigned state. What is left turns on the instrument rather than the code. Two tiles (SNOT-22,
GAGS) are chippable but would need the map guard to accept a deliberately unmapped value -- both
already model their gap honestly, returning a band marked "NOT the mild band" below 8 and a null
band at the one score the published table leaves out, so the lookup yields no chip by itself; the
guard just cannot yet tell an intentional omission from a missed tier. Global ARDS was left alone
because its own copy says it is a definition and not a severity score, and two of its four
categories carry no grade. The rest have no tier at all, so a chip there means authoring a cut per
tile -- and a wrong colour on a banded answer states a clinical claim the instrument does not make.

It counts both only as of chip batch 5. This section claimed it did while the probe had no chip
category at all -- it sized the stat-grid wave and the two formatting categories, and the chip
rollout was tracked by reading commits. The probe now reports the banded answers that carry no chip
(1,452 calls) and, of those, the ones whose own compute already returns an ordinal tier (37), which
is the shape where a chip is a mapping rather than a new claim.

The probe's own count was wrong until the third stat-grid batch. It read each `resultRow` call
through a fixed 40-line window, and a single-line `resultRow(o, [...]);` does not end on a line the
window recognized as a terminator -- so the read ran on into the tiles below and counted their
`label:` rows as part of the call. One-row calls were reported as three-row candidates, and the
total read 218 against a true 133. The call is now read by balancing parentheses.

A truthful total still was not a pickable list, because the bar is narrower than three labeled rows:
a stat cell holds a **number**, so every labeled row has to be one. The probe now applies that bar
itself on a second line, separating a unit in the template text (`${r.total} of ${r.max}`) from
prose that reads as a verdict (`${r.yesCount} yes`), a `metTag()` row, or a `(enter a weight)`
fallback. It over-reports rather than under-reports -- a bare `r.someProperty` could be either, so it
counts as a number and the pick is confirmed against the rendered tile. That narrowed 133 calls to
38 worth reading, of which 11 qualified and shipped.

Then the classifier itself was wrong twice, both found by reading its own output rather than by a
test: `NUMERIC` matched `age` inside `stage`, and the name test only looked at a bare `r.x`, so a
value whose text is only a separator, with both halves read from word-valued properties, left no
literal word behind to catch. Names are matched by camelCase segment now, and every read in a value is tested.
That takes the list from 27 to **3** -- and those three are judged rather than pending: the
enoxaparin panel mixes conditional text rows into its numbers, the naloxone doses are strings
("0.4 mg IV") behind neutrally-named reads, and a Fazekas grade is an ordinal printed as a digit.
Checked the other way too: stripping the opt-in off four shipped tiles brings all four back onto
the list, so the tighter rule hides nothing real. **The stat-grid rollout is complete**, 122
three-row calls notwithstanding -- the rest state a verdict in at least one row.
