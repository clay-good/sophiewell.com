# spec-v1635 — Oncology pharmacy, investigational drug service, and nuclear pharmacy

**Status:** Proposed, October 10, 2026. Specs only; nothing here is built. 35 new tools (2 build-gated: `relative-dose-intensity`, `pediatric-administered-activity`).
**Charter:** [spec-v1627](spec-v1627.md). **Machinery:** [spec-v1628](spec-v1628.md). **Ledger:** [scope-pharmacy-practice.md](scope-pharmacy-practice.md).

Three pharmacists do work the catalog barely touches. The chemotherapy-verification pharmacist
re-derives every dose from the order, the patient's size and labs, and the label, then checks
lifetime limits and rescue schedules. The research pharmacist counts returned tablets and
federal reporting days. The nuclear pharmacist decays every dose to a clock time and checks it
against a Nuclear Regulatory Commission or Department of Transportation limit. This wave gives
each of them the calculation with its label, CFR section or paper named, and nothing that says
"give X."

## Gap finder

**Method.** Four registers were enumerated: (a) the dosing, dose-modification and boxed-warning
sections of 40 FDA labels on DailyMed (anthracyclines, antimetabolites, platinums, taxanes,
supportive-care agents, 14 radiopharmaceuticals); (b) 10 CFR Parts 20, 35 and 71, 49 CFR Parts
172 and 173, and 21 CFR Parts 56 and 312, section by section through the eCFR API; (c) NRC
Regulatory Guide 8.39 Rev. 1 (April 2020) in full; (d) the CPIC database through its public API.
The companion sweep ran `catalog.tsv` by drug name, eponym, formula output and regulation number
(about 70 patterns). On October 10, 2026 every proposed id was checked against the catalog and
against the other pharmacy wave specs: no collision.

**Already live (do not rebuild).** `calvert-carboplatin` (the 125 mL/min cap on estimated GFR is
in the lib and on by default: `calvertCarboplatin({ targetAuc, gfr, capGfr = true })`), `bsa`,
`bw-bsa-suite`, `cockcroft-gault`, `egfr-suite`, `anc` (cites CTCAE v5.0), `tls-cairo-bishop`,
`mascc`, `cisne`, `talcott-febrile-neutropenia`, `khorana`, `carg-toxicity`, `crs-grade`,
`icans-grade`, `who-mucositis`, `recist`, `irecist`, `mrecist`, `bed-eqd2`, `vial-rounding`
(HOPA 10%), `drug-wastage`, `dose-calendar`, `rate-escalation-schedule`, `chair-day-planner`,
`compounding-bud`, `weight-dose`, `pk-suite`, `mpr-gap-days`, `pdc-star`, `warfarin-iwpc`,
`warfarin-gage`, `unit-converter`, `vip-extravasation` (grading only).

**Nothing live** in nuclear pharmacy (no decay, no Ci/Bq, no NRC or DOT rule), in the
investigational drug service (no 21 CFR 312 clock), or in pharmacogenomics beyond the two
warfarin models.

| Proposed | Live neighbor | Difference |
|---|---|---|
| `chemo-dose-verify` | `weight-dose`, `bsa`, `vial-rounding` | Neighbors each do one step. This one re-derives the ordered dose from the regimen's per-unit dose and reports the percent variance. |
| `chatelut-carboplatin` | `calvert-carboplatin` | Calvert needs a GFR. Chatelut predicts carboplatin clearance directly from weight, age, sex and creatinine. Different formula, different inputs. |
| `relative-dose-intensity` | `mpr-gap-days` | Adherence from fills is not dose intensity from delivered cycles. |
| `cumulative-dose-limit` | none (`compass-cat` only names anthracyclines) | No tool sums lifetime mg/m² or bleomycin units. |
| `chemo-organ-label-dose` | `abx-renal` | Same shape, antibiotics only. No cytotoxic is covered. |
| `gcsf-timing-check` | `dose-calendar` | The calendar builds dates; it does not test a date against a label exclusion window. |
| `hdmtx-leucovorin-rescue` | none | The single owner of the methotrexate rescue table in this program ([spec-v1631](spec-v1631.md) points here). |
| `esa-chemo-dose-adjust` | none | `esa-conversion` in [spec-v1633](spec-v1633.md) switches agents; this adjusts one agent's dose. |
| `desensitization-12-step` | `rate-escalation-schedule` | The live tool steps one bag's rate. This one computes three bag concentrations and the dose delivered per step. |
| `dpyd-fluoropyrimidine-dose`, `tpmt-nudt15-thiopurine-dose`, `ugt1a1-irinotecan-label` | `warfarin-iwpc`, `warfarin-gage` | Warfarin regression models only; no genotype-to-recommendation tool. |
| `ind-safety-report-clock` and the other 312 clocks | `breach-clock`, `c2-fill-deadlines` | Same clock shape, different regulation. None reads 21 CFR 312. |
| `ids-accountability-reconcile` | `mpr-gap-days`, `pdc-star` | Those read pharmacy fills. This reads dispensed and returned counts for one subject and visit. |
| All 12 nuclear tools | `bed-eqd2` (external-beam radiobiology), `unit-converter` (no activity units) | No overlap. |

## Tools

Groups follow [spec-v1628](spec-v1628.md) §4: the oncology tools (1 to 18) are group F, the
investigational drug service and nuclear pharmacy tools are group Q, and the two marked G are
group G. Every value read from an FDA label is a label row under the label-edition contract of
[spec-v1628](spec-v1628.md) §1 (set id, version, published date, weekly watch, fail closed);
no tool below restates that scheme. Output follows the posture rules of
[spec-v1628](spec-v1628.md) §5.

### Oncology

### 1. `chemo-dose-verify` — Chemotherapy Dose Re-Derivation

**Input.** The regimen's dose basis (mg/m², mg/kg, units/m², or target AUC), the per-unit dose,
height, weight, the weight the institution's policy uses (actual by default), the ordered dose,
and optionally a percent reduction for this cycle and an institutional cap (reader input).
**Compute.** BSA (Mosteller and Du Bois, as `bsa`), calculated dose = per-unit dose × size ×
(1 − reduction), variance = (ordered − calculated) ÷ calculated × 100. When a cap is entered it
is applied and labeled as institutional. For an AUC basis it hands off to `calvert-carboplatin`.
**Output.** Calculated dose, ordered dose, signed percent variance, and which weight and BSA
formula were used. No pass/fail unless the reader enters a tolerance.
**Source.** Griggs et al., ASCO guideline update, J Clin Oncol 2021;39:2037-2048: "full,
weight-based cytotoxic chemotherapy doses be used to treat obese adults with cancer" and "full,
approved doses of immunotherapy and targeted therapies be offered to obese adults with cancer."
**Note.** The guideline is why the default is actual weight and why no cap ships. The tool states
that a 2.0 m² cap is institutional policy, not a guideline value.

### 2. `chatelut-carboplatin` — Carboplatin Clearance and Dose (Chatelut)

**Input.** Weight (kg), age (years), sex, serum creatinine (µmol/L, or mg/dL converted × 88.4),
target AUC (mg/mL·min).
**Compute.** CL (mL/min) = 0.134 × weight + [218 × weight × (1 − 0.00457 × age) × (1 − 0.314 ×
sex)] ÷ creatinine (µmol/L); sex = 0 male, 1 female. Dose (mg) = AUC × CL.
**Output.** Clearance, dose, and the Calvert dose beside it when the reader also has a GFR.
**Source.** Chatelut et al., J Natl Cancer Inst 1995;87:573-580 (coefficients read in the
abstract). The division by creatinine was read in Kinoshita et al., Br J Cancer
2006;94:1267-1271 (PMC2361403, CC BY 4.0), which reproduces the formula.
**Scope.** The formula was derived in 34 patients (46 cycles) and tested in 36 others (49
cycles), ages 23 to 84. The paper states precision (median absolute error 10%), no dose cap. The
tool says the 125 mL/min cap in `calvert-carboplatin` applies to an estimated GFR in the Calvert
formula and does not invent a Chatelut cap. Kinoshita et al. applied the formula with Jaffé
creatinine and converted enzymatic results first; the assay the formula expects is a Verify at
build item, and the tool names it on the page once confirmed.

### 3. `relative-dose-intensity` — Relative Dose Intensity

**Input.** Planned dose per cycle, cycle length and number of cycles; delivered dose and date
for each cycle (typed or CSV).
**Compute.** Planned intensity = total planned dose ÷ planned weeks. Delivered intensity = total
delivered dose ÷ actual weeks (first dose to the planned end of the last delivered cycle).
RDI = delivered ÷ planned × 100, per drug and averaged across drugs.
**Output.** RDI per drug, the regimen average, and the share lost to dose reduction versus delay.
**Source.** Hryniuk and Bush, J Clin Oncol 1984;2:1281-1288.
**Build gate.** The paper was not opened (PubMed carries no abstract for it). See Verify at
build. No interpretation band ships: the 85% line comes from later observational work and is not
Hryniuk's.

### 4. `cumulative-dose-limit` — Lifetime Cumulative Dose Against the Label

**Input.** Agent; a list of prior doses as mg/m² (or mg with the BSA at each dose); for
bleomycin, units; age band for daunorubicin; prior chest radiation yes/no.
**Compute.** Sum per agent. Compare with the label's stated figure:

| Agent | Label statement read | Tool reports |
|---|---|---|
| Doxorubicin | "Cumulative doses above 550 mg/m² are associated with an increased risk of cardiomyopathy"; probability 1 to 2% at 300, 3 to 5% at 400, 5 to 8% at 450, 6 to 20% at 500 mg/m² (every-3-week schedule) | Total, the incidence band it falls in, percent of 550 |
| Epirubicin | "cumulative doses of 900 mg/m² ELLENCE should generally be avoided"; 0.9% at 550, 1.6% at 700, 3.3% at 900 | Total, percent of 900 |
| Daunorubicin | Increased incidence above 550 mg/m² in adults; 400 mg/m² with radiation that encompassed the heart; 300 mg/m² in children over 2 years; 10 mg/kg under 2 years. The boxed warning says "exceeding 400 to 550 mg/m² in adults"; both sentences are shown. | Total against the row that applies |
| Idarubicin | Increased incidence of heart failure above 90 mg/m² | Total, percent of 90 |
| Mitoxantrone | Multiple sclerosis: "should not receive a cumulative mitoxantrone dose greater than 140 mg/m²"; cancer: 2.6% probability of heart failure at 140 | Total, percent of 140 |
| Bleomycin | "Total doses over 400 units should be given with great caution" | Total units, percent of 400 |

**Output.** Running total per agent, the label sentence, and the dose that would cross the figure.
**Source.** DailyMed labels (set IDs in the Research record).
**Rule.** Totals are per agent. The idarubicin label says to "Include prior doses of other
anthracyclines or anthracenediones" but gives no conversion ratio, so the tool lists each agent's
total side by side and offers reader-entered equivalence factors, labeled as the reader's. It
ships none. The doxorubicin label says mediastinal radiotherapy adds to the risk and gives no
lower figure for it; the tool prints that sentence and no number.

