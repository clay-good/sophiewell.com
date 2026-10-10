# spec-v1631 — Clinical pharmacokinetics and therapeutic drug monitoring

**Status:** Proposed, October 10, 2026. Specs only; nothing here is built. 20 new tools (1 build-gated), 10 backfills.
**Charter:** [spec-v1627](spec-v1627.md). **Machinery:** [spec-v1628](spec-v1628.md). **Ledger:** [scope-pharmacy-practice.md](scope-pharmacy-practice.md).

A hospital pharmacist's kinetics service does the same arithmetic all day: pick a first
vancomycin dose, turn two drug levels into a new regimen, decide what a phenytoin or valproate
level means when the albumin is low, and work out which kidney-function number to dose on. The
catalog has seven tools in this space. This wave adds 20 more and extends 10 live ones, each tied
to an FDA label, the 2020 vancomycin consensus guideline, or the paper that published the equation.
Researched and re-verified October 10, 2026.

**Group.** The live kinetics tools (`vanc-auc`, `aminoglycoside`, `digoxin`, `pk-suite`) sit in
group F. Every tool here belongs beside them in F, except `kinetic-egfr` (E, with the other renal
estimates) and `arc-risk-scores` (G). None belongs in Q.

**Label rows.** Every value read from an FDA label is a route D label row under
[spec-v1628](spec-v1628.md) §1: pinned to the NDA holder's DailyMed set id with its version and
published date, watched weekly, and failing closed for that drug when the section changes or the
row expires. This spec does not restate that scheme. The set ids below name the copies read on
October 10, 2026; several are generic or repackager copies and must be re-pinned at build (see
Verify at build and Sources).

## Gap finder

**Method.** `catalog.tsv` (2,059 rows) was searched for about 90 terms: every drug in this domain,
the eponyms (Sawchuk, Matzke, Hartford, Sheiner, Winter-Tozer, Ludden, Jusko, Cooper, Devine,
Janmahasatian, Salazar, Jelliffe, Schwartz), and the outputs (half-life, clearance, AUC, trough,
peak, loading, steady state, accumulation, free level, sieving, time above MIC, kinetic). All 90
group F entries were listed by name. Where a neighbor looked close its code was read:
`lib/pk-v166.js`, `lib/medication-v5.js` (`vancAuc`, `aminoglycoside`, `digoxin`),
`lib/clinical-v7.js` (`correctedPhenytoin`), `lib/clinical.js` (`cockcroftGault`,
`egfrCkdEpi2021`), `lib/clinical-v4.js` (`ibwDevine`, `adjBW`, `egfrMdrd`), `lib/gaps-v185.js`
(`leanBodyWeight`), `lib/nephrology-v226.js` (`salazarCorcoran`), `lib/renal-v277.js`
(`measuredCrcl`) and the `bw-bsa-suite` and `egfr-suite` views. All 20 proposed ids were checked
against the catalog ids and against the tool headings of spec-v1629 through spec-v1639: no
collisions.

**What the catalog already has.**

| Live id | What it does today (read in the code) |
|---|---|
| `vanc-auc` | Steady-state AUC24 and AUC24/MIC from a peak and a trough (first-order, two levels). No dose revision, no initial dose. |
| `aminoglycoside` | Hartford 7 mg/kg (amikacin 15 mg/kg) and a starting interval from CrCl (≥60 q24h, 40–59 q36h, 20–39 q48h). Does not read a level; refuses CrCl <20 and dialysis. |
| `digoxin` | Three categorical dose sentences by CrCl and age, and a level band (heart failure 0.5–0.9, rate control 0.8–2.0 ng/mL) with a <6 h timing warning. No computed dose. |
| `corrected-phenytoin` | Corrected total = measured / (0.2 × albumin + 0.1); the albumin coefficient becomes 0.1 when "ESRD" is checked. |
| `pk-suite` | Loading dose = Vd·C/F, maintenance = CL·Css·τ/F, k = CL/Vd, half-life, 5 half-lives. Nothing from measured levels. |
| `cockcroft-gault`, `egfr-suite`, `egfr`, `ckd-epi-cystatin`, `salazar-corcoran`, `schwartz-egfr`, `measured-crcl` | Renal estimates. Cockcroft-Gault takes one weight, as entered. eGFR is reported only per 1.73 m². |
| `bw-bsa-suite`, `lean-body-weight`, `bsa` | Devine ideal weight, adjusted weight at 0.4, Janmahasatian lean weight, Mosteller and Du Bois. |
| `calvert-carboplatin`, `crrt-dose`, `abx-renal`, `digifab-dosing`, `lithium-extrip` | Carboplatin AUC dose; CRRT effluent dose (mL/kg/h, not drug clearance); a label renal table for antibiotics; antidote and dialysis decisions. |

**Near neighbors.**

| Proposed | Live neighbor | Difference |
|---|---|---|
| `vanc-initial-dose` | `vanc-auc` | `vanc-auc` needs two measured levels. The new tool works before any level exists: loading dose with the guideline cap, and a first maintenance dose from a published clearance equation. |
| `vanc-hd-dose` | `abx-renal` | `abx-renal` is a CrCl-banded label table; this is the guideline's hemodialysis table (timing × dialyzer permeability). |
| `vanc-continuous-infusion` | `vanc-auc` | Continuous infusion has one level and no peak or trough; AUC24 = Css × 24. |
| `sawchuk-zaske-dosing` | `vanc-auc`, `pk-suite` | `vanc-auc` stops at AUC. `pk-suite` needs Vd and CL typed in. This derives k and Vd from two levels and returns the dose and interval for a desired peak and trough. |
| `aminoglycoside-label-renal` | `aminoglycoside`, `abx-renal` | The live tool is extended-interval only. This is the conventional-dosing arithmetic printed in the three labels. `abx-renal` carries no aminoglycoside interval rule. |
| `phenytoin-mm-dose` | `corrected-phenytoin` | The live tool corrects a level for albumin. This predicts the dose for a target level under saturable elimination. |
| `fosphenytoin-load-rate` | none | The program's single owner of phenytoin and fosphenytoin loading. [spec-v1633](spec-v1633.md) `aed-formulation-switch` covers the daily-dose switch between oral phenytoin and fosphenytoin, not loading. |
| `valproate-albumin-normalized` | `corrected-phenytoin` | Different drug, different published method (a free-fraction table, not a linear coefficient). |
| `digoxin-label-dose` | `digoxin` | The live tool prints a sentence. This computes the label's loading schedule, maintenance dose and days to steady state. |
| `lithium-level-check` | `lithium-extrip` | EXTRIP decides dialysis in poisoning. This reads a routine level against the label. |
| `pk-steady-state-predict` | `pk-suite` | `pk-suite` gives an average-concentration maintenance dose. This gives peak, trough, accumulation and the level at any time for an intermittent infusion. |
| `kinetic-egfr` | `egfr`, `cockcroft-gault` | Those assume a stable creatinine. This is for a creatinine that is rising or falling. |
| `crrt-drug-clearance` | `crrt-dose` | `crrt-dose` checks the effluent prescription. This turns effluent flow and a sieving coefficient into a drug clearance. |
| `auc-trapezoid` | `calvert-carboplatin` | Calvert uses a target AUC. This measures one from levels. |

## Tools

### 1. `vanc-initial-dose` — Vancomycin First Dose and Starting Regimen

**Input.** Population (adult, obese adult, child 3 months or older, neonate); actual body weight;
creatinine clearance (mL/min, reader-supplied or handed over from `cockcroft-gault`); the loading
dose in mg/kg the reader chooses within the guideline range; target AUC24 (default 500, range
400–600); which clearance equation to use.
**Compute.**
- *Loading dose.* mg/kg × actual body weight. Guideline ranges: 20–35 mg/kg for critically ill
  adults on intermittent dosing; 20–25 mg/kg for obese adults; 20 mg/kg by total body weight for
  obese children. Cap: 3,000 mg. A value outside the range for the chosen population is flagged,
  not changed.
- *Maintenance, adults.* Daily dose (mg) = vancomycin clearance (L/h) × target AUC24 (mg·h/L).
  The guideline describes this method ("population model–estimated vancomycin CL multiplied by
  the target AUC"). Clearance choices, each shown with its source:
  - Matzke 1984: CL (mL/min) = 3.66 + 0.689 × CrCl (mL/min); × 0.06 gives L/h.
  - Rodvold 1988 (a dose equation, not a clearance): dose (mg/kg/24 h) = 0.227 × CrCl + 5.67,
    with CrCl standardized to mL/min per 70 kg. Shown beside the AUC-based answer and labeled as
    pre-AUC.
  - FDA label: "about 15 times the glomerular filtration rate in mL/min," with a table in
    10 mL/min steps (CrCl 100 → 1,545 mg/24 h; 90 → 1,390; 80 → 1,235; 70 → 1,080; 60 → 925;
    50 → 770; 40 → 620; 30 → 465; 20 → 310; 10 → 155). The tool prints the table row at or below
    the entered clearance and the 15 × GFR product, each labeled; choosing the lower row is the
    tool's rule, not the label's. The label adds that the initial dose should be no less than
    15 mg/kg even in mild to moderate renal insufficiency, and that the table is not valid for
    functionally anephric patients (15 mg/kg initial dose, then 1.9 mg/kg/24 h).
  - Crass 2018 (obese adults): **build-gated**, see Verify at build.
- *Checks from the guideline.* 15–20 mg/kg every 8–12 hours is the stated usual regimen for
  normal renal function; empiric maintenance for obese adults "usually" does not exceed
  4,500 mg/day; early AUC monitoring when the empiric dose exceeds 4,000 mg/day.
- *Children 3 months and older.* Guideline summary: 60–80 mg/kg/day divided every 6–8 hours.
  The guideline's text is finer and the tool prints both: 60–80 mg/kg/day every 6 hours from
  3 months to under 12 years; 60–70 mg/kg/day every 6–8 hours at 12 years and older. Usual
  maximum empiric daily dose 3,600 mg with adequate renal function; "most children generally
  should not require more than 3,000 mg/day"; early monitoring when the dose exceeds
  2,000–3,000 mg/day; flag at 100 mg/kg/day or more (the guideline says to avoid it).
- *Neonates.* Label rule only: 15 mg/kg, then 10 mg/kg every 12 hours in the first week of life
  and every 8 hours after that up to 1 month. The guideline's neonatal range (10–20 mg/kg every
  8–48 hours by post-menstrual age, weight and creatinine) has no computable rule and is printed
  as a range.
- *Infusion time.* The longer of 60 minutes and dose ÷ 10 mg/min (label). The guideline's own
  sentence (10 to 15 mg/min, at least 1 hour per 1,000 mg; loading doses of 25 to 35 mg/kg need
  at least 2 to 3 hours) is printed beside it.
