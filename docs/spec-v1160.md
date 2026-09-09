# spec-v1160 — a careful fallback the browser could not reach

`predicted-spirometry` was the second row worth reading from
[spec-v1159](spec-v1159.md)'s probe run. Its library is **already right**, and says
so at length:

```js
// The ETHNICITY default is deliberately left alone. It is not a silent one:
// an unrecognised group falls back to the source's own other/mixed set and
// says so, in `ethnicityFallback` and in a note the renderer prints. That is
// what this programme asks for, and refusing it would break a case GLI-2012
// itself provides for.
```

All true. **And unreachable from the browser**, because the select opened on
*"Caucasian"* with no other way to leave it — and Caucasian is a specific
coefficient set, not the documented fallback.

The difference is not cosmetic. For a 40-year-old man of 175 cm:

| Group | Predicted FEV1 |
| --- | --- |
| Caucasian | **4.08 L** |
| other / mixed (the fallback) | 3.80 L |
| African-American | **3.48 L** |

0.60 L between the ends, and **percent-predicted is what stages COPD**. Preselecting
one group assigns a stage on a characteristic nobody was asked for.

A *"Not stated (uses the other/mixed set)"* option makes the library's own path
reachable, which is all this needed.

## The note it prints was written for a different case

The fallback note read *"Ethnicity group **not in the GLI-2012 sets**"* — which
describes an unrecognised group. Now that the select can be left unset, the same
branch covers *"not stated"*, and that is the reading the number depends on. It says
both, and says what choosing would change:

> Ethnicity group not stated (or not one of the GLI-2012 sets): the other/mixed
> coefficient set was used. GLI-2012 is group-specific and the predicted values
> differ materially between sets, so choose the group when it is known.

**A disclosure written for one way of arriving at a branch does not automatically
describe the other.** When you make a path newly reachable, re-read what it says.
