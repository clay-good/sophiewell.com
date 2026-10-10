# spec-v1633 — Conversions, switches, titrations and tapers

**Status:** Proposed, October 10, 2026. Specs only; nothing here is built. 23 new tools, none gated as a whole. One part of one tool is build-gated (the intensity category of `statin-ldl-reduction`), and tools 19 and 20 rest on abstracts until the full papers are read.
**Charter:** [spec-v1627](spec-v1627.md). **Machinery:** [spec-v1628](spec-v1628.md). **Ledger:** [scope-pharmacy-practice.md](scope-pharmacy-practice.md).

A pharmacist moving a patient from one drug, route, formulation or dose to another opens the
label, finds the conversion paragraph, and does arithmetic that the label already defines: an INR
threshold, a percentage, a banded table, a week-by-week schedule. This wave gives them 23 tools
that do exactly what the label or the paper says for the inputs entered, name the source, and
refuse to run a one-way table backward. Every number below was read on October 10, 2026 on the
page cited in the Research record, or is listed under Verify at build.

**Label editions.** How a label edition is pinned, dated and watched is specified once in
[spec-v1628 §1](spec-v1628.md) and not repeated here: the application holder's DailyMed set id
plus version and published date, a weekly watch, and fail closed when the edition changes. The
Sources table gives the set id, version and published date of every label read. Label links use
`https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=<setid>`.

## Gap finder

**Method.** (1) `catalog.tsv` was searched for about 110 terms (equiv, conver, switch, taper,
titrat, transition, bridg, patch, each drug and class, IU, elemental, calendar, LEDD, parkinson,
target dose, statin, ldl, transplant). (2) The lib source of every near neighbor was read:
`lib/periop-bridging-v899.js`, `lib/dose-calendar-v1512.js`, `lib/rheum-v148.js`
(`opioid-conversion`), `lib/pk-v166.js` (`chlorpromazine-equivalents`), `lib/clinical-v7.js`
(`calcium-replacement`), `lib/unit-convert.js`. (3) About 60 current labels were pulled from
DailyMed and the Dosage and Administration conversion text of each was read. (4) The open primary
papers were read (PAUSE, CDC 2022, ASAM 2025, Leucht 2016, Jost 2023, the 2022 AHA/ACC/HFSA
heart-failure guideline, the FDA 2019 unit guidance, and the Kirchheiner 2009 and Hayasaka 2015
abstracts).

**Live in this domain.** `opioid-conversion`, `opioid-mme`, `steroid-equiv`, `benzo-equiv`,
`benzodiazepine-equivalence`, `chlorpromazine-equivalents`, `periop-bridging`, `anticoag-reversal`,
`warfarin-init-5mg`, `warfarin-init-10mg`, `heparin-nomogram`, `vte-prophylaxis-dose`,
`dose-calendar`, `iron-ganzoni`, `elemental-iron-ingested`, `calcium-replacement`,
`electrolyte-replacement`, `potassium-deficit`, `insulin-correction`, `carb-insulin-bolus`,
`insulin-drip`, `pca-pump`, `unit-converter`, `unit-converter-v4`, `conc-percent`,
`leprosy-reaction-prednisolone`, `time-to-dose`.

| Proposed | Live neighbor | Difference |
|---|---|---|
| `anticoag-switch-clock` | `periop-bridging`, `anticoag-reversal` | Neither covers drug-to-drug switching. No live tool holds an INR threshold or a "start at the next scheduled dose" rule. |
| `doac-periprocedural-timing` | `periop-bridging` | The live tool decides interrupt/bridge and its own scope note says "it does not set an interruption schedule." This one computes the last-dose and restart dates. |
| `fentanyl-patch-initial-dose` | `opioid-conversion` | The live tool uses one linear factor (2.4 oral morphine equivalents per mcg/h) in both directions from a textbook. The label gives a banded, one-way table. See Backfills. |
| `methadone-label-conversion` | `opioid-conversion` (excludes methadone on purpose) | The label's banded percentage table, to methadone only, shown as a range. |
| `er-opioid-label-start` | `opioid-conversion`, `opioid-mme` | Product-specific label procedures (Hysingla ER, Butrans, Belbuca) that are explicitly not equianalgesic. |
| `buprenorphine-oud-product-switch` | none (`cows`, `sows` are scales) | Zubsolv/Suboxone strength correspondence, Brixadi and Sublocade dose from the transmucosal dose. |
| `taper-calendar` | `leprosy-reaction-prednisolone` (one fixed WHO taper), `benzodiazepine-equivalence` (converts, no schedule) | A dated reduction schedule from a start dose, a percentage and an interval, with source-backed presets. The program's single taper tool. |
| `basal-insulin-switch` | `insulin-correction`, `carb-insulin-bolus`, `insulin-drip` | None handles a basal-to-basal change. |
| `esa-conversion` | none | No live tool names epoetin, darbepoetin or Mircera. |
| `iv-iron-course` | `iron-ganzoni` (deficit only), `elemental-iron-ingested` (overdose) | Turns a product and weight into the label's course: doses, spacing, total mg, mL. Adds the INFeD label formula, which is not Ganzoni. |
| `lamotrigine-titration-calendar` | `dose-calendar` | `dose-calendar` spaces identical doses by weeks. This one changes the dose by week and branches on co-medication. |
| `label-titration-calendar` | `dose-calendar` | Same reason; step-up schedules with label presets. |
| `aed-formulation-switch` | `corrected-phenytoin` (a level correction) | Dose conversion between formulations and routes. |
| `transplant-formulation-switch` | none | No live tool names tacrolimus, cyclosporine or mycophenolate formulations. |
| `label-formulation-switch` | `digoxin` (maintenance dose and level) | IV-to-tablet digoxin, carvedilol IR to CR, methylphenidate IR to Concerta, bumetanide/furosemide. |
| `levothyroxine-start-dose` | `zulewski`, `myxedema-coma` (diagnostic scores) | Weight- and age-band starting dose and titration step. |
| `lai-antipsychotic-start` | `chlorpromazine-equivalents` | Oral dose to labeled long-acting injectable dose; product tables, not equivalence factors. |
| `vitamin-iu-converter` | `unit-converter`, `unit-converter-v4`, `vitamin-d-level` (level interpretation), `vitamin-a-dose-child` (a WHO dose) | `lib/unit-convert.js` has no IU or RAE factor. |
| `ppi-omeprazole-equivalent` | none | No live tool names a proton-pump inhibitor. |
| `antidepressant-fluoxetine-equivalent` | none | No live tool converts antidepressant doses. |
| `statin-ldl-reduction` | `ldl-calc`, `ascvd`, `prevent` | None maps a statin and dose to an expected percent LDL-C change. |
| `levodopa-equivalent-dose` | `hoehn-yahr`, `schwab-england` (stages), `simpson-angus` (a scale) | No live tool computes a levodopa equivalent dose. |
| `hf-gdmt-target-percent` | `hf-stages-abcd`, `hf-ef-classification`, `nyha-class`, `maggic` | Those classify or predict. None compares a dose with the guideline's target dose. |

## Tools

Group is **Q** unless noted. Every tool carries the standing line "This reports what the label
(or paper) gives for these inputs. It does not prescribe."

### 1. `anticoag-switch-clock` — When to Start the Next Anticoagulant

**Input.** From-drug and to-drug (warfarin, apixaban, rivaroxaban, dabigatran, edoxaban, LMWH or
other intermittent parenteral, IV unfractionated heparin); adult or pediatric; current INR (when
warfarin is the from-drug); CrCl (dabigatran; pediatric dabigatran uses eGFR); current edoxaban
dose (edoxaban to warfarin); date-time of the last dose or the next scheduled dose of the
from-drug.
**Compute.** The row of the *to-drug's* label (or the from-drug's label when leaving a DOAC):

| Switch | Rule as the label states it | Label section |
|---|---|---|
| Warfarin → apixaban | start when INR is below 2.0 | Eliquis 2.5 |
| Warfarin → rivaroxaban | start as soon as INR is below 3.0 (adults), below 2.5 (pediatric) | Xarelto 2.3 |
| Warfarin → dabigatran | start when INR is below 2.0 | Pradaxa 2.6 |
| Warfarin → edoxaban | start when INR is ≤ 2.5 | Savaysa 2.4 |
| Apixaban → warfarin | "one approach": stop apixaban; begin a parenteral anticoagulant and warfarin at the time of the next apixaban dose; stop the parenteral agent when INR reaches an acceptable range | Eliquis 2.5 |
| Rivaroxaban → warfarin (adult) | the same "one approach"; the label says no trial data guide this switch | Xarelto 2.3 |
| Rivaroxaban → warfarin (pediatric) | continue rivaroxaban at least 2 days after the first warfarin dose; after 2 days, INR before the next rivaroxaban dose; co-administer until INR ≥ 2.0. Once rivaroxaban is stopped, INR is reliable 24 hours after the last dose | Xarelto 2.3 |
| Dabigatran → warfarin (adult) | start warfarin 3 days before stopping dabigatran at CrCl ≥ 50 mL/min; 2 days at 30–50; 1 day at 15–30; no recommendation below 15. INR reflects warfarin only after dabigatran has been stopped at least 2 days | Pradaxa 2.6 |
| Dabigatran → warfarin (pediatric) | eGFR ≥ 50 mL/min/1.73 m²: start warfarin 3 days before stopping; below 50, not studied | Pradaxa 2.6 |
| Edoxaban → warfarin, oral option | halve the dose (60 → 30 mg, 30 → 15 mg), start warfarin, INR at least weekly just before the edoxaban dose, stop edoxaban at stable INR ≥ 2.0 | Savaysa 2.4 |
| Edoxaban → warfarin, parenteral option | stop edoxaban; parenteral agent plus warfarin at the next scheduled edoxaban dose; stop parenteral at stable INR ≥ 2.0 | Savaysa 2.4 |
| DOAC → other non-warfarin anticoagulant | start the new drug at the time of the next scheduled dose of the old one (apixaban, rivaroxaban, edoxaban) | each label |
| Dabigatran → parenteral | adults: wait 12 hours after the last dose (CrCl ≥ 30), 24 hours (CrCl < 30); pediatric: 12 hours | Pradaxa 2.7 |
| Non-warfarin anticoagulant → apixaban | at the usual time of the next dose of the old drug | Eliquis 2.5 |
| LMWH or other non-warfarin → rivaroxaban | 0 to 2 hours before the next scheduled dose of the old drug | Xarelto 2.3 |
| IV heparin → rivaroxaban | stop the infusion and start at the same time | Xarelto 2.3 |
| Parenteral → dabigatran | 0 to 2 hours before the next parenteral dose was due, or at the time a continuous infusion is stopped | Pradaxa 2.7 |
| LMWH → edoxaban | at the next scheduled LMWH time | Savaysa 2.4 |
| IV heparin → edoxaban | stop the infusion, start edoxaban 4 hours later | Savaysa 2.4 |
| Other oral anticoagulant → edoxaban | at the next scheduled dose of the old drug | Savaysa 2.4 |

**Output.** One of: "start now", a date-time (or a 2-hour window) for the first dose, "INR 2.7 is
not yet below 2.0: not yet", or the overlap plan with its stop condition; the label and section.
**Scope.** Adult rows and the pediatric rows the labels give. The four INR thresholds differ by
drug; the tool never generalizes one to another. Apixaban → dabigatran and similar DOAC-to-DOAC
pairs use the to-drug's "other anticoagulant" row; where the two labels' wording differs (next
dose time versus 0 to 2 hours before), both are shown. Dose selection for the new drug is
`doac-dose-check` in [spec-v1632](spec-v1632.md).

### 2. `doac-periprocedural-timing` — DOAC Last Dose Before and First Dose After a Procedure

