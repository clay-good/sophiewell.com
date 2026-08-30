# spec-v922 — 95% agreement, kappa near zero

## Why

`kappa`, `inter-rater agreement` and `pabak` were all zero-hit across the 1703 tile names. Kappa
is the number every chart-review and reading-agreement study reports, and it is the one most
often read as if it were percent agreement.

## What it does

Takes the four counts of a 2×2 rater table and returns kappa, plus the two indices that explain
it: **prevalence index** |a−d|/n, **bias index** |b−c|/n, and PABAK for comparison.

## The three things it is for

**Kappa is not percent agreement, and the gap is the point.** The worked example is two raters
agreeing on **95 of 100 cases** with a kappa of **−0.025** — because when almost every case falls
in one category, chance already predicts 95% agreement. That is the first kappa paradox, and it
is why the prevalence index prints on every result rather than sitting in a footnote.

**A high bias index means the disagreements run in a direction** — one rater saying yes where the
other says no, systematically rather than at random. Kappa alone cannot show that.

**The strength-of-agreement labels are a convention, not a standard.** Landis and Koch described
their own divisions as arbitrary, and the band line says "on labels that are a convention" every
time it uses one. The boundaries are theirs: an exact 0.40 is *fair*, not *moderate*, and the
tests pin both edges.

When every case falls in one category for both raters, the denominator is zero: kappa is reported
as **undefined**, not as a number, and observed agreement is still reported.

## Files

New: `lib/cohens-kappa-v922.js`, `views/group-v922.js`, `mcp/adapters/cohens-kappa-v922.js`,
`test/unit/cohens-kappa.test.js`, this file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

## Sourcing

Cohen 1960, Landis and Koch 1977 for the labels, and Byrt 1993 for the prevalence and bias
indices and PABAK — three primary sources rather than two. Neither issuer is in `ISSUER_PATTERN`,
so no `docs/citation-staleness.md` row is owed.

Catalog 1703 → 1704.
