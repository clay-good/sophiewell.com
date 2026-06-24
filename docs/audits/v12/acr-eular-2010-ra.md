# v12 audit - acr-eular-2010-ra

- Auditor: CG
- Date: 2026-06-24
- Citation re-verified against: Aletaha D, Neogi T, Silman AJ, et al. 2010 Rheumatoid arthritis classification criteria. Arthritis Rheum. 2010;62(9):2569-2581 (cross-verified against MDCalc /calc/10092 and PMC3577909 reproducing the criteria table).

`lib/rheum-v147.js acrEular2010Ra()` enforces the synovitis entry condition, then
sums the single highest level per domain to a total 0-10 and applies the >=6
classification threshold. Class B (documentation-only staleness row).

## Source-governance notes
- Entry condition: >= 1 joint with definite clinical synovitis not better explained
  by another disease. Enforced first; if absent the tile states the criteria do not
  apply rather than scoring.
- Domains (single highest level each): joints (1 large 0 / 2-10 large 1 / 1-3 small
  2 / 4-10 small 3 / >10 with >=1 small 5), serology (negative 0 / low-positive 2 /
  high-positive 3), acute-phase (normal 0 / abnormal 1), duration (<6 wk 0 / >=6 wk
  1). Total 0-10.
- Threshold: >= 6/10 classifies as definite RA. The true maximum is 10 (5+3+1+1),
  not the 15 a naive UI sum implies.

## Boundary worked examples added
- entry not met -> not applicable, no score.
- tile example 5+0+0+1 = 6 -> definite RA (>=6 flip); 5 -> not classified; ceiling 10.

## Edge-input handling notes
- Four required selects after the entry gate; a blank select -> complete-the-fields.
  Bounded integer total, no non-finite path. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- One labeled checkbox (entry) + four labeled selects; output aria-live. 320px
  sweep, no hscroll.

## Defects opened
- none
