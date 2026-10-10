# spec-v1634 — Medication review, medication safety and pharmacovigilance

**Status:** Proposed, October 10, 2026. Specs only; nothing here is built. 30 new tools, 7 of them
build-gated with no numbers stated (tools 24–30). 9 backfills.
**Charter:** [spec-v1627](spec-v1627.md). **Machinery:** [spec-v1628](spec-v1628.md). **Ledger:** [scope-pharmacy-practice.md](scope-pharmacy-practice.md).

A consultant pharmacist reviewing a nursing-home chart, a medication-safety officer classifying an
event report, an anticoagulation-clinic pharmacist adjusting a dose, a drug-safety associate
counting days to a 15-day report, and a drug-information pharmacist turning an odds ratio into a
number needed to treat all do arithmetic or walk a published flowchart by hand. The catalog
already scores most bedside instruments in this area. This wave adds the ones it lacks: the open
causality, severity and interaction-probability instruments, the medication-error index, the FDA
postmarketing reporting clocks, disproportionality statistics, the pediatric anticoagulation
protocols, opioid overdose risk, lactation exposure, and the evidence and economics math.

## Gap finder

**Method.** `catalog.tsv` (2,059 rows) was searched twice: first by 45 domain words, then by about
45 synonym groups (eponyms, drug names, formula outputs). Every hit near a candidate was read in
full, and for seven neighbors the library or `lib/meta.js` entry was read (`anticoag-reversal`,
`drug-burden-index`, `rosendaal-ttr`, `nnt-arr`, `heparin-nomogram`, `diagnostic-2x2`,
`fagan-post-test`). All 30 proposed ids were checked against the catalog and against the other
pharmacy-program specs on October 10, 2026: no collisions.

**Already live in this domain (not proposed again):** `naranjo`, `alden`, `regiscar-dress`,
`rucam`, `r-factor`, `hys-law`, `tisdale-qtc`, `qtc`, `serotonin-toxicity`, `sternbach`,
`nms-criteria`, `beers-check`, `anticholinergic-burden`, `anticholinergic-risk-scale`,
`drug-burden-index`, `rosendaal-ttr`, `same-tt2r2`, `hasbled`, `orbit-bleeding`, `hemorr2hages`,
`atria-bleeding`, `vte-bleed`, `four-ts-hit`, `anticoag-reversal`, `heparin-nomogram`,
`warfarin-init-5mg`, `warfarin-init-10mg`, `warfarin-gage`, `warfarin-iwpc`, `periop-bridging`,
`vte-prophylaxis-dose`, `opioid-mme`, `opioid-risk-tool`, `opioid-conversion`, `naloxone`, `poss`,
`pen-fast`, `mpr-gap-days`, `pdc-star`, `adherence-outreach-list`, `nnt-arr`, `diagnostic-2x2`,
`fagan-post-test`, `proportion-ci`, `cohens-kappa`, `fmea-rpn`, `therapy-cost-compare`,
`morse-falls`, `hendrich-ii`, `stratify`, `downton-fall-risk`, `steadi-algorithm`, `peds-dose`,
`peds-weight-est`, `mehran-cin`.

