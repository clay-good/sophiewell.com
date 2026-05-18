# v11 audit - Wells Score for DVT (`wells-dvt`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Wells PS, Anderson DR, Bormanis J, et al. *Value of assessment of pretest probability of deep-vein thrombosis in clinical management.* Lancet. 1997;350(9094):1795-1798.

Ten criteria per Wells 1997 Table 1: active cancer +1, paralysis/paresis/recent plaster cast +1, recent bedrest > 3 days or major surgery within 12 wk +1, localized tenderness along deep venous system +1, entire leg swollen +1, calf swelling > 3 cm vs asymptomatic side +1, pitting edema confined to symptomatic leg +1, collateral superficial veins (non-varicose) +1, previously documented DVT +1, alternative diagnosis as likely as DVT **-2**. Three-tier bands per Wells 1997 Table 2: Low <= 0 (3% DVT prevalence), Moderate 1-2 (17%), High >= 3 (75%). `lib/clinical.js wellsDvt()` and `WELLS_DVT_ITEMS` implement this verbatim, including the -2 subtraction for an alternative diagnosis.

## Boundary examples added
- low: no criteria positive -> 0 (Low; 3% DVT prevalence per Wells 1997 Table 2). Sophie's band thresholds (>=3 High, >=1 Moderate, else Low) place 0 in Low.
- mid: tendernessAlongVeins + calfSwellingGt3cm -> 2 (Moderate; 17% DVT per Wells 1997 Table 2).
- high: META example (tendernessAlongVeins + entireLegSwollen + calfSwellingGt3cm) -> 3 (High; 75% DVT prevalence per Wells 1997 Table 2).

Subtraction edge: tendernessAlongVeins + entireLegSwollen + alternativeDxAsLikely -> 1 + 1 - 2 = 0 (Low). Confirms the -2 carry-through.

## Cross-implementation differential
- Reference implementation: Wells 1997 Lancet Table 1 + Table 2.
- Test case: META example.
- Sophie result: 3, "High probability".
- Reference result: 3, High (>= 3 band, 75% DVT prevalence per Wells 1997 Table 2).
- Delta: 0%. PASS.

## Edge-input handling notes
- Nine "positive" checkboxes + one "negative" checkbox (alternative diagnosis). The negative checkbox is labeled distinctly so users do not mistake it for a positive risk factor.
- Wells 1997 specifies "alternative diagnosis as likely as or greater than DVT"; the label uses the source phrasing.
- Modern guidelines often use the dichotomized cutoff (DVT-likely >= 2 vs unlikely <= 1) per Wells 2003 NEJM 349(13):1227-1235; this tile preserves the original three-tier framing, which is the form the citation describes. The companion `wells-dvt-caprini` tile pairs the original Wells DVT with Caprini for the modern VTE-prophylaxis use case.

## A11y / keyboard notes
- Ten labeled checkboxes, Tab-reachable in source order. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
