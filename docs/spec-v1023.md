# spec-v1023 — An exemption granted for one number covered the whole sentence

## The finding

`test/integration/example-correctness.spec.js` drives every tile's documented example and asserts
the numbers in its `expected` string appear in what the tile renders. Tiles whose `expected` text
contains numbers the tool never computes are allowlisted in `SCENARIO_ONLY`, each with a reason.

`preg-dating`'s reason was:

> preg-dating — "T1 discordance" is a trimester label

True of the `1` in `T1`. Not true of the rest of that sentence, which reads *"LMP-derived EDD
2026-09-29; CRL-derived GA at ultrasound ~11w 5d; small T1 discordance (**~3 days**), within
accepted limit"* — and the tile was printing a discordance of **172 days** with the opposite advice
(spec-v1018). One label bought the whole tile a pass.

That is the shape this repo has a name for: **an escape is not a licence**. The narrowest thing that
could be exempted was one token, and a tile was exempted instead.

## The fix

`numericFacts` now skips a digit that is **glued to a letter** — `T1`, `G2`, `S3` are labels, not
values — so the exemption is per token, and `preg-dating` comes out of `SCENARIO_ONLY` and back
under the sweep. The other three tiles in that group stay: `45 CFR 164.508` and "all 5 Boles 2007
criteria" are bare numbers in prose, and no token rule separates them from a computed cell.

## What this does NOT do, verified

**It would not have caught spec-v1018's bug.** I reintroduced the defect and re-ran the sweep: it
passes.

The reason is the matcher, not the exemption. A fact is satisfied if *any* number anywhere in the
output falls within tolerance — and the buggy output was *"Discordance: 172 days (T3 threshold
21)"*, whose numbers are `172, 3, 21`. The `3` in `T3` sits inside the `~3` fact's ±1 window, so the
assertion passed on a coincidence.

So the sweep's real limit is now written down: **it asks whether the documented numbers appear
somewhere, and a wrong answer can satisfy that by accident.** Tightening it means matching a number
against the words it belongs to, which is a different and much larger piece of work than this one —
and the sort of change that wants its own spec, because a wrong tolerance across 1,704 examples
fails a lot of CI runs before it helps.

## Proof

The sharded sweep passes with `preg-dating` under coverage. The negative test above is reported
because it is the honest result: this narrows an over-broad exemption, and it does not make the
gate catch the bug that exposed it.
