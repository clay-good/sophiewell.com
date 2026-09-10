# spec-v1207 — the criterion an impossible number takes away

Every envelope wave so far has fixed the same direction: an unmeasurable input
lands in the top band, adds points, and the tool reports a severity nobody has.
`refeeding-risk` is the mirror, and it is the reason
[spec-v1206](spec-v1206.md) named it as the one to do next.

## The flip

NICE CG32 counts criteria. Two of them are BMI thresholds — `< 16` is major,
`< 18.5` is minor — and an impossible BMI matches **neither**:

```
BMI 17, 12% unintentional weight loss  ->  High risk of refeeding syndrome
                                           (0 major + 2 minor NICE criteria)
BMI 9999, same patient                 ->  Not high risk by NICE criteria
                                           (0 major + 1 minor)
```

A mistyped BMI does not inflate the answer. It **removes a criterion**, and the
error lands on the reassuring side of a syndrome whose whole point is to be
anticipated before feeding starts.

The two numeric fields beside it go the ordinary way: a weight loss of 9999% and
9999 days without intake each add a major criterion, so either one alone reads
*High risk* from a number nobody measured.

## The envelopes

`lib/bounds.js` declared none of the three. Following
[spec-v1189](spec-v1189.md) — enforce what is written, decide nothing clinical —
each new bound is a documented extreme rather than a normal range:

| key | range | why that boundary |
| --- | --- | --- |
| `bmi` | 5–200 kg/m² | the lowest BMI in a surviving adult is ~7.5 in published anorexia-nervosa case reports; the heaviest recorded human, Jon Brower Minnoch, reached ~185 kg/m² |
| `percentWeightLoss` | 0–100 % | not a clinical judgment: you cannot lose more than the whole of your body weight |
| `daysNoIntake` | 0–400 days | the longest documented medically-supervised fast is Angus Barbieri's 382 days (Stewart & Fleming, *Postgrad Med J* 1973) |

A BMI of **200** is the top of the envelope and still scores. A test pins that
edge, because where a guard *stops* is the part that goes wrong quietly.

## All three, not the one that was named

`sapsII` sits in the same file and loops `boundsAdvisory` over eleven variables;
`refeedingRisk` had nothing. Guarding only the BMI would have rebuilt the exact
shape [spec-v1101](spec-v1101.md) exists to find — half a function guarded,
looking finished. The loop covers every numeric input the function reads.

The rule that must not break holds: the check runs **after** the missing-value
branch, so a reader who left BMI blank is asked for BMI rather than told that the
value they did enter is out of range. A test asserts that ordering directly.

## Two live regions, two ranges

Guarding the library put a second sentence on the page, and the two did not
agree. The browser's own range warning reads the input's `min`/`max`
attributes, and this view carried the author's own sense of the range:

```
Check the highlighted value: BMI (kg/m^2) is 9999, outside the 5 to 80 this field accepts.
Input above the plausible range for body mass index (5 to 200 kg/m^2); verify the units.
```

Two numbers for one field, stacked, above the answer. [spec-v1198](spec-v1198.md)
already settled which one wins — a view's ceilings **are** `lib/bounds.js`'s — so
the three fields now read their attributes from the table rather than repeating
it. Verified in the browser: both sentences say *5 to 200*, and *0 to 400* for
the days field.

The general question — how many other views carry a hand-written ceiling
narrower than the envelope their own compute function reports — is not answered
here. It is the next thing to look at.

## Where this leaves the finder

**6 modules, 6 functions**, from 7 at [spec-v1206](spec-v1206.md). The count
fell by one because a row was fixed, not because the probe stopped looking.

What remains needs a `BOUNDS` entry that does not exist (`lundBrowder`,
`mrcSumScore`, `modifiedMarshall`, `rutherfordFontaine`) or is already guarded in
a way the probe cannot see (`urineOsmolalGap`, `nmr`).

## Proof

Lint (19 gates), 13,509 unit tests and 448 MCP tests pass. Four new tests cover
the flip, the envelope edge, the two ordinary directions, and the
missing-value-first ordering.
