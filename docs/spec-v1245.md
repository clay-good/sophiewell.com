# spec-v1245 — a meal dose that disappeared at the display boundary

`insulin-correction` accepts optional carbohydrates and an insulin-to-carbohydrate
ratio so it can add meal coverage to the correction dose. Leaving carbohydrates
blank is deliberately supported: it means correction-only. Two entered values
were indistinguishable from that blank path:

- a negative carbohydrate amount failed the `c > 0` test and silently produced
  0 U of meal coverage;
- a very large positive ratio produced a positive meal dose below 0.05 U, which
  rounded to 0 U everywhere the result exposed it.

The first case is invalid arithmetic, not an optional input. The compute now
rejects a negative carbohydrate entry. When carbohydrates are positive, it also
requires a finite, positive insulin-to-carbohydrate ratio. A blank carbohydrate
field and a typed 0 remain valid correction-only inputs.

The second case does not justify inventing a clinical upper bound for the ratio.
The math is defined, so the compute still returns the dose at its existing 0.1 U
precision and adds a sentence saying the entered carbohydrate coverage is
greater than 0 U but below that display precision. The reader can now tell the
difference between a tiny computed meal component and no meal component.

The browser passes blanks as `null` for these two fields instead of converting
them with `Number('')` to 0 before the compute can inspect them. The MCP adapter
already preserves omission and needs no surface-specific branch.

## Proof

- `test/unit/insulin-correction.test.js` pins negative-carbohydrate refusal,
  ratio dependency, blank and typed-zero correction-only use, and the sub-0.1 U
  disclosure.
- `node scripts/probe-impossible-reads-as-absent.mjs` drops from 9 silent fields
  to 7, removing both `insulin-correction` rows.
- The published formula, dose precision, and worked example are unchanged.
- Catalog count remains 1,722.
