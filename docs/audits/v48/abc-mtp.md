# v48 derivation provenance — ABC Score for Massive Transfusion (`abc-mtp`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4j
- Citation re-verified against: Nunez TC, Voskresensky IV, Dossett LA, Shinall R, Dutton WD, Cotton BA. *Early prediction of massive transfusion in trauma: simple as ABC (assessment of blood consumption)?* J Trauma. 2009;66(2):346-352.

## Components — verbatim source mapping

Four binary criteria, each +1; range 0-4.

| # | Criterion | Points |
|---|---|---|
| 1 | Penetrating mechanism of injury | +1 |
| 2 | Initial SBP <= 90 mmHg | +1 |
| 3 | Initial HR >= 120 bpm | +1 |
| 4 | Positive FAST (focused assessment with sonography for trauma) | +1 |

## Bands — source mapping (Nunez 2009)

| Range | Action |
|---|---|
| 0-1 | MTP activation not indicated by ABC alone |
| >= 2 | Activate massive transfusion protocol (sensitivity 75%, specificity 86%) |

## Population

Nunez 2009: retrospective derivation in 596 trauma patients receiving any blood product transfusion at Vanderbilt; prospective validation in 110 patients. Outcome: massive transfusion (>= 10 units pRBC in 24 hours).

## Validity

Adult trauma patients. ABC is designed for early bedside-fast triage to MTP activation; one input among several (clinical gestalt, base deficit, lactate, INR/TEG, injury pattern) for the activation decision. Not validated for non-traumatic massive bleeding (GI bleed, OB hemorrhage) or pediatric trauma.

## Source quote

"The ABC score is composed of four nonweighted parameters: penetrating mechanism, positive Focused Assessment Sonography for Trauma (FAST), arrival systolic blood pressure of 90 mm Hg or less, and arrival heart rate >= 120 beats per minute." — Nunez 2009 §Methods.

## Renderer assertions

Verified locally:
- `META['abc-mtp'].derivation` has every required field per `lib/derivation.js validate()` and exactly 4 components.
- Components sum equals `abcMtp().score` at all boundary points.

## Defects opened
None.
