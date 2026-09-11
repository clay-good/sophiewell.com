# spec-v1237 — the probe this programme's own waves refilled

`scripts/probe-unguarded-sibling.mjs` asks, within one library module, whether
one exported function refuses an impossible measurement while a sibling reading
the same kind of number does not. Its premise:

> A module is written by one hand at one sitting. When one of its functions calls
> a guard helper and its neighbours do not, that is almost never a considered
> difference — it is the half somebody was fixing at the time.

It was **drained to zero at [spec-v1210](spec-v1210.md)**. Thirteen waves,
[spec-v1224](spec-v1224.md) to [spec-v1236](spec-v1236.md), put **14 modules and
22 functions** back into it — by guarding exactly the functions the envelope
probe named, and their siblings not at all. The premise held: it was the half
somebody was fixing at the time, and that somebody was this programme.

## Three were never unguarded — the probe was

`fornsIndex`, `lokIndex` and `nafldFibrosis` compare against the table
**directly**:

```js
if (plt > BOUNDS.platelets.max) return { valid: false, message: `A platelet count
  of ${plt} is above ~${BOUNDS.platelets.max}, beyond recorded extremes. This
  field is in x10^9/L (the same as x10^3/uL), so a lab report reading ${plt}/uL
  is entered as ${plt / 1000}.` };
```

That is a better guard than any helper call — it reads the same table, refuses
the same values, and explains the ×1000 unit confusion it exists for. The probe
watched six helper **names**, and the question is *does this function refuse an
impossible measurement*, which a direct comparison answers too. **The same drift
its own `GUARDS` comment warns about, one level up.**

It now counts `BOUNDS.<key>.max`/`.min` as a guard, and that change was
negative-tested: removing `fornsIndex`'s comparison puts it back in "does not",
restoring it moves it back.

## Four were real

| tile | what it now refuses |
| --- | --- |
| `toronto-hcc-risk` | platelets and age — its sibling `galadHcc` got this in spec-v1236; its own platelet cap was 3000 against the table's 2000 |
| `bard-score` | BMI — every item is a threshold comparison (`BMI >= 28`) |
| `fatty-liver-index` | BMI |
| `salicylate-toxicity` | nothing new: it bounded pH with the **literals** 6.5 and 8, which are `BOUNDS.pH`'s own two ends written a second time. One rule written twice drifts; the table is the copy with the source note on it |

## The rest have no envelope, and four now say so

A row here is a **suspect**. Eleven modules remain, and each is a function whose
numbers the table does not name in that field's unit. Four would most likely be
"fixed" wrongly by a future reader, so they carry the reason in the code — *a
false flag invites a fix to a correct tile*:

| function | why there is no envelope |
| --- | --- |
| `iomGwg` | weight in **pounds**, height in **inches**; `BOUNDS.weightKg` is kg and `BOUNDS.heightM` is metres |
| `calvertCarboplatin` | an **absolute** GFR in mL/min; `BOUNDS.eGFR` is an **indexed** estimate per 1.73 m² |
| `vasograde` | both inputs are **graded scales** (modified Fisher 0–4, WFNS 1–5) and the reads already bound each to its own; a scale's range *is* the envelope |
| `lipi` | the unit is **unstated by design** — its message asks for both counts in "same units", whichever those are |

`lipi` turned up something while being written down, and it is recorded rather
than fixed here: the message promises any consistent unit and the code caps both
counts at 1000, which in practice admits only the ×10⁹/L convention and refuses
an ordinary per-µL result. That mismatch is real and is its own change.

## The fifth test asserting an impossible input

`fatty-liver-index`'s overflow probe drove `bmi: 1e9`. Same treatment as the four
before it ([spec-v1234](spec-v1234.md)): every other predictor stays at `1e9`,
the BMI moves to 200 — the top of its envelope — and the test now also asserts
that `1e9` is refused.

## Ledger

`probe-unguarded-sibling`: **14 modules / 22 functions → 11 / 15**, all fifteen
triaged. `probe-envelope-unbounded`: first section stays at **0**; second section
**11 → 10**.
