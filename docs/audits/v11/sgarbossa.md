# v11 audit - Modified Sgarbossa Criteria (Smith) (`sgarbossa`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Smith SW, Dodd KW, Henry TD, Dvorak DM, Pearce LA. Diagnosis of ST-elevation myocardial infarction in the presence of left bundle branch block with the ST-elevation to S-wave ratio in a modified Sgarbossa rule. Ann Emerg Med. 2012;60(6):766-776. Positive if any of: (a) concordant ST elevation >=1 mm in at least one lead with positive QRS, (b) concordant ST depression >=1 mm in V1-V3, (c) ST/S ratio <= -0.25 in at least one lead with discordant ST elevation. (a) and (b) are inherited unchanged from original Sgarbossa 1996; (c) is the Smith modification replacing the original 5-mm discordance criterion.

## Boundary examples added
- Concordant STE positive: criterion (a) checked alone -> Positive (>=1 mm concordant STE in a positive-QRS lead). PASS (matches META example).
- Concordant STD positive: criterion (b) checked alone -> Positive (>=1 mm concordant STD in V1-V3). PASS.
- Smith ratio positive: criterion (c) checked alone -> Positive (ST/S ratio <= -0.25). PASS.
- All criteria negative: none checked -> Negative (does not rule out MI; clinical correlation required). PASS.

## Cross-implementation differential
- MDCalc Modified Sgarbossa: enabling any single criterion returns Positive. Sophie matches the criterion-level logic. PASS.
- Smith 2012 Table 2 (criterion definitions and the -0.25 threshold) cross-checked verbatim.

## Edge-input handling notes
- Implemented as three independent boolean criteria (any one triggers Positive); no numeric inputs to validate.
- Tile renders a visible reminder that the rule applies in the setting of LBBB or ventricular-paced rhythm and is not a stand-alone STEMI diagnosis.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Three labelled checkbox inputs; compute renders the categorical result with aria-live. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
