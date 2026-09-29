# spec-v1620 — Build plan: honest data, file intake, and the public-utility tools

**Status:** Build plan, September 29, 2026. Specs only; the next session builds from this
page.
**Implements:** the design specs [spec-v1600](spec-v1600.md)–[spec-v1605](spec-v1605.md)
(public-utility tools) and [spec-v1610](spec-v1610.md)–[spec-v1615](spec-v1615.md) (file
intake and data truth), through the build specs
[spec-v1621](spec-v1621.md)–[spec-v1626](spec-v1626.md).

## What gets built, in one table

| Milestone | Build spec | What the reader gets when it lands | Size |
|---|---|---|---|
| **M1** Honest labels | [v1622](spec-v1622.md) | every data label is true; expired data can't answer; one freshness list | 5 PRs |
| **M2** Real refresh | [v1621](spec-v1621.md) | federal tables fetched weekly, checked, auto-merged when clean, a public freshness issue | 1 PR for the modules, then 1 PR per dataset (6) and 1 for the workflow |
| **M3** Drop a file | [v1623](spec-v1623.md) | the home page reads any supported file, folder or zip and runs the right tool | 5 PRs |
| **M4** Receipts | [v1625](spec-v1625.md) | every file result can be proved and re-checked; agents get the same tools over MCP | 5 PRs |
| **M5** Records to calculators | [v1624](spec-v1624.md) | a patient's downloaded record fills the prevention, kidney and liver calculators | 5 PRs |
| **M6** Public-utility tools | [v1626](spec-v1626.md) | the 14 tools and 1 backfill of v1601–v1604 | 5 shared-module PRs, then 1 PR per tool |

**Order:** M1 → M2 and M3 in parallel (they touch different files) → M4 → M5 → M6.
M6 tools that need no dataset (`preventive-cost-share-check`, `ma-criteria-check`,
`dpc-hsa-check`, `payer-policy-diff`) can start any time after M3.

## Constraints every milestone keeps

| Constraint | Where it's enforced |
|---|---|
| Static site on Cloudflare Workers static assets: no server, no runtime fetch beyond same-origin files | CSP `connect-src 'self'` (unchanged); the network-blocked e2e runs |
| 20,000 files per deploy (free plan), 25 MiB per file | `verify-integrity`: data budget 6,000 files, 20 MiB per file |
| Zero runtime dependencies; build scripts use Node built-ins only | `package.json` review; no new `dependencies` |
| No file a reader opens leaves the tab; no file-derived value in the URL or storage | [spec-v1612](spec-v1612.md), [spec-v1613](spec-v1613.md) e2e tests |
| Licensed text never ships (CPT descriptors, X12 guide text, NCPDP) | [spec-v1501](spec-v1501.md) §6; parse-time column drops in [spec-v1621](spec-v1621.md) |
| Every PR leaves `npm test`, `npm run lint`, `npm run test:e2e`, `npm run test:mcp` green | CI |

## Decisions the maintainer makes before or during the build

| Decision | Default until decided | Spec |
|---|---|---|
| Fetch the NCCI edit files and OPPS Addendum B automatically, which means automating past CMS's AMA click-through agreement | **Off.** Readers supply those files themselves; the tools say so | [spec-v1621](spec-v1621.md) §3.4 |
| Request a USPSTF API key | Not needed; the public A and B table is the source, with curated populations | [spec-v1621](spec-v1621.md) §3.6 |
| Pin the "Data freshness" issue | the workflow creates it; pinning is one click | [spec-v1621](spec-v1621.md) §5 |

## How to run the build sessions

1. Start each session in a fresh worktree from `origin/main`
   (`git worktree add .claude/worktrees/<name> origin/main`).
2. Open the milestone's build spec. Each step there is one PR-sized change with its own
   "Done when."
3. At the end of each step, update the build spec's own "Build status" section (add one
   if missing): what was built, what differed from the spec, what's still open. This is the
   [spec-v1388](spec-v1388.md) convention the catalog already follows.
4. When a milestone finishes, tick it in the table below.

## Progress

| Milestone | Status |
|---|---|
| M1 | built September 29, 2026 ([build status](spec-v1622.md#build-status)) |
| M2 | modules, `mpfs`, `drg`, `mue`, `nadac` and the workflow built September 29, 2026; `uspstf` and schema watches open ([build status](spec-v1621.md#build-status)) |
| M3 | built September 29, 2026 ([build status](spec-v1623.md#build-status)) |
| M4 | not started |
| M5 | not started |
| M6 | not started |

## What the research settled

Every "verify at build" item in the design specs that could be checked from public sources
was checked on September 29, 2026, and the answers are in the build specs:

| Question | Answer | Where |
|---|---|---|
| Where each CMS table lives, its file layout and canary values | resolved for the fee schedule, DRG, MUE, NCCI and Addendum B, by downloading each file | [v1621](spec-v1621.md) §3.1–3.4 |
| Whether CMS blocks scripts | it doesn't: plain requests get 200s | [v1621](spec-v1621.md) §5 |
| NADAC dataset discovery and paging | metastore title match; 5,000-row pages; latest week only | [v1621](spec-v1621.md) §3.5 |
| USPSTF data without a key | the public A and B table, 54 rows | [v1621](spec-v1621.md) §3.6 |
| Schema and FHIR package versions and how to watch them | HPT V3.0.0 (no tags); TiC 2.2.1 (tags); CARIN 2.2.0, PAS 2.2.1, US Core 9.0.0 | [v1621](spec-v1621.md) §3.7 |
| X12 version and functional group identifiers | confirmed from CMS and MAC companion guides | [v1611](spec-v1611.md) §2.1 |
| Apple Health export layout | no Apple specification; recognized by content, not path | [v1611](spec-v1611.md) §2.2 |
| Cloudflare limits and the build commit variable | 20,000 files, 25 MiB; `WORKERS_CI_COMMIT_SHA` | this page; [v1625](spec-v1625.md) |
| Whether the refresh can merge its own PR | yes: `main` is unprotected and the job has write permissions | [v1621](spec-v1621.md) §5 |

Still open, and each marked where it lives: the USPSTF key's parameter name (only if a key
is requested), the October 2026 Addendum B posting date, and the exact NADAC page-size cap
(the spec stays well under it).
