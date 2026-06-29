# Scope ledger — Data-Sourced Reference-Table program (spec-v168)

This is the running ledger for the [spec-v168](spec-v168.md) **Data-Sourced
Reference-Table** program (the fourth coverage pass, after spec-v150 /
spec-v157 / spec-v162). The program's governing rule is the
[spec-v141](spec-v141.md) verbatim-fetch pattern hardened by the
[spec-v97](spec-v97.md) >=2-independent-source rule: **every coefficient/table
is fetched to disk and parsed programmatically, cross-verified against a second
independent reproduction, and a table that cannot be sourced verbatim is
deferred (the `crib-ii` precedent), never hand-transcribed or approximated.**

## Running count

The live catalog at the program's current close is **737** deterministic tiles
(`UTILITIES.length`, the catalog-truth source of truth). The program added **2**
of its proposed 7 tiles; the other 5 are deferred on sourcing grounds (below),
each re-opening the moment a verbatim, cross-verifiable source becomes reachable.

## Shipped

| Spec | Tile | Source (verbatim-fetched) | Cross-verification | Class |
|---|---|---|---|---|
| v169 | `cdc-stature-for-age` | CDC NCHS `statage.csv` (2026-06-29, HTTP 200) | the file's own P3..P97 percentile columns reconstructed from the LMS set; max rel. error 1.8e-9 over 3,924 checks | A |
| v169 | `cdc-weight-for-age` | CDC NCHS `wtage.csv` (2026-06-29, HTTP 200) | same self-cross-verification; max rel. error 3.9e-9 over 3,924 checks | A |

Both reuse the existing `interpLMS` / `lmsToZ` infrastructure in
`lib/growth-lms-data.js` and the LMS z-transform fuzzed since spec-v141. They
are the percentile companions to the already-live `peds-bmi-percentile` (CDC
BMI-for-age) and `who-growth-zscore` (WHO 0-2 yr) and sit beside them in Group E.

## Deferred (sourcing gate failed — re-checked, not re-specced)

Per the [spec-v97](spec-v97.md) rule and the [spec-v168](spec-v168.md) §5
acceptance criterion, the following are parked because, in the build
environment, no verbatim + cross-verifiable source could be fetched. They are
not approximated; a wrong value in any of them carries real clinical harm.

| Spec | Tile | Why deferred |
|---|---|---|
| v169 | `pediatric-bp-percentile` | The AAP 2017 / NHLBI Fourth Report blood-pressure percentile needs the regression-coefficient set (intercept + age-polynomial + height-Z terms, by sex, for SBP and DBP). It is published only inside PDF appendices that resisted a clean, programmatic, cross-verifiable fetch. A wrong BP percentile mis-stages hypertension. |
| v170 | `kdpi` | The OPTN "Guide to Calculating and Interpreting KDPI" (the annual KDRI scaling factor and the raw-KDRI -> KDPI percentile mapping) is on `optn.transplant.hrsa.gov`, which returned HTTP 403 across the whole domain. The mapping cannot be fetched verbatim, so the tile is deferred per the spec-v170 §6 sourcing gate. |
| v170 | `epts` | Same OPTN 403 block: the EPTS raw-score -> percentile mapping table is not fetchable verbatim. |
| v171 | `fenton-preterm-growth` | The Fenton 2013 LMS tables ship as Springer supplementary objects (`static-content.springer.com`), which returned HTTP 403. No verbatim LMS file could be fetched to cross-verify. |
| v171 | `intergrowth-efw-percentile` | The INTERGROWTH-21st EFW standard (Stirnemann 2017, Wiley `uog`) returned HTTP 403 at the publisher; no verbatim coefficient/standard file was reachable. |

The two permanently-parked items named in [spec-v168](spec-v168.md) §2 —
`crib-ii` (single-source matrix, primary + reproduction both 403) and
`gail-bcrat` (binary `.rda` only) — remain parked for the same reason.

## Status

The Data-Sourced Reference-Table program is **partially shipped (+2)**, with the
remaining 5 tiles deferred pending a reachable verbatim source. This is the
spec-sanctioned outcome (spec-v168 §5: "a tile is deferred with the spec-v97
sourcing rationale recorded"), not an oversight: the project's safety doctrine
forbids shipping a clinically-load-bearing calculator from a source that cannot
be fetched and cross-verified.
