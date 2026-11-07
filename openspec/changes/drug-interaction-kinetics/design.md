# Design — Drug-interaction kinetics and polypharmacy exposure math

Read on November 7, 2026 unless marked "not opened".

## Sources

| Source | Status |
|---|---|
| ICH M12 Guideline, *Drug Interaction Studies*, Final version, adopted May 21, 2024 (database.ich.org, `ICH_M12_Step4_Guideline_2024_0521.pdf`, 74 pages) | read: §2.1.2.1, §2.1.2.2, §7.5.1, Table 3, Table 6, and the strength definitions in the glossary |
| FDA, "Drug Development and Drug Interactions: Table of Substrates, Inhibitors and Inducers", "Content current as of: 05/29/2026" | read: Table 1 (examples), Table 2 (legend: strength definitions). HTML only; no CSV or XLSX offered |
| FDA's 2020 in vitro and clinical DDI guidances | **superseded** by ICH M12 for this subject; not used. The FDA page for the 2020 in vitro guidance returned 404 on November 7, 2026 |
| Ohno Y, Hisaka A, Suzuki H. General framework for the quantitative prediction of CYP3A4-mediated oral drug interactions based on the AUC increase by coadministration of standard drugs. *Clin Pharmacokinet* 2007;46:681-696 | **not opened**; build gate for tool 5 |
| Hill AV. The possible effects of the aggregation of the molecules of haemoglobin on its dissociation curves. *J Physiol* 1910;40:iv-vii | **not opened**; cited for the equation's name only |

## The constants, as read

**ICH M12 basic-method cutoffs.**

| Mechanism | Risk excluded when | Section |
|---|---|---|
| Reversible inhibition (systemic) | Cmax,u ÷ Ki,u < 0.02 (Ki,u > 50 × Cmax,u) | §2.1.2.1 |
| Reversible inhibition of intestinal CYP3A (oral) | (Dose ÷ 250 mL) ÷ Ki,u < 10 | §2.1.2.1 |
| Time-dependent inhibition | (kobs + kdeg) ÷ kdeg < 1.25, where kobs = kinact × 5 × Cmax,u ÷ (KI,u + 5 × Cmax,u) | §2.1.2.2 |
| Mechanistic static model | AUCR from 0.80 to 1.25: "the risk of a clinically relevant interaction is low" | §7.5.1 |

M12 also says fu,p is set to 1% when a measured value below 1% cannot be shown reliable, and Cmax,u and Ki,u
must be in the same unit.

**ICH M12 Table 6, representative enzyme turnover** (hepatic unless stated).

| Enzyme | t½ (h) | kdeg (/min) |
|---|---|---|
| CYP1A2 | 38 | 0.00030 |
| CYP2B6 | 32 | 0.00036 |
| CYP2C8 | 22 | 0.00053 |
| CYP2C9 | 104 | 0.00011 |
| CYP2C19 | 26 | 0.00044 |
| CYP2D6 | 51 | 0.00023 |
| CYP3A4 | 36 | 0.00032 |
| CYP3A4 (intestinal) | 24 | 0.00048 |

The two columns are rounded independently (0.00032/min is a half-life of 36.1 h). The tools use the kdeg
column, print both, and let the reader override.

**FDA Table 2 strength definitions** (quoted).

| Class | Definition |
|---|---|
| Strong inhibitor | increases the AUC of sensitive index substrates "≥5-fold" |
| Moderate inhibitor | "≥2-fold to < 5-fold" |
| Weak inhibitor | "≥1.25-fold to <2-fold" |
| Strong inducer | decreases the AUC of sensitive substrates "by ≥80%" |
| Moderate inducer | "by ≥50% to <80%" |
| Weak inducer | "by ≥20% to <50%" |
| Sensitive substrate | AUC increase "≥5-fold with strong inhibitors" |
| Moderate sensitive substrate | "≥2 to <5-fold with strong inhibitors" |

## Tools

### 1. `ddi-basic-screen` — In Vitro Interaction Screen (ICH M12 Basic Methods)

**Input.** Mechanism (reversible, gut CYP3A, time-dependent); Cmax at the highest dose at steady state and
fu,p (or Cmax,u directly), Ki,u or KI,u with a unit picker that converts both to µM; for gut, the maximum
clinical dose in mg and the molecular weight; for TDI, kinact (/min) and the enzyme (prefills kdeg from
Table 6, editable).
**Compute.** The three ratios in the table above; molar conversion dose (mg) ÷ MW (g/mol) ÷ 0.25 L.
**Output.** Each ratio against its cutoff, "risk excluded by the basic method" or "not excluded: M12 sends
this to a mechanistic static or PBPK model (§7.5)", with a link that opens tool 2 prefilled.
**Rule.** fu,p below 0.01 is replaced by 0.01 unless the reader ticks "measured fu,p below 1% is
validated", and the page says which was used.

