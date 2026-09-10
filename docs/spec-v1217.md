# spec-v1217 — the input that changed nothing

[spec-v1214](spec-v1214.md) found a reader that returned **0** for a value off the
scale, so 150% terminal hair loss scored as "S0 (no loss)". That shape appears in
more than thirty `lib` modules, and it was found by accident — the helper-drift
probe was looking for something else.

So this wave asked for it directly, with an oracle that needs no judgment: take a
tile's own worked example, make one numeric field **impossible**, and see whether
the answer moves at all. If it is byte-identical, the value was thrown away in
silence — the tile neither used it nor refused it.

`scripts/probe-impossible-changes-nothing.mjs` runs the whole catalog in under a
second: **1,682 tiles with a computable worked example, 2,644 free numeric fields
perturbed.**

## Three things it got wrong first

| it said | it was |
| --- | --- |
| 25 rows | it flagged a field when **either** direction left the answer alone, and most were a threshold criterion already past its cutoff — `truelove-witts` scores ≥ 6 bloody stools as severe, so 8 pushed to 999999 is still severe and the score is right not to move. Both directions are required now |
| 13 rows | an example can neutralise a field by itself: `apap-24h-max` totals dose × doses-per-day per source, and its example enters source 3 as **0 doses/day**, so no value of the source-3 dose changes anything. Every other numeric field the example set to 0 is bumped to 1 and the perturbation re-run |
| it missed the defect it was built for | `salt-score` **substituted** a constant rather than discarding the input, and a substitution moves the answer unless the example's own value already equals the constant. That is a real limit, stated below rather than papered over |

## What was live

**`intubation-difficulty-scale`.** `lvl(v, 10)` returns `0` outside its range, so:

```
1 operator beyond the first   -> IDS 3
3 operators                   -> IDS 5
99 operators                  -> IDS 2      <- same as zero operators
```

Three of the seven IDS components — N1 attempts, N2 operators, N3 alternative
techniques — are free number fields on both surfaces, and each substituted the
most favourable value in its range. N4 already refused an off-scale grade through
`fin`; these three did not.

**`mmt8-myositis`**, in the same module and through the same helper: a muscle
graded 99 scored **0**, the weakest the scale has. The direction differs from the
IDS case and the defect does not — a grade nobody could have given, counted as a
grade, silently.

**`rosendaal-ttr`.** `pos(o.low, 10)` returns null off-scale and `?? 2.0` then
substituted the **default**:

```
target INR low 1.5      -> TTR 100
target INR low 2.5      -> TTR 55
target INR low 999999   -> TTR 80    <- silently the 2.0 default
```

Time in therapeutic range is computed *against* the target range, so this is not a
cosmetic default: the reading answered a question about a range the reader did not
enter. `gradeFault` skips a genuinely blank field, so the documented 2.0–3.0
default still applies when the field is left alone — which is the distinction the
whole guard turns on.

All four refusals return **both** `message` and `band`, because `render()` in both
view modules branches on `!r.valid` and prints `r.message`
([spec-v1212](spec-v1212.md)).

## The six rows left, and why each stays

| row | why it is not a defect |
| --- | --- |
| `cpis-vap` leukocyte count | a **two-sided** criterion: CPIS scores < 4,000 and > 11,000 alike, so both extremes land in the same band as the example. Correct |
| `simon-broome-fh` LDL-C | inert on this branch — the example meets a DNA-mutation criterion that is definite on its own |
| `smart-cop` age | inert on this branch — age selects which threshold applies, and no criterion trips either way on the example's other values |
| `rox` hours after HFNC start | the label says it: "needed only where the timepoint decides" |
| `timely-filing` custom limit, `pa-turnaround` custom window | **correct computation, questionable label.** Medicare's 365 days is statutory (42 CFR 424.44) so a custom limit rightly cannot override it — but the field says "overrides the payer default" and the reading says nothing when the value is ignored. A disclosure question, ledgered rather than fixed here, because it is about what the tile *says*, not what it computes |

## What the probe cannot see

It finds a **discarded** input, not a **substituted** one. A substitution changes
the answer — to a wrong, benign one — unless the example's value already equals
the substituted constant, which is exactly why `ids-operators` and `ids-tech`
appeared (their examples are 0) and `ids-attempts` did not, despite carrying the
identical defect. The N1 fix here came from reading the function the other two
pointed at, not from a row.

A finder for the substitution class is a different probe and is not written yet.

## Proof

The probe's rows are its own negative test: fixing the four dropped it from 13 to
6, and each fix removes exactly its own row. The three new tests fail on the old
code (3 failures) and pass on the new. Every existing worked example is unchanged.

Lint (19 gates), 13,573 unit tests and 449 MCP tests pass.
