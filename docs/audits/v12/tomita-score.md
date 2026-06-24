# v12 audit - tomita-score

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Tomita K, Kawahara N, Kobayashi T, Yoshida A, Murakami H, Akamaru T. Surgical strategy for spinal metastases. Spine. 2001;26(3):298-306 (cross-verified against PubMed 11224867 (original) and PMC4035401).

`lib/spine-v146.js tomitaScore()` consumes the three prognostic factors
(primary-tumor grade, visceral metastases, bone metastases) and computes the
total 2-10 with the published surgical-strategy band. Class A.

## Source-governance notes
- Three factors: primary-tumor grade (slow 1 / moderate 2 / rapid or unknown 4),
  visceral metastases (none 0 / treatable 2 / untreatable 4), bone metastases
  (solitary 1 / multiple 2). Total 2-10.
- Non-overlapping strategy bands (NOT the overlapping survival windows some
  reviews cite): 2-3 wide/marginal excision, 4-5 marginal/intralesional, 6-7
  palliative surgery, 8-10 supportive/terminal care.
- A blank factor renders the complete-the-fields fallback.

## Boundary worked examples added
- floor 2 -> wide/marginal; 3 -> wide/marginal; 4 -> marginal/intralesional.
- 5 -> marginal; 6 -> palliative (5->6 flip).
- ceiling 10 -> supportive/terminal.

## Edge-input handling notes
- Three required selects; unrecognized keys ignored. Total is a bounded integer
  2-10 -- no non-finite path. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- Three labeled selects (leading blank placeholder); output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none
