# v11 audit - restraint-timer

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Centers for Medicare & Medicaid Services. *Hospital Conditions of Participation: Patients' Rights - Use of Restraint or Seclusion.* 42 CFR sec 482.13(e); Hospital CoP Interpretive Guidelines (Appendix A, Tag A-0178 through A-0214). Violent / self-destructive: physician-order renewal q4h adult / q2h age 9-17 / q1h <9; physician or LIP face-to-face within 1 h; nursing reassessment cadence per institution (commonly q15 min). Non-violent medical-surgical: order renewed each calendar day.

`lib/scoring-v4.js restraintTimer()` accepts `{type, ageYears, orderTimestamp}` and returns `{type, ageYears, orderIso, nextRenewalIso, nextReassessIso, nextFaceToFaceIso, banners}`.

## Boundary examples added
- Violent age 40, order 12:00Z -> renewal 16:00Z, reassess 12:15Z, face-to-face 13:00Z.
- Violent age 12 -> renewal +2 h.
- Violent age 6 -> renewal +1 h.
- Non-violent age 70 -> renewal +24 h; no face-to-face.

## Cross-implementation differential
- Reference: 42 CFR sec 482.13(e) and Tag A-0178 through A-0214 interpretive guidance.
- Sophie result: matches each age band's renewal cadence and the 1 h face-to-face. PASS.

## Edge-input handling notes
- Unknown type throws.
- Missing orderTimestamp throws.

## A11y / keyboard notes
- Select + number + datetime-local; all labeled; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
