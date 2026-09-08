# spec-v1147 — five different ten-year risks for the same patient

First batch out of [spec-v1146](spec-v1146.md)'s backlog: the rows where a tile
prints a number that is not a measurement.

## `prevent`

PREVENT 2023 takes six numbers. Its library guards them:

```js
if (![age, totalChol, hdl, sbp, bmi, egfr].every(Number.isFinite)) {
  return { score: null, band: 'Enter age, total cholesterol, HDL, systolic BP, BMI, and eGFR.' };
}
```

The renderer read them with `nv()`, which is `Number(value)`. `Number('')` is
**0**, and 0 is finite — so that guard has never fired on a blank field. Measured
on the page, one blank at a time, on the tile's own worked example:

| Blank | It answered |
| --- | --- |
| *(nothing blank)* | 10-year total CVD risk: **4.0%** — Low |
| total cholesterol | **2.8%** — Low |
| HDL | **6.5%** — Borderline |
| BMI | **5.2%** — Borderline |
| eGFR | **27.2%** — High |
| systolic BP | **28.0%** — High |

Five different ten-year cardiovascular risks for one patient, decided by which
lab had not come back. The reassuring ones are the ones that matter: a total
cholesterol nobody drew moved the patient from 4.0% to 2.8%, and *"Low (<5%)"* is
a statin conversation that does not happen.

Rule 7, and the third time in two waves: **the library guarded `NaN` and the
renderer sent `0`.**

## `ascvd`, and being accurate about it

The PCE beside it has the identical `nv()` shape, and I first wrote this spec
saying it rendered *"10-year ASCVD risk: NaN% — High (>=20%)"*, because the
library returns `NaN` from a zeroed cholesterol and the renderer calls
`.toFixed(1)` on it.

**On the page it does not.** The spec-v53 output-safety layer catches the
non-finite value before it reaches the DOM, and the reader saw:

> One of these values is too large or too small for this calculation to have an
> answer. Check the values below.

That is still wrong — nothing is out of range, something is missing, and the
library already carries the sentence that says which — so the fix stands. But it
is a badly-shaped message, not a fabricated risk, and the difference is the whole
distance between this tile and the one above it. **A library-level reproduction
is not a reading; check the surface the reader actually sees.**

## Two more from the same batch

| Tile | Blank | It said |
| --- | --- | --- |
| `tpn-macro` | any of the three macronutrient percentages | *"Dextrose: **0.0 g** (0 kcal)"* — an order for none of it, on a bag whose dextrose had simply not been typed |
| `peds-fluid-deficit` | the dehydration estimate | *"Total fluid deficit: **0 mL**"*, and a first-8-hour rate that is maintenance alone |

Both take rule 1's line: a component the bag does not contain, or a child who is
euvolemic, is a **typed 0**. A blank is a gap, and each now says which value it
is waiting for.

## A pattern measured and not added

This wave nearly widened `answeredWithANumber` — the shared "did it answer?" test
— to count a `NaN` or `Infinity` reading as an answer, on the strength of the
`ascvd` misreading above. Measured first, as the house rule requires: it moves
**zero** rows, because the output-safety layer means no tile renders one.

Not added. A pattern that moves nothing is a claim the next reader has to
re-check.

## Backlog

**59 → 50.** `docs/spec-v1146.md` carries the triage; `crrt-dose`, `pca-pump`,
`saps-ii`, `lvh-criteria`, `insulin-correction`, `vanc-auc` and `qbl-pph` are the
rest of this group.
