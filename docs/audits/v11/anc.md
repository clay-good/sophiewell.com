# v11 audit - anc

- Auditor: CG
- Date: 2026-06-06 (spec-v55)
- Citation re-verified against: CTCAE v5.0 (U.S. DHHS/NCI, 2017), neutropenia grading. ANC = WBC x (segmented neutrophils % + bands %) / 100, expressed cells/uL (WBC in K/uL == x10^9/L).

`lib/clinical-v6.js anc()` computes ANC = WBC x (segs + bands) x 10 (cells/uL) and grades: Normal >=1500, mild 1000-1499, moderate 500-999, severe <500. The <500 band raises the neutropenic-precautions / fever-is-an-emergency flag.

## Boundary examples added
- normal: WBC 5, 60% segs, 5% bands -> 5*65*10 = 3250/uL (Normal).
- moderate: WBC 2, 40%, 5% -> 2*45*10 = 900/uL.
- severe: WBC 1, 30%, 0% -> 1*30*10 = 300/uL (precautions).
- boundary: WBC 1, 50%, 0% -> 500/uL (moderate, not severe; <500 is strict).

## Cross-implementation differential
- Reference hand-calc: WBC 5 K/uL x (0.65) = 3250 cells/uL. Sophie: 3250. PASS.

## Edge-input handling notes
- WBC/segs/bands validated finite and in range; segs + bands > 100 throws RangeError (impossible differential).
- Non-finite/empty input throws TypeError (caught by the renderer's safe()).

## A11y / keyboard notes
- Three labeled number inputs, Tab-reachable; aria-live results. npm run test:a11y clean.

## Defects opened

- none

## Status
- PASS
