# spec-v1801 — Half a field is not a field

> Status: **SHIPPED (2026-11-25)**: `probe-undeclared-cap` becomes a gate at **0 findings, 2 judged**,
> closing the vein [spec-v1777](spec-v1777.md) opened; and the envelope finder stops skipping a whole field
> because one of its edges is declared, which found five more. No tool's arithmetic changed; the catalog
> stays 2,390.

## The last of the declaration finders

`probe-undeclared-cap` has been a hand-run report since spec-v1777, when it found 1,004 fields whose
library enforces a cap that nothing declares. Every one of them is now declared — **2,667 of 5,189 number
fields, 4,896 edges** — and it joins `test/unit/finder-ledgers.test.js` as the fourteenth finder held to
zero.

Two rows are judged rather than declared, and both are the same shape: a cap that is **not a property of
the field**.

* `vo2max-exercise`'s treadmill time is refused above 35.3156 minutes because that is where the VO₂max it
  **reports** leaves its range. A literal there would be a derived number that drifts with the output.
* `site-of-care-compare`'s cost share carries **either** a coinsurance percent **or** a dollar copay, picked
  by the select beside it, so a union fails both ways round — and both gates said so, in that order.

Its report also changes shape. The DECLARABLE and DISAGREES sections are findings; ENVELOPE, UNIT-TOGGLED
and VARIES are the finder **showing its work** — why a cap was not offered — and they are now printed only
with `--all`. 377 rows of correct classification were burying two rows of work.

`gap` and `mgap` needed a declaration first, for the ceiling [spec-v1800](spec-v1800.md) gave them. It is a
literal rather than `bound: 'sbp'`, because naming the envelope would publish its **floor** as well, which
those two deliberately do not enforce — and `probe-declared-cap-configs` would then find the library
answering past a published bound. If the envelope's ceiling ever moves, `probe-adapter-only-bounds` finds
the copy.

## Half a field is not a field

Declaring that ceiling immediately broke something, in the most useful way: two of
`probe-envelope-unenforced`'s judged rows went **stale**. That finder skipped any field which "states its
own range" — and it read one declared edge as the whole field. So `gap`'s systolic, having gained a
declared ceiling, vanished from the finder entirely, taking with it the floor that is judged and the
reasoning behind it.

The skip is per **side** now. That is a reach increase of 81 fields and it found five more:

| Tool | Field | Was | Now |
|---|---|---|---|
| `anticoag-reversal` | INR | ceiling from the envelope, **floor 0** — an INR of 0.25 was reversed | both edges |
| `bmi` | height | a mathematical floor of 0.01 m and **no ceiling** — 5 m gave a BMI of 2.8, "Underweight" | the envelope's ceiling |
| `ebv-mabl` | minimum acceptable hematocrit | floor 0 — a target of 1.5% gave an allowable blood loss | `BOUNDS.hematocrit`'s floor |
| `snappe-ii` | lowest temperature | — | **judged**: spec-v1234 kept the floor off a neonatal lowest temperature |
| `iss-rts` | respiratory rate | — | **judged**: the RTS scores **apnoea**, a rate of 0 is a band of its own |

`bmi`'s floor stays an advisory beside the result rather than a refusal, which is the choice spec-v53 made
and this does not revisit. Four more matcher rules came out of the same run: a **sweat** chloride is the
cystic-fibrosis test and not a serum chloride, `priapism-gas` draws its blood gas from the **corpus
cavernosum** on purpose, an **MS-DRG relative weight** is a payment multiplier, and a **pKa** is a
dissociation constant that happens to be quoted at a temperature.

## The loop closes on itself

Adding those three library guards created three **new** undeclared caps, and `probe-undeclared-cap`
reported them within the minute. That is the system working rather than a problem: a guard the library
keeps is a range the agent surface should state, and the two finders now hand work to each other until
there is none. Both are declared; both finders are at zero.

One test had to change, and it is worth recording why. `test/unit/ebv-mabl.test.js` asserted *"zero start
Hct / weight → null fallback"* and passed `minHct: 0` **incidentally** while testing something else. The
subject is the start hematocrit and the weight; each is now tested with the other values valid, and the
refusal of a minimum acceptable hematocrit below the envelope gets a case of its own.
