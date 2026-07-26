# spec-v491.md — Severin classification (DDH radiographic outcome) tile

> Status: **SHIPPED (2026-07-19).** Builds the `severin-ddh` tile — the Severin classification of the
> radiographic outcome of the hip after DDH treatment, groups I-VI. Catalog **1341 → 1342**, group G.

## Why

The DDH tiles (Crowe, Hartofilakidis) grade the pre-treatment deformity but not the radiographic *outcome*
after treatment. `severin` / `ddh outcome group` routed to nothing. This companions the DDH cluster.

## What it does

The clinician picks the group; the tile reports the group and its hip-congruency / CE-angle description.

- `lib/severin-ddh-v491.js` — pure group → description, the six Severin groups. **I:** normal. **II:** concentric
  with moderate deformity. **III:** dysplastic without subluxation. **IV:** subluxated. **V:** false (secondary)
  acetabulum. **VI:** redislocation. Accepts I-VI and 1-6.
- `views/group-v491.js` (RV491) — one select (dom `severin-group`), real `<label for>`.
- `lib/meta.js` — Severin 1941 (Acta Chir Scand) citation + accessed date + grouped bands. No citation-staleness
  row (a named-author article, no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v211 → v212); corpus → 1342.

**HIGH-STAKES:** it reports the radiographic group the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the
pediatric-orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Severin E. Contribution to the knowledge of congenital dislocation of the hip joint. *Acta Chir
  Scand.* 1941;84(Suppl 63):1-142. The citation URL is a PubMed term search.
- Cross-verified against pediatric-orthopedic references reproducing the same normal (I) /
  concentric-mild-deformity (II) / dysplastic-no-subluxation (III) / subluxated (IV) / false-acetabulum (V) /
  redislocation (VI) grouping.

## Verification

Lint (all catalog-truth surfaces at 1342), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: group II renders "a concentric hip with moderate deformity," the other groups flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the group the clinician selects; it does not read the radiograph, measure the CE angle, or
recommend management. The MCP adapter + golden-probe promotion follow in the next wave (316).
