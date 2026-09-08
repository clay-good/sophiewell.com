# spec-v1139 — the same narrowing, one level down, inside a tile

[spec-v1136](spec-v1136.md) found a probe that filtered `kind === 'number'` and
had therefore never examined an enum. `mehran-cin` is the same shape **inside a
calculator**: a guard written for the number fields, which stopped there.

```js
// spec-v1007
const MEHRAN_MEASUREMENTS = { contrastVolume: [...], egfr: [...] };
const missing = Object.keys(MEHRAN_MEASUREMENTS).filter(...);
// "The six clinical factors are pickers: 'no' is an answer."
```

That last sentence is true **on the page**. The reader sees `No` selected beside
hypotension, the balloon pump, heart failure, age over 75, anemia and diabetes,
and can change any of them. It is the disclosure spec-v1007 relied on, and it is
still there.

**The agent surface has no picker.** All six are `required: false`, and omitting
`chf` is not the same statement as sending `chf: 'no'` — it is five points:

```
worked example          Mehran score 15: high risk: ~26.1% nephropathy,
                        ~1.09% dialysis.
same, minus chf         Mehran score 10: moderate risk: ~14.0% nephropathy,
                        ~0.12% dialysis.
```

A ninefold change in the dialysis estimate, from a field nobody said anything
about, with nothing in the reading to say so. This is
[rule 18](incomplete-input-program.md) read the other way round: *a guard in a
renderer is a guard for one surface* — and so is a disclosure that consists of a
rendered control.

## The fix is the treatment the measurements already had

Every Mehran term adds points or leaves them alone, so an unstated factor leaves
the total a **floor**, exactly as an unentered contrast volume does. The existing
design already withholds the low band while a measurement is missing and answers
the higher bands with a note; the six factors now sit in the same rule:

> Mehran score 10: moderate risk … **Scored from 1 of 6 clinical factors; the
> rest can only raise it** (hypotension, the balloon pump, heart failure, age
> over 75, anemia not stated).

The page is untouched: its selects always send a value, so no reader sees a new
sentence.

## Two tests relied on the default; none asserted it

Both failures were the [spec-v1138](spec-v1138.md) *relied-on* kind — band-edge
tests that omitted the six factors because their subject was the 5/6 boundary.
They state them now. Worth noting because the ratio keeps holding: of the nine
pre-existing tests these waves have broken, **three asserted the harmful default
and six merely leaned on it.** The first kind is the finding; the second is
housekeeping, and telling them apart before editing is what keeps the
housekeeping from quietly deleting a finding.
