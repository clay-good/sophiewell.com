# spec-v1736 — Ventilator and hemodynamic pressures in their definitional order

> Status: **SHIPPED (2026-11-16)**: 5 ventilator tools, then 3 hemodynamic tools. The catalog stays 2,387.

spec-v1731 listed `mechanical-power`'s pressures as unbounded. They need no outside source: peak is plateau plus
the resistive pressure, and plateau is PEEP plus the driving pressure, so **0 <= PEEP <= plateau <= peak**.
Driving the sibling ventilator tools found the same gap in four more.

| Tool | Before | Now |
|---|---|---|
| `mechanical-power` | plateau 80, peak 30: -5.3 J/min, "below the higher-VILI-risk threshold"; PEEP -10: 11 J/min, same | refuses, naming the pair out of order |
| `lis-murray` | PEEP -5 scored 0: "Murray LIS 0: no lung injury" | PEEP 0-50 cmH2O; a compliance of 0 or less refused |
| `vent-sbt-peep` | PEEP -5, FiO2 0.05 or P/F 99,999 met its criterion: "SBT ready" | PEEP 0-50; FiO2 from its `lib/bounds.js` envelope; P/F 10 to 3,334 (the PaO2 envelope 10-700 over the FiO2 envelope 0.21-1) |
| `mean-airway-pressure` | PEEP 60 under PIP 30 gave a mean above the peak | refused |
| `driving-pressure` | plateau <= PEEP returned `valid: true` with null numbers; a peak below the plateau gave a dynamic compliance above the static | `valid: false` with the message; peak < plateau refused |

The 0-50 cmH2O PEEP range is the one `driving-pressure` already enforced. Equal pressures still answer (pressure
control: peak about plateau). `airway-resistance`, `auto-peep`, `apps-ards` and `nhsn-vae` already refused.

## Second batch: hemodynamic pressures

Blood flows down its pressure gradient, so each resistance's upstream pressure is the higher one.

| Tool | Before | Now |
|---|---|---|
| `hemodynamic-suite` | PCWP 30 over mPAP 20: PVR -2 Wood units flagged "normal"; CVP 95 over MAP 90: SVR -80 flagged "low" | PCWP > mPAP and CVP >= MAP refused |
| `transpulmonary-gradient` | PCWP above mPAP: a negative TPG "within the historically normal range"; PA diastolic above the mean answered | both refused; a negative DPG still answers (it is reported in practice) |
| `portopulmonary-hypertension` | wedge 40 over mPAP 23: "does not meet" | refused (`ph-hemodynamics-2022` already did this) |

CVP above mPAP is deliberately NOT refused: a Fontan circulation has no subpulmonary ventricle, and its caval
pressure sits at or just above the PA pressure.

Tests: `test/unit/ventilator-pressure-order-v1736.test.js` (ventilator); new cases in `hemodynamic-suite.test.js`, `transpulmonary-gradient.test.js`, `liver-endoscopy-classifications.test.js`, and a new case in `test/unit/mechanical-power.test.js`.

Still open from spec-v1731: `mechanical-power`'s tidal volume; `hemodynamic-suite`'s cardiac output, CVP and BSA ceilings; and the other quantities in its table.
