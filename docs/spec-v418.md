# spec-v418.md — Milch classification (lateral condyle fracture) tile

> Status: **SHIPPED (2026-07-18).** Builds the `milch-condyle` tile — the Milch classification of lateral
> humeral condyle fractures, types I and II. Catalog **1269 → 1270**, group G.

## Why

The catalog's elbow cluster (Mason radial head, Regan-Morrey coronoid) had no lateral-condyle classification,
a common pediatric elbow injury. `milch` / `lateral condyle fracture` routed to nothing. This fills that gap.

## What it does

The clinician picks the type; the tile reports the type and its groove/stability description.

- `lib/milch-condyle-v418.js` — pure type → description. **I:** the fracture line runs lateral to the
  trochlear groove and does not reach it; the lateral trochlear ridge is intact, so the elbow stays stable.
  **II:** the fracture line extends medially into the trochlear groove; the lateral trochlear ridge is
  involved, so the elbow becomes unstable and the forearm can translate laterally. Accepts I/II and 1/2.
- `views/group-v418.js` (RV418) — one select (dom `mi-type`), real `<label for>`.
- `lib/meta.js` — Milch 1964 (J Trauma) citation + accessed date + grouped bands. No citation-staleness row
  (the citation carries no guideline-issuer acronym).
- 4 worked-example unit tests + fuzz registration; synonym entry (v139 → v140); corpus → 1270.

**HIGH-STAKES:** it reports the fracture type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The stability is intrinsic to the pattern (a
classically taught association); the reduction / fixation decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Milch H. Fractures and fracture dislocations of the humeral condyles. *J Trauma.*
  1964;4:592-607.
- Cross-verified against pediatric-orthopedic / radiology references reproducing the same
  lateral-to-the-groove (I, stable) vs into-the-groove (II, unstable) grouping by involvement of the lateral
  trochlear ridge.

## Verification

Lint (all catalog-truth surfaces at 1270), unit suite (+4 + fuzz), build — all green. Verified in a real
browser: type I renders "lateral to the trochlear groove ... the elbow stays stable," type II flips to the
unstable description; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the imaging, measure displacement, or
recommend cast vs pinning. The MCP adapter + golden-probe promotion follow in a separate wave.
