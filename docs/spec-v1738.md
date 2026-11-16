# spec-v1738 — Two dates out of their fixed order

> Status: **SHIPPED (2026-11-16)**: 3 tools. The catalog stays 2,387.

spec-v1737's question for dates: a finder swapped every pair of dates in each tool's worked example (128 pairs
across the catalog) and kept the tools that still answered. Most of the 52 that answered were right to: a
swapped pair is usually a different, real situation ("not yet open", "1 h 20 min early", "not allowed"). Three
were impossible:

| Tool | Before | Now |
|---|---|---|
| `preg-dating` | an ultrasound dated before the LMP was dated as usual and called "161 days discordant, consider redating" | refused, on the page and for agents (the page computes separately in `views/group-e.js`) |
| `nys-newborn-screen-planner` | a first specimen 28 hours before birth was listed as "Drawn" | any specimen, discharge, transfusion or TPN before birth refused; a last transfusion before the first refused |
| `out-of-fridge-discard-date` | "as of" before the product left the refrigerator: "23 days left" on a 14-day limit | refused (also before the first use) |

Rejected: `emergency-ind-clock` (use before authorization is a compliance problem, not an impossibility; the
deadlines still follow from the dates), `radioactive-decay` (activity before calibration is a real
calculation), `medicare-enrollment-window` and the timeline tools (the swapped answer is honest).

Tests: new cases in `preg-dating.test.js`, `prenatal-newborn-v1394.test.js`,
`out-of-fridge-discard-date-v1639.test.js`.
