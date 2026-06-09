# v11 audit - Enoxaparin Dose (weight & renal) (`vte-prophylaxis-dose`)

- Auditor: CG
- Date: 2026-06-09
- Citation re-verified against: Enoxaparin (Lovenox) US prescribing information (renal adjustment at CrCl <30 mL/min); Gould MK, et al. Prevention of VTE in Nonorthopedic Surgical Patients. Chest. 2012;141(2 Suppl):e227S-e277S. spec-v62 §3.2.

## Boundary examples added
- prophylaxis, normal renal: 40 mg q24h; CrCl <30 -> 30 mg q24h (renal flag).
- treatment q12h, 80 kg: 80 mg q12h (1 mg/kg); treatment daily, 80 kg: 120 mg q24h (1.5 mg/kg).
- treatment, 80 kg, CrCl <30: 80 mg q24h (1 mg/kg q24h renal reduction, flagged).

## Cross-implementation differential
- Reference: hand calculation against the Lovenox label regimens. 80 x 1 = 80 mg; 80 x 1.5 = 120 mg; renal path forces 1 mg/kg q24h. Sophie matches exactly. PASS.

## Edge-input handling notes
- `weightKg` bounded `[0.3, 500]`, `crcl` `[0, 300]`. An unrecognized indication returns `null` -> the renderer prints a guidance note (no NaN). Zero weight throws RangeError; NaN/'' throw TypeError (caught by `safe()`). Renders the explicit "planning estimate, verify per protocol; anti-Xa monitoring on obesity/renal edges" notice. PASS.

## A11y / keyboard notes
- Two labeled numeric inputs plus two labeled `<select>`s, Tab order = source order; `aria-live="polite"` output. `npm run test:a11y` clean. PASS.

## Defects opened
- none

## Status
- PASS