| Proposed | Live neighbor | Difference |
|---|---|---|
| `liverpool-adr-causality` | `naranjo` | Naranjo is a weighted sum; Liverpool is a branching flowchart built because Naranjo left too many "unknown" answers. Different questions, different result for the same case |
| `who-umc-causality` | `naranjo` | Category definitions matched by criteria, not points; the system regulators and VigiBase use |
| `hartwig-adr-severity` | none | No live tool grades ADR severity |
| `ncc-merp-index` | `fmea-rpn` | FMEA scores a process risk before the fact; the index classifies an error that happened by outcome |
| `fda-adverse-event-report-clock` | `ca-adverse-event-1279` | The California tool is a hospital-to-state report; this is the federal applicant clock |
| `disproportionality-2x2` | `diagnostic-2x2` | Same table shape, different statistics (PRR, ROR, IC) and signal thresholds |
| `riosord` | `opioid-risk-tool`, `opioid-mme` | ORT predicts aberrant behavior; MME is a dose sum; RIOSORD predicts overdose or serious respiratory depression |
| `relative-infant-dose` | none | Nothing in the catalog computes lactation exposure |
| `badri-adr-risk` | `naranjo` | Predicts an ADR before it happens; Naranjo judges one after |
| `at-harm10` | `hospital-score` | Classifies whether an admission was medication-related; HOSPITAL predicts readmission |
| `anticholinergic-list-score` | `anticholinergic-burden`, `anticholinergic-risk-scale` | The live tools take **counts** because their drug lists are not open. This tool ships two openly licensed lists so the reader picks drugs |
| `stopp-start-v3` | `beers-check` | European explicit criteria, and the only one with START (omission) criteria |
| `stoppfall-check` | `downton-fall-risk`, `steadi-algorithm` | Those are patient fall-risk scores; this screens the medication list for fall-risk-increasing classes |
| `peds-heparin-nomogram` | `heparin-nomogram` | Raschke is adult; the pediatric protocol has an age-split rate and its own aPTT table |
| `peds-warfarin-nomogram` | `warfarin-init-5mg`, `warfarin-init-10mg` | Adult fixed-dose nomograms; the pediatric protocol is mg/kg with percent adjustments |
| `warfarin-inr-out-of-range` | `anticoag-reversal` | Reversal handles bleeding; this handles the non-bleeding high or low INR in clinic |
| `ninja-nephrotoxin-exposure` | `kdigo-aki` | KDIGO stages an injury; NINJA flags the exposure that triggers daily creatinine |
| `or-rr-to-nnt` | `nnt-arr` | `nnt-arr` needs two event rates; a meta-analysis gives an odds ratio and the reader has a baseline risk |
| `two-by-two-effect` | `nnt-arr`, `diagnostic-2x2` | Counts in, RR/OR/risk difference with confidence intervals out; neither live tool gives an interval |
| `icer-dominance` | `therapy-cost-compare` | Cost comparison only; no effect, no ratio, no dominance |
| `ade-cost-avoidance` | none | No live intervention-value tool |
| `dips-interaction` | `naranjo` | Naranjo judges one drug and one event; DIPS judges whether an event came from an interaction between two drugs (the catalog's `dipss-mf` is an unrelated myelofibrosis score) |
| `sedative-load` | `drug-burden-index` | The Drug Burden Index is dose-weighted; sedative load is a 2/1 rating per drug |
| `mai-score`, `gerontonet-adr-risk`, `schumock-thornton-preventability`, `inr-variability`, `warfarin-maintenance-adjust`, `medrec-discrepancy-rate`, `budget-impact-pmpm` | `beers-check`, `naranjo`, `rosendaal-ttr`, `warfarin-init-5mg`, `therapy-cost-compare` | None of the seven is computed by a live tool; all seven are build-gated (tools 24–30) |

**Result.** Clinical scores are well covered. The gaps are in the safety officer's and
pharmacovigilance work (nothing live), pediatric anticoagulation (nothing live), opioid overdose
risk, lactation, and evidence and economics math beyond a single NNT.

## Tools

Group is **G** (clinical) unless stated. Every tool reports what the source gives and names it;
none says what to give.

### 1. `liverpool-adr-causality` — Liverpool ADR Causality Assessment

**Input.** Up to nine answers, asked in order, each only when reached:
1. Is an ADR suspected? 2. Did the event appear after the drug was given or the dose increased?
2b. (if no) Were pre-existing symptoms exacerbated by the drug? 3. Did the event improve, with or
without treatment, when the drug was stopped or the dose reduced? (yes / no / unassessable)
4. (if no) Was the event associated with long-lasting disability or impairment? 5. Probability
that the event was due to an underlying disease (low / high or unsure). 6. Positive rechallenge?
7. Objective evidence supporting the causal mechanism? 8. Past history of the same event with this
drug in this patient? 9. Has the event been reported before with this drug?
**Compute.** The flowchart, as read from Figure 2:
- 1 no → **Unlikely**. 2 no and 2b no → **Unlikely**. 2 yes or 2b yes → 3.
- 3 yes or unassessable → 5. 3 no → 4; 4 no → **Possible**; 4 yes → 5.
- 5 low → 6; 6 yes → **Definite**; 6 no → 8.
- 5 high or unsure → 7; 7 no → **Possible**; 7 yes → 8.
- 8 yes → **Definite**; 8 no → 9; 9 yes → **Probable**; 9 no → **Possible**.

**Output.** The category and the path taken.
**Notes carried from the figure.** "Unassessable" covers a drug given once (a vaccine),
intermittent therapy (chemotherapy), or a drug that cannot be stopped (immunosuppressants).
"Objective evidence" means a positive laboratory test of the mechanism (not one merely confirming
the reaction), a supratherapeutic level, or good evidence of a dose-dependent relationship.
**Source.** Gallagher RM et al. *PLoS One* 2011;6(12):e28096,
<https://doi.org/10.1371/journal.pone.0028096>. **Licensing.** CC BY 4.0; question wording may ship
with attribution.

### 2. `who-umc-causality` — WHO-UMC Causality Category

**Input.** Time relationship to drug intake (plausible / reasonable / improbable); alternative
explanation (cannot be explained by disease or other drugs / unlikely / could also be explained /
disease or other drugs give a plausible explanation); response to withdrawal (plausible /
clinically reasonable / lacking or unclear); event definitive pharmacologically or
phenomenologically (yes/no); rechallenge (satisfactory / not done); more data needed or under
examination (yes/no); information insufficient or contradictory and cannot be supplemented
(yes/no).
**Compute.** The first category whose criteria are all met, in the source's order: Certain,
Probable/Likely, Possible, Unlikely, Conditional/Unclassified, Unassessable/Unclassifiable. The
source says "all points should be reasonably complied with."
**Output.** The category, the criteria met, and for the next category up the criterion that failed.
**Source.** Uppsala Monitoring Centre, *The use of the WHO-UMC system for standardised case
causality assessment*, Table 2,
<https://cdn.who.int/media/docs/default-source/medicines/pharmacovigilance/whocausality-assessment.pdf>.
**Licensing.** Unclear: the document carries no license line and UMC's site says "© Uppsala
Monitoring Centre." Ship the site's own short labels for each criterion and cite the table; do not
reproduce it verbatim until terms are confirmed.

### 3. `hartwig-adr-severity` — ADR Severity Level (Hartwig and Siegel)

**Input.** Answers in order: led to death; permanent harm; intensive medical care needed;
lengthened the stay by at least 1 day or was the reason for admission; suspected drug held,
stopped or changed; antidote or other treatment needed.
**Compute.** Level 7 death; 6 permanent harm; 5 a level 4 reaction needing intensive care; 4 a
level 3 reaction that added at least 1 day or caused the admission; 3 drug held, stopped or changed
and/or an antidote or other treatment needed, no added stay; 2 drug held, stopped or changed, no
antidote or other treatment, no added stay; 1 no change in treatment. Bands: mild 1–2, moderate
3–4, severe 5–7.
**Output.** Level and band.
**Source.** Hartwig SC, Siegel J, Schneider PJ. *Am J Hosp Pharm* 1992;49:2229–2232.
**Build gate.** The 1992 paper was not opened. The levels were read in two open papers that print
the same seven-level table, and the bands and level labels in a third (see Research record). The
three agree. Confirm against the original before building. **Licensing.** Level definitions
paraphrased; no verbatim table.

### 4. `ncc-merp-index` — Medication Error Category A to I (NCC MERP)

**Group Q. Input.** The algorithm's questions, asked in order: Did an actual error occur? Did it
reach the patient? (an error of omission does reach the patient) Did it contribute to or result
in death? Was the patient harmed? If not harmed: was intervention to preclude harm or extra
monitoring required? If harmed: was an intervention necessary to sustain life required? Was the
harm permanent / temporary? Did it require initial or prolonged hospitalization?
**Compute.** As drawn in the algorithm:
- no error → **A**; did not reach the patient → **B**; death → **I**.
- not harmed: no monitoring or intervention needed → **C**; needed → **D**.
- harmed, life-sustaining intervention: harm permanent → **G**; not permanent → **H**.
- harmed, no life-sustaining intervention: harm not temporary → **G**; temporary and
  hospitalization → **F**; temporary, no hospitalization → **E**.

**Output.** The category, its definition, and the four-way group (no error; error, no harm;
error, harm; error, death).
**Source.** NCC MERP Index (© 2022; the page says the index was revised in October 2022) and
Algorithm (© 2001), <https://www.nccmerp.org/types-medication-errors>. Both files were the ones
linked from that page on October 10, 2026.
**Licensing.** NCC MERP's notice: "Permission is hereby granted to reproduce information contained
herein provided that such reproduction shall not modify the text and shall include the copyright
notice appearing on the pages from which it was copied." So the category definitions and the four
term definitions (harm, monitoring, intervention, intervention necessary to sustain life) ship
**verbatim with the notice**. This is the one tool in the wave where paraphrase is the violation.

### 5. `fda-adverse-event-report-clock` — FDA Postmarketing Adverse Event Report Deadlines

**Group Q. Input.** Setting (approved NDA/ANDA drug, 21 CFR 314.80; licensed biologic, 600.80;
marketed prescription drug without an approved application, 310.305). Outcome ticks that decide
seriousness (death; life-threatening; inpatient hospitalization or prolongation; persistent or
significant disability/incapacity; congenital anomaly/birth defect; important medical event).
Whether the event is unexpected (not listed in the current labeling). The date the information was
first received. For periodic reports, the date of approval of the application (314.80) or the date
of issuance of the biologics license (600.80).
**Compute.**
- Serious = any outcome ticked.
- Serious and unexpected: 15-day Alert report due no later than **15 calendar days** from initial
  receipt of the information; follow-up within 15 calendar days of receipt of new information
  (21 CFR 314.80(c)(1), 600.80(c)(1), 310.305(c)).
- Everything else (314.80 and 600.80 only): periodic report, quarterly for 3 years from the
  approval or license date and then annual; each quarterly report within 30 days of the close of
  the quarter (the first quarter begins on the approval or license date); each annual report
  within 60 days of the anniversary (314.80(c)(2), 600.80(c)(2)).

**Output.** Which report, the due date, days left, and the paragraph. For periodic reports, the
next four due dates.
**Scope.** Postmarketing reports only. IND safety report clocks (21 CFR 312.32) are specified as
`ind-safety-report-clock` in [spec-v1635](spec-v1635.md). Calendar days as the rule states; the
rule gives no weekend or holiday extension, and the tool says it applies none. The rule lets FDA,
by written notice, extend or re-establish quarterly reporting or set different times; the tool
computes the default schedule and says so. It does not decide causality or expectedness (both are
inputs). Section 310.305 has no periodic report. Devices (part 803), VAERS and dietary supplements
are out.

### 6. `disproportionality-2x2` — Disproportionality From a 2×2 of Report Counts (PRR, ROR, IC)

**Group Q. Input.** Four counts from a spontaneous-report database the reader queried: a (drug and
event), b (drug, other events), c (other drugs, the event), d (other drugs, other events).
**Compute.**
- PRR = [a/(a+b)] ÷ [c/(c+d)], with the chi-squared of the table.
- ROR = (a/b) ÷ (c/d); s = √(1/a + 1/b + 1/c + 1/d); 95% CI = ROR ÷ exp(1.96 s) to
  ROR × exp(1.96 s).
- IC = log₂[(a + 0.5) ÷ (E + 0.5)], E = (a+b)(a+c) ÷ (a+b+c+d). Approximate 95% limits:
  IC₀₂₅ = IC − 3.3 (a+0.5)^(−1/2) − 2 (a+0.5)^(−3/2);
  IC₉₇₅ = IC + 2.4 (a+0.5)^(−1/2) − 0.5 (a+0.5)^(−3/2).

**Output.** The three statistics with intervals, and each published screen stated separately:
Evans (at least 3 cases, PRR at least 2, chi-squared at least 4); EudraVigilance (lower bound of
the ROR interval above 1, and at least 5 cases, or 3 for substances on the additional-monitoring
list unless a post-authorisation safety study is the sole reason for listing; the third EMA
criterion, that the event is on the IME list, is shown as a reader tick); IC₀₂₅ above 0 is
reported as a value only, since the paper read gives no threshold sentence.
**Edge rules.** c = 0: ROR is not computable (EMA sets it to 99.9 by convention; the tool says "not
computable" and mentions the convention). a = 0: the paper says the exact limits, not the
approximate ones, should be used; the tool reports IC without limits. Any zero cell: no ROR
interval.
**Build gate.** The Evans criteria were read in the abstract only, which does not say whether the
chi-squared carries a continuity correction. Read the full paper before choosing; until then the
tool cannot print the Evans screen.
**Scope.** A disproportionate reporting ratio is a screening statistic, not a rate or a risk. The
tool prints that line with every result. No FAERS data ships and none is fetched.

### 7. `riosord` — RIOSORD (Overdose or Serious Opioid-Induced Respiratory Depression)

**Input.** Version (veterans, 2015; commercially insured, 2018), then yes/no items.

| Item | VHA points | Commercial points |
|---|---|---|
| Past 6 months, a visit involving: opioid dependence (VHA) / any substance use disorder (commercial) | 15 | 25 |
| Chronic hepatitis or cirrhosis | 9 | not an item |
| Bipolar disorder or schizophrenia | 7 | 10 |
| Chronic pulmonary disease | 5 | 5 |
| Kidney disease with clinically significant renal impairment (VHA: chronic kidney disease) | 5 | 8 |
| Active traumatic injury, excluding burns | 4 | not an item |
| Sleep apnea | 3 | not an item |
| Stroke or other cerebrovascular disease | not an item | 9 |
| Heart failure | not an item | 7 |
| Nonmalignant pancreatic disease | not an item | 7 |
| Recurrent headache | not an item | 5 |
| ER/LA formulation of any opioid (counted once) | 9 | 5 |
| Methadone | 9 | 10 |
| Oxycodone | 3 | not an item |
| Fentanyl / Morphine / Hydromorphone | not items | 13 / 11 / 7 |
| Prescription antidepressant | 7 | 8 |
| Prescription benzodiazepine | 4 | 9 |
| Maximum prescribed dose, MME/day | ≥100: 16; 50 to <100: 9; 20 to <50: 5 | ≥100: 7 |
| Past 6 months: one or more ED visits / hospitalized one or more days | 11 / 8 | not items |
| Maximum | 115 | 146 |

**Compute.** Sum, then the risk class and its average predicted probability.
VHA: 0–24, 0.03; 25–32, 0.14; 33–37, 0.24; 38–42, 0.34; 43–46, 0.46; 47–49, 0.55; 50–54, 0.64;
55–59, 0.76; 60–66, 0.85; ≥67, 0.94.
Commercial: 0–4, 1.9%; 5–7, 4.8%; 8–9, 6.8%; 10–17, 15.1%; 18–25, 29.8%; 26–41, 55.1%; ≥42, 83.4%.
**Output.** Score, class, the probability, and the items that contributed.
**Note.** Both tables come from case-control samples (8,987 patients with 817 cases, and 36,166
with 7,234 cases, so cases are over-represented), and the printed probability is the model's
average within that sample, not a population incidence. The tool must say so. Methadone scores for
both the ingredient and the ER/LA item in both versions; in the commercial version an ER fentanyl
product does too, and short-acting fentanyl scores the ingredient only.
**Source.** Zedler B et al. *Pain Med* 2015;16:1566–1579 (PMC4744747, Tables 3–4); Zedler BK et al.
*Pain Med* 2018;19(1):68–78 (PMC5939826, Tables 3–4). **Licensing.** Both CC BY-NC-ND. Point
values and classes are facts; item wording is paraphrased (as above), not copied. Nothing in
either paper restricts scoring. Record as "facts only."

### 8. `relative-infant-dose` — Relative Infant Dose and Milk-to-Plasma Ratio

**Input.** Either the average milk concentration, or the M/P ratio with the average maternal
plasma concentration; maternal dose (mg/day) and maternal weight (kg); milk intake (default
150 mL/kg/day, with 200 mL/kg/day offered for early infancy). Optionally the approved infant dose.
**Compute.** Estimated daily infant dosage (mg/kg/day) = M/P × average maternal plasma
concentration × milk intake (or milk concentration × intake). Relative infant dose (%) = infant
dosage ÷ maternal dosage (mg/kg/day) × 100. With an approved infant dose: infant dosage as a
percent of it. Unit conversion (ng/mL, mcg/L, mg/L) is explicit.
**Output.** Infant dosage, RID, the M/P ratio when computed, and the same at 200 mL/kg/day.
**Interpretation.** The FDA guidance gives the formulas and **no cutoff**. The 10% convention is
shown as attributed history only: a 1988 WHO working group called an RID above 10% "usually
unacceptable," and later authors proposed 5% and 25% lines (read in a 2025 review, not in the
primary). The tool says there is no single safe limit.
**Source.** FDA, *Clinical Lactation Studies: Considerations for Study Design* (draft guidance, May
2019, still listed as draft on October 10, 2026), lines 289–292 and 339–361,
<https://www.fda.gov/media/124749/download>.
**Scope.** The guidance says M/P should come from AUCs over multiple time points, not a single
time point; the tool repeats it. No drug data ships.

### 9. `badri-adr-risk` — BADRI (ADR Risk in Hospitalized Older Adults)

**Input.** Five ticks: hyperlipidemia; 8 or more medications; length of stay 12 days or more; use
of antidiabetic agents; high white cell count on admission.
**Compute.** One point each, 0–5.
**Output.** The score and, for the paper's cutoff of more than 1, sensitivity 80% and specificity
55% in the derivation cohort (84% and 43% in the European validation cohort).
**Note.** The paper gives no numeric white-cell threshold in the text read; the tick is "raised
per the reporting laboratory." Median age in derivation was 85.
**Source.** Tangiisuran B et al. "Development and validation of a risk model for predicting
adverse drug reactions in older people during hospital stay" (the Brighton Adverse Drug Reactions
Risk model), *PLoS One* 2014;9(10):e111254 (PMC4214735). CC BY.

