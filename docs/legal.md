# Legal and Data Sourcing Posture

This section is non-negotiable. Every dataset bundled in the application must
satisfy one of the following: it is in the public domain, it is published by
a United States government agency without copyright restriction, it is a
mathematical formula or fact (which cannot be copyrighted), or it is licensed
under terms that permit redistribution in an MIT-licensed open-source project.

## Confirmed Safe to Bundle

ICD-10-CM. Published by the National Center for Health Statistics and the
Centers for Medicare and Medicaid Services. Public domain. Annual release.
Bundle the current fiscal year tabular list and the alphabetic index.
Citation: https://www.cms.gov/medicare/coding-billing/icd-10-codes

HCPCS Level II. Published by CMS. Public domain. Quarterly release.
Citation: https://www.cms.gov/medicare/coding-billing/healthcare-common-procedure-system

Medicare Physician Fee Schedule. Published by CMS. Public domain. Annual
release with mid-year corrections.
Citation: https://www.cms.gov/medicare/payment/fee-schedules/physician

NADAC. National Average Drug Acquisition Cost. Published by CMS. Public
domain. Weekly release.
Citation: https://data.medicaid.gov/dataset/nadac-national-average-drug-acquisition-cost

NDC Directory. Published by the FDA. Public domain. Daily release.
Citation: https://www.fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory

NPI Registry (compact subset). Published by CMS. Public domain. Monthly
release.
Citation: https://download.cms.gov/nppes/NPI_Files.html

Place of Service codes, Modifier codes, Revenue codes, Claim Adjustment
Reason Codes (CARC), Remittance Advice Remark Codes (RARC). Published by CMS
and X12. Public domain reproductions of code lists.

NCCI Procedure-to-Procedure edits. Published by CMS. Public domain.
Quarterly release.

MUE (Medically Unlikely Edits). Published by CMS. Public domain. Quarterly
release.

LCD and NCD coverage articles. Published by CMS. Public domain.

OIG Exclusions List. Published by HHS Office of the Inspector General.
Public domain. Monthly release.

Medicare Opt-Out List. Published by CMS. Public domain. Monthly release.

Hospital price transparency files. Published by individual hospitals under
federal regulation. Each hospital's machine-readable file is a federal
compliance disclosure. We bundle a curated subset and document the source
URL and date for each. Coverage is intentionally partial; the README is
honest about coverage.

Glasgow Coma Scale. Published by Teasdale and Jennett, The Lancet, 1974.
The scale itself is a clinical fact and the scoring is mechanical. We
display the scoring with full citation.

APGAR. Published by Virginia Apgar, 1953. Public domain by age and standard
practice.

Wells score for PE and DVT. Published clinical scoring rules. We compute
the score deterministically and cite the original publication.

CHA2DS2-VASc and HAS-BLED. Published clinical scoring rules. Citations
included.

NIH Stroke Scale. Published by the National Institutes of Health. Public
domain.

CKD-EPI 2021 (race-free) eGFR equation. Published equation. Public
mathematical formula, fully citable.

Cockcroft-Gault. Published equation, 1976. Public formula.

QTc correction formulas (Bazett, Fridericia, Framingham, Hodges). Public
mathematical formulas.

## Restricted Items, Handled With Care

### CPT (American Medical Association)

CPT codes are owned by the AMA. The AMA holds copyright on the official CPT
code descriptors and aggressively enforces it. We will not bundle the AMA
CPT codeset or its descriptors.

The CPT Code Reference utility operates as follows: when the user enters a
five-digit numeric code, the application checks whether the code is in our
bundled HCPCS Level II set. If not, it checks the bundled Medicare Physician
Fee Schedule, which lists CPT codes by number with their RVU components but
without the AMA descriptor. We display only the structural information that
CMS publishes (status code, global period, work RVU, practice expense RVU,
malpractice RVU, calculated Medicare payment), plus an original short
plain-English category summary written by the project author. We display a
link to the AMA's free public CPT lookup tool with the code prefilled. We
do not display AMA-copyrighted descriptors anywhere in the application.

A CI grep check rejects strings that closely match a private hash list of
known AMA descriptor n-grams. This is a soft check intended to catch
accidental paraphrase.

### Original Plain-English Category Summaries (project author)

The project author writes original short summaries describing categories of
CPT codes, organized by code range or family. Examples: the 99201 to 99215
evaluation and management family, the 9921x established patient subset, the
70000-series radiology family, the 80047 to 89398 pathology and laboratory
family, the 90281 to 99607 medicine family, and the 99100 to 99140
anesthesia modifier family.

These summaries are the author's own creative work, MIT-licensed. They
describe the category in everyday language without paraphrasing the AMA
descriptors. They are stored in `data/cpt-summaries/summaries.json`. A
reviewer should periodically check that no summary substantially resembles
an AMA descriptor.

### AGS Beers Criteria (American Geriatrics Society)

The AGS publishes the Beers Criteria, which lists drug-condition pairs to
avoid in older adults. The drug-condition pairs themselves are clinical
facts, but the published formatting and rationale text are AGS copyrighted.
We bundle the underlying drug-condition pairs and write our own brief,
original notes for each. We display an attribution line linking to the AGS
publication.

