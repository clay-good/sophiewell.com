# Data Sources Used by the Build Pipeline

`scripts/build-data.mjs` reads from these canonical sources. See
`docs/data-sources.md` for the user-facing catalog and `docs/legal.md` for
licensing posture.

In the development checkout, `build-data.mjs` runs in offline mode by
default and writes a small curated seed set into `data/`. CI runs the
script with full network access to refresh the data folder.

| Dataset           | Source URL                                                                                                                              | Agency             | Status                            | Cadence       |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------|--------------------|-----------------------------------|---------------|
| icd10cm           | https://www.cms.gov/medicare/coding-billing/icd-10-codes                                                                                | CMS / NCHS         | public domain                     | annual        |
| hcpcs             | https://www.cms.gov/medicare/coding-billing/healthcare-common-procedure-system                                                          | CMS                | public domain                     | quarterly     |
| cpt-summaries     | project author original content (no AMA descriptors; see docs/legal.md)                                                                 | sophiewell.com     | MIT, original                     | as needed     |
| mpfs              | https://www.cms.gov/medicare/payment/fee-schedules/physician                                                                            | CMS                | public domain (structural data)   | annual        |
| nadac             | https://data.medicaid.gov/dataset/nadac-national-average-drug-acquisition-cost                                                          | CMS                | public domain                     | weekly        |
| ndc               | https://www.fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory                                                     | FDA                | public domain                     | daily         |
| npi               | https://download.cms.gov/nppes/NPI_Files.html                                                                                           | CMS                | public domain                     | monthly       |
| crosswalks        | CMS publications and X12 external code lists                                                                                            | CMS, X12           | public domain                     | as published  |
| ncci              | https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits                                               | CMS                | public domain                     | quarterly     |
| mue               | https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits/medicare-ncci-medically-unlikely-edits        | CMS                | public domain                     | quarterly     |
| coverage          | https://www.cms.gov/medicare-coverage-database/                                                                                          | CMS                | public domain                     | as published  |
| enforcement       | https://oig.hhs.gov/exclusions/exclusions_list.asp; https://data.cms.gov/provider-characteristics/medicare-provider-supplier-enrollment | HHS OIG; CMS       | public domain                     | monthly       |
| hospital-prices   | individual hospital machine-readable price files (curated subset)                                                                       | individual hospitals | federal compliance disclosures  | quarterly     |
| no-surprises      | https://www.cms.gov/nosurprises                                                                                                          | CMS / HHS / Tres / DOL | public domain regulatory text  | as published  |
| state-rights      | state attorney general publications and NCLC summaries                                                                                  | various; project   | mixed; original summaries         | as needed     |
| clinical          | published clinical literature (citations only; computations live in app.js)                                                             | various            | public formulas + original notes  | as needed     |
| field-triage      | https://www.cdc.gov/mmwr/volumes/71/rr/rr7102a1.htm                                                                                     | CDC                | public domain                     | as published  |
| mci-triage        | START (https://www.start-triage.com/), JumpSTART (CHOC Children\'s)                                                                     | public-domain MCI  | public domain                     | as published  |
| prehospital-meds  | FDA DailyMed labeling                                                                                                                   | FDA                | public domain                     | as needed     |
| aha-reference     | AHA ECC 2020 guidelines (numeric facts only; flowcharts not reproduced)                                                                 | AHA (numeric)      | numeric facts with attribution    | as published  |
| toxidromes        | CDC ATSDR toxicological profiles                                                                                                        | ATSDR / CDC        | public domain                     | as needed     |

## Hashes and confirmation

`scripts/expected-hashes.json` records the SHA-256 the project trusts for
each upstream source. On first encounter of a new source, `build-data.mjs`
writes the computed hash with `status: pending-confirmation` and halts
unless `--confirm-hashes` is passed. The maintainer reviews and accepts.

## Restricted material

The pipeline never writes AMA CPT descriptors. The CPT Code Reference
utility composes structural Medicare data (from `mpfs`) with the project
author's original plain-English category summaries (from `cpt-summaries`)
and a link to the AMA's free public CPT lookup tool. AGS Beers, ISMP, and
ASA materials are handled per `docs/legal.md`: the underlying facts are
bundled with original notes; the authoritative formatted publications are
linked rather than reproduced.
