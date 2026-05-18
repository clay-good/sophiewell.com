# v11 audit - PHQ-9 Depression Screener (`phq9`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Kroenke K, Spitzer RL, Williams JBW. *The PHQ-9: Validity of a brief depression severity measure.* J Gen Intern Med. 2001;16(9):606-613. Nine-item self-report depression scorecard; each item 0-3 ("Not at all", "Several days", "More than half the days", "Nearly every day"); total 0-27. Severity bands per Kroenke 2001 Table 2: 0-4 minimal, 5-9 mild, 10-14 moderate, 15-19 moderately severe, 20-27 severe.

`lib/scoring-v4.js PHQ9_CONFIG` implements verbatim:
- Nine items, exact prompt wording matches Kroenke 2001 Figure 1.
- Four options 0-3 with Kroenke's labels.
- Severity-band cutoffs match Kroenke 2001 Table 2 exactly.
- Total computed by `lib/screener.js scoreScreener()` (numeric sum, no reverse-scoring required - PHQ-9 has no reverse-scored items).

## Boundary examples added
- low: all items 0 -> total 0; "Minimal depression".
- mid (META `exampleAnswers` [1,1,1,2,1,0,1,0,0]): total 7; "Mild depression" (5-9 band).
- boundary low-to-moderate: [2,2,2,1,1,1,1,0,0] = 10 -> "Moderate depression" (top of 10-14).
- high: all items 3 -> total 27; "Severe depression".

## Cross-implementation differential
- Reference implementation: Kroenke 2001 Table 2 hand-binning; cross-checked against the publicly-documented PHQ-9 forms on the Patient Health Questionnaire site (www.phqscreeners.com) and the AAFP family-doctor reference.
- Test case: META exampleAnswers [1,1,1,2,1,0,1,0,0].
- Sophie result: 7, "Mild depression".
- Reference result: 7, mild (5-9 per Kroenke 2001 Table 2).
- Delta: 0%. PASS.

## Edge-input handling notes
- Each item value is summed by `scoreScreener()` which ignores null/empty entries — the renderer treats partial completion as "not yet scoreable" rather than producing a misleading low total (the `isComplete()` check is the gate).
- Item 9 ("Thoughts that you would be better off dead, or of hurting yourself") is a suicide-ideation item; the Kroenke 2001 paper notes any positive response on item 9 (>=1) warrants further evaluation independent of total. Sophie's tile renders the standard total and severity band; a future enhancement could surface an item-9 advisory, but doing so without adding clinical-action prose is non-trivial and is intentionally deferred (spec-v11 §5.3 prohibits Sophie-authored "do X" guidance; the source's note is generic, not prescriptive about any particular action).
- Citation passes the spec-v11 §3.5 "no bare URL" guard.

## A11y / keyboard notes
- Each item is a labelled `<fieldset>` of radio buttons. Tab moves between fieldsets; arrow keys move within a fieldset. Result region is `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
