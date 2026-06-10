# v11 audit - o2-cylinder-duration

- Auditor: CG
- Date: 2026-06-10 (spec-v65).
- Citation re-verified against: Compressed Gas Association cylinder specifications and standard respiratory-care cylinder factors (Kacmarek RM, Stoller JK, Heuer AJ. Egan's Fundamentals of Respiratory Care, 12th ed., 2020). Cylinder factors D 0.16, E 0.28, M 1.56, G 2.41, H/K 3.14 L/psi; usable minutes = (gauge psi - safe residual psi) x factor / flow.

`lib/clinical-v8.js` `o2CylinderDuration()` — given a cylinder factor (selected by size), the current gauge pressure (psi), the flow rate (L/min), and a safe-residual pressure (default 200 psi), returns the usable oxygen volume above the residual (L), the time to reach that residual (floored minutes), an at/below-residual flag, and the inverse: the maximum flow that lasts a given target transport time. The clinical purpose is the respiratory-safety analog of `infusion-time-remaining`: the calculation that gates every intra-hospital transport of an oxygen-dependent patient. Utility-class arithmetic — the factors are physical constants of the cylinder geometry, not a derived clinical constant.

## Boundary examples added
- See test/unit/o2-cylinder-duration.test.js (5 cases): the standard E-cylinder worked example (2000 psi gauge, 200 residual, 2 L/min -> 504 L usable, 252 min), the cylinder-factor table pin (D/E/M/G/H), the max-flow inverse for a 45-min round trip with flow 0 (no time-to-empty), the gauge-at/below-residual path (0 usable, flag set, no negative duration), and the flow-0 null / impossible-input throw path.

## Cross-implementation differential
- Worked example reproduced by hand: (2000 - 200) x 0.28 = 504 L; 504 / 2 = 252 min = 4h 12m; PASS. Cylinder factors spot-checked against the published CGA/Egan values. Inverse max-flow cross-checked: 560 / 45 = 12.44 L/min; PASS.

## Edge-input handling notes
- flowLpm 0 returns minutesRemaining = null (the renderer guards before showing a duration); targetMinutes 0 returns maxFlowLpm = null. Usable volume is floored at 0 via Math.max, so a gauge at or below the residual yields 0 usable and atOrBelowResidual = true rather than a negative number. All numeric inputs are validated through lib/num.js num() (factorLPsi min 0.001, gaugePsi/residualPsi min 0, flowLpm/targetMinutes min 0); a missing/non-finite/out-of-range value throws TypeError/RangeError, caught by the renderer safe() wrapper. clinical-v8.js is enrolled in the spec-v59 object-aware fuzz harness — zero non-finite leaks on import. Every interpolated number routes through fmt().

## A11y / keyboard notes
- Labeled select (cylinder size) + number inputs (gauge, flow, residual, target) with label for=; aria-live results region; the planning-estimate note renders as muted text. test:a11y clean.

## Defects opened

- none

## Status
- PASS
