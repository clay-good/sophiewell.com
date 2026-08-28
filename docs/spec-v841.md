# spec-v841 — Diabetes and Prediabetes Diagnostic Criteria

## What this gives you

Enter whichever tests you have; get diabetes, prediabetes, or "meets a threshold but is not
yet confirmed".

The catalog had `ada-diabetes-risk-test`, `findrisc` and `cambridge-diabetes-risk` — tools
that estimate *risk*. Nothing applied the criteria that make the diagnosis.

## §1 The thresholds

| | Prediabetes | Diabetes |
|---|---|---|
| A1C | 5.7–6.4% | ≥6.5% |
| Fasting plasma glucose | 100–125 mg/dL | ≥126 mg/dL |
| 2-h glucose, 75 g OGTT | 140–199 mg/dL | ≥200 mg/dL |
| Random plasma glucose | — | ≥200 mg/dL, **only with classic symptoms** |

## §2 Confirmation is part of the definition

*"In the absence of unequivocal hyperglycemia, diagnosis requires two abnormal results from
different tests which may be obtained at the same time (e.g., A1C and FPG), or the same test
at two different time points."*

**One abnormal result is not a diagnosis** — and this is the part most often skipped. A single
raised A1C returns *meets a diabetes threshold, not yet confirmed*, with the rule quoted. Two
different tests at once, or the same test repeated, close it.

## §3 The random-glucose route has two halves, and both matter

**Without classic symptoms it is not a diagnostic route at all** — a random glucose of 260 on
its own contributes nothing, and the tile says so rather than counting it.

**With them, no confirmation is needed**, because that is the unequivocal hyperglycemia the
Standards except from confirmatory testing.

## §4 Two tests that can be uninterpretable, and are then set aside

**A1C** is altered by anything that changes red cell turnover — anemia, iron status,
splenectomy, blood loss, transfusion, hemolysis, G6PD deficiency, erythropoietin — and by HIV,
cirrhosis, renal failure, dialysis, pregnancy and hemoglobin variants. Where one applies, the
tile **removes the A1C from the calculation** and says why, rather than quietly diagnosing off
an uninterpretable number.

**The OGTT** needs a mixed eating pattern with **≥150 g carbohydrate daily for 3 days**
beforehand. Antecedent carbohydrate restriction distorts it, is common, and is rarely asked
about — so it too sets the value aside.

## §5 Sourcing (spec-v97 gate)

- American Diabetes Association Professional Practice Committee. 2. Diagnosis and
  Classification of Diabetes: Standards of Care in Diabetes-2025. *Diabetes Care.*
  2025;48(Supplement_1):S27-S49 — thresholds, the confirmation rule and the A1C-confounder
  list taken from the chapter's own text and tables.

## §6 Posture

Decision support, not a verdict. It interprets results already obtained. It does not start or
adjust any treatment.

Catalog 1632 → 1633.
