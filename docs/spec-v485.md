# spec-v485.md — Dejour classification (trochlear dysplasia) tile

> Status: **SHIPPED (2026-07-19).** Builds the `dejour-trochlea` tile — the Dejour classification of trochlear
> dysplasia, types A/B/C/D. Catalog **1335 → 1336**, group G.

## Why

The knee tiles (Ahlback, Kellgren-Lawrence knee OA) had no trochlear-dysplasia classification — a key factor in
patellofemoral instability. `dejour` / `trochlear dysplasia type` routed to nothing. This fills that
patellofemoral gap.

## What it does

The clinician picks the type; the tile reports the type and its trochlear-morphology description.

- `lib/dejour-trochlea-v485.js` — pure type → description, the four Dejour types. **A:** shallow but symmetric
  (low-grade). **B:** flat or convex with a supratrochlear spur (high-grade). **C:** facet asymmetry (double
  contour) without a spur (high-grade). **D:** asymmetry plus a spur with a facet "cliff" (high-grade). Accepts
  A-D and 1-4.
- `views/group-v485.js` (RV485) — one select (dom `dejour-type`), real `<label for>`.
- `lib/meta.js` — Dejour 2007 (Sports Med Arthrosc Rev) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author journal article, no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v205 → v206); corpus → 1336.

**HIGH-STAKES:** it reports the imaging type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Dejour D, Le Coultre B. Osteotomies in patello-femoral instabilities. *Sports Med Arthrosc
  Rev.* 2007;15(1):39-46. The citation URL is a PubMed term search.
- Cross-verified against knee references reproducing the same shallow-symmetric (A) / flat-or-convex-with-spur
  (B) / facet-asymmetry-no-spur (C) / asymmetry-plus-spur (D) grouping; type A is low-grade, B/C/D are
  high-grade.

## Verification

Lint (all catalog-truth surfaces at 1336), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type B renders "a flat or convex trochlea with a supratrochlear spur," the other types flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the imaging or recommend management
(trochleoplasty vs other). The MCP adapter + golden-probe promotion follow in the next wave (310).
