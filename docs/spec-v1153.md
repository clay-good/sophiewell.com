# spec-v1153 — a suggestion that was the reader's own input

Seventh batch out of [spec-v1146](spec-v1146.md)'s backlog: `ecmo-titration`, five
rows on one tile.

## The shape

The tile titrates two things independently — the sweep gas from the PaCO2 pair,
the pump flow from the DO2i pair — and each half is skipped when its inputs are
absent:

```js
let suggestedSweep = sweep;
if (Number.isFinite(paco2) && paco2 > 0) suggestedSweep = r1(sweep * (paco2 / target));

let suggestedFlow = flow;
if (hb > 0 && sao2 > 0) { … suggestedFlow = r1(required); }
```

Skipping is right. **What was wrong is that the headline then printed the
un-titrated value as the recommendation:**

> Sweep **5** L/min / Flow **4** L/min

with no way to tell that the 4 is the number the reader typed into "Current pump
flow" a moment earlier. A recommendation that is the reader's own input, presented
as a recommendation, is the worst form of silent default (rule 21) — there is
nothing on screen to separate it from a computed one, and this is a tile whose
output is a setting on a running ECMO circuit.

Each half says what it did not do now:

| Missing | It says |
| --- | --- |
| current PaCO2 | *"the sweep has **NOT** been titrated: 4 L/min is the setting you gave, not a suggestion"* |
| hemoglobin or saturation | *"DO2i needs the hemoglobin and the saturation, and the hemoglobin is not entered — so oxygen delivery has not been checked and 4 L/min is the pump flow you gave, not a suggestion"* |
| target PaCO2 | *"Titrated to the default target PaCO2 of 40 mmHg, because no target was entered"* |
| neither half | the headline itself carries *"(unchanged: nothing to titrate against yet)"* |

## A sweep of zero is not a setting

`ecmoTitration` rejects a flow at or below zero and a sweep **below** zero — so a
blank pump flow was refused and a blank sweep passed as `0`, giving:

> Sweep **0** L/min / Flow 3.5 L/min

which on a running circuit is not a setting, it is no gas at all. A sweep of 0 is
a real state during a trial off, so a **typed** 0 still answers; a blank is a gap
and is asked for.

## And the declarations

All four of the titration inputs were declared `required` to agents, so every call
that wanted one half was refused — while the page's own label reads *"Target PaCO2
(mmHg; **default 40**)"*, which is [spec-v1152](spec-v1152.md)'s
label-argues-with-its-own-flag shape a second time, on the view label rather than
the registry one.

## Backlog

**18 → 13.** Left: `rosendaal-ttr` (2), `posas-patient-scar` (2) and nine singles.
