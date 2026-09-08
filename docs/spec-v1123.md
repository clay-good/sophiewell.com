# spec-v1123 — two grades, on the criterion that takes reading vision

One tile, found by asking the [spec-v1115](spec-v1115.md) question again with a
wider vocabulary.

That wave swept for *"does omitting this field turn an unreassuring answer into a
reassuring one?"* using words like *low risk*, *negative*, *normal*. Severity
**gradings** do not use those words — they say *early*, *mild*, *grade 1*,
*stage I*. Re-running the same sweep with that vocabulary returns three rows, of
which two are already known-correct (`figo-pas` discloses; `loe-silness` is the
documented mean from [spec-v1098](spec-v1098.md)).

The third:

```
hpa-glaucoma | hpa-central
  was  Hodapp-Parrish-Anderson: severe glaucomatous field defect
  now  Hodapp-Parrish-Anderson: early  glaucomatous field defect
```

**Two full grades**, from leaving one select alone.

## Why this one and not the numeric three

Hodapp-Parrish-Anderson reads four criteria off one visual field and takes the
**most severe** as the grade. Three are numbers — mean deviation, points below
the 5% level, points below the 1% level — and the tile already omits each from
the calculation when it is blank, which is right.

The fourth is a select, and it fell back to `'all-above-15'`: *all central points
above 15 dB*. That is not a neutral default. It is a **normal reading of the
central five degrees**, which is the part of the field that takes reading vision
and the reason the criterion is in the instrument at all.

So the one input that could not be left blank was the one whose fallback carried
the most weight.

## And the three numeric ones were silent, not wrong

Omitting them was already handled correctly — they drop out of the grade rather
than scoring zero. But nothing said they had. A grade of *early* set by one
criterion out of four now reads:

> Hodapp-Parrish-Anderson: **at least early defect on the 1 of the 4 criteria
> read**. The points below the 5% level, the points below the 1% level, the
> central 5 degrees were not entered, and the grade is the most severe of the
> four, so each can only raise it.

`severe` is the top level, so it rules in from one criterion and needs no footing
(rule 13).

## The test that was true because of the fallback

*"a clean field on every criterion stages as none"* passed **three** of the four.
Its name was accurate only because the missing fourth defaulted to its mildest
level — the tenth wave in a row where a test was pinning a default rather than a
behaviour, and the clearest case of a test whose *name* is the thing that was
wrong.
