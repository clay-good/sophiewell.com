# spec-v489.md — Fernandez classification (distal radius fracture) tile

> Status: **SHIPPED (2026-07-19).** Builds the `fernandez-radius` tile — the Fernandez classification of distal
> radius fractures (mechanism-based), types I-V. Catalog **1339 → 1340**, group G.

## Why

The wrist tiles carried Frykman (fracture-line pattern) but not the Fernandez mechanism-based classification, a
complementary axis that guides distal-radius fracture management. `fernandez` / `distal radius mechanism` routed
to nothing. This companions the Frykman tile.

## What it does

The clinician picks the type; the tile reports the type and its mechanism description.

- `lib/fernandez-radius-v489.js` — pure type → description, the five Fernandez types. **I:** bending
  (Colles/Smith). **II:** shearing (Barton, radial styloid). **III:** compression (die-punch). **IV:** avulsion
  / radiocarpal fracture-dislocation. **V:** combined, high-velocity. Accepts I-V and 1-5.
- `views/group-v489.js` (RV489) — one select (dom `fernandez-type`), real `<label for>`.
- `lib/meta.js` — Fernandez 1993 (Instr Course Lect) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v209 → v210); corpus → 1340.

**HIGH-STAKES:** it reports the fracture type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the
orthopedic-trauma team.

## Sourcing (spec-v97)

- **Citation:** Fernandez DL. Fractures of the distal radius: operative treatment. *Instr Course Lect.*
  1993;42:73-88. The citation URL is a PubMed term search.
- Cross-verified against orthopedic references reproducing the same bending (I) / shearing (II) / compression
  (III) / avulsion-dislocation (IV) / combined-high-velocity (V) mechanism grouping.

## Verification

Lint (all catalog-truth surfaces at 1340), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: type I renders "a bending fracture of the metaphysis," the other types flip to their descriptions; the
tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the radiograph or recommend management. The MCP
adapter + golden-probe promotion follow in the next wave (314).
