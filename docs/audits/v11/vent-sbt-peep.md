# v11 audit - vent-sbt-peep

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Boles JM, Bion J, Connors A, et al. *Weaning from mechanical ventilation.* Eur Respir J. 2007;29(5):1033-1056 (five SBT readiness criteria: PaO2/FiO2 >=150, PEEP <=8, FiO2 <=0.5, minimal or no vasopressors, awake / cooperative). ARDS Network. *Ventilation with lower tidal volumes as compared with traditional tidal volumes for acute lung injury and ARDS.* N Engl J Med. 2000;342(18):1301-1308 (low-PEEP arm). Brower RG, et al. *Higher versus lower positive end-expiratory pressures in patients with the acute respiratory distress syndrome.* N Engl J Med. 2004;351(4):327-336 (ALVEOLI high-PEEP arm).

`lib/scoring-v4.js ventSbtPeep()` accepts `{pao2FiO2, peep, fio2, vasopressors, awakeCooperative, ardsArm, lookupFiO2}` and returns `{sbtReady, sbtChecks, failedCriteria, ardsArm, lookupFiO2, suggestedPeep, banners, text}`.

## Boundary examples added
- PaO2/FiO2 200, PEEP 6, FiO2 0.4, no vaso, awake -> SBT ready.
- PaO2/FiO2 149 -> not ready (fails the >=150 criterion).
- PEEP 10 -> fails the <=8 criterion.
- Vasopressors true -> not ready.
- ARDSnet low-PEEP at FiO2 0.5 -> 8-10 cm H2O.
- ARDSnet low-PEEP at FiO2 1.0 -> 18-24 cm H2O.
- ARDSnet high-PEEP at FiO2 0.3 -> 12-14 cm H2O.
- FiO2 0.55 rounds up to next band (-> PEEP 10).

## Cross-implementation differential
- Reference: Boles 2007 SBT criteria; ARDS Network 2000 / ALVEOLI 2004 tables.
- Sophie result: matches each band and each criterion boundary. PASS.

## Edge-input handling notes
- Unknown ARDSnet arm throws.
- Lookup FiO2 omitted -> suggestedPeep null; SBT block still evaluates.
- Out-of-range Lookup FiO2 (>1 or <0) throws.

## A11y / keyboard notes
- Two fieldsets (SBT criteria; ARDSnet lookup), labeled inputs / selects / checkboxes; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
