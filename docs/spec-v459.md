# spec-v459.md — Thompson-Epstein classification (posterior hip dislocation) tile

> Status: **SHIPPED (2026-07-19).** Builds the `thompson-epstein` tile — the Thompson-Epstein classification of
> posterior hip dislocations, types I/II/III/IV/V. Catalog **1309 → 1310**, group G.

## Why

The catalog carried the femoral-head fracture classification (Pipkin) but had no Thompson-Epstein grade — the
standard classification of the *posterior hip dislocation* by its associated fracture. `thompson-epstein` /
`posterior hip dislocation` routed to nothing. This companions the Pipkin tile (a Thompson-Epstein type V is a
femoral-head fracture, which Pipkin then sub-classifies).

## What it does

The clinician picks the type; the tile reports the type and its associated-fracture description.

- `lib/thompson-epstein-v459.js` — pure type → description, the five Thompson-Epstein types by associated
  fracture. **I:** no or minor rim fracture. **II:** a single large posterior rim fracture. **III:** a
  comminuted rim fracture. **IV:** an acetabular rim and floor fracture. **V:** a femoral-head fracture.
  Accepts I-V and 1-5.
- `views/group-v459.js` (RV459) — one select (dom `te-type`), real `<label for>`.
- `lib/meta.js` — Thompson & Epstein 1951 (J Bone Joint Surg Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v179 → v180); corpus → 1310.

**HIGH-STAKES:** it reports the injury type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Thompson VP, Epstein HC. Traumatic dislocation of the hip: a survey of two hundred and four
  cases covering a period of twenty-one years. *J Bone Joint Surg Am.* 1951;33-A(3):746-778.
- Cross-verified against orthopedic / radiology references reproducing the same no/minor-fracture (I) /
  single-large-rim (II) / comminuted-rim (III) / acetabular-floor (IV) / femoral-head (V) grouping. The
  citation URL is a PubMed term search for the classic 1951 paper.

## Verification

Lint (all catalog-truth surfaces at 1310), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: type II renders "a single large fracture of the posterior acetabular rim," the other types flip to
their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the radiograph or recommend management
(reduction, fixation). The MCP adapter + golden-probe promotion follow in the next wave (284).
