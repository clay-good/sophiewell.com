# spec-v1100 — the other half of the same divisor

A pass through the finder's weakest section, which
[spec-v1098](spec-v1098.md) called *"worth a pass; not a defect list"*. That was
right about most of it and wrong about one row.

## `abi` divided by a brachial pressure nobody took

The ankle-brachial index divides the higher ankle pressure **by the higher of
the two brachial pressures**. The code reads:

```js
const higherBrachial = rb != null || lb != null ? Math.max(rb || 0, lb || 0) : null;
```

A brachial nobody measured contributes **0** to that maximum. So one brachial can
only make the divisor **smaller**, which can only make the index **larger** — and
a larger ABI reads as *less* disease. On the tile's own numbers, dropping one
brachial moved a leg from **0.79** to **0.90**: still mild-to-moderate, but a
full band's worth of ground given away, and further along the same scale it moves
severe PAD into mild-to-moderate.

[spec-v1067](spec-v1067.md) already added exactly this caveat for a missing
**ankle** pressure, with the same reasoning written out. The brachial half of the
same divisor was left silent. **One tile, two gaps, one guarded** — the third
time this programme has found that shape, after `scorad`
([spec-v1093](spec-v1093.md)) and `dka-hhs` ([spec-v1099](spec-v1099.md)).

Where it stays quiet, and where it does not:

| Reading | Disclosed? | Why |
|---|---|---|
| severe PAD (≤ 0.40) | no | a bigger divisor cannot talk it further down; already the floor |
| borderline / mild-to-moderate / normal | yes | the reassuring side, which is what a missing divisor buys |
| non-compressible (> 1.40) | **yes** | an inflated index reads as calcification and sends the reader to a toe-brachial index they may not need |

That last row is the one worth keeping in mind: this defect is not purely
"under-calls disease". Inflating a ratio moves it toward *both* ends of a banded
scale, and only one of those ends is the safe direction.

## The rest of the section, read and left alone

| Tile | Why it is flagged | Why it is right |
|---|---|---|
| `phoenix-sepsis` | dropping the MAP lowers the score | it still meets septic shock — ruling **in**, the floor |
| `qp-qs` | no pulmonary-vein PvO₂ | the field's own label says "(default 98)", and the tile applies the documented default |
| `ph-hemodynamics-2022` | no wedge pressure | it answers "Pulmonary hypertension, **not yet classified**" — a refusal |
| `popq-staging` | dropping point D | the stage does not move; only which point is the leading edge |
| `smart-cop`, `mayo-uc`, `iol-power`, `tls-cairo-bishop`, `pk-suite`, `toxic-alcohol` | see [spec-v1099](spec-v1099.md) | already read and documented there |

Several of these rows exist only because the candidate generator always tries
**0** and large multiples: a brachial pressure of 400 mmHg, a PvO₂ of 1, a MAP of
0. Those are not patients. The generator's limits are recorded in
[spec-v1099](spec-v1099.md), and the discipline they call for — read the tile
before patching it — is what left six of these seven alone.
