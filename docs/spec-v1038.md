# spec-v1038 — Draining the required-field ledger

Thirteen more of the 65 tiles spec-v1037 left behind. They fall into four shapes, and the shapes are
worth more than the list.

## A dose that came out as zero

`drip-rate`, `conc-rate`, `insulin-correction`, `carb-insulin-bolus`, `magnesium-replacement` and
`oxytocin-titration` each printed a number a nurse would program into a pump:

> Rate: 0 mL/hr · Drops: 0 gtts/min
> Meal bolus: **0.0 units** · Correction bolus: 1.2 units · Total: 1.2 U
> Ordered dose → pump rate: **0 mL/hr** (beside a real delivered dose of 12 mU/min)
> Magnesium sulfate: **2-4 g IV** — from a magnesium level nobody had drawn

The oxytocin tile is the clearest: it converts in both directions, and with only one of the two
numbers entered it computed the other from a zero and printed it beside the real one. It now prints
only the direction it has a number for.

## An age that chose the thresholds

`pelod2` and `psofa` each apply different MAP and creatinine cut-offs in five age bands. A blank age
read as 0 selected **"<1 mo"**, so a teenager's numbers were scored against a neonate's thresholds —
and the tile said which band it was using, which made the wrong answer look deliberate.
`bhutani-bilirubin` is the same shape: every percentile it draws is hour-specific, and a blank age
compared the bilirubin against the first hour of life.

## A partial sum that ruled out

`qbl-pph` adds measured blood to weighed pads. With the suction canister blank it answered
*"800 mL — Below the postpartum-hemorrhage threshold"*: a rule-out on blood lost into a container
nobody had measured. It now says "at least 800 mL" and refuses the below-threshold line.
`must-nutrition` is the same argument — spec-v930 stopped a blank BMI from scoring 2 and left it
able to score 0, so the tile still read "MUST 0: low malnutrition risk".

## Not-measured printed as not-met

`vent-sbt-peep` listed **"PaO2/FiO2 >=150: no"** for a ratio nobody had entered, under the heading
"SBT not ready" — which reads as a measured reason to keep a patient on the ventilator. Unmeasured
criteria now say "not measured", and the heading distinguishes *not assessed* from *not ready*.

## `Number(null)` is 0

`hacor` had the right guard — refuse unless all six inputs are finite — written when the renderer
passed `Number('')`, which is `NaN`. The renderer was later changed to pass `null` for a blank
field, and **`Number(null)` is `0`, which is finite**. The guard stopped seeing the thing it was
written for, and a missing heart rate scored the best band.

This is the same trap as `Number('')` one value along, and it is worse: the fix that introduced it
was itself a blank-safety fix. Any guard of the form `Number.isFinite(Number(x))` must be paired
with a blank check — `isBlank(v) || !Number.isFinite(Number(v))` — which is what the rest of the
codebase does.

Ledger: 65 → 51.
