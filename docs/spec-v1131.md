# spec-v1131 — two fallbacks that chose the best case

The last unworked item on this programme's list was the coercion report:

> **146 coercion helpers cannot tell a blank from a zero**
> (`scripts/probe-blank-coercions.mjs`). Most are harmless; which ones are not
> depends on what their renderer sends, so the report is a reading aid rather
> than a gate.

A reading aid for 146 rows is a reading aid nobody reads. It becomes a wave the
moment it is **sorted**: not "which helpers coerce?" but **"which of them falls
back to something other than a plain zero?"**

```
node scripts/probe-blank-coercions.mjs | grep -E "return lo|: [1-9][0-9]*;|\? [a-z]+ : [1-9]"
```

Five rows. Two were defects, and both are the same shape as the `?? 0` family
this programme has been draining: **the fallback selects the most favourable
level the instrument publishes**, so the tile answers at its best case and says
nothing about having chosen it.

## `wilkins-score` — an echo score for a valve nobody had looked at

`lvl(v, 1, 4)` clamps to a range and returns its **low** bound for a value that
is not a number. On each of the four Wilkins characteristics, 1 is the best
appearance there is: fully mobile leaflets, near-normal thickness, no
calcification, minimal subvalvular disease.

```
empty form : Wilkins score 4 — favorable for balloon valvuloplasty (<= 8).
all four 1 : Wilkins score 4 — favorable for balloon valvuloplasty (<= 8).
```

Those two lines are identical, and one of them is a valve that has been imaged
and graded. The Wilkins score is read to choose between a percutaneous balloon
valvuloplasty and open surgery.

Each component is 1 to 4, so what has been graded is a **floor**: unfavourable
(>= 13) rules in from a subset and stands (rule 13), and it is *favorable* — the
reading at the bottom — that an ungraded characteristic can undo. The tile now
names what is outstanding:

> Wilkins score at least 5 on what was graded: leaflet mobility, leaflet
> thickening, leaflet calcification are not graded, and each scores 1 to 4, so
> the valvuloplasty suitability cannot be read off this total yet.

**And the page had the same defect in its own right** (rule 22). All four selects
opened on `1 (normal/mild)` with no blank option, so the guard could not be
reached by a reader at all — only by an agent, whose adapter marks the fields
required. `Not graded` is now the first option.

## `rox` — a timepoint nobody gave, printed as though they had

```js
export function rox({ spo2, fio2, rr, hoursAfterStart = 12 })
```

A default parameter, and the answer **named it**:

```
no hour : ROX 3.00: failure-predicting at 12h (<3.85 per Roca 2019 Figure 2);
          consider escalation.
at 2 h  : ROX 3.00: indeterminate at 2h (between 2.85 and 4.88 per Roca 2019);
          reassess.
```

Same patient, same score, escalate or reassess — decided by a number nobody
entered, and reported with the hour written into the sentence (rule 11). The
page pre-filled `12` into the field as well, so neither surface asked.

**But the hour does not always decide, and the guard is scoped to where it
does** (rule 25: the unit of a guard is a reading, not a field). Roca publishes
one success cutoff, >= 4.88, at every timepoint; below 2.85 every published
cutoff calls failure. Only between them do the three failure cutoffs (2.85 at
2 h, 3.47 at 6 h, 3.85 at 12 h) disagree. So:

| Score | Without an hour |
| --- | --- |
| >= 4.88 | success-predicting — answered, no hour named |
| 2.85 to 4.88 | **asks for the hour**, and says why it is what decides |
| < 2.85 | failure-predicting *at every published timepoint*; consider escalation |

The third row is rule 13 in the other direction: the verdict holds whatever the
hour, so it stands — but it may not print "at 12h" to justify itself.

## The trap in wiring it up

`numOrNull` sends a blank field through as `null`, and **`Number(null)` is 0** —
finite, and 0 hours reads as the 2 h window. `Number.isFinite(Number(v))` is not
a test for "was this given"; it is a test on a value that has already been
coerced. Both fixes test the value first, then the number. The same slip would
have made `wilkinsScore` treat `null` as a grade, because `String(null)` is
`"null"` and passes a non-empty check.

## What is left of the report

Three of the five sorted rows were fine on reading: fallbacks to a neutral
midpoint or to a value the renderer never sends. The other 141 rows fall back to
zero, which is [spec-v1040](spec-v1040.md)'s question and not this one. The
sorted form of the query is worth keeping — **a report is only a reading aid
until you find the column to sort it by**.
