# v48 derivation provenance — Revised Cardiac Risk Index (`rcri`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4d
- Citation re-verified against: Lee TH, Marcantonio ER, Mangione CM, Thomas EJ, Polanczyk CA, Cook EF, Sugarbaker DJ, Donaldson MC, Poss R, Ho KK, Ludwig LE, Pedan A, Goldman L. *Derivation and prospective validation of a simple index for prediction of cardiac risk of major noncardiac surgery.* Circulation. 1999;100(10):1043-1049.

## Components — verbatim source mapping

Six yes/no risk factors, each +1; total 0-6 per Lee 1999 Table 2 (final model).

| # | Risk factor | Points |
|---|---|---|
| 1 | High-risk surgery (suprainguinal vascular, intraperitoneal, or intrathoracic) | +1 |
| 2 | History of ischemic heart disease | +1 |
| 3 | History of congestive heart failure | +1 |
| 4 | History of cerebrovascular disease (TIA or CVA) | +1 |
| 5 | Insulin-dependent diabetes mellitus | +1 |
| 6 | Preoperative serum creatinine > 2.0 mg/dL | +1 |

## Bands — source mapping (Lee 1999 Table 3)

| Range (factors) | Class | Major cardiac event risk |
|---|---|---|
| 0 | Class I (very low) | ~0.4% |
| 1 | Class II (low) | ~0.9% |
| 2 | Class III (moderate) | ~6.6% |
| ≥ 3 | Class IV (high) | ≥ 11% |

Major adverse cardiac event = MI, pulmonary edema, ventricular fibrillation, cardiac arrest, or complete heart block during the index hospitalization.

## Population

Lee 1999: derivation in 2893 adults ≥ 50 years undergoing elective major noncardiac surgery at a single Boston tertiary center; prospective validation in a separate 1422-patient cohort. Excluded emergency surgery.

## Validity

Adults ≥ 50 years undergoing *elective* major noncardiac surgery. RCRI is the most-studied preoperative cardiac risk index but underestimates risk in vascular surgery cohorts; the NSQIP MICA and ACS-NSQIP universal calculators outperform RCRI in modern external validation, particularly for non-cardiac vascular procedures. RCRI does not include functional capacity, frailty, or biomarkers (BNP, troponin); current ACC/AHA preoperative guidance treats RCRI as one input among several. Not validated for emergency surgery.

## Source quote

"In stepwise logistic regression, six independent predictors of complications were identified ... A simple index based on the presence of these six factors performed well at predicting major cardiac complications." — Lee 1999 §Results.

## Renderer assertions

Verified locally:
- `META.rcri.derivation` has every required field per `lib/derivation.js validate()` and exactly 6 components.
- Components sum equals `rcri().count` at three boundary points (Class I 0, Class III 2, Class IV all-6).

## Defects opened
None.
