# spec-v1068 — the rest of the rules that were switched off

[spec-v1067](spec-v1067.md) turned on `no-undef`, which had never been enabled
even though `eslint.config.js` had carried a hand-maintained list of forty
browser globals *for that rule and no other*. That raised an obvious follow-up:
what else is off?

## What `eslint:recommended` would add

Measured by extending it temporarily and counting. 111 problems, in six rules:

| Rule | Count | Verdict |
|---|---|---|
| `no-unused-vars` | 91 | not enabled — a large diff across the tree, and none of the samples read as a live defect. Left as a separate piece of work. |
| `no-useless-escape` | 8 | not enabled — cosmetic |
| `no-empty` | 5 | not enabled — deliberate empty catches |
| **`no-dupe-keys`** | **4** | **enabled** |
| `no-prototype-builtins` | 1 | not enabled |
| **`no-regex-spaces`** | **1** | **enabled** |
| `no-control-regex` | 1 | **deliberately not enabled** — see below |

## `no-dupe-keys`, and why it is worth a rule for four harmless hits

None of the four was a live defect. All four are now cleaned anyway, because the
shape they share is one that would not be harmless:

- **`lib/feno-v888.js`** assigned `band` twice in one returned object. The second
  wins, so the short key (`low` / `high` / `intermediate`) never left the
  function. That turns out to be the *correct* house shape — `band` carries the
  reader-facing sentence and `bandLabel` carries the short form — so the dead
  first assignment was removed rather than the live second one, and the output is
  byte-identical.
- **`lib/ficat-arlet-v344.js`** and **`lib/outerbridge-v337.js`** both wrote
  `{ 0: '0', …, '0': '0', … }`. An object key is always a string, so those were
  the same property written twice. The map accepts arabic or roman input either
  way.
- **`test/unit/clinical-v5.test.js`** passed `na` twice in one assertion, so the
  test was always about a non-numeric sodium rather than the `140` written first.
  Rewritten to say what it does.

The reason to hold the rule is the case it has not caught yet: **a second
renderer for a tile id that already has one**. The view modules are large object
literals keyed by tile id, and a duplicate there makes the first renderer stop
existing, silently, with no other gate looking. Negative-tested by adding a
duplicate key and watching eslint fail.

## `no-regex-spaces`, on a gate

The single hit was in `scripts/check-catalog-truth.mjs`, which matched catalog
entries with two *literal* spaces of indentation. That gate's reliance on a
literal indent is already on record as fragile — a valid four-space entry with a
missing id once passed it. Rewriting the two spaces as ` {2}` is exactly
equivalent and says out loud how many there are. The gate still reports the same
count over the same catalog.

## `no-control-regex` stays off

`report-worker.mjs` matches control characters **on purpose**, to keep them out
of stored report text. Enabling the rule would mean an inline disable comment on
a line whose whole job is the thing being warned about — a rule that has to be
suppressed where it fires is not earning its place.

## What `no-unused-vars` turned up before it was set aside

The 91 hits were not enabled, but they were read. Seventy are dead local helpers
(`r2`, `fin`, `on`, `pos` imported and never called) — cosmetic. The other
twenty-one are *values computed and then discarded*, which is where a dropped
condition would hide. One of them was worth the look.

**`scripts/check-page-copy.mjs` defines a check it never runs.** `PROVENANCE` and
`overlaps()` were written to catch two labels on one page that read as the same
question — "provenance words are what made the old pair indistinguishable" — and
nothing ever calls `overlaps`. A check that exists, carries a comment explaining
the failure it prevents, and is never invoked is the same shape as `no-undef`
being off: the guard reads as present.

This one, though, should stay off. Run over all 1,706 tool pages it flags four,
and all four are false positives:

| Page | Labels it pairs | Why it is wrong |
|---|---|---|
| `opioid-conversion` | "Source opioid and route", "Total source daily dose" | "source" is the drug being converted **from** |
| `benzodiazepine-equivalence` | "Source benzodiazepine", "Source dose" | same |
| `apap-24h-max` | "Source 1 dose", "Source 2 dose", … | a paracetamol-containing **product** |
| `hlh-2004` | "NK-cell activity LOW OR ABSENT by local laboratory reference", "No evidence of malignancy" | "reference" and "evidence" used clinically |

Zero true positives, because the word list assumes "source" means citation and in
this catalog it usually means a drug. The identical-label check beside it
(`duplicateLabels`) and the de-collision work it drove already cover the pair
this was written for.

So it is **left in place, annotated with the measurement**, rather than deleted
or enabled — the next reader finds the number instead of re-deriving it. That is
the difference between this and `no-undef`: both guards were absent in effect,
but only one of them was worth switching on.
