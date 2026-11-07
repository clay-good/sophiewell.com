# Design — Drug-interaction kinetics and polypharmacy exposure math

Read on November 7, 2026 unless marked "not opened". Every number in **Tests** was recomputed
independently on that date (scratch scripts, not repository code) and matches the arithmetic here.

## Sources

| Source | Status |
|---|---|
| ICH M12 Guideline, *Drug Interaction Studies*, Final version, adopted May 21, 2024 (database.ich.org, `ICH_M12_Step4_Guideline_2024_0521.pdf`, 74 pages) | read: §2.1.2.1, §2.1.2.2, §7.5.1, Table 3, Table 6, and the strength definitions in the glossary |
| FDA, "Drug Development and Drug Interactions: Table of Substrates, Inhibitors and Inducers", "Content current as of: 05/29/2026" | read: Table 1 (examples), Table 2 (legend: strength definitions). HTML only; no CSV or XLSX offered |
| FDA's 2020 in vitro and clinical DDI guidances | **superseded** by ICH M12 for this subject; not used. The FDA page for the 2020 in vitro guidance returned 404 on November 7, 2026 |
| Ohno Y, Hisaka A, Suzuki H. *Clin Pharmacokinet* 2007;46:681-696 (PMID 17655375) | full text **not opened** (paywalled); the authors' own abstract read: "1/(1 - CR(CYP)(3A4) x IR(CYP)(3A4))", CR from AUC increases with itraconazole or ketoconazole (14 substrates), IR "primarily based on AUC increases observed in drug-interaction studies with midazolam" (18 inhibitors), predictions "within 67-150% of the observed increase for 50 studies (83%) and within 50-200% for 57 studies (95%)" |
| Ohno Y, Hisaka A, Ueno M, Suzuki H. *Clin Pharmacokinet* 2008;47:669 (PMID 18783297) | full text **not opened**; abstract read: the AUC reduction "could be approximated by the equation 1/(1 + CRCYP3A4 * ICCYP3A4)", IC "the apparent increase in clearance of a substrate produced by induction" |
| Tod M, et al. *AAPS J* 2014 (PMC4389753, free to read, © AAPS) | read: Eq. 1 AUC*/AUC = 1/(1 − CR × IR); Eq. 2 and 3 solve for CR and IR from an observed ratio; IR "depends on the dose of the inhibitor" |
| Tod M, et al. *AAPS J* 2013 (PMC3787231, free to read, © AAPS) | read: a general form that reduces, for one enzyme, to 1/(1 + CR × IX), with IX negative for inhibitors (0 to −1) and positive for inducers; "IX was previously denoted as IR for inhibitors and IC for inducers". Same laboratory as the 2014 paper, so it confirms the algebra but is not an independent group |
| Japan MHLW, *Guideline on drug interaction for drug development and appropriate provision of information* (English, PMDA, notice of February 8, 2019) | read: defines CR in prose and uses CR ≥ 25% as a trigger for a clinical study; it does **not** print the CR-IR equation, so it is not a source for tool 5 |
| Hill AV. *J Physiol* 1910;40:iv-vii | **not opened**; cited for the equation's name only |

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

## Shared rules for all nine tools

- **Units.** Concentrations are entered with a unit picker (nM, µM, ng/mL with molecular weight) and converted
  to µM before any ratio; rate constants with /min or /h, converted to /min for M12 terms and /h for kinetic
  curves. The canonical unit is the first option ([project.md](../../project.md) invariant 1). A ratio whose two
  inputs were entered in units that cannot be converted (ng/mL without a molecular weight) refuses.
- **Answer first.** Each answer card leads with the one number or decision; the derivation is in the
  disclosure. No tool's answer depends on a plot (see "Plots" below).
- **Clinical notice.** One `.clinical-notice` per tile. For tools 1, 2 and 5 it says the result is a
  development-stage screen in M12's terms, not a prediction for a patient.
