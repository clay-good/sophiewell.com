# spec-v1799 — An envelope the library does not keep

> Status: **SHIPPED (2026-11-25)**: the question "which quantity is this field?" has one answer in one
> place, with a test; a new finder asks whether a tool answers outside its own quantity's envelope and
> reports **34 of 996**; and six per-kilogram dosing tools stop answering a weight of 0.1 kg. No tool's
> arithmetic changed; the catalog stays 2,390.

`lib/bounds.js` is a promise. Each envelope is a range outside which a value "usually means the unit is
wrong" or is "beyond recorded extremes", with a note and a source behind it. 569 declarations name an
envelope because the library behind them applies it. This spec is about the fields that do not.

[spec-v1796](spec-v1796.md) found three of them sideways: `peds-transfusion-volume` reads a weight in
kilograms and guards it 0 to 500 with a `num()` literal of its own, where `BOUNDS.weightKg` is **0.2** to
500 — so the tool answered a weight of 50 grams. They were noticed only because their declarations were
being rewritten for another reason.

## One matcher, one place

Asking the question directly means deciding, of every number field, which envelope it **is**. That decision
already existed, inside `probe-borrowed-envelope`, where it had been wrong four times before it was right.
A second finder needing it would have had to learn each lesson again from its own absurd answers, so it is
now `scripts/lib/quantity-name.mjs` with `test/unit/quantity-name.test.js` holding it to the fields that
taught it — the same reason [spec-v1794](spec-v1794.md) hoisted the range-sentence list.

Writing the second finder promptly found five more rules the first had never been asked for:

| Rule | What it was matching |
|---|---|
| A key word of **two letters** is not evidence | `hr` matched the **denominator** of every rate — a urine output in mL/kg/hr, an infusion in mL/hr |
| A **body** quantity is not the same quantity measured off the body | `BOUNDS.temperature` is 13 to 47 °C because it is a *body* temperature; `wbgt` reads a globe temperature of 6.5 °C and `wind-chill` an air temperature |
| A **reference limit, score or constant** is not a measurement | `apri` and `hys-law` read an AST or ALT **upper limit of normal** (about 40, not an AST); `cac-agatston` reads a calcium **score**; `ddi-basic-screen` reads a Ki |
| **The unit is often in the label** | "Birth weight (g)", "Weight in pounds", "Unplanned weight loss (%)" — `unit` was unset on all three, so the unit check saw nothing and passed |
| A **short unit** must match exactly | `"kg".includes("g")` let `snappe-ii`'s birth weight **in grams** match the kilogram envelope |

Those five took the report from 94 rows to 34 without a single library change — which is the point of
writing them down rather than judging 60 rows by hand.

## The six

`BOUNDS.weightKg`'s own note says what is at stake: *a value below ~0.2 kg usually means the unit (g/lb vs
kg) is wrong.* Six tools took the envelope's **ceiling** and left the floor open, so a weight of 0.1 kg was
dosed per kilogram and answered:

| Tool | What it does with the weight |
|---|---|
| `conc-rate` | a pump rate from a mcg/kg/min order |
| `pediatric-administered-activity` | a radiopharmaceutical activity for a child |
| `auth-units-request` | billing units for a mg/kg biologic |
| `epinephrine-device-weight-band` | which auto-injector a label states at that weight |
| `otc-child-label-dose` | an over-the-counter dose from a label's weight band |
| `digoxin-label-dose` | a digoxin loading dose from lean body weight |

`conc-rate` is the clearest: it wrote `num('weightKg', weightKg, { min: 0, max: BOUNDS.weightKg.max })` —
the ceiling from the envelope, the floor zero. All six now take **both** edges from the envelope, and the
three that read pounds or kilograms take the floor in the unit the reader picked (0.2 kg is 0.44 lb).
`test/unit/weight-envelope-floor.test.js` drives each at half the floor and at the floor itself, so the
floor is a floor and not a wider cap.

## What the 34 are

The finder is hand-run, with a judged ledger ready and empty, and it is honest about its reach: a field
that states **no unit anywhere** cannot be excluded on units, so `who-growth-zscore`'s "Measured value (kg
or cm)" and `iv-osmolarity`'s potassium **in a bag** are over-reports it cannot yet tell from the real
thing. The rest group cleanly, and each is a value a sourced envelope calls implausible that a tool still
answers:

| Group | Rows |
|---|---|
| a systolic pressure of 1,000 or 10 mmHg (`gap`, `mgap`, `tash-score`, `reveal-lite-2`) | 8 |
| an albumin of 14 g/dL (`conut`, `gnri`, `pni-onodera`) | 3 |
| a base excess or deficit past -60 (`pim3`, `tash-score`, `big`) | 3 |
| a urea, calcium, phosphate, sodium or bilirubin past its envelope | 9 |
| the rest, one tool each | 11 |

They are left measured rather than fixed, because each is a clinical judgment about applying a sourced
envelope to a field that is that quantity, and [spec-v1206](spec-v1206.md) settled that such a choice
belongs with its source rather than with a wave.
