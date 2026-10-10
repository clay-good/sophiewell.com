# spec-v1636 — Hospital pharmacy operations: label antidote and emergency dosing, stewardship metrics, department measurement

**Status:** Proposed, October 10, 2026. Specs only; nothing here is built. 21 new tools (none build-gated), 7 backfills.
**Charter:** [spec-v1627](spec-v1627.md). **Machinery:** [spec-v1628](spec-v1628.md). **Ledger:** [scope-pharmacy-practice.md](scope-pharmacy-practice.md).

The emergency-department and critical-care pharmacist works from FDA labels at the bedside: how
many vials, what volume, how fast, when the next dose is due. The stewardship pharmacist counts
antimicrobial days, builds the antibiogram and reports rates in the CDC's definitions. The pharmacy
manager answers to CMS surveyors on administration timing and to finance on productivity. This wave
gives them 21 tools and 7 backfills. Every number below was read on October 10, 2026 on the page
named in the Research record, or it is listed under Verify at build.

Two backfills correct live tools against current labels and should be built first: `nac-dosing`
(Backfill 1) and `co-cn-antidote` (Backfill 2). Both are indexed in [spec-v1641](spec-v1641.md).

## Gap finder

**Method.** (1) The antidote shelf was enumerated by opening each product's current label on
DailyMed (40 labels fetched as SPL XML and read in section 2 or Dosage and Administration; every
one was fetched a second time on October 10, 2026 and was byte-identical). (2) The CDC NHSN
Antimicrobial Use and Resistance protocol (July 2026) and the MDRO and CDI protocol (January 2026)
were read for every defined metric. (3) The CMS State Operations Manual Appendix A (Rev. 248,
issued September 18, 2026) was read for numbers a hospital pharmacy department is surveyed on;
Appendix PP was read for the nursing-facility error rate, which is specified in
[spec-v1638](spec-v1638.md). (4) For every candidate, `catalog.tsv` was searched by drug, eponym,
synonym and output, and the lib or view source of each near neighbor was read.

**What the catalog already has (candidates dropped as live).**

| Candidate | Live id | Note |
|---|---|---|
| IV acetylcysteine | `nac-dosing` | Live but wrong against the US label: see Backfill 1 |
| Rumack-Matthew | `acetaminophen-nomogram` | 150 line; the Acetadote label calls its figure the "revised" nomogram |
| DigiFab | `digifab-dosing` | |
| High-dose insulin | `hiet-dosing` | |
| Hydroxocobalamin, nitrite, thiosulfate | `co-cn-antidote` | Static text; two lines disagree with the labels: Backfill 2 |
| Methylene blue trigger | `methemoglobin` | Reads the level; computes no dose: Backfill 3 |
| Naloxone bolus | `naloxone`, `peds-weight-dose` | No infusion: Backfill 4 |
| Calcium salts, elemental calcium | `calcium-replacement` | Backfill 6 (label rate caps) |
| Lipid rescue | `last-lipid` | |
| Sugammadex | `sugammadex` | Matches the Bridion label (2, 4 and 16 mg/kg on actual body weight, 100 mg/mL); re-read October 10, 2026 |
| Protamine, PCC, andexanet | `anticoag-reversal` | Live; not extended in this wave |
| Toxic alcohol indication | `toxic-alcohol` | Indication only; the dosing schedule is new tool 2 |
| Organophosphate atropine | `op-atropine-titration`, `peradeniya-op` | Eddleston; pralidoxime is new tool 4 |
| TCA bicarbonate, salicylate, lithium | `tca-bicarbonate`, `salicylate-toxicity`, `lithium-extrip` | |
| Iron ingestion | `elemental-iron-ingested` | Deferoxamine is new tool 9 |
| Rabies PEP | `rabies-pep`, `who-rabies-pep` | Days 0, 3, 7, 14 and 20 IU/kg live; no volume by product: Backfill 5 |
| Tetanus | `tetanus` | Decision tree; the tetanus immune globulin dose is in new tool 12 |
| Vasopressor rate math | `vasopressor`, `conc-rate`, `norepi-equiv`, `vis` | |
| Draw-up volume, weight dose | `dose-volume`, `weight-dose`, `conc-percent` | |
| Sodium correction | `sodium-correction`, `acid-base-deficit`, `corrected-sodium` | |
| Electrolyte ladders | `electrolyte-replacement`, `potassium-deficit`, `magnesium-replacement` | Labeled as institutional |
| Procedural sedation | `ketamine-propofol` | ACEP; intubation drugs are new tool 7 |
| Pediatric code doses | `peds-weight-dose`, `peds-dose`, `peds-resus` | |
| Heparin, insulin drips | `heparin-nomogram`, `insulin-drip` | |
| Sepsis clock | `sepsis-bundle-clock` | SSC 2021 hour-1 and SEP-1 |
| PEN-FAST | `pen-fast` | |
| NHSN definitions | `clabsi-lcbi`, `cauti-nhsn`, `nhsn-vae`, `device-day-counter` | Definitions and a device clock; no rate, no antimicrobial use, no LabID |
| CDI | `cdi-severity`, `atlas-cdi` | Clinical; the surveillance category is new tool 16 |
| Renal antibiotic dosing | `abx-renal`, `vanc-auc`, `aminoglycoside` | Pharmacokinetics is specified in [spec-v1631](spec-v1631.md) |
| 340B, wastage | `340b-*`, `drug-wastage` | |
| Rate confidence interval | `proportion-ci` | Reused by tools 18 and 20 |
| FMEA | `fmea-rpn` | |

**Proposed against nearest neighbor.**

| Proposed | Live neighbor | Difference |
|---|---|---|
| `nac-oral-regimen` | `nac-dosing` | Oral 72-hour label regimen: the label's weight-band table, volumes, diluent, an 18-dose clock |
| `fomepizole-schedule` | `toxic-alcohol` | Neighbor decides the indication; this computes each dose and the dialysis rules |
| `us-antivenom-dose` | `brazil-snakebite-antivenom`, `antivenom-repeat`, `snake-antivenom-indication`, `snakebite-severity` | Neighbors are WHO, Brazil and India; none carries CroFab, Anavip or Anascorp label dosing |
| `pralidoxime-dose` | `op-atropine-titration` | Neighbor is atropine only |
| `flumazenil-ladder` | none | |
| `dantrolene-mh-vials` | `mh-grading-scale` | Neighbor grades likelihood; this counts vials by product |
| `rsi-dose-sheet` | `ketamine-propofol`, `peds-weight-dose` | Neither has etomidate, succinylcholine or rocuronium |
| `neostigmine-reversal-dose` | `sugammadex`, `snake-neostigmine-trial` | Different drug and indication |
| `deferoxamine-acute-iron` | `elemental-iron-ingested` | Neighbor sizes the ingestion; this sizes the antidote and its 24-hour cap |
| `chelation-dose` | none | Succimer, edetate calcium disodium, dimercaprol |
| `thrombolytic-dose` | `sits-sich`, `hat-score`, `dragon-stroke` | Neighbors score risk; none computes a dose |
| `passive-immunization-dose` | `tetanus`, `rabies-pep`, `rhig-dose` | HBIG, VariZIG and tetanus immune globulin doses are not computed anywhere |
| `botulism-antitoxin-dose` | `diphtheria-antitoxin-dose` | Different product and rule (Salisbury) |
| `au-rate-saar` | none | Rate arithmetic on totals |
| `antimicrobial-day-counter` | `device-day-counter` | Counts NHSN antimicrobial days and days present from rows |
| `cdi-labid-category` | `cdi-severity`, `clabsi-lcbi` | Surveillance category from dates, not clinical severity; carries the LabID rate panel (events per 10,000 patient days, SIR) |
| `ddd-rate` | none | |
| `antibiogram-builder` | none | |
| `surgical-prophylaxis-redose` | `sepsis-bundle-clock` | Different clock, different source |
| `med-admin-window` | `blood-4h-window`, `restraint-timer`, `infusion-time-remaining` | CMS A-0405 windows |
| `adjusted-patient-days` | `nems`, `nurse-staffing-ratio-check` | |

21 rows, 21 ids. `antimicrobial-day-counter` and `au-rate-saar` are kept apart because one reads
rows and applies counting rules and the other is rate arithmetic on totals. The LabID rate is a
panel of `cdi-labid-category`, not its own id.

**Group.** Tools 1 to 13 are bedside clinical calculations (group G); their live neighbors
`nac-dosing`, `digifab-dosing` and `sugammadex` sit in F, and the builder should place them with
those. Tools 14 to 21 are Q.

## Tools

Every dosing tool follows one rule: it prints what the label states for the inputs, names the label
and its edition, and never says "give." Label editions follow [spec-v1628](spec-v1628.md) §1: each
tool pins the application holder's DailyMed set id with its version and published date, a weekly
watch detects a new version, and the tool fails closed until the changed label is re-read. The
editions read for this spec are listed under Sources.

### 1. `nac-oral-regimen` — Oral Acetylcysteine 72-Hour Regimen
**Input.** Weight (kg); solution strength (10% or 20%); time of the loading dose.
**Compute.** The label doses by a weight-band table from 20 kg up and by calculation below 20 kg.
- **Under 20 kg:** loading dose 140 mg/kg, maintenance 70 mg/kg; mL of 20% solution = mg ÷ 200;
  3 mL of diluent per 1 mL of 20% solution (a 5% final solution).
- **20 to 109 kg (label Dosage Guide and Preparation table):**

| Weight (kg) | Load (g) | mL of 20% | Diluent (mL) | Total 5% (mL) | Maintenance (g) | mL of 20% | Diluent (mL) | Total 5% (mL) |
|---|---|---|---|---|---|---|---|---|
| 20-29 | 4 | 20 | 60 | 80 | 2 | 10 | 30 | 40 |
| 30-39 | 6 | 30 | 90 | 120 | 3 | 15 | 45 | 60 |
| 40-49 | 7 | 35 | 105 | 140 | 3.5 | 18 | 52 | 70 |
| 50-59 | 8 | 40 | 120 | 160 | 4 | 20 | 60 | 80 |
| 60-69 | 10 | 50 | 150 | 200 | 5 | 25 | 75 | 100 |
| 70-79 | 11 | 55 | 165 | 220 | 5.5 | 28 | 82 | 110 |
| 80-89 | 13 | 65 | 195 | 260 | 6.5 | 33 | 97 | 130 |
| 90-99 | 14 | 70 | 210 | 280 | 7 | 35 | 105 | 140 |
| 100-109 | 15 | 75 | 225 | 300 | 7.5 | 37 | 113 | 150 |

