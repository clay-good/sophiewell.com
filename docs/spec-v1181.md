# spec-v1181 — the queue, drained

[spec-v1175](spec-v1175.md)'s finder ranked its rows by whether an impossible
value produced a **reassuring** reading, because [rule 3](incomplete-input-program.md)
is about ruling out. Its first section listed **eleven**.
[spec-v1174](spec-v1174.md) took the platelets, [spec-v1178](spec-v1178.md) the
albumin, [spec-v1180](spec-v1180.md) `sokal-cml`. This is the rest, and the
section prints **0** now.

| Tile | Given | It answered |
| --- | --- | --- |
| `cdai-crohns` | haematocrit 750% | *CDAI **-3975**: clinical remission* |
| `ipss-r-mds` | haemoglobin 250 g/dL | *IPSS-R 3: **Low risk**; median overall survival 5.3 years* |
| `mews` | SBP 3000 mmHg; temperature 450 °C | *0-2: **low risk band** per Subbe 2001* |
| `abi` | brachial 3000 mmHg | *ABI 1.20: **normal** (1.00-1.40)* |
| `lactate-clearance` | initial lactate 400 mmol/L | *99.5%, the cited **favorable** early-clearance range* |
| `stewart-sid-sig` | bicarbonate 600 mEq/L | *at or below ~2 mEq/L, **no excess** unmeasured strong anions* |

`cdai-crohns` is the one to remember: **CDAI is defined on 0–600, and it printed
a negative total as remission.** An impossible input produced an impossible
*output*, and the reading beside it was the most reassuring band the instrument
has.

`mews` is the one that explains the class. Every MEWS band **saturates at its
extreme** — a systolic of 3000 scores the same 2 points a systolic of 200 does —
so the arithmetic is defensible and the total lands in "low risk" anyway. A
bounded score cannot notice an unbounded input; only the envelope can.

## Guard the set, not the field that was reported

spec-v1178 guarded `stewart-sid-sig`'s **albumin** and left its eight other
analytes, so one row survived on a tile the previous wave had already opened —
this is [rule 27](incomplete-input-program.md)'s shape and the half-fix pattern
this session has now hit four times. Every analyte with an envelope is checked
here in one loop.

## Nothing clinical is invented

Every ceiling and every sentence comes from `BOUNDS` and `boundsAdvisory` in
`lib/bounds.js` — the table that has carried them, sourced, since spec-v53 and
had three consumers when [spec-v1174](spec-v1174.md) found it. Each fix was
checked in both directions: the impossible value refused, **and the tile's own
worked example still answering.** `lactate-clearance` briefly failed that second
check when an import did not land, which is why it is asserted rather than
assumed.

## What is left in the probe

- **158 fields across 85 calculators** still answer past a declared ceiling. They
  are the alarming direction: wrong, and not the direction this programme treats
  as dangerous.
- **121 refusals** still describe an out-of-range value as a missing one
  ([spec-v1176](spec-v1176.md)), draining per guard.
- **18 view modules** discard a bound passed to their `field()`
  ([spec-v1179](spec-v1179.md)), ledgered.

## Verification

`npm run release:check` green. `test/unit/envelope-queue-drained.test.js` pins
each of the six to the reading it used to give and to its example still
answering.
