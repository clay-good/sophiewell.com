# spec-v1775 — The half-step rows that were left, closed

> Status: **SHIPPED (2026-11-23)**: 3 tools guarded, 44 rows judged. The catalog stays 2,390.

[spec-v1773](spec-v1773.md) fixed the ten remaining half-step rows that were ordinal totals and counts, and
left two groups standing with a reason in prose. A reason in prose is not a decision anyone can check, and a
report that prints 44 known rows every run is a report people learn to skip. Both groups are closed here.

## 1. Three fields were safe because two other layers held

`burch-wartofsky`'s five point fields, the Helsinki CT mass-lesion type and the Cormack-Lehane grade are
selects on the page and declare a value list to an agent, which `mcp/fields.js` has refused values outside
of since spec-v637. So a half step reached them only through a direct call to the library -- which is the
call the page makes, and [spec-v1744](spec-v1744.md)'s rule is that the library must refuse what the
surfaces refuse.

Two of the three needed more than a whole-number check, because their scales have **gaps**:

| Tool | The scale | Before |
|---|---|---|
| `burch-wartofsky` | temperature 0/5/10/15/20/25/30, CNS 0/10/20/30, GI 0/10/20, tachycardia 0/5/10/15/20/25, CHF 0/5/10/15 | a range check, so 7 points summed as readily as 5, and 7.5 with it |
| `helsinki-ct-score` | mass lesion 0/+2/-3, suprasellar cisterns 0/1/5 | the reader returned **0** for anything outside its range, so a mass lesion type of 99 scored as "none" without a word, and a 1 scored as a value the score does not have |
| `intubation-difficulty-scale` | Cormack-Lehane 1 to 4 | `Math.round` turned a 2.5 into a grade 3 silently |

`setFault` in `lib/num.js` is the new helper: a row is `[label, rawValue, allowedNumbers]`, and the sentence
it returns is deliberately the same sentence `mcp/fields.js` returns on the agent path. Each scale is now
exported from its library (`BURCH_POINTS`, `HELSINKI_MASS`, `HELSINKI_CISTERNS`) and the agent contract reads
it from there, so the page, the contract and the arithmetic cannot drift apart. A blank picker is still zero,
which is what "nothing selected" means on a points scale.

## 2. The other 44 rows are fractional by definition, and now say so one by one

`scripts/probe-half-step.mjs` carries a `JUDGED` ledger: every remaining row, with the reason its half step
is a real reading -- a visual-analogue or 0-10 rating line (29 rows), a CYP2D6 activity score in CPIC's half
steps, a measurement (an aEEG margin in microvolts, an aortic root Z score, a white cell count, a dose in
millisieverts, a bioavailability from 0 to 1, a saponification number), a precision in percentage points, a
center's own antral follicle count cutoff, a tablet count where half a tablet is a real ingestion, an
authorization's units, and the coded Revised Trauma Score.

The report now prints **only what is not in the ledger** (`--all` lists the judged rows and their reasons),
and `test/unit/finder-ledgers.test.js` fails on either side of it:

- a half-step row that is **not** judged -- so a new one is a decision someone takes, not a line in a report;
- a judged row the finder **no longer reaches** -- so a reason cannot outlive the field it describes.

Both directions were negative-tested by removing a ledger row and by adding a bogus one.

Three more finders got the same ledger and the same test in the same change, so every finder this project
runs by hand is now silent until something new appears:

| Finder | Judged rows | What they are |
|---|---|---|
| `probe-half-step.mjs` | 44 | fractional by definition (rating lines, measurements, CPIC half steps) |
| `probe-unit-equivalent.mjs` | 5 | tools that rewrite a line of their answer to convert the figure entered |
| `probe-negative-as-zero.mjs` | 5 | signed by definition (a POP-Q point, a Z score), an owner decision, and two false positives of the method -- a field where 0 is refused too answers a negative with the same range message |
| `probe-sign-flipped.mjs` | 2 | the same owner decision of 2026-11-17 |

`test/unit/finder-ledgers.test.js` drives all four from one table, with a single `--all` run each, and fails
on an unjudged row, a stale judgement, or a reason too short to be worth reading.

Tests: the three guards in each tool's own test file, including every value each scale does print; the ledger
test above.