### ISMP High-Alert Medications

ISMP publishes a high-alert medication list. The list of medications is
factual; we bundle the medication identities and write our own brief,
original notes about why each is high-alert. We display attribution to ISMP.

### ASA Physical Status

The ASA publishes Physical Status classifications. The category labels are
short and largely factual. We display only the category number and our own
original short summary, with a link to the ASA's published reference.

### AHA ECC Guidelines (spec-v3)

The American Heart Association holds copyright on the published ECC
guidelines documents and the associated algorithm flowcharts. The
underlying numeric facts (drug doses, drug intervals, defibrillation
energy levels) are not copyrightable. The site reproduces only the
numeric reference values, with explicit attribution to the AHA
guideline edition. The site does not reproduce the AHA algorithm
flowcharts or their narrative text.

The bundled data lives in `data/aha-reference/aha-reference.json`
with `status: numeric-facts-with-attribution` declared in the
manifest. The data file's `attribution` field reads: "Numeric facts
only (drug doses, intervals, energy levels). The AHA holds copyright
on the published flowcharts; consult the AHA publication for the
authoritative algorithm." A CI test
(`test/unit/aha-no-flowchart.test.js`) greps the payload for known
AHA flowchart phrases and fails the build if any match.

### Broselow-Luten color-band system (spec-v3)

Vital Signs holds licensing on the specific color-band-to-equipment
mapping and the published Broselow tape itself. The underlying
weight-to-dose math is not licensed. The Pediatric Weight-to-Dose
Calculator (utility 64) operates in straight kilograms and never
references the Broselow color bands or equipment lists. Users
referencing a tape locally may apply their tape's color-band weight
range to the calculator inputs externally.

### CDC, ATSDR, FDA, NIH (spec-v3)

CDC publications (Field Triage Guidelines, ATSDR toxicological
profiles), FDA labeling (DailyMed), and NIH/NINDS materials are
public-domain US government works. The site bundles compact subsets
where useful, with source URLs and fetch dates recorded per
manifest.

### Wilderness Medical Society (spec-v3)

The WMS publishes practice guidelines for hypothermia, heat illness,
and other environmental conditions. The underlying staging criteria
(core temperature bands, vital sign findings) are clinical facts
and are not subject to copyright. The site bundles the underlying
stage criteria with original brief notes by the project author and
attribution to the WMS guidelines.

## License of This Project

The project source and the project's original written content are licensed
under the MIT License. See `LICENSE` in the repository root.

The bundled datasets retain their public-domain or original status. Where a
dataset is reproduced from a government source, no additional license is
asserted by this project on the data; the upstream public-domain status
controls.

The original plain-English category summaries authored for this project are
MIT-licensed alongside the source code.

## Disclaimer

sophiewell.com provides reference information and computed math from public
data. It is not medical, legal, or financial advice. It does not replace
clinician judgment, institutional protocols, professional billing review, or
legal counsel. Verify all values against authoritative sources before
relying on them for any decision. The MIT License limitations of liability
apply to the software and to all bundled content authored by the project.

## v4 posture additions

spec-v4 adds 50+ datasets. Every dataset's `manifest.json` declares its
licensing posture with one of these explicit values:

- **`public-domain`** -- US government work (CMS, FDA, CDC, NLM, NIH,
  HHS, DEA, NUCC, PHMSA / DOT, NIOSH, VA, DHA, IHS, SSA). Bundled in
  full subject to size constraints. No attribution needed for legal
  reasons but every utility shows the source label per spec-v2.
- **`government-work`** -- IRS-published rates and notices. Same
  treatment as public-domain.
- **`numeric-facts-with-attribution`** -- numeric values from sources
  whose published prose is restricted (NUBC manuals, AHA flowcharts,
  Ashton manual, CoTCCC). The `cpr-aha-numeric` and `aha-reference`
  datasets specifically carry only the numeric AHA values; the
  flowchart imagery and prose are NOT reproduced. The
  `aha-no-flowchart` test enforces this on every commit.
- **`mit-original`** -- original plain-English summaries authored by
  the project (cpt-summaries, cms-1500-fields, ub04-fields,
  eob-glossary, steroid-equiv, tpn-rules, iv-to-po). MIT-licensed
  along with the rest of the source.

**Forbidden bundling** (linked rather than bundled, per spec-v4 §3):
- AMA CPT descriptors. Only structural Medicare data + project-original
  category summaries; the AMA's free public CPT lookup is linked.
- SNOMED CT in full.
- AHA algorithm flowcharts.
- LOINC at scale (deferred to v4.5+ pending license review).
- Broselow color bands.
- MoCA full instrument.

The spec-v3 AHA non-derivation posture extends to spec-v4: the
`cpr-aha-numeric` dataset is numeric-facts-only, attributed to the AHA
ECC guideline edition, and tested for forbidden flowchart prose by
`test/unit/aha-no-flowchart.test.js`.
