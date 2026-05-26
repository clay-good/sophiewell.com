# v48 derivation provenance — HEMORR2HAGES (`hemorr2hages`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4g
- Citation re-verified against: Gage BF, Yan Y, Milligan PE, Waterman AD, Culverhouse R, Rich MW, Radford MJ. *Clinical classification schemes for predicting hemorrhage: results from the National Registry of Atrial Fibrillation (NRAF).* Am Heart J. 2006;151(3):713-719.

## Components — verbatim source mapping

Eleven criteria, each +1 except Rebleeding (+2). Range 0-12. The mnemonic HEMORR2HAGES tracks the +2 weight on "Rebleeding" (the "R2").

| # | Criterion | Points |
|---|---|---|
| 1 | Hepatic or Renal disease | +1 |
| 2 | Ethanol abuse | +1 |
| 3 | Malignancy history | +1 |
| 4 | Older (age > 75) | +1 |
| 5 | Reduced platelet count or function (incl. aspirin) | +1 |
| 6 | Rebleeding (any prior bleed) | +2 |
| 7 | Hypertension uncontrolled (SBP > 160) | +1 |
| 8 | Anemia (Hb < 13 men / < 12 women) | +1 |
| 9 | Genetic factors (CYP2C9 SNPs) | +1 |
| 10 | Excessive fall risk | +1 |
| 11 | Stroke history | +1 |

## Bands — source mapping (Gage 2006 Table 3, bleeds per 100 patient-years on warfarin)

| Score | Rate |
|---|---|
| 0 | 1.9 |
| 1 | 2.5 |
| 2 | 5.3 |
| 3 | 8.4 |
| 4 | 10.4 |
| >= 5 | 12.3 |

## Population

Gage 2006: 3791 Medicare beneficiaries with atrial fibrillation enrolled in the National Registry of Atrial Fibrillation (NRAF) on warfarin; major-bleed rates from Table 3 observed during warfarin anticoagulation.

## Validity

Adults with non-valvular AF on warfarin. The genetic-factors item requires CYP2C9 genotyping (uncommon in routine practice). HEMORR2HAGES was superseded for routine use by HAS-BLED (Pisters 2010) and ORBIT (O'Brien 2015); the AHA/ACC/HRS 2019 focused update favors ORBIT or HAS-BLED. A high HEMORR2HAGES is a flag for *modifiable* bleeding risk (BP control, alcohol counseling) — NOT a reason to withhold anticoagulation if CHA2DS2-VASc indicates it.

## Source quote

"HEMORR2HAGES classification scheme ... was derived from previously validated bleeding-prediction schemes ... and includes 11 weighted variables." — Gage 2006 §Methods.

## Renderer assertions

Verified locally:
- `META.hemorr2hages.derivation` has every required field per `lib/derivation.js validate()` and exactly 11 components.
- Components sum equals `hemorr2hages().score` at multiple boundary points including the +2 Rebleeding weight (rebleeding alone -> 2).

## Defects opened
None.
