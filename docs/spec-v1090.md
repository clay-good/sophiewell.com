# spec-v1090 — the stage the area decides

Second off [spec-v1088](spec-v1088.md)'s list, and unlike
[spec-v1089](spec-v1089.md) this one really is the defect the programme is named
for.

## What the tile did

`aortic-stenosis-stage` grades the 2020 ACC/AHA stages A to D. Drop the aortic
valve area from its own worked example and the reading went from

> Aortic stenosis stage **D2** — symptomatic severe stenosis at a low flow and
> low gradient with a reduced ejection fraction.

to

> Aortic stenosis stage **B** — moderate progressive stenosis.

with nothing said. That is the difference between an intervention conversation
and a watch-and-rescan one, on a measurement nobody supplied.

The mechanism is one line:

```js
const smallArea = ava !== null && ava <= 1.0;
```

correct in itself, and false when nobody entered an area — so the D2 and D3
branches are skipped and a gradient in the moderate range falls straight through
to B. **The low-gradient severe patterns are reached through the area**, which is
exactly the error this tile was built to prevent; its own test suite says so:

```js
test('as stage: a low gradient does not exclude severe stenosis (D2)', () => {
  // The error the tile exists to prevent: gradient-only reading calls this moderate.
```

A missing area reintroduced it by the back door.

## The first fix was too broad, and a test caught it

The obvious guard — refuse whenever the gradient is moderate and the area is
absent — broke a pre-existing assertion:

```js
assert.equal(as({ peakVelocity: 3.4 }).stage, 'B');
```

and that assertion is right. A velocity of 3.4 m/s with nothing else measured
**is** stage B by the guideline's velocity criterion, and refusing it would
refuse the ordinary reading of an ordinary echo.

**Both D2 and D3 require symptoms.** So the patient whose area decides between
moderate and severe is the symptomatic one at a low gradient, and that is where
the guard belongs. Three readings, all distinct:

| | |
|---|---|
| area 0.8, symptomatic, EF 35 | **D2** — the severe low-flow pattern |
| area 1.4, symptomatic, EF 35 | **B, moderate** — measured, and genuinely not small |
| **no area**, symptomatic, EF 35 | **no stage** — *"Enter the aortic valve area. At a low gradient the severe stages (D2 and D3) are defined by an area of 1.0 cm² or less, so without it a moderate-range gradient cannot be read as moderate stenosis."* |
| velocity 3.4, nothing else | **B, moderate** — unchanged, and correct |

The refusal uses the file's own `pending` field, which already carried "Enter the
ejection fraction to separate C1 from C2" for the same reason one branch up.

## The other three valve-stage fields were not defects

spec-v1088 grouped `aortic-stenosis-stage`, `mitral-stenosis-stage` and
`aortic-regurgitation-stage` as worth taking together. Read one at a time, only
this one was wrong:

- `mitral-stenosis-stage|mvs-mg` — the field's own label says *"recorded but not
  used to stage"*, and dropping it removes a note about the entered value.
- `mitral-stenosis-stage|mvs-pht` and `aortic-regurgitation-stage|ars-lvesd` —
  both already carry a line in the browser ledger for dropping a sentence
  written *about* the entered value while the stage stands on other criteria.

Three of four were the dependent-line shape. Grouping tiles by family is a way to
find candidates, not a reason to treat them alike.

## The lesson

> **A guard has a scope, and the scope is clinical.** "Refuse when the
> discriminating measurement is missing" is right only where that measurement
> discriminates. Here it does so for symptomatic patients and nobody else, and
> the existing suite — not my reasoning — is what drew the line.
