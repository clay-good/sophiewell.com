# Design — Transplant allocation scores and ischemia clocks

No OPTN number appears in this file. The guides were not opened (HTTP 403 from both
optn.transplant.hrsa.gov mirrors, hrsa.gov and hrsa.unos.org on October 19, 2026, by two
fetchers; the in-app browser was offered a file download, which was declined). What follows is
the shape of each tool and the exact reading the build must do.

## Sources (all build gates)

| Source | Needed for |
|---|---|
| OPTN, *A Guide to Calculating and Interpreting the Kidney Donor Profile Index (KDPI)*, updated October 10, 2024 (hrsa.gov/sites/default/files/hrsa/optn/kdpi_guide.pdf) | every KDRI coefficient and reference point; the scaling factor (median KDRI) and its reference year; the KDPI mapping table; the worked example |
| OPTN, *A Guide to Calculating and Interpreting the Estimated Post-Transplant Survival (EPTS) Score*, updated April 21, 2025 (hrsa.gov/sites/default/files/hrsa/optn/epts_guide.pdf) | every EPTS coefficient; the mapping table; the worked example |
| OPTN Policies, policy 8 (kidney allocation), current edition | the 20% EPTS and the KDPI bands used in allocation (the guide states them; confirm in policy) |
| OPTN data definitions for cold ischemia time (the DonorNet / TIEDI field definitions) | tool 3's start and stop events |

## Tools

### 1. `kdri-kdpi` — Kidney Donor Risk Index and Profile Index (OPTN)

**Input.** The eight donor factors the October 2024 guide lists (expected from the refit: age,
height, weight, history of hypertension, history of diabetes, cause of death, serum creatinine,
donation after circulatory death; **confirm the list in the guide**).
**Compute.** As the guide prints: KDRI_rao = exp(Σ components), each component a coefficient
times a centered variable with the guide's reference points and piecewise terms (the age and
creatinine terms are piecewise in earlier editions); KDRI_median = KDRI_rao ÷ the scaling factor
(the median KDRI of the prior calendar year's reference population); KDPI = the percentile from
the guide's mapping table for that year.
**Output.** KDRI (scaled), KDPI as a percentage with the mapping table's year, the guide's
sentence on what the percentile means (the percent of recovered kidneys in the reference year
with a KDRI at or below this one), and the allocation band the policy uses once read.
**Data.** The mapping table and the scaling factor are a versioned data file fetched from the
guide (or the OPTN calculator's published table), hashed, with the year on screen; the weekly
watch compares the guide's hash and the tool fails closed on change until re-read (spec-v1501
§2, spec-v1614).
**Tests.** The guide's worked example reproduces to the printed KDRI and KDPI; a variable at
each piecewise breakpoint; an input outside the guide's range refused by name.
**Rule.** Nothing ships until the guide is read; the spec states no coefficient on purpose.

### 2. `epts-score` — Estimated Post-Transplant Survival Score (OPTN)

**Input.** Candidate age; years on dialysis (or dialysis start date and the offer date); current
diabetes (yes/no); prior solid organ transplant (yes/no).
**Compute.** Raw EPTS = the guide's linear combination (age centered on the guide's reference
age, dialysis years with its piecewise term, the two indicators and their interaction terms as
printed); EPTS percentage from the guide's mapping table for the year.
**Output.** The raw value, the percentage with its table year, and the guide's sentence on the
20% threshold used in allocation (kidneys with KDPI 20% or less are offered first to candidates
with EPTS 20% or less, as policy states it; confirm wording).
**Data.** As tool 1: the mapping table is versioned data with a watch.
**Tests.** The guide's worked example; dialysis time of 0; the 20% boundary on both sides.

### 3. `ischemia-time-clock` — Cold and Warm Ischemia Time From Clamp, Flush and Reperfusion Times

**Input.** Timestamps with time zones or a single zone: aortic cross-clamp (or, for DCD,
withdrawal of support and the declaration of death), start of cold flush, removal from cold
storage, anastomosis start, reperfusion. Which of these bound "cold ischemia time" is set by
the OPTN definition once read; the page shows the definition it uses.
**Compute.** Cold ischemia = per the definition (commonly cross-clamp or cold flush to removal
from ice or to reperfusion); warm ischemia (DCD functional warm ischemia, and the anastomosis
or "second warm" time) likewise; total preservation time; countdown to a reader-entered
institutional limit.
**Output.** Each interval in hours and minutes with the two events that bound it named.
**Build gate.** Read the OPTN data definitions (or the policy's definition of cold ischemia
time) and cite them; until then the tool prints the intervals between whichever events the
reader labels, with no claim that one of them is "the" CIT.
**Rule.** An end before its start is refused by name; a missing event leaves that interval blank
with the event named.

### 4. `donor-recipient-size-match` — Donor-to-Recipient Weight and Height Ratios

**Input.** Donor and recipient weight and height (unit toggles per the catalog's unit
conventions); optionally donor and recipient BSA (computed by the live `bw-bsa-suite` formula).
**Compute.** Weight ratio, height ratio, BSA ratio, and the differences in percent.
**Output.** The ratios and differences; no threshold ships (the page says acceptable ratios are
program- and organ-specific and are not stated here).
**Source.** Arithmetic identity.

## Decisions

**D1 — no coefficient from memory.** The highest-stakes rule here. A KDPI off by a few points
changes an offer. The spec states none; the tests are the guide's example.

**D2 — mapping tables are data with a year.** Printed on every result; watched.

**D3 — no acceptance advice.** The tools report the OPTN figure and the policy band; the
decision is the program's.

## Risks

- **Reading a stale guide.** The build must confirm the edition date on the PDF's first page
  against the OPTN calculator page's link text.
- **The 403.** A human download is the known route (spec-v1636's precedent).
