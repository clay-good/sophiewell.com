# v11 audit - Time-Based E/M Code Selector (2021) (`em-time`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: AMA CPT 2021 office/outpatient E/M time bands (CMS adopted; AMA-owned descriptors are not bundled). Time bands:
- New: 99202 (15-29 min), 99203 (30-44), 99204 (45-59), 99205 (60-74).
- Established: 99212 (10-19), 99213 (20-29), 99214 (30-39), 99215 (40-54).
- Prolonged service +99417 at 15-minute units beyond the highest tier.

`lib/coding-v5.js emTimeSelector()` implements the AMA 2021 time-band logic; returns code, minutes, encounterType, and prolongedUnits for the +99417 add-on if applicable.

## Boundary examples added
- low: encounter "new", total 15 -> 99202.
- mid (META example): new / 45 min -> 99204 (META expected: "Code 99204 (45 min, new patient; AMA 2021 bands)"). PASS.
- high (with prolonged): new / 90 min -> 99205 + 1 unit of 99417 (15 min beyond the 74-min top of the 99205 band lands in the 75-89 prolonged window).
- established: 25 min -> 99213.

## Cross-implementation differential
- Reference: AMA CPT 2021 E/M Office/Outpatient Time Tables (cited in the CMS Final Rule 2021 IPPS/OPPS implementation memos).
- Test case: META example. Sophie 99204 / reference 99204. Delta 0%. PASS.

## Edge-input handling notes
- Below the lowest band (e.g., new visit with <15 min): returns null code with a note.
- Above the highest band: chains into 99417 prolonged-service units.
- AMA descriptors are not bundled; the tile only references the code numbers and time ranges, which are factual statements about the AMA 2021 bands (not the descriptors themselves) — consistent with spec-v2 / spec-v8 AMA-license stance.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- One labelled select (encounter type) + one labelled number input (minutes). `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
