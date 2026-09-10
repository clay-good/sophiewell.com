# spec-v1202 — the guard that is already in the file

Five times in this run the same thing was true, and each time it was found by
reading rather than by a check: **a module's own guard, one function away.**

| | guarded | did not |
|---|---|---|
| `lib/acidbase-v129.js` ([v1198](spec-v1198.md)) | `stewartSidSig`, which *ends on the rule* — "Guard the set, not the field that was reported" | the four gas functions beside it |
| `lib/scoring-v4.js` ([v1199](spec-v1199.md)) | `mews`, since [v1181](spec-v1181.md) | `news2` — directly above it, and named **inside `mews`'s own comment** as sharing the defect |
| `lib/hepgi-v93.js` ([v1200](spec-v1200.md)) | four of `harvey-bradshaw`'s five subscores | the stool count |
| `lib/idcrit-v99.js` ([v1199](spec-v1199.md)) | `saps-ii`'s age, clamped to 130 | its other eleven variables |

[spec-v1101](spec-v1101.md) built `probe-half-guarded.mjs` to ask this **within**
one tile. This asks it a level up, between the exported functions of one module —
because a module is written by one hand at one sitting, and a guard in one
function and not its neighbour is almost never a considered difference.

## The finder

`scripts/probe-unguarded-sibling.mjs`. The question is static, so it is a grep
and runs in under a second: no calculator is executed.

```
13 module(s), 41 function(s).

Reach: 17 of the modules in lib/ call one of 5 watched guards;
14 of those export more than one function and are comparable,
and 162 sibling(s) were skipped for reading no numeric input at all.
```

Two things it had to be taught, both found by running it:

- A function that **is** one of the guards is not a function that calls one.
  `lib/num.js` exports `inputFault` itself, and the first run had it reporting its
  own neighbours for not calling it.
- A sibling that reads no measurement cannot be missing a measurement guard. 162
  were skipped on that, and the reach line says so rather than letting the list
  look shorter than the question.

## The first row, and why it is not the shape it looks like

`lib/acidbase-v129.js` now guards five of its six exports. The sixth,
`urineOsmolalGap`, printed this from a urine sodium entered as 2000:

> Urine osmolal gap **-3767.1** mOsm/kg (calculated osm 4167.1; **~NH4+ -1883.6
> mEq/L**): a narrow gap, consistent with impaired distal acidification (renal
> tubular acidosis).

A negative ammonium, reported as a measurement, with a diagnosis attached — and
the diagnosis is the wrong way round: **every** negative gap falls in the narrow
band, so an entry error reads as renal tubular acidosis.

The fix is **not** the one its siblings got. The envelopes in `lib/bounds.js` are
serum ranges, and this is a urine chemistry — urine sodium runs well outside the
serum range in health, so applying `boundsAdvisory` here would be inventing a
clinical number, which [spec-v1189](spec-v1189.md)'s rule forbids. What is said
is only what the arithmetic already shows:

> The urine osmolal gap comes out negative (-3767.1 mOsm/kg), and half a negative
> gap is not an ammonium concentration. Every negative gap falls in the narrow
> band, which reads as renal tubular acidosis, so this is an entry to check rather
> than a result to read.

A gap of **exactly nothing** is still a real reading — the narrow band — so the
test is on the rounded gap. A measured osmolality equal to the calculated one
lands a hair below zero in floating point and rounds to `-0`, which prints as
"0" and is not `0` to anything comparing it; both returned values are normalised.

So `acidbase-v129.js` stays on the list, correctly fixed, because it is fixed in
a way the probe cannot see. **A row is a suspect**, and this is the first one: it
made the right function worth opening, and the answer was a different fix.

## Left open

Twelve modules, forty functions. `lib/clinical.js` is twenty of them on its own
and most will be nothing — `convert`, `convertTemp`, `bsaDuBois` take a
measurement in one unit and give it back in another, where an envelope has no
verdict to protect. The rows worth opening first are the ones whose siblings were
guarded *recently*, since those are the halves someone was in the middle of.
