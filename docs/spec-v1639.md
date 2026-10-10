# spec-v1639 — The community pharmacy counter: quantities, label schedules, OTC label doses and patient-facing clocks

**Status:** Proposed, October 10, 2026. Specs only; nothing here is built. 15 new tools (1 build-gated), 7 backfills.
**Charter:** [spec-v1627](spec-v1627.md). **Machinery:** [spec-v1628](spec-v1628.md). **Ledger:** [scope-pharmacy-practice.md](scope-pharmacy-practice.md).

A community pharmacist, the technician at the fill station, and the patient or caregiver on the
other side of the counter all do the same small sums many times a day: how many pens cover 90
days, how many bottles a 10-day course needs, whether a depot injection is still inside its
window, what the label says about a dose missed on Tuesday, which line of the children's dosing
chart a 40 lb child falls on. This wave gives them 15 tools and 7 backfills. Every figure comes
from a label read on DailyMed, a federal monograph, a CDC recommendation or the original paper.
Each tool reports that figure with its source and stops; none says "give X."

## Gap finder

**Method.** (1) Every group Q tool and every group F, I and N tool in the catalog was listed,
then the whole catalog was searched by 30 synonym sets (acetaminophen, tylenol, ibuprofen, mg/kg,
insulin, inhaler, puff, epinephrine, contracept, missed, pill, depo, nicotine, taper, fingertip,
topical, long-acting, injectable, paliperidone, naltrexone, buprenorphine, reconstitut, discard,
refriger, room temp, time zone, travel, home blood pressure, GMI, time in range, INR, fluoride,
rehydration, loperamide, cough, OTC, pyrantel, lice, calendar, organizer, missed dose, DOAC,
semaglutide, alendronate, test strip, pen needle, patch, oral syringe, quantity, bottle, drops).
(2) The source of the close neighbors was read: `lib/days-supply-v1511.js`, `lib/clinical-v8.js`
(`peds-dose`), `views/group-f.js` (`apap-24h-max`), `lib/dose-calendar-v1512.js`,
`lib/cgm-time-in-range-v1472.js`. (3) Two registers were enumerated for companions: the DailyMed
labels of every long-acting injectable with a missed-dose section, and the federal OTC monographs
(M013 at FDA; 21 CFR parts 341 and 357 in the eCFR).

**Confirmed absent from the catalog.** There is no contraception tool except `pearl-index`, no
emergency-contraception tool, no nicotine-replacement tool (only `fagerstrom-ftnd` and
`pack-years`), no home blood-pressure averaging (only `bp-categories`), no epinephrine device
tool (only mg/kg in `peds-weight-dose` and `peds-dose`), and no travel-dosing tool. No tool id
below is live, and none is specified in another spec of this program.

**Live in this domain:** `days-supply`, `refill-eligible-date`, `med-sync-plan`, `dose-calendar`,
`quantity-limit-check`, `vial-rounding`, `apap-24h-max`, `peds-dose`, `peds-weight-dose`,
`weight-dose`, `dose-volume`, `time-to-dose`, `conc-percent`, `unit-converter`,
`peds-weight-conv`, `opioid-mme`, `steroid-equiv`, `naloxone`, `pef-zones`, `gmi`,
`cgm-time-in-range` (already checks %CV against 36%), `eag-a1c`, `rosendaal-ttr`,
`imci-ors-plan`, `imci-oral-drug-bands`, `iron-supplement-who`, `fagerstrom-ftnd`, `pack-years`,
`bp-categories`.

| Proposed | Live neighbor | Difference |
|---|---|---|
| `quantity-to-dispense` | `days-supply` | The reverse: sig + days → quantity, whole packages and leftover. `days-supply` takes a quantity and returns days |
| `topical-quantity-ftu` | none (`days-supply` has no topical form) | Grams from body areas, applications a day and days, using the 1991 fingertip-unit counts |
| `oral-suspension-course` | `days-supply` (liquid) | Bottles for a course, the leftover, and the discard date after mixing; `days-supply` returns only days |
| `depot-injection-window` | `dose-calendar` | `dose-calendar` takes the reader's window. This carries the label's and CDC's windows for five products and says which side of each line a date falls |
| `lai-antipsychotic-missed-dose` | `dose-calendar`, `chlorpromazine-equivalents` | A label algorithm keyed on time since the last injection; neither neighbor has one |
| `missed-dose-label-rule` | `time-to-dose` | `time-to-dose` lays out clock times. This applies the label's take-or-skip rule to a missed dose |
| `contraceptive-missed-pill` | `pearl-index` only | New |
| `emergency-contraception-window` | none | New |
| `contraception-start-backup` | none | New |
| `otc-child-label-dose` | `peds-dose` (mg/kg ranges), `imci-oral-drug-bands` (WHO, under 5) | The U.S. Drug Facts chart band and the mL or tablets for the product in hand; `peds-dose` gives a mg/kg range with no product |
| `otc-daily-max-check` | `apap-24h-max` | Same shape for the other OTC actives; acetaminophen stays in the live tool |
| `nrt-step-schedule` | `fagerstrom-ftnd` | The Drug Facts starting strength and a dated step-down calendar, not a dependence score |
| `epinephrine-device-weight-band` | `peds-weight-dose` (0.01 mg/kg IM) | Which labeled device strength covers a weight, per product label |
| `out-of-fridge-discard-date` | `days-supply` (reader-entered discard cap), `compounding-bud` | A dated clock from the label's room-temperature and in-use limits |
| `fluoride-supplement-schedule` | none | New (build-gated) |

## Tools

All group **Q** unless marked. Patients and caregivers open these tools, so the output posture of
[spec-v1628](spec-v1628.md) §5 and §7 binds every one: the result is the source's row, close to
verbatim, with the product and edition named; where the label says "do not use" or "ask a
doctor," that sentence is the result; nothing is derived from a rule of thumb, an adult dose or
another product's label. Every result ends with the line *"This is what the label (or CDC, or the
monograph) states for these inputs. It is not advice for a particular patient."*

**Label rows.** Tools 4–6 and 10–14 answer from tables read off FDA labels. Each row follows the
label-edition contract in [spec-v1628](spec-v1628.md) §1: the NDA or BLA holder's DailyMed set id
plus `spl_version` and `published_date` (not the `effectiveTime` inside the XML), a weekly watch
on `history.json`, and fail closed when the section's text changes or `validThrough` passes. A
row that has failed closed shows which version it was read from and the DailyMed link, and the
tool computes only from the reader's own figures. The versions read on October 10, 2026 are in
the label register under Research record.

### 1. `quantity-to-dispense` — Quantity to Dispense

**Input.** Days supply wanted, and by form:

| Form | Inputs |
|---|---|
| Tablets, capsules | units per dose (halves and quarters allowed), doses per day |
| Taper | up to 12 steps: units per dose, doses per day, days at that step |
| Oral liquid | dose mL, doses per day, optional package sizes in mL |
| Insulin | units per day, injections per day, priming units per injection (the label's figure), units per mL, mL per pen or vial, pens per box, optional in-use discard days |
| Inhaler | puffs per dose, doses per day, actuations per canister, optional priming puffs |
| Eye drops | drops per eye per dose, eyes, doses per day, drops per mL (reader input), bottle mL |
| Patches | change interval in days or hours, patches worn at once, patches per box |
| Countable supplies (test strips, lancets, pen needles, nebulizer vials) | uses per day, units per box |

**Compute.** Quantity = daily use × days, rounded **up** to the dispensable unit. For a taper,
the sum over steps of units × doses × days (the days supply is the sum of step days). For
insulin, daily units = units per day + priming × injections per day; pens = ceiling(daily units ×
days ÷ units per pen); when an in-use discard limit is entered, pens = max(that, ceiling(days ÷
discard days)); boxes = ceiling(pens ÷ pens per box). Split tablets: whole tablets = ceiling of
the total. Patches = ceiling(days × 24 ÷ change hours) × patches worn.
**Output.** The quantity, the whole packages, the leftover, the days the rounded quantity really
covers, and the arithmetic. With package sizes entered, the smallest package (or combination of
one size) that covers the days.
**Source.** Arithmetic on the prescription and the label, the same footing as `days-supply`
([spec-v1511](spec-v1511.md)). The tool supplies no number: priming units, drops per mL,
actuations, package sizes and whether a payer requires whole boxes are reader input.
**Note.** The tool never assumes a drops-per-mL figure (the rejection in
[spec-v1511](spec-v1511.md) stands) or a priming figure. It names the binding constraint, as
`days-supply` does.

### 2. `topical-quantity-ftu` — Topical Quantity by Fingertip Units (Adults)

**Input.** Body areas treated (face and neck; front of trunk; back of trunk; one arm and
forearm; one hand; one leg and thigh; one foot — each selectable, limbs once or twice),
applications per day, days, sex (sets grams per unit), and optional tube sizes.
**Compute.** Fingertip units per application from Long & Finlay 1991: face and neck 2.5, front
of trunk 6.7, back of trunk 6.8, arm and forearm 3.3, hand 1.2, leg and thigh 5.8, foot 1.8.
Grams = units × 0.49 g (male) or 0.43 g (female). Total = grams per application × applications
per day × days. Tubes = ceiling(total ÷ tube size).
**Output.** Fingertip units per application, grams per application, grams for the course, tubes,
and the paper's standard deviations beside each area (face and neck ±0.8, front of trunk ±1.7,
back of trunk ±1.2, arm and forearm ±1.0, hand ±0.4, leg and thigh ±1.7, foot ±0.6). The result
says these are means measured in 30 adults, not a prescribing rule, and that the prescriber's
directions decide the amount.
**Source.** Long CC, Finlay AY. The finger-tip unit: a new practical measure. *Clin Exp
Dermatol* 1991;16:444-7 (PMID 1806320; area counts and standard deviations read in the
abstract). Gram weights 0.49 g and 0.43 g as restated, citing Long & Finlay and Finlay 1989, in
an open-access paper (PMC5874822).
**Scope.** Adults. The children's table (Long, Mills & Finlay 1998) is behind a paywall and was
not read; see Verify at build.

### 3. `oral-suspension-course` — Oral Suspension: Bottles for a Course and Discard Date

