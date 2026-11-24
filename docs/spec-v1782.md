# spec-v1782 — Twenty dated claims, and all twenty honest

> Status: **SHIPPED (2026-11-23)**: no tool changed, four finders brought under the ledger gate, one finder
> narrowed and proved still sharp. The catalog stays 2,390.

`scripts/probe-dated-claims.mjs` reads every line of `lib/`, `views/` and `mcp/adapters/` for a written date
beside future-tense words and prints the ones whose date has passed. It exists for a real defect: the New
York nurse-training tool said an updated course "is due by November 17, 2026" after that day had gone, and
the 340B tool still called the CY2027 fee schedule rule "proposed" twelve days after the final rule
published.

It printed twenty rows. **Every one of them was honest**, and had been for weeks -- which makes it a report
people learn to skip, the thing [spec-v1775](spec-v1775.md) set out to stop. Each was read against its
source; none needed a word changed. What they needed was for the finder to know why.

## Two of the three reasons are structural

| Rule | Rows | Why it holds |
|---|---|---|
| A date still ahead **in the same clause** is what the tense is about | 7 | "FDA's letter of August 6, 2026 granted its exemptions until November 27, 2027" carries a passed date and a future tense, and the tense belongs to 2027. Scoped to the context window the future-tense test already uses, not the whole line, so a stale claim cannot hide behind a live one further along a long citation string. |
| A worked example is dated by **its own inputs** | 8 | `lib/meta.js`'s `expected:` strings read "The MOON is due by Wednesday, October 7, 2026" because that example's observation began 36 hours earlier. The example and its answer move together; neither goes stale. |

The third reason needs reading, so those five rows are in the finder's `JUDGED` ledger with their reasons: a
date that belongs to a **source** rather than a deadline (`ny-maid-timeline`'s NYSDOH FAQ, a BCBSSC bulletin
of March 25, 2026 stating a standing seven-day rule), or to a **rule's start** that has arrived and holds
(GS1's two-zero day rule from January 1, 2025; the 7-calendar-day § 422.568 deadline from January 1, 2026),
or to a tool that describes **both regimes on purpose** (`ipledge` switches on the entered date at
`MODIFIED_FROM = 2026-11-15`, so its pre-modification sentence is a branch, not a leftover).

## A narrowed finder has to be shown still sharp

A precision rule is a claim that certain rows are honest, and the cheapest way to get a quiet report is to
write one that is too wide. So the gate drives this finder at `--as-of 2028-01-01`, past every future claim
in the catalog, and requires it to report what has gone stale by then -- including the DSCSA exemptions,
which run until November 27, 2027. It reports 26. The rules narrow it; they do not blind it.

## Four more finders under the ledger gate

`test/unit/finder-ledgers.test.js` held four finders to their ledgers in both directions: an unjudged row
fails, and a judged row the finder no longer reaches fails too. Three of this session's finders and this one
now join them, so seven are covered:

| Finder | Judged | What an unjudged row means |
|---|---|---|
| `probe-dated-claims` | 5 | a date that has passed, written in the future tense |
| `probe-declared-cap-configs` | 1 | a declared bound the library answers past in some configuration ([spec-v1780](spec-v1780.md)) |
| `probe-absent-example-field` | 7 | a field absent from its worked example that discards an impossible value in silence ([spec-v1778](spec-v1778.md)) |
| `probe-half-step`, `probe-negative-as-zero`, `probe-sign-flipped`, `probe-unit-equivalent` | 43 / 5 / 2 / 5 | as spec-v1775 set out |

Both directions were negative-tested again here, by breaking one ledger key: the gate reported the row as a
finding and the key as stale, and passed once restored.

`probe-absent-example-field` needed one change to be machine-readable at all. Its NEVER-READ section is
another finder's class, not a finding of its own, and the gate counted those rows as findings; each of them
now says `NEVER-READ` on the line rather than relying on the heading above it.
