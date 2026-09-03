# spec-v1017 — The fourth wave, and the other half of the stack-trace refusals

## The finding

Re-running the cleared-form sweep after spec-v1016 left 101 tiles still answering. Most are
legitimate — a checklist instrument nobody has ticked really does score 0 — but five were the same
arithmetic defect, and three of those reached a **conclusion**:

| Tile | With nothing entered |
| --- | --- |
| `corrected-phenytoin` | *"Corrected phenytoin: 0.0 µg/mL. Corrected level below the 10-20 µg/mL therapeutic range."* |
| `potassium-deficit` | *"Serum K is at or above target — no deficit by this estimate."* |
| `iv-osmolarity` | *"0 mOsm/L — below ~900 mOsm/L; peripheral administration is generally acceptable."* |
| `burn-uop-target` | *"Hourly urine-output target: 0.0 mL/hr"* |
| `fluid-balance` | *"Net fluid balance: 0 mL"* |

`iv-osmolarity` is the one to look at twice: that sentence is a decision about whether an infusion
needs a central line, made from an empty bag.

Each now asks for what it needs. `iv-osmolarity` asks for **at least one** component, because a bag
really can be dextrose alone — the empty case is the one that has no osmolarity.

## The other half of spec-v1015

Those same tiles printed a second sentence beside the answer:

> Input below the plausible range for weightKg (0.3 to 500 kg); verify the units.

spec-v1015 rewrote the exception messages from `lib/num.js` and missed this one — a different
function, `boundsAdvisory` in `lib/bounds.js`, on the same reader-facing surface. Every bound in
that table already carries a note opening with the human name of the quantity, so the sentence now
takes the label from there:

> Input below the plausible range for **weight** (0.3 to 500 kg); verify the units. A value below
> ~0.3 kg usually means the unit (g/lb vs kg) is wrong.

The lesson is the one spec-v1015 should have applied to itself: **fixing the central guard is not
fixing the surface.** Ask what else writes into the same place.

## Noted, not fixed

`code-blue-clock` reports *"Code time: 154174.2 min"* on arrival. That is not an empty-form defect —
it is a worked example carrying an absolute start timestamp, so its meaning decays with wall-clock
time. Every tile whose example pins a date has the same problem, and finding them is a sweep of its
own.

## Proof

`test/integration/no-answer-from-nothing.spec.js` now covers 31 tiles across four waves, plus one
case asserting the advisory names the quantity and never the variable. One unit test asserted the
old wording (`adv.includes('scr')`) and now asserts the new one. 13,096 unit tests and the full lint
chain pass.
