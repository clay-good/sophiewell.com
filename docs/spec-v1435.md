# spec-v1435 — HATCH score for atrial fibrillation progression

Found with [spec-v1434](spec-v1434.md): `hatch` matched nothing. The catalog stages atrial
fibrillation (`af-stages-2023`, `ehra-af`) but had nothing that estimates whether paroxysmal AF
will become sustained.

## Sources, read 2026-09-24

- de Vos CB et al, *J Am Coll Cardiol* 2010;55:725-731 (abstract, PubMed 20170808): 1,219 patients
  with paroxysmal AF in the Euro Heart Survey; 15% progressed within a year; "Nearly 50% of the
  patients with a HATCH score >5 progressed to persistent AF compared with only 6% of the patients
  with a HATCH score of 0." The abstract names the predictors but not their points.
- The points, from Li YG et al, *Chest* 2019 (PMC6437029), which compared against HATCH:
  hypertension 1, age 75 or older 1, TIA or stroke 2, COPD 1, heart failure 2 (total 0-7).

## Behavior

The tool reports **only the two rates the derivation paper gives**: about 6% at a score of 0 and
nearly 50% above 5. For 1 to 5 it says the paper gives no rate for that score rather than
interpolating one. Every item must be answered; a blank is never read as "no". The note says this
is a progression score, not a stroke-risk or anticoagulation score.

## Tests

`test/unit/hatch-af.test.js`: each item's points, the two anchors and the no-rate middle (5 and 6
either side of the line), and blank items.
