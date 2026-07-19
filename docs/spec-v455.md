# spec-v455.md — Nunley-Vertullo classification (midfoot sprain) tile

> Status: **SHIPPED (2026-07-19).** Builds the `nunley-vertullo` tile — the Nunley-Vertullo classification of
> athletic midfoot (Lisfranc) sprains, stages I/II/III. Catalog **1305 → 1306**, group G.

## Why

The catalog carried the Lisfranc / Myerson fracture classification but had no Nunley-Vertullo grade — the
standard staging of the *athletic* midfoot (Lisfranc) sprain, which grades by weightbearing-radiograph
diastasis rather than fracture pattern. `nunley` / `midfoot sprain` routed to nothing. This companions the
Lisfranc fracture tile (companion-gap).

## What it does

The clinician picks the stage; the tile reports the stage and its weightbearing-radiograph description.

- `lib/nunley-vertullo-v455.js` — pure stage → description, the three Nunley-Vertullo stages by diastasis and
  arch height. **I:** no diastasis or arch-height loss. **II:** 1 to 5 mm diastasis, no arch-height loss.
  **III:** more than 5 mm diastasis with arch-height loss. Accepts I-III and 1-3.
- `views/group-v455.js` (RV455) — one select (dom `nunley-stage`), real `<label for>`.
- `lib/meta.js` — Nunley & Vertullo 2002 (Am J Sports Med) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v175 → v176); corpus → 1306.

**HIGH-STAKES:** it reports the stage the clinician has determined from the imaging, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the
orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Nunley JA, Vertullo CJ. Classification, investigation, and management of midfoot sprains:
  Lisfranc injuries in the athlete. *Am J Sports Med.* 2002;30(6):871-878.
- Cross-verified against sports-medicine / orthopedic references reproducing the same no-diastasis (I) /
  1-5 mm-diastasis (II) / >5 mm-diastasis-with-arch-loss (III) grouping. This stages the athletic ligamentous
  sprain; the Lisfranc *fracture-dislocation* is graded separately (Myerson/Hardcastle, the existing
  `lisfranc-myerson` tile).

## Verification

Lint (all catalog-truth surfaces at 1306), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: stage II renders "1 to 5 mm of diastasis," the other stages flip to their descriptions; the tile does
not scroll horizontally at 320px.

## Out of scope

The tile echoes the stage the clinician selects; it does not measure diastasis, read the radiograph, or
recommend management. The MCP adapter + golden-probe promotion follow in the next wave (280).
