# spec-v1016 — The score-shaped remainder, and the rule running the other way

## The finding

spec-v1013 and spec-v1014 took the arithmetic and decision tiles out of the cleared-form sweep.
This is the score-shaped remainder that spec-v1014 named and left:

| Tile | With nothing entered |
| --- | --- |
| `snappe-ii` | *"SNAPPE-II 0/162: lower illness severity"* from ten blank measurements |
| `scorad` | *"SCORAD 28/103 — moderate atopic dermatitis"*, with *"extent A 0%"* printed underneath |
| `lund-browder` | *"%TBSA: 0%"* from an unmarked burn chart |
| `slums` | *"SLUMS 0 of 30 — dementia"*, labelling an exam nobody performed |

Two are worth stating exactly:

- **`lund-browder`** produces the number the burn resuscitation is calculated from. A 0% on an
  unmarked chart is a decision not to resuscitate, made by an empty form.
- **`snappe-ii`** says plainly in its own note that *"items left blank score their normal (0-point)
  band"*. That is a fair design for a partly charted neonate and it still cannot mean an unmeasured
  infant is a well one. The score now waits for one measurement of the eight and says how many it
  had; the rule-in at 40 points is untouched.

## The rule, inverted

`slums` is the interesting one. Every rule so far has read: a component adds points or leaves them
alone, so a partial total is a **lower bound**, safe to rule in and never to rule out.

On SLUMS a **higher score is a better one**. The same monotonicity therefore says: an unscored item
can only *add* points, so a partial total is a floor on the score and a **ceiling on the severity**.
An incomplete exam can be read as normal once it has already earned enough points — and can never
be read as impaired.

So `slums` refuses exactly the opposite reading from the one `nihss` refuses, for exactly the same
reason. The direction of the argument follows the direction of the scale.

## `scorad`

The extent (A) is a rule-of-nines percentage — a measurement, and a fifth of the score. Read as 0
when the field was empty, it dropped its term and the tile still banded a severity from the
intensity pickers alone. An uncharted extent is not clear skin.

## The regression this wave also fixes

spec-v1013's guard on `bw-bsa-suite` demanded a height **and** a weight before any of its four
outputs. But ideal body weight is height and sex alone, so the inline-compute template
*"ideal body weight 180 cm male"* — a question the site promises an answer to — was met with
*"Enter a weight to calculate."* CI's `inline-compute-agreement` sweep caught it; nothing local did,
because I ran the gates the change was about and not the gate the tile belonged to.

Each row now waits for its own inputs: IBW on the height, and the adjusted weight and the two
body-surface estimates on the weight, with one line saying so.

## Proof

`test/integration/no-answer-from-nothing.spec.js` now covers 26 tiles across three waves.
`inline-compute-agreement` passes. Seven unit tests asserted the old behaviour and now assert the
new one — including two SLUMS band tests that had been scoring four items out of ten and are now
completed with explicit zeros, because an item nobody scored is no longer read as a zero.
13,096 unit tests pass.
