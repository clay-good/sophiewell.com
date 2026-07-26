# spec-v502.md — Norwood scale (male-pattern hair loss) tile

> Status: **SHIPPED (2026-07-23).** Builds the `norwood-hairloss` tile — the Norwood (Hamilton-Norwood) scale
> of male-pattern hair loss, stages I-VII plus III vertex. Catalog **1352 → 1353**, group G.

## Why

Completes the pattern-hair-loss pair. The previous tile (`ludwig-hairloss`, spec-v501) covers the female
pattern; this covers the male pattern. `norwood` was zero-hit. Together with `salt-score` (alopecia areata),
the catalog now describes the three common hair-loss patterns a clinician grades on sight.

## What it does

The clinician picks the stage; the tile reports the stage and its recession / vertex description.

- `lib/norwood-hairloss-v502.js` — pure stage → description, the seven canonical stages plus the distinct
  **III vertex**. Increasing frontotemporal recession and vertex loss, I (no recession) to VII (a horseshoe
  band only). Accepts I-VII and 1-7, and `III vertex` / `3 vertex` / `3v` / `IIIv` for the crown-predominant
  stage.
- `views/group-v502.js` (RV502) — one select (dom `norwood-stage`), real `<label for>`.
- `lib/meta.js` — Norwood 1975 (South Med J) citation + accessed date + grouped bands. No citation-staleness
  row (a named-author article, no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v222 → v223); corpus → 1353.

**SYNONYM NOTE:** the scale is also called Hamilton-Norwood, but "Hamilton" collides in search with the
Hamilton anxiety / depression tiles (`hama`, `hamd`). The synonyms use `norwood` and pattern-specific phrases,
never the bare word `hamilton`.

**HIGH-STAKES:** it reports the pattern stage the clinician has determined on examination, never a diagnosis of
androgenetic alopecia, an exclusion of other causes of hair loss, or a treatment decision
([spec-v11](spec-v11.md) §5.3). The workup and management decision stay with the treating clinician.

## Sourcing (spec-v97)

- **Citation:** Norwood OT. Male pattern baldness: classification and incidence. *South Med J.*
  1975;68(11):1359-1365. The citation URL is a PubMed term search.
- Cross-verified against dermatology references reproducing the same no-recession (I) through
  horseshoe-band (VII) staging, with III vertex as the crown-predominant variant.

## Verification

Lint (all catalog-truth surfaces at 1353), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: stage IV renders the banded recession/vertex description, I and VII flip to the endpoints, and the
III vertex option resolves; the tile does not scroll horizontally at 320px.

## Out of scope

The separate Type A variant series (IIa, IIIa, IVa, Va) — anterior-to-posterior progression without a distinct
vertex bald spot — is not modeled; the tile notes it in the lib comment. The tile does not examine the scalp,
work up a cause, or choose a therapy. The MCP adapter + golden-probe promotion follow in the next wave (327).
