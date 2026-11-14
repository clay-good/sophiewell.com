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

**Read November 7, 2026** (the guide, *updated April 23, 2026*, 11 pages, SHA-256
`7e6f39ad54923f8d84ad85b55e6b3fb8baad4467e40feff490cbdcafb9e56bb7`, saved by hand from
hrsa.gov/sites/default/files/hrsa/optn/kdpi_guide.pdf). It confirms the eight factors (the October 31, 2024 refit,
without race and HCV) and replaces the expectations above:

| Factor | Applies to | Xβ component |
|---|---|---|
| Age (integer years) | all; under 18; over 50 | 0.0092(age − 40); + 0.0113(age − 18); + 0.0067(age − 50) |
| Height (cm) | all | −0.0557(height − 170)/10 |
| Weight (kg) | under 80 kg | −0.0333(weight − 80)/5 |
| Hypertension, diabetes | if present | 0.1106; 0.2577 |
| Cause of death CVA | if CVA | 0.0743 |
| Serum creatinine (mg/dL) | all; over 1.5 | 0.2128(Cr − 1); − 0.2199(Cr − 1.5) |
| DCD | if DCD | 0.1966 |

- KDRI_RAO = e^Xβ; KDRI_SCALED = KDRI_RAO ÷ the scaling factor, the median KDRI_RAO of the prior calendar year's
  recovered donors (1.40436817065005 for 2024). The factor *in use* is printed at the bottom of the KDRI-to-KDPI
  mapping table document, so even the scaled KDRI needs that document.
- KDPI is the mapping table's integer percentage (0% below every reference donor; 100% above 99% of them).
- Worked example (age 52, 183 cm, 81 kg, hypertensive, not diabetic, CVA, creatinine 1.7, DCD): Xβ 0.53787,
  KDRI_RAO 1.71235565748184, KDRI_SCALED 1.21930679808076, KDPI 72% on the 2024 table. Reproduced exactly except
  the KDPI, which needs the table.
- The guide's own caution belongs on screen: the KDPI's c-statistic is about 0.60, it should not be made a
  yes/no cutoff, and it should never alone rule a kidney in.
- **Extreme values (added November 14, 2026, spec-v1718).** The November 7 transcription above is Table 1 only
  and missed the guide's extreme-value rule: **a serum creatinine above 8 mg/dL enters the KDRI as 8**, so 8, 9,
  15 and 25 all give the same KDRI, and OPTN's calculator prints a note when the cap applies. The guide's app
  accepts creatinine from 0.01 to 40.

  This is not cosmetic. The two creatinine terms above sum to a slope of 0.2128 − 0.2199 = −0.0071 per mg/dL
  above 1.5, so the published formula FALLS as creatinine rises; uncapped it falls without end, and the guide's
  own example donor reads KDPI 67% at 1.7 mg/dL and 54% at 20 — a donor in dialysis-dependent acute kidney
  injury reported as a better kidney than the same donor with a near-normal creatinine.

  **To confirm on the next hand-read of the PDF:** the exact wording of the extreme-value section, whether the
  cap is stated for any variable other than creatinine, and the entry range 0.01 to 40. The cap itself was
  confirmed from two independent readings of the cited guide; the section was not opened directly, because the
  host refuses a scripted fetch (task 1.4).

  Also reported in that section, and **not** acted on, because the sourcing was secondary and nothing in it
  changes an answer: height limited to 7'11" (241.3 cm) and weight to between 1 lb (0.454 kg) and 650 lb
  (294 kg). The tool's fences (30 to 250 cm, 1 to 300 kg) are plausibility fences that sit just outside those,
  so they refuse the same unit slips and no real reported value. Confirm the figures on the hand-read and
  narrow them then, not before.

  **Checked and NOT a defect.** A search summary claimed the June 2024 refit notice gives the age coefficient
  as 0.0128 against the guide's 0.0092. It has them the wrong way round: 0.0128, with height −0.0464, weight
  −0.0199, hypertension 0.1260, diabetes 0.1300, CVA 0.0881, creatinine 0.2200 and −0.2090, DCD 0.1330, plus
  race 0.1790 and HCV 0.2400, is the PRE-refit set — the one that still carries the two factors the refit
  removed. Every coefficient in the table above differs from it, there is no race or HCV term, and the age
  term under 18 changed sign, all of which is what a refit looks like. The decisive check is already in the
  test suite: the guide's own printed worked example reproduces to 1e-12 from these coefficients, which a
  mixed set could not do.
- **Remaining gate:** `kdpi_mapping_table.pdf` (same folder), not yet saved.

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

**Read November 7, 2026** (the guide, *updated April 07, 2026*, 6 pages, SHA-256
`a62d935a97629e681a482490fe22c94db6648adc8964e46f52c1cccf84c3d79a`, saved by hand from
hrsa.gov/sites/default/files/hrsa/optn/epts_guide.pdf). This replaces the expectations above:

- Raw EPTS = 0.047·max(Age − 25, 0) − 0.015·D·max(Age − 25, 0) + 0.398·P − 0.237·D·P
  + 0.315·ln(Y + 1) − 0.099·D·ln(Y + 1) + 0.130·[Y = 0] − 0.348·D·[Y = 0] + 1.262·D, where D is any
  current diabetes (type does not matter), P is one or more prior solid organ transplants (the number does
  not matter), and Age and Y are full days from birth and from dialysis start to the date, divided by 365.25.
- Missing or unverified factors give a missing score, treated in allocation as outside the top 20%; EPTS
  does not apply under 18.
- The score is the cumulative percentage from the **mapping table** (percentiles 1 to 100 of raw EPTS over
  all adult waiting-list candidates on December 31 of the prior year; below the minimum is 0%, above the
  maximum 100%), updated each spring. The table is a separate PDF and is **not yet saved**, so it is the
  remaining gate.
- Worked examples, all reproduced to seven decimals: 0.9667934 (9%), 1.4404346 (18%), 1.8687507 (32%),
  each as of January 1, 2025 against the December 31, 2024 reference population.

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
