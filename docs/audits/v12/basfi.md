# v12 audit - basfi

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Calin A, Garrett S, Whitelock H, Kennedy LG, O'Hea J, Mallorie P, Jenkinson T. A new approach to defining functional ability in ankylosing spondylitis: the development of the Bath Ankylosing Spondylitis Functional Index. J Rheumatol. 1994;21(12):2281-2285 (cross-verified against MDApp and the achawaqat scales reference; ≥ 2 sources, spec-v97).

`lib/rheum-ob-v156.js basfi()` computes the patient-reported axial-spondyloarthritis
functional index from ten 0–10 items. Group G, Class A.

## Source-governance notes
- Ten items each 0–10 (0 = easy, 10 = impossible): eight activities-of-daily-living
  tasks plus two coping items.
- BASFI = the **mean** of the 10 items, scored 0–10 (not a sum). A higher index
  means poorer function; the index has no fixed treatment cut-point and is used to
  track change over time.

## Boundary worked examples added
- the tile example (mean 3.5); the mean-not-sum assertion (all-6 → 6, not 60); the
  0 floor and 10 ceiling; a missing or out-of-range item → valid:false.

## Edge-input handling notes
- Any blank or out-of-[0,10] item surfaces a complete-the-fields fallback rather
  than an undefined score; covered by the spec-v59 fuzz harness, zero non-finite
  leaks.

## A11y / keyboard notes
- Ten labelled number inputs; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