- **Voice.** No "avoid", "reduce", "switch" in the site's voice ([spec-v1628](../../../docs/spec-v1628.md) §5).

## Plots

The catalog draws no charts today and `docs/design.md` §4 lists no plot component. Tools 6, 7, 8 and 9
would each benefit from a curve. **The plot is a separate design-system change that must land first**, in
`docs/design.md` (design.md: "add a new pattern there before building it"): inline SVG, theme tokens only,
`role="img"` with a text alternative, and the same values in a `.lookup-table` inside a `<details>` so a
screen reader and print get them. Until that lands, these tools ship with the value table only, which is a
complete answer; the plot is never the only place a number appears.

## Tools

### 1. `ddi-basic-screen` — In Vitro Interaction Screen (ICH M12 Basic Methods)

**Input.** Mechanism (reversible, gut CYP3A, time-dependent); Cmax at the highest dose at steady state and
fu,p (or Cmax,u directly), Ki,u or KI,u; for gut, the maximum clinical dose in mg and the molecular weight; for
TDI, kinact and the enzyme (prefills kdeg from Table 6, editable).
**Compute.** The three ratios above; molar dose = dose (mg) ÷ MW (g/mol) × 1,000 µmol, ÷ 0.25 L.
**Output.** Each ratio against its cutoff, "risk excluded by the basic method" or "not excluded: M12 sends
this to a mechanistic static or PBPK model (§7.5)", with a link that opens tool 2 prefilled.
**Rule.** fu,p below 0.01 is replaced by 0.01 unless the reader ticks "measured fu,p below 1% is
validated", and the page says which was used. A ratio exactly at its cutoff is **not** excluded (M12's
wording is a strict "<").

### 2. `ddi-static-aucr` — Predicted AUC Ratio From the Mechanistic Static Model

**Input.** fm, Fg, and for each of gut and liver: reversible Ki, TDI kinact and KI with kdeg (Table 6
prefill; intestinal CYP3A4 row for gut), induction Emax, EC50 and d (default 1, as M12 says). Inhibitor
concentrations either entered directly or estimated with M12's equations: [I]h = fu,p × (Cmax + Fa × Fg × ka
× Dose ÷ Qh ÷ RB), [I]g = Fa × ka × Dose ÷ Qen, with M12's stated defaults offered and labeled (Fa = 1, Fg = 1,
ka = 0.1/min, Qen 18 L/h/70 kg, Qh 97 L/h/70 kg). ka is converted to /h before it meets Qh and Qen in L/h.
**Compute.** M12's equation: AUCR = 1 ÷ ([Ag × Bg × Cg] × (1 − Fg) + Fg) × 1 ÷ ([Ah × Bh × Ch] × fm + (1 − fm)),
with A = 1 ÷ (1 + [I] ÷ Ki), B = kdeg ÷ (kdeg + [I] × kinact ÷ ([I] + KI)), C = 1 + d × Emax × [I] ÷ ([I] +
EC50). A mechanism left blank is 1.
**Output.** AUCR, the band with M12's sentence, the gut and liver factors separately, and, when both
inhibition and induction are entered, the three runs M12 §7.5.1.1 asks for: inhibition alone (C = 1),
induction alone (A = B = 1), and combined, with M12's warning that a combined run can mask either effect.
**Rule.** M12: the equation "assumes that the drug has negligible extrahepatic clearance"; printed on every
result. fm and Fg outside 0 to 1 refuse.

### 3. `ddi-strength-classify` — Strength From an Observed AUC Ratio (FDA Definitions)

**Input.** Role (precipitant or substrate); the AUC ratio, or the two AUCs; for a substrate, confirmation that
the precipitant was a strong inhibitor of the pathway.
**Compute.** The Table 2 class. A decrease is (1 − ratio) × 100%.
**Output.** The class and FDA's sentence; "below the weak threshold" under 1.25-fold or under 20%.
**Rule.** A substrate class needs a strong-inhibitor study. A ratio of exactly 1 is "no change"; a ratio
below 1 with role "substrate" refuses (substrate sensitivity is defined on increases only).

