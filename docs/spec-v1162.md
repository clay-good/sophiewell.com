# spec-v1162 — a creatinine clearance of zero, beside two normal eGFRs

`one-blank-field-probe.spec.js` reports every reading that MOVES when one field is
cleared. Most of its 43 rows are tiles behaving correctly — *"Scored from 6 of 7
items; the rest can only raise it"*, *"not assessed"*, *"albumin not entered"*. Two
were not.

## `egfr-suite`

Three equations on one page, and **the weight belongs only to Cockcroft-Gault** —
CKD-EPI and MDRD never read it. `unitNum` is `Number('')` for a blank, so:

```
CKD-EPI 2021 (race-free): 86.2 mL/min/1.73m²
MDRD (race-free):         76.2 mL/min/1.73m²
Cockcroft-Gault:           0.0 mL/min
```

**A creatinine clearance of zero is anuric renal failure**, printed for a patient
nobody had weighed, directly beneath two normal eGFRs. The row asks for the weight
now, and names why only it needs one.

## `iv-osmolarity`

The empty-bag case was already guarded (*"Enter at least one component"*), and each
component is genuinely optional — a bag can be dextrose only. But **each one omitted
lowers the estimate**, and the verdict is where the line goes:

```
dextrose 5%, amino acids 2.5%, sodium 30, potassium 20
  600 mOsm/L — below ~900; peripheral administration is generally acceptable

the same bag with the sodium left out
  540 mOsm/L — below ~900; peripheral administration is generally acceptable
```

Both read as peripheral, and nothing on screen distinguished a described bag from a
partly-described one. The reading names what it counted now, and marks the estimate
*"(at least)"* with what is missing:

> Not entered: sodium — each would only raise the estimate, so a peripheral reading
> cannot stand on a bag that has not been fully described.

That is the [spec-v1133](spec-v1133.md) model: the assumption is visible where the
verdict is.

## What the other 41 rows were

Worth recording, because a probe that reports movement is not a probe that reports
defects, and the difference is most of its output:

| | |
| --- | --- |
| tiles disclosing correctly | `hscore-hlh`, `lrinec`, `wat-1`, `glasgow-imrie`, `truelove-witts`, `membranous-risk`, `triple-i`, `cancer-cachexia`, `mchat-rf`, `modified-marshall`, `acromegaly-biochem` — each says what it did not have |
| two calculators on one page | `corrected-ca-na`, `shock-index`, `aa-pf-suite`, `anion-gap` — the other half keeps answering, correctly |
| readings that rule IN and stand | `aortic-regurgitation-stage` (C2 on the ejection fraction), `carboxyhemoglobin`, `sea-guideline` |
| read and decided in earlier waves | `peds-weight-conv` ([spec-v1143](spec-v1143.md)), `hunt-hess-wfns` ([spec-v1130](spec-v1130.md)) |

Two left to read another time: `tls-cairo-bishop`, which reports an unmeasured
potassium as *"not met"* rather than unmeasured, and `mtp-tracker`, where a blank
platelet count becomes *"0 units transfused"* in a massive transfusion protocol.