**Input.** DOAC, dosing frequency, CrCl, procedure date and time, bleeding risk of the procedure
(low or high; reader's classification), and which source to apply (label, PAUSE, or both).
**Compute.**
- *Label statements.* Apixaban (2.4): stop at least 48 hours before a procedure with moderate or
  high bleeding risk, at least 24 hours before a low-risk one. Rivaroxaban (2.4): at least 24
  hours. Edoxaban (2.5): at least 24 hours. Dabigatran, adult (2.8): 1 to 2 days at CrCl ≥ 50
  mL/min, 3 to 5 days at CrCl < 50; "consider longer times" for major surgery, spinal puncture or
  a spinal or epidural catheter or port. Dabigatran, pediatric: 24 hours at eGFR > 80 mL/min/1.73
  m², 2 days at eGFR 50–80.
- *PAUSE protocol* (Douketis 2019; apixaban, rivaroxaban, dabigatran in atrial fibrillation): omit
  the DOAC for 1 day before a low-bleeding-risk procedure and 2 days before a high-bleeding-risk
  procedure, plus the day of the procedure; dabigatran with CrCl < 50 mL/min: 2 days (low) and 4
  days (high). Resume 1 day (about 24 hours) after a low-risk and 2 to 3 days (48–72 hours) after a
  high-risk procedure, provided hemostasis is achieved.
**Output.** The calendar: last dose date, the omitted days, the procedure day, the earliest
resumption date under each source, side by side when they differ.
**Scope.** PAUSE did not study edoxaban; the tool shows only the label line for it. PAUSE excluded
CrCl below 25 mL/min (apixaban) and below 30 mL/min (dabigatran, rivaroxaban); below those values
the tool shows the label line and says the protocol was not studied there. No bridging (the live
`periop-bridging` owns that question; link to it). Group G.

### 3. `fentanyl-patch-initial-dose` — Fentanyl Patch Starting Dose From a Prior Opioid (Label, One Way)

**Input.** Current opioid and 24-hour dose, or a 24-hour oral morphine dose; confirmation of
opioid tolerance (the label's definition: for a week or longer at least 60 mg oral morphine, 30 mg
oral oxycodone, 8 mg oral hydromorphone, 25 mg oral oxymorphone, 60 mg oral hydrocodone, or 25
mcg/h transdermal fentanyl daily, or an equianalgesic dose of another opioid).
**Compute.** Label Table 1, daily mg to patch:

| Current drug | 25 mcg/h | 50 | 75 | 100 |
|---|---|---|---|---|
| Oral morphine | 60–134 | 135–224 | 225–314 | 315–404 |
| IM/IV morphine | 10–22 | 23–37 | 38–52 | 53–67 |
| Oral oxycodone | 30–67 | 67.5–112 | 112.5–157 | 157.5–202 |
| Oral codeine | 150–447 | — | — | — |
| Oral hydromorphone | 8–17 | 17.1–28 | 28.1–39 | 39.1–51 |
| IV hydromorphone | 1.5–3.4 | 3.5–5.6 | 5.7–7.9 | 8–10 |
| IM meperidine | 75–165 | 166–278 | 279–390 | 391–503 |
| Oral methadone | 20–44 | 45–74 | 75–104 | 105–134 |

Label Table 2 extends oral morphine in 90-mg bands: 405–494 → 125 mcg/h, 495–584 → 150, 585–674 →
175, 675–764 → 200, 765–854 → 225, 855–944 → 250, 945–1,034 → 275, 1,035–1,124 → 300.
**Output.** The patch strength, the band matched, and the label's titration interval (no sooner
than 3 days after the first dose, then every 6 days). The label notes that 37.5 and 62.5 mcg/h
systems exist as intermediate strengths and were not used in the trials.
**One way.** The label says these "are not tables of equianalgesic doses" and "cannot be used to
convert from fentanyl transdermal system to another opioid" because the result overestimates the
new opioid and "may result in fatal overdosage." The tool has no reverse mode and says why. Below
60 mg/day oral morphine it answers "not opioid tolerant by the label's definition; the label does
not give a starting patch." A value that falls in a printed gap (oral oxycodone 67.2 mg) returns
the two neighboring bands and says the label does not cover the value. Group G.

### 4. `methadone-label-conversion` — Starting Methadone Dose From Another Oral Opioid (Label, One Way)

**Input.** Total daily oral morphine-equivalent dose (reader computes it; link to `opioid-mme`),
intended doses per day, tablet strength.
**Compute.** Label Table 1: < 100 mg → 20% to 30%; 100–300 mg → 10% to 20%; 300–600 mg → 8% to
12%; 600–1,000 mg → 5% to 10%; > 1,000 mg → < 5%. Daily methadone = morphine equivalent × the
band's percentages, divided by doses per day, **rounded down** to the tablet strength (label rule).
Parenteral methadone to oral: 1:2 mg (label: 5 mg parenteral to 10 mg oral).
**Output.** A range (low and high end of the band), never a single figure; the per-dose amount
after rounding down. Worked label example reproduced as a test: 100 mg morphine × 15% = 15 mg/day;
÷ 2 = 7.5 mg; rounded down to 5 mg every 12 hours.
**One way.** Label: "The table cannot be used to convert from methadone hydrochloride tablets to
another opioid. Doing so will result in an overestimation of the dose of the new opioid and may
result in fatal overdose."
**Note.** The band edges overlap as printed (100, 300 and 600 each appear in two rows). The tool
shows both rows at an edge value rather than pick one. The live `opioid-conversion` excludes
methadone by design; this tool does not reverse that decision, it reports the label's one-way
range. Group G.

### 5. `er-opioid-label-start` — Extended-Release Opioid Starting Dose per Its Own Label

**Input.** Product (Hysingla ER, Butrans, Belbuca) and the prior opioid regimen.
**Compute.**
- *Hysingla ER.* Daily hydrocodone = Σ (daily mg of each prior oral opioid × factor), factors:
  codeine 0.15, hydromorphone 4, methadone 1.5, morphine 0.5, oxycodone 1, oxymorphone 2,
  tramadol 0.1; then **reduce by 25%**; round down to a tablet strength; if under 20 mg, 20 mg.
- *Butrans* (by prior oral morphine equivalents per day): < 30 mg → 5 mcg/h; 30–80 mg → taper to no
  more than 30 mg over up to 7 days, then 10 mcg/h; > 80 mg → "20 mcg/hour may not provide adequate
  analgesia"; consider an alternate analgesic. Maximum 20 mcg/h. Minimum titration interval 72 hours.
- *Belbuca* (by prior oral morphine sulfate equivalents before taper; taper to ≤ 30 mg first):
  < 30 mg → 75 mcg once daily or every 12 hours; 30–89 mg → 150 mcg every 12 hours; 90–160 mg →
  300 mcg every 12 hours; > 160 mg → consider an alternate analgesic. Steps of 150 mcg every 12
  hours no more often than every 4 days; maximum 900 mcg every 12 hours.
**Output.** The label's starting dose, the taper-first requirement where it applies, and the cap.
**One way.** Each label says its table is not equianalgesic. No reverse mode. Group G.

### 6. `buprenorphine-oud-product-switch` — Buprenorphine Product Switch for Opioid Use Disorder

**Input.** Current product and daily dose; target product.
**Compute.**
- *Suboxone tablets ↔ Zubsolv* (Zubsolv label 2.9): 2/0.5 mg ↔ 1.4/0.36 mg; 4/1 ↔ 2.9/0.71; 8/2 ↔
  5.7/1.4; 12/3 ↔ 8.6/2.1; 16/4 ↔ 11.4/2.9.
- *Sublingual buprenorphine → Brixadi* (label Table 1): ≤ 6 mg/day → 8 mg weekly (no monthly
  dose); 8–10 mg → 16 mg weekly or 64 mg monthly; 12–16 mg → 24 mg weekly or 96 mg monthly; 18–24
  mg → 32 mg weekly or 128 mg monthly. Weekly ↔ monthly (label Table 2): 16 ↔ 64, 24 ↔ 96, 32 ↔
  128. Weekly doses are 7 days apart and monthly doses 28 days apart.
- *Transmucosal → Sublocade:* on 8–24 mg/day, 300 mg, then a second 300 mg, then 100 mg monthly;
  the second injection may be given as early as 1 week and up to 1 month after the first; patients
  controlled long term on 8–18 mg/day may receive 100 mg as the second dose; maintenance doses at
  least 26 days apart.
**Output.** The corresponding product strength or injection dose, the dates for the next
injections, and the label line.
**Scope.** A daily dose the table does not list (for example 7 mg) returns "not in the label's
table" and shows the neighboring rows. Bunavail is discontinued and not included. Windows and
missed doses for the injections belong to [spec-v1639](spec-v1639.md).

### 7. `taper-calendar` — Taper Schedule Calendar

The program's single taper tool; [spec-v1634](spec-v1634.md) points here for opioid tapers.

