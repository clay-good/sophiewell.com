# Spec Delta — drug-interaction-kinetics

## ADDED Requirements

### Requirement: ICH M12 basic-method screen

The catalog SHALL provide `ddi-basic-screen` applying the ICH M12 basic methods as read: reversible
inhibition excluded when Cmax,u ÷ Ki,u < 0.02, intestinal CYP3A inhibition excluded when (Dose ÷ 250 mL) ÷
Ki,u < 10, and time-dependent inhibition excluded when (kobs + kdeg) ÷ kdeg < 1.25 with kobs = kinact × 5 ×
Cmax,u ÷ (KI,u + 5 × Cmax,u), prefilling kdeg from M12 Table 6 and replacing an unvalidated fu,p below 0.01
with 0.01.

#### Scenario: Reversible inhibition excluded
- **WHEN** Cmax,u is 0.01 µM and Ki,u is 1 µM
- **THEN** the ratio prints 0.01, below 0.02, and the risk is reported as excluded by the basic method

#### Scenario: Gut CYP3A not excluded
- **WHEN** the maximum dose is 100 mg, the molecular weight 500 g/mol and Ki,u 50 µM
- **THEN** Dose ÷ 250 mL prints 800 µM, the ratio prints 16, and the page links the static model

#### Scenario: Time-dependent inhibition of CYP3A4
- **WHEN** kinact is 0.05/min, KI,u 1 µM, Cmax,u 0.1 µM and the enzyme is hepatic CYP3A4
- **THEN** kdeg prefills 0.00032/min, kobs prints 0.01667/min and the ratio 53.08, not excluded

#### Scenario: Exactly at a cutoff
- **WHEN** Cmax,u ÷ Ki,u is exactly 0.02
- **THEN** the risk is reported as not excluded, because M12's condition is strictly below 0.02

#### Scenario: Protein binding floor
- **WHEN** fu,p 0.002 is entered and the validation box is not ticked
- **THEN** 0.01 is used and the page says so

### Requirement: Mechanistic static model AUC ratio

The catalog SHALL provide `ddi-static-aucr` computing ICH M12's AUCR from gut and liver reversible
inhibition, time-dependent inhibition and induction terms, printing the 0.80 to 1.25 band with M12's
sentence and its negligible-extrahepatic-clearance assumption, and, when both inhibition and induction are
entered, printing inhibition-only, induction-only and combined results.

#### Scenario: Reversible liver inhibition
- **WHEN** fm is 0.9, Fg is 1, [I]h is 1 µM and Ki is 0.5 µM, with no other mechanism
- **THEN** Ah is 0.3333 and AUCR prints 2.5, above 1.25

#### Scenario: Time-dependent inhibition in the liver
- **WHEN** fm is 0.9, [I]h 1 µM, kinact 0.05/min, KI 1 µM and kdeg 0.00032/min
- **THEN** Bh prints 0.01264 and AUCR 8.979

#### Scenario: Concentrations estimated with M12's defaults
- **WHEN** fu,p is 0.1, Cmax 2 µM, the dose 100 mg with molecular weight 500, and M12's defaults are used
- **THEN** [I]h prints 1.437 µM and [I]g 66.67 µM, with each default labeled

#### Scenario: Masking
- **WHEN** liver Ki is 0.5 µM at 1 µM with induction Emax 4 and EC50 1 µM, fm 0.9
- **THEN** inhibition alone prints 2.500, induction alone 0.3571, combined 1.000, and the page shows M12's
  warning that a combined prediction can mask either effect

### Requirement: Strength class from an observed AUC ratio

The catalog SHALL provide `ddi-strength-classify` assigning FDA's Table 2 class to an observed AUC ratio
and giving a substrate class only when the precipitant was a strong inhibitor.

#### Scenario: Strong inhibitor
- **WHEN** a precipitant raised an index substrate's AUC 6.2-fold
- **THEN** the class is strong inhibitor with FDA's "≥5-fold" sentence

#### Scenario: Strong inducer
- **WHEN** the AUC ratio is 0.15
- **THEN** the decrease prints 85% and the class is strong inducer

#### Scenario: Boundaries
- **WHEN** the ratio is 1.25, and then 1.24
- **THEN** 1.25 is a weak inhibitor and 1.24 is below the weak threshold

### Requirement: FDA examples checked against a medication list

The catalog SHALL provide `cyp-list-check` matching a medication list against FDA Table 1 as fetched by the
weekly refresh, listing each match and each inhibitor-or-inducer and substrate pair on the same enzyme,
reading a miss as "not on this edition of FDA's examples", quoting FDA's not-comprehensive sentence on every
result, never stating that a pair is safe or giving an action, and stopping when the data is past its
14-day expiry.

