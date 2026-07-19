# spec-v482.md — Russell-Taylor classification (subtrochanteric fracture) tile

> Status: **SHIPPED (2026-07-19).** Builds the `russell-taylor-subtroch` tile — the Russell-Taylor
> classification of subtrochanteric femur fractures, types IA/IB/IIA/IIB. Catalog **1332 → 1333**, group G.

## Why

The proximal-femur cluster carried Seinsheimer (fracture pattern) but not Russell-Taylor — the classification
devised to guide intramedullary nail selection by piriformis-fossa and lesser-trochanter involvement.
`russell-taylor` / `subtrochanteric fracture piriformis` routed to nothing. This companions the Seinsheimer
tile (a complementary axis).

## What it does

The clinician picks the type; the tile reports the type and its piriformis-fossa / lesser-trochanter
description.

- `lib/russell-taylor-subtroch-v482.js` — pure type → description, the four Russell-Taylor types. Type I:
  piriformis fossa intact; type II: fracture into the piriformis fossa. A: lesser trochanter attached; B:
  detached. **IA / IB / IIA / IIB.** Accepts IA/IB/IIA/IIB and 1A/1B/2A/2B.
- `views/group-v482.js` (RV482) — one select (dom `rt-type`), real `<label for>`.
- `lib/meta.js` — Russell & Taylor (Skeletal Trauma) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author book chapter, no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v202 → v203); corpus → 1333.

**HIGH-STAKES:** it reports the fracture type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the
orthopedic-trauma team.

## Sourcing (spec-v97)

- **Citation:** Russell TA, Taylor JC. Subtrochanteric fractures of the femur. In: Browner BD, ed. *Skeletal
  Trauma.* Philadelphia: WB Saunders; 1992. The citation URL is a PubMed term search.
- Cross-verified against orthopedic-trauma references reproducing the same piriformis-fossa (I intact / II
  involved) and lesser-trochanter (A attached / B detached) axes.

## Verification

Lint (all catalog-truth surfaces at 1333), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type IA renders "the piriformis fossa is intact and the lesser trochanter is attached," the other
types flip to their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the radiograph or choose the implant. The MCP
adapter + golden-probe promotion follow in the next wave (307).
