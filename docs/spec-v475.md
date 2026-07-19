# spec-v475.md — Glogau classification (photoaging) tile

> Status: **SHIPPED (2026-07-19).** Builds the `glogau-photoaging` tile — the Glogau classification of
> photoaging, types I-IV. Catalog **1325 → 1326**, group G.

## Why

The dermatology tiles (Fitzpatrick skin phototype, PASI, SCORAD, DLQI) had no photoaging classification.
`glogau` / `photoaging type` routed to nothing. This fills that cosmetic-dermatology gap, companioning the
Fitzpatrick skin-phototype tile.

## What it does

The clinician picks the type; the tile reports the type and its photoaging-severity description.

- `lib/glogau-photoaging-v475.js` — pure type → description, the four Glogau types. **I:** "no wrinkles" (early
  photoaging, minimal wrinkles). **II:** "wrinkles in motion" (early keratoses, dynamic wrinkles). **III:**
  "wrinkles at rest" (dyschromia, telangiectasias, static wrinkles). **IV:** "only wrinkles" (yellow-gray skin,
  prior malignancies, wrinkles throughout). Accepts I-IV and 1-4.
- `views/group-v475.js` (RV475) — one select (dom `glogau-type`), real `<label for>`.
- `lib/meta.js` — Glogau 1996 (Semin Cutan Med Surg) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v195 → v196); corpus → 1326.

**HIGH-STAKES:** it reports the photoaging type the clinician has determined on examination, never a diagnosis,
a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the
dermatology team.

## Sourcing (spec-v97)

- **Citation:** Glogau RG. Aesthetic and anatomic analysis of the aging skin. *Semin Cutan Med Surg.*
  1996;15(3):134-138. The citation URL is a PubMed term search.
- Cross-verified against dermatology references reproducing the same no-wrinkles (I) / wrinkles-in-motion (II)
  / wrinkles-at-rest (III) / only-wrinkles (IV) grouping.

## Verification

Lint (all catalog-truth surfaces at 1326), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type II renders "wrinkles in motion ... dynamic," the other types flip to their descriptions; the tile
does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not examine the skin or recommend management (peels,
lasers, retinoids). The MCP adapter + golden-probe promotion follow in the next wave (300).
