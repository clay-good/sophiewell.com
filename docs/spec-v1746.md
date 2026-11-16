# spec-v1746 — Asked again for a value already entered

> Status: **SHIPPED (2026-11-16)**: 66 tools. The catalog stays 2,387.

`scripts/probe-entered-asked-for.mjs` (spec-v1723) lists fields where an impossible entry gets the same
"Enter X" sentence a blank field gets. spec-v1723 fixed the rows the page did not explain and left the rest
because the page showed its range warning beside the input. spec-v1744 settled that a warning beside the input is
not the tool's answer, so this takes the backlog: 388 rows said exactly what a blank says.

A row whose sentence already states the rule ("a whole number 0-28", "from 1 to 365", "all > 0") tells a reader
who typed 999,999 what is wrong, and was left. 146 rows across 66 tools gave a bare "Enter X": base excess, the
Stewart and urine osmolal gaps, AFI, Barnhart hCG, CONUT, GNRI, PNI, Kt/V and nPCR, BMI and growth percentiles,
gait speed, balance, prostate volume and PSA density, PHI, Castelli, the MGUS and Naples scores, Kobayashi and Sano,
TRISS, RABT, AKIN and RIFLE, UFR, metabolic syndrome, PLASMIC, NICHD, stone score, EuroSCORE II, lithium EXTRIP,
digoxin Fab, TCA bicarbonate, IOM weight gain, and others.

The fix is spec-v1723's: `gradeFault` before the missing-value branch, at the bounds each function's own reader
already applied (`pos` means greater than 0; `nonNeg` 0 or more; a stated `lo..hi` where one exists). A blank still
gets its original sentence; a typed 0 where the reader needs more than 0 is now told "must be greater than 0".
Several fixes check field by field so the refusal keeps the `field` code the library returns.

After: 228 rows still answer an impossible value by asking for input, and every one of them names the range.

Tests: one spec-v1746 case in each tool's own unit test file.
