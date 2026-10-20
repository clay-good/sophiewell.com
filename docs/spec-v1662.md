# spec-v1662 — T-MACS (troponin-only Manchester ACS decision aid)

> Status: **SHIPPED (2026-10-20)**: one tool, from the [companion-gap queue](../openspec/changes/companion-gap-queue/proposal.md).

The derivation (Body R et al., *Emerg Med J* 2017;34:517-523) is not open access. Under the owner's rule of
October 17, 2026 (verified reprints count), the model was read on October 20, 2026 in open papers:

| What | Source read | Agreement |
|---|---|---|
| Equation: 1.713 ECG ischaemia, 0.847 crescendo angina, 0.607 right arm or shoulder pain, 1.417 vomiting, 2.058 sweating observed, 1.208 hypotension (systolic below 100), 0.089 per ng/L hs-troponin T, intercept −4.766 | *Diagn Progn Res* 2021 (PMC8499458), Equation 1; *BMJ Open* 2019 (PMC6731951) | identical in both |
| Risk groups: very low below 2% ("ACS can be considered ruled out"), low 2-5%, moderate 5-95%, high 95% or more ("ruled in") | PRESTO protocol, *BMJ Open* 2019 (PMC6830682) | the 2025 comparison in *Medicine* (PMC11813012) tabulates them as <2%, 2-4%, 5-94%, ≥95, placing the 5% and 95% edges the same way |

The tool refuses until all six items are answered: each only adds to the probability, so a blank would understate it.
It is for high-sensitivity troponin T in ng/L, the assay the model used.

## Proof

- `test/unit/t-macs-v1662.test.js`: troponin-only and all-items probabilities from the equation, the 2%, 5% and 95%
  edges, and the refusal on a blank item.
