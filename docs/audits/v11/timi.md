# v11 audit - TIMI Risk Score (UA / NSTEMI) (`timi`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Antman EM, Cohen M, Bernink PJLM, et al. *The TIMI Risk Score for Unstable Angina/Non-ST Elevation MI: A Method for Prognostication and Therapeutic Decision Making.* JAMA. 2000;284(7):835-842.

Seven binary criteria, each 1 point: age >= 65, >= 3 CAD risk factors, known CAD (>= 50% stenosis), ASA use in past 7 days, >= 2 anginal episodes in past 24 h, ST deviation >= 0.5 mm on ECG, elevated cardiac markers. Total 0-7. 14-day event rates (death, new/recurrent MI, severe ischemia requiring revascularization): 0-1 = 4.7%, 2 = 8.3%, 3 = 13.2%, 4 = 19.9%, 5 = 26.2%, 6-7 = 40.9% per Antman 2000 Table 3. `lib/scoring-v4.js timi()` filters seven boolean inputs and counts truthy values; bands implemented as 0-2 Low, 3-4 Intermediate, 5-7 High.

## Boundary examples added
- low: no criteria positive -> 0 (Low; ~4.7% 14-day risk per Antman 2000 Table 3).
- mid: META example (age65 + threeRiskFactors + asaPast7Days) -> 3 (Intermediate; ~13.2%).
- high: all seven criteria positive -> 7 (High; ~40.9%).

Band-edge: total 2 -> top of Low band (~8.3%); total 5 -> bottom of High band (~26.2%).

## Cross-implementation differential
- Reference implementation: Antman 2000 JAMA Table 3 14-day event rates.
- Test case: total 3 (META example).
- Sophie result: 3, "Intermediate risk (~13-20%)".
- Reference result: 3, 14-day event 13.2% (Antman 2000 Table 3).
- Delta: 0 ordinal-band categories. PASS.

## Edge-input handling notes
- Seven binary checkboxes; nothing to validate beyond present/absent.
- The "ST deviation" checkbox label specifies ">= 0.5 mm" per the source; the "elevated markers" checkbox does not pin to a specific troponin assay because the source pre-dates hs-cTn — the audit log notes this as a known limitation of the historical instrument, not a defect.

## A11y / keyboard notes
- Seven labeled checkboxes, Tab-reachable in source order. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
