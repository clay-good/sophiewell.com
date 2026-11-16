# spec-v1732 — The omitted-item rows from the newest tools

> Status: **SHIPPED (2026-11-15)**: a fix to `nursing-hppd`; review recorded. The catalog stays 2,387.

`scripts/probe-omitted-item.mjs` drops one field at a time from each worked example. Its last catalog-wide count
was 134 fields (spec-v1114); it now prints 168 across 91 tools. spec-v1432 read only the tools added in
v1412 to v1431, so the rows from tools added after v1431 were the ones nobody had read: 30 tools.

Twelve were already driven earlier this session (spec-v1730's half-guarded review covers DALY, OSHA lead,
levodopa, dropper calibration, HAT, the arbovirus case definitions, leprosy reaction, the Brazilian antivenom
tiles and the refund check). The other eighteen were read with the field omitted:

| Result | Tools |
|---|---|
| Discloses what is missing | `arpraziquantel-dose` ("Contraindications not all entered"), `occupational-dose-limit-check` ("None of the 1 entered"), `icdas-caries` (counts the surfaces graded), `pph-who-2025` ("Tranexamic acid, if not yet given") |
| An optional extra, its absence changes no verdict | `ectopy-burden`, `ischemia-time-clock`, `rasburicase-dose`, `ade-cost-avoidance`, `iv-phosphate-order-check`, `cleanroom-class-check`, `compound-anticipatory-limit`, `isotonicity-e-value`, `days-supply`, `cystic-echinococcosis-stage` (weight only turns mg/kg into mg) |
| A real zero (sites treated, a positive finding the field cannot overturn) | `topical-quantity-ftu`, `snake-antivenom-indication`, `staffing-grid` (census step defaults to 1, which the grid shows) |
| **A defect** | `nursing-hppd` |

## The defect

`nursing-hppd` adds RN, LPN/LVN and aide hours. A category left blank was silently out of the total: with the RN
hours blank, the example read "4 nursing hours per patient day... 2,700 hours under" a target of 8.5, and split
nursing hours as LPN 25%, aide 75%, which reads as a unit with no RNs. It now says "RN hours were not entered,
so they are not in this total." Test: `test/unit/unit-operations-v1657.test.js`.

The rows from tools before v1412 are spec-v1114's reviewed 134 plus whatever later fixes moved; this spec does
not re-read them.
