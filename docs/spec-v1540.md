# spec-v1540 — Field health charter: rules every frontline tile follows

Program: [scope-field-health.md](scope-field-health.md). This spec builds no tile. It sets the
rules and the shared machinery that the clinical waves (spec-v1544 through spec-v1563) all
depend on, so no wave invents them and no two waves invent them differently. The platform work
(offline pack, field units, languages) is in spec-v1541 through spec-v1543.

## 1. Who this is for

A community health worker in rural Kenya, an auxiliary nurse at a health post in Peru, an ASHA
in Bihar, a clinical officer at a district hospital in Malawi. They work without reliable
internet, labs, or a specialist to call. They were trained on a WHO chart, usually adapted by
their ministry of health. They need the chart's arithmetic and its thresholds to be right, fast,
and available with no signal.

The catalog already serves US nurses. This program adds the WHO and national-programme layer:
the IMCI charts, WHO growth and wasting standards, malaria, TB and HIV weight bands, snakebite,
rabies, maternal emergencies, epidemic-prone disease, and neglected tropical diseases.

**What the product is and is not.** It is a reference and arithmetic layer: it shows the number,
the cutoff it was compared with, the edition that cutoff comes from, and what that edition says
to do. It is not a case-management system (no patient records, tasks, or sync), and it does not
compete with the ministry-deployed apps (Community Health Toolkit, CommCare, ePOCT+). It
complements them, the way the catalog complements an EHR today.

## 2. Admission rule (every new tile passes all six)

1. **A named primary source, read.** A WHO guideline, chart booklet, handbook, or position paper,
   or a national ministry protocol, with its edition and page or table. Secondary summaries,
   training slides, and blogs never supply a number. A value that could not be read stays out.
2. **Deterministic.** Given the inputs, the answer is fixed. A tile never estimates what the
   user did not enter.
3. **A frontline question.** It answers something a CHW, nurse, midwife, or clinical officer
   decides at the point of care: classify, refer, dose, rehydrate, time the next dose.
4. **Licence-clean** under §6: logic and numbers restated in our own words with citation; no
   reproduced chart text, layout, or images.
5. **The edition is printed** on every answer: *"WHO IMCI chart booklet, 2014."*
6. **A staleness row** in `docs/citation-staleness.md` (§8) with a review date.

## 3. The edition switch (conflicting WHO editions)

WHO revises in pieces. The 2014 IMCI booklet is still the only 2-months-to-5-years chart, but the
2019 young-infant booklet and the 2024 guidelines change several of its numbers. The research
found 15 such conflicts in child health alone (zinc dose and duration, the young-infant fever
threshold, the critical-illness sign list, gentamicin mg/kg by week of life, fluid boluses, the
SpO2 edge). A national chart may follow any of them.

**Rule: a tile never silently picks between two WHO editions that disagree.**

- Where editions disagree on a value the tile outputs, the tile has a required `edition` input
  with no default. Its options name the document and year (*"IMCI chart booklet 2014"*,
  *"WHO guideline 2024"*). The answer prints which edition was used.
- Where one edition clearly supersedes the other on the same question (for example ETAT 2016
  on shock fluids versus the 2013 Pocket Book), the tile implements the newer one and prints
  one sentence naming the older value: *"The 2013 Pocket Book gave 20 mL/kg as fast as possible;
  ETAT 2016 replaced it."*
- Each wave spec lists its conflicts in a table: item, older value, newer value, and which rule
  above applies.
- Where the source itself is internally inconsistent (DHA-piperaquine leaves exactly 80 kg in
  no band; the SAM F-75 card has entries that do not reproduce), the tile states the reading it
  chose in one sentence and tests that edge.

## 4. Shared machinery

### 4.1 Weight-band and age-band engine (`lib/band-dose.js`)

Nearly every WHO dose in this program is a band table: *5 to less than 15 kg: 1 tablet*. One
engine, written once:

- **Bands are half-open, `lo <= x < hi`**, and the top band is `>= lo`. WHO writes it that way;
  where a chart closes its top band ("14–19 kg"), the tile encodes the chart exactly and states
  the top edge.
