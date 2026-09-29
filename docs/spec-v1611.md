# spec-v1611 — File recognition: what is this file?

**Status:** Proposed, September 29, 2026. Nothing built.
**Charter:** [spec-v1610](spec-v1610.md).

## What it produces

One pure function, `recognize(head, meta)`, in a new `lib/file-kinds.js`. It takes the
first bytes of a file (the **head**, at most 256 KB, read with `Blob.slice`, so a 20 GB
price file is recognized as fast as a 2 KB one) and the file's name and size, and returns:

```
{ kind, confidence: 'certain' | 'likely' | 'none', evidence: [..], tools: [..] }
```

`evidence` is the short list of facts that decided it, shown to the reader:
*"Starts with an ISA segment; ST01 is 835; GS08 is 005010X221A1."* `tools` comes from the
registry (§3). The function is pure, runs identically in the browser worker, in Node for
MCP ([spec-v1615](spec-v1615.md)) and in tests.

## 1. Order of checks

Checks run in this order; the first **certain** match wins. A **likely** match is kept
and the checks continue, and if two likely matches remain the result is `ambiguous`
with both, and the reader chooses ([spec-v1610](spec-v1610.md) rule 2).

1. **Container** (§4): zip, gzip. Unwrapped, then each member recognized on its own.
2. **Binary documents** by magic bytes: PDF (`%PDF-`), DOCX (a zip containing
   `word/document.xml`), PNG, JPEG, HEIC. These go to the packet linter only.
3. **Text encoding.** UTF-8 (with or without BOM) or UTF-16 by BOM. Anything else is
   `kind: 'binary-unknown'`.
4. **X12** (§2.1), then **XML** (§2.2), then **JSON / NDJSON** (§2.3), then **delimited
   text** (§2.4).
5. Nothing matched: `kind: 'unknown'`, with a description of what was seen (§5).

The file name and extension are **evidence, never a decider.** An `.835` file whose
contents are a CSV is a CSV, and the result says the extension disagreed.

## 2. The signature table

### 2.1 X12 (EDI)

Certain when the text begins (after whitespace) with `ISA` and the character at offset 3
is used as the element separator consistently through the fixed-width ISA segment (106
characters). The segment terminator is the character after ISA16. Then `GS` and `ST` are
read with those separators:

| ST01 | GS01 | GS08 version | kind | tools |
|---|---|---|---|---|
| 835 | HP | 005010X221A1 | `x12-835` | `x12-835-reader`, `denial-pattern-report`, `appeal-worklist`, `underpayment-check` |
| 837 | HC | 005010X222A1 | `x12-837p` | `x12-837-check` |
| 837 | HC | 005010X223A2 | `x12-837i` | `x12-837-check` |
| 837 | HC | 005010X224A2 | `x12-837d` | none yet; named as a dental claim |
| 271 | HB | 005010X279A1 | `x12-271` | `x12-271-reader` |
| 277 | HN | 005010X212 | `x12-277` | `x12-277-reader` |
| 277 | HN | 005010X214 | `x12-277ca` | `x12-277-reader` |
| 999 | FA | 005010X231A1 | `x12-999` | none; named as an acknowledgment |
| other | — | — | `x12-other` | none; the result names the transaction set number |

The 277 and 277CA share GS01 `HN`; GS08 tells them apart. Versions are from the CMS 835
and HETS 270/271 companion guides and the CGS Medicare companion guides; GS01 codes are
confirmed from payer companion guide samples. (One CGS guide misprints the 837P version
as `005010X22A1`; the recognizer matches the correct identifier only.) The identifiers are
facts, not guide text ([spec-v1501](spec-v1501.md) §6).
One file can carry several functional groups; each ST is counted and the result lists
them (*"3 remittance transactions"*).

### 2.2 XML

Parsed with the browser's `DOMParser` (which does not fetch external entities) on the
head only when the root element closes within it; otherwise the root element name and
namespace are read with a small tokenizer.

