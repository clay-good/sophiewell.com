# spec-v1230 — three ways an impossible number stayed invisible

Five derivations in `lib/clinical.js`, and each hid its impossible input
differently.

**An average has no band.** `map` given 3000/80 mmHg printed *"MAP: 1053.3
mmHg"* — impossible in, impossible out, and nothing beside it for the number to
look wrong against.

**An open-ended category reads as normal.** A PaO2 of 7000 mmHg made the A-a
gradient come out **negative** (−6900) and the P/F ratio read **"Normal"** —
the reassuring end of an ARDS severity scale, because the Berlin categories are
open at the top.

**A power law compresses.** The CKD-EPI creatinine term means an SCr of 250
mg/dL lands at an eGFR of ~0, which is indistinguishable from the dialysis-range
value a real 8 mg/dL gives. The impossible input does not produce an impossible
output; it produces a plausible one.

## The comment that named the defect

`cockcroftGault` carried the diagnosis three lines above it:

```js
// A scr in [0.01, 0.1) is mathematically fine but clinically impossible; the
// renderer shows boundsAdvisory('scr', scr) (lib/bounds.js) next to the result.
```

The renderer does. The library said nothing, so an agent calling
`compute_calculator` got the clearance with nothing beside it —
[spec-v1205](spec-v1205.md)'s cross-surface gap, written down in this file at
the exact line where it was happening.

## What was left alone

The **hard** floors stay where [spec-v53](spec-v53.md) §3.3 put them. `scr` is a
denominator, so its 0.01 floor lives in the compute function and is not replaced
by `BOUNDS.scr.min` (0.1) — the clinical envelope is layered over it, not
substituted for it. `pfRatio`'s FiO2 floor of 0.01 likewise stays: spec-v1146
relies on it to reject a blank field, and `BOUNDS.fio2.min` (0.21, room air)
would refuse it for the wrong reason.

## A defect this program shipped, three waves ago

`views/group-e.js` has a `safe(out, fn, deriv)` wrapper whose third argument
exists to clear the derivation block when the compute throws. **Eight renderers
with a derivation never passed it** — so a refusal appeared *above the working
of the last good answer*, which is exactly the shape
[spec-v1071](spec-v1071.md) recorded — *"a calculator that refuses must take its
working with it"* — on `cockcroft-gault` among others: "Enter an age" printed
over `CrCl = (140 − 60) × 80 kg / … = 88.89 mL/min`.

Three of those eight — `corrected-sodium`, `osmolal-gap`, `winters` — got a
throwing envelope guard in [spec-v1225](spec-v1225.md), from this program, two
waves ago. Adding the refusal is what made the stale derivation reachable. All
eight now pass `deriv`.

## And one this wave shipped, one wave ago

The same probe caught `metabolic-syndrome`'s systolic-BP field the moment
[spec-v1229](spec-v1229.md) gave it an envelope: the field declared `0–300` and
the envelope said `20–300`. It now takes both ends from `BOUNDS.sbp`, and the
diastolic field beside it takes `BOUNDS.dbp` rather than staying open at the
top, so the two pressures are declared the same way.

Twice in three waves, adding a refusal published a second range on a field that
had only ever had one. Worth remembering when the next wave adds one.

## Ledger

`scripts/probe-envelope-unbounded.mjs`, first section: **66 fields / 45
calculators → 54 / 37.**
