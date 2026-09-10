# spec-v1218 — the other half: an impossible value read as no value

[spec-v1217](spec-v1217.md) shipped a probe and stated its limit in the same
breath: it sees a **discarded** input, never a **substituted** one. A substitution
moves the answer, so "did the answer move" cannot find it. That limit cost that
wave a field — `ids-attempts` carried the identical defect to the two the probe
flagged and did not appear, because its example's value was not already the
substituted constant.

This is the finder for the other half, and it needs no constant to be guessed.

## The oracle

Substitution shapes fall back to whatever a **missing** field gets:

```js
if (!Number.isFinite(n) || n < 0 || n > hi) return 0;   // 0 for absent, 0 for impossible
const low = pos(o.low, 10) ?? 2.0;                       // 2.0 for absent, 2.0 for impossible
```

So the question is: **does an impossible value produce exactly the answer you get
by omitting the field?** If it does, an entry nobody could have made was read as
no entry at all.

`scripts/probe-impossible-reads-as-absent.mjs` runs the catalog in about a second.
It compares three computations per field — as the example has it, with the field
omitted, and with the field impossible — and only asks the question where the tile
*accepts* the omission, since a tile that refuses a missing field has nothing to
compare against. That narrows 2,644 numeric fields to **343**.

## Reading as absent is not automatically a defect

A tile may quite properly decline to use an impossible value; what it owes is
saying so. So the rows are split by whether the reading **says** it dropped the
value, and the split is most of the work:

```
38 fields where an impossible value reads as "not entered" AND the reading does not say so
   (29 more read as absent but disclose it; reach: 1682 tiles, 343 fields)
```

`abi` is the disclosing kind: enter an impossible right ankle pressure and the
reading becomes *"Left leg ABI 1.20 (the only leg calculated) … The right ankle
pressure was not entered"*. The wording is inaccurate — the reader did enter
something — but the leg's exclusion is on screen, which is the thing that matters.

## Three corrections, all of them changing the count

| it said | it was |
| --- | --- |
| 72 rows | an example that leaves the field **blank** gives no signal: "omitted" and "as the example has it" are then the same input, so every impossible value matches trivially. All four `berlin-ards` rows were this |
| 54 silent | it tested for disclosure with `ASKING` (`test/lib/asking-language.js`), which is the vocabulary of a tile **refusing** — "enter the sodium", "still needed". Disclosing is a different act: `abi` says "was not entered" and asks for nothing, and `ASKING` matches `'enter '` **with a trailing space**, so it misses "entered" |
| 54 silent, still | the movement rule ([spec-v1196](spec-v1196.md)) was applied word-by-word, and subtracting words destroys the phrase being looked for — both "not" and "entered" appear in `abi`'s standing note, so the word-set difference deleted the very sentence proving disclosure. It compares **sentences** now |

The disclosure vocabulary is local to this probe on purpose. Editing the shared
one changes what two whole-catalog sweeps flag, and [spec-v1039](spec-v1039.md)'s
rule is to check which tiles a new phrase stops flagging first. This is a report,
not a gate.

## What the 38 need, and why none is fixed here

They need triage one at a time, and the sample done so far says most are closer to
fine than not:

- **`modified-marshall`** reads an impossible FiO2 as absent and its band then says
  *"assessed: renal 2"* where it had said *"assessed: respiratory 3, renal 2"*. It
  discloses by enumerating what it scored rather than by naming what it rejected —
  a shape the probe's vocabulary cannot recognise and a reader can. Its **upper**
  bound is already guarded; only the negative direction reaches this.
- **`fena-feurea`** and **`hemodynamic-suite`** null out the derived quantity
  (`feNaPct: null`, `sv: null`) rather than compute a wrong one. That is correct at
  the library level, and what the *page* then shows is a separate question —
  [spec-v1210](spec-v1210.md)'s, not this one's.

Fixing 38 rows across 25 modules on the strength of a probe that has been wrong
three times today would be the ledger-cost mistake this program keeps writing
down. The measurement ships; the triage is the next chunk, and it starts with the
rows where the reading adds nothing at all.

## Proof

Lint (19 gates) passes. No library, view or test changed, so the unit and MCP
suites are untouched by this wave. The probe reuses `ASKING` from
`test/lib/asking-language.js` rather than copying it — the drift this repo has
paid for three times ([spec-v1057](spec-v1057.md), [spec-v1201](spec-v1201.md),
[spec-v1216](spec-v1216.md)).
