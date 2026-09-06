# spec-v1089 — which zero is the reader looking at?

First off [spec-v1088](spec-v1088.md)'s list of seventeen, and it is not the
defect that list said it was.

## What the probe saw, and what was actually wrong

`scripts/probe-omitted-item.mjs` flagged `pim3|pim-be`: drop the base excess and
the predicted mortality moves, with nothing saying so. The "show your work" panel
printed

> `|Base excess| (0)`

which reads as a base excess that was drawn and came back at zero.

The arithmetic, though, is **correct and deliberate**. PIM3 enters an unmeasured
variable as zero — the convention the library already recorded in its own comment
on the FiO2/PaO2 term:

```js
// FiO2*100/PaO2 only contributes when both are provided (ventilated gas exchange);
// otherwise the term is 0 per the model's "not measured -> 0" convention.
```

The model is built for routine intensive-care data where these are often not
taken. A base excess nobody drew contributing 0 is the instrument working as
designed, not a blank read as a number.

**The defect was the label.** `|Base excess| (0)` is also exactly what a
*measured* base excess of 0 prints — and 0 is a normal base excess. Two different
clinical states, one line of output, no way to tell them apart.

## The fix changes no arithmetic

An unentered variable now says so, and the reading says what it was computed
without:

```
not entered   |Base excess| (not entered, so 0)
              PIM3 predicted probability of death: 1.36% (logit = -4.28).
              Computed without base excess and FiO2 and PaO2: this model enters
              an unmeasured variable as zero, so the figure stands, but it is
              not the same as those values being measured and zero.

measured 0    |Base excess| (0)
              PIM3 predicted probability of death: 1.68% (logit = -4.07).
```

Pinned by asserting the two produce the **same** term value and the **same**
logit, and differ only in what the reader is told. A test that let the number
move would be testing the wrong thing.

The worked example does not carry FiO2 or PaO2, so it now shows the disclosure —
kept deliberately, because operating on incomplete routine data is what this
model is for, and the sentence teaches the convention to a reader who would
otherwise have to know it already. Its documented figure is unchanged at 13.04%.

## What this says about the backlog

spec-v1088 called `pim3` "the clearest of the seventeen". It was the clearest
*signal*, and the diagnosis behind it was wrong: this was never a tile reading a
blank as a zero. It was a tile that could not say which zero it meant.

That is worth carrying into the other sixteen. The probe answers one question —
*did the answer move without the tile saying so?* — and a yes has at least three
causes:

1. the tile read a gap as a value (the defect this programme is named for);
2. the tile applied a **documented convention** and did not name it (this one);
3. the tile said so in wording the shared vocabulary does not carry (34 of the
   91, already separated out in spec-v1088).

Only the first is arithmetic. The second and third are the tile failing to
explain itself, and the fix is words rather than a guard.