### 2. `ddi-static-aucr` — Predicted AUC Ratio From the Mechanistic Static Model

**Input.** fm (fraction of hepatic clearance through the affected enzyme), Fg, and for each of gut and
liver: reversible Ki, TDI kinact and KI with kdeg (Table 6 prefill), induction Emax, EC50 and the scaling
factor d (default 1, as M12 says). Inhibitor concentrations either entered directly or estimated with M12's
equations: [I]h = fu,p × (Cmax + Fa × Fg × ka × Dose ÷ Qh ÷ RB), [I]g = Fa × ka × Dose ÷ Qen, with M12's
stated defaults offered and labeled (Fa = 1, Fg = 1, ka = 0.1/min, Qen 18 L/h/70 kg, Qh 97 L/h/70 kg).
**Compute.** M12's equation:
AUCR = 1 ÷ ([Ag × Bg × Cg] × (1 − Fg) + Fg) × 1 ÷ ([Ah × Bh × Ch] × fm + (1 − fm)), with
A = 1 ÷ (1 + [I] ÷ Ki), B = kdeg ÷ (kdeg + [I] × kinact ÷ ([I] + KI)), C = 1 + d × Emax × [I] ÷ ([I] + EC50).
A mechanism left blank is 1.
**Output.** AUCR, the band (below 0.80, 0.80 to 1.25, above 1.25) with M12's sentence, and, when both
inhibition and induction are entered, the three runs M12 §7.5.1.1 asks for: inhibition alone (C = 1),
induction alone (A = B = 1), and combined, with M12's warning that a combined run can mask either effect.
**Rule.** M12 states the equation "assumes that the drug has negligible extrahepatic clearance"; the
page prints that sentence on every result.

### 3. `ddi-strength-classify` — Strength From an Observed AUC Ratio (FDA Definitions)

**Input.** Role (precipitant or substrate); the AUC ratio with and without (or two AUCs); for a substrate,
confirmation that the precipitant was a strong inhibitor of the pathway.
**Compute.** The class from Table 2. A decrease is converted to percent: (1 − ratio) × 100.
**Output.** The class and FDA's sentence; "below the weak threshold" when under 1.25-fold or under 20%.
**Rule.** A substrate class is not given unless the precipitant was a strong inhibitor, because Table 2
defines substrate sensitivity only against strong inhibitors.

### 4. `cyp-list-check` — Which Drugs on This List FDA Names (Table 1)

**Input.** A medication list (typed, pasted, one per line, or a dropped text file read in the browser).
**Compute.** Name matching against FDA Table 1, case- and salt-insensitive, against the edition the
weekly refresh pinned; then every pair where one drug is a listed inhibitor or inducer of an enzyme and
another is a listed substrate of the same enzyme.
**Output.** Per drug: each Table 1 row it appears in (enzyme, role, strength) quoted. Per pair: the
enzyme, the precipitant's strength and the substrate's sensitivity, linking tool 3's definitions. A drug
not found reads "not on this edition of FDA's examples (current as of 05/29/2026)". Every result carries
FDA's sentence that the list is "a guide and not considered a comprehensive list".
**Data.** The weekly refresh fetches the page, parses Table 1, stores it with its hash and FDA's "current
as of" date, and sets a 14-day expiry renewed by each successful fetch. A changed hash triggers a diff in
the refresh summary. Past expiry, the tool stops answering from the table and says so.
**Rule.** No pair is called "safe", "contraindicated" or given an action. Transporter rows are listed
per drug but not paired in this change (their legend is Table 3 and was not read).

### 5. `ddi-cr-ir-predict` — Interaction Size From CR and IR (Ohno) — build-gated

**Input.** The substrate's contribution ratio (CR, fraction of oral clearance through CYP3A4) and the
precipitant's inhibition ratio (IR) or, for an inducer, its increase in clearance (IC).
**Compute.** AUCR = 1 ÷ (1 − CR × IR) for inhibition, and the paper's induction form.
**Build gate.** Read Ohno 2007 for the equations, how CR and IR were derived from index drugs, and the
paper's stated validity range, before building. Until then this tool is specified, not built.

### 6. `enzyme-recovery-time` — Enzyme Recovery After Stopping an Inducer or Irreversible Inhibitor

