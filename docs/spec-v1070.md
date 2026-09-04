# spec-v1070 — reviewing the gate I had just written

[spec-v1067](spec-v1067.md) shipped the one-blank-field gate. This is the
self-review pass over it, and it found one way the gate could have failed a build
for a reason that had nothing to do with the code under test.

## The baseline is half of every judgment

The gate's whole question is **did the answer change** when one field was
cleared. It reads the tile's answer twice: once with the worked example intact,
once with the field blank. Both reads wait 120 ms.

The 120 ms figure is inherited from the empty-form sweep, where it replaced 25 ms
because four tiles reported differently between two runs of the same commit — a
gate that lies in both directions. But that sweep only reads *after* clearing.
This one also reads *before*, and nothing checked that the before-read had
anything in it.

If the baseline read landed before the tile finished its first render — a lazily
imported module, a picklist shard, a loaded CI runner — `base` would be empty.
Every subsequent read on that tile would differ from it, and the tile's fields
would be reported as recomputing from a zero. **A red build caused by load, not
by a calculator.**

The gate and the probe now both skip a tile with no baseline answer to compare
against. That is the only honest thing either can say about it: with nothing to
compare, there is no change to detect.

## Which direction a gate should fail in

Worth writing down, because the fix could have gone the other way. The reading
*after* clearing was already guarded (`!after || after.length <= 12` skips), and
a stale read there produces a **false negative** — a defect missed. The baseline
was unguarded, and a stale read there produces a **false positive** — a build
failed for nothing.

Those are not equally bad. A gate that occasionally misses a defect still catches
the next one, and the ledger and the probe beside it are there to sweep up. A
gate that occasionally fails at random teaches everyone to re-run it, and a gate
people re-run until it passes is worse than no gate at all.

## Also checked, and clean

- **Neither `ASKING` nor `DISCLOSING` carries the `g` flag.** A `/g` regex is
  stateful under `.test()` — alternate calls return alternate answers — and both
  sweeps call `.test()` in a loop. Both are `i` only, and repeated calls on the
  same string were confirmed to agree.
- **The gate still catches what it was built for.** Re-verified after the change
  by removing the `egfr` age guard from spec-v1064 and watching it fail with
  `egfr|age`, then restoring it.
