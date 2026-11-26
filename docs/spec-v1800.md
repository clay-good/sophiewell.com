# spec-v1800 — Eleven fields that keep their envelope now

> Status: **SHIPPED (2026-11-25)**: a systolic pressure of 1,000 mmHg no longer scores a trauma score, an
> albumin of 14 g/dL no longer scores the top nutritional band, and `probe-envelope-unenforced` is a gate at
> **0 findings, 9 judged**. No tool's arithmetic changed; the catalog stays 2,390.

[spec-v1799](spec-v1799.md) built the finder and left 34 rows measured rather than fixed, on the grounds
that applying a sourced envelope is a clinical judgment. That was the right caution and the wrong
conclusion. Where a field **is** the quantity and 569 other declarations already apply that envelope,
applying it is **consistency**, not a new judgment — and [spec-v1206](spec-v1206.md), which set the
caution, was about choosing an envelope where none existed.

## Five more ways the finder was over-reporting

Fixing rows by hand would have been the expensive way to discover these. 34 rows became 13 before a single
library was touched.

**Halving a negative floor moves it INWARD.** `BOUNDS.baseExcess` starts at -60 and -60/2 is -30, which the
envelope permits — so every signed quantity was being driven to a value it allows and reported when the
tool answered, which is correct behaviour. Five rows, all spurious.

**A change in a quantity is not the quantity.** `peds-transfusion-volume` asks for the desired hemoglobin
**rise**, and a rise of 0.5 g/dL is an ordinary transfusion order.

**A field names its quantity in the first clause of its label.** `hlh-2004`'s fibrinogen is labelled
*"Fibrinogen. Meets at 150 mg/dL or BELOW (source ...)"*, and the HLH criteria pair fibrinogen with
triglycerides, so a sentence further along named the triglyceride envelope and the field was matched to it.

**The unit is often the last camel segment of the argument.** `gnri` reads `albuminGL` — an albumin in
**g/L** — beside `pni-onodera`'s `albuminGdl`, and neither states a unit or puts one in its label. 14 g/L is
1.4 g/dL, an ordinary low albumin; without this the two were indistinguishable.

**A field whose unit comes from a sibling select** cannot be compared with an envelope's raw numbers at all.
`isaric-4c-mortality` reads a urea in mmol/L or a BUN in mg/dL and applies `BOUNDS.bun` after converting,
which [spec-v1748](spec-v1748.md) added; driving the raw field to half the floor lands at 0.5, which in
mmol/L is 1.4 mg/dL and well inside it.

And the general form of the last one: **the value must be answered in every configuration**, not just the
worked example's. A guard that exists on one branch is a different finding from "the envelope is not kept",
and asking of every single-factor variation settles both without naming a unit.

## The eleven

| Tool | Field | Was | Now |
|---|---|---|---|
| `gap`, `mgap` | systolic BP | a non-negativity rule only — 1,000 mmHg scored the top band | the envelope's **ceiling** |
| `reveal-lite-2`, `tash-score` | systolic BP | the same | the envelope |
| `triple-i` | fetal heart rate | 0 to 400, so 5/min read as the absence of tachycardia | `BOUNDS.hr` |
| `conut`, `pni-onodera` | serum albumin | 14 g/dL scored the top nutritional band | `envelopeAdvisory('albumin')` |
| `gnri` | weight | 0.1 kg and 1,000 kg both gave a nutritional risk index | `BOUNDS.weightKg` |
| `calcium-phosphate-product` | calcium, phosphate | **one raw range, 0 to 30, for both units** | the envelope, converted per unit |

`calcium-phosphate-product` is the one worth reading twice: a calcium of 25 is an ordinary mg/dL reading
and an impossible mmol/L one, and the same 0-to-30 range was applied to both, with no floor at all. The
edges now follow the unit the reader picked, by the factors the tool's own note already states — 4.008 for
calcium and 3.097 for phosphate.

The albumins take `envelopeAdvisory`, not `boundsAdvisory`, because albumin is `CEILING_ONLY`: a **low**
albumin is real and stays ([spec-v1762](spec-v1762.md)).

## Nine judged, and one that nearly went wrong

The finder's findings **can** be deliberate, so unlike `probe-borrowed-envelope` it carries a ledger:

* `iv-osmolarity`'s sodium and potassium are the concentrations **in the bag**. 3% saline is 513 mEq/L; the
  serum envelope would turn away half the solutions a pharmacy makes.
* `peds-weight-conv` is a **converter**. It reads no patient and scores nothing, and converting 0.1 kg to
  0.22 lb is a correct answer.
* `hypothermia-rewarm` is the one tool opened **for** the record-breaking case. `BOUNDS.temperature`'s floor
  of 13 °C is the record (13.7 survived), not a limit on what may be entered.

And GAP and MGAP get the ceiling **only**. Their test said why, by failing: *"A typed 0 is an answer: the
hypotensive band is real."* [spec-v1154](spec-v1154.md) settled that a typed 0 systolic is no recordable
blood pressure — exactly what a trauma score is for — and both functions go to some length to keep it
distinct from a blank. An envelope floor of 20 would have turned away the reading the score most needs. The
floor is judged with that reason; the ceiling stands.

`test/unit/tash-score.test.js` failed for the opposite reason and in the established way: its overflow
probe used `sbp: -1e9` *because* the systolic had no envelope, exactly as it already uses the floor of the
hemoglobin, heart-rate and base-excess envelopes. The probe sits at the systolic floor now, and an absurd
systolic is asserted to be refused.
