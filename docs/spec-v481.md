# spec-v481.md — Wiltse classification (spondylolisthesis) tile

> Status: **SHIPPED (2026-07-19).** Builds the `wiltse-spondylolisthesis` tile — the Wiltse-Newman-Macnab
> classification of spondylolisthesis by etiology, types I-V. Catalog **1331 → 1332**, group G.

## Why

The catalog carried the Meyerding grade (amount of slip) but not the Wiltse etiologic classification.
`wiltse` / `spondylolisthesis type` routed to nothing. This complements the Meyerding tile (grade vs cause).

## What it does

The clinician picks the type; the tile reports the type and its etiology description.

- `lib/wiltse-spondylolisthesis-v481.js` — pure type → description, the five Wiltse types. **I:** dysplastic
  (congenital). **II:** isthmic (pars lesion; IIA lytic, IIB elongated, IIC acute fracture). **III:**
  degenerative. **IV:** traumatic. **V:** pathologic. Accepts I-V and 1-5; the note records the later type VI
  (iatrogenic).
- `views/group-v481.js` (RV481) — one select (dom `wiltse-type`), real `<label for>`.
- `lib/meta.js` — Wiltse 1976 (Clin Orthop Relat Res) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author journal article, no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v201 → v202); corpus → 1332.

**HIGH-STAKES:** it reports the etiologic type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the orthopedic /
spine team.

## Sourcing (spec-v97)

- **Citation:** Wiltse LL, Newman PH, Macnab I. Classification of spondylolysis and spondylolisthesis. *Clin
  Orthop Relat Res.* 1976;(117):23-29. The citation URL is a PubMed term search.
- Cross-verified against spine references reproducing the same dysplastic (I) / isthmic (II) / degenerative
  (III) / traumatic (IV) / pathologic (V) grouping; a type VI (iatrogenic / post-surgical) was added by later
  authors and is noted.

## Verification

Lint (all catalog-truth surfaces at 1332), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type II renders "isthmic: a lesion in the pars interarticularis," the other types flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the imaging, grade the slip (that is
Meyerding), or recommend management. The MCP adapter + golden-probe promotion follow in the next wave (306).