- **Off-chart refuses.** A weight below the first band or above the last band returns "outside
  this chart" with the chart's range. It never extrapolates and never falls to the nearest band.
- **Blank refuses.** An empty weight is not zero. It must not land in the smallest band (the
  footing pattern from spec-v1090 onward).
- **Weight beats age.** Where a chart offers both, weight is used when entered; age is a
  fallback only, and the answer says which was used. When both are entered and fall in different
  bands, the answer uses weight and says the age band differs (WHO's own instruction).
- **Output is the band's dose, not a continuous mg/kg product.** The achieved mg/kg (dose ÷
  weight) may be shown beside it, flagged when outside the source's stated target range. A tile
  never computes a "better" dose than the chart gives.
- **Formulations are named by strength, never by brand**: "250 mg dispersible tablet", "125 mg in
  5 mL syrup", "40 mg/mL gentamicin".
- **Fractions** print as the chart prints them (½, ¼, 1½). A fraction appears only where the
  source prints it. The engine never invents a split.

### 4.2 Setting inputs are required and have no default

Several WHO charts branch on a fact about the place, not the patient: malaria risk (high, low,
none), HIV prevalence setting, altitude above 2,500 m, fluoroquinolone resistance, local
helminth prevalence, whether the ministry has adopted community treatment of chest indrawing.
These are **required enums with no default**. A default is always the most favorable row, the
defect shape this catalog has already fixed in dozens of tiles. "Unknown" is an allowed answer
wherever the source says what to do when it is unknown, and only there.

### 4.3 Signs have three states

IMCI classifications are "any one of these signs" or "two of these signs". A sign left blank must
not count as absent, or an empty form returns the green row ("No pneumonia: cough or cold"). Every
sign is a three-state control: **present / absent / not assessed**, following the NIHSS fix
(spec-v1073 onward).

- A classification that would change if an unassessed sign were present is **incomplete**. It
  names the missing signs and prints no green row.
- A classification already reached by the signs entered (one danger sign present) is printed
  even if other signs are unassessed, because more signs cannot lower it.

### 4.4 Temperature site

IMCI thresholds are axillary; the Pocket Book's are rectal and it says axillary reads about
0.5 °C lower. Every temperature input in this program has a required `site` (axillary, rectal,
oral, tympanic), and a tile compares against the threshold for its source's site. It never
silently converts between sites.

### 4.5 Units for this program

These tiles default to kg, cm, mm (MUAC), °C, g/L or g/dL as the source states, and mmol/L for
glucose, through the field unit profile in spec-v1542. Until that ships, each tile's weight field
pre-selects kg rather than inheriting the catalog's lb default, and says so in the field label.

## 5. Copy rules for a frontline answer

- **Lead with the classification or the dose, then the working.** "Pneumonia (yellow). Breathing
  52 per minute; the fast-breathing cutoff at 2 to 11 months is 50." The number and its cutoff
  are always shown together, so a trained reader can check the basis.
- **Actions are phrased as what the source says**, not as orders: "The 2014 chart says: give
  oral amoxicillin for 5 days and follow up in 3 days."
- **National protocol line.** Exactly one closing sentence, the house pattern: *"This follows
  [edition]. Your national protocol may differ; follow it."* Only one; the one-disclaimer sweep
  enforces it.
- **No commercial products.** Antivenoms, ACTs, RUTF and formulas are named generically. Where a
  national protocol names its own public products (India's polyvalent antivenom, Brazil's
  public-sector sera), the tile is labelled with the country and says the doses do not transfer
  to other products.
- **Colors are words.** The IMCI pink, yellow, and green are printed as words beside the
  classification ("pink: refer urgently"), never as color alone.
- **Plain words for the audience.** "Breathing 52 per minute", not "tachypneic". Drug names use
  the WHO INN, with the US name in brackets on first use where it differs (paracetamol
  [acetaminophen], salbutamol [albuterol], adrenaline [epinephrine]).
  `check-us-english` scans user-facing strings and bans British spellings. This program keeps US
  spelling in the UI ("diarrhea", "anemia", "edema"), keeps WHO document titles as published in
  citations (already exempt), and adds the INN drug names above to that gate's allowlist,
  scoped to this program's tiles, as a deliberate edit.