#### Scenario: A listed pair
- **WHEN** the list is clarithromycin and simvastatin
- **THEN** clarithromycin is shown as a strong CYP3A inhibitor, simvastatin as a sensitive CYP3A
  substrate, and the pair is listed under CYP3A with FDA's "current as of" date

#### Scenario: A drug not in the table
- **WHEN** a drug on the list is not in Table 1
- **THEN** it reads "not on this edition of FDA's examples", not "no interaction"

#### Scenario: Salt, strength and combination rows
- **WHEN** the list holds "Clarithromycin 500 mg tablet" and "lopinavir"
- **THEN** the first matches clarithromycin and the second matches FDA's "lopinavir and ritonavir" row, which
  is quoted as FDA wrote it

#### Scenario: Builder refuses a broken parse
- **WHEN** the weekly fetch parses more than 10% fewer Table 1 rows than the last edition, or cannot find
  the table whose first header is "Drug or Other Substance"
- **THEN** the builder fails, keeps the last good edition with its expiry unchanged, and the weekly summary
  says why

#### Scenario: Stale data
- **WHEN** the last successful fetch is more than 14 days old
- **THEN** the tool stops answering from the table and says when it was last fetched

### Requirement: CR-IR prediction from reader values

The catalog SHALL provide `ddi-cr-ir-predict` computing AUCR = 1 ÷ (1 − CR × IR) for CYP3A4 inhibition and
1 ÷ (1 + CR × IC) for induction from reader-entered values, back-calculating CR or IR from an observed ratio,
printing the authors' validation spread, asking for the inhibitor dose an IR belongs to, and refusing CR × IR
of 1 or more and any CR outside 0 to 1.

#### Scenario: Inhibition
- **WHEN** CR is 0.92 and IR 0.92
- **THEN** AUCR prints 6.510 with the sentence that 83% of the authors' predictions fell within 67-150% of
  the observed increase

#### Scenario: Induction
- **WHEN** CR is 0.9 and IC 7.7
- **THEN** AUCR prints 0.1261

#### Scenario: Back-calculated contribution ratio
- **WHEN** a substrate's AUC rose 10-fold with an inhibitor whose IR is 0.92
- **THEN** CR prints 0.9783

#### Scenario: Method limit
- **WHEN** CR and IR are both 1
- **THEN** the tool refuses and names the limit of the equation

### Requirement: Enzyme recovery by first-order turnover

The catalog SHALL provide `enzyme-recovery-time` computing E(t) = 1 + (E0 − 1) × e^(−kdeg × t) with M12
Table 6 prefills, the time to 50% and 90% recovery, and a note that the precipitant's own washout comes
first.

#### Scenario: After induction
- **WHEN** hepatic CYP3A4 starts at three times baseline and 72 hours have passed
- **THEN** the level prints 150.2% of baseline

#### Scenario: CYP3A4 after full inactivation
- **WHEN** the enzyme is hepatic CYP3A4 and the starting level is 0
- **THEN** 50% recovery prints at 36.1 hours and 90% at 119.9 hours from kdeg 0.00032/min

### Requirement: Level from an actual dose history

The catalog SHALL provide `dose-history-level` computing levels by superposition on the linear
one-compartment model for IV bolus, IV infusion and first-order oral doses at reader-entered times, and
printing the on-time regimen beside it.

#### Scenario: A late dose
- **WHEN** 1,000 mg IV bolus doses are given at 0 and 15 hours (the second due at 12), Vd is 50 L and the
  half-life 12 hours
- **THEN** the level at 24 hours prints 16.89 mg/L, beside 15.00 mg/L had the second dose been on time

#### Scenario: Oral absorption equal to elimination
- **WHEN** a 500 mg oral dose has F 1, Vd 40 L, half-life 6 hours and ka equal to the elimination constant
- **THEN** the level at 3 hours prints 3.063 mg/L from the limit form, with no division by zero

### Requirement: Two-compartment parameters

The catalog SHALL provide `two-compartment-params` converting a biexponential IV bolus fit to k21, k10, k12,
Vc, Vss, Vβ, AUC and CL, refusing when α ≤ β or a micro-constant is negative.

#### Scenario: Worked conversion
- **WHEN** the dose is 150 mg, A 10 mg/L, α 1/h, B 5 mg/L and β 0.1/h
- **THEN** k21 is 0.4/h, k10 0.25/h, k12 0.45/h, Vc 10 L, AUC 60 mg·h/L, CL 2.5 L/h and Vss 21.25 L

### Requirement: Sigmoid Emax and its inverse

The catalog SHALL provide `emax-hill-effect` computing E = E0 + Emax × Cⁿ ÷ (EC50ⁿ + Cⁿ) and its inverse,
refusing a target effect outside E0 to E0 + Emax.

#### Scenario: Hill coefficient 2
- **WHEN** E0 is 0, Emax 100, EC50 10 and n 2, at a concentration of 20
- **THEN** the effect prints 80, and the inverse of 80 prints a concentration of 20
