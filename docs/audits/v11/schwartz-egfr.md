# v11 audit - schwartz-egfr

- Auditor: CG
- Date: 2026-06-06 (spec-v55)
- Citation re-verified against: Schwartz GJ, et al. J Am Soc Nephrol. 2009;20(3):629-637 (bedside Schwartz). eGFR (mL/min/1.73m^2) = 0.413 x height (cm) / serum creatinine (mg/dL). Validated ages 1-18 with IDMS-traceable creatinine; not for neonates or adults.

`lib/clinical-v6.js schwartzEgfr()` returns eGFR and a CKD G-stage band, plus the validity note that the adult egfr-suite owns adults.

## Boundary examples added
- height 100 cm, SCr 0.5 -> 0.413*100/0.5 = 82.6 (G2).
- height 120 cm, SCr 0.4 -> 49.56/0.4 = 123.9 (G1).
- height 90 cm, SCr 2.0 -> 37.17/2.0 = 18.6 (G4).

## Cross-implementation differential
- Hand-calc 0.413*100/0.5 = 82.6. Sophie 82.6. PASS.

## Edge-input handling notes
- SCr floor 0.1 (num min) prevents divide-by-zero; height bounded to a pediatric/adolescent range.

## A11y / keyboard notes
- Two labeled inputs, aria-live results. test:a11y clean.

## Defects opened

- none

## Status
- PASS
