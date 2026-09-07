# spec-v1108 — the same filter, a fourth and fifth time

[spec-v1106](spec-v1106.md) wrote down that a check's reach is part of its
result, after finding a gate narrowed to `kind === 'number'`. Two more things in
this repo are narrowed the same way, and one of them is the gate that exists to
stop an unanswered questionnaire being scored as zeros.

## `probe-omitted-item.mjs`, the sibling that was not widened

[spec-v1102](spec-v1102.md) widened `probe-omitted-field-decides.mjs` to enums
and explained exactly why: *a select always carries a value so the browser never
sends a blank one, but an API caller omits keys by default.* Its sibling probe
sat one directory over with the identical filter and was not touched.

Widened, with its reach printed:

```
254 field(s) across 88 calculator(s) changed the agent's answer when omitted,
without asking for the value or saying it was missing.

Reach: 3563 number and 2341 enum fields are dropped one at a time.
2378 booleans are excluded (an unticked box is a real "no"), and 757 others.
```

**56 fields across 31 calculators became 254 across 88.** [spec-v1107](spec-v1107.md)
found `euroscore2` by hand while this probe reported it clean, because all six of
its graded factors are enums.

## `rated-items-are-required.test.js`, which is the gate for exactly this

[spec-v1073](spec-v1073.md) is the wave that established the rule: *an
instrument built entirely of rated items must not answer a call carrying none of
them.* Its gate selects subjects with

```js
if (!fields.every((f) => f.kind === 'number' && !f.required)) continue;
```

That is how spec-v1073's own fix was expressed — declare the items `required`,
and a number field carrying a `values` picklist is what those instruments render.
But a graded select can equally be declared `kind: 'enum'`, and **263 tiles
are.** They were outside the gate entirely. It reported clean on 0 of them.

Twenty-one answer an empty call. Two of those are screening instruments, and
what they said was a result.

### `ces-d`: twelve points from four questions nobody asked

The CES-D reverse-scores its four positively-worded items. An unanswered one did
not score nothing — it scored `3 - 0 = 3`:

```
cesD({})  ->  "CES-D 12/60: below the 16-point screening threshold."
```

**And this is the case rule 10 was written for.** Every other partial-score fix
in this programme rests on the total being a *floor*. This one is not: with
reverse scoring, an unanswered item can move the total either way, so a subset
gives a **range**, not a bound. The tile now says so, and gives the threshold
reading only where the whole range sits on one side of 16:

| State | Reading |
|---|---|
| floor already ≥ 16 | *"at least 18/60 — 16 or more … Scored from 8 of the 20 items; the rest can only raise it"* (rule 13) |
| ceiling still < 16 | *"between 12 and 15 of 60 — below the threshold whatever the rest are"* |
| threshold inside the range | *"not yet scorable … the four positively-worded ones are reverse-scored, so a blank is not a zero in either direction"* |

Its twenty selects opened on `0 — rarely / none`, so the page showed 12/60 and
"below the threshold" before anyone read a question. They now open on *"Not
answered"* (rule 8).

### `mchat-rf`: the note was right and the headline was not

[spec-v1102](spec-v1102.md) gave this tile an `unansweredNote` saying how many
items were unanswered, and left the headline alone. Its selects already opened on
*"Not answered"*, so **this is what the page said on load**:

> **A total of 0 is low risk. No further action is called for on this screen.**
> `screen: "negative"`
>
> *20 of the 20 items are unanswered …*

A negative autism screen for a questionnaire nobody administered, above a
paragraph explaining that nobody had. That is rule 14 — *fix the headline, not
only the detail* — and the headline is what gets charted.

The M-CHAT-R total is a floor, so high risk (≥ 8) rules in and is untouched
(rule 13). What cannot come from a partial instrument is `screen: 'negative'` or
the words *"no further action"*, in **either** of the two branches that reached
them — the low-risk branch and the medium-risk-with-a-Follow-Up-under-2 branch.
The second is the half that would have been missed by fixing only the case the
probe showed.

## The gate, widened, and the eleven left

The new assertion is deliberately **weaker** than its neighbour: it accepts a
tile that answers in words which ask or disclose, because that is the shape both
fixes took — a range, or a floor — and a blanket `required` would be wrong for an
instrument that is honestly scorable in part. What it does not accept is a band,
a grade or a verdict presented as a result.

Eight of the twenty-one were already refusing or disclosing. Eleven remain, in
`test/mcp/enum-rated-items-ledger.js` as a **debt ledger**, each carrying the
reading it produced:

> `ssign-score` — *SSIGN 0 of 17 — low risk, ~96% survival*, from six unentered
> pathology features
> `sepsis-obstetrics-score` — *SOS 0 of 28 — low risk of critical care*, from
> eight unrecorded observations
> `essdai` — *ESSDAI 0 — low systemic activity*, across twelve unrated organ
> domains

They have **not** been read one at a time yet, and the ledger says so rather than
implying otherwise. The gate's job while it drains is to stop new ones.

Verified by reintroducing a defect: removing `ses-cd` from the ledger fails the
gate with its reading quoted.

## What is actually being learned here

Four checks in this repo have now been found narrowed to `kind === 'number'`:
`probe-omitted-field-decides` (spec-v1102), `field-values-match-dom` and its
perturbation (spec-v1106), `probe-omitted-item` and
`rated-items-are-required` (here). None of them was wrong when written. Each was
written alongside a fix expressed in number fields, and inherited that fix's
vocabulary as its own scope.

**When a wave fixes a class of tile, the check it ships describes the tiles it
just fixed.** The generalisation has to be a separate, deliberate step, and the
cheapest way to force it is the one this programme keeps arriving at: make every
check state how many subjects it kept.