**Output.** Loading dose (mg) with the cap applied and named; daily maintenance dose from each
selected equation side by side; the per-dose amount at 8, 12, 24 and 48 hours; minimum infusion
time; each flag with its sentence.
**Source.** Rybak et al., Am J Health-Syst Pharm 2020 (ASHP/IDSA/PIDS/SIDP), full text PDF from
ASHP and the executive summary in PMC7358040. Matzke, AAC 1984 (PMC185546). Rodvold, AAC 1988
(PMC172294). Vancomycin injection label (DailyMed set id 2dc7b3d6-3874-40ac-b8aa-7bcfe2dc0cdf, a
generic; no brand injection label was looked for).
**Note.** The three equations give different answers by design (CrCl 100 mL/min, 70 kg: Matzke at
AUC 500 gives 2,177 mg/day, Rodvold 1,986 mg/day, the label table 1,545 mg/day). The tool
shows all selected rows and picks none. Matzke and Rodvold predate standardized creatinine assays,
which the tool states. Matzke's abstract gives clearances in mL/min; the equation's units are read
from that context.

### 2. `vanc-hd-dose` — Vancomycin in Intermittent Hemodialysis

**Input.** Actual body weight; whether the dose is given after dialysis ends or during the last
part of the session; dialyzer permeability (low or high); optionally a pre-dialysis level.
**Compute.** The guideline's tabulation (recommendation 13 in the hemodialysis section; the
maintenance doses carry the footnote "thrice-weekly dose administration"):

| Timing | Permeability | Loading, mg/kg | Maintenance, mg/kg |
|---|---|---|---|
| After dialysis ends | Low | 25 | 7.5 |
| After dialysis ends | High | 25 | 10 |
| Intradialytic | Low | 30 | 7.5–10 |
| Intradialytic | High | 35 | 10–15 |

Pre-dialysis level, when entered, is placed against the guideline's 15–20 mg/L. The guideline's
note that the 3-day interdialytic gap needs a 25% larger dose is printed with the arithmetic.
**Output.** Loading and maintenance dose in mg (a range where the table gives one), the level
band, and the guideline's sentence that pre-dialysis levels, at least weekly, should drive later
doses.
**Source.** Rybak 2020, hemodialysis section and recommendations 13–14.
**Scope.** Hybrid dialysis and CRRT starting doses from the same guideline are printed as a second
panel: loading 20–25 mg/kg for both; hybrid maintenance 15 mg/kg after the session or in its last
60–90 minutes; CRRT at 20–25 mL/kg/h effluent 7.5–10 mg/kg every 12 hours.

### 3. `vanc-continuous-infusion` — Vancomycin Continuous Infusion

**Input.** Actual body weight; loading mg/kg (guideline 15–20); daily maintenance mg/kg
(guideline 30–40, up to 60); bag concentration (mg/mL); optionally a measured steady-state level
and the current rate.
**Compute.** Loading dose and daily dose in mg; pump rate (mg/h and mL/h). With a level:
AUC24 = Css × 24, and the rate for a target Css (guideline 20–25 mg/L) by proportion, new rate =
current rate × target ÷ measured. Concentration above 5 mg/mL is flagged (label; up to 10 mg/mL
only for fluid restriction).
**Output.** Doses, rates, AUC24 against 400–600, and the new rate.
**Source.** Rybak 2020, continuous-infusion section and recommendation 7; vancomycin label.
**Note.** The proportion assumes clearance has not changed between the level and the new rate; the
tool says so.

### 4. `sawchuk-zaske-dosing` — New Dose and Interval From Two Levels (Intermittent Infusion)

**Input.** Dose (mg), infusion time t′ (h), interval τ (h); two levels in the same interval with
their times after the end of the infusion (C1 at t1, C2 at t2); whether the dose was a first dose
or at steady state; desired peak and trough (reader input).
**Compute.** One-compartment model, first-order elimination, constant-rate infusion:
- k = ln(C1 ÷ C2) ÷ (t2 − t1); half-life = ln 2 ÷ k.
- Cmax = C1 × e^(k·t1) (end of infusion); Cmin = C2 × e^(−k·(τ − t′ − t2)) (end of interval;
  zero before a first dose, or the measured pre-dose level).
- Vd = [(Dose ÷ t′) × (1 − e^(−k·t′))] ÷ [k × (Cmax − Cmin × e^(−k·t′))].
- New interval = t′ + ln(desired peak ÷ desired trough) ÷ k, shown exact and at the nearest
  practical intervals (6, 8, 12, 18, 24, 36, 48 h).
- New dose = k × Vd × t′ × desired peak × (1 − e^(−k·τ)) ÷ (1 − e^(−k·t′)), then the predicted
  peak and trough for the rounded dose and interval.
**Output.** k, half-life, Vd (L and L/kg), extrapolated peak and trough, the new regimen and its
predicted levels.
**Source.** Sawchuk, Zaske, Cipolle, Wargin, Strate, Clin Pharmacol Ther 1977;21:362–369 (PMID
837654): "a one-compartment model with first-order elimination and 1-hr constant-rate input at
fixed intervals." The equations above are the closed-form solution of that model.
**Scope.** Drug-agnostic. No target is built in; the paper gives none and targets differ by drug
and indication. Refuses when C1 ≤ C2, when times are out of order, or when the levels are less
than one-half of a half-life apart (the estimate of k is unstable; the tool states the rule and
that the cutoff is the tool's own guard, not the paper's).

### 5. `aminoglycoside-label-renal` — Conventional Aminoglycoside Dosing by the Label

**Input.** Drug (gentamicin, tobramycin, amikacin); weight; height and sex (for the obesity
weight); serum creatinine (mg/dL) or creatinine clearance; severity (serious or life-threatening).
**Compute.**
- *Dosing weight.* Tobramycin label: "estimated lean body weight plus 40% of the excess."
  Gentamicin label: "an estimate of the lean body mass" (no number). Amikacin label: no obesity
  rule; daily dose capped at 1.5 g.
- *Usual dose, normal renal function.* Gentamicin and tobramycin 3 mg/kg/day in three doses, up
  to 5 mg/kg/day in three or four doses for life-threatening infection. Amikacin 15 mg/kg/day as
  7.5 mg/kg every 12 hours or 5 mg/kg every 8 hours.
- *Impaired renal function, prolonged interval.* Interval (hours) = serum creatinine × 8
  (gentamicin), × 6 (tobramycin), × 9 (amikacin). Label examples: creatinine 2 gives 16 hours for
  gentamicin and 18 hours for amikacin.
- *Impaired renal function, reduced dose at the usual interval.* Gentamicin: after the usual
  initial dose, the label's rough guide is the usual dose ÷ serum creatinine every 8 hours
  (label example: 60 kg, creatinine 2 mg/100 mL, 30 mg every 8 hours), tabulated as a percent of
  the usual dose in the label's Table 4:

| Serum creatinine, mg/dL | ≤1 | 1.1–1.3 | 1.4–1.6 | 1.7–1.9 | 2–2.2 | 2.3–2.5 | 2.6–3 | 3.1–3.5 | 3.6–4 | 4.1–5.1 | 5.2–6.6 | 6.7–8 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Approx. CrCl, mL/min/1.73 m² | >100 | 70–100 | 55–70 | 45–55 | 40–45 | 35–40 | 30–35 | 25–30 | 20–25 | 15–20 | 10–15 | <10 |
| Percent of usual dose | 100 | 80 | 65 | 55 | 50 | 40 | 35 | 30 | 25 | 20 | 15 | 10 |

  Tobramycin and amikacin: usual dose ÷ serum creatinine (each label's "alternate rough guide",
  at 8-hour and 12-hour intervals respectively), after a loading dose of 1 mg/kg (tobramycin) or
  7.5 mg/kg (amikacin). The tobramycin label's primary reduced-dose method is a nomogram printed
  as an image (for a clearance of 70 mL/min or less); the tool does not reproduce it.
- *After hemodialysis (gentamicin label).* 1 to 1.7 mg/kg at the end of each dialysis; 2 mg/kg in
  children.
**Output.** Dosing weight, the usual dose, and both adjusted regimens side by side, with the
label's sentence that neither method applies during dialysis (tobramycin, amikacin) and that
levels should be measured when feasible. Each label's level statements are printed as its own
words: gentamicin and tobramycin, avoid prolonged peaks above 12 mcg/mL and troughs above
2 mcg/mL; amikacin, avoid peaks (30 to 90 minutes after injection) above 35 mcg/mL and troughs
above 10 mcg/mL. The tobramycin label also says not to exceed 5 mg/kg/day unless levels are
monitored.
**Source.** DailyMed: gentamicin (set id 449c9a41-d61e-49fd-b5e3-d76f74b92acf), tobramycin
(ac8134d9-a726-4508-b8b9-a536ef17243d), amikacin (f260ff2a-76a0-4672-9516-91c344b67890); all
three are generic labels.
**Note.** A creatinine above 8 mg/dL is outside the gentamicin table; the tool says so and gives
no percentage. The label methods assume a stable creatinine.

### 6. `aminoglycoside-initial-dose` — Aminoglycoside Starting Dose From Population Estimates (build-gated)

**Input.** Drug, dosing weight, creatinine clearance, infusion time, desired peak and trough.
**Compute.** Population k from creatinine clearance and Vd per kg, then the same interval and dose
equations as `sawchuk-zaske-dosing`.
**Source.** Hull and Sarubbi, Ann Intern Med 1976;85:183–189; Sarubbi and Hull, Ann Intern Med
1978;89:612–618.
**Build gate.** The coefficients are not in either abstract and the papers were not opened. The
figures in circulation (k = 0.00293 × CrCl + 0.014 per hour) were seen only in lecture notes, and
one calculator page prints a second version (0.0024 × CrCl + 0.01). Two versions and no primary
reading: do not build until the 1976 paper is read. The 1976 abstract does confirm that Vd was
calculated on lean, not total, body weight.

### 7. `phenytoin-mm-dose` — Phenytoin Dose From Two Steady-State Levels (Michaelis-Menten)

**Input.** Two daily doses (mg/day) and the steady-state total level each produced; the product
for each (sodium salt capsule or injection, or free-acid suspension or chewable tablet); target
level.
**Compute.** Doses are first put on one basis: sodium-salt dose × 0.92 = phenytoin acid (the
label states the free-acid forms carry about 8% more drug). With rates R1, R2 and levels C1, C2:
- Km = (R1 − R2) ÷ (R2/C2 − R1/C1)
- Vmax = R1 + Km × R1/C1
- Dose for the target = Vmax × target ÷ (Km + target), reported as acid and as sodium salt.
- Predicted level at any dose R = Km × R ÷ (Vmax − R); refused when R ≥ Vmax, with the sentence
  that the dose exceeds the estimated maximum rate of metabolism.
**Output.** Km (mg/L), Vmax (mg/day), the dose for the target, and a short table of predicted
levels at the doses available in 30 mg and 100 mg steps.
**Source.** Ludden et al., Clin Pharmacol Ther 1977;21:287–293 (PMID 837647): parameters "from two
reliable steady-state phenytoin serum concentrations resulting from different daily doses."
Dilantin label for the 8% salt difference and the 10–20 mcg/mL total (1–2 mcg/mL unbound) range.
**Scope.** Two pairs only. A one-level method needs a population Km, and no primary source for
one was read; the reader may enter a Km to run the one-pair form, labeled as their assumption. Refuses
when the two pairs imply a negative Km or Vmax (levels not at steady state, or adherence changed).
Albumin-corrected levels from `corrected-phenytoin` may be used as inputs; the tool does not
correct them itself.

