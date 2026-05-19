# v11 audit - sirs

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Bone RC, Balk RA, Cerra FB, et al. *Definitions for sepsis and organ failure and guidelines for the use of innovative therapies in sepsis. The ACCP/SCCM Consensus Conference Committee.* Chest. 1992;101(6):1644-1655. SIRS thresholds (temperature, HR, RR/PaCO2, WBC) and the >=2-criteria SIRS-positive definition. Sepsis-3 update: Singer M, et al. *The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3).* JAMA. 2016;315(8):801-810 (qSOFA / SOFA replace SIRS for sepsis screening).

`lib/scoring-v4.js sirs()` counts the four Bone 1992 criteria (temperature >38 or <36 deg C, HR >90, RR >20 or PaCO2 <32, WBC >12 or <4 x10^9/L or >10% bands). The function returns the count, a SIRS-positive boolean (>=2), and a band that surfaces both Bone 1992 and the Sepsis-3 deprecation context per spec-v12 §3.9.1.

## Boundary examples added
- low (tile example): 0 of 4 criteria -> SIRS-negative.
- mid (boundary at 2): temperature + HR -> 2 of 4 -> SIRS-positive.
- high: all four criteria met -> 4 of 4 -> SIRS-positive (with Sepsis-3 context surfaced).
- toggle: 1 of 4 -> SIRS-negative (Bone 1992 requires >=2).

## Cross-implementation differential
- Reference implementation: Bone RC, et al. Chest. 1992;101(6):1644-1655 SIRS definition.
- Test case: temperature + WBC criteria met.
- Sophie result: count 2, SIRS-positive.
- Reference result: same count, same conclusion. PASS.

## Edge-input handling notes
- Four boolean inputs only.
- Sepsis-3 (Singer 2016) deprecation is surfaced inline in the result band so a clinician using SIRS sees the current consensus context; the tile is still shipped because some inpatient EWS triggers and hospital protocols still encode SIRS thresholds (rationale per spec-v12 §3.9.1).

## A11y / keyboard notes
- Four labeled checkboxes; all Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
