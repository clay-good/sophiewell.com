# v11 audit - bristol-girth

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Lewis SJ, Heaton KW. *Stool form scale as a useful guide to intestinal transit time.* Scand J Gastroenterol. 1997;32(9):920-924. ANA *Standards of Gastroenterology Nursing Practice* 2013 for girth-trend interpretation; SCCM 2013 abdominal compartment syndrome consensus for the >=2 cm/h escalation banner.

`lib/scoring-v4.js bristolGirth()` accepts `{bristolType, girthT0Cm, girthT1Cm, t0Timestamp, t1Timestamp}` and returns `{bristolType, bristolLabel, category, girthDeltaCm, intervalHours, deltaPerHourCm, banners}`.

## Boundary examples added
- Bristol 1 -> constipation.
- Bristol 4 -> normal (ideal).
- Bristol 5 -> soft.
- Bristol 7 -> diarrhoea.
- Girth 100 -> 104 cm over 2 h -> 2 cm/h.
- Girth 100 -> 104 cm over 1 h -> 4 cm/h triggers SCCM 2013 ACS banner.
- Out-of-range Bristol type (0 / 8) throws.
- Without girth inputs deltaPerHourCm is null.

## Cross-implementation differential
- Reference: Lewis 1997 Table 1 (7-band typology); SCCM 2013 ACS thresholds.
- Sophie result: matches. PASS.

## Edge-input handling notes
- bristolType out of 1-7 throws.
- Girth inputs optional; missing -> deltaPerHourCm null.

## A11y / keyboard notes
- Select + four labeled inputs (number + datetime-local); aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
