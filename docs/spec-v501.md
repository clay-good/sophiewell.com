# spec-v501.md — Ludwig scale (female-pattern hair loss) tile

> Status: **SHIPPED (2026-07-23).** Builds the `ludwig-hairloss` tile — the Ludwig scale of female-pattern hair
> loss, grades I / II / III. Catalog **1351 → 1352**, group G.

## Why

The catalog grades alopecia areata (`salt-score`) but has nothing for *pattern* (androgenetic) hair loss —
`ludwig`, `norwood`, and `female pattern hair loss` were all zero-hit. The Ludwig scale is the standard
descriptor for the female pattern (central crown thinning with a preserved frontal hairline).

## What it does

The clinician picks the grade; the tile reports the grade and its crown-thinning description.

- `lib/ludwig-hairloss-v501.js` — pure grade → description, the three Ludwig grades. **I:** perceptible crown
  thinning behind a retained frontal fringe. **II:** pronounced thinning within that area. **III:** full
  baldness within that area. The frontal hairline is preserved throughout, and the note says so. Accepts I-III
  and 1-3.
- `views/group-v501.js` (RV501) — one select (dom `ludwig-grade`), real `<label for>`.
- `lib/meta.js` — Ludwig 1977 (Br J Dermatol) citation + accessed date + grouped bands. No citation-staleness
  row (a named-author article, no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v221 → v222); corpus → 1352.

**HIGH-STAKES:** it reports the pattern grade the clinician has determined on examination, never a diagnosis of
androgenetic alopecia, an exclusion of other causes of hair loss (thyroid disease, iron deficiency, telogen
effluvium), or a treatment decision ([spec-v11](spec-v11.md) §5.3). The workup and management decision stay
with the treating clinician.

## Sourcing (spec-v97)

- **Citation:** Ludwig E. Classification of the types of androgenetic alopecia (common baldness) occurring in
  the female sex. *Br J Dermatol.* 1977;97(3):247-254. The citation URL is a PubMed term search.
- Cross-verified against dermatology references reproducing the same perceptible (I) / pronounced (II) /
  bald-crown (III) central thinning with a retained frontal fringe.

## Verification

Lint (all catalog-truth surfaces at 1352), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade II renders "pronounced thinning of the hair on the crown," I and III flip to their descriptions;
the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not examine the scalp, work up a cause, or choose a
therapy. The male-pattern Norwood-Hamilton scale is a separate build (and its "Hamilton" name would collide
with the Hamilton anxiety/depression tiles in search, so it needs concept-specific synonyms). The MCP adapter +
golden-probe promotion follow in the next wave (326).
