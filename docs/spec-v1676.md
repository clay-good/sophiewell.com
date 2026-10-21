# spec-v1676 — Independent review of the v703 to v794 tools, third part

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1675](spec-v1675.md).

| Tool | Input | Was | Now |
|---|---|---|---|
| `awol` | illness rating blank, one other point | read as "not ill", silently | scored 0 and named: "illness not rated", and a rating of moderately ill would reach 2 |
| `furst-ratio` | (70.04 + 70) / 140 = 1.0003 | rounded to 1.000, then "restrict to 500 mL/day" | above 1: restriction unlikely to help, printed 1.0003 |
| `prostate-health-index` | phi 35.96; total PSA 12 | "phi 36.0, about 21%"; bands applied as if PSA were 2 to 10 | 35.96; says the bands were derived at 2 to 10 ng/mL |
| `walch-glenoid` | retroversion 500 degrees; a B1 | accepted; B3 by 70% subluxation unmentioned | refused outside -45 to 60; B1 names the subluxation route it cannot see |
| `reimers-migration-percentage`, `pi-ll-mismatch`, `caton-deschamps`, `abc-scale`, `loe-silness-gingival-index`, `silness-loe-plaque-index`, `plaque-control-record` | 33.4%, PI-LL 9.6, CDI 1.2004 and the like | judged correctly, printed rounded across the cut ("33%, subluxated"; "10°, well aligned") | printed at the digits that keep each value on its judged side |

## Proof

`test/unit/review-fixes-v703-v794.test.js`.