**Input.** Drug class (opioid, benzodiazepine, methadone for opioid use disorder, other), starting
daily dose and unit, how long the patient has taken the drug (opioids: 1 year or more, or less),
reduction per step, whether each step is a percent of the **original** dose, a percent of the
**remaining** dose, or a fixed amount (reader's choice, printed on the output), interval between
steps, start date, available strengths or the smallest available dose (to round down to a
dispensable dose), an optional stop target, and any number of pause rows (a date and a length).
**Compute.** dose(n) = previous × (1 − r), or start × (1 − n·r), or previous − fixed; dates = start
+ n × interval, shifted by any pause; rounding to the nearest strength at or below. A pause row
holds the dose for its length and moves every later date. Totals: number of steps, end date, units
to dispense per step. For opioids, the reader may enter a conversion factor so each step is also
shown in MME (link to `opioid-mme`).
**Presets (each shown as "a published range", never as the recommendation):**

| Class | Published range | Source |
|---|---|---|
| Opioid, on therapy 1 year or more | "tapers of approximately 10% per month or slower are likely to be better tolerated" | CDC 2022, Recommendation 5 |
| Opioid, shorter use (weeks to months) | 10% of the original dose per week or slower until about 30% of the original dose remains, then about 10% of the remaining dose per week | CDC 2022, Recommendation 5 |
| Opioid, physically dependent | "no greater than 10% to 25% of the total daily dose", every 2 to 4 weeks | FDA class labeling (read in the Butrans and methadone labels) |
| Benzodiazepine | 5% to 10% every 2–4 weeks at the start; typically not more than 25% every 2 weeks; later steps 5% to 10% every 6–8 weeks, or slower | ASAM joint guideline 2025 |
| Methadone, medically supervised withdrawal | reductions generally under 10% of the maintenance dose, 10 to 14 days apart | methadone label |

**Output.** A dated table (step, date, daily dose, change, MME if asked), printable; a line when a
chosen pace exceeds the selected source's range ("25% every week is faster than the ASAM ceiling
of 25% every 2 weeks"); for opioids, the CDC sentences that the rate "should be individualized",
that tapers may have to be paused and restarted, and its closing rule: once the smallest available
dose is reached, the interval between doses can be extended, and opioids can be stopped when taken
less often than once a day. The schedule ends at the smallest available dose with that rule
printed; it does not invent sub-strength doses.
**Scope.** Arithmetic only. No corticosteroid preset: no primary source gives a general steroid
taper rate (see Rejected). The reader can still enter one. The tool never chooses the pace.

### 8. `basal-insulin-switch` — Basal Insulin Switch Starting Dose (Labels)

**Input.** Current basal insulin, total daily units, once or twice daily; target product; adult or
pediatric (Tresiba).
**Compute.** Section 2.4 of each label:

| To | From | Starting dose |
|---|---|---|
| Lantus | Toujeo once daily | 80% |
| Lantus | NPH once daily | same units |
| Lantus | NPH twice daily | 80% of total NPH |
| Basaglar | another glargine 100 units/mL | same units |
| Basaglar | glargine 300 units/mL once daily | 80% |
| Basaglar | NPH twice daily | 80% of total NPH |
| Toujeo | once-daily long or intermediate insulin | same units (label: expect a higher Toujeo dose will be needed coming from Lantus) |
| Toujeo | twice-daily NPH or detemir | 80% of the total |
| Tresiba, adult | long or intermediate insulin | same total daily units |
| Tresiba, pediatric, 1 year and older | long or intermediate insulin | 80% of total |

Fractions are rounded down to a whole unit. The labels state no rounding rule; rounding down is
the tool's convention and the output says so.
**Output.** Starting units once daily, the percentage applied, the label section.
**Scope.** A pair no label addresses (for example Tresiba → Lantus, detemir → Lantus) returns "the
target label gives no figure for this switch." Insulin-naive starts are label numbers too and may
be a second mode (Lantus and Basaglar: type 1 about one-third of the total daily requirement,
type 2 0.2 units/kg or up to 10 units; Toujeo type 2 0.2 units/kg; Tresiba type 2 10 units).
U-500 is out (see Rejected).

### 9. `esa-conversion` — Epoetin to Darbepoetin or Mircera Starting Dose (Labels, One Way)

**Input.** Current ESA (epoetin alfa units/week or darbepoetin mcg/week), dosing frequency, adult
or pediatric, target (Aranesp or Mircera) and target interval.
**Compute.**
- *Aranesp Table 1* (CKD on dialysis; mcg/week, adult / pediatric): < 1,500 units/week → 6.25 /
  insufficient data; 1,500–2,499 → 6.25 / 6.25; 2,500–4,999 → 12.5 / 10; 5,000–10,999 → 25 / 20;
  11,000–17,999 → 40 / 40; 18,000–33,999 → 60 / 60; 34,000–89,999 → 100 / 100; ≥ 90,000 → 200 /
  200. Frequency: weekly if epoetin was 2–3 times weekly; every 2 weeks if epoetin was weekly.
  Keep the route.
- *Mircera Table 1* (adult): epoetin < 8,000 units/week or darbepoetin < 40 mcg/week → 120 mcg
  monthly or 60 mcg every 2 weeks; 8,000–16,000 or 40–80 → 200 or 100; > 16,000 or > 80 → 360 or 180.
**Output.** Starting dose and interval, the row matched. For Aranesp every 2 weeks, the table's
mcg/week figure is shown with the label's interval; the label text read does not say how the
weekly figure scales, and the tool says so instead of doubling it (Verify at build).
**One way.** Neither label gives a reverse table. For CKD not on dialysis the Aranesp label says
its table "does not accurately estimate the once monthly dose."
**Scope.** Mircera pediatric Table 2 (ages 3 months to 17 years, once every 4 weeks, banded by
weekly epoetin or darbepoetin dose) is a branch added after its rows are transcribed at build.
Dose adjustment by hemoglobin in chemotherapy anemia is `esa-chemo-dose-adjust` in
[spec-v1635](spec-v1635.md).

### 10. `iv-iron-course` — IV Iron Course by Product (Labels)

**Input.** Product, weight, indication where the label branches (Venofer: HDD, NDD or PDD CKD,
adult or pediatric; Injectafer: iron deficiency anemia or heart failure with Hb), start date; for
INFeD: sex, height, observed and desired hemoglobin.
**Compute.**
- *Injectafer.* ≥ 50 kg: 750 mg × 2, at least 7 days apart (1,500 mg per course); or, adults,
  15 mg/kg up to 1,000 mg once. < 50 kg: 15 mg/kg × 2, at least 7 days apart. Heart failure
  (Table 1): weight < 70 kg, Hb < 10: 1,000 mg day 1 and 500 mg week 6; Hb 10–14: 1,000 mg day 1;
  Hb > 14 to < 15: 500 mg day 1. Weight ≥ 70 kg, Hb < 10: 1,000 and 1,000; Hb 10–14: 1,000 and 500;
  Hb > 14 to < 15: 500. Maintenance 500 mg at weeks 12, 24, 36 if ferritin < 100 ng/mL or
  100–300 ng/mL with TSAT < 20%. No data at Hb ≥ 15 or beyond 36 weeks.
- *Venofer* (20 mg/mL). HDD: 100 mg per consecutive dialysis session, usual total course 1,000 mg.
  NDD: 200 mg on 5 occasions in 14 days. PDD: 300 mg, 300 mg 14 days later, 400 mg 14 days after
  that. Pediatric maintenance (2 years and older): 0.5 mg/kg, maximum 100 mg, every 2 weeks (HDD)
  or every 4 weeks (NDD/PDD) for 12 weeks; pediatric replacement dosing is not established.
- *Feraheme* (30 mg/mL): 510 mg, then 510 mg 3 to 8 days later.
- *Monoferric* (100 mg/mL): ≥ 50 kg 1,000 mg once; < 50 kg 20 mg/kg actual body weight once.
- *INFeD* (50 mg/mL): dose (mL) = 0.0442 × (desired Hb − observed Hb) × LBW + 0.26 × LBW, with
  LBW = 50 kg (male) or 45.5 kg (female) + 2.3 kg per inch over 5 feet, or actual weight if lower;
  children 5–15 kg use actual weight and normal Hb 12 g/dL; normal Hb 14.8 g/dL above 15 kg.
  Blood-loss mode: mL = blood loss (mL) × hematocrit (as a fraction) ÷ 50 (label example: 500 mL at
  20% → 100 mg → 2 mL). Daily maximum 2 mL; intramuscular daily limits 0.5 mL under 5 kg and 1 mL
  under 10 kg.
**Output.** Each dose in mg and mL, the dates or date windows, the course total.
**Note.** The INFeD formula is the label's own and gives a different number from `iron-ganzoni`;
the tool says which formula it used and links the other. Group G.

### 11. `lamotrigine-titration-calendar` — Lamotrigine Titration Calendar (Label)

**Input.** Formulation (immediate-release or Lamictal XR); indication and age (epilepsy older than
12 years; epilepsy 2 to 12 years with weight; bipolar disorder, adult; XR 13 years and older);
co-medication branch (taking valproate; taking neither valproate nor an inducer; taking
carbamazepine, phenytoin, phenobarbital or primidone without valproate); start date.
**Compute.** Immediate-release, label Tables 1 (epilepsy, older than 12) and 5 (bipolar, adult):

| Weeks | With valproate | Neither | With inducer, no valproate |
|---|---|---|---|
| 1–2 | 25 mg every other day | 25 mg daily | 50 mg daily |
| 3–4 | 25 mg daily | 50 mg daily | 100 mg daily, divided |
| Bipolar week 5 | 50 mg | 100 mg | 200 mg, divided |
| Bipolar week 6 | 100 mg | 200 mg | 300 mg, divided |
| Bipolar week 7 | 100 mg | 200 mg | up to 400 mg, divided |
| Epilepsy week 5 on | + 25 to 50 mg/day every 1–2 weeks | + 50 mg/day every 1–2 weeks | + 100 mg/day every 1–2 weeks |
| Epilepsy usual maintenance | 100–200 mg/day (valproate alone); 100–400 with valproate and inducers | 225–375 mg/day | 300–500 mg/day |

Epilepsy, ages 2 to 12 (Table 2; every dose rounded down to the nearest whole tablet):

| Weeks | With valproate | Neither | With inducer, no valproate |
|---|---|---|---|
| 1–2 | 0.15 mg/kg/day | 0.3 mg/kg/day | 0.6 mg/kg/day |
| 3–4 | 0.3 mg/kg/day | 0.6 mg/kg/day | 1.2 mg/kg/day |
| Week 5 on, added every 1–2 weeks | 0.3 mg/kg/day | 0.6 mg/kg/day | 1.2 mg/kg/day |
| Usual maintenance | 1–5 mg/kg/day, maximum 200 mg/day (1–3 mg/kg/day with valproate alone) | 4.5–7.5 mg/kg/day, maximum 300 | 5–15 mg/kg/day, maximum 400 |

Table 3 (ages 2 to 12 taking valproate, weeks 1–2 then 3–4): 6.7–14 kg, 2 mg every other day then
2 mg daily; 14.1–27 kg, 2 mg daily then 4 mg; 27.1–34 kg, 4 mg then 8 mg; 34.1–40 kg, 5 mg then
10 mg.

Lamictal XR, 13 years and older (XR Table 1, once daily):

| Weeks | With valproate | Neither | With inducer, no valproate |
|---|---|---|---|
| 1–2 | 25 mg every other day | 25 mg | 50 mg |
| 3–4 | 25 mg | 50 mg | 100 mg |
| 5 | 50 mg | 100 mg | 200 mg |
| 6 | 100 mg | 150 mg | 300 mg |
| 7 | 150 mg | 200 mg | 400 mg |
| 8 on | 200–250 mg | 300–400 mg | 400–600 mg |

XR increases at week 8 or later do not exceed 100 mg daily at weekly intervals. Immediate-release
to XR: the initial XR dose matches the total daily immediate-release dose.

Other label rules the tool carries:
- Rifampin and lopinavir/ritonavir follow the inducer column. Estrogen-containing oral
  contraceptives and atazanavir/ritonavir alone do not change the escalation (label 2.1); the
  column follows the other co-medications.
- *After a psychotropic is stopped, bipolar (Table 6).* After valproate, from 100 mg/day: 150 mg
  week 1, 200 mg week 2 and on. After an inducer, from 400 mg/day: 400 mg week 1, 300 mg week 2,
  200 mg week 3 and on. Otherwise maintain the dose.
- *Valproate to lamotrigine monotherapy, epilepsy, 16 and older (Table 4).* Step 1: reach 200
  mg/day per Table 1, valproate unchanged. Step 2: hold 200 mg/day; lower valproate by no more
  than 500 mg/day per week to 500 mg/day, then hold 1 week. Step 3: 300 mg/day for 1 week with
  valproate 250 mg/day. Step 4: add 100 mg/day each week to 500 mg/day; stop valproate.
- *Stopping.* A stepwise reduction over at least 2 weeks (about 50% per week).
**Output.** A dated week-by-week calendar; tablet counts by strength; and the label's restart rule
shown as a check: after more than 5 half-lives off the drug, the label recommends the initial
dosing schedule. The tool shows 5 × the label's mean half-life for the branch (Table 14: valproate
alone 58.8 hours single dose and 70.3 hours multiple dose; no interacting drug 32.8 and 25.4
hours; inducer 14.4 and 12.6 hours; inducer plus valproate 27.2 hours), with the printed ranges,
and does not resume mid-schedule.
**Scope.** One id for all branches. Contraceptive maintenance adjustments (up to 2-fold) and
hepatic reductions are stated on the label and are printed as notes, not computed.

### 12. `label-titration-calendar` — Step-Up Titration Calendar (Label Presets or Your Own Steps)

**Input.** Start date, then either a preset or the reader's own steps (dose, times per day, days).
**Compute.** Dates per step; total tablets per strength for the titration period.
**Presets read on October 10, 2026:**
- Topiramate, epilepsy monotherapy (age 10 and older): weekly, morning/evening 25/25, 50/50,
  75/75, 100/100, 150/150, 200/200 mg.
- Topiramate, migraine prevention (age 12 and older): week 1 none/25, week 2 25/25, week 3 25/50,
  week 4 50/50.
- Varenicline: 0.5 mg once daily days 1–3, 0.5 mg twice daily days 4–7, then 1 mg twice daily
  from day 8 for a total of 12 weeks.
- Apremilast (adult): day 1 10 mg AM; day 2 10/10; day 3 10/20; day 4 20/20; day 5 20/30; day 6
  on 30 mg twice daily (or Otezla XR 75 mg once daily as maintenance).
- Memantine tablets: 5 mg daily, 5 mg twice daily, 5 mg and 10 mg as separate doses, 10 mg twice
  daily; at least 1 week per step.
