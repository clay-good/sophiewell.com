# v12 audit - sledai-2k

- Auditor: CG
- Date: 2026-06-24
- Citation re-verified against: Gladman DD, Ibanez D, Urowitz MB. Systemic lupus erythematosus disease activity index 2000. J Rheumatol. 2002;29(2):288-291 (descriptor table doubly cross-verified against the MDApp and TheCalculator full SLEDAI-2K tables; max-score and active-disease threshold against NORM Group; primary jrheum PDF returns HTTP 403).

`lib/rheum-v147.js sledai2k()` sums the 24 weighted descriptors present in the prior
10 days to a total 0-105 with the activity framing. Class A.

## Source-governance notes
- 24 descriptors, weights 8/4/2/1: weight 8 (seizure, psychosis, organic brain
  syndrome, visual, cranial nerve, lupus headache, CVA, vasculitis), weight 4
  (arthritis, myositis, urinary casts, hematuria, proteinuria, pyuria), weight 2
  (rash, alopecia, mucosal ulcers, pleurisy, pericarditis, low complement, increased
  DNA binding), weight 1 (fever, thrombocytopenia, leukopenia). Max 105 (64+24+14+3).
- SLEDAI-2K change vs the original SLEDAI: rash, alopecia, mucosal ulcers, and
  proteinuria score ONGOING activity, not only new/recurrent.
- Framing: >= 6 denotes clinically important active disease, a fall of >= 4 a
  meaningful improvement (instrument-grounded). The 0 / 1-5 / 6-10 / 11-19 / >=20
  severity grouping is a widely reproduced convention, NOT from the 2002 paper, and
  is presented as such.

## Boundary worked examples added
- no descriptors -> 0, no activity; 5 mild (not active) / 6 moderate (active flip).
- tile example arthritis+complement+DNA = 8 -> moderate; all 24 -> 105.

## Edge-input handling notes
- 24 boolean descriptors via onFlag; an unchecked descriptor contributes 0 (a blank
  form is a valid 0, not an error). Bounded integer total. Covered by the spec-v59
  fuzz harness, zero leaks.

## A11y / keyboard notes
- 24 labeled checkboxes grouped by weight with muted sub-headings; output aria-live.
  320px sweep, no hscroll.

## Defects opened
- none