**Input.** Dose in mL (or dose in mg with the label's mg per 5 mL), doses per day, days of
therapy, bottle sizes stocked (mL after mixing), the date mixed, and the label's "discard after
N days" figure.
**Compute.** Volume needed = dose mL × doses per day × days. Bottles = the smallest combination
of one size that covers it; leftover = dispensed − needed. Discard date = date mixed + N days.
If the course runs past the discard date, the tool says how many days of the course fall after
it and that a second bottle mixed later is needed (bottle 2 is mixed on or before the day
bottle 1 is discarded).
**Output.** mL needed, bottles and sizes, leftover mL, the discard date, and whether the course
outlasts the first bottle.
**Source.** Arithmetic on the prescription; the discard figure and the water to add are on each
product's label and are reader input. No preset: products differ and no suspension label was
read for this spec.

### 4. `depot-injection-window` — Depot Injection: Next Due Date and Window

**Input.** Product, date of the last injection, and (optionally) today's or the planned date.
**Compute.** Per product, from the label unless marked CDC:

| Product | Due | Lines the tool reports |
|---|---|---|
| Medroxyprogesterone 150 mg IM (Depo-Provera CI) | every 3 months (13 weeks) | Label: "If the time interval between injections is greater than 13 weeks, the physician should determine that the patient is not pregnant before administering the drug." CDC 2024: up to 2 weeks late (15 weeks from the last injection) without additional contraceptive protection; more than 15 weeks, the injection may be given if it is reasonably certain the patient is not pregnant, then 7 days of abstinence or barrier methods. Early injection: "may be administered early when necessary"; no time limit (CDC) |
| Medroxyprogesterone 104 mg SC (depo-subQ provera 104) | every 12 to 14 weeks | Label: "If more than 14 weeks elapse between injections, confirm that the patient is not pregnant before the next injection." CDC's lines are written for DMPA by either route and are shown as above |
| Naltrexone ER 380 mg (Vivitrol) | "every 4 weeks or once a month" | The label states no window and no missed-dose rule; the tool prints both dates (28 days; one calendar month) and says so |
| Buprenorphine ER monthly (Sublocade) | monthly; maintenance doses at least 26 days apart | Earliest maintenance date = last + 26 days. The second injection "may be administered as early as one week after the first injection," so the 26-day line applies from the third injection on. Missed maintenance dose: the next dose as soon as possible, the following at least 26 days later. "Occasional delays in dosing up to 2 weeks are not expected to have a clinically significant impact on treatment effect" |
| Buprenorphine ER (Brixadi) weekly | 7 days | Window: up to 2 days before or after the weekly time point |
| Buprenorphine ER (Brixadi) monthly | 28 days | Window: up to 1 week before or after the monthly time point. Missed (either form): "as soon as practically possible" |

**Output.** The due date, the earliest and latest dates each source gives, where the planned
date falls, and each sentence with its source. For medroxyprogesterone the label and CDC lines
are shown side by side, never merged: they answer different questions (when to rule out
pregnancy; when back-up is needed). The tool does not say whether to give the injection.
**Source.** DailyMed labels (label register); CDC, *U.S. Selected Practice Recommendations for
Contraceptive Use, 2024* (MMWR Recomm Rep 2024;73(RR-3)), "Timing of Repeat Injections."

### 5. `lai-antipsychotic-missed-dose` — Long-Acting Injectable Antipsychotic: Window and Missed-Dose Rule

This tool is the single owner of missed long-acting injection rules for the program
([spec-v1633](spec-v1633.md) keeps only the starting dose in `lai-antipsychotic-start`).

**Input.** Product; date of the last injection; today's date; and the product-specific facts
the label's table needs: for Invega Sustenna, whether the missed dose is the second initiation
dose or a maintenance dose, and the stabilized dose; for Erzofri, the stabilized dose; for Invega
Trinza, Invega Hafyera and Aristada, the last dose; for Abilify Maintena, which dose number was
missed.
**Compute.** Time since the last injection is placed in the label's band and the label's
instruction is printed.

*Paliperidone palmitate monthly (Invega Sustenna), section 2.3.* Window: second initiation dose
4 days before or after the one-week point; monthly doses up to 7 days before or after the
monthly point.
Missed second initiation dose (Table 2), by time since the first injection: less than 4 weeks →
156 mg deltoid as soon as possible, a third injection of 117 mg 5 weeks after the first
(regardless of the timing of the second), then monthly; 4 to 7 weeks → two 156 mg deltoid
injections one week apart, then monthly; more than 7 weeks → restart initiation (234 mg day 1,
156 mg one week later), then monthly.
Missed maintenance dose (Table 3), by time since the last injection: 4 to 6 weeks → resume at
the stabilized dose as soon as possible, then monthly; more than 6 weeks to 6 months → the
stabilized dose as soon as possible and again one week later (if stabilized on 234 mg, each of
those two is 156 mg), then the stabilized dose one month after the second; more than 6 months →
restart initiation (234 mg day 1, 156 mg one week later), then the stabilized dose one month
after the second injection.

*Paliperidone palmitate monthly (Erzofri), section 2.2.* Window: up to 7 days before or after
the monthly point. Table 2, by time since the last injection: 4 to 6 weeks → resume at the
stabilized dose as soon as possible, then monthly; more than 6 weeks to 6 months → the stabilized
dose as soon as possible and again one week later (if stabilized on 234 mg, each of those two is
156 mg), then the stabilized dose one month after the second; more than 6 months → restart
initiation with a single 351 mg deltoid injection on day 1, then the stabilized dose one month
later.

*Paliperidone palmitate 3-month (Invega Trinza), section 2.3.* Window: up to 2 weeks before or
after the 3-month point. More than 3½ months, up to but less than 4 months → the previous dose
as soon as possible, then every 3 months. 4 months up to and including 9 months → do not give
Trinza; re-initiate with Invega Sustenna on day 1 and day 8 (deltoid), then Trinza one month
after day 8 (Table 2):

| Last Trinza dose | Sustenna, day 1 and day 8 | Then Trinza |
|---|---|---|
| 273 mg | 78 mg and 78 mg | 273 mg |
| 410 mg | 117 mg and 117 mg | 410 mg |
| 546 mg | 156 mg and 156 mg | 546 mg |
| 819 mg | 156 mg and 156 mg | 819 mg |

More than 9 months → re-initiate with the monthly product per its label; Trinza after at least 4
months of adequate treatment with it.

*Paliperidone palmitate 6-month (Invega Hafyera), section 2.3.* Window: up to 2 weeks before or
3 weeks after the scheduled 6-month dose. More than 6 months and 3 weeks but less than 8 months →
do not give Hafyera; the monthly product once on day 1 (156 mg after 1,092 mg; 234 mg after
1,560 mg), then Hafyera one month after day 1 (Table 3). 8 months up to and including 11 months →
the monthly product 156 mg on day 1 and day 8 (both last-dose rows), then Hafyera one month after
day 8 (Table 4). More than 11 months → re-initiate with the monthly product per its label;
Hafyera after at least 4 months of adequate treatment with it.

*Aripiprazole lauroxil (Aristada), sections 2.2 and 2.3.* Early dosing: never earlier than 14
days after the previous injection. Missed dose: the next injection as soon as possible,
supplemented by last dose and time since it (Table 3; column mapping confirmed in the label's
table markup):

| Last dose | No supplementation required | Supplement with a single dose of Aristada Initio, or 7 days of oral aripiprazole | Re-initiate with a single dose of Aristada Initio and a single 30 mg oral dose, or supplement with 21 days of oral aripiprazole |
|---|---|---|---|
| 441 mg | ≤ 6 weeks | > 6 and ≤ 7 weeks | > 7 weeks |
| 662 mg | ≤ 8 weeks | > 8 and ≤ 12 weeks | > 12 weeks |
| 882 mg | ≤ 8 weeks | > 8 and ≤ 12 weeks | > 12 weeks |
| 1,064 mg | ≤ 10 weeks | > 10 and ≤ 12 weeks | > 12 weeks |

Table footnote: the oral supplement is the same oral aripiprazole dose the patient took when
Aristada was begun.

*Aripiprazole monthly (Abilify Maintena), section 2.3.* Second or third dose missed: more than 4
and less than 5 weeks → as soon as possible; more than 5 weeks → restart with the 1-day or 14-day
initiation. Fourth or later dose missed: more than 4 and less than 6 weeks → as soon as possible;
more than 6 weeks → restart with the 1-day or 14-day initiation.

*Aripiprazole 2-month (Abilify Asimtufii), section 2.3.* More than 8 and less than 14 weeks → as
soon as possible, then every 2 months; more than 14 weeks → restart with the 1-day or 14-day
initiation.

*Risperidone SC (Uzedy, section 2.4; Perseris, section 2).* "Administer the next ... injection as
soon as possible." Uzedy adds "Do not administer more frequently than recommended." No band
table; the tool prints the sentence and the next regular date.

**Output.** The band, the label's instruction quoted, the dates it implies (as-soon-as-possible
date, the one-week-later date, the next regular date), the date on which the answer changes to
the next band, and the label's section number. The tool reports the label's row; it does not
choose a regimen.
**Source.** DailyMed labels, section 2 "Missed Doses" of each (label register).
**Edges.** Several labels leave a boundary undefined: Maintena says "more than 4 weeks and less
than 5" and "more than 5," so exactly 5 weeks (and exactly 6 for later doses) is in neither;
Asimtufii leaves exactly 14 weeks open; Trinza and Hafyera count in months and half-months with
no day definition. Weeks are 7 days. Months are counted as calendar months, the elapsed time is
shown in both days and months, and at any exact boundary or within 3 days of a month-based one
the tool prints both neighboring instructions and says the label does not define the edge
([spec-v1628](spec-v1628.md) §5 rule 4). It never picks silently.
**Scope.** Renal and CYP adjustments in the same labels belong to
[spec-v1632](spec-v1632.md). Risperdal Consta and Rykindo state no missed-dose rule in section 2
(Consta section 2.5: "There are no data to specifically address reinitiation of treatment") and
are listed as "the label states no rule."

### 6. `missed-dose-label-rule` — Missed Dose: What the Label Says

This tool is the single owner of missed-dose rules for oral and self-injected products,
including the GLP-1 products (`glp1-titration-check` in [spec-v1632](spec-v1632.md) keeps dose
escalation only).

**Input.** Product and regimen; when the dose was due and the time now (dates for weekly and
monthly products, date and time for daily ones); the next scheduled dose; for liraglutide, the
date of the last dose taken.
**Compute.** The label's rule, evaluated on the times entered:

