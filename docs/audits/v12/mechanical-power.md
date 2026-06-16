# v12 audit - mechanical-power

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Gattinoni L, Tonetti T, Cressoni M, et al. Intensive Care Med. 2016;42(10):1567-1575. Higher-risk threshold: Serpa Neto A, et al. Intensive Care Med. 2018;44(11):1914-1922.

`lib/hemodynamics-v87.js mechanicalPower()` computes the Gattinoni simplified mechanical power of ventilation, MP (J/min) = 0.098 · RR · Vt(L) · (Ppeak − ½·(Pplat − PEEP)), with the driving pressure (Pplat − PEEP) shown as an intermediate and the 0.098 cmH₂O·L → joule constant documented. The > 17 J/min higher-ventilator-induced-lung-injury-risk flag is quoted from Serpa Neto 2018. The 17 J/min value is surfaced as an association, not a target (spec-v11 §5.3).

## Boundary worked examples added
- RR 22, Vt 420, Pplat 26, PEEP 12, Ppeak 32 -> driving pressure 14, MP 22.6 J/min, highRisk true (over 17).
- RR 12, Vt 400, Pplat 20, PEEP 8, Ppeak 24 -> driving pressure 12, MP 8.5 J/min, highRisk false (at or below 17).
- RR 24, Vt 450, Pplat 28, PEEP 10, Ppeak 34 -> ~24 J/min, highRisk true (the threshold flip).
- Any missing ventilator value -> valid:false, surfaced "enter ...", no NaN.

## Cross-implementation differential
- Reference: hand computation of the Gattinoni simplified equation. 0.098·22·0.42·25 = 22.638 -> 22.6 J/min; 0.098·12·0.40·18 = 8.467 -> 8.5 J/min. Sophie matches both exactly. PASS.

## Edge-input handling notes
- RR, Vt, Pplat, PEEP, Ppeak coerced with fin()/pos(); RR and Vt must be strictly positive, the three pressures finite. A negative driving pressure (Pplat < PEEP) yields a finite (possibly negative) power, never NaN/Infinity (spec-v59 fuzz harness covers the module, zero leaks).

## A11y / keyboard notes
- Five labeled numeric inputs, each with a real `<label for>`; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
