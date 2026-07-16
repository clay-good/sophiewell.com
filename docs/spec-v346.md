# spec-v346.md — Catterall classification (Legg-Calve-Perthes) tile

> Status: **SHIPPED (2026-07-16).** Builds the `catterall-perthes` tile — the Catterall classification
> of Legg-Calve-Perthes disease (groups I–IV). Catalog **1197 → 1198**, group G.

## Why

The catalog carries the Ficat-Arlet (adult femoral-head AVN) and Lichtman (lunate AVN) staging systems
but had no Perthes classification — the childhood osteonecrosis of the femoral head. The Catterall
classification is the classic grade of Perthes disease by the extent of capital-femoral-epiphysis
involvement, and carries its prognosis. `catterall classification` / `perthes disease group` routed to
nothing.

## What it does

The clinician picks the extent of epiphyseal involvement; the tile reports the group, its description,
and whether it is a more extensive (group III–IV) involvement.

- `lib/catterall-perthes-v346.js` — pure group → description. **I:** anterior epiphysis only (best
  prognosis). **II:** anterior and central, sequestrum, pillars preserved. **III:** most of the
  epiphysis ("head within a head") — flagged. **IV:** the entire epiphysis — flagged. Accepts roman
  I–IV or numeric 1–4, case-insensitive.
- `views/group-v346.js` (RV346) — one select (dom `catterall-group`), real `<label for>`.
- `lib/meta.js` — Catterall 1971 citation + accessed date + grouped bands. No citation-staleness row
  (the JBJS Br citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v67 → v68); corpus → 1198.

**HIGH-STAKES:** it reports the Catterall group the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The containment-vs-observation
management gradient is the classically taught association, not an order; the "head-at-risk" signs (Gage
sign, lateral subluxation, calcification lateral to the epiphysis, a horizontal physis) are separate
modifiers, not group inputs; and the decision stays with the pediatric orthopedic surgeon (surfaced in
the tile note).

## Sourcing (spec-v97)

- **Citation:** Catterall A. The natural history of Perthes' disease. *J Bone Joint Surg Br.*
  1971;53(1):37-53 (the four groups by epiphyseal involvement).
- Cross-verified against pediatric-orthopedic references (Radiopaedia / POSNA study guide / review
  articles) reproducing the same group-I–IV femoral-head-involvement definitions.

## Verification

Lint (all catalog-truth surfaces at 1198), unit suite (+5 + fuzz), build — all green. Verified in a
real browser: the example (group III) renders the "head within a head / more extensive" warn
description, group I flips to the "anterior epiphysis only, best prognosis" description, and the tile
does not scroll horizontally at 320px.

## Out of scope

The tile echoes the group the clinician selects; it does not read imaging, assess the head-at-risk
signs (described in the note), or predict an individual patient's outcome. The MCP adapter +
golden-probe promotion follow in a separate wave.
