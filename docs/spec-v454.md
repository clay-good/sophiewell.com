# spec-v454.md — Bado classification (Monteggia fracture) tile

> Status: **SHIPPED (2026-07-19).** Builds the `bado` tile — the Bado classification of Monteggia fractures,
> types I/II/III/IV. Catalog **1304 → 1305**, group G.

## Why

The catalog's elbow / forearm fracture-classification tiles (Mason-Johnston radial head, Regan-Morrey
coronoid, Milch lateral condyle) had no Bado grade — the standard grading of the Monteggia lesion (a
radial-head dislocation with an ulnar fracture). `bado` / `monteggia` routed to nothing. This fills that
forearm-fracture gap.

## What it does

The clinician picks the type; the tile reports the type and its dislocation / fracture description.

- `lib/bado-v454.js` — pure type → description, the four Bado types by radial-head dislocation direction and
  ulnar fracture. **I:** anterior dislocation, anterior ulnar angulation (most common). **II:** posterior
  dislocation, posterior ulnar angulation. **III:** lateral dislocation with an ulnar metaphyseal fracture.
  **IV:** anterior dislocation with both-bone proximal-third fractures. Accepts I-IV and 1-4.
- `views/group-v454.js` (RV454) — one select (dom `bado-type`), real `<label for>`.
- `lib/meta.js` — Bado 1967 (Clin Orthop Relat Res) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v174 → v175); corpus → 1305.

**HIGH-STAKES:** it reports the fracture type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Bado JL. The Monteggia lesion. *Clin Orthop Relat Res.* 1967;50:71-86.
- Cross-verified against orthopedic / radiology references reproducing the same anterior-dislocation (I) /
  posterior-dislocation (II) / lateral-dislocation-with-metaphyseal-fracture (III) / both-bone (IV) grouping.
  "Monteggia-equivalent" injury patterns exist but are described narratively; this tile grades the four base
  Bado types.

## Verification

Lint (all catalog-truth surfaces at 1305), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type I renders "anterior dislocation of the radial head," the other types flip to their descriptions;
the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the radiograph, grade Monteggia-equivalent
patterns, or recommend management. The MCP adapter + golden-probe promotion follow in the next wave (279).
