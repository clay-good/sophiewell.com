# v11 audit - Rapid Shallow Breathing Index (RSBI) (`rsbi`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Yang KL, Tobin MJ. *A prospective study of indexes predicting the outcome of trials of weaning from mechanical ventilation.* N Engl J Med. 1991;324(21):1445-1450. RSBI = respiratory rate (breaths/min) / tidal volume (L). Threshold: RSBI < 105 predicts likely successful spontaneous-breathing trial.

`lib/clinical-v5.js rsbi()` implements `RR / (Vt_mL / 1000)` (i.e. RR / Vt_L) rounded to one decimal, with the <105 interpretation string.

## Boundary examples added
- low (deep / strong spontaneous effort): RR 12, Vt 500 mL -> RSBI 24; "Likely to tolerate weaning (< 105)".
- mid (META example): RR 24, Vt 350 mL -> 24 / 0.35 = 68.57 -> 68.6; "Likely to tolerate weaning (< 105)". PASS.
- borderline (just at threshold): RR 25, Vt 240 mL -> 104.2; still likely.
- high (failing): RR 35, Vt 250 mL -> 140; "Not likely to tolerate weaning (>= 105)".

## Cross-implementation differential
- Reference: Yang-Tobin 1991 hand-computation; cross-checked against MDCalc RSBI.
- Test case: META example. Sophie 68.6 / Likely; reference 68.57 -> 68.6 / Likely. Delta 0%. PASS.

## Edge-input handling notes
- The Yang-Tobin original is measured during a one-minute T-piece spontaneous-breathing trial, not on mechanical-ventilation support. Sophie reports the raw index without re-asserting the measurement context — the citation copy notes the measurement requirement so the user does not apply the threshold to a ventilated patient.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Two labelled inputs (RR, Vt_mL). `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
