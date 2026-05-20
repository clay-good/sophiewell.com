# v11 audit - sepsis-bundle-clock

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Evans L, Rhodes A, Alhazzani W, et al. *Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021.* Intensive Care Med. 2021;47(11):1181-1247. CMS SEP-1 measure (2024 specifications). Nguyen HB, Rivers EP, Knoblich BP, et al. *Early lactate clearance is associated with improved outcome in severe sepsis and septic shock.* Crit Care Med. 2004;32(8):1637-1642. Hour-1 elements: lactate, cultures before antibiotics, broad-spectrum antibiotics, 30 mL/kg crystalloid; repeat lactate within 6 h if initial >=2 mmol/L.

`lib/scoring-v4.js sepsisBundleClock()` accepts `{t0, lactateValue, lactateTime, repeatLactateValue, repeatLactateTime, cultureTime, antibioticTime, fluidStartTime, vasoTime}` and returns `{t0Iso, items, lactateClearancePct, banners}`.

## Boundary examples added
- All hour-1 elements at 30-45 min -> all on-time.
- Antibiotic at 90 min -> late.
- Lactate 4 -> 2 -> clearance 50%.
- Initial lactate >=4 -> 30 mL/kg banner.
- Lactate clearance 5% -> sub-target banner per Nguyen 2004.
- Empty inputs -> all six items pending.

## Cross-implementation differential
- Reference: SSC 2021 hour-1 bundle and CMS SEP-1 2024.
- Sophie result: each element transitions on-time -> late at 60 min (or 180 min for fluids); lactate-clearance formula matches Nguyen 2004 ((initial - repeat) / initial). PASS.

## Edge-input handling notes
- Missing t0 throws.
- Optional timestamps left blank -> element status pending; no false-late flag.

## A11y / keyboard notes
- 9 labeled inputs (datetime-local + number); aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
