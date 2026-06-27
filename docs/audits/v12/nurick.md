# v12 audit - nurick

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Nurick S. The pathogenesis of the spinal cord disorder associated with cervical spondylosis. Brain. 1972;95(1):87-100 (cross-verified against Physiopedia's Nurick classification and the StatPearls cervical-myelopathy reference; ≥ 2 sources, spec-v97).

`lib/neuro-disability-v159.js nurick()` maps the gait/ambulation status to a 0–5
grade. Group G, Class A.

## Source-governance notes
- 0 root signs/symptoms, no cord involvement; 1 cord signs, normal gait; 2 mild
  gait difficulty, fully employed; 3 gait difficulty preventing employment; 4
  walks only with assistance; 5 chairbound or bedridden.
- A gait-focused myelopathy scale, complementary to the multidomain mJOA.

## Boundary worked examples added
- grade 3 (prevents employment); grades 0/1 not flagged as gait difficulty;
  grade 4 (assistance) and 5 (chairbound); out-of-range/blank → valid:false.

## Edge-input handling notes
- A single bounded integer select; an out-of-range or blank value surfaces a
  complete-the-fields fallback. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- One labelled select; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
