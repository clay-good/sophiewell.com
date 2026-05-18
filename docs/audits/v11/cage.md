# v11 audit - CAGE Alcohol Screener (`cage`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Ewing JA. *Detecting alcoholism: the CAGE questionnaire.* JAMA. 1984;252(14):1905-1907. Four yes/no items; total 0-4; >=2 considered clinically significant per Ewing 1984 and subsequent validation literature.

`lib/scoring-v4.js CAGE_CONFIG` implements verbatim:
- Four items with Ewing's CAGE-mnemonic prompts (Cut down / Annoyed / Guilty / Eye-opener).
- Two options No (0) / Yes (1).
- Severity bands: 0-1 "Negative"; 2-4 "Positive: clinically significant suspicion of alcohol use disorder".

## Boundary examples added
- low (META exampleAnswers [0,0,0,0]): total 0; "Negative".
- boundary just below positive: [1,0,0,0] = 1 -> "Negative".
- boundary positive: [1,1,0,0] = 2 -> "Positive: clinically significant suspicion of alcohol use disorder".
- high: [1,1,1,1] = 4 -> "Positive".

## Cross-implementation differential
- Reference implementation: Ewing 1984 hand-scoring; cross-checked against the JAMA published instrument.
- Test case: any of the four boundary cases above.
- Sophie result: matches Ewing 1984 thresholds.
- Delta: 0%. PASS.

## Edge-input handling notes
- Four yes/no fieldsets; `isComplete()` gates score until every item answered.
- The cutoff of >=2 has been criticized in the literature for moderate-sensitivity in primary care populations (which is why AUDIT-C is often preferred for screening); Sophie offers both tiles. CAGE remains accurate for what it claims — the 2-of-4 cutoff is faithful to Ewing 1984.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Four labelled fieldsets of two radios; `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
