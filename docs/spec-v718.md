# spec-v718.md — Ellis dental-fracture classification

> Status: **SHIPPED (2026-08-13).** Builds the `ellis-tooth-fracture` tile. Catalog **1548 → 1549**, group G.

## Why

Fourth tile in the dentistry vein, and genuinely cross-domain: **dental trauma** is a documented
emergency-medicine topic. The Ellis classification is the standard bedside grade of a traumatic
crown fracture and a clean numeric-free code classifier.

## What it does

A decision rule on the deepest tissue layer involved:

| Class | Finding |
| --- | --- |
| I | fracture through **enamel** only (rough edge, non-tender, no color change) |
| II | **enamel + dentin** (yellow dentin visible; sensitive to hot/cold/air) |
| III | **enamel + dentin + pulp** exposed (pink/red or bleeding center; very sensitive) — **dental emergency** |

Returns the class code and management urgency.

## Posture (spec-v97)

Classifies the injury to guide urgency, not the definitive dental treatment. Only the three-class
emergency form is used; the extended Ellis IV–IX scheme is inconsistently defined and excluded
(spec-v97 disagreement rule). It supports rather than replaces dental evaluation.

## Files

- `lib/ellis-tooth-fracture-v718.js` — `ellisToothFracture()`, `ELLIS_NOTE`.
- `views/group-v718.js` (RV718) — one select (deepest layer); a11y-checked, no innerHTML.
- `mcp/adapters/ellis-tooth-fracture-v718.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, classes + use, related (pederson-difficulty).
- `test/unit/ellis-tooth-fracture.test.js` — 4 tests (Class I/II/III, required+validated layer).
- `docs/spec-v718.md` (this file).

## Sourcing (spec-v97)

Ellis RG, Davey KW. *The Classification and Treatment of Injuries to the Teeth of Children.* 5th
ed. 1970. The three-class definitions (enamel / enamel+dentin / enamel+dentin+pulp) were confirmed
against a Maimonides EM residency reference and the *Atlas of Emergency Medicine* 5e, which agree;
the extended Ellis IV–IX scheme is excluded because it is inconsistently defined across sources.
