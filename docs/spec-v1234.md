# spec-v1234 — the first section reads zero

`scripts/probe-envelope-unbounded.mjs` asks one question of the whole catalog:
**does a tile answer from a value an order of magnitude past a ceiling
`lib/bounds.js` already declares?**

It opened this run at **116 fields across 68 calculators**. This wave takes the
last eighteen tiles.

> **116 / 68 → 0 / 0.**

The probe's reach is unchanged and it says so: 396 fields map to one of 36
envelopes, 368 are testable against a worked example inside that envelope, none
is mis-mapped, and 28 carry no usable example. Zero is a statement about those
368, not about the catalog — [spec-v1231](spec-v1231.md) is the standing reminder
that a clean report is a claim about reach.

## The eighteen

Mostly one or two fields each, in a file of their own. Three are worth
remembering.

**`corrected-phenytoin` — the impossible value in a denominator.** The albumin
divides, so an impossible one does not produce an impossible level; it produces a
small **plausible** one. An albumin of 70 g/dL divided a measured 15 µg/mL down
to 1.06, and the tile read *"Corrected level below the 10-20 µg/mL therapeutic
range"* — which a reader acts on by giving **more** phenytoin.

**`snappe-ii` — the open end is the 0-point band.** Its pH item bands at ≥ 7.20 /
7.10 / below, so a pH of 80 scored zero points: the reassuring end of a neonatal
illness-severity score.

**`phoenix-sepsis` — the value was already being discarded.** Its own reader,
`pos(o.lactate, 0, 60)`, returns `null` for a lactate of 400, and `null` there
means *not measured*. So the impossible value was silently dropped and the other
organ systems scored as though the lactate had never been drawn —
[spec-v1217](spec-v1217.md)'s shape, hiding inside this one. The check has to
read the **raw** input to see it at all, and that is the general lesson: a guard
placed after a reader that already swallows the value can never fire.

## Two tests that pinned an impossible input

Both were using an impossible value as a convenience, to hold one term still
while another moved:

- `effective-osmolality` reached its lowest band with a **glucose of 0**. Now 36
  mg/dL — hypoglycaemic, survivable, same band.
- `corrected-phenytoin` showed its denominator never reaches zero with an
  **albumin of 0**. Now 0.5, the envelope's floor, and the test additionally
  asserts that 0 and 70 are both refused.

That makes four such tests across this run (`hacor`'s `hr: 0` and the four
overflow probes in [spec-v1224](spec-v1224.md) before them). The pattern is
consistent enough to name: **a test that needs a term held constant reaches for
an extreme, and the cheapest extreme is an impossible one.**

## The false positive this wave shipped, and the browser caught

The first run of `example-correctness` after these eighteen went red on
`phoenix-sepsis`, with the tile's whole answer replaced by:

> Input **below** the plausible range for INR (0.5 to 20); verify the units.

Its worked example leaves the INR out. `Number('')` is `0`, and `0` is finite, so
the blank field arrived at `boundsAdvisory` as a **measurement of zero** — which
is below several envelopes. The helper skipped `null` and `undefined` and not the
empty string.

This repo has hit that exact trap at [spec-v1038](spec-v1038.md),
[spec-v1040](spec-v1040.md) and [spec-v1213](spec-v1213.md), and `measured()` in
`lib/num.js` exists for it. All seventeen copies of the helper written in this
wave now skip a whitespace-only string, and every one carries the reason.

Worth stating: **the unit suite was green** on all 13,641 tests when this
shipped, because no unit test passes a blank string to a numeric field. The
browser sweep is what saw it — the gate whose whole job is driving each tile's
own worked example through the page the way a reader would.

## The whole run

| | start | now |
| --- | --- | --- |
| answers from an impossible value | 116 fields / 68 calculators | **0 / 0** |
| refusal with no way out | 89 rows | 55 |

Eleven waves, [spec-v1224](spec-v1224.md) to spec-v1234.

The second section is the open work, and
[docs/incomplete-input-program.md](incomplete-input-program.md) carries what is
left in it.
