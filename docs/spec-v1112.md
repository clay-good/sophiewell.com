# spec-v1112 — the last two, and a prediction that was half wrong

The [spec-v1108](spec-v1108.md) ledger is **empty**. Thirteen instruments, four
waves.

[spec-v1111](spec-v1111.md) said the last two were *"the two that are NOT this
shape"*. That was a prediction made from the ledger rather than from the code,
and it was **half wrong** — which is the more useful outcome, because it shows
what the prediction was worth.

## `hfa-peff` was the same shape

```js
const fp = hasOwnProperty(HFAPEFF_DOMAIN, String(functional)) ? HFAPEFF_DOMAIN[String(functional)] : 0;
```

Exactly the fallback of the previous four waves, and `0` is the HFA-PEFF's *no
criterion met*. Three unassessed domains answered **"HFA-PEFF 0/6: HFpEF
unlikely"** — a diagnosis excluded without an echo, a biomarker or a functional
assessment.

Domain points are non-negative, so the total is a floor. *Confirmed* (≥ 5) rules
in from a subset (rule 13). **Both** other verdicts wait, including
*indeterminate* — it is a safe next step, but it is still the claim that five
points were not reached, and an unassessed domain can carry two.

## `mdq` was genuinely different, and I got it wrong the first time

The MDQ is three AND-gates: ≥ 7 of 13 symptoms, co-occurring, causing moderate or
serious impairment. The first draft of this fix guarded only the impairment, on
this reasoning:

> the other two are answered by controls that carry a real "no" — the thirteen
> symptom items and the co-occurrence question are checkboxes, so none ticked is
> a genuine "no symptoms endorsed" (rule 4)

**They are not checkboxes.** `views/group-v22.js` renders all fourteen as yes/no
`<select>`s, and the list opened on `No`. So the tile opened reading
**"Negative screen: 0 of 13 symptoms YES"** — a bipolar screener declaring a
negative before anyone had read a question — and the draft fix would have left
that exactly as it was.

The gate caught it. `rated-items-are-required` still flagged `mdq` after the
first fix, which is what sent me to the renderer.

**Rule 4 is about a control that is a genuine binary, not about a value that
happens to be `no`.** A select whose first option is one of its two answers is
answering for the reader — rule 8 — and the two rules were pointing in opposite
directions on the same field. What settles it is the control, and the control is
in a file the library never sees.

The fix, once the shape was right:

- The symptom gate is **monotone** — an unanswered item can only add a YES — so a
  negative on it is earned only when `yesCount + unanswered < 7`. Seven answered
  NO settles it; six does not.
- A gate that was **not answered has not been failed**. Where every answered gate
  passes and an unanswered one is all that stands between, the tile says so
  rather than calling the screen negative.
- Where an answered gate genuinely fails, the negative screen stands unchanged.

The `Screen` row on the page reads `not yet answered` rather than `negative` in
that state, because "negative" is a verdict.

## What the ledger was worth

Thirteen instruments. **Ten were one defect** — a lookup whose miss-value is the
table's most favourable level. Three were not, and each of those three needed the
instrument read rather than the pattern applied:

| | |
|---|---|
| `ces-d` | reverse-scored items, so a partial score is a **range**, not a floor |
| `bars-akathisia` | the verdict is one item, so there is no floor to disclose |
| `mdq` | three AND-gates, and the controls decide what a blank means |

[spec-v1109](spec-v1109.md) warned that the fastest way to be wrong about the
remainder was to assume the pattern held. It was right, and spec-v1111's
prediction about these two is the demonstration: **a ledger sorted by shape tells
you the order to read in, not what you will find.**
