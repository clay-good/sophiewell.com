# v11 audit - Winters Formula (expected PaCO2) (`winters`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Albert MS, Dell RB, Winters RW. *Quantitative displacement of acid-base equilibrium in metabolic acidosis.* Ann Intern Med. 1967;66(2):312-322 (originally cited in `META.winters.citation` as Winter et al. Arch Intern Med 1967; the original derivation is the Albert-Dell-Winters paper; the formula is universally taught as "Winters' formula").

Formula: expected PaCO2 (mmHg) = 1.5 × HCO3 + 8 ± 2. Interpretation when measured PaCO2 supplied: above expected high -> concurrent respiratory acidosis; below expected low -> concurrent respiratory alkalosis; within band -> appropriate respiratory compensation. `lib/clinical-v4.js wintersFormula()` implements verbatim.

## Boundary examples added
- low (severe metabolic acidosis, appropriate compensation, META example): HCO3 14, measured PaCO2 29 -> expected PaCO2 27-31 (1.5 × 14 + 8 = 29 ± 2); 29 in range -> "Appropriate respiratory compensation".
- mid (mild metabolic acidosis): HCO3 20 -> expected 36-40; measured 38 -> appropriate compensation.
- high (DKA-grade acidosis): HCO3 5 -> expected 13.5-17.5; measured 12 -> "Concurrent respiratory alkalosis (PaCO2 lower than expected)" (over-compensation).

Concurrent-respiratory-acidosis edge: HCO3 14, measured PaCO2 45 -> expected 27-31; 45 > 31 -> "Concurrent respiratory acidosis".

Missing-PaCO2 path: HCO3 14, no measured PaCO2 -> returns expected range without interpretation (the secondaryDisorder field is `null`).

## Cross-implementation differential
- Reference implementation: Albert-Dell-Winters 1967 Ann Intern Med formula.
- Test case: META example (HCO3 14, PaCO2 29).
- Sophie result: expected 27-31; "Appropriate respiratory compensation".
- Reference result: 1.5 × 14 + 8 = 29; ± 2 -> 27-31; 29 in band.
- Delta: 0%. PASS.

## Edge-input handling notes
- The interpretation strings explicitly cite "Concurrent respiratory acidosis" / "Concurrent respiratory alkalosis" rather than "high PaCO2" / "low PaCO2"; this avoids the common transcription error of mistaking inappropriate compensation for primary respiratory disorders.
- The formula applies only to metabolic acidosis (low HCO3); applying it to a normal or high HCO3 yields nonsensical expected PaCO2 values, and the helper text instructs the user to confirm HCO3 < 22 before relying on the output.
- Measured PaCO2 is optional; when omitted, only the expected range is returned (useful for "what should the PaCO2 be?" workflow).

## A11y / keyboard notes
- Two labeled number inputs, Tab-reachable in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- **`META.winters.citation` lists "Winter et al. Arch Intern Med 1967".** The actual primary publication is Albert MS, Dell RB, Winters RW. Ann Intern Med 1967;66(2):312-322 (an Ann Intern Med paper, not Arch Intern Med, and the lead author is Albert). The Arch Intern Med citation is a common but incorrect attribution that appears in many textbooks. Live tile rendering is unaffected (numerical output is correct against the source formula). Filed as a citation accuracy defect; the fix is one-line in `lib/meta.js`. Fixed in this PR per spec-v11 §3.6 #3.

## Status
- PASS-WITH-FIXES
