# spec-v1137 — the note said the choice was not inferred

From the twelve rows [spec-v1136](spec-v1136.md) left open, the two acid-base
compensation tiles. `resp-acidosis-compensation`, PaCO2 60 and a measured HCO3 of
26:

```
no choice   Expected HCO3 26 mEq/L (acute, +1 per 10 mmHg): the measured 26
            matches the expected 26, consistent with appropriate compensation.
chronic     Expected HCO3 32 mEq/L (chronic, +4 per 10 mmHg): the measured 26 is
            below the expected 32, suggesting a superimposed metabolic acidosis.
```

`o.chronic === true || o.chronic === 'true'` made everything else — an unstated
choice included — **acute**, and the band printed the word. That is a statement
about how long this patient's acidosis has been going on, made by the tool and
rendered as though somebody had said it (rule 11).

## The same promise, written down three times

```
note:    "The acute-versus-chronic choice is yours, not inferred."   (both tiles)
guard:   "Enter measured PaCO2, measured HCO3, and choose acute or chronic."
```

The note **says** the choice is not inferred, in as many words, while the line
above it infers it. The guard's message **lists** the choice among the things it
needs, while letting it through missing — rule 23, *when a guard's message lists
what it needs, the list is a claim*.

This is [rule 24](incomplete-input-program.md) at its strongest: the sentence that
names a default is the one to distrust. Here it was not a comment for maintainers
but reader-facing copy, and the promise it makes is exactly the one the code
broke.

## The fix, and where it does not apply

The choice does not always decide. Where the measured bicarbonate falls the same
side of both expectations, the verdict is identical either way and the tile
answers, naming both rather than one assumed one:

> Expected HCO3 26 mEq/L acute **or** 32 mEq/L chronic: the measured 12 mEq/L
> reads the same either way — suggesting a superimposed metabolic acidosis.

Where they disagree, it asks, and the message carries both numbers so the reader
can see the size of the question:

> Choose acute or chronic: the two are compensated at different rates, and on
> these numbers they disagree about whether the bicarbonate is appropriately
> compensated. Acute expects 26 mEq/L and chronic expects 32 mEq/L, against a
> measured 26 mEq/L.

The entry guard now lists only what is actually missing.

## `Number('')` is 0 — and `v === 'chronic'` is `false`

Both surfaces collapsed the select to a boolean before the library saw it:

```js
chronic: selVal('ra-ch') === 'chronic'                        // renderer
{ dom: 'ra-ch', ..., to: (v) => v === 'chronic' }             // adapter
```

A blank arrives as `false` — which is not "unstated", it is **"acute, stated"**.
The guard would have been unreachable from either surface, exactly as
[spec-v1131](spec-v1131.md)'s `Number(null) === 0` and
[spec-v1132](spec-v1132.md)'s `Number('') === 0`. This is the third form of the
same mistake in seven waves, and the general shape is worth stating once:

> **A surface that narrows a value to a boolean destroys the difference between
> "no" and "not said" before any guard can see it.** Pass the value; let the
> library decide what counts as stated.
