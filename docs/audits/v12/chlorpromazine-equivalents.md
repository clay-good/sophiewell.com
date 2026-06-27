# v12 audit - chlorpromazine-equivalents

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Woods SW. J Clin Psychiatry. 2003;64(6):663-667 (each agent factor confirmed across the Woods abstract, the chlorpromazineR package encoding, and the Andreasen 2010 comparison; ≥ 2 sources, spec-v97).

`lib/pk-v166.js chlorpromazineEquivalents()` computes the Antipsychotic Chlorpromazine Equivalents. Group F, Class A.

## Source-governance notes
- Factors (mg ≈ 100 mg CPZ): chlorpromazine 100, haloperidol 2, risperidone 2, olanzapine 5, quetiapine 75, ziprasidone 60, aripiprazole 7.5. CPZ-eq = daily dose × (100/factor).
- Woods 2003 covers the newer atypicals with haloperidol as the anchor; agents outside this set (clozapine, fluphenazine, perphenazine, paliperidone) are NOT converted, to avoid mixing methods.
- Equivalence methods differ (DDD vs consensus vs Woods); the method is named and the result framed as an approximation.

## Boundary worked examples added
- haloperidol 10 mg → 500 mg CPZ-eq; olanzapine 20 → 400; quetiapine 600 → 800; chlorpromazine 300 → 300; clozapine (out of set) and blank dose → valid:false.

## Edge-input handling notes
- agent restricted to the Woods set; dose guarded > 0. Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- An agent select + one number input, each labelled; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
