# v11 audit - gbs

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Blatchford O, Murray WR, Blatchford M. *A risk score to predict need for treatment for upper-gastrointestinal haemorrhage.* Lancet. 2000;356(9238):1318-1321. Table 1 (per-parameter weights) and §Results (outpatient-management cutoff; endorsed by NICE CG141 2012).

Per-parameter scoring per Blatchford 2000 Table 1: BUN bands in mg/dL (18.2-22.4 = 2; 22.4-28 = 3; 28-70 = 4; >=70 = 6 — converted from the SI mmol/L urea bands in the source by 1 mmol/L = 2.8 mg/dL BUN); hemoglobin weighted separately for men (12-13 = 1; 10-12 = 3; <10 = 6) and women (10-12 = 1; <10 = 6); SBP (100-109 = 1; 90-99 = 2; <90 = 3); pulse >= 100 = 1; melena = 1; recent syncope = 2; hepatic disease = 2; cardiac failure = 2. Score 0 = low risk for needing intervention per Blatchford 2000 §Results; NICE CG141 (2012) endorses outpatient management at GBS = 0. `lib/scoring-v4.js gbs()` implements the eight-parameter sum and the binary low-risk vs not-low-risk band.

## Boundary examples added
- low: bun 14, hgb 15, M, sbp 120, no other criteria -> 0 (low risk; outpatient-eligible per NICE CG141 2012).
- mid: bun 30 (4) + hgb 11 male (3) + sbp 105 (1) + pulse>=100 (1) + melena (1) = 10 (not low risk).
- high: bun 80 (6) + hgb 8 female (6) + sbp 85 (3) + pulse (1) + melena (1) + syncope (2) + hep (2) + cf (2) = 23 (the Blatchford 2000 published maximum).

Sex-specific hemoglobin weighting boundary asserted: Hgb 12.5 g/dL -> 1 for M (12-13 band) and 0 for F (>=12 band) per Blatchford 2000 Table 1.

## Cross-implementation differential
- Reference implementation: Blatchford O, et al. Lancet. 2000;356(9238):1318-1321, Table 1 weights.
- Test case: bun 30, hgb 11 (M), sbp 105, pulse >= 100, melena.
- Sophie result: 10, not-low-risk band.
- Reference result: 4 (BUN) + 3 (Hgb M 10-12) + 1 (SBP 101-109) + 1 (pulse) + 1 (melena) = 10. Not in the GBS = 0 outpatient band.
- Delta: 0 / one ordinal category. PASS.

## Edge-input handling notes
- BUN input is in mg/dL with band edges derived from the SI mmol/L source values (1 mmol/L urea = 2.8 mg/dL BUN). Users with SI labs convert before entering; the v12-spec §3.3.1 follow-on for an inline mg/dL <-> mmol/L converter is deferred for a future wave.
- Hemoglobin is in g/dL; sex selector is required because Blatchford 2000 Table 1 weights men and women separately at the 10-13 g/dL range.

## A11y / keyboard notes
- Three labeled `number` inputs, one labeled select, five labeled checkboxes; all Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
