# spec-v1712 — Review fixes to the IV thrombolysis checklist

> Status: **SHIPPED (2026-11-07)**: fixes to `tpa-eligibility` (spec-v1708); the catalog stays 2,386.

An independent review compared `lib/tpa-eligibility-v1708.js` with its rule record
([design.md](../openspec/changes/tpa-eligibility/design.md)). It confirmed all 37 Table 8 rows (each in the right tier,
every time window right), every threshold, the timing and imaging logic, and that nothing reads as an order. It also
found six defects, each reproduced and now fixed:

| # | Input | Was | Now |
|---|---|---|---|
| 1 | SBP 200, labels lapsed | the BP note still said "the labels contraindicate…" beside "Label statements withheld" (breaks D5) | the label clause goes with the other label statements |
| 2 | recent warfarin ticked, platelets entered, INR/aPTT/PT blank | "Labs entered are within the limits", and the warfarin caveat was gone (breaks D3) | names the blank labs and keeps the warfarin caveat |
| 3 | SBP entered, DBP blank | no BP note | "only half of the … check was made" |
| 4 | thrombectomy answer `maybe` or `{}` | reported as "marked as an option" | refused: yes, no or blank only |
| 5 | `glucose: []`, `platelets: -1e308`, `sbp: 1e308` | an array read as 0, and "1e+308" printed in the text | refused by name; plausibility fences on all seven numbers |
| 6 | platelets 50000 (counts, not thousands) | read as 50,000,000: no coagulopathy alarm | refused, with the unit stated (150 means 150,000/mm³) |

Also fixed: with non-disabling deficits outside 4.5 hours, the band no longer cites the within-4.5-hours "3: No
Benefit" recommendation. When the timing fails, the band now says so. In an extended window that is otherwise met,
the band says the guideline states that recommendation only within 4.5 hours, and that the tool does not stretch it
to cover this case.

Not changed: design.md lists `disabling` as yes / no / unsure, but the tool accepts only yes and no. "Unsure" is
refused, which fails closed.

The regression test in `test/unit/tpa-eligibility-v1708.test.js` covers every row above.
