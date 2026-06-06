# v11 audit - edacs

- Auditor: CG
- Date: 2026-06-06 (spec-v57).
- Citation re-verified against: Than 2014 (EDACS / EDACS-ADP, Emerg Med Australas 26:34).

lib/scoring-v5.js edacs() computes age points (2 per 5-yr band) + male/symptom features; ADP low-risk requires score <16, non-ischemic ECG, negative 0/2-h troponins.

## Boundary examples added
- age 50 male + CAD/risk + diaphoresis -> 17, not low risk.
- young low-symptom + negative gate -> <16 low risk.
- low score but positive troponin -> NOT low risk (gate).

## Cross-implementation differential
- Age-band points and feature weights match EDACS. PASS.

## Edge-input handling notes
- age num()-clamped 18-120; the ADP gate is explicit booleans.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
