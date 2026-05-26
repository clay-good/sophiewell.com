# v48 derivation provenance — LAMS (`lams`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-3b
- Citations re-verified against:
  - Llanes JN, Kidwell CS, Starkman S, Leary MC, Eckstein M, Saver JL. *The Los Angeles Motor Scale (LAMS): a new measure to characterize stroke severity in the field.* Prehosp Emerg Care. 2004;8(1):46-50.
  - Nazliel B, Starkman S, Liebeskind DS, et al. *A brief prehospital stroke severity scale identifies ischemic stroke patients harboring persisting large arterial occlusions.* Stroke. 2008;39(8):2264-2267.

## Components — verbatim source mapping

Three motor items from Llanes 2004. Range 0-5.

| Item | Source levels |
|---|---|
| Facial droop | 0 absent / 1 present |
| Arm drift | 0 absent / 1 drifts down (10 sec) / 2 falls rapidly |
| Grip strength | 0 normal / 1 weak grip / 2 no grip |

Each `points` callback clamps to the item's range: facial droop 0-1, arm drift 0-2, grip 0-2.

## Bands — source mapping

LVO threshold from Nazliel 2008 (sensitivity 81% / specificity 89% for persistent LVO at ≥4):

| Range | Source label |
|---|---|
| 0-3 | LVO less likely (continue stroke workup) |
| 4-5 | LVO likely (consider thrombectomy-capable center) |

## Population

- **Llanes 2004**: derivation in 119 prehospital stroke patients in Los Angeles County paramedic units.
- **Nazliel 2008**: 119 patients with confirmed acute ischemic stroke; LVO confirmed by CTA/MRA/DSA.

## Validity

Adults with suspected stroke in the prehospital setting. LAMS is one of several LVO-triage instruments (RACE, FAST-ED, VAN — each available as separate Sophie tiles); each has trade-offs in sensitivity / specificity. LAMS is the simplest (only 3 motor items, no language assessment). NOT designed for stroke diagnosis (use CPSS or ROSIER); LAMS assumes a stroke screen is already positive. Cutoff ≥4 is the published LVO threshold per Nazliel 2008; institutional protocols may differ.

## Source quote

"The Los Angeles Motor Scale (LAMS) is a 3-item scale (facial droop, arm drift, grip strength) that can be performed in less than a minute in the prehospital setting. ... A LAMS score of 4 or 5 identified persisting LVO with a sensitivity of 81% and a specificity of 89%." — Llanes 2004 + Nazliel 2008 (composite).

## Renderer assertions

Verified locally:
- `META.lams.derivation` has every required field per `lib/derivation.js validate()` and exactly 3 components.
- Components sum equals `lams().score` at three boundary points (zero, LVO cutoff 4, max 5).

## Defects opened
None.
