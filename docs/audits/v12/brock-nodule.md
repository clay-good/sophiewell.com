# v12 audit - brock-nodule

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: McWilliams A, Tammemagi MC, Mayo JR, et al. Probability of cancer in pulmonary nodules detected on first screening CT. N Engl J Med. 2013;369(10):910-919 (re-fetched; cross-read with MDCalc "Brock Score", Radiopaedia "Brock model for pulmonary nodules", the Cui et al TLCR appendix, and the mdapp lung-nodule calculator).

`lib/pulmnod-v115.js brockNodule()` computes the PanCan full-model logistic
cancer probability: x = -6.7892 + 0.0287*(age-62) + 0.6011*female +
0.2961*familyHistory + 0.2953*emphysema - 5.3854*((size/10)^-0.5 - 1.58113883) +
typeCoef + 0.6581*upperlobe - 0.0824*(count-4) + 0.7729*spiculation, typeCoef
solid 0 / part-solid +0.377 / non-solid -0.1276, probability = e^x/(1+e^x).
Class A.

## Boundary worked examples added
- 65 yo, female, emphysema, 15 mm solid, upper, 2 nodules, spiculated -> 47.7%.
- low anchor: 55 yo male, 5 mm solid, lower lobe, single -> 0.3%.
- high anchor: 70 yo female, family history, emphysema, 20 mm part-solid, upper,
  spiculated -> 80.1%.
- nodule type orders the probability part-solid > solid > non-solid.
- a zero/negative size is domain-guarded (no power on a non-positive base).
- extreme inputs are clamp-guarded (no NaN/Infinity, probability <= 100%).

## Cross-implementation differential
- Reference: the age (centered at 62) and count (centered at 4) terms, the
  ((size/10)^-0.5 - 1.58113883) power transform with coefficient -5.3854, and
  the nodule-type coefficients were re-fetched and cross-verified. The
  centering constant 1.58113883 = 0.4^-0.5 was confirmed numerically. The 47.7%
  worked example was reproduced by hand (x = -0.093). One TLCR typesetting
  artifact (a stray brace negating the additive terms) was rejected against the
  numeric sanity check and three other sources. Match. PASS.

## Edge-input handling notes
- age, size, and count are required numbers (size > 0, count >= 1 guarded); the
  type is a select (defaults solid); the remaining items are booleans. x is
  clamped to [-40, 40] before the logistic. A scalar fuzz arg yields a
  valid:false fallback.

## A11y / keyboard notes
- Three labeled number inputs + one labeled select + five labeled checkboxes;
  output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
