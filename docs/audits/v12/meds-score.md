# v12 audit - meds-score

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Shapiro NI, Wolfe RE, Moore RB, Smith E, Burdick E, Bates DW. Crit Care Med. 2003;31(3):670-675 (re-fetched; cross-read with the PubMed abstract PMID 12626967, MDCalc, and the SPEED comparison cohort PMC6921192).

`lib/critcare-v112.js medsScore()` sums nine weighted clinical items to a total
of 0-27 -- terminal illness 6, tachypnea/hypoxia 3, septic shock 3, platelets
< 150k 3, bands > 5% 3, age > 65 3, lower respiratory infection 2, nursing-home
resident 2, altered mental status 2 -- and maps the total to the 28-day mortality
band: very low 0-4 (~0.9%), low 5-7 (~2.0%), moderate 8-12 (~7.8%), high 13-15
(~20%), very high >= 16 (~50%). Class A.

## Boundary worked examples added
- terminal illness + septic shock + age > 65 = 12 -> moderate (~7.8%).
- band flips across the cutoffs (4 very low, 5 low, 8/9 moderate).
- a 5-point total is the low band (just over the very-low ceiling of 4).
- the maximum total is 27 (every item) -> very high (~50%).
- no items present is a valid very-low 0.

## Cross-implementation differential
- Reference: the nine-item point set summing to 27 was confirmed across MDCalc,
  the PubMed abstract, and a secondary point table; one search summary claiming
  max 24 silently dropped the bands item and was rejected. The derivation-set
  mortality percentages (0.9 / 2.0 / 7.8 / 20 / 50) are quoted in the original
  abstract. An alternate band scheme (8-11 / 12-14 / >= 15) circulates; the tile
  uses the more widely reproduced 8-12 / 13-15 / >= 16 scheme and the source note
  records that the primary CCM table is paywalled. Match. PASS.

## Edge-input handling notes
- nine boolean items; an all-absent state is the legitimate very-low 0, not a
  fallback. The renderer names which items were counted.

## A11y / keyboard notes
- Nine labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
