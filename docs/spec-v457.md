# spec-v457.md — Stulberg classification (Perthes residual deformity) tile

> Status: **SHIPPED (2026-07-19).** Builds the `stulberg` tile — the Stulberg classification of the residual
> femoral head after Legg-Calve-Perthes disease, classes I/II/III/IV/V. Catalog **1307 → 1308**, group G.

## Why

The catalog carried the active-disease Perthes classifications (Catterall) but had no Stulberg grade — the
standard *outcome* grading of the healed femoral head, which predicts long-term congruency. `stulberg` /
`perthes residual deformity` routed to nothing. This companions the Catterall Perthes tile (companion-gap).

## What it does

The clinician picks the class; the tile reports the class and its sphericity / congruency description.

- `lib/stulberg-v457.js` — pure class → description, the five Stulberg classes by sphericity and congruency at
  skeletal maturity. **I:** normal spherical head. **II:** spherical but with coxa magna, a short neck, or an
  abnormal acetabulum. **III:** non-spherical (ovoid/mushroom/umbrella) but not flat. **IV:** flat head,
  congruent (aspherical congruency). **V:** flat head, incongruent (aspherical incongruency). Accepts I-V and
  1-5.
- `views/group-v457.js` (RV457) — one select (dom `stulberg-class`), real `<label for>`.
- `lib/meta.js` — Stulberg 1981 (J Bone Joint Surg Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v177 → v178); corpus → 1308.

**HIGH-STAKES:** it reports the radiographic class the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Stulberg SD, Cooperman DR, Wallensten R. The natural history of Legg-Calve-Perthes disease.
  *J Bone Joint Surg Am.* 1981;63(7):1095-1108.
- Cross-verified against orthopedic / radiology references reproducing the same spherical-normal (I) /
  spherical-abnormal (II) / non-spherical (III) / flat-congruent (IV) / flat-incongruent (V) grouping. This
  grades the healed hip at maturity; the active-disease radiographic classifications (Catterall, Herring
  lateral pillar, Waldenstrom stage) are separate.

## Verification

Lint (all catalog-truth surfaces at 1308), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: class III renders "non-spherical ... but not flat," the other classes flip to their descriptions; the
tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the class the clinician selects; it does not read the radiograph, apply Mose circles, or
recommend management. The MCP adapter + golden-probe promotion follow in the next wave (282).
