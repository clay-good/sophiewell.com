# spec-v1007 — The same rule, the second wave: eight more scores that ruled out

## The finding

spec-v1006 established the rule and fixed the tiles a narrow finder could see. That finder asked
for calculators where **every** field is a bare measurement, which found 30 candidates and 7 real
defects. It could not see a score that mixes measurements with checklist criteria — and that is
where most scores live.

Widening it to that mix found eight more calculators giving a reassuring answer to an empty form:

| Tile | With no inputs |
| --- | --- |
| `bard-score` | *"BARD 0/4: 0 to 1 — advanced fibrosis is robustly ruled out"* |
| `hscore-hlh` | *"HScore 0: estimated HLH probability <1%"* |
| `tash-score` | *"TASH score 0: ~0.7% probability of mass transfusion"* |
| `rabt-score` | *"RABT score 0: below the massive-transfusion threshold"* — with no shock index at all |
| `alt-70` | *"ALT-70 0: cellulitis unlikely (>= 83% likelihood of pseudocellulitis)"* |
| `mehran-cin` | *"Mehran score 0: low risk: ~7.5% contrast-induced nephropathy"* |
| `timi-stemi` | *"0.8% 30-day mortality"*, read off the bottom of the Morrow table with age blank |
| `nihss` | *"No stroke symptoms"*, from an exam nobody performed |

Each is the reading that ends an investigation: stop the antibiotics, don't activate the massive
transfusion protocol, don't work up HLH, don't hydrate before the contrast.

## The rule, and where the line falls

The spec-v1006 rule is unchanged. These scores are **monotone** — a component adds points or
leaves them alone — so a partial total is a **lower bound**, safe to rule **in** and never safe to
rule **out**.

What is new is the judgment these tiles force, because their fields are not all the same kind:

- A **checkbox or picker is an answer.** An unchecked "positive FAST" is a negative FAST; a Mehran
  hypotension picker left on "no" is a patient who is not hypotensive. These do not withhold
  anything.
- A **blank measurement is a gap.** An unentered ferritin, base excess, eGFR or age is not a normal
  one, and it is exactly the value that could move the score.

So each tile now withholds only the reassuring reading, and only until its measurements are there:

- `bard-score` refuses the rule-out without a BMI and an AST/ALT pair; BMI 30 plus diabetes still
  reaches 2 and still rules advanced fibrosis in.
- `hscore-hlh` refuses the probability below 169; a score that already reaches 169 on the pickers
  alone still reports.
- `tash-score` and `rabt-score` refuse below their activation thresholds; two RABT flags still
  predict a massive transfusion with no vitals entered.
- `alt-70` refuses below the cellulitis-likely band; asymmetry plus a WBC and a heart rate still
  reaches it without an age.
- `mehran-cin` refuses only the low band — contrast volume and eGFR are its two unbounded terms —
  and still stratifies from 6 up, saying the rest can only raise it.
- `timi-stemi` still scores every answered risk factor with a blank age. Only the mortality figure
  waits, because that is read straight off a total the missing age can raise by 3.
- `nihss` keeps every band above zero (five points of deficit is five points of deficit, however
  many items are left) and refuses only *"No stroke symptoms"* from an unscored exam.

Every refusal names the measurements it is waiting for and says why they matter.

## Proof

- `test/mcp/incomplete-does-not-rule-out.test.js` — four more assertions beside the spec-v1006 set:
  no reassuring band from an empty call, none from the one number someone happens to have, the
  rule-in cases still rule in, and every refusal names its missing measurement.
- Six unit tests **asserted the defect as an expectation** and now assert the refusal —
  `tashScore({})` "low probability", `rabtScore({})` "below threshold", `mehranCin({})` "low",
  `timiStemi({})` "0.8% mortality", `bardScore(9)` valid, `nihss({})` "no symptoms". As in
  spec-v1006: when a test fails after a safety fix, read whether the test was asserting the bug.
- The full unit suite (13,096 tests) and the MCP suite (429) pass.

## What the browser needed

spec-v1006's hard half was the view layer, where `nv(id)` reads a cleared field as `0` and hides
the gap from the library. Six of these eight renderers already read with `optNum` (blank-aware), so
the library guard reaches the reader; they needed only a guard to print the refusal instead of a
`null` total. `hscore-hlh` and `mehran-cin` already had one.

## Left open

`nihss` renders its 13 items as **range sliders**, and a slider has no empty state: at rest every
item reads a present, deliberate `0`. The library fix therefore lands on the agent surface, where a
caller can genuinely omit items, and the browser still shows "No stroke symptoms" on an untouched
form. Making that honest means changing the input control, not the score, and it is a UI change
worth doing on its own — with the same question asked of every other slider-rendered instrument in
the catalog.

The wider `nv(id)` audit named by spec-v1006 also remains open.