## 6. Licensing posture

`docs/legal.md` has no category for WHO material yet. This spec adds one. The research read every
source's licence line:

| Source type | Licence found | What a tile may use |
|---|---|---|
| IMCI chart booklet 2014; iCCM 2011; ETAT 2016; Pocket Book 2013; SEARO snakebite 2016; AFRO snakebite 2010; SAM manual 1999 | "All rights reserved" | Thresholds, doses and decision logic as facts, restated in our words and cited |
| WHO 2019 onward (young infant, SBI 2024, wasting 2023, Hb 2024, malaria 2026, PPH 2025, Labour Care Guide, meningitis 2025, diphtheria 2024) | CC BY-NC-SA 3.0 IGO | The same. Adapted text would carry NonCommercial and ShareAlike, which MIT cannot. So no adapted text either |
| Brazil Ministry of Health (Guia de Vigilância em Saúde 2024) | CC BY-NC-SA 4.0 | The same, pending the owner's decision in spec-v1556 |
| CDC-redistributed WHO growth LMS files | No copyright line; CDC public-domain policy | Bundle as data, as `who-growth-zscore` already does |
| WHO website growth tables (24–60 months, 5–19 years) | Website terms: non-commercial, and "substantial portions" need written permission | Not bundled. Blocked until WHO grants permission (spec-v1564) |
| WHO `anthro` and `anthroplus` R packages | GPL-3 | Not bundled. Test oracle only |
| INTERGROWTH-21st | © University of Oxford, no reuse terms found | Blocked (spec-v1564) |

Additions to `docs/legal.md`:

- **A new manifest status, `who-facts-with-attribution`**, for any bundled dataset drawn from
  WHO material. It joins `restricted-source-attribution.test.js`, so every dataset carrying it
  must state what it does and does not reproduce.
