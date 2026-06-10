# v11 audit - cerebral-perfusion-pressure

- Auditor: CG
- Date: 2026-06-10 (spec-v65).
- Citation re-verified against: Carney N, et al. Guidelines for the Management of Severe Traumatic Brain Injury, 4th Edition. Neurosurgery. 2017;80(1):6-15 (CPP = MAP - ICP; recommended target band 60-70 mmHg; aggressive maintenance above 70 mmHg with fluids/pressors discouraged for respiratory-failure risk). DOI 10.1227/NEU.0000000000001432.

`lib/clinical-v8.js` `cerebralPerfusionPressure()` — given MAP (mmHg) or an SBP/DBP pair (computing MAP via the same ((2*DBP)+SBP)/3 formula as the `map` tile) plus ICP (mmHg), returns the cerebral perfusion pressure with the Brain Trauma Foundation 2017 interpretation band (< 60 ischemia risk / 60-70 recommended / > 70 above target), a critical flag for CPP < 60, and a negative flag when ICP exceeds MAP. The clinical purpose is the governed hourly number on every severe-TBI, SAH, and post-craniotomy neuro-ICU flowsheet — one subtraction beyond the existing `map` tile, which it extends.

## Boundary examples added
- See test/unit/cerebral-perfusion-pressure.test.js (5 cases): MAP 90 - ICP 20 = 70 (top of the BTF band, no flags), the MAP-from-BP path (SBP 120 / DBP 60 = MAP 80, CPP 65), CPP < 60 ischemia flag (MAP 70 - ICP 25 = 45), the negative-CPP path (MAP 40 - ICP 55 = -15, negative + critical flags), and the no-MAP-source null path plus impossible-input throws.

## Cross-implementation differential
- Worked example reproduced by hand: 90 - 20 = 70 mmHg; PASS. MAP from BP: ((2*60)+120)/3 = 80; 80 - 15 = 65; PASS. The ((2*DBP)+SBP)/3 MAP formula is byte-identical to lib/clinical.js map(), so the two tiles cannot diverge on the MAP intermediate.

## Edge-input handling notes
- Returns null when neither a measured MAP (> 0) nor a complete SBP/DBP pair is supplied, so the renderer prompts for inputs rather than computing CPP from a phantom MAP of 0. icp is a required validated input (num 0-200); map/sbp/dbp default to 0 (treated as not-supplied). A negative CPP is surfaced with an explicit flag, never hidden. Out-of-range/non-finite inputs throw TypeError/RangeError caught by the renderer safe() wrapper. clinical-v8.js is enrolled in the spec-v59 fuzz harness — zero non-finite leaks. Every interpolated number routes through fmt(). The tile carries citationUrl + citationAccessed voluntarily (BTF is not in the spec-v60 ISSUER_PATTERN, so no ledger row is mandatory).

## A11y / keyboard notes
- Four labeled number inputs (MAP, SBP, DBP, ICP) with label for=; aria-live results region; the band line and planning-estimate note render as text. test:a11y clean.

## Defects opened

- none

## Status
- PASS
