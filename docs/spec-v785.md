# spec-v785.md — OLBI (Oldenburg Burnout Inventory)

> Status: **SHIPPED (2026-08-26).** Builds the `olbi` tile. Catalog **1576 → 1577**, group G.

## Why

spec-v780 opened the clinician-wellbeing vein with the Copenhagen inventory. The OLBI is the
other free burnout instrument in common use, and it measures a genuinely different second
dimension: **disengagement** from the work, not just exhaustion by it. Where Maslach is
license-gated, both of these are usable.

## What it does

Sixteen statements answered strongly agree → strongly disagree.

| Subscale | Items | Range |
| --- | --- | --- |
| Exhaustion | 2, 4, 5, 8, 10, 12, 14, 16 | 8–32 |
| Disengagement | 1, 3, 6, 7, 9, 11, 13, 15 | 8–32 |
| Total | | 16–64 |

**Items 2, 3, 4, 6, 8, 9, 11, 12 are reverse scored**, and this is the whole difficulty of the
instrument: **each subscale mixes four forward and four reverse items**, so neither can be
scored by adding answers up. The tile takes the raw answer and applies the direction itself.

That structure gives an unusually strong self-check, which is the tile's headline test:
**answering every item identically must land on 20 of 32 on both subscales.** A naive summer
would return 8 or 32. The same structure independently corroborates the reverse list — the
published description says each subscale holds four positively and four negatively worded
items, and the reverse list from the sources produces exactly that split.

**Worked example:** every item answered "agree" → exhaustion **20**, disengagement **20**,
total **40 of 64**.

## Posture (spec-v97)

A self-report measure, not a clinical diagnosis or an occupational-health determination.
**No cutoff is asserted.** Here the sources actively disagree: one publishes bands
(≤43 / 44–51 / ≥52), another states plainly that no widespread consensus exists. Under the
spec-v97 gate that is a disagreement, so neither is shipped.

The item wording belongs to the OLBI form and is **not reproduced**. Each item is identified
by its number, its subscale and its scoring direction — which is exactly the part a scorer
needs and the part that is easy to get wrong.

## Files

- `lib/olbi-v785.js` — `olbi()`, `OLBI_NOTE`, `REVERSE_SCORED`.
- `views/group-v785.js` (RV785) — sixteen agree-to-disagree selects; a11y-checked.
- `mcp/adapters/olbi-v785.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, both subscales, the reverse list, related (cbi, fss, k6).
- `test/unit/olbi.test.js` — 7 tests (the identical-answers midpoint, four reverse items per subscale, both extremes, opposite movement of a forward vs reverse item, subscale membership, invalid input).
- `docs/spec-v785.md` (this file).

## Note on the renderer

The DOM ids are written out as sixteen literals rather than built in a loop. The tool-page
builder resolves a select's option **text** by finding the literal id beside its options list;
a computed id leaves the pre-rendered page printing the raw value (`agree`) where the screen
reads "Agree". `check-page-copy` caught this — it counts raw-value rows catalog-wide and the
loop form pushed the count from 40 to 56.

## Sourcing (spec-v97)

Demerouti E, Bakker AB, Vardakou I, Kantas A. *Eur J Psychol Assess.* 2003;19(1):12-23;
English validation Halbesleben JRB, Demerouti E. *Work & Stress.* 2005;19(3):208-220. The
subscale membership, the reverse-scored item list, the 1–4 anchors and the 8–32 / 16–64 ranges
were confirmed against two independent scoring references that agreed item-number for
item-number, and the lists are additionally consistent with the published four-forward,
four-reverse structure of each subscale.
