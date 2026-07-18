# spec-v410.md — Anderson-D'Alonzo classification (odontoid fracture) tile

> Status: **SHIPPED (2026-07-17).** Builds the `anderson-dalonzo` tile — the Anderson-D'Alonzo classification
> of odontoid (dens) fractures (types I/II/III). Catalog **1261 → 1262**, group G.

## Why

The cervical-spine trauma tiles had no tile for the odontoid (dens) fracture — one of the most common and
most-classified C-spine injuries. The Anderson-D'Alonzo classification, by the level of the fracture line,
is the standard. `anderson d'alonzo` / `odontoid fracture` / `dens fracture` routed to nothing.

## What it does

The clinician picks the type; the tile reports the type and its level description.

- `lib/anderson-dalonzo-v410.js` — pure type → description. **I:** through the tip, above the transverse
  ligament (rare, usually stable). **II:** through the base / neck of the dens (most common, highest
  non-union risk). **III:** extending into the C2 body (usually heals with immobilization). Accepts I/II/III,
  1-3, and the IIA unstable-subtype → II.
- `views/group-v410.js` (RV410) — one select (dom `ad-type`), real `<label for>`.
- `lib/meta.js` — Anderson-D'Alonzo 1974 (J Bone Joint Surg Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v131 → v132); corpus → 1262.

**HIGH-STAKES:** it reports the fracture type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Type II is classically the most prone to non-union,
but the management decision stays with the spine team.

## Sourcing (spec-v97)

- **Citation:** Anderson LD, D'Alonzo RT. Fractures of the odontoid process of the axis. *J Bone Joint Surg
  Am.* 1974;56(8):1663-1674.
- Cross-verified against spine / radiology references reproducing the same tip (I) / base-of-dens (II) /
  extension-into-C2-body (III) grouping.

## Verification

Lint (all catalog-truth surfaces at 1262), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type II renders "base (neck) of the odontoid ... most prone to non-union," I and III flip to the
tip / C2-body descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the imaging, apply the Grauer type-II
sub-classification, or recommend halo vs surgical fixation. The MCP adapter + golden-probe promotion follow
in a separate wave.
