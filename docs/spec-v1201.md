# spec-v1201 — "enter the value you just entered"

`scripts/probe-envelope-unbounded.mjs` prints two lists. The first is tiles that
**answer** from an impossible value, which [spec-v1198](spec-v1198.md) to
[spec-v1200](spec-v1200.md) worked. The second is smaller in the report and worse
to be on the end of:

```
ASKED FOR A VALUE THE READER ENTERED -- 116
```

The cause, in the probe's own words: `pos(v, max)` and `inRange(v, lo, hi)`
return `null` for a blank field, for a non-number **and** for a value outside the
range, and every caller reads `null` as absent. So a reader who typed a bilirubin
of 600 mg/dL was told:

> Enter serum bilirubin in mg/dL.

They retype it and get the same sentence. That is not a wrong answer; it is a
loop with no way out.

## The liver scores, which were twenty-four of those rows

| tile | before, on an out-of-range lab |
|---|---|
| `meld3` | "Enter serum bilirubin in mg/dL." — naming the exact field they filled |
| `palbi` | "Enter the required values." — `mcp/tools.js`'s own fallback, because the tile returned a bare `{ valid: false }` |
| `meld-na` | the same fallback |
| `clif-c-ad` | "Enter age, creatinine, INR, WBC and sodium — all positive." |
| `fips-score` | "Enter total bilirubin, creatinine, age and albumin — all greater than 0." |

All five now say which of the two things is wrong:

> Serum bilirubin **must be greater than 0 and at most 100 mg/dL. Check the value
> entered.**

and a genuinely blank field still gets `Enter …`. `palbi` and `meld-na` gained a
message at all, so they name the field instead of leaving `mcp/tools.js` to say
"the required values".

Six more in the same two modules followed once the helper was there —
`albi-plt`, `amap-score`, `fibroq`, `glasgow-blatchford`, `hepamet-fibrosis` and
`agile-3plus`. `glasgow-blatchford` is the one worth naming: its urea box accepts
either mmol/L or a US BUN in mg/dL, so the ceiling it reports is the one for the
unit actually chosen.

Where the missing field is not a number at all — a sex that has not been picked —
the original sentence still stands, because there is no range to name.

`meld3`'s albumin keeps the sentence [spec-v1178](spec-v1178.md) earned — *an
albumin reported in g/L is ten times the g/dL figure* — because that is the
mistake being made, not a general range note.

Every bound is the one the caller already passed to its own parse helper. No
clinical number is decided here.

## Written once, in the file that exists for this

Three tiles in, the fix had grown three copies of the same twelve lines. That is
the drift `lib/num.js` was created to end, and its header is the record of it:

> Before v53, `r1`/`r2`/`r3` and `num()` were declared identically in both
> `lib/clinical.js` and `lib/clinical-v5.js`. They agreed, but **nothing kept
> them agreeing**.

So `inputFault(spec)` lives there. Each row is `[label, raw, lo, hi, unit]` in the
order the caller checks them; `lo === null` means the caller's guard is "strictly
greater than zero", which is what `pos()` means and what most of these are. It
returns the `Enter …` sentence, the range sentence, or `null`.

`meld3` folded its per-field guards onto it and lost its local copy in the same
change, so the five tiles share one wording.

## A test that pinned the old sentence

```js
test('non-positive lab -> complete-the-fields (ln guarded)', () => {
  assert.match(r.message, /positive/);
```

The same test, word for word, in `clif-c-ad` and in `agile-3plus`. True when
written, and both were pinning the merged branch. Each now asserts the range is
named, that a blank still asks, and — for `clif-c-ad` — that the sodium keeps its
two-sided bound. Seventh and eighth tests in this run recording the behaviour
being fixed.

## Proof

The probe's second section reads **116 → 92**. Its first is unchanged at 129
fields — nothing here touches how anything is scored. Lint, 13,493 unit tests,
448 MCP tests and five browser sweeps pass.