### 5. `dexrazoxane-ratio-dose` — Dexrazoxane Dose From the Doxorubicin Dose

**Input.** Doxorubicin dose (mg/m² or mg), creatinine clearance, cumulative doxorubicin to date.
**Compute.** Dexrazoxane = 10 × doxorubicin; 5 × when creatinine clearance is under 40 mL/min.
Flags a cumulative doxorubicin dose under 300 mg/m² (the labeled indication starts there).
**Output.** Dose, ratio used, and the label's timing line (doxorubicin within 30 minutes after
the dexrazoxane infusion ends; never doxorubicin first).
**Source.** Dexrazoxane for Injection label, sections 1, 2.1, 2.2 (two manufacturers read; both
agree).

### 6. `mesna-ifosfamide-schedule` — Mesna Doses and Times From the Ifosfamide Dose

**Input.** Ifosfamide dose (mg or g/m² with BSA), ifosfamide start time, route plan (all
intravenous, or intravenous then oral).
**Compute.** All intravenous: 20% of the ifosfamide dose at 0, 4 and 8 hours (60% total).
Intravenous then oral: 20% intravenous at 0 hours, then 40% orally at 2 and 6 hours (100% total).
**Output.** Each dose in mg with its clock time, the daily total, and the label's worked row
(ifosfamide 1.2 g/m² → 240 mg/m² × 3, or 240 then 480 and 480 mg/m²).
**Source.** MESNEX label, sections 2.1 and 2.2.
**Scope.** Bolus ifosfamide schedules only, as labeled. The label says the intravenous-then-oral
ratio "has not been established as being effective for daily doses of ifosfamide higher than
2 g/m²"; above that the tool prints the sentence beside the oral schedule. Continuous-infusion
mesna is not in the label and is out.

### 7. `hdmtx-leucovorin-rescue` — Leucovorin Rescue After High-Dose Methotrexate (label table)

This tool is the single owner of the methotrexate rescue table in the pharmacy program;
[spec-v1631](spec-v1631.md) points here.

**Input.** Hours since the methotrexate infusion started, serum methotrexate (µmol/L, or mg/L
converted), baseline and current serum creatinine.
**Unit.** 1 µmol/L = 0.45444 mg/L, from the molecular weight 454.44 printed in the methotrexate
label (section 11). The tool shows the converted value before it classifies.
**Compute.** The leucovorin label's three rows:
- **Normal elimination** (about 10 µmol/L at 24 h, 1 µmol/L at 48 h, under 0.2 µmol/L at 72 h):
  15 mg by mouth, intramuscularly or intravenously every 6 hours for 60 hours (10 doses starting
  24 hours after the start of the infusion).
- **Delayed late elimination** (above 0.2 µmol/L at 72 h and above 0.05 µmol/L at 96 h):
  continue 15 mg every 6 hours until under 0.05 µmol/L.
- **Delayed early elimination or acute renal injury** (50 µmol/L or more at 24 h, or 5 µmol/L
  or more at 48 h, or a 100% or greater rise in creatinine at 24 h, the label's example being
  0.5 to 1 mg/dL or more): 150 mg intravenously every 3 hours until under 1 µmol/L, then 15 mg
  intravenously every 3 hours until under 0.05 µmol/L.

