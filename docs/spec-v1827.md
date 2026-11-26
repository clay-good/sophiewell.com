# spec-v1827 — An envelope has two edges

> Status: **SHIPPED (2026-11-26)**: **eighteen** of the twenty-seven fields that enforce an envelope while
> publishing no range now publish the side the tool can actually answer at — 27 left to 9. 23 adapters, no
> library file. Every envelope and declaration gate still reports zero. The catalog stays 2,390.

## What I got wrong one spec ago

[spec-v1822](spec-v1822.md) left 27 fields undeclared and explained why: `declared-cap-honest` requires a
declared edge to be one the library **answers at**, and an envelope can be enforced while its edge is
unanswerable. `penn-state-ree` refuses past the temperature envelope in the envelope's own words, and yet
*at* 13 °C the Penn State equation works out to −2227 kcal, outside the range the tool reports.

That was true, and the conclusion drawn from it — "those want the narrower range each tool can answer
across, which is a reading per tool" — was wrong, because **an envelope has two edges and a declaration is
per side.** A field whose floor is unanswerable can still publish its ceiling. `penn-state-ree` declares
`max: 47` and no min. Eighteen fields were waiting on a distinction, not on a reading.

| | |
|---|---|
| Both edges answer, every configuration | declare the envelope by name |
| Only the ceiling | `max` as a literal |
| Only the floor | `min` as a literal |
| Neither | nothing, and say why |

## The measurement was wrong twice before it was right

Getting the sides takes an honest probe, and mine was wrong on the first two passes — both caught by the
gates rather than by me:

1. **The floor test drove a negative.** "Does the library enforce this envelope's floor" was tested at
   `min − |min| − 1`, which for a BUN envelope of 1 is **−1** — refused by a sign guard, not by the
   envelope. So `isaric-4c-mortality` was declared `min: 1` while answering happily at 0.95.
   `probe-declared-cap-configs`, which drives 0.95×min, said so immediately.
2. **The same template-literal trap, in the same file as last time.** The regex that finds a field object
   stops at the first `}`, which in `pollock-flickinger` is inside `${P.AGE_COEFFICIENT}` in the label. I
   hit this in spec-v1822, wrote it down, and reused the naive regex anyway; the parse error caught it in
   seconds.

So the loop that produced the final set is: declare both answerable sides, let
`probe-declared-cap-configs` name every **side** that does not hold in every configuration, and drop those
sides rather than the whole declaration. That last word is the difference from spec-v1822, which dropped 24
declarations whole where some of them had one good side.

## The nine that are left, written down

Not "needs a reading" — each one, with why:

- `deurenberg-body-fat|db-bmi` and `gmi|gmi-mean`: **both** edges leave the range the tool reports.
- `dipss-mf|dp-age`: the floor is unanswerable and the ceiling moves with another input.
- `isaric-4c-mortality|is4c-urea`: a urea **unit select** rescales the field, so no static edge holds.
- `chatelut-carboplatin|chc-gfr`, `iv-iron-course|iic-weight`, `digoxin-label-dose|dg-weight`,
  `otc-child-label-dose|ocd-weight`, `pediatric-administered-activity|paa-weight`: a **dose table or weight
  band** makes the bound branch-dependent, which is what `probe-declared-cap-configs` refuses
  ([spec-v1780](spec-v1780.md)).

The last five want a declaration **per branch**, which the field schema has no way to express today. That is
a real limitation worth naming rather than a row to judge.
