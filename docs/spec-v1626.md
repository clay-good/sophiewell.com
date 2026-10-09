# spec-v1626 — Build: the public-utility tools

**Status:** Build spec, September 29, 2026. Implements the tools of
[spec-v1601](spec-v1601.md) through [spec-v1604](spec-v1604.md), whose own pages hold each
tool's input, compute, output and rules. This page holds only what the builder needs on
top: shared modules, file names, order and gates.
**Plan:** [spec-v1620](spec-v1620.md), milestone M6. **Depends on:** M1, M2 (the datasets
each tool reads), M3 (registry), M4 (receipts).

## Shared modules first

| Module | Extracted from or new | Used by |
|---|---|---|
| `lib/json-stream.js` | extract the private `JsonTokenizer` from `lib/hpt-stream-v1515.js` unchanged, and export it; `hpt-stream-v1515.js` imports it back | `hpt-file-check`, `tic-file-check`, `tic-rate-lookup`, `carin-eob-reader`, `lib/json-head.js` |
| `lib/medicare-reprice.js` | new, pure | `claims-pct-medicare`, `tic-rate-lookup`, `itemized-bill-check`: `repriceProfessional(code, mod, locality, pos, edition)`, `repriceOutpatient(code, edition)`, `repriceInpatient(drg, edition)`, each returning `{ amount, method, edition }` or `{ unpriced: reason }` |
| `lib/ncci-lookup.js` | new | `itemized-bill-check`: loads only the NCCI shards for the codes present, returns the same verdict object `Edit.ncciPtp` returns so the logic isn't duplicated |
| `lib/schema-check.js` | new | `tic-file-check`, `pas-bundle-check`, `carin-eob-reader`: a JSON Schema (draft 2020-12 subset the CMS schemas use) and FHIR StructureDefinition cardinality/type checker, run over `json-stream` events |
| `lib/preventive.js` | new, pure | `preventive-owed`, `preventive-cost-share-check`, `carin-eob-reader`, the record panel |

The extraction step is a pure refactor: `hpt-file-check`'s tests pass unchanged.

## Order and files

Each row is one pull request. Tool logic lives in `lib/<tool-id>.js` (the catalog's
pattern), the view in the group file named, the MCP adapter in `mcp/adapters/`, and each
file tool registers in `lib/file-kinds.js` and exports `acceptFiles`.

