# v12 audit - calvert-carboplatin

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Calvert AH, et al. Carboplatin dosage: prospective evaluation of a simple formula based on renal function. J Clin Oncol. 1989;7(11):1748-1756; FDA estimated-GFR cap (125 mL/min, 2010).

`lib/metabolic-onc-v88.js calvertCarboplatin()` computes the carboplatin dose = target AUC x (GFR + 25). When the FDA cap is on (default), an estimated GFR above 125 mL/min is computed at 125 and the substitution is reported, so the user can never silently receive the uncapped (overdosing) result. AUC and GFR are both required and strictly positive; a blank or zero value surfaces a guarded fallback, never a dose computed from NaN. The posture note carries the spec-v85 chemotherapy clause (confirm against the institutional protocol and an independent dose check).

## Boundary worked examples added
- AUC 5, GFR 90, cap on -> 575 mg (no cap; 90 <= 125).
- AUC 6, GFR 140, cap on -> GFR used 125, dose 900 mg (NOT 990); substitution flagged.
- AUC 6, GFR 140, cap off -> dose 990 mg (measured GFR, uncapped).
- AUC 5, GFR 125, cap on -> not capped (cap is for > 125), dose 750 mg.
- blank/zero AUC or GFR -> valid:false, no NaN.

## Cross-implementation differential
- Reference: hand computation. 5*(90+25) = 575; 6*(125+25) = 900; 6*(140+25) = 990. Sophie matches. PASS.

## Edge-input handling notes
- AUC and GFR coerced with pos(); the cap is applied before the multiply. The dose is a product of two finite positives, so no non-finite value reaches a returned string (spec-v59 fuzz harness covers the module, zero leaks).

## A11y / keyboard notes
- Two labeled numeric inputs, one labeled select (GFR cap); output aria-live="polite". The cap warning renders with the warn class. 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
