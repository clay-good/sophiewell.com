# spec-v1248 — an entered lymphocyte count was called missing

The CLL lymphocyte doubling-time formula needs 2 positive absolute lymphocyte
counts and a positive interval. Its local reader already limited each count to
100,000 ×10⁹/L and the interval to 600 months.

That reader returned the same `null` for a blank and a number outside those
bounds. A reader who entered −20 ×10⁹/L or 100,001 ×10⁹/L was therefore told to
enter the counts and interval, and re-entering the same value produced the same
prompt. The agent surface returned the same misleading incomplete result.

`ldt()` now runs the module's existing `gradeFault` distinction before its
complete-the-fields branch. Entered zero, negative, and over-limit values receive
a field-specific range refusal. Blank values retain the original prompt, and the
later-count-must-exceed-earlier relationship remains unchanged. The browser now
publishes the same existing ceilings as input attributes.

No formula, prognostic boundary, or accepted range changed. This is only the
distinction between a value that was not supplied and one that cannot be used.

The unguarded-sibling probe drops from 12 modules / 19 functions to 11 / 18.

## Proof

- `test/unit/heme-prognostic-v216.test.js` pins negative, zero/upper-domain, and
  blank behavior against the pure function.
- `test/integration/lymphocyte-doubling-time-inputs.spec.js` verifies the
  refusal and blank prompt on the rendered page.
- `test/mcp/lymphocyte-doubling-time-inputs.test.js` pins the agent surface.
- Catalog count remains 1,722.
