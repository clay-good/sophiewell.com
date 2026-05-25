# v48 derivation provenance — qSOFA / SOFA (`qsofa-sofa`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-1a
- Citation re-verified against: Singer M, Deutschman CS, Seymour CW, et al. *The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3).* JAMA. 2016;315(8):801-810. Seymour CW, Liu VX, Iwashyna TJ, et al. *Assessment of clinical criteria for sepsis: for the Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3).* JAMA. 2016;315(8):762-774. Vincent JL, Moreno R, Takala J, et al. *The SOFA (Sepsis-related Organ Failure Assessment) score to describe organ dysfunction/failure.* Intensive Care Med. 1996;22(7):707-710.

## Scope of the derivation block

The `qsofa-sofa` tile renders **both** qSOFA (3-criterion bedside screen) and SOFA (6-organ scoring) in a single view. The derivation `components` array covers only **qSOFA** because:

1. SOFA's per-organ scoring is *not* additive in the same step-by-step sense — each organ system contributes 0-4 points based on multiple sub-criteria (e.g., respiration is scored against PaO2/FiO2 with mechanical-ventilation modifier; cardiovascular is scored against MAP / vasopressor dose). Reducing those to a single `inputKey` per organ would misrepresent the source.
2. qSOFA is the screen designed for bedside use without lab values, which is the audience Sophie's nurse-first pivot ([spec-v29](../../spec-v29.md) §5.3) prioritizes.

A future wave (48-2) may add a separate `derivation` block for the SOFA half if a per-organ schema is added. For wave 48-1a, the SOFA portion of the tile renders without a derivation summary and the existing `META['qsofa-sofa'].citation` + the in-page output text remain authoritative.

## qSOFA components — verbatim source mapping

Singer 2016 (Sepsis-3) introduces qSOFA as the non-ICU bedside surrogate for SOFA, derived empirically in Seymour 2016. The three criteria (each scored 0 or 1):

| Component (this file) | Source phrasing (Singer 2016 Table 2 / Seymour 2016) | Points |
|---|---|---|
| Respiratory rate >= 22/min | "Respiratory rate >= 22 / min" | 1 |
| Altered mental status (GCS < 15) | "Altered mentation" (operationalized as GCS < 15) | 1 |
| SBP <= 100 mmHg | "Systolic blood pressure <= 100 mm Hg" | 1 |

## qSOFA bands — verbatim source mapping

Singer 2016 §Operationalization: "Patients with suspected infection who are likely to have a prolonged ICU stay or to die in the hospital can be promptly identified at the bedside with qSOFA, ie, alteration in mental status, systolic blood pressure of 100 mm Hg or less, or respiratory rate of 22/min or greater (Table 2)... A qSOFA score of 2 or greater between 24 hours before to 12 hours after the onset of infection identifies patients with a 3- to 14-fold increase in the rate of in-hospital mortality."

The bedside-positive cutoff is therefore `>= 2`; the `META['qsofa-sofa'].derivation.bands` array splits at that boundary.

## Population (verbatim from source)

Seymour 2016 §Methods: "We used data from 1.3 million electronic health record encounters from 12 community and academic hospitals in southwestern Pennsylvania (UPMC) for derivation, with external validation in 706,399 encounters from 165 US and non-US hospitals (KPNC, VA, ALERTS, MIMIC-III)." Adult patients with suspected infection outside the ICU.

## Validity

Singer 2016 §Caveats: qSOFA is a *prognostic* screen, not a diagnostic instrument; a positive qSOFA score should "prompt clinicians to further investigate for organ dysfunction, initiate or escalate therapy as appropriate, and consider referral to critical care." It is not validated in children. The Surviving Sepsis Campaign 2021 update notes qSOFA should not be used as the sole screening tool for sepsis (recommendation against, low evidence quality), but the bedside instrument itself remains in widespread documentation use.

## Source quote

"qSOFA... uses three criteria, assigning 1 point for low blood pressure (systolic blood pressure ≤100 mm Hg), high respiratory rate (≥22 breaths per min), or altered mentation (Glasgow Coma Scale score <15). The qSOFA score thus ranges from 0 to 3 points." — Singer 2016 §The Sepsis-3 Definitions, Table 2.

## Renderer assertions

Verified locally:
- `META['qsofa-sofa'].derivation` has every required field per `lib/derivation.js validate()`.
- Components sum equals `qsofa().score` at boundary points (0, 2) — see `test/unit/derivation.test.js`.
- Bands cover the 0-1 vs 2-3 split.

## Defects opened
None.
