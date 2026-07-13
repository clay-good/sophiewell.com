# spec-v295.md — Reisberg Global Deterioration Scale tile (fulfills spec-v173 §2.6)

> Status: **SHIPPED (2026-07-13).** Builds the `global-deterioration-scale` tile that
> [spec-v173](spec-v173.md) §2.6 proposed and deferred pending verbatim sourcing. The companion
> to the FAST tile shipped as [spec-v294](spec-v294.md). Catalog **1146 → 1147**, group G.

## Why

GDS is the global cognitive/functional staging half of Reisberg's dementia framework; FAST
(spec-v294) is the finer functional-substaging half. With FAST now live and cross-linking to a
`global-deterioration-scale` id that did not yet exist, GDS is the natural next tile — and, like
FAST, its sourcing deferral is now resolved.

## What shipped

`global-deterioration-scale` (group G): the clinician selects the single most appropriate global
stage (1–7); the tile reports the published stage label and clinical characteristics and flags
stage 5 and beyond, at which the source states the patient "can no longer survive without
assistance." It reports the guideline descriptor, not a diagnosis ([spec-v11](spec-v11.md) §5.3).

- `lib/gds-v295.js` — pure stage→(label, descriptor) lookup with the stage-5 assistance flag.
- `views/group-v295.js` (RV295) — a single stage `<select>`, real `<label for>`, no innerHTML.
- `lib/meta.js` — citation + accessed date + interpretation bands (per-stage summaries).
- FAST's `related` now links `global-deterioration-scale` (the link the v294 tile reserved).
- 6 worked-example unit tests + fuzz registration; synonym entry (v15 → v16); corpus → 1147.

## Sourcing (spec-v97)

Stage table re-fetched and cross-verified at build against two independent verbatim
reproductions of Reisberg's GDS: the geriatric-resources.com reproduction (reproduced with
permission) and the dementiaresearch.org.au clinician form. The two agree on every stage label
and descriptor.

- **Citation:** Reisberg B, Ferris SH, de Leon MJ, Crook T. The Global Deterioration Scale for
  assessment of primary degenerative dementia. *Am J Psychiatry.* 1982;139(9):1136-1139. Reisberg
  is not an ISSUER_PATTERN acronym, so no citation-staleness ledger row is required.
- **Care threshold:** stage 5 ("moderate dementia") is the source-stated inflection point at
  which the patient can no longer survive without assistance; the tile flags stage 5 and beyond.

## Verification

Lint (all catalog-truth surfaces at 1147), unit suite (+6 GDS + fuzz), `test:mcp`, build — all
green. Verified in a real browser: h1, stage 5 with the assistance flag, stage 2 without, no page
errors.

## Out of scope

The MCP adapter + golden-probe promotion follow in a separate wave (the golden probe requires the
tile in the MCP-exposed registry, per the spec-v292/v294 precedent). The remaining two spec-v173
§2.6 deferrals (GPCOG, Short IQCODE) stay deferred pending their own verbatim sourcing.