### 4. `cyp-list-check` — Which Drugs on This List FDA Names (Table 1)

**Input.** A medication list: typed, pasted one per line, or dropped as a text or CSV file through the
existing `drug-list` file kind (`lib/file-kinds.js`, today routed only to `hazardous-drug-list-check`).
**Compute.** Name matching against FDA Table 1 as pinned by the weekly refresh: lower case, salt words and
dose strengths stripped, combination rows ("lopinavir and ritonavir") indexed under each component and
reported as FDA wrote them. Then every pair where one drug is a listed inhibitor or inducer of an enzyme and
another is a listed substrate of the same enzyme. A drug FDA lists in two roles on the same enzyme (for
example a moderate CYP3A inhibitor that is also a sensitive substrate) is shown in both and never paired
with itself.
**Output.** Per drug: each Table 1 cell it appears in (enzyme, role, strength) quoted. Per pair: the enzyme,
the precipitant's strength and the substrate's sensitivity, linking tool 3's definitions. A drug not found
reads "not on this edition of FDA's examples (current as of 05/29/2026)". Every result carries FDA's
sentence that the list is "a guide and not considered a comprehensive list".
**Data (Route A, [spec-v1517](../../../docs/spec-v1517.md)).** A new builder
`scripts/data/builders/fda-ddi-examples.mjs` on the `cpic.mjs` pattern: fetch the page, parse Table 1 and the
legend, keep the drug, enzyme, role and strength columns and FDA's footnote markers, record the "current as
of" date as `sourceEdition`, `fetchedAt`, `expiresOn` = fetch + 14 days renewed on every successful fetch
(`renewOnUnchanged`), `sourceSha256` of the reduced table text, and `recordBounds` set from the first build
(fail the build on more than a 10% drop). Past `expiresOn` the tool stops answering from the table and says
when it was last fetched (admission rule 5).
**What the page actually is (fetched November 7, 2026; 108,266 bytes, SHA-256 `8f364f50…`).** Server-rendered
HTML with **six** `<table>` elements: Table 1 (one header row and 245 body rows of 11 cells) and five small
legend tables (CYP inhibitor, inducer and substrate legends; transporter inhibitor and substrate legends). The
builder selects Table 1 by its first header cell, "Drug or Other Substance", never by position. Its columns:
Drug or Other Substance | CYP Strg INH | CYP Mod INH | CYP WK INH | CYP Strg IND | CYP Mod IND | CYP WK IND |
CYP SENS SUB | CYP Mod SENS SUB | TRNSP INH | TRNSP SUB. Traps the builder must handle, each with a fixture
test: empty cells hold `&nbsp;`; footnote markers are `<sup>1</sup>` to `<sup>21</sup>`, mostly on the drug
name (`ritonavir<sup> 14, 15, 16</sup>`) but three inside cells (ciprofloxacin "1A2<sup>20</sup>",
conivaptan, rifampin's OATP cells), so markers are stripped from the value and kept as a separate field;
cells are free text with irregular spacing and several enzymes per cell ("2B6; 2C9;  weak inhibitor");
one drug (aprepitant) has two rows, which are merged; combinations are written with "and", including
"paritaprevir and ritonavir and (ombitasvir and/or dasabuvir)". DataTables adds paging and search in the
browser, but the full table is in the server response, so no script execution is needed.
**Rule.** No pair is called "safe", "contraindicated" or given an action. Transporter rows are listed per
drug but not paired in this change. Their legend (FDA's transporter tables) was read and uses different
index substrates and a 1.5-fold or 2-fold line per transporter (for example P-gp inhibition: "AUC
fold-increase of dabigatran, digoxin or edoxaban ≥ 1.5"); pairing them is a follow-up change, not a silent
extension.

### 5. `ddi-cr-ir-predict` — Interaction Size From CR and IR (Ohno)

**No longer build-gated.** The equations are in the authors' own abstracts (a primary source for the
equation), and both forms are restated in two open papers; the full-text tables of CR and IR values are not
needed because no value ships.
**Input.** Mode: inhibition or induction. CR (0 to 1). For inhibition, IR (0 to 1); for induction, IC (≥ 0).
Optionally, back-calculation: an observed AUC ratio for the substrate with a strong index inhibitor and an
assumed IR for that inhibitor gives CR (Tod 2014 Eq. 2), or an observed ratio with midazolam and midazolam's
CR gives the precipitant's IR (Eq. 3). The reader supplies both numbers each time.
**Compute.** Inhibition AUCR = 1 ÷ (1 − CR × IR); induction AUCR = 1 ÷ (1 + CR × IC).
CR = (R − 1) ÷ (R × IR); IR = (R − 1) ÷ (R × CR).
**Output.** AUCR, the FDA class it would correspond to if the substrate were an index substrate (link to tool 3),
and the abstract's validation sentence (83% within 67-150%, 95% within 50-200%) so the reader sees the method's
spread.
**Rule.** CR × IR = 1 refuses (division by zero; the method's limit). Tod 2014: IR depends on the inhibitor's
dose, so the page asks the reader to state the dose the IR belongs to and prints it. CYP3A4 only, as the
papers are; another enzyme refuses.

### 6. `enzyme-recovery-time` — Enzyme Recovery After Stopping an Inducer or Irreversible Inhibitor

**Input.** Enzyme (Table 6 prefill of kdeg, editable); starting enzyme level as a fraction of baseline (0 to
below 1 after an irreversible inhibitor, above 1 after an inducer); hours since stopping, or a target.
**Compute.** First-order turnover, the meaning M12 gives kdeg: E(t) = 1 + (E0 − 1) × e^(−kdeg × t). Time to
close a fraction f of the gap: t = −ln(1 − f) ÷ kdeg.
**Output.** The level now as a percent of baseline; the times to 50% and 90% of the way back; a value table
at 0, 24, 48, 72, 96, 120 and 168 hours.
**Rule.** The precipitant's own washout comes first; the page says so and offers the precipitant's
half-life as an optional delay added to every time. E0 = 1 refuses ("already at baseline").

### 7. `dose-history-level` — Drug Level From an Actual Dose History

**Input.** Dose lines "time, amount" (hours from the first dose, or clock times on one or more dates);
route: IV bolus, IV infusion (duration), or first-order oral (ka, F); Vd and half-life (or CL); the
scheduled interval; the times to evaluate.
**Compute.** Superposition of each dose's one-compartment curve: bolus D/V·e^(−k t); infusion
(R/(V k))(1 − e^(−k Tinf)) after the end, the rising form during; oral Bateman F·D·ka/(V(ka − k))·(e^(−k t) −
e^(−ka t)), and the limit F·D/V·k·t·e^(−k t) when |ka − k| ÷ k < 1e−6. The on-time comparison uses the first
dose's time plus whole multiples of the scheduled interval for the same number of doses.
**Output.** Each requested level beside the on-time level, the peak and trough of the last interval, and a
value table at the evaluation times.
**Rule.** Linear kinetics only; the page links `phenytoin-mm-dose` for nonlinear drugs. A dose time before
the first dose, or two doses at the same time, are accepted (the reader may have given two at once) and
named in the result.

### 8. `two-compartment-params` — Two-Compartment Parameters From a Biexponential Fit

**Input.** IV bolus dose and the reader's fitted C(t) = A·e^(−αt) + B·e^(−βt).
**Compute.** k21 = (A·β + B·α) ÷ (A + B); k10 = α·β ÷ k21; k12 = α + β − k21 − k10; Vc = Dose ÷ (A + B);
AUC = A ÷ α + B ÷ β; CL = Dose ÷ AUC; Vss = Vc × (1 + k12 ÷ k21); Vβ = CL ÷ β; half-lives ln 2 ÷ α and
ln 2 ÷ β.
**Output.** All of the above, and a check that CL = k10 × Vc agrees to four significant figures.
**Rule.** α ≤ β, a non-positive A, B, α or β, or a negative micro-constant refuses with the reason.

### 9. `emax-hill-effect` — Sigmoid Emax Effect and Its Inverse

**Input.** E0, Emax (may be negative for an inhibitory effect), EC50, Hill coefficient n; a concentration, or a
target effect.
**Compute.** E = E0 + Emax·Cⁿ ÷ (EC50ⁿ + Cⁿ). Inverse: C = EC50 × (ΔE ÷ (Emax − ΔE))^(1/n), ΔE = E − E0.
**Output.** The effect or the concentration, and the effect at 0.1×, 1× and 10× EC50.
**Rule.** A target outside the open interval between E0 and E0 + Emax refuses (the curve never reaches either
end). Every parameter is reader input.

## Tests

- `ddi-basic-screen`: Cmax,u 0.01 µM, Ki,u 1 µM → 0.01, excluded; 0.02 exactly → not excluded. Gut: 100 mg,
  MW 500, Ki,u 50 µM → 800 µM, ratio 16, not excluded; Ki,u 80 µM → 10.0, not excluded; 81 µM → 9.88,
  excluded. TDI: kinact 0.05/min, KI,u 1 µM, Cmax,u 0.1 µM, CYP3A4 → kobs 0.01667/min, ratio 53.08. fu,p 0.002
  unticked → 0.01 used.
- `ddi-static-aucr`: fm 0.9, Fg 1, liver [I] 1 µM, Ki 0.5 µM → Ah 0.3333, AUCR 2.500. TDI only (kinact
  0.05/min, KI 1 µM, [I] 1 µM, kdeg 0.00032/min) → Bh 0.01264, AUCR 8.979. Induction only (Emax 10, EC50 1 µM,
  [I] 1 µM, d 1) → Ch 6, AUCR 0.1818. Gut (Fg 0.5, [I]g 10 µM, Ki 1 µM) → gut factor 1.833; with the liver case
  above, AUCR 4.583. Concentration estimate: fu,p 0.1, Cmax 2 µM, 100 mg, MW 500 (200 µmol), defaults →
  [I]h 1.437 µM, [I]g 66.67 µM. Masking: liver Ki 0.5 µM at 1 µM with Emax 4, EC50 1 µM → inhibition alone
  2.500, induction alone 0.3571, combined 1.000 (in band) and the warning shown.
- `ddi-strength-classify`: 6.2 → strong inhibitor; 5.0 → strong; 4.99 → moderate; 1.25 → weak; 1.24 → below
  weak; ratio 0.15 → 85%, strong inducer; 0.20 → 80%, strong; 0.21 → moderate; substrate 7.0 with a strong
  inhibitor → sensitive; substrate 7.0 without → refused.
- `cyp-list-check`: clarithromycin + simvastatin → CYP3A strong inhibitor and sensitive substrate, one pair;
  "Clarithromycin 500 mg tablet" matches clarithromycin; lopinavir alone matches the "lopinavir and ritonavir"
  row and says so; an unlisted drug reads "not on this edition"; a manifest with `expiresOn` yesterday stops
  the tool; a fixture page with a 20% row drop fails the builder.
- `ddi-cr-ir-predict`: CR 0.92, IR 0.92 (the values Tod 2014 tabulates for midazolam and itraconazole 200 mg,
  used here only as test numbers) → AUCR 6.510; induction CR 0.9, IC 7.7 → 0.1261; back-calculation R 10 with
  IR 0.92 → CR 0.9783; CR 1 and IR 1 refused; CR 1.2 refused.
- `enzyme-recovery-time`: CYP3A4 from 0 → 50% at 36.1 h, 90% at 119.9 h; from 3 (threefold induced) → 150.2%
  of baseline at 72 h; E0 1 refused.
- `dose-history-level`: bolus 1,000 mg at 0 and 15 h, Vd 50 L, t½ 12 h → 16.89 mg/L at 24 h vs 15.00 on time.
  Infusion 1,000 mg over 1 h, same patient → 19.43 mg/L at the end of infusion, 10.29 mg/L at 12 h. Oral 500 mg,
  F 1, ka 1/h, Vd 40 L, t½ 6 h → 9.305 mg/L at 2 h, tmax 2.440 h, Cmax 9.429 mg/L. ka equal to k (t½ 6 h) at
  3 h → 3.063 mg/L by the limit form, matching ka = k + 10⁻⁷ to four figures.
- `two-compartment-params`: 150 mg, A 10, α 1, B 5, β 0.1 → k21 0.4, k10 0.25, k12 0.45, Vc 10 L, AUC 60, CL
  2.5 L/h, Vss 21.25 L, Vβ 25 L, half-lives 0.6931 h and 6.931 h. α = β refused.
- `emax-hill-effect`: E0 0, Emax 100, EC50 10, n 1 at 10 → 50; n 2 at 20 → 80, inverse of 80 → 20; target 100
  refused; Emax −100 (inhibition), n 1, at 10 → −50.
- Every tool: `META.example` reproduces byte for byte, and the MCP adapter round-trips it
  ([project.md](../../project.md) invariant 2).

## MCP

One adapter per tool in `mcp/adapters/<id>-vNNNN.js`, using the existing field kinds (`number`, `enum`,
`bool`, `string`). Lists are a `string` field, one item per line, the shape `auc-trapezoid` already uses for
its points (`'0, 10\n1, 10\n2, 5'`). Tool 4's summary states that a miss means "not on FDA's examples", so an
agent cannot report it as "no interaction".

## Decisions

**D1 — ICH M12, not the 2020 FDA guidances.** M12 is the adopted, harmonized text; the 2020 pages are
superseded and one now 404s.

**D2 — FDA's examples table is the only drug list, and it is a list of examples.** No commercial interaction
database, no severity tier, no "no interaction found". The miss wording is fixed.

**D3 — One equation per tool.** Tools 1 and 2 stay apart because M12 keeps them apart: the basic method is a
screen, and the static model is what a failed screen leads to.

**D4 — No Hypnos or Harmonia dependency.** Every equation here is closed-form; nothing needs an ODE solver, a
population dataset or a Python runtime.

**D5 — Plots are not part of any answer.** A value table always carries the numbers.

## Verify at build

- Re-read M12 §2.1.2, §7.5.1, Table 3 and Table 6; confirm no ICH M12 revision or Q&A document has changed a
  cutoff or a Table 6 value. Record the PDF's hash in `scripts/data/page-hashes.json` (Route B) so the weekly
  page watcher reports a change.
- Re-read FDA Table 1 and Table 2 and confirm the "current as of" date the builder records.
- Confirm no live tool has taken any of the nine ids or an overlapping synonym (`node scripts/build-search-corpus.mjs`
  and a search for each synonym).

## Risks

- **The FDA page is HTML.** A layout change can break the parser. The builder fails closed on a parse that
  yields more than 10% fewer rows than the last edition and the weekly summary says so.
- **Readers will treat tool 4 as an interaction checker.** The output never says "no interaction"; it says
  which FDA examples matched and quotes the not-comprehensive sentence.
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
| An ODE solver for nonlinear or multi-compartment kinetics | Every model here has a closed form; a solver adds error tolerance choices the page would have to explain and test, with no tool that needs it. |
