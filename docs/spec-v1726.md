# spec-v1726 — No fraction of a billed unit

> Status: **SHIPPED (2026-11-15)**: owner decision of 2026-11-15, applied to 8 tools. The catalog stays 2,387.

spec-v1722 refused a fraction in clinical items and counts, and left the billing and administration counts
open, because CMS guidance reads both ways: HCPCS units are priced in whole numbers, while decimal NDC
quantities are accepted and rounded. The owner's decision: **refuse the fraction**. A reader who typed 4.5
units or 104.5 minutes mistyped, or is unsure how to count, and the tool should say so rather than pick a
whole number for them.

| Tool | Field | Was | Now |
|---|---|---|---|
| `mue-check` | units billed, MUE value | rounded, in the view and the library | refused |
| `rvu-payment` | units | rounded; 0 became 1 | refused (0 is refused by the 1 to 1,000 range) |
| `therapy-units` | total timed minutes, per-service minutes | rounded | refused |
| `critical-care-time` | total and procedure minutes | rounded | refused |
| `prolonged-services` | total minutes | rounded | refused |
| `site-of-care-compare`, `bi-summary` | administrations a year, in the first 90 days | rounded | refused |
| `dose-calendar` | maintenance doses to show | rounded | refused (cycles were already refused) |

Four views in `views/group-b.js` rounded before calling the library, so a library check alone would never have
seen the fraction; they pass the value through now. A blank still takes its default (1 unit, 0 procedure
minutes). The message is the house one: "The units billed must be a whole number. Check the value entered."

Tests: `test/unit/billing-whole-units.test.js` (every row, through the page's path). Checked on the page for
six of the tools.
