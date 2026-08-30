# spec-v920 — "Inside the reference change value" is not "stable"

## Why

`reference change value`, `critical difference` and `delta check` were all zero-hit across the
1701 tile names. The catalog had Fagan and number-needed-to-treat and nothing for the question a
nurse asks every shift: *is this creatinine actually rising?*

## What it does

**RCV = √2 × Z × √(CVa² + CVi²)**

| Input | Where it comes from |
| --- | --- |
| CVa, analytical imprecision | the assay, and the laboratory running it knows it |
| CVi, within-subject biological variation | published tables — a property of the **analyte**, not of this patient |
| Z | 1.96 two-sided at 95%, 1.65 one-sided at 95%, 2.58 two-sided at 99%, 2.33 one-sided at 99% |

Give it two results as well and it reports the observed percentage change against the threshold.

## The four things it is for

**A change smaller than the RCV is not "stable".** It is a change that cannot be told apart from
analytical and biological variation. Those are different statements, and only the second one
follows from the arithmetic. The worked example is exactly that case, and the band says it in
those words.

**A change larger than it is real, not necessarily important.** The arithmetic answers whether
something moved. It says nothing about whether the movement matters.

**One-sided and two-sided are different questions.** If only a rise is being watched for, the
one-sided factor is the right one, and using the two-sided value makes the test harder to pass
than the question asked for. The result names which one was used and what the other is for.

**It assumes a steady state.** Across an acute illness, a transfusion, a fluid bolus or a dose
change, the published within-subject variation is not the variation actually in front of you.

Also stated: for large changes the rise and the fall are not symmetric, because the underlying
distribution is closer to log-normal — this uses the ordinary symmetric form and says so.

## Files

New: `lib/reference-change-value-v920.js`, `views/group-v920.js`,
`mcp/adapters/reference-change-value-v920.js`, `test/unit/reference-change-value.test.js`, this
file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

## Sourcing

Fraser and Harris 1989 (*Crit Rev Clin Lab Sci*) and Fraser 2011 (*Clin Chem Lab Med*),
cross-checked against the EFLM Biological Variation Database's statement of the same formula and
factors. Neither issuer is in `ISSUER_PATTERN`, so no `docs/citation-staleness.md` row is owed.

Catalog 1701 → 1702.
