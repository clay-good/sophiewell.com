# spec-v1743 — The envelopes the map never listed

> Status: **SHIPPED (2026-11-16)**: 2 tools fixed; the finder and the page test now hold four more envelopes.
> The catalog stays 2,387.

spec-v1734 added sourced envelopes for triglycerides, ALT and AST and applied them by hand, but never added them to
`scripts/lib/envelope-map.mjs`, so neither `probe-envelope-unbounded.mjs` nor the page test
`envelope-refused-on-page.spec.js` could hold them. The Glasgow Coma Scale envelope (3-15) was never mapped either.

| Change | Detail |
|---|---|
| mapped | `triglycerides` (mg/dL), `alt` and `ast` (U/L), `gcs` (the total only: an eye, verbal or motor component is not on 3-15) |
| excluded | an "upper limit of normal" field (not the measurement); HLH-2004's fibrinogen field, whose label names triglycerides |
| reach | 972 -> 1,033 fields; the page test drives 928 fields across 493 tools, all refused |

Two defects the wider map found:

| Tool | Before | Now |
|---|---|---|
| `isaric-4c-mortality` | an entered GCS of 20 was asked for again as if blank | "the GCS must be between 3 and 15" |
| `phoenix-sepsis` | on the page, a GCS of 150 was read as not entered and the score answered "septic shock" from the rest (the agent adapter already refused it) | refused by name in the library |

Left unmapped on purpose: `percentWeightLoss` and `daysNoIntake` (too few, too specific to match by label safely).

Tests: new cases in `isaric-4c-mortality.test.js` and `phoenix-sepsis.test.js`; the page test itself.
