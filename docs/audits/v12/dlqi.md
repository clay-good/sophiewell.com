# v12 audit - dlqi

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Finlay AY, Khan GK. Dermatology Life Quality Index (DLQI) — a simple practical measure for routine clinical use. Clin Exp Dermatol. 1994;19(3):210-216 (item scoring, the Q7 prevented-work branch, and the five severity bands cross-verified against the Cardiff/Finlay official DLQI scoring instructions and a secondary clinical-tool reference; ≥ 2 independent sources, spec-v97).

`lib/derm-v151.js dlqi()` consumes ten 0-3 quality-of-life answers and computes
the simple sum 0-30 with the published effect band. Class A.

## Source-governance notes
- Each question: Very much 3, A lot 2, A little 1, Not at all / Not relevant 0.
- Q7 first asks whether the skin PREVENTED work/study (Yes = 3); only on No is the
  how-much-a-problem follow-up scored. Q7 contributes a SINGLE value, never both
  branches — modeled as one select whose top option is the yes-prevented = 3 case.
- Bands: 0-1 no effect, 2-5 small, 6-10 moderate, 11-20 very large, 21-30
  extremely large effect.
- A partially-completed form surfaces a complete-the-fields fallback rather than
  scoring an undercounted total (spec-v151 §3 requirement).

## Boundary worked examples added
- total 6 (moderate); the 5/6 small-vs-moderate boundary; the 10/11
  moderate-vs-very-large boundary; all-3 -> 30 (extremely large) and all-0 -> 0
  (no effect); partial/blank answers -> valid:false.

## Edge-input handling notes
- Blank/empty answer -> missing -> valid:false; covered by the spec-v59 fuzz
  harness, zero non-finite leaks.

## A11y / keyboard notes
- Ten labeled selects with a blank placeholder; output aria-live. 320px sweep, no
  hscroll.

## Defects opened
- none

## Status
- PASS
