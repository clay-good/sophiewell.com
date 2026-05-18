# v11 audit - Pediatric Early Warning Score (PEWS) (`pews`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Monaghan A. Detecting and managing deterioration in children. Paediatr Nurs. 2005;17(1):32-35. Three subscales each 0-3 (behavior, cardiovascular, respiratory); total 0-9. Sophie applies institutionally common escalation thresholds: total >=4 -> "Escalate: bedside provider review"; total >=7 -> "High concern: consider code team / PICU consult". The visible note states that institutional escalation thresholds vary.

## Boundary examples added
- Low edge: 0 + 0 + 0 = 0 -> baseline / no escalation. PASS.
- Mid (META example): behavior 2 + CV 2 + resp 1 = 5 -> "Escalate: bedside provider review". PASS.
- Mid threshold: 1 + 2 + 1 = 4 -> escalate band (inclusive at 4). PASS.
- High edge: 3 + 3 + 3 = 9 -> high-concern band. PASS.
- High threshold: 3 + 3 + 1 = 7 -> high-concern band (inclusive at 7). PASS.

## Cross-implementation differential
- Hand summation cross-verified against Sophie output: 2+2+1 = 5, exact match.
- The 0-3 per-subscale ceiling and 0-9 total cross-checked against the Monaghan 2005 PEWS table.
- The escalation-threshold copy is institutionally common (not Monaghan-quoted); the visible attribution notes that local protocols supersede.

## Edge-input handling notes
- Each subscale validated as an integer 0-3 via `num()` + `Number.isInteger`; non-integer or out-of-range values reject with an inline error.
- The "escalation thresholds vary by institution" note is rendered above the band display.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Three labelled numeric inputs (or radio groups depending on view path); compute button keyboard-reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
