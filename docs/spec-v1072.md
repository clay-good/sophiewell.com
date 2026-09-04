# spec-v1072 — the widget that invented a haemorrhage

[spec-v1071](spec-v1071.md) ended on a lesson: when a guard newly makes a result
null, check **every** consumer of that result, not the one you found first. On
`mews` and `news2` there were two — the per-parameter breakdown and the optional
trend widget.

The catalog has exactly two such widgets. The second one was worse.

## What `oakland` printed

`renderHgbTrend` is the hemoglobin-drop companion to the GI-bleed scores: a
falling haemoglobin is an active-bleeding signal the score itself does not
capture. It was called through `nv()`, the blank-unsafe reader, so a blank
haemoglobin arrived as **0** and the widget computed the drop against it.

With a prior value of 12 g/dL entered and the current one cleared, the tile
answered:

> Enter age, heart rate, systolic BP and hemoglobin to score. **Hemoglobin
> trend: falling 12 g/dL over 6 h (2 g/dL per hour). A falling hemoglobin
> suggests ongoing blood loss; correlate with hemodynamics and the resuscitation
> response.**

It **refuses to score and raises an alarm in the same breath** — a 12 g/dL fall
and a warning about ongoing blood loss, both computed from an empty field.

## Why this one is the worst of the class

Every reading the blank-field programme removed so far erred toward
reassurance: a shock index of 0.00, a bilirubin in the low-risk zone, "no AKI
criteria met". Those are dangerous because a clinician might stop looking.

This is the mirror, and it is not the safer direction for being alarming. A
fabricated 12 g/dL drop is a reason to transfuse, to scope, to escalate — and it
appears **underneath a sentence saying the score cannot be computed**, which is
the tile admitting it does not have the number the warning is made of.

## The fix

`renderHgbTrend` returns early unless the current haemoglobin is a finite
number, and both call sites (`gbs`, `oakland`) now read it with `nvOrNull`
rather than `nv`. `renderEwsTrend` got the same guard in spec-v1071.

Those two are the whole population: a sweep of `views/` for secondary renderers
taking a value alongside the result finds `renderEwsTrend` and `renderHgbTrend`
and nothing else, and no call site now passes a blank-unsafe reader into one.

Pinned in `no-answer-from-nothing.spec.js`, which asserts both halves — that a
blank haemoglobin invents no trend and no bleeding warning, **and** that entering
one brings the trend back, so the guard has not simply switched the widget off.