### 10. `at-harm10` — AT-HARM10 (Was This Admission Medication-Related?)

**Group Q. Input.** Ten yes/no questions, asked in order: U1–U3 (admission caused by an infection
or newly diagnosed disease, by progression of a known disease, or by trauma, intoxication, social
circumstances or allergy, none medication-related) and P4–P10 (record hints at a medication cause;
side effects; abnormal laboratory values or vital signs; interaction or contraindication; untreated
or under-treated indication; dosage-form problem; withdrawal).
**Compute.** The paper ends the assessment at the first "yes." A yes at U1–U3 → "unlikely
medication-related." Otherwise a yes at P4–P10 → "possibly medication-related." All no → no
classification (the paper sends these to an expert panel).
**Output.** The class and the question that decided it. Validation figures as the paper reports
them for its two assessor groups: sensitivity 70% and 86%, specificity 74% and 70%.
**Source.** Kempen TGH et al. *Int J Clin Pharm* 2019;41:198–206 (PMC6394508). CC BY 4.0; wording
may ship.
**Build gate.** Read the supplementary instructions for use before fixing the question wording and
examples.

### 11. `anticholinergic-list-score` — Anticholinergic Burden From an Open Drug List

**Input.** Scale (German ACB, Kiesel 2018; CRIDECO, Ramos 2022), then the patient's drugs chosen
from that scale's list.
**Compute.** Sum of the listed scores (1, 2 or 3 per drug).
**Output.** Total, each drug's score, the drugs not found on the list (reported as "not on this
scale," never as zero), and the threshold each paper uses: a total of 3 or more, or (Kiesel) any
single drug scored 3.
**Why a new tool.** The live `anticholinergic-burden` and `anticholinergic-risk-scale` take counts
because their lists cannot ship. These two lists are CC BY: Kiesel scored 504 drugs (104 weak,
18 moderate, 29 strong, 356 none); CRIDECO lists 217.
**Source.** Kiesel EK et al. *BMC Geriatr* 2018;18:239 (PMC6180424); Ramos H et al., the CRIDECO
Anticholinergic Load Scale, *J Pers Med* 2022;12(2):207 (PMC8876932).
**Scope.** One list is built for the German market and one for the Spanish; several entries are
not sold in the United States. The tool names the list's country on the result.
**Build gate.** The lists were confirmed present and counted, not transcribed. Parse them from the
articles' tables and assert the counts above.

### 12. `stopp-start-v3` — STOPP/START Version 3 Screen

**Group F (beside `beers-check`). Input.** Age 65 or older, then ticks for the patient's drugs
and conditions, organized by the criteria's physiological systems.
**Compute.** Each STOPP criterion whose drug and condition are both ticked is listed as a
potentially inappropriate prescription; each START criterion whose condition is ticked and whose
drug is absent is listed as a potential omission.
**Output.** The matched criteria with their section letters, and counts.
**Source.** O'Mahony D et al. *Eur Geriatr Med* 2023;14:625–632 (PMC10447584; 133 STOPP and 57
START criteria, 190 in total; the criteria are in the supplementary appendix).
**Licensing.** Read: "pmc-license-ref CC BY", © European Geriatric Medicine Society 2023. The
criteria may ship with attribution.
**Build gate.** The supplementary PDF was not opened. Confirm the supplement carries the article's
license, transcribe all 190, and read the published correction (PMC10447589) first.

### 13. `stoppfall-check` — STOPPFall (Fall-Risk-Increasing Drug Classes)

**Input.** Ticks for the 14 classes: benzodiazepines; benzodiazepine-related drugs;
antipsychotics; antidepressants; opioids; antiepileptics; anticholinergics; diuretics;
alpha-blockers used as antihypertensives; alpha-blockers for prostate hyperplasia;
centrally-acting antihypertensives; antihistamines; vasodilators used in cardiac disease;
medications for overactive bladder and urge incontinence.
**Compute.** The count and the list.
**Output.** The classes present. No score band: the paper defines none.
**Source.** Seppala LJ et al. *Age Ageing* 2021;50:1189–1199 (PMC8244563).
**Licensing.** CC BY-NC-ND. Class names are facts and ship; the paper's deprescribing guidance
table does not (no derivatives).

### 14. `peds-heparin-nomogram` — Pediatric Heparin Protocol (CHEST 2012)

**Group F. Input.** Weight (kg), age under or over 1 year, current rate, and the aPTT.
**Compute.** Loading dose 75 units/kg IV over 10 minutes. Initial maintenance 28 units/kg/h under
1 year, 20 units/kg/h over 1 year. Adjustment to an aPTT of 60–85 s:

| aPTT, s | Bolus, units/kg | Hold, min | Rate change | Repeat aPTT |
|---|---|---|---|---|
| <50 | 50 | 0 | +10% | 4 h |
| 50–59 | 0 | 0 | +10% | 4 h |
| 60–85 | 0 | 0 | 0 | next day |
| 86–95 | 0 | 0 | −10% | 4 h |
| 96–120 | 0 | 30 | −10% | 4 h |
| >120 | 0 | 60 | −15% | 4 h |

The table also says to draw an aPTT 4 hours after the loading dose and 4 hours after every rate
change, and a daily CBC and aPTT once the aPTT is therapeutic.
**Output.** Doses in units and units/h, the new rate, the hold, and the next aPTT time.
**Source.** Monagle P et al. *Chest* 2012;141(2 Suppl):e737S–e801S, 9th ACCP guidelines
(PMC3278066), Table 3.
**Note.** The table assumes the aPTT range reflects an anti-Xa of 0.35–0.70 units/mL; the tool
says so and does not offer an anti-Xa table (the guideline has none). The guideline prints Table 3
as "adapted with permission"; the doses are facts and the table's layout is not copied.

### 15. `peds-warfarin-nomogram` — Pediatric Warfarin Protocol (CHEST 2012)

**Group F. Input.** Weight, phase (day 1; loading days 2–4; maintenance), baseline or current INR,
current dose.
**Compute.** Day 1, baseline INR 1.0–1.3: 0.2 mg/kg orally. Loading days 2–4: INR 1.1–1.3 repeat
the loading dose; 1.4–1.9 50% of it; 2.0–3.0 50%; 3.1–3.5 25%; >3.5 hold until INR <3.5 then
restart at 50% less. Maintenance: 1.1–1.4 increase 20%; 1.5–1.9 increase 10% (see the source
defect below); 2.0–3.0 no change; 3.1–3.5 decrease 10%; >3.5 hold until INR <3.5 then restart at
20% less. Target INR 2–3 only.
**Output.** The dose in mg and the rule applied.
**Source.** Monagle 2012, Table 6 (also "adapted with permission").
**Source defect and build gate.** The table as published on PMC prints the second maintenance
band as "1.15–1.9", which overlaps the first. Reading it as 1.5–1.9 is an inference, not a number
read. Confirm the band against the print edition or the table's cited source before building; the
tool states the defect on the page either way.

### 16. `warfarin-inr-out-of-range` — Out-of-Range INR on Warfarin (CHEST 2012)

**Input.** INR, target range, whether previously stable, bleeding (none / major).
**Compute.**
- Previously stable, a single INR 0.5 or less outside the range: the guideline suggests continuing
  the current dose and testing within 1 to 2 weeks (3.2, Grade 2C).
- INR 4.5–10, no bleeding: suggests against routine vitamin K (9.1a, Grade 2B).
- INR above 10, no bleeding: suggests oral vitamin K (9.1b, Grade 2C). **The recommendation states
  no dose**; the tool says so and gives none.
- Major bleeding: suggests four-factor PCC over plasma, with vitamin K 5 to 10 mg by slow IV
  injection (9.3, Grade 2C); links to `anticoag-reversal`.
- Consistently stable INRs: testing up to every 12 weeks rather than every 4 (3.1, Grade 2B).

**Output.** The matching recommendation, its number and grade.
**Source.** Holbrook A et al. *Chest* 2012;141(2 Suppl):e152S–e184S, 9th ACCP guidelines
(PMC3278055).
**Scope.** INRs outside these bands (for example 3.2 to 4.4 with a 2–3 target and more than 0.5
out) get "the guideline makes no numbered recommendation," not an invented one.

### 17. `ninja-nephrotoxin-exposure` — Nephrotoxin Exposure Flag (NINJA)

**Input.** Number of nephrotoxic medications on the same day; consecutive days of an IV
aminoglycoside; consecutive days of IV vancomycin.
**Compute.** Exposed if 3 or more nephrotoxic medications on one day, or an IV aminoglycoside or
IV vancomycin for 3 or more days.
**Output.** Exposed or not, which limb, and what the program does next (a daily serum creatinine
while exposed).
**Source.** Goldstein SL. "Pediatric Acute Kidney Injury: The Time for Nihilism Is Over," *Front
Pediatr* 2020;8:16 (PMC7005103, CC BY), which restates the program first described in Goldstein SL
et al. *Pediatrics* 2013 (PMID 23940245, paywalled).
**Scope.** The reader decides which drugs count; the program's medication list was not read and
does not ship. Pediatric inpatients. The definition above is the 2020 restatement, which includes
IV vancomycin; the 2013 paper's own wording was not read. The exposure and AKI rate metrics are
gated (see Verify at build).

### 18. `or-rr-to-nnt` — NNT From an Odds Ratio or Relative Risk and a Baseline Risk

**Group E. Input.** The effect measure (OR or RR) with optional confidence limits, and the
patient's baseline risk π₀ (0–1).
**Compute.**
- RR < 1: NNT = 1 ÷ [(1 − RR) π₀]. RR > 1: 1 ÷ [(RR − 1) π₀].
- OR < 1: NNT = 1 ÷ [(1 − OR) π₀] + OR ÷ [(1 − OR)(1 − π₀)].
  OR > 1: 1 ÷ [(OR − 1) π₀] + OR ÷ [(OR − 1)(1 − π₀)].
