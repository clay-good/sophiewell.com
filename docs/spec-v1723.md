# spec-v1723 — A value the reader entered, answered with "Enter it"

> Status: **SHIPPED (2026-11-15)**: fixes to 83 tools and a new finder. The catalog stays 2,387.

ACR TI-RADS read a 25 cm diameter through `pos(v, 20)`, which returns null above the range: the same null a
blank field gives. So the answer said "Enter the nodule maximum diameter" to a reader who had just entered one
(fixed in spec-v1722). The helper shape is common: about 120 libraries read a number through a local `pos`,
`fin` or `nonneg` that cannot tell "blank" from "out of range".

## The finder

`scripts/probe-entered-asked-for.mjs` sets one field of the worked example to an impossible value and reports
a refusal that asks for input ("Enter", "Choose") and says nothing about the value. It marks the rows whose
text is exactly what the tool says to a blank field.

`test/integration/entered-asked-for-probe.spec.js` types each row on the page. A row only counts there when
nothing else explains it: spec-v1009's range warning already appears above the answer for any input that
declares a `min` or `max`. It is a finder, so CI never runs it.

| Stage | Rows |
|---|---|
| Library path: asks for input, gives no hint | 371 fields across 175 tools |
| Already explained on the page (the input declares a range) | 221 |
| **Confirmed on the page: no warning, answer just asks again** | **150 fields across 83 tools** |
| Fixed | all 150, plus the sibling fields with the same helper in those functions |

## The fix

Each function now calls `gradeFault` with the bounds its own helper already used, before its missing-value
message. `gradeFault` skips a blank, so a blank field still gets "Enter ..."; an entered value outside the
range gets "<Field> must be between 30 and 250. Check the value entered." No new clinical range was invented.
Where a field already had a `boundsAdvisory` rule (FiO2 in HACOR and Murray LIS, height in predicted
spirometry), that rule now answers instead of the missing-value branch.

Tests: `test/unit/entered-asked-for-batch-{1,2,3,4}.test.js` drive every row through the page's path.
`test/unit/cccr.test.js` changed one assertion (a serum calcium of 0 is now refused by name).

## Silent substitutions found on the way

| Tool | What an out-of-range entry did | Now |
|---|---|---|
| `free-thyroxine-index` | reference T3RU replaced by 30 | refused; a blank still uses 30 |
| `nitrogen-balance` | insensible loss replaced by 4 g | refused; a blank still uses 4 |
| `qp-qs` | pulmonary-vein O2 replaced by 98% | refused; a blank still uses 98 |
| `adrenal-ct-washout` | unenhanced HU dropped, absolute washout silently skipped | refused |
| `pure-tone-average` | the 4 kHz threshold dropped, three-frequency average reported | refused |
| `ckd-staging`, `uacr-upcr` | a negative UACR or albumin dropped or echoed | refused |

## Left open

- `ild-gap`: an out-of-range select value (subtype, age band, DLCO band) reads as 0. A select cannot carry one
  on the page; agents are fenced by the adapter's `values`.
- `amsler-krumeich`: a negative refraction is treated as not entered.
- spec-v1722's billing and administration counts (MUE units, RVU units, doses per year) still accept a
  fraction, pending an owner decision on payer convention.
