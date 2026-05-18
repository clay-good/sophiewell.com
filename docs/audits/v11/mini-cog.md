# v11 audit - Mini-Cog Cognitive Screener (`mini-cog`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Borson S, Scanlan J, Brush M, Vitaliano P, Dokmak A. *The Mini-Cog: a cognitive 'vital signs' measure for dementia screening in multi-lingual elderly.* Int J Geriatr Psychiatry. 2000;15(11):1021-1027. Three-item word recall (0-3) + clock-drawing test (CDT, normal/abnormal); composite score 0-5; cutoff <3 = positive for cognitive impairment (further evaluation indicated).

`lib/scoring-v4.js miniCog()` implements verbatim:
- `wordsRecalled` clamped to 0-3 by `Math.max(0, Math.min(3, ...))`.
- `clockNormal` boolean -> 2 if true, 0 if false (the Borson 2000 scoring: normal clock = 2 pts; abnormal = 0 pts; no intermediate value).
- Total = words + clock; band = score >= 3 ? Negative : Positive.

## Boundary examples added
- low: words 0, clock abnormal -> 0+0 = 0; "Positive screen - further evaluation indicated".
- mid (META example mc-w 2, mc-clock 1): 2 + 2 = 4; "Negative for cognitive impairment screen". The display string "Mini-Cog 4/5" in META expected is the renderer's standard summary.
- boundary at 3 (just negative): words 1, clock normal -> 1 + 2 = 3; "Negative".
- boundary just below: words 0, clock normal -> 0 + 2 = 2; "Positive".
- high: words 3, clock normal -> 3 + 2 = 5; "Negative".

## Cross-implementation differential
- Reference implementation: Borson 2000 original scoring rule; cross-checked against the publicly-available Mini-Cog scoring sheet (mini-cog.com) and the Alzheimer's Association reference.
- Test case: META example.
- Sophie result: 4, "Negative for cognitive impairment screen".
- Reference result: 4 (2 recall + 2 normal clock), negative (>=3).
- Delta: 0%. PASS.

## Edge-input handling notes
- `wordsRecalled` is a number input; values outside 0-3 are clamped (Math.max/min), not thrown. This is a deliberate UX choice (a typo of "5" yields "3" instead of an error), faithful to the Borson 2000 rule that limits the recall sub-score to 0-3.
- `clockNormal` is a checkbox; the binary nature reflects Borson 2000's binary CDT scoring (some derivatives use 0/1/2 for partially-correct clocks; Sophie implements the original binary).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- One labelled number input (0-3) plus one labelled checkbox. Tab-reachable in source order. Output region announces score and band. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