| Product | Rule on the label |
|---|---|
| Apixaban (Eliquis) | As soon as possible on the same day, then twice-daily administration resumed. Not doubled |
| Rivaroxaban (Xarelto), adults | 2.5 mg twice daily: a single 2.5 mg dose at the next scheduled time. 15 mg twice daily: immediately, to reach 30 mg that day; two 15 mg tablets may be taken at once. 20, 15 or 10 mg once daily: immediately; not doubled within the same day |
| Dabigatran capsules (Pradaxa) | As soon as possible on the same day; skipped if it cannot be taken at least 6 hours before the next scheduled dose. Not doubled |
| Edoxaban (Savaysa) | As soon as possible on the same day; resume the next day. Not doubled |
| Semaglutide injection (Ozempic) | As soon as possible within 5 days after the missed dose; more than 5 days, skip and resume on the regular day |
| Semaglutide injection (Wegovy) | Next scheduled dose more than 2 days (48 hours) away: as soon as possible. Less than 2 days away: do not administer; resume on the regular day. Two or more consecutive doses missed: "reinitiate dosage escalation at a lower dosage" (the label names no dose; the tool prints the sentence) |
| Semaglutide tablets (Rybelsus; Wegovy tablets) | Skip; next dose the following day |
| Tirzepatide (Mounjaro; Zepbound) | As soon as possible within 4 days (96 hours) after the missed dose; more than 4 days, skip. Patient labeling: not 2 doses within 3 days (72 hours) of each other |
| Dulaglutide (Trulicity) | As soon as possible if at least 3 days (72 hours) remain until the next scheduled dose; less than 3 days, skip |
| Liraglutide (Victoza) | Resume with the next scheduled dose; no extra dose and no increased dose. More than 3 days since the last dose: the label says to reinitiate at 0.6 mg once daily, titrated at the prescriber's discretion |
| Liraglutide (Saxenda) | Resume with the next scheduled dose; no extra dose and no increased dose. More than 3 days since the last dose: the label says to reinitiate at 0.6 mg daily and follow the escalation schedule |
| Alendronate weekly (Fosamax) | One dose on the morning after it is remembered; not two on the same day; return to the chosen day |
| Risedronate 35 mg weekly (Actonel; Atelvia) | One tablet on the morning after it is remembered; not two on the same day; return to the chosen day |
| Risedronate 150 mg monthly (Actonel) | Next scheduled dose more than 7 days away: the morning after it is remembered. Within 7 days: wait. Not more than one 150 mg tablet within 7 days |
| Risedronate 75 mg on two consecutive days monthly (Actonel) | More than 7 days away: both missed, one tablet the morning after it is remembered and the other the next morning; one missed, that tablet the morning after it is remembered. Within 7 days: wait. Not more than two 75 mg tablets within 7 days |
| Ibandronate 150 mg monthly | Next scheduled day more than 7 days away: the morning following the date it is remembered. Only 1 to 7 days away: wait for the next month's scheduled day |

**Output.** "The label says take" or "the label says skip," the deadline that decided it
("Trulicity: 72 hours before Friday's 8:00 am dose is Tuesday 8:00 am; it is now Wednesday, so
the label says skip"), the date of the next regular dose, the quoted sentence, and the product
and label edition. Nothing beyond the label's sentence is added.
**Source.** DailyMed labels, section 2 of each (label register).
**Scope.** Only products whose label states a rule that turns on a time. Levothyroxine
(Synthroid) has no missed-dose statement in its label and is listed as "the label states no
rule." Xarelto's pediatric rules (once, twice and three times a day) are in the label but left
out of version 1. Exenatide extended-release (Bydureon BCise) is not included: no current label
was found on DailyMed on October 10, 2026.
**Edges.** Wegovy leaves exactly 2 days before the next dose in neither band, and Trulicity's "at
least 3 days" and "less than 3 days" meet at exactly 72 hours (take side). The tool follows each
label's wording and prints both rows where the label leaves a gap.

### 7. `contraceptive-missed-pill` — Late or Missed Birth Control Pill (CDC 2024)

**Input.** Pill type (combined; norethindrone or norgestrel progestin-only; drospirenone
progestin-only), when the pill was due and the time now, how many consecutive hormonal pills
were missed, which week of hormonal pills, and whether unprotected intercourse occurred in the
previous 5 days.
**Compute.** CDC's definitions and actions (Figures 1 and 5, read on the figures themselves):
- *Definitions (combined and drospirenone pills).* Late = less than 24 hours since the pill
  should have been taken; missed = 24 hours or more. The recommendations apply to hormonally
  active pills only, not placebo pills.
- *Combined pill, one pill late (under 24 hours) or one pill missed (24 to under 48 hours).* Take
  the late or missed pill as soon as possible. Continue the remaining pills at the usual time
  (even if that means two pills on the same day). No additional contraceptive protection is
  needed. Emergency contraception "is not usually needed but may be considered (with the
  exception of UPA) if hormonal pills were missed earlier in the cycle or during the last week of
  hormonal pills in the previous cycle."
- *Combined pill, two or more consecutive pills missed (48 hours or more).* Take the most recent
  missed pill as soon as possible (any other missed pills are discarded). Continue the remaining
  pills at the usual time (even if that means two pills on the same day). Abstain or use barrier
  methods until hormonal pills have been taken for 7 consecutive days. If the pills were missed
  in the last week of hormonal pills (for example days 15–21 of a 28-day pack): omit the
  hormone-free interval by finishing the hormonal pills in the current pack and starting a new
  pack the next day; if a new pack cannot be started immediately, abstain or use barrier methods
  until hormonal pills from a new pack have been taken for 7 consecutive days. Emergency
  contraception "should be considered (with the exception of UPA) if hormonal pills were missed
  during the first week and unprotected sexual intercourse occurred during the previous 5 days,"
  and "may also be considered (with the exception of UPA) at other times as appropriate."
- *Drospirenone pill, one pill late or missed (under 48 hours).* Take it as soon as possible;
  continue one pill a day until the pack is finished; no additional protection needed.
- *Drospirenone pill, two or more consecutive pills missed (48 hours or more).* Take the last
  missed pill as soon as possible; continue one pill a day until the pack is finished (one or
  more missed pills will remain in the pack); abstain or use barrier methods until hormonal pills
  have been taken for 7 consecutive days; the same two emergency-contraception sentences as the
  combined pill. CDC gives no last-week rule for drospirenone.
- *Norethindrone or norgestrel pill.* Missed = more than 3 hours since the pill should have been
  taken. Take one pill as soon as possible; continue daily at the same time, even if that means
  two pills on the same day; abstain or use barrier methods until pills have been taken
  correctly, on time, for 2 consecutive days. Emergency contraception "should be considered (with
  the exception of UPA) if the patient has had unprotected sexual intercourse."

**Output.** Late or missed, CDC's action list for that branch, and the date back-up ends. Every
result states two things in plain words: (1) the source is CDC's 2024 U.S. Selected Practice
Recommendations, not the product's label; (2) the product's own label may say otherwise (many
combined-pill labels direct two pills a day for two days), and the patient information in the
pack is the label's instruction. The tool does not choose between them.
**Source.** CDC, *U.S. Selected Practice Recommendations for Contraceptive Use, 2024* (MMWR
Recomm Rep 2024;73(RR-3); PMC11340200), "Late or Missed Doses and Side Effects from CHC Use"
(Figure 1) and "Missed POPs" (Figure 5).
**Note.** The Opill label (more than 3 hours late: back-up for the next 2 days, 48 hours) and the
Slynd label (one tablet missed: no back-up; two or more: back-up for 7 days) agree with CDC's
figures for the progestin-only pills. See Owner decisions.

### 8. `emergency-contraception-window` — Emergency Contraception: Hours Left on the Label

**Input.** Date and time of unprotected intercourse; time now.
**Compute.** Hours elapsed, against each source's line, shown side by side:
- Levonorgestrel 1.5 mg (Plan B One-Step Drug Facts): "as soon as possible within 72 hours
  (3 days) after unprotected sex."
- Ulipristal 30 mg (ella label): "as soon as possible within 120 hours (5 days)."
- CDC 2024: emergency contraceptive pills "should be taken as soon as possible within 5 days of
  unprotected sexual intercourse"; a copper IUD may be placed within 5 days of the first act.
  CDC's 5-day line for levonorgestrel is longer than the Plan B label's 72 hours; both are
  printed, labeled, and neither is preferred.

Follow-on dates. After ulipristal: the ella label and CDC both say hormonal contraception is
started or resumed "no sooner than 5 days" after it; the label says to use a reliable barrier
method until the next menstrual period; CDC says abstinence or barrier methods for 7 days after
starting or resuming, or until the next menses, whichever comes first. After levonorgestrel
(CDC): any regular method may be started or resumed immediately, with abstinence or barrier
methods for 7 days. Both (CDC): a pregnancy test if no withdrawal bleed within 3 weeks.
Vomiting: within 2 hours of Plan B, the label says to call a healthcare professional to find out
whether to repeat the dose; within 3 hours of ella, the label says "consider repeating the dose";
CDC says another dose should be taken as soon as possible after vomiting within 3 hours of any
emergency contraceptive pill.
**Output.** For each product: inside or outside the labeled window, the date and time the
window closes, and the follow-on dates, each with its source.
**Source.** Plan B One-Step Drug Facts and ella label (DailyMed); CDC SPR 2024, "Emergency
Contraception."
**Scope.** The copper IUD is a clinic procedure; the tool prints CDC's 5-day line for it and
nothing more. CDC's 2024 text lists the copper IUD and three pill regimens as emergency
contraception; it does not list the levonorgestrel IUD. No weight or BMI statement is computed
(CDC notes levonorgestrel "might be less effective than UPA among women with obesity" without a
threshold).

### 9. `contraception-start-backup` — Starting a Contraceptive: Days of Back-Up (CDC 2024)

**Input.** Method, and days since menstrual bleeding started on the start date.
**Compute.** From CDC 2024, "Need for Back-Up Contraception" under each method:

| Method | No back-up if started within | Otherwise back-up for |
|---|---|---|
| Combined pill, patch or ring | first 5 days since bleeding started | 7 days |
| Norethindrone or norgestrel progestin-only pill | first 5 days | 2 days |
| Drospirenone progestin-only pill | first day of bleeding | 7 days |
| Medroxyprogesterone injection | first 7 days | 7 days |
| Implant | first 5 days | 7 days |
| Levonorgestrel IUD | first 7 days | 7 days |

