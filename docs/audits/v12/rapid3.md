# v12 audit - rapid3

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Pincus T, Swearingen CJ, Bergman M, Yazici Y. RAPID3 compared to ACR20 and DAS28. Bull NYU Hosp Jt Dis. 2009;67(2):211-225 (scale form Pincus J Rheumatol 2008;35(11):2136-2147; cross-verified against The Rheumatologist MDHAQ/RAPID3 review; >= 2 sources, spec-v97).

`lib/rheum-v160.js rapid3()` sums three patient-reported 0-10 components to 0-30.
Group G, Class A.

## Source-governance notes
- Function = MDHAQ FN (10 items each 0-3, summed 0-30) DIVIDED BY 3 -> 0-10;
  plus pain VAS and patient-global VAS. RAPID3 = FN + pain + global, 0-30.
- Categories: near-remission <= 3, low 3.1-6, moderate 6.1-12, high > 12.
- The 0-30 form is shipped (the same paper also defines a 0-10 variant; the two
  are not mixed).

## Boundary worked examples added
- the tile example (15 -> high); the MDHAQ/3 transform (raw 30 -> 10); the 3/3.1,
  6/6.1, 12 category boundaries; blanks / out-of-range -> valid:false.

## Edge-input handling notes
- Each input is finite and in range; a blank surfaces a complete-the-fields
  fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Three labelled number inputs; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
