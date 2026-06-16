# v12 audit - mmrc-dyspnea

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Bestall JC, Paul EA, Garrod R, Newcombe RG, Jones PW, Wedzicha JA. Usefulness of the Medical Research Council (MRC) dyspnoea scale as a measure of disability in patients with chronic obstructive pulmonary disease. Thorax. 1999;54(7):581-586.

`lib/pulm-v91.js mmrcDyspnea()` returns the modified MRC dyspnea grade 0-4 with its descriptor. The grade is the connective tissue that feeds the BODE index and the GOLD ABE symptom assessment. An out-of-range or non-integer grade is refused with a surfaced fallback (never an undefined descriptor).

## Boundary worked examples added
- each grade 0-4 returns its published descriptor (strenuous-exercise-only through too-breathless-to-leave-the-house).
- grade 2 -> "walks slower than peers on the level, or stops for breath at own pace".
- grades 5, -1, 2.5 and a blank selection -> surfaced "select a grade 0 to 4" fallback.

## Cross-implementation differential
- Reference: Bestall 1999 five-grade scale (the GOLD-adopted mMRC wording). The five descriptors match. PASS.

## Edge-input handling notes
- The grade is validated to an integer in [0, 4]; anything else surfaces the fallback rather than indexing an undefined descriptor. The spec-v59 fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- A single labeled mMRC <select> (grade + descriptor per option); output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
