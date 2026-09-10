# spec-v1198 — the neighbour in the same file

`scripts/probe-envelope-unbounded.mjs` has stood at 158 fields across 85
calculators: inputs an order of magnitude past a ceiling `lib/bounds.js` already
declares, computed from anyway. Its first section — **reassuring from an
impossible value** — was emptied by [spec-v1174](spec-v1174.md) to
[spec-v1181](spec-v1181.md) and reads 0. What is left is the rest: impossible
numbers printed with the same authority as real ones.

```
base-excess       pH 80        ->  "Base excess +1928.4 mEq/L: a base excess,
                                    consistent with a metabolic alkalosis"
resp-alkalosis    PaCO2 2000   ->  "Expected HCO3 416 mEq/L"
met-alkalosis     PaCO2 2000   ->  "the measured 2000 mmHg is above the expected 51.2"
```

## Where the rule already was

`lib/acidbase-v129.js` contains five functions. The first,
`stewartSidSig`, ends on [spec-v1181](spec-v1181.md)'s rule, written out in the
file:

```js
// Guard the set, not the field that was reported.
for (const [key, v] of [['sodium', na], ['potassium', k], /* … */]) {
  const fault = boundsAdvisory(key, v);
  if (fault) return { valid: false, message: fault };
}
```

The four gas functions beside it — `baseExcess`, `respAcidosisCompensation`,
`respAlkalosisCompensation`, `metAlkalosisCompensation` — never got those three
lines. The module already imported `BOUNDS` and `boundsAdvisory` for the one
function that used them.

That is [spec-v1101](spec-v1101.md)'s smell at **file** scope: the reasoning was
already written down, for the half somebody was fixing at the time. Fourth
occurrence in this run.

## After the missing-value check, never inside it

The probe keeps a section for the way this goes wrong — **ASKED FOR A VALUE THE
READER ENTERED**, 121 rows — and names the cause: `pos(v)` returns null for
blank, for non-numeric *and* for out-of-range alike, and every caller reads null
as absent. Fold an envelope into it and a reader who types an albumin of 40 is
told to enter the albumin, retypes it, and gets the same sentence.

So the check runs **after** the missing-value branch and returns its own message,
which names the range:

> Input above the plausible range for serum bicarbonate (2 to 60 mmol/L); verify
> the units. Values outside 2-60 are not survivable.

Measured: that section stands at 121 before and after this wave.

## The browser half

The same ceilings are now on the boxes, from the same table, in the acid-base
panel and the gap calculators that share its analytes — `anion-gap`,
`anion-gap-dd`, `osmolal-gap`, `winters`. `delta-gap`, one module over and the
same panel, has carried `max: 200` on its sodium since it was written; and
`base-excess`'s own hemoglobin box already had `max: 25`. Half-guarded again, in
both directions.

The **floor** stays at 0 on purpose, following both in-repo precedents: a `min`
of 2 on a bicarbonate box rejects the "1" a reader types on the way to 15.

`osmolal-gap`'s glucose is a unit-converting field whose ceiling depends on the
unit chosen, and is deliberately left for the wave that can do that properly.

## Two things the new sentence exposed

`boundsAdvisory` had never been called for a **unitless** envelope. The space
before the unit was unconditional, so arterial pH — `unit: ''` — read
`(6.5 to 8 )`. And every note in `BOUNDS` is written `human name; detail`,
which is what that sentence splits on to name the field — except the Glasgow
Coma Scale, which had no semicolon and so read

> the plausible range for **Glasgow Coma Scale is defined only on 3-15** (3 to 15 points)

Both fixed at source, and a test now asserts the `name; detail` shape holds for
every row of the table, so the next entry cannot drop it.

## Proof

The probe reads **158 → 149** fields and **85 → 81** calculators. Lint, 13,484
unit tests, 448 MCP tests and four browser sweeps pass, including
`declared-bounds-probe` and `label-states-a-range`, which owns the 280 labels
that name a range.
