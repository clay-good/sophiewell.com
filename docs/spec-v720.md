# spec-v720.md — Angle classification of malocclusion

> Status: **SHIPPED (2026-08-13).** Builds the `angle-malocclusion` tile. Catalog **1550 → 1551**, group G.

## Why

Sixth (final) tile in the dentistry vein (orthodontics). The Angle classification is the
foundational description of the anteroposterior molar relationship in orthodontics — a clean
decision-logic code classifier.

## What it does

By the relationship of the mesiobuccal (MB) cusp of the maxillary first molar to the buccal
groove of the mandibular first molar:

| Class | Relationship |
| --- | --- |
| I (neutroclusion) | MB cusp occludes **in** the buccal groove |
| II (distoclusion) | MB cusp **mesial to** (in front of) the groove — **Div 1** proclined / **Div 2** retroclined maxillary incisors |
| III (mesioclusion) | MB cusp **distal to** (behind) the groove |

Returns the Angle class (and division for Class II).

## Posture (spec-v97)

Describes the occlusal relationship to guide orthodontic assessment; it does not prescribe
treatment. The molar-cusp geometry is definitive (II = distoclusion, III = mesioclusion — some
summaries swap these). It supports rather than replaces the orthodontic evaluation.

## Files

- `lib/angle-malocclusion-v720.js` — `angleMalocclusion()`, `ANGLE_NOTE`.
- `views/group-v720.js` (RV720) — a molar-relationship select + (Class II) an incisor-pattern
  select; a11y-checked.
- `mcp/adapters/angle-malocclusion-v720.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, reference + classes, related (kennedy-edentulous).
- `test/unit/angle-malocclusion.test.js` — 5 tests (Class I, II Div 1, II Div 2, III, required
  molar relationship + Class-II-requires-division).
- `docs/spec-v720.md` (this file).

## Sourcing (spec-v97)

Angle EH. Classification of malocclusion. *Dental Cosmos.* 1899;41:248-264,350-357. The
molar-cusp definitions, the Class II Division 1/2 incisor subdivision, and the
neutroclusion/distoclusion/mesioclusion terminology were confirmed against StatPearls
(Orthodontics, Malocclusion) and Pocket Dentistry, which agree; the molar geometry is used as
definitive (II = distoclusion, III = mesioclusion) where some web summaries swap the terms.