### 8. `fosphenytoin-load-rate` — Fosphenytoin and Phenytoin Loading: Dose, Rate and When to Draw a Level

The single owner of phenytoin and fosphenytoin loading in this program.

**Input.** Drug (fosphenytoin, IV phenytoin, oral phenytoin); adult or child; weight; indication
(status epilepticus, or non-emergent loading); the mg/kg chosen within the label range; route;
for an infusion, the bag volume.
**Compute.**
- *Fosphenytoin*, in phenytoin sodium equivalents (PE). The label defines 1.5 mg of fosphenytoin
  sodium as 1 mg PE and the vial as 50 mg PE/mL.

| | Loading dose | Maximum rate |
|---|---|---|
| Status epilepticus, adult | 15–20 mg PE/kg | 100–150 mg PE/min, never above 150 |
| Status epilepticus, child (birth to under 17 years) | 15–20 mg PE/kg | 2 mg PE/kg/min or 150 mg PE/min, whichever is slower |
| Non-emergent, adult | 10–20 mg PE/kg | 150 mg PE/min |
| Non-emergent, child | 10–15 mg PE/kg | 1–2 mg PE/kg/min or 150 mg PE/min, whichever is slower |

  Dose in mg PE and in mL of the 50 mg PE/mL product; the shortest allowed infusion time (dose ÷
  maximum rate); the diluted volume range at 1.5–25 mg PE/mL and whether the entered bag volume
  lands inside it; and the earliest time a phenytoin level is meaningful: about 2 hours after
  the end of an IV infusion, 4 hours after an IM dose. Initial maintenance from the same label:
  adults 4–6 mg PE/kg/day in divided doses; children 2–4 mg PE/kg given 12 hours after the
  loading dose, then 4–8 mg PE/kg/day in divided doses every 12 hours, at 1–2 mg PE/kg/min or
  100 mg PE/min, whichever is slower. The label says IM fosphenytoin should ordinarily not be used
  for status epilepticus or in children; the tool prints that sentence when IM is chosen there.
- *IV phenytoin sodium* (phenytoin injection label). Adults 10–15 mg/kg at no more than
  50 mg/min. Children 15–20 mg/kg at no more than 1–3 mg/kg/min or 50 mg/min, whichever is
  slower. Minimum time = dose ÷ maximum rate. For an infusion the label requires dilution in
  normal saline to no less than 5 mg/mL, completed within 1 to 4 hours; the tool checks the
  entered bag volume against 5 mg/mL. Maintenance after the adult load: 100 mg orally or IV
  every 6 to 8 hours.
- *Oral phenytoin loading* (Dilantin label). 1 g as 400 mg, 300 mg, 300 mg at 2-hour intervals;
  adults in a clinic or hospital where levels can be monitored; not with a history of renal or
  liver disease; maintenance starts 24 hours after the load.
**Output.** The dose range and the dose for the chosen mg/kg, the rate ceiling, the minimum
infusion minutes, the volume of product, the bag-concentration check and the sampling time.
**Source.** Cerebyx label (NDA holder; set id d4c36fad-0ba2-4cd4-9c5e-dcf843f38a5a, version 38):
Tables 1–3 and sections 2.2, 2.5 and 11, matching the generic copy first read
(bb38bc6a-99c7-4cda-b3f0-37f629d060cf). Phenytoin Sodium Injection label
(889dd22c-46f0-48d0-b18e-a3783c5fa653, version 5). Dilantin capsules label (copy read:
db8c69b0-4697-433e-98c7-b0b2d2c52a83).
**Note.** The phenytoin injection label's own check ("approximately 20 minutes in a 70-kg
patient") is the worked example: 70 kg × 15 mg/kg = 1,050 mg, and 1,050 ÷ 50 = 21 minutes.
Section 2.4 of the fosphenytoin label states the pediatric non-emergent loading ceiling as
2 mg PE/kg/min while its Table 2 prints 1–2 mg PE/kg/min; the tool prints the table and uses
2 mg PE/kg/min as the ceiling.
**Scope.** Loading only. The daily-dose switch between oral phenytoin and fosphenytoin and the
8% free-acid difference are `aed-formulation-switch` in [spec-v1633](spec-v1633.md).

### 9. `valproate-albumin-normalized` — Valproate Level Normalized for Low Albumin (Hermida-Tutor)

**Input.** Total valproic acid level (mg/L); serum albumin (g/dL or g/L).
**Compute.** Normalized level CN = αH × CH ÷ 6.5, where CH is the measured total level, αH is the
free fraction (%) for the patient's albumin from the paper's Table 1, and 6.5% is the free
fraction at an albumin of 42 g/L. Estimated free level = αH × CH ÷ 100. Table 1 (albumin g/L →
free fraction %):

42 → 6.5; 41 → 6.8; 40 → 7.3; 39 → 7.9; 38 → 8.5; 37 → 9.1; 36 → 9.8; 35 → 10.5; 34 → 11.3;
33 → 12.1; 32 → 13.0; 31 → 14.0; 30 → 15.0; 29 → 16.2; 28 → 17.4; 27 → 18.7; 26 → 20.1;
25 → 21.6; 24 → 23.2; 23 → 24.9; 22 → 26.8; 21 → 28.9; 20 → 31.0; 19 → 33.3; 18 → 35.8.

Albumin is rounded to the nearest whole g/L. Outside 18–42 g/L the tool refuses (the table ends).
**Output.** Normalized total level, estimated free level, and the free fraction used.
**Source.** Hermida and Tutor, J Pharmacol Sci 2005;97:489–493 (open access, J-STAGE).
**Note.** The paper reports acceptable agreement only for total levels below 75 mg/L and says the
free fraction is unpredictable at high totals because binding saturates. Above 75 mg/L the tool
still computes but leads with that limit. The paper gives no therapeutic band for the normalized
value; the tool invents none.

### 10. `digoxin-label-dose` — Digoxin Loading and Maintenance Dose (Label Method)

**Input.** Age group; lean body weight; creatinine clearance corrected to 70 kg or 1.73 m²;
loading dose in mcg/kg chosen within the label range; route to convert between.
**Compute.**
- *Loading.* Total oral loading dose: adults and children over 10 years 10–15 mcg/kg; 5–10
  years 20–45 mcg/kg. Schedule: half now, then a quarter every 6–8 hours twice.
- *Maintenance by formula.* Maintenance = loading dose (peak body stores) × % daily loss ÷ 100,
  with % daily loss = 14 + CrCl ÷ 5.
- *Maintenance by table.* The label's Table 3 (mcg once daily, tablets) for adults and children
  over 10 years, with days to steady state:

| CrCl, mL/min | 40 kg | 50 | 60 | 70 | 80 | 90 | 100 | Days to steady state |
|---|---|---|---|---|---|---|---|---|
| 10 | 62.5* | 125 | 125 | 187.5 | 187.5 | 187.5 | 250 | 19 |
| 20 | 125 | 125 | 125 | 187.5 | 187.5 | 250 | 250 | 16 |
| 30 | 125 | 125 | 187.5 | 187.5 | 250 | 250 | 312.5 | 14 |
| 40 | 125 | 187.5 | 187.5 | 250 | 250 | 312.5 | 312.5 | 13 |
| 50 | 125 | 187.5 | 187.5 | 250 | 250 | 312.5 | 312.5 | 12 |
| 60 | 125 | 187.5 | 250 | 250 | 312.5 | 312.5 | 375 | 11 |
| 70 | 187.5 | 187.5 | 250 | 250 | 312.5 | 375 | 375 | 10 |
| 80 | 187.5 | 187.5 | 250 | 312.5 | 312.5 | 375 | 437.5 | 9 |
| 90 | 187.5 | 250 | 250 | 312.5 | 375 | 437.5 | 437.5 | 8 |
| 100 | 187.5 | 250 | 312.5 | 312.5 | 375 | 437.5 | 500 | 7 |

  (*the label marks this cell as about 30% below the calculated dose.) The tool uses the row and
  column at or below the entered values and says which cell it read; that choice is the tool's
  rule. The label adds: reduce the dose when lean weight is an abnormally small fraction of total
  body mass because of obesity or edema.
- *Corrected CrCl when only a creatinine is known (label).* Men (140 − age) ÷ creatinine; women
  × 0.85.
- *IV and oral.* Tablets are 60–80% bioavailable; label equivalents: 62.5, 125, 250, 500 mcg
  tablets = 50, 100, 200, 400 mcg IV.
**Output.** The loading schedule in mcg, the maintenance dose by formula and by table, days to
steady state, and the IV equivalent. The table's days to steady state apply when no loading dose
is given (label footnote).
**Source.** Digoxin tablets label (set id dfac7f13-28be-423d-9389-9089da29da17), sections 2.2–2.6.
**Note.** The label's range for levels (below 0.5 ng/mL less effective, above 2 ng/mL more toxic,
sample at least 6 hours after a dose) differs from the heart-failure target the live `digoxin`
tool carries (0.5–0.9). Each tool names its own source; this one does not interpret levels.
**Scope.** Adults and children over 10 years for maintenance. For ages 5 to 10 the tool gives the
loading range only; the label's twice-daily maintenance table for that age (Table 5) is not
transcribed here. The IV-to-tablet switch as a conversion is `label-formulation-switch` in
[spec-v1633](spec-v1633.md); the live `digoxin` tool's sourcing is also raised in
[spec-v1632](spec-v1632.md).

### 11. `theophylline-label-dose` — Theophylline and Aminophylline: IV Start and Level-Guided Adjustment

