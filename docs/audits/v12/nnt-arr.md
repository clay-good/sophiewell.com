# v12 audit - nnt-arr

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Laupacis A, Sackett DL, Roberts RS. N Engl J Med. 1988;318(26):1728-1733 (cross-verified against standard EBM references; ≥ 2 sources, spec-v97).

`lib/ebm-v163.js nntArr()` computes the Number Needed to Treat / ARR. Group E, Class A.

## Source-governance notes
- ARR = CER − EER; RRR = ARR/CER; relative risk RR = EER/CER; NNT = 1/ARR rounded up to whole patients.
- EER > CER → number needed to harm NNH = 1/|ARR| with the harm framing; harm is never reported as benefit.
- ARR = 0 surfaced as "no measurable difference" (NNT undefined), not a divide-by-zero.

## Boundary worked examples added
- CER 20%, EER 15% → ARR 5%, NNT 20, RR 0.75, RRR 25%; CER 15%/EER 20% → NNH 20; CER=EER → NNT undefined.

## Edge-input handling notes
- CER = 0 → RR/RRR null; rates range-checked to [0,100]. Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- Two labelled number inputs; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
