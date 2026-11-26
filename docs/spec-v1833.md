# spec-v1833 — Both reading lists, sorted

> Status: **SHIPPED (2026-11-26)**: the second of the two large reading lists is filtered for the direction
> that can hurt and comes back clean, and `probe-unguarded-sibling` is re-measured after this session's new
> envelopes — 16 modules to 15. No code changed. The catalog stays 2,390.

## The filter, applied to the other list

[spec-v1824](spec-v1824.md) sorted `probe-omitted-field-decides`'s third section by the one shape that can
hurt — the reading with a field **omitted** reads reassuring, the reading with it **filled** does not — and
found four rows, all correct. `probe-omitted-item` is the sibling list, 118 rows, and it had never been
sorted at all.

Seven rows survive the filter, and **five were already judged elsewhere**: `yellow-fever-case-def`,
`occupational-dose-limit-check`, `iv-phosphate-order-check` and `cleanroom-class-check` sit in
`probe-omitted-field-decides`'s section-1 ledger, and `nichd-fhr` is the tile
[spec-v1239](spec-v1239.md) narrowed the vocabulary for.

The two that were new are both [spec-v1196](spec-v1196.md)'s shape — **a reading that only lost a clause**:

- `aa-pf-suite` returns `aaGradient: null` when the PaCO2 goes. The P/F ratio beside it doesn't need one,
  and the filter matched the word *"Normal"* in **that** output.
- `digoxin` returns `levelInterp: null` when the level goes. Its dose guidance comes from renal function,
  and *"Normal clearance"* is what the filter matched.

Nothing is fabricated in either: an output is **absent**, which is the safe direction and the one the
vocabulary was taught to recognise. So the filter is spent on this list too, and both headers now say so —
what remains in either has no signal to sort by and is a judgement per tile.

## And a probe that measured its own progress

`probe-unguarded-sibling` names the guard that is **already in the file, one function away**. It read 16
modules and 23 functions this morning; it reads **15 and 19** now, because the cholesterol, CRP and urine
creatinine envelopes of [spec-v1823](spec-v1823.md) and [spec-v1825](spec-v1825.md) closed one module and
four siblings outright. Those four were never a judgement call — they were waiting on a key `lib/bounds.js`
did not have, which is exactly what the probe is for and why its residue was worth sourcing rather than
re-reading.