- **110 kg and over:** the table has no row. The tool says so and shows the 140 and 70 mg/kg
  arithmetic marked as not a label row.
- **Schedule:** first maintenance dose 4 hours after the load, then every 4 hours, 17 maintenance
  doses in all. The label says to repeat any dose vomited within 1 hour of administration.
**Output.** Load and maintenance in grams and mL, diluent mL, total grams for the course, the
mg/kg figure beside each table row, and the 18-row clock with the last dose time (load + 68 hours).
**Source.** Acetylcysteine Solution label (Hospira), DailyMed set id
5558a5f5-e821-473b-7d8a-5d33d09f0586, "Acetylcysteine as an antidote" and "Dosage Guide and
Preparation."
**Note.** (a) The table rows are whole-kilogram bands that round to the top of the band (70 to
79 kg gets 11 g, which is 140 mg/kg at 79 kg), so a per-kilogram calculation understates the label
dose for most adults. (b) A weight between two rows (29.5 kg) is flagged and both rows shown.
(c) The label's oral instructions are written for the 20% solution; for the 10% solution the tool
shows mg ÷ 100 mg/mL and the 1 mL of diluent per mL that reaches the same 5%, marked as arithmetic.
(d) This label's nomogram text still uses the 200 mcg/mL line with a treatment line 25% lower; the
tool links `acetaminophen-nomogram` and does not restate a line.

### 2. `fomepizole-schedule` — Fomepizole Doses, With and Without Hemodialysis
**Input.** Weight; time of the loading dose; doses given so far; optionally dialysis start and end
times and the time of the last dose.
**Compute.** Load 15 mg/kg. Then 10 mg/kg every 12 hours for 4 doses. Then 15 mg/kg every 12
hours. Each dose is a 30-minute infusion. During hemodialysis: every 4 hours. At dialysis start:
under 6 hours since the last dose, no dose; 6 hours or more, the next scheduled dose. At dialysis
end, by time since the last dose: under 1 hour, no dose; 1 to 3 hours, half of the next scheduled
dose; over 3 hours, the next scheduled dose. Off dialysis: next dose 12 hours from the last dose
given.
**Output.** The next dose in mg and its time; the dose table; which rule fired. States the label's
stop condition (level undetectable or below 20 mg/dL, asymptomatic, normal pH) as text.
**Source.** Fomepizole Injection label (Zydus), set id 256910fe-91f2-48f6-b0b4-55edc52dacd4.

### 3. `us-antivenom-dose` — CroFab, Anavip and Anascorp: Vials, Volumes and the Maintenance Clock
**Input.** Product; number of initial-control doses given and vials in each; time initial control
was achieved.
**Compute.**
- **CroFab:** initial dose 4 to 6 vials (label range 4 to 12); repeat 4 to 6 vials until initial
  control; then 2 vials every 6 hours for up to 18 hours (3 doses). Reconstitute each vial with
  18 mL of 0.9% sodium chloride; dilute the dose to 250 mL; infuse over 60 minutes, the first 10
  minutes at 25 to 50 mL/hour, then 250 mL/hour.
- **Anavip:** 10 vials; further 10-vial doses every hour as needed for initial control (the label
  states no maximum); 4 vials for re-emerging signs; observe at least 18 hours after control. 10 mL
  of saline per vial; dilute to 250 mL; 60 minutes, the first 10 minutes at 25 to 50 mL/hour.
- **Anascorp:** 3 vials, 5 mL of saline per vial, diluted to 50 mL, over 10 minutes; then one vial
  at a time (also diluted to 50 mL, over 10 minutes) at 30 to 60 minute intervals.
**Output.** Cumulative vials, reconstitution diluent total, the three CroFab maintenance times
(control + 6, 12, 18 hours), and the end of the Anavip observation period.
**Source.** CroFab (set id 77abd784-3387-420d-abdc-4fe97215d233); Anavip
(a16596a5-e87e-40c2-8e34-cea5839849c3); Anascorp (5cb65048-a30c-48e5-8bc8-897983d08068).
**Scope.** Counts and clocks. Whether control has been achieved is the reader's finding.

### 4. `pralidoxime-dose` — Pralidoxime and DuoDote by Weight
**Input.** Age group (adult, or 16 and under), weight, route (IV or IM), severity (mild or severe).
**Compute.**
- **Adult IV:** 1,000 to 2,000 mg over 15 to 30 minutes in 100 mL saline (or as a 50 mg/mL
  injection over not less than 5 minutes); a second 1,000 to 2,000 mg dose after about 1 hour and
  every 10 to 12 hours if weakness persists. Intermittent infusion not faster than 200 mg/minute.
- **Pediatric IV (16 and under):** 20 to 50 mg/kg, not over 2,000 mg per dose, over 15 to 30
  minutes, then either 10 to 20 mg/kg/hour, or a second 20 to 50 mg/kg dose at about 1 hour and
  every 10 to 12 hours.
- **Adult IM:** 600 mg (2 mL), repeatable at 15-minute intervals to 1,800 mg; severe, three 600 mg
  doses in rapid succession; the series may repeat about 1 hour after the last injection.
- **Pediatric IM (label Table 1):** under 40 kg, 15 mg/kg per injection and 45 mg/kg per
  three-injection course; 40 kg and over, the adult doses (600 mg per injection, 1,800 mg per
  course).
- **DuoDote:** one autoinjector for two or more mild symptoms, three in rapid succession for any
  severe symptom, for patients weighing more than 41 kg (90 lb).
**Output.** mg range, mL at 50 mg/mL (IV push) or about 300 mg/mL (IM), the infusion in mg/hour,
the course total, the autoinjector count.
**Source.** Protopam Chloride label (set id 2741d8fd-51c2-46be-880b-99f2b20a6137); DuoDote label
(241f42a0-1a33-40e8-8221-201767d999e5).

### 5. `flumazenil-ladder` — Flumazenil Dose Ladder and Cumulative Caps
**Input.** Indication (sedation or anesthesia reversal; suspected overdose), adult or child over 1
year, weight for a child, doses given so far.
**Compute.** Reversal, adult: 0.2 mg over 15 seconds; after 45 seconds a further 0.2 mg,
repeatable at 60-second intervals up to 4 more times, 1 mg maximum. Resedation: repeat at 20-minute
intervals, no more than 1 mg at one time (0.2 mg/min) and no more than 3 mg in any one hour. Child:
0.01 mg/kg (up to 0.2 mg) per dose on the same timing, maximum total 0.05 mg/kg or 1 mg, whichever
is lower. Overdose, adult: 0.2 mg over 30 seconds; after 30 seconds 0.3 mg over 30 seconds; then
0.5 mg over 30 seconds at 1-minute intervals to a cumulative 3 mg; rarely to 5 mg. Resedation
after overdose: at 20-minute intervals, no more than 1 mg at one time (0.5 mg/min) and no more
than 3 mg in any one hour.
**Output.** The next step, mL at 0.1 mg/mL, cumulative mg and what remains under each cap. Past the
cap it says the label gives no further dose and why (no response 5 minutes after a cumulative
5 mg: sedation unlikely to be from benzodiazepines).
**Source.** Flumazenil Injection, USP label (set id 56452ba8-521d-1f84-e063-6294a90af6fc). The
label states that repeat dosing for resedation in pediatric patients is not established; the tool
prints that.

### 6. `dantrolene-mh-vials` — Dantrolene for Malignant Hyperthermia: Dose and Vials
**Input.** Weight; product (Ryanodex 250 mg vial, or a 20 mg vial product: Dantrium Intravenous or
Revonto); cumulative mg given.
**Compute.** Label treatment dose: a minimum of 1 mg/kg by IV push, repeated up to a maximum
cumulative 10 mg/kg. Ryanodex: 250 mg per vial in 5 mL sterile water (50 mg/mL), 125 mg mannitol
per vial. Dantrium Intravenous and Revonto: 20 mg per vial in 60 mL sterile water, 3,000 mg
mannitol per vial. Vials = ceil(mg ÷ vial mg). Sterile water total. Mannitol delivered. Remaining
mg under the 10 mg/kg cumulative figure. Prophylaxis mode: 2.5 mg/kg, starting about 75 minutes
before anesthesia.
**Output.** mg, vials, mL, sterile water needed, mannitol grams, and the vials needed to reach
10 mg/kg (the stocking question).
**Source.** Ryanodex label (set id 8f7b3ac0-604d-4c78-b545-5e0f8ea3d698); Dantrium Intravenous
label (4df35098-8702-46be-ac67-30cfdf1aa570); Revonto label
(3edcfad5-00ad-7587-e063-6394a90addf3).
**Note.** All three labels give the treatment figure as "a minimum of 1 mg/kg." The 2.5 mg/kg
figure is the labels' prophylaxis dose; as a treatment starting dose it does not appear on any of
the three labels. The tool shows the label and lets the reader enter a per-kg dose.

