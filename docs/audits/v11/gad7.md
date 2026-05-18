# v11 audit - GAD-7 Anxiety Screener (`gad7`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Spitzer RL, Kroenke K, Williams JBW, Lowe B. *A brief measure for assessing generalized anxiety disorder: the GAD-7.* Arch Intern Med. 2006;166(10):1092-1097. Seven-item self-report anxiety scorecard; each item 0-3 (same response set as PHQ-9); total 0-21. Severity bands per Spitzer 2006: 0-4 minimal, 5-9 mild, 10-14 moderate, 15-21 severe.

`lib/scoring-v4.js GAD7_CONFIG` implements verbatim:
- Seven items, exact prompt wording matches Spitzer 2006 Figure 1.
- Same four options 0-3 as PHQ-9.
- Severity-band cutoffs match Spitzer 2006 (5/10/15 cutoffs).

## Boundary examples added
- low: all items 0 -> total 0; "Minimal anxiety".
- mid (META `exampleAnswers` [1,1,1,2,0,1,1]): total 7; "Mild anxiety" (5-9 band).
- boundary at 10 (moderate cutoff): [2,2,2,1,1,1,1] = 10 -> "Moderate anxiety".
- high: all items 3 -> total 21; "Severe anxiety".

## Cross-implementation differential
- Reference implementation: Spitzer 2006 hand-binning; cross-checked against the public phqscreeners.com forms.
- Test case: exampleAnswers [1,1,1,2,0,1,1].
- Sophie result: 7, "Mild anxiety".
- Reference result: 7, mild (5-9 per Spitzer 2006).
- Delta: 0%. PASS.

## Edge-input handling notes
- Same `scoreScreener()` mechanics as PHQ-9: null/empty answers ignored; partial completion not scored until `isComplete()` returns true.
- GAD-7 has no reverse-scored items; the raw sum is the source-defined total. Sophie's straight-sum is correct.
- Citation passes the spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Seven labelled fieldsets of radio buttons; identical Tab/arrow behavior to PHQ-9. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
