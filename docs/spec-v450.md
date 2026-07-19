# spec-v450.md — Reid classification (bronchiectasis) tile

> Status: **SHIPPED (2026-07-19).** Builds the `reid-bronchiectasis` tile — the Reid classification of
> bronchiectasis, cylindrical/varicose/cystic. Catalog **1301 → 1302**, group G.

## Why

The catalog had no morphologic classification of bronchiectasis — the standard Reid cylindrical/varicose/cystic
description on chest imaging. `reid bronchiectasis` / `bronchiectasis type` routed to nothing. This fills that
pulmonology / radiology gap.

## What it does

The radiologist picks the type; the tile reports the type and its morphology description.

- `lib/reid-bronchiectasis-v450.js` — pure type → description, the three Reid types. **Cylindrical (tubular):**
  uniformly dilated, regular outline (least severe). **Varicose:** irregular, beaded outline. **Cystic
  (saccular):** large cyst-like dilatations (most severe). Accepts the type names (tubular/saccular aliases)
  and 1-3.
- `views/group-v450.js` (RV450) — one select (dom `reid-type`), real `<label for>`.
- `lib/meta.js` — Reid 1950 (Thorax) citation + accessed date + grouped bands. No citation-staleness row (the
  citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v171 → v172); corpus → 1302.

**HIGH-STAKES:** it reports the imaging morphology the radiologist has determined, never a diagnosis, a
severity determination, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management
decision stays with the pulmonology team.

## Sourcing (spec-v97)

- **Citation:** Reid LM. Reduction in bronchial subdivision in bronchiectasis. *Thorax.* 1950;5(3):233-247.
- Cross-verified against pulmonology / radiology references reproducing the same cylindrical (tubular) /
  varicose (beaded) / cystic (saccular) morphologic grouping.

## Verification

Lint (all catalog-truth surfaces at 1302), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: varicose renders "irregular, beaded outline," the other types flip to their morphologies; the tile
does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the radiologist selects; it does not read the CT, grade severity (e.g., a
bronchiectasis severity index), or recommend management. The MCP adapter + golden-probe promotion follow in a
separate wave.
