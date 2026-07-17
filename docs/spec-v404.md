# spec-v404.md — Regan-Morrey classification (coronoid process fracture) tile

> Status: **SHIPPED (2026-07-17).** Builds the `regan-morrey` tile — the Regan-Morrey classification of
> coronoid process fractures (types I/II/III). Catalog **1255 → 1256**, group G.

## Why

The elbow-fracture tiles (the Mason radial-head classification) had no companion for the coronoid process
fracture — the other bony component of the "terrible triad" elbow injury. The Regan-Morrey classification,
by the height of the coronoid fragment, is the standard. `regan morrey` / `coronoid fracture` routed to
nothing. Companion to `mason-radial-head`.

## What it does

The clinician picks the type; the tile reports the type and its height description.

- `lib/regan-morrey-v404.js` — pure type → description. **I:** avulsion of the coronoid tip. **II:** 50% or
  less of the coronoid height. **III:** more than 50% of the coronoid height. Accepts I/II/III, 1-3, and the
  A/B subtypes → the base type.
- `views/group-v404.js` (RV404) — one select (dom `rm-type`), real `<label for>`.
- `lib/meta.js` — Regan-Morrey 1989 (J Bone Joint Surg Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v125 → v126); corpus → 1256.

**HIGH-STAKES:** it reports the fracture type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Larger fragments (type III) are classically less
stable, but the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Regan W, Morrey B. Fractures of the coronoid process of the ulna. *J Bone Joint Surg Am.*
  1989;71(9):1348-1354.
- Cross-verified against orthopedic references reproducing the same tip (I) / ≤50% (II) / >50% (III)
  grouping, each subdivided A (no elbow dislocation) / B (with dislocation).

## Verification

Lint (all catalog-truth surfaces at 1256), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type II renders "50% or less of the coronoid height," I and III flip to the tip avulsion / >50%
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the imaging, resolve the A/B dislocation
subtype, or recommend fixation. The MCP adapter + golden-probe promotion follow in a separate wave.
