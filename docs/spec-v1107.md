# spec-v1107 — the reference level is not "not stated"

[spec-v1102](spec-v1102.md) left one row open and said why:

> `euroscore2` remains open: dropping the NYHA class moves predicted mortality
> from 10.66% to 8.15%. A regression with a missing covariate is a different
> shape from the threshold rules this programme has been working, and it
> deserves its own reading rather than a footing bolted on.

Read, and it is not a different shape. It is the same one, and the reason is a
property of this particular model.

## An 85-year-old, described by nothing else, is low risk

EuroSCORE II has six graded factors — NYHA class, LV function, pulmonary artery
pressure, urgency, weight of intervention, renal function — each looked up in a
coefficient table by:

```js
const lk = (table, key) => (Object.prototype.hasOwnProperty.call(table, key) ? table[key] : 0);
```

`0` is not a neutral fallback here. **It is the reference level of every one of
the six**: NYHA I, good LV, normal PA pressure, normal renal function, elective,
isolated CABG. So an unstated factor was scored as the healthiest patient the
model can describe.

```
euroScore2({ age: 85 })
  -> "EuroSCORE II predicted in-hospital mortality 1.01% (low predicted operative risk)"
```

Six clinical characterisations asserted, none of them made — rule 11, and the
identical answer a fully described elective CABG patient with normal kidneys
gets. A typo did the same thing silently: `urgency: 'Emergency'` was scored as
elective.

**And every select opened on that reference level.** With no *"Not stated"*
option, the browser could not express the difference either, so the tile did not
need an agent to reach the defect — an age and no other touch was enough. That is
rule 8, and it is why the library fix alone would have left the page unchanged.

## Why it is the same shape after all

Because **every coefficient in the six tables is zero or positive.** The model is
therefore monotone in them, exactly as a summed score is: what has been stated
gives a **floor**, and an unstated factor can only raise it. The one thing that
looked unfamiliar — a probability rather than a band — turns out not to matter,
because the probability is monotone in the same way.

So it takes the programme's standard treatment, and the answer keeps its number:

> EuroSCORE II predicted in-hospital mortality **at least 1.01%** on what was
> stated. 6 of the 6 graded factors were not stated (the NYHA class, LV function,
> the pulmonary artery pressure, the urgency, the weight of intervention, renal
> function), and every coefficient in this model is zero or positive, so each can
> only raise it. **Not yet a risk tier.**

`tier` is `null` while anything is unstated. Naming a tier is the part that
cannot be justified from a floor, and it is the part a reader quotes.

**"Very high" is exempt** (rule 13). It is the top band, and an unstated
covariate cannot talk it down. The tile's published worked example lands there,
which is why it reads exactly as it did.

## The claim the fix rests on is now tested

The disclosure says *"every coefficient in this model is zero or positive"*. That
sentence is false the day someone adds a negative one, and nothing else in the
suite would notice — the estimate would simply start being wrong in the other
direction, quietly.

So `euroScore2Coefficients` is exported and a test walks all six tables:

```js
assert.ok(coefficient >= 0, `${key}.${level} is ${coefficient}: the floor claim no longer holds`);
```

**A disclosure that asserts a property of the model is a claim the suite has to
hold**, in the same way a threshold is. This is the first place in the programme
where the footing depends on something other than "it is a sum", and it is worth
saying out loud: the monotone argument every one of these fixes rests on has been
*checked* here and *assumed* everywhere else.
