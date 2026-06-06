# v11 audit - retic-index

- Auditor: CG
- Date: 2026-06-06 (spec-v55)
- Citation re-verified against: Hillman RS, Finch CA. Red Cell Manual, 7th ed., FA Davis 1996. Corrected retic % = retic% x (Hct/45); RPI = corrected / maturation factor (Hct >=35 -> 1.0; 25-34 -> 1.5; 20-24 -> 2.0; <20 -> 2.5).

`lib/clinical-v6.js reticIndex()` implements the correction and the maturation-factor lookup. RPI <2 = inadequate (hypoproliferative); RPI >=2 = adequate (hemolysis / blood loss).

## Boundary examples added
- adequate: 5% at Hct 30 -> corrected 5*30/45 = 3.33%, factor 1.5, RPI 2.22.
- inadequate at normal Hct: 1% at Hct 45 -> corrected 1.0, factor 1.0, RPI 1.0.
- just below 2: 8% at Hct 22 -> corrected 3.91, factor 2.0, RPI 1.96.
- severe anemia: 3% at Hct 15 -> corrected 1.0, factor 2.5, RPI 0.4.

## Cross-implementation differential
- Hand-calc RPI = (5 x 30/45) / 1.5 = 3.333/1.5 = 2.22. Sophie 2.22. PASS.

## Edge-input handling notes
- retic% and Hct validated; Hct floor 1 avoids divide-by-zero (the /45 is constant, never zero).

## A11y / keyboard notes
- Two labeled inputs, aria-live results. test:a11y clean.

## Defects opened

- none

## Status
- PASS
