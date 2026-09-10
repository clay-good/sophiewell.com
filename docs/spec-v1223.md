# spec-v1223 — the split that cut a sentence in half

[spec-v1222](spec-v1222.md) taught `addedText` to find the row edge in a reading
assembled from DOM nodes, by splitting where a digit meets a letter. It shipped
with this argument:

> Finer splitting is the safe direction. Both sides are split the same way, so a
> chunk unchanged in both is still filtered out … It removes false "added" text;
> it cannot hide real added text.

The argument is true **only while a chunk boundary is a real boundary**, and
`(?<=\d)(?=[A-Za-z])` also fires inside a unit:

```
cmH2O  ->  cmH2 | O
```

`driving-pressure` reports *"Driving pressure (dP): (plateau must exceed PEEP)
cmH2OStatic compliance: — mL/cmH2ODynamic compliance: (enter peak pressure)"*.
Cut there, the sentence that carries "enter peak pressure" no longer lines up
against the baseline the way it did, the vocabulary stopped seeing that the tile
had **asked**, and `required-field-agreement` went red on two rows.

## The correction

Split only where the digits are a **standalone number** — preceded by something
that is not alphanumeric:

```js
(?<=[^A-Za-z0-9]\d{1,9})(?=[A-Za-z])
```

That tells `gap: 26Albumin` (a value, then the next row) from `cmH2O` (a subscript
inside one token). `1.40Pure` still splits; `mL/cmH2O` does not.

## What actually went wrong

Not the regex. The regex was a guess, and guesses are fine — what failed was the
**verification**.

`one-blank-field.spec.js` was run, all four shards, and spec-v1222 said so at
length. `ownsTheGap` also calls `addedText`, and `required-field-agreement` calls
`ownsTheGap`, and that gate was **not** run. One of two consumers was checked and
the commit message described it as checking the gate. The one that was skipped is
the one that failed.

Worse, the fragmentation risk had been considered and waved away — *"the phrase
generally survives because the disclosure text itself is new"* — which is not
analysis. Running the second gate took four minutes.

**The rule this leaves:** when a shared helper changes, the thing to enumerate is
its **callers**, transitively, not the one test that names it. `grep -rn
addedText` and `grep -rn ownsTheGap` would each have taken a second.

## Proof

The `driving-pressure` reading is now a unit test, so the case that went red is
pinned rather than remembered — and the first version of that test asserted
against a *truncated* reading that omitted "enter peak pressure", failed for the
wrong reason, and was corrected rather than loosened.

Both gates pass: **8 shards, `required-field-agreement` and `one-blank-field`
together, all green**, including the shard that failed. 13,581 unit tests pass.
