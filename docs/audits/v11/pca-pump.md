# v11 audit - pca-pump

- Auditor: CG
- Date: 2026-06-06 (spec-v56).
- Citation re-verified against: ISMP safe-PCA guidance; ASPMN authorized agent-controlled analgesia (no PCA-by-proxy).

lib/medication-v5.js pcaPump() computes max demand doses/h (60/lockout, floored), max hourly delivered (demand x doses + basal), demand volume, and flags whether a programmed 1-h limit binds.

## Boundary examples added
- conc 1, demand 1, lockout 10: 6 doses/h, 6 mg/h, 1 mL/dose.
- lockout 15 + basal 0.5: 4 doses/h, 4.5 mg/h.
- 1-h limit 10 >= 6: never binds; limit 5 < 10/h: binds.

## Cross-implementation differential
- Hand-calc 60/10 = 6 doses. Sophie 6. PASS.

## Edge-input handling notes
- lockout min 1, conc min 0.001 guard division; basal/limit optional. No-PCA-by-proxy safety line surfaced.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
