# spec-v1515 — File workbenches: remittance, claim, eligibility, status and price files

**Status:** Proposed, September 25, 2026. 7 new tools, group P.
**Charter:** [spec-v1500](spec-v1500.md). **Machinery:** [spec-v1501](spec-v1501.md) §3 (upload workbench), §6 (licensing).

A small practice or a rural hospital's billing office gets its remittances, claim
acknowledgments and eligibility responses as X12 text files and reads them through
whatever its clearinghouse shows. Reading those files, checking that they balance and
turning them into a spreadsheet is what paid tools sell. These run in the browser, on
the reader's own files, with nothing uploaded.

## The licensing line

| May do | May not do |
|---|---|
| Parse segments, elements, loops and delimiters (structure is a fact) | Ship X12 implementation-guide text |
| Show a code's value (`CO-45`, `N130`, EB01 `C`) | Ship X12's descriptions of those codes, or its labels for internal lists |
| Label things in our own words ("Deductible", "Plan paid") | Paraphrase X12 descriptions (the X12 FAQ treats altered descriptions as infringing too) |
| Cite the public CMS and MAC companion guides for layout | |

Our labels are written from the companion guides' plain meaning and reviewed against
this table before each tool ships.

## Tools

### 1. `x12-835-reader` — Remittance File (835) Reader

**Input.** One or more 835 files.
**Compute.** Parses the envelope and every claim and service line. It checks, at three
levels (service line, claim, and the whole payment), that billed = paid +
adjustments, using the same arithmetic as `era-balance`. It pulls the reassociation
fields (the trace number and the payment amount and date) so a deposit can be matched
to its remittance.
**Output.** A claim table (patient account, billed, paid, patient responsibility,
adjustments by group and reason code), any balancing failures with the segment where
they occur, and a CSV. The redacted CSV drops names and member IDs.

### 2. `x12-837-check` — Claim File (837P / 837I) Structure Check

**Input.** An 837 professional or institutional file.
**Compute.** Envelope integrity (the interchange, group and transaction counts match
their trailers), NPI check digits (reusing `npi-validate`), ICD-10-CM code validity
(reusing `icd10-validate`), MBI format (reusing `mbi-validate`), date logic (service
dates not in the future, admission before discharge), and that each claim's total
charge equals the sum of its lines.
**Output.** Findings per claim with the segment position, and a count of clean and
failing claims.
**Scope.** Structural and arithmetic checks only. It doesn't apply any payer's edits
or the implementation guide's situational rules, and it says so.

### 3. `x12-271-reader` — Eligibility Response (271) Reader

**Input.** A 271 file (or a pasted one).
**Compute.** Active or inactive coverage and its dates, plan and group identifiers, and
each benefit segment's coverage level, service type, time period, amount or percent,
and in- or out-of-network flag, all rendered with our own labels.
**Output.** A plain summary ("Individual deductible, in network: $1,500 for the calendar
year; $1,112.40 remaining") and a table of every benefit line with its raw codes beside
our label, so the reader can check.

### 4. `x12-277-reader` — Claim Status and Acknowledgment (277 / 277CA) Reader

**Input.** A 277 or 277CA file.
**Compute.** Each claim's status category and status code values, the entity the status
applies to, and the effective date.
**Output.** Accepted and rejected claims as a list, with the rejections first and the
raw codes shown. There's no code description text; each row links to x12.org/codes.

### 5. `hpt-file-check` — Hospital Price Transparency File Check

**Input.** A hospital's machine-readable file (CSV "tall", CSV "wide" or JSON).
**Compute.** Validates against the CMS data dictionary, **version 3.0**: required header
elements (including the 2026 attestation statement and attester name), required
columns, value types, and the new items from the CY2026 OPPS rule (Type 2 NPIs, and the
median, 10th and 90th percentile allowed amounts with their count). The files are
parsed as streams, so a multi-gigabyte file is checked without loading it whole. The
50 MB workbench limit doesn't apply to this tool; its own limit is stated on the page.
**Output.** Pass, or each error with its row and column, in the same categories the CMS
validator uses.
**Data.** The schema is a route A dataset: the refresh job watches the `CMSgov/
hospital-price-transparency` repository's releases ([spec-v1517](spec-v1517.md)).
**Dates.** The v3.0 items were effective January 1, 2026, with CMS enforcement from
April 1, 2026.

### 6. `hpt-price-compare` — Compare One Service Across Hospital Price Files

**Input.** Two or more hospital price files, and a billing code (HCPCS, CPT, MS-DRG,
revenue code) the reader supplies.
**Compute.** Each file's gross charge, discounted cash price, and payer-specific
negotiated rates for that code, including the percentile allowed amounts where the
file has them.
**Output.** A side-by-side table and a CSV. This helps a self-pay patient's advocate,
or a benefits team comparing sites of care, using public files the reader downloaded.

### 7. `pas-bundle-check` — Prior Authorization FHIR Bundle Check (Da Vinci PAS)

**Input.** A FHIR prior-authorization request or response bundle (JSON).
**Compute.** Validation against the Da Vinci PAS StructureDefinitions (version 2.2.1)
and US Core 3.1.1 in the browser: cardinality, data types, fixed values, required slices
and the invariants the profiles define. Codes from X12, CPT and NUBC value sets are
checked for format only, because their lists can't be shipped.
**Output.** Errors and warnings with the element path.
**Who it's for.** Payer and provider developers building the Prior Authorization API
that CMS-0057-F requires from January 1, 2027. The guides are CC0, and the profiles are
a route A dataset pinned to a published version.

## Sources

- CMS, 835 Health Care Claim Payment/Advice Companion Guide (5010A1); the CMS index of
  Medicare fee-for-service companion guides.
- X12 code-list FAQ and licensing program pages (the licensing line above).
- `CMSgov/hospital-price-transparency` (Data Dictionary v3.0 and update guide); CMS
  `hpt-validator-tool`.
- HL7 Da Vinci Prior Authorization Support IG v2.2.1 (CC0); HL7 FHIR license page.
- CMS-0057-F fact sheet (API dates).

## Tests

- Fixture files built by hand from the public companion guides' examples, with every
  identifier synthetic. They include files with `~` and newline segment terminators,
  a non-default element separator, and a truncated file.
- `x12-835-reader`: a claim that balances only when a negative adjustment (a reversal)
  is included.
- `hpt-file-check`: a v2.2 file flagged for the missing v3.0 attestation; a streaming
  test over a synthetic 1 GB file generated in the test, not committed.
