# spec-v1734 — Sourced envelopes for triglycerides, ALT and AST

> Status: **SHIPPED (2026-11-15)**: three new `lib/bounds.js` entries, applied to 18 tools. The catalog stays 2,387.

spec-v1731 left 49 fields unguarded because `lib/bounds.js` had no envelope for their quantity, and the table's
rule is that each bound names a recorded extreme. This finds the extreme for three of them.

| Key | Range | Source |
|---|---|---|
| `triglycerides` | 1 to 30,000 mg/dL | the highest serum triglyceride reported is 22,228 mg/dL, in a 13-year-old in diabetic ketoacidosis; its authors say it exceeds every earlier report (J Med Cases 2020; PMC8383553) |
| `alt` | 1 to 30,000 U/L | no single record is published; case reports reach ALT 11,600 U/L |
| `ast` | 1 to 30,000 U/L | case reports reach AST 15,500 U/L (a nearly 300-fold rise with respiratory failure and sepsis) |

CA-125 and fasting insulin were searched too and left out: the reports disagree, or name no highest value.

## Applied

| Tools | Fields |
|---|---|
| spec-v1731's open rows | `tyg-index` and `metabolic-syndrome` triglycerides; `hepatic-steatosis-index` ALT and AST |
| Every other tool that answered 999999 in one of these fields | `bard-score`, `lok-index`, `nafld-fibrosis`, `vacs-index`, `fib4` (AST, ALT); `apri`, `fullpiers`, `kobayashi-kawasaki`, `sano-kawasaki`, `udca-response` (AST); `rucam`, `hys-law` (ALT); `fatty-liver-index`, `hlh-2004` (triglycerides, mg/dL); `hscore-hlh` (AST, and triglycerides in mmol/L, converted and refused in mmol/L) |

Upper-limit-of-normal fields were left alone; they are not the measurement. An entered 0 is now refused where it
used to be accepted (no laboratory reports an AST, ALT or triglyceride of 0). A reported extreme (15,000 U/L,
22,000 mg/dL) still answers everywhere. Three comments that said "BOUNDS names no envelope" for these quantities
were corrected.

Tests: `test/unit/bounds-sourced-v1734.test.js`, `test/unit/lab-envelopes-v1734.test.js` (21 rows: the example
answers, 999999 is refused, the reported extreme answers). Two older tests used a 1e9 triglyceride or AST as an
overflow probe and now use a value inside the envelope, with the 1e9 asserted refused. The e2e specs that name
these tools (`incomplete-scores`, `records`, `field-values-match-dom`) pass locally.

Still open from spec-v1731: the quantities in its table other than these three.
