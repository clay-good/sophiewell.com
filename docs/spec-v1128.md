# spec-v1128 — the three [spec-v1127](spec-v1127.md) deferred

[spec-v1127](spec-v1127.md) checked five tiles for monotonicity, fixed the two
the check flagged, and left three plain floors "recorded here as the next pass
rather than done in a wave whose subject is the check itself".

[spec-v1125](spec-v1125.md) said **a deferral is only honest if something comes
back for it**. This is that.

| Tile | The graded input | And it read |
|---|---|---|
| `clif-c-aclf` | six organ systems | *CLIF-C ACLF 35 (CLIF-OF 6/18)* — the minimum, from six ungraded systems |
| `hscore-hlh` | organomegaly, cytopenia count | *HScore 236: estimated HLH probability ~99%* |
| `emergency-surgery-score` | transfer source, white-cell band | *ESS 2 of 29 — low predicted 30-day mortality* |

## `clif-c-aclf`: the fallback is the low BOUND, not zero

```js
const lvl = (v, lo, hi) => { … if (!Number.isFinite(n)) return lo; … };
…
for (const k of organs) clifOF += lvl(o[k], 1, 3);
```

The CLIF-OF grades each organ **1 to 3**, so the fallback is `1` — *this organ
was graded and is working*. Six of them gave the minimum sub-score of 6 of 18,
and the tile printed a specific CLIF-C ACLF number off it. **This tile has no
band at all**: the number *is* the reading, which is why the
[spec-v1114](spec-v1114.md) distinction between the verdict and the figure is the
whole of the fix here.

## `hscore-hlh`: the argument was already written, one line above

This tile has guarded its five **measurements** since it was written, and its
refusal says exactly why:

> The 5 unentered values can only add points, so a partial score cannot make
> reactive HLH unlikely.

The two graded **selects** beside them — organomegaly, and the number of
cytopenic lineages — were not guarded, and `pick` returns 0 for a key it does not
hold, which is *no organomegaly* and *one lineage*.

That is *"one tile, two gaps, one guarded"* ([spec-v1101](spec-v1101.md)) for the
**sixth** time in this programme, and the sixth time the reasoning for the
guarded half was sitting in the file. The two selects now join the same `missing`
list the measurements use — the mechanism was already there and the fix is six
lines.

## `emergency-surgery-score`: two selects among twenty checkboxes

Twenty of its inputs are checkboxes and were right all along (rule 4). Two are
graded selects — the transfer source and the white-cell band — and both fell
through to their zero level.

**A tile is not one kind of control**, and the boolean majority being correct is
not evidence about the minority. That is the same split as
[spec-v1115](spec-v1115.md)'s five tiles and [spec-v1122](spec-v1122.md)'s
`qsofa-sofa`, and it is now frequent enough to be the first thing to check on any
tile that mixes them.

With these three the finder's *"unanswerable and moves the answer"* list is down
to rows that are correct or documented.
