# spec-v909 — Response to ursodeoxycholic acid: four definitions that disagree

## Why

The catalog held the two continuous models for primary biliary cholangitis — GLOBE and UK-PBC —
and none of the threshold definitions that actually get used at the 12-month visit.
`paris criteria`, `barcelona criteria` and `udca` were all zero-hit across the 1697 tile names.

## What it does

Takes the months on treatment and the labs, and reports each definition separately.

| Set | Read at | Asks for |
| --- | --- | --- |
| Barcelona | 12 months | alkaline phosphatase falls **> 40%** from baseline, or normalizes |
| Paris I | 12 months | ALP **≤ 3×** ULN, AST **≤ 2×** ULN, bilirubin **≤ 1 mg/dL** |
| Paris II | 12 months | ALP **≤ 1.5×** ULN, AST **≤ 1.5×** ULN, bilirubin **≤ 1 mg/dL** (early-stage disease) |
| Toronto | 24 months | ALP **≤ 1.67×** ULN |

## The three things it is for

**They disagree.** Each set was drawn on a different cohort against a different endpoint, so one
blood draw can be a response by Barcelona and a non-response by Paris II. The worked example is
exactly that case. Where the sets part, the tile reports the split and picks none of them.

**The time point is part of the criterion.** Reading Toronto at 12 months is not Toronto. Each
set carries the time it is read at, and a set whose time has not arrived is reported as not
readable rather than quietly evaluated early.

**Non-response is not a reason to stop.** It identifies who is considered for second-line
therapy. It is not itself a treatment decision, and it does not say to stop ursodeoxycholic acid.

Sets whose labs are missing come back as *not assessable* naming the missing lab, rather than as
a failure — Barcelona needs the pre-treatment alkaline phosphatase, the Paris sets need the AST
and bilirubin, and Toronto needs neither.

## Files

New: `lib/udca-response-v909.js`, `views/group-v909.js`, `mcp/adapters/udca-response-v909.js`,
`test/unit/udca-response.test.js`, this file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

## Sourcing

The four original reports (Parés 2006, Corpechot 2008 and 2011, Kumagi 2010), cross-checked
against the thresholds as tabulated in the EASL and AASLD primary biliary cholangitis guidance.
No issuer is in `ISSUER_PATTERN`, so no `docs/citation-staleness.md` row is owed.

Catalog 1697 → 1698.
