# spec-v1475 — mRECIST for hepatocellular carcinoma

RECIST 1.1 and iRECIST ship. mRECIST, the version that liver-cancer guidelines use for response to
locoregional therapy, did not. It measures only the viable part of each liver tumor, the part that
still enhances in the arterial phase, because treatments like chemoembolization kill tumor without
shrinking it.

## What it does

The reader enters three sums of viable (arterially enhancing) target-lesion diameters in mm: the
baseline, the current sum, and the smallest sum since treatment started (the nadir). Two checkboxes
record a new lesion with the typical HCC pattern and unequivocal non-target progression.

| Response | Rule |
|---|---|
| Progressive disease | A 20% or greater increase from the nadir, a new lesion with the typical HCC pattern (arterial enhancement, then washout), or unequivocal non-target progression |
| Complete response | No arterial enhancement left in any target lesion (a viable sum of 0 mm) |
| Partial response | A 30% or greater decrease from the baseline |
| Stable disease | None of the above |

Progression is checked first. Regrowth after a viable sum of 0 is progression; no percentage is
printed for it, because the percentage would be infinite.

**One disagreement is named rather than settled.** Some studies add RECIST 1.1's requirement that
progression is also an absolute increase of at least 5 mm; most do not. The tile applies the 20% rule
and says so when the 5 mm rule would change the answer.

Blank sums are asked for. A baseline of 0 and a nadir above the baseline are refused.

## Sources

- Lencioni R, Llovet JM. Semin Liver Dis 2010;30(1):52-60 (the original, not open).
- The criteria as stated in open studies that apply them, which agree: World J Radiol 2025
  (PMC12576714) and Cancers (Basel) 2026 (PMC13072226). The typical-pattern rule for new lesions is
  from Korean J Radiol 2026 (PMC13136576). The 5 mm variant is from J Immunother Cancer 2026
  (PMC13084789).

## Tests

`test/unit/mrecist.test.js`: the worked example; both thresholds as "at least"; complete response,
and its override by a new lesion or non-target progression; regrowth from 0; the 5 mm note; blanks
and impossible entries.
