# v12 audit - decaf-score

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Steer J, Gibson J, Bourke SC. The DECAF Score. Thorax. 2012;67(11):970-976 (re-fetched; cross-read with MDCalc calc/4018, PubMed PMID 22895999, and a PulmCCM validation summary).

`lib/pulm-v114.js decafScore()` sums five items to a total of 0-6 -- eMRCD
dyspnea (1-4 = 0, 5a = +1, 5b = +2), eosinopenia < 0.05 (1), consolidation (1),
acidemia pH < 7.30 (1), atrial fibrillation (1) -- and maps the total to the
derivation-cohort in-hospital mortality band: low 0-1 (1.4%), intermediate 2
(8.4%), high 3-6 (34.6%). Class A.

## Boundary worked examples added
- eMRCD 5b + eosinopenia + acidemia = 4 -> high (34.6%).
- eMRCD grade mapping: 1-4 = 0, 5a = 1, 5b = 2.
- band boundary: 1 low (1.4%), 2 intermediate (8.4%), 3 high (34.6%).
- a zero score is low risk with no items counted.
- the maximum total is 6 (every item) -> high.

## Cross-implementation differential
- Reference: the five-item DECAF table and the three band cutpoints (0-1 / 2 /
  3-6) with band mortality 1.4 / 8.4 / 34.6% were confirmed across MDCalc and the
  PubMed abstract. The only graded item is the eMRCD 5a-vs-5b split; grades 1-4
  contribute 0. Match. PASS.

## Edge-input handling notes
- eMRCD is a 0/+1/+2 select (always populated); the four remaining items are
  booleans. A scalar fuzz arg yields a valid all-absent 0.

## A11y / keyboard notes
- One labeled select + four labeled checkboxes; output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
