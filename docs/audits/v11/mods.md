# v11 audit - mods

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Marshall JC, Cook DJ, Christou NV, Bernard GR, Sprung CL, Sibbald WJ. *Multiple Organ Dysfunction Score: a reliable descriptor of a complex clinical outcome.* Crit Care Med. 1995;23(10):1638-1652. Six organ-system variables each scored 0-4 per Table 1; sum 0-24; ICU mortality bands per Table 4 (0: 0%; 1-4: 1-2%; 5-8: 3-5%; 9-12: ~25%; 13-16: ~50%; 17-20: ~75%; 21-24: ~100%).

`lib/scoring-v4.js mods()` scores each organ system per Marshall 1995 Table 1, sums to 0-24, and returns the Marshall 1995 Table 4 mortality band. Per-organ subscores are also surfaced so a bedside clinician can see which system is dragging the score (Marshall 1995 §Methods notes that the per-organ trajectory is the primary clinical value of the score).

The cardiovascular component uses PAR = HR x CVP / MAP. Marshall 1995 derived PAR with right atrial pressure (RAP) rather than CVP, but the two are interchangeable in current practice for a patient with a CVC and no tricuspid pathology. The view labels the calculation explicitly so the user supplies the right number.

## Boundary examples added
- all-normal (tile example): PaO2/FiO2 350, Cr 1.0, bili 1.0, PAR 8, plt 200, GCS 15 -> 0 of 24; ICU mortality 0%.
- first-non-zero per variable: P/F 280, Cr 1.5, bili 2.0, PAR 12, plt 100, GCS 14 -> 6 of 24 (3-5% band) with every subscore = 1.
- moderate dysfunction (every subscore = 2): P/F 200, Cr 3.0, bili 5.0, PAR 18, plt 70, GCS 11 -> 12 of 24 (~25% band).
- severe (every subscore = 3): P/F 100, Cr 5.0, bili 10.0, PAR 25, plt 30, GCS 8 -> 18 of 24 (~75% band).
- maximum (every subscore = 4): P/F 50, Cr 6.0, bili 20, PAR 40, plt 10, GCS 5 -> 24 of 24 (~100% band).
- respiratory threshold: P/F 75 falls into the worst respiratory band (PaO2/FiO2 <=75 -> 4) per Marshall 1995 Table 1.
- renal threshold: Cr 1.1 mg/dL stays in the 0-band per Marshall 1995 Table 1 (Cr <=100 umol/L = <=1.13 mg/dL; Sophie uses the rounded clinical threshold 1.1).

## Cross-implementation differential
- Reference: hand-summed against Marshall 1995 Table 1 thresholds.
- Test case: P/F 200, Cr 3.0, bili 5.0, PAR 18, plt 70, GCS 11.
- Sophie result: 12 of 24 (each subscore = 2).
- Reference: same. PASS.

## Edge-input handling notes
- Six numeric inputs; non-finite or missing values default the per-organ subscore to 0 (most-normal) so an unrecorded variable does not silently spike the total.
- Creatinine thresholds are in mg/dL; the audit doc surfaces the Marshall 1995 umol/L source.
- The cardiovascular component uses PAR = HR x CVP / MAP; the view labels this explicitly so a user does not paste a raw heart rate.

## A11y / keyboard notes
- Six labeled numeric inputs; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