**Input.** Mode. *IV start:* ideal body weight, age, patient group, whether any theophylline was
taken in the past 24 hours, a measured level if so, target level (default 10 mcg/mL), and the
product (theophylline or aminophylline). *Adjustment:* the peak steady-state level, whether the
patient is on an IV infusion or an oral product, and the current infusion rate or daily dose.
**Compute.**
- *Loading.* No theophylline in 24 hours: 4.6 mg/kg theophylline (5.7 mg/kg as aminophylline,
  the label's own figure) on ideal body weight over 30 minutes, expected to give about 10 mcg/mL
  (range 6–16). With a level: D = (desired − measured) × V, V = 0.5 L/kg (label range 0.3 to
  0.7); equivalently each 1 mg/kg raises the level about 2 mcg/mL. No loading dose is computed
  without a level when theophylline was taken in the past 24 hours (label).
- *Infusion rate, Table V (theophylline, mg/kg/h, target 10 mcg/mL).* Neonates up to 24 days
  1 mg/kg every 12 hours, beyond 24 days 1.5 mg/kg every 12 hours (target 7.5 mcg/mL for apnea);
  infants 6–52 weeks (0.008 × age in weeks) + 0.21; children 1–9 years 0.8; 9–12 years 0.7;
  adolescents 12–16 who smoke cigarettes or marijuana 0.7 (no cap printed); adolescents 12–16
  who do not smoke 0.5 (cap 900 mg/day); adults 16–60, otherwise healthy nonsmokers 0.4 (cap
  900 mg/day); over 60 years 0.3 (cap 400 mg/day); cardiac decompensation, cor pulmonale, liver
  dysfunction, sepsis with multiorgan failure, or shock 0.2 (cap 400 mg/day). Each cap carries
  the label's "unless serum levels indicate the need for a larger dose." Aminophylline =
  theophylline ÷ 0.8 (Table V footnote).
- *Adjustment, Table VI.* The percentages are the same in both labels; the actions and recheck
  times differ, and the tool uses the table for the route entered.

| Peak level, mcg/mL | Change | IV infusion (aminophylline label) | Oral (extended-release label) |
|---|---|---|---|
| Below 9.9 | Increase about 25% if symptoms are not controlled and the dose is tolerated | Recheck after 12 hours in children, 24 hours in adults | Recheck after 3 days |
| 10–14.9 | Maintain if controlled and tolerated | Recheck at 24-hour intervals | Recheck at 6–12 month intervals |
| 15–19.9 | Consider a 10% decrease | | |
| 20–24.9 | Decrease 25% | Recheck after 12 hours in children, 24 hours in adults | Recheck after 3 days |
| 25–30 | Decrease at least 25% | Stop the infusion for 12 hours in children, 24 hours in adults, first | Skip the next dose first; recheck after 3 days |
| Above 30 | Treat as overdose; if resumed, decrease at least 50% | Stop the infusion | |

  The label's bands leave 9.9 to 10 unassigned; the tool treats a level from 9.9 up to 10 as the
  10–14.9 row and says so.
**Output.** Loading dose and rate in mg and mg/h for the chosen product, the cap applied, or the
adjusted daily dose with the label's sentence.
**Source.** Aminophylline injection label (DailyMed set ids 819207a2-0c37-b275-e053-2a91aa0afb36
for the text and 52bbc6cd-4baf-7859-e063-6394a90ac87d for Table V as text); theophylline
extended-release label (882657ae-e15b-4c86-a571-b55460bd4726) for Table VI.
**Note.** The same label gives aminophylline as "approximately 79%" theophylline in the
description, 5.7 mg/kg as the aminophylline loading dose (4.6 ÷ 0.8 is 5.75), and ÷ 0.8 in the
dosing table. The tool uses the label's 5.7 mg/kg for the standard load, the table's 0.8 for
rates and for a level-based load, and shows the 79% figure.

### 12. `caffeine-citrate-dose` — Caffeine Citrate for Apnea of Prematurity

**Input.** Weight (kg); optionally a serum caffeine level.
**Compute.** Loading 20 mg/kg caffeine citrate (1 mL/kg of the 20 mg/mL solution) IV over 30
minutes, once. Maintenance 5 mg/kg (0.25 mL/kg) IV over 10 minutes or orally every 24 hours,
starting 24 hours after the load. Caffeine base is half the citrate dose. A level above 50 mg/L
is flagged with the label's sentence on serious toxicity.
**Output.** Doses in mg of citrate, mg of base, and mL.
**Source.** Caffeine citrate label (set id 5f38c395-0093-4afd-89ec-f96e5dc0934a).
**Note.** The label states that a therapeutic range could not be determined from its trial
(levels ran 8–40 mg/L). The tool shows no target range.

### 13. `busulfan-auc-dose` — IV Busulfan AUC and Dose Adjustment (Label Method)

**Input.** The dose given (mg); whether sampling followed dose 1 or a later dose; sample times and
concentrations (the label's schedule); target AUC (default 1,125 micromolar·min).
**Compute.** As the label instructs. Sampling: dose 1 at 2 hours (end of infusion), 4 hours and
6 hours (just before the next dose); later doses add a pre-infusion sample. Dose 1: AUC to
infinity = AUC 0–6 h by the linear trapezoidal rule (pre-dose concentration taken as 0) +
concentration at hour 6 ÷ terminal elimination rate constant. Later doses: steady-state AUC
0–6 h from the trough, 2 h, 4 h and 6 h samples by the linear trapezoidal rule. Adjusted dose
(mg) = actual dose × target AUC ÷ actual AUC. Label example: 11 mg with an AUC of 800 gives
11 × 1,125 ÷ 800 = 15.5 mg. Concentrations entered in ng/mL are converted with the label's
molecular weight, 246 g/mol (micromolar = ng/mL ÷ 246).
**Output.** AUC in micromolar·min, the adjusted dose, and whether the AUC is inside the 900–1,350
range targeted in the label's pediatric trial. Fewer than three samples is flagged with the
label's warning that the AUC may be inaccurate.
**Source.** Busulfan injection label (set id 086a715e-4958-4bb5-9ebd-86171e6b6203, a generic),
section 8.4, "Dose Adjustment Based on Therapeutic Drug Monitoring."
**Scope.** The label prints this method in its Pediatric Use section, and the tool says so. The
initial dose is label text shown as context, not computed advice: section 2.1 (patients over
12 kg) gives 0.8 mg/kg of ideal or actual body weight, whichever is lower, every 6 hours for
16 doses, with adjusted ideal body weight (ideal + 0.25 × (actual − ideal)) in obesity; the
pediatric nomogram suggests 1.1 mg/kg at 12 kg or less and 0.8 mg/kg above 12 kg, on actual body
weight. No other spec in this program specifies busulfan.

### 14. `lithium-level-check` — Lithium Level: Timing, Range and Proportional Dose

**Input.** Level (mEq/L); hours since the last dose; acute or maintenance treatment; current daily
dose; creatinine clearance.
**Compute.** Label targets: acute mania 0.8–1.2 mEq/L; maintenance 0.8–1.0 mEq/L; toxic at
1.5 mEq/L or more. Timing: the label asks for a sample 12 hours after the previous dose, just
before the next; another time is flagged as not comparable to the range. Renal: CrCl 30–89 mL/min
(Cockcroft-Gault) start lower and titrate slowly; below 30 mL/min not recommended. With a current
dose and a 12-hour steady-state level: dose for a target level = current dose × target ÷ level.
**Output.** The band, the timing flag, the renal sentence and the proportional dose.
**Source.** Lithium carbonate label (set id b839ff4b-f62d-41ab-a823-550a756d58ec).
**Note.** The proportional step assumes linear kinetics, steady state and unchanged renal function,
which the tool states. It is arithmetic on the reader's own level, not a prediction method.

### 15. `pk-steady-state-predict` — Predicted Peak, Trough and Level at Any Time (One Compartment)

**Input.** Dose, infusion time t′ (0 for a bolus), interval τ, Vd, and either k, half-life or
clearance; optionally the dose number and a time of interest; optionally a level and a target to
fall to.
**Compute.**
- Accumulation factor = 1 ÷ (1 − e^(−k·τ)).
- Steady-state peak = (Dose ÷ t′) × (1 − e^(−k·t′)) ÷ [k × Vd × (1 − e^(−k·τ))]; for a bolus,
  Dose ÷ Vd × accumulation factor. Trough = peak × e^(−k·(τ − t′)).
- Level at time t after the start of dose n: the sum of each earlier dose's contribution
  (superposition).
- Fraction of steady state reached after time t = 1 − e^(−k·t); time to 90%, 95% and 99% printed
  in hours and half-lives.
- Time for a level C to fall to a target = ln(C ÷ target) ÷ k.
- Average steady-state concentration = Dose ÷ (CL × τ); AUC24 = daily dose ÷ CL.
**Output.** The numbers above and a small time-concentration table for one interval.
**Source.** The model in Sawchuk et al. 1977 (as tool 4); the equations were derived from that
model and checked numerically on October 10, 2026. No empirical constant is used; every parameter
is reader input.
**Scope.** Linear, one-compartment drugs only; the tool says it does not apply to phenytoin
(saturable) or to the distribution phase of digoxin or vancomycin.

### 16. `auc-trapezoid` — AUC From Measured Levels (Trapezoidal Rule)

**Input.** Time and concentration pairs; method (linear, or linear-up log-down); whether to
extrapolate to infinity; optionally the dose.
**Compute.** Linear segment: (C1 + C2) ÷ 2 × Δt. Log-down segment (falling levels): (C1 − C2) ×
Δt ÷ ln(C1 ÷ C2). Terminal rate constant from the last two or more points chosen by the reader;
extrapolated area = last concentration ÷ terminal rate constant. With a dose: clearance = dose ÷
AUC to infinity. The percent of the total that is extrapolated is shown.
**Output.** AUC over the sampled span, AUC to infinity, the terminal half-life, clearance.
**Source.** The method as the busulfan label prescribes it (linear trapezoidal rule plus
C(6 h) ÷ terminal rate constant). No empirical constant.
**Note.** `busulfan-auc-dose` calls the same function with the label's fixed schedule and units.

### 17. `tmic-beta-lactam` — Time Above MIC for a Dosing Regimen

**Input.** Dose, infusion time, interval, Vd, half-life or k, unbound fraction, MIC.
**Compute.** Steady-state free concentrations from the one-compartment infusion model (tool 15):
free peak P and free trough T, and the free plateau A = fu × (dose ÷ t′) ÷ (k × Vd).
- T at or above the MIC: 100%. P below the MIC: 0%.
- Otherwise the rising curve crosses the MIC at tc = −ln[(A − MIC) ÷ (A − T)] ÷ k after the start
  of the infusion, and the time above the MIC = (t′ − tc) + ln(P ÷ MIC) ÷ k, limited to the
  interval, divided by the interval. For a bolus, ln(P ÷ MIC) ÷ k.
- Continuous infusion: free Css = fu × rate ÷ CL, compared with the MIC.
**Output.** Percent of the interval above the MIC, free peak and trough, and the same regimen as
a 3-hour or 4-hour extended infusion for comparison.
**Source.** Algebra on the one-compartment model, derived and checked against a numerical
integration on October 10, 2026; no empirical constant.
**Note.** A longer infusion does not always raise the result: with the same dose it lowers the
peak, and when the MIC sits just under the new peak the time above it falls (see Tests). The tool
shows the comparison and draws no conclusion. No target is printed. Pharmacodynamic targets
vary by drug class and by paper, and no primary source for one was opened; the tool reports the
percentage and says the target is the reader's. Vd, half-life and protein binding are reader
input (from the product label).

### 18. `kinetic-egfr` — Kinetic eGFR When Creatinine Is Changing (Chen)

**Input.** A steady-state (baseline) creatinine and the clearance or eGFR that went with it; two
consecutive creatinines and the hours between them; weight (for total body water, 0.6 × kg) or a
maximum daily creatinine rise entered directly.
**Compute.** KeGFR = (baseline creatinine × baseline clearance ÷ mean of the two creatinines) ×
[1 − (24 × change in creatinine) ÷ (hours × maximum change in creatinine per day)]. Maximum change
per day = creatinine generation ÷ volume of distribution = baseline creatinine × baseline
clearance ÷ total body water. With creatinine in mg/dL, clearance in mL/min and total body water
in L, that is 1.44 × creatinine × clearance ÷ total body water in mg/dL per day (1,440 min/day
÷ 100 mL/dL ÷ 10 dL/L). The factor is a unit conversion derived here; neither paper prints it.
**Output.** KeGFR in the units of the baseline estimate, and the drug-dosing category it falls in
beside the category the static estimate would give.
**Source.** Chen, J Am Soc Nephrol 2013;24:877–888 (PMID 23704286). Equation read as reproduced in
Kwong et al., PLoS One 2019 (PMC6879155, open access), Fig. 1 equations A and B.
**Note.** With no change in creatinine and a mean equal to baseline, the result equals the
baseline clearance; that identity is a test. A negative result is reported as zero with the
arithmetic shown.

### 19. `arc-risk-scores` — Augmented Renal Clearance Risk (ARC and ARCTIC Scores)

**Input.** Age; sex; serum creatinine; trauma admission (yes or no); modified SOFA score.
**Compute.**
- *ARC score (Udy 2013):* age 50 or younger 6 points; admission after trauma 3 points; modified
  SOFA 4 or lower 1 point. Total 0–10. "Modified SOFA" in the paper is the SOFA score without its
  neurological component. The paper defines augmented clearance as a measured creatinine
  clearance of 130 mL/min/1.73 m² or more.
- *ARCTIC score (Barletta 2017, trauma ICU, creatinine 1.3 mg/dL or lower):* age under 56,
  4 points; age 56–75, 3 points (over 75, none); creatinine below 0.7 mg/dL, 3 points; male,
  2 points. A score of
  6 or higher: sensitivity 0.843, specificity 0.682 for a measured clearance of 130 mL/min or
  more.
**Output.** Both totals; the ARCTIC cutoff result; a line pointing to `measured-crcl`.
**Source.** Udy et al., Crit Care 2013 (PMC4056783, open access); Barletta et al., J Trauma Acute
Care Surg 2017;82:665–671 (PMID 28129261, abstract).
**Note.** The ARC paper assigns points but states no cutoff; it groups totals as 0–3, 4–6 and
7–10 in one figure and calls the score "primarily speculative" pending validation. The tool
prints the total without a band.
ARCTIC is refused for a creatinine above 1.3 mg/dL (its exclusion).

### 20. `crrt-drug-clearance` — Drug Clearance by CRRT From Flow and Sieving Coefficient

**Input.** Mode (hemofiltration, hemodialysis, hemodiafiltration); ultrafiltrate and dialysate
flow; sieving or saturation coefficient (reader input, or drug concentration in effluent ÷
plasma); for pre-filter replacement, plasma flow and pre-filter flow; optionally the patient's
non-CRRT clearance.
**Compute.** Convective clearance = sieving coefficient × ultrafiltrate flow. Diffusive clearance
= saturation coefficient × dialysate flow. Pre-dilution: clearance = sieving coefficient ×
effluent flow × plasma flow ÷ (plasma flow + pre-filter flow). Total = CRRT clearance + entered
residual clearance; CRRT share of total in percent.
**Output.** Clearance in mL/min and L/h and the share.
**Source.** Li et al., Front Pharmacol 2020 (PMC7273837, open access), which states the first two
relations; Corona et al., Antibiotics 2022 (PMC9774802, open access) for the pre-dilution form.
**Note.** No sieving coefficient table ships: values differ by filter and study. The tool does not
turn the clearance into a dose; `pk-suite` and `pk-steady-state-predict` take it as input.

## Backfills (live tools that should do more)

Backfills 3, 5, 6 and 8 correct or re-source a number in a live tool and are indexed in
[spec-v1641](spec-v1641.md).

1. **`vanc-auc`** — add dose revision: new daily dose = current daily dose × target AUC24 ÷
   measured AUC24 (the same proportion the busulfan label uses; state that it assumes unchanged
   clearance). Default the MIC to 1 mg/L with the guideline's sentence that empiric dosing should
   assume 1 and that the dose should not be lowered for an MIC below 1. Add the pediatric
   ceilings (AUC below 800 mg·h/L, trough below 15 mg/L). State the guideline's sampling times:
   a post-distributional peak 1 to 2 hours after the end of the infusion and a trough at the end
   of the interval, preferably in the same interval. Link to tools 1–3.
2. **`aminoglycoside`** — (a) name the dosing weight: the tobramycin label's "lean body weight
   plus 40% of the excess," with Traynor 1995's fitted factor (0.43 × excess + ideal weight when
   overweight; 1.13 × total weight when underweight) as the paper behind it. (b) Level-based
   interval from the Hartford nomogram: build-gated on reading the figure in Nicolau 1995 (see
   Verify at build). The abstract confirms the CrCl intervals the tool already uses.
3. **`corrected-phenytoin`** — add the estimated free level (corrected total × 0.1) against the
   label's 1–2 mcg/mL unbound range, and a coefficient choice with each paper named: 0.2
   (Winter-Tozer), 0.25 (Anderson 1997, trauma and elderly with low albumin), 0.29 (Kane 2013,
   neuro-ICU), 0.275 (Cheng 2016). **Check the ESRD branch.** The live code swaps the albumin
   coefficient to 0.1 when "ESRD" is checked and cites a textbook chapter (Winter and Tozer, in
   Applied Pharmacokinetics, 3rd ed., 1992), which was not opened. The one study found that
   tested the end-stage renal disease form, Soriano 2017 (21 hemodialysis patients), reports in
   its abstract a 75% error, with 67% of samples off by more than 50%, and proposes a revised
   equation; the abstract does not print the revised coefficient, and Jun 2020 reports it as
   0.20. Until Soriano 2017 is read in full, the ESRD branch should carry that finding beside its
   result, or be withdrawn. Also print the label's instruction that monitoring in renal or
   hepatic disease or low albumin should be on the unbound level.
4. **`pk-suite`** — add a salt factor S beside F; a top-up loading dose, Vd × (target − measured)
   ÷ (S × F); proportional adjustment for linear drugs, new dose = dose × target ÷ measured; and
   ln 2 in place of 0.693.
5. **`cockcroft-gault`** (and the Cockcroft-Gault row of `egfr-suite`) — the live function takes
   one weight and uses it as entered. Add height and a weight choice, and print all three results
   (actual, ideal, adjusted at 0.4) when height is given, with Winter 2012's finding: actual
   weight was unbiased in underweight patients, ideal weight in normal-weight patients, and
   adjusted weight (0.4) was least biased and most accurate in overweight, obese and morbidly
   obese patients. **Do not add creatinine rounding.** In the same study of 3,678 patients with
   stable renal function, the actual creatinine was less biased and more accurate than a value
   rounded up to 0.8 or 1.0 mg/dL, in all ages and in patients 65 and older. Print that sentence
   when the creatinine is below 1.0.
6. **`egfr`, `egfr-suite`, `ckd-epi-cystatin`** — the live functions return mL/min/1.73 m² only.
   Add the de-indexed value: eGFR (mL/min) = eGFR (mL/min/1.73 m²) × BSA ÷ 1.73, with height and
   weight. FDA's March 2024 guidance says to use eGFR in mL/min, not the indexed value, when
   giving a recommended dosage in adults with renal impairment.
7. **`bw-bsa-suite`** — cite the 0.4 rule to the tobramycin label and Traynor 1995 instead of "0.4
   AdjBW rule," and add percent of ideal body weight. On Devine: see Research record.
8. **`lean-body-weight`** — the agent-facing summary (`mcp/adapters/gaps-v185.js`, and so the
   catalog) says "Boer formula"; the name, the citation and the code are Janmahasatian
   (9,270 × weight ÷ (6,680 + 216 × BMI) for men; 9,270 × weight ÷ (8,780 + 244 × BMI) for
   women). Fix the summary.
9. **`digoxin`** — link to `digoxin-label-dose`, and show the label's level statement (below 0.5
   less effective, above 2 more toxic; sample at least 6 hours after a dose, 10–25% lower just
   before the next dose than at 8 hours) beside the guideline target.
