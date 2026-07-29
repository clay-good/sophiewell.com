# spec-v592 — Amsterdam II criteria (Lynch syndrome)

## What this gives you

Whether a family meets the Amsterdam II criteria — with the three requirements the famous mnemonic leaves out
asked explicitly, and with an honest statement of what a negative result does *not* mean.

## Why it exists

The catalog carried breast and ovarian familial-risk models and had nothing on the Lynch axis.
`grep -ci lynch app.js` returned 0.

## The rule — all six, or it fails

| # | Requirement | In "3-2-1"? |
|---|---|---|
| 1 | ≥ 3 relatives with a cancer in the spectrum | yes |
| 2 | **One is a first-degree relative of the other two** | **no** |
| 3 | ≥ 2 successive generations affected | yes |
| 4 | ≥ 1 diagnosed before age 50 | yes |
| 5 | **FAP excluded in the colorectal cases** | **no** |
| 6 | **Tumors verified by pathological examination** | **no** |

This is a **conjunction, not a count**. Five of six fails, and is not a near miss.

**Three affected cousins satisfy "3" and fail the criteria.** That is why the first-degree question is asked
separately.

## The spectrum is closed

Only **colorectal, endometrium, small intestine, ureter, renal pelvis** count toward the three. A relative
with any other cancer contributes nothing — the list is the criteria's, not a summary of which cancers Lynch
syndrome causes.

**Amsterdam I counted colorectal cancer only**, so a family whose three cancers include an endometrial one
meets II and fails I. Both are reported.

## What a negative result does not mean

The Bethesda guidelines were introduced because the Amsterdam criteria were found **too strict**, and are
reported to be more sensitive. Failing Amsterdam II is **not** evidence against Lynch syndrome and **not** a
reason to withhold MMR immunohistochemistry, MSI testing or germline testing.

**Accuracy figures withheld (spec-v97).** The commonly quoted sensitivity and specificity appeared in only
one of the two sources checked, so `sensitivityPercent` and `specificityPercent` are always null.

## Scope (spec-v11 §5.3)

**Family-history** criteria. They do not diagnose Lynch syndrome — that is a germline diagnosis made by
genetic testing — do not identify which gene, do not assess an individual's cancer risk or set surveillance
intervals, and say nothing about a family that has not been asked the right questions or whose relatives'
tumors were never confirmed. Genetic testing has implications for relatives and belongs with genetic
counseling.

## Sources

- Vasen HFA, Watson P, Mecklin JP, Lynch HT. *Gastroenterology.* 1999;116(6):1453-1456.
- Vasen HFA, Mecklin JP, Khan PM, Lynch HT. *Dis Colon Rectum.* 1991;34(5):424-425 (Amsterdam I).

## Files

`lib/amsterdam-ii-v592.js`, `views/group-v592.js`, `mcp/adapters/amsterdam-ii-v592.js` (wave 417),
`test/unit/amsterdam-ii.test.js`. Catalog 1441 → 1442; MCP 1378 → 1379.
