# spec-v1167 — rule 23's fourth false positive, and the first that is about the rule

`probe-message-promises.mjs` checks rule 23: *when a guard's message lists what it
needs, the list is a claim.* The programme map records it as having found **zero**,
with all 28 of its first run's rows being the finder being wrong — booleans,
disjunctive messages, and scaffolding words.

Run again after this session, it printed **four**. All four are the finder being
wrong again, and this time about the rule rather than the matching.

## What the four say

```
mehran-cin, dropping the eGFR
  "Mehran score 11: high risk … Scored from 1 of 2 measurements and 2 of 6 clinical
   factors; the rest can only raise it (hypotension, the balloon pump, age over 75,
   anemia not stated)."

rome-ecopd, dropping the oxygen saturation
  "Rome proposal: moderate COPD exacerbation — 3 of the five variables are above
   cutoff. Graded with oxygen saturation unmeasured; it can only raise it."
```

Both name exactly what they did not have and which way it can move. Both are
already-high readings that **rule in**, which is the floor.

## The rule the probe was enforcing was not rule 23

Rule 23's concern is a message that lists what it needs and a tile that then answers
without them — **silently**. A tile that answers and says what it was missing has
kept the promise the programme actually asks for: rule 12 prefers a disclosure to a
refusal wherever the missing value is not expected to be there, and rule 3 says an
incomplete score may rule in.

The probe only ever asked `got.valid === true`. It now also asks whether the partial
reading asks or discloses, using the same `test/lib/asking-language.js` vocabulary
every other sweep here reads.

**4 → 0**, and the reach line carries the four rather than dropping them:

```
116 of their non-required, non-boolean fields are named in it by label.
4 named field(s) answer partially and SAY SO, which keeps the promise
rule 23 is about: the concern is a tile that answers without them SILENTLY.
```

## Negative-tested

With `rome-ecopd`'s disclosure deleted — the tile answering the same partial score
and saying nothing — the probe prints it again, and only it:

```
1 field(s) are NAMED in a tile's own refusal message and not required by it.
  rome-ecopd|rome-spo2 (Oxygen saturation)
```

Restored, back to zero. A finder that cannot be made to speak is not evidence that
there is nothing to say.
