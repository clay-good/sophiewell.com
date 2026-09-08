# spec-v1118 — a finder for the shape eight waves kept arriving at

Eight of the last ten waves found the same two facts holding at once, one tile at
a time:

1. The tile renders a `<select>` whose **first option is a scoring level** —
   `"0"`, `"no"`, `"none"`, `"never"`, ASA 1, very-good cytogenetics, moderate
   variability — so the control cannot say *not answered* and the page **opens on
   an answer** (rule 8).
2. The adapter does not mark the field `required`, so an **agent omitting it**
   lands on the same level (rule 9).

Either alone is survivable. Together they mean a scoring input that **nobody —
reader or agent — can leave unanswered**, whose unanswered state is silently the
most favourable one.

`scoring-select-probe.spec.js` finds that pair, and then narrows it.

## Two signals, because one of them is 702

| | |
|---|---|
| selects rendered for a field the adapter does not require | **1,067** across 584 tiles |
| …of those, with **no empty option** | **702** across 349 tiles |
| …of those, that also **change the answer** when dropped from the tile's own worked example | **52** across 27 tiles |

The first number is not a defect list — a select whose first option is genuinely
the default state of the world is fine, and the billing tiles are full of them.
The third is the one to read, and it is the intersection this programme has been
computing by hand since [spec-v1105](spec-v1105.md).

The 322 tiles that are unanswerable but not *shown* to move anything are reported
separately and explicitly as **weak evidence**: a worked example is written
alarming ([spec-v1092](spec-v1092.md)), so the defect lives on the reassuring side
the example never reaches.

## Its first run found that a previous fix had never reached the page

`nichd-fhr` was in the list, and it was fixed **two weeks of waves ago**.
[spec-v1102](spec-v1102.md) is a careful piece of work: it establishes that
Category I is a conjunction needing all four features observed, that Category III
turns on the variability, and it implements `provided()` to tell an unobserved
feature from an absent one. Every one of its tests passes.

And on the page:

```
baseline 140, four selects untouched
  ->  "Category I: a baseline of 140 beats per minute, which is normal,
       moderate variability, and neither late nor variable decelerations."
```

Exactly the sentence spec-v1102 was written to prevent. `VARIABILITY_OPTIONS`
opened on *moderate*, `DECEL_OPTIONS` on *absent*, so `provided()` — correct, and
correct about the agent surface — **never saw a blank on the browser.**

This is [spec-v1078](spec-v1078.md)'s trap: a guard in the right place, made
unreachable by a control with no empty state. And the reason no test caught it is
that **every test calls the library directly**, where the guard works.

The programme's own note says to re-run the control probe after any wave that
changes what a tile asks. spec-v1102 changed only what a tile **answers**, which
is why nobody re-ran it — and is the gap this probe closes.

The three option lists now open on *"Not observed"*, and the page opens on
*"Not categorisable yet: the variability, the late decelerations, the variable
decelerations were not entered."*

## The rule

**A fix to a library is a fix to the surfaces that can reach it.** Rule 18 said
the guard belongs in the pure function rather than the renderer or the adapter.
That is necessary and it is not sufficient: the *controls* decide which states
the pure function is ever called in, and a control that cannot express the state
a guard tests for makes that guard dead code on that surface.

Every remaining row this probe prints is a candidate for the same thing.
