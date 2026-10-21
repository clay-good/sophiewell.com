# spec-v1683 — The items the reviews left open

> Status: **SHIPPED (2026-10-21)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1682](spec-v1682.md).

| Tool | Was | Now |
|---|---|---|
| `lansky`, `schwab-england`, `montreal-ibd` | the selects opened on their first row (100, 100%, A1 L1 B1), so the page showed a full-function or mildest-class result before anything was chosen | "Not selected" first; the views show the library's request to choose |
| `lachman-acl` | grade I "0 to 5 mm", grade III "11 to 15 mm", and "5 mm or more is highly suggestive of a complete tear" beside grade II | grade I 3-5 mm (under 3 is normal), II 6-10 mm, III more than 10 mm, as open papers restate the scale (PMC13238852, PMC12813854); the contradictory sentence is gone |
| `mccormack` | apposition 2 read "2 mm or more over at least half the fracture surface" (grade 3's description) | 2 = spread, at least 2 mm displacement of less than half the cross-section; 3 = wide, more than half (PMC7220516) |

The StatPearls Lachman page the tool's header cites answers with a reCAPTCHA, which was not bypassed; the open papers
were used instead. `probe-refusal-unrendered` now excludes 175 select-only states (two became reachable and rendered).

## Proof

`test/unit/review-fixes-v1683.test.js`; the Lachman and refusal-probe tests updated, each change commented.
