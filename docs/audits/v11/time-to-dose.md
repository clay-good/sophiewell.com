# v11 audit - Time-to-Next-Dose Helper (`time-to-dose`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Plain time arithmetic. Frequency abbreviations per standard pharmacy nomenclature: q4h=4h, q6h=6h, q8h=8h, q12h=12h, qd=24h, bid=12h, tid=8h, qid=6h. These mappings are unchanged in current ASHP / USP nomenclature references.

## Boundary examples added
- META example: 14:00 q6h -> 20:00, 02:00, 08:00, 14:00 (four doses, wrapping past midnight). Hand: 14+6=20, 20+6=26→02, 02+6=08, 08+6=14. PASS.
- low: 00:00 q4h -> 04:00, 08:00, 12:00, 16:00. PASS.
- high (wrap edge): 23:30 q12h -> 11:30 (next day), 23:30, 11:30, 23:30. Hand: (23·60+30+12·60·1)%(24·60) = 11:30. PASS.
- qd (daily): 09:00 qd -> 09:00, 09:00, 09:00, 09:00 (next four daily doses; same clock time each day). PASS — modular arithmetic correctly returns identical times.
- bid: 08:00 bid (12-hourly) -> 20:00, 08:00, 20:00, 08:00. PASS.

## Cross-implementation differential
- Reference implementation: hand-computed modular minute arithmetic. The renderer computes `total = h·60 + mi + step·60·i` then `(total % (24·60))` to wrap.
- All cases above match hand computation to the minute. PASS.

## Edge-input handling notes
- Invalid time format (not `HH:MM`) shows "Enter time as HH:MM (24-hour)." muted line; renderer returns early.
- Out-of-range hour (>23) or minute (>59) shows "Invalid time."; renderer returns early.
- Frequency `<select>` is constrained to the eight known abbreviations.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Two labelled inputs (time + frequency select); result is `<h2>` heading + `<ol>` of next four doses. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