10. **`crrt-dose`** — link to `crrt-drug-clearance` and `vanc-hd-dose`.

## Rejected

| Idea | Why not |
|---|---|
| Bayesian vancomycin dosing; trough-only or one-level AUC | The 2020 guideline ties trough-only AUC to Bayesian software with a population prior. No published closed form to read. Admission rule 3. |
| Vozeh-Sheiner orbit graph for phenytoin | A Bayesian graph built on a population distribution; not reproducible as arithmetic from a source that was opened. |
| Phenytoin one-level method with a fixed population Km, and a fixed Vd for top-up doses | No primary source read for the constants. Offered only as reader-entered values (tool 7, backfill 4). |
| Lithium dose prediction: Cooper 1973, Pepin 1980, Zetin 1983/1986, Jermain 1991, Abou-Auda | Cooper: already deferred in `lib/pk-v166.js` (primary paywalled, band table not reproducible). Zetin: coefficients read in an open comparison paper, but the coding of "status," "sex" and "TCA" is not stated there, and that paper measured a 61% error for Zetin and 37% for Pepin. Pepin needs a lithium clearance estimate that was not read. Jermain's coefficients are not in the abstract. Abou-Auda's clearance unit is unstated. |
| Koup-Jusko and Bauman-DiDomenico digoxin methods | Abstracts read; neither prints its equation, and Bauman 2006 carries an erratum for a dosage error. The label method (tool 10) covers the need. |
| Barnes-Jewish and Urban-Craig extended-interval nomograms | Figures in papers that were not opened; a nomogram read from a secondary copy is not a reading. |
| Aminoglycoside synergy dosing | A guideline dose statement (endocarditis), not a kinetic equation; no primary opened. |
| Jelliffe creatinine clearance | The 1973 source is a one-page letter with no abstract; the equation was not read anywhere primary. `kinetic-egfr` covers the changing-creatinine case. |
| Cockcroft-Gault with creatinine rounded up | The evidence read is against it (backfill 5). |
| Carbamazepine autoinduction | Nothing computable. |
| Cyclosporine C2 monitoring targets | Not in the Neoral label text searched; consensus targets are not label numbers. |
| Antiepileptic free-fraction table for other drugs | A table with no computation beyond phenytoin and valproate, which are covered. |
| Neonatal and pediatric aminoglycoside or vancomycin regimens by postmenstrual age | NeoFax, Red Book and Harriet Lane are licensed. The open sources are the labels (used in tools 1 and 5) and the 2020 guideline's ranges, which give no rule finer than a range. |
| Supplemental dose after hemodialysis from fraction removed | Same arithmetic as the top-up loading dose (backfill 4); the fraction removed is drug- and filter-specific reader input. The gentamicin label's post-dialysis dose is in tool 5. |
| Bioavailability-based IV-to-oral switch | Dose × F ratio is in `pk-suite` once S and F are both inputs; the drug table is specified in [spec-v1633](spec-v1633.md). |
| Standalone accumulation-factor or time-to-steady-state tools | Folded into tool 15; one calculation, one id. |
| A sieving-coefficient table by drug | Varies by filter and study; no single primary source. |
| Beta-lactam target attainment bands (for example 50% or 100% of the interval) | No primary source opened for a threshold; tool 17 prints the percentage only. |
| Glucarpidase eligibility by hour-specific thresholds | The label defines delayed clearance by the dose-specific excretion curve (2 standard deviations), not a threshold table. The dose itself is `glucarpidase-dose` in [spec-v1635](spec-v1635.md). |
| `mtx-leucovorin-rescue` as its own tool here | Specified once, as `hdmtx-leucovorin-rescue` in [spec-v1635](spec-v1635.md). |
| `calcineurin-formulation-convert` as its own tool here | Specified once, as `transplant-formulation-switch` in [spec-v1633](spec-v1633.md). |
| A separate IV phenytoin loading tool | One owner: tool 8 carries fosphenytoin, IV phenytoin and oral loading. [spec-v1636](spec-v1636.md) dropped its `seizure-load-rate` for the same reason. |

