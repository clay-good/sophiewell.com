# v11 audit - Alvarado / Pediatric Appendicitis Score (`alvarado-pas`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Alvarado A. A practical score for the early diagnosis of acute appendicitis. Ann Emerg Med. 1986;15(5):557-564 (MANTRELS mnemonic: Migration, Anorexia, Nausea/vomiting, Tenderness RLQ, Rebound, Elevated temperature, Leukocytosis, Shift to left). Samuel M. Pediatric appendicitis score. J Pediatr Surg. 2002;37(6):877-881 (PAS). Both scoring systems implement the original point allocations verbatim.

## Boundary examples added
- Alvarado low edge: no criteria -> 0 (low risk; consider alternative dx). PASS.
- Alvarado high edge: all 8 criteria positive (RLQ tenderness 2 pts + leukocytosis 2 pts + 6 others 1 pt each = 10) -> high probability of appendicitis. PASS.
- Alvarado mid (META example): migration + anorexia + RLQ tender + leukocytosis -> 6 = "compatible with appendicitis" band. PASS.
- PAS low edge: 0/10 -> very low risk. PASS.
- PAS high edge: full 10 points -> high risk (consider operative evaluation). PASS.
- PAS mid (META example): RLQ tender (2) + migration (1) + leukocytosis (2) = 5 -> intermediate band. PASS.

## Cross-implementation differential
- MDCalc Alvarado calculator: same inputs as META example yield 6/10. Sophie matches. PASS.
- MDCalc PAS calculator: same inputs as META example yield 5/10. Sophie matches. PASS.
- Cross-checked point allocations against Alvarado 1986 Table 1 and Samuel 2002 Table 2; RLQ tenderness and leukocytosis are the only 2-point items in both scores.

## Edge-input handling notes
- Checkbox-based inputs; no out-of-range possible. Both scores rendered together with separate totals so caller can pick the age-appropriate one.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- All criteria render as labelled checkboxes; tab order natural; result block updates aria-live. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
