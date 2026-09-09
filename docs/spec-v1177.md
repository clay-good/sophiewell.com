# spec-v1177 — tranche one, and the helper that already existed

[spec-v1176](spec-v1176.md) measured it: **124 of the 194 fields that refuse an
out-of-range value describe it as a missing one**, because `pos(v, lo, hi)`
returns `null` for a blank, for a non-number *and* for a value outside its
bounds, and every caller reads `null` as absent.

This is the first tranche, and it corrects the recommendation that spec shipped
with.

## The helper it said to write already existed

spec-v1176 recommended adding `rangeFault(value, lo, hi, name, unit)` to
`lib/bounds.js`. **`boundsAdvisory(key, value)` has been in that file since
spec-v59**, and it already returns the sentence wanted, built from the envelope's
own note:

> Input above the plausible range for serum albumin (0.5 to 7 g/dL); **verify the
> units.** Values outside 0.5-7 indicate a unit or entry error.

*"Verify the units"* is precisely the thing the reader needs to hear, and it was
written years before the defect was measured. Writing a second helper would have
been the duplicated-rule shape — **in the wave whose whole subject is a shared
rule nobody uses.** The recommendation is corrected in spec-v1176 rather than
quietly dropped.

## Three guards, in two files

`naples`, `far` and `agr` each read a serum albumin in g/dL. An albumin of **40**
— the g/L figure an SI report prints for 4.0 g/dL — used to get:

> Enter serum albumin (g/dL).

and now gets the sentence above. `pos` is untouched, so the other 408 call sites
are unaffected; each guard asks `boundsAdvisory` first so the **specific** fault
wins over the general one.

## The bug I put in the fix

The first version consulted `boundsAdvisory(Number(o.albumin))` unconditionally.
`Number('')` is **0**, and `boundsAdvisory(0)` reads as *"below the plausible
range"* — so a **blank** albumin stopped saying it was missing and started
reporting itself as an impossible value.

That is [rule 7](incomplete-input-program.md), the defect this entire programme
exists to remove, introduced inside the fix for its exact mirror. It was caught
by the test asserting the blank case, which is why that assertion is in the file
and not left implicit. The guard now checks the raw value is present before
consulting the envelope at all.

**A fix for "a measurement read as a gap" is one keystroke away from "a gap read
as a measurement."** Test both directions in the same test.

## Why the migration is per-guard

`lib/nutrition-v276.js` reads `pos(o.albumin, 5, 80)` — **that tile's albumin is
in g/L**, and its message says so. Applying the g/dL envelope there would
manufacture a false refusal on every correct entry. `lib/ltcga-v178.js` takes
both, as `albuminGL` and `albuminGdl`.

So a helper-level change would have been wrong, and the 121 remaining rows are
121 readings of a unit, not a sweep.

## Verification

`npm run release:check` green. `test/unit/range-not-missing.test.js` covers all
three guards in all three states — out of range, blank, and correct — and pins
the correction about `boundsAdvisory` so it is not re-derived.
