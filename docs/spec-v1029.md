# spec-v1029 — What the ledger was hiding

## The blind spot

`test/integration/no-answer-from-nothing-sweep.spec.js` clears every number field in all 1,704 tiles
and fails on any that still answers. `test/integration/empty-form-ledger.js` exempts the ones where
answering is correct — a checklist nobody has ticked really does score zero.

An exemption is per **tile**, and the judgment behind it was per **field**. Sixteen ledger entries
turned out to read a number as well as a checkbox, and five of those numbers made the reading more
reassuring than the form supported:

| Tile | What an untouched form said | What was missing |
| --- | --- | --- |
| `pesi` | Class I (very low risk; 30-day mortality 0.0–1.6%) | the age — which *is* most of the score |
| `charlson` | estimated 10-year survival ~98% | the age adjustment, worth 4 points |
| `hospital-score` | low risk; readmission ~5.8% | admissions in the past 12 months, worth 5 |
| `wells-pe-geneva` | Geneva: 0 — Low (~8%) | the heart rate, worth 5 |
| `pecarn-head` | Very low risk: ciTBI <0.02%. CT not recommended. | the age, which picks *which rule applies* |

PESI Class I is the reading that sends a pulmonary embolism home. The PECARN line is a decision not
to image a head-injured child. Both were produced by a form nobody had filled in.

## The fix

Four of the five are monotone, so the rule is the program's: what has been entered is a **lower
bound**, and the guard asks only when the missing points could still move the band.

- `geneva` with five criteria ticked already reads High, and the heart rate cannot change that — it
  answers.
- `charlson` with AIDS ticked is already in the worst band — it answers.
- `hospital-score` at 8 points is already high risk — it answers.
- Below those, each says what is outstanding: *"Revised Geneva is at least 6 from the criteria
  ticked. Enter the heart rate: it is worth up to 5 points, so the probability group cannot be read
  yet."*

`pecarn-head` is different, and it is the interesting one. Its age adds no points — it selects
between two rules with different predictors and different quoted rates. So both branches are now
evaluated: where they agree the tile answers (a GCS under 15 is high risk at any age), and where
they disagree it says so and asks for the age. Where both say very low risk it still answers, minus
the age-specific rate it cannot know.

## The ledger

Six lines removed: `ciwa`, `cows` (spec-v1028), `pesi`, `charlson`, `hospital-score`,
`wells-pe-geneva`. Eighty remain. `pecarn-head` keeps its line and now earns it.

The sweep's asking-language list gained *"rate the remaining"*, which is how spec-v1028's two scales
phrase their refusal.

## Still open

`wat-1` — the pediatric withdrawal scale, sibling to spec-v1028's CIWA-Ar and COWS — reads *"WAT-1 0
of 12: no significant withdrawal"* from an untouched form, and its ten items are **sliders**. A
slider cannot be blank: it sits at zero and looks like a rating somebody made. The fix is a control
change, not a null check, and it takes the field ids into the MCP registry and the example fills
with it. `meows` and `mini-cog` have the same control. That is the next unit of this program, and it
is a different shape from the five here.
