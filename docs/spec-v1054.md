# spec-v1054 — Press the button

## The hole spec-v1053 pointed at

`intubation-difficulty-scale` rendered **no answer at all** and `example-correctness` passed it. The
documented numbers were satisfied by the values sitting in its input boxes.

That fallback exists for a good reason (spec-v752): an example's documented output routinely names
its own inputs — *"15 kg × 20 mL/kg = 300 mL bolus"* — and an input's value is not text, so
`innerText` never sees the 15. But it means **a tile that renders nothing can satisfy the sweep from
its own form.**

## How many

Sixteen tiles with a documented example produce nothing in the result region. Four were my probe's
regex colliding with real answers that begin "Type" or "Complete". The other twelve are real, and
eleven of them have the same shape: **they compute on a click.**

Ten are document builders — *"Build printable letter"*, *"Generate checklist"*, *"Build printable
wallet card"* — whose `expected` string is an instruction rather than an output, which is honest for
what they are. The eleventh is `lab-interpret`, whose `expected` **is** an output:

> A1C 5.4% within range (4.0-5.6%).

and which renders, once you press *Interpret values*:

> Hemoglobin A1C: 5.4 % · Within range · Reference range: 4.0–5.6

Everything the tile documents is right there. spec-v1048 had put it in `SCENARIO_ONLY` — declared
non-coverage — when the fix was to press the button the tile asks you to press.

## The change

When the result region is empty after the example is applied, the sweep clicks the single button
whose label begins `Build`, `Generate` or `Interpret`, then reads. One click, only on the tiles that
need it, on a label the tile itself chose. `lab-interpret` leaves `SCENARIO_ONLY` and is checked like
anything else.

Verified the way a gate change has to be: with the click disabled, `lab-interpret` **fails**. The
click is doing the work, not decorating it.

## The rule

**A gate with a fallback needs to know when the fallback is carrying it.** Reading input values when
the output comes up short is a reasonable accommodation; doing it for a tile that produced no output
is a pass with nothing behind it. Where a fallback exists, ask what a completely broken tile would
look like to it — and here, the answer was "fine".
