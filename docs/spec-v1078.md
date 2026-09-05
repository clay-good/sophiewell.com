# spec-v1078 — the scale that gates thrombolysis, at zero

[spec-v1047](spec-v1047.md) fixed WAT-1 by changing its control:

> A slider cannot be blank — it sits at its minimum and looks exactly like a
> rating somebody made — so no amount of null checking in the library could have
> fixed it.

The two stroke scales kept theirs. Read off the live page, every item cleared:

| Tile | Control | What an unexamined patient produced |
|---|---|---|
| `wat-1` | 11 number inputs | *"WAT-1 is at least 0 from 0 of 10 items … Rate the remaining 11"* |
| **`nihss`** | **13 sliders** | **"NIHSS total: 0 (No stroke symptoms)"** |
| **`mnihss`** | **11 sliders** | **"mNIHSS 0 of 31: no stroke symptoms per Meyer 2002."** |

The NIH Stroke Scale is the number in the thrombolysis and thrombectomy
conversation. "No stroke symptoms" is the most consequential reassurance in the
catalog, and a form nobody had touched produced it.

## The guard existed and never ran

`lib/clinical.js` has carried this since [spec-v1007](spec-v1007.md):

```js
// An unexamined patient is not a patient without stroke symptoms, and a caller
// that sent no items at all used to be told "No stroke symptoms".
if (!complete && total === 0) severity = `Not scored: ${…} items unscored — …`;
```

It is correct, and it could not fire. `complete` is `scored === 13`, and a
slider **always sends a value**, so the exam always looked complete. The library
had been right about this for seventy specs while the page said the opposite.

`mnihss` did not even have the guard: `Number(answers[it.id] || 0)` collapsed
absent and zero before anything could tell them apart.

## The fix

Both scales now render `scoredItemField` — a number input with a `0`
placeholder, the control WAT-1 took in spec-v1047 and CIWA-Ar and COWS in
spec-v1028 — and read it with `nvOrNull`. `mnihss` gains the `itemsScored` /
`itemsTotal` / `complete` reporting and the spec-v1007 guard its sibling had.

Neither refuses more than it should. Every item adds points or leaves them
alone, so a partial total is a **lower bound**: every band above zero stays true
and states its footing, and exactly one reading is unsupportable.

Measured on the page, all four states:

| | `nihss` |
|---|---|
| opens on its example | `NIHSS total: 5 (Moderate stroke)` |
| every item cleared | `Not scored: 13 of 13 items unscored -- an unscored exam is not a normal exam.` |
| all 13 rated normal | `NIHSS total: 0 (No stroke symptoms)` |
| 9 of 11 rated, deficit found (`mnihss`) | `mNIHSS 2 of 31: minor stroke … Scored from 9 of 11 items; each unrated item can only raise the total, so treat this as a floor.` |

The third row is the one that keeps the fix honest: a **genuinely normal exam
still reads as normal**. Refusing that would have been a different defect.

## Two things the fix dragged in

**The refusal was printing the number it withholds.** `NIHSS total: 0 (Not
scored: 13 of 13 …)` puts a total of nought in front of a sentence explaining
there is no total. With nothing rated, both tiles now print the refusal alone.

**A test asserted the defect.** `test/unit/mnihss.test.js` opened with

```js
test('mnihss 0 (tile example) -> no stroke symptoms', () => {
  const r = mnihss({});
  assert.equal(r.severity, 'no stroke symptoms');
});
```

which was *true of the tile as built*: with sliders, an untouched form really did
send eleven zeros, so "the tile example" really was an all-zero exam. The test
was describing the control, not the contract. It is replaced by three that
separate the states, and the comment says why it changed.

**And the worked example only rated 4 of 13 items**, so once `nihss` started
being honest it opened on "treat this as a floor". A worked example should show a
conducted exam: all thirteen are now rated, the nine normal ones as 0. The total
is unchanged at 5.

## One ledger line, and why it is not a step backwards

Changing the control put both scales into two whole-catalog sweeps they had never
been in: those sweeps only touch text and number inputs, and until now these
tiles had neither. `required-field-agreement` caught `mnihss` immediately, which
is the gate doing its job on my own change.

With one item cleared, the browser now says

> mNIHSS 11 of 31: moderate stroke per Meyer 2002. Scored from 10 of 11 items;
> each unrated item can only raise the total, so treat this as a floor.

while the agent surface returns `MISSING_INPUT`, because
[spec-v1073](spec-v1073.md) declared all eleven items `required`. That was the
only safe call at the time: the library still read an unrated item as a zero, so
refusing was the only thing that could not mislead. It now tells absent from zero
and states its footing, so **answering is the better behaviour** — a partial
total that has already found deficit is a valid floor.

`mnihss` therefore joins `required-field-ledger.js` in the category-3 group,
directly above `wat-1`, which arrived there by exactly this route in spec-v1047:
sliders forced a strict declaration, the control changed, and the strictness
outlived its reason on one surface. The declaration stays strict for callers who
cannot see a form.

## The lesson

> **A guard in the library is only as good as the control that feeds it.** The
> right refusal was written, reviewed and shipped seventy specs ago, and the
> input widget quietly made it unreachable. When a fix depends on a value being
> absent, check that the form can express absence.
