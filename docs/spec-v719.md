# spec-v719.md — Kennedy classification (partially edentulous arch)

> Status: **SHIPPED (2026-08-13).** Builds the `kennedy-edentulous` tile. Catalog **1549 → 1550**, group G.

## Why

Fifth tile in the dentistry vein. The Kennedy classification is the standard way to describe a
partially edentulous arch for removable-partial-denture design — a clean decision-logic code
classifier with the Applegate modification rule.

## What it does

The class is set by the **most-posterior** edentulous area (Applegate rule 1):

| Class | Arrangement |
| --- | --- |
| I | bilateral edentulous areas posterior to the remaining teeth |
| II | unilateral edentulous area posterior to the remaining teeth |
| III | unilateral edentulous area bounded by natural teeth |
| IV | single anterior edentulous area crossing the midline |

Additional edentulous areas are **modification** spaces, numbered by their **count** (extent
ignored). **Class IV admits no modifications** (Applegate rule, enforced).

## Posture (spec-v97)

Describes the arch to guide denture design; it does not prescribe the appliance. It supports
rather than replaces the prosthodontic assessment.

## Files

- `lib/kennedy-edentulous-v719.js` — `kennedyEdentulous()`, `KENNEDY_NOTE`.
- `views/group-v719.js` (RV719) — a class select + a modification-count select; a11y-checked.
- `mcp/adapters/kennedy-edentulous-v719.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, classes + rules, related (ellis-tooth-fracture).
- `test/unit/kennedy-edentulous.test.js` — 5 tests (Class I, Class II mod 1, default mods,
  Class-IV-no-mods rule, validation).
- `docs/spec-v719.md` (this file).

## Sourcing (spec-v97)

Kennedy E. Partial denture construction. *Dental Items of Interest.* 1925; applied with
Applegate's rules (1960). The four class definitions and the modification-numbering / Class-IV
rules were confirmed against an eDentalPortal reference and a dental dictionary, which agree.
