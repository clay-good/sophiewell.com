# spec-v1401 — city-burden infectious disease II, and state data for nine existing tiles

Program: [scope-state-practice.md](scope-state-practice.md). Part A adds three national tiles
(group J). Part B adds state data to nine existing tiles and creates no tiles.

## Part A — prevention after exposure, and arrival screening

`hiv-pep-occupational` covers a needlestick. Nothing covers the other exposures that bring
patients to NYC, Houston, Dallas, and LA urgent cares every weekend. The 2025 nPEP guideline and
the 2024 doxy-PEP guideline are both new enough that practice has not caught up.

### `npep-2025` — Non-Occupational HIV PEP Decision (CDC 2025)

Inputs: exposure type (receptive or insertive anal or vaginal sex, oral sex, shared injection
equipment, sexual assault, other), hours since exposure, the source's HIV status and whether they
are virally suppressed, whether the exposed person takes PrEP and adherence, pregnancy, and eGFR.
Output: whether nPEP is recommended, the **72-hour** limit (**ideally within 24 h**), the preferred
regimen (**bictegravir/emtricitabine/tenofovir alafenamide**, or **dolutegravir plus TAF or TDF
plus FTC or 3TC**) for 28 days, and baseline and follow-up testing. **What 2025 changed and the tile
must print:** nPEP indications now explicitly address a virally suppressed source, a person already
on PrEP, and sexual assault. Source: *Antiretroviral Postexposure Prophylaxis After Sexual,
Injection Drug Use, or Other Nonoccupational Exposure to HIV, CDC Recommendations, United States,
2025*, MMWR Recomm Rep 2025;74(RR-1). Past 72 hours, the answer is "not recommended" plus the
testing and PrEP pathway. It is never a blank.

### `doxy-pep` — Doxycycline PEP for Bacterial STI Prevention (CDC 2024)

Inputs: population (MSM or transgender women), a bacterial STI (syphilis, chlamydia, gonorrhea)
diagnosed in the past **12 months**, pregnancy, and doxycycline contraindications. Output: whether
CDC recommends offering doxy-PEP through shared decision-making, the dose (**200 mg** within **72
hours** after sex, **no more than 200 mg per 24 hours**), and STI testing at exposed sites **at
baseline and every 3–6 months**. For people outside the recommended population, it prints CDC's
statement about them, with no recommendation of its own. Source: *CDC Clinical Guidelines on the
Use of Doxycycline Postexposure Prophylaxis for Bacterial STI Prevention, United States, 2024*,
MMWR Recomm Rep 2024;73(RR-2).

### `strongyloides-presumptive` — Strongyloides: Presumptive Treatment or Test (CDC Refugee and Migrant Guidance)

Inputs: region of origin (Asia, Africa, Middle East, Latin America and the Caribbean), residence in
a **Loa loa-endemic** country of Central or West Africa, whether overseas presumptive ivermectin
was documented, pregnancy, weight, and a planned course of **corticosteroids or other
immunosuppression**. Output:

- No documented overseas treatment and no contraindication: presumptive **ivermectin 200 µg/kg
  once daily for 2 days** (dose from the entered weight).
- Loa loa-endemic origin: **no presumptive ivermectin** (risk of encephalopathy). Test with
  *Strongyloides* IgG serology, and treat a positive with **albendazole 400 mg twice daily for 7
  days**.
- Contraindication (pregnancy, among others): serology instead of presumptive treatment.
- Any steroid plan: the tile states the hyperinfection risk and does not let the "already treated
  overseas" answer silence it.

The ED in the Bronx or El Paso that is about to start dexamethasone is the reason the tile exists.
Sources: CDC *Domestic Refugee Health Guidance: Intestinal Parasites*, and *Guidelines for
Overseas Presumptive Treatment of Strongyloidiasis, Schistosomiasis, and Soil-Transmitted
Helminth Infections*.

## Part B — state lines added to nine existing tiles

Each existing tile keeps its national answer as the default. The state line is an **optional**
state field, never required (these tiles are national first), and appears only when a state is
chosen. Each backfill adds a META citation, a ledger row, and a unit test. None changes an
existing worked example's answer.

