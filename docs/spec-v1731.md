# spec-v1731 — The unguarded siblings, driven

> Status: **SHIPPED (2026-11-15)** for the rows existing envelopes cover; **OPEN** for the rest (below).
> The catalog stays 2,387.

`scripts/probe-unguarded-sibling.mjs` lists 45 functions in 25 modules that read numbers while a sibling in the
same module calls a guard. It is a static check, so each function's tool was driven with 999999 or -999999 in
every number field, on the page's path:

| | Fields |
|---|---|
| Answered an impossible value confidently, in the library | 65, across 24 tools |
| Of those, open to agents (no adapter range) | 64 |
| Confirmed on the page with no range warning | 48 |

For example: an aortic valve area of 157,079,318,520 cm² read "mild aortic stenosis"; a Duke treadmill time of
999,999 minutes read "low risk, 99% 5-year survival"; DAS28 clamped a joint count of 999,999 to 28 and scored it.

## Fixed: 16 fields, with no new clinical claim

| Bound | Tools and fields |
|---|---|
| An envelope `lib/bounds.js` already declares | BODE and hepatic steatosis index BMI; HOMA-IR glucose (mmol/L converted first); CLIF-C ACLF age and WBC; surgical Apgar and hemodynamic-suite heart rate; mechanical-power respiratory rate; IOM weight and height (converted from lb and in, refused in lb and in) |
| A bound that follows by definition | MAP between `bounds.js`'s diastolic floor (5) and systolic ceiling (300), in cardiac power output, the hemodynamic suite and surgical Apgar; DAS28's joint counts (0 to 28, whole) and patient global (0 to 100) |

Each refuses by name on the page and for agents. The page probe now leaves 32 of the 48 rows.
Tests: `test/unit/sibling-envelopes-v1731.test.js`.

## Open: the quantities `lib/bounds.js` has no envelope for

The remaining 49 library rows (32 on the page) need an envelope that does not exist yet. The house rule for
`lib/bounds.js` is that each bound names a recorded extreme or is arithmetic, so these are not guessed here:

| Quantity | Tools |
|---|---|
| LVOT diameter, VTI | `aortic-valve-area` |
| Cardiac output, CVP, mPAP, PCWP, BSA | `cardiac-power-output`, `hemodynamic-suite` |
| Treadmill minutes, ST deviation | `duke-treadmill` |
| Lead I / aVF net QRS amplitude | `ecg-axis` |
| FEV1 % predicted, ~~6-minute walk distance~~ (walk: done in spec-v1735) | `gold-spirometry`, `bode-index` |
| Fasting insulin, HDL, waist (triglycerides: done in spec-v1734) | `homa-ir`, `quicki`, `metabolic-syndrome` |
| ~~ALT, AST~~ (done in spec-v1734) | `hepatic-steatosis-index` |
| CA-125, HE4 | `roma-ovarian`, `rmi-ovarian` |
| ~~hCG~~ (done in spec-v1735), interval hours | `barnhart-hcg` |
| Tumor count and size | `milan-criteria` |
| Stone dimensions, tract length, Hounsfield units | `stone-nephrolithometry` (HU is not definitional: extended-scale CT reports past 3,071) |
| Tidal volume, ~~plateau, PEEP, peak pressure~~ (pressure order: done in spec-v1736) | `mechanical-power` |
| Contrast volume | `mehran-cin` |
| Estimated blood loss | `surgical-apgar` |
| Vd, CL, Cp, dosing interval | `pk-suite` |
| D-dimer | `peged` |
| Urine creatinine | `urine-calcium-cr` |
| ~~ESR~~ (done in spec-v1735) | `das28` |
