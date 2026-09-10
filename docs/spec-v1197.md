# spec-v1197 — the unit it assumed

`scripts/probe-omitted-field-decides.mjs` opens on the section it calls **RULED
OUT FROM A SUBSET**, and five of its eight rows are **unit selectors**. Dropping
one moves the answer by an order of magnitude, and in two cases across the
threshold the tile exists to place a value beside.

A unit selector is not the `oneOf` shape of [spec-v1192](spec-v1192.md) to
[spec-v1194](spec-v1194.md). It has a legitimate default — the browser opens on
mg/dL by policy ([spec-v283](spec-v283.md)/[spec-v284](spec-v284.md)), and an
agent that gives a bare number has to be read as *something*. The question is not
whether there is a default. It is whether the reading **says which one it used**.

## Measured

Across the catalog, 22 unit-like picklists carry a worked-example value; **six**
change the answer when the choice is dropped. Five of the six name the assumption
in the reading, and the house already has the sentence for it:

> Read against a salicylate of 110 mg/dL (**no unit given; mg/dL assumed, and a
> level in mmol/L is 13.81 times this**)
> — `salicylate-toxicity`

> **(no unit given; mg/L would be a tenth of this)**
> — the urine protein-creatinine ratio

One was silent.

## `calcium-phosphate-product`

It printed the **output** unit and never the one it had read the inputs in:

```
Ca × PO₄ 57 mg²/dL² — above the historical 55 caution threshold.
```

Calcium in mmol/L is 4.008 times smaller than in mg/dL and phosphate is 3.097
times smaller, so a pair entered in SI with the selector missed reads about
**12.4 times low** — against 55, which is the only number this tile is for. The
output unit is a hint, not a statement, and `mg²/dL²` is what the tile always
reports whichever unit went in.

| | before | after |
|---|---|---|
| unit stated | Ca × PO₄ 57 mg²/dL² — above the historical 55 caution threshold. | unchanged |
| unit omitted | *the same sentence* | …threshold **(no unit given; the calcium and phosphate were read as mg/dL, and the same pair in mmol/L would be about 12.4 times this)**. |

The arithmetic does not move; only the reading gained a sentence. An unrecognised
unit is treated as no unit and says so, which is the
[spec-v1192](spec-v1192.md) lesson about a lookup's miss-value applied to a case
where the fallback itself is defensible.

12.4 is asserted against `4.008 × 3.097` in the test rather than written down, so
it cannot drift from the conversion the same function performs.

## The five that were already right

`salicylate-toxicity`, `homa-ir` ("glucose 100 mg/dL"), `kings-college`,
`vitamin-d-level` ("25 ng/mL (62.4 nmol/L)") and `kings-college-nonapap` all name
the unit they read. That ratio is why this is one tile and not a programme: the
convention exists and was followed almost everywhere.

## Proof

Lint, 13,481 unit tests, 448 MCP tests and three browser sweeps pass, including
the 320px no-horizontal-scroll sweep — the added sentence is the kind of long
parenthetical that has failed it before.
