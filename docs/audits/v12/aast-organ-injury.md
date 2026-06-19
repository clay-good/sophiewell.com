# v12 audit - aast-organ-injury

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Kozar RA, Crandall M, Shanmuganathan K, et al; AAST Patient Assessment Committee. J Trauma Acute Care Surg. 2018;85(6):1119-1122.

`lib/traumaclass-v109.js aastOrganInjury()` walks the 2018 AAST grade rules for the
selected organ (spleen / liver / kidney), returning the higher of the worst
anatomic finding and the 2018 vascular-rule grade. Class B (documentation-only
docs/citation-staleness.md row; the citation does not match the issuer pattern).

## Boundary worked examples added
- no organ / no finding -> fallback.
- anatomic finding sets the grade when no vascular injury.
- band flip: contained vascular injury upgrades spleen II -> IV.
- active bleeding beyond raises spleen to V, liver/kidney to IV.
- a higher anatomic finding still wins over a lower vascular grade.

## Cross-implementation differential
- Reference: the imaging-column grade I-V thresholds (Tables 1-3) and the
  contained-vs-extending vascular rule (spleen contained IV / beyond V; liver and
  kidney contained III / beyond IV) cross-verified against the Kozar 2018 paper
  and the RadioGraphics 2024 review (rg.230040). Per-organ decision tree, not a
  browsable atlas; the anatomic-finding select rebuilds when the organ changes.
  Match. PASS.

## Edge-input handling notes
- a classification, not an operative decision; grade is clamped to I-V.

## A11y / keyboard notes
- Labeled organ / anatomic-finding / vascular selects; output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
