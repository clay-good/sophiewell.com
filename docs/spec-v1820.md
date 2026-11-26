# spec-v1820 — A stroke scale that stops at 42

> Status: **SHIPPED (2026-11-26)**: the four NIHSS fields that did not state the scale's own range now do,
> on both surfaces. 1 library file, 1 adapter, 2 tests. No published number changed; the catalog stays
> 2,390.

## Four of eight

`probe-unguarded-sibling` finds the guard that is already in the file, one function away: when one exported
function of a module calls a bounds helper and its neighbours do not, that is almost never a considered
difference. It was last driven at [spec-v1731](spec-v1731.md), which found 49 fields needing an envelope
`lib/bounds.js` does not have. Re-driven after the declaration program of
[spec-v1793](spec-v1793.md) to [spec-v1819](spec-v1819.md), the residue is **fifteen** — and one of the
fifteen needed no source at all.

**The NIHSS runs 0 to 42 by construction**: 42 is the sum of the scale's fifteen item maxima. The catalog
has eight NIHSS fields, and four of them said so while four did not:

| Tile | Before |
|---|---|
| `max-ich`, `sits-sich`, `astral`, `span-100` | refused 43 and above |
| `dragon-stroke`, `hat-score`, `sedan-score`, `thrive-stroke` | answered 999999 |

All four of the second group live in `lib/neuro-v117.js`, each with a `nihss < 0` guard and nothing above.
A baseline NIHSS of 999999 scored the top severity band in DRAGON, HAT, SEDAN and THRIVE — *"miserable
outcome"*, from a number the scale cannot produce — and was refused next door. The guard sits beside each
function's existing non-negative check, where the `ageYears` envelope already sits in `dragonStroke`, and
takes a **whole number**, because every item of the scale is one. All four agent-surface fields declare
`min: 0, max: 42` now, so neither surface is the only place the range lives.

## What the re-drive leaves

Fourteen fields, and every one is a quantity `bounds.js` does not have: a total cholesterol (three tools), a
high-sensitivity CRP and a CRP in mg/L, an FEV1 percent predicted, a net QRS deflection in mm, the three
ABC/2 hematoma diameters in cm, a lung-nodule diameter in mm, a chronological age in **months**, and a spot
urine creatinine. Each needs its source rather than a wave ([spec-v1206](spec-v1206.md)).

The last two are worth naming as the trap [spec-v1797](spec-v1797.md) closed: `ageYears × 12` and `scr` are
envelopes for a **different quantity**, and borrowing one for its ceiling is an obfuscated literal rather
than a bound. A spot urine creatinine runs an order of magnitude above a serum one; a 0.1-75 mg/dL fence
would refuse a normal urine.
