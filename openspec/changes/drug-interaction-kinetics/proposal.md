# Change: Drug-interaction kinetics and polypharmacy exposure math

**Status:** Proposed November 7, 2026; hardened the same day (sources re-read, every test vector recomputed,
the FDA page fetched and its structure recorded). Docs-only: no catalog-count or code change. Nine tools; none is
build-gated. One prerequisite: the plot component in `docs/design.md` (tools ship with value tables until it lands).
**Audience:** the clinical pharmacist reviewing a medication list, the clinical pharmacology student, the
drug-development scientist reading an in vitro interaction report, and an AI agent auditing a list over MCP.

## Why

The catalog computes how one drug behaves (`pk-suite`, `pk-steady-state-predict`, `auc-trapezoid`,
`sawchuk-zaske-dosing`, `phenytoin-mm-dose`) and scores whether an observed reaction was an interaction
(`dips-interaction`, `naranjo`, `disproportionality-2x2`). It has nothing that predicts how much one drug
changes another's exposure, nothing that tells a reader which drugs on a list FDA names as strong CYP
inhibitors or sensitive substrates, and nothing for a dose history with late or missed doses.

A name search of the live catalog on November 7, 2026 for "AUCR", "static model", "Ki", "kinact",
"index substrate", "strong inhibitor", "CYP3A", "two-compartment", "Emax", "Hill", "missed dose" and
"enzyme recovery" found only `cyp2d6-phenoconversion` (one gene, CPIC's own adjustment), which this change
does not touch.

The primary sources are public and were read on November 7, 2026:

- **ICH M12, Drug Interaction Studies** (Step 4, adopted May 21, 2024; FDA's current guidance for this
  subject): the basic methods (§2.1.2), the mechanistic static model (§7.5.1, Table 3), and the
  representative enzyme turnover constants (Table 6).
- **FDA, "Drug Development and Drug Interactions: Table of Substrates, Inhibitors and Inducers"**
  ("Content current as of: 05/29/2026"): the strength definitions (Table 2) and the drug examples
  (Table 1) for CYP1A2, 2B6, 2C8, 2C9, 2C19, 2D6 and 3A.

## What changes

| # | id | Name | Source |
|---|---|---|---|
| 1 | `ddi-basic-screen` | In Vitro Interaction Screen: Reversible, Gut CYP3A and Time-Dependent Inhibition (ICH M12 Basic Methods) | ICH M12 §2.1.2.1, §2.1.2.2, Table 6 (read) |
| 2 | `ddi-static-aucr` | Predicted AUC Ratio From the Mechanistic Static Model (ICH M12) | ICH M12 §7.5.1, Table 3 (read) |
| 3 | `ddi-strength-classify` | Inhibitor, Inducer or Substrate Strength From an Observed AUC Ratio (FDA Definitions) | FDA Table 2 (read) |
| 4 | `cyp-list-check` | Which Drugs on This List FDA Names as CYP Inhibitors, Inducers or Sensitive Substrates | FDA Table 1 (read; weekly page watch) |
| 5 | `ddi-cr-ir-predict` | Interaction Size From Contribution Ratio and Inhibition Ratio (Ohno) | Ohno 2007 and 2008 abstracts (the authors' equations, read); Tod 2013 and 2014 (open restatements, read) |
| 6 | `enzyme-recovery-time` | Enzyme Recovery After Stopping an Inducer or Irreversible Inhibitor | ICH M12 Table 6 turnover constants (read) |
| 7 | `dose-history-level` | Drug Level From an Actual Dose History (Late, Missed or Extra Doses) | arithmetic identity: superposition on the linear one-compartment model |
| 8 | `two-compartment-params` | Two-Compartment Micro-Constants, Volumes and Clearance From a Biexponential Fit | arithmetic identity of the linear two-compartment model |
| 9 | `emax-hill-effect` | Effect From Concentration and Concentration for a Target Effect (Sigmoid Emax) | arithmetic identity; Hill 1910 cited for the name only (not opened) |

## Why this passes the admission rule

Each takes the reader's concentrations, constants, AUC ratio, dose history or drug list and returns a
number or a decision with its equation shown. The only shipped data are ICH M12 Table 6 (eight dated
constants, readable as input instead) and FDA's Table 1 examples (fetched weekly with a pinned hash and a
14-day expiry, so the tool fails closed). Tool 4 is a decider over a list, admitted on the
`hazardous-drug-list-check` precedent ([scope-pharmacy-practice](../../../docs/scope-pharmacy-practice.md)
question 5): a miss reads "not on this edition of FDA's examples", never "safe".

## What this does not do

- It does not grade the clinical severity of an interaction or tell the reader what to do. FDA's table is
  examples, and its own words are "not considered a comprehensive list".
- It does not ship a drug's Ki, kinact, fm or Emax. Those come from the reader's study or label.
- It does not run a physiologically based (PBPK) model. ICH M12 names PBPK as the next step when the static
  model cannot exclude risk; that needs a validated platform and population data the catalog cannot ship.
- It does not call FAERS, black-box text, RxNorm or PubChem. FAERS counts already go into
  `disproportionality-2x2`; boxed warnings are label prose, not a computation.
- It needs nothing from Hypnos or Harmonia. Every equation is closed-form and zero-dependency.

## Impact

- New capability `drug-interaction-kinetics`.
- Backfills (links and prefill, no compute change): `pk-steady-state-predict` and `pk-suite` link to tool 7;
  `cyp2d6-phenoconversion` and `dips-interaction` link to tools 3 and 4; tool 2's AUCR can prefill a
  proportional dose in `pk-suite` (dose ÷ AUCR, linear drugs only, said on the page).
- Refresh manifest: one new page watch (FDA Table 1 and Table 2), fail closed.
- MCP: one adapter per tool, using the existing field kinds; tool 4 takes the medication list as one string,
  one drug per line, and is the list-audit entry point an agent calls.
- Data: one new Route A builder (`scripts/data/builders/fda-ddi-examples.mjs`) and two Route B page hashes (the
  ICH M12 PDF for Table 6 and the cutoffs; the FDA page as a backstop to the builder).
