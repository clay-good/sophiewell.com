# v11 audit - local-anesthetic-max

- Auditor: CG
- Date: 2026-06-06 (spec-v56).
- Citation re-verified against: Neal JM, et al. ASRA practice advisory on LAST. Reg Anesth Pain Med 2018;43(2):113-123.

lib/medication-v5.js localAnestheticMax() computes the maximum dose as the LOWER of weight-based (capped at 100 kg) and the per-agent absolute cap, then the max volume at the entered concentration (1% = 10 mg/mL).

## Boundary examples added
- lidocaine plain 70 kg: 70x4.5=315 -> absolute 300 mg binds = 30 mL of 1%.
- lidocaine+epi 60 kg: 420 mg (cap 500 not reached) = 21 mL of 2%.
- bupivacaine 60 kg: 150 mg = 30 mL of 0.5%.

## Cross-implementation differential
- Hand-calc 60x2.5=150 mg, /5 mg/mL = 30 mL. Sophie 30. PASS.

## Edge-input handling notes
- Weight cap at 100 kg and absolute caps surfaced as warn lines. concPct min 0.01 prevents divide-by-zero.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
