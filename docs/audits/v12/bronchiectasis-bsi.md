# v12 audit - bronchiectasis-bsi

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Chalmers JD, Goeminne P, Aliberti S, et al. Am J Respir Crit Care Med. 2014;189(5):576-585 (re-fetched; cross-read with the PubMed abstract PMID 24328736, the mdapp.co full point table, and the Bronchiectasis Toolbox calculator).

`lib/pulm-v114.js bronchiectasisBsi()` sums nine weighted items -- age
(<50 = 0, 50-69 = 2, 70-79 = 4, >=80 = 6), BMI (<18.5 = 2), FEV1 % predicted
(>80 = 0, 50-80 = 1, 30-49 = 2, <30 = 3), a hospital admission in the prior 2
years (5), >=3 exacerbations in the prior year (2), MRC dyspnea (4 = 2, 5 = 3),
Pseudomonas (3), other organism (1), and radiology (>=3 lobes 1, cystic 1) --
and maps the total to bands low 0-4, intermediate 5-8, high >=9. Class A.

## Boundary worked examples added
- age 72 + BMI 17 + FEV1 45 + 3 exac + MRC 4 + admission + Pseudomonas = 20 (high).
- age bands: <50 = 0, 50-69 = 2, 70-79 = 4, >=80 = 6.
- FEV1 bands: >80 = 0, 50-80 = 1, 30-49 = 2, <30 = 3.
- band boundary at 4/5 (low/intermediate) and 8/9 (intermediate/high).
- radiology items stack: >=3 lobes (+1) and cystic (+1) can both score.
- partial input returns a complete-the-fields fallback.

## Cross-implementation differential
- Reference: the full weighted table and the band cutpoints (low 0-4, moderate
  5-8, severe >8) were confirmed identical across mdapp.co and the Bronchiectasis
  Toolbox, with the band cutpoints stated explicitly in the PubMed abstract.
  SOURCE GOVERNS over the spec draft on two points: the admission window is the
  prior 2 YEARS (not a generic "prior hospitalization"), and BSI uses the MRC
  1-5 dyspnea scale (4 = +2, 5 = +3), not mMRC. The radiology +1 for >=3 lobes
  and +1 for cystic are scored together (up to 2). Match. PASS.

## Edge-input handling notes
- five required numeric fields (age, BMI, FEV1, exacerbations, MRC via a select);
  a blank required field renders the complete-the-fields fallback rather than
  scoring 0. MRC is rounded before band lookup; colonization/radiology are
  booleans. Fuzz scalar args hit the fallback safely.

## A11y / keyboard notes
- Four labeled number inputs + one labeled select + five labeled checkboxes;
  output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