### 7. `rsi-dose-sheet` — Intubation Drug Doses From the Labels
**Input.** Weight (actual), age group, each drug's concentration (defaults shown, editable).
**Compute.** Etomidate 0.3 mg/kg usual (label range 0.2 to 0.6 mg/kg, adults and children over
10; the label makes no recommendation under age 10). Ketamine IV 1 to 4.5 mg/kg (2 mg/kg is the
label's average; IM 6.5 to 13 mg/kg). Succinylcholine IV 0.6 mg/kg average (0.3 to 1.1 mg/kg) in
adults; emergency intubation 2 mg/kg in infants and small children and 1 mg/kg in older children
and adolescents; IM up to 3 to 4 mg/kg, not over 150 mg. Rocuronium 0.6 mg/kg; rapid sequence 0.6
to 1.2 mg/kg; actual body weight in obese patients.
**Output.** One row per drug: label range in mg and mL, the weight basis the label states, and
"label gives no dose for this age group" where it gives none.
**Source.** Amidate (set id b7ed5bf8-ba75-44dc-8f81-96b4ad5766be); Ketalar
(14e8f864-8b8a-4e7e-8439-e510d3107063); Anectine (04a4e6f5-6fa1-42e1-a3f9-21fca7786b15);
Rocuronium Bromide (Baxter, a18fce42-0f3d-4354-845e-57c37ac3a147).
**Note.** No "RSI dose" appears on the etomidate, ketamine or succinylcholine labels; they give
induction and intubation doses. Only the rocuronium label has a rapid sequence section. The sheet
says so and does not import textbook numbers.

### 8. `neostigmine-reversal-dose` — Neostigmine Reversal Dose
**Input.** Weight; depth of block (first twitch well above 10% of baseline or second twitch
present; or first twitch close to 10%); half-life class of the blocker (shorter, longer).
**Compute.** 0.03 mg/kg for shorter half-life agents, or when the first twitch is substantially
above 10% of baseline or a second twitch is present; 0.07 mg/kg for longer half-life agents or
when the first twitch is close to 10%. Maximum total 0.07 mg/kg or 5 mg, whichever is less.
**Output.** mg, mL at the entered concentration, the cap applied, and the label's lines that an
anticholinergic is given before or with it and that the injection takes at least 1 minute.
**Source.** Bloxiverz label (set id d2f55643-2b0d-4ef9-a9d8-b7138b314372).

### 9. `deferoxamine-acute-iron` — Deferoxamine for Acute Iron Poisoning: Rate and 24-Hour Total
**Input.** Weight; route; doses given with times.
**Compute.** Initial dose 1,000 mg. IV: rate up to 15 mg/kg/hour, so minimum time = 1,000 ÷
(15 × kg) hours. Subsequent doses 500 mg every 4 to 12 hours; IV subsequent doses at up to
125 mg/hour (500 mg in not less than 4 hours). Running 24-hour total against 6,000 mg.
**Output.** Maximum mg/hour, minimum infusion time, the cumulative total in the last 24 hours and
the amount left under 6,000 mg.
**Source.** Deferoxamine Mesylate for Injection label (Fresenius Kabi, set id
d91e16df-8daa-4cd2-86a2-273eaa2446e0), section 2.1. The label reserves IV for cardiovascular
collapse and IM for all patients not in shock; the tool prints that.

### 10. `chelation-dose` — Succimer, Edetate Calcium Disodium and Dimercaprol by Weight or Surface Area
**Input.** Agent; weight; height (for surface area); start date and time.
**Compute.**
- **Succimer:** 10 mg/kg or 350 mg/m² every 8 hours for 5 days, then every 12 hours for 14 days
  (19 days; 15 + 28 = 43 doses). The label's capsule table: 8 to 15 kg 100 mg (1 capsule), 16 to
  23 kg 200 mg, 24 to 34 kg 300 mg, 35 to 44 kg 400 mg, over 45 kg 500 mg.
- **Edetate calcium disodium:** 1,000 mg/m²/day (the label's dose for blood lead above 20 and
  below 70 mcg/dL) for 5 days; IV in 250 to 500 mL over 8 to 12 hours, or IM in equal doses 8 to
  12 hours apart; mL at 200 mg/mL. Lead nephropathy: 500 mg/m² every 24 hours for 5 days
  (creatinine 2 to 3 mg/dL), every 48 hours for 3 doses (3 to 4), once weekly (above 4).
- **Dimercaprol:** mild arsenic or gold 2.5 mg/kg four times daily for 2 days, twice on day 3,
  then once daily for 10 days; severe 3 mg/kg every 4 hours for 2 days, four times on day 3, then
  twice daily for 10 days; mercury 5 mg/kg then 2.5 mg/kg once or twice daily for 10 days; lead
  encephalopathy 4 mg/kg first dose alone, then every 4 hours with edetate calcium disodium.
**Output.** Dose, capsules or mL, the dose calendar and the course totals to order.
**Source.** Chemet label (set id 62035612-9505-3a3f-1ac8-e2dbd711d24e); Edetate Calcium Disodium
Injection (Rising, 710a2c8c-3620-4f6f-b8fc-fb19ab9e9f22); BAL in Oil (Akorn,
bee9a137-160f-47e8-a551-ca461ae4f51e).
**Note.** The succimer table has a gap at exactly 45 kg ("35 to 44" then ">45"). The tool flags
45 kg and shows both rows rather than choosing.

### 11. `thrombolytic-dose` — Alteplase and Tenecteplase Dose by Weight and Indication
**Input.** Drug; indication; weight; for catheter clearance, the lumen volume.
**Compute.**
- **Alteplase, ischemic stroke:** 0.9 mg/kg, not over 90 mg; 10% as a bolus over 1 minute, the
  rest over 60 minutes.
- **Alteplase, myocardial infarction, accelerated:** over 67 kg: 15 mg bolus, 50 mg over 30
  minutes, 35 mg over 60 minutes. 67 kg or less: 15 mg, 0.75 mg/kg over 30 minutes, 0.50 mg/kg
  over 60 minutes. Total not over 100 mg.
- **Alteplase, 3-hour:** 65 kg or more: 6 to 10 mg bolus, 50 to 54 mg rest of hour 1, 20 mg, 20 mg.
  Under 65 kg: 0.075, 0.675, 0.25 and 0.25 mg/kg (1.25 mg/kg total).
- **Alteplase, pulmonary embolism:** 100 mg over 2 hours.
- **Tenecteplase, ischemic stroke:** under 60 kg 15 mg (3 mL); 60 to under 70 kg 17.5 mg (3.5 mL);
  70 to under 80 kg 20 mg (4 mL); 80 to under 90 kg 22.5 mg (4.5 mL); 90 kg or more 25 mg (5 mL).
  Single bolus over 5 seconds, within 3 hours of onset.
- **Tenecteplase, STEMI:** the same bands at 30, 35, 40, 45 and 50 mg (6 to 10 mL).
- **Cathflo:** 30 kg or more: 2 mg in 2 mL. Under 30 kg: 110% of the lumen volume, not over 2 mg
  in 2 mL. A second equal dose may be instilled if function is not restored at 120 minutes.
**Output.** Bolus and infusion in mg and mL (alteplase at 1 mg/mL as reconstituted, tenecteplase
at 5 mg/mL), the pump rate, and the volume left in the vial that is not part of the dose.
**Source.** Activase (set id c669f77c-fa48-478b-a14b-80b20a0139c2); TNKase
(e647640d-c395-4b4b-a0be-1162f9c21d84); Cathflo Activase (91ecdef2-95ff-42dd-a31c-c8a09cab3ad9).
**Note.** The TNKase label carries the stroke indication and its own band table. The commonly
quoted "0.25 mg/kg, maximum 25 mg" is not what the label prints; the label prints bands, and the
tool uses the bands.

### 12. `passive-immunization-dose` — Hepatitis B, Varicella and Tetanus Immune Globulin Doses
**Input.** Product; weight; age.
**Compute.** HBIG 0.06 mL/kg IM (newborn of an HBsAg-positive mother 0.5 mL, preferably within 12
hours of birth; both HBIG labels state it). VariZIG by the label table: 2.0 kg or less 62.5 units
(0.5 vial); 2.1 to 10 kg 125 units (1 vial); 10.1 to 20 kg 250; 20.1 to 30 kg 375; 30.1 to 40 kg
500; 40.1 kg or more 625 units (5 vials); ideally within 96 hours; not over 3 mL per injection
site. Tetanus immune globulin: 250 units for age 7 and older; under 7 the label allows
4.0 units/kg or the whole 250-unit syringe.
**Output.** Units, mL, vials or syringes, and the label's timing sentence.
**Source.** HyperHEP B (set id cda35690-672f-46cd-8520-e37f4d66a8d7); Nabi-HB
(47fe1a99-5078-4b89-84fa-9e8387baec5c); VariZIG (f367f996-aafa-4b8b-8cb4-63a009cd2015); HyperTET
(393fa198-7e07-4162-bd0a-9d873f1544a9).

### 13. `botulism-antitoxin-dose` — Botulism Antitoxin (BAT) and BabyBIG Dose and Rate
**Input.** Age, weight.
**Compute.** BAT: adults 17 and older, one vial. Age 1 to under 17: percent of the adult dose by
the label's Table 2 (10 to 14 kg 20%; 15 to 19 kg 30%; 20 to 24 kg 40%; 25 to 29 kg 50%; 30 to
34 kg 60%; 35 to 39 kg 65%; 40 to 44 kg 70%; 45 to 49 kg 75%; 50 to 54 kg 80%; 55 kg or more
100%), which the label says is based on the Salisbury rule (30 kg or less: 2 × kg; over 30 kg:
kg + 30), minimum 20%, never more than one vial. Infants under 1 year: 10% of the adult dose
regardless of weight. Rates: adult start 0.5 mL/min for 30 minutes, doubling every 30 minutes to a
maximum 2 mL/min; pediatric start 0.01 mL/kg/min, increments of 0.01 mL/kg/min every 30 minutes,
maximum 0.03 mL/kg/min and not over the adult rate. BabyBIG: 1.0 mL/kg (50 mg/kg); start
0.5 mL/kg/hour, to 1.0 mL/kg/hour after 15 minutes.
**Output.** Percent of a vial, the starting and maximum rate in mL/min or mL/hour.
**Source.** BAT label (set id 9f3c4292-8773-4781-8264-d71c80d3eabd); BabyBIG
(9ec59262-35c1-4d8e-8451-a7cfbacb0675).
**Note.** The table and the stated rule disagree. Inside most bands the table uses the figure for
the bottom of the band (12 kg: table 20%, rule 24%; 19 kg: table 30%, rule 38%). From 55 to 69 kg
the table gives more than the rule (55 kg: table 100%, rule 85%). The label instructs dosing "by
body weight according to Table 2," so the tool uses the table and shows the rule's figure beside
it. A child aged 1 or older under 10 kg has no table row; the tool shows the 20% minimum and says
the table does not list the weight.