- **A reproduction guard**, `test/unit/who-no-verbatim.test.js`, modelled on the AHA and CPT
  n-gram checks. It holds a list of distinctive chart phrases per source (classification
  sentences, treatment-box wording) and fails if any user-facing string in this program's tiles
  reproduces eight or more consecutive words of one. Short classification names ("severe
  pneumonia or very severe disease") are allowed, because they are the clinical category itself.
- **No WHO logo, emblem, color scheme or chart layout.** No page may suggest WHO endorsement.
  The house citation reads "Source: WHO, [title], [year]", never "WHO-approved".
- **A written request to WHO** (drafted in spec-v1564) for three things: growth tables beyond
  24 months, the licence of the SMART Guidelines digital adaptation kits (whose repositories
  disagree: CC0, CC BY-SA, and CC BY-NC-SA all appear), and confirmation that restating
  thresholds with citation is acceptable. Building does not wait for the reply; blocked tiles do.

## 7. Regulatory posture

The research checked Kenya (PPB software guideline, April 2026), Nigeria (NAFDAC SaMD guideline
2024), India (CDSCO medical device software guidance 2026), Brazil (ANVISA RDC 657/2022), Peru
(Ley 29459), South Africa (SAHPRA), and the FDA's CDS guidance (revised January 2026). **None
exempts software for being free or open source. Intended use decides.** A tool that classifies a
sick child and tells a health worker to refer or treat "drives clinical management". That
plausibly makes it class B or C in India, Nigeria, Kenya, Brazil and South Africa.

This is the owner's decision, not the builder's, so it is a **gate before the first
classify-and-act tile ships** (the IMCI, iCCM, ETAT, PSBI and SAM care-setting tiles). The
program's recommended framing, which every tile follows regardless:

1. **Intended user: a trained health worker applying their own protocol.** The page says so in
   its lede and in `tool-copy`. It is never addressed to a patient or caregiver.
2. **Transparent basis on every answer** (§5): the entered values, the cutoff, and the edition,
   so the user can check the reasoning independently. This is the FDA criterion-4 posture, and
   the pattern the catalog already uses.
3. **"The chart says", not "do this".** The action text reports what the named source
   recommends.
4. **No claim of validation.** The pages never say "validated", "clinically proven", or
   "equivalent to IMCI"; ePOCT+ and ALMANACH were trial-validated, and this catalog is not.
5. **Counsel review per country** before any partnership, ministry adoption, or promotion in that
   country. Recorded as an open item in spec-v1564.

Dose tables, z-scores, fluid volumes, and clotting-test readings (calculator-shaped tiles) carry
lower risk and can ship first; the build order in the scope doc does that.

## 8. Staleness ledger

`ISSUER_PATTERN` in `scripts/check-citations.mjs` already matches `WHO`, so every WHO-cited tile
is gated. Add:

- **`GTFCC`, `PAHO`, `ICMR`, `MoHFW` and `Ministério da Saúde`** to the issuer pattern
  (bounded, so no longer word matches).
- **A volatility column** in the ledger with three values. *High*: living guidelines that
  changed a dosing edge within the last year (WHO malaria: the under-5 kg artemether-lumefantrine
  band and the primaquine age exclusion both changed between August 2025 and September 2026;
  pediatric ARV tables). Review every 6 months. *Moderate*: guidelines under active revision
  (IMCI young infant after SBI 2024; rectal artesunate). Review every 12 months. *Low*: stable
  standards (WHO growth 2006, Labour Care Guide 2020). Review every 24 months.
- A living guideline's citation carries its version date and DOI: *"WHO guidelines for malaria,
  10 September 2026, doi:10.2471/B09879."*

## 9. Catalog wiring

- **Group.** Child-health tiles go to N (Pediatrics & Neonatal); dose-band tiles to F
  (Medication & Infusion); infectious-disease tiles to J; envenomation to I (EMS & Field
  Medicine); maternal to G. No new group. A "Field health" landing collection is spec-v1541's
  field pack, not a group.
- **Specialty tags.** Add **`global-health`** to the closed vocabulary in
  `test/unit/specialty-coverage.test.js`, so `list_calculators?specialty=global-health` returns
  the whole program. Every tile in it carries `global-health` plus its clinical specialty.
  Add **`community-health`** for tiles whose intended user includes a CHW (the iCCM chart, MUAC,
  ORS plans, rectal artesunate, RDT-guided ACT).
- **Names for search.** The everyday phrase first, then the source: "Fast Breathing and
  Pneumonia in Children 2–59 Months (WHO IMCI)". Acronyms (IMCI, iCCM, ETAT, PSBI, SAM, MUAC,
  ACT, 20WBCT, PEP) get synonym rows and a `test/mcp/mcp-search-relevance.test.js` row each.
  The spec-v1063 acronym lesson applies: `sam` must reach severe acute malnutrition, not a
  substring of another word.
- **Adapter summary first sentence** is 130 characters or fewer and has no abbreviation with a
  period.
- Every tile follows the standing recipe (lib, view, MCP adapter, unit test, META with worked
  example, synonyms, corpus, field index, sitemap, report catalog, tools index, SBOM, and every
  count surface).

## 10. Test rules for this program

- **Every band edge is a test case**: the value just below, at, and just above each boundary,
  for every band table. The research found edges that differ by one glyph between editions
  (`≥` vs `>`), and those are exactly the cases a test has to pin.
- **Every conflict row in a wave's table is a test** that proves the edition switch changes the
  output.
- **An empty form and a one-field-short form** are run on every tile (the three starting points
  from spec-v1142): neither may print a green row or a dose.
- **Worked examples come from the source** where it prints one (the SAM course's F-75 and
  weight-gain examples; the malaria guideline's mg/kg targets). A worked example whose every
  field is zero is not allowed (spec-v1015).
- **Oracles.** The WHO `anthro` package may generate expected z-scores in a test fixture script
  kept out of the shipped bundle. Its tables are never copied into `lib/`.

## Acceptance

`lib/band-dose.js` with unit tests for half-open bands, closed top bands, off-chart refusal, blank
refusal, and weight-over-age precedence. The legal.md category, the reproduction guard
(negative-tested with a planted chart sentence), the two specialty terms, the issuer additions,
and the volatility column (negative-tested with a backdated high-volatility row). No catalog count
changes.
