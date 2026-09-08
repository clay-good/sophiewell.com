# spec-v1140 — a risk category for a nodule nobody had described

[spec-v1139](spec-v1139.md) found `mehran-cin` listing its two measurements as
"missing" while six clinical factors sat outside the list. That is a question
worth asking of every tile: **does a tile's own missing-list cover its own
inputs?**

`scripts/probe-missing-list-reach.mjs` asks it — for each calculator that refuses
with a list, which of its declared fields does that list never name, and which of
*those* change the verdict when dropped. Five tiles; four were correct on
reading, and the fifth was this one.

## `eu-tirads`

```js
const key = o.appearance === ... === '' ? 'iso-hyperechoic' : String(o.appearance).trim();
```

`iso-hyperechoic` is EU-TIRADS category 3, so an empty form answered:

> **EU-TIRADS 3 — low risk.** Enter a size: fine-needle aspiration is indicated
> above 20 mm in this category.

The tile knows how to ask — it asks for the size in the same sentence — and it
had already assigned a risk category to a thyroid nodule nobody had described, on
the tool that decides whether to put a needle in it.

**Once the high-risk features are absent, the category IS the appearance**, so
there is nothing partial to report while it is unstated: no floor, no range, no
half-answer. It asks.

**But a high-risk feature still rules in without it** (rule 13). Microcalcifi-
cations, a taller-than-wide shape, irregular margins and marked hypoechogenicity
each override the basic appearance, so category 5 stands whatever the
echogenicity turns out to be — and the tile answers, as it should.

An unrecognised value stays an *invalid* input rather than becoming an absent
one; only genuinely empty counts as unstated.

## The four that were right

- `bickerstaff` — the anti-GQ1b antibody is explicitly a **supportive** test, and
  the tile says the core criteria are what it is missing.
- `migraine-ichd3`, `tension-headache-ichd3`, `indomethacin-headache-ichd3` — the
  criteria the probe dropped are checkboxes, and an unticked box is a real "no"
  (rule 4). Each reading names the criteria set it fell short of.

Four out of five rows read and left alone. The ratio is the point: this probe's
output is a reading list, not a defect list, and the cost of treating it as the
latter is a "fix" to a tile that was right ([spec-v1130](spec-v1130.md)).