- The same on each confidence limit; when the interval for the effect crosses 1 the NNT interval
  is shown as NNTB … ∞ … NNTH (Altman's presentation), never as a pair of numbers.

**Output.** NNT (benefit or harm), rounded up, with the unrounded value, and the absolute risk
difference it implies.
**Source.** Mendes D et al. "Number needed to treat (NNT) in clinical literature: an appraisal,"
*BMC Med* 2017;15:112 (PMC5455127, CC BY), formulas (1) and (2) as printed; Altman DG, "Confidence
intervals for the number needed to treat," *BMJ* 1998;317:1309–1312 (PMC1114210) for the interval.

### 19. `two-by-two-effect` — Risk Ratio, Odds Ratio and Risk Difference With Intervals

**Group E. Input.** Events and totals in two groups.
**Compute.** Risks, risk difference, RR, OR. OR interval: SE of ln OR = √(1/a + 1/b + 1/c + 1/d),
exp(ln OR ± 1.96 SE). NNT = 1 ÷ risk difference, with its interval taken as the reciprocals of the
risk-difference limits in reversed order.
**Output.** Each measure with its 95% interval; NNTB or NNTH; a zero-cell refusal for the OR
interval.
**Source.** Bland JM, Altman DG, "The odds ratio," *BMJ* 2000;320:1468 (PMC1127651); Altman 1998
(NNT).
**Build gate.** The standard errors of ln RR and of the risk difference were not read. Read them
in a primary statistics source (the 1988 *BMJ* paper on confidence intervals for relative risks,
PMC2545775, was located but not opened) before building those two intervals.

### 20. `icer-dominance` — Incremental Cost-Effectiveness and Dominance

**Group Q. Input.** Two or more mutually exclusive options, each with a cost and an effect (QALYs
or a natural unit); optionally a willingness-to-pay value.
**Compute.** Remove strongly dominated options (another costs less and does better). Order the
rest by effect; compute each ICER against the next less effective option (difference in cost ÷
difference in effect); remove any option whose ICER exceeds that of a more effective option
(extended dominance); repeat. With a willingness-to-pay value, net monetary benefit = value ×
effect − cost (gated, see Scope).
**Output.** The frontier table, each excluded option with the reason, and for two options the
quadrant (dominant, dominated, or a trade-off with the ICER).
**Source.** VA Health Economics Resource Center, *Cost-Effectiveness Analysis*,
<https://www.herc.research.va.gov/include/page.asp?id=cost-effectiveness-analysis>.
**Scope.** No threshold ships; the page read says the Public Health Service panel recommended no
standard. The net-benefit formula is not on the page read: **build gate**, cite a primary before
shipping that output.

### 21. `ade-cost-avoidance` — Pharmacist Intervention Cost Avoidance (Nesbit Method)

**Group Q. Input.** Interventions, each with a probability class and the cost of the adverse event
it averts (reader input); optionally the pharmacist time cost.
**Compute.** Cost avoidance = Σ probability × cost. Classes: none 0, very low 0.01, low 0.1,
medium 0.4, high 0.6.
**Output.** Total, by class, and net of time cost.
**Source.** Nesbit TW et al. *Am J Health Syst Pharm* 2001 (not opened); the probabilities as
restated in Abushanab D et al. "Economic impact of clinical pharmacist interventions in a general
tertiary hospital in Qatar," *PLoS One* 2023;18:e0286419, doi 10.1371/journal.pone.0286419
(CC BY).
**Scope.** Every dollar figure is reader input. The class assigned to an intervention is the
reader's judgment; the tool multiplies and says so.

### 22. `dips-interaction` — Drug Interaction Probability Scale

**Input.** Ten questions about a suspected interaction between a precipitant drug and an object
drug, each answered yes / no / unknown or not applicable.
**Compute.** Sum of the points. Unknown or not applicable scores 0 on every question.

| # | Question (our label) | Yes | No |
|---|---|---|---|
| 1 | Previous credible reports of this interaction in humans | +1 | −1 |
| 2 | Consistent with the known interactive properties of the precipitant drug | +1 | −1 |
| 3 | Consistent with the known interactive properties of the object drug | +1 | −1 |
| 4 | Consistent with the known or reasonable time course (onset or offset) | +1 | −1 |
| 5 | Remitted on dechallenge of the precipitant with no change in the object drug | +1 | −2 |
| 6 | Reappeared when the precipitant was given again with the object drug continued | +2 | −1 |
| 7 | Reasonable alternative causes for the event | −1 | +1 |
| 8 | Object drug detected in blood or other fluids at concentrations consistent with the interaction | +1 | 0 |
| 9 | Confirmed by objective evidence of the effect on the object drug, other than the levels in question 8 | +1 | 0 |
| 10 | Greater when the precipitant dose was raised, or less when it was lowered | +1 | −1 |

With no dechallenge, question 5 is answered unknown or not applicable and question 6 is skipped.
Bands: highly probable, more than 8; probable, 5 to 8; possible, 2 to 4; doubtful, less than 2.
The points allow −9 to +11 (computed from the table).
**Output.** The score, the band, and each answer's points.
**Source.** Horn JR, Hansten PD, Chan LN. *Ann Pharmacother* 2007;41:674–680 (paywalled; abstract
only). The weights and bands were read in four open papers that reprint the scale with identical
values: McGrane IR et al. *Ment Health Clin* 2021 (PMC8463003), Li Y et al. *J Int Med Res* 2023
(PMC10467403), Fan W et al. *Anticancer Drugs* 2024 (PMC10720802) and van Dijk LMM et al.
*Neuropediatrics* 2024 (PMC11383621).
**Licensing.** The question wording is the authors' and the paper is not open. Ship the site's own
short labels (as above) and cite the paper; point values and bands are facts.
**Build gate.** Confirm the table against Horn 2007 or the authors' posted form before shipping.
One open case report (PMC10712123) scored a "no" on question 7 as 0 rather than +1; the four
reprints above and a 2024 review (PMC11162198) give +1.

### 23. `sedative-load` — Sedative Load

**Input.** The number of the patient's drugs the reader assigns to group 1 (primary sedatives) and
to group 2 (drugs with sedation as a prominent side effect, or preparations with a sedating
component).
**Compute.** Sedative load = 2 × group 1 drugs + 1 × group 2 drugs. Group 3 (sedation as a
potential adverse effect) and group 4 (no known sedative properties) are not rated; the paper read
names the exclusion of group 3 as a drawback of the model.
**Output.** The total and its two parts. No band: the paper read states none.
**Source.** Linjakumpu T et al. "A model to classify the sedative load of drugs," *Int J Geriatr
Psychiatry* 2003;18:542–544 (PMID 12789678; not opened). The groups, the 2 and 1 ratings and the
sum were read in Parsons C et al. "Sedative load of medications prescribed for older people with
dementia in care homes," *BMC Geriatr* 2011;11:56 (PMC3197480, CC BY).
**Scope.** The model's drug-to-group list was not read and does not ship; the reader assigns the
group, and the page says so.
**Build gate.** Read the 2003 paper (or its later update) for the group definitions before
building.

**Build-gated tools: numbers not read (tools 24–30).** Each of these has a named primary source
that was not opened, or open reproductions that disagree.
No weight, band or formula is stated here, and none may be added until the source is read.

### 24. `mai-score` — Medication Appropriateness Index (Summated)

**Input.** Per drug, ten ratings (indication, effectiveness, dosage, directions correct,
directions practical, drug-drug interactions, drug-disease interactions, duplication, duration,
expense), each appropriate / marginal / inappropriate.
**Compute.** A weighted sum per drug and across the regimen. The developers' 2013 review says each
item carries a weight of 1 to 3 for an inappropriate rating, 18 is the highest score per drug, and
a patient's score is the sum over drugs. It does not print the weight of each item.
**Source.** Hanlon JT et al. *J Clin Epidemiol* 1992;45:1045–1051 (the index); Samsa GP et al.
*J Clin Epidemiol* 1994;47:891 (the weights); Hanlon JT, Schmader KE, *Drugs Aging* 2013
(PMC3831621, author manuscript).
**Build gate.** Neither primary was opened. Two open papers that restate the per-item weights
**disagree**: one gives practical directions 1 and drug-disease interactions 2 (*Medicine* 2017,
PMC5585512), the other the reverse (*Pharm Pract* 2012, PMC3780501). Under the admission rules two
sources that disagree on a number means no number ships. Read Samsa 1994. Item wording is the
authors'; ship the site's own labels for the ten dimensions.

### 25. `gerontonet-adr-risk` — GerontoNet ADR Risk Score

**Input.** Six variables named in the abstract: number of drugs, prior ADR, heart failure, liver
disease, 4 or more conditions, renal failure.
**Compute.** A point sum. **Build gate.** Onder G et al. *Arch Intern Med* 2010;170:1142 was not
opened and the abstract does not give the points. No open reproduction of the full point table was
found on October 10, 2026.

### 26. `schumock-thornton-preventability` — ADR Preventability (Schumock and Thornton)

**Input.** The scale's yes/no questions. **Compute.** Preventable if any question is answered yes.
**Build gate.** Schumock GT, Thornton JP. *Hosp Pharm* 1992;27:538 was not opened. The version
read is a later "modified" two-section form in a review whose description of the scale contradicts
its own table. The original question set is needed.

### 27. `inr-variability` — INR Variability (Fihn Variance Growth Rate)

**Input.** Dated INRs and the target. **Compute.** The variance growth rate.
**Build gate.** Fihn SD et al. *Ann Intern Med* 1993 (PMID 8280198) was not opened. Several open
papers use the method; none read prints the formula.

### 28. `warfarin-maintenance-adjust` — Warfarin Maintenance Dose Adjustment (RE-LY Algorithm)

**Input.** INR and current weekly dose. **Compute.** A percent change in the weekly dose by INR
band. **Build gate.** Van Spall HGC et al. *Circulation* 2012;126:2309 was not opened (the
publisher returned 403); the abstract-level summary says "10% to 15% weekly dose changes" only.
The INR bands and percent changes are needed.

### 29. `medrec-discrepancy-rate` — Medication Reconciliation Discrepancy Rate

**Group Q. Input.** Counts from a reconciliation audit. **Compute.** The measure's rate.
**Build gate.** The NQF 2456 measure specification was not searched for or opened. The numerator,
denominator and sampling rule are needed, and so is the measure's license.

### 30. `budget-impact-pmpm` — Budget Impact Per Member Per Month

**Group Q. Input.** A budget impact, a member count and a period. **Compute.** The per-member
per-month figure. **Build gate.** ISPOR Budget Impact Analysis Good Practice II, *Value Health*
2014 (PMID 24438712) was not opened; the formula is not stated here.

## Backfills (live tools that should do more)

Backfills 1–7 correct or source a number in a live tool and are indexed in
[spec-v1641](spec-v1641.md).

1. **`anticoag-reversal`: andexanet is no longer sold in the United States.** The FDA safety
   communication dated December 18, 2025 (page current as of December 19, 2025) says "the FDA
   considers the risks of the product to outweigh its benefits," that AstraZeneca "has submitted a
   request to voluntarily withdraw the BLA for the product for commercial reasons," and that
   "Andexxa will no longer be manufactured for or sold in the U.S. by AstraZeneca after December
   22, 2025." The communication mentions no recall. The live tool still offers "Apixaban /
   Rivaroxaban (andexanet)" in its agent list, returns "Andexanet alfa" with the low-dose and
   high-dose regimens (400 mg bolus then 4 mg/min for 120 minutes; 800 mg then 8 mg/min for 120
   minutes, which match the label's Table 1), and names andexanet in its catalog summary. It
   should say the manufacturer ended U.S. sales after December 22, 2025, quote the FDA's
   risk-benefit sentence with its date, and keep the label regimen only as a dated record. DailyMed
   still lists an Andexxa label (version 7, published April 28, 2026), and FDA's product page
   still lists BLA 125586; the tool must not treat a listed label as availability.
2. **`anticoag-reversal`: the 4F-PCC alternative for apixaban and rivaroxaban needs a source.**
   The live tool prints "If andexanet unavailable: 4F-PCC 50 units/kg." With andexanet gone this
   line becomes the only number on that path. Neither 4F-PCC label carries a factor Xa inhibitor
   indication (both are for vitamin K antagonist reversal), so the figure is not a label dose. The
   page should name the guideline it comes from, and the figure should be re-read there at build.
3. **`anticoag-reversal`: cite both 4F-PCC labels.** The live bands match both labels read (INR 2
   to <4, 25 units of Factor IX per kg, not to exceed 2,500; 4–6, 35, 3,500; >6, 50, 5,000; dose
   based on body weight up to but not exceeding 100 kg). Add Balfaxar by name: same table, but its
   indication is need for urgent surgery or invasive procedure only, while Kcentra's also covers
   acute major bleeding. Add both labels' sentence that repeat dosing "is not recommended."
4. **`anticoag-reversal`: vitamin K dose.** The live example prints "Vitamin K 10 mg IV." CHEST
   2012 recommendation 9.3 says 5 to 10 mg by slow IV injection; the Kcentra and Balfaxar labels
   say to give vitamin K concurrently and state no dose. Print the range and its source.
5. **`anticoag-reversal`: protamine by time since heparin.** Live: 1 mg per 100 units, 50 mg cap.
   The label says each mg neutralizes not less than 100 USP heparin units, that 30 minutes after an
   IV heparin dose "one-half the usual dose may be sufficient," and that it is given by very slow
   IV injection over 10 minutes "in doses not to exceed 50 mg." CHEST 2012 gives a table by time
   since the last heparin dose: <30 min 1.0 mg; 30–60 min 0.5–0.75 mg; 60–120 min 0.375–0.5 mg;
   >120 min 0.25–0.375 mg, each per 100 units received, maximum 50 mg, infusion of a 10 mg/mL
   solution not faster than 5 mg/min. That table is Table 4 of the **neonates and children**
   guideline (Monagle 2012) and counts heparin received in the previous 2 hours. Add a time input,
   show the label sentence for all patients, and label the table as pediatric.
6. **`rosendaal-ttr`: percent of INRs in range.** Add the count-based fraction beside the
   interpolated one (the library already counts tests below, in and above range). The live note
   and band "good control is commonly ≥ 65%" need their own citation or should go: the figure was
   not found in any source read.
7. **`opioid-mme`: the naloxone line.** At 50 MME/day or more the 2022 CDC guideline says to
   "offer naloxone and overdose prevention education to both the patient and the patient's
   household members." The live summary mentions only "reassess."
8. **`nnt-arr`: counts and an interval.** Accept events and totals, and report the NNT interval
   Altman's way (NNTB … ∞ … NNTH when the risk-difference interval crosses zero). Or link to
   `two-by-two-effect`.
9. **`drug-burden-index`, `naranjo`, `anticholinergic-burden`, `anticholinergic-risk-scale`:
   notes and links.** `drug-burden-index` takes δ as reader input, which is right (no open table
   of minimum doses exists); the page should say what the paper used for δ, a sentence that was
   not read because the paper is paywalled (verify at build). The other three get related links to
   the new causality tools and to `anticholinergic-list-score`.

## Rejected

| Idea | Why not |
|---|---|
| Morisky MMAS-4/8 | Licensed; named in the charter ([spec-v1627](spec-v1627.md)) |
| MARS-5, BMQ, Hill-Bone, SEAMS | Owner-controlled questionnaires; no open license found; item wording is the instrument |
| ARMS (Kripalani 2009) | Paper is not open access; the only usage statement found (a PhenX summary) limits it to academic and nonprofit use. Wording cannot ship; twelve 1–4 ratings with no wording is not a tool |
| Medication Regimen Complexity Index (George 2004) | Used by others "with author's and publisher's permission"; 65 weighted items are the instrument. Admission rule 6 ([spec-v1500](spec-v1500.md)) |
| ACB, ARS, ADS, AEC as drug-pick tools | Their lists are not openly licensed. As count-in tools they duplicate the two live count tools (same 1/2/3 arithmetic) |
| A third and fourth open list (Korean ACB, Salahudeen composite) | Two open lists are enough; Salahudeen 2015 is a systematic review of other scales' scores, some of them closed |
| FORTA, PRISCUS 2.0, EU(7)-PIM | Lists for other countries' formularies; a pick-from-list tool with no computation beyond membership. Not opened |
| STOPPFrail version 2 | *Age Ageing* 2021, not open access, no license; criteria wording is the instrument |
| MedStopper, deprescribing.org algorithms | A site, not a source; licenses not read |
| RISQ-PATH | Depends on the CredibleMeds list (licensed) |
| PHARM-EM / PHARM-CRIT cost-avoidance tables | CC BY-NC-ND; 2019-dollar values per intervention would be a dated table the site must maintain. The Nesbit method with reader-entered costs covers the need |
| EBGM / MGPS | Needs a prior fitted to the whole database. Admission rule 3 |
| Adult heparin anti-Xa nomogram | No published primary nomogram; every one found is institutional. The live tool already lets the reader pick bands |
| Pediatric enoxaparin anti-Xa dose-adjustment table | **Not in CHEST 2012** (read in full for it). It appeared in the 2008 edition, which is paywalled and superseded |
| University of Wisconsin warfarin tables | Institutional |
| Warfarin weekly tablet-split planner | Pure arithmetic with no primary source; belongs with dispensing if anywhere |
| DOAC level interpretation | No label or guideline threshold |
| Pediatric dose-range checker with reader-entered limits | No source (admission rule 2); label dose checks are specified in [spec-v1632](spec-v1632.md) |
| Metformin and contrast, clozapine ANC, DOAC dose-reduction criteria | Label rules; label dose checks are specified in [spec-v1632](spec-v1632.md) |
| "Triple whammy" counter, polypharmacy count index, hyperkalemia risk | No instrument with a primary source; a count against an unsourced threshold |
| HEP score for HIT | Hematology; `four-ts-hit` is live. Not opened |
| Naloxone co-prescribing checker as its own tool | One sentence in the CDC guideline; made a backfill |
| TTR quality bands | Not in the method paper; no band shipped without a source |
| Pregnancy exposure math | Nothing computable was found |
| PDMP checks | State rules; `pmp-check-required` is live |
| Medication-pass error rate (`med-error-rate`) as its own tool here | Specified once, as `med-pass-error-rate` in [spec-v1638](spec-v1638.md) |
| Opioid taper schedule (`opioid-taper-schedule`) as its own tool here | Specified once, as `taper-calendar` in [spec-v1633](spec-v1633.md) |
| IND safety report clock as a setting of tool 5 | Specified once, as `ind-safety-report-clock` in [spec-v1635](spec-v1635.md) |

## Research record

Sources were read on October 10, 2026. Rows marked **second read** were added or corrected by the
verification pass the same day.

| Finding | Where read | Effect on the spec |
|---|---|---|
| Liverpool tool is a flowchart; all nine nodes and every edge (re-read against the figure on second read: no change) | Figure 2 image, <https://journals.plos.org/plosone/article/figure/image?size=large&id=10.1371/journal.pone.0028096.g002>; license line in Europe PMC full text PMC3237416 | Tool 1 built from the figure, wording may ship |
| WHO-UMC Table 2, six categories, "all points should be reasonably complied with" | <https://cdn.who.int/media/docs/default-source/medicines/pharmacovigilance/whocausality-assessment.pdf> (the who-umc.org link now returns a login page) | Tool 2; licensing recorded as unclear |
| Hartwig levels 1–7 and bands | Manjhi PK et al. *Cureus* 2024, Table 9 (PMC11162198); level labels including 4(a)/4(b) and the same bands in Sundaran S et al. *Pharmacy (Basel)* 2018 (PMC6306913) | Tool 3 with a build gate; the Cureus prose calls it a "five-point" scale above a seven-level table |
| **Second read:** a third open paper prints the same seven Hartwig levels and the same bands | *J Family Med Prim Care* 2025, Table 3 (PMC12633994) | Tool 3: three reproductions agree; the gate on the 1992 original stays |
| NCC MERP categories A–I, four definitions, the algorithm, and the permission notice; the page says the index was revised in October 2022 and links the 2022 index and the 2001 algorithm | <https://www.nccmerp.org/sites/default/files/index-bw-2022.pdf>; algorithm PDF `algorBW2001-06-12.pdf` rendered and read as an image; <https://www.nccmerp.org/types-medication-errors> | Tool 4; ships verbatim with notice |
| 15 calendar days from initial receipt; follow-up 15; quarterly for 3 years then annual; 30 and 60 days; seriousness outcomes; "unexpected" is "not listed in the current labeling" | eCFR versioner, title 21 as of October 7, 2026: §§ 314.80, 600.80, 310.305 | Tool 5. § 310.305 has no periodic report |
| **Second read:** the § 600.80 periodic clock runs from "the date of issuance of the biologics license," not an approval date; FDA may change the schedule by written notice | eCFR, § 600.80(c)(2) and § 314.80(c)(2), as of October 7, 2026 | Tool 5 input and scope reworded |
| ROR formula, s, CI, c = 0 convention (99.9), SDR criteria (lower bound >1; ≥3 or ≥5 cases; IME) | EMA/849944/2016, *Screening for adverse reactions in EudraVigilance*, §4.1 and §13.1, <https://www.ema.europa.eu/en/documents/other/screening-adverse-reactions-eudravigilance_en.pdf> | Tool 6 |
| **Second read:** the 3-case threshold applies to additional-monitoring substances "unless the sole reason for inclusion on the list is the request of a post-authorisation safety study" | Same document, §4.1 | Tool 6 output wording |
| PRR minimum criteria: 3 or more cases, PRR at least 2, chi-squared at least 4 | PubMed abstract, PMID 11828828 (Evans 2001) | Tool 6; full paper not read, so the form of the chi-squared is a build gate |
| PRR as a/(a+b) ÷ c/(c+d); shrinkage IC with α₁ = α₂ = 1/2; approximate limit formulas (13) and (14); exact limits required at O = 0 | Norén GN et al. *Stat Methods Med Res* 2013;22:57–69 (PMC6331976) | Tool 6 |
| RIOSORD VHA items, points, max 115, ten classes; 8,987 patients (817 cases) | Zedler 2015, Tables 3–4 (PMC4744747) | Tool 7 |
| RIOSORD commercial items, points, max 146, seven classes; 36,166 patients (7,234 cases) | Zedler 2018, Tables 3–4 (PMC5939826) | Tool 7; two versions, not one. Both point columns were summed on second read and match the printed maximums |
| ≥50 MME naloxone sentence | CDC 2022 guideline, Europe PMC full text PMC9639433 (cdc.gov returned "Access Denied") | Backfill 7 |
| 150 and 200 mL/kg/day; infant dosage and RID formulas; no cutoff | FDA draft guidance, lines 289–292, 339–361; FDA's guidance page still lists it as draft (page current as of May 6, 2020) | Tool 8 |
| 10% (WHO 1988), 5% and 25% proposals | *Basic Clin Pharmacol Toxicol* 2025 (PMC12450841) | Shown as attributed history, not as a band |
| BADRI five variables at 1 point, cutoff >1, accuracy | Tangiisuran 2014 (PMC4214735), Tables 4–5 | Tool 9 |
| AT-HARM10 ten questions and U/P logic; "the assessment is finished as soon as the answer is 'yes' to any of the questions" | Kempen 2019 (PMC6394508), Table 1 and Methods | Tool 10; the order rule is in the main text, so the build gate narrows to wording |
| **Second read, correction:** AT-HARM10 specificity is 74% and 70% (paired with sensitivity 70% and 86%), not 70% and 74% | Kempen 2019 abstract: "sensitivity and specificity values were 70/86% and 74/70%" | Tool 10 output corrected |
| Kiesel: 504 scored, 104/18/29, 356 none; rule "one drug scored 3 or ... a summated score of 3 or higher"; CC BY | PMC6180424 | Tool 11 |
| CRIDECO: 217 drugs; ≥3 as clinically relevant; CC BY | PMC8876932 | Tool 11 |
| STOPP/START v3: 133 + 57 = 190; CC BY; criteria in supplement; correction exists | PMC10447584 | Tool 12, gated on the supplement |
| STOPPFall: 14 classes named; CC BY-NC-ND | PMC8244563 | Tool 13, class names only |
| Pediatric heparin (Table 3), protamine by time (Table 4), LMWH doses (Table 5), warfarin (Table 6) | Monagle 2012, <https://pmc.ncbi.nlm.nih.gov/articles/PMC3278066/> | Tools 14–15, backfill 5. **No enoxaparin anti-Xa adjustment table exists in this edition**; Table 6 prints "1.15–1.9" |
| **Second read:** the protamine-by-time table is in the neonates-and-children guideline, is based on heparin received in the previous 2 hours, and carries "Maximum dose of 50 mg" and a 5 mg/min limit; Tables 3 and 6 are "adapted with permission" | Monagle 2012, Tables 3, 4 and 6 | Backfill 5 labels the table pediatric; tools 14–15 note the adaptation |
| CHEST 2012 recs 3.1, 3.2, 9.1, 9.3 with grades; no oral vitamin K dose in the recommendation (the discussion cites studies that used 2 mg and 2.5 mg) | Holbrook 2012, <https://pmc.ncbi.nlm.nih.gov/articles/PMC3278055/> | Tool 16 gives no oral dose |
| NINJA exposure definition includes IV vancomycin | Goldstein 2020 (PMC7005103) | Tool 17 has a vancomycin limb as well as an aminoglycoside limb |
| OR and RR to NNT formulas | Mendes 2017 (PMC5455127), formulas (1) and (2) as printed; the OR form was re-derived on second read and agrees | Tool 18 |
| NNT interval by reciprocals; NNTB/NNTH through infinity | Altman 1998 (PMC1114210) | Tools 18–19, backfill 8 |
| SE of ln OR; worked example OR 4.89 (4.00 to 5.99), recomputed on second read | Bland and Altman 2000 (PMC1127651) | Tool 19 |
| ICER, strong and extended dominance, no standard threshold | VA HERC page (fetched) | Tool 20 |
| **Second read:** the HERC example's two tables disagree on standard care's cost ($5,000 in the first, $10,000 in the second); only $5,000 reproduces the printed ICER of 5,000 for option B | VA HERC page | Tool 20 test uses $5,000 and says why |
| Nesbit probabilities 0, 0.01, 0.1, 0.4, 0.6 | Abushanab 2023 (PMC10234553), Methods | Tool 21; original not read |
| **Second read:** DIPS weights for all ten questions, the skip rule for question 6, and the four bands, identical in four open reprints | PMC8463003, PMC10467403, PMC10720802, PMC11383621; bands also in PMC12076841; one case report (PMC10712123) scores question 7 "no" as 0 | Tool 22 promoted from "described without numbers" to a specified tool with a confirm-against-original gate |
| **Second read:** sedative load groups 1–4, ratings 2 and 1, sum; group 3 is excluded from the model; the 2003 primary's citation | Parsons 2011 (PMC3197480) | Tool 23 promoted; the drug-to-group list stays reader input |
| **Second read:** MAI items weigh 1–3, maximum 18 per drug, summed across drugs; per-item weights are not in the developers' review, and two open restatements disagree on which of practical directions and drug-disease interactions weighs 2 | Hanlon and Schmader 2013 (PMC3831621, read through the NCBI efetch service); PMC5585512; PMC3780501 | Tool 24 stays gated with no weights |
| **Second read:** GerontoNet points, the Fihn formula and the RE-LY algorithm bands were searched for again in Europe PMC full text and not found in a paper that prints them in full | Europe PMC searches | Tools 25, 27 and 28 stay gated |
| Kcentra and Balfaxar tables, 100 kg weight limit, repeat dosing not recommended, vitamin K "concurrently" with no dose; Kcentra covers acute major bleeding and urgent surgery, Balfaxar urgent surgery or invasive procedure only; Andexxa Tables 1–2; Praxbind 5 g; protamine "one-half" at 30 min, 50 mg, 10 minutes (labels re-fetched on second read: no change) | DailyMed SPLs eee1afb8… (Kcentra, version 13), 68fa4f90… (Balfaxar, version 4), 2d9d90a6… (Andexxa, version 7), c7400f8a… (Praxbind), c76876da… (protamine) | Backfills 1–5 |
| **Second read:** the FDA Andexxa communication was fetched and read directly. Dated December 18, 2025, content current as of December 19, 2025. It says FDA "considers the risks of the product to outweigh its benefits," that the company "has submitted a request to voluntarily withdraw the BLA for the product for commercial reasons," that it "will end U.S. commercial sales today, December 22, 2025," and that the product "will no longer be manufactured for or sold in the U.S. by AstraZeneca after December 22, 2025." It cites ANNEXA-I: thrombosis 14.6% versus 6.9%, thrombosis-related death at day 30 2.5% versus 0.9% | <https://www.fda.gov/safety/medical-product-safety-information/update-safety-andexxa-astrazeneca-fda-safety-communication> | Backfill 1 reworded to the page's own sentences. The earlier draft had this from a search summary |
| **Second read:** FDA's Andexxa product page still lists STN BLA 125586 (content current as of December 18, 2025); a Federal Register search for "Andexxa" returned no notice after October 2, 2024 | <https://www.fda.gov/vaccines-blood-biologics/cellular-gene-therapy-products/andexxa>; Federal Register API | Whether the license withdrawal is complete is not confirmed: verify at build |
| ARMS, MRCI are permission-based | Search results only (PhenX summary; adapters' "with permission" statements) | Rejected |
| Live `anticoag-reversal` returns andexanet with a 4F-PCC 50 units/kg alternative, prints "Vitamin K 10 mg IV," caps protamine at 50 mg, and cites a 2016 guideline; live `rosendaal-ttr` already counts tests below/in/above and prints a ≥ 65% band | `lib/clinical-v8.js` lines 235–291; `views/group-f.js` lines 204 and 240; `lib/gaps-v185.js` lines 355–458; `lib/meta.js` | Backfills 1–6 |

## Verify at build

- **Tool 2:** UMC's reproduction terms. **Tool 3:** the 1992 paper.
- **Tool 4:** whether the 2022 index and the 2001 algorithm are still the current files, and place
  the notice exactly as the page prints it (the page says the copyright year changes each
  January).
- **Tool 5:** the definitions of "unexpected" for § 600.80 and § 310.305 were read; the biologics
  exceptions in § 600.80 (for example blood products) were not. Read § 600.80(k)–(m) before
  building the biologics branch.
- **Tool 6:** Evans 2001 and van Puijenbroek 2002 in full (including the form of the chi-squared);
  the threshold convention for IC₀₂₅.
- **Tool 7:** how each version defines "current maximum prescribed dose" when the dose varies.
- **Tool 8:** whether the FDA guidance has been finalized since May 2019; the WHO 1988 source.
- **Tool 9:** a numeric white-cell threshold, if the paper's tables give one.
- **Tool 10:** the supplementary instructions. **Tools 11–12:** transcribe and count the lists.
- **Tool 13:** whether naming the classes under an ND license needs a notice.
- **Tools 14–15:** the source the guideline adapted its tables from (its reference 53), and
  whether the adaptation needs a credit line.
- **Tool 15:** the correct lower bound of the second maintenance band (print vs PMC).
- **Tool 17:** the 2013 paper's exposure definition and drug list, and the program's rate
  definitions.
- **Tool 19:** SE of ln RR and of the risk difference. **Tool 20:** the net-benefit source.
- **Tool 21:** Nesbit 2001 itself. **Tool 22:** Horn 2007 or the authors' form, question 7 in
  particular. **Tool 23:** Linjakumpu 2003 and the group list.
- **Tools 24–30:** weights, bands and formulas, entirely, each from the primary named in the tool.
- **Backfill 1:** whether BLA 125586 has been withdrawn (Purple Book or a Federal Register
  notice), and whether any U.S. stock remains in date. **Backfill 2:** the guideline behind
  4F-PCC 50 units/kg for factor Xa inhibitors. **Backfill 9:** Hilmer 2007.

## Sources

- Gallagher RM et al. *PLoS One* 2011;6(12):e28096 (CC BY).
- Uppsala Monitoring Centre, WHO-UMC causality assessment system (WHO-hosted PDF).
- Hartwig SC, Siegel J, Schneider PJ. *Am J Hosp Pharm* 1992;49:2229–2232; as reproduced in
  PMC11162198, PMC6306913 and PMC12633994.
- NCC MERP Index (2022) and Algorithm (2001), nccmerp.org.
- 21 CFR 310.305, 314.80, 600.80 (eCFR, October 7, 2026).
- EMA/849944/2016; Evans SJW et al. 2001 (PMID 11828828, abstract); Norén GN et al. 2013
  (PMC6331976).
- Zedler B et al. *Pain Med* 2015;16:1566–1579 (PMC4744747); Zedler BK et al. *Pain Med*
  2018;19(1):68–78 (PMC5939826).
- CDC Clinical Practice Guideline for Prescribing Opioids for Pain, 2022 (PMC9639433).
- FDA, *Clinical Lactation Studies: Considerations for Study Design* (draft, 2019).
- Tangiisuran B et al. *PLoS One* 2014;9(10):e111254 (PMC4214735). Kempen TGH et al. *Int J Clin
  Pharm* 2019;41:198–206 (PMC6394508).
- Kiesel EK et al. *BMC Geriatr* 2018;18:239 (PMC6180424). Ramos H et al. *J Pers Med*
  2022;12(2):207 (PMC8876932).
- O'Mahony D et al. *Eur Geriatr Med* 2023;14:625–632 (PMC10447584). Seppala LJ et al. *Age
  Ageing* 2021;50:1189–1199 (PMC8244563).
- Monagle P et al. *Chest* 2012;141(2 Suppl):e737S–e801S (PMC3278066). Holbrook A et al. *Chest*
  2012;141(2 Suppl):e152S–e184S (PMC3278055).
- Goldstein SL. *Front Pediatr* 2020;8:16 (PMC7005103) for NINJA.
- Mendes D et al. *BMC Med* 2017;15:112 (PMC5455127); Altman, *BMJ* 1998 (PMC1114210); Bland and
  Altman, *BMJ* 2000 (PMC1127651).
- VA HERC, *Cost-Effectiveness Analysis*. Abushanab D et al. *PLoS One* 2023, doi
  10.1371/journal.pone.0286419, for the Nesbit method.
- Horn JR, Hansten PD, Chan LN. *Ann Pharmacother* 2007;41:674–680, as reprinted in PMC8463003,
  PMC10467403, PMC10720802 and PMC11383621.
- Linjakumpu T et al. *Int J Geriatr Psychiatry* 2003;18:542–544 (not opened); Parsons C et al.
  *BMC Geriatr* 2011;11:56 (PMC3197480) for the sedative load model as read.
- Hanlon JT, Schmader KE. *Drugs Aging* 2013 (PMC3831621); PMC5585512 and PMC3780501 for the
  conflicting MAI weights.
- DailyMed labels: Kcentra (published May 17, 2023), Balfaxar (November 30, 2023), Andexxa
  (April 28, 2026), Praxbind (February 8, 2024), protamine sulfate, Fresenius Kabi (May 15, 2025).
- FDA, *Update on the Safety of Andexxa by AstraZeneca: FDA Safety Communication* (December 18,
  2025); FDA product page for Andexxa, BLA 125586.

## Tests

- `liverpool-adr-causality`: every leaf path of the figure; "unassessable" at node 3 behaves as
  yes; node 2 no with 2b yes rejoins at node 3; a positive rechallenge is never asked when
  disease probability is high.
- `who-umc-causality`: a case meeting Certain except rechallenge "not done" (still Certain, since
  rechallenge is "if necessary"); withdrawal information lacking caps the result at Possible.
- `hartwig-adr-severity`: admission caused by the ADR with no treatment change is level 4.
- `ncc-merp-index`: omission counts as reaching the patient; life support with permanent harm is G
  not H; no life support and harm "not temporary" is G; death short-circuits to I.
- `fda-adverse-event-report-clock`: day 15 counted in calendar days across a weekend; § 310.305
  offers no periodic schedule; the quarter clock starts on the approval date (§ 314.80) or the
  license issuance date (§ 600.80), and the report after the twelfth quarter is annual; there is no
  IND setting, and the page links to `ind-safety-report-clock`.
- `disproportionality-2x2`: the EMA examples (5, 100, 5,000, 100,000 gives ROR 1; 15, 100, 5,000,
  100,000 gives 3); c = 0; a = 0 gives IC without limits; 2 cases with PRR 10 fails Evans on count.
- `riosord`: methadone alone scores ingredient plus ER/LA in both versions (18 VHA, 15
  commercial); every item ticked with the top dose band gives 115 and 146; VHA 24 vs 25 and 66 vs
  67; commercial 41 vs 42; MME 49.9, 50, 99.9, 100 (VHA).
- `relative-infant-dose`: ng/mL vs mg/L input give the same answer; 200 vs 150 mL/kg/day scales
  the RID by 4/3; no band is printed.
- `badri-adr-risk`: score 1 is below the cutoff, 2 is above.
- `at-harm10`: all ten "no" returns no class, not "unlikely"; U1 yes with P5 yes returns
  "unlikely" (the first yes ends the assessment).
- `anticholinergic-list-score`: a drug absent from the list is reported as absent; one score-3
  drug alone trips the Kiesel rule; list counts match the papers.
- `peds-heparin-nomogram`: age exactly 1 year (the source says <1 and >1; refuse or ask); aPTT 59
  vs 60, 85 vs 86, 95 vs 96, 120 vs 121.
- `peds-warfarin-nomogram`: maintenance INR 1.45 falls in a defined band; a target other than 2–3
  is refused; the page states the "1.15–1.9" defect.
- `warfarin-inr-out-of-range`: INR 10.0 is in the 4.5–10 band, 10.1 is above; INR 3.4 with a 2–3
  target, stable, gets rec 3.2; INR 4.0 gets "no numbered recommendation."
- `ninja-nephrotoxin-exposure`: two nephrotoxins plus two days of vancomycin is not exposed.
- `or-rr-to-nnt`: OR = RR in the limit π₀ → 0; an interval crossing 1 prints through infinity.
- `two-by-two-effect`: Bland and Altman's worked example (cells 141, 420, 928, 13,525: OR 4.89,
  95% CI 4.00 to 5.99).
- `icer-dominance`: the HERC worked example with standard care at $5,000 and 1 QALY, A $12,000
  and 1.5, B $10,000 and 2, C $25,000 and 3, D $35,000 and 4, E $55,000 and 5: A is strongly
  dominated by B; ICERs are B 5,000, C 15,000, D 10,000, E 20,000; C is removed by extended
  dominance at $15,000 per QALY; D is then compared with B (computed: $12,500 per QALY). Equal
  effects give no ratio.
- `ade-cost-avoidance`: class "none" contributes zero; blank cost is refused, not treated as 0.
- `dips-interaction`: all "yes" except question 7 "no" gives +11; all "no" except question 7 "yes"
  gives −9; all unknown gives 0 (doubtful); 8 is probable and 9 is highly probable; 1 is doubtful
  and 2 is possible; question 5 unknown skips question 6.
- `sedative-load`: two group 1 drugs and one group 2 drug give 5; a group 3 drug adds nothing.
- Tools 24–30: no test until the gate is cleared; a build without the primary fails review.

## Build status

Not started. Specified October 10, 2026.
