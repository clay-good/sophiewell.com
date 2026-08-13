# spec-v727.md — Functional Oral Intake Scale (FOIS)

> Status: **SHIPPED (2026-08-13).** Builds the `fois` tile. Catalog **1557 → 1558**, group G.

## Why

The catalog had swallow-screen tools but not the **FOIS**, the standard ordinal documentation of
functional oral intake in dysphagia (widely used in stroke rehabilitation). Gap.

## What it does

Select the functional level (1–7):

| Level | Meaning |
| --- | --- |
| 1 | no oral intake |
| 2 | tube-dependent, minimal/inconsistent oral intake |
| 3 | tube supplements with consistent oral intake |
| 4 | total oral intake of a single consistency |
| 5 | total oral intake, multiple consistencies, special preparation |
| 6 | total oral intake, avoid specific foods/liquids |
| 7 | total oral intake, no restrictions |

Levels 1–3 involve tube feeding; 4–7 are total oral intake. Higher = less restricted.

## Posture (spec-v97)

Documents the current functional oral intake and tracks change; it does not prescribe a diet. It
supports rather than replaces the swallowing evaluation.

## Files

- `lib/fois-v727.js` — `fois()`, `FOIS_NOTE`.
- `views/group-v727.js` (RV727) — one level select; a11y-checked, no innerHTML.
- `mcp/adapters/fois-v727.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, levels, related (nihss, barthel).
- `test/unit/fois.test.js` — 5 tests (Level 1/4/7, the tube-feeding boundary, required+validated level).
- `docs/spec-v727.md` (this file).

## Sourcing (spec-v97)

Crary MA, Mann GD, Groher ME. Initial psychometric assessment of a functional oral intake scale
for dysphagia in stroke patients. *Arch Phys Med Rehabil.* 2005;86(8):1516-1520 (PMID 16084801).
The seven level definitions were confirmed against the original and clinical FOIS references,
which agree; the level text is non-copyrighted and stable.
