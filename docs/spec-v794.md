# spec-v794.md — Furst ratio (urine/plasma electrolytes)

> Status: **SHIPPED (2026-08-26).** Builds the `furst-ratio` tile. Catalog **1585 → 1586**,
> group G.

## Why

The catalog could plan a **correction rate** (`sodium-correction`, Adrogué-Madias) and
compute **electrolyte-free water clearance** (`efw-clearance`). It could not answer the
question a hospitalist actually asks first in SIADH: **will fluid restriction work at all,
and to how many millilitres?**

## What it does

    U/P electrolyte ratio = (urine Na + urine K) / serum Na      all in mmol/L

from a spot urine. The ratio says how much of the urine is electrolyte-free water, which is
what determines whether holding intake down can raise the serum sodium.

| Ratio | Published starting point |
| --- | --- |
| under 0.5 | fluid restriction **1000 mL/day** |
| 0.5 – 1.0 | fluid restriction **500 mL/day** |
| above 1.0 | **no electrolyte-free water is being excreted** — restriction alone is unlikely to help, however tight |

The above-1.0 case is the one that changes the plan rather than tightening it: the kidney is
generating free water, so each void makes the sodium *lower*. Tests pin both boundaries —
exactly 0.5 lands in the 500 mL band, and exactly 1.0 is still restrictable while anything
above it is not.

**Worked example:** urine Na 60 + urine K 40 over serum Na 125 → **0.80**, restrict to
500 mL/day.

A test also confirms potassium is genuinely added rather than ignored: dropping urine K from
40 to 0 moves the same patient from 0.80 to 0.48 and across a band boundary.

## Not a duplicate of `efw-clearance`

They are related and deliberately separate. `efw-clearance` needs the **urine volume** and
returns a clearance **rate** — it answers "is the kidney excreting free water." This returns
the dimensionless **ratio** and the restriction **volume** that goes with it — it answers
"how much may this patient drink." The Furst ratio is in fact the bracketed term inside the
clearance formula. Both tiles link to each other.

## Posture (spec-v97)

Guides **how** to restrict. Not a diagnosis of the cause of hyponatremia, not a
correction-rate plan, and not a reason to delay treating a symptomatic patient.

## Files

- `lib/furst-ratio-v794.js` — `furstRatio()`, `FURST_NOTE`.
- `views/group-v794.js` (RV794) — three mmol/L inputs; a11y-checked.
- `mcp/adapters/furst-ratio-v794.js` — exposes the tile (clinical disclaimer), and states the distinction from `efw-clearance` in its own header.
- `lib/meta.js` — citation, example, formula, all three bands, related (efw-clearance, sodium-correction).
- `test/unit/furst-ratio.test.js` — 6 tests (worked example, the 1000 mL band, the 0.5 boundary, the 1.0 boundary from both sides, potassium contributing, required and range-checked inputs).
- `docs/spec-v794.md` (this file).

## Sourcing (spec-v97)

Furst H, Hallows KR, Post J, et al. *Am J Med Sci.* 2000;319(4):240-244 (PMID 10768609).
The formula and all three restriction bands were read verbatim off the published European
consensus statement on inpatient hyponatremia and SIADH (Grant P, et al. *Eur J Clin Invest.*
2015;45(8):888-894), which states them explicitly; the above-1.0 rule was separately confirmed
against an independent description. The 0.5 split appears in the consensus statement and is
attributed to it rather than to the 2000 primary paper.