## Research record

| Finding | Where read (URL) | Effect on the spec |
|---|---|---|
| Vancomycin: AUC/MIC 400–600 assuming MIC 1; do not lower the dose for an MIC below 1; 15–20 mg/kg every 8–12 h; loading 20–35 mg/kg actual weight, cap 3,000 mg; obese loading 20–25 mg/kg, maintenance usually ≤4,500 mg/day, early monitoring above 4,000 mg/day; continuous infusion 15–20 mg/kg load, 30–40 (up to 60) mg/kg/day, Css 20–25, AUC24 = Css × 24; CRRT and hybrid doses; pediatric 60–80 mg/kg/day, 3,600 mg/day, AUC below 800, trough below 15, avoid ≥100 mg/kg/day; obese children 20 mg/kg load; neonates 10–20 mg/kg every 8–48 h | https://pmc.ncbi.nlm.nih.gov/articles/PMC7358040/ and https://www.ashp.org/-/media/assets/policy-guidelines/docs/therapeutic-guidelines/therapeutic-guidelines-monitoring-vancomycin-ASHP-IDSA-PIDS.pdf | Tools 1–3; backfill 1 |
| **Corrected on re-read.** The guideline's text splits the pediatric dose by age (60–80 mg/kg/day every 6 h under 12 years; 60–70 mg/kg/day every 6–8 h at 12 and older), says most children should not need more than 3,000 mg/day, and asks for early monitoring above 2,000–3,000 mg/day. The summary table merges these into "60–80 every 6–8 h." | ASHP PDF above, pediatric section and Table 2 | Tool 1 prints both |
| Peak sampling wording: post-distributional peak 1 to 2 hours after the end of the infusion, trough at the end of the interval | ASHP PDF above, recommendation 2 | Backfill 1 (was a build item; now read) |
| Guideline infusion sentence: 10 to 15 mg/min, at least 1 hour per 1,000 mg; 25–35 mg/kg loads need 2 to 3 hours | ASHP PDF above, loading-dose section | Tool 1 |
| Hemodialysis table: after dialysis 25 load, 7.5 (low) or 10 (high) maintenance; intradialytic 30 and 7.5–10 (low), 35 and 10–15 (high); maintenance is thrice weekly; pre-dialysis 15–20 mg/L; 25% more for the 3-day gap | ASHP PDF above, recommendations 13–14 and the hemodialysis section | Tool 2 |
| Guideline: maintenance in obesity "computed using a population PK estimate of vancomycin clearance and the target AUC"; trough-only AUC is a Bayesian method | ASHP PDF above | Tool 1 method; trough-only rejected |
| No newer ASHP/IDSA vancomycin guideline found; a 2026 review still cites the 2020 document | Web search October 10, 2026 (not an exhaustive check of ashp.org and idsociety.org) | 2020 edition used; recheck at build |
| Matzke: CL = 3.66 + 0.689 × CrCl (clearances reported in mL/min); Vss 0.72–0.90 L/kg | https://pmc.ncbi.nlm.nih.gov/articles/PMC185546/ (abstract) | Tool 1 |
| Rodvold: dose (mg/kg/24 h) = 0.227 × CrCl + 5.67, CrCl per 70 kg | https://pmc.ncbi.nlm.nih.gov/articles/PMC172294/ (abstract) | Tool 1 |
| Crass 2018: clearance is a linear combination of age, creatinine, sex and allometric weight; 346 patients, 69.6–293.6 kg; coefficients not in the abstract, and the guideline does not print them | https://pubmed.ncbi.nlm.nih.gov/30203073/ | Crass option build-gated |
| Vancomycin label: daily dose "about 15 times" GFR; anephric 15 mg/kg then 1.9 mg/kg/24 h; ≤10 mg/min or ≥60 min; ≤5 mg/mL; neonatal and pediatric doses | https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=2dc7b3d6-3874-40ac-b8aa-7bcfe2dc0cdf | Tools 1, 3 |
| **Corrected on re-read.** The label's renal table gives 1,545 mg/24 h at a clearance of 100 mL/min (155 per 10 mL/min), not 1,500; "15 times" is the label's approximation. Initial dose no less than 15 mg/kg | Same label, Dosage and Administration | Tool 1 prints the table row and the product; test changed |
| Sawchuk-Zaske: one-compartment, first-order, 1-hour constant-rate input; Vd 0.21–0.22 L/kg in the cohort | https://pubmed.ncbi.nlm.nih.gov/837654/ | Tools 4, 15, 17 |
| Closed-form equations of tools 4, 15 and 17 derived from the model and checked numerically: a synthetic patient (k 0.2 per hour, Vd 20 L, 120 mg over 1 h every 8 h) returns its own k, Vd, interval and dose | Derivation, October 10, 2026 | Tools 4, 15, 17; tests |
| **Corrected on re-check.** A longer infusion of the same dose can lower the time above the MIC while the peak stays above it (2,000 mg, Vd 20 L, half-life 1 h, every 8 h, MIC 32 mg/L: 1.74 h with a 0.5-hour infusion, 1.02 h with a 4-hour infusion) | Numerical integration, October 10, 2026 | The test that claimed "never lowers" was replaced; note added to tool 17 |
| Gentamicin label: interval = creatinine × 8; dose ÷ creatinine and Table 4 percentages; lean body mass in obesity; post-dialysis 1–1.7 mg/kg (2 mg/kg in children); avoid prolonged peaks above 12 and troughs above 2 mcg/mL; pediatric and neonatal doses | https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=449c9a41-d61e-49fd-b5e3-d76f74b92acf | Tool 5 |
| Tobramycin label: interval = creatinine × 6; dose ÷ creatinine; "lean body weight plus 40% of the excess"; peaks above 12 and troughs above 2 mcg/mL; no more than 5 mg/kg/day unless levels are monitored; primary reduced-dose method is an image nomogram | https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ac8134d9-a726-4508-b8b9-a536ef17243d | Tool 5; the labeled source of the 0.4 factor (backfills 2, 7) |
| Amikacin label: interval = creatinine × 9; dose ÷ creatinine; 15 mg/kg/day, 1.5 g/day ceiling; peaks above 35 and troughs above 10 mcg/mL | https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f260ff2a-76a0-4672-9516-91c344b67890 | Tool 5 |
| Traynor 1995 (1,708 patients): 0.43 × excess + ideal weight when overweight; 1.13 × total weight when underweight; earlier work proposed 40% for morbid obesity | https://pmc.ncbi.nlm.nih.gov/articles/PMC162577/ (abstract) | Backfills 2, 7 |
| Bauer 1983: larger Vd and clearance in morbid obesity; no correction factor in the abstract | https://pubmed.ncbi.nlm.nih.gov/6873144/ | Cited as background only |
| Nicolau 1995: 7 mg/kg; CrCl ≥60 q24h, 40–59 q36h, 20–39 q48h; later intervals from one level and a nomogram | https://pmc.ncbi.nlm.nih.gov/articles/PMC162599/ (abstract) | Confirms the live tool; nomogram backfill gated |
| Hull-Sarubbi coefficients appear in two versions in secondary pages only | Web search; abstracts at https://pubmed.ncbi.nlm.nih.gov/942138/ and https://pubmed.ncbi.nlm.nih.gov/717929/ | Tool 6 build-gated |
| Ludden 1977: Michaelis-Menten parameters from two steady-state levels at different doses; a nomogram dose exceeded one patient's Vmax | https://pubmed.ncbi.nlm.nih.gov/837647/ | Tool 7 and its refusal rule |
| Winter-Tozer family: free = total ÷ (c × albumin + 0.1) × 0.1 with c = 0.2, 0.29 (Kane), 0.25 (Anderson), 0.275 (Cheng) | https://pmc.ncbi.nlm.nih.gov/articles/PMC5008422/ (Table 1) | Backfill 3 |
| Jun 2020: fitted coefficient 0.276; Soriano 2017 reported as 0.20 in severe renal impairment, with a different assay temperature | https://pmc.ncbi.nlm.nih.gov/articles/PMC7691416/ | Backfill 3, the ESRD question |
| **Added on re-read.** Soriano 2017 abstract: in 21 hemodialysis patients the historical ESRD form of the equation had a 75% error and put 67% of samples more than 50% off; a revised equation did better (coefficient not in the abstract) | https://pubmed.ncbi.nlm.nih.gov/28470115/ | Backfill 3: the live ESRD branch is the form this study found inaccurate |
| Live `corrected-phenytoin`: albumin coefficient 0.1 when ESRD is checked; citation is the 1992 textbook chapter with no link | `lib/clinical-v7.js`, `lib/meta.js` | Backfill 3 |
| Dilantin label: total 10–20, unbound 1–2 mcg/mL; monitor unbound in renal or hepatic disease or low albumin; free acid about 8% more drug; oral load 400/300/300 mg in a clinic or hospital; steady state 7–10 days | https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=db8c69b0-4697-433e-98c7-b0b2d2c52a83 | Tools 7, 8; backfill 3 |
| Fosphenytoin label: loading and maintenance doses in PE, rate ceilings, 1.5–25 mg PE/mL, levels 2 h after IV and 4 h after IM | https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=bb38bc6a-99c7-4cda-b3f0-37f629d060cf | Tool 8 |
| **Corrected on re-read.** Pediatric fosphenytoin maintenance is 2–4 mg PE/kg once, 12 hours after the load, then 4–8 mg PE/kg/day in divided doses every 12 hours (not "2–4 mg PE/kg every 12 hours"), at 1–2 mg PE/kg/min or 100 mg PE/min. The label does state that 1.5 mg fosphenytoin sodium is 1 mg PE (section 11) | Same label; confirmed on the NDA holder's Cerebyx label, https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d4c36fad-0ba2-4cd4-9c5e-dcf843f38a5a (version 38) | Tool 8; build item closed |
| IV phenytoin: adults 10–15 mg/kg at ≤50 mg/min ("approximately 20 minutes in a 70-kg patient"); children 15–20 mg/kg at 1–3 mg/kg/min or 50 mg/min, whichever is slower; infusion diluted in normal saline to no less than 5 mg/mL and finished within 1–4 hours; then 100 mg every 6–8 hours | https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=889dd22c-46f0-48d0-b18e-a3783c5fa653 (version 5) | Merged into tool 8 from the tool dropped by spec-v1636 |
| Hermida-Tutor: CN = αH × CH ÷ 6.5; Table 1 from 42 g/L (6.5%) to 18 g/L (35.8%), all 25 rows re-read; valid below 75 mg/L total | https://www.jstage.jst.go.jp/article/jphs/97/4/97_4_489/_pdf | Tool 9 |
| The exponential the paper quotes from Parent (A = 130.69, B = 4.96 × 10⁻³) does not reproduce Table 1 with albumin in g/L, and only roughly with albumin in µmol/L (5.7% against the table's 6.5% at 42 g/L) | Same PDF; arithmetic October 10, 2026 | Tool 9 uses the table, never the exponential |
| Digoxin label: loading ranges and schedule; % daily loss = 14 + CrCl ÷ 5; Table 3 (all 70 cells re-read); corrected CrCl formula; bioavailability 60–80% and equivalents; level statements | https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=dfac7f13-28be-423d-9389-9089da29da17 | Tool 10; backfill 9 |
| Aminophylline and theophylline labels: 4.6 mg/kg (5.7 as aminophylline) on ideal weight; V 0.5 L/kg; Table V; Table VI; 79% and ÷ 0.8 | https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=819207a2-0c37-b275-e053-2a91aa0afb36 ; setid=52bbc6cd-4baf-7859-e063-6394a90ac87d ; setid=882657ae-e15b-4c86-a571-b55460bd4726 | Tool 11 |
| **Corrected on re-read.** Table VI differs by route: the IV label changes the infusion rate, stops the infusion for 12 hours (children) or 24 hours (adults) at 25–30 mcg/mL and rechecks in 12 or 24 hours; the oral label skips a dose and rechecks in 3 days. The 900 mg/day cap is on nonsmoking adolescents and adults, not on adolescents who smoke | Aminophylline label 52bbc6cd (Table VI as text); theophylline extended-release label 882657ae | Tool 11 now carries both tables |
| Caffeine citrate label: 20 mg/kg load, 5 mg/kg daily, base is half, no therapeutic range established, toxicity above 50 mg/L | https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=5f38c395-0093-4afd-89ec-f96e5dc0934a | Tool 12 |
| Busulfan label: adjusted dose formula, target 1,125, AUC method, example 11 mg → 15.5 mg, pediatric trial range 900–1,350; sampling at 2, 4 and 6 hours for dose 1; molecular weight 246 g/mol; the method sits in section 8.4 | https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=086a715e-4958-4bb5-9ebd-86171e6b6203 | Tools 13, 16; two build items closed |
| Lithium label: 12-hour sampling; 0.8–1.2 acute, 0.8–1.0 maintenance; toxic ≥1.5; CrCl 30–89 and below 30 | https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=b839ff4b-f62d-41ab-a823-550a756d58ec | Tool 14 |
| Zetin, Pepin and Abou-Auda formulas as reproduced, with 37–61% prediction error | https://pmc.ncbi.nlm.nih.gov/articles/PMC3326919/ | Lithium prediction rejected |
| Kinetic eGFR equations A and B; total body water 0.6 × weight | https://pmc.ncbi.nlm.nih.gov/articles/PMC6879155/ ; abstract of the original at https://pubmed.ncbi.nlm.nih.gov/23704286/ | Tool 18 |
| ARC score points (6, 3, 1); modified SOFA excludes the neurological component; ARC defined as ≥130 mL/min/1.73 m²; authors call the score speculative | https://pmc.ncbi.nlm.nih.gov/articles/PMC4056783/ | Tool 19, no band |
| ARCTIC points (4, 3, 3, 2), cutoff 6, sensitivity 0.843 and specificity 0.682, creatinine above 1.3 mg/dL excluded, ARC defined as measured clearance ≥130 mL/min | https://pubmed.ncbi.nlm.nih.gov/28129261/ | Tool 19 |
| CRRT: convective = SC × ultrafiltrate flow; diffusive = SA × dialysate flow; pre-dilution factor plasma flow ÷ (plasma flow + pre-filter flow) | https://pmc.ncbi.nlm.nih.gov/articles/PMC7273837/ ; https://pmc.ncbi.nlm.nih.gov/articles/PMC9774802/ | Tool 20 |
| FDA guidance (March 2024): dose on eGFR in mL/min; multiply by BSA and divide by 1.73; ideal or adjusted weight in Cockcroft-Gault for overweight and obese people "likely" more accurate | https://www.fda.gov/media/78573/download | Backfills 5, 6 |
| Live eGFR functions return the indexed value only; live Cockcroft-Gault takes one weight | `lib/clinical.js` (`egfrCkdEpi2021`, `cockcroftGault`) | Backfills 5, 6 |
| Winter 2012 (3,678 patients, stable renal function): weight choice by weight class; rounding creatinine up is more biased and less accurate | https://pubmed.ncbi.nlm.nih.gov/22576791/ | Backfill 5; rounding rejected |
| Devine: the 1974 paper is not indexed in PubMed (search returned nothing). Pai and Paloucek 2000 trace the equations to an old height-weight-table rule, and say later regressions gave similar equations | https://pubmed.ncbi.nlm.nih.gov/10981254/ | Backfill 7: keep Devine, cite Pai and Paloucek for provenance, and say the 1974 paper was not read |
| Cockcroft-Gault abstract prints "(see article)" in place of the formula; the digoxin label prints the weight-corrected form | https://pubmed.ncbi.nlm.nih.gov/1244564/ | No change to the live tool; noted |
| Live `lean-body-weight` summary says Boer; name, citation and code are Janmahasatian | `mcp/adapters/gaps-v185.js`, `lib/gaps-v185.js`, `lib/meta.js`, `catalog.tsv` | Backfill 8 |
| For `hdmtx-leucovorin-rescue` in [spec-v1635](spec-v1635.md): leucovorin label rescue table; Voraxaze indication (above 1 micromole/L with delayed clearance); methotrexate label points to both and gives a molecular weight of 454.44 | https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=9d0e5356-ff39-4a8e-944c-e808a21ef4b2 ; setid=acaef5a6-b740-40e3-8ffe-74a75c74745c ; setid=dd035a9f-cd40-4314-b9d8-2294b8a924e2 | None here; the tool lives in spec-v1635 |
| For `transplant-formulation-switch` in [spec-v1633](spec-v1633.md): Envarsus 80%; Sandimmune injection one-third of oral; Sandimmune to Neoral 1:1 | DailyMed set ids de2315b0-6344-43ac-9aea-3e3b68d828e7, 5e5926a7-1de0-4b54-a5c0-286b6200ff82, 94461af3-11f1-4670-95d4-2965b9538ae3 | None here; the tool lives in spec-v1633 |

## Verify at build

- **Label editions (all label tools).** Re-pin every label row to the NDA holder's set id under
  [spec-v1628](spec-v1628.md) §1 and re-read the rows on that copy. Of the copies read, the
  Dilantin capsule (RemedyRepack), aminophylline 819207a2 (HF Acquisition) and theophylline
  extended-release (Proficient Rx) labels are repackager copies, which §1 forbids; the rest are
  generic manufacturers' labels. Holder set ids found but not compared line by line: Dilantin
  capsules 86dd27d1-9cee-48ae-b55d-e2d2f7dbc593 (Viatris). Cerebyx
  d4c36fad-0ba2-4cd4-9c5e-dcf843f38a5a was compared for tool 8 and matched. Where no brand label
  is on DailyMed (vancomycin, gentamicin, tobramycin, amikacin, aminophylline, caffeine citrate
  were not checked for one), pin one manufacturer and say so on the page.
- **`vanc-initial-dose`:** the Crass 2018 coefficients (J Antimicrob Chemother 73:3081) and their
  units; whether a newer ASHP/IDSA guideline exists.
- **`sawchuk-zaske-dosing`, `pk-steady-state-predict`, `tmic-beta-lactam`:** read the equations in
  Sawchuk 1977 itself (only the abstract was open) and confirm the Vd form against the derivation
  here; choose the primary citation for time above MIC (Turnidge, Clin Infect Dis 1998, not
  opened).
- **`aminoglycoside-label-renal`:** the amikacin label's maintenance-dose formula is an image in
  the SPL (reduction "in proportion to" creatinine clearance); read the image. The tobramycin
  reduced-dose nomogram is also an image.
- **`aminoglycoside-initial-dose`:** everything; see the build gate.
- **`aminoglycoside` backfill:** the Hartford nomogram's boundary lines must be read from the
  figure in Nicolau 1995 (the PMC PDF sat behind a browser check). Whether amikacin levels are
  halved before plotting is unread.
- **`phenytoin-mm-dose`:** the algebra in Ludden 1977 (abstract only; the equations here are the
  two-point solution of the Michaelis-Menten rate law, derived and checked); the 0.92 factor is
  derived from the label's "approximately 8%," confirm the exact salt-to-acid ratio from the two
  molecular weights on the labels.
- **`fosphenytoin-load-rate`:** re-read the phenytoin injection rows on the NDA holder's or a
  pinned manufacturer's label (the copy read is a distributor's).
