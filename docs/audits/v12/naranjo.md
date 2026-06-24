# v12 audit - naranjo

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Naranjo CA, Busto U, Sellers EM, et al. A method for estimating the probability of adverse drug reactions. Clin Pharmacol Ther. 1981;30(2):239-245 (cross-verified verbatim against the NCBI LiverTox Naranjo assessment worksheet, NBK548069, including every negative value).

`lib/rheum-v148.js naranjo()` sums the ten weighted yes/no/don't-know answers
-4 to +13 and reports the probability band. Class A.

## Source-governance notes
- Q2 (event after the drug) No = -1; Q4 (rechallenge) No = -1; Q5 (alternative
  causes) Yes = -1, No = +2; Q6 (placebo) Yes = -1, No = +1 -- all negatives
  confirmed verbatim. Don't-know = 0 for every question.
- Total range -4 to +13. Bands: <= 0 doubtful, 1-4 possible, 5-8 probable,
  >= 9 definite.

## Boundary worked examples added
- total 6 -> probable (tile example); the probable->definite 8->9 flip; doubtful
  at <= 0 via the negatives; possible 1-4; the -4 minimum and +13 maximum;
  unanswered-question fallback.

## Edge-input handling notes
- Ten required selects; an unanswered question surfaces a complete-the-fields
  fallback rather than scoring it as 0. num() bounds the -4..+13 total. Covered by
  the spec-v59 fuzz harness, zero leaks.

## A11y / keyboard notes
- Ten labeled yes/no/don't-know selects; output aria-live. 320px sweep, no
  hscroll.

## Defects opened
- none

## Status
- PASS
