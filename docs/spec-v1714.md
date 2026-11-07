# spec-v1714 — Review fixes to the drug-interaction tools

> Status: **SHIPPED (2026-11-07)**: fixes to `cyp-list-check` (spec-v1701), `ddi-static-aucr`, `ddi-basic-screen`,
> `enzyme-recovery-time` and `ddi-cr-ir-predict` (spec-v1700), and `ddi-strength-classify` (spec-v1699). The catalog
> stays 2,386.

An independent review checked the eleven drug-interaction libs against their records and found these correct:

- the M12 basic-screen cutoffs (strict "<") and their formulas;
- the mechanistic static model's A, B and C terms, the [I]h and [I]g estimates, the inclusive band and the masking
  logic;
- FDA's strength classes;
- Ohno and Tod;
- dose-history superposition;
- the two-compartment identities;
- the Hill equation;
- the loader.

It found these defects:

| # | Tool | Input | Was | Now |
|---|---|---|---|---|
| 1 | cyp-list-check | "St. John's wort" with midazolam | "not on this edition of FDA's examples", and the CYP3A strong-inducer pair was lost. Rows were stored under their raw names but looked up under the normalized key, so 4 of 244 could never be found: St. John's wort, tobacco (smoking), oral contraceptives, peginterferon alpha-2a. | every row is also stored under the same key the lookup uses, with apostrophes ignored on both sides; all four are found and the pair is reported |
| 1b | cyp-list-check | "lopinavir/ritonavir" | not found (the design matches combinations through their components) | a slash entry not found whole is looked up, and counted, by its parts |
| 2 | ddi-static-aucr | Fg blank, with [I]g entered or estimated | Fg read as 1, which drops the gut term: AUCR 1.119, "risk low" (1.979 at Fg 0.5) | refused: enter Fg, and 1 is allowed when there is no gut extraction. With no [I]g, the gut term is listed under "not entered and left out". Fg 0 is now accepted, as the design says. |
| 3 | ddi-basic-screen, ddi-static-aucr, enzyme-recovery-time | kdeg 0.0193 (CYP3A4 written per hour) | read per minute: time-dependent inhibition "risk excluded" (8.44 with the table's value); 50% recovery at 0.6 h instead of 36.1 h | one check in `lib/ich-m12.js`: kdeg above 0.005/min (half-life under about 2.3 h) or below 0.00001/min is refused, with the per-minute instruction. Table 6 spans 0.00011 to 0.00053/min. |
| 4 | several | starting level 1e308; kdeg 1e-300; Ki 1e-200 with [I]h 1e100; AUC ratio 1e308; IC 1e300 | "Infinity%", "1.155e+298 h", "AUCR 1e+300", "Strong inhibitor (AUC ratio 1e+308)", "AUC ratio 1e-300" | refused by plausibility fences: starting level 0 to 100; AUC ratios 0.0001 to 10,000; IC 0 to 100 |

The Fg field's on-screen label no longer says "blank: 1". Regression tests in `ddi-m12-v1700`, `ddi-pk-v1699` and
`cyp-list-check-v1701` cover every row.
