# spec-v419.md — Myer-Cotton grade (subglottic stenosis) tile

> Status: **SHIPPED (2026-07-18).** Builds the `cotton-myer` tile — the Myer-Cotton (Cotton-Myer) grading of
> subglottic stenosis by percent luminal obstruction, grades I/II/III/IV. Catalog **1270 → 1271**, group G.

## Why

The catalog had airway/otolaryngology tiles (Brodsky tonsil size) but no subglottic-stenosis grading, the
standard descriptor for a narrowed pediatric/adult subglottic airway. `cotton-myer` / `subglottic stenosis
grade` routed to nothing. This fills that airway gap.

## What it does

The clinician picks the grade; the tile reports the grade and its percent-obstruction description.

- `lib/cotton-myer-v419.js` — pure grade → description. **I:** 0% to 50% obstruction. **II:** 51% to 70%.
  **III:** 71% to 99%. **IV:** no detectable lumen (complete obstruction). Accepts I/II/III/IV and 1-4.
- `views/group-v419.js` (RV419) — one select (dom `cm-grade`), real `<label for>`.
- `lib/meta.js` — Myer-Cotton 1994 (Ann Otol Rhinol Laryngol) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v140 → v141); corpus → 1271.

**HIGH-STAKES:** it reports the grade the clinician has determined at airway evaluation, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The airway-management decision stays with
the otolaryngology / airway team.

## Sourcing (spec-v97)

- **Citation:** Myer CM 3rd, O'Connor DM, Cotton RT. Proposed grading system for subglottic stenosis based
  on endotracheal tube sizes. *Ann Otol Rhinol Laryngol.* 1994;103(4 Pt 1):319-323.
- Cross-verified against otolaryngology / airway references reproducing the same 0-50% (I) / 51-70% (II) /
  71-99% (III) / no-detectable-lumen (IV) grouping.

## Verification

Lint (all catalog-truth surfaces at 1271), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade II renders "51% to 70% obstruction," the other grades flip to their descriptions; the tile
does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the endoscopy, size the endotracheal tube,
or recommend dilation vs reconstruction. The MCP adapter + golden-probe promotion follow in a separate wave.
