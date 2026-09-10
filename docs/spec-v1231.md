# spec-v1231 — the reassuring band is the open one

Four scores in `lib/scoring-v4.js`. Each bands its inputs with an if/else chain,
and the last `else` catches everything. On three of the four, that outermost band
is the **reassuring** one — so the impossible value did not merely score, it
scored *well*:

| tile | impossible input | what it printed |
| --- | --- | --- |
| `grace` | SBP 3000 mmHg | *"Low (in-hospital mortality < 1%)"* |
| `oakland` | haemoglobin 250 g/dL | *"safe for outpatient management (95% probability of safe discharge)"* |
| `hacor` | pH 80, or PaO2 7000 | *"HACOR 0: not in the Duan 2017 high-risk band"* |
| `lis-murray` | PaO2 7000 mmHg | *"Murray LIS 0: no lung injury"* |

`oakland` is the one to remember. The score's whole purpose is a discharge
decision, and a haemoglobin no patient has produced one. `oaklandHgb` is open at
the top by design — 250 g/L and 160 g/L both score 0 points, because above the
normal range there is nothing to score — which is right for the instrument and
silent about the number.

## What the probe's own classifier said

`scripts/probe-envelope-unbounded.mjs` ranks its rows by whether the impossible
value produced a **reassuring** reading, and that section has read **zero** since
[spec-v1211](spec-v1211.md). All four of these sat in "the rest".

A gate that reports clean is a claim about its **reach**. The classifier reads
the band text for a reassuring vocabulary, and *"safe for outpatient
management"*, *"no lung injury"* and *"not in the high-risk band"* were not in
it. That is worth fixing on its own, and is not fixed here — this wave takes the
four tiles; the classifier's vocabulary is a separate question with its own
false-positive risk.

## The fix

Each value is checked against `BOUNDS` before it is banded, with
`boundsAdvisory`'s sentence, after each function's own missing-value branch
([spec-v1207](spec-v1207.md)). No band table moves.

All four returned a `{ score, band }` shape with no `valid` field, so every
refusal — including the missing-value ones that predate this wave — reached an
agent as `valid: true` with the refusal sentence sitting where the answer goes
([spec-v1205](spec-v1205.md)). All eight refusal paths now say `valid: false`.

## A test that asserted an impossible value

`test/unit/hacor.test.js` held the heart-rate term at zero points with `hr: 0`
while it moved the pH across its four bands. A heart rate of 0 is outside
`BOUNDS.hr` (10–300, *"sustained rates outside 10–300 are not compatible with
perfusion"*), so it is now refused. The term is held at zero with **80 bpm**
instead — which scores zero for the reason Duan gives, being below the > 120
cutoff — and the test now also pins that 80 and 60 score the same, so it is
testing the band rather than a magic number.

## Ledger

`scripts/probe-envelope-unbounded.mjs`, first section: **54 fields / 37
calculators → 47 / 33.**
