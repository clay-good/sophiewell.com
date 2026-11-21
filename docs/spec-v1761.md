# spec-v1761 — A negative read as a blank field; the last two finders reach blank fields

> Status: **SHIPPED (2026-11-21)**: 6 tools. The catalog stays 2,387.

spec-v1758 and v1759 found that finders starting from a tool's worked example never asked about a field the
example leaves blank. The last two with that gap now fill one too:

- `scripts/probe-sign-flipped.mjs` (a negative answered like +x, or like the field left blank): reach 3,536 ->
  3,894 fields. Seven new "read as blank" rows, all fixed below.
- `scripts/probe-fraction-rounded.mjs` (a fraction silently rounded): reach 2,633 -> 2,910 fields. Two new rows,
  both honest rounding (a dose-calendar window in whole days, an iron-stores override in whole milligrams).

| Tool | Field | Before (a negative entered) |
|---|---|---|
| `ahi-odi-severity` | ODI | dropped, as if not entered |
| `delta-gap` | normal anion gap | replaced by the default of 12 |
| `kdigo-aki` | anuria duration | dropped |
| `peds-weight-est` | age in months | dropped (fell back to years) |
| `phoenix-sepsis` | D-dimer, fibrinogen | dropped from the coagulation score |
| `toxic-alcohol` | documented methanol or ethylene glycol level | dropped |

Each now refuses a negative by name; a blank keeps its meaning. Two did the same with an out-of-range positive:
delta-gap replaced a normal anion gap outside 3-20 (or bicarbonate outside 15-30) with its default, and
peds-weight-est dropped a months value over 12; both now refuse it with the range. `o2-cylinder-duration`'s two rows stay (owner
decision of 2026-11-17).

Tests: `test/unit/negative-read-as-blank-v1761.test.js`.
