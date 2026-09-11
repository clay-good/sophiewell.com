# spec-v1238 — a sixth hand on the same sentence

`test/lib/asking-language.js` holds two vocabularies. `ASKING` is *this tile is
refusing to answer*; `DISCLOSING` is *this tile answered, and said what it was
missing*. Both are consumed by whole-catalog gates and probes, and the file
carries a rule at the top: **measure what a new phrase moves before adding it.**

It has been extended five times, each time because the house said one thing in a
way the list did not know — `can only add` ([spec-v1094](spec-v1094.md)), `is
needed` ([spec-v1097](spec-v1097.md)), `not stated`
([spec-v1164](spec-v1164.md)), the *not recorded / graded / rated / measured*
participle family ([spec-v1195](spec-v1195.md)).

This is the sixth, and the narrowest.

## What the list did not know

Four tiles say something **stronger** than "the field is missing". They say the
missing field *cannot change the verdict*:

```
duke-treadmill   Duke treadmill score between -4 and 4: moderate risk (DTS -10
                 to +4) whatever the angina index turns out to be, 95% 5-year
                 survival (Mark 1987).

elapss           ELAPSS at least 37/40: aneurysm growth risk ~42.7% at 3 years,
                 which holds whatever the location and the population turn out
                 to be.
```

`duke-treadmill` is worth reading in full, because it is the shape this whole
programme has been looking for, already built: it computes the band at both ends
of the unstated field's range, **refuses** when the two ends disagree — *"it is
worth up to 8 points, which puts this test between −4 and 4 … moderate risk at
one end and high at the other"* — and answers with the disclosure above when they
do not. It was being counted as answering in silence.

## The pattern has to be narrow

The bare word `whatever` appears in **30 library files**, and nearly all of them
are static prose about the instrument:

> a disoriented patient scores it whatever the cause
> a lung score of 2 or 3 is severe whatever the other organs show

Matching that would exempt a tile for a sentence that was in its note before any
field was dropped — the trap [spec-v1196](spec-v1196.md) named. Only the two
forms these four tiles use are added: `holds whatever` and `turns out to be`,
which between them appear in **four** library files in code, all four genuine
disclosures.

## Measured, as the rule requires

| | before | after |
| --- | --- | --- |
| `probe-half-guarded` | 21 calculators | **18** |
| `probe-omitted-field-decides`, section 2 | 33 fields / 14 calculators | **31 / 12** |
| `probe-omitted-field-decides`, section 3 | 55 fields / 37 calculators | **51 / 35** |

Five rows, on `duke-treadmill`, `mascc`, `elapss` and `phases`. Every one is a
tile disclosing correctly; none of them answers anyway.

13,653 unit tests unchanged, and the lint chain — which includes the gates that
consume `ASKING` — is clean.

## What is left in probe-half-guarded

Eighteen calculators, and most are **correctly silent**: the field the probe
names is one the tile's own label calls optional, supplementary, or reported
separately — `ipss`'s quality-of-life item ("reported separately"),
`posas`'s overall opinion ("not in total"), `spetzler-martin`'s age band
("supplementary"), `mayo-uc`'s endoscopy subscore ("optional").

`adrenal-ct-washout` was checked by hand and is correct too: it names which
washout it computed, and omitting the unenhanced attenuation is the ordinary way
the relative washout is used.

The ones still worth reading are where the silent field is a **scored component**
— `hear`'s history/ECG/risk items, `ph-hemodynamics-2022`'s wedge pressure and
cardiac output, `nen-who-grade`'s mitotic count, `nichd-fhr`'s late
decelerations. Those need a decision per tile, not a sweep.