| Root and marker | kind | tools |
|---|---|---|
| `ClinicalDocument` in `urn:hl7-org:v3`, with the CCD template id `2.16.840.1.113883.10.20.22.1.2` | `ccda-ccd` | records → calculators ([spec-v1613](spec-v1613.md)) |
| `ClinicalDocument`, other C-CDA template ids | `ccda-other` | same, with the document type named |
| `HealthData` (Apple Health `export.xml`) | `apple-health-xml` | records → calculators, vitals only ([spec-v1613](spec-v1613.md) §2) |

**Apple Health export zip.** Apple publishes no specification of the layout. Developer
reports agree on `apple_health_export/` holding `export.xml`, `export_cda.xml`,
`workout-routes/` (GPX), `electrocardiograms/` (CSV) and, only when health records are
connected, `clinical-records/` with one FHIR JSON file per resource, referenced from
`ClinicalRecord@resourceFilePath` in `export.xml`. The recognizer therefore matches by
content, not path: a zip containing an XML member whose root is `HealthData` is an Apple
export wherever it sits and whatever the folder is called (folder names can be localized);
its FHIR JSON members are recognized one by one as `fhir-resource`. GPX and ECG members
are skipped and counted.
| any other XML | `xml-unknown` | none; the root element is named |

### 2.3 JSON and NDJSON

The head is scanned for top-level keys without parsing the whole file (a streaming
tokenizer that stops at depth 2). NDJSON is recognized when the first three non-empty
lines each parse as a JSON object.

| Evidence | kind | tools |
|---|---|---|
| `resourceType: "Bundle"` whose entries include `ExplanationOfBenefit` with a CARIN Blue Button profile in `meta.profile` | `fhir-carin-eob` | `carin-eob-reader` ([spec-v1602](spec-v1602.md)), planned |
| `resourceType: "Bundle"` containing a `Claim` or `ClaimResponse` with a Da Vinci PAS profile | `fhir-pas` | `pas-bundle-check`, planned |
| `resourceType: "Bundle"` or NDJSON containing `Observation`, `Patient`, `Condition` or `MedicationRequest` | `fhir-clinical` | records → calculators |
| a single FHIR resource (`resourceType` at top level, not Bundle) | `fhir-resource` | by resource type, as above |
| `hospital_name` and `standard_charge_information` | `hpt-json` | `hpt-file-check`; `hpt-price-compare`, planned |
| `reporting_entity_name` and `in_network` | `tic-in-network` | `tic-file-check`, `tic-rate-lookup` ([spec-v1604](spec-v1604.md)), planned |
| `reporting_entity_name` and `out_of_network` | `tic-allowed-amounts` | `tic-file-check`, planned |
| `reporting_entity_name` and `reporting_structure` | `tic-toc` | `tic-file-check`, planned (it lists the files the index names; it does not fetch them) |
| any other JSON | `json-unknown` | none; the top-level keys are named |

A FHIR bundle with a profile the table doesn't know is `likely`, not `certain`, and says
which profile it saw.

### 2.4 Delimited text (CSV and TSV)

The header row is parsed with `parseDelimited` ([spec-v1501](spec-v1501.md) §3) on the
head. Then, in order:

1. **Hospital price file.** Row 1 contains `hospital_name`, `last_updated_on` and
   `version`: `hpt-csv` (the CMS v3 layout puts the general data elements in rows 1–2 and
   the charge header in row 3). Certain.
2. **Column-mapped tools.** Every tool that takes a CSV through the upload workbench
   already declares its fields with synonyms. The header is scored against each tool's
   declaration: the number of required fields matched and the number of all fields
   matched. A tool is a match when **every required field** matches a column. One match
   is `likely` and runs after the reader confirms the column mapping (the workbench step
   that exists today). Several matches are listed in order of fields matched, and the
   reader picks. No match: `csv-unknown`, with the headers listed.

A CSV never skips the mapping confirmation. Recognition only chooses which tool's mapping
screen to open.

### 2.5 Publisher reference files

