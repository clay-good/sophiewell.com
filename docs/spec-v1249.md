# spec-v1249 — the refusal branch did not use `valid`

`scripts/probe-refusal-unrendered.mjs` asks whether a pure function can refuse
while its browser renderer has no branch that shows the refusal. It recognized
the house's ordinary `if (!r.valid)` branch and reported 186 suspects.

The first 5 numeric/free-input rows were already safe:

| Tile | Alternate refusal branch |
| --- | --- |
| `bard-score` | `r.total == null` → render `r.band` |
| `snappe-ii` | `r.score == null` → render `r.band` |
| `tash-score` | `r.total == null` → render `r.band` |
| `rabt-score` | `r.total == null` → render `r.band` |
| `alt-70` | `r.total == null` → render `r.band` |

These monotone partial scores use the missing output itself as a sentinel. Their
library refusal omits the score/total and carries its reader-facing explanation
in `band`; the renderer prints that band and returns. BARD's impossible-BMI
refusal, for example, was visible even though the probe said it was not.

The probe now recognizes only that exact shape: a null output check whose branch
passes the same result object's `message` or `band` to a renderer helper. A null
check that prints generic prose does not qualify. An inline positive/negative
self-test makes that distinction executable, and a unit test pins the 5 known
rows while retaining an enum-only suspect.

The queue is 186 → 181 tiles. No calculator behavior or catalog count changed;
the remaining rows are still suspects to triage, not asserted defects.