**Input.** Enzyme (Table 6 prefill of kdeg, editable); starting enzyme level as a fraction of baseline
(below 1 after an irreversible inhibitor, above 1 after an inducer); hours since stopping, or a target
percent of baseline.
**Compute.** First-order turnover, the meaning M12 gives kdeg: E(t) = 1 + (E0 − 1) × e^(−kdeg × t).
Time to reach a target fraction f of the way back: t = −ln(1 − f) ÷ kdeg.
**Output.** The enzyme level now as a percent of baseline, the time to 50% and 90% recovery, and a curve.
**Rule.** The page says this is the enzyme's return only; the precipitant's own washout (its half-life)
comes first, and the reader adds it.

### 7. `dose-history-level` — Drug Level From an Actual Dose History

**Input.** A list of doses with the time and amount of each (late, missed and extra doses allowed); route:
IV bolus, IV infusion (duration) or first-order oral absorption (ka, F); Vd and half-life (or CL);
the times to evaluate.
**Compute.** Superposition of each dose's one-compartment curve (bolus, infusion, or Bateman for oral).
**Output.** The level at each requested time, a curve with each dose marked, and the same regimen's
level if every dose had been on time, side by side.
**Rule.** Linear kinetics only; the page names the drugs the catalog already handles as nonlinear
(`phenytoin-mm-dose`) and links there. ka equal to ke uses the limit form, not a division by zero.

### 8. `two-compartment-params` — Two-Compartment Parameters From a Biexponential Fit

**Input.** IV bolus dose and the reader's fitted C(t) = A × e^(−αt) + B × e^(−βt) (α > β).
**Compute.** k21 = (A × β + B × α) ÷ (A + B); k10 = α × β ÷ k21; k12 = α + β − k21 − k10;
Vc = Dose ÷ (A + B); AUC = A ÷ α + B ÷ β; CL = Dose ÷ AUC; Vss = Vc × (1 + k12 ÷ k21);
Vβ = CL ÷ β; distribution and terminal half-lives ln 2 ÷ α and ln 2 ÷ β.
**Output.** All of the above, and a check that CL = k10 × Vc agrees to rounding.
**Rule.** α ≤ β, or a negative micro-constant, refuses with the reason.

### 9. `emax-hill-effect` — Sigmoid Emax Effect and Its Inverse

**Input.** E0, Emax, EC50, Hill coefficient n; a concentration, or a target effect.
**Compute.** E = E0 + Emax × Cⁿ ÷ (EC50ⁿ + Cⁿ). Inverse: C = EC50 × ((E − E0) ÷ (Emax − (E − E0)))^(1/n).
**Output.** The effect or the concentration, and the curve with the point marked.
**Rule.** A target outside E0 to E0 + Emax refuses. Every parameter is reader input.

## Decisions

**D1 — ICH M12, not the 2020 FDA guidances.** M12 is the adopted, harmonized text; the 2020 pages are
superseded and one now 404s.

**D2 — FDA's examples table is the only drug list, and it is a list of examples.** No commercial
interaction database, no severity tier, no "no interaction found". The miss wording is fixed.

**D3 — One equation per tool.** Tools 1 and 2 are kept apart because M12 keeps them apart: the basic method
is a screen, and the static model is what a failed screen leads to.

**D4 — No Hypnos or Harmonia dependency.** Every equation here is closed-form; nothing needs an ODE solver,
a population dataset or a Python runtime.

## Risks

- **The FDA page is HTML.** A layout change can break the parser. The refresh fails closed on a parse
  that yields fewer rows than the last edition by more than 10% and reports it.
- **Readers will treat tool 4 as an interaction checker.** The output never says "no interaction"; it
  says which FDA examples matched and quotes the not-comprehensive sentence.
- **Static models over-predict for drugs with extrahepatic clearance.** Printed on every tool 2 result.

## Rejected

| Idea | Why not |
|---|---|
| A commercial-grade interaction checker with severity and management text | Licensed databases (Lexicomp, First Databank, Micromedex); FDA's table has no severity. Admission rules 2 and 6. |
| A PBPK simulator | Needs validated system parameters and virtual populations; not reproducible from a source the build can read. Admission rule 2. |
| QT drug-list counting (CredibleMeds) | The list is licensed. `tisdale-qtc` already scores QT risk from the reader's drug count. |
| Shipping Ki, kinact or fm values for named drugs | They come from individual studies and labels; no single primary source. Reader input. |
| Boxed-warning lookup | Label prose, not a computation. Admission rule 1. |
| FAERS signal detection | Already `disproportionality-2x2` from the reader's counts. |
