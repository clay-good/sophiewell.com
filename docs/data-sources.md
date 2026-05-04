# Data Sources

Every dataset bundled in sophiewell.com is listed here with its canonical
source URL, publishing agency, license or public-domain status, update
cadence, and shard layout. The build script `scripts/build-data.mjs` downloads
each source, verifies a SHA-256 hash, and emits the shards described below.

## ICD-10-CM

Source URL: https://www.cms.gov/medicare/coding-billing/icd-10-codes
Publishing agency: National Center for Health Statistics and Centers for
Medicare and Medicaid Services
Status: Public domain
Update cadence: Annual (fiscal year, October)
Shard layout: `data/icd10cm/shards/` alphabetic shards by first character.
`data/icd10cm/manifest.json` lists shards, record count, and per-shard
SHA-256 hashes.

## HCPCS Level II

Source URL: https://www.cms.gov/medicare/coding-billing/healthcare-common-procedure-system
Publishing agency: CMS
Status: Public domain
Update cadence: Quarterly
Shard layout: `data/hcpcs/hcpcs.json` (single file, fits under shard cap) plus
`data/hcpcs/manifest.json`.

## CPT (structural Medicare data only)

Source URL: derived from MPFS public files; see MPFS row.
Publishing agency: CMS for the structural data. The descriptors themselves
are owned by the American Medical Association and are NOT bundled. See
`legal.md`.
Status: CMS structural data is public domain. AMA descriptors are
copyrighted; not bundled.
Update cadence: Annual
Shard layout: `data/cpt-summaries/summaries.json` holds the project author's
original plain-English category summaries by code range. No AMA descriptors
appear anywhere in the repository.

## Medicare Physician Fee Schedule (MPFS)

Source URL: https://www.cms.gov/medicare/payment/fee-schedules/physician
Publishing agency: CMS
Status: Public domain
Update cadence: Annual with mid-year corrections
Shard layout: `data/mpfs/shards/` numeric shards by code range, plus
`data/mpfs/gpci.json` for locality-adjusted geographic practice cost indices
and `data/mpfs/conversion-factor.json` for the annual conversion factor.

## NADAC

Source URL: https://data.medicaid.gov/dataset/nadac-national-average-drug-acquisition-cost
Publishing agency: CMS
Status: Public domain
Update cadence: Weekly
Shard layout: `data/nadac/nadac.json` plus `data/nadac/manifest.json`.

## NDC Directory

Source URL: https://www.fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory
Publishing agency: FDA
Status: Public domain
Update cadence: Daily
Shard layout: `data/ndc/shards/` alphabetic shards by proprietary name.

## NPI Registry (compact subset)

Source URL: https://download.cms.gov/nppes/NPI_Files.html
Publishing agency: CMS
Status: Public domain
Update cadence: Monthly (full file); weekly deltas
Shard layout: `data/npi/shards/` state shards. Bundled subset is compact:
NPI, name, primary taxonomy, state, status. The full dataset is not
practical to bundle in a static page.

## Crosswalk codes

Place of Service codes, Modifier codes, Revenue codes, Claim Adjustment
Reason Codes (CARC), Remittance Advice Remark Codes (RARC).
Source URL: CMS publications and X12 external code lists.
Publishing agency: CMS, with X12 maintaining CARC and RARC.
Status: Public domain reproductions of code lists.
Update cadence: As published.
Shard layout: `data/crosswalks/pos-codes.json`,
`data/crosswalks/modifier-codes.json`, `data/crosswalks/revenue-codes.json`,
`data/crosswalks/carc.json`, `data/crosswalks/rarc.json`.

## NCCI Procedure-to-Procedure Edits

Source URL: https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits
Publishing agency: CMS
Status: Public domain
Update cadence: Quarterly
Shard layout: `data/ncci/ptp-edits.json` plus `data/ncci/manifest.json`.

## Medically Unlikely Edits (MUE)

Source URL: https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits/medicare-ncci-medically-unlikely-edits
Publishing agency: CMS
Status: Public domain
Update cadence: Quarterly
Shard layout: `data/mue/mue.json` plus `data/mue/manifest.json`.

## LCD and NCD coverage

Source URL: https://www.cms.gov/medicare-coverage-database/
Publishing agency: CMS
Status: Public domain
Update cadence: As published.
Shard layout: `data/coverage/lcd.json` and `data/coverage/ncd.json`.

## OIG Exclusions List

Source URL: https://oig.hhs.gov/exclusions/exclusions_list.asp
Publishing agency: HHS Office of the Inspector General
Status: Public domain
Update cadence: Monthly
Shard layout: `data/enforcement/oig-exclusions.json`.

## Medicare Opt-Out List

Source URL: https://data.cms.gov/provider-characteristics/medicare-provider-supplier-enrollment/opt-out-affidavits
Publishing agency: CMS
Status: Public domain
Update cadence: Monthly
Shard layout: `data/enforcement/medicare-opt-out.json`.

## Hospital Price Transparency

