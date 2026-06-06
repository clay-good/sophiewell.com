# v11 audit - ldl-calc

- Auditor: CG
- Date: 2026-06-06 (spec-v55)
- Citation re-verified against: Friedewald WT, et al. Clin Chem. 1972;18(6):499-502 (LDL = TC - HDL - TG/5); NIH equation, Sampson M, et al. JAMA Cardiol. 2020;5(5):540-548.

## Deliberate substitution (honesty discipline)
spec-v55 §2.5 names Friedewald + Martin/Hopkins. Martin/Hopkins requires a 180-cell proprietary strata lookup table whose exact cell values could not be source-verified for this implementation. The project correctness floor (spec-v11) forbids shipping an unverifiable clinical table. This tile therefore ships the **NIH/Sampson 2020** equation as the second method: a published, validated, closed-form estimator designed for the same TG <= 800 / low-LDL use case the spec cites. The substitution is disclosed in the META citation, the tile note, and here. The Martin/Hopkins method remains a candidate for a future wave if the table can be sourced and verified.

`lib/clinical-v6.js ldlCalc()` returns non-HDL, Friedewald (null at TG >=400), and NIH LDL. NIH = TC/0.948 - HDL/0.971 - (TG/8.56 + TG*nonHDL/2140 - TG^2/16100) - 9.44.

## Boundary examples added
- normal TG: TC 200, HDL 50, TG 150 -> Friedewald 120, NIH 123.
- high TG (Friedewald invalid): TC 250, HDL 40, TG 500 -> Friedewald null, NIH 121.
- low TG: TC 180, HDL 60, TG 100 -> Friedewald 100, NIH 102.
- boundary: TG exactly 400 -> Friedewald null (>=400), NIH computed.

## Cross-implementation differential
- Friedewald 200-50-150/5 = 120. Sophie 120. PASS.
- NIH worked: 200/0.948 - 50/0.971 - (150/8.56 + 150*150/2140 - 150^2/16100) - 9.44 = 123.4 -> 123. Sophie 123. PASS.

## Edge-input handling notes
- TG/HDL/TC validated; Friedewald gated at TG>=400; NIH gated at TG>800 and floored (null) if it goes negative at extreme inputs.

## A11y / keyboard notes
- Three labeled inputs, aria-live results. test:a11y clean.

## Defects opened

- none

## Status
- PASS (with documented Martin/Hopkins -> NIH substitution)
