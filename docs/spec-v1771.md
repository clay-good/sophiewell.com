# spec-v1771 — The same quantity in the other unit

> Status: **SHIPPED (2026-11-23)**: 2 tools. The catalog stays 2,389.

A tool with a unit toggle holds the conversion itself, written by hand in its library. Nothing had ever
checked that its two readings agree: enter 70 kg or 154.3235835 lb and the answer must not move.

`scripts/probe-unit-equivalent.mjs` converts each worked example's figures into every other unit the
toggle offers — weight, length, pressure, and the mg/dL to SI pair of a named analyte, each figure by its
own factor — and re-asks. Two answers in different units are never byte-identical: each echoes the figure
entered and names its unit. So the comparison is deliberately deaf to that.

- Words are compared with every digit and unit token stripped out, and only a claim the first answer makes
  and the second does NOT counts. Entering a weight in pounds *adds* a line converting it, and an answer
  that says everything it said before plus "2.646 lb = 1.2 kg" has not changed its mind.
- A figure stated in the unit entered must move, and move by exactly the conversion, so a changed number
  is accepted when its ratio is one the conversion explains — one factor, its reciprocal, or a product of
  two, since the calcium-phosphate product is a figure in mg²/dL² — compared at the precision the answer
  prints it to. A non-HDL cholesterol of 130 mg/dL shown as 3.4 mmol/L is 3.3617 rounded to one decimal,
  and that is the same answer; a truncated factor (2.2 for 2.2046) is off by more than half that last
  digit and stays visible.

Thirty-three unit pairs across twenty-four tools; two defects, both of them the last bit of a double.

| Tool | Before | Now |
|---|---|---|
| `digoxin-label-dose` | 154.3235835 lb is 70 kg, and 69.99999998 by double arithmetic, so the answer said "70 kg of lean weight" and then "read at 50 mL/min and **60 kg**" — one column too low, 187.5 mcg a day where the label's table gives 250 | the column is read at the weight the answer states. A weight genuinely below a column still reads the column below |
| `pn-micronutrient-volume` | a weight entered in grams or pounds reached kilograms 1e-16 off, and the gap to the label's daily requirement was taken between raw doubles, so copper and selenium — met exactly at 2.7 kg — came back 0.000000000075 mcg short and the band read "short of the label's daily amount for zinc, **copper, selenium**" | the gap is between the two figures as the tool prints them. A shortfall it cannot print is not a shortfall |

Three rows of the report are benign and named in the probe's own header: `otc-child-label-dose`,
`epinephrine-device-weight-band` and `glasgow-blatchford` each replace a line of their answer with one
that converts the figure entered, which reads as a lost claim and is the tool doing the right thing.

What the probe also settles: the analyte conversions of `calcium-phosphate-product` (two figures through
one toggle, 4.008 and 3.097), `non-hdl-remnant`, `homa-ir`, `gmi`, `salicylate-toxicity`, `kings-college`,
`kings-college-nonapap`, `isaric-4c-mortality` and `newborn-hypoglycemia-who` reproduce their answers in
both units, and so do the weight and length toggles of the other fifteen tools. One toggle is not driven
and says so: `iv-label-rate-check`'s worked example leaves the weight blank.

It was negative-tested against both defects before the fixes landed: it names each one and goes quiet
after.

Tests: a pound-entered lean weight reads the same digoxin table cell as the same weight in kilograms; the
same weight in grams and in pounds names the same micronutrient shortfall as in kilograms. Both fail
against the old libraries.
