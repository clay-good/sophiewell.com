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

### v4 datasets (spec-v4 §4)

Live-fetch builders are deferred to CI. In the dev checkout these datasets
ship with hand-curated, deterministic offline seeds. Fetch URLs below are
the canonical sources.

| Dataset                  | Source URL                                                                                                  | Agency                | Status                            | Cadence       |
|--------------------------|-------------------------------------------------------------------------------------------------------------|-----------------------|-----------------------------------|---------------|
| hcpcs-modifiers          | https://www.cms.gov/medicare/coding-billing/healthcare-common-procedure-system                              | CMS                   | public domain                     | annual        |
| pos-codes                | https://www.cms.gov/medicare/coding-billing/place-of-service-codes                                          | CMS                   | public domain                     | as-needed     |
| tob-codes                | https://www.nubc.org/                                                                                       | NUBC (numeric)        | numeric facts with attribution    | as-needed     |
| revenue-codes            | https://www.nubc.org/                                                                                       | NUBC (numeric)        | numeric facts with attribution    | as-needed     |
| nubc-special-codes       | https://www.nubc.org/                                                                                       | NUBC (numeric)        | numeric facts with attribution    | as-needed     |
| drg                      | https://www.cms.gov/medicare/payment/prospective-payment-systems/acute-inpatient-pps                        | CMS                   | public domain                     | annual        |
| apc                      | https://www.cms.gov/medicare/medicare-fee-for-service-payment/hospitaloutpatientpps                         | CMS                   | public domain                     | quarterly     |
| icd10-pcs                | https://www.cms.gov/medicare/coding/icd10                                                                   | CMS                   | public domain                     | annual        |
| rxnorm                   | https://www.nlm.nih.gov/research/umls/rxnorm/                                                               | NLM                   | public domain                     | monthly       |
| dmepos                   | https://www.cms.gov/medicare/medicare-fee-for-service-payment/dmeposfeesched                                | CMS                   | public domain                     | quarterly     |
| clfs                     | https://www.cms.gov/medicare/medicare-fee-for-service-payment/clinicallabfeesched                           | CMS                   | public domain                     | quarterly     |
| asp                      | https://www.cms.gov/medicare/medicare-part-b-drug-average-sales-price/asp-pricing-files                     | CMS                   | public domain                     | quarterly     |
| asc                      | https://www.cms.gov/medicare/medicare-fee-for-service-payment/ascpayment                                    | CMS                   | public domain                     | quarterly     |
| wage-index               | https://www.cms.gov/medicare/payment/prospective-payment-systems/acute-inpatient-pps/wage-index             | CMS                   | public domain                     | annual        |
| gpci                     | https://www.cms.gov/medicare/payment/fee-schedules/physician/pfs-relative-value-files                       | CMS                   | public domain                     | annual        |
| cms-deductibles          | https://www.cms.gov/newsroom/fact-sheets                                                                    | CMS                   | public domain                     | annual        |
| irmaa                    | https://www.ssa.gov/medicare/lis/income-limits                                                              | CMS / SSA             | public domain                     | annual        |
| aca-thresholds           | https://www.cms.gov/cciio/resources/regulations-and-guidance                                                | CMS / HHS             | public domain                     | annual        |
| hsa-fsa-limits           | https://www.irs.gov/                                                                                        | IRS                   | government work                   | annual        |
| fpl                      | https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines                                    | HHS / ASPE            | public domain                     | annual        |
| irs-mileage              | https://www.irs.gov/tax-professionals/standard-mileage-rates                                                | IRS                   | government work                   | annual        |
| dea-rules                | https://www.deadiversion.usdoj.gov/                                                                         | DEA                   | public domain                     | static        |
| nucc-taxonomy            | https://nucc.org/index.php/code-sets-mainmenu-41/provider-taxonomy-mainmenu-40                              | NUCC                  | public domain                     | semi-annual   |
| acip-routine-adult       | https://www.cdc.gov/vaccines/hcp/imz-schedules/adult-age.html                                               | CDC ACIP              | public domain                     | annual        |
| acip-routine-child       | https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-age.html                                    | CDC ACIP              | public domain                     | annual        |
| acip-catchup             | https://www.cdc.gov/vaccines/hcp/imz-schedules/child-catchup.html                                           | CDC ACIP              | public domain                     | annual        |
| yellow-book              | https://wwwnc.cdc.gov/travel/yellowbook                                                                     | CDC                   | public domain                     | annual        |
| tetanus                  | https://www.cdc.gov/tetanus/clinicians.html                                                                 | CDC                   | public domain                     | annual        |
| rabies-pep               | https://www.cdc.gov/rabies/medical_care/index.html                                                          | CDC                   | public domain                     | annual        |
| bbp-exposure             | https://www.cdc.gov/niosh/topics/bbp/emergnedl.html                                                         | CDC                   | public domain                     | annual        |
| tb-tst-igra              | https://www.cdc.gov/tb/topic/testing/diagnosingltbi.htm                                                     | CDC                   | public domain                     | annual        |
| sti-screening            | https://www.cdc.gov/std/treatment-guidelines/screening-recommendations.htm                                  | CDC                   | public domain                     | annual        |
| lab-ranges-adult         | https://medlineplus.gov/lab-tests/                                                                          | NIH / NLM             | public domain                     | annual        |
| lab-ranges-peds          | https://medlineplus.gov/lab-tests/                                                                          | NIH / NLM             | public domain                     | annual        |
| therapeutic-drug-levels  | https://dailymed.nlm.nih.gov/                                                                               | NLM DailyMed / FDA    | public domain                     | quarterly     |
| tox-levels               | https://wiser.nlm.nih.gov/                                                                                  | NLM WISER (HHS)       | public domain                     | annual        |
| cms-1500-fields          | https://www.cms.gov/medicare/billing/electronicbillingeditrans/15claimform                                  | CMS (project orig.)   | MIT, original                     | annual        |
| ub04-fields              | https://www.cms.gov/medicare/billing/electronicbillingeditrans/ub04form                                     | CMS (project orig.)   | MIT, original                     | annual        |
| eob-glossary             | project author original content                                                                             | sophiewell.com        | MIT, original                     | static        |
| medicaid-state           | state Medicaid agency files (numeric thresholds only)                                                       | state agencies        | numeric facts with attribution    | semi-annual   |
| va-eligibility           | https://www.va.gov/health-care/eligibility/                                                                 | VA                    | public domain                     | annual        |
| tricare-plans            | https://www.tricare.mil/Plans                                                                               | DHA TRICARE           | public domain                     | annual        |
| ihs-eligibility          | https://www.ihs.gov/forpatients/faq/                                                                        | IHS                   | public domain                     | annual        |
| dot-erg                  | https://www.phmsa.dot.gov/hazmat/erg/emergency-response-guidebook-erg                                       | PHMSA / DOT           | public domain                     | per-edition   |
| niosh-pg                 | https://www.cdc.gov/niosh/npg/                                                                              | CDC NIOSH             | public domain                     | per-edition   |
| tccc                     | https://www.deployedmedicine.com/                                                                           | CoTCCC (public)       | numeric facts with attribution    | annual        |
| cpr-aha-numeric          | https://cpr.heart.org/                                                                                      | AHA (numeric only)    | numeric facts with attribution    | per-edition   |
| mme-factors              | https://www.cdc.gov/opioids/healthcare-professionals/prescribing/guideline.html                             | CDC                   | public domain                     | per-revision  |
| steroid-equiv            | standard pharmacology references                                                                            | sophiewell.com        | MIT, original                     | static        |
| benzo-equiv              | https://www.benzo.org.uk/manual/                                                                            | Ashton (public)       | numeric facts with attribution    | static        |
| abx-renal                | FDA labels via DailyMed                                                                                     | FDA / NLM DailyMed    | public domain                     | quarterly     |
| vasopressor-doses        | FDA labels                                                                                                  | FDA                   | public domain                     | annual        |
| tpn-rules                | standard nutrition references                                                                               | sophiewell.com        | MIT, original                     | annual        |
| iv-to-po                 | FDA labels                                                                                                  | sophiewell.com        | MIT, original                     | annual        |
| drug-recalls             | https://api.fda.gov/drug/enforcement.json                                                                   | FDA                   | public domain                     | weekly        |
| vaccine-lot-recalls      | https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts                                         | FDA / CDC             | public domain                     | as-issued     |

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
