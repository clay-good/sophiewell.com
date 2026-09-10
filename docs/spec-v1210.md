# spec-v1210 — the last five, and the row that was never real

`scripts/probe-unguarded-sibling.mjs` reads **0 modules, 0 functions**, with its
reach unchanged: 20 modules call a watched guard, 17 export more than one
function and are comparable, 190 siblings read no numeric input at all. The
question it was built to ask in [spec-v1202](spec-v1202.md) — 13 modules and 41
functions then — has no rows left.

Getting there needed one fix to the probe and five to the catalog.

## The probe was reporting a function that reads no numbers

`rutherfordFontaine` takes a single string key into a lookup table. It has no
numeric input to guard, and the probe printed it anyway.

The cause is one line: a function's body was `src.slice(here, nextExportFunction)`,
so it swept up every module-level constant, lookup table and private helper
declared in between and attributed them to the function above. The `pos(` that
convicted `rutherfordFontaine` belonged to the code after it.

The body now ends at the function's **own** closing brace. The same trap
`field-helpers-honour-bounds.test.js` documents applies to the fix and is handled:
brace-match from the `{` after the **parameter list**, because `input = {}` is a
brace too, and matching that one returns the signature alone.

This is the third time a finder here has been wrong before it was right
([spec-v1203](spec-v1203.md) twice). A new gate gets negative-tested, and so does
a change to an old one: the corrected probe still found all five rows below.

## The five

Two shapes, both of which look like a guard from a few feet away.

### A silent clamp

| tile | entered | said before |
| --- | --- | --- |
| `lund-browder` | a region charted as `50` — a percent | scored `1.0`, the **whole** region: 3.5% TBSA became 7% |
| `ufr-dialysis` | 9,999 hours, or a 9,999 kg patient | *Ultrafiltration rate 0 mL/kg/hr: at or below the 13 mL/kg/hr threshold* |

`lund-browder` is the one to sit with. Percent-versus-fraction is the commonest
slip that field can have, %TBSA is what the fluid resuscitation is calculated
from, and the tool doubled it without a word. [spec-v1016](spec-v1016.md) already
fixed this field's other end — an unmarked chart is not a 0% burn.

`ufr-dialysis` fails in the reassuring direction for an arithmetic reason worth
naming: the rate is volume / (weight × hours), so an impossible **denominator**
drives the answer toward zero and under the risk threshold.

### A dead end, and a saturating model

| tile | entered | said before |
| --- | --- | --- |
| `kfre` | an age of 9999 | *0% 2-year and 0% 5-year probability of treated kidney failure* |
| `nmr` | an ANC of 9999 | *Enter absolute neutrophil count* |
| `urine-osmolal-gap` | a urine sodium of 99,999 | reasoned about a gap of −199,665 mOsm/kg |

`kfre` is the most dangerous of the ten fixed across this wave and the last. The
linear predictor **saturates**, so an impossible age does not produce an
obviously broken number — it produces a clean, plausible, reassuring one. The
same patient at 60 reads 2.6% and 7.9%.

`nmr` is the dead end `inputFault` was written for. `pos(v, lo, hi)` returns
`null` for a blank, for a non-number *and* for a value outside the range, and the
caller reads `null` as absent — so the reader is asked for the value they just
entered, retypes it, and gets the same sentence.

## Urine is not serum

`urine-osmolal-gap` reads five urine values, and `lib/bounds.js` is the wrong
table for every one of them. `BOUNDS.sodium` is **serum** sodium at 90-200 mmol/L,
while a urine sodium of 20 is normal — [spec-v1205](spec-v1205.md)'s trap in its
compartment form, and the reason `BOUNDS.wbc` once refused every legitimate CPIS
leukocyte count. Each ceiling here is the assay's own, and a test pins that a
urine sodium of 20 still computes.

## Two more tests had pinned the old behavior

[spec-v1209](spec-v1209.md) found four. Two more turned up here:

- `lund-browder` asserted that a region fraction of **5** should read as the
  whole region.
- `urine-osmolal-gap` used a urine sodium of **2,000** to reach its negative-gap
  branch — a value that is now refused before it gets there, so the case moves to
  300, which is high and real.

Both now assert the refusal, and each keeps a sibling test that the top of the
real range still computes.

## Proof

Lint (19 gates), **13,551** unit tests (15 new) and 448 MCP tests pass. All five
tiles' worked examples still compute and match. Every bound is the scale's own
definition, the assay's, or already in `lib/bounds.js` — nothing clinical is
decided here ([spec-v1189](spec-v1189.md)).
