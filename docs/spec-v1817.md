# spec-v1817 — Forty-six figures that round where they print

> Status: **SHIPPED (2026-11-26)**: `probe-fraction-rounded`'s 46 fields are read and judged, and the finder
> is gated at zero — the 32nd. Every row is a figure rounding to the precision it is printed at; none of
> them decides anything the rounding changed. No library file changed. The catalog stays 2,390.

## What was left described rather than written down

[spec-v1722](spec-v1722.md) built the probe for the silent-zero helper's second line, `return
Math.round(n)`, which scored a count typed as 2.5 as 3 with nothing on screen saying so. It fixed the real
group: **81 ordinal items and clinical counts across 23 scores** now refuse a fraction through
`gradeFault`'s fifth element or `wholeFault`.

What it left, it described in a comment — *"sliders, continuous measurements whose answer is rounded with a
slope of 1, and billing counts left for an owner decision"* — and the report has drifted from 70 rows to 46
since. **24 rows have come and gone that nobody read**, which is what a described residue costs.

## The three kinds, measured rather than assumed

| Kind | Rows | Why it is right |
|---|---|---|
| Only a **printed figure** moves | 33 | the verdict at x+0.49 and x+0.51 is the same word |
| The printed figure **decides a band whose published edges are at that precision** | 11 | the band has no gap between adjacent displayed values |
| A **whole-year age summed into an integer score** | 2 | the score is published as an integer |

The first group is the one that needed measuring rather than asserting, so the two readings were compared on
`bandLabel`, `bandKey`, `stage`, `severity`, `grade`, `tier`, `risk`, `category`, `verdict` and `class`
before the reason was written. A figure printed to a fixed precision, with a slope of about 1 in its input,
lands on its display boundary half a unit in: QTc in milliseconds, a urine anion gap in mEq/L, pharmacy
hours, a cost of goods sold. Nothing is decided by the rounding.

`abi` is the group of 11 worth reading. It reports the index to **two decimals** and bands it on the
published two-decimal ranges — 0.41-0.90 is mild-to-moderate, 0.91-0.99 is borderline. Those ranges have no
gap between adjacent displayed values, so an index of 0.9049 printed as 0.90 and banded mild-to-moderate is
the published rule applied, not a rounding that changed an answer. The same holds for `fek`'s percentage,
`sipa`'s shock index, `shunt-fraction`'s Qs/Qt and `barnhart-hcg`'s rise.

And the Baux score is **age + percent burn, published as an integer**: an age entered with a fraction has to
round for the score to exist at all.

## Why gate a report with no defects in it

The probe has found one real class and fixed it. The gate is not for that class; it is for the next row —
the field someone adds whose fraction the library rounds away. At 46 described rows nobody would have seen
it; at zero, it fails a test. Both directions were negative-tested, by removing `abi|abi-ra` and by adding a
key that reaches nothing.
