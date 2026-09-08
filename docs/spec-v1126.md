# spec-v1126 — a sequence that exists only to upgrade

One tile, and it is the cleanest example in the programme of the narrowing the
last five waves kept arriving at.

## `pi-rads`: the upgrade that never happened

PI-RADS v2.1 grades a prostate MRI from a **driver** sequence — DWI in the
peripheral zone, T2W in the transition zone — and a **second** sequence that
exists only to *upgrade* it:

| zone | driver | upgrade |
|---|---|---|
| peripheral | DWI/ADC 1-5 | a positive DCE takes a **3 to a 4** |
| transition | T2W 1-5 | DWI ≥ 4 takes a **2 to a 3**; DWI = 5 takes a **3 to a 4** |

The second sequence was optional, and an unstated one simply did not upgrade. The
tile reported the driver's category with nothing said:

> PI-RADS **3** — intermediate (equivocal) likelihood of clinically significant
> cancer (peripheral zone, DWI/ADC 3).

**3 against 4 is equivocal against likely**, which is watching against biopsying.
And the DCE select opened on *"Negative"*, so a reader who had not looked at the
contrast sequence got the un-upgraded answer without touching anything.

## The fix is a short list, not a blanket

An upgrade sequence can only move the category at the categories it upgrades.
Everywhere else the missing value **cannot change the reading**, and refusing
there would break the ordinary case:

| state | guarded? |
|---|---|
| peripheral, DWI 3, no DCE | **yes** — DCE would make it 4 |
| peripheral, DWI 1, 2, 4 or 5 | no — DCE upgrades only a 3 |
| transition, T2W 2 or 3, no DWI | **yes** |
| transition, T2W 1, 4 or 5 | no |

That is the third time in five waves the sharper question — *does this missing
value change **this** reading?* — has produced a smaller fix than *is something
missing?*, after `glim-malnutrition` ([spec-v1119](spec-v1119.md)) and `startback`
([spec-v1122](spec-v1122.md)).

It is worth naming why the narrow version is better and not merely politer. A
tile that refuses whenever anything is absent trains its reader to fill fields in
to make the refusal go away, and the fields they reach for are the ones they can
guess. **A guard that fires only where it changes the answer is a guard the
reader can believe.**

## And the boundary is per-band, not per-field

`startback` needed guarding at two totals and nowhere else; `glim` at one
combination of criteria; `pi-rads` at four of the twenty (zone × category)
states. In each the unit of the decision is a **reading**, not a field — which is
why "is this field required?" is the wrong question to build a guard on, and
"which readings can this field move?" is the right one.
