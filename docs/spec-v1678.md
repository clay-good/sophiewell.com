# spec-v1678 — Independent review of the v500 to v599 tools

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1677](spec-v1677.md).

A reviewer ran the 99 libs in `lib/*-v500.js` to `lib/*-v599.js` on edge inputs.

| Tool | Input | Was | Now |
|---|---|---|---|
| `hlh-2004` | hemoglobin 9.5 g/dL, "infant under 4 weeks" blank | read as not an infant: "Does not meet (4 of 8)" | the lineage is undecided, since 9 to under 10 is low only in an infant |
| `bologna-por` | age 35, another risk factor, 2 maximal-stimulation episodes, normal reserve | override "blocked", citing an age and reserve result that were not present | the override applies: Ferraretti 2011 blocks it only for advanced age or abnormal reserve |
| `mayo-adpkd` | yearly growth 1.49904% or 6.00392% | rounded to 1.5 and 6.00: 1B, 1D | 1A, 1E, printed at the digits that keep each side |
| `ppm-eoai` | EOAi 0.6468 aortic; 0.9045 mitral; BSA 250 m2 | "0.65, moderate"; "severe"; accepted | severe; moderate; refused outside 0.2 to 4 m2 |
| `nsofa` | FiO2 40 (a percent) | ratio 2: the worst respiratory score, silently | refused, with the fraction it probably meant |
| `ffs-1996` | creatinine 300 umol/L with renal "no" | FFS 0, nothing said | refused until the two agree |
| `rucam` | R 4.996 | "R is 5.00, which is MIXED" | 4.996 |
| `arc-hbr` | hemoglobin 12.95 g/dL in a man, 11.95 in a woman | no anemia tier | minor anemia (below 13 and below 12) |
| `capthus` | concordant imaging with both scans negative | +1 | refused |
| `vasi` | an empty form | "T-VASI 0 of 100" | asks for at least one region |
| `acef` | age 500 | scored | refused by the shared age envelope |

Not changed: SAVE diagnosis groups (the file quotes the calculator's "select one or more"), Sunnybrook synkinesis on an
expression with no movement (not shown to be impossible), and whitespace-as-0 in about 26 libs, which neither the browser
nor the MCP path can send.

## Proof

`test/unit/review-fixes-v500-v599.test.js`; the FFS and VASI tests updated, each change commented.
