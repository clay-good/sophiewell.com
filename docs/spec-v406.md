# spec-v406.md — Le Fort classification (midface fracture) tile

> Status: **SHIPPED (2026-07-17).** Builds the `le-fort` tile — the Le Fort classification of midface
> (maxillary) fractures (types I/II/III). Catalog **1257 → 1258**, group G.

## Why

The trauma / maxillofacial classification tiles had no tile for the Le Fort midface-fracture pattern — one
of the most universally taught fracture classifications. `le fort` / `midface fracture` routed to nothing.

## What it does

The clinician picks the type; the tile reports the type and its fracture-level description.

- `lib/le-fort-v406.js` — pure type → description. **I:** horizontal "floating palate" (Guerin) above the
  tooth apices. **II:** pyramidal "floating maxilla" up to the nasofrontal region. **III:** craniofacial
  disjunction ("floating face"), the whole midface separated from the skull base. All three levels pass
  through the pterygoid plates. Accepts I/II/III and 1-3.
- `views/group-v406.js` (RV406) — one select (dom `lf-type`), real `<label for>`.
- `lib/meta.js` — Le Fort 1901 citation + accessed date + grouped bands. No citation-staleness row (the
  citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v127 → v128); corpus → 1258.

**HIGH-STAKES:** it reports the fracture type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Higher levels involve more of the craniofacial
skeleton, but the management decision stays with the maxillofacial / trauma team.

## Sourcing (spec-v97)

- **Citation:** Le Fort R. Etude experimentale sur les fractures de la machoire superieure. *Rev Chir
  Paris.* 1901;23:208-227, 360-379, 479-507.
- Cross-verified against maxillofacial-surgery / radiology references reproducing the same floating-palate
  (I) / pyramidal-floating-maxilla (II) / craniofacial-disjunction (III) grouping, each level passing
  through the pterygoid plates.

## Verification

Lint (all catalog-truth surfaces at 1258), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type II renders "pyramidal / floating maxilla," I and III flip to the floating-palate /
craniofacial-disjunction descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the CT, resolve mixed / asymmetric
patterns, or recommend fixation. The MCP adapter + golden-probe promotion follow in a separate wave.