### 14. `au-rate-saar` — Antimicrobial Days per 1,000 Days Present, per 100 Admissions, and SAAR
**Input.** Antimicrobial days (by agent or category), days present, admissions (facility-wide
only), and optionally the predicted antimicrobial days from the facility's NHSN report.
**Compute.** Rate = antimicrobial days ÷ days present × 1,000. Facility-wide only: antimicrobial
days ÷ admissions × 100. SAAR = observed ÷ predicted.
**Output.** The rates, the SAAR, and the protocol's cautions as checks: facility-wide days present
must not be the sum of unit days present; the admissions rate is facility-wide only.
**Source.** CDC NHSN Antimicrobial Use and Resistance Module protocol, July 2026, the rate
formulas and the SAAR section. Predicted days come from CDC models built on 2023 national data and
applied inside NHSN; the tool cannot and does not predict.

### 15. `antimicrobial-day-counter` — Count Antimicrobial Days and Days Present From Rows
**Input.** A CSV of administrations (patient reference, agent, route, date-time, location) and a
CSV of stays or transfers (patient reference, location, in and out date-times); uses the upload
workbench.
**Compute.** One antimicrobial day per patient per agent per calendar day on which any amount was
given; counted on the day of administration only (two doses a day for three days is three days).
Route stratification IV, IM, digestive, respiratory; an agent given by two routes on one day is one
total day and one day in each route. Days present: one per patient per location per calendar day
for any portion of the day, counting admission, discharge and transfer days; a transfer day counts
in both locations; facility-wide counts one per patient per calendar day. Length of therapy as a
by-product (calendar days on any agent).
**Output.** Monthly totals by agent, route and location, feeding tool 14; a list of rows it could
not place.
**Source.** Same protocol: "Numerator Data," Tables 1 to 3, "Days present," Appendix C examples.
**Scope.** The reader's file, in the browser. Nothing is sent anywhere.

### 16. `cdi-labid-category` — C. difficile LabID Event: Onset Category, Incident or Recurrent, and Rate
**Input.** Specimen date and location type; admission date; date of the last inpatient discharge
from the same facility; date of the patient's most recent prior positive. Rate panel: event count
and patient days.
**Compute.** Hospital day 1 is the admission date.
- **Day counting from a prior positive:** the prior specimen's collection date is day 1, so a
  specimen collected N calendar days later is on day N + 1.
- **Duplicate (not an event):** a positive for the same patient and location on day 14 or earlier
  after the previous positive.
- **Community-onset:** outpatient specimen with no inpatient discharge from the facility in the
  prior 28 days, or inpatient specimen on hospital day 1, 2 or 3.
- **Community-onset healthcare facility-associated:** a community-onset event with an inpatient
  discharge from the same facility 28 days or fewer before the specimen.
- **Healthcare facility-onset:** inpatient specimen on or after hospital day 4.
- **Incident:** more than 56 days after the most recent event (day 57 or later), or no prior
  event. **Recurrent:** more than 14 and 56 or fewer days (day 15 to day 56). **Unassigned:** 14
  days or fewer.
- **Rate panel:** events ÷ patient days × 10,000; SIR = observed ÷ predicted (reader input).
**Output.** The category, the day numbers that decided it, and the rate.
**Source.** CDC NHSN MDRO and CDI Module protocol, January 2026, "Duplicate C. difficile-positive
test," the onset categories, the incident and recurrent definitions, and the rate formulas.
**Note.** The protocol states "the date of first specimen collection is considered day 1" for the
14-day and 56-day rules. Its worked example for the same 14-day rule in the MRSA section says a
specimen on January 19 after one on January 5 is "day 15" and is a new event. A tool that
subtracts dates and compares the difference with 14 and 56 is off by one day at every boundary.
The protocol states no day-1 convention for the 28-day discharge window; the tool uses the date
difference and says so.

### 17. `ddd-rate` — Defined Daily Doses per 100 Bed-Days and per 1,000 Patient-Days
**Input.** Grams used (or packages × strength), the agent's DDD in grams (reader input, with a
link to the WHO index), bed-days or patient-days.
**Compute.** DDDs = grams ÷ DDD. Rate = DDDs ÷ bed-days × 100 (the WHO presentation) or × 1,000
(the same arithmetic on another base; the WHO page does not name it).
**Output.** DDDs, both rates, and the DDD value and index year the reader entered.
**Source.** WHO Collaborating Centre for Drug Statistics Methodology, "Use of ATC/DDD"
(atcddd.fhi.no).
**Licensing.** The Centre's copyright notice requires a reference, forbids copying and
distribution for commercial purposes and forbids changing the material. The DDD values therefore
do not ship; the value is reader input. This also removes a yearly maintenance job.

### 18. `antibiogram-builder` — Cumulative Antibiogram From an Isolate List
**Input.** A CSV of isolates (patient reference, organism, collection date, specimen type, one
column per agent with S, I or R); the period.
**Compute.** Keep final, verified results only (reader's flag). Keep the first isolate of each
species per patient in the period, whatever the body site or susceptibility profile. Drop
surveillance isolates when flagged. For each organism and agent: n tested, percent susceptible =
S ÷ n tested (intermediate is not counted as susceptible). Mark any organism with fewer than 30
isolates "interpret with caution." A Wilson interval per cell from `proportion-ci`.
**Output.** The organism-by-agent table with n, the flagged rows, the number of duplicates removed,
and a CSV.
**Source.** AHRQ, Nursing Home Antimicrobial Stewardship Guide, Comprehensive Antibiogram Toolkit,
"Antibiogram Specifications" (AHRQ Pub. No. 14-0022-4-EF, May 2014). It states these rules and
attributes them to the CLSI guideline (it cites the third edition); the tool cites AHRQ and ships
no CLSI text.

### 19. `surgical-prophylaxis-redose` — Surgical Prophylaxis: Weight-Based Dose and Redose Clock
**Input.** Agent; weight; adult or child; time the preoperative dose was started; incision time.
**Compute.** Table 1 of the guideline. The redosing interval runs from the start of the
preoperative dose. "None" means the table prints NA, which its footnote explains as based on
typical case length (redosing may be needed in unusually long procedures).

| Agent | Adult dose | Pediatric dose | Redose (hours) |
|---|---|---|---|
| Ampicillin-sulbactam | 3 g | 50 mg/kg of the ampicillin component | 2 |
| Ampicillin | 2 g | 50 mg/kg | 2 |
| Aztreonam | 2 g | 30 mg/kg | 4 |
| Cefazolin | 2 g; 3 g at 120 kg or more | 30 mg/kg | 4 |
| Cefuroxime | 1.5 g | 50 mg/kg | 4 |
| Cefotaxime | 1 g | 50 mg/kg | 3 |
| Cefoxitin | 2 g | 40 mg/kg | 2 |
| Cefotetan | 2 g | 40 mg/kg | 6 |
| Ceftriaxone | 2 g | 50 to 75 mg/kg | None |
| Ciprofloxacin | 400 mg | 10 mg/kg | None |
| Clindamycin | 900 mg | 10 mg/kg | 6 |
| Ertapenem | 1 g | 15 mg/kg | None |
| Fluconazole | 400 mg | 6 mg/kg | None |
| Gentamicin | 5 mg/kg on dosing weight, single dose | 2.5 mg/kg on dosing weight | None |
| Levofloxacin | 500 mg | 10 mg/kg | None |
| Metronidazole | 500 mg | 15 mg/kg (neonates under 1,200 g: 7.5 mg/kg once) | None |
| Moxifloxacin | 400 mg | 10 mg/kg | None |
| Piperacillin-tazobactam | 3.375 g | 2 to 9 months: 80 mg/kg; over 9 months and 40 kg or less: 100 mg/kg (piperacillin component) | 2 |
| Vancomycin | 15 mg/kg | 15 mg/kg | None |

The pediatric dose is capped at the usual adult dose. Gentamicin dosing weight: actual weight,
or ideal + 0.4 × (actual − ideal) when actual is more than 20% above ideal. Timing check: started
within 60 minutes before incision (120 minutes for vancomycin and fluoroquinolones).
**Output.** The dose, whether the start time met the window, and each redose time while the case
runs. It notes as text the guideline's other redose triggers (blood loss over 1,500 mL; a
shortened half-life, for example extensive burns), that redosing may not be warranted when the
half-life is prolonged (renal insufficiency), and the table footnote that experts recommend
cefotaxime 2 g in obese patients.
**Source.** Bratzler DW, et al. Clinical practice guidelines for antimicrobial prophylaxis in
surgery. Am J Health Syst Pharm 2013;70:195-283, Table 1, read cell by cell in the copy ASHP hosts.
**Licensing.** Facts from a published table with attribution; no guideline prose is reproduced.

