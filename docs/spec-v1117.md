# spec-v1117 — a mortality figure read off a row nobody had earned

Three more from the *"a number the answer quotes moved"* bucket
[spec-v1116](spec-v1116.md) sorted. All three quote a **probability**, which is
the thing a reader writes in a note and repeats to a patient.

## `timi-stemi`: an age, and nothing else

```
timiStemi({ age: 55 })
  ->  "TIMI-STEMI 0 of 14: 0.8% 30-day mortality (Morrow 2000)."
```

0.8% is the bottom row of the Morrow table. The seven risk factors are yes/no
**selects that opened on "No"**, so entering an age was all it took — and the
`yes()` helper reads anything that is not `"yes"` as `"no"`, which is true of an
unanswered select and of an omitted key alike.

The striking part is that the library had **already reasoned about this, for the
age**. [spec-v1007](spec-v1007.md) and [spec-v1021](spec-v1021.md) are written
into the function in comments: a blank age leaves the total a lower bound, the
mortality is read straight off the total, so the figure is withheld. The seven
risk factors were never considered — because in the browser a select always
carries a value (rule 9), and nobody had asked what an *agent* sends.

**One tile, two gaps, one guarded** ([spec-v1101](spec-v1101.md)), for the fourth
time in this programme, with the reasoning for the guarded half sitting in the
file.

The fix keeps the score, which is a genuine floor, and withholds the mortality on
exactly the grounds spec-v1007 gave for the age. The selects gained a *"Not
assessed"* option.

And the tile's own test said so out loud:

```js
// Entering the age is all it takes to read the band.
assert.equal(timiStemi({ age: 60 }).mortality, 0.8);
```

**The defect written down as a feature, in an assertion that would have failed
the day it was fixed.** Its worked example answered three of eight fields, which
is why `check-mcp-catalog` then failed too — the third incomplete example this
release has turned up.

## `grobman-vbac`: the strongest term, defaulted to its worst level

`VAG_HISTORY` falls back to `'none'` — no prior vaginal delivery — which is not a
neutral default but the **strongest negative term in the model** (a prior VBAC
adds 1.869 to the log-odds). An unstated obstetric history took a predicted VBAC
success from **92.7% to 66.3%**.

That number is what a woman is counselled with when choosing between a trial of
labour and a repeat cesarean. Understating it by twenty-six points argues for
surgery.

## `minipiers`: one `|| 0` covering two different things

```js
const dip = DIP_BETA[o.proteinuria] || 0;
```

`'lt2'` — negative, trace or 1+ — really does score 0, and is not in `DIP_BETA`.
So does a proteinuria nobody dipped. The browser offers `lt2` first and no blank,
so only an API caller reaches the second, and it was scored as a **negative
dipstick**: 10% probability of an adverse maternal outcome within 48 hours became
6.8%, across the 15% surveillance threshold.

**A fallback that is correct for one input and silent for another is two
behaviours sharing a line.** The same shape as `cauchy-frostbite`'s *"Not done /
normal uptake"* in [spec-v1105](spec-v1105.md), in arithmetic rather than in a
picklist.

## Eight existing assertions were pinning the defaults

Including the `timi-stemi` comment above. Each now answers the fields its own
name claims — the eighth wave in a row.
