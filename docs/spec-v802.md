# spec-v802.md — Gardner-Robertson hearing class

> Status: **SHIPPED (2026-08-26).** Builds the `gardner-robertson` tile. Catalog
> **1593 → 1594**, group G.

## Why

The catalog already computed one of this tile's two inputs (`pure-tone-average`) and already
graded the tumor that makes it matter (`koos-schwannoma`, vestibular schwannoma). It could not
turn those into the answer everyone actually asks: **is this hearing serviceable?**

## What it does

| Class | Pure tone average | Speech discrimination | |
| --- | --- | --- | --- |
| I | 0–30 dB | 70–100% | good to excellent |
| II | 31–50 dB | 50–69% | **serviceable** |
| III | 51–90 dB | 5–49% | non-serviceable |
| IV | ≥ 91 dB | 1–4% | poor |
| V | not testable | 0% | none |

**The poorer of the two measures governs.** When they fall in different classes the tile says
so, names both, and takes the worse — and that single rule is why **serviceable hearing needs
a pure tone average of 50 dB or better AND a discrimination of 50% or better, both rather than
either.**

Three tests carry that: the poorer measure winning in both directions; excellent
discrimination failing to rescue a poor pure tone average and vice versa; and every boundary
on both scales, including that **0% discrimination is class V, not IV**.

**Worked example:** PTA 45 dB with 80% discrimination → the average says class II, the
discrimination says class I → **class II, serviceable**, with the disagreement reported.

## Posture (spec-v97)

Grades an audiogram already performed. It says nothing about the cause of the hearing loss or
what to do about it.

## Files

- `lib/gardner-robertson-v802.js` — `gardnerRobertson()`, `GARDNER_ROBERTSON_NOTE`.
- `views/group-v802.js` (RV802) — two audiometric numbers and a not-testable checkbox; a11y-checked.
- `mcp/adapters/gardner-robertson-v802.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, all five classes, the poorer-governs rule, related (pure-tone-average, koos-schwannoma, hhie-s).
- `test/unit/gardner-robertson.test.js` — 7 tests (matching measures, poorer-governs both ways, both-required serviceability, every boundary on both scales, not-testable overriding everything, invalid input).
- `docs/spec-v802.md` (this file).

## Sourcing (spec-v97)

Gardner G, Robertson JH. *Ann Otol Rhinol Laryngol.* 1988;97(1):55-66 (PMID 3277525). The
full five-class table and the tie-break rule were taken from a published reproduction that
states it explicitly ("if PTA and speech do not correlate, use lower class"). The **direction**
of that tie-break was then confirmed independently rather than assumed: a second source
defines serviceable hearing as a discrimination of ≥ 50% *and* a pure tone average of ≤ 50 dB.
Requiring both is only consistent with the poorer measure governing, which is the reading
shipped here.
