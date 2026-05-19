# v11 audit - acog-severe-pre

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: ACOG Task Force on Hypertension in Pregnancy. *Hypertension in pregnancy.* Obstet Gynecol. 2013;122(5):1122-1131. Re-affirmed in ACOG Practice Bulletin 222, 2020. Six severe features; ANY one feature qualifies as severe preeclampsia: (1) SBP >=160 or DBP >=110 on two occasions >=4 h apart; (2) thrombocytopenia <100 x10^9/L; (3) impaired hepatic function (transaminases >=2x ULN OR persistent severe RUQ/epigastric pain); (4) creatinine >1.1 mg/dL OR doubled baseline; (5) pulmonary edema; (6) new cerebral or visual disturbances.

`lib/scoring-v4.js acogSeverePre()` counts how many of the six severe features are present, returning `severe: true` iff >=1 feature is present. The sub-criteria conjunctions within features (two-occasion BP rule, AST OR pain, creatinine threshold OR doubled baseline) are resolved by the clinician before checking the box; the renderer label makes this explicit.

## Boundary examples added
- 0 features (tile example) -> not severe band.
- 1 feature alone (e.g., BP >=160/110 x2) -> severe.
- 1 feature alone (e.g., new visual disturbance) -> severe (any single feature triggers).
- 6 features (all) -> severe.

## Cross-implementation differential
- Reference: ACOG 2013 worked through manually.
- Test case: thrombocytopenia + pulmonary edema present -> 2 features -> severe.
- Sophie result: severe true, 2 features present.
- Reference: same. PASS.

## Edge-input handling notes
- Each feature interpreted via `x ? 1 : 0`. The conjunctions in §3.1.3 (e.g., "transaminases >=2x normal OR persistent severe RUQ/epigastric pain") are resolved by the clinician before checking the box.

## A11y / keyboard notes
- Six labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