- Sacubitril/valsartan (adult): 49/51 mg twice daily, doubled after 2 to 4 weeks to 97/103 mg twice
  daily; 36-hour washout after the last ACE-inhibitor dose (computed as a clock time).
**Output.** A printable dated schedule and dispensing counts.
**Scope.** A preset is a label table, pinned to its edition per [spec-v1628 §1](spec-v1628.md);
anything else is the reader's steps. **No GLP-1 presets:** semaglutide, tirzepatide, liraglutide
and dulaglutide escalation and missed-dose rules are owned by `glp1-titration-check` in
[spec-v1632](spec-v1632.md), and this tool links there. The reduced sacubitril/valsartan start by
kidney or liver function is `cardiac-renal-dose-check` in the same spec.

### 13. `aed-formulation-switch` — Antiepileptic Formulation and Route Switch (Labels)

**Input.** Drug, current formulation and total daily dose, target formulation.
**Compute.**
- *Depakote → Depakote ER* (adults and children 10 and older; 8 to 20% higher; label Table 1,
  total daily mg → ER mg): 500–625 → 750; 750–875 → 1,000; 1,000–1,125 → 1,250; 1,250–1,375 →
  1,500; 1,500–1,625 → 1,750; 1,750 → 2,000; 1,875–2,000 → 2,250; 2,125–2,250 → 2,500; 2,375 →
  2,750; 2,500–2,750 → 3,000; 2,875 → 3,250; 3,000–3,125 → 3,500. The label marks 500, 750 and
  1,000 mg with an asterisk: those doses "cannot be directly converted to an 8 to 20% higher"
  ER dose with the strengths available, and it suggests considering the next higher Depakote dose
  first. Above 3,125 mg/day the label says the data are insufficient for a conversion factor.
- *Oral valproate → IV valproate:* the same total daily dose, same frequency.
- *Oral → IV levetiracetam:* equivalent total daily dose and frequency.
- *Carbamazepine tablets → Tegretol-XR:* the same total daily mg, twice daily. *Tablets →
  suspension:* the same mg per day in smaller, more frequent doses.
- *Oral phenytoin → fosphenytoin:* the same total daily dose in phenytoin sodium equivalents (PE);
  the label says no molecular-weight adjustment is needed between fosphenytoin and phenytoin sodium.
- *Phenytoin free acid (Infatabs, suspension) ↔ phenytoin sodium (capsules, injection):* the label
  states about 8% more drug content in the free-acid form. The tool shows the phenytoin-acid
  content of both regimens (sodium mg × 0.92) and the difference; it does not pick the new dose.
**Output.** The target total daily dose (or, for phenytoin, the content comparison), the label line.
**Note.** A Depakote dose that is not a printed row (900 mg) returns "not in the label's table"
with the neighboring rows. An asterisked dose returns the table's ER dose together with the
label's caution. Phenytoin and fosphenytoin loading is `fosphenytoin-load-rate` in
[spec-v1631](spec-v1631.md).

### 14. `transplant-formulation-switch` — Tacrolimus, Cyclosporine and Mycophenolate Formulation Switch (Labels)

**Input.** Current product and total daily dose; target product.
**Compute.** Tacrolimus immediate-release → Envarsus XR (kidney transplant): 80% of the total
daily dose, once daily. Sandimmune → Neoral: the same daily dose (1:1), then adjust to the
pre-conversion trough. Mycophenolate: the Myfortic label calls 720 mg mycophenolic acid and 1,000
mg mycophenolate mofetil "near equimolar" (739 mg as MPA); the tool computes the MPA content of
each regimen.
**Output.** Target dose or MPA content, with the label's warnings: Neoral → Sandimmune at 1:1 "may
result in lower cyclosporine blood concentrations" (so no reverse dose is computed); Myfortic and
mycophenolate mofetil "should not be used interchangeably without physician supervision."
**Scope.** Astagraf XL: the 1:1 Prograf conversion appears only in the label's pediatric study
description, not as an adult dosing instruction. Left out until a dosing-section statement is found.

### 15. `label-formulation-switch` — Formulation and Route Switches Stated on the Label (Cardiac and Other)

**Input.** Drug pair and current dose.
**Compute.**
- *Digoxin IV ↔ tablets* (digoxin tablet label Table 6; tablet bioavailability 60% to 80%): 50 mcg
  IV ↔ 62.5 mcg tablet; 100 ↔ 125; 200 ↔ 250; 400 ↔ 500.
- *Carvedilol IR → Coreg CR:* 3.125 mg twice daily → 10 mg daily; 6.25 → 20; 12.5 → 40; 25 → 80.
  Label footnote: from 12.5 or 25 mg twice daily, a start of 20 or 40 mg once daily may be
  warranted in elderly patients or those at risk of hypotension, dizziness or syncope; for patients
  65 or older on 25 mg twice daily the label recommends a lower starting dose (40 mg).
- *Methylphenidate IR → Concerta:* 5 mg two or three times daily → 18 mg; 10 mg → 36; 15 mg → 54;
  20 mg → 72 (72 mg only for ages 13–65).
- *Bumetanide ↔ furosemide:* the bumetanide label states 1 mg has a diuretic potency of about 40 mg
  furosemide and gives an approximate 1:40 substitution ratio for furosemide-allergic patients.
**Output.** The label's corresponding dose and the label sentence.
**Scope.** Only pairs with a label statement. Tools 13–15 could be one id; they are kept apart
because the readers differ (neurology, transplant, cardiology) and each has its own one-way
caveats. `digoxin-label-dose` in [spec-v1631](spec-v1631.md) prints the same Table 6 as its IV
equivalent; one data row serves both tools.

### 16. `levothyroxine-start-dose` — Levothyroxine Starting Dose and Titration Step (Label)

**Input.** Weight, age band, and the label's risk flags (at risk for atrial fibrillation or
cardiac disease; geriatric; pediatric at risk of hyperactivity).
**Compute.** Adult full replacement 1.6 mcg/kg/day; titrate by 12.5 to 25 mcg every 4 to 6 weeks
(every 6 to 8 weeks with cardiac risk); "lower starting dose (less than 1.6 mcg/kg/day)" for
cardiac risk and geriatric patients (the label gives no number; the tool says so). Pediatric
mcg/kg/day: 0–3 months 10–15; 3–6 months 8–10; 6–12 months 6–8; 1–5 years 5–6; 6–12 years 4–5;
over 12 with growth and puberty incomplete 2–3; growth and puberty complete 1.6; titrate every 2
weeks. Hyperactivity risk: start at one-fourth of full replacement and add one-fourth weekly.
**Output.** The computed mcg/day (a range in children), the nearest tablet strengths on either
side, the titration step and interval. Flags: the label notes doses above 200 mcg/day are seldom
needed and that an inadequate response above 300 mcg/day is rare. Group G.
**Note.** The label says "mcg/kg/day" without naming actual or ideal weight; weight is the
reader's entry and the output says so. The pediatric age bands share their edges as printed (3
months, 6 months, 12 years); at an edge both rows are shown. No other program spec computes a
levothyroxine dose.

### 17. `lai-antipsychotic-start` — Long-Acting Injectable Antipsychotic Dose From the Oral Dose (Labels)

**Input.** Product and the current oral dose (or the current 1-month injection, for Trinza).
**Compute.**
- *Invega Sustenna:* initiation 234 mg day 1 and 156 mg one week later (deltoid); maintenance
  matching oral paliperidone ER (Table 4): 12 mg → 234 mg; 9 → 156; 6 → 117; 3 → 39–78.
- *Invega Trinza* (after at least 4 months of adequate treatment with Sustenna; label Table 1, the
  3.5-fold dose): 78 → 273 mg; 117 → 410; 156 → 546; 234 → 819; conversion from 39 mg was not
  studied. Given when the next monthly dose is due, up to 7 days before or after.
- *Aristada* (Table 2): oral aripiprazole 10 mg/day → 441 mg monthly; 15 mg/day → 662 mg monthly,
  882 mg every 6 weeks or 1,064 mg every 2 months; 20 mg/day or more → 882 mg monthly. With the
  first injection: one Aristada Initio 675 mg injection plus one 30 mg oral dose, or 21
  consecutive days of oral aripiprazole.
- *Abilify Maintena:* 400 mg monthly, no sooner than 26 days after the previous injection. Two
  labeled starts: 1-day initiation (two 400 mg injections at separate sites plus one 20 mg oral
  dose) or 14-day initiation (one 400 mg injection plus 14 consecutive days of oral aripiprazole
  10 to 20 mg or the current oral antipsychotic).
**Output.** The labeled injection dose, the initiation dates, the overlap end date.
**Scope.** Starting doses only. Injection windows and missed doses are owned by
`lai-antipsychotic-missed-dose` in [spec-v1639](spec-v1639.md). Uzedy, Perseris, Risperdal
Consta, Rykindo, Invega Hafyera and Abilify Asimtufii are added after their tables are read.

### 18. `vitamin-iu-converter` — Vitamin A, D, E and Folate Unit Converter (FDA Labeling Factors)

