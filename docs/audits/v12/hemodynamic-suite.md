# v12 audit - hemodynamic-suite

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Swan HJC, Ganz W, Forrester J, et al. N Engl J Med. 1970;283(9):447-451. PVR/Wood-unit threshold: 2022 ESC/ERS pulmonary hypertension guideline (Humbert M, et al. Eur Heart J. 2022;43(38):3618-3731).

`lib/hemodynamics-v87.js hemodynamicSuite()` computes the cardiac indices and vascular resistances from an entered cardiac output and the pulmonary-artery-catheter pressures. CI = CO/BSA; SV = CO/HR × 1000; SVI = SV/BSA; SVR = 80·(MAP−CVP)/CO; SVRI = SVR·BSA; PVR = 80·(mPAP−PCWP)/CO (dynes) and (mPAP−PCWP)/CO (Wood units); PVRI = PVR·BSA. The ×80 factor (mmHg/(L/min) → dynes·s·cm⁻⁵) is shown. Each output is computed only when its inputs are present; CO ≤ 0 or blank returns a surfaced `valid:false` fallback, never Infinity. Normal-range flags (low/normal/high) are quoted from the cited ranges; the PVR flag uses the ESC/ERS 2022 > 2 Wood-unit threshold. No shock-type adjudication and no management order are authored in Sophie's voice (spec-v11 §5.3).

## Boundary worked examples added
- CO 5, HR 80, BSA 2, MAP 90, CVP 5, mPAP 20, PCWP 10 -> CI 2.5 (normal), SV 62.5 (normal), SVI 31.3 (low), SVR 1360 (high), SVRI 2720, PVR 2 Wood units (normal) / 160 dynes, PVRI 320.
- Cardiogenic-shock pattern (CO 2.8, HR 110, BSA 1.9, MAP 65, CVP 14, mPAP 35, PCWP 24) -> CI 1.47 (low), SV 25.5 (low), SVR 1457 (high), PVR 3.93 Wood units (high).
- CO 0 / CO blank -> valid:false, surfaced "enter a cardiac output > 0", no Infinity.
- Partial inputs (CO 6, HR 60, no BSA/pressures) -> SV 100 only; CI/SVR/PVR null; no false flags.

## Cross-implementation differential
- Reference: a hand-computed textbook worked example for each of CI, SV, SVI, SVR, SVRI, PVR (both dynes and Wood units), and PVRI. Sophie reproduces every value exactly (well within 0.5%). PASS.

## Edge-input handling notes
- Every numeric field is coerced with fin()/pos(); NaN/Infinity/''/undefined/null become "not provided". Every division is guarded by a strictly-positive denominator (pos()), so no non-finite value reaches a returned string (spec-v59 fuzz harness covers lib/hemodynamics-v87.js, zero leaks).

## A11y / keyboard notes
- Seven labeled numeric inputs, each with a real `<label for>`; output aria-live="polite"; copy-results row. 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
