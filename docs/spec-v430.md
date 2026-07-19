# spec-v430.md — Papile grade (germinal matrix / IVH) tile

> Status: **SHIPPED (2026-07-18).** Builds the `papile-ivh` tile — the Papile grading of germinal matrix /
> intraventricular hemorrhage, grades I/II/III/IV. Catalog **1281 → 1282**, group G.

## Why

The catalog gained the Sarnat HIE staging ([spec-v429](spec-v429.md)) but had no Papile grading for
germinal-matrix / intraventricular hemorrhage — the standard neonatal neuroimaging grade. `papile grade` /
`intraventricular hemorrhage grade` routed to nothing. This continues the neonatology cluster.

## What it does

The clinician picks the grade; the tile reports the grade and its imaging description.

- `lib/papile-ivh-v430.js` — pure grade → description, the original Papile (1978) four-grade scheme. **I:**
  confined to the germinal matrix (subependymal). **II:** IVH without ventricular dilatation. **III:** IVH
  with ventricular dilatation. **IV:** IVH with parenchymal extension. Accepts I-IV and 1-4.
- `views/group-v430.js` (RV430) — one select (dom `papile-grade`), real `<label for>`.
- `lib/meta.js` — Papile 1978 (J Pediatr) citation + accessed date + grouped bands. No citation-staleness row
  (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v151 → v152); corpus → 1282.

**HIGH-STAKES:** it reports the imaging grade the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the neonatology
team.

## Sourcing (spec-v97)

- **Citation:** Papile LA, Burstein J, Burstein R, Koffler H. Incidence and evolution of subependymal and
  intraventricular hemorrhage: a study of infants with birth weights less than 1,500 gm. *J Pediatr.*
  1978;92(4):529-534.
- Cross-verified against neonatology / neuroradiology references reproducing the same germinal-matrix (I) /
  IVH-without-dilatation (II) / IVH-with-dilatation (III) / parenchymal-extension (IV) grading. This reports
  the original scheme; a later scheme (Volpe) treats parenchymal involvement as periventricular hemorrhagic
  infarction and is out of scope.

## Verification

Lint (all catalog-truth surfaces at 1282), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade III renders "with ventricular dilatation," the other grades flip to their descriptions; the
tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the cranial ultrasound, apply the Volpe
scheme, or estimate outcome. The MCP adapter + golden-probe promotion follow in a separate wave.
