# spec-v1174 — 150,000 is what the report says

A US lab report prints a platelet count as **"150,000/µL"**. Every platelet field
in this catalog wants it as **150** — ×10⁹/L, which *is* ×10³/µL, the same
number in a different unit.

That is not a transposed digit and not a typo. It is the figure the reader is
copying, in the form the report gives it, and it is the single commonest unit
error in hepatology scoring.

In five fibrosis scores platelets sit in the **denominator**, or carry a negative
coefficient. So the wrong-unit figure drives the score toward zero — **which is
toward the reassuring band.** The unit confusion and the score's direction
conspire:

| Tile | Entered as the report reads it | It answered |
| --- | --- | --- |
| `fib4` | 150000 | *FIB-4 <1.45: **rules out** advanced fibrosis (NPV 90% per Sterling 2006)* |
| `apri` | 150000 | *APRI ≤0.7: below the Wai 2003 significant-fibrosis cutoff* |
| `nafld-fibrosis` | 200000 | *NFS **-2596.66**: excludes advanced fibrosis (F0-F2)* |
| `forns-index` | 280000 | *below 4.2 — significant fibrosis is **ruled out** (NPV about 96%)* |
| `lok-index` | 120000 | *below 0.2 — **cirrhosis is ruled out*** |

`nafld-fibrosis` printing **-2596.66** is absurd on its face; the other four are
not, which is what makes them worse.

## The bound already existed, and had three consumers

`lib/bounds.js` (spec-v53) is a table of 31 physiologic plausibility envelopes,
each with a source note, built so that *"a frankly-impossible input is never shown
as a silent, authoritative value"*:

```js
platelets: { min: 0, max: 2000, unit: 'x10^3/uL',
             note: 'platelet count; values above ~2000 are beyond recorded extremes' },
```

**Nothing in this wave invents a clinical number.** The ceiling was written,
sourced and correct, and the five tiles never read it — because the table's own
header says how it was meant to spread:

<!-- catalog-truth:historical -->
> The table is extended as tiles migrate (spec-v53 §4.3 — opportunistic, not a
> 255-tile sweep).

(Its own words, written when the catalog was that size.)

The migration did not happen. `lib/bounds.js` has **three consumers**
(`lib/clinical.js`, `views/group-e.js`, `views/group-v11.js`), against a catalog
of 1706 — and `fib4` and `apri` are *in* `views/group-e.js`, the file that already
imports `boundsAdvisory` and has an `adviseAll` helper twelve lines above them.

**A shared rule with an opportunistic migration plan is a shared rule that will
sit unused.** [spec-v1168](spec-v1168.md) said the same thing about normalising a
kind in one consumer; this is that lesson about a table of constants.

## The refusal does the conversion

A bound that only says "out of range" leaves the reader to work out what went
wrong. This one names the likely cause and gives the answer:

> A platelet count of 150000 is above ~2000, beyond recorded extremes. This field
> is in x10^9/L (the same as x10^3/uL), so a lab report reading 150000/uL is
> entered as 150.

A real extreme reactive thrombocytosis of 1200 ×10⁹/L is still inside the
envelope and still answered — the bound is for the frankly impossible, not the
unusual, and there is a test for exactly that.

## Both surfaces

The browser warning comes free once the bound is declared:
`watchDeclaredRanges` in `app.js` reads each input's `min`/`max` and renders
`.range-warning` above the answer, which `declared-ranges.spec.js` already gates.
So 18 platelet and WBC inputs now declare theirs (`BOUNDS.platelets.max` = 2000,
`BOUNDS.wbc.max` = 200).

That is a **disclosure, not a guard** — `rangeMessage`'s own comment says so, and
it makes no claim about what the answer below did with the value. The five
fibrosis libraries therefore also refuse, so the agent surface is not left
answering what the browser flags. `saps-ii` is the proof that the halves are
separate: it has carried `max: 200` on its WBC input all along and still returned
*"predicted hospital mortality 79.9%"* for a WBC of 15,000 through the agent
surface.

## What this leaves open, measured

The finder was: take each tile's worked example, multiply one numeric field by
1000, and ask whether it still answers.

- **2,533** numeric example fields tested; **1,181 still answer** at 1000× — so
  bounds exist widely and this is a real but partial gap.
- **366** of those move the verdict, across **197** tiles.
- Restricted to platelet and WBC fields declared in thousands: **66 tested, 26
  still answer.** This wave fixes the five rule-outs and declares the bound on 18
  inputs; the rest are recorded here rather than re-derived.
- On the page, **1,942 of 2,828 number inputs (69%) across 677 tiles declare no
  `max` at all** — invisible to `declared-ranges` by construction, which is
  [spec-v1169](spec-v1169.md)'s rule about a gate that compares a declared
  property. `app.js`'s 1e9 catch-all covers the paste and the exponent; it cannot
  see 150,000.

## Verification

`npm run release:check` green. `test/unit/platelet-unit-confusion.test.js` pins
each of the five to the reading it used to give, asserts the ceiling is the one
`lib/bounds.js` declares, and checks that a genuine extreme thrombocytosis still
computes.
