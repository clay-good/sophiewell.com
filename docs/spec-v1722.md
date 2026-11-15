# spec-v1722 — A fraction in a whole-number field

> Status: **SHIPPED (2026-11-15)**: fixes to 23 scores and ACR TI-RADS, and a new finder.
> The catalog stays 2,387.

spec-v1720 settled the first line of the silent-zero helper copied into some twenty-five libraries. This
spec is about its second line:

```js
if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
return Math.round(n);
```

The house number input is `step="any"`, so the page accepts 1.49 as a valid entry for an Aldrete-style item
and hands it to the library, which scored it as 1 and said nothing.

## The finder

`scripts/probe-fraction-rounded.mjs` asks on the page's path (`compute(toArgs(...))`): for a field whose
worked example is a whole number x, where x and x+1 answer differently, does x+0.49 answer exactly like x
and x+0.51 exactly like x+1? It compares the **raw** result, because a continuous input whose answer is
rounded for display would otherwise look rounded on the way in.

`test/integration/fraction-rounded-probe.spec.js` drives each row on the page. It is a finder, so CI never
runs it.

| Stage | Rows |
|---|---|
| Library path | 151 fields across 69 calculators |
| A slider, not a typed box (Aldrete, PADSS, PASS, pediatric GCS) | 16; a slider cannot hold 1.49 |
| Typed on the page and confirmed | 135 |
| Ordinal items and clinical counts: **fixed** | 81 fields across 23 scores |

## What changed

- `gradeFault` rows take an optional fifth element, `true`, which also refuses a fraction:
  "X must be a whole number. Check the value entered." The rule is `wholeFault` in `lib/num.js`.
- Epworth, White-Song, ESAS, ISTH-BAT, MMT-8, NISS, GCS-P, IHS4, CDAI, Harvey-Bradshaw, Harris Hip, IDS,
  Murray LIS quadrants, MB-LATER, Durie-Salmon lesions, Groningen, HEART pathway, Roland-Morris, Tinetti,
  UAS7, PBAC, SITS-SICH and ASTRAL NIHSS refuse a fraction in an item or count.
- Where a library had no range check, it got one in the same edit. Each of these read an off-scale value as
  0 or as blank: Groningen 16 ("not frail"), Roland-Morris 25, ESAS 11, Harris pain 45, Tinetti balance 99
  (clamped to the best balance), HEART 11 and UAS7 22 (both asked the reader to enter the value they had).
- ACR TI-RADS read a diameter above 20 cm or of 0 as no diameter and said "Enter the nodule maximum
  diameter". It refuses the value by name now, as `ct-effective-dose` already did for its DLP.

Tests: `test/unit/fraction-in-whole-field.test.js` and `test/unit/acr-tirads.test.js`.

## What it leaves, and why

| Rows | Why they stay |
|---|---|
| Continuous measurements (QTc, urine anion gap, ABI, shunt fraction, ages, heart rates, labs) | The answer is rounded for display with a slope of 1, so it flips at x+0.5 too. Each was checked at its cutoff: Hodgkin hemoglobin 10.4 vs 10.5, GRIm albumin 3.4 vs 3.5, staffing hours 349.6 vs 350, age 79.6 vs 80. All correct. |
| Billing and administration counts (MUE units, RVU units, administrations per year, dose counts, therapy and critical-care minutes) | Whether a fraction is ever legitimate depends on payer convention. Left for an owner decision, not guessed. |
