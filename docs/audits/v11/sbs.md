# v11 audit - sbs

- Auditor: CG
- Date: 2026-05-21
- Citation re-verified against: Curley MAQ, Harris SK, Fraser KA, Johnson RA, Arnold JH. *State Behavioral Scale (SBS): a sedation assessment instrument for infants and young children supported on mechanical ventilation.* Pediatr Crit Care Med. 2006;7(2):107-114. Single 6-level ordinal scale (-3 unresponsive, -2 responsive only to noxious stimuli, -1 responsive to gentle touch or voice, 0 awake and able to calm, +1 restless and difficult to calm, +2 agitated). -3 / -2 indicate deeper-than-target sedation; -1 / 0 indicate target sedation in most PICU protocols; +1 / +2 indicate inadequate sedation or active distress.

`lib/scoring-v4.js sbs()` validates the level as an integer in [-3, 2] and returns `{score, label, desc, band, text}`.

## Boundary examples added

- -3 (unresponsive) -> deeper than target.
- -2 (noxious-only) -> deeper than target.
- -1 (gentle touch) -> target.
- 0 (tile example, awake and able to calm) -> target.
- +1 (restless) -> inadequate / distress.
- +2 (agitated) -> inadequate / distress.

## Cross-implementation differential

- Reference: Curley 2006 Table 1 worked example "ventilated PICU patient withdraws to noxious stimulation only -> SBS -2, deeper than typical sedation target."
- Sophie result: `sbs({level: -2})` returns `score: -2, band: 'deeper than target sedation'`. PASS.

## Edge-input handling notes

- Non-integer or out-of-range items throw. Values above +2 or below -3 throw.

## A11y / keyboard notes

- Single labeled range input (-3..+2) with a linked output span showing the canonical SBS level and short descriptor; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
