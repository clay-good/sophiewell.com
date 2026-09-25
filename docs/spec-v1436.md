# spec-v1436 — RCVS2 score

Found by the gap finder: `rcvs`, `thunderclap` and `vasoconstriction` matched nothing. The catalog
has the thunderclap-headache front door (`ottawa-sah`) and the aneurysmal-hemorrhage grades
(`hunt-hess-wfns`), and nothing for the next question when vessel imaging shows narrowing:
reversible cerebral vasoconstriction syndrome, or another arteriopathy such as primary angiitis.

## Sources, read 2026-09-24

- Rocha EA et al, *Neurology* 2019;92:e639-e647 (abstract, PubMed 30635475; DOI checked on
  Crossref): range -2 to +10; 5 or more had 99% specificity and 90% sensitivity for RCVS; 2 or less
  had 100% specificity and 85% sensitivity for excluding it; 3 to 4 had 86% specificity and 10%
  sensitivity. Derived in 110 patients (30 with RCVS); validated against primary angiitis of the
  CNS. The abstract names the items but not their points.
- The points, from the table in de Sousa IA et al, *Headache* 2026;66:1162 (open access,
  PMC13142216):

| item | points |
|---|---|
| recurrent or single thunderclap headache | 5 |
| intracranial carotid artery involved | -2 |
| vasoconstrictive trigger | 3 |
| female | 1 |
| subarachnoid hemorrhage | 1 |

## Behavior

Every item must be answered. The carotid item **subtracts**, so a blank read as "not involved" would
raise the score; the refusal says so. The answer gives the derivation's specificity and sensitivity
at the band reached, the indeterminate band carries the authors' bedside approach (it correctly
diagnosed 25 of 37 patients scoring 3 to 4), and every answer says the score is for a patient whose
imaging already shows an intracranial arteriopathy: it does not screen headaches, and reversibility
is confirmed on repeat vessel imaging.

## Tests

`test/unit/rcvs2.test.js`: the points and range, each band edge including a negative contribution,
the notes, and blank items.