Source URL: each hospital's own machine-readable file under federal
regulation. Curated subset; URLs and dates are recorded per hospital in the
manifest.
Publishing agency: individual hospitals, under federal hospital price
transparency rule.
Status: Federal compliance disclosures. Bundling a curated subset is
permitted; coverage is intentionally partial.
Update cadence: Per hospital. We refresh quarterly.
Shard layout: `data/hospital-prices/hospitals/` one file per included
hospital. `data/hospital-prices/manifest.json` lists hospital identifier,
source URL, and fetch date.

## No Surprises Act rules

Source URL: https://www.cms.gov/nosurprises
Publishing agency: CMS, HHS, Treasury, Labor (joint)
Status: Public domain regulatory text and summaries.
Shard layout: `data/no-surprises/rules.json` (summaries with citations).

## State Patient Rights

Source URL: state attorney general publications and the National Consumer
Law Center where licensed for redistribution; otherwise summarized with
links.
Publishing agency: various state agencies and NCLC.
Status: Mixed; original summaries authored for items not licensed for
redistribution.
Shard layout: `data/state-rights/states.json`.

## Clinical reference data

`data/clinical/formulas.json` (citations only; computations live in `app.js`),
`data/clinical/pediatric-vitals.json`, `data/clinical/lab-ranges.json`,
`data/clinical/beers.json`, `data/clinical/ismp-high-alert.json`,
`data/clinical/asa-status.json`, `data/clinical/mallampati.json`.

Beers Criteria, ISMP High-Alert Medications, and ASA Physical Status are
handled per `legal.md`: the underlying facts are bundled with original notes
written by the project author; the authoritative formatted publications are
linked rather than reproduced.

Pediatric vital signs and lab reference ranges cite the source publication
inline. Lab-specific reference ranges supersede published ranges; the utility
states this on every view.

## Field Medicine datasets (spec-v3)

The following datasets serve the Group I (Field Medicine) utilities
introduced in spec-v3.

### CDC Field Triage Guidelines

Source URL: https://www.cdc.gov/mmwr/volumes/71/rr/rr7102a1.htm
Publishing agency: Centers for Disease Control and Prevention
Status: Public domain
Update cadence: As published
Shard layout: `data/field-triage/guidelines.json` plus
`data/field-triage/manifest.json`. The 4-step decision tree is
encoded as plain JSON; original prose summaries by the project author.

### START / JumpSTART MCI Triage Algorithms

Source URL: https://www.start-triage.com/ ; CHOC Children's Hospital
JumpSTART materials.
Publishing agency: Newport Beach Fire Department / Hoag Hospital
(START); CHOC Children's Hospital (JumpSTART).
Status: Public-domain MCI triage algorithms.
Shard layout: `data/mci-triage/algorithms.json` plus
`data/mci-triage/manifest.json`.

### FDA Prehospital Drug Labeling subset

Source URL: https://dailymed.nlm.nih.gov/
Publishing agency: FDA (DailyMed)
Status: Public domain
Update cadence: As needed (manual review)
Shard layout: `data/prehospital-meds/meds.json` plus
`data/prehospital-meds/manifest.json`. Twenty-two standard
prehospital medications with adult dose, pediatric dose, route,
and notes.

### AHA ECC Numeric Reference

Source URL: AHA ECC 2020 guidelines (numeric reference values only).
Publishing agency: American Heart Association.
Status: Numeric facts (drug doses, intervals, energy levels) with
attribution. AHA flowcharts are NOT reproduced.
Update cadence: Per AHA guideline edition.
Shard layout: `data/aha-reference/aha-reference.json` plus
`data/aha-reference/manifest.json`. The manifest declares
`status: numeric-facts-with-attribution`. A CI test
(`test/unit/aha-no-flowchart.test.js`) guards the payload against
AHA flowchart language patterns.

### CDC ATSDR Toxidrome Reference

Source URL: https://www.atsdr.cdc.gov/toxprofiledocs/index.html
Publishing agency: CDC Agency for Toxic Substances and Disease
Registry.
Status: Public domain (project-author original brief notes per
toxidrome).
Shard layout: `data/toxidromes/toxidromes.json` plus
`data/toxidromes/manifest.json`.

### Environmental staging reference

Source: Wilderness Medical Society practice guidelines and standard
medical literature.
Publishing agency: WMS / standard literature.
Status: Public formulas and original brief notes by the project
author.
Shard layout: `data/environmental/environmental.json` plus
`data/environmental/manifest.json`. Hypothermia and heat-illness
staging tables.

### EMS PCR run-type checklists

Source: project-author original templated checklists.
Publishing agency: sophiewell.com (Clay Good).
Status: MIT-licensed original content.
Shard layout: `data/workflow/ems-runtypes.json` (no manifest;
loaded directly by the EMS Documentation Helper view per spec-v3
section 5.1).

## Manifests

Each dataset folder contains a `manifest.json` with at minimum: source URL,
fetch date, source SHA-256, record count, and per-shard SHA-256 hashes. The
runtime verifies the manifest hash on first read of any shard.
