# v11 audit - Predicted Body Weight + ARDSnet Tidal Volume (`pbw-ardsnet`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: ARDS Network. *Ventilation with lower tidal volumes as compared with traditional tidal volumes for acute lung injury and the acute respiratory distress syndrome.* N Engl J Med. 2000;342(18):1301-1308. ARDSnet PBW formulas (height-based, derived from Devine 1974):
- M PBW = 50 + 0.91 * (height_cm - 152.4) (equivalent to Devine's `50 + 2.3*(in - 60)`).
- F PBW = 45.5 + 0.91 * (height_cm - 152.4).
- Target Vt = 6 mL/kg PBW (range 4-8 mL/kg PBW per protocol).

`lib/clinical-v5.js pbwArdsnet()` implements verbatim. Sex-specific base + 0.91 cm scaling.

## Boundary examples added
- short F (150 cm): PBW 45.5 + 0.91*(150-152.4) = 45.5 - 2.18 = 43.3 kg; target Vt at 6 mL/kg ~260 mL; range 173-347.
- mid (META example, M 175 cm, 6 mL/kg): PBW 50 + 0.91*(175-152.4) = 50 + 20.6 = 70.5 kg; target Vt = 6*70.5 = 423 mL; range 282-564. PASS — matches META exactly.
- tall M (190 cm): PBW 50 + 0.91*(190-152.4) = 50 + 34.2 = 84.2 kg; target Vt 505 mL; range 337-674.
- short M (152.4 cm, baseline): PBW 50 kg exactly; target Vt 300 mL.

## Cross-implementation differential
- Reference: ARMA trial PBW worksheet (NEJM 2000 supplement); cross-checked against the publicly-documented MDCalc ARDSnet calculator.
- Test case: META example. Sophie 70.5 / 423 / 282-564; reference 70.5 / 423 / 282-564. Delta 0%. PASS.

## Edge-input handling notes
- The renderer accepts metric height (cm) per the ARMA convention; users with imperial heights can convert via the `unit-converter` tile.
- Target Vt is configurable via the `mlkg` input (default 6 per the ARDSnet protocol); some institutions allow up to 8 mL/kg in patients who do not meet ARDS criteria. Sophie reports the 4-8 range alongside the target so the user sees the safe band even if they set the target higher.
- The tile reports the warning if mlPerKg is outside 4-8 (live tile rendering reports a `warning` field if present); this is reference behavior, not Sophie-authored treatment guidance — the 4-8 range is the source ARDSnet protocol.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Three labelled inputs (height_cm, sex select, target mL/kg). `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