- **`corrected-phenytoin` backfill:** read Soriano 2017 in full for its revised coefficient, and
  the Winter-Tozer chapter for the source of 0.1. Read Anderson 1997 and Kane 2013 for the
  populations each coefficient was fitted in.
- **`valproate-albumin-normalized`:** rounding of albumin between table rows (the paper tabulates
  whole g/L); the paper's Table 1 is taken from Parent et al., not re-derived.
- **`digoxin-label-dose`:** transcribe Table 5 (ages 5 to 10, twice daily) if that age group is
  to get a maintenance dose.
- **`theophylline-label-dose`:** confirm Table V in a current theophylline-in-dextrose label; the
  text version came from an aminophylline SPL (52bbc6cd, version 1, published May 28, 2026).
- **`lithium-level-check`:** mEq per 300 mg of lithium carbonate (8.12 was seen only inside a
  formula in PMC3326919; the label gives the molecular weight, 73.89, from which it follows).
- **`kinetic-egfr`:** read Chen 2013 in JASN (not in PMC), including his default maximum rise and
  his own statement of units; the 1.44 factor here is a derived unit conversion.
- **`arc-risk-scores`:** the full ARCTIC paper (abstract only).
- **`crrt-drug-clearance`:** read Pistolesi 2019, the paper Li 2020 cites for the equations.
- **Backfill 6:** KDIGO 2024 was not opened; only the FDA guidance supports de-indexing here.
  Confirm the March 2024 guidance is still the current edition.
- **For [spec-v1633](spec-v1633.md), `transplant-formulation-switch`:** the Astagraf XL and
  Prograf IV-to-oral rows were not read in this research.

