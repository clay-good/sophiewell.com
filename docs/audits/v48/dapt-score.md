# v48 derivation provenance — DAPT Score (`dapt-score`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4g
- Citation re-verified against: Yeh RW, Secemsky EA, Kereiakes DJ, Normand SL, Gershlick AH, Cohen DJ, Spertus JA, Steg PG, Cutlip DE, Rinaldi MJ, Camenzind E, Wijns W, Apruzzese PK, Song Y, Massaro JM, Mauri L. *Development and validation of a prediction rule for benefit and harm of dual antiplatelet therapy beyond 1 year after percutaneous coronary intervention.* JAMA. 2016;315(16):1735-1749.

## Components — verbatim source mapping

Nine criteria including a subtractive age band per Yeh 2016 Table 4. Range -2 to +10.

| # | Criterion | Points |
|---|---|---|
| 1 | Age: <65 / 65-74 / >=75 | 0 / -1 / -2 |
| 2 | CHF or LVEF < 30% | +2 |
| 3 | Saphenous vein graft PCI | +2 |
| 4 | MI at index presentation | +1 |
| 5 | Prior MI or PCI | +1 |
| 6 | Diabetes mellitus | +1 |
| 7 | Stent diameter < 3 mm | +1 |
| 8 | Paclitaxel-eluting stent | +1 |
| 9 | Current cigarette smoker | +1 |

## Bands — source mapping (Yeh 2016 §Results)

| Range | Action |
|---|---|
| < 2 | Does NOT favor extended DAPT beyond 12 months after PCI |
| >= 2 | Favors continuing DAPT beyond 12 months after PCI |

## Population

Yeh 2016: derivation in 11,648 patients from the DAPT Study; external validation in 8136 patients from PROTECT. Composite outcomes: ischemic events (MI / stent thrombosis) versus GUSTO moderate/severe bleeding from 12 to 30 months post-PCI.

## Validity

Adults who have completed 12 months of DAPT after PCI. The score balances ischemic benefit against bleeding harm of continued DAPT; the companion PRECISE-DAPT score (Costa 2017) predicts bleeding harm. ACC/AHA 2016 and ESC 2017 DAPT-duration guidance reference both. Paclitaxel-eluting stents are uncommon today (typically 0). Not for patients with absolute indications for prolonged anticoagulation/DAPT, prior major bleeding, or mechanical valves.

## Source quote

"A DAPT Score of >= 2 identified patients in whom the benefit of continued thienopyridine therapy outweighed the bleeding harm." — Yeh 2016 §Conclusions.

## Renderer assertions

Verified locally:
- `META['dapt-score'].derivation` has every required field per `lib/derivation.js validate()` and exactly 9 components.
- Components sum equals `daptScore().score` at multiple boundary points including the subtractive age band (>=75 alone -> -2; 65-74 alone -> -1).

## Defects opened
None.
