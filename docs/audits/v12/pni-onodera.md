# v12 audit - pni-onodera

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Onodera T, Goseki N, Kosaki G. Prognostic nutritional index in gastrointestinal surgery of malnourished cancer patients. Nihon Geka Gakkai Zasshi. 1984;85(9):1001-1005. The formula (10 x albumin + 0.005 x lymphocytes) and the >= 45 / 40-45 / < 40 thresholds cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v178.js pniOnodera()` computes PNI from albumin and lymphocytes. Group E, Class A.

## Source-governance notes
- PNI = 10 x albumin(g/dL) + 0.005 x lymphocytes(/mm^3); >= 45 no increased risk, 40-<45 borderline, < 40 high risk. Journal issuer; no ISSUER_PATTERN trip; no staleness row.

## Boundary worked examples added
- worked example (alb 4.0, lymph 1500 -> 47.5); 40 and 45 band edges; blanks -> valid:false.

## Edge-input handling notes
- Both inputs positive-finite; otherwise valid:false; never NaN (spec-v59 fuzz pass).