## Sources

- Rybak MJ, et al. Therapeutic monitoring of vancomycin for serious MRSA infections: a revised
  consensus guideline. Am J Health-Syst Pharm 2020;77:835–864. Executive summary: J Pediatric
  Infect Dis Soc 2020 (PMC7358040).
- Matzke GR, et al. Antimicrob Agents Chemother 1984;25:433–437 (PMC185546).
- Rodvold KA, et al. Antimicrob Agents Chemother 1988;32:848–852 (PMC172294).
- Crass RL, et al. J Antimicrob Chemother 2018;73:3081–3086 (abstract only).
- Sawchuk RJ, et al. Clin Pharmacol Ther 1977;21:362–369 (abstract only).
- Nicolau DP, et al. Antimicrob Agents Chemother 1995;39:650–655 (PMC162599, abstract).
- Traynor AM, Nafziger AN, Bertino JS. Antimicrob Agents Chemother 1995;39:545–548 (PMC162577,
  abstract).
- Ludden TM, et al. Clin Pharmacol Ther 1977;21:287–293 (abstract only).
- Cheng W, et al. Can J Hosp Pharm 2016;69:269–279 (PMC5008422). Jun H, et al. Drugs R D 2020
  (PMC7691416). Soriano VV, Tesoro EP, Kane SP. Ann Pharmacother 2017;51:669–674 (abstract only).
- Hermida J, Tutor JC. J Pharmacol Sci 2005;97:489–493 (J-STAGE, open).
- Chen S. J Am Soc Nephrol 2013;24:877–888 (abstract); Kwong YD, et al. PLoS One 2019
  (PMC6879155).
- Udy AA, et al. Crit Care 2013;17:R35 (PMC4056783). Barletta JF, et al. J Trauma Acute Care Surg
  2017;82:665–671 (abstract).
- Li L, et al. Front Pharmacol 2020;11:786 (PMC7273837). Corona A, et al. Antibiotics 2022
  (PMC9774802).
- Winter MA, Guhr KN, Berg GM. Pharmacotherapy 2012;32:604–612 (abstract).
- Pai MP, Paloucek FP. Ann Pharmacother 2000;34:1066–1069 (abstract).
- Radhakrishnan R, et al. Indian J Pharmacol 2012;44:234 (PMC3326919), used only to reject.
- FDA. Pharmacokinetics in Patients with Impaired Renal Function: Study Design, Data Analysis,
  and Impact on Dosing. Guidance for Industry, March 2024.
- FDA labels on DailyMed, read October 10, 2026 (set ids in the Research record). The copy read
  and its DailyMed published date, for re-pinning under [spec-v1628](spec-v1628.md) §1:

| Drug | Copy read (labeler) | Published |
|---|---|---|
| Vancomycin injection | Mylan Institutional | August 28, 2026 |
| Gentamicin in sodium chloride | Baxter | October 9, 2026 |
| Tobramycin injection | Mylan Institutional | August 27, 2026 |
| Amikacin injection | Sagent | August 3, 2026 |
| Digoxin tablets | Amneal | August 17, 2026 (version 20) |
| Aminophylline injection 819207a2 | HF Acquisition (repackager) | June 22, 2026 (version 8) |
| Aminophylline injection 52bbc6cd | labeler not recorded | May 28, 2026 (version 1) |
| Theophylline extended-release | Proficient Rx (repackager) | September 21, 2026 |
| Caffeine citrate | Sagent | August 10, 2026 |
| Dilantin capsules | RemedyRepack (repackager) | October 6, 2025 |
| Fosphenytoin injection | Glenmark; Cerebyx (Pfizer, version 38) for tool 8 | March 23, 2026; August 29, 2025 |
| Phenytoin sodium injection | Henry Schein (version 5) | November 17, 2025 |
| Busulfan injection | Sagent | August 7, 2026 |
| Lithium carbonate | Hikma | September 10, 2026 |

  Also read for tools now owned elsewhere: leucovorin, Voraxaze, methotrexate injection
  ([spec-v1635](spec-v1635.md)); Envarsus XR, Sandimmune, Neoral ([spec-v1633](spec-v1633.md)).

## Tests

- `vanc-initial-dose`: 140 kg at 25 mg/kg gives 3,500 mg, capped to 3,000 mg with the cap named.
  CrCl 100 mL/min, 70 kg, AUC 500: Matzke 72.56 mL/min = 4.35 L/h, 2,177 mg/day; Rodvold
  28.37 mg/kg/day = 1,986 mg; label table 1,545 mg/day, shown beside 15 × 100 = 1,500. CrCl 55
  reads the 50 mL/min row (770 mg). Obese adult result above 4,500 mg/day is flagged. A 2,000 mg
  dose needs at least 200 minutes. Child at 80 mg/kg/day and 50 kg (4,000 mg) shows the
  3,600 mg/day line; a 13-year-old shows the 60–70 mg/kg/day line.
- `vanc-hd-dose`: 80 kg, intradialytic, high permeability: load 2,800 mg, maintenance
  800–1,200 mg. Pre-dialysis 12 mg/L reads below 15–20.
- `vanc-continuous-infusion`: Css 18 mg/L gives AUC24 432; rate 100 mg/h to a target of 22.5
  gives 125 mg/h.
- `sawchuk-zaske-dosing`: a synthetic patient (k 0.2 per hour, Vd 20 L, 120 mg over 1 h every
  8 h; steady-state peak 6.81, trough 1.68 mg/L) must return k, Vd and the same regimen when its
  own predicted levels are fed back. C1 = C2 is refused. Trough time past the interval is
  refused.
- `aminoglycoside-label-renal`: gentamicin, creatinine 2 mg/dL, 60 kg gives 60 mg every 16 hours
  and 30 mg (50% of the usual dose) every 8 hours, both the label's own examples. Amikacin,
  creatinine 2, gives 7.5 mg/kg every 18 hours (label example). Creatinine 9 gives no gentamicin
  percentage. Amikacin at 120 kg stops at 1.5 g/day.
- `phenytoin-mm-dose`: 300 mg/day at 8 mg/L and 400 mg/day at 20 mg/L (same product) give
  Km = (300 − 400) ÷ (20 − 37.5) = 5.71 mg/L and Vmax = 514 mg/day; a 550 mg/day prediction is
  refused. Mixed products are converted before the algebra. Pairs implying a negative Km are
  refused.
- `fosphenytoin-load-rate`: 70 kg adult, 20 mg PE/kg: 1,400 mg PE (28 mL), not faster than
  9.3 minutes; in 100 mL the concentration is 14 mg PE/mL, in range; in 50 mL it is 28, out of
  range. A 10 kg child: ceiling 20 mg PE/min, so 200 mg PE takes at least 10 minutes. IV
  phenytoin, 70 kg at 15 mg/kg: 1,050 mg, at least 21 minutes; a 20 kg child at 20 mg/kg:
  400 mg, ceiling 50 mg/min at 3 mg/kg/min would be 60, so 50 mg/min applies and the minimum is
  8 minutes. IM fosphenytoin for status epilepticus prints the label's sentence.
- `valproate-albumin-normalized`: 45 mg/L at albumin 2.5 g/dL: α 21.6%, normalized 149.5 mg/L,
  free 9.7 mg/L. Albumin 4.2 returns the level unchanged. Albumin 1.7 is refused. A total of
  90 mg/L leads with the 75 mg/L limit.
- `digoxin-label-dose`: 70 kg, 15 mcg/kg, CrCl 50: load 1,050 mcg as 525, 262.5, 262.5;
  maintenance by formula 252 mcg/day; table cell 250 mcg, 12 days to steady state. A 125 mcg
  tablet dose shows 100 mcg IV.
- `theophylline-label-dose`: 70 kg ideal weight, no prior theophylline: 322 mg theophylline or
  399 mg aminophylline (5.7 mg/kg). Measured 4 mcg/mL to a target of 10: 6 × 0.5 × 70 = 210 mg
  theophylline (262.5 mg aminophylline). A 26-week infant: 0.418 mg/kg/h. An adult at
  0.4 mg/kg/h and 100 kg is cut to 900 mg/day. A level of 22 returns a 25% decrease on either
  route; 27 on an infusion returns stop for 24 hours (adult) and at least 25%; 27 on an oral
  product returns skip the next dose and at least 25%. Prior theophylline with no level: no
  loading dose.
- `caffeine-citrate-dose`: 1.2 kg: 24 mg citrate (12 mg base, 1.2 mL), then 6 mg (0.3 mL) daily.
- `busulfan-auc-dose`: the label example (11 mg, 800, target 1,125) returns 15.5 mg. 1,230 ng/mL
  converts to 5 micromolar. Two samples raise the fewer-than-three flag.
- `lithium-level-check`: 1.3 mEq/L drawn at 6 hours is flagged for timing before any band; 1.5
  reads toxic; 900 mg/day at 0.6 to a target of 0.9 gives 1,350 mg/day; CrCl 25 prints the
  not-recommended sentence.
- `pk-steady-state-predict`: τ equal to one half-life gives an accumulation factor of 2; time to
  90% of steady state is 3.32 half-lives; a bolus (t′ = 0) does not divide by zero.
- `auc-trapezoid`: a pure exponential after a bolus, sampled densely from time zero, returns
  dose ÷ (k × Vd) within 1%; two equal falling levels on log-down do not divide by zero.
- `tmic-beta-lactam`: free trough above the MIC returns 100%; free peak below it returns 0%.
  2,000 mg every 8 h, Vd 20 L, half-life 1 h, unbound fraction 1, MIC 32 mg/L: a 0.5-hour
  infusion gives 1.74 h (21.7%) and a 4-hour infusion gives 1.02 h (12.8%) with a peak of
  33.9 mg/L; the closed form must match a numerical integration to 0.01 h in both.
- `kinetic-egfr`: unchanged creatinine at baseline returns the baseline clearance; a rise equal
  to the maximum daily rise over 24 hours returns 0; baseline 1.0 mg/dL, 100 mL/min, 70 kg gives
  a maximum rise of 3.43 mg/dL per day.
- `arc-risk-scores`: 30-year-old man after trauma, creatinine 0.6, modified SOFA 3: ARC 10,
  ARCTIC 9. An 80-year-old woman, creatinine 1.0: ARCTIC 0. Creatinine 1.5 refuses ARCTIC only.
- `crrt-drug-clearance`: SC 0.8, post-dilution ultrafiltrate 2 L/h: 26.7 mL/min. The same with
  1 L/h pre-filter replacement and plasma flow 6 L/h: × 6 ÷ 7.
- Backfills: Cockcroft-Gault at a creatinine of 0.6 uses 0.6 and prints the rounding sentence;
  eGFR 90 at BSA 2.2 m² gives 114 mL/min; the phenytoin free estimate at total 8 mg/L, albumin 2
  g/dL is 1.6 mg/L (0.2) and 1.23 mg/L (0.275); the `lean-body-weight` summary no longer contains
  "Boer."

## Build status

Not started. Specified October 10, 2026.
