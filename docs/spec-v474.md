# spec-v474.md — Rastelli classification (complete AVSD) tile

> Status: **SHIPPED (2026-07-19).** Builds the `rastelli-avsd` tile — the Rastelli classification of the
> complete atrioventricular septal defect, types A/B/C. Catalog **1324 → 1325**, group G.

## Why

The congenital-cardiac tiles (Sievers bicuspid aortic valve, El Khoury aortic regurgitation) had no AVSD
classification. `rastelli` / `atrioventricular septal defect type` routed to nothing. This fills that
congenital cardiac-surgery gap.

## What it does

The clinician picks the type; the tile reports the type and its superior-bridging-leaflet-morphology description.

- `lib/rastelli-avsd-v474.js` — pure type → description, the three Rastelli types by the superior (anterior)
  bridging leaflet. **A:** attached by chordae to the crest of the ventricular septum (most common). **B:**
  anomalous chordal attachments to a right-ventricular papillary muscle (rarest). **C:** free-floating,
  unattached to the septum (often with tetralogy of Fallot). Accepts A/B/C and 1-3.
- `views/group-v474.js` (RV474) — one select (dom `rastelli-type`), real `<label for>`.
- `lib/meta.js` — Rastelli 1966 (Mayo Clin Proc) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v194 → v195); corpus → 1325.

**HIGH-STAKES:** it reports the anatomic type the clinician has determined from imaging / operative findings,
never a diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision
stays with the congenital cardiac-surgery team.

## Sourcing (spec-v97)

- **Citation:** Rastelli GC, Kirklin JW, Titus JL. Anatomic observations on complete form of persistent common
  atrioventricular canal with special reference to atrioventricular valves. *Mayo Clin Proc.*
  1966;41(5):296-308. The citation URL is a PubMed term search.
- Cross-verified against congenital-cardiac references reproducing the same septal-crest-attached (A) /
  RV-papillary-muscle (B) / free-floating (C) morphology of the superior bridging leaflet.

## Verification

Lint (all catalog-truth surfaces at 1325), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type A renders "attached by chordae to the crest of the interventricular septum," the other types
flip to their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the echo, choose the repair (single- vs
two-patch), or recommend management. The MCP adapter + golden-probe promotion follow in the next wave (299).
