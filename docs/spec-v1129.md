# spec-v1129 — a subtype letter that decides whether the airway is involved

The last row on the finder's list that is a defect rather than a documented
exception.

## `mgfa`

```js
const sub = (input && input.subtype) === 'b' ? 'b' : 'a';
```

Every value that is not `'b'` — an unstated subtype included — became `'a'`. On
the MGFA classification of myasthenia gravis that letter is not a shade:

| | |
|---|---|
| **a** | limb / axial-predominant |
| **b** | **oropharyngeal / respiratory**-predominant |

`b` is the form that involves swallowing and breathing, and it is the reason the
classification carries the letter at all. An unstated subtype reported a Class IV
patient as **IVa** — limb-predominant — with nothing said.

The severity is already `required`, so this is one line of surface, and the guard
is scoped to the readings the letter can move (rule 25): **Class I** (ocular) and
**Class V** (intubation) carry no subtype and are untouched. Classes II, III and
IV wait for it:

> MGFA Class IV, subtype not stated — severe generalized weakness. The subtype is
> needed: a is limb/axial-predominant and b is oropharyngeal/respiratory-predominant,
> and **it is not a default**.

The select opened on `a`, so it now opens on *"Not stated"* (rule 8, rule 22).

## The rest of the list, and why it is closed

Twenty-one fields across thirteen tiles remain on
`scoring-select-probe`'s narrowed list. **None is a defect**, and each was read
rather than assumed:

| | |
|---|---|
| `predicted-spirometry` | the ethnicity fallback is deliberate and surfaced ([spec-v1116](spec-v1116.md)) |
| `mascc` | **reverse-scored** — a lower score is worse, so an omission moves it toward the alarming side and "low risk" at 21 is a genuine floor |
| `mehran-cin` | refuses exactly where the missing value could change the band, and answers where it cannot ([spec-v1121](spec-v1121.md)) |
| `startback` | guarded at both boundaries the point can cross; this row sits at neither ([spec-v1124](spec-v1124.md)) |
| `elapss`, `phases`, `hear` | the quoted risk figure is band-derived and does not move; the score displayed beside it does |

The last row is the one I would flag if this continued: three tiles print a score
whose displayed value is a floor while the figure a reader takes away is
unchanged. It is the mildest form of [spec-v1114](spec-v1114.md)'s rule and the
honest place to stop, recorded rather than left implied.

## What closing the list took

`scoring-select-probe` opened with **52 fields across 27 tiles**
([spec-v1118](spec-v1118.md)). Eleven waves later it is 21 across 13, and every
one of those is read and written down.

Roughly half the original rows were never defects — tiles that already disclosed,
in words the probe could not match. **A prioritiser's value is the order, not the
count**, and the count only became meaningful once each row had a sentence next
to it.
