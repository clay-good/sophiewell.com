# spec-v1146 — the gate tested one field per tile, and always the same one

`required-field-agreement.spec.js` ([spec-v1037](spec-v1037.md)) is one of this
repo's best gates. Its oracle needs no heuristic: `mcp/fields.js` already marks
an input `required`, so an agent omitting it gets `MISSING_INPUT` and no number,
and a browser that answers anyway is giving two customers different answers.

It clears the first required field a tile renders as a text or number input, and
then `break`s.

| | |
| --- | --- |
| required fields the catalog declares | **4,226** |
| tiles that declare at least one | 1,089 |
| tiles that declare **more than one** | 900 |
| fields the gate can ever clear | **one per tile** |

It has been green throughout.

## What the other three thousand hid

Not anything exotic. In three tiles the **first** required field had a lower
bound that rejects zero and the **second** did not — so the sweep tested the
guarded half every time:

| Tile | The guard that fires | The one that does not |
| --- | --- | --- |
| `aa-pf-suite` | `pfRatio` needs `fio2 >= 0.01` | `pao2` is allowed at 0 → ***"P/F ratio: 0 - Severe ARDS (Berlin)"*** |
| `burn-fluid` | `burnFluid` needs `weightKg >= 0.1` | `tbsaPercent` is allowed at 0 → ***"Parkland total 24h: 0 mL"*** |
| `big` | [spec-v1041](spec-v1041.md) guarded the base deficit | the INR and the GCS did not → ***"BIG 0.0: below the high-mortality threshold"*** |

Two things about that table are worth saying plainly.

**`aa-pf-suite`'s reading is the example in spec-v1037's own header.** The gate
was written because "the same missing lab produced a refusal on one surface and
*P/F ratio: 0 (Severe ARDS)* on the other" — and that exact reading was still
live on the tile, on the second of its two required fields.

**`big` is a half-fix that survived because the sweep tests the half that was
fixed.** spec-v1041 changed `baseDeficit` to `numOrNull` and left `inr` and `gcs`
on `num()`, which is `Number('')` — zero. The library's own `isBlank` check could
never fire, because the renderer had already turned the blank into a number.
That is rule 7 exactly: *a guard against a missing value is a guard against one
SHAPE of missing value.*

`big` now checks every term, and builds the floor from whichever are present, so
a partial form can still carry the high-mortality reading and never the
reassuring one (rule 3).

## Why this ships a probe and not a wider gate

The widened question has a backlog: **62 (tile, field) pairs** at the first run,
of which this wave fixed three. Widening the gate now would mean ledgering 59
rows to keep it green, and a tile exempted for nothing is a tile the gate is not
protecting.

So the gate goes on stopping **new** first-field offenders, and
`required-field-every-probe.spec.js` asks the wider question beside it. Both use
one copy of the rule (`test/lib/required-fields.js`) — the "did it answer?" test
is a regex that has been tuned twice, and two copies would answer differently the
day one is touched.

Its reach, printed with its result: **2,075** of the 4,226 declared fields
actually cleared. The rest are selects, checkboxes and sliders — clearing one
sets a different *value* rather than removing one, which is a different question
([spec-v1029](spec-v1029.md)) — or fields the worked example leaves blank.

## The 59 rows, triaged

Preliminary except where a wave has read the tile. The ledger's three categories:
**(1)** the browser should ask; **(2)** the `required` declaration is wrong and
the agent surface is refusing input it could answer from; **(3)** a genuine
exception that answers about what IS entered and says so.

| Group | Rows | Reading |
| --- | --- | --- |
| **A number that is not a measurement** | `tpn-macro` (3), `peds-fluid-deficit`, `crrt-dose`, `pca-pump`, `prevent` (5), `saps-ii` (2), `lvh-criteria` (2), `insulin-correction` (2), `vanc-auc`, `qbl-pph` | likely (1) — the same "0 g of dextrose", "0 mL deficit", "0 mg/h" shape this programme has fixed ninety times |
| **Declared required, documented optional** | `osmolal-gap\|og-etoh` ([spec-v1103](spec-v1103.md) says the ethanol stays optional), `winters\|wf-paco2` (its own label says *optional*), `anion-gap\|alb`, `anion-gap-dd\|alb`, `corrected-anion-gap\|hco3` | likely (2) — fixing the declaration is also a fix |
| **Criteria that are present or absent** | `truelove-witts` (4), `niss` (2), `vent-sbt-peep`, `nutric` | likely (3) — an unmet criterion is a real *"no"* (rule 4) |
| **Suites of independent readings** | `ecmo-titration` (5), `abg` (2), `digoxin` (2), `o2-cylinder-duration` (2), `infusion-time-remaining` (2), `rosendaal-ttr` (2) | needs the tile read: several calculators on one page, and the others are right to go on answering |
| **The rest** | `acetaminophen-nomogram`, `anticoag-reversal`, `capra-score`, `gap`, `mgap`, `heparin-nomogram`, `nsa-cost-share`, `rox`, `tsat`, `weight-dose`, `posas-patient-scar` (2) | one at a time |

## One row is the shared vocabulary, not a tile

`posas-patient-scar` refuses in as many words — *"Rate pliability (stiffness)
from 1 to 10"* — and the probe flagged it anyway. `ASKING`'s rating pattern is
`(?:rate|score) [a-z0-9 ]{1,30}\b(?:from|on the) \d`, and the character class has
no parentheses in it, so a label that names the item and then explains it in a
bracket does not match. Recorded rather than fixed here: editing that list needs
its own measurement of which tiles stop being flagged
([test/lib/asking-language.js](../test/lib/asking-language.js) carries the rule).
