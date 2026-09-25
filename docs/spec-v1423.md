# spec-v1423 — Pires classification of interprosthetic femur fractures

From the classification-gap queue. The catalog classifies a femur fracture around a hip stem
(`vancouver-periprosthetic`) and the femoral canal before a hip replacement (`dorr-femur`), and had
nothing for a fracture *between* a hip stem and a knee replacement on the same side.

## Sources

- Pires RES et al, *Injury* 2014;45(suppl 5):S2-S6 (PubMed 25528619, DOI confirmed via Crossref):
  the original classification and treatment algorithm.
- Gheewala RA, Young JR, *Classifications in Brief: Pires Classification of Interprosthetic Femur
  Fractures*, Clin Orthop Relat Res 2022;480:1666-1671 (open access, PMC9384940), read 2026-09-24.
  Its Description is the rule this tool applies:

| type | knee femoral component | fracture site | letter |
|---|---|---|---|
| I | unstemmed | closer to the hip stem | A both fixed, B hip loose, C knee loose, D both loose |
| II | unstemmed | closer to the knee component | same as type I |
| III | stemmed | (text: any; figures: near the knee stem) | A fixed + viable bone, B fixed + nonviable, C any loose + viable, D any loose + nonviable |

Viable bone: "at least 5 centimeters with no cement and prosthesis components in the fracture site."

## Behavior

The type is **derived** from five recorded findings; the fracture site is asked only for an
unstemmed knee and bone viability only for a stemmed one. Two places where the review disagrees
with itself are handled in the open: its Fig. 3 caption attaches the viability definition to
*nonviable* bone (the tool follows the text), and its figures show type III fractures near the
knee stem while the text defines type III by the stem alone (a hip-side type III is classified and
flagged as approximate). Every answer carries the reliability figures (interobserver kappa 0.499,
intraobserver 0.636) and the review's recommendation against using the class to guide treatment.
The original's treatment algorithm is not reproduced.

## Tests

`test/unit/pires-interprosthetic.test.js`: all eight type I and II combinations; all eight type III
combinations (any loose implant is C or D); a stemmed knee without a fracture site, and the
hip-side flag; the band wording; the reliability and reoperation notes; the refusals.