**Input.** Vitamin, form, amount, direction.
**Compute.** FDA 2019 guidance: vitamin D 1 IU = 0.025 mcg (1 mcg = 40 IU), D2 and D3 alike.
Vitamin A, IU × factor = mcg RAE: retinol 0.30; supplemental beta-carotene 0.30; dietary
beta-carotene 0.05; dietary alpha-carotene or beta-cryptoxanthin 0.025. Vitamin E, IU × factor =
mg alpha-tocopherol: natural (RRR) 0.67; synthetic (all-rac) 0.45. Folate: mcg DFE = mcg food
folate + 1.7 × mcg folic acid. Niacin: 1 mg NE = 1 mg niacin = 60 mg tryptophan.
**Output.** The converted amount and percent of the 2016 Daily Value (vitamin A 900 mcg RAE,
vitamin D 20 mcg, vitamin E 15 mg, folate 400 mcg DFE, niacin 16 mg NE).
**Note.** The guidance says there is "no direct conversion factor" for vitamin A from IU without
knowing the source form, so the form is a required input, not a default. Salt-to-mEq conversion is
`meq-mmol-mg` in [spec-v1629](spec-v1629.md). Group E or Q (owner's choice).

### 19. `ppi-omeprazole-equivalent` — PPI Dose in Omeprazole Equivalents (Kirchheiner 2009)

**Input.** PPI and daily dose; optional target PPI.
**Compute.** Omeprazole equivalent = dose × relative potency: pantoprazole 0.23, lansoprazole 0.90,
omeprazole 1.00, esomeprazole 1.60, rabeprazole 1.82 (based on mean 24-hour gastric pH).
**Output.** The omeprazole-equivalent mg and, if asked, the target-drug mg, unrounded and with the
nearest marketed strengths on either side.
**Note.** The paper gives no clinical bands and cautions that only a limited dose range was tested
and study conditions differed between drugs; the tool repeats both. Dexlansoprazole is not in the
paper and is not offered.

### 20. `antidepressant-fluoxetine-equivalent` — Antidepressant Dose in Fluoxetine Equivalents (Hayasaka 2015)

**Input.** Antidepressant and daily dose.
**Compute.** Fluoxetine-equivalent mg = dose × 40 ÷ E, where E is the dose equal to fluoxetine 40
mg/day: paroxetine 34.0, agomelatine 53.2, amitriptyline 122.3, bupropion 348.5, clomipramine
116.1, desipramine 196.3, dothiepin 154.8, doxepin 140.1, escitalopram 18.0, fluvoxamine 143.3,
imipramine 137.2, lofepramine 250.2, maprotiline 118.0, mianserin 101.1, mirtazapine 50.9,
moclobemide 575.2, nefazodone 535.2, nortriptyline 100.9, reboxetine 11.5, sertraline 98.5,
trazodone 401.4, venlafaxine 149.4.
**Output.** Fluoxetine-equivalent mg/day with the method named.
**Scope.** A research and audit measure of dose intensity. It is not a cross-taper plan and the
tool says so. Citalopram, duloxetine and vortioxetine are not in the primary analysis reported in
the abstract and are not offered. The paper reports that sensitivity analyses corroborated every
drug except doxepin; the tool carries that flag.

### 21. `statin-ldl-reduction` — Statin Dose and Mean LDL-C Change (Label Trial Table)

**Input.** Statin (rosuvastatin, atorvastatin, simvastatin, pravastatin) and daily dose; optional
baseline LDL-C.
**Compute.** Crestor label Table 11 (6-week comparative trial, least-squares mean percent change):
rosuvastatin 10/20/40 mg −46/−52/−55; atorvastatin 10/20/40/80 mg −37/−43/−48/−51; simvastatin
10/20/40/80 mg −28/−35/−39/−46; pravastatin 10/20/40 mg −20/−24/−30. Expected LDL-C = baseline ×
(1 + change).
**Output.** The trial mean percent change for the dose, the projected LDL-C, and the doses of the
other three statins with the nearest trial mean.
**Build gate.** The intensity category (high, moderate, low) is **not** shipped until a current
ACC/AHA guideline table is read. Secondary pages report that a 2026 ACC/AHA dyslipidemia guideline
replaced the 2018 cholesterol guideline; neither document was opened. Rosuvastatin 5 mg (Crestor
Table 10, a different table) and the other statins need their own label tables. Group G.

### 22. `levodopa-equivalent-dose` — Levodopa Equivalent Daily Dose (Jost 2023)

**Input.** Each antiparkinsonian drug, formulation and total daily dose (pramipexole as salt or
base); for istradefylline and COMT inhibitors, nothing more (they scale the levodopa subtotal).
**Compute.** Levodopa equivalent dose (LED), mg/day = Σ daily dose × factor (Jost 2023, Table 1):

| Drug | Factor |
|---|---|
| Levodopa, immediate-release | 1 |
| Dual-release levodopa (Madopar DR) | 0.85 |
| Controlled-release levodopa | 0.75 |
| Extended-release levodopa (Rytary) | 0.5 |
| Inhaled levodopa (capsule dose) | 0.69 |
| Intrajejunal levodopa/carbidopa infusion | 1.11 (morning, maintenance and extra doses) |
| Intrajejunal levodopa/carbidopa/entacapone infusion | 1.11 (morning dose) and 1.46 (maintenance and extra doses) |
| Subcutaneous foslevodopa/foscarbidopa | 0.75 |
| Selegiline, oral | 10 |
| Selegiline, sublingual | 80 |
| Rasagiline | 100 |
| Pramipexole | 100 (salt), 142.86 (base) |
| Ropinirole | 20 |
| Rotigotine | 30.3 |
| Piribedil | 1 |
| Apomorphine, subcutaneous | 10 |
| Apomorphine, sublingual | 1.5 |
| Lisuride | 100 |
| Bromocriptine | 10 |
| Pergolide | 100 |
| Cabergoline | 66.67 |
| Dihydroergocryptine | 5 |
| Amantadine, immediate-release | 1 |
| Amantadine, extended-release (Gocovri) | 1.25 |
| Amantadine, extended-release (Osmolex ER) | 1 |

Drugs that are not a simple factor:
- *COMT inhibitors.* First compute the LED of the levodopa-containing drugs. Multiply that LED by
  0.33 (entacapone) or 0.5 (tolcapone, opicapone) to get the COMT inhibitor's LED, and add it. The
  paper proposes that opicapone applies to every levodopa dose of the day, tolcapone 100 mg for 8
  hours and entacapone 200 mg for 4 hours after intake; the reader marks which levodopa doses are
  covered.
- *Istradefylline.* 0.2 × the subtotal LED of levodopa-containing drugs and COMT inhibitors, added.
- *Safinamide.* 50 or 100 mg/day = 150 mg, a fixed amount.
- *Zonisamide.* 25 or 50 mg/day = 100 mg; the paper says not to use this outside Japan.
- *Trihexyphenidyl.* Each clinically effective single dose = 100 mg, only when that dose improves
  the UPDRS-III total by at least 5 points. The tool offers it behind that confirmation and
  otherwise leaves it out of the total.
**Output.** Total LED in mg/day and each drug's contribution, with the factor used.
**Source.** Jost ST, et al. Mov Disord 2023;38:1236, Tables 1 and 3 (an International
Parkinson and Movement Disorder Society position paper that updates Tomlinson 2010).
**Note.** The paper gives no interpretation band; the tool reports the number only. Its scope
statement is carried: LED is a research and comparison measure, "a practical guide", not a
switching dose. Tomlinson 2010 was not read (abstract only), so the tool does not list
differences from it. **Licensing.** The article is open access under a non-commercial,
no-derivatives Creative Commons license; the factors are facts used with attribution and the
tables are not reproduced as the paper prints them. Group G.

### 23. `hf-gdmt-target-percent` — Percent of Guideline Target Dose in HFrEF (2022 AHA/ACC/HFSA)

**Input.** Each drug the patient takes for heart failure with reduced ejection fraction and its
total daily dose.
**Compute.** Percent of target = total daily dose ÷ target total daily dose × 100, from Table 14
("Drugs Commonly Used for HFrEF (Stage C HF)"):

| Drug | Initial dose | Target dose |
|---|---|---|
| Captopril | 6.25 mg three times daily | 50 mg three times daily |
| Enalapril | 2.5 mg twice daily | 10–20 mg twice daily |
| Fosinopril | 5–10 mg once daily | 40 mg once daily |
| Lisinopril | 2.5–5 mg once daily | 20–40 mg once daily |
| Perindopril | 2 mg once daily | 8–16 mg once daily |
| Quinapril | 5 mg twice daily | 20 mg twice daily |
| Ramipril | 1.25–2.5 mg once daily | 10 mg once daily |
| Trandolapril | 1 mg once daily | 4 mg once daily |
| Candesartan | 4–8 mg once daily | 32 mg once daily |
| Losartan | 25–50 mg once daily | 50–150 mg once daily |
| Valsartan | 20–40 mg once daily | 160 mg twice daily |
| Sacubitril-valsartan | 49/51 mg twice daily (may start at 24/26 mg twice daily) | 97/103 mg twice daily |
| Bisoprolol | 1.25 mg once daily | 10 mg once daily |
| Carvedilol | 3.125 mg twice daily | 25–50 mg twice daily |
| Carvedilol CR | 10 mg once daily | 80 mg once daily |
| Metoprolol succinate extended release | 12.5–25 mg once daily | 200 mg once daily |
| Spironolactone | 12.5–25 mg once daily | 25–50 mg once daily |
| Eplerenone | 25 mg once daily | 50 mg once daily |
| Dapagliflozin | 10 mg once daily | 10 mg once daily |
| Empagliflozin | 10 mg once daily | 10 mg once daily |
| Isosorbide dinitrate/hydralazine, fixed-dose combination | 20 mg/37.5 mg three times daily | 40 mg/75 mg three times daily |
| Isosorbide dinitrate and hydralazine, separate | 20–30 mg and 25–50 mg, three to four times daily | 120 mg and 300 mg total daily, in divided doses |
| Ivabradine | 5 mg twice daily | 7.5 mg twice daily |
| Vericiguat | 2.5 mg once daily | 10 mg once daily |

**Output.** For each drug, the percent of target and the target used. Where the table prints a
range (enalapril, lisinopril, perindopril, losartan, carvedilol, spironolactone), the percent is
shown against both ends and the tool does not pick one. The table's "mean dose achieved in
clinical trials" column may be shown beside it.
**Scope.** Digoxin has no dose target in the table (a serum concentration of 0.5 to < 0.9 ng/mL)
and is not scored. The tool does not judge why a dose is below target (blood pressure, potassium,
kidney function); label limits by kidney function are in [spec-v1632](spec-v1632.md). Only the
drugs in the table are offered.
**Source.** 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. Circulation 2022,
DOI 10.1161/CIR.0000000000001063, Table 14.
**Build gate (currency only).** Whether a later focused update changed Table 14 was not checked;
the build confirms the table is current and stores a review date. **Licensing.** The guideline is
free to read but not openly licensed; target doses are facts cited with attribution, and the
table's layout and footnotes are not reproduced. Owner to confirm. Group G.

## Backfills (live tools that should do more)

| Live tool | Backfill | Source |
|---|---|---|
| `opioid-conversion` | The transdermal-fentanyl row uses one factor (2.4 oral morphine equivalents per mcg/h, `fentanyl-td` in `lib/rheum-v148.js`) for both source and target and cites a textbook and a chart. The current fentanyl label says its conversion is conservative and one-way, and that using it to leave the patch overestimates the new opioid. Remove fentanyl-td as a *source* drug or add the label warning, and route *to*-patch requests to tool 3. The tool's note says the cross-tolerance reduction is 25–50% while its summary and its options allow 0–50%. | Fentanyl transdermal label 2.3 |
| `periop-bridging` | Link to tool 2 from the DOAC branch, since its scope note disclaims a schedule. | — |
| `chlorpromazine-equivalents` | Seven drugs, one method (Woods 2003). Leucht 2016 Table 1 prints olanzapine equivalents by four methods for 57 drugs and they differ (quetiapine 40, 20, 32.27, 37.04 mg per 1 mg olanzapine; haloperidol 0.8, 0.53, 0.74, 0.5). A backfill may show all four values side by side as a range, each named. It must not pick one. Owner decision: under the "two sources disagree" rule this could equally be left alone. | Leucht 2016 (PMC4960429) |
| `benzo-equiv`, `benzodiazepine-equivalence` | Two live tools convert the same thing from different tables. ASAM 2025 says "no precise strategies for conversion exist." Add that sentence and the ASAM dose bands (low: 10 mg diazepam equivalents or less; moderate 10–15; high more than 15); consider merging. | ASAM 2025 |
| `iron-ganzoni` | Link to tool 10; note that the INFeD label formula differs. | INFeD label |
| `dose-calendar` | Link to tools 11 and 12 for schedules where the dose changes. | — |

## Rejected

| Idea | Why not |
|---|---|
| Levothyroxine IV:PO ratio | The injection label says the relative bioavailability "has not been established" and that "accurate dosing conversion has not been studied." The 50–75% convention has no primary source. |
| Four-way loop diuretic equivalence | Only bumetanide:furosemide 1:40 is on a label (kept in tool 15). The furosemide label gives oral bioavailability (64% tablet, 60% solution) but no dose ratio; the torsemide label gives 80% bioavailability and no furosemide equivalence. Ethacrynic acid: nothing found. Convention only. |
| Furosemide, metoprolol IV:PO ratios | No label dosing statement found (furosemide read; Toprol-XL and Lopressor were not found on DailyMed by brand on October 10, 2026). |
| Thiazide, ACE inhibitor, ARB, beta-blocker "equivalent doses" | No primary source for equivalence. Target doses are a different thing (tool 23). |
| U-500 to U-100 syringe or volume conversion | The current Humulin R U-500 label has no conversion table and says not to use any other syringe. A converter would contradict the label. |
| IV insulin infusion to subcutaneous transition | No label source; institutional protocols differ; the ADA Standards text was not read. |
| Weight-based insulin initiation beyond the label lines | The label figures are folded into tool 8. ADA numbers were not read. |
| Methadone to another opioid; fentanyl patch to another opioid; Hysingla, Butrans, Belbuca reversed | Each label forbids it in words. |
| Mycophenolate "720 = 1,000" as a switch dose | The labels say the products are not interchangeable without supervision; only the MPA content is computed (tool 14). |
| Astagraf XL 1:1 | Found only in a study description, not as a dosing instruction. |
| Antidepressant cross-taper planner | Judgment; no primary schedule. |
| Antipsychotic single-number equivalence expansion | Four published methods disagree (see Backfills). |
| Corticosteroid taper presets; stress-dose rules | No primary source with a general taper rate was found; `taper-calendar` accepts reader steps. Stress dosing was not researched. |
| Estrogen equivalence; mineralocorticoid equivalence; H2RA equivalence | No primary source located. |
| Morphine PCA to oral | Duplicate of `opioid-conversion` (IV morphine source row) plus a sum. |
| Ketamine conversions | No primary source; not a conversion with a label basis. |
| Antibiotic IV-to-PO eligibility checklist | Judgment over the chart; institutional criteria. |
| Nicotine replacement by cigarettes per day | Specified once, as `nrt-step-schedule` in [spec-v1639](spec-v1639.md). |
| Elemental iron by oral salt | Live in `elemental-iron-ingested` (percentages); a separate table would be a bare table. |
| Epoetin/darbepoetin reverse, Mircera to others | No label table. |
| Opioid taper as its own id, benzodiazepine taper as its own id | One calculation; presets of tool 7. |
| HHS 2019 taper guide numbers as a preset | hhs.gov returned 403; not read. CDC 2022 and the FDA label language cover the same ground. |
| GLP-1 escalation presets in `label-titration-calendar` | Specified once, as `glp1-titration-check` in [spec-v1632](spec-v1632.md). |
| Missed long-acting injection as its own tool here | Specified once, as `lai-antipsychotic-missed-dose` in [spec-v1639](spec-v1639.md). |
| Salt-to-mEq converter as its own tool here | Specified once, as `meq-mmol-mg` in [spec-v1629](spec-v1629.md). |

## Research record

All labels were fetched from DailyMed on October 10, 2026; set ids, versions and published dates
are in Sources. Rows marked "second read" were re-read from a fresh fetch the same day.

| Finding | Where read | Effect on the spec |
|---|---|---|
| Warfarin → DOAC thresholds: apixaban < 2.0, rivaroxaban < 3.0 (pediatric < 2.5), dabigatran < 2.0, edoxaban ≤ 2.5 | Eliquis 2.5, Xarelto 2.3, Pradaxa 2.6, Savaysa 2.4 | Tool 1 table |
| The Eliquis text first read was a repackager's copy; the Bristol-Myers Squibb label (set id e9481622, version 30) has the same four switching sentences in section 2.5 and the 48-hour and 24-hour stops in section 2.4 | Eliquis, E.R. Squibb & Sons | Tool 1 cites the application holder's label and its section numbers (second read) |
| Dabigatran → warfarin by CrCl (3/2/1 days; none < 15); pediatric eGFR ≥ 50 → 3 days; dabigatran → parenteral 12 h / 24 h | Pradaxa 2.6–2.7 | Tool 1; pediatric dabigatran → warfarin row added (second read) |
| Edoxaban → warfarin has two labeled options with dose halving; UFH → edoxaban 4 hours | Savaysa 2.4 | Tool 1 |
| Label pre-procedure stops: apixaban 48 h / 24 h; rivaroxaban 24 h; edoxaban 24 h; dabigatran 1–2 or 3–5 days by CrCl 50 | Eliquis 2.4, Xarelto 2.4, Savaysa 2.5, Pradaxa 2.8 | Tool 2 |
| PAUSE: omit 1 day (low) / 2 days (high); dabigatran CrCl < 50: 2 / 4 days; resume 1 day / 2–3 days; no edoxaban cohort; excluded CrCl < 25 (apixaban) and < 30 (dabigatran, rivaroxaban) | https://pmc.ncbi.nlm.nih.gov/articles/PMC6686768/ (Methods and Table 2) | Tool 2; edoxaban excluded from the PAUSE branch; exclusion floors added to Scope (second read) |
| Live `periop-bridging` says "it does not set an interruption schedule" | `lib/periop-bridging-v899.js` | Tool 2 is a gap, not a duplicate |
| Duragesic is not on DailyMed; the conversion tables are in the current generic label | DailyMed search; SpecGx fentanyl transdermal | Tool 3 cites the generic label |
| Fentanyl Tables 1–2, the one-way sentences, the opioid-tolerance definition, 3-day and 6-day titration | SpecGx label 2.1 and 2.3 | Tool 3; backfill to `opioid-conversion` (second read) |
| Methadone Table 1 percent bands; round down; parenteral:oral 1:2; one-way sentence; the full medically supervised withdrawal sentence | Methadone tablets, American Health Packaging | Tools 4 and 7 (second read) |
| A methadone tablet label without the pain indication (VistaPharm c54baaee) has no conversion table | DailyMed | Build must cite a pain-indicated tablet label |
| Hysingla factors, 25% reduction, 20 mg floor; Butrans bands, 20 mcg/h cap, 72-hour interval; Belbuca Table 1, 4-day steps, 900 mcg cap | Hysingla ER, Butrans, Belbuca labels | Tool 5 (second read; the Butrans bands were read as the label's prose) |
| Opioid labels carry a class taper sentence: 10% to 25%, every 2 to 4 weeks | Butrans and methadone labels | Tool 7 preset from a primary source |
| CDC 2022, Recommendation 5: about 10% per month or slower after 1 year or more; for shorter use 10% of the original dose per week until about 30% remains, then about 10% of the remaining dose per week; rate "should be individualized"; tapers may be paused; after the smallest available dose the interval can be extended | https://pmc.ncbi.nlm.nih.gov/articles/PMC9639433/ | Tool 7: shorter-use preset, percent-of-original and percent-of-remaining modes, pause rows and the closing rule merged from the taper tool once drafted for [spec-v1634](spec-v1634.md) |
| ASAM 2025: 5–10% every 2–4 weeks; not over 25% every 2 weeks; later 5–10% every 6–8 weeks; dose bands 10 / 10–15 / > 15 mg diazepam equivalents; "no precise strategies for conversion exist" | https://pmc.ncbi.nlm.nih.gov/articles/PMC12463801/ | Tool 7 preset; benzodiazepine backfill (second read) |
| Zubsolv correspondence table (same rows on the Orexo label, set id 5f5cfcfe, version 27); Brixadi Tables 1–2; Sublocade schedule | Zubsolv, Brixadi, Sublocade labels | Tool 6 |
| Basal switch percentages | Lantus 2.4, Basaglar 2.4, Toujeo 2.4, Tresiba 2.4 | Tool 8 |
| The Tresiba figures were first read on a repackager's copy; the Novo Nordisk label (set id 456c5e87, version 14) and Novo's unbranded insulin degludec label (c1be283d) state the same: adults the same units, pediatric 1 year and older 80% | Tresiba, Novo Nordisk | Tool 8 cites the Novo Nordisk label (second read) |
| Humulin R U-500 label: no conversion table; U-500 syringe only | Humulin R U-500 label | U-500 conversion rejected |
| Aranesp Table 1; Mircera Table 1; Mircera pediatric Table 2 exists (once every 4 weeks) | Aranesp, Mircera labels | Tool 9 |
| IV iron courses; Venofer HDD usual total course 1,000 mg; INFeD formula, daily limits and blood-loss example | Injectafer, Venofer, Feraheme, Monoferric, INFeD labels | Tool 10; Venofer total and INFeD daily limits added (second read) |
| Lamictal Tables 1–6 and Table 14 were all read; atazanavir/ritonavir, like oral contraceptives, does not change the escalation; stop over at least 2 weeks | Lamictal 2.1–2.4, 12.3 | Tool 11: pediatric Tables 2–3, Table 4, Table 6 and the half-life figures added (second read) |
| Lamictal XR Table 1 differs from immediate-release at weeks 6–7 and in maintenance; IR → XR at the same total daily dose | Lamictal XR 2.2, 2.4 | Tool 11 XR branch added |
| **Correction.** Depakote ER Table 1 has two more rows than first recorded (2,875 → 3,250; 3,000–3,125 → 3,500), and the label's "cannot be directly converted" caution is an asterisk on 500, 750 and 1,000 mg, not a rule for doses between rows; above 3,125 mg/day the label gives no factor | Depakote ER, Table 1 and footnote | Tool 13 table, note and tests corrected |
| IV = PO for valproate and levetiracetam; carbamazepine same mg (the Tegretol-XR sentence read in full); fosphenytoin PE; phenytoin free acid about 8% | Valproate injection, Keppra injection, Tegretol, Cerebyx, Dilantin labels | Tool 13 |
| Envarsus 80%; Sandimmune → Neoral 1:1 and the reverse warning; Myfortic "near equimolar" (739 mg as MPA) and non-interchangeable | Envarsus XR, Neoral, Myfortic labels | Tool 14 (second read) |
| Astagraf 1:1 only in pediatric study text | Astagraf XL label | Left out |
| Digoxin Table 6; Concerta Table 2; bumetanide 1:40 | Digoxin tablets, Concerta, bumetanide labels | Tool 15 |
| **Correction.** The Coreg CR label gives numbers for the lower start: 20 or 40 mg from 12.5 or 25 mg twice daily (table footnote), and 40 mg recommended at age 65 or older from 25 mg twice daily | Coreg CR Table 1 footnote and 2.5 | Tool 15 text and test corrected |
| Levothyroxine injection: conversion not established | Levothyroxine injection label | IV:PO ratio rejected |
| Synthroid 1.6 mcg/kg, steps, pediatric bands, pediatric titration every 2 weeks; version 1537 (published February 29, 2024) is the current AbbVie edition | Synthroid Tables 1–2 | Tool 16 (second read) |
| Sustenna Table 4 and initiation; Trinza Table 1 read directly (39 mg not studied; at least 4 months on Sustenna first); Aristada Table 2 and its two initiation options; Maintena has a 1-day and a 14-day initiation | Invega Sustenna, Invega Trinza, Aristada, Abilify Maintena labels | Tool 17; initiation options added (second read) |
| Topiramate, varenicline, apremilast, memantine, sacubitril/valsartan schedules | Topamax, Chantix, Otezla, memantine, Entresto labels | Tool 12 presets (second read) |
| FDA vitamin factors and Daily Values | https://www.fda.gov/media/129863/download (August 2019) | Tool 18 (second read) |
| Kirchheiner potencies 0.23/0.90/1.00/1.60/1.82 | PubMed abstract, PMID 18925391 | Tool 19 (second read) |
| Hayasaka fluoxetine-40 equivalents; sensitivity analyses corroborated all except doxepin | PubMed abstract, PMID 25911132 | Tool 20 (second read) |
| Crestor Table 11 | Crestor label | Tool 21 (second read) |
| A 2026 ACC/AHA dyslipidemia guideline is reported to have replaced the 2018 cholesterol guideline | Web search results (secondary pages); guideline itself not opened | Statin intensity bands gated |
| Jost 2023 Tables 1 and 3: every levodopa-equivalent factor and the COMT, istradefylline, safinamide, zonisamide and trihexyphenidyl rules | University of Padua repository copy of the published article (DOI 10.1002/mds.29410), found through Unpaywall; the Wiley page returned 403 | Tool 22 promoted from gated to a numbered tool with its numbers |
| Two worked examples in Jost Table 3 do not equal the factor arithmetic as printed: tolcapone (450 mg levodopa × 0.5 = 225; 225 + 450 printed as 550) and sublingual apomorphine (40 mg twice daily × 1.5 printed as 60 mg). Table 3 prints rotigotine as 30 beside an example that uses 30.3 | Same copy | Tool 22 uses the Table 1 factors; the two examples are not used as tests (Verify at build) |
| Tomlinson 2010 is paywalled; only its abstract was read, which states the method and no factor | Wiley abstract page, DOI 10.1002/mds.23429 | Tool 22 does not compare with Tomlinson |
| 2022 AHA/ACC/HFSA guideline Table 14: initial and target doses for 24 regimens | https://www.ahajournals.org/doi/full/10.1161/CIR.0000000000001063 (opened in a browser; a scripted fetch returned 403) | Tool 23 promoted from gated to a numbered tool with its numbers |
| Leucht 2016 Table 1: four equivalence methods disagree | https://pmc.ncbi.nlm.nih.gov/articles/PMC4960429/ | Antipsychotic expansion becomes an owner decision |
| Leucht 2014 minimum-effective-dose equivalents | PubMed abstract, PMID 24493852 | Supports the disagreement finding |
| Live `opioid-conversion` uses 2.4 for the patch as both source and target (`OPIOID_AGENTS['fentanyl-td']`, one factor, divided when the patch is the target); its note says 25–50% and its options include 0% | `lib/rheum-v148.js` | Backfill (second read) |
| No live tool and no other program spec uses any id in this file | `catalog.tsv`; `docs/spec-v1629.md` to `docs/spec-v1639.md` | Ids are free |

## Verify at build

- **Editions, all label tools.** Pin each label per [spec-v1628 §1](spec-v1628.md). Several
  labels read here are not the application holder's: methadone tablets (American Health
  Packaging), bumetanide and memantine (RemedyRepack), INFeD (Henry Schein), Zubsolv (Edenbridge;
  the same table was confirmed on Orexo's set id), valproate injection (Sagent), digoxin tablets
  (Amneal; the Lanoxin tablet label was not read), fentanyl transdermal (SpecGx; no brand label is
  on DailyMed). The build re-reads each number on the pinned set id before shipping.
- **Tool 1.** Confirm the pediatric rivaroxaban → warfarin wording line by line. The Eliquis label
  now has pediatric dosing; its section 2.5 switching sentences do not distinguish adults from
  children, and the tool should say that.
- **Tool 2.** PAUSE's own lists of low- and high-bleeding-risk procedures are in a supplement not
  read; risk stays reader input. Check whether a later CHEST statement changed the days.
- **Tool 3.** Whether every current generic label carries identical Tables 1–2 (one read).
- **Tool 4.** The overlapping band edges are printed that way in the one label read; confirm in a
  second manufacturer's label.
- **Tool 5.** OxyContin, Nucynta ER, morphine ER and Xtampza labels were not read; each may add a
  preset or a "no table" line.
- **Tool 6.** Suboxone *film* correspondence (only tablets were read in the Zubsolv label).
- **Tool 7.** HHS 2019 guide (hhs.gov 403).
- **Tool 8.** The Novo Nordisk Tresiba set id shows version 14, published July 20, 2022; confirm
  it is the current edition. Semglee, Rezvoglar, detemir, Awiqli and other basal labels not read.
- **Tool 9.** How the Aranesp weekly figure scales for every-2-week dosing is not stated in the
  text read. Mircera pediatric Table 2 rows not transcribed. Retacrit and Epogen labels were not
  checked for reverse guidance.
- **Tool 10.** Injectafer pediatric age limits, INFeD weight caps and the Ferrlecit label were not
  read.
- **Tool 11.** The contraceptive maintenance adjustments and the XR adjunctive-to-monotherapy
  table (XR Table 2) were read in part only; print them as notes only after a full read.
- **Tool 12.** Entresto pediatric steps; apremilast pediatric rows; topiramate adjunctive
  schedule. Every further preset needs its label read.
- **Tool 13.** Depakote sprinkle and Stavzor not read; lacosamide and brivaracetam IV = PO
  statements not read. The 0.92 factor is the label's "approximately 8%"; confirm against the
  molecular weights the label prints.
- **Tool 15.** Lanoxin brand tablet label (a generic was read).
- **Tool 16.** A generic levothyroxine label, to confirm the table is class text.
- **Tool 17.** Uzedy, Perseris, Consta, Rykindo, Hafyera, Asimtufii and Erzofri tables unread.
- **Tool 18.** Whether FDA has revised the 2019 guidance or the Daily Values.
- **Tools 19–20.** Only abstracts were read (both papers are paywalled or not in PMC). Read the
  full tables for confidence intervals, the full drug list and any dose-range limits.
- **Tool 21.** A current guideline intensity table; label LDL tables for rosuvastatin 5 mg,
  pitavastatin, lovastatin, fluvastatin.
- **Tool 22.** The copy read is a university repository copy of the published article; confirm the
  factors on the publisher's page and check the two corrections the article lists (May 19 and
  July 6, 2023) and any later erratum for the tolcapone and sublingual apomorphine examples.
  Supplementary Table S7 (evidence grades) not read.
- **Tool 23.** Whether a focused update after 2022 changed Table 14 (not checked). Reuse
  permission for the target-dose column.
- **Unit note for every label tool.** The labels state CrCl without naming the equation in the
  sections read (Cockcroft-Gault is conventional for these drugs, but that line was not read); the
  build cites it per label or takes CrCl as reader input.

## Sources

DailyMed labels, all fetched October 10, 2026 (set id, version, published date):

| Label | Set id | Version | Published |
|---|---|---|---|
| Eliquis (E.R. Squibb & Sons) | e9481622-7cc6-418a-acb6-c5450daae9b0 | 30 | May 5, 2025 |
| Xarelto | 10db92f9-2300-4a80-836b-673e1ae91610 | 65 | September 11, 2026 |
| Pradaxa | ba74e3cd-b06f-4145-b284-5fd6b84ff3c9 | 48 | June 30, 2025 |
| Savaysa | e77d3400-56ad-11e3-949a-0800200c9a66 | 28 | July 14, 2025 |
| Fentanyl transdermal (SpecGx) | e15a7e9b-8025-49dd-9a6d-bafcccf1959f | 58 | May 6, 2026 |
| Methadone tablets (American Health Packaging) | 540edd43-165d-4257-b989-3bccc8f54afb | 2 | September 10, 2026 |
| Hysingla ER | b7d23ac2-e776-9f62-3290-c64c2d6eb353 | 17 | June 18, 2026 |
| Butrans | 794aa355-66de-41b8-aedf-f2c40f6bc664 | 32 | May 13, 2026 |
| Belbuca | bc2b7a3d-72cf-497c-95b0-ba2b71f63c64 | 18 | January 6, 2026 |
| Zubsolv (Edenbridge) | 57583c1d-9c44-4503-917d-68dba7377bd1 | 1 | June 15, 2026 |
| Zubsolv (Orexo) | 5f5cfcfe-d52b-49e6-8fe4-550477332dd2 | 27 | December 31, 2025 |
| Brixadi | 5d8a8fd0-8619-422a-a664-d1d2e8970f48 | 6 | January 6, 2026 |
| Sublocade | 6189fb21-9432-45f8-8481-0bfaf3ccde95 | 43 | July 28, 2026 |
| Lantus | d5e07a0c-7e14-4756-9152-9fea485d654a | 35 | July 2, 2025 |
| Basaglar | 0ad21db3-2b1c-4ed9-a687-bdd6a74d0aae | 35 | August 10, 2026 |
| Toujeo | c9561d96-124d-48ca-982f-0aa1575bff36 | 25 | June 12, 2025 |
| Tresiba (Novo Nordisk) | 456c5e87-3dfd-46fa-8ac0-c6128d4c97c6 | 14 | July 20, 2022 |
| Humulin R U-500 | b60e8dd0-1d48-4dc9-87fd-e14675255e8c | 41 | September 2, 2026 |
| Aranesp | 0fd36cb9-c4f6-4167-93c9-8530865db3f9 | 161 | July 21, 2026 |
| Mircera | 22c56f2a-f73c-60e7-e054-00144ff88e88 | 10 | August 17, 2026 |
| Injectafer | 517b4a19-45b3-4286-9f6a-ced4e10447de | 30 | August 20, 2026 |
| Venofer | 626dc9e5-c6b4-4f9c-9bf4-774fd3ae619a | 45 | March 20, 2026 |
| Feraheme | 32b0e320-a739-11dc-a704-0002a5d5c51b | 23 | June 4, 2026 |
| Monoferric | 55859d2d-0456-4fa9-b41f-f535accc97db | 13 | December 10, 2025 |
| INFeD (Henry Schein) | 99bf34be-cb8a-46d1-9637-5544dc2da287 | 7 | April 24, 2026 |
| Lamictal | d7e3572d-56fe-4727-2bb4-013ccca22678 | 45 | August 20, 2026 |
| Lamictal XR | 3e2c9a35-6a39-41d7-ad84-3c0bb8894b09 | 44 | August 20, 2026 |
| Depakote ER | 0dc024ce-efc8-4690-7cb5-639c728fccac | 1658 | April 13, 2026 |
| Valproate sodium injection (Sagent) | 8d5fc1c1-d3c0-497e-971b-6c4dba9a3fad | 3 | June 22, 2026 |
| Keppra injection | c6d5784d-abf9-45fe-ac5a-d5c53bd50f7e | 29 | July 2, 2025 |
| Tegretol | 8d409411-aa9f-4f3a-a52c-fbcb0c3ec053 | 39 | August 21, 2026 |
| Cerebyx | d4c36fad-0ba2-4cd4-9c5e-dcf843f38a5a | 38 | August 29, 2025 |
| Dilantin Infatabs | ca119a89-2394-4d34-8078-cd1fa4e8e2f1 | 58 | May 21, 2026 |
| Envarsus XR | de2315b0-6344-43ac-9aea-3e3b68d828e7 | 16 | March 3, 2025 |
| Astagraf XL | 550a5cd4-fbf2-4c09-b577-6bde8fcbdf6e | 12 | February 6, 2026 |
| Neoral | 94461af3-11f1-4670-95d4-2965b9538ae3 | 30 | August 11, 2026 |
| Myfortic | eed26501-890d-4ff6-88e7-6dbea4726e53 | 36 | August 11, 2026 |
| CellCept | 37241e87-4af4-4dc3-a1aa-ea6f20d8dc40 | 51 | August 10, 2026 |
| Digoxin tablets (Amneal) | dfac7f13-28be-423d-9389-9089da29da17 | 20 | August 17, 2026 |
| Coreg CR | d3625d78-6eb6-41fe-8f6f-664965c104c4 | 3 | April 28, 2025 |
| Concerta | 1a88218c-5b18-4220-8f56-526de1a276cd | 30 | April 22, 2026 |
| Bumetanide tablets (RemedyRepack) | c5d87c7c-3d03-4a9a-8f07-382371c55169 | 3 | September 14, 2026 |
| Torsemide tablets (RemedyRepack) | 26a3af16-39fc-482d-8a8e-9473af4b0e3f | 3 | August 31, 2026 |
| Furosemide injection (Amneal) | d5b9f12e-d1e9-42de-90f2-c9ba33a86457 | 15 | September 21, 2026 |
| Levothyroxine injection | 4e9adc35-3aba-4a0d-9c4e-7e7ee2ffdabd | 5 | September 21, 2026 |
| Synthroid | 1e11ad30-1041-4520-10b0-8f9d30d30fcc | 1537 | February 29, 2024 |
| Invega Sustenna | 1af14e42-951d-414d-8564-5d5fce138554 | 41 | February 17, 2025 |
| Invega Trinza | c39e65d7-fa44-4e4c-8b12-a654d3ed0eae | 25 | February 17, 2025 |
| Aristada | 17a8d11b-73b0-4833-a0b4-cf1ef85edefb | 32 | February 10, 2025 |
| Abilify Maintena | ee49f3b1-1650-47ff-9fb1-ea53fe0b92b6 | 27 | March 30, 2026 |
| Uzedy | 734eb776-4be0-4808-834b-0d8b0f9e021e | 8 | September 14, 2026 |
| Topamax | 21628112-0c47-11df-95b3-498d55d89593 | 31 | October 6, 2026 |
| Chantix | f0ff4f27-5185-4881-a749-c6b7a0ca5696 | 49 | January 23, 2026 |
| Otezla | f6b1f516-4972-4d82-bced-113e47b41cc5 | 38 | September 11, 2026 |
| Memantine tablets (RemedyRepack) | cbfd9d95-f50b-45ff-9857-9f1712c45e56 | 8 | August 7, 2026 |
| Entresto | 000dc81d-ab91-450c-8eae-8eb74e72296f | 25 | July 7, 2026 |
| Crestor | 325a5d0e-9a72-4015-9fcd-1655fb504cee | 19 | September 30, 2026 |

Papers and agency documents:
- Douketis JD, et al. Perioperative management of patients with atrial fibrillation receiving a
  direct oral anticoagulant (PAUSE). JAMA Intern Med 2019;179:1469. PMC6686768.
- Dowell D, et al. CDC clinical practice guideline for prescribing opioids for pain, 2022. MMWR
  Recomm Rep 2022;71(3). PMC9639433.
- Joint clinical practice guideline on benzodiazepine tapering (ASAM and partners). J Gen Intern
  Med 2025;40:2814. PMC12463801.
- FDA. Converting Units of Measure for Folate, Niacin, and Vitamins A, D, and E on the Nutrition
  and Supplement Facts Labels: Guidance for Industry. August 2019. fda.gov/media/129863/download.
- Kirchheiner J, et al. Relative potency of proton-pump inhibitors. Eur J Clin Pharmacol
  2009;65:19. PMID 18925391 (abstract read).
- Hayasaka Y, et al. Dose equivalents of antidepressants. J Affect Disord 2015;180:179.
  PMID 25911132 (abstract read).
- Leucht S, et al. Dose equivalents for antipsychotic drugs: the DDD method. Schizophr Bull
  2016;42(Suppl 1):S90. PMC4960429.
- Jost ST, et al. Levodopa dose equivalency in Parkinson's disease: updated systematic review and
  proposals. Mov Disord 2023;38:1236. DOI 10.1002/mds.29410 (repository copy of the published
  article read).
- 2022 AHA/ACC/HFSA guideline for the management of heart failure. Circulation 2022.
  DOI 10.1161/CIR.0000000000001063 (Table 14 read).
- Not opened: a 2026 ACC/AHA dyslipidemia guideline; the HHS 2019 dosage-reduction guide; Gardner
  2010; Tomlinson 2010 beyond its abstract (Mov Disord 2010, DOI 10.1002/mds.23429).

## Tests

- **`anticoag-switch-clock`.** Warfarin → apixaban, INR 2.0 → not yet (label says *below* 2.0);
  INR 1.9 → start. Warfarin → edoxaban, INR 2.5 → start (≤); 2.6 → not yet. Warfarin →
  rivaroxaban adult INR 2.9 → start; pediatric INR 2.6 → not yet. Dabigatran → warfarin at CrCl
  51 → 3 days, 49 → 2 days; at exactly 50 and exactly 30 the label's bands overlap (≥ 50, 30–50
  and 15–30 as printed): assert the tool shows both printed bands rather than silently choosing.
  CrCl 14 → "no recommendation." UFH → edoxaban stopped 14:00 → 18:00. A blank INR refuses.