| # | Tool | Group file | Needs dataset | Notes |
|---|---|---|---|---|
| 1 | `preventive-owed` | `views/group-v1601.js` (new) | `uspstf` | verbatim text from the dataset; the one-year rule in `lib/preventive.js` |
| 1 | `preventive-owed` | Built October 3, 2026 ([spec-v1601](spec-v1601.md#build-status)) |
| 2 | `preventive-cost-share-check` | same | none | rules as data in `lib/preventive.js`, each with its CFR or FAQ citation |
| 3 | `hsa-predeductible-check` | same | `irs-hsa` (curated) | Notice 2019-45 list as curated rows |
| 4 | `ma-criteria-check` | `views/group-v1603.js` (new) | the Medicare Coverage Database export from [spec-v1505](spec-v1505.md) when built; until then the NCD/LCD answer is reader input | decision tree as data |
| 5 | `dpc-hsa-check` | `views/group-v1604.js` (new) | none (dated constant in the module's `DATED_TABLE`) | |
| 6 | `payer-policy-diff` | `views/group-v1502.js`, beside `pa-criteria-checklist` | none | reuses the checklist splitter; export it if it's private |
| 7 | `pa-metrics-compare` | `views/group-v1603.js` | `pa-metrics` (curated yearly) | |
| 8 | `carin-eob-reader` | `views/group-v1602.js` (new) | CARIN profiles, `preventive-codes` | file tool |
| 9 | `itemized-bill-check` | same | NCCI, MUE; the hospital's own price file (reader's) | two files: the bill CSV and the price file; the inventory pairs them when dropped together |
| 10 | `tic-file-check` | `views/group-v1604.js` | TiC schemas | file tool, streamed |
| 11 | `tic-rate-lookup` | same | TiC schemas, MPFS, OPPS, DRG | file tool, streamed; filters while streaming, holds only matches |
| 9 | `itemized-bill-check` | Built October 3, 2026, without NCCI pair edits ([spec-v1602](spec-v1602.md#build-status)) |
| 12 | `claims-pct-medicare` | same | MPFS, GPCI, OPPS, DRG | CSV workbench tool |
| 13 | `pharmacy-spread-check` | same | NADAC | CSV workbench tool; the batch mode of `pbm-reimbursement-check`'s arithmetic, imported, not copied |
| 14 | backfill `medicare-ffs-pa-required` (WISeR) | where [spec-v1502](spec-v1502.md) builds it | `wiser-codes` (curated) | |
| 15 | `patient-pa-record-reader` | `views/group-v1602.js` | PAS profiles | build-gated to 2027 ([spec-v1602](spec-v1602.md)); leave `planned` until then |

## Gates each tool meets before merge

The [spec-v1500](spec-v1500.md) acceptance list, and: a `META.example` and MCP adapter
example that round-trip; the registry gate; a receipt test; the expired-data negative
test for every dataset it reads; the catalog count surfaces moved
(`node scripts/check-catalog-truth.mjs`); the tool's spec page "Build status" updated in
the same PR with what was read and what differed from the plan.

## Build status

| # | Tool | Status |
|---|---|---|
| 2 | `preventive-cost-share-check` | Built September 29, 2026 ([spec-v1601](spec-v1601.md#build-status)) |
| 3 | `hsa-predeductible-check` | Built September 30, 2026 ([spec-v1601](spec-v1601.md#build-status)) |
| 14 | backfill `medicare-ffs-pa-required` (WISeR) | Built September 30, 2026 ([spec-v1502](spec-v1502.md#build-status)) |
| 7 | `pa-metrics-compare` | Built September 30, 2026, without the bundled market table ([spec-v1603](spec-v1603.md#build-status)) |
| 4 | `ma-criteria-check` | Built September 29, 2026 ([spec-v1603](spec-v1603.md#build-status)) |
| 5 | `dpc-hsa-check` | Built September 29, 2026 ([spec-v1604](spec-v1604.md#build-status)) |
| 6 | `payer-policy-diff` | Built September 29, 2026 ([spec-v1603](spec-v1603.md#build-status)) |
| 13 | `pharmacy-spread-check` | Built September 30, 2026 ([spec-v1604](spec-v1604.md#build-status)) |
| 10 | `tic-file-check` | Built October 2, 2026 ([spec-v1604](spec-v1604.md#build-status)) |
| 11 | `tic-rate-lookup` | Built October 2, 2026, professional rates only ([spec-v1604](spec-v1604.md#build-status)) |
| 8 | `carin-eob-reader` | Built October 2, 2026 ([spec-v1602](spec-v1602.md#build-status)) |
| 12 | `claims-pct-medicare` | Built October 2, 2026, professional lines only ([spec-v1604](spec-v1604.md#build-status)). **October 9, 2026:** hospital outpatient lines priced from the reader's own OPPS Addendum B ([spec-v1614](spec-v1614.md#build-status) §6), status indicators S, T and V only; inpatient lines stay out until IPPS base rates exist. |

`lib/json-stream.js` was extracted unchanged from `lib/hpt-stream-v1515.js` on October 1, 2026 (for
`hpt-price-compare`); `hpt-file-check`'s tests pass unchanged. `lib/schema-check.js` was added October 2, 2026 for `tic-file-check`:
the draft-07 subset the CMS schemas use, over whole values or a `json-stream` parser (the FHIR
StructureDefinition checks live in `lib/fhir-profile-check.js`, added for `pas-bundle-check` on October 3, 2026). `lib/medicare-reprice.js`
was added the same day for `tic-rate-lookup`: `repriceProfessional` prices from the bundled fee schedule;
`repriceOutpatient` and `repriceInpatient` return `unpriced` with the reason until full OPPS and IPPS base-rate
datasets exist. The other shared modules (`ncci-lookup`, `preventive`) are not extracted yet.
