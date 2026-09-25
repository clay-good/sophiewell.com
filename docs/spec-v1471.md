# spec-v1471 — Glucose Management Indicator (GMI)

A companion to `eag-a1c`, which goes from an A1C to a mean glucose. GMI goes the other way, from the
mean glucose on a CGM report to an A1C-like value, and had no tool.

## Sources, read 2026-09-25

- Bergenstal RM et al, *Diabetes Care* 2018;41:2275-2280 (doi:10.2337/dc18-1581, PMC6196826):
  "GMI (%) = 3.31 + 0.02392 x [mean glucose in mg/dL] or GMI (mmol/mol) = 12.71 + 4.70587 x
  [mean glucose in mmol/L]." Derived from four trials with Dexcom G4 sensors (N = 528). Table 1:
  100 mg/dL is 5.7%, 150 is 6.9%, 250 is 9.3%. Renamed from "estimated A1C" because the two differ.
- Battelino T et al, *Diabetes Care* 2019;42:1593-1603 (PMC6973648): GMI is a standard CGM metric;
  14 days of wear with at least 70% of data recommended.
- *Diabetologia* 2026 (PMC13310218): an updated GMI proposed because the linear formula aligns less
  well at low and high HbA1c. Named in the notes, not implemented.

## Behavior

| Input | Rule |
|---|---|
| Mean glucose | Required. 40 to 600 mg/dL or 2.2 to 33.3 mmol/L. |
| Unit | Required; the page opens on mg/dL. A blank unit is asked for, since 8 and 150 both read as glucose. |
| Days of wear, % active | Optional. 1 to 90 days, 1 to 100%. Below 14 days or 70% is noted, never refused; blank is said to be blank. |

The answer gives GMI in % (one decimal, from mg/dL) and mmol/mol (whole number, from mmol/L), with
the entered value converted at 18 mg/dL per mmol/L. No A1C target or band is printed: GMI is a
measure, and the sources state none.

## Tests

`test/unit/gmi.test.js`: the seven Table 1 rows, the mmol/L path, unit agreement, the
data-sufficiency notes, and refusals.
