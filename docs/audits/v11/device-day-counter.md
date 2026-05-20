# v11 audit - device-day-counter

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Centers for Disease Control and Prevention. *2024 National Healthcare Safety Network (NHSN) Patient Safety Component Manual* (Ch 7 CAUTI, Ch 4 CLABSI). Lo E, Nicolle LE, Coffin SE, et al. *Strategies to prevent catheter-associated urinary tract infections in acute care hospitals: 2014 update.* Infect Control Hosp Epidemiol. 2014;35(5):464-479. Daily-removal criteria for Foley: acute retention/obstruction; accurate I/O critically ill; peri-op surgical indication; end-of-life comfort; hourly UO required.

`lib/scoring-v4.js deviceDayCounter()` accepts `{device, insertionTimestamp, criteriaMet, asOf}` and returns `{device, insertionIso, deviceDays, deviceHours, criteriaMet, removeToday, banners}`.

## Boundary examples added
- Foley, 4 days since insertion, no criteria checked -> remove-today banner.
- Central line, same -> CLABSI-phrased remove-today banner.
- Foley with one criterion checked -> no remove-today banner.
- 4 d 6 h interval -> deviceDays=4, deviceHours=6.
- Day-2+ adds re-verify-daily banner.

## Cross-implementation differential
- Reference: CDC NHSN 2024 device-day definition (calendar-day count); SHEA 2014 CAUTI indication list.
- Sophie result: matches. PASS.

## Edge-input handling notes
- Unknown device throws.
- Missing insertion timestamp throws.

## A11y / keyboard notes
- Select + datetime-local + five labeled checkboxes inside a fieldset; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
