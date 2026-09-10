# spec-v1227 — the rest of the shape

[spec-v1226](spec-v1226.md) fixed three files by hand. This is every remaining
library file that shares the helper:

```js
function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;   // three things,
  return n;                                                     // one null
}
```

…with a caller that reads `null` as absent and builds a `missing` list from it,
so an impossible value is reported as a blank one and retyping it changes
nothing.

## What is in it

Ten files, 33 functions, **17 more of the probe's rows** (72 → 55):

| file | what it holds |
| --- | --- |
| `lib/acs-v193.js` | CRUSADE, SCAI shock, Zwolle, TIMI risk index, CADILLAC |
| `lib/vent-v195.js` | S/F ratio, ventilatory ratio, OSI, ventilation index |
| `lib/ophtho-v164.js` | IOL power, ocular perfusion pressure |
| `lib/specialtymath-v186.js` | BED/EQD2, PISA EROA, LV wall stress, DLCO correction |
| `lib/endo-quant-v197.js` | SPINA-GT, SPINA-GD, Jostel TSH index, HOMA-β, oral disposition index |
| `lib/oneformula-v167.js` | mean airway pressure, cerebroplacental ratio, toe-brachial index |
| `lib/heme-staging-v188.js` | Binet, Rai, Hasford |
| `lib/onc-staging-v187.js` | RECIST, Glasgow prognostic score |
| `lib/radiology-v165.js` | CT effective dose |
| `lib/pk-v166.js` | chlorpromazine equivalents |

Three files that matched the *file*-level pattern are **not** in it —
`lib/ebm-v163.js`, `lib/echo-v158.js`, `lib/endo-metab-v161.js`. The first has no
bounded field to report; the other two build their missing-value message in a
different shape and are left for a wave that reads them.

## The one edit to a label

Each row's label is the string the function's own `missing` list already used, so
both sentences name the field the same way. The exception is a label that prints
its own range:

```
'SpO₂ (%, 1–100)'  ->  "SpO₂ (%, 1–100) must be between 1 and 100."
```

— said twice. And on FiO₂, said twice *and differently*: the label reads
`0.21–1.0` while the code enforces `0.18`. The printed range is dropped from the
range sentence (`SpO₂ (%)`, `FiO₂ (fraction)`) and the blank-field message keeps
the label exactly as it was. The **enforced** bound is untouched — moving FiO₂
from 0.18 to 0.21 would change which inputs compute, and this wave changes none.

## How it was done, and what checked it

Mechanically: for each function, the `const x = pos(o.arg, MAX)` declarations
were matched to the `if (x === null) missing.push('label')` lines that follow
them, and a `gradeFault` row built from the pair. A `pos(o.x)` with no `max` is
skipped — there is no bound to report — and so is a bound written as a named
constant rather than a literal, which is conservative in the right direction.

The check that matters is that **the same inputs still compute**: 13,605 unit
tests, `example-correctness` over every worked example on every tile, and
`required-field-agreement`, which clears each declared-required field in the
browser and asserts the tile refuses.

## One field, two ranges

`test/integration/two-ranges-one-field.spec.js` is a probe, not a gate — it
reports and never asserts — and it caught something this program's own previous
wave had introduced. [spec-v1224](spec-v1224.md) gave the five SCORE2-family
engines the `BOUNDS.sbp` envelope in the library, and the page then said two
things about the same field, in two live regions stacked above the answer:

```
Check the highlighted value: Systolic BP (mmHg) is 3000, outside the
  60 to 250 this field accepts.
Input above the plausible range for systolic blood pressure (20 to 300 mmHg);
  verify the units.
```

Both sentences are correct about their own source and they disagree about the
field. [spec-v1198](spec-v1198.md) settled which one wins — *a view's ceilings
ARE `lib/bounds.js`'s* — so the five fields in `views/group-v28.js` now take
their `min`/`max` from `BOUNDS.sbp`, through one named constant rather than five
literals. The probe goes 5 rows to 0.

Worth saying plainly: **a wave in this program created the row the same
program's probe then found.** Adding a refusal adds a sentence, and a page that
was silent about a field's range now publishes one.

## Ledger

`probe-envelope-unbounded`, second section: **89 rows → 72 (spec-v1226) → 55.**
The first section is unchanged at 94 / 54.
