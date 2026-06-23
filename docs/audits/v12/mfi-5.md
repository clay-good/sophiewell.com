# v12 audit - mfi-5

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Subramaniam S, Aalberg JJ, Soriano RP, Divino CM. New 5-Factor Modified Frailty Index Using American College of Surgeons NSQIP Data. J Am Coll Surg. 2018;226(2):173-181. The five deficits and the 0-5 range were cross-verified across 2+ sources.

`lib/frailty-v143.js mfi5()` counts five accumulated deficits (diabetes mellitus,
hypertension requiring medication, COPD/pneumonia history, congestive heart
failure, partially or totally dependent functional status), one point each, for a
0-5 total. Class A.

## Source-governance notes
- A count of 2 or more is the commonly-cited frailty threshold associated with
  elevated postoperative morbidity and mortality (`abnormal` flips at >= 2). The
  mFI-5 was validated against (and performs comparably to) the original 11-item
  mFI-11, which is cross-linked.
- No probability is shipped -- the tile reports the deficit count and the
  published threshold framing only.

## Boundary worked examples added
- no deficits -> 0, not frail.
- the >= 2 frailty threshold flips at 2 (diabetes + CHF).
- two deficits names which were counted.
- all five deficits -> 5, frail.

## Edge-input handling notes
- Each deficit is a checkbox coerced through onFlag(); unrecognized keys are
  ignored. A bounded count -- no non-finite path. Covered by the spec-v59 fuzz
  harness (lib/frailty-v143.js added to MODULES).

## A11y / keyboard notes
- Five labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
