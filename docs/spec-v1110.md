# spec-v1110 — three scales that opened on an examination nobody performed

Five more off the [spec-v1108](spec-v1108.md) ledger. Same lookup, three
different consequences — which is the point of reading them one at a time
rather than pattern-matching, as [spec-v1109](spec-v1109.md) warned.

All three live in `lib/psych-v123.js` and share `lvl(v, max)`, which returns `0`
for a missing rating. On each of these scales **`0` is a finding**: no abnormal
movement, no catatonic sign, akathisia absent. And all three tiles then said so:

| Tile | Empty call | Its counted line |
|---|---|---|
| `aims-tardive` | *AIMS movement total 0/28 (global severity 0/4): below the … probable-tardive-dyskinesia threshold* | *"no abnormal movements (total 0)"* |
| `bfcrs` | *Bush-Francis: 0/14 screen items present — below the ≥ 2 screen threshold; severity total 0/69* | *"no catatonic signs elicited"* |
| `bars-akathisia` | *Barnes global rating 0/5: **absent*** | *"objective 0/3, subjective awareness 0/3, subjective distress 0/3"* |

## They do not all take the same fix

**`aims-tardive` and `bfcrs` are thresholds on a monotone count.** Probable TD is
*≥ 2 in two or more areas, or ≥ 3 in one*; catatonia is *≥ 2 of the first 14
screen items*. An unrated item can only bring either **closer**, so the alarming
reading rules in from a subset (rule 13) and the reassuring one waits. Both now
say how many of the 7 (or 23) were rated and that the rest can only add.

**`bars-akathisia` is different, and the difference matters.** Its verdict is not
a sum crossing a threshold — **it is one item**, the clinician's global rating,
and the three item ratings do not feed it. There is no floor to disclose, because
there is no arithmetic. So this one refuses:

> The global clinical assessment of akathisia (0 to 5) is needed: the Barnes
> verdict is that rating, not a total, so there is no reading without it.

That phrasing is deliberate. `Rate the …` was the first draft, and the shared
asking vocabulary in `test/lib/asking-language.js` does not match it — its
`rate` pattern requires a "from N" or "on the N" within thirty characters.
Rule 16 says to widen a list a real gate depends on only after measuring which
tiles a new phrase would stop flagging. **`is needed` is already in the list**
(measured in [spec-v1097](spec-v1097.md)), so the tile changed and the list did
not.

## `bfcrs` was not on the ledger, and had the defect

It was not listed because its reading matched the disclosure vocabulary — it
prints its screen count as `N/14`, and the pattern `of \d+ items` let it through.
It had the identical defect. It is here because it **shares its controls** with
the other two: `OPTS_0_4`, `OPTS_0_3` and `OPTS_0_3_BIN` are one set of lists
used by all three renderers, and the *"Not rated"* option this wave adds to them
would otherwise have handed `bfcrs`'s readers a way to reach a defect the browser
had been shielding them from.

**A shared control is a shared decision.** Fixing two of three tiles that render
from one option list is not a smaller change than fixing three — it is the same
change with one tile left in a worse state than before.

## The controls

Every select on all three opened on `0`, so each tile *opened* on its reassuring
reading before anyone had examined anyone (rule 8). They now open on *"Not
rated"*, and each library reads the blank as unrated rather than as zero. The
result rows follow: `at least 0/28`, `0 so far of 14`, `not rated`.

## Six existing tests asserted the fallback

The sixth wave in a row. *"no signs → 0 screen, 0 severity, below threshold"*
rated **nothing** and read twenty-three blanks as twenty-three signs looked for
and not found; *"all absent → global 0, not flagged"* did the same with four.
Each now passes a completed examination through an `examined()` / `elicited()`
helper, and each gained the band assertion it had been missing — which is how
*"one screen item present → below the ≥ 2 screen threshold"* went from a test
that would have passed either way to one that checks the words.

Six of the eleven ledger lines are gone. Six remain: `ses-cd`, `hfa-peff`,
`mdq`, `gvhd-grade`, `peritoneal-cancer-index`, `arvc-tfc`. (This line said
"Five" over a list of six until [spec-v1111](spec-v1111.md) counted them.)
