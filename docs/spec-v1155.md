# spec-v1155 — the backlog is empty

Ninth and last batch out of [spec-v1146](spec-v1146.md)'s backlog. **62 (tile,
field) pairs at the first run; 0 left.**

## `Number(null)` is 0, and the guard written for it could never fire

`capraScore` has exactly the guard this programme asks for:

```js
const cores = nonNeg(o.cores);
if (age === null || psa === null || … || cores === null || cores > 100) {
  return { valid: false, message: 'Enter age, PSA (ng/mL), … and the percent of positive biopsy cores (0-100).' };
}
```

And `nonNeg` was:

```js
const nonNeg = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};
```

`Number(null)` is **0**, which is finite and ≥ 0 — so it returned zero, `cores ===
null` never fired, and a blank positive-core percentage scored the **favourable**
level (under 34%, 0 points). The tile answered *"CAPRA 3 of 10 — intermediate
risk"* as if the biopsy had been counted. It is rule 7 in its purest form, and the
proof is next door: **the identical helper in `lib/ob-v138.js` was fixed at
[spec-v930](spec-v930.md) with the exact guard this copy lacked.** One rule written
twice, and only one copy learned.

`intIn` beside it has the same hole. Its only caller is saved by an
`allowed.includes(n)` on lists that start at 1, so nothing was wrong — guarded
anyway, so the next caller does not inherit it.

## `acetaminophen-nomogram` — a rule-out on the antidote

```js
num('hours', hours, { min: 4, max: 24 });  num('levelUgMl', levelUgMl, { min: 0, max: 2000 });
```

The hours are bounded at 4, so a blank time already threw. The level is bounded at
zero, so a blank one passed:

> Below the treatment line: **NAC not indicated** by the nomogram for a single
> acute ingestion.

A rule-out on the acetylcysteine decision, from a paracetamol level nobody had
drawn. **The first required field guarded and the second not, for the ninth time in
this programme** — and the ninth is the one that decides an antidote. An
undetectable level is a typed 0 and still answers.

## `anticoag-reversal` — rule 23, and a fix on both surfaces

The guard's own message said *"Enter weight (**and INR for warfarin**)"* and then
checked only the weight, so a blank INR reached the warfarin path as `0`:

> INR <2: 4F-PCC dosing not defined by the label band; reassess indication.

The INR is read **only** on the warfarin path, where it picks the band (25, 35 or
50 units/kg). So it is required there and not read elsewhere (rule 25) — enforced
in the library, so the agent surface agrees in both directions: a dabigatran call
with no INR answers, a warfarin call without one refuses. The adapter also carried
`to: (v) => v || 0`, a coercion that turned the blank into a zero before the
library saw it; that is gone.

## Four more declarations

| Tile / field | Why the browser was right |
| --- | --- |
| `rosendaal-ttr` / target INR low, high | the library defaults them to 2.0 and 3.0 and the reading **names the range it used** (*"16 of 20 days in range 2-3"*) — the [spec-v1133](spec-v1133.md) model |
| `weight-dose` / dose unit | a display label, no part of the arithmetic; the page falls back to *"units"* and prints it |
| `nsa-cost-share` / billed charge | the protected cost-share is computed off the QPA and never reads the charge — it decides only the prohibited balance-bill figure, which the reading now says is not shown |

## The last two rows were the vocabulary

`posas-patient-scar` refuses in as many words — *"Rate pliability (stiffness) from
1 to 10"* — and `ASKING`'s rating pattern is
`(?:rate|score) [a-z0-9 ]{1,30}\b(?:from|on the) \d`. **No parentheses in the
character class**, so an item that names itself and then explains itself in a
bracket did not match.

A generalisation of the pattern already there rather than a new phrase, like
[spec-v1102](spec-v1102.md)'s article and [spec-v1114](spec-v1114.md)'s adjective
before it. Measured before adding, as the rule requires: it moves exactly **two**
rows, both `posas-patient-scar`, and changes nothing in either empty-form sweep or
the one-blank-field gate.

## Where the programme stands

| | |
| --- | --- |
| required fields the catalog declares | 4,222 |
| (tile, field) pairs the probe clears | **2,043** |
| pairs that answered without a required field | **62 → 0** |

Of the 62: **35 were tiles that should have asked** and 27 were **declarations
that should not have required** — nine of them on fields whose own label already
said *optional*, *default*, or *leave blank*. Both halves were fixes, and the gate
said so from the beginning.

The gate still tests one field per tile, and the probe beside it tests all of them.
Widening the gate is now possible without ledgering anything — a later wave's
choice, not a debt.