**Output.** Whether CDC says back-up is needed and the date it ends, with the statement that the
source is CDC and the product's label may differ. It also prints CDC's Box 3 list ("How to be
reasonably certain that a patient is not pregnant") as the basis for "may be started at any time
if reasonably certain," without scoring it.
**Source.** CDC SPR 2024 (PMC11340200).
**Scope.** Menstruating, not postpartum, not post-abortion, not switching. CDC's other branches
(amenorrhea, postpartum by breastfeeding status, switching from an IUD) are stated as "see CDC"
in version 1; adding them is a later backfill, each with its own tests.

### 10. `otc-child-label-dose` — Children's OTC Dose From the Drug Facts Chart

**Input.** Product (from the list below), the child's weight in pounds or kilograms and/or age.
**Compute.** The chart's own instruction is followed: "If possible, use weight to dose;
otherwise, use age."

| Product (strength on the label) | Chart | Repeat and daily limit |
|---|---|---|
| Acetaminophen suspension 160 mg per 5 mL (Children's Tylenol) | under 24 lb or under 2 years: ask a doctor; 24–35 lb (2–3 y) 5 mL; 36–47 lb (4–5 y) 7.5 mL; 48–59 lb (6–8 y) 10 mL; 60–71 lb (9–10 y) 12.5 mL; 72–95 lb (11 y) 15 mL | every 4 hours while symptoms last; not more than 5 times in 24 hours |
| Acetaminophen suspension 160 mg per 5 mL (Infants' Tylenol) | under 24 lb or under 2 years: ask a doctor; 24–35 lb (2–3 y) 5 mL. The chart has no other row | same |
| Acetaminophen chewable 160 mg (Children's Tylenol) | same bands as the suspension: 1, 1½, 2, 2½, 3 tablets | same |
| Ibuprofen suspension 100 mg per 5 mL (Children's Motrin) | under 24 lb or under 2 years: ask a doctor; then the same weight and age bands: 5, 7.5, 10, 12.5, 15 mL | every 6–8 hours if needed; not more than 4 times a day |
| Ibuprofen chewable 100 mg (Children's Motrin) | same bands: 1, 1½, 2, 2½, 3 tablets | same |
| Ibuprofen concentrated drops 50 mg per 1.25 mL (Infants' Motrin) | under 6 months: ask a doctor; 12–17 lb (6–11 months) 1.25 mL; 18–23 lb (12–23 months) 1.875 mL | same |
| Diphenhydramine liquid 12.5 mg per 5 mL (Children's Benadryl Allergy) | under 2 years: do not use; 2 to 5 years: do not use unless directed by a doctor; 6 to 11 years: 5 mL to 10 mL | every 4 to 6 hours; not more than 6 doses in 24 hours |
| Dextromethorphan polistirex ER, equivalent to 30 mg dextromethorphan HBr per 5 mL (Delsym) | under 4 years: do not use; 4 to under 6: 2.5 mL; 6 to under 12: 5 mL; 12 and over: 10 mL | every 12 hours; not more than 5, 10 and 20 mL in 24 hours |
| Loperamide 2 mg caplet / 1 mg per 7.5 mL (Imodium A-D) | under 2 years (up to 33 lb): do not use; 2–5 years (34 to 47 lb): ask a doctor; 6–8 years (48–59 lb): 1 caplet or 15 mL after the first loose stool, then ½ caplet or 7.5 mL after each later loose stool, not more than 2 caplets or 30 mL in 24 hours; 9–11 years (60–95 lb): same doses, not more than 3 caplets or 45 mL | as shown |
| Pyrantel pamoate chewable, 4 tablets = 1 g pyrantel base (pinworm) | single dose, 11 mg/kg (5 mg/lb), not over 1 g: less than 25 lb or under 2 years: do not use unless directed by a doctor; 25–37 lb ½ tablet; 38–62 lb 1; 63–87 lb 1½; 88–112 lb 2; 113–137 lb 2½; 138–162 lb 3; 163–187 lb 3½; 188 lb and over 4 | once; not repeated unless directed by a doctor |

**Output.** The chart row, the volume or tablets, the milligrams that is, the repeat interval
and 24-hour limit, and the product and label edition. Where weight and age point to different
rows it shows both and repeats the label's sentence about using weight. "Ask a doctor" and "do
not use" rows are returned as the answer, never replaced by a computed dose. Above the chart's
last row the tool says the chart ends there. For acetaminophen it adds, as a second line, the
monograph's **age-only** dose for the same age (M013.50(d)(2): 2 to under 4 years, 160 to
162.5 mg; 4 to under 6, 240 to 243.8 mg; 6 to under 9, 320 to 325 mg; 9 to under 11, 320 to
406.3 mg; 11 to under 12, 320 to 487.5 mg; every 4 hours while symptoms persist, not to exceed 5
doses in 24 hours; under 2 years: consult a doctor).
**Source.** Drug Facts labels on DailyMed (label register); FDA, OTC Monograph M013
§ M013.50(d); 21 CFR 357.150(d)(1) for pyrantel (the label's weight bands match the regulation's
schedule of 125 mg to 1,000 mg).
**Note.** The acetaminophen and ibuprofen weight bands are the manufacturer's chart; the federal
monograph for acetaminophen doses by age only. Ibuprofen is an approved-application product and
is not an active ingredient in M013. The tool says which is which. A concentration other than the
chart's (for example a store brand at a different strength) is refused, not scaled.
**Why this is safe as arithmetic.** It looks a child up in the chart printed on the carton and
does nothing a parent holding the carton is not asked to do. It has no mg/kg mode; `peds-dose`
keeps that for clinicians.

### 11. `otc-daily-max-check` — OTC 24-Hour Total Against the Label Maximum

**Input.** Active ingredient, strength per unit, units taken (or planned) in 24 hours, age
group, and for single doses the dose and interval.
**Compute.** Total mg in 24 hours against the stated maximum:

| Active | Adult (12 years and over) maximum in 24 hours | Source |
|---|---|---|
| Ibuprofen 200 mg | 6 capsules (1,200 mg) "unless directed by a doctor"; 1 every 4 to 6 hours, 2 if 1 does not work | Advil Liqui-Gels Drug Facts |
| Naproxen sodium 220 mg | 3 tablets (660 mg); 1 every 8 to 12 hours; not more than 2 in any 8- to 12-hour period; the first dose may be 2 within the first hour | Aleve Drug Facts |
| Aspirin 325 mg | 12 tablets (3,900 mg); 1 or 2 every 4 hours or 3 every 6 hours. Monograph: not to exceed 4,000 mg | Bayer Genuine Aspirin Drug Facts; M013.50(d)(2) |
| Loperamide 2 mg | 4 caplets (8 mg) or 60 mL of the 1 mg per 7.5 mL liquid | Imodium A-D Drug Facts |
| Diphenhydramine HCl (antihistamine) | 300 mg; 25 to 50 mg every 4 to 6 hours. Ages 6 to under 12: 150 mg (12.5 to 25 mg every 4 to 6 hours). Under 6: consult a doctor | 21 CFR 341.72(d)(7) |
| Dextromethorphan HBr | 120 mg (10 to 20 mg every 4 hours or 30 mg every 6 to 8 hours); ages 6 to under 12: 60 mg | 21 CFR 341.74(d)(1)(iii) |
| Dextromethorphan polistirex ER | 20 mL of the 30 mg per 5 mL suspension (120 mg) | Delsym Drug Facts |
| Guaifenesin (immediate release) | 2,400 mg (200 to 400 mg every 4 hours); ages 6 to under 12: 1,200 mg | 21 CFR 341.78(d) |
| Pseudoephedrine | 240 mg (60 mg every 4 to 6 hours); ages 6 to under 12: 120 mg | 21 CFR 341.80(d)(1)(ii) |
| Polyethylene glycol 3350 | 17 g once a day, not more than 7 days, ages 17 and over; 16 and under: ask a doctor | MiraLAX Drug Facts |

**Output.** The total, the maximum, over or under by how much, the single-dose and interval
check, and the source. The result states the label's or monograph's limit and stops; it does not
say a total is safe. Acetaminophen is sent to `apap-24h-max`.
**Note.** For ages 2 to under 6 the cough-and-cold regulation still prints doses for
dextromethorphan, guaifenesin and pseudoephedrine, while the Delsym label says "do not use" under
4. For diphenhydramine the regulation itself says "children under 6 years of age: consult a
doctor," and Children's Benadryl says "do not use" under 2 and "do not use unless directed by a
doctor" for 2 to 5. The tool follows the label for children under 6, prints the difference, and
never computes a cough-and-cold dose under 6.
**Scope.** OTC limits only. A prescription maximum is a different label and is not offered.

### 12. `nrt-step-schedule` — Nicotine Replacement: Label Strength and Step-Down Calendar

**Input.** Product (patch, gum or lozenge), cigarettes per day (patch), minutes from waking to
the first cigarette (gum, lozenge), quit date.
**Compute.**
- *Patch (NicoDerm CQ Drug Facts).* More than 10 cigarettes a day, 10-week schedule: 21 mg weeks
  1–6, 14 mg weeks 7–8, 7 mg weeks 9–10. 10 or fewer: 14 mg for 6 weeks, then 7 mg for 2 weeks.
  One new patch every 24 hours; worn 16 or 24 hours; not more than one patch at a time.
- *Gum and lozenge (Nicorette gum, Nicorette lozenge, Habitrol gum Drug Facts).* First cigarette
  within 30 minutes of waking: 4 mg; more than 30 minutes after waking: 2 mg. 12-week schedule:
  weeks 1–6 one piece every 1 to 2 hours; weeks 7–9 every 2 to 4 hours; weeks 10–12 every 4 to 8
  hours. At least 9 a day for the first 6 weeks. Gum: not more than 24 pieces a day. Lozenge: not
  more than 5 in 6 hours and not more than 20 a day.
**Output.** The label's starting strength, a dated calendar of steps from the quit date with the
end date, patches per step (42, 14, 14; or 42, 14), and for gum or lozenge the minimum and
maximum pieces per step so a quantity can be planned. Under 18: the label says "ask a doctor
before use," and the tool returns that sentence and no schedule.
**Source.** Drug Facts labels on DailyMed (label register).
**Note.** The patch program is **10 weeks** (8 for 10 or fewer cigarettes a day), not 12; only
gum and lozenge run 12.

### 13. `epinephrine-device-weight-band` — Epinephrine Auto-Injector or Nasal Spray: Label Strength by Weight (group I)

**Input.** Weight in kg or lb.
**Compute.**

| Product | 7.5 to under 15 kg | 15 to under 30 kg | 30 kg or more |
|---|---|---|---|
| Auvi-Q | 0.1 mg | 0.15 mg | 0.3 mg |
| EpiPen Jr / EpiPen | not labeled | 0.15 mg ("15 kg to 30 kg") | 0.3 mg ("greater than or equal to 30 kg") |
| neffy nasal spray | not labeled | one spray of 1 mg | one spray of 2 mg |

Second dose: Auvi-Q and neffy, "starting 5 minutes after the first dose" (neffy: same nostril,
new nasal spray). All three labels: more than two sequential doses of epinephrine under direct
medical supervision.
**Output.** The labeled strength for each product at that weight, or "the label does not cover
this weight," with the label sentence and edition. It names a labeled strength; it does not
select a product or tell the reader to give a dose.
**Source.** DailyMed labels (label register).
**Note.** The EpiPen label puts exactly 30 kg in both of its bands; the tool shows that instead
of choosing. This is a look-up with a computed band, kept because a wrong device at 14 kg or
30 kg is the error it prevents and no live tool carries device strengths.

### 14. `out-of-fridge-discard-date` — Out of the Refrigerator or In Use: Discard Date

**Input.** The date (and time, optional) the product left the refrigerator and/or was first
used; the label's limit in days. Presets fill the limit for the labels read below; any other
product is reader input.
**Compute.** Discard date = the start date + the limit, never later than the expiration date.
With both a room-temperature limit and an in-use limit, the earlier date binds and is named.

| Product | Limit read on the label |
|---|---|
| Insulin glargine (Lantus) vial or SoloStar pen | 28 days unopened at room temperature (up to 86°F); 28 days in use (pen: room temperature only) |
| Insulin lispro (Humalog U-100, U-200) | 28 days unopened at room temperature (up to 86°F); 28 days in use; at room temperature, 28 days **total** counting unopened and in-use time |
| Insulin aspart (NovoLog) vial, PenFill, FlexPen, FlexTouch | 28 days unopened at room temperature (up to 86°F); 28 days in use |
| Insulin glargine (Basaglar KwikPen, Tempo Pen) | 28 days unopened at room temperature (up to 86°F); 28 days in use, not refrigerated |
| Insulin glargine U-300 (Toujeo SoloStar, Max SoloStar) | 56 days in use, room temperature only (up to 86°F). No unopened room-temperature period on the label |
| Insulin degludec (Tresiba) | 56 days (8 weeks) |
| Semaglutide (Ozempic pen) | 56 days after first use, at 59°F to 86°F or refrigerated |
| Semaglutide (Wegovy single-dose pen or syringe) | up to 28 days at 46°F to 86°F before the cap is removed |
| Tirzepatide (Mounjaro, Zepbound) single-dose pen or vial | a total of 21 days unrefrigerated, not above 86°F |
| Tirzepatide (Mounjaro, Zepbound) KwikPen or multi-dose vial | unopened at room temperature: 30 days. Opened: a total of 30 days at room temperature, 30 days after first use, or after 4 weekly doses, whichever is first |
| Dulaglutide (Trulicity) | a total of 14 days at room temperature, not above 86°F |
| Liraglutide (Victoza; Saxenda) | 30 days after first use, at 59°F to 86°F or refrigerated |
| Teriparatide (Forteo) | 28 days after first use |
| Adalimumab (Humira) | up to 14 days at room temperature, up to 77°F |
| Etanercept (Enbrel) prefilled syringe, SureClick, single-dose vial, Mini cartridge | one period of up to 30 days at 68°F to 77°F; not returned to the refrigerator |
| Etanercept (Enbrel) multiple-dose vial dose tray | one period of up to 14 days at 68°F to 77°F; not returned to the refrigerator |
| Dupilumab (Dupixent) | 14 days, up to 77°F |
| Evolocumab (Repatha) | 30 days at 68°F to 77°F in the original carton |
| Buprenorphine ER (Sublocade) | up to 12 weeks at 59°F to 86°F in the original packaging before administration |

**Output.** The discard date, days left, the limit that bound, the temperature ceiling the label
attaches to it, and the label sentence with its edition.
**Source.** DailyMed labels, section 16 and patient instructions (label register).
**Scope.** The patient-facing label limit for a product at home. Opened containers in a pharmacy
or on a unit (multi-dose vials, bulk packages, lipid emulsions) belong to `in-use-discard-time`
in [spec-v1630](spec-v1630.md). Temperature excursions outside the label's range
(`storage-excursion-summary` in [spec-v1630](spec-v1630.md)) are refused here: the tool says the
label's limit assumes the stated ceiling and that the label gives no figure above it.

### 15. `fluoride-supplement-schedule` — Fluoride Supplement by Age and Water Fluoride (build-gated)

**Input.** Child's age; fluoride concentration of the main drinking water in ppm (reader input
from the water utility report or a well test).
**Compute.** The schedule in the AAPD best practice, mg fluoride per day:

| Age | under 0.3 ppm | 0.3 to 0.6 ppm | over 0.6 ppm |
|---|---|---|---|
| Birth to 6 months | 0 | 0 | 0 |
| 6 months to 3 years | 0.25 | 0 | 0 |
| 3 to 6 years | 0.50 | 0.25 | 0 |
| 6 to at least 16 years | 1.00 | 0.50 | 0 |

**Output.** The mg per day for that cell; the schedule's own caveat (not revised since municipal
water fluoride was standardized, and all dietary fluoride sources are to be considered first);
and FDA's position, shown beside it.
**Source.** American Academy of Pediatric Dentistry, *Fluoride Therapy*, best practice (latest
revision 2023; Reference Manual pages 372 onward), table "Dietary fluoride supplementation
schedule." CDC's 2001 fluoride recommendations (MMWR 2001;50(RR-14)) are reported to carry the
same schedule as Table 1, which is an image and was not read.
**Build gate.** On October 31, 2025 FDA announced enforcement notices against unapproved
ingestible fluoride prescription products "labeled for use in children under age 3 or older
children at low or moderate risk for tooth decay," and its scientific evaluation recommends
restricting these products "to children aged three years and older who are at high risk for
tooth decay." That conflicts with the schedule's 6-months-to-3-years cell (0.25 mg). Two primary
sources disagree, so the tool is not built until the owner decides (see Owner decisions); if
built, the FDA sentence is part of every result and the under-3 cell is returned as "AAPD
schedule: 0.25 mg; FDA: not for children under 3," never as a bare number.
**Licensing.** Twelve numbers from a professional society's table: facts, cited, no text
reproduced. The AAPD manual carries a copyright notice; the licensing screen in
[spec-v1628](spec-v1628.md) §6 applies.
**Edges.** The band edges (exactly 3 years, exactly 0.3 or 0.6 ppm) are not defined in the
table; the tool returns both neighboring cells at an edge.

## Backfills (live tools that should do more)

1. **`days-supply`: a run-out date and trip coverage.** With an optional start date it prints
   the date the supply runs out; with a departure and return date, the days short and the
   quantity that covers them (the vacation-override arithmetic). Also: an optional "priming
   puffs" field for inhalers, replacing today's note that priming is not counted, and a
   "doses left on the counter" mode (remaining actuations ÷ puffs per day).
2. **`days-supply`: PRN sigs.** A "maximum per day" switch that labels the result "at the
   maximum the sig allows," so a PRN supply is not read as a scheduled one.
3. **`dose-volume`: rounding to the measuring device.** An optional device increment (reader
   input: the syringe's or cup's marking) rounds the volume and shows the dose actually
   delivered and the percent change. No increment is assumed.
4. **`apap-24h-max`: name the source of each ceiling, and take more than three products.**
   4,000 mg is the monograph's figure (M013.50(d)(2)) and the figure in the Tylenol label's own
   liver warning. 3,000 mg is the Extra Strength Tylenol label's directions (2 caplets every 6
   hours, not more than 6 caplets in 24 hours, unless directed by a doctor), a manufacturer's
   choice, not a federal limit; Regular Strength Tylenol's directions are 10 tablets (3,250 mg).
   The live tool (`views/group-f.js`) offers "4000 mg (standard adult)," "3000 mg
   (conservative)" and "2000 mg (hepatic impairment / chronic alcohol use)" without saying where
   each comes from; 2,000 mg was not found in any source read and needs a source or a "reader's
   own limit" label. Add a child mode: not more than 5 doses in 24 hours. Indexed in
   [spec-v1641](spec-v1641.md).
5. **`peds-dose`: sources per row and a link to the chart tool.** In `lib/clinical-v8.js`
   (`PEDS_DOSE_PANEL`, lines 209–210) the acetaminophen row's note "Max 75 mg/kg/day" and
   ibuprofen's "Avoid age <6 mo, dehydration" carry no citation. The Infants' Motrin label
   supports "under 6 months: ask a doctor"; 75 mg/kg/day was not found in any source read
   (M013 and the Tylenol labels give no mg/kg figure) and should be sourced or removed. Indexed
   in [spec-v1641](spec-v1641.md).
6. **`refill-eligible-date`: link to the new quantity tool** and accept the run-out date from
   backfill 1.
7. **`dose-calendar`: label presets for repeating self-care schedules** (etonogestrel/ethinyl
   estradiol ring 3 weeks in, 1 week out; segesterone ring 21 days in, 7 out, 13 cycles) only if
   the owner wants them; the live tool already builds these from reader input.

## Rejected

| Idea | Why not |
|---|---|
| Missed or late contraceptive **patch and ring** rules | Label and CDC disagree on the number and the action. NuvaRing's label: back-up after more than 3 hours out. Annovera's: more than 2 continuous or cumulative hours. CDC: under 48 hours, no back-up. Xulane's label after more than 2 days late: a new cycle with a new change day; CDC: keep the same change day. Rule 6: skip |
| Sunscreen amount from 2 mg/cm² | 21 CFR 201.327(i) sets 2 mg/cm² as the **test** application density for SPF, not a direction for use. Turning it into teaspoons would present a lab condition as an instruction |
| Insulin dose adjustment across time zones | The published schemes (Chandran & Edelman 2003; Pinsker 2013) are expert advice that changes a dose. That prescribes; out by the site's posture |
| Medication schedule builder (sigs → a daily timetable) | No primary source for the layout, and food and spacing rules are judgment. `time-to-dose` already gives clock times for one sig |
| Pill-organizer fill plan | A restatement of the sig; no computed answer worth a page |
| Insulin syringe barrel or pen-needle length selection | Manufacturer facts with no primary rule; a table, not a tool |
| Methylprednisolone dose pack count | A fixed 21-tablet package: nothing to compute |
| Melatonin dose | A supplement with no federal dose |
| Vitamin D 400 IU for infants | One number; a fact, not a tool |
| Cough-and-cold dose for ages 2 to under 6 | The regulation prints doses for some actives; current labels say do not use or ask a doctor. Sources disagree; the checker follows the label and computes nothing under 6 |
| Loperamide package-size limits; FDA flush list | Facts about packaging and disposal with no input |
| Oral rehydration volumes; preventive iron | Live (`imci-ors-plan`, `cholera-rehydration`, `iron-supplement-who`) |
| CGM time in range, GMI, %CV | Live (`cgm-time-in-range` checks %CV against 36%; `gmi`) |
| OTC naloxone | Live (`naloxone`); the OTC label adds no computation |
| Permethrin for lice | The Nix label's only number is "if live lice are seen seven days or more after the first treatment, a second treatment should be given." A one-line date; too thin alone |
| INR self-testing schedule | No rule with numbers was found in a primary source |
| Levothyroxine missed dose | The Synthroid label states no rule (the full label was searched for "miss," "forget" and "skip") |
| Risperdal Consta, Rykindo, Vivitrol missed-dose algorithms | Their labels state none; Vivitrol appears in tool 4 with "the label states no window" |
| Exenatide ER (Bydureon BCise) missed-dose rule | No current label on DailyMed on October 10, 2026; nothing to read |
| Drops-per-mL presets, priming presets by product | The rejection in [spec-v1511](spec-v1511.md) stands: reader input |
| Home blood-pressure average (see Verify at build) | Held, not rejected on merit: the 2025 AHA/ACC guideline was not opened |
| Children's fingertip-unit table (Long, Mills & Finlay 1998) | Held: paywalled, not read |
| Famotidine, bismuth subsalicylate, simethicone, guaifenesin ER in the daily-maximum checker | Labels not read; add each only after its Drug Facts is read |
| Pseudoephedrine sales limits; renal dose checks; class tapers; compounding | Specified in [spec-v1637](spec-v1637.md), [spec-v1632](spec-v1632.md), [spec-v1633](spec-v1633.md) and [spec-v1629](spec-v1629.md) |

## Research record

Every DailyMed label was read from
`https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/<setid>.xml`, and its version history
from `.../spls/<setid>/history.json`, on October 10, 2026. Editions are dated by version and
published date under [spec-v1628](spec-v1628.md) §1.

| Finding | Where read | Effect on the spec |
|---|---|---|
| Depo-Provera CI: every 3 months (13 weeks); over 13 weeks, determine the patient is not pregnant. No 15-week figure on the label | Depo-Provera CI label, section 2.1 | The 15-week limit is CDC's, not the label's. Tool 4 shows both, separately |
| depo-subQ provera 104: every 12 to 14 weeks; over 14 weeks, confirm not pregnant | depo-subQ provera 104 label, section 2.1 | Tool 4 |
| CDC: repeat DMPA "up to 2 weeks late (15 weeks from the last injection)" without added protection; later, 7 days of back-up; early injection when necessary; WHO's 4-week grace period not adopted | https://www.ebi.ac.uk/europepmc/webservices/rest/PMC11340200/fullTextXML | Tool 4 |
| Invega Sustenna windows (±4 days, ±7 days), Tables 2 and 3; Invega Trinza window, 3½–4 months, Table 2, over 9 months; Invega Hafyera −2/+3 weeks, Tables 3 and 4, over 11 months | Labels, section 2.3 of each | Tool 5, every row re-read. The Hafyera window is asymmetric |
| Erzofri (paliperidone palmitate monthly, Luye): Table 2, with a single 351 mg re-initiation dose past 6 months | Erzofri label, section 2.2 | Added to tool 5 |
| Aristada Table 3: the label's XML table has four columns (last dose, then three time bands); the last row assigns "No Supplementation Required," "Supplement with a Single Dose of ARISTADA INITIO OR 7 Days of Oral Aripiprazole," and "Re-initiate with a Single Dose of ARISTADA INITIO and a Single Dose of Oral Aripiprazole 30 mg OR supplement with 21 Days of Oral Aripiprazole" to the bands in that order. Early dosing not earlier than 14 days | Aristada label, sections 2.2 and 2.3 | Tool 5. Column mapping confirmed; no longer a build question |
| Abilify Maintena: 4–5 weeks / over 5 (doses 2–3); 4–6 / over 6 (dose 4 on). Abilify Asimtufii: 8–14 weeks / over 14 | Labels, section 2.3 | Tool 5; exact-boundary gaps recorded |
| Uzedy and Perseris: "as soon as possible" only. Risperdal Consta and Rykindo: no missed-dose statement | Labels, section 2 | Tool 5 |
| Vivitrol: "every 4 weeks or once a month"; no window, no missed-dose rule | Vivitrol label, section 2.1 | Tool 4 prints both dates |
| Sublocade: maintenance at least 26 days apart; second injection as early as one week after the first; delays up to 2 weeks; 12 weeks at room temperature | Sublocade label, sections 2 and 16 | Tools 4 and 14. The one-week line for the second injection was added |
| Brixadi: weekly ±2 days, monthly ±1 week; monthly in 28-day intervals | Brixadi label, section 2 | Tool 4 |
| Eliquis 2.3, Xarelto 2.5, Pradaxa, Savaysa missed-dose sections | Labels | Tool 6. Xarelto has three adult rules covering five regimens, and three pediatric rules |
| Ozempic 5 days after; Wegovy more or less than 2 days before the next dose (section 2.4; "48 hours" appears in section 17 and the patient information) and the two-missed-doses sentence; Rybelsus and Wegovy tablets skip; Mounjaro and Zepbound 4 days (96 hours) after; Trulicity at least 3 days (72 hours) before the next dose | Labels, section 2 | Tool 6. Dulaglutide and Wegovy count toward the **next** dose, the opposite direction from Ozempic and tirzepatide |
| Victoza and Saxenda: resume with the next scheduled dose; more than 3 days since the last dose, reinitiate at 0.6 mg | Victoza label section 2.2; Saxenda label section 2 | Added to tool 6 |
| Bydureon BCise: no SPL returned by DailyMed searches for "bydureon," "bydureon bcise" or "exenatide" (only Byetta and a generic exenatide injection) | DailyMed `spls.json` and `drugnames.json` | Not in tool 6 |
| Fosamax 2.8; Actonel (35 mg, 75 mg ×2, 150 mg); Atelvia; ibandronate 150 mg section 2.4 | Labels | Tool 6. Ibandronate was read on a generic label (Bionpharma): the only Boniva tablet SPL on DailyMed is a 2010 repackager's |
| Synthroid: no missed-dose text | Synthroid label (searched for "miss," "forget," "skip": none) | Not in tool 6 |
| CDC 2024 Figure 1 (combined pills) and Figure 5 (progestin-only pills), read on the figure images; late/missed definitions in the text | Figures `rr7303a1-F1.jpg` and `rr7303a1-F5.jpg` from https://www.ebi.ac.uk/europepmc/webservices/rest/PMC11340200/supplementaryFiles?includeInlineImage=true; text from the PMC11340200 full-text XML | Tool 7. Corrected: the combined-pill branch now carries the figure's full action list, including four lines the first pass lacked (emergency contraception "may be considered" after one late or missed pill; other missed pills discarded; 7 days of pills from a new pack when a new pack cannot be started at once; emergency contraception "at other times as appropriate") |
| Opill: more than 3 hours late → back-up 2 days (48 hours). Slynd Table 2: one missed, no back-up; two or more, 7 days | Labels | Labels agree with CDC for progestin-only pills |
| NuvaRing: more than 3 hours out. Xulane: more than 2 days (48 hours or more) late, a new cycle and new change day. Annovera: more than 2 continuous or cumulative hours | Labels | Patch and ring rejected: label and CDC disagree |
| Plan B One-Step 72 hours, vomiting within 2 hours; ella 120 hours, vomiting within 3 hours, barrier method until the next menstrual period | Labels | Tool 8. Corrected: the ella label's barrier-until-next-period line is now shown beside CDC's 7-day line |
| CDC: emergency contraceptive pills within 5 days; copper IUD within 5 days; hormonal contraception no sooner than 5 days after ulipristal; test if no bleed in 3 weeks; another dose after vomiting within 3 hours | PMC11340200 full-text XML, "Emergency Contraception" | Tool 8. Corrected: CDC lists the copper IUD, not the levonorgestrel IUD, as emergency contraception; CDC's 5-day line for levonorgestrel is shown beside the label's 72 hours |
| CDC start rules by method ("Need for Back-Up Contraception") and Box 3 | PMC11340200 full-text XML | Tool 9, all six rows re-read |
| Children's and Infants' Tylenol, chewables; Children's and Infants' Motrin, chewables: full charts | Labels | Tool 10. Infants' Tylenol is the same 160 mg per 5 mL and its chart stops at 24–35 lb |
| M013 acetaminophen: adults not to exceed 4,000 mg in 24 hours; children by **age only**, 5 doses | https://www.accessdata.fda.gov/drugsatfda_docs/omuf/monographs/OTC%20Monograph_M013-Internal%20Analgesic%2C%20Antipyretic%2C%20and%20Antirheumatic%20Drug%20Products%20for%20OTC%20Human%20Use%2010.14.2022.pdf (posted October 14, 2022), § M013.50(d)(2) | Tool 10. Corrected: the children's doses are now the monograph's own ranges (160 to 162.5 mg and so on), not the rounded 80 mg multiples from its example table. Ibuprofen and naproxen are not M013 actives |
| Extra Strength Tylenol: 6 caplets (3,000 mg) in directions; 4,000 mg in the liver warning. Regular Strength: 10 tablets (3,250 mg) | Labels | Backfill 4 |
| Advil, Aleve, Imodium A-D, MiraLAX, Delsym, Children's Benadryl, pyrantel directions | Labels | Tools 10 and 11 |
| Bayer Genuine Aspirin: 1 or 2 tablets every 4 hours or 3 every 6 hours, not to exceed 12 in 24 hours | Bayer HealthCare label | Tool 11. Corrected source: the first pass read a repackager's label (Select Consumer Group, set id 3ca776c2-47ed-5107-e063-6394a90ac5df); the row now rests on the brand holder's |
| 21 CFR 341.72(d)(7), 341.74(d)(1)(iii), 341.78(d), 341.80(d)(1)(ii) doses; 357.150(d)(1) pyrantel 5 mg/lb or 11 mg/kg, not over 1 g, with the weight schedule | https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-21?part=341&section=341.72 (and 341.74, 341.78, 341.80); ?part=357&section=357.150 | Tool 11. Paragraph citations confirmed. Corrected: for diphenhydramine the regulation says "under 6: consult a doctor"; only dextromethorphan, guaifenesin and pseudoephedrine print doses for ages 2 to under 6. Part 341 was still in the eCFR on October 10, 2026 (latest amendment July 14, 2023) |
| NicoDerm CQ: 10-week schedule, 6 + 2 weeks for 10 or fewer cigarettes. Gum and lozenge: 30-minute rule, 12 weeks, at least 9 a day for 6 weeks, 24 pieces; lozenge 5 in 6 hours and 20 a day | Labels | Tool 12. Corrected source: Nicorette gum was first read on a repackager's label (Lil' Drug Store Products, set id 0e894f4f-2d41-24c2-e063-6294a90ae26c); re-read on Haleon's, same figures. The patch schedule is 10 weeks, not 12 |
| EpiPen 15–30 kg and ≥ 30 kg; Auvi-Q three bands from 7.5 kg; neffy 1 mg (15 to under 30 kg) and 2 mg | Labels | Tool 13 |
| Storage limits, every row of tool 14 | Labels, section 16 and patient instructions | Tool 14. "Insulin 28 days" is not general: Toujeo and Tresiba are 56. Saxenda added (30 days after first use) |
| Fingertip-unit counts and standard deviations by area; one unit covers 286 cm² | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=1806320&rettype=abstract | Tool 2 |
| 0.49 g (male), 0.43 g (female) per unit | https://www.ebi.ac.uk/europepmc/webservices/rest/PMC5874822/fullTextXML (a 2018 paper restating the originals) | Tool 2; originals not read |
| Sunscreen 2 mg/cm² is the SPF test density | https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-21?part=201&section=201.327 | Rejected |
| Fluoride schedule, 12 cells, "not revised since" note | https://www.aapd.org/media/Policies_Guidelines/BP_FluorideTherapy.pdf | Tool 15 |
| FDA, October 31, 2025: enforcement notices on unapproved ingestible fluoride products labeled for children under 3 or for older children at low or moderate caries risk; evaluation recommends restricting use to children 3 and older at high risk | https://www.fda.gov/news-events/press-announcements/fda-acts-protect-children-unapproved-fluoride-drug-products; https://www.fda.gov/news-events/public-health-focus/ingestible-fluoride-drug-products | Tool 15 is build-gated; the conflict is an owner decision |
| `cgm-time-in-range` already checks %CV; `dose-calendar` takes a reader's window | repo `lib/cgm-time-in-range-v1472.js`, `lib/dose-calendar-v1512.js` | CGM rejected; tool 4 scoped to label windows |
| `peds-dose` rows carry no citations; `apap-24h-max` ceilings carry no source | repo `lib/clinical-v8.js` lines 209–210; `views/group-f.js` lines 355–359 | Backfills 4 and 5 |

**Label register (read October 10, 2026).** Set id, version and published date of each label a
row rests on.

| Product | Set id | Version | Published |
|---|---|---|---|
| Invega Sustenna | `1af14e42-951d-414d-8564-5d5fce138554` | 41 | February 17, 2025 |
| Invega Trinza | `c39e65d7-fa44-4e4c-8b12-a654d3ed0eae` | 25 | February 17, 2025 |
| Invega Hafyera | `6cd61892-d2cb-434d-83ed-5c1b2c4e7a0b` | 8 | February 21, 2025 |
| Erzofri | `492bf9dd-868e-421a-92db-8cca8973aac1` | 7 | March 10, 2026 |
| Aristada | `17a8d11b-73b0-4833-a0b4-cf1ef85edefb` | 32 | February 10, 2025 |
| Abilify Maintena | `ee49f3b1-1650-47ff-9fb1-ea53fe0b92b6` | 27 | March 30, 2026 |
| Abilify Asimtufii | `da4c07fd-1130-4341-bb44-63acfa4162be` | 6 | April 10, 2025 |
| Uzedy | `734eb776-4be0-4808-834b-0d8b0f9e021e` | 8 | September 14, 2026 |
| Perseris | `a4f21b1a-5691-4b14-a56d-651962d06f39` | 18 | February 21, 2025 |
| Risperdal Consta | `bb34ee82-d2c2-43b8-ba21-2825c0954691` | 38 | November 17, 2025 |
| Rykindo | `58534c96-96f5-4c2e-a061-92d4506aee91` | 10 | May 28, 2026 |
| Depo-Provera CI | `199cf13e-0859-4a73-9b45-e700d0cd1049` | 29 | August 28, 2026 |
| depo-subQ provera 104 | `390087a6-f3c3-4f0b-a930-79acf412f153` | 21 | December 19, 2025 |
| Vivitrol | `cd11c435-b0f0-4bb9-ae78-60f101f3703f` | 39 | July 24, 2026 |
| Sublocade | `6189fb21-9432-45f8-8481-0bfaf3ccde95` | 43 | July 28, 2026 |
| Brixadi | `5d8a8fd0-8619-422a-a664-d1d2e8970f48` | 6 | January 6, 2026 |
| Eliquis | `e9481622-7cc6-418a-acb6-c5450daae9b0` | 30 | May 5, 2025 |
| Xarelto | `10db92f9-2300-4a80-836b-673e1ae91610` | 65 | September 11, 2026 |
| Pradaxa | `ba74e3cd-b06f-4145-b284-5fd6b84ff3c9` | 48 | June 30, 2025 |
| Savaysa | `e77d3400-56ad-11e3-949a-0800200c9a66` | 28 | July 14, 2025 |
| Ozempic | `adec4fd2-6858-4c99-91d4-531f5f2a2d79` | 20 | June 10, 2026 |
| Wegovy | `ee06186f-2aa3-4990-a760-757579d8f77b` | 19 | June 30, 2026 |
| Rybelsus | `27f15fac-7d98-4114-a2ec-92494a91da98` | 14 | August 19, 2026 |
| Mounjaro | `d2d7da5d-ad07-4228-955f-cf7e355c8cc0` | 40 | September 2, 2026 |
| Zepbound | `487cd7e7-434c-4925-99fa-aa80b1cc776b` | 40 | September 2, 2026 |
| Trulicity | `463050bd-2b1c-40f5-b3c3-0a04bb433309` | 62 | August 10, 2026 |
| Victoza | `5a9ef4ea-c76a-4d34-a604-27c5b505f5a4` | 31 | November 17, 2025 |
| Saxenda | `3946d389-0926-4f77-a708-0acb8153b143` | 22 | June 15, 2026 |
| Fosamax | `14e931fd-2c5f-4d90-b7db-5980706f4a56` | 10 | March 16, 2026 |
| Actonel | `24ed00e0-25e2-49a8-97fc-66c1b417dc0b` | 31 | May 11, 2026 |
| Atelvia | `c8b9ab88-1a26-46c3-80ec-4eaa45202021` | 29 | read from `history.json` at build |
| Ibandronate 150 mg (Bionpharma, generic) | `6ca94cce-a2bb-421f-bd8f-6b14bc2bd985` | 6 | August 27, 2026 |
| Synthroid | `1e11ad30-1041-4520-10b0-8f9d30d30fcc` | 1537 | February 29, 2024 |
| Opill | `69dfa2ac-6a7e-4587-929c-9acabd97973b` | 4 | January 29, 2025 |
| Slynd | `db32bc55-f295-4d87-9dbb-0a2f45573dcf` | 9 | August 31, 2026 |
| NuvaRing | `55eb60e3-6f4d-40a3-8ee6-e7fd2d0c7d97` | 10 | November 21, 2025 |
| Xulane | `f7848550-086a-43d8-8ae5-047f4b9e4382` | 17 | June 15, 2026 |
| Annovera | `eb18194f-2021-41fa-8bdf-31e0c0eb646b` | 6 | September 24, 2026 |
| Plan B One-Step | `6ce6b40e-14ac-47bd-a648-ddf9e452e559` | 5 | February 2, 2023 |
| ella | `2bf93d23-cddd-4613-9066-5b5fa090404b` | 7 | July 24, 2026 |
| Children's Tylenol suspension | `3162733b-9382-39f1-e063-6294a90ac420` | 3 | June 16, 2026 |
| Infants' Tylenol suspension | `997b9551-c222-4a9c-8ba1-09a5f97495fa` | 12 | August 7, 2026 |
| Children's Tylenol chewables | `9782fe86-d72a-4231-b1ba-d3f3b4ee49e3` | 11 | April 17, 2026 |
| Children's Motrin suspension | `152189e5-391c-42d3-a03b-c8364e2de6bf` | 9 | November 11, 2024 |
| Infants' Motrin drops | `c2302bfe-b367-4867-b803-29f066a42dc7` | 10 | July 1, 2026 |
| Children's Motrin chewables | `15b0b56d-6188-4937-b541-902022e35b24` | 8 | November 17, 2025 |
| Children's Benadryl Allergy liquid | `fc9181b9-c92d-493e-8d7c-4a4239c6c092` | 15 | October 9, 2026 |
| Delsym | `e3e1d126-76c2-4776-8ce0-449625b7e6ba` | 15 | September 11, 2026 |
| Imodium A-D caplets | `01da76d0-1979-4c45-9d39-c72ae4e4ffe2` | 13 | September 29, 2025 |
| Imodium A-D liquid | `76a976d5-8bee-4158-a94d-7fbfc5544fd4` | 10 | September 29, 2025 |
| Pyrantel pamoate chewable (Bionpharma) | `5799a28e-4803-b192-e063-6294a90a53d7` | 1 | September 30, 2026 |
| Advil Liqui-Gels | `1f01c10a-9434-91a4-2ee4-352315a6b610` | 37 | July 31, 2026 |
| Aleve | `3c0ddd25-5a9a-4628-a971-65fe2a9775b5` | 12 | December 8, 2025 |
| Bayer Genuine Aspirin (Bayer HealthCare) | `44a08904-68b9-4d06-a28d-21aae3d6140c` | 8 | December 5, 2025 |
| MiraLAX | `d69ce3d4-7ca4-4fe3-b49e-6655e48d6963` | 24 | May 6, 2026 |
| Tylenol Extra Strength | `103d109d-f520-409c-8da2-eb6b0fbec891` | 16 | July 24, 2026 |
| Tylenol Regular Strength | `1622f694-4d63-4c56-8737-fae31f0ecfb7` | 13 | May 28, 2026 |
| Nix | `d6dfa64a-bb88-4438-b4e2-30c6fbb28f3e` | 6 | November 17, 2025 |
| NicoDerm CQ | `93b2d1b9-83c1-40b5-b6af-90c38c8d6cef` | 14 | July 16, 2025 |
| Nicorette gum 2 mg and 4 mg (Haleon) | `673fd19f-69b3-4f73-b9b4-18b5f4cbf69c` | 27 | August 15, 2024 |
| Nicorette lozenge | `f350e050-2173-43e0-8738-848382ce0700` | 8 | June 6, 2025 |
| Habitrol gum 4 mg | `5c394758-1179-455a-a562-c8e954fb2258` | 4 | December 24, 2025 |
| EpiPen and EpiPen Jr | `7560c201-9246-487c-a13b-6295db04274a` | 37 | February 12, 2025 |
| Auvi-Q | `6180fb40-7fca-4602-b3da-ce62b8cd2470` | 21 | October 6, 2025 |
| neffy | `a1758142-a905-401d-8961-05829f51023a` | 7 | April 14, 2026 |
| Lantus | `d5e07a0c-7e14-4756-9152-9fea485d654a` | 35 | July 2, 2025 |
| Humalog | `c8ecbd7a-0e22-4fc7-a503-faa58c1b6f3f` | 87 | August 10, 2026 |
| NovoLog | `3a1e73a2-3009-40d0-876c-b4cb2be56fc5` | 34 | January 22, 2025 |
| Basaglar | `0ad21db3-2b1c-4ed9-a687-bdd6a74d0aae` | 35 | August 10, 2026 |
| Toujeo | `c9561d96-124d-48ca-982f-0aa1575bff36` | 25 | June 12, 2025 |
| Tresiba | `456c5e87-3dfd-46fa-8ac0-c6128d4c97c6` | 14 | July 20, 2022 |
| Forteo | `aae667c5-381f-4f92-93df-2ed6158d07b0` | 44 | August 19, 2026 |
| Humira | `608d4f0d-b19f-46d3-749a-7159aa5f933d` | 2154 | February 6, 2026 |
| Enbrel | `a002b40c-097d-47a5-957f-7a7b1807af7f` | 218 | read from `history.json` at build |
| Dupixent | `595f437d-2729-40bb-9c62-c8ece1f82780` | 60 | August 7, 2026 |
| Repatha | `cd61e902-166d-4aa6-9f3c-a18c1008d07e` | 32 | August 21, 2026 |

## Owner decisions

1. **`contraceptive-missed-pill` reports CDC, which knowingly differs from many combined-pill
   labels.** The tool is kept. Every result states that the source is CDC's 2024 recommendations
   and that the product's own label may say otherwise. If admission rule 6 ("two sources that
   disagree = skip") is read strictly, cut the combined-pill branch and keep the two
   progestin-only branches, where the Opill and Slynd labels agree with CDC.
2. **`fluoride-supplement-schedule` conflicts with FDA's October 31, 2025 position** for children
   under 3 and for children not at high caries risk. Options: do not build; or build with the FDA
   sentence in every result and the under-3 cell never shown as a bare number. Also settle the
   AAPD licensing question.
3. **`emergency-contraception-window` shows the Plan B label's 72 hours beside CDC's 5 days** for
   levonorgestrel. This follows [spec-v1628](spec-v1628.md) §5 rule 6 (side by side, labeled); the
   owner may prefer the label line alone.
4. **Labels with no NDA holder set id on DailyMed.** Ibandronate 150 mg rests on a generic
   (Bionpharma) and pyrantel on a monograph product (Bionpharma); [spec-v1628](spec-v1628.md) §1
   allows a pinned manufacturer when the page says so. Confirm these two pins.

## Verify at build

- **Tool 6, oral semaglutide naming.** Two readings of the same set id (`27f15fac-...`) on
  October 10, 2026 named its products differently (Rybelsus with Wegovy tablets; Rybelsus with
  Ozempic tablets at 1.5, 4 and 9 mg). The missed-dose rule is the same either way. Read the
  label's title and section 2 at build and name every product it covers.
- **Tool 6, change-of-day rules.** The weekly GLP-1 labels also state a minimum gap when the
  dosing day is changed (Ozempic at least 2 days, Mounjaro and Zepbound at least 3 days,
  Trulicity 3 or more days since the last dose). They were read for
  [spec-v1632](spec-v1632.md) and belong here as a second question on the same rows; add them
  once re-read.

- **Label editions.** Before coding any row, re-read it on the version then current and store
  the edition per [spec-v1628](spec-v1628.md) §1. Confirm each set id in the label register is
  the NDA or BLA holder's: the ella set is labeled by PMI Branded Pharmaceuticals, Inc., the
  Tresiba set id's latest version was published July 20, 2022, the EpiPen set id's on February
  12, 2025, and the Children's Motrin suspension set id's on November 11, 2024; check that none
  has been replaced by a newer set id. Atelvia and Enbrel published dates were not matched to
  the version read.
- **Tool 5, month arithmetic.** Trinza and Hafyera bands are in months; the labels do not
  define a month. Confirm the calendar-month reading with the owner before coding the edges.
- **Tool 5, Sustenna.** "4 to 6 weeks" then "more than 6 weeks": day 42 itself belongs to the
  first band as written; days 29 to 35 after a monthly dose are inside the ±7-day window, not
  missed.
- **Tool 6, Wegovy.** Exactly 2 days before the next dose is in neither "more than 2 days" nor
  "less than 2 days." Print both.
- **Tool 6, Bydureon BCise.** Check whether a current label exists; add its rule only after
  reading it.
- **Tool 10.** Confirm store-brand concentrations are refused, not mapped. The pyrantel tablet
  strength (250 mg base) is inferred from "1 gram (4 tablets)"; read the active-ingredient line
  on the carton image.
- **Tool 11.** The operative text for cough-and-cold products is OTC Monograph M012 under the
  2020 reform; it was not opened. The doses were read in 21 CFR part 341 as carried in the
  eCFR. Check M012 and whether a final order has since amended it for children under 6, and
  whether proposed order OTC000035 (acetaminophen skin-reaction warning, June 2024) is final;
  neither is expected to change a dose.
- **Tool 14.** Each preset needs its exact carton presentation checked (Ozempic also has a
  prefilled-syringe line at 28 days; Wegovy FlexTouch is 56 days after first use; NovoLog in an
  insulin pump has a 19-day total in-use figure).
- **Tool 15.** Confirm the schedule against the ADA's 2010 recommendation (Rozier, *J Am Dent
  Assoc* 2010;141(12):1480-9), not opened, read FDA's scientific evaluation and its letter to
  health care professionals in full, and check for FDA action after October 31, 2025.
- **Tool 2.** Read Long & Finlay 1991 in full for the gram weights and Long, Mills & Finlay 1998
  for the children's table before adding children. Complete the author list of PMC5874822
  (*Pharmaceutics* 2018;10(1):9, doi 10.3390/pharmaceutics10010009) before citing it.
- **Home blood-pressure average (held).** Candidate: readings in → the protocol's average and
  the home threshold. The 2025 AHA/ACC guideline (*Hypertension*; PMID 40811516) returned 403
  and is not in PMC. No number was read; do not build from memory.

## Sources

- DailyMed (National Library of Medicine), SPL labels by set id as listed in the label register.
- CDC. U.S. Selected Practice Recommendations for Contraceptive Use, 2024. *MMWR Recomm Rep*
  2024;73(RR-3). PMC11340200.
- FDA. OTC Monograph M013, Internal Analgesic, Antipyretic, and Antirheumatic Drug Products for
  Over-the-Counter Human Use (posted October 14, 2022).
- 21 CFR part 341 (cold, cough, allergy, bronchodilator and antiasthmatic products) and part 357
  subpart B (anthelmintic products); 21 CFR 201.327 (sunscreen testing), eCFR.
- FDA. "FDA Acts to Protect Children from Unapproved Fluoride Drug Products," October 31, 2025,
  and "FDA Recommendations on Ingestible Fluoride Prescription Drug Products."
- Long CC, Finlay AY. The finger-tip unit: a new practical measure. *Clin Exp Dermatol*
  1991;16:444-7.
- "Is the Skin Absorption of Hydrocortisone Modified by the Variability in Dosing Topical
  Products?" *Pharmaceutics* 2018;10(1):9 (PMC5874822), for the restated gram weights.
- American Academy of Pediatric Dentistry. Fluoride therapy. *The Reference Manual of Pediatric
  Dentistry* (latest revision 2023).

## Tests

- `quantity-to-dispense`: insulin 43 units a day in 2 injections with 2 priming units → 47 units
  a day; 90 days → 4,230 units → 15 pens of 300 units → 3 boxes of 5, leftover 270 units. A
  28-day discard limit that forces more pens than the units do. A taper whose steps sum to a
  half tablet rounds up. Blank priming is refused or noted, never read as 0 silently.
- `topical-quantity-ftu`: both arms and both hands, twice daily, 14 days, male → (2×3.3 +
  2×1.2) × 0.49 × 2 × 14 = 123.5 g → five 30 g tubes. No area selected is refused.
- `oral-suspension-course`: 7.5 mL twice daily for 10 days = 150 mL → one 150 mL bottle,
  leftover 0; a 14-day course with a 10-day discard figure reports 4 days past the discard date.
- `depot-injection-window`: Depo-Provera at exactly 13 weeks (on time), 13 weeks + 1 day (label
  line crossed, CDC not), 15 weeks (CDC: still no back-up), 15 weeks + 1 day (CDC: 7 days).
  Sublocade maintenance at day 25 (before the label's 26 days) and day 26; the second Sublocade
  injection at day 7 is not flagged. Brixadi weekly at +2 and +3 days.
- `lai-antipsychotic-missed-dose`: Sustenna maintenance at day 42 and day 43; stabilized on
  234 mg in the 6-week-to-6-month band returns 156 mg twice; Erzofri past 6 months returns the
  single 351 mg dose; Maintena dose 3 at exactly 35 days and Asimtufii at exactly 98 days return
  both instructions; Trinza at 4 calendar months exactly (re-initiation band) and one day
  before; Aristada 441 mg at 6 weeks (none), 6 weeks + 1 day (supplement) and 7 weeks + 1 day
  (re-initiate); Aristada 1,064 mg at 10 weeks + 1 day; Hafyera at 6 months + 3 weeks exactly
  (inside the window); Consta returns "the label states no rule."
- `missed-dose-label-rule`: Trulicity with 72 hours exactly to the next dose (take) and 71
  (skip); Ozempic at 5 days and 5 days + 1 hour; Mounjaro at 96 hours and 97; Pradaxa at 6 hours
  and 5 hours 59 minutes before the next dose; Xarelto 15 mg twice daily returns the
  two-tablets sentence and 2.5 mg twice daily returns "next scheduled time"; Victoza at 3 days
  (resume) and 3 days + 1 (the 0.6 mg sentence); ibandronate with the next dose 7 days away
  (wait) and 8 (take); Eliquis remembered after midnight is no longer "the same day";
  levothyroxine returns "the label states no rule."
- `contraceptive-missed-pill`: norethindrone at 3 hours (not missed) and 3 hours 1 minute;
  combined pill at 23, 24, 47 and 48 hours; two combined pills missed on day 16 returns the
  omit-the-hormone-free-interval lines; drospirenone at 47 and 48 hours, and no last-week rule
  for drospirenone; a placebo pill returns "the recommendations do not apply to placebo pills";
  norethindrone back-up ends after pills taken on time for 2 consecutive days; every result
  contains both the CDC attribution and the "your product's label may say otherwise" sentence.
- `emergency-contraception-window`: 72 hours exactly (inside the Plan B label line), 72 hours + 1
  minute (outside the label line, inside CDC's and ella's), 120 hours + 1 minute (outside all);
  a daylight-saving change inside the window; the ella result shows both the label's and CDC's
  back-up lines.
- `contraception-start-backup`: combined pill on day 5 (none) and day 6 (7 days); drospirenone
  on day 1 (none) and day 2 (7 days); norethindrone on day 6 (2 days); medroxyprogesterone on
  day 7 (none) and day 8 (7 days).
- `otc-child-label-dose`: 23 lb or 23 months → "ask a doctor," no dose; 35 lb and 36 lb fall in
  different rows; a 30 lb 5-year-old shows both rows and the "use weight" sentence; over 95 lb
  or 12 years returns "this chart ends at 95 lb / 11 years"; Infants' Tylenol at 40 lb returns
  "this chart ends at 35 lb"; Infants' Motrin at 5 months → ask a doctor; Benadryl at age 4 →
  "do not use unless directed by a doctor"; Delsym at age 3 → "do not use"; Imodium at age 4 →
  "ask a doctor"; pyrantel at 190 lb caps at 4 tablets (1 g); the monograph line for a
  5-year-old reads 240 to 243.8 mg.
- `otc-daily-max-check`: seven 200 mg ibuprofen → 1,400 mg, 200 mg over; naproxen 3 tablets
  taken as 2 + 1 passes, 2 + 2 fails; aspirin thirteen 325 mg tablets is over the label's 12;
  acetaminophen is redirected; any cough-and-cold active at age 5 returns the label line and no
  number.
- `nrt-step-schedule`: 10 cigarettes a day starts at 14 mg for 8 weeks total; 11 starts at
  21 mg for 10; first cigarette at 30 minutes exactly (the label says "within 30 minutes" and
  "more than 30 minutes," so 30 is the 4 mg side); age 17 returns "ask a doctor."
- `epinephrine-device-weight-band`: 7.4 kg (no product labeled), 14.9 kg (Auvi-Q 0.1 mg only),
  15 kg, 29.9 kg, 30 kg (EpiPen shows both of its bands).
- `out-of-fridge-discard-date`: Humalog unopened at room temperature 10 days then opened → 18
  days left, not 28; Mounjaro KwikPen where the fourth weekly dose comes before day 30; Toujeo
  offers no unopened room-temperature preset; a discard date past the expiration date is capped
  at the expiration date.
- `fluoride-supplement-schedule` (if built): 5 months (0 everywhere); 3 years exactly and
  0.3 ppm exactly return both neighboring cells; 0.7 ppm returns 0; a 2-year-old at 0.1 ppm
  never renders "0.25 mg" without the FDA sentence.
- Shared: for every label-row tool, set the clock past a row's `validThrough`, and set
  `supersededOn`, and assert the preset renders no figure and the reader-input path still works.

## Build status

Not started. Specified October 10, 2026.
