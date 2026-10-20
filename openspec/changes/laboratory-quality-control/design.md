# Design — Laboratory quality control and proficiency-testing arithmetic

Read on October 19, 2026 unless marked "not opened".

## Sources

| Source | Status |
|---|---|
| 42 CFR 493.931 Routine chemistry, Table 2 to paragraph (c)(2), as amended 87 FR 41238 (July 11, 2022); eCFR point-in-time October 1, 2026 | read in full |
| 42 CFR 493.941 Hematology, Table 2 to paragraph (c)(2), as amended 87 FR 41241 | read in full |
| 42 CFR 493.803 (condition: successful participation; the 80% event score) | **not opened**; build gate |
| 42 CFR 493.1255 (calibration and calibration verification) | **not opened**; build gate |
| Westgard JO, Barry PL, Hunt MR, Groth T. A multi-rule Shewhart chart for quality control in clinical chemistry. *Clin Chem* 1981;27:493-501 | **not opened** (PubMed blocked the fetch); rule definitions read on westgard.com, "Westgard Rules and Multirules", by the first author; build gate on the paper |
| Levey S, Jennings ER. The use of control charts in the clinical laboratory. *Am J Clin Pathol* 1950;20:1059 | **not opened**; cited for the chart's name only |

## The CLIA acceptance limits, as read

Routine chemistry (§493.931), "Target value ±":

| Analyte | Criterion |
|---|---|
| ALT (SGPT) | 15% or 6 U/L, whichever is greater |
| Albumin | 8% |
| Alkaline phosphatase | 20% |
| Amylase | 20% |
| AST (SGOT) | 15% or 6 U/L (greater) |
| Bilirubin, total | 20% or 0.4 mg/dL (greater) |
| Blood gas pCO2 | 8% or 5 mm Hg (greater) |
| Blood gas pO2 | 15% or 15 mm Hg (greater) |
| Blood gas pH | 0.04 |
| BNP | 30% |
| proBNP | 30% |
| Calcium, total | 1.0 mg/dL |
| Carbon dioxide | 20% |
| Chloride | 5% |
| Cholesterol, total | 10% |
| HDL cholesterol | 20% or 6 mg/dL (greater) |
| LDL cholesterol, direct | 20% |
| Creatine kinase | 20% |
| CK-MB | 25% or 3 ng/mL (greater), or MB elevated (presence or absence) |
| Creatinine | 10% or 0.2 mg/dL (greater) |
| Ferritin | 20% |
| Gamma glutamyl transferase | 15% or 5 U/L (greater) |
| Glucose (excluding FDA-cleared home-use devices) | 8% or 6 mg/dL (greater) |
| Hemoglobin A1c | 8% |
| Iron, total | 15% |
| LDH | 15% |
| Magnesium | 15% |
| Phosphorus | 10% or 0.3 mg/dL (greater) |
| Potassium | 0.3 mmol/L |
| PSA, total | 20% or 0.2 ng/mL (greater) |
| Sodium | 4 mmol/L |
| TIBC, direct | 20% |
| Total protein | 8% |
| Triglycerides | 15% |
| Troponin I | 30% or 0.9 ng/mL (greater) |
| Troponin T | 30% or 0.2 ng/mL (greater) |
| Urea nitrogen | 9% or 2 mg/dL (greater) |
| Uric acid | 10% |

Hematology (§493.941), "Target ±": erythrocyte count 4%; hematocrit (excluding spun) 4%;
hemoglobin 4%; leukocyte count 10%; platelet count 25%; fibrinogen 20%; partial thromboplastin
time 15%; prothrombin time (seconds or INR) 15%; white cell differential ±3 SD of the
percentage; cell identification 80% consensus (qualitative, not computed here).

Both sections also state: the target is the value agreed by 80% or more of 10 or more referee
laboratories or of all participants; the evaluation uses either the fixed percentage or the
number of SD from the target; the analyte and overall event scores are averages of acceptable
responses (the formulas are images on the eCFR page and were not transcribed).

## Tools

### 1. `westgard-multirule` — Westgard Multirule QC Evaluation (Two Levels, Across Runs)

**Input.** For each control level: its mean and SD (or a run series from which tool 2 computes
them); the current run's result per level; the previous runs' results per level (up to ten).
Rule set: the classic 1_3s / 2_2s / R_4s / 4_1s / 10_x with 1_2s as the warning, as the author's
page describes for two levels; the three-level alternatives (2of3_2s, 3_1s, 6_x, 9_x) are listed
but not evaluated until their definitions are read in the paper.
**Compute.** z = (result − mean) ÷ SD per level. Rules, as read on the author's page:
- 1_2s: one result beyond ±2 SD (warning; triggers inspection by the rejection rules);
- 1_3s: one result beyond ±3 SD (reject; random error);
- 2_2s: two results beyond the same ±2 SD limit, either both levels in this run or one level
  across the last two runs (reject; systematic error);
- R_4s: in one run, one level beyond +2 SD and the other beyond −2 SD (reject; random error);
- 4_1s: four consecutive results beyond the same ±1 SD limit, one level across four runs or
  both levels across two runs (reject; systematic);
- 10_x: ten consecutive results on one side of the mean, both levels across five runs (reject;
  systematic).
**Output.** Accept or reject, the rule that fired with the results that fired it, the error type
the rule indicates, and the author's note that after a rejection the run is repeated with new
control measurements and pre-correction runs are not used.
**Build gate.** Read the 1981 paper's own rule statements before building; the author's page is
a verified restatement by the first author but the citation is the paper. If the paper's 10_x
within-one-level form differs from the page's protocol, ship the paper's.
**Rule.** With fewer previous runs than a rule needs, that rule is reported as "not evaluable
(needs N runs)" rather than silently passed.

