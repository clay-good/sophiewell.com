# spec-v1473 — Glycemia Risk Index (GRI) from CGM

The catalog reads continuous glucose monitoring time in ranges but had no single composite score.
The GRI turns the four out-of-range bands into one 0 to 100 number and a zone A to E, and shows
whether the lows or the highs are driving it.

## Sources, read 2026-09-25

- Klonoff DC et al, *J Diabetes Sci Technol* 2023;17(5):1226-1242 (doi:10.1177/19322968221085273,
  PMC10563532). Derived from 225 CGM tracings ranked by 14 clinicians; GRI vs ranking r = 0.95.
- Klonoff DC et al, consensus report, *J Diabetes Sci Technol* 2026 (PMC12967274): zones A to E "in
  five equal quintiles".

## Formula

| Band | Range | Weight |
| --- | --- | --- |
| VLow | below 54 mg/dL | 3.0 |
| Low | 54 to 69 mg/dL | 2.4 |
| High | 181 to 250 mg/dL | 0.8 |
| VHigh | above 250 mg/dL | 1.6 |

Hypoglycemia component = VLow + 0.8 x Low; hyperglycemia component = VHigh + 0.5 x High;
GRI = 3.0 x hypo + 1.6 x hyper, capped at 100. Paper's example: 5, 10, 15 (VHigh), 20 (High) gives
components 13 and 25 and GRI 79.

| Zone | GRI |
| --- | --- |
| A | 0 to 20 |
| B | above 20 to 40 |
| C | above 40 to 60 |
| D | above 60 to 80 |
| E | above 80 to 100 |

## Behavior

The four band percentages are required (0 to 100 each; a blank is asked for, never read as 0) and
may not add up to more than 100. Time in range (70 to 180 mg/dL) is optional; if entered, the five
must total 100 within 1 point. The answer gives the GRI, zone, both components, which one
contributes more, and a note when the cap applied. Zone A reads as not abnormal; B to E as abnormal.

## Tests

`test/unit/glycemia-risk-index.test.js`: the paper's example, every zone edge, the cap, the sum
checks, and the blank and out-of-range refusals.
