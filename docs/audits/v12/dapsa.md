# v12 audit - dapsa

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Schoels MM, Aletaha D, Alasti F, Smolen JS. Disease activity in psoriatic arthritis (DAPSA). Ann Rheum Dis. 2016;75(5):811-818 (cutoffs Schoels 2010; cross-verified against the Q-DAPSA validation PMC9639152 and Medscape PsA cutoffs; >= 2 sources, spec-v97).

`lib/rheum-v160.js dapsa()` sums the five DAPSA components. Group G, Class A.

## Source-governance notes
- DAPSA = TJC68 + SJC66 + patient-global VAS (0-10) + pain VAS (0-10) + CRP in
  mg/dL. CRP is mg/dL, NOT mg/L (an mg/L value inflates the score ~10x) - the
  chief unit trap, unit-tested explicitly.
- Cutoffs: remission <= 4, low 5-14, moderate 15-28, high > 28.

## Boundary worked examples added
- the tile example (17.2 -> moderate); the mg/dL-vs-mg/L inflation demonstration;
  the 4/5, 14/15, 28 cutoff boundaries; blanks / out-of-range -> valid:false.

## Edge-input handling notes
- Joint counts capped at 68/66, VAS at 10, CRP finite; a blank surfaces a
  complete-the-fields fallback. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- Five labelled number inputs; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
