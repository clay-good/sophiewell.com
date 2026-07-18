# spec-v412.md — Myerson classification (Lisfranc injury) tile

> Status: **SHIPPED (2026-07-17).** Builds the `lisfranc-myerson` tile — the Myerson classification
> (a modification of the Hardcastle / Quenu-Kuss classification) of a Lisfranc (tarsometatarsal) injury,
> types A/B1/B2/C1/C2. Catalog **1263 → 1264**, group G.

## Why

The catalog has a foot-injury cluster (Lauge-Hansen ankle, Sanders calcaneal, Hawkins talar, Meyers-McKeever
tibial eminence) but no Lisfranc classification. `lisfranc` / `myerson` / `tarsometatarsal injury` routed to
nothing. This fills the tarsometatarsal gap in that cluster.

## What it does

The clinician picks the type; the tile reports the type and its incongruity/displacement description.

- `lib/lisfranc-myerson-v412.js` — pure type → description. **A:** total incongruity, all five metatarsals
  displaced the same direction (homolateral). **B1:** partial, medial displacement of the first metatarsal.
  **B2:** partial, lateral displacement of one or more of the lateral four metatarsals. **C1:** divergent,
  partial. **C2:** divergent, total (all five metatarsals). Accepts A/B1/B2/C1/C2, and bare B/C (→ B1/C1).
- `views/group-v412.js` (RV412) — one select (dom `lf-type`), real `<label for>`.
- `lib/meta.js` — Myerson 1986 (Foot Ankle) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v133 → v134); corpus → 1264.

**HIGH-STAKES:** it reports the injury type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The operative-vs-nonoperative decision stays with
the foot-and-ankle team.

## Sourcing (spec-v97)

- **Citation:** Myerson MS, Fisher RT, Burgess AR, Kenzora JE. Fracture dislocations of the tarsometatarsal
  joints: end results correlated with pathology and treatment. *Foot Ankle.* 1986;6(5):225-242.
- Cross-verified against StatPearls (Lisfranc dislocation) and orthopedic/radiology references reproducing
  the same total (A) / partial-medial (B1) / partial-lateral (B2) / divergent-partial (C1) / divergent-total
  (C2) grouping.

## Verification

Lint (all catalog-truth surfaces at 1264), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type B2 renders "partial incongruity, lateral," A / B1 / C1 / C2 flip to their descriptions; the
tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the imaging, measure the diastasis, or
recommend fixation vs fusion. The MCP adapter + golden-probe promotion follow in a separate wave.
