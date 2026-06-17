# v12 audit - duke-endocarditis

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: Fowler VG, Durack DT, Selton-Suty C, et al. The 2023 Duke-ISCVID Criteria for Infective Endocarditis. Clin Infect Dis. 2023;77(4):518-526; updating Li JS, Sexton DJ, et al. Clin Infect Dis. 2000;30(4):633-638.

`lib/idcrit-v99.js dukeEndocarditis()` applies the modified Duke (2023 Duke-ISCVID) rule: definite = 2 major, or 1 major + 3 minor, or 5 minor; possible = 1 major + 1 minor, or 3 minor; otherwise rejected. Class B: the Duke-ISCVID criteria are revisable, so a docs/citation-staleness.md row names the 2023 edition.

## Boundary worked examples added
- 2 major -> definite.
- 1 major + 3 minor -> definite; 5 minor -> definite.
- 1 major + 1 minor -> possible; 3 minor -> possible; 1 major alone -> rejected.

## Cross-implementation differential
- Reference: the Duke-ISCVID definite/possible thresholds. Match. PASS.

## Edge-input handling notes
- Pure criteria counting over fixed major/minor sets; no arithmetic input can produce NaN. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
