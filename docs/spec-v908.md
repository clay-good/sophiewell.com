# spec-v908 — Hy's Law, and the word "potential"

## Why

`hy law` was zero-hit across the 1696 tile names, and the slug was free. The catalog already
held RUCAM and the R-factor — causality and pattern for drug-induced liver injury — with nothing
for the rule that decides whether a case counts at all.

## What it does

Takes ALT (or AST), total bilirubin and alkaline phosphatase, each with its own upper limit of
normal, and reports which of the four criteria are reached.

| # | Criterion |
| --- | --- |
| 1 | an aminotransferase, ALT or AST, **at or above 3×** its upper limit of normal |
| 2 | a total bilirubin **above 2×** its upper limit of normal |
| 3 | no cholestasis at the outset — alkaline phosphatase **below 2×** its upper limit |
| 4 | **no other reason** for the combination |

Result: *does not meet* / *potential case* / *meets Hy's Law*.

## The three things it is for

**The labs alone make a potential case, never a case.** The fourth criterion is a judgment, not a
measurement: viral hepatitis A, B, C and E, other pre-existing or acute liver disease, and any
other drug capable of the same injury have to be ruled out first. This is the distinction the
tile exists to hold, and the one most often dropped — so the result carries it whether or not the
box is checked.

**A raised alkaline phosphatase takes the picture out.** Hy's Law was written for hepatocellular
injury. A cholestatic picture carrying the same bilirubin is a different thing, and the rule does
not describe it. The tile therefore requires the alkaline phosphatase rather than assuming it.

**It is a signal about a drug, not a prognosis for a patient.** The observation behind the rule is
that a drug producing such cases in trials goes on to cause severe injury at a rate in the wider
population. That says nothing about how one person will do, and the result says so.

## Files

New: `lib/hys-law-v908.js`, `views/group-v908.js`, `mcp/adapters/hys-law-v908.js`,
`test/unit/hys-law.test.js`, this file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

## Sourcing

The FDA's 2009 *Drug-Induced Liver Injury: Premarketing Clinical Evaluation* guidance, with the
thresholds cross-checked against the LiverTox monograph maintained by the National Institute of
Diabetes and Digestive and Kidney Diseases. The FDA is not in `ISSUER_PATTERN`, so no
`docs/citation-staleness.md` row is owed.

Catalog 1696 → 1697.
