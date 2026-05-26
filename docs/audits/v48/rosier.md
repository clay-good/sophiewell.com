# v48 derivation provenance — ROSIER (`rosier`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-3b
- Citation re-verified against: Nor AM, Davis J, Sen B, Shipsey D, Louw SJ, Dyker AG, Davis M, Ford GA. *The Recognition of Stroke in the Emergency Room (ROSIER) scale: development and validation of a stroke recognition instrument.* Lancet Neurol. 2005;4(11):727-734.

## Components — verbatim source mapping

Seven binary items from Nor 2005 Table 2. Two stroke-mimic items each subtract 1; five focal-deficit items each add 1. Range −2 to +5.

| Item | Source phrasing | Points |
|---|---|---|
| Loss of consciousness or syncope | "Has there been loss of consciousness or syncope?" | −1 |
| Seizure activity | "Has there been seizure activity?" | −1 |
| Facial weakness | "Asymmetrical facial weakness" | +1 |
| Arm weakness | "Asymmetrical arm weakness" | +1 |
| Leg weakness | "Asymmetrical leg weakness" | +1 |
| Speech disturbance | "Speech disturbance" | +1 |
| Visual-field defect | "Visual-field defect" | +1 |

## Bands — source mapping

| Range | Source label |
|---|---|
| ≤ 0 | low probability of stroke (investigate mimics; stroke not fully excluded) |
| > 0 | stroke likely (sensitivity 93%, specificity 83%) |

## Population

Nor 2005: derivation in 343 consecutive patients with suspected stroke at the Royal Victoria Infirmary, Newcastle. Reference standard: WHO stroke definition adjudicated by stroke physicians.

## Validity

Adults with suspected stroke in the ED. ROSIER is specifically designed to differentiate stroke from common mimics (syncope, seizure). NOT a prehospital scale — for prehospital use, CPSS or LAMS (separate Sophie tiles) are the appropriate instruments. A score of 0 does NOT fully exclude stroke; clinical judgment governs.

## Source quote

"The ROSIER scale ... appears to be a sensitive (93%) and specific (83%) instrument for the differentiation of acute stroke and stroke mimics in the emergency room." — Nor 2005 §Conclusion.

## Renderer assertions

Verified locally:
- `META.rosier.derivation` has every required field per `lib/derivation.js validate()` and exactly 7 components.
- Components sum equals `rosier().score` at three boundary points (zero baseline, max +5, mimic-heavy −1 verifying the subtraction).

## Defects opened
None.