### 2. `levey-jennings-limits` — Levey-Jennings Mean, SD, CV and Control Limits From a Run Series

**Input.** A pasted or dropped series of control results (one level), optionally with dates;
the laboratory's minimum count for establishing limits (reader input; the page says 20 is the
common convention and ships no sourced minimum).
**Compute.** Mean, sample SD (n − 1), CV = SD ÷ mean × 100, limits at ±1, ±2, ±3 SD; each point's
z; a plain chart of the series with the limits.
**Output.** The statistics, the limits, and the count, with a note when the count is under the
reader's minimum.
**Source.** Arithmetic identity. Levey and Jennings 1950 named the chart; not opened, cited by
name only with "not opened" on the page until read.
**Rule.** Fewer than 2 points refuses the SD; a non-numeric row is named by line number.

### 3. `clia-pt-acceptance` — CLIA Proficiency-Testing Acceptance Check (42 CFR 493.931 and 493.941)

**Input.** Analyte (picker of the read analytes above, grouped by section); the laboratory's
response; the target value; for the differential, the SD of the peer group.
**Compute.** The allowable deviation for the analyte: the fixed unit, the percentage of target,
or the greater of the two where the rule says "(greater)"; acceptable when |response − target|
≤ allowable. For CK-MB the qualitative "MB elevated" branch is a reader-ticked alternative.
**Output.** Acceptable or not, the allowable range around the target in the analyte's unit, the
deviation in units and percent, and the CFR row quoted. With a decision level entered, the limit
at that level as a percent (the greater of the percent and the unit where the rule says so), with
a link that opens `sigma-metric` with it as the allowable error.
**Source, read.** The two tables above. The page cites "42 CFR 493.931, Table 2 to paragraph
(c)(2)" or "493.941", with the Federal Register amendment and the eCFR point-in-time date.
**Watch.** eCFR point-in-time comparison in the weekly refresh (the same mechanism as the
pharmacy-law tools); a changed table stops the tool until re-read.
**Rule.** Analytes in the CFR but not read here (the endocrinology, toxicology, immunology and
other sections) are not in the picker; the page lists the sections not yet read.

### 4. Total error against the CLIA limit (dropped)

Dropped on October 19, 2026: the live `sigma-metric` takes the same three inputs (allowable error,
bias, imprecision) and judges the method against the goal, and the live `biological-variation-goals`
already computes total error as 1.65 times imprecision plus bias. What this tool added was the CLIA
limit as the goal; `clia-pt-acceptance` now prints that limit as a percent at a decision level and
hands it to `sigma-metric`.

### 5. `pt-event-score` — Proficiency-Testing Event Score and Passing

**Input.** Per analyte: the number of challenges (usually 5) and the number acceptable; the
list of analytes in the event.
**Compute.** Analyte score = acceptable ÷ challenges × 100. Event score = acceptable responses
across all analytes ÷ all responses × 100. Passing: the CFR's successful-participation threshold
once read.
**Output.** The per-analyte and event scores and, when gated, pass or fail with the CFR sentence.
**Source.** §493.931(c)(4)-(5) say the scores are averages of acceptable responses (read; the
formula image not transcribed). **Build gate:** read 42 CFR 493.803 (and §493.2 "unsuccessful
participation") for the 80% event rule and the consecutive-event rules before shipping a
pass/fail verdict; until then the tool prints scores only.

### 6. `calibration-verification` — Calibration Verification: Recovery and Reportable Range Check

**Input.** Calibrator or verification materials: assigned value and measured value, three or
more levels; the laboratory's acceptance criterion for recovery (reader input, percent or
units); the claimed reportable range.
**Compute.** Recovery per level = measured ÷ assigned × 100; deviation = measured − assigned;
a least-squares line (slope, intercept, r) across levels; whether the lowest and highest
verified levels cover the claimed range.
**Output.** Per-level recovery against the criterion, the line, and whether the range is
covered end to end.
**Build gate.** 42 CFR 493.1255 states when calibration verification is required (at least
every 6 months, after certain events) and what it must include (the low, mid and high end of the
reportable range); not opened. Read it and quote the three-level and 6-month rules before
building. The acceptance criterion is the laboratory's own and stays reader input.

### 7. `turnaround-time-percentile` — Turnaround Time: Median and 90th Percentile From a List

**Input.** A pasted or dropped list of turnaround minutes (or two timestamp columns mapped,
collected-to-reported or received-to-reported); the target the laboratory uses; the percentile
to report (90 offered; reader may change).
**Compute.** Median, the chosen percentile (nearest-rank), mean, count, and the share meeting
the target.
**Output.** The figures with the count, and the definition of the interval used (which two
timestamps).
**Source.** Arithmetic identity. No target ships. The nearest-rank percentile definition is
stated on the page so two laboratories compute it the same way.

## Decisions

**D1 — the CFR table is the only shipped constant, and it is watched.** Everything else is
reader input or computed from reader data.

**D2 — a rule that cannot be evaluated is said to be unevaluable.** The multirule tool never
reports "in control" when a rule lacked the runs it needs.

**D3 — one laboratory statistics helper.** Mean, SD, CV, percentile and the least-squares line
live in one lib module shared by tools 2, 6 and 7 and by `bland-altman` where it already has
them (reuse, not a second copy).

## Risks

- **Unread rule sets.** Four build gates. The multirule's three-level rules are the most likely
  to be built from memory; the design lists them as not evaluated until read.
- **The eCFR table changing.** The 2022 amendment moved several limits; another could. The
  watch fails closed.
