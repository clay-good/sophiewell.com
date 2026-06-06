# v11 audit - sipa

- Auditor: CG
- Date: 2026-06-06 (spec-v57).
- Citation re-verified against: Acker 2015 (SIPA, J Pediatr Surg 50:331).

lib/scoring-v5.js sipa() computes shock index HR/SBP and compares it to the age-specific elevated cutoff (1.22 / 1.0 / 0.9 for 4-6 / 7-12 / 13-16 yr).

## Boundary examples added
- age 5, HR 140 / SBP 100 -> SI 1.4 > 1.22 elevated.
- age 10 -> cutoff 1.0; age 15 -> 0.9.
- age outside 4-16 -> no cutoff, caution band.

## Cross-implementation differential
- SI and cutoffs match the published age bands. PASS.

## Edge-input handling notes
- SBP min 1 guards divide-by-zero; ages outside 4-16 return cutoff null + caution, never a misleading flag.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
