# spec-v499.md — Dorr classification (proximal femoral morphology) tile

> Status: **SHIPPED (2026-07-23).** Builds the `dorr-femur` tile — the Dorr classification of proximal femoral
> bone morphology, types A / B / C. Catalog **1349 → 1350**, group G.

## Why

The arthroplasty cluster covers the cement mantle (`barrack-cement`), periprosthetic fracture
(`vancouver-periprosthetic`), and heterotopic ossification (`brooker`) — all *post*-operative. The
pre-operative femoral morphology axis, the one a surgeon reads off the template radiograph, was uncovered:
`dorr`, `canal calcar`, `stovepipe`, and `champagne flute` were all zero-hit.

## What it does

The clinician picks the type; the tile reports the type and its cortical / canal description.

- `lib/dorr-femur-v499.js` — pure type → description, the three Dorr types. **A:** the champagne-flute femur,
  thick medial and posterior cortices and a narrow canal, canal-to-calcar ratio below 0.5. **B:** intermediate,
  ratio 0.5 to 0.75. **C:** the stovepipe femur, extensive cortical loss and a wide canal, ratio above 0.75.
  Accepts A-C and 1-3.
- `views/group-v499.js` (RV499) — one select (dom `dorr-type`), real `<label for>`.
- `lib/meta.js` — Dorr and colleagues 1993 (Bone) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v219 → v220); corpus → 1350.

**HIGH-STAKES:** it reports the morphologic type the clinician has determined from the radiograph, never a
diagnosis, a bone-quality or osteoporosis diagnosis, and never a recommendation for a cemented or cementless
stem ([spec-v11](spec-v11.md) §5.3). The implant decision stays with the arthroplasty surgeon.

## Sourcing (spec-v97)

- **Citation:** Dorr LD, Faugere MC, Mackel AM, Gruen TA, Bognar B, Malluche HH. Structural and cellular
  assessment of bone quality of proximal femur. *Bone.* 1993;14(3):231-242. The citation URL is a PubMed term
  search.
- Cross-verified against arthroplasty references reproducing the same champagne-flute (A) / intermediate (B) /
  stovepipe (C) grouping with the same canal-to-calcar ratio cut points.

## Verification

Lint (all catalog-truth surfaces at 1350), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type B renders the 0.5-to-0.75 ratio band, A and C flip to champagne-flute and stovepipe; the tile
does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not measure the canal-to-calcar ratio off an image,
template the stem, or choose a fixation method. The MCP adapter + golden-probe promotion follow in the next
wave (324).
