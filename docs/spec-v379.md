# spec-v379.md — Tile classification (pelvic ring injury) tile

> Status: **SHIPPED (2026-07-17).** Builds the `tile-pelvic` tile — the Tile (AO/Tile) classification of
> a pelvic ring injury (types A/B/C). Catalog **1230 → 1231**, group G.

## Why

The catalog carries many fracture eponyms and the trauma scores (ISS/RTS/TRISS) but not the Tile
classification — the standard grouping of a pelvic ring injury by the mechanical stability of the
posterior ring, which stratifies instability and, with it, mortality. `tile classification` / `pelvic
ring fracture stability` routed to nothing.

## What it does

The clinician picks the type; the tile reports the type, its stability description, and whether it is an
unstable (type B-C) injury.

- `lib/tile-pelvic-v379.js` — pure type → description. **A:** stable; the posterior ring is intact. **B:**
  rotationally unstable but vertically stable; incomplete posterior disruption (open-book /
  anteroposterior-compression, or lateral-compression) — flagged. **C:** rotationally AND vertically
  unstable; complete posterior disruption — flagged. Accepts A/B/C or 1-3, case-insensitive.
- `views/group-v379.js` (RV379) — one select (dom `tile-type`), real `<label for>`.
- `lib/meta.js` — Tile 1996 (JAAOS) citation + accessed date + grouped bands. No citation-staleness row
  (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v100 → v101); corpus → 1231.

**HIGH-STAKES:** it reports the Tile type the clinician has determined from the imaging, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The rising-instability
gradient (A → C) is the classically taught pattern, not an order; the management decision stays with the
orthopedic / trauma team (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Tile M. Acute pelvic fractures: I. Causation and classification. *J Am Acad Orthop Surg.*
  1996;4(3):143-151 (the A/B/C stability grouping; adopted by the AO/OTA comprehensive classification).
- Cross-verified against orthopedic/trauma references reproducing the same posterior-ring stability
  grouping (A stable, B rotationally unstable / vertically stable, C rotationally and vertically
  unstable) and the mortality gradient (~8.8% A / 13.8% B / 25% C).

## Verification

Lint (all catalog-truth surfaces at 1231), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type C renders the flagged "rotationally and vertically unstable" description, type A flips to
the stable "posterior ring intact" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read imaging, resolve the B/C sub-groups
(B1/B2/B3, C1/C2/C3), or recommend fixation. The MCP adapter + golden-probe promotion follow in a
separate wave. A companion Young-Burgess (mechanism-based) tile remains a candidate for a later wave.
