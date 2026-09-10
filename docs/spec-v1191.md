# spec-v1191 — the units were the loudest thing in the query

`normalizePhrase` strips punctuation, so `mcg/kg/min to ml/hr` becomes six very
common tokens: `mcg kg min to ml hr`. A token in a tile's **name** is worth three
points — the heaviest per-token signal in the rubric — so the tiles whose names
happen to contain those units won the most repeated arithmetic in critical care:

```
"mcg/kg/min to ml/hr"  ->  Oxytocin mU/min <-> mL/hr            rank 1
                           Glucose Infusion Rate (mg/kg/min)    rank 2
                           Neonatal feeding volume              rank 3
                           Concentration-to-Rate                rank 4
```

Both leaders are drug-specific. `conc-rate` is the general converter, and its own
summary names the exact units asked for:

> Converts an ordered drug dose (mcg/kg/min, mcg/min, mg/min, units/hr,
> units/min) plus bag concentration into a pump rate in mL/hr.

## Why the phrase table rather than the rubric

Reweighting unit tokens is the tempting fix and the wrong one: **a unit is only
noise in some queries.** `gir` *should* win "glucose infusion rate mg/kg/min",
and `oxytocin-titration` *should* win "oxytocin mU/min to mL/hr". A rubric change
cannot tell those apart; a phrase table can, because it matches the whole
question rather than its words.

So this goes through the hand-curated synonym table, matched before ranking, with
[spec-v1187](spec-v1187.md)'s discipline: **route only where the landing tile's
own text answers the question.** 14 explicit unit-pair phrasings, all listed in
`conc-rate`'s own summary.

## After

| query | before | after |
|---|---|---|
| `mcg/kg/min to ml/hr` | oxytocin-titration | **conc-rate** |
| `ml/hr to mcg/kg/min` | oxytocin-titration | **conc-rate** |
| `mg/hr to ml/hr` | oxytocin-titration | **conc-rate** |
| `units/hr to ml/hr` | oxytocin-titration | **conc-rate** |
| `convert mcg/kg/min` | gir | **conc-rate** |
| `oxytocin mu/min to ml/hr` | oxytocin-titration | oxytocin-titration |
| `glucose infusion rate mg/kg/min` | gir | gir |

The last two rows are the point: the drug-specific tiles keep their own
questions, and the gate asserts it.

## Held to its own premise

The gate also asserts that `conc-rate`'s summary still names every unit it is
routed for. The routes are only defensible while the tile actually converts
these; if the summary stops naming them, the routes become a claim nothing backs.
Same rule `brand-name-routes.test.js` applies to drug names.

## Not routed

`how many ml per hour` still reaches neonatal feeding volume. It names no source
unit, so there is no conversion to identify — routing it would be a guess, and
[spec-v1187](spec-v1187.md) is the record of what guessing costs here.

## Regression, catalog-wide

**0 of 1,706** tiles changed their top-1 for their own name. All 93 existing
search tests pass unchanged.

## Verification

`npm run release:check` green, exit code read directly rather than through a
pipe. Negative-tested: removing the synonym entry fails six of the eight cases
and shows `oxytocin-titration` back at rank 1.