- **`doac-periprocedural-timing`.** Apixaban, high risk, PAUSE, procedure Thursday → last dose
  Monday, none Tuesday–Thursday; resumption Saturday–Sunday. Dabigatran CrCl 49, high risk → 4
  days omitted; CrCl 50 → 2 days. Edoxaban + PAUSE → label line only, with the reason. Apixaban
  CrCl 24 + PAUSE → label line only ("not studied below 25").
- **`fentanyl-patch-initial-dose`.** Oral morphine 134 → 25 mcg/h; 135 → 50; 59 → refusal; 404 →
  100; 405 → 125; 1,125 → above the table, refusal. Oxycodone 67 and 67.5 land in different
  columns; 67.2 → the printed gap, both neighbors shown. Codeine 448 → no row. Any "from fentanyl"
  request → refusal naming the label sentence.
- **`methadone-label-conversion`.** 100 mg, twice daily, 5 mg tablets → label example (15 mg/day
  at 15%; 7.5 → 5 mg every 12 hours); output shows the full 10–20 mg range and the adjacent
  20–30% row at exactly 100. 1,200 mg → "< 5%" shown as an upper bound only (under 60 mg). Rounding
  never goes up.
- **`er-opioid-label-start`.** Hysingla: oxycodone 40 mg/day → 40 × 1 × 0.75 = 30 mg; morphine 30
  mg/day → 30 × 0.5 × 0.75 = 11.25 → "initiate at 20 mg." Butrans: 29 mg → 5 mcg/h; 30 mg → taper
  then 10; 81 mg → alternate. Belbuca: 89 → 150 mcg; 90 → 300 mcg; 161 → alternate.
