# spec-v1605 — Data, refresh and open exports for the public-utility program

**Status:** Proposed, September 29, 2026. Specs only. Adds no tools.
**Charter:** [spec-v1600](spec-v1600.md). **Extends:** [spec-v1517](spec-v1517.md) (refresh
builders) and the [spec-v1501](spec-v1501.md) §2 data contract.

## The datasets

| Dataset | Used by | Route | Refresh and its trap |
|---|---|---|---|
| USPSTF A and B recommendations (population, grade, issue date, verbatim text, status) | `preventive-owed`, `preventive-cost-share-check`, `carin-eob-reader` | A (Prevention TaskForce API) or B (list page), per [spec-v1601](spec-v1601.md) | Weekly. Trap: a recommendation that changed grade keeps its topic name, so the key is the topic plus its issue date, and a grade change is its own row with its own one-year clock. |
| Preventive code map (the HCPCS and ICD-10 codes that identify each USPSTF service on a claim) | `carin-eob-reader` | B | Yearly, with the code-set updates. Codes only. Trap: many services share codes with diagnostic use, so a match is a flag to check, never a finding. |
| IRS HSA safe-harbor lists (Notices 2004-23, 2019-45) and the direct primary care fee limits | `hsa-predeductible-check`, `dpc-hsa-check` | B | Page watch on irs.gov. Trap: the fee limit indexes yearly and lapses on January 1. |
| CMS-0057-F prior-authorization metrics, by payer and market | `pa-metrics-compare` | B, curated yearly | Payers post the reports on their own sites, in their own formats, by March 31. One curation pass a year (April–May): each row cites the payer's URL and the date read, and carries the payer's figures as posted. Trap: a payer that reports a rate without the counts is carried as a rate, never back-computed. |
| WISeR code list, states and postponements | `medicare-ffs-pa-required` | B | Page watch on the CMS model page and the Federal Register. |
| Transparency in Coverage schemas | `tic-file-check`, `tic-rate-lookup` | A (CMSgov GitHub releases) | Watch releases; pin the version; gate the next. |
| CARIN Blue Button profiles | `carin-eob-reader` | A (HL7 package registry) | Pin a published version. |

Each B dataset gets a row in `pa-staleness-ledger.json` in the same change that adds it,
with the source URL and a `validThrough` date, so `check-pa-staleness` guards it.

## The one human task each year

The prior-authorization metrics can't be fetched: there is no central file, and each
payer posts its own page or PDF. The maintainer's yearly job for this program is one
curation pass after March 31: read each included payer's report and enter its figures.
The table starts with the largest payers in each market (the ones KFF's analysis covered)
and grows only by adding rows with sources. A payer that doesn't post is recorded as
"not found on [date]," with the URL checked. That row is itself information.

If CMS ever publishes the metrics centrally, the dataset moves to route A and the curation
pass ends.

## Open exports

A dataset curated for a tool here is useful beyond it. Every dataset this program adds is
also published as a versioned download from the site, under the same terms as its sources
(US government works; CC-BY-4.0 for our own curation, matching the sibling research
datasets), with:

- one row per fact, each with its source URL and the date it was read;
- a changelog between versions;
- no data about any person, ever.

A researcher, journalist, state regulator or another free tool can use the prior-
authorization metrics table without scraping 100 payer sites. That serves the charter
more than any single tool does.

## Agents

Every tool in this program is exposed through the MCP server in the same change
([spec-v627](spec-v627.md)), with the file-reading tools taking the file path on the
reader's own machine. An agent helping a patient with a bill gets the same cited,
deterministic answer the page gives, and the file never leaves the reader's machine.

## Tests

- Each dataset: a shape test, a staleness-ledger row, and the negative test from
  [spec-v1500](spec-v1500.md) (clock past expiry, tool asks instead of answering).
- USPSTF: a grade change produces two rows with separate clocks.
- Metrics: a row without a source URL fails the build.
- Exports: the published download is byte-identical to the bundled dataset of the same
  version.

## Build status

- **Not yet built.**
