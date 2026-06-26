# v12 audit - wagner-dfu

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Wagner FW Jr. The dysvascular foot: a system for diagnosis and treatment. Foot Ankle. 1981;2(2):64-122 (cross-verified against WoundSource and the Wound Care Education Institute reproduction; ≥ 2 sources, spec-v97).

`lib/suites-v155.js wagnerDfu()` maps a diabetic-foot lesion's depth/extent to
the Wagner grade 0–5. A deterministic input → class mapping (spec-v100 §2
classification clarification). Group G, Class A.

## Source-governance notes
- Grade 0 intact skin / pre- or post-ulcerative at-risk foot (no open lesion),
  1 superficial ulcer (not past subcutaneous tissue), 2 deep ulcer to tendon,
  capsule, or bone without abscess/osteomyelitis, 3 deep ulcer with abscess or
  osteomyelitis, 4 localized (forefoot/heel) gangrene, 5 whole-foot gangrene.
- The tile flags grade ≥ 3 (deep infection or gangrene) as the strong concern
  band needing surgical / vascular evaluation; lower grades render without the
  warn class. Definitions matched exactly across both sources, no discrepancy.

## Boundary worked examples added
- tile example grade 3 osteomyelitis; the grade-2/3 abnormal flip; grade-4
  gangrene; every grade 0–5 resolves to a defined cell; grade 0 not flagged;
  out-of-range / blank / non-integer → valid:false.

## Edge-input handling notes
- The grade must be an integer 0–5; anything else (6, −1, 2.5, blank) surfaces a
  complete-the-fields fallback; covered by the spec-v59 fuzz harness, zero
  non-finite leaks.

## A11y / keyboard notes
- One labelled select; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