- **`buprenorphine-oud-product-switch`.** 8/2 → 5.7/1.4; 16/4 → 11.4/2.9; 7 mg → not in table.
  Brixadi from 12 mg → 24 weekly / 96 monthly; 6 mg monthly → none listed. Sublocade third dose 25
  days after the second → too early (26-day minimum).
- **`taper-calendar`.** 100 mg, 10% of remaining, monthly → 90, 81, 72.9; 10% of original → 90,
  80, 70, and reaches zero at step 10; the two modes are labeled. CDC shorter-use preset from 100
  mg weekly → 90, 80, 70, 60, 50, 40, 30, then 27, 24.3. A 2-week pause after step 3 moves every
  later date by 14 days and changes no dose. Rounding to 5 mg strengths never rounds up past the
  prior step; with a smallest dose of 5 mg the schedule ends at 5 mg and prints the "extend the
  interval" rule. Opioid 20% per week on therapy over 1 year → flagged against CDC. Benzodiazepine
  30% every week → flagged against ASAM. Zero or 100% reduction refuses.
- **`basal-insulin-switch`.** NPH 20 units twice daily → Lantus 32 units. NPH 40 once daily →
  Lantus 40. Toujeo 50 → Lantus 40. Adult detemir 30 → Tresiba 30; child → 24. Tresiba → Lantus →
  "no figure." 33 units × 80% = 26.4 → 26, labeled as the tool's rounding.
