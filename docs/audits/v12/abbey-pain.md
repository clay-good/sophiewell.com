# v12 audit - abbey-pain

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Abbey J, Piller N, De Bellis A, et al. The Abbey pain scale: a 1-minute numerical indicator for people with end-stage dementia. Int J Palliat Nurs. 2004;10(1):6-13. Six items, 0-3 per-item scoring, 0-18 range, and the no-pain / mild / moderate / severe bands cross-verified against the geriatricpain.org administration form and Physiopedia (>= 2 sources, spec-v97).

`lib/ltcga-v175.js abbeyPain()` sums the 6 observed items to 0-18. Group G, Class A.

## Source-governance notes
- Six items (vocalization, facial expression, change in body language, behavioural change, physiological change, physical change), each 0 absent / 1 mild / 2 moderate / 3 severe.
- Total 0-18; bands 0-2 no pain, 3-7 mild, 8-13 moderate, 14+ severe.
- Journal issuer; does not trip ISSUER_PATTERN; no citation-staleness row.

## Boundary worked examples added
- 0/18 no pain; the 7->8 mild->moderate boundary; the 13->14 moderate->severe boundary; 18/18 severe; out-of-range (4) and blank -> valid:false.

## Edge-input handling notes
- Each item validated to 0-3; any null/blank/out-of-range -> valid:false; never NaN (spec-v59 fuzz pass).
