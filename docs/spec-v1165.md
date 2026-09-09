# spec-v1165 — a negative culture nobody had reported

First read of `probe-omitted-field-decides`'s **third** section since
[spec-v1104](spec-v1104.md) took it at 32 rows. It is 58 now, and this is the
section spec-v1104 found `phoenix-sepsis` in — so weak by construction is not the
same as empty.

## `eos-calculator`

The Kaiser neonatal early-onset-sepsis model has **three** maternal GBS levels, and
the code read them as two:

```js
const gbsPos = o.gbs === 'positive' ? 1 : 0;
const gbsUnk = o.gbs === 'unknown'  ? 1 : 0;
```

Both zero is the **negative** coefficient. So a status nobody had reported was
scored as a negative culture — the most favourable of the three — when the model
carries its own **Unknown** level for exactly that state.

| GBS status | EOS risk (this worked example) |
| --- | --- |
| negative | 0.35 per 1,000 |
| unknown | 0.36 per 1,000 |
| **absent** | **0.35 — the negative coefficient** |
| positive | 0.62 per 1,000 |

An unstated status takes the Unknown coefficient now, and the reading says which it
used: *"The maternal GBS status was not stated, so the model's UNKNOWN-status
coefficient was used, not a negative culture."* An **explicitly** stated unknown says
nothing extra — it was a real answer.

The browser had the same problem from the other side: the select opened on
*"Negative"*, a maternal culture **result**, preselected for a patient nobody had
asked about (rule 8). *"Unknown / not reported"* leads now — a real level of the
model rather than a blank.

## The antibiotics, named rather than re-mapped

`abx` has no *"not reported"* level; its reference level **is** *"none, or any
antibiotic under 2 h before delivery"*. So an absent value is not re-mapped — it is
named: *"Intrapartum antibiotics were not stated, and the model has no category for
that — this reads as none given, which is its reference level."*

**Where the source provides a category for "not known", use it. Where it does not,
say what the reference level is.** The two are different fixes and the difference is
in the source, not in the code.

## The newborn examination was already right

`EOS_LR[o.exam]` is `undefined` when the category is absent, and the function
refuses: *"Choose the newborn clinical-examination category."* Worth recording,
because it is the same tile and the opposite outcome.

## The rest of the section

The other 55 rows are, so far as this read goes, tiles behaving correctly —
`elapss` and `phases` showing the ranges [spec-v1159](spec-v1159.md) gave them,
`hear` and `niss` disclosing *"at least"*, `iol-power` naming *"Emmetropic"*,
`adrenal-ct-washout` naming which washout formula it used, the two respiratory
compensation tiles saying the measured value *"reads the same either way"*, and
`aims-tardive` saying *"global severity not rated"*. `findrisc` is the one still
worth its own read: an unstated sex scores 13 where male scores 9, because the waist
bands are sex-specific.