**Timing classes.** The table names four hours: 24, 48, 72 and 96. A level drawn at any other
hour is reported as "between the label's time points" with the two neighboring thresholds, never
classified and never interpolated. The table also leaves gaps: a 24-hour level between about 10
and 50 µmol/L, or a 48-hour level between 1 and 5 µmol/L, is in no row. The tool prints both
neighboring rows and says the label does not settle it.
**Output.** The row matched (or the gap), the label's dose, the level at which the label stops
rescue (0.05 µmol/L), and the next level due. When the level is above 1 µmol/L it adds one line
pointing to `glucarpidase-dose`, with the glucarpidase label's indication sentence.
**Source.** Leucovorin Calcium for Injection label, "Leucovorin Rescue After High-Dose
Methotrexate Therapy." The methotrexate label (section 2.2) sends the reader to the leucovorin
labeling and gives the 500 mg/m² line above which rescue is given.
**Scope.** The label states the table is for methotrexate 12 to 15 g/m² over 4 hours. The tool
says so. The glucarpidase label gives no hour-by-hour threshold ("greater than 2 standard
deviations of the mean methotrexate excretion curve"), so no such curve is computed. Protocol
nomograms (for example Bleyer) are not in the label and are out.

### 8. `glucarpidase-dose` — Glucarpidase Dose and Leucovorin Spacing

**Input.** Weight (kg), plasma methotrexate (µmol/L), whether clearance is delayed from impaired
renal function (reader's determination), time of the last and next leucovorin dose.
**Compute.** 50 units/kg, single intravenous injection over 5 minutes; vials of 1,000 units.
Tests the labeled threshold (methotrexate above 1 µmol/L). Tests that leucovorin is at least
2 hours before or 2 hours after.
**Output.** Units, vials, the leucovorin window, and the label's follow-on rules: the same
leucovorin dose for the first 48 hours; after that, dose by the measured level and continue
until the level has stayed below the leucovorin threshold for at least 3 days; within 48 hours
of the dose a chromatographic assay is preferred because immunoassays are unreliable.
**Source.** VORAXAZE label, sections 1, 2.1, 2.2, 3, 5.2.
**Scope.** The label defines delayed clearance as a level more than 2 standard deviations above
the mean excretion curve for the dose given. The tool does not compute that curve; the reader
states whether it is met.

### 9. `it-methotrexate-age-dose` — Intrathecal Methotrexate Dose by Age

**Input.** Age.
**Compute.** Under 1 year 6 mg; 1 to under 2 years 8 mg; 2 to under 3 years 10 mg; 3 to under 9
years 12 mg; 9 years and over 12 to 15 mg.
**Output.** The label dose, the preservative-free requirement, the dilution line (1 mg/mL in
preservative-free 0.9% sodium chloride), and the interval sentence.
**Source.** Methotrexate Injection label (set dd035a9f, version 7, published September 7, 2026),
section 2.4.
**Note.** The top band differs from older labeling ("3 years and over: 12 mg").

### 10. `rasburicase-dose` — Rasburicase Dose and Vials

**Input.** Weight, G6PD status (deficient, normal, not tested), day of the course.
**Compute.** 0.2 mg/kg once daily as a 30-minute infusion, for up to 5 days; vials from the 1.5 mg
and 7.5 mg sizes. G6PD deficiency is a labeled contraindication: the tool reports that and gives
no dose. "Not tested" returns the dose with the label's screening sentence.
**Output.** Dose in mg, vial combination, waste, days remaining of 5.
**Source.** ELITEK label, sections 2.1, 2.2, 3, 4, 5.2. The label adds that dosing beyond 5 days
or more than one course is not recommended.
**Scope.** Label dose only. Fixed 3 mg or 6 mg doses are off-label practice and are out.

### 11. `gcsf-timing-check` — Filgrastim and Pegfilgrastim Timing Against Chemotherapy

**Input.** Product, the chemotherapy dates and times of this and the next cycle, the planned
growth-factor date and time, and for pegfilgrastim whether the patient is an adult or a child,
with weight for a child.
**Compute.** Filgrastim: at least 24 hours after chemotherapy, and not within the 24 hours before
it. Pegfilgrastim: not between 14 days before and 24 hours after chemotherapy; 6 mg once per
cycle for adults of any weight and for children weighing 45 kg or more; for children under 45 kg
the label table (under 10 kg 0.1 mg/kg; 10 to 20 kg 1.5 mg; 21 to 30 kg 2.5 mg; 31 to 44 kg
4 mg).
**Output.** Allowed or not, the earliest allowed time, and whether the cycle length leaves a
14-day gap at all (it flags weekly and 14-day regimens).
**Source.** NEUPOGEN label section 2.1; NEULASTA label section 2.1 and Table 1.
**Note.** An adult under 45 kg gets 6 mg, not the table. The table's bands are whole kilograms
and leave 20 to 21, 30 to 31 and 44 to 45 kg unstated; a weight in a gap returns both
neighboring rows. Biosimilar labels are expected to carry the same timing; the tool names the
reference labels.

### 12. `esa-chemo-dose-adjust` — Epoetin and Darbepoetin in Chemotherapy Anemia (label rules)

**Input.** Agent and schedule, weight, current dose, hemoglobin now and 2 weeks ago, weeks on
therapy, months of chemotherapy still planned, whether transfusion is still needed.
**Compute.** Initiation test: hemoglobin under 10 g/dL and at least two more months of planned
chemotherapy. Epoetin (adults; starting 150 units/kg three times weekly or 40,000 units weekly):
reduce 25% when hemoglobin rises more than 1 g/dL in any 2 weeks or reaches a level that avoids
transfusion; withhold above that level and restart 25% lower; after 4 weeks with a rise under
1 g/dL and hemoglobin under 10, increase to 300 units/kg three times weekly or 60,000 units
weekly; discontinue at 8 weeks without response or if transfusions are still required.
Darbepoetin: start 2.25 mcg/kg weekly or 500 mcg every 3 weeks; reductions are 40%; at 6 weeks
the weekly schedule may rise to 4.5 mcg/kg (the every-3-week schedule has no increase);
discontinue at 8 weeks without response or when chemotherapy ends.
**Output.** The label action for these numbers and the new dose.
**Source.** EPOGEN label section 2.4; ARANESP label section 2.3 and Table 2.
**Scope.** Adult rows. The epoetin label also carries pediatric rows (600 units/kg weekly, rising
to 900 units/kg, maximum 60,000 units); they are a second mode, not a separate tool.
**See also.** `esa-conversion` in [spec-v1633](spec-v1633.md) switches a patient from one agent
to another; this tool adjusts the dose of one agent. Neither does the other's job.

### 13. `chemo-organ-label-dose` — Label Dose Modification for Liver and Kidney Function

**Input.** Drug (picker), total or direct bilirubin, AST as multiples of the upper limit,
creatinine clearance or serum creatinine, and for carboplatin the nadir counts.
**Compute.** The label's own table for the chosen drug:

| Drug | Label rule read |
|---|---|
| Doxorubicin | Bilirubin 1.2 to 3 mg/dL: reduce the dose 50%. 3.1 to 5 mg/dL: reduce 75% (one quarter of the dose is given). Above 5 mg/dL: do not initiate; discontinue (contraindicated). |
| Epirubicin | Bilirubin 1.2 to 3 mg/dL or AST 2 to 4 × upper limit: half the starting dose. Bilirubin above 3 or AST above 4 ×: one quarter. Serum creatinine above 5 mg/dL: consider lower doses. |
| Daunorubicin | Bilirubin 1.2 to 3 mg/dL: 75% of the usual dose. Above 3 mg/dL: 50%. Serum creatinine above 3 mg/dL: 50%. |
| Idarubicin | Bilirubin above 2.6 and under 5 mg/dL: reduce 50%. Above 5: avoid. |
| Vincristine | Direct bilirubin above 3 mg/dL: 50% reduction. |
| Paclitaxel (3-hour) | Transaminases under 10 × and bilirubin up to 1.25 × upper limit: 175 mg/m²; 1.26 to 2.0 ×: 135; 2.01 to 5.0 ×: 90; transaminases 10 × or more, or bilirubin above 5 ×: not recommended. |
| Paclitaxel (24-hour) | Under 2 × and bilirubin up to 1.5 mg/dL: 135 mg/m²; 2 to under 10 × and up to 1.5: 100; under 10 × and 1.6 to 7.5: 50; 10 × or more or above 7.5: not recommended. |
| Docetaxel | Avoid with bilirubin above the upper limit, or AST or ALT above 1.5 × with alkaline phosphatase above 2.5 ×. |
| Bleomycin | Creatinine clearance 50 and above 100%; 40 to 50 70%; 30 to 40 60%; 20 to 30 55%; 10 to 20 45%; 5 to 10 40%. |
| Capecitabine | Creatinine clearance 30 to 50 mL/min (Cockcroft-Gault): reduce 25%. Under 30: no established dose. |
| Pemetrexed | Creatinine clearance under 45 mL/min (Cockcroft-Gault): no recommended dose. |
| Dexrazoxane | Creatinine clearance under 40 mL/min: 50%. |
| Carboplatin (retreatment) | Platelets above 100,000 and neutrophils above 2,000: 125%; 50,000 to 100,000 and 500 to 2,000: no adjustment; under 50,000 or under 500: 75%. |

**Output.** The label's percent or dose, its exact sentence, and the label edition.
**Source.** DailyMed labels, set IDs in the Research record.
**Why this is not a table.** It takes labs and returns one row, like `abx-renal`.
**Engine and data.** This is a class tool on the label-dose engine and `data/label-dose/` dataset
specified in [spec-v1632](spec-v1632.md) §0, and every row is a label row under
[spec-v1628](spec-v1628.md) §1. Dating, the weekly watch and fail-closed behavior are defined
there and not here.
**Doxorubicin.** The current Pfizer label heads the percent column "Dosage Modification," which
does not say whether 50% is the cut or the dose. The ADRIAMYCIN label (Hikma) and the Sun label
print the same rows under "Dose reduction," so the percentages are reductions. The tool prints
"reduce by 50%" and "reduce by 75%" and names the label whose heading says so.
**Boundaries.** The labels leave values unstated: idarubicin at exactly 5 mg/dL, bleomycin at
exactly 40, 30, 20 and 10 mL/min (each appears in two rows), daunorubicin and epirubicin
between whole-number bounds. Per [spec-v1628](spec-v1628.md) §5 rule 4 the tool prints both
neighboring rows. The bleomycin label prints the Cockcroft-Gault result as "mL/min/1.73m²"; the
tool quotes the oddity and does not correct it. Paclitaxel's doses are first-course doses and
assume the 135 or 175 mg/m² regimens only, as footnoted in the label.

### 14. `capecitabine-tablet-dose` — Capecitabine Dose in Whole Tablets

**Input.** Dose level (1,250 or 1,000 mg/m² twice daily, or typed), height and weight or BSA,
creatinine clearance, percent of dose for this cycle (100, 75 or 50), days on and cycle length.
**Compute.** Per-dose mg = level × BSA × percent, less 25% when creatinine clearance is 30 to
50 mL/min. Round to the nearest 150 mg as the label instructs. Express in 500 mg and 150 mg
tablets with the fewest tablets, morning and evening. Cycle quantity = tablets per dose × 2 ×
days on (14 of 21 by default).
**Output.** Rounded dose, percent change from the calculated dose, tablets per dose by
strength, tablets per cycle by strength.
**Source.** XELODA label (set e702d84d, version 32, effective February 5, 2026), sections 2.2 to
2.8 and Table 1. The rounding sentence is in 2.8 ("Round the recommended dosage for patients to
the nearest 150 mg dose to provide whole XELODA tablets"); the renal rule is in 2.7.
**Note.** The current label no longer carries the BSA-band tablet table that older labels had;
it gives a rounding rule. The tool follows the current label and says so. The label does not say
which way a dose exactly halfway between two multiples of 150 mg rounds; the tool shows both.

### 15. `desensitization-12-step` — Three-Bag, 12-Step Desensitization Arithmetic

**Input.** Total target dose (mg), bag volume (default 250 mL), final rate (default 80 mL/h).
**Compute.** Solution 1 concentration = target ÷ volume ÷ 100; solution 2 = target ÷ volume ÷
10; solution 3 = (target − dose given in steps 1 to 8) ÷ volume. Steps: solution 1 at 2.5, 5, 10,
20 mL/h; solution 2 at 5, 10, 20, 40 mL/h; solution 3 at 10, 20, 40 mL/h, each for 15 minutes;
step 12 at 80 mL/h until the rest of bag 3 is given. Per step: volume, mg, cumulative mg.
**Output.** The three bag recipes, the 12-row table, and total time.
**Derivation check (600 mg, 250 mL).** Solutions 1 and 2 are 0.024 and 0.24 mg/mL. Steps 1 to 4
deliver 9.375 mL (0.225 mg); steps 5 to 8 deliver 18.75 mL (4.5 mg); cumulative 4.725 mg.
Solution 3 = (600 − 4.725) ÷ 250 = 2.3811 mg/mL. Steps 9 to 11 deliver 17.5 mL; step 12 delivers
the remaining 232.5 mL at 80 mL/h in 174.375 minutes (553.61 mg). Total time = 11 × 15 + 174.375
= 339.375 minutes. Each figure matches the published table (0.024, 0.24, 2.38 mg/mL; 4.73 mg
after step 8; 553.61 mg in step 12; 339.38 minutes).
**Source.** Table 5 of Tsao, Young, Otani and Castells, "Hypersensitivity Reactions to Platinum
Agents and Taxanes," Clin Rev Allergy Immunol 2022;62:432-448 (PMC9156473, CC BY 4.0), which
gives the protocol of Castells et al., J Allergy Clin Immunol 2008;122:574-580.
**Scope.** Arithmetic for a protocol the allergist has already ordered. No premedication, no
risk stratification. Tables 6 and 7 of the same paper carry 8-step (two bags, 279.38 minutes)
and 16-step (four bags, 399.38 minutes) variants; the same arithmetic reproduces both. They are
not built here; adding them as a step-count option is an owner decision.

### 16. `dpyd-fluoropyrimidine-dose` — DPYD Activity Score to Fluoropyrimidine Recommendation (CPIC)

**Input.** The two DPYD variants reported (or the activity score), drug (fluorouracil or
capecitabine).
**Compute.** Activity score = sum of the two lowest variant activity values (CPIC rule read in
the gene record). Score 0 or 0.5: poor metabolizer, avoid. Score 1 or 1.5: intermediate, reduce
the starting dose by 50% then titrate. Score 2: normal, label dose. The recommendation text is
CPIC's row, printed whole: the 0.5 row adds a conditional clause on a strongly reduced dose when
no alternative is suitable, and the 1.0 row a note on the c.2846A>T homozygote.
**Output.** Score, phenotype, CPIC's recommendation text, its strength (Strong for 0, 0.5, 1.0
and 2.0; Moderate for 1.5), the CPIC data version.
**Source.** CPIC DPYD and Fluoropyrimidines guideline, read through `api.cpicpgx.org`
(`recommendation_view`, `gene`), CC0. The XELODA label section 2.1 is shown beside it (test
before starting unless immediate treatment is necessary; avoid in complete deficiency).
**Engine and data.** Uses the shared pharmacogenomic engine and the pinned CPIC tables
(`data/cpic/`) specified in [spec-v1640](spec-v1640.md), Shared machinery: the tool is that
engine with the drug fixed. The activity-score rule lives in the engine. This spec adds no
allele table, phenotype mapping or snapshot rule of its own.

### 17. `tpmt-nudt15-thiopurine-dose` — TPMT and NUDT15 Phenotype to Thiopurine Starting Dose (CPIC)

**Input.** TPMT phenotype, NUDT15 phenotype (each normal, intermediate, possible intermediate,
poor, indeterminate, no result), drug (mercaptopurine, azathioprine, thioguanine), indication
class (malignancy or not).
**Compute.** Row lookup in CPIC's combined table per drug (35 rows for mercaptopurine). Rows
read for mercaptopurine: either gene intermediate → 30 to 80% of the standard starting dose when
that dose is 75 mg/m²/day or more (malignancy) or 1.5 mg/kg/day or more (nonmalignancy); both
intermediate → 20 to 50%; either gene poor (malignancy) → reduce 10-fold and give three days a
week.
**Output.** The recommendation text, strength, and data version.
**Source.** CPIC TPMT, NUDT15 and Thiopurines guideline via the API, CC0.
**Engine and data.** Uses the shared pharmacogenomic engine and the pinned CPIC tables specified
in [spec-v1640](spec-v1640.md).

### 18. `ugt1a1-irinotecan-label` — UGT1A1 Genotype and the Irinotecan Label

**Input.** UGT1A1 genotype (*1/*1, *1/*28, *1/*6, *28/*28, *6/*6, *6/*28).
**Compute.** Homozygous *28 or *6, or compound heterozygous *6/*28: the label says to consider
reducing the starting dose by at least one level. Others: no label statement.
**Output.** The label sentence and the section (2.3).
**Source.** Irinotecan Hydrochloride Injection label (set b66dbd6d, version 8, effective August
26, 2026), section 2.3.
**Engine and data.** Genotype entry and the UGT1A1 allele definitions come from the shared
pharmacogenomic engine and the pinned CPIC tables specified in [spec-v1640](spec-v1640.md). The
recommendation is the label's, held as a label row under [spec-v1628](spec-v1628.md) §1.
**Note.** Label, not CPIC: the CPIC API lists UGT1A1-irinotecan as a level-A pair with no
guideline attached, and no irinotecan guideline is in its guideline list.

**Pharmacogenomics beyond these three.** The rest of the CPIC level-A pairs, the activity-score
and diplotype engine, and the snapshot and attribution contract are specified in
[spec-v1640](spec-v1640.md). Tools 16 to 18 stay here because the oncology pharmacist meets them
at dose verification.

### Investigational drug service

### 19. `ind-safety-report-clock` — IND Safety Report Deadlines (21 CFR 312.32)

This tool owns IND safety clocks for the pharmacy program; `fda-adverse-event-report-clock` in
[spec-v1634](spec-v1634.md) covers postmarketing reports only.

**Input.** Who is asking (sponsor or sponsor-investigator, or investigator); the date the sponsor
first received the information; the date the sponsor determined it qualifies; whether the
suspected adverse reaction is fatal or life-threatening and unexpected; the date of any FDA
request for more data.
**Compute.** Sponsor: no later than 15 calendar days after determining the information
qualifies (312.32(c)(1)); for an unexpected fatal or life-threatening suspected adverse
reaction, no later than 7 calendar days after the sponsor's initial receipt of the information
(312.32(c)(2)); additional data within 15 calendar days of an FDA request (312.32(c)(1)(v)); a
late-qualifying event within 15 calendar days of the determination (312.32(d)(3)).
Investigator: "immediately" to the sponsor for any serious adverse event (312.64(b)); the tool
prints that word and counts nothing.
**Output.** Each due date, the paragraph, and the definitions of serious, unexpected and
life-threatening from 312.32(a) as a checklist.
**Source.** 21 CFR 312.32, 312.64.
**Note.** A direct final rule (91 FR 59988, September 22, 2026, effective February 4, 2027)
changes "animal" to "nonclinical" in this section and in 312.33. No clock changes. Comments
close December 7, 2026, and FDA will withdraw the rule if it receives significant adverse
comment; the tool's text follows the section in force on the day of use.

### 20. `emergency-ind-clock` — Emergency Expanded Access Follow-Up Deadlines

**Input.** Date FDA authorized the emergency use; date of the emergency use at the institution.
**Compute.** Written expanded access submission within 15 working days of FDA's authorization
(21 CFR 312.310(d)(2)). Report to the IRB within 5 working days of the emergency use (21 CFR
56.104(c)). Working days skip weekends and federal holidays.
**Output.** Both dates, and the 312.310(c)(2) duty to send a written summary at the conclusion of
treatment (no day count in the rule; the tool says so).
**Source.** 21 CFR 312.310, 56.104.

### 21. `ind-annual-report-due` — IND Effective Date, Annual Report and New-Investigator Notice

**Input.** Date FDA received the IND (or the earlier date FDA said the study may begin); date a
new investigator was added.
**Compute.** IND in effect 30 days after FDA receipt unless on hold or notified earlier
(312.40(b)). Annual report due within 60 days of each anniversary of the effective date
(312.33). New investigator: notify FDA within 30 days of the addition (312.30(c)).
**Output.** Effective date, the next three annual report windows, the notice date.
**Source.** 21 CFR 312.30, 312.33, 312.40.

### 22. `trial-record-retention` — Investigational Drug Record Retention Date

**Input.** Role (investigator or sponsor); the date a marketing application was approved for the
indication, or the date the investigation was discontinued and FDA notified (sponsor: the date
shipment and delivery were discontinued and FDA notified).
**Compute.** Two years from that date (312.62(c) for investigators, 312.57(c) for sponsors).
**Output.** The earliest federal destruction date, with a line that the protocol, the sponsor
contract and state law may require longer (reader input, taken as the later date).
**Source.** 21 CFR 312.57, 312.62.

### 23. `ids-accountability-reconcile` — Study Drug Accountability and Pill-Count Compliance

**Input.** Per subject and visit: units dispensed, units returned, dispense date, return date,
prescribed units per day, any documented holds (days). CSV upload or typed.
**Compute.** Units taken = dispensed − returned. Expected = units per day × (days between
dispense and return − hold days). Compliance = taken ÷ expected × 100. Site balance = received −
dispensed + returned to stock − destroyed − returned to sponsor, compared with the count on hand.
**Output.** Compliance per visit, discrepancies in units, and rows outside the protocol's
compliance range (reader input; nothing is assumed).
**Source.** 21 CFR 312.62(a) (records of disposition: "dates, quantity, and use by subjects")
and 312.57(a). The formula is arithmetic on those records.
**Scope.** No federal rule sets a compliance threshold; the range is always the protocol's.

### Nuclear pharmacy

### 24. `radioactive-decay` — Decay, Precalibration and Activity Units

**Input.** Radionuclide (picker or a typed half-life), activity and its unit (Ci, mCi, µCi, Bq,
kBq, MBq, GBq), calibration date and time, target date and time.
**Compute.** A(t) = A₀ × 2^(−t ÷ T½), forward or back; the time to reach a target activity;
1 Ci = 3.7 × 10¹⁰ Bq (the conversion the CFR uses throughout: 0.005 µCi = 185 Bq). States
whether the nuclide's half-life is 120 days or less, the test for decay-in-storage in 10 CFR
35.92.
**Output.** Activity in both unit systems, the decay factor, elapsed half-lives.
**Data.** Half-lives read from FDA labels: Tc-99m 6.02 h; Mo-99 66 h; F-18 109.8 min; I-131
8.02 d; I-123 13.2 h; In-111 67.2 h; Tl-201 72.9 h; Lu-177 6.647 d; Ra-223 11.4 d; Rb-82 75 s;
Sr-82 25 d; Ga-68 68 min; N-13 9.96 min. Each is a label row under
[spec-v1628](spec-v1628.md) §1.
**Source.** The FDA label of each product (Physical Characteristics); 10 CFR 35.92.
**Note.** 35.92 has no "10 half-lives" rule. It requires a survey at the surface, with no
shielding, that cannot be distinguished from background. The tool does not print a 10-half-life
date as a release date.

### 25. `radiopharm-dispense-volume` — Volume to Draw for a Prescribed Activity

**Input.** Vial activity and volume at calibration time, radionuclide, prescribed activity (or
the prescribed range) and administration time, draw time, measured activity (optional).
**Compute.** Concentration at draw time by decay; volume = activity needed at draw time ÷
concentration, where activity needed = prescribed × 2^(Δt ÷ T½) for the interval from draw to
administration. With a measured activity: decay it to administration time and report percent
difference from prescribed.
**Output.** Volume, expected reading at draw, and whether the dosage is within the prescribed
range and within 20% of the prescribed dosage.
**Source.** 10 CFR 35.63(d): a licensee may not use a dosage that "does not fall within the
prescribed dosage range or if the dosage differs from the prescribed dosage by more than 20
percent," unless the authorized user directs otherwise. 35.63(b) and (c) permit determination by
decay correction.

### 26. `generator-breakthrough-check` — Mo-99, Sr-82 and Sr-85 Breakthrough Against the Limits

**Input.** Generator type. Tc-99m: Mo-99 (µCi) and Tc-99m (mCi) at elution time, planned
administration time, aluminum (µg/mL). Rb-82: Sr-82 and Sr-85 per mCi Rb-82, cumulative eluate
volume, days since calibration.
**Compute.** Tc-99m: ratio at elution; ratio at time t = ratio₀ × 2^(t ÷ 6.02 h − t ÷ 66 h);
the time at which it reaches 0.15 µCi Mo-99 per mCi Tc-99m; the 12-hour eluate limit and the
10 µg/mL aluminum limit from the generator label. Rb-82: 10 CFR 35.204 limits 0.02 µCi Sr-82
and 0.2 µCi Sr-85 per mCi Rb-82; the CardioGen-82 label's stricter expiration limits (0.01 and
0.1 µCi/mCi, 17 L, 60 days after calibration) and alert limits (0.002 and 0.02 µCi/mCi, 14 L).
**Output.** Pass or exceeds, the latest administration time, which limit binds. On an
exceedance at elution: telephone report to the NRC Operations Center and the generator's
distributor within 7 calendar days, and written report within 30 calendar days, of discovery
(10 CFR 35.3204).
**Source.** 10 CFR 35.204, 35.3204; TECHNELITE label; CARDIOGEN-82 label.
**Note.** The rule sets the limit for what is administered and requires the report for an
exceedance "at the time of generator elution." The tool keeps those two tests apart, and shows
the rule and the label side by side without picking.

### 27. `patient-release-rg839` — Patient Release Under 10 CFR 35.75 (Regulatory Guide 8.39)

**Input.** Radionuclide, administered activity or measured dose rate at 1 meter; for an
unlisted nuclide, exposure rate constant and half-life; for I-131, condition (hyperthyroidism or
post-thyroidectomy cancer) and two occupancy factors (first 8 hours, and after).
**Compute.**
- Table 1 release activity and dose rate, and Table 2 instruction thresholds (for example I-131
  33 mCi and 7 mrem/h; instructions above 7 mCi or 2 mrem/h; Tc-99m 760 mCi and 58 mrem/h).
- Unlisted nuclide: D(∞) rem = 34.6 × Γ × Q₀ × Tp × E ÷ (100 cm)², with E = 0.25 for physical
  half-lives over 1 day (Equation 2) and 1.0 for 1 day or less (Equation 3); solved for the
  activity giving 0.5 rem and 0.1 rem. Γ is in R·cm²/(mCi·h), Q₀ in mCi, Tp in days; the guide
  takes 1 roentgen as 1 rem.
- I-131 patient-specific, Equation B-5: D(∞) = [34.6 × Γ × Q₀ ÷ (100 cm)²] × {E₁ × Tp × 0.8 ×
  (1 − e^(−0.693 × 0.33 ÷ Tp)) + e^(−0.693 × 0.33 ÷ Tp) × E₂ × F₁ × T₁eff +
  e^(−0.693 × 0.33 ÷ Tp) × E₂ × F₂ × T₂eff}, with Table B-1 (hyperthyroidism F₁ 0.20, T₁eff
  0.32 d, F₂ 0.80, T₂eff 5.2 d; post-thyroidectomy F₁ 0.95, T₁eff 0.32 d, F₂ 0.05, T₂eff 7.3 d),
  Γ = 2.2 and Tp = 8.04 d from Table A-1. E₁ is the occupancy factor for the first 8 hours
  (0.33 day) and E₂ from 8 hours on; the guide's examples use 0.75 and 0.25.
**Output.** Releasable or not on the default table, whether written instructions are required
(above 0.1 rem), the dose from the patient-specific equation, and the record 35.75(c) requires.
**Source.** 10 CFR 35.75 (5 mSv release, 1 mSv instructions); NRC Regulatory Guide 8.39 Rev. 1,
April 2020, Equations 2, 3 and B-5 and Tables 1, 2, A-1 and B-1, read on the rendered pages.
**Check done.** The equations reproduce the guide: Tc-99m 761 mCi (table 760), I-131 32.7 mCi
(table 33), Example 3 (55 mCi, hyperthyroidism, E₁ 0.75, E₂ 0.25) 0.486 rem (guide 4.86 mSv),
and Example 2 (200 mCi, thyroid cancer, same factors) 0.453 rem (guide 4.53 mSv).
**Scope.** The tool does not choose an occupancy factor; the guide ties factors below the
defaults to patient-specific instructions and a record. Agreement States may differ; the guide
says so and so does the tool.

### 28. `nuc-med-breastfeeding-interruption` — Breastfeeding Interruption After a Radiopharmaceutical

**Input.** Radiopharmaceutical, administered activity.
**Compute.** Regulatory Guide 8.39 Table 3: whether the activity is above the instruction
threshold and the record threshold, and the recommended interruption. Rows read include I-131
sodium iodide (instructions above 0.0004 mCi, record above 0.002 mCi; complete cessation for
this infant or child), Tc-99m agents (one 24-hour period; for example MAA 1.3 and 6 mCi,
pertechnetate 3 and 15 mCi), I-123 sodium iodide 3 days (0.5 and 3 mCi), Ga-67 28 days (0.04
and 0.2 mCi), In-111 white cells 6 days (0.2 and 1 mCi), Tl-201 4 days (1 and 5 mCi). A second
block gives a duration with no activity threshold: F-18 FDG 4 hours, Ga-68 octreotate 4 hours,
In-111 octreotate 6 days, Zr-89 28 days, Lu-177 octreotate, I-124 sodium iodide and Ra-223 and
all alpha emitters complete cessation, and C-11, N-13, O-15 and Rb-82 no interruption.
**Output.** Instructions required or not, record required or not, the interruption, footnote a
(durations target under 1 mSv to the infant; the limit is 5 mSv). For the second block the tool
gives the duration and says the guide leaves the infant dose to a calculation it does not do.
**Source.** 10 CFR 35.75(b); Regulatory Guide 8.39 Rev. 1, Table 3, read on the rendered pages.
Group G.

### 29. `nrc-medical-event-screen` — Is It a Reportable Medical Event? (10 CFR 35.3045)

**Input.** Prescribed and delivered dose or dosage; the dose difference in rem (effective, organ
or skin) as estimated by the reader; whether the cause was a wrong drug, route, individual or
mode; dose to a site other than the treatment site and the dose expected there; whether it
resulted from patient intervention and, if so, whether a physician finds unintended permanent
functional damage; discovery date and time.
**Compute.** The 35.3045(a)(1) tests, any one of which makes an event:
- (i) dose difference above 5 rem effective dose equivalent, 50 rem to an organ or tissue, or 50
  rem shallow dose equivalent to the skin, **and** total dose off by 20% or more, or total
  dosage off by 20% or more or outside the prescribed range, or a single fraction off by 50% or
  more;
- (ii) a dose above the same three thresholds from a wrong radioactive drug, wrong route, wrong
  individual, wrong mode of treatment, or a leaking sealed source;
- (iii) a dose to skin or to an organ or tissue other than the treatment site that exceeds the
  expected dose by 50 rem or more **and** by 50% or more.

Patient intervention takes an event out of paragraph (a), but paragraph (b) still requires a
report when the intervention results or will result in unintended permanent functional damage,
as determined by a physician. Then the clocks: telephone the NRC Operations Center no later than
the next calendar day after discovery (c); written report within 15 days after discovery (d);
notify the referring physician and the individual no later than 24 hours after discovery (e).
**Output.** Meets or does not meet each test, and the three due times.
**Source.** 10 CFR 35.3045. Related: 35.3047 (embryo or fetus above 5 rem dose equivalent unless
approved in advance by the authorized user; nursing child above 5 rem total effective dose
equivalent or with permanent functional damage; same clocks), shown as a second screen.
**Scope.** Paragraph (a)(2), permanent implant brachytherapy, has its own source-strength
criteria and is left out. The reader supplies the dose estimate. Agreement State rules may
differ.

### 30. `rad-package-label-category` — Radioactive Package Label Category and Transport Index

**Input.** Maximum dose rate at the package surface and at 1 meter (mrem/h or mSv/h).
**Compute.** Transport index = dose rate at 1 m in mrem/h (mSv/h × 100), rounded up to the next
tenth; a measured value of 0.05 or less may be taken as 0. Category is the higher of the two
tests: WHITE-I (index 0 and surface ≤ 0.5 mrem/h); YELLOW-II (index above 0 to 1, surface above
0.5 to 50); YELLOW-III (index above 1 to 10, or surface above 50 to 200). Index above 10, or
surface above 200 up to 1,000 mrem/h: YELLOW-III, shipped under exclusive use (173.441(b)).
**Output.** Index, label, which test set it, and the 172.403(g) label entries (contents,
activity in SI units, index).
**Source.** 49 CFR 172.403(b), (c); 173.403 (definition of transport index); 173.441(a).
**Note.** Footnote 1 to the table makes any package holding a highway route controlled quantity
YELLOW-III; the tool asks and applies it.
**Test value.** The regulation's own example: index 0.8 and surface 60 mrem/h → YELLOW-III.

### 31. `rad-package-receipt-check` — Receiving a Radioactive Package (10 CFR 20.1906)

**Input.** Date and time received, working hours, wipe result (net counts per minute, counter
efficiency, area wiped), surface and 1 m dose rates, emitter type.
**Compute.** Monitoring due within 3 hours of receipt in working hours, or 3 hours from the start
of the next working day. Removable contamination = net cpm ÷ counter efficiency ÷ area ÷ wipe
efficiency (0.10 unless the actual value is used), compared with 240 dpm/cm² for beta, gamma
and low-toxicity alpha emitters or 24 dpm/cm² for other alpha emitters (4 and 0.4 Bq/cm²), over
300 cm². Radiation limits 200 mrem/h at the surface and index 10.
**Output.** Deadline, dpm/cm², pass or exceeds; on an exceedance, the duty to notify the final
delivery carrier and the NRC Headquarters Operations Center immediately by telephone.
**Source.** 10 CFR 20.1906(b), (c), (d); 10 CFR 71.87(i), 71.47(a); 49 CFR 173.443(a) and Table 9.
**Scope.** 20.1906(b) decides which monitoring applies: contamination for a labeled package
unless the contents are a gas or special form; radiation levels for a labeled package above a
Type A quantity; both for any package showing damage. The tool asks those three questions and
does not look up Type A quantities.

### 32. `sealed-source-leak-test` — Sealed Source Leak Test Result and Next Due Date

**Input.** Net counts per minute, counter efficiency, last test date, source facts (half-life,
gas, activity, in storage).
**Compute.** Activity = net cpm ÷ efficiency ÷ 2.22 × 10⁶ dpm per µCi. Leaking at 0.005 µCi
(185 Bq) or more. Next test within 6 months. Exemptions in 35.67(f): half-life under 30 days;
gas; 100 µCi or less beta or gamma or 10 µCi or less alpha; Ir-192 seeds in nylon ribbon; stored
and not in use (tested before any use or transfer unless tested within the prior 6 months).
**Output.** µCi and Bq, leaking or not, next due date, and on a failure the report due within
5 days of the leak test.
**Source.** 10 CFR 35.67(b), (c), (e), (f).

### 33. `pediatric-administered-activity` — Pediatric Administered Activity (North American Consensus)

**Input.** Radiopharmaceutical and protocol, weight (kg).
**Compute.** Activity = guideline MBq/kg × weight, raised to the guideline minimum and lowered to
the guideline maximum.
**Output.** MBq and mCi, and whether a minimum or maximum was applied. Group G.
**Source.** Treves et al., "2024 Update of the North American Consensus Guidelines for Pediatric
Administered Radiopharmaceutical Activities," J Nucl Med Technol 2025;53:193-197.
**Build gate.** The 2024 table (29 protocols) was not opened; only the abstract was read. The
2016 values are superseded and must not ship. See Verify at build, including licensing.

### 34. `radiation-distance-shielding` — Dose Rate at a Distance and Behind Lead

**Input.** Measured dose rate and its distance; new distance; radionuclide and lead thickness,
or a typed half-value layer.
**Compute.** Inverse square: rate₂ = rate₁ × (d₁ ÷ d₂)². Shielding: the label's lead attenuation
table for the nuclide (Tc-99m: 0.023 cm halves it; 0.09 cm 10⁻¹; 0.18 cm 10⁻²; 0.27 cm 10⁻³;
0.33 cm 10⁻⁴), or 0.5^(thickness ÷ half-value layer) for a typed value.
**Output.** Dose rate at the new distance and behind the shield, and stay time to a reader-entered
dose.
**Source.** The attenuation table in each product's FDA label (TECHNELITE read; CARDIOGEN-82
has one). The inverse-square relation is the same point-source geometry Regulatory Guide 8.39
Equation 1 uses.
**Scope.** Point source, narrow beam. The tool says it is not a shielding design.

### 35. `occupational-dose-limit-check` — Occupational Dose Against the Annual Limits

**Input.** Year-to-date dosimetry: total effective dose equivalent, organ dose, lens, skin or
extremity; declared pregnancy and embryo-fetus dose to date.
**Compute.** Percent of 5 rem (total effective dose equivalent), 50 rem (deep-dose plus committed
dose equivalent to any organ or tissue other than the lens), 15 rem (lens), 50 rem (skin or
extremity), and 0.5 rem for the embryo or fetus over the whole pregnancy. Projects the year-end
value at the current monthly rate.
**Output.** Percent of each limit and the month the projection crosses it. ALARA investigation
levels are license-specific and are reader input.
**Source.** 10 CFR 20.1201(a), 20.1208(a).

## Backfills (live tools that should do more)

| Live tool | Backfill | Source |
|---|---|---|
| `anc` | A correction, indexed in [spec-v1641](spec-v1641.md). The lib labels 1,000 to 1,499 "CTCAE grade 1," 500 to 999 "grade 2-3" and under 500 "grade 4" and cites v5.0. CTCAE v5.0 reads grade 1 below the lower limit of normal to 1,500; grade 2 below 1,500 to 1,000; grade 3 below 1,000 to 500; grade 4 below 500 per mm³. CTCAE v6.0 (2025, MedDRA 28.0) reads grade 1 below 1,500 to 1,000; grade 2 below 1,000 to 500; grade 3 below 500 to 100; grade 4 below 100. The live labels match neither version. Choose the version, print it on the result, and make the labels match its rows. | NCI CTEP adverse events page (updated September 23, 2026); CTCAE v5.0 and v6.0 Quick Reference PDFs, "Neutrophil count decreased" |
| `calvert-carboplatin` | Link to `chatelut-carboplatin`; print the label's own Calvert wording (GFR measured by 51Cr-EDTA in the source studies; target AUC 4 to 6 as a single agent in previously treated patients). The live citation attributes the 125 mL/min cap to FDA (2010) without a link, and the carboplatin label read carries no cap; find and link the FDA document (also indexed in [spec-v1641](spec-v1641.md)). | Carboplatin label; `lib/metabolic-onc-v88.js`, `lib/meta.js` |
| `dose-calendar` | A cycle mode: cycle length, treatment days within a cycle (for example days 1, 8 and 15 of 28), number of cycles; answers "what cycle and day is this date" and re-anchors later cycles after a delay. | Arithmetic on the regimen the reader enters |
| `unit-converter` | Activity (Ci, mCi, µCi ↔ Bq, MBq, GBq) and dose (rem ↔ Sv, rad ↔ Gy) pairs. | 10 CFR 35.67 (0.005 µCi = 185 Bq); 35.75 (0.5 rem = 5 mSv) |
| `tls-cairo-bishop` | Link to `rasburicase-dose`. | |

## Rejected

| Idea | Why not |
|---|---|
| BSA cap at 2.0 m² as a shipped rule | ASCO 2021 recommends full weight-based doses; a cap is institutional. It is a reader input in `chemo-dose-verify`. |
| Vincristine 2 mg cap from the label | The label read gives 1.4 mg/m² for adults and no 2 mg maximum. The cap is protocol practice with no primary source here. |
| Cisplatin per-cycle maximum | The current label lists regimen doses (for example 75 to 100 mg/m² per cycle) and no ceiling. |
| Doxorubicin "450 mg/m² with mediastinal radiation" | Not in the current label, which gives incidence by dose, 550 mg/m², and an unquantified added risk with mediastinal radiotherapy. Shipping 450 would cite text that is not there. |
| Idarubicin 150 mg/m² | The label read says 90 mg/m². |
| Cross-anthracycline doxorubicin-equivalent factors | No FDA label gives ratios. The Children's Oncology Group ratios are in a COG document whose license was not read. Reader-entered factors only. |
| Emetogenic risk class | A classification list with no computation; NCCN is licensed; the MASCC/ESMO and ASCO tables are copyrighted lists. |
| Checkpoint inhibitor weight-based versus flat dose | A per-drug table that changes with each label supplement; `weight-dose` and `vial-rounding` cover the arithmetic. |
| General CTCAE grader | CTCAE terms are MedDRA terms. The NCI page points to NCI's general reuse guidance and says nothing about MedDRA terms. Licensing unclear; only lab-value grades already cited (`anc`) stay. |
| NHS England dose-banding tables | The page would not render; license and structure unconfirmed. UK tables are also not US practice. |
| Hyaluronidase for extravasation | Not a labeled use. |
| Dexrazoxane for anthracycline extravasation | The Totect label was not found on DailyMed (the dexrazoxane labels listed are cardioprotection labels). Held, not built. |
| Temozolomide capsule combinations | The label read has no capsule-combination table, and the strengths section was not found in the extracted text. Without them the tool is unsourced. |
| High-dose methotrexate nomograms other than the label table | Protocol-specific; not in the label. |
| Mesna by continuous infusion | Not in the label. |
| Hydration and urine alkalinization calculators | Protocol fluid orders. The methotrexate label gives a target (urinary pH of 7 or higher), not a computable rule. |
| Randomization, blinding, kit assignment | Not deterministic from a public rule. |
| MedWatch voluntary report clock | No clock exists for voluntary reports. The 15-day alert in 21 CFR 314.80 binds applicants, not pharmacists; it is in `fda-adverse-event-report-clock` ([spec-v1634](spec-v1634.md)). |
| IRB "prompt reporting" clock | 21 CFR 56.108(b) says "prompt" and sets no number; the number is each IRB's. |
| Dose calibrator accuracy, linearity, constancy and geometry limits | 10 CFR 35.60(b) now requires only calibration "in accordance with nationally recognized standards or the manufacturer's instructions." No numeric limit is in the rule; the standards are paid. The decay arithmetic for a linearity test is `radioactive-decay`. |
| Radiopharmaceutical beyond-use dating | USP <825> text. Excluded by admission rule 6 ([spec-v1500](spec-v1500.md)). |
| "Ten half-lives" decay-in-storage date | Not in 10 CFR 35.92. |
| Tc-99 to Tc-99m mole fraction and generator in-growth yield | No primary source with the branching fraction was read. |
| Clark's, Young's and Webster's rules for pediatric activity | Historical; superseded by the consensus guideline. |
| EANM pediatric dosage card | EANM publication; license not read. The North American guideline covers the US reader. |
| Half-lives from NIST | NIST withdrew its table and points to DDEP; the IAEA API sits behind a bot challenge. FDA labels supply the values instead. |
| Hazardous-drug handling, sterile compounding, temperature excursions, antidotes, kinetics | Owned by [spec-v1630](spec-v1630.md) (sterile compounding, hazardous drugs, storage), [spec-v1636](spec-v1636.md) (antidotes) and [spec-v1631](spec-v1631.md) (kinetics). |

## Research record

All sources were read on October 10, 2026. DailyMed labels were fetched as
`https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/<setid>.xml`; the date shown is the
label's `effectiveTime` unless it says "published." Under [spec-v1628](spec-v1628.md) §1 the
build stores the version and published date instead.

| Finding | Where read (URL) | Effect on the spec |
|---|---|---|
| Doxorubicin: "Cumulative doses above 550 mg/m²…"; probability 1-2% at 300, 3-5% at 400, 5-8% at 450, 6-20% at 500. No 450-with-radiation limit. | DailyMed set 1fd148fb-0fbc-4b6f-b790-23546fb46a71 (Pfizer, version 28, effective 2026-05-05, published 2026-05-07) | Tool 4 reports incidence bands; the 450 rule is rejected. |
| Doxorubicin hepatic table: 1.2-3 mg/dL 50%, 3.1-5 mg/dL 75%, above 5 do not initiate. The Pfizer label heads the column "Dosage Modification" (XML and rendered table agree); the Hikma ADRIAMYCIN and Sun labels head the same rows "Dose reduction." | DailyMed sets 1fd148fb (Pfizer); 090bc1b1-3dc2-408d-94e6-48d2a3d4426c (ADRIAMYCIN, Hikma, 2024-04-11); 6bcde92b-e584-4919-866a-68847ea201ba (Sun, 2022-01-17); ae80bd3a-b99a-4e01-a444-b9d05687f00e (Sagent, same wording as Pfizer) | Corrected: the build gate on doxorubicin in tool 13 is lifted. The percentages are reductions. |
| Epirubicin 900 mg/m² "should generally be avoided"; 0.9%, 1.6%, 3.3% at 550, 700, 900. Hepatic: half and one quarter. Creatinine above 5 mg/dL. | DailyMed set 0a03c798-a652-4895-b29c-3b521a89ba42 (2026-07-24) | Tools 4, 13. |
| Daunorubicin 550; "400 to 550" in the boxed warning; 400 with cardiac radiation; 300 children over 2; 10 mg/kg under 2. Bilirubin and creatinine rows. | DailyMed set 227784a8-ce68-4dd4-8ac5-a65265969677 (2024-02-15) | Tools 4, 13. |
| Idarubicin: 90 mg/m²; bilirubin above 2.6 and under 5 reduce 50%, above 5 avoid; "Include prior doses of other anthracyclines or anthracenediones." | DailyMed set 0a5a6d93-cc1e-4d7f-8da1-446c134503b3 (2026-04-15) | Tools 4, 13. A 150 mg/m² figure in circulation is not this label's. |
| Mitoxantrone 140 mg/m². | DailyMed set accf9569-4b57-4e83-a7db-4e890a75d1ba (2025-07-14) | Tool 4. |
| Bleomycin 400 units; creatinine clearance table. The label prints the Cockcroft-Gault result as "mL/min/1.73m²." | DailyMed set 640602f9-a7df-46f0-a9b1-19c471008bee (2026-04-17) | Tools 4, 13. The unit oddity is quoted, not corrected. |
| Vincristine: 1.4 mg/m² adults; 50% reduction for direct bilirubin above 3 mg/100 mL; no 2 mg cap. | DailyMed set b22e4c8e-dbe1-4d4b-a026-e1812974071c (2026-02-17) | Cap rejected. |
| Dexrazoxane 10:1; 5:1 under 40 mL/min; after 300 mg/m² doxorubicin; doxorubicin within 30 minutes. | DailyMed sets 9cbd2987-10bb-eceb-153d-ee7be1ed0c84 (2025-08-01), cb72203a-0b09-42d5-bf51-7f479feb3adb (2026-08-10) | Tool 5. |
| Mesna 20% at 0, 4, 8 h (60%); or 20% intravenous then 40% oral at 2 and 6 h (100%); the oral ratio is not established above 2 g/m² ifosfamide daily. | DailyMed set 2e8eebc3-ea75-4c57-bfe1-2c5dc2c37806 (MESNEX, Baxter, version 10, published 2026-05-28; its `effectiveTime` reads 2018-07-24) | Tool 6. Corrected: the label is the current version, not a 2018 one; the 2 g/m² sentence was added. |
| Leucovorin rescue table (three rows, levels, doses, routes, the 0.5 to 1 mg/dL creatinine example, stop at 0.05 µmol/L). | DailyMed set 9d0e5356-ff39-4a8e-944c-e808a21ef4b2 (version 10, effective 2026-03-11, published 2026-07-23) | Tool 7. The gaps at 24 and 48 hours were added. |
| Methotrexate: leucovorin at 500 mg/m² or more; glucarpidase above 1 µmol/L; intrathecal age bands 6, 8, 10, 12, 12 to 15 mg in section 2.4; molecular weight 454.44. | DailyMed set dd035a9f-cd40-4314-b9d8-2294b8a924e2 (version 7, effective 2026-09-04, published 2026-09-07) | Tools 7, 8, 9. Corrected: the intrathecal table is in section 2.4, not "section 2." The molecular weight supplies the mg/L conversion. |
| Glucarpidase 50 units/kg over 5 minutes; 1,000-unit vial; leucovorin 2 hours apart; 48-hour and 3-day rules; delayed clearance defined as more than 2 standard deviations above the mean excretion curve; chromatographic assay within 48 hours. | DailyMed set acaef5a6-b740-40e3-8ffe-74a75c74745c (2024-11-27) | Tool 8. Corrected: vial size added; the 2-standard-deviation criterion is reader input. |
| Rasburicase 0.2 mg/kg daily up to 5 days; 1.5 and 7.5 mg vials; G6PD. | DailyMed set 0ae10bc4-6b65-402f-9db5-2d7753054922 (2026-07-30) | Tool 10. |
| Filgrastim: at least 24 h after and not within 24 h before chemotherapy. | DailyMed set 97cc73cc-b5b7-458a-a933-77b00523e193 (2026-07-23) | Tool 11. |
| Pegfilgrastim: not between 14 days before and 24 h after; 6 mg for "adults of any weight and pediatric patients weighing at least 45 kg"; pediatric table under 45 kg. | DailyMed set fdfe5d72-6b80-435a-afa4-c5d74dd852ce (2026-08-10) | Tool 11. Corrected: the weight table applies to children only; an adult under 45 kg gets 6 mg. |
| Epoetin and darbepoetin chemotherapy rules. | DailyMed sets 1f2d0b28-9cc5-4523-80b8-637fdaf3f7a5 (2026-06-23), 0fd36cb9-c4f6-4167-93c9-8530865db3f9 (2026-07-07) | Tool 12. |
| Capecitabine: 1,250 or 1,000 mg/m² twice daily days 1 to 14 of 21; 25% reduction at 30 to 50 mL/min (2.7); "Round… to the nearest 150 mg dose" (2.8); Table 1 percent-of-dose; DPYD testing (2.1); 150 and 500 mg tablets. | DailyMed set e702d84d-7162-4751-bf37-d724cc7e45a5 (2026-02-05) | Tool 14 follows a rounding rule, not a BSA table. |
| Paclitaxel hepatic table (Table 17); docetaxel avoid rule; pemetrexed 45 mL/min; carboplatin Calvert text and 125%/75% table, no 125 mL/min cap in the label; cisplatin has no ceiling. | DailyMed sets ea28753a-8631-460a-bfdc-b101eb8ac84a, 2fb017fd-e55e-43ef-9024-07f2d412b37b, f5a860f3-37ec-429c-ae04-9c88d7c55c08, 4c89cedc-e48b-445c-ad05-54dbe60e4fb0, 508496cb-3441-46b3-a4fe-e0d440e6adc6 | Tool 13; cisplatin limit rejected; `calvert-carboplatin` backfill. |
| Irinotecan UGT1A1 sentence (*28 and *6), section 2.3. | DailyMed set b66dbd6d-6ccb-ce9d-e053-2995a90a4c3c (2026-08-26) | Tool 18. |
| The live `calvert-carboplatin` caps an entered GFR above 125 mL/min by default and reports the substitution; its citation names FDA (2010) with no link. The live `anc` cites CTCAE v5.0 with grade labels that match neither v5.0 nor v6.0. | `lib/metabolic-onc-v88.js`, `lib/clinical-v6.js`, `lib/meta.js` in this repository | Backfills. |
| CTCAE v6.0 released 2025 (MedDRA 28.0). "Neutrophil count decreased" rows in v5.0 and v6.0. The page points to "Reuse of NCI Information" and does not address MedDRA terms. | `https://dctd.cancer.gov/research/ctep-trials/for-sites/adverse-events` and its `ctcae-v6.pdf` and `ctcae-v5-8x11.pdf` | Corrected: the `anc` backfill is a grade-label correction, not only a version note; the reuse wording under Rejected was fixed. |
| ASCO 2021: full weight-based doses; full approved doses of immunotherapy and targeted therapy. | PubMed abstract, PMID 33939491 (E-utilities efetch) | Tool 1 default; cap rejected. Full text not read. |
| Chatelut formula; derived in 34 patients (46 cycles), tested in 36 (49 cycles), ages 23 to 84; median absolute error 10%. The abstract prints no division sign before "creatinine." | PubMed abstract, PMID 7752255 | Tool 2. Corrected: "derived in 70 adults" was wrong; 70 is derivation plus test. |
| Chatelut formula reproduced with the bracketed term divided by serum creatinine, applied with Jaffé creatinine. | Europe PMC full text, PMC2361403 (Kinoshita et al., Br J Cancer 2006;94:1267-1271, CC BY 4.0) | Tool 2: the division is confirmed from a paper that reproduces it; the original's assay is still a Verify at build item. |
| 12-step table for 600 mg (rates 2.5 to 80 mL/h, 339.38 min); 8-step and 16-step tables (279.38 and 399.38 min). | Europe PMC full text, `https://www.ebi.ac.uk/europepmc/webservices/rest/PMC9156473/fullTextXML` (CC BY 4.0) | Tool 15. First step is 2.5 mL/h. The arithmetic was derived independently and matches every row. |
| CPIC content is CC0 1.0; attribution requested. PharmGKB/ClinPGx data are CC BY-SA 4.0 (a different license: do not mix). | `https://api.clinpgx.org/v1/data/page/dataUsagePolicy` (cpicpgx.org/license redirects there) | The pharmacogenomic tools read CPIC tables only. |
| CPIC API: 29 guidelines, 96 level-A pairs across 21 genes; DPYD score rule; five DPYD rows per drug with strengths; 35 mercaptopurine rows; UGT1A1-irinotecan pair has no guideline; guideline versions 71 and 72. | `https://api.cpicpgx.org/v1/` (`guideline`, `pair_view`, `gene`, `recommendation_view`) | Tools 16, 17, 18; [spec-v1640](spec-v1640.md). |
| IND safety: 15 calendar days from determination; 7 calendar days from initial receipt for fatal or life-threatening; 15 calendar days for FDA requests and late-qualifying events. | eCFR 21 CFR 312.32 | Tool 19. |
| "Nonclinical Testing Terminology," direct final rule, effective February 4, 2027; comments close December 7, 2026; withdrawn if significant adverse comment arrives. eCFR flags the amendment on 312.32 and 312.33. | Federal Register API, document 2026-19350 (91 FR 59988, amendatory text at 60003) | Tool 19 note. Corrected: the rule also touches 312.33 and is not yet certain to take effect. |
| Emergency expanded access: 15 working days. IRB: 5 working days. Summary at the conclusion of treatment. | eCFR 21 CFR 312.310(c)(2), (d)(2); 56.104(c) | Tool 20. |
| Annual report within 60 days of the anniversary; IND effective 30 days after receipt; new investigator 30 days. | eCFR 21 CFR 312.33, 312.40(b), 312.30(c) | Tool 21. |
| Retention 2 years (investigator and sponsor). Disposition records. Investigator reports "immediately." | eCFR 21 CFR 312.62, 312.57, 312.64 | Tools 19, 22, 23. |
| Mo-99 0.15 µCi/mCi; Sr-82 0.02; Sr-85 0.2; reports in 7 and 30 calendar days to NRC and (by telephone) the distributor. | eCFR 10 CFR 35.204, 35.3204 | Tool 26. |
| TechneLite: Tc-99m 6.02 h; Mo-99 66 h; 0.15 µCi/mCi at administration; aluminum 10 µg/mL; 12 hours; lead table. | DailyMed set 3ae14c6b-3daf-4dd1-bbdb-e990fe8100e4 (2024-11-01) | Tools 24, 26, 34. |
| CardioGen-82: expiration limits 0.01 and 0.1 µCi/mCi, 17 L, 60 days; alert limits 0.002 and 0.02, 14 L; Rb-82 75 s; Sr-82 25 d. | DailyMed set ee95aa18-9f2f-40eb-9b4c-583bea6f36bf (2026-05-14) | Tool 26 shows the label limits beside the looser rule. |
| Other half-lives: F-18 109.8 min; I-123 13.2 h; In-111 67.2 h; Tl-201 72.9 h; Lu-177 6.647 d (two labels); Ra-223 11.4 d; Ga-68 68 min (two labels); N-13 9.96 min. | DailyMed sets 09ae2a6d-673a-423a-ba45-3c543061b103, 493fa2ab-4eb0-4434-9739-3079b2f0e272, 7dbfc0f9-0e2e-4aed-85bd-32cf7c74d402, 0da81fc0-a137-46d3-9378-d8053a82e61a, 72d1a024-00b7-418a-b36e-b2cb48f2ab55, 14908037-2892-4d98-a053-253ce35afb1a, a398400e-bd31-41a9-9696-4f7c06569ede, b2b3be70-17d8-4093-896c-f1c54a2cf242, d4643b31-9b4f-673f-e053-2a95a90a559d, 80121d8f-fb9d-4122-9e12-33b4ba4f2b9a | Tool 24. |
| 10 CFR 35.60 and 35.63: no numeric calibrator limits; 20% dosage rule. | eCFR | Calibrator tool rejected; tool 25. |
| 35.67: 0.005 µCi, 6 months, report within 5 days of the leak test, exemptions. 35.75: 5 mSv and 1 mSv. 35.92: 120 days, survey, no half-life count. | eCFR | Tools 24, 27, 32. |
| 35.3045: three tests in (a)(1) including the other-site test in (iii) and a leaking sealed source in (ii)(E); (b) patient intervention with permanent functional damage; clocks in (c), (d), (e). 35.3047. | eCFR | Tool 29. Corrected: test (iii), the leaking source and paragraph (b) were missing; "patient intervention excludes it" was too broad. |
| RG 8.39 Rev. 1: Equations 2, 3 and B-5; Tables 1, 2, 3, A-1, B-1; Examples 2 and 3. Equation B-5 carries two occupancy factors; both examples use 0.75 for the first 8 hours and 0.25 after. | NRC ADAMS, accession ML19232A081 (`https://adamswebsearch2.nrc.gov/webSearch2/main.jsp?AccessionNumber=ML19232A081`), pages 5, 8, 10 to 12, B-4 and B-5 rendered as images | Tools 27, 28. Corrected: tool 27 took one occupancy factor and its test said E = 0.25; Table 3's last block was confirmed row by row (it is Lu-177 octreotate, and I-124 sodium iodide is also complete cessation). |
| I-131 half-life: label 8.02 d; RG 8.39 Table A-1 8.04 d. | HICON label (set 524a0dac-6e2b-2c0c-04b4-76d85dba63c5); RG 8.39 | `radioactive-decay` uses the label; `patient-release-rg839` uses the guide's value so its table reproduces. Each tool names its value. |
| Label categories; transport index definition and rounding; 0.05 footnote; highway route controlled quantity footnote; 200 mrem/h and index 10; above them YELLOW-III under exclusive use to 1,000 mrem/h. | eCFR 49 CFR 172.403, 173.403, 173.441; 10 CFR 71.47 | Tool 30. Corrected: the top row and footnote 1 were added. |
| Receipt: which packages are monitored for what (b); 3 hours (c); notification (d); limits by reference to 71.87(i) → 49 CFR 173.443 Table 9 (4 and 0.4 Bq/cm²; 240 and 24 dpm/cm²; 300 cm²; wipe efficiency 0.10). | eCFR 10 CFR 20.1906, 71.87; 49 CFR 173.443 | Tool 31. |
| Occupational limits 5, 50, 15, 50 rem; embryo-fetus 0.5 rem over the entire pregnancy. | eCFR 10 CFR 20.1201, 20.1208 | Tool 35. |
| The North American pediatric guideline was updated in 2024 (23 protocols kept, 9 of them modified, 6 added). | PubMed abstract, PMID 40664486 | Tool 33 is gated on the 2024 table; 2016 values are stale. |
| NIST half-life table withdrawn in favor of DDEP. | `https://www.nist.gov/pml/radionuclide-half-life-measurements` | Half-lives come from FDA labels. |

## Verify at build

- **`relative-dose-intensity`:** Hryniuk and Bush 1984 was not opened. Read the definition of
  dose intensity (mg/m² per week) and of the reference regimen before building; if the paper
  defines RDI only against a named standard regimen, the tool must say the reader's planned
  regimen stands in for it.
- **`chatelut-carboplatin`:** the division by creatinine was read in a later paper, not in
  Chatelut 1995. Confirm it in the original, and confirm the creatinine assay the original used
  (Kinoshita et al. treat it as Jaffé).
- **`chemo-dose-verify`:** only the abstract of ASCO 2021 was read. Read the full recommendation
  on fixed dosing ("select cytotoxic agents") before quoting more than the abstract.
- **`chemo-organ-label-dose`:** confirm each drug's rule on a second manufacturer's label; two
  labels that disagree drop the drug. (Done for doxorubicin on October 10, 2026: four labels
  carry the same rows.)
- **`cumulative-dose-limit`:** confirm the liposomal products are excluded from the picker.
- **`mesna-ifosfamide-schedule`:** confirm the percentages on one generic mesna injection label.
- **`hdmtx-leucovorin-rescue`:** confirm the table on a second leucovorin label and on the
  levoleucovorin label (half the dose) before adding levoleucovorin.
- **`capecitabine-tablet-dose`:** confirm one generic capecitabine label carries the same
  rounding sentence.
- **`gcsf-timing-check`:** read one filgrastim and one pegfilgrastim biosimilar label before
  saying biosimilars carry the same timing.
- **`desensitization-12-step`:** Castells 2008 itself was not opened; the table comes from the
  2022 open-access review. Confirm the first-step rate (2.5 versus 2 mL/h) against the original.
- **`ugt1a1-irinotecan-label`:** the API lists UGT1A1-irinotecan as a level-A pair but no CPIC
  irinotecan guideline; confirm the pair's source before citing CPIC for it.
- **`tpmt-nudt15-thiopurine-dose`:** all 35 mercaptopurine rows were read; the azathioprine and
  thioguanine tables were not. Snapshot all three drugs.
- **`calvert-carboplatin` backfill:** the FDA document behind the 125 mL/min cap was not opened;
  the carboplatin label read does not carry it.
- **`ids-accountability-reconcile`:** no primary source defines the compliance formula. If the
  house rule needs one, read NCI's oral drug accountability record instructions and ICH E6(R3)
  before building; otherwise ship it as arithmetic on 312.62(a) records.
- **`radioactive-decay`:** half-lives for Ga-67, Xe-133, Sm-153, Sr-89, Y-90, Cu-64, Zr-89 and
  Sr-85 were not read in full (label searches failed or returned nothing; the Cu-64 sentence was
  cut off in the extracted text). Add each only from its label.
- **`patient-release-rg839`:** confirm that Revision 1 (April 2020) is still the current
  revision, and whether NUREG-1556 Vol. 9 (which 35.75's footnote names) carries the same
  tables.
- **`nrc-medical-event-screen`:** paragraph (a)(2) (permanent implants) is out of scope; confirm
  that stays true for the nuclear pharmacy reader.
- **`pediatric-administered-activity`:** read the 2024 table; confirm SNMMI's terms for
  reproducing the per-kg values (facts, but the table is © SNMMI).
- **`radiation-distance-shielding`:** attenuation tables were read for Tc-99m only.
- **Totect and NHS dose banding:** not readable on October 10, 2026; both sit under Rejected.

## Sources

- FDA labels on DailyMed (set IDs in the Research record), read October 10, 2026.
- 10 CFR 20.1201, 20.1208, 20.1906; 10 CFR 35.60, 35.63, 35.67, 35.75, 35.92, 35.204, 35.3045,
  35.3047, 35.3204; 10 CFR 71.47, 71.87 (eCFR, current).
- 49 CFR 172.403, 173.403, 173.441, 173.443 (eCFR, current).
- 21 CFR 56.104, 56.108; 21 CFR 312.30, 312.32, 312.33, 312.40, 312.57, 312.59, 312.62, 312.64,
  312.310 (eCFR, current); 91 FR 59988 (September 22, 2026).
- NRC Regulatory Guide 8.39, Revision 1, "Release of Patients Administered Radioactive
  Material," April 2020 (ML19232A081).
- CPIC database and guidelines, `api.cpicpgx.org`, CC0 1.0.
- NCI CTEP, Common Terminology Criteria for Adverse Events page; CTCAE v5.0 and v6.0 Quick
  Reference PDFs.
- Griggs JJ, et al. J Clin Oncol 2021;39:2037-2048 (abstract).
- Chatelut E, et al. J Natl Cancer Inst 1995;87:573-580 (abstract).
- Kinoshita A, et al. Br J Cancer 2006;94:1267-1271 (PMC2361403), for the Chatelut formula as
  applied.
- Tsao, Young, Otani, Castells. Clin Rev Allergy Immunol 2022;62:432-448 (PMC9156473), giving
  the protocol of Castells MC, et al. J Allergy Clin Immunol 2008;122:574-580.
- Treves ST, et al. J Nucl Med Technol 2025;53:193-197 (abstract).
- Hryniuk W, Bush H. J Clin Oncol 1984;2:1281-1288 (not read).

## Tests

- `chemo-dose-verify`: 75 mg/m² at 1.90 m² → 142.5 mg; an order of 150 mg is +5.3%; a typed
  2.0 m² cap changes nothing at 1.90 and is labeled institutional at 2.3.
- `chatelut-carboplatin`: male and female with the same inputs differ by the 0.314 factor on the
  second term only; creatinine in mg/dL converts before use; blank creatinine refuses.
- `relative-dose-intensity`: full doses one week late on a 3-week cycle; 80% doses on time;
  both together.
- `cumulative-dose-limit`: doxorubicin 450 mg/m² reports the 5 to 8% band and 82% of 550;
  idarubicin compares with 90, not 150; daunorubicin in a 1-year-old uses 10 mg/kg; two agents
  are never summed without reader factors.
- `dexrazoxane-ratio-dose`: 50 mg/m² → 500 mg/m²; creatinine clearance 39 → 250; cumulative 240
  flags the indication.
- `mesna-ifosfamide-schedule`: 1.2 g/m² reproduces 240 × 3 and 240, 480, 480 mg/m² with clock
  times at +4 and +8, or +2 and +6 hours; 2.5 g/m² on the oral plan prints the "not established"
  sentence.
- `hdmtx-leucovorin-rescue`: 50 µmol/L at 24 h → 150 mg every 3 hours; 20 µmol/L at 24 h
  matches no row and returns both neighbors; 0.3 µmol/L at 72 h alone is not yet "delayed late"
  (needs the 96-hour level); a doubled creatinine at 24 h alone triggers the third row; a level
  at 36 h is reported as between time points with the 24-hour and 48-hour thresholds; 4.5444
  mg/L converts to 10 µmol/L.
- `glucarpidase-dose`: 70 kg → 3,500 units (4 vials); leucovorin 90 minutes before fails the
  window.
- `it-methotrexate-age-dose`: 11 months → 6 mg; exactly 1, 2, 3 and 9 years land in the upper band.
- `rasburicase-dose`: 72 kg → 14.4 mg; G6PD deficient returns no dose; day 6 is refused.
- `gcsf-timing-check`: pegfilgrastim 23 hours after chemotherapy fails; a 14-day cycle with
  pegfilgrastim on day 2 flags the next cycle at 13 days; a 44 kg child → 4 mg; a 44 kg adult →
  6 mg; a 9 kg child → 0.9 mg; a 20.5 kg child returns both neighboring rows.
- `esa-chemo-dose-adjust`: hemoglobin 10.0 does not meet "less than 10"; a 1.2 g/dL rise in 2
  weeks cuts epoetin 25% and darbepoetin 40%; the every-3-week darbepoetin schedule never
  increases.
- `chemo-organ-label-dose`: bilirubin exactly 3.0 versus 3.1 for epirubicin and for doxorubicin
  (reduce by 50% versus by 75%, never "give 75%"); paclitaxel 3-hour at 1.25 × versus 1.26 ×;
  pemetrexed at 44 returns "no recommended dose"; bleomycin at exactly 40 mL/min returns both
  rows; a superseded label row renders no dose for that drug only.
- `capecitabine-tablet-dose`: 1,250 mg/m² × 1.80 = 2,250 mg → 2,250 (a multiple of 150) as 3 × 500
  + 5 × 150; with creatinine clearance 40 → 1,687.5 → 1,650 = 3 × 500 + 1 × 150; cycle count is
  28 doses; 1,725 mg (a tie) shows 1,650 and 1,800.
- `desensitization-12-step`: 600 mg in 250 mL bags reproduces every row of the published table,
  4.725 mg after step 8, solution 3 at 2.3811 mg/mL, and 339.375 minutes.
- `dpyd-fluoropyrimidine-dose`: scores 0, 0.5, 1, 1.5, 2 return the five API rows with their
  strengths; an unknown variant returns indeterminate, never normal.
- `tpmt-nudt15-thiopurine-dose`: intermediate and intermediate → 20 to 50%; one gene with no
  result does not default to normal.
- `ugt1a1-irinotecan-label`: *6/*28 returns the label sentence; *1/*28 returns "no label
  statement," never "normal."
- `ind-safety-report-clock`: 7 calendar days counts from receipt and 15 from determination, so
  the two start on different dates; day 15 on a Sunday stays on Sunday (calendar days).
- `emergency-ind-clock`: 15 working days across Thanksgiving; the IRB date is counted from the
  use, not the authorization.
- `ind-annual-report-due`: receipt January 2 → effective February 1; an FDA "may begin" date
  earlier than day 30 moves the anniversary.
- `trial-record-retention`: no approval → two years from the FDA notification date, not from the
  last subject visit.
- `ids-accountability-reconcile`: 60 dispensed, 4 returned, 28 days at 2 per day → 100%; a 3-day
  hold changes the denominator; more returned than dispensed is an error, not a negative.
- `radioactive-decay`: Tc-99m after 6.02 h is 50%; F-18 after 109.8 min is 50%; back-decay to a
  precalibration time; 1 mCi = 37 MBq; Lu-177 passes the 120-day test and a typed 271-day
  half-life does not.
- `radiopharm-dispense-volume`: a draw 2 hours before administration needs 2^(2 ÷ 6.02) = 1.259
  times the prescribed Tc-99m activity; measured 21% over is refused and 20% is allowed.
- `generator-breakthrough-check`: 0.05 µCi/mCi at elution reaches 0.15 after about 10.5 hours
  (log₂ 3 ÷ (1 ÷ 6.02 − 1 ÷ 66)); the 12-hour label limit binds when the ratio starts lower;
  Sr-82 at 0.015 passes the rule and fails the label.
- `patient-release-rg839`: I-131 33 mCi releasable and 34 not on the default table; 55 mCi
  hyperthyroid with E₁ 0.75 and E₂ 0.25 → 0.486 rem; 200 mCi post-thyroidectomy with the same
  factors → 0.453 rem; a blank occupancy factor gives no result; Tc-99m uses occupancy 1.0.
- `nuc-med-breastfeeding-interruption`: I-131 sodium iodide at any therapeutic activity →
  complete cessation; Tc-99m MAA 4 mCi is above the 1.3 mCi instruction line and below the 6 mCi
  record line; F-18 FDG returns 4 hours with no threshold test.
- `nrc-medical-event-screen`: 25% over with a 3 rem difference is not an event; 25% over with
  6 rem is; a wrong-route dose of 6 rem is an event at any percent; another organ at 60 rem above
  an expected 200 rem meets the 50 rem arm of test (iii) but not the 50% arm, so no event, and at
  60 rem above an expected 100 rem meets both; patient intervention with no permanent damage is
  not reportable and with it is; discovery at 11 pm makes the call due the next
  calendar day.
- `rad-package-label-category`: index 0.8 with 60 mrem/h surface → YELLOW-III; 0.04 mrem/h at
  1 m → index 0; 0.41 → 0.5; index 12 → YELLOW-III with the exclusive-use line.
- `rad-package-receipt-check`: received Friday 4:30 pm with hours ending 5 pm → due 7:30 pm;
  received Saturday → Monday opening + 3 hours; 7,200 dpm on 300 cm² at 0.10 efficiency is
  240 dpm/cm² and is at the limit, not over.
- `sealed-source-leak-test`: 1,110 dpm is 0.0005 µCi (pass); 11,100 dpm is 0.005 µCi (leaking:
  "or more"); a 99 µCi beta-gamma source is exempt.
- `pediatric-administered-activity`: a weight below the minimum-activity crossover returns the
  minimum and says so; same for the maximum.
- `radiation-distance-shielding`: doubling distance quarters the rate; 0.023 cm of lead halves
  Tc-99m.
- `occupational-dose-limit-check`: 2.5 rem by June projects 5 rem at year end; embryo-fetus
  0.5 rem is over the pregnancy, not the calendar year.

## Build status

Not started. Specified October 10, 2026.
