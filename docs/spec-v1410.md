# spec-v1410 — the last two open ranges

[spec-v1409](spec-v1409.md) closed three of the four cohort ranges and left two things open: the
`pospom` age floor, and whether the Reynolds Risk Score for men has an upper bound. Both are now
read from their sources.

| tool | range | source | what it did before |
|---|---|---|---|
| `pospom` | 18 and over | *"patients aged 18 yr or older"* (Le Manach Y et al, *Anesthesiology* 2016;124:570-579); the German validation applied it to adults 18 and over (*PLOS One* 2021) | clamped a younger age **up** to 18 and scored it, so a child was read on the adult table's first band |
| `reynolds-risk`, men | 50 to under 80 | *"men eligible for the current analysis were those younger than 80 at baseline"* (Physicians' Health Study II, *Circulation* 2008;118:2243-2251) | answered at any age above 50 |

The women's paper (*JAMA* 2007;297:611-619) states a floor and no ceiling, so the two sexes now
carry different shapes: `{ min: 45 }` for women and `{ min: 50, below: 80 }` for men. "Under 80" is
its own bound, not a max of 79: an age of 79 computes and 80 does not.

POSPOM's top age band is open-ended (96 and over), so nothing is clamped at the top either; the only
ceiling left is the physiologic envelope. Its field follows the same rule as the other
floor-only models — the input's own range is the envelope, and the floor lives in the label and in
the refusal.

With this, every row the envelope waves opened is either fixed or sourced: the page probe
`two-ranges-one-field` is back to zero.
