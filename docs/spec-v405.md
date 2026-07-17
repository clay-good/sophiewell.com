# spec-v405.md — Savary-Miller classification (reflux esophagitis) tile

> Status: **SHIPPED (2026-07-17).** Builds the `savary-miller` tile — the modified Savary-Miller
> classification of reflux esophagitis (grades I/II/III/IV/V). Catalog **1256 → 1257**, group G.

## Why

The catalog carries the Los Angeles esophagitis classification (`la-esophagitis`) but not the older /
alternative Savary-Miller grading a clinician may still see reported. The Savary-Miller classification, by
the endoscopic extent of the mucosal lesions, is the standard alternative. `savary miller` / `reflux
esophagitis grade` routed to nothing. This is the LA↔Savary-Miller esophagitis companion-gap.

## What it does

The clinician picks the grade; the tile reports the grade and its endoscopic description.

- `lib/savary-miller-v405.js` — pure grade → description. **I:** single erosion on one fold. **II:**
  multiple non-confluent erosions on more than one fold. **III:** circumferential confluent erosions.
  **IV:** chronic complications (ulcer / stricture / short esophagus). **V:** Barrett's (columnar-lined)
  epithelium. Accepts I-V and 1-5.
- `views/group-v405.js` (RV405) — one select (dom `sm-grade`), real `<label for>`.
- `lib/meta.js` — Savary-Miller 1978 (modified) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v126 → v127); corpus → 1257.

**HIGH-STAKES:** it reports the endoscopic grade the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Higher grades carry more complications,
but the management decision stays with the gastroenterology team.

## Sourcing (spec-v97)

- **Citation:** Savary M, Miller G. *The Esophagus: Handbook and Atlas of Endoscopy.* Solothurn: Gassmann;
  1978 (the original I-IV grading); the modified grade V (Barrett) from the Ollyo / Monnier revision.
- Cross-verified against gastroenterology references reproducing the same single-fold-erosion (I) /
  multiple-fold-non-confluent (II) / circumferential-confluent (III) / chronic-complication (IV) / Barrett
  (V) grouping.

## Verification

Lint (all catalog-truth surfaces at 1257), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: grade III renders "circumferential confluent erosions," I / II / IV / V flip to their endoscopic
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the endoscopy, map to the Los Angeles
grade, or recommend therapy. The MCP adapter + golden-probe promotion follow in a separate wave.
