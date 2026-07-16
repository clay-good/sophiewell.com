# spec-v351.md — Goligher classification (internal hemorrhoids) tile

> Status: **SHIPPED (2026-07-16).** Builds the `goligher-hemorrhoids` tile — the Goligher
> classification of internal hemorrhoids by degree of prolapse (grades I–IV). Catalog **1202 →
> 1203**, group G.

## Why

The catalog carries the GI-bleed severity scores (`forrest`, `rockall`, `glasgow-blatchford`) but had no
grading for internal hemorrhoidal disease itself — the worldwide-standard scale for which is Goligher's
four-grade prolapse classification. `goligher classification` / `internal hemorrhoid grade` /
`hemorrhoid grade` routed to nothing.

## What it does

The clinician picks the prolapse grade; the tile reports the grade, its description, and whether it is an
advanced (grade III–IV) grade.

- `lib/goligher-hemorrhoids-v351.js` — pure grade → description. **I:** bleed but do not prolapse.
  **II:** prolapse on straining but reduce spontaneously. **III:** prolapse, require manual reduction —
  flagged (advanced). **IV:** irreducible / permanently prolapsed (may be thrombosed or strangulated) —
  flagged (advanced). Accepts I/II/III/IV or 1–4, case-insensitive.
- `views/group-v351.js` (RV351) — one select (dom `goligher-grade`), real `<label for>`.
- `lib/meta.js` — Goligher 1984 citation (cross-verified against Tech Coloproctol 2022) + accessed date
  + grouped bands. No citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v72 → v73); corpus → 1203.

**HIGH-STAKES:** it reports the Goligher grade the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The office/conservative (lower grades)
vs procedural/operative (higher grades) association is the classically taught pattern, not an order; the
management decision stays with the colorectal / general surgeon (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Goligher JC. *Surgery of the Anus, Rectum and Colon.* 5th ed. London: Baillière Tindall;
  1984 (the internal-hemorrhoid grade I–IV prolapse definitions).
- Cross-verified against Rørvik HD, et al. Is the Goligher classification a valid tool in clinical
  practice and research for hemorrhoidal disease? *Tech Coloproctol.* 2022;26(5):341-349
  (doi:10.1007/s10151-022-02591-3), reproducing the same four-grade prolapse definitions.

## Verification

Lint (all catalog-truth surfaces at 1203), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (grade III) renders the "prolapse / manual reduction" warn description, grade I
flips to the "bleed but do not prolapse" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not perform anoscopy, stage external
hemorrhoids, or recommend a treatment. The MCP adapter + golden-probe promotion follow in a separate wave.
