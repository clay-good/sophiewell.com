# spec-v1232 — seven more, and the unit trap that decides the reach

| tile | impossible input | what it printed |
| --- | --- | --- |
| `plasmic-ttp` | platelets 20000 | an ADAMTS13 probability band |
| `french-ttp` | creatinine 250 mg/dL | *"intermediate probability of severe ADAMTS13 deficiency"* |
| `jaam-dic` | platelets 20000 | *"3 of 8 — below the DIC threshold"* |
| `albi-grade` | bilirubin 600 mg/dL | *"grade 3: the poorest liver function"* |
| `meld-xi` | bilirubin 600 mg/dL | *"MELD-XI 47"* |
| `glasgow-imrie` | WBC 2000 | *"predicts severe pancreatitis; 8 of 8 items assessed"* |
| `truelove-witts` | temperature 450 C | the one systemic criterion that turns six bloody stools into **severe** |

Every one is a threshold comparison, and past a threshold the size of the number
stops mattering. `meld-xi` is the compressing kind: both inputs are floored at
1.0 and then logged, so 600 mg/dL produced *"MELD-XI 47"* — a plausible-looking
number beside real scores that top out around 40.

`glasgow-imrie` claimed **"8 of 8 items assessed"** over an impossible lab, which
is a completeness statement about a value the tile should have refused.

## The unit trap decides how many fields can be checked

[spec-v1205](spec-v1205.md)'s rule is that an envelope is a claim about a
quantity **in a unit**, and `glasgow-imrie` is where it bites hardest. Imrie
states:

| item | Imrie's unit | `BOUNDS` unit |
| --- | --- | --- |
| calcium | mmol/L | mg/dL |
| albumin | g/L | g/dL |
| glucose | mmol/L | mg/dL |
| urea | mmol/L | — (BOUNDS has BUN, a different quantity) |
| LDH | IU/L | — |
| **WBC** | **x10⁹/L** | **x10³/µL — the same number** |
| **PaO2** | **mmHg** | **mmHg** |

So **two of the eight items are checked and six are not**, and that is the
correct answer, not a shortfall. Applying `BOUNDS.calcium` (3–20 mg/dL) to a
calcium stated in mmol/L would refuse every legitimate value on the tile — the
`cpis-vap` mistake this program has already made once. The test pins both halves:
the impossible WBC is refused **and** a calcium of 2.2 mmol/L still scores.

`truelove-witts` is the same question with a happier answer: temperature (C),
heart rate (bpm) and haemoglobin (g/dL) all match, and the ESR simply has no
envelope.

## The half-guarded one

`albi-grade` has had an albumin ceiling since [spec-v1178](spec-v1178.md), with a
message that explains the g/L ↔ g/dL confusion it exists for. The bilirubin two
lines below it had none — the shape spec-v1063/v1064 named: *one tile, two gaps,
one guarded*. Its albumin guard and message are untouched.

## The third time a refusal published a second range

`two-ranges-one-field` caught `truelove-witts`'s heart-rate and haemoglobin
fields the moment this wave gave the tile an envelope: the attributes said
`0–400` and `0–25` against envelopes of `10–300` and `2–25`. Both now read
`BOUNDS`.

That is three waves running — [spec-v1227](spec-v1227.md) on the five
SCORE2-family SBP fields, [spec-v1230](spec-v1230.md) on `metabolic-syndrome`,
and this one. **The rule is now predictable enough to state as a step**: a wave
that gives a tile a library envelope must check every `field(...)` on that tile's
renderer for a hand-written `min`/`max` and move it to `BOUNDS`. Adding a refusal
does not create the disagreement — it publishes one that was already there,
silently, in the attribute.

## Ledger

`scripts/probe-envelope-unbounded.mjs`, first section: **47 fields / 33
calculators → 36 / 26.** From 116 / 68 when this run began.
