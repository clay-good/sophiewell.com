# spec-v931 — `0 + '70'` is `'070'`

## What this is

A latent arithmetic hazard in `psi()`, found by an audit that also produced a **correction to
its own premise**. Both are recorded, because the correction is the more useful half.

## The hazard

`psi()` built its total as `pts += age`. In JavaScript `0 + '70'` is the string `'070'`, and
every later `pts +=` concatenated instead of adding. A string age of `'70'` for a man with a
respiratory rate of 30 produced:

```
score: "07020"   band: "Class V (admit)"
```

The arithmetic gives **90 — Class III**, which is exactly what the tile's own worked example
documents. The library now converts the age once, and the Class I gate compares the converted
value.

## Nobody saw it, and saying otherwise would be wrong

- The **MCP** surface coerces a field declared `kind: 'number'` before calling `compute` —
  verified by calling `dispatch` with string inputs for another tile in the same list and
  watching it answer correctly where a direct library call did not.
- The **browser** reads numbers through `nv()` / `nvOrNull()`, both of which return a `Number`.

So this is defence in depth against a caller that does neither, not a fix for something a reader
or an agent hit. The tests say so in as many words.

## Converting it exposed the other half

`Number('')` is `0`. Converting the age turned a **blank** age into a newborn where an absent one
had given `NaN` — so the fix broke the spec-v930 invariant, and the gate written that morning
caught it in the same session:

```
these tiles read an empty string as a value, so an empty form answers from nothing: psi
```

PSI has no meaning without an age — age *is* the largest single term in it — so a missing age now
refuses rather than scoring, and the renderer prints the prompt in place of `PSI null - …`.
Blank and absent reach the same place again.

That is the invariant earning its keep: it caught a regression introduced by a fix to a different
bug, in a file the fix had every reason to touch.

## The audit, and what it was actually measuring

The scan compared every tile's answer for `7` against its answer for `'7'`. **112 differed** —
which looks alarming and is not: almost all are libraries that require a real `number` and return
a complete-the-fields prompt for a string. A refusal is not a wrong answer.

Only one tile answered *differently and confidently*, and that was `psi`. The narrower scan that
found it directly is worth keeping: **a numeric output field that comes back as a string of
digits.** Twenty-five tiles match, and twenty-four are classification tiles echoing an ordinal
label — `grade: "2"` is a category, not a quantity. The twenty-fifth was `score: "07020"`.

## Files

`lib/scoring-v4.js`, `test/unit/scoring-v4.test.js`, this file. No catalog change, no count
change.

## A second sweep, from the same idea

If a value the arithmetic accepts is not the same as a value the quantity admits, the obvious
next question is whether anything returns a **negative** mass, volume or rate. Feeding every tile
all-negative numbers and looking for a negative result in a dose-shaped field found **three**:

| Tile | Returned |
| --- | --- |
| `steroid-equiv` | −100 mg hydrocortisone converted cleanly to −25 mg prednisone |
| `benzo-equiv` | the same, on the Ashton table |
| `vasopressor` | a bag concentration of −16 mcg/mL, echoed back |

The dose and rate on `vasopressor` were already gated on `> 0`; the concentration was not. All
three now refuse. `benzodiazepine-equivalence`, the newer tile, already had the guard — which is
where the wording for the others came from.

`test/mcp/blank-is-absent.test.js` carries the sweep as a second assertion, because it is the
same idea as the blank invariant it sits beside.
