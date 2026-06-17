# v12 audit - spetzler-martin

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Spetzler RF, Martin NA. A proposed grading system for arteriovenous malformations. J Neurosurg. 1986;65(4):476-483; Lawton MT, et al. Neurosurgery. 2010;66(4):702-713.

`lib/neuro-v95.js spetzlerMartin()` sums the three core components to grade I-V and adds the three Lawton-Young supplementary items to the supplemented total (2-10), surfacing the component derivation so the grade is auditable.

## Boundary worked examples added
- >6 cm + eloquent + deep -> core sum 5, grade V; with age >40 -> supplemented total 8.
- <3 cm + non-eloquent + superficial -> core 1, grade I; no age band -> supplemented total null.
- a mid case (size 2 + deep + age 2 + unruptured + diffuse) -> core 3, supplemented 7.

## Cross-implementation differential
- Reference: Spetzler-Martin 1986 grade + Lawton-Young 2010 supplement. Match. PASS.

## Edge-input handling notes
- Each input is a closed selector so the core sum is clamped to 1-5 and the supplemented total to 2-10 by construction; a missing/invalid nidus size returns a surfaced valid:false guard; omitting the age band reports the core grade only. Fuzz harness covers the module; zero non-finite leaks.

## A11y / keyboard notes
- Six labeled <select>s; output aria-live="polite", with a muted derivation line. 320px sweep passes with no horizontal scroll. Reports the grade only, not a surgical decision.

## Defects opened
- none

## Status
- PASS
