# v12 audit - salicylate-toxicity

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Juurlink DN, Gosselin S, Kielstein JT, et al; EXTRIP Workgroup. Ann Emerg Med. 2015;66(2):165-181.

`lib/tox-v86.js salicylateToxicity()` applies the EXTRIP hemodialysis-indication rule, naming each criterion that trips. Level is unit-aware (mg/dL <-> mmol/L; salicylate MW 138.12, so 1 mmol/L = 13.81 mg/dL). Recommends on level >100 mg/dL acute (>90 with impaired kidneys), altered mental status, new hypoxemia, or arterial pH <=7.20; suggests when standard therapy fails. The Done nomogram is named only to state it is not used.

## Boundary examples added
- Acute level 110 mg/dL -> recommended (level >100), severity "severe by level".
- Arterial pH 7.18 -> recommended regardless of level.
- Altered mental status alone (no level) -> recommended.
- Impaired kidney + 95 mg/dL -> recommended (>90 with impaired kidneys).
- Standard therapy failing only -> suggested (not recommended).
- Level 25 mg/dL, no clinical criteria -> no listed criterion met.
- 8 mmol/L -> converts to ~110.5 mg/dL -> recommended.

## Cross-implementation differential
- Reference: EXTRIP 2015 thresholds; mmol/L->mg/dL by hand: 8 * 13.81 = 110.48.
- Test cases: as above; Sophie identical. PASS.

## Edge-input handling notes
- Non-finite / non-positive level -> treated as not provided (null), no leak. pH applied only within a plausible range (6.5-8.0). Booleans coerced loosely. No NaN/undefined string (spec-v59 fuzz harness covers lib/tox-v86.js). The Done nomogram is excluded by name.

## A11y / keyboard notes
- A numeric level field, unit and poisoning-type selects, an optional pH field, and four labeled checkboxes, each with a real `<label for>`; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
