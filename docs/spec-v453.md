# spec-v453.md — Schatzker classification (tibial plateau fracture) tile

> Status: **SHIPPED (2026-07-19).** Builds the `schatzker` tile — the Schatzker classification of tibial
> plateau fractures, types I/II/III/IV/V/VI. Catalog **1304 → 1305**, group G.

## Why

The catalog's lower-limb fracture-classification tiles (Lauge-Hansen ankle, Sanders calcaneal, Lisfranc /
Myerson, Pauwels / Garden-adjacent femoral neck) had no Schatzker grade — the standard grading of tibial
plateau fractures. `schatzker` / `tibial plateau fracture` routed to nothing. This fills that orthopedic gap.

## What it does

The clinician picks the type; the tile reports the type and its fracture-pattern description.

- `lib/schatzker-v453.js` — pure type → description, the six Schatzker types by pattern and location. **I:**
  lateral split. **II:** lateral split-depression. **III:** lateral pure depression. **IV:** medial plateau.
  **V:** bicondylar. **VI:** plateau fracture with metaphyseal-diaphyseal dissociation. Accepts I-VI and 1-6.
- `views/group-v453.js` (RV453) — one select (dom `schatzker-type`), real `<label for>`.
- `lib/meta.js` — Schatzker 1979 (Clin Orthop Relat Res) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 8 worked-example unit tests + fuzz registration; synonym entry (v174 → v175); corpus → 1305.

**HIGH-STAKES:** it reports the fracture type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Schatzker J, McBroom R, Bruce D. The tibial plateau fracture. The Toronto experience
  1968-1975. *Clin Orthop Relat Res.* 1979;(138):94-104.
- Cross-verified against orthopedic / radiology references reproducing the same lateral-split (I) /
  lateral-split-depression (II) / lateral-pure-depression (III) / medial (IV) / bicondylar (V) /
  plateau-with-metaphyseal-diaphyseal-dissociation (VI) grouping.

## Verification

Lint (all catalog-truth surfaces at 1305), unit suite (+8 + fuzz), build — all green. Verified in a real
browser: type II renders "lateral tibial plateau split-depression," the other types flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the radiograph or recommend management
(fixation, non-operative care). The MCP adapter + golden-probe promotion follow in the next wave (278).
