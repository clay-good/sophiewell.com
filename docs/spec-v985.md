# spec-v985 — The same blindness, in the two gates beside it

## Why

spec-v984 found a gate that reported clean while the defect it exists to catch was present: it
looked for issue-form fields by splitting on a literal two-space indent, and a valid four-space form
with a **missing `id:`** passed. The cause was not the indent. It was that **the probe had been
written against the files that existed rather than against the format**, and negative-tested by
changing a *value* rather than a *shape*.

Two gates shipped the same day carry the same shape. Neither finds anything today, and both would
go on reporting clean through an ordinary edit.

## `check-pa-rule-citations.mjs` — a bare URL was invisible

It read URLs out of a rule's citation only inside angle brackets, `<https://…>`. All **741**
citations are written that way, so the requirement found every one.

The first time someone writes *"see https://…"* without them, that URL is invisible: it never
reaches the ledger's registry, and so never reaches the monthly link check either. The gate would
report clean while a reader clicked a URL nothing had ever verified.

It now reads both forms, trims sentence punctuation from the end of a bare one (a trailing `/` or
`)` can be part of a real address; a `.` or `,` is not), and counts a URL written both ways in one
citation once. **45 distinct URLs across 741 citations — unchanged, which is the point.**

## `check-gates-documented.mjs` — one level of indirection hid a gate

It read `scripts/<x>.mjs` out of the `lint` string. Every gate is invoked directly today, so that
found all sixteen.

`package.json` already defines `check:pa-staleness` as its own script. The moment a step is factored
out behind `npm run check:pa-staleness` — an ordinary tidy-up — that gate vanishes from the check,
becomes anonymous again, and nothing says so.

It now follows `npm run <name>` through to the script it names, to a depth of eight, and does not
hang on a script that references itself or dead-end on one that names a script that does not exist.
**Sixteen gates — unchanged.**

## The rule this leaves behind

> **Negative-test a gate against the SHAPE, not just the VALUE.**

spec-v984's gate *was* negative-tested — by deleting an `id:` from a file already at the indentation
it understood. That passes while the gate is blind to every other indentation. Varying the value
proves the check runs; varying the format proves it runs on anything but today's files.

## Files

Changed: `scripts/check-pa-rule-citations.mjs`, `scripts/check-gates-documented.mjs`,
`test/unit/pa-rule-citations.test.js`, `test/unit/gates-documented.test.js`. New: this file.
