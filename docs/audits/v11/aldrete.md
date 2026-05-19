# v11 audit - aldrete

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Aldrete JA. *The post-anesthesia recovery score revisited.* J Clin Anesth. 1995;7(1):89-91. (Original: Aldrete JA, Kroulik D. *A postanesthetic recovery score.* Anesth Analg. 1970;49(6):924-934.) Five domains (activity, respiration, circulation, consciousness, oxygen saturation) each scored 0-2; sum 0-10; cutoff >=9 for PACU discharge per Aldrete 1995.

`lib/scoring-v4.js aldrete()` sums the five Aldrete 1995 domain scores after clamping each per-domain value to [0, 2] so a slider drift cannot push a single domain outside the published per-item range. The 1995 revision replaces the original 1970 skin-color domain with oxygen saturation (a pulse-oximetry-era update).

## Boundary examples added
- 10 of 10 (all 2s; tile example) -> ready for PACU discharge per Aldrete 1995 (cutoff >=9).
- 9 of 10 (one domain at 1) -> ready for discharge at the published cutoff.
- 8 of 10 -> not yet ready for discharge.
- 0 of 10 -> not ready for discharge.
- per-domain clamp: 99 / -1 -> 2 / 0 respectively.

## Cross-implementation differential
- Reference: Aldrete 1995 Table (each domain rubric).
- Test case: activity 2, respiration 2, circulation 2, consciousness 2, O2 sat 1 -> 9.
- Sophie result: 9 of 10, ready for discharge.
- Reference: same. PASS.

## Edge-input handling notes
- Per-item clamp to [0, 2] handles slider out-of-range, non-finite, and negative values.

## A11y / keyboard notes
- Five labeled range inputs (0-2) with live `<output>` echoing the current value; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
