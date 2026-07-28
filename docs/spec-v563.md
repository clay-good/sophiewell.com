# spec-v563.md — Mayo imaging classification of ADPKD tile

> Status: **SHIPPED (2026-07-28).** Builds the `mayo-adpkd` tile. Catalog **1412 → 1413**, group G.

## Why

`adpkd` was zero-hit, and `grep -c "id: 'mayo-adpkd-imaging'" app.js` returned 0.

## What it does

**Two steps, and only the second is arithmetic.**

1. A radiologist classifies the **morphology**: class 1 (typical) or class 2A/2B (atypical).
2. **Class 1 only** is then subclassified from height-adjusted total kidney volume and age:

```
rate (%/yr) = 100 × ( (htTKV / 150)^(1/age) − 1 )
htTKV = total kidney volume (mL, both kidneys) ÷ height (m)
```

| Subclass | Estimated yearly growth |
| --- | --- |
| 1A | below 1.5% |
| 1B | 1.5 to under 3% |
| 1C | 3 to under 4.5% |
| 1D | 4.5 to 6% inclusive |
| 1E | above 6% |

## The four rules a plausible implementation breaks

**1. Class 2 is a terminal dead end.** Atypical patients receive **no** 1A-1E subclass — the classification
explicitly does not risk-stratify them. Handed an atypical patient's numbers, the formula will happily run,
and the answer would be a class the instrument refuses to give. Worse: because atypical disease is often
asymmetric or segmental, the computed figure tends to look falsely **reassuring**. The lib returns
`subclassified: false` and stops.

**2. The morphology class is a descriptor, not a computed input.** Nothing in the volume, height or age
determines it. Required, never inferred.

**3. Age sits in a denominator inside an exponent, and the model is not validated below 15.** The published
cut-off table starts at 15, and the reciprocal exponent makes the estimate increasingly unstable as age
falls. The lib refuses below 15 rather than returning a confident-looking number from the unvalidated,
numerically unstable end of the model.

**4. K = 150 is the published model; K = 130 is a rival parameterization, not a correction.** A later
proposal substitutes 130; an independent validation found it tended to *overestimate* the class. It is named
so a reader meeting it in the literature knows which model this implements — neither silently adopted nor
silently ignored (spec-v97).

## Two smaller disclosures

**Boundary convention.** The published bands adjoin at 1.5, 3 and 4.5, so each is lower-inclusive and
upper-exclusive here — except the last pair, which follows the printed text: 4.5-6 inclusive is 1D, strictly
above 6 is 1E.

**Measurement method.** The ellipsoid equation (π/6 × L × W × D) overestimated stereologic volume by a mean
of ~5.3% with wide spread — enough to move a patient a whole subclass. The method is recorded as an input,
though it does not enter the arithmetic.

## Scope (spec-v11 §5.3)

An imaging-based risk stratification built **to select patients for clinical trials**. It does **not**
diagnose ADPKD, which rests on imaging criteria by age together with family history, or on genetic testing.
It does **not** measure kidney function — a patient can sit in a high subclass with a completely normal eGFR.
It does not decide treatment and is not by itself an indication for a vasopressin receptor antagonist, which
carries its own eligibility and monitoring requirements. It does not apply to atypical morphology, other
cystic kidney diseases, or below the validated age.

## Files

- `lib/mayo-adpkd-v563.js` — `mayoAdpkd()`, `MORPHOLOGY_CLASSES`, `TKV_METHODS`,
  `THEORETICAL_START_HTTKV`, `ALTERNATIVE_K`, `MIN_VALIDATED_AGE`.
- `views/group-v563.js` (RV563) — morphology first under its own **h2**, since it gates everything else.
- `mcp/adapters/mayo-adpkd-v563.js` — wave 388.
- `test/unit/mayo-adpkd.test.js` — 19 tests.
- `docs/spec-v563.md` (this file).

## Sourcing (spec-v97)

- Irazabal MV, Rangel LJ, Bergstralh EJ, et al. Imaging classification of autosomal dominant polycystic
  kidney disease. *J Am Soc Nephrol.* 2015;26(1):160-172.
- Park HC, et al. Mayo imaging classification is a good predictor of rapid progress among Korean ADPKD
  patients. *Kidney Res Clin Pract.* 2022;41(4):432-441 — restates the equation and every band boundary.
