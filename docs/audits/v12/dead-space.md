# v12 audit - dead-space

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Enghoff modification of the Bohr equation; Nuckton TJ, Alonso JA, Kallet RH, et al. N Engl J Med. 2002;346(17):1281-1287.

`lib/hemodynamics-v87.js deadSpace()` computes the Bohr-Enghoff physiologic dead-space fraction, Vd/Vt = (PaCO₂ − PĒCO₂) / PaCO₂. The > 0.6 elevated-fraction flag (independent ARDS mortality risk) is quoted from Nuckton 2002. When the user selects the end-tidal EtCO₂ source instead of mixed-expired PĒCO₂, the output labels the estimate as an underestimating surrogate. A PĒCO₂ ≥ PaCO₂ (entry/measurement error) yields a non-positive fraction; the tile reports the computed value and flags the implausible input rather than silently clamping (mirrors the signed-gap handling in toxic-alcohol, spec-v86 §3).

## Boundary worked examples added
- PaCO₂ 60, PĒCO₂ 20 -> Vd/Vt 0.67 (67%), elevated (over 0.6).
- PaCO₂ 40, EtCO₂ 28 (surrogate) -> Vd/Vt 0.30 (30%), not elevated; note labels the EtCO₂ form as an underestimate.
- PaCO₂ 30, expired 35 (>= PaCO₂) -> Vd/Vt −0.17, implausible flag raised, not clamped.
- Missing PaCO₂ or PaCO₂ ≤ 0 -> valid:false, surfaced "enter ...", no NaN.

## Cross-implementation differential
- Reference: hand computation of the Enghoff form. (60−20)/60 = 0.667 -> 0.67; (40−28)/40 = 0.30. Sophie matches exactly. PASS.

## Edge-input handling notes
- PaCO₂ coerced with pos() (must be strictly positive); expired CO₂ with fin(). The division is guarded by a positive PaCO₂, so no non-finite value reaches a returned string (spec-v59 fuzz harness covers the module, zero leaks).

## A11y / keyboard notes
- One labeled numeric input, one labeled select (expired-CO₂ source), one labeled numeric input; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
