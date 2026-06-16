# v12 audit - tls-cairo-bishop

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Cairo MS, Bishop M. Tumour lysis syndrome: new therapeutic strategies and classification. Br J Haematol. 2004;127(1):3-11.

`lib/metabolic-onc-v88.js tlsCairoBishop()` applies the Cairo-Bishop definition. Laboratory TLS = >= 2 of uric acid >= 8, potassium >= 6, phosphate >= 4.5 (adult) / 6.5 (pediatric), corrected calcium <= 7 mg/dL - each by the absolute threshold OR, when a baseline is supplied, a 25% change in the adverse direction. Clinical TLS adds an end-organ criterion (creatinine >= 1.5x ULN, cardiac arrhythmia/sudden death, or seizure) and carries the Cairo-Bishop grade 0-V, assigned as the maximum manifestation grade (renal by creatinine ratio; cardiac and seizure by severity select). The corrected-calcium criterion reuses the catalog's albumin correction (Ca + 0.8 x (4 - albumin)). The percent-change branch fires only when a baseline is entered; otherwise only the absolute thresholds apply and the note says so.

## Boundary worked examples added
- uric 9, K 6.5, phosphate 5, calcium 6 (adult), creatinine 2.4, ULN 1.2 -> lab + clinical TLS, 4 of 4 criteria, creatinine 2x ULN, grade II.
- uric 9, K 6.5, phosphate 3, calcium 9 -> exactly 2 criteria, lab TLS, grade 0 (no end-organ).
- uric 6 with baseline 4 (+50%) + K 6.2 -> lab TLS via the change criterion; uric 6 with no baseline -> not met.
- phosphate 5: adult met (>=4.5), pediatric not met (<6.5); creatinine 1.5x ULN -> renal grade I; arrhythmia sudden-death -> grade V.

## Cross-implementation differential
- Reference: hand computation. 2.4/1.2 = 2.0; corrected Ca 7.4 + 0.8*(4-2) = 9.0; (6-4)/4 = 0.5 >= 0.25. Sophie matches. PASS.

## Edge-input handling notes
- Each lab coerced with fin(); baselines and the creatinine ratio guarded by pos() so a zero baseline/ULN never divides. No non-finite value reaches a returned string (spec-v59 fuzz harness covers the module, zero leaks).

## A11y / keyboard notes
- One labeled select (patient age) plus labeled numeric inputs for each lab/baseline and two labeled selects (arrhythmia, seizure); output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