### 20. `med-admin-window` — Was This Dose Given Inside the CMS Window?
**Input.** Scheduled time; actual time; the order's frequency; whether the hospital's policy
classes the drug as time-critical.
**Compute.** Time-critical: within 30 minutes before or after (1-hour window). Not time-critical,
prescribed more often than daily but no more often than every 4 hours: within 1 hour before or
after (2-hour window). Daily, weekly or monthly: within 2 hours before or after (4-hour window).
An order more frequent than every 4 hours is on CMS's list of examples of time-critical
medications; the tool says so and asks for the policy class. Batch mode: a CSV of scheduled and
actual times gives the percent on time by class.
**Output.** Earliest and latest acceptable time, minutes early or late, on time or not, and for
a file the on-time rate.
**Source.** CMS State Operations Manual, Appendix A (Rev. 248, issued September 18, 2026), tag
A-0405 (the tag's own line reads Rev. 200, issued February 21, 2020), interpretive guidelines for
42 CFR 482.23(c).
**Scope.** These are the outer limits CMS tells surveyors to check; a hospital policy may be
tighter, and the tool accepts a tighter window as input.

### 21. `adjusted-patient-days` — Adjusted Patient Days and Pharmacy Cost or Hours per Adjusted Day
**Input.** Inpatient days; gross inpatient revenue; gross outpatient revenue; pharmacy worked
hours; drug expense.
**Compute.** The federal worksheet's steps: revenue per inpatient day = gross inpatient revenue ÷
inpatient days; adjusted outpatient days = gross outpatient revenue ÷ revenue per inpatient day;
adjusted patient days = inpatient days + adjusted outpatient days. This equals inpatient days ÷
(inpatient revenue ÷ total patient revenue). Worked hours per adjusted day and drug cost per
adjusted day.
**Output.** The three figures and the outpatient share that drove the adjustment.
**Source.** HUD Handbook 4615.1 REV-1, Appendix 1, "Adjusted Patient Days Calculation" (the
worksheet "Patient Days Adjusted for Outpatient Workload," lines 1 to 7; gross revenues,
non-patient revenues excluded). Two state laws use the same construction: Virginia 12VAC5-215-10
("inpatient days divided by the percentage of inpatient revenues to total patient revenues") and
Florida Statutes 409.911(1)(a) (acute and intensive care days over the ratio of inpatient revenues
to gross revenues).
**Note.** HUD publishes the worksheet for one purpose, the acute-care eligibility test for FHA
Section 242 hospital mortgage insurance, and it splits each line into eligible and ineligible
services. The tool uses the worksheet's arithmetic on the hospital's totals and says so. No
definition was found in the Code of Federal Regulations (an eCFR full-text search for "adjusted
patient days" returned nothing on October 10, 2026).

## Backfills (live tools that should do more)

1. **`nac-dosing` — bring it to the current US label.**
   *What the live tool shows* (`lib/tox-v110.js`, lines 108 to 126): a three-bag option (150 mg/kg
   over 1 hour, 50 mg/kg over 4 hours, 100 mg/kg over 16 hours) and an option labeled "two-bag
   SNAP" (200 mg/kg over 4 hours, then 100 mg/kg over 16 hours) cited to "Bateman DN, et al,
   Lancet 2014"; dosing weight `Math.min(weight, 110)` with the text "The dosing weight is capped
   at 110 kg"; the two-bag option at any weight; no diluent volume.
   *What the label says* (Acetadote, set id 472f158a-5ab9-4308-8e49-1116e6ea3d39, version 17,
   sections 2.4 and 2.5, Tables 2 and 3):
   (a) The dose is fixed at 100 kg and above: three-bag 15,000, 5,000 and 10,000 mg; two-bag
   20,000 and 10,000 mg. At 105 kg the live tool gives 15,750 mg in bag 1 against the label's
   15,000 mg; at 110 kg and over it gives 16,500 mg, 10% above the label.
   (b) The two-bag regimen (200 mg/kg over 4 hours, then 100 mg/kg over 16 hours, 20 hours in all)
   is the label's own alternative regimen, for patients 41 kg or greater only; the label says data
   are insufficient to recommend it at 40 kg or less.
   (c) Diluent volumes by weight band. Three-bag: 5 to 20 kg 3, 7 and 14 mL/kg; 21 to 40 kg 100,
   250 and 500 mL; 41 kg and over 200, 500 and 1,000 mL. Two-bag: 1,000 mL then 500 mL. The label
   doses from 5 kg; under 5 kg is not studied.
   *Attribution.* The 200 then 100 mg/kg regimen is the one studied by Wong and Graudins (2016);
   the label's section 14 describes it from a Danish cohort (2012 to 2014). Bateman 2014 (the SNAP
   trial) tested a different, 12-hour protocol. The live label "two-bag SNAP" and its Bateman
   citation are both wrong for the regimen the tool computes.
   *Change.* Fix the dose at 100 kg; refuse the two-bag option under 41 kg; add diluent volumes;
   rename the option "two-bag (label alternative, 20 h)" and cite the label. Keep the 110 kg
   convention only behind a jurisdiction switch that names its source, which was not read for this
   spec.
2. **`co-cn-antidote` — compute, and correct two lines.**
   *What the live tile shows* (`views/group-i.js`, lines 413 to 426, static text): "Pediatric:
   70 mg/kg IV (max 5 g) over 15 min." under hydroxocobalamin; "Pediatric: 400 mg/kg (max 12.5 g)."
   under sodium thiosulfate; adult thiosulfate "12.5 g IV (50 mL of 25% solution) over 10-30 min";
   no sodium nitrite dose at all.
   *What the labels say.* Nithiodote (set id ff4941b3-9901-4aab-adcf-c5327bede34e, version 10):
   children, sodium nitrite 0.2 mL/kg (6 mg/kg) at 2.5 to 5 mL/minute, not over 10 mL, then sodium
   thiosulfate 1 mL/kg (250 mg/kg), not over 50 mL; adults, 10 mL of sodium nitrite then 50 mL of
   sodium thiosulfate; if signs reappear, repeat at one-half the original dose of both. The live
   400 mg/kg is 60% above the label's 250 mg/kg (the 12.5 g ceiling is the same as 50 mL). The
   label gives no infusion time for thiosulfate; the live "over 10-30 min" was not found in it.
   Cyanokit (set id d56fcc8d-bd64-46ab-b0c0-2124bd745a6b, version 2), section 8.4: "Safety and
   effectiveness of CYANOKIT have not been established in this population. In non-US marketing
   experience, a dose of 70 mg/kg has been used to treat pediatric patients." The label states no
   pediatric maximum; the live "max 5 g" is not on it. Adult: 5 g over 15 minutes; a second 5 g
   over 15 minutes to 2 hours, 10 g total.
   *Change.* Correct the thiosulfate line; reword the hydroxocobalamin pediatric line to the
   label's statement; add the sodium nitrite dose and the label's caution under 6 months of age;
   add weight input, mL outputs, the half-dose repeat and the adult second dose.
3. **`methemoglobin` — add the label dose.** Provayblue: 1 mg/kg over 5 to 30 minutes; one repeat
   of 1 mg/kg at 1 hour if the level stays above 30% or symptoms persist; a single dose at eGFR 15
   to 59 mL/min/1.73 m². Output mg and mL at 5 mg/mL.
4. **`naloxone` — add the infusion.** Hourly rate = two-thirds of the bolus that produced
   reversal (Goldfrank 1986, a computer-simulation result the abstract states); label dilution
   2 mg in 500 mL = 0.004 mg/mL, so mL/hour = mg/hour ÷ 0.004; the reader may enter another
   concentration.
5. **`rabies-pep` — add the volume by product.** 20 IU/kg is live. HyperRAB is 300 IU/mL
   (0.0665 mL/kg); Kedrab is 150 IU/mL; HyperRAB's label warns that its predecessor was 150 IU/mL.
   Output mL and vials per product, and the HyperRAB label's "no later than day 7."
6. **`calcium-replacement` — add label rate caps and age bands.** Calcium gluconate (9.3 mg
   elemental calcium per mL): neonate 100 to 200 mg/kg, pediatric 29 to 60 mg/kg, adult 1,000 to
   2,000 mg; bolus not faster than 200 mg/min (adult) or 100 mg/min (pediatric, including
   neonates). Calcium chloride 10%: 27 mg (1.4 mEq) elemental calcium per mL, adult 200 to
   1,000 mg, not faster than 1 mL/min. [spec-v1630](spec-v1630.md) lists the same backfill from
   the calcium gluconate label; build it once.
7. **`acetaminophen-nomogram` — name the line.** The Acetadote label calls its figure the
   "revised" nomogram while the oral acetylcysteine label still prints the 200 mcg/mL line with a
   treatment line 25% lower. The tile should say which label uses which.

## Rejected

| Idea | Why not |
|---|---|
| Sodium nitrite dose by hemoglobin for children (table) | The current Nithiodote label has no table; it says only that the dose "should be reduced proportionately to the hemoglobin concentration," with no reference value. Nothing to compute. |
| Push-dose pressor dilution | The Biorphen label gives a ready-to-use 100 mcg/mL vial and, for the 10 mg/mL vial, says it must be diluted, with no recipe. No label gives push-dose epinephrine. The remaining arithmetic is `dose-volume`. |
| Glucagon for beta-blocker poisoning; octreotide for sulfonylurea; ethanol infusion | Not on any label; no single primary source with a dose. |
| Physostigmine | The only DailyMed entry read is for Anticholium, a product imported under a shortage letter and not FDA-approved. Its text carries two dosing statements that differ (0.04 mg/kg, maximum 2 mg, in one section; pediatric 0.02 mg/kg at no more than 0.5 mg/min in another). Not specified until the document is read end to end. |
| Black widow and coral snake antivenin | One vial (Latrodectus); "3 to 5 vials" (coral). No computation. |
| Reteplase | Fixed 10 + 10 units; nothing to compute. |
| Hypertonic saline bolus volume | Guideline figures differ by society; `sodium-correction` covers the rate limit. |
| Electrolyte replacement protocols | Institutional; `electrolyte-replacement` already labels them so. |
| ASHP Standardize 4 Safety concentrations | A list (admission rule 1), ASHP copyright, revised without a machine-readable file. |
| Pediatric code sheet by length | Proprietary tape; `peds-weight-dose` and `peds-dose` cover the label-sourced doses. |
| Smart-pump limits, pharmacist-to-bed ratios, first-dose review time | Opinions or policy; no primary number. |
| SAAR prediction | CDC's models run inside NHSN on facility factors; predicted days are reader input in tool 14. |
| Shipping WHO DDD values | The copyright notice forbids commercial copying and any change; reader input instead. |
| Combination antibiogram | The public AHRQ source does not describe it; the method sits in the paid CLSI document. |
| IV-to-oral eligible count | Criteria are institutional. |
| Hospital medication error rate, dispensing-cabinet override and stock-out rates, controlled-substance discrepancy rate, IV workflow yield | Plain ratios with no primary definition; a hospital error rate has no federal formula (the F759 rule is for nursing facilities). `proportion-ci` serves the arithmetic. |
| Inventory turns, days on hand, reorder point, safety stock; budget variance by price, volume and mix | Inventory arithmetic is specified once, as `inventory-turns` in [spec-v1638](spec-v1638.md); budget variance has no primary source. |
| Verbal order authentication clock (42 CFR 482.24(c)) | No federal number; timing is state law or hospital policy. |
| USP 797/800 checklists | Text, and USP chapter text is not licensed to ship. |
| Dantrolene 2.5 mg/kg as the treatment dose | Not the labels' treatment figure (see tool 6). |
| PCC, andexanet | Live in `anticoag-reversal`; not extended in this wave. |
| Vancomycin and aminoglycoside pharmacokinetics | Specified in [spec-v1631](spec-v1631.md). |
| Oncology rescue agents (mesna, leucovorin, glucarpidase) | Specified in [spec-v1635](spec-v1635.md). |
| Phenytoin and fosphenytoin loading dose and rate | Specified once, as `fosphenytoin-load-rate` in [spec-v1631](spec-v1631.md). |
| Medication-pass error rate (F759) | Specified once, as `med-pass-error-rate` in [spec-v1638](spec-v1638.md). |
| LabID rate as its own id | Folded into `cdi-labid-category` (tool 16) as the rate panel. |

## Research record

DailyMed URLs are `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/<set id>.xml`; the full
set ids, versions and dates are in the table under Sources.

| Finding | Where read (URL) | Effect on the spec |
|---|---|---|
| Acetadote labels a two-bag regimen (200 mg/kg over 4 h, 100 mg/kg over 16 h) for 41 kg and over, fixes doses at 100 kg and over, and gives diluent volumes by band | …/spls/472f158a-5ab9-4308-8e49-1116e6ea3d39.xml, sections 2.4, 2.5, Tables 2 and 3 | Backfill 1; no new IV tool |
| Live `nac-dosing` caps at 110 kg and labels 200/100 as "two-bag SNAP" citing Bateman 2014 | repo `lib/tox-v110.js` lines 108-126 | Backfill 1 |
| Wong and Graudins 2016 used 200 mg/kg over 4 h then 100 mg/kg over 16 h; Bateman 2014 tested a 12-hour protocol; the Acetadote label's section 14 describes the two-bag regimen from a Danish cohort | pubmed 26594846; pubmed 24290406 (abstracts via efetch); Acetadote section 14 | Backfill 1, attribution |
| Oral acetylcysteine: 140 mg/kg, then 70 mg/kg at 4 h and every 4 h for 17 doses; 3 mL diluent per mL of 20% | …/spls/5558a5f5-e821-473b-7d8a-5d33d09f0586.xml | Tool 1 |
| **Corrected in verification:** the oral acetylcysteine label doses patients of 20 kg and over from a weight-band table (70 to 79 kg: 11 g load, 5.5 g maintenance), calculates only under 20 kg, has no row above 109 kg, and states "If the patient vomits any oral dose within 1 hour of administration, repeat that dose" | same label, "Dosage Guide and Preparation" and instruction 6 | Tool 1 rewritten to the table; the earlier draft computed mg/kg at every weight (70 kg: 9,800 mg) and listed the vomiting rule as unread |
| Fomepizole doses and the dialysis table | …/spls/256910fe-91f2-48f6-b0b4-55edc52dacd4.xml | Tool 2 |
| CroFab 4 to 6 vials, 2 vials every 6 h × 3, 18 mL per vial, 250 mL, rate steps | …/spls/77abd784-3387-420d-abdc-4fe97215d233.xml | Tool 3 |
| Anavip 10 / 10 / 4 vials, 10 mL per vial, repeat every hour, 18-hour observation | …/spls/a16596a5-e87e-40c2-8e34-cea5839849c3.xml | Tool 3 |
| Anascorp 3 vials then 1 vial at 30 to 60 min, 5 mL per vial, diluted to 50 mL, 10 min | …/spls/5cb65048-a30c-48e5-8bc8-897983d08068.xml | Tool 3 (the 50 mL dilution added in verification) |
| Cyanokit adult 5 g over 15 min, second 5 g over 15 min to 2 h; section 8.4: pediatric safety and effectiveness not established, 70 mg/kg in non-US experience, no maximum stated | …/spls/d56fcc8d-bd64-46ab-b0c0-2124bd745a6b.xml | Backfill 2 |
| Nithiodote child doses 0.2 mL/kg (max 10 mL) and 1 mL/kg = 250 mg/kg (max 50 mL); half-dose repeat; hemoglobin reduction stated without numbers; caution under 6 months | …/spls/ff4941b3-9901-4aab-adcf-c5327bede34e.xml | Backfill 2; hemoglobin table rejected |
| Live tile says thiosulfate "400 mg/kg (max 12.5 g)" and hydroxocobalamin "70 mg/kg IV (max 5 g)" | repo `views/group-i.js` lines 413-426 | Backfill 2 |
| Provayblue 1 mg/kg, repeat at 1 h, single dose at eGFR 15 to 59 | …/spls/4f6848e5-35ed-4046-b13c-3032b5ba3232.xml | Backfill 3 |
| Pralidoxime adult and pediatric IV and IM doses; adult repeat at 1 h and every 10 to 12 h; 200 mg/min; pediatric IM table row for 40 kg and over is "use adult dosing" (600 mg, 1,800 mg) | …/spls/2741d8fd-51c2-46be-880b-99f2b20a6137.xml | Tool 4 (the 40 kg row and adult repeat added in verification) |
| DuoDote one or three injectors, for patients weighing more than 41 kg; not established at 41 kg or less | …/spls/241f42a0-1a33-40e8-8221-201767d999e5.xml | Tool 4; the test boundary was corrected to 41.0 and 41.1 kg |
| Flumazenil ladders and caps; overdose resedation at 0.5 mg/min | …/spls/56452ba8-521d-1f84-e063-6294a90af6fc.xml | Tool 5 |
| Dantrolene: minimum 1 mg/kg, cumulative 10 mg/kg; 2.5 mg/kg is prophylaxis; vial contents; Revonto matches Dantrium (20 mg, 60 mL, 3,000 mg mannitol); Ryanodex 125 mg mannitol per vial | …/spls/8f7b3ac0-604d-4c78-b545-5e0f8ea3d698.xml; …/spls/4df35098-8702-46be-ac67-30cfdf1aa570.xml; …/spls/3edcfad5-00ad-7587-e063-6394a90addf3.xml | Tool 6; 2.5 mg/kg is not a label treatment dose |
| Etomidate, ketamine, succinylcholine, rocuronium label doses; etomidate 2 mg/mL, ketamine 10, 50 and 100 mg/mL, succinylcholine 20 mg/mL | …/spls/b7ed5bf8-ba75-44dc-8f81-96b4ad5766be.xml; 14e8f864-8b8a-4e7e-8439-e510d3107063; 04a4e6f5-6fa1-42e1-a3f9-21fca7786b15; a18fce42-0f3d-4354-845e-57c37ac3a147 | Tool 7 |
| Neostigmine 0.03 and 0.07 mg/kg, cap 5 mg | …/spls/d2f55643-2b0d-4ef9-a9d8-b7138b314372.xml | Tool 8 |
| Bridion: 2, 4 and 16 mg/kg on actual body weight, 100 mg/mL; the live `sugammadex` matches | …/spls/5171d883-fe8f-482c-97ab-40b00975b64a.xml; repo `lib/medication-v5.js` | No backfill |
| Deferoxamine 1,000 mg, 15 mg/kg/h, 500 mg, 125 mg/h, 6,000 mg per 24 h | …/spls/d91e16df-8daa-4cd2-86a2-273eaa2446e0.xml | Tool 9; 15 mg/kg/h is a rate cap, not a dose |
| Succimer schedule and capsule table; EDTA 1,000 mg/m²/day (blood lead 20 to 70 mcg/dL), 5 days, and nephropathy schedule; dimercaprol schedules | …/spls/62035612-9505-3a3f-1ac8-e2dbd711d24e.xml; 710a2c8c-3620-4f6f-b8fc-fb19ab9e9f22; bee9a137-160f-47e8-a551-ca461ae4f51e | Tool 10 |
| Alteplase stroke, both MI tables, PE; 1 mg/mL | …/spls/c669f77c-fa48-478b-a14b-80b20a0139c2.xml | Tool 11 |
| TNKase stroke bands (15 to 25 mg) and STEMI bands (30 to 50 mg); reconstituted to 5 mg/mL | …/spls/e647640d-c395-4b4b-a0be-1162f9c21d84.xml | Tool 11; stroke is on the label, as bands |
| Cathflo 2 mg; under 30 kg 110% of lumen volume | …/spls/91ecdef2-95ff-42dd-a31c-c8a09cab3ad9.xml | Tool 11 |
| HBIG 0.06 mL/kg and newborn 0.5 mL (both labels); VariZIG table; HyperTET 250 units and 4 units/kg | …/spls/cda35690-672f-46cd-8520-e37f4d66a8d7.xml; 47fe1a99-5078-4b89-84fa-9e8387baec5c; f367f996-aafa-4b8b-8cb4-63a009cd2015; 393fa198-7e07-4162-bd0a-9d873f1544a9 | Tool 12 |
| BAT Table 2, Salisbury rule, rates; the table exceeds the rule from 55 to 69 kg; BabyBIG 1 mL/kg and rates | …/spls/9f3c4292-8773-4781-8264-d71c80d3eabd.xml; 9ec59262-35c1-4d8e-8451-a7cfbacb0675 | Tool 13 (the 55 to 69 kg direction added in verification) |
| HyperRAB 300 IU/mL, 0.0665 mL/kg, not after day 7; Kedrab 150 IU/mL | …/spls/f82880b8-998c-4659-8f20-6dcc81f258e9.xml; 53f2a23b-c479-4c24-8cab-ee7a33a2633e | Backfill 5 |
| Naloxone 2 mg in 500 mL = 0.004 mg/mL; two-thirds of the bolus per hour | …/spls/8535cc84-ad4a-4d67-8480-fb5a2e3406f8.xml; pubmed 3963538 | Backfill 4 |
| Calcium gluconate 9.3 mg/mL, age bands, 200 and 100 mg/min; calcium chloride 27 mg/mL, 1 mL/min | …/spls/16307c00-d0d5-4e05-821f-17b0c1a29fc9.xml; 5b0bd762-4c87-597e-e063-6394a90a8303 | Backfill 6 |
| Biorphen: 40 to 100 mcg bolus; 10 mg/mL "must be diluted" with no recipe | …/spls/2f715e4e-b269-b935-d2c9-003cb29770be.xml | Push-dose rejected |
| Antimicrobial day, days present, both rates, SAAR = observed ÷ predicted (2023 baseline) | cdc.gov/nhsn/pdfs/pscmanual/11pscaurcurrent.pdf (July 2026) | Tools 14, 15 |
| CDI onset, incident, recurrent, duplicate rules; × 10,000 patient days | cdc.gov/nhsn/pdfs/pscmanual/12pscmdro_cdadcurrent.pdf (January 2026) | Tool 16 |
| **Corrected in verification:** NHSN counts the prior specimen date as day 1; its MRSA example calls January 19 after January 5 "day 15" and a new event | same protocol, "Duplicate C. difficile-positive test" and the MRSA blood-specimen example | Tool 16 compute and tests restated in day numbers; a date-difference reading is off by one |
| DDD presentation per 100 bed-days; copyright terms | atcddd.fhi.no/use_of_atc_ddd/; atcddd.fhi.no/copyright_disclaimer/ | Tool 17; values are reader input |
| First isolate per patient; 30 or more isolates; percent S excludes I; final verified results; at least annually | ahrq.gov/sites/default/files/wysiwyg/nhguide/5_TK2_P2T3-Antibiogram_Specifications_Phase_2.pdf | Tool 18. **Corrected:** the publication number printed on the document is 14-0022-4-EF (May 2014) |
| Surgical prophylaxis doses and redosing intervals, every cell of Table 1 with footnotes a to g; 60 and 120 minute windows; blood loss over 1,500 mL | ashp.org/-/media/assets/policy-guidelines/docs/therapeutic-guidelines/therapeutic-guidelines-antimicrobial-prophylaxis-surgery.pdf | Tool 19; adult doses for the no-redose agents and all pediatric doses added in verification |
| No superseding joint US surgical prophylaxis guideline was found by PubMed title search on October 10, 2026; the ASHP-hosted file is still the 2013 document | eutils.ncbi.nlm.nih.gov esearch (title terms "surgical antimicrobial prophylaxis," "antimicrobial prophylaxis in surgery," guideline, 2020 to 2026) | Tool 19 keeps the 2013 table; see Verify at build |
| Administration windows: 1, 2 and 4 hours total; the tag is Rev. 200 (February 21, 2020) inside Appendix A Rev. 248 (September 18, 2026) | cms.gov/Regulations-and-Guidance/Guidance/Manuals/downloads/som107ap_a_hospitals.pdf | Tool 20 |
| A federal adjusted patient days worksheet exists (gross revenues; inpatient days + outpatient revenue ÷ revenue per inpatient day) | hud.gov/sites/documents/46151x1hsgh.pdf (Handbook 4615.1 REV-1, Appendix 1) | Tool 21 kept as a normal tool on this source |
| State definitions of adjusted patient days | law.lis.virginia.gov/admincode/title12/agency5/chapter215/section10/; leg.state.fl.us statute 409.911 | Tool 21, corroboration |
| No CFR section uses "adjusted patient days" or "adjusted inpatient days" | ecfr.gov/api/search/v1/results (both phrases, zero results) | Tool 21 note |
| Nursing-facility error rate (5% or greater, no rounding up) | cms.gov/Regulations-and-Guidance/Guidance/Manuals/downloads/som107ap_pp_guidelines_ltcf.pdf (Rev. 232) | Not in this spec; `med-pass-error-rate` in [spec-v1638](spec-v1638.md) |
| Fosphenytoin and phenytoin doses and rate caps | …/spls/d4c36fad-0ba2-4cd4-9c5e-dcf843f38a5a.xml; 889dd22c-46f0-48d0-b18e-a3783c5fa653 | Not in this spec; `fosphenytoin-load-rate` in [spec-v1631](spec-v1631.md) |

## Verify at build

- **Label holders (all dosing tools).** [spec-v1628](spec-v1628.md) §1 pins the application
  holder's set id. Several labels read here are from generic manufacturers, repackagers or
  distributors, or their holder status was not confirmed: acetylcysteine solution (Hospira),
  fomepizole (Zydus), flumazenil (HealthFirst, version 1), deferoxamine (Fresenius Kabi), edetate
  calcium disodium (Rising), rocuronium (Baxter, version 1), naloxone (Hospira), calcium gluconate
  (WG Critical Care), calcium chloride (Eskayef), Revonto (ProPharma Distribution), Cyanokit (BTG
  International, last published May 4, 2023). Select the holder's set at build and re-read each
  number in it.
- **BAL in Oil.** The Akorn label was last published July 4, 2022; whether the product is still
  marketed was not checked.
- **Tool 1:** how the label intends the 10% solution to be prepared for oral use was not found in
  its text.
- **Backfill 1:** the exact Bateman (SNAP) split (commonly quoted as 100 mg/kg over 2 hours then
  200 mg/kg over 10 hours) is not in the abstract; read the paper before naming it in the tool.
  The source of the 110 kg cap was not read.
- **Backfill 2:** the standalone Sodium Thiosulfate Injection label (Hope, set id
  82f55408-2de9-463d-85e8-b39c3b259f0b) was found but not read; check it for an infusion time
  before keeping or dropping "over 10-30 min."
- **Tool 3:** the CroFab label's higher-dose remarks for two species were seen in the nonclinical
  section only; no dose rule follows from them.
- **Tool 4:** ATNAA was not read.
- **Tool 7:** the default rocuronium concentration (10 mg/mL) was not read; the Baxter label read
  describes other presentations.
- **Tool 9:** deferoxamine reconstitution volumes were not read.
- **Tool 11:** the alteplase 100 mg vial's excess-volume handling is in the carton Instructions
  for Use, which were not read.
- **Tool 12:** Nabi-HB and HyperHEP B concentrations and vial sizes.
- **Tool 13:** the label instructs dosing from Table 2, but the table and its stated rule differ
  (see the tool's note); confirm the reading with the manufacturer's dosing guide if one is public.
  One vial's volume varies by lot, so percent of a vial needs the lot's fill volume as input.
- **Tool 16:** confirm the day-1 counting against an NHSN CDI worked example or the NHSN line-list
  behavior (the explicit "day 15" statement read is in the MRSA section). The MRSA bacteremia
  rules were scanned, not read line by line; the tool is scoped to C. difficile until they are.
- **Tool 18:** the AHRQ document describes the third edition of the CLSI guideline; whether a
  later edition changes any rule could not be checked in an open source.
- **Tool 19:** ASHP's guideline index page returned HTTP 403 and was not opened; confirm there
  that the 2013 guideline has not been replaced.
- **Tool 21:** the issue date of HUD Handbook 4615.1 REV-1 was not read (the appendix file's
  metadata says May 2013); whether the hospital's own state or system defines revenue differently
  is reader input.
- **Backfill 5:** Imogam Rabies-HT was not found on DailyMed by name; confirm its strength before
  listing it. Kedrab's "day 7" wording was not located.
- **Not opened:** the potassium chloride concentrate label (rate limits), the ASRA checklist behind
  the live `last-lipid`, the CDC rabies schedule behind the live `rabies-pep`, and any AHA
  definition of adjusted patient days (no open AHA page was found).

## Sources

FDA labels on DailyMed, fetched and re-fetched October 10, 2026. "Published" is DailyMed's date for
the version, the date [spec-v1628](spec-v1628.md) §1 records; "Effective" is the date inside the
label file.

| Label | Set id | Version | Effective | Published |
|---|---|---|---|---|
| Acetadote | 472f158a-5ab9-4308-8e49-1116e6ea3d39 | 17 | April 30, 2025 | July 30, 2025 |
| Acetylcysteine Solution (Hospira) | 5558a5f5-e821-473b-7d8a-5d33d09f0586 | 22 | May 22, 2026 | May 25, 2026 |
| Nithiodote | ff4941b3-9901-4aab-adcf-c5327bede34e | 10 | October 6, 2025 | November 17, 2025 |
| Cyanokit | d56fcc8d-bd64-46ab-b0c0-2124bd745a6b | 2 | April 27, 2023 | May 4, 2023 |
| Fomepizole (Zydus) | 256910fe-91f2-48f6-b0b4-55edc52dacd4 | 8 | November 20, 2025 | November 21, 2025 |
| CroFab | 77abd784-3387-420d-abdc-4fe97215d233 | 21 | April 13, 2026 | June 1, 2026 |
| Anavip | a16596a5-e87e-40c2-8e34-cea5839849c3 | 24 | January 23, 2026 | January 26, 2026 |
| Anascorp | 5cb65048-a30c-48e5-8bc8-897983d08068 | 20 | July 16, 2025 | July 18, 2025 |
| Provayblue | 4f6848e5-35ed-4046-b13c-3032b5ba3232 | 28 | May 28, 2025 | June 12, 2025 |
| Protopam Chloride | 2741d8fd-51c2-46be-880b-99f2b20a6137 | 15 | April 1, 2026 | March 30, 2026 |
| DuoDote | 241f42a0-1a33-40e8-8221-201767d999e5 | 17 | April 4, 2022 | June 30, 2022 |
| Flumazenil (HealthFirst) | 56452ba8-521d-1f84-e063-6294a90af6fc | 1 | July 10, 2026 | July 13, 2026 |
| Ryanodex | 8f7b3ac0-604d-4c78-b545-5e0f8ea3d698 | 10 | October 30, 2024 | November 1, 2024 |
| Dantrium Intravenous | 4df35098-8702-46be-ac67-30cfdf1aa570 | 15 | March 10, 2026 | April 28, 2026 |
| Revonto | 3edcfad5-00ad-7587-e063-6394a90addf3 | 2 | December 18, 2025 | December 19, 2025 |
| Amidate | b7ed5bf8-ba75-44dc-8f81-96b4ad5766be | 27 | May 20, 2026 | May 25, 2026 |
| Ketalar | 14e8f864-8b8a-4e7e-8439-e510d3107063 | 33 | March 27, 2026 | March 26, 2026 |
| Anectine | 04a4e6f5-6fa1-42e1-a3f9-21fca7786b15 | 9 | November 29, 2023 | August 3, 2026 |
| Rocuronium Bromide (Baxter) | a18fce42-0f3d-4354-845e-57c37ac3a147 | 1 | October 1, 2026 | October 6, 2026 |
| Bloxiverz | d2f55643-2b0d-4ef9-a9d8-b7138b314372 | 18 | December 31, 2023 | January 17, 2024 |
| Bridion | 5171d883-fe8f-482c-97ab-40b00975b64a | 26 | March 13, 2026 | April 2, 2026 |
| Deferoxamine (Fresenius Kabi) | d91e16df-8daa-4cd2-86a2-273eaa2446e0 | 9 | June 15, 2026 | July 3, 2026 |
| Chemet | 62035612-9505-3a3f-1ac8-e2dbd711d24e | 10 | July 10, 2025 | July 14, 2025 |
| Edetate Calcium Disodium (Rising) | 710a2c8c-3620-4f6f-b8fc-fb19ab9e9f22 | 3 | February 13, 2025 | March 3, 2025 |
| BAL in Oil (Akorn) | bee9a137-160f-47e8-a551-ca461ae4f51e | 5 | June 20, 2022 | July 4, 2022 |
| Activase | c669f77c-fa48-478b-a14b-80b20a0139c2 | 15 | January 20, 2026 | January 26, 2026 |
| TNKase | e647640d-c395-4b4b-a0be-1162f9c21d84 | 4 | December 15, 2025 | December 23, 2025 |
| Cathflo Activase | 91ecdef2-95ff-42dd-a31c-c8a09cab3ad9 | 18 | January 20, 2026 | January 23, 2026 |
| HyperHEP B | cda35690-672f-46cd-8520-e37f4d66a8d7 | 26 | September 20, 2024 | October 4, 2024 |
| Nabi-HB | 47fe1a99-5078-4b89-84fa-9e8387baec5c | 8 | April 10, 2025 | April 16, 2025 |
| VariZIG | f367f996-aafa-4b8b-8cb4-63a009cd2015 | 5 | February 10, 2026 | March 20, 2026 |
| HyperTET | 393fa198-7e07-4162-bd0a-9d873f1544a9 | 20 | September 20, 2024 | October 7, 2024 |
| BAT | 9f3c4292-8773-4781-8264-d71c80d3eabd | 11 | May 15, 2025 | July 7, 2026 |
| BabyBIG | 9ec59262-35c1-4d8e-8451-a7cfbacb0675 | 14 | December 8, 2025 | December 10, 2025 |
| HyperRAB | f82880b8-998c-4659-8f20-6dcc81f258e9 | 10 | September 20, 2024 | October 7, 2024 |
| Kedrab | 53f2a23b-c479-4c24-8cab-ee7a33a2633e | 7 | February 21, 2024 | February 23, 2024 |
| Naloxone (Hospira) | 8535cc84-ad4a-4d67-8480-fb5a2e3406f8 | 35 | May 27, 2026 | May 28, 2026 |
| Calcium Gluconate (WG Critical Care) | 16307c00-d0d5-4e05-821f-17b0c1a29fc9 | 5 | November 1, 2025 | September 18, 2026 |
| Calcium Chloride (Eskayef) | 5b0bd762-4c87-597e-e063-6394a90a8303 | 2 | September 9, 2026 | September 10, 2026 |
| Biorphen | 2f715e4e-b269-b935-d2c9-003cb29770be | 5 | March 31, 2026 | April 23, 2026 |

Other sources:

- CDC NHSN, Antimicrobial Use and Resistance Module protocol, July 2026.
- CDC NHSN, Multidrug-Resistant Organism and Clostridioides difficile Infection Module protocol,
  January 2026.
- CMS State Operations Manual, Appendix A (Rev. 248, issued September 18, 2026), tag A-0405
  (Rev. 200, issued February 21, 2020). 42 CFR 482.23(c).
- AHRQ, Nursing Home Antimicrobial Stewardship Guide, Antibiogram Specifications (Pub. No.
  14-0022-4-EF, May 2014).
- WHO Collaborating Centre for Drug Statistics Methodology, ATC/DDD use and copyright pages.
- Bratzler DW, et al. Am J Health Syst Pharm 2013;70:195-283.
- Goldfrank L, et al. Ann Emerg Med 1986;15:566-570 (PMID 3963538).
- Wong A, Graudins A. Clin Toxicol 2016;54:115-119 (PMID 26594846). Bateman DN, et al. Lancet
  2014;383:697-704 (PMID 24290406).
- HUD Handbook 4615.1 REV-1, Appendix 1, Adjusted Patient Days Calculation.
- Virginia Administrative Code 12VAC5-215-10; Florida Statutes 409.911.

## Tests

- `nac-oral-regimen`: 70 kg gives the table row 11 g load (55 mL of 20%, 165 mL diluent) and
  5.5 g maintenance (28 mL), with 9,800 mg and 4,900 mg shown as the per-kilogram figures; 15 kg
  is calculated (2,100 mg load, 10.5 mL of 20%, 31.5 mL diluent; 1,050 mg maintenance); 29.5 kg
  is flagged between rows; 110 kg has no label row; 18 clock rows; last dose at load + 68 h.
- `fomepizole-schedule`: dose 5 is 10 mg/kg and dose 6 is 15 mg/kg; dialysis ending 2 h after the
  last dose gives half a dose; ending 59 minutes after gives none; starting 5 h 59 min after gives
  none and 6 h gives a dose.
- `us-antivenom-dose`: CroFab control at 14:00 gives 20:00, 02:00, 08:00; two 6-vial doses plus
  maintenance total 18 vials and 324 mL of reconstitution saline.
- `pralidoxime-dose`: a 50 kg child at 50 mg/kg is capped at 2,000 mg; a 39.9 kg child IM is
  15 mg/kg and a 40 kg child is 600 mg; DuoDote shows "not established" at 41.0 kg and doses at
  41.1 kg.
- `flumazenil-ladder`: a 10 kg child gets 0.1 mg steps and a 0.5 mg total cap; a 30 kg child is
  capped by 1 mg, not 1.5 mg; adult overdose steps sum 0.2, 0.5, 1.0 … 3.0.
- `dantrolene-mh-vials`: 80 kg at 1 mg/kg is 1 Ryanodex vial or 4 Dantrium vials (240 mL water,
  12 g mannitol); 10 mg/kg is 4 Ryanodex vials or 40 Dantrium vials.
- `rsi-dose-sheet`: a 5-year-old shows no etomidate label dose; rocuronium uses the entered actual
  weight.
- `neostigmine-reversal-dose`: 100 kg at 0.07 mg/kg is capped at 5 mg; 60 kg is 4.2 mg.
- `deferoxamine-acute-iron`: 20 kg child, maximum 300 mg/h, 1,000 mg in not less than 3 h 20 min;
  the seventh gram in 24 h is refused.
- `chelation-dose`: succimer 45 kg flags the table gap; 43 doses over 19 days; EDTA at 0.8 m² is
  800 mg/day (4 mL).
- `thrombolytic-dose`: alteplase stroke 100 kg and 120 kg both give 90 mg (9 mg bolus, 81 mg
  infusion); MI accelerated at 67.0 kg uses the weight-based row and at 67.1 kg the fixed row;
  tenecteplase stroke at 59.9, 60, 89.9 and 90 kg; Cathflo 10 kg with a 0.5 mL lumen gives 0.55 mL.
- `passive-immunization-dose`: VariZIG at 2.0, 2.1, 10.0, 10.1 and 40.1 kg.
- `botulism-antitoxin-dose`: 12 kg shows table 20% and rule 24%; 55 kg shows table 100% and rule
  85%; a 9 kg infant under 1 year is 10%; pediatric rate never exceeds 2 mL/min.
- `au-rate-saar`: 450 days over 3,000 days present is 150 per 1,000; SAAR blank when predicted is
  blank or zero.
- `antimicrobial-day-counter`: vancomycin twice daily for 3 days is 3 days; tobramycin IV and
  inhaled on one day is 1 total, 1 IV, 1 respiratory; Monday-to-Wednesday stay is 3 days present;
  a transfer day counts once in each unit and once facility-wide.
- `cdi-labid-category`: specimen on hospital day 3 is community-onset and day 4 is facility-onset;
  a discharge 28 days before makes it facility-associated and 29 days does not; with the prior
  event on January 1 (day 1), a specimen on January 14 (day 14) is unassigned, January 15 (day 15)
  is recurrent, February 25 (day 56) is recurrent and February 26 (day 57) is incident.
- `ddd-rate`: refuses without a DDD value; 400 g at a DDD of 2 g over 5,000 bed-days is 4 per 100.
- `antibiogram-builder`: a second isolate of the same species from one patient is dropped even
  with a different profile; 29 isolates is flagged and 30 is not; an I result lowers percent S.
- `surgical-prophylaxis-redose`: cefazolin at 119.9 kg is 2 g and at 120 kg is 3 g; a dose started
  at 07:30 redoses at 11:30 regardless of incision time; vancomycin started 100 minutes before
  incision passes and cefazolin fails; a 30 kg child on cefazolin is 900 mg and an 80 kg child is
  capped at 2 g.
- `med-admin-window`: time-critical dose 31 minutes late fails; an every-6-hours dose 60 minutes
  late passes and 61 fails; a daily dose 120 minutes early passes.
- `adjusted-patient-days`: 10,000 inpatient days with $4,000,000 inpatient and $6,000,000
  outpatient gross revenue is 25,000; zero inpatient revenue is refused.

## Build status

Not started. Specified October 10, 2026.
