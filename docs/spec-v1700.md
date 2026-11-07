# spec-v1700 — Drug-interaction kinetics, ICH M12 slice (tools 1, 2, 5 and 6)

> Status: **SHIPPED (2026-11-07)**: `ddi-basic-screen`, `ddi-static-aucr`, `ddi-cr-ir-predict` and
> `enzyme-recovery-time`, with `lib/ich-m12.js`. Open in the change: tool 4 (the FDA Table 1 builder), the plot
> component, and the related-link backfills.

The second build of the [drug-interaction-kinetics](../openspec/changes/drug-interaction-kinetics/proposal.md)
change, after [spec-v1699](spec-v1699.md).

## What shipped

| Tool | What it answers | Source |
|---|---|---|
| `ddi-basic-screen` | Whether M12's basic method excludes a reversible, intestinal CYP3A or time-dependent inhibition risk | ICH M12 §2.1.2.1-2 |
| `ddi-static-aucr` | The mechanistic static AUCR, gut and liver, with M12's three runs when a drug inhibits and induces | ICH M12 §7.5.1, Table 3 |
| `ddi-cr-ir-predict` | CYP3A4 interaction size from CR and IR (or IC), and CR or IR solved from an observed ratio | Ohno 2007, 2008 abstracts; Tod 2014 |
| `enzyme-recovery-time` | Recovery of a CYP enzyme after induction or inactivation | ICH M12 Table 6 |

`lib/ich-m12.js` holds Table 6, the cutoffs and §7.5.1's defaults as a route-B dated constant; the PDF is under the
weekly page watch (SHA-256 `ff0624ed…` in `scripts/data/page-hashes.json`).

## The gate, as read

1.1 ICH M12, Step 4, May 21, 2024 (74 pages, 912,190 bytes), read November 7, 2026: "Ki,u > 50 × Cmax,u (i.e.,
Cmax,u/Ki,u < 0.02)"; the gut test as (Dose/250 mL)/Ki,u < 10; the TDI ratio "< 1.25" with kobs as design.md
gives it; Table 3's A, B and C; [I]h and [I]g with Fa = 1, Fg = 1 and ka = 0.1/min "when the data are not
available" and Qen 18, Qh 97 L/h/70 kg as examples; "If the model estimates AUCR between 0.80 to 1.25, the risk of a
clinically relevant interaction is low"; Table 6 as design.md prints it. All match.

## Choices made at build

- **A combined AUCR inside 0.80 to 1.25 does not read as low risk when either mechanism alone falls outside it.**
  M12 §7.5.1.1 warns the combined run can mask either effect; the first draft headlined M12's "risk ... is low"
  sentence for the masking case and was caught in the browser. The headline now names both single runs.
- **RB has no default.** M12 names the blood-to-plasma ratio in the [I]h estimate but gives no value, so the
  estimate refuses without it.
- **One Ki, KI, kinact, Emax and EC50 for gut and liver**, as Table 3 writes them; only kdeg differs by site
  (intestinal CYP3A4 from Table 6 by default). design.md's combined gut-and-liver vector paired a gut Ki of 1 µM with a
  liver Ki of 0.5 µM, which Table 3 does not allow, so the gut factor (1.833) is tested on its own.
- **Ohno's validation sentence** is quoted as the abstract counts it (50 and 57 studies); no total is inferred.
- **The washout delay** in the recovery tool is entered in hours; no rule for how long a drug takes to wash out is
  built in.
- **Search wording** audited word by word. Drafts took "ir" (`homa-ir`), "ki" (`nen-who-grade`, Ki-67), "turnover"
  (`staff-turnover-rate`), "enzyme" (`hys-law`), "interaction" (`dips-interaction`), "predicted"
  (`pk-steady-state-predict`) and "inducer", and two summaries saying "AUC ratio" pushed `vanc-auc` off the choices for
  a bare "auc". Names and phrases were changed until none moved.

## Proof

- `test/unit/ddi-m12-v1700.test.js` (12 tests): Table 6 and the cutoffs as printed; every design.md vector for the
  four tools, each cutoff on both sides; the fu,p floor; the estimates; the three-run masking case; refusals.
- `test/unit/fuzz-tools.test.js` runs all four modules; `test/mcp/mcp-search-relevance.test.js` has one probe each.
