# spec-v448.md — Traynelis (atlanto-occipital dislocation) tile

> Status: **SHIPPED (2026-07-19).** Builds the `traynelis` tile — the Traynelis classification of traumatic
> atlanto-occipital dislocation, types I/II/III. Catalog **1299 → 1300**, group G.

## Why

The catalog gained the Anderson-Montesano occipital condyle classification ([spec-v447](spec-v447.md)) but had
no Traynelis type — the standard classification of atlanto-occipital dislocation. `traynelis` /
`atlanto-occipital dislocation type` routed to nothing. This continues the craniocervical cluster.

## What it does

The clinician picks the type; the tile reports the type and its displacement description.

- `lib/traynelis-v448.js` — pure type → description, the three Traynelis types by the direction of occiput
  displacement relative to the atlas. **I:** anterior displacement. **II:** longitudinal distraction (vertical
  separation). **III:** posterior displacement. Accepts I-III and 1-3.
- `views/group-v448.js` (RV448) — one select (dom `traynelis-type`), real `<label for>`.
- `lib/meta.js` — Traynelis 1986 (J Neurosurg) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v169 → v170); corpus → 1300.

**HIGH-STAKES:** it reports the imaging type the clinician has determined, never a diagnosis, a stability
determination, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); atlanto-occipital
dislocation is a high-mortality craniocervical injury and the management decision stays with the spine /
neurosurgery team.

## Sourcing (spec-v97)

- **Citation:** Traynelis VC, Marano GD, Dunker RO, Kaufman HH. Traumatic atlanto-occipital dislocation. Case
  report. *J Neurosurg.* 1986;65(6):863-870.
- Cross-verified against neuroradiology / spine references reproducing the same anterior (I) /
  longitudinal-distraction (II) / posterior (III) displacement grouping.

## Verification

Lint (all catalog-truth surfaces at 1300), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type II renders "longitudinal distraction (vertical separation)," the other types flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the CT, measure the BAI/BDI or condyle-C1
interval, or determine stability. The MCP adapter + golden-probe promotion follow in a separate wave.