| Tile | State data added | Source |
|---|---|---|
| `blood-lead` | NY: "elevated" is **5 µg/dL or more** (since October 1, 2019); confirm a capillary result of 5 or more on a venous sample. NYC: report **3.5 or more within 24 h**, test at ages 1 and 2, assess at the first prenatal visit. CA: confirmatory venous deadlines by band (**≥69.5 immediately**, 59.5–69.4 within 24 h, 44.5–59.4 within 48 h, 19.5–44.4 within 2 weeks, 9.5–19.4 within 1 month, 3.5–9.4 within 3 months) and testing at 12 and 24 months. TX: venous confirmation deadlines (3.5–9: 1–12 weeks; 10–19: 1–4 weeks; 20–44: 1–2 weeks; 45 or more: 48 h) and home-investigation eligibility | NYS blood lead regulation; NYC DOHMH provider page; **17 CCR §37100 (operative July 6, 2026)**; DSHS Pb-109 (March 2024). NJ is added after the 2024 readoption's tiers are read |
| `restraint-timer` | NY OMH psychiatric settings: order limits and check intervals by age from **14 NYCRR 526.4**. CA: prohibited techniques from **HSC §1180.4** (no technique that impairs breathing, no covering the face, no prone with hands held behind the back, prone mechanical restraint only on a case-by-case physician order, constant face-to-face observation when restraint and seclusion are combined; SB 857, effective January 1, 2026) | **Read 526.4 before the build.** Research reported the age-band limits as 4 h, 1 h, and 30 min, which differ from CMS's 4/2/1 h, so the regulation's text must settle it |
| `hiv-pep-occupational` | NY: the NYSDOH AIDS Institute occupational PEP guideline (December 5, 2025): start **ideally within 2 hours**, no later than 72; 28 days; preferred BIC/FTC/TAF; follow-up HIV testing at **4 and 12 weeks** | hivguidelines.org, HIV PEP |
| `sepsis-bundle-clock` | NY (10 NYCRR 405.4, Rory's Regulations): the protocol elements NY requires: **six adult elements** (lactate, cultures, antibiotics, fluids, fluid reassessment, vasopressors or repeat lactate) and **three pediatric elements** (cultures, antibiotics, fluids with endpoints). **No timeframe is attributed to the regulation**, because 405.4 sets none. The pediatric 1-hour bundle is labeled as coming from the published evaluation, not the law | NYSDOH 405.4 guidance; IPRO data dictionaries |
| `rabies-pep` | TX: the 10-day (**240 h**) observation applies **only to dogs, cats, and ferrets**. High-risk wildlife is euthanized and tested. Skunks and bats are the Texas reservoirs. Exposed animals are confined **45 days** | DSHS *Rabies Prevention in Texas* (August 2024); 25 TAC 169.27 |
| `sti-screening` | A one-line pointer, for pregnancy, to `prenatal-infection-screening-schedule` (spec-v1394). No state data in this tile, which remains CDC's intervals | none new |
| `opioid-mme` | A one-line pointer to `pmp-check-required` and `acute-opioid-rx-limit` (spec-v1393) | none new |
| `heat-index` | A one-line pointer to `calosha-outdoor-heat` and `calosha-indoor-heat` (spec-v1398) when the result is 80°F or more | none new |
| `qbl-pph` | One sentence stating that it does not use CMQCC staging, whose terms bar derivative works, so a California reader knows why the stages differ from the hospital's poster | CMQCC terms of use |

## Acceptance

- nPEP: 80 hours after exposure → "not recommended" plus the testing and PrEP pathway. A
  suppressed source prints the 2025 statement rather than a bare "no".
- Strongyloides: a patient of Cameroonian origin with a steroid plan gets serology and albendazole,
  **never** ivermectin.
- Every Part B tile passes its **existing** worked example unchanged with no state chosen. A test
  per state line proves the state answer appears only when that state is chosen.
- `blood-lead` CA: a capillary 12 µg/dL returns "venous confirmation within 1 month".

## Built, Part A (2026-09-18)

| tile | source read |
|---|---|
| `npep-2025` | MMWR Recomm Rep 2025;74(RR-1), PMC12064164 |
| `doxy-pep` | MMWR Recomm Rep 2024;73(RR-2), PMC11166373 |
| `strongyloides-presumptive` | CDC Domestic Refugee Health Guidance: Intestinal Parasites (updated January 30, 2025) |

- **Corrected from the plan (Strongyloides):** CDC's current page gives presumptive
  ivermectin as a **single** 200 ug/kg dose, not two days, and does **not**
  recommend albendazole. A Loa loa-endemic origin gets a thin and thick blood smear
  drawn between 10 a.m. and 2 p.m. before any ivermectin, plus serology. The
  acceptance case (Cameroonian origin, steroids planned) therefore returns "smear
  first, no ivermectin up front" with the hyperinfection warning, and never
  albendazole.
- nPEP: the 2025 rules for a suppressed source (not routinely recommended after sex;
  case-by-case by other routes) and for PrEP taken as directed (not generally
  recommended, with the four exceptions) are printed as statements, never a bare no.
- doxy-PEP: no pregnancy or contraindication logic is added, because the guideline
  read gives none for the recommended population.
- **Part B** (state lines on nine existing tiles) is not built in this wave.

## Built, Part B pointers (2026-09-19)

Three of the four "pointer" rows ship as named Related links, which is how the site points from
one tool to another:

| tile | now links to |
|---|---|
| `sti-screening` | `prenatal-infection-screening-schedule`, `doxy-pep` |
| `opioid-mme` | `pmp-check-required`, `acute-opioid-rx-limit` |
| `heat-index` | `calosha-outdoor-heat`, `calosha-indoor-heat` |

No existing answer changed.

`blood-lead` has an optional California line (built 2026-09-19): with California chosen, it gives
the venous confirmation window for a capillary result from CDPH's *California Management Guidelines
on Childhood Lead Poisoning* (August 2023): 3 months, 1 month, 1 month, 2 weeks, 48 hours, 24 hours,
or immediately by band. The windows match the plan, but the source read is the CDPH guideline, not
17 CCR 37100, which did not load. With no state chosen the answer is unchanged, and a test pins
that. The New York, NYC, and Texas lead lines were not read.

Still open in Part B: the state lines for
`restraint-timer`, `hiv-pep-occupational`, `sepsis-bundle-clock`, and `rabies-pep`, and the
`qbl-pph` CMQCC sentence (the CMQCC terms were not read).

`restraint-timer` has an optional New York OMH line (built 2026-09-19), read from 14 NYCRR 526.4
(amended effective June 4, 2014). The rule settles the plan's question: orders last no more than
**4 hours for adults, 1 hour for ages 9 to 17, and 30 minutes under 9**, and manual restraint 30
minutes at any age. That is stricter than CMS's 4/2/1 for minors, so both are shown. An RN, NP, or
PA assesses at least every 30 minutes, and the medical director is consulted past 2 hours (adults),
1 hour, or 30 minutes. It applies to violent or self-destructive restraint only. The CMS answer is
unchanged with the line off.

`rabies-pep` has an optional Texas line (built 2026-09-19) from 25 TAC 169.27 (as last amended March
31, 2013): a dog, cat, or domestic ferret that bit someone is quarantined, vaccinated or not, for a
10-day observation starting at the exposure, or euthanized and tested; a free-roaming high-risk
animal is euthanized and tested. The plan's 45-day confinement and the skunk/bat reservoir note come
from the DSHS guide, which was not read, so they are not printed. The national tree is unchanged.

`hiv-pep-occupational` has an optional New York line (built 2026-09-19) from the NYSDOH AIDS
Institute guideline *PEP to Prevent HIV Infection* (updated December 5, 2025), which covers
occupational exposures: start ideally within 2 hours and no later than 72, a 28-day course, and HIV
tests at baseline, 4, and 12 weeks. **Changed from the plan:** the plan listed the preferred regimen
(BIC/FTC/TAF), but this tile's contract, pinned by a test, is that it names no drug, dose, or regimen.
So the line says NYSDOH names a preferred regimen and does not print it. `npep-2025` gives CDC's
regimens.

`sepsis-bundle-clock` has an optional New York line (built 2026-09-19) from 10 NYCRR 405.4(a)(4)-(8).
The regulation requires hospital sepsis protocols with five components, (i) through (v), for adults and
children, and **sets no timeframe of its own**. The timeframe goals belong to each hospital's protocol,
and the line says so, as the plan required. **Changed from the plan:** the six adult and three pediatric
"elements" the plan listed come from the NYSDOH reporting data dictionaries, which were not read, so
the line cites the regulation's five components instead.

`qbl-pph` now says in its note that it does not reproduce the CMQCC hemorrhage stages, because CMQCC's
Terms of Use bar derivative works of its content (read 2026-09-19). One thing the plan missed: the
tile's admission risk tier is labeled "per CMQCC". That label is not changed here; whether it should be
is a separate question.

With that, Part B's nine rows are done except the New York City, New York State, and Texas lead lines,
which were not read.
