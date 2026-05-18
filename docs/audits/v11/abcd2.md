# v11 audit - ABCD2 Score (TIA stroke risk) (`abcd2`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Johnston SC, Rothwell PM, Nguyen-Huynh MN, et al. Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack. Lancet. 2007;369(9558):283-292. Five components: Age >=60 (1), BP SBP >=140 or DBP >=90 (1), Clinical features (weakness 2 / speech 1 / other 0), Duration (>=60 min 2 / 10-59 min 1 / <10 min 0), Diabetes (1). Band thresholds: 0-3 low (~1.0%), 4-5 moderate (~4.1%), 6-7 high (~8.1%) 2-day stroke risk per Johnston 2007 Table 3. Sophie's `abcd2` (lib/clinical-v5.js:474) implements all five components and the three bands verbatim.

## Boundary examples added
- Low edge: age 50 / BP 120/80 / other / dur 5 min / no DM -> 0 + 0 + 0 + 0 + 0 = 0/7 -> Low (~1.0%). PASS.
- Mid (Moderate band): age 70 / BP 130/85 / speech / dur 30 min / no DM -> 1 + 0 + 1 + 1 + 0 = 3/7 -> Low; recompute: age 70 / BP 140/90 / speech / dur 30 min / DM -> 1 + 1 + 1 + 1 + 1 = 5/7 -> Moderate (~4.1%). PASS.
- High edge (META example): age 70 / SBP 150 DBP 90 / weakness / dur 90 min / DM -> 1 + 1 + 2 + 2 + 1 = 7/7 -> High (~8.1%). PASS.
- Threshold at 4: e.g., age 65 / BP 145/85 / speech / dur 30 min / no DM -> 1 + 1 + 1 + 1 + 0 = 4 -> Moderate band (inclusive at 4). PASS.
- Threshold at 6: e.g., age 65 / BP 145/85 / weakness / dur 90 min / no DM -> 1 + 1 + 2 + 2 + 0 = 6 -> High band (inclusive at 6). PASS.

## Cross-implementation differential
- MDCalc ABCD2: META example inputs return 7/7 high risk. Sophie matches exactly. PASS.
- Johnston 2007 Table 3 2-day risk percentages (1.0% / 4.1% / 8.1%) cross-checked verbatim.
- Age, BP, and duration thresholds cross-checked against the Lancet 2007 paper Box 1.

## Edge-input handling notes
- Numeric inputs are constrained (age 0-130, SBP 30-300, DBP 10-200, duration 0-1440 min); out-of-range rejects with `num()` error.
- `clinicalFeatures` is a closed enum (`weakness`, `speech`, `other`); invalid values rejected.
- `diabetes` must be boolean; type error otherwise. This is a strict-typing guardrail per spec-v11 §3.1 step 4(a).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Inputs labelled; clinical-features select announces options; compute button keyboard-reachable; result region updates aria-live. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
