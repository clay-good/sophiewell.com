# v12 audit - faced-bronchiectasis

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Martinez-Garcia MA, de Gracia J, Vendrell Relat M, et al. Eur Respir J. 2014;43(5):1357-1367 (re-fetched; cross-read with the Bronchiectasis Toolbox, PMC5383257 FACED-vs-BSI comparison, the PMC7601347 meta-analysis, and the PMC5406918 Latin America validation).

`lib/pulm-v114.js facedBronchiectasis()` sums five items to a total of 0-7 --
FEV1 < 50% (2), Age >= 70 (2), chronic Pseudomonas Colonization (1), radiological
Extension >= 3 lobes (1), Dyspnea mMRC >= 3 (1) -- and maps the total to bands
mild 0-2, moderate 3-4, severe 5-7, with derivation-cohort 5-year mortality
4.3 / 25.3 / 68.8%. Class A.

## Boundary worked examples added
- FEV1 45 + age 72 + Pseudomonas = 5 -> severe (68.8%).
- FEV1 and Age each contribute 2 at their thresholds (FEV1 < 50, age >= 70).
- band boundary: 2 mild, 3 moderate, 5 severe.
- the three 1-point items are extension >= 3 lobes, dyspnea mMRC >= 3, Pseudomonas.
- partial input returns a complete-the-fields fallback.

## Cross-implementation differential
- Reference: SOURCE GOVERNS over the spec draft on two thresholds, both corrected
  here and confirmed across three sources (Bronchiectasis Toolbox, PMC5383257,
  PMC7601347): Extension scores at > 2 lobes (i.e. >= 3 lobes), NOT the draft's
  ">= 2 lobes" (1-2 lobes = 0); and Dyspnea scores at mMRC >= 3, NOT the draft's
  "mMRC >= 2" (mMRC 0-2 = 0). The other three weights (FEV1 < 50% = 2, age >= 70
  = 2, Pseudomonas = 1) and the band cutpoints (0-2 / 3-4 / 5-7) match. The
  5-year mortality varies by cohort; the tile quotes the original derivation
  cohort (4.3 / 25.3 / 68.8%) and labels it as such. Match. PASS.

## Edge-input handling notes
- two required numeric fields (FEV1, age); a blank renders the complete-the-fields
  fallback. The remaining three are booleans. Fuzz scalar args hit the fallback.

## A11y / keyboard notes
- Two labeled number inputs + three labeled checkboxes; output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
