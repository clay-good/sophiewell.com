# v12 audit - edss

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Kurtzke JF. Rating neurologic impairment in multiple sclerosis: an expanded disability status scale (EDSS). Neurology. 1983;33(11):1444-1452 (cross-verified against the Neurostatus definitions and the NMSS EDSS form; ≥ 2 sources, spec-v97).

`lib/neuro-disability-v159.js edss()` computes the EDSS step 0–10 in 0.5
increments from the eight Functional-System grades and the ambulation status.
Group G, Class A.

## Source-governance notes
- The low range (≤ 3.5) is governed by the FS grade counts; the 4.0–9.5 range is
  governed by ambulation. A precise FS→step rating is not fully algorithmic, so
  the tile uses the standard simplified FS-count table plus the authoritative
  ambulation anchors, reporting the HIGHER of the two (published precedence: a
  wheelchair-dependent patient is not EDSS 2.0 because the FS table is low). The
  renderer states this simplification and points to a trained Neurostatus rating.
- Ambulation anchors: 4.0 ≥ 500 m no aid; 6.0 unilateral aid ~100 m; 6.5
  bilateral aid ~20 m; 7.0 wheelchair; 8.0 bed/chair; 9.0 bed-bound; 10 death.

## Boundary worked examples added
- the tile example (unilateral aid → 6.0); the FS-table low range (0/1.0/1.5/2.0/
  2.5); the higher-of precedence (wheelchair pins 7.0 with low FS); ambulation
  anchors across the mid/high range; missing ambulation or FS grade → valid:false.

## Edge-input handling notes
- Every step is a 0.5 multiple in [0,10]; missing inputs surface a
  complete-the-fields fallback. Covered by the spec-v59 fuzz harness, zero
  non-finite leaks.

## A11y / keyboard notes
- An ambulation select + eight FS selects, each labelled; output aria-live. 320px
  sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
