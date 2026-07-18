# spec-v411.md — Levine-Edwards classification (hangman's fracture) tile

> Status: **SHIPPED (2026-07-17).** Builds the `levine-edwards` tile — the Levine-Edwards classification of
> traumatic spondylolisthesis of the axis / hangman's fractures (types I/II/IIa/III). Catalog **1262 →
> 1263**, group G.

## Why

The catalog just gained the Anderson-D'Alonzo odontoid classification; its C2 companion — the Levine-Edwards
classification of the hangman's fracture (traumatic spondylolisthesis of the axis) — was still missing.
`levine edwards` / `hangman's fracture` routed to nothing. This is the Anderson-D'Alonzo↔Levine-Edwards C2
companion-gap.

## What it does

The clinician picks the type; the tile reports the type and its displacement/angulation description.

- `lib/levine-edwards-v411.js` — pure type → description. **I:** <3 mm translation, no angulation (stable).
  **II:** >3 mm translation with angulation (unstable). **IIa:** minimal translation but severe angulation
  (flexion — traction contraindicated). **III:** type I plus bilateral C2-C3 facet dislocation. Accepts
  I/II/IIa/III, 1-3, and 2a.
- `views/group-v411.js` (RV411) — one select (dom `le-type`), real `<label for>`.
- `lib/meta.js` — Levine-Edwards 1985 (J Bone Joint Surg Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v132 → v133); corpus → 1263.

**HIGH-STAKES:** it reports the fracture type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Type IIa is the classic "do-not-apply-traction"
pattern, but the management decision stays with the spine team.

## Sourcing (spec-v97)

- **Citation:** Levine AM, Edwards CC. The management of traumatic spondylolisthesis of the axis. *J Bone
  Joint Surg Am.* 1985;67(2):217-226.
- Cross-verified against spine / radiology references reproducing the same minimal (I) /
  translation+angulation (II) / flexion-angulation-without-translation (IIa) / with-facet-dislocation (III)
  grouping.

## Verification

Lint (all catalog-truth surfaces at 1263), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type II renders "translation with angulation, unstable," I / IIa / III flip to their descriptions;
the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the imaging, measure the translation /
angulation, or recommend collar vs halo vs surgery. The MCP adapter + golden-probe promotion follow in a
separate wave.
