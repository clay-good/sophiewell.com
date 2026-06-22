# v12 audit - rotterdam-pcos

- Auditor: CG
- Date: 2026-06-22
- Citation re-verified against: Rotterdam ESHRE/ASRM-Sponsored PCOS Consensus Workshop Group. Revised 2003 consensus on diagnostic criteria and long-term health risks related to polycystic ovary syndrome. Hum Reprod. 2004;19(1):41-47 (re-fetched; the two-of-three rule, the three features, and the exclusion-of-mimics requirement cross-read across the primary record and >= 2 independent reproductions).

`lib/gyn-v139.js rotterdamPcos()` counts the three Rotterdam features (oligo/
anovulation, clinical/biochemical hyperandrogenism, polycystic ovarian morphology)
and reports the criteria met only when >= 2 are present AND mimics are confirmed
excluded, naming the phenotype (A-D). Class B (the consensus criteria are
revisable -> docs/citation-staleness.md row; the citation names the ESHRE/ASRM
group, which is not in the issuer acronym set, so the row is documentation only).

## Source-governance notes
- The exclusion of mimics (thyroid disease, hyperprolactinemia, non-classic CAH,
  androgen-secreting tumors) is a hard precondition: without it the tile reports
  "not yet confirmed", never "met", even with all three features.
- The phenotype labels (A: all three; B: hyperandrogenism + ovulatory dysfunction;
  C: hyperandrogenism + morphology; D: ovulatory dysfunction + morphology) follow
  the later NIH/AE-PCOS phenotype convention layered on the Rotterdam features.

## Boundary worked examples added
- hyperandrogenism + oligo/anovulation, mimics excluded -> met, phenotype B.
- all three, mimics excluded -> met, phenotype A.
- one feature, mimics excluded -> not met (two required).
- two features but mimics not excluded -> not confirmed.

## Edge-input handling notes
- Four checkboxes, no numeric inputs; every combination resolves (always valid).

## A11y / keyboard notes
- Four labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
