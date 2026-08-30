# spec-v924 — Correlation is not agreement

## Why

`bland-altman`, `limits of agreement` and `method comparison` were all zero-hit across the 1705
tile names. It completes the measurement-quality group shipped this week: reference change value
(v920), sigma metric (v921), kappa (v922), biological-variation goals (v923).

## What it does

**Bias** = mean of the differences. **Limits of agreement** = bias ± 1.96 SD of the differences.
Between them lie 95% of the differences expected in future pairs.

Each limit comes back with its own 95% interval, from a standard error of about
`SD × √(3/n)`; the bias from `SD/√n`.

## The four things it is for

**A high correlation is not agreement.** That is the sentence the 1986 paper exists to make: two
methods can correlate almost perfectly and disagree by a clinically enormous margin, because
correlation measures whether they move together and not whether they land in the same place. It
prints on every result.

**The limits describe; they do not judge.** Whether the span is acceptable is a clinical
decision, and the papers are explicit it should be set *before* the study, not read off the
result. `abnormal` is always false — an SD of 500 across 500 pairs is still just reported.

**The limits are estimates with their own uncertainty**, which is why the intervals sit beside
them rather than in a footnote. Below about 50 pairs the result says so and gives the width that
makes it matter.

**If the difference varies with the size of the measurement**, one pair of limits is the wrong
summary — and no arithmetic here can show that. Only the plot can, and the result says so.

A bias of zero returns limits all the same, with the line that agreeing *on average* says
nothing about how far apart any single pair can be.

## Files

New: `lib/bland-altman-v924.js`, `views/group-v924.js`, `mcp/adapters/bland-altman-v924.js`,
`test/unit/bland-altman.test.js`, this file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

## Sourcing

Bland and Altman 1986 (*Lancet*) for the method and 1999 (*Stat Methods Med Res*) for the
standard errors of the limits. Neither issuer is in `ISSUER_PATTERN`, so no
`docs/citation-staleness.md` row is owed.

Catalog 1705 → 1706.