The publishers' own tables, so a reader can supply a newer or unexpired edition than the
bundle ([spec-v1614](spec-v1614.md) §6). Each is recognized by its header row or archive
member names, never by file name alone:

| Evidence | kind |
|---|---|
| A zip whose members include the CMS PPRRVU CSV (header with `HCPCS`, `MOD`, `WORK RVU`) | `reference-mpfs-rvu` |
| CSV header of the CMS OPPS Addendum B (`HCPCS Code`, `Status Indicator`, `APC`) | `reference-opps-addb` |
| CSV header of the NADAC file (`NDC Description`, `NDC`, `NADAC Per Unit`, `Effective Date`) | `reference-nadac` |
| The CMS NCCI PTP or MUE file layout (`Column 1`, `Column 2`, `Modifier`; or `MUE Values`, `MUE Adjudication Indicator`) | `reference-ncci-ptp`, `reference-mue` |

A reference file dropped alone opens nothing; the inventory says *"reference table,
edition X; drop it with the file it should be used for."* The exact header strings are
verified against the current files at build.

## 3. The registry

`lib/file-kinds.js` holds one table: each kind, its signature function, the tools that
accept it, whether each tool accepts **several files at once** (for example
`denial-pattern-report` and `appeal-worklist` over many 835s), and a synthetic sample file
path. Every tool with a file input declares the kinds it accepts in the same table.

**The registry gate** (a new `scripts/check-file-kinds.mjs`, run in `npm run lint`):

- every `type: 'file'` input in `views/` belongs to a tool that appears in the registry;
- every tool in the registry exists in the catalog;
- every kind has a sample under `tests/fixtures/file-kinds/` and a test that recognizes it;
- every planned tool named in the registry but not yet built is marked `planned`, and a
  file of that kind gets the message *"We recognize this file. The tool that reads it is
  planned and not built yet."* instead of silence.

## 4. Archives and folders

- **Zip.** Read with the central directory at the end of the file; members are inflated
  with the browser's `DecompressionStream('deflate-raw')` (available in all current
  browsers since 2023), so no library is added. Stored and deflate members only; others
  are listed as unsupported.
- **Gzip.** `DecompressionStream('gzip')`, streamed. Common for insurer price files
  (`.json.gz`).
- **Folders** are walked recursively (§1 of [spec-v1612](spec-v1612.md) covers how they
  arrive). Hidden files and system files (names starting with `.`, `__MACOSX/`,
  `Thumbs.db`, `desktop.ini`) are skipped and counted.
- **Limits, stated on the page:** 2,000 files per drop, 20 levels of nesting, and for
  archives a total uncompressed size of 4 GB and a compression ratio above 100:1 on any
  member treated as a zip bomb and refused with that reason. A limit reached is reported;
  the rest is never silently dropped.

## 5. When nothing matches

The reader gets what we saw and what we accept, never a bare "unsupported":

> *We couldn't identify `claims_sept.xlsx`. It's an Excel workbook, which we don't read.
> Save it as CSV and drop it again. We read: remittance (835), claim (837), eligibility
> (271) and claim-status (277) files; hospital and insurer price files; FHIR and C-CDA
> health records; CSV files for the tools listed here.*

Excel gets its own message because it is the most common case ([spec-v1500](spec-v1500.md)
rejected an XLSX parser; this spec keeps that).

## Tests

- One fixture per kind, recognized as `certain` (or `likely` for CSV), with the expected
  evidence strings.
- **Never guess:** a CSV whose headers satisfy two tools returns both; a JSON with no
  known keys returns `json-unknown` with its keys; an `.835` file containing CSV is a
  CSV with the extension disagreement noted.
- Head-only: a 2 GB synthetic TiC file is recognized from its first 256 KB in under a
  second in CI.
- Zip: a nested zip is unwrapped one level per pass up to the depth limit; a 1,000:1
  member is refused as a zip bomb.
- The same fixtures give byte-identical results through the Node path used by MCP.
