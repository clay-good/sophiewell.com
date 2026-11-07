# spec-v1702 — Drug-interaction kinetics: backfills (task 4.3)

> Status: **SHIPPED (2026-11-07)**. With this, every tool and task of the
> [drug-interaction-kinetics](../openspec/changes/drug-interaction-kinetics/proposal.md) change is built
> ([spec-v1699](spec-v1699.md) to [spec-v1701](spec-v1701.md)) except the plot component (0.1), a design-system change
> shared with biosignal-analysis that no answer depends on.

## What changed

| Tile | Related tools now include |
|---|---|
| `pk-suite` | `dose-history-level` (in place of `opioid-mme`, which shares no method with it) |
| `pk-steady-state-predict` | `dose-history-level` |
| `cyp2d6-phenoconversion` | `ddi-strength-classify`, `cyp-list-check` |
| `dips-interaction` | `cyp-list-check` |

**The AUCR-to-dose prefill into `pk-suite` was not built.** `pk-suite`'s proportional dose takes a target and a
measured concentration in mg/L; prefilling it with an AUC ratio would put a ratio under a mg/L label. Instead
`ddi-static-aucr` prints the fraction itself: for a substrate with linear kinetics, 1/AUCR of the dose gives the
exposure seen without the interacting drug, and the sentence says it does not hold for saturable elimination.

## Proof

`test/unit/ddi-m12-v1700.test.js` checks the 1/AUCR sentence (0.4 of the dose at AUCR 2.5);
`test/unit/related-tools.test.js` holds each list to four entries.
