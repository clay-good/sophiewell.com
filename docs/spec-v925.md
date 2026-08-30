# spec-v925 — A delta check flags a change, not an error

## Why

`delta check` was zero-hit across the 1706 tile names. It is the check every laboratory
information system runs on every repeat result, and it completes the measurement-quality group
shipped this week.

## What it does

| | |
| --- | --- |
| Absolute delta | current − previous |
| Percent delta | that difference over the previous result |
| Rate | that difference per 24 hours of elapsed time |

Give it your thresholds and it says which one the change passed. Give it none and it reports the
three deltas and flags nothing.

## The four things it is for

**The thresholds are local.** There is no published universal set — every laboratory sets its own
from its own population and its own analyzers — so the tile takes them as inputs and supplies
none. A change of 1.0 → 99 in an hour with no threshold entered is reported and **not** flagged,
and the band says why.

**A flag is a change, not an error.** The check was invented to catch mislabeled and mixed-up
specimens, and most of what it flags is real clinical change. A flag is a reason to look, and
treating it as evidence of a specimen problem is the standard way to misuse it. The flagged band
ends with that sentence.

**Rate is the part that gets left out.** The same difference over six hours and over six days are
not the same finding, so the elapsed time is required and the rate prints whether or not anyone
set a threshold for it — because a laboratory with only an absolute threshold flags slow drift
and misses fast change.

**Where the analyte's biological variation is known**, the reference change value is the
principled threshold rather than a locally chosen number, and it has its own tool (spec-v920).

A previous result of zero gives no percent delta; the absolute delta and the rate still stand,
and the result says so.

## Files

New: `lib/delta-check-v925.js`, `views/group-v925.js`, `mcp/adapters/delta-check-v925.js`,
`test/unit/delta-check.test.js`, this file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

## Sourcing

Ladenson 1975 (*Clin Chem*) for the original description and Randell and Yenice 2019 (*Crit Rev
Clin Lab Sci*) for the modern review, which is also the source for "the thresholds are local" and
for the low positive predictive value of a flag for a specimen problem. Neither issuer is in
`ISSUER_PATTERN`, so no `docs/citation-staleness.md` row is owed.

Catalog 1706 → 1707.
