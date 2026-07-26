# spec-v461.md — DeBakey classification (aortic dissection) tile

> Status: **SHIPPED (2026-07-19).** Builds the `debakey` tile — the DeBakey classification of aortic
> dissection, types I/II/IIIa/IIIb. Catalog **1311 → 1312**, group G.

## Why

The catalog carried the Aortic Dissection Detection Risk Score (ADD-RS) but had no DeBakey grade — the classic
anatomic classification of aortic dissection by origin and extent. `debakey` / `aortic dissection
classification` routed to nothing. This companions the ADD-RS tile (same disease).

## What it does

The clinician picks the type; the tile reports the type and its origin / extent description.

- `lib/debakey-v461.js` — pure type → description, the four DeBakey types by origin and extent. **I:**
  ascending aorta, extending through the arch into the descending (and often abdominal) aorta. **II:** confined
  to the ascending aorta. **IIIa:** descending thoracic aorta, limited above the diaphragm. **IIIb:**
  descending thoracic aorta, extending below the diaphragm. Accepts I/II/IIIa/IIIb and 1/2/3a/3b. The note
  cross-references Stanford (I/II = A; III = B).
- `views/group-v461.js` (RV461) — one select (dom `debakey-type`), real `<label for>`.
- `lib/meta.js` — DeBakey 1965 (J Thorac Cardiovasc Surg) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v181 → v182); corpus → 1312.

**HIGH-STAKES:** it reports the anatomic type the clinician has determined from imaging, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the
cardiac-surgery / vascular team.

## Sourcing (spec-v97)

- **Citation:** DeBakey ME, Henly WS, Cooley DA, Morris GC, Crawford ES, Beall AC. Surgical management of
  dissecting aneurysms of the aorta. *J Thorac Cardiovasc Surg.* 1965;49:130-149. The citation URL is a PubMed
  term search for the classic 1965 paper.
- Cross-verified against cardiovascular references reproducing the same ascending-plus-descending (I) /
  ascending-only (II) / descending-above-diaphragm (IIIa) / descending-below-diaphragm (IIIb) grouping.

## Verification

Lint (all catalog-truth surfaces at 1312), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type I renders "originates in the ascending aorta and extends through the arch," the other types flip
to their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the CT/echo or recommend management (surgery
vs medical). The MCP adapter + golden-probe promotion follow in the next wave (286).
