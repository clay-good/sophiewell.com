# spec-v1192 — a blank read as a finding, twice

`scripts/probe-half-guarded.mjs` last had a wave of its own at
[spec-v1101](spec-v1101.md), which read the **8** calculators it printed then. It
prints **23** now. Fifteen of those rows had never been opened, and this is that
triage.

Thirteen of the fifteen were correct, and most of them for a reason the probe
cannot see: the tile answers because its verdict is monotone and already holds
(`truelove-witts`, `nichd-fhr`, `niss`, `duke-treadmill`, `hear`, `elapss`,
`phases`, `mascc`), or the silent field is genuinely outside the total
(`spetzler-martin`'s supplementary age band, `kennedy-edentulous`'s
modifications, `palm-coein`'s tertiary leiomyoma type, `aims-tardive`'s global
severity, `aat-deficiency`'s serum level). That ratio is the same one
[spec-v1101](spec-v1101.md) closed on: a prioritiser earns its place by making
the *first* row worth opening.

Two were real, and they were the same defect.

## The shape

Both tiles read a graded picklist through a lookup whose miss-value is the
table's **zero row** — and in both tables the zero row is a recorded negative
finding, not an absence.

| | miss-value | what that row means | what the tile then published |
|---|---|---|---|
| `hiv-pep-occupational` | `none` | "No exposure of a recognized type" | **Not an exposure** |
| `vod-sos` | `none` | "No weight gain above 2% of baseline" | **No definition met** |

Both are rule-outs from a blank. In both cases the browser `<select>` opened on
that same zero row, so the page said it before anyone had touched the form.

## `hiv-pep-occupational`

```
oneOf(EXPOSURE_TYPES, o.exposureType, 'none')
```

The fallback is the first row of the table. An exposure nobody had described read
as an exposure that *had* been described and found not to qualify:

> **Not an exposure** — No exposure of a recognized type is recorded. The
> guidelines apply to a percutaneous injury, a mucous membrane or non-intact skin
> contact, or a bite with blood exposure.

This is the pathway where a wrong rule-out costs a course of prophylaxis not
started inside the hours that decide it. The tile now refuses until the exposure
is chosen, and an unrecognised value refuses too — it fell into the same row.

`sourceStatus` fell back to `unknown` the same way. That is not the most
favourable row, but it is still a **finding**: "unknown status, or the source
cannot be identified" is what gets recorded once someone has tried, and a blank
is what gets recorded when nobody has. It is asked for only where it decides
something — for intact skin, and for no exposure at all, the answer holds
whatever the source turns out to be, and the tile still answers (rule 13).

The refusal carries the three standing reminders — intact skin is not an
exposure, a source of unknown status is not a source that is positive, this names
no drug — because before the exposure has been described is exactly when they are
worth reading.

### The test that pinned it

```js
assert.equal(p({ exposureType: 'made-up' }).exposureType, 'none');
```

The harmful default, written down and asserted. It is now the regression test for
the opposite.

## `vod-sos`

```
String(o.weightGain == null ? 'none' : o.weightGain)
```

A blank weight gain and a weight gain entered as "no gain above 2% of baseline"
produced the identical reading, on a diagnosis whose whole point is to be caught
early.

The three published definitions are all **monotone** in the weight-gain level:
raising it can only add an item. So the same evaluation, run a second time at the
top level, answers "could the weight gain still change this?" without a second
copy of the three rule sets — the drift that costs most in this repo. A fourth
verdict, `undecided`, carries the case where nothing is met and nothing can be
ruled out either:

| | before | after |
|---|---|---|
| day 12, bilirubin ≥ 2, weight **blank** | No definition met | **Not yet decidable** — "the weight gain from baseline was not entered, and it is the item that decides Modified Seattle on day 12 … this is not a not-met" |
| day 12, bilirubin ≥ 2, weight **`none`** | No definition met | No definition met |
| day 3, nothing else | No definition met | No definition met |
| day 25, hepatomegaly + ascites | No definition met | No definition met |

The last two rows are the discipline: the gap is raised **only** where the weight
gain could still decide something. With nothing else recorded the highest weight
gain is one Seattle item of the two needed, and past every window it cannot
reopen a closed definition — so those stay a plain "not met". A definition
already met is answered rather than withheld, for the same reason.

A split that hides a third definition still turning on the blank says so too.

## Proof

`probe-half-guarded` reads **23 → 21** calculators. Both tiles refuse or disclose
on both surfaces, checked in the browser as well as through the agent API. Eight
new unit tests; lint, 13,461 unit tests, 448 MCP tests and the four browser
sweeps that touch picklists (`no-answer-from-nothing`, `field-values-match-dom`,
`undeclared-picklist-probe`, `one-blank-field`, plus `scoring-select-probe`,
`example-fills` and `all-tools`) all pass.

## Left open

`test/lib/asking-language.js` has a reach hole this wave walked into and did not
fix. `pep-sourcestatus` was printed by the probe as **guarded** — it was not.
The ASKING vocabulary carries `cannot be` for range refusals ("age cannot be
negative"), and it matched the source-status option's own descriptive prose:
"unknown status, or **the source cannot be** identified". Rule 2 at the top of
that file is about exactly this.

Measured across every tile and every number-or-enum field, four rows are exempt
on `cannot be` **alone**: this tile, now fixed, and three on
`reference-change-value`, whose standing caveat says "a change that cannot be
told apart from analytical and biological variation". None of the four is a
refusal. That is a one-tile question now, and a wave of its own.