- **`esa-conversion`.** Epoetin 10,999 → 25 mcg; 11,000 → 40; pediatric 1,400 → "insufficient
  data." Mircera: 8,000 units → 200 mcg monthly (band is inclusive at 8,000 and 16,000 as printed);
  7,999 → 120; 16,001 → 360.
- **`iv-iron-course`.** Injectafer 49.9 kg → 15 mg/kg × 2 (748.5 mg each); 50 kg → 750 × 2;
  single-dose option 80 kg → 1,000 (cap), 60 kg → 900. HF, 69 kg, Hb 9.5 → 1,000 + 500; 70 kg, Hb
  12 → 1,000 + 500; Hb 15 → "no data." Monoferric 45 kg → 900 mg. Feraheme second dose on day 2 →
  too early. INFeD: male 70 in, Hb 9, desired 14.8 → LBW 73 kg; mL = 0.0442 × 5.8 × 73 + 0.26 × 73
  = 37.7 mL; actual weight 60 kg → uses 60. Blood loss 500 mL at hematocrit 20% → 2 mL.
- **`lamotrigine-titration-calendar`.** Valproate branch week 1 shows doses on alternate days
  only. Inducer branch bipolar week 7 "up to 400." XR, neither branch, week 6 → 150 mg (not the
  immediate-release 200 mg). Child 20 kg on valproate → Table 3 row 14.1–27 kg: 2 mg daily, then 4
  mg. Child 14.05 kg → between printed rows, both shown. A restart after a long gap shows the
  5-half-life rule and does not resume mid-schedule. Blank branch refuses (no default column).
- **`label-titration-calendar`.** Varenicline start Monday → 1 mg twice daily begins the next
  Monday. Apremilast day 3 = 10 AM / 20 PM. ACE inhibitor last dose 08:00 → sacubitril/valsartan no
  earlier than 20:00 the next day. A search for semaglutide → link to `glp1-titration-check`, no
  preset.
- **`aed-formulation-switch`.** Depakote 1,125 → ER 1,250; 1,750 → 2,000; 2,875 → 3,250; 1,000 →
  1,250 with the asterisk caution; 3,250 → above the table, "insufficient data"; 900 → not a
  printed row. Phenytoin sodium 300 mg → 276 mg phenytoin acid content. Fosphenytoin output is in
  mg PE only.
- **`transplant-formulation-switch`.** Tacrolimus 5 mg twice daily → Envarsus 8 mg daily. Neoral →
  Sandimmune → warning, no dose. Myfortic 720 mg ↔ MMF 1,000 mg shows MPA content, never "switch to."
- **`label-formulation-switch`.** Digoxin 125 mcg tablet → 100 mcg IV. Carvedilol 25 mg twice
  daily, age 70 → table row 80 mg plus the label's recommended lower start, 40 mg. Methylphenidate
  20 mg three times daily, age 10 → 72 mg row blocked by the age note.
- **`levothyroxine-start-dose`.** 70 kg adult → 112 mcg. 4-month-old, 6 kg → 48–60 mcg. Geriatric →
  "lower; the label gives no number." Exactly 3 months → both rows.
- **`lai-antipsychotic-start`.** Oral paliperidone 6 mg → Sustenna 117 mg; 3 mg → the 39–78 mg
  range, not one number. Sustenna 156 mg → Trinza 546 mg; 39 mg → "not studied." Aripiprazole 15
  mg/day → all three Aristada options; 12 mg/day → not a table row. Maintena → both initiation
  options with their dates; a missed-dose question → link to `lai-antipsychotic-missed-dose`.
- **`vitamin-iu-converter`.** Vitamin D 2,000 IU → 50 mcg. Vitamin A 5,000 IU retinol → 1,500 mcg
  RAE; dietary beta-carotene → 250. Vitamin E 30 IU natural → 20.1 mg; synthetic → 13.5 mg.
  Vitamin A with no form selected refuses. Folic acid 400 mcg → 680 mcg DFE (170% of the Daily
  Value).
- **`ppi-omeprazole-equivalent`.** Pantoprazole 40 mg → 9.2 mg; esomeprazole 20 → 32; rabeprazole
  20 → 36.4. Dexlansoprazole → not offered.
- **`antidepressant-fluoxetine-equivalent`.** Sertraline 98.5 → 40; escitalopram 10 → 22.2;
  citalopram → not in the source.
- **`statin-ldl-reduction`.** Atorvastatin 40 → −48%; baseline 160 → 83.2. Rosuvastatin 80 → no
  such row. Pravastatin 80 → not in this table. No intensity label appears.
- **`levodopa-equivalent-dose`.** Levodopa 150 mg four times daily → 600. Controlled-release 100
  mg → 75. Rytary 95 mg twice daily → 95. Pramipexole salt 1 mg three times daily → 300.
  Rotigotine 4 mg → 121.2. Levodopa 100 mg three times daily + entacapone with each dose → 300 +
  99 = 399 (the paper rounds to 400). Levodopa 150 mg four times daily + opicapone → 600 + 300 =
  900. Levodopa 100 mg three times daily + istradefylline → 300 + 60 = 360. Safinamide 50 and 100
  mg both → 150. Trihexyphenidyl without the confirmation → not added.
- **`hf-gdmt-target-percent`.** Metoprolol succinate 100 mg daily → 50%. Carvedilol 12.5 mg twice
  daily → 50% of 25 mg twice daily and 25% of 50 mg twice daily, both shown. Lisinopril 10 mg →
  50% and 25%. Sacubitril-valsartan 49/51 mg twice daily → 50%. Dapagliflozin 10 mg → 100%.
  Digoxin → not scored. A drug outside the table → not offered.
- **Staleness, all label tools.** Per [spec-v1628 §1](spec-v1628.md): each preset stores the set
  id, version and published date; the weekly watch flags a new version; until the changed edition
  is re-read the tool fails closed for that product and says which edition it last verified.

## Build status

Not started. Specified October 10, 2026.
