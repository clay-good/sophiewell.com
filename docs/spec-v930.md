# spec-v930 — An empty string is not a zero

## The finding

`Number('')` is `0`. A tile that reads its inputs with a bare `Number()` therefore treats an
empty form as a form full of zeros, and answers with confidence from nothing.

Measured across all 1685 exposed calculators, comparing "every field set to `''`" against "every
field absent": **36 tiles reached different outcomes**. Two mattered enough to fix on sight.

| Tile | An empty form reported |
| --- | --- |
| `tb-testing` | **"TST: 0 mm vs cutoff 0 mm → POSITIVE"** — a positive tuberculin test, declared from nothing |
| `mods` | **"MODS 12 of 24: ICU mortality ~25%"** |

Confirmed in the browser, not just in the library: every tile opens pre-filled with its worked
example, so a reader meets this by **clearing a field** — which is exactly what someone does
before typing their own numbers. Clearing every number input still produced *"GRACE 59, Low"*,
*"Bishop: 5, Unfavorable"*, *"Oakland 27"*, *"SNAPPE-II 103/162: high illness severity"*. An
agent calling the MCP surface with empty strings meets it immediately.

## What changed

**Fixed (5):** `tb-testing`, and the four tiles from this session's own work that had the same
bug — `vod-sos`, `kings-college-nonapap`, `reference-change-value`, `auto-peep`. Each now treats
a blank, whitespace-only or absent input as missing, and says what it needs instead of answering.

**Gated:** `test/mcp/blank-is-absent.test.js` pins the invariant for every exposed calculator —
computing with every field `''` must reach the same outcome as computing with every field absent.
It says nothing about *which* outcome is right (a checklist may legitimately answer 0 from an
empty form), only that a blank and an absent input cannot mean different things. Negative-tested:
reintroducing the `tb-testing` bug fails it by name.

**Drained (12 more), by guarding four shared readers in `lib/scoring-v4.js`:**
`checkOrdinal`, `checkOrdinalRange` and `checkSigned` now refuse a blank the same way they
refuse an absent value — `Number('')` is 0, which *is* an integer, so an unanswered item scored
as a zero while a missing one threw. That covers the eight paediatric pain and sedation scales
at once. Four more had a refusal path that a blank slipped straight past:

| Tile | A blank form used to report |
| --- | --- |
| `rass` | "RASS 0: in the light-sedation target band" |
| `sas-riker` | "SAS 4: calm and cooperative; goal sedation" — it fell through to a **default** of 4 |
| `cfs` | "CFS 1 (Very fit): not frail" |
| `bps` | "BPS 3 of 12: acceptable pain" — clamped to 1, "relaxed", the exact default its guard existed to prevent |

**Ledger:** 31 → **16**. `KNOWN` may only shrink, and a second test fails if an id in it has
been fixed and not removed. Three more went in a second pass, and they are the ones that show why the
rest are not one-liners:

- **`mods`** — its six organ helpers already returned 0 for a non-finite input, so *absent* was
  fine. `Number('')` is 0, and 0 falls off the bottom of every band, so a **blank** form scored
  the worst value in several organs: "MODS 12 of 24: ICU mortality ~25%". Guarding the helpers
  fixed it with no change to the return shape.
- **`grace`** and **`oakland`** band with bare `if/else` chains and no guard at all, so an absent
  input fell through to the **worst** band and a blank one took the **best** — `grace` returned
  "High (>3%)" from nothing and "Low (<1%)" from an empty form; `oakland` swung across the
  safe-discharge cutoff. Both now refuse, which meant returning `score: null` and teaching their
  renderers not to print "GRACE null" above the prompt.

What is left are more of that second kind: banded scores whose libraries take an already-typed
number, where the fix changes the return shape and its renderer. That is the follow-up this list
holds.

## A reversal worth recording

`test/unit/tb-testing.test.js` carried a deliberate test asserting that an empty string reads as
0 mm, "matches the renderer default, not NaN". Avoiding a NaN band was right; reading blank as
zero was not the way to do it, because with the cutoff blank too the tile reported a POSITIVE
result from an empty form. The prompt path already answers the NaN concern. The test now asserts
the opposite and says why, and a second case pins that a **real** zero is still a real answer —
0 mm against a 10 mm cutoff is negative.

## Files

New: `test/mcp/blank-is-absent.test.js`, this file.
Changed: `lib/tb-testing.js`, `lib/vod-sos-v907.js`, `lib/kings-college-nonapap-v910.js`,
`lib/reference-change-value-v920.js`, `lib/auto-peep-v928.js`, `test/unit/tb-testing.test.js`.

No catalog change, no count change.
