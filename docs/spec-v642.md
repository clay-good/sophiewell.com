# spec-v642.md — Yamaguchi Criteria for Adult-Onset Still's Disease

> Status: **SHIPPED (2026-08-03).** Builds the `yamaguchi-aosd` tile. Catalog **1472 → 1473**, group G.

## Why

A whole-concept gap: adult-onset Still's disease (AOSD) had no classification tool in the catalog (`yamaguchi`,
`still`-disease, `aosd` were all zero-hit). The Yamaguchi criteria are the most widely used classification
criteria for AOSD.

## What it does

This is **not** a weighted sum. It counts criteria against a dual rule with exclusion vetoes. Classification
requires **≥ 5 of the 8 criteria including ≥ 2 major**, **AND** no exclusion present (sensitivity 96.2%,
specificity 92.1%).

| Major (4) | Minor (4) |
| --- | --- |
| Fever ≥ 39°C lasting ≥ 1 week | Sore throat |
| Arthralgia lasting ≥ 2 weeks | Lymphadenopathy and/or splenomegaly |
| Typical salmon-pink rash | Liver dysfunction (elevated transaminases/LDH) |
| Leukocytosis ≥ 10,000/mm³ with ≥ 80% granulocytes | Negative RF **and** negative ANA |

**Exclusions (any present vetoes classification):** (I) infections (esp. sepsis, infectious mononucleosis),
(II) malignancies (esp. malignant lymphoma), (III) rheumatic diseases (esp. polyarteritis nodosa, rheumatoid
vasculitis).

## Three things a plausible implementation gets wrong

1. **The dual rule is not just a count of 5.** A patient with five criteria that includes only one major does
   *not* classify; a test asserts 1 major + 4 minor (5 total) fails while 2 major + 3 minor passes.
2. **Two minors each collapse a clinical pair into one criterion.** "Lymphadenopathy and/or splenomegaly" is
   one item, and "negative RF and negative ANA" is one item requiring *both* to be negative. Splitting either
   into two would inflate the count and misclassify.
3. **AOSD is a diagnosis of exclusion.** Any of the three exclusion categories vetoes classification
   regardless of how many criteria are met; the tile enforces this and says so.

## Scope (spec-v11 §5.3)

A **classification** rule, built to standardize study cohorts, not to diagnose an individual. The diagnosis
and management decision stay with the clinician.

## Files

- `lib/yamaguchi-v642.js` — `yamaguchiAosd()`, `YAMAGUCHI_NOTE`.
- `views/group-v642.js` (RV642) — grouped major / minor / exclusion checkboxes; a11y-checked, no innerHTML.
- `mcp/adapters/yamaguchi-v642.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/yamaguchi.test.js` — 7 tests (example, ≥ 5 rule, ≥ 2-major rule, exclusion veto, paired minors, empty).
- `docs/spec-v642.md` (this file).

## Sourcing (spec-v97)

Yamaguchi M, Ohta A, Tsunematsu T, et al. Preliminary criteria for classification of adult Still's disease.
*J Rheumatol.* 1992;19(3):424-430 (PMID 1578458). All four major, four minor, and three exclusion categories,
and the "≥ 5 including ≥ 2 major" rule, were transcribed from Table 4 of the primary paper and confirmed
across multiple independent sources; the reported performance is 96.2% sensitivity, 92.1% specificity.
