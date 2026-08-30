# spec-v918 — A number that computes cleanly and ranks badly

## Why

`fmea`, `rpn` and `risk priority number` were zero-hit across the 1699 tile names. Quality work in
a hospital runs on this number, and the catalog had nothing for it.

## What it does

**RPN = severity × occurrence × detection**, each scored 1–10, so the product runs 1–1000.

Then it declines to grade the result.

## The four things it is for

**It does not rank.** A product collapses three different questions into one. **10 × 5 × 2** and
**2 × 5 × 10** both come to 100, and only one of them describes something that kills someone. The
tile reports the profile and the largest of the three factors *before* the product.

**Severity can force action on its own.** A severe failure mode stays severe however rare it is
and however well it is caught, and no arithmetic makes it unimportant. A severity of 9 or 10 is
named explicitly in the result.

**Detection is scored backwards from the other two** — 1 means almost certain to be caught, 10
means almost impossible. Entering it in the same direction as severity and occurrence is a common
error, and the product hides it completely.

**There is no standard threshold.** "Act above 100" is a local convention appearing in no
standard, so the result is **deliberately not banded** and `abnormal` is always false. Banding it
would be the exact claim the tile exists to refuse.

The 2019 AIAG-VDA revision replaced the RPN with an Action Priority for these reasons, and the
result says so.

The three scales are **ordinal ranks, not measurements**, so 11 or 5.5 is refused rather than
clamped — a value off the scale is not a larger or smaller risk, it is not a score.

## Files

New: `lib/fmea-rpn-v918.js`, `views/group-v918.js`, `mcp/adapters/fmea-rpn-v918.js`,
`test/unit/fmea-rpn.test.js`, this file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

## Sourcing

IEC 60812:2018, cross-checked against the AIAG-VDA FMEA Handbook (2019), which documents both the
arithmetic and the reasons it was replaced. Neither issuer is in `ISSUER_PATTERN`, so no
`docs/citation-staleness.md` row is owed.

Catalog 1699 → 1700.
