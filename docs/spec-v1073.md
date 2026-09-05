# spec-v1073 — the questionnaire that answered itself

Everything the incomplete-input programme has fixed so far lives in
[incomplete-input-program.md](incomplete-input-program.md), and almost all of it
was found in the browser. [spec-v1037](spec-v1037.md) crossed to the other
surface and asked one direction of one question: *does the browser answer
anything the agent surface refuses?* It found seventy-five calculators and they
were drained over the ten specs that followed.

Nobody had asked it the other way round.

## What an empty call returned

```
compute_calculator { id: "phq9",   inputs: {} }  ->  valid: true, score 0, "Minimal depression"
compute_calculator { id: "cage",   inputs: {} }  ->  valid: true, score 0, "Negative"
compute_calculator { id: "epds",   inputs: {} }  ->  valid: true, score 0, "Low likelihood"
compute_calculator { id: "mnihss", inputs: {} }  ->  valid: true, "mNIHSS 0 of 31: no stroke symptoms"
```

A depression screen, a perinatal depression screen whose tenth item asks about
self-harm, an alcohol-use screen, and a stroke exam — each returning its most
reassuring band to a caller that had supplied nothing at all.

## Why the browser never did this

`lib/screener.js` renders no result until `isComplete(items, answers)` is true.
Leave one PHQ-9 radio untouched and the reader sees an empty results region.
That has been the behaviour since spec-v4.

The adapter beside it read each item as:

```js
const answers = Array.from({ length: 9 }, (_, i) => Number(a[`i${i}`]) || 0);
```

`Number(undefined)` is `NaN`, `NaN || 0` is `0`, and nine of those sum to a
score of zero that lands in the first band. The two surfaces had opposite
answers to "what does an unanswered question mean", and the agent's was the
reassuring one.

`mnihss` is the sharpest version of it, because the fix was already in the
building: its sibling `nihss` refuses the same call with **"Not scored: 13 of 13
items unscored — an unscored exam is not a normal exam."**

## The population

Mechanical, and the same shape as spec-v1037's oracle — the declaration itself:

> a calculator **all** of whose inputs are `kind: 'number'`, **none** of them
> declared `required`, that returns `valid: true` for `inputs: {}`.

Twenty tiles. Seventeen are rating instruments, and all seventeen are fixed
here by declaring their items required:

| | |
|---|---|
| screeners (radios) | `phq9`, `gad7`, `epds`, `auditc`, `cage` |
| screeners (selects) | `audit-full`, `wexner` |
| graded exams | `mnihss`, `wilson-airway`, `rdai-tal`, `clinical-dehydration-scale`, `thompson-hie` |
| graded body maps | `mrss-modified-rodnan-skin-score`, `ferriman-gallwey`, `poem`, `menopause-rating-scale`, `kupperman-index` |

Declaring an item required refuses nothing a reader can reach: every one of
these renders in the browser as a radio, a select or a slider, and a control
like that always carries a value. The disagreement was only ever about the
caller who can leave a key out.

The other three keep answering, and each has a reason in the gate's ledger:
`pbac-hmb` counts soiled pads and clots, `isgps-dge` counts days on a form that
tells the reader on screen to leave an entry at 0 when it does not apply, and
`dka-resolution` already reports `enteredCount: 0`. Those are counts and
measurements, where nought is a thing a clinician means (rule 3).

## Four worked examples that were themselves incomplete

`wilson-airway`, `mrss`, `mnihss` and `audit-full` documented only their
abnormal items — one graded factor out of five, four palpated sites out of
seventeen, three AUDIT questions out of ten — because the omitted ones scored
zero anyway. That is the same assumption the defect is made of, written into the
documentation, and it would have made the fix look like a regression.

Each example now names every item, the unaffected ones graded 0. **No total
moved**: 2/10, 8/51, 12/31 and 10/40 before and after.

## What holds it

`test/mcp/rated-items-are-required.test.js`, four assertions:

1. no all-rated instrument answers an empty call (the sweep, with the
   three-line ledger);
2. each of the seventeen still answers its own worked example;
3. dropping any single item from that example returns `MISSING_INPUT` **naming
   that item** — 137 field-by-field checks, so a half-fixed instrument cannot
   hide behind a sibling item's guard, which is the trap
   [spec-v1063](spec-v1063.md) paid for on the browser side;
4. the five generic screeners refuse an absent item when their `compute` is
   called directly, which is how `blank-is-absent.test.js` drives the catalog
   and where `required` does not run.

Verified by reintroducing the defect: reverting `wexner`'s five items to
optional fails assertions 1 and 3.

## What this wave did not reach

The gate's question is narrow on purpose: it only looks at instruments built
**entirely** of rated items, where "nothing was answered" is unambiguous. The
wider question — fill a calculator from its worked example, drop **one** number,
and see whether the agent's answer moves without saying so — is the agent-side
twin of `one-blank-field-probe.spec.js`, and it cannot be a gate because each row
needs judgment. `scripts/probe-omitted-item.mjs` runs it:

```bash
node scripts/probe-omitted-item.mjs
```

With this wave landed it still finds **93 fields across 43 calculators**. What
is left is the mixed kind — instruments where checklist
criteria sit beside measurements — so a blanket `required` would refuse calls
that are legitimately partial. Some of it is plainly wrong:

| | |
|---|---|
| `snakebite-severity` | prints "pulmonary 0" for a system nobody examined |
| `cdai-crohns` | 265 "moderate" becomes 215 "mild" when one of five weekly tallies is omitted |
| `tls-cairo-bishop` | grade **II → 0**, and "no end-organ criterion" said of a creatinine that was never sent |
| `pim3` | prints the absolute-base-excess term of its own regression as `(0)` |

Some of it is not: `pbac-hmb` counts clots, `modified-marshall` already says
"assessed: renal 2", `mayo-uc` names its endoscopy subscore optional on the form.
Read each against the tile, the way [spec-v1067](spec-v1067.md)'s ledger was
seeded — not from memory.

## The rule this adds

> **9. A surface that cannot show a control still has to ask the question it
> represents** (spec-v1073). A graded select always carries a value, so a
> renderer never has to think about an unanswered item; an API caller omits keys
> by default. Where the browser makes an answer unavoidable, the adapter has to
> make it required — or the same instrument reads a silence as a normal finding
> on one surface and refuses to guess on the other.
