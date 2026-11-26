# spec-v1802 — Every envelope finder at zero

> Status: **SHIPPED (2026-11-25)**: `probe-envelope-inside` becomes the fifteenth finder held to zero, and
> with it every envelope and declaration finder in the suite reports nothing. 2,678 of 5,189 number fields
> declare a bound, 4,918 edges. No tool's arithmetic changed; the catalog stays 2,390.

| Finder | Asks | Now |
|---|---|---|
| `probe-undeclared-cap` | a cap the library enforces that nothing declares | 0, 2 judged |
| `probe-adapter-only-bounds` | a range declared that the library does not enforce | 0, 1 judged |
| `probe-declared-cap-configs` | a declared range the library answers past in some configuration | 0, across 22,882 configurations |
| `probe-borrowed-envelope` | an envelope named for a quantity the field is not | 0 of 610 |
| `probe-envelope-unenforced` | a field that IS a quantity, answered outside its envelope | 0, 11 judged |
| `probe-envelope-inside` | a value inside an envelope refused by a narrower cap nothing declares | **0** |

## Five caps nobody could see, because the field is blank

`probe-envelope-inside` had been reporting 26 rows while `probe-undeclared-cap` reported 2 — the same
disagreement that found the ratio coincidence in [spec-v1798](spec-v1798.md), and worth chasing for the
same reason. Six of its fields were ones the cap finder **cannot reach**: it drives only fields that have a
value in the worked example, and these are blank there. `probe-envelope-inside` fills a blank field from
the envelope, so it goes further.

Five of the six were real and are declared — `scorten`'s glucose, `sbp-ascitic-fluid`'s weight,
`home-oxygen`'s arterial oxygen tension, `gcsf-timing-check`'s weight, `propkd`'s age. The sixth,
`minute-ventilation`'s ideal body weight, is an output range.

And declaring `gcsf-timing-check`'s weight found a defect underneath it. Its guard sits inside
`if (peg)` — the pegfilgrastim branch — so a weight entered with **filgrastim** picked reached nothing:
0.38 kg and 525 kg were both taken. `probe-declared-cap-configs` said so the moment the range was declared.
The guard is hoisted above the branch split, which is the fix [spec-v1780](spec-v1780.md) names for exactly
this shape, and the declaration is true on every path now.

## Three ways a cap is not a missing declaration

The other twenty rows were real observations and not work, which is the worst kind of report: it asks for
something no descriptor can hold, and buries the handful that can be. Each now has a measured verdict,
counted in the reach line rather than printed:

* **The cap moves with another input** (5). `iv-iron-course`'s weight moves with the regimen,
  `salazar-corcoran`'s creatinine with the age. `probe-undeclared-cap` has called these VARIES since
  [spec-v1787](spec-v1787.md); asking the same question here stops the two finders disagreeing.
* **The cap is on the OUTPUT** (11). `num({ computed: true })` says *"works out to X, which is outside the
  range this tool reports"* — `feua`'s fractional excretion, `deurenberg-body-fat`'s percentage. A literal
  there would be a derived number that drifts ([spec-v1795](spec-v1795.md)).
* **The same thing wearing the field's clothes.** `deurenberg-body-fat` says *"The BMI in kg/m² must be
  between 5 and 100"*, which reads like a cap on the BMI — but **100 itself is refused**, because the
  body-fat percentage it works out to leaves its range first. `body-roundness-index` is the mirror: its
  stated floor of 50 cm is refused while its stated ceiling of 250 answers. A cap whose own edge is not
  accepted is not a cap on this field, and `test/unit/declared-cap-honest.test.js` is the gate that already
  said so — both of those declarations were written here and **rejected by it within the minute**, which is
  how the rule was found.

That last one is the general lesson of this whole arc, and it is worth stating plainly: **when two checks
disagree about the same field, one of them is wrong, and finding out which is cheaper than judging the rows
by hand.** It found a heart rate classified as a hematocrit, a sentence list missing one of
`inputFault`'s two shapes, a finder skipping a whole field because one edge was declared, and here a cap
that belongs to an output.
