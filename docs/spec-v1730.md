# spec-v1730 — The existing finders, rerun, and a refund nobody said was missing

> Status: **SHIPPED (2026-11-15)**: a fix to `mfp-refund-check` and a reviewed backlog. The catalog stays 2,387.

Each of the repo's finders was rerun against its last recorded result.

| Finder | Now | Against its record |
|---|---|---|
| `probe-refusal-unrendered` | 0 actionable | unchanged |
| `probe-message-promises` | 0 named-but-optional fields | unchanged |
| `probe-impossible-changes-nothing` | 0 | unchanged |
| `probe-optional-read-as-zero` | 0 | unchanged |
| `probe-default-in-answer` | 19 suspects | spec-v1132 reviewed 23 (one fixed, 22 rejected with reasons); these 19 are in those families |
| `probe-half-guarded` | 20 suspects | **an open backlog**: spec-v1696 opened one of 21 and left the rest |

## The half-guarded backlog

Each of the 20 was driven with its field omitted. Nineteen need no change: HEAR refuses the very-low band and
lists what is ungraded; NISS reports a partial total as a floor; the case definitions and antivenom tiles stay
at the lower category or "not decided"; DALY says "No deaths were entered, so this is the disability side only";
HAT assumes follow-up is not assured (the safe direction) and says so; the rest are optional extras or boxes
where absence is a real "no". The review is recorded in the finder's header.

One was a defect.

| Tool | What happened | Now |
|---|---|---|
| `mfp-refund-check` | "Refund already received" left blank read as "no", and the answer stated "No refund received by November 16, 2026" as a fact nobody had given it | "no" still says that, labeled "Refund late". A blank says "The refund was due by September 29, 2026. If it has not arrived by November 16, 2026, follow up...", labeled "Refund past due date". Checked on the page. |

Tests: `test/unit/drug-pricing-v1510.test.js` (all three states; the old assertion pinned "Refund late" on a
blank).
