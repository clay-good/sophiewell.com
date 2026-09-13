# spec-v1247 — a negative infusion lowered the support score

The Vasoactive-Inotropic Score is a weighted sum of 6 infusion rates. A dose of
0 means that drug is not running; every running dose is nonnegative.

`vis()` protected the result from non-finite input, but accepted finite negative
numbers. A dopamine rate of −5 mcg/kg/min and norepinephrine at 0.05 mcg/kg/min
therefore produced VIS 0 instead of refusing the impossible dose. The negative
entry canceled real support and made the result look reassuring.

The function now checks all 6 entered rates before computing either VIS or the
Wernovsky Inotrope Score. A negative rate throws a field-specific refusal on the
browser and agent surfaces. Zero remains valid and still means no infusion. The
page also publishes `min="0"` for each numeric control.

No upper clinical limit was added. The score's formula does not define one, and
inventing a maximum would change the supported domain rather than repair this
defect. The existing non-finite-to-zero hardening remains unchanged.

The unguarded-sibling probe now recognizes the module's floor-only measurement
guard and drops from 13 modules / 20 functions to 12 / 19.

## Proof

- `test/unit/vis.test.js` pins both negative refusals and the valid zero case.
- `test/integration/vis-inputs.spec.js` verifies the rendered refusal and the
  restored VIS 0 result.
- `test/mcp/vis-inputs.test.js` pins the same refusal on the agent surface.
- The existing derivation cross-checks still reproduce every weighted sum.
- Catalog count remains 1,722.
