# spec-v1788 — A perfect vaccine, assumed in silence

> Status: **SHIPPED (2026-11-24)**: 1 tool fixed, 3 read and left. No arithmetic changed; the catalog stays
> 2,390.

`scripts/probe-half-guarded.mjs` is a prioritiser rather than a defect list. Inside **one** tool it drops
each field in turn, and where dropping some fields makes the tool ask or disclose, the author has already
agreed that this class of gap matters here -- so a field that stays silent while the verdict moves is one
they did not get to. [spec-v1101](spec-v1101.md) built it after the same asymmetry appeared three times in
one programme, each time with the reasoning already written out for the half that was guarded.

Its header carries a review ledger, and the last entry was 2026-11-15
([spec-v1730](spec-v1730.md)): "a new row after this date is one nobody has read." Four tiles had appeared
since. One is a defect.

## The defect

`herd-immunity-threshold` shipped yesterday ([spec-v1772](spec-v1772.md)). It refuses a missing R0 and was
silent on the vaccine efficacy beside it.

With the efficacy blank, the tool compares coverage with the **threshold itself**:

```js
const target = needed === null ? threshold : needed;
```

The threshold is `1 - 1/R0`: the share of the population that must be immune. Reaching it by vaccination
needs `(1 - 1/R0) / efficacy` of the population covered, which is more -- unless the vaccine protects every
single person it reaches. So the blank was read as a perfect vaccine, and the worked example said:

> Herd immunity threshold 75% of the population immune, at an R0 of 4. Coverage entered reaches it.
> Coverage of 80% is at or above the 75% needed, by 5% of the population.

The same example **with** its 95% efficacy needs 78.9% and clears it by 1.1 points, not 5. The field's label
does say "optional; blank is a perfect vaccine" -- but the label is not the answer. A reader who skipped the
field is told they are 5 points clear of the target, and nothing in the reading mentions efficacy at all.
That is the silent-default shape specs v1684 to v1687 worked through: an absent optional field taking the
most favourable value, and the reading not saying so.

The reading now names the assumption, with the arithmetic rather than a caveat:

> No vaccine efficacy was entered, so this compares coverage with the threshold itself: the arithmetic for a
> vaccine that protects every single person it reaches. A real vaccine needs more coverage than the
> threshold -- at 90% efficacy, 75% / 90% = 83.3%. Enter the efficacy to compare against that figure
> instead.

At an R0 of 12 the same sentence ends `91.7% / 90% = 101.9%, which no coverage reaches`. The note appears
only when a coverage was entered, because with no coverage there is no comparison to qualify, and it stays
away entirely once an efficacy is given. **The arithmetic is unchanged** -- the threshold, the gap and the
verdict are what they were; what changed is that the reader is told what the comparison assumed.

## The three that were already right

Worth recording, because each is a good answer to the same question:

| Tile | The silent field | What it says instead |
|---|---|---|
| `hf-ef-classification` | baseline LVEF | "With no baseline measurement this is HFmrEF. The same 45 percent in a patient whose baseline was at or below 40 percent, and who rose at least 10 points from it, would be HFimpEF - a different category and a different conversation." |
| `osha-lead-airborne-pel-shift` | measured airborne lead | reports the day's permissible limit and its arithmetic, sets `exceeded: null`, and asks: "Enter the measured TWA for the day to compare it with the limit and the 30 µg/m³ action level." It never claims compliance. |
| `palm-coein` | leiomyoma tertiary type | leaves it out of the notation it prints -- `AUB P0 A0 L1(SM) M0` rather than `L1(SM type 2)` -- so the absence is on the page, in the answer itself. |

The ledger in the probe's header now records this pass and names all four, so the next session reads only
what is new.
