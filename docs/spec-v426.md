# spec-v426.md — Gell and Coombs hypersensitivity classification tile

> Status: **SHIPPED (2026-07-18).** Builds the `gell-coombs` tile — the Gell and Coombs classification of
> hypersensitivity reactions, types I/II/III/IV. Catalog **1277 → 1278**, group G.

## Why

The catalog had no hypersensitivity-mechanism classification — the classic Gell and Coombs framework taught
for every immune-mediated reaction. `gell coombs` / `hypersensitivity type` routed to nothing. This fills that
immunology gap.

## What it does

The clinician picks the type; the tile reports the type and its mechanism / examples.

- `lib/gell-coombs-v426.js` — pure type → mechanism, the four Gell and Coombs types. **I:** immediate,
  IgE-mediated (anaphylaxis, atopy). **II:** antibody-mediated cytotoxic, IgG/IgM (autoimmune hemolytic
  anemia, Goodpasture). **III:** immune-complex-mediated (serum sickness, SLE). **IV:** delayed, cell-mediated
  / T-cell (contact dermatitis, tuberculin reaction). Accepts I-IV and 1-4.
- `views/group-v426.js` (RV426) — one select (dom `gc-type`), real `<label for>`.
- `lib/meta.js` — Rajan 2003 (Trends Immunol) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v147 → v148); corpus → 1278.

**HIGH-STAKES:** it reports the mechanism type the clinician selects, never a diagnosis, a treatment decision,
or a prognosis ([spec-v11](spec-v11.md) §5.3). Many real reactions involve more than one mechanism; the tile
reports the classic single-type grouping and the clinical decision stays with the treating team.

## Sourcing (spec-v97)

- **Citation:** Rajan TV. The Gell-Coombs classification of hypersensitivity reactions: a re-interpretation.
  *Trends Immunol.* 2003;24(7):376-379.
- Cross-verified against the original scheme (Gell PGH, Coombs RRA. *Clinical Aspects of Immunology.* 1963)
  reproducing the same immediate-IgE (I) / antibody-cytotoxic (II) / immune-complex (III) / delayed-cell (IV)
  grouping.

## Verification

Lint (all catalog-truth surfaces at 1278), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type I renders "immediate, IgE-mediated," the other types flip to their mechanisms; the tile does
not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not diagnose the reaction, capture multi-mechanism
reactions, or recommend treatment. The MCP adapter + golden-probe promotion follow in a separate wave.
