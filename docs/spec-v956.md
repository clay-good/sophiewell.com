# spec-v956 — Naming the shape a pair is, so a hundred of them can be read

## The finding

spec-v947 left the finder with **106 unruled pairs** and no way to tell them apart. Reading them
means opening two adapters each, and most of the list is not worth opening: seven ICHD-3
headache tiles alone produce **21 pairs**, all scoring 1.00, all obviously distinct.

They score 1.00 for the same reason `cincinnati` and `cpss` scored **0.00**. The finder drops
the parenthetical, and the parenthetical is doing the work in both directions:

```
ATLAS Score (C. difficile Infection)          ->  atlas       dropped 1.00
ATLAS Score (AF Recurrence After PVI)         ->  atlas       kept    0.33
CPSS (Cincinnati Prehospital Stroke Scale)    ->  cpss        dropped 0.00
Cincinnati Prehospital Stroke Scale           ->  cincinnati, prehospital, stroke
```

**The two readings disagreeing is itself the signal**, and which way they disagree says which
shape the pair is.

## The rule that took two tries

"Kept high, dropped low" is the obvious test for the second shape, and it is wrong. It fires on
any two tools sharing a clinical domain in their brackets — *Egami Score (IVIG Resistance,
Kawasaki)* against *Kobayashi Score (IVIG Resistance, Kawasaki)*, two different instruments for
one problem — and it flagged **20 pairs**, burying the real ones.

The shape that hides duplicates is narrower: **one tile's parenthetical contains the other
tile's whole name**. An acronym outside, the same instrument spelled out inside. That name must
be at least two distinctive words — *MELD-Na (Sodium-Augmented MELD)* and *MELD-XI (MELD
excluding INR)* each hold the other's single surviving token, `meld`, and one shared word is a
family name, not an identity.

## What that leaves

| Label | Pairs | What a reader does with it |
| --- | --- | --- |
| `ACRONYM COLLISION` | **39** | dismiss — the brackets are what tell them apart |
| `NAMES THE OTHER IN PARENTHESES` | **2** | read both adapters; this is where the duplicates were |

Both of the two were read:

- **`cam` / `cam-icu`** — Inouye 1990 for a patient who can be interviewed, Ely 2001 for a
  ventilated one who cannot. Different papers, different validation populations, different
  fields. **Distinct.**
- **`tyg-bmi` / `tyg-index`** — Simental-Mendia 2008 takes two inputs and returns ~8.9; Er 2016
  multiplies by BMI, takes three, and returns ~223. One is the other times a third variable,
  which puts it on a different scale. **Distinct.**

Unruled **106 → 104**, and the shape that produced four retirements in spec-v948 is now empty.

## Proof

| Check | Result |
| --- | --- |
| `node scripts/find-duplicate-tiles.mjs` | 125 pairs, 33 ruled, **39 labelled a collision, 0 left in the sharp shape** |
| the CPSS pair | `NAMES THE OTHER IN PARENTHESES`, symmetric |
| the Egami / Kobayashi pair | no label — the looser rule flagged it |
| the MELD pair | `ACRONYM COLLISION`, not the sharp shape |
| `find-duplicate-tiles.test.js` | 12 pass |
| `npm run lint`, `npm run build` | clean |
